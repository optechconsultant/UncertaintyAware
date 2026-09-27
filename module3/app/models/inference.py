"""Inference provenance model – authoritative store of Student 2 results."""
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    JSON,
    UniqueConstraint,
    Index,
)

from app.database.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class InferenceRecord(Base):
    __tablename__ = "inference_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    request_id = Column(String(64), nullable=False, index=True)
    question_id = Column(String(64), nullable=False, unique=True, index=True)

    query = Column(Text, nullable=False)
    model_output = Column(Text, nullable=True)
    non_conformity_score = Column(Float, nullable=True)

    ood_status = Column(String(32), nullable=True)  # In_domain | Out_of_domain
    decision = Column(String(16), nullable=True)  # PASS | REVIEW | FLAG
    drift_status = Column(String(32), nullable=True)  # NO_Drift | Drift
    adaptive_alpha = Column(Float, nullable=True)

    # Nested structures stored as JSON
    ks_drift_detector = Column(JSON, nullable=True)
    thresholds = Column(JSON, nullable=True)
    scoring = Column(JSON, nullable=True)

    query_index = Column(Integer, nullable=True)
    topic = Column(String(128), nullable=True, index=True)

    timestamp = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    __table_args__ = (
        UniqueConstraint("question_id", name="uq_inference_question_id"),
        Index("ix_inference_decision", "decision"),
        Index("ix_inference_ood", "ood_status"),
        Index("ix_inference_drift", "drift_status"),
        Index("ix_inference_created", "created_at"),
    )
