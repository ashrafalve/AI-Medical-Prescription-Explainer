"""
AiMedico - User Schemas
Public-facing user profile request/response models.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserProfileResponse(BaseModel):
    """Full user profile (authenticated)."""
    id: str
    full_name: str
    email: str
    role: str
    preferred_language: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    """Update user's own profile."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    preferred_language: Optional[str] = Field(None, pattern="^(en|bn)$")

    @field_validator("full_name")
    @classmethod
    def strip_name(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if v else v


class ChangePasswordRequest(BaseModel):
    """Change user password."""
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str = Field(..., min_length=8, max_length=100)

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match.")
        return v


class AdminUserListItem(BaseModel):
    """For admin dashboard user list."""
    id: str
    full_name: str
    email: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}
