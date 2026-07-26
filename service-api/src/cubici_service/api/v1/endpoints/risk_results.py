"""Risk result integration read-only API."""

from datetime import date

from fastapi import APIRouter, Query

from cubici_service.risk_results.repository import (
    RiskResultListResponse,
    list_risk_results,
)

router = APIRouter(prefix="/risk-results", tags=["risk-results"])


@router.get("", response_model=RiskResultListResponse)
def risk_result_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    mbid: str | None = Query(default=None, max_length=50),
    user_no: int | None = Query(default=None, ge=1),
    prizm_grade: str | None = Query(default=None, max_length=20),
    pms_grade: str | None = Query(default=None, max_length=20),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
) -> RiskResultListResponse:
    return list_risk_results(
        limit=limit,
        offset=offset,
        mbid=mbid,
        user_no=user_no,
        prizm_grade=prizm_grade,
        pms_grade=pms_grade,
        from_date=from_date,
        to_date=to_date,
    )
