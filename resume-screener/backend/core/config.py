from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    openai_api_key: str
    database_url: str = "sqlite:///./resume_screener.db"
    upload_dir: str = "./uploads"
    max_file_size_mb: int = 10

    class Config:
        env_file = ".env"

settings = Settings()

# Ensure upload dirs exist
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
Path(f"{settings.upload_dir}/resumes").mkdir(parents=True, exist_ok=True)
Path(f"{settings.upload_dir}/jd").mkdir(parents=True, exist_ok=True)