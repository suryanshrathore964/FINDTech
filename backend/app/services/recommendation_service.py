from __future__ import annotations

from app.core.exceptions import NotFoundError
from app.ml.recommendation_engine import recommendation_engine
from app.repositories.laptop_repository import LaptopRepository
from app.repositories.recommendation_repository import RecommendationRepository
from app.schemas.laptop import LaptopResponse
from app.schemas.recommendation import (
    RecommendationHistoryDetail,
    RecommendationHistoryItem,
    RecommendationPreferences,
    RecommendationResponse,
)


class RecommendationService:
    def __init__(
        self,
        laptop_repo: LaptopRepository | None = None,
        history_repo: RecommendationRepository | None = None,
    ):
        self.laptop_repo = laptop_repo or LaptopRepository()
        self.history_repo = history_repo or RecommendationRepository()

    async def generate(
        self, user_id: str, prefs: RecommendationPreferences
    ) -> RecommendationResponse:
        docs = await self.laptop_repo.find_all(limit=500)
        laptops = [LaptopResponse.from_document(d) for d in docs]
        results = recommendation_engine.recommend(laptops, prefs)

        session_id = "guest_session"
        if user_id and user_id != "guest":
            try:
                session_id = await self.history_repo.create_session(
                    user_id=user_id,
                    preferences=prefs.model_dump(),
                    result_count=len(results),
                    top_laptop_ids=[r.laptop.id for r in results],
                )
            except Exception:
                session_id = "guest_session"

        return RecommendationResponse(
            recommendations=results,
            preferences_id=session_id,
        )

    async def get_history(
        self, user_id: str, limit: int = 20, skip: int = 0
    ) -> list[RecommendationHistoryItem]:
        docs = await self.history_repo.find_by_user(user_id, limit=limit, skip=skip)
        return [
            RecommendationHistoryItem(
                id=str(d["_id"]),
                created_at=d["created_at"].isoformat(),
                count=d.get("result_count", 0),
            )
            for d in docs
        ]

    async def get_history_detail(
        self, user_id: str, session_id: str
    ) -> RecommendationHistoryDetail:
        doc = await self.history_repo.find_by_id(session_id, user_id)
        if not doc:
            raise NotFoundError("Recommendation session")

        laptop_ids = doc.get("top_laptop_ids", [])
        laptop_docs = await self.laptop_repo.find_by_ids(laptop_ids)
        laptops = [LaptopResponse.from_document(d) for d in laptop_docs]

        prefs_data = doc.get("preferences", {})
        return RecommendationHistoryDetail(
            id=str(doc["_id"]),
            created_at=doc["created_at"].isoformat(),
            preferences=RecommendationPreferences(**prefs_data),
            result_count=doc.get("result_count", 0),
            top_laptops=laptops,
        )

    async def delete_history_session(self, user_id: str, session_id: str) -> bool:
        from bson import ObjectId

        doc = await self.history_repo.find_by_id(session_id, user_id)
        if not doc:
            raise NotFoundError("Recommendation session")
        await self.history_repo.collection.delete_one(
            {"_id": ObjectId(session_id), "user_id": user_id}
        )
        return True
