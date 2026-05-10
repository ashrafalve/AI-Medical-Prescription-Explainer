"""
AiMedico - Medicine Service
Saves extracted medicine entities from AI output to the database.
"""

import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.models.medicine import Medicine
from app.schemas.ai import MedicineItem
from app.core.logging import logger


class MedicineService:
    async def save_medicines(
        self,
        db: AsyncSession,
        prescription_id: str,
        medicine_items: List[MedicineItem],
    ) -> List[Medicine]:
        """
        Delete existing medicines for this prescription and save new ones.
        Called after each AI analysis to keep data in sync.
        """
        # Remove stale records
        await db.execute(
            delete(Medicine).where(Medicine.prescription_id == prescription_id)
        )

        saved = []
        for item in medicine_items:
            reminder_str = ",".join(item.reminder_times) if item.reminder_times else None
            medicine = Medicine(
                id=str(uuid.uuid4()),
                prescription_id=prescription_id,
                name=item.name,
                generic_name=item.generic_name,
                brand_name=item.brand_name,
                dosage=item.dosage,
                frequency=item.frequency,
                duration=item.duration,
                route=item.route,
                timing=item.timing,
                explanation_en=item.explanation_en,
                explanation_bn=item.explanation_bn,
                side_effects=item.side_effects,
                warnings=item.warnings,
                reminder_times=reminder_str,
                reminder_enabled=bool(reminder_str),
            )
            db.add(medicine)
            saved.append(medicine)

        await db.flush()
        logger.info(f"Saved {len(saved)} medicines for prescription {prescription_id}")
        return saved

    async def get_by_prescription(
        self, db: AsyncSession, prescription_id: str
    ) -> List[Medicine]:
        stmt = select(Medicine).where(Medicine.prescription_id == prescription_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())


medicine_service = MedicineService()
