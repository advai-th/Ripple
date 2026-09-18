from typing import Dict, List, Optional
from backend.models.impact import ImpactResult


class ImpactRepository:
    def __init__(self):
        self._runs: Dict[str, List[ImpactResult]] = {}  # keyed by rule_id

    def save_results(self, rule_id: str, results: List[ImpactResult]):
        self._runs[rule_id] = results

    def get_results(self, rule_id: str) -> List[ImpactResult]:
        return self._runs.get(rule_id, [])

    def get_student_impact(self, rule_id: str, student_id: str) -> Optional[ImpactResult]:
        for res in self.get_results(rule_id):
            if res.student_id == student_id:
                return res
        return None


impact_repository = ImpactRepository()
