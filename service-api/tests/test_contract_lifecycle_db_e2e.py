import os
from datetime import datetime

import pytest
from fastapi.testclient import TestClient

from cubici_service.accounts.repository import AccountAuthUser, _build_auth_response
from cubici_service.app import create_app
from cubici_service.core.config import get_settings
from cubici_service.db.connection import get_connection


pytestmark = [
    pytest.mark.db_e2e,
    pytest.mark.skipif(
        os.getenv("CUBICI_RUN_DB_E2E") != "1",
        reason="set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL E2E tests",
    ),
]


def test_contract_lifecycle_reaches_account_standby_with_real_db() -> None:
    client = TestClient(create_app())
    suffix = datetime.now().strftime("%H%M%S%f")[:9]
    user_no = _next_id("users", "user_no")
    shop_account_id = _next_id("shop_accounts", "id")
    mbid: str | None = None

    try:
        _insert_test_user(user_no=user_no, suffix=suffix)
        _insert_test_shop_account(
            shop_account_id=shop_account_id,
            user_no=user_no,
            suffix=suffix,
        )

        created = _post_json(
            client,
            "/v1/api/contracts/requests",
            {
                "user_no": user_no,
                "request_shop_types": ["NAVER"],
                "product_code": "MP",
                "sales_amount": 2_400_000,
                "representative_age": 42,
                "identity_confirmed": True,
                "identity_verification_method": "id_card",
                "identity_verification_status": "mock_verified",
                "identity_verification_reference": "MOCK-ID-800101-1234",
                "terms_agreed": True,
                "submitted_document_types": ["CBInfo", "regNo"],
                "requested_by": "local-db-e2e",
            },
        )
        mbid = created["mbid"]
        assert created["status"] == "REQUEST"
        assert created["shop_count"] == 1
        assert created["requested_shop_types"] == ["NAVER"]

        adjusted = _put_json(
            client,
            f"/v1/api/contracts/{mbid}/fees/adjust",
            {
                "adjusted_by": "local-db-e2e",
                "reason": "contract lifecycle db e2e",
                "payment_rate": 80,
                "sales_limit_per_order": 700_000,
                "max_outstanding_balance": 5_000_000,
                "fee_rates": [
                    {"fee_type": "ADVANCE", "fee_rate": 1.35},
                    {"fee_type": "REPAYMENT", "fee_rate": 0.25},
                ],
            },
        )
        assert adjusted["mbid"] == mbid
        assert adjusted["fee"]["payment_rate"] == 80
        assert len(adjusted["fee"]["rates"]) == 2

        detail = _get_json(client, f"/v1/api/contracts/{mbid}")
        assert detail["contract"]["latest_fee_rate"] == 1.35

        contract_list = _get_json(client, f"/v1/api/contracts?limit=5&offset=0&user_no={user_no}")
        listed_contract = next(item for item in contract_list["items"] if item["mbid"] == mbid)
        assert listed_contract["latest_payment_rate"] == 80
        assert listed_contract["latest_sales_limit_per_order"] == 700_000
        assert listed_contract["latest_max_outstanding_balance"] == 5_000_000

        presented = _put_json(
            client,
            f"/v1/api/contracts/{mbid}/status",
            {
                "action": "present_terms",
                "changed_by": "local-db-e2e",
                "reason": "present terms for local db e2e",
            },
        )
        assert presented["previous_status"] == "REQUEST"
        assert presented["new_status"] == "CONDITIONS_ACCEPT"
        assert presented["approval_date"] is not None

        agreed = _put_json(
            client,
            f"/v1/api/contracts/{mbid}/status",
            {
                "action": "agree_terms",
                "changed_by": "local-db-e2e",
                "reason": "user accepted terms in local db e2e",
            },
        )
        assert agreed["previous_status"] == "CONDITIONS_ACCEPT"
        assert agreed["new_status"] == "USE_AGREE"
        assert agreed["agree_date"] is not None

        signed = _put_json(
            client,
            f"/v1/api/contracts/{mbid}/electronic-signature",
            {
                "signed_by": "local-db-e2e",
                "signature_method": "mock_certificate",
                "signature_reference": f"MOCK-SIGN-{suffix}",
                "reason": "electronic signature db e2e",
            },
        )
        assert signed["previous_status"] == "USE_AGREE"
        assert signed["new_status"] == "ACCOUNT_STANDBY"
        assert signed["signature_status"] == "signed_mock"
        assert signed["signature_reference"] == f"MOCK-SIGN-{suffix}"
        assert signed["contract_date"] is not None

        detail = _get_json(client, f"/v1/api/contracts/{mbid}?user_no={user_no}")
        assert detail["contract"]["status"] == "ACCOUNT_STANDBY"
        assert detail["contract"]["identity_verification_status"] == "mock_verified"
        assert detail["contract"]["electronic_signature_status"] == "signed_mock"
        assert detail["contract"]["electronic_signature_reference"] == f"MOCK-SIGN-{suffix}"
        assert detail["contract"]["approval_date"] is not None
        assert detail["contract"]["agree_date"] is not None
        assert detail["contract"]["contract_date"] is not None
        assert detail["shops"][0]["contract_shop_type"] == "NAVER"
        assert detail["fees"][0]["payment_rate"] == 80
        assert {rate["fee_type"] for rate in detail["fees"][0]["rates"]} == {
            "ADVANCE",
            "REPAYMENT",
        }
        assert _status_actions(mbid) >= {
            "create_request",
            "present_terms",
            "agree_terms",
            "electronic_signature",
        }
    finally:
        _cleanup(mbid=mbid, user_no=user_no, shop_account_id=shop_account_id)


