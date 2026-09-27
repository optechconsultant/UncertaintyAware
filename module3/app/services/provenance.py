"""Provenance service: store Student 2 results with idempotency and audit logging."""
from typing import Optional
from uuid import uuid4

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.exceptions import ConflictError, NotFoundError
from app.core.logging import audit_inference_event, logger
from app.repositories.inference_repository import InferenceRepository
from app.repositories.request_repository import RequestRepository
from app.schemas.inference import InferenceCreate, InferenceResponse


class ProvenanceService:
    def __init__(self, db: Session):
        self.db = db
        self.inference_repo = InferenceRepository(db)
        self.request_repo = RequestRepository(db)

    def _resolve_question_id(self, data: InferenceCreate) -> str:
        if data.question_id:
            return data.question_id
        # Fallback: use request_id if question_id not supplied (still unique)
        return data.request_id

    def ingest(self, data: InferenceCreate) -> InferenceResponse:
        """
        Store a complete inference result.
        Idempotent on question_id: if already present, return existing record.
        """
        question_id = self._resolve_question_id(data)

        # Ensure request tracking exists
        track = self.request_repo.get_by_request_id(data.request_id)
        if not track:
            self.request_repo.create(
                request_id=data.request_id,
                question_id=question_id,
                stage="RECEIVED",
                status="queued",
            )
        self.request_repo.update_stage(
            data.request_id, stage="VALIDATING", status="processing"
        )

        existing = self.inference_repo.get_by_question_id(question_id)
        if existing:
            logger.info(
                "Idempotent hit for question_id=%s request_id=%s",
                question_id,
                data.request_id,
            )
            audit_inference_event(
                "inference_idempotent_return",
                {"question_id": question_id, "request_id": data.request_id},
            )
            self.request_repo.update_stage(
                data.request_id, stage="COMPLETED", status="completed"
            )
            return InferenceResponse.model_validate(existing)

        self.request_repo.update_stage(
            data.request_id, stage="STORING", status="processing"
        )
        audit_inference_event(
            "inference_store_start",
            {"question_id": question_id, "request_id": data.request_id},
            in_progress=True,
        )

        try:
            record = self.inference_repo.create(data, question_id=question_id)
        except IntegrityError:
            # Race condition: another concurrent insert won
            existing = self.inference_repo.get_by_question_id(question_id)
            if existing:
                self.request_repo.update_stage(
                    data.request_id, stage="COMPLETED", status="completed"
                )
                return InferenceResponse.model_validate(existing)
            raise ConflictError(f"Duplicate question_id: {question_id}")

        self.request_repo.update_stage(
            data.request_id, stage="ANALYZING", status="processing"
        )
        # Lightweight analysis hook (topic already provided or left null)
        audit_inference_event(
            "inference_stored",
            {
                "question_id": question_id,
                "request_id": data.request_id,
                "decision": data.decision,
                "ood_status": data.ood_status,
                "drift_status": data.drift_status,
            },
        )
        self.request_repo.update_stage(
            data.request_id, stage="COMPLETED", status="completed"
        )

        return InferenceResponse.model_validate(record)

    def get_by_question_id(self, question_id: str) -> InferenceResponse:
        record = self.inference_repo.get_by_question_id(question_id)
        if not record:
            raise NotFoundError(f"Inference with question_id={question_id} not found")
        return InferenceResponse.model_validate(record)
