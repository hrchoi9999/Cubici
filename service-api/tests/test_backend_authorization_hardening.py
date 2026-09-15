"""Route and SQL-scope regression checks. No real database is used."""

from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from starlette.responses import JSONResponse

from cubici_service.accounts.repository import AccountAuthUser
from cubici_service.core import access_control, admin_auth, config
from cubici_service.contracts import repository as contracts_repo
from cubici_service.settlements import repository as settlements_repo
from cubici_service.support import repository as support_repo


@pytest.fixture
def harness(monkeypatch):
    monkeypatch.setattr(config, "load_local_env", lambda: None)
    from cubici_service.app import create_app
    from cubici_service.api.v1.endpoints import contracts, settlements, support

    users = {
        role: AccountAuthUser(
            user_no=number, email=f"{role}@example.test", user_type=kind,
            name=role, phone=None, biz_num=None, biz_name=None,
        )
        for role, number, kind in [("owner", 72, "USER"), ("other", 73, "USER"), ("master", 2, "ADMIN_USER")]
    }

    def authenticate(token):
        if token not in users:
            raise HTTPException(401, "invalid synthetic token")
        return users[token]

    monkeypatch.setattr(access_control, "get_authenticated_user", authenticate)
    monkeypatch.setattr(admin_auth, "get_authenticated_user", authenticate)
    monkeypatch.setattr(access_control, "_fetch_contract_owner_user_no", lambda mbid: 72)
    monkeypatch.setattr(access_control, "_fetch_user_shop_pairs", lambda n: {("NAVER", "seller01")} if n == 72 else set())
    monkeypatch.setattr(access_control, "_fetch_settlement_shop_pair", lambda n: ("NAVER", "seller01") if n == 1 else None)
    called = []

    def result(**kwargs):
        called.append(kwargs)
        return JSONResponse({"ok": True})

    def detail(identifier, **kwargs):
        return result(identifier=identifier, **kwargs)

    monkeypatch.setattr(contracts, "update_contract_status", result)
    monkeypatch.setattr(contracts, "sign_contract_electronically", result)
    monkeypatch.setattr(settlements, "get_settlement_detail", detail)
    monkeypatch.setattr(support, "get_inquiry_detail", detail)
    monkeypatch.setattr(support, "update_inquiry", result)
    monkeypatch.setattr(support, "delete_inquiry", result)
    settings = config.Settings(environment="local", master_admin_email="master@example.test",
                               cors_allow_origins=("https://allowed.example",), cors_allow_origin_regex=None)
    return SimpleNamespace(client=TestClient(create_app(settings)), called=called)


def headers(role):
    return {} if role == "anonymous" else {"Authorization": f"Bearer {role}"}


@pytest.mark.parametrize("role", ["anonymous", "other", "owner", "master"])
@pytest.mark.parametrize("action", list(contracts_repo.CONTRACT_STATUS_ACTION_MAP))
def test_contract_action_policy(harness, role, action):
    response = harness.client.put("/v1/api/contracts/TEST/status", headers=headers(role),
                                  json={"action": action, "changed_by": "claimed-master"})
    allowed = role == "master" or (role == "owner" and action in {"agree_terms", "refuse_terms", "request_termination"})
    assert response.status_code == (200 if allowed else 401 if role == "anonymous" else 403)
    assert len(harness.called) == int(allowed)


@pytest.mark.parametrize("role,expected", [("anonymous", 401), ("other", 403), ("owner", 200), ("master", 200)])
def test_electronic_signature_preserved(harness, role, expected):
    response = harness.client.put("/v1/api/contracts/TEST/electronic-signature", headers=headers(role),
                                  json={"signed_by": role})
    assert response.status_code == expected


@pytest.mark.parametrize("identifier", ["1", "+1", "%2B1", "01"])
@pytest.mark.parametrize("role,expected", [("anonymous", 401), ("other", 403), ("owner", 200), ("master", 200)])
@pytest.mark.parametrize("domain,method", [("settlements", "get"), ("support/inquiries", "get"),
                                          ("support/inquiries", "put"), ("support/inquiries", "delete")])
def test_numeric_paths_cannot_bypass_auth(harness, identifier, role, expected, domain, method):
    kwargs = {"headers": headers(role)}
    if method == "put":
        kwargs["json"] = {"user_no": 72, "title": "fixture", "content": "fixture", "operated_by": role}
    response = getattr(harness.client, method)(f"/v1/api/{domain}/{identifier}?user_no=72", **kwargs)
    assert response.status_code == expected
    assert len(harness.called) == int(expected == 200)


