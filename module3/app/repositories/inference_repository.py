"""Persistence for inference provenance records with idempotency on question_id."""
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.inference import InferenceRecord
from app.schemas.inference import InferenceCreate


class InferenceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_question_id(self, question_id: str) -> Optional[InferenceRecord]:
        return (
            self.db.query(InferenceRecord)
            .filter(InferenceRecord.question_id == question_id)
            .first()
        )

    def get_by_request_id(self, request_id: str) -> Optional[InferenceRecord]:
        return (
            self.db.query(InferenceRecord)
            .filter(InferenceRecord.request_id == request_id)
            .first()
        )

    def create(self, data: InferenceCreate, question_id: str) -> InferenceRecord:
        """
        Create a new inference record.
        Caller must ensure question_id uniqueness; IntegrityError indicates conflict.
        """
        record = InferenceRecord(
            request_id=data.request_id,
            question_id=question_id,
            query=data.query,
            model_output=data.model_output,
            non_conformity_score=data.non_conformity_score,
            ood_status=data.ood_status,
            decision=data.decision,
            drift_status=data.drift_status,
            adaptive_alpha=data.adaptive_alpha,
            ks_drift_detector=data.ks_drift_detector,
            thresholds=data.thresholds,
            scoring=data.scoring,
            query_index=data.query_index,
            topic=data.topic,
            timestamp=data.timestamp,
        )
        self.db.add(record)
        try:
            self.db.commit()
            self.db.refresh(record)
            return record
        except IntegrityError:
            self.db.rollback()
            raise

    def list_all(self, limit: int = 1000, offset: int = 0) -> list[InferenceRecord]:
        return (
            self.db.query(InferenceRecord)
            .order_by(InferenceRecord.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    def count(self) -> int:
        return self.db.query(InferenceRecord).count()

    def list_by_topic(self, topic: str) -> list[InferenceRecord]:
        return (
            self.db.query(InferenceRecord)
            .filter(InferenceRecord.topic == topic)
            .all()
        )

    def distinct_topics(self) -> list[str]:
        rows = (
            self.db.query(InferenceRecord.topic)
            .filter(InferenceRecord.topic.isnot(None))
            .distinct()
            .all()
        )
        return [r[0] for r in rows if r[0]]
