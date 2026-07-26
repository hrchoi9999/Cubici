"""Admin preference queries."""

from __future__ import annotations

import hashlib
from datetime import date, datetime
from typing import Any, Literal

from psycopg.rows import dict_row
from psycopg import sql
from psycopg.types.json import Jsonb
from pydantic import BaseModel, Field, SecretStr

from cubici_service.db.connection import get_connection


ChargeStatus = Literal["all", "operating", "ended"]
ChargeOrderBy = Literal["reg_date_desc", "reg_date_asc", "amount_desc", "charge_name_asc", "charge_code_asc"]
AdminAccountStatus = Literal["all", "pending", "approved"]
AdminAccountOrderBy = Literal["reg_date_desc", "approval_date_desc", "name_asc", "admin_id_asc"]
PromotionStatus = Literal["all", "Y", "N"]
PromotionOrderBy = Literal["start_date_desc", "start_date_asc", "promo_code_asc", "promo_name_asc"]
PartnerStatus = Literal["all", "00", "01"]
PartnerOrderBy = Literal["reg_date_desc", "partner_name_asc", "partner_code_asc", "rep_name_asc"]
MoneybankProductStatus = Literal["all", "00", "01", "02"]
MoneybankProductOrderBy = Literal["reg_date_desc", "reg_date_asc", "firm_name_asc", "product_name_asc"]
PrizmConfigDivision = Literal["all", "1", "2"]

ADMIN_PASSWORD_SALT = "{AZON}"


class ChargeListItem(BaseModel):
    row_no: int
    charge_code: str
    charge_name: str
    charge_type: str
    status: str
    start_date: date | None
    expire_date: date | None
    sub_id: int | None
    sales_count: str | None
    product_count: str | None
    amount: int | None
    period: int | None
    period_unit: str | None
    charge_detail: str | None
    reg_date: datetime | None
    update_date: datetime | None


class ChargeCounts(BaseModel):
    total_count: int
    operating_count: int
    ended_count: int


class ChargeListResponse(BaseModel):
    limit: int
    offset: int
    counts: ChargeCounts
    items: list[ChargeListItem]


class ChargeWriteRequest(BaseModel):
    charge_code: str = Field(min_length=1, max_length=5)
    charge_name: str = Field(min_length=1, max_length=20)
    charge_type: str = Field(min_length=1, max_length=1)
    start_date: date | None = None
    expire_date: date | None = None
    sub_id: int | None = None
    sales_count: str | None = Field(default=None, max_length=3)
    product_count: str | None = Field(default=None, max_length=3)
    amount: int | None = None
    period: int | None = None
    period_unit: str | None = Field(default=None, max_length=1)
    charge_detail: str | None = Field(default=None, max_length=100)


class ChargeWriteResponse(BaseModel):
    action: str
    charge_code: str
    charge: ChargeListItem | None


class AdminAccountListItem(BaseModel):
    row_no: int
    admin_id: str
    admin_type: str
    admin_type_label: str
    admin_name: str
    admin_phone: str | None
    admin_email: str | None
    admin_department: str | None
    admin_grade: str
    admin_grade_label: str
    permission_scope_label: str = "미정"
    approval_status: str
    audit_status_label: str = "미검증"
    admin_reg_date: datetime | None
    admin_approval_date: datetime | None
    modified_date: datetime | None


class AdminAccountCounts(BaseModel):
    total_count: int
    pending_count: int
    approved_count: int


class AdminAccountListResponse(BaseModel):
    limit: int
    offset: int
    counts: AdminAccountCounts
    items: list[AdminAccountListItem]


class AdminAccountRequest(BaseModel):
    admin_type: str = Field(min_length=2, max_length=2)
    admin_name: str = Field(min_length=1, max_length=100)
    admin_phone: str | None = Field(default=None, max_length=30)
    admin_email: str | None = Field(default=None, max_length=150)
    admin_department: str | None = Field(default=None, max_length=100)


class AdminAccountApproveRequest(BaseModel):
    new_admin_id: str = Field(min_length=1, max_length=100)
    password: SecretStr = Field(min_length=1)
    admin_grade: str = Field(min_length=2, max_length=2)


class AdminAccountUpdateRequest(BaseModel):
    admin_type: str = Field(min_length=2, max_length=2)
    admin_name: str = Field(min_length=1, max_length=100)
    admin_phone: str | None = Field(default=None, max_length=30)
    admin_email: str | None = Field(default=None, max_length=150)
    admin_department: str | None = Field(default=None, max_length=100)
    admin_grade: str = Field(min_length=2, max_length=2)
    password: SecretStr | None = None


class AdminAccountWriteResponse(BaseModel):
    action: str
    admin_id: str
    account: AdminAccountListItem | None


class AdminAccountIdCheckResponse(BaseModel):
    admin_id: str
    exists: bool


class PromotionListItem(BaseModel):
    row_no: int
    promo_code: str
    promo_name: str | None
    promo_target: str | None
    promo_target_label: str
    partner_code: str | None
    partner_name: str
    status: str
    status_label: str
    start_date: date | None
    expire_date: date | None
    charge_codes: list[str]
    charge_names: list[str]
    discount_rate: int | None
    discount_amount: int | None
    period: int | None
    period_unit: str | None
    period_unit_label: str
    sub_id: int | None
    sub_id_label: str
    promo_detail: str | None
    reg_date: datetime | None
    update_date: datetime | None


class PromotionCounts(BaseModel):
    total_count: int
    operating_count: int
    ended_count: int


class PromotionListResponse(BaseModel):
    limit: int
    offset: int
    counts: PromotionCounts
    items: list[PromotionListItem]


class PromotionWriteRequest(BaseModel):
    promo_code: str = Field(min_length=1, max_length=255)
    promo_name: str = Field(min_length=1, max_length=255)
    promo_target: str = Field(min_length=1, max_length=10)
    partner_code: str | None = Field(default="CBCI", max_length=255)
    charge_codes: list[str] = Field(default_factory=list)
    start_date: date
    expire_date: date
    sub_id: int | None = None
    discount_rate: int | None = None
    discount_amount: int | None = None
    period: int | None = None
    period_unit: str | None = Field(default=None, max_length=10)
    promo_detail: str | None = Field(default=None, max_length=255)


class PromotionWriteResponse(BaseModel):
    action: str
    promo_code: str
    promotion: PromotionListItem | None


class PromotionOption(BaseModel):
    value: str
    label: str


class PromotionOptionsResponse(BaseModel):
    targets: list[PromotionOption]
    partner_divisions: list[PromotionOption]
    partners: list[PromotionOption]
    charges: list[PromotionOption]


class PartnerManagerPayload(BaseModel):
    manager_type: str = Field(min_length=2, max_length=2)
    manager_name: str | None = Field(default=None, max_length=255)
    manager_rank: str | None = Field(default=None, max_length=255)
    manager_email: str | None = Field(default=None, max_length=255)
    manager_phone: str | None = Field(default=None, max_length=255)


class PartnerListItem(BaseModel):
    row_no: int
    partner_id: str
    partner_code: str
    partner_name: str
    rep_name: str
    partner_zip: str
    partner_address: str
    partner_status: str | None
    partner_status_label: str
    partner_type: str | None
    partner_type_label: str
    memo: str | None
    manager_name: str | None
    manager_phone: str | None
    manager_status_label: str = "담당자 미지정"
    reg_date: datetime | None
    update_date: datetime | None


class PartnerDetailResponse(BaseModel):
    partner: PartnerListItem
    managers: list[PartnerManagerPayload]


class PartnerCounts(BaseModel):
    total_count: int
    operating_count: int
    ended_count: int
    type_ba_count: int
    type_bb_count: int
    type_co_count: int
    type_fi_count: int
    type_mn_count: int
    type_th_count: int
    missing_manager_count: int = 0


class PartnerListResponse(BaseModel):
    limit: int
    offset: int
    counts: PartnerCounts
    items: list[PartnerListItem]


class PartnerWriteRequest(BaseModel):
    partner_id: str = Field(min_length=1, max_length=10)
    partner_code: str = Field(min_length=1, max_length=5)
    partner_name: str = Field(min_length=1, max_length=50)
    rep_name: str = Field(min_length=1, max_length=50)
    partner_zip: str = Field(min_length=1, max_length=5)
    partner_address: str = Field(min_length=1, max_length=300)
    partner_status: str = Field(min_length=2, max_length=2)
    partner_type: str = Field(min_length=2, max_length=2)
    memo: str | None = Field(default=None, max_length=1000)
    managers: list[PartnerManagerPayload] = Field(default_factory=list)


class PartnerWriteResponse(BaseModel):
    action: str
    partner_id: str
    partner: PartnerDetailResponse | None


class PartnerCheckResponse(BaseModel):
    value: str
    exists: bool


