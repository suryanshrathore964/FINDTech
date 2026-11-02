from fastapi import APIRouter

from app.api.v1.routers import (
    analytics,
    auth,
    comparison,
    filters,
    laptops,
    ml_recommendations,
    recommendations,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(laptops.router)
api_router.include_router(recommendations.router)
api_router.include_router(ml_recommendations.router)
api_router.include_router(comparison.router)
api_router.include_router(analytics.router)
api_router.include_router(filters.router)
