"""Request tracking service."""
from typing import Optional

from sqlalchemy.orm import Session

from app.repositories.request_repository import RequestRepository
from app.schemas.system import RequestTrackResponse, RequestsSummaryResponse


class RequestTrackerService:
    def __init__(self, db: Session):
        self.repo = RequestRepository(db)

    def get(self, request_id: str) -> Optional[RequestTrackResponse]:
        track = self.repo.get_by_request_id(request_id)
        if not track:
            return None
        return RequestTrackResponse.model_validate(track)

    def summary(self) -> RequestsSummaryResponse:
        counts = self.repo.counts()
        recent = self.repo.recent(limit=20)
        stages = [
            {
                "request_id": t.request_id,
                "question_id": t.question_id,
                "stage": t.stage,
                "status": t.status,
            }
            for t in recent
        ]
        return RequestsSummaryResponse(
            active=counts["active"],
            queued=counts["queued"],
            completed=counts["completed"],
            failed=counts["failed"],
            current_stages=stages,
        )
