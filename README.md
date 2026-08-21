# HerAccess -- Verified Local Access & Support Navigator for Women

> **Into the Scrape-Verse Hackathon** (WeMakeDevs x Bright Data)
> Powered by **Bright Data Scraper Studio & CLI**, FastAPI, React/TypeScript, Leaflet, and SQLite.

---

## 1. Problem & Context

When women relocate to a new city for education or employment, finding safe, affordable accommodation and surrounding critical infrastructure is fragmented and fraught with uncertainty:

1. **Information Fragmentation**: Women's hostels, public hospitals, 24-hour pharmacies, metro transit networks, and dedicated women's police helpdesks live on separate, disparate websites without a unified graph.
2. **Aggregator Limitations**: Commercial aggregators and directories prioritise sponsored placements, often lack granular female-safety details (such as strict gate-closing curfews or vegetarian-only meal mandates), and lack verifiable proof for their listings.
3. **Stale and Unverified Claims**: Rent prices and contact numbers change rapidly, leading to wasted transit time or unsafe situations.

### How Bright Data Solves This

Bright Data's **Scraper Studio** and **Web Unlocker** infrastructure allows HerAccess to:

- Autonomously scrape unstructured, long-tail local provider domains without manual parser maintenance.
- Extract granular text claims (room configurations, monthly rent, curfew ranges, rules).
- Retain exact **source provenance, URLs, and extraction timestamps** for full auditability.
- Utilise **AI-driven Self-Healing (`bdata scraper heal`)** to automatically recover broken extractors when target websites update their DOM layout -- preserving the **same Collector ID** without breaking downstream systems.

---

## 2. Core Features

### Natural-Language Search with Deterministic Ranking

Query: *"I'm moving to Lucknow for college. Find a women's hostel under 12,000 with healthcare and public transport nearby."*

The query is parsed into structured requirements (`city`, `user_type`, `budget_max`, `required_categories`, `preferences`) and scored with a fully explainable, deterministic factor engine -- no opaque AI hallucinations.

### Cross-Source Hostel Intelligence and Safe Deduplication

- Merges verified direct-source provider sites (e.g. Kamla Girls Hostel) with multi-listing discovery directories (e.g. Sulekha).
- Distinguishes **Direct Source (High Verification)** from **Directory Listing (Medium Verification)**.
- Awards multi-source trust bonus points for corroborated records.

### Category-Specific Resource Cards

Each resource category renders only the fields relevant to it:

- **Hostels**: rent range, curfew/gate time, occupancy type, meals included.
- **Hospitals**: emergency availability, departments, trauma designation.
- **Pharmacies**: 24-hour availability, home delivery, inventory notes.
- **Metro**: line name, operating hours, fare range, women's coach availability.
- **Women Help**: helpline number, officer type, jurisdiction.
- **Support Centres**: services offered, languages, operating hours.

No cross-category field pollution. All values are sourced from `ResourceAttribute` records in the database, never hardcoded.

### 6-Step Verifiable Provenance

Every claimed fact displays:
`Claim -> Extracted Value -> Source URL -> Collector ID -> Observed Timestamp -> Verification Status`

### 5-Point Local Support Ecosystem Mesh

Computes Haversine proximity from each hostel to the nearest metro station, public hospital, 24-hour chemist, and women's police helpdesk.

### Freshness Tracking and Conflict Detection

- Freshness tiers: GREEN (under 24h), YELLOW (1-7 days), RED (over 7 days).
- Detects cross-source discrepancies (e.g. direct provider states 10,000 while directory lists 11,000) and displays both facts side-by-side.

### Live Changes Feed

Genuine data-driven change detection using temporal snapshot diffs. Every row in the feed traces back to a real `ResourceChangeEvent` record with a `collector_id`, `old_value`, `new_value`, and `detected_at` timestamp. No hardcoded rows.

### Real Bright Data Self-Healing

- Controlled failure injection drops schema validation to 0%.
- Clicking **"Run bdata scraper heal"** executes the actual Bright Data CLI command via subprocess (not a simulation).
- The application validates `returncode == 0` strictly. Any non-zero exit code is reported as a failure with the exact CLI output shown.
- Subprocess timeout is set to **300 seconds** to allow sufficient time for the AI selector-repair process.
- The UI reports the exact CLI command, return code, stdout/stderr, and execution duration.

### Scraper Health Center

Live telemetry across all registered collectors: run history, record counts, validation rates, and crawler diagnostics.

---

## 3. Registered Bright Data Collectors

| Category | Source Domain | Collector ID | Status | Provenance Level |
|---|---|---|---|---|
| Women's Hostel (Direct) | `https://kamlagirlshostel.com/` | `c_mt1f0ke713h6n32pi4` | LIVE REAL DATA | Direct Primary Source (High) |
| Women's Hostel (Directory) | `https://www.sulekha.com/womens-hostel/lucknow` | `c_mt1i5ri4trltbvw66` | LIVE REAL DATA | Directory Listing (Medium) |
| Healthcare / Hospitals | `https://kgmu.org/` | `c_mt1fujyq16vhxxfg7x` | LIVE REAL DATA | Direct University Hospital (High) |
| Public Transport | `https://www.upmetrorail.com/` | `c_mt1ftf047f6ulzznq` | Fixture Fallback | Public Transit Authority |
| 24x7 Pharmacy | `https://www.apollopharmacy.in/` | `c_mt1fuw0q54wsjtyfq` | Fixture Fallback | Pharmacy Directory |
| Women Support / Police | `https://1090up.in/` | `c_mt1fv0wlyfkwe8z5y` | Fixture Fallback | State Helpline and Support |
| Self-Healing Target | `https://www.kamlagirlshostel.com/` | `c_mt1f0ke713h6n32pi4` | REAL HEAL TARGET | Direct Provider |

