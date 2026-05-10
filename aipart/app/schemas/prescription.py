"""
AiMedico - Prescription Schemas
Request/response models for file upload and prescription management.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.core.constants import PrescriptionStatus, FileType


class PrescriptionUploadResponse(BaseModel):
    """Returned after a file is successfully uploaded."""
    id: str
    original_filename: str
    file_type: str
    file_size_bytes: int
    status: str
    message: str = "File uploaded successfully. Processing will begin shortly."


class PrescriptionDetailResponse(BaseModel):
    """Full prescription detail including OCR and AI result summary."""
    id: str
    user_id: str
    original_filename: str
    file_type: str
    file_size_bytes: int
    status: str
    raw_ocr_text: Optional[str] = None
    cleaned_text: Optional[str] = None
    ocr_confidence: Optional[str] = None
    ocr_engine_used: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PrescriptionListItem(BaseModel):
    """Lightweight prescription item for list views."""
    id: str
    original_filename: str
    file_type: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PrescriptionListResponse(BaseModel):
    items: list[PrescriptionListItem]
    total: int
    page: int
    page_size: int
    has_next: bool
