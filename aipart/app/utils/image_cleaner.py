"""
AiMedico - OCR Text Cleaner
Normalises raw OCR output for better AI understanding.
"""

import re


def clean_ocr_text(raw_text: str) -> str:
    """
    Clean and normalise raw OCR output:
    - Remove excessive whitespace and newlines
    - Fix common OCR character substitutions
    - Preserve medical abbreviations
    - Collapse multiple spaces
    """
    if not raw_text:
        return ""

    text = raw_text

    # Fix common OCR errors in medical context
    ocr_fixes = {
        r'\b0\b(?=\s*mg|\s*ml)': 'O',  # digit 0 vs letter O in units
        r'\bl\b(?=\s*\d)': '1',          # lowercase l vs digit 1
        r'[|]': 'I',                      # pipe → capital I
    }
    for pattern, replacement in ocr_fixes.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

    # Normalise line endings
    text = text.replace('\r\n', '\n').replace('\r', '\n')

    # Collapse 3+ blank lines to 2
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Remove non-printable characters except newlines and tabs
    text = re.sub(r'[^\x20-\x7E\n\t\u0980-\u09FF]', ' ', text)

    # Collapse multiple spaces
    text = re.sub(r'[ \t]{2,}', ' ', text)

    # Strip leading/trailing whitespace per line
    lines = [line.strip() for line in text.split('\n')]
    text = '\n'.join(line for line in lines if line)

    return text.strip()


def extract_possible_medicines(text: str) -> list[str]:
    """
    Heuristic pre-extraction of medicine-like tokens for context.
    Looks for patterns like: 'Tab <Name> <Dose>' or 'Cap <Name>'.
    """
    pattern = r'\b(?:Tab|Cap|Inj|Syr|Oint|Drops?|Gel)\s+([A-Za-z0-9\-]+(?:\s+\d+\s*mg)?)'
    matches = re.findall(pattern, text, flags=re.IGNORECASE)
    return list(set(matches))
