"""
AiMedico - AI Service
Reusable OpenAI client with retry logic, timeout handling,
structured JSON output, and token tracking.
"""

import json
import time
from typing import Any, Dict, Optional, Type

from openai import AsyncOpenAI, APIError, APITimeoutError, RateLimitError
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)

from app.core.config import settings
from app.core.logging import logger
from app.schemas.ai import AIAnalysisOutput
from app.core.constants import MEDICAL_DISCLAIMER_EN, MEDICAL_DISCLAIMER_BN
import logging


# ── Retry-decorated OpenAI call ───────────────────────────────────────────────

def _make_retry_decorator():
    return retry(
        reraise=True,
        stop=stop_after_attempt(settings.OPENAI_MAX_RETRIES),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((APITimeoutError, RateLimitError)),
        before_sleep=before_sleep_log(logging.getLogger("openai.retry"), logging.WARNING),
    )


class TokenUsage:
    def __init__(self, prompt: int = 0, completion: int = 0, total: int = 0):
        self.prompt = prompt
        self.completion = completion
        self.total = total


class AIServiceResult:
    def __init__(
        self,
        content: Any,
        usage: TokenUsage,
        model: str,
        time_ms: int,
        raw_response: str = "",
    ):
        self.content = content
        self.usage = usage
        self.model = model
        self.time_ms = time_ms
        self.raw_response = raw_response


class AIService:
    """
    Centralised OpenAI service.
    All AI interactions in AiMedico go through this class.
    """

    def __init__(self):
        self._client: Optional[AsyncOpenAI] = None

    @property
    def client(self) -> AsyncOpenAI:
        if self._client is None:
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY is not configured in environment variables.")
            self._client = AsyncOpenAI(
                api_key=settings.OPENAI_API_KEY,
                timeout=settings.OPENAI_TIMEOUT,
                max_retries=0,  # We handle retries manually via tenacity
            )
        return self._client

    # ── Core Chat Completion ──────────────────────────────────────────────────

    async def chat_completion(
        self,
        system_prompt: str,
        user_message: str,
        response_format: Optional[Dict] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> AIServiceResult:
        """
        Send a chat completion request with optional structured JSON output.

        Args:
            system_prompt: The system message defining AI behaviour.
            user_message: The user turn content.
            response_format: Set to {"type": "json_object"} for structured output.
            temperature: Override default temperature.
            max_tokens: Override default max tokens.

        Returns:
            AIServiceResult with content, token usage, and timing.
        """
        start = time.perf_counter()

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ]

        kwargs: Dict[str, Any] = {
            "model": settings.OPENAI_MODEL,
            "messages": messages,
            "temperature": temperature if temperature is not None else settings.OPENAI_TEMPERATURE,
            "max_tokens": max_tokens or settings.OPENAI_MAX_TOKENS,
        }

        if response_format:
            kwargs["response_format"] = response_format

        try:
            response = await self._call_openai_with_retry(**kwargs)
        except APIError as e:
            logger.error(f"OpenAI API error: {e}")
            raise

        elapsed_ms = int((time.perf_counter() - start) * 1000)

        choice = response.choices[0]
        raw_content = choice.message.content or ""

        usage = TokenUsage(
            prompt=response.usage.prompt_tokens if response.usage else 0,
            completion=response.usage.completion_tokens if response.usage else 0,
            total=response.usage.total_tokens if response.usage else 0,
        )

        logger.info(
            f"OpenAI call: {usage.total} tokens | {elapsed_ms}ms | model={response.model}"
        )

        return AIServiceResult(
            content=raw_content,
            usage=usage,
            model=response.model,
            time_ms=elapsed_ms,
            raw_response=raw_content,
        )

    @_make_retry_decorator()
    async def _call_openai_with_retry(self, **kwargs):
        """Isolated method so tenacity can decorate it."""
        return await self.client.chat.completions.create(**kwargs)

    # ── Structured JSON Output ────────────────────────────────────────────────

    async def chat_completion_json(
        self,
        system_prompt: str,
        user_message: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> AIServiceResult:
        """
        Like chat_completion but enforces JSON output mode.
        The system_prompt MUST instruct the model to respond in JSON.
        """
        result = await self.chat_completion(
            system_prompt=system_prompt,
            user_message=user_message,
            response_format={"type": "json_object"},
            temperature=temperature,
            max_tokens=max_tokens,
        )

        # Parse the JSON content
        try:
            result.content = json.loads(result.content)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI JSON response: {e}\nRaw: {result.raw_response}")
            result.content = {}

        return result

    # ── Medical Analysis Entry Point ──────────────────────────────────────────

    async def analyse_prescription(
        self,
        ocr_text: str,
        language: str = "both",
        prompt_fn=None,
    ) -> AIServiceResult:
        """
        Run the full prescription analysis pipeline.

        Args:
            ocr_text: Cleaned text extracted by OCR.
            language: "en", "bn", or "both".
            prompt_fn: Callable that returns (system_prompt, user_message).

        Returns:
            AIServiceResult with content parsed as AIAnalysisOutput.
        """
        if prompt_fn is None:
            from app.prompts.prescription_prompt import build_prescription_prompt
            prompt_fn = build_prescription_prompt

        system_prompt, user_message = prompt_fn(ocr_text, language)
        result = await self.chat_completion_json(system_prompt, user_message)

        # Inject disclaimers
        if isinstance(result.content, dict):
            result.content["disclaimer_en"] = MEDICAL_DISCLAIMER_EN
            result.content["disclaimer_bn"] = MEDICAL_DISCLAIMER_BN

        # Validate via Pydantic
        try:
            parsed = AIAnalysisOutput(**result.content)
            result.content = parsed
        except Exception as e:
            logger.warning(f"AIAnalysisOutput validation partial: {e}")
            result.content = AIAnalysisOutput(
                summary_en="Unable to fully parse the medical document.",
                disclaimer_en=MEDICAL_DISCLAIMER_EN,
                disclaimer_bn=MEDICAL_DISCLAIMER_BN,
            )

        return result


# Singleton
ai_service = AIService()
