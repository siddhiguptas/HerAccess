# HerAccess Backend API Documentation

HerAccess exposes a high-performance REST API built with FastAPI and SQLite/SQLAlchemy. In MVP/development mode, all ingestion is fixture-driven and requires no external API keys or authentication credentials.

Base URL: `http://localhost:8000`  
Interactive OpenAPI / Swagger Docs: `http://localhost:8000/docs`

---

## Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Service root and metadata |
| `GET` | `/health` | Basic service health check |
| `GET` | `/health/dashboard` | Scraper Health Center operations metrics |
| `POST` | `/health/collectors/run/{collector_id}` | Trigger collector execution |
| `POST` | `/search` | Natural language / structured search with transparent ranking |
| `GET` | `/resources` | List all verified public resources with filters |
| `GET` | `/resources/{id}` | Detailed resource provenance, evidence, and support chain |
| `GET` | `/resources/conflicts` | List cross-source factual conflicts |
| `GET` | `/changes` | Historical attribute change events feed |
| `GET` | `/changes/{resource_id}` | Change events for a specific resource |
| `GET` | `/watch` | List watched resources for a user session |
| `POST` | `/watch` | Add resource to session watchlist |
| `DELETE` | `/watch/{resource_id}` | Remove resource from session watchlist |
| `GET` | `/demo` | Current demo state and health status |
| `GET` | `/demo/status` | Current demo state and health status |
| `POST` | `/demo/trigger-break` | Simulate extraction breakage on target collector |
| `POST` | `/demo/trigger-heal` | Trigger Bright Data self-healing workflow |
| `POST` | `/demo/reset` | Reset demo state back to healthy baseline |

---

## Search API

### `POST /search`

Accepts natural language user query and optional structured constraints. Deterministically extracts intent parameters and scores candidate resources against explicit transparent criteria.

#### Request Body
```json
{
  "query": "I am a female student moving to Lucknow. I need a women's hostel under ₹12,000 with transport and hospital nearby.",
  "city": "Lucknow",
  "budget_max": 12000,
  "target_location": "Hazratganj",
  "required_categories": ["women_hostel", "public_transport", "hospital"]
}
```

