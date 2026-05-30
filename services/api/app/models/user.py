# PURPOSE:
#   Defines the `users` database table.
#   Users always belong to an Organization (multi-tenant isolation).
#   Stores hashed password — never plain text.
#
# HOW IT CONNECTS:
#   → UserRepository queries this table
#   → UserService contains business logic
#   → auth/dependencies.py loads the current user from this table

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.roles import UserRole


class User(Base):
    """
    A person who can log in to SynapseOS.
    Always scoped to a single Organization.
    """

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    # Foreign key to organizations table — enforces tenant isolation at DB level
    organization_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Unique per organization is enforced in the service layer.
    # The DB-level unique constraint is on email alone for simplicity,
    # but the service checks org-scoped uniqueness.
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)

    # NEVER store plain-text passwords
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # Role-based access control
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role", values_callable=lambda x: [role.value for role in UserRole]),
        default=UserRole.VIEWER,
        nullable=False,
    )

    # Soft-delete: deactivated users cannot log in
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────────────
    organization: Mapped["Organization"] = relationship(
        "Organization", back_populates="users"
    )
    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="uploader", lazy="noload"
    )
    chats: Mapped[list["Chat"]] = relationship(
        "Chat", back_populates="user", lazy="noload"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
