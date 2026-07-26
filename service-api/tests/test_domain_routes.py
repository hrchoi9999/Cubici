from cubici_service.app import create_app
from cubici_service.api.v1.endpoints import (
    accounts,
    contracts,
    documents,
    redemptions,
    risk_results,
    review_notes,
    sales,
    settlements,
)


def test_domain_routes_registered() -> None:
    app = create_app()
    paths = set(app.openapi()["paths"])

    expected_paths = {
        "/v1/api/accounts",
        "/v1/api/accounts/users",
        "/v1/api/sales",
        "/v1/api/sales/orders",
        "/v1/api/sales/returns",
        "/v1/api/settlements",
        "/v1/api/settlements/{settlements_id}",
        "/v1/api/contracts",
        "/v1/api/contracts/{mbid}",
        "/v1/api/contracts/{mbid}/status",
        "/v1/api/contracts/{mbid}/fees/adjust",
        "/v1/api/contracts/{mbid}/documents/files",
        "/v1/api/contracts/{mbid}/documents/files/{uuid}/download",
        "/v1/api/contracts/{mbid}/documents/confirm",
        "/v1/api/contracts/{mbid}/documents/checks",
        "/v1/api/contracts/{mbid}/review-notes",
        "/v1/api/redemptions",
        "/v1/api/redemptions/{mbid}",
        "/v1/api/redemptions/{mbid}/operation-history",
        "/v1/api/redemptions/{mbid}/provisions",
        "/v1/api/redemptions/{mbid}/repayments",
        "/v1/api/risk-results",
    }

    assert expected_paths.issubset(paths)


def test_domain_status_payloads() -> None:
    responses = [
        accounts.accounts_status(),
        sales.sales_status(),
    ]

    assert {response.mode for response in responses} == {"read-only-skeleton"}
    assert all(response.source_tables for response in responses)


def test_account_users_endpoint_payload(monkeypatch) -> None:
    from cubici_service.accounts.repository import AccountListResponse

    def fake_list_user_accounts(limit: int, offset: int) -> AccountListResponse:
        return AccountListResponse(limit=limit, offset=offset, total=0, items=[])

    monkeypatch.setattr(accounts, "list_user_accounts", fake_list_user_accounts)

    response = accounts.account_users(limit=10, offset=0)

    assert response.limit == 10
    assert response.offset == 0
    assert response.total == 0
    assert response.items == []


def test_risk_results_endpoint_payload(monkeypatch) -> None:
    from cubici_service.risk_results.repository import RiskResultListResponse

    def fake_list_risk_results(limit: int, offset: int) -> RiskResultListResponse:
        return RiskResultListResponse(limit=limit, offset=offset, total=0, items=[])

    monkeypatch.setattr(risk_results, "list_risk_results", fake_list_risk_results)

    response = risk_results.risk_result_list(limit=10, offset=0)

    assert response.limit == 10
    assert response.offset == 0
    assert response.total == 0
    assert response.items == []


def test_redemptions_endpoint_payload(monkeypatch) -> None:
    from cubici_service.redemptions.repository import RedemptionListResponse

    def fake_list_redemptions(
        limit: int,
        offset: int,
        *,
        mbid=None,
        outstanding_only=False,
        from_date=None,
        to_date=None,
    ) -> RedemptionListResponse:
        return RedemptionListResponse(limit=limit, offset=offset, total=0, items=[])

    monkeypatch.setattr(redemptions, "list_redemptions", fake_list_redemptions)

    response = redemptions.redemption_list(limit=10, offset=0, mbid="MPK")

    assert response.limit == 10
    assert response.offset == 0
    assert response.total == 0
    assert response.items == []


