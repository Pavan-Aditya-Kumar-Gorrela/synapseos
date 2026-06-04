# PURPOSE:
#   Defines tables for Documents, Chats, ChatMessages, and Workflows.
#   All are scoped to an organization_id — this is how multi-tenancy works.
#
# HOW IT CONNECTS:
#   → Repositories query these tables
#   → Services contain business logic
#   → API endpoints return schemas built from these models

import uuid
import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class DocumentStatus(str, enum.Enum):
    UPLOADING   = "uploading"
    PROCESSING  = "processing"
    READY       = "ready"
    FAILED      = "failed"


class Document(Base):
    __tablename__ = "documents"

    id:               Mapped[str]  = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id:  Mapped[str]  = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by:      Mapped[str]  = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    filename:          Mapped[str] = mapped_column(String(500),  nullable=False)          # unique stored name
    original_filename: Mapped[str] = mapped_column(String(500),  nullable=False)          # user-facing name
    file_type:         Mapped[str] = mapped_column(String(100),  nullable=False)
    file_size:         Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    storage_path:      Mapped[str] = mapped_column(String(1000), nullable=False)
    extracted_text:    Mapped[str | None] = mapped_column(Text, nullable=True)
    status:            Mapped[DocumentStatus] = mapped_column(
                                                    SAEnum(
                                                        DocumentStatus,
                                                        values_callable=lambda x: [e.value for e in x],
                                                        name="documentstatus",
                                                    ),
                                                    default=DocumentStatus.UPLOADING,
                                                    nullable=False,
                                                )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    organization: Mapped["Organization"] = relationship("Organization", back_populates="documents")
    uploader:     Mapped["User"]         = relationship("User",         back_populates="documents")

    def __repr__(self) -> str:
        return f"<Document id={self.id} filename={self.filename} status={self.status}>"

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
