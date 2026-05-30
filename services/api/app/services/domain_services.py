# PURPOSE:
#   Business logic services for all domain entities.
#   Services are the middle layer: Routes → Services → Repositories → DB
#
# RULE: NO SQL in services. NO HTTP in services.
#   Services use repositories for DB and raise domain exceptions.
#   Routes convert domain exceptions into HTTP responses.

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import raise_not_found, raise_forbidden
from app.models.domain import Chat, Document, Workflow
from app.repositories.domain import (
    ChatRepository,
    DocumentRepository,
    WorkflowRepository,
)
from app.repositories.user_org import OrganizationRepository, UserRepository
from app.schemas.auth import UserRead
from app.schemas.domain import (
    ChatCreate,
    ChatRead,
    DocumentCreate,
    DocumentRead,
    WorkflowCreate,
    WorkflowRead,
)
from app.schemas.organization import OrganizationRead


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


# ══════════════════════════════════════════════════════════
# DOCUMENT SERVICE
# ══════════════════════════════════════════════════════════

class DocumentService:

    def __init__(self, db: AsyncSession):
        self.repo = DocumentRepository(db)

    async def upload_document(
        self,
        org_id: str,
        user_id: str,
        data: DocumentCreate,
    ) -> DocumentRead:
        """
        Registers document metadata after a file has been uploaded to storage.
        In production, actual file upload happens BEFORE this:
          1. Client uploads file to presigned S3 URL
          2. Client calls this endpoint with the storage_path
        """
        doc = Document(
            organization_id=org_id,
            uploaded_by=user_id,
            filename=data.filename,
            file_type=data.file_type,
            storage_path=data.storage_path,
            status="pending",  # Will become "processing" → "ready" via Celery
        )
        doc = await self.repo.create(doc)
        return DocumentRead.model_validate(doc)

    async def list_documents(self, org_id: str, skip: int = 0, limit: int = 100) -> list[DocumentRead]:
        docs = await self.repo.get_all_by_org(org_id, skip=skip, limit=limit)
        return [DocumentRead.model_validate(d) for d in docs]


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
