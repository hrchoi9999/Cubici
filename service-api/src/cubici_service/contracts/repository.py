"""Contract queries and user request commands."""

from datetime import date, datetime
import json
from typing import Literal

from fastapi import HTTPException
from psycopg.rows import dict_row
from pydantic import BaseModel, Field

from cubici_service.core.shop_types import normalize_shop_types
from cubici_service.db.connection import get_connection
from cubici_service.redemptions.repository import RedemptionListItem
from cubici_service.risk_results.repository import RiskResultListItem


class ContractListItem(BaseModel):
    mbid: str
    user_no: int | None
    user_email: str | None = None
    user_name: str | None = None
    firm_name: str | None = None
    fintech_id: int | None
    product_code: str | None
    status: str | None
    request_date: datetime | None
    approval_date: datetime | None
    agree_date: datetime | None
    contract_date: datetime | None
    expire_date: datetime | None
    cancel_request_date: datetime | None
    reg_no_first: str | None
    reg_no_second: str | None
    sales_amount: int | None
    payer_number: str | None
    payer_status: str | None
    demand_acc_bank_code: str | None
    demand_acc_holder: str | None
    demand_acc_number: str | None
    main_acc_bank_code: str | None
    main_acc_holder: str | None
    main_acc_number: str | None
    identity_verification_method: str | None = None
    identity_verification_status: str | None = None
    identity_verification_reference: str | None = None
    identity_verified_at: datetime | None = None
    electronic_signature_method: str | None = None
    electronic_signature_status: str | None = None
    electronic_signature_reference: str | None = None
    electronic_signed_at: datetime | None = None
    contract_shop_count: int
    request_shop: int = 0
    sub_complete: str = "N"
    document_file_count: int = 0
    prizm_score: str | None = None
    contract_fee_count: int
    latest_payment_rate: int | None = None
    latest_fee_rate: float | None = None
    reg_date: datetime | None
    modified_date: datetime | None


class ContractListResponse(BaseModel):
    limit: int
    offset: int
    total: int
    items: list[ContractListItem]


class ContractShopItem(BaseModel):
    id: int
    mbid: str
    contract_shop_type: str | None
    contract_shop_id: str | None
    reg_date: datetime | None
    modified_date: datetime | None


class ContractFeeRateItem(BaseModel):
    id: int
    contract_fee_id: int | None
    fee_type: str | None
    fee_rate: float | None
    reg_date: datetime | None
    modified_date: datetime | None


class ContractFeeItem(BaseModel):
    id: int
    mbid: str
    payment_rate: int | None
    sales_limit_per_order: int | None
    max_outstanding_balance: int | None
    created_by: str | None
    reg_date: datetime | None
    last_modified_by: str | None
    modified_date: datetime | None
    rates: list[ContractFeeRateItem]


class ContractCertificateItem(BaseModel):
    mbid: str
    user_no: int | None
    certificate: str | None
    private_key: str | None
    password: str | None
    expiration_date: date | None
    reg_date: datetime | None
    modified_date: datetime | None


class ContractDocumentItem(BaseModel):
    mbid: str
    business_no: str | None
    business_start_date: str | None
    tax_type: str | None
    cb_score_current: int | None
    cb_score_rank: int | None
    cb_score_past: int | None
    debt_status: str | None
    financial_disorder_status: str | None
    public_information_status: str | None
    overdue_status: str | None
    cb_check: str | None
    national_tax_full_payment: str | None
    local_tax_full_payment: str | None
    health_insurance_full_payment: str | None
    health_insurance_paid_amount: int | None
    cb_confirm_admin: str | None
    final_confirm_admin: str | None
    reg_date: datetime | None
    modified_date: datetime | None


class ContractDetailResponse(BaseModel):
    contract: ContractListItem
    shops: list[ContractShopItem]
    fees: list[ContractFeeItem]
    certificate: ContractCertificateItem | None
    document: ContractDocumentItem | None
    redemption: RedemptionListItem | None
    risk_result: RiskResultListItem | None


ContractOrderBy = Literal["request_date_desc", "request_date_asc", "sales_amount_desc", "sales_amount_asc"]
ContractStatusAction = Literal[
    "approve",
    "reject",
    "cancel",
    "request_termination",
    "force_termination",
    "account_closed",
    "document_pending",
    "document_ready",
    "present_terms",
    "agree_terms",
    "refuse_terms",
    "contract_ready",
]
MONTH_CODE_BY_NUMBER = "ABCDEFGHIJKL"
DOCUMENT_REVIEW_READY_STATUS_KEYS = {"JOIN", "REQUEST", "PENDING_DOCUMENTS", "DOCUMENTS_CONFIRMED", "00", "01", "02"}
DOCUMENT_PENDING_STATUS_KEYS = {"JOIN", "REQUEST", "PENDING_REVIEW", "DOCUMENTS_CONFIRMED", "01", "02", "03"}
TERMS_PRESENTABLE_STATUS_KEYS = {"JOIN", "REQUEST", "PENDING_REVIEW", "01", "02", "03"}
TERMS_DECISION_STATUS_KEYS = {"CONDITIONS_ACCEPT", "04"}
CONTRACT_READY_STATUS_KEYS = {"USE_AGREE", "05"}
REJECTABLE_CONTRACT_STATUS_KEYS = {
    "JOIN",
    "REQUEST",
    "PENDING_REVIEW",
    "PENDING_DOCUMENTS",
    "DOCUMENTS_CONFIRMED",
    "CONDITIONS_ACCEPT",
    "00",
    "01",
    "02",
    "03",
    "04",
}
CANCELABLE_CONTRACT_STATUS_KEYS = {"ACCOUNT_STANDBY", "CONTRACT", "06", "81"}
TERMINATION_REQUEST_STATUS_KEYS = {"TERMINATION_REQUEST", "71"}
TERMINATED_CONTRACT_STATUS_KEYS = {"SELF_TERMINATION", "FORCE_TERMINATION", "ACCOUNT_CLOSED", "72", "73", "82"}
CONTRACT_STATUS_ACTION_MAP: dict[str, str] = {
    "approve": "PENDING_REVIEW",
    "reject": "REJECTED",
    "cancel": "SELF_TERMINATION",
    "request_termination": "TERMINATION_REQUEST",
    "force_termination": "FORCE_TERMINATION",
    "account_closed": "ACCOUNT_CLOSED",
    "document_pending": "PENDING_DOCUMENTS",
    "document_ready": "PENDING_REVIEW",
    "present_terms": "CONDITIONS_ACCEPT",
    "agree_terms": "USE_AGREE",
    "refuse_terms": "TERMS_REFUSED",
    "contract_ready": "ACCOUNT_STANDBY",
}


class ContractStatusUpdateRequest(BaseModel):
    action: ContractStatusAction
    changed_by: str = Field(min_length=1, max_length=50)
    reason: str | None = Field(default=None, max_length=2000)


