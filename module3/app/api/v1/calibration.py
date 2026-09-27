"""Calibration storage and query (values supplied by S1/S4 only)."""
from typing import List

from fastapi import APIRouter, status

from app.api.deps import DbSession, AdminAuth, Student4Auth, AnyModuleAuth
from app.models.calibration import CalibrationRecord
from app.schemas.calibration import (
    CalibrationCreate,
    CalibrationCurrentResponse,
    CalibrationHistoryItem,
)

router = APIRouter(prefix="/calibration", tags=["calibration"])


@router.post("", response_model=CalibrationCurrentResponse, status_code=status.HTTP_201_CREATED)
def upsert_calibration(
    payload: CalibrationCreate,
    db: DbSession,
    _: AdminAuth,
):
    """
    Persist calibration metadata received from authorized updater (S1/S4 via admin key).
    Deactivates previous active records.
    """
    # Deactivate previous
    previous = (
        db.query(CalibrationRecord)
        .filter(CalibrationRecord.is_active.is_(True))
        .all()
    )
    for p in previous:
        p.is_active = False

    record = CalibrationRecord(
        calibration_version=payload.calibration_version,
        calibration_file_name=payload.calibration_file_name,
        last_calibrated_at=payload.last_calibrated_at,
        q_hat=payload.q_hat,
        alpha=payload.alpha,
        threshold=payload.threshold,
        thresholds=payload.thresholds,
        sample_count=payload.sample_count,
        scoring_function_version=payload.scoring_function_version,
        is_active=True,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return CalibrationCurrentResponse(
        status="active",
        calibration_version=record.calibration_version,
        calibration_file_name=record.calibration_file_name,
        last_calibrated_at=record.last_calibrated_at,
        q_hat=record.q_hat,
        alpha=record.alpha,
        threshold=record.threshold,
        thresholds=record.thresholds or {},
        sample_count=record.sample_count,
        scoring_function_version=record.scoring_function_version,
    )


@router.get("/current", response_model=CalibrationCurrentResponse)
def get_current_calibration(
    db: DbSession,
    _: AnyModuleAuth,
):
    active = (
        db.query(CalibrationRecord)
        .filter(CalibrationRecord.is_active.is_(True))
        .order_by(CalibrationRecord.created_at.desc())
        .first()
    )
    if not active:
        return CalibrationCurrentResponse(
            status="unavailable",
            calibration_version=None,
            calibration_file_name=None,
            last_calibrated_at=None,
            q_hat=None,
            alpha=None,
            threshold=None,
            thresholds={},
            sample_count=None,
            scoring_function_version=None,
        )
    return CalibrationCurrentResponse(
        status="active",
        calibration_version=active.calibration_version,
        calibration_file_name=active.calibration_file_name,
        last_calibrated_at=active.last_calibrated_at,
        q_hat=active.q_hat,
        alpha=active.alpha,
        threshold=active.threshold,
        thresholds=active.thresholds or {},
        sample_count=active.sample_count,
        scoring_function_version=active.scoring_function_version,
    )


@router.get("/history", response_model=List[CalibrationHistoryItem])
def get_calibration_history(
    db: DbSession,
    _: AnyModuleAuth,
    limit: int = 50,
):
    rows = (
        db.query(CalibrationRecord)
        .order_by(CalibrationRecord.created_at.desc())
        .limit(limit)
        .all()
    )
    return [CalibrationHistoryItem.model_validate(r) for r in rows]
