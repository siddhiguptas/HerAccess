import json
import logging
import subprocess
from typing import Dict, Any, Optional

logger = logging.getLogger("heraccess.bright_data_client")

class BrightDataClient:
    @staticmethod
    def run_scraper(collector_id: str, is_demo_run: bool = False, max_items: int = 10) -> Optional[Any]:
        """Runs a Bright Data scraper via CLI and returns the JSON output."""
        try:
            cmd = ["npx", "@brightdata/cli", "scraper", "run", collector_id, "--format", "json"]
            if is_demo_run:
                cmd.extend(["--limit", "2"])
            elif max_items:
                cmd.extend(["--limit", str(max_items)])

            logger.info(f"Executing Bright Data Scraper: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # The CLI output contains logs. Find the JSON array.
            output_lines = result.stdout.strip().split('\n')
            json_str = None
            for i, line in enumerate(reversed(output_lines)):
                if line.strip().endswith(']') or line.strip().endswith('}'):
                    json_str = line
                    break

            if json_str:
                return json.loads(json_str)
            return None
        except subprocess.CalledProcessError as e:
            logger.error(f"Bright Data CLI Scraper Run failed: {e.stderr}")
            raise Exception(f"CLI Run failed: {e.stderr}")
        except json.JSONDecodeError as e:
            logger.error(f"Bright Data CLI Output Parsing failed: {e}")
            raise Exception("Failed to parse Bright Data CLI output")

    @staticmethod
    def heal_scraper(collector_id: str, prompt: str) -> Optional[Dict[str, Any]]:
        """Heals a Bright Data scraper via CLI using AI healing."""
        try:
            cmd = ["npx", "@brightdata/cli", "scraper", "heal", collector_id, "--prompt", prompt]
            logger.info(f"Triggering Real Bright Data Heal: {' '.join(cmd)}")
            
            # Execute with a timeout
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            
            return {
                "exit_code": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "success": result.returncode == 0
            }
        except subprocess.TimeoutExpired:
            logger.error("Heal command timed out after 120 seconds")
            return {
                "exit_code": -1,
                "stdout": "",
                "stderr": "Timeout expired",
                "success": False
            }
        except Exception as e:
            logger.error(f"Heal command failed: {e}")
            return {
                "exit_code": -1,
                "stdout": "",
                "stderr": str(e),
                "success": False
            }
