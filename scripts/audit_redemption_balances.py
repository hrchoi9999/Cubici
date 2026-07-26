"""Audit Cubici redemption balance formulas against local PostgreSQL."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from psycopg.rows import dict_row


ROOT = Path(__file__).resolve().parents[1]
SERVICE_SRC = ROOT / "service-api" / "src"
if str(SERVICE_SRC) not in sys.path:
    sys.path.insert(0, str(SERVICE_SRC))

from cubici_service.db.connection import get_connection  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Audit redemption balance consistency in the local Cubici PostgreSQL DB.",
    )
    parser.add_argument("--limit", type=int, default=10, help="maximum sample rows per issue type")
    parser.add_argument("--json", action="store_true", help="print raw JSON only")
    parser.add_argument(
        "--strict",
        action="store_true",
        help="exit with status 1 when mismatches are found",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="repair history outstanding_balance formula mismatches in local PostgreSQL",
    )
    args = parser.parse_args()

    report = build_report(sample_limit=args.limit)
    if args.apply:
        report["repair"] = repair_history_mismatches()
        report["after_repair"] = build_report(sample_limit=args.limit)["summary"]
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2, default=str))
    else:
        print_human_report(report)

    issue_count = (
        report["summary"]["history_formula_mismatch_rows"]
        + report["summary"]["latest_formula_mismatch_contracts"]
        + report["summary"]["negative_history_rows"]
        + report["summary"]["operation_formula_mismatch_rows"]
        + report["summary"]["cancel_link_issue_rows"]
    )
    return 1 if args.strict and issue_count else 0


def build_report(sample_limit: int = 10) -> dict[str, Any]:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            operation_history_exists = _table_exists(cursor, "moneybank_redemption_operation_history")
            summary = {
                "history_rows": _scalar(cursor, "select count(*) from moneybank_redemption_history"),
                "history_contracts": _scalar(
                    cursor,
                    "select count(distinct mbid) from moneybank_redemption_history",
                ),
                "history_formula_mismatch_rows": _scalar(
                    cursor,
                    """
                    select count(*)
                    from moneybank_redemption_history
                    where coalesce(outstanding_balance, 0)
                       <> coalesce(cumulative_provision_amount, 0)
                        - coalesce(cumulative_repayment_amount, 0)
                    """,
                ),
                "latest_formula_mismatch_contracts": _scalar(
                    cursor,
                    """
                    with latest_history as (
                        select distinct on (mbid)
                            mbid,
                            cumulative_provision_amount,
                            cumulative_repayment_amount,
                            outstanding_balance
                        from moneybank_redemption_history
                        order by mbid, reg_date desc nulls last, id desc
                    )
                    select count(*)
                    from latest_history
                    where coalesce(outstanding_balance, 0)
                       <> coalesce(cumulative_provision_amount, 0)
                        - coalesce(cumulative_repayment_amount, 0)
                    """,
                ),
                "negative_history_rows": _scalar(
                    cursor,
                    """
                    select count(*)
                    from moneybank_redemption_history
                    where coalesce(cumulative_provision_amount, 0) < 0
                       or coalesce(cumulative_repayment_amount, 0) < 0
                       or coalesce(outstanding_balance, 0) < 0
                    """,
                ),
                "operation_rows": 0,
                "operation_formula_mismatch_rows": 0,
                "cancel_link_issue_rows": 0,
            }
            samples = {
                "history_formula_mismatches": _rows(cursor, _history_mismatch_sql(), (sample_limit,)),
                "latest_formula_mismatches": _rows(cursor, _latest_mismatch_sql(), (sample_limit,)),
                "negative_history_rows": _rows(cursor, _negative_history_sql(), (sample_limit,)),
                "operation_formula_mismatches": [],
                "cancel_link_issues": [],
            }

            if operation_history_exists:
                summary["operation_rows"] = _scalar(
                    cursor,
                    "select count(*) from moneybank_redemption_operation_history",
                )
                summary["operation_formula_mismatch_rows"] = _scalar(
                    cursor,
                    """
                    select count(*)
                    from moneybank_redemption_operation_history
                    where coalesce(new_outstanding_balance, 0)
                       <> coalesce(new_cumulative_provision_amount, 0)
                        - coalesce(new_cumulative_repayment_amount, 0)
                    """,
                )
                summary["cancel_link_issue_rows"] = _scalar(cursor, _cancel_link_issue_count_sql())
                samples["operation_formula_mismatches"] = _rows(
                    cursor,
                    _operation_mismatch_sql(),
                    (sample_limit,),
                )
                samples["cancel_link_issues"] = _rows(cursor, _cancel_link_issue_sql(), (sample_limit,))

    return {
        "checked_at": datetime.now(UTC).isoformat(),
        "database": "local PostgreSQL",
        "operation_history_exists": operation_history_exists,
        "summary": summary,
        "samples": samples,
    }


def repair_history_mismatches() -> dict[str, Any]:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                update moneybank_redemption_history
                set outstanding_balance =
                    coalesce(cumulative_provision_amount, 0)
                    - coalesce(cumulative_repayment_amount, 0)
                where coalesce(outstanding_balance, 0)
                   <> coalesce(cumulative_provision_amount, 0)
                    - coalesce(cumulative_repayment_amount, 0)
                returning
                    id,
                    mbid,
                    cumulative_provision_amount,
                    cumulative_repayment_amount,
                    outstanding_balance,
                    reg_date
                """
            )
            repaired = [dict(row) for row in cursor.fetchall()]

    return {
        "applied_at": datetime.now(UTC).isoformat(),
        "repaired_history_rows": len(repaired),
        "rows": repaired,
    }


