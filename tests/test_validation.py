import pytest
from backend.models.enums import ResourceCategory
from backend.verification.validator import CategoryValidator

def test_hostel_validation_success():
    valid_attrs = {
        "monthly_price": {"raw_value": "Rs. 9,500/mo", "normalized_value": 9500},
        "women_only": {"raw_value": "Girls only", "normalized_value": True},
        "curfew_time": {"raw_value": "10:00 PM", "normalized_value": "22:00"}
    }
    is_valid, pass_rate, missing = CategoryValidator.validate_resource_payload(ResourceCategory.WOMEN_HOSTEL, valid_attrs)
    assert is_valid is True
    assert pass_rate == 1.0
    assert len(missing) == 0

def test_hostel_validation_missing_fields():
    broken_attrs = {
        "monthly_price": None,
        "women_only": {"raw_value": "Girls only", "normalized_value": True},
        "curfew_time": None
    }
    is_valid, pass_rate, missing = CategoryValidator.validate_resource_payload(ResourceCategory.WOMEN_HOSTEL, broken_attrs)
    assert is_valid is False
    assert pass_rate < 1.0
    assert "monthly_price" in missing
    assert "curfew_time" in missing

def test_hospital_validation():
    hosp_attrs = {
        "hospital_type": {"raw_value": "Government", "normalized_value": "government"},
        "emergency_services": {"raw_value": "24x7", "normalized_value": True},
        "departments": {"raw_value": "Gynaecology, General Medicine", "normalized_value": ["gynaecology"]}
    }
    is_valid, pass_rate, missing = CategoryValidator.validate_resource_payload(ResourceCategory.HOSPITAL, hosp_attrs)
    assert is_valid is True
    assert pass_rate == 1.0
