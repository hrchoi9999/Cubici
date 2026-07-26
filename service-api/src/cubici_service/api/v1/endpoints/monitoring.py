"""Monitoring API."""

from datetime import date

from fastapi import APIRouter, Query

from cubici_service.monitoring.repository import (
    ErrorLogListResponse,
    ErrorLogStatus,
    ServerStatusResponse,
    get_server_status,
    list_error_logs,
)

router = APIRouter(prefix="/monitoring", tags=["monitoring"])


@router.get("/error-logs", response_model=ErrorLogListResponse)
def error_log_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    shop: str | None = Query(default=None, max_length=100),
    status: ErrorLogStatus = Query(default="ALL", pattern="^(ALL|SUCCESS|FAIL)$"),
    scenario: str | None = Query(default=None, max_length=100),
) -> ErrorLogListResponse:
    return list_error_logs(
        limit=limit,
        offset=offset,
        from_date=from_date,
        to_date=to_date,
        shop=shop,
        status=status,
        scenario=scenario,
    )


@router.get("/server-status", response_model=ServerStatusResponse)
def server_status(hours: int = Query(default=24, ge=1, le=168)) -> ServerStatusResponse:
    return get_server_status(hours=hours)
