"""User and shop account read-only API skeleton."""

from fastapi import APIRouter, Query

from cubici_service.api.v1.schemas import DomainStatus
from cubici_service.accounts.repository import AccountListResponse, list_user_accounts

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("", response_model=DomainStatus)
def accounts_status() -> DomainStatus:
    return DomainStatus(
        domain="accounts",
        mode="read-only-skeleton",
        source_tables=["users", "shop_accounts"],
        next_action="Implement paginated user and shop account list queries.",
    )


@router.get("/users", response_model=AccountListResponse)
def account_users(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> AccountListResponse:
    return list_user_accounts(limit=limit, offset=offset)