def print_human_report(report: dict[str, Any]) -> None:
    summary = report["summary"]
    print("# Cubici redemption balance audit")
    print(f"checked_at={report['checked_at']}")
    print(f"history_rows={summary['history_rows']}")
    print(f"history_contracts={summary['history_contracts']}")
    print(f"history_formula_mismatch_rows={summary['history_formula_mismatch_rows']}")
    print(f"latest_formula_mismatch_contracts={summary['latest_formula_mismatch_contracts']}")
    print(f"negative_history_rows={summary['negative_history_rows']}")
    print(f"operation_history_exists={report['operation_history_exists']}")
    print(f"operation_rows={summary['operation_rows']}")
    print(f"operation_formula_mismatch_rows={summary['operation_formula_mismatch_rows']}")
    print(f"cancel_link_issue_rows={summary['cancel_link_issue_rows']}")
    if "repair" in report:
        repair = report["repair"]
        print(f"repair_applied_at={repair['applied_at']}")
        print(f"repaired_history_rows={repair['repaired_history_rows']}")
        print(f"after_repair={json.dumps(report['after_repair'], ensure_ascii=False, default=str)}")

    for sample_name, rows in report["samples"].items():
        print(f"\n[{sample_name}]")
        if not rows:
            print("none")
            continue
        for row in rows:
            print(json.dumps(row, ensure_ascii=False, default=str))


def _table_exists(cursor, table_name: str) -> bool:
    cursor.execute(
        """
        select exists (
            select 1
            from information_schema.tables
            where table_schema = current_schema()
              and table_name = %s
        )
        """,
        (table_name,),
    )
    return bool(cursor.fetchone()["exists"])


def _scalar(cursor, sql: str) -> int:
    cursor.execute(sql)
    row = cursor.fetchone()
    return int(next(iter(row.values())))


def _rows(cursor, sql: str, params: tuple[Any, ...]) -> list[dict[str, Any]]:
    cursor.execute(sql, params)
    return [dict(row) for row in cursor.fetchall()]


