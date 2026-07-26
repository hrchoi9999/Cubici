"""Read-only legacy risk result queries."""

from datetime import datetime

from psycopg.rows import dict_row
from pydantic import BaseModel

from cubici_service.db.connection import get_connection


class RiskResultListItem(BaseModel):
    mbid: str | None
    user_no: int | None
    pcs_no: int | None
    prizm_grade: str | None
    prizm_score: float | None
    business_period: float | None
    operating_period: float | None
    shop_count: int | None
    month_sales_value: int | None
    month_sales_quantity: int | None
    month_settlement_amount: int | None
    month_settlement_period: float | None
    month_settlement_to_sales_rate: float | None
    month_promotion_rate: float | None
    month_delivery_period: float | None
    month_return_rate: float | None
    cb_score_current: int | None
    cb_score_rank: int | None
    cb_score_change_rate: float | None
    pcs_reg_date: datetime | None
    pms_no: int | None
    pms_grade: str | None
    pms_score: float | None
    sales_total_score: float | None
    manage_total_score: float | None
    bsvc: float | None
    bsqc: float | None
    baupc: float | None
    bdsr: float | None
    bprc: float | None
    brrc: float | None
    bstsc: float | None
    bdltc: float | None
    pms_reg_date: datetime | None


class RiskResultListResponse(BaseModel):
    limit: int
    offset: int
    total: int
    items: list[RiskResultListItem]


def list_risk_results(limit: int, offset: int) -> RiskResultListResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                with pcs_latest as (
                    select distinct on (mbid, user_no) *
                    from prizm_pcs_result
                    order by mbid, user_no, reg_date desc nulls last, pcs_no desc
                ),
                pms_latest as (
                    select distinct on (mbid, user_no) *
                    from prizm_pms_result
                    order by mbid, user_no, reg_date desc nulls last, pms_no desc
                ),
                base as (
                    select mbid, user_no from pcs_latest
                    union
                    select mbid, user_no from pms_latest
                )
                select count(*) as total from base
                """
            )
            total = cursor.fetchone()["total"]

            cursor.execute(
                """
                with pcs_latest as (
                    select distinct on (mbid, user_no) *
                    from prizm_pcs_result
                    order by mbid, user_no, reg_date desc nulls last, pcs_no desc
                ),
                pms_latest as (
                    select distinct on (mbid, user_no) *
                    from prizm_pms_result
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
                    ) desc,
                    b.mbid desc nulls last,
                    b.user_no desc nulls last
                limit %s offset %s
                """,
                (limit, offset),
            )
            rows = cursor.fetchall()

    return RiskResultListResponse(
        limit=limit,
        offset=offset,
        total=total,
        items=[RiskResultListItem(**row) for row in rows],
    )
