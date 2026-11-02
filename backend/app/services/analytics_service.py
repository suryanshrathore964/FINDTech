from __future__ import annotations

from app.constants.laptop_images import resolve_laptop_image_url
from app.repositories.laptop_repository import LaptopRepository
from app.repositories.recommendation_repository import RecommendationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.analytics import (
    AnalyticsOverview,
    BrandDistribution,
    CatalogAnalytics,
    PriceRangeBucket,
    TrendingLaptopItem,
    UseCaseDistribution,
    UserAnalytics,
)
from app.schemas.laptop import LaptopResponse


class AnalyticsService:
    def __init__(
        self,
        laptop_repo: LaptopRepository | None = None,
        user_repo: UserRepository | None = None,
        history_repo: RecommendationRepository | None = None,
    ):
        self.laptop_repo = laptop_repo or LaptopRepository()
        self.user_repo = user_repo or UserRepository()
        self.history_repo = history_repo or RecommendationRepository()

    async def get_catalog_analytics(self) -> CatalogAnalytics:
        total = await self.laptop_repo.count()
        docs = await self.laptop_repo.find_all(limit=500)

        if not docs:
            return CatalogAnalytics(
                total_laptops=0,
                avg_price=0,
                avg_rating=0,
                brands=[],
                price_ranges=[],
                use_cases=[],
            )

        prices = [d["price"] for d in docs]
        ratings = [d.get("rating", 0) for d in docs]
        avg_price = sum(prices) / len(prices)
        avg_rating = sum(ratings) / len(ratings)

        brand_counts: dict[str, int] = {}
        for d in docs:
            brand_counts[d["brand"]] = brand_counts.get(d["brand"], 0) + 1
        brands = [
            BrandDistribution(
                brand=b,
                count=c,
                percentage=round(c / total * 100, 1),
            )
            for b, c in sorted(brand_counts.items(), key=lambda x: -x[1])
        ]

        buckets = [
            (0, 800, "Budget"),
            (800, 1500, "Mid-range"),
            (1500, 2500, "Premium"),
            (2500, 10000, "Ultra"),
        ]
        price_ranges = []
        for lo, hi, label in buckets:
            count = sum(1 for p in prices if lo <= p < hi)
            price_ranges.append(
                PriceRangeBucket(
                    range_label=label,
                    min_price=float(lo),
                    max_price=float(hi),
                    count=count,
                )
            )

        use_case_counts: dict[str, int] = {}
        for d in docs:
            for uc in d.get("use_cases", []):
                use_case_counts[uc] = use_case_counts.get(uc, 0) + 1
        use_cases = [
            UseCaseDistribution(use_case=uc, count=c)
            for uc, c in sorted(use_case_counts.items(), key=lambda x: -x[1])
        ]

        return CatalogAnalytics(
            total_laptops=total,
            avg_price=round(avg_price, 2),
            avg_rating=round(avg_rating, 2),
            brands=brands,
            price_ranges=price_ranges,
            use_cases=use_cases,
        )

    async def get_overview(self) -> AnalyticsOverview:
        catalog = await self.get_catalog_analytics()
        users_count = await self.user_repo.count()
        total_sessions = await self.history_repo.collection.count_documents({})

        return AnalyticsOverview(
            catalog=catalog,
            users_count=users_count,
            total_recommendation_sessions=total_sessions,
        )

    async def get_user_analytics(self, user_id: str) -> UserAnalytics:
        stats = await self.history_repo.aggregate_user_stats(user_id)
        return UserAnalytics(
            total_sessions=stats["total_sessions"],
            total_matches=stats["total_matches"],
            avg_matches_per_session=stats["avg_matches"],
            recent_activity_days=7,
        )

    async def get_trending(self, limit: int = 10) -> list[TrendingLaptopItem]:
        docs = await self.laptop_repo.find_all(sort=[("rating", -1), ("price", -1)], limit=limit)
        return [
            TrendingLaptopItem(
                id=str(d["_id"]),
                name=d["name"],
                brand=d["brand"],
                price=d["price"],
                rating=d.get("rating", 0),
                image_url=resolve_laptop_image_url(str(d["_id"]), d.get("image_url")),
            )
            for d in docs
        ]
