"""
AiMedico - Upload Routes
Handles prescription file upload → OCR → AI pipeline.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, status

from app.api.deps import CurrentUser, DBSession
from app.core.logging import logger
from app.schemas.prescription import PrescriptionUploadResponse
from app.services.prescription_service import prescription_service
from app.utils.validators import validate_upload_file

router = APIRouter(prefix="/upload", tags=["File Upload"])


async def _run_ocr_and_ai(prescription_id: str, user_id: str):
    """
    Background task: run OCR then trigger AI analysis.
    Runs after the upload response is already returned to the client.
    """
    from app.core.database import AsyncSessionLocal
    from app.services.ai_service import ai_service
    from app.services.summary_service import summary_service
    from app.services.medicine_service import medicine_service
    from app.models.ai_result import AIResult
    from app.core.constants import AIResultStatus, PrescriptionStatus
    import uuid, time

    async with AsyncSessionLocal() as db:
        try:
            prescription = await prescription_service.get_by_id(db, prescription_id, user_id)
            if not prescription:
                return

            # Step 1: OCR
            prescription = await prescription_service.run_ocr(db, prescription)
            await db.commit()

            if not prescription.cleaned_text:
                logger.warning(f"No text extracted for {prescription_id}")
                return

            # Step 2: Create pending AI result
            ai_result = AIResult(
                id=str(uuid.uuid4()),
                prescription_id=prescription_id,
                status=AIResultStatus.PROCESSING,
            )
            db.add(ai_result)
            await db.flush()

            # Step 3: AI Analysis
            start = time.perf_counter()
            ai_output = await ai_service.analyse_prescription(prescription.cleaned_text)
            elapsed_ms = int((time.perf_counter() - start) * 1000)

            analysis = ai_output.content

            # Step 4: Enrich with emergency detection
            analysis = summary_service.enrich_analysis(analysis, prescription.raw_ocr_text or "")

            # Step 5: Persist AI result
            ai_result.status = AIResultStatus.COMPLETED
            ai_result.ai_model_used = ai_output.model
            ai_result.prompt_tokens = ai_output.usage.prompt
            ai_result.completion_tokens = ai_output.usage.completion
            ai_result.total_tokens = ai_output.usage.total
            ai_result.processing_time_ms = elapsed_ms
            ai_result.medicines_json = [m.model_dump() for m in analysis.medicines]
            ai_result.dosage_json = [d.model_dump() for d in analysis.dosage]
            ai_result.warnings_json = [w.model_dump() for w in analysis.warnings]
            ai_result.tests_json = [t.model_dump() for t in analysis.tests]
            ai_result.conditions_json = [c.model_dump() for c in analysis.conditions]
            ai_result.followup_json = [f.model_dump() for f in analysis.followup]
            ai_result.summary_en = analysis.summary_en
            ai_result.summary_bn = analysis.summary_bn
            ai_result.emergency_level = analysis.emergency_level
            ai_result.emergency_keywords_found = analysis.emergency_keywords_found
            ai_result.raw_response = ai_output.raw_response

            prescription.status = PrescriptionStatus.AI_DONE

            # Step 6: Save extracted medicines
            await medicine_service.save_medicines(db, prescription_id, analysis.medicines)

            await db.commit()
            logger.info(f"AI analysis complete for {prescription_id} in {elapsed_ms}ms")

        except Exception as e:
            logger.error(f"Background AI pipeline failed for {prescription_id}: {e}")
            try:
                await db.rollback()
            except Exception:
                pass


@router.post("/prescription", response_model=PrescriptionUploadResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_prescription(
    background_tasks: BackgroundTasks,
    current_user: CurrentUser,
    db: DBSession,
    file: UploadFile = File(..., description="Prescription image or PDF"),
):
    """
    Upload a prescription file.
    Returns immediately after saving; OCR and AI analysis run in background.
    """
    file_bytes = await validate_upload_file(file)

    prescription = await prescription_service.create_prescription(
        db=db,
        user_id=current_user.id,
        file_bytes=file_bytes,
        original_filename=file.filename or "upload",
        mime_type=file.content_type or "application/octet-stream",
    )
    await db.commit()

    # Queue background OCR + AI processing
    background_tasks.add_task(
        _run_ocr_and_ai,
        prescription_id=prescription.id,
        user_id=current_user.id,
    )

    logger.info(f"Upload accepted: {prescription.id} | user={current_user.id}")

    return PrescriptionUploadResponse(
        id=prescription.id,
        original_filename=prescription.original_filename,
        file_type=prescription.file_type,
        file_size_bytes=prescription.file_size_bytes,
        status=prescription.status,
        message="File uploaded. AI analysis is running in the background.",
    )
