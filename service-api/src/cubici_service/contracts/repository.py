"""Read-only contract queries."""

from datetime import date, datetime
import json
from typing import Literal

from fastapi import HTTPException
from psycopg.rows import dict_row
from pydantic import BaseModel, Field

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
    contract_shop_count: int
    request_shop: int = 0
    sub_complete: str = "N"
    document_file_count: int = 0
    prizm_score: str | None = None
    contract_fee_count: int
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
ContractStatusAction = Literal["approve", "reject", "cancel"]


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
    cancel_request_date: datetime | None
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


def _build_contract_filters(
    *,
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


def get_contract_detail(mbid: str) -> ContractDetailResponse | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            contract = _fetch_contract(cursor, mbid)
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


def update_contract_status(mbid: str, payload: ContractStatusUpdateRequest) -> ContractStatusUpdateResponse:
    action_map = {
        "approve": "CONTRACT",
        "reject": "REJECTED",
        "cancel": "SELF_TERMINATION",
    }
    new_status = action_map[payload.action]

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
            cursor.execute(
                """
                update moneybank_contract
                set
                    status = %s,
                    approval_date = case
                        when %s = 'approve' then coalesce(approval_date, now())
                        else approval_date
                    end,
                    cancel_request_date = case
                        when %s = 'cancel' then coalesce(cancel_request_date, now())
                        else cancel_request_date
                    end,
                    modified_date = now()
                where mbid = %s
                returning
                    mbid,
                    status,
                    approval_date,
                    cancel_request_date,
                    modified_date
                """,
                (new_status, payload.action, payload.action, mbid),
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
        cancel_request_date=updated["cancel_request_date"],
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


def _fetch_contract(cursor, mbid: str) -> dict | None:
    cursor.execute(
        """
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
        """,
        (mbid,),
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
