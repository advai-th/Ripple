from typing import Optional
from pydantic import BaseModel, Field


class StudentRecord(BaseModel):
    student_id: str
    display_name: str
    department: str
    semester: str
    course_id: str
    enrollment_status: str = "ENROLLED"
    attended_sessions: int
    total_sessions: int
    remaining_sessions: int
    attendance_pct: float
    gpa: float
