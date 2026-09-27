"""Inference provenance and idempotency tests."""
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import get_settings

client = TestClient(app)
settings = get_settings()
HEADERS = {"X-API-Key": settings.STUDENT2_API_KEY}


def _payload(qid: str = "Q-TEST-001"):
    return {
        "request_id": "REQ-TEST-001",
        "question_id": qid,
        "query": "What is entropy?",
        "model_output": "Entropy is a measure of disorder.",
        "non_conformity_score": 0.42,
        "ood_status": "In_domain",
        "decision": "PASS",
        "drift_status": "NO_Drift",
        "adaptive_alpha": 0.04,
        "ks_drift_detector": {"status": "NO_Drift"},
        "thresholds": {"ood_threshold": 0.7, "conformal_threshold": 0.5},
        "scoring": {"scoring_function_version": "v1"},
        "query_index": 1,
        "topic": "science",
    }


def test_create_and_get_inference():
    # Clean-ish: use unique id
    qid = "Q-SMOKE-001"
    r = client.post("/api/v1/inferences", json=_payload(qid), headers=HEADERS)
    assert r.status_code in (200, 201)
    data = r.json()
    assert data["question_id"] == qid
    assert data["decision"] == "PASS"

    r2 = client.get(f"/api/v1/inferences/{qid}", headers=HEADERS)
    assert r2.status_code == 200
    assert r2.json()["question_id"] == qid


def test_idempotency():
    qid = "Q-IDEM-001"
    p = _payload(qid)
    r1 = client.post("/api/v1/inferences", json=p, headers=HEADERS)
    assert r1.status_code in (200, 201)
    id1 = r1.json()["id"]

    r2 = client.post("/api/v1/inferences", json=p, headers=HEADERS)
    assert r2.status_code in (200, 201)
    assert r2.json()["id"] == id1  # same record


def test_missing_api_key():
    r = client.post("/api/v1/inferences", json=_payload("Q-NOAUTH"))
    assert r.status_code == 401
