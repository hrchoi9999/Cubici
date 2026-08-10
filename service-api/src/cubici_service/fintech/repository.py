"""Hyphen/firm-banking legacy integration queries and mock adapter."""

from datetime import date, datetime
from typing import Literal

from psycopg.rows import dict_row
from pydantic import BaseModel, Field

from cubici_service.db.connection import get_connection


TransferDirection = Literal["transfer", "result-inquiry", "balance-inquiry", "account-inquiry"]
FundingOrderBy = Literal["registered_desc", "registered_asc", "name_asc", "funding_desc"]


_HYPHEN_BANK_CODE_LABELS = {
    "0000": "정상처리",
    "0104": "수취인계좌 잔액증명서 발급",
    "0105": "수취인계좌 통장정리후 거래가능",
    "2002": "자동이체미등록",
    "2007": "자동이체해지(영업점해지)",
}


class FintechStatusResponse(BaseModel):
    mode: Literal["legacy-db-read", "mock-adapter"]
    live_transfer_enabled: bool
    source_tables: list[str]
    supported_operations: list[str]
    next_action: str


class FundingSummaryCounts(BaseModel):
    total_count: int
    funding_amount: int
    repayment_amount: int
    outstanding_amount: int
    repayment_excess_amount: int


class FundingSummaryItem(BaseModel):
    row_no: int
    fintech_id: int
    fintech_name: str | None
    registered_date: datetime | None
    repayment_period: int | None
    interest_rate: float | None
    funding_amount: int
    repayment_amount: int
    outstanding_amount: int
    request_count: int
    linked_request_count: int = 0
    raw_repayment_amount: int = 0
    repayment_excess_amount: int = 0
    calculation_status: Literal["MATCHED", "LEGACY_SCOPE_MISMATCH", "NO_FUNDING"] = "MATCHED"
    configuration_status: Literal["READY", "BASIC_REGISTERED"] = "READY"


class FundingSummaryResponse(BaseModel):
    limit: int
    offset: int
    counts: FundingSummaryCounts
    items: list[FundingSummaryItem]


class FundingProviderWriteRequest(BaseModel):
    fintech_name: str = Field(min_length=1, max_length=25)
    repayment_period: int = Field(ge=1, le=3650)
    interest_rate: float = Field(ge=0, le=99.99)


class FundingProviderWriteResponse(BaseModel):
    action: Literal["created"]
    fintech_id: int
    provider: FundingSummaryItem


class TradeRequestBinItem(BaseModel):
    mbid: str | None
    req_type: str | None
    req_date: str
    req_time: str
    svc_type: str | None
    bank_code: str
    comp_code: str
    seq_no: str
    msg_code: str
    send_flag: str
    recv_flag: str
    send_date: str | None
    send_time: str | None
    recv_date: str | None
    recv_time: str | None
    process_status: str | None
    reg_date: datetime | None
    modified_date: datetime | None
    send_msg_length: int
    recv_msg_length: int
    result_policy: str
    result_reason: str
    send_msg: str | None = None
    recv_msg: str | None = None


class TradeRequestBinListResponse(BaseModel):
    limit: int
    offset: int
    total: int
    items: list[TradeRequestBinItem]


class ParsedMessageField(BaseModel):
    name: str
    offset: int
    length: int
    field_type: str
    value: str | None
    int_value: int | None = None


class ParsedTradeMessage(BaseModel):
    message_length: int
    message_code: str | None
    business_class_code: str | None
    msg_code: str | None
    operation: str
    fields: list[ParsedMessageField]


class TradeRequestBinDetailResponse(TradeRequestBinItem):
    parsed_send_msg: ParsedTradeMessage | None = None
    parsed_recv_msg: ParsedTradeMessage | None = None


class FirmRequestBinItem(BaseModel):
    mbid: str | None
    req_type: str
    comp_code: str
    req_date: str
    seq_no: str
    req_time: str | None
    out_bank_code: str | None
    out_account: str | None
    in_bank_code: str | None
    in_account: str | None
    amount: int | None
    reply_code: str | None
    success_yn: str | None
    trade_time: str | None
    balance: int | None
    svc_charge: int | None
    reg_date: datetime | None
    modified_date: datetime | None


class FirmRequestBinListResponse(BaseModel):
    limit: int
    offset: int
    total: int
    items: list[FirmRequestBinItem]


class TradeResultInquiryItem(BaseModel):
    id: int
    mbid: str
    send_date: str
    send_time: str
    svc_type: str | None
    message_code: str
    business_class_code: str
    processing_result: str | None
    full_text_number: str
    original_processing_result: str | None
    original_full_text_number: str | None
    payer_number: str | None
    withdrawal_bank_code: str | None
    withdrawal_account_number: str | None
    deposit_bank_code: str | None
    deposit_account_number: str | None
    result_amount: int | None
    result_fee: int | None
    payment_number: str | None
    transfer_time: str | None
    processing_status: str | None
    reg_date: datetime | None
    modified_date: datetime | None


class TradeResultInquiryListResponse(BaseModel):
    limit: int
    offset: int
    total: int
    items: list[TradeResultInquiryItem]


class MockTransferMessageRequest(BaseModel):
    mbid: str | None = Field(default=None, max_length=10)
    comp_code: str = Field(max_length=8)
    bank_code: str = Field(max_length=3)
    seq_no: str = Field(max_length=6)
    amount: int = Field(ge=0)
    withdrawal_bank_code: str | None = Field(default=None, max_length=3)
    withdrawal_account_number: str | None = Field(default=None, max_length=30)
    deposit_bank_code: str | None = Field(default=None, max_length=3)
    deposit_account_number: str | None = Field(default=None, max_length=30)
    deposit_summary: str | None = Field(default=None, max_length=20)
    withdrawal_summary: str | None = Field(default=None, max_length=20)


