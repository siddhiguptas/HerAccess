# HerAccess — Implementation Plan

## Problem & Background

Women relocating to a new Indian city for education or work face a fragmented information landscape. There is no single source that combines women's hostels, nearby transport, healthcare, pharmacies, police stations, and women's support services into one verified, map-centric view. Information is scattered across dozens of small websites, government portals, and listing pages — each with different structures, varying update frequencies, and no provenance.

HerAccess solves this by using **Bright Data Scraper Studio** to systematically collect, structure, validate, and maintain this fragmented public data, then presenting it as a verified local access navigator.

**Hackathon:** Into the Scrape-Verse (WeMakeDevs × Bright Data) — Aug 17–23, 2026
**Deadline:** Aug 23, 2026 (~3 days remaining)
**Tracks targeted:** Web-Slinger (Grand Prize), Suit-Up (Best UI), Spider-Sense (Clean Code), Daily Bugle (LinkedIn post)

---

## 1. City Selection Analysis

### Candidates Evaluated

| Criterion | Lucknow | Pune | Jaipur | Delhi NCR |
|---|---|---|---|---|
| Long-tail hostel sources | ✓ Small local sites + university pages | Dominated by aggregators | Moderate | Dominated by aggregators |
| Government health portals | ✓ lucknow.nic.in, individual hospital sites | pune.gov.in | Moderate | Massive, hard to scope |
| Public transport variety | ✓ Metro (UPMRC) + UPSRTC buses + city buses | PMPML + Metro | Metro + RSRTC | Too complex to scope |
| Women support resources | ✓ 1090 UP helpline, One Stop Centre, state commission | Good | Moderate | Good but overwhelming |
| University hostel pages | ✓ KGMU, Lucknow Univ, BBAU, IIM-L | Many | Rajasthan Univ | Too many |
| Scraping feasibility | ✓ Simpler sites, less anti-bot | Harder (tech-savvy) | Moderate | Hard |
| Compelling user story | ✓ Tier-2 city, genuine gap | Tier-1, more resources | Good | Too well-served |
| Information fragmentation | ✓ Highest — truly fragmented | Medium | Medium | Low (many aggregators) |

### **Recommendation: Lucknow** ✅

Lucknow provides the strongest combination of:
- Genuinely fragmented public data across small websites
- Rich government portal ecosystem (lucknow.nic.in, KGMU, SGPGI, UPMRC, UPSRTC)
- Compelling user story: a female student moving to a Tier-2 city with limited pre-existing infrastructure
- Multiple small hostel/PG websites with their own pages
- Strong Bright Data demonstration value — no single API can replace what we build

---

## 2. Bright Data Source Feasibility Audit

### Target: 18–22 Sources for Lucknow

> [!IMPORTANT]
> We focus on **long-tail, public, fragmented sources** where Bright Data adds genuine value. We avoid sites that merely duplicate well-known aggregator APIs (MagicBricks, 99acres) — those are not why Bright Data is needed.

#### Category 1: Women's Hostels / Accommodation (5–6 sources)

| # | Source | URL / Domain | Fields | Difficulty | Change Freq | Why BD Needed |
|---|---|---|---|---|---|---|
| 1 | Kamla Girls Hostel (local site) | kamlagirlshostel.com | name, price, facilities, curfew, contact | Low | Monthly | No API, custom HTML |
| 2 | Lucknow University Hostel Page | lkouniv.ac.in/hostels | name, fees, eligibility | Medium | Semester | Gov site, no API |
| 3 | BBAU Hostel Portal | bbau.ac.in/hostel | name, fees, rules | Medium | Semester | Gov site, no API |
| 4 | Sulekha Lucknow Hostels | sulekha.com/lucknow/hostels | name, price, area, contact | Medium | Weekly | Structured extraction from listings |
| 5 | Hostel360 Lucknow | hostel360.in/lucknow | name, price, amenities, photos | Medium | Weekly | Niche listing site |
| 6 | PGDekho Lucknow | pgdekho.com/lucknow | name, price, area, contact | Medium | Weekly | Niche PG directory |

