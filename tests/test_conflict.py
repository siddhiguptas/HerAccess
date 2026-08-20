import pytest
from backend.verification.conflict_detector import ConflictDetector

def test_price_conflict():
    # 9500 vs 11000 (> 5% difference) -> True
    assert ConflictDetector.are_values_conflicting(9500, 11000, "monthly_price") is True
    # 9500 vs 9500 -> False
    assert ConflictDetector.are_values_conflicting(9500, 9500, "monthly_price") is False

def test_curfew_conflict():
    assert ConflictDetector.are_values_conflicting("21:30", "22:00", "curfew_time") is True
    assert ConflictDetector.are_values_conflicting("22:00", "22:00", "curfew_time") is False

def test_boolean_conflict():
    assert ConflictDetector.are_values_conflicting(True, False, "women_only") is True
    assert ConflictDetector.are_values_conflicting(True, True, "women_only") is False
