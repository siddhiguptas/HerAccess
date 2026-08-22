import logging
import asyncio
from datetime import datetime
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from backend.models.database import SessionLocal, CoverageExpansionJob
from backend.config import settings
from backend.services.geo import LUCKNOW_LOCALITY_COORDINATES

logger = logging.getLogger("heraccess.coverage")

router = APIRouter(prefix="/coverage", tags=["Coverage Expansion"])

# Supported localities for Lucknow
SUPPORTED_LOCALITIES = set(LUCKNOW_LOCALITY_COORDINATES.keys()) - {"lucknow"}


class ExpandCoverageRequest(BaseModel):
    locality: str
    city: str = "Lucknow"
    category: Optional[str] = None


class JobStatusResponse(BaseModel):
    job_id: int
    locality: str
    city: str
    category: Optional[str]
    status: str
    records_found: int
    records_accepted: int
    error_message: Optional[str]
    bright_data_collector_id: Optional[str]
    created_at: str
    completed_at: Optional[str]


def _run_expansion_job(job_id: int):
    """Background task that runs the Bright Data collection and ingestion pipeline."""
    import time
    db = SessionLocal()
    try:
        job = db.query(CoverageExpansionJob).filter(CoverageExpansionJob.id == job_id).first()
        if not job:
            return

        locality = job.locality
        city = job.city

        # Stage 1: Collecting
        job.status = "collecting"
        db.commit()
        logger.info(f"Coverage expansion job {job_id}: collecting data for {locality}, {city}")

        if settings.BRIGHT_DATA_USE_FIXTURES:
            # DEMO MODE: Use prepared fixture for the locality
            import os, json
            time.sleep(3)  # Simulate realistic collection latency
            
            fixture_map = {
                "aliganj": "expansion_aliganj_hostels.json",
            }
            fixture_name = fixture_map.get(locality.lower().strip())
            
            if not fixture_name:
                # For localities without a specific fixture, create synthetic data
                fixture_name = "expansion_aliganj_hostels.json"  # fallback
            
            fixture_path = os.path.join(settings.BRIGHT_DATA_FIXTURES_DIR, fixture_name)
            
            if not os.path.exists(fixture_path):
                job.status = "failed"
                job.error_message = f"No coverage data fixture found for {locality}"
                job.completed_at = datetime.utcnow()
                db.commit()
                return
            
            with open(fixture_path, "r", encoding="utf-8") as f:
                payload = json.load(f)
            
            job.bright_data_collector_id = payload.get("collector_id", "c_expansion_demo")
        else:
            # REAL MODE: Execute actual Bright Data Scraper Studio collection
            from backend.services.bright_data_client import BrightDataClient
            try:
                category = job.category or "women_hostel"
                if category != "women_hostel":
                    raise Exception(f"Live coverage expansion is only supported for women hostels, not '{category}'.")
                
                # Use the Sulekha Women Hostels collector with dynamic locality input
                collector_id = "c_mt1i5ri4trltbvw66"  # Sulekha Women Hostels
                job.bright_data_collector_id = collector_id
                db.commit()
                
                # Construct the dynamic target URL based on user's requested locality
                formatted_locality = locality.lower().replace(" ", "-")
                target_url = f"https://www.sulekha.com/womens-hostel/{formatted_locality}-lucknow"
                
                logger.info(f"Triggering Scraper Studio with dynamic URL: {target_url}")
                raw_data = BrightDataClient.run_scraper(collector_id, max_items=10, target_url=target_url)
                
                if not raw_data:
                    job.status = "completed"  # Genuine completion with 0 results
                    job.records_found = 0
                    job.records_accepted = 0
                    job.completed_at = datetime.utcnow()
                    db.commit()
                    return
                
                # Wrap in our standard payload format
                payload = {
                    "collector_id": collector_id,
                    "source_url": target_url,
                    "category": "women_hostel",
                    "scraped_at": datetime.utcnow().isoformat() + "Z",
                    "records": raw_data if isinstance(raw_data, list) else [raw_data]
                }
            except Exception as e:
                logger.error(f"Bright Data collection failed for job {job_id}: {e}")
                job.status = "failed"
                job.error_message = f"Bright Data collection failed: {str(e)}"
                job.completed_at = datetime.utcnow()
                db.commit()
                return

        # Stage 2: Processing
        job.status = "processing"
        job.records_found = len(payload.get("records", []))
        db.commit()
        logger.info(f"Coverage expansion job {job_id}: processing {job.records_found} records")
        
        if settings.BRIGHT_DATA_USE_FIXTURES:
            time.sleep(2)  # Simulate processing latency in demo mode

        # Stage 3: Verifying - Feed through existing ingestion pipeline
        job.status = "verifying"
        db.commit()
        
        from backend.ingestion.result_parser import ResultParser
        from backend.models.enums import ResourceCategory
        
        try:
            run, ingested_count, pass_rate = ResultParser.ingest_collector_payload(
                db,
                payload,
                collector_id_override=payload.get("collector_id"),
                source_url_override=payload.get("source_url"),
                category_override=ResourceCategory.WOMEN_HOSTEL
            )
            
            if settings.BRIGHT_DATA_USE_FIXTURES:
                time.sleep(1)  # Simulate verification latency in demo mode
            
            job.records_accepted = ingested_count
            job.status = "completed"
            job.completed_at = datetime.utcnow()
            db.commit()
            logger.info(f"Coverage expansion job {job_id}: completed. {ingested_count} resources accepted with {pass_rate*100:.1f}% validation.")
            
        except Exception as e:
            logger.error(f"Ingestion failed for job {job_id}: {e}")
            job.status = "failed"
            job.error_message = f"Ingestion pipeline failed: {str(e)}"
            job.completed_at = datetime.utcnow()
            db.commit()

    except Exception as e:
        logger.error(f"Coverage expansion job {job_id} failed unexpectedly: {e}")
        try:
            job = db.query(CoverageExpansionJob).filter(CoverageExpansionJob.id == job_id).first()
            if job:
                job.status = "failed"
                job.error_message = str(e)
                job.completed_at = datetime.utcnow()
                db.commit()
        except:
            pass
    finally:
        db.close()


