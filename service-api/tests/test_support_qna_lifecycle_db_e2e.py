import os
from uuid import uuid4

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from cubici_service.accounts.repository import AccountAuthUser
from cubici_service.app import create_app
from cubici_service.core.config import Settings
from cubici_service.db.connection import get_connection


pytestmark = [
    pytest.mark.db_e2e,
    pytest.mark.skipif(
        os.getenv("CUBICI_RUN_DB_E2E") != "1",
        reason="set CUBICI_RUN_DB_E2E=1 to run local PostgreSQL E2E tests",
    ),
]


def test_user_admin_qna_lifecycle_with_real_db(monkeypatch) -> None:
    suffix = uuid4().hex[:10]
    user_numbers = _insert_fixture_users(suffix)
    owner_no, stranger_no, admin_no = user_numbers
    master_email = f"qna-admin-{suffix}@example.invalid"
    qna_ids: list[int] = []

    users_by_token = {
        "owner-token": _auth_user(owner_no, f"qna-owner-{suffix}@example.invalid", "USER"),
        "stranger-token": _auth_user(stranger_no, f"qna-stranger-{suffix}@example.invalid", "USER"),
        "admin-token": _auth_user(admin_no, master_email, "ADMIN_USER"),
    }

    def fake_authenticated_user(token: str) -> AccountAuthUser:
        user = users_by_token.get(token)
        if user is None:
            raise HTTPException(status_code=401, detail="invalid bearer token")
        return user

    monkeypatch.setattr("cubici_service.core.access_control.get_authenticated_user", fake_authenticated_user)
    monkeypatch.setattr("cubici_service.core.admin_auth.get_authenticated_user", fake_authenticated_user)
    client = TestClient(create_app(settings=Settings(master_admin_email=master_email)))

    try:
        editable = _post_inquiry(client, owner_no, suffix, "수정삭제", "최초 문의")
        editable_id = editable["qna_id"]
        qna_ids.append(editable_id)

        owner_list = client.get(
            f"/v1/api/support/inquiries?user_no={owner_no}&keyword={suffix}",
            headers=_headers("owner-token"),
        )
        assert owner_list.status_code == 200, owner_list.text
        assert [item["qna_id"] for item in owner_list.json()["items"]] == [editable_id]

        updated = client.put(
            f"/v1/api/support/inquiries/{editable_id}",
            headers=_headers("owner-token"),
            json=_inquiry_payload(owner_no, suffix, "수정삭제", "수정된 문의"),
        )
        assert updated.status_code == 200, updated.text
        assert updated.json()["action"] == "updated"
        assert updated.json()["detail"]["inquiry"]["content"] == "수정된 문의"

        owner_scope_spoof = client.get(
            f"/v1/api/support/inquiries/{editable_id}?user_no={owner_no}",
            headers=_headers("stranger-token"),
        )
        assert owner_scope_spoof.status_code == 403
        assert owner_scope_spoof.json()["detail"] == "resource owner required"

        stranger_scope = client.get(
            f"/v1/api/support/inquiries/{editable_id}?user_no={stranger_no}",
            headers=_headers("stranger-token"),
        )
        assert stranger_scope.status_code == 404
        assert suffix not in stranger_scope.text

        deleted = client.delete(
            f"/v1/api/support/inquiries/{editable_id}?user_no={owner_no}",
            headers=_headers("owner-token"),
        )
        assert deleted.status_code == 200, deleted.text
        assert deleted.json()["action"] == "deleted"
        assert _qna_state(editable_id) == (0, 0, None, None)
        qna_ids.remove(editable_id)

        answered = _post_inquiry(client, owner_no, suffix, "답변잠금", "답변 전 문의")
        answered_id = answered["qna_id"]
        qna_ids.append(answered_id)

        reply_created = client.post(
            f"/v1/api/support/inquiries/{answered_id}/replies",
            headers=_headers("admin-token"),
            json={
                "content": f"관리자 답변 {suffix}",
                "user_no": admin_no,
                "operated_by": "qna-db-e2e-admin",
            },
        )
        assert reply_created.status_code == 200, reply_created.text
        assert reply_created.json()["action"] == "created"
        reply_id = reply_created.json()["reply_id"]

        reply_updated = client.put(
            f"/v1/api/support/inquiries/{answered_id}/replies/{reply_id}",
            headers=_headers("admin-token"),
            json={
                "content": f"관리자 수정 답변 {suffix}",
                "user_no": admin_no,
                "operated_by": "qna-db-e2e-admin",
            },
        )
        assert reply_updated.status_code == 200, reply_updated.text
        assert reply_updated.json()["action"] == "updated"

        owner_detail = client.get(
            f"/v1/api/support/inquiries/{answered_id}?user_no={owner_no}",
            headers=_headers("owner-token"),
        )
        assert owner_detail.status_code == 200, owner_detail.text
        assert owner_detail.json()["inquiry"]["answer_status"] == "답변완료"
        assert owner_detail.json()["replies"][0]["content"] == f"관리자 수정 답변 {suffix}"

        locked_update = client.put(
            f"/v1/api/support/inquiries/{answered_id}",
            headers=_headers("owner-token"),
            json=_inquiry_payload(owner_no, suffix, "답변잠금", "잠금 후 수정 시도"),
        )
        assert locked_update.status_code == 409
        assert locked_update.json()["detail"] == "answered inquiry cannot be modified"

        locked_delete = client.delete(
            f"/v1/api/support/inquiries/{answered_id}?user_no={owner_no}",
            headers=_headers("owner-token"),
        )
        assert locked_delete.status_code == 409
        assert locked_delete.json()["detail"] == "answered inquiry cannot be modified"

        stranger_list = client.get(
            f"/v1/api/support/inquiries?user_no={owner_no}&keyword={suffix}",
            headers=_headers("stranger-token"),
        )
        assert stranger_list.status_code == 403
        assert suffix not in stranger_list.text

        assert _qna_state(answered_id) == (
            1,
            1,
            "답변 전 문의",
            f"관리자 수정 답변 {suffix}",
        )
    finally:
        _cleanup(qna_ids=qna_ids, user_numbers=user_numbers)


