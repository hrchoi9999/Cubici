"""Redemption and repayment read-only API skeleton."""

from datetime import date

from fastapi import APIRouter, HTTPException, Query

from cubici_service.redemptions.repository import (
    RedemptionListItem,
    RedemptionListResponse,
    RedemptionContractStage,
    RedemptionOrderBy,
    RedemptionOperationCancelRequest,
    RedemptionOperationHistoryResponse,
    RedemptionOperationResponse,
    RedemptionProvisionCreateRequest,
    RedemptionRepaymentCreateRequest,
    cancel_redemption_operation,
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
    user_no: int | None = Query(default=None, ge=1),
    mbid: str | None = Query(default=None),
    user_name: str | None = Query(default=None),
    firm_name: str | None = Query(default=None),
    product_code: str | None = Query(default=None),
    contract_stage: RedemptionContractStage | None = Query(default=None),
    outstanding_only: bool = Query(default=False),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    order_by: RedemptionOrderBy = Query(default="date_desc"),
) -> RedemptionListResponse:
    return list_redemptions(
        limit=limit,
        offset=offset,
        user_no=user_no,
        mbid=mbid,
        user_name=user_name,
        firm_name=firm_name,
        product_code=product_code,
        contract_stage=contract_stage,
        outstanding_only=outstanding_only,
        from_date=from_date,
        to_date=to_date,
        order_by=order_by,
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


@router.post("/{mbid}/operations/{operation_history_id}/cancel", response_model=RedemptionOperationResponse)
def redemption_operation_cancel(
    mbid: str,
    operation_history_id: int,
    payload: RedemptionOperationCancelRequest,
) -> RedemptionOperationResponse:
    return cancel_redemption_operation(
        mbid=mbid,
        operation_history_id=operation_history_id,
        payload=payload,
    )


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