def test_contracts_endpoint_payload(monkeypatch) -> None:
    from cubici_service.contracts.repository import ContractListResponse

    captured = {}

    def fake_list_contracts(limit: int, offset: int, **filters) -> ContractListResponse:
        captured.update(filters)
        return ContractListResponse(limit=limit, offset=offset, total=0, items=[])

    monkeypatch.setattr(contracts, "list_contracts", fake_list_contracts)

    response = contracts.contract_list(
        limit=10,
        offset=0,
        user_id="owner@example.com",
        user_name="홍길동",
        firm_name="상점",
        status="REQUEST",
        product_code="HELLOPAY",
        min_sales_amount=1000,
        max_sales_amount=2000,
        order_by="sales_amount_desc",
    )

    assert response.limit == 10
    assert response.offset == 0
    assert response.total == 0
    assert response.items == []
    assert captured["status"] == "REQUEST"
    assert captured["user_id"] == "owner@example.com"
    assert captured["user_name"] == "홍길동"
    assert captured["firm_name"] == "상점"
    assert captured["product_code"] == "HELLOPAY"
    assert captured["min_sales_amount"] == 1000
    assert captured["max_sales_amount"] == 2000
    assert captured["order_by"] == "sales_amount_desc"


def test_contract_detail_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.contracts.repository import (
        ContractDetailResponse,
        ContractListItem,
    )

    def fake_get_contract_detail(mbid: str) -> ContractDetailResponse:
        return ContractDetailResponse(
            contract=ContractListItem(
                mbid=mbid,
                user_no=None,
                user_email=None,
                user_name=None,
                firm_name=None,
                fintech_id=None,
                product_code=None,
                status=None,
                request_date=None,
                approval_date=None,
                agree_date=None,
                contract_date=None,
                expire_date=None,
                cancel_request_date=None,
                reg_no_first=None,
                reg_no_second=None,
                sales_amount=None,
                payer_number=None,
                payer_status=None,
                demand_acc_bank_code=None,
                demand_acc_holder=None,
                demand_acc_number=None,
                main_acc_bank_code=None,
                main_acc_holder=None,
                main_acc_number=None,
                contract_shop_count=0,
                request_shop=0,
                sub_complete="N",
                document_file_count=0,
                prizm_score=None,
                contract_fee_count=0,
                reg_date=datetime(2026, 1, 1),
                modified_date=None,
            ),
            shops=[],
            fees=[],
            certificate=None,
            document=None,
            redemption=None,
            risk_result=None,
        )

    monkeypatch.setattr(contracts, "get_contract_detail", fake_get_contract_detail)

    response = contracts.contract_detail(mbid="TEST")

    assert response.contract.mbid == "TEST"
    assert response.shops == []
    assert response.fees == []


def test_contract_status_update_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.contracts.repository import (
        ContractStatusUpdateRequest,
        ContractStatusUpdateResponse,
    )

    captured = {}

    def fake_update_contract_status(
        mbid: str,
        payload: ContractStatusUpdateRequest,
    ) -> ContractStatusUpdateResponse:
        captured["payload"] = payload
        return ContractStatusUpdateResponse(
            mbid=mbid,
            previous_status="JOIN",
            new_status="CONTRACT",
            action=payload.action,
            changed_by=payload.changed_by,
            reason=payload.reason,
            approval_date=datetime(2026, 1, 1),
            cancel_request_date=None,
            modified_date=datetime(2026, 1, 1),
        )

    monkeypatch.setattr(contracts, "update_contract_status", fake_update_contract_status)

    response = contracts.contract_status_update(
        mbid="TEST",
        payload=contracts.ContractStatusUpdateRequest(
            action="approve",
            changed_by="admin",
            reason="승인",
        ),
    )

    assert response.mbid == "TEST"
    assert response.previous_status == "JOIN"
    assert response.new_status == "CONTRACT"
    assert captured["payload"].action == "approve"


def test_document_files_endpoint_payload(monkeypatch) -> None:
    from cubici_service.documents.repository import DocumentFileListResponse

    def fake_list_contract_document_files(mbid: str) -> DocumentFileListResponse:
        return DocumentFileListResponse(mbid=mbid, total=0, items=[])

    monkeypatch.setattr(documents, "list_contract_document_files", fake_list_contract_document_files)

    response = documents.contract_document_files(mbid="TEST")

    assert response.mbid == "TEST"
    assert response.total == 0
    assert response.items == []


