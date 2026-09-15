"""Settlement read-only API skeleton."""

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from cubici_service.core.access_control import (
    authorized_settlement_shop_pairs,
    request_access_settings,
    require_master_admin_or_settlement_owner,
)

from cubici_service.settlements.repository import (
    SettlementListItem,
    SettlementListResponse,
    SettlementOrderBy,
    get_settlement_detail,
    list_settlements,
)

router = APIRouter(prefix="/settlements", tags=["settlements"])


def _settlement_list_scope(
    request: Request,
    shop_pairs: str | None = Query(default=None),
    shop_type: str | None = Query(default=None),
    shop_id: str | None = Query(default=None),
) -> list[tuple[str, str]] | None:
    return authorized_settlement_shop_pairs(
        request.headers.get("authorization"), shop_pairs=shop_pairs,
        shop_type=shop_type, shop_id=shop_id, settings=request_access_settings(request),
    )


def _authorize_settlement_detail(request: Request, settlements_id: int) -> None:
    require_master_admin_or_settlement_owner(
        request.headers.get("authorization"), settlements_id, settings=request_access_settings(request),
    )


@router.get("", response_model=SettlementListResponse)
def settlement_list(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    shop_pairs: str | None = Query(default=None),
    shop_type: str | None = Query(default=None),
    shop_id: str | None = Query(default=None),
    status: str | None = Query(default=None),
    keyword: str | None = Query(default=None),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    order_by: SettlementOrderBy = Query(default="date_desc"),
    owner_shop_pairs: Annotated[list[tuple[str, str]] | None, Depends(_settlement_list_scope)] = None,
) -> SettlementListResponse:
    return list_settlements(
        limit=limit,
        offset=offset,
        shop_pairs=shop_pairs,
        shop_type=shop_type,
        shop_id=shop_id,
        status=status,
        keyword=keyword,
        from_date=from_date,
        to_date=to_date,
        order_by=order_by,
        **({"owner_shop_pairs": owner_shop_pairs} if owner_shop_pairs is not None else {}),
    )


@router.get(
    "/{settlements_id}", response_model=SettlementListItem,
    dependencies=[Depends(_authorize_settlement_detail)],
)
def settlement_detail(settlements_id: int) -> SettlementListItem:
    detail = get_settlement_detail(settlements_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="settlement not found")
    return detail
