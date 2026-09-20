import uuid
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from backend.services.dynamodb_service import dynamodb_service

logger = logging.getLogger("ripple.repo.audit")


class AuditEntry(BaseModel):
    event_id: str = Field(default_factory=lambda: f"evt_{uuid.uuid4().hex[:8]}")
    event_type: str  # uploaded, rule_extracted, rule_confirmed, rule_edited, rule_rejected, evaluation_run, notification_simulated
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    actor: str = "Administrator (Compliance Officer)"
    entity_id: str
    details: Dict[str, Any] = Field(default_factory=dict)


class AuditRepository:
    """
    Append-only immutable audit log store with Amazon DynamoDB persistence.
    """
    def __init__(self):
        self._log: List[AuditEntry] = []
        self._load_from_dynamodb()

    def _load_from_dynamodb(self):
        try:
            items = dynamodb_service.get_audit_entries(limit=100)
            if items:
                for item in items:
                    try:
                        self._log.append(AuditEntry(**item))
                    except Exception:
                        pass
        except Exception as e:
            logger.warning(f"DynamoDB audit fetch: {e}")

    def record_event(self, event_type: str, entity_id: str, details: Dict[str, Any], actor: str = "Administrator (Compliance Officer)") -> AuditEntry:
        entry = AuditEntry(
            event_type=event_type,
            entity_id=entity_id,
            details=details,
            actor=actor
        )
        self._log.append(entry)

        # Persist to DynamoDB immutable ledger
        try:
            data = entry.model_dump()
            data["id"] = entry.event_id
            data["timestamp"] = entry.timestamp.isoformat()
            dynamodb_service.put_audit_entry(data)
        except Exception as e:
            logger.warning(f"Failed writing audit entry to DynamoDB: {e}")

        return entry

    def get_all(self) -> List[AuditEntry]:
        # Return descending chronological order
        return list(reversed(self._log))

    def get_by_entity(self, entity_id: str) -> List[AuditEntry]:
        return [entry for entry in reversed(self._log) if entry.entity_id == entity_id]


audit_repository = AuditRepository()
