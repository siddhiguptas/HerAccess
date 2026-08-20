from typing import Dict, Any, List, Tuple
from backend.models.enums import ResourceCategory

class CategoryValidator:
    # Mandatory field expectations for each category
    REQUIRED_FIELDS: Dict[ResourceCategory, List[str]] = {
        ResourceCategory.WOMEN_HOSTEL: ["monthly_price", "women_only", "curfew_time"],
        ResourceCategory.PUBLIC_TRANSPORT: ["operator", "service_type", "timings"],
        ResourceCategory.HOSPITAL: ["hospital_type", "emergency_services", "departments"],
        ResourceCategory.PHARMACY: ["timings", "essential_supplies"],
        ResourceCategory.POLICE_OR_PUBLIC_SUPPORT: ["station_type", "emergency_contact"],
        ResourceCategory.WOMEN_SUPPORT: ["organization_type", "services_offered", "helpline_numbers"]
    }

    @classmethod
    def validate_resource_payload(cls, category: ResourceCategory, attributes: Dict[str, Any]) -> Tuple[bool, float, List[str]]:
        """
        Validates whether scraped record attributes meet the required schema.
        Returns:
            is_valid (bool): True if all required fields are present with non-null values.
            pass_rate (float): Ratio of valid required fields (0.0 - 1.0).
            missing_fields (List[str]): List of missing or null required fields.
        """
        required = cls.REQUIRED_FIELDS.get(category, [])
        if not required:
            return True, 1.0, []

        missing = []
        for req_field in required:
            val = attributes.get(req_field)
            if val is None:
                missing.append(req_field)
            elif isinstance(val, dict) and (val.get("raw_value") is None and val.get("normalized_value") is None):
                missing.append(req_field)
            elif isinstance(val, (str, list)) and len(val) == 0:
                missing.append(req_field)

        valid_count = len(required) - len(missing)
        pass_rate = round(valid_count / len(required), 3)
        return (len(missing) == 0), pass_rate, missing
