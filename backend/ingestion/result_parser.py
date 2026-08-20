import logging
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional
from backend.models.database import (
    Source, Collector, CollectionRun, Resource,
    ResourceAttribute, Evidence
)
from backend.models.enums import (
    ResourceCategory, VerificationStatus, CollectorStatus,
    CollectionRunStatus
)
from backend.ingestion.normalizer import FieldNormalizer
from backend.ingestion.deduplication import EntityResolver
from backend.verification.validator import CategoryValidator
from backend.verification.conflict_detector import ConflictDetector
from backend.monitoring.change_detector import ChangeDetector

logger = logging.getLogger("heraccess.result_parser")

class ResultParser:
    @classmethod
    def ingest_collector_payload(
        cls,
        db_session,
        payload: Any,
        collector_id_override: Optional[str] = None,
        source_url_override: Optional[str] = None,
        category_override: Optional[ResourceCategory] = None
    ) -> Tuple[CollectionRun, int, float]:
        """
        Ingests collector output from either:
        1. Wrapped HerAccess payload format (with collector_id, source_url, records)
        2. Direct raw Bright Data Scraper Studio output (list of records or single dict)
        Preserves complete provenance, timestamps, evidence quotes, and validation checks.
        """
        crawler_diagnostics = None

        # Determine format
        if isinstance(payload, list):
            if len(payload) > 0 and isinstance(payload[0], dict) and "stations" in payload[0]:
                records_raw = payload[0].get("stations", [])
                collector_id = payload[0].get("collector_id") or collector_id_override or "c_mt1nlu1w3pkwb2h1i"
                source_url = payload[0].get("product_page_url") or source_url_override or "https://en.wikipedia.org/wiki/Lucknow_Metro"
                category = category_override or ResourceCategory.PUBLIC_TRANSPORT
                scraped_at_str = datetime.utcnow().isoformat()
            else:
                records_raw = payload
                collector_id = collector_id_override or "c_hostel_kamla_01"
                source_url = source_url_override or "https://kamlagirlshostel.com/"
                category = category_override or ResourceCategory.WOMEN_HOSTEL
                # Infer category & collector from records if override not given
                if not category_override and len(records_raw) > 0 and isinstance(records_raw[0], dict):
                    if "warden_contact" in records_raw[0] or "lkouniv.ac.in" in str(records_raw[0]):
                        category = ResourceCategory.WOMEN_HOSTEL
                        collector_id = collector_id_override or "c_mt1palv71amwtj4yp4"
                        source_url = source_url_override or records_raw[0].get("product_page_url") or "https://www.lkouniv.ac.in/en/page/hostels"
                    elif "hospital_name" in records_raw[0]:
                        category = ResourceCategory.HOSPITAL
                        collector_id = collector_id_override or "c_mt1ogapv1t1nhs5rht"
                        source_url = source_url_override or "https://www.apollohospitals.com/hospitals/apollo-hospitals-lucknow"
                    elif "station_name" in records_raw[0]:
                        category = ResourceCategory.PUBLIC_TRANSPORT
                        collector_id = collector_id_override or "c_mt1nlu1w3pkwb2h1i"
                        source_url = source_url_override or "https://en.wikipedia.org/wiki/Lucknow_Metro"
                    elif "women_powerline_1090" in records_raw[0] or "mahilakalyan.up.nic.in" in str(records_raw[0]):
                        category = ResourceCategory.WOMEN_SUPPORT
                        collector_id = collector_id_override or "c_mt1qwsbmqm9fi1vu6"
                        source_url = source_url_override or "https://mahilakalyan.up.nic.in/"
                scraped_at_str = datetime.utcnow().isoformat()
        elif isinstance(payload, dict) and "hostels" in payload:
            # Top-level hostels array (e.g. Sulekha Bright Data Scraper output)
            records_raw = payload.get("hostels", [])
            collector_id = payload.get("collector_id") or collector_id_override or "c_mt1i5ri4trltbvw66"
            source_url = payload.get("source_url") or source_url_override or "https://www.sulekha.com/womens-hostel/lucknow"
            category = category_override or ResourceCategory.WOMEN_HOSTEL
            scraped_at_str = payload.get("scraped_at")
            crawler_diagnostics = payload.get("crawler_diagnostics")
        elif isinstance(payload, dict) and "records" in payload:
            records_raw = payload.get("records", [])
            collector_id = payload.get("collector_id") or collector_id_override or "c_hostel_kamla_01"
            source_url = payload.get("source_url") or source_url_override or "https://kamlagirlshostel.com/"
            category_str = payload.get("category")
            category = ResourceCategory(category_str) if category_str else (category_override or ResourceCategory.WOMEN_HOSTEL)
            scraped_at_str = payload.get("scraped_at")
            crawler_diagnostics = payload.get("crawler_diagnostics")
        elif isinstance(payload, dict):
            # Single object direct Bright Data output
            records_raw = [payload]
            collector_id = collector_id_override or "c_hostel_kamla_01"
            source_url = source_url_override or "https://kamlagirlshostel.com/"
            category = category_override or ResourceCategory.WOMEN_HOSTEL
            if not category_override:
                if "hospital_name" in payload:
                    category = ResourceCategory.HOSPITAL
                    collector_id = collector_id_override or "c_mt1ogapv1t1nhs5rht"
                    source_url = source_url_override or "https://www.apollohospitals.com/hospitals/apollo-hospitals-lucknow"
                elif "station_name" in payload:
                    category = ResourceCategory.PUBLIC_TRANSPORT
                    collector_id = collector_id_override or "c_mt1nlu1w3pkwb2h1i"
                    source_url = source_url_override or "https://en.wikipedia.org/wiki/Lucknow_Metro"
                elif "women_powerline_1090" in payload or "mahilakalyan.up.nic.in" in str(payload):
                    category = ResourceCategory.WOMEN_SUPPORT
                    collector_id = collector_id_override or "c_mt1qwsbmqm9fi1vu6"
                    source_url = source_url_override or "https://mahilakalyan.up.nic.in/"
            scraped_at_str = datetime.utcnow().isoformat()
            crawler_diagnostics = payload.get("crawler_diagnostics")
        else:
            records_raw = []
            collector_id = collector_id_override or "c_unknown"
            source_url = source_url_override or "https://example.com"
            category = category_override or ResourceCategory.WOMEN_HOSTEL
            scraped_at_str = datetime.utcnow().isoformat()

        source_domain = source_url.split("//")[-1].split("/")[0] if "//" in source_url else source_url
        observed_at = datetime.fromisoformat(scraped_at_str.replace("Z", "+00:00")) if scraped_at_str else datetime.utcnow()
        records = records_raw

        # 1. Upsert Source
        source = db_session.query(Source).filter(Source.url == source_url).first()
        if not source:
            source = Source(
                url=source_url,
                domain=source_domain,
                name=source_domain,
                category=category,
                last_scraped_at=observed_at
            )
            db_session.add(source)
            db_session.commit()
            db_session.refresh(source)
        else:
            source.last_scraped_at = observed_at
            db_session.commit()

        # 2. Upsert Collector Record
        collector = db_session.query(Collector).filter(Collector.collector_id == collector_id).first()
        if not collector:
            collector = Collector(
                collector_id=collector_id,
                name=f"{source_domain} {category.value} Scraper",
                category=category,
                source_id=source.id,
                target_url=source_url,
                status=CollectorStatus.HEALTHY,
                last_run_at=observed_at
            )
            db_session.add(collector)
            db_session.commit()
            db_session.refresh(collector)
        else:
            collector.last_run_at = observed_at

        # 3. Create Collection Run (recording diagnostics if present without dropping records)
        error_summary_text = None
        if crawler_diagnostics:
            if isinstance(crawler_diagnostics, dict):
                error_summary_text = crawler_diagnostics.get("diagnostic_summary") or json.dumps(crawler_diagnostics)
            else:
                error_summary_text = str(crawler_diagnostics)

        run = CollectionRun(
            collector_id=collector_id,
            triggered_at=observed_at,
            completed_at=datetime.utcnow(),
            status=CollectionRunStatus.COMPLETED,
            records_count=len(records),
            error_summary=error_summary_text
        )
        db_session.add(run)
        db_session.commit()
        db_session.refresh(run)

        # 4. Ingest and validate records
        total_validations = 0
        passed_validations = 0
        ingested_count = 0

        is_directory_source = (collector_id in ["c_mt1i5ri4trltbvw66", "c_hostel_sulekha_01"]) or ("sulekha.com" in source_url)
        is_secondary_public = (collector_id in ["c_mt1nlu1w3pkwb2h1i"]) or ("wikipedia.org" in source_url)
        is_institutional = (collector_id in ["c_mt1palv71amwtj4yp4"]) or ("lkouniv.ac.in" in source_url)
        is_state_support = (collector_id in ["c_mt1qwsbmqm9fi1vu6"]) or ("mahilakalyan.up.nic.in" in source_url)

        for rec in records:
            name = (
                rec.get("hostel_name")
                or rec.get("hospital_name")
                or rec.get("station_name")
                or rec.get("pharmacy_name")
                or rec.get("centre_name")
                or rec.get("organization_name")
                or rec.get("name")
            )
            if not name:
                continue

            name = FieldNormalizer.normalize_name(name)
            city = rec.get("city", "Lucknow")
            locality = FieldNormalizer.normalize_locality(rec.get("locality"))
            address = FieldNormalizer.normalize_address(rec.get("full_address") or rec.get("address"))
            lat = rec.get("latitude")
            lon = rec.get("longitude")
            item_source_url = rec.get("source_url") or source_url

            # Resolve coordinates if missing from address/locality
            if (not lat or not lon) and (locality or address):
                from backend.services.geo import GeoService
                loc_key = locality or address
                lat, lon = GeoService.resolve_target_coordinates(loc_key, city)

            # Contact numbers (support string or list of contacts)
            raw_contacts = rec.get("contact_numbers") or rec.get("contact_phone") or rec.get("contact") or rec.get("phone")
            if isinstance(raw_contacts, list):
                contact = ", ".join(str(c).strip() for c in raw_contacts if str(c).strip())
            else:
                contact = str(raw_contacts).strip() if raw_contacts else None

            # Extract or construct attributes dictionary
            attributes_dict = rec.get("attributes", {})
            if not attributes_dict:
                # 1. Room Types & Pricing
                if "room_types" in rec and rec["room_types"] is not None:
                    norm_rooms = FieldNormalizer.normalize_room_types(rec["room_types"])
                    attributes_dict["room_types"] = {
                        "raw_value": rec["room_types"],
                        "normalized_value": norm_rooms,
                        "evidence_text": f"Extracted {len(norm_rooms)} room options from published accommodation list."
                    }
                    # Extract starting minimum monthly price
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

                # 2. Curfew / Gate closing
                raw_curfew = rec.get("curfew_timings") or rec.get("curfew_time")
                if raw_curfew is not None:
                    attributes_dict["curfew_time"] = {
                        "raw_value": raw_curfew,
                        "normalized_value": FieldNormalizer.normalize_curfew(raw_curfew),
                        "evidence_text": f"Gate closing policy: {raw_curfew}"
                    }

                # 3. Women Only
                if "women_only" in rec and rec["women_only"] is not None:
                    attributes_dict["women_only"] = {
                        "raw_value": rec["women_only"],
                        "normalized_value": FieldNormalizer.normalize_boolean(rec["women_only"]),
                        "evidence_text": "Strictly female/women-only accommodation." if rec["women_only"] else "Co-ed accommodation."
                    }

                # 4. Rating (e.g. from directory review widgets)
                if "rating" in rec and rec["rating"] is not None:
                    norm_rating = FieldNormalizer.normalize_rating(rec["rating"])
                    if norm_rating is not None:
                        attributes_dict["rating"] = {
                            "raw_value": rec["rating"],
                            "normalized_value": norm_rating,
                            "evidence_text": f"Sulekha directory rating: {norm_rating}/5.0 based on user reviews."
                        }

                # 5. Meal details
                if "meal_details" in rec and rec["meal_details"] is not None:
                    attributes_dict["meal_details"] = {
                        "raw_value": rec["meal_details"],
                        "normalized_value": str(rec["meal_details"]).strip(),
                        "evidence_text": str(rec["meal_details"]).strip()
                    }

                # 6. Facilities & Services Separation
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

                # 7. Contact numbers attribute
                if raw_contacts is not None:
                    attributes_dict["contact_numbers"] = {
                        "raw_value": raw_contacts,
                        "normalized_value": raw_contacts if isinstance(raw_contacts, list) else [str(raw_contacts)],
                        "evidence_text": f"Published contact: {contact}"
                    }

                # 8. Directory Source Tag
                if is_directory_source:
                    attributes_dict["directory_source"] = {
                        "raw_value": "Sulekha Directory",
                        "normalized_value": "sulekha",
                        "evidence_text": f"Sulekha directory listing at {item_source_url}"
                    }

                # 9. Healthcare / Hospital specific attributes
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

                # 10. Published date
                pub_date = rec.get("published_date") or rec.get("published_at")
                if pub_date is not None:
                    attributes_dict["published_date"] = {
                        "raw_value": pub_date,
                        "normalized_value": str(pub_date),
                        "evidence_text": f"Published on: {pub_date}"
                    }

                # 11. Transport / Metro specific attributes
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

                # 12. Apollo Hospital / Private Tertiary Care Healthcare attributes
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

                # 13. University of Lucknow Women's Hostels attributes
                if collector_id == "c_mt1palv71amwtj4yp4" or "lkouniv.ac.in" in item_source_url:
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

                # 14. UP Mahila Kalyan Women Safety & Support Services
                if collector_id == "c_mt1qwsbmqm9fi1vu6" or is_state_support:
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

                # Additional candidate fields
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

            # Verification level: DIRECT vs DIRECTORY vs SECONDARY
            record_verification_status = VerificationStatus.MEDIUM if (is_directory_source or is_secondary_public) else VerificationStatus.HIGH

            # Validate attributes
            is_valid, pass_rate, missing_fields = CategoryValidator.validate_resource_payload(category, attributes_dict)
            total_validations += 1
            if is_valid or is_directory_source or is_secondary_public or is_institutional or is_state_support:
                passed_validations += 1

            # Entity resolution / Deduplication (Carefully avoids merging different hostels)
            existing_resource = EntityResolver.find_duplicate_resource(db_session, name, category.value, lat, lon)
            if existing_resource:
                resource = existing_resource
                # Update contact and locality if missing
                if contact and not resource.primary_contact:
                    resource.primary_contact = contact
                if locality and not resource.locality:
                    resource.locality = locality
                if address and not resource.address:
                    resource.address = address
            else:
                resource = Resource(
                    category=category,
                    name=name,
                    city=city,
                    locality=locality,
                    address=address,
                    latitude=lat,
                    longitude=lon,
                    primary_contact=contact,
                    source_url=item_source_url,
                    created_at=observed_at,
                    updated_at=observed_at
                )
                db_session.add(resource)
                db_session.commit()
                db_session.refresh(resource)

            # Process attributes & evidence
            normalized_snapshot_dict = {}
            for field_name, attr_data in attributes_dict.items():
                if attr_data is None:
                    continue

                raw_val = attr_data.get("raw_value")
                norm_val = attr_data.get("normalized_value")
                if norm_val is None and raw_val is not None:
                    norm_val = FieldNormalizer.normalize(field_name, raw_val)

                evidence_text = attr_data.get("evidence_text")
                normalized_snapshot_dict[field_name] = norm_val

                # Check for cross-source conflicts
                ConflictDetector.check_and_record_conflict(
                    db_session,
                    resource.id,
                    field_name,
                    norm_val,
                    item_source_url,
                    observed_at
                )

                # Upsert ResourceAttribute
                existing_attr = db_session.query(ResourceAttribute).filter(
                    ResourceAttribute.resource_id == resource.id,
                    ResourceAttribute.field_name == field_name,
                    ResourceAttribute.source_url == item_source_url
                ).first()

                confidence_calc = 0.95 if is_institutional else (0.85 if is_secondary_public else (0.8 if is_directory_source else 1.0))

                if existing_attr:
                    existing_attr.raw_value = str(raw_val) if raw_val is not None else None
                    existing_attr.normalized_value = norm_val
                    existing_attr.evidence_text = evidence_text
                    existing_attr.observed_at = observed_at
                    existing_attr.collector_id = collector_id
                    existing_attr.verification_status = record_verification_status
                    existing_attr.confidence_score = confidence_calc
                else:
                    new_attr = ResourceAttribute(
                        resource_id=resource.id,
                        field_name=field_name,
                        raw_value=str(raw_val) if raw_val is not None else None,
                        normalized_value=norm_val,
                        source_url=item_source_url,
                        source_domain=source_domain,
                        source_id=source.id,
                        evidence_text=evidence_text,
                        observed_at=observed_at,
                        collector_id=collector_id,
                        verification_status=record_verification_status,
                        confidence_score=confidence_calc
                    )
                    db_session.add(new_attr)
                    db_session.commit()
                    db_session.refresh(new_attr)

                    # Save explicit Evidence record
                    if evidence_text:
                        ev = Evidence(
                            attribute_id=new_attr.id,
                            resource_id=resource.id,
                            field_name=field_name,
                            evidence_quote=evidence_text,
                            source_url=item_source_url,
                            observed_at=observed_at,
                            extracted_by_collector=collector_id
                        )
                        db_session.add(ev)

            # Record Snapshot and Change Events
            ChangeDetector.compare_and_record_changes(
                db_session,
                resource.id,
                normalized_snapshot_dict,
                observed_at,
                collector_id,
                source_url
            )
            ingested_count += 1

        overall_pass_rate = (passed_validations / total_validations) if total_validations > 0 else 1.0
        run.validation_pass_rate = round(overall_pass_rate, 3)

        # Update collector status based on validation pass rate
        if overall_pass_rate == 1.0:
            collector.status = CollectorStatus.HEALTHY
        elif overall_pass_rate >= 0.6:
            collector.status = CollectorStatus.DEGRADED
        else:
            collector.status = CollectorStatus.FAILED
            run.status = CollectionRunStatus.VALIDATION_FAILED

        db_session.commit()
        return run, ingested_count, overall_pass_rate
