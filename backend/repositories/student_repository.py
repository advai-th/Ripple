import json
import logging
from pathlib import Path
from typing import List, Optional
from backend.models.student import StudentRecord
from backend.services.dynamodb_service import dynamodb_service

logger = logging.getLogger("ripple.repo.student")


class StudentRepository:
    def __init__(self, data_path: str = "backend/data/synthetic_students.json"):
        self.data_path = Path(data_path)
        self._students: List[StudentRecord] = []
        self._load()

    def _load(self):
        # 1. Attempt DynamoDB fetch if active
        dynamo_items = dynamodb_service.get_all_students()
        if dynamo_items and len(dynamo_items) > 0:
            try:
                self._students = [StudentRecord(**item) for item in dynamo_items]
                logger.info(f"Loaded {len(self._students)} students from Amazon DynamoDB")
                return
            except Exception as e:
                logger.warning(f"Failed parsing DynamoDB students: {e}. Falling back to local.")

        # 2. Local JSON fallback
        if self.data_path.exists():
            with open(self.data_path, "r", encoding="utf-8") as f:
                raw_data = json.load(f)
                self._students = [StudentRecord(**item) for item in raw_data]
                logger.info(f"Loaded {len(self._students)} students from local synthetic data")
        else:
            self._students = []

    def sync_to_dynamodb(self) -> int:
        """Pushes current in-memory/local synthetic student dataset to DynamoDB."""
        if not self._students:
            self._load()
        raw_items = [s.model_dump() for s in self._students]
        return dynamodb_service.batch_put_students(raw_items)

    def get_all(self) -> List[StudentRecord]:
        if not self._students:
            self._load()
        return self._students

    def get_by_id(self, student_id: str) -> Optional[StudentRecord]:
        # Fast in-memory lookup
        for s in self._students:
            if s.student_id == student_id:
                return s
        # Fallback to DynamoDB direct query
        dynamo_item = dynamodb_service.get_student(student_id)
        if dynamo_item:
            try:
                return StudentRecord(**dynamo_item)
            except Exception:
                pass
        return None

    def get_by_course(self, course_id: str) -> List[StudentRecord]:
        return [s for s in self._students if s.course_id == course_id]

    def get_by_semester(self, semester: str) -> List[StudentRecord]:
        return [s for s in self._students if s.semester == semester]


# Singleton instance for runtime
student_repository = StudentRepository()
