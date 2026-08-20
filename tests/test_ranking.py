import pytest
from backend.services.ranking import TransparentRankingEngine
from backend.services.geo import GeoService
from backend.models.enums import FreshnessLevel

def test_geo_distance():
    # Hazratganj (26.8528, 80.9463) to Gomti Nagar (26.8654, 80.9984) ~ 5.3 km
    dist = GeoService.haversine_distance(26.8528, 80.9463, 26.8654, 80.9984)
    assert 4.5 < dist < 6.0

def test_ranking_engine_factors():
    attrs = {
        "monthly_price": 9500,
        "women_only": True,
        "curfew_time": "22:00"
    }
    score, factors = TransparentRankingEngine.evaluate_resource(
        resource_attributes=attrs,
        distance_km=1.5,
        budget_max=12000,
        distance_max_km=5.0,
        freshness=FreshnessLevel.GREEN,
        has_nearby_transport=True,
        has_nearby_hospital=True
    )
    # 2 (budget) + 2 (women_only) + 2 (distance) + 2 (transport) + 2 (hospital) + 2 (green) + 2 (high verif) = 14.0
    assert score == 14.0
    factor_names = [f.factor_name for f in factors]
    assert "budget_fit" in factor_names
    assert "women_only" in factor_names
    assert "distance" in factor_names
    assert "transport_nearby" in factor_names
    assert "hospital_nearby" in factor_names
    assert "freshness" in factor_names