def test_document_confirm_endpoint_payload(monkeypatch) -> None:
    from cubici_service.documents.repository import DocumentConfirmResponse

    def fake_confirm_contract_documents(mbid: str, confirmed_by: str) -> DocumentConfirmResponse:
        return DocumentConfirmResponse(
            mbid=mbid,
            sub_complete="Y",
            final_confirm_admin=confirmed_by,
            document_file_count=1,
        )

    monkeypatch.setattr(documents, "confirm_contract_documents", fake_confirm_contract_documents)

    response = documents.confirm_contract_document_status(
        mbid="TEST",
        payload=documents.DocumentConfirmRequest(confirmed_by="admin"),
    )

    assert response.mbid == "TEST"
    assert response.sub_complete == "Y"
    assert response.final_confirm_admin == "admin"


def test_document_checks_endpoint_payload(monkeypatch) -> None:
    from cubici_service.documents.repository import (
        DocumentCheckUpdateRequest,
        DocumentCheckUpdateResponse,
    )

    captured = {}

    def fake_update_contract_document_checks(
        mbid: str,
        payload: DocumentCheckUpdateRequest,
    ) -> DocumentCheckUpdateResponse:
        captured["payload"] = payload
        return DocumentCheckUpdateResponse(
            mbid=mbid,
            cb_check="1",
            cb_confirm_admin=payload.updated_by,
            national_tax_full_payment=payload.national_tax_full_payment,
            local_tax_full_payment=payload.local_tax_full_payment,
            health_insurance_full_payment=payload.health_insurance_full_payment,
            health_insurance_paid_amount=payload.health_insurance_paid_amount,
        )

    monkeypatch.setattr(documents, "update_contract_document_checks", fake_update_contract_document_checks)

    response = documents.update_contract_document_check_values(
        mbid="TEST",
        payload=documents.DocumentCheckUpdateRequest(
            updated_by="admin",
            cb_score_current=700,
            national_tax_full_payment="1",
            local_tax_full_payment="0",
            health_insurance_full_payment="1",
            health_insurance_paid_amount=10000,
        ),
    )

    assert response.mbid == "TEST"
    assert response.cb_check == "1"
    assert response.cb_confirm_admin == "admin"
    assert captured["payload"].cb_score_current == 700


def test_review_notes_endpoint_payload(monkeypatch) -> None:
    from cubici_service.review_notes.repository import ReviewNoteListResponse

    def fake_list_review_notes(mbid: str) -> ReviewNoteListResponse:
        return ReviewNoteListResponse(mbid=mbid, total=0, items=[])

    monkeypatch.setattr(review_notes, "list_review_notes", fake_list_review_notes)

    response = review_notes.contract_review_notes(mbid="TEST")

    assert response.mbid == "TEST"
    assert response.total == 0
    assert response.items == []


def test_settlements_endpoint_payload(monkeypatch) -> None:
    from cubici_service.settlements.repository import SettlementListResponse

    def fake_list_settlements(
        limit: int,
        offset: int,
        *,
        shop_type=None,
        shop_id=None,
        status=None,
        from_date=None,
        to_date=None,
    ) -> SettlementListResponse:
        return SettlementListResponse(limit=limit, offset=offset, total=0, items=[])

    monkeypatch.setattr(settlements, "list_settlements", fake_list_settlements)

    response = settlements.settlement_list(limit=10, offset=0, shop_type="NAVER")

    assert response.limit == 10
    assert response.offset == 0
    assert response.total == 0
    assert response.items == []


def test_sale_returns_endpoint_payload(monkeypatch) -> None:
    from cubici_service.sales.repository import SaleReturnListResponse

    def fake_list_sale_returns(limit: int, offset: int) -> SaleReturnListResponse:
        return SaleReturnListResponse(limit=limit, offset=offset, total=0, items=[])

    monkeypatch.setattr(sales, "list_sale_returns", fake_list_sale_returns)

    response = sales.sale_returns(limit=10, offset=0)

    assert response.limit == 10
    assert response.offset == 0
    assert response.total == 0
    assert response.items == []


def test_sale_orders_endpoint_payload(monkeypatch) -> None:
    from cubici_service.sales.repository import SaleListResponse

    def fake_list_sales(limit: int, offset: int) -> SaleListResponse:
        return SaleListResponse(limit=limit, offset=offset, total=0, items=[])

    monkeypatch.setattr(sales, "list_sales", fake_list_sales)

    response = sales.sale_orders(limit=10, offset=0)

    assert response.limit == 10
    assert response.offset == 0
    assert response.total == 0
    assert response.items == []
