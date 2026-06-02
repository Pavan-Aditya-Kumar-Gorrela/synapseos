# PURPOSE:
#   Pydantic schemas for User data and Auth API contracts.
#   Ensures passwords are NEVER returned in API responses.
#
# HOW IT CONNECTS:
#   → auth/router.py uses RegisterRequest, LoginRequest, TokenResponse
#   → users/router.py uses UserRead
#   → AuthService and UserService accept/return these schemas

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

from app.core.roles import UserRole


# ══════════════════════════════════════════════════════════
# USER SCHEMAS
# ══════════════════════════════════════════════════════════

class UserRead(BaseModel):
    """What the API returns when a user is fetched. No password!"""
    id: str
    organization_id: str
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    """Internal schema — service layer uses this to create users."""
    organization_id: str
    email: EmailStr
    full_name: str
    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.VIEWER

class UserUpdate(BaseModel):
    """Schema for updating user profile. All fields optional."""
    full_name: str | None = Field(None, min_length=2, max_length=255)
    password: str | None = Field(None, min_length=8)
    


# ══════════════════════════════════════════════════════════
# AUTH SCHEMAS
# ══════════════════════════════════════════════════════════

class RegisterRequest(BaseModel):
    """
    Body sent to POST /auth/register.
    Creates an organization AND the first admin user in one step.
    """
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, description="At least 8 characters")
    organization_name: str = Field(..., min_length=2, max_length=255)
    organization_slug: str = Field(..., min_length=2, max_length=100)


class LoginRequest(BaseModel):
    """Body sent to POST /auth/login."""
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    """Returned after successful login."""
    user: UserRead
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenResponse(BaseModel):
    """
    Returned after successful login or token refresh.
    The client stores access_token and sends it in every request header:
        Authorization: Bearer <access_token>
    The refresh_token is stored securely (httpOnly cookie ideally)
    and sent to POST /auth/refresh when the access token expires.
    """
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    """Body sent to POST /auth/refresh."""
    refresh_token: str


class RegisterResponse(BaseModel):
    """Returned after successful registration."""
    user: UserRead
    tokens: TokenResponse
