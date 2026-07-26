"""Health endpoints."""

from fastapi import APIRouter
from pydantic import BaseModel

from cubici_service.core.config import Settings, get_settings
from cubici_service.db.connection import DatabaseCheck, check_database_connection

router = APIRouter(prefix="/health", tags=["health"])


class HealthResponse(BaseModel):
    status: str
    service: str
    environment: str
    api_version: str


@router.get("", response_model=HealthResponse)
def health_check() -> HealthResponse:
    settings: Settings = get_settings()
    return HealthResponse(
        status="ok",
        service=settings.service_name,
        environment=settings.environment,
        api_version=settings.api_version,
    )


@router.get("/db", response_model=DatabaseCheck)
def database_health_check() -> DatabaseCheck:
    return check_database_connection()
