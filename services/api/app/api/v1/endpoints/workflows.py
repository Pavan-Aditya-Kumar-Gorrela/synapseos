# app/api/v1/endpoints/workflows.py

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.roles import UserRole
from app.auth.dependencies import CurrentUser, get_current_user, require_roles
from app.schemas.domain import WorkflowCreate, WorkflowRead
from app.services.domain_services import WorkflowService

router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.post(
    "",
    response_model=WorkflowRead,
    status_code=201,
    summary="Create a new workflow",
    dependencies=[Depends(require_roles(UserRole.MANAGER))],
)
async def create_workflow(
    payload: WorkflowCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WorkflowRead:
    service = WorkflowService(db)
    return await service.create_workflow(current_user.org_id, payload)


@router.get("", response_model=list[WorkflowRead], summary="List all workflows in my org")
async def list_workflows(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[WorkflowRead]:
    service = WorkflowService(db)
    return await service.list_workflows(current_user.org_id)
