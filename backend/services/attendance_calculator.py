import math
from typing import Dict, Any


def calculate_future_attendance(
    attended_sessions: int,
    total_sessions: int,
    remaining_sessions: int,
    required_pct: float,
) -> Dict[str, Any]:
    """
    Deterministically computes the minimum future sessions a student must attend
    to reach or maintain the required attendance percentage.

    Formula:
      (attended_sessions + x) / (total_sessions + remaining_sessions) >= (required_pct / 100.0)

    Returns:
      {
        "sessions_needed": int,
        "is_possible": bool,
        "projected_pct_if_all_attended": float,
        "explanation": str
      }
    """
    total_term_sessions = total_sessions + remaining_sessions
    if total_term_sessions <= 0:
        return {
            "sessions_needed": 0,
            "is_possible": True,
            "projected_pct_if_all_attended": 0.0,
            "explanation": "No sessions in term."
        }

    required_proportion = required_pct / 100.0
    current_pct = round((attended_sessions / total_sessions) * 100.0, 1) if total_sessions > 0 else 0.0

    # Max possible attendance if student attends all remaining sessions
    max_possible_attended = attended_sessions + remaining_sessions
    max_possible_pct = round((max_possible_attended / total_term_sessions) * 100.0, 1)

    # Minimum x such that attended_sessions + x >= required_proportion * total_term_sessions
    required_total_attended = required_proportion * total_term_sessions
    min_x_raw = required_total_attended - attended_sessions

    if min_x_raw <= 0:
        # Already mathematically guaranteed or already compliant
        return {
            "sessions_needed": 0,
            "is_possible": True,
            "projected_pct_if_all_attended": max_possible_pct,
            "explanation": f"Already compliant with the required {required_pct}%. No additional sessions required beyond normal standing."
        }

    # x must be an integer count of sessions
    min_x = math.ceil(round(min_x_raw, 6))

    if min_x > remaining_sessions:
        return {
            "sessions_needed": min_x,
            "is_possible": False,
            "projected_pct_if_all_attended": max_possible_pct,
            "explanation": f"Mathematically impossible to reach {required_pct}%. Attending all {remaining_sessions} remaining sessions yields a maximum of {max_possible_pct}%."
        }

    return {
        "sessions_needed": min_x,
        "is_possible": True,
        "projected_pct_if_all_attended": max_possible_pct,
        "explanation": f"Must attend at least {min_x} out of {remaining_sessions} remaining sessions to reach {required_pct}%."
    }
