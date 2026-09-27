"""Calibration schemas – values must come from Student 1 / S4; never invented."""
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field, ConfigDict


class CalibrationCreate(BaseModel):
    calibration_version: str = Field(..., min_length=1)
    calibration_file_name: Optional[str] = None
    last_calibrated_at: Optional[datetime] = None
    q_hat: Optional[float] = None
    alpha: Optional[float] = None
    threshold: Optional[float] = None
    thresholds: Optional[dict[str, Any]] = None
    sample_count: Optional[int] = None
    scoring_function_version: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class CalibrationCurrentResponse(BaseModel):
    status: str  # active | unavailable
    calibration_version: Optional[str] = None
    calibration_file_name: Optional[str] = None
    last_calibrated_at: Optional[datetime] = None
    q_hat: Optional[float] = None
    alpha: Optional[float] = None
    threshold: Optional[float] = None
    thresholds: Optional[dict[str, Any]] = None
    sample_count: Optional[int] = None
    scoring_function_version: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CalibrationHistoryItem(BaseModel):
    id: int
    calibration_version: str
    calibration_file_name: Optional[str] = None
    last_calibrated_at: Optional[datetime] = None
    q_hat: Optional[float] = None
    alpha: Optional[float] = None
    threshold: Optional[float] = None
    thresholds: Optional[dict[str, Any]] = None
    sample_count: Optional[int] = None
    scoring_function_version: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
