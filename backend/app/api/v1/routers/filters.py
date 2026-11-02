from __future__ import annotations

from fastapi import APIRouter, Depends

from app.controllers.filter_controller import FilterController
from app.core.deps import get_filter_controller
from app.schemas.filter import AdvancedFilterRequest, FilterOptions, FilterSearchResponse

router = APIRouter(prefix="/filters", tags=["Filters"])


@router.get("/options", response_model=FilterOptions)
async def filter_options(
    controller: FilterController = Depends(get_filter_controller),
):
    return await controller.options()


@router.post("/search", response_model=FilterSearchResponse)
async def advanced_search(
    payload: AdvancedFilterRequest,
    controller: FilterController = Depends(get_filter_controller),
):
    return await controller.search(payload)
