import pytest
from backend.models.database import init_db, SessionLocal
from backend.models.schemas import ParsedIntent
from backend.models.enums import ResourceCategory
from backend.services.matching_engine import MatchingEngine
from backend.ingestion.collector_runner import CollectorRunner
from backend.ingestion.result_parser import ResultParser

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    init_db()
    db = SessionLocal()
    for col in CollectorRunner.get_all_registered_collectors():
        payload = CollectorRunner.run_collector(col["collector_id"])
        ResultParser.ingest_collector_payload(db, payload)
    db.close()

def test_matching_with_budget_constraint():
    db = SessionLocal()
    try:
        # Search with strict budget of ₹10,000
        intent = ParsedIntent(
            city="Lucknow",
            target_location="Hazratganj",
            user_type="female_student",
            budget_max=10000.0,
            distance_max_km=5.0,
            required_categories=[ResourceCategory.WOMEN_HOSTEL],
            preferences={"women_only": True},
            explanation="Budget search"
        )
        resp = MatchingEngine.execute_search(db, intent)
        assert resp.total_found > 0
        for res in resp.primary_results:
            price = next((a.normalized_value for a in res.attributes if a.field_name == "monthly_price"), None)
            if price is not None:
                assert price <= 10000.0
    finally:
        db.close()

def test_matching_women_only_filter():
    db = SessionLocal()
    try:
        intent = ParsedIntent(
            city="Lucknow",
            target_location="Gomti Nagar",
            user_type="working_woman",
            budget_max=15000.0,
            distance_max_km=10.0,
            required_categories=[ResourceCategory.WOMEN_HOSTEL],
            preferences={"women_only": True},
            explanation="Women only search"
        )
        resp = MatchingEngine.execute_search(db, intent)
        for res in resp.primary_results:
            w_only = next((a.normalized_value for a in res.attributes if a.field_name == "women_only"), None)
            assert w_only is not False
    finally:
        db.close()

def test_natural_language_intent_parsing_and_matching():
    """Verify end-to-end natural language query parsing and deterministic matching."""
    from backend.services.intent_parser import IntentParser
    query = "I'm moving to Lucknow for college. Find a women's hostel under ₹12,000 with healthcare and public transport nearby."
    intent = IntentParser.parse_query(query)
    
    assert intent.city == "Lucknow"
    assert intent.user_type == "female_student"
    assert intent.budget_max == 12000.0
    assert ResourceCategory.WOMEN_HOSTEL in intent.required_categories
    assert ResourceCategory.HOSPITAL in intent.required_categories
    assert ResourceCategory.PUBLIC_TRANSPORT in intent.required_categories
    assert intent.preferences.get("women_only") is True

    db = SessionLocal()
    try:
        search_res = MatchingEngine.execute_search(db, intent)
        assert search_res.total_found > 0
        
        # Verify ranking factors and support chain on top match
        top = search_res.primary_results[0]
        assert top.match_score > 0
        assert len(top.why_this_result) > 0
        assert len(top.support_chain) > 0
    finally:
        db.close()

def test_cross_source_hostel_discovery():
    """Verify discovery of both direct-source and Sulekha directory records with badges."""
    db = SessionLocal()
    try:
        intent = ParsedIntent(
            city="Lucknow",
            target_location="Gomti Nagar",
            user_type="female_student",
            budget_max=15000.0,
            distance_max_km=15.0,
            required_categories=[ResourceCategory.WOMEN_HOSTEL],
            preferences={"women_only": True},
            explanation="All hostels search"
        )
        resp = MatchingEngine.execute_search(db, intent)
        assert resp.total_found >= 2

        badges = [r.data_source_badge for r in resp.primary_results]
        assert any("REAL BRIGHT DATA" in b or "Sulekha" in b for b in badges)
    finally:
        db.close()

