"""
AiMedico - AI Analysis Routes
Retrieve AI results and trigger medicine lookups.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DBSession
from app.schemas.ai import AIResultResponse, AIAnalysisOutput
from app.services.prescription_service import prescription_service
from app.core.constants import AIResultStatus
from sqlalchemy import select
from app.models.ai_result import AIResult

router = APIRouter(prefix="/ai", tags=["AI Analysis"])


@router.get("/result/{prescription_id}", response_model=AIResultResponse)
async def get_ai_result(
    prescription_id: str,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Get the AI analysis result for a prescription.
    Returns status 'processing' if still running.
    """
    # Verify ownership
    prescription = await prescription_service.get_by_id(db, prescription_id, current_user.id)
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found.")

    # Fetch AI result
    stmt = select(AIResult).where(AIResult.prescription_id == prescription_id)
    ai_result = (await db.execute(stmt)).scalar_one_or_none()

    if not ai_result:
        return AIResultResponse(
            id="",
            prescription_id=prescription_id,
            status=AIResultStatus.PENDING,
            emergency_level="none",
        )

    # Build analysis output from stored JSON
    analysis = None
    if ai_result.status == AIResultStatus.COMPLETED and ai_result.medicines_json is not None:
        try:
            analysis = AIAnalysisOutput(
                medicines=ai_result.medicines_json or [],
                dosage=ai_result.dosage_json or [],
                warnings=ai_result.warnings_json or [],
                tests=ai_result.tests_json or [],
                conditions=ai_result.conditions_json or [],
                followup=ai_result.followup_json or [],
                summary_en=ai_result.summary_en or "",
                summary_bn=ai_result.summary_bn or "",
                emergency_level=ai_result.emergency_level or "none",
                emergency_keywords_found=ai_result.emergency_keywords_found or [],
            )
        except Exception:
            analysis = None

    return AIResultResponse(
        id=ai_result.id,
        prescription_id=prescription_id,
        status=ai_result.status,
        ai_model_used=ai_result.ai_model_used,
        total_tokens=ai_result.total_tokens or 0,
        processing_time_ms=ai_result.processing_time_ms or 0,
        analysis=analysis,
        emergency_level=ai_result.emergency_level or "none",
        error_message=ai_result.error_message,
    )


@router.get("/medicine/{medicine_name}")
async def explain_medicine(
    medicine_name: str,
    current_user: CurrentUser,
    db: DBSession,
):
    """Get AI explanation for a specific medicine name."""
    from app.services.ai_service import ai_service
    from app.prompts.medicine_prompt import build_medicine_prompt

    system_prompt, user_message = build_medicine_prompt(medicine_name)
    result = await ai_service.chat_completion_json(system_prompt, user_message)

    return {"medicine": medicine_name, "explanation": result.content, "tokens_used": result.usage.total}
