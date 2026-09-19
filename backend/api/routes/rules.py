import uuid
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.models.rule import ExtractedRule, RuleScope, RuleSource
from backend.models.policy import ParsedDocument
from backend.agents.ripple_agent import ripple_agent
from backend.repositories.policy_repository import policy_repository
from backend.repositories.rule_repository import rule_repository
from backend.repositories.audit_repository import audit_repository

router = APIRouter(prefix="/api/rules", tags=["Rules"])


class ExtractRuleRequest(BaseModel):
    policy_id: Optional[str] = None
    policy_text: Optional[str] = None
    filename: Optional[str] = None


class ConfirmRuleRequest(BaseModel):
    rule_id: str
    name: Optional[str] = None
    field: Optional[str] = None
    operator: Optional[str] = None
    value: Optional[float] = None
    threshold_value: Optional[float] = None
    previous_value: Optional[float] = None
    scope_semester: Optional[str] = None
    scope_department: Optional[str] = None
    scope_course_id: Optional[str] = None
    scope: Optional[Any] = None
    document: Optional[str] = None
    section: Optional[str] = None
    page: Optional[int] = None
    clause_text: Optional[str] = None
    human_confirmed: Optional[bool] = True
    confirmed_by: Optional[str] = None


class RejectRuleRequest(BaseModel):
    rule_id: str
    reason: Optional[str] = "Rejected by administrator"
    rejected_by: Optional[str] = None


@router.post("/extract")
async def extract_rule(req: ExtractRuleRequest):
    """
    Stage 2: AI ANALYSIS
    Strands Agent extracts the structured predicate from the policy document.
    Accepts either policy_id (from upload) or direct policy_text and filename.
    """
    doc = None
    if req.policy_id:
        doc = policy_repository.get_document(req.policy_id)
    elif req.policy_text:
        doc = ParsedDocument(
            document_id=f"doc_{uuid.uuid4().hex[:8]}",
            filename=req.filename or "policy.txt",
            content=req.policy_text,
            page_count=1
        )

    if not doc:
        raise HTTPException(
            status_code=400,
            detail="Either valid 'policy_id' or 'policy_text' must be provided for rule extraction."
        )

    rule, error_msg = ripple_agent.extract_rule(doc)
    if error_msg or not rule:
        audit_repository.record_event(
            event_type="rule_extraction_failed",
            entity_id=req.policy_id or "adhoc_text",
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
            "summary": f"Ripple extracted rule {rule.rule_id}",
            "rule_name": rule.name,
            "field": rule.field,
            "operator": rule.operator,
            "value": rule.value,
            "previous_value": rule.previous_value,
            "confidence": rule.confidence
        },
        actor="Ripple"
    )

    rule_dict = rule.model_dump()
    rule_dict["threshold_value"] = rule.value
    if rule.source:
        rule_dict["source_section"] = rule.source.section or "Section 4.1"
        rule_dict["source_page"] = rule.source.page or 1
        rule_dict["raw_clause_text"] = rule.source.clause_text or ""
        rule_dict["source_document"] = rule.source.document or doc.filename

    return {
        "success": True,
        "rule": rule_dict,
        "extracted_rule": rule_dict,
        "raw_clauses": []
    }