#### Category 2: Public Transport (3–4 sources)

| # | Source | URL / Domain | Fields | Difficulty | Change Freq | Why BD Needed |
|---|---|---|---|---|---|---|
| 7 | UPMRC (Lucknow Metro) | upmetrorail.com | stations, fares, timings, route | Medium | Rare | No public API, scrape schedule tables |
| 8 | UPSRTC Bus Routes | upsrtc.up.gov.in | routes, stops, timings, operator | High | Weekly | Government portal, no API |
| 9 | Lucknow City Bus (UPSRTC city) | upsrtc.up.gov.in/city-services | city routes, stops | High | Monthly | Fragmented gov data |

#### Category 3: Healthcare (4–5 sources)

| # | Source | URL / Domain | Fields | Difficulty | Change Freq | Why BD Needed |
|---|---|---|---|---|---|---|
| 10 | Lucknow District Health Portal | lucknow.nic.in/health | hospital list, address, phone | Medium | Quarterly | Gov portal, no API |
| 11 | KGMU Hospital | kgmu.org | departments, services, emergency, contact | Medium | Rare | Individual hospital site |
| 12 | SGPGI | sgpgims.in | departments, OPD schedule, emergency | Medium | Monthly | Individual hospital site |
| 13 | Dr SPM Civil Hospital | drspmcivilhospital.in | services, departments, contact | Low | Rare | Small hospital site |
| 14 | Balrampur Hospital (via justdial/local) | elucknow.com/hospital | services, contact, address | Low | Rare | Local directory |

#### Category 4: Pharmacy (2 sources)

| # | Source | URL / Domain | Fields | Difficulty | Change Freq | Why BD Needed |
|---|---|---|---|---|---|---|
| 15 | JustDial Lucknow Pharmacies | justdial.com/Lucknow/Pharmacies | name, address, phone, timings | Medium | Weekly | No bulk API, structured extraction |
| 16 | Lucknow District Health (pharmacy list) | lucknow.nic.in/health | pharmacy name, area | Medium | Quarterly | Gov portal |

#### Category 5: Police / Public Support (2 sources)

| # | Source | URL / Domain | Fields | Difficulty | Change Freq | Why BD Needed |
|---|---|---|---|---|---|---|
| 17 | UP Police Lucknow Stations | uppolice.gov.in/lucknow | station name, SHO, address, phone | Medium | Monthly | Gov site, tabular data |
| 18 | Lucknow District Admin | lucknow.nic.in | office list, jurisdiction, contact | Medium | Quarterly | Gov portal |

#### Category 6: Women Support (3–4 sources)

| # | Source | URL / Domain | Fields | Difficulty | Change Freq | Why BD Needed |
|---|---|---|---|---|---|---|
| 19 | WCD One Stop Centre | wcd.nic.in/osc | centre name, address, phone, services | Medium | Quarterly | National gov portal |
| 20 | UP Women Commission | mahilakalyan.up.nic.in | helplines, schemes, contact | Medium | Monthly | State gov portal |
| 21 | 1090 Women Power Line | 1090up.in | helpline info, service details | Low | Rare | Dedicated helpline site |
| 22 | UP State Women's Helpline | mahilakalyan.up.nic.in/helpline | phone, services | Low | Rare | Gov portal |

### Sources Rejected

| Source | Reason |
|---|---|
| MagicBricks / 99acres / NoBroker | Aggregator APIs exist; using BD here adds no value |
| Google Maps | API available; not a scraping target |
| Housing.com | Well-documented API/aggregator |

---

## 3. MVP Demo Collectors (6–8 actual Bright Data collectors)

For the hackathon demo, we build **8 actual collectors** across all 6 categories:

