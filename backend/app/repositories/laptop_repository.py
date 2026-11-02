from __future__ import annotations

from typing import Any, Optional

from bson import ObjectId

from app.repositories.base import BaseRepository


class LaptopRepository(BaseRepository):
    collection_name = "laptops"

    @property
    def collection(self):
        return self.db[self.collection_name]

    async def find_all(
        self,
        query: Optional[dict[str, Any]] = None,
        sort: Optional[list[tuple[str, int]]] = None,
        limit: int = 200,
    ) -> list[dict[str, Any]]:
        cursor = self.collection.find(query or {})
        if sort:
            cursor = cursor.sort(sort)
        return await cursor.to_list(length=limit)

    async def find_by_id(self, laptop_id: str) -> Optional[dict[str, Any]]:
        try:
            return await self.collection.find_one({"_id": ObjectId(laptop_id)})
        except Exception:
            return None

    async def find_by_ids(self, laptop_ids: list[str]) -> list[dict[str, Any]]:
        oids = []
        for lid in laptop_ids:
            try:
                oids.append(ObjectId(lid))
            except Exception:
                continue
        if not oids:
            return []
        cursor = self.collection.find({"_id": {"$in": oids}})
        return await cursor.to_list(length=len(oids))

    async def distinct_brands(self) -> list[str]:
        brands = await self.collection.distinct("brand")
        return sorted(brands)

    async def distinct_use_cases(self) -> list[str]:
        cases = await self.collection.distinct("use_cases")
        return sorted(c for c in cases if c)

    async def distinct_tags(self) -> list[str]:
        tags = await self.collection.distinct("tags")
        return sorted(t for t in tags if t)

    async def count(self, query: Optional[dict[str, Any]] = None) -> int:
        return await self.collection.count_documents(query or {})

    async def aggregate(self, pipeline: list[dict[str, Any]]) -> list[dict[str, Any]]:
        cursor = self.collection.aggregate(pipeline)
        return await cursor.to_list(length=100)

    async def insert_many(self, documents: list[dict[str, Any]]) -> int:
        if not documents:
            return 0
        result = await self.collection.insert_many(documents)
        return len(result.inserted_ids)
