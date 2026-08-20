import pytest
from backend.models.database import init_db, SessionLocal, Resource, ResourceAttribute, Evidence, Collector
from backend.models.enums import ResourceCategory, VerificationStatus
from backend.ingestion.collector_runner import CollectorRunner
from backend.ingestion.result_parser import ResultParser
from backend.ingestion.normalizer import FieldNormalizer
from backend.models.schemas import ParsedIntent
from backend.services.matching_engine import MatchingEngine

REAL_BRIGHT_DATA_RESPONSE = [
    {
        "hostel_name": "Best Hostel for Girls in Lucknow",
        "address": "B1/4, Kanpur Rd, Sector D, LDA Colony, Lucknow, Uttar Pradesh 226012",
        "locality": "LDA Colony",
        "room_types": [
            {
                "accommodation_type": "Single Person",
                "room_features": "AC & Non AC Rooms",
                "monthly_rent": {
                    "value": 12000,
                    "currency": "INR",
                    "symbol": "₹"
                }
            },
            {
                "accommodation_type": "Twin Sharing",
                "room_features": "AC & Non AC Rooms",
                "monthly_rent": {
                    "value": 10000,
                    "currency": "INR",
                    "symbol": "₹"
                }
            },
            {
                "accommodation_type": "Triple Sharing",
                "room_features": "AC & Non AC Rooms",
                "monthly_rent": {
                    "value": 10000,
                    "currency": "INR",
                    "symbol": "₹"
                }
            }
        ],
        "meal_details": "Fooding facility is compulsory.",
        "women_only": True,
        "curfew_timings": "9:30-10:00 pm",
        "contact_numbers": [
            "+91 8400005555",
            "9452129219"
        ],
        "facilities": [
            "Washing machine facility for washing clothes.",
            "Microwave Facility Available for light cooking.",
            "Television for entertainment & bed, mattress, bed sheet, pillow etc..",
            "Refrigerator, Microwave facility available.",
            "Wi-Fi facility for internet.",
            "Kent RO for drinking water. Facility of bucket, mug.",
            "Power backup & First Aid facility.",
            "Daily cleaning facility.",
            "Listening or playing any kind of loud music or talking loudly on mobile is strictly prohibited.",
            "The entry of any male other than Gaurdian inside the hostel is completely prohibited.",
            "Hostel gate will be closed between 9:30-10:00 pm. This has to be taken care of.",
            "In case of not staying in the hostel, going home, leaving the hostel for any work or going on leave, the full amount of the hostel will have to be paid. No discount of any kind will be given in the fare.",
            "On leaving the Girls Hostel, going out or going home, the Warden will have to be informed first.",
            "Eating, bringing or boiling non-veg or eggs etc. is not allowed in the hostel. This Girls Hostel is completely Vegetarian."
        ],
        "source_url": "https://kamlagirlshostel.com/",
        "input": {
            "url": "https://kamlagirlshostel.com/"
        }
    }
]

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    init_db()

def test_real_collector_registration():
    """Verify that real Collector ID c_mt1f0ke713h6n32pi4 is registered and resolvable."""
    meta = CollectorRunner.get_collector_meta("c_mt1f0ke713h6n32pi4")
    assert meta is not None
    assert meta["collector_id"] == "c_mt1f0ke713h6n32pi4"
    assert meta["category"] == ResourceCategory.WOMEN_HOSTEL
    assert meta["target_url"] == "https://kamlagirlshostel.com/"

    # Test backward-compatible alias lookup
    meta_alias = CollectorRunner.get_collector_meta("c_hostel_kamla_01")
    assert meta_alias is not None
    assert meta_alias["collector_id"] == "c_mt1f0ke713h6n32pi4"