class MockTransferMessageResponse(BaseModel):
    adapter_mode: Literal["mock"]
    live_transfer_enabled: bool
    req_type: str
    svc_type: str
    msg_code: str
    message_length: int
    send_msg: str
    parsed: dict[str, str | int | None]
    warning: str


class MockTransferPersistResponse(BaseModel):
    adapter_mode: Literal["mock-db"]
    live_transfer_enabled: bool
    created: bool
    req_date: str
    req_time: str
    bank_code: str
    comp_code: str
    seq_no: str
    msg_code: str
    send_flag: str
    recv_flag: str
    process_status: str
    message_length: int
    warning: str


class MockTransferResponseRequest(BaseModel):
    req_date: str = Field(max_length=8)
    bank_code: str = Field(max_length=3)
    comp_code: str = Field(max_length=8)
    seq_no: str = Field(max_length=6)
    response_code: str = Field(default="0000", max_length=4)
    bank_response_code: str = Field(default="0000", max_length=4)


class MockTransferResponsePersistResponse(BaseModel):
    adapter_mode: Literal["mock-db"]
    live_transfer_enabled: bool
    updated: bool
    req_date: str
    bank_code: str
    comp_code: str
    seq_no: str
    recv_flag: str
    result_policy: str
    result_reason: str
    warning: str


class MockResultInquiryRequest(BaseModel):
    req_date: str = Field(max_length=8)
    bank_code: str = Field(max_length=3)
    comp_code: str = Field(max_length=8)
    seq_no: str = Field(max_length=6)
    processing_result: str = Field(default="0000", max_length=4)
    original_processing_result: str = Field(default="0000", max_length=4)
    result_fee: int = Field(default=0, ge=0)
    payment_number: str | None = Field(default=None, max_length=15)
    payer_number: str | None = Field(default=None, max_length=20)


class MockResultInquiryPersistResponse(BaseModel):
    adapter_mode: Literal["mock-db"]
    live_transfer_enabled: bool
    created: bool
    id: int | None
    mbid: str | None
    original_req_date: str
    original_bank_code: str
    original_comp_code: str
    original_seq_no: str
    processing_result: str
    original_processing_result: str
    processing_status: str
    warning: str


def list_funding_summaries(
    *,
    limit: int = 20,
    offset: int = 0,
    order_by: FundingOrderBy = "registered_desc",
) -> FundingSummaryResponse:
    order_clause = {
        "registered_desc": "registered_date desc nulls last, fintech_id desc",
        "registered_asc": "registered_date asc nulls last, fintech_id asc",
        "name_asc": "fintech_name asc nulls last, fintech_id asc",
        "funding_desc": "funding_amount desc, fintech_id asc",
    }[order_by]

    base_query = """
        with funding as (
            select
                fintech_id,
                count(*)::int as request_count,
                min(coalesce(approval_date, request_date, reg_date)) as registered_date,
                coalesce(sum(request_amount), 0)::bigint as funding_amount,
                avg(interest_rate) as average_interest_rate
            from fintech_request
            where fintech_id is not null
            group by fintech_id
        ),
        request_links as (
            select
                request_data.fintech_id,
                count(distinct provision.request_code)::int as linked_request_count
            from fintech_request request_data
            join moneybank_redemption_provision provision
              on provision.request_code = request_data.request_code
            group by request_data.fintech_id
        ),
        linked_mbids as (
            select distinct request_data.fintech_id, provision.mbid
            from fintech_request request_data
            join moneybank_redemption_provision provision
              on provision.request_code = request_data.request_code
        ),
        repayment as (
            select
                linked_mbids.fintech_id,
                coalesce(sum(repayment.repayment_amount), 0)::bigint as raw_repayment_amount
            from linked_mbids
            join moneybank_redemption_repayment repayment on repayment.mbid = linked_mbids.mbid
            group by linked_mbids.fintech_id
        )
        select
            f.id as fintech_id,
            f.fintech_name,
            coalesce(funding.registered_date, f.reg_date) as registered_date,
            f.fintech_repayment_date::int as repayment_period,
            coalesce(f.fintech_interest_rate, funding.average_interest_rate)::double precision as interest_rate,
            coalesce(funding.funding_amount, 0)::bigint as funding_amount,
            least(coalesce(funding.funding_amount, 0), coalesce(repayment.raw_repayment_amount, 0))::bigint as repayment_amount,
            greatest(coalesce(funding.funding_amount, 0) - coalesce(repayment.raw_repayment_amount, 0), 0)::bigint as outstanding_amount,
            coalesce(repayment.raw_repayment_amount, 0)::bigint as raw_repayment_amount,
            greatest(coalesce(repayment.raw_repayment_amount, 0) - coalesce(funding.funding_amount, 0), 0)::bigint as repayment_excess_amount,
            coalesce(funding.request_count, 0)::int as request_count,
            coalesce(request_links.linked_request_count, 0)::int as linked_request_count,
            case
                when coalesce(funding.request_count, 0) = 0 then 'NO_FUNDING'
                when coalesce(repayment.raw_repayment_amount, 0) > coalesce(funding.funding_amount, 0)
                  or coalesce(request_links.linked_request_count, 0) < coalesce(funding.request_count, 0)
                    then 'LEGACY_SCOPE_MISMATCH'
                else 'MATCHED'
            end as calculation_status,
            case
                when nullif(f.fintech_bank_code, '') is not null
                 and nullif(f.fintech_account_number, '') is not null then 'READY'
                else 'BASIC_REGISTERED'
            end as configuration_status
        from fintech f
        left join funding on funding.fintech_id = f.id
        left join request_links on request_links.fintech_id = f.id
        left join repayment on repayment.fintech_id = f.id
    """

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                select
                    count(*)::int as total_count,
                    coalesce(sum(funding_amount), 0)::bigint as funding_amount,
                    coalesce(sum(repayment_amount), 0)::bigint as repayment_amount,
                    coalesce(sum(outstanding_amount), 0)::bigint as outstanding_amount,
                    coalesce(sum(repayment_excess_amount), 0)::bigint as repayment_excess_amount
                from ({base_query}) funding_summary
                """
            )
            counts = FundingSummaryCounts.model_validate(cursor.fetchone())

            cursor.execute(
                f"""
                select *
                from ({base_query}) funding_summary
                order by {order_clause}
                limit %s offset %s
                """,
                (limit, offset),
            )
            items = [
                FundingSummaryItem(row_no=offset + index, **row)
                for index, row in enumerate(cursor.fetchall(), start=1)
            ]

    return FundingSummaryResponse(limit=limit, offset=offset, counts=counts, items=items)


def create_funding_provider(payload: FundingProviderWriteRequest) -> FundingProviderWriteResponse:
    normalized_name = payload.fintech_name.strip()
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                with lock_row as (
                    select pg_advisory_xact_lock(hashtext('cubici-fintech-provider'))
                ),
                next_id as (
                    select coalesce(max(id), 0) + 1 as id
                    from fintech, lock_row
                )
                insert into fintech (
                    id,
                    fintech_name,
                    fintech_interest_rate,
                    fintech_repayment_date,
                    process_type,
                    reg_date
                )
                select next_id.id, %s, %s, %s, 'BASIC_REGISTERED', now()
                from next_id
                where not exists (
                    select 1 from fintech where lower(trim(fintech_name)) = lower(%s)
                )
                returning id
                """,
                (normalized_name, payload.interest_rate, payload.repayment_period, normalized_name),
            )
            row = cursor.fetchone()

    if row is None:
        raise ValueError("funding provider name already exists")

    provider = next(
        item
        for item in list_funding_summaries(limit=100, order_by="registered_desc").items
        if item.fintech_id == row["id"]
    )
    return FundingProviderWriteResponse(action="created", fintech_id=row["id"], provider=provider)


