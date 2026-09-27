"""Analytics, trends, drift history, alerts, risk schemas."""
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class TopicAnalytics(BaseModel):
    topic: str
    sample_count: int
    average_score: Optional[float] = None
    pass_rate: float = 0.0
    review_rate: float = 0.0
    flag_rate: float = 0.0
    ood_rate: float = 0.0
    drift_events: int = 0


class TrendsResponse(BaseModel):
    average_score_over_time: list[dict[str, Any]] = []
    flag_rate_over_time: list[dict[str, Any]] = []
    review_rate_over_time: list[dict[str, Any]] = []
    pass_rate_over_time: list[dict[str, Any]] = []
    ood_rate_over_time: list[dict[str, Any]] = []
    drift_events_over_time: list[dict[str, Any]] = []


class DriftHistoryItem(BaseModel):
    request_id: str
    question_id: str
    drift_status: Optional[str] = None
    ks_drift_detector: Optional[dict[str, Any]] = None
    decision: Optional[str] = None
    timestamp: Optional[datetime] = None
    created_at: datetime


class AlertsResponse(BaseModel):
    raw_alpha: float
    number_of_topics: int
    adjusted_alpha: float
    alerts: list[dict[str, Any]] = []


class SummaryAnalytics(BaseModel):
    total_inferences: int
    average_score: Optional[float] = None
    pass_rate: float = 0.0
    review_rate: float = 0.0
    flag_rate: float = 0.0
    ood_rate: float = 0.0
    drift_event_count: int = 0
    topics_count: int = 0


class RiskAnalysisRequest(BaseModel):
    focus_topics: Optional[list[str]] = None
    include_trends: bool = True
    include_drift: bool = True


class RiskAnalysisResponse(BaseModel):
    analysis_id: str
    summary: Optional[str] = None
    findings: Optional[list[dict[str, Any]]] = None
    created_at: datetime
