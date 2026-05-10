"""
AiMedico - Summary Service
Generates emergency detection and human-readable summaries
from AI analysis output.
"""

from typing import List
from app.core.constants import (
    EMERGENCY_KEYWORDS_EN, EMERGENCY_KEYWORDS_BN,
    EmergencyLevel, MEDICAL_DISCLAIMER_EN, MEDICAL_DISCLAIMER_BN,
)
from app.schemas.ai import AIAnalysisOutput, WarningItem
from app.core.logging import logger


class SummaryService:
    def detect_emergency(self, text: str) -> tuple[str, List[str]]:
        text_lower = text.lower()
        found_en = [kw for kw in EMERGENCY_KEYWORDS_EN if kw in text_lower]
        found_bn = [kw for kw in EMERGENCY_KEYWORDS_BN if kw in text_lower]
        found = found_en + found_bn

        if not found:
            return EmergencyLevel.NONE, []

        critical_kws = {"cardiac arrest", "respiratory failure", "stroke", "heart attack", "anaphylaxis", "overdose"}
        if any(kw in critical_kws for kw in found):
            return EmergencyLevel.CRITICAL, found

        high_kws = {"chest pain", "emergency", "icu", "seizure"}
        if any(kw in high_kws for kw in found):
            return EmergencyLevel.HIGH, found

        return EmergencyLevel.MEDIUM, found

    def enrich_analysis(self, analysis: AIAnalysisOutput, raw_text: str) -> AIAnalysisOutput:
        emergency_level, found_kws = self.detect_emergency(raw_text)
        analysis.emergency_level = emergency_level
        analysis.emergency_keywords_found = found_kws

        if emergency_level in (EmergencyLevel.HIGH, EmergencyLevel.CRITICAL):
            kws_str = ", ".join(found_kws[:5])
            analysis.warnings.insert(0, WarningItem(
                level=emergency_level,
                message_en=f"🚨 EMERGENCY ALERT: Detected urgent medical keywords: {kws_str}. Seek immediate medical attention.",
                message_bn=f"🚨 জরুরি সতর্কতা: বিপজ্জনক শব্দ সনাক্ত: {kws_str}। অবিলম্বে চিকিৎসা সহায়তা নিন।",
                keyword=kws_str,
            ))

        analysis.disclaimer_en = MEDICAL_DISCLAIMER_EN
        analysis.disclaimer_bn = MEDICAL_DISCLAIMER_BN
        logger.info(f"Summary enriched: emergency_level={emergency_level}")
        return analysis

    def format_medicine_reminder(self, analysis: AIAnalysisOutput) -> List[dict]:
        reminders = []
        for med in analysis.medicines:
            if med.reminder_times:
                reminders.append({
                    "medicine": med.name,
                    "dosage": med.dosage,
                    "times": med.reminder_times,
                    "notes": med.timing,
                })
        return reminders


summary_service = SummaryService()
