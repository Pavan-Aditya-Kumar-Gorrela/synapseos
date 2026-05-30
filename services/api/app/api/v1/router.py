# PURPOSE:
#   Assembles all endpoint routers into a single v1 API router.
#   main.py includes this one router, keeping it clean.
#
# HOW IT CONNECTS:
#   → main.py does: app.include_router(api_router, prefix="/api/v1")
#   → This file includes all feature routers

from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, organizations, documents, chats, workflows

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(organizations.router)
api_router.include_router(documents.router)
api_router.include_router(chats.router)
api_router.include_router(workflows.router)
