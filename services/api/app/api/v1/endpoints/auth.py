# app/api/v1/endpoints/auth.py
#
# PURPOSE:
#   Auth API endpoints. Routes are THIN — they:
#     1. Accept request data (validated by Pydantic automatically)
#     2. Call the service
#     3. Return the response
#   Zero business logic here.
#
# ENDPOINTS:
#   POST /api/v1/auth/register  → Create org + admin user, get tokens
#   POST /api/v1/auth/login     → Get tokens
#   POST /api/v1/auth/refresh   → Get new access token
#   POST /api/v1/auth/logout    → (Client-side: discard tokens)

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new organization and admin user",
)
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> RegisterResponse:
    """
    Creates a new organization and its first admin user in one step.
    Returns JWT tokens immediately — no separate login required.
    """
    service = AuthService(db)
    return await service.register(payload)


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login with email and password",
)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Authenticates the user and returns access + refresh tokens.
    Store the access_token and send it as: `Authorization: Bearer <token>`
    """
    service = AuthService(db)
    return await service.login(payload)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Get a new access token using a refresh token",
)
async def refresh(
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    When the access token expires (after 30 minutes), call this endpoint
    with the refresh token to get a new access token.
    No re-login needed for 7 days.
    """
    service = AuthService(db)
    return await service.refresh(payload)


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Logout (client-side token discard)",
)
async def logout() -> None:
    """
    In a stateless JWT system, 'logout' means the client discards the tokens.
    In production, implement a token blacklist using Redis:
      - Store the token's JTI (JWT ID) in Redis with TTL = token expiry
      - On every request, check if the JTI is blacklisted
    That implementation is stubbed here for now.
    """
    # TODO: Add token to Redis blacklist
    return None