class ContractStatusUpdateResponse(BaseModel):
    mbid: str
    previous_status: str | None
    new_status: str
    action: ContractStatusAction
    changed_by: str
    reason: str | None
    approval_date: datetime | None
    agree_date: datetime | None = None
    contract_date: datetime | None = None
    cancel_request_date: datetime | None
    modified_date: datetime | None


class ContractElectronicSignatureRequest(BaseModel):
    signed_by: str = Field(min_length=1, max_length=50)
    signature_method: Literal["mock_certificate"] = "mock_certificate"
    signature_reference: str | None = Field(default=None, max_length=100)
    reason: str | None = Field(default=None, max_length=2000)


class ContractElectronicSignatureResponse(BaseModel):
    mbid: str
    previous_status: str | None
    new_status: str
    signature_method: str
    signature_status: str
    signature_reference: str
    signed_by: str
    electronic_signed_at: datetime
    contract_date: datetime | None
    modified_date: datetime | None


class ContractFeeRateAdjustmentItem(BaseModel):
    fee_type: str = Field(min_length=1, max_length=50)
    fee_rate: float = Field(ge=0)


class ContractFeeAdjustmentRequest(BaseModel):
    adjusted_by: str = Field(min_length=1, max_length=50)
    reason: str = Field(min_length=1, max_length=2000)
    payment_rate: int | None = Field(default=None, ge=0)
    sales_limit_per_order: int | None = Field(default=None, ge=0)
    max_outstanding_balance: int | None = Field(default=None, ge=0)
    fee_rates: list[ContractFeeRateAdjustmentItem] = Field(default_factory=list)


class ContractFeeAdjustmentResponse(BaseModel):
    mbid: str
    contract_fee_id: int
    adjusted_by: str
    reason: str
    history_id: int
    fee: ContractFeeItem


class ContractRequestCreateRequest(BaseModel):
    user_no: int = Field(ge=1)
    request_shop_types: list[str] = Field(min_length=1, max_length=20)
    product_code: str = Field(default="MP", min_length=2, max_length=2)
    fintech_id: int | None = Field(default=None, ge=1)
    sales_amount: int = Field(default=0, ge=0)
    representative_age: int | None = Field(default=None, ge=0, le=120)
    reg_no_first: str | None = Field(default=None, max_length=30)
    reg_no_second: str | None = Field(default=None, max_length=30)
    demand_acc_bank_code: str | None = Field(default=None, max_length=20)
    demand_acc_holder: str | None = Field(default=None, max_length=100)
    demand_acc_number: str | None = Field(default=None, max_length=100)
    main_acc_bank_code: str | None = Field(default=None, max_length=20)
    main_acc_holder: str | None = Field(default=None, max_length=100)
    main_acc_number: str | None = Field(default=None, max_length=100)
    identity_confirmed: bool = False
    identity_verification_method: Literal["id_card", "driver_license", "mock"] | None = None
    identity_verification_status: Literal["mock_verified", "verified"] | None = None
    identity_verification_reference: str | None = Field(default=None, max_length=100)
    terms_agreed: bool = False
    submitted_document_types: list[str] = Field(default_factory=list, max_length=20)
    requested_by: str = Field(default="user-web", min_length=1, max_length=50)


class ContractRequestCreateResponse(BaseModel):
    insert_code: int
    message: str
    mbid: str
    user_no: int
    product_code: str
    status: str
    request_date: datetime
    shop_count: int
    requested_shop_types: list[str]


def _build_contract_filters(
    *,
    user_no: int | None,
    user_id: str | None,
    user_name: str | None,
    firm_name: str | None,
    status: str | None,
    product_code: str | None,
    min_sales_amount: int | None,
    max_sales_amount: int | None,
    from_date: date | None,
    to_date: date | None,
) -> tuple[str, list[object]]:
    clauses = []
    params: list[object] = []

    if user_no is not None:
        clauses.append("c.user_no = %s")
        params.append(user_no)
    if user_id:
        clauses.append("u.email ilike %s")
        params.append(f"%{user_id}%")
    if user_name:
        clauses.append("u.name ilike %s")
        params.append(f"%{user_name}%")
    if firm_name:
        clauses.append("u.biz_name ilike %s")
        params.append(f"%{firm_name}%")
    if status:
        clauses.append("c.status = %s")
        params.append(status)
    if product_code:
        clauses.append("c.product_code = %s")
        params.append(product_code)
    if min_sales_amount is not None:
        clauses.append("c.sales_amount >= %s")
        params.append(min_sales_amount)
    if max_sales_amount is not None:
        clauses.append("c.sales_amount <= %s")
        params.append(max_sales_amount)
    if from_date is not None:
        clauses.append("c.request_date >= %s")
        params.append(from_date)
    if to_date is not None:
        clauses.append("c.request_date < (%s::date + interval '1 day')")
        params.append(to_date)

    if not clauses:
        return "", params

    return " where " + " and ".join(clauses), params


def _contract_order_by(order_by: ContractOrderBy) -> str:
    order_map = {
        "request_date_desc": "c.request_date desc nulls last, c.mbid desc",
        "request_date_asc": "c.request_date asc nulls last, c.mbid asc",
        "sales_amount_desc": "c.sales_amount desc nulls last, c.request_date desc nulls last, c.mbid desc",
        "sales_amount_asc": "c.sales_amount asc nulls last, c.request_date desc nulls last, c.mbid desc",
    }
    return order_map[order_by]


