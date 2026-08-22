# HerAccess

**A verified local access and support navigator for women relocating to new cities.**

HerAccess aggregates, cross-validates, and continuously monitors women's accommodations, public healthcare, transit networks, emergency helplines, and support services — scraped from primary public sources using **Bright Data Scraper Studio** — into a single searchable, map-first interface.

> Built for the **Into the Scrape-Verse Hackathon** (WeMakeDevs × Bright Data) · Aug 2026

---

## 🛠️ Engineering Quality & Architecture

HerAccess is designed as a **Strictly Layered Modular Monolith**. We avoided microservice bloat to focus on extreme data reliability and maintainability.

### The Architecture Rule
The codebase enforces an explicit dependency direction verified automatically in CI via Python AST parsing (`tests/test_architecture.py`):
`API Routes ➔ Business Services ➔ Domain Logic ➔ Repositories ➔ Database Models`

### Key Architectural Decisions
- **Bright Data Boundary:** The system strictly isolates all Bright Data CLI invocations into a single infrastructure adapter (`BrightDataClient`). Business rules never touch subprocesses.
- **EAV Database Pattern:** Uses an Entity-Attribute-Value (EAV) model in SQLite/SQLAlchemy to trace every single data point back to its original Bright Data extraction (Collector ID, URL, Date, and Snapshot).
- **Frontend State:** Eliminates React prop-drilling via a unified `AppContext`, keeping components purely functional without requiring Redux.
- **The Role of Fixtures:** The `fixtures/` directory provides deterministic static JSON inputs. It is intentionally included to allow the test suite to run instantaneously without burning Bright Data credits, to automatically seed the database upon initial bootstrap, and to act as a resilient offline fallback during live demo mode if API rate limits are exceeded.

---

## The Problem

Women relocating for education or employment in Indian cities face fragmented, unverified, and frequently stale information scattered across dozens of disconnected sources — individual hostel sites, government portals, listing directories, and helpline pages — each with different update cycles, different structure, and zero provenance.

**HerAccess is built to fill that gap.** Not by building a database by hand, but by building a live, self-maintaining scraping infrastructure that pulls directly from primary sources, cross-validates every claim, and shows the evidence behind every value displayed to the user.

---

## How HerAccess Works

### Step 1 — Scraping Primary Sources with Bright Data
HerAccess does not aggregate from aggregators. It scrapes the original authoritative pages directly — the hostel's own website, the KGMU hospital portal, the UP Police government site, the Lucknow Metro authority site — using **12 registered Bright Data Scraper Studio collectors**.

Every extracted attribute carries six pieces of metadata: the raw extracted value, the normalised value, the source URL, the collector ID, the extraction timestamp, and a verbatim evidence excerpt from the page — so every claim displayed can be traced directly to its origin.

### Step 2 — Ingestion, Normalisation, and Conflict Detection
Raw scraper output passes through a deterministic normalisation pipeline to standardise prices, curfew timings, and boolean fields. When two independent collectors report different values for the same field on the same resource, HerAccess preserves both values with their sources and surfaces them explicitly in the Conflicts view.

### Step 3 — Matching, Ranking, and the Proximity Mesh
Search queries (English/Hinglish) are parsed into a structured intent (city, budget, locality, etc.). Results are ranked by a **fully transparent, deterministic scoring function**. There are no opaque model scores.

For every hostel result, the system computes Haversine distances to the five nearest ecosystem resources — metro station, public hospital, 24-hour pharmacy, police women help desk, and women support centre — and surfaces them as an expandable Local Support Chain.

### Step 4 — Self-Healing Scraper Pipeline
When a target website changes its HTML structure, the collector begins returning empty or malformed fields. HerAccess detects this through schema validation and automatically generates a problem description, then invokes the Bright Data CLI heal command:
```bash
npx @brightdata/cli scraper heal c_hostel_sulekha_01 \
  "Price, curfew, and contact fields stopped extracting after source website restructure." \
  --auto-approve --json
```

---

## 🚀 Setup & Validation Workflow

### Requirements
- Python 3.11+
- Node.js 18+

### 1. Verify Project Health (The Quality Workflow)
The project includes a single `make` command to validate the entire codebase. This runs all **55 backend pytest cases** (including Bright Data characterization snapshots) and compiles the frontend TypeScript flawlessly.
```bash
make all
```

### 2. Start the Backend API
```bash
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Bright Data Collectors (Scraper Studio)

| Collector ID | Target Source | Category | Data |
|---|---|---|---|
| `c_mt1f0ke713h6n32pi4` | kamlagirlshostel.com | Women's Hostel | Live |
| `c_mt1i5ri4trltbvw66` | sulekha.com/womens-hostel/lucknow | Women's Hostel (Directory) | Live |
| `c_mt1ftf047f6ulzznq` | upmetrorail.com | Public Transport | Fixture |
| `c_mt1fujyq16vhxxfg7x` | kgmu.org | Hospital | Live |
| `c_mt1fuw0q54wsjtyfq` | apollopharmacy.in | Pharmacy | Fixture |
| `c_mt1fv0wlyfkwe8z5y` | 1090up.in | Women Support | Live |
| `c_police_up_01` | uppolice.gov.in | Police / Public Support | Live |
| `c_mt1nlu1w3pkwb2h1i` | en.wikipedia.org/wiki/Lucknow_Metro | Public Transport | Live |
| `c_mt1ogapv1t1nhs5rht` | apollohospitals.com/lucknow | Hospital | Live |
| `c_mt1palv71amwtj4yp4` | lkouniv.ac.in/en/page/hostels | Women's Hostel | Live |
| `c_mt1qwsbmqm9fi1vu6` | mahilakalyan.up.nic.in | Women Support | Live |
| `c_hostel_sulekha_01` | sulekha.com | Women's Hostel | Self-healing test target |

*(Note: Fixture fallbacks are included to ensure seamless demo continuity when internet or Bright Data limits are reached. These are visibly badged in the UI as `[FIXTURE DATA]`.)*
