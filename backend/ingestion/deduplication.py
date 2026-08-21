import math
from typing import Optional
from backend.models.database import Resource

class EntityResolver:
    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate the great circle distance in kilometers between two points."""
        R = 6371.0 # Earth radius in kilometers
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return R * c

    @classmethod
    def find_duplicate_resource(cls, db_session, name: str, category: str, lat: Optional[float], lon: Optional[float], threshold_km: float = 0.25) -> Optional[Resource]:
        """
        Check if an entity already exists in DB based on distinctive name tokens, locality, or close coordinates.
        Carefully avoids merging different hostels with generic names like 'Girls PG' in different areas.
        """
        query = db_session.query(Resource).filter(Resource.category == category)
        candidates = query.all()
        
        normalized_target_name = name.lower().strip()
        generic_tokens = {"girls", "hostel", "pg", "women", "womens", "ladies", "living", "space", "residency", "&", "the", "and", "in", "lucknow", "uttar", "pradesh", "state", "government", "govt", "department", "center", "centre"}
        distinct_target_words = set(w for w in normalized_target_name.split() if w not in generic_tokens)

        for cand in candidates:
            cand_name_norm = cand.name.lower().strip()
            # 1. Exact normalized name match
            if cand_name_norm == normalized_target_name:
                return cand
            
            # 2. Distinctive name words match (e.g. 'kamla', 'shree shyam', 'ananya')
            distinct_cand_words = set(w for w in cand_name_norm.split() if w not in generic_tokens)
            if distinct_target_words and distinct_cand_words and distinct_target_words == distinct_cand_words:
                return cand
            
            # 3. Geo proximity (< 250 meters) with distinctive token overlap
            if lat and lon and cand.latitude and cand.longitude:
                dist = cls.haversine_distance(lat, lon, cand.latitude, cand.longitude)
                if dist < threshold_km:
                    if distinct_target_words.intersection(distinct_cand_words):
                        return cand
                        
        return None
