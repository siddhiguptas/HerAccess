import math
from typing import Optional, List, Dict, Any, Tuple
from backend.models.database import Resource
from backend.models.enums import ResourceCategory, REAL_BRIGHT_DATA_COLLECTOR_IDS

# Reference Coordinates for Lucknow Key Hubs & Metro Stations
LUCKNOW_LOCALITY_COORDINATES = {
    "hazratganj": (26.8528, 80.9463),
    "gomti nagar": (26.8654, 80.9984),
    "indira nagar": (26.8834, 80.9856),
    "alambagh": (26.8123, 80.9015),
    "alambagh isbt": (26.8155, 80.9022),
    "lda colony": (26.7930, 80.8970),
    "kanpur road": (26.7950, 80.8990),
    "kanpur rd": (26.7950, 80.8990),
    "jankipuram": (26.9152, 80.9421),
    "university campus": (26.9152, 80.9421),
    "university second campus": (26.9152, 80.9421),
    "university new campus": (26.9152, 80.9421),
    "lucknow university new campus": (26.9152, 80.9421),
    "lucknow university second campus": (26.9152, 80.9421),
    "second campus": (26.9152, 80.9421),
    "new campus": (26.9152, 80.9421),
    "ganga hall": (26.9152, 80.9421),
    "lucknow university": (26.8650, 80.9380),
    "university of lucknow": (26.8650, 80.9380),
    "old campus": (26.8650, 80.9380),
    "vishwavidyalaya": (26.8650, 80.9380),
    "charbagh": (26.8320, 80.9180),
    "lucknow charbagh railway station": (26.8320, 80.9180),
    "munshi pulia": (26.8845, 80.9882),
    "ccs international airport": (26.7606, 80.8893),
    "airport": (26.7606, 80.8893),
    "amausi": (26.7715, 80.8912),
    "transport nagar": (26.7813, 80.8938),
    "krishna nagar": (26.7935, 80.8985),
    "singar nagar": (26.8021, 80.9004),
    "mawaiya": (26.8225, 80.9080),
    "durgapuri": (26.8280, 80.9125),
    "hussainganj": (26.8410, 80.9320),
    "sachivalaya": (26.8465, 80.9410),
    "kd singh babu stadium": (26.8590, 80.9440),
    "it college": (26.8710, 80.9420),
    "badshahnagar": (26.8745, 80.9610),
    "lekhraj market": (26.8780, 80.9720),
    "bhootnath market": (26.8810, 80.9810),
    "bhoothnath market": (26.8810, 80.9810),
    "bhootnath": (26.8810, 80.9810),
    "bhoothnath": (26.8810, 80.9810),
    "aliganj": (26.8920, 80.9390),
    "mahanagar": (26.8770, 80.9520),
    "chowk": (26.8670, 80.9020),
    "ashiyana": (26.7850, 80.9120),
    "telibagh": (26.7910, 80.9420),
    "lucknow": (26.8467, 80.9462)
}

# Major City Centroids for Generic Multi-City Fallback
CITY_CENTROIDS = {
    "lucknow": (26.8467, 80.9462),
    "delhi": (28.6139, 77.2090),
    "new delhi": (28.6139, 77.2090),
    "mumbai": (19.0760, 72.8777),
    "bengaluru": (12.9716, 77.5946),
    "bangalore": (12.9716, 77.5946),
    "hyderabad": (17.3850, 78.4867),
    "pune": (18.5204, 73.8567),
    "kolkata": (22.5726, 88.3639),
    "chennai": (13.0827, 80.2707),
    "noida": (28.5355, 77.3910),
    "gurugram": (28.4595, 77.0266),
    "gurgaon": (28.4595, 77.0266)
}

CITY_LOCALITY_MAP = {
    "lucknow": LUCKNOW_LOCALITY_COORDINATES
}