def list_contracts(
    limit: int,
    offset: int,
    *,
    user_no: int | None = None,
    user_id: str | None = None,
    user_name: str | None = None,
    firm_name: str | None = None,
    status: str | None = None,
    product_code: str | None = None,
    min_sales_amount: int | None = None,
    max_sales_amount: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    order_by: ContractOrderBy = "request_date_desc",
) -> ContractListResponse:
    where_clause, filter_params = _build_contract_filters(
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
    )
    order_clause = _contract_order_by(order_by)

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                select count(*) as total
                from moneybank_contract c
                left join users u on u.user_no = c.user_no
                {where_clause}
                """,
                filter_params,
            )
            total = cursor.fetchone()["total"]

            cursor.execute(
                f"""
                select
                    c.mbid,
                    c.user_no,
                    u.email as user_email,
                    u.name as user_name,
                    u.biz_name as firm_name,
                    c.fintech_id,
                    c.product_code,
                    c.status,
                    c.request_date,
                    c.approval_date,
                    c.agree_date,
                    c.contract_date,
                    c.expire_date,
                    c.cancel_request_date,
                    c.reg_no_first,
                    c.reg_no_second,
                    c.sales_amount,
                    c.payer_number,
                    c.payer_status,
                    c.demand_acc_bank_code,
                    c.demand_acc_holder,
                    c.demand_acc_number,
                    c.main_acc_bank_code,
                    c.main_acc_holder,
                    c.main_acc_number,
                    c.identity_verification_method,
                    c.identity_verification_status,
                    c.identity_verification_reference,
                    c.identity_verified_at,
                    c.electronic_signature_method,
                    c.electronic_signature_status,
                    c.electronic_signature_reference,
                    c.electronic_signed_at,
                    coalesce(cs.contract_shop_count, 0)::int as contract_shop_count,
                    coalesce(cs.contract_shop_count, 0)::int as request_shop,
                    case
                        when cd.final_confirm_admin is not null then 'Y'
                        when cd.cb_check = '1' and cd.national_tax_full_payment = '1'
                         and cd.local_tax_full_payment = '1' and cd.health_insurance_full_payment = '1' then 'Y'
                        else 'N'
                    end as sub_complete,
                    coalesce(df.document_file_count, 0)::int as document_file_count,
                    pcs.prizm_grade as prizm_score,
                    coalesce(cf.contract_fee_count, 0)::int as contract_fee_count,
                    latest_fee.payment_rate as latest_payment_rate,
                    latest_fee.latest_fee_rate,
                    c.reg_date,
                    c.modified_date
                from moneybank_contract c
                left join users u on u.user_no = c.user_no
                left join (
                    select mbid, count(*) as contract_shop_count
                    from moneybank_contract_shop
                    group by mbid
                ) cs on cs.mbid = c.mbid
                left join (
                    select mbid, count(*) as contract_fee_count
                    from moneybank_contract_fee
                    group by mbid
                ) cf on cf.mbid = c.mbid
                left join (
                    select
                        fee.mbid,
                        fee.payment_rate,
                        rate.latest_fee_rate
                    from (
                        select distinct on (mbid)
                            id,
                            mbid,
                            payment_rate
                        from moneybank_contract_fee
                        order by mbid, id desc
                    ) fee
                    left join (
                        select contract_fee_id, avg(fee_rate)::float as latest_fee_rate
                        from moneybank_contract_fee_rates
                        group by contract_fee_id
                    ) rate on rate.contract_fee_id = fee.id
                ) latest_fee on latest_fee.mbid = c.mbid
                left join moneybank_contract_document cd on cd.mbid = c.mbid
                left join (
                    select file_division_pk as mbid, count(*) as document_file_count
                    from "CBCI_FILE"
                    group by file_division_pk
                ) df on df.mbid = c.mbid
                left join (
                    select distinct on (mbid, user_no)
                        mbid,
                        user_no,
                        prizm_grade
                    from prizm_pcs_result
                    order by mbid, user_no, reg_date desc nulls last, pcs_no desc
                ) pcs on pcs.mbid = c.mbid and pcs.user_no is not distinct from c.user_no
                {where_clause}
                order by {order_clause}
                limit %s offset %s
                """,
                (*filter_params, limit, offset),
            )
            rows = cursor.fetchall()

    return ContractListResponse(
        limit=limit,
        offset=offset,
        total=total,
        items=[ContractListItem(**row) for row in rows],
    )


def create_contract_request(payload: ContractRequestCreateRequest) -> ContractRequestCreateResponse:
    product_code = payload.product_code.strip().upper()
    requested_shop_types = _normalize_shop_types(payload.request_shop_types)
    if not requested_shop_types:
        raise HTTPException(status_code=422, detail="request_shop_types is required")
    _validate_contract_request_policy(payload)

    with get_connection() as connection:
        with connection.transaction():
            with connection.cursor(row_factory=dict_row) as cursor:
                user = _fetch_user_for_request(cursor, payload.user_no)
                if user is None:
                    raise HTTPException(status_code=404, detail="user not found")
                _validate_contract_request_eligibility(user, payload)

                cursor.execute(
                    """
                    select mbid
                    from moneybank_contract
                    where user_no = %s
                      and product_code = %s
                      and coalesce(status, '') in ('REQUEST', 'PENDING_REVIEW', 'PENDING_DOCUMENTS')
                    order by request_date desc nulls last, mbid desc
                    limit 1
                    """,
                    (payload.user_no, product_code),
                )
                duplicate = cursor.fetchone()
                if duplicate is not None:
                    raise HTTPException(
                        status_code=409,
                        detail=f"already requested: {duplicate['mbid'].strip()}",
                    )

                shop_accounts = _fetch_request_shop_accounts(
                    cursor,
                    user_no=payload.user_no,
                    shop_types=requested_shop_types,
                )
                if not shop_accounts:
                    raise HTTPException(
                        status_code=422,
                        detail="no connected shop accounts for request_shop_types",
                    )
                found_shop_types = {shop["shop_type"] for shop in shop_accounts}
                missing_shop_types = [shop_type for shop_type in requested_shop_types if shop_type not in found_shop_types]
                if missing_shop_types:
                    raise HTTPException(
                        status_code=422,
                        detail=f"shop accounts not connected: {','.join(missing_shop_types)}",
                    )

                cursor.execute("lock table moneybank_contract in share row exclusive mode")
                mbid = _create_next_mbid(cursor, product_code)
                reg_no_first = _first_non_empty(payload.reg_no_first, user["biz_num"], "NOT_PROVIDED")
                reg_no_second = payload.reg_no_second.strip() if payload.reg_no_second else None
                fintech_id = payload.fintech_id if payload.fintech_id is not None else user["fintech_id"]
                identity_method = payload.identity_verification_method if payload.identity_confirmed else None
                identity_status = payload.identity_verification_status if payload.identity_confirmed else None
                identity_reference = (
                    _clean_optional_text(payload.identity_verification_reference)
                    if payload.identity_confirmed
                    else None
                )
                identity_verified_at = datetime.now() if identity_status else None

                cursor.execute(
                    """
                    insert into moneybank_contract (
                        mbid,
                        user_no,
                        fintech_id,
                        product_code,
                        status,
                        request_date,
                        reg_no_first,
                        reg_no_second,
                        sales_amount,
                        demand_acc_bank_code,
                        demand_acc_holder,
                        demand_acc_number,
                        main_acc_bank_code,
                        main_acc_holder,
                        main_acc_number,
                        identity_verification_method,
                        identity_verification_status,
                        identity_verification_reference,
                        identity_verified_at,
                        reg_date,
                        modified_date
                    ) values (
                        %s, %s, %s, %s, 'REQUEST', now(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                        %s, now(), now()
                    )
                    returning mbid, user_no, product_code, status, request_date
                    """,
                    (
                        mbid,
                        payload.user_no,
                        fintech_id,
                        product_code,
                        reg_no_first,
                        reg_no_second,
                        payload.sales_amount,
                        _clean_optional_text(payload.demand_acc_bank_code),
                        _clean_optional_text(payload.demand_acc_holder),
                        _clean_optional_text(payload.demand_acc_number),
                        _clean_optional_text(payload.main_acc_bank_code),
                        _clean_optional_text(payload.main_acc_holder),
                        _clean_optional_text(payload.main_acc_number),
                        identity_method,
                        identity_status,
                        identity_reference,
                        identity_verified_at,
                    ),
                )
                created = cursor.fetchone()

                next_shop_id = _next_contract_shop_id(cursor)
                for index, shop in enumerate(shop_accounts):
                    cursor.execute(
                        """
                        insert into moneybank_contract_shop (
                            id,
                            mbid,
                            contract_shop_type,
                            contract_shop_id,
                            reg_date,
                            modified_date
                        ) values (
                            %s, %s, %s, %s, now(), now()
                        )
                        """,
                        (
                            next_shop_id + index,
                            mbid,
                            shop["shop_type"],
                            shop["shop_id"],
                        ),
                    )

                cursor.execute(
                    """
                    insert into contract_status_history (
                        mbid,
                        previous_status,
                        new_status,
                        action,
                        changed_by,
                        reason,
                        reg_date
                    ) values (
                        %s, null, 'REQUEST', 'create_request', %s, %s, now()
                    )
                    """,
                    (
                        mbid,
                        payload.requested_by,
                        f"user request shops={','.join(requested_shop_types)}",
                    ),
                )

    return ContractRequestCreateResponse(
        insert_code=0,
        message="신청 되었습니다!",
        mbid=created["mbid"].strip(),
        user_no=created["user_no"],
        product_code=created["product_code"].strip(),
        status=created["status"],
        request_date=created["request_date"],
        shop_count=len(shop_accounts),
        requested_shop_types=requested_shop_types,
    )


REQUIRED_CONTRACT_DOCUMENT_TYPES = {"regNo", "CBInfo"}


def _validate_contract_request_policy(payload: ContractRequestCreateRequest) -> None:
    failed_reasons: list[str] = []

    if not payload.identity_confirmed:
        failed_reasons.append("identity_confirmed")
    elif not payload.identity_verification_method or not payload.identity_verification_status:
        failed_reasons.append("identity_verification")

    if not payload.terms_agreed:
        failed_reasons.append("terms_agreed")

    submitted_types = {item.strip() for item in payload.submitted_document_types if item and item.strip()}
    missing_document_types = sorted(REQUIRED_CONTRACT_DOCUMENT_TYPES - submitted_types)
    if missing_document_types:
        failed_reasons.append(f"required_documents:{','.join(missing_document_types)}")

    if failed_reasons:
        raise HTTPException(
            status_code=422,
            detail=f"moneybank request policy not satisfied: {';'.join(failed_reasons)}",
        )


def get_contract_detail(mbid: str, *, user_no: int | None = None) -> ContractDetailResponse | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            contract = _fetch_contract(cursor, mbid, user_no=user_no)
            if contract is None:
                return None

            shops = _fetch_contract_shops(cursor, mbid)
            fees = _fetch_contract_fees(cursor, mbid)
            certificate = _fetch_contract_certificate(cursor, mbid)
            document = _fetch_contract_document(cursor, mbid)
            redemption = _fetch_contract_redemption(cursor, mbid)
            risk_result = _fetch_contract_risk_result(cursor, mbid)

    return ContractDetailResponse(
        contract=ContractListItem(**contract),
        shops=[ContractShopItem(**row) for row in shops],
        fees=fees,
        certificate=ContractCertificateItem(**certificate) if certificate else None,
        document=ContractDocumentItem(**document) if document else None,
        redemption=RedemptionListItem(**redemption) if redemption else None,
        risk_result=RiskResultListItem(**risk_result) if risk_result else None,
    )


def _normalize_shop_types(values: list[str]) -> list[str]:
    return normalize_shop_types(values)


def _clean_optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def _fetch_user_for_request(cursor, user_no: int) -> dict | None:
    cursor.execute(
        """
        select
            user_no,
            user_type,
            biz_num,
            biz_setup_date,
            biz_type,
            sectors,
            fintech_id
        from users
        where user_no = %s
        for update
        """,
        (user_no,),
    )
    return cursor.fetchone()


def _validate_contract_request_eligibility(user: dict, payload: ContractRequestCreateRequest) -> None:
    failed_reasons: list[str] = []

    if (user.get("user_type") or "").strip().upper() != "USER":
        failed_reasons.append("active_user")

    if not _has_text(user.get("biz_num")):
        failed_reasons.append("business_number")

    setup_date = _parse_legacy_date(user.get("biz_setup_date"))
    one_year_ago = _one_year_ago(datetime.now().date())
    if setup_date is None or setup_date > one_year_ago:
        failed_reasons.append("business_period_1y")

    biz_type = (user.get("biz_type") or "").strip().upper()
    if biz_type == "CORPORATE" or not biz_type:
        failed_reasons.append("individual_business")

    sectors = (user.get("sectors") or "").strip().upper()
    if sectors == "13":
        failed_reasons.append("business_sector")

    if payload.representative_age is not None and payload.representative_age < 20:
        failed_reasons.append("representative_age_20")

    if failed_reasons:
        raise HTTPException(
            status_code=422,
            detail=f"not eligible for moneybank request: {','.join(failed_reasons)}",
        )


def _fetch_request_shop_accounts(cursor, *, user_no: int, shop_types: list[str]) -> list[dict]:
    cursor.execute(
        """
        select distinct on (upper(shop_type))
            upper(shop_type) as shop_type,
            shop_id
        from shop_accounts
        where user_no = %s
          and upper(shop_type) = any(%s)
          and coalesce(del_yn, 'N') <> 'Y'
        order by upper(shop_type), modified_date desc nulls last, reg_date desc nulls last, id desc
        """,
        (user_no, shop_types),
    )
    return [dict(row) for row in cursor.fetchall()]


def _parse_legacy_date(value: str | None) -> date | None:
    if value is None:
        return None
    cleaned = "".join(ch for ch in value.strip() if ch.isdigit())
    if len(cleaned) == 4:
        cleaned = f"{cleaned}0101"
    if len(cleaned) != 8:
        return None
    try:
        return datetime.strptime(cleaned, "%Y%m%d").date()
    except ValueError:
        return None


def _one_year_ago(base_date: date) -> date:
    try:
        return base_date.replace(year=base_date.year - 1)
    except ValueError:
        return base_date.replace(year=base_date.year - 1, day=28)


def _has_text(value: str | None) -> bool:
    return value is not None and bool(value.strip())


def _create_next_mbid(cursor, product_code: str) -> str:
    now = datetime.now()
    month_code = MONTH_CODE_BY_NUMBER[now.month - 1]
    day_year = now.strftime("%d%y")
    cursor.execute(
        """
        with candidate_mbid as (
            select mbid
            from moneybank_contract
            where mbid like %s
              and mbid ~ %s
            union
            select file_division_pk as mbid
            from "CBCI_FILE"
            where file_division_pk like %s
              and file_division_pk ~ %s
            union
            select mbid
            from contract_status_history
            where mbid like %s
              and mbid ~ %s
        )
        select coalesce(max(substring(mbid from 8 for 3)::int), 0) + 1 as next_serial
        from candidate_mbid
        """,
        (
            f"{product_code}%",
            f"^{product_code}[A-Z][0-9]{{7}}$",
            f"{product_code}%",
            f"^{product_code}[A-Z][0-9]{{7}}$",
            f"{product_code}%",
            f"^{product_code}[A-Z][0-9]{{7}}$",
        ),
    )
    serial = cursor.fetchone()["next_serial"]
    return f"{product_code}{month_code}{day_year}{serial:03d}"


def _next_contract_shop_id(cursor) -> int:
    cursor.execute("select coalesce(max(id), 0) + 1 as next_id from moneybank_contract_shop")
    return int(cursor.fetchone()["next_id"])


def _first_non_empty(*values: str | None) -> str:
    for value in values:
        if value is None:
            continue
        cleaned = value.strip()
        if cleaned:
            return cleaned
    return "NOT_PROVIDED"


def _status_key(status: str | None) -> str:
    return (status or "").strip().upper()


def _assert_contract_status_transition(action: ContractStatusAction, previous_status: str | None) -> None:
    previous_status_key = _status_key(previous_status)
    if action in {"approve", "document_ready"} and previous_status_key not in DOCUMENT_REVIEW_READY_STATUS_KEYS:
        raise HTTPException(status_code=409, detail="contract can move to review only after request documents are ready")
    if action == "document_pending" and previous_status_key not in DOCUMENT_PENDING_STATUS_KEYS:
        raise HTTPException(status_code=409, detail="document supplement can be requested only during request review")
    if action == "present_terms" and previous_status_key not in TERMS_PRESENTABLE_STATUS_KEYS:
        raise HTTPException(status_code=409, detail="terms can be presented only during review")
    if action == "reject" and previous_status_key not in REJECTABLE_CONTRACT_STATUS_KEYS:
        raise HTTPException(status_code=409, detail="contract can be rejected only before user agreement or contract")
    if action in {"agree_terms", "refuse_terms"} and previous_status_key not in TERMS_DECISION_STATUS_KEYS:
        raise HTTPException(status_code=409, detail="terms can be decided only after terms are presented")
    if action == "contract_ready" and previous_status_key not in CONTRACT_READY_STATUS_KEYS:
        raise HTTPException(status_code=409, detail="contract can be readied only after user terms agreement")
    if action == "request_termination" and previous_status_key not in CANCELABLE_CONTRACT_STATUS_KEYS:
        raise HTTPException(
            status_code=409,
            detail="contract termination can be requested only after contract is active or account standby",
        )
    if action in {"cancel", "force_termination", "account_closed"} and previous_status_key not in (
        CANCELABLE_CONTRACT_STATUS_KEYS | TERMINATION_REQUEST_STATUS_KEYS
    ):
        detail = (
            "contract can be canceled only after contract is active or account standby"
            if action == "cancel"
            else "contract can be terminated only after contract is active or account standby"
        )
        raise HTTPException(
            status_code=409,
            detail=detail,
        )
    if previous_status_key in TERMINATED_CONTRACT_STATUS_KEYS:
        raise HTTPException(status_code=409, detail="terminated contract status cannot be changed")


def update_contract_status(mbid: str, payload: ContractStatusUpdateRequest) -> ContractStatusUpdateResponse:
    new_status = CONTRACT_STATUS_ACTION_MAP[payload.action]

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select status
                from moneybank_contract
                where mbid = %s
                """,
                (mbid,),
            )
            current = cursor.fetchone()
            if current is None:
                raise HTTPException(status_code=404, detail="contract not found")

            previous_status = current["status"]
            _assert_contract_status_transition(payload.action, previous_status)

            cursor.execute(
                """
                update moneybank_contract
                set
                    status = %s,
                    approval_date = case
                        when %s = 'present_terms' then coalesce(approval_date, now())
                        else approval_date
                    end,
                    agree_date = case
                        when %s = 'agree_terms' then coalesce(agree_date, now())
                        else agree_date
                    end,
                    contract_date = case
                        when %s = 'contract_ready' then coalesce(contract_date, now())
                        else contract_date
                    end,
                    cancel_request_date = case
                        when %s in ('cancel', 'request_termination', 'force_termination', 'account_closed') then coalesce(cancel_request_date, now())
                        else cancel_request_date
                    end,
                    modified_date = now()
                where mbid = %s
                returning
                    mbid,
                    status,
                    approval_date,
                    agree_date,
                    contract_date,
                    cancel_request_date,
                    modified_date
                """,
                (new_status, payload.action, payload.action, payload.action, payload.action, mbid),
            )
            updated = cursor.fetchone()

            cursor.execute(
                """
                insert into contract_status_history (
                    mbid,
                    previous_status,
                    new_status,
                    action,
                    changed_by,
                    reason,
                    reg_date
                ) values (
                    %s, %s, %s, %s, %s, %s, now()
                )
                """,
                (
                    mbid,
                    previous_status,
                    new_status,
                    payload.action,
                    payload.changed_by,
                    payload.reason,
                ),
            )

    return ContractStatusUpdateResponse(
        mbid=updated["mbid"].strip() if hasattr(updated["mbid"], "strip") else updated["mbid"],
        previous_status=previous_status,
        new_status=updated["status"],
        action=payload.action,
        changed_by=payload.changed_by,
        reason=payload.reason,
        approval_date=updated["approval_date"],
        agree_date=updated["agree_date"],
        contract_date=updated["contract_date"],
        cancel_request_date=updated["cancel_request_date"],
        modified_date=updated["modified_date"],
    )


