from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.models.database import get_db, Collector, HealingEvent, CollectionRun
from backend.models.schemas import (
    DemoTriggerBreakRequest, DemoTriggerHealRequest, DemoStatusResponse
)
from backend.models.enums import CollectorStatus, HealingStatus
from backend.ingestion.collector_runner import CollectorRunner, DEMO_STATE
from backend.ingestion.result_parser import ResultParser
from backend.healing.heal_runner import HealRunner

router = APIRouter(prefix="/demo", tags=["Self-Healing Architecture & Verification"])

# ==============================================================================
# 1. REAL BRIGHT DATA SELF-HEALING ENDPOINTS (Actual Collector c_mt1f0ke713h6n32pi4)
# ==============================================================================

@router.get("/real/status")
def get_real_self_healing_status(db: Session = Depends(get_db)):
    """
    Returns real database telemetry, validation health, and audit trail for collector c_mt1f0ke713h6n32pi4.
    """
    return HealRunner.get_real_self_healing_status(db)

@router.post("/real/trigger-break")
def trigger_real_schema_failure(
    collector_id: str = Query("c_mt1f0ke713h6n32pi4"),
    db: Session = Depends(get_db)
):
    """
    Executes actual CategoryValidator failure detection on real collector c_mt1f0ke713h6n32pi4.
    Updates database records, marks collector FAILED, and logs HealingEvent(TRIGGERED).
    """
    try:
        return HealRunner.trigger_real_schema_failure_test(
            db_session=db,
            collector_id=collector_id,
            broken_fields=["monthly_price", "curfew_time", "primary_contact"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/real/trigger-heal")
def trigger_real_bright_data_heal(
    collector_id: str = Query("c_mt1f0ke713h6n32pi4"),
    prompt: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Executes `npx @brightdata/cli scraper heal c_mt1f0ke713h6n32pi4`, runs re-extraction,
    validates recovery with CategoryValidator, and logs HealingEvent(RESOLVED).
    """
    try:
        return HealRunner.execute_real_heal(
            db_session=db,
            collector_id=collector_id,
            prompt=prompt or "Layout changed in hostel listings container. Fix selectors for monthly_price, curfew_time, contact."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/real/reset")
def reset_real_heal_state(
    collector_id: str = Query("c_mt1f0ke713h6n32pi4"),
    db: Session = Depends(get_db)
):
    """Resets real collector to nominal healthy state."""
    return HealRunner.reset_real_heal_state(db, collector_id)


# ==============================================================================
# 2. SIMULATED ZERO-CREDIT WALKTHROUGH ENDPOINTS (Isolated Demo Mode)
# ==============================================================================

@router.get("", response_model=DemoStatusResponse)
def get_demo_root(db: Session = Depends(get_db)):
    """Returns demo state and collector health for demo mode."""
    return get_demo_status(db)

@router.get("/status", response_model=DemoStatusResponse)
def get_demo_status(db: Session = Depends(get_db)):
    """Inspects the current state of the isolated hackathon demo."""
    target_id = DEMO_STATE["broken_collector_id"]
    collector = db.query(Collector).filter(Collector.collector_id == target_id).first()

    status = collector.status if collector else CollectorStatus.HEALTHY
    is_broken = DEMO_STATE["is_broken"] and not DEMO_STATE["is_healed"]
    pass_rate = 0.0 if is_broken else 1.0

    msg = "All collectors healthy."
    if DEMO_STATE["healing_in_progress"]:
        msg = f"Healing workflow running on {target_id} via Bright Data Scraper Studio."
    elif is_broken:
        msg = f"Collector {target_id} layout changed! Missing price, curfew, and contact fields."
    elif DEMO_STATE["is_healed"]:
        msg = f"Collector {target_id} self-healed and recovered. Same Collector ID retained."

    return DemoStatusResponse(
        collector_id=target_id,
        status=status,
        is_broken=is_broken,
        broken_fields=DEMO_STATE["broken_fields"] if is_broken else [],
        validation_pass_rate=pass_rate,
        heal_in_progress=DEMO_STATE["healing_in_progress"],
        last_healed_at=collector.last_healed_at if collector else None,
        same_collector_id_verified=True,
        message=msg
    )

@router.post("/trigger-break")
def trigger_simulated_break(req: DemoTriggerBreakRequest, db: Session = Depends(get_db)):
    """
    Simulates target website layout alteration in isolated demo mode:
    Causes required fields (price, curfew, contact) to fail extraction.
    """
    DEMO_STATE["is_broken"] = True
    DEMO_STATE["broken_collector_id"] = req.collector_id
    DEMO_STATE["broken_fields"] = req.break_fields
    DEMO_STATE["is_healed"] = False
    DEMO_STATE["healing_in_progress"] = False

    broken_payload = CollectorRunner.run_collector(req.collector_id)
    run, count, pass_rate = ResultParser.ingest_collector_payload(
        db, broken_payload, collector_id_override=req.collector_id, is_demo_run=True
    )

    return {
        "status": "broken",
        "collector_id": req.collector_id,
        "broken_fields": req.break_fields,
        "validation_pass_rate": pass_rate,
        "message": f"Website structure changed! Required fields {req.break_fields} returned null. Validation failed (0.0%)."
    }

@router.post("/trigger-heal")
def trigger_simulated_heal(req: DemoTriggerHealRequest, db: Session = Depends(get_db)):
    """
    Triggers simulated self-healing in isolated demo mode.
    """
    try:
        DEMO_STATE["is_healed"] = True
        DEMO_STATE["healing_in_progress"] = False
        DEMO_STATE["last_healed_at"] = datetime.utcnow().isoformat()

        collector = db.query(Collector).filter(Collector.collector_id == req.collector_id).first()
        if collector:
            collector.status = CollectorStatus.HEALTHY
            collector.last_healed_at = datetime.utcnow()
            collector.heal_count = (collector.heal_count or 0) + 1
            db.commit()

        return {
            "collector_id": req.collector_id,
            "status": "resolved",
            "same_collector_id_retained": True,
            "fields_recovered": DEMO_STATE["broken_fields"],
            "validation_pass_rate": 1.0,
            "records_recovered": 4,
            "resolved_at": datetime.utcnow().isoformat(),
            "message": f"Collector {req.collector_id} healed and recovered successfully with zero downstream code changes."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reset")
def reset_demo_state(db: Session = Depends(get_db)):
    """Resets the demo simulation to initial healthy state."""
    DEMO_STATE["is_broken"] = False
    DEMO_STATE["is_healed"] = False
    DEMO_STATE["healing_in_progress"] = False
    DEMO_STATE["last_healed_at"] = None

    for col in CollectorRunner.get_all_registered_collectors():
        payload = CollectorRunner.run_collector(col["collector_id"])
        ResultParser.ingest_collector_payload(
            db, payload, collector_id_override=col["collector_id"], is_demo_run=True
        )

    return {"message": "Demo state reset. All collectors healthy."}
