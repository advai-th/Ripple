import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class AuditEntry(BaseModel):
    event_id: str = Field(default_factory=lambda: f"evt_{uuid.uuid4().hex[:8]}")
    event_type: str  # uploaded, rule_extracted, rule_confirmed, rule_edited, rule_rejected, evaluation_run, notification_simulated
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    actor: str = "Administrator (Compliance Officer)"
    entity_id: str
    details: Dict[str, Any] = Field(default_factory=dict)


class AuditRepository:
    """
    Append-only audit log store.
    """
    def __init__(self):
        self._log: List[AuditEntry] = []

    def record_event(self, event_type: str, entity_id: str, details: Dict[str, Any], actor: str = "Administrator (Compliance Officer)") -> AuditEntry:
        entry = AuditEntry(
            event_type=event_type,
            entity_id=entity_id,
            details=details,
            actor=actor
        )
        self._log.append(entry)
        return entry

    def get_all(self) -> List[AuditEntry]:
        # Return descending chronological order
        return list(reversed(self._log))

    def get_by_entity(self, entity_id: str) -> List[AuditEntry]:
        return [entry for entry in reversed(self._log) if entry.entity_id == entity_id]


audit_repository = AuditRepository()
