"""
AiMedico - File Handler Utility
Handles file saving, validation, and path management for uploads.
"""

import uuid
import aiofiles
from pathlib import Path
from typing import Tuple

from app.core.config import settings
from app.core.constants import FileType, IMAGE_EXTENSIONS, PDF_EXTENSIONS
from app.core.logging import logger


def get_file_type(filename: str) -> str:
    ext = Path(filename).suffix.lstrip(".").lower()
    if ext in IMAGE_EXTENSIONS:
        return FileType.IMAGE
    if ext in PDF_EXTENSIONS:
        return FileType.PDF
    return FileType.UNKNOWN


def validate_file_extension(filename: str) -> bool:
    ext = Path(filename).suffix.lstrip(".").lower()
    return ext in settings.allowed_extensions_list


def validate_file_size(size_bytes: int) -> bool:
    return size_bytes <= settings.max_file_size_bytes


def generate_stored_filename(original_filename: str) -> str:
    """Generate a UUID-based filename to avoid collisions and directory traversal."""
    ext = Path(original_filename).suffix.lower()
    return f"{uuid.uuid4().hex}{ext}"


async def save_upload_file(file_bytes: bytes, original_filename: str) -> Tuple[str, str]:
    """
    Save uploaded file bytes to the uploads directory.

    Returns:
        (stored_filename, absolute_file_path)
    """
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    stored_filename = generate_stored_filename(original_filename)
    file_path = upload_dir / stored_filename

    async with aiofiles.open(str(file_path), "wb") as f:
        await f.write(file_bytes)

    logger.info(f"File saved: {file_path} ({len(file_bytes)} bytes)")
    return stored_filename, str(file_path.resolve())


def get_upload_url(stored_filename: str) -> str:
    """Return a URL path to serve the uploaded file."""
    return f"/uploads/{stored_filename}"
