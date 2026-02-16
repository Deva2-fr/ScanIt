
import logging
from sqlmodel import Session, select
from app.db.session import engine
from app.models.task import ScanTask
from app.models.schemas import AuditStatus

logger = logging.getLogger(__name__)

class TaskRecoveryService:
    @staticmethod
    def recover_stuck_tasks():
        """
        Finds tasks that were left in RUNNING or PENDING state due to a server crash/restart.
        Marks them as FAILED.
        """
        logger.info("🛠️ Task Recovery: Checking for interrupted tasks...")
        
        try:
            with Session(engine) as session:
                statement = select(ScanTask).where(
                    (ScanTask.status == AuditStatus.RUNNING) | 
                    (ScanTask.status == AuditStatus.PENDING)
                )
                stuck_tasks = session.exec(statement).all()
                
                count = 0
                for task in stuck_tasks:
                    logger.warning(f"⚠️ Recovering stuck task {task.id} (Status: {task.status})")
                    task.status = AuditStatus.FAILED
                    task.error = "Scan interrupted by server restart/update. Please try again."
                    session.add(task)
                    count += 1
                
                if count > 0:
                    session.commit()
                    logger.info(f"✅ Task Recovery: Marked {count} stuck tasks as FAILED.")
                else:
                    logger.info("✅ Task Recovery: No stuck tasks found.")
                    
        except Exception as e:
            logger.error(f"❌ Task Recovery Failed: {e}")
