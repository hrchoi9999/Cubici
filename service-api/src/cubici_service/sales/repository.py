"""Read-only sales queries."""

from datetime import datetime

from psycopg.rows import dict_row
from pydantic import BaseModel

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


def list_sales(limit: int, offset: int) -> SaleListResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute("select count(*) as total from sale")
            total = cursor.fetchone()["total"]

            cursor.execute(
                """
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
                order by paid_date desc nulls last, sales_id desc
                limit %s offset %s
                """,
                (limit, offset),
            )
            rows = cursor.fetchall()

    return SaleListResponse(
        limit=limit,
        offset=offset,
        total=total,
        items=[SaleListItem(**row) for row in rows],
    )


def list_sale_returns(limit: int, offset: int) -> SaleReturnListResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute("select count(*) as total from sale_return")
            total = cursor.fetchone()["total"]

            cursor.execute(
                """
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
                order by request_date desc nulls last, returns_id desc
                limit %s offset %s
                """,
                (limit, offset),
            )
            rows = cursor.fetchall()

    return SaleReturnListResponse(
        limit=limit,
        offset=offset,
        total=total,
        items=[SaleReturnListItem(**row) for row in rows],
    )