class MoneybankProductListItem(BaseModel):
    row_no: int
    firm_no: int
    firm_id: str
    firm_name: str
    rep_name: str
    firm_zip: str | None
    firm_address: str
    manager_name: str | None
    manager_rank: str | None
    manager_phone: str | None
    developer_name: str | None
    developer_rank: str | None
    developer_phone: str | None
    cs_name: str | None
    cs_rank: str | None
    cs_phone: str | None
    firm_tel: str | None
    firm_fax: str | None
    firm_email: str | None
    division: str | None
    product_name: str
    product_status: str
    product_status_label: str
    master_status_label: str = "상품조건 확인"
    min_sales_amount: int | None
    min_business_period: str | None
    min_calc_amount: int | None
    credit_rate: str | None
    cubici_period: str | None
    amount_limit: int | None
    other_conditions: str | None
    service_amount_standard: str | None
    service_amount_min: int | None
    service_amount_max: int | None
    service_amount_unit: str | None
    execute_amount_standard: str | None
    execute_amount_min: int | None
    execute_amount_max: int | None
    execute_amount_unit: str | None
    service_fee_standard: str | None
    service_fee_min: float | None
    service_fee_max: float | None
    annual_fee_rate: float | None
    interest_standard: str | None
    interest_min: float | None
    interest_max: float | None
    limit_change_yn: str | None
    service_repay_period: str | None
    service_repay_min: int | None
    service_repay_max: int | None
    service_repay_method: str | None
    extension_yn: str | None
    launch_date: date | None
    expire_date: date | None
    repayment_count: int | None
    repay_amount: int | None
    mid_repay_yn: str | None
    b2b_firm_name: str | None
    product_type: str | None
    reg_date: datetime | None
    update_date: datetime | None


class MoneybankProductCounts(BaseModel):
    total_count: int
    operating_count: int
    completed_count: int
    stopped_count: int
    partner_count: int = 0
    preference_count: int = 0
    incomplete_count: int = 0
    master_status_label: str = "미적재"


class MoneybankProductListResponse(BaseModel):
    limit: int
    offset: int
    counts: MoneybankProductCounts
    items: list[MoneybankProductListItem]


class MoneybankProductWriteRequest(BaseModel):
    firm_id: str = Field(min_length=1, max_length=20)
    firm_name: str = Field(min_length=1, max_length=100)
    rep_name: str = Field(min_length=1, max_length=50)
    firm_zip: str | None = Field(default=None, max_length=10)
    firm_address: str = Field(min_length=1, max_length=300)
    manager_name: str | None = Field(default=None, max_length=100)
    manager_rank: str | None = Field(default=None, max_length=50)
    manager_phone: str | None = Field(default=None, max_length=30)
    developer_name: str | None = Field(default=None, max_length=100)
    developer_rank: str | None = Field(default=None, max_length=50)
    developer_phone: str | None = Field(default=None, max_length=30)
    cs_name: str | None = Field(default=None, max_length=100)
    cs_rank: str | None = Field(default=None, max_length=50)
    cs_phone: str | None = Field(default=None, max_length=30)
    firm_tel: str | None = Field(default=None, max_length=30)
    firm_fax: str | None = Field(default=None, max_length=30)
    firm_email: str | None = Field(default=None, max_length=150)
    division: str | None = Field(default=None, max_length=30)
    product_name: str = Field(min_length=1, max_length=100)
    product_status: str = Field(default="00", max_length=20)
    min_sales_amount: int | None = None
    min_business_period: str | None = Field(default=None, max_length=50)
    min_calc_amount: int | None = None
    credit_rate: str | None = Field(default=None, max_length=50)
    cubici_period: str | None = Field(default=None, max_length=50)
    amount_limit: int | None = None
    other_conditions: str | None = Field(default=None, max_length=1000)
    service_amount_standard: str | None = Field(default=None, max_length=50)
    service_amount_min: int | None = None
    service_amount_max: int | None = None
    service_amount_unit: str | None = Field(default=None, max_length=50)
    execute_amount_standard: str | None = Field(default=None, max_length=50)
    execute_amount_min: int | None = None
    execute_amount_max: int | None = None
    execute_amount_unit: str | None = Field(default=None, max_length=50)
    service_fee_standard: str | None = Field(default=None, max_length=50)
    service_fee_min: float | None = None
    service_fee_max: float | None = None
    annual_fee_rate: float | None = None
    interest_standard: str | None = Field(default=None, max_length=50)
    interest_min: float | None = None
    interest_max: float | None = None
    limit_change_yn: str | None = Field(default=None, max_length=1)
    service_repay_period: str | None = Field(default=None, max_length=50)
    service_repay_min: int | None = None
    service_repay_max: int | None = None
    service_repay_method: str | None = Field(default=None, max_length=50)
    extension_yn: str | None = Field(default=None, max_length=1)
    launch_date: date | None = None
    expire_date: date | None = None
    repayment_count: int | None = None
    repay_amount: int | None = None
    mid_repay_yn: str | None = Field(default=None, max_length=1)
    b2b_firm_name: str | None = Field(default=None, max_length=100)
    product_type: str | None = Field(default=None, max_length=30)


class MoneybankProductWriteResponse(BaseModel):
    action: str
    firm_no: int
    product: MoneybankProductListItem | None


class PrizmConfigItem(BaseModel):
    row_no: int
    division: int
    division_label: str
    subject_no: int
    subject_name: str
    item_no: int
    item_nm: str | None
    item_definition: str | None
    item_weight: str | None
    item_standard_low1: str | None
    item_standard_high1: str | None
    item_standard_low2: str | None
    item_standard_high2: str | None
    item_standard_low3: str | None
    item_standard_high3: str | None
    item_standard_low4: str | None
    item_standard_high4: str | None
    item_standard_low5: str | None
    item_standard_high5: str | None
    config_status_label: str = "미검증"


class PrizmConfigCounts(BaseModel):
    total_count: int
    prizm_count: int
    cra_count: int
    incomplete_count: int = 0


class PrizmConfigListResponse(BaseModel):
    limit: int
    offset: int
    counts: PrizmConfigCounts
    items: list[PrizmConfigItem]


class PrizmConfigUpdateRequest(BaseModel):
    item_definition: str | None = Field(default=None, max_length=255)
    item_weight: str | None = Field(default=None, max_length=255)
    item_standard_low1: str | None = Field(default=None, max_length=255)
    item_standard_high1: str | None = Field(default=None, max_length=255)
    item_standard_low2: str | None = Field(default=None, max_length=255)
    item_standard_high2: str | None = Field(default=None, max_length=255)
    item_standard_low3: str | None = Field(default=None, max_length=255)
    item_standard_high3: str | None = Field(default=None, max_length=255)
    item_standard_low4: str | None = Field(default=None, max_length=255)
    item_standard_high4: str | None = Field(default=None, max_length=255)
    item_standard_low5: str | None = Field(default=None, max_length=255)
    item_standard_high5: str | None = Field(default=None, max_length=255)
    admin_id: str | None = Field(default=None, max_length=100)
    update_memo: str | None = Field(default=None, max_length=1000)


class PrizmConfigUpdateResponse(BaseModel):
    action: str
    division: int
    subject_no: int
    item_no: int
    item: PrizmConfigItem | None


class PrizmConfigUpdateRecord(BaseModel):
    record_id: int
    division: int
    subject_no: int
    item_no: int
    item_name: str | None
    admin_id: str | None
    update_memo: str | None
    before_payload: dict[str, Any]
    after_payload: dict[str, Any]
    reg_date: datetime


class PrizmConfigUpdateRecordResponse(BaseModel):
    limit: int
    offset: int
    total: int
    items: list[PrizmConfigUpdateRecord]


class RawDataTableOption(BaseModel):
    table_name: str
    table_label: str
    table_type: str


class RawDataColumnOption(BaseModel):
    column_name: str
    column_label: str
    data_type: str


class RawDataFormulaItem(BaseModel):
    raw_data_no: int
    raw_data_division: str
    raw_data_id: str
    raw_data_shop: str | None
    raw_data_title: str
    raw_data_content: str
    formula_status_label: str = "미검증"
    reg_date: datetime | None
    update_date: datetime | None


class RawDataFormulaWriteRequest(BaseModel):
    raw_data_id: str = Field(min_length=1, max_length=100)
    raw_data_shop: str | None = Field(default=None, max_length=50)
    raw_data_title: str = Field(min_length=1, max_length=255)
    raw_data_content: str = Field(min_length=1)


class RawDataFormulaWriteResponse(BaseModel):
    action: str
    raw_data_no: int
    formula: RawDataFormulaItem | None


class RawDataPreviewRequest(BaseModel):
    table_name: str = Field(min_length=1, max_length=100)
    columns: list[str] = Field(min_length=1, max_length=20)
    limit: int = Field(default=20, ge=1, le=100)


class RawDataPreviewResponse(BaseModel):
    table_name: str
    columns: list[RawDataColumnOption]
    rows: list[dict[str, Any]]


def _build_charge_filters(
    *,
    status: ChargeStatus,
    charge_code: str | None,
    charge_name: str | None,
) -> tuple[str, list[object]]:
    filters = []
    params: list[object] = []

    if status == "operating":
        filters.append("start_date <= current_date and expire_date >= current_date")
    elif status == "ended":
        filters.append("(start_date > current_date or expire_date < current_date)")

    if charge_code:
        filters.append("charge_code ilike %s")
        params.append(f"{charge_code}%")

    if charge_name:
        filters.append("charge_name ilike %s")
        params.append(f"%{charge_name}%")

    if not filters:
        return "", params

    return "where " + " and ".join(filters), params


def _charge_select_query() -> str:
    return """
        select
            charge_code,
            charge_name,
            charge_type,
            case
                when start_date <= current_date and expire_date >= current_date then '운영'
                else '종료'
            end as status,
            start_date,
            expire_date,
            sub_id,
            sales_count,
            product_count,
            amount,
            period,
            period_unit,
            charge_detail,
            reg_date,
            update_date
        from charge
    """


