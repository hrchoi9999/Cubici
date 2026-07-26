"""Risk result integration read-only API skeleton."""

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
) -> RiskResultListResponse:
    return list_risk_results(limit=limit, offset=offset)
