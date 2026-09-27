"""Historical trend analysis."""
from sqlalchemy.orm import Session

from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.analytics import TrendsResponse


class TrendAnalyzerService:
    def __init__(self, db: Session):
        self.repo = AnalyticsRepository(db)

    def trends(self) -> TrendsResponse:
        data = self.repo.trends()
        return TrendsResponse(**data)
