"""Master admin API authorization policy."""

import re

from fastapi import HTTPException
from starlette.requests import Request
from starlette.responses import JSONResponse

from cubici_service.accounts.repository import AccountAuthUser, get_authenticated_user
from cubici_service.core.config import Settings


WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

ADMIN_EXACT_PATHS = {
    "/v1/api/accounts/users",
}

ADMIN_PATH_PREFIXES = (
    "/v1/api/management",
    "/v1/api/monitoring",
    "/v1/api/fintech",
    "/v1/api/risk-results",
    "/v1/api/preferences/admin-accounts",
    "/v1/api/preferences/promotions",
    "/v1/api/preferences/partners",
    "/v1/api/preferences/moneybank-products",
    "/v1/api/preferences/prizm-config",
    "/v1/api/preferences/raw-data",
    "/v1/api/support/message-templates",
)

ADMIN_WRITE_PREFIXES = (
    "/v1/api/preferences/charges",
    "/v1/api/support/boards",
)

ADMIN_REGEX_PATHS = (
    re.compile(r"^/v1/api/contracts/[^/]+/(fees/adjust|documents/(confirm|checks)|review-notes)(/|$)"),
    re.compile(r"^/v1/api/redemptions/[^/]+/(operations/[^/]+/cancel|provisions|repayments)(/|$)"),
    re.compile(r"^/v1/api/support/inquiries/[^/]+/replies(/|$)"),
)


def is_admin_protected_request(method: str, path: str) -> bool:
    normalized_method = method.upper()
    normalized_path = path.rstrip("/") or path
    if normalized_method == "OPTIONS":
        return False
    if normalized_path in ADMIN_EXACT_PATHS:
        return True
    if any(normalized_path.startswith(prefix) for prefix in ADMIN_PATH_PREFIXES):
        return True
    if normalized_method in WRITE_METHODS and any(
        normalized_path.startswith(prefix) for prefix in ADMIN_WRITE_PREFIXES
    ):
        return True
    if any(pattern.match(normalized_path) for pattern in ADMIN_REGEX_PATHS):
        return True
    return False


def authenticate_master_admin(authorization: str | None, settings: Settings) -> AccountAuthUser:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="master admin bearer token required")

    user = get_authenticated_user(authorization.split(" ", 1)[1].strip())
    email = user.email.strip().lower()
    user_type = (user.user_type or "").strip().upper()
    if email != settings.master_admin_email.strip().lower() or user_type != "ADMIN_USER":
        raise HTTPException(status_code=403, detail="master admin account required")
    return user


async def enforce_master_admin_for_protected_api(request: Request, settings: Settings) -> JSONResponse | None:
    if not is_admin_protected_request(request.method, request.url.path):
        return None

    try:
        request.state.master_admin = authenticate_master_admin(request.headers.get("authorization"), settings)
    except HTTPException as exc:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    return None
