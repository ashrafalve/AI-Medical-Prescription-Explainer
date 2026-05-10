"""
AiMedico - AI Result Model
Stores structured AI analysis output for each prescription.
JSON fields store the full structured response from OpenAI.
"""

import uuid
from sqlalchemy import String, Text, JSON, Integer, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.prescription import Prescription

from app.core.database import Base
from app.models.base import TimestampMixin
from app.core.constants import AIResultStatus


class AIResult(Base, TimestampMixin):
    __tablename__ = "ai_results"

    # ── Primary Key ───────────────────────────────────────────────────────────
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )

    # ── FK: Prescription ──────────────────────────────────────────────────────
    prescription_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("prescriptions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    # ── Status ────────────────────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(20), default=AIResultStatus.PENDING, nullable=False, index=True
    )

    # ── AI Model Metadata ─────────────────────────────────────────────────────
    ai_model_used: Mapped[str] = mapped_column(String(50), nullable=True)
    prompt_tokens: Mapped[int] = mapped_column(Integer, default=0)
    completion_tokens: Mapped[int] = mapped_column(Integer, default=0)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0)
    processing_time_ms: Mapped[int] = mapped_column(Integer, default=0)

    # ── Structured Outputs (stored as JSON) ───────────────────────────────────
    medicines_json: Mapped[dict] = mapped_column(JSON, nullable=True)
    dosage_json: Mapped[dict] = mapped_column(JSON, nullable=True)
    warnings_json: Mapped[dict] = mapped_column(JSON, nullable=True)
    tests_json: Mapped[dict] = mapped_column(JSON, nullable=True)
    conditions_json: Mapped[dict] = mapped_column(JSON, nullable=True)
    followup_json: Mapped[dict] = mapped_column(JSON, nullable=True)

    # ── Summaries ─────────────────────────────────────────────────────────────
    summary_en: Mapped[str] = mapped_column(Text, nullable=True)
    summary_bn: Mapped[str] = mapped_column(Text, nullable=True)
    emergency_level: Mapped[str] = mapped_column(String(20), default="none", nullable=False)
    emergency_keywords_found: Mapped[dict] = mapped_column(JSON, nullable=True)

    # ── Raw AI Response (for debugging) ───────────────────────────────────────
    raw_response: Mapped[str] = mapped_column(Text, nullable=True)
    error_message: Mapped[str] = mapped_column(Text, nullable=True)

    # ── Relationships ─────────────────────────────────────────────────────────
    prescription: Mapped["Prescription"] = relationship(  # noqa: F821
        "Prescription", back_populates="ai_result"
    )

    def __repr__(self) -> str:
        return f"<AIResult id={self.id} status={self.status} emergency={self.emergency_level}>"
