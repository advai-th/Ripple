from fastapi import APIRouter
from backend.repositories.audit_repository import audit_repository

router = APIRouter(prefix="/api/audit", tags=["Audit"])


@router.get("")
async def get_audit_log():
    """
    Returns the append-only audit trail in descending chronological order.
    """
    entries = audit_repository.get_all()
    return [e.model_dump() for e in entries]
