"""Sales and returns read-only API skeleton."""

from datetime import date

from fastapi import APIRouter, Query

from cubici_service.api.v1.schemas import DomainStatus
from cubici_service.sales.repository import (
    ProductAnalysisResponse,
    SaleListResponse,
    SaleReturnListResponse,
    get_product_analysis,
    list_sale_returns,
    list_sales,
)

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get("", response_model=DomainStatus)
def sales_status() -> DomainStatus:
    return DomainStatus(
        domain="sales",
        mode="read-only-skeleton",
        source_tables=["sale"],
        next_action="Implement paginated sales list and order detail queries.",
    )


@router.get("/orders", response_model=SaleListResponse)
def sale_orders(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    shop_pairs: str | None = Query(default=None),
    shop_type: str | None = Query(default=None),
    shop_id: str | None = Query(default=None),
    status: str | None = Query(default=None),
    keyword: str | None = Query(default=None),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
) -> SaleListResponse:
    return list_sales(
        limit=limit,
        offset=offset,
        shop_pairs=shop_pairs,
        shop_type=shop_type,
        shop_id=shop_id,
        status=status,
        keyword=keyword,
        from_date=from_date,
        to_date=to_date,
    )


@router.get("/product-analysis", response_model=ProductAnalysisResponse)
def product_analysis(
    shop_pairs: str | None = Query(default=None),
    shop_type: str | None = Query(default=None),
    shop_id: str | None = Query(default=None),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
) -> ProductAnalysisResponse:
    return get_product_analysis(
        shop_pairs=shop_pairs,
        shop_type=shop_type,
        shop_id=shop_id,
        from_date=from_date,
        to_date=to_date,
    )


@router.get("/returns", response_model=SaleReturnListResponse)
def sale_returns(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    shop_pairs: str | None = Query(default=None),
    shop_type: str | None = Query(default=None),
    shop_id: str | None = Query(default=None),
    status: str | None = Query(default=None),
    keyword: str | None = Query(default=None),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
) -> SaleReturnListResponse:
    return list_sale_returns(
        limit=limit,
        offset=offset,
        shop_pairs=shop_pairs,
        shop_type=shop_type,
        shop_id=shop_id,
        status=status,
        keyword=keyword,
        from_date=from_date,
        to_date=to_date,
    )
