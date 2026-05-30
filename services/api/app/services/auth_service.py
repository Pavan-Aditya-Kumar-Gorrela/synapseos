# PURPOSE:
#   All authentication business logic lives here.
#   Routes are thin — they just call service methods.
#
# FLOW:
#   register() → creates org + admin user atomically
#   login()    → verifies credentials, issues tokens
#   refresh()  → validates refresh token, issues new access token
#   logout()   → (token blacklist would go here in production)
#
# HOW IT CONNECTS:
#   → api/v1/endpoints/auth.py calls these methods
#   → Uses OrganizationRepository and UserRepository
#   → Uses core/security.py for hashing and JWT

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.core.exceptions import raise_conflict, raise_unauthorized
from app.core.roles import UserRole
from app.models.organization import Organization
from app.models.user import User
from app.repositories.user_org import OrganizationRepository, UserRepository
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    LoginResponse,
    TokenResponse,
)
from app.schemas.auth import UserRead


class AuthService:
    """
    Handles all authentication operations.
    Instantiated per-request with a fresh DB session.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.org_repo = OrganizationRepository(db)

    async def register(self, data: RegisterRequest) -> RegisterResponse:
        """
        Register a new organization and its first admin user.

        Steps:
          1. Check that the org slug is not already taken
          2. Check that the email is not already registered
          3. Create the Organization
          4. Create the admin User (hashed password)
          5. Issue JWT tokens
          6. Return user + tokens
        """

        # Step 1: Slug uniqueness
        existing_org = await self.org_repo.get_by_slug(data.organization_slug)
        if existing_org:
            raise_conflict(f"Organization slug '{data.organization_slug}' is already taken.")

        # Step 2: Email uniqueness
        existing_user = await self.user_repo.get_by_email(data.email)
        if existing_user:
            raise_conflict(f"An account with email '{data.email}' already exists.")

        # Step 3: Create Organization
        org = Organization(
            name=data.organization_name,
            slug=data.organization_slug,
            plan="free",
        )
        org = await self.org_repo.create(org)

        # Step 4: Create admin User
        user = User(
            organization_id=org.id,
            email=data.email,
            full_name=data.full_name,
            hashed_password=hash_password(data.password),
            role=UserRole.VIEWER.value,  # First user is always admin
        )
        user = await self.user_repo.create(user)

        # Step 5: Issue tokens
        tokens = self._issue_tokens(user)

        # Step 6: Return
        return RegisterResponse(
            user=UserRead.model_validate(user),
            tokens=tokens,
        )

    async def login(self, data: LoginRequest) -> LoginResponse:
        """
        Authenticate a user with email + password.

        Security note:
          We always call verify_password even if the user doesn't exist.
          This prevents timing attacks that could reveal whether an email is registered.
        """
        user = await self.user_repo.get_by_email(data.email)

        if not user or not verify_password(data.password, user.hashed_password):
            # Deliberately vague error message — don't reveal whether the email exists
            raise_unauthorized("Incorrect email or password.")

        if not user.is_active:
            raise_unauthorized("This account has been deactivated.")
        tokens = self._issue_tokens(user)
        return {
            "user": UserRead.model_validate(user),
            "access_token": tokens.access_token,
            "refresh_token": tokens.refresh_token,
            "token_type": tokens.token_type,
        }

    async def refresh(self, data: RefreshRequest) -> TokenResponse:
        """
        Issue a new access token using a valid refresh token.
        The refresh token is decoded and validated; then a fresh access token is created.
        """
        payload = decode_token(data.refresh_token)

        if payload.get("type") != "refresh":
            raise_unauthorized("Invalid token type.")

        user_id = payload.get("sub")
        user = await self.user_repo.get_by_id(user_id)

        if not user or not user.is_active:
            raise_unauthorized("User not found or deactivated.")

        return self._issue_tokens(user)

    def _issue_tokens(self, user: User) -> TokenResponse:
        """Internal helper: creates both tokens for a user."""
        access_token = create_access_token(
            user_id=user.id,
            org_id=user.organization_id,
            role=user.role.value,
        )
        refresh_token = create_refresh_token(user_id=user.id)
        return TokenResponse(access_token=access_token, refresh_token=refresh_token)
