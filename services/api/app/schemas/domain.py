# PURPOSE:
#   Pydantic schemas for Documents, Chats, ChatMessages, and Workflows.
#
# HOW IT CONNECTS:
#   → api/v1/endpoints/ use these as request/response models

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class DocumentRead(BaseModel):
    id:                str
    organization_id:   str
    uploaded_by:       Optional[str]
    filename:          str
    original_filename: str
    file_type:         str
    file_size:         int
    storage_path:      str
    extracted_text:    Optional[str]
    status:            str
    created_at:        datetime
    updated_at:        datetime

    model_config = {"from_attributes": True}


class DocumentListItem(BaseModel):
    """Lighter schema for list endpoints — omits extracted_text."""
    id:                str
    organization_id:   str
    uploaded_by:       Optional[str]
    filename:          str
    original_filename: str
    file_type:         str
    file_size:         int
    status:            str
    created_at:        datetime
    updated_at:        datetime

    model_config = {"from_attributes": True}


# DocumentCreate is now internal-only (service constructs it, not clients)
class DocumentCreate(BaseModel):
    filename:          str
    original_filename: str
    file_type:         str
    file_size:         int
    storage_path:      str


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

class ChatMessageCreate(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1)


class ChatRead(BaseModel):
    id: str
    organization_id: str
    user_id: str
    title: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatCreate(BaseModel):
    title: str = Field(default="New Chat", max_length=500)




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