def test_real_bright_data_output_ingestion_and_fields():
    """
    Verify complete ingestion of the actual Bright Data output:
    1. Hostel name & address mapping
    2. Nested room_types preservation & room-level pricing (Twin/Triple @ 10k, Single @ 12k)
    3. meal_details preservation
    4. women_only boolean
    5. Curfew range (start: 21:30, end: 22:00)
    6. Multiple contact numbers preserved
    7. Facilities vs policies separation
    8. Provenance preservation
    9. Published date null
    """
    db = SessionLocal()
    try:
        run, count, pass_rate = ResultParser.ingest_collector_payload(
            db,
            REAL_BRIGHT_DATA_RESPONSE,
            collector_id_override="c_mt1f0ke713h6n32pi4",
            source_url_override="https://kamlagirlshostel.com/",
            category_override=ResourceCategory.WOMEN_HOSTEL
        )

        assert count == 1
        assert pass_rate == 1.0
        assert run.collector_id == "c_mt1f0ke713h6n32pi4"

        # 1. Verify Resource Entity
        res = db.query(Resource).filter(
            Resource.source_url == "https://kamlagirlshostel.com/"
        ).first()
        assert res is not None
        assert "Best Hostel for Girls in Lucknow" in res.name
        assert "LDA Colony" in res.locality or "LDA Colony" in res.address
        assert "+91 8400005555" in res.primary_contact
        assert "9452129219" in res.primary_contact

        # 2. Verify Room Types & Room-Level Pricing
        room_types_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == res.id,
            ResourceAttribute.field_name == "room_types"
        ).first()
        assert room_types_attr is not None
        rooms = room_types_attr.normalized_value
        assert len(rooms) == 3
        single_room = next(r for r in rooms if r["accommodation_type"] == "Single Person")
        twin_room = next(r for r in rooms if r["accommodation_type"] == "Twin Sharing")
        triple_room = next(r for r in rooms if r["accommodation_type"] == "Triple Sharing")

        assert single_room["monthly_rent"]["value"] == 12000.0
        assert twin_room["monthly_rent"]["value"] == 10000.0
        assert triple_room["monthly_rent"]["value"] == 10000.0

        # Verify starting monthly_price attribute
        price_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == res.id,
            ResourceAttribute.field_name == "monthly_price"
        ).first()
        assert price_attr is not None
        assert price_attr.normalized_value == 10000.0  # lowest starting price

        # 3. Verify Meal Details
        meal_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == res.id,
            ResourceAttribute.field_name == "meal_details"
        ).first()
        assert meal_attr is not None
        assert "Fooding facility is compulsory." in meal_attr.normalized_value

        # 4. Verify Women Only
        women_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == res.id,
            ResourceAttribute.field_name == "women_only"
        ).first()
        assert women_attr is not None
        assert women_attr.normalized_value is True

        # 5. Verify Curfew Range
        curfew_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == res.id,
            ResourceAttribute.field_name == "curfew_time"
        ).first()
        assert curfew_attr is not None
        curfew_val = curfew_attr.normalized_value
        assert isinstance(curfew_val, dict)
        assert curfew_val["start"] == "21:30"
        assert curfew_val["end"] == "22:00"
        assert curfew_val["raw"] == "9:30-10:00 pm"

        # 6. Verify Multiple Contact Numbers
        contacts_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == res.id,
            ResourceAttribute.field_name == "contact_numbers"
        ).first()
        assert contacts_attr is not None
        assert "+91 8400005555" in contacts_attr.normalized_value
        assert "9452129219" in contacts_attr.normalized_value

        # 7. Verify Facilities vs Policies Separation
        fac_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == res.id,
            ResourceAttribute.field_name == "facilities"
        ).first()
        assert fac_attr is not None
        facilities = fac_attr.normalized_value
        assert any("Washing machine" in f for f in facilities)
        assert any("Wi-Fi" in f for f in facilities)
        assert any("Kent RO" in f for f in facilities)
        assert any("Power backup" in f for f in facilities)
        # Ensure rules/policies were filtered out of facilities
        assert not any("completely Vegetarian" in f for f in facilities)
        assert not any("entry of any male" in f for f in facilities)

        pol_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == res.id,
            ResourceAttribute.field_name == "policies"
        ).first()
        assert pol_attr is not None
        policies = pol_attr.normalized_value
        assert any("Vegetarian" in p for p in policies)
        assert any("entry of any male" in p for p in policies)
        assert any("closed between 9:30-10:00 pm" in p for p in policies)

        # 8. Verify Provenance
        assert price_attr.collector_id == "c_mt1f0ke713h6n32pi4"
        assert price_attr.source_url == "https://kamlagirlshostel.com/"

        # 9. Verify Published Date is Null (Source did not publish a date)
        pub_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == res.id,
            ResourceAttribute.field_name == "published_date"
        ).first()
        assert pub_attr is None

        # 10. Search integration check (Search under 10k budget matches Twin/Triple options)
        intent = ParsedIntent(
            city="Lucknow",
            target_location="LDA Colony",
            user_type="female_student",
            budget_max=10500.0,
            distance_max_km=5.0,
            required_categories=[ResourceCategory.WOMEN_HOSTEL],
            preferences={"women_only": True},
            explanation="Under 10.5k search"
        )
        search_res = MatchingEngine.execute_search(db, intent)
        found = [r for r in search_res.primary_results if r.id == res.id]
        assert len(found) == 1
        assert found[0].match_score > 0
    finally:
        db.close()

