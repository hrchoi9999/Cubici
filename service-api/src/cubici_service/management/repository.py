"""Moneybank management overview queries."""

from datetime import date, datetime, timedelta
from typing import Literal

from psycopg.rows import dict_row
from pydantic import BaseModel

from cubici_service.db.connection import get_connection


OverviewUnit = Literal["day", "week", "month"]


class ManagementOverviewSummary(BaseModel):
    standard_date: date | None
    from_date: date | None
    to_date: date | None
    data_source_label: str = "PostgreSQL 직접집계"
    aggregation_status_label: str = "legacy procedure 대조 필요"
    shop_grouping_status_label: str = "shop grouping 대조 필요"
    contract_total_count: int
    contract_today_count: int
    review_today_count: int = 0
    approved_today_count: int = 0
    terminated_today_count: int = 0
    active_contract_count: int
    terminated_contract_count: int
    provision_today_amount: int
    provision_total_amount: int
    provision_total_count: int
    repayment_today_amount: int
    repayment_total_amount: int
    repayment_total_count: int
    repayment_fee_total_amount: int = 0
    opening_repayment_amount: int = 0
    opening_repayment_count: int = 0
    reconciled_repayment_total_amount: int = 0
    outstanding_balance_amount: int
    outstanding_balance_count: int
    balance_reconcile_amount: int = 0
    balance_reconcile_diff: int = 0
    balance_reconcile_status_label: str = "미검증"
    settlement_total_amount: int
    settlement_total_count: int


class ManagementOverviewSeriesItem(BaseModel):
    bucket: date
    contract_count: int
    review_count: int = 0
    approved_count: int = 0
    terminated_count: int = 0
    request_amount: int = 0
    review_amount: int = 0
    approved_amount: int = 0
    provision_amount: int
    provision_count: int = 0
    repayment_amount: int
    repayment_fee: int = 0
    settlement_amount: int
    outstanding_balance: int


class ManagementWarningItem(BaseModel):
    mbid: str
    user_no: int | None
    user_name: str | None
    firm_name: str | None
    status: str | None
    provision_amount: int
    repayment_amount: int
    outstanding_balance: int
    latest_history_date: date | None
    prizm_grade: str | None
    signal: str


class ManagementOverviewResponse(BaseModel):
    unit: OverviewUnit
    summary: ManagementOverviewSummary
    series: list[ManagementOverviewSeriesItem]
    warnings: list[ManagementWarningItem]


class MemberSummaryMetrics(BaseModel):
    standard_date: date | None
    from_date: date | None
    to_date: date | None
    data_source_label: str = "PostgreSQL 직접집계"
    aggregation_status_label: str = "legacy procedure 대조 필요"
    shop_grouping_status_label: str = "shop grouping 대조 필요"
    cubici_yesterday_count: int
    cubici_total_count: int
    moneybank_yesterday_count: int
    moneybank_total_count: int
    terminated_yesterday_count: int
    terminated_total_count: int
    partner_yesterday_count: int
    partner_total_count: int


class MemberSummarySeriesItem(BaseModel):
    bucket: date
    cubici_count: int
    moneybank_count: int
    terminated_count: int
    cubici_cumulative: int
    moneybank_cumulative: int
    terminated_cumulative: int
    moneybank_ratio: float | None


class MemberSummaryResponse(BaseModel):
    unit: OverviewUnit
    partner_code: str | None
    product_code: str | None
    metrics: MemberSummaryMetrics
    series: list[MemberSummarySeriesItem]


class MemberSummaryOption(BaseModel):
    value: str
    label: str


class MemberSummaryOptionsResponse(BaseModel):
    partners: list[MemberSummaryOption]
    products: list[MemberSummaryOption]


class IntegratedPeriodMetric(BaseModel):
    today: int | float | None
    current_month: int | float | None
    previous_month: int | float | None
    available: bool = True


class CubiciIntegratedMetrics(BaseModel):
    standard_date: date | None
    from_date: date | None
    to_date: date | None
    new_members: IntegratedPeriodMetric
    withdrawn_members: IntegratedPeriodMetric
    fee_income: IntegratedPeriodMetric
    dormant_members: IntegratedPeriodMetric
    sales_amount: IntegratedPeriodMetric
    sales_quantity: IntegratedPeriodMetric
    settlement_amount: IntegratedPeriodMetric
    sku_count: IntegratedPeriodMetric
    visitor_count: IntegratedPeriodMetric
    max_concurrent_users: IntegratedPeriodMetric
    average_usage_minutes: IntegratedPeriodMetric
    average_shop_count: IntegratedPeriodMetric


class CubiciIntegratedSeriesItem(BaseModel):
    bucket: date
    new_member_count: int
    withdrawn_member_count: int
    cumulative_member_count: int
    cubici_average_days: float
    moneybank_average_days: float
    channel_counts: dict[str, int]


class CubiciIntegratedResponse(BaseModel):
    unit: OverviewUnit
    partner_code: str | None
    product_code: str | None
    metrics: CubiciIntegratedMetrics
    partners: list[MemberSummaryOption]
    products: list[MemberSummaryOption]
    channels: list[MemberSummaryOption]
    series: list[CubiciIntegratedSeriesItem]


MemberInfoOrderBy = Literal["reg_date_desc", "reg_date_asc", "name_asc", "firm_name_asc", "shop_count_desc"]
MemberUseService = Literal["all", "cubici", "moneybank"]
MemberWithdrawalStatus = Literal["all", "terminated", "requested", "dormant"]
MemberWithdrawalOrderBy = Literal["event_date_desc", "event_date_asc", "name_asc", "firm_name_asc", "shop_count_desc"]
MemberPaymentOrderBy = Literal["payment_date_desc", "payment_date_asc", "amount_desc", "amount_asc", "name_asc", "firm_name_asc"]
MemberPaymentUserType = Literal["all", "USER", "ADMIN"]
MemberChargeChangeDivision = Literal["all", "C", "R"]
MemberChargeChangeOrderBy = Literal["payment_date_desc", "change_date_desc", "change_date_asc", "amount_desc", "name_asc", "firm_name_asc"]


class MemberInfoListItem(BaseModel):
    user_no: int
    service_label: str
    service_code: str
    reg_date: date | None
    user_id: str | None
    user_name: str | None
    firm_name: str | None
    phone: str | None
    firm_tel: str | None
    shop_count: int
    address: str | None
    partner_code: str | None
    moneybank_contract_count: int
    latest_contract_status: str | None


class MemberInfoCounts(BaseModel):
    total_count: int
    cubici_count: int
    moneybank_count: int


class MemberInfoListResponse(BaseModel):
    limit: int
    offset: int
    counts: MemberInfoCounts
    items: list[MemberInfoListItem]


class MemberWithdrawalListItem(BaseModel):
    user_no: int
    service_label: str
    service_code: str
    withdrawal_status: str
    withdrawal_status_label: str
    withdrawal_request_date: date | None
    withdrawal_date: date | None
    event_date: date | None
    user_name: str | None
    firm_name: str | None
    user_id: str | None
    phone: str | None
    shop_count: int
    outstanding_balance: int
    product_code: str | None
    latest_contract_status: str | None
    last_login_date: datetime | None
    partner_code: str | None


class MemberWithdrawalCounts(BaseModel):
    total_count: int
    terminated_count: int
    requested_count: int
    dormant_count: int
    moneybank_count: int
    cubici_count: int


class MemberWithdrawalListResponse(BaseModel):
    limit: int
    offset: int
    counts: MemberWithdrawalCounts
    items: list[MemberWithdrawalListItem]


class MemberPaymentListItem(BaseModel):
    seq: int
    row_no: int
    charge_name: str | None
    reg_date: datetime | None
    user_id: str | None
    user_name: str | None
    firm_name: str | None
    user_phone: str | None
    firm_tel: str | None
    shop_count: int
    firm_addr: str | None
    expire_date: datetime | None
    payment_date: datetime | None
    payment_status: str | None = None
    payment_status_label: str = "결제"
    amount: int | None
    payment_fee: int
    vat: int
    profit: int


class MemberPaymentCounts(BaseModel):
    total_count: int
    paid_count: int


class MemberPaymentSums(BaseModel):
    amount: int
    payment_fee: int
    vat: int
    profit: int


class MemberPaymentListResponse(BaseModel):
    limit: int
    offset: int
    counts: MemberPaymentCounts
    sums: MemberPaymentSums
    items: list[MemberPaymentListItem]


class MemberChargeChangeListItem(BaseModel):
    seq: int
    row_no: int
    status: str
    charge_name: str | None
    start_date: date | None
    user_id: str | None
    user_name: str | None
    firm_name: str | None
    user_code: str | None
    user_phone: str | None
    firm_tel: str | None
    shop_count: int
    firm_addr: str | None
    change_date: date | None
    before_charge: str | None
    pay_status: str
    amount: int
    refund_amount: int | None
    refund_card: int | None
    refund_user_name: str | None
    refund_bank: str | None
    refund_account: str | None
    imp_uid: str | None
    payment_status: str | None = None
    refund_status: str | None = None
    refund_status_label: str = "해당없음"
    refund_date: date | None
    payment_date: datetime | None


class MemberChargeChangeCounts(BaseModel):
    total_count: int
    change_count: int
    termination_count: int
    refund_pending_count: int


class MemberChargeChangeSums(BaseModel):
    add_amount: int
    refund_amount: int


class MemberChargeChangeListResponse(BaseModel):
    limit: int
    offset: int
    counts: MemberChargeChangeCounts
    sums: MemberChargeChangeSums
    items: list[MemberChargeChangeListItem]


class MemberChargeChangeRefundDetail(BaseModel):
    status: str | None
    seq: int | None
    new_seq: int
    user_code: str | None
    rest_date: int | None
    user_name: str | None
    firm_name: str | None
    user_phone: str | None
    ex_charge_name: str | None
    charge_name: str | None
    ex_amount: int
    new_amount: int
    balance: int
    expire_date: date | None
    refund_amount: int
    refund_card: int
    refund_cash: int
    refund_user_name: str | None
    refund_bank: str | None
    refund_account: str | None
    imp_uid: str | None


class MemberChargeChangeRefundFinishResponse(BaseModel):
    seq: int
    new_seq: int
    refund_status: str
    payment_status: str | None


class MemberStatusUser(BaseModel):
    user_no: int
    status_label: str
    user_name: str | None
    user_id: str | None
    phone: str | None
    firm_name: str | None
    business_no: str | None
    biz_setup_date: str | None
    biz_type: str | None
    sectors: str | None
    zip_code: str | None
    address: str | None
    reg_date: date | None
    last_login_date: datetime | None
    partner_code: str | None
    shop_count: int
    moneybank_contract_count: int


class MemberStatusShopItem(BaseModel):
    id: int
    shop_type: str | None
    shop_id: str | None
    status: str | None
    settlement: str | None
    reg_date: datetime | None


class MemberStatusFeeItem(BaseModel):
    mbid: str
    payment_rate: int | None
    average_fee_rate: float | None
    sales_limit_per_order: int | None
    max_outstanding_balance: int | None
    reg_date: datetime | None


class MemberStatusContractItem(BaseModel):
    mbid: str
    status: str | None
    product_code: str | None
    request_date: date | None
    approval_date: date | None
    contract_date: date | None
    expire_date: date | None
    sales_amount: int | None
    outstanding_balance: int
    cumulative_provision_amount: int
    cumulative_repayment_amount: int
    fee_rate: float | None
    payment_rate: int | None
    cb_check: str | None
    national_tax_full_payment: str | None
    local_tax_full_payment: str | None
    health_insurance_full_payment: str | None
    certificate_expiration_date: date | None


class MemberStatusRedemptionItem(BaseModel):
    id: int
    mbid: str
    cumulative_provision_amount: int | None
    cumulative_repayment_amount: int | None
    outstanding_balance: int | None
    reg_date: datetime | None


class MemberStatusDetailResponse(BaseModel):
    user: MemberStatusUser
    shops: list[MemberStatusShopItem]
    fees: list[MemberStatusFeeItem]
    contracts: list[MemberStatusContractItem]
    redemption_history: list[MemberStatusRedemptionItem]


class ManagementUsageListItem(BaseModel):
    mbid: str
    status: str | None
    usage_status: str
    request_date: date | None
    contract_date: date | None
    expire_date: date | None
    user_no: int | None
    user_email: str | None
    user_name: str | None
    firm_name: str | None
    product_code: str | None
    fintech_name: str | None
    fee_rate: float | None
    payment_rate: int | None
    sales_amount: int | None
    provision_amount: int
    repayment_amount: int
    outstanding_balance: int
    prizm_grade: str | None
    prizm_score: float | None


