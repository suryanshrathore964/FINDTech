from __future__ import annotations

from typing import Any, Optional

from app.core.exceptions import NotFoundError
from app.repositories.laptop_repository import LaptopRepository
from app.schemas.laptop import LaptopResponse


class LaptopService:
    def __init__(self, laptop_repo: LaptopRepository | None = None):
        self.laptop_repo = laptop_repo or LaptopRepository()

    def _build_query(
        self,
        brand: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        search: Optional[str] = None,
    ) -> dict[str, Any]:
        query: dict[str, Any] = {}
        if brand:
            query["brand"] = {"$regex": brand, "$options": "i"}
        if min_price is not None:
            query.setdefault("price", {})["$gte"] = min_price
        if max_price is not None:
            query.setdefault("price", {})["$lte"] = max_price
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"brand": {"$regex": search, "$options": "i"}},
                {"cpu": {"$regex": search, "$options": "i"}},
                {"gpu": {"$regex": search, "$options": "i"}},
            ]
        return query

    async def list_laptops(
        self,
        brand: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        search: Optional[str] = None,
    ) -> list[LaptopResponse]:
        query = self._build_query(brand, min_price, max_price, search)
        docs = await self.laptop_repo.find_all(query, sort=[("rating", -1)])
        return [LaptopResponse.from_document(d) for d in docs]

    async def get_laptop(self, laptop_id: str) -> LaptopResponse:
        doc = await self.laptop_repo.find_by_id(laptop_id)
        if not doc:
            raise NotFoundError("Laptop")
        return LaptopResponse.from_document(doc)

    async def get_laptops_by_ids(self, laptop_ids: list[str]) -> list[LaptopResponse]:
        docs = await self.laptop_repo.find_by_ids(laptop_ids)
        return [LaptopResponse.from_document(d) for d in docs]

    async def list_brands(self) -> list[str]:
        return await self.laptop_repo.distinct_brands()