| Collector | Category | Source | Priority |
|---|---|---|---|
| `c_hostel_kamla` | women_hostel | kamlagirlshostel.com | MUST |
| `c_hostel_sulekha` | women_hostel | sulekha.com/lucknow | MUST |
| `c_metro_upmrc` | public_transport | upmetrorail.com | MUST |
| `c_hospital_district` | hospital | lucknow.nic.in/health | MUST |
| `c_hospital_kgmu` | hospital | kgmu.org | SHOULD |
| `c_pharmacy_jd` | pharmacy | justdial.com/Lucknow/Pharmacies | MUST |
| `c_police_up` | police_or_public_support | uppolice.gov.in/lucknow | SHOULD |
| `c_women_osc` | women_support | wcd.nic.in/osc | MUST |

The self-healing demo uses `c_hostel_sulekha` as the primary target (most likely to have layout changes, good for demo).

---

## 4. Technical Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Government sites have anti-bot / IP blocks | High | Bright Data proxy infrastructure handles this; use residential proxies |
| Source structures vary wildly | High | One collector per source; normalize at ingestion layer |
| Geocoding Indian addresses | Medium | Use Nominatim (free) + fallback manual coordinates for known locations |
| Stale data presented as fresh | Medium | Strict freshness labeling; never claim real-time availability |
| PDF-only hospital data | Medium | Skip PDFs in MVP; note as "PDF source not extracted" |
| Conflicting info across sources | Medium | Build conflict detection as a core feature |
| Self-healing demo reliability | High | Build demo mode with controlled failure/recovery scenario |
| API rate limits during demo | Medium | Pre-cache results; demo mode uses stored snapshots |
| Duplicate entities across sources | Medium | Deduplicate by normalized name + geocode proximity |
| Legal concerns with scraping | Low | All sources are public government/listing sites; no login walls |

---

## 5. Architecture

```
heraccess/
├── frontend/                    # Next.js + TypeScript + Tailwind
│   ├── app/
│   │   ├── page.tsx             # Homepage — search interface
│   │   ├── results/page.tsx     # Results — map + cards
│   │   ├── resource/[id]/       # Resource detail + evidence
│   │   ├── dashboard/page.tsx   # Scraper Health Center
│   │   └── layout.tsx
│   ├── components/
│   │   ├── SearchForm.tsx
│   │   ├── MapView.tsx
│   │   ├── ResourceCard.tsx
│   │   ├── EvidenceCard.tsx
│   │   ├── WhyThisResult.tsx
│   │   ├── SupportChain.tsx
│   │   ├── FreshnessIndicator.tsx
│   │   ├── ConflictAlert.tsx
│   │   ├── ChangeDetection.tsx
│   │   ├── WatchButton.tsx
│   │   └── HealthDashboard.tsx
│   └── lib/
│       ├── api.ts
│       └── types.ts
│
├── backend/                     # FastAPI + Python
│   ├── main.py
│   ├── api/
│   │   ├── search.py            # POST /search — intent → results
│   │   ├── resources.py         # GET /resources/:id
│   │   ├── watch.py             # POST /watch
│   │   ├── health.py            # GET /health/dashboard
│   │   └── demo.py              # POST /demo/trigger-*
│   ├── models/
│   │   ├── database.py          # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic request/response
│   │   └── enums.py
│   ├── services/
│   │   ├── intent_parser.py     # LLM: user query → structured requirements
│   │   ├── matching_engine.py   # Deterministic: requirements → ranked results
│   │   ├── ranking.py           # Transparent scoring factors
│   │   └── geo.py               # Distance calculations (haversine)
│   ├── ingestion/
│   │   ├── collector_runner.py  # Trigger Bright Data collections
│   │   ├── result_parser.py     # Parse collector output → normalized records
│   │   ├── normalizer.py        # Field normalization (prices, addresses)
│   │   └── deduplication.py     # Entity deduplication
│   ├── verification/
│   │   ├── evidence.py          # Evidence extraction & storage
│   │   ├── freshness.py         # Freshness calculation
│   │   ├── conflict_detector.py # Cross-source conflict detection
│   │   └── validator.py         # Required field validation
│   ├── monitoring/
│   │   ├── snapshots.py         # Historical snapshots
│   │   ├── change_detector.py   # Diff snapshots → change events
│   │   └── watchlist.py         # User watchlist management
│   ├── healing/
│   │   ├── anomaly_detector.py  # Detect extraction failures
│   │   └── heal_runner.py       # Trigger bdata scraper heal
│   └── config.py                # Environment configuration
│
├── collectors/                  # Bright Data collector configs
│   ├── hostel/
│   ├── transport/
│   ├── healthcare/
│   ├── pharmacy/
│   ├── police/
│   └── support/
│
├── tests/
│   ├── test_matching.py
│   ├── test_validation.py
│   ├── test_freshness.py
│   ├── test_conflict.py
│   ├── test_change_detection.py
│   └── test_ranking.py
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── requirements.txt
└── README.md
```

