from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Pune Waterlogging Risk Intelligence Prototype"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Base paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    ROOT_DIR: Path = BASE_DIR.parent
    DATA_DIR: Path = ROOT_DIR / "data"
    MODELS_DIR: Path = ROOT_DIR / "models"
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/pune_waterlogging.db"
    
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Demonstration flags
    IS_DEMO_DATA: bool = True
    RANDOM_SEED: int = 42

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