def sign_contract_electronically(
    mbid: str,
    payload: ContractElectronicSignatureRequest,
) -> ContractElectronicSignatureResponse:
    signature_status = "signed_mock"
    signature_reference = _clean_optional_text(payload.signature_reference)
    if signature_reference is None:
        signature_reference = f"MOCK-SIGN-{mbid.strip()}-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select status
                from moneybank_contract
                where mbid = %s
                """,
                (mbid,),
            )
            current = cursor.fetchone()
            if current is None:
                raise HTTPException(status_code=404, detail="contract not found")

            previous_status = current["status"]
            previous_status_key = (previous_status or "").strip().upper()
            if previous_status_key not in {"USE_AGREE", "05"}:
                raise HTTPException(
                    status_code=409,
                    detail="electronic signature can be saved only after user terms agreement",
                )

            cursor.execute(
                """
                update moneybank_contract
                set
                    status = 'ACCOUNT_STANDBY',
                    electronic_signature_method = %s,
                    electronic_signature_status = %s,
                    electronic_signature_reference = %s,
                    electronic_signed_at = now(),
                    contract_date = coalesce(contract_date, now()),
                    modified_date = now()
                where mbid = %s
                returning
                    mbid,
                    status,
                    electronic_signature_method,
                    electronic_signature_status,
                    electronic_signature_reference,
                    electronic_signed_at,
                    contract_date,
                    modified_date
                """,
                (
                    payload.signature_method,
                    signature_status,
                    signature_reference,
                    mbid,
                ),
            )
            updated = cursor.fetchone()

            cursor.execute(
                """
                insert into contract_status_history (
                    mbid,
                    previous_status,
                    new_status,
                    action,
                    changed_by,
                    reason,
                    reg_date
                ) values (
                    %s, %s, 'ACCOUNT_STANDBY', 'electronic_signature', %s, %s, now()
                )
                """,
                (
                    mbid,
                    previous_status,
                    payload.signed_by,
                    payload.reason or f"electronic signature mock saved: {signature_reference}",
                ),
            )

    return ContractElectronicSignatureResponse(
        mbid=updated["mbid"].strip() if hasattr(updated["mbid"], "strip") else updated["mbid"],
        previous_status=previous_status,
        new_status=updated["status"],
        signature_method=updated["electronic_signature_method"],
        signature_status=updated["electronic_signature_status"],
        signature_reference=updated["electronic_signature_reference"],
        signed_by=payload.signed_by,
        electronic_signed_at=updated["electronic_signed_at"],
        contract_date=updated["contract_date"],
        modified_date=updated["modified_date"],
    )


def adjust_contract_fee(mbid: str, payload: ContractFeeAdjustmentRequest) -> ContractFeeAdjustmentResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select 1
                from moneybank_contract
                where mbid = %s
                """,
                (mbid,),
            )
            if cursor.fetchone() is None:
                raise HTTPException(status_code=404, detail="contract not found")

            cursor.execute(
                """
                select
                    id,
                    mbid,
                    payment_rate,
                    sales_limit_per_order,
                    max_outstanding_balance,
                    created_by,
                    reg_date,
                    last_modified_by,
                    modified_date
                from moneybank_contract_fee
                where mbid = %s
                order by coalesce(modified_date, reg_date) desc nulls last, id desc
                limit 1
                for update
                """,
                (mbid,),
            )
            previous_fee = cursor.fetchone()
            if previous_fee is None:
                cursor.execute("select coalesce(max(id), 0) + 1 as next_id from moneybank_contract_fee")
                next_id = cursor.fetchone()["next_id"]
                cursor.execute(
                    """
                    insert into moneybank_contract_fee (
                        id,
                        mbid,
                        payment_rate,
                        sales_limit_per_order,
                        max_outstanding_balance,
                        created_by,
                        reg_date,
                        last_modified_by,
                        modified_date
                    )
                    values (%s, %s, %s, %s, %s, %s, now(), %s, now())
                    returning
                        id,
                        mbid,
                        payment_rate,
                        sales_limit_per_order,
                        max_outstanding_balance,
                        created_by,
                        reg_date,
                        last_modified_by,
                        modified_date
                    """,
                    (
                        next_id,
                        mbid,
                        payload.payment_rate,
                        payload.sales_limit_per_order,
                        payload.max_outstanding_balance,
                        payload.adjusted_by,
                        payload.adjusted_by,
                    ),
                )
                previous_fee = cursor.fetchone()

            previous_rates = _fetch_contract_fee_rate_rows(cursor, previous_fee["id"])
            next_payment_rate = payload.payment_rate if payload.payment_rate is not None else previous_fee["payment_rate"]
            next_sales_limit = (
                payload.sales_limit_per_order
                if payload.sales_limit_per_order is not None
                else previous_fee["sales_limit_per_order"]
            )
            next_max_balance = (
                payload.max_outstanding_balance
                if payload.max_outstanding_balance is not None
                else previous_fee["max_outstanding_balance"]
            )

            cursor.execute(
                """
                update moneybank_contract_fee
                set
                    payment_rate = %s,
                    sales_limit_per_order = %s,
                    max_outstanding_balance = %s,
                    last_modified_by = %s,
                    modified_date = now()
                where id = %s
                returning
                    id,
                    mbid,
                    payment_rate,
                    sales_limit_per_order,
                    max_outstanding_balance,
                    created_by,
                    reg_date,
                    last_modified_by,
                    modified_date
                """,
                (
                    next_payment_rate,
                    next_sales_limit,
                    next_max_balance,
                    payload.adjusted_by,
                    previous_fee["id"],
                ),
            )
            updated_fee = cursor.fetchone()

            for rate in payload.fee_rates:
                cursor.execute(
                    """
                    update moneybank_contract_fee_rates
                    set fee_rate = %s, modified_date = now()
                    where contract_fee_id = %s and fee_type = %s
                    """,
                    (rate.fee_rate, updated_fee["id"], rate.fee_type),
                )
                if cursor.rowcount == 0:
                    cursor.execute(
                        "select coalesce(max(id), 0) + 1 as next_id from moneybank_contract_fee_rates"
                    )
                    next_rate_id = cursor.fetchone()["next_id"]
                    cursor.execute(
                        """
                        insert into moneybank_contract_fee_rates (
                            id,
                            contract_fee_id,
                            fee_type,
                            fee_rate,
                            reg_date,
                            modified_date
                        )
                        values (%s, %s, %s, %s, now(), now())
                        """,
                        (next_rate_id, updated_fee["id"], rate.fee_type, rate.fee_rate),
                    )

            updated_rates = _fetch_contract_fee_rate_rows(cursor, updated_fee["id"])
            cursor.execute(
                """
                insert into contract_fee_adjustment_history (
                    mbid,
                    contract_fee_id,
                    previous_payment_rate,
                    new_payment_rate,
                    previous_sales_limit_per_order,
                    new_sales_limit_per_order,
                    previous_max_outstanding_balance,
                    new_max_outstanding_balance,
                    previous_fee_rates,
                    new_fee_rates,
                    adjusted_by,
                    reason
                )
                values (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb, %s, %s)
                returning id
                """,
                (
                    mbid,
                    updated_fee["id"],
                    previous_fee["payment_rate"],
                    updated_fee["payment_rate"],
                    previous_fee["sales_limit_per_order"],
                    updated_fee["sales_limit_per_order"],
                    previous_fee["max_outstanding_balance"],
                    updated_fee["max_outstanding_balance"],
                    json.dumps(previous_rates, ensure_ascii=False, default=str),
                    json.dumps(updated_rates, ensure_ascii=False, default=str),
                    payload.adjusted_by,
                    payload.reason,
                ),
            )
            history_id = cursor.fetchone()["id"]

    return ContractFeeAdjustmentResponse(
        mbid=updated_fee["mbid"].strip() if hasattr(updated_fee["mbid"], "strip") else updated_fee["mbid"],
        contract_fee_id=updated_fee["id"],
        adjusted_by=payload.adjusted_by,
        reason=payload.reason,
        history_id=history_id,
        fee=ContractFeeItem(
            **updated_fee,
            rates=[ContractFeeRateItem(**rate_row) for rate_row in updated_rates],
        ),
    )


