"""Read-only legacy risk result queries."""

from datetime import date, datetime

from psycopg.rows import dict_row
from pydantic import BaseModel, Field

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


class RiskResultCounts(BaseModel):
    total_count: int = 0
    pcs_count: int = 0
    pms_count: int = 0
    linked_count: int = 0
    incomplete_count: int = 0
    source_status_label: str = "미조회"
    policy_status_label: str = "조회 재현"


class RiskResultListResponse(BaseModel):
    limit: int
    offset: int
    total: int
    counts: RiskResultCounts = Field(default_factory=RiskResultCounts)
    items: list[RiskResultListItem]


def _build_risk_result_filters(
    *,
    mbid: str | None,
    user_no: int | None,
    prizm_grade: str | None,
    pms_grade: str | None,
    from_date: date | None,
    to_date: date | None,
) -> tuple[str, list[object]]:
    clauses = []
    params: list[object] = []

    if mbid:
        clauses.append("b.mbid ilike %s")
        params.append(f"%{mbid}%")
    if user_no is not None:
        clauses.append("b.user_no = %s")
        params.append(user_no)
    if prizm_grade:
        clauses.append("pcs.prizm_grade = %s")
        params.append(prizm_grade)
    if pms_grade:
        clauses.append("pms.pms_grade = %s")
        params.append(pms_grade)
    if from_date:
        clauses.append(
            "greatest(coalesce(pcs.reg_date, timestamp '1900-01-01'), coalesce(pms.reg_date, timestamp '1900-01-01'))::date >= %s"
        )
        params.append(from_date)
    if to_date:
        clauses.append(
            "greatest(coalesce(pcs.reg_date, timestamp '1900-01-01'), coalesce(pms.reg_date, timestamp '1900-01-01'))::date <= %s"
        )
        params.append(to_date)

    if not clauses:
        return "", params

    return " where " + " and ".join(clauses), params


def list_risk_results(
    limit: int,
    offset: int,
    *,
    mbid: str | None = None,
    user_no: int | None = None,
    prizm_grade: str | None = None,
    pms_grade: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
) -> RiskResultListResponse:
    where_clause, filter_params = _build_risk_result_filters(
        mbid=mbid,
        user_no=user_no,
        prizm_grade=prizm_grade,
        pms_grade=pms_grade,
        from_date=from_date,
        to_date=to_date,
    )

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
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
                    count(*)::int as total_count,
                    count(pcs.pcs_no)::int as pcs_count,
                    count(pms.pms_no)::int as pms_count,
                    count(*) filter (where pcs.pcs_no is not null and pms.pms_no is not null)::int as linked_count,
                    count(*) filter (where pcs.pcs_no is null or pms.pms_no is null)::int as incomplete_count,
                    case
                        when count(*) = 0 then '평가결과 없음'
                        when count(*) filter (where pcs.pcs_no is null or pms.pms_no is null) > 0 then 'PCS/PMS 일부 누락'
                        else 'PCS/PMS 연결'
                    end as source_status_label,
                    '조회 재현' as policy_status_label
                from base b
                left join pcs_latest pcs
                  on pcs.mbid is not distinct from b.mbid
                 and pcs.user_no is not distinct from b.user_no
                left join pms_latest pms
                  on pms.mbid is not distinct from b.mbid
                 and pms.user_no is not distinct from b.user_no
                {where_clause}
                """,
                filter_params,
            )
            counts = RiskResultCounts(**cursor.fetchone())

            cursor.execute(
                f"""
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
                {where_clause}
                order by
                    greatest(
                        coalesce(pcs.reg_date, timestamp '1900-01-01'),
                        coalesce(pms.reg_date, timestamp '1900-01-01')
                    ) desc,
                    b.mbid desc nulls last,
                    b.user_no desc nulls last
                limit %s offset %s
                """,
                (*filter_params, limit, offset),
            )
            rows = cursor.fetchall()

    return RiskResultListResponse(
        limit=limit,
        offset=offset,
        total=counts.total_count,
        counts=counts,
        items=[RiskResultListItem(**row) for row in rows],
    )