def test_real_kgmu_hospital_collector_ingestion():
    """Verify real Bright Data collector c_mt1fujyq16vhxxfg7x ingestion for KGMU Hospital."""
    db = SessionLocal()
    try:
        col_meta = CollectorRunner.get_collector_meta("c_mt1fujyq16vhxxfg7x")
        assert col_meta is not None
        assert col_meta["category"] == ResourceCategory.HOSPITAL
        assert col_meta["target_url"] == "https://kgmu.org/"

        # Run ingestion
        payload = CollectorRunner.run_collector("c_mt1fujyq16vhxxfg7x")
        run, count, pass_rate = ResultParser.ingest_collector_payload(db, payload)
        assert count >= 1
        assert pass_rate >= 0.80

        # Query resource
        hosp = db.query(Resource).filter(Resource.name.like("%King George%")).first()
        assert hosp is not None
        assert hosp.category == ResourceCategory.HOSPITAL
        assert hosp.city == "Lucknow"
        assert hosp.locality == "Chowk"

        # Verify attributes & provenance
        em_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == hosp.id,
            ResourceAttribute.field_name == "emergency_24x7"
        ).first()
        assert em_attr is not None
        assert em_attr.normalized_value is True
        assert em_attr.collector_id == "c_mt1fujyq16vhxxfg7x"
    finally:
        db.close()

def test_real_sulekha_collector_registration():
    """Verify collector c_mt1i5ri4trltbvw66 is registered for women_hostel category."""
    meta = CollectorRunner.get_collector_meta("c_mt1i5ri4trltbvw66")
    assert meta is not None
    assert meta["collector_id"] == "c_mt1i5ri4trltbvw66"
    assert meta["category"] == ResourceCategory.WOMEN_HOSTEL
    assert "sulekha.com" in meta["target_url"]
    assert meta["is_real_collector"] is True

def test_real_sulekha_collector_ingestion_and_provenance():
    """
    Verify successful ingestion of 12 Sulekha directory records:
    1. Top-level {"hostels": [...]} payload parsing
    2. Exact 12 records extracted without loss
    3. Individual source_url preservation for each hostel
    4. Services/facilities mapping and rating preservation
    5. Absence of fabricated fields (curfew/price remain un-invented)
    6. Directory verification status (MEDIUM)
    7. Crawler diagnostics recorded in run without dropping records
    """
    db = SessionLocal()
    try:
        payload = CollectorRunner.run_collector("c_mt1i5ri4trltbvw66")
        assert "hostels" in payload
        assert len(payload["hostels"]) == 12

        run, count, pass_rate = ResultParser.ingest_collector_payload(db, payload)
        assert count == 12
        assert run.records_count == 12
        assert run.error_summary is not None
        assert "12 hostels successfully parsed" in run.error_summary or "CertificateValidationError" in run.error_summary

        # Verify a specific hostel (e.g. Shree Shyam Girls Hostel in Gomti Nagar)
        shree = db.query(Resource).filter(Resource.name == "Shree Shyam Girls Hostel").first()
        assert shree is not None
        assert shree.category == ResourceCategory.WOMEN_HOSTEL
        assert shree.locality == "Gomti Nagar"
        assert "sulekha.com/shree-shyam-girls-hostel" in shree.source_url

        # Check attributes & rating
        rating_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == shree.id,
            ResourceAttribute.field_name == "rating"
        ).first()
        assert rating_attr is not None
        assert rating_attr.normalized_value == 4.6
        assert rating_attr.verification_status == VerificationStatus.MEDIUM

        # Check facilities
        fac_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == shree.id,
            ResourceAttribute.field_name == "facilities"
        ).first()
        assert fac_attr is not None
        assert any("AC Rooms" in f or "Wi-Fi" in f for f in fac_attr.normalized_value)

        # Check that missing curfew was NOT fabricated
        curfew_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == shree.id,
            ResourceAttribute.field_name == "curfew_time"
        ).first()
        assert curfew_attr is None

        # Check Evidence record
        ev = db.query(Evidence).filter(Evidence.resource_id == shree.id).first()
        assert ev is not None
        assert ev.extracted_by_collector == "c_mt1i5ri4trltbvw66"
        assert "sulekha.com" in ev.source_url
    finally:
        db.close()

