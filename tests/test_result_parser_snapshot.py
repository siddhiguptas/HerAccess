import pytest
from backend.models.database import SessionLocal, init_db, Resource, ResourceAttribute, Evidence, Source, Collector
from backend.ingestion.collector_runner import CollectorRunner
from backend.ingestion.result_parser import ResultParser

@pytest.fixture(scope="module")
def snapshot_db():
    init_db()
    db = SessionLocal()
    # Wipe DB for clean snapshot
    db.query(Evidence).delete()
    db.query(ResourceAttribute).delete()
    db.query(Resource).delete()
    db.query(Collector).delete()
    db.query(Source).delete()
    db.commit()

    # Ingest Sulekha Hostel 01
    payload = CollectorRunner.run_collector("c_hostel_sulekha_01")
    ResultParser.ingest_collector_payload(db, payload)
    
    yield db
    db.close()

def test_snapshot_resource_count(snapshot_db):
    count = snapshot_db.query(Resource).count()
    assert count == 4, f"Should have ingested exactly 4 resources, got {count}"
    
def test_snapshot_attributes(snapshot_db):
    res = snapshot_db.query(Resource).filter(Resource.name.like("%Avadh Queen%")).first()
    assert res is not None, "Avadh Queen's PG must exist in the ingested payload"
    
    attrs = {a.field_name: a.normalized_value for a in res.attributes}
    
    assert attrs.get("monthly_price") == 11500, f"Monthly price was {attrs.get('monthly_price')}"
    assert "22:30" in str(attrs.get("curfew_time")), f"Curfew time was {attrs.get('curfew_time')}"
    assert attrs.get("women_only") == True, "Women only must be True"
    assert "ac" in attrs.get("facilities", []), "Facilities must contain ac"
    assert "wifi" in attrs.get("facilities", []), "Facilities must contain wifi"
    
def test_snapshot_duplicate_handling(snapshot_db):
    count_before = snapshot_db.query(Resource).count()
    payload = CollectorRunner.run_collector("c_hostel_sulekha_01")
    ResultParser.ingest_collector_payload(snapshot_db, payload)
    count_after = snapshot_db.query(Resource).count()
    assert count_before == count_after, "Deduplication failed, duplicate resources were created"
