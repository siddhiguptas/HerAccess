import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "HerAccess"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "sqlite:///./heraccess.db"
    
    # LLM Settings (Optional placeholder for future intent parsing/verification; NOT used in current MVP)
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    # Bright Data Integration
    # When False, executes real Scraper Studio CLI commands. When True, falls back to deterministic local fixtures.
    BRIGHT_DATA_USE_FIXTURES: bool = False
    BRIGHT_DATA_API_KEY: str = ""
    BRIGHT_DATA_ZONE: str = ""
    BRIGHT_DATA_FIXTURES_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "fixtures"))
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173"
    
    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = ConfigDict(env_file=".env", extra="ignore")

settings = Settings()

