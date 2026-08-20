import os
import json
import logging
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.config import settings
from backend.models.enums import ResourceCategory, CollectorStatus, CollectionRunStatus

logger = logging.getLogger("heraccess.collector_runner")

# Collector Registry Definitions
COLLECTOR_REGISTRY = [
    {
        "collector_id": "c_mt1f0ke713h6n32pi4",
        "aliases": ["c_hostel_kamla_01"],
        "name": "Kamla Girls Hostel Extractor",
        "category": ResourceCategory.WOMEN_HOSTEL,
        "target_url": "https://kamlagirlshostel.com/",
        "fixture_file": "kamla_hostel.json",
        "extraction_prompt": "Extract hostel name, address and locality, room accommodation types, monthly rent price with meal details, whether strictly female/women only if stated, curfew or gate closing timings, contact phone numbers, listed facilities/amenities, source URL, and published date if available.",
        "is_real_collector": True
    },
    {
        "collector_id": "c_mt1i5ri4trltbvw66",
        "aliases": ["c_hostel_sulekha_real"],
        "name": "Sulekha Lucknow Women Hostels Real Extractor",
        "category": ResourceCategory.WOMEN_HOSTEL,
        "target_url": "https://www.sulekha.com/womens-hostel/lucknow",
        "fixture_file": "sulekha_real_run.json",
        "extraction_prompt": "Extract women's hostels in Lucknow including hostel name, locality, full address, services offered, rating, and source URL.",
        "is_real_collector": True,
        "is_directory_source": True
    },
    {
        "collector_id": "c_mt1ftf047f6ulzznq",
        "aliases": ["c_metro_upmrc_01"],
        "name": "UPMRC Lucknow Metro Network & Timings Extractor",
        "category": ResourceCategory.PUBLIC_TRANSPORT,
        "target_url": "https://www.upmetrorail.com/",
        "fixture_file": "metro_upmrc.json",
        "extraction_prompt": "Extract metro station names, route line, operational timings, fare details, station facilities and source URL.",
        "is_real_collector": True
    },
    {
        "collector_id": "c_mt1fujyq16vhxxfg7x",
        "aliases": ["c_hospital_district_01"],
        "name": "KGMU & District Public Healthcare Extractor",
        "category": ResourceCategory.HOSPITAL,
        "target_url": "https://kgmu.org/",
        "fixture_file": "real_kgmu_hospital.json",
        "extraction_prompt": "Extract hospital name, address, emergency 24x7 services, key departments, OPD timings, contact phone numbers and source URL.",
        "is_real_collector": True
    },
    {
        "collector_id": "c_mt1fuw0q54wsjtyfq",
        "aliases": ["c_pharmacy_jd_01"],
        "name": "Apollo Pharmacy 24x7 Chemists Extractor",
        "category": ResourceCategory.PHARMACY,
        "target_url": "https://www.apollopharmacy.in/",
        "fixture_file": "lucknow_pharmacies.json",
        "extraction_prompt": "Extract 24x7 pharmacy store names in Lucknow, street address, locality, 24-hour service status, phone numbers and source URL.",
        "is_real_collector": True
    },
    {
        "collector_id": "c_mt1fv0wlyfkwe8z5y",
        "aliases": ["c_police_up_01", "c_support_1090_01"],
        "name": "UP Police Women Power Line 1090 Extractor",
        "category": ResourceCategory.WOMEN_SUPPORT,
        "target_url": "https://1090up.in/",
        "fixture_file": "women_support_centres.json",
        "extraction_prompt": "Extract women support centres, Sakhi One Stop Centre, UP 1090 helplines, addresses, 24x7 phone, and counseling services.",
        "is_real_collector": True
    },
    {
        "collector_id": "c_mt1nlu1w3pkwb2h1i",
        "aliases": ["c_metro_lucknow_real"],
        "name": "Lucknow Metro Operational Stations Extractor",
        "category": ResourceCategory.PUBLIC_TRANSPORT,
        "target_url": "https://en.wikipedia.org/wiki/Lucknow_Metro",
        "fixture_file": "real_transport_run.json",
        "extraction_prompt": "Extract Lucknow Metro operational stations including station name, line, station status, terminal or interchange information, opening date, and coordinates if available.",
        "is_real_collector": True,
        "is_secondary_public_source": True
    },
    {
        "collector_id": "c_mt1ogapv1t1nhs5rht",
        "aliases": ["c_hospital_apollo_real"],
        "name": "Apollo Hospitals Lucknow 24x7 Emergency & Trauma Extractor",
        "category": ResourceCategory.HOSPITAL,
        "target_url": "https://www.apollohospitals.com/hospitals/apollo-hospitals-lucknow",
        "fixture_file": "real_hospital_apollo_run.json",
        "extraction_prompt": "Extract hospital name, address, emergency availability, emergency phone number, contact phone, departments, trauma capabilities, women gynaecology services, and website URL.",
        "is_real_collector": True
    },
    {
        "collector_id": "c_mt1palv71amwtj4yp4",
        "aliases": ["c_hostel_lkouniv_real"],
        "name": "University of Lucknow Women's Hostels Extractor",
        "category": ResourceCategory.WOMEN_HOSTEL,
        "target_url": "https://www.lkouniv.ac.in/en/page/hostels",
        "fixture_file": "real_lkouniv_hostels_run.json",
        "extraction_prompt": "Extract all girls hostels: hostel_name, campus, capacity, room_occupancy, facilities, mess_canteen, dispensary_medical, warden_contact, phone, email, source_url.",
        "is_real_collector": True
    },
    {
        "collector_id": "c_mt1qwsbmqm9fi1vu6",
        "aliases": ["c_women_support_up_real"],
        "name": "UP Mahila Kalyan Women Support & Emergency Helplines Extractor",
        "category": ResourceCategory.WOMEN_SUPPORT,
        "target_url": "https://mahilakalyan.up.nic.in/",
        "fixture_file": "real_women_support_run.json",
        "extraction_prompt": "Extract women safety and crisis support services: organization_name, department_name, state, city, women_helpline_181, women_powerline_1090, police_assistance_112, childline_1098, office_contact_phone, mission_shakti_support, official_portal_url",
        "is_real_collector": True
    },
    {
        "collector_id": "c_hostel_sulekha_01",
        "name": "Sulekha Lucknow Women Hostels Extractor (Self-Healing Demo Target)",
        "category": ResourceCategory.WOMEN_HOSTEL,
        "target_url": "https://www.sulekha.com/hostels/lucknow/womens-hostels",
        "fixture_file": "sulekha_hostels.json",
        "extraction_prompt": "Extract women's hostels in Lucknow including name, address, monthly rent, curfew, facilities, and contact number.",
        "is_real_collector": False
    }
]

