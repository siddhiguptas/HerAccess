import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.models.database import init_db, SessionLocal
from backend.api import search, resources, watch, changes, health, demo
from backend.ingestion.collector_runner import CollectorRunner
from backend.ingestion.result_parser import ResultParser

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("heraccess.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    logger.info("Initializing HerAccess database schema...")
    init_db()

    # Initial data seeding from fixtures if DB is empty
    db = SessionLocal()
    try:
        from backend.models.database import Resource
        res_count = db.query(Resource).count()
        if res_count == 0:
            logger.info("Initial startup: Seeding database from Bright Data collector fixtures...")
            for col in CollectorRunner.get_all_registered_collectors():
                try:
                    payload = CollectorRunner.run_collector(col["collector_id"])
                    run, count, pass_rate = ResultParser.ingest_collector_payload(db, payload)
                    logger.info(f"Ingested {count} records from {col['collector_id']} (pass rate: {pass_rate*100:.1f}%)")
                except Exception as e:
                    logger.error(f"Error ingesting fixture {col['collector_id']}: {e}")
        else:
            logger.info(f"Database already contains {res_count} verified resources.")
    finally:
        db.close()

    yield
    logger.info("HerAccess backend shutting down.")

app = FastAPI(
    title="HerAccess API",
    description="Verified Local Access & Support Navigator for Women in New Cities",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development allow all for seamless frontend pairing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(search.router)
app.include_router(resources.router)
app.include_router(watch.router)
app.include_router(changes.router)
app.include_router(health.router)
app.include_router(demo.router)

@app.get("/")
def root():
    return {
        "product": "HerAccess",
        "tagline": "Verified Local Access & Support Navigator for Women",
        "hackathon": "Into the Scrape-Verse with Bright Data",
        "docs_url": "/docs",
        "status": "online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
