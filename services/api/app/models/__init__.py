# PURPOSE:
#   Single import point for ALL models.
#   Alembic and the database module import from here to ensure
#   all models are registered on Base.metadata before migrations run.
#
# WHY THIS MATTERS:
#   If a model file is never imported, SQLAlchemy never registers its table.
#   Alembic would then miss it during `alembic revision --autogenerate`.

from app.models.organization import Organization
from app.models.user import User
from app.models.domain import Document, Chat, ChatMessage, Workflow

__all__ = [
    "Organization",
    "User",
    "Document",
    "Chat",
    "ChatMessage",
    "Workflow",
]