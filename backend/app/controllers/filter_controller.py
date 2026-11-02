from __future__ import annotations

from app.schemas.filter import AdvancedFilterRequest, FilterOptions, FilterSearchResponse
from app.services.filter_service import FilterService


class FilterController:
    def __init__(self, service: FilterService | None = None):
        self.service = service or FilterService()

    async def options(self) -> FilterOptions:
        return await self.service.get_filter_options()

    async def search(self, payload: AdvancedFilterRequest) -> FilterSearchResponse:
        return await self.service.search(payload)
