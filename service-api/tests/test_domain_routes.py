from datetime import date

from cubici_service.app import create_app
from cubici_service.api.v1.endpoints import (
    accounts,
    contracts,
    documents,
    fintech,
    management,
    monitoring,
    preferences,
    redemptions,
    risk_results,
    review_notes,
    sales,
    settlements,
    support,
)


def test_domain_routes_registered() -> None:
    app = create_app()
    paths = set(app.openapi()["paths"])

    expected_paths = {
        "/v1/api/accounts",
        "/v1/api/accounts/users",
        "/v1/api/accounts/signup",
        "/v1/api/accounts/login",
        "/v1/api/accounts/admin-login",
        "/v1/api/accounts/me",
        "/v1/api/accounts/admin-me",
        "/v1/api/accounts/me/company",
        "/v1/api/accounts/me/shops",
        "/v1/api/accounts/me/shops/{account_id}",
        "/v1/api/sales",
        "/v1/api/sales/orders",
        "/v1/api/sales/product-analysis",
        "/v1/api/sales/returns",
        "/v1/api/settlements",
        "/v1/api/settlements/{settlements_id}",
        "/v1/api/contracts",
        "/v1/api/contracts/requests",
        "/v1/api/contracts/{mbid}",
        "/v1/api/contracts/{mbid}/status",
        "/v1/api/contracts/{mbid}/electronic-signature",
        "/v1/api/contracts/{mbid}/fees/adjust",
        "/v1/api/contracts/{mbid}/documents/files",
        "/v1/api/contracts/{mbid}/documents/files/{uuid}/download",
        "/v1/api/contracts/{mbid}/documents/confirm",
        "/v1/api/contracts/{mbid}/documents/checks",
        "/v1/api/contracts/{mbid}/review-notes",
        "/v1/api/fintech/status",
        "/v1/api/fintech/funding-summary",
        "/v1/api/fintech/funding-providers",
        "/v1/api/fintech/trade-requests",
        "/v1/api/fintech/trade-requests/{req_date}/{bank_code}/{comp_code}/{seq_no}",
        "/v1/api/fintech/firm-requests",
        "/v1/api/fintech/result-inquiries",
        "/v1/api/fintech/mock/transfer-message",
        "/v1/api/fintech/mock/transfer-request",
        "/v1/api/fintech/mock/transfer-response",
        "/v1/api/fintech/mock/result-inquiry",
        "/v1/api/redemptions",
        "/v1/api/redemptions/{mbid}",
        "/v1/api/redemptions/{mbid}/operation-history",
        "/v1/api/redemptions/{mbid}/operations/{operation_history_id}/cancel",
        "/v1/api/redemptions/{mbid}/provisions",
        "/v1/api/redemptions/{mbid}/repayments",
        "/v1/api/risk-results",
        "/v1/api/management/overview",
        "/v1/api/management/member-summary",
        "/v1/api/management/member-info",
        "/v1/api/management/member-payments",
        "/v1/api/management/member-charge-changes",
        "/v1/api/management/member-charge-changes/{new_seq}/refund",
        "/v1/api/management/member-charge-changes/{new_seq}/refund-finish",
        "/v1/api/management/member-withdrawals",
        "/v1/api/management/member-status/{user_no}",
        "/v1/api/management/usage",
        "/v1/api/management/usage/{mbid}",
        "/v1/api/monitoring/error-logs",
        "/v1/api/monitoring/server-status",
        "/v1/api/preferences/admin-accounts",
        "/v1/api/preferences/admin-accounts/id-check",
        "/v1/api/preferences/admin-accounts/request",
        "/v1/api/preferences/admin-accounts/{admin_id}",
        "/v1/api/preferences/admin-accounts/{admin_id}/approve",
        "/v1/api/preferences/promotions",
        "/v1/api/preferences/promotions/options",
        "/v1/api/preferences/promotions/{promo_code}",
        "/v1/api/preferences/partners",
        "/v1/api/preferences/partners/id-check",
        "/v1/api/preferences/partners/code-check",
        "/v1/api/preferences/partners/{partner_id}",
        "/v1/api/preferences/moneybank-products",
        "/v1/api/preferences/moneybank-products/{firm_no}",
        "/v1/api/preferences/prizm-config/items",
        "/v1/api/preferences/prizm-config/items/{division}/{subject_no}/{item_no}",
        "/v1/api/preferences/prizm-config/update-records",
        "/v1/api/preferences/raw-data/tables",
        "/v1/api/preferences/raw-data/tables/{table_name}/columns",
        "/v1/api/preferences/raw-data/formulas",
        "/v1/api/preferences/raw-data/formulas/{raw_data_no}",
        "/v1/api/preferences/raw-data/preview",
        "/v1/api/preferences/charges",
        "/v1/api/preferences/charges/{charge_code}",
        "/v1/api/support/inquiries",
        "/v1/api/support/inquiries/{qna_id}",
        "/v1/api/support/inquiries/{qna_id}/replies",
        "/v1/api/support/inquiries/{qna_id}/replies/{reply_id}",
        "/v1/api/support/message-templates",
        "/v1/api/support/message-templates/{message_no}",
        "/v1/api/support/boards/{board_kind}",
        "/v1/api/support/boards/{board_kind}/{post_id}",
    }

    assert expected_paths.issubset(paths)


def test_domain_status_payloads() -> None:
    responses = [
        accounts.accounts_status(),
        sales.sales_status(),
    ]

    assert {response.mode for response in responses} == {"read-only-skeleton"}
    assert all(response.source_tables for response in responses)


def test_fintech_funding_summary_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.fintech.repository import (
        FundingSummaryCounts,
        FundingSummaryItem,
        FundingSummaryResponse,
    )

    payload = FundingSummaryResponse(
        limit=10,
        offset=0,
        counts=FundingSummaryCounts(
            total_count=1,
            funding_amount=1_000_000,
            repayment_amount=700_000,
            outstanding_amount=300_000,
            repayment_excess_amount=0,
        ),
        items=[
            FundingSummaryItem(
                row_no=1,
                fintech_id=1,
                fintech_name="테스트 자금사",
                registered_date=datetime(2026, 8, 10, 9, 0, 0),
                repayment_period=30,
                interest_rate=12.0,
                funding_amount=1_000_000,
                repayment_amount=700_000,
                outstanding_amount=300_000,
                request_count=2,
            )
        ],
    )

    monkeypatch.setattr(fintech, "list_funding_summaries", lambda **kwargs: payload)

    response = fintech.funding_summary_list(limit=10, offset=0, order_by="registered_desc")

    assert response.counts.outstanding_amount == 300_000
    assert response.items[0].fintech_name == "테스트 자금사"


