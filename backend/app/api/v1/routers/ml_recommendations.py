from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.core.deps import get_current_user
from app.schemas.ml_engine import MLEngineResponse, MLEngineUserInput
from app.schemas.user import UserResponse
from app.services.ml_engine_service import recommend_from_ml_engine

router = APIRouter(prefix="/ml", tags=["ML Engine"])


@router.post("/recommend", response_model=MLEngineResponse)
async def ml_recommend(
    payload: MLEngineUserInput,
    top_k: int = Query(5, ge=1, le=10),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Recommend laptops using the modular Scikit-learn engine.

    Uses weighted scoring, cosine similarity, and explanation generation.
    """
    results = recommend_from_ml_engine(payload.model_dump(), top_k=top_k)
    return MLEngineResponse(recommendations=results)
