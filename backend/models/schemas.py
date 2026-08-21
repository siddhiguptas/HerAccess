from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from backend.models.enums import (
    ResourceCategory, VerificationStatus, FreshnessLevel,
    CollectorStatus, CollectionRunStatus, ChangeType, HealingStatus
)

# Provenance / Attribute schema
class AttributeProvenance(BaseModel):
    field_name: str
    raw_value: Optional[str] = None
    normalized_value: Optional[Any] = None
    source_url: str
    source_domain: str
    evidence_text: Optional[str] = None
    observed_at: datetime
    collector_id: Optional[str] = None
    verification_status: VerificationStatus = VerificationStatus.HIGH
    freshness: FreshnessLevel = FreshnessLevel.GREEN

# Evidence card response
class EvidenceCard(BaseModel):
    field_name: str
    claimed_value: Any
    evidence_quote: str
    source_url: str
    source_domain: str
    observed_at: datetime
    verification_status: VerificationStatus
    freshness_level: FreshnessLevel
    collector_id: str

# Why This Result Ranking explanation factor
class RankingFactor(BaseModel):
    factor_name: str # e.g. "budget_fit", "distance", "women_only", "transport_nearby"
    label: str # e.g. "Within requested budget (₹9,500 <= ₹12,000)"
    score_contribution: float
    matched: bool

# Local Support Chain item
class SupportChainItem(BaseModel):
    category: ResourceCategory
    resource_id: int
    name: str
    locality: Optional[str]
    distance_km: float
    key_detail: str # e.g. "0.4 km to Munshi Pulia Metro" or "1.2 km to Ram Manohar Lohia Hospital"
    source_url: str
    is_real_data: bool = False
    data_source_badge: str = "FIXTURE DATA"

# Resource Card / Detail response
class ResourceDetail(BaseModel):
    id: int
    category: ResourceCategory
    name: str
    city: str
    locality: Optional[str]
    address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    primary_contact: Optional[str]
    source_url: Optional[str]
    freshness: FreshnessLevel
    observed_at: datetime
    is_real_data: bool = False
    data_source_badge: str = "FIXTURE DATA"
    attributes: List[AttributeProvenance]
    evidence_cards: List[EvidenceCard]
    why_this_result: List[RankingFactor]
    support_chain: List[SupportChainItem]
    distance_km: Optional[float] = None
    match_score: Optional[float] = None
    has_conflicts: bool = False

# Search Request & Intent Models
class SearchRequest(BaseModel):
    query: str
    city: Optional[str] = "Lucknow"
    target_location: Optional[str] = None
    user_type: Optional[str] = "female_student"
    budget_max: Optional[float] = None
    distance_preference_km: Optional[float] = 5.0
    required_categories: Optional[List[ResourceCategory]] = None

class ParsedIntent(BaseModel):
    city: str = "Lucknow"
    target_location: Optional[str] = None
    location_type: str = "locality" # "locality" | "landmark" | "road" | "transit_hub" | "unresolved"
    location_resolved: bool = True
    raw_location: Optional[str] = None
    user_type: str = "female_student"
    budget_max: Optional[float] = None
    distance_max_km: Optional[float] = 5.0
    required_categories: List[ResourceCategory] = Field(default_factory=list)
    preferences: Dict[str, Any] = Field(default_factory=dict)
    explanation: str

class SearchResponse(BaseModel):
    intent: ParsedIntent
    total_found: int
    primary_results: List[ResourceDetail]
    nearby_support_ecosystem: Dict[str, List[ResourceDetail]]
    execution_time_ms: float

# Conflict Schemas
class ConflictDetail(BaseModel):
    id: int
    resource_id: int
    resource_name: str
    category: ResourceCategory
    field_name: str
    value_a: Any
    source_a_url: str
    source_a_observed_at: datetime
    value_b: Any
    source_b_url: str
    source_b_observed_at: datetime
    status: str
    detected_at: datetime

# Change Schemas
class ChangeEventDetail(BaseModel):
    id: int
    resource_id: int
    resource_name: str
    category: ResourceCategory
    field_name: str
    old_value: Any
    new_value: Any
    change_type: ChangeType
    detected_at: datetime
    evidence_url: Optional[str] = None
    collector_id: Optional[str] = None

# Watchlist Schemas
class WatchlistRequest(BaseModel):
    session_id: str
    resource_id: int

class WatchlistResponse(BaseModel):
    id: int
    session_id: str
    resource: ResourceDetail
    recent_changes: List[ChangeEventDetail]
    created_at: datetime

# Scraper Health Center Schemas
class CollectorHealthSummary(BaseModel):
    collector_id: str
    name: str
    category: ResourceCategory
    source_url: str
    status: CollectorStatus
    last_run_at: Optional[datetime]
    last_healed_at: Optional[datetime]
    heal_count: int
    records_count: int
    validation_pass_rate: float
    last_error: Optional[str] = None

class HealthDashboardResponse(BaseModel):
    total_collectors: int
    healthy_count: int
    degraded_count: int
    healing_count: int
    failed_count: int
    total_sources: int
    total_records: int
    overall_validation_rate: float
    last_collection_timestamp: Optional[datetime]
    collectors: List[CollectorHealthSummary]
    recent_runs: List[Dict[str, Any]]
    recent_healing_events: List[Dict[str, Any]]

# Demo Simulation Schemas
class DemoTriggerBreakRequest(BaseModel):
    collector_id: str = "c_hostel_sulekha_01"
    break_fields: List[str] = ["monthly_price", "curfew_time", "primary_contact"]

class DemoTriggerHealRequest(BaseModel):
    collector_id: str = "c_hostel_sulekha_01"
    problem_description: str = "Layout changed in hostel listings container. Missing price, curfew, and contact fields."

class DemoStatusResponse(BaseModel):
    collector_id: str
    status: CollectorStatus
    is_broken: bool
    broken_fields: List[str]
    validation_pass_rate: float
    heal_in_progress: bool
    last_healed_at: Optional[datetime]
    same_collector_id_verified: bool
    message: str
