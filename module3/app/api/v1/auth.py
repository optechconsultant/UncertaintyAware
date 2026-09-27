"""Auth helper routes (module API key validation is done via dependencies)."""
from fastapi import APIRouter

from app.api.deps import AnyModuleAuth

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/verify")
def verify_key(_: AnyModuleAuth):
    return {"valid": True, "message": "API key accepted"}