def _fetch_contract(cursor, mbid: str, *, user_no: int | None = None) -> dict | None:
    user_clause = " and c.user_no = %s" if user_no is not None else ""
    params: tuple[object, ...] = (mbid, user_no) if user_no is not None else (mbid,)
    cursor.execute(
        f"""
        select
            c.mbid,
            c.user_no,
            u.email as user_email,
            u.name as user_name,
            u.biz_name as firm_name,
            c.fintech_id,
            c.product_code,
            c.status,
            c.request_date,
            c.approval_date,
            c.agree_date,
            c.contract_date,
            c.expire_date,
            c.cancel_request_date,
            c.reg_no_first,
            c.reg_no_second,
            c.sales_amount,
            c.payer_number,
            c.payer_status,
            c.demand_acc_bank_code,
            c.demand_acc_holder,
            c.demand_acc_number,
            c.main_acc_bank_code,
            c.main_acc_holder,
            c.main_acc_number,
            c.identity_verification_method,
            c.identity_verification_status,
            c.identity_verification_reference,
            c.identity_verified_at,
            c.electronic_signature_method,
            c.electronic_signature_status,
            c.electronic_signature_reference,
            c.electronic_signed_at,
            coalesce(cs.contract_shop_count, 0)::int as contract_shop_count,
            coalesce(cs.contract_shop_count, 0)::int as request_shop,
            case
                when cd.final_confirm_admin is not null then 'Y'
                when cd.cb_check = '1' and cd.national_tax_full_payment = '1'
                 and cd.local_tax_full_payment = '1' and cd.health_insurance_full_payment = '1' then 'Y'
                else 'N'
            end as sub_complete,
            coalesce(df.document_file_count, 0)::int as document_file_count,
            pcs.prizm_grade as prizm_score,
            coalesce(cf.contract_fee_count, 0)::int as contract_fee_count,
            latest_fee.payment_rate as latest_payment_rate,
            latest_fee.latest_fee_rate,
            c.reg_date,
            c.modified_date
        from moneybank_contract c
        left join users u on u.user_no = c.user_no
        left join (
            select mbid, count(*) as contract_shop_count
            from moneybank_contract_shop
            group by mbid
        ) cs on cs.mbid = c.mbid
        left join (
            select mbid, count(*) as contract_fee_count
            from moneybank_contract_fee
            group by mbid
        ) cf on cf.mbid = c.mbid
        left join (
            select
                fee.mbid,
                fee.payment_rate,
                rate.latest_fee_rate
            from (
                select distinct on (mbid)
                    id,
                    mbid,
                    payment_rate
                from moneybank_contract_fee
                order by mbid, id desc
            ) fee
            left join (
                select contract_fee_id, avg(fee_rate)::float as latest_fee_rate
                from moneybank_contract_fee_rates
                group by contract_fee_id
            ) rate on rate.contract_fee_id = fee.id
        ) latest_fee on latest_fee.mbid = c.mbid
        left join moneybank_contract_document cd on cd.mbid = c.mbid
        left join (
            select file_division_pk as mbid, count(*) as document_file_count
            from "CBCI_FILE"
            group by file_division_pk
        ) df on df.mbid = c.mbid
        left join (
            select distinct on (mbid, user_no)
                mbid,
                user_no,
                prizm_grade
            from prizm_pcs_result
            order by mbid, user_no, reg_date desc nulls last, pcs_no desc
        ) pcs on pcs.mbid = c.mbid and pcs.user_no is not distinct from c.user_no
        where c.mbid = %s
        {user_clause}
        """,
        params,
    )
    return cursor.fetchone()


