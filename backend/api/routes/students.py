from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query

from backend.repositories.student_repository import student_repository
from backend.repositories.impact_repository import impact_repository

router = APIRouter(prefix="/api/students", tags=["Students"])


@router.get("")
async def list_students(
    department: Optional[str] = None,
    semester: Optional[str] = None,
    course_id: Optional[str] = None
):
    """
    Retrieves synthetic student records with optional filtering.
    """
    students = student_repository.get_all()
    if department:
        students = [s for s in students if s.department == department]
    if semester:
        students = [s for s in students if s.semester == semester]
    if course_id:
        students = [s for s in students if s.course_id == course_id]
    return [s.model_dump() for s in students]


@router.get("/{student_id}")
async def get_student(student_id: str, rule_id: Optional[str] = None):
    """
    Retrieves student detail along with their evaluated impact under a rule if provided.
    """
    student = student_repository.get_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found.")

    impact = None
    if rule_id:
        impact_obj = impact_repository.get_student_impact(rule_id, student_id)
        if impact_obj:
            impact = impact_obj.model_dump()

    return {
        "student": student.model_dump(),
        "impact": impact
    }
