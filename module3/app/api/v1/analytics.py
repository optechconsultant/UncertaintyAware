"""Historical analytics endpoints owned by Student 3."""
from typing import List, Optional

from fastapi import APIRouter, Query

from app.api.deps import DbSession, Student4Auth, AnyModuleAuth
from app.core.config import get_settings
from app.schemas.analytics import (
    TopicAnalytics,
    TrendsResponse,
    DriftHistoryItem,
    AlertsResponse,
    SummaryAnalytics,
    RiskAnalysisRequest,
    RiskAnalysisResponse,
)
from app.services.failure_analyzer import FailureAnalyzerService
from app.services.trend_analyzer import TrendAnalyzerService
from app.services.drift_analyzer import DriftAnalyzerService
from app.services.risk_analyzer import RiskAnalyzerService
from app.repositories.analytics_repository import AnalyticsRepository

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=SummaryAnalytics)
def analytics_summary(
    db: DbSession,
    _: Student4Auth,
):
    repo = AnalyticsRepository(db)
    return repo.summary()


@router.get("/topics", response_model=List[TopicAnalytics])
def analytics_topics(
    db: DbSession,
    _: Student4Auth,
    topic: Optional[str] = Query(None),
):
    svc = FailureAnalyzerService(db)
    return svc.topics(topic=topic)


@router.get("/topics/{topic}", response_model=TopicAnalytics)
def analytics_topic_detail(
    topic: str,
    db: DbSession,
    _: Student4Auth,
):
    svc = FailureAnalyzerService(db)
    result = svc.single_topic(topic)
    if not result:
        # Return empty-ish structure rather than inventing data
        return TopicAnalytics(
            topic=topic,
            sample_count=0,
            average_score=None,
            pass_rate=0.0,
            review_rate=0.0,
            flag_rate=0.0,
            ood_rate=0.0,
            drift_events=0,
        )
    return result


@router.get("/trends", response_model=TrendsResponse)
def analytics_trends(
    db: DbSession,
    _: Student4Auth,
):
    svc = TrendAnalyzerService(db)
    return svc.trends()


@router.get("/drift", response_model=dict)
def analytics_drift(
    db: DbSession,
    _: Student4Auth,
):
    svc = DriftAnalyzerService(db)
    return {"status": svc.current_status()}


@router.get("/drift/history", response_model=List[DriftHistoryItem])
def analytics_drift_history(
    db: DbSession,
    _: Student4Auth,
    limit: int = Query(200, ge=1, le=1000),
):
    svc = DriftAnalyzerService(db)
    return svc.history(limit=limit)


@router.get("/alerts", response_model=AlertsResponse)
def analytics_alerts(
    db: DbSession,
    _: Student4Auth,
    alpha: Optional[float] = Query(None, description="Raw alpha; defaults to settings"),
):
    """
    Bonferroni correction: adjusted_alpha = alpha / number_of_topics.
    number_of_topics is computed dynamically from stored data.
    """
    settings = get_settings()
    raw_alpha = alpha if alpha is not None else settings.DEFAULT_ALPHA
    repo = AnalyticsRepository(db)
    topics = repo.topic_stats()
    n_topics = max(len(topics), 1)  # avoid division by zero; still dynamic
    adjusted = raw_alpha / n_topics

    alerts = []
    for t in topics:
        # Simple illustrative alert rule using adjusted alpha as severity threshold
        if t.flag_rate > adjusted or t.ood_rate > adjusted:
            alerts.append(
                {
                    "topic": t.topic,
                    "flag_rate": t.flag_rate,
                    "ood_rate": t.ood_rate,
                    "sample_count": t.sample_count,
                    "severity": "high" if t.flag_rate > 2 * adjusted else "medium",
                }
            )

    return AlertsResponse(
        raw_alpha=raw_alpha,
        number_of_topics=n_topics if topics else 0,
        adjusted_alpha=adjusted,
        alerts=alerts,
    )


@router.get("/risks", response_model=List[RiskAnalysisResponse])
def list_risks(
    db: DbSession,
    _: Student4Auth,
    limit: int = Query(10, ge=1, le=50),
):
    svc = RiskAnalyzerService(db)
    return svc.list_recent(limit=limit)


@router.post("/risks/analyze", response_model=RiskAnalysisResponse)
def analyze_risks(
    payload: RiskAnalysisRequest,
    db: DbSession,
    _: Student4Auth,
):
    svc = RiskAnalyzerService(db)
    return svc.analyze(payload)
