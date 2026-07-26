"""Redemption and repayment read-only API skeleton."""

from datetime import date

from fastapi import APIRouter, HTTPException, Query

from cubici_service.redemptions.repository import (
    RedemptionListItem,
    RedemptionListResponse,
    RedemptionOperationHistoryResponse,
    RedemptionOperationResponse,
    RedemptionProvisionCreateRequest,
    RedemptionRepaymentCreateRequest,
    create_redemption_provision,
    create_redemption_repayment,
    get_redemption_detail,
    list_redemption_operation_history,
    list_redemptions,
)

router = APIRouter(prefix="/redemptions", tags=["redemptions"])


@router.get("", response_model=RedemptionListResponse)
def redemption_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    mbid: str | None = Query(default=None),
    outstanding_only: bool = Query(default=False),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
) -> RedemptionListResponse:
    return list_redemptions(
        limit=limit,
        offset=offset,
        mbid=mbid,
        outstanding_only=outstanding_only,
        from_date=from_date,
        to_date=to_date,
    )


@router.get("/{mbid}", response_model=RedemptionListItem)
def redemption_detail(mbid: str) -> RedemptionListItem:
    detail = get_redemption_detail(mbid)
    if detail is None:
        raise HTTPException(status_code=404, detail="redemption not found")
    return detail


@router.get("/{mbid}/operation-history", response_model=RedemptionOperationHistoryResponse)
def redemption_operation_history(
    mbid: str,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> RedemptionOperationHistoryResponse:
    return list_redemption_operation_history(mbid=mbid, limit=limit, offset=offset)


@router.post("/{mbid}/provisions", response_model=RedemptionOperationResponse)
def redemption_provision_create(
    mbid: str,
    payload: RedemptionProvisionCreateRequest,
) -> RedemptionOperationResponse:
    return create_redemption_provision(mbid=mbid, payload=payload)


@router.post("/{mbid}/repayments", response_model=RedemptionOperationResponse)
def redemption_repayment_create(
    mbid: str,
    payload: RedemptionRepaymentCreateRequest,
) -> RedemptionOperationResponse:
    return create_redemption_repayment(mbid=mbid, payload=payload)
