"""FastAPI dependencies."""
from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.security import (
    require_student2_key,
    require_student4_key,
    require_admin_key,
    require_any_module_key,
)

DbSession = Annotated[Session, Depends(get_db)]
Student2Auth = Annotated[str, Depends(require_student2_key)]
Student4Auth = Annotated[str, Depends(require_student4_key)]
AdminAuth = Annotated[str, Depends(require_admin_key)]
AnyModuleAuth = Annotated[str, Depends(require_any_module_key)]
