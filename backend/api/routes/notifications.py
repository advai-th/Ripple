from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.repositories.impact_repository import impact_repository
from backend.repositories.audit_repository import audit_repository

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


class SimulateNotificationRequest(BaseModel):
    rule_id: str
    target_student_id: Optional[str] = None  # if None, simulates for all affected students


@router.post("/simulate")
async def simulate_notifications(req: SimulateNotificationRequest):
    """
    Simulates notification generation and dispatch based exclusively on deterministic results.
    No live external email/SMS provider is invoked.
    """
    results = impact_repository.get_results(req.rule_id)
    if not results:
        raise HTTPException(status_code=404, detail="No analysis results found for this rule.")

    # Target affected students
    if req.target_student_id:
        targets = [r for r in results if r.student_id == req.target_student_id and r.affected]
    else:
        targets = [r for r in results if r.affected]

    simulated_messages = []
    for r in targets:
        message_body = (
            f"Official Academic Notification: Student {r.student_id} ({r.display_name}) "
            f"is affected by the revised {r.field} requirement ({r.operator} {r.required_value}%). "
            f"Your current recorded value is {r.actual_value}%. "
            f"Recommended Next Action: {r.recommended_action}"
        )
        simulated_messages.append({
            "student_id": r.student_id,
            "display_name": r.display_name,
            "channel": "SIMULATED_INBOX",
            "subject": f"Action Required: Policy Change Impact ({r.course_id})",
            "message": message_body,
            "timestamp": "2026-01-16T10:00:00Z"
        })

    audit_repository.record_event(
        event_type="notification_simulated",
        entity_id=req.rule_id,
        details={
            "recipient_count": len(simulated_messages),
            "sample_recipient": targets[0].student_id if targets else None
        }
    )

    return {
        "rule_id": req.rule_id,
        "simulated_count": len(simulated_messages),
        "notifications": simulated_messages
    }
