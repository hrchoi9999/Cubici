"""Application settings."""

from functools import lru_cache
from os import environ, getenv
from pathlib import Path

from pydantic import BaseModel, Field, SecretStr


SERVICE_API_ROOT = Path(__file__).resolve().parents[3]
LOCAL_ENV_FILE = SERVICE_API_ROOT / ".env"


class Settings(BaseModel):
    service_name: str = Field(default="cubici-service-api")
    service_title: str = Field(default="Cubici Service API")
    environment: str = Field(default_factory=lambda: getenv("CUBICI_ENV", "local"))
    api_version: str = Field(default="0.1.0")
    db_host: str = Field(default_factory=lambda: getenv("CUBICI_DB_HOST", "127.0.0.1"))
    db_port: int = Field(default_factory=lambda: int(getenv("CUBICI_DB_PORT", "55432")))
    db_name: str = Field(default_factory=lambda: getenv("CUBICI_DB_NAME", "cubici_local"))
    db_user: str = Field(default_factory=lambda: getenv("CUBICI_DB_USER", "cubici_app"))
    db_password: SecretStr = Field(
        default_factory=lambda: SecretStr(getenv("CUBICI_DB_PASSWORD", ""))
    )
    db_schema: str = Field(default_factory=lambda: getenv("CUBICI_DB_SCHEMA", "public"))
    auth_secret: SecretStr = Field(
        default_factory=lambda: SecretStr(getenv("CUBICI_AUTH_SECRET", "local-dev-only-change-me"))
    )
    document_storage_dir: str = Field(
        default_factory=lambda: getenv(
            "CUBICI_DOCUMENT_STORAGE_DIR",
            str(SERVICE_API_ROOT.parent / "data_local" / "documents"),
        )
    )
    cors_allow_origins: tuple[str, ...] = Field(
        default_factory=lambda: tuple(
            origin.strip()
            for origin in getenv(
                "CUBICI_CORS_ALLOW_ORIGINS",
                "http://127.0.0.1:5174,http://127.0.0.1:5175,http://127.0.0.1:4175,http://127.0.0.1:4173",
            ).split(",")
            if origin.strip()
        )
    )
    cors_allow_origin_regex: str | None = Field(
        default_factory=lambda: getenv(
            "CUBICI_CORS_ALLOW_ORIGIN_REGEX",
            r"https?://(127\.0\.0\.1|localhost):\d+",
        )
    )

    @property
    def db_conninfo(self) -> str:
        password = self.db_password.get_secret_value()
        return (
            f"host={self.db_host} "
            f"port={self.db_port} "
            f"dbname={self.db_name} "
            f"user={self.db_user} "
            f"password={password}"
        )


@lru_cache
def get_settings() -> Settings:
    load_local_env()
    return Settings()


def load_local_env(env_file: Path = LOCAL_ENV_FILE) -> None:
    if not env_file.exists():
        return

    for raw_line in env_file.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        environ.setdefault(key.strip(), value.strip())
