"""
AiMedico - Database Engine & Session
Async SQLAlchemy setup. Switch between SQLite and PostgreSQL by changing
the DATABASE_URL environment variable only. No code changes needed.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import event
from app.core.config import settings
from app.core.logging import logger


# ── Engine ──────────────────────────────────────────────────────────────────

connect_args = {}

# SQLite requires check_same_thread=False for async usage
if "sqlite" in settings.DATABASE_URL:
    connect_args["check_same_thread"] = False

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,          # SQL query logging in dev mode
    future=True,
    connect_args=connect_args,
    pool_pre_ping=True,           # Detect stale connections
    # For PostgreSQL, set pool_size and max_overflow:
    # pool_size=10,
    # max_overflow=20,
)


# ── Session Factory ──────────────────────────────────────────────────────────

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,       # Avoid lazy-loading after commit
)


# ── Base Model ───────────────────────────────────────────────────────────────

class Base(DeclarativeBase):
    """
    Declarative base for all SQLAlchemy models.
    All models must inherit from this class.
    """
    pass


# ── Dependency ───────────────────────────────────────────────────────────────

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a DB session per request.
    Automatically closes the session after the request completes.

    Usage:
        @router.get("/example")
        async def example(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ── Initialisation ───────────────────────────────────────────────────────────

async def init_db() -> None:
    """
    Create all tables on startup.
    In production, use Alembic migrations instead.
    """
    # Import all models so SQLAlchemy discovers them before create_all
    from app.models import user, prescription, ai_result, medicine  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("✅ Database tables initialised successfully.")


async def close_db() -> None:
    """Dispose engine connections on app shutdown."""
    await engine.dispose()
    logger.info("Database engine disposed.")