def test_contract_cancel_rejects_pre_contract_status_with_real_db() -> None:
    client = TestClient(create_app())
    suffix = datetime.now().strftime("%H%M%S%f")[:9]
    user_no = _next_id("users", "user_no")
    shop_account_id = _next_id("shop_accounts", "id")
    mbid: str | None = None

    try:
        _insert_test_user(user_no=user_no, suffix=suffix)
        _insert_test_shop_account(
            shop_account_id=shop_account_id,
            user_no=user_no,
            suffix=suffix,
        )

        created = _post_json(
            client,
            "/v1/api/contracts/requests",
            {
                "user_no": user_no,
                "request_shop_types": ["NAVER"],
                "product_code": "MP",
                "sales_amount": 2_400_000,
                "representative_age": 42,
                "identity_confirmed": True,
                "identity_verification_method": "id_card",
                "identity_verification_status": "mock_verified",
                "identity_verification_reference": "MOCK-ID-800101-1234",
                "terms_agreed": True,
                "submitted_document_types": ["CBInfo", "regNo"],
                "requested_by": "local-db-e2e",
            },
        )
        mbid = created["mbid"]
        assert created["status"] == "REQUEST"

        response = client.put(
            f"/v1/api/contracts/{mbid}/status",
            json={
                "action": "cancel",
                "changed_by": "local-db-e2e",
                "reason": "pre-contract cancel must fail",
            },
            headers=_master_admin_headers(),
        )
        assert response.status_code == 409
        assert response.json()["detail"] == "contract can be canceled only after contract is active or account standby"

        detail = _get_json(client, f"/v1/api/contracts/{mbid}?user_no={user_no}")
        assert detail["contract"]["status"] == "REQUEST"
        assert "cancel" not in _status_actions(mbid)
    finally:
        _cleanup(mbid=mbid, user_no=user_no, shop_account_id=shop_account_id)


def _next_id(table: str, column: str) -> int:
    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(f"select coalesce(max({column}), 0) + 1 from {table}")
                return int(cursor.fetchone()[0])
    except Exception as exc:  # pragma: no cover - local environment guard
        pytest.skip(f"local PostgreSQL is unavailable: {exc}")


