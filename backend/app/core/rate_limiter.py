import redis
from datetime import timedelta
from app.core.config import get_settings

settings = get_settings()

class RateLimiter:
    def __init__(self):
        self.redis = redis.from_url(settings.redis_url, decode_responses=True)
        self.limit = 1  # Rigid limit for guests (1 scan per day)
        self.ttl = 86400  # 24 hours in seconds

    def is_allowed(self, ip: str) -> bool:
        """
        Check if the IP has remaining quota.
        Returns True if allowed, False otherwise.
        """
        key = f"guest_quota:{ip}"
        
        # Increment usage
        current_usage = self.redis.incr(key)
        
        # Set expiry on first use
        if current_usage == 1:
            self.redis.expire(key, self.ttl)
            
        if current_usage > self.limit:
            return False
            
        return True

    def get_remaining(self, ip: str) -> int:
        key = f"guest_quota:{ip}"
        usage = self.redis.get(key)
        if not usage:
            return self.limit
        return max(0, self.limit - int(usage))
