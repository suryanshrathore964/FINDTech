from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from bson import ObjectId

from app.repositories.base import BaseRepository


class RecommendationRepository(BaseRepository):
    collection_name = "recommendation_history"

    @property
    def collection(self):
        return self.db[self.collection_name]

    async def create_session(
        self,
        user_id: str,
        preferences: dict[str, Any],
        result_count: int,
        top_laptop_ids: list[str],
    ) -> str:
        doc = {
            "user_id": user_id,
            "preferences": preferences,
            "result_count": result_count,
            "top_laptop_ids": top_laptop_ids,
            "created_at": datetime.now(timezone.utc),
        }
        result = await self.collection.insert_one(doc)
        return str(result.inserted_id)

    async def find_by_user(
        self, user_id: str, limit: int = 20, skip: int = 0
    ) -> list[dict[str, Any]]:
        cursor = (
            self.collection.find({"user_id": user_id})
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        return await cursor.to_list(length=limit)

    async def find_by_id(self, session_id: str, user_id: str) -> Optional[dict[str, Any]]:
        try:
            return await self.collection.find_one(
                {"_id": ObjectId(session_id), "user_id": user_id}
            )
        except Exception:
            return None

    async def count_by_user(self, user_id: str) -> int:
        return await self.collection.count_documents({"user_id": user_id})

    async def aggregate_user_stats(self, user_id: str) -> dict[str, Any]:
        pipeline = [
            {"$match": {"user_id": user_id}},
            {
                "$group": {
                    "_id": None,
                    "total_sessions": {"$sum": 1},
                    "total_matches": {"$sum": "$result_count"},
                    "avg_matches": {"$avg": "$result_count"},
                }
            },
        ]
        cursor = self.collection.aggregate(pipeline)
        results = await cursor.to_list(length=1)
        if not results:
            return {"total_sessions": 0, "total_matches": 0, "avg_matches": 0}
        r = results[0]
        return {
            "total_sessions": r.get("total_sessions", 0),
            "total_matches": int(r.get("total_matches", 0)),
            "avg_matches": round(r.get("avg_matches", 0), 1),
        }