### Database Schema (PostgreSQL)

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│   Collector      │     │  CollectionRun    │     │     Source        │
├─────────────────┤     ├──────────────────┤     ├───────────────────┤
│ id (PK)         │────>│ id (PK)          │     │ id (PK)           │
│ collector_id    │     │ collector_id (FK) │────>│ url               │
│ category        │     │ triggered_at      │     │ domain            │
│ source_url      │     │ completed_at      │     │ category          │
│ status          │     │ status            │     │ last_scraped_at   │
│ last_healed_at  │     │ records_count     │     │ scrape_frequency  │
│ created_at      │     │ validation_result │     └───────────────────┘
└─────────────────┘     └──────────────────┘
                                │
                                ▼
┌───────────────────┐     ┌───────────────────────┐
│    Resource       │     │   ResourceAttribute    │
├───────────────────┤     ├───────────────────────┤
│ id (PK)          │────>│ id (PK)               │
│ category         │     │ resource_id (FK)       │
│ name             │     │ field_name             │
│ city             │     │ raw_value              │
│ address          │     │ normalized_value        │
│ latitude         │     │ source_url             │
│ longitude        │     │ source_domain          │
│ created_at       │     │ evidence_text          │
│ updated_at       │     │ observed_at            │
└───────────────────┘     │ collector_id           │
                          │ verification_status    │
                          │ confidence             │
                          └───────────────────────┘

┌───────────────────┐     ┌───────────────────┐
│    Snapshot       │     │   ChangeEvent      │
├───────────────────┤     ├───────────────────┤
│ id (PK)          │     │ id (PK)            │
│ resource_id (FK) │     │ resource_id (FK)   │
│ data (JSONB)     │     │ field_name         │
│ observed_at      │     │ old_value          │
│ collector_id     │     │ new_value          │
│ collection_run_id│     │ change_type        │
└───────────────────┘     │ detected_at        │
                          └───────────────────┘

┌───────────────────┐     ┌───────────────────┐
│    Conflict       │     │   HealingEvent     │
├───────────────────┤     ├───────────────────┤
│ id (PK)          │     │ id (PK)            │
│ resource_id (FK) │     │ collector_id (FK)  │
│ field_name       │     │ problem_description│
│ value_a          │     │ triggered_at       │
│ source_a_url     │     │ resolved_at        │
│ value_b          │     │ status             │
│ source_b_url     │     │ fields_recovered   │
│ status           │     └───────────────────┘
│ detected_at      │
└───────────────────┘     ┌───────────────────┐
                          │    Watchlist       │
                          ├───────────────────┤
                          │ id (PK)            │
                          │ user_session_id    │
                          │ resource_id (FK)   │
                          │ created_at         │
                          │ last_notified_at   │
                          └───────────────────┘
