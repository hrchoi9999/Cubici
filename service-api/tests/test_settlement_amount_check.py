from cubici_service.settlements.repository import _with_settlement_amount_check


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
