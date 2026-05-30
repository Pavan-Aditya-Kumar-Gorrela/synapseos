# PURPOSE:
#   Sets up the async SQLAlchemy engine and session factory.
#   Provides a reusable `get_db` dependency for FastAPI routes.
#   All database I/O in SynapseOS is fully async — no blocking calls.
#
# HOW IT CONNECTS:
#   → models/ import Base to declare their table mappings
#   → repositories/ receive AsyncSession via dependency injection
#   → alembic/env.py imports Base.metadata for migrations

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


# ── Declarative Base ──────────────────────────────────────────────────────────
# All SQLAlchemy models must inherit from this Base.
# It tracks all table definitions so Alembic can auto-generate migrations.
class Base(DeclarativeBase):
    pass


# ── Async Engine ──────────────────────────────────────────────────────────────
# `create_async_engine` is the async version of SQLAlchemy's engine.
# `pool_pre_ping=True` tests connections before use — important for
# long-running servers where DB connections can go stale.
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG,  # Logs all SQL in debug mode — useful during development
)

# ── Session Factory ───────────────────────────────────────────────────────────
# `async_sessionmaker` creates a factory that produces AsyncSession objects.
# `expire_on_commit=False` means objects remain usable after a commit,
# which is essential in async contexts where we might still read data after saving.
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ── Dependency: get_db ────────────────────────────────────────────────────────
# This is a FastAPI dependency. Routes declare `db: AsyncSession = Depends(get_db)`
# and FastAPI automatically:
#   1. Opens a DB session before the route runs
#   2. Passes the session to the route
#   3. Closes the session (via the finally block) after the response is sent
#
# Using `yield` makes this a "generator dependency" — code after yield runs
# as cleanup regardless of whether the request succeeded or failed.
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
