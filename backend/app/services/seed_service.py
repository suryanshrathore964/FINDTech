from __future__ import annotations

import logging

from app.core.security import hash_password
from app.repositories.laptop_repository import LaptopRepository
from app.repositories.user_repository import UserRepository
from app.services.seed_data import LAPTOP_SEED_DATA

logger = logging.getLogger(__name__)


class SeedService:
    def __init__(
        self,
        laptop_repo: LaptopRepository | None = None,
        user_repo: UserRepository | None = None,
    ):
        self.laptop_repo = laptop_repo or LaptopRepository()
        self.user_repo = user_repo or UserRepository()

    async def seed_laptops_if_empty(self) -> int:
        count = await self.laptop_repo.count()
        if count == 0:
            inserted = await self.laptop_repo.insert_many(LAPTOP_SEED_DATA)
            logger.info("Seeded %d laptops", inserted)
            return inserted

        # If catalog exists, ensure all items have the updated 2026 image URLs
        docs = await self.laptop_repo.find_all(limit=500)
        from app.constants.laptop_images import resolve_laptop_image_by_name
        for doc in docs:
            name = doc.get("name", "")
            brand = doc.get("brand", "")
            curr_img = doc.get("image_url", "")
            expected_img = resolve_laptop_image_by_name(f"{brand} {name}")
            if curr_img != expected_img and "unsplash" not in curr_img:
                await self.laptop_repo.update(str(doc["_id"]), {"image_url": expected_img})

        logger.info("Laptop catalog verified (%d items)", count)
        return count

    async def seed_demo_user_if_empty(self) -> None:
        existing = await self.user_repo.find_by_email("demo@findtech.ai")
        if not existing:
            await self.user_repo.create(
                email="demo@findtech.ai",
                full_name="Lead Hardware Analyst",
                hashed_password=hash_password("DemoUser123!"),
            )
            logger.info("Default demo user seeded: demo@findtech.ai")

