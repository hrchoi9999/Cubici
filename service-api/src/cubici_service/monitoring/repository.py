"""Monitoring queries."""

from datetime import date, datetime, time
from typing import Literal

from psycopg.rows import dict_row
from pydantic import BaseModel

from cubici_service.db.connection import get_connection


ErrorLogStatus = Literal["ALL", "SUCCESS", "FAIL"]


class ErrorLogItem(BaseModel):
    shop_id: str | None
    shop_type: str | None = None
    shop_name: str | None
    scenario: str | None
    started_at: datetime | None
    runtime_seconds: int
    runtime_label: str
    status: Literal["성공", "실패"]
    processing_status_label: str = "미확인"
    follow_up_action_label: str = "확인 필요"
    source_table: str
    error_log: str


class ErrorLogListResponse(BaseModel):
    limit: int
    offset: int
    total: int
    success_count: int
    fail_count: int
    pending_action_count: int
    workflow_status_label: str
    items: list[ErrorLogItem]


class ServerStatusMetric(BaseModel):
    name: str
    status: Literal["정상", "주의", "장애"]
    value: str
    checked_at: datetime | None
    note: str | None = None
    source_label: str = "내부 상태 점검"
    action_label: str = "모니터링"


class ServerStatusResponse(BaseModel):
    checked_at: datetime
    overall_status: Literal["정상", "주의", "장애"]
    metric_source_label: str = "FastAPI/DB/배치 로그 기반"
    metric_source_status_label: str = "외부 서버 metric 미연동"
    follow_up_action_label: str = "정상"
    metrics: list[ServerStatusMetric]
    recent_success_count: int
    recent_fail_count: int
    last_success_at: datetime | None
    last_fail_at: datetime | None