def fintech_status() -> FintechStatusResponse:
    return FintechStatusResponse(
        mode="mock-adapter",
        live_transfer_enabled=False,
        source_tables=[
            "TRADE_REQUEST_BIN",
            "firm_request_bin",
            "fintech_request",
            "trade_result_inquiry",
            "hyphen_bank_bin",
        ],
        supported_operations=[
            "legacy trade request list",
            "legacy trade request detail",
            "300 byte message parse",
            "firm request result list",
            "trade result inquiry list",
            "mock transfer message build",
            "mock transfer request save",
            "mock transfer response receive",
            "mock result inquiry save",
        ],
        next_action="하이픈 300 byte 전문 필드 매핑을 확정한 뒤 실통신 adapter를 별도 승인으로 연결",
    )


def get_trade_request_detail(
    *,
    req_date: str,
    bank_code: str,
    comp_code: str,
    seq_no: str,
    include_raw: bool = False,
    include_parsed: bool = True,
) -> TradeRequestBinDetailResponse | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select
                    btrim(mbid)::text as mbid,
                    "REQ_TYPE" as req_type,
                    "REQ_DATE" as req_date,
                    "REQ_TIME" as req_time,
                    "SVC_TYPE" as svc_type,
                    "BANK_CODE" as bank_code,
                    "COMP_CODE" as comp_code,
                    "SEQ_NO" as seq_no,
                    "MSG_CODE" as msg_code,
                    "SEND_FLAG" as send_flag,
                    "RECV_FLAG" as recv_flag,
                    "SEND_DATE" as send_date,
                    "SEND_TIME" as send_time,
                    "RECV_DATE" as recv_date,
                    "RECV_TIME" as recv_time,
                    "PROCESS_STATUS" as process_status,
                    reg_date,
                    modified_date,
                    coalesce(length("SEND_MSG"), 0)::int as send_msg_length,
                    coalesce(length("RECV_MSG"), 0)::int as recv_msg_length,
                    "SEND_MSG" as raw_send_msg,
                    "RECV_MSG" as raw_recv_msg
                from "TRADE_REQUEST_BIN"
                where "REQ_DATE" = %s
                  and "BANK_CODE" = %s
                  and "COMP_CODE" = %s
                  and "SEQ_NO" = %s
                """,
                (req_date, bank_code, comp_code, seq_no),
            )
            row = cursor.fetchone()

    if row is None:
        return None

    payload = _lower_upper_keys(row)
    raw_send_msg = payload.pop("raw_send_msg")
    raw_recv_msg = payload.pop("raw_recv_msg")
    parsed_send_msg = parse_hyphen_message(raw_send_msg) if include_parsed else None
    parsed_recv_msg = parse_hyphen_message(raw_recv_msg) if include_parsed else None
    policy = evaluate_trade_result(
        recv_flag=payload["recv_flag"],
        parsed_recv_msg=parsed_recv_msg or parse_hyphen_message(raw_recv_msg),
    )
    payload["send_msg"] = raw_send_msg if include_raw else None
    payload["recv_msg"] = raw_recv_msg if include_raw else None
    payload["result_policy"] = policy[0]
    payload["result_reason"] = policy[1]
    payload["parsed_send_msg"] = parsed_send_msg
    payload["parsed_recv_msg"] = parsed_recv_msg
    return TradeRequestBinDetailResponse(**payload)


def list_trade_requests(
    limit: int,
    offset: int,
    *,
    mbid: str | None = None,
    send_flag: str | None = None,
    recv_flag: str | None = None,
    msg_code: str | None = None,
    result_policy: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    include_raw: bool = False,
) -> TradeRequestBinListResponse:
    where_clause, params = _build_trade_request_filters(
        mbid=mbid,
        send_flag=send_flag,
        recv_flag=recv_flag,
        msg_code=msg_code,
        result_policy=result_policy,
        from_date=from_date,
        to_date=to_date,
    )

    raw_select = '"SEND_MSG", "RECV_MSG" as raw_recv_msg'

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f'select count(*)::int as total from "TRADE_REQUEST_BIN"{where_clause}',
                params,
            )
            total = cursor.fetchone()["total"]

            cursor.execute(
                f"""
                select
                    btrim(mbid)::text as mbid,
                    "REQ_TYPE" as req_type,
                    "REQ_DATE" as req_date,
                    "REQ_TIME" as req_time,
                    "SVC_TYPE" as svc_type,
                    "BANK_CODE" as bank_code,
                    "COMP_CODE" as comp_code,
                    "SEQ_NO" as seq_no,
                    "MSG_CODE" as msg_code,
                    "SEND_FLAG" as send_flag,
                    "RECV_FLAG" as recv_flag,
                    "SEND_DATE" as send_date,
                    "SEND_TIME" as send_time,
                    "RECV_DATE" as recv_date,
                    "RECV_TIME" as recv_time,
                    "PROCESS_STATUS" as process_status,
                    reg_date,
                    modified_date,
                    coalesce(length("SEND_MSG"), 0)::int as send_msg_length,
                    coalesce(length("RECV_MSG"), 0)::int as recv_msg_length,
                    {raw_select}
                from "TRADE_REQUEST_BIN"
                {where_clause}
                order by "REQ_DATE" desc, "REQ_TIME" desc, "SEQ_NO" desc
                limit %s offset %s
                """,
                (*params, limit, offset),
            )
            rows = cursor.fetchall()

    items: list[TradeRequestBinItem] = []
    for row in rows:
        payload = _lower_upper_keys(row)
        raw_recv_msg = payload.pop("raw_recv_msg")
        parsed_recv_msg = parse_hyphen_message(raw_recv_msg)
        policy = evaluate_trade_result(
            recv_flag=payload["recv_flag"],
            parsed_recv_msg=parsed_recv_msg,
        )
        payload["send_msg"] = payload["send_msg"] if include_raw else None
        payload["recv_msg"] = raw_recv_msg if include_raw else None
        payload["result_policy"] = policy[0]
        payload["result_reason"] = policy[1]
        items.append(TradeRequestBinItem(**payload))

    return TradeRequestBinListResponse(
        limit=limit,
        offset=offset,
        total=total,
        items=items,
    )


def list_firm_requests(
    limit: int,
    offset: int,
    *,
    mbid: str | None = None,
    success_yn: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
) -> FirmRequestBinListResponse:
    where_clause, params = _build_firm_request_filters(
        mbid=mbid,
        success_yn=success_yn,
        from_date=from_date,
        to_date=to_date,
    )

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"select count(*)::int as total from firm_request_bin{where_clause}",
                params,
            )
            total = cursor.fetchone()["total"]

            cursor.execute(
                f"""
                select
                    mbid,
                    req_type,
                    comp_code,
                    req_date,
                    seq_no,
                    req_time,
                    out_bank_code,
                    out_account,
                    in_bank_code,
                    in_account,
                    amount,
                    reply_code,
                    success_yn,
                    trade_time,
                    balance,
                    svc_charge,
                    reg_date,
                    modified_date
                from firm_request_bin
                {where_clause}
                order by req_date desc, req_time desc nulls last, seq_no desc
                limit %s offset %s
                """,
                (*params, limit, offset),
            )
            rows = cursor.fetchall()

    return FirmRequestBinListResponse(
        limit=limit,
        offset=offset,
        total=total,
        items=[FirmRequestBinItem(**row) for row in rows],
    )


def list_trade_result_inquiries(
    limit: int,
    offset: int,
    *,
    mbid: str | None = None,
    processing_status: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
) -> TradeResultInquiryListResponse:
    where_clause, params = _build_trade_result_filters(
        mbid=mbid,
        processing_status=processing_status,
        from_date=from_date,
        to_date=to_date,
    )

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"select count(*)::int as total from trade_result_inquiry{where_clause}",
                params,
            )
            total = cursor.fetchone()["total"]

            cursor.execute(
                f"""
                select
                    id,
                    mbid,
                    send_date,
                    send_time,
                    svc_type,
                    message_code,
                    business_class_code,
                    processing_result,
                    full_text_number,
                    original_processing_result,
                    original_full_text_number,
                    payer_number,
                    withdrawal_bank_code,
                    withdrawal_account_number,
                    deposit_bank_code,
                    deposit_account_number,
                    result_amount,
                    result_fee,
                    payment_number,
                    transfer_time,
                    processing_status,
                    reg_date,
                    modified_date
                from trade_result_inquiry
                {where_clause}
                order by send_date desc, send_time desc, id desc
                limit %s offset %s
                """,
                (*params, limit, offset),
            )
            rows = cursor.fetchall()

    return TradeResultInquiryListResponse(
        limit=limit,
        offset=offset,
        total=total,
        items=[TradeResultInquiryItem(**row) for row in rows],
    )


def parse_hyphen_message(message: str | None) -> ParsedTradeMessage | None:
    if not message:
        return None

    message_code = _read_text(message, 19, 4)
    business_class_code = _read_text(message, 23, 3)
    msg_code = f"{message_code}{business_class_code}" if message_code and business_class_code else None
    operation = _operation_label(msg_code)
    specs = _common_field_specs() + _detail_field_specs(msg_code)

    return ParsedTradeMessage(
        message_length=len(message.encode("euc-kr", errors="replace")),
        message_code=message_code,
        business_class_code=business_class_code,
        msg_code=msg_code,
        operation=operation,
        fields=[
            ParsedMessageField(
                name=name,
                offset=offset,
                length=length,
                field_type=field_type,
                value=_read_text(message, offset, length),
                int_value=_read_int(message, offset, length) if field_type == "N" else None,
            )
            for name, offset, length, field_type in specs
        ],
    )


def evaluate_trade_result(
    *,
    recv_flag: str | None,
    parsed_recv_msg: ParsedTradeMessage | None,
) -> tuple[str, str]:
    if recv_flag == "N":
        return "재조회 필요", "응답 미수신"
    if recv_flag == "T":
        return "재조회 필요", "응답 timeout"
    if recv_flag == "C":
        return "관리자 확인", "접속 실패"
    if recv_flag == "F":
        return "관리자 확인", "응답 수신 실패"
    if parsed_recv_msg is None:
        return "관리자 확인", "응답 전문 parsing 불가"

    fields = {field.name: field.value for field in parsed_recv_msg.fields}
    bank_response_code = fields.get("은행응답코드")
    original_result_code = fields.get("처리결과")

    if not bank_response_code:
        return "재조회 필요", "은행응답코드 없음"
    if bank_response_code != "0000":
        return "실패·반려", _format_result_code_reason("은행응답코드", bank_response_code)
    if parsed_recv_msg.msg_code == "0610101" and original_result_code != "0000":
        return "실패·반려", _format_result_code_reason("원거래 처리결과", original_result_code)
    return "정상", _format_result_code_reason("은행응답코드", bank_response_code)


def _format_result_code_reason(prefix: str, code: str | None) -> str:
    normalized_code = (code or "").strip()
    if not normalized_code:
        return f"{prefix} 없음"

    label = _HYPHEN_BANK_CODE_LABELS.get(normalized_code)
    if label:
        return f"{prefix} {normalized_code} - {label}"
    return f"{prefix} {normalized_code} - 코드명 미확인"


def build_mock_transfer_message(payload: MockTransferMessageRequest) -> MockTransferMessageResponse:
    req_date = datetime.now().strftime("%Y%m%d")
    req_time = datetime.now().strftime("%H%M%S")
    req_type = "transfer"
    svc_type = "PRW"
    msg_code = "0100100"
    message = bytearray(b" " * 300)
    transfer_time = req_time
    seq_no = payload.seq_no.zfill(6)
    bank_code3 = payload.bank_code
    bank_code2 = payload.bank_code[-2:] if len(payload.bank_code) >= 2 else payload.bank_code
    deposit_bank_code3 = payload.deposit_bank_code
    deposit_bank_code2 = (
        payload.deposit_bank_code[-2:]
        if payload.deposit_bank_code and len(payload.deposit_bank_code) >= 2
        else payload.deposit_bank_code
    )

    _put_field(message, 0, 9, "")  # 식별코드: 은행별 지정값. 운영 전 확정 필요.
    _put_field(message, 9, 8, payload.comp_code)
    _put_field(message, 17, 2, bank_code2)
    _put_field(message, 19, 4, "0100")
    _put_field(message, 23, 3, "100")
    _put_field(message, 26, 1, "1")
    _put_field(message, 27, 6, seq_no, align="right", fill="0")
    _put_field(message, 33, 8, req_date)
    _put_field(message, 41, 6, req_time)
    _put_field(message, 84, 3, bank_code3)

    _put_field(message, 100, 15, payload.withdrawal_account_number)
    _put_field(message, 129, 13, payload.amount, align="right", fill="0")
    _put_field(message, 156, 2, deposit_bank_code2)
    _put_field(message, 158, 15, payload.deposit_account_number)
    _put_field(message, 182, 6, transfer_time)
    _put_field(message, 188, 20, payload.deposit_summary)
    _put_field(message, 239, 20, payload.withdrawal_summary)
    _put_field(message, 259, 3, deposit_bank_code3)

    send_msg = message.decode("euc-kr", errors="replace")

    return MockTransferMessageResponse(
        adapter_mode="mock",
        live_transfer_enabled=False,
        req_type=req_type,
        svc_type=svc_type,
        msg_code=msg_code,
        message_length=len(send_msg.encode("euc-kr", errors="replace")),
        send_msg=send_msg,
        parsed={
            "req_date": req_date,
            "req_time": req_time,
            "svc_type": svc_type,
            "bank_code": payload.bank_code,
            "bank_code2": bank_code2,
            "comp_code": payload.comp_code,
            "seq_no": seq_no,
            "msg_code": msg_code,
            "message_code": "0100",
            "business_class_code": "100",
            "amount": payload.amount,
            "withdrawal_account_number": payload.withdrawal_account_number,
            "deposit_bank_code2": deposit_bank_code2,
            "deposit_bank_code3": deposit_bank_code3,
            "deposit_account_number": payload.deposit_account_number,
            "mbid": payload.mbid,
        },
        warning="문서 위치 기준 mock 전문이다. 식별코드/계약값 확정 전까지 실송금에 사용하지 않는다.",
    )


def save_mock_transfer_request(payload: MockTransferMessageRequest) -> MockTransferPersistResponse:
    message = build_mock_transfer_message(payload)
    req_date = str(message.parsed["req_date"])
    req_time = str(message.parsed["req_time"])
    bank_code = str(message.parsed["bank_code"])
    comp_code = str(message.parsed["comp_code"])
    seq_no = str(message.parsed["seq_no"])
    msg_code = str(message.parsed["msg_code"])
    send_flag = "N"
    recv_flag = "N"
    process_status = "MOCK"

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                insert into "TRADE_REQUEST_BIN" (
                    mbid,
                    "REQ_TYPE",
                    "REQ_DATE",
                    "REQ_TIME",
                    "SVC_TYPE",
                    "BANK_CODE",
                    "COMP_CODE",
                    "SEQ_NO",
                    "MSG_CODE",
                    "SEND_FLAG",
                    "RECV_FLAG",
                    "SEND_MSG",
                    "PROCESS_STATUS",
                    reg_date,
                    modified_date
                )
                values (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now(), now()
                )
                on conflict ("REQ_DATE", "BANK_CODE", "COMP_CODE", "SEQ_NO") do nothing
                """,
                (
                    payload.mbid,
                    message.req_type,
                    req_date,
                    req_time,
                    message.svc_type,
                    bank_code,
                    comp_code,
                    seq_no,
                    msg_code,
                    send_flag,
                    recv_flag,
                    message.send_msg,
                    process_status,
                ),
            )
            created = cursor.rowcount == 1

    return MockTransferPersistResponse(
        adapter_mode="mock-db",
        live_transfer_enabled=False,
        created=created,
        req_date=req_date,
        req_time=req_time,
        bank_code=bank_code,
        comp_code=comp_code,
        seq_no=seq_no,
        msg_code=msg_code,
        send_flag=send_flag,
        recv_flag=recv_flag,
        process_status=process_status,
        message_length=message.message_length,
        warning="로컬 DB 저장 전용 mock 요청이다. 하이픈/은행 외부망으로 송신하지 않는다.",
    )