---

## 4. System Architecture

```
                                  +-------------------------------+
                                  |      Bright Data Cloud        |
                                  |   (Scraper Studio & Scrapers) |
                                  +---------------+---------------+
                                                  | npx @brightdata/cli
                                                  v
+----------------------------------------------------------------------------------+
| HerAccess Ingestion & Verification Pipeline                                      |
|                                                                                  |
|  [Collector Runner] --> [Result Parser] --> [Field Normalizer]                   |
|                                                    |                             |
|                                                    v                             |
|  [Conflict Detector] <-- [Category Validator] <-- [Entity Resolver]              |
|          |                                                                       |
|          v                                                                       |
|  [SQLite Database: Resources, Attributes, Evidence, Runs, Changes]               |
+-----------------------------------------+----------------------------------------+
                                          |
                                          v
+----------------------------------------------------------------------------------+
| Deterministic Matching & Graph Engine                                            |
|                                                                                  |
|  - Natural Language Intent Parser (Regex & Keyword Mapping)                      |
|  - Haversine 5-Point Geo Mesh (Hostel -> Transit -> Hospital -> Chemist -> Help) |
|  - Transparent Ranking Engine (Explainable Factor Scoring)                       |
|  - Freshness Calculator (Green <24h / Yellow 1-7d / Red >7d)                    |
+-----------------------------------------+----------------------------------------+
                                          |
                                          v
+----------------------------------------------------------------------------------+
| Frontend UI (Vite + React + TypeScript + Leaflet)                                |
|                                                                                  |
|  - Interactive Leaflet Access Graph Map                                          |
|  - Search Hero with Pre-set Real-World Personas                                  |
|  - Category-Specific Resource Cards (no cross-category field pollution)          |
|  - Resource Detail Dossier & 6-Step Evidence Provenance Modal                   |
|  - Live Changes Feed with Temporal Snapshot Diffs                                |
|  - Scraper Health Center with Real CLI Self-Healing Panel                        |
+----------------------------------------------------------------------------------+
```

---

## 5. Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm

### Backend

```bash
# Clone the repository
git clone https://github.com/siddhiguptas/HerAccess.git
cd HerAccess

# Install Python dependencies
pip install -r backend/requirements.txt

# Run automated tests (49 tests covering ingestion, ranking, and self-healing)
pytest -v

# Start backend server at http://127.0.0.1:8000
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Verify TypeScript build
npm run build

# Launch development server at http://localhost:5173
npm run dev
```

---

## 6. Demo Script (2.5 Minutes)

**Step 1 -- Problem and Search (0:00 - 0:30)**

Click the preset scenario: *"I'm a female student moving to Lucknow for college. I need a women's hostel under 12,000 with public transport and healthcare nearby."* Observe the structured intent extraction badge showing city, budget cap, user type, and required categories.

**Step 2 -- Ranked Results and Ranking Explanation (0:30 - 1:00)**

Click **"Why This Result?"** on Kamla Girls Hostel. Walk through the deterministic checkmarks: within requested budget, strictly women-only, KGMU Hospital within 3.5 km, UPMRC Metro within 0.8 km.

**Step 3 -- Evidence Provenance (1:00 - 1:30)**

Click **"View Evidence"** on the starting rent figure. Walk through the 6-step visual provenance diagram linking to collector `c_mt1f0ke713h6n32pi4` and the original website quote.

**Step 4 -- Support Chain (1:30 - 1:50)**

Expand the Support Chain on a hostel card to reveal the nearby emergency network: Hostel -> UPMRC Metro -> KGMU Hospital -> Apollo Pharmacy -> Women Help Desk 1090.

**Step 5 -- Self-Healing Demo (1:50 - 2:30)**

Open the **Scraper Health Center** tab. Click **"Simulate Schema Failure"** to drop validation to 0%. Click **"Run bdata scraper heal"** to invoke the real Bright Data CLI. Observe the exact CLI command, return code, stdout, and execution duration in the output terminal. If the CLI exits 0, the system marks the heal as resolved; any non-zero code is shown as a genuine failure.

---

## 7. Limitations and Data Freshness

- **Geographic Scope**: Demonstrated with Lucknow, India. The architecture is parameterised and can be extended to any city by adding target URLs.
- **Credit-Conscious Integration**: Live data is collected from Kamla Girls Hostel, KGMU Hospital, and Sulekha Hostels. Metro, Apollo Pharmacy, and UP Police 1090 operate on high-fidelity fixture data and are labelled `[FIXTURE DATA]` in the UI.
- **Public Data**: Information represents publicly published provider data at the time of observation. Curfews and prices should be confirmed directly with providers before any lease is signed.

---

**HerAccess is fully implemented, verified with 49/49 passing tests, and ready for judging.**
