"""Audit Cubici settlement amount formulas against local PostgreSQL."""

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
        description="Audit settlement amount formula consistency in the local Cubici PostgreSQL DB.",
    )
    parser.add_argument("--limit", type=int, default=10, help="maximum sample rows per issue type")
    parser.add_argument("--json", action="store_true", help="print raw JSON only")
    parser.add_argument(
        "--strict",
        action="store_true",
        help="exit with status 1 when confirmed formula mismatches are found",
    )
    args = parser.parse_args()

    report = build_report(sample_limit=args.limit)
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2, default=str))
    else:
        print_human_report(report)

    return 1 if args.strict and report["summary"]["target_formula_mismatch_rows"] else 0


def build_report(sample_limit: int = 10) -> dict[str, Any]:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            summary = {
                "settlement_rows": _scalar(cursor, "select count(*) from settlement"),
                "target_formula_mismatch_rows": _scalar(cursor, _target_mismatch_count_sql()),
                "amount_equals_total_minus_fee_rows": _scalar(cursor, _amount_equals_total_minus_fee_count_sql()),
                "amount_equals_target_minus_fee_rows": _scalar(cursor, _amount_equals_target_minus_fee_count_sql()),
                "amount_equals_full_deduction_candidate_rows": _scalar(
                    cursor,
                    _amount_equals_full_candidate_count_sql(),
                ),
            }
            totals = _row(cursor, _totals_sql())
            by_type_status = _rows(cursor, _by_type_status_sql(), ())
            samples = {
                "target_formula_mismatches": _rows(cursor, _target_mismatch_sql(), (sample_limit,)),
                "top_settlement_amount_rows": _rows(cursor, _top_amount_rows_sql(), (sample_limit,)),
            }

    return {
        "checked_at": datetime.now(UTC).isoformat(),
        "database": "local PostgreSQL",
        "confirmed_formula": "settlement_target_amount = total_sale - service_fee",
        "amount_note": (
            "settlement_amount is a legacy stored amount and is not recalculated from "
            "total_sale/service_fee/deduction fields by this audit."
        ),
        "summary": summary,
        "totals": totals,
        "by_type_status": by_type_status,
        "samples": samples,
    }


def print_human_report(report: dict[str, Any]) -> None:
    summary = report["summary"]
    print("# Cubici settlement formula audit")
    print(f"checked_at={report['checked_at']}")
    print(f"confirmed_formula={report['confirmed_formula']}")
    print(f"settlement_rows={summary['settlement_rows']}")
    print(f"target_formula_mismatch_rows={summary['target_formula_mismatch_rows']}")
    print(f"amount_equals_total_minus_fee_rows={summary['amount_equals_total_minus_fee_rows']}")
    print(f"amount_equals_target_minus_fee_rows={summary['amount_equals_target_minus_fee_rows']}")
    print(
        "amount_equals_full_deduction_candidate_rows="
        f"{summary['amount_equals_full_deduction_candidate_rows']}"
    )
    print(f"amount_note={report['amount_note']}")
    print(f"totals={json.dumps(report['totals'], ensure_ascii=False, default=str)}")
    print("\n[by_type_status]")
    for row in report["by_type_status"]:
        print(json.dumps(row, ensure_ascii=False, default=str))
    for sample_name, rows in report["samples"].items():
        print(f"\n[{sample_name}]")
        if not rows:
            print("none")
            continue
        for row in rows:
            print(json.dumps(row, ensure_ascii=False, default=str))


def _scalar(cursor, sql: str) -> int:
    cursor.execute(sql)
    row = cursor.fetchone()
    return int(next(iter(row.values())))


def _row(cursor, sql: str) -> dict[str, Any]:
    cursor.execute(sql)
    return dict(cursor.fetchone())


def _rows(cursor, sql: str, params: tuple[Any, ...]) -> list[dict[str, Any]]:
    cursor.execute(sql, params)
    return [dict(row) for row in cursor.fetchall()]