def save_mock_transfer_response(
    payload: MockTransferResponseRequest,
) -> MockTransferResponsePersistResponse | None:
    recv_date = datetime.now().strftime("%Y%m%d")
    recv_time = datetime.now().strftime("%H%M%S")

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select "SEND_MSG"
                from "TRADE_REQUEST_BIN"
                where "REQ_DATE" = %s
                  and "BANK_CODE" = %s
                  and "COMP_CODE" = %s
                  and "SEQ_NO" = %s
                """,
                (payload.req_date, payload.bank_code, payload.comp_code, payload.seq_no.zfill(6)),
            )
            row = cursor.fetchone()
            if row is None:
                return None

            recv_msg = _build_mock_transfer_response_message(
                row["SEND_MSG"],
                response_code=payload.response_code,
                bank_response_code=payload.bank_response_code,
            )
            parsed_recv_msg = parse_hyphen_message(recv_msg)
            policy, reason = evaluate_trade_result(recv_flag="Y", parsed_recv_msg=parsed_recv_msg)

            cursor.execute(
                """
                update "TRADE_REQUEST_BIN"
                set
                    "SEND_FLAG" = 'Y',
                    "RECV_FLAG" = 'Y',
                    "SEND_DATE" = coalesce("SEND_DATE", %s),
                    "SEND_TIME" = coalesce("SEND_TIME", %s),
                    "RECV_DATE" = %s,
                    "RECV_TIME" = %s,
                    "RECV_MSG" = %s,
                    "PROCESS_STATUS" = 'MOCK',
                    modified_date = now()
                where "REQ_DATE" = %s
                  and "BANK_CODE" = %s
                  and "COMP_CODE" = %s
                  and "SEQ_NO" = %s
                """,
                (
                    payload.req_date,
                    recv_time,
                    recv_date,
                    recv_time,
                    recv_msg,
                    payload.req_date,
                    payload.bank_code,
                    payload.comp_code,
                    payload.seq_no.zfill(6),
                ),
            )

    return MockTransferResponsePersistResponse(
        adapter_mode="mock-db",
        live_transfer_enabled=False,
        updated=True,
        req_date=payload.req_date,
        bank_code=payload.bank_code,
        comp_code=payload.comp_code,
        seq_no=payload.seq_no.zfill(6),
        recv_flag="Y",
        result_policy=policy,
        result_reason=reason,
        warning="로컬 DB 응답 수신 mock이다. 하이픈/은행 외부망으로 송수신하지 않는다.",
    )


def save_mock_result_inquiry(
    payload: MockResultInquiryRequest,
) -> MockResultInquiryPersistResponse | None:
    now = datetime.now()
    send_date = now.strftime("%Y%m%d")
    send_time = now.strftime("%H%M%S")
    transfer_time = send_time
    original_seq_no = payload.seq_no.zfill(6)
    processing_status = "MOCK"

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select
                    btrim(mbid)::text as mbid,
                    "SVC_TYPE" as svc_type,
                    "SEND_MSG" as send_msg
                from "TRADE_REQUEST_BIN"
                where "REQ_DATE" = %s
                  and "BANK_CODE" = %s
                  and "COMP_CODE" = %s
                  and "SEQ_NO" = %s
                """,
                (payload.req_date, payload.bank_code, payload.comp_code, original_seq_no),
            )
            row = cursor.fetchone()
            if row is None:
                return None

            fields = {field.name: field for field in parse_hyphen_message(row["send_msg"]).fields}
            next_id = _next_trade_result_inquiry_id(cursor)
            amount = _field_int(fields, "출금금액")

            cursor.execute(
                """
                insert into trade_result_inquiry (
                    id,
                    mbid,
                    send_date,
                    send_time,
                    svc_type,
                    message_code,
                    business_class_code,
                    processing_result,
                    full_text_number,
                    original_processing_result,
                    original_full_text_number,
                    payer_number,
                    withdrawal_bank_code,
                    withdrawal_account_number,
                    deposit_bank_code,
                    deposit_account_number,
                    result_amount,
                    result_fee,
                    payment_number,
                    transfer_time,
                    processing_status,
                    reg_date,
                    modified_date
                )
                values (
                    %s, %s, %s, %s, %s, '0610', '101', %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now(), now()
                )
                """,
                (
                    next_id,
                    row["mbid"] or "MOCK",
                    send_date,
                    send_time,
                    row["svc_type"],
                    payload.processing_result,
                    original_seq_no,
                    payload.original_processing_result,
                    original_seq_no,
                    payload.payer_number,
                    payload.bank_code,
                    _field_value(fields, "출금계좌번호"),
                    _field_value(fields, "입금은행코드3") or _field_value(fields, "입금은행코드2"),
                    _field_value(fields, "입금계좌번호"),
                    amount,
                    payload.result_fee,
                    payload.payment_number,
                    transfer_time,
                    processing_status,
                ),
            )

    return MockResultInquiryPersistResponse(
        adapter_mode="mock-db",
        live_transfer_enabled=False,
        created=True,
        id=next_id,
        mbid=row["mbid"],
        original_req_date=payload.req_date,
        original_bank_code=payload.bank_code,
        original_comp_code=payload.comp_code,
        original_seq_no=original_seq_no,
        processing_result=payload.processing_result,
        original_processing_result=payload.original_processing_result,
        processing_status=processing_status,
        warning="로컬 DB 결과조회 저장 mock이다. 하이픈/은행 외부망으로 조회하지 않는다.",
    )


