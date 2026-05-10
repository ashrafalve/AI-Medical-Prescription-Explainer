"""
AiMedico - Medicine Lookup Prompt
For detailed single-medicine explanation requests.
"""

from typing import Tuple


MEDICINE_SYSTEM_PROMPT = """You are AiMedico, a medical education assistant.
Explain medicines in simple language that a patient can understand.
You are NOT a doctor. Never recommend dosage changes. Always include a disclaimer.
Respond ONLY in valid JSON format.

OUTPUT SCHEMA:
{
  "name": "string",
  "generic_name": "string",
  "drug_class": "string",
  "uses_en": "string",
  "uses_bn": "string",
  "how_it_works_en": "string",
  "how_it_works_bn": "string",
  "common_side_effects": ["string"],
  "serious_warnings": ["string"],
  "interactions": ["string"],
  "storage": "string",
  "disclaimer": "string"
}"""


def build_medicine_prompt(medicine_name: str) -> Tuple[str, str]:
    user_message = f"""Please explain this medicine for a patient:

Medicine Name: {medicine_name}

Provide a clear, simple explanation. Use plain language. Respond only in JSON."""
    return MEDICINE_SYSTEM_PROMPT, user_message
