# PURPOSE:
#   FastAPI dependencies that protect API endpoints.
#   Any route that needs authentication declares:
#       current_user: CurrentUser = Depends(get_current_user)
#
#   Any route that needs a minimum role declares:
#       _: CurrentUser = Depends(require_roles(UserRole.ADMIN))
#
# HOW IT WORKS:
#   FastAPI reads the Authorization header, extracts the Bearer token,
#   decodes the JWT, and injects the CurrentUser data class.
#   No database call is needed — all needed info is embedded in the token.
#
# HOW IT CONNECTS:
#   → api/v1/endpoints/ use these as route dependencies
#   → core/security.py provides decode_token

from dataclasses import dataclass
from typing import Callable

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.roles import UserRole, has_minimum_role
from app.core.security import decode_token
from app.core.exceptions import raise_forbidden, raise_unauthorized

# HTTPBearer reads the "Authorization: Bearer <token>" header automatically
bearer_scheme = HTTPBearer(auto_error=False)


@dataclass
class CurrentUser:
    """
    A lightweight, in-memory representation of the authenticated user.
    Data comes from the JWT payload — no database lookup required.
    This keeps protected endpoints very fast.
    """
    user_id: str
    org_id: str
    role: UserRole


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    """
    Dependency that extracts and validates the JWT access token.
    Raises HTTP 401 if no token is provided or the token is invalid.

    Usage in a route:
        @router.get("/me")
        async def get_me(current_user: CurrentUser = Depends(get_current_user)):
            ...
    """
    if not credentials:
        raise_unauthorized("Authentication token is missing.")

    token = credentials.credentials
    payload = decode_token(token)

    # Ensure this is an access token, not a refresh token
    if payload.get("type") != "access":
        raise_unauthorized("Invalid token type. Use an access token.")

    return CurrentUser(
        user_id=payload["sub"],
        org_id=payload["org_id"],
        role=UserRole(payload["role"]),
    )


def require_roles(*roles: UserRole) -> Callable:
    """
    Role guard factory. Returns a dependency that checks the user's role.
    The user must have AT LEAST the minimum role specified.

    Usage:
        # Requires ADMIN or above
        @router.delete("/{id}")
        async def delete_user(
            _: CurrentUser = Depends(require_roles(UserRole.ADMIN)),
        ):
            ...

        # Multiple roles — user must have at least ANALYST
        @router.post("/")
        async def create_doc(
            _: CurrentUser = Depends(require_roles(UserRole.ANALYST)),
        ):
            ...
    """
    minimum_role = min(roles, key=lambda r: [UserRole.VIEWER, UserRole.ANALYST, UserRole.MANAGER, UserRole.ADMIN].index(r))

    async def role_checker(
        current_user: CurrentUser = Depends(get_current_user),
    ) -> CurrentUser:
        if not has_minimum_role(current_user.role, minimum_role):
            raise_forbidden(
                f"This action requires the '{minimum_role.value}' role or higher. "
                f"Your role is '{current_user.role.value}'."
            )
        return current_user

    return role_checker
