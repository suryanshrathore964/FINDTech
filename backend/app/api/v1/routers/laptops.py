from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.controllers.laptop_controller import LaptopController
from app.core.deps import get_laptop_controller
from app.core.exceptions import AppException, to_http_exception
from app.schemas.laptop import LaptopResponse

router = APIRouter(prefix="/laptops", tags=["Laptops"])


@router.get("", response_model=list[LaptopResponse])
async def list_laptops(
    brand: Optional[str] = None,
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    search: Optional[str] = None,
    controller: LaptopController = Depends(get_laptop_controller),
):
    return await controller.list_laptops(brand, min_price, max_price, search)


@router.get("/brands/list", response_model=list[str])
async def list_brands(controller: LaptopController = Depends(get_laptop_controller)):
    return await controller.list_brands()


@router.get("/{laptop_id}", response_model=LaptopResponse)
async def get_laptop(
    laptop_id: str,
    controller: LaptopController = Depends(get_laptop_controller),
):
    try:
        return await controller.get_laptop(laptop_id)
    except AppException as e:
        raise to_http_exception(e)