def _fetch_contract_shops(cursor, mbid: str) -> list[dict]:
    cursor.execute(
        """
        select id, mbid, contract_shop_type, contract_shop_id, reg_date, modified_date
        from moneybank_contract_shop
        where mbid = %s
        order by id
        """,
        (mbid,),
    )
    return cursor.fetchall()


def _fetch_contract_fees(cursor, mbid: str) -> list[ContractFeeItem]:
    cursor.execute(
        """
        select
            id,
            mbid,
            payment_rate,
            sales_limit_per_order,
            max_outstanding_balance,
            created_by,
            reg_date,
            last_modified_by,
            modified_date
        from moneybank_contract_fee
        where mbid = %s
        order by id
        """,
        (mbid,),
    )
    fee_rows = cursor.fetchall()

    fees: list[ContractFeeItem] = []
    for fee_row in fee_rows:
        rate_rows = _fetch_contract_fee_rate_rows(cursor, fee_row["id"])
        fees.append(
            ContractFeeItem(
                **fee_row,
                rates=[ContractFeeRateItem(**rate_row) for rate_row in rate_rows],
            )
        )
    return fees


def _fetch_contract_fee_rate_rows(cursor, contract_fee_id: int) -> list[dict]:
    cursor.execute(
        """
        select id, contract_fee_id, fee_type, fee_rate, reg_date, modified_date
        from moneybank_contract_fee_rates
        where contract_fee_id = %s
        order by id
        """,
        (contract_fee_id,),
    )
    return cursor.fetchall()


