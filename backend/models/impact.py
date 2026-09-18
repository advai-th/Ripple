from typing import Optional
from pydantic import BaseModel


class ImpactResult(BaseModel):
    student_id: str
    display_name: str
    course_id: str
    rule_id: str
    field: str
    actual_value: float
    required_value: float
    operator: str
    compliant: bool
    affected: bool
    status: str  # "AFFECTED", "AT_RISK", "UNAFFECTED"
    gap: float
    margin: Optional[float] = None
    future_sessions_needed: Optional[int] = None
    future_sessions_possible: bool = True
    evidence_text: str
    calculation_display: str
    recommended_action: Optional[str] = None
