# app/api/v1/endpoints/documents.py

from typing import Optional

from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.roles import UserRole
from app.auth.dependencies import CurrentUser, get_current_user, require_roles
from app.schemas.domain import DocumentListItem, DocumentRead
from app.services.domain_services import DocumentService

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post(
    "/upload",
    response_model=DocumentRead,
    status_code=201,
    summary="Upload a document (PDF / DOCX / TXT / CSV)",
    dependencies=[Depends(require_roles(UserRole.ANALYST))],
)
async def upload_document(
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentRead:
    service = DocumentService(db)
    return await service.ingest_upload(current_user.org_id, current_user.user_id, file)


@router.get(
    "",
    response_model=list[DocumentListItem],
    summary="List documents in my org",
)
async def list_documents(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    search: Optional[str] = Query(default=None, description="Search by filename"),
) -> list[DocumentListItem]:
    service = DocumentService(db)
    return await service.list_documents(current_user.org_id, skip=skip, limit=limit, search=search)


@router.get(
    "/{document_id}",
    response_model=DocumentRead,
    summary="Get a single document (includes extracted text)",
)
async def get_document(
    document_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentRead:
    service = DocumentService(db)
    return await service.get_document(current_user.org_id, document_id)


@router.delete(
    "/{document_id}",
    status_code=204,
    summary="Delete a document and its stored file",
    dependencies=[Depends(require_roles(UserRole.ANALYST))],
)
async def delete_document(
    document_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    service = DocumentService(db)
    await service.delete_document(current_user.org_id, document_id)