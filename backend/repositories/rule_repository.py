import logging
from typing import Dict, List, Optional
from backend.models.rule import ExtractedRule
from backend.services.dynamodb_service import dynamodb_service

logger = logging.getLogger("ripple.repo.rule")


class RuleRepository:
    def __init__(self):
        self._rules: Dict[str, ExtractedRule] = {}
        self._load_from_dynamodb()

    def _load_from_dynamodb(self):
        items = dynamodb_service.get_all_rules()
        if items:
            for item in items:
                try:
                    rule = ExtractedRule(**item)
                    self._rules[rule.rule_id] = rule
                except Exception as e:
                    logger.warning(f"Error loading rule from DynamoDB: {e}")

    def save_rule(self, rule: ExtractedRule):
        self._rules[rule.rule_id] = rule
        # Asynchronously or best-effort persist to DynamoDB
        try:
            dynamodb_service.put_rule(rule.model_dump())
        except Exception as e:
            logger.warning(f"Failed to persist rule to DynamoDB: {e}")

    def get_rule(self, rule_id: str) -> Optional[ExtractedRule]:
        if rule_id in self._rules:
            return self._rules[rule_id]
        item = dynamodb_service.get_rule(rule_id)
        if item:
            try:
                rule = ExtractedRule(**item)
                self._rules[rule.rule_id] = rule
                return rule
            except Exception:
                pass
        return None

    def list_rules(self) -> List[ExtractedRule]:
        return list(self._rules.values())


rule_repository = RuleRepository()
