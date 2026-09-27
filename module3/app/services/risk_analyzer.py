"""Optional LLM-based risk analysis over historical evidence. Analytical only."""
from datetime import datetime, timezone
from typing import Any, Optional
from uuid import uuid4

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.logging import logger
from app.models.llm_analysis import LLMRiskAnalysis
from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.analytics import RiskAnalysisRequest, RiskAnalysisResponse


class RiskAnalyzerService:
    def __init__(self, db: Session):
        self.db = db
        self.analytics = AnalyticsRepository(db)
        self.settings = get_settings()

    def _build_evidence(self, req: RiskAnalysisRequest) -> dict[str, Any]:
        summary = self.analytics.summary()
        topics = self.analytics.topic_stats()
        trends = self.analytics.trends() if req.include_trends else {}
        drift = self.analytics.drift_history(limit=50) if req.include_drift else []

        high_flag = [
            t.model_dump()
            for t in topics
            if t.flag_rate >= 0.2 or t.ood_rate >= 0.1
        ]
        return {
            "summary": summary.model_dump(),
            "high_risk_topics": high_flag,
            "all_topics_count": len(topics),
            "trends_keys": list(trends.keys()) if trends else [],
            "recent_drift_count": len(drift),
        }

    def analyze(self, req: RiskAnalysisRequest) -> RiskAnalysisResponse:
        evidence = self._build_evidence(req)
        analysis_id = f"RISK-{uuid4().hex[:12]}"

        summary_text = (
            f"Total inferences: {evidence['summary']['total_inferences']}. "
            f"Flag rate: {evidence['summary']['flag_rate']:.2%}. "
            f"OOD rate: {evidence['summary']['ood_rate']:.2%}. "
            f"Drift events: {evidence['summary']['drift_event_count']}. "
            f"High-risk topics: {len(evidence['high_risk_topics'])}."
        )
        findings = [
            {
                "type": "summary",
                "message": summary_text,
            }
        ]
        for t in evidence["high_risk_topics"]:
            findings.append(
                {
                    "type": "topic_risk",
                    "topic": t.get("topic"),
                    "flag_rate": t.get("flag_rate"),
                    "ood_rate": t.get("ood_rate"),
                    "sample_count": t.get("sample_count"),
                }
            )

        # Optional real LLM call if enabled and key present
        raw = None
        if self.settings.LLM_RISK_ANALYSIS_ENABLED and self.settings.OPENAI_API_KEY:
            try:
                from app.llm.predictor import generate_risk_summary

                raw = generate_risk_summary(evidence)
                if raw:
                    summary_text = raw
            except Exception as e:
                logger.warning("LLM risk analysis failed: %s", e)

        record = LLMRiskAnalysis(
            analysis_id=analysis_id,
            summary=summary_text,
            findings=findings,
            raw_response=raw,
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)

        return RiskAnalysisResponse(
            analysis_id=analysis_id,
            summary=summary_text,
            findings=findings,
            created_at=record.created_at,
        )

    def list_recent(self, limit: int = 10) -> list[RiskAnalysisResponse]:
        rows = (
            self.db.query(LLMRiskAnalysis)
            .order_by(LLMRiskAnalysis.created_at.desc())
            .limit(limit)
            .all()
        )
        return [
            RiskAnalysisResponse(
                analysis_id=r.analysis_id,
                summary=r.summary,
                findings=r.findings,
                created_at=r.created_at,
            )
            for r in rows
        ]
