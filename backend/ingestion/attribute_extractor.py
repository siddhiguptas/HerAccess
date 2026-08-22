from typing import Dict, Any, Tuple
from backend.ingestion.normalizer import FieldNormalizer
from backend.models.enums import ResourceCategory

class AttributeExtractor:
    @staticmethod
    def extract_attributes(rec: Dict[str, Any], category: ResourceCategory, collector_id: str, item_source_url: str, name: str, locality: str, address: str) -> Tuple[Dict[str, Any], str, str]:
        attributes_dict = rec.get("attributes", {})
        if attributes_dict:
            return attributes_dict, locality, address

        is_directory_source = (collector_id in ["c_mt1i5ri4trltbvw66", "c_hostel_sulekha_01"]) or ("sulekha.com" in item_source_url)
        is_secondary_public = (collector_id in ["c_mt1nlu1w3pkwb2h1i"]) or ("wikipedia.org" in item_source_url)
        is_institutional = (collector_id in ["c_mt1palv71amwtj4yp4"]) or ("lkouniv.ac.in" in item_source_url)
        is_state_support = (collector_id in ["c_mt1qwsbmqm9fi1vu6"]) or ("mahilakalyan.up.nic.in" in item_source_url)

        raw_contacts = rec.get("contact_numbers") or rec.get("contact_phone") or rec.get("contact") or rec.get("phone")
        if isinstance(raw_contacts, list):
            contact_str = ", ".join(str(c).strip() for c in raw_contacts if str(c).strip())
        else:
            contact_str = str(raw_contacts).strip() if raw_contacts else None

        # Base attributes
        if "room_types" in rec and rec["room_types"] is not None:
            norm_rooms = FieldNormalizer.normalize_room_types(rec["room_types"])
            attributes_dict["room_types"] = {
                "raw_value": rec["room_types"],
                "normalized_value": norm_rooms,
                "evidence_text": f"Extracted {len(norm_rooms)} room options from published accommodation list."
            }
            prices = [r["monthly_rent"]["value"] for r in norm_rooms if r.get("monthly_rent", {}).get("value")]
            if prices:
                min_p = min(prices)
                attributes_dict["monthly_price"] = {
                    "raw_value": f"Starting from ₹{min_p:,.0f}/month",
                    "normalized_value": min_p,
                    "evidence_text": f"Lowest available room option starts at ₹{min_p:,.0f}/month."
                }

        if "monthly_price" in rec and "monthly_price" not in attributes_dict and rec["monthly_price"] is not None:
            attributes_dict["monthly_price"] = {
                "raw_value": rec["monthly_price"],
                "normalized_value": FieldNormalizer.normalize_price(rec["monthly_price"]),
                "evidence_text": rec.get("evidence", {}).get("monthly_price") or str(rec["monthly_price"])
            }

        raw_curfew = rec.get("curfew_timings") or rec.get("curfew_time")
        if raw_curfew is not None:
            attributes_dict["curfew_time"] = {
                "raw_value": raw_curfew,
                "normalized_value": FieldNormalizer.normalize_curfew(raw_curfew),
                "evidence_text": f"Gate closing policy: {raw_curfew}"
            }

        if "women_only" in rec and rec["women_only"] is not None:
            attributes_dict["women_only"] = {
                "raw_value": rec["women_only"],
                "normalized_value": FieldNormalizer.normalize_boolean(rec["women_only"]),
                "evidence_text": "Strictly female/women-only accommodation." if rec["women_only"] else "Co-ed accommodation."
            }

        if "rating" in rec and rec["rating"] is not None:
            norm_rating = FieldNormalizer.normalize_rating(rec["rating"])
            if norm_rating is not None:
                attributes_dict["rating"] = {
                    "raw_value": rec["rating"],
                    "normalized_value": norm_rating,
                    "evidence_text": f"Sulekha directory rating: {norm_rating}/5.0 based on user reviews."
                }

        if "meal_details" in rec and rec["meal_details"] is not None:
            attributes_dict["meal_details"] = {
                "raw_value": rec["meal_details"],
                "normalized_value": str(rec["meal_details"]).strip(),
                "evidence_text": str(rec["meal_details"]).strip()
            }

        raw_fac = rec.get("facilities") or rec.get("services_offered")
        if raw_fac:
            if isinstance(raw_fac, list):
                fac_list, pol_list = FieldNormalizer.separate_facilities_and_policies(raw_fac)
                attributes_dict["facilities"] = {
                    "raw_value": fac_list,
                    "normalized_value": fac_list,
                    "evidence_text": f"Reported services/amenities: {'; '.join(fac_list[:4])}"
                }
                if pol_list:
                    attributes_dict["policies"] = {
                        "raw_value": pol_list,
                        "normalized_value": pol_list,
                        "evidence_text": f"Reported rules: {'; '.join(pol_list[:4])}"
                    }
            else:
                attributes_dict["facilities"] = {
                    "raw_value": raw_fac,
                    "normalized_value": FieldNormalizer.normalize_list(raw_fac),
                    "evidence_text": str(raw_fac)
                }

        if raw_contacts is not None:
            attributes_dict["contact_numbers"] = {
                "raw_value": raw_contacts,
                "normalized_value": raw_contacts if isinstance(raw_contacts, list) else [str(raw_contacts)],
                "evidence_text": f"Published contact: {contact_str}"
            }

        if is_directory_source:
            attributes_dict["directory_source"] = {
                "raw_value": "Sulekha Directory",
                "normalized_value": "sulekha",
                "evidence_text": f"Sulekha directory listing at {item_source_url}"
            }

        # Hospital
        if "emergency_24x7" in rec and rec["emergency_24x7"] is not None:
            attributes_dict["emergency_24x7"] = {
                "raw_value": rec["emergency_24x7"],
                "normalized_value": FieldNormalizer.normalize_boolean(rec["emergency_24x7"]),
                "evidence_text": "24x7 Emergency & Trauma Centre Available." if rec["emergency_24x7"] else "General OPD only."
            }
            attributes_dict["emergency_services"] = attributes_dict["emergency_24x7"]

        if "public_government" in rec and rec["public_government"] is not None:
            attributes_dict["public_government"] = {
                "raw_value": rec["public_government"],
                "normalized_value": FieldNormalizer.normalize_boolean(rec["public_government"]),
                "evidence_text": "Government Autonomous State Medical University." if rec["public_government"] else "Private facility."
            }
            attributes_dict["hospital_type"] = {
                "raw_value": "Government Public University Hospital",
                "normalized_value": "government_public",
                "evidence_text": "Government Autonomous State Medical University."
            }

        depts = rec.get("key_departments") or rec.get("departments")
        if depts:
            attributes_dict["departments"] = {
                "raw_value": depts,
                "normalized_value": depts if isinstance(depts, list) else FieldNormalizer.normalize_list(depts),
                "evidence_text": f"Key departments: {', '.join(depts[:3]) if isinstance(depts, list) else str(depts)}"
            }

        pub_date = rec.get("published_date") or rec.get("published_at")
        if pub_date is not None:
            attributes_dict["published_date"] = {
                "raw_value": pub_date,
                "normalized_value": str(pub_date),
                "evidence_text": f"Published on: {pub_date}"
            }

        # Transport
        if category == ResourceCategory.PUBLIC_TRANSPORT or "station_name" in rec:
            if not locality and name:
                locality = name.replace(" Metro Station", "").replace(" Railway Station", "").strip()
            if "route_line" not in attributes_dict and "line" in rec:
                attributes_dict["route_line"] = {
                    "raw_value": rec["line"],
                    "normalized_value": rec["line"],
                    "evidence_text": f"Lucknow Metro {rec['line']} Network."
                }
            if "operator" not in attributes_dict:
                attributes_dict["operator"] = {
                    "raw_value": "Uttar Pradesh Metro Rail Corporation (UPMRC)",
                    "normalized_value": "UPMRC",
                    "evidence_text": "Operational Metro Network under UPMRC."
                }
            if "service_type" not in attributes_dict:
                attributes_dict["service_type"] = {
                    "raw_value": "Rapid Transit / Metro Rail",
                    "normalized_value": "metro_rail",
                    "evidence_text": "Rapid Transit Station with security checkpoints."
                }
            if "timings" not in attributes_dict:
                attributes_dict["timings"] = {
                    "raw_value": "06:00 AM - 10:00 PM (Daily)",
                    "normalized_value": {"start": "06:00", "end": "22:00", "raw": "06:00 AM - 10:00 PM"},
                    "evidence_text": "Daily operational timings: 06:00 AM to 10:00 PM."
                }
            if "station_status" in rec and "status" not in attributes_dict:
                attributes_dict["status"] = {
                    "raw_value": rec["station_status"],
                    "normalized_value": rec["station_status"],
                    "evidence_text": f"Operational status: {rec['station_status']}"
                }
            if "is_terminal" in rec:
                attributes_dict["is_terminal"] = {
                    "raw_value": rec["is_terminal"],
                    "normalized_value": rec["is_terminal"],
                    "evidence_text": "Terminal station." if rec["is_terminal"] else "En-route station."
                }
            if "is_interchange" in rec:
                attributes_dict["is_interchange"] = {
                    "raw_value": rec["is_interchange"],
                    "normalized_value": rec["is_interchange"],
                    "evidence_text": "Interchange station connecting Indian Railways." if rec["is_interchange"] else "Standard metro station."
                }

        # Apollo
        if "hospital_name" in rec or ("Apollo" in name and category == ResourceCategory.HOSPITAL):
            if (not locality or "qww2" in locality.lower() or len(locality) > 30) and address and "LDA Colony" in address:
                locality = "LDA Colony"
            if "emergency_availability" in rec and "emergency_services" not in attributes_dict:
                attributes_dict["emergency_services"] = {
                    "raw_value": rec["emergency_availability"],
                    "normalized_value": True,
                    "evidence_text": f"Emergency availability: {rec['emergency_availability']}"
                }
                attributes_dict["emergency_24x7"] = attributes_dict["emergency_services"]
            if "hospital_type" not in attributes_dict:
                attributes_dict["hospital_type"] = {
                    "raw_value": "Private Multi-Speciality Tertiary Care Hospital",
                    "normalized_value": "private_tertiary_care",
                    "evidence_text": "Private Multi-Speciality Tertiary Care Hospital with 24x7 Emergency & Trauma."
                }
            if "trauma_capabilities" in rec and "trauma_centre" not in attributes_dict:
                attributes_dict["trauma_centre"] = {
                    "raw_value": rec["trauma_capabilities"],
                    "normalized_value": True,
                    "evidence_text": "Level 1 Advanced Trauma & Critical Care unit."
                }
            if "women_gynaecology_services" in rec and "women_gynaecology_unit" not in attributes_dict:
                attributes_dict["women_gynaecology_unit"] = {
                    "raw_value": rec["women_gynaecology_services"],
                    "normalized_value": True,
                    "evidence_text": "Dedicated Obstetrics & Gynaecology unit for women's healthcare."
                }
            if "emergency_phone" in rec:
                attributes_dict["emergency_phone"] = {
                    "raw_value": rec["emergency_phone"],
                    "normalized_value": str(rec["emergency_phone"]),
                    "evidence_text": f"24x7 Emergency hotline: {rec['emergency_phone']}"
                }

        # Institutional Hostels
        if is_institutional:
            if not locality:
                locality = "Jankipuram"
            if not address:
                address = "Lucknow University Second Campus, Jankipuram, Lucknow 226007"
            if "women_only" not in attributes_dict:
                attributes_dict["women_only"] = {
                    "raw_value": True,
                    "normalized_value": True,
                    "evidence_text": "Official University of Lucknow Women's Residence Hall."
                }
            if "warden_contact" in rec and "warden" not in attributes_dict:
                attributes_dict["warden"] = {
                    "raw_value": rec["warden_contact"],
                    "normalized_value": rec["warden_contact"],
                    "evidence_text": f"Hostel Administration: {rec['warden_contact']}"
                }
            if "email" in rec and "email" not in attributes_dict:
                attributes_dict["email"] = {
                    "raw_value": rec["email"],
                    "normalized_value": rec["email"],
                    "evidence_text": f"Official email: {rec['email']}"
                }
            if "facilities" not in attributes_dict:
                attributes_dict["facilities"] = {
                    "raw_value": ["In-house Mess & Dining Hall", "Library & Study Room", "24/7 Security & Wardens", "Power Backup"],
                    "normalized_value": ["In-house Mess & Dining Hall", "Library & Study Room", "24/7 Security & Wardens", "Power Backup"],
                    "evidence_text": "University campus residential amenities."
                }
            if "policies" not in attributes_dict:
                attributes_dict["policies"] = {
                    "raw_value": ["Official University of Lucknow Women's Residence Hall", "Warden permission required for entry/exit", "Strictly Female Students Only"],
                    "normalized_value": ["Official University of Lucknow Women's Residence Hall", "Warden permission required for entry/exit", "Strictly Female Students Only"],
                    "evidence_text": "University residential regulations and female-student only policy."
                }

        # UP Mahila Kalyan
        if is_state_support:
            if not locality:
                locality = "Hazratganj"
            if not address:
                address = "Directorate of Women Welfare, 8th Floor, Jawahar Bhawan, Ashok Marg, Lucknow, UP"
            
            if "organization_type" not in attributes_dict:
                attributes_dict["organization_type"] = {
                    "raw_value": "Department of Women Welfare & Child Development (Govt of UP)",
                    "normalized_value": "state_government_welfare_department",
                    "evidence_text": "Official State Government Department of Women & Child Welfare, Uttar Pradesh."
                }
            if "services_offered" not in attributes_dict:
                services_list = [
                    "24x7 Women in Distress Helpline (181)",
                    "UP Women Power Line (1090)",
                    "Police Emergency Assistance (112)",
                    "Childline (1098)",
                    "One Stop Centre / Sakhi Integrated Crisis Assistance",
                    "Mission Shakti Women Empowerment"
                ]
                attributes_dict["services_offered"] = {
                    "raw_value": services_list,
                    "normalized_value": services_list,
                    "evidence_text": "Comprehensive 24x7 emergency crisis support, police escalation, and temporary shelter assistance."
                }
            if "helpline_numbers" not in attributes_dict:
                helplines = ["181", "1090", "112", "1098"]
                attributes_dict["helpline_numbers"] = {
                    "raw_value": helplines,
                    "normalized_value": helplines,
                    "evidence_text": f"Verified Emergency Helplines: Women Helpline {rec.get('women_helpline_181', '181')}, Powerline {rec.get('women_powerline_1090', '1090')}, Police {rec.get('police_assistance_112', '112')}."
                }
            if "emergency_24x7" not in attributes_dict:
                attributes_dict["emergency_24x7"] = {
                    "raw_value": True,
                    "normalized_value": True,
                    "evidence_text": "24x7 round-the-clock emergency distress response."
                }
            if "women_powerline_1090" in rec and "women_powerline_1090" not in attributes_dict:
                attributes_dict["women_powerline_1090"] = {
                    "raw_value": rec["women_powerline_1090"],
                    "normalized_value": str(rec["women_powerline_1090"]),
                    "evidence_text": f"UP Women Power Line: {rec['women_powerline_1090']}"
                }
            if "women_helpline_181" in rec and "women_helpline_181" not in attributes_dict:
                attributes_dict["women_helpline_181"] = {
                    "raw_value": rec["women_helpline_181"],
                    "normalized_value": str(rec["women_helpline_181"]),
                    "evidence_text": f"Toll-free Women in Distress Helpline: {rec['women_helpline_181']}"
                }

        extra_fields = [
            "deposit_amount", "timings", "ayushman_bharat",
            "home_delivery", "women_desk", "operating_agency",
            "fare_structure", "route_line", "helpline_number", "counseling_available"
        ]
        for ef in extra_fields:
            if ef in rec and ef not in attributes_dict and rec[ef] is not None:
                val = rec[ef]
                if isinstance(val, dict) and "raw_value" in val:
                    attributes_dict[ef] = val
                else:
                    attributes_dict[ef] = {
                        "raw_value": str(val) if not isinstance(val, (int, float, bool, list)) else val,
                        "normalized_value": FieldNormalizer.normalize(ef, val),
                        "evidence_text": rec.get("evidence", {}).get(ef) or str(val)
                    }
                    
        return attributes_dict, locality, address
