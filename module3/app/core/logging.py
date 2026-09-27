"""Structured logging and JSONL audit helpers."""
import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from app.core.config import get_settings


def setup_logging() -> logging.Logger:
    settings = get_settings()
    log_dir = Path(settings.LOG_DIR)
    log_dir.mkdir(parents=True, exist_ok=True)

    logger = logging.getLogger("conformguard.student3")
    logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


logger = setup_logging()


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def write_jsonl_record(
    record: dict[str, Any],
    *,
    in_progress: bool = False,
    flush: bool = True,
) -> None:
    """
    Append a single JSONL record for auditability.
    Uses INPROGRESS file when in_progress=True, otherwise final results_log.jsonl.
    Does NOT claim full batch-level atomic rename unless explicitly implemented later.
    """
    settings = get_settings()
    path = (
        settings.RESULTS_LOG_INPROGRESS_FILE
        if in_progress
        else settings.RESULTS_LOG_FILE
    )
    Path(path).parent.mkdir(parents=True, exist_ok=True)

    line = json.dumps(record, default=str, ensure_ascii=False) + "\n"
    with open(path, "a", encoding="utf-8") as f:
        f.write(line)
        if flush:
            f.flush()
            os.fsync(f.fileno())


def audit_inference_event(
    event_type: str,
    payload: dict[str, Any],
    *,
    in_progress: bool = False,
) -> None:
    record = {
        "event_type": event_type,
        "timestamp": _utc_now_iso(),
        "payload": payload,
    }
    write_jsonl_record(record, in_progress=in_progress)
    logger.info("Audit event: %s", event_type)
