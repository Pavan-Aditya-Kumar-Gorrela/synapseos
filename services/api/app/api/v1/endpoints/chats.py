# app/api/v1/endpoints/chats.py

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.auth.dependencies import CurrentUser, get_current_user
from app.schemas.domain import ChatCreate, ChatRead
from app.services.domain_services import ChatService

router = APIRouter(prefix="/chats", tags=["Chats"])


@router.post("", response_model=ChatRead, status_code=201, summary="Start a new chat")
async def create_chat(
    payload: ChatCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatRead:
    service = ChatService(db)
    return await service.create_chat(current_user.org_id, current_user.user_id, payload)


@router.get("", response_model=list[ChatRead], summary="List my chats")
async def list_chats(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ChatRead]:
    service = ChatService(db)
    return await service.list_chats(current_user.org_id, current_user.user_id)
