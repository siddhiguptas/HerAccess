from typing import List, Dict, Any, Tuple, Optional
from backend.models.schemas import RankingFactor
from backend.models.enums import FreshnessLevel, VerificationStatus

class TransparentRankingEngine:
    @classmethod
    def evaluate_resource(
        cls,
        resource_attributes: Dict[str, Any],
        distance_km: float,
        budget_max: Optional[float],
        distance_max_km: float,
        freshness: FreshnessLevel,
        has_nearby_transport: bool,
        has_nearby_hospital: bool,
        verification_status: VerificationStatus = VerificationStatus.HIGH,
        num_sources: int = 1
    ) -> Tuple[float, List[RankingFactor]]:
        """
        Calculates a deterministic match score based on explicit criteria:
        - Category match: +2 per required category ecosystem link
        - Budget compliance: +2
        - Distance within requested radius: +2
        - Freshness GREEN: +2, YELLOW: +1
        - Verification HIGH: +2, MEDIUM: +1

        Provides transparent, factual checkmark explanations without fake AI percentages.
        """
        factors: List[RankingFactor] = []
        total_score = 0.0

        # 1. Budget Fit Factor
        monthly_price = resource_attributes.get("monthly_price")
        if monthly_price is not None and budget_max:
            if monthly_price <= budget_max:
                savings = budget_max - monthly_price
                label = f"Under requested budget (₹{monthly_price:,.0f} ≤ ₹{budget_max:,.0f})"
                if savings > 0:
                    label += f" — saves ₹{savings:,.0f}/mo"
                factors.append(RankingFactor(
                    factor_name="budget_fit",
                    label=f"✓ {label}",
                    score_contribution=2.0,
                    matched=True
                ))
                total_score += 2.0
            else:
                factors.append(RankingFactor(
                    factor_name="budget_fit",
                    label=f"✗ Exceeds target budget (₹{monthly_price:,.0f} > ₹{budget_max:,.0f})",
                    score_contribution=0.0,
                    matched=False
                ))
        elif monthly_price is not None:
            factors.append(RankingFactor(
                factor_name="budget_fit",
                label=f"✓ Verified monthly rate: ₹{monthly_price:,.0f}/month",
                score_contribution=2.0,
                matched=True
            ))
            total_score += 2.0
        else:
            factors.append(RankingFactor(
                factor_name="budget_fit",
                label="? Monthly pricing unknown from public source",
                score_contribution=0.0,
                matched=False
            ))

        # 2. Women-Only Verification
        women_only = resource_attributes.get("women_only")
        if women_only is True:
            factors.append(RankingFactor(
                factor_name="women_only",
                label="✓ Strictly women's accommodation verified in source evidence",
                score_contribution=2.0,
                matched=True
            ))
            total_score += 2.0
        elif women_only is False:
            factors.append(RankingFactor(
                factor_name="women_only",
                label="✗ Co-ed or mixed occupancy",
                score_contribution=0.0,
                matched=False
            ))
        else:
            factors.append(RankingFactor(
                factor_name="women_only",
                label="? Women-only policy unconfirmed in source",
                score_contribution=0.0,
                matched=False
            ))

        # 3. Distance from Target Hub
        if distance_km <= distance_max_km:
            factors.append(RankingFactor(
                factor_name="distance",
                label=f"✓ Within requested radius ({distance_km:.1f} km from target location)",
                score_contribution=2.0,
                matched=True
            ))
            total_score += 2.0
        else:
            factors.append(RankingFactor(
                factor_name="distance",
                label=f"✗ Outside preferred radius ({distance_km:.1f} km > {distance_max_km:.1f} km)",
                score_contribution=0.0,
                matched=False
            ))

        # 4. Public Transport Ecosystem
        if has_nearby_transport:
            factors.append(RankingFactor(
                factor_name="transport_nearby",
                label="✓ Direct public transport / metro rail link found nearby",
                score_contribution=2.0,
                matched=True
            ))
            total_score += 2.0

        # 5. Nearby Healthcare
        if has_nearby_hospital:
            factors.append(RankingFactor(
                factor_name="hospital_nearby",
                label="✓ Government / 24x7 emergency medical center in immediate proximity",
                score_contribution=2.0,
                matched=True
            ))
            total_score += 2.0

        # 6. Source Freshness
        if freshness == FreshnessLevel.GREEN:
            factors.append(RankingFactor(
                factor_name="freshness",
                label="✓ Fresh source data: verified within last 24 hours (GREEN)",
                score_contribution=2.0,
                matched=True
            ))
            total_score += 2.0
        elif freshness == FreshnessLevel.YELLOW:
            factors.append(RankingFactor(
                factor_name="freshness",
                label="✓ Recent source data: checked within past 7 days (YELLOW)",
                score_contribution=1.0,
                matched=True
            ))
            total_score += 1.0
        else:
            factors.append(RankingFactor(
                factor_name="freshness",
                label="! Older source data: last checked > 7 days ago (RED)",
                score_contribution=0.0,
                matched=False
            ))

        # 7. Verification Status
        if verification_status == VerificationStatus.HIGH:
            factors.append(RankingFactor(
                factor_name="verification",
                label="✓ High confidence: verifiable quote and official/verified domain",
                score_contribution=2.0,
                matched=True
            ))
            total_score += 2.0
        elif verification_status == VerificationStatus.MEDIUM:
            factors.append(RankingFactor(
                factor_name="verification",
                label="✓ Medium confidence: public directory listing",
                score_contribution=1.0,
                matched=True
            ))
            total_score += 1.0

        # 8. Multi-Source Corroboration
        if num_sources >= 2:
            factors.append(RankingFactor(
                factor_name="multi_source",
                label=f"✓ Corroborated by {num_sources} independent public sources",
                score_contribution=1.5,
                matched=True
            ))
            total_score += 1.5

        return round(total_score, 1), factors

