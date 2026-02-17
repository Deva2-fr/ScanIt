import logging
from datetime import datetime
from sqlmodel import Session
from asgiref.sync import async_to_sync

from app.core.celery_app import celery_app
from app.database import engine
from app.models.task import ScanTask, AuditStatus
from app.services.scanner import process_url

logger = logging.getLogger(__name__)

@celery_app.task(acks_late=True)
def process_scan_task(task_id: str, url: str, lang: str):
    """
    Celery task for scan processing.
    Updates the task status in DB.
    """
    logger.info(f"Starting Celery scan for task {task_id}")
    
    # Create a new session for this background task
    with Session(engine) as session:
        task = session.get(ScanTask, task_id)
        if not task:
            logger.error(f"Task {task_id} not found")
            return

        task.status = AuditStatus.RUNNING
        session.add(task)
        session.commit()
        
        try:
            # Run the heavy scan (Async)
            # Wrap async call with async_to_sync since Celery workers are sync by default
            result = async_to_sync(process_url)(url, lang)
            
            # Save result
            task.result = result.model_dump(mode='json')
            task.status = AuditStatus.COMPLETED
            task.finished_at = datetime.utcnow()
            logger.info(f"Task {task_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Task {task_id} failed: {e}")
            task.error = str(e)
            task.status = AuditStatus.FAILED
        
        session.add(task)
        session.commit()
