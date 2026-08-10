"""Settlement read-only API skeleton."""

from datetime import date

from fastapi import APIRouter, HTTPException, Query

from cubici_service.settlements.repository import (
    SettlementListItem,
    SettlementListResponse,
    SettlementOrderBy,
    get_settlement_detail,
    list_settlements,
)

router = APIRouter(prefix="/settlements", tags=["settlements"])


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
    )


@router.get("/{settlements_id}", response_model=SettlementListItem)
def settlement_detail(settlements_id: int) -> SettlementListItem:
    detail = get_settlement_detail(settlements_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="settlement not found")
    return detail
