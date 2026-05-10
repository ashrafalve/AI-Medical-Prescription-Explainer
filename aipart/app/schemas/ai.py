"""
AiMedico - AI Result Schemas
Pydantic models for structured AI analysis output.
These mirror the JSON structure returned by OpenAI and stored in the DB.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.core.constants import EmergencyLevel


# ── Sub-schemas ───────────────────────────────────────────────────────────────

class MedicineItem(BaseModel):
    name: str = Field(..., description="Medicine name as detected")
    generic_name: Optional[str] = None
    brand_name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    route: Optional[str] = None
    timing: Optional[str] = None
    explanation_en: Optional[str] = None
    explanation_bn: Optional[str] = None
    side_effects: Optional[str] = None
    warnings: Optional[str] = None
    reminder_times: Optional[List[str]] = None


class DosageItem(BaseModel):
    medicine: str
    dose: Optional[str] = None
    frequency: Optional[str] = None
    timing: Optional[str] = None
    notes: Optional[str] = None


class WarningItem(BaseModel):
    level: str = Field(default="medium", description="low | medium | high | critical")
    message_en: str
    message_bn: Optional[str] = None
    keyword: Optional[str] = None


class TestItem(BaseModel):
    name: str
    purpose: Optional[str] = None
    explanation_en: Optional[str] = None
    explanation_bn: Optional[str] = None
    normal_range: Optional[str] = None


class ConditionItem(BaseModel):
    name: str
    explanation_en: Optional[str] = None
    explanation_bn: Optional[str] = None


class FollowUpItem(BaseModel):
    recommendation_en: str
    recommendation_bn: Optional[str] = None
    urgency: Optional[str] = None  # routine | soon | urgent


# ── Main AI Output Schema ─────────────────────────────────────────────────────

class AIAnalysisOutput(BaseModel):
    """
    Structured output from the AI analysis pipeline.
    This is what gets stored in AIResult and returned to the frontend.
    """
    medicines: List[MedicineItem] = Field(default_factory=list)
    dosage: List[DosageItem] = Field(default_factory=list)
    warnings: List[WarningItem] = Field(default_factory=list)
    tests: List[TestItem] = Field(default_factory=list)
    conditions: List[ConditionItem] = Field(default_factory=list)
    followup: List[FollowUpItem] = Field(default_factory=list)
    summary_en: str = Field(default="", description="Patient-friendly summary in English")
    summary_bn: str = Field(default="", description="Patient-friendly summary in Bangla")
    emergency_level: str = Field(
        default=EmergencyLevel.NONE,
        description="none | low | medium | high | critical",
    )
    emergency_keywords_found: List[str] = Field(default_factory=list)
    disclaimer_en: str = ""
    disclaimer_bn: str = ""


# ── API Response Schemas ───────────────────────────────────────────────────────

class AIResultResponse(BaseModel):
    """Full AI result as returned from the API."""
    id: str
    prescription_id: str
    status: str
    ai_model_used: Optional[str] = None
    total_tokens: int = 0
    processing_time_ms: int = 0
    analysis: Optional[AIAnalysisOutput] = None
    emergency_level: str = "none"
    error_message: Optional[str] = None

    model_config = {"from_attributes": True}


class AnalyseRequest(BaseModel):
    """Request to trigger AI analysis on an uploaded prescription."""
    prescription_id: str
    language: str = Field(default="en", pattern="^(en|bn|both)$")
    include_reminders: bool = False