def list_error_logs(
    limit: int,
    offset: int,
    *,
    from_date: date | None = None,
    to_date: date | None = None,
    shop: str | None = None,
    status: ErrorLogStatus = "ALL",
    scenario: str | None = None,
) -> ErrorLogListResponse:
    where_clause, params = _build_error_log_filters(
        from_date=from_date,
        to_date=to_date,
        shop=shop,
        status=status,
        scenario=scenario,
    )

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                with error_base as (
                    {_error_log_base_query()}
                )
                select
                    count(*)::int as total,
                    count(*) filter (where status = '성공')::int as success_count,
                    count(*) filter (where status = '실패')::int as fail_count,
                    count(*) filter (where status = '실패')::int as pending_action_count
                from error_base
                {where_clause}
                """,
                params,
            )
            counts = cursor.fetchone()

            cursor.execute(
                f"""
                with error_base as (
                    {_error_log_base_query()}
                )
                select *
                from error_base
                {where_clause}
                order by started_at desc nulls last, shop_id asc nulls last
                limit %s offset %s
                """,
                (*params, limit, offset),
            )
            rows = cursor.fetchall()

    return ErrorLogListResponse(
        limit=limit,
        offset=offset,
        total=counts["total"],
        success_count=counts["success_count"],
        fail_count=counts["fail_count"],
        pending_action_count=counts["pending_action_count"],
        workflow_status_label="조치필요" if counts["pending_action_count"] else "정상",
        items=[
            ErrorLogItem(
                **row,
                runtime_label=_format_runtime(row["runtime_seconds"]),
                processing_status_label=_error_processing_label(row["status"]),
                follow_up_action_label=_error_follow_up_label(row["status"]),
            )
            for row in rows
        ],
    )


def get_server_status(*, hours: int = 24) -> ServerStatusResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute("select now() as checked_at")
            checked_at = cursor.fetchone()["checked_at"]

            cursor.execute(
                """
                with recent_success as (
                    select input_date as event_at
                    from cbci_scheduled_report
                    where input_date >= now() - (%s || ' hours')::interval
                ),
                recent_fail as (
                    select input_datetime as event_at
                    from cbci_err_report
                    where input_datetime >= now() - (%s || ' hours')::interval
                )
                select
                    (select count(*)::int from recent_success) as recent_success_count,
                    (select count(*)::int from recent_fail) as recent_fail_count,
                    (select max(event_at) from recent_success) as last_success_at,
                    (select max(event_at) from recent_fail) as last_fail_at
                """,
                (hours, hours),
            )
            row = cursor.fetchone()

    fail_count = row["recent_fail_count"] or 0
    success_count = row["recent_success_count"] or 0
    overall_status: Literal["정상", "주의", "장애"] = "정상"
    if fail_count > 0:
        overall_status = "주의"
    if success_count == 0 and fail_count > 0:
        overall_status = "장애"

    metrics = [
        ServerStatusMetric(
            name="API 서버",
            status="정상",
            value="응답 가능",
            checked_at=checked_at,
            note="FastAPI endpoint 응답 기준",
            source_label="FastAPI self-check",
            action_label="응답 지연 시 service-api 로그 확인",
        ),
        ServerStatusMetric(
            name="PostgreSQL",
            status="정상",
            value="연결 가능",
            checked_at=checked_at,
            note="select now() 실행 기준",
            source_label="PostgreSQL connection",
            action_label="timeout 반복 시 Docker PostgreSQL 상태 확인",
        ),
        ServerStatusMetric(
            name="배치 성공",
            status="정상" if success_count > 0 else "주의",
            value=f"{success_count}건",
            checked_at=row["last_success_at"],
            note=f"최근 {hours}시간 cbci_scheduled_report 기준",
            source_label="cbci_scheduled_report",
            action_label="성공 0건이면 배치 스케줄 실행 여부 확인",
        ),
        ServerStatusMetric(
            name="배치 실패",
            status="정상" if fail_count == 0 else "주의",
            value=f"{fail_count}건",
            checked_at=row["last_fail_at"],
            note=f"최근 {hours}시간 cbci_err_report 기준",
            source_label="cbci_err_report",
            action_label="실패 건은 Error Log에서 원인 확인 후 재수집/재실행",
        ),
    ]

    return ServerStatusResponse(
        checked_at=checked_at,
        overall_status=overall_status,
        follow_up_action_label=_server_follow_up_label(
            overall_status=overall_status,
            success_count=success_count,
            fail_count=fail_count,
        ),
        metrics=metrics,
        recent_success_count=success_count,
        recent_fail_count=fail_count,
        last_success_at=row["last_success_at"],
        last_fail_at=row["last_fail_at"],
    )


def _error_log_base_query() -> str:
    return """
        select
            shop_id,
            code_id as shop_type,
            code_nm as shop_name,
            cause as scenario,
            input_datetime as started_at,
            coalesce(runtime, 0)::int as runtime_seconds,
            '실패'::text as status,
            coalesce(error_log, '') as error_log,
            'cbci_err_report'::text as source_table
        from cbci_err_report
        union all
        select
            shop_id,
            shop_type,
            shop_nm as shop_name,
            scheduled_name as scenario,
            input_date as started_at,
            coalesce(runtime, 0)::int as runtime_seconds,
            '성공'::text as status,
            '-'::text as error_log,
            'cbci_scheduled_report'::text as source_table
        from cbci_scheduled_report
    """


def _build_error_log_filters(
    *,
    from_date: date | None,
    to_date: date | None,
    shop: str | None,
    status: ErrorLogStatus,
    scenario: str | None,
) -> tuple[str, tuple[object, ...]]:
    clauses: list[str] = []
    params: list[object] = []

    if from_date is not None:
        clauses.append("started_at >= %s")
        params.append(datetime.combine(from_date, time.min))
    if to_date is not None:
        clauses.append("started_at < %s")
        params.append(datetime.combine(to_date, time.max))
    if shop:
        clauses.append("(shop_id ilike %s or shop_name ilike %s or shop_type = %s)")
        params.extend((f"%{shop}%", f"%{shop}%", shop))
    if status == "SUCCESS":
        clauses.append("status = '성공'")
    elif status == "FAIL":
        clauses.append("status = '실패'")
    if scenario:
        clauses.append("scenario ilike %s")
        params.append(f"%{scenario}%")

    if not clauses:
        return "", tuple()
    return "where " + " and ".join(clauses), tuple(params)


def _format_runtime(seconds: int | None) -> str:
    value = max(0, int(seconds or 0))
    hours = value // 3600
    minutes = (value % 3600) // 60
    secs = value % 60
    return f"{hours}시간 {minutes}분 {secs}초"


def _error_processing_label(status: str) -> str:
    if status == "실패":
        return "조치필요"
    return "처리완료"


def _error_follow_up_label(status: str) -> str:
    if status == "실패":
        return "원인 확인 후 재수집/배치 재실행"
    return "추가조치 없음"


def _server_follow_up_label(
    *,
    overall_status: Literal["정상", "주의", "장애"],
    success_count: int,
    fail_count: int,
) -> str:
    if overall_status == "장애":
        return "배치 실행 상태와 DB 로그 즉시 확인"
    if fail_count > 0:
        return "Error Log 실패 건 확인"
    if success_count == 0:
        return "배치 스케줄 실행 여부 확인"
    return "정상"
