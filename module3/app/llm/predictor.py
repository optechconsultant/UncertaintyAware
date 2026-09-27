"""Helpers that call optional LLM for risk analysis only."""
import json
from typing import Any, Optional

from app.llm.openai_provider import OpenAIProvider


def generate_risk_summary(evidence: dict[str, Any]) -> Optional[str]:
    provider = OpenAIProvider()
    prompt = (
        "Analyze the following historical evidence from a conformal prediction "
        "system and produce a short risk summary highlighting high-failure topics, "
        "OOD trends, and drift concerns:\n\n"
        + json.dumps(evidence, default=str, indent=2)
    )
    return provider.complete(prompt)
