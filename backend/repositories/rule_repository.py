from typing import Dict, List, Optional
from backend.models.rule import ExtractedRule


class RuleRepository:
    def __init__(self):
        self._rules: Dict[str, ExtractedRule] = {}

    def save_rule(self, rule: ExtractedRule):
        self._rules[rule.rule_id] = rule

    def get_rule(self, rule_id: str) -> Optional[ExtractedRule]:
        return self._rules.get(rule_id)

    def list_rules(self) -> List[ExtractedRule]:
        return list(self._rules.values())


rule_repository = RuleRepository()