def test_fintech_funding_provider_create_endpoint(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.fintech.repository import (
        FundingProviderWriteRequest,
        FundingProviderWriteResponse,
        FundingSummaryItem,
    )

    provider = FundingSummaryItem(
        row_no=1,
        fintech_id=3,
        fintech_name="신규자금사",
        registered_date=datetime(2026, 8, 10, 10, 0, 0),
        repayment_period=45,
        interest_rate=11.5,
        funding_amount=0,
        repayment_amount=0,
        outstanding_amount=0,
        request_count=0,
        calculation_status="NO_FUNDING",
        configuration_status="BASIC_REGISTERED",
    )
    result = FundingProviderWriteResponse(action="created", fintech_id=3, provider=provider)
    monkeypatch.setattr(fintech, "create_funding_provider", lambda payload: result)

    response = fintech.funding_provider_create(
        FundingProviderWriteRequest(fintech_name="신규자금사", repayment_period=45, interest_rate=11.5)
    )

    assert response.fintech_id == 3
    assert response.provider.calculation_status == "NO_FUNDING"


def test_monitoring_error_logs_endpoint_payload(monkeypatch) -> None:
    from cubici_service.monitoring.repository import ErrorLogListResponse

    def fake_list_error_logs(limit: int, offset: int, **filters) -> ErrorLogListResponse:
        return ErrorLogListResponse(
            limit=limit,
            offset=offset,
            total=0,
            success_count=0,
            fail_count=0,
            pending_action_count=0,
            workflow_status_label="정상",
            items=[],
        )

    monkeypatch.setattr(monitoring, "list_error_logs", fake_list_error_logs)

    response = monitoring.error_log_list(limit=10, offset=0, status="ALL")

    assert response.limit == 10
    assert response.offset == 0
    assert response.total == 0
    assert response.items == []


def test_monitoring_server_status_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.monitoring.repository import (
        ServerStatusMetric,
        ServerStatusResponse,
    )

    checked_at = datetime(2026, 7, 22, 10, 0, 0)

    def fake_get_server_status(hours: int) -> ServerStatusResponse:
        return ServerStatusResponse(
            checked_at=checked_at,
            overall_status="정상",
            metrics=[
                ServerStatusMetric(
                    name="API 서버",
                    status="정상",
                    value="응답 가능",
                    checked_at=checked_at,
                    note="테스트",
                )
            ],
            recent_success_count=3,
            recent_fail_count=0,
            last_success_at=checked_at,
            last_fail_at=None,
        )

    monkeypatch.setattr(monitoring, "get_server_status", fake_get_server_status)

    response = monitoring.server_status(hours=24)

    assert response.overall_status == "정상"
    assert response.recent_success_count == 3
    assert response.metrics[0].name == "API 서버"


def test_fintech_status_endpoint_payload() -> None:
    response = fintech.fintech_integration_status()

    assert response.live_transfer_enabled is False
    assert "TRADE_REQUEST_BIN" in response.source_tables
    assert "mock transfer message build" in response.supported_operations


def test_fintech_trade_request_policy_filter_forwarded(monkeypatch) -> None:
    from cubici_service.fintech.repository import TradeRequestBinListResponse

    captured = {}

    def fake_list_trade_requests(limit: int, offset: int, **filters) -> TradeRequestBinListResponse:
        captured.update(filters)
        return TradeRequestBinListResponse(limit=limit, offset=offset, total=0, items=[])

    monkeypatch.setattr(fintech, "list_trade_requests", fake_list_trade_requests)

    response = fintech.trade_request_list(limit=10, offset=0, result_policy="실패·반려")

    assert response.total == 0
    assert captured["result_policy"] == "실패·반려"


def test_fintech_mock_transfer_message_payload() -> None:
    response = fintech.mock_transfer_message(
        fintech.MockTransferMessageRequest(
            mbid="MB00000001",
            comp_code="COMP0001",
            bank_code="039",
            seq_no="000001",
            amount=12000,
            withdrawal_bank_code="039",
            withdrawal_account_number="1234567890",
            deposit_bank_code="088",
            deposit_account_number="9876543210",
            deposit_summary="TESTIN",
            withdrawal_summary="TESTOUT",
        )
    )

    assert response.adapter_mode == "mock"
    assert response.live_transfer_enabled is False
    assert response.message_length == 300
    assert response.parsed["amount"] == 12000
    assert response.parsed["msg_code"] == "0100100"
    encoded = response.send_msg.encode("euc-kr")
    assert encoded[9:17].decode("euc-kr") == "COMP0001"
    assert encoded[19:23].decode("euc-kr") == "0100"
    assert encoded[23:26].decode("euc-kr") == "100"
    assert encoded[27:33].decode("euc-kr") == "000001"
    assert encoded[129:142].decode("euc-kr") == "0000000012000"
    assert encoded[158:173].decode("euc-kr").strip() == "9876543210"


def test_fintech_mock_transfer_request_endpoint(monkeypatch) -> None:
    from cubici_service.fintech.repository import MockTransferPersistResponse

    captured = {}

    def fake_save_mock_transfer_request(payload) -> MockTransferPersistResponse:
        captured["payload"] = payload
        return MockTransferPersistResponse(
            adapter_mode="mock-db",
            live_transfer_enabled=False,
            created=True,
            req_date="20260722",
            req_time="120000",
            bank_code=payload.bank_code,
            comp_code=payload.comp_code,
            seq_no=payload.seq_no,
            msg_code="0100100",
            send_flag="N",
            recv_flag="N",
            process_status="MOCK",
            message_length=300,
            warning="테스트",
        )

    monkeypatch.setattr(fintech, "save_mock_transfer_request", fake_save_mock_transfer_request)

    response = fintech.mock_transfer_request(
        fintech.MockTransferMessageRequest(
            mbid="MB00000001",
            comp_code="COMP0001",
            bank_code="039",
            seq_no="000003",
            amount=12000,
            withdrawal_account_number="1234567890",
            deposit_bank_code="088",
            deposit_account_number="9876543210",
        )
    )

    assert response.created is True
    assert response.process_status == "MOCK"
    assert captured["payload"].seq_no == "000003"


def test_fintech_mock_transfer_response_endpoint(monkeypatch) -> None:
    from cubici_service.fintech.repository import MockTransferResponsePersistResponse

    captured = {}

    def fake_save_mock_transfer_response(payload) -> MockTransferResponsePersistResponse:
        captured["payload"] = payload
        return MockTransferResponsePersistResponse(
            adapter_mode="mock-db",
            live_transfer_enabled=False,
            updated=True,
            req_date=payload.req_date,
            bank_code=payload.bank_code,
            comp_code=payload.comp_code,
            seq_no=payload.seq_no,
            recv_flag="Y",
            result_policy="정상",
            result_reason="은행응답코드 0000 - 정상처리",
            warning="테스트",
        )

    monkeypatch.setattr(fintech, "save_mock_transfer_response", fake_save_mock_transfer_response)

    response = fintech.mock_transfer_response(
        fintech.MockTransferResponseRequest(
            req_date="20260722",
            bank_code="039",
            comp_code="COMP0001",
            seq_no="000003",
        )
    )

    assert response.updated is True
    assert response.result_policy == "정상"
    assert captured["payload"].seq_no == "000003"


def test_fintech_mock_result_inquiry_endpoint(monkeypatch) -> None:
    from cubici_service.fintech.repository import MockResultInquiryPersistResponse

    captured = {}

    def fake_save_mock_result_inquiry(payload) -> MockResultInquiryPersistResponse:
        captured["payload"] = payload
        return MockResultInquiryPersistResponse(
            adapter_mode="mock-db",
            live_transfer_enabled=False,
            created=True,
            id=1,
            mbid="MB00000001",
            original_req_date=payload.req_date,
            original_bank_code=payload.bank_code,
            original_comp_code=payload.comp_code,
            original_seq_no=payload.seq_no,
            processing_result=payload.processing_result,
            original_processing_result=payload.original_processing_result,
            processing_status="MOCK",
            warning="테스트",
        )

    monkeypatch.setattr(fintech, "save_mock_result_inquiry", fake_save_mock_result_inquiry)

    response = fintech.mock_result_inquiry(
        fintech.MockResultInquiryRequest(
            req_date="20260722",
            bank_code="039",
            comp_code="COMP0001",
            seq_no="000003",
        )
    )

    assert response.created is True
    assert response.processing_status == "MOCK"
    assert captured["payload"].original_processing_result == "0000"


def test_fintech_hyphen_message_parser() -> None:
    from cubici_service.fintech.repository import evaluate_trade_result, parse_hyphen_message

    response = fintech.mock_transfer_message(
        fintech.MockTransferMessageRequest(
            comp_code="COMP0001",
            bank_code="039",
            seq_no="000002",
            amount=34500,
            withdrawal_account_number="111222333",
            deposit_bank_code="088",
            deposit_account_number="444555666",
            deposit_summary="DEPOSIT",
            withdrawal_summary="WITHDRAW",
        )
    )

    parsed = parse_hyphen_message(response.send_msg)
    assert parsed is not None
    assert parsed.message_length == 300
    assert parsed.msg_code == "0100100"
    assert parsed.operation == "송금이체 요청"

    fields = {field.name: field for field in parsed.fields}
    assert fields["업체코드"].value == "COMP0001"
    assert fields["전문번호"].int_value == 2
    assert fields["출금금액"].int_value == 34500
    assert fields["입금계좌번호"].value == "444555666"

    assert evaluate_trade_result(recv_flag="N", parsed_recv_msg=None)[0] == "재조회 필요"

    response_message = bytearray(response.send_msg.encode("euc-kr"))
    response_message[19:23] = b"0110"
    response_message[47:51] = b"0000"
    response_message[51:55] = b"0000"
    parsed_response = parse_hyphen_message(response_message.decode("euc-kr"))
    assert evaluate_trade_result(recv_flag="Y", parsed_recv_msg=parsed_response) == (
        "정상",
        "은행응답코드 0000 - 정상처리",
    )

    response_message[51:55] = b"9018"
    failed_response = parse_hyphen_message(response_message.decode("euc-kr"))
    assert evaluate_trade_result(recv_flag="Y", parsed_recv_msg=failed_response) == (
        "실패·반려",
        "은행응답코드 9018 - 코드명 미확인",
    )


def test_preferences_charge_endpoint_payload(monkeypatch) -> None:
    from datetime import date, datetime

    from cubici_service.preferences.repository import (
        ChargeCounts,
        ChargeListItem,
        ChargeListResponse,
        ChargeWriteResponse,
    )

    item = ChargeListItem(
        row_no=1,
        charge_code="B0101",
        charge_name="1개월 기본요금",
        charge_type="B",
        status="운영",
        start_date=date(2023, 1, 1),
        expire_date=date(2099, 12, 31),
        sub_id=1,
        sales_count="30",
        product_count="10",
        amount=29000,
        period=1,
        period_unit="M",
        charge_detail="기본 요금제",
        reg_date=datetime(2023, 3, 27, 10, 18, 50),
        update_date=None,
    )

    received_filters = {}

    def fake_list_charges(limit: int, offset: int, **filters) -> ChargeListResponse:
        received_filters.update(filters)
        return ChargeListResponse(
            limit=limit,
            offset=offset,
            counts=ChargeCounts(total_count=1, operating_count=1, ended_count=0),
            items=[item],
        )

    def fake_get_charge(charge_code: str) -> ChargeListItem | None:
        return item if charge_code == "B0101" else None

    def fake_update_charge(charge_code: str, payload) -> ChargeWriteResponse | None:
        return ChargeWriteResponse(action="updated", charge_code=charge_code, charge=item)

    monkeypatch.setattr(preferences, "list_charges", fake_list_charges)
    monkeypatch.setattr(preferences, "get_charge", fake_get_charge)
    monkeypatch.setattr(preferences, "update_charge", fake_update_charge)

    response = preferences.charge_list(limit=10, offset=0, status="all", charge_type="B")
    detail = preferences.charge_detail("B0101")
    result = preferences.charge_update(
        "B0101",
        preferences.ChargeWriteRequest(
            charge_code="B0101",
            charge_name="1개월 기본요금",
            charge_type="B",
            start_date=date(2023, 1, 1),
            expire_date=date(2099, 12, 31),
        ),
    )

    assert response.limit == 10
    assert response.counts.total_count == 1
    assert received_filters["charge_type"] == "B"
    assert detail.charge_code == "B0101"
    assert result.action == "updated"


def test_preferences_admin_account_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from pydantic import SecretStr

    from cubici_service.preferences.repository import (
        AdminAccountCounts,
        AdminAccountIdCheckResponse,
        AdminAccountListItem,
        AdminAccountListResponse,
        AdminAccountWriteResponse,
    )

    item = AdminAccountListItem(
        row_no=1,
        admin_id="temp_id_1",
        admin_type="00",
        admin_type_label="큐빅아이",
        admin_name="관리자",
        admin_phone="01000000000",
        admin_email="admin@example.com",
        admin_department="운영",
        admin_grade="02",
        admin_grade_label="승인대기",
        approval_status="대기",
        admin_reg_date=datetime(2026, 7, 22, 10, 0, 0),
        admin_approval_date=None,
        modified_date=None,
    )

    approved = item.model_copy(
        update={
            "admin_id": "admin01",
            "admin_grade": "00",
            "admin_grade_label": "권한1",
            "approval_status": "승인완료",
            "admin_approval_date": datetime(2026, 7, 22, 11, 0, 0),
        }
    )

    def fake_list_admin_accounts(limit: int, offset: int, **filters) -> AdminAccountListResponse:
        return AdminAccountListResponse(
            limit=limit,
            offset=offset,
            counts=AdminAccountCounts(total_count=1, pending_count=1, approved_count=0),
            items=[item],
        )

    def fake_admin_id_exists(admin_id: str) -> AdminAccountIdCheckResponse:
        return AdminAccountIdCheckResponse(admin_id=admin_id, exists=False)

    def fake_approve_admin_account(admin_id: str, payload) -> AdminAccountWriteResponse | None:
        return AdminAccountWriteResponse(action="approved", admin_id=payload.new_admin_id, account=approved)

    monkeypatch.setattr(preferences, "list_admin_accounts", fake_list_admin_accounts)
    monkeypatch.setattr(preferences, "admin_id_exists", fake_admin_id_exists)
    monkeypatch.setattr(preferences, "approve_admin_account", fake_approve_admin_account)

    response = preferences.admin_account_list(limit=10, offset=0, status="all")
    check = preferences.admin_account_id_check(admin_id="admin01")
    result = preferences.admin_account_approve(
        "temp_id_1",
        preferences.AdminAccountApproveRequest(
            new_admin_id="admin01",
            password=SecretStr("password"),
            admin_grade="00",
        ),
    )

    assert response.counts.total_count == 1
    assert response.items[0].approval_status == "대기"
    assert check.exists is False
    assert result.action == "approved"
    assert result.admin_id == "admin01"


def test_admin_account_requests_reject_invalid_permission_policy() -> None:
    import pytest
    from pydantic import ValidationError

    from cubici_service.preferences.repository import (
        AdminAccountApproveRequest,
        AdminAccountRequest,
        AdminAccountUpdateRequest,
    )

    with pytest.raises(ValidationError):
        AdminAccountRequest(admin_type="99", admin_name="관리자")

    with pytest.raises(ValidationError):
        AdminAccountApproveRequest(new_admin_id="admin01", password="pw", admin_grade="02")

    with pytest.raises(ValidationError):
        AdminAccountUpdateRequest(
            admin_type="00",
            admin_name="관리자",
            admin_grade="02",
        )


def test_preferences_promotion_endpoint_payload(monkeypatch) -> None:
    from datetime import date, datetime

    from cubici_service.preferences.repository import (
        PromotionCounts,
        PromotionListItem,
        PromotionListResponse,
        PromotionOption,
        PromotionOptionsResponse,
        PromotionWriteResponse,
    )

    item = PromotionListItem(
        row_no=1,
        promo_code="NCBCI",
        promo_name="신규 자체 프로모션",
        promo_target="N",
        promo_target_label="신규",
        partner_code="CBCI",
        partner_name="자체",
        status="Y",
        status_label="운영",
        start_date=date(2026, 7, 1),
        expire_date=date(2026, 12, 31),
        charge_codes=["B0101"],
        charge_names=["1개월 기본요금"],
        discount_rate=10,
        discount_amount=None,
        period=1,
        period_unit="M",
        period_unit_label="개월",
        sub_id=1,
        sub_id_label="1",
        promo_detail="테스트",
        reg_date=datetime(2026, 7, 22, 10, 0, 0),
        update_date=None,
    )

    def fake_list_promotions(limit: int, offset: int, **filters) -> PromotionListResponse:
        return PromotionListResponse(
            limit=limit,
            offset=offset,
            counts=PromotionCounts(total_count=1, operating_count=1, ended_count=0),
            items=[item],
        )

    def fake_get_promotion(promo_code: str) -> PromotionListItem | None:
        return item if promo_code == "NCBCI" else None

    def fake_get_promotion_options(partner_division=None) -> PromotionOptionsResponse:
        return PromotionOptionsResponse(
            targets=[PromotionOption(value="N", label="신규")],
            partner_divisions=[PromotionOption(value="CBCI", label="자체")],
            partners=[],
            charges=[PromotionOption(value="B0101", label="1개월 기본요금")],
        )

    def fake_update_promotion(promo_code: str, payload) -> PromotionWriteResponse | None:
        return PromotionWriteResponse(action="updated", promo_code=promo_code, promotion=item)

    monkeypatch.setattr(preferences, "list_promotions", fake_list_promotions)
    monkeypatch.setattr(preferences, "get_promotion", fake_get_promotion)
    monkeypatch.setattr(preferences, "get_promotion_options", fake_get_promotion_options)
    monkeypatch.setattr(preferences, "update_promotion", fake_update_promotion)

    response = preferences.promotion_list(limit=10, offset=0, status="all")
    detail = preferences.promotion_detail("NCBCI")
    options = preferences.promotion_options(partner_division="CBCI")
    result = preferences.promotion_update(
        "NCBCI",
        preferences.PromotionWriteRequest(
            promo_code="NCBCI",
            promo_name="신규 자체 프로모션",
            promo_target="N",
            partner_code="CBCI",
            charge_codes=["B0101"],
            start_date=date(2026, 7, 1),
            expire_date=date(2026, 12, 31),
        ),
    )

    assert response.counts.total_count == 1
    assert detail.promo_code == "NCBCI"
    assert options.charges[0].value == "B0101"
    assert result.action == "updated"


def test_preferences_partner_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.preferences.repository import (
        PartnerCheckResponse,
        PartnerCounts,
        PartnerDetailResponse,
        PartnerListItem,
        PartnerListResponse,
        PartnerManagerPayload,
        PartnerWriteResponse,
    )

    item = PartnerListItem(
        row_no=1,
        partner_id="1234567890",
        partner_code="BAAZ",
        partner_name="아즈온",
        rep_name="대표",
        partner_zip="12345",
        partner_address="서울",
        partner_status="00",
        partner_status_label="운영",
        partner_type="BA",
        partner_type_label="BA",
        memo="테스트",
        manager_name="담당자",
        manager_phone="01000000000",
        reg_date=datetime(2026, 7, 22, 10, 0, 0),
        update_date=None,
    )
    detail = PartnerDetailResponse(
        partner=item,
        managers=[
            PartnerManagerPayload(manager_type="00", manager_name="책임자", manager_rank="팀장", manager_email="sup@example.com", manager_phone="01011112222"),
            PartnerManagerPayload(manager_type="01", manager_name="담당자", manager_rank="매니저", manager_email="manager@example.com", manager_phone="01000000000"),
        ],
    )

    def fake_list_partners(limit: int, offset: int, **filters) -> PartnerListResponse:
        return PartnerListResponse(
            limit=limit,
            offset=offset,
            counts=PartnerCounts(
                total_count=1,
                operating_count=1,
                ended_count=0,
                type_ba_count=1,
                type_bb_count=0,
                type_co_count=0,
                type_fi_count=0,
                type_mn_count=0,
                type_th_count=0,
            ),
            items=[item],
        )

    def fake_get_partner(partner_id: str) -> PartnerDetailResponse | None:
        return detail if partner_id == "1234567890" else None

    def fake_partner_id_exists(partner_id: str) -> PartnerCheckResponse:
        return PartnerCheckResponse(value=partner_id, exists=False)

    def fake_update_partner(partner_id: str, payload) -> PartnerWriteResponse | None:
        return PartnerWriteResponse(action="updated", partner_id=partner_id, partner=detail)

    monkeypatch.setattr(preferences, "list_partners", fake_list_partners)
    monkeypatch.setattr(preferences, "get_partner", fake_get_partner)
    monkeypatch.setattr(preferences, "partner_id_exists", fake_partner_id_exists)
    monkeypatch.setattr(preferences, "update_partner", fake_update_partner)

    response = preferences.partner_list(limit=10, offset=0, partner_status="all")
    check = preferences.partner_id_check(partner_id="1234567890")
    fetched = preferences.partner_detail("1234567890")
    result = preferences.partner_update(
        "1234567890",
        preferences.PartnerWriteRequest(
            partner_id="1234567890",
            partner_code="BAAZ",
            partner_name="아즈온",
            rep_name="대표",
            partner_zip="12345",
            partner_address="서울",
            partner_status="00",
            partner_type="BA",
        ),
    )

    assert response.counts.total_count == 1
    assert check.exists is False
    assert fetched.partner.partner_code == "BAAZ"
    assert result.action == "updated"


def test_preferences_moneybank_product_endpoint_payload(monkeypatch) -> None:
    from datetime import date, datetime

    from cubici_service.preferences.repository import (
        MoneybankProductCounts,
        MoneybankProductListItem,
        MoneybankProductListResponse,
        MoneybankProductWriteResponse,
    )

    item = MoneybankProductListItem(
        row_no=1,
        firm_no=10,
        firm_id="1234567890",
        firm_name="머니뱅크 제휴사",
        rep_name="대표",
        firm_zip="12345",
        firm_address="서울",
        manager_name="담당자",
        manager_rank="팀장",
        manager_phone="01000000000",
        developer_name="개발",
        developer_rank="매니저",
        developer_phone="01011112222",
        cs_name="CS",
        cs_rank="대리",
        cs_phone="01033334444",
        firm_tel="0212345678",
        firm_fax=None,
        firm_email="firm@example.com",
        division=None,
        product_name="선정산 기본상품",
        product_status="00",
        product_status_label="운영",
        min_sales_amount=1000000,
        min_business_period="6개월",
        min_calc_amount=100000,
        credit_rate="B",
        cubici_period="12개월",
        amount_limit=50000000,
        other_conditions="테스트",
        service_amount_standard="매출기준",
        service_amount_min=100000,
        service_amount_max=5000000,
        service_amount_unit="원",
        execute_amount_standard="승인금액",
        execute_amount_min=100000,
        execute_amount_max=3000000,
        execute_amount_unit="원",
        service_fee_standard="구간",
        service_fee_min=1.5,
        service_fee_max=3.0,
        annual_fee_rate=12.0,
        interest_standard="일할",
        interest_min=0.1,
        interest_max=0.5,
        limit_change_yn="Y",
        service_repay_period="일",
        service_repay_min=7,
        service_repay_max=30,
        service_repay_method="만기일시",
        extension_yn="N",
        launch_date=date(2026, 7, 1),
        expire_date=date(2026, 12, 31),
        repayment_count=1,
        repay_amount=1000000,
        mid_repay_yn="Y",
        b2b_firm_name="B2B",
        product_type="STD",
        reg_date=datetime(2026, 7, 22, 10, 0, 0),
        update_date=None,
    )

    def fake_list_moneybank_products(limit: int, offset: int, **filters) -> MoneybankProductListResponse:
        return MoneybankProductListResponse(
            limit=limit,
            offset=offset,
            counts=MoneybankProductCounts(total_count=1, operating_count=1, completed_count=0, stopped_count=0),
            items=[item],
        )

    def fake_get_moneybank_product(firm_no: int) -> MoneybankProductListItem | None:
        return item if firm_no == 10 else None

    def fake_update_moneybank_product(firm_no: int, payload) -> MoneybankProductWriteResponse | None:
        return MoneybankProductWriteResponse(action="updated", firm_no=firm_no, product=item)

    monkeypatch.setattr(preferences, "list_moneybank_products", fake_list_moneybank_products)
    monkeypatch.setattr(preferences, "get_moneybank_product", fake_get_moneybank_product)
    monkeypatch.setattr(preferences, "update_moneybank_product", fake_update_moneybank_product)

    response = preferences.moneybank_product_list(limit=10, offset=0, product_status="all")
    detail = preferences.moneybank_product_detail(10)
    result = preferences.moneybank_product_update(
        10,
        preferences.MoneybankProductWriteRequest(
            firm_id="1234567890",
            firm_name="머니뱅크 제휴사",
            rep_name="대표",
            firm_address="서울",
            product_name="선정산 기본상품",
            product_status="00",
        ),
    )

    assert response.counts.total_count == 1
    assert detail.firm_no == 10
    assert result.action == "updated"


def test_moneybank_product_write_request_rejects_invalid_conditions() -> None:
    import pytest
    from pydantic import ValidationError

    from cubici_service.preferences.repository import MoneybankProductWriteRequest

    base_payload = {
        "firm_id": "1234567890",
        "firm_name": "머니뱅크 제휴사",
        "rep_name": "대표",
        "firm_address": "서울",
        "product_name": "선정산 기본상품",
        "product_status": "00",
    }

    invalid_payloads = [
        {**base_payload, "product_status": "99"},
        {**base_payload, "service_fee_min": 3.0, "service_fee_max": 1.5},
        {**base_payload, "execute_amount_min": 5_000_000, "execute_amount_max": 1_000_000},
        {**base_payload, "launch_date": "2026-12-31", "expire_date": "2026-07-01"},
        {**base_payload, "extension_yn": "X"},
        {**base_payload, "amount_limit": -1},
    ]

    for payload in invalid_payloads:
        with pytest.raises(ValidationError):
            MoneybankProductWriteRequest(**payload)


def test_preferences_prizm_config_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.preferences.repository import (
        PrizmConfigCounts,
        PrizmConfigItem,
        PrizmConfigListResponse,
        PrizmConfigUpdateRecord,
        PrizmConfigUpdateRecordResponse,
        PrizmConfigUpdateResponse,
    )

    item = PrizmConfigItem(
        row_no=1,
        division=1,
        division_label="Prizm",
        subject_no=1,
        subject_name="주제 1",
        item_no=1,
        item_nm="사업기간",
        item_definition="사업자등록 기간",
        item_weight="10",
        item_standard_low1="0",
        item_standard_high1="3",
        item_standard_low2="3",
        item_standard_high2="6",
        item_standard_low3="6",
        item_standard_high3="12",
        item_standard_low4="12",
        item_standard_high4="24",
        item_standard_low5="24",
        item_standard_high5=None,
    )
    record = PrizmConfigUpdateRecord(
        record_id=1,
        division=1,
        subject_no=1,
        item_no=1,
        item_name="사업기간",
        admin_id="admin",
        update_memo="수정",
        before_payload={"item_weight": "9"},
        after_payload={"item_weight": "10"},
        reg_date=datetime(2026, 7, 22, 10, 0, 0),
    )

    def fake_list_items(limit: int, offset: int, **filters) -> PrizmConfigListResponse:
        return PrizmConfigListResponse(
            limit=limit,
            offset=offset,
            counts=PrizmConfigCounts(total_count=1, prizm_count=1, cra_count=0),
            items=[item],
        )

    def fake_get_item(division: int, subject_no: int, item_no: int) -> PrizmConfigItem | None:
        return item if (division, subject_no, item_no) == (1, 1, 1) else None

    def fake_update_item(division: int, subject_no: int, item_no: int, payload) -> PrizmConfigUpdateResponse | None:
        return PrizmConfigUpdateResponse(action="updated", division=division, subject_no=subject_no, item_no=item_no, item=item)

    def fake_list_records(limit: int, offset: int, **filters) -> PrizmConfigUpdateRecordResponse:
        return PrizmConfigUpdateRecordResponse(limit=limit, offset=offset, total=1, items=[record])

    monkeypatch.setattr(preferences, "list_prizm_config_items", fake_list_items)
    monkeypatch.setattr(preferences, "get_prizm_config_item", fake_get_item)
    monkeypatch.setattr(preferences, "update_prizm_config_item", fake_update_item)
    monkeypatch.setattr(preferences, "list_prizm_config_update_records", fake_list_records)

    response = preferences.prizm_config_item_list(limit=10, offset=0, division="all")
    detail = preferences.prizm_config_item_detail(1, 1, 1)
    records = preferences.prizm_config_update_record_list(limit=5, offset=0, division="all")
    result = preferences.prizm_config_item_update(
        1,
        1,
        1,
        preferences.PrizmConfigUpdateRequest(item_definition="사업자등록 기간", item_weight="10"),
    )

    assert response.counts.total_count == 1
    assert detail.item_nm == "사업기간"
    assert records.total == 1
    assert result.action == "updated"


def test_preferences_raw_data_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.preferences.repository import (
        RawDataColumnOption,
        RawDataFormulaItem,
        RawDataFormulaWriteResponse,
        RawDataPreviewResponse,
        RawDataTableOption,
    )

    formula = RawDataFormulaItem(
        raw_data_no=1,
        raw_data_division="05",
        raw_data_id="sales_amount",
        raw_data_shop="sale_order",
        raw_data_title="매출합계",
        raw_data_content="sum(amount)",
        reg_date=datetime(2026, 7, 22, 10, 0, 0),
        update_date=None,
    )

    def fake_tables() -> list[RawDataTableOption]:
        return [RawDataTableOption(table_name="sale_order", table_label="sale_order", table_type="00")]

    def fake_columns(table_name: str) -> list[RawDataColumnOption]:
        return [RawDataColumnOption(column_name="amount", column_label="amount", data_type="bigint")]

    def fake_formulas(**filters) -> list[RawDataFormulaItem]:
        return [formula]

    def fake_create(payload) -> RawDataFormulaWriteResponse:
        return RawDataFormulaWriteResponse(action="created", raw_data_no=1, formula=formula)

    def fake_preview(payload) -> RawDataPreviewResponse:
        return RawDataPreviewResponse(
            table_name=payload.table_name,
            columns=[RawDataColumnOption(column_name="amount", column_label="amount", data_type="bigint")],
            rows=[{"amount": 1000}],
        )

    monkeypatch.setattr(preferences, "list_raw_data_tables", fake_tables)
    monkeypatch.setattr(preferences, "list_raw_data_columns", fake_columns)
    monkeypatch.setattr(preferences, "list_raw_data_formulas", fake_formulas)
    monkeypatch.setattr(preferences, "create_raw_data_formula", fake_create)
    monkeypatch.setattr(preferences, "preview_raw_data", fake_preview)

    tables = preferences.raw_data_tables()
    columns = preferences.raw_data_columns("sale_order")
    formulas = preferences.raw_data_formulas(raw_data_shop="sale_order")
    created = preferences.raw_data_formula_create(
        preferences.RawDataFormulaWriteRequest(
            raw_data_id="sales_amount",
            raw_data_shop="sale_order",
            raw_data_title="매출합계",
            raw_data_content="sum(amount)",
        )
    )
    preview = preferences.raw_data_preview(
        preferences.RawDataPreviewRequest(table_name="sale_order", columns=["amount"], limit=20)
    )

    assert tables[0].table_name == "sale_order"
    assert columns[0].column_name == "amount"
    assert formulas[0].raw_data_no == 1
    assert created.action == "created"
    assert preview.rows[0]["amount"] == 1000


def test_management_member_summary_endpoint_payload(monkeypatch) -> None:
    from cubici_service.management.repository import MemberSummaryMetrics, MemberSummaryResponse

    def fake_get_member_summary(**filters) -> MemberSummaryResponse:
        return MemberSummaryResponse(
            unit=filters["unit"],
            partner_code=filters.get("partner_code"),
            product_code=filters.get("product_code"),
            metrics=MemberSummaryMetrics(
                standard_date=None,
                from_date=None,
                to_date=None,
                cubici_yesterday_count=0,
                cubici_total_count=0,
                moneybank_yesterday_count=0,
                moneybank_total_count=0,
                terminated_yesterday_count=0,
                terminated_total_count=0,
                partner_yesterday_count=0,
                partner_total_count=0,
            ),
            series=[],
        )

    monkeypatch.setattr(management, "get_member_summary", fake_get_member_summary)

    response = management.member_summary(
        unit="day",
        from_date=None,
        to_date=None,
        partner_code="CBCI",
        product_code=None,
    )

    assert response.unit == "day"
    assert response.partner_code == "CBCI"
    assert response.series == []


def test_management_member_summary_options_endpoint_payload(monkeypatch) -> None:
    from cubici_service.management.repository import (
        MemberSummaryOption,
        MemberSummaryOptionsResponse,
    )

    monkeypatch.setattr(
        management,
        "get_member_summary_options",
        lambda: MemberSummaryOptionsResponse(
            partners=[MemberSummaryOption(value="PARTNER-A", label="협력사 A")],
            products=[MemberSummaryOption(value="MP", label="MP")],
        ),
    )

    response = management.member_summary_options()

    assert response.partners[0].value == "PARTNER-A"
    assert response.products[0].value == "MP"


def test_management_cubici_integrated_endpoint_payload(monkeypatch) -> None:
    from cubici_service.management.repository import (
        CubiciIntegratedMetrics,
        CubiciIntegratedResponse,
        CubiciIntegratedSeriesItem,
        IntegratedPeriodMetric,
        MemberSummaryOption,
    )

    value = IntegratedPeriodMetric(today=1, current_month=2, previous_month=3)
    unavailable = IntegratedPeriodMetric(
        today=None,
        current_month=None,
        previous_month=None,
        available=False,
    )

    def fake_get_cubici_integrated_info(**filters) -> CubiciIntegratedResponse:
        return CubiciIntegratedResponse(
            unit=filters["unit"],
            partner_code=filters.get("partner_code"),
            product_code=filters.get("product_code"),
            metrics=CubiciIntegratedMetrics(
                standard_date=None,
                from_date=None,
                to_date=None,
                new_members=value,
                withdrawn_members=value,
                fee_income=value,
                dormant_members=value,
                sales_amount=value,
                sales_quantity=value,
                settlement_amount=value,
                sku_count=value,
                visitor_count=unavailable,
                max_concurrent_users=unavailable,
                average_usage_minutes=unavailable,
                average_shop_count=value,
            ),
            partners=[MemberSummaryOption(value="PARTNER-A", label="협력사 A")],
            products=[MemberSummaryOption(value="MP", label="선정산")],
            channels=[MemberSummaryOption(value="DIRECT", label="큐빅아이")],
            series=[
                CubiciIntegratedSeriesItem(
                    bucket=date(2026, 8, 9),
                    new_member_count=1,
                    withdrawn_member_count=0,
                    cumulative_member_count=10,
                    cubici_average_days=100,
                    moneybank_average_days=50,
                    channel_counts={"DIRECT": 1},
                )
            ],
        )

    monkeypatch.setattr(
        management,
        "get_cubici_integrated_info",
        fake_get_cubici_integrated_info,
    )

    response = management.cubici_integrated_info(
        unit="week",
        from_date=None,
        to_date=None,
        partner_code="PARTNER-A",
        product_code="MP",
    )

    assert response.unit == "week"
    assert response.metrics.new_members.current_month == 2
    assert response.metrics.visitor_count.available is False
    assert response.series[0].channel_counts == {"DIRECT": 1}


def test_management_member_info_endpoint_payload(monkeypatch) -> None:
    from cubici_service.management.repository import MemberInfoCounts, MemberInfoListResponse

    def fake_list_member_info(limit: int, offset: int, **filters) -> MemberInfoListResponse:
        return MemberInfoListResponse(
            limit=limit,
            offset=offset,
            counts=MemberInfoCounts(total_count=0, cubici_count=0, moneybank_count=0),
            items=[],
        )

    monkeypatch.setattr(management, "list_member_info", fake_list_member_info)

    response = management.member_info_list(limit=10, offset=0, use_service="all")

    assert response.limit == 10
    assert response.offset == 0
    assert response.counts.total_count == 0
    assert response.items == []


def test_management_member_payment_endpoint_payload(monkeypatch) -> None:
    from cubici_service.management.repository import (
        MemberPaymentCounts,
        MemberPaymentListResponse,
        MemberPaymentSums,
    )

    def fake_list_member_payments(limit: int, offset: int, **filters) -> MemberPaymentListResponse:
        return MemberPaymentListResponse(
            limit=limit,
            offset=offset,
            counts=MemberPaymentCounts(total_count=0, paid_count=0),
            sums=MemberPaymentSums(amount=0, payment_fee=0, vat=0, profit=0),
            items=[],
        )

    monkeypatch.setattr(management, "list_member_payments", fake_list_member_payments)

    response = management.member_payment_list(limit=10, offset=0, user_type="USER")

    assert response.limit == 10
    assert response.offset == 0
    assert response.counts.total_count == 0
    assert response.sums.amount == 0
    assert response.items == []


def test_management_member_charge_change_endpoint_payload(monkeypatch) -> None:
    from cubici_service.management.repository import (
        MemberChargeChangeCounts,
        MemberChargeChangeListResponse,
        MemberChargeChangeSums,
    )

    def fake_list_member_charge_changes(limit: int, offset: int, **filters) -> MemberChargeChangeListResponse:
        return MemberChargeChangeListResponse(
            limit=limit,
            offset=offset,
            counts=MemberChargeChangeCounts(total_count=0, change_count=0, termination_count=0, refund_pending_count=0),
            sums=MemberChargeChangeSums(add_amount=0, refund_amount=0),
            items=[],
        )

    monkeypatch.setattr(management, "list_member_charge_changes", fake_list_member_charge_changes)

    response = management.member_charge_change_list(limit=10, offset=0, division="all")

    assert response.limit == 10
    assert response.offset == 0
    assert response.counts.total_count == 0
    assert response.sums.refund_amount == 0
    assert response.items == []


def test_management_member_charge_change_refund_actions(monkeypatch) -> None:
    from cubici_service.management.repository import (
        MemberChargeChangeRefundDetail,
        MemberChargeChangeRefundFinishResponse,
    )

    def fake_get_refund_detail(new_seq: int) -> MemberChargeChangeRefundDetail | None:
        return MemberChargeChangeRefundDetail(
            status="RR",
            seq=10,
            new_seq=new_seq,
            user_code="user@example.com",
            rest_date=3,
            user_name="테스트",
            firm_name="테스트회사",
            user_phone="01000000000",
            ex_charge_name="1개월",
            charge_name="해지",
            ex_amount=29000,
            new_amount=0,
            balance=10000,
            expire_date=None,
            refund_amount=5000,
            refund_card=0,
            refund_cash=5000,
            refund_user_name="테스트",
            refund_bank="은행",
            refund_account="123",
            imp_uid="imp",
        )

    def fake_finish_refund(seq: int, new_seq: int) -> MemberChargeChangeRefundFinishResponse | None:
        return MemberChargeChangeRefundFinishResponse(
            seq=seq,
            new_seq=new_seq,
            refund_status="C",
            payment_status="RC",
        )

    monkeypatch.setattr(management, "get_member_charge_change_refund_detail", fake_get_refund_detail)
    monkeypatch.setattr(management, "finish_member_charge_change_refund", fake_finish_refund)

    detail = management.member_charge_change_refund_detail(new_seq=20)
    result = management.member_charge_change_refund_finish(
        new_seq=20,
        request=management.MemberChargeChangeRefundFinishRequest(seq=10),
    )

    assert detail.new_seq == 20
    assert detail.refund_cash == 5000
    assert result.refund_status == "C"
    assert result.payment_status == "RC"


def test_management_member_withdrawal_endpoint_payload(monkeypatch) -> None:
    from cubici_service.management.repository import MemberWithdrawalCounts, MemberWithdrawalListResponse

    def fake_list_member_withdrawals(limit: int, offset: int, **filters) -> MemberWithdrawalListResponse:
        return MemberWithdrawalListResponse(
            limit=limit,
            offset=offset,
            counts=MemberWithdrawalCounts(
                total_count=0,
                terminated_count=0,
                requested_count=0,
                dormant_count=0,
                moneybank_count=0,
                cubici_count=0,
            ),
            items=[],
        )

    monkeypatch.setattr(management, "list_member_withdrawals", fake_list_member_withdrawals)

    response = management.member_withdrawal_list(limit=10, offset=0, status="all")

    assert response.limit == 10
    assert response.offset == 0
    assert response.counts.total_count == 0
    assert response.items == []


def test_management_member_status_detail_endpoint_payload(monkeypatch) -> None:
    from cubici_service.management.repository import MemberStatusDetailResponse, MemberStatusUser

    def fake_get_member_status_detail(user_no: int) -> MemberStatusDetailResponse | None:
        return MemberStatusDetailResponse(
            user=MemberStatusUser(
                user_no=user_no,
                status_label="큐빅아이",
                user_name="테스트",
                user_id="test@example.com",
                phone=None,
                firm_name=None,
                business_no=None,
                biz_setup_date=None,
                biz_type=None,
                sectors=None,
                zip_code=None,
                address=None,
                reg_date=None,
                last_login_date=None,
                partner_code=None,
                shop_count=0,
                moneybank_contract_count=0,
            ),
            shops=[],
            fees=[],
            contracts=[],
            redemption_history=[],
        )

    monkeypatch.setattr(management, "get_member_status_detail", fake_get_member_status_detail)

    response = management.member_status_detail(user_no=10)

    assert response.user.user_no == 10
    assert response.user.status_label == "큐빅아이"
    assert response.contracts == []


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


def test_account_signup_endpoint_payload(monkeypatch) -> None:
    from cubici_service.accounts.repository import (
        AccountAuthResponse,
        AccountAuthUser,
        AccountSignupRequest,
    )

    captured = {}

    def fake_signup_user(payload: AccountSignupRequest) -> AccountAuthResponse:
        captured["payload"] = payload
        return AccountAuthResponse(
            access_token="token",
            expires_in=28800,
            user=AccountAuthUser(
                user_no=76,
                email=payload.email,
                user_type="USER",
                name=payload.name,
                phone=payload.phone,
                biz_num=payload.biz_num,
                biz_name=payload.biz_name,
                partner_code=payload.partner_code,
                last_login_date=None,
            ),
        )

    monkeypatch.setattr(accounts, "signup_user", fake_signup_user)

    response = accounts.account_signup(
        payload=accounts.AccountSignupRequest(
            email="seller@example.com",
            password="test-password",
            name="테스트",
            phone="01012345678",
            biz_num="1234567890",
            biz_name="테스트상점",
        ),
    )

    assert response.user.email == "seller@example.com"
    assert response.token_type == "Bearer"
    assert captured["payload"].biz_num == "1234567890"


def test_account_login_endpoint_payload(monkeypatch) -> None:
    from cubici_service.accounts.repository import (
        AccountAuthResponse,
        AccountAuthUser,
        AccountLoginRequest,
    )

    captured = {}

    def fake_login_user(payload: AccountLoginRequest) -> AccountAuthResponse:
        captured["payload"] = payload
        return AccountAuthResponse(
            access_token="token",
            expires_in=28800,
            user=AccountAuthUser(
                user_no=76,
                email=payload.email,
                user_type="USER",
                name="테스트",
                phone=None,
                biz_num="1234567890",
                biz_name="테스트상점",
                partner_code=None,
                last_login_date=None,
            ),
        )

    monkeypatch.setattr(accounts, "login_user", fake_login_user)

    response = accounts.account_login(
        payload=accounts.AccountLoginRequest(
            email="seller@example.com",
            password="test-password",
        ),
    )

    assert response.user.user_no == 76
    assert captured["payload"].email == "seller@example.com"


def test_account_admin_login_endpoint_payload(monkeypatch) -> None:
    from cubici_service.accounts.repository import (
        AccountAuthResponse,
        AccountAuthUser,
        AccountLoginRequest,
    )

    captured = {}

    def fake_login_admin(payload: AccountLoginRequest) -> AccountAuthResponse:
        captured["payload"] = payload
        return AccountAuthResponse(
            access_token="admin-token",
            expires_in=28800,
            user=AccountAuthUser(
                user_no=2,
                email=payload.email,
                user_type="ADMIN_USER",
                name="관리자",
                phone=None,
                biz_num=None,
                biz_name=None,
            ),
        )

    monkeypatch.setattr(accounts, "login_admin", fake_login_admin)

    response = accounts.account_admin_login(
        payload=accounts.AccountLoginRequest(
            email="master-admin@example.com",
            password="test-password",
        ),
    )

    assert response.user.user_type == "ADMIN_USER"
    assert captured["payload"].email == "master-admin@example.com"


def test_account_me_requires_bearer_token() -> None:
    from fastapi import HTTPException

    try:
        accounts.account_me(authorization=None)
    except HTTPException as exc:
        assert exc.status_code == 401
    else:
        raise AssertionError("expected bearer token rejection")


def test_account_my_dashboard_summary_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.accounts.repository import (
        AccountAuthUser,
        AccountDashboardActivityItem,
        AccountDashboardSummaryResponse,
    )

    def fake_authenticated_user(authorization: str | None) -> AccountAuthUser:
        assert authorization == "Bearer token"
        return AccountAuthUser(
            user_no=76,
            email="seller@example.com",
            user_type="USER",
            name="테스트",
            phone=None,
            biz_num="1234567890",
            biz_name="테스트상점",
        )

    def fake_summary(user_no: int) -> AccountDashboardSummaryResponse:
        assert user_no == 76
        return AccountDashboardSummaryResponse(
            sales_total_amount=1_250_000,
            settlement_total_amount=980_000,
            moneybank_available_balance=300_000,
            total_principal_amount=500_000,
            total_repayment_amount=200_000,
            activities=[
                AccountDashboardActivityItem(
                    occurred_at=datetime(2026, 8, 8, 9, 30),
                    operation_type="PROVISION",
                    amount=500_000,
                    outstanding_balance=300_000,
                )
            ],
        )

    monkeypatch.setattr(accounts, "_authenticated_user", fake_authenticated_user)
    monkeypatch.setattr(accounts, "get_dashboard_summary_for_user", fake_summary)

    response = accounts.account_my_dashboard_summary(authorization="Bearer token")

    assert response.sales_total_amount == 1_250_000
    assert response.moneybank_available_balance == 300_000
    assert response.activities[0].operation_type == "PROVISION"


def test_account_my_shops_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.accounts.repository import (
        AccountAuthUser,
        ShopAccountItem,
        ShopAccountListResponse,
    )

    def fake_authenticated_user(authorization: str | None) -> AccountAuthUser:
        assert authorization == "Bearer token"
        return AccountAuthUser(
            user_no=76,
            email="seller@example.com",
            user_type="USER",
            name="테스트",
            phone=None,
            biz_num="1234567890",
            biz_name="테스트상점",
            partner_code=None,
            last_login_date=None,
        )

    def fake_list_shop_accounts_for_user(user_no: int) -> ShopAccountListResponse:
        assert user_no == 76
        return ShopAccountListResponse(
            total=1,
            items=[
                ShopAccountItem(
                    id=1,
                    user_no=user_no,
                    shop_type="NAVER",
                    shop_id="seller01",
                    shop_account_id="seller-login",
                    vendor_id=None,
                    settlement=None,
                    status="Y",
                    del_yn="N",
                    reg_date=datetime(2026, 7, 23, 15, 0, 0),
                    modified_date=None,
                )
            ],
        )

    monkeypatch.setattr(accounts, "_authenticated_user", fake_authenticated_user)
    monkeypatch.setattr(accounts, "list_shop_accounts_for_user", fake_list_shop_accounts_for_user)

    response = accounts.account_my_shops(authorization="Bearer token")

    assert response.total == 1
    assert response.items[0].shop_type == "NAVER"


def test_account_my_shop_create_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.accounts.repository import (
        AccountAuthUser,
        ShopAccountCreateRequest,
        ShopAccountCreateResponse,
        ShopAccountItem,
    )

    captured = {}

    def fake_authenticated_user(authorization: str | None) -> AccountAuthUser:
        assert authorization == "Bearer token"
        return AccountAuthUser(
            user_no=76,
            email="seller@example.com",
            user_type="USER",
            name="테스트",
            phone=None,
            biz_num="1234567890",
            biz_name="테스트상점",
            partner_code=None,
            last_login_date=None,
        )

    def fake_create_shop_account_for_user(
        user_no: int,
        payload: ShopAccountCreateRequest,
    ) -> ShopAccountCreateResponse:
        captured["user_no"] = user_no
        captured["payload"] = payload
        return ShopAccountCreateResponse(
            created=True,
            item=ShopAccountItem(
                id=1,
                user_no=user_no,
                shop_type=payload.shop_type,
                shop_id=payload.shop_id,
                shop_account_id=payload.shop_account_id,
                vendor_id=payload.vendor_id,
                settlement=payload.settlement,
                status="Y",
                del_yn="N",
                reg_date=datetime(2026, 7, 23, 15, 0, 0),
                modified_date=None,
            ),
        )

    monkeypatch.setattr(accounts, "_authenticated_user", fake_authenticated_user)
    monkeypatch.setattr(accounts, "create_shop_account_for_user", fake_create_shop_account_for_user)

    response = accounts.account_my_shop_create(
        payload=accounts.ShopAccountCreateRequest(
            shop_type="NAVER",
            shop_id="seller01",
            shop_account_id="seller-login",
        ),
        authorization="Bearer token",
    )

    assert response.created is True
    assert captured["user_no"] == 76
    assert captured["payload"].shop_id == "seller01"


def test_account_my_company_update_endpoint_payload(monkeypatch) -> None:
    from cubici_service.accounts.repository import (
        AccountAuthUser,
        AccountCompanyUpdateRequest,
        AccountCompanyUpdateResponse,
    )

    captured = {}

    def fake_authenticated_user(authorization: str | None) -> AccountAuthUser:
        assert authorization == "Bearer token"
        return AccountAuthUser(
            user_no=76,
            email="seller@example.com",
            user_type="USER",
            name="테스트",
            phone=None,
            biz_num="1234567890",
            biz_name="테스트상점",
        )

    def fake_update_company_for_user(
        user_no: int,
        payload: AccountCompanyUpdateRequest,
    ) -> AccountCompanyUpdateResponse:
        captured["user_no"] = user_no
        captured["payload"] = payload
        return AccountCompanyUpdateResponse(
            updated=True,
            user=AccountAuthUser(
                user_no=user_no,
                email="seller@example.com",
                user_type="USER",
                name=payload.name,
                phone=payload.phone,
                biz_num=payload.biz_num,
                biz_name=payload.biz_name,
                biz_setup_date=payload.biz_setup_date,
                biz_type=payload.biz_type,
                sectors=payload.sectors,
                partner_code=payload.partner_code,
            ),
        )

    monkeypatch.setattr(accounts, "_authenticated_user", fake_authenticated_user)
    monkeypatch.setattr(accounts, "update_company_for_user", fake_update_company_for_user)

    response = accounts.account_my_company_update(
        payload=accounts.AccountCompanyUpdateRequest(
            name="수정 대표",
            phone="01099998888",
            biz_num="1234567890",
            biz_name="수정 상점",
            biz_setup_date="20200101",
            biz_type="GENERAL",
            sectors="FOOD",
        ),
        authorization="Bearer token",
    )

    assert response.updated is True
    assert response.user.biz_name == "수정 상점"
    assert captured["user_no"] == 76
    assert captured["payload"].sectors == "FOOD"


def test_account_my_shop_update_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.accounts.repository import (
        AccountAuthUser,
        ShopAccountItem,
        ShopAccountUpdateRequest,
        ShopAccountWriteResponse,
    )

    captured = {}

    def fake_authenticated_user(authorization: str | None) -> AccountAuthUser:
        assert authorization == "Bearer token"
        return AccountAuthUser(
            user_no=76,
            email="seller@example.com",
            user_type="USER",
            name="테스트",
            phone=None,
            biz_num="1234567890",
            biz_name="테스트상점",
        )

    def fake_update_shop_account_for_user(
        user_no: int,
        account_id: int,
        payload: ShopAccountUpdateRequest,
    ) -> ShopAccountWriteResponse:
        captured["user_no"] = user_no
        captured["account_id"] = account_id
        captured["payload"] = payload
        return ShopAccountWriteResponse(
            action="updated",
            item=ShopAccountItem(
                id=account_id,
                user_no=user_no,
                shop_type=payload.shop_type,
                shop_id=payload.shop_id,
                shop_account_id=payload.shop_account_id,
                vendor_id=payload.vendor_id,
                settlement=payload.settlement,
                status=payload.status,
                del_yn="N",
                reg_date=datetime(2026, 7, 23, 15, 0, 0),
                modified_date=datetime(2026, 7, 26, 10, 0, 0),
            ),
        )

    monkeypatch.setattr(accounts, "_authenticated_user", fake_authenticated_user)
    monkeypatch.setattr(accounts, "update_shop_account_for_user", fake_update_shop_account_for_user)

    response = accounts.account_my_shop_update(
        account_id=12,
        payload=accounts.ShopAccountUpdateRequest(
            shop_type="NAVER",
            shop_id="seller02",
            shop_account_id="seller-login-2",
            status="N",
        ),
        authorization="Bearer token",
    )

    assert response.action == "updated"
    assert response.item.status == "N"
    assert captured["user_no"] == 76
    assert captured["account_id"] == 12
    assert captured["payload"].shop_id == "seller02"


def test_account_my_shop_delete_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.accounts.repository import (
        AccountAuthUser,
        ShopAccountItem,
        ShopAccountWriteResponse,
    )

    captured = {}

    def fake_authenticated_user(authorization: str | None) -> AccountAuthUser:
        assert authorization == "Bearer token"
        return AccountAuthUser(
            user_no=76,
            email="seller@example.com",
            user_type="USER",
            name="테스트",
            phone=None,
            biz_num="1234567890",
            biz_name="테스트상점",
        )

    def fake_delete_shop_account_for_user(user_no: int, account_id: int) -> ShopAccountWriteResponse:
        captured["user_no"] = user_no
        captured["account_id"] = account_id
        return ShopAccountWriteResponse(
            action="deleted",
            item=ShopAccountItem(
                id=account_id,
                user_no=user_no,
                shop_type="NAVER",
                shop_id="seller01",
                shop_account_id="seller-login",
                vendor_id=None,
                settlement=None,
                status="N",
                del_yn="Y",
                reg_date=datetime(2026, 7, 23, 15, 0, 0),
                modified_date=datetime(2026, 7, 26, 10, 0, 0),
            ),
        )

    monkeypatch.setattr(accounts, "_authenticated_user", fake_authenticated_user)
    monkeypatch.setattr(accounts, "delete_shop_account_for_user", fake_delete_shop_account_for_user)

    response = accounts.account_my_shop_delete(account_id=12, authorization="Bearer token")

    assert response.action == "deleted"
    assert response.item.del_yn == "Y"
    assert captured == {"user_no": 76, "account_id": 12}


def test_risk_results_endpoint_payload(monkeypatch) -> None:
    from cubici_service.risk_results.repository import RiskResultCounts, RiskResultListResponse

    def fake_list_risk_results(limit: int, offset: int, **filters) -> RiskResultListResponse:
        return RiskResultListResponse(
            limit=limit,
            offset=offset,
            total=1,
            counts=RiskResultCounts(
                total_count=1,
                pcs_count=1,
                pms_count=1,
                linked_count=1,
                incomplete_count=0,
                source_status_label="PCS/PMS 연결",
                policy_status_label="조회 재현",
            ),
            items=[],
        )

    monkeypatch.setattr(risk_results, "list_risk_results", fake_list_risk_results)

    response = risk_results.risk_result_list(limit=10, offset=0, mbid="MPK")

    assert response.limit == 10
    assert response.offset == 0
    assert response.total == 1
    assert response.counts.source_status_label == "PCS/PMS 연결"
    assert response.counts.policy_status_label == "조회 재현"
    assert response.items == []


def test_management_overview_endpoint_payload(monkeypatch) -> None:
    from datetime import date

    from cubici_service.management.repository import (
        ManagementOverviewResponse,
        ManagementOverviewSeriesItem,
        ManagementOverviewSummary,
    )

    def fake_get_management_overview(**filters) -> ManagementOverviewResponse:
        return ManagementOverviewResponse(
            unit=filters["unit"],
            summary=ManagementOverviewSummary(
                standard_date=date(2024, 1, 1),
                from_date=date(2023, 12, 1),
                to_date=date(2024, 1, 1),
                contract_total_count=0,
                contract_today_count=0,
                review_today_count=0,
                approved_today_count=0,
                terminated_today_count=0,
                active_contract_count=0,
                terminated_contract_count=0,
                provision_today_amount=0,
                provision_total_amount=0,
                provision_total_count=0,
                repayment_today_amount=0,
                repayment_total_amount=0,
                repayment_total_count=0,
                repayment_fee_total_amount=0,
                outstanding_balance_amount=0,
                outstanding_balance_count=0,
                settlement_total_amount=0,
                settlement_total_count=0,
            ),
            series=[
                ManagementOverviewSeriesItem(
                    bucket=date(2024, 1, 1),
                    contract_count=0,
                    review_count=0,
                    approved_count=0,
                    terminated_count=0,
                    request_amount=0,
                    review_amount=0,
                    approved_amount=0,
                    provision_amount=0,
                    provision_count=0,
                    repayment_amount=0,
                    repayment_fee=0,
                    settlement_amount=0,
                    outstanding_balance=0,
                )
            ],
            warnings=[],
        )

    monkeypatch.setattr(management, "get_management_overview", fake_get_management_overview)

    response = management.management_overview(unit="week")

    assert response.unit == "week"
    assert response.summary.standard_date == date(2024, 1, 1)
    assert response.summary.repayment_fee_total_amount == 0
    assert len(response.series) == 1


def test_management_usage_endpoint_payload(monkeypatch) -> None:
    from cubici_service.management.repository import (
        ManagementUsageCounts,
        ManagementUsageListResponse,
        ManagementUsageSums,
    )

    captured = {}

    def fake_list_management_usage(limit: int, offset: int, **filters) -> ManagementUsageListResponse:
        captured.update(filters)
        return ManagementUsageListResponse(
            limit=limit,
            offset=offset,
            total=0,
            counts=ManagementUsageCounts(
                total=0,
                request_count=0,
                review_count=0,
                rejected_count=0,
                repayment_count=0,
                expired_count=0,
            ),
            sums=ManagementUsageSums(
                sales_amount=0,
                provision_amount=0,
                repayment_amount=0,
                outstanding_balance=0,
            ),
            items=[],
        )

    monkeypatch.setattr(management, "list_management_usage", fake_list_management_usage)

    response = management.management_usage_list(
        limit=10,
        offset=0,
        user_name="홍길동",
        firm_name="상점",
        user_email="owner@example.com",
        status="repayment",
        order_by="request_date_asc",
    )

    assert response.limit == 10
    assert response.offset == 0
    assert response.total == 0
    assert captured["user_name"] == "홍길동"
    assert captured["firm_name"] == "상점"
    assert captured["user_email"] == "owner@example.com"
    assert captured["status"] == "repayment"
    assert captured["order_by"] == "request_date_asc"


def test_management_usage_detail_endpoint_payload(monkeypatch) -> None:
    from cubici_service.management.repository import (
        ManagementUsageDetailResponse,
        ManagementUsageListItem,
        ManagementUsageUserDetail,
    )

    def fake_get_management_usage_detail(mbid: str) -> ManagementUsageDetailResponse:
        return ManagementUsageDetailResponse(
            mbid=mbid,
            usage=ManagementUsageListItem(
                mbid=mbid,
                status="CONTRACT",
                usage_status="상환",
                request_date=None,
                contract_date=None,
                expire_date=None,
                user_no=1,
                user_email="owner@example.com",
                user_name="홍길동",
                firm_name="상점",
                product_code="MP",
                fintech_name=None,
                fee_rate=None,
                payment_rate=None,
                sales_amount=None,
                provision_amount=0,
                repayment_amount=0,
                outstanding_balance=0,
                prizm_grade=None,
                prizm_score=None,
            ),
            user=ManagementUsageUserDetail(
                user_no=1,
                user_email="owner@example.com",
                user_name="홍길동",
                phone=None,
                firm_name="상점",
                biz_num=None,
                biz_setup_date=None,
                biz_type=None,
                sectors=None,
                zip_code=None,
                address=None,
                user_reg_date=None,
            ),
            shops=[],
            document=None,
            contract_history=[],
            redemption_history=[],
        )

    monkeypatch.setattr(management, "get_management_usage_detail", fake_get_management_usage_detail)

    response = management.management_usage_detail(mbid="MPKTEST001")

    assert response.mbid == "MPKTEST001"
    assert response.usage.usage_status == "상환"


def test_support_inquiries_endpoint_payload(monkeypatch) -> None:
    from cubici_service.support.repository import InquiryListResponse

    captured = {}

    def fake_list_inquiries(limit: int, offset: int, **filters) -> InquiryListResponse:
        captured.update(filters)
        return InquiryListResponse(
            limit=limit,
            offset=offset,
            total=0,
            answered_count=0,
            waiting_count=0,
            items=[],
        )

    monkeypatch.setattr(support, "list_inquiries", fake_list_inquiries)

    response = support.inquiry_list(
        limit=10,
        offset=0,
        keyword="문의",
        inquiry_type="CUBICI",
        answer_status="waiting",
        user_no=36,
        order_by="reg_date_asc",
    )

    assert response.limit == 10
    assert response.offset == 0
    assert response.total == 0
    assert captured["keyword"] == "문의"
    assert captured["inquiry_type"] == "CUBICI"
    assert captured["answer_status"] == "waiting"
    assert captured["user_no"] == 36
    assert captured["order_by"] == "reg_date_asc"


def test_support_inquiry_detail_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.support.repository import (
        InquiryDetailResponse,
        InquiryListItem,
        InquiryReplyItem,
    )

    captured = {}

    def fake_get_inquiry_detail(qna_id: int, *, user_no: int | None = None) -> InquiryDetailResponse:
        captured["user_no"] = user_no
        return InquiryDetailResponse(
            inquiry=InquiryListItem(
                qna_id=qna_id,
                user_no=36,
                type="CUBICI",
                type_label="큐빅아이",
                title="문의",
                content="<p>내용</p>",
                visibility="0",
                visibility_label="비공개",
                created_by="사용자",
                reg_date=datetime(2026, 1, 1),
                modified_date=None,
                reply_count=1,
                latest_reply_date=datetime(2026, 1, 2),
                answer_status="답변완료",
            ),
            replies=[
                InquiryReplyItem(
                    reply_id=1,
                    user_no=99,
                    content="<p>답변</p>",
                    created_by="admin",
                    last_modified_by=None,
                    reg_date=datetime(2026, 1, 2),
                    modified_date=None,
                )
            ],
        )

    monkeypatch.setattr(support, "get_inquiry_detail", fake_get_inquiry_detail)

    response = support.inquiry_detail(qna_id=1, user_no=36)

    assert response.inquiry.qna_id == 1
    assert captured["user_no"] == 36
    assert response.inquiry.answer_status == "답변완료"
    assert len(response.replies) == 1


def test_support_inquiry_create_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.support.repository import (
        InquiryDetailResponse,
        InquiryListItem,
        InquiryWriteResponse,
    )

    captured = {}

    def fake_create_inquiry(payload: support.InquiryUpsertRequest) -> InquiryWriteResponse:
        captured["payload"] = payload
        return InquiryWriteResponse(
            action="created",
            qna_id=10,
            detail=InquiryDetailResponse(
                inquiry=InquiryListItem(
                    qna_id=10,
                    user_no=payload.user_no,
                    type=payload.type,
                    type_label="큐빅아이",
                    title=payload.title,
                    content=payload.content,
                    visibility="0",
                    visibility_label="비공개",
                    created_by=payload.operated_by,
                    reg_date=datetime(2026, 1, 1),
                    modified_date=None,
                    reply_count=0,
                    latest_reply_date=None,
                    answer_status="답변대기",
                ),
                replies=[],
            ),
        )

    monkeypatch.setattr(support, "create_inquiry", fake_create_inquiry)

    payload = support.InquiryUpsertRequest(
        user_no=36,
        type="MONEYBANK",
        title="문의 생성",
        content="문의 내용",
        visibility="private",
        operated_by="user-web",
    )
    response = support.inquiry_create(payload)

    assert response.action == "created"
    assert response.qna_id == 10
    assert captured["payload"].user_no == 36
    assert captured["payload"].type == "MONEYBANK"


def test_support_inquiry_update_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.support.repository import (
        InquiryDetailResponse,
        InquiryListItem,
        InquiryWriteResponse,
    )

    captured = {}

    def fake_update_inquiry(qna_id: int, payload: support.InquiryUpsertRequest) -> InquiryWriteResponse:
        captured["qna_id"] = qna_id
        captured["payload"] = payload
        return InquiryWriteResponse(
            action="updated",
            qna_id=qna_id,
            detail=InquiryDetailResponse(
                inquiry=InquiryListItem(
                    qna_id=qna_id,
                    user_no=payload.user_no,
                    type=payload.type,
                    type_label="머니뱅크",
                    title=payload.title,
                    content=payload.content,
                    visibility="0",
                    visibility_label="비공개",
                    created_by=payload.operated_by,
                    reg_date=datetime(2026, 1, 1),
                    modified_date=datetime(2026, 1, 2),
                    reply_count=0,
                    latest_reply_date=None,
                    answer_status="답변대기",
                ),
                replies=[],
            ),
        )

    monkeypatch.setattr(support, "update_inquiry", fake_update_inquiry)

    payload = support.InquiryUpsertRequest(
        user_no=36,
        type="MONEYBANK",
        title="문의 수정",
        content="수정 내용",
        visibility="private",
        operated_by="user-web",
    )
    response = support.inquiry_update(qna_id=10, payload=payload)

    assert response.action == "updated"
    assert response.detail is not None
    assert response.detail.inquiry.title == "문의 수정"
    assert captured["qna_id"] == 10
    assert captured["payload"].user_no == 36


def test_support_inquiry_delete_endpoint_payload(monkeypatch) -> None:
    from cubici_service.support.repository import InquiryWriteResponse

    captured = {}

    def fake_delete_inquiry(qna_id: int, *, user_no: int) -> InquiryWriteResponse:
        captured["qna_id"] = qna_id
        captured["user_no"] = user_no
        return InquiryWriteResponse(action="deleted", qna_id=qna_id)

    monkeypatch.setattr(support, "delete_inquiry", fake_delete_inquiry)

    response = support.inquiry_delete(qna_id=10, user_no=36)

    assert response.action == "deleted"
    assert response.detail is None
    assert captured == {"qna_id": 10, "user_no": 36}


def test_support_inquiry_reply_create_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.support.repository import (
        InquiryDetailResponse,
        InquiryListItem,
        InquiryReplyUpsertRequest,
        InquiryReplyWriteResponse,
    )

    captured = {}

    def fake_create_inquiry_reply(qna_id: int, payload: InquiryReplyUpsertRequest) -> InquiryReplyWriteResponse:
        captured["qna_id"] = qna_id
        captured["payload"] = payload
        inquiry = InquiryListItem(
            qna_id=qna_id,
            user_no=36,
            type="CUBICI",
            type_label="큐빅아이",
            title="문의",
            content="<p>내용</p>",
            visibility="0",
            visibility_label="비공개",
            created_by="사용자",
            reg_date=datetime(2026, 1, 1),
            modified_date=None,
            reply_count=1,
            latest_reply_date=datetime(2026, 1, 2),
            answer_status="답변완료",
        )
        return InquiryReplyWriteResponse(
            qna_id=qna_id,
            reply_id=10,
            action="created",
            detail=InquiryDetailResponse(inquiry=inquiry, replies=[]),
        )

    monkeypatch.setattr(support, "create_inquiry_reply", fake_create_inquiry_reply)

    response = support.inquiry_reply_create(
        qna_id=1,
        payload=support.InquiryReplyUpsertRequest(
            content="<p>답변</p>",
            user_no=99,
            operated_by="admin",
        ),
    )

    assert response.action == "created"
    assert response.reply_id == 10
    assert captured["qna_id"] == 1
    assert captured["payload"].operated_by == "admin"


def test_support_inquiry_reply_update_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.support.repository import (
        InquiryDetailResponse,
        InquiryListItem,
        InquiryReplyUpsertRequest,
        InquiryReplyWriteResponse,
    )

    captured = {}

    def fake_update_inquiry_reply(
        qna_id: int,
        reply_id: int,
        payload: InquiryReplyUpsertRequest,
    ) -> InquiryReplyWriteResponse:
        captured["qna_id"] = qna_id
        captured["reply_id"] = reply_id
        captured["payload"] = payload
        inquiry = InquiryListItem(
            qna_id=qna_id,
            user_no=36,
            type="CUBICI",
            type_label="큐빅아이",
            title="문의",
            content="<p>내용</p>",
            visibility="0",
            visibility_label="비공개",
            created_by="사용자",
            reg_date=datetime(2026, 1, 1),
            modified_date=None,
            reply_count=1,
            latest_reply_date=datetime(2026, 1, 2),
            answer_status="답변완료",
        )
        return InquiryReplyWriteResponse(
            qna_id=qna_id,
            reply_id=reply_id,
            action="updated",
            detail=InquiryDetailResponse(inquiry=inquiry, replies=[]),
        )

    monkeypatch.setattr(support, "update_inquiry_reply", fake_update_inquiry_reply)

    response = support.inquiry_reply_update(
        qna_id=1,
        reply_id=10,
        payload=support.InquiryReplyUpsertRequest(
            content="<p>수정</p>",
            user_no=99,
            operated_by="admin",
        ),
    )

    assert response.action == "updated"
    assert response.reply_id == 10
    assert captured["reply_id"] == 10
    assert captured["payload"].content == "<p>수정</p>"


def test_support_message_template_list_endpoint_payload(monkeypatch) -> None:
    from cubici_service.support.repository import MessageTemplateListResponse

    captured = {}

    def fake_list_message_templates(limit: int, offset: int, **filters) -> MessageTemplateListResponse:
        captured.update(filters)
        return MessageTemplateListResponse(
            limit=limit,
            offset=offset,
            total=0,
            sms_count=0,
            email_count=0,
            items=[],
        )

    monkeypatch.setattr(support, "list_message_templates", fake_list_message_templates)

    response = support.message_template_list(
        limit=10,
        offset=0,
        msg_key="00",
        keyword="인증",
        order_by="menu_asc",
    )

    assert response.limit == 10
    assert response.total == 0
    assert captured["msg_key"] == "00"
    assert captured["keyword"] == "인증"
    assert captured["order_by"] == "menu_asc"


def test_support_message_template_write_endpoint_payload(monkeypatch) -> None:
    from cubici_service.support.repository import (
        MessageTemplateUpsertRequest,
        MessageTemplateWriteResponse,
    )

    captured = {}

    def fake_create_message_template(payload: MessageTemplateUpsertRequest) -> MessageTemplateWriteResponse:
        captured["create"] = payload
        return MessageTemplateWriteResponse(action="created", message_no=10, template=None)

    def fake_update_message_template(
        message_no: int,
        payload: MessageTemplateUpsertRequest,
    ) -> MessageTemplateWriteResponse:
        captured["update_message_no"] = message_no
        captured["update"] = payload
        return MessageTemplateWriteResponse(action="updated", message_no=message_no, template=None)

    def fake_delete_message_template(message_no: int) -> MessageTemplateWriteResponse:
        captured["delete_message_no"] = message_no
        return MessageTemplateWriteResponse(action="deleted", message_no=message_no, template=None)

    monkeypatch.setattr(support, "create_message_template", fake_create_message_template)
    monkeypatch.setattr(support, "update_message_template", fake_update_message_template)
    monkeypatch.setattr(support, "delete_message_template", fake_delete_message_template)

    payload = support.MessageTemplateUpsertRequest(
        msg_key="00",
        msg_code="91",
        msg_menu="CB",
        msg_division="SU",
        msg_item="테스트",
        msg_title="테스트 제목",
        msg_content="테스트 내용",
        reg_user="admin",
    )

    created = support.message_template_create(payload)
    updated = support.message_template_update(message_no=10, payload=payload)
    deleted = support.message_template_delete(message_no=10)

    assert created.action == "created"
    assert updated.action == "updated"
    assert deleted.action == "deleted"
    assert captured["create"].msg_code == "91"
    assert captured["update_message_no"] == 10
    assert captured["delete_message_no"] == 10


def test_support_board_post_list_endpoint_payload(monkeypatch) -> None:
    from cubici_service.support.repository import BoardPostListResponse

    captured = {}

    def fake_list_board_posts(board_kind: str, limit: int, offset: int, **filters) -> BoardPostListResponse:
        captured["board_kind"] = board_kind
        captured.update(filters)
        return BoardPostListResponse(
            board_kind=board_kind,
            limit=limit,
            offset=offset,
            total=0,
            items=[],
        )

    monkeypatch.setattr(support, "list_board_posts", fake_list_board_posts)

    response = support.board_post_list(
        board_kind="notice",
        limit=10,
        offset=0,
        keyword="공지",
        post_type="CUBICI",
        order_by="reg_date_asc",
    )

    assert response.board_kind == "notice"
    assert response.limit == 10
    assert captured["keyword"] == "공지"
    assert captured["post_type"] == "CUBICI"
    assert captured["order_by"] == "reg_date_asc"


def test_support_board_post_write_endpoint_payload(monkeypatch) -> None:
    from cubici_service.support.repository import (
        BoardPostUpsertRequest,
        BoardPostWriteResponse,
    )

    captured = {}

    def fake_create_board_post(board_kind: str, payload: BoardPostUpsertRequest) -> BoardPostWriteResponse:
        captured["create_kind"] = board_kind
        captured["create"] = payload
        return BoardPostWriteResponse(action="created", board_kind=board_kind, post_id=10, post=None)

    def fake_update_board_post(
        board_kind: str,
        post_id: int,
        payload: BoardPostUpsertRequest,
    ) -> BoardPostWriteResponse:
        captured["update_kind"] = board_kind
        captured["update_post_id"] = post_id
        captured["update"] = payload
        return BoardPostWriteResponse(action="updated", board_kind=board_kind, post_id=post_id, post=None)

    def fake_delete_board_post(board_kind: str, post_id: int) -> BoardPostWriteResponse:
        captured["delete_kind"] = board_kind
        captured["delete_post_id"] = post_id
        return BoardPostWriteResponse(action="deleted", board_kind=board_kind, post_id=post_id, post=None)

    monkeypatch.setattr(support, "create_board_post", fake_create_board_post)
    monkeypatch.setattr(support, "update_board_post", fake_update_board_post)
    monkeypatch.setattr(support, "delete_board_post", fake_delete_board_post)

    payload = support.BoardPostUpsertRequest(
        type="CUBICI",
        title="공지",
        content="내용",
        user_id=2,
        operated_by="admin",
    )

    created = support.board_post_create(board_kind="notice", payload=payload)
    updated = support.board_post_update(board_kind="notice", post_id=10, payload=payload)
    deleted = support.board_post_delete(board_kind="notice", post_id=10)

    assert created.action == "created"
    assert updated.action == "updated"
    assert deleted.action == "deleted"
    assert captured["create_kind"] == "notice"
    assert captured["update_post_id"] == 10
    assert captured["delete_post_id"] == 10


def test_redemptions_endpoint_payload(monkeypatch) -> None:
    from cubici_service.redemptions.repository import RedemptionListResponse

    captured = {}

    def fake_list_redemptions(
        limit: int,
        offset: int,
        *,
        user_no=None,
        mbid=None,
        user_name=None,
        firm_name=None,
        product_code=None,
        contract_stage=None,
        outstanding_only=False,
        from_date=None,
        to_date=None,
        order_by="date_desc",
    ) -> RedemptionListResponse:
        captured["user_no"] = user_no
        captured["mbid"] = mbid
        captured["user_name"] = user_name
        captured["firm_name"] = firm_name
        captured["product_code"] = product_code
        captured["contract_stage"] = contract_stage
        captured["order_by"] = order_by
        return RedemptionListResponse(limit=limit, offset=offset, total=0, items=[])

    monkeypatch.setattr(redemptions, "list_redemptions", fake_list_redemptions)

    response = redemptions.redemption_list(
        limit=10,
        offset=0,
        user_no=72,
        mbid="MPK",
        user_name="홍길동",
        firm_name="테스트상사",
        product_code="MP",
        contract_stage="active",
        order_by="outstanding_desc",
    )

    assert response.limit == 10
    assert response.offset == 0
    assert response.total == 0
    assert response.items == []
    assert captured["user_no"] == 72
    assert captured["mbid"] == "MPK"
    assert captured["user_name"] == "홍길동"
    assert captured["firm_name"] == "테스트상사"
    assert captured["product_code"] == "MP"
    assert captured["contract_stage"] == "active"
    assert captured["order_by"] == "outstanding_desc"


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
        user_no=72,
        user_id="owner@example.com",
        user_name="홍길동",
        firm_name="상점",
        status="REQUEST",
        product_code="HELLOPAY",
        min_sales_amount=1000,
        max_sales_amount=2000,
        order_by="sales_amount_desc",
        request_scope=True,
        request_stage="progress",
        approval_scope=True,
        approval_stage="wait",
        contract_scope=True,
        contract_stage="contract",
    )

    assert response.limit == 10
    assert response.offset == 0
    assert response.total == 0
    assert response.items == []
    assert captured["status"] == "REQUEST"
    assert captured["user_no"] == 72
    assert captured["user_id"] == "owner@example.com"
    assert captured["user_name"] == "홍길동"
    assert captured["firm_name"] == "상점"
    assert captured["product_code"] == "HELLOPAY"
    assert captured["min_sales_amount"] == 1000
    assert captured["max_sales_amount"] == 2000
    assert captured["order_by"] == "sales_amount_desc"
    assert captured["request_scope"] is True
    assert captured["request_stage"] == "progress"
    assert captured["approval_scope"] is True
    assert captured["approval_stage"] == "wait"
    assert captured["contract_scope"] is True
    assert captured["contract_stage"] == "contract"


