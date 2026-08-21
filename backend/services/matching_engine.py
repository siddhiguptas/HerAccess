import time
from typing import List, Dict, Any, Optional
from backend.models.database import Resource, ResourceAttribute, Evidence, Conflict
from backend.models.schemas import (
    ParsedIntent, SearchResponse, ResourceDetail,
    AttributeProvenance, EvidenceCard, SupportChainItem
)
from backend.models.enums import ResourceCategory, FreshnessLevel, VerificationStatus, REAL_BRIGHT_DATA_COLLECTOR_IDS
from backend.services.geo import GeoService
from backend.services.ranking import TransparentRankingEngine
from backend.verification.freshness import FreshnessCalculator

class MatchingEngine:
    @classmethod
    def execute_search(cls, db_session, intent: ParsedIntent) -> SearchResponse:
        start_time = time.time()
        
        # 1. Resolve Target Coordinates
        target_lat, target_lon = GeoService.resolve_target_coordinates(intent.target_location, intent.city)

        # 2. Query Primary Candidates (Women Hostels as anchor, or specified category)
        primary_cat = intent.required_categories[0] if intent.required_categories else ResourceCategory.WOMEN_HOSTEL
        primary_candidates = db_session.query(Resource).filter(
            Resource.category == primary_cat,
            Resource.is_active == True
        ).all()

        results: List[ResourceDetail] = []

        for res in primary_candidates:
            # Calculate distance from target based on resolved coordinates
            lat = res.latitude
            lon = res.longitude
            if lat is None or lon is None:
                lat, lon = GeoService.resolve_target_coordinates(res.locality or res.address or res.name, res.city or intent.city)
            dist_km = GeoService.haversine_distance(target_lat, target_lon, lat, lon)

            # Build attribute provenance list & extract map of normalized attributes
            attributes_provenance: List[AttributeProvenance] = []
            evidence_cards: List[EvidenceCard] = []
            attr_map: Dict[str, Any] = {}
            most_recent_observed = res.updated_at

            for attr in res.attributes:
                freshness = FreshnessCalculator.calculate_freshness(attr.observed_at)
                attr_map[attr.field_name] = attr.normalized_value

                if attr.observed_at and attr.observed_at > most_recent_observed:
                    most_recent_observed = attr.observed_at

                prov = AttributeProvenance(
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
                )
                attributes_provenance.append(prov)

                # Evidence Card
                if attr.evidence_text:
                    card = EvidenceCard(
                        field_name=attr.field_name,
                        claimed_value=attr.normalized_value or attr.raw_value,
                        evidence_quote=attr.evidence_text,
                        source_url=attr.source_url,
                        source_domain=attr.source_domain,
                        observed_at=attr.observed_at,
                        verification_status=attr.verification_status,
                        freshness_level=freshness,
                        collector_id=attr.collector_id or "c_unknown"
                    )
                    evidence_cards.append(card)

            # Check if has unresolved conflicts
            conflict_count = db_session.query(Conflict).filter(
                Conflict.resource_id == res.id,
                Conflict.status == "unresolved"
            ).count()

            # Build Local Support Chain
            chain_dicts = GeoService.build_local_support_chain(db_session, lat, lon, res.id)
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

            has_nearby_transport = any(c["category"] == ResourceCategory.PUBLIC_TRANSPORT and c["distance_km"] <= 3.0 for c in chain_dicts)
            has_nearby_hospital = any(c["category"] == ResourceCategory.HOSPITAL and c["distance_km"] <= 4.0 for c in chain_dicts)

            res_freshness = FreshnessCalculator.calculate_freshness(most_recent_observed)

            # Hard Filters enforcement:
            # 1. Budget Hard filter: If user has explicitly specified budget, exclude items whose monthly_price strictly exceeds budget
            monthly_price = attr_map.get("monthly_price")
            if intent.budget_max and monthly_price and monthly_price > intent.budget_max:
                # If price is known and exceeds budget, skip from primary matches
                continue

            # 2. Women-Only Hard filter: If intent requires women_only, exclude confirmed mixed/co-ed places
            if intent.preferences.get("women_only") and attr_map.get("women_only") is False:
                continue

            is_real = any(a.collector_id in REAL_BRIGHT_DATA_COLLECTOR_IDS for a in res.attributes)
            is_sulekha_dir = any(a.collector_id == "c_mt1i5ri4trltbvw66" or (a.source_url and "sulekha.com" in a.source_url) for a in res.attributes)
            has_direct_source = any(a.collector_id == "c_mt1f0ke713h6n32pi4" or (a.source_url and "kamlagirlshostel.com" in a.source_url) for a in res.attributes)
            
            distinct_domains = set(a.source_domain for a in res.attributes if a.source_domain)
            num_sources = len(distinct_domains)

            res_ver_status = VerificationStatus.HIGH if has_direct_source else (VerificationStatus.MEDIUM if is_sulekha_dir else VerificationStatus.HIGH)

            # Evaluate Ranking Score and Why This Result Factors
            match_score, why_factors = TransparentRankingEngine.evaluate_resource(
                resource_attributes=attr_map,
                distance_km=dist_km,
                budget_max=intent.budget_max,
                distance_max_km=intent.distance_max_km or 5.0,
                freshness=res_freshness,
                has_nearby_transport=has_nearby_transport,
                has_nearby_hospital=has_nearby_hospital,
                verification_status=res_ver_status,
                num_sources=num_sources,
                meals_requested=bool(intent.preferences.get("meals_included")),
                location_resolved=getattr(intent, 'location_resolved', True),
                target_location=intent.target_location
            )

            if is_sulekha_dir and has_direct_source:
                data_badge = "MULTI-SOURCE (Direct + Sulekha Directory)"
            elif is_sulekha_dir:
                data_badge = "Sulekha Directory (Real Bright Data)"
            elif is_real:
                data_badge = "REAL BRIGHT DATA DATA"
            else:
                data_badge = "FIXTURE / DEMO DATA"

            detail = ResourceDetail(
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
                freshness=res_freshness,
                observed_at=most_recent_observed,
                is_real_data=is_real,
                data_source_badge=data_badge,
                attributes=attributes_provenance,
                evidence_cards=evidence_cards,
                why_this_result=why_factors,
                support_chain=support_chain,
                distance_km=dist_km,
                match_score=match_score,
                has_conflicts=(conflict_count > 0)
            )
            results.append(detail)

        # Sort results by match score descending
        results.sort(key=lambda r: r.match_score or 0.0, reverse=True)

        # 3. Fetch Nearby Support Ecosystem (all other categories for map visualization)
        ecosystem: Dict[str, List[ResourceDetail]] = {}
        for cat in ResourceCategory:
            if cat == primary_cat:
                continue
            cat_resources = db_session.query(Resource).filter(
                Resource.category == cat,
                Resource.is_active == True
            ).all()

            cat_details = []
            for r in cat_resources:
                r_lat = r.latitude or target_lat
                r_lon = r.longitude or target_lon
                r_dist = GeoService.haversine_distance(target_lat, target_lon, r_lat, r_lon)

                r_attrs: List[AttributeProvenance] = []
                r_evs: List[EvidenceCard] = []
                for a in r.attributes:
                    f_lvl = FreshnessCalculator.calculate_freshness(a.observed_at)
                    r_attrs.append(AttributeProvenance(
                        field_name=a.field_name,
                        raw_value=a.raw_value,
                        normalized_value=a.normalized_value,
                        source_url=a.source_url,
                        source_domain=a.source_domain,
                        evidence_text=a.evidence_text,
                        observed_at=a.observed_at,
                        collector_id=a.collector_id,
                        verification_status=a.verification_status,
                        freshness=f_lvl
                    ))
                    if a.evidence_text:
                        r_evs.append(EvidenceCard(
                            field_name=a.field_name,
                            claimed_value=a.normalized_value or a.raw_value,
                            evidence_quote=a.evidence_text,
                            source_url=a.source_url,
                            source_domain=a.source_domain,
                            observed_at=a.observed_at,
                            verification_status=a.verification_status,
                            freshness_level=f_lvl,
                            collector_id=a.collector_id or "c_unknown"
                        ))

                r_is_real = any(a.collector_id in REAL_BRIGHT_DATA_COLLECTOR_IDS for a in r.attributes)
                cat_details.append(ResourceDetail(
                    id=r.id,
                    category=r.category,
                    name=r.name,
                    city=r.city,
                    locality=r.locality,
                    address=r.address,
                    latitude=r.latitude,
                    longitude=r.longitude,
                    primary_contact=r.primary_contact,
                    source_url=r.source_url,
                    freshness=FreshnessCalculator.calculate_freshness(r.updated_at),
                    observed_at=r.updated_at,
                    is_real_data=r_is_real,
                    data_source_badge="REAL BRIGHT DATA DATA" if r_is_real else "FIXTURE / DEMO DATA",
                    attributes=r_attrs,
                    evidence_cards=r_evs,
                    why_this_result=[],
                    support_chain=[],
                    distance_km=r_dist,
                    match_score=100.0,
                    has_conflicts=False
                ))
            ecosystem[cat.value] = cat_details

        execution_ms = round((time.time() - start_time) * 1000, 2)

        return SearchResponse(
            intent=intent,
            total_found=len(results),
            primary_results=results,
            nearby_support_ecosystem=ecosystem,
            execution_time_ms=execution_ms
        )
