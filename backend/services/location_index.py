import re
import logging
from typing import Optional, Dict, Any, Tuple, List, Set
from backend.models.database import SessionLocal, Resource

logger = logging.getLogger("heraccess.location_index")

# Base Lucknow Spatial Anchors (Geographic reference points for major nodes)
LUCKNOW_SPATIAL_LANDMARKS: Dict[str, Dict[str, Any]] = {
    # Localities & Colonies
    "hazratganj": {"name": "Hazratganj", "type": "locality", "coords": (26.8528, 80.9463)},
    "gomti nagar": {"name": "Gomti Nagar", "type": "locality", "coords": (26.8654, 80.9984)},
    "gomti nagar extension": {"name": "Gomti Nagar Extension", "type": "locality", "coords": (26.8480, 81.0250)},
    "indira nagar": {"name": "Indira Nagar", "type": "locality", "coords": (26.8834, 80.9856)},
    "aliganj": {"name": "Aliganj", "type": "locality", "coords": (26.8920, 80.9390)},
    "alambagh": {"name": "Alambagh", "type": "locality", "coords": (26.8123, 80.9015)},
    "mahanagar": {"name": "Mahanagar", "type": "locality", "coords": (26.8770, 80.9520)},
    "jankipuram": {"name": "Jankipuram", "type": "locality", "coords": (26.9152, 80.9421)},
    "jankipuram extension": {"name": "Jankipuram Extension", "type": "locality", "coords": (26.9320, 80.9510)},
    "vikas nagar": {"name": "Vikas Nagar", "type": "locality", "coords": (26.8910, 80.9580)},
    "nirala nagar": {"name": "Nirala Nagar", "type": "locality", "coords": (26.8720, 80.9350)},
    "aminabad": {"name": "Aminabad", "type": "locality", "coords": (26.8440, 80.9260)},
    "chowk": {"name": "Chowk", "type": "locality", "coords": (26.8670, 80.9020)},
    "charbagh": {"name": "Charbagh", "type": "transit_hub", "coords": (26.8320, 80.9180)},
    "lalbagh": {"name": "Lalbagh", "type": "locality", "coords": (26.8480, 80.9390)},
    "kaiserbagh": {"name": "Kaiserbagh", "type": "locality", "coords": (26.8550, 80.9290)},
    "rajajipuram": {"name": "Rajajipuram", "type": "locality", "coords": (26.8350, 80.8850)},
    "ashiyana": {"name": "Ashiyana", "type": "locality", "coords": (26.7850, 80.9120)},
    "vrindavan yojana": {"name": "Vrindavan Yojana", "type": "locality", "coords": (26.7720, 80.9650)},
    "lda colony": {"name": "LDA Colony", "type": "locality", "coords": (26.7930, 80.8970)},
    "krishna nagar": {"name": "Krishna Nagar", "type": "locality", "coords": (26.7935, 80.8985)},
    "telibagh": {"name": "Telibagh", "type": "locality", "coords": (26.7910, 80.9420)},
    "chinhat": {"name": "Chinhat", "type": "locality", "coords": (26.8870, 81.0450)},
    "polytechnic": {"name": "Polytechnic", "type": "landmark", "coords": (26.8790, 80.9920)},
    "engineering college": {"name": "Engineering College", "type": "landmark", "coords": (26.9140, 80.9410)},

    # Markets & Hubs
    "bhoothnath market": {"name": "Bhoothnath Market", "type": "locality", "coords": (26.8810, 80.9810)},
    "bhootnath market": {"name": "Bhoothnath Market", "type": "locality", "coords": (26.8810, 80.9810)},
    "bhoothnath": {"name": "Bhoothnath Market", "type": "locality", "coords": (26.8810, 80.9810)},
    "bhootnath": {"name": "Bhoothnath Market", "type": "locality", "coords": (26.8810, 80.9810)},
    "hazratganj market": {"name": "Hazratganj Market", "type": "locality", "coords": (26.8528, 80.9463)},
    "aminabad market": {"name": "Aminabad Market", "type": "locality", "coords": (26.8440, 80.9260)},
    "chowk market": {"name": "Chowk Market", "type": "locality", "coords": (26.8670, 80.9020)},
    "lekhraj market": {"name": "Lekhraj Market", "type": "locality", "coords": (26.8780, 80.9720)},

    # Metro & Transit Hubs
    "munshi pulia": {"name": "Munshi Pulia", "type": "transit_hub", "coords": (26.8845, 80.9882)},
    "munshipulia": {"name": "Munshi Pulia", "type": "transit_hub", "coords": (26.8845, 80.9882)},
    "alambagh isbt": {"name": "Alambagh ISBT", "type": "transit_hub", "coords": (26.8155, 80.9022)},
    "lucknow charbagh railway station": {"name": "Charbagh Railway Station", "type": "transit_hub", "coords": (26.8320, 80.9180)},
    "ccs international airport": {"name": "CCS International Airport", "type": "transit_hub", "coords": (26.7606, 80.8893)},
    "airport": {"name": "CCS International Airport", "type": "transit_hub", "coords": (26.7606, 80.8893)},
    "transport nagar": {"name": "Transport Nagar", "type": "transit_hub", "coords": (26.7813, 80.8938)},
    "singar nagar": {"name": "Singar Nagar", "type": "transit_hub", "coords": (26.8021, 80.9004)},
    "mawaiya": {"name": "Mawaiya", "type": "transit_hub", "coords": (26.8225, 80.9080)},
    "durgapuri": {"name": "Durgapuri", "type": "transit_hub", "coords": (26.8280, 80.9125)},
    "hussainganj": {"name": "Hussainganj", "type": "transit_hub", "coords": (26.8410, 80.9320)},
    "sachivalaya": {"name": "Sachivalaya", "type": "transit_hub", "coords": (26.8465, 80.9410)},
    "kd singh babu stadium": {"name": "KD Singh Babu Stadium", "type": "landmark", "coords": (26.8590, 80.9440)},
    "it college": {"name": "IT College", "type": "landmark", "coords": (26.8710, 80.9420)},
    "badshahnagar": {"name": "Badshahnagar", "type": "transit_hub", "coords": (26.8745, 80.9610)},

    # Institutional Campuses & Hospitals
    "kgmu": {"name": "King George's Medical University (KGMU)", "type": "landmark", "coords": (26.8688, 80.9133)},
    "king george medical university": {"name": "King George's Medical University (KGMU)", "type": "landmark", "coords": (26.8688, 80.9133)},
    "king georges medical university": {"name": "King George's Medical University (KGMU)", "type": "landmark", "coords": (26.8688, 80.9133)},
    "sgpgi": {"name": "Sanjay Gandhi Postgraduate Institute of Medical Sciences (SGPGI)", "type": "landmark", "coords": (26.7450, 80.9450)},
    "medanta lucknow": {"name": "Medanta Hospital Lucknow", "type": "landmark", "coords": (26.7760, 80.9970)},
    "medanta": {"name": "Medanta Hospital Lucknow", "type": "landmark", "coords": (26.7760, 80.9970)},
    "charak hospital": {"name": "Charak Hospital Lucknow", "type": "landmark", "coords": (26.8780, 80.9160)},
    "apollo hospital": {"name": "Apollo Hospitals Lucknow", "type": "landmark", "coords": (26.7900, 80.9020)},
    "apollo hospitals lucknow": {"name": "Apollo Hospitals Lucknow", "type": "landmark", "coords": (26.7900, 80.9020)},
    "phoenix palassio": {"name": "Phoenix Palassio Mall", "type": "landmark", "coords": (26.8040, 81.0150)},
    "lucknow university": {"name": "Lucknow University", "type": "landmark", "coords": (26.8650, 80.9380)},
    "university of lucknow": {"name": "Lucknow University", "type": "landmark", "coords": (26.8650, 80.9380)},
    "old campus": {"name": "Lucknow University", "type": "landmark", "coords": (26.8650, 80.9380)},
    "vishwavidyalaya": {"name": "Lucknow University", "type": "landmark", "coords": (26.8650, 80.9380)},
    "lucknow university new campus": {"name": "Lucknow University New Campus", "type": "landmark", "coords": (26.9152, 80.9421)},
    "lucknow university second campus": {"name": "Lucknow University New Campus", "type": "landmark", "coords": (26.9152, 80.9421)},
    "university new campus": {"name": "Lucknow University New Campus", "type": "landmark", "coords": (26.9152, 80.9421)},
    "university second campus": {"name": "Lucknow University New Campus", "type": "landmark", "coords": (26.9152, 80.9421)},
    "second campus": {"name": "Lucknow University New Campus", "type": "landmark", "coords": (26.9152, 80.9421)},
    "new campus": {"name": "Lucknow University New Campus", "type": "landmark", "coords": (26.9152, 80.9421)},

    # Major Arterials / Roads
    "kursi road": {"name": "Kursi Road", "type": "road", "coords": (26.9200, 80.9500)},
    "faizabad road": {"name": "Faizabad Road", "type": "road", "coords": (26.8850, 81.0100)},
    "kanpur road": {"name": "Kanpur Road", "type": "road", "coords": (26.7950, 80.8990)},
    "shaheed path": {"name": "Amar Shaheed Path", "type": "road", "coords": (26.8100, 81.0100)},
    "sultanpur road": {"name": "Sultanpur Road", "type": "road", "coords": (26.8000, 81.0300)},
    "sitapur road": {"name": "Sitapur Road", "type": "road", "coords": (26.9100, 80.9200)},
    "ring road": {"name": "Ring Road", "type": "road", "coords": (26.8880, 80.9750)}
}


