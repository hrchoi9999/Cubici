"""Read-only redemption and repayment queries."""

from datetime import date, datetime
import json
from typing import Any

from fastapi import HTTPException
from psycopg.rows import dict_row
from pydantic import BaseModel, Field

from cubici_service.db.connection import get_connection


class RedemptionListItem(BaseModel):
    mbid: str
    provision_count: int
    total_payment_amount: int
    total_usage_fee: int
    total_provision_amount: int
    latest_provision_date: datetime | None
    repayment_count: int
    total_repayment_amount: int
    total_repayment_usage_fee: int
    total_remittance_fee: int
    total_balance_provision_amount: int
    latest_balance_provision_date: datetime | None
    deposit_count: int
    total_deposit_amount: int
    latest_deposit_date: str | None
    sales_count: int
    sales_payment_amount: int
    sales_usage_fee: int
    sales_provision_amount: int
    latest_sales_paid_date: datetime | None
    latest_cumulative_provision_amount: int | None
    latest_cumulative_repayment_amount: int | None
    latest_outstanding_balance: int | None
    latest_history_date: datetime | None
    latest_balance_check_amount: int | None = None
    latest_balance_difference: int | None = None
    latest_balance_check_status: str = "NOT_CHECKED"


class RedemptionListResponse(BaseModel):
    limit: int
    offset: int
    total: int
    items: list[RedemptionListItem]


class RedemptionSaleCreateItem(BaseModel):
    sales_code: str = Field(min_length=1, max_length=15)
    class_code: str | None = Field(default=None, max_length=20)
    order_no: str | None = Field(default=None, max_length=30)
    payment_amount: int = Field(ge=0)
    usage_fee: int = Field(ge=0)
    provision_amount: int = Field(ge=0)
    paid_date: datetime | None = None


class RedemptionProvisionCreateRequest(BaseModel):
    request_code: str | None = Field(default=None, max_length=30)
    provision_code: str = Field(min_length=1, max_length=15)
    total_payment_amount: int = Field(ge=0)
    total_usage_fee: int = Field(ge=0)
    total_provision_amount: int = Field(ge=0)
    provision_date: datetime | None = None
    status: str = Field(default="PROVISION", min_length=1, max_length=20)
    operated_by: str = Field(min_length=1, max_length=50)
    reason: str | None = Field(default=None, max_length=2000)
    sales: list[RedemptionSaleCreateItem] = Field(default_factory=list)


class RedemptionDepositCreateItem(BaseModel):
    deposit_code: str = Field(min_length=1, max_length=15)
    deposit_date: date
    deposit_amount: int = Field(ge=0)


class RedemptionRepaymentCreateRequest(BaseModel):
    repayment_code: str = Field(min_length=1, max_length=15)
    repayment_amount: int = Field(ge=0)
    repayment_usage_fee: int = Field(default=0, ge=0)
    remittance_fee: int = Field(default=0, ge=0)
    balance_provision_amount: int = Field(default=0, ge=0)
    balance_provision_date: datetime | None = None
    status: str = Field(default="END", min_length=1, max_length=15)
    operated_by: str = Field(min_length=1, max_length=50)
    reason: str | None = Field(default=None, max_length=2000)
    deposits: list[RedemptionDepositCreateItem] = Field(default_factory=list)


class RedemptionOperationResponse(BaseModel):
    mbid: str
    operation_type: str
    operation_code: str
    related_id: int
    history_id: int
    operation_history_id: int
    cumulative_provision_amount: int
    cumulative_repayment_amount: int
    outstanding_balance: int


class RedemptionOperationCancelRequest(BaseModel):
    cancel_code: str | None = Field(default=None, max_length=30)
    operated_by: str = Field(min_length=1, max_length=50)
    reason: str = Field(min_length=1, max_length=2000)


