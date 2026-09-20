import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.aws_config import aws_config
from backend.services.dynamodb_service import _json_to_dynamo, _dynamo_to_json, dynamodb_service
from backend.services.s3_service import s3_service
from backend.agents.ripple_agent import ripple_agent
from backend.models.policy import ParsedDocument
from decimal import Decimal

client = TestClient(app)


def test_aws_status_endpoint():
    response = client.get("/api/aws/status")
    assert response.status_code == 200
    data = response.json()
    assert "cloud_mode" in data
    assert "region" in data
    assert "credentials" in data
    assert "bedrock" in data
    assert "dynamodb" in data
    assert "s3" in data
    assert "architecture" in data


def test_api_health_endpoint_with_aws():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "mode" in data
    assert "aws_region" in data


def test_dynamo_json_serialization():
    data = {
        "student_id": "S001",
        "attendance_pct": 74.5,
        "history": [10.0, 20.5],
        "nested": {"threshold": 80.0, "active": True}
    }
    dynamo_formatted = _json_to_dynamo(data)
    assert isinstance(dynamo_formatted["attendance_pct"], Decimal)
    assert isinstance(dynamo_formatted["history"][0], Decimal)
    assert isinstance(dynamo_formatted["nested"]["threshold"], Decimal)

    restored = _dynamo_to_json(dynamo_formatted)
    assert restored["attendance_pct"] == 74.5
    assert restored["history"] == [10.0, 20.5]
    assert restored["nested"]["threshold"] == 80.0
    assert restored["nested"]["active"] is True


def test_s3_service_fallback_upload():
    test_bytes = b"Institutional Policy Document - Academic Regulations 2026."
    res = s3_service.upload_file(
        content=test_bytes,
        filename="test_upload.txt",
        content_type="text/plain"
    )
    assert "storage_mode" in res
    assert res["filename"] == "test_upload.txt"
    assert res["size_bytes"] == len(test_bytes)


def test_ripple_agent_rule_extraction_resilience():
    doc = ParsedDocument(
        document_id="doc_test_123",
        filename="test_policy.txt",
        content="Section 3.2: Minimum attendance requirement is revised from 75% to 80% for S5 students.",
        page_count=1
    )
    rule, err = ripple_agent.extract_rule(doc)
    assert err is None
    assert rule is not None
    assert rule.value == 80.0
    assert rule.previous_value == 75.0
    assert rule.field == "attendance_pct"
    assert rule.operator == ">="
    assert rule.ai_engine is not None
