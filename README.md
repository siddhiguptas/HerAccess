# HerAccess — Verified Local Access & Support Navigator for Women

> **Into the Scrape-Verse Hackathon** (WeMakeDevs × Bright Data)
> Powered by **Bright Data Scraper Studio & CLI**, FastAPI, React/TypeScript, Leaflet, and SQLite.

---

## 🌟 1. Problem & Context

When women relocate to a new city for education or employment, finding safe, affordable accommodation and surrounding critical infrastructure is fragmented and fraught with uncertainty:

1. **Information Fragmentation**: Women's hostels, public hospitals, 24-hour pharmacies, metro transit networks, and dedicated women's police helpdesks live on separate, disparate websites without a unified graph.
2. **Aggregator Limitations**: Commercial aggregators and directories prioritize sponsored placements, often lack granular female-safety details (such as strict gate-closing curfews or vegetarian-only meal mandates), and lack verifiable proof for their listings.
3. **Stale & Unverified Claims**: Rent prices and contact numbers change rapidly, leading to wasted transit time or unsafe situations.

### How Bright Data Solves This
Bright Data's **Scraper Studio** and **Web Unlocker** infrastructure allows HerAccess to:
- Autonomous scrape unstructured, long-tail local provider domains without manual parser maintenance.
- Extract granular text claims (room configurations, monthly rent, curfew ranges, rules).
- Retain exact **source provenance, URLs, and extraction timestamps** for 100% auditability.
- Utilize **AI-driven Self-Healing (`bdata scraper heal`)** to automatically recover broken extractors when target websites update their DOM layout—preserving the **same Collector ID** without breaking downstream client systems.

---

## 💎 2. Core Signature Features

1. **Natural-Language Search with Deterministic Ranking**:
   - Query: *"I'm moving to Lucknow for college. Find a women's hostel under ₹12,000 with healthcare and public transport nearby."*
   - Parsed into structured requirements: `city`, `user_type`, `budget_max`, `required_categories`, `preferences`.
   - 100% deterministic, explainable factor scoring (no opaque AI hallucinations).
2. **Cross-Source Hostel Intelligence & Safe Deduplication**:
   - Merges verified direct-source provider sites (e.g. *Kamla Girls Hostel*) with multi-listing discovery directories (e.g. *Sulekha*).
   - Distinguishes **`DIRECT SOURCE (High Verification)`** from **`DIRECTORY LISTING (Medium Verification)`**.
   - Highlights multi-source corroborated records with multi-source trust bonus points.
3. **6-Step Verifiable Provenance & Evidence Cards**:
   - Every claimed fact displays: `Claim ➔ Extracted Value ➔ Source URL ➔ Collector ID ➔ Observed Timestamp ➔ Verification Status`.
4. **5-Point Local Support Ecosystem Mesh**:
   - Automatically computes proximity from each hostel to:
     $$\text{Hostel} \longrightarrow \text{Nearest Metro Station} \longrightarrow \text{Public Hospital / Trauma Centre} \longrightarrow \text{24x7 Chemist} \longrightarrow \text{Police Women Help Desk 1090}$$
5. **Freshness Tracking & Conflict Detection**:
   - Freshness tiers: 🟢 **GREEN** (< 24h), 🟡 **YELLOW** (1–7 days), 🔴 **RED** (> 7 days).
   - Detects cross-source discrepancies (e.g., direct provider states ₹10,000 while directory lists ₹11,000) and displays both facts side-by-side.
6. **Scraper Health Center (Judges Dashboard)**:
   - Live telemetry across all registered collectors showing run history, record counts, validation rates, and crawler diagnostics.
7. **Self-Healing Architecture Demonstration**:
   - Controlled simulation showing how `bdata scraper heal` detects DOM schema breaks, patches extraction rules, and recovers data under the **identical Collector ID**.

---

## 📊 3. Registered Bright Data Collectors

| Category | Source Domain | Collector ID | Status | Provenance Level |
|---|---|---|---|---|
| **Women's Hostel (Direct)** | `https://kamlagirlshostel.com/` | `c_mt1f0ke713h6n32pi4` | **LIVE REAL DATA** | Direct Primary Source (High) |
| **Women's Hostel (Directory)** | `https://www.sulekha.com/womens-hostel/lucknow` | `c_mt1i5ri4trltbvw66` | **LIVE REAL DATA** | Directory Listing (Medium) |
| **Healthcare / Hospitals** | `https://kgmu.org/` | `c_mt1fujyq16vhxxfg7x` | **LIVE REAL DATA** | Direct University Hospital (High) |
| **Public Transport** | `https://www.upmetrorail.com/` | `c_mt1ftf047f6ulzznq` | **Fixture Fallback** | Public Transit Authority |
| **24x7 Pharmacy** | `https://www.apollopharmacy.in/` | `c_mt1fuw0q54wsjtyfq` | **Fixture Fallback** | Pharmacy Directory |
| **Women Support / Police** | `https://1090up.in/` | `c_mt1fv0wlyfkwe8z5y` | **Fixture Fallback** | State Helpline & Support |
| **Self-Healing Target (Demo)** | `https://www.sulekha.com/` | `c_hostel_sulekha_01` | **DEMO TARGET** | Simulated DOM Healing |

