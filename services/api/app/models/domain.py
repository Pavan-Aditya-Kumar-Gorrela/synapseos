# PURPOSE:
#   Defines tables for Documents, Chats, ChatMessages, and Workflows.
#   All are scoped to an organization_id — this is how multi-tenancy works.
#
# HOW IT CONNECTS:
#   → Repositories query these tables
#   → Services contain business logic
#   → API endpoints return schemas built from these models

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# ═══════════════════════════════════════════════════════════════════════════════
# DOCUMENT
# ═══════════════════════════════════════════════════════════════════════════════

class Document(Base):
    """
    Represents a file uploaded by a user.
    In the future this will integrate with RAG (vector search on file contents).

    `storage_path` is the path in object storage (e.g., S3 or local filesystem).
    The actual file is NOT stored in the database — only the metadata.
    """
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    filename: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(100), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(1000), nullable=False)

    # "pending" → "processing" → "ready" | "failed"
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="documents")
    uploader: Mapped["User"] = relationship("User", back_populates="documents")

    def __repr__(self) -> str:
        return f"<Document id={self.id} filename={self.filename}>"


# ═══════════════════════════════════════════════════════════════════════════════
# CHAT & CHAT MESSAGE
# ═══════════════════════════════════════════════════════════════════════════════

class Chat(Base):
    """
    A conversation thread between a user and the AI.
    One Chat has many ChatMessages.

    In the future this will integrate with LangGraph multi-agent workflows.
    """
    __tablename__ = "chats"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False, default="New Chat")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="chats")
    user: Mapped["User"] = relationship("User", back_populates="chats")
    messages: Mapped[list["ChatMessage"]] = relationship(
        "ChatMessage", back_populates="chat", lazy="noload", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Chat id={self.id} title={self.title}>"


class ChatMessage(Base):
    """
    A single message inside a Chat.
    `role` is either "user" (human) or "assistant" (AI).
    This mirrors the OpenAI/Anthropic message format.
    """
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chat_id: Mapped[str] = mapped_column(String(36), ForeignKey("chats.id", ondelete="CASCADE"), nullable=False, index=True)

    # "user" or "assistant"
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship
    chat: Mapped["Chat"] = relationship("Chat", back_populates="messages")

    def __repr__(self) -> str:
        return f"<ChatMessage id={self.id} role={self.role}>"


# ═══════════════════════════════════════════════════════════════════════════════
# WORKFLOW
# ═══════════════════════════════════════════════════════════════════════════════

class Workflow(Base):
    """
    An automated pipeline (e.g., document processing, data extraction).
    In the future, this will be powered by LangGraph and Celery.

    `status`: "draft" | "active" | "paused" | "archived"
    """
    __tablename__ = "workflows"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship
    organization: Mapped["Organization"] = relationship("Organization", back_populates="workflows")

    def __repr__(self) -> str:
        return f"<Workflow id={self.id} name={self.name} status={self.status}>"