def _fetch_contract_certificate(cursor, mbid: str) -> dict | None:
    cursor.execute(
        """
        select
            mbid,
            user_no,
            certificate,
            private_key,
            password,
            expiration_date,
            reg_date,
            modified_date
        from moneybank_contract_certificate
        where mbid = %s
        """,
        (mbid,),
    )
    return cursor.fetchone()


def _fetch_contract_document(cursor, mbid: str) -> dict | None:
    cursor.execute(
        """
        select
            mbid,
            business_no,
            business_start_date,
            tax_type,
            cb_score_current,
            cb_score_rank,
            cb_score_past,
            debt_status::text as debt_status,
            financial_disorder_status::text as financial_disorder_status,
            public_information_status::text as public_information_status,
            overdue_status::text as overdue_status,
            cb_check::text as cb_check,
            national_tax_full_payment::text as national_tax_full_payment,
            local_tax_full_payment::text as local_tax_full_payment,
            health_insurance_full_payment::text as health_insurance_full_payment,
            health_insurance_paid_amount,
            cb_confirm_admin,
            final_confirm_admin,
            reg_date,
            modified_date
        from moneybank_contract_document
        where mbid = %s
        """,
        (mbid,),
    )
    return cursor.fetchone()


def _fetch_contract_redemption(cursor, mbid: str) -> dict | None:
    cursor.execute(
        """
        with provision as (
            select
                mbid,
                count(*)::int as provision_count,
                coalesce(sum(total_payment_amount), 0)::bigint as total_payment_amount,
                coalesce(sum(total_usage_fee), 0)::bigint as total_usage_fee,
                coalesce(sum(total_provision_amount), 0)::bigint as total_provision_amount,
                max(provision_date) as latest_provision_date
            from moneybank_redemption_provision
            where mbid = %s
            group by mbid
        ),
        repayment as (
            select
                mbid,
                count(*)::int as repayment_count,
                coalesce(sum(repayment_amount), 0)::bigint as total_repayment_amount,
                coalesce(sum(repayment_usage_fee), 0)::bigint as total_repayment_usage_fee,
                coalesce(sum(remittance_fee), 0)::bigint as total_remittance_fee,
                coalesce(sum(balance_provision_amount), 0)::bigint as total_balance_provision_amount,
                max(balance_provision_date) as latest_balance_provision_date
            from moneybank_redemption_repayment
            where mbid = %s
            group by mbid
        ),
        deposit as (
            select
                mbid,
                count(*)::int as deposit_count,
                coalesce(sum(deposit_amount), 0)::bigint as total_deposit_amount,
                max(deposit_date) as latest_deposit_date
            from moneybank_redemption_deposit
            where mbid = %s
            group by mbid
        ),
        sales as (
            select
                mbid,
                count(*)::int as sales_count,
                coalesce(sum(payment_amount), 0)::bigint as sales_payment_amount,
                coalesce(sum(usage_fee), 0)::bigint as sales_usage_fee,
                coalesce(sum(provision_amount), 0)::bigint as sales_provision_amount,
                max(paid_date) as latest_sales_paid_date
            from moneybank_redemption_sales
            where mbid = %s
            group by mbid
        ),
        latest_history as (
            select distinct on (mbid)
                mbid,
                cumulative_provision_amount as latest_cumulative_provision_amount,
                cumulative_repayment_amount as latest_cumulative_repayment_amount,
                outstanding_balance as latest_outstanding_balance,
                reg_date as latest_history_date
            from moneybank_redemption_history
            where mbid = %s
            order by mbid, reg_date desc nulls last, id desc
        )
        select
            %s::char as mbid,
            coalesce(p.provision_count, 0)::int as provision_count,
            coalesce(p.total_payment_amount, 0)::bigint as total_payment_amount,
            coalesce(p.total_usage_fee, 0)::bigint as total_usage_fee,
            coalesce(p.total_provision_amount, 0)::bigint as total_provision_amount,
            p.latest_provision_date,
            coalesce(r.repayment_count, 0)::int as repayment_count,
            coalesce(r.total_repayment_amount, 0)::bigint as total_repayment_amount,
            coalesce(r.total_repayment_usage_fee, 0)::bigint as total_repayment_usage_fee,
            coalesce(r.total_remittance_fee, 0)::bigint as total_remittance_fee,
            coalesce(r.total_balance_provision_amount, 0)::bigint as total_balance_provision_amount,
            r.latest_balance_provision_date,
            coalesce(d.deposit_count, 0)::int as deposit_count,
            coalesce(d.total_deposit_amount, 0)::bigint as total_deposit_amount,
            d.latest_deposit_date,
            coalesce(s.sales_count, 0)::int as sales_count,
            coalesce(s.sales_payment_amount, 0)::bigint as sales_payment_amount,
            coalesce(s.sales_usage_fee, 0)::bigint as sales_usage_fee,
            coalesce(s.sales_provision_amount, 0)::bigint as sales_provision_amount,
            s.latest_sales_paid_date,
            h.latest_cumulative_provision_amount,
            h.latest_cumulative_repayment_amount,
            h.latest_outstanding_balance,
            h.latest_history_date
        from (select 1) x
        left join provision p on true
        left join repayment r on true
        left join deposit d on true
        left join sales s on true
        left join latest_history h on true
        """,
        (mbid, mbid, mbid, mbid, mbid, mbid),
    )
    row = cursor.fetchone()
    if not row:
        return None
    has_redemption_data = any(
        row[key] > 0
        for key in (
            "provision_count",
            "repayment_count",
            "deposit_count",
            "sales_count",
        )
    ) or row["latest_history_date"] is not None
    return row if has_redemption_data else None


