from datetime import datetime, timezone, timedelta
from typing import Union
from backend.models.enums import FreshnessLevel

class FreshnessCalculator:
    @staticmethod
    def calculate_freshness(observed_at: Union[datetime, str, None]) -> FreshnessLevel:
        if not observed_at:
            return FreshnessLevel.RED
            
        if isinstance(observed_at, str):
            try:
                # Handle standard ISO strings
                observed_dt = datetime.fromisoformat(observed_at.replace("Z", "+00:00"))
            except Exception:
                return FreshnessLevel.RED
        else:
            observed_dt = observed_at

        # If naive, make timezone-aware
        if observed_dt.tzinfo is None:
            observed_dt = observed_dt.replace(tzinfo=timezone.utc)
            
        now = datetime.now(timezone.utc)
        diff = now - observed_dt

        if diff <= timedelta(hours=24):
            return FreshnessLevel.GREEN
        elif diff <= timedelta(days=7):
            return FreshnessLevel.YELLOW
        else:
            return FreshnessLevel.RED
