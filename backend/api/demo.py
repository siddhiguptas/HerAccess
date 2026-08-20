from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from backend.models.database import get_db, Collector
from backend.models.schemas import (
    DemoTriggerBreakRequest, DemoTriggerHealRequest, DemoStatusResponse
)
from backend.models.enums import CollectorStatus
from backend.ingestion.collector_runner import CollectorRunner, DEMO_STATE
from backend.ingestion.result_parser import ResultParser
from backend.healing.heal_runner import HealRunner

router = APIRouter(prefix="/demo", tags=["Demo Simulation"])

@router.get("", response_model=DemoStatusResponse)
def get_demo_root(db: Session = Depends(get_db)):
    """Returns demo state and collector health for demo mode."""
    return get_demo_status(db)

@router.get("/status", response_model=DemoStatusResponse)
def get_demo_status(db: Session = Depends(get_db)):
    """Inspects the current state of the interactive hackathon demo."""
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
    Simulates target website layout alteration:
    Causes required fields (price, curfew, contact) to fail extraction.
    Updates collector to FAILED and drops validation rate.
    """
    DEMO_STATE["is_broken"] = True
    DEMO_STATE["broken_collector_id"] = req.collector_id
    DEMO_STATE["broken_fields"] = req.break_fields
    DEMO_STATE["is_healed"] = False
    DEMO_STATE["healing_in_progress"] = False

    # Re-run collector in broken state
    broken_payload = CollectorRunner.run_collector(req.collector_id)
    run, count, pass_rate = ResultParser.ingest_collector_payload(db, broken_payload)

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
    Triggers the Bright Data healing workflow:
    1. Sends problem description to `bdata scraper heal`
    2. Approves fix retaining the same Collector ID
    3. Reruns collection and restores 100% validation
    4. Downstream app continues with zero code changes
    """
    try:
        result = HealRunner.trigger_healing_workflow(
            db_session=db,
            collector_id=req.collector_id,
            problem_description=req.problem_description,
            failed_fields=DEMO_STATE["broken_fields"]
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reset")
def reset_demo_state(db: Session = Depends(get_db)):
    """Resets the demo simulation to initial healthy state."""
    DEMO_STATE["is_broken"] = False
    DEMO_STATE["is_healed"] = False
    DEMO_STATE["healing_in_progress"] = False
    DEMO_STATE["last_healed_at"] = None

    # Ingest all fresh fixtures
    for col in CollectorRunner.get_all_registered_collectors():
        payload = CollectorRunner.run_collector(col["collector_id"])
        ResultParser.ingest_collector_payload(db, payload)

    return {"message": "Demo state reset. All collectors healthy."}
