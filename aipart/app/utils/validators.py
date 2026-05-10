"""
AiMedico - Input Validators
Shared validation helpers used across routes and services.
"""

from pathlib import Path
from fastapi import HTTPException, UploadFile, status
from app.core.config import settings
from app.core.logging import logger


async def validate_upload_file(file: UploadFile) -> bytes:
    """
    Validate an uploaded file:
    - Check extension is allowed
    - Check size is within limit
    - Return file bytes

    Raises HTTPException on violation.
    """
    filename = file.filename or "unknown"
    ext = Path(filename).suffix.lstrip(".").lower()

    if ext not in settings.allowed_extensions_list:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"File type '.{ext}' is not supported. Allowed: {settings.ALLOWED_EXTENSIONS}",
        )

    file_bytes = await file.read()

    if len(file_bytes) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size {len(file_bytes) // 1024}KB exceeds limit of {settings.MAX_FILE_SIZE_MB}MB.",
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    logger.debug(f"File validated: {filename} ({len(file_bytes)} bytes)")
    return file_bytes


def validate_pagination(page: int, page_size: int) -> tuple[int, int]:
    """Clamp pagination values to safe ranges."""
    from app.core.constants import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
    page = max(1, page)
    page_size = max(1, min(page_size, MAX_PAGE_SIZE))
    return page, page_size