class GeoService:
    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculates distance in kilometers between two geo-coordinates."""
        R = 6371.0 # Earth's radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return round(R * c, 2)

    @classmethod
    def resolve_target_coordinates(cls, target_location: Optional[str], city: str = "Lucknow") -> Tuple[float, float]:
        """
        Resolves target coordinate from dynamic LocationIndex for the given city,
        or falls back to the city centroid.
        """
        if target_location:
            from backend.services.location_index import LocationIndex
            coords = LocationIndex.get_instance().get_coordinates(target_location)
            if coords:
                return coords

        city_lower = (city or "Lucknow").lower().strip()
        if city_lower in CITY_CENTROIDS:
            return CITY_CENTROIDS[city_lower]
        return LUCKNOW_LOCALITY_COORDINATES.get("lucknow", (26.8467, 80.9462))

    @classmethod
    def is_location_resolvable(cls, target_location: Optional[str], city: str = "Lucknow") -> bool:
        """Returns True if the location is known with real geo-coordinates, False otherwise."""
        if not target_location:
            return True
        from backend.services.location_index import LocationIndex
        coords = LocationIndex.get_instance().get_coordinates(target_location)
        return coords is not None

    @classmethod
    def build_local_support_chain(cls, db_session, origin_lat: float, origin_lon: float, origin_resource_id: int) -> List[Dict[str, Any]]:
        """
        Builds the 5-step local support chain:
        1. Nearest Public Transport (Metro / Bus hub)
        2. Nearest Hospital
        3. Nearest 24x7 Pharmacy
        4. Nearest Police Station with Women Desk
        5. Nearest Women Support Centre / Helpline Command
        """
        chain = []
        target_categories = [
            ResourceCategory.PUBLIC_TRANSPORT,
            ResourceCategory.HOSPITAL,
            ResourceCategory.PHARMACY,
            ResourceCategory.POLICE_OR_PUBLIC_SUPPORT,
            ResourceCategory.WOMEN_SUPPORT
        ]

        for cat in target_categories:
            candidates = db_session.query(Resource).filter(
                Resource.category == cat,
                Resource.id != origin_resource_id,
                Resource.latitude.isnot(None),
                Resource.longitude.isnot(None)
            ).all()

            if not candidates:
                continue

            # Sort by distance
            sorted_candidates = sorted(
                candidates,
                key=lambda r: cls.haversine_distance(origin_lat, origin_lon, r.latitude, r.longitude)
            )

            nearest = sorted_candidates[0]
            dist = cls.haversine_distance(origin_lat, origin_lon, nearest.latitude, nearest.longitude)
            
            detail_str = f"{dist:.1f} km away in {nearest.locality or 'Lucknow'}"
            if cat == ResourceCategory.PUBLIC_TRANSPORT:
                detail_str = f"{dist:.1f} km to {nearest.name}"
            elif cat == ResourceCategory.HOSPITAL:
                detail_str = f"{dist:.1f} km to {nearest.name} (Emergency 24x7)"
            elif cat == ResourceCategory.PHARMACY:
                detail_str = f"{dist:.1f} km to {nearest.name} (24x7 Chemist)"
            elif cat == ResourceCategory.POLICE_OR_PUBLIC_SUPPORT:
                detail_str = f"{dist:.1f} km to {nearest.name} (Women Help Desk)"
            elif cat == ResourceCategory.WOMEN_SUPPORT:
                detail_str = f"{dist:.1f} km to {nearest.name}"

            is_real = any(a.collector_id in REAL_BRIGHT_DATA_COLLECTOR_IDS for a in nearest.attributes)
            chain.append({
                "category": cat,
                "resource_id": nearest.id,
                "name": nearest.name,
                "locality": nearest.locality,
                "distance_km": dist,
                "key_detail": detail_str,
                "source_url": nearest.source_url or "",
                "is_real_data": is_real,
                "data_source_badge": "REAL BRIGHT DATA" if is_real else "REFERENCE FIXTURE"
            })

        return chain
