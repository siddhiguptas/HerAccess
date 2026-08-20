from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from backend.models.database import get_db, Watchlist, Resource, ChangeEvent
from backend.models.schemas import WatchlistRequest, WatchlistResponse, ResourceDetail, ChangeEventDetail
from backend.api.resources import get_resource_detail

router = APIRouter(prefix="/watch", tags=["Watchlist"])

@router.post("", response_model=WatchlistResponse)
def add_to_watchlist(req: WatchlistRequest, db: Session = Depends(get_db)):
    """Watch a resource for continuous monitoring and future change alerts."""
    res = db.query(Resource).filter(Resource.id == req.resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")

    existing = db.query(Watchlist).filter(
        Watchlist.user_session_id == req.session_id,
        Watchlist.resource_id == req.resource_id
    ).first()

    if not existing:
        item = Watchlist(
            user_session_id=req.session_id,
            resource_id=req.resource_id,
            created_at=datetime.utcnow()
        )
        db.add(item)
        db.commit()
        db.refresh(item)
    else:
        item = existing

    resource_detail = get_resource_detail(req.resource_id, db)
    
    # Get recent changes for this resource
    changes = db.query(ChangeEvent).filter(
        ChangeEvent.resource_id == req.resource_id
    ).order_by(ChangeEvent.detected_at.desc()).limit(10).all()

    change_details = [
        ChangeEventDetail(
            id=c.id,
            resource_id=c.resource_id,
            resource_name=res.name,
            category=res.category,
            field_name=c.field_name,
            old_value=c.old_value,
            new_value=c.new_value,
            change_type=c.change_type,
            detected_at=c.detected_at,
            evidence_url=c.evidence_url,
            collector_id=c.collector_id
        ) for c in changes
    ]

    return WatchlistResponse(
        id=item.id,
        session_id=item.user_session_id,
        resource=resource_detail,
        recent_changes=change_details,
        created_at=item.created_at
    )

@router.get("", response_model=List[WatchlistResponse])
def get_watchlist(session_id: str, db: Session = Depends(get_db)):
    """Retrieve all watched resources for a user session."""
    items = db.query(Watchlist).filter(Watchlist.user_session_id == session_id).all()
    results = []
    for item in items:
        res = db.query(Resource).filter(Resource.id == item.resource_id).first()
        if not res:
            continue
        resource_detail = get_resource_detail(item.resource_id, db)
        changes = db.query(ChangeEvent).filter(
            ChangeEvent.resource_id == item.resource_id
        ).order_by(ChangeEvent.detected_at.desc()).limit(5).all()

        change_details = [
            ChangeEventDetail(
                id=c.id,
                resource_id=c.resource_id,
                resource_name=res.name,
                category=res.category,
                field_name=c.field_name,
                old_value=c.old_value,
                new_value=c.new_value,
                change_type=c.change_type,
                detected_at=c.detected_at,
                evidence_url=c.evidence_url,
                collector_id=c.collector_id
            ) for c in changes
        ]

        results.append(WatchlistResponse(
            id=item.id,
            session_id=item.user_session_id,
            resource=resource_detail,
            recent_changes=change_details,
            created_at=item.created_at
        ))
    return results

@router.delete("/{resource_id}")
def remove_from_watchlist(resource_id: int, session_id: str, db: Session = Depends(get_db)):
    """Unwatch a resource."""
    item = db.query(Watchlist).filter(
        Watchlist.user_session_id == session_id,
        Watchlist.resource_id == resource_id
    ).first()
    if item:
        db.delete(item)
        db.commit()
    return {"message": "Resource removed from watchlist"}
