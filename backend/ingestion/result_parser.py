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
        category_override: Optional[ResourceCategory] = None,
        is_demo_run: bool = False
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
            if (not lat or not lon):
                from backend.services.geo import GeoService
                
                # For transport stations, the exact name is more reliable for coordinate resolution than extracted locality
                if category == ResourceCategory.PUBLIC_TRANSPORT:
                    lat, lon = GeoService.resolve_target_coordinates(name, city)
                    
                if (not lat or not lon) and (locality or address):
                    loc_key = locality or address
                    lat, lon = GeoService.resolve_target_coordinates(loc_key, city)

            # Contact numbers (support string or list of contacts)
            raw_contacts = rec.get("contact_numbers") or rec.get("contact_phone") or rec.get("contact") or rec.get("phone")
            if isinstance(raw_contacts, list):
                contact = ", ".join(str(c).strip() for c in raw_contacts if str(c).strip())
            else:
                contact = str(raw_contacts).strip() if raw_contacts else None

            # Extract attributes using dedicated extractor
            from backend.ingestion.attribute_extractor import AttributeExtractor
            attributes_dict, locality, address = AttributeExtractor.extract_attributes(
                rec, category, collector_id, item_source_url, name, locality, address
            )

            # Verification level: DIRECT vs DIRECTORY vs SECONDARY
            record_verification_status = VerificationStatus.MEDIUM if (is_directory_source or is_secondary_public) else VerificationStatus.HIGH

            # Validate attributes
            is_valid, pass_rate, missing_fields = CategoryValidator.validate_resource_payload(category, attributes_dict)
            total_validations += 1
            if is_valid or is_directory_source or is_secondary_public or is_institutional or is_state_support:
                passed_validations += 1

            # Resolve coordinates from locality/address/name if missing
            if lat is None or lon is None:
                from backend.services.geo import GeoService
                lat, lon = GeoService.resolve_target_coordinates(locality or address or name, city)

            # Entity resolution / Deduplication
            existing_resource = EntityResolver.find_duplicate_resource(db_session, name, category.value, lat, lon)
            if existing_resource:
                resource = existing_resource
                # Update contact, locality, and coordinates if missing
                if contact and not resource.primary_contact:
                    resource.primary_contact = contact
                if locality and not resource.locality:
                    resource.locality = locality
                if address and not resource.address:
                    resource.address = address
                if (resource.latitude is None or resource.longitude is None) and lat and lon:
                    resource.latitude = lat
                    resource.longitude = lon
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

            # Record Snapshot and Change Events (isolated from simulated demo breaks)
            if not is_demo_run:
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
        db_session.commit()

        # Dynamically refresh LocationIndex so any new localities/addresses/landmarks are instantly searchable
        try:
            from backend.services.location_index import LocationIndex
            LocationIndex.refresh_index(db_session)
        except Exception as e:
            logger.warning(f"Could not refresh LocationIndex after ingestion: {e}")

        return run, ingested_count, overall_pass_rate
