from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.models.database import Resource, ResourceAttribute, Conflict

class ConflictDetector:
    @staticmethod
    def are_values_conflicting(val1: Any, val2: Any, field_name: str) -> bool:
        """Determines if two values from different sources represent a genuine factual conflict."""
        if val1 is None or val2 is None:
            return False
            
        if val1 == val2:
            return False
            
        # Price difference > 5% is a conflict
        if "price" in field_name or "deposit" in field_name:
            try:
                p1, p2 = float(val1), float(val2)
                if abs(p1 - p2) > max(p1, p2) * 0.05:
                    return True
                return False
            except (ValueError, TypeError):
                return False
                
        # Curfew difference is a conflict
        if "curfew" in field_name:
            return str(val1).strip().lower() != str(val2).strip().lower()

        # Boolean mismatch is a conflict
        if isinstance(val1, bool) and isinstance(val2, bool):
            return val1 != val2

        return False

    @classmethod
    def check_and_record_conflict(
        cls,
        db_session,
        resource_id: int,
        field_name: str,
        new_val: Any,
        new_source_url: str,
        new_observed_at: datetime
    ) -> Optional[Conflict]:
        """
        Compares new attribute value with existing attributes for the same resource.
        If a conflict exists between two different sources, records a Conflict entry.
        """
        existing_attrs = db_session.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == resource_id,
            ResourceAttribute.field_name == field_name,
            ResourceAttribute.source_url != new_source_url
        ).all()

        for old_attr in existing_attrs:
            if cls.are_values_conflicting(old_attr.normalized_value, new_val, field_name):
                # Check if conflict already logged
                existing_conflict = db_session.query(Conflict).filter(
                    Conflict.resource_id == resource_id,
                    Conflict.field_name == field_name,
                    Conflict.status == "unresolved"
                ).first()

                if not existing_conflict:
                    conflict = Conflict(
                        resource_id=resource_id,
                        field_name=field_name,
                        value_a=old_attr.normalized_value,
                        source_a_url=old_attr.source_url,
                        source_a_observed_at=old_attr.observed_at,
                        value_b=new_val,
                        source_b_url=new_source_url,
                        source_b_observed_at=new_observed_at,
                        status="unresolved",
                        detected_at=datetime.utcnow()
                    )
                    db_session.add(conflict)
                    db_session.commit()
                    return conflict
                    
        return None
