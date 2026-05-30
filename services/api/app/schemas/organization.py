# PURPOSE:
#   Pydantic v2 schemas for Organization API contracts.
#   Schemas define WHAT goes in and WHAT comes out of API endpoints.
#   They are completely separate from SQLAlchemy models.
#
# PATTERN:
#   OrganizationCreate  → data the client sends to CREATE
#   OrganizationUpdate  → data the client sends to UPDATE (all optional)
#   OrganizationRead    → data the server sends BACK to the client
#
# HOW IT CONNECTS:
#   → api/v1/endpoints/organizations.py uses these as request/response types
#   → OrganizationService.create() accepts OrganizationCreate

from datetime import datetime
from pydantic import BaseModel, Field, field_validator
import re


class OrganizationCreate(BaseModel):
    """Schema for creating a new organization (and the first admin user)."""
    name: str = Field(..., min_length=2, max_length=255, examples=["Acme Corp"])
    slug: str = Field(..., min_length=2, max_length=100, examples=["acme-corp"])

    @field_validator("slug")
    @classmethod
    def slug_must_be_url_safe(cls, v: str) -> str:
        """Slugs must contain only lowercase letters, numbers, and hyphens."""
        if not re.match(r"^[a-z0-9-]+$", v):
            raise ValueError("Slug must contain only lowercase letters, numbers, and hyphens.")
        return v


class OrganizationRead(BaseModel):
    """Schema returned to clients when querying an organization."""
    id: str
    name: str
    slug: str
    plan: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    # `model_config = {"from_attributes": True}` is the Pydantic v2 way to say
    # "I can be constructed from a SQLAlchemy ORM object, not just a dict."
    model_config = {"from_attributes": True}