@router.post("/confirm")
async def confirm_rule(req: ConfirmRuleRequest):
    """
    Stage 3: REVIEW / HUMAN CONFIRMATION
    The administrator confirms (or edits) the extracted rule.
    The confirmed rule is immutable for subsequent deterministic validation.
    """
    existing_rule = rule_repository.get_rule(req.rule_id)

    # Determine effective values
    final_val = req.value if req.value is not None else req.threshold_value
    if final_val is None and existing_rule:
        final_val = existing_rule.value
    if final_val is None:
        final_val = 75.0

    final_operator = req.operator or (existing_rule.operator if existing_rule else ">=")
    final_field = req.field or (existing_rule.field if existing_rule else "attendance_percentage")
    final_name = req.name or (existing_rule.name if existing_rule else "Institutional Compliance Standard")
    final_prev = req.previous_value if req.previous_value is not None else (existing_rule.previous_value if existing_rule else None)

    # Scopes
    final_semester = req.scope_semester
    final_dept = req.scope_department
    final_course = req.scope_course_id

    if isinstance(req.scope, dict):
        final_semester = req.scope.get("semester") if "semester" in req.scope else final_semester
        final_dept = req.scope.get("department") if "department" in req.scope else final_dept
        final_course = req.scope.get("course_id") if "course_id" in req.scope else final_course
    elif isinstance(req.scope, str):
        s_lower = req.scope.lower().strip()
        if s_lower in ("all", "all_students"):
            final_semester = None
            final_dept = None
            final_course = None
        elif s_lower.startswith("semester_") or req.scope.upper().startswith("S"):
            final_semester = req.scope.replace("semester_", "").replace("SEMESTER_", "").upper()
        else:
            final_dept = req.scope

    if (
        req.scope_semester is None
        and req.scope_department is None
        and req.scope_course_id is None
        and req.scope is None
        and existing_rule
        and existing_rule.scope
    ):
        final_semester = existing_rule.scope.semester
        final_dept = existing_rule.scope.department
        final_course = existing_rule.scope.course_id

    # Source
    final_doc = req.document or (existing_rule.source.document if existing_rule and existing_rule.source else "policy.txt")
    final_sec = req.section or (existing_rule.source.section if existing_rule and existing_rule.source else "Section 4.1")
    final_page = req.page if req.page is not None else (existing_rule.source.page if existing_rule and existing_rule.source else 1)
    final_clause = req.clause_text or (existing_rule.source.clause_text if existing_rule and existing_rule.source else "")

    human_edits = {}
    if existing_rule:
        if existing_rule.value != final_val:
            human_edits["value"] = {"from": existing_rule.value, "to": final_val}
        if existing_rule.operator != final_operator:
            human_edits["operator"] = {"from": existing_rule.operator, "to": final_operator}
        if existing_rule.field != final_field:
            human_edits["field"] = {"from": existing_rule.field, "to": final_field}

    confirmed_rule = ExtractedRule(
        rule_id=req.rule_id,
        name=final_name,
        entity="student_course",
        field=final_field,
        operator=final_operator,
        value=final_val,
        previous_value=final_prev,
        scope=RuleScope(
            semester=final_semester,
            department=final_dept,
            course_id=final_course
        ),
        source=RuleSource(
            document=final_doc,
            section=final_sec,
            page=final_page,
            clause_text=final_clause
        ),
        confidence=1.0,
        status="CONFIRMED",
        human_confirmed=True,
        human_edits=human_edits if human_edits else None
    )

    rule_repository.save_rule(confirmed_rule)

    actor = req.confirmed_by or "Dr. Aris Thorne"
    if human_edits:
        audit_repository.record_event(
            event_type="rule_edited",
            entity_id=req.rule_id,
            details={
                "summary": f"{actor} edited rule {req.rule_id}",
                "human_edits": human_edits
            },
            actor=actor
        )

    audit_repository.record_event(
        event_type="rule_confirmed",
        entity_id=req.rule_id,
        details={
            "summary": f"{actor} confirmed rule {req.rule_id}",
            "confirmed_threshold": final_val,
            "operator": final_operator,
            "human_edits": human_edits
        },
        actor=actor
    )

    rule_dict = confirmed_rule.model_dump()
    rule_dict["threshold_value"] = confirmed_rule.value
    if confirmed_rule.source:
        rule_dict["source_section"] = confirmed_rule.source.section
        rule_dict["source_page"] = confirmed_rule.source.page
        rule_dict["raw_clause_text"] = confirmed_rule.source.clause_text
        rule_dict["source_document"] = confirmed_rule.source.document

    return {
        "success": True,
        "status": "CONFIRMED",
        "message": "Rule confirmed by administrator.",
        "rule": rule_dict,
        "confirmed": True,
        "human_edits": human_edits
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

    actor = req.rejected_by or "Dr. Aris Thorne"
    audit_repository.record_event(
        event_type="rule_rejected",
        entity_id=req.rule_id,
        details={
            "summary": f"{actor} rejected rule {req.rule_id}",
            "reason": req.reason or "Rejected by administrator"
        },
        actor=actor
    )

    return {"success": True, "message": "Rule rejected."}
