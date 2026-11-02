from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pymongo.errors import ServerSelectionTimeoutError

from app.core.exceptions import AppException, to_http_exception

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        request_id = getattr(request.state, "request_id", None)
        logger.warning("AppException: %s [%s]", exc.message, request_id)
        http_exc = to_http_exception(exc)
        return JSONResponse(
            status_code=http_exc.status_code,
            content={
                "detail": exc.message,
                "request_id": request_id,
            },
        )

    @app.exception_handler(ServerSelectionTimeoutError)
    async def mongo_timeout_handler(request: Request, exc: ServerSelectionTimeoutError):
        request_id = getattr(request.state, "request_id", None)
        logger.error("MongoDB unavailable [%s]: %s", request_id, exc)
        return JSONResponse(
            status_code=503,
            content={
                "detail": (
                    "Database is unavailable. Start MongoDB locally, set MONGODB_URL to "
                    "MongoDB Atlas, or enable USE_MEMORY_DB=true for local development."
                ),
                "request_id": request_id,
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        request_id = getattr(request.state, "request_id", None)
        logger.exception("Unhandled error [%s]: %s", request_id, exc)
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
                "request_id": request_id,
            },
        )
