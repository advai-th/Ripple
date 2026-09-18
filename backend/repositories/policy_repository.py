from typing import Dict, List, Optional
from datetime import datetime
from backend.models.policy import PolicyMetadata, ParsedDocument


class PolicyRepository:
    def __init__(self):
        self._policies: Dict[str, PolicyMetadata] = {}
        self._documents: Dict[str, ParsedDocument] = {}

    def save_policy(self, policy: PolicyMetadata, document: ParsedDocument):
        self._policies[policy.policy_id] = policy
        self._documents[policy.policy_id] = document

    def get_policy(self, policy_id: str) -> Optional[PolicyMetadata]:
        return self._policies.get(policy_id)

    def get_document(self, policy_id: str) -> Optional[ParsedDocument]:
        return self._documents.get(policy_id)

    def list_policies(self) -> List[PolicyMetadata]:
        return list(self._policies.values())


policy_repository = PolicyRepository()
