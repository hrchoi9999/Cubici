"""API v1 router."""

from fastapi import APIRouter

from cubici_service.api.v1.endpoints import (
    accounts,
    contracts,
    documents,
    health,
    redemptions,
    risk_results,
    review_notes,
    sales,
    settlements,
)

router = APIRouter(prefix="/api")
router.include_router(health.router)
router.include_router(accounts.router)
router.include_router(sales.router)
router.include_router(settlements.router)
router.include_router(contracts.router)
router.include_router(documents.router)
router.include_router(review_notes.router)
router.include_router(redemptions.router)
router.include_router(risk_results.router)
