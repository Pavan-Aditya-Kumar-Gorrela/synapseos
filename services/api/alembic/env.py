# alembic/env.py
#
# PURPOSE:
#   Alembic's migration runner. This file is called by the `alembic` CLI.
#   It connects to the database and applies/generates migrations.
#
#   IMPORTANT: We're using async SQLAlchemy, so we need the async-compatible
#   Alembic setup using `run_async_migrations`.
#
# HOW IT CONNECTS:
#   → Imports Base from core/database.py (has all model metadata)
#   → Imports all models via app/models/__init__.py
#   → Uses DATABASE_URL from settings
import os
import sys

sys.path.append(
    os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )
)
import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

# Import our Base and all models so Alembic knows about all tables
from app.core.database import Base
from app.core.config import settings
import app.models  # noqa — This import registers all models on Base.metadata

# Alembic Config object
config = context.config

# Set the database URL dynamically from our settings
# This overrides whatever is in alembic.ini
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL.replace("%", "%%"))  # Escape % for config parser

# Set up Python logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# This is the MetaData object Alembic inspects to auto-generate migrations
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.
    Generates SQL scripts without connecting to the DB.
    Useful for reviewing SQL before applying.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """
    Run migrations against the live database using async engine.
    This is what actually runs when you do `alembic upgrade head`.
    """
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,  # Don't pool connections during migrations
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