def test_contract_detail_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.contracts.repository import (
        ContractDetailResponse,
        ContractListItem,
    )

    captured = {}

    def fake_get_contract_detail(mbid: str, *, user_no=None) -> ContractDetailResponse:
        captured["user_no"] = user_no
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

    response = contracts.contract_detail(mbid="TEST", user_no=72)

    assert response.contract.mbid == "TEST"
    assert response.shops == []
    assert response.fees == []
    assert captured["user_no"] == 72


def test_contract_request_create_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.contracts.repository import (
        ContractRequestCreateRequest,
        ContractRequestCreateResponse,
    )

    captured = {}

    def fake_create_contract_request(
        payload: ContractRequestCreateRequest,
    ) -> ContractRequestCreateResponse:
        captured["payload"] = payload
        return ContractRequestCreateResponse(
            insert_code=0,
            message="신청 되었습니다!",
            mbid="MPG2326124",
            user_no=payload.user_no,
            product_code=payload.product_code,
            status="REQUEST",
            request_date=datetime(2026, 7, 23, 14, 30, 0),
            shop_count=len(payload.request_shop_types),
            requested_shop_types=payload.request_shop_types,
        )

    monkeypatch.setattr(contracts, "create_contract_request", fake_create_contract_request)

    response = contracts.contract_request_create(
        payload=contracts.ContractRequestCreateRequest(
            user_no=72,
            request_shop_types=["NAVER", "COUPANG"],
            sales_amount=1000,
            identity_confirmed=True,
            identity_verification_method="id_card",
            identity_verification_status="mock_verified",
            identity_verification_reference="MOCK-ID-800101-1234",
            terms_agreed=True,
            submitted_document_types=["regNo", "CBInfo"],
            requested_by="user-web-test",
        ),
    )

    assert response.insert_code == 0
    assert response.mbid == "MPG2326124"
    assert response.status == "REQUEST"
    assert captured["payload"].user_no == 72
    assert captured["payload"].request_shop_types == ["NAVER", "COUPANG"]
    assert captured["payload"].identity_confirmed is True
    assert captured["payload"].identity_verification_status == "mock_verified"
    assert captured["payload"].terms_agreed is True
    assert captured["payload"].submitted_document_types == ["regNo", "CBInfo"]


