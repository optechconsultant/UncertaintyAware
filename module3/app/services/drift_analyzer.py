"""Historical drift analysis – Student 2 is authoritative for runtime detection."""
from sqlalchemy.orm import Session

from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.analytics import DriftHistoryItem


class DriftAnalyzerService:
    def __init__(self, db: Session):
        self.repo = AnalyticsRepository(db)

    def history(self, limit: int = 200) -> list[DriftHistoryItem]:
        records = self.repo.drift_history(limit=limit)
        return [
            DriftHistoryItem(
                request_id=r.request_id,
                question_id=r.question_id,
                drift_status=r.drift_status,
                ks_drift_detector=r.ks_drift_detector,
                decision=r.decision,
                timestamp=r.timestamp,
                created_at=r.created_at,
            )
            for r in records
        ]

    def current_status(self) -> str:
        return self.repo.recent_drift_status()