def _insert_test_user(*, user_no: int, suffix: str) -> None:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                insert into users (
                    user_no,
                    email,
                    password,
                    user_type,
                    name,
                    phone,
                    biz_num,
                    biz_name,
                    biz_setup_date,
                    biz_type,
                    sectors,
                    fintech_id,
                    reg_date,
                    modified_date
                ) values (
                    %s, %s, %s, 'USER', %s, %s, %s, %s, '20180101',
                    'INDIVIDUAL', '01', 1, now(), now()
                )
                """,
                (
                    user_no,
                    f"local-db-e2e-{suffix}@example.test",
                    "local-db-e2e",
                    f"local-db-e2e-{suffix}",
                    "01000000000",
                    suffix.ljust(10, "0")[:10],
                    f"local-db-e2e-biz-{suffix}",
                ),
            )


def _insert_test_shop_account(*, shop_account_id: int, user_no: int, suffix: str) -> None:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                insert into shop_accounts (
                    id,
                    user_no,
                    shop_type,
                    shop_id,
                    shop_account_id,
                    shop_account_password,
                    api_secret_key,
                    status,
                    del_yn,
                    reg_date,
                    modified_date
                ) values (
                    %s, %s, 'NAVER', %s, %s, 'local-db-e2e',
                    'local-db-e2e', 'Y', 'N', now(), now()
                )
                """,
                (
                    shop_account_id,
                    user_no,
                    f"local-db-e2e-shop-{suffix}",
                    f"local-db-e2e-account-{suffix}",
                ),
            )


def _post_json(client: TestClient, path: str, payload: dict) -> dict:
    response = client.post(path, json=payload, headers=_master_admin_headers())
    assert response.status_code == 200, response.text
    return response.json()


def _put_json(client: TestClient, path: str, payload: dict) -> dict:
    response = client.put(path, json=payload, headers=_master_admin_headers())
    assert response.status_code == 200, response.text
    return response.json()


def _get_json(client: TestClient, path: str) -> dict:
    response = client.get(path, headers=_master_admin_headers())
    assert response.status_code == 200, response.text
    return response.json()


def _master_admin_headers() -> dict[str, str]:
    email = get_settings().master_admin_email.strip()
    assert email, "CUBICI_MASTER_ADMIN_EMAIL is required for DB E2E"
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                select user_no
                from users
                where lower(email) = lower(%s)
                  and upper(coalesce(user_type, '')) = 'ADMIN_USER'
                """,
                (email,),
            )
            row = cursor.fetchone()
    assert row is not None, "configured master admin must exist in users"

    auth = _build_auth_response(
        AccountAuthUser(
            user_no=row[0],
            email=email,
            user_type="ADMIN_USER",
            name="DB E2E Admin",
            phone=None,
            biz_num=None,
            biz_name=None,
        )
    )
    return {"Authorization": f"Bearer {auth.access_token}"}


def _status_actions(mbid: str) -> set[str]:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "select action from contract_status_history where mbid = %s",
                (mbid,),
            )
            return {row[0] for row in cursor.fetchall()}


def _cleanup(*, mbid: str | None, user_no: int, shop_account_id: int) -> None:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            if mbid:
                cursor.execute(
                    """
                    delete from contract_fee_adjustment_history
                    where mbid = %s
                    """,
                    (mbid,),
                )
                cursor.execute(
                    """
                    delete from moneybank_contract_fee_rates
                    where contract_fee_id in (
                        select id from moneybank_contract_fee where mbid = %s
                    )
                    """,
                    (mbid,),
                )
                cursor.execute("delete from moneybank_contract_fee where mbid = %s", (mbid,))
                cursor.execute("delete from contract_status_history where mbid = %s", (mbid,))
                cursor.execute("delete from moneybank_contract_shop where mbid = %s", (mbid,))
                cursor.execute("delete from moneybank_contract where mbid = %s", (mbid,))
            cursor.execute("delete from shop_accounts where id = %s", (shop_account_id,))
            cursor.execute("delete from users where user_no = %s", (user_no,))
