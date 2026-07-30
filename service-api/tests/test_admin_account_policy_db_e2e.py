import os
from datetime import datetime

import pytest
from fastapi import HTTPException
from pydantic import SecretStr

from cubici_service.db.connection import get_connection
from cubici_service.preferences.repository import (
    AdminAccountApproveRequest,
    AdminAccountRequest,
    AdminAccountUpdateRequest,
    approve_admin_account,
    get_admin_account,
    request_admin_account,
    update_admin_account,
)


pytestmark = [
    pytest.mark.db_e2e,
    pytest.mark.skipif(
        os.getenv("CUBICI_RUN_DB_E2E") != "1",
        reason="set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL E2E tests",
    ),
]


def test_admin_account_approval_update_and_audit_status_with_real_db() -> None:
    suffix = datetime.now().strftime("%H%M%S%f")[:9]
    approved_admin_id = f"adm{suffix}"
    duplicate_admin_id = f"dup{suffix}"
    created_admin_ids: list[str] = []

    try:
        requested = request_admin_account(
            AdminAccountRequest(
                admin_type="00",
                admin_name="테스트관리자",
                admin_phone="01000000000",
                admin_email="admin@example.com",
                admin_department="운영팀",
            )
        )
        created_admin_ids.append(requested.admin_id)

        pending = get_admin_account(requested.admin_id)
        assert pending is not None
        assert pending.admin_grade == "02"
        assert pending.approval_status == "대기"
        assert pending.audit_status_label == "승인대기"

        approved = approve_admin_account(
            requested.admin_id,
            AdminAccountApproveRequest(
                new_admin_id=approved_admin_id,
                password=SecretStr("test-password"),
                admin_grade="00",
            ),
        )
        created_admin_ids.remove(requested.admin_id)
        created_admin_ids.append(approved_admin_id)

        assert approved is not None
        assert approved.account is not None
        assert approved.account.approval_status == "승인완료"
        assert approved.account.audit_status_label == "승인이력"

        updated = update_admin_account(
            approved_admin_id,
            AdminAccountUpdateRequest(
                admin_type="00",
                admin_name="테스트관리자수정",
                admin_phone="01011112222",
                admin_email="admin2@example.com",
                admin_department="심사팀",
                admin_grade="01",
            ),
        )
        assert updated is not None
        assert updated.account is not None
        assert updated.account.admin_grade_label == "권한2"
        assert updated.account.audit_status_label == "수정이력"

        duplicate_request = request_admin_account(
            AdminAccountRequest(
                admin_type="00",
                admin_name="중복테스트",
                admin_department="운영팀",
            )
        )
        created_admin_ids.append(duplicate_request.admin_id)

        duplicate_approved = approve_admin_account(
            duplicate_request.admin_id,
            AdminAccountApproveRequest(
                new_admin_id=duplicate_admin_id,
                password=SecretStr("test-password"),
                admin_grade="00",
            ),
        )
        created_admin_ids.remove(duplicate_request.admin_id)
        created_admin_ids.append(duplicate_admin_id)
        assert duplicate_approved is not None

        second_request = request_admin_account(
            AdminAccountRequest(
                admin_type="00",
                admin_name="중복차단",
                admin_department="운영팀",
            )
        )
        created_admin_ids.append(second_request.admin_id)

        with pytest.raises(HTTPException) as error:
            approve_admin_account(
                second_request.admin_id,
                AdminAccountApproveRequest(
                    new_admin_id=duplicate_admin_id,
                    password=SecretStr("test-password"),
                    admin_grade="00",
                ),
            )
        assert error.value.status_code == 409
    finally:
        _cleanup_admin_accounts(created_admin_ids)


def _cleanup_admin_accounts(admin_ids: list[str]) -> None:
    if not admin_ids:
        return
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("delete from admin_account where admin_id = any(%s)", (admin_ids,))