def test_contract_request_policy_rejects_missing_confirmations() -> None:
    from fastapi import HTTPException

    from cubici_service.contracts.repository import (
        ContractRequestCreateRequest,
        _validate_contract_request_policy,
    )

    payload = ContractRequestCreateRequest(
        user_no=1,
        request_shop_types=["NAVER"],
        submitted_document_types=["regNo"],
    )

    try:
        _validate_contract_request_policy(payload)
    except HTTPException as exc:
        assert exc.status_code == 422
        assert "identity_confirmed" in exc.detail
        assert "terms_agreed" in exc.detail
        assert "required_documents:CBInfo" in exc.detail
    else:
        raise AssertionError("expected policy rejection")


def test_contract_request_policy_accepts_confirmed_request() -> None:
    from cubici_service.contracts.repository import (
        ContractRequestCreateRequest,
        _validate_contract_request_policy,
    )

    payload = ContractRequestCreateRequest(
        user_no=1,
        request_shop_types=["NAVER"],
        identity_confirmed=True,
        identity_verification_method="id_card",
        identity_verification_status="mock_verified",
        identity_verification_reference="MOCK-ID-800101-1234",
        terms_agreed=True,
        submitted_document_types=["regNo", "CBInfo"],
    )

    _validate_contract_request_policy(payload)


