import pytest
from backend.models.policy import ParsedDocument
from backend.agents.ripple_agent import ripple_agent


def test_agent_extracts_simple_threshold():
    doc = ParsedDocument(
        document_id="doc_test_1",
        filename="policy.txt",
        content="Students must maintain at least 80% attendance.",
        page_count=1
    )
    rule, err = ripple_agent.extract_rule(doc)
    assert err is None
    assert rule is not None
    assert rule.field == "attendance_pct"
    assert rule.operator == ">="
    assert rule.value == 80.0
    assert rule.previous_value is None


def test_agent_extracts_revised_from_75_to_80():
    doc = ParsedDocument(
        document_id="doc_test_2",
        filename="Academic_Regulation_2026.pdf",
        content="--- Page 2 ---\nSection 3.2: The minimum attendance requirement has been revised from 75% to 80%. Scope: S5 students.",
        page_count=2
    )
    rule, err = ripple_agent.extract_rule(doc)
    assert err is None
    assert rule is not None
    assert rule.field == "attendance_pct"
    assert rule.operator == ">="
    assert rule.value == 80.0
    assert rule.previous_value == 75.0
    assert rule.scope.semester == "S5"
    assert rule.source.page == 2
    assert "Section 3.2" in rule.source.section


def test_agent_safe_failure_on_unsupported_complexity():
    doc = ParsedDocument(
        document_id="doc_test_3",
        filename="complex_policy.txt",
        content="Attendance is 80% except for special cases under discretionary waiver with grandfather clause accommodations.",
        page_count=1
    )
    rule, err = ripple_agent.extract_rule(doc)
    assert rule is None
    assert err is not None
    assert "Unsupported rule complexity" in err


def test_agent_personalized_action_phrasing():
    msg = ripple_agent.generate_personalized_action(
        display_name="Rohan Verma",
        actual_val=77.0,
        required_val=80.0,
        sessions_needed=6,
        remaining_sessions=20,
        is_possible=True
    )
    assert "77.0%" in msg
    assert "80.0%" in msg
    assert "6 out of 20" in msg
