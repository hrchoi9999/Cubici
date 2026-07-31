"""FastAPI application factory."""

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from cubici_service.api.router import router as api_router
from cubici_service.api.v1.endpoints.health import (
    HealthResponse,
    database_health_check,
    health_check,
)
from cubici_service.core.access_control import enforce_user_ownership_for_common_api
from cubici_service.core.admin_auth import enforce_master_admin_for_protected_api
from cubici_service.core.config import Settings, get_settings
from cubici_service.db.connection import DatabaseCheck


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

    @app.middleware("http")
    async def master_admin_api_auth(request, call_next):
        auth_response = await enforce_master_admin_for_protected_api(request, resolved_settings)
        if auth_response is not None:
            return auth_response
        ownership_response = await enforce_user_ownership_for_common_api(request, resolved_settings)
        if ownership_response is not None:
            return ownership_response
        return await call_next(request)

    @app.get("/health", response_model=HealthResponse, include_in_schema=False)
    def root_health_check() -> HealthResponse:
        return health_check()

    @app.get("/health/db", response_model=DatabaseCheck, include_in_schema=False)
    def root_database_health_check() -> DatabaseCheck:
        return database_health_check()

    @app.get("/v1/health", response_model=HealthResponse, include_in_schema=False)
    def v1_health_check() -> HealthResponse:
        return health_check()

    @app.get("/v1/health/db", response_model=DatabaseCheck, include_in_schema=False)
    def v1_database_health_check() -> DatabaseCheck:
        return database_health_check()

    app.include_router(api_router)
    return app


app = create_app()