class LocationIndex:
    """
    Dynamic In-Memory Spatial & Linguistic Index for Location Matching.
    Combines:
    1. Base spatial landmarks and arterial coordinates.
    2. Dynamic localities and addresses extracted automatically from active Database records.
    3. Normalization covering spelling variants, abbreviations, and unspaced phrases.
    """
    _instance: Optional["LocationIndex"] = None

    def __init__(self):
        self.entry_by_key: Dict[str, Dict[str, Any]] = {}
        self.condensed_map: Dict[str, str] = {} # condensed alphanumeric -> canonical key
        self.sorted_keys: List[str] = []
        self._load_base_landmarks()
        self._load_from_database()

    @classmethod
    def get_instance(cls) -> "LocationIndex":
        if cls._instance is None:
            cls._instance = LocationIndex()
        return cls._instance

    @classmethod
    def refresh_index(cls, db_session=None):
        """Rebuilds the index dynamically, e.g. after new Bright Data ingest."""
        inst = cls.get_instance()
        inst._load_base_landmarks()
        inst._load_from_database(db_session)
        return inst

    @staticmethod
    def normalize_text(text: str) -> str:
        if not text:
            return ""
        s = text.lower().strip()
        s = s.replace("’", "'").replace("‘", "'").replace("`", "'")
        s = re.sub(r'\b(rd|rd\.)\b', 'road', s)
        s = re.sub(r'\b(mkt|mkt\.)\b', 'market', s)
        s = re.sub(r'\b(ext|ext\.|extn|extn\.)\b', 'extension', s)
        s = re.sub(r'\b(stn|stn\.)\b', 'station', s)
        s = re.sub(r'\b(univ|univ\.)\b', 'university', s)
        s = re.sub(r'\b(hosp|hosp\.)\b', 'hospital', s)
        s = re.sub(r'\bl\.?\s*d\.?\s*a\.?\b', 'lda', s)
        s = re.sub(r'\s+', ' ', s).strip()
        return s

    @staticmethod
    def condense(text: str) -> str:
        """Removes all non-alphanumeric characters for robust spacing-agnostic matching."""
        norm = LocationIndex.normalize_text(text)
        # Normalize common phonetic transliterations
        norm = norm.replace("oo", "u").replace("ee", "i").replace("ph", "f")
        return re.sub(r'[^a-z0-9]', '', norm)

    def _register_entry(self, key: str, name: str, loc_type: str, coords: Optional[Tuple[float, float]], source: str = "base"):
        clean_key = re.sub(r'^(near|opp|opposite|behind|at|in|around)\s+', '', key, flags=re.IGNORECASE).strip()
        norm_key = self.normalize_text(clean_key)
        if not norm_key or len(norm_key) < 2:
            return
        
        # Don't overwrite higher-priority spatial_base entries with generic address tokens
        if norm_key in self.entry_by_key:
            existing = self.entry_by_key[norm_key]
            if existing.get("source") == "spatial_base" and source != "spatial_base":
                return

        clean_name = re.sub(r'^(near|opp|opposite|behind|at|in|around)\s+', '', name, flags=re.IGNORECASE).strip()
        self.entry_by_key[norm_key] = {
            "name": clean_name or name,
            "type": loc_type,
            "coords": coords,
            "source": source
        }
        cond = self.condense(norm_key)
        if len(cond) >= 3:
            if cond not in self.condensed_map or source == "spatial_base":
                self.condensed_map[cond] = norm_key

    def _load_base_landmarks(self):
        self.entry_by_key.clear()
        self.condensed_map.clear()
        for raw_key, info in LUCKNOW_SPATIAL_LANDMARKS.items():
            self._register_entry(
                key=raw_key,
                name=info["name"],
                loc_type=info.get("type", "locality"),
                coords=info.get("coords"),
                source="spatial_base"
            )

    def _load_from_database(self, db_session=None):
        """Dynamically ingests localities and addresses from database records."""
        close_session = False
        if db_session is None:
            try:
                db_session = SessionLocal()
                close_session = True
            except Exception as e:
                logger.warning(f"Could not open DB session for LocationIndex: {e}")
                return

        try:
            resources = db_session.query(Resource).filter(Resource.is_active == True).all()
            for res in resources:
                coords = (res.latitude, res.longitude) if (res.latitude and res.longitude) else None
                # 1. Register resource locality
                if res.locality:
                    loc_name = re.sub(r'^(near|opp|opposite|behind|at|in|around)\s+', '', res.locality, flags=re.IGNORECASE).strip()
                    loc_type = "transit_hub" if res.category.value == "public_transport" else "locality"
                    self._register_entry(loc_name, loc_name, loc_type, coords, source="db_resource")

                # 2. Register distinct address tokens (e.g. "Sector 14", "Ashok Marg", "Jawahar Bhawan")
                if res.address:
                    parts = [p.strip() for p in re.split(r'[,|;]', res.address) if p.strip()]
                    for part in parts:
                        part_clean = re.sub(r'^(near|opp|opposite|behind|at|in|around)\s+', '', part, flags=re.IGNORECASE).strip()
                        part_norm = self.normalize_text(part_clean)
                        if len(part_norm) >= 4 and part_norm not in ["lucknow", "uttar pradesh", "india", "near", "road"]:
                            loc_type = "road" if any(w in part_norm for w in ["road", "marg", "path", "street"]) else "locality"
                            self._register_entry(part_clean, part_clean.title(), loc_type, coords, source="db_address")

                # 3. Register notable landmark names (hospitals, metro stations, institutional hostels)
                if res.name:
                    cleaned_name = re.sub(r'\(.*?\)', '', res.name).strip()
                    cleaned_name = re.sub(r'^(near|opp|opposite|behind|at|in|around)\s+', '', cleaned_name, flags=re.IGNORECASE).strip()
                    if res.category.value in ["hospital", "public_transport", "women_support"]:
                        loc_type = "landmark" if res.category.value == "hospital" else ("transit_hub" if res.category.value == "public_transport" else "support_hub")
                        self._register_entry(cleaned_name, cleaned_name, loc_type, coords, source="db_landmark")

            self._finalize_keys()
            logger.info(f"LocationIndex initialized with {len(self.entry_by_key)} unique keys across Lucknow.")
        except Exception as e:
            logger.warning(f"Failed loading DB locations for LocationIndex: {e}")
        finally:
            if close_session:
                db_session.close()

    def _finalize_keys(self):
        # Sort keys by token count and length descending so multi-word locations match first
        self.sorted_keys = sorted(
            self.entry_by_key.keys(),
            key=lambda k: (len(k.split()), len(k)),
            reverse=True
        )

    def lookup(self, text: str) -> Optional[Dict[str, Any]]:
        """Finds entry by exact normalized key or condensed representation."""
        norm = self.normalize_text(text)
        if norm in self.entry_by_key:
            return self.entry_by_key[norm]
        
        cond = self.condense(norm)
        if cond in self.condensed_map:
            canonical_key = self.condensed_map[cond]
            return self.entry_by_key.get(canonical_key)
        
        return None

    def get_coordinates(self, location_name: Optional[str]) -> Optional[Tuple[float, float]]:
        if not location_name:
            return None
        entry = self.lookup(location_name)
        if entry and entry.get("coords"):
            return entry["coords"]
        return None


