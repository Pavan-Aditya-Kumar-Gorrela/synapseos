# PURPOSE:
#   Defines all custom exceptions used across SynapseOS.
#   Having a central exceptions module means:
#     - Services raise semantic errors (e.g., UserNotFoundError)
#     - Routes catch them and return proper HTTP responses
#     - No HTTPException leaks into service/repository layers
#
# HOW IT CONNECTS:
#   → services/ raise these exceptions
#   → api/v1/endpoints/ catch them and return HTTP responses
#   → main.py registers global exception handlers

from fastapi import HTTPException, status


# ── Base Exception ────────────────────────────────────────────────────────────
class SynapseBaseException(Exception):
    """Base class for all SynapseOS custom exceptions."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


# ── Auth Exceptions ───────────────────────────────────────────────────────────
class InvalidCredentialsError(SynapseBaseException):
    pass

class TokenExpiredError(SynapseBaseException):
    pass

class TokenInvalidError(SynapseBaseException):
    pass

class InsufficientPermissionsError(SynapseBaseException):
    pass


# ── Resource Exceptions ───────────────────────────────────────────────────────
class NotFoundError(SynapseBaseException):
    pass

class AlreadyExistsError(SynapseBaseException):
    pass

class OrganizationNotFoundError(NotFoundError):
    pass

class UserNotFoundError(NotFoundError):
    pass

class DocumentNotFoundError(NotFoundError):
    pass

class ChatNotFoundError(NotFoundError):
    pass

class WorkflowNotFoundError(NotFoundError):
    pass


# ── HTTP Exception Factories ──────────────────────────────────────────────────
# These are convenience functions that convert our domain exceptions
# into FastAPI HTTPExceptions with proper status codes.

def raise_not_found(resource: str, id: str | int) -> None:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{resource} with id '{id}' not found.",
    )

def raise_conflict(message: str) -> None:
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=message,
    )

def raise_unauthorized(message: str = "Authentication required.") -> None:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=message,
        headers={"WWW-Authenticate": "Bearer"},
    )

def raise_forbidden(message: str = "You do not have permission to perform this action.") -> None:
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=message,
    )
