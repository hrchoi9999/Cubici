"""Replay legacy PMS, settlement, and integrated-ledger formulas read-only."""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from typing import Any

from psycopg.rows import dict_row


ROOT = Path(__file__).resolve().parents[1]
SERVICE_SRC = ROOT / "service-api" / "src"
if str(SERVICE_SRC) not in sys.path:
    sys.path.insert(0, str(SERVICE_SRC))

from cubici_service.db.connection import get_connection  # noqa: E402


PMS_FEATURES = {
    (2, 1): "bsvc",
    (2, 2): "bsqc",
    (2, 3): "baupc",
    (2, 4): "bdsr",
    (3, 1): "bprc",
    (3, 2): "brrc",
    (3, 3): "bstsc",
    (3, 4): "bdltc",
}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="print the aggregate report as JSON")
    args = parser.parse_args()

    report = build_report()
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2, default=str))
    else:
        print_human_report(report)
    return 0


def build_report() -> dict[str, Any]:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute("set transaction read only")
            cursor.execute("set local statement_timeout = '10000ms'")
            return {
                "mode": "read_only_aggregate",
                "pms": _replay_pms(cursor),
                "settlement": _replay_settlement(cursor),
                "integrated_ledger": _replay_integrated_ledger(cursor),
            }


def _replay_pms(cursor) -> dict[str, Any]:
    cursor.execute(
        """
        select
            subject_no,
            item_no,
            item_weight,
            item_standard_low1,
            item_standard_high1,
            item_standard_low2,
            item_standard_high2,
            item_standard_low3,
            item_standard_high3,
            item_standard_low4,
            item_standard_high4,
            item_standard_low5,
            item_standard_high5
        from prizm_items
        where division = 2
          and (subject_no, item_no) in ((2,1),(2,2),(2,3),(2,4),(3,1),(3,2),(3,3),(3,4))
        order by subject_no, item_no
        """
    )
    configs = {
        (int(row["subject_no"]), int(row["item_no"])): {
            "weight": _decimal(row["item_weight"]),
            "bands": [
                (_optional_decimal(row[f"item_standard_low{score}"]),
                 _optional_decimal(row[f"item_standard_high{score}"]))
                for score in range(1, 6)
            ],
        }
        for row in cursor.fetchall()
    }

    cursor.execute(
        """
        select
            pms_grade,
            pms_score,
            sales_total_score,
            manage_total_score,
            bsvc,
            bsqc,
            baupc,
            bdsr,
            bprc,
            brrc,
            bstsc,
            bdltc
        from prizm_pms_result
        order by pms_no
        """
    )
    rows = [dict(row) for row in cursor.fetchall()]

    cursor.execute(
        """
        select count(*)::int
        from information_schema.tables
        where table_schema = 'public'
          and table_name in (
              'shop_sales_api', 'cbci_interpark_sales', 'cbci_gmarket_sales',
              'cbci_auction_sales', 'cbci_11st_saleaccnt', 'cbci_naver_sales',
              'cbci_coupang_sales'
          )
        """
    )
    raw_source_table_count = int(cursor.fetchone()["count"])
    cursor.execute("select count(*)::int from prizm_raw_data_formula")
    raw_formula_rows = int(cursor.fetchone()["count"])

    variants = {
        "stored_unit": _summarize_pms_variant(rows, configs, Decimal("1")),
        "percent_scaled_x100": _summarize_pms_variant(rows, configs, Decimal("100")),
    }
    return {
        "rows": len(rows),
        "configured_items": len(configs),
        "stored_fractional_score_rows": sum(
            _decimal(row["pms_score"]) != _decimal(row["pms_score"]).to_integral_value()
            for row in rows
        ),
        "raw_source_table_count": raw_source_table_count,
        "raw_formula_rows": raw_formula_rows,
        "transaction_input_replay_available": raw_source_table_count > 0,
        "score_replay_basis": "stored eight PMS feature values and division-2 scoring bands",
        "rounding": "Java String.format-compatible ROUND_HALF_UP",
        "variants": variants,
    }


