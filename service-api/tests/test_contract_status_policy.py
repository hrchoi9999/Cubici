import pytest
from fastapi import HTTPException

from cubici_service.contracts.repository import (
    CONTRACT_STATUS_ACTION_MAP,
    _assert_contract_status_transition,
)


def test_contract_status_policy_keeps_approve_in_review_stage() -> None:
    assert CONTRACT_STATUS_ACTION_MAP["approve"] == "PENDING_REVIEW"
    _assert_contract_status_transition("approve", "REQUEST")


def test_contract_status_policy_moves_document_ready_to_review() -> None:
    assert CONTRACT_STATUS_ACTION_MAP["document_ready"] == "PENDING_REVIEW"
    _assert_contract_status_transition("document_ready", "PENDING_DOCUMENTS")


def test_contract_status_policy_rejects_direct_contract_from_review() -> None:
    with pytest.raises(HTTPException) as error:
        _assert_contract_status_transition("contract_ready", "PENDING_REVIEW")

    assert error.value.status_code == 409


def test_contract_status_policy_allows_legacy_contract_ready_alias() -> None:
    _assert_contract_status_transition("contract_ready", "05")


def test_contract_status_policy_rejects_cancel_before_contract() -> None:
    with pytest.raises(HTTPException) as error:
        _assert_contract_status_transition("cancel", "REQUEST")

    assert error.value.status_code == 409


@pytest.mark.parametrize("action", ["cancel", "request_termination", "force_termination", "account_closed"])
@pytest.mark.parametrize("status", ["ACCOUNT_STANDBY", "CONTRACT", "06", "81"])
def test_contract_status_policy_allows_termination_after_contract(action: str, status: str) -> None:
    _assert_contract_status_transition(action, status)


@pytest.mark.parametrize("action", ["cancel", "force_termination", "account_closed"])
@pytest.mark.parametrize("status", ["TERMINATION_REQUEST", "71"])
def test_contract_status_policy_allows_final_termination_after_request(action: str, status: str) -> None:
    _assert_contract_status_transition(action, status)


@pytest.mark.parametrize("status", ["SELF_TERMINATION", "FORCE_TERMINATION", "ACCOUNT_CLOSED", "72", "73", "82"])
def test_contract_status_policy_rejects_changes_after_termination(status: str) -> None:
    with pytest.raises(HTTPException) as error:
        _assert_contract_status_transition("approve", status)

    assert error.value.status_code == 409


def test_contract_status_policy_rejects_reject_after_contract() -> None:
    with pytest.raises(HTTPException) as error:
        _assert_contract_status_transition("reject", "CONTRACT")

    assert error.value.status_code == 409
