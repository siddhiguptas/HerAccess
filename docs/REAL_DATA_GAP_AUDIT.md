# HerAccess — Forensic Real Data Gap Audit

**Audit Timestamp**: August 20, 2026  
**Auditor**: Antigravity Technical Verification Agent  
**Purpose**: Full audit of every data layer, backend service, API endpoint, fixture, and UI component for hackathon defense.

---

## 1. Forensic Gap Analysis Matrix

| # | Feature / Component | Current Source | Real / Fixture / Simulated / Hardcoded | User Visible? | Required Action | Priority |
|---|---|---|---|---|---|---|
| **1** | **Primary Accommodation (Kamla Girls Hostel)** | Direct provider website (`https://kamlagirlshostel.com/`) via Bright Data Collector `c_mt1f0ke713h6n32pi4` | **REAL BRIGHT DATA** (Direct High Verification) | **YES** (Cards, Details, Evidence, Map) | Preserve verified direct provenance and room-level pricing tiers (Single ₹12k, Twin ₹10k). | **P0 (Verified Real)** |
| **2** | **Directory Hostels (Sulekha Hostels)** | Sulekha Directory (`https://www.sulekha.com/womens-hostel/lucknow`) via Collector `c_mt1i5ri4trltbvw66` | **REAL BRIGHT DATA** (Directory Medium Verification, 12 records) | **YES** (Cards with `Sulekha Directory` badge, ratings, addresses) | Maintain directory verification status (`MEDIUM`), confidence score `0.8`, and listing URLs. | **P0 (Verified Real)** |
| **3** | **Academic Residence (University of Lucknow)** | Official University Hostels (`https://www.lkouniv.ac.in/en/page/hostels`) via Collector `c_mt1palv71amwtj4yp4` | **REAL BRIGHT DATA** (Institutional High Verification) | **YES** (Ganga Hall in Jankipuram, Wardens, Student rules) | Retain official academic residence provenance and warden administration details. | **P0 (Verified Real)** |
| **4** | **Public Transit (Lucknow Metro Stations)** | Official Metro Wikipedia Network (`https://en.wikipedia.org/wiki/Lucknow_Metro`) via Collector `c_mt1nlu1w3pkwb2h1i` | **REAL BRIGHT DATA** (Public Directory, 21 operational stations) | **YES** (Nearest transit in Support Chain, Map markers) | Maintain public directory status (`MEDIUM`), confidence `0.85`, and terminal/interchange flags. | **P0 (Verified Real)** |
| **5** | **Public Healthcare (KGMU Hospital)** | King George's Medical University (`https://kgmu.org/`) via Collector `c_mt1fujyq16vhxxfg7x` | **REAL BRIGHT DATA** (Direct Public Tertiary Medical Center) | **YES** (Nearest hospital in Support Chain, Map markers) | Retain direct source provenance and 24x7 trauma capabilities. | **P0 (Verified Real)** |
| **6** | **Private Healthcare (Apollo Hospitals)** | Apollo Hospitals Lucknow (`https://www.apollohospitals.com/hospitals/apollo-hospitals-lucknow`) via Collector `c_mt1ogapv1t1nhs5rht` | **REAL BRIGHT DATA** (Direct Private Tertiary Care in LDA Colony) | **YES** (Nearest hospital for LDA Colony, Gynaecology unit) | Maintain 24x7 emergency helpline (`05226788888`) and trauma provenance. | **P0 (Verified Real)** |
| **7** | **24x7 Pharmacy / Chemist Layer** | `fixtures/lucknow_pharmacies.json` (Collector ID `c_mt1fuw0q54wsjtyfq`) | **FIXTURE DATA** (4 Apollo Pharmacy branches) | **YES** (Nearest 24x7 Chemist in Support Chain, Map Layer) | Investigate viable public chemist source or transparently badge as `[REFERENCE FIXTURE]`. | **P1 (High Priority)** |
| **8** | **Women Support & Crisis Desks** | `fixtures/women_support_centres.json` (Collector ID `c_mt1fv0wlyfkwe8z5y`) | **FIXTURE DATA** (UP 1090 & Sakhi One Stop Centres) | **YES** (Nearest Support Resource in Support Chain, Map Layer) | Investigate viable public women-support source or transparently badge as `[REFERENCE FIXTURE]`. | **P1 (High Priority)** |
| **9** | **Self-Healing Architecture** | In-memory simulation via `DEMO_STATE` on `c_hostel_sulekha_01` in `collector_runner.py` | **SIMULATED WORKFLOW** (Zero Credit Spend) | **YES** (Demo Control Panel & Health Center) | Maintain explicit `SIMULATED SELF-HEALING DEMONSTRATION` banner to ensure zero false claims. | **P1 (High Priority)** |
| **10** | **Locality Coordinates Geocoding** | `LUCKNOW_LOCALITY_COORDINATES` in `backend/services/geo.py` | **HARDCODED REFERENCE CONSTANTS** (Locality Centroids) | **INDIRECT** (Map coordinates & Haversine distances) | Clearly document that scrapers extract text addresses and coordinates are resolved via locality centroids. | **P2 (Medium Priority)** |
| **11** | **Natural-Language Search** | `IntentParser` in `backend/services/intent_parser.py` | **DYNAMICALLY DERIVED** (Deterministic Regex + Gemini API) | **YES** (Search Hero, Budget constraint extraction) | Ensure parsing queries actual SQLite database without hardcoded canned results. | **P0 (Verified Dynamic)** |
| **12** | **Local Support Chain Mesh** | `GeoService.build_local_support_chain` in `backend/services/geo.py` | **DYNAMICALLY DERIVED** (Runtime Haversine distance calculations) | **YES** (5-Point Support Ecosystem Card in Detail Modal) | Nearest neighbor algorithm calculates distances dynamically from active database records. | **P0 (Verified Dynamic)** |
| **13** | **Transparent Ranking Engine** | `TransparentRankingEngine` in `backend/services/ranking.py` | **DYNAMICALLY DERIVED** (Multi-factor score evaluation) | **YES** ("Why this result?" breakdown in cards & modal) | Verify scoring evaluates real database attributes (budget, distance, transit, hospital, freshness). | **P0 (Verified Dynamic)** |
| **14** | **Freshness & Evidence Provenance** | `FreshnessCalculator` & `Evidence` table in database | **DYNAMICALLY DERIVED** (Timestamp diffs + verbatim quotes) | **YES** (Freshness badges, Evidence modal) | Ensure raw evidence quotes, collector IDs, and source URLs are displayed accurately. | **P0 (Verified Dynamic)** |
| **15** | **Scraper Health Dashboard** | `GET /health/dashboard` querying `collectors` & `collection_runs` tables | **DYNAMIC STATE TRACKING** | **YES** (Judges Technical Dashboard in UI) | Reflect actual collection runs, records ingested, pass rates, and failure diagnostics. | **P0 (Verified Dynamic)** |

