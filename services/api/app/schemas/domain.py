# PURPOSE:
#   Pydantic schemas for Documents, Chats, ChatMessages, and Workflows.
#
# HOW IT CONNECTS:
#   → api/v1/endpoints/ use these as request/response models

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ══════════════════════════════════════════════════════════
# DOCUMENT SCHEMAS
# ══════════════════════════════════════════════════════════

class DocumentRead(BaseModel):
    id: str
    organization_id: str
    uploaded_by: Optional[str]
    filename: str
    file_type: str
    storage_path: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentCreate(BaseModel):
    """Used internally by DocumentService after a file upload."""
    filename: str
    file_type: str
    storage_path: str


# ══════════════════════════════════════════════════════════
# CHAT SCHEMAS
# ══════════════════════════════════════════════════════════

class ChatMessageRead(BaseModel):
    id: str
    chat_id: str
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatRead(BaseModel):
    id: str
    organization_id: str
    user_id: str
    title: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatCreate(BaseModel):
    title: str = Field(default="New Chat", max_length=500)


class SendMessageRequest(BaseModel):
    """Body for sending a message inside a chat."""
    content: str = Field(..., min_length=1)


# ══════════════════════════════════════════════════════════
# WORKFLOW SCHEMAS
# ══════════════════════════════════════════════════════════

class WorkflowRead(BaseModel):
    id: str
    organization_id: str
    name: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class WorkflowCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
