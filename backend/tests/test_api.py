import pytest
from fastapi.testclient import TestClient
from app.main import create_app

@pytest.fixture
def client():
    app = create_app()
    with TestClient(app) as c:
        yield c

def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_laptops_catalog(client):
    res = client.get("/api/v1/laptops")
    assert res.status_code == 200
    data = res.json()
    assert len(data) > 0
    assert "name" in data[0]

def test_auth_and_protected_routes(client):
    # Register
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "tester@example.com",
        "password": "Password123!",
        "full_name": "Test User"
    })
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Me
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "tester@example.com"

    # Recommendations
    rec_res = client.post("/api/v1/recommendations", headers=headers, json={
        "budget_min": 800,
        "budget_max": 2000,
        "primary_use": "work",
        "portability": 7,
        "performance": 8,
        "battery_priority": 8,
        "brand_preferences": ["Apple", "Lenovo"],
        "ram_min": 16,
        "storage_min": 512
    })
    assert rec_res.status_code == 200
    recs = rec_res.json()["recommendations"]
    assert len(recs) > 0

    # ML recommendations
    ml_res = client.post("/api/v1/ml/recommend", headers=headers, json={
        "budget": 90000,
        "usage": ["AI/ML", "Coding"],
        "battery_preference": "High",
        "portability": "Medium",
        "gaming": False,
        "editing": False
    })
    assert ml_res.status_code == 200
    assert len(ml_res.json()["recommendations"]) > 0

    # History list
    hist_res = client.get("/api/v1/recommendations/history", headers=headers)
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1
    session_id = hist_res.json()[0]["id"]

    # History detail
    detail_res = client.get(f"/api/v1/recommendations/history/{session_id}", headers=headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == session_id

    # Comparison
    laptops_list = client.get("/api/v1/laptops").json()
    assert len(laptops_list) >= 2
    comp_ids = [laptops_list[0]["id"], laptops_list[1]["id"]]
    comp_res = client.post("/api/v1/comparison", headers=headers, json={"laptop_ids": comp_ids})
    assert comp_res.status_code == 200
    assert len(comp_res.json()["winners"]) > 0

    # Analytics
    ov_res = client.get("/api/v1/analytics/overview")
    assert ov_res.status_code == 200
    cat_res = client.get("/api/v1/analytics/catalog")
    assert cat_res.status_code == 200
    trend_res = client.get("/api/v1/analytics/trending")
    assert trend_res.status_code == 200
    user_res = client.get("/api/v1/analytics/user", headers=headers)
    assert user_res.status_code == 200

    # Filters
    opt_res = client.get("/api/v1/filters/options")
    assert opt_res.status_code == 200
    assert len(opt_res.json()["brands"]) > 0
    search_res = client.post("/api/v1/filters/search", json={"brands": ["Apple"]})
    assert search_res.status_code == 200
    assert search_res.json()["total"] > 0