class RedemptionOperationHistoryItem(BaseModel):
    id: int
    mbid: str
    operation_type: str
    operation_code: str
    related_table: str
    related_id: int | None
    previous_cumulative_provision_amount: int | None
    previous_cumulative_repayment_amount: int | None
    previous_outstanding_balance: int | None
    new_cumulative_provision_amount: int | None
    new_cumulative_repayment_amount: int | None
    new_outstanding_balance: int | None
    is_reversal: bool = False
    reversed_operation_history_id: int | None = None
    canceled_by_operation_history_id: int | None = None
    payload: dict[str, Any]
    operated_by: str
    reason: str | None
    reg_date: datetime


class RedemptionOperationHistoryResponse(BaseModel):
    mbid: str
    limit: int
    offset: int
    total: int
    items: list[RedemptionOperationHistoryItem]


def _build_redemption_filters(
    *,
    user_no: int | None,
    mbid: str | None,
    outstanding_only: bool,
    from_date: date | None,
    to_date: date | None,
) -> tuple[str, list[object]]:
    clauses = []
    params: list[object] = []

    if user_no is not None:
        clauses.append(
            "exists (select 1 from moneybank_contract c where c.mbid = b.mbid and c.user_no = %s)"
        )
        params.append(user_no)
    if mbid:
        clauses.append("b.mbid ilike %s")
        params.append(f"%{mbid}%")
    if outstanding_only:
        clauses.append("coalesce(h.latest_outstanding_balance, 0) > 0")
    if from_date:
        clauses.append("h.latest_history_date::date >= %s")
        params.append(from_date)
    if to_date:
        clauses.append("h.latest_history_date::date <= %s")
        params.append(to_date)

    if not clauses:
        return "", params

    return " where " + " and ".join(clauses), params


def _redemption_summary_cte() -> str:
    return """
        with base as (
            select mbid from moneybank_redemption_provision
            union
            select mbid from moneybank_redemption_repayment
            union
            select mbid from moneybank_redemption_deposit
            union
            select mbid from moneybank_redemption_sales
            union
            select mbid from moneybank_redemption_history
        ),
        provision as (
            select
                mbid,
                count(*)::int as provision_count,
                coalesce(sum(total_payment_amount), 0)::bigint as total_payment_amount,
                coalesce(sum(total_usage_fee), 0)::bigint as total_usage_fee,
                coalesce(sum(total_provision_amount), 0)::bigint as total_provision_amount,
                max(provision_date) as latest_provision_date
            from moneybank_redemption_provision
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
            group by mbid
        ),
        deposit as (
            select
                mbid,
                count(*)::int as deposit_count,
                coalesce(sum(deposit_amount), 0)::bigint as total_deposit_amount,
                max(deposit_date) as latest_deposit_date
            from moneybank_redemption_deposit
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
            order by mbid, reg_date desc nulls last, id desc
        )
    """


def _redemption_summary_select() -> str:
    return """
        select
            b.mbid,
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
            h.latest_history_date,
            case
                when h.latest_history_date is null then null
                else coalesce(h.latest_cumulative_provision_amount, 0) - coalesce(h.latest_cumulative_repayment_amount, 0)
            end as latest_balance_check_amount,
            case
                when h.latest_history_date is null then null
                else coalesce(h.latest_outstanding_balance, 0)
                   - (coalesce(h.latest_cumulative_provision_amount, 0) - coalesce(h.latest_cumulative_repayment_amount, 0))
            end as latest_balance_difference,
            case
                when h.latest_history_date is null then 'NO_HISTORY'
                when coalesce(h.latest_outstanding_balance, 0)
                   = coalesce(h.latest_cumulative_provision_amount, 0) - coalesce(h.latest_cumulative_repayment_amount, 0)
                then 'OK'
                else 'DIFF'
            end as latest_balance_check_status
        from base b
        left join provision p on p.mbid = b.mbid
        left join repayment r on r.mbid = b.mbid
        left join deposit d on d.mbid = b.mbid
        left join sales s on s.mbid = b.mbid
        left join latest_history h on h.mbid = b.mbid
    """


