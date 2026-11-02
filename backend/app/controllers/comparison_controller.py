from __future__ import annotations

from app.schemas.comparison import ComparisonRequest, ComparisonResponse
from app.services.comparison_service import ComparisonService


class ComparisonController:
    def __init__(self, service: ComparisonService | None = None):
        self.service = service or ComparisonService()

    async def compare(self, payload: ComparisonRequest) -> ComparisonResponse:
        return await self.service.compare(payload.laptop_ids)
