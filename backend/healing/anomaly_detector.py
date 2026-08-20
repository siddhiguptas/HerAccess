from typing import Dict, Any, List, Optional
from backend.models.enums import ResourceCategory
from backend.verification.validator import CategoryValidator

class AnomalyDetector:
    @classmethod
    def inspect_collection_payload(cls, category: ResourceCategory, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Inspects all records in a collection run to detect anomalies and structural extraction failures.
        """
        if not records:
            return {
                "has_anomaly": True,
                "reason": "Empty records payload returned by scraper.",
                "missing_fields": [],
                "affected_records": 0,
                "heal_prompt": "Scraper returned 0 records. Target page container structure has changed."
            }

        missing_fields_counter: Dict[str, int] = {}
        total_records = len(records)
        required_fields = CategoryValidator.REQUIRED_FIELDS.get(category, [])

        for rec in records:
            attributes = rec.get("attributes", {})
            for req_field in required_fields:
                val = attributes.get(req_field)
                if val is None or (isinstance(val, dict) and val.get("raw_value") is None and val.get("normalized_value") is None):
                    missing_fields_counter[req_field] = missing_fields_counter.get(req_field, 0) + 1

        anomalous_fields = [f for f, count in missing_fields_counter.items() if count >= (total_records * 0.5)]

        if anomalous_fields:
            fields_str = ", ".join(anomalous_fields)
            prompt = f"Fields [{fields_str}] stopped extracting after source website layout changed. Re-extract them from listing container."
            return {
                "has_anomaly": True,
                "reason": f"Required fields [{fields_str}] failed validation across {len(records)} records.",
                "missing_fields": anomalous_fields,
                "affected_records": total_records,
                "heal_prompt": prompt
            }

        return {
            "has_anomaly": False,
            "reason": "All required fields extracted successfully.",
            "missing_fields": [],
            "affected_records": 0,
            "heal_prompt": ""
        }
