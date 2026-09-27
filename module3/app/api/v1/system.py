"""System status, modules, and request tracking endpoints."""
from fastapi import APIRouter

from app.api.deps import DbSession, Student4Auth, AnyModuleAuth
from app.schemas.system import (
    ModulesStatusResponse,
    ModuleStatus,
    SystemStatusResponse,
    RequestsSummaryResponse,
)
from app.services.request_tracker import RequestTrackerService
from app.services.dashboard_service import DashboardService
from app.services.drift_analyzer import DriftAnalyzerService

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/status", response_model=SystemStatusResponse)
def system_status(
    db: DbSession,
    _: Student4Auth,
):
    dash = DashboardService(db)
    status = dash.status()
    tracker = RequestTrackerService(db)
    req_summary = tracker.summary()
    drift_svc = DriftAnalyzerService(db)

    return SystemStatusResponse(
        system_status="operational",
        current_stage=status.stage.get("current"),
        requests={
            "active": req_summary.active,
            "queued": req_summary.queued,
            "completed": req_summary.completed,
            "failed": req_summary.failed,
        },
        modules=ModulesStatusResponse(
            student1=ModuleStatus(status=status.modules.get("student1", "unknown")),
            student2=ModuleStatus(status=status.modules.get("student2", "unknown")),
            student3=ModuleStatus(status="online"),
        ),
        calibration=status.calibration,
        drift={"status": drift_svc.current_status()},
    )


@router.get("/requests", response_model=RequestsSummaryResponse)
def system_requests(
    db: DbSession,
    _: Student4Auth,
):
    tracker = RequestTrackerService(db)
    return tracker.summary()


@router.get("/modules", response_model=ModulesStatusResponse)
def system_modules(
    db: DbSession,
    _: AnyModuleAuth,
):
    # Student 3 has no direct health probes to other modules in this implementation.
    # Status is reported honestly as unknown unless extended later.
    return ModulesStatusResponse(
        student1=ModuleStatus(status="unknown"),
        student2=ModuleStatus(status="unknown"),
        student3=ModuleStatus(status="online"),
    )
