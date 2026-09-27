"""LLM provider abstraction."""
from abc import ABC, abstractmethod
from typing import Any, Optional


class LLMProvider(ABC):
    @abstractmethod
    def complete(self, prompt: str, **kwargs: Any) -> Optional[str]:
        pass
