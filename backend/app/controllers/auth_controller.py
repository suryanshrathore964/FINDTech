from __future__ import annotations

from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserResponse
from app.services.auth_service import AuthService


class AuthController:
    def __init__(self, service: AuthService | None = None):
        self.service = service or AuthService()

    async def register(self, payload: UserCreate) -> TokenResponse:
        return await self.service.register(payload)

    async def login(self, payload: UserLogin) -> TokenResponse:
        return await self.service.login(payload)

    async def me(self, user_id: str) -> UserResponse:
        return await self.service.get_user(user_id)
