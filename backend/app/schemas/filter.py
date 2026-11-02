from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.laptop import LaptopResponse


class FilterOptions(BaseModel):
    brands: list[str]
    use_cases: list[str]
    tags: list[str]
    price_min: float
    price_max: float
    ram_options: list[int]
    storage_options: list[int]


class AdvancedFilterRequest(BaseModel):
    brands: list[str] = []
    use_cases: list[str] = []
    tags: list[str] = []
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_ram_gb: Optional[int] = Field(None, ge=4)
    max_ram_gb: Optional[int] = None
    min_storage_gb: Optional[int] = Field(None, ge=128)
    min_battery_hours: Optional[float] = None
    max_weight_kg: Optional[float] = None
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    search: Optional[str] = None
    sort_by: str = Field(default="rating", pattern="^(rating|price|price_desc|name|battery)$")
    limit: int = Field(default=50, ge=1, le=200)
    skip: int = Field(default=0, ge=0)


class FilterSearchResponse(BaseModel):
    total: int
    skip: int
    limit: int
    laptops: list[LaptopResponse]
