"""Dashboard endpoints for Student 4."""
from fastapi import APIRouter

from app.api.deps import DbSession, Student4Auth
from app.schemas.dashboard import DashboardStatusResponse, DashboardLiveResponse
from app.schemas.analytics import TopicAnalytics, TrendsResponse, DriftHistoryItem, RiskAnalysisResponse
from app.schemas.calibration import CalibrationCurrentResponse
from app.services.dashboard_service import DashboardService
from app.services.failure_analyzer import FailureAnalyzerService
from app.services.trend_analyzer import TrendAnalyzerService
from app.services.drift_analyzer import DriftAnalyzerService
from app.services.risk_analyzer import RiskAnalyzerService
from app.models.calibration import CalibrationRecord

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/status", response_model=DashboardStatusResponse)
def dashboard_status(
    db: DbSession,
    _: Student4Auth,
):
    svc = DashboardService(db)
    return svc.status()


@router.get("/live", response_model=DashboardLiveResponse)
def dashboard_live(
    db: DbSession,
    _: Student4Auth,
):
    svc = DashboardService(db)
    return svc.live()


@router.get("/topics", response_model=list[TopicAnalytics])
def dashboard_topics(
    db: DbSession,
    _: Student4Auth,
):
    return FailureAnalyzerService(db).topics()


@router.get("/trends", response_model=TrendsResponse)
def dashboard_trends(
    db: DbSession,
    _: Student4Auth,
):
    return TrendAnalyzerService(db).trends()


@router.get("/drift")
def dashboard_drift(
    db: DbSession,
    _: Student4Auth,
):
    svc = DriftAnalyzerService(db)
    return {
        "status": svc.current_status(),
        "history": [item.model_dump() for item in svc.history(limit=50)],
    }


@router.get("/risks", response_model=list[RiskAnalysisResponse])
def dashboard_risks(
    db: DbSession,
    _: Student4Auth,
):
    return RiskAnalyzerService(db).list_recent(limit=5)


@router.get("/calibration", response_model=CalibrationCurrentResponse)
def dashboard_calibration(
    db: DbSession,
    _: Student4Auth,
):
    active = (
        db.query(CalibrationRecord)
        .filter(CalibrationRecord.is_active.is_(True))
        .order_by(CalibrationRecord.created_at.desc())
        .first()
    )
    if not active:
        return CalibrationCurrentResponse(
            status="unavailable",
            calibration_version=None,
            calibration_file_name=None,
            last_calibrated_at=None,
            q_hat=None,
            alpha=None,
            threshold=None,
            thresholds={},
            sample_count=None,
            scoring_function_version=None,
        )
    return CalibrationCurrentResponse(
        status="active",
        calibration_version=active.calibration_version,
        calibration_file_name=active.calibration_file_name,
        last_calibrated_at=active.last_calibrated_at,
        q_hat=active.q_hat,
        alpha=active.alpha,
        threshold=active.threshold,
        thresholds=active.thresholds or {},
        sample_count=active.sample_count,
        scoring_function_version=active.scoring_function_version,
    )