def _summarize_pms_variant(
    rows: list[dict[str, Any]],
    configs: dict[tuple[int, int], dict[str, Any]],
    scale: Decimal,
) -> dict[str, Any]:
    score_matches = 0
    rounded_stored_score_matches = 0
    grade_matches = 0
    sales_matches = 0
    manage_matches = 0
    complete_rows = 0
    absolute_differences: list[Decimal] = []
    replay_grades: Counter[str] = Counter()
    stored_grades: Counter[str] = Counter()

    for row in rows:
        if any(row[field] is None for field in PMS_FEATURES.values()) or len(configs) != 8:
            continue
        complete_rows += 1
        replay = _calculate_pms(row, configs, scale)
        stored_score = _decimal(row["pms_score"])
        stored_grade = str(row["pms_grade"] or "").strip().upper()
        stored_sales = _decimal(row["sales_total_score"])
        stored_manage = _decimal(row["manage_total_score"])

        score_matches += stored_score == replay["score"]
        rounded_stored_score_matches += _round_decimal(stored_score, 0) == replay["score"]
        grade_matches += stored_grade == replay["grade"]
        sales_matches += stored_sales == replay["sales_total"]
        manage_matches += stored_manage == replay["manage_total"]
        absolute_differences.append(abs(stored_score - replay["score"]))
        replay_grades[replay["grade"]] += 1
        stored_grades[stored_grade or "BLANK"] += 1

    difference_sum = sum(absolute_differences, Decimal("0"))
    return {
        "scale": str(scale),
        "complete_rows": complete_rows,
        "score_matches": score_matches,
        "rounded_stored_score_matches": rounded_stored_score_matches,
        "grade_matches": grade_matches,
        "sales_total_matches": sales_matches,
        "manage_total_matches": manage_matches,
        "mean_absolute_score_difference": str(
            _round_decimal(difference_sum / complete_rows, 2) if complete_rows else Decimal("0")
        ),
        "max_absolute_score_difference": str(max(absolute_differences, default=Decimal("0"))),
        "stored_grade_distribution": dict(sorted(stored_grades.items())),
        "replay_grade_distribution": dict(sorted(replay_grades.items())),
    }


def _calculate_pms(
    row: dict[str, Any],
    configs: dict[tuple[int, int], dict[str, Any]],
    scale: Decimal,
) -> dict[str, Any]:
    weighted: dict[tuple[int, int], Decimal] = {}
    for key, feature_name in PMS_FEATURES.items():
        config = configs[key]
        value = _decimal(row[feature_name]) * scale
        item_score = _band_score(value, config["bands"])
        weighted[key] = _round_decimal(Decimal(item_score) * config["weight"], 1)

    sales_total = sum((weighted[key] for key in PMS_FEATURES if key[0] == 2), Decimal("0"))
    manage_total = sum((weighted[key] for key in PMS_FEATURES if key[0] == 3), Decimal("0"))
    score = _round_decimal(sales_total + manage_total, 0)
    return {
        "score": score,
        "grade": _legacy_pms_grade(score),
        "sales_total": sales_total,
        "manage_total": manage_total,
    }


def _band_score(value: Decimal, bands: list[tuple[Decimal | None, Decimal | None]]) -> int:
    for score, (low, high) in enumerate(bands, start=1):
        if low is not None and value < low:
            continue
        if high is not None and value >= high:
            continue
        return score
    return 0


def _legacy_pms_grade(score: Decimal) -> str:
    if score > 40 and score <= 59:
        return "A"
    if score > 60 and score <= 90:
        return "B"
    if score > 91 and score <= 149:
        return "C"
    if score > 150 and score <= 179:
        return "D"
    if score > 180 and score <= 200:
        return "E"
    return "N"


