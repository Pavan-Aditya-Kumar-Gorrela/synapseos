# PURPOSE:
#   Defines the `organizations` database table.
#   An Organization is the top-level tenant in SynapseOS.
#   Every user, document, chat, and workflow belongs to one org.
#
# HOW IT CONNECTS:
#   → users, documents, chats, workflows all have organization_id FK
#   → OrganizationRepository queries this table
#   → OrganizationService contains business logic around this model

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Organization(Base):
    """
    Multi-tenant anchor. Each row is one tenant / company.
    """

    __tablename__ = "organizations"

    # Primary key — UUID is used instead of integer for:
    #   1. Security: IDs can't be enumerated by incrementing
    #   2. Distributed systems: No coordination needed to generate unique IDs
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    # Human-readable name
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # URL-safe unique identifier, e.g., "acme-corp"
    # Used in API paths and subdomains
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)

    # Subscription plan: "free", "pro", "enterprise"
    plan: Mapped[str] = mapped_column(String(50), default="free", nullable=False)

    # Soft-delete flag. Never hard-delete organizations.
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Timestamps — server_default uses the DB's NOW() function
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
    # `back_populates` creates a two-way link:
    #   org.users         → list of User objects
    #   user.organization → the parent Organization
    users: Mapped[list["User"]] = relationship(
        "User", back_populates="organization", lazy="noload"
    )
    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="organization", lazy="noload"
    )
    chats: Mapped[list["Chat"]] = relationship(
        "Chat", back_populates="organization", lazy="noload"
    )
    workflows: Mapped[list["Workflow"]] = relationship(
        "Workflow", back_populates="organization", lazy="noload"
    )

    def __repr__(self) -> str:
        return f"<Organization id={self.id} slug={self.slug}>"
