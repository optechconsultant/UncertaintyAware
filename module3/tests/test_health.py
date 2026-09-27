"""Basic health and smoke tests."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "healthy"
    assert data["service"] == "conformguard-student3"


def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert "docs" in r.json()
