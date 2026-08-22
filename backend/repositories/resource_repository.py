from typing import List, Optional
from sqlalchemy.orm import Session
from backend.models.database import Resource, Conflict
from backend.models.enums import ResourceCategory

class ResourceRepository:
    def __init__(self, db_session: Session):
        self.db = db_session

    def get_active_by_category(self, category: ResourceCategory) -> List[Resource]:
        return self.db.query(Resource).filter(
            Resource.category == category,
            Resource.is_active == True
        ).all()
        
    def get_active_with_coordinates_by_category(self, category: ResourceCategory, exclude_id: Optional[int] = None) -> List[Resource]:
        query = self.db.query(Resource).filter(
            Resource.category == category,
            Resource.is_active == True,
            Resource.latitude.isnot(None),
            Resource.longitude.isnot(None)
        )
        if exclude_id is not None:
            query = query.filter(Resource.id != exclude_id)
        return query.all()

    def get_unresolved_conflict_count(self, resource_id: int) -> int:
        return self.db.query(Conflict).filter(
            Conflict.resource_id == resource_id,
            Conflict.status == "unresolved"
        ).count()
