from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.models.database import get_db, ChangeEvent, Resource
from backend.models.schemas import ChangeEventDetail
from backend.models.enums import ResourceCategory

router = APIRouter(prefix="/changes", tags=["Changes"])

@router.get("", response_model=List[ChangeEventDetail])
def list_changes(
    category: Optional[ResourceCategory] = None,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List historical changes across public resources."""
    query = db.query(ChangeEvent).join(Resource, ChangeEvent.resource_id == Resource.id)
    if category:
        query = query.filter(Resource.category == category)

    changes = query.order_by(ChangeEvent.detected_at.desc()).limit(limit).all()
    results = []
    for c in changes:
        res = db.query(Resource).filter(Resource.id == c.resource_id).first()
        results.append(ChangeEventDetail(
            id=c.id,
            resource_id=c.resource_id,
            resource_name=res.name if res else "Unknown",
            category=res.category if res else ResourceCategory.WOMEN_HOSTEL,
            field_name=c.field_name,
            old_value=c.old_value,
            new_value=c.new_value,
            change_type=c.change_type,
            detected_at=c.detected_at,
            evidence_url=c.evidence_url,
            collector_id=c.collector_id
        ))
    return results

@router.get("/{resource_id}", response_model=List[ChangeEventDetail])
def get_resource_changes(resource_id: int, db: Session = Depends(get_db)):
    """List change history for a specific resource."""
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    changes = db.query(ChangeEvent).filter(
        ChangeEvent.resource_id == resource_id
    ).order_by(ChangeEvent.detected_at.desc()).all()

    return [
        ChangeEventDetail(
            id=c.id,
            resource_id=c.resource_id,
            resource_name=res.name if res else "Unknown",
            category=res.category if res else ResourceCategory.WOMEN_HOSTEL,
            field_name=c.field_name,
            old_value=c.old_value,
            new_value=c.new_value,
            change_type=c.change_type,
            detected_at=c.detected_at,
            evidence_url=c.evidence_url,
            collector_id=c.collector_id
        ) for c in changes
    ]
