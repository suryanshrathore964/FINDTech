from __future__ import annotations

from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.user_repository import UserRepository
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserResponse


class AuthService:
    def __init__(self, user_repo: UserRepository | None = None):
        self.user_repo = user_repo or UserRepository()

    async def register(self, payload: UserCreate) -> TokenResponse:
        existing = await self.user_repo.find_by_email(payload.email)
        if existing:
            raise ConflictError("Email already registered")

        doc = await self.user_repo.create(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hash_password(payload.password),
        )
        user = UserResponse.from_document(doc)
        token = create_access_token(str(doc["_id"]))
        return TokenResponse(access_token=token, user=user)

    async def login(self, payload: UserLogin) -> TokenResponse:
        doc = await self.user_repo.find_by_email(payload.email)
        if not doc or not verify_password(payload.password, doc["hashed_password"]):
            raise UnauthorizedError("Invalid email or password")

        user = UserResponse.from_document(doc)
        token = create_access_token(str(doc["_id"]))
        return TokenResponse(access_token=token, user=user)

    async def get_user(self, user_id: str) -> UserResponse:
        doc = await self.user_repo.find_by_id(user_id)
        if not doc:
            raise UnauthorizedError("User not found")
        return UserResponse.from_document(doc)
