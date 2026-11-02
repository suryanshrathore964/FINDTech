from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.laptop import LaptopResponse


class ComparisonRequest(BaseModel):
    laptop_ids: list[str] = Field(..., min_length=2, max_length=4)


class CategoryWinner(BaseModel):
    category: str
    winner_id: str
    winner_name: str
    reason: str


class ComparisonResponse(BaseModel):
    laptops: list[LaptopResponse]
    winners: list[CategoryWinner]
    summary: str
