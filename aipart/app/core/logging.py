"""
AiMedico - Logging Configuration
Uses Loguru for structured, coloured, and file-rotated logging.
Intercepts standard library logging so third-party libs are also captured.
"""

import sys
import logging
from pathlib import Path
from loguru import logger
from app.core.config import settings


class InterceptHandler(logging.Handler):
    """
    Redirect standard library logging records to Loguru.
    Ensures uvicorn, SQLAlchemy, and other libraries use the same log sink.
    """

    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = sys._getframe(6), 6
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back  # type: ignore[assignment]
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


def setup_logging() -> None:
    """
    Configure Loguru sinks:
    - Console (coloured, human-readable)
    - File (JSON-structured with rotation)
    """
    # Remove default sink
    logger.remove()

    # Console sink — pretty for development
    logger.add(
        sys.stdout,
        level=settings.LOG_LEVEL,
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        ),
        colorize=True,
        backtrace=True,
        diagnose=settings.DEBUG,
    )

    # File sink — structured JSON for production
    log_path = Path(settings.LOG_FILE)
    log_path.parent.mkdir(parents=True, exist_ok=True)

    logger.add(
        str(log_path),
        level=settings.LOG_LEVEL,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}",
        rotation="10 MB",
        retention="30 days",
        compression="zip",
        enqueue=True,       # Thread-safe async logging
        backtrace=True,
        diagnose=False,     # Never expose internals in production logs
    )

    # Intercept standard logging
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)

    # Suppress noisy loggers
    for name in ("uvicorn", "uvicorn.access", "sqlalchemy.engine", "httpx"):
        logging.getLogger(name).handlers = [InterceptHandler()]
        logging.getLogger(name).propagate = False

    logger.info(f"🚀 AiMedico {settings.APP_VERSION} logging initialised [{settings.APP_ENV}]")


# Export the logger so other modules can: from app.core.logging import logger
__all__ = ["logger", "setup_logging"]