```

### Key Design Decisions

1. **SQLite for MVP** instead of PostgreSQL — faster setup, no Docker dependency, sufficient for demo. Use SQLAlchemy so migration to PG is trivial.
2. **Leaflet.js** for maps — free, no API key, works great for India.
3. **LLM (Gemini API)** only for intent parsing — all matching, ranking, validation, distance is deterministic.
4. **Bright Data CLI** (`bdata`) for collector management — `create`, `run`, `heal`, `approve`.
5. **No authentication** for MVP — session-based watchlists using localStorage + backend session IDs.

---

## 6. MVP Scope

### MUST HAVE (Demo-critical)
- [x] Homepage with location + situation input
- [x] Intent parsing (LLM → structured requirements)
- [x] 6–8 Bright Data collectors across all categories
- [x] Ingestion pipeline: collector output → normalized DB records
- [x] Evidence cards with source URL, timestamp, evidence text
- [x] "Why This Result?" deterministic explanation
- [x] Map view with categorized markers (Leaflet)
- [x] Local Support Chain visualization
- [x] Freshness indicators (GREEN/YELLOW/RED)
- [x] Conflict detection display
- [x] Validation (required field checks)
- [x] Self-healing workflow (detect failure → `bdata scraper heal` → recover)
- [x] Scraper Health Center dashboard
- [x] Demo mode (repeatable failure/recovery)

### SHOULD HAVE (Strong differentiators)
- [ ] Change detection (snapshot diff)
- [ ] Watchlist (watch a resource for changes)
- [ ] Historical price tracking display
- [ ] Ranking transparency documentation

### NICE TO HAVE (Polish)
- [ ] Mobile responsive design
- [ ] Animated transitions
- [ ] Export results as PDF
- [ ] Multi-city support

### DO NOT BUILD
- ❌ User authentication / accounts
- ❌ Real-time chat / AI chatbot
- ❌ Safety scores
- ❌ Medical advice
- ❌ Payment integration
- ❌ Mobile app

---

## 7. Demo Storyboard (~2.5 minutes)

### Scene 1: The Problem (15s)
> "A woman moving to Lucknow for college. She needs a hostel, transport, hospital, and support services. This information is scattered across 20+ fragmented websites."

### Scene 2: User Input (15s)
> Type: "I'm a female student moving to Lucknow for college. I need a women's hostel under ₹12,000 with public transport and healthcare nearby."
> Show the system parsing intent into structured requirements.

### Scene 3: Bright Data at Work (20s)
> Show the Scraper Health Center: 8 collectors, sources, records.
> Show a collector running — structured data flowing in.
> Show Collector IDs in the dashboard.

### Scene 4: Structured Results (30s)
> Map loads with categorized markers.
> Click a hostel marker → Evidence Card with source URL, extracted text, timestamp.
> "Why This Result?" shows matching factors.
> Local Support Chain: Hostel → nearest metro → nearest hospital → pharmacy → police.

### Scene 5: Verification Features (20s)
> Freshness indicators: GREEN for recently checked sources.
> Conflict detection: Two sources disagree on curfew time → both shown.

### Scene 6: The Website Changes — Scraper Breaks (20s)
> Show demo mode: trigger simulated extraction failure.
> Validation dashboard turns RED: price=null, curfew=null.
> "3 required fields failed validation."

### Scene 7: Self-Healing (25s)
> System generates problem description.
> `bdata scraper heal <COLLECTOR_ID> "Price, curfew, and contact fields stopped extracting"`
> Same Collector ID → healed → rerun → data recovered.
> Dashboard turns GREEN. No code changes needed.

### Scene 8: Product Continues (15s)
> Same user query → results show recovered data.
> "The downstream product continued without code changes."
> Close on the Scraper Health Center showing all collectors healthy.

---

## 8. Milestone Plan

### M0: Repository + Architecture Setup (30 min)
**Files:** `.gitignore`, `.env.example`, `README.md`, folder structure, `requirements.txt`, `package.json`
**Verify:** Folders exist, requirements installable

### M1: Database Models + Schemas (45 min)
**Files:** `backend/models/database.py`, `backend/models/schemas.py`, `backend/models/enums.py`, `backend/config.py`
**Verify:** SQLAlchemy models create tables in SQLite

### M2: Bright Data Integration + First Collector (1 hr)
**Files:** `backend/ingestion/collector_runner.py`, `collectors/hostel/config.json`
**Work:** Create first collector via `bdata scraper create`, store collector ID, run collection
**Verify:** Raw JSON output from Bright Data stored

### M3: Ingestion Pipeline (1 hr)
**Files:** `backend/ingestion/result_parser.py`, `backend/ingestion/normalizer.py`, `backend/ingestion/deduplication.py`
**Work:** Parse collector JSON → Resource + ResourceAttribute records with evidence
**Verify:** Database populated with normalized records

### M4: Multiple Collectors (1.5 hr)
**Work:** Create collectors for all 6 categories, ingest results
**Verify:** 6+ categories populated in DB

### M5: Verification Layer (1 hr)
**Files:** `backend/verification/evidence.py`, `backend/verification/freshness.py`, `backend/verification/conflict_detector.py`, `backend/verification/validator.py`
**Verify:** Evidence stored per field, freshness computed, conflicts detected, validation reports generated

### M6: Matching Engine (1 hr)
**Files:** `backend/services/intent_parser.py`, `backend/services/matching_engine.py`, `backend/services/ranking.py`, `backend/services/geo.py`
**Work:** LLM intent parsing, haversine distance, deterministic ranking with transparent factors
**Verify:** Query → ranked results with "Why This Result?" factors

### M7: Backend API (45 min)
**Files:** `backend/api/search.py`, `backend/api/resources.py`, `backend/api/health.py`, `backend/api/demo.py`
**Verify:** API endpoints return correct JSON

### M8: Frontend — Homepage + Search (1.5 hr)
**Files:** `frontend/app/page.tsx`, `frontend/components/SearchForm.tsx`
**Verify:** Beautiful homepage, search works end-to-end

### M9: Frontend — Map + Results (2 hr)
**Files:** `frontend/app/results/page.tsx`, `frontend/components/MapView.tsx`, `frontend/components/ResourceCard.tsx`, `frontend/components/EvidenceCard.tsx`, `frontend/components/WhyThisResult.tsx`, `frontend/components/SupportChain.tsx`, `frontend/components/FreshnessIndicator.tsx`, `frontend/components/ConflictAlert.tsx`
**Verify:** Map renders, markers clickable, evidence cards display

### M10: Self-Healing Workflow (1 hr)
**Files:** `backend/healing/anomaly_detector.py`, `backend/healing/heal_runner.py`, `backend/api/demo.py`
**Work:** Detect validation failures → generate heal prompt → trigger `bdata scraper heal` → verify recovery
**Verify:** Demo mode reliably breaks and heals

### M11: Scraper Health Dashboard (1 hr)
**Files:** `frontend/app/dashboard/page.tsx`, `frontend/components/HealthDashboard.tsx`
**Verify:** Dashboard shows all collectors, health status, records, validation %

### M12: Tests + Demo Mode (1 hr)
**Files:** `tests/test_*.py`, demo mode endpoints
**Work:** Unit tests for matching, validation, freshness, conflict, ranking
**Verify:** Tests pass, demo mode repeatable

### M13: Polish + README (1 hr)
**Work:** UI polish, animations, README with screenshots, structured output examples
**Verify:** Production-quality feel

---

## Open Questions

> [!IMPORTANT]
> **Bright Data Account:** Do you have a Bright Data account set up with the CLI (`bdata`) authenticated? We need this before M2. The hackathon provides $50 in free credits with promo code `wemakedevs`.

> [!IMPORTANT]
> **LLM API Key:** For intent parsing, I plan to use Google Gemini API (free tier). Do you have a Gemini API key, or do you prefer a different LLM provider (OpenAI, etc.)?

> [!IMPORTANT]
> **Time budget:** With ~3 days remaining and ~14 hours of estimated work across 13 milestones, are you planning to work through this continuously? This will help me prioritize which "SHOULD HAVE" features to include vs. cut.

---

## Verification Plan

### Automated Tests
```bash
cd backend && python -m pytest tests/ -v
```
- `test_matching.py` — intent parsing → requirement extraction
- `test_validation.py` — required field validation catches nulls
- `test_freshness.py` — correct GREEN/YELLOW/RED states
- `test_conflict.py` — conflicting values detected across sources
- `test_ranking.py` — transparent scoring produces deterministic results

### Manual Verification
- Run demo mode end-to-end: healthy → break → heal → recover
- Visual inspection of map, evidence cards, support chain
- Verify all Collector IDs persist through heal cycle
- Screenshot all key screens for README