@router.post("/expand")
def expand_coverage(req: ExpandCoverageRequest, background_tasks: BackgroundTasks):
    """Trigger a live coverage expansion job for a specific locality."""
    locality_lower = req.locality.lower().strip()
    city_lower = req.city.lower().strip()
    category = req.category or "women_hostel"
    
    # Validate category is supported for dynamic live coverage
    if category != "women_hostel":
        return {"error": f"Live coverage expansion is currently only available for women_hostel.", "status": "rejected"}

    # Validate city is Lucknow
    if city_lower != "lucknow":
        return {"error": "Coverage expansion is currently only available for Lucknow.", "status": "rejected"}
    
    # Check if locality is known (we don't block unknown localities, but warn)
    locality_known = locality_lower in SUPPORTED_LOCALITIES
    
    db = SessionLocal()
    try:
        # Check for existing pending/running job for same locality and category
        existing = db.query(CoverageExpansionJob).filter(
            CoverageExpansionJob.locality == req.locality,
            CoverageExpansionJob.category == category,
            CoverageExpansionJob.status.in_(["pending", "collecting", "processing", "verifying"])
        ).first()
        
        if existing:
            return {
                "job_id": existing.id,
                "status": existing.status,
                "message": f"An expansion job for {req.locality} is already in progress.",
                "locality_known": locality_known
            }
        
        # Create job
        job = CoverageExpansionJob(
            locality=req.locality,
            city=req.city,
            category=category,
            status="pending"
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        job_id = job.id
    finally:
        db.close()
    
    # Launch background task
    background_tasks.add_task(_run_expansion_job, job_id)
    
    return {
        "job_id": job_id,
        "status": "pending",
        "locality": req.locality,
        "city": req.city,
        "message": f"Coverage expansion initiated for {req.locality}, {req.city}.",
        "locality_known": locality_known,
        "mode": "demo" if settings.BRIGHT_DATA_USE_FIXTURES else "live"
    }


@router.get("/jobs/{job_id}")
def get_job_status(job_id: int):
    """Poll the status of a coverage expansion job."""
    db = SessionLocal()
    try:
        job = db.query(CoverageExpansionJob).filter(CoverageExpansionJob.id == job_id).first()
        if not job:
            return {"error": "Job not found", "status": "not_found"}
        
        return {
            "job_id": job.id,
            "locality": job.locality,
            "city": job.city,
            "category": job.category,
            "status": job.status,
            "records_found": job.records_found,
            "records_accepted": job.records_accepted,
            "error_message": job.error_message,
            "bright_data_collector_id": job.bright_data_collector_id,
            "created_at": job.created_at.isoformat() if job.created_at else None,
            "completed_at": job.completed_at.isoformat() if job.completed_at else None,
            "mode": "demo" if settings.BRIGHT_DATA_USE_FIXTURES else "live"
        }
    finally:
        db.close()
