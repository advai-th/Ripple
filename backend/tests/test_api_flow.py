import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_full_pipeline_flow():
    # 1. Upload sample policy
    upload_res = client.post("/api/policies/upload", data={"sample_key": "academic_attendance_regulation_2026.txt"})
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    policy_id = upload_data["policy_id"]
    assert policy_id.startswith("pol_")

    # 2. Extract rule via Strands Agent
    extract_res = client.post("/api/rules/extract", json={"policy_id": policy_id})
    assert extract_res.status_code == 200
    extract_data = extract_res.json()
    assert extract_data["success"] is True
    rule = extract_data["rule"]
    assert rule["field"] == "attendance_pct"
    assert rule["operator"] == ">="
    assert rule["value"] == 80.0
    assert rule["previous_value"] == 75.0
    assert rule["status"] == "PENDING_REVIEW"

    # 3. Confirm rule (Human in the loop)
    confirm_payload = {
        "rule_id": rule["rule_id"],
        "name": rule["name"],
        "field": rule["field"],
        "operator": rule["operator"],
        "value": 80.0,
        "previous_value": 75.0,
        "scope_semester": "S5",
        "document": rule["source"]["document"],
        "section": rule["source"]["section"],
        "page": rule["source"]["page"],
        "clause_text": rule["source"]["clause_text"]
    }
    confirm_res = client.post("/api/rules/confirm", json=confirm_payload)
    assert confirm_res.status_code == 200
    assert confirm_res.json()["rule"]["human_confirmed"] is True
    assert confirm_res.json()["rule"]["status"] == "CONFIRMED"

    # 4. Run deterministic validation against student database
    analysis_res = client.post("/api/analyses/run", json={"rule_id": rule["rule_id"], "at_risk_threshold": 5.0})
    assert analysis_res.status_code == 200
    analysis_data = analysis_res.json()
    summary = analysis_data["summary"]
    assert summary["total_evaluated"] > 0
    assert summary["affected_count"] >= 0
    assert summary["at_risk_count"] >= 0
    assert summary["unaffected_count"] >= 0

    # Verify hero demo student S002 (at 77% attendance)
    affected_ids = [s["student_id"] for s in analysis_data["affected_students"]]
    assert "S002" in affected_ids

    # Find S002 and verify deterministic calculations
    s002_impact = next(s for s in analysis_data["affected_students"] if s["student_id"] == "S002")
    assert s002_impact["actual_value"] == 77.0
    assert s002_impact["required_value"] == 80.0
    assert s002_impact["affected"] is True
    assert "77.0 >= 80.0 -> FALSE" in s002_impact["calculation_display"]
    assert s002_impact["future_sessions_needed"] is not None

    # 5. Simulate Notification
    notify_res = client.post("/api/notifications/simulate", json={"rule_id": rule["rule_id"], "target_student_id": "S002"})
    assert notify_res.status_code == 200
    notify_data = notify_res.json()
    assert notify_data["simulated_count"] == 1
    assert "S002" in notify_data["notifications"][0]["message"]

    # 6. Verify Audit Log
    audit_res = client.get("/api/audit")
    assert audit_res.status_code == 200
    events = [e["event_type"] for e in audit_res.json()]
    assert "uploaded" in events
    assert "rule_extracted" in events
    assert "rule_confirmed" in events
    assert "evaluation_run" in events
    assert "notification_simulated" in events
