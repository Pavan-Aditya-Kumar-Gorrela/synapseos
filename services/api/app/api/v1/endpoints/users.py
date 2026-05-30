# app/api/v1/endpoints/users.py
#
# All user-related API endpoints

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.roles import UserRole
from app.auth.dependencies import CurrentUser, get_current_user, require_roles
from app.schemas.auth import UserRead
from app.services.domain_services import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserRead, summary="Get current user's profile")
async def get_me(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    """Returns the profile of the currently authenticated user."""
    service = UserService(db)
    return await service.get_me(current_user.user_id)


@router.get(
    "",
    response_model=list[UserRead],
    summary="List all users in my organization",
    dependencies=[Depends(require_roles(UserRole.MANAGER))],  # Managers and above
)
async def list_users(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
) -> list[UserRead]:
    """Lists all users in the authenticated user's organization."""
    service = UserService(db)
    return await service.list_users(current_user.org_id, skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserRead, summary="Get a specific user")
async def get_user(
    user_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    """Get a user by ID. User must be in the same organization."""
    service = UserService(db)
    return await service.get_user(user_id, current_user.org_id)
