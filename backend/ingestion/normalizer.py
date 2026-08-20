import re
from typing import Any, Optional, Union, List, Dict, Tuple

class FieldNormalizer:
    @staticmethod
    def normalize_price(raw_val: Any) -> Optional[float]:
        if raw_val is None:
            return None
        if isinstance(raw_val, (int, float)):
            return float(raw_val)
        if isinstance(raw_val, dict):
            if "value" in raw_val:
                return float(raw_val["value"])
            return None
        if isinstance(raw_val, list):
            prices = [FieldNormalizer.normalize_price(p) for p in raw_val]
            valid_prices = [p for p in prices if p is not None]
            return min(valid_prices) if valid_prices else None
        
        text = str(raw_val).replace(",", "").strip()
        # Find first number or range minimum
        match = re.search(r'(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                return None
        return None

    @staticmethod
    def _parse_time_token(token: str, default_meridiem: Optional[str] = None) -> Optional[str]:
        tok = token.strip().lower()
        match = re.search(r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)?', tok)
        if not match:
            return None
        hour = int(match.group(1))
        minute = int(match.group(2)) if match.group(2) else 0
        meridiem = match.group(3) or default_meridiem
        if meridiem == "pm" and hour < 12:
            hour += 12
        elif meridiem == "am" and hour == 12:
            hour = 0
        return f"{hour:02d}:{minute:02d}"

    @staticmethod
    def normalize_curfew(raw_val: Any) -> Any:
        if not raw_val:
            return None
        text = str(raw_val).strip()

        # Check for range: e.g. "9:30-10:00 pm", "9:30 PM - 10:00 PM", "9:30 to 10:00 pm"
        range_match = re.search(r'(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|to)\s*(\d{1,2}(?::\d{2})?\s*(am|pm))', text, re.IGNORECASE)
        if range_match:
            end_meridiem = range_match.group(3).lower() if range_match.group(3) else None
            start_str = FieldNormalizer._parse_time_token(range_match.group(1), default_meridiem=end_meridiem)
            end_str = FieldNormalizer._parse_time_token(range_match.group(2), default_meridiem=end_meridiem)
            return {
                "start": start_str,
                "end": end_str,
                "raw": text
            }

        # Single time
        single = FieldNormalizer._parse_time_token(text)
        if single:
            return single
            
        return text

    @staticmethod
    def normalize_boolean(raw_val: Any) -> bool:
        if isinstance(raw_val, bool):
            return raw_val
        if raw_val is None:
            return False
        text = str(raw_val).lower().strip()
        return any(term in text for term in ["yes", "true", "strictly", "girls only", "women only", "available", "dedicated", "included"])

    @staticmethod
    def normalize_list(raw_val: Any) -> List[str]:
        if isinstance(raw_val, list):
            return [str(item).strip() for item in raw_val if str(item).strip()]
        if not raw_val:
            return []
        text = str(raw_val)
        items = re.split(r'[,|;/]+', text)
        return [item.strip() for item in items if item.strip()]

    @staticmethod
    def normalize_room_types(raw_val: Any) -> List[Dict[str, Any]]:
        """
        Normalizes nested room offerings without flattening or losing pricing tiers.
        """
        if not raw_val:
            return []
        if isinstance(raw_val, list):
            normalized_rooms = []
            for item in raw_val:
                if isinstance(item, dict):
                    acc_type = item.get("accommodation_type") or item.get("room_type") or item.get("type") or "Standard"
                    features = item.get("room_features") or item.get("features") or ""
                    rent_obj = item.get("monthly_rent") or item.get("price")
                    if isinstance(rent_obj, dict):
                        price_val = float(rent_obj.get("value", 0))
                        currency = rent_obj.get("currency", "INR")
                        symbol = rent_obj.get("symbol", "₹")
                    elif isinstance(rent_obj, (int, float)):
                        price_val = float(rent_obj)
                        currency = "INR"
                        symbol = "₹"
                    else:
                        price_val = FieldNormalizer.normalize_price(rent_obj) or 0.0
                        currency = "INR"
                        symbol = "₹"

                    normalized_rooms.append({
                        "accommodation_type": acc_type,
                        "room_features": features,
                        "monthly_rent": {
                            "value": price_val,
                            "currency": currency,
                            "symbol": symbol
                        }
                    })
                elif isinstance(item, str):
                    normalized_rooms.append({
                        "accommodation_type": item,
                        "room_features": "",
                        "monthly_rent": {"value": 0.0, "currency": "INR", "symbol": "₹"}
                    })
            return normalized_rooms
        return []

    @staticmethod
    def separate_facilities_and_policies(raw_items: List[str]) -> Tuple[List[str], List[str]]:
        """
        Separates raw extractor facility strings into:
        1. Physical amenities / facilities (e.g. Wi-Fi, RO water, power backup, microwave, TV, washing machine)
        2. Hostel rules / policies (e.g. male entry prohibited, gate closed timings, vegetarian policy, leave rules)
        Preserves verbatim source text.
        """
        facilities: List[str] = []
        policies: List[str] = []

        policy_indicators = [
            "prohibited", "closed between", "gate will be closed", "discount of any kind",
            "full amount", "warden will have to be informed", "non-veg", "vegetarian",
            "completely vegetarian", "rules", "loud music", "talking loudly", "entry of any male"
        ]

        for item in raw_items:
            clean_item = item.strip()
            item_lower = clean_item.lower()
            if any(ind in item_lower for ind in policy_indicators):
                policies.append(clean_item)
            else:
                facilities.append(clean_item)

        return facilities, policies

    @staticmethod
    def normalize_rating(raw_val: Any) -> Optional[float]:
        """Normalizes rating value to float between 0.0 and 5.0."""
        if raw_val is None:
            return None
        if isinstance(raw_val, (int, float)):
            return min(max(float(raw_val), 0.0), 5.0)
        if isinstance(raw_val, dict):
            val = raw_val.get("value") or raw_val.get("rating") or raw_val.get("score")
            return FieldNormalizer.normalize_rating(val)
        
        text = str(raw_val).strip()
        match = re.search(r'(\d+(?:\.\d+)?)', text)
        if match:
            try:
                num = float(match.group(1))
                return min(max(num, 0.0), 5.0)
            except ValueError:
                return None
        return None

    @staticmethod
    def normalize_name(raw_val: Any) -> Optional[str]:
        if not raw_val:
            return None
        name = str(raw_val).strip()
        name = re.sub(r'\s+', ' ', name)
        return name

    @staticmethod
    def normalize_locality(raw_val: Any) -> Optional[str]:
        if not raw_val:
            return None
        loc = str(raw_val).strip()
        loc = re.sub(r'\s+', ' ', loc)
        # Remove trailing commas or pincodes from locality
        loc = re.sub(r',?\s*\d{6}$', '', loc).strip()
        return loc

    @staticmethod
    def normalize_address(raw_val: Any) -> Optional[str]:
        if not raw_val:
            return None
        addr = str(raw_val).strip()
        addr = re.sub(r'\s+', ' ', addr)
        return addr

    @classmethod
    def normalize(cls, field_name: str, raw_value: Any) -> Any:
        if raw_value is None:
            return None
            
        if "room_types" in field_name:
            return cls.normalize_room_types(raw_value)
        elif "price" in field_name or "deposit" in field_name or "fare" in field_name or "budget" in field_name:
            return cls.normalize_price(raw_value)
        elif "curfew" in field_name or "time" in field_name:
            return cls.normalize_curfew(raw_value)
        elif "women_only" in field_name or "emergency" in field_name or "delivery" in field_name or "active" in field_name:
            return cls.normalize_boolean(raw_value)
        elif "rating" in field_name or "score" in field_name:
            return cls.normalize_rating(raw_value)
        elif "facilities" in field_name or "departments" in field_name or "services" in field_name or "supplies" in field_name or "policies" in field_name:
            return cls.normalize_list(raw_value)
        elif "locality" in field_name:
            return cls.normalize_locality(raw_value)
        elif "address" in field_name:
            return cls.normalize_address(raw_value)
        elif "name" in field_name:
            return cls.normalize_name(raw_value)
        
        return raw_value


