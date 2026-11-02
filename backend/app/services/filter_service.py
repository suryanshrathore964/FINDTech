from __future__ import annotations

from typing import Any, Optional

from app.repositories.laptop_repository import LaptopRepository
from app.schemas.filter import AdvancedFilterRequest, FilterOptions, FilterSearchResponse
from app.schemas.laptop import LaptopResponse


class FilterService:
    def __init__(self, laptop_repo: LaptopRepository | None = None):
        self.laptop_repo = laptop_repo or LaptopRepository()

    async def get_filter_options(self) -> FilterOptions:
        docs = await self.laptop_repo.find_all(limit=500)
        prices = [d["price"] for d in docs] if docs else [0]
        ram_set = sorted({d["ram_gb"] for d in docs})
        storage_set = sorted({d["storage_gb"] for d in docs})

        return FilterOptions(
            brands=await self.laptop_repo.distinct_brands(),
            use_cases=await self.laptop_repo.distinct_use_cases(),
            tags=await self.laptop_repo.distinct_tags(),
            price_min=min(prices),
            price_max=max(prices),
            ram_options=ram_set,
            storage_options=storage_set,
        )

    def _build_advanced_query(self, filters: AdvancedFilterRequest) -> dict[str, Any]:
        query: dict[str, Any] = {}

        if filters.brands:
            query["brand"] = {"$in": filters.brands}
        if filters.use_cases:
            query["use_cases"] = {"$in": filters.use_cases}
        if filters.tags:
            query["tags"] = {"$in": filters.tags}
        if filters.min_price is not None:
            query.setdefault("price", {})["$gte"] = filters.min_price
        if filters.max_price is not None:
            query.setdefault("price", {})["$lte"] = filters.max_price
        if filters.min_ram_gb is not None:
            query.setdefault("ram_gb", {})["$gte"] = filters.min_ram_gb
        if filters.max_ram_gb is not None:
            query.setdefault("ram_gb", {})["$lte"] = filters.max_ram_gb
        if filters.min_storage_gb is not None:
            query.setdefault("storage_gb", {})["$gte"] = filters.min_storage_gb
        if filters.min_battery_hours is not None:
            query.setdefault("battery_hours", {})["$gte"] = filters.min_battery_hours
        if filters.max_weight_kg is not None:
            query.setdefault("weight_kg", {})["$lte"] = filters.max_weight_kg
        if filters.min_rating is not None:
            query["rating"] = {"$gte": filters.min_rating}
        if filters.search:
            query["$or"] = [
                {"name": {"$regex": filters.search, "$options": "i"}},
                {"brand": {"$regex": filters.search, "$options": "i"}},
                {"cpu": {"$regex": filters.search, "$options": "i"}},
                {"gpu": {"$regex": filters.search, "$options": "i"}},
            ]
        return query

    def _sort_key(self, sort_by: str) -> list[tuple[str, int]]:
        mapping = {
            "rating": [("rating", -1)],
            "price": [("price", 1)],
            "price_desc": [("price", -1)],
            "name": [("name", 1)],
            "battery": [("battery_hours", -1)],
        }
        return mapping.get(sort_by, [("rating", -1)])

    async def search(self, filters: AdvancedFilterRequest) -> FilterSearchResponse:
        query = self._build_advanced_query(filters)
        total = await self.laptop_repo.count(query)
        sort = self._sort_key(filters.sort_by)

        all_docs = await self.laptop_repo.find_all(query, sort=sort, limit=filters.skip + filters.limit)
        docs = all_docs[filters.skip : filters.skip + filters.limit]
        laptops = [LaptopResponse.from_document(d) for d in docs]

        return FilterSearchResponse(
            total=total,
            skip=filters.skip,
            limit=filters.limit,
            laptops=laptops,
        )
