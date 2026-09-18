import json
from pathlib import Path
from typing import List, Optional
from backend.models.student import StudentRecord


class StudentRepository:
    def __init__(self, data_path: str = "backend/data/synthetic_students.json"):
        self.data_path = Path(data_path)
        self._students: List[StudentRecord] = []
        self._load()

    def _load(self):
        if self.data_path.exists():
            with open(self.data_path, "r", encoding="utf-8") as f:
                raw_data = json.load(f)
                self._students = [StudentRecord(**item) for item in raw_data]
        else:
            self._students = []

    def get_all(self) -> List[StudentRecord]:
        return self._students

    def get_by_id(self, student_id: str) -> Optional[StudentRecord]:
        for s in self._students:
            if s.student_id == student_id:
                return s
        return None

    def get_by_course(self, course_id: str) -> List[StudentRecord]:
        return [s for s in self._students if s.course_id == course_id]

    def get_by_semester(self, semester: str) -> List[StudentRecord]:
        return [s for s in self._students if s.semester == semester]


# Singleton instance for local runtime
student_repository = StudentRepository()
