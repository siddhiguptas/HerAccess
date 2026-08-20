import re
import json
import logging
from typing import Optional, List, Dict, Any
from backend.models.schemas import ParsedIntent
from backend.models.enums import ResourceCategory
from backend.config import settings

logger = logging.getLogger("heraccess.intent_parser")

class IntentParser:
    @classmethod
    def parse_query(cls, query: str, user_city: Optional[str] = "Lucknow", user_budget: Optional[float] = None) -> ParsedIntent:
        """
        Parses natural language user query into structured requirements.
        Attempts Gemini API if key is present, otherwise falls back to deterministic rule engine.
        """
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = f"""
                You are a deterministic intent parser for HerAccess. Convert this natural language query into JSON:
                Query: "{query}"

                Respond ONLY with a valid JSON object matching this schema:
                {{
                  "city": "Lucknow",
                  "target_location": "string or null",
                  "user_type": "female_student or working_woman",
                  "budget_max": number or null,
                  "distance_max_km": number,
                  "required_categories": ["women_hostel", "public_transport", "hospital", "pharmacy", "police_or_public_support", "women_support"],
                  "preferences": {{"women_only": true, "meals_included": true}},
                  "explanation": "Brief 1-sentence user intent summary"
                }}
                """
                resp = model.generate_content(prompt)
                raw_text = resp.text.strip()
                if "```json" in raw_text:
                    raw_text = raw_text.split("```json")[1].split("```")[0].strip()
                elif "```" in raw_text:
                    raw_text = raw_text.split("```")[1].split("```")[0].strip()
                
                data = json.loads(raw_text)
                return ParsedIntent(
                    city=data.get("city", user_city or "Lucknow"),
                    target_location=data.get("target_location"),
                    user_type=data.get("user_type", "female_student"),
                    budget_max=data.get("budget_max") or user_budget,
                    distance_max_km=data.get("distance_max_km", 5.0),
                    required_categories=[ResourceCategory(c) for c in data.get("required_categories", []) if c in ResourceCategory.__members__.values()],
                    preferences=data.get("preferences", {}),
                    explanation=data.get("explanation", "Extracted structured requirements from your search.")
                )
            except Exception as e:
                logger.warning(f"LLM parsing failed: {e}. Using deterministic rule-based parser fallback.")

        # Deterministic Rule Fallback Engine
        return cls._deterministic_parse(query, user_city, user_budget)

    @classmethod
    def _deterministic_parse(cls, query: str, user_city: Optional[str], user_budget: Optional[float]) -> ParsedIntent:
        q_lower = query.lower()
        
        # 1. Dynamic City extraction
        known_cities = ["lucknow", "delhi", "new delhi", "mumbai", "bengaluru", "bangalore", "hyderabad", "pune", "kolkata", "chennai", "noida", "gurugram", "gurgaon"]
        city = user_city or "Lucknow"
        for c in known_cities:
            if c in q_lower:
                city = "Bengaluru" if c == "bangalore" else ("Delhi" if c == "new delhi" else ("Gurugram" if c == "gurgaon" else c.title()))
                break

        # 2. Target Locality extraction
        target_loc = None
        city_localities = {
            "lucknow": [
                "gomti nagar", "hazratganj", "indira nagar", "alambagh", "lda colony",
                "mahanagar", "aliganj", "charbagh", "jankipuram", "telibagh",
                "ashiyana", "munshi pulia", "chowk", "kanpur rd", "kanpur road"
            ],
            "delhi": ["connaught place", "hauz khas", "saket", "lajpat nagar", "dwarka", "rohini", "karol bagh"],
            "bengaluru": ["koramangala", "indiranagar", "whitefield", "hsr layout", "electronic city", "marathahalli"],
            "mumbai": ["bandra", "andheri", "juhu", "powai", "dadar", "colaba", "thane"]
        }
        localities_to_check = city_localities.get(city.lower(), city_localities["lucknow"])
        for loc in localities_to_check:
            if loc in q_lower:
                target_loc = "LDA Colony" if loc in ["kanpur rd", "kanpur road"] else loc.title()
                break

        # 3. Budget extraction (e.g. under ₹12,000, under 12000, 10k, ₹10k, max 15000, under ₹9000)
        budget_max = user_budget
        budget_match = re.search(r'(?:under|below|budget|upto|within|max|around|for)?\s*(?:rs\.?|₹)?\s*(\d{1,3}(?:,\d{3})+|\d+)\s*(k|thousand|/month|pm)?', q_lower)
        if budget_match and budget_match.group(1):
            val_str = budget_match.group(1).replace(",", "")
            unit = (budget_match.group(2) or "").lower()
            try:
                num = float(val_str)
                if unit in ["k", "thousand"] or (num < 100 and bool(re.search(r'\b\d+k\b', q_lower))):
                    num = num * 1000
                if num >= 1000:
                    budget_max = num
            except ValueError:
                pass

        # Explicit regex check for standalone ₹12,000 or ₹9000 or 12k
        if not budget_max:
            direct_price_match = re.search(r'(?:₹|rs\.?)\s*(\d{1,3}(?:,\d{3})+|\d+)\s*(k)?', q_lower)
            if direct_price_match:
                val_str = direct_price_match.group(1).replace(",", "")
                is_k = bool(direct_price_match.group(2))
                try:
                    num = float(val_str)
                    if is_k or (num < 100 and bool(re.search(r'\b\d+k\b', q_lower))):
                        num = num * 1000
                    if num >= 1000:
                        budget_max = num
                except ValueError:
                    pass

        # 4. User Type
        user_type = "female_student"
        if any(term in q_lower for term in ["working", "job", "office", "professional", "employed", "executive"]):
            user_type = "working_woman"
        elif any(term in q_lower for term in ["college", "student", "university", "study", "exam", "coaching"]):
            user_type = "female_student"

        # 5. Required Categories & Nearby Ecosystem
        categories = [ResourceCategory.WOMEN_HOSTEL] # default anchor
        has_transport_req = any(term in q_lower for term in ["transport", "metro", "bus", "station", "commute", "transit"])
        has_hospital_req = any(term in q_lower for term in ["hospital", "doctor", "health", "healthcare", "clinic", "medical", "emergency", "trauma"])
        has_pharmacy_req = any(term in q_lower for term in ["pharmacy", "chemist", "medicine", "store"])
        has_police_req = any(term in q_lower for term in ["police", "security", "help desk", "safety", "patrol"])
        has_support_req = any(term in q_lower for term in ["support", "helpline", "1090", "sakhi", "one stop", "ngo"])

        if has_transport_req:
            categories.append(ResourceCategory.PUBLIC_TRANSPORT)
        if has_hospital_req:
            categories.append(ResourceCategory.HOSPITAL)
        if has_pharmacy_req:
            categories.append(ResourceCategory.PHARMACY)
        if has_police_req:
            categories.append(ResourceCategory.POLICE_OR_PUBLIC_SUPPORT)
        if has_support_req:
            categories.append(ResourceCategory.WOMEN_SUPPORT)

        # 6. Preferences
        preferences = {
            "women_only": True, # HerAccess defaults to women-safety priority
            "meals_included": any(term in q_lower for term in ["food", "meal", "mess", "breakfast", "dinner", "tiffin"]),
            "ac_preferred": "ac" in q_lower or "air condition" in q_lower,
            "transport_nearby": has_transport_req,
            "healthcare_nearby": has_hospital_req
        }

        explanation = f"Structured requirements: {user_type.replace('_', ' ').title()} looking in {city}"
        if target_loc:
            explanation += f" near {target_loc}"
        if budget_max:
            explanation += f" (Budget: under ₹{budget_max:,.0f}/mo)"
        if has_hospital_req and has_transport_req:
            explanation += " with Healthcare & Transit hubs required nearby"
        elif has_hospital_req:
            explanation += " with Healthcare required nearby"
        elif has_transport_req:
            explanation += " with Transit hub required nearby"

        return ParsedIntent(
            city=city,
            target_location=target_loc,
            user_type=user_type,
            budget_max=budget_max,
            distance_max_km=5.0,
            required_categories=categories,
            preferences=preferences,
            explanation=explanation
        )
