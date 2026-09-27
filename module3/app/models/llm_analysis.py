"""Optional LLM risk analysis results (analytical layer only)."""
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String, Text, JSON

from app.database.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class LLMRiskAnalysis(Base):
    __tablename__ = "llm_risk_analyses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id = Column(String(64), nullable=False, unique=True, index=True)
    summary = Column(Text, nullable=True)
    findings = Column(JSON, nullable=True)
    raw_response = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
