from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.controllers.analytics_controller import AnalyticsController
from app.core.deps import get_analytics_controller, get_current_user
from app.schemas.analytics import (
    AnalyticsOverview,
    CatalogAnalytics,
    TrendingLaptopItem,
    UserAnalytics,
)
from app.schemas.user import UserResponse

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
async def analytics_overview(
    controller: AnalyticsController = Depends(get_analytics_controller),
):
    return await controller.overview()


@router.get("/catalog", response_model=CatalogAnalytics)
async def catalog_analytics(
    controller: AnalyticsController = Depends(get_analytics_controller),
):
    return await controller.catalog()


@router.get("/trending", response_model=list[TrendingLaptopItem])
async def trending_laptops(
    limit: int = Query(10, ge=1, le=50),
    controller: AnalyticsController = Depends(get_analytics_controller),
):
    return await controller.trending(limit)


@router.get("/user", response_model=UserAnalytics)
async def user_analytics(
    current_user: UserResponse = Depends(get_current_user),
    controller: AnalyticsController = Depends(get_analytics_controller),
):
    return await controller.user_stats(current_user.id)
