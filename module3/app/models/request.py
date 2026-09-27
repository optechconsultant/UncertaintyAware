"""Request lifecycle tracking model."""
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String, Text, Index

from app.database.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class RequestTrack(Base):
    __tablename__ = "request_tracks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    request_id = Column(String(64), nullable=False, unique=True, index=True)
    question_id = Column(String(64), nullable=True, index=True)

    # Stages: RECEIVED, VALIDATING, STORING, ANALYZING, COMPLETED, FAILED
    stage = Column(String(32), nullable=False, default="RECEIVED")
    # Statuses: queued, processing, completed, failed
    status = Column(String(32), nullable=False, default="queued")

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error = Column(Text, nullable=True)

    __table_args__ = (
        Index("ix_request_status", "status"),
        Index("ix_request_stage", "stage"),
    )
