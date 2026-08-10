"""Read-only production audit for admin list and aggregate endpoints."""

from __future__ import annotations

import json
from collections.abc import Mapping

from fastapi.testclient import TestClient

import cubici_service.app as app_module


async def _allow_request(*_args, **_kwargs):
    return None


app_module.enforce_master_admin_for_protected_api = _allow_request
app_module.enforce_user_ownership_for_common_api = _allow_request


ENDPOINTS = [
    ("management_overview", "/v1/api/management/overview", {}),
    ("member_summary", "/v1/api/management/member-summary", {}),
    ("member_info", "/v1/api/management/member-info", {"limit": 1, "offset": 0}),
    ("member_payments", "/v1/api/management/member-payments", {"limit": 1, "offset": 0}),
    ("member_charge_changes", "/v1/api/management/member-charge-changes", {"limit": 1, "offset": 0}),
    ("member_withdrawals", "/v1/api/management/member-withdrawals", {"limit": 1, "offset": 0}),
    ("management_usage", "/v1/api/management/usage", {"limit": 1, "offset": 0}),
    ("error_logs", "/v1/api/monitoring/error-logs", {"limit": 1, "offset": 0}),
    ("server_status", "/v1/api/monitoring/server-status", {"hours": 24}),
    ("admin_accounts", "/v1/api/preferences/admin-accounts", {"limit": 1, "offset": 0}),
    ("promotions", "/v1/api/preferences/promotions", {"limit": 1, "offset": 0}),
    ("promotion_options", "/v1/api/preferences/promotions/options", {}),
    ("partners", "/v1/api/preferences/partners", {"limit": 1, "offset": 0}),
    ("moneybank_products", "/v1/api/preferences/moneybank-products", {"limit": 1, "offset": 0}),
    ("prizm_config_items", "/v1/api/preferences/prizm-config/items", {"limit": 1, "offset": 0}),
    ("prizm_update_records", "/v1/api/preferences/prizm-config/update-records", {"limit": 1, "offset": 0}),
    ("raw_data_tables", "/v1/api/preferences/raw-data/tables", {}),
    ("raw_data_formulas", "/v1/api/preferences/raw-data/formulas", {"limit": 1, "offset": 0}),
    ("charges", "/v1/api/preferences/charges", {"limit": 1, "offset": 0}),
    ("settlements", "/v1/api/settlements", {"limit": 1, "offset": 0}),
    ("contracts", "/v1/api/contracts", {"limit": 1, "offset": 0}),
    ("fintech_status", "/v1/api/fintech/status", {}),
    ("fintech_trade_requests", "/v1/api/fintech/trade-requests", {"limit": 1, "offset": 0}),
    ("fintech_firm_requests", "/v1/api/fintech/firm-requests", {"limit": 1, "offset": 0}),
    ("fintech_result_inquiries", "/v1/api/fintech/result-inquiries", {"limit": 1, "offset": 0}),
    ("redemptions", "/v1/api/redemptions", {"limit": 1, "offset": 0}),
    ("risk_results", "/v1/api/risk-results", {"limit": 1, "offset": 0}),
    ("support_inquiries", "/v1/api/support/inquiries", {"limit": 1, "offset": 0}),
    ("message_templates", "/v1/api/support/message-templates", {"limit": 1, "offset": 0}),
    ("notice_board", "/v1/api/support/boards/notice", {"limit": 1, "offset": 0}),
    ("faq_board", "/v1/api/support/boards/faq", {"limit": 1, "offset": 0}),
]


def _count_hint(payload) -> int | None:
    if isinstance(payload, Mapping):
        for key in ("total", "count"):
            if isinstance(payload.get(key), int):
                return payload[key]
        counts = payload.get("counts")
        if isinstance(counts, Mapping):
            for key in ("total", "total_count", "member_count", "all_count"):
                if isinstance(counts.get(key), int):
                    return counts[key]
        for key in ("items", "metrics", "tables", "columns", "formulas"):
            if isinstance(payload.get(key), list):
                return len(payload[key])
    if isinstance(payload, list):
        return len(payload)
    return None


def _shape(payload) -> list[str]:
    if isinstance(payload, Mapping):
        return sorted(str(key) for key in payload.keys())
    return [type(payload).__name__]


def _aggregates(payload) -> dict[str, object]:
    if not isinstance(payload, Mapping):
        return {}
    result = {}
    for group_name in ("counts", "sums", "summary", "metrics"):
        group = payload.get(group_name)
        if not isinstance(group, Mapping):
            continue
        numeric = {
            str(key): value
            for key, value in group.items()
            if isinstance(value, (int, float, bool)) and not isinstance(value, str)
        }
        if numeric:
            result[group_name] = numeric
    return result


