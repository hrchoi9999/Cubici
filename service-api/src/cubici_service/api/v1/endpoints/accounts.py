"""User and shop account API."""

from fastapi import APIRouter, Header, HTTPException, Query

from cubici_service.api.v1.schemas import DomainStatus
from cubici_service.accounts.repository import (
    AccountAuthResponse,
    AccountAuthUser,
    AccountCompanyUpdateRequest,
    AccountCompanyUpdateResponse,
    AccountDashboardSummaryResponse,
    AccountListResponse,
    AccountLoginRequest,
    AccountSignupRequest,
    ShopAccountCreateRequest,
    ShopAccountCreateResponse,
    ShopAccountListResponse,
    ShopAccountUpdateRequest,
    ShopAccountWriteResponse,
    create_shop_account_for_user,
    delete_shop_account_for_user,
    get_authenticated_user,
    get_dashboard_summary_for_user,
    list_shop_accounts_for_user,
    list_user_accounts,
    login_user,
    signup_user,
    update_company_for_user,
    update_shop_account_for_user,
)

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


@router.post("/signup", response_model=AccountAuthResponse)
def account_signup(payload: AccountSignupRequest) -> AccountAuthResponse:
    return signup_user(payload)


@router.post("/login", response_model=AccountAuthResponse)
def account_login(payload: AccountLoginRequest) -> AccountAuthResponse:
    return login_user(payload)


@router.get("/me", response_model=AccountAuthUser)
def account_me(authorization: str | None = Header(default=None)) -> AccountAuthUser:
    return _authenticated_user(authorization)


@router.get("/me/dashboard-summary", response_model=AccountDashboardSummaryResponse)
def account_my_dashboard_summary(
    authorization: str | None = Header(default=None),
) -> AccountDashboardSummaryResponse:
    user = _authenticated_user(authorization)
    return get_dashboard_summary_for_user(user.user_no)


@router.put("/me/company", response_model=AccountCompanyUpdateResponse)
def account_my_company_update(
    payload: AccountCompanyUpdateRequest,
    authorization: str | None = Header(default=None),
) -> AccountCompanyUpdateResponse:
    user = _authenticated_user(authorization)
    return update_company_for_user(user.user_no, payload)


@router.get("/me/shops", response_model=ShopAccountListResponse)
def account_my_shops(authorization: str | None = Header(default=None)) -> ShopAccountListResponse:
    user = _authenticated_user(authorization)
    return list_shop_accounts_for_user(user.user_no)


@router.post("/me/shops", response_model=ShopAccountCreateResponse)
def account_my_shop_create(
    payload: ShopAccountCreateRequest,
    authorization: str | None = Header(default=None),
) -> ShopAccountCreateResponse:
    user = _authenticated_user(authorization)
    return create_shop_account_for_user(user.user_no, payload)


@router.put("/me/shops/{account_id}", response_model=ShopAccountWriteResponse)
def account_my_shop_update(
    account_id: int,
    payload: ShopAccountUpdateRequest,
    authorization: str | None = Header(default=None),
) -> ShopAccountWriteResponse:
    user = _authenticated_user(authorization)
    return update_shop_account_for_user(user.user_no, account_id, payload)


@router.delete("/me/shops/{account_id}", response_model=ShopAccountWriteResponse)
def account_my_shop_delete(
    account_id: int,
    authorization: str | None = Header(default=None),
) -> ShopAccountWriteResponse:
    user = _authenticated_user(authorization)
    return delete_shop_account_for_user(user.user_no, account_id)


def _authenticated_user(authorization: str | None) -> AccountAuthUser:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="bearer token required")
    return get_authenticated_user(authorization.split(" ", 1)[1].strip())