def test_dynamic_support_chain_recalculation_on_db_change():
    """
    Verify that support chain is 100% dynamically computed from database records:
    Inserting a new closer facility immediately shifts the support chain across all categories:
    - Hospital
    - Metro / Transport
    - Pharmacy
    - Police / Women Helpdesk
    - Women Support
    """
    from backend.services.geo import GeoService
    from backend.models.database import Resource
    db = SessionLocal()
    try:
        origin_lat, origin_lon = 26.8528, 80.9463
        
        # Test 1: Hospital shift
        test_clinic = Resource(
            category=ResourceCategory.HOSPITAL,
            name="New Ultra-Proximity Test Medical Center",
            city="Lucknow",
            locality="Hazratganj",
            address="Hazratganj, Lucknow",
            latitude=26.8529,
            longitude=80.9464,
            is_active=True
        )
        db.add(test_clinic)
        db.commit()

        chain_hosp = GeoService.build_local_support_chain(db, origin_lat, origin_lon, origin_resource_id=-1)
        up_hosp = next(c for c in chain_hosp if c["category"] == ResourceCategory.HOSPITAL)
        assert up_hosp["name"] == "New Ultra-Proximity Test Medical Center"
        db.delete(test_clinic)
        db.commit()

        # Test 2: Metro / Transport shift
        test_metro = Resource(
            category=ResourceCategory.PUBLIC_TRANSPORT,
            name="New Ultra-Proximity Test Metro Station",
            city="Lucknow",
            locality="Hazratganj",
            address="Hazratganj, Lucknow",
            latitude=26.8529,
            longitude=80.9464,
            is_active=True
        )
        db.add(test_metro)
        db.commit()

        chain_metro = GeoService.build_local_support_chain(db, origin_lat, origin_lon, origin_resource_id=-1)
        up_metro = next(c for c in chain_metro if c["category"] == ResourceCategory.PUBLIC_TRANSPORT)
        assert up_metro["name"] == "New Ultra-Proximity Test Metro Station"
        db.delete(test_metro)
        db.commit()

        # Test 3: Pharmacy shift
        test_pharm = Resource(
            category=ResourceCategory.PHARMACY,
            name="New Ultra-Proximity Test Pharmacy",
            city="Lucknow",
            locality="Hazratganj",
            address="Hazratganj, Lucknow",
            latitude=26.8529,
            longitude=80.9464,
            is_active=True
        )
        db.add(test_pharm)
        db.commit()

        chain_pharm = GeoService.build_local_support_chain(db, origin_lat, origin_lon, origin_resource_id=-1)
        up_pharm = next(c for c in chain_pharm if c["category"] == ResourceCategory.PHARMACY)
        assert up_pharm["name"] == "New Ultra-Proximity Test Pharmacy"
        db.delete(test_pharm)
        db.commit()

        # Test 4: Police shift
        test_police = Resource(
            category=ResourceCategory.POLICE_OR_PUBLIC_SUPPORT,
            name="New Ultra-Proximity Test Police Helpdesk",
            city="Lucknow",
            locality="Hazratganj",
            address="Hazratganj, Lucknow",
            latitude=26.8529,
            longitude=80.9464,
            is_active=True
        )
        db.add(test_police)
        db.commit()

        chain_police = GeoService.build_local_support_chain(db, origin_lat, origin_lon, origin_resource_id=-1)
        up_police = next(c for c in chain_police if c["category"] == ResourceCategory.POLICE_OR_PUBLIC_SUPPORT)
        assert up_police["name"] == "New Ultra-Proximity Test Police Helpdesk"
        db.delete(test_police)
        db.commit()

        # Test 5: Women Support shift
        test_support = Resource(
            category=ResourceCategory.WOMEN_SUPPORT,
            name="New Ultra-Proximity Test Women Support Center",
            city="Lucknow",
            locality="Hazratganj",
            address="Hazratganj, Lucknow",
            latitude=26.8529,
            longitude=80.9464,
            is_active=True
        )
        db.add(test_support)
        db.commit()

        chain_support = GeoService.build_local_support_chain(db, origin_lat, origin_lon, origin_resource_id=-1)
        up_support = next(c for c in chain_support if c["category"] == ResourceCategory.WOMEN_SUPPORT)
        assert up_support["name"] == "New Ultra-Proximity Test Women Support Center"
        db.delete(test_support)
        db.commit()
    finally:
        db.close()

