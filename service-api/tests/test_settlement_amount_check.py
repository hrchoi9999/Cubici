from cubici_service.settlements.repository import _build_settlement_check_counts, _with_settlement_amount_check


def test_settlement_amount_check_matches_target_minus_pending() -> None:
    checked = _with_settlement_amount_check(
        {
            "total_sale": 120_000,
            "service_fee": 10_000,
            "settlement_target_amount": 100_000,
            "settlement_amount": 95_000,
            "pending_released_amount": 5_000,
            "seller_discount_coupon": 0,
            "downloadable_coupon": 0,
            "seller_service_fee": 0,
            "store_fee_discount": 0,
            "debt_of_last_week": 0,
        }
    )

    assert checked["settlement_check_amount"] == 95_000
    assert checked["settlement_difference"] == 0
    assert checked["settlement_check_status"] == "OK"


def test_settlement_amount_check_flags_legacy_batch_value() -> None:
    checked = _with_settlement_amount_check(
        {
            "total_sale": 0,
            "service_fee": 0,
            "settlement_target_amount": 0,
            "settlement_amount": 47_985,
            "pending_released_amount": 0,
            "seller_discount_coupon": 0,
            "downloadable_coupon": 0,
            "seller_service_fee": 0,
            "store_fee_discount": 0,
            "debt_of_last_week": 0,
        }
    )

    assert checked["settlement_check_amount"] == 0
    assert checked["settlement_difference"] == 47_985
    assert checked["settlement_check_status"] == "LEGACY_BATCH_VALUE"


def test_coupang_source_check_accepts_70_percent_with_one_won_tolerance() -> None:
    checked = _with_settlement_amount_check(
        {
            "shop_type": "COUPANG",
            "settlement_type": "WEEKLY",
            "total_sale": 120_000,
            "service_fee": 10_000,
            "settlement_target_amount": 110_000,
            "settlement_amount": 76_999,
            "pending_released_amount": 0,
        }
    )

    assert checked["settlement_check_amount"] == 77_000
    assert checked["settlement_difference"] == -1
    assert checked["settlement_check_status"] == "SOURCE_RECONCILED"


def test_coupang_source_check_keeps_material_difference_visible() -> None:
    checked = _with_settlement_amount_check(
        {
            "shop_type": "COUPANG",
            "settlement_type": "RESERVE",
            "settlement_target_amount": 110_000,
            "settlement_amount": 76_900,
            "pending_released_amount": 0,
        }
    )

    assert checked["settlement_check_amount"] == 77_000
    assert checked["settlement_difference"] == -100
    assert checked["settlement_check_status"] == "DIFF"


def test_non_coupang_row_does_not_use_source_specific_rule() -> None:
    checked = _with_settlement_amount_check(
        {
            "shop_type": "NAVER",
            "settlement_type": "WEEKLY",
            "settlement_target_amount": 110_000,
            "settlement_amount": 77_000,
            "pending_released_amount": 0,
        }
    )

    assert checked["settlement_check_amount"] == 110_000
    assert checked["settlement_check_status"] == "DIFF"


def test_settlement_check_counts_summarize_operating_reconcile_status() -> None:
    rows = [
        {"settlement_check_status": "OK", "settlement_difference": 0},
        {"settlement_check_status": "SOURCE_RECONCILED", "settlement_difference": -1},
        {"settlement_check_status": "DIFF", "settlement_difference": -1200},
        {"settlement_check_status": "LEGACY_BATCH_VALUE", "settlement_difference": 47985},
    ]

    counts = _build_settlement_check_counts(rows)

    assert counts.total_count == 4
    assert counts.ok_count == 1
    assert counts.source_reconciled_count == 1
    assert counts.diff_count == 1
    assert counts.legacy_batch_value_count == 1
    assert counts.total_difference == 46784
    assert counts.absolute_difference == 49186
    assert counts.check_status_label == "검산차이"