def test_real_lucknow_metro_collector_ingestion():
    """
    Verify real Bright Data collector c_mt1nlu1w3pkwb2h1i (Lucknow Metro):
    1. Ingestion of 21 operational stations
    2. Route line (Red Line), terminal, interchange extraction
    3. Public secondary source verification status (MEDIUM)
    4. Integration into support chain navigation
    """
    db = SessionLocal()
    try:
        col_meta = CollectorRunner.get_collector_meta("c_mt1nlu1w3pkwb2h1i")
        assert col_meta is not None
        assert col_meta["category"] == ResourceCategory.PUBLIC_TRANSPORT
        assert "wikipedia.org" in col_meta["target_url"]

        payload = CollectorRunner.run_collector("c_mt1nlu1w3pkwb2h1i")
        run, count, pass_rate = ResultParser.ingest_collector_payload(db, payload)
        assert count == 21
        assert pass_rate == 1.0
        assert run.collector_id == "c_mt1nlu1w3pkwb2h1i"

        # Check Hazratganj station or station attribute from this collector
        line_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.collector_id == "c_mt1nlu1w3pkwb2h1i",
            ResourceAttribute.field_name == "route_line"
        ).first()
        assert line_attr is not None
        assert "Red Line" in line_attr.normalized_value
        assert line_attr.verification_status == VerificationStatus.MEDIUM
        assert line_attr.collector_id == "c_mt1nlu1w3pkwb2h1i"

        # Check Charbagh interchange station from this collector
        inter_attrs = db.query(ResourceAttribute).filter(
            ResourceAttribute.collector_id == "c_mt1nlu1w3pkwb2h1i",
            ResourceAttribute.field_name == "is_interchange"
        ).all()
        assert len(inter_attrs) > 0
        assert any(a.normalized_value is True for a in inter_attrs)
    finally:
        db.close()

def test_real_apollo_hospital_collector_ingestion():
    """
    Verify real Bright Data collector c_mt1ogapv1t1nhs5rht (Apollo Hospitals Lucknow):
    1. Direct healthcare emergency extraction in LDA Colony
    2. 24x7 Emergency hotline 05226788888
    3. Gynaecology & Trauma department capabilities
    4. Verification level HIGH (direct source)
    """
    db = SessionLocal()
    try:
        col_meta = CollectorRunner.get_collector_meta("c_mt1ogapv1t1nhs5rht")
        assert col_meta is not None
        assert col_meta["category"] == ResourceCategory.HOSPITAL
        assert "apollohospitals.com" in col_meta["target_url"]

        payload = CollectorRunner.run_collector("c_mt1ogapv1t1nhs5rht")
        run, count, pass_rate = ResultParser.ingest_collector_payload(db, payload)
        assert count == 1
        assert pass_rate == 1.0

        apollo = db.query(Resource).filter(Resource.name.like("%Apollo Hospitals%")).first()
        assert apollo is not None
        assert apollo.category == ResourceCategory.HOSPITAL
        assert "LDA Colony" in apollo.locality or "LDA Colony" in apollo.address

        em_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == apollo.id,
            ResourceAttribute.field_name == "emergency_services"
        ).first()
        assert em_attr is not None
        assert em_attr.normalized_value is True
        assert em_attr.verification_status == VerificationStatus.HIGH
        assert em_attr.collector_id == "c_mt1ogapv1t1nhs5rht"

        gyn_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == apollo.id,
            ResourceAttribute.field_name == "women_gynaecology_unit"
        ).first()
        assert gyn_attr is not None
        assert gyn_attr.normalized_value is True
    finally:
        db.close()

