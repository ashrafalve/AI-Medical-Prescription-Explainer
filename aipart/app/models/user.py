"""
AiMedico - User Model
Stores registered users with hashed passwords and role info.
Designed for PostgreSQL compatibility from day one.
"""

import uuid
from sqlalchemy import String, Boolean, Enum, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.prescription import Prescription

from app.core.database import Base
from app.models.base import TimestampMixin
from app.core.constants import UserRole


class User(Base, TimestampMixin):
    __tablename__ = "users"

    # ── Primary Key ───────────────────────────────────────────────────────────
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )

    # ── Identity ──────────────────────────────────────────────────────────────
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # ── Account State ─────────────────────────────────────────────────────────
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    role: Mapped[str] = mapped_column(String(20), default=UserRole.USER, nullable=False)

    # ── Preferences ───────────────────────────────────────────────────────────
    preferred_language: Mapped[str] = mapped_column(String(5), default="en", nullable=False)

    # ── Relationships ─────────────────────────────────────────────────────────
    prescriptions: Mapped[list["Prescription"]] = relationship(  # noqa: F821
        "Prescription",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_users_email_active", "email", "is_active"),
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
