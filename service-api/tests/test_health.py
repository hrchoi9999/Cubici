from cubici_service.app import create_app
from cubici_service.api.v1.endpoints import health
from cubici_service.db.connection import DatabaseCheck


def test_health_endpoint_payload() -> None:
    response = health.health_check()

    assert response.status == "ok"
    assert response.service == "cubici-service-api"
    assert response.api_version == "0.1.0"


def test_health_route_registered() -> None:
    app = create_app()
    direct_paths = {route.path for route in app.routes if hasattr(route, "path")}
    schema_paths = set(app.openapi()["paths"])

    assert "/health" in direct_paths
    assert "/health/db" in direct_paths
    assert "/v1/health" in direct_paths
    assert "/v1/health/db" in direct_paths
    assert "/v1/api/health" in schema_paths
    assert "/v1/api/health/db" in schema_paths


def test_database_health_endpoint_payload(monkeypatch) -> None:
    def fake_check_database_connection() -> DatabaseCheck:
        return DatabaseCheck(
            status="ok",
            database="cubici_local",
            schema_name="public",
            application_table_count=45,
        )

    monkeypatch.setattr(
        health,
        "check_database_connection",
        fake_check_database_connection,
    )

    response = health.database_health_check()

    assert response.status == "ok"
    assert response.database == "cubici_local"
    assert response.application_table_count == 45
