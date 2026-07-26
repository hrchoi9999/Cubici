"""FastAPI application factory."""

from fastapi import FastAPI

from cubici_service.api.router import router as api_router
from cubici_service.core.config import Settings, get_settings


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved_settings = settings or get_settings()
    app = FastAPI(
        title=resolved_settings.service_title,
        version=resolved_settings.api_version,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )
    app.include_router(api_router)
    return app


app = create_app()
