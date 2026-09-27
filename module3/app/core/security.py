"""API key authentication for inter-module and admin requests."""
from typing import Optional

from fastapi import Header, HTTPException, status

from app.core.config import get_settings


def _validate_api_key(
    x_api_key: Optional[str],
    allowed_keys: list[str],
    detail: str = "Invalid or missing API key",
) -> str:
    if not x_api_key or x_api_key not in allowed_keys:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "ApiKey"},
        )
    return x_api_key


async def require_student2_key(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
) -> str:
    """Student 2 → Student 3 authentication."""
    settings = get_settings()
    return _validate_api_key(
        x_api_key,
        [settings.STUDENT2_API_KEY, settings.ADMIN_API_KEY],
        detail="Student2 or Admin API key required",
    )


async def require_student4_key(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
) -> str:
    """Student 4 → Student 3 authentication (dashboard / system)."""
    settings = get_settings()
    return _validate_api_key(
        x_api_key,
        [settings.STUDENT4_API_KEY, settings.ADMIN_API_KEY],
        detail="Student4 or Admin API key required",
    )


async def require_admin_key(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
) -> str:
    """Admin-only operations (e.g. calibration update)."""
    settings = get_settings()
    return _validate_api_key(
        x_api_key,
        [settings.ADMIN_API_KEY],
        detail="Admin API key required",
    )


async def require_any_module_key(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
) -> str:
    """Any authorized module or admin."""
    settings = get_settings()
    return _validate_api_key(
        x_api_key,
        [
            settings.STUDENT2_API_KEY,
            settings.STUDENT4_API_KEY,
            settings.ADMIN_API_KEY,
        ],
        detail="Valid module API key required",
    )