class ManagementUsageCounts(BaseModel):
    total: int
    request_count: int
    review_count: int
    rejected_count: int
    repayment_count: int
    expired_count: int


class ManagementUsageSums(BaseModel):
    sales_amount: int
    provision_amount: int
    repayment_amount: int
    outstanding_balance: int


class ManagementUsageListResponse(BaseModel):
    limit: int
    offset: int
    total: int
    counts: ManagementUsageCounts
    sums: ManagementUsageSums
    items: list[ManagementUsageListItem]


class ManagementUsageUserDetail(BaseModel):
    user_no: int | None
    user_email: str | None
    user_name: str | None
    phone: str | None
    firm_name: str | None
    biz_num: str | None
    biz_setup_date: str | None
    biz_type: str | None
    sectors: str | None
    zip_code: str | None
    address: str | None
    user_reg_date: datetime | None


class ManagementUsageShopItem(BaseModel):
    id: int
    shop_type: str | None
    shop_id: str | None
    reg_date: datetime | None


class ManagementUsageDocumentDetail(BaseModel):
    mbid: str
    business_no: str | None
    cb_check: str | None
    national_tax_full_payment: str | None
    local_tax_full_payment: str | None
    health_insurance_full_payment: str | None
    health_insurance_paid_amount: int | None
    final_confirm_admin: str | None
    file_count: int


class ManagementUsageHistoryItem(BaseModel):
    mbid: str
    contract_date: date | None
    product_code: str | None
    provision_amount: int
    expire_date: date | None
    service_days: int | None
    fee_rate: float | None
    prizm_grade: str | None
    pms_grade: str | None


class ManagementUsageRedemptionHistoryItem(BaseModel):
    id: int
    mbid: str
    cumulative_provision_amount: int | None
    cumulative_repayment_amount: int | None
    outstanding_balance: int | None
    reg_date: datetime | None


class ManagementUsageDetailResponse(BaseModel):
    mbid: str
    usage: ManagementUsageListItem
    user: ManagementUsageUserDetail
    shops: list[ManagementUsageShopItem]
    document: ManagementUsageDocumentDetail | None
    contract_history: list[ManagementUsageHistoryItem]
    redemption_history: list[ManagementUsageRedemptionHistoryItem]


def get_management_overview(
    *,
    unit: OverviewUnit = "day",
    from_date: date | None = None,
    to_date: date | None = None,
) -> ManagementOverviewResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            resolved_dates = _resolve_date_range(cursor, from_date=from_date, to_date=to_date)
            summary = _fetch_summary(cursor, **resolved_dates)
            series = _fetch_series(cursor, unit=unit, **resolved_dates)
            warnings = _fetch_warnings(cursor)

    return ManagementOverviewResponse(
        unit=unit,
        summary=ManagementOverviewSummary(**summary),
        series=[ManagementOverviewSeriesItem(**row) for row in series],
        warnings=[ManagementWarningItem(**row) for row in warnings],
    )


def get_member_summary(
    *,
    unit: OverviewUnit = "day",
    from_date: date | None = None,
    to_date: date | None = None,
    partner_code: str | None = None,
    product_code: str | None = None,
) -> MemberSummaryResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            resolved_dates = _resolve_member_date_range(cursor, from_date=from_date, to_date=to_date)
            metrics = _fetch_member_summary_metrics(
                cursor,
                **resolved_dates,
                partner_code=partner_code,
                product_code=product_code,
            )
            series = _fetch_member_summary_series(
                cursor,
                unit=unit,
                **resolved_dates,
                partner_code=partner_code,
                product_code=product_code,
            )

    return MemberSummaryResponse(
        unit=unit,
        partner_code=partner_code,
        product_code=product_code,
        metrics=MemberSummaryMetrics(**metrics),
        series=[MemberSummarySeriesItem(**row) for row in series],
    )


def get_member_summary_options() -> MemberSummaryOptionsResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            return _fetch_member_summary_options(cursor)


def get_cubici_integrated_info(
    *,
    unit: OverviewUnit = "day",
    from_date: date | None = None,
    to_date: date | None = None,
    partner_code: str | None = None,
    product_code: str | None = None,
) -> CubiciIntegratedResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            resolved_dates = _resolve_integrated_date_range(
                cursor,
                from_date=from_date,
                to_date=to_date,
            )
            period_rows = _fetch_integrated_period_metrics(
                cursor,
                **resolved_dates,
                partner_code=partner_code,
                product_code=product_code,
            )
            visitor_metric = _fetch_integrated_visitor_metric(
                cursor,
                to_date=resolved_dates["to_date"],
            )
            series = _fetch_integrated_series(
                cursor,
                unit=unit,
                **resolved_dates,
                partner_code=partner_code,
                product_code=product_code,
            )
            channels = _fetch_integrated_channels(
                cursor,
                series=series,
                partner_code=partner_code,
            )
            options = _fetch_member_summary_options(cursor)

    period_map = {row["period_key"]: row for row in period_rows}

    def metric(field: str, *, available: bool = True) -> IntegratedPeriodMetric:
        return IntegratedPeriodMetric(
            today=period_map["today"][field] if available else None,
            current_month=period_map["current_month"][field] if available else None,
            previous_month=period_map["previous_month"][field] if available else None,
            available=available,
        )

    metrics = CubiciIntegratedMetrics(
        standard_date=resolved_dates["to_date"],
        from_date=resolved_dates["from_date"],
        to_date=resolved_dates["to_date"],
        new_members=metric("new_members"),
        withdrawn_members=metric("withdrawn_members"),
        fee_income=metric("fee_income"),
        dormant_members=metric("dormant_members"),
        sales_amount=metric("sales_amount"),
        sales_quantity=metric("sales_quantity"),
        settlement_amount=metric("settlement_amount"),
        sku_count=metric("sku_count"),
        visitor_count=visitor_metric,
        max_concurrent_users=metric("max_concurrent_users", available=False),
        average_usage_minutes=metric("average_usage_minutes", available=False),
        average_shop_count=metric("average_shop_count"),
    )
    return CubiciIntegratedResponse(
        unit=unit,
        partner_code=partner_code,
        product_code=product_code,
        metrics=metrics,
        partners=options.partners,
        products=options.products,
        channels=channels,
        series=[CubiciIntegratedSeriesItem(**row) for row in series],
    )


def list_member_info(
    limit: int,
    offset: int,
    *,
    user_name: str | None = None,
    firm_name: str | None = None,
    user_id: str | None = None,
    use_service: MemberUseService = "all",
    from_date: date | None = None,
    to_date: date | None = None,
    order_by: MemberInfoOrderBy = "reg_date_desc",
) -> MemberInfoListResponse:
    where_clause, filter_params = _build_member_info_filters(
        user_name=user_name,
        firm_name=firm_name,
        user_id=user_id,
        use_service=use_service,
        from_date=from_date,
        to_date=to_date,
    )
    order_clause = {
        "reg_date_asc": "reg_date asc nulls last, user_no asc",
        "name_asc": "user_name asc nulls last, user_no asc",
        "firm_name_asc": "firm_name asc nulls last, user_no asc",
        "shop_count_desc": "shop_count desc, reg_date desc nulls last",
        "reg_date_desc": "reg_date desc nulls last, user_no desc",
    }[order_by]

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            base_query = _member_info_base_query()
            cursor.execute(
                f"""
                with member_base as (
                    {base_query}
                )
                select
                    count(*)::int as total_count,
                    count(*) filter (where service_code = 'cubici')::int as cubici_count,
                    count(*) filter (where service_code = 'moneybank')::int as moneybank_count
                from member_base
                {where_clause}
                """,
                filter_params,
            )
            counts = cursor.fetchone()

            cursor.execute(
                f"""
                with member_base as (
                    {base_query}
                )
                select *
                from member_base
                {where_clause}
                order by {order_clause}
                limit %s offset %s
                """,
                (*filter_params, limit, offset),
            )
            rows = cursor.fetchall()

    return MemberInfoListResponse(
        limit=limit,
        offset=offset,
        counts=MemberInfoCounts(**counts),
        items=[MemberInfoListItem(**row) for row in rows],
    )


def list_member_withdrawals(
    limit: int,
    offset: int,
    *,
    user_name: str | None = None,
    firm_name: str | None = None,
    user_id: str | None = None,
    status: MemberWithdrawalStatus = "all",
    partner_code: str | None = None,
    product_code: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    order_by: MemberWithdrawalOrderBy = "event_date_desc",
) -> MemberWithdrawalListResponse:
    where_clause, filter_params = _build_member_withdrawal_filters(
        user_name=user_name,
        firm_name=firm_name,
        user_id=user_id,
        status=status,
        partner_code=partner_code,
        product_code=product_code,
        from_date=from_date,
        to_date=to_date,
    )
    order_clause = {
        "event_date_asc": "event_date asc nulls last, user_no asc",
        "name_asc": "user_name asc nulls last, event_date desc nulls last",
        "firm_name_asc": "firm_name asc nulls last, event_date desc nulls last",
        "shop_count_desc": "shop_count desc, event_date desc nulls last",
        "event_date_desc": "event_date desc nulls last, user_no desc",
    }[order_by]

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            base_query = _member_withdrawal_base_query()
            cursor.execute(
                f"""
                with withdrawal_base as (
                    {base_query}
                )
                select
                    count(*)::int as total_count,
                    count(*) filter (where withdrawal_status = 'terminated')::int as terminated_count,
                    count(*) filter (where withdrawal_status = 'requested')::int as requested_count,
                    count(*) filter (where withdrawal_status = 'dormant')::int as dormant_count,
                    count(*) filter (where service_code = 'moneybank')::int as moneybank_count,
                    count(*) filter (where service_code = 'cubici')::int as cubici_count
                from withdrawal_base
                {where_clause}
                """,
                filter_params,
            )
            counts = cursor.fetchone()

            cursor.execute(
                f"""
                with withdrawal_base as (
                    {base_query}
                )
                select *
                from withdrawal_base
                {where_clause}
                order by {order_clause}
                limit %s offset %s
                """,
                (*filter_params, limit, offset),
            )
            rows = cursor.fetchall()

    return MemberWithdrawalListResponse(
        limit=limit,
        offset=offset,
        counts=MemberWithdrawalCounts(**counts),
        items=[MemberWithdrawalListItem(**row) for row in rows],
    )


def list_member_payments(
    limit: int,
    offset: int,
    *,
    user_name: str | None = None,
    firm_name: str | None = None,
    user_id: str | None = None,
    user_type: MemberPaymentUserType = "all",
    from_date: date | None = None,
    to_date: date | None = None,
    order_by: MemberPaymentOrderBy = "payment_date_desc",
) -> MemberPaymentListResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            if not _legacy_payment_tables_exist(cursor):
                return MemberPaymentListResponse(
                    limit=limit,
                    offset=offset,
                    counts=MemberPaymentCounts(total_count=0, paid_count=0),
                    sums=MemberPaymentSums(amount=0, payment_fee=0, vat=0, profit=0),
                    items=[],
                )

            where_clause, filter_params = _build_member_payment_filters(
                user_name=user_name,
                firm_name=firm_name,
                user_id=user_id,
                user_type=user_type,
                from_date=from_date,
                to_date=to_date,
            )
            order_clause = {
                "payment_date_asc": "payment_date asc nulls last, seq asc",
                "amount_desc": "amount desc nulls last, payment_date desc nulls last",
                "amount_asc": "amount asc nulls last, payment_date desc nulls last",
                "name_asc": "user_name asc nulls last, payment_date desc nulls last",
                "firm_name_asc": "firm_name asc nulls last, payment_date desc nulls last",
                "payment_date_desc": "payment_date desc nulls last, seq desc",
            }[order_by]
            base_query = _member_payment_base_query()

            cursor.execute(
                f"""
                with payment_base as (
                    {base_query}
                )
                select
                    count(*)::int as total_count,
                    count(*) filter (where payment_date is not null)::int as paid_count
                from payment_base
                {where_clause}
                """,
                filter_params,
            )
            counts = cursor.fetchone()

            cursor.execute(
                f"""
                with payment_base as (
                    {base_query}
                )
                select
                    coalesce(sum(amount), 0)::bigint as amount,
                    coalesce(sum(payment_fee), 0)::bigint as payment_fee,
                    coalesce(sum(vat), 0)::bigint as vat,
                    coalesce(sum(profit), 0)::bigint as profit
                from payment_base
                {where_clause}
                """,
                filter_params,
            )
            sums = cursor.fetchone()

            cursor.execute(
                f"""
                with payment_base as (
                    {base_query}
                ),
                ordered as (
                    select *
                    from payment_base
                    {where_clause}
                    order by {order_clause}
                )
                select
                    row_number() over (order by {order_clause})::int + %s as row_no,
                    *
                from ordered
                limit %s offset %s
                """,
                (*filter_params, offset, limit, offset),
            )
            rows = cursor.fetchall()

    return MemberPaymentListResponse(
        limit=limit,
        offset=offset,
        counts=MemberPaymentCounts(**counts),
        sums=MemberPaymentSums(**sums),
        items=[MemberPaymentListItem(**row) for row in rows],
    )


