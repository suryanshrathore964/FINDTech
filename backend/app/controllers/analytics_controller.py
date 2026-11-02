from __future__ import annotations

from app.schemas.analytics import AnalyticsOverview, CatalogAnalytics, TrendingLaptopItem, UserAnalytics
from app.services.analytics_service import AnalyticsService


class AnalyticsController:
    def __init__(self, service: AnalyticsService | None = None):
        self.service = service or AnalyticsService()

    async def overview(self) -> AnalyticsOverview:
        return await self.service.get_overview()

    async def catalog(self) -> CatalogAnalytics:
        return await self.service.get_catalog_analytics()

    async def user_stats(self, user_id: str) -> UserAnalytics:
        return await self.service.get_user_analytics(user_id)

    async def trending(self, limit: int = 10) -> list[TrendingLaptopItem]:
        return await self.service.get_trending(limit)
