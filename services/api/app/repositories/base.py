# PURPOSE:
#   Generic base repository providing common database operations.
#   All entity-specific repositories inherit from this to avoid repeating code.
#
#   This is the Repository Pattern:
#     - All SQL queries live here, NOT in routes or services
#     - Services call repositories; routes call services
#     - Makes testing easy: swap the real DB for a mock
#
# HOW IT CONNECTS:
#   → OrganizationRepository, UserRepository, etc. extend BaseRepository
#   → Services receive repositories via dependency injection

from typing import Any, Generic, Optional, Type, TypeVar
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base

# TypeVar lets us write one generic class that works for any model
ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Generic async CRUD repository.

    Usage:
        class UserRepository(BaseRepository[User]):
            def __init__(self, db: AsyncSession):
                super().__init__(User, db)
    """

    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db

    async def get_by_id(self, id: str) -> Optional[ModelType]:
        """Fetch a single record by primary key. Returns None if not found."""
        result = await self.db.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def get_all(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        **filters: Any,
    ) -> list[ModelType]:
        """
        Fetch all records with optional filtering and pagination.

        Example:
            await repo.get_all(organization_id="org-123", skip=0, limit=20)
        """
        stmt = select(self.model)

        # Dynamically apply filters: get_all(is_active=True) adds WHERE is_active = true
        for field, value in filters.items():
            if value is not None:
                stmt = stmt.where(getattr(self.model, field) == value)

        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create(self, obj: ModelType) -> ModelType:
        """Persist a new record to the database."""
        self.db.add(obj)
        await self.db.commit()
        await self.db.refresh(obj)  # Reload from DB to get server-generated values (timestamps, etc.)
        return obj

    async def update(self, obj: ModelType) -> ModelType:
        """Persist changes to an existing record."""
        self.db.add(obj)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def delete(self, obj: ModelType) -> None:
        """Hard delete a record. Prefer soft-delete (setting is_active=False) for most entities."""
        await self.db.delete(obj)
        await self.db.commit()