def list_charges(
    limit: int,
    offset: int,
    *,
    status: ChargeStatus = "all",
    charge_code: str | None = None,
    charge_name: str | None = None,
    order_by: ChargeOrderBy = "reg_date_desc",
) -> ChargeListResponse:
    where_clause, filter_params = _build_charge_filters(
        status=status,
        charge_code=charge_code,
        charge_name=charge_name,
    )
    order_clause = {
        "reg_date_asc": "reg_date asc nulls last, charge_code asc",
        "amount_desc": "amount desc nulls last, reg_date desc nulls last",
        "charge_name_asc": "charge_name asc, reg_date desc nulls last",
        "charge_code_asc": "charge_code asc",
        "reg_date_desc": "reg_date desc nulls last, charge_code desc",
    }[order_by]
    base_query = _charge_select_query()

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                with charge_base as (
                    {base_query}
                )
                select
                    count(*)::int as total_count,
                    count(*) filter (where start_date <= current_date and expire_date >= current_date)::int as operating_count,
                    count(*) filter (where start_date > current_date or expire_date < current_date)::int as ended_count
                from charge_base
                {where_clause}
                """,
                filter_params,
            )
            counts = cursor.fetchone()

            cursor.execute(
                f"""
                with charge_base as (
                    {base_query}
                ),
                ordered as (
                    select *
                    from charge_base
                    {where_clause}
                    order by {order_clause}
                )
                select
                    row_number() over (order by {order_clause})::int + %s as row_no,
                    *
                from ordered
                limit %s offset %s
                """,
                (*filter_params, offset, limit, offset),
            )
            rows = cursor.fetchall()

    return ChargeListResponse(
        limit=limit,
        offset=offset,
        counts=ChargeCounts(**counts),
        items=[ChargeListItem(**row) for row in rows],
    )


def get_charge(charge_code: str) -> ChargeListItem | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                with charge_base as (
                    {_charge_select_query()}
                )
                select 1 as row_no, *
                from charge_base
                where charge_code = %s
                """,
                (charge_code,),
            )
            row = cursor.fetchone()

    return ChargeListItem(**row) if row else None


def create_charge(payload: ChargeWriteRequest) -> ChargeWriteResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                insert into charge (
                    charge_code,
                    charge_name,
                    charge_type,
                    start_date,
                    expire_date,
                    sub_id,
                    sales_count,
                    product_count,
                    amount,
                    period,
                    period_unit,
                    charge_detail,
                    reg_date
                )
                values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now())
                """,
                (
                    payload.charge_code,
                    payload.charge_name,
                    payload.charge_type,
                    payload.start_date,
                    payload.expire_date,
                    payload.sub_id,
                    payload.sales_count,
                    payload.product_count,
                    payload.amount,
                    payload.period,
                    payload.period_unit,
                    payload.charge_detail,
                ),
            )

    return ChargeWriteResponse(action="created", charge_code=payload.charge_code, charge=get_charge(payload.charge_code))


def update_charge(charge_code: str, payload: ChargeWriteRequest) -> ChargeWriteResponse | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                update charge
                set
                    charge_name = %s,
                    charge_type = %s,
                    start_date = %s,
                    expire_date = %s,
                    sub_id = %s,
                    sales_count = %s,
                    product_count = %s,
                    amount = %s,
                    period = %s,
                    period_unit = %s,
                    charge_detail = %s,
                    update_date = now()
                where charge_code = %s
                returning charge_code
                """,
                (
                    payload.charge_name,
                    payload.charge_type,
                    payload.start_date,
                    payload.expire_date,
                    payload.sub_id,
                    payload.sales_count,
                    payload.product_count,
                    payload.amount,
                    payload.period,
                    payload.period_unit,
                    payload.charge_detail,
                    charge_code,
                ),
            )
            row = cursor.fetchone()

    if not row:
        return None

    return ChargeWriteResponse(action="updated", charge_code=charge_code, charge=get_charge(charge_code))


def delete_charge(charge_code: str) -> ChargeWriteResponse | None:
    existing = get_charge(charge_code)
    if existing is None:
        return None

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("delete from charge where charge_code = %s", (charge_code,))

    return ChargeWriteResponse(action="deleted", charge_code=charge_code, charge=None)


def _admin_type_label_expression() -> str:
    return """
        case admin_type
            when '00' then '큐빅아이'
            when '01' then '투게더'
            when '02' then '헬로펀딩'
            else admin_type
        end
    """


def _admin_grade_label_expression() -> str:
    return """
        case admin_grade
            when '00' then '권한1'
            when '01' then '권한2'
            when '02' then '승인대기'
            else admin_grade
        end
    """


def _admin_select_query() -> str:
    return f"""
        select
            admin_id,
            admin_type,
            {_admin_type_label_expression()} as admin_type_label,
            admin_name,
            admin_phone,
            admin_email,
            admin_department,
            admin_grade,
            {_admin_grade_label_expression()} as admin_grade_label,
            case admin_grade
                when '00' then '전체관리'
                when '01' then '운영관리'
                when '02' then '승인대기'
                else '미정'
            end as permission_scope_label,
            case
                when admin_approval_date is null then '대기'
                else '승인완료'
            end as approval_status,
            case
                when admin_approval_date is null then '승인대기'
                when modified_date is not null then '수정이력'
                else '승인이력'
            end as audit_status_label,
            admin_reg_date,
            admin_approval_date,
            modified_date
        from admin_account
    """


def _build_admin_filters(
    *,
    admin_type: str | None,
    admin_grade: str | None,
    admin_name: str | None,
    status: AdminAccountStatus,
) -> tuple[str, list[object]]:
    filters = []
    params: list[object] = []

    if admin_type and admin_type != "all":
        filters.append("admin_type = %s")
        params.append(admin_type)

    if admin_grade and admin_grade != "all":
        filters.append("admin_grade = %s")
        params.append(admin_grade)

    if admin_name:
        filters.append("admin_name ilike %s")
        params.append(f"%{admin_name}%")

    if status == "pending":
        filters.append("admin_approval_date is null")
    elif status == "approved":
        filters.append("admin_approval_date is not null")

    if not filters:
        return "", params

    return "where " + " and ".join(filters), params


def _hash_admin_password(password: SecretStr) -> str:
    raw_password = password.get_secret_value()
    return hashlib.sha256(f"{raw_password}{ADMIN_PASSWORD_SALT}".encode("utf-8")).hexdigest()


def list_admin_accounts(
    limit: int,
    offset: int,
    *,
    admin_type: str | None = None,
    admin_grade: str | None = None,
    admin_name: str | None = None,
    status: AdminAccountStatus = "all",
    order_by: AdminAccountOrderBy = "reg_date_desc",
) -> AdminAccountListResponse:
    where_clause, filter_params = _build_admin_filters(
        admin_type=admin_type,
        admin_grade=admin_grade,
        admin_name=admin_name,
        status=status,
    )
    order_clause = {
        "approval_date_desc": "admin_approval_date desc nulls last, admin_reg_date desc nulls last",
        "name_asc": "admin_name asc, admin_reg_date desc nulls last",
        "admin_id_asc": "admin_id asc",
        "reg_date_desc": "admin_reg_date desc nulls last, admin_id desc",
    }[order_by]
    base_query = _admin_select_query()

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                with admin_base as (
                    {base_query}
                )
                select
                    count(*)::int as total_count,
                    count(*) filter (where admin_approval_date is null)::int as pending_count,
                    count(*) filter (where admin_approval_date is not null)::int as approved_count
                from admin_base
                {where_clause}
                """,
                filter_params,
            )
            counts = cursor.fetchone()

            cursor.execute(
                f"""
                with admin_base as (
                    {base_query}
                ),
                ordered as (
                    select *
                    from admin_base
                    {where_clause}
                    order by {order_clause}
                )
                select
                    row_number() over (order by {order_clause})::int + %s as row_no,
                    *
                from ordered
                limit %s offset %s
                """,
                (*filter_params, offset, limit, offset),
            )
            rows = cursor.fetchall()

    return AdminAccountListResponse(
        limit=limit,
        offset=offset,
        counts=AdminAccountCounts(**counts),
        items=[AdminAccountListItem(**row) for row in rows],
    )


def get_admin_account(admin_id: str) -> AdminAccountListItem | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                with admin_base as (
                    {_admin_select_query()}
                )
                select 1 as row_no, *
                from admin_base
                where admin_id = %s
                """,
                (admin_id,),
            )
            row = cursor.fetchone()

    return AdminAccountListItem(**row) if row else None


def admin_id_exists(admin_id: str) -> AdminAccountIdCheckResponse:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("select exists(select 1 from admin_account where admin_id = %s)", (admin_id,))
            exists = bool(cursor.fetchone()[0])

    return AdminAccountIdCheckResponse(admin_id=admin_id, exists=exists)


