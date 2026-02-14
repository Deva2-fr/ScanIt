from datetime import date
from app.models.user import User
from app.core.plans import PLANS

class FeatureGuard:
    
    @staticmethod
    def get_plan_config(plan: str):
        return PLANS.get(plan, PLANS["starter"])

    @staticmethod
    def can_perform_action(user: User, action: str) -> bool:
        """
        Check if user has permission for a specific feature.
        (e.g., 'pdf_export', 'whitelabel', 'api_access')
        """
        # If subscription is strictly inactive (false), fallback to simplest plan or block?
        # For this mock, we assume inactive => starter (free) features usually, 
        # or we might want to just check the flag.
        # However, user requests 'subscription_active' default True.
        
        user_plan = user.plan_tier or "starter"
        config = FeatureGuard.get_plan_config(user_plan)
        features = config.get("features", [])
        
        return action in features

    @staticmethod
    def check_scan_quota(user: User) -> bool:
        """
        Check if user can run a scan today using scans_count_today.
        """
        user_plan = user.plan_tier or "starter"
        config = FeatureGuard.get_plan_config(user_plan)
        daily_limit = config.get("daily_scans", 0)
        
        # Date logic: if last_scan_date is not today, we assume quota is fresh (0 used)
        today = date.today()
        if user.last_scan_date != today:
            return True
            
        return user.scans_count_today < daily_limit