def _fetch_contract_risk_result(cursor, mbid: str) -> dict | None:
    cursor.execute(
        """
        with pcs_latest as (
            select distinct on (mbid, user_no) *
            from prizm_pcs_result
            where mbid = %s
            order by mbid, user_no, reg_date desc nulls last, pcs_no desc
        ),
        pms_latest as (
            select distinct on (mbid, user_no) *
            from prizm_pms_result
            where mbid = %s
            order by mbid, user_no, reg_date desc nulls last, pms_no desc
        ),
        base as (
            select mbid, user_no from pcs_latest
            union
            select mbid, user_no from pms_latest
        )
        select
            b.mbid,
            b.user_no,
            pcs.pcs_no,
            pcs.prizm_grade,
            pcs.prizm_score,
            pcs.business_period,
            pcs.operating_period,
            pcs.shop_count,
            pcs.month_sales_value,
            pcs.month_sales_quantity,
            pcs.month_settlement_amount,
            pcs.month_settlement_period,
            pcs.month_settlement_to_sales_rate,
            pcs.month_promotion_rate,
            pcs.month_delivery_period,
            pcs.month_return_rate,
            pcs.cb_score_current,
            pcs.cb_score_rank,
            pcs.cb_score_change_rate,
            pcs.reg_date as pcs_reg_date,
            pms.pms_no,
            pms.pms_grade,
            pms.pms_score,
            pms.sales_total_score,
            pms.manage_total_score,
            pms.bsvc,
            pms.bsqc,
            pms.baupc,
            pms.bdsr,
            pms.bprc,
            pms.brrc,
            pms.bstsc,
            pms.bdltc,
            pms.reg_date as pms_reg_date
        from base b
        left join pcs_latest pcs
          on pcs.mbid is not distinct from b.mbid
         and pcs.user_no is not distinct from b.user_no
        left join pms_latest pms
          on pms.mbid is not distinct from b.mbid
         and pms.user_no is not distinct from b.user_no
        order by
            greatest(
                coalesce(pcs.reg_date, timestamp '1900-01-01'),
                coalesce(pms.reg_date, timestamp '1900-01-01')
            ) desc
        limit 1
        """,
        (mbid, mbid),
    )
    return cursor.fetchone()
