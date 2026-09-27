"""Historical failure / topic analysis (no runtime decisions)."""
from typing import Optional

from sqlalchemy.orm import Session

from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.analytics import TopicAnalytics


class FailureAnalyzerService:
    def __init__(self, db: Session):
        self.repo = AnalyticsRepository(db)

    def topics(self, topic: Optional[str] = None) -> list[TopicAnalytics]:
        return self.repo.topic_stats(topic=topic)

    def single_topic(self, topic: str) -> Optional[TopicAnalytics]:
        results = self.repo.topic_stats(topic=topic)
        return results[0] if results else None
