# PURPOSE:
#   The entry point of the FastAPI application.
#   Creates the `app` instance, configures:
#     - CORS middleware
#     - Global exception handlers
#     - API router (all endpoints)
#     - Startup event (DB health check)
#     - OpenAPI/Swagger documentation
#
# HOW IT CONNECTS:
#   → Uvicorn runs: uvicorn app.main:app
#   → api/v1/router.py provides all API routes
#   → core/config.py provides app metadata

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import SynapseBaseException


# ── Lifespan: startup & shutdown ──────────────────────────────────────────────
# `lifespan` is the modern FastAPI way to handle startup/shutdown events.
# Code before `yield` runs on startup; code after runs on shutdown.
@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP
    print(f"🚀 SynapseOS API starting — version {settings.APP_VERSION}")
    # Future: initialize Redis connection pool, Qdrant client, etc.
    yield
    # SHUTDOWN
    print("🛑 SynapseOS API shutting down...")
    # Future: close connection pools cleanly


# ── App Factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="SynapseOS API",
    description=(
        "## AI-Native Enterprise Operating System\n\n"
        "### Authentication\n"
        "1. Register via `POST /api/v1/auth/register`\n"
        "2. Login via `POST /api/v1/auth/login` → get `access_token`\n"
        "3. Click 'Authorize' in Swagger and enter: `Bearer <access_token>`\n"
        "4. All protected endpoints will now work.\n\n"
        "### Multi-Tenancy\n"
        "Every resource is scoped to an Organization. "
        "You can only access data belonging to your organization."
    ),
    version=settings.APP_VERSION,
    docs_url="/docs",          # Swagger UI at http://localhost:8000/docs
    redoc_url="/redoc",        # ReDoc at http://localhost:8000/redoc
    openapi_url="/openapi.json",
    lifespan=lifespan,
    # Configure the Swagger UI "Authorize" button to use Bearer tokens
    swagger_ui_oauth2_redirect_url="/docs/oauth2-redirect",
)

# ── CORS Middleware ───────────────────────────────────────────────────────────
# Allows the frontend (running on a different port) to call our API.
# In production, restrict `allow_origins` to your specific domains.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global Exception Handlers ─────────────────────────────────────────────────
# Converts our custom domain exceptions into clean JSON HTTP responses.
# Without this, unhandled exceptions return 500 Internal Server Error.
@app.exception_handler(SynapseBaseException)
async def synapse_exception_handler(request: Request, exc: SynapseBaseException) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={"detail": exc.message},
    )


# ── Health Check ──────────────────────────────────────────────────────────────
# A simple endpoint load balancers and monitoring tools can call.
# Returns 200 OK if the API is running.
@app.get("/health", tags=["Health"], summary="API health check")
async def health_check() -> dict:
    return {"status": "healthy", "version": settings.APP_VERSION}


# ── Mount all API routes ──────────────────────────────────────────────────────
# All routes are prefixed with /api/v1
# Example: POST /api/v1/auth/login
app.include_router(api_router, prefix="/api/v1")