# Global simulation state for demo mode
DEMO_STATE = {
    "is_broken": False,
    "broken_collector_id": "c_hostel_sulekha_01",
    "broken_fields": ["monthly_price", "curfew_time", "contact"],
    "is_healed": False,
    "healing_in_progress": False,
    "last_healed_at": None,
    "heal_description": None
}

class BaseCollectorRunner(ABC):
    """Abstract Interface for Collector Execution."""
    @abstractmethod
    def run(self, collector_id: str, col_meta: Dict[str, Any]) -> Dict[str, Any]:
        pass

class FixtureCollectorRunner(BaseCollectorRunner):
    """
    Deterministic Fixture-driven runner.
    Loads and serves realistic scraper outputs without consuming Bright Data credits.
    Supports controlled break/heal state simulations for judge walkthroughs.
    """
    def run(self, collector_id: str, col_meta: Dict[str, Any]) -> Dict[str, Any]:
        fixture_file = col_meta["fixture_file"]
        fixture_path = os.path.join(settings.BRIGHT_DATA_FIXTURES_DIR, fixture_file)

        if not os.path.exists(fixture_path):
            raise FileNotFoundError(f"Fixture file {fixture_path} not found.")

        with open(fixture_path, "r", encoding="utf-8") as f:
            payload = json.load(f)

        # Apply Demo Break Simulation if active on this collector
        if DEMO_STATE["is_broken"] and collector_id == DEMO_STATE["broken_collector_id"] and not DEMO_STATE["is_healed"]:
            logger.warning(f"Simulating extraction layout breakage for collector {collector_id}")
            broken_records = []
            for rec in payload.get("records", []):
                broken_rec = json.loads(json.dumps(rec))
                # Nullify the broken fields
                for field in DEMO_STATE["broken_fields"]:
                    if field in broken_rec.get("attributes", {}):
                        broken_rec["attributes"][field] = None
                    if field in broken_rec:
                        broken_rec[field] = None
                broken_records.append(broken_rec)
            payload["records"] = broken_records

        return payload