---

## 2. Real vs Fixture Classification Summary

### A. Real Live Bright Data Sources (6 Verified Collectors):
1. `c_mt1f0ke713h6n32pi4`: Kamla Girls Hostel (Direct Source, Single/Twin/Triple pricing, curfew `9:30-10:00 pm`, vegetarian meal policy)
2. `c_mt1i5ri4trltbvw66`: Sulekha Women Hostels Directory (12 real hostel discovery listings across Lucknow with ratings `3.9`–`4.8`)
3. `c_mt1palv71amwtj4yp4`: University of Lucknow Women's Hostels (Ganga Hall academic residence in Jankipuram with official wardens)
4. `c_mt1nlu1w3pkwb2h1i`: Lucknow Metro Wikipedia Network (21 operational stations along Red Line with interchange & terminal flags)
5. `c_mt1fujyq16vhxxfg7x`: KGMU Hospital (Public State Medical University in Chowk with 24x7 trauma center)
6. `c_mt1ogapv1t1nhs5rht`: Apollo Hospitals Lucknow (Private Multi-Speciality Tertiary Hospital in LDA Colony with 24x7 emergency phone `05226788888`)

### B. Fixture / Reference Layers Remaining:
1. `fixtures/lucknow_pharmacies.json` (`c_mt1fuw0q54wsjtyfq`): 4 Apollo Pharmacy branches (Labeled `[FIXTURE DATA]`)
2. `fixtures/women_support_centres.json` (`c_mt1fv0wlyfkwe8z5y`): UP 1090 & Sakhi One Stop Centres (Labeled `[FIXTURE DATA]`)

### C. Simulated Demonstration Layer:
1. `c_hostel_sulekha_01` with `fixtures/sulekha_hostels.json`: Zero-credit state-machine simulation for demonstrating schema breakage detection, validation drop to 0%, and self-healing recovery. (Prominently labeled `SIMULATED SELF-HEALING DEMONSTRATION`).

---

## 3. Action Plan for Final Technical Defensibility

1. **Investigate Viable Public Sources for Pharmacy and Women Support**:
   - Target single-page, static HTML or direct public sources that avoid AI generator timeouts.
   - Strictly follow the credit safety protocol: 1 creation, inspect schema, 1 run if creation succeeds, 0 runs if creation fails.
2. **Ensure Support Chain Exclusively Computes Nearest Neighbors Dynamically**:
   - Zero hardcoded resource relationships.
   - When a user inspects any hostel, the backend dynamically queries SQLite for all active transit, hospitals, pharmacies, and support centers, sorts by Haversine distance, and returns the closest candidate for each category.
3. **Audit Frontend Badging & UI Transparency**:
   - Ensure `REAL BRIGHT DATA` vs `FIXTURE DATA` badges are 100% accurate on every card, modal, support chain node, and map marker.
   - Guarantee zero fake timestamps, fake ratings, or fake collector IDs.
4. **Generalize Spatial & City Architecture**:
   - Ensure the pipeline conceptually supports arbitrary cities via query/intent context rather than hardcoded Lucknow assumptions in core services.
