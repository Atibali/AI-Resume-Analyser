from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # App
    app_name: str = "AI Resume Analyzer"
    debug: bool = True

    # Database
    database_url: str = "sqlite:///./test.db"

    # Groq API (Primary - free tier)
    groq_api_key: str = ""

    # Google Generative AI (Gemini) - Fallback
    google_api_key: str = ""

    # File storage
    upload_dir: str = "uploads"

    # CORS
    allowed_origins: list = ["*"]

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