def _replay_settlement(cursor) -> dict[str, Any]:
    cursor.execute(
        """
        with checked as (
            select
                shop_type,
                settlement_type,
                settlement_amount,
                settlement_target_amount,
                pending_released_amount,
                total_sale,
                service_fee,
                seller_discount_coupon,
                downloadable_coupon,
                seller_service_fee,
                store_fee_discount,
                debt_of_last_week,
                (
                    coalesce(total_sale, 0)
                    - coalesce(service_fee, 0)
                    - coalesce(seller_discount_coupon, 0)
                    - coalesce(downloadable_coupon, 0)
                    - coalesce(seller_service_fee, 0)
                    + coalesce(store_fee_discount, 0)
                    - coalesce(debt_of_last_week, 0)
                )::bigint as fallback_target
            from settlement
        ), reconciled as (
            select *,
                case
                    when coalesce(settlement_target_amount, 0) = 0
                     and coalesce(pending_released_amount, 0) = 0
                     and fallback_target <> 0 then fallback_target
                    else coalesce(settlement_target_amount, 0) - coalesce(pending_released_amount, 0)
                end as generic_check_amount,
                case
                    when upper(coalesce(shop_type, '')) = 'COUPANG'
                     and upper(coalesce(settlement_type, '')) in ('RESERVE', 'WEEKLY')
                     and coalesce(settlement_target_amount, 0) > 0
                     and coalesce(pending_released_amount, 0) = 0
                    then round(coalesce(settlement_target_amount, 0)::numeric * 0.7)::bigint
                    else null
                end as source_check_amount
            from checked
        ), classified as (
            select *,
                coalesce(settlement_amount, 0)
                    - coalesce(source_check_amount, generic_check_amount) as difference,
                case
                    when source_check_amount is not null
                     and abs(coalesce(settlement_amount, 0) - source_check_amount) <= 1
                    then 'SOURCE_RECONCILED'
                    when source_check_amount is not null then 'DIFF'
                    when coalesce(settlement_amount, 0) = generic_check_amount then 'OK'
                    when coalesce(settlement_target_amount, 0) = 0
                     and coalesce(pending_released_amount, 0) = 0
                     and fallback_target = 0
                     and coalesce(settlement_amount, 0) <> 0 then 'LEGACY_BATCH_VALUE'
                    else 'DIFF'
                end as check_status
            from reconciled
        )
        select
            count(*)::int as rows,
            count(*) filter (
                where coalesce(settlement_target_amount, 0)
                   <> coalesce(total_sale, 0) - coalesce(service_fee, 0)
            )::int as target_formula_mismatches,
            count(*) filter (where check_status = 'OK')::int as generic_ok_rows,
            count(*) filter (
                where source_check_amount is not null
                  and coalesce(settlement_amount, 0) <> generic_check_amount
            )::int as previous_generic_diff_rows,
            count(*) filter (where check_status = 'SOURCE_RECONCILED')::int as source_reconciled_rows,
            count(*) filter (where check_status = 'DIFF')::int as post_rule_diff_rows,
            count(*) filter (where check_status = 'LEGACY_BATCH_VALUE')::int as legacy_batch_rows,
            coalesce(sum(abs(difference)) filter (where check_status = 'DIFF'), 0)::bigint
                as post_rule_diff_absolute_amount
        from classified
        """
    )
    summary = dict(cursor.fetchone())

    cursor.execute(
        """
        select
            settlement_type,
            count(*)::int as rows,
            count(*) filter (
                where coalesce(settlement_amount, 0)
                    = round(coalesce(settlement_target_amount, 0)::numeric * 0.7)
            )::int as exact_70_percent_rows,
            count(*) filter (
                where abs(
                    coalesce(settlement_amount, 0)
                    - round(coalesce(settlement_target_amount, 0)::numeric * 0.7)
                ) <= 1
            )::int as within_one_won_rows,
            coalesce(sum(
                coalesce(settlement_amount, 0)
                - round(coalesce(settlement_target_amount, 0)::numeric * 0.7)
            ), 0)::bigint as signed_difference_from_70_percent,
            coalesce(sum(abs(
                coalesce(settlement_amount, 0)
                - round(coalesce(settlement_target_amount, 0)::numeric * 0.7)
            )), 0)::bigint as absolute_difference_from_70_percent,
            coalesce(max(abs(
                coalesce(settlement_amount, 0)
                - round(coalesce(settlement_target_amount, 0)::numeric * 0.7)
            )), 0)::bigint as max_difference_from_70_percent
        from settlement
        where shop_type = 'COUPANG'
        group by settlement_type
        order by settlement_type
        """
    )
    coupang = [dict(row) for row in cursor.fetchall()]

    cursor.execute(
        """
        select count(*)::int
        from information_schema.tables
        where table_schema = 'public'
          and table_name in (
              'cbci_interpark_sales', 'cbci_gmarket_sales', 'cbci_auction_sales',
              'cbci_11st_saleaccnt', 'cbci_naver_sales', 'cbci_coupang_sales'
          )
        """
    )
    raw_source_table_count = int(cursor.fetchone()["count"])
    return {
        **summary,
        "raw_source_table_count": raw_source_table_count,
        "shop_source_replay_available": raw_source_table_count > 0,
        "coupang_70_percent_replay": coupang,
    }