def test_contract_request_eligibility_rejects_legacy_conditions() -> None:
    from fastapi import HTTPException

    from cubici_service.contracts.repository import (
        ContractRequestCreateRequest,
        _validate_contract_request_eligibility,
    )

    payload = ContractRequestCreateRequest(
        user_no=1,
        request_shop_types=["NAVER"],
        representative_age=19,
        identity_confirmed=True,
        identity_verification_method="id_card",
        identity_verification_status="mock_verified",
        identity_verification_reference="MOCK-ID-800101-1234",
        terms_agreed=True,
        submitted_document_types=["regNo", "CBInfo"],
    )
    user = {
        "user_type": "USER",
        "biz_num": "1234567890",
        "biz_setup_date": "20260101",
        "biz_type": "CORPORATE",
        "sectors": "13",
    }

    try:
        _validate_contract_request_eligibility(user, payload)
    except HTTPException as exc:
        assert exc.status_code == 422
        assert "business_period_1y" in exc.detail
        assert "individual_business" in exc.detail
        assert "business_sector" in exc.detail
        assert "representative_age_20" in exc.detail
    else:
        raise AssertionError("expected eligibility rejection")


def test_contract_request_eligibility_accepts_mapped_individual_user() -> None:
    from cubici_service.contracts.repository import (
        ContractRequestCreateRequest,
        _validate_contract_request_eligibility,
    )

    payload = ContractRequestCreateRequest(
        user_no=1,
        request_shop_types=["NAVER"],
        representative_age=20,
        identity_confirmed=True,
        identity_verification_method="id_card",
        identity_verification_status="mock_verified",
        identity_verification_reference="MOCK-ID-800101-1234",
        terms_agreed=True,
        submitted_document_types=["regNo", "CBInfo"],
    )
    user = {
        "user_type": "USER",
        "biz_num": "1234567890",
        "biz_setup_date": "20190101",
        "biz_type": "GENERAL",
        "sectors": "FOOD",
    }

    _validate_contract_request_eligibility(user, payload)


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
            new_status="PENDING_REVIEW",
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
    assert response.new_status == "PENDING_REVIEW"
    assert captured["payload"].action == "approve"