def list_member_charge_changes(
    limit: int,
    offset: int,
    *,
    division: MemberChargeChangeDivision = "all",
    charge_code: str | None = None,
    user_name: str | None = None,
    firm_name: str | None = None,
    user_id: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    order_by: MemberChargeChangeOrderBy = "payment_date_desc",
) -> MemberChargeChangeListResponse:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            if not _legacy_payment_tables_exist(cursor):
                return MemberChargeChangeListResponse(
                    limit=limit,
                    offset=offset,
                    counts=MemberChargeChangeCounts(total_count=0, change_count=0, termination_count=0, refund_pending_count=0),
                    sums=MemberChargeChangeSums(add_amount=0, refund_amount=0),
                    items=[],
                )

            where_clause, filter_params = _build_member_charge_change_filters(
                division=division,
                charge_code=charge_code,
                user_name=user_name,
                firm_name=firm_name,
                user_id=user_id,
                from_date=from_date,
                to_date=to_date,
            )
            order_clause = {
                "change_date_asc": "change_date asc nulls last, seq asc",
                "change_date_desc": "change_date desc nulls last, seq desc",
                "amount_desc": "amount desc nulls last, change_date desc nulls last",
                "name_asc": "user_name asc nulls last, change_date desc nulls last",
                "firm_name_asc": "firm_name asc nulls last, change_date desc nulls last",
                "payment_date_desc": "payment_date desc nulls last, seq desc",
            }[order_by]
            base_query = _member_charge_change_base_query()

            cursor.execute(
                f"""
                with change_base as (
                    {base_query}
                )
                select
                    count(*)::int as total_count,
                    count(*) filter (where status = '변경')::int as change_count,
                    count(*) filter (where status = '해지')::int as termination_count,
                    count(*) filter (where pay_status = '환급' and refund_date is null)::int as refund_pending_count
                from change_base
                {where_clause}
                """,
                filter_params,
            )
            counts = cursor.fetchone()

            cursor.execute(
                f"""
                with change_base as (
                    {base_query}
                )
                select
                    coalesce(sum(amount) filter (where pay_status = '추가'), 0)::bigint as add_amount,
                    coalesce(sum(amount) filter (where pay_status = '환급'), 0)::bigint as refund_amount
                from change_base
                {where_clause}
                """,
                filter_params,
            )
            sums = cursor.fetchone()

            cursor.execute(
                f"""
                with change_base as (
                    {base_query}
                ),
                ordered as (
                    select *
                    from change_base
                    {where_clause}
                    order by {order_clause}
                )
                select
                    row_number() over (order by {order_clause})::int + %s as row_no,
                    *
                from ordered
                limit %s offset %s
                """,
                (*filter_params, offset, limit, offset),
            )
            rows = cursor.fetchall()

    return MemberChargeChangeListResponse(
        limit=limit,
        offset=offset,
        counts=MemberChargeChangeCounts(**counts),
        sums=MemberChargeChangeSums(**sums),
        items=[MemberChargeChangeListItem(**row) for row in rows],
    )


def get_member_charge_change_refund_detail(seq: int) -> MemberChargeChangeRefundDetail | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            if not _legacy_payment_tables_exist(cursor):
                return None

            cursor.execute(
                """
                select
                    old_bp.status,
                    br.seq,
                    br.new_seq,
                    coalesce(br.user_code, new_bp.user_code, u.email) as user_code,
                    new_bp.rest_date,
                    u.name as user_name,
                    u.biz_name as firm_name,
                    coalesce(nullif(u.phone, ''), '-') as user_phone,
                    old_ch.charge_name as ex_charge_name,
                    coalesce(new_ch.charge_name, '해지') as charge_name,
                    coalesce(round(old_ch.amount * old_ch.period * 1.1), 0)::bigint as ex_amount,
                    coalesce(round(new_ch.amount * new_ch.period * 1.1), 0)::bigint as new_amount,
                    (
                        coalesce(old_bp.payment_base_amount, 0)
                        + coalesce(old_bp.payment_base_vat, 0)
                        + coalesce(br.refund_amount, 0)
                    )::bigint as balance,
                    old_bp.expire_date::date as expire_date,
                    coalesce(br.refund_amount, 0)::bigint as refund_amount,
                    coalesce(nullif(br.refund_card, '')::bigint, 0)::bigint as refund_card,
                    (
                        coalesce(br.refund_amount, 0)
                        + coalesce(nullif(br.refund_card, '')::bigint, 0)
                    )::bigint as refund_cash,
                    br.refund_user_name,
                    br.refund_bank,
                    br.refund_account,
                    old_bp.imp_uid
                from billing_refund br
                left join billing_payment_detail old_bp on old_bp.seq = br.seq
                left join billing_payment_detail new_bp on new_bp.seq = br.new_seq
                left join users u
                  on u.user_no = coalesce(old_bp.user_no, new_bp.user_no, br.user_no)
                  or (
                      coalesce(old_bp.user_no, new_bp.user_no, br.user_no) is null
                      and coalesce(br.user_code, old_bp.user_code, new_bp.user_code) is not null
                      and u.email = coalesce(br.user_code, old_bp.user_code, new_bp.user_code)
                  )
                left join charge old_ch on old_ch.charge_code = old_bp.charge_code
                left join charge new_ch on new_ch.charge_code = new_bp.charge_code
                where br.new_seq = %s
                """,
                (seq,),
            )
            row = cursor.fetchone()

    return MemberChargeChangeRefundDetail(**row) if row else None


def finish_member_charge_change_refund(seq: int, new_seq: int) -> MemberChargeChangeRefundFinishResponse | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            if not _legacy_payment_tables_exist(cursor):
                return None

            cursor.execute(
                """
                update billing_refund
                set refund_date = now(),
                    status = 'C'
                where seq = %s
                  and new_seq = %s
                returning seq, new_seq, status
                """,
                (seq, new_seq),
            )
            refund = cursor.fetchone()
            if refund is None:
                connection.rollback()
                return None

            cursor.execute(
                """
                update billing_payment_detail
                set status = case when status = 'RR' then 'RC' else 'CC' end,
                    upd_datetime = now()
                where seq = %s
                returning status
                """,
                (new_seq,),
            )
            payment = cursor.fetchone()
            connection.commit()

    return MemberChargeChangeRefundFinishResponse(
        seq=refund["seq"],
        new_seq=refund["new_seq"],
        refund_status=refund["status"],
        payment_status=payment["status"] if payment else None,
    )


