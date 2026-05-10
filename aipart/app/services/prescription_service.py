"""
AiMedico - Prescription Service
Business logic for file upload, OCR triggering, and prescription CRUD.
All DB access is async via SQLAlchemy.
"""

import time
import uuid
from pathlib import Path
from typing import Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.config import settings
from app.core.logging import logger
from app.core.constants import PrescriptionStatus, AIResultStatus, FileType
from app.models.prescription import Prescription
from app.models.ai_result import AIResult
from app.services.ocr_service import ocr_service
from app.utils.file_handler import save_upload_file, get_file_type
from app.utils.image_cleaner import clean_ocr_text


class PrescriptionService:
    """
    Orchestrates: upload → save file → OCR → update DB → trigger AI.
    """

    # ── Upload ────────────────────────────────────────────────────────────────

    async def create_prescription(
        self,
        db: AsyncSession,
        user_id: str,
        file_bytes: bytes,
        original_filename: str,
        mime_type: str,
    ) -> Prescription:
        """
        Save uploaded file and create a Prescription record.
        OCR is NOT run here — it's triggered asynchronously after.
        """
        stored_filename, file_path = await save_upload_file(file_bytes, original_filename)
        file_type = get_file_type(original_filename)

        prescription = Prescription(
            id=str(uuid.uuid4()),
            user_id=user_id,
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_path=file_path,
            file_type=file_type,
            file_size_bytes=len(file_bytes),
            mime_type=mime_type,
            status=PrescriptionStatus.UPLOADED,
        )

        db.add(prescription)
        await db.flush()  # Get the ID without committing

        logger.info(f"Prescription created: {prescription.id} | user={user_id}")
        return prescription

    # ── OCR ───────────────────────────────────────────────────────────────────

    async def run_ocr(
        self, db: AsyncSession, prescription: Prescription
    ) -> Prescription:
        """
        Run OCR on the stored file and update the prescription record.
        """
        try:
            result = ocr_service.run_from_path(prescription.file_path)

            cleaned = clean_ocr_text(result.text)

            prescription.raw_ocr_text = result.text
            prescription.cleaned_text = cleaned
            prescription.ocr_confidence = str(result.confidence) if result.confidence else None
            prescription.ocr_engine_used = result.engine
            prescription.status = PrescriptionStatus.OCR_DONE

            logger.info(
                f"OCR complete for {prescription.id}: "
                f"engine={result.engine}, confidence={result.confidence}"
            )

        except Exception as e:
            prescription.status = PrescriptionStatus.FAILED
            prescription.error_message = f"OCR error: {str(e)}"
            logger.error(f"OCR failed for {prescription.id}: {e}")

        await db.flush()
        return prescription

    # ── Queries ───────────────────────────────────────────────────────────────

    async def get_by_id(
        self, db: AsyncSession, prescription_id: str, user_id: Optional[str] = None
    ) -> Optional[Prescription]:
        """Fetch a prescription by ID, optionally scoped to a user."""
        stmt = select(Prescription).where(Prescription.id == prescription_id)
        if user_id:
            stmt = stmt.where(Prescription.user_id == user_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_for_user(
        self,
        db: AsyncSession,
        user_id: str,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[list[Prescription], int]:
        """Paginated list of prescriptions for a user."""
        offset = (page - 1) * page_size

        # Count
        count_stmt = select(func.count()).where(Prescription.user_id == user_id)
        total = (await db.execute(count_stmt)).scalar_one()

        # Items
        stmt = (
            select(Prescription)
            .where(Prescription.user_id == user_id)
            .order_by(desc(Prescription.created_at))
            .offset(offset)
            .limit(page_size)
        )
        result = await db.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def delete(self, db: AsyncSession, prescription: Prescription) -> None:
        """Delete a prescription (and cascade to AI result and medicines)."""
        file_path = Path(prescription.file_path)
        await db.delete(prescription)

        # Clean up stored file
        if file_path.exists():
            file_path.unlink(missing_ok=True)
            logger.info(f"Deleted file: {file_path}")


prescription_service = PrescriptionService()
