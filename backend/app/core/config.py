from pydantic_settings import BaseSettings
from typing import Optional
import json
import os


class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://admin:password@localhost:27017/?authSource=admin"
    MONGODB_USE_TLS: bool = False
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    PROJECT_NAME: str = "Habitify Clone API"
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        cors_env = os.getenv("CORS_ORIGINS")
        if cors_env:
            try:
                self.CORS_ORIGINS = json.loads(cors_env)
            except json.JSONDecodeError:
                self.CORS_ORIGINS = [cors_env] if cors_env else self.CORS_ORIGINS


settings = Settings()
