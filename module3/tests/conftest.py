"""Pytest fixtures – ensure DB tables exist for tests."""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database.database import Base, engine


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    # Optional: Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
