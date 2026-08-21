import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from backend.main import app
from backend.models.database import SessionLocal, Collector, HealingEvent, CollectionRun
from backend.models.enums import CollectorStatus, HealingStatus, CollectionRunStatus, ResourceCategory
from backend.healing.heal_runner import HealRunner, REAL_HEAL_STATE

client = TestClient(app)

def test_real_schema_failure_detection():
    """Verify that triggering real schema failure marks collector FAILED and logs HealingEvent(TRIGGERED)."""
    db = SessionLocal()
    try:
        res = client.post("/demo/real/trigger-break?collector_id=c_mt1f0ke713h6n32pi4")
        assert res.status_code == 200
        data = res.json()

        assert data["collector_id"] == "c_mt1f0ke713h6n32pi4"
        assert data["status"] == "validation_failed"
        assert data["is_valid"] is False
        assert "monthly_price" in data["missing_fields"]
        assert data["validation_score"] < 0.5

        # Check DB state
        collector = db.query(Collector).filter(Collector.collector_id == "c_mt1f0ke713h6n32pi4").first()
        assert collector.status == CollectorStatus.FAILED

        heal_ev = db.query(HealingEvent).filter(
            HealingEvent.collector_id == "c_mt1f0ke713h6n32pi4",
            HealingEvent.status == HealingStatus.TRIGGERED
        ).first()
        assert heal_ev is not None
        assert "monthly_price" in heal_ev.failed_fields
    finally:
        db.close()

def test_heal_request_state_and_same_collector_id():
    """Verify that executing real heal with successful exit code 0 preserves the SAME collector ID and restores HEALTHY."""
    db = SessionLocal()
    try:
        # Mock subprocess to simulate Bright Data CLI success output
        mock_cli_result = MagicMock()
        mock_cli_result.returncode = 0
        mock_cli_result.stdout = '{"status":"healed","collector_id":"c_mt1f0ke713h6n32pi4","next_step":"bdata scraper run c_mt1f0ke713h6n32pi4"}'
        mock_cli_result.stderr = ""

        with patch("subprocess.run", return_value=mock_cli_result):
            res = client.post("/demo/real/trigger-heal?collector_id=c_mt1f0ke713h6n32pi4&prompt=Fix+monthly_price+selector")
            assert res.status_code == 200
            data = res.json()

            assert data["status"] == "resolved"
            assert data["same_collector_id_retained"] is True
            assert data["collector_id"] == "c_mt1f0ke713h6n32pi4"
            assert data["validation_pass_rate"] >= 0.8

            # Check DB state
            collector = db.query(Collector).filter(Collector.collector_id == "c_mt1f0ke713h6n32pi4").first()
            assert collector.status == CollectorStatus.HEALTHY
            assert collector.last_healed_at is not None

            resolved_ev = db.query(HealingEvent).filter(
                HealingEvent.collector_id == "c_mt1f0ke713h6n32pi4",
                HealingEvent.status == HealingStatus.RESOLVED
            ).first()
            assert resolved_ev is not None
    finally:
        db.close()

def test_failed_heal_cli_exit_code_is_not_marked_success():
    """Verify that when Bright Data CLI returns non-zero exit code, status is heal_failed and collector remains FAILED."""
    db = SessionLocal()
    try:
        # Break first
        client.post("/demo/real/trigger-break?collector_id=c_mt1f0ke713h6n32pi4")

        # Mock subprocess to simulate Bright Data CLI error
        mock_cli_result = MagicMock()
        mock_cli_result.returncode = 1
        mock_cli_result.stdout = '{"status":"heal_trigger_failed","message":"Rate limit exceeded"}'
        mock_cli_result.stderr = "Rate limit exceeded"

        with patch("subprocess.run", return_value=mock_cli_result):
            res = client.post("/demo/real/trigger-heal?collector_id=c_mt1f0ke713h6n32pi4")
            assert res.status_code == 200
            data = res.json()

            # Must NEVER be marked resolved or healed
            assert data["status"] == "heal_failed"
            assert data["cli_returncode"] == 1
            assert "HEAL FAILED" in data["message"]

            # Collector must remain FAILED
            collector = db.query(Collector).filter(Collector.collector_id == "c_mt1f0ke713h6n32pi4").first()
            assert collector.status == CollectorStatus.FAILED

            failed_ev = db.query(HealingEvent).filter(
                HealingEvent.collector_id == "c_mt1f0ke713h6n32pi4",
                HealingEvent.status == HealingStatus.FAILED
            ).first()
            assert failed_ev is not None
    finally:
        # Clean reset
        client.post("/demo/real/reset?collector_id=c_mt1f0ke713h6n32pi4")
        db.close()

def test_simulation_isolated_from_real_workflow():
    """Verify that simulated break/heal does NOT alter real collector c_mt1f0ke713h6n32pi4."""
    db = SessionLocal()
    try:
        # Ensure real collector is healthy
        client.post("/demo/real/reset?collector_id=c_mt1f0ke713h6n32pi4")

        # Trigger simulated break on c_hostel_sulekha_01
        sim_res = client.post("/demo/trigger-break", json={
            "collector_id": "c_hostel_sulekha_01",
            "break_fields": ["monthly_price"]
        })
        assert sim_res.status_code == 200

        # Real collector MUST remain healthy
        real_collector = db.query(Collector).filter(Collector.collector_id == "c_mt1f0ke713h6n32pi4").first()
        assert real_collector.status == CollectorStatus.HEALTHY

        # Reset simulation
        client.post("/demo/reset")
    finally:
        db.close()
