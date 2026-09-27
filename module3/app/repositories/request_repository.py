"""Request lifecycle tracking repository."""
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.request import RequestTrack


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class RequestRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_request_id(self, request_id: str) -> Optional[RequestTrack]:
        return (
            self.db.query(RequestTrack)
            .filter(RequestTrack.request_id == request_id)
            .first()
        )

    def create(
        self,
        request_id: str,
        question_id: Optional[str] = None,
        stage: str = "RECEIVED",
        status: str = "queued",
    ) -> RequestTrack:
        track = RequestTrack(
            request_id=request_id,
            question_id=question_id,
            stage=stage,
            status=status,
        )
        self.db.add(track)
        self.db.commit()
        self.db.refresh(track)
        return track

    def update_stage(
        self,
        request_id: str,
        stage: str,
        status: Optional[str] = None,
        error: Optional[str] = None,
    ) -> Optional[RequestTrack]:
        track = self.get_by_request_id(request_id)
        if not track:
            return None
        track.stage = stage
        if status:
            track.status = status
        if stage in ("STORING", "ANALYZING", "VALIDATING") and not track.started_at:
            track.started_at = _utc_now()
        if stage in ("COMPLETED", "FAILED"):
            track.completed_at = _utc_now()
            track.status = status or ("completed" if stage == "COMPLETED" else "failed")
        if error is not None:
            track.error = error
        self.db.commit()
        self.db.refresh(track)
        return track

    def counts(self) -> dict[str, int]:
        from sqlalchemy import func

        rows = (
            self.db.query(RequestTrack.status, func.count(RequestTrack.id))
            .group_by(RequestTrack.status)
            .all()
        )
        counts = {"queued": 0, "processing": 0, "completed": 0, "failed": 0}
        for status, cnt in rows:
            if status in counts:
                counts[status] = cnt
        # map active ≈ processing
        return {
            "active": counts.get("processing", 0),
            "queued": counts.get("queued", 0),
            "completed": counts.get("completed", 0),
            "failed": counts.get("failed", 0),
        }

    def recent(self, limit: int = 50) -> list[RequestTrack]:
        return (
            self.db.query(RequestTrack)
            .order_by(RequestTrack.created_at.desc())
            .limit(limit)
            .all()
        )
