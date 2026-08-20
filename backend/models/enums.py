from enum import Enum

class ResourceCategory(str, Enum):
    WOMEN_HOSTEL = "women_hostel"
    PUBLIC_TRANSPORT = "public_transport"
    HOSPITAL = "hospital"
    PHARMACY = "pharmacy"
    POLICE_OR_PUBLIC_SUPPORT = "police_or_public_support"
    WOMEN_SUPPORT = "women_support"

class VerificationStatus(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    CONFLICT = "conflict"
    UNVERIFIED = "unverified"

class FreshnessLevel(str, Enum):
    GREEN = "green"    # < 24h
    YELLOW = "yellow"  # 1-7 days
    RED = "red"        # > 7 days

class CollectorStatus(str, Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    HEALING = "healing"
    FAILED = "failed"
    NEEDS_REVIEW = "needs_review"

class CollectionRunStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    VALIDATION_FAILED = "validation_failed"

class ChangeType(str, Enum):
    ADDED = "added"
    MODIFIED = "modified"
    REMOVED = "removed"

class HealingStatus(str, Enum):
    TRIGGERED = "triggered"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    FAILED = "failed"
    REJECTED = "rejected"

REAL_BRIGHT_DATA_COLLECTOR_IDS = {
    "c_mt1f0ke713h6n32pi4",  # Kamla Girls Hostel
    "c_mt1i5ri4trltbvw66",  # Sulekha Lucknow Women Hostels Directory
    "c_mt1ftf047f6ulzznq",  # UPMRC Lucknow Metro
    "c_mt1fujyq16vhxxfg7x",  # KGMU Healthcare Hospital
    "c_mt1fuw0q54wsjtyfq",  # Apollo Pharmacy
    "c_mt1nlu1w3pkwb2h1i",  # Lucknow Metro Wikipedia Scraper Studio
    "c_mt1ogapv1t1nhs5rht",  # Apollo Hospitals Lucknow Scraper Studio
    "c_mt1palv71amwtj4yp4",  # University of Lucknow Women's Hostels Scraper Studio
    "c_mt1qwsbmqm9fi1vu6"   # UP Mahila Kalyan Women Support & Emergency Helplines
}

