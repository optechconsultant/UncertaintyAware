"""Aggregate dashboard data for Student 4 consumption."""
from typing import Any

from sqlalchemy.orm import Session

from app.models.calibration import CalibrationRecord
from app.repositories.analytics_repository import AnalyticsRepository
from app.repositories.request_repository import RequestRepository
from app.schemas.dashboard import DashboardStatusResponse, DashboardLiveResponse


class DashboardService:
    def __init__(self, db: Session):
        self.db = db
        self.request_repo = RequestRepository(db)
        self.analytics = AnalyticsRepository(db)

    def _current_calibration(self) -> dict[str, Any]:
        active = (
            self.db.query(CalibrationRecord)
            .filter(CalibrationRecord.is_active.is_(True))
            .order_by(CalibrationRecord.created_at.desc())
            .first()
        )
        if not active:
            return {
                "status": "unavailable",
                "version": None,
                "file_name": None,
                "last_calibrated_at": None,
                "q_hat": None,
                "alpha": None,
                "threshold": None,
                "thresholds": {},
            }
        return {
            "status": "active",
            "version": active.calibration_version,
            "file_name": active.calibration_file_name,
            "last_calibrated_at": (
                active.last_calibrated_at.isoformat()
                if active.last_calibrated_at
                else None
            ),
            "q_hat": active.q_hat,
            "alpha": active.alpha,
            "threshold": active.threshold,
            "thresholds": active.thresholds or {},
        }

    def status(self) -> DashboardStatusResponse:
        counts = self.request_repo.counts()
        # Derive a current stage from most recent processing request if any
        recent = self.request_repo.recent(limit=5)
        current_stage = None
        for t in recent:
            if t.status == "processing":
                current_stage = t.stage
                break
        if current_stage is None and recent:
            current_stage = recent[0].stage

        drift_status = self.analytics.recent_drift_status()
        # Student 3 always reports itself online; others are unknown without health probes
        modules = {
            "student1": "unknown",
            "student2": "unknown",
            "student3": "online",
        }

        return DashboardStatusResponse(
            requests={
                "active": counts["active"],
                "queued": counts["queued"],
                "completed": counts["completed"],
                "failed": counts["failed"],
            },
            stage={"current": current_stage},
            modules=modules,
            calibration=self._current_calibration(),
            drift={"status": drift_status},
        )

    def live(self) -> DashboardLiveResponse:
        status = self.status()
        from app.repositories.inference_repository import InferenceRepository

        inf_repo = InferenceRepository(self.db)
        recent = inf_repo.list_all(limit=10)
        recent_payload = [
            {
                "question_id": r.question_id,
                "decision": r.decision,
                "ood_status": r.ood_status,
                "drift_status": r.drift_status,
                "non_conformity_score": r.non_conformity_score,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in recent
        ]
        return DashboardLiveResponse(
            status=status,
            recent_inferences=recent_payload,
            alerts_preview=[],
        )
