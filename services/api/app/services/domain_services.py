# PURPOSE:
#   Business logic services for all domain entities.
#   Services are the middle layer: Routes → Services → Repositories → DB
#
# RULE: NO SQL in services. NO HTTP in services.
#   Services use repositories for DB and raise domain exceptions.
#   Routes convert domain exceptions into HTTP responses.

from email import message
import logging
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import raise_not_found, raise_forbidden
from app.models.domain import Chat, ChatMessage, Document, Workflow, DocumentStatus
from app.repositories.domain import (
    ChatMessageRepository,
    ChatRepository,
    DocumentRepository,
    WorkflowRepository,
)
from fastapi import UploadFile
from app.repositories.user_org import OrganizationRepository, UserRepository
from app.schemas.auth import UserRead, UserUpdate
from app.schemas.domain import (
    ChatCreate,
    ChatRead,
    ChatMessageRead,
    ChatMessageCreate,
    DocumentCreate,
    DocumentRead,
    DocumentListItem,
    WorkflowCreate,
    WorkflowRead,
)
from app.services.storage_service import StorageService
from app.services.document_processor import DocumentProcessor
from app.schemas.organization import OrganizationRead, OrganizationUpdate
from app.core.security import hash_password

logger = logging.getLogger(__name__)

# ══════════════════════════════════════════════════════════
# USER SERVICE
# ══════════════════════════════════════════════════════════


class UserService:

    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    async def get_me(self, user_id: str) -> UserRead:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise_not_found("User", user_id)
        return UserRead.model_validate(user)

    async def list_users(self, org_id: str, skip: int = 0, limit: int = 100) -> list[UserRead]:
        users = await self.repo.get_all_by_org(org_id, skip=skip, limit=limit)
        return [UserRead.model_validate(u) for u in users]

    async def get_user(self, user_id: str, org_id: str) -> UserRead:
        """
        Get a specific user, enforcing that they're in the same org.
        This is tenant isolation at the service layer.
        """
        user = await self.repo.get_by_id_and_org(user_id, org_id)
        if not user:
            raise_not_found("User", user_id)
        return UserRead.model_validate(user)

    async def update_user(self, user_id: str, user_data: UserUpdate) -> UserRead:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise_not_found("User", user_id)
        # Update user fields
        updated_data = user_data.model_dump(exclude_unset=True)
        if "full_name" in updated_data:
            user.full_name = updated_data["full_name"]
        if "password" in updated_data:
            user.hashed_password = hash_password(updated_data["password"])
        updated_user = await self.repo.update(user)
        return UserRead.model_validate(updated_user)

# ══════════════════════════════════════════════════════════
# ORGANIZATION SERVICE
# ══════════════════════════════════════════════════════════

class OrganizationService:

    def __init__(self, db: AsyncSession):
        self.repo = OrganizationRepository(db)

    async def get_my_org(self, org_id: str) -> OrganizationRead:
        org = await self.repo.get_active_by_id(org_id)
        if not org:
            raise_not_found("Organization", org_id)
        return OrganizationRead.model_validate(org)
    
    async def update_my_org(self, org_id: str, org_data: OrganizationUpdate) -> OrganizationRead:
        org = await self.repo.get_active_by_id(org_id)
        if not org:
            raise_not_found("Organization", org_id)
        # Update org fields
        updated_data = org_data.model_dump(exclude_unset=True)
        if "name" in updated_data:
            org.name = updated_data["name"]
        if "slug" in updated_data:
            org.slug = updated_data["slug"]
        updated_org = await self.repo.update(org)
        return OrganizationRead.model_validate(updated_org)


# ══════════════════════════════════════════════════════════
# DOCUMENT SERVICE
# ══════════════════════════════════════════════════════════

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
    "text/csv",
    "application/csv",
}

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024   # 50 MB