class LocationExtractor:
    """
    Generalized NLP & Syntactic Location Extractor.
    Extracts location phrases from natural language queries without hardcoded elif chains.
    """

    # Contextual Preposition / Anchor Grammar Patterns
    PREPOSITION_PATTERNS = [
        # "moving to lucknow munshipulia for college" / "relocating to gomti nagar"
        r'\b(?:moving to|relocating to|staying in|living in|visiting)\s+(?:lucknow\s+)?([a-zA-Z0-9\.\-\'\s]+?)(?:\s+(?:for|in|under|with|looking|need|college|university|job|budget|rs|₹|\d|$))',
        # "near Bhoothnath Market" / "in Indira Nagar" / "around Gomti Nagar Extension" / "close to KGMU"
        r'\b(?:near|around|close to|beside|opposite|behind|towards|located (?:at|in)|in)\s+(?:the\s+)?([a-zA-Z0-9\.\-\'\s]+?)(?:\s+(?:in|for|under|with|looking|need|budget|rs|₹|\d|$))',
        # "on Faizabad Road" / "along Shaheed Path"
        r'\b(?:on|along)\s+([a-zA-Z0-9\.\-\'\s]+?(?:road|rd|path|marg|highway|expressway))(?:\s+(?:in|for|under|with|looking|need|budget|rs|₹|\d|$))',
        # "around the Indira Nagar area" / "in the Hazratganj locality"
        r'\b(?:around|in)\s+the\s+([a-zA-Z0-9\.\-\'\s]+?)\s+(?:area|locality|neighborhood|colony|market|nagar|sector|zone)\b'
    ]

    NON_LOCATION_WORDS = {
        "lucknow", "city", "college", "university", "hostel", "hostels", "pg", "room", "rooms",
        "hospital", "pharmacy", "police", "safe", "budget", "under", "with", "for", "near",
        "female", "student", "working", "woman", "women", "girl", "girls", "accommodation",
        "flat", "stay", "urgent", "need", "looking", "require", "verified", "meals", "food"
    }

    @classmethod
    def extract_location(cls, query: str, city: str = "Lucknow") -> Tuple[Optional[str], str, bool, Optional[str], Optional[Tuple[float, float]]]:
        """
        Extracts location phrase, classifies type, and determines spatial resolution status.
        Returns:
            target_location: Canonical or title-cased location string (or None)
            location_type: 'locality' | 'landmark' | 'road' | 'transit_hub' | 'unresolved'
            location_resolved: True if coordinates resolved, False otherwise
            raw_location: The exact phrase found in user query
            coordinates: (lat, lon) if resolved, None otherwise
        """
        if not query:
            return None, "locality", True, None, None

        idx = LocationIndex.get_instance()
        q_norm = LocationIndex.normalize_text(query)
        q_condensed = LocationIndex.condense(query)
        city_lower = (city or "Lucknow").lower().strip()

        # Phase 1: Longest Meaningful Match in Dynamic Location Index
        for key in idx.sorted_keys:
            if key == city_lower:
                continue
            
            key_condensed = LocationIndex.condense(key)
            # Match either formatted key in query OR condensed representation
            is_match = False
            if re.search(r'\b' + re.escape(key) + r'\b', q_norm):
                is_match = True
            elif len(key_condensed) >= 5 and key_condensed in q_condensed:
                is_match = True

            if is_match:
                entry = idx.entry_by_key[key]
                canonical_name = entry["name"]
                loc_type = entry.get("type", "locality")
                coords = entry.get("coords")
                return canonical_name, loc_type, (coords is not None), key.title(), coords

        # Phase 2: Syntactic Linguistic Preposition Parsing
        for pat in cls.PREPOSITION_PATTERNS:
            match = re.search(pat, query, re.IGNORECASE)
            if match:
                candidate = match.group(1).strip()
                cand_norm = LocationIndex.normalize_text(candidate)
                
                # Filter out pure city name or generic stop words
                tokens = [t for t in cand_norm.split() if t not in cls.NON_LOCATION_WORDS]
                if not tokens:
                    continue

                cleaned_candidate = " ".join(tokens).title()
                if len(cleaned_candidate) < 2:
                    continue

                # Check if candidate matches any dynamic entry with loose spelling
                entry = idx.lookup(cleaned_candidate)
                if entry:
                    return entry["name"], entry.get("type", "locality"), (entry.get("coords") is not None), cleaned_candidate, entry.get("coords")

                # Infer location type for unmapped valid phrase
                inferred_type = "locality"
                if any(w in cand_norm for w in ["road", "marg", "path", "highway", "expressway"]):
                    inferred_type = "road"
                elif any(w in cand_norm for w in ["hospital", "clinic", "university", "college", "mall", "palassio", "bhawan", "stadium"]):
                    inferred_type = "landmark"
                elif any(w in cand_norm for w in ["station", "terminal", "metro", "airport", "isbt", "junction"]):
                    inferred_type = "transit_hub"
                else:
                    inferred_type = "unresolved"

                # Return valid extracted phrase marked as unresolved (never silent fallback)
                return cleaned_candidate, inferred_type, False, cleaned_candidate, None

        return None, "locality", True, None, None
