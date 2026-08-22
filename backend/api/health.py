from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.models.database import get_db, Collector, CollectionRun, Source, Resource, HealingEvent
from backend.models.schemas import HealthDashboardResponse, CollectorHealthSummary
from backend.models.enums import CollectorStatus
from backend.ingestion.collector_runner import CollectorRunner
from backend.ingestion.result_parser import ResultParser

router = APIRouter(prefix="/health", tags=["Health & Collectors"])

@router.get("", response_model=Dict[str, str])
def health_check():
    return {"status": "healthy", "service": "HerAccess API", "version": "1.0.0"}

@router.get("/dashboard", response_model=HealthDashboardResponse)
def get_scraper_health_dashboard(db: Session = Depends(get_db)):
    """
    Judges Technical Dashboard:
    Summarizes Bright Data Collectors, runs, pass rates, healings, and source health.
    """
    collectors = db.query(Collector).all()
    total_sources = db.query(Source).count()
    total_records = db.query(Resource).count()
    runs = db.query(CollectionRun).order_by(CollectionRun.triggered_at.desc()).limit(15).all()
    healing_events = db.query(HealingEvent).order_by(HealingEvent.triggered_at.desc()).limit(10).all()

    healthy_count = sum(1 for c in collectors if c.status == CollectorStatus.HEALTHY)
    degraded_count = sum(1 for c in collectors if c.status == CollectorStatus.DEGRADED)
    healing_count = sum(1 for c in collectors if c.status == CollectorStatus.HEALING)
    failed_count = sum(1 for c in collectors if c.status == CollectorStatus.FAILED)

    collector_summaries = []
    total_pass_rates = []
    last_collection_ts = None

    for c in collectors:
        last_run = db.query(CollectionRun).filter(
            CollectionRun.collector_id == c.collector_id
        ).order_by(CollectionRun.triggered_at.desc()).first()

        pass_rate = last_run.validation_pass_rate if last_run else 1.0
        total_pass_rates.append(pass_rate)

        if last_run and (not last_collection_ts or last_run.triggered_at > last_collection_ts):
            last_collection_ts = last_run.triggered_at

        collector_summaries.append(CollectorHealthSummary(
            collector_id=c.collector_id,
            name=c.name,
            category=c.category,
            source_url=c.target_url,
            status=c.status,
            last_run_at=c.last_run_at,
            last_healed_at=c.last_healed_at,
            heal_count=c.heal_count or 0,
            records_count=last_run.records_count if last_run else 0,
            validation_pass_rate=pass_rate,
            last_error=last_run.error_summary if last_run else None
        ))

    overall_val_rate = (sum(total_pass_rates) / len(total_pass_rates)) if total_pass_rates else 1.0

    recent_runs_data = [
        {
            "id": r.id,
            "collector_id": r.collector_id,
            "triggered_at": r.triggered_at.isoformat() if r.triggered_at else None,
            "status": r.status.value,
            "records_count": r.records_count,
            "validation_pass_rate": r.validation_pass_rate,
            "error_summary": r.error_summary
        } for r in runs
    ]

    recent_healing_data = [
        {
            "id": h.id,
            "collector_id": h.collector_id,
            "problem_description": h.problem_description,
            "status": h.status.value,
            "triggered_at": h.triggered_at.isoformat() if h.triggered_at else None,
            "resolved_at": h.resolved_at.isoformat() if h.resolved_at else None,
            "fields_recovered": h.fields_recovered
        } for h in healing_events
    ]

    return HealthDashboardResponse(
        total_collectors=len(collectors),
        healthy_count=healthy_count,
        degraded_count=degraded_count,
        healing_count=healing_count,
        failed_count=failed_count,
        total_sources=total_sources,
        total_records=total_records,
        overall_validation_rate=round(overall_val_rate * 100, 1),
        last_collection_timestamp=last_collection_ts,
        collectors=collector_summaries,
        recent_runs=recent_runs_data,
        recent_healing_events=recent_healing_data
    )

@router.post("/collectors/run/{collector_id}")
def trigger_collector_run(collector_id: str, db: Session = Depends(get_db)):
    """Manually trigger a Bright Data collector run and ingest data."""
    try:
        payload = CollectorRunner.run_collector(collector_id)
        run, count, pass_rate = ResultParser.ingest_collector_payload(db, payload, collector_id_override=collector_id)
        return {
            "message": f"Collector {collector_id} executed successfully.",
            "records_ingested": count,
            "validation_pass_rate": pass_rate,
            "run_id": run.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