def _build_mock_transfer_response_message(
    send_msg: str,
    *,
    response_code: str,
    bank_response_code: str,
) -> str:
    message = bytearray(send_msg.encode("euc-kr", errors="replace"))
    if len(message) < 300:
        message.extend(b" " * (300 - len(message)))

    _put_field(message, 19, 4, "0110")
    _put_field(message, 23, 3, "100")
    _put_field(message, 47, 4, response_code)
    _put_field(message, 51, 4, bank_response_code)
    return message.decode("euc-kr", errors="replace")


def _next_trade_result_inquiry_id(cursor) -> int:
    cursor.execute("select coalesce(max(id), 0) + 1 from trade_result_inquiry")
    row = cursor.fetchone()
    if isinstance(row, dict):
        return int(next(iter(row.values())))
    return int(row[0])


def _field_value(fields: dict[str, ParsedMessageField], name: str) -> str | None:
    value = fields.get(name)
    if value is None:
        return None
    return value.value


def _field_int(fields: dict[str, ParsedMessageField], name: str) -> int | None:
    value = fields.get(name)
    if value is None:
        return None
    return value.int_value


def _build_trade_request_filters(
    *,
    mbid: str | None,
    send_flag: str | None,
    recv_flag: str | None,
    msg_code: str | None,
    result_policy: str | None,
    from_date: date | None,
    to_date: date | None,
) -> tuple[str, list[object]]:
    clauses: list[str] = []
    params: list[object] = []

    if mbid:
        clauses.append("btrim(mbid)::text ilike %s")
        params.append(f"%{mbid}%")
    if send_flag:
        clauses.append('"SEND_FLAG" = %s')
        params.append(send_flag)
    if recv_flag:
        clauses.append('"RECV_FLAG" = %s')
        params.append(recv_flag)
    if msg_code:
        clauses.append('"MSG_CODE" = %s')
        params.append(msg_code)
    if result_policy:
        clauses.append(f"({_trade_result_policy_sql()}) = %s")
        params.append(result_policy)
    if from_date:
        clauses.append('"REQ_DATE" >= %s')
        params.append(from_date.strftime("%Y%m%d"))
    if to_date:
        clauses.append('"REQ_DATE" <= %s')
        params.append(to_date.strftime("%Y%m%d"))

    return (" where " + " and ".join(clauses), params) if clauses else ("", params)