def request_admin_account(payload: AdminAccountRequest) -> AdminAccountWriteResponse:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("select count(*)::int + 1 from admin_account")
            next_no = cursor.fetchone()[0]
            admin_id = f"temp_id_{next_no}"
            cursor.execute("select exists(select 1 from admin_account where admin_id = %s)", (admin_id,))
            exists = bool(cursor.fetchone()[0])
            while exists:
                next_no += 1
                admin_id = f"temp_id_{next_no}"
                cursor.execute("select exists(select 1 from admin_account where admin_id = %s)", (admin_id,))
                exists = bool(cursor.fetchone()[0])

            cursor.execute(
                """
                insert into admin_account (
                    admin_id,
                    admin_type,
                    admin_name,
                    admin_phone,
                    admin_email,
                    admin_department,
                    admin_grade,
                    admin_reg_date
                )
                values (%s, %s, %s, %s, %s, %s, '02', now())
                """,
                (
                    admin_id,
                    payload.admin_type,
                    payload.admin_name,
                    payload.admin_phone,
                    payload.admin_email,
                    payload.admin_department,
                ),
            )

    return AdminAccountWriteResponse(action="created", admin_id=admin_id, account=get_admin_account(admin_id))


def approve_admin_account(admin_id: str, payload: AdminAccountApproveRequest) -> AdminAccountWriteResponse | None:
    password_hash = _hash_admin_password(payload.password)

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                update admin_account
                set
                    admin_id = %s,
                    admin_password_hash = %s,
                    admin_grade = %s,
                    admin_approval_date = now(),
                    modified_date = now()
                where admin_id = %s
                returning admin_id
                """,
                (payload.new_admin_id, password_hash, payload.admin_grade, admin_id),
            )
            row = cursor.fetchone()

    if not row:
        return None

    return AdminAccountWriteResponse(
        action="approved",
        admin_id=payload.new_admin_id,
        account=get_admin_account(payload.new_admin_id),
    )


def update_admin_account(admin_id: str, payload: AdminAccountUpdateRequest) -> AdminAccountWriteResponse | None:
    password_hash = _hash_admin_password(payload.password) if payload.password else None

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                update admin_account
                set
                    admin_type = %s,
                    admin_name = %s,
                    admin_phone = %s,
                    admin_email = %s,
                    admin_department = %s,
                    admin_grade = %s,
                    admin_password_hash = coalesce(%s, admin_password_hash),
                    modified_date = now()
                where admin_id = %s
                returning admin_id
                """,
                (
                    payload.admin_type,
                    payload.admin_name,
                    payload.admin_phone,
                    payload.admin_email,
                    payload.admin_department,
                    payload.admin_grade,
                    password_hash,
                    admin_id,
                ),
            )
            row = cursor.fetchone()

    if not row:
        return None

    return AdminAccountWriteResponse(action="updated", admin_id=admin_id, account=get_admin_account(admin_id))


def delete_admin_account(admin_id: str) -> AdminAccountWriteResponse | None:
    existing = get_admin_account(admin_id)
    if existing is None:
        return None

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("delete from admin_account where admin_id = %s", (admin_id,))

    return AdminAccountWriteResponse(action="deleted", admin_id=admin_id, account=None)


PROMOTION_TARGET_LABELS = {
    "N": "신규",
    "C": "큐빅회원",
    "M": "MB회원",
    "L": "휴면회원",
    "A": "제휴사회원",
    "O": "기타",
}


def _promotion_target_label_expression() -> str:
    return """
        case promo_target
            when 'N' then '신규'
            when 'C' then '큐빅회원'
            when 'M' then 'MB회원'
            when 'L' then '휴면회원'
            when 'A' then '제휴사회원'
            when 'O' then '기타'
            else coalesce(promo_target, '')
        end
    """


def _promotion_period_unit_label_expression() -> str:
    return """
        case period_unit
            when 'M' then '개월'
            when 'W' then '주'
            else ''
        end
    """


def _promotion_select_query() -> str:
    return f"""
        select
            p.promo_code,
            p.promo_name,
            p.promo_target,
            {_promotion_target_label_expression()} as promo_target_label,
            coalesce(nullif(p.partner_code, ''), 'CBCI') as partner_code,
            coalesce(pa.partner_name, '자체') as partner_name,
            coalesce(
                p.status,
                case when p.start_date <= current_date and p.expire_date > current_date then 'Y' else 'N' end
            ) as status,
            case
                when coalesce(p.status, case when p.start_date <= current_date and p.expire_date > current_date then 'Y' else 'N' end) = 'Y' then '운영'
                else '종료'
            end as status_label,
            p.start_date,
            p.expire_date,
            coalesce((
                select array_agg(pc.charge_code order by pc.charge_code)
                from promotion_charge pc
                where pc.promo_code = p.promo_code
            ), array[]::varchar[]) as charge_codes,
            coalesce((
                select array_agg(c.charge_name order by pc.charge_code)
                from promotion_charge pc
                join charge c on c.charge_code = pc.charge_code
                where pc.promo_code = p.promo_code
            ), array[]::varchar[]) as charge_names,
            p.discount_rate,
            p.discount_amount,
            p.period,
            p.period_unit,
            {_promotion_period_unit_label_expression()} as period_unit_label,
            p.sub_id,
            case when p.sub_id = 99 then '무제한' else coalesce(p.sub_id::text, '') end as sub_id_label,
            p.promo_detail,
            p.reg_date,
            p.update_date
        from promotion p
        left join partner pa on pa.partner_code = p.partner_code
    """


def _build_promotion_filters(
    *,
    promo_code: str | None,
    status: PromotionStatus,
    partner_name: str | None,
) -> tuple[str, list[object]]:
    filters = []
    params: list[object] = []

    if promo_code:
        filters.append("promo_code ilike %s")
        params.append(f"%{promo_code}%")

    if status != "all":
        filters.append("status = %s")
        params.append(status)

    if partner_name:
        filters.append("partner_name ilike %s")
        params.append(f"%{partner_name}%")

    if not filters:
        return "", params

    return "where " + " and ".join(filters), params


def list_promotions(
    limit: int,
    offset: int,
    *,
    promo_code: str | None = None,
    status: PromotionStatus = "all",
    partner_name: str | None = None,
    order_by: PromotionOrderBy = "start_date_desc",
) -> PromotionListResponse:
    where_clause, filter_params = _build_promotion_filters(
        promo_code=promo_code,
        status=status,
        partner_name=partner_name,
    )
    order_clause = {
        "start_date_asc": "start_date asc nulls last, promo_code asc",
        "promo_code_asc": "promo_code asc",
        "promo_name_asc": "promo_name asc nulls last, start_date desc nulls last",
        "start_date_desc": "start_date desc nulls last, promo_code desc",
    }[order_by]
    base_query = _promotion_select_query()

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                with promotion_base as (
                    {base_query}
                )
                select
                    count(*)::int as total_count,
                    count(*) filter (where status = 'Y')::int as operating_count,
                    count(*) filter (where status = 'N')::int as ended_count
                from promotion_base
                {where_clause}
                """,
                filter_params,
            )
            counts = cursor.fetchone()

            cursor.execute(
                f"""
                with promotion_base as (
                    {base_query}
                ),
                ordered as (
                    select *
                    from promotion_base
                    {where_clause}
                    order by {order_clause}
                )
                select
                    row_number() over (order by {order_clause})::int + %s as row_no,
                    *
                from ordered
                limit %s offset %s
                """,
                (*filter_params, offset, limit, offset),
            )
            rows = cursor.fetchall()

    return PromotionListResponse(
        limit=limit,
        offset=offset,
        counts=PromotionCounts(**counts),
        items=[PromotionListItem(**row) for row in rows],
    )


def get_promotion(promo_code: str) -> PromotionListItem | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                with promotion_base as (
                    {_promotion_select_query()}
                )
                select 1 as row_no, *
                from promotion_base
                where promo_code = %s
                """,
                (promo_code,),
            )
            row = cursor.fetchone()

    return PromotionListItem(**row) if row else None


def get_promotion_options(partner_division: str | None = None) -> PromotionOptionsResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select charge_code as value, charge_name as label
                from charge
                where start_date <= current_date
                  and expire_date > current_date
                order by sub_id desc nulls last, charge_code
                """,
            )
            charges = cursor.fetchall()

            cursor.execute(
                """
                select distinct partner_type as value, partner_type as label
                from partner
                where partner_type is not null
                order by partner_type
                """,
            )
            partner_divisions = cursor.fetchall()

            partner_filter = ""
            params: tuple[object, ...] = ()
            if partner_division and partner_division != "CBCI":
                partner_filter = "and (partner_type = %s or partner_code ilike %s)"
                params = (partner_division, f"{partner_division}%")

            cursor.execute(
                f"""
                select partner_code as value, partner_name as label
                from partner
                where partner_status = '00'
                  {partner_filter}
                order by partner_name, partner_code
                """,
                params,
            )
            partners = cursor.fetchall()

    division_options = [PromotionOption(value="CBCI", label="자체")]
    division_options.extend(
        PromotionOption(value=row["value"], label=row["label"]) for row in partner_divisions if row["value"]
    )

    return PromotionOptionsResponse(
        targets=[PromotionOption(value=value, label=label) for value, label in PROMOTION_TARGET_LABELS.items()],
        partner_divisions=division_options,
        partners=[PromotionOption(**row) for row in partners],
        charges=[PromotionOption(**row) for row in charges],
    )


def _replace_promotion_charges(cursor, promo_code: str, charge_codes: list[str]) -> None:
    cursor.execute("delete from promotion_charge where promo_code = %s", (promo_code,))
    for charge_code in dict.fromkeys(charge_codes):
        cursor.execute(
            """
            insert into promotion_charge (promo_code, charge_code)
            values (%s, %s)
            on conflict do nothing
            """,
            (promo_code, charge_code),
        )


def create_promotion(payload: PromotionWriteRequest) -> PromotionWriteResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                insert into promotion (
                    promo_code,
                    promo_name,
                    promo_target,
                    partner_code,
                    charges,
                    status,
                    period,
                    period_unit,
                    sub_id,
                    discount_rate,
                    discount_amount,
                    promo_detail,
                    start_date,
                    expire_date,
                    reg_date
                )
                values (
                    %s, %s, %s, %s, %s,
                    case when %s <= current_date and %s > current_date then 'Y' else 'N' end,
                    %s, %s, %s, %s, %s, %s, %s, %s, now()
                )
                """,
                (
                    payload.promo_code,
                    payload.promo_name,
                    payload.promo_target,
                    payload.partner_code or "CBCI",
                    ",".join(payload.charge_codes),
                    payload.start_date,
                    payload.expire_date,
                    payload.period,
                    payload.period_unit,
                    payload.sub_id,
                    payload.discount_rate,
                    payload.discount_amount,
                    payload.promo_detail,
                    payload.start_date,
                    payload.expire_date,
                ),
            )
            _replace_promotion_charges(cursor, payload.promo_code, payload.charge_codes)

    return PromotionWriteResponse(action="created", promo_code=payload.promo_code, promotion=get_promotion(payload.promo_code))


