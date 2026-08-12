from cubici_service.management.repository import _apply_ledger_reconciliation


def _summary(*, outstanding_balance_amount: int = 909_988) -> dict:
    return {
        "provision_total_amount": 55_686_548,
        "repayment_total_amount": 54_772_944,
        "outstanding_balance_amount": outstanding_balance_amount,
    }


def test_opening_repayment_reconciles_the_imported_ledger_balance() -> None:
    result = _apply_ledger_reconciliation(
        _summary(),
        {"opening_repayment_amount": 3_616, "opening_repayment_count": 1},
    )

    assert result["reconciled_repayment_total_amount"] == 54_776_560
    assert result["balance_reconcile_amount"] == 909_988
    assert result["balance_reconcile_diff"] == 0
    assert result["balance_reconcile_status_label"] == "초기이관 포함 일치"


def test_unexplained_balance_difference_remains_visible() -> None:
    result = _apply_ledger_reconciliation(
        _summary(outstanding_balance_amount=900_000),
        {"opening_repayment_amount": 3_616, "opening_repayment_count": 1},
    )

    assert result["balance_reconcile_diff"] == -9_988
    assert result["balance_reconcile_status_label"] == "검산차이"


def test_ledger_without_an_opening_repayment_uses_detail_totals() -> None:
    result = _apply_ledger_reconciliation(
        _summary(outstanding_balance_amount=913_604),
        {"opening_repayment_amount": 0, "opening_repayment_count": 0},
    )

    assert result["reconciled_repayment_total_amount"] == 54_772_944
    assert result["balance_reconcile_amount"] == 913_604
    assert result["balance_reconcile_diff"] == 0
    assert result["balance_reconcile_status_label"] == "검산일치"
