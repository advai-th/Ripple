from typing import List, Dict, Any, Union
from backend.models.rule import ExtractedRule
from backend.models.student import StudentRecord
from backend.models.impact import ImpactResult
from backend.services.attendance_calculator import calculate_future_attendance


def evaluate_single_record(
    rule: Union[ExtractedRule, Dict[str, Any]],
    record: Union[StudentRecord, Dict[str, Any]],
    at_risk_threshold: float = 5.0,
) -> ImpactResult:
    """
    Deterministically evaluates a single student record against an extracted/confirmed rule.
    NO LLM involved. Pure Python logic.
    """
    # Normalize inputs if passed as dicts
    if isinstance(rule, dict):
        field = rule["field"]
        operator = rule["operator"]
        required_val = float(rule["value"])
        rule_id = rule.get("rule_id", "RULE_UNKNOWN")
        source_doc = rule.get("source", {}).get("document", "Unknown Document")
        source_sec = rule.get("source", {}).get("section", "N/A")
        source_page = rule.get("source", {}).get("page", "N/A")
    else:
        field = rule.field
        operator = rule.operator
        required_val = float(rule.value)
        rule_id = rule.rule_id
        source_doc = rule.source.document
        source_sec = rule.source.section or "N/A"
        source_page = str(rule.source.page) if rule.source.page is not None else "N/A"

    if isinstance(record, dict):
        student_id = str(record.get("student_id", "UNKNOWN"))
        display_name = str(record.get("display_name", "Student"))
        course_id = str(record.get("course_id", "N/A"))
        raw_val = record.get(field)
        attended = int(record.get("attended_sessions", 0))
        total = int(record.get("total_sessions", 0))
        remaining = int(record.get("remaining_sessions", 0))
    else:
        student_id = record.student_id
        display_name = record.display_name
        course_id = record.course_id
        raw_val = getattr(record, field, None)
        attended = record.attended_sessions
        total = record.total_sessions
        remaining = record.remaining_sessions

    if raw_val is None:
        raise ValueError(f"Record {student_id} is missing required evaluation field: '{field}'")

    actual_val = float(raw_val)

    # 1. Deterministic evaluation of predicate
    if operator == ">=":
        compliant = actual_val >= required_val
    elif operator == ">":
        compliant = actual_val > required_val
    elif operator == "<=":
        compliant = actual_val <= required_val
    elif operator == "<":
        compliant = actual_val < required_val
    elif operator == "==":
        compliant = actual_val == required_val
    elif operator == "!=":
        compliant = actual_val != required_val
    else:
        raise ValueError(f"Unsupported evaluation operator: '{operator}'")

    affected = not compliant
    gap = round(abs(required_val - actual_val), 2)
    calc_display = f"{actual_val} {operator} {required_val} -> {'TRUE' if compliant else 'FALSE'}"

    # 2. Deterministic Status Determination
    if affected:
        status = "AFFECTED"
    else:
        # Check for AT_RISK boundary condition
        # For >= or >, at risk means compliant but within at_risk_threshold
        if operator in (">=", ">"):
            if actual_val <= (required_val + at_risk_threshold):
                status = "AT_RISK"
            else:
                status = "UNAFFECTED"
        elif operator in ("<=", "<"):
            if actual_val >= (required_val - at_risk_threshold):
                status = "AT_RISK"
            else:
                status = "UNAFFECTED"
        else:
            status = "UNAFFECTED"

    # 3. Deterministic Future Math (if field is attendance_pct)
    future_needed = None
    future_possible = True
    action_text = None

    if field == "attendance_pct":
        math_res = calculate_future_attendance(
            attended_sessions=attended,
            total_sessions=total,
            remaining_sessions=remaining,
            required_pct=required_val,
        )
        future_needed = math_res["sessions_needed"]
        future_possible = math_res["is_possible"]
        action_text = math_res["explanation"]

    # 4. Deterministic Evidence Text Generation
    evidence_text = (
        f"Evaluation: {field} is {actual_val} vs required {required_val} ({operator}). "
        f"Result: {calc_display}. Status: {status}. "
        f"Policy Source: {source_doc}, Section: {source_sec}, Page: {source_page}."
    )

    return ImpactResult(
        student_id=student_id,
        display_name=display_name,
        course_id=course_id,
        rule_id=rule_id,
        field=field,
        actual_value=actual_val,
        required_value=required_val,
        operator=operator,
        compliant=compliant,
        affected=affected,
        status=status,
        gap=gap,
        margin=gap,
        future_sessions_needed=future_needed,
        future_sessions_possible=future_possible,
        evidence_text=evidence_text,
        calculation_display=calc_display,
        recommended_action=action_text,
    )


def evaluate_rule(
    rule: Union[ExtractedRule, Dict[str, Any]],
    student_records: List[Union[StudentRecord, Dict[str, Any]]],
    at_risk_threshold: float = 5.0,
) -> List[ImpactResult]:
    """
    Evaluates an entire dataset of student records against a confirmed rule deterministically.
    Filters by scope if specified in the rule.
    """
    results: List[ImpactResult] = []

    # Extract scope if any
    scope = rule.get("scope", {}) if isinstance(rule, dict) else rule.scope
    scope_semester = getattr(scope, "semester", None) if not isinstance(scope, dict) else scope.get("semester")
    scope_dept = getattr(scope, "department", None) if not isinstance(scope, dict) else scope.get("department")
    scope_course = getattr(scope, "course_id", None) if not isinstance(scope, dict) else scope.get("course_id")

    for record in student_records:
        rec_sem = record.get("semester") if isinstance(record, dict) else record.semester
        rec_dept = record.get("department") if isinstance(record, dict) else record.department
        rec_course = record.get("course_id") if isinstance(record, dict) else record.course_id

        # Check scope match
        if scope_semester and rec_sem and scope_semester != rec_sem:
            continue
        if scope_dept and rec_dept and scope_dept != rec_dept:
            continue
        if scope_course and rec_course and scope_course != rec_course:
            continue

        result = evaluate_single_record(rule, record, at_risk_threshold=at_risk_threshold)
        results.append(result)

    return results
