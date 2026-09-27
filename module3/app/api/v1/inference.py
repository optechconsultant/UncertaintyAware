"""Inference provenance endpoints (Student 2 → Student 3)."""
from fastapi import APIRouter, status

from app.api.deps import DbSession, Student2Auth
from app.core.exceptions import not_found, conflict
from app.core.exceptions import NotFoundError, ConflictError
from app.schemas.inference import InferenceCreate, InferenceResponse
from app.services.provenance import ProvenanceService

router = APIRouter(prefix="/inferences", tags=["inference"])


@router.post(
    "",
    response_model=InferenceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_inference(
    payload: InferenceCreate,
    db: DbSession,
    _: Student2Auth,
):
    """
    Receive complete inference result from Student 2.
    Idempotent on question_id.
    """
    service = ProvenanceService(db)
    try:
        return service.ingest(payload)
    except ConflictError as e:
        raise conflict(str(e))
    except Exception as e:
        # Let FastAPI handle unexpected; provenance already updates request track on success path
        raise


@router.get("/{question_id}", response_model=InferenceResponse)
def get_inference(
    question_id: str,
    db: DbSession,
    _: Student2Auth,
):
    service = ProvenanceService(db)
    try:
        return service.get_by_question_id(question_id)
    except NotFoundError as e:
        raise not_found(str(e))