def test_contract_electronic_signature_endpoint_payload(monkeypatch) -> None:
    from datetime import datetime

    from cubici_service.contracts.repository import (
        ContractElectronicSignatureRequest,
        ContractElectronicSignatureResponse,
    )

    captured = {}

    def fake_sign_contract_electronically(
        mbid: str,
        payload: ContractElectronicSignatureRequest,
    ) -> ContractElectronicSignatureResponse:
        captured["mbid"] = mbid
        captured["payload"] = payload
        signed_at = datetime(2026, 7, 26, 12, 0, 0)
        return ContractElectronicSignatureResponse(
            mbid=mbid,
            previous_status="USE_AGREE",
            new_status="ACCOUNT_STANDBY",
            signature_method=payload.signature_method,
            signature_status="signed_mock",
            signature_reference=payload.signature_reference or "MOCK-SIGN-TEST",
            signed_by=payload.signed_by,
            electronic_signed_at=signed_at,
            contract_date=signed_at,
            modified_date=signed_at,
        )

    monkeypatch.setattr(
        contracts,
        "sign_contract_electronically",
        fake_sign_contract_electronically,
    )

    response = contracts.contract_electronic_signature(
        mbid="MPG2626125",
        payload=contracts.ContractElectronicSignatureRequest(
            signed_by="user-web-test",
            signature_method="mock_certificate",
            signature_reference="MOCK-SIGN-TEST",
            reason="endpoint test",
        ),
    )

    assert response.mbid == "MPG2626125"
    assert response.previous_status == "USE_AGREE"
    assert response.new_status == "ACCOUNT_STANDBY"
    assert response.signature_status == "signed_mock"
    assert captured["mbid"] == "MPG2626125"
    assert captured["payload"].signature_reference == "MOCK-SIGN-TEST"


