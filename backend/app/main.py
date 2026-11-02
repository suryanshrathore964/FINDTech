import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.api.v1.router import api_router
from app.config import get_settings
from app.database import close_db, connect_db
from app.middleware import (
    LoggingMiddleware,
    RequestIDMiddleware,
    register_exception_handlers,
)
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.services.seed_service import SeedService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    try:
        settings.validate_production()
        logger.info("Production configuration validated")
    except ValueError as e:
        if settings.is_production:
            logger.error("Production config error: %s", e)
            raise
        logger.warning("Config warning (dev): %s", e)

    await connect_db()
    try:
        seed_svc = SeedService()
        await seed_svc.seed_laptops_if_empty()
        await seed_svc.seed_demo_user_if_empty()
    except Exception as e:
        logger.warning("Could not seed database: %s", e)
    yield
    await close_db()


def create_app() -> FastAPI:
    settings = get_settings()

    # Disable OpenAPI UI in production unless explicitly enabled
    docs_url = None if settings.is_production else "/docs"
    redoc_url = None if settings.is_production else "/redoc"
    openapi_url = None if settings.is_production else "/openapi.json"

    app = FastAPI(
        title=settings.app_name,
        description="FINDtech — AI-powered laptop recommendation API",
        version="1.0.0",
        lifespan=lifespan,
        docs_url=docs_url,
        redoc_url=redoc_url,
        openapi_url=openapi_url,
    )

    register_exception_handlers(app)

    # Trusted hosts (Render: set ALLOWED_HOSTS=your-api.onrender.com)
    if settings.is_production and "*" not in settings.allowed_hosts_list:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts_list)

    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(LoggingMiddleware)

    # CORS — credentials required for JWT in Authorization header from browser
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept", "X-Request-ID"],
        expose_headers=["X-Request-ID"],
        max_age=600,
    )

    app.include_router(api_router, prefix="/api/v1")

    @app.get("/health", tags=["Health"])
    async def health():
        return {
            "status": "ok",
            "service": settings.app_name,
            "version": "1.0.0",
            "environment": settings.environment,
        }

    @app.get("/", include_in_schema=False)
    async def root():
        return {
            "service": settings.app_name,
            "health": "/health",
            "api": "/api/v1",
        }

    return app


app = create_app()