def update_promotion(promo_code: str, payload: PromotionWriteRequest) -> PromotionWriteResponse | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                update promotion
                set
                    promo_name = %s,
                    promo_target = %s,
                    partner_code = %s,
                    charges = %s,
                    status = case when %s <= current_date and %s > current_date then 'Y' else 'N' end,
                    period = %s,
                    period_unit = %s,
                    sub_id = %s,
                    discount_rate = %s,
                    discount_amount = %s,
                    promo_detail = %s,
                    start_date = %s,
                    expire_date = %s,
                    update_date = now()
                where promo_code = %s
                returning promo_code
                """,
                (
                    payload.promo_name,
                    payload.promo_target,
                    payload.partner_code or "CBCI",
                    ",".join(payload.charge_codes),
                    payload.start_date,
                    payload.expire_date,
                    payload.period,
                    payload.period_unit,
                    payload.sub_id,
                    payload.discount_rate,
                    payload.discount_amount,
                    payload.promo_detail,
                    payload.start_date,
                    payload.expire_date,
                    promo_code,
                ),
            )
            row = cursor.fetchone()
            if not row:
                return None
            _replace_promotion_charges(cursor, promo_code, payload.charge_codes)

    return PromotionWriteResponse(action="updated", promo_code=promo_code, promotion=get_promotion(promo_code))


def delete_promotion(promo_code: str) -> PromotionWriteResponse | None:
    existing = get_promotion(promo_code)
    if existing is None:
        return None

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("delete from promotion where promo_code = %s", (promo_code,))

    return PromotionWriteResponse(action="deleted", promo_code=promo_code, promotion=None)


def _partner_select_query() -> str:
    return """
        select
            p.partner_id,
            p.partner_code,
            p.partner_name,
            p.rep_name,
            p.partner_zip,
            p.partner_address,
            p.partner_status,
            case when p.partner_status = '00' then '운영' else '종료' end as partner_status_label,
            p.partner_type,
            coalesce(p.partner_type, '') as partner_type_label,
            p.memo,
            pm.manager_name,
            pm.manager_phone,
            case
                when pm.manager_name is null and pm.manager_phone is null then '담당자 미지정'
                else '담당자 등록'
            end as manager_status_label,
            p.reg_date,
            p.update_date
        from partner p
        left join partner_manager pm
          on pm.partner_code = p.partner_code
         and pm.manager_type = '01'
    """


def _build_partner_filters(
    *,
    partner_name: str | None,
    partner_status: PartnerStatus,
    rep_name: str | None,
    partner_code: str | None,
) -> tuple[str, list[object]]:
    filters = []
    params: list[object] = []

    if partner_name:
        filters.append("partner_name ilike %s")
        params.append(f"%{partner_name}%")

    if partner_status != "all":
        filters.append("partner_status = %s")
        params.append(partner_status)

    if rep_name:
        filters.append("rep_name ilike %s")
        params.append(f"%{rep_name}%")

    if partner_code:
        filters.append("partner_code ilike %s")
        params.append(f"%{partner_code}%")

    if not filters:
        return "", params

    return "where " + " and ".join(filters), params


def list_partners(
    limit: int,
    offset: int,
    *,
    partner_name: str | None = None,
    partner_status: PartnerStatus = "all",
    rep_name: str | None = None,
    partner_code: str | None = None,
    order_by: PartnerOrderBy = "reg_date_desc",
) -> PartnerListResponse:
    where_clause, filter_params = _build_partner_filters(
        partner_name=partner_name,
        partner_status=partner_status,
        rep_name=rep_name,
        partner_code=partner_code,
    )
    order_clause = {
        "partner_name_asc": "partner_name asc, reg_date desc nulls last",
        "partner_code_asc": "partner_code asc",
        "rep_name_asc": "rep_name asc, reg_date desc nulls last",
        "reg_date_desc": "reg_date desc nulls last, partner_code desc",
    }[order_by]
    base_query = _partner_select_query()

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                with partner_base as (
                    {base_query}
                )
                select
                    count(*)::int as total_count,
                    count(*) filter (where partner_status = '00')::int as operating_count,
                    count(*) filter (where partner_status <> '00' or partner_status is null)::int as ended_count,
                    count(*) filter (where partner_type = 'BA')::int as type_ba_count,
                    count(*) filter (where partner_type = 'BB')::int as type_bb_count,
                    count(*) filter (where partner_type = 'CO')::int as type_co_count,
                    count(*) filter (where partner_type = 'FI')::int as type_fi_count,
                    count(*) filter (where partner_type = 'MN')::int as type_mn_count,
                    count(*) filter (where partner_type = 'TH')::int as type_th_count,
                    count(*) filter (where manager_name is null and manager_phone is null)::int as missing_manager_count
                from partner_base
                {where_clause}
                """,
                filter_params,
            )
            counts = cursor.fetchone()

            cursor.execute(
                f"""
                with partner_base as (
                    {base_query}
                ),
                ordered as (
                    select *
                    from partner_base
                    {where_clause}
                    order by {order_clause}
                )
                select
                    row_number() over (order by {order_clause})::int + %s as row_no,
                    *
                from ordered
                limit %s offset %s
                """,
                (*filter_params, offset, limit, offset),
            )
            rows = cursor.fetchall()

    return PartnerListResponse(
        limit=limit,
        offset=offset,
        counts=PartnerCounts(**counts),
        items=[PartnerListItem(**row) for row in rows],
    )


def _get_partner_managers(cursor, partner_code: str) -> list[PartnerManagerPayload]:
    cursor.execute(
        """
        select
            manager_type,
            manager_name,
            manager_rank,
            manager_email,
            manager_phone
        from partner_manager
        where partner_code = %s
        order by manager_type
        """,
        (partner_code,),
    )
    return [PartnerManagerPayload(**row) for row in cursor.fetchall()]


def get_partner(partner_id: str) -> PartnerDetailResponse | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                with partner_base as (
                    {_partner_select_query()}
                )
                select 1 as row_no, *
                from partner_base
                where partner_id = %s
                """,
                (partner_id,),
            )
            row = cursor.fetchone()
            if not row:
                return None
            partner = PartnerListItem(**row)
            managers = _get_partner_managers(cursor, partner.partner_code)

    return PartnerDetailResponse(partner=partner, managers=managers)


def partner_id_exists(partner_id: str) -> PartnerCheckResponse:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("select exists(select 1 from partner where partner_id = %s)", (partner_id,))
            exists = bool(cursor.fetchone()[0])

    return PartnerCheckResponse(value=partner_id, exists=exists)


def partner_code_exists(partner_code: str) -> PartnerCheckResponse:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("select exists(select 1 from partner where partner_code = %s)", (partner_code,))
            exists = bool(cursor.fetchone()[0])

    return PartnerCheckResponse(value=partner_code, exists=exists)


def _replace_partner_managers(cursor, partner_code: str, managers: list[PartnerManagerPayload]) -> None:
    for manager in managers:
        cursor.execute(
            """
            insert into partner_manager (
                partner_code,
                manager_type,
                manager_name,
                manager_rank,
                manager_email,
                manager_phone,
                reg_date
            )
            values (%s, %s, %s, %s, %s, %s, now())
            on conflict (manager_type, partner_code)
            do update set
                manager_name = excluded.manager_name,
                manager_rank = excluded.manager_rank,
                manager_email = excluded.manager_email,
                manager_phone = excluded.manager_phone,
                update_date = now()
            """,
            (
                partner_code,
                manager.manager_type,
                manager.manager_name,
                manager.manager_rank,
                manager.manager_email,
                manager.manager_phone,
            ),
        )


def create_partner(payload: PartnerWriteRequest) -> PartnerWriteResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                insert into partner (
                    partner_id,
                    partner_code,
                    partner_name,
                    rep_name,
                    partner_zip,
                    partner_address,
                    partner_status,
                    partner_type,
                    memo,
                    reg_date
                )
                values (%s, %s, %s, %s, %s, %s, %s, %s, %s, now())
                """,
                (
                    payload.partner_id,
                    payload.partner_code,
                    payload.partner_name,
                    payload.rep_name,
                    payload.partner_zip,
                    payload.partner_address,
                    payload.partner_status,
                    payload.partner_type,
                    payload.memo,
                ),
            )
            _replace_partner_managers(cursor, payload.partner_code, payload.managers)

    return PartnerWriteResponse(action="created", partner_id=payload.partner_id, partner=get_partner(payload.partner_id))


