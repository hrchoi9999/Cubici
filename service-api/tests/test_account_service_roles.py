from fastapi import HTTPException

from cubici_service.accounts.repository import (
    AccountAuthUser,
    _build_auth_response,
    _decode_token,
)
from cubici_service.api.v1.endpoints import accounts
from cubici_service.core.config import get_settings


def _account(email: str, user_type: str) -> AccountAuthUser:
    return AccountAuthUser(
        user_no=2 if user_type == "ADMIN_USER" else 29,
        email=email,
        user_type=user_type,
        name="테스트",
        phone=None,
        biz_num=None,
        biz_name=None,
    )


def test_auth_tokens_are_bound_to_user_and_admin_services(monkeypatch) -> None:
    monkeypatch.setenv("CUBICI_MASTER_ADMIN_EMAIL", "master-admin@example.com")
    get_settings.cache_clear()

    user_token = _build_auth_response(_account("user@example.com", "USER")).access_token
    admin_token = _build_auth_response(_account("master-admin@example.com", "ADMIN_USER")).access_token

    assert _decode_token(user_token)["aud"] == "user"
    assert _decode_token(admin_token)["aud"] == "admin"
    get_settings.cache_clear()


def test_user_me_rejects_admin_account(monkeypatch) -> None:
    monkeypatch.setattr(
        accounts,
        "get_authenticated_user",
        lambda token: _account("master-admin@example.com", "ADMIN_USER"),
    )

    try:
        accounts.account_me(authorization="Bearer admin-token")
    except HTTPException as exc:
        assert exc.status_code == 403
        assert exc.detail == "user account required"
    else:
        raise AssertionError("admin account must not access the user me endpoint")


def test_admin_me_rejects_user_account(monkeypatch) -> None:
    monkeypatch.setattr(
        accounts,
        "get_authenticated_user",
        lambda token: _account("user@example.com", "USER"),
    )

    try:
        accounts.account_admin_me(authorization="Bearer user-token")
    except HTTPException as exc:
        assert exc.status_code == 403
        assert exc.detail == "admin_user account required"
    else:
        raise AssertionError("user account must not access the admin me endpoint")