class DocumentService:

    def __init__(self, db: AsyncSession):
        self.repo = DocumentRepository(db)

    async def ingest_upload(
        self,
        org_id: str,
        user_id: str,
        file: UploadFile,
    ) -> DocumentRead:
        """
        Full upload pipeline:
          1. Validate type + size
          2. Save file to disk
          3. Create DB record (UPLOADING)
          4. Extract text → READY  |  on failure → FAILED
        """
        # ── 1. Validate ───────────────────────────────────────────
        content_type = file.content_type or ""
        if content_type not in ALLOWED_MIME_TYPES:
            from app.core.exceptions import raise_bad_request
            raise_bad_request(
                f"Unsupported file type '{content_type}'. "
                f"Allowed: PDF, DOCX, TXT, CSV."
            )

        # Size check — read into memory only to measure, then rewind
        file.file.seek(0, 2)                  # seek to end
        file_size = file.file.tell()
        file.file.seek(0)                     # rewind

        if file_size > MAX_FILE_SIZE_BYTES:
            from app.core.exceptions import raise_bad_request
            raise_bad_request(
                f"File too large ({file_size // (1024*1024)} MB). Max 50 MB."
            )

        # ── 2. Save file ──────────────────────────────────────────
        unique_filename, storage_path, saved_size = StorageService.save_file(file, org_id)

        # ── 3. Create DB record ───────────────────────────────────
        doc = Document(
            organization_id=org_id,
            uploaded_by=user_id,
            filename=unique_filename,
            original_filename=file.filename or unique_filename,
            file_type=content_type,
            file_size=saved_size,
            storage_path=storage_path,
            status=DocumentStatus.PROCESSING,
        )
        doc = await self.repo.create(doc)

        # ── 4. Extract text ───────────────────────────────────────
        try:
            extracted = DocumentProcessor.extract_text(storage_path, content_type)
            doc.extracted_text = extracted
            doc.status = DocumentStatus.READY
        except Exception as exc:
            logger.error("Text extraction failed for doc %s: %s", doc.id, exc)
            doc.status = DocumentStatus.FAILED

        doc = await self.repo.update(doc)
        return DocumentRead.model_validate(doc)

    async def list_documents(
        self,
        org_id: str,
        skip: int = 0,
        limit: int = 50,
        search: str | None = None,
    ) -> list[DocumentListItem]:
        docs = await self.repo.get_all_by_org(org_id, skip=skip, limit=limit, search=search)
        return [DocumentListItem.model_validate(d) for d in docs]

    async def get_document(self, org_id: str, doc_id: str) -> DocumentRead:
        doc = await self.repo.get_by_id_and_org(doc_id, org_id)
        if not doc:
            raise_not_found("Document", doc_id)
        return DocumentRead.model_validate(doc)

    async def delete_document(self, org_id: str, doc_id: str) -> None:
        doc = await self.repo.get_by_id_and_org(doc_id, org_id)
        if not doc:
            raise_not_found("Document", doc_id)
        StorageService.delete_file(doc.storage_path)
        await self.repo.delete_by_id_and_org(doc_id, org_id)



# ══════════════════════════════════════════════════════════
# CHAT SERVICE
# ══════════════════════════════════════════════════════════

class ChatService:

    def __init__(self, db: AsyncSession):
        self.repo = ChatRepository(db)

    async def create_chat(self, org_id: str, user_id: str, data: ChatCreate) -> ChatRead:
        chat = Chat(
            organization_id=org_id,
            user_id=user_id,
            title=data.title,
        )
        chat = await self.repo.create(chat)
        return ChatRead.model_validate(chat)

    async def list_chats(self, org_id: str, user_id: str) -> list[ChatRead]:
        chats = await self.repo.get_all_by_org_and_user(org_id, user_id)
        return [ChatRead.model_validate(c) for c in chats]
    
    async def get_chat(self, org_id: str, user_id: str, chat_id: str) -> ChatRead:
        chat = await self.repo.get_by_id(chat_id)
        if not chat or chat.organization_id != org_id or chat.user_id != user_id:
            raise_not_found("Chat", chat_id)
        return ChatRead.model_validate(chat)
    

class ChatMessageService:

    def __init__(self, db: AsyncSession):
        self.repo = ChatMessageRepository(db)
        self.repo2 = ChatRepository(db)

    async def send_message(self, org_id: str, user_id: str, chat_id: str, message_data: ChatMessageCreate) -> ChatMessageRead:
        chat = await self.repo2.get_by_id(chat_id)
        if not chat or chat.organization_id != org_id or chat.user_id != user_id:
            raise_not_found("Chat", chat_id)
        message = ChatMessage(
            chat_id=chat_id,
            role=message_data.role,
            content=message_data.content,
        )
        message = await self.repo.add_message(message)
        return ChatMessageRead.model_validate(message)
    async def list_messages(self, org_id: str, user_id: str, chat_id: str) -> list[ChatMessageRead]:
        chat = await self.repo2.get_by_id(chat_id)
        if not chat or chat.organization_id != org_id or chat.user_id != user_id:
            raise_not_found("Chat", chat_id)
        messages = await self.repo.get_messages_by_chat_id(chat_id)
        return [ChatMessageRead.model_validate(m) for m in messages]


# ══════════════════════════════════════════════════════════
# WORKFLOW SERVICE
# ══════════════════════════════════════════════════════════

class WorkflowService:

    def __init__(self, db: AsyncSession):
        self.repo = WorkflowRepository(db)

    async def create_workflow(self, org_id: str, data: WorkflowCreate) -> WorkflowRead:
        workflow = Workflow(
            organization_id=org_id,
            name=data.name,
            status="draft",
        )
        workflow = await self.repo.create(workflow)
        return WorkflowRead.model_validate(workflow)

    async def list_workflows(self, org_id: str) -> list[WorkflowRead]:
        workflows = await self.repo.get_all_by_org(org_id)
        return [WorkflowRead.model_validate(w) for w in workflows]