def update_partner(partner_id: str, payload: PartnerWriteRequest) -> PartnerWriteResponse | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                update partner
                set
                    partner_name = %s,
                    rep_name = %s,
                    partner_zip = %s,
                    partner_address = %s,
                    partner_status = %s,
                    memo = %s,
                    update_date = now()
                where partner_id = %s
                returning partner_code
                """,
                (
                    payload.partner_name,
                    payload.rep_name,
                    payload.partner_zip,
                    payload.partner_address,
                    payload.partner_status,
                    payload.memo,
                    partner_id,
                ),
            )
            row = cursor.fetchone()
            if not row:
                return None
            _replace_partner_managers(cursor, row["partner_code"], payload.managers)

    return PartnerWriteResponse(action="updated", partner_id=partner_id, partner=get_partner(partner_id))


def delete_partner(partner_id: str) -> PartnerWriteResponse | None:
    existing = get_partner(partner_id)
    if existing is None:
        return None

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("delete from partner_manager where partner_code = %s", (existing.partner.partner_code,))
            cursor.execute("delete from partner where partner_id = %s", (partner_id,))

    return PartnerWriteResponse(action="deleted", partner_id=partner_id, partner=None)


def _build_moneybank_product_filters(
    *,
    product_status: MoneybankProductStatus,
    firm_name: str | None,
    product_name: str | None,
    manager_name: str | None,
) -> tuple[str, list[object]]:
    filters = []
    params: list[object] = []

    if product_status != "all":
        filters.append("product_status = %s")
        params.append(product_status)

    if firm_name:
        filters.append("firm_name ilike %s")
        params.append(f"%{firm_name}%")

    if product_name:
        filters.append("product_name ilike %s")
        params.append(f"%{product_name}%")

    if manager_name:
        filters.append("manager_name ilike %s")
        params.append(f"%{manager_name}%")

    if not filters:
        return "", params

    return "where " + " and ".join(filters), params


def _moneybank_product_select_query() -> str:
    return """
        select
            mp.firm_no,
            mp.firm_id,
            mp.firm_name,
            mp.rep_name,
            mp.firm_zip,
            mp.firm_address,
            mp.manager_name,
            mp.manager_rank,
            mp.manager_phone,
            mp.developer_name,
            mp.developer_rank,
            mp.developer_phone,
            mp.cs_name,
            mp.cs_rank,
            mp.cs_phone,
            mp.firm_tel,
            mp.firm_fax,
            mp.firm_email,
            mpp.division,
            mpp.product_name,
            mpp.product_status,
            case mpp.product_status
                when '00' then '운영'
                when '01' then '완료'
                when '02' then '중지'
                else coalesce(mpp.product_status, '-')
            end as product_status_label,
            case
                when nullif(mpp.product_name, '') is null then '상품명 미등록'
                when mpp.service_fee_min is null or mpp.service_fee_max is null then '수수료 조건 확인'
                when mpp.execute_amount_min is null or mpp.execute_amount_max is null then '실행금액 조건 확인'
                else '상품조건 등록'
            end as master_status_label,
            mpp.min_sales_amount,
            mpp.min_business_period,
            mpp.min_calc_amount,
            mpp.credit_rate,
            mpp.cubici_period,
            mpp.amount_limit,
            mpp.other_conditions,
            mpp.service_amount_standard,
            mpp.service_amount_min,
            mpp.service_amount_max,
            mpp.service_amount_unit,
            mpp.execute_amount_standard,
            mpp.execute_amount_min,
            mpp.execute_amount_max,
            mpp.execute_amount_unit,
            mpp.service_fee_standard,
            mpp.service_fee_min,
            mpp.service_fee_max,
            mpp.annual_fee_rate,
            mpp.interest_standard,
            mpp.interest_min,
            mpp.interest_max,
            mpp.limit_change_yn,
            mpp.service_repay_period,
            mpp.service_repay_min,
            mpp.service_repay_max,
            mpp.service_repay_method,
            mpp.extension_yn,
            mpp.launch_date,
            mpp.expire_date,
            mpp.repayment_count,
            mpp.repay_amount,
            mpp.mid_repay_yn,
            mpp.b2b_firm_name,
            mpp.product_type,
            mpp.reg_date,
            mpp.update_date
        from moneybank_partner mp
        join moneybank_product_preference mpp on mpp.firm_no = mp.firm_no
    """


def list_moneybank_products(
    limit: int,
    offset: int,
    *,
    product_status: MoneybankProductStatus = "all",
    firm_name: str | None = None,
    product_name: str | None = None,
    manager_name: str | None = None,
    order_by: MoneybankProductOrderBy = "reg_date_desc",
) -> MoneybankProductListResponse:
    where_clause, filter_params = _build_moneybank_product_filters(
        product_status=product_status,
        firm_name=firm_name,
        product_name=product_name,
        manager_name=manager_name,
    )
    order_clause = {
        "reg_date_asc": "reg_date asc nulls last, firm_no asc",
        "firm_name_asc": "firm_name asc, reg_date desc nulls last",
        "product_name_asc": "product_name asc, reg_date desc nulls last",
        "reg_date_desc": "reg_date desc nulls last, firm_no desc",
    }[order_by]
    base_query = _moneybank_product_select_query()

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                with product_base as (
                    {base_query}
                )
                select
                    count(*)::int as total_count,
                    count(*) filter (where product_status = '00')::int as operating_count,
                    count(*) filter (where product_status = '01')::int as completed_count,
                    count(*) filter (where product_status = '02')::int as stopped_count,
                    (select count(*)::int from moneybank_partner) as partner_count,
                    (select count(*)::int from moneybank_product_preference) as preference_count,
                    count(*) filter (
                        where nullif(product_name, '') is null
                           or service_fee_min is null
                           or service_fee_max is null
                           or execute_amount_min is null
                           or execute_amount_max is null
                    )::int as incomplete_count,
                    case
                        when (select count(*) from moneybank_partner) = 0
                         and (select count(*) from moneybank_product_preference) = 0 then '미적재'
                        when count(*) = 0 then '연결불일치'
                        when count(*) filter (
                            where nullif(product_name, '') is null
                               or service_fee_min is null
                               or service_fee_max is null
                               or execute_amount_min is null
                               or execute_amount_max is null
                        ) > 0 then '조건확인필요'
                        else '정상'
                    end as master_status_label
                from product_base
                {where_clause}
                """,
                filter_params,
            )
            counts = cursor.fetchone()

            cursor.execute(
                f"""
                with product_base as (
                    {base_query}
                ),
                ordered as (
                    select *
                    from product_base
                    {where_clause}
                    order by {order_clause}
                )
                select
                    row_number() over (order by {order_clause})::int + %s as row_no,
                    *
                from ordered
                limit %s offset %s
                """,
                (*filter_params, offset, limit, offset),
            )
            rows = cursor.fetchall()

    return MoneybankProductListResponse(
        limit=limit,
        offset=offset,
        counts=MoneybankProductCounts(**counts),
        items=[MoneybankProductListItem(**row) for row in rows],
    )


def get_moneybank_product(firm_no: int) -> MoneybankProductListItem | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                with product_base as (
                    {_moneybank_product_select_query()}
                )
                select 1 as row_no, *
                from product_base
                where firm_no = %s
                """,
                (firm_no,),
            )
            row = cursor.fetchone()

    return MoneybankProductListItem(**row) if row else None


def create_moneybank_product(payload: MoneybankProductWriteRequest) -> MoneybankProductWriteResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                insert into moneybank_partner (
                    firm_id,
                    firm_name,
                    rep_name,
                    firm_zip,
                    firm_address,
                    manager_name,
                    manager_rank,
                    manager_phone,
                    developer_name,
                    developer_rank,
                    developer_phone,
                    cs_name,
                    cs_rank,
                    cs_phone,
                    firm_tel,
                    firm_fax,
                    firm_email,
                    reg_date
                )
                values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now())
                returning firm_no
                """,
                (
                    payload.firm_id,
                    payload.firm_name,
                    payload.rep_name,
                    payload.firm_zip,
                    payload.firm_address,
                    payload.manager_name,
                    payload.manager_rank,
                    payload.manager_phone,
                    payload.developer_name,
                    payload.developer_rank,
                    payload.developer_phone,
                    payload.cs_name,
                    payload.cs_rank,
                    payload.cs_phone,
                    payload.firm_tel,
                    payload.firm_fax,
                    payload.firm_email,
                ),
            )
            firm_no = cursor.fetchone()["firm_no"]
            _upsert_moneybank_product(cursor, firm_no, payload)

    return MoneybankProductWriteResponse(action="created", firm_no=firm_no, product=get_moneybank_product(firm_no))