class BrightDataCollectorRunner(BaseCollectorRunner):
    """
    Live Bright Data Integration Runner.
    Executes actual Bright Data Scraper Studio runs via CLI `npx @brightdata/cli scraper run`
    and falls back safely if network or collector is unavailable.
    """
    def run(self, collector_id: str, col_meta: Dict[str, Any]) -> Dict[str, Any]:
        import subprocess
        target_url = col_meta.get("target_url")
        cmd = ["npx", "@brightdata/cli", "scraper", "run", collector_id]
        if target_url:
            cmd.append(target_url)

        try:
            logger.info(f"Executing live Bright Data Scraper: {' '.join(cmd)}")
            res = subprocess.run(cmd, capture_output=True, text=True, shell=True, timeout=120)
            if res.returncode == 0 and res.stdout:
                out = res.stdout.strip()
                # Locate JSON payload in stdout
                start_idx = -1
                for i, c in enumerate(out):
                    if c in ['[', '{']:
                        start_idx = i
                        break
                if start_idx != -1:
                    raw_data = json.loads(out[start_idx:])
                    return {
                        "collector_id": collector_id,
                        "target_url": target_url,
                        "run_id": f"run_{int(datetime.utcnow().timestamp())}",
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "status": "success",
                        "records": raw_data if isinstance(raw_data, list) else [raw_data]
                    }
            logger.warning(f"Bright Data CLI returned code {res.returncode}: {res.stderr}. Using cached payload.")
        except Exception as e:
            logger.warning(f"Live CLI scraper execution failed for {collector_id}: {e}. Using cached payload.")

        # Safe fallback to fixture
        return FixtureCollectorRunner().run(collector_id, col_meta)

class CollectorRunner:
    """Primary Facade providing access to collectors and dispatching execution."""
    _fixture_runner = FixtureCollectorRunner()
    _bright_data_runner = BrightDataCollectorRunner()

    @classmethod
    def get_all_registered_collectors(cls) -> List[Dict[str, Any]]:
        return COLLECTOR_REGISTRY

    @classmethod
    def get_collector_meta(cls, collector_id: str) -> Optional[Dict[str, Any]]:
        for col in COLLECTOR_REGISTRY:
            if col["collector_id"] == collector_id or collector_id in col.get("aliases", []):
                return col
        return None

    @classmethod
    def run_collector(cls, collector_id: str) -> Dict[str, Any]:
        """
        Dispatches collector run based on settings.BRIGHT_DATA_USE_FIXTURES.
        """
        col_meta = cls.get_collector_meta(collector_id)
        if not col_meta:
            raise ValueError(f"Collector {collector_id} is not registered.")

        if settings.BRIGHT_DATA_USE_FIXTURES:
            return cls._fixture_runner.run(collector_id, col_meta)
        else:
            return cls._bright_data_runner.run(collector_id, col_meta)
