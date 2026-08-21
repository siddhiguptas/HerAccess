# HerAccess

**A verified local access and support navigator for women relocating to new cities.**

HerAccess aggregates, cross-validates, and continuously monitors women's accommodations, public healthcare, transit networks, emergency helplines, and support services — scraped from primary public sources using Bright Data Scraper Studio — into a single searchable, map-first interface.

> Built for the **Into the Scrape-Verse Hackathon** (WeMakeDevs × Bright Data) · Aug 2026

---

## The Problem

Priya is 20 years old. She has just been admitted to Lucknow University for a postgraduate degree and has two weeks to find accommodation before her semester begins — from her hometown 600 km away, with no contacts in the city.

She starts searching. The university website lists hostel names but no fees, no availability, no curfew timings. She finds Sulekha listings with rent numbers from 2022. She calls a phone number — disconnected. A Facebook group post recommends a hostel in Aliganj, but she has no idea if it is near the university, near a hospital, or near a metro station. She does not know which government hospital has a 24-hour emergency ward. She cannot find whether the 1090 Women Power Line operates near her area.

There is no single trusted place to check all of this.

Women relocating for education or employment in Indian cities face fragmented, unverified, and frequently stale information scattered across dozens of disconnected sources — individual hostel sites, government portals, listing directories, and helpline pages — each with different update cycles, different structure, and zero provenance.

**HerAccess is built to fill that gap.** Not by building a database by hand, but by building a live, self-maintaining scraping infrastructure that pulls directly from primary sources, cross-validates every claim, and shows the evidence behind every value displayed to the user.

---

## How HerAccess Works

### Step 1 — Scraping Primary Sources with Bright Data

HerAccess does not aggregate from aggregators. It scrapes the original authoritative pages directly — the hostel's own website, the KGMU hospital portal, the UP Police government site, the 1090 Women Power Line page, the Lucknow Metro authority site — using 12 registered Bright Data Scraper Studio collectors.

Each collector is created with a natural language extraction prompt via the Bright Data CLI:

```bash
npx @brightdata/cli scraper create "https://kamlagirlshostel.com/" \
  "Extract hostel name, locality, room types, monthly rent with meal details, \
   whether strictly women-only, curfew timings, contact numbers, facilities." \
  --name heraccess-kamla-hostel --json
```

Every extracted attribute carries six pieces of metadata: the raw extracted value, the normalised value, the source URL, the collector ID, the extraction timestamp, and a verbatim evidence excerpt from the page — so every claim displayed can be traced directly to its origin.

### Step 2 — Ingestion, Normalisation, and Conflict Detection

Raw scraper output passes through a deterministic normalisation pipeline:

- **Prices** are extracted from varied text (₹8,500/month, Rs. 8500 pm, 8.5k) and standardised to a numeric monthly figure.
- **Curfew timings** are converted to 24-hour format regardless of source representation.
- **Boolean fields** (women-only, meals included, 24-hour availability) are resolved from natural language strings.

When two independent collectors report different values for the same field on the same resource — one source says curfew is 9 PM, another says 10 PM — HerAccess does not silently pick one. Both values are preserved with their sources and surfaced explicitly in the Conflicts view.

### Step 3 — Matching, Ranking, and the Proximity Mesh

Every search query — typed in plain English or Hinglish — is parsed into a structured intent: city, user type (student or working professional), budget ceiling, locality preference, and required ecosystem categories.

Results are ranked by a fully transparent, deterministic scoring function. There are no opaque model scores or unexplained percentages. Each factor is shown to the user as a plain-language reason:

| Factor | Max Points | Condition |
|---|---|---|
| Budget fit | 2.0 | Monthly rent ≤ requested budget |
| Women-only verified | 2.0 | Confirmed in source evidence |
| Distance from target | 2.0 | Within requested radius |
| Public transport nearby | 2.0 | Metro / bus hub within range |
| Hospital nearby | 2.0 | Government / 24-hour emergency |
| Data freshness GREEN | 2.0 | Verified within last 24 hours |
| High confidence source | 2.0 | Official domain, verbatim evidence |
| Multi-source corroboration | 1.5 | ≥ 2 independent collectors agree |

For every hostel result, the system also computes Haversine distances to the five nearest ecosystem resources — metro station, public hospital, 24-hour pharmacy, police women help desk, and women support centre — and surfaces them as an expandable Local Support Chain on each card.

### Step 4 — Self-Healing When Websites Change

When a target website changes its HTML structure, the collector begins returning empty or malformed fields. HerAccess detects this through schema validation and automatically generates a problem description, then invokes the Bright Data CLI heal command:

```bash
npx @brightdata/cli scraper heal c_hostel_sulekha_01 \
  "Price, curfew, and contact fields stopped extracting after source website restructure." \
  --auto-approve --json
```

Exit code 0 is required for the heal to be marked resolved. Any non-zero exit code is reported as a failure with the full CLI output. The collector ID is preserved throughout — no downstream database references break.

---

## How to Use HerAccess

### Finding a Safe Hostel

Type a query the way you would ask a friend:

> *"I need a women's hostel in Lucknow near Lucknow University, under ₹10,000 a month, with meals"*

> *"hostel chahiye Lucknow mein, budget 8000 hai, metro ke paas ho"*

HerAccess parses your query, understands your budget, preferred locality, and whether you need meals or transport access, and returns ranked results with the reasoning behind each ranking visible directly on the card.

### Understanding the Evidence

Every data point shown — the rent figure, the curfew time, a hospital's emergency status — has a source button next to it. Click it to open the Evidence panel, which shows:

1. The field name and extracted value
2. A verbatim text excerpt from the original page
3. The URL of the source page
4. The Bright Data collector ID that retrieved it
5. The extraction timestamp
6. The verification confidence level

If data is older than 7 days, a yellow badge appears. Older than that, a red badge. Nothing is displayed without disclosing when it was last verified.

### Checking the Local Support Chain

Each hostel card has an expandable Support Chain section showing — with real Haversine-computed distances — the nearest:

- 🚇 Metro station (with line and operating hours)
- 🏥 Public hospital (with emergency availability)
- 💊 24-hour pharmacy
- 🛡️ Police women help desk
- 🤝 Women support centre or helpline

These are not hardcoded. Distances are computed at query time from actual coordinates of the hostel and each ecosystem resource in the database.

### Watching for Changes

Add any resource to your Watchlist. HerAccess tracks field-level changes between successive scraper runs — if the rent changes, the curfew time is updated, or a phone number is corrected — and surfaces this in the Live Changes Feed with the old value, new value, source, and detection timestamp.

### What Each Category Shows

| Category | Key Fields |
|---|---|
| Women's Hostels | Rent range · Curfew · Occupancy · Meals · Facilities |
| Hospitals | Emergency availability · Departments · Trauma designation |
| Pharmacies | 24-hour status · Home delivery · Inventory notes |
| Metro / Transport | Line · Operating hours · Fare range · Women's coach |
| Police / Help Desks | Helpline number · Officer designation · Jurisdiction |
| Women Support Centres | Services · Hours · Contact number |

---

## What We Are Planning Next

### Short Term

- **Multi-city expansion.** The architecture is fully city-agnostic. Each city requires registering new collectors and adding locality coordinates to the geo index. Pune, Jaipur, and Bhopal are the next candidates, each with strong university hostel ecosystems and fragmented local information.
- **Push alerts on watchlisted resources.** When a field changes on a resource in a user's watchlist, send a notification rather than requiring the user to check the feed manually.
- **Expanded Hinglish vocabulary.** Extend the deterministic parser's keyword and city vocabulary and improve the Gemini fallback for multi-constraint queries.

### Medium Term

- **Broader collector coverage per city.** Current Lucknow coverage focuses on hostel, transport, hospital, pharmacy, police, and women support. Adding PG aggregator listings (Hostel360, NoBroker), government health subcentres, and UPSRTC city bus route data would give more complete neighbourhood-level coverage.
- **Conflict resolution workflow.** Currently, conflicting values from two sources are displayed side by side. A future version would allow the system to flag conflicts for a trusted verifier to resolve, with the resolution stored in the provenance chain.
- **Safety density map layer.** A map layer showing neighbourhood-level density of hospitals, pharmacies, and women's support resources across the city, letting a user evaluate an area before searching for specific accommodation.

### Longer Term

- **User-contributed verification.** Allow women who have lived in a listed hostel to confirm or dispute specific field values, with their contribution added to the provenance chain as a third source type alongside scraper data and government data.
- **Legal aid and documentation resources.** Add a resource category for legal aid centres, free counselling, and documentation support services available under government schemes, scraped from WCD and state commission portals.

---

## Technical Architecture

```
  Bright Data Cloud (Scraper Studio)
          |
          | npx @brightdata/cli scraper run / heal
          v
  Ingestion Pipeline
    CollectorRunner -> ResultParser -> FieldNormaliser
                                            |
                                            v
    ConflictDetector <- CategoryValidator <- EntityResolver
          |
          v
  SQLite Database (SQLAlchemy ORM)
    Resources · ResourceAttributes · Evidence · CollectionRuns
    ResourceChangeEvents · Snapshots
          |
          v
  Backend Services
    IntentParser -> GeoService (Haversine) -> TransparentRankingEngine -> MatchingEngine
          |
          v
  FastAPI REST API
    /search · /resources · /conflicts · /changes · /heal · /watchlist
          |
          v
  React 18 + TypeScript Frontend (Vite)
    SearchHero · MapView (Leaflet) · ResourceCard · EvidenceModal
    ChangesFeed · ScraperHealthCenter · DemoControlPanel · WatchlistDrawer
```

