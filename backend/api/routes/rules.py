from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.models.rule import ExtractedRule, RuleScope, RuleSource
from backend.agents.ripple_agent import ripple_agent
from backend.repositories.policy_repository import policy_repository
from backend.repositories.rule_repository import rule_repository
from backend.repositories.audit_repository import audit_repository

router = APIRouter(prefix="/api/rules", tags=["Rules"])


class ExtractRuleRequest(BaseModel):
    policy_id: str


class ConfirmRuleRequest(BaseModel):
    rule_id: str
    name: str
    field: str
    operator: str
    value: float
    previous_value: Optional[float] = None
    scope_semester: Optional[str] = None
    scope_department: Optional[str] = None
    scope_course_id: Optional[str] = None
    document: str
    section: Optional[str] = None
    page: Optional[int] = None
    clause_text: Optional[str] = None


class RejectRuleRequest(BaseModel):
    rule_id: str
    reason: Optional[str] = "Rejected by administrator"


@router.post("/extract")
async def extract_rule(req: ExtractRuleRequest):
    """
    Stage 2: AI ANALYSIS
    Strands Agent extracts the structured predicate from the policy document.
    """
    doc = policy_repository.get_document(req.policy_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Policy document not found.")

    rule, error_msg = ripple_agent.extract_rule(doc)
    if error_msg or not rule:
        audit_repository.record_event(
            event_type="rule_extraction_failed",
            entity_id=req.policy_id,
            details={"error": error_msg}
        )
        return {
            "success": False,
            "error": error_msg or "Failed to extract rule.",
            "requires_manual_review": True
        }

    rule_repository.save_rule(rule)
    audit_repository.record_event(
        event_type="rule_extracted",
        entity_id=rule.rule_id,
        details={
            "rule_name": rule.name,
            "field": rule.field,
            "operator": rule.operator,
            "value": rule.value,
            "previous_value": rule.previous_value,
            "confidence": rule.confidence
        }
    )

    return {
        "success": True,
        "rule": rule.model_dump()
    }


@router.post("/confirm")
async def confirm_rule(req: ConfirmRuleRequest):
    """
    Stage 3: REVIEW / HUMAN CONFIRMATION
    The administrator confirms (or edits) the extracted rule.
    The confirmed rule is immutable for subsequent deterministic validation.
    """
    existing_rule = rule_repository.get_rule(req.rule_id)

    human_edits = {}
    if existing_rule:
        if existing_rule.value != req.value:
            human_edits["value"] = {"from": existing_rule.value, "to": req.value}
        if existing_rule.operator != req.operator:
            human_edits["operator"] = {"from": existing_rule.operator, "to": req.operator}
        if existing_rule.field != req.field:
            human_edits["field"] = {"from": existing_rule.field, "to": req.field}

    confirmed_rule = ExtractedRule(
        rule_id=req.rule_id,
        name=req.name,
        entity="student_course",
        field=req.field,
        operator=req.operator,
        value=req.value,
        previous_value=req.previous_value,
        scope=RuleScope(
            semester=req.scope_semester,
            department=req.scope_department,
            course_id=req.scope_course_id
        ),
        source=RuleSource(
            document=req.document,
            section=req.section,
            page=req.page,
            clause_text=req.clause_text
        ),
        confidence=1.0,
        status="CONFIRMED",
        human_confirmed=True,
        human_edits=human_edits if human_edits else None
    )

    rule_repository.save_rule(confirmed_rule)

    event_type = "rule_edited" if human_edits else "rule_confirmed"
    audit_repository.record_event(
        event_type=event_type,
        entity_id=req.rule_id,
        details={
            "confirmed_threshold": req.value,
            "operator": req.operator,
            "human_edits": human_edits
        }
    )

    return {
        "success": True,
        "message": "Rule confirmed by administrator.",
        "rule": confirmed_rule.model_dump()
    }


@router.post("/reject")
async def reject_rule(req: RejectRuleRequest):
    """
    Administrator rejects the extracted rule.
    """
    existing = rule_repository.get_rule(req.rule_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Rule not found.")

    existing.status = "REJECTED"
    rule_repository.save_rule(existing)

    audit_repository.record_event(
        event_type="rule_rejected",
        entity_id=req.rule_id,
        details={"reason": req.reason}
    )

    return {"success": True, "message": "Rule rejected."}