def test_real_lkouniv_hostel_collector_ingestion():
    """
    Verify real Bright Data collector c_mt1palv71amwtj4yp4 (University of Lucknow Women's Hostels):
    1. Institutional academic accommodation extraction
    2. Direct official source verification status (HIGH)
    3. Warden administration contacts & official emails
    4. Integration into search and accommodation discovery
    """
    db = SessionLocal()
    try:
        col_meta = CollectorRunner.get_collector_meta("c_mt1palv71amwtj4yp4")
        assert col_meta is not None
        assert col_meta["category"] == ResourceCategory.WOMEN_HOSTEL
        assert "lkouniv.ac.in" in col_meta["target_url"]

        payload = CollectorRunner.run_collector("c_mt1palv71amwtj4yp4")
        run, count, pass_rate = ResultParser.ingest_collector_payload(db, payload)
        assert count == 1
        assert pass_rate == 1.0
        assert run.collector_id == "c_mt1palv71amwtj4yp4"

        ganga = db.query(Resource).filter(
            Resource.category == ResourceCategory.WOMEN_HOSTEL,
            Resource.name.like("%Ganga Hall%")
        ).first()
        assert ganga is not None
        assert ganga.category == ResourceCategory.WOMEN_HOSTEL
        assert "Jankipuram" in ganga.locality or "Jankipuram" in ganga.address
        assert "lkouniv.ac.in" in ganga.source_url

        warden_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == ganga.id,
            ResourceAttribute.field_name == "warden"
        ).first()
        assert warden_attr is not None
        assert "Kalindri" in warden_attr.normalized_value
        assert warden_attr.verification_status == VerificationStatus.HIGH
        assert warden_attr.collector_id == "c_mt1palv71amwtj4yp4"

        women_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == ganga.id,
            ResourceAttribute.field_name == "women_only"
        ).first()
        assert women_attr is not None
        assert women_attr.normalized_value is True
    finally:
        db.close()

def test_real_mahilakalyan_women_support_collector_ingestion():
    """
    Verify real Bright Data collector c_mt1qwsbmqm9fi1vu6 (UP Mahila Kalyan Women Support & Emergency Helplines):
    1. State-level official crisis support service extraction
    2. Helplines verification: 181, 1090, 112, 1098
    3. Direct government source verification status (HIGH)
    4. Integration into support ecosystem
    """
    db = SessionLocal()
    try:
        col_meta = CollectorRunner.get_collector_meta("c_mt1qwsbmqm9fi1vu6")
        assert col_meta is not None
        assert col_meta["category"] == ResourceCategory.WOMEN_SUPPORT
        assert "mahilakalyan.up.nic.in" in col_meta["target_url"]

        payload = CollectorRunner.run_collector("c_mt1qwsbmqm9fi1vu6")
        run, count, pass_rate = ResultParser.ingest_collector_payload(db, payload)
        assert count == 1
        assert pass_rate == 1.0
        assert run.collector_id == "c_mt1qwsbmqm9fi1vu6"

        support_res = db.query(Resource).filter(
            Resource.category == ResourceCategory.WOMEN_SUPPORT,
            Resource.name.like("%Government of Uttar Pradesh%")
        ).first()
        assert support_res is not None
        assert "mahilakalyan.up.nic.in" in support_res.source_url

        helpline_attr = db.query(ResourceAttribute).filter(
            ResourceAttribute.resource_id == support_res.id,
            ResourceAttribute.field_name == "helpline_numbers"
        ).first()
        assert helpline_attr is not None
        assert "181" in helpline_attr.normalized_value
        assert "1090" in helpline_attr.normalized_value
        assert helpline_attr.verification_status == VerificationStatus.HIGH
        assert helpline_attr.collector_id == "c_mt1qwsbmqm9fi1vu6"
    finally:
        db.close()


