# app/api/v1/endpoints/organizations.py

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.auth.dependencies import CurrentUser, get_current_user
from app.schemas.organization import OrganizationRead, OrganizationUpdate
from app.services.domain_services import OrganizationService

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.get("/me", response_model=OrganizationRead, summary="Get my organization's details")
async def get_my_org(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrganizationRead:
    """Returns the organization the current user belongs to."""
    service = OrganizationService(db)
    return await service.get_my_org(current_user.org_id)

@router.patch("/me", response_model=OrganizationRead, summary="Update my organization's details")
async def update_my_org(
    org_data: OrganizationUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrganizationRead:
    """Update the details of the organization the current user belongs to."""
    service = OrganizationService(db)
    return await service.update_my_org(current_user.org_id, org_data)
