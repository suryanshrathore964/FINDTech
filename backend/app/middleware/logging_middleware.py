from __future__ import annotations

import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("findtech.access")


class LoggingMiddleware(BaseHTTPMiddleware):
    """Structured request/response logging."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        request_id = getattr(request.state, "request_id", "-")
        method = request.method
        path = request.url.path

        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000

        logger.info(
            "%s %s %s %.1fms",
            request_id[:8],
            method,
            path,
            duration_ms,
            extra={
                "status": response.status_code,
                "duration_ms": round(duration_ms, 2),
            },
        )
        return response