def _target_expression() -> str:
    return "coalesce(total_sale, 0) - coalesce(service_fee, 0)"


def _full_deduction_expression() -> str:
    return """
        coalesce(total_sale, 0)
        - coalesce(service_fee, 0)
        - coalesce(seller_discount_coupon, 0)
        - coalesce(downloadable_coupon, 0)
        - coalesce(seller_service_fee, 0)
        - coalesce(store_fee_discount, 0)
        - coalesce(debt_of_last_week, 0)
        + coalesce(pending_released_amount, 0)
    """


def _target_mismatch_count_sql() -> str:
    return f"""
        select count(*)
        from settlement
        where coalesce(settlement_target_amount, 0) <> {_target_expression()}
    """


def _amount_equals_total_minus_fee_count_sql() -> str:
    return f"""
        select count(*)
        from settlement
        where coalesce(settlement_amount, 0) = {_target_expression()}
    """


def _amount_equals_target_minus_fee_count_sql() -> str:
    return """
        select count(*)
        from settlement
        where coalesce(settlement_amount, 0)
            = coalesce(settlement_target_amount, 0) - coalesce(service_fee, 0)
    """


def _amount_equals_full_candidate_count_sql() -> str:
    return f"""
        select count(*)
        from settlement
        where coalesce(settlement_amount, 0) = {_full_deduction_expression()}
    """


def _totals_sql() -> str:
    return """
        select
            count(*)::int as row_count,
            coalesce(sum(total_sale), 0)::bigint as total_sale_sum,
            coalesce(sum(service_fee), 0)::bigint as service_fee_sum,
            coalesce(sum(settlement_target_amount), 0)::bigint as settlement_target_amount_sum,
            coalesce(sum(settlement_amount), 0)::bigint as settlement_amount_sum,
            coalesce(sum(pending_released_amount), 0)::bigint as pending_released_amount_sum,
            coalesce(sum(seller_discount_coupon), 0)::bigint as seller_discount_coupon_sum,
            coalesce(sum(downloadable_coupon), 0)::bigint as downloadable_coupon_sum,
            coalesce(sum(seller_service_fee), 0)::bigint as seller_service_fee_sum,
            coalesce(sum(store_fee_discount), 0)::bigint as store_fee_discount_sum,
            coalesce(sum(debt_of_last_week), 0)::bigint as debt_of_last_week_sum
        from settlement
    """


def _by_type_status_sql() -> str:
    return """
        select
            settlement_type,
            status,
            count(*)::int as row_count,
            coalesce(sum(total_sale), 0)::bigint as total_sale_sum,
            coalesce(sum(service_fee), 0)::bigint as service_fee_sum,
            coalesce(sum(settlement_target_amount), 0)::bigint as settlement_target_amount_sum,
            coalesce(sum(settlement_amount), 0)::bigint as settlement_amount_sum
        from settlement
        group by settlement_type, status
        order by settlement_type, status
    """


def _target_mismatch_sql() -> str:
    return f"""
        select
            settlements_id,
            shop_type,
            shop_id,
            settlement_type,
            settlement_date,
            total_sale,
            service_fee,
            settlement_target_amount,
            {_target_expression()} as calculated_settlement_target_amount,
            coalesce(settlement_target_amount, 0) - ({_target_expression()}) as difference,
            status
        from settlement
        where coalesce(settlement_target_amount, 0) <> {_target_expression()}
        order by abs(coalesce(settlement_target_amount, 0) - ({_target_expression()})) desc,
                 settlements_id desc
        limit %s
    """


def _top_amount_rows_sql() -> str:
    return f"""
        select
            settlements_id,
            settlement_date,
            shop_id,
            settlement_type,
            total_sale,
            service_fee,
            settlement_target_amount,
            settlement_amount,
            {_target_expression()} as calculated_settlement_target_amount,
            status
        from settlement
        order by abs(coalesce(settlement_amount, 0)) desc, settlements_id desc
        limit %s
    """


if __name__ == "__main__":
    raise SystemExit(main())