def _trade_result_policy_sql() -> str:
    return """
        case
            when "RECV_FLAG" in ('N', 'T') then '재조회 필요'
            when "RECV_FLAG" in ('C', 'F') then '관리자 확인'
            when "RECV_MSG" is null or btrim("RECV_MSG") = '' then '관리자 확인'
            when nullif(btrim(substring("RECV_MSG" from 52 for 4)), '') is null then '재조회 필요'
            when btrim(substring("RECV_MSG" from 52 for 4)) <> '0000' then '실패·반려'
            when substring("RECV_MSG" from 20 for 7) = '0610101'
             and coalesce(nullif(btrim(substring("RECV_MSG" from 180 for 4)), ''), '') <> '0000'
                then '실패·반려'
            else '정상'
        end
    """


def _build_firm_request_filters(
    *,
    mbid: str | None,
    success_yn: str | None,
    from_date: date | None,
    to_date: date | None,
) -> tuple[str, list[object]]:
    clauses: list[str] = []
    params: list[object] = []

    if mbid:
        clauses.append("mbid ilike %s")
        params.append(f"%{mbid}%")
    if success_yn:
        clauses.append("success_yn = %s")
        params.append(success_yn)
    if from_date:
        clauses.append("req_date >= %s")
        params.append(from_date.strftime("%Y%m%d"))
    if to_date:
        clauses.append("req_date <= %s")
        params.append(to_date.strftime("%Y%m%d"))

    return (" where " + " and ".join(clauses), params) if clauses else ("", params)


