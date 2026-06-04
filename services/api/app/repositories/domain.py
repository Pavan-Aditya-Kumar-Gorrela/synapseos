# PURPOSE:
#   Repositories for Document, Chat, ChatMessage, and Workflow.
#   All queries are org-scoped — tenant isolation at every layer.

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.domain import Document, Chat, ChatMessage, Workflow
from app.repositories.base import BaseRepository


class DocumentRepository(BaseRepository[Document]):

    def __init__(self, db: AsyncSession):
        super().__init__(Document, db)

    async def get_all_by_org(
        self,
        org_id: str,
        *,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
    ) -> list[Document]:
        q = select(Document).where(Document.organization_id == org_id)
        if search:
            q = q.where(Document.original_filename.ilike(f"%{search}%"))
        q = q.order_by(Document.created_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def get_by_id_and_org(self, doc_id: str, org_id: str) -> Optional[Document]:
        result = await self.db.execute(
            select(Document).where(
                Document.id == doc_id,
                Document.organization_id == org_id,
            )
        )
        return result.scalar_one_or_none()

    async def delete_by_id_and_org(self, doc_id: str, org_id: str) -> Optional[Document]:
        doc = await self.get_by_id_and_org(doc_id, org_id)
        if doc:
            await self.db.delete(doc)
            await self.db.commit()
        return doc


class ChatRepository(BaseRepository[Chat]):
    def __init__(self, db: AsyncSession):
        super().__init__(Chat, db)

    async def get_all_by_org_and_user(
        self, org_id: str, user_id: str, *, skip: int = 0, limit: int = 100
    ) -> list[Chat]:
        """
        A user sees only THEIR chats, scoped to their org.
        Admins may bypass this — handled at the service layer.
        """
        result = await self.db.execute(
            select(Chat)
            .where(Chat.organization_id == org_id, Chat.user_id == user_id)
            .order_by(Chat.created_at.desc())
            .offset(skip).limit(limit)
        )
        return list(result.scalars().all())


class ChatMessageRepository(BaseRepository[ChatMessage]):
    def __init__(self, db: AsyncSession):
        super().__init__(ChatMessage, db)

    async def get_messages_by_chat(self, chat_id: str) -> list[ChatMessage]:
        result = await self.db.execute(
            select(ChatMessage)
            .where(ChatMessage.chat_id == chat_id)
            .order_by(ChatMessage.created_at.asc())
        )
        return list(result.scalars().all())
    async def add_message(self, message: ChatMessage) -> ChatMessage:
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message
    async def get_messages_by_chat_id(self, chat_id: str) -> list[ChatMessage]:
        result = await self.db.execute(
            select(ChatMessage)
            .where(ChatMessage.chat_id == chat_id)
            .order_by(ChatMessage.created_at.asc())
        )
        return list(result.scalars().all())


class WorkflowRepository(BaseRepository[Workflow]):
    def __init__(self, db: AsyncSession):
        super().__init__(Workflow, db)

    async def get_all_by_org(self, org_id: str, *, skip: int = 0, limit: int = 100) -> list[Workflow]:
        result = await self.db.execute(
            select(Workflow)
            .where(Workflow.organization_id == org_id)
            .order_by(Workflow.created_at.desc())
            .offset(skip).limit(limit)
        )
        return list(result.scalars().all())
