"""Advance payment contract read-only API skeleton."""

from datetime import date

from fastapi import APIRouter, HTTPException, Query

from cubici_service.contracts.repository import (
    ContractFeeAdjustmentRequest,
    ContractFeeAdjustmentResponse,
    ContractElectronicSignatureRequest,
    ContractElectronicSignatureResponse,
    ContractDetailResponse,
    ContractListResponse,
    ContractOrderBy,
    ContractApprovalStage,
    ContractManagementStage,
    ContractRequestStage,
    ContractRequestCreateRequest,
    ContractRequestCreateResponse,
    ContractStatusUpdateRequest,
    ContractStatusUpdateResponse,
    adjust_contract_fee,
    create_contract_request,
    get_contract_detail,
    list_contracts,
    sign_contract_electronically,
    update_contract_status,
)

router = APIRouter(prefix="/contracts", tags=["contracts"])


@router.get("", response_model=ContractListResponse)
def contract_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user_no: int | None = Query(default=None, ge=1),
    user_id: str | None = Query(default=None),
    user_name: str | None = Query(default=None),
    firm_name: str | None = Query(default=None),
    status: str | None = Query(default=None),
    product_code: str | None = Query(default=None),
    min_sales_amount: int | None = Query(default=None, ge=0),
    max_sales_amount: int | None = Query(default=None, ge=0),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    order_by: ContractOrderBy = Query(default="request_date_desc"),
    request_scope: bool = Query(default=False),
    request_stage: ContractRequestStage | None = Query(default=None),
    approval_scope: bool = Query(default=False),
    approval_stage: ContractApprovalStage | None = Query(default=None),
    contract_scope: bool = Query(default=False),
    contract_stage: ContractManagementStage | None = Query(default=None),
) -> ContractListResponse:
    return list_contracts(
        limit=limit,
        offset=offset,
        user_no=user_no,
        user_id=user_id,
        user_name=user_name,
        firm_name=firm_name,
        status=status,
        product_code=product_code,
        min_sales_amount=min_sales_amount,
        max_sales_amount=max_sales_amount,
        from_date=from_date,
        to_date=to_date,
        order_by=order_by,
        request_scope=request_scope,
        request_stage=request_stage,
        approval_scope=approval_scope,
        approval_stage=approval_stage,
        contract_scope=contract_scope,
        contract_stage=contract_stage,
    )


@router.post("/requests", response_model=ContractRequestCreateResponse)
def contract_request_create(
    payload: ContractRequestCreateRequest,
) -> ContractRequestCreateResponse:
    return create_contract_request(payload)


@router.get("/{mbid}", response_model=ContractDetailResponse)
def contract_detail(
    mbid: str,
    user_no: int | None = Query(default=None, ge=1),
) -> ContractDetailResponse:
    detail = get_contract_detail(mbid, user_no=user_no)
    if detail is None:
        raise HTTPException(status_code=404, detail="contract not found")
    return detail


@router.put("/{mbid}/status", response_model=ContractStatusUpdateResponse)
def contract_status_update(
    mbid: str,
    payload: ContractStatusUpdateRequest,
) -> ContractStatusUpdateResponse:
    return update_contract_status(mbid=mbid, payload=payload)


@router.put("/{mbid}/electronic-signature", response_model=ContractElectronicSignatureResponse)
def contract_electronic_signature(
    mbid: str,
    payload: ContractElectronicSignatureRequest,
) -> ContractElectronicSignatureResponse:
    return sign_contract_electronically(mbid=mbid, payload=payload)


@router.put("/{mbid}/fees/adjust", response_model=ContractFeeAdjustmentResponse)
def contract_fee_adjust(
    mbid: str,
    payload: ContractFeeAdjustmentRequest,
) -> ContractFeeAdjustmentResponse:
    return adjust_contract_fee(mbid=mbid, payload=payload)
