"""
AiMedico - Prescription Model
Tracks each uploaded document (image/PDF) and its OCR + AI status.
"""

import uuid
from sqlalchemy import String, Text, ForeignKey, Integer, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.ai_result import AIResult
    from app.models.medicine import Medicine

from app.core.database import Base
from app.models.base import TimestampMixin
from app.core.constants import PrescriptionStatus, FileType


class Prescription(Base, TimestampMixin):
    __tablename__ = "prescriptions"

    # ── Primary Key ───────────────────────────────────────────────────────────
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )

    # ── FK: Owner ─────────────────────────────────────────────────────────────
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # ── File Metadata ─────────────────────────────────────────────────────────
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_type: Mapped[str] = mapped_column(String(20), default=FileType.IMAGE, nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=True)

    # ── OCR Results ───────────────────────────────────────────────────────────
    raw_ocr_text: Mapped[str] = mapped_column(Text, nullable=True)
    cleaned_text: Mapped[str] = mapped_column(Text, nullable=True)
    ocr_confidence: Mapped[str] = mapped_column(String(10), nullable=True)  # e.g. "87.3"
    ocr_engine_used: Mapped[str] = mapped_column(String(20), nullable=True)

    # ── Status ────────────────────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(30), default=PrescriptionStatus.UPLOADED, nullable=False, index=True
    )
    error_message: Mapped[str] = mapped_column(Text, nullable=True)

    # ── Relationships ─────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="prescriptions")  # noqa: F821
    ai_result: Mapped["AIResult"] = relationship(  # noqa: F821
        "AIResult", back_populates="prescription", uselist=False, cascade="all, delete-orphan"
    )
    medicines: Mapped[list["Medicine"]] = relationship(  # noqa: F821
        "Medicine", back_populates="prescription", cascade="all, delete-orphan"
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_prescriptions_user_status", "user_id", "status"),
    )

    def __repr__(self) -> str:
        return f"<Prescription id={self.id} status={self.status} user={self.user_id}>"
