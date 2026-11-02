from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class MLEngineUserInput(BaseModel):
    """User profile for sklearn recommendation engine."""

    budget: float = Field(..., gt=0, description="Maximum budget (e.g. INR)")
    usage: list[str] = Field(default_factory=list, description='e.g. ["AI/ML", "Coding"]')
    battery_preference: str = Field(default="Medium", description="Low | Medium | High")
    portability: str = Field(default="Medium", description="Low | Medium | High")
    gaming: bool = False
    editing: bool = False


class MLEngineRecommendation(BaseModel):
    brand: str
    model: str
    price: int
    compatibility_score: float
    reason: str


class MLEngineResponse(BaseModel):
    recommendations: list[MLEngineRecommendation]
    engine: str = "sklearn-v1"
