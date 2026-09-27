"""Historical analytics computed from stored inference records."""
from collections import defaultdict
from datetime import datetime
from typing import Any, Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.inference import InferenceRecord
from app.schemas.analytics import TopicAnalytics, SummaryAnalytics


class AnalyticsRepository:
    def __init__(self, db: Session):
        self.db = db

    def summary(self) -> SummaryAnalytics:
        total = self.db.query(InferenceRecord).count()
        if total == 0:
            return SummaryAnalytics(
                total_inferences=0,
                average_score=None,
                pass_rate=0.0,
                review_rate=0.0,
                flag_rate=0.0,
                ood_rate=0.0,
                drift_event_count=0,
                topics_count=0,
            )

        avg_score = (
            self.db.query(func.avg(InferenceRecord.non_conformity_score))
            .scalar()
        )
        decisions = (
            self.db.query(InferenceRecord.decision, func.count(InferenceRecord.id))
            .group_by(InferenceRecord.decision)
            .all()
        )
        decision_map = {d or "UNKNOWN": c for d, c in decisions}
        pass_c = decision_map.get("PASS", 0)
        review_c = decision_map.get("REVIEW", 0)
        flag_c = decision_map.get("FLAG", 0)

        ood_c = (
            self.db.query(InferenceRecord)
            .filter(InferenceRecord.ood_status == "Out_of_domain")
            .count()
        )
        drift_c = (
            self.db.query(InferenceRecord)
            .filter(InferenceRecord.drift_status == "Drift")
            .count()
        )
        topics = (
            self.db.query(InferenceRecord.topic)
            .filter(InferenceRecord.topic.isnot(None))
            .distinct()
            .count()
        )

        return SummaryAnalytics(
            total_inferences=total,
            average_score=float(avg_score) if avg_score is not None else None,
            pass_rate=pass_c / total,
            review_rate=review_c / total,
            flag_rate=flag_c / total,
            ood_rate=ood_c / total,
            drift_event_count=drift_c,
            topics_count=topics,
        )

    def topic_stats(self, topic: Optional[str] = None) -> list[TopicAnalytics]:
        q = self.db.query(InferenceRecord)
        if topic:
            q = q.filter(InferenceRecord.topic == topic)
        records = q.all()

        by_topic: dict[str, list[InferenceRecord]] = defaultdict(list)
        for r in records:
            t = r.topic or "unknown"
            by_topic[t].append(r)

        results = []
        for t, items in sorted(by_topic.items()):
            n = len(items)
            if n == 0:
                continue
            scores = [i.non_conformity_score for i in items if i.non_conformity_score is not None]
            avg = sum(scores) / len(scores) if scores else None
            pass_c = sum(1 for i in items if i.decision == "PASS")
            review_c = sum(1 for i in items if i.decision == "REVIEW")
            flag_c = sum(1 for i in items if i.decision == "FLAG")
            ood_c = sum(1 for i in items if i.ood_status == "Out_of_domain")
            drift_c = sum(1 for i in items if i.drift_status == "Drift")
            results.append(
                TopicAnalytics(
                    topic=t,
                    sample_count=n,
                    average_score=avg,
                    pass_rate=pass_c / n,
                    review_rate=review_c / n,
                    flag_rate=flag_c / n,
                    ood_rate=ood_c / n,
                    drift_events=drift_c,
                )
            )
        return results

    def trends(self, bucket: str = "day") -> dict[str, list[dict[str, Any]]]:
        """
        Simple time-bucketed trends. Uses created_at date as key.
        """
        records = (
            self.db.query(InferenceRecord)
            .order_by(InferenceRecord.created_at.asc())
            .all()
        )
        buckets: dict[str, list[InferenceRecord]] = defaultdict(list)
        for r in records:
            ts = r.created_at or r.timestamp
            if not ts:
                continue
            if isinstance(ts, datetime):
                key = ts.date().isoformat()
            else:
                key = str(ts)[:10]
            buckets[key].append(r)

        avg_score, flag_rate, review_rate, pass_rate, ood_rate, drift_events = (
            [],
            [],
            [],
            [],
            [],
            [],
        )
        for key in sorted(buckets.keys()):
            items = buckets[key]
            n = len(items)
            scores = [i.non_conformity_score for i in items if i.non_conformity_score is not None]
            avg = sum(scores) / len(scores) if scores else None
            avg_score.append({"date": key, "value": avg})
            flag_rate.append(
                {"date": key, "value": sum(1 for i in items if i.decision == "FLAG") / n}
            )
            review_rate.append(
                {"date": key, "value": sum(1 for i in items if i.decision == "REVIEW") / n}
            )
            pass_rate.append(
                {"date": key, "value": sum(1 for i in items if i.decision == "PASS") / n}
            )
            ood_rate.append(
                {
                    "date": key,
                    "value": sum(1 for i in items if i.ood_status == "Out_of_domain") / n,
                }
            )
            drift_events.append(
                {
                    "date": key,
                    "value": sum(1 for i in items if i.drift_status == "Drift"),
                }
            )

        return {
            "average_score_over_time": avg_score,
            "flag_rate_over_time": flag_rate,
            "review_rate_over_time": review_rate,
            "pass_rate_over_time": pass_rate,
            "ood_rate_over_time": ood_rate,
            "drift_events_over_time": drift_events,
        }

    def drift_history(self, limit: int = 200) -> list[InferenceRecord]:
        return (
            self.db.query(InferenceRecord)
            .filter(InferenceRecord.drift_status == "Drift")
            .order_by(InferenceRecord.created_at.desc())
            .limit(limit)
            .all()
        )

    def recent_drift_status(self) -> str:
        last = (
            self.db.query(InferenceRecord)
            .order_by(InferenceRecord.created_at.desc())
            .first()
        )
        if not last:
            return "normal"
        return "Drift" if last.drift_status == "Drift" else "normal"