def _history_mismatch_sql() -> str:
    return """
        select
            id,
            mbid,
            cumulative_provision_amount,
            cumulative_repayment_amount,
            outstanding_balance,
            coalesce(cumulative_provision_amount, 0)
              - coalesce(cumulative_repayment_amount, 0) as calculated_outstanding_balance,
            coalesce(outstanding_balance, 0)
              - (
                  coalesce(cumulative_provision_amount, 0)
                  - coalesce(cumulative_repayment_amount, 0)
                ) as difference,
            reg_date
        from moneybank_redemption_history
        where coalesce(outstanding_balance, 0)
           <> coalesce(cumulative_provision_amount, 0)
            - coalesce(cumulative_repayment_amount, 0)
        order by abs(
            coalesce(outstanding_balance, 0)
            - (
                coalesce(cumulative_provision_amount, 0)
                - coalesce(cumulative_repayment_amount, 0)
              )
        ) desc, id desc
        limit %s
    """


def _latest_mismatch_sql() -> str:
    return """
        with latest_history as (
            select distinct on (mbid)
                id,
                mbid,
                cumulative_provision_amount,
                cumulative_repayment_amount,
                outstanding_balance,
                reg_date
            from moneybank_redemption_history
            order by mbid, reg_date desc nulls last, id desc
        )
        select
            id,
            mbid,
            cumulative_provision_amount,
            cumulative_repayment_amount,
            outstanding_balance,
            coalesce(cumulative_provision_amount, 0)
              - coalesce(cumulative_repayment_amount, 0) as calculated_outstanding_balance,
            reg_date
        from latest_history
        where coalesce(outstanding_balance, 0)
           <> coalesce(cumulative_provision_amount, 0)
            - coalesce(cumulative_repayment_amount, 0)
        order by id desc
        limit %s
    """


def _negative_history_sql() -> str:
    return """
        select
            id,
            mbid,
            cumulative_provision_amount,
            cumulative_repayment_amount,
            outstanding_balance,
            reg_date
        from moneybank_redemption_history
        where coalesce(cumulative_provision_amount, 0) < 0
           or coalesce(cumulative_repayment_amount, 0) < 0
           or coalesce(outstanding_balance, 0) < 0
        order by id desc
        limit %s
    """


def _operation_mismatch_sql() -> str:
    return """
        select
            id,
            mbid,
            operation_type,
            operation_code,
            new_cumulative_provision_amount,
            new_cumulative_repayment_amount,
            new_outstanding_balance,
            coalesce(new_cumulative_provision_amount, 0)
              - coalesce(new_cumulative_repayment_amount, 0) as calculated_outstanding_balance,
            reg_date
        from moneybank_redemption_operation_history
        where coalesce(new_outstanding_balance, 0)
           <> coalesce(new_cumulative_provision_amount, 0)
            - coalesce(new_cumulative_repayment_amount, 0)
        order by id desc
        limit %s
    """


def _cancel_link_issue_count_sql() -> str:
    return """
        select count(*)
        from moneybank_redemption_operation_history target
        where target.canceled_by_operation_history_id is not null
          and not exists (
              select 1
              from moneybank_redemption_operation_history reversal
              where reversal.id = target.canceled_by_operation_history_id
                and reversal.is_reversal = true
                and reversal.reversed_operation_history_id = target.id
          )
    """


def _cancel_link_issue_sql() -> str:
    return """
        select
            target.id,
            target.mbid,
            target.operation_type,
            target.operation_code,
            target.canceled_by_operation_history_id
        from moneybank_redemption_operation_history target
        where target.canceled_by_operation_history_id is not null
          and not exists (
              select 1
              from moneybank_redemption_operation_history reversal
              where reversal.id = target.canceled_by_operation_history_id
                and reversal.is_reversal = true
                and reversal.reversed_operation_history_id = target.id
          )
        order by target.id desc
        limit %s
    """


if __name__ == "__main__":
    raise SystemExit(main())
