"""
AiMedico - Prescriptions Routes
CRUD and status polling for prescription records.
"""

from fastapi import APIRouter, HTTPException, status, Query

from app.api.deps import CurrentUser, DBSession
from app.schemas.prescription import (
    PrescriptionDetailResponse, PrescriptionListResponse, PrescriptionListItem
)
from app.services.prescription_service import prescription_service
from app.utils.validators import validate_pagination

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


@router.get("", response_model=PrescriptionListResponse)
async def list_prescriptions(
    current_user: CurrentUser,
    db: DBSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """Get paginated list of prescriptions for the current user."""
    page, page_size = validate_pagination(page, page_size)
    items, total = await prescription_service.list_for_user(db, current_user.id, page, page_size)

    return PrescriptionListResponse(
        items=[PrescriptionListItem.model_validate(p) for p in items],
        total=total,
        page=page,
        page_size=page_size,
        has_next=(page * page_size) < total,
    )


@router.get("/{prescription_id}", response_model=PrescriptionDetailResponse)
async def get_prescription(
    prescription_id: str,
    current_user: CurrentUser,
    db: DBSession,
):
    """Get full details of a specific prescription."""
    prescription = await prescription_service.get_by_id(db, prescription_id, current_user.id)
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found.")
    return PrescriptionDetailResponse.model_validate(prescription)


@router.delete("/{prescription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prescription(
    prescription_id: str,
    current_user: CurrentUser,
    db: DBSession,
):
    """Delete a prescription and its associated file."""
    prescription = await prescription_service.get_by_id(db, prescription_id, current_user.id)
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found.")
    await prescription_service.delete(db, prescription)
