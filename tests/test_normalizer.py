import pytest
from backend.ingestion.normalizer import FieldNormalizer

def test_price_normalization():
    assert FieldNormalizer.normalize_price("₹9,500/month") == 9500.0
    assert FieldNormalizer.normalize_price("Rs. 12,000 per month") == 12000.0
    assert FieldNormalizer.normalize_price("8500") == 8500.0
    assert FieldNormalizer.normalize_price("Free") is None

def test_curfew_normalization():
    assert FieldNormalizer.normalize_curfew("9:30 PM Gate Closure") == "21:30"
    assert FieldNormalizer.normalize_curfew("10 PM") == "22:00"
    assert FieldNormalizer.normalize_curfew("8:00 AM") == "08:00"
    assert FieldNormalizer.normalize_curfew("22:00") == "22:00"

def test_boolean_normalization():
    assert FieldNormalizer.normalize_boolean("Strictly Female Students & Working Women Only") is True
    assert FieldNormalizer.normalize_boolean("Yes") is True
    assert FieldNormalizer.normalize_boolean("No") is False
    assert FieldNormalizer.normalize_boolean(None) is False

def test_list_normalization():
    facilities = FieldNormalizer.normalize_list("Wi-Fi, AC, Mess Food, 24/7 CCTV")
    assert "Wi-Fi" in facilities or "wi-fi" in [f.lower() for f in facilities]
    assert "AC" in facilities or "ac" in [f.lower() for f in facilities]

def test_curfew_range_normalization():
    res = FieldNormalizer.normalize_curfew("9:30-10:00 pm")
    assert isinstance(res, dict)
    assert res["start"] == "21:30"
    assert res["end"] == "22:00"
    assert res["raw"] == "9:30-10:00 pm"

def test_room_types_normalization():
    raw_rooms = [
        {"accommodation_type": "Single Person", "room_features": "AC & Non AC", "monthly_rent": {"value": 12000, "currency": "INR", "symbol": "₹"}},
        {"accommodation_type": "Twin Sharing", "room_features": "AC & Non AC", "monthly_rent": {"value": 10000, "currency": "INR", "symbol": "₹"}}
    ]
    norm = FieldNormalizer.normalize_room_types(raw_rooms)
    assert len(norm) == 2
    assert norm[0]["accommodation_type"] == "Single Person"
    assert norm[0]["monthly_rent"]["value"] == 12000.0
    assert norm[1]["accommodation_type"] == "Twin Sharing"
    assert norm[1]["monthly_rent"]["value"] == 10000.0

def test_facilities_policies_separation():
    raw_list = [
        "Washing machine facility for washing clothes.",
        "Wi-Fi facility for internet.",
        "The entry of any male other than Gaurdian inside the hostel is completely prohibited.",
        "Eating, bringing or boiling non-veg or eggs etc. is not allowed in the hostel. This Girls Hostel is completely Vegetarian."
    ]
    fac, pol = FieldNormalizer.separate_facilities_and_policies(raw_list)
    assert len(fac) == 2
    assert "Washing machine facility for washing clothes." in fac
    assert "Wi-Fi facility for internet." in fac
    assert len(pol) == 2
    assert any("completely prohibited" in p for p in pol)
    assert any("completely Vegetarian" in p for p in pol)