def _first_item(payload):
    if not isinstance(payload, Mapping):
        return None
    for key in ("items", "list"):
        values = payload.get(key)
        if isinstance(values, list) and values:
            return values[0]
    return None


def _detail_requests(payloads: Mapping[str, object]):
    requests = []

    def add(name: str, source: str, path_builder):
        row = _first_item(payloads.get(source))
        if row:
            requests.append((name, path_builder(row)))

    add("member_status_detail", "member_info", lambda row: f"/v1/api/management/member-status/{row['user_no']}")
    add("management_usage_detail", "management_usage", lambda row: f"/v1/api/management/usage/{row['mbid']}")
    add("promotion_detail", "promotions", lambda row: f"/v1/api/preferences/promotions/{row['promo_code']}")
    add("partner_detail", "partners", lambda row: f"/v1/api/preferences/partners/{row['partner_id']}")
    add(
        "prizm_config_detail",
        "prizm_config_items",
        lambda row: f"/v1/api/preferences/prizm-config/items/{row['division']}/{row['subject_no']}/{row['item_no']}",
    )
    add("raw_data_columns", "raw_data_tables", lambda row: f"/v1/api/preferences/raw-data/tables/{row}/columns")
    add("charge_detail", "charges", lambda row: f"/v1/api/preferences/charges/{row['charge_code']}")
    add("settlement_detail", "settlements", lambda row: f"/v1/api/settlements/{row['settlements_id']}")
    add("contract_detail", "contracts", lambda row: f"/v1/api/contracts/{row['mbid']}")
    add("contract_documents", "contracts", lambda row: f"/v1/api/contracts/{row['mbid']}/documents/files")
    add("contract_review_notes", "contracts", lambda row: f"/v1/api/contracts/{row['mbid']}/review-notes")
    add(
        "fintech_trade_detail",
        "fintech_trade_requests",
        lambda row: "/v1/api/fintech/trade-requests/{req_date}/{bank_code}/{comp_code}/{seq_no}".format(**row),
    )
    add("redemption_detail", "redemptions", lambda row: f"/v1/api/redemptions/{row['mbid']}")
    add("redemption_history", "redemptions", lambda row: f"/v1/api/redemptions/{row['mbid']}/operation-history")
    add("support_inquiry_detail", "support_inquiries", lambda row: f"/v1/api/support/inquiries/{row['qna_id']}")
    add("message_template_detail", "message_templates", lambda row: f"/v1/api/support/message-templates/{row['message_no']}")
    add("notice_detail", "notice_board", lambda row: f"/v1/api/support/boards/notice/{row['post_id']}")
    add("faq_detail", "faq_board", lambda row: f"/v1/api/support/boards/faq/{row['post_id']}")
    return requests


def main() -> None:
    results = []
    payloads = {}
    with TestClient(app_module.create_app()) as client:
        for name, path, params in ENDPOINTS:
            try:
                response = client.get(path, params=params)
                payload = response.json()
                if response.status_code == 200:
                    payloads[name] = payload
                results.append(
                    {
                        "name": name,
                        "path": path,
                        "status": response.status_code,
                        "count": _count_hint(payload),
                        "shape": _shape(payload) if response.status_code == 200 else [],
                        "aggregates": _aggregates(payload) if response.status_code == 200 else {},
                        "error": None if response.status_code == 200 else str(payload.get("detail", "request failed"))[:160],
                    }
                )
            except Exception as error:  # The audit must continue after one broken endpoint.
                results.append(
                    {
                        "name": name,
                        "path": path,
                        "status": 0,
                        "count": None,
                        "shape": [],
                        "aggregates": {},
                        "error": f"{type(error).__name__}: {error}"[:160],
                    }
                )

        for name, path in _detail_requests(payloads):
            try:
                response = client.get(path)
                payload = response.json()
                results.append(
                    {
                        "name": name,
                        "path": path.rsplit("/", 1)[0] + "/{id}",
                        "status": response.status_code,
                        "count": _count_hint(payload),
                        "shape": _shape(payload) if response.status_code == 200 else [],
                        "aggregates": _aggregates(payload) if response.status_code == 200 else {},
                        "error": None if response.status_code == 200 else str(payload.get("detail", "request failed"))[:160],
                    }
                )
            except Exception as error:
                results.append(
                    {
                        "name": name,
                        "path": "detail",
                        "status": 0,
                        "count": None,
                        "shape": [],
                        "aggregates": {},
                        "error": f"{type(error).__name__}: {error}"[:160],
                    }
                )

    print(json.dumps({"results": results}, ensure_ascii=True))


if __name__ == "__main__":
    main()
