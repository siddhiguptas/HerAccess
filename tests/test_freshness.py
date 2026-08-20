import pytest
from datetime import datetime, timezone, timedelta
from backend.models.enums import FreshnessLevel
from backend.verification.freshness import FreshnessCalculator

def test_freshness_green():
    now = datetime.now(timezone.utc)
    recent = now - timedelta(hours=3)
    assert FreshnessCalculator.calculate_freshness(recent) == FreshnessLevel.GREEN

def test_freshness_yellow():
    now = datetime.now(timezone.utc)
    three_days_ago = now - timedelta(days=3)
    assert FreshnessCalculator.calculate_freshness(three_days_ago) == FreshnessLevel.YELLOW

def test_freshness_red():
    now = datetime.now(timezone.utc)
    ten_days_ago = now - timedelta(days=10)
    assert FreshnessCalculator.calculate_freshness(ten_days_ago) == FreshnessLevel.RED
    assert FreshnessCalculator.calculate_freshness(None) == FreshnessLevel.RED