def test_contract_status_document_pending_endpoint_payload(monkeypatch) -> None:
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
            previous_status="REQUEST",
            new_status="PENDING_DOCUMENTS",
            action=payload.action,
            changed_by=payload.changed_by,
            reason=payload.reason,
            approval_date=None,
            cancel_request_date=None,
            modified_date=datetime(2026, 1, 1),
        )

    monkeypatch.setattr(contracts, "update_contract_status", fake_update_contract_status)

    response = contracts.contract_status_update(
        mbid="TEST",
        payload=contracts.ContractStatusUpdateRequest(
            action="document_pending",
            changed_by="user-web",
            reason="upload failed",
        ),
    )

    assert response.mbid == "TEST"
    assert response.previous_status == "REQUEST"
    assert response.new_status == "PENDING_DOCUMENTS"
    assert captured["payload"].action == "document_pending"


def test_contract_status_agree_terms_endpoint_payload(monkeypatch) -> None:
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
            previous_status="CONDITIONS_ACCEPT",
            new_status="USE_AGREE",
            action=payload.action,
            changed_by=payload.changed_by,
            reason=payload.reason,
            approval_date=datetime(2026, 1, 1),
            agree_date=datetime(2026, 1, 2),
            contract_date=None,
            cancel_request_date=None,
            modified_date=datetime(2026, 1, 2),
        )

    monkeypatch.setattr(contracts, "update_contract_status", fake_update_contract_status)

    response = contracts.contract_status_update(
        mbid="TEST",
        payload=contracts.ContractStatusUpdateRequest(
            action="agree_terms",
            changed_by="user-web",
            reason="이용조건 동의",
        ),
    )

    assert response.mbid == "TEST"
    assert response.previous_status == "CONDITIONS_ACCEPT"
    assert response.new_status == "USE_AGREE"
    assert captured["payload"].action == "agree_terms"