def _build_trade_result_filters(
    *,
    mbid: str | None,
    processing_status: str | None,
    from_date: date | None,
    to_date: date | None,
) -> tuple[str, list[object]]:
    clauses: list[str] = []
    params: list[object] = []

    if mbid:
        clauses.append("mbid ilike %s")
        params.append(f"%{mbid}%")
    if processing_status:
        clauses.append("processing_status = %s")
        params.append(processing_status)
    if from_date:
        clauses.append("send_date >= %s")
        params.append(from_date.strftime("%Y%m%d"))
    if to_date:
        clauses.append("send_date <= %s")
        params.append(to_date.strftime("%Y%m%d"))

    return (" where " + " and ".join(clauses), params) if clauses else ("", params)


def _lower_upper_keys(row: dict[str, object]) -> dict[str, object]:
    return {key.lower(): value for key, value in row.items()}


def _common_field_specs() -> list[tuple[str, int, int, str]]:
    return [
        ("식별코드", 0, 9, "C"),
        ("업체코드", 9, 8, "C"),
        ("은행코드2", 17, 2, "C"),
        ("메시지코드", 19, 4, "C"),
        ("업무구분코드", 23, 3, "C"),
        ("송신횟수", 26, 1, "C"),
        ("전문번호", 27, 6, "N"),
        ("전송일자", 33, 8, "D"),
        ("전송시간", 41, 6, "T"),
        ("응답코드", 47, 4, "C"),
        ("은행응답코드", 51, 4, "C"),
        ("조회일자", 55, 8, "D"),
        ("조회번호", 63, 6, "N"),
        ("은행전문번호", 69, 15, "C"),
        ("은행코드3", 84, 3, "C"),
    ]


