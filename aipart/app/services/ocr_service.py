"""
AiMedico - OCR Service
Multi-engine OCR pipeline: Tesseract (default) + EasyOCR fallback.
Includes image preprocessing to maximise accuracy on medical documents.
"""

import io
import time
from pathlib import Path
from typing import Optional, Tuple

import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

from app.core.config import settings
from app.core.logging import logger
from app.core.constants import OCREngine


class OCRResult:
    def __init__(self, text: str, confidence: Optional[float], engine: str, time_ms: int):
        self.text = text
        self.confidence = confidence
        self.engine = engine
        self.time_ms = time_ms

    def __bool__(self) -> bool:
        return bool(self.text and self.text.strip())


class OCRService:
    """
    Unified OCR service supporting Tesseract and EasyOCR.
    Applies image preprocessing before OCR for best results on prescriptions.
    """

    def __init__(self):
        self._easyocr_reader = None  # Lazy-loaded (heavy model)

    # ── Image Preprocessing ───────────────────────────────────────────────────

    def preprocess_image(self, image: Image.Image) -> Image.Image:
        """
        Apply standard preprocessing pipeline optimised for medical text:
        1. Convert to grayscale
        2. Enhance contrast
        3. Denoise
        4. Binarise (adaptive threshold via OpenCV)
        5. Deskew
        """
        # Convert PIL → OpenCV
        img_array = np.array(image.convert("RGB"))
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)

        # Denoise
        denoised = cv2.fastNlMeansDenoising(gray, h=10)

        # Adaptive threshold (handles uneven lighting on prescriptions)
        binary = cv2.adaptiveThreshold(
            denoised, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )

        # Convert back to PIL
        processed = Image.fromarray(binary)

        # Enhance contrast further
        enhancer = ImageEnhance.Contrast(processed)
        processed = enhancer.enhance(1.5)

        return processed

    def preprocess_image_bytes(self, image_bytes: bytes) -> Image.Image:
        """Load image from bytes and preprocess."""
        image = Image.open(io.BytesIO(image_bytes))
        return self.preprocess_image(image)

    # ── Tesseract OCR ─────────────────────────────────────────────────────────

    def extract_with_tesseract(self, image: Image.Image) -> OCRResult:
        """
        Run Tesseract on a preprocessed image.
        Supports English + Bangla if Tesseract language packs are installed.
        """
        import pytesseract

        if settings.TESSERACT_CMD:
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

        start = time.perf_counter()
        try:
            # Custom config: OEM 3 (LSTM), PSM 6 (block of text)
            custom_config = r"--oem 3 --psm 6 -l eng"
            processed = self.preprocess_image(image)

            data = pytesseract.image_to_data(
                processed,
                config=custom_config,
                output_type=pytesseract.Output.DICT,
            )

            # Build text from non-empty words
            words = [
                w for w, conf in zip(data["text"], data["conf"])
                if w.strip() and int(conf) > 30
            ]
            text = " ".join(words)

            # Average confidence
            confidences = [int(c) for c in data["conf"] if int(c) > 0]
            avg_conf = sum(confidences) / len(confidences) if confidences else 0.0

            elapsed_ms = int((time.perf_counter() - start) * 1000)
            logger.debug(f"Tesseract OCR: {len(words)} words, {avg_conf:.1f}% confidence")

            return OCRResult(
                text=text.strip(),
                confidence=round(avg_conf, 1),
                engine=OCREngine.TESSERACT,
                time_ms=elapsed_ms,
            )

        except Exception as e:
            logger.error(f"Tesseract OCR failed: {e}")
            return OCRResult(text="", confidence=None, engine=OCREngine.TESSERACT, time_ms=0)

    # ── EasyOCR ───────────────────────────────────────────────────────────────

    def _get_easyocr_reader(self):
        """Lazy-load EasyOCR reader (downloads models on first use)."""
        if self._easyocr_reader is None:
            try:
                import easyocr
                logger.info("Loading EasyOCR models (this may take a moment on first run)...")
                self._easyocr_reader = easyocr.Reader(["en"], gpu=False)
            except Exception as e:
                logger.error(f"Failed to load EasyOCR: {e}")
                raise
        return self._easyocr_reader

    def extract_with_easyocr(self, image: Image.Image) -> OCRResult:
        """Run EasyOCR on the image."""
        start = time.perf_counter()
        try:
            reader = self._get_easyocr_reader()
            processed = self.preprocess_image(image)
            img_array = np.array(processed)

            results = reader.readtext(img_array, detail=1)
            words = []
            confidences = []
            for _, text, conf in results:
                if text.strip() and conf > 0.3:
                    words.append(text.strip())
                    confidences.append(conf)

            full_text = " ".join(words)
            avg_conf = (sum(confidences) / len(confidences) * 100) if confidences else 0.0

            elapsed_ms = int((time.perf_counter() - start) * 1000)
            logger.debug(f"EasyOCR: {len(words)} words, {avg_conf:.1f}% confidence")

            return OCRResult(
                text=full_text.strip(),
                confidence=round(avg_conf, 1),
                engine=OCREngine.EASYOCR,
                time_ms=elapsed_ms,
            )

        except Exception as e:
            logger.error(f"EasyOCR failed: {e}")
            return OCRResult(text="", confidence=None, engine=OCREngine.EASYOCR, time_ms=0)

    # ── PDF Extraction ────────────────────────────────────────────────────────

    def extract_from_pdf(self, pdf_path: str) -> OCRResult:
        """
        Extract text from PDF:
        - Try pdfplumber (for digital PDFs) first
        - Fall back to image conversion + OCR (for scanned PDFs)
        """
        start = time.perf_counter()
        try:
            import pdfplumber
            with pdfplumber.open(pdf_path) as pdf:
                pages_text = []
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        pages_text.append(text)

            if pages_text:
                full_text = "\n\n".join(pages_text)
                elapsed_ms = int((time.perf_counter() - start) * 1000)
                logger.info(f"PDF text extracted via pdfplumber ({len(pdf.pages)} pages)")
                return OCRResult(
                    text=full_text.strip(),
                    confidence=95.0,  # Digital PDF = high confidence
                    engine="pdfplumber",
                    time_ms=elapsed_ms,
                )
        except Exception as e:
            logger.warning(f"pdfplumber extraction failed, falling back to OCR: {e}")

        # Fallback: convert PDF pages to images and OCR them
        try:
            from pdf2image import convert_from_path
            images = convert_from_path(pdf_path, dpi=200)
            all_text = []
            for i, img in enumerate(images):
                result = self.run(img)
                if result.text:
                    all_text.append(result.text)
                logger.debug(f"PDF page {i+1} OCR done")

            elapsed_ms = int((time.perf_counter() - start) * 1000)
            return OCRResult(
                text="\n\n".join(all_text),
                confidence=None,
                engine=f"pdf_ocr_{settings.OCR_ENGINE}",
                time_ms=elapsed_ms,
            )
        except Exception as e:
            logger.error(f"PDF image-OCR fallback failed: {e}")
            return OCRResult(text="", confidence=None, engine="pdf", time_ms=0)

    # ── Primary Entry Point ───────────────────────────────────────────────────

    def run(self, image: Image.Image) -> OCRResult:
        """
        Run OCR using the configured engine.
        Falls back to the alternative engine if the primary fails or returns low-confidence text.
        """
        engine = settings.OCR_ENGINE.lower()

        if engine == OCREngine.EASYOCR:
            result = self.extract_with_easyocr(image)
            if not result or (result.confidence and result.confidence < 40):
                logger.warning("EasyOCR low confidence, falling back to Tesseract")
                result = self.extract_with_tesseract(image)
        else:
            result = self.extract_with_tesseract(image)
            if not result or (result.confidence and result.confidence < 40):
                logger.warning("Tesseract low confidence, falling back to EasyOCR")
                result = self.extract_with_easyocr(image)

        return result

    def run_from_bytes(self, image_bytes: bytes) -> OCRResult:
        """Convenience method: run OCR from raw bytes."""
        image = Image.open(io.BytesIO(image_bytes))
        return self.run(image)

    def run_from_path(self, file_path: str) -> OCRResult:
        """Run OCR from a file path (image or PDF)."""
        path = Path(file_path)
        if path.suffix.lower() == ".pdf":
            return self.extract_from_pdf(file_path)
        image = Image.open(file_path)
        return self.run(image)


# Singleton
ocr_service = OCRService()
