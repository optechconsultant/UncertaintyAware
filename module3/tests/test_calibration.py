"""Calibration storage tests – values must be supplied, never invented."""
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import get_settings

client = TestClient(app)
settings = get_settings()
ADMIN = {"X-API-Key": settings.ADMIN_API_KEY}
S4 = {"X-API-Key": settings.STUDENT4_API_KEY}


def test_calibration_unavailable_initially_or_after():
    r = client.get("/api/v1/calibration/current", headers=S4)
    assert r.status_code == 200
    # May be active if previous tests ran; just check structure
    data = r.json()
    assert "status" in data
    assert data["status"] in ("active", "unavailable")


def test_post_calibration():
    payload = {
        "calibration_version": "v-test-1",
        "calibration_file_name": "cal_v_test.json",
        "q_hat": 0.184,
        "alpha": 0.05,
        "threshold": 0.184,
        "thresholds": {"default": 0.184, "theta_low": 0.15, "theta_high": 0.25},
        "sample_count": 100,
        "scoring_function_version": "v1",
    }
    r = client.post("/api/v1/calibration", json=payload, headers=ADMIN)
    assert r.status_code == 201
    data = r.json()
    assert data["status"] == "active"
    assert data["q_hat"] == 0.184
    assert data["calibration_version"] == "v-test-1"

    r2 = client.get("/api/v1/calibration/current", headers=S4)
    assert r2.status_code == 200
    assert r2.json()["q_hat"] == 0.184
