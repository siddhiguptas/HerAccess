from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Boolean, DateTime,
    ForeignKey, Text, JSON, Enum as SQLEnum
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from backend.config import settings
from backend.models.enums import (
    ResourceCategory, VerificationStatus, CollectorStatus,
    CollectionRunStatus, ChangeType, HealingStatus
)

Base = declarative_base()

class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(512), unique=True, nullable=False, index=True)
    domain = Column(String(256), nullable=False, index=True)
    name = Column(String(256), nullable=False)
    category = Column(SQLEnum(ResourceCategory), nullable=False)
    reliability_tier = Column(String(50), default="public_web") # official_gov, university, verified_directory, public_web
    last_scraped_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    collectors = relationship("Collector", back_populates="source")
    attributes = relationship("ResourceAttribute", back_populates="source_rel")

class Collector(Base):
    __tablename__ = "collectors"

    id = Column(Integer, primary_key=True, index=True)
    collector_id = Column(String(128), unique=True, nullable=False, index=True) # e.g. c_hostel_sulekha_01
    name = Column(String(256), nullable=False)
    category = Column(SQLEnum(ResourceCategory), nullable=False)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=True)
    target_url = Column(String(512), nullable=False)
    extraction_prompt = Column(Text, nullable=True)
    status = Column(SQLEnum(CollectorStatus), default=CollectorStatus.HEALTHY)
    last_run_at = Column(DateTime, nullable=True)
    last_healed_at = Column(DateTime, nullable=True)
    heal_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    source = relationship("Source", back_populates="collectors")
    runs = relationship("CollectionRun", back_populates="collector")
    healing_events = relationship("HealingEvent", back_populates="collector")

class CollectionRun(Base):
    __tablename__ = "collection_runs"

    id = Column(Integer, primary_key=True, index=True)
    collector_id = Column(String(128), ForeignKey("collectors.collector_id"), nullable=False)
    triggered_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(SQLEnum(CollectionRunStatus), default=CollectionRunStatus.PENDING)
    records_count = Column(Integer, default=0)
    raw_payload_path = Column(String(512), nullable=True)
    validation_pass_rate = Column(Float, default=1.0)
    error_summary = Column(Text, nullable=True)

    collector = relationship("Collector", back_populates="runs")
    snapshots = relationship("Snapshot", back_populates="collection_run")

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(SQLEnum(ResourceCategory), nullable=False, index=True)
    name = Column(String(256), nullable=False, index=True)
    city = Column(String(128), default="Lucknow", nullable=False, index=True)
    locality = Column(String(128), nullable=True, index=True)
    address = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    primary_contact = Column(String(128), nullable=True)
    source_url = Column(String(512), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    attributes = relationship("ResourceAttribute", back_populates="resource", cascade="all, delete-orphan")
    snapshots = relationship("Snapshot", back_populates="resource", cascade="all, delete-orphan")
    change_events = relationship("ChangeEvent", back_populates="resource", cascade="all, delete-orphan")
    conflicts = relationship("Conflict", back_populates="resource", cascade="all, delete-orphan")
    watchlist_items = relationship("Watchlist", back_populates="resource", cascade="all, delete-orphan")

class ResourceAttribute(Base):
    __tablename__ = "resource_attributes"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    field_name = Column(String(128), nullable=False, index=True) # e.g. monthly_price, curfew_time, women_only
    raw_value = Column(Text, nullable=True)
    normalized_value = Column(JSON, nullable=True) # supports string, int, float, bool, or list
    source_url = Column(String(512), nullable=False)
    source_domain = Column(String(256), nullable=False)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=True)
    evidence_text = Column(Text, nullable=True) # verbatim excerpt extracted by scraper
    observed_at = Column(DateTime, default=datetime.utcnow, index=True)
    collector_id = Column(String(128), nullable=True)
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.HIGH)
    confidence_score = Column(Float, default=1.0)

    resource = relationship("Resource", back_populates="attributes")
    source_rel = relationship("Source", back_populates="attributes")

class Evidence(Base):
    __tablename__ = "evidence_records"

    id = Column(Integer, primary_key=True, index=True)
    attribute_id = Column(Integer, ForeignKey("resource_attributes.id"), nullable=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    field_name = Column(String(128), nullable=False)
    evidence_quote = Column(Text, nullable=False)
    source_url = Column(String(512), nullable=False)
    observed_at = Column(DateTime, default=datetime.utcnow)
    extracted_by_collector = Column(String(128), nullable=True)

class Snapshot(Base):
    __tablename__ = "snapshots"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    collection_run_id = Column(Integer, ForeignKey("collection_runs.id"), nullable=True)
    collector_id = Column(String(128), nullable=True)
    data = Column(JSON, nullable=False) # structured dictionary snapshot of all attributes at time of capture
    observed_at = Column(DateTime, default=datetime.utcnow, index=True)

    resource = relationship("Resource", back_populates="snapshots")
    collection_run = relationship("CollectionRun", back_populates="snapshots")

class ChangeEvent(Base):
    __tablename__ = "change_events"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    field_name = Column(String(128), nullable=False)
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    change_type = Column(SQLEnum(ChangeType), nullable=False)
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    evidence_url = Column(String(512), nullable=True)
    collector_id = Column(String(128), nullable=True)

    resource = relationship("Resource", back_populates="change_events")

class Conflict(Base):
    __tablename__ = "conflicts"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    field_name = Column(String(128), nullable=False)
    value_a = Column(JSON, nullable=True)
    source_a_url = Column(String(512), nullable=False)
    source_a_observed_at = Column(DateTime, default=datetime.utcnow)
    value_b = Column(JSON, nullable=True)
    source_b_url = Column(String(512), nullable=False)
    source_b_observed_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="unresolved") # unresolved, verified_a, verified_b, stale
    detected_at = Column(DateTime, default=datetime.utcnow)

    resource = relationship("Resource", back_populates="conflicts")

class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)
    user_session_id = Column(String(128), nullable=False, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_notified_at = Column(DateTime, nullable=True)

    resource = relationship("Resource", back_populates="watchlist_items")

class HealingEvent(Base):
    __tablename__ = "healing_events"

    id = Column(Integer, primary_key=True, index=True)
    collector_id = Column(String(128), ForeignKey("collectors.collector_id"), nullable=False)
    problem_description = Column(Text, nullable=False)
    failed_fields = Column(JSON, nullable=True)
    status = Column(SQLEnum(HealingStatus), default=HealingStatus.TRIGGERED)
    triggered_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    fields_recovered = Column(JSON, nullable=True)
    fix_details = Column(Text, nullable=True)

    collector = relationship("Collector", back_populates="healing_events")

class CoverageExpansionJob(Base):
    __tablename__ = "coverage_expansion_jobs"

    id = Column(Integer, primary_key=True, index=True)
    locality = Column(String(256), nullable=False)
    city = Column(String(128), default="Lucknow", nullable=False)
    category = Column(String(128), nullable=True)  # optional category filter
    status = Column(String(50), default="pending", nullable=False, index=True)  # pending, collecting, processing, verifying, completed, failed
    records_found = Column(Integer, default=0)
    records_accepted = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    bright_data_collector_id = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(128), unique=True, index=True, nullable=False)
    city = Column(String(128), default="Lucknow")
    target_location = Column(String(256), nullable=True)
    user_type = Column(String(64), default="female_student")
    budget_max = Column(Float, nullable=True)
    distance_preference_km = Column(Float, default=5.0)
    required_categories = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Database Engine & Session Factory
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
