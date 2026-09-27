"""Custom exceptions for Student 3."""
from fastapi import HTTPException, status


class ConformGuardError(Exception):
    """Base exception."""

    def __init__(self, message: str = "An error occurred"):
        self.message = message
        super().__init__(self.message)


class NotFoundError(ConformGuardError):
    pass


class ConflictError(ConformGuardError):
    pass


class ValidationError(ConformGuardError):
    pass


class DependencyUnavailableError(ConformGuardError):
    pass


def not_found(detail: str = "Resource not found") -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def conflict(detail: str = "Conflict / duplicate resource") -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


def bad_request(detail: str = "Invalid request") -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def unauthorized(detail: str = "Unauthorized") -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def internal_error(detail: str = "Internal server error") -> HTTPException:
    return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)


def service_unavailable(detail: str = "Dependency unavailable") -> HTTPException:
    return HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail)
