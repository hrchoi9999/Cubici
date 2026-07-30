from fastapi.testclient import TestClient

from cubici_service.accounts.repository import AccountAuthUser
from cubici_service.app import create_app
from cubici_service.core.admin_auth import is_admin_protected_request
from cubici_service.core.config import get_settings


def test_admin_api_auth_path_policy() -> None:
    assert is_admin_protected_request("GET", "/v1/api/management/overview") is True
    assert is_admin_protected_request("GET", "/v1/api/preferences/admin-accounts") is True
    assert is_admin_protected_request("POST", "/v1/api/preferences/charges") is True
    assert is_admin_protected_request("GET", "/v1/api/preferences/charges") is False
    assert is_admin_protected_request("GET", "/v1/api/support/boards/notice") is False
    assert is_admin_protected_request("POST", "/v1/api/support/boards/notice") is True
    assert is_admin_protected_request("GET", "/v1/api/health") is False


def test_protected_admin_api_requires_bearer_token() -> None:
    response = TestClient(create_app()).get("/v1/api/fintech/status")

    assert response.status_code == 401
    assert response.json()["detail"] == "master admin bearer token required"


def test_protected_admin_api_rejects_non_master_admin(monkeypatch) -> None:
    def fake_authenticated_user(token: str) -> AccountAuthUser:
        assert token == "user-token"
        return AccountAuthUser(
            user_no=10,
            email="user@example.com",
            user_type="USER",
            name="사용자",
            phone=None,
            biz_num=None,
            biz_name=None,
        )

    monkeypatch.setattr("cubici_service.core.admin_auth.get_authenticated_user", fake_authenticated_user)
    response = TestClient(create_app()).get(
        "/v1/api/fintech/status",
        headers={"Authorization": "Bearer user-token"},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "master admin account required"


def test_protected_admin_api_accepts_master_admin(monkeypatch) -> None:
    monkeypatch.setenv("CUBICI_MASTER_ADMIN_EMAIL", "master-admin@example.com")
    get_settings.cache_clear()

    def fake_authenticated_user(token: str) -> AccountAuthUser:
        assert token == "admin-token"
        return AccountAuthUser(
            user_no=2,
            email="master-admin@example.com",
            user_type="ADMIN_USER",
            name="관리자",
            phone=None,
            biz_num=None,
            biz_name=None,
        )

    monkeypatch.setattr("cubici_service.core.admin_auth.get_authenticated_user", fake_authenticated_user)
    response = TestClient(create_app()).get(
        "/v1/api/fintech/status",
        headers={"Authorization": "Bearer admin-token"},
    )

    assert response.status_code == 200
    assert response.json()["live_transfer_enabled"] is False
    get_settings.cache_clear()
