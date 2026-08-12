"""Run aggregate-only data quality checks for Cubici administrator datasets."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SERVICE_SRC = ROOT / "service-api" / "src"
if str(SERVICE_SRC) not in sys.path:
    sys.path.insert(0, str(SERVICE_SRC))

from cubici_service.db.connection import get_connection  # noqa: E402


Check = tuple[str, str, str, str, str]


CHECKS: dict[str, list[Check]] = {
    "members": [
        ("MEM-01", "critical", "integrity", "users primary email duplicate", "select count(*) from (select lower(btrim(email)) from users group by lower(btrim(email)) having count(*) > 1) q"),
        ("MEM-02", "high", "validity", "unsupported user_type", "select count(*) from users where coalesce(upper(btrim(user_type)), '') not in ('USER', 'ADMIN_USER', 'FINTECH_USER')"),
        ("MEM-03", "high", "completeness", "USER missing required company identity", "select count(*) from users where upper(coalesce(user_type, '')) = 'USER' and (nullif(btrim(email), '') is null or nullif(btrim(name), '') is null or nullif(btrim(biz_num), '') is null or nullif(btrim(biz_name), '') is null)"),
        ("MEM-04", "medium", "integrity", "USER partner_code without partner master", "select count(*) from users u left join partner p on p.partner_code = u.partner_code where upper(coalesce(u.user_type, '')) = 'USER' and nullif(btrim(u.partner_code), '') is not null and p.partner_id is null"),
        ("MEM-05", "medium", "validity", "future user registration date", "select count(*) from users where reg_date > now() + interval '1 day'"),
    ],
    "moneybank": [
        ("MB-01", "critical", "integrity", "contract without user", "select count(*) from moneybank_contract c left join users u on u.user_no = c.user_no where u.user_no is null"),
        ("MB-02", "high", "validity", "unsupported contract status", "select count(*) from moneybank_contract where coalesce(upper(btrim(status)), '') not in ('REQUEST','PENDING_DOCUMENTS','DOCUMENTS_CONFIRMED','PENDING_REVIEW','CONDITIONS_ACCEPT','USE_AGREE','ACCOUNT_STANDBY','CONTRACT','EXPIRED','CONDITIONS_REFUSED','TERMS_REFUSED','REJECTED','REJECT','SELF_TERMINATION','FORCE_TERMINATION','ACCOUNT_CLOSED','TERMINATION','JOIN','01','02','03','04','05','06','07','41','51','72','73','81','82')"),
        ("MB-03", "high", "consistency", "contract date sequence contradiction", "select count(*) from moneybank_contract where (approval_date is not null and request_date is not null and approval_date < request_date) or (contract_date is not null and approval_date is not null and contract_date < approval_date) or (expire_date is not null and contract_date is not null and expire_date < contract_date)"),
        ("MB-04", "critical", "integrity", "redemption row without contract", "select (select count(*) from moneybank_redemption_history h left join moneybank_contract c on c.mbid=h.mbid where c.mbid is null) + (select count(*) from moneybank_redemption_provision p left join moneybank_contract c on c.mbid=p.mbid where c.mbid is null) + (select count(*) from moneybank_redemption_repayment r left join moneybank_contract c on c.mbid=r.mbid where c.mbid is null) + (select count(*) from moneybank_redemption_deposit d left join moneybank_contract c on c.mbid=d.mbid where c.mbid is null) + (select count(*) from moneybank_redemption_sales s left join moneybank_contract c on c.mbid=s.mbid where c.mbid is null)"),
        ("MB-05", "critical", "consistency", "redemption history balance formula mismatch", "select count(*) from moneybank_redemption_history where coalesce(outstanding_balance,0) <> coalesce(cumulative_provision_amount,0)-coalesce(cumulative_repayment_amount,0)"),
        ("MB-06", "high", "validity", "negative redemption amount", "select (select count(*) from moneybank_redemption_history where coalesce(cumulative_provision_amount,0)<0 or coalesce(cumulative_repayment_amount,0)<0 or coalesce(outstanding_balance,0)<0) + (select count(*) from moneybank_redemption_provision where coalesce(total_payment_amount,0)<0 or coalesce(total_usage_fee,0)<0 or coalesce(total_provision_amount,0)<0) + (select count(*) from moneybank_redemption_repayment where coalesce(repayment_amount,0)<0 or coalesce(repayment_usage_fee,0)<0 or coalesce(remittance_fee,0)<0)"),
        ("MB-07", "high", "consistency", "provision exceeds payment", "select count(*) from moneybank_redemption_provision where coalesce(total_provision_amount,0) > coalesce(total_payment_amount,0)"),
        ("MB-08", "high", "uniqueness", "duplicate business operation code", "select (select count(*) from (select provision_code from moneybank_redemption_provision where nullif(btrim(provision_code),'') is not null group by provision_code having count(*)>1) q) + (select count(*) from (select repayment_code from moneybank_redemption_repayment where nullif(btrim(repayment_code),'') is not null group by repayment_code having count(*)>1) q) + (select count(*) from (select sales_code from moneybank_redemption_sales where nullif(btrim(sales_code),'') is not null group by sales_code having count(*)>1) q)"),
        ("MB-09", "critical", "consistency", "settlement target formula mismatch", "select count(*) from settlement where coalesce(settlement_target_amount,0) <> coalesce(total_sale,0)-coalesce(service_fee,0)"),
        ("MB-10", "medium", "uniqueness", "duplicate settlement business grain", "select count(*) from (select shop_type,shop_id,settlement_type,settlement_date from settlement group by shop_type,shop_id,settlement_type,settlement_date having count(*)>1) q"),
        ("MB-11", "medium", "completeness", "settlement missing date or source key", "select count(*) from settlement where settlement_date is null or nullif(btrim(shop_type),'') is null or nullif(btrim(shop_id),'') is null"),
    ],
    "prism": [
        ("PRI-01", "high", "integrity", "PCS result without user", "select count(*) from prizm_pcs_result p left join users u on u.user_no=p.user_no where u.user_no is null"),
        ("PRI-02", "high", "integrity", "PMS result without user or contract", "select count(*) from prizm_pms_result p left join users u on u.user_no=p.user_no left join moneybank_contract c on c.mbid=p.mbid where u.user_no is null or c.mbid is null"),
        ("PRI-03", "medium", "completeness", "latest PCS/PMS pair incomplete", "with pcs as (select distinct on (mbid,user_no) mbid,user_no from prizm_pcs_result order by mbid,user_no,reg_date desc nulls last,pcs_no desc), pms as (select distinct on (mbid,user_no) mbid,user_no from prizm_pms_result order by mbid,user_no,reg_date desc nulls last,pms_no desc), base as (select * from pcs union select * from pms) select count(*) from base b left join pcs on pcs.mbid is not distinct from b.mbid and pcs.user_no is not distinct from b.user_no left join pms on pms.mbid is not distinct from b.mbid and pms.user_no is not distinct from b.user_no where pcs.user_no is null or pms.user_no is null"),
        ("PRI-04", "medium", "completeness", "Prism item definition or scoring configuration incomplete", "select count(*) from prizm_items where nullif(btrim(item_definition),'') is null or (nullif(btrim(item_weight),'') is null and nullif(btrim(item_standard_low1),'') is null and nullif(btrim(item_standard_high1),'') is null and nullif(btrim(item_standard_low2),'') is null and nullif(btrim(item_standard_high2),'') is null and nullif(btrim(item_standard_low3),'') is null and nullif(btrim(item_standard_high3),'') is null and nullif(btrim(item_standard_low4),'') is null and nullif(btrim(item_standard_high4),'') is null and nullif(btrim(item_standard_low5),'') is null and nullif(btrim(item_standard_high5),'') is null)"),
        ("PRI-05", "high", "validity", "invalid PCS/PMS grade code", "select (select count(*) from prizm_pcs_result where upper(coalesce(prizm_grade,'')) not in ('A','B','C','D','E','N')) + (select count(*) from prizm_pms_result where upper(coalesce(pms_grade,'')) not in ('A','B','C','D','E','N'))"),
        ("PRI-06", "medium", "timeliness", "future Prism result timestamp", "select (select count(*) from prizm_pcs_result where reg_date > now()+interval '1 day') + (select count(*) from prizm_pms_result where reg_date > now()+interval '1 day')"),
    ],
    "settings": [
        ("SET-01", "high", "uniqueness", "duplicate partner code", "select count(*) from (select partner_code from partner group by partner_code having count(*)>1) q"),
        ("SET-02", "medium", "completeness", "active partner missing primary manager", "select count(*) from partner p left join partner_manager pm on pm.partner_code=p.partner_code and pm.manager_type='01' where p.partner_status='00' and pm.partner_code is null"),
        ("SET-03", "high", "integrity", "orphan partner manager", "select count(*) from partner_manager pm left join partner p on p.partner_code=pm.partner_code where p.partner_id is null"),
        ("SET-04", "high", "integrity", "orphan promotion charge", "select count(*) from promotion_charge pc left join promotion p on p.promo_code=pc.promo_code left join charge c on c.charge_code=pc.charge_code where p.promo_code is null or c.charge_code is null"),
        ("SET-05", "medium", "consistency", "promotion date or status contradiction", "select count(*) from promotion where start_date is null or expire_date is null or expire_date < start_date or coalesce(status,'') <> case when start_date <= current_date and expire_date > current_date then 'Y' else 'N' end"),
        ("SET-06", "medium", "validity", "charge invalid date or negative amount", "select count(*) from charge where (start_date is not null and expire_date is not null and expire_date < start_date) or coalesce(amount,0)<0 or coalesce(period,0)<0"),
    ],
    "support": [
        ("SUP-01", "high", "integrity", "inquiry without user", "select count(*) from qna q left join users u on u.user_no=q.user_no where u.user_no is null"),
        ("SUP-02", "high", "integrity", "reply without inquiry", "select count(*) from qna_reply r left join qna q on q.qna_id=r.qna_id where q.qna_id is null"),
        ("SUP-03", "medium", "completeness", "blank inquiry or reply content", "select (select count(*) from qna where nullif(btrim(title),'') is null or nullif(btrim(content),'') is null) + (select count(*) from qna_reply where nullif(btrim(content),'') is null)"),
    ],
}


DENOMINATORS = {
    "members": "select count(*) from users",
    "moneybank": "select (select count(*) from moneybank_contract)+(select count(*) from settlement)+(select count(*) from moneybank_redemption_history)+(select count(*) from moneybank_redemption_provision)+(select count(*) from moneybank_redemption_repayment)",
    "prism": "select (select count(*) from prizm_pcs_result)+(select count(*) from prizm_pms_result)+(select count(*) from prizm_items)",
    "settings": "select (select count(*) from partner)+(select count(*) from partner_manager)+(select count(*) from charge)+(select count(*) from promotion)+(select count(*) from promotion_charge)",
    "support": "select (select count(*) from qna)+(select count(*) from qna_reply)",
}


def run_domain(domain: str, check_filter: str | None = None) -> dict[str, Any]:
    results = []
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("set statement_timeout = '5000ms'")
            cursor.execute(DENOMINATORS[domain])
            denominator = int(cursor.fetchone()[0] or 0)
            selected_checks = [
                check for check in CHECKS[domain] if check_filter is None or check[0] == check_filter
            ]
            if not selected_checks:
                raise ValueError(f"unknown check for {domain}: {check_filter}")
            for check_id, severity, dimension, description, query in selected_checks:
                cursor.execute(query)
                issue_count = int(cursor.fetchone()[0] or 0)
                results.append(
                    {
                        "check_id": check_id,
                        "severity": severity,
                        "dimension": dimension,
                        "description": description,
                        "issue_count": issue_count,
                        "issue_rate_pct": round(issue_count * 100 / denominator, 2) if denominator else 0.0,
                        "status": "issue" if issue_count else "pass",
                    }
                )
    return {
        "checked_at": datetime.now(UTC).isoformat(),
        "domain": domain,
        "aggregate_row_denominator": denominator,
        "checks": results,
        "issue_checks": sum(item["status"] == "issue" for item in results),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--domain", choices=sorted(CHECKS), required=True)
    parser.add_argument("--check", help="run one check ID from the selected domain")
    args = parser.parse_args()
    print(json.dumps(run_domain(args.domain, args.check), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
