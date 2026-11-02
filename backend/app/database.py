from __future__ import annotations

import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ServerSelectionTimeoutError

from app.config import get_settings
from app.db.memory import MemoryDatabase

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None
_memory_db: MemoryDatabase | None = None


def is_memory_mode() -> bool:
    return _memory_db is not None


async def connect_db() -> None:
    global _client, _memory_db
    settings = get_settings()

    if settings.use_memory_db:
        _memory_db = MemoryDatabase(settings.mongodb_db_name)
        logger.info("Using in-memory database (USE_MEMORY_DB=true)")
        return

    _client = AsyncIOMotorClient(
        settings.mongodb_url,
        serverSelectionTimeoutMS=5000,
    )
    try:
        await _client.admin.command("ping")
        await _ensure_indexes()
        logger.info("Connected to MongoDB")
    except ServerSelectionTimeoutError as e:
        if settings.environment == "development":
            logger.warning(
                "MongoDB unavailable (%s). Falling back to in-memory store for local dev.",
                e,
            )
            _client.close()
            _client = None
            _memory_db = MemoryDatabase(settings.mongodb_db_name)
        else:
            raise


async def close_db() -> None:
    global _client, _memory_db
    if _client:
        _client.close()
        _client = None
    _memory_db = None


def get_database() -> AsyncIOMotorDatabase | MemoryDatabase:
    if _memory_db is not None:
        return _memory_db
    if _client is None:
        raise RuntimeError("Database not initialized. Call connect_db() first.")
    return _client[get_settings().mongodb_db_name]


async def _ensure_indexes() -> None:
    if _client is None or _memory_db is not None:
        return
    db = _client[get_settings().mongodb_db_name]
    try:
        await db.users.create_index("email", unique=True)
        await db.laptops.create_index([("brand", 1), ("price", 1)])
        await db.laptops.create_index([("rating", -1)])
        await db.laptops.create_index([("use_cases", 1)])
        await db.recommendation_history.create_index([("user_id", 1), ("created_at", -1)])
        logger.info("Database indexes ensured")
    except Exception as e:
        logger.warning("Index creation skipped: %s", e)
