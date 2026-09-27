"""Optional OpenAI provider for risk analysis."""
from typing import Any, Optional

from app.core.config import get_settings
from app.core.logging import logger
from app.llm.base import LLMProvider


class OpenAIProvider(LLMProvider):
    def __init__(self) -> None:
        self.settings = get_settings()

    def complete(self, prompt: str, **kwargs: Any) -> Optional[str]:
        if not self.settings.OPENAI_API_KEY:
            return None
        try:
            from openai import OpenAI

            client = OpenAI(api_key=self.settings.OPENAI_API_KEY)
            resp = client.chat.completions.create(
                model=self.settings.OPENAI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a risk analyst for an LLM conformal prediction "
                            "system. Summarize historical risk patterns concisely. "
                            "Do not invent runtime decisions."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=500,
            )
            return resp.choices[0].message.content
        except Exception as e:
            logger.warning("OpenAI call failed: %s", e)
            return None
