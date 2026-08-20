# Bright Data Scraper Studio Integration Guide

Bright Data Scraper Studio is the primary data acquisition layer powering HerAccess. This document details the live collector registry, CLI operations, data flow pipeline, and self-healing lifecycle.

---

## 1. Registered Live Bright Data Collectors

| Category | Source Name | Source URL | Collector ID | Status |
|---|---|---|---|---|
| **Women's Hostel** | Kamla Girls Hostel | `https://kamlagirlshostel.com/` | `c_mt1f0ke713h6n32pi4` | **LIVE (Tested & Integrated)** |
| **Public Transport** | UPMRC Lucknow Metro Network | `https://www.upmetrorail.com/` | `c_mt1ftf047f6ulzznq` | **REGISTERED / LIVE** |
| **Healthcare** | KGMU & District Public Hospital | `https://kgmu.org/` | `c_mt1fujyq16vhxxfg7x` | **REGISTERED / LIVE** |
| **Pharmacy** | Apollo Pharmacy 24x7 Chemists | `https://www.apollopharmacy.in/` | `c_mt1fuw0q54wsjtyfq` | **REGISTERED / LIVE** |
| **Women Support / Police** | UP Police Women Power Line 1090 | `https://1090up.in/` | `c_mt1fv0wlyfkwe8z5y` | **REGISTERED / LIVE** |
| **Self-Healing Target** | Sulekha Lucknow Hostels | `https://www.sulekha.com/` | `c_hostel_sulekha_01` | **DEMO TARGET** |

---

## 2. CLI Workflow Commands

The HerAccess pipeline uses `@brightdata/cli` directly from the terminal or through the automated `BrightDataCollectorRunner` backend adapter.

### Step 1: Create a Scraper via Natural Language Prompt
```bash
npx @brightdata/cli scraper create "https://kamlagirlshostel.com/" "Extract hostel name, address and locality, room accommodation types, monthly rent price with meal details, whether strictly female/women only if stated, curfew or gate closing timings, contact phone numbers, listed facilities/amenities, source URL, and published date if available." --name heraccess-kamla-hostel --json
```

### Step 2: Run a Scraper
```bash
npx @brightdata/cli scraper run c_mt1f0ke713h6n32pi4 "https://kamlagirlshostel.com/"
```

### Step 3: Self-Healing on DOM Mutation
```bash
npx @brightdata/cli scraper heal c_hostel_sulekha_01 "Price, curfew, and contact fields stopped extracting after the source website structure changed."
```

### Step 4: Approve the Healed Scraper
```bash
npx @brightdata/cli scraper approve c_hostel_sulekha_01
```

---

## 3. End-to-End Ingestion Pipeline

```
Bright Data Scraper Studio (CLI / Cloud)
                  │
                  ▼
         CollectorRunner (Live / Fixture dispatch)
                  │
                  ▼
         ResultParser (Schema ingestion & entity creation)
                  │
                  ▼
         FieldNormalizer (Prices, Curfew ranges, Room tiers, Rules)
                  │
                  ▼
         CategoryValidator (Required field validation)
                  │
                  ▼
         Evidence & Provenance Linker (Verbatim quotes, timestamps)
                  │
                  ▼
         SQLAlchemy DB (Resources, Attributes, Sources, Evidence)
                  │
                  ▼
         MatchingEngine & Local Support Mesh
                  │
                  ▼
         Vite + React UI (Live data badges, Dossier, Evidence modal)
```

---

## 4. Real Data Mode vs. Fixture Mode

- **Real Data Mode (`is_real_data = True`)**:
  - Displays the green `REAL BRIGHT DATA DATA` badge.
  - Linked to real collector ID (e.g. `c_mt1f0ke713h6n32pi4`).
  - Full 6-step provenance chain from verbatim quote to source URL.

- **Fixture Mode (`is_real_data = False`)**:
  - Clearly tagged with slate `[FIXTURE DATA]` badge.
  - Enables zero-credit local testing and deterministic hackathon presentation.
  - Never labeled as live Bright Data data.
