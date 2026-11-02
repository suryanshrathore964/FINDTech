from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class BrandDistribution(BaseModel):
    brand: str
    count: int
    percentage: float


class PriceRangeBucket(BaseModel):
    range_label: str
    min_price: float
    max_price: float
    count: int


class UseCaseDistribution(BaseModel):
    use_case: str
    count: int


class CatalogAnalytics(BaseModel):
    total_laptops: int
    avg_price: float
    avg_rating: float
    brands: list[BrandDistribution]
    price_ranges: list[PriceRangeBucket]
    use_cases: list[UseCaseDistribution]


class UserAnalytics(BaseModel):
    total_sessions: int
    total_matches: int
    avg_matches_per_session: float
    recent_activity_days: int


class AnalyticsOverview(BaseModel):
    catalog: CatalogAnalytics
    users_count: int
    total_recommendation_sessions: int


class TrendingLaptopItem(BaseModel):
    id: str
    name: str
    brand: str
    price: float
    rating: float
    image_url: str
