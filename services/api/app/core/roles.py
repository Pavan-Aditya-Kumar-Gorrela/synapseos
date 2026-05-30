# PURPOSE:
#   Defines the Role enum shared across models, schemas, and auth logic.
#   Keeping it here (not inside a model file) prevents circular imports.
#
# HOW IT CONNECTS:
#   → models/user.py uses UserRole as the column type
#   → auth/dependencies.py uses require_roles() to protect endpoints
#   → schemas/user.py exposes roles in API responses

from enum import Enum


class UserRole(str, Enum):
    """
    Role hierarchy (highest to lowest privilege):
      ADMIN   → Full access. Can manage org, users, all resources.
      MANAGER → Can manage team resources. Cannot manage billing/org settings.
      ANALYST → Read + write access to data resources.
      VIEWER  → Read-only access.

    `str` mixin means the enum value IS a string.
    This allows SQLAlchemy to store it as a plain VARCHAR,
    and Pydantic to serialize it cleanly in JSON responses.
    """
    ADMIN = "admin"
    MANAGER = "manager"
    ANALYST = "analyst"
    VIEWER = "viewer"


# Role hierarchy for permission checks
ROLE_HIERARCHY = {
    UserRole.ADMIN: 4,
    UserRole.MANAGER: 3,
    UserRole.ANALYST: 2,
    UserRole.VIEWER: 1,
}


def has_minimum_role(user_role: UserRole, required_role: UserRole) -> bool:
    """
    Returns True if the user's role meets or exceeds the required role.

    Example:
        has_minimum_role(UserRole.MANAGER, UserRole.ANALYST) → True
        has_minimum_role(UserRole.VIEWER, UserRole.ADMIN)    → False
    """
    return ROLE_HIERARCHY.get(user_role, 0) >= ROLE_HIERARCHY.get(required_role, 0)
