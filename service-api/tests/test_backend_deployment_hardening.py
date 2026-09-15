"""Focused deployment checks using synthetic settings and mocked connections."""

from unittest.mock import MagicMock

import psycopg
import pytest
from fastapi.testclient import TestClient
from psycopg.conninfo import conninfo_to_dict
from pydantic import SecretStr, ValidationError

from cubici_service.core import config
from cubici_service.db.connection import get_connection


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(config, "load_local_env", lambda: None)
    from cubici_service.app import create_app
    return TestClient(create_app(config.Settings(
        environment="local", cors_allow_origins=("https://allowed.example",),
        cors_allow_origin_regex=None,
    )))


@pytest.mark.parametrize("path", ["/v1/api/fintech/status", "/v1/api/sales/orders"])
def test_cors_wraps_unauthorized(client, path):
    response = client.get(path, headers={"Origin": "https://allowed.example"})
    assert response.status_code == 401
    assert response.headers["access-control-allow-origin"] == "https://allowed.example"


def test_cors_denies_untrusted_origin_and_allows_preflight(client):
    response = client.get("/v1/api/fintech/status", headers={"Origin": "https://other.example"})
    assert "access-control-allow-origin" not in response.headers
    response = client.options("/v1/api/fintech/status", headers={
        "Origin": "https://allowed.example", "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "authorization",
    })
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://allowed.example"


def test_cors_regex_only(client):
    from cubici_service.app import create_app
    other = TestClient(create_app(config.Settings(
        environment="local", cors_allow_origins=(), cors_allow_origin_regex=r"https://preview\.example",
    )))
    response = other.get("/v1/api/fintech/status", headers={"Origin": "https://preview.example"})
    assert response.status_code == 401
    assert response.headers["access-control-allow-origin"] == "https://preview.example"


@pytest.mark.parametrize("path", ["/v1/api/contracts/requests", "/v1/api/support/inquiries"])
@pytest.mark.parametrize("body", [b"[]", b"null", b'"text"', b"42", b"true", b"{", b"\xff"])
def test_non_object_and_malformed_json(client, path, body):
    response = client.post(path, content=body, headers={
        "Origin": "https://allowed.example", "Content-Type": "application/json",
    })
    assert response.status_code == 422
    assert response.headers["access-control-allow-origin"] == "https://allowed.example"


@pytest.mark.parametrize("password", ["", "space space", "quote'and\\slash", "x host=untrusted"])
def test_conninfo_keeps_password_literal(password):
    settings = config.Settings(environment="local", db_host="127.0.0.1", db_password=SecretStr(password))
    parsed = conninfo_to_dict(settings.db_conninfo)
    assert parsed["password"] == password
    assert parsed["host"] == "127.0.0.1"


@pytest.mark.parametrize("environment", ["prod", "production", "production-local", "staging", " PRODUCTION "])
@pytest.mark.parametrize("secret", ["", "local-dev-only-change-me", "change-me" + "x" * 40, "  CHANGE-ME" + "x" * 40, "x" * 31])
def test_production_rejects_weak_secret(environment, secret):
    with pytest.raises(ValidationError, match="CUBICI_AUTH_SECRET"):
        config.Settings(environment=environment, auth_secret=SecretStr(secret))


def test_production_accepts_non_placeholder_and_local_default(monkeypatch):
    config.Settings(environment="production-local", auth_secret=SecretStr("synthetic-test-only-" + "x" * 32))
    monkeypatch.delenv("CUBICI_AUTH_SECRET", raising=False)
    assert config.Settings(environment="local").auth_secret.get_secret_value() == "local-dev-only-change-me"


@pytest.mark.parametrize("failures", [0, 1, 2, 3])
def test_connection_establishment_retry_limit(monkeypatch, failures):
    connection = MagicMock()
    connection.__enter__.return_value = connection
    error = psycopg.OperationalError("synthetic unavailable")
    connect = MagicMock(side_effect=[error] * failures + [connection])
    sleep = MagicMock()
    monkeypatch.setattr("cubici_service.db.connection.psycopg.connect", connect)
    monkeypatch.setattr("cubici_service.db.connection.time.sleep", sleep)
    if failures == 3:
        with pytest.raises(psycopg.OperationalError) as raised:
            with get_connection(config.Settings(environment="local")):
                pytest.fail("unreachable")
        assert raised.value is error
    else:
        with get_connection(config.Settings(environment="local")) as actual:
            assert actual is connection
        connection.__exit__.assert_called_once_with(None, None, None)
    assert connect.call_count == min(failures + 1, 3)
    assert sleep.call_count == min(failures, 2)


def test_caller_sql_error_is_never_retried(monkeypatch):
    connection = MagicMock()
    connect = MagicMock(return_value=connection)
    monkeypatch.setattr("cubici_service.db.connection.psycopg.connect", connect)
    error = psycopg.OperationalError("synthetic SQL failure")
    with pytest.raises(psycopg.OperationalError) as raised:
        with get_connection(config.Settings(environment="local")):
            raise error
    assert raised.value is error
    connect.assert_called_once()
    connection.__exit__.assert_called_once()


def test_existing_env_lookup_order_is_preserved():
    assert config.LOCAL_ENV_FILES == (
        config.PROJECT_ROOT / ".env", config.SERVICE_API_ROOT / ".env",
    )
