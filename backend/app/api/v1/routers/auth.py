from __future__ import annotations

from fastapi import APIRouter, Depends

from app.controllers.auth_controller import AuthController
from app.core.deps import get_auth_controller, get_current_user
from app.core.exceptions import AppException, to_http_exception
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(
    payload: UserCreate,
    controller: AuthController = Depends(get_auth_controller),
):
    try:
        return await controller.register(payload)
    except AppException as e:
        raise to_http_exception(e)


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: UserLogin,
    controller: AuthController = Depends(get_auth_controller),
):
    try:
        return await controller.login(payload)
    except AppException as e:
        raise to_http_exception(e)


@router.get("/me", response_model=UserResponse)
async def me(current_user: UserResponse = Depends(get_current_user)):
    return current_user
