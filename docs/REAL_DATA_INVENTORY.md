# HerAccess — Comprehensive Real Data & Source Inventory

**Inventory Date**: August 20, 2026  
**Track**: Into the Scrape-Verse / Web-Slinger  
**Bright Data Balance**: $52.00 ($0.00 pending charges)  
**Total Automated Tests**: 41/41 Passing

---

## 1. Real Live Bright Data Collectors (7 Active Production Sources)

| Category | Source Name & URL | Collector ID | Real Records | Verification Level | Last Run Timestamp / Status | Raw Payload Path |
|---|---|---|---|---|---|---|
| **Women's Hostel** | **Kamla Girls Hostel** (`https://kamlagirlshostel.com/`) | `c_mt1f0ke713h6n32pi4` | **1 primary direct provider record** (Multi-tier: Single @ ₹12,000, Twin @ ₹10,000, Triple @ ₹10,000) | **DIRECT (`HIGH`)** (Confidence: `1.0`) | `d2t1787224319462rjo3mg3h724` (2026-08-20T08:05:19Z) — Status: `ready` | `fixtures/kamla_hostel.json` |
| **Women's Hostel** | **Sulekha Women Hostels Directory** (`https://www.sulekha.com/womens-hostel/lucknow`) | `c_mt1i5ri4trltbvw66` | **12 verified discovery hostel records** across Gomti Nagar, Alambagh, Indira Nagar, Hazratganj | **DIRECTORY (`MEDIUM`)** (Confidence: `0.8`) | `d2t1787232296495rp9m6s1qf7v` (2026-08-20T10:18:16Z) — Status: `ready` | `fixtures/sulekha_real_run.json` |
| **Women's Hostel** | **University of Lucknow Hostels** (`https://www.lkouniv.ac.in/en/page/hostels`) | `c_mt1palv71amwtj4yp4` | **1 academic residence hall** (Ganga Hall in Jankipuram with official wardens & student policy) | **DIRECT INSTITUTIONAL (`HIGH`)** (Confidence: `0.95`) | `d2t1787241826567r7htr0njm858` (2026-08-20T12:57:06Z) — Status: `ready` | `fixtures/real_lkouniv_hostels_run.json` |
| **Public Transport** | **Lucknow Metro Network** (`https://en.wikipedia.org/wiki/Lucknow_Metro`) | `c_mt1nlu1w3pkwb2h1i` | **21 operational transit stations** along Red Line with terminal/interchange flags | **PUBLIC DIRECTORY (`MEDIUM`)** (Confidence: `0.85`) | `d2t1787238582242rp436ojjptio` (2026-08-20T12:03:02Z) — Status: `ready` | `fixtures/real_transport_run.json` |
| **Healthcare** | **King George's Medical University** (`https://kgmu.org/`) | `c_mt1fujyq16vhxxfg7x` | **1 public tertiary medical hospital** with 24x7 trauma & emergency departments in Chowk | **DIRECT (`HIGH`)** (Confidence: `1.0`) | `d2t1787224855423ry1a862gq9b` (2026-08-20T08:14:15Z) — Status: `ready` | `fixtures/real_kgmu_hospital.json` |
| **Healthcare** | **Apollo Hospitals Lucknow** (`https://www.apollohospitals.com/hospitals/apollo-hospitals-lucknow`) | `c_mt1ogapv1t1nhs5rht` | **1 private multi-speciality tertiary hospital** in LDA Colony with 24x7 emergency phone (`05226788888`) and Gynaecology unit | **DIRECT (`HIGH`)** (Confidence: `1.0`) | `d2t1787239964648r0tillkpdb8g` (2026-08-20T12:26:04Z) — Status: `ready` | `fixtures/real_hospital_apollo_run.json` |
| **Women Support & Crisis** | **UP Mahila Kalyan & Emergency Helplines** (`https://mahilakalyan.up.nic.in/`) | `c_mt1qwsbmqm9fi1vu6` | **1 state-level crisis support organization** with verified 24x7 helplines: Women Helpline `181`, Women Powerline `1090`, Police Emergency `112`, Childline `1098` | **DIRECT GOVERNMENT (`HIGH`)** (Confidence: `1.0`) | `d2t1787244298907rvebaloejvkg` (2026-08-20T16:44:59Z) — Status: `ready` | `fixtures/real_women_support_run.json` |

---

## 2. Reference & Static Data Layers (Transparently Badged as `[FIXTURE DATA]`)

| Category | Reference Dataset | Source Descriptor | Records | Rationale for Reference Staging |
|---|---|---|---|---|
| **24x7 Pharmacy** | `fixtures/lucknow_pharmacies.json` | Apollo Pharmacy Lucknow branches (Alambagh, Hazratganj, Gomti Nagar) | 4 | Real-time collector generation timed out during schema analysis on commercial directory portals. Transparently badged as `[FIXTURE DATA]`. |
| **Locality Centroids** | `backend/services/geo.py` | Centroid coordinates for Lucknow hubs (Hazratganj, Gomti Nagar, LDA Colony, Jankipuram, Charbagh) | 33 | Used to calculate spatial Haversine proximity when scraped sources provide street text without GPS coordinates. |

---

## 3. Simulated Demo Data Layer (Zero Credit Spend)

| Feature | Simulation Target | Collector ID | Mechanism | Visual UI Disclosures |
|---|---|---|---|---|
| **Self-Healing State Machine** | `c_hostel_sulekha_01` (`fixtures/sulekha_hostels.json`) | `c_hostel_sulekha_01` | In-memory `DEMO_STATE` simulating layout change, validation drop to 0%, and self-healing restoration | Prominently labeled: `SIMULATED SELF-HEALING DEMONSTRATION (ZERO CREDIT SPEND)`. |

---

## 4. End-to-End Verification Pipeline (Source ➔ UI)

```
[Target Web Page]
       ↓
[Bright Data Scraper Studio Collector] (e.g. c_mt1f0ke713h6n32pi4, c_mt1i5ri4trltbvw66, c_mt1palv71amwtj4yp4, c_mt1qwsbmqm9fi1vu6)
       ↓
[Single Controlled Run] (CLI / API)
       ↓
[Raw JSON Extraction with Timestamps & Selectors]
       ↓
[Category Normalizer & CategoryValidator] (Rule checks, Currency, Curfew 24h, Policies separation)
       ↓
[SQLite Database: resources, resource_attributes, evidence, collection_runs]
       ↓
[IntentParser (Regex + LLM) ➔ MatchingEngine (Haversine Geo Mesh + TransparentRankingEngine)]
       ↓
[HerAccess React UI: Real Badges, Support Chain Mesh, Interactive Evidence Modal]
```