def test_document_files_endpoint_payload(monkeypatch) -> None:
    from cubici_service.documents.repository import DocumentFileListResponse

    captured = {}

    def fake_list_contract_document_files(mbid: str, *, user_no=None) -> DocumentFileListResponse:
        captured["user_no"] = user_no
        return DocumentFileListResponse(mbid=mbid, total=0, items=[])

    monkeypatch.setattr(documents, "list_contract_document_files", fake_list_contract_document_files)

    response = documents.contract_document_files(mbid="TEST", user_no=72)

    assert response.mbid == "TEST"
    assert response.total == 0
    assert response.items == []
    assert captured["user_no"] == 72


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

    captured = {}

    def fake_list_settlements(
        limit: int,
        offset: int,
        *,
        shop_pairs=None,
        shop_type=None,
        shop_id=None,
        status=None,
        keyword=None,
        from_date=None,
        to_date=None,
        order_by="date_desc",
    ) -> SettlementListResponse:
        captured["shop_pairs"] = shop_pairs
        captured["shop_type"] = shop_type
        captured["keyword"] = keyword
        captured["order_by"] = order_by
        return SettlementListResponse(limit=limit, offset=offset, total=0, items=[])

    monkeypatch.setattr(settlements, "list_settlements", fake_list_settlements)

    response = settlements.settlement_list(
        limit=10,
        offset=0,
        shop_pairs="NAVER:seller01",
        shop_type="NAVER",
        keyword="bank",
        order_by="amount_desc",
    )

    assert response.limit == 10
    assert response.offset == 0
    assert response.total == 0
    assert response.items == []
    assert captured["shop_pairs"] == "NAVER:seller01"
    assert captured["shop_type"] == "NAVER"
    assert captured["keyword"] == "bank"
    assert captured["order_by"] == "amount_desc"


def test_shop_type_normalizer_maps_legacy_numeric_codes() -> None:
    from cubici_service.core.shop_types import build_shop_pair_clause, normalize_shop_type, normalize_shop_types

    assert normalize_shop_type("14") == "NAVER"
    assert normalize_shop_type("11") == "COUPANG"
    assert normalize_shop_type("4") == "STREET11"
    assert normalize_shop_type("3") == "AUCTION"
    assert normalize_shop_type("2") == "GMARKET"
    assert normalize_shop_type("1") == "INTERPARK"
    assert normalize_shop_type("11st") == "STREET11"
    assert normalize_shop_types(["14", "NAVER", "11"]) == ["NAVER", "COUPANG"]

    clause, params = build_shop_pair_clause("14:seller01,11:seller02")

    assert clause == "((upper(shop_type) = %s and shop_id = %s) or (upper(shop_type) = %s and shop_id = %s))"
    assert params == ["NAVER", "seller01", "COUPANG", "seller02"]


def test_sale_returns_endpoint_payload(monkeypatch) -> None:
    from cubici_service.sales.repository import SaleReturnListResponse

    captured = {}

    def fake_list_sale_returns(
        limit: int,
        offset: int,
        *,
        shop_pairs=None,
        shop_type=None,
        shop_id=None,
        status=None,
        keyword=None,
        from_date=None,
        to_date=None,
    ) -> SaleReturnListResponse:
        captured["shop_pairs"] = shop_pairs
        captured["keyword"] = keyword
        return SaleReturnListResponse(limit=limit, offset=offset, total=0, items=[])

    monkeypatch.setattr(sales, "list_sale_returns", fake_list_sale_returns)

    response = sales.sale_returns(limit=10, offset=0, shop_pairs="NAVER:seller01", keyword="ORDER")

    assert response.limit == 10
    assert response.offset == 0
    assert response.total == 0
    assert response.items == []
    assert captured["shop_pairs"] == "NAVER:seller01"
    assert captured["keyword"] == "ORDER"


def test_sale_orders_endpoint_payload(monkeypatch) -> None:
    from cubici_service.sales.repository import SaleListResponse

    captured = {}

    def fake_list_sales(
        limit: int,
        offset: int,
        *,
        shop_pairs=None,
        shop_type=None,
        shop_id=None,
        status=None,
        keyword=None,
        from_date=None,
        to_date=None,
    ) -> SaleListResponse:
        captured["shop_pairs"] = shop_pairs
        captured["status"] = status
        return SaleListResponse(limit=limit, offset=offset, total=0, items=[])

    monkeypatch.setattr(sales, "list_sales", fake_list_sales)

    response = sales.sale_orders(limit=10, offset=0, shop_pairs="NAVER:seller01", status="PAID")

    assert response.limit == 10
    assert response.offset == 0
    assert response.total == 0
    assert response.items == []
    assert captured["shop_pairs"] == "NAVER:seller01"
    assert captured["status"] == "PAID"


def test_product_analysis_endpoint_payload(monkeypatch) -> None:
    from cubici_service.sales.repository import ProductAnalysisResponse

    captured = {}

    def fake_get_product_analysis(*, shop_pairs=None, shop_type=None, shop_id=None, from_date=None, to_date=None):
        captured.update(
            shop_pairs=shop_pairs,
            shop_type=shop_type,
            from_date=from_date,
            to_date=to_date,
        )
        return ProductAnalysisResponse(shop_breakdown=[], top_products=[])

    monkeypatch.setattr(sales, "get_product_analysis", fake_get_product_analysis)

    response = sales.product_analysis(
        shop_pairs="NAVER:seller01",
        shop_type="NAVER",
        from_date=date(2026, 8, 1),
        to_date=date(2026, 8, 10),
    )

    assert response.shop_breakdown == []
    assert response.top_products == []
    assert captured == {
        "shop_pairs": "NAVER:seller01",
        "shop_type": "NAVER",
        "from_date": date(2026, 8, 1),
        "to_date": date(2026, 8, 10),
    }
