"""FastAPI application factory."""

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

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
    if resolved_settings.cors_allow_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=list(resolved_settings.cors_allow_origins),
            allow_origin_regex=resolved_settings.cors_allow_origin_regex,
            allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allow_headers=["*"],
        )
    app.include_router(api_router)
    return app


app = create_app()