#### Response Structure
```json
{
  "intent": {
    "city": "Lucknow",
    "target_location": "Hazratganj",
    "user_type": "female_student",
    "budget_max": 12000,
    "distance_max_km": 5.0,
    "required_categories": ["women_hostel", "public_transport", "hospital"],
    "preferences": {"women_only": true, "meals_included": false},
    "explanation": "Structured requirements: Female Student looking in Lucknow (Hazratganj) with budget up to ₹12,000"
  },
  "total_found": 4,
  "primary_results": [
    {
      "id": 1,
      "category": "women_hostel",
      "name": "Kamla Girls Hostel",
      "city": "Lucknow",
      "locality": "Hazratganj",
      "address": "12, Ashok Marg, Near Hazratganj Metro, Lucknow",
      "latitude": 26.8531,
      "longitude": 80.9472,
      "primary_contact": "+91 94150 12345",
      "source_url": "https://kamlagirlshostel.com/facilities-pricing",
      "freshness": "green",
      "observed_at": "2026-08-20T10:15:00",
      "distance_km": 0.1,
      "match_score": 14.0,
      "why_this_result": [
        {
          "factor_name": "budget_fit",
          "label": "✓ Under requested budget (₹9,500 ≤ ₹12,000) — saves ₹2,500/mo",
          "score_contribution": 2.0,
          "matched": true
        },
        {
          "factor_name": "women_only",
          "label": "✓ Strictly women's accommodation verified in source evidence",
          "score_contribution": 2.0,
          "matched": true
        },
        {
          "factor_name": "distance",
          "label": "✓ Within requested radius (0.1 km from target location)",
          "score_contribution": 2.0,
          "matched": true
        },
        {
          "factor_name": "transport_nearby",
          "label": "✓ Direct public transport / metro rail link found nearby",
          "score_contribution": 2.0,
          "matched": true
        },
        {
          "factor_name": "hospital_nearby",
          "label": "✓ Government / 24x7 emergency medical center in immediate proximity",
          "score_contribution": 2.0,
          "matched": true
        },
        {
          "factor_name": "freshness",
          "label": "✓ Fresh source data: verified within last 24 hours (GREEN)",
          "score_contribution": 2.0,
          "matched": true
        },
        {
          "factor_name": "verification",
          "label": "✓ High confidence: verifiable quote and official/verified domain",
          "score_contribution": 2.0,
          "matched": true
        }
      ],
      "evidence_cards": [
        {
          "field_name": "monthly_price",
          "claimed_value": 9500.0,
          "evidence_quote": "AC Double Sharing: Rs. 9,500 per month inclusive of 3 meals and Wi-Fi.",
          "source_url": "https://kamlagirlshostel.com/facilities-pricing",
          "source_domain": "kamlagirlshostel.com",
          "observed_at": "2026-08-20T10:15:00",
          "verification_status": "high",
          "freshness_level": "green",
          "collector_id": "c_hostel_kamla_01"
        }
      ],
      "support_chain": [
        {
          "category": "public_transport",
          "resource_id": 6,
          "name": "Hazratganj Metro Station (UPMRC Red Line)",
          "locality": "Hazratganj",
          "distance_km": 0.2,
          "key_detail": "First Train: 06:00, Last Train: 22:00 | Dedicated Women Coach",
          "source_url": "https://www.upmetrorail.com/lucknow-metro/station-timings-and-fares"
        },
        {
          "category": "hospital",
          "resource_id": 8,
          "name": "Dr. Shyama Prasad Mukherjee (Civil) Hospital",
          "locality": "Hazratganj",
          "distance_km": 0.6,
          "key_detail": "Government District Hospital | 24x7 Emergency",
          "source_url": "https://lucknow.nic.in/health/public-hospitals"
        },
        {
          "category": "pharmacy",
          "resource_id": 11,
          "name": "Apollo Pharmacy 24x7 Hazratganj",
          "locality": "Hazratganj",
          "distance_km": 0.3,
          "key_detail": "24 Hours Open | Delivery: True",
          "source_url": "https://www.justdial.com/Lucknow/24-Hours-Chemists"
        },
        {
          "category": "police_or_public_support",
          "resource_id": 14,
          "name": "Hazratganj Police Station & Mission Shakti Desk",
          "locality": "Hazratganj",
          "distance_km": 0.4,
          "key_detail": "Mission Shakti Women Help Desk: True | 24x7",
          "source_url": "https://uppolice.gov.in/lucknow/police-stations-directory"
        },
        {
          "category": "women_support",
          "resource_id": 17,
          "name": "Sakhi One Stop Centre (OSC) Lucknow",
          "locality": "Qaiserbagh",
          "distance_km": 1.4,
          "key_detail": "24x7 Crisis Support, Legal Aid, Shelter | Call: 0522-2622010",
          "source_url": "https://wcd.nic.in/schemes/one-stop-centre-scheme/lucknow-directory"
        }
      ],
      "has_conflicts": false
    }
  ],
  "nearby_support_ecosystem": {},
  "execution_time_ms": 12.4
}
```

---

## Scraper Health Dashboard API

### `GET /health/dashboard`

Returns operational telemetry for Bright Data collectors, execution runs, pass rates, and self-healing audit trails.

```json
{
  "total_collectors": 7,
  "healthy_count": 7,
  "degraded_count": 0,
  "healing_count": 0,
  "failed_count": 0,
  "total_sources": 7,
  "total_records": 18,
  "overall_validation_rate": 100.0,
  "last_collection_timestamp": "2026-08-20T11:45:00",
  "collectors": [
    {
      "collector_id": "c_hostel_kamla_01",
      "name": "Kamla Girls Hostel Extractor",
      "category": "women_hostel",
      "source_url": "https://kamlagirlshostel.com/facilities-pricing",
      "status": "healthy",
      "last_run_at": "2026-08-20T10:15:00",
      "last_healed_at": null,
      "heal_count": 0,
      "records_count": 1,
      "validation_pass_rate": 1.0,
      "last_error": null
    }
  ],
  "recent_runs": [],
  "recent_healing_events": []
}
```

---

## Demo Simulation Endpoints

* `POST /demo/trigger-break`: Nullifies extracted required attributes (`monthly_price`, `curfew_time`, `contact`) to simulate target DOM change.
* `POST /demo/trigger-heal`: Executes `HealRunner.trigger_healing_workflow()` to recover extraction schemas while preserving the same Collector ID.
* `POST /demo/reset`: Reloads pristine baseline fixtures.
