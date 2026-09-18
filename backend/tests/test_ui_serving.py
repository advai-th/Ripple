from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_dashboard_served_at_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "Ripple" in response.text
    assert "root" in response.text or "app.js" in response.text


def test_static_app_js_served():
    response = client.get("/static/app.js")
    assert response.status_code == 200
    assert "Ripple Policy Impact Engine" in response.text