def update_moneybank_product(firm_no: int, payload: MoneybankProductWriteRequest) -> MoneybankProductWriteResponse | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                update moneybank_partner
                set
                    firm_id = %s,
                    firm_name = %s,
                    rep_name = %s,
                    firm_zip = %s,
                    firm_address = %s,
                    manager_name = %s,
                    manager_rank = %s,
                    manager_phone = %s,
                    developer_name = %s,
                    developer_rank = %s,
                    developer_phone = %s,
                    cs_name = %s,
                    cs_rank = %s,
                    cs_phone = %s,
                    firm_tel = %s,
                    firm_fax = %s,
                    firm_email = %s,
                    update_date = now()
                where firm_no = %s
                returning firm_no
                """,
                (
                    payload.firm_id,
                    payload.firm_name,
                    payload.rep_name,
                    payload.firm_zip,
                    payload.firm_address,
                    payload.manager_name,
                    payload.manager_rank,
                    payload.manager_phone,
                    payload.developer_name,
                    payload.developer_rank,
                    payload.developer_phone,
                    payload.cs_name,
                    payload.cs_rank,
                    payload.cs_phone,
                    payload.firm_tel,
                    payload.firm_fax,
                    payload.firm_email,
                    firm_no,
                ),
            )
            row = cursor.fetchone()
            if not row:
                return None
            _upsert_moneybank_product(cursor, firm_no, payload)

    return MoneybankProductWriteResponse(action="updated", firm_no=firm_no, product=get_moneybank_product(firm_no))


def _upsert_moneybank_product(cursor, firm_no: int, payload: MoneybankProductWriteRequest) -> None:
    cursor.execute(
        """
        insert into moneybank_product_preference (
            firm_no,
            division,
            product_name,
            product_status,
            min_sales_amount,
            min_business_period,
            min_calc_amount,
            credit_rate,
            cubici_period,
            amount_limit,
            other_conditions,
            service_amount_standard,
            service_amount_min,
            service_amount_max,
            service_amount_unit,
            execute_amount_standard,
            execute_amount_min,
            execute_amount_max,
            execute_amount_unit,
            service_fee_standard,
            service_fee_min,
            service_fee_max,
            annual_fee_rate,
            interest_standard,
            interest_min,
            interest_max,
            limit_change_yn,
            service_repay_period,
            service_repay_min,
            service_repay_max,
            service_repay_method,
            extension_yn,
            launch_date,
            expire_date,
            repayment_count,
            repay_amount,
            mid_repay_yn,
            b2b_firm_name,
            product_type,
            reg_date
        )
        values (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now()
        )
        on conflict (firm_no)
        do update set
            division = excluded.division,
            product_name = excluded.product_name,
            product_status = excluded.product_status,
            min_sales_amount = excluded.min_sales_amount,
            min_business_period = excluded.min_business_period,
            min_calc_amount = excluded.min_calc_amount,
            credit_rate = excluded.credit_rate,
            cubici_period = excluded.cubici_period,
            amount_limit = excluded.amount_limit,
            other_conditions = excluded.other_conditions,
            service_amount_standard = excluded.service_amount_standard,
            service_amount_min = excluded.service_amount_min,
            service_amount_max = excluded.service_amount_max,
            service_amount_unit = excluded.service_amount_unit,
            execute_amount_standard = excluded.execute_amount_standard,
            execute_amount_min = excluded.execute_amount_min,
            execute_amount_max = excluded.execute_amount_max,
            execute_amount_unit = excluded.execute_amount_unit,
            service_fee_standard = excluded.service_fee_standard,
            service_fee_min = excluded.service_fee_min,
            service_fee_max = excluded.service_fee_max,
            annual_fee_rate = excluded.annual_fee_rate,
            interest_standard = excluded.interest_standard,
            interest_min = excluded.interest_min,
            interest_max = excluded.interest_max,
            limit_change_yn = excluded.limit_change_yn,
            service_repay_period = excluded.service_repay_period,
            service_repay_min = excluded.service_repay_min,
            service_repay_max = excluded.service_repay_max,
            service_repay_method = excluded.service_repay_method,
            extension_yn = excluded.extension_yn,
            launch_date = excluded.launch_date,
            expire_date = excluded.expire_date,
            repayment_count = excluded.repayment_count,
            repay_amount = excluded.repay_amount,
            mid_repay_yn = excluded.mid_repay_yn,
            b2b_firm_name = excluded.b2b_firm_name,
            product_type = excluded.product_type,
            update_date = now()
        """,
        (
            firm_no,
            payload.division,
            payload.product_name,
            payload.product_status,
            payload.min_sales_amount,
            payload.min_business_period,
            payload.min_calc_amount,
            payload.credit_rate,
            payload.cubici_period,
            payload.amount_limit,
            payload.other_conditions,
            payload.service_amount_standard,
            payload.service_amount_min,
            payload.service_amount_max,
            payload.service_amount_unit,
            payload.execute_amount_standard,
            payload.execute_amount_min,
            payload.execute_amount_max,
            payload.execute_amount_unit,
            payload.service_fee_standard,
            payload.service_fee_min,
            payload.service_fee_max,
            payload.annual_fee_rate,
            payload.interest_standard,
            payload.interest_min,
            payload.interest_max,
            payload.limit_change_yn,
            payload.service_repay_period,
            payload.service_repay_min,
            payload.service_repay_max,
            payload.service_repay_method,
            payload.extension_yn,
            payload.launch_date,
            payload.expire_date,
            payload.repayment_count,
            payload.repay_amount,
            payload.mid_repay_yn,
            payload.b2b_firm_name,
            payload.product_type,
        ),
    )


def _build_prizm_config_filters(
    *,
    division: PrizmConfigDivision,
    subject_no: int | None,
    item_name: str | None,
) -> tuple[str, list[object]]:
    filters = []
    params: list[object] = []

    if division != "all":
        filters.append("division = %s")
        params.append(int(division))

    if subject_no is not None:
        filters.append("subject_no = %s")
        params.append(subject_no)

    if item_name:
        filters.append("item_nm ilike %s")
        params.append(f"%{item_name}%")

    if not filters:
        return "", params

    return "where " + " and ".join(filters), params


def _prizm_config_select_query() -> str:
    return """
        select
            division,
            case division
                when 1 then 'Prizm'
                when 2 then 'CRA'
                else 'Division ' || division::text
            end as division_label,
            subject_no,
            '주제 ' || subject_no::text as subject_name,
            item_no,
            item_nm,
            item_definition,
            item_weight,
            item_standard_low1,
            item_standard_high1,
            item_standard_low2,
            item_standard_high2,
            item_standard_low3,
            item_standard_high3,
            item_standard_low4,
            item_standard_high4,
            item_standard_low5,
            item_standard_high5,
            case
                when nullif(item_definition, '') is null or nullif(item_weight, '') is null then '기본값 미완성'
                when nullif(item_standard_low1, '') is null or nullif(item_standard_high1, '') is null then '구간값 확인'
                else '설정완료'
            end as config_status_label
        from prizm_items
    """


def list_prizm_config_items(
    limit: int,
    offset: int,
    *,
    division: PrizmConfigDivision = "all",
    subject_no: int | None = None,
    item_name: str | None = None,
) -> PrizmConfigListResponse:
    where_clause, filter_params = _build_prizm_config_filters(
        division=division,
        subject_no=subject_no,
        item_name=item_name,
    )
    base_query = _prizm_config_select_query()

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                with item_base as (
                    {base_query}
                )
                select
                    count(*)::int as total_count,
                    count(*) filter (where division = 1)::int as prizm_count,
                    count(*) filter (where division = 2)::int as cra_count,
                    count(*) filter (
                        where nullif(item_definition, '') is null
                           or nullif(item_weight, '') is null
                           or nullif(item_standard_low1, '') is null
                           or nullif(item_standard_high1, '') is null
                    )::int as incomplete_count
                from item_base
                {where_clause}
                """,
                filter_params,
            )
            counts = cursor.fetchone()

            cursor.execute(
                f"""
                with item_base as (
                    {base_query}
                ),
                ordered as (
                    select *
                    from item_base
                    {where_clause}
                    order by division, subject_no, item_no
                )
                select
                    row_number() over (order by division, subject_no, item_no)::int + %s as row_no,
                    *
                from ordered
                limit %s offset %s
                """,
                (*filter_params, offset, limit, offset),
            )
            rows = cursor.fetchall()

    return PrizmConfigListResponse(
        limit=limit,
        offset=offset,
        counts=PrizmConfigCounts(**counts),
        items=[PrizmConfigItem(**row) for row in rows],
    )


