import pytest
from backend.models.rule import ExtractedRule, RuleSource, RuleScope
from backend.models.student import StudentRecord
from backend.services.evaluation_engine import evaluate_single_record, evaluate_rule


@pytest.fixture
def sample_rule():
    return ExtractedRule(
        rule_id="ATTENDANCE_001",
        name="Minimum Attendance Requirement",
        entity="student_course",
        field="attendance_pct",
        operator=">=",
        value=80.0,
        previous_value=75.0,
        scope=RuleScope(semester="S5"),
        source=RuleSource(
            document="Academic_Regulation_2026.pdf",
            section="3.2",
            page=4,
            clause_text="Students must maintain at least 80% attendance to be eligible for exams."
        ),
        confidence=1.0,
        status="CONFIRMED",
        human_confirmed=True
    )


def test_boundary_79_9_is_affected(sample_rule):
    record = StudentRecord(
        student_id="S001",
        display_name="Student 79.9",
        department="Computer Science",
        semester="S5",
        course_id="CS-101",
        attended_sessions=799,
        total_sessions=1000,
        remaining_sessions=100,
        attendance_pct=79.9,
        gpa=3.5
    )
    res = evaluate_single_record(sample_rule, record)
    assert res.compliant is False
    assert res.affected is True
    assert res.status == "AFFECTED"
    assert res.gap == 0.1
    assert "79.9 >= 80.0 -> FALSE" in res.calculation_display


def test_boundary_80_is_compliant_and_at_risk(sample_rule):
    record = StudentRecord(
        student_id="S002",
        display_name="Student 80.0",
        department="Computer Science",
        semester="S5",
        course_id="CS-101",
        attended_sessions=80,
        total_sessions=100,
        remaining_sessions=20,
        attendance_pct=80.0,
        gpa=3.6
    )
    res = evaluate_single_record(sample_rule, record)
    assert res.compliant is True
    assert res.affected is False
    assert res.status == "AT_RISK"  # within 5% of threshold (80-85)
    assert res.gap == 0.0
    assert "80.0 >= 80.0 -> TRUE" in res.calculation_display


def test_boundary_81_is_at_risk(sample_rule):
    record = StudentRecord(
        student_id="S003",
        display_name="Student 81.0",
        department="Computer Science",
        semester="S5",
        course_id="CS-101",
        attended_sessions=81,
        total_sessions=100,
        remaining_sessions=20,
        attendance_pct=81.0,
        gpa=3.8
    )
    res = evaluate_single_record(sample_rule, record)
    assert res.compliant is True
    assert res.affected is False
    assert res.status == "AT_RISK"


def test_boundary_85_is_at_risk(sample_rule):
    record = StudentRecord(
        student_id="S004",
        display_name="Student 85.0",
        department="Computer Science",
        semester="S5",
        course_id="CS-101",
        attended_sessions=85,
        total_sessions=100,
        remaining_sessions=20,
        attendance_pct=85.0,
        gpa=3.9
    )
    res = evaluate_single_record(sample_rule, record)
    assert res.compliant is True
    assert res.affected is False
    assert res.status == "AT_RISK"


def test_boundary_86_is_unaffected(sample_rule):
    record = StudentRecord(
        student_id="S005",
        display_name="Student 86.0",
        department="Computer Science",
        semester="S5",
        course_id="CS-101",
        attended_sessions=86,
        total_sessions=100,
        remaining_sessions=20,
        attendance_pct=86.0,
        gpa=3.9
    )
    res = evaluate_single_record(sample_rule, record)
    assert res.compliant is True
    assert res.affected is False
    assert res.status == "UNAFFECTED"


def test_missing_field_raises_error(sample_rule):
    bad_record = {
        "student_id": "BAD_01",
        "display_name": "Incomplete Record",
        "course_id": "CS-101",
        # 'attendance_pct' is intentionally omitted
    }
    with pytest.raises(ValueError, match="missing required evaluation field"):
        evaluate_single_record(sample_rule, bad_record)


def test_unsupported_operator_raises_error():
    bad_rule = {
        "rule_id": "BAD_OP",
        "field": "attendance_pct",
        "operator": "~=",  # invalid operator
        "value": 80.0,
        "source": {"document": "test.pdf"}
    }
    record = {
        "student_id": "S001",
        "attendance_pct": 77.0,
        "attended_sessions": 77,
        "total_sessions": 100,
        "remaining_sessions": 20
    }
    with pytest.raises(ValueError, match="Unsupported evaluation operator"):
        evaluate_single_record(bad_rule, record)


def test_scope_filtering(sample_rule):
    # Rule scope is semester="S5"
    s5_record = StudentRecord(
        student_id="S_S5",
        display_name="S5 Student",
        department="Computer Science",
        semester="S5",
        course_id="CS-101",
        attended_sessions=70,
        total_sessions=100,
        remaining_sessions=20,
        attendance_pct=70.0,
        gpa=3.1
    )
    s3_record = StudentRecord(
        student_id="S_S3",
        display_name="S3 Student",
        department="Computer Science",
        semester="S3",  # out of scope
        course_id="CS-101",
        attended_sessions=65,
        total_sessions=100,
        remaining_sessions=20,
        attendance_pct=65.0,
        gpa=3.0
    )

    results = evaluate_rule(sample_rule, [s5_record, s3_record])
    assert len(results) == 1
    assert results[0].student_id == "S_S5"
