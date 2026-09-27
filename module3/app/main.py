"""ConformGuard Student 3 – Provenance + Analytics FastAPI application."""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.logging import logger, setup_logging
from app.core.exceptions import ConformGuardError
from app.database.database import Base, engine

# Import models so metadata is registered
from app.models import (  # noqa: F401
    InferenceRecord,
    RequestTrack,
    CalibrationRecord,
    LLMRiskAnalysis,
)

from app.api.v1 import health, inference, calibration, system, analytics, dashboard, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    settings = get_settings()
    logger.info("Starting %s v%s", settings.APP_NAME, settings.APP_VERSION)
    # Create tables (dev convenience; production should use migrations)
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ensured")
    yield
    logger.info("Shutting down %s", settings.APP_NAME)


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "ConformGuard Student 3 – Provenance, historical analytics, "
            "failure analysis, and LLM risk analysis. "
            "Does NOT own runtime decisions, OOD, KS drift, or dashboard UI."
        ),
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    prefix = settings.API_V1_PREFIX
    app.include_router(health.router, prefix=prefix)
    app.include_router(auth.router, prefix=prefix)
    app.include_router(inference.router, prefix=prefix)
    app.include_router(calibration.router, prefix=prefix)
    app.include_router(system.router, prefix=prefix)
    app.include_router(analytics.router, prefix=prefix)
    app.include_router(dashboard.router, prefix=prefix)

    @app.exception_handler(ConformGuardError)
    async def conformguard_error_handler(request: Request, exc: ConformGuardError):
        return JSONResponse(
            status_code=400,
            content={"detail": exc.message},
        )

    @app.get("/")
    def root():
        return {
            "service": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "health": f"{prefix}/health",
        }

    return app


app = create_app()
