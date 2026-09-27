"""Calibration metadata received from Student 1 / Student 4. Never invent values."""
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, String, JSON, Boolean, Index

from app.database.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class CalibrationRecord(Base):
    __tablename__ = "calibration_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    calibration_version = Column(String(64), nullable=False, index=True)
    calibration_file_name = Column(String(256), nullable=True)
    last_calibrated_at = Column(DateTime(timezone=True), nullable=True)

    q_hat = Column(Float, nullable=True)
    alpha = Column(Float, nullable=True)
    threshold = Column(Float, nullable=True)  # often mirrors q_hat or primary conformal threshold
    thresholds = Column(JSON, nullable=True)  # e.g. {"default": ..., "theta_low": ..., "theta_high": ...}
    sample_count = Column(Integer, nullable=True)
    scoring_function_version = Column(String(64), nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (Index("ix_calibration_active", "is_active"),)
