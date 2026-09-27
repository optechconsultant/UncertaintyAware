"""Dashboard aggregate schemas consumed by Student 4."""
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class DashboardStatusResponse(BaseModel):
    requests: dict[str, int]
    stage: dict[str, Optional[str]]
    modules: dict[str, str]
    calibration: dict[str, Any]
    drift: dict[str, Any]


class DashboardLiveResponse(BaseModel):
    status: DashboardStatusResponse
    recent_inferences: list[dict[str, Any]] = []
    alerts_preview: list[dict[str, Any]] = []
