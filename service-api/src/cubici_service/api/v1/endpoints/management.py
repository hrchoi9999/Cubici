"""Moneybank management overview API."""

from datetime import date

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from cubici_service.management.repository import (
    CubiciIntegratedResponse,
    ManagementOverviewResponse,
    MemberChargeChangeDivision,
    MemberChargeChangeListResponse,
    MemberChargeChangeOrderBy,
    MemberChargeChangeRefundDetail,
    MemberChargeChangeRefundFinishResponse,
    MemberInfoListResponse,
    MemberInfoOrderBy,
    MemberPaymentListResponse,
    MemberPaymentOrderBy,
    MemberPaymentUserType,
    MemberStatusDetailResponse,
    MemberUseService,
    MemberSummaryResponse,
    MemberSummaryOptionsResponse,
    MemberWithdrawalListResponse,
    MemberWithdrawalOrderBy,
    MemberWithdrawalStatus,
    ManagementUsageDetailResponse,
    ManagementUsageListResponse,
    OverviewUnit,
    get_management_overview,
    get_cubici_integrated_info,
    get_member_summary,
    get_member_summary_options,
    get_management_usage_detail,
    get_member_status_detail,
    get_member_charge_change_refund_detail,
    finish_member_charge_change_refund,
    list_member_info,
    list_member_charge_changes,
    list_member_payments,
    list_member_withdrawals,
    list_management_usage,
)

router = APIRouter(prefix="/management", tags=["management"])


class MemberChargeChangeRefundFinishRequest(BaseModel):
    seq: int


@router.get("/overview", response_model=ManagementOverviewResponse)
def management_overview(
    unit: OverviewUnit = Query(default="day"),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
) -> ManagementOverviewResponse:
    return get_management_overview(unit=unit, from_date=from_date, to_date=to_date)


@router.get("/member-summary", response_model=MemberSummaryResponse)
def member_summary(
    unit: OverviewUnit = Query(default="day"),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    partner_code: str | None = Query(default=None, max_length=30),
    product_code: str | None = Query(default=None, max_length=30),
) -> MemberSummaryResponse:
    return get_member_summary(
        unit=unit,
        from_date=from_date,
        to_date=to_date,
        partner_code=partner_code,
        product_code=product_code,
    )


@router.get("/cubici-integrated", response_model=CubiciIntegratedResponse)
def cubici_integrated_info(
    unit: OverviewUnit = Query(default="day"),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    partner_code: str | None = Query(default=None, max_length=30),
    product_code: str | None = Query(default=None, max_length=30),
) -> CubiciIntegratedResponse:
    return get_cubici_integrated_info(
        unit=unit,
        from_date=from_date,
        to_date=to_date,
        partner_code=partner_code,
        product_code=product_code,
    )


@router.get("/member-summary/options", response_model=MemberSummaryOptionsResponse)
def member_summary_options() -> MemberSummaryOptionsResponse:
    return get_member_summary_options()


@router.get("/member-info", response_model=MemberInfoListResponse)
def member_info_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user_name: str | None = Query(default=None, max_length=50),
    firm_name: str | None = Query(default=None, max_length=100),
    user_id: str | None = Query(default=None, max_length=100),
    use_service: MemberUseService = Query(default="all", pattern="^(all|cubici|moneybank)$"),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    order_by: MemberInfoOrderBy = Query(
        default="reg_date_desc",
        pattern="^(reg_date_(asc|desc)|name_asc|firm_name_asc|shop_count_desc)$",
    ),
) -> MemberInfoListResponse:
    return list_member_info(
        limit=limit,
        offset=offset,
        user_name=user_name,
        firm_name=firm_name,
        user_id=user_id,
        use_service=use_service,
        from_date=from_date,
        to_date=to_date,
        order_by=order_by,
    )


@router.get("/member-payments", response_model=MemberPaymentListResponse)
def member_payment_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user_name: str | None = Query(default=None, max_length=50),
    firm_name: str | None = Query(default=None, max_length=100),
    user_id: str | None = Query(default=None, max_length=100),
    user_type: MemberPaymentUserType = Query(default="all", pattern="^(all|USER|ADMIN)$"),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    order_by: MemberPaymentOrderBy = Query(
        default="payment_date_desc",
        pattern="^(payment_date_(asc|desc)|amount_(asc|desc)|name_asc|firm_name_asc)$",
    ),
) -> MemberPaymentListResponse:
    return list_member_payments(
        limit=limit,
        offset=offset,
        user_name=user_name,
        firm_name=firm_name,
        user_id=user_id,
        user_type=user_type,
        from_date=from_date,
        to_date=to_date,
        order_by=order_by,
    )