def _detail_field_specs(msg_code: str | None) -> list[tuple[str, int, int, str]]:
    if msg_code in {"0100100", "0110100"}:
        return [
            ("출금계좌번호", 100, 15, "C"),
            ("통장비밀번호", 115, 8, "C"),
            ("복기부호", 123, 6, "C"),
            ("출금금액", 129, 13, "N"),
            ("출금후잔액부호", 142, 1, "C"),
            ("출금후잔액", 143, 13, "N"),
            ("입금은행코드2", 156, 2, "C"),
            ("입금계좌번호", 158, 15, "C"),
            ("수수료", 173, 9, "N"),
            ("이체시각", 182, 6, "T"),
            ("입금계좌적요", 188, 20, "C"),
            ("CMS코드", 208, 16, "C"),
            ("신원확인번호", 224, 13, "C"),
            ("자동이체구분", 237, 2, "C"),
            ("출금계좌적요", 239, 20, "C"),
            ("입금은행코드3", 259, 3, "C"),
            ("급여구분", 262, 1, "C"),
        ]
    if msg_code in {"0600101", "0610101"}:
        return [
            ("원거래전문번호", 100, 6, "C"),
            ("출금계좌번호", 106, 15, "C"),
            ("입금계좌번호", 121, 15, "C"),
            ("금액", 136, 13, "N"),
            ("수수료", 149, 9, "N"),
            ("지급번호", 158, 15, "C"),
            ("이체시각", 173, 6, "T"),
            ("처리결과", 179, 4, "C"),
            ("은행코드2", 183, 2, "C"),
            ("납부자번호", 185, 20, "C"),
            ("거래구분", 205, 2, "C"),
            ("은행코드3", 207, 3, "C"),
        ]
    if msg_code in {"0600300", "0610300"}:
        return [
            ("계좌번호", 100, 15, "C"),
            ("잔액부호", 115, 1, "C"),
            ("계좌잔액", 116, 13, "N"),
            ("잔액자기앞", 129, 13, "N"),
            ("잔액가계", 142, 13, "N"),
            ("잔액일반", 155, 13, "N"),
            ("지급가능금액", 168, 13, "N"),
        ]
    if msg_code in {"0600400", "0610400"}:
        return [
            ("거래일자", 100, 4, "D"),
            ("은행코드2", 104, 2, "C"),
            ("계좌번호", 106, 16, "C"),
            ("예금주명", 122, 22, "C"),
            ("신원확인번호", 144, 13, "C"),
            ("신원확인번호체크", 157, 2, "C"),
            ("업체계좌번호", 159, 20, "C"),
            ("은행코드3", 179, 3, "C"),
            ("금액", 182, 13, "N"),
            ("닷컴통장조회", 185, 1, "C"),
            ("당타행인증유형", 196, 1, "C"),
            ("농협계좌구분", 197, 1, "C"),
        ]
    if msg_code in {"0200300", "0210300"}:
        return [
            ("계좌번호", 100, 15, "C"),
            ("조립건수", 115, 2, "C"),
            ("거래구분", 117, 2, "C"),
            ("은행코드2", 119, 2, "C"),
            ("금액", 121, 13, "N"),
            ("잔액", 134, 13, "N"),
            ("입금지점코드6", 147, 6, "C"),
            ("적요", 153, 14, "C"),
            ("수표번호", 167, 10, "C"),
            ("현금", 177, 13, "N"),
            ("타행수표금액", 190, 13, "N"),
            ("가계수표기타금액", 203, 13, "N"),
            ("가상계좌번호", 216, 16, "C"),
            ("거래일자", 232, 8, "D"),
            ("거래시간", 240, 6, "T"),
            ("통장거래일련번호", 246, 6, "C"),
            ("거래은행코드3", 252, 3, "N"),
            ("입금지점코드7", 255, 7, "C"),
        ]
    return []


def _operation_label(msg_code: str | None) -> str:
    return {
        "0100100": "송금이체 요청",
        "0110100": "송금이체 응답",
        "0600101": "처리결과조회 요청",
        "0610101": "처리결과조회 응답",
        "0600300": "잔액조회 요청",
        "0610300": "잔액조회 응답",
        "0600400": "계좌/예금주조회 요청",
        "0610400": "계좌/예금주조회 응답",
        "0200300": "가상계좌 입금통지 요청",
        "0210300": "가상계좌 입금통지 응답",
    }.get(msg_code, "미분류 전문")


def _read_text(message: str, offset: int, length: int) -> str | None:
    encoded = message.encode("euc-kr", errors="replace")
    if len(encoded) <= offset:
        return None
    value = encoded[offset : offset + length].decode("euc-kr", errors="ignore").strip()
    return value or None


def _read_int(message: str, offset: int, length: int) -> int | None:
    value = _read_text(message, offset, length)
    if value is None:
        return None
    normalized = value.replace("+", "").replace(",", "").strip()
    if not normalized or not normalized.isdigit():
        return None
    return int(normalized)


def _fit(
    value: str | int | None,
    length: int,
    *,
    align: Literal["left", "right"] = "left",
    fill: str = " ",
) -> str:
    text = "" if value is None else str(value)
    if len(text.encode("euc-kr", errors="replace")) > length:
        encoded = text.encode("euc-kr", errors="replace")[:length]
        text = encoded.decode("euc-kr", errors="ignore")
    return text.rjust(length, fill) if align == "right" else text.ljust(length, fill)


def _put_field(
    message: bytearray,
    offset: int,
    length: int,
    value: str | int | None,
    *,
    align: Literal["left", "right"] = "left",
    fill: str = " ",
) -> None:
    text = _fit(value, length, align=align, fill=fill)
    encoded = text.encode("euc-kr", errors="replace")[:length]
    if len(encoded) < length:
        pad = fill.encode("euc-kr", errors="replace")[:1] or b" "
        encoded = encoded + (pad * (length - len(encoded)))
    message[offset : offset + length] = encoded
