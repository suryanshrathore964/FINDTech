from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.laptop import LaptopResponse


class RecommendationPreferences(BaseModel):
    budget_min: float = Field(ge=0, default=500)
    budget_max: float = Field(ge=0, default=3000)
    primary_use: str = "work"
    portability: int = Field(ge=1, le=10, default=5)
    performance: int = Field(ge=1, le=10, default=5)
    battery_priority: int = Field(ge=1, le=10, default=5)
    brand_preferences: list[str] = []
    ram_min: int = Field(ge=4, default=8)
    storage_min: int = Field(ge=128, default=256)


class RecommendationResult(BaseModel):
    laptop: LaptopResponse
    match_score: float = Field(ge=0, le=1)
    reasons: list[str]


class RecommendationResponse(BaseModel):
    recommendations: list[RecommendationResult]
    preferences_id: Optional[str] = None


class RecommendationHistoryItem(BaseModel):
    id: str
    created_at: str
    count: int


class RecommendationHistoryDetail(BaseModel):
    id: str
    created_at: str
    preferences: RecommendationPreferences
    result_count: int
    top_laptops: list[LaptopResponse]