---

## 🏗️ 4. System Architecture

```
                                  ┌───────────────────────────────┐
                                  │      Bright Data Cloud        │
                                  │   (Scraper Studio & Scrapers) │
                                  └──────────────┬────────────────┘
                                                 │ npx @brightdata/cli
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ HerAccess Ingestion & Verification Pipeline                                      │
│                                                                                 │
│  [Collector Runner] ──► [Result Parser] ──► [Field Normalizer]                  │
│                                                     │                           │
│                                                     ▼                           │
│  [Conflict Detector] ◄── [Category Validator] ◄── [Entity Resolver]             │
│          │                                                                      │
│          ▼                                                                      │
│  [SQLite Database: 12 Tables (Resources, Attributes, Evidence, Runs, Changes)]   │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Deterministic Matching & Graph Engine                                           │
│                                                                                 │
│  • Natural Language Intent Parser (Regex & Keyword Mapping)                     │
│  • Haversine 5-Point Geo Mesh (Hostel ➔ Transit ➔ Hospital ➔ Chemist ➔ Police)   │
│  • Transparent Ranking Engine (Explainable Checkmark Factor Scoring)           │
│  • Freshness Calculator (Green <24h / Yellow 1-7d / Red >7d)                     │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Frontend UI (Vite + React + TypeScript + Leaflet)                               │
│                                                                                 │
│  • Interactive Leaflet Access Graph Map                                         │
│  • Search Hero with Pre-set Real-World Personas                                 │
│  • Resource Detail Dossier & 6-Step Evidence Provenance Modal                   │
│  • Live Changes Feed with Temporal Snapshot Diffs                               │
│  • Scraper Health Center with Crawler Diagnostics & Self-Healing Demo Panel     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 5. Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Backend Installation & Startup
```bash
# 1. Clone repository
git clone https://github.com/your-username/HerAccess.git
cd HerAccess

# 2. Install Python dependencies
pip install -r backend/requirements.txt

# 3. Run automated tests (34 tests covering ingestion, ranking, healing)
pytest -v

# 4. Start backend server (runs at http://127.0.0.1:8000)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### Frontend Installation & Startup
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Verify TypeScript build
npm run build

# 4. Launch development server (runs at http://localhost:5173)
npm run dev
```

---

## 🎬 6. Step-by-Step Hackathon Demo Script (2.5 Minutes)

1. **Step 1: The Problem & Search Scenario (0:00 - 0:30)**:
   - Click the preset scenario on the homepage: *"I'm a female student moving to Lucknow for college. I need a women's hostel under ₹12,000 with public transport and healthcare nearby."*
   - Point out the structured intent extraction badge: `Lucknow`, `Budget ≤ ₹12,000`, `Women-Only Priority`, `Healthcare & Metro Required Nearby`.
2. **Step 2: Ranked Recommendations & "Why This Result?" (0:30 - 1:00)**:
   - Click **"Why This Result?"** on *Kamla Girls Hostel* or *Shree Shyam Girls Hostel*.
   - Show the deterministic checkmarks: `✓ Within requested budget`, `✓ Strictly women-only verified`, `✓ KGMU Hospital within 3.5 km`, `✓ UPMRC Metro within 0.8 km`.
3. **Step 3: Real Bright Data Provenance & Evidence Modal (1:00 - 1:30)**:
   - Click **"View Evidence"** on the starting rent of ₹10,000/mo.
   - Walk through the 6-step visual provenance diagram linking directly to the live collector `c_mt1f0ke713h6n32pi4` and the original website quote.
4. **Step 4: 5-Point Local Support Chain (1:30 - 1:50)**:
   - Expand the **Support Chain** pill on the card to reveal the nearby emergency network: *Hostel ➔ UPMRC Metro ➔ KGMU Hospital ➔ Apollo Pharmacy ➔ Women Help Desk 1090*.
5. **Step 5: Scraper Health Center & Self-Healing Demo (1:50 - 2:30)**:
   - Open the **Scraper Health Center** tab.
   - Point out real collector metrics and the 12 parsed hostels from Sulekha alongside crawler telemetry.
   - In the Demo Panel, click **"1. Simulate Layout Break"** ➔ Watch validation drop to 0% and trigger an anomaly alert.
   - Click **"2. Trigger `bdata scraper heal`"** ➔ Watch the automated healing formulation recover the parser to 100% health while preserving the **same Collector ID (`c_hostel_sulekha_01`)**.

---

## ⚠️ 7. Limitations & Data Freshness Disclaimer

- **Geographic Scope**: Demonstrated with Lucknow, India as the primary market. The architecture is fully parameterized to support any city by adding target URLs.
- **Credit-Conscious Integration**: Live data is collected from Kamla Girls Hostel, KGMU Hospital, and Sulekha Hostels. Support items (Metro, Apollo Pharmacy, UP Police 1090) operate on high-fidelity fixtures and are transparently labeled as `[FIXTURE DATA]`.
- **Public Data Nature**: Information represents publicly published provider data at the time of observation. Curfews and prices should be re-confirmed directly with providers before lease signing.

---

**HerAccess is fully implemented, verified with 34/34 passing tests, and ready for judging.**
"# HerAccess" 
