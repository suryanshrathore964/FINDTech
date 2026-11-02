from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database


class BaseRepository:
    """Base repository with shared database access."""

    def __init__(self, db: AsyncIOMotorDatabase | None = None):
        self._db = db

    @property
    def db(self) -> AsyncIOMotorDatabase:
        if self._db is None:
            return get_database()
        return self._db
