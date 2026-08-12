from datetime import datetime

from fastapi.testclient import TestClient

from cubici_service.accounts.repository import AccountAuthUser
from cubici_service.app import create_app


def _user(user_no: int = 72, email: str = "user@example.com", user_type: str = "USER") -> AccountAuthUser:
    return AccountAuthUser(
        user_no=user_no,
        email=email,
        user_type=user_type,
        name="사용자",
        phone=None,
        biz_num=None,
        biz_name=None,
    )


def test_sales_shop_scope_requires_bearer_token() -> None:
    response = TestClient(create_app()).get("/v1/api/sales/orders?shop_pairs=NAVER:seller01")

    assert response.status_code == 401
    assert response.json()["detail"] == "bearer token required"


def test_product_analysis_shop_scope_requires_bearer_token() -> None:
    response = TestClient(create_app()).get("/v1/api/sales/product-analysis?shop_pairs=NAVER:seller01")

    assert response.status_code == 401
    assert response.json()["detail"] == "bearer token required"


def test_product_analysis_accepts_owned_shop_pair(monkeypatch) -> None:
    from cubici_service.api.v1.endpoints import sales
    from cubici_service.sales.repository import ProductAnalysisResponse

    monkeypatch.setattr("cubici_service.core.access_control.get_authenticated_user", lambda token: _user())
    monkeypatch.setattr("cubici_service.core.access_control._fetch_user_shop_pairs", lambda user_no: {("NAVER", "seller01")})
    monkeypatch.setattr(
        sales,
        "get_product_analysis",
        lambda **kwargs: ProductAnalysisResponse(shop_breakdown=[], top_products=[]),
    )

    response = TestClient(create_app()).get(
        "/v1/api/sales/product-analysis?shop_pairs=NAVER:seller01",
        headers={"Authorization": "Bearer user-token"},
    )

    assert response.status_code == 200
    assert response.json() == {"shop_breakdown": [], "top_products": []}


def test_sales_shop_scope_accepts_owned_shop_pair(monkeypatch) -> None:
    from cubici_service.api.v1.endpoints import sales
    from cubici_service.sales.repository import SaleListResponse

    monkeypatch.setattr("cubici_service.core.access_control.get_authenticated_user", lambda token: _user())
    monkeypatch.setattr("cubici_service.core.access_control._fetch_user_shop_pairs", lambda user_no: {("NAVER", "seller01")})
    monkeypatch.setattr(
        sales,
        "list_sales",
        lambda **kwargs: SaleListResponse(limit=kwargs["limit"], offset=kwargs["offset"], total=0, items=[]),
    )

    response = TestClient(create_app()).get(
        "/v1/api/sales/orders?shop_pairs=NAVER:seller01",
        headers={"Authorization": "Bearer user-token"},
    )

    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_sales_shop_scope_rejects_unowned_shop_pair(monkeypatch) -> None:
    monkeypatch.setattr("cubici_service.core.access_control.get_authenticated_user", lambda token: _user())
    monkeypatch.setattr("cubici_service.core.access_control._fetch_user_shop_pairs", lambda user_no: {("NAVER", "seller01")})

    response = TestClient(create_app()).get(
        "/v1/api/sales/orders?shop_pairs=COUPANG:other-seller",
        headers={"Authorization": "Bearer user-token"},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "shop owner required"


def test_contract_request_user_no_owner_check_passes_body_to_route(monkeypatch) -> None:
    from cubici_service.api.v1.endpoints import contracts
    from cubici_service.contracts.repository import ContractRequestCreateResponse

    captured = {}

    def fake_create_contract_request(payload) -> ContractRequestCreateResponse:
        captured["payload"] = payload
        return ContractRequestCreateResponse(
            insert_code=0,
            message="신청 되었습니다!",
            mbid="MPGTEST001",
            user_no=payload.user_no,
            product_code=payload.product_code,
            status="REQUEST",
            request_date=datetime(2026, 7, 27, 13, 0, 0),
            shop_count=len(payload.request_shop_types),
            requested_shop_types=payload.request_shop_types,
        )

    monkeypatch.setattr("cubici_service.core.access_control.get_authenticated_user", lambda token: _user(user_no=72))
    monkeypatch.setattr(contracts, "create_contract_request", fake_create_contract_request)

    response = TestClient(create_app()).post(
        "/v1/api/contracts/requests",
        headers={"Authorization": "Bearer user-token"},
        json={
            "user_no": 72,
            "request_shop_types": ["NAVER"],
            "identity_confirmed": True,
            "terms_agreed": True,
            "submitted_document_types": ["regNo", "CBInfo"],
        },
    )

    assert response.status_code == 200
    assert response.json()["user_no"] == 72
    assert captured["payload"].user_no == 72


def test_contract_request_rejects_other_user_no(monkeypatch) -> None:
    monkeypatch.setattr("cubici_service.core.access_control.get_authenticated_user", lambda token: _user(user_no=72))

    response = TestClient(create_app()).post(
        "/v1/api/contracts/requests",
        headers={"Authorization": "Bearer user-token"},
        json={
            "user_no": 73,
            "request_shop_types": ["NAVER"],
            "identity_confirmed": True,
            "terms_agreed": True,
            "submitted_document_types": ["regNo", "CBInfo"],
        },
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "resource owner required"


def _inquiry_update_payload(user_no: int) -> dict:
    return {
        "user_no": user_no,
        "type": "CUBICI",
        "title": "문의 제목",
        "content": "문의 내용",
        "visibility": "private",
        "operated_by": "user-web",
    }


def test_inquiry_update_accepts_owner_user_no_from_body(monkeypatch) -> None:
    from cubici_service.api.v1.endpoints import support
    from cubici_service.support.repository import InquiryWriteResponse

    captured = {}

    def fake_update_inquiry(qna_id, payload) -> InquiryWriteResponse:
        captured["qna_id"] = qna_id
        captured["user_no"] = payload.user_no
        return InquiryWriteResponse(action="updated", qna_id=qna_id)

    monkeypatch.setattr("cubici_service.core.access_control.get_authenticated_user", lambda token: _user(user_no=72))
    monkeypatch.setattr(support, "update_inquiry", fake_update_inquiry)

    response = TestClient(create_app()).put(
        "/v1/api/support/inquiries/10",
        headers={"Authorization": "Bearer user-token"},
        json=_inquiry_update_payload(72),
    )

    assert response.status_code == 200
    assert response.json() == {"action": "updated", "qna_id": 10, "detail": None}
    assert captured == {"qna_id": 10, "user_no": 72}


def test_inquiry_update_rejects_other_user_no_from_body(monkeypatch) -> None:
    from cubici_service.api.v1.endpoints import support

    called = False

    def fake_update_inquiry(qna_id, payload):
        nonlocal called
        called = True

    monkeypatch.setattr("cubici_service.core.access_control.get_authenticated_user", lambda token: _user(user_no=72))
    monkeypatch.setattr(support, "update_inquiry", fake_update_inquiry)

    response = TestClient(create_app()).put(
        "/v1/api/support/inquiries/10?user_no=72",
        headers={"Authorization": "Bearer user-token"},
        json=_inquiry_update_payload(73),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "resource owner required"
    assert called is False


def test_inquiry_update_requires_bearer_token() -> None:
    response = TestClient(create_app()).put(
        "/v1/api/support/inquiries/10",
        json=_inquiry_update_payload(72),
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "bearer token required"
