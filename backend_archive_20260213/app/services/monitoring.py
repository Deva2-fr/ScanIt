"""
Monitoring Service
Handles the scheduling and execution of URL monitoring tasks.
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlmodel import Session, select
from ..database import engine
from ..models.monitor import Monitor
from ..models.user import User
from ..models.audit import Audit
from .scanner import process_url
from .mailer import send_alert_email
from .image_diff import compare_images
from .screenshots import save_screenshot, get_screenshot_path
import hashlib
import logging
import json
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Initialize Scheduler
scheduler = AsyncIOScheduler()

async def check_monitors():
    """
    Scheduled job to check all active monitors based on their frequency.
    Runs hourly and checks if enough time has passed since the last check.
    """
    logger.info("🕒 Watchdog: Starting scheduled monitor checks...")
    
    with Session(engine) as session:
        # Calculate thresholds
        now = datetime.utcnow()
        day_ago = now - timedelta(days=1)
        # For testing, we might want shorter period, but let's stick to spec
        week_ago = now - timedelta(days=7)
        
        # Select active monitors
        statement = select(Monitor).where(Monitor.is_active == True)
        all_monitors = session.exec(statement).all()
        
        current_hour = now.hour # 0-23
        
        monitors_to_check = []
        for monitor in all_monitors:
            # Time-window logic
            # We want to run close to the preferred hour.
            # Since this job runs hourly, we check if current_hour == monitor.check_hour
            
            # Simple Logic:
            # 1. If never checked, run immediately.
            # 2. If Checked recently (within frequency), skip to avoid double run.
            # 3. If "Due" date passed, and current hour matches preference (or we are way overdue), run.
            
            is_due = False
            last_check = monitor.last_checked_at
            
            if not last_check:
                # Never checked -> Run immediately regardless of hour
                is_due = True
            else:
                # Calculate next expected run date based on frequency
                delta = timedelta(days=1) if monitor.frequency == "daily" else timedelta(days=7)
                next_run_date = last_check + delta
                
                # If we are past the next run date
                if now >= next_run_date:
                    # Check Day constraint for Weekly
                    day_ok = True
                    if monitor.frequency == "weekly" and monitor.check_day is not None:
                         # Python weekday: 0=Mon, 6=Sun
                         if now.weekday() != monitor.check_day:
                             day_ok = False
                             # optimization: wait until that day comes
                    
                    if day_ok:
                        # And either:
                        # a) It is the correct hour
                        # b) We are late by more than 3 hours (catch-up mechanism)
                        if now.hour == monitor.check_hour or (now - next_run_date) > timedelta(hours=3):
                            is_due = True
                
            if is_due:
                monitors_to_check.append(monitor)

        logger.info(f"🕒 Watchdog: Found {len(monitors_to_check)} monitors due for check.")
        
        for monitor in monitors_to_check:
            try:
                logger.info(f"🔍 Watchdog: Scanning {monitor.url}...")
                
                # Process URL (Async)
                # Note: this is a heavy task, in production we might offload to Celery
                # But for now we await it (APScheduler runs in event loop so it's non-blocking for other requests, 
                # but might block other jobs if not careful. Analyzing URL takes time).
                response, screenshot_bytes = await process_url(monitor.url)
                current_score = int(response.global_score) or 0
                
                # Logic: Compare Scores (Delta Check)
                alert_needed = False
                visual_alert_needed = False
                diff_result = {}
                
                old_score = monitor.last_score
                
                # --- Visual Regression Check ---
                current_screenshot_path = None
                if screenshot_bytes:
                    # Generate hash for site to structure storage
                    site_hash = hashlib.md5(monitor.url.encode()).hexdigest()
                    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
                    
                    # Save current check
                    current_screenshot_path = save_screenshot(screenshot_bytes, monitor.user_id, site_hash, timestamp)
                    
                    # If we have a previous screenshot, compare!
                    if monitor.last_screenshot_path:
                        try:
                            # Resolve absolute paths
                            abs_old = get_screenshot_path(monitor.last_screenshot_path)
                            abs_new = get_screenshot_path(current_screenshot_path)
                            
                            # Define diff output path
                            diff_filename = f"diff_{timestamp}.jpg"
                            diff_rel_path = f"static/screenshots/{monitor.user_id}/{site_hash}/{diff_filename}"
                            abs_diff = get_screenshot_path(diff_rel_path)
                            
                            # Run comparison
                            diff_result = compare_images(abs_old, abs_new, abs_diff)
                            
                            if diff_result.get("percentage", 0) > 5.0:
                                logger.warning(f"🎨 Watchdog: Visual Regression Detected! ({diff_result['percentage']}%)")
                                visual_alert_needed = True
                                
                        except Exception as e:
                            logger.error(f"Visual comparison failed: {e}")
                
                # --- Score Drop Check ---
                # We only alert if there was a previous score
                if old_score is not None:
                    drop = old_score - current_score
                    # Threshold check: Si diff >= monitor.alert_threshold
                    if drop >= monitor.alert_threshold:
                        logger.warning(f"📉 Watchdog: Critical Drop for {monitor.url} ({old_score} -> {current_score}, drop={drop})")
                        alert_needed = True
                    else:
                        logger.info(f"✅ Watchdog: Score stable for {monitor.url} ({old_score} -> {current_score})")
                else:
                    logger.info(f"🆕 Watchdog: First scan for {monitor.url} score={current_score}")

                
                if alert_needed or visual_alert_needed:
                    # Get User email to notify
                    user = session.get(User, monitor.user_id)
                    if user and user.email:
                        # Make report link (assuming standard structure)
                        # We don't have the exact ID here unless we saveAudit first, 
                        # but we can link to dashboard or history.
                        report_link = f"https://siteauditor.com/dashboard/history" 
                        
                        subject = "🚨 Alert: Site Issue Detected"
                        if visual_alert_needed:
                             subject = f"🎨 Alert: Visual Change ({diff_result.get('percentage')}%) on {monitor.url}"
                        elif alert_needed:
                             subject = f"📉 Alert: Score Drop on {monitor.url}"
                             
                        await send_alert_email(
                            to_email=user.email,
                            url=monitor.url,
                            old_score=old_score if old_score else 0,
                            new_score=current_score,
                            report_link=report_link
                        )
                
                # Save to History (Audit Table)
                # This ensures the user sees the curve in their dashboard
                # Enrich response with screenshot info if available (for the detail view)
                if current_screenshot_path:
                    response.screenshot_path = current_screenshot_path
                
                if diff_result and diff_result.get("percentage", 0) > 0:
                     response.visual_diff = {
                         "difference_percentage": diff_result.get("percentage"),
                         "diff_image_path": diff_result.get("diff_path"), # This is absolute path, we might need relative
                         "has_changed": True
                     }
                     # Fix path to relative for Frontend
                     # diff_path stored by image_diff might be absolute if passed absolute
                     # But we constructed it using get_screenshot_path? No, we constructed it as absolute?
                     # We need to make sure we store relative path in JSON.
                     if "diff_path" in diff_result and diff_result["diff_path"]:
                         # Convert absolute to relative static/...
                         # Hacky check
                         if "static" in diff_result["diff_path"]:
                             # Extract from static
                             import os
                             # Standardize separators
                             p = diff_result["diff_path"].replace("\\", "/")
                             if "/static/" in p:
                                 response.visual_diff["diff_image_path"] = "static/" + p.split("/static/")[1]
                    
                new_audit = Audit(
                    user_id=monitor.user_id,
                    url=monitor.url,
                    score=current_score,
                    summary=json.dumps(response.model_dump(mode='json')),
                    created_at=datetime.utcnow()
                )
                session.add(new_audit)

                # Update Monitor State
                monitor.last_score = current_score
                monitor.last_checked_at = datetime.utcnow()
                if current_screenshot_path:
                    monitor.last_screenshot_path = current_screenshot_path
                    
                session.add(monitor)
                
                session.commit()
                # Refresh not strictly needed unless we use it again
                
            except Exception as e:
                logger.error(f"❌ Watchdog Error on {monitor.url}: {e}")
                session.rollback()

def start_scheduler():
    """Start the APScheduler"""
    # Run every hour to check for due monitors
    # For testing purposes, we can invoke it immediately or keep it cron
    if not scheduler.running:
        scheduler.add_job(check_monitors, CronTrigger(minute=0)) 
        scheduler.start()
        logger.info("✅ Watchdog: Scheduler started (Runs every hour)")

def shutdown_scheduler():
    """Shutdown the APScheduler"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("🛑 Watchdog: Scheduler stopped")
