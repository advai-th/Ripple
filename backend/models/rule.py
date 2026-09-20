from typing import Optional, Any, Dict
from pydantic import BaseModel, Field, field_validator


class RuleScope(BaseModel):
    semester: Optional[str] = None
    department: Optional[str] = None
    course_id: Optional[str] = None


class RuleSource(BaseModel):
    document: str
    section: Optional[str] = None
    page: Optional[int] = None
    clause_text: Optional[str] = None


class RulePredicate(BaseModel):
    field: str
    operator: str
    value: float
    previous_value: Optional[float] = None

    @field_validator("operator")
    @classmethod
    def validate_operator(cls, v: str) -> str:
        valid_operators = {">=", ">", "<=", "<", "==", "!="}
        if v not in valid_operators:
            raise ValueError(f"Operator '{v}' is not supported. Supported: {valid_operators}")
        return v


class ExtractedRule(BaseModel):
    rule_id: str
    name: str
    entity: str = "student_course"
    field: str
    operator: str
    value: float
    previous_value: Optional[float] = None
    scope: RuleScope = Field(default_factory=RuleScope)
    source: RuleSource
    confidence: float = 1.0
    status: str = "PENDING_REVIEW"  # PENDING_REVIEW, CONFIRMED, REJECTED
    human_confirmed: bool = False
    human_edits: Optional[Dict[str, Any]] = None
    ai_engine: Optional[str] = "Amazon Bedrock"
    aws_region: Optional[str] = None
    model_id: Optional[str] = None

    @field_validator("operator")
    @classmethod
    def validate_operator(cls, v: str) -> str:
        valid_operators = {">=", ">", "<=", "<", "==", "!="}
        if v not in valid_operators:
            raise ValueError(f"Operator '{v}' is not supported. Supported: {valid_operators}")
        return v
