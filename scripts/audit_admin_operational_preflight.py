"""Fast DB/API preflight for Cubici admin operating-data screens.

This script intentionally avoids printing row-level personal, account, or payment
identifiers. It checks HTTP status and aggregate counts only.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import sys
from time import perf_counter
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SERVICE_API_SRC = PROJECT_ROOT / "service-api" / "src"
if str(SERVICE_API_SRC) not in sys.path:
    sys.path.insert(0, str(SERVICE_API_SRC))

from fastapi.testclient import TestClient  # noqa: E402

from cubici_service.app import create_app  # noqa: E402


@dataclass(frozen=True)
class Check:
    screen: str
    url: str
    expected_data: bool = False
    deferred: bool = False
    note: str = ""


@dataclass(frozen=True)
class Result:
    screen: str
    url: str
    status: str
    http_status: int | str
    count: str
    elapsed_ms: int
    note: str


BASE_CHECKS = [
    Check("Health/DB", "/v1/api/health/db", expected_data=True),
    Check("통합정보 > 큐빅아이", "/v1/api/management/member-summary?unit=day", expected_data=True),
    Check("통합정보 > 머니뱅크", "/v1/api/management/overview?unit=day", expected_data=True),
    Check("회원관리 > 회원현황 요약", "/v1/api/management/member-summary?unit=day", expected_data=True),
    Check("회원관리 > 회원정보", "/v1/api/management/member-info?limit=5&offset=0", expected_data=True),
    Check("회원관리 > 탈퇴/해지 현황", "/v1/api/management/member-withdrawals?limit=5&offset=0", expected_data=True),
    Check("회원관리 > 결제현황", "/v1/api/management/member-payments?limit=5&offset=0"),
    Check("회원관리 > 요금제 변경/환불", "/v1/api/management/member-charge-changes?limit=5&offset=0"),
    Check("머니뱅크 관리 > 통합 현황", "/v1/api/management/overview?unit=day", expected_data=True),
    Check("머니뱅크 관리 > 이용상세", "/v1/api/management/usage?limit=5&offset=0", expected_data=True),
    Check("머니뱅크 운영 > 신청 접수", "/v1/api/contracts?limit=5&offset=0", expected_data=True),
    Check("머니뱅크 운영 > 심사 승인", "/v1/api/contracts?limit=5&offset=0&status=10", expected_data=False),
    Check("머니뱅크 운영 > 계약 관리", "/v1/api/contracts?limit=5&offset=0", expected_data=True),
    Check("머니뱅크 운영 > 판매 목록", "/v1/api/sales/orders?limit=5&offset=0", expected_data=True),
    Check("머니뱅크 운영 > 반품/클레임", "/v1/api/sales/returns?limit=5&offset=0"),
    Check("머니뱅크 운영 > 정산 관리", "/v1/api/settlements?limit=5&offset=0", expected_data=True),
    Check("머니뱅크 운영 > 상환 관리", "/v1/api/redemptions?limit=5&offset=0", expected_data=True),
    Check("머니뱅크 운영 > Prism 평가결과", "/v1/api/risk-results?limit=5&offset=0", expected_data=True),
    Check("고객관리 > 고객문의", "/v1/api/support/inquiries?limit=5&offset=0"),
    Check("고객관리 > 문자/이메일", "/v1/api/support/message-templates?limit=5&offset=0"),
    Check("고객관리 > 공지", "/v1/api/support/boards/notice?limit=5&offset=0"),
    Check("고객관리 > FAQ", "/v1/api/support/boards/faq?limit=5&offset=0"),
    Check("모니터링 > Error Log", "/v1/api/monitoring/error-logs?limit=5&offset=0"),
    Check("모니터링 > 서버 관리", "/v1/api/monitoring/server-status?hours=24", expected_data=True),
    Check("모니터링 > 펌뱅킹 상태", "/v1/api/fintech/status", deferred=True, note="외부 실송금은 2차 범위"),
    Check("모니터링 > 펌뱅킹 요청 전문", "/v1/api/fintech/trade-requests?limit=5&offset=0", deferred=True),
    Check("모니터링 > 펌뱅킹 금융사 요청", "/v1/api/fintech/firm-requests?limit=5&offset=0", deferred=True),
    Check("모니터링 > 펌뱅킹 결과조회", "/v1/api/fintech/result-inquiries?limit=5&offset=0", deferred=True),
    Check("환경설정 > 관리자 등록", "/v1/api/preferences/admin-accounts?limit=5&offset=0"),
    Check("환경설정 > 요금제 관리", "/v1/api/preferences/charges?limit=5&offset=0"),
    Check("환경설정 > 연계코드 관리", "/v1/api/preferences/promotions?limit=5&offset=0"),
    Check("환경설정 > 협력사 관리", "/v1/api/preferences/partners?limit=5&offset=0"),
    Check("환경설정 > 금융상품 관리", "/v1/api/preferences/moneybank-products?limit=5&offset=0", deferred=True, note="기준데이터 확정은 2차 범위"),
    Check("환경설정 > Prism 항목", "/v1/api/preferences/prizm-config/items?limit=5&offset=0", expected_data=True),
    Check("환경설정 > RawData 테이블", "/v1/api/preferences/raw-data/tables", deferred=True, note="정밀 산식 연동은 2차 범위"),
    Check("환경설정 > RawData 산식", "/v1/api/preferences/raw-data/formulas", deferred=True, note="정밀 산식 연동은 2차 범위"),
]


def _extract_count(payload: Any) -> str:
    if isinstance(payload, list):
        return str(len(payload))
    if not isinstance(payload, dict):
        return "-"
    if "total" in payload:
        return str(payload.get("total", 0))
    if "application_table_count" in payload:
        return str(payload.get("application_table_count", 0))
    if "items" in payload and isinstance(payload["items"], list):
        return str(len(payload["items"]))
    if "metrics" in payload and isinstance(payload["metrics"], dict):
        metrics = payload["metrics"]
        for key in ("cubici_total_count", "moneybank_total_count", "terminated_total_count"):
            if key in metrics:
                return str(metrics[key])
    if "summary" in payload and isinstance(payload["summary"], dict):
        summary = payload["summary"]
        if "contract_total_count" in summary:
            return str(summary["contract_total_count"])
    if "metrics" in payload and isinstance(payload["metrics"], list):
        return str(len(payload["metrics"]))
    return "-"


def _extra_note(payload: Any, default_note: str) -> str:
    notes = [default_note] if default_note else []
    if isinstance(payload, dict) and isinstance(payload.get("summary"), dict):
        diff = payload["summary"].get("balance_reconcile_diff")
        if diff not in (None, 0):
            notes.append(f"잔여 원장 차이 {diff}")
    if isinstance(payload, dict) and "overall_status" in payload:
        notes.append(f"overall={payload['overall_status']}")
    if isinstance(payload, dict) and "mode" in payload:
        notes.append(f"mode={payload['mode']}")
    return "; ".join(notes)


def _status_for(check: Check, http_status: int, payload: Any, note: str) -> str:
    if http_status >= 400:
        return "FAIL"
    count = _extract_count(payload)
    if check.deferred:
        return "DEFERRED"
    if "잔여 원장 차이" in note:
        return "REVIEW"
    if check.expected_data and count == "0":
        return "EMPTY_REVIEW"
    return "OK"


def run_check(client: TestClient, check: Check) -> tuple[Result, Any]:
    started = perf_counter()
    try:
        response = client.get(check.url)
        elapsed_ms = int((perf_counter() - started) * 1000)
        payload = response.json() if response.content else {}
        note = _extra_note(payload, check.note)
        return (
            Result(
                screen=check.screen,
                url=check.url,
                status=_status_for(check, response.status_code, payload, note),
                http_status=response.status_code,
                count=_extract_count(payload),
                elapsed_ms=elapsed_ms,
                note=note,
            ),
            payload,
        )
    except Exception as exc:  # noqa: BLE001
        elapsed_ms = int((perf_counter() - started) * 1000)
        return (
            Result(
                screen=check.screen,
                url=check.url,
                status="FAIL",
                http_status="EXC",
                count="-",
                elapsed_ms=elapsed_ms,
                note=type(exc).__name__,
            ),
            None,
        )


def _first_item(payload: Any) -> dict[str, Any] | None:
    if not isinstance(payload, dict):
        return None
    items = payload.get("items")
    if not isinstance(items, list) or not items:
        return None
    first = items[0]
    return first if isinstance(first, dict) else None


def _dynamic_checks(cached_payloads: dict[str, Any]) -> list[Check]:
    checks: list[Check] = []
    member = _first_item(cached_payloads.get("/v1/api/management/member-info?limit=5&offset=0"))
    if member and member.get("user_no"):
        checks.append(Check("회원관리 > 회원명 상세", f"/v1/api/management/member-status/{member['user_no']}", expected_data=True))
    usage = _first_item(cached_payloads.get("/v1/api/management/usage?limit=5&offset=0"))
    if usage and usage.get("mbid"):
        checks.append(Check("머니뱅크 관리 > 이용상세 상세", f"/v1/api/management/usage/{usage['mbid']}", expected_data=True))
    contract = _first_item(cached_payloads.get("/v1/api/contracts?limit=5&offset=0"))
    if contract and contract.get("mbid"):
        mbid = contract["mbid"]
        checks.extend(
            [
                Check("머니뱅크 운영 > 계약 상세", f"/v1/api/contracts/{mbid}", expected_data=True),
                Check("머니뱅크 운영 > 심사메모", f"/v1/api/contracts/{mbid}/review-notes"),
                Check("머니뱅크 운영 > 제출서류", f"/v1/api/contracts/{mbid}/documents/files"),
                Check("머니뱅크 운영 > 상환 작업이력", f"/v1/api/redemptions/{mbid}/operation-history?limit=5&offset=0"),
            ]
        )
    settlement = _first_item(cached_payloads.get("/v1/api/settlements?limit=5&offset=0"))
    if settlement and settlement.get("settlements_id"):
        checks.append(Check("머니뱅크 운영 > 정산 상세", f"/v1/api/settlements/{settlement['settlements_id']}", expected_data=True))
    redemption = _first_item(cached_payloads.get("/v1/api/redemptions?limit=5&offset=0"))
    if redemption and redemption.get("mbid"):
        checks.append(Check("머니뱅크 운영 > 상환 상세", f"/v1/api/redemptions/{redemption['mbid']}", expected_data=True))
    return checks


def print_table(results: list[Result]) -> None:
    print("| 화면 | 상태 | HTTP | count | ms | 비고 |")
    print("|---|---:|---:|---:|---:|---|")
    for result in results:
        note = result.note.replace("|", "/") if result.note else ""
        print(
            f"| {result.screen} | {result.status} | {result.http_status} | "
            f"{result.count} | {result.elapsed_ms} | {note} |"
        )


def main() -> int:
    client = TestClient(create_app())
    results: list[Result] = []
    cached_payloads: dict[str, Any] = {}
    for check in BASE_CHECKS:
        result, payload = run_check(client, check)
        results.append(result)
        cached_payloads[check.url] = payload
    for check in _dynamic_checks(cached_payloads):
        result, _payload = run_check(client, check)
        results.append(result)

    print_table(results)
    fail_count = sum(1 for result in results if result.status == "FAIL")
    review_count = sum(1 for result in results if result.status in {"REVIEW", "EMPTY_REVIEW"})
    deferred_count = sum(1 for result in results if result.status == "DEFERRED")
    print()
    print(f"SUMMARY total={len(results)} fail={fail_count} review={review_count} deferred={deferred_count}")
    return 1 if fail_count else 0


if __name__ == "__main__":
    raise SystemExit(main())