def test_owner_rejection_includes_cors(harness):
    response = harness.client.get("/v1/api/settlements/1", headers={
        **headers("other"), "Origin": "https://allowed.example",
    })
    assert response.status_code == 403
    assert response.headers["access-control-allow-origin"] == "https://allowed.example"


@pytest.mark.parametrize("method", ["get", "put", "delete"])
def test_inquiry_own_claim_cannot_reach_another_owners_row(harness, monkeypatch, method):
    from cubici_service.api.v1.endpoints import support
    real_functions = {"get": support_repo.get_inquiry_detail, "put": support_repo.update_inquiry,
                      "delete": support_repo.delete_inquiry}
    endpoint_names = {"get": "get_inquiry_detail", "put": "update_inquiry", "delete": "delete_inquiry"}
    monkeypatch.setattr(support, endpoint_names[method], real_functions[method])
    connection = MagicMock()
    connection.__enter__.return_value = connection
    cursor = connection.cursor.return_value.__enter__.return_value
    cursor.fetchone.return_value = None
    monkeypatch.setattr(support_repo, "get_connection", lambda: connection)
    kwargs = {"headers": headers("other")}
    if method == "put":
        kwargs["json"] = {"user_no": 73, "title": "fixture", "content": "fixture", "operated_by": "other"}
    response = getattr(harness.client, method)("/v1/api/support/inquiries/%2B1?user_no=73", **kwargs)
    assert response.status_code == 404
    cursor.execute.assert_called_once()
    sql, params = cursor.execute.call_args.args
    assert "qna_id = %s" in sql and "user_no = %s" in sql
    assert params == (1, 73)
    assert sql.strip().lower().startswith(("select", "with"))


@pytest.mark.parametrize("role,query,pairs", [
    ("owner", "shop_type=NAVER&shop_id=seller01", [("NAVER", "seller01")]),
    ("owner", "shop_type=14&shop_id=seller01", [("NAVER", "seller01")]),
    ("owner", "shop_pairs=NAVER:seller01", [("NAVER", "seller01")]),
    ("owner", "shop_pairs=__none__", []),
    ("master", "shop_id=seller01", None),
])
@pytest.mark.parametrize("order", ["date_desc", "date_asc", "amount_desc", "amount_asc"])
def test_settlement_sql_scope_and_existing_sort(harness, monkeypatch, role, query, pairs, order):
    connection = MagicMock()
    connection.__enter__.return_value = connection
    cursor = connection.cursor.return_value.__enter__.return_value
    cursor.fetchall.return_value = []
    monkeypatch.setattr(settlements_repo, "get_connection", lambda: connection)
    response = harness.client.get(f"/v1/api/settlements?{query}&order_by={order}&owner_shop_pairs=ignored",
                                  headers=headers(role))
    assert response.status_code == 200
    assert response.json()["total"] == response.json()["counts"]["total_count"] == 0
    assert cursor.execute.call_count == 2
    for call in cursor.execute.call_args_list:
        sql, params = call.args
        if pairs is None:
            assert "shop_id = %s" not in sql and "%seller01%" in params
        elif not pairs:
            assert "1 = 0" in sql
        else:
            assert "(upper(shop_type) = %s and shop_id = %s)" in sql
            assert list(params[:2]) == ["NAVER", "seller01"]
    sql = cursor.execute.call_args.args[0]
    column = "settlement_date" if order.startswith("date") else "settlement_amount"
    assert f"order by {column} {order.split('_')[1]}" in sql


@pytest.mark.parametrize("query", ["", "shop_id=seller01", "shop_type=NAVER&shop_id=seller010",
                                   "shop_pairs=NAVER:seller01,NAVER:seller010"])
def test_owner_cannot_broaden_scope(harness, query):
    assert harness.client.get(f"/v1/api/settlements?{query}", headers=headers("owner")).status_code == 403


def test_wildcards_are_literal_in_authorization_scope():
    sql, params = settlements_repo._build_settlement_filters(
        shop_pairs=None, shop_type="NAVER", shop_id="seller_%", status=None, keyword=None,
        from_date=None, to_date=None, owner_shop_pairs=[("NAVER", "seller_%")],
    )
    assert "shop_id = %s" in sql
    assert params[:2] == ["NAVER", "seller_%"]