def get_member_status_detail(user_no: int) -> MemberStatusDetailResponse | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select
                    u.user_no,
                    case when coalesce(contract_stats.moneybank_contract_count, 0) > 0 then '머니뱅크' else '큐빅아이' end as status_label,
                    u.name as user_name,
                    u.email as user_id,
                    u.phone,
                    u.biz_name as firm_name,
                    u.biz_num as business_no,
                    u.biz_setup_date,
                    u.biz_type,
                    u.sectors,
                    u.zip_code,
                    u.address,
                    u.reg_date::date as reg_date,
                    u.last_login_date,
                    nullif(u.partner_code, '') as partner_code,
                    coalesce(shop_stats.shop_count, 0)::int as shop_count,
                    coalesce(contract_stats.moneybank_contract_count, 0)::int as moneybank_contract_count
                from users u
                left join (
                    select user_no, count(*)::int as shop_count
                    from shop_accounts
                    where coalesce(del_yn, 'N') <> 'Y'
                    group by user_no
                ) shop_stats on shop_stats.user_no = u.user_no
                left join (
                    select user_no, count(*)::int as moneybank_contract_count
                    from moneybank_contract
                    group by user_no
                ) contract_stats on contract_stats.user_no = u.user_no
                where u.user_no = %s
                """,
                (user_no,),
            )
            user = cursor.fetchone()
            if user is None:
                return None

            cursor.execute(
                """
                select id, shop_type, shop_id, status, settlement, reg_date
                from shop_accounts
                where user_no = %s
                  and coalesce(del_yn, 'N') <> 'Y'
                order by reg_date desc nulls last, id desc
                """,
                (user_no,),
            )
            shops = cursor.fetchall()

            cursor.execute(
                """
                select
                    f.mbid,
                    f.payment_rate,
                    avg(r.fee_rate)::float as average_fee_rate,
                    f.sales_limit_per_order,
                    f.max_outstanding_balance,
                    f.reg_date
                from moneybank_contract_fee f
                join moneybank_contract c on c.mbid = f.mbid
                left join moneybank_contract_fee_rates r on r.contract_fee_id = f.id
                where c.user_no = %s
                group by
                    f.id,
                    f.mbid,
                    f.payment_rate,
                    f.sales_limit_per_order,
                    f.max_outstanding_balance,
                    f.reg_date
                order by f.reg_date desc nulls last, f.id desc
                """,
                (user_no,),
            )
            fees = cursor.fetchall()

            cursor.execute(
                """
                with latest_history as (
                    select distinct on (mbid)
                        mbid,
                        cumulative_provision_amount,
                        cumulative_repayment_amount,
                        outstanding_balance
                    from moneybank_redemption_history
                    order by mbid, reg_date desc nulls last, id desc
                ),
                latest_fee as (
                    select distinct on (f.mbid)
                        f.mbid,
                        f.payment_rate,
                        avg(r.fee_rate)::float as fee_rate
                    from moneybank_contract_fee f
                    left join moneybank_contract_fee_rates r on r.contract_fee_id = f.id
                    group by f.id, f.mbid, f.payment_rate, f.reg_date
                    order by f.mbid, f.reg_date desc nulls last, f.id desc
                ),
                cert as (
                    select distinct on (mbid)
                        mbid,
                        expiration_date
                    from moneybank_contract_certificate
                    where user_no = %s
                    order by mbid, reg_date desc nulls last
                )
                select
                    c.mbid,
                    c.status,
                    c.product_code,
                    c.request_date::date as request_date,
                    c.approval_date::date as approval_date,
                    c.contract_date::date as contract_date,
                    c.expire_date::date as expire_date,
                    c.sales_amount,
                    coalesce(h.outstanding_balance, 0)::bigint as outstanding_balance,
                    coalesce(h.cumulative_provision_amount, 0)::bigint as cumulative_provision_amount,
                    coalesce(h.cumulative_repayment_amount, 0)::bigint as cumulative_repayment_amount,
                    lf.fee_rate,
                    lf.payment_rate,
                    d.cb_check::text as cb_check,
                    d.national_tax_full_payment::text as national_tax_full_payment,
                    d.local_tax_full_payment::text as local_tax_full_payment,
                    d.health_insurance_full_payment::text as health_insurance_full_payment,
                    cert.expiration_date as certificate_expiration_date
                from moneybank_contract c
                left join latest_history h on h.mbid = c.mbid
                left join latest_fee lf on lf.mbid = c.mbid
                left join moneybank_contract_document d on d.mbid = c.mbid
                left join cert on cert.mbid = c.mbid
                where c.user_no = %s
                order by c.request_date desc nulls last, c.mbid desc
                """,
                (user_no, user_no),
            )
            contracts = cursor.fetchall()

            cursor.execute(
                """
                select
                    h.id,
                    h.mbid,
                    h.cumulative_provision_amount,
                    h.cumulative_repayment_amount,
                    h.outstanding_balance,
                    h.reg_date
                from moneybank_redemption_history h
                join moneybank_contract c on c.mbid = h.mbid
                where c.user_no = %s
                order by h.reg_date desc nulls last, h.id desc
                limit 20
                """,
                (user_no,),
            )
            redemption_history = cursor.fetchall()

    return MemberStatusDetailResponse(
        user=MemberStatusUser(**user),
        shops=[MemberStatusShopItem(**row) for row in shops],
        fees=[MemberStatusFeeItem(**row) for row in fees],
        contracts=[MemberStatusContractItem(**row) for row in contracts],
        redemption_history=[MemberStatusRedemptionItem(**row) for row in redemption_history],
    )


def list_management_usage(
    limit: int,
    offset: int,
    *,
    user_name: str | None = None,
    firm_name: str | None = None,
    user_email: str | None = None,
    product_code: str | None = None,
    status: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    order_by: Literal["request_date_desc", "request_date_asc"] = "request_date_desc",
) -> ManagementUsageListResponse:
    where_clause, filter_params = _build_usage_filters(
        user_name=user_name,
        firm_name=firm_name,
        user_email=user_email,
        product_code=product_code,
        status=status,
        from_date=from_date,
        to_date=to_date,
    )
    order_clause = "request_date asc nulls last, mbid asc" if order_by == "request_date_asc" else "request_date desc nulls last, mbid desc"

    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            usage_query = _usage_base_query()
            cursor.execute(
                f"""
                with usage_base as (
                    {usage_query}
                )
                select
                    count(*)::int as total,
                    count(*) filter (where usage_status = '신청')::int as request_count,
                    count(*) filter (where usage_status = '심사')::int as review_count,
                    count(*) filter (where usage_status = '거부')::int as rejected_count,
                    count(*) filter (where usage_status = '상환')::int as repayment_count,
                    count(*) filter (where usage_status = '만료')::int as expired_count
                from usage_base
                {where_clause}
                """,
                filter_params,
            )
            counts = cursor.fetchone()

            cursor.execute(
                f"""
                with usage_base as (
                    {usage_query}
                )
                select
                    coalesce(sum(sales_amount), 0)::bigint as sales_amount,
                    coalesce(sum(provision_amount), 0)::bigint as provision_amount,
                    coalesce(sum(repayment_amount), 0)::bigint as repayment_amount,
                    coalesce(sum(outstanding_balance), 0)::bigint as outstanding_balance
                from usage_base
                {where_clause}
                """,
                filter_params,
            )
            sums = cursor.fetchone()

            cursor.execute(
                f"""
                with usage_base as (
                    {usage_query}
                )
                select *
                from usage_base
                {where_clause}
                order by {order_clause}
                limit %s offset %s
                """,
                (*filter_params, limit, offset),
            )
            rows = cursor.fetchall()

    return ManagementUsageListResponse(
        limit=limit,
        offset=offset,
        total=counts["total"],
        counts=ManagementUsageCounts(**counts),
        sums=ManagementUsageSums(**sums),
        items=[ManagementUsageListItem(**row) for row in rows],
    )


def get_management_usage_detail(mbid: str) -> ManagementUsageDetailResponse | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                f"""
                with usage_base as (
                    {_usage_base_query()}
                )
                select *
                from usage_base
                where mbid = %s
                """,
                (mbid,),
            )
            usage = cursor.fetchone()
            if usage is None:
                return None

            cursor.execute(
                """
                select
                    u.user_no,
                    u.email as user_email,
                    u.name as user_name,
                    u.phone,
                    u.biz_name as firm_name,
                    u.biz_num,
                    u.biz_setup_date,
                    u.biz_type,
                    u.sectors,
                    u.zip_code,
                    u.address,
                    u.reg_date as user_reg_date
                from moneybank_contract c
                left join users u on u.user_no = c.user_no
                where c.mbid = %s
                """,
                (mbid,),
            )
            user = cursor.fetchone()

            cursor.execute(
                """
                select
                    id,
                    contract_shop_type as shop_type,
                    contract_shop_id as shop_id,
                    reg_date
                from moneybank_contract_shop
                where mbid = %s
                order by id
                """,
                (mbid,),
            )
            shops = cursor.fetchall()

            cursor.execute(
                """
                select
                    d.mbid,
                    d.business_no,
                    d.cb_check,
                    d.national_tax_full_payment,
                    d.local_tax_full_payment,
                    d.health_insurance_full_payment,
                    d.health_insurance_paid_amount,
                    d.final_confirm_admin,
                    coalesce(f.file_count, 0)::int as file_count
                from moneybank_contract_document d
                left join (
                    select file_division_pk as mbid, count(*)::int as file_count
                    from "CBCI_FILE"
                    group by file_division_pk
                ) f on f.mbid = d.mbid
                where d.mbid = %s
                """,
                (mbid,),
            )
            document = cursor.fetchone()

            cursor.execute(
                """
                with fee_latest as (
                    select
                        latest_fee.mbid,
                        avg(r.fee_rate)::float as fee_rate
                    from (
                        select distinct on (mbid)
                            id,
                            mbid
                        from moneybank_contract_fee
                        order by mbid, id desc
                    ) latest_fee
                    left join moneybank_contract_fee_rates r on r.contract_fee_id = latest_fee.id
                    group by latest_fee.mbid
                ),
                pcs_latest as (
                    select distinct on (mbid, user_no)
                        mbid,
                        user_no,
                        prizm_grade
                    from prizm_pcs_result
                    order by mbid, user_no, reg_date desc nulls last, pcs_no desc
                ),
                pms_latest as (
                    select distinct on (mbid, user_no)
                        mbid,
                        user_no,
                        pms_grade
                    from prizm_pms_result
                    order by mbid, user_no, reg_date desc nulls last, pms_no desc
                ),
                provision as (
                    select mbid, coalesce(sum(total_provision_amount), 0)::bigint as provision_amount
                    from moneybank_redemption_provision
                    group by mbid
                )
                select
                    c.mbid,
                    c.contract_date::date,
                    c.product_code,
                    coalesce(p.provision_amount, 0)::bigint as provision_amount,
                    coalesce(c.cancel_request_date::date, c.expire_date::date) as expire_date,
                    case
                        when c.contract_date is null then null
                        else (coalesce(c.cancel_request_date::date, c.expire_date::date, current_date) - c.contract_date::date)::int
                    end as service_days,
                    fee.fee_rate,
                    pcs.prizm_grade,
                    pms.pms_grade
                from moneybank_contract c
                left join fee_latest fee on fee.mbid = c.mbid
                left join provision p on p.mbid = c.mbid
                left join pcs_latest pcs on pcs.mbid = c.mbid and pcs.user_no is not distinct from c.user_no
                left join pms_latest pms on pms.mbid = c.mbid and pms.user_no is not distinct from c.user_no
                where c.user_no = (
                    select user_no from moneybank_contract where mbid = %s
                )
                order by c.contract_date desc nulls last, c.request_date desc nulls last
                """,
                (mbid,),
            )
            contract_history = cursor.fetchall()

            cursor.execute(
                """
                select
                    id,
                    mbid,
                    cumulative_provision_amount,
                    cumulative_repayment_amount,
                    outstanding_balance,
                    reg_date
                from moneybank_redemption_history
                where mbid = %s
                order by reg_date desc nulls last, id desc
                limit 20
                """,
                (mbid,),
            )
            redemption_history = cursor.fetchall()

    return ManagementUsageDetailResponse(
        mbid=mbid,
        usage=ManagementUsageListItem(**usage),
        user=ManagementUsageUserDetail(**user),
        shops=[ManagementUsageShopItem(**row) for row in shops],
        document=ManagementUsageDocumentDetail(**document) if document else None,
        contract_history=[ManagementUsageHistoryItem(**row) for row in contract_history],
        redemption_history=[ManagementUsageRedemptionHistoryItem(**row) for row in redemption_history],
    )


def _build_usage_filters(
    *,
    user_name: str | None,
    firm_name: str | None,
    user_email: str | None,
    product_code: str | None,
    status: str | None,
    from_date: date | None,
    to_date: date | None,
) -> tuple[str, list[object]]:
    clauses = []
    params: list[object] = []

    if user_name:
        clauses.append("user_name ilike %s")
        params.append(f"%{user_name}%")
    if firm_name:
        clauses.append("firm_name ilike %s")
        params.append(f"%{firm_name}%")
    if user_email:
        clauses.append("user_email ilike %s")
        params.append(f"%{user_email}%")
    if product_code:
        clauses.append("product_code = %s")
        params.append(product_code)
    if status:
        clauses.append("usage_status = %s")
        params.append(_normalize_usage_status(status))
    if from_date:
        clauses.append("request_date >= %s")
        params.append(from_date)
    if to_date:
        clauses.append("request_date <= %s")
        params.append(to_date)

    if not clauses:
        return "", params

    return " where " + " and ".join(clauses), params


def _normalize_usage_status(status: str) -> str:
    status_map = {
        "approval": "신청",
        "judge": "심사",
        "repayment": "상환",
        "refuse": "거부",
        "expire": "만료",
    }
    return status_map.get(status, status)


def _usage_base_query() -> str:
    return """
        select
            c.mbid,
            c.status,
            case
                when c.status in ('SELF_TERMINATION', 'FORCE_TERMINATION', 'ACCOUNT_CLOSED', 'TERMINATION', 'EXPIRED', '72', '73', '82') then '만료'
                when c.status in ('REJECTED', 'REJECT') then '거부'
                when coalesce(h.outstanding_balance, 0) > 0 then '상환'
                when c.status = 'CONTRACT' then '상환'
                when c.status = 'JOIN' then '심사'
                else '신청'
            end as usage_status,
            c.request_date::date as request_date,
            c.contract_date::date as contract_date,
            c.expire_date::date as expire_date,
            c.user_no,
            u.email as user_email,
            u.name as user_name,
            u.biz_name as firm_name,
            c.product_code,
            f.fintech_name,
            fee.latest_fee_rate as fee_rate,
            fee.payment_rate,
            c.sales_amount,
            coalesce(h.cumulative_provision_amount, 0)::bigint as provision_amount,
            coalesce(h.cumulative_repayment_amount, 0)::bigint as repayment_amount,
            coalesce(h.outstanding_balance, 0)::bigint as outstanding_balance,
            pcs.prizm_grade,
            pcs.prizm_score
        from moneybank_contract c
        left join users u on u.user_no = c.user_no
        left join fintech f on f.id = c.fintech_id
        left join (
            select
                latest_fee.mbid,
                latest_fee.payment_rate,
                avg(r.fee_rate)::float as latest_fee_rate
            from (
                select distinct on (mbid)
                    id,
                    mbid,
                    payment_rate
                from moneybank_contract_fee
                order by mbid, id desc
            ) latest_fee
            left join moneybank_contract_fee_rates r on r.contract_fee_id = latest_fee.id
            group by latest_fee.mbid, latest_fee.payment_rate
        ) fee on fee.mbid = c.mbid
        left join (
            select distinct on (mbid)
                mbid,
                cumulative_provision_amount,
                cumulative_repayment_amount,
                outstanding_balance,
                reg_date
            from moneybank_redemption_history
            order by mbid, reg_date desc nulls last, id desc
        ) h on h.mbid = c.mbid
        left join (
            select distinct on (mbid, user_no)
                mbid,
                user_no,
                prizm_grade,
                prizm_score
            from prizm_pcs_result
            order by mbid, user_no, reg_date desc nulls last, pcs_no desc
        ) pcs on pcs.mbid = c.mbid and pcs.user_no is not distinct from c.user_no
    """


def _resolve_date_range(cursor, *, from_date: date | None, to_date: date | None) -> dict[str, date | None]:
    cursor.execute(
        """
        select greatest(
            coalesce((select max(request_date)::date from moneybank_contract), date '1900-01-01'),
            coalesce((select max(approval_date)::date from moneybank_contract), date '1900-01-01'),
            coalesce((select max(provision_date)::date from moneybank_redemption_provision), date '1900-01-01'),
            coalesce((select max(coalesce(balance_provision_date, reg_date, modified_date))::date from moneybank_redemption_repayment), date '1900-01-01'),
            coalesce((select max(reg_date)::date from moneybank_redemption_history), date '1900-01-01'),
            coalesce((select max(settlement_date)::date from settlement), date '1900-01-01')
        ) as max_date
        """
    )
    max_date = cursor.fetchone()["max_date"]
    if max_date.year == 1900:
        max_date = None

    end_date = to_date or max_date
    start_date = from_date
    if start_date is None and end_date is not None:
        cursor.execute("select (%s::date - interval '30 days')::date as from_date", (end_date,))
        start_date = cursor.fetchone()["from_date"]

    return {"from_date": start_date, "to_date": end_date}


def _member_info_base_query() -> str:
    return """
        select
            u.user_no,
            case when coalesce(contract_stats.moneybank_contract_count, 0) > 0 then '머니뱅크' else '큐빅아이' end as service_label,
            case when coalesce(contract_stats.moneybank_contract_count, 0) > 0 then 'moneybank' else 'cubici' end as service_code,
            u.reg_date::date as reg_date,
            u.email as user_id,
            u.name as user_name,
            u.biz_name as firm_name,
            coalesce(nullif(u.phone, ''), '-') as phone,
            '-'::text as firm_tel,
            coalesce(shop_stats.shop_count, 0)::int as shop_count,
            u.address,
            nullif(u.partner_code, '') as partner_code,
            coalesce(contract_stats.moneybank_contract_count, 0)::int as moneybank_contract_count,
            contract_stats.latest_contract_status
        from users u
        left join (
            select user_no, count(*)::int as shop_count
            from shop_accounts
            where coalesce(del_yn, 'N') <> 'Y'
            group by user_no
        ) shop_stats on shop_stats.user_no = u.user_no
        left join (
            select
                user_no,
                count(*)::int as moneybank_contract_count,
                (array_agg(status order by request_date desc nulls last, mbid desc))[1] as latest_contract_status
            from moneybank_contract
            group by user_no
        ) contract_stats on contract_stats.user_no = u.user_no
        where u.user_type = 'USER'
    """


def _member_payment_base_query() -> str:
    return """
        select
            bp.seq,
            ch.charge_name,
            u.reg_date,
            u.email as user_id,
            u.name as user_name,
            u.biz_name as firm_name,
            coalesce(nullif(u.phone, ''), '-') as user_phone,
            '-'::text as firm_tel,
            coalesce(shop_stats.shop_count, 0)::int as shop_count,
            u.address as firm_addr,
            bp.expire_date,
            bp.payment_date,
            bp.status as payment_status,
            case
                when bp.status in ('RC', 'CC') then '취소완료'
                when bp.status in ('RR') then '환급대기'
                when bp.status in ('R') then '환급요청'
                when bp.status in ('C') then '취소'
                when bp.status in ('P', 'Y', 'PAID') or bp.status is null then '결제'
                else bp.status
            end as payment_status_label,
            bp.amount,
            trunc(coalesce(bp.amount, 0)::numeric * 0.032)::bigint as payment_fee,
            trunc(coalesce(bp.amount, 0)::numeric / 11)::bigint as vat,
            (
                coalesce(bp.amount, 0)
                - trunc(coalesce(bp.amount, 0)::numeric * 0.032)::bigint
                - trunc(coalesce(bp.amount, 0)::numeric / 11)::bigint
            )::bigint as profit,
            u.user_type
        from billing_payment_detail bp
        left join charge ch
          on ch.charge_code = coalesce(nullif(bp.charge_code, 'withdraw'), bp.ex_charge_code)
        left join users u
          on u.user_no = bp.user_no
          or (bp.user_no is null and bp.user_code is not null and u.email = bp.user_code)
        left join (
            select user_no, count(*)::int as shop_count
            from shop_accounts
            where coalesce(del_yn, 'N') <> 'Y'
            group by user_no
        ) shop_stats on shop_stats.user_no = u.user_no
        where bp.pg_id is not null
    """


def _member_charge_change_base_query() -> str:
    return """
        select
            bp.seq,
            case
                when br.refund_type is null then '변경'
                when br.refund_type = 'C' then '변경'
                else '해지'
            end as status,
            coalesce(ch.charge_name, '') as charge_name,
            bp.start_date::date as start_date,
            u.email as user_id,
            u.name as user_name,
            u.biz_name as firm_name,
            coalesce(bp.user_code, br.user_code, u.email) as user_code,
            coalesce(nullif(u.phone, ''), '-') as user_phone,
            '-'::text as firm_tel,
            coalesce(shop_stats.shop_count, 0)::int as shop_count,
            u.address as firm_addr,
            coalesce(bp.cancel_date, bp.change_date)::date as change_date,
            old_ch.charge_name as before_charge,
            case when br.refund_type is null then '추가' else '환급' end as pay_status,
            coalesce(br.refund_amount, bp.amount, 0)::bigint as amount,
            br.refund_amount,
            br.refund_card,
            br.refund_user_name,
            br.refund_bank,
            br.refund_account,
            bp.imp_uid,
            bp.status as payment_status,
            br.status as refund_status,
            case
                when br.id is null then '해당없음'
                when br.status = 'C' or br.refund_date is not null then '환급완료'
                when br.status in ('R', 'RR') then '환급대기'
                else coalesce(br.status, '환급대기')
            end as refund_status_label,
            br.refund_date::date,
            bp.payment_date,
            br.refund_type,
            bp.charge_code
        from billing_payment_detail bp
        left join billing_refund br on bp.seq = br.new_seq
        left join billing_payment_detail old_bp on old_bp.seq = br.seq
        left join charge ch on ch.charge_code = bp.charge_code
        left join charge old_ch on old_ch.charge_code = old_bp.charge_code
        left join users u
          on u.user_no = coalesce(bp.user_no, br.user_no)
          or (
              coalesce(bp.user_no, br.user_no) is null
              and coalesce(bp.user_code, br.user_code) is not null
              and u.email = coalesce(bp.user_code, br.user_code)
          )
        left join (
            select user_no, count(*)::int as shop_count
            from shop_accounts
            where coalesce(del_yn, 'N') <> 'Y'
            group by user_no
        ) shop_stats on shop_stats.user_no = u.user_no
        where coalesce(bp.charge_code, '') not like '%%F%%'
          and (bp.change_date is not null or bp.cancel_date is not null or br.id is not null)
    """


def _member_withdrawal_base_query() -> str:
    return """
        with shop_stats as (
            select user_no, count(*)::int as shop_count
            from shop_accounts
            where coalesce(del_yn, 'N') <> 'Y'
            group by user_no
        ),
        latest_history as (
            select distinct on (mbid)
                mbid,
                outstanding_balance
            from moneybank_redemption_history
            order by mbid, reg_date desc nulls last, id desc
        ),
        moneybank_withdrawals as (
            select
                u.user_no,
                '머니뱅크'::text as service_label,
                'moneybank'::text as service_code,
                case
                    when c.status in ('SELF_TERMINATION', 'FORCE_TERMINATION', 'ACCOUNT_CLOSED', '72', '73', '82') then 'terminated'
                    when c.cancel_request_date is not null then 'requested'
                    else 'dormant'
                end as withdrawal_status,
                case
                    when c.status in ('SELF_TERMINATION', '72') then '해지'
                    when c.status in ('FORCE_TERMINATION', '73') then '강제해지'
                    when c.status in ('ACCOUNT_CLOSED', '82') then '계좌해지'
                    when c.cancel_request_date is not null then '해지 신청'
                    else '휴면 후보'
                end as withdrawal_status_label,
                c.cancel_request_date::date as withdrawal_request_date,
                case
                    when c.status in ('SELF_TERMINATION', 'FORCE_TERMINATION', 'ACCOUNT_CLOSED', '72', '73', '82')
                    then coalesce(c.modified_date, c.cancel_request_date, c.request_date)::date
                end as withdrawal_date,
                coalesce(c.cancel_request_date, c.modified_date, c.request_date, u.last_login_date, u.reg_date)::date as event_date,
                u.name as user_name,
                u.biz_name as firm_name,
                u.email as user_id,
                coalesce(nullif(u.phone, ''), '-') as phone,
                coalesce(s.shop_count, 0)::int as shop_count,
                coalesce(h.outstanding_balance, 0)::bigint as outstanding_balance,
                c.product_code,
                c.status as latest_contract_status,
                u.last_login_date,
                nullif(u.partner_code, '') as partner_code
            from moneybank_contract c
            left join users u on u.user_no = c.user_no
            left join shop_stats s on s.user_no = u.user_no
            left join latest_history h on h.mbid = c.mbid
            where c.status in ('SELF_TERMINATION', 'FORCE_TERMINATION', 'ACCOUNT_CLOSED', '72', '73', '82')
               or c.cancel_request_date is not null
        ),
        dormant_users as (
            select
                u.user_no,
                '큐빅아이'::text as service_label,
                'cubici'::text as service_code,
                'dormant'::text as withdrawal_status,
                '휴면 후보'::text as withdrawal_status_label,
                null::date as withdrawal_request_date,
                null::date as withdrawal_date,
                coalesce(u.last_login_date, u.reg_date)::date as event_date,
                u.name as user_name,
                u.biz_name as firm_name,
                u.email as user_id,
                coalesce(nullif(u.phone, ''), '-') as phone,
                coalesce(s.shop_count, 0)::int as shop_count,
                0::bigint as outstanding_balance,
                null::text as product_code,
                null::text as latest_contract_status,
                u.last_login_date,
                nullif(u.partner_code, '') as partner_code
            from users u
            left join shop_stats s on s.user_no = u.user_no
            where u.user_type = 'USER'
              and coalesce(u.last_login_date, u.reg_date) < (current_date - interval '365 days')
              and not exists (
                  select 1
                  from moneybank_contract c
                  where c.user_no = u.user_no
                    and (c.status in ('SELF_TERMINATION', 'FORCE_TERMINATION', 'ACCOUNT_CLOSED', '72', '73', '82') or c.cancel_request_date is not null)
              )
        )
        select * from moneybank_withdrawals
        union all
        select * from dormant_users
    """


def _legacy_payment_tables_exist(cursor) -> bool:
    cursor.execute("select to_regclass('public.billing_payment_detail') is not null as exists")
    return bool(cursor.fetchone()["exists"])


def _build_member_charge_change_filters(
    *,
    division: MemberChargeChangeDivision,
    charge_code: str | None,
    user_name: str | None,
    firm_name: str | None,
    user_id: str | None,
    from_date: date | None,
    to_date: date | None,
) -> tuple[str, tuple[object, ...]]:
    clauses: list[str] = []
    params: list[object] = []

    if division != "all":
        clauses.append("refund_type = %s")
        params.append(division)
    if charge_code:
        clauses.append("charge_code = %s")
        params.append(charge_code)
    if user_name:
        clauses.append("user_name ilike %s")
        params.append(f"%{user_name}%")
    if firm_name:
        clauses.append("firm_name ilike %s")
        params.append(f"%{firm_name}%")
    if user_id:
        clauses.append("user_id ilike %s")
        params.append(f"%{user_id}%")
    if from_date is not None:
        clauses.append("change_date >= %s")
        params.append(from_date)
    if to_date is not None:
        clauses.append("change_date <= %s")
        params.append(to_date)

    if not clauses:
        return "", tuple()
    return "where " + " and ".join(clauses), tuple(params)


def _build_member_payment_filters(
    *,
    user_name: str | None,
    firm_name: str | None,
    user_id: str | None,
    user_type: MemberPaymentUserType,
    from_date: date | None,
    to_date: date | None,
) -> tuple[str, tuple[object, ...]]:
    clauses: list[str] = []
    params: list[object] = []

    if user_name:
        clauses.append("user_name ilike %s")
        params.append(f"%{user_name}%")
    if firm_name:
        clauses.append("firm_name ilike %s")
        params.append(f"%{firm_name}%")
    if user_id:
        clauses.append("user_id ilike %s")
        params.append(f"%{user_id}%")
    if user_type != "all":
        clauses.append("user_type = %s")
        params.append(user_type)
    if from_date is not None:
        clauses.append("payment_date::date >= %s")
        params.append(from_date)
    if to_date is not None:
        clauses.append("payment_date::date <= %s")
        params.append(to_date)

    if not clauses:
        return "", tuple()
    return "where " + " and ".join(clauses), tuple(params)


def _build_member_withdrawal_filters(
    *,
    user_name: str | None,
    firm_name: str | None,
    user_id: str | None,
    status: MemberWithdrawalStatus,
    partner_code: str | None,
    product_code: str | None,
    from_date: date | None,
    to_date: date | None,
) -> tuple[str, tuple[object, ...]]:
    clauses: list[str] = []
    params: list[object] = []

    if user_name:
        clauses.append("user_name ilike %s")
        params.append(f"%{user_name}%")
    if firm_name:
        clauses.append("firm_name ilike %s")
        params.append(f"%{firm_name}%")
    if user_id:
        clauses.append("user_id ilike %s")
        params.append(f"%{user_id}%")
    if status != "all":
        clauses.append("withdrawal_status = %s")
        params.append(status)
    if partner_code:
        clauses.append("partner_code = %s")
        params.append(partner_code)
    if product_code:
        clauses.append("product_code = %s")
        params.append(product_code)
    if from_date is not None:
        clauses.append("event_date >= %s")
        params.append(from_date)
    if to_date is not None:
        clauses.append("event_date <= %s")
        params.append(to_date)

    if not clauses:
        return "", tuple()
    return "where " + " and ".join(clauses), tuple(params)


def _build_member_info_filters(
    *,
    user_name: str | None,
    firm_name: str | None,
    user_id: str | None,
    use_service: MemberUseService,
    from_date: date | None,
    to_date: date | None,
) -> tuple[str, tuple[object, ...]]:
    clauses: list[str] = []
    params: list[object] = []

    if user_name:
        clauses.append("user_name ilike %s")
        params.append(f"%{user_name}%")
    if firm_name:
        clauses.append("firm_name ilike %s")
        params.append(f"%{firm_name}%")
    if user_id:
        clauses.append("user_id ilike %s")
        params.append(f"%{user_id}%")
    if use_service != "all":
        clauses.append("service_code = %s")
        params.append(use_service)
    if from_date is not None:
        clauses.append("reg_date >= %s")
        params.append(from_date)
    if to_date is not None:
        clauses.append("reg_date <= %s")
        params.append(to_date)

    if not clauses:
        return "", tuple()
    return "where " + " and ".join(clauses), tuple(params)


def _fetch_member_summary_options(cursor) -> MemberSummaryOptionsResponse:
    cursor.execute(
        """
        select
            partner_code as value,
            coalesce(nullif(partner_name, ''), partner_code) as label
        from partner
        where nullif(partner_code, '') is not null
        order by label, value
        """
    )
    partners = cursor.fetchall()
    cursor.execute(
        """
        select product_code as value, product_code as label
        from moneybank_contract
        where nullif(product_code, '') is not null
        group by product_code
        order by product_code
        """
    )
    products = cursor.fetchall()
    return MemberSummaryOptionsResponse(
        partners=[MemberSummaryOption(**row) for row in partners],
        products=[MemberSummaryOption(**row) for row in products],
    )


def _resolve_integrated_date_range(
    cursor,
    *,
    from_date: date | None,
    to_date: date | None,
) -> dict[str, date]:
    cursor.execute(
        """
        select nullif(
            greatest(
                coalesce((select max(reg_date)::date from users where user_type = 'USER'), date '1900-01-01'),
                coalesce((select max(paid_date)::date from sale), date '1900-01-01'),
                coalesce((select max(settlement_date)::date from settlement), date '1900-01-01'),
                coalesce((select max(reg_date)::date from shop_accounts), date '1900-01-01'),
                coalesce((select max(payment_date)::date from billing_payment_detail), date '1900-01-01')
            ),
            date '1900-01-01'
        ) as max_date
        """
    )
    max_date = cursor.fetchone()["max_date"] or date.today()
    end_date = to_date or max_date
    start_date = from_date or (end_date - timedelta(days=30))
    return {"from_date": start_date, "to_date": end_date}


def _integrated_eligibility_ctes(
    *,
    partner_code: str | None,
    product_code: str | None,
) -> tuple[str, tuple[object, ...]]:
    user_clauses = ["u.user_type = 'USER'"]
    user_params: list[object] = []
    if partner_code:
        user_clauses.append("nullif(u.partner_code, '') = %s")
        user_params.append(partner_code)
    if product_code:
        user_clauses.append(
            "exists (select 1 from moneybank_contract filter_contract "
            "where filter_contract.user_no = u.user_no and filter_contract.product_code = %s)"
        )
        user_params.append(product_code)

    contract_filter = ""
    contract_params: list[object] = []
    if product_code:
        contract_filter = "where c.product_code = %s"
        contract_params.append(product_code)

    ctes = f"""
        eligible_users as (
            select u.*
            from users u
            where {' and '.join(user_clauses)}
        ),
        eligible_contracts as (
            select c.*
            from moneybank_contract c
            join eligible_users u on u.user_no = c.user_no
            {contract_filter}
        ),
        eligible_sales as (
            select distinct s.*
            from sale s
            join shop_accounts sa
              on upper(sa.shop_type) = upper(s.shop_type)
             and sa.shop_id = s.shop_id
             and coalesce(sa.del_yn, 'N') <> 'Y'
            join eligible_users u on u.user_no = sa.user_no
        ),
        eligible_settlements as (
            select distinct st.*
            from settlement st
            join shop_accounts sa
              on upper(sa.shop_type) = upper(st.shop_type)
             and sa.shop_id = st.shop_id
             and coalesce(sa.del_yn, 'N') <> 'Y'
            join eligible_users u on u.user_no = sa.user_no
        )
    """
    return ctes, (*user_params, *contract_params)


def _fetch_integrated_period_metrics(
    cursor,
    *,
    from_date: date,
    to_date: date,
    partner_code: str | None,
    product_code: str | None,
) -> list[dict]:
    current_month_start = to_date.replace(day=1)
    previous_month_end = current_month_start - timedelta(days=1)
    previous_month_start = previous_month_end.replace(day=1)
    eligibility_ctes, eligibility_params = _integrated_eligibility_ctes(
        partner_code=partner_code,
        product_code=product_code,
    )
    cursor.execute(
        f"""
        with periods(period_key, start_date, end_date) as (
            values
                ('today', %s::date, %s::date),
                ('current_month', %s::date, %s::date),
                ('previous_month', %s::date, %s::date)
        ),
        {eligibility_ctes}
        select
            p.period_key,
            (select count(*) from eligible_users u
             where u.reg_date::date between p.start_date and p.end_date)::int as new_members,
            (select count(*) from eligible_contracts c
             where c.status in ('SELF_TERMINATION', 'FORCE_TERMINATION', 'ACCOUNT_CLOSED', 'TERMINATION', 'EXPIRED', '72', '73', '82')
               and coalesce(c.cancel_request_date, c.modified_date, c.request_date)::date between p.start_date and p.end_date
            )::int as withdrawn_members,
            coalesce((select sum(coalesce(bp.amount, 0)) from billing_payment_detail bp
             join eligible_users u on u.user_no = bp.user_no
             where bp.pg_id is not null
               and (bp.status in ('P', 'Y', 'PAID') or bp.status is null)
               and bp.payment_date::date between p.start_date and p.end_date), 0)::bigint as fee_income,
            (select count(*) from eligible_users u
             where (coalesce(u.last_login_date, u.reg_date) + interval '365 days')::date
                   between p.start_date and p.end_date)::int as dormant_members,
            coalesce((select sum(coalesce(s.payment_amount, s.sales_amount, 0)) from eligible_sales s
             where s.paid_date::date between p.start_date and p.end_date), 0)::bigint as sales_amount,
            coalesce((select sum(coalesce(s.quantity, 0)) from eligible_sales s
             where s.paid_date::date between p.start_date and p.end_date), 0)::bigint as sales_quantity,
            coalesce((select sum(coalesce(st.settlement_amount, 0)) from eligible_settlements st
             where st.settlement_date::date between p.start_date and p.end_date), 0)::bigint as settlement_amount,
            (select count(distinct concat_ws('|', s.shop_type, s.shop_id, coalesce(s.product_no, s.product_name)))
             from eligible_sales s
             where s.paid_date::date between p.start_date and p.end_date)::int as sku_count,
            null::bigint as visitor_count,
            null::bigint as max_concurrent_users,
            null::numeric as average_usage_minutes,
            coalesce((
                select round(avg(shop_count), 2)
                from (
                    select u.user_no, count(sa.id)::numeric as shop_count
                    from eligible_users u
                    left join shop_accounts sa
                      on sa.user_no = u.user_no
                     and coalesce(sa.del_yn, 'N') <> 'Y'
                     and sa.reg_date::date <= p.end_date
                    where u.reg_date::date <= p.end_date
                    group by u.user_no
                ) shop_totals
            ), 0)::float as average_shop_count
        from periods p
        order by case p.period_key when 'today' then 1 when 'current_month' then 2 else 3 end
        """,
        (
            to_date,
            to_date,
            current_month_start,
            to_date,
            previous_month_start,
            previous_month_end,
            *eligibility_params,
        ),
    )
    return cursor.fetchall()


def _fetch_integrated_visitor_metric(cursor, *, to_date: date) -> IntegratedPeriodMetric:
    cursor.execute(
        """
        select
            today_visitor as today,
            current_month_visitor as current_month,
            previous_month_visitor as previous_month
        from site_visitor
        where date <= %s::date
        order by date desc, no desc
        limit 1
        """,
        (to_date,),
    )
    row = cursor.fetchone()
    if row is None:
        return IntegratedPeriodMetric(
            today=None,
            current_month=None,
            previous_month=None,
            available=False,
        )
    return IntegratedPeriodMetric(**row, available=True)


def _fetch_integrated_series(
    cursor,
    *,
    unit: OverviewUnit,
    from_date: date,
    to_date: date,
    partner_code: str | None,
    product_code: str | None,
) -> list[dict]:
    eligibility_ctes, eligibility_params = _integrated_eligibility_ctes(
        partner_code=partner_code,
        product_code=product_code,
    )
    user_bucket = _bucket_expr(unit, "reg_date")
    withdrawn_bucket = _bucket_expr(unit, "coalesce(cancel_request_date, modified_date, request_date)")
    cursor.execute(
        f"""
        with {eligibility_ctes},
        buckets as (
            select generate_series(
                date_trunc(%s, %s::date)::date,
                date_trunc(%s, %s::date)::date,
                case when %s = 'month' then interval '1 month'
                     when %s = 'week' then interval '1 week'
                     else interval '1 day' end
            )::date as bucket
        ),
        new_before as (
            select count(*)::int as count from eligible_users where reg_date::date < %s::date
        ),
        withdrawn_before as (
            select count(*)::int as count from eligible_contracts
            where status in ('SELF_TERMINATION', 'FORCE_TERMINATION', 'ACCOUNT_CLOSED', 'TERMINATION', 'EXPIRED', '72', '73', '82')
              and coalesce(cancel_request_date, modified_date, request_date)::date < %s::date
        ),
        new_members as (
            select {user_bucket} as bucket, count(*)::int as count
            from eligible_users
            where reg_date::date between %s and %s
            group by 1
        ),
        withdrawn_members as (
            select {withdrawn_bucket} as bucket, count(*)::int as count
            from eligible_contracts
            where status in ('SELF_TERMINATION', 'FORCE_TERMINATION', 'ACCOUNT_CLOSED', 'TERMINATION', 'EXPIRED', '72', '73', '82')
              and coalesce(cancel_request_date, modified_date, request_date)::date between %s and %s
            group by 1
        )
        select
            b.bucket,
            coalesce(n.count, 0)::int as new_member_count,
            coalesce(w.count, 0)::int as withdrawn_member_count,
            ((select count from new_before) - (select count from withdrawn_before)
              + sum(coalesce(n.count, 0) - coalesce(w.count, 0)) over (order by b.bucket))::int
                as cumulative_member_count,
            coalesce((select round(avg((b.bucket - u.reg_date::date)::numeric), 2)
                      from eligible_users u where u.reg_date::date <= b.bucket), 0)::float
                as cubici_average_days,
            coalesce((select round(avg((b.bucket - c.request_date::date)::numeric), 2)
                      from eligible_contracts c where c.request_date::date <= b.bucket), 0)::float
                as moneybank_average_days
        from buckets b
        left join new_members n on n.bucket = b.bucket
        left join withdrawn_members w on w.bucket = b.bucket
        order by b.bucket
        """,
        (
            *eligibility_params,
            unit,
            from_date,
            unit,
            to_date,
            unit,
            unit,
            from_date,
            from_date,
            from_date,
            to_date,
            from_date,
            to_date,
        ),
    )
    series = cursor.fetchall()

    eligibility_ctes, eligibility_params = _integrated_eligibility_ctes(
        partner_code=partner_code,
        product_code=product_code,
    )
    channel_bucket = _bucket_expr(unit, "reg_date")
    cursor.execute(
        f"""
        with {eligibility_ctes}
        select
            {channel_bucket} as bucket,
            coalesce(nullif(partner_code, ''), 'DIRECT') as channel_key,
            count(*)::int as count
        from eligible_users
        where reg_date::date between %s and %s
        group by 1, 2
        order by 1, 2
        """,
        (*eligibility_params, from_date, to_date),
    )
    channel_by_bucket: dict[date, dict[str, int]] = {}
    for row in cursor.fetchall():
        channel_by_bucket.setdefault(row["bucket"], {})[row["channel_key"]] = row["count"]
    for row in series:
        row["channel_counts"] = channel_by_bucket.get(row["bucket"], {})
    return series


def _fetch_integrated_channels(
    cursor,
    *,
    series: list[dict],
    partner_code: str | None,
) -> list[MemberSummaryOption]:
    cursor.execute(
        """
        select partner_code as value, coalesce(nullif(partner_name, ''), partner_code) as label
        from partner
        where nullif(partner_code, '') is not null
        order by label, value
        """
    )
    partner_rows = cursor.fetchall()
    labels = {row["value"]: row["label"] for row in partner_rows}
    keys = {key for row in series for key in row.get("channel_counts", {})}
    if not partner_code:
        keys.update(labels)
        keys.add("DIRECT")
    else:
        keys.add(partner_code)
    ordered_keys = ["DIRECT"] if "DIRECT" in keys else []
    ordered_keys.extend(sorted(keys - {"DIRECT"}, key=lambda key: labels.get(key, key)))
    return [
        MemberSummaryOption(
            value=key,
            label="큐빅아이" if key == "DIRECT" else labels.get(key, key),
        )
        for key in ordered_keys
    ]


def _resolve_member_date_range(cursor, *, from_date: date | None, to_date: date | None) -> dict[str, date | None]:
    if from_date is not None and to_date is not None:
        return {"from_date": from_date, "to_date": to_date}

    cursor.execute(
        """
        select
            least(
                coalesce((select min(reg_date)::date from users where user_type = 'USER'), current_date),
                coalesce((select min(request_date)::date from moneybank_contract), current_date),
                coalesce((select min(coalesce(cancel_request_date, modified_date, request_date))::date from moneybank_contract), current_date)
            ) as min_date,
            greatest(
                coalesce((select max(reg_date)::date from users where user_type = 'USER'), current_date),
                coalesce((select max(request_date)::date from moneybank_contract), current_date),
                coalesce((select max(coalesce(cancel_request_date, modified_date, request_date))::date from moneybank_contract), current_date)
            ) as max_date
        """
    )
    row = cursor.fetchone()
    end_date = to_date or row["max_date"]
    start_date = from_date
    if start_date is None and end_date is not None:
        start_date = end_date.replace(day=1)
    return {"from_date": start_date, "to_date": end_date}


def _member_user_filter_clause(partner_code: str | None) -> tuple[str, tuple[object, ...]]:
    if not partner_code:
        return "", tuple()
    return "and nullif(partner_code, '') = %s", (partner_code,)


def _member_contract_filter_clause(
    *,
    partner_code: str | None,
    product_code: str | None,
) -> tuple[str, tuple[object, ...]]:
    clauses: list[str] = []
    params: list[object] = []
    if partner_code:
        clauses.append("and nullif(u.partner_code, '') = %s")
        params.append(partner_code)
    if product_code:
        clauses.append("and c.product_code = %s")
        params.append(product_code)
    return " ".join(clauses), tuple(params)


def _fetch_member_summary_metrics(
    cursor,
    *,
    from_date: date | None,
    to_date: date | None,
    partner_code: str | None,
    product_code: str | None,
) -> dict:
    user_filter, user_params = _member_user_filter_clause(partner_code)
    contract_filter, contract_params = _member_contract_filter_clause(
        partner_code=partner_code,
        product_code=product_code,
    )

    cursor.execute(
        f"""
        select
            %s::date as standard_date,
            %s::date as from_date,
            %s::date as to_date,
            (
                select count(*)::int
                from users
                where user_type = 'USER'
                  and reg_date::date = (%s::date - interval '1 day')::date
                  {user_filter}
            ) as cubici_yesterday_count,
            (
                select count(*)::int
                from users
                where user_type = 'USER'
                  and (%s::date is null or reg_date::date <= %s::date)
                  {user_filter}
            ) as cubici_total_count,
            (
                select count(*)::int
                from moneybank_contract c
                left join users u on u.user_no = c.user_no
                where c.request_date::date = (%s::date - interval '1 day')::date
                  {contract_filter}
            ) as moneybank_yesterday_count,
            (
                select count(*)::int
                from moneybank_contract c
                left join users u on u.user_no = c.user_no
                where (%s::date is null or c.request_date::date <= %s::date)
                  {contract_filter}
            ) as moneybank_total_count,
            (
                select count(*)::int
                from moneybank_contract c
                left join users u on u.user_no = c.user_no
                where c.status in ('SELF_TERMINATION', 'FORCE_TERMINATION', 'ACCOUNT_CLOSED', '72', '73', '82')
                  and coalesce(c.cancel_request_date, c.modified_date, c.request_date)::date = (%s::date - interval '1 day')::date
                  {contract_filter}
            ) as terminated_yesterday_count,
            (
                select count(*)::int
                from moneybank_contract c
                left join users u on u.user_no = c.user_no
                where c.status in ('SELF_TERMINATION', 'FORCE_TERMINATION', 'ACCOUNT_CLOSED', '72', '73', '82')
                  and (%s::date is null or coalesce(c.cancel_request_date, c.modified_date, c.request_date)::date <= %s::date)
                  {contract_filter}
            ) as terminated_total_count,
            (
                select count(*)::int
                from partner
                where reg_date::date = (%s::date - interval '1 day')::date
            ) as partner_yesterday_count,
            (
                select count(*)::int
                from partner
                where %s::date is null or reg_date::date <= %s::date
            ) as partner_total_count
        """,
        (
            to_date,
            from_date,
            to_date,
            to_date,
            *user_params,
            to_date,
            to_date,
            *user_params,
            to_date,
            *contract_params,
            to_date,
            to_date,
            *contract_params,
            to_date,
            *contract_params,
            to_date,
            to_date,
            *contract_params,
            to_date,
            to_date,
            to_date,
        ),
    )
    metrics = cursor.fetchone()
    metrics["data_source_label"] = "PostgreSQL 직접집계"
    metrics["aggregation_status_label"] = "legacy procedure 대조 필요"
    metrics["shop_grouping_status_label"] = "shop grouping 대조 필요"
    return metrics


def _fetch_member_summary_series(
    cursor,
    *,
    unit: OverviewUnit,
    from_date: date | None,
    to_date: date | None,
    partner_code: str | None,
    product_code: str | None,
) -> list[dict]:
    if from_date is None or to_date is None:
        return []

    user_filter, user_params = _member_user_filter_clause(partner_code)
    contract_filter, contract_params = _member_contract_filter_clause(
        partner_code=partner_code,
        product_code=product_code,
    )
    user_bucket = _bucket_expr(unit, "reg_date")
    contract_bucket = _bucket_expr(unit, "request_date")
    review_bucket = _bucket_expr(unit, "request_date")
    approval_bucket = _bucket_expr(unit, "approval_date")
    termination_bucket = _bucket_expr(unit, "coalesce(cancel_request_date, expire_date, modified_date)")
    terminated_bucket = _bucket_expr(unit, "coalesce(c.cancel_request_date, c.modified_date, c.request_date)")

    cursor.execute(
        f"""
        with buckets as (
            select generate_series(
                date_trunc(%s, %s::date)::date,
                date_trunc(%s, %s::date)::date,
                case
                    when %s = 'month' then interval '1 month'
                    when %s = 'week' then interval '1 week'
                    else interval '1 day'
                end
            )::date as bucket
        ),
        cubici_before as (
            select count(*)::int as count
            from users
            where user_type = 'USER'
              and reg_date::date < %s::date
              {user_filter}
        ),
        moneybank_before as (
            select count(*)::int as count
            from moneybank_contract c
            left join users u on u.user_no = c.user_no
            where c.request_date::date < %s::date
              {contract_filter}
        ),
        terminated_before as (
            select count(*)::int as count
            from moneybank_contract c
            left join users u on u.user_no = c.user_no
            where c.status in ('SELF_TERMINATION', 'FORCE_TERMINATION', 'ACCOUNT_CLOSED', '72', '73', '82')
              and coalesce(c.cancel_request_date, c.modified_date, c.request_date)::date < %s::date
              {contract_filter}
        ),
        cubici as (
            select {user_bucket} as bucket, count(*)::int as cubici_count
            from users
            where user_type = 'USER'
              and reg_date::date between %s and %s
              {user_filter}
            group by 1
        ),
        moneybank as (
            select {contract_bucket} as bucket, count(*)::int as moneybank_count
            from moneybank_contract c
            left join users u on u.user_no = c.user_no
            where c.request_date::date between %s and %s
              {contract_filter}
            group by 1
        ),
        terminated as (
            select {terminated_bucket} as bucket, count(*)::int as terminated_count
            from moneybank_contract c
            left join users u on u.user_no = c.user_no
            where c.status in ('SELF_TERMINATION', 'FORCE_TERMINATION', 'ACCOUNT_CLOSED', '72', '73', '82')
              and coalesce(c.cancel_request_date, c.modified_date, c.request_date)::date between %s and %s
              {contract_filter}
            group by 1
        ),
        joined as (
            select
                b.bucket,
                coalesce(c.cubici_count, 0)::int as cubici_count,
                coalesce(m.moneybank_count, 0)::int as moneybank_count,
                coalesce(t.terminated_count, 0)::int as terminated_count
            from buckets b
            left join cubici c on c.bucket = b.bucket
            left join moneybank m on m.bucket = b.bucket
            left join terminated t on t.bucket = b.bucket
        )
        select
            bucket,
            cubici_count,
            moneybank_count,
            terminated_count,
            ((select count from cubici_before) + sum(cubici_count) over (order by bucket))::int as cubici_cumulative,
            ((select count from moneybank_before) + sum(moneybank_count) over (order by bucket))::int as moneybank_cumulative,
            ((select count from terminated_before) + sum(terminated_count) over (order by bucket))::int as terminated_cumulative,
            round(
                case
                    when ((select count from cubici_before) + sum(cubici_count) over (order by bucket)) = 0 then null
                    else (((select count from moneybank_before) + sum(moneybank_count) over (order by bucket))::numeric
                        / ((select count from cubici_before) + sum(cubici_count) over (order by bucket))::numeric) * 100
                end,
                2
            )::float as moneybank_ratio
        from joined
        order by bucket
        """,
        (
            unit,
            from_date,
            unit,
            to_date,
            unit,
            unit,
            from_date,
            *user_params,
            from_date,
            *contract_params,
            from_date,
            *contract_params,
            from_date,
            to_date,
            *user_params,
            from_date,
            to_date,
            *contract_params,
            from_date,
            to_date,
            *contract_params,
        ),
    )
    return cursor.fetchall()


def _fetch_summary(cursor, *, from_date: date | None, to_date: date | None) -> dict:
    cursor.execute(
        """
        with latest_history as (
            select distinct on (mbid)
                mbid,
                outstanding_balance,
                reg_date
            from moneybank_redemption_history
            where (%s::date is null or reg_date::date <= %s::date)
            order by mbid, reg_date desc nulls last, id desc
        )
        select
            %s::date as standard_date,
            %s::date as from_date,
            %s::date as to_date,
            (select count(*)::int from moneybank_contract)::int as contract_total_count,
            (
                select count(*)::int
                from moneybank_contract
                where %s::date is not null and request_date::date = %s::date
            ) as contract_today_count,
            (
                select count(*)::int
                from moneybank_contract
                where %s::date is not null
                  and request_date::date = %s::date
                  and approval_date is not null
            ) as review_today_count,
            (
                select count(*)::int
                from moneybank_contract
                where %s::date is not null and approval_date::date = %s::date
            ) as approved_today_count,
            (
                select count(*)::int
                from moneybank_contract
                where status in ('SELF_TERMINATION', 'FORCE_TERMINATION', 'ACCOUNT_CLOSED', 'TERMINATION', 'EXPIRED', '72', '73', '82')
                  and %s::date is not null
                  and coalesce(cancel_request_date, expire_date, modified_date)::date = %s::date
            ) as terminated_today_count,
            (
                select count(*)::int
                from moneybank_contract
                where status = 'CONTRACT'
            ) as active_contract_count,
            (
                select count(*)::int
                from moneybank_contract
                where status in ('SELF_TERMINATION', 'FORCE_TERMINATION', 'ACCOUNT_CLOSED', 'TERMINATION', 'EXPIRED', '72', '73', '82')
            ) as terminated_contract_count,
            (
                select coalesce(sum(total_provision_amount), 0)::bigint
                from moneybank_redemption_provision
                where %s::date is not null and provision_date::date = %s::date
            ) as provision_today_amount,
            (
                select coalesce(sum(total_provision_amount), 0)::bigint
                from moneybank_redemption_provision
                where %s::date is null or provision_date::date <= %s::date
            ) as provision_total_amount,
            (
                select count(*)::int
                from moneybank_redemption_provision
                where %s::date is null or provision_date::date <= %s::date
            ) as provision_total_count,
            (
                select coalesce(sum(repayment_amount), 0)::bigint
                from moneybank_redemption_repayment
                where %s::date is not null and coalesce(balance_provision_date, reg_date, modified_date)::date = %s::date
            ) as repayment_today_amount,
            (
                select coalesce(sum(repayment_amount), 0)::bigint
                from moneybank_redemption_repayment
                where %s::date is null or coalesce(balance_provision_date, reg_date, modified_date)::date <= %s::date
            ) as repayment_total_amount,
            (
                select count(*)::int
                from moneybank_redemption_repayment
                where %s::date is null or coalesce(balance_provision_date, reg_date, modified_date)::date <= %s::date
            ) as repayment_total_count,
            (
                select coalesce(sum(repayment_usage_fee), 0)::bigint
                from moneybank_redemption_repayment
                where %s::date is null or coalesce(balance_provision_date, reg_date, modified_date)::date <= %s::date
            ) as repayment_fee_total_amount,
            coalesce((select sum(outstanding_balance) from latest_history), 0)::bigint as outstanding_balance_amount,
            coalesce((select count(*) from latest_history where outstanding_balance > 0), 0)::int as outstanding_balance_count,
            (
                select coalesce(sum(settlement_amount), 0)::bigint
                from settlement
                where %s::date is null or settlement_date::date <= %s::date
            ) as settlement_total_amount,
            (
                select count(*)::int
                from settlement
                where %s::date is null or settlement_date::date <= %s::date
            ) as settlement_total_count
        """,
        (
            to_date, to_date,
            to_date, from_date, to_date,
            to_date, to_date,
            to_date, to_date,
            to_date, to_date,
            to_date, to_date,
            to_date, to_date,
            to_date, to_date,
            to_date, to_date,
            to_date, to_date,
            to_date, to_date,
            to_date, to_date,
            to_date, to_date,
            to_date, to_date,
            to_date, to_date,
        ),
    )
    summary = cursor.fetchone()
    opening_repayment = _fetch_opening_repayment(cursor, to_date=to_date)
    return _apply_ledger_reconciliation(summary, opening_repayment)


def _fetch_opening_repayment(cursor, *, to_date: date | None) -> dict:
    cursor.execute(
        """
        with first_history as (
            select distinct on (mbid)
                mbid,
                coalesce(cumulative_repayment_amount, 0)::bigint as cumulative_repayment_amount
            from moneybank_redemption_history
            where (%s::date is null or reg_date::date <= %s::date)
            order by mbid, reg_date nulls last, id
        ), latest_history as (
            select distinct on (mbid)
                mbid,
                coalesce(cumulative_repayment_amount, 0)::bigint as cumulative_repayment_amount
            from moneybank_redemption_history
            where (%s::date is null or reg_date::date <= %s::date)
            order by mbid, reg_date desc nulls last, id desc
        ), repayment as (
            select
                mbid,
                coalesce(sum(repayment_amount), 0)::bigint as amount,
                count(*)::int as rows
            from moneybank_redemption_repayment
            where (%s::date is null
                or coalesce(balance_provision_date, reg_date, modified_date)::date <= %s::date)
            group by mbid
        ), explained as (
            select fh.mbid, fh.cumulative_repayment_amount as opening_amount
            from first_history fh
            join latest_history lh using (mbid)
            left join repayment r using (mbid)
            where coalesce(r.rows, 0) = 0
              and fh.cumulative_repayment_amount > 0
              and lh.cumulative_repayment_amount - coalesce(r.amount, 0)
                    = fh.cumulative_repayment_amount
        )
        select
            count(*)::int as opening_repayment_count,
            coalesce(sum(opening_amount), 0)::bigint as opening_repayment_amount
        from explained
        """,
        (to_date, to_date, to_date, to_date, to_date, to_date),
    )
    return cursor.fetchone()


def _apply_ledger_reconciliation(summary: dict, opening_repayment: dict) -> dict:
    opening_repayment_amount = int(opening_repayment["opening_repayment_amount"] or 0)
    opening_repayment_count = int(opening_repayment["opening_repayment_count"] or 0)
    reconciled_repayment_total_amount = (
        int(summary["repayment_total_amount"] or 0) + opening_repayment_amount
    )
    balance_reconcile_amount = (
        int(summary["provision_total_amount"] or 0) - reconciled_repayment_total_amount
    )
    balance_reconcile_diff = int(summary["outstanding_balance_amount"] or 0) - balance_reconcile_amount
    summary["data_source_label"] = "PostgreSQL 직접집계"
    summary["aggregation_status_label"] = "legacy procedure 대조 필요"
    summary["shop_grouping_status_label"] = "shop grouping 대조 필요"
    summary["opening_repayment_amount"] = opening_repayment_amount
    summary["opening_repayment_count"] = opening_repayment_count
    summary["reconciled_repayment_total_amount"] = reconciled_repayment_total_amount
    summary["balance_reconcile_amount"] = balance_reconcile_amount
    summary["balance_reconcile_diff"] = balance_reconcile_diff
    if balance_reconcile_diff != 0:
        summary["balance_reconcile_status_label"] = "검산차이"
    elif opening_repayment_amount:
        summary["balance_reconcile_status_label"] = "초기이관 포함 일치"
    else:
        summary["balance_reconcile_status_label"] = "검산일치"
    return summary


def _bucket_expr(unit: OverviewUnit, column: str) -> str:
    if unit == "week":
        return f"date_trunc('week', {column})::date"
    if unit == "month":
        return f"date_trunc('month', {column})::date"
    return f"{column}::date"


def _fetch_series(cursor, *, unit: OverviewUnit, from_date: date | None, to_date: date | None) -> list[dict]:
    if from_date is None or to_date is None:
        return []

    contract_bucket = _bucket_expr(unit, "request_date")
    review_bucket = _bucket_expr(unit, "request_date")
    approval_bucket = _bucket_expr(unit, "approval_date")
    termination_bucket = _bucket_expr(unit, "coalesce(cancel_request_date, expire_date, modified_date)")
    provision_bucket = _bucket_expr(unit, "provision_date")
    repayment_bucket = _bucket_expr(unit, "coalesce(balance_provision_date, reg_date, modified_date)")
    settlement_bucket = _bucket_expr(unit, "settlement_date")
    history_bucket = _bucket_expr(unit, "reg_date")

    cursor.execute(
        f"""
        with buckets as (
            select generate_series(
                date_trunc(%s, %s::date)::date,
                date_trunc(%s, %s::date)::date,
                case
                    when %s = 'month' then interval '1 month'
                    when %s = 'week' then interval '1 week'
                    else interval '1 day'
                end
            )::date as bucket
        ),
        contracts as (
            select
                {contract_bucket} as bucket,
                count(*)::int as contract_count,
                coalesce(sum(sales_amount), 0)::bigint as request_amount
            from moneybank_contract
            where request_date::date between %s and %s
            group by 1
        ),
        reviews as (
            select
                {review_bucket} as bucket,
                count(*)::int as review_count,
                coalesce(sum(sales_amount), 0)::bigint as review_amount
            from moneybank_contract
            where request_date::date between %s and %s
              and approval_date is not null
            group by 1
        ),
        approvals as (
            select
                {approval_bucket} as bucket,
                count(*)::int as approved_count,
                coalesce(sum(sales_amount), 0)::bigint as approved_amount
            from moneybank_contract
            where approval_date::date between %s and %s
            group by 1
        ),
        terminations as (
            select {termination_bucket} as bucket, count(*)::int as terminated_count
            from moneybank_contract
            where status in ('SELF_TERMINATION', 'FORCE_TERMINATION', 'ACCOUNT_CLOSED', 'TERMINATION', 'EXPIRED', '72', '73', '82')
              and coalesce(cancel_request_date, expire_date, modified_date)::date between %s and %s
            group by 1
        ),
        provisions as (
            select
                {provision_bucket} as bucket,
                coalesce(sum(total_provision_amount), 0)::bigint as provision_amount,
                count(*)::int as provision_count
            from moneybank_redemption_provision
            where provision_date::date between %s and %s
            group by 1
        ),
        repayments as (
            select
                {repayment_bucket} as bucket,
                coalesce(sum(repayment_amount), 0)::bigint as repayment_amount,
                coalesce(sum(repayment_usage_fee), 0)::bigint as repayment_fee
            from moneybank_redemption_repayment
            where coalesce(balance_provision_date, reg_date, modified_date)::date between %s and %s
            group by 1
        ),
        settlements as (
            select {settlement_bucket} as bucket, coalesce(sum(settlement_amount), 0)::bigint as settlement_amount
            from settlement
            where settlement_date::date between %s and %s
            group by 1
        ),
        latest_history_by_bucket as (
            select distinct on (mbid, {history_bucket})
                {history_bucket} as bucket,
                mbid,
                outstanding_balance
            from moneybank_redemption_history
            where reg_date::date between %s and %s
            order by mbid, {history_bucket}, reg_date desc nulls last, id desc
        ),
        outstanding as (
            select bucket, coalesce(sum(outstanding_balance), 0)::bigint as outstanding_balance
            from latest_history_by_bucket
            group by bucket
        )
        select
            b.bucket,
            coalesce(c.contract_count, 0)::int as contract_count,
            coalesce(rv.review_count, 0)::int as review_count,
            coalesce(a.approved_count, 0)::int as approved_count,
            coalesce(t.terminated_count, 0)::int as terminated_count,
            coalesce(c.request_amount, 0)::bigint as request_amount,
            coalesce(rv.review_amount, 0)::bigint as review_amount,
            coalesce(a.approved_amount, 0)::bigint as approved_amount,
            coalesce(p.provision_amount, 0)::bigint as provision_amount,
            coalesce(p.provision_count, 0)::int as provision_count,
            coalesce(r.repayment_amount, 0)::bigint as repayment_amount,
            coalesce(r.repayment_fee, 0)::bigint as repayment_fee,
            coalesce(s.settlement_amount, 0)::bigint as settlement_amount,
            coalesce(o.outstanding_balance, 0)::bigint as outstanding_balance
        from buckets b
        left join contracts c on c.bucket = b.bucket
        left join reviews rv on rv.bucket = b.bucket
        left join approvals a on a.bucket = b.bucket
        left join terminations t on t.bucket = b.bucket
        left join provisions p on p.bucket = b.bucket
        left join repayments r on r.bucket = b.bucket
        left join settlements s on s.bucket = b.bucket
        left join outstanding o on o.bucket = b.bucket
        order by b.bucket
        """,
        (
            unit,
            from_date,
            unit,
            to_date,
            unit,
            unit,
            from_date,
            to_date,
            from_date,
            to_date,
            from_date,
            to_date,
            from_date,
            to_date,
            from_date,
            to_date,
            from_date,
            to_date,
            from_date,
            to_date,
            from_date,
            to_date,
        ),
    )
    return cursor.fetchall()


def _fetch_warnings(cursor) -> list[dict]:
    cursor.execute(
        """
        with latest_history as (
            select distinct on (mbid)
                mbid,
                cumulative_provision_amount,
                cumulative_repayment_amount,
                outstanding_balance,
                reg_date::date as latest_history_date
            from moneybank_redemption_history
            order by mbid, reg_date desc nulls last, id desc
        ),
        pcs_latest as (
            select distinct on (mbid, user_no)
                mbid,
                user_no,
                prizm_grade
            from prizm_pcs_result
            order by mbid, user_no, reg_date desc nulls last, pcs_no desc
        )
        select
            h.mbid,
            c.user_no,
            u.name as user_name,
            u.biz_name as firm_name,
            c.status,
            coalesce(h.cumulative_provision_amount, 0)::bigint as provision_amount,
            coalesce(h.cumulative_repayment_amount, 0)::bigint as repayment_amount,
            coalesce(h.outstanding_balance, 0)::bigint as outstanding_balance,
            h.latest_history_date,
            pcs.prizm_grade,
            case
                when coalesce(h.outstanding_balance, 0) > 0 then '미상환잔액'
                else '확인필요'
            end as signal
        from latest_history h
        left join moneybank_contract c on c.mbid = h.mbid
        left join users u on u.user_no = c.user_no
        left join pcs_latest pcs
          on pcs.mbid = c.mbid
         and pcs.user_no is not distinct from c.user_no
        where coalesce(h.outstanding_balance, 0) > 0
        order by h.outstanding_balance desc, h.latest_history_date desc nulls last
        limit 10
        """
    )
    return cursor.fetchall()
