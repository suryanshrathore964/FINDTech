from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.controllers.recommendation_controller import RecommendationController
from app.core.deps import get_current_user, get_optional_user, get_recommendation_controller
from app.core.exceptions import AppException, to_http_exception
from app.schemas.recommendation import (
    RecommendationHistoryDetail,
    RecommendationHistoryItem,
    RecommendationPreferences,
    RecommendationResponse,
)
from app.schemas.user import UserResponse

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.post("", response_model=RecommendationResponse)
async def generate_recommendations(
    prefs: RecommendationPreferences,
    current_user: UserResponse | None = Depends(get_optional_user),
    controller: RecommendationController = Depends(get_recommendation_controller),
):
    try:
        user_id = current_user.id if current_user else "guest"
        return await controller.generate(user_id, prefs)
    except AppException as e:
        raise to_http_exception(e)


@router.get("/history", response_model=list[RecommendationHistoryItem])
async def list_history(
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    current_user: UserResponse = Depends(get_current_user),
    controller: RecommendationController = Depends(get_recommendation_controller),
):
    return await controller.history(current_user.id, limit, skip)


@router.get("/history/{session_id}", response_model=RecommendationHistoryDetail)
async def get_history_session(
    session_id: str,
    current_user: UserResponse = Depends(get_current_user),
    controller: RecommendationController = Depends(get_recommendation_controller),
):
    try:
        return await controller.history_detail(current_user.id, session_id)
    except AppException as e:
        raise to_http_exception(e)


@router.delete("/history/{session_id}")
async def delete_history_session(
    session_id: str,
    current_user: UserResponse = Depends(get_current_user),
    controller: RecommendationController = Depends(get_recommendation_controller),
):
    try:
        return await controller.delete_history(current_user.id, session_id)
    except AppException as e:
        raise to_http_exception(e)
