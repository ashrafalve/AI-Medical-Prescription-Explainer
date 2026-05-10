"""
AiMedico - Medicine Model
Extracted medicine entities from a prescription.
Each row represents one detected medicine item.
"""

import uuid
from sqlalchemy import String, Text, ForeignKey, Boolean, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.prescription import Prescription

from app.core.database import Base
from app.models.base import TimestampMixin


class Medicine(Base, TimestampMixin):
    __tablename__ = "medicines"

    # ── Primary Key ───────────────────────────────────────────────────────────
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )

    # ── FK: Prescription ──────────────────────────────────────────────────────
    prescription_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("prescriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── Medicine Info ─────────────────────────────────────────────────────────
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    generic_name: Mapped[str] = mapped_column(String(200), nullable=True)
    brand_name: Mapped[str] = mapped_column(String(200), nullable=True)
    dosage: Mapped[str] = mapped_column(String(100), nullable=True)     # e.g. "500mg"
    frequency: Mapped[str] = mapped_column(String(100), nullable=True)  # e.g. "twice daily"
    duration: Mapped[str] = mapped_column(String(100), nullable=True)   # e.g. "7 days"
    route: Mapped[str] = mapped_column(String(50), nullable=True)       # oral/topical/IV
    timing: Mapped[str] = mapped_column(String(100), nullable=True)     # before/after meals

    # ── AI Explanations ───────────────────────────────────────────────────────
    explanation_en: Mapped[str] = mapped_column(Text, nullable=True)
    explanation_bn: Mapped[str] = mapped_column(Text, nullable=True)
    side_effects: Mapped[str] = mapped_column(Text, nullable=True)
    warnings: Mapped[str] = mapped_column(Text, nullable=True)

    # ── Reminder Data (for future mobile app) ─────────────────────────────────
    reminder_times: Mapped[str] = mapped_column(
        String(255), nullable=True
    )  # Comma-separated: "08:00,14:00,20:00"
    reminder_enabled: Mapped[bool] = mapped_column(Boolean, default=False)

    # ── Relationships ─────────────────────────────────────────────────────────
    prescription: Mapped["Prescription"] = relationship(  # noqa: F821
        "Prescription", back_populates="medicines"
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_medicines_prescription_name", "prescription_id", "name"),
    )

    def __repr__(self) -> str:
        return f"<Medicine name={self.name} dosage={self.dosage} rx={self.prescription_id}>"