def list_redemptions(
    limit: int,
    offset: int,
    *,
    user_no: int | None = None,
    mbid: str | None = None,
    outstanding_only: bool = False,
    from_date: date | None = None,
    to_date: date | None = None,
) -> RedemptionListResponse:
    where_clause, filter_params = _build_redemption_filters(
        user_no=user_no,
        mbid=mbid,
        outstanding_only=outstanding_only,
        from_date=from_date,
        to_date=to_date,
    )

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                {_redemption_summary_cte()}
                select count(*) as total
                from (
                    {_redemption_summary_select()}
                    {where_clause}
                ) summary
                """,
                filter_params,
            )
            total = cursor.fetchone()["total"]

            cursor.execute(
                f"""
                {_redemption_summary_cte()}
                {_redemption_summary_select()}
                {where_clause}
                order by
                    greatest(
                        coalesce(p.latest_provision_date, timestamp '1900-01-01'),
                        coalesce(r.latest_balance_provision_date, timestamp '1900-01-01'),
                        coalesce(s.latest_sales_paid_date, timestamp '1900-01-01'),
                        coalesce(h.latest_history_date, timestamp '1900-01-01')
                    ) desc,
                    b.mbid desc
                limit %s offset %s
                """,
                (*filter_params, limit, offset),
            )
            rows = cursor.fetchall()

    return RedemptionListResponse(
        limit=limit,
        offset=offset,
        total=total,
        items=[RedemptionListItem(**row) for row in rows],
    )


def get_redemption_detail(mbid: str) -> RedemptionListItem | None:
    response = list_redemptions(limit=1, offset=0, mbid=mbid)
    for item in response.items:
        if item.mbid.strip() == mbid.strip():
            return item
    return None


def list_redemption_operation_history(
    mbid: str,
    limit: int = 20,
    offset: int = 0,
) -> RedemptionOperationHistoryResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            _ensure_contract_exists(cursor, mbid)
            cursor.execute(
                """
                select count(*)::int as total
                from moneybank_redemption_operation_history
                where mbid = %s
                """,
                (mbid,),
            )
            total = cursor.fetchone()["total"]

            cursor.execute(
                """
                select
                    id,
                    mbid,
                    operation_type,
                    operation_code,
                    related_table,
                    related_id,
                    previous_cumulative_provision_amount,
                    previous_cumulative_repayment_amount,
                    previous_outstanding_balance,
                    new_cumulative_provision_amount,
                    new_cumulative_repayment_amount,
                    new_outstanding_balance,
                    is_reversal,
                    reversed_operation_history_id,
                    canceled_by_operation_history_id,
                    payload,
                    operated_by,
                    reason,
                    reg_date
                from moneybank_redemption_operation_history
                where mbid = %s
                order by reg_date desc, id desc
                limit %s offset %s
                """,
                (mbid, limit, offset),
            )
            items = [RedemptionOperationHistoryItem(**row) for row in cursor.fetchall()]

    return RedemptionOperationHistoryResponse(
        mbid=mbid,
        limit=limit,
        offset=offset,
        total=total,
        items=items,
    )


def create_redemption_provision(
    mbid: str,
    payload: RedemptionProvisionCreateRequest,
) -> RedemptionOperationResponse:
    if payload.total_provision_amount > payload.total_payment_amount:
        raise HTTPException(status_code=400, detail="total_provision_amount must be <= total_payment_amount")

    sales_total = sum(item.provision_amount for item in payload.sales)
    if payload.sales and sales_total != payload.total_provision_amount:
        raise HTTPException(status_code=400, detail="sales provision total mismatch")

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            _ensure_contract_exists(cursor, mbid)
            _ensure_unique_code(cursor, "moneybank_redemption_provision", "provision_code", payload.provision_code)
            for sale in payload.sales:
                _ensure_unique_code(cursor, "moneybank_redemption_sales", "sales_code", sale.sales_code)

            latest = _fetch_latest_history_for_update(cursor, mbid)
            previous_provision = latest["cumulative_provision_amount"] if latest else 0
            previous_repayment = latest["cumulative_repayment_amount"] if latest else 0
            previous_balance = latest["outstanding_balance"] if latest else 0
            new_provision = previous_provision + payload.total_provision_amount
            new_repayment = previous_repayment
            new_balance = new_provision - new_repayment

            provision_id = _next_id(cursor, "moneybank_redemption_provision")
            cursor.execute(
                """
                insert into moneybank_redemption_provision (
                    id,
                    mbid,
                    request_code,
                    provision_code,
                    total_payment_amount,
                    total_usage_fee,
                    total_provision_amount,
                    provision_date,
                    status,
                    reg_date,
                    modified_date
                )
                values (%s, %s, %s, %s, %s, %s, %s, coalesce(%s, now()), %s, now(), now())
                """,
                (
                    provision_id,
                    mbid,
                    payload.request_code,
                    payload.provision_code,
                    payload.total_payment_amount,
                    payload.total_usage_fee,
                    payload.total_provision_amount,
                    payload.provision_date,
                    payload.status,
                ),
            )

            for sale in payload.sales:
                sale_id = _next_id(cursor, "moneybank_redemption_sales")
                cursor.execute(
                    """
                    insert into moneybank_redemption_sales (
                        id,
                        mbid,
                        request_code,
                        sales_code,
                        class_code,
                        order_no,
                        payment_amount,
                        usage_fee,
                        provision_amount,
                        paid_date,
                        reg_date,
                        modified_date
                    )
                    values (%s, %s, %s, %s, %s, %s, %s, %s, %s, coalesce(%s, now()), now(), now())
                    """,
                    (
                        sale_id,
                        mbid,
                        payload.request_code,
                        sale.sales_code,
                        sale.class_code,
                        sale.order_no,
                        sale.payment_amount,
                        sale.usage_fee,
                        sale.provision_amount,
                        sale.paid_date,
                    ),
                )

            history_id = _append_redemption_history(
                cursor,
                mbid=mbid,
                cumulative_provision_amount=new_provision,
                cumulative_repayment_amount=new_repayment,
                outstanding_balance=new_balance,
            )
            operation_history_id = _append_operation_history(
                cursor,
                mbid=mbid,
                operation_type="PROVISION",
                operation_code=payload.provision_code,
                related_table="moneybank_redemption_provision",
                related_id=provision_id,
                previous_cumulative_provision_amount=previous_provision,
                previous_cumulative_repayment_amount=previous_repayment,
                previous_outstanding_balance=previous_balance,
                new_cumulative_provision_amount=new_provision,
                new_cumulative_repayment_amount=new_repayment,
                new_outstanding_balance=new_balance,
                payload=payload.model_dump(mode="json"),
                operated_by=payload.operated_by,
                reason=payload.reason,
            )

    return RedemptionOperationResponse(
        mbid=mbid,
        operation_type="PROVISION",
        operation_code=payload.provision_code,
        related_id=provision_id,
        history_id=history_id,
        operation_history_id=operation_history_id,
        cumulative_provision_amount=new_provision,
        cumulative_repayment_amount=new_repayment,
        outstanding_balance=new_balance,
    )


def create_redemption_repayment(
    mbid: str,
    payload: RedemptionRepaymentCreateRequest,
) -> RedemptionOperationResponse:
    deposit_total = sum(item.deposit_amount for item in payload.deposits)
    if payload.deposits and deposit_total < payload.repayment_amount:
        raise HTTPException(status_code=400, detail="deposit total must be >= repayment_amount")

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            _ensure_contract_exists(cursor, mbid)
            _ensure_unique_code(cursor, "moneybank_redemption_repayment", "repayment_code", payload.repayment_code)
            for deposit in payload.deposits:
                _ensure_unique_code(cursor, "moneybank_redemption_deposit", "deposit_code", deposit.deposit_code)

            latest = _fetch_latest_history_for_update(cursor, mbid)
            previous_provision = latest["cumulative_provision_amount"] if latest else 0
            previous_repayment = latest["cumulative_repayment_amount"] if latest else 0
            previous_balance = latest["outstanding_balance"] if latest else 0
            new_provision = previous_provision
            new_repayment = previous_repayment + payload.repayment_amount
            new_balance = new_provision - new_repayment
            if new_balance < 0:
                raise HTTPException(status_code=400, detail="outstanding_balance cannot be negative")

            repayment_id = _next_id(cursor, "moneybank_redemption_repayment")
            cursor.execute(
                """
                insert into moneybank_redemption_repayment (
                    id,
                    mbid,
                    repayment_code,
                    repayment_amount,
                    repayment_usage_fee,
                    remittance_fee,
                    balance_provision_amount,
                    balance_provision_date,
                    status,
                    reg_date,
                    modified_date
                )
                values (%s, %s, %s, %s, %s, %s, %s, coalesce(%s, now()), %s, now(), now())
                """,
                (
                    repayment_id,
                    mbid,
                    payload.repayment_code,
                    payload.repayment_amount,
                    payload.repayment_usage_fee,
                    payload.remittance_fee,
                    payload.balance_provision_amount,
                    payload.balance_provision_date,
                    payload.status,
                ),
            )

            for deposit in payload.deposits:
                deposit_id = _next_id(cursor, "moneybank_redemption_deposit")
                cursor.execute(
                    """
                    insert into moneybank_redemption_deposit (
                        id,
                        mbid,
                        deposit_code,
                        repayment_code,
                        deposit_date,
                        deposit_amount,
                        reg_date
                    )
                    values (%s, %s, %s, %s, %s, %s, now())
                    """,
                    (
                        deposit_id,
                        mbid,
                        deposit.deposit_code,
                        payload.repayment_code,
                        deposit.deposit_date.isoformat(),
                        deposit.deposit_amount,
                    ),
                )

            history_id = _append_redemption_history(
                cursor,
                mbid=mbid,
                cumulative_provision_amount=new_provision,
                cumulative_repayment_amount=new_repayment,
                outstanding_balance=new_balance,
            )
            operation_history_id = _append_operation_history(
                cursor,
                mbid=mbid,
                operation_type="REPAYMENT",
                operation_code=payload.repayment_code,
                related_table="moneybank_redemption_repayment",
                related_id=repayment_id,
                previous_cumulative_provision_amount=previous_provision,
                previous_cumulative_repayment_amount=previous_repayment,
                previous_outstanding_balance=previous_balance,
                new_cumulative_provision_amount=new_provision,
                new_cumulative_repayment_amount=new_repayment,
                new_outstanding_balance=new_balance,
                payload=payload.model_dump(mode="json"),
                operated_by=payload.operated_by,
                reason=payload.reason,
            )

    return RedemptionOperationResponse(
        mbid=mbid,
        operation_type="REPAYMENT",
        operation_code=payload.repayment_code,
        related_id=repayment_id,
        history_id=history_id,
        operation_history_id=operation_history_id,
        cumulative_provision_amount=new_provision,
        cumulative_repayment_amount=new_repayment,
        outstanding_balance=new_balance,
    )


def cancel_redemption_operation(
    mbid: str,
    operation_history_id: int,
    payload: RedemptionOperationCancelRequest,
) -> RedemptionOperationResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            _ensure_contract_exists(cursor, mbid)
            target = _fetch_operation_history_for_update(cursor, mbid, operation_history_id)
            if target is None:
                raise HTTPException(status_code=404, detail="operation history not found")
            if target["is_reversal"]:
                raise HTTPException(status_code=400, detail="reversal operation cannot be canceled")
            if target["canceled_by_operation_history_id"] is not None:
                raise HTTPException(status_code=409, detail="operation already canceled")
            if target["operation_type"] not in {"PROVISION", "REPAYMENT"}:
                raise HTTPException(status_code=400, detail="operation type cannot be canceled")

            latest = _fetch_latest_history_for_update(cursor, mbid)
            previous_provision = latest["cumulative_provision_amount"] if latest else 0
            previous_repayment = latest["cumulative_repayment_amount"] if latest else 0
            previous_balance = latest["outstanding_balance"] if latest else 0

            provision_delta = (
                target["new_cumulative_provision_amount"]
                - target["previous_cumulative_provision_amount"]
            )
            repayment_delta = (
                target["new_cumulative_repayment_amount"]
                - target["previous_cumulative_repayment_amount"]
            )

            if target["operation_type"] == "PROVISION":
                operation_type = "PROVISION_CANCEL"
                new_provision = previous_provision - provision_delta
                new_repayment = previous_repayment
            else:
                operation_type = "REPAYMENT_CANCEL"
                new_provision = previous_provision
                new_repayment = previous_repayment - repayment_delta

            new_balance = new_provision - new_repayment
            if new_provision < 0 or new_repayment < 0:
                raise HTTPException(status_code=400, detail="cumulative amount cannot be negative")
            if new_balance < 0:
                raise HTTPException(status_code=400, detail="outstanding_balance cannot be negative")

            cancel_code = payload.cancel_code or f"C{target['operation_code']}"[:30]
            _ensure_unique_operation_code(cursor, operation_type, cancel_code)
            history_id = _append_redemption_history(
                cursor,
                mbid=mbid,
                cumulative_provision_amount=new_provision,
                cumulative_repayment_amount=new_repayment,
                outstanding_balance=new_balance,
            )
            operation_history_id = _append_operation_history(
                cursor,
                mbid=mbid,
                operation_type=operation_type,
                operation_code=cancel_code,
                related_table=target["related_table"],
                related_id=target["related_id"],
                previous_cumulative_provision_amount=previous_provision,
                previous_cumulative_repayment_amount=previous_repayment,
                previous_outstanding_balance=previous_balance,
                new_cumulative_provision_amount=new_provision,
                new_cumulative_repayment_amount=new_repayment,
                new_outstanding_balance=new_balance,
                payload={
                    "cancel_code": cancel_code,
                    "target_operation_history_id": target["id"],
                    "target_operation_type": target["operation_type"],
                    "target_operation_code": target["operation_code"],
                    "reason": payload.reason,
                },
                operated_by=payload.operated_by,
                reason=payload.reason,
                is_reversal=True,
                reversed_operation_history_id=target["id"],
            )
            cursor.execute(
                """
                update moneybank_redemption_operation_history
                set canceled_by_operation_history_id = %s
                where id = %s
                """,
                (operation_history_id, target["id"]),
            )

    return RedemptionOperationResponse(
        mbid=mbid,
        operation_type=operation_type,
        operation_code=cancel_code,
        related_id=target["related_id"],
        history_id=history_id,
        operation_history_id=operation_history_id,
        cumulative_provision_amount=new_provision,
        cumulative_repayment_amount=new_repayment,
        outstanding_balance=new_balance,
    )


def _ensure_contract_exists(cursor, mbid: str) -> None:
    cursor.execute("select 1 from moneybank_contract where mbid = %s", (mbid,))
    if cursor.fetchone() is None:
        raise HTTPException(status_code=404, detail="contract not found")


def _ensure_unique_code(cursor, table_name: str, column_name: str, code: str) -> None:
    cursor.execute(f"select 1 from {table_name} where {column_name} = %s", (code,))
    if cursor.fetchone() is not None:
        raise HTTPException(status_code=409, detail=f"{column_name} already exists")


def _ensure_unique_operation_code(cursor, operation_type: str, operation_code: str) -> None:
    cursor.execute(
        """
        select 1
        from moneybank_redemption_operation_history
        where operation_type = %s and operation_code = %s
        """,
        (operation_type, operation_code),
    )
    if cursor.fetchone() is not None:
        raise HTTPException(status_code=409, detail="operation_code already exists")


def _fetch_operation_history_for_update(cursor, mbid: str, operation_history_id: int) -> dict | None:
    cursor.execute(
        """
        select
            id,
            mbid,
            operation_type,
            operation_code,
            related_table,
            related_id,
            previous_cumulative_provision_amount,
            previous_cumulative_repayment_amount,
            previous_outstanding_balance,
            new_cumulative_provision_amount,
            new_cumulative_repayment_amount,
            new_outstanding_balance,
            is_reversal,
            reversed_operation_history_id,
            canceled_by_operation_history_id
        from moneybank_redemption_operation_history
        where mbid = %s and id = %s
        for update
        """,
        (mbid, operation_history_id),
    )
    return cursor.fetchone()


def _fetch_latest_history_for_update(cursor, mbid: str) -> dict | None:
    cursor.execute(
        """
        select id, cumulative_provision_amount, cumulative_repayment_amount, outstanding_balance
        from moneybank_redemption_history
        where mbid = %s
        order by reg_date desc nulls last, id desc
        limit 1
        for update
        """,
        (mbid,),
    )
    return cursor.fetchone()


def _append_redemption_history(
    cursor,
    *,
    mbid: str,
    cumulative_provision_amount: int,
    cumulative_repayment_amount: int,
    outstanding_balance: int,
) -> int:
    history_id = _next_id(cursor, "moneybank_redemption_history")
    cursor.execute(
        """
        insert into moneybank_redemption_history (
            id,
            mbid,
            cumulative_provision_amount,
            cumulative_repayment_amount,
            outstanding_balance,
            reg_date
        )
        values (%s, %s, %s, %s, %s, now())
        """,
        (
            history_id,
            mbid,
            cumulative_provision_amount,
            cumulative_repayment_amount,
            outstanding_balance,
        ),
    )
    return history_id


def _append_operation_history(
    cursor,
    *,
    mbid: str,
    operation_type: str,
    operation_code: str,
    related_table: str,
    related_id: int,
    previous_cumulative_provision_amount: int,
    previous_cumulative_repayment_amount: int,
    previous_outstanding_balance: int,
    new_cumulative_provision_amount: int,
    new_cumulative_repayment_amount: int,
    new_outstanding_balance: int,
    payload: dict,
    operated_by: str,
    reason: str | None,
    is_reversal: bool = False,
    reversed_operation_history_id: int | None = None,
) -> int:
    cursor.execute(
        """
        insert into moneybank_redemption_operation_history (
            mbid,
            operation_type,
            operation_code,
            related_table,
            related_id,
            previous_cumulative_provision_amount,
            previous_cumulative_repayment_amount,
            previous_outstanding_balance,
            new_cumulative_provision_amount,
            new_cumulative_repayment_amount,
            new_outstanding_balance,
            payload,
            operated_by,
            reason,
            is_reversal,
            reversed_operation_history_id
        )
        values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s, %s, %s)
        returning id
        """,
        (
            mbid,
            operation_type,
            operation_code,
            related_table,
            related_id,
            previous_cumulative_provision_amount,
            previous_cumulative_repayment_amount,
            previous_outstanding_balance,
            new_cumulative_provision_amount,
            new_cumulative_repayment_amount,
            new_outstanding_balance,
            json.dumps(payload, ensure_ascii=False, default=str),
            operated_by,
            reason,
            is_reversal,
            reversed_operation_history_id,
        ),
    )
    return cursor.fetchone()["id"]


def _next_id(cursor, table_name: str) -> int:
    cursor.execute(f"select coalesce(max(id), 0) + 1 as next_id from {table_name}")
    return cursor.fetchone()["next_id"]
