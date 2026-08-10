"""Fintech and Hyphen firm-banking API."""

from datetime import date

from fastapi import APIRouter, HTTPException, Query

from cubici_service.fintech.repository import (
    FintechStatusResponse,
    FundingOrderBy,
    FundingProviderWriteRequest,
    FundingProviderWriteResponse,
    FundingSummaryResponse,
    FirmRequestBinListResponse,
    MockResultInquiryPersistResponse,
    MockResultInquiryRequest,
    MockTransferMessageRequest,
    MockTransferMessageResponse,
    MockTransferPersistResponse,
    MockTransferResponsePersistResponse,
    MockTransferResponseRequest,
    TradeRequestBinDetailResponse,
    TradeRequestBinListResponse,
    TradeResultInquiryListResponse,
    build_mock_transfer_message,
    create_funding_provider,
    fintech_status,
    list_funding_summaries,
    get_trade_request_detail,
    list_firm_requests,
    list_trade_requests,
    list_trade_result_inquiries,
    save_mock_result_inquiry,
    save_mock_transfer_request,
    save_mock_transfer_response,
)

router = APIRouter(prefix="/fintech", tags=["fintech"])


@router.get("/funding-summary", response_model=FundingSummaryResponse)
def funding_summary_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    order_by: FundingOrderBy = Query(default="registered_desc"),
) -> FundingSummaryResponse:
    return list_funding_summaries(limit=limit, offset=offset, order_by=order_by)


@router.post("/funding-providers", response_model=FundingProviderWriteResponse, status_code=201)
def funding_provider_create(payload: FundingProviderWriteRequest) -> FundingProviderWriteResponse:
    try:
        return create_funding_provider(payload)
    except ValueError as error:
        raise HTTPException(status_code=409, detail="funding provider already exists") from error


@router.get("/status", response_model=FintechStatusResponse)
def fintech_integration_status() -> FintechStatusResponse:
    return fintech_status()


@router.get("/trade-requests", response_model=TradeRequestBinListResponse)
def trade_request_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    mbid: str | None = Query(default=None, max_length=10),
    send_flag: str | None = Query(default=None, max_length=1),
    recv_flag: str | None = Query(default=None, max_length=1),
    msg_code: str | None = Query(default=None, max_length=7),
    result_policy: str | None = Query(default=None, max_length=10),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    include_raw: bool = Query(default=False),
) -> TradeRequestBinListResponse:
    return list_trade_requests(
        limit=limit,
        offset=offset,
        mbid=mbid,
        send_flag=send_flag,
        recv_flag=recv_flag,
        msg_code=msg_code,
        result_policy=result_policy,
        from_date=from_date,
        to_date=to_date,
        include_raw=include_raw,
    )


@router.get(
    "/trade-requests/{req_date}/{bank_code}/{comp_code}/{seq_no}",
    response_model=TradeRequestBinDetailResponse,
)
def trade_request_detail(
    req_date: str,
    bank_code: str,
    comp_code: str,
    seq_no: str,
    include_raw: bool = Query(default=False),
    include_parsed: bool = Query(default=True),
) -> TradeRequestBinDetailResponse:
    detail = get_trade_request_detail(
        req_date=req_date,
        bank_code=bank_code,
        comp_code=comp_code,
        seq_no=seq_no,
        include_raw=include_raw,
        include_parsed=include_parsed,
    )
    if detail is None:
        raise HTTPException(status_code=404, detail="trade request not found")
    return detail


@router.get("/firm-requests", response_model=FirmRequestBinListResponse)
def firm_request_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    mbid: str | None = Query(default=None, max_length=10),
    success_yn: str | None = Query(default=None, max_length=1),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
) -> FirmRequestBinListResponse:
    return list_firm_requests(
        limit=limit,
        offset=offset,
        mbid=mbid,
        success_yn=success_yn,
        from_date=from_date,
        to_date=to_date,
    )


@router.get("/result-inquiries", response_model=TradeResultInquiryListResponse)
def trade_result_inquiry_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    mbid: str | None = Query(default=None, max_length=10),
    processing_status: str | None = Query(default=None, max_length=7),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
) -> TradeResultInquiryListResponse:
    return list_trade_result_inquiries(
        limit=limit,
        offset=offset,
        mbid=mbid,
        processing_status=processing_status,
        from_date=from_date,
        to_date=to_date,
    )


@router.post("/mock/transfer-message", response_model=MockTransferMessageResponse)
def mock_transfer_message(
    payload: MockTransferMessageRequest,
) -> MockTransferMessageResponse:
    return build_mock_transfer_message(payload)


@router.post("/mock/transfer-request", response_model=MockTransferPersistResponse)
def mock_transfer_request(
    payload: MockTransferMessageRequest,
) -> MockTransferPersistResponse:
    return save_mock_transfer_request(payload)


@router.post("/mock/transfer-response", response_model=MockTransferResponsePersistResponse)
def mock_transfer_response(
    payload: MockTransferResponseRequest,
) -> MockTransferResponsePersistResponse:
    result = save_mock_transfer_response(payload)
    if result is None:
        raise HTTPException(status_code=404, detail="trade request not found")
    return result


@router.post("/mock/result-inquiry", response_model=MockResultInquiryPersistResponse)
def mock_result_inquiry(
    payload: MockResultInquiryRequest,
) -> MockResultInquiryPersistResponse:
    result = save_mock_result_inquiry(payload)
    if result is None:
        raise HTTPException(status_code=404, detail="trade request not found")
    return result
