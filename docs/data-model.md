# HerAccess — Data Model Documentation

HerAccess utilizes a relational data model with normalized tables to support provenance tracking, historical diffs, conflict resolution, and self-healing telemetry.

---

## Entity Relationship Summary

```
   ┌────────────────────┐            ┌──────────────────────┐
   │      sources       │ 1        * │      collectors      │
   ├────────────────────┼───────────>├──────────────────────┤
   │ id (PK)            │            │ id (PK)              │
   │ url, domain, name  │            │ collector_id (UK)    │
   │ category           │            │ status, heal_count   │
   └────────────────────┘            └──────────────────────┘
             │ 1                                │ 1
             │                                  │
             │ *                                │ *
   ┌────────────────────┐            ┌──────────────────────┐
   │ resource_attributes│            │   collection_runs    │
   ├────────────────────┤            ├──────────────────────┤
   │ id (PK)            │            │ id (PK)              │
   │ resource_id (FK)   │            │ collector_id (FK)    │
   │ field_name         │            │ validation_pass_rate │
   │ raw_value          │            │ status, records_count│
   │ normalized_value   │            └──────────────────────┘
   │ evidence_text      │                       │ 1
   │ observed_at        │                       │ *
   │ verification_status│            ┌──────────────────────┐
   └────────────────────┘            │      snapshots       │
             │ *                     ├──────────────────────┤
             │                       │ id (PK)              │
             │ 1                     │ resource_id (FK)     │
   ┌────────────────────┐            │ data (JSON)          │
   │     resources      │            │ observed_at          │
   ├────────────────────┤            └──────────────────────┘
   │ id (PK)            │                       │
   │ category, name     │                       │ diff
   │ city, locality     │                       ▼
   │ latitude, longitude│            ┌──────────────────────┐
   │ primary_contact    │            │    change_events     │
   └────────────────────┘            ├──────────────────────┤
             │                       │ id (PK)              │
             │                       │ resource_id (FK)     │
             │ 1                     │ field_name           │
             │ *                     │ old_value, new_value │
   ┌────────────────────┐            │ change_type          │
   │     conflicts      │            └──────────────────────┘
   ├────────────────────┤
   │ id (PK)            │            ┌──────────────────────┐
   │ resource_id (FK)   │            │    healing_events    │
   │ field_name         │            ├──────────────────────┤
   │ value_a, value_b   │            │ id (PK)              │
   │ source_a_url       │            │ collector_id (FK)    │
   │ source_b_url       │            │ problem_description  │
   │ status             │            │ status, resolved_at  │
   └────────────────────┘            └──────────────────────┘
```

---

## Table Definitions

### 1. `resources`
Core entity representing physical locations (hostels, hospitals, transit stations, pharmacies, police stations, support centers).

### 2. `resource_attributes`
Granular attributes for each resource (e.g. `monthly_price`, `curfew_time`, `emergency_services`), maintaining exact source URLs and verbatim evidence text.

### 3. `sources`
Catalog of public web sources and domains with reliability tiering.

### 4. `collectors`
Registry of Bright Data Scraper Studio collectors, target URLs, extraction prompts, and health statuses.

### 5. `collection_runs`
Audit trail of scraper executions, record counts, and required-field validation pass rates.

### 6. `snapshots`
Historical point-in-time dictionary snapshots of resource state.

### 7. `change_events`
Diff records created whenever an attribute is added, modified, or removed between successive collection runs.

### 8. `conflicts`
Records representing discrepancies between two distinct public sources for the same entity.

### 9. `watchlists`
User session bookmarks for continuous monitoring of specific resources.

### 10. `healing_events`
Audit trail of self-healing requests initiated via `bdata scraper heal` and recovery metrics.
