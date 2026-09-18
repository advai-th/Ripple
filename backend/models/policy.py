from typing import Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class PolicyMetadata(BaseModel):
    policy_id: str
    name: str
    version: str = "1.0"
    effective_date: Optional[str] = None
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    document_key: str


class ParsedDocument(BaseModel):
    document_id: str
    filename: str
    content: str
    page_count: int = 1
