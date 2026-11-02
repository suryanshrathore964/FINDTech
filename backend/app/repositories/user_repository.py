from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from bson import ObjectId

from app.repositories.base import BaseRepository


class UserRepository(BaseRepository):
    collection_name = "users"

    @property
    def collection(self):
        return self.db[self.collection_name]

    async def find_by_email(self, email: str) -> Optional[dict[str, Any]]:
        return await self.collection.find_one({"email": email.lower()})

    async def find_by_id(self, user_id: str) -> Optional[dict[str, Any]]:
        try:
            return await self.collection.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None

    async def create(self, email: str, full_name: str, hashed_password: str) -> dict[str, Any]:
        doc = {
            "email": email.lower(),
            "full_name": full_name,
            "hashed_password": hashed_password,
            "created_at": datetime.now(timezone.utc),
        }
        result = await self.collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc

    async def count(self) -> int:
        return await self.collection.count_documents({})
