from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.repositories.rule_repository import rule_repository
from backend.repositories.student_repository import student_repository
from backend.repositories.impact_repository import impact_repository
from backend.repositories.audit_repository import audit_repository
from backend.services.evaluation_engine import evaluate_rule
from backend.agents.ripple_agent import ripple_agent

router = APIRouter(prefix="/api/analyses", tags=["Analyses"])


class RunAnalysisRequest(BaseModel):
    rule_id: str
    at_risk_threshold: float = 5.0


@router.post("/run")
async def run_analysis(req: RunAnalysisRequest):
    """
    Stages 4 & 5: VALIDATE & IMPACT
    Deterministically evaluates all student records against the confirmed rule.
    NO LLM in the evaluation critical path.
    """
    rule = rule_repository.get_rule(req.rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found.")

    if not rule.human_confirmed:
        raise HTTPException(
            status_code=400,
            detail="Rule has not been confirmed by an administrator. Human confirmation is required before evaluation."
        )

    # 1. Fetch student dataset
    students = student_repository.get_all()
    if not students:
        raise HTTPException(status_code=500, detail="Student repository is empty.")

    # 2. Pure deterministic evaluation
    results = evaluate_rule(rule, students, at_risk_threshold=req.at_risk_threshold)

    # 3. Augment with personalized action phrasing using pre-computed numbers
    for res in results:
        res.recommended_action = ripple_agent.generate_personalized_action(
            display_name=res.display_name,
            actual_val=res.actual_value,
            required_val=res.required_value,
            sessions_needed=res.future_sessions_needed,
            remaining_sessions=20,  # from synthetic term standard
            is_possible=res.future_sessions_possible
        )

    # 4. Save to impact repository
    impact_repository.save_results(req.rule_id, results)

    # 5. Compute summary statistics
    total = len(results)
    affected = [r for r in results if r.status == "AFFECTED"]
    at_risk = [r for r in results if r.status == "AT_RISK"]
    unaffected = [r for r in results if r.status == "UNAFFECTED"]

    # 6. Record audit event
    audit_repository.record_event(
        event_type="evaluation_run",
        entity_id=req.rule_id,
        details={
            "total_evaluated": total,
            "affected_count": len(affected),
            "at_risk_count": len(at_risk),
            "unaffected_count": len(unaffected),
            "at_risk_threshold_pct": req.at_risk_threshold
        }
    )

    return {
        "rule_id": req.rule_id,
        "rule_name": rule.name,
        "summary": {
            "total_evaluated": total,
            "affected_count": len(affected),
            "at_risk_count": len(at_risk),
            "unaffected_count": len(unaffected),
        },
        "affected_students": [r.model_dump() for r in affected],
        "at_risk_students": [r.model_dump() for r in at_risk],
        "all_results": [r.model_dump() for r in results]
    }


@router.get("/{rule_id}")
async def get_analysis(rule_id: str):
    """
    Retrieves the evaluation results and summary for a given rule.
    """
    results = impact_repository.get_results(rule_id)
    if not results:
        raise HTTPException(status_code=404, detail="No evaluation results found for this rule.")

    affected = [r for r in results if r.status == "AFFECTED"]
    at_risk = [r for r in results if r.status == "AT_RISK"]
    unaffected = [r for r in results if r.status == "UNAFFECTED"]

    return {
        "rule_id": rule_id,
        "summary": {
            "total_evaluated": len(results),
            "affected_count": len(affected),
            "at_risk_count": len(at_risk),
            "unaffected_count": len(unaffected),
        },
        "affected_students": [r.model_dump() for r in affected],
        "at_risk_students": [r.model_dump() for r in at_risk],
        "all_results": [r.model_dump() for r in results]
    }
