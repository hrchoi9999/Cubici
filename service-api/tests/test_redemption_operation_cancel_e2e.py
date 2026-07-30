import os
from datetime import datetime

import pytest
from fastapi.testclient import TestClient

from cubici_service.accounts.repository import AccountAuthUser, _build_auth_response
from cubici_service.app import create_app
from cubici_service.db.connection import get_connection


pytestmark = [
    pytest.mark.db_e2e,
    pytest.mark.skipif(
        os.getenv("CUBICI_RUN_DB_E2E") != "1",
        reason="set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL E2E tests",
    ),
]


def test_redemption_cancel_uses_latest_balance_after_followup_operations() -> None:
    mbid = _pick_contract_mbid()
    _ensure_reversal_columns()

    suffix = datetime.now().strftime("%H%M%S%f")[:9]
    provision_code = f"TP{suffix}"[:15]
    repayment_code = f"TR{suffix}"[:15]
    followup_provision_code = f"TF{suffix}"[:15]
    cancel_code = f"TC{suffix}"[:15]
    client = TestClient(create_app())
    created_history_ids: list[int] = []
    created_operation_ids: list[int] = []

    try:
        base = _latest_amounts(mbid)
        provision = _post_json(
            client,
            f"/v1/api/redemptions/{mbid}/provisions",
            {
                "provision_code": provision_code,
                "total_payment_amount": 1000,
                "total_usage_fee": 0,
                "total_provision_amount": 1000,
                "status": "PROVISION",
                "operated_by": "local-test",
                "reason": "mixed operation test provision",
                "sales": [],
            },
        )
        _track(provision, created_history_ids, created_operation_ids)

        repayment = _post_json(
            client,
            f"/v1/api/redemptions/{mbid}/repayments",
            {
                "repayment_code": repayment_code,
                "repayment_amount": 400,
                "repayment_usage_fee": 0,
                "remittance_fee": 0,
                "balance_provision_amount": 0,
                "status": "END",
                "operated_by": "local-test",
                "reason": "mixed operation test repayment",
                "deposits": [],
            },
        )
        _track(repayment, created_history_ids, created_operation_ids)

        followup_provision = _post_json(
            client,
            f"/v1/api/redemptions/{mbid}/provisions",
            {
                "provision_code": followup_provision_code,
                "total_payment_amount": 200,
                "total_usage_fee": 0,
                "total_provision_amount": 200,
                "status": "PROVISION",
                "operated_by": "local-test",
                "reason": "mixed operation test followup provision",
                "sales": [],
            },
        )
        _track(followup_provision, created_history_ids, created_operation_ids)

        cancel = _post_json(
            client,
            f"/v1/api/redemptions/{mbid}/operations/{repayment['operation_history_id']}/cancel",
            {
                "cancel_code": cancel_code,
                "operated_by": "local-test",
                "reason": "mixed operation test repayment cancel",
            },
        )
        _track(cancel, created_history_ids, created_operation_ids)

        assert cancel["cumulative_provision_amount"] == base["provision"] + 1200
        assert cancel["cumulative_repayment_amount"] == base["repayment"]
        assert cancel["outstanding_balance"] == (
            cancel["cumulative_provision_amount"]
            - cancel["cumulative_repayment_amount"]
        )

        duplicate_cancel = client.post(
            f"/v1/api/redemptions/{mbid}/operations/{repayment['operation_history_id']}/cancel",
            json={
                "cancel_code": f"TD{suffix}"[:15],
                "operated_by": "local-test",
                "reason": "duplicate cancel must fail",
            },
            headers=_master_admin_headers(),
        )
        assert duplicate_cancel.status_code == 409
    finally:
        _cleanup(
            operation_ids=created_operation_ids,
            history_ids=created_history_ids,
            provision_codes=[provision_code, followup_provision_code],
            repayment_codes=[repayment_code],
        )


