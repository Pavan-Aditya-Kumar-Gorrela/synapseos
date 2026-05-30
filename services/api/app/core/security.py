# PURPOSE:
#   Low-level cryptographic operations:
#     - bcrypt password hashing & verification
#     - JWT access token creation & verification
#     - JWT refresh token creation & verification
#
# HOW IT CONNECTS:
#   → auth/service.py calls these functions to hash passwords and issue tokens
#   → auth/dependencies.py calls verify_token to protect routes

from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings
from app.core.exceptions import raise_unauthorized


# ── Password Utilities ────────────────────────────────────────────────────────

def hash_password(plain_password: str) -> str:
    """
    Hash a plain-text password using bcrypt.
    bcrypt automatically generates a unique salt each time,
    so the same password hashed twice produces different results.
    The salt is stored inside the hash — no need to store it separately.
    """
    password_bytes = plain_password.encode("utf-8")
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt(rounds=12))
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Check whether a plain-text password matches a stored bcrypt hash.
    Returns True if they match, False otherwise.
    """
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


# ── JWT Utilities ─────────────────────────────────────────────────────────────

def _create_token(data: dict[str, Any], expires_delta: timedelta) -> str:
    """
    Internal helper. Creates a signed JWT with an expiry timestamp.
    The `sub` claim (subject) typically holds the user's ID.
    """
    payload = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    payload["exp"] = expire
    payload["iat"] = datetime.now(timezone.utc)  # issued-at
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(user_id: str, org_id: str, role: str) -> str:
    """
    Creates a short-lived JWT access token (default: 30 minutes).
    Embeds user_id, org_id, and role so we don't need a DB lookup
    on every protected request.
    """
    data = {
        "sub": user_id,
        "org_id": org_id,
        "role": role,
        "type": "access",
    }
    return _create_token(data, timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))


def create_refresh_token(user_id: str) -> str:
    """
    Creates a long-lived JWT refresh token (default: 7 days).
    Contains minimal data — only the user_id.
    Used to issue a new access token without re-login.
    """
    data = {
        "sub": user_id,
        "type": "refresh",
    }
    return _create_token(data, timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))


def decode_token(token: str) -> dict[str, Any]:
    """
    Decodes and validates a JWT token.
    Raises HTTP 401 if the token is expired or has an invalid signature.
    Returns the full payload dict on success.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except JWTError:
        raise_unauthorized("Token is invalid or has expired.")
