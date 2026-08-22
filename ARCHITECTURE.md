# HerAccess - System Architecture

HerAccess is engineered as a **Strictly Layered Modular Monolith**. We avoided distributed microservices to minimize operational complexity, while maintaining rigid boundaries that allow individual domains (like data ingestion or spatial proximity) to be developed independently.

## Architectural Enforcement
We enforce dependency direction through automated CI (AST parsing in `tests/test_architecture.py`).
**Rule:** `API ➔ Business Services ➔ Domain Logic ➔ Repositories ➔ Database Models`
Any violation (e.g., a Database Model importing a Service, or an API bypassing a Service to hit a Repository directly) immediately fails the build.

---

## High-Level Components

### 1. Core API Layer (`backend/api/`)
FastAPI endpoints managing incoming client requests. 
* **Design Pattern:** Route handlers are exceptionally thin controllers. They parse HTTP requests and immediately delegate to Services (e.g., `ResourceService`).

### 2. Application & Business Services (`backend/services/`)
Coordinates application behaviors without database session coupling.
* `ResourceService`: Acts as the unified DTO builder. Abstracts SQLAlchemy models into dense JSON schemas for the API.
* `MatchingEngine`: Evaluates parsed intents against database records, applying business rules (e.g., Women-only, Budget filters) and invoking the transparent ranking system.
* `GeoService`: Encapsulates spatial proximity logic and support chain generation.
* `BrightDataClient`: Isolated infrastructure adapter for shelling out to the Bright Data CLI (`npx @brightdata/cli`). Protects core logic from subprocess timeouts and vendor syntax.

### 3. Ingestion Pipeline (`backend/ingestion/`)
* `ResultParser`: Orchestrates the parsing and deduplication of newly collected Bright Data payloads.
* `AttributeExtractor`: Contains the domain-specific Strategy logic to map raw vendor HTML/JSON into structured HerAccess properties.
* `CollectorRunner`: Coordinates the execution of scheduled or manual data collections.

### 4. Data Access Repositories (`backend/repositories/`)
* `ResourceRepository`: Single-responsibility class encapsulating complex SQLAlchemy query mechanics and isolating `db_session` from higher-level domain logic.

### 5. Verification & Healing (`backend/verification/`, `backend/healing/`)
* `CategoryValidator`: Applies schema checks on scraped payloads to compute health scores.
* `HealRunner`: Listens to `CategoryValidator` failures and orchestrates Bright Data Scraper Studio auto-healing using generative prompts.

---

## Database Architecture
SQLite via SQLAlchemy. 
**Design Pattern:** EAV (Entity-Attribute-Value) architecture.
Because HerAccess scrapes unverified public data, the database must track exactly *where* and *when* a piece of information was claimed. The EAV model attaches a Collector ID, URL, Date, and Evidence Snippet to every single attribute (like rent price or curfew time) rather than storing them flatly.

## Frontend Architecture
React 18 SPA utilizing TypeScript and Vite.
**Design Pattern:** Utilizes a unified React Context (`AppContext`) to manage global states (Search Results, Watchlist, Modals) and eliminate deep prop-drilling, avoiding the overhead of external state libraries like Redux.
