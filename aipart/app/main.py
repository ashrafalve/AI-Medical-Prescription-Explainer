"""
AiMedico - FastAPI Application Entry Point
Bootstraps the app: middleware, routers, lifespan, error handlers, static files.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from openai import APIError as OpenAIAPIError
from pathlib import Path

from app.core.config import settings
from app.core.logging import logger, setup_logging
from app.core.database import init_db, close_db
from app.middleware.error_handler import (
    validation_exception_handler,
    sqlalchemy_exception_handler,
    openai_exception_handler,
    generic_exception_handler,
)
from app.api.routes import auth, upload, ai, prescriptions, users


# ── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle management."""
    setup_logging()
    logger.info(f"🏥 Starting {settings.APP_NAME} v{settings.APP_VERSION} [{settings.APP_ENV}]")

    # Ensure upload and log directories exist
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    Path("logs").mkdir(parents=True, exist_ok=True)

    # Initialise database tables
    await init_db()
    logger.info("✅ Application startup complete.")

    yield

    # Shutdown
    await close_db()
    logger.info("👋 Application shutdown complete.")


# ── App Instance ──────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "AiMedico — AI-Powered Prescription & Medical Report Explainer. "
        "Upload prescriptions and medical reports to get patient-friendly explanations."
    ),
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)


# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Exception Handlers ────────────────────────────────────────────────────────

app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(OpenAIAPIError, openai_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)


# ── API Routers ───────────────────────────────────────────────────────────────

PREFIX = settings.API_PREFIX

app.include_router(auth.router, prefix=PREFIX)
app.include_router(upload.router, prefix=PREFIX)
app.include_router(prescriptions.router, prefix=PREFIX)
app.include_router(ai.router, prefix=PREFIX)
app.include_router(users.router, prefix=PREFIX)


# ── Static Files (uploads) ────────────────────────────────────────────────────

upload_dir = Path(settings.UPLOAD_DIR)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")


# ── Health Check ──────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health_check():
    """Liveness probe endpoint."""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "env": settings.APP_ENV,
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }
