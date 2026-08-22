from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.models.database import get_db
from backend.models.schemas import ResourceDetail, ConflictDetail
from backend.models.enums import ResourceCategory
from backend.services.resource_service import ResourceService

router = APIRouter(prefix="/resources", tags=["Resources"])

@router.get("", response_model=List[ResourceDetail])
def list_resources(
    category: Optional[ResourceCategory] = None,
    city: Optional[str] = "Lucknow",
    locality: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all verified public resources filtered by category and locality."""
    return ResourceService.list_resources(db, category, city, locality)

@router.get("/conflicts", response_model=List[ConflictDetail])
def list_conflicts(db: Session = Depends(get_db)):
    """List all detected cross-source factual conflicts."""
    return ResourceService.list_conflicts(db)

@router.get("/{resource_id}", response_model=ResourceDetail)
def get_resource_detail(resource_id: int, db: Session = Depends(get_db)):
    """Get rich detail, provenance attributes, and evidence cards for a specific resource."""
    detail = ResourceService.get_resource_detail(db, resource_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Resource not found")
    return detail
