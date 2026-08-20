from abc import ABC, abstractmethod
from typing import Any, Dict
class BaseScorer(ABC):

    @abstractmethod
    def compute_score(self, **kwargs) -> float:
        pass