def test_provision_cancel_uses_latest_balance_after_followup_operations() -> None:
    mbid = _pick_contract_mbid()
    _ensure_reversal_columns()

    suffix = datetime.now().strftime("%H%M%S%f")[:9]
    provision_code = f"VP{suffix}"[:15]
    repayment_code = f"VR{suffix}"[:15]
    followup_provision_code = f"VF{suffix}"[:15]
    cancel_code = f"VC{suffix}"[:15]
    client = TestClient(create_app())
    created_history_ids: list[int] = []
    created_operation_ids: list[int] = []

    try:
        base = _latest_amounts(mbid)
        provision = _post_json(
            client,
            f"/v1/api/redemptions/{mbid}/provisions",
            {
                "provision_code": provision_code,
                "total_payment_amount": 1000,
                "total_usage_fee": 0,
                "total_provision_amount": 1000,
                "status": "PROVISION",
                "operated_by": "local-test",
                "reason": "provision cancel test provision",
                "sales": [],
            },
        )
        _track(provision, created_history_ids, created_operation_ids)

        repayment = _post_json(
            client,
            f"/v1/api/redemptions/{mbid}/repayments",
            {
                "repayment_code": repayment_code,
                "repayment_amount": 100,
                "repayment_usage_fee": 0,
                "remittance_fee": 0,
                "balance_provision_amount": 0,
                "status": "END",
                "operated_by": "local-test",
                "reason": "provision cancel test repayment",
                "deposits": [],
            },
        )
        _track(repayment, created_history_ids, created_operation_ids)

        followup_provision = _post_json(
            client,
            f"/v1/api/redemptions/{mbid}/provisions",
            {
                "provision_code": followup_provision_code,
                "total_payment_amount": 200,
                "total_usage_fee": 0,
                "total_provision_amount": 200,
                "status": "PROVISION",
                "operated_by": "local-test",
                "reason": "provision cancel test followup provision",
                "sales": [],
            },
        )
        _track(followup_provision, created_history_ids, created_operation_ids)

        cancel = _post_json(
            client,
            f"/v1/api/redemptions/{mbid}/operations/{provision['operation_history_id']}/cancel",
            {
                "cancel_code": cancel_code,
                "operated_by": "local-test",
                "reason": "provision cancel test cancel",
            },
        )
        _track(cancel, created_history_ids, created_operation_ids)

        assert cancel["operation_type"] == "PROVISION_CANCEL"
        assert cancel["cumulative_provision_amount"] == base["provision"] + 200
        assert cancel["cumulative_repayment_amount"] == base["repayment"] + 100
        assert cancel["outstanding_balance"] == (
            cancel["cumulative_provision_amount"]
            - cancel["cumulative_repayment_amount"]
        )
        assert _latest_amounts(mbid) == {
            "provision": cancel["cumulative_provision_amount"],
            "repayment": cancel["cumulative_repayment_amount"],
            "balance": cancel["outstanding_balance"],
        }
    finally:
        _cleanup(
            operation_ids=created_operation_ids,
            history_ids=created_history_ids,
            provision_codes=[provision_code, followup_provision_code],
            repayment_codes=[repayment_code],
        )


def _pick_contract_mbid() -> str:
    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("select mbid from moneybank_contract order by mbid limit 1")
                row = cursor.fetchone()
    except Exception as exc:  # pragma: no cover - local environment guard
        pytest.skip(f"local PostgreSQL is unavailable: {exc}")

    if row is None:
        pytest.skip("moneybank_contract has no rows")
    return row[0].strip()


def _ensure_reversal_columns() -> None:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                select count(1)
                from information_schema.columns
                where table_name = 'moneybank_redemption_operation_history'
                  and column_name in (
                      'is_reversal',
                      'reversed_operation_history_id',
                      'canceled_by_operation_history_id'
                  )
                """
            )
            if cursor.fetchone()[0] != 3:
                pytest.skip("redemption operation reversal migration is not applied")


def _latest_amounts(mbid: str) -> dict[str, int]:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                select
                    coalesce(cumulative_provision_amount, 0),
                    coalesce(cumulative_repayment_amount, 0),
                    coalesce(outstanding_balance, 0)
                from moneybank_redemption_history
                where mbid = %s
                order by reg_date desc nulls last, id desc
                limit 1
                """,
                (mbid,),
            )
            row = cursor.fetchone()

    if row is None:
        return {"provision": 0, "repayment": 0, "balance": 0}
    return {"provision": row[0], "repayment": row[1], "balance": row[2]}


def _post_json(client: TestClient, path: str, payload: dict) -> dict:
    response = client.post(path, json=payload, headers=_master_admin_headers())
    assert response.status_code == 200, response.text
    return response.json()


def _master_admin_headers() -> dict[str, str]:
    auth = _build_auth_response(
        AccountAuthUser(
            user_no=900000000,
            email=os.getenv("CUBICI_MASTER_ADMIN_EMAIL", "admin@example.com"),
            user_type="ADMIN_USER",
            name="DB E2E Admin",
            phone=None,
            biz_num=None,
            biz_name=None,
        )
    )
    return {"Authorization": f"Bearer {auth.access_token}"}


def _track(body: dict, history_ids: list[int], operation_ids: list[int]) -> None:
    history_ids.append(body["history_id"])
    operation_ids.append(body["operation_history_id"])


def _cleanup(
    *,
    operation_ids: list[int],
    history_ids: list[int],
    provision_codes: list[str],
    repayment_codes: list[str],
) -> None:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            if operation_ids:
                cursor.execute(
                    "delete from moneybank_redemption_operation_history where id = any(%s)",
                    (operation_ids,),
                )
            if history_ids:
                cursor.execute(
                    "delete from moneybank_redemption_history where id = any(%s)",
                    (history_ids,),
                )
            cursor.execute(
                "delete from moneybank_redemption_provision where provision_code = any(%s)",
                (provision_codes,),
            )
            cursor.execute(
                "delete from moneybank_redemption_repayment where repayment_code = any(%s)",
                (repayment_codes,),
            )
