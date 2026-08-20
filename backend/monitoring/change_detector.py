from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.models.database import Snapshot, ChangeEvent, Resource
from backend.models.enums import ChangeType

class ChangeDetector:
    @classmethod
    def compare_and_record_changes(
        cls,
        db_session,
        resource_id: int,
        new_data: Dict[str, Any],
        observed_at: datetime,
        collector_id: Optional[str],
        source_url: Optional[str]
    ) -> List[ChangeEvent]:
        """
        Compares latest resource snapshot with new attributes payload.
        Generates ChangeEvent records for additions, updates, or removals.
        """
        # Fetch the most recent snapshot for this resource
        last_snapshot = db_session.query(Snapshot).filter(
            Snapshot.resource_id == resource_id
        ).order_by(Snapshot.observed_at.desc()).first()

        recorded_events = []
        old_data = last_snapshot.data if last_snapshot else {}

        # 1. Check for modified and added fields
        for key, new_val in new_data.items():
            if key not in old_data:
                # Field Added
                event = ChangeEvent(
                    resource_id=resource_id,
                    field_name=key,
                    old_value=None,
                    new_value=new_val,
                    change_type=ChangeType.ADDED,
                    detected_at=datetime.utcnow(),
                    evidence_url=source_url,
                    collector_id=collector_id
                )
                db_session.add(event)
                recorded_events.append(event)
            elif old_data[key] != new_val:
                # Field Modified
                event = ChangeEvent(
                    resource_id=resource_id,
                    field_name=key,
                    old_value=old_data[key],
                    new_value=new_val,
                    change_type=ChangeType.MODIFIED,
                    detected_at=datetime.utcnow(),
                    evidence_url=source_url,
                    collector_id=collector_id
                )
                db_session.add(event)
                recorded_events.append(event)

        # 2. Check for removed fields
        for key, old_val in old_data.items():
            if key not in new_data:
                event = ChangeEvent(
                    resource_id=resource_id,
                    field_name=key,
                    old_value=old_val,
                    new_value=None,
                    change_type=ChangeType.REMOVED,
                    detected_at=datetime.utcnow(),
                    evidence_url=source_url,
                    collector_id=collector_id
                )
                db_session.add(event)
                recorded_events.append(event)

        # Save new snapshot
        snapshot = Snapshot(
            resource_id=resource_id,
            collector_id=collector_id,
            data=new_data,
            observed_at=observed_at
        )
        db_session.add(snapshot)
        db_session.commit()

        return recorded_events
