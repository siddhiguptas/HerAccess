import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.models.database import SessionLocal, init_db
from backend.ingestion.collector_runner import CollectorRunner
from backend.ingestion.result_parser import ResultParser

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    init_db()
    db = SessionLocal()
    for col in CollectorRunner.get_all_registered_collectors():
        payload = CollectorRunner.run_collector(col["collector_id"])
        ResultParser.ingest_collector_payload(db, payload)
    db.close()

def test_health_endpoint():
    with TestClient(app) as client:
        res = client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"

def test_search_endpoint():
    with TestClient(app) as client:
        payload = {
            "query": "I am a female student moving to Lucknow. I need a women's hostel under ₹12,000 with transport and hospital nearby.",
            "city": "Lucknow",
            "budget_max": 12000
        }
        res = client.post("/search", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "primary_results" in data
        assert len(data["primary_results"]) > 0
        assert "intent" in data
        assert data["intent"]["budget_max"] == 12000

        # Verify signature features on first result
        first_res = data["primary_results"][0]
        assert len(first_res["why_this_result"]) > 0
        assert len(first_res["evidence_cards"]) > 0
        assert len(first_res["support_chain"]) > 0
        assert first_res["freshness"] in ["green", "yellow", "red"]
        assert "data_source_badge" in first_res
        assert "is_real_data" in first_res

        # Verify support chain items carry data source badges
        first_chain_item = first_res["support_chain"][0]
        assert "data_source_badge" in first_chain_item
        assert first_chain_item["data_source_badge"] in ["REAL BRIGHT DATA", "FIXTURE DATA", "REFERENCE FIXTURE"]

        # Verify ranking factors explanation
        first_factor = first_res["why_this_result"][0]
        assert "label" in first_factor
        assert "score_contribution" in first_factor
        assert "matched" in first_factor

def test_health_dashboard_endpoint():
    with TestClient(app) as client:
        res = client.get("/health/dashboard")
        assert res.status_code == 200
        data = res.json()
        assert data["total_collectors"] > 0
        assert data["healthy_count"] > 0
        assert "collectors" in data
        assert len(data["collectors"]) > 0

def test_resources_and_conflicts_endpoints():
    with TestClient(app) as client:
        res = client.get("/resources")
        assert res.status_code == 200
        items = res.json()
        assert len(items) > 0

        # Detail endpoint
        first_id = items[0]["id"]
        detail_res = client.get(f"/resources/{first_id}")
        assert detail_res.status_code == 200
        assert detail_res.json()["id"] == first_id

        # Conflicts endpoint
        conf_res = client.get("/resources/conflicts")
        assert conf_res.status_code == 200
        assert isinstance(conf_res.json(), list)

def test_watchlist_lifecycle():
    with TestClient(app) as client:
        session_id = "test_user_session_123"
        # 1. Add to watch
        add_res = client.post("/watch", json={"session_id": session_id, "resource_id": 1})
        assert add_res.status_code == 200
        assert add_res.json()["session_id"] == session_id

        # 2. Get watchlist
        get_res = client.get(f"/watch?session_id={session_id}")
        assert get_res.status_code == 200
        watched = get_res.json()
        assert len(watched) >= 1

        # 3. Remove from watchlist
        del_res = client.delete(f"/watch/1?session_id={session_id}")
        assert del_res.status_code == 200

def test_changes_endpoint():
    with TestClient(app) as client:
        res = client.get("/changes")
        assert res.status_code == 200
        assert isinstance(res.json(), list)

def test_demo_break_and_heal_lifecycle():
    with TestClient(app) as client:
        # 1. Check initial status
        res = client.get("/demo/status")
        assert res.status_code == 200

        # 2. Trigger Break
        break_res = client.post("/demo/trigger-break", json={
            "collector_id": "c_hostel_sulekha_01",
            "break_fields": ["monthly_price", "curfew_time"]
        })
        assert break_res.status_code == 200
        assert break_res.json()["status"] == "broken"

        # 3. Trigger Heal
        heal_res = client.post("/demo/trigger-heal", json={
            "collector_id": "c_hostel_sulekha_01",
            "problem_description": "Price and curfew missing due to layout change."
        })
        assert heal_res.status_code == 200
        assert heal_res.json()["status"] == "resolved"
        assert heal_res.json()["same_collector_id_retained"] is True

        # 4. Reset
        reset_res = client.post("/demo/reset")
        assert reset_res.status_code == 200

def test_category_specific_attributes_isolation():
    """Verify that non-hostel resources strictly do NOT contain hostel attributes."""
    with TestClient(app) as client:
        res = client.get("/resources")
        assert res.status_code == 200
        items = res.json()

        categories_found = set(item["category"] for item in items)
        assert "women_hostel" in categories_found
        assert "hospital" in categories_found
        assert "public_transport" in categories_found
        assert "pharmacy" in categories_found
        assert "police_or_public_support" in categories_found
        assert "women_support" in categories_found

        hostel_specific_fields = {"monthly_price", "curfew_time", "women_only", "room_types", "meal_details"}

        for item in items:
            cat = item["category"]
            field_names = set(attr["field_name"] for attr in item.get("attributes", []))

            if cat == "women_hostel":
                # Hostels should only have hostel/general attributes, never hospital or organization types
                assert field_names.isdisjoint({"emergency_24x7", "departments", "organization_type"})
            else:
                # Non-hostel categories (hospital, transit, pharmacy, police, support) must NEVER contain hostel fields
                assert field_names.isdisjoint(hostel_specific_fields), f"Resource '{item['name']}' in category '{cat}' had illegal hostel attributes: {field_names.intersection(hostel_specific_fields)}"


