"""
AiMedico - Models Package
Centralised import to ensure all models are registered with SQLAlchemy
before create_all() is called.
"""

from app.models.base import TimestampMixin
from app.models.user import User
from app.models.prescription import Prescription
from app.models.ai_result import AIResult
from app.models.medicine import Medicine

__all__ = ["TimestampMixin", "User", "Prescription", "AIResult", "Medicine"]
