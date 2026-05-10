"""
AiMedico - User Profile Routes
Profile management for authenticated users.
"""

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DBSession
from app.core.security import verify_password, hash_password
from app.schemas.user import UserProfileResponse, UpdateProfileRequest, ChangePasswordRequest

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: CurrentUser):
    """Get the current user's profile."""
    return UserProfileResponse.model_validate(current_user)


@router.patch("/me", response_model=UserProfileResponse)
async def update_profile(
    payload: UpdateProfileRequest,
    current_user: CurrentUser,
    db: DBSession,
):
    """Update name or language preference."""
    if payload.full_name:
        current_user.full_name = payload.full_name
    if payload.preferred_language:
        current_user.preferred_language = payload.preferred_language
    await db.flush()
    return UserProfileResponse.model_validate(current_user)


@router.post("/me/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: CurrentUser,
    db: DBSession,
):
    """Change the current user's password."""
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect.")
    current_user.hashed_password = hash_password(payload.new_password)
    await db.flush()
