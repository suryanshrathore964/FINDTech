from __future__ import annotations

from app.schemas.recommendation import (
    RecommendationHistoryDetail,
    RecommendationHistoryItem,
    RecommendationPreferences,
    RecommendationResponse,
)
from app.services.recommendation_service import RecommendationService


class RecommendationController:
    def __init__(self, service: RecommendationService | None = None):
        self.service = service or RecommendationService()

    async def generate(
        self, user_id: str, prefs: RecommendationPreferences
    ) -> RecommendationResponse:
        return await self.service.generate(user_id, prefs)

    async def history(
        self, user_id: str, limit: int = 20, skip: int = 0
    ) -> list[RecommendationHistoryItem]:
        return await self.service.get_history(user_id, limit, skip)

    async def history_detail(
        self, user_id: str, session_id: str
    ) -> RecommendationHistoryDetail:
        return await self.service.get_history_detail(user_id, session_id)

    async def delete_history(self, user_id: str, session_id: str) -> dict:
        await self.service.delete_history_session(user_id, session_id)
        return {"deleted": True, "id": session_id}