### Intent Parser

Accepts free-form queries in English or Hinglish. If a Gemini API key is configured, it invokes `gemini-1.5-flash` with a structured JSON schema prompt. If the API is unavailable, it falls back to a fully deterministic rule engine that extracts city, locality, budget (with ₹/Rs/k/thousand normalisation), user type, required ecosystem categories, and preferences using regex and keyword matching. Either path produces an identical `ParsedIntent` schema — the frontend never sees the difference.

### Geo Engine

Implements Haversine distance calculation with the full spherical Earth radius (6,371 km). Locality-to-coordinate resolution uses a curated index of 55+ Lucknow localities, neighbourhoods, and metro stations. City-level fallback uses centroids for 12 major Indian cities. The `build_local_support_chain` method queries the database for the nearest resource in each of the five ecosystem categories and returns real computed distances, not estimated values.

### Change Detector

On each successive scrape, the `ChangeDetector` compares the new attribute payload against the most recent snapshot for that resource and collector. The first observation establishes a baseline with no change events generated. Subsequent observations produce `ChangeEvent` records only when values genuinely differ — covering field-added, field-modified, and field-removed cases. Each event stores old value, new value, field name, detection timestamp, source URL, and collector ID.

### Freshness Tiers

The `FreshnessCalculator` classifies any `observed_at` timestamp into one of three tiers:

- **GREEN** — verified within the last 24 hours
- **YELLOW** — verified within the last 1–7 days
- **RED** — last verified more than 7 days ago

Freshness feeds directly into the ranking score (+2 for GREEN, +1 for YELLOW, 0 for RED) and is displayed as a colour-coded badge on every resource card and in the evidence modal.

### Transparent Ranking

The `TransparentRankingEngine` evaluates up to 9 factors and returns both a numeric score and a list of `RankingFactor` objects — each with a human-readable label, a score contribution, and a matched boolean. These factors are shown in the "Why This Result?" panel on each card, making every ranking decision fully auditable by the user with no black-box inference involved.

---

## Collectors

| Collector ID | Source | Category | Data |
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
| `c_hostel_sulekha_01` | sulekha.com | Women's Hostel | Self-healing demo target |

Fixture collectors run against the Bright Data CLI and fall back to a local JSON file when the live endpoint returns no usable payload. The self-healing demo target (`c_hostel_sulekha_01`) is used only for controlled failure injection and does not feed production data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Scraping | Bright Data Scraper Studio, `@brightdata/cli` |
| Backend | Python 3.11, FastAPI, SQLAlchemy, SQLite |
| Geo | Custom Haversine implementation |
| Intent Parsing | Deterministic rule engine + optional Gemini 1.5 Flash |
| Frontend | React 18, TypeScript, Vite, Leaflet |
| Styling | Tailwind CSS |
| Testing | pytest (49 tests) |

---

## Setup

### Requirements

- Python 3.11+
- Node.js 18+
- npm

### Backend

```bash
git clone https://github.com/siddhiguptas/HerAccess.git
cd HerAccess

pip install -r backend/requirements.txt

# Run tests
pytest -v

# Start API server at http://127.0.0.1:8000
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd frontend

npm install

# Start dev server at http://localhost:5173
npm run dev
```

### Environment Variables (optional)

Copy `.env.example` to `.env`:

```
BRIGHTDATA_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here   # enables LLM-assisted query parsing
```

Both keys are optional. The system runs fully without them using fixture data and the deterministic intent parser.

---

## Data Scope and Limitations

- **Geographic scope**: Lucknow, Uttar Pradesh, India. The architecture is city-agnostic and can be extended to any city by registering new collectors and adding locality coordinates to the geo index.
- **Public data only**: All information is extracted from publicly accessible websites. Displayed values represent the state of source pages at the time of extraction. Rent figures, curfew timings, and contact numbers should be confirmed directly with providers before any decision is made.
- **Fixture data**: Metro (UPMRC) and pharmacy (Apollo) collectors fall back to fixture files when the live endpoint returns no usable payload. These are clearly labelled in the UI with a `[FIXTURE DATA]` badge and are never presented as live Bright Data output.
- **No personal data**: HerAccess collects no user data. The watchlist is stored in browser `localStorage` only.
