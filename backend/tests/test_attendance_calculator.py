import pytest
from backend.services.attendance_calculator import calculate_future_attendance


def test_already_compliant():
    # Student has 85% attendance, 85 out of 100 sessions, 20 remaining. Required = 80%
    # (85 + 0) / 120 = 70.8% -> wait, term total is 120, 80% of 120 is 96 sessions.
    # So if attended = 85 out of 100, they need 11 more sessions out of 20.
    # What if student already has enough attended sessions that even with 0 more they meet 80% of total term?
    # Total term = 50 sessions. Attended = 45. Remaining = 5. Required = 80% (40 sessions).
    # Attended 45 >= 40, so even with 0 attended, they are guaranteed >= 80%.
    res = calculate_future_attendance(
        attended_sessions=45,
        total_sessions=45,
        remaining_sessions=5,
        required_pct=80.0
    )
    assert res["sessions_needed"] == 0
    assert res["is_possible"] is True


def test_possible_compliance():
    # Term total = 100 sessions (80 past, 20 remaining).
    # Student attended 60 out of 80 (75%).
    # Required is 80% of 100 = 80 sessions.
    # Minimum x = 80 - 60 = 20 sessions needed out of 20 remaining.
    res = calculate_future_attendance(
        attended_sessions=60,
        total_sessions=80,
        remaining_sessions=20,
        required_pct=80.0
    )
    assert res["sessions_needed"] == 20
    assert res["is_possible"] is True
    assert res["projected_pct_if_all_attended"] == 80.0


def test_impossible_compliance():
    # Term total = 100 sessions (80 past, 20 remaining).
    # Student attended 50 out of 80 (62.5%).
    # Required is 80% of 100 = 80 sessions.
    # Minimum x = 80 - 50 = 30 sessions needed, but only 20 remaining!
    res = calculate_future_attendance(
        attended_sessions=50,
        total_sessions=80,
        remaining_sessions=20,
        required_pct=80.0
    )
    assert res["sessions_needed"] == 30
    assert res["is_possible"] is False
    assert res["projected_pct_if_all_attended"] == 70.0  # (50 + 20) / 100 = 70%


def test_exact_boundary():
    # 50 total sessions (40 past, 10 remaining).
    # Attended 30. Required = 80% (40 total needed).
    # Needed x = 10 out of 10.
    res = calculate_future_attendance(
        attended_sessions=30,
        total_sessions=40,
        remaining_sessions=10,
        required_pct=80.0
    )
    assert res["sessions_needed"] == 10
    assert res["is_possible"] is True
