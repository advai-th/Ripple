import pytest
from backend.models.rule import ExtractedRule, RuleSource, RuleScope
from backend.models.student import StudentRecord
from backend.services.evaluation_engine import evaluate_single_record


def test_human_override_precedence():
    """
    Test scenario:
    AI originally extracted value = 85.0.
    Admin reviews and overrides value to 80.0.
    Evaluation MUST evaluate against 80.0.
    A student with 82.0% attendance must be COMPLIANT (AT_RISK), NOT AFFECTED.
    """
    # Student record with 82.0%
    student = StudentRecord(
        student_id="S_OVERRIDE",
        display_name="Student Override Test",
        department="Computer Science",
        semester="S5",
        course_id="CS-101",
        attended_sessions=82,
        total_sessions=100,
        remaining_sessions=20,
        attendance_pct=82.0,
        gpa=3.5
    )

    # 1. Simulate AI initial extraction (85%)
    ai_rule = ExtractedRule(
        rule_id="RULE_OVERRIDE_01",
        name="Minimum Attendance Requirement",
        entity="student_course",
        field="attendance_pct",
        operator=">=",
        value=85.0,  # AI extracted 85%
        previous_value=75.0,
        scope=RuleScope(semester="S5"),
        source=RuleSource(
            document="Academic_Regulation_2026.pdf",
            section="3.2",
            page=4,
            clause_text="...attendance requirement has been revised..."
        ),
        confidence=0.88,
        status="PENDING_REVIEW",
        human_confirmed=False
    )

    # If evaluated against AI rule, 82% would be AFFECTED:
    ai_eval = evaluate_single_record(ai_rule, student)
    assert ai_eval.affected is True
    assert ai_eval.compliant is False

    # 2. Admin inspects and edits value from 85 -> 80, then confirms:
    admin_confirmed_rule = ai_rule.model_copy(
        update={
            "value": 80.0,
            "human_confirmed": True,
            "status": "CONFIRMED",
            "human_edits": {"value": {"from": 85.0, "to": 80.0}}
        }
    )

    # 3. Deterministic evaluation runs strictly on the admin-confirmed rule:
    final_eval = evaluate_single_record(admin_confirmed_rule, student)
    assert final_eval.required_value == 80.0
    assert final_eval.compliant is True
    assert final_eval.affected is False
    assert final_eval.status == "AT_RISK"  # 82 is within 5% of 80
    assert "82.0 >= 80.0 -> TRUE" in final_eval.calculation_display
