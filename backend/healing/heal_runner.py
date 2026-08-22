import logging
import json
import os
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.models.database import Collector, HealingEvent, CollectionRun, Resource, SessionLocal
from backend.models.enums import CollectorStatus, HealingStatus, CollectionRunStatus, ResourceCategory
from backend.ingestion.collector_runner import CollectorRunner, DEMO_STATE
from backend.ingestion.result_parser import ResultParser
from backend.verification.validator import CategoryValidator

logger = logging.getLogger("heraccess.heal_runner")

# State tracker for real controlled schema failure on production collectors
REAL_HEAL_STATE = {
    "target_collector_id": "c_mt1f0ke713h6n32pi4",
    "target_url": "https://kamlagirlshostel.com/",
    "is_failing": False,
    "failed_fields": [],
    "validation_score": 1.0,
    "last_error": None,
    "last_cli_output": None,
    "last_cli_command": None,
    "last_cli_returncode": 0,
    "last_execution_duration_sec": 0.0,
    "last_run_status": "healthy"
}

class HealRunner:
    @classmethod
    def get_real_self_healing_status(cls, db_session) -> Dict[str, Any]:
        """
        Returns real database state and telemetry for collector c_mt1f0ke713h6n32pi4.
        """
        collector_id = REAL_HEAL_STATE["target_collector_id"]
        collector = db_session.query(Collector).filter(Collector.collector_id == collector_id).first()

        recent_events = db_session.query(HealingEvent).filter(
            HealingEvent.collector_id == collector_id
        ).order_by(HealingEvent.triggered_at.desc()).limit(10).all()

        recent_runs = db_session.query(CollectionRun).filter(
            CollectionRun.collector_id == collector_id
        ).order_by(CollectionRun.triggered_at.desc()).limit(5).all()

        return {
            "collector_id": collector_id,
            "name": collector.name if collector else "Kamla Girls Hostel Extractor",
            "source_url": REAL_HEAL_STATE["target_url"],
            "category": "women_hostel",
            "status": collector.status.value if collector else "healthy",
            "is_failing": REAL_HEAL_STATE["is_failing"],
            "failed_fields": REAL_HEAL_STATE["failed_fields"],
            "validation_score": REAL_HEAL_STATE["validation_score"],
            "last_healed_at": collector.last_healed_at.isoformat() if (collector and collector.last_healed_at) else None,
            "heal_count": collector.heal_count if collector else 0,
            "last_cli_command": REAL_HEAL_STATE["last_cli_command"],
            "last_cli_output": REAL_HEAL_STATE["last_cli_output"],
            "last_cli_returncode": REAL_HEAL_STATE["last_cli_returncode"],
            "last_execution_duration_sec": REAL_HEAL_STATE["last_execution_duration_sec"],
            "last_run_status": REAL_HEAL_STATE["last_run_status"],
            "recent_events": [
                {
                    "id": ev.id,
                    "collector_id": ev.collector_id,
                    "problem_description": ev.problem_description,
                    "failed_fields": ev.failed_fields,
                    "status": ev.status.value,
                    "triggered_at": ev.triggered_at.isoformat() if ev.triggered_at else None,
                    "resolved_at": ev.resolved_at.isoformat() if ev.resolved_at else None,
                    "fields_recovered": ev.fields_recovered,
                    "fix_details": ev.fix_details
                }
                for ev in recent_events
            ],
            "recent_runs": [
                {
                    "id": r.id,
                    "triggered_at": r.triggered_at.isoformat() if r.triggered_at else None,
                    "status": r.status.value,
                    "records_count": r.records_count,
                    "validation_pass_rate": r.validation_pass_rate,
                    "error_summary": r.error_summary
                }
                for r in recent_runs
            ]
        }

    @classmethod
    def trigger_real_schema_failure_test(
        cls,
        db_session,
        collector_id: str = "c_mt1f0ke713h6n32pi4",
        broken_fields: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Executes real CategoryValidator schema validation against a controlled mutated payload.
        Discloses clearly: Controlled schema failure injection to test backend detection.
        """
        if not broken_fields:
            broken_fields = ["monthly_price", "curfew_time", "primary_contact"]

        collector = db_session.query(Collector).filter(Collector.collector_id == collector_id).first()
        if not collector:
            raise ValueError(f"Collector {collector_id} not registered in database.")

        # 1. Fetch nominal payload
        raw_payload = CollectorRunner.run_collector(collector_id)
        records = raw_payload.get("records", []) if isinstance(raw_payload, dict) else raw_payload

        # 2. Mutate schema to simulate target DOM selector drift
        mutated_attrs = {}
        if records and len(records) > 0:
            rec = records[0]
            mutated_attrs = dict(rec.get("attributes", {}))
            for f in broken_fields:
                mutated_attrs[f] = None

        # 3. Execute actual CategoryValidator on the mutated schema
        is_valid, pass_rate, missing = CategoryValidator.validate_resource_payload(
            ResourceCategory.WOMEN_HOSTEL,
            mutated_attrs
        )

        # 4. Update Database Entities
        collector.status = CollectorStatus.FAILED
        REAL_HEAL_STATE["is_failing"] = True
        REAL_HEAL_STATE["failed_fields"] = broken_fields
        REAL_HEAL_STATE["validation_score"] = round(pass_rate, 2)
        REAL_HEAL_STATE["last_run_status"] = "validation_failed"

        # Log CollectionRun with VALIDATION_FAILED
        run = CollectionRun(
            collector_id=collector_id,
            triggered_at=datetime.utcnow(),
            completed_at=datetime.utcnow(),
            status=CollectionRunStatus.VALIDATION_FAILED,
            records_count=len(records),
            validation_pass_rate=pass_rate,
            error_summary=f"Controlled failure injection: Required attributes missing: {broken_fields}"
        )
        db_session.add(run)

        # Log HealingEvent in TRIGGERED state
        heal_ev = HealingEvent(
            collector_id=collector_id,
            problem_description=f"Controlled schema failure injection. Required selectors {broken_fields} returned null. Validation rate dropped to {pass_rate*100:.1f}%.",
            failed_fields=broken_fields,
            status=HealingStatus.TRIGGERED,
            triggered_at=datetime.utcnow()
        )
        db_session.add(heal_ev)
        db_session.commit()

        return {
            "collector_id": collector_id,
            "status": "validation_failed",
            "is_valid": is_valid,
            "validation_score": pass_rate,
            "missing_fields": missing or broken_fields,
            "expected_schema": ["monthly_price", "curfew_time", "women_only", "primary_contact", "address"],
            "actual_schema": [k for k, v in mutated_attrs.items() if v is not None],
            "collection_run_id": run.id,
            "healing_event_id": heal_ev.id,
            "message": f"Controlled schema failure injection evaluated by CategoryValidator! Validation pass rate: {pass_rate*100:.1f}%. Collector {collector_id} status updated to FAILED."
        }

    @classmethod
    def execute_real_heal(
        cls,
        db_session,
        collector_id: str = "c_mt1f0ke713h6n32pi4",
        prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes actual Bright Data Scraper Studio heal workflow:
        1. Executes `npx @brightdata/cli scraper heal <collector_id> "<prompt>"`
        2. Captures real CLI output, returncode, and execution duration.
        3. Strictly inspects returncode and JSON status - NEVER converts failure to success.
        4. If CLI succeeds: Re-runs collector with the SAME collector ID.
        5. Re-validates data integrity via CategoryValidator.
        6. Updates HealingEvent and Collector accordingly.
        """
        if not prompt:
            prompt = f"Fix selectors for {', '.join(REAL_HEAL_STATE['failed_fields'] or ['monthly_price', 'curfew_time'])} on target domain."

        collector = db_session.query(Collector).filter(Collector.collector_id == collector_id).first()
        if not collector:
            raise ValueError(f"Collector {collector_id} not registered.")

        # Update event and collector to IN_PROGRESS
        collector.status = CollectorStatus.HEALING
        healing_ev = db_session.query(HealingEvent).filter(
            HealingEvent.collector_id == collector_id,
            HealingEvent.status == HealingStatus.TRIGGERED
        ).order_by(HealingEvent.triggered_at.desc()).first()

        if not healing_ev:
            healing_ev = HealingEvent(
                collector_id=collector_id,
                problem_description=prompt,
                failed_fields=REAL_HEAL_STATE["failed_fields"] or ["monthly_price", "curfew_time"],
                status=HealingStatus.IN_PROGRESS,
                triggered_at=datetime.utcnow()
            )
            db_session.add(healing_ev)
        else:
            healing_ev.status = HealingStatus.IN_PROGRESS

        db_session.commit()

        # Execute Bright Data CLI command via BrightDataClient
        cmd_str = f"npx @brightdata/cli scraper heal {collector_id} \"{prompt}\" --auto-approve --json"
        REAL_HEAL_STATE["last_cli_command"] = cmd_str

        logger.info(f"Executing Bright Data CLI heal command via client: {cmd_str}")

        start_time = time.time()
        
        from backend.services.bright_data_client import BrightDataClient
        result = BrightDataClient.heal_scraper(collector_id, prompt)
        
        cli_stdout = result["stdout"].strip()
        cli_stderr = result["stderr"].strip()
        cli_returncode = result["exit_code"]

        duration = round(time.time() - start_time, 2)
        REAL_HEAL_STATE["last_cli_output"] = cli_stdout or cli_stderr or "CLI execution finished."
        REAL_HEAL_STATE["last_cli_returncode"] = cli_returncode
        REAL_HEAL_STATE["last_execution_duration_sec"] = duration

        # Parse JSON output from CLI if available
        parsed_cli_json = {}
        if cli_stdout:
            try:
                # Find start of JSON
                s_idx = cli_stdout.find("{")
                if s_idx != -1:
                    parsed_cli_json = json.loads(cli_stdout[s_idx:])
            except Exception:
                pass

        cli_status = parsed_cli_json.get("status", "unknown")

        # CHECK 1: If the CLI itself failed (non-zero return code or error status in payload)
        if cli_returncode != 0 or cli_status in ["failed", "heal_trigger_failed", "error"]:
            error_detail = cli_stderr or parsed_cli_json.get("message") or cli_stdout or f"CLI returned code {cli_returncode}"
            logger.warning(f"Bright Data CLI heal failed: {error_detail}")

            collector.status = CollectorStatus.FAILED
            healing_ev.status = HealingStatus.FAILED
            healing_ev.fix_details = f"Bright Data CLI heal command returned error (Code {cli_returncode}, Status: {cli_status}): {error_detail}"
            REAL_HEAL_STATE["last_run_status"] = "heal_failed"
            db_session.commit()

            return {
                "collector_id": collector_id,
                "status": "heal_failed",
                "same_collector_id_retained": True,
                "cli_command": cmd_str,
                "cli_returncode": cli_returncode,
                "cli_output": REAL_HEAL_STATE["last_cli_output"],
                "execution_duration_sec": duration,
                "validation_pass_rate": REAL_HEAL_STATE["validation_score"],
                "error": error_detail,
                "message": f"HEAL FAILED: Bright Data CLI returned exit code {cli_returncode} (status: {cli_status}). Subprocess error: {error_detail}"
            }

        # CHECK 2: CLI succeeded -> Run re-extraction on the SAME collector ID
        re_extracted_payload = CollectorRunner.run_collector(collector_id)
        run, count, pass_rate = ResultParser.ingest_collector_payload(
            db_session,
            re_extracted_payload,
            collector_id_override=collector_id,
            is_demo_run=False
        )

        # CHECK 3: Validation pass rate check
        if pass_rate >= 0.8 and count > 0:
            collector.status = CollectorStatus.HEALTHY
            collector.last_healed_at = datetime.utcnow()
            collector.heal_count = (collector.heal_count or 0) + 1

            healing_ev.status = HealingStatus.RESOLVED
            healing_ev.resolved_at = datetime.utcnow()
            healing_ev.fields_recovered = REAL_HEAL_STATE["failed_fields"] or ["monthly_price", "curfew_time", "contact"]
            healing_ev.fix_details = (
                f"CLI: {cmd_str}\n"
                f"Duration: {duration}s\n"
                f"Result: Same Collector ID {collector_id} retained.\n"
                f"Re-extracted {count} records with {pass_rate*100:.1f}% validation pass rate."
            )
            REAL_HEAL_STATE["is_failing"] = False
            REAL_HEAL_STATE["failed_fields"] = []
            REAL_HEAL_STATE["validation_score"] = pass_rate
            REAL_HEAL_STATE["last_run_status"] = "healthy"
            db_session.commit()

            return {
                "collector_id": collector_id,
                "status": "resolved",
                "same_collector_id_retained": True,
                "cli_command": cmd_str,
                "cli_returncode": cli_returncode,
                "cli_output": REAL_HEAL_STATE["last_cli_output"],
                "execution_duration_sec": duration,
                "validation_pass_rate": pass_rate,
                "records_recovered": count,
                "fields_recovered": healing_ev.fields_recovered,
                "resolved_at": healing_ev.resolved_at.isoformat(),
                "message": f"Collector {collector_id} successfully healed via Bright Data Scraper Studio! Re-extraction validated {count} records with {pass_rate*100:.1f}% pass rate. Same Collector ID preserved."
            }
        else:
            collector.status = CollectorStatus.FAILED
            healing_ev.status = HealingStatus.FAILED
            healing_ev.fix_details = f"Re-extraction validation failed ({pass_rate*100:.1f}%). Error: {cli_stderr}"
            REAL_HEAL_STATE["last_run_status"] = "recovery_validation_failed"
            db_session.commit()

            return {
                "collector_id": collector_id,
                "status": "recovery_validation_failed",
                "same_collector_id_retained": True,
                "cli_command": cmd_str,
                "cli_returncode": cli_returncode,
                "cli_output": REAL_HEAL_STATE["last_cli_output"],
                "execution_duration_sec": duration,
                "validation_pass_rate": pass_rate,
                "error": cli_stderr,
                "message": f"RECOVERY FAILED: Re-extraction schema validation failed ({pass_rate*100:.1f}%)."
            }

    @classmethod
    def reset_real_heal_state(cls, db_session, collector_id: str = "c_mt1f0ke713h6n32pi4") -> Dict[str, Any]:
        """Resets collector to nominal healthy state."""
        collector = db_session.query(Collector).filter(Collector.collector_id == collector_id).first()
        if collector:
            collector.status = CollectorStatus.HEALTHY
            db_session.commit()

        REAL_HEAL_STATE["is_failing"] = False
        REAL_HEAL_STATE["failed_fields"] = []
        REAL_HEAL_STATE["validation_score"] = 1.0
        REAL_HEAL_STATE["last_run_status"] = "healthy"
        REAL_HEAL_STATE["last_cli_output"] = None
        REAL_HEAL_STATE["last_cli_command"] = None
        REAL_HEAL_STATE["last_cli_returncode"] = 0

        return {"status": "healthy", "collector_id": collector_id, "message": "Collector reset to healthy state."}