def _replay_integrated_ledger(cursor) -> dict[str, Any]:
    cursor.execute(
        """
        with latest_history as (
            select distinct on (mbid)
                mbid,
                cumulative_provision_amount,
                cumulative_repayment_amount,
                outstanding_balance,
                reg_date
            from moneybank_redemption_history
            order by mbid, reg_date desc nulls last, id desc
        )
        select
            (select count(*)::int from moneybank_contract) as contracts,
            (select count(*)::int from moneybank_redemption_history) as history_rows,
            (select count(*)::int from moneybank_redemption_history
             where coalesce(outstanding_balance, 0)
                <> coalesce(cumulative_provision_amount, 0) - coalesce(cumulative_repayment_amount, 0))
                as history_formula_mismatches,
            (select coalesce(sum(total_provision_amount), 0)::bigint
             from moneybank_redemption_provision) as provision_total,
            (select coalesce(sum(repayment_amount), 0)::bigint
             from moneybank_redemption_repayment) as repayment_total,
            (select coalesce(sum(outstanding_balance), 0)::bigint
             from latest_history) as latest_history_balance_total,
            (select coalesce(count(*), 0)::int from latest_history where outstanding_balance > 0)
                as positive_balance_contracts
        """
    )
    summary = dict(cursor.fetchone())
    summary["replayed_balance"] = summary["provision_total"] - summary["repayment_total"]
    summary["balance_difference"] = (
        summary["latest_history_balance_total"] - summary["replayed_balance"]
    )

    cursor.execute(
        """
        with provision as (
            select mbid, sum(total_provision_amount)::bigint as amount
            from moneybank_redemption_provision
            group by mbid
        ), repayment as (
            select mbid, sum(repayment_amount)::bigint as amount, count(*)::int as rows
            from moneybank_redemption_repayment
            group by mbid
        ), first_history as (
            select distinct on (mbid) mbid, cumulative_repayment_amount
            from moneybank_redemption_history
            order by mbid, reg_date nulls last, id
        ), latest_history as (
            select distinct on (mbid)
                mbid,
                cumulative_provision_amount,
                cumulative_repayment_amount,
                outstanding_balance
            from moneybank_redemption_history
            order by mbid, reg_date desc nulls last, id desc
        ), compared as (
            select
                c.mbid,
                coalesce(p.amount, 0)::bigint as provision_amount,
                coalesce(r.amount, 0)::bigint as repayment_amount,
                coalesce(r.rows, 0)::int as repayment_rows,
                coalesce(fh.cumulative_repayment_amount, 0)::bigint as opening_history_repayment,
                coalesce(lh.cumulative_provision_amount, 0)::bigint as history_provision,
                coalesce(lh.cumulative_repayment_amount, 0)::bigint as history_repayment,
                coalesce(lh.outstanding_balance, 0)::bigint as history_balance
            from moneybank_contract c
            left join provision p using (mbid)
            left join repayment r using (mbid)
            left join first_history fh using (mbid)
            left join latest_history lh using (mbid)
        )
        select
            count(*) filter (where provision_amount <> history_provision)::int
                as provision_scope_difference_contracts,
            coalesce(sum(provision_amount - history_provision), 0)::bigint
                as provision_scope_difference,
            count(*) filter (where repayment_amount <> history_repayment)::int
                as repayment_scope_difference_contracts,
            coalesce(sum(repayment_amount - history_repayment), 0)::bigint
                as repayment_scope_difference,
            count(*) filter (
                where repayment_amount <> history_repayment
                  and repayment_rows = 0
                  and history_repayment - repayment_amount = opening_history_repayment
            )::int as opening_history_explained_contracts,
            coalesce(sum(opening_history_repayment) filter (
                where repayment_amount <> history_repayment
                  and repayment_rows = 0
                  and history_repayment - repayment_amount = opening_history_repayment
            ), 0)::bigint as opening_history_repayment_amount
        from compared
        """
    )
    result = {**summary, **dict(cursor.fetchone())}
    result["reconciled_repayment_total"] = (
        result["repayment_total"] + result["opening_history_repayment_amount"]
    )
    result["reconciled_balance"] = (
        result["provision_total"] - result["reconciled_repayment_total"]
    )
    result["post_opening_balance_difference"] = (
        result["latest_history_balance_total"] - result["reconciled_balance"]
    )
    return result