def _auth_user(user_no: int, email: str, user_type: str) -> AccountAuthUser:
    return AccountAuthUser(
        user_no=user_no,
        email=email,
        user_type=user_type,
        name="QNA DB E2E",
        phone=None,
        biz_num=None,
        biz_name=None,
    )


def _headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _inquiry_payload(user_no: int, suffix: str, label: str, content: str) -> dict:
    return {
        "user_no": user_no,
        "type": "CUBICI",
        "title": f"QNA-DB-E2E-{label}-{suffix}",
        "content": content,
        "visibility": "private",
        "operated_by": "qna-db-e2e-user",
    }


def _post_inquiry(client: TestClient, user_no: int, suffix: str, label: str, content: str) -> dict:
    response = client.post(
        "/v1/api/support/inquiries",
        headers=_headers("owner-token"),
        json=_inquiry_payload(user_no, suffix, label, content),
    )
    assert response.status_code == 200, response.text
    assert response.json()["action"] == "created"
    return response.json()


def _insert_fixture_users(suffix: str) -> tuple[int, int, int]:
    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("select coalesce(max(user_no), 0) + 1 from users")
                first_user_no = int(cursor.fetchone()[0])
                rows = [
                    (first_user_no, f"qna-owner-{suffix}@example.invalid", "USER", "QNA Owner"),
                    (first_user_no + 1, f"qna-stranger-{suffix}@example.invalid", "USER", "QNA Stranger"),
                    (first_user_no + 2, f"qna-admin-{suffix}@example.invalid", "ADMIN_USER", "QNA Admin"),
                ]
                cursor.executemany(
                    """
                    insert into users (
                        user_no, email, password, user_type, name, phone, biz_num,
                        biz_name, biz_setup_date, biz_type, sectors, fintech_id,
                        reg_date, modified_date
                    ) values (
                        %s, %s, 'local-db-e2e', %s, %s, '01000000000', %s,
                        'QNA DB E2E', '20180101', 'INDIVIDUAL', '01', 1,
                        now(), now()
                    )
                    """,
                    [(*row, f"QNA{row[0]}") for row in rows],
                )
        return (first_user_no, first_user_no + 1, first_user_no + 2)
    except Exception as exc:  # pragma: no cover - local environment guard
        pytest.skip(f"local PostgreSQL is unavailable: {exc}")


def _qna_state(qna_id: int) -> tuple[int, int, str | None, str | None]:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                select
                    count(distinct q.qna_id)::int,
                    count(r.reply_id)::int,
                    max(q.content),
                    max(r.content)
                from qna q
                left join qna_reply r on r.qna_id = q.qna_id
                where q.qna_id = %s
                """,
                (qna_id,),
            )
            return cursor.fetchone()


def _cleanup(*, qna_ids: list[int], user_numbers: tuple[int, int, int]) -> None:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            if qna_ids:
                cursor.execute("delete from qna_reply where qna_id = any(%s)", (qna_ids,))
                cursor.execute("delete from qna where qna_id = any(%s)", (qna_ids,))
            cursor.execute("delete from users where user_no = any(%s)", (list(user_numbers),))
            cursor.execute(
                """
                select
                    (select count(*)::int from qna where qna_id = any(%s)),
                    (select count(*)::int from qna_reply where qna_id = any(%s)),
                    (select count(*)::int from users where user_no = any(%s))
                """,
                (qna_ids or [0], qna_ids or [0], list(user_numbers)),
            )
            assert cursor.fetchone() == (0, 0, 0)
