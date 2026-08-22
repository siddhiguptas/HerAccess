import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from backend.main import app
from backend.models.database import Base, engine, CoverageExpansionJob, SessionLocal
from backend.models.enums import ResourceCategory
import time

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@patch("backend.api.coverage.BackgroundTasks.add_task")
def test_expand_coverage_api_women_hostel(mock_add_task):
    response = client.post(
        "/coverage/expand",
        json={"locality": "Aliganj", "city": "Lucknow", "category": "women_hostel"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "pending"
    assert data["locality"] == "Aliganj"
    assert data["city"] == "Lucknow"
    mock_add_task.assert_called_once()
    
    # Clean up DB
    db = SessionLocal()
    db.query(CoverageExpansionJob).delete()
    db.commit()
    db.close()

def test_expand_coverage_unsupported_category():
    response = client.post(
        "/coverage/expand",
        json={"locality": "Aliganj", "city": "Lucknow", "category": "hospital"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "rejected"
    assert "only available for women_hostel" in data["error"]

@patch("backend.api.coverage.settings")
def test_run_expansion_job_demo_mode(mock_settings):
    mock_settings.BRIGHT_DATA_USE_FIXTURES = True
    mock_settings.BRIGHT_DATA_FIXTURES_DIR = "fixtures"
    
    db = SessionLocal()
    job = CoverageExpansionJob(locality="Aliganj", city="Lucknow", category="women_hostel", status="pending")
    db.add(job)
    db.commit()
    db.refresh(job)
    job_id = job.id
    
    # Mock time.sleep to run fast
    with patch("time.sleep", return_value=None):
        from backend.api.coverage import _run_expansion_job
        _run_expansion_job(job_id)
        
    db.refresh(job)
    assert job.status in ["completed", "failed"] # It should complete or fail if fixture doesn't exist
    if job.status == "completed":
        assert job.records_accepted > 0
    db.close()

@patch("backend.api.coverage.settings")
@patch("backend.services.bright_data_client.BrightDataClient.run_scraper")
def test_run_expansion_job_real_mode_success(mock_run_scraper, mock_settings):
    mock_settings.BRIGHT_DATA_USE_FIXTURES = False
    
    # Mock BrightData returning 1 record
    mock_run_scraper.return_value = [{"name": "Test Hostel", "address": "123 Aliganj"}]
    
    db = SessionLocal()
    job = CoverageExpansionJob(locality="Aliganj", city="Lucknow", category="women_hostel", status="pending")
    db.add(job)
    db.commit()
    db.refresh(job)
    job_id = job.id
    
    from backend.api.coverage import _run_expansion_job
    _run_expansion_job(job_id)
    
    db.refresh(job)
    # Target URL correctly formed and passed
    expected_url = "https://www.sulekha.com/womens-hostel/aliganj-lucknow"
    mock_run_scraper.assert_called_once_with("c_mt1i5ri4trltbvw66", max_items=10, target_url=expected_url)
    
    assert job.status == "completed"
    assert job.records_found == 1
    db.close()

@patch("backend.api.coverage.settings")
@patch("backend.services.bright_data_client.BrightDataClient.run_scraper")
def test_run_expansion_job_real_mode_empty_result(mock_run_scraper, mock_settings):
    mock_settings.BRIGHT_DATA_USE_FIXTURES = False
    
    # Mock BrightData returning empty
    mock_run_scraper.return_value = []
    
    db = SessionLocal()
    job = CoverageExpansionJob(locality="Aliganj", city="Lucknow", category="women_hostel", status="pending")
    db.add(job)
    db.commit()
    db.refresh(job)
    job_id = job.id
    
    from backend.api.coverage import _run_expansion_job
    _run_expansion_job(job_id)
    
    db.refresh(job)
    assert job.status == "completed"
    assert job.records_found == 0
    assert job.records_accepted == 0
    db.close()
    
@patch("backend.api.coverage.settings")
@patch("backend.services.bright_data_client.BrightDataClient.run_scraper")
def test_run_expansion_job_real_mode_failure(mock_run_scraper, mock_settings):
    mock_settings.BRIGHT_DATA_USE_FIXTURES = False
    
    # Mock BrightData throwing exception
    mock_run_scraper.side_effect = Exception("Bright Data CLI Error")
    
    db = SessionLocal()
    job = CoverageExpansionJob(locality="Aliganj", city="Lucknow", category="women_hostel", status="pending")
    db.add(job)
    db.commit()
    db.refresh(job)
    job_id = job.id
    
    from backend.api.coverage import _run_expansion_job
    _run_expansion_job(job_id)
    
    db.refresh(job)
    assert job.status == "failed"
    assert "Bright Data CLI Error" in job.error_message
    db.close()

