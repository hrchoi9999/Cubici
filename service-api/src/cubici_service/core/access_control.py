"""User ownership checks for shared user/admin API routes."""

import json
import re

from fastapi import HTTPException
from psycopg.rows import dict_row
from starlette.requests import Request
from starlette.responses import JSONResponse

from cubici_service.accounts.repository import AccountAuthUser, get_authenticated_user
from cubici_service.core.config import Settings, get_settings
from cubici_service.core.shop_types import normalize_shop_type
from cubici_service.db.connection import get_connection


CONTRACT_PATH_RE = re.compile(r"^/v1/api/contracts/([^/]+)(/|$)")
REDEMPTION_PATH_RE = re.compile(r"^/v1/api/redemptions/([^/]+)(/|$)")
DOCUMENT_PATH_RE = re.compile(r"^/v1/api/contracts/([^/]+)/documents/([^/]+)(/|$)")
SETTLEMENT_DETAIL_PATH_RE = re.compile(r"^/v1/api/settlements/(\d+)$")
SUPPORT_INQUIRY_PATH_RE = re.compile(r"^/v1/api/support/inquiries/(\d+)$")


def authenticate_bearer_user(authorization: str | None) -> AccountAuthUser:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="bearer token required")
    return get_authenticated_user(authorization.split(" ", 1)[1].strip())


def is_master_admin(user: AccountAuthUser, settings: Settings | None = None) -> bool:
    resolved_settings = settings or get_settings()
    return (
        user.email.strip().lower() == resolved_settings.master_admin_email.strip().lower()
        and (user.user_type or "").strip().upper() == "ADMIN_USER"
    )


def require_master_admin_or_same_user(
    authorization: str | None,
    user_no: int | None,
    *,
    settings: Settings | None = None,
) -> AccountAuthUser:
    user = authenticate_bearer_user(authorization)
    if is_master_admin(user, settings):
        return user
    if user_no is not None and user.user_no == user_no:
        return user
    raise HTTPException(status_code=403, detail="resource owner required")


def require_master_admin_or_shop_scope(
    authorization: str | None,
    *,
    shop_pairs: str | None = None,
    shop_type: str | None = None,
    shop_id: str | None = None,
    settings: Settings | None = None,
) -> AccountAuthUser:
    user = authenticate_bearer_user(authorization)
    if is_master_admin(user, settings):
        return user

    pairs = _normalize_requested_pairs(shop_pairs=shop_pairs, shop_type=shop_type, shop_id=shop_id)
    if not pairs:
        raise HTTPException(status_code=403, detail="shop owner scope required")
    if pairs == [("__none__", "__none__")]:
        return user

    allowed_pairs = _fetch_user_shop_pairs(user.user_no)
    if all(pair in allowed_pairs for pair in pairs):
        return user
    raise HTTPException(status_code=403, detail="shop owner required")


def require_master_admin_or_contract_owner(
    authorization: str | None,
    mbid: str,
    *,
    settings: Settings | None = None,
) -> AccountAuthUser:
    user = authenticate_bearer_user(authorization)
    if is_master_admin(user, settings):
        return user
    owner_user_no = _fetch_contract_owner_user_no(mbid)
    if owner_user_no is None:
        raise HTTPException(status_code=404, detail="contract not found")
    if owner_user_no == user.user_no:
        return user
    raise HTTPException(status_code=403, detail="contract owner required")


def require_master_admin_or_settlement_owner(
    authorization: str | None,
    settlements_id: int,
    *,
    settings: Settings | None = None,
) -> AccountAuthUser:
    user = authenticate_bearer_user(authorization)
    if is_master_admin(user, settings):
        return user
    pair = _fetch_settlement_shop_pair(settlements_id)
    if pair is None:
        raise HTTPException(status_code=404, detail="settlement not found")
    if pair in _fetch_user_shop_pairs(user.user_no):
        return user
    raise HTTPException(status_code=403, detail="settlement owner required")


