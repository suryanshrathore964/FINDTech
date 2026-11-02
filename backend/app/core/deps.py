from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.controllers.analytics_controller import AnalyticsController
from app.controllers.auth_controller import AuthController
from app.controllers.comparison_controller import ComparisonController
from app.controllers.filter_controller import FilterController
from app.controllers.laptop_controller import LaptopController
from app.controllers.recommendation_controller import RecommendationController
from app.core.exceptions import AppException, to_http_exception
from app.core.security import decode_access_token
from app.schemas.user import UserResponse

security = HTTPBearer(auto_error=False)


def get_auth_controller() -> AuthController:
    return AuthController()


def get_laptop_controller() -> LaptopController:
    return LaptopController()


def get_recommendation_controller() -> RecommendationController:
    return RecommendationController()


def get_comparison_controller() -> ComparisonController:
    return ComparisonController()


def get_analytics_controller() -> AnalyticsController:
    return AnalyticsController()


def get_filter_controller() -> FilterController:
    return FilterController()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    auth: AuthController = Depends(get_auth_controller),
) -> UserResponse:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    try:
        return await auth.me(payload["sub"])
    except AppException as e:
        raise to_http_exception(e)


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    auth: AuthController = Depends(get_auth_controller),
) -> UserResponse | None:
    if not credentials:
        return None
    try:
        return await get_current_user(credentials, auth)
    except HTTPException:
        return None
