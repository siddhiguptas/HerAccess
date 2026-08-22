from sqlalchemy.orm import Session
from typing import List, Optional
from backend.models.database import Resource, Conflict
from backend.models.schemas import ResourceDetail, ConflictDetail, AttributeProvenance, EvidenceCard, SupportChainItem
from backend.models.enums import ResourceCategory
from backend.verification.freshness import FreshnessCalculator
from backend.services.geo import GeoService
from backend.repositories.resource_repository import ResourceRepository

class ResourceService:
    @staticmethod
    def list_resources(db: Session, category: Optional[ResourceCategory] = None, city: Optional[str] = "Lucknow", locality: Optional[str] = None) -> List[ResourceDetail]:
        query = db.query(Resource).filter(Resource.is_active == True)
        if category:
            query = query.filter(Resource.category == category)
        if city:
            query = query.filter(Resource.city.ilike(f"%{city}%"))
        if locality:
            query = query.filter(Resource.locality.ilike(f"%{locality}%"))

        resources = query.all()
        results = []
        repo = ResourceRepository(db)
        for res in resources:
            attributes, evidence_cards = ResourceService._build_attributes_and_evidence(res)
            conflict_count = repo.get_unresolved_conflict_count(res.id)
            is_real = any(a.collector_id == "c_mt1f0ke713h6n32pi4" for a in res.attributes)
            
            results.append(ResourceDetail(
                id=res.id,
                category=res.category,
                name=res.name,
                city=res.city,
                locality=res.locality,
                address=res.address,
                latitude=res.latitude,
                longitude=res.longitude,
                primary_contact=res.primary_contact,
                source_url=res.source_url,
                freshness=FreshnessCalculator.calculate_freshness(res.updated_at),
                observed_at=res.updated_at,
                is_real_data=is_real,
                data_source_badge="REAL BRIGHT DATA DATA" if is_real else "FIXTURE / DEMO DATA",
                attributes=attributes,
                evidence_cards=evidence_cards,
                why_this_result=[],
                support_chain=[],
                distance_km=0.0,
                match_score=100.0,
                has_conflicts=(conflict_count > 0)
            ))
        return results

    @staticmethod
    def get_resource_detail(db: Session, resource_id: int) -> Optional[ResourceDetail]:
        res = db.query(Resource).filter(Resource.id == resource_id).first()
        if not res:
            return None

        attributes, evidence_cards = ResourceService._build_attributes_and_evidence(res)
        
        chain_dicts = GeoService.build_local_support_chain(
            db,
            res.latitude or 26.85,
            res.longitude or 80.94,
            res.id
        )
        support_chain = [
            SupportChainItem(
                category=c["category"],
                resource_id=c["resource_id"],
                name=c["name"],
                locality=c.get("locality"),
                distance_km=c["distance_km"],
                key_detail=c["key_detail"],
                source_url=c["source_url"],
                is_real_data=c.get("is_real_data", False),
                data_source_badge=c.get("data_source_badge", "FIXTURE DATA")
            ) for c in chain_dicts
        ]

        repo = ResourceRepository(db)
        conflict_count = repo.get_unresolved_conflict_count(res.id)
        is_real = any(a.collector_id == "c_mt1f0ke713h6n32pi4" for a in res.attributes)

        return ResourceDetail(
            id=res.id,
            category=res.category,
            name=res.name,
            city=res.city,
            locality=res.locality,
            address=res.address,
            latitude=res.latitude,
            longitude=res.longitude,
            primary_contact=res.primary_contact,
            source_url=res.source_url,
            freshness=FreshnessCalculator.calculate_freshness(res.updated_at),
            observed_at=res.updated_at,
            is_real_data=is_real,
            data_source_badge="REAL BRIGHT DATA DATA" if is_real else "FIXTURE / DEMO DATA",
            attributes=attributes,
            evidence_cards=evidence_cards,
            why_this_result=[],
            support_chain=support_chain,
            distance_km=0.0,
            match_score=100.0,
            has_conflicts=(conflict_count > 0)
        )

    @staticmethod
    def list_conflicts(db: Session) -> List[ConflictDetail]:
        conflicts = db.query(Conflict).all()
        out = []
        for c in conflicts:
            res = db.query(Resource).filter(Resource.id == c.resource_id).first()
            out.append(ConflictDetail(
                id=c.id,
                resource_id=c.resource_id,
                resource_name=res.name if res else "Unknown",
                category=res.category if res else ResourceCategory.WOMEN_HOSTEL,
                field_name=c.field_name,
                value_a=c.value_a,
                source_a_url=c.source_a_url,
                source_a_observed_at=c.source_a_observed_at,
                value_b=c.value_b,
                source_b_url=c.source_b_url,
                source_b_observed_at=c.source_b_observed_at,
                status=c.status,
                detected_at=c.detected_at
            ))
        return out

    @staticmethod
    def _build_attributes_and_evidence(res: Resource):
        attributes = []
        evidence_cards = []
        for attr in res.attributes:
            freshness = FreshnessCalculator.calculate_freshness(attr.observed_at)
            attributes.append(AttributeProvenance(
                field_name=attr.field_name,
                raw_value=attr.raw_value,
                normalized_value=attr.normalized_value,
                source_url=attr.source_url,
                source_domain=attr.source_domain,
                evidence_text=attr.evidence_text,
                observed_at=attr.observed_at,
                collector_id=attr.collector_id,
                verification_status=attr.verification_status,
                freshness=freshness
            ))
            if attr.evidence_text:
                evidence_cards.append(EvidenceCard(
                    field_name=attr.field_name,
                    claimed_value=attr.normalized_value if attr.normalized_value is not None else attr.raw_value,
                    evidence_quote=attr.evidence_text,
                    source_url=attr.source_url,
                    source_domain=attr.source_domain,
                    observed_at=attr.observed_at,
                    verification_status=attr.verification_status,
                    freshness_level=freshness,
                    collector_id=attr.collector_id or "c_unknown"
                ))
        return attributes, evidence_cards