def get_prizm_config_item(division: int, subject_no: int, item_no: int) -> PrizmConfigItem | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                with item_base as (
                    {_prizm_config_select_query()}
                )
                select 1 as row_no, *
                from item_base
                where division = %s
                  and subject_no = %s
                  and item_no = %s
                """,
                (division, subject_no, item_no),
            )
            row = cursor.fetchone()

    return PrizmConfigItem(**row) if row else None


def update_prizm_config_item(
    division: int,
    subject_no: int,
    item_no: int,
    payload: PrizmConfigUpdateRequest,
) -> PrizmConfigUpdateResponse | None:
    before = get_prizm_config_item(division, subject_no, item_no)
    if before is None:
        return None

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                update prizm_items
                set
                    item_definition = %s,
                    item_weight = %s,
                    item_standard_low1 = %s,
                    item_standard_high1 = %s,
                    item_standard_low2 = %s,
                    item_standard_high2 = %s,
                    item_standard_low3 = %s,
                    item_standard_high3 = %s,
                    item_standard_low4 = %s,
                    item_standard_high4 = %s,
                    item_standard_low5 = %s,
                    item_standard_high5 = %s
                where division = %s
                  and subject_no = %s
                  and item_no = %s
                """,
                (
                    payload.item_definition,
                    payload.item_weight,
                    payload.item_standard_low1,
                    payload.item_standard_high1,
                    payload.item_standard_low2,
                    payload.item_standard_high2,
                    payload.item_standard_low3,
                    payload.item_standard_high3,
                    payload.item_standard_low4,
                    payload.item_standard_high4,
                    payload.item_standard_low5,
                    payload.item_standard_high5,
                    division,
                    subject_no,
                    item_no,
                ),
            )

            after_payload = payload.model_dump(exclude={"admin_id", "update_memo"})
            cursor.execute(
                """
                insert into prizm_item_update_record (
                    division,
                    subject_no,
                    item_no,
                    item_name,
                    admin_id,
                    update_memo,
                    before_payload,
                    after_payload,
                    reg_date
                )
                values (%s, %s, %s, %s, %s, %s, %s, %s, now())
                """,
                (
                    division,
                    subject_no,
                    item_no,
                    before.item_nm,
                    payload.admin_id,
                    payload.update_memo,
                    Jsonb(before.model_dump(mode="json")),
                    Jsonb(after_payload),
                ),
            )

    return PrizmConfigUpdateResponse(
        action="updated",
        division=division,
        subject_no=subject_no,
        item_no=item_no,
        item=get_prizm_config_item(division, subject_no, item_no),
    )


def list_prizm_config_update_records(
    limit: int,
    offset: int,
    *,
    division: PrizmConfigDivision = "all",
) -> PrizmConfigUpdateRecordResponse:
    where_clause = ""
    params: list[object] = []
    if division != "all":
        where_clause = "where division = %s"
        params.append(int(division))

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                select count(*)::int as total
                from prizm_item_update_record
                {where_clause}
                """,
                params,
            )
            total = cursor.fetchone()["total"]

            cursor.execute(
                f"""
                select
                    record_id,
                    division,
                    subject_no,
                    item_no,
                    item_name,
                    admin_id,
                    update_memo,
                    before_payload,
                    after_payload,
                    reg_date
                from prizm_item_update_record
                {where_clause}
                order by reg_date desc, record_id desc
                limit %s offset %s
                """,
                (*params, limit, offset),
            )
            rows = cursor.fetchall()

    return PrizmConfigUpdateRecordResponse(
        limit=limit,
        offset=offset,
        total=total,
        items=[PrizmConfigUpdateRecord(**row) for row in rows],
    )


def _raw_data_table_type(table_name: str) -> str:
    name = table_name.lower()
    if "sale" in name or "order" in name:
        return "00"
    if "return" in name:
        return "01"
    if "settlement" in name or "withdraw" in name:
        return "02"
    if "goods" in name or "product" in name:
        return "03"
    if "stock" in name:
        return "04"
    return "99"


def list_raw_data_tables() -> list[RawDataTableOption]:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select table_name
                from information_schema.tables
                where table_schema = current_schema()
                  and table_type = 'BASE TABLE'
                  and table_name not like 'pg_%'
                  and table_name not like 'sql_%'
                order by table_name
                """
            )
            rows = cursor.fetchall()

    options = []
    for row in rows:
        table_name = row["table_name"]
        table_type = _raw_data_table_type(table_name)
        if table_type != "99":
            options.append(
                RawDataTableOption(
                    table_name=table_name,
                    table_label=table_name,
                    table_type=table_type,
                )
            )
    return options


def list_raw_data_columns(table_name: str) -> list[RawDataColumnOption]:
    _ensure_raw_data_table_exists(table_name)
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select column_name, data_type
                from information_schema.columns
                where table_schema = current_schema()
                  and table_name = %s
                order by ordinal_position
                """,
                (table_name,),
            )
            rows = cursor.fetchall()

    return [
        RawDataColumnOption(
            column_name=row["column_name"],
            column_label=row["column_name"],
            data_type=row["data_type"],
        )
        for row in rows
    ]


def list_raw_data_formulas(
    *,
    raw_data_id: str | None = None,
    raw_data_shop: str | None = None,
) -> list[RawDataFormulaItem]:
    filters = ["raw_data_division = '05'"]
    params: list[object] = []
    if raw_data_id:
        filters.append("raw_data_id = %s")
        params.append(raw_data_id)
    if raw_data_shop:
        filters.append("raw_data_shop = %s")
        params.append(raw_data_shop)

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                select
                    raw_data_no,
                    raw_data_division,
                    raw_data_id,
                    raw_data_shop,
                    raw_data_title,
                    raw_data_content,
                    case
                        when raw_data_shop is null or raw_data_shop = '' then '테이블 미지정'
                        when to_regclass(raw_data_shop) is null then '테이블 없음'
                        when raw_data_content is null or raw_data_content = '' then '공식 미입력'
                        else '공식 등록'
                    end as formula_status_label,
                    reg_date,
                    update_date
                from prizm_raw_data_formula
                where {" and ".join(filters)}
                order by raw_data_no desc
                """,
                params,
            )
            rows = cursor.fetchall()

    return [RawDataFormulaItem(**row) for row in rows]


def get_raw_data_formula(raw_data_no: int) -> RawDataFormulaItem | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select
                    raw_data_no,
                    raw_data_division,
                    raw_data_id,
                    raw_data_shop,
                    raw_data_title,
                    raw_data_content,
                    case
                        when raw_data_shop is null or raw_data_shop = '' then '테이블 미지정'
                        when to_regclass(raw_data_shop) is null then '테이블 없음'
                        when raw_data_content is null or raw_data_content = '' then '공식 미입력'
                        else '공식 등록'
                    end as formula_status_label,
                    reg_date,
                    update_date
                from prizm_raw_data_formula
                where raw_data_no = %s
                """,
                (raw_data_no,),
            )
            row = cursor.fetchone()

    return RawDataFormulaItem(**row) if row else None


def create_raw_data_formula(payload: RawDataFormulaWriteRequest) -> RawDataFormulaWriteResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                insert into prizm_raw_data_formula (
                    raw_data_division,
                    raw_data_id,
                    raw_data_shop,
                    raw_data_title,
                    raw_data_content,
                    reg_date
                )
                values ('05', %s, %s, %s, %s, now())
                returning raw_data_no
                """,
                (
                    payload.raw_data_id,
                    payload.raw_data_shop,
                    payload.raw_data_title,
                    payload.raw_data_content,
                ),
            )
            raw_data_no = cursor.fetchone()["raw_data_no"]

    return RawDataFormulaWriteResponse(action="created", raw_data_no=raw_data_no, formula=get_raw_data_formula(raw_data_no))


def update_raw_data_formula(raw_data_no: int, payload: RawDataFormulaWriteRequest) -> RawDataFormulaWriteResponse | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                update prizm_raw_data_formula
                set
                    raw_data_id = %s,
                    raw_data_shop = %s,
                    raw_data_title = %s,
                    raw_data_content = %s,
                    update_date = now()
                where raw_data_no = %s
                returning raw_data_no
                """,
                (
                    payload.raw_data_id,
                    payload.raw_data_shop,
                    payload.raw_data_title,
                    payload.raw_data_content,
                    raw_data_no,
                ),
            )
            row = cursor.fetchone()
            if not row:
                return None

    return RawDataFormulaWriteResponse(action="updated", raw_data_no=raw_data_no, formula=get_raw_data_formula(raw_data_no))


def delete_raw_data_formula(raw_data_no: int) -> RawDataFormulaWriteResponse | None:
    existing = get_raw_data_formula(raw_data_no)
    if existing is None:
        return None

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("delete from prizm_raw_data_formula where raw_data_no = %s", (raw_data_no,))

    return RawDataFormulaWriteResponse(action="deleted", raw_data_no=raw_data_no, formula=None)


def preview_raw_data(payload: RawDataPreviewRequest) -> RawDataPreviewResponse:
    available_columns = list_raw_data_columns(payload.table_name)
    available_column_names = {column.column_name for column in available_columns}
    requested_columns = [column for column in payload.columns if column in available_column_names]
    if not requested_columns:
        return RawDataPreviewResponse(table_name=payload.table_name, columns=[], rows=[])

    selected_columns = [column for column in available_columns if column.column_name in requested_columns]

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            query = sql.SQL("select {fields} from {table} limit {limit}").format(
                fields=sql.SQL(", ").join(sql.Identifier(column) for column in requested_columns),
                table=sql.Identifier(payload.table_name),
                limit=sql.Literal(payload.limit),
            )
            cursor.execute(query)
            rows = cursor.fetchall()

    return RawDataPreviewResponse(
        table_name=payload.table_name,
        columns=selected_columns,
        rows=[dict(row) for row in rows],
    )


def _ensure_raw_data_table_exists(table_name: str) -> None:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                select exists(
                    select 1
                    from information_schema.tables
                    where table_schema = current_schema()
                      and table_type = 'BASE TABLE'
                      and table_name = %s
                )
                """,
                (table_name,),
            )
            exists = bool(cursor.fetchone()[0])
    if not exists:
        raise ValueError("raw data table not found")
