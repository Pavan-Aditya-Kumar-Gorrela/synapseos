# app/api/v1/endpoints/documents.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.roles import UserRole
from app.auth.dependencies import CurrentUser, get_current_user, require_roles
from app.schemas.domain import DocumentCreate, DocumentRead
from app.services.domain_services import DocumentService

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post(
    "/upload",
    response_model=DocumentRead,
    status_code=201,
    summary="Register an uploaded document",
    dependencies=[Depends(require_roles(UserRole.ANALYST))],
)
async def upload_document(
    payload: DocumentCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentRead:
    """
    Register document metadata after the file has been uploaded to storage.
    (In production: client first uploads to S3, then calls this endpoint.)
    Requires ANALYST role or above.
    """
    service = DocumentService(db)
    return await service.upload_document(current_user.org_id, current_user.user_id, payload)


@router.get("", response_model=list[DocumentRead], summary="List all documents in my org")
async def list_documents(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
) -> list[DocumentRead]:
    service = DocumentService(db)
    return await service.list_documents(current_user.org_id, skip=skip, limit=limit)
