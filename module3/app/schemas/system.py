"""System, request tracking, and module status schemas."""
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class RequestTrackResponse(BaseModel):
    request_id: str
    question_id: Optional[str] = None
    stage: str
    status: str
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ModuleStatus(BaseModel):
    status: str  # online | offline | unknown


class ModulesStatusResponse(BaseModel):
    student1: ModuleStatus
    student2: ModuleStatus
    student3: ModuleStatus


class SystemStatusResponse(BaseModel):
    system_status: str
    current_stage: Optional[str] = None
    requests: dict[str, int]
    modules: ModulesStatusResponse
    calibration: dict[str, Any]
    drift: dict[str, Any]


class RequestsSummaryResponse(BaseModel):
    active: int
    queued: int
    completed: int
    failed: int
    current_stages: list[dict[str, Any]] = []
