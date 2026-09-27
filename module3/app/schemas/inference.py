"""Pydantic schemas for inference provenance (Student 2 → Student 3 contract)."""
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field, ConfigDict


class KSDriftDetectorSchema(BaseModel):
    status: Optional[str] = None  # NO_Drift | Drift
    # allow extra fields from Student 2
    model_config = ConfigDict(extra="allow")


class ThresholdsSchema(BaseModel):
    ood_threshold: Optional[float] = None
    conformal_threshold: Optional[float] = None
    model_config = ConfigDict(extra="allow")


class ScoringSchema(BaseModel):
    scoring_function_version: Optional[str] = None
    intermediate_outputs: Optional[dict[str, Any]] = None
    model_config = ConfigDict(extra="allow")


class InferenceCreate(BaseModel):
    """Complete inference result received from Student 2."""
    request_id: str = Field(..., min_length=1, max_length=64)
    question_id: Optional[str] = Field(None, max_length=64)  # if omitted, may derive from request_id
    query: str
    model_output: Optional[str] = None
    non_conformity_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    ood_status: Optional[str] = None  # In_domain | Out_of_domain
    decision: Optional[str] = None  # PASS | REVIEW | FLAG
    drift_status: Optional[str] = None  # NO_Drift | Drift
    adaptive_alpha: Optional[float] = None
    ks_drift_detector: Optional[dict[str, Any]] = None
    thresholds: Optional[dict[str, Any]] = None
    scoring: Optional[dict[str, Any]] = None
    query_index: Optional[int] = None
    topic: Optional[str] = None
    timestamp: Optional[datetime] = None

    model_config = ConfigDict(extra="allow")


class InferenceResponse(BaseModel):
    id: int
    request_id: str
    question_id: str
    query: str
    model_output: Optional[str] = None
    non_conformity_score: Optional[float] = None
    ood_status: Optional[str] = None
    decision: Optional[str] = None
    drift_status: Optional[str] = None
    adaptive_alpha: Optional[float] = None
    ks_drift_detector: Optional[dict[str, Any]] = None
    thresholds: Optional[dict[str, Any]] = None
    scoring: Optional[dict[str, Any]] = None
    query_index: Optional[int] = None
    topic: Optional[str] = None
    timestamp: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