async def enforce_user_ownership_for_common_api(request: Request, settings: Settings) -> JSONResponse | None:
    if request.method.upper() == "OPTIONS":
        return None

    path = request.url.path.rstrip("/") or request.url.path
    query = request.query_params

    try:
        if path in {
            "/v1/api/sales/orders",
            "/v1/api/sales/product-analysis",
            "/v1/api/sales/returns",
            "/v1/api/settlements",
        }:
            require_master_admin_or_shop_scope(
                request.headers.get("authorization"),
                shop_pairs=query.get("shop_pairs"),
                shop_type=query.get("shop_type"),
                shop_id=query.get("shop_id"),
                settings=settings,
            )
            return None

        settlement_match = SETTLEMENT_DETAIL_PATH_RE.match(path)
        if settlement_match:
            require_master_admin_or_settlement_owner(
                request.headers.get("authorization"),
                int(settlement_match.group(1)),
                settings=settings,
            )
            return None

        if path == "/v1/api/contracts" and request.method.upper() == "GET":
            require_master_admin_or_same_user(
                request.headers.get("authorization"),
                _int_or_none(query.get("user_no")),
                settings=settings,
            )
            return None

        if path == "/v1/api/contracts/requests" and request.method.upper() == "POST":
            payload = await _json_body(request)
            require_master_admin_or_same_user(
                request.headers.get("authorization"),
                _int_or_none(payload.get("user_no")),
                settings=settings,
            )
            return None

        contract_match = CONTRACT_PATH_RE.match(path)
        if contract_match and path != "/v1/api/contracts/requests":
            require_master_admin_or_contract_owner(
                request.headers.get("authorization"),
                contract_match.group(1),
                settings=settings,
            )
            return None

        redemption_match = REDEMPTION_PATH_RE.match(path)
        if path == "/v1/api/redemptions" and request.method.upper() == "GET":
            require_master_admin_or_same_user(
                request.headers.get("authorization"),
                _int_or_none(query.get("user_no")),
                settings=settings,
            )
            return None
        if redemption_match:
            require_master_admin_or_contract_owner(
                request.headers.get("authorization"),
                redemption_match.group(1),
                settings=settings,
            )
            return None

        if path == "/v1/api/support/inquiries" and request.method.upper() == "GET":
            require_master_admin_or_same_user(
                request.headers.get("authorization"),
                _int_or_none(query.get("user_no")),
                settings=settings,
            )
            return None
        if path == "/v1/api/support/inquiries" and request.method.upper() == "POST":
            payload = await _json_body(request)
            require_master_admin_or_same_user(
                request.headers.get("authorization"),
                _int_or_none(payload.get("user_no")),
                settings=settings,
            )
            return None

        inquiry_match = SUPPORT_INQUIRY_PATH_RE.match(path)
        if inquiry_match:
            require_master_admin_or_same_user(
                request.headers.get("authorization"),
                _int_or_none(query.get("user_no")),
                settings=settings,
            )
            return None
    except HTTPException as exc:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    return None


def _normalize_requested_pairs(
    *,
    shop_pairs: str | None,
    shop_type: str | None,
    shop_id: str | None,
) -> list[tuple[str, str]]:
    if shop_pairs == "__none__":
        return [("__none__", "__none__")]

    pairs: list[tuple[str, str]] = []
    if shop_pairs:
        for raw_pair in shop_pairs.split(","):
            cleaned = raw_pair.strip()
            if not cleaned:
                continue
            if ":" not in cleaned:
                raise HTTPException(status_code=422, detail="shop_pairs must be SHOP_TYPE:SHOP_ID")
            raw_shop_type, raw_shop_id = cleaned.split(":", 1)
            pair = (normalize_shop_type(raw_shop_type), raw_shop_id.strip())
            if not pair[1]:
                raise HTTPException(status_code=422, detail="shop_pairs must be SHOP_TYPE:SHOP_ID")
            pairs.append(pair)
    elif shop_type and shop_id:
        pairs.append((normalize_shop_type(shop_type), shop_id.strip()))

    return pairs


def _fetch_user_shop_pairs(user_no: int) -> set[tuple[str, str]]:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                """
                select shop_type, shop_id
                from shop_accounts
                where user_no = %s
                  and coalesce(del_yn, 'N') <> 'Y'
                  and shop_type is not null
                  and shop_id is not null
                """,
                (user_no,),
            )
            rows = cursor.fetchall()
    return {(normalize_shop_type(row["shop_type"]), row["shop_id"]) for row in rows}


def _fetch_contract_owner_user_no(mbid: str) -> int | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute("select user_no from moneybank_contract where mbid = %s", (mbid,))
            row = cursor.fetchone()
    return int(row["user_no"]) if row and row["user_no"] is not None else None


def _fetch_settlement_shop_pair(settlements_id: int) -> tuple[str, str] | None:
    with get_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cursor:
            cursor.execute(
                "select shop_type, shop_id from settlement where settlements_id = %s",
                (settlements_id,),
            )
            row = cursor.fetchone()
    if not row or not row["shop_type"] or not row["shop_id"]:
        return None
    return (normalize_shop_type(row["shop_type"]), row["shop_id"])


async def _json_body(request: Request) -> dict:
    try:
        body = await request.body()
        return json.loads(body.decode("utf-8")) if body else {}
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=422, detail="invalid json body") from exc


def _int_or_none(value: object) -> int | None:
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=422, detail="invalid user_no") from exc
