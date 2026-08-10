"""Read-only sales queries."""

from datetime import date, datetime

from psycopg.rows import dict_row
from pydantic import BaseModel

from cubici_service.core.shop_types import build_shop_pair_clause, normalize_shop_type
from cubici_service.db.connection import get_connection


class SaleListItem(BaseModel):
    sales_id: int
    shop_type: str | None
    shop_id: str | None
    order_no: str | None
    product_no: str | None
    option_no: str | None
    status: str | None
    ordered_date: datetime | None
    paid_date: datetime | None
    confirm_date: datetime | None
    settle_estimate_date: datetime | None
    settle_complete_date: datetime | None
    product_name: str | None
    option_name: str | None
    quantity: int | None
    sales_amount: int | None
    discount_amount: int | None
    payment_amount: int | None
    settle_estimate_amount: int | None
    settlement_amount: int | None
    canceled: str | None
    orderer_id: str | None
    orderer_name: str | None
    reg_date: datetime | None
    modified_date: datetime | None


class SaleListResponse(BaseModel):
    limit: int
    offset: int
    total: int
    items: list[SaleListItem]


class ProductAnalysisShopItem(BaseModel):
    shop_type: str
    sales_amount: int
    payment_amount: int
    discount_amount: int
    quantity: int
    promotion_rate: float


class ProductAnalysisTopItem(BaseModel):
    product_name: str
    payment_amount: int
    quantity: int


class ProductAnalysisResponse(BaseModel):
    shop_breakdown: list[ProductAnalysisShopItem]
    top_products: list[ProductAnalysisTopItem]


class SaleReturnListItem(BaseModel):
    returns_id: int
    shop_type: str | None
    shop_id: str | None
    order_no: str | None
    product_no: str | None
    option_no: str | None
    status: str | None
    payment_amount: int | None
    receipt_no: str | None
    claim_status: str | None
    payment_no: str | None
    receipt_type: str | None
    total_cancel_count: int | None
    return_delivery_no: str | None
    release_stop_status: str | None
    pre_refund: str | None
    complete_confirm_type: str | None
    cancel_count: int | None
    order_count: int | None
    release_status: str | None
    reason_code: str | None
    request_date: datetime | None
    claim_complete_date: datetime | None
    reg_date: datetime | None
    modified_date: datetime | None


class SaleReturnListResponse(BaseModel):
    limit: int
    offset: int
    total: int
    items: list[SaleReturnListItem]


