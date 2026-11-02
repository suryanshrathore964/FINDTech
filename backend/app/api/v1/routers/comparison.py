from __future__ import annotations

from fastapi import APIRouter, Depends

from app.controllers.comparison_controller import ComparisonController
from app.core.deps import get_comparison_controller
from app.core.exceptions import AppException, to_http_exception
from app.schemas.comparison import ComparisonRequest, ComparisonResponse

router = APIRouter(prefix="/comparison", tags=["Comparison"])


@router.post("", response_model=ComparisonResponse)
async def compare_laptops(
    payload: ComparisonRequest,
    controller: ComparisonController = Depends(get_comparison_controller),
):
    try:
        return await controller.compare(payload)
    except AppException as e:
        raise to_http_exception(e)
