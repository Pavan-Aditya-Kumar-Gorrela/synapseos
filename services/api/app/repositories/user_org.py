# PURPOSE:
#   Entity-specific repositories with custom queries beyond basic CRUD.
#   These are the ONLY place where SQL queries for these entities live.
#
# HOW IT CONNECTS:
#   → OrganizationService receives OrganizationRepository via DI
#   → UserService receives UserRepository via DI
#   → api/v1/dependencies.py creates these and injects them

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import Organization
from app.models.user import User
from app.repositories.base import BaseRepository


# ══════════════════════════════════════════════════════════
# ORGANIZATION REPOSITORY
# ══════════════════════════════════════════════════════════

class OrganizationRepository(BaseRepository[Organization]):

    def __init__(self, db: AsyncSession):
        super().__init__(Organization, db)

    async def get_by_slug(self, slug: str) -> Optional[Organization]:
        """Look up an org by its URL-safe slug. Used during registration."""
        result = await self.db.execute(
            select(Organization).where(Organization.slug == slug)
        )
        return result.scalar_one_or_none()

    async def get_active_by_id(self, id: str) -> Optional[Organization]:
        """Get an org only if it's active (not soft-deleted)."""
        result = await self.db.execute(
            select(Organization).where(
                Organization.id == id,
                Organization.is_active == True,
            )
        )
        return result.scalar_one_or_none()


# ══════════════════════════════════════════════════════════
# USER REPOSITORY
# ══════════════════════════════════════════════════════════

class UserRepository(BaseRepository[User]):

    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_email(self, email: str) -> Optional[User]:
        """Look up a user by email. Used during login."""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_by_id_and_org(self, user_id: str, org_id: str) -> Optional[User]:
        """
        Fetch a user only if they belong to the specified org.
        This is the TENANT ISOLATION query — prevents org A from reading org B's users.
        """
        result = await self.db.execute(
            select(User).where(
                User.id == user_id,
                User.organization_id == org_id,
                User.is_active == True,
            )
        )
        return result.scalar_one_or_none()

    async def get_all_by_org(
        self,
        org_id: str,
        *,
        skip: int = 0,
        limit: int = 100,
    ) -> list[User]:
        """List all active users in an organization (paginated)."""
        result = await self.db.execute(
            select(User)
            .where(User.organization_id == org_id, User.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