@router.get("/member-charge-changes", response_model=MemberChargeChangeListResponse)
def member_charge_change_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    division: MemberChargeChangeDivision = Query(default="all", pattern="^(all|C|R)$"),
    charge_code: str | None = Query(default=None, max_length=20),
    user_name: str | None = Query(default=None, max_length=50),
    firm_name: str | None = Query(default=None, max_length=100),
    user_id: str | None = Query(default=None, max_length=100),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    order_by: MemberChargeChangeOrderBy = Query(
        default="payment_date_desc",
        pattern="^(payment_date_desc|change_date_(asc|desc)|amount_desc|name_asc|firm_name_asc)$",
    ),
) -> MemberChargeChangeListResponse:
    return list_member_charge_changes(
        limit=limit,
        offset=offset,
        division=division,
        charge_code=charge_code,
        user_name=user_name,
        firm_name=firm_name,
        user_id=user_id,
        from_date=from_date,
        to_date=to_date,
        order_by=order_by,
    )


@router.get("/member-charge-changes/{new_seq}/refund", response_model=MemberChargeChangeRefundDetail)
def member_charge_change_refund_detail(new_seq: int) -> MemberChargeChangeRefundDetail:
    detail = get_member_charge_change_refund_detail(new_seq)
    if detail is None:
        raise HTTPException(status_code=404, detail="refund detail not found")
    return detail


@router.post("/member-charge-changes/{new_seq}/refund-finish", response_model=MemberChargeChangeRefundFinishResponse)
def member_charge_change_refund_finish(
    new_seq: int,
    request: MemberChargeChangeRefundFinishRequest,
) -> MemberChargeChangeRefundFinishResponse:
    result = finish_member_charge_change_refund(seq=request.seq, new_seq=new_seq)
    if result is None:
        raise HTTPException(status_code=404, detail="refund target not found")
    return result


@router.get("/member-withdrawals", response_model=MemberWithdrawalListResponse)
def member_withdrawal_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user_name: str | None = Query(default=None, max_length=50),
    firm_name: str | None = Query(default=None, max_length=100),
    user_id: str | None = Query(default=None, max_length=100),
    status: MemberWithdrawalStatus = Query(default="all", pattern="^(all|terminated|requested|dormant)$"),
    partner_code: str | None = Query(default=None, max_length=30),
    product_code: str | None = Query(default=None, max_length=30),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    order_by: MemberWithdrawalOrderBy = Query(
        default="event_date_desc",
        pattern="^(event_date_(asc|desc)|name_asc|firm_name_asc|shop_count_desc)$",
    ),
) -> MemberWithdrawalListResponse:
    return list_member_withdrawals(
        limit=limit,
        offset=offset,
        user_name=user_name,
        firm_name=firm_name,
        user_id=user_id,
        status=status,
        partner_code=partner_code,
        product_code=product_code,
        from_date=from_date,
        to_date=to_date,
        order_by=order_by,
    )


@router.get("/member-status/{user_no}", response_model=MemberStatusDetailResponse)
def member_status_detail(user_no: int) -> MemberStatusDetailResponse:
    detail = get_member_status_detail(user_no)
    if detail is None:
        raise HTTPException(status_code=404, detail="member not found")
    return detail


@router.get("/usage", response_model=ManagementUsageListResponse)
def management_usage_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user_name: str | None = Query(default=None, max_length=50),
    firm_name: str | None = Query(default=None, max_length=50),
    user_email: str | None = Query(default=None, max_length=50),
    product_code: str | None = Query(default=None, max_length=20),
    status: str | None = Query(default=None, max_length=20),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    order_by: str = Query(default="request_date_desc", pattern="^request_date_(asc|desc)$"),
) -> ManagementUsageListResponse:
    return list_management_usage(
        limit=limit,
        offset=offset,
        user_name=user_name,
        firm_name=firm_name,
        user_email=user_email,
        product_code=product_code,
        status=status,
        from_date=from_date,
        to_date=to_date,
        order_by=order_by,
    )


@router.get("/usage/{mbid}", response_model=ManagementUsageDetailResponse)
def management_usage_detail(mbid: str) -> ManagementUsageDetailResponse:
    detail = get_management_usage_detail(mbid)
    if detail is None:
        raise HTTPException(status_code=404, detail="management usage not found")
    return detail
