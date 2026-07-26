"""Read-only settlement queries."""

from datetime import date, datetime

from psycopg.rows import dict_row
from pydantic import BaseModel

from cubici_service.db.connection import get_connection


class SettlementListItem(BaseModel):
    settlements_id: int
    shop_type: str | None
    shop_id: str | None
    settlement_type: str | None
    settlement_date: datetime | None
    total_sale: int | None
    service_fee: int | None
    settlement_target_amount: int | None
    settlement_amount: int | None
    pending_released_amount: int | None
    seller_discount_coupon: int | None
    downloadable_coupon: int | None
    seller_service_fee: int | None
    store_fee_discount: int | None
    debt_of_last_week: int | None
    bank_account_holder: str | None
    bank_name: str | None
    bank_account: str | None
    status: str | None
    reg_date: datetime | None
    modified_date: datetime | None


class SettlementListResponse(BaseModel):
    limit: int
    offset: int
    total: int
    items: list[SettlementListItem]


def _build_settlement_filters(
    *,
    shop_type: str | None,
    shop_id: str | None,
    status: str | None,
    from_date: date | None,
    to_date: date | None,
) -> tuple[str, list[object]]:
    clauses = []
    params: list[object] = []

    if shop_type:
        clauses.append("shop_type = %s")
        params.append(shop_type)
    if shop_id:
        clauses.append("shop_id ilike %s")
        params.append(f"%{shop_id}%")
    if status:
        clauses.append("status = %s")
        params.append(status)
    if from_date:
        clauses.append("settlement_date::date >= %s")
        params.append(from_date)
    if to_date:
        clauses.append("settlement_date::date <= %s")
        params.append(to_date)

    if not clauses:
        return "", params

    return " where " + " and ".join(clauses), params


def list_settlements(
    limit: int,
    offset: int,
    *,
    shop_type: str | None = None,
    shop_id: str | None = None,
    status: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
) -> SettlementListResponse:
    where_clause, filter_params = _build_settlement_filters(
        shop_type=shop_type,
        shop_id=shop_id,
        status=status,
        from_date=from_date,
        to_date=to_date,
    )

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(f"select count(*) as total from settlement{where_clause}", filter_params)
            total = cursor.fetchone()["total"]

            cursor.execute(
                f"""
                select
                    settlements_id,
                    shop_type,
                    shop_id,
                    settlement_type,
                    settlement_date,
                    total_sale,
                    service_fee,
                    settlement_target_amount,
                    settlement_amount,
                    pending_released_amount,
                    seller_discount_coupon,
                    downloadable_coupon,
                    seller_service_fee,
                    store_fee_discount,
                    debt_of_last_week,
                    bank_account_holder,
                    bank_name,
                    bank_account,
                    status,
                    reg_date,
                    modified_date
                from settlement
                {where_clause}
                order by settlement_date desc nulls last, settlements_id desc
                limit %s offset %s
                """,
                (*filter_params, limit, offset),
            )
            rows = cursor.fetchall()

    return SettlementListResponse(
        limit=limit,
        offset=offset,
        total=total,
        items=[SettlementListItem(**row) for row in rows],
    )


def get_settlement_detail(settlements_id: int) -> SettlementListItem | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select
                    settlements_id,
                    shop_type,
                    shop_id,
                    settlement_type,
                    settlement_date,
                    total_sale,
                    service_fee,
                    settlement_target_amount,
                    settlement_amount,
                    pending_released_amount,
                    seller_discount_coupon,
                    downloadable_coupon,
                    seller_service_fee,
                    store_fee_discount,
                    debt_of_last_week,
                    bank_account_holder,
                    bank_name,
                    bank_account,
                    status,
                    reg_date,
                    modified_date
                from settlement
                where settlements_id = %s
                """,
                (settlements_id,),
            )
            row = cursor.fetchone()

    return SettlementListItem(**row) if row else None