def _build_sale_filters(
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
        clauses.append(
            "(order_no ilike %s or product_no ilike %s or product_name ilike %s or option_name ilike %s or orderer_name ilike %s)"
        )
        params.extend([like_keyword, like_keyword, like_keyword, like_keyword, like_keyword])
    if from_date:
        clauses.append("paid_date::date >= %s")
        params.append(from_date)
    if to_date:
        clauses.append("paid_date::date <= %s")
        params.append(to_date)

    if not clauses:
        return "", params

    return " where " + " and ".join(clauses), params


def _build_sale_return_filters(
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
        clauses.append("(status = %s or claim_status = %s)")
        params.extend([status, status])
    if keyword:
        like_keyword = f"%{keyword.strip()}%"
        clauses.append(
            "(order_no ilike %s or product_no ilike %s or receipt_no ilike %s or payment_no ilike %s or return_delivery_no ilike %s)"
        )
        params.extend([like_keyword, like_keyword, like_keyword, like_keyword, like_keyword])
    if from_date:
        clauses.append("request_date::date >= %s")
        params.append(from_date)
    if to_date:
        clauses.append("request_date::date <= %s")
        params.append(to_date)

    if not clauses:
        return "", params

    return " where " + " and ".join(clauses), params


def list_sales(
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
) -> SaleListResponse:
    where_clause, filter_params = _build_sale_filters(
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
            cursor.execute(f"select count(*) as total from sale{where_clause}", filter_params)
            total = cursor.fetchone()["total"]

            cursor.execute(
                f"""
                select
                    sales_id,
                    shop_type,
                    shop_id,
                    order_no,
                    product_no,
                    option_no,
                    status,
                    ordered_date,
                    paid_date,
                    confirm_date,
                    settle_estimate_date,
                    settle_complete_date,
                    product_name,
                    option_name,
                    quantity,
                    sales_amount,
                    discount_amount,
                    payment_amount,
                    settle_estimate_amount,
                    settlement_amount,
                    canceled,
                    orderer_id,
                    orderer_name,
                    reg_date,
                    modified_date
                from sale
                {where_clause}
                order by paid_date desc nulls last, sales_id desc
                limit %s offset %s
                """,
                (*filter_params, limit, offset),
            )
            rows = cursor.fetchall()

    return SaleListResponse(
        limit=limit,
        offset=offset,
        total=total,
        items=[SaleListItem(**row) for row in rows],
    )


def get_product_analysis(
    *,
    shop_pairs: str | None = None,
    shop_type: str | None = None,
    shop_id: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
) -> ProductAnalysisResponse:
    where_clause, filter_params = _build_sale_filters(
        shop_pairs=shop_pairs,
        shop_type=shop_type,
        shop_id=shop_id,
        status=None,
        keyword=None,
        from_date=from_date,
        to_date=to_date,
    )
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                select
                    upper(shop_type) as shop_type,
                    coalesce(sum(sales_amount), 0)::bigint as sales_amount,
                    coalesce(sum(payment_amount), 0)::bigint as payment_amount,
                    coalesce(sum(discount_amount), 0)::bigint as discount_amount,
                    coalesce(sum(quantity), 0)::bigint as quantity
                from sale
                {where_clause}
                group by upper(shop_type)
                order by payment_amount desc, shop_type
                """,
                filter_params,
            )
            shop_rows = cursor.fetchall()

            cursor.execute(
                f"""
                select
                    coalesce(nullif(product_name, ''), nullif(product_no, ''), '-') as product_name,
                    coalesce(sum(payment_amount), 0)::bigint as payment_amount,
                    coalesce(sum(quantity), 0)::bigint as quantity
                from sale
                {where_clause}
                group by coalesce(nullif(product_name, ''), nullif(product_no, ''), '-')
                order by payment_amount desc, quantity desc, product_name
                limit 10
                """,
                filter_params,
            )
            product_rows = cursor.fetchall()

    shop_breakdown = []
    for row in shop_rows:
        sales_amount = int(row["sales_amount"] or 0)
        payment_amount = int(row["payment_amount"] or 0)
        recorded_discount = int(row["discount_amount"] or 0)
        discount_amount = recorded_discount or max(sales_amount - payment_amount, 0)
        promotion_rate = round(discount_amount / sales_amount * 100, 2) if sales_amount > 0 else 0.0
        shop_breakdown.append(
            ProductAnalysisShopItem(
                shop_type=row["shop_type"] or "UNKNOWN",
                sales_amount=sales_amount,
                payment_amount=payment_amount,
                discount_amount=discount_amount,
                quantity=int(row["quantity"] or 0),
                promotion_rate=promotion_rate,
            )
        )

    return ProductAnalysisResponse(
        shop_breakdown=shop_breakdown,
        top_products=[ProductAnalysisTopItem(**row) for row in product_rows],
    )


def list_sale_returns(
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
) -> SaleReturnListResponse:
    where_clause, filter_params = _build_sale_return_filters(
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
            cursor.execute(f"select count(*) as total from sale_return{where_clause}", filter_params)
            total = cursor.fetchone()["total"]

            cursor.execute(
                f"""
                select
                    returns_id,
                    shop_type,
                    shop_id,
                    order_no,
                    product_no,
                    option_no,
                    status,
                    payment_amount,
                    receipt_no,
                    claim_status,
                    payment_no,
                    receipt_type,
                    total_cancel_count,
                    return_delivery_no,
                    release_stop_status,
                    pre_refund,
                    complete_confirm_type,
                    cancel_count,
                    order_count,
                    release_status,
                    reason_code,
                    request_date,
                    claim_complete_date,
                    reg_date,
                    modified_date
                from sale_return
                {where_clause}
                order by request_date desc nulls last, returns_id desc
                limit %s offset %s
                """,
                (*filter_params, limit, offset),
            )
            rows = cursor.fetchall()

    return SaleReturnListResponse(
        limit=limit,
        offset=offset,
        total=total,
        items=[SaleReturnListItem(**row) for row in rows],
    )