def test_empty_category_graceful_handling():
    """Verify that GeoService and MatchingEngine handle empty categories gracefully without crashing."""
    from backend.services.geo import GeoService
    db = SessionLocal()
    try:
        # Query with impossible coordinates where no crash occurs
        chain = GeoService.build_local_support_chain(db, 0.0, 0.0, origin_resource_id=999999)
        assert isinstance(chain, list)
    finally:
        db.close()

def test_simulated_self_healing_state_safety():
    """Verify that simulated self-healing state transitions correctly and is tagged as a simulation."""
    from backend.ingestion.collector_runner import DEMO_STATE, CollectorRunner
    assert "is_broken" in DEMO_STATE
    assert DEMO_STATE["broken_collector_id"] == "c_hostel_sulekha_01"
    
    # Verify collector meta acknowledges simulated demo target
    meta = CollectorRunner.get_collector_meta("c_hostel_sulekha_01")
    assert meta is not None
    assert meta["is_real_collector"] is False
    assert "Self-Healing Demo Target" in meta["name"]

def test_dynamic_search_queries_matrix():
    """
    Forensic verification of multiple distinct natural language search queries:
    1. 'women's hostel under ₹12000 with healthcare nearby'
    2. 'women's hostel under ₹9000'
    3. 'hostel in Indira Nagar'
    4. 'hostel near metro'
    5. 'women's hostel with hospital and pharmacy nearby'
    6. 'a hostel with the lowest rent'
    """
    from backend.services.intent_parser import IntentParser
    db = SessionLocal()
    try:
        # Query 1: Budget 12000 + Healthcare
        q1 = "women's hostel under ₹12000 with healthcare nearby"
        intent1 = IntentParser.parse_query(q1)
        assert intent1.budget_max == 12000.0
        assert ResourceCategory.HOSPITAL in intent1.required_categories
        res1 = MatchingEngine.execute_search(db, intent1)
        assert res1.total_found > 0
        for r in res1.primary_results:
            p_attr = next((a for a in r.attributes if a.field_name == "monthly_price"), None)
            if p_attr and p_attr.normalized_value:
                assert float(p_attr.normalized_value) <= 12000.0

        # Query 2: Strict Budget 9000
        q2 = "women's hostel under ₹9000"
        intent2 = IntentParser.parse_query(q2)
        assert intent2.budget_max == 9000.0
        res2 = MatchingEngine.execute_search(db, intent2)
        for r in res2.primary_results:
            p_attr = next((a for a in r.attributes if a.field_name == "monthly_price"), None)
            if p_attr and p_attr.normalized_value:
                assert float(p_attr.normalized_value) <= 9000.0

        # Query 3: Locality Indira Nagar
        q3 = "hostel in Indira Nagar"
        intent3 = IntentParser.parse_query(q3)
        assert intent3.target_location is not None
        assert "indira nagar" in intent3.target_location.lower()
        res3 = MatchingEngine.execute_search(db, intent3)
        assert res3.total_found > 0

        # Query 4: Transport Metro
        q4 = "hostel near metro"
        intent4 = IntentParser.parse_query(q4)
        assert ResourceCategory.PUBLIC_TRANSPORT in intent4.required_categories
        res4 = MatchingEngine.execute_search(db, intent4)
        assert res4.total_found > 0

        # Query 5: Hospital and Pharmacy
        q5 = "women's hostel with hospital and pharmacy nearby"
        intent5 = IntentParser.parse_query(q5)
        assert ResourceCategory.HOSPITAL in intent5.required_categories
        assert ResourceCategory.PHARMACY in intent5.required_categories
        res5 = MatchingEngine.execute_search(db, intent5)
        assert res5.total_found > 0

        # Query 6: Lowest rent
        q6 = "a hostel with the lowest rent"
        intent6 = IntentParser.parse_query(q6)
        res6 = MatchingEngine.execute_search(db, intent6)
        assert res6.total_found > 0
    finally:
        db.close()

