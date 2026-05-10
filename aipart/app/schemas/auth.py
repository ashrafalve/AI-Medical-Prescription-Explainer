"""
AiMedico - Auth Schemas
Request/response Pydantic models for authentication endpoints.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
import re


class RegisterRequest(BaseModel):
    """User registration payload."""
    full_name: str = Field(..., min_length=2, max_length=150, example="Rahim Uddin")
    email: EmailStr = Field(..., example="rahim@example.com")
    password: str = Field(..., min_length=8, max_length=100, example="SecurePass123!")
    preferred_language: str = Field(default="en", pattern="^(en|bn)$")

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit.")
        return v

    @field_validator("full_name")
    @classmethod
    def sanitize_name(cls, v: str) -> str:
        return v.strip()


class LoginRequest(BaseModel):
    """User login payload."""
    email: EmailStr = Field(..., example="rahim@example.com")
    password: str = Field(..., min_length=1, example="SecurePass123!")


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class RefreshTokenRequest(BaseModel):
    """Refresh token payload."""
    refresh_token: str


class UserPublicResponse(BaseModel):
    """Safe user info returned after auth."""
    id: str
    full_name: str
    email: str
    role: str
    preferred_language: str
    is_active: bool
    is_verified: bool

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    """Full auth response: tokens + user info."""
    tokens: TokenResponse
    user: UserPublicResponse