def print_human_report(report: dict[str, Any]) -> None:
    pms = report["pms"]
    settlement = report["settlement"]
    ledger = report["integrated_ledger"]
    print("# Cubici legacy financial formula replay")
    print("mode=read_only_aggregate")
    print(
        "pms="
        f"rows:{pms['rows']}, raw_replay:{pms['transaction_input_replay_available']}, "
        f"stored_unit_score_matches:{pms['variants']['stored_unit']['score_matches']}, "
        f"stored_unit_grade_matches:{pms['variants']['stored_unit']['grade_matches']}"
    )
    print(
        "settlement="
        f"rows:{settlement['rows']}, target_mismatches:{settlement['target_formula_mismatches']}, "
        f"source_reconciled:{settlement['source_reconciled_rows']}, "
        f"post_rule_diff:{settlement['post_rule_diff_rows']}, "
        f"shop_source_replay:{settlement['shop_source_replay_available']}"
    )
    print(
        "integrated_ledger="
        f"history_formula_mismatches:{ledger['history_formula_mismatches']}, "
        f"balance_difference:{ledger['balance_difference']}, "
        f"opening_history_explained_contracts:{ledger['opening_history_explained_contracts']}, "
        f"opening_history_repayment:{ledger['opening_history_repayment_amount']}, "
        f"post_opening_balance_difference:{ledger['post_opening_balance_difference']}"
    )


def _decimal(value: Any) -> Decimal:
    if value is None or value == "":
        return Decimal("0")
    return Decimal(str(value))


def _optional_decimal(value: Any) -> Decimal | None:
    if value is None or str(value).strip() == "":
        return None
    return Decimal(str(value).strip())


def _round_decimal(value: Decimal, places: int) -> Decimal:
    quantum = Decimal("1").scaleb(-places)
    return value.quantize(quantum, rounding=ROUND_HALF_UP)


if __name__ == "__main__":
    raise SystemExit(main())
