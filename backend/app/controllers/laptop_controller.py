from __future__ import annotations

from typing import Optional

from app.schemas.laptop import LaptopResponse
from app.services.laptop_service import LaptopService


class LaptopController:
    def __init__(self, service: LaptopService | None = None):
        self.service = service or LaptopService()

    async def list_laptops(
        self,
        brand: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        search: Optional[str] = None,
    ) -> list[LaptopResponse]:
        return await self.service.list_laptops(brand, min_price, max_price, search)

    async def get_laptop(self, laptop_id: str) -> LaptopResponse:
        return await self.service.get_laptop(laptop_id)

    async def list_brands(self) -> list[str]:
        return await self.service.list_brands()
