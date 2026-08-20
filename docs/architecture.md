# HerAccess — System Architecture

HerAccess is an intelligent, deterministic local access and support navigator for women entering, studying, or working in a new city.

## High-Level Architecture

```
                                  [ User / Client Query ]
                                             │
                                             ▼
                                  [ Intent Parser (LLM) ]
                                             │
                                             ▼
                             [ Structured Search Requirements ]
                                             │
        ┌────────────────────────────────────┼────────────────────────────────────┐
        ▼                                    ▼                                    ▼
[ Resource Database ]              [ Geo & Distance Engine ]            [ Matching & Ranking ]
 (SQLAlchemy / SQLite)                (Haversine Distance)               (Transparent Scoring)
        │                                    │                                    │
        ├────────────────────────────────────┼────────────────────────────────────┤
        ▼                                    ▼                                    ▼
[ Evidence & Provenance ]          [ Local Support Chain ]              [ Freshness & Conflict ]
 (Verbatim Quotes + URL)            (Transport, Care, Help)              (GREEN/YELLOW/RED diff)
        │                                    │                                    │
        └────────────────────────────────────┼────────────────────────────────────┘
                                             ▼
                             [ Visual Map & Results Feed ]
                                (Leaflet + Evidence Cards)
```

---

## 1. Web Data Acquisition Layer (Bright Data Scraper Studio)

Bright Data is the foundational infrastructure that acquires and maintains structured facts from long-tail, fragmented public websites where no centralized API exists:

* **Collector Registry**: 8 custom Scraper Studio collectors across 6 public categories (hostels, transport, hospitals, pharmacies, police, women support).
* **Provenance Capture**: Every extracted attribute captures `raw_value`, `normalized_value`, `source_url`, `source_domain`, `evidence_text`, `observed_at`, and `collector_id`.
* **Zero Credit Development Mode**: Realistic high-fidelity fixtures enable 100% development and testing without burning Bright Data credits.

---

## 2. Ingestion & Normalization Engine

* **Deterministic Normalizer**: Regular expressions and domain rules normalize currencies, deposit amounts, curfews (24h standard), booleans, and amenity lists without LLM hallucinations.
* **Entity Resolver**: Geo-spatial deduplication based on token overlap and coordinate proximity (< 300m).
* **Validation Layer**: Category-specific schema validation checking mandatory required fields before committing records to the database.

---

## 3. Verification & Provenance System

* **Evidence Records**: Direct verbatim text excerpts from public websites proving each specific claim.
* **Freshness Engine**:
  * **GREEN**: Verified within < 24 hours
  * **YELLOW**: Verified within 1 to 7 days
  * **RED**: Verified > 7 days ago
* **Conflict Detector**: Compares independent sources on the same entity. When discrepancies exist (e.g. curfew or pricing), both claims are preserved with source links rather than silently choosing one.

---

## 4. Matching & Deterministic Ranking

HerAccess strictly avoids fake "safety scores" or arbitrary AI-invented percentages. The ranking model is 100% transparent and deterministic:

| Factor | Weight | Condition |
|---|---|---|
| Budget Fit | 25% | Monthly rent <= requested budget |
| Proximity | 25% | Distance to selected hub (< 2km: +25pts, < 5km: +15pts) |
| Women-Only | 20% | Verified women-only facility in source |
| Public Transport | 10% | Verified metro rail or bus hub within 3km |
| Healthcare Proximity | 10% | Government / 24x7 emergency hospital nearby |
| Data Freshness | 5% | Checked < 24 hours ago (GREEN) |
| Verification Status | 5% | High confidence source evidence |

---

## 5. Self-Healing Scraper Orchestration

When a target website alters its HTML or class names:
1. **Anomaly Detection**: Validation detects null or missing required fields.
2. **Issue Description**: Auto-generates a problem description (e.g. *"Price, curfew, and contact fields missing after container change"*).
3. **CLI Invocation**: Invokes `bdata scraper heal <COLLECTOR_ID> "<prompt>"`.
4. **Approval**: Fix is approved, updating the scraper while retaining the **SAME Collector ID**.
5. **Downstream Resiliency**: Ingestion reruns and recovers data with zero downstream code changes.
