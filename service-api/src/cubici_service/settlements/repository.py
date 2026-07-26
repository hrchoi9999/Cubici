"""Read-only settlement queries."""

from datetime import date, datetime

from psycopg.rows import dict_row
from pydantic import BaseModel

from cubici_service.core.shop_types import build_shop_pair_clause, normalize_shop_type
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
    settlement_check_amount: int | None = None
    settlement_difference: int | None = None
    settlement_check_status: str = "NOT_CHECKED"
    reg_date: datetime | None
    modified_date: datetime | None


class SettlementListResponse(BaseModel):
    limit: int
    offset: int
    total: int
    items: list[SettlementListItem]


def _build_settlement_filters(
    *,
    shop_pairs: str | None,
    shop_type: str | None,
    shop_id: str | None,
    status: str | None,
    keyword: str | None,
    from_date: date | None,
    to_date: date | None,
) -> tuple[str, list[object]]:
    clauses = []
    params: list[object] = []

    if shop_pairs is not None:
        pair_clause, pair_params = build_shop_pair_clause(shop_pairs)
        clauses.append(pair_clause)
        params.extend(pair_params)
    if shop_type:
        clauses.append("upper(shop_type) = %s")
        params.append(normalize_shop_type(shop_type))
    if shop_id:
        clauses.append("shop_id ilike %s")
        params.append(f"%{shop_id}%")
    if status:
        clauses.append("status = %s")
        params.append(status)
    if keyword:
        like_keyword = f"%{keyword.strip()}%"
        clauses.append("(settlements_id::text ilike %s or settlement_type ilike %s or bank_name ilike %s)")
        params.extend([like_keyword, like_keyword, like_keyword])
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
    shop_pairs: str | None = None,
    shop_type: str | None = None,
    shop_id: str | None = None,
    status: str | None = None,
    keyword: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
) -> SettlementListResponse:
    where_clause, filter_params = _build_settlement_filters(
        shop_pairs=shop_pairs,
        shop_type=shop_type,
        shop_id=shop_id,
        status=status,
        keyword=keyword,
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
            rows = [_with_settlement_amount_check(row) for row in cursor.fetchall()]

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

    return SettlementListItem(**_with_settlement_amount_check(row)) if row else None


def _int_value(value: object) -> int:
    return int(value or 0)


def _with_settlement_amount_check(row: dict) -> dict:
    checked = dict(row)
    total_sale = _int_value(checked.get("total_sale"))
    service_fee = _int_value(checked.get("service_fee"))
    target_amount = _int_value(checked.get("settlement_target_amount"))
    settlement_amount = _int_value(checked.get("settlement_amount"))
    pending_released_amount = _int_value(checked.get("pending_released_amount"))
    source_adjustments = [
        _int_value(checked.get("seller_discount_coupon")),
        _int_value(checked.get("downloadable_coupon")),
        _int_value(checked.get("seller_service_fee")),
        _int_value(checked.get("store_fee_discount")),
        _int_value(checked.get("debt_of_last_week")),
    ]

    computed_target = (
        total_sale
        - service_fee
        - source_adjustments[0]
        - source_adjustments[1]
        - source_adjustments[2]
        + source_adjustments[3]
        - source_adjustments[4]
    )
    check_amount = target_amount - pending_released_amount
    if target_amount == 0 and pending_released_amount == 0 and computed_target != 0:
        check_amount = computed_target

    difference = settlement_amount - check_amount
    if difference == 0:
        status = "OK"
    elif target_amount == 0 and pending_released_amount == 0 and computed_target == 0 and settlement_amount != 0:
        status = "LEGACY_BATCH_VALUE"
    else:
        status = "DIFF"

    checked["settlement_check_amount"] = check_amount
    checked["settlement_difference"] = difference
    checked["settlement_check_status"] = status
    return checked
