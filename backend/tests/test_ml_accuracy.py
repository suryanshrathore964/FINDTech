import pytest
from app.ml.recommendation_engine import recommendation_engine
from app.schemas.laptop import LaptopResponse
from app.schemas.recommendation import RecommendationPreferences
from app.services.seed_data import LAPTOP_SEED_DATA

@pytest.fixture
def laptops():
    docs = []
    for i, item in enumerate(LAPTOP_SEED_DATA):
        doc = dict(item)
        doc["_id"] = f"6600000000000000000000{i:02d}"
        docs.append(LaptopResponse.from_document(doc))
    return docs

def test_catalog_size(laptops):
    assert len(laptops) >= 50, f"Expected 50+ laptops in catalog, got {len(laptops)}"

def test_ml_ai_recommendation(laptops):
    prefs = RecommendationPreferences(
        budget_min=1200,
        budget_max=2200,
        primary_use="ai_ml",
        portability=6,
        performance=9,
        battery_priority=7,
        brand_preferences=["Apple", "ASUS", "Lenovo"],
        ram_min=16,
        storage_min=512,
    )
    results = recommendation_engine.recommend(laptops, prefs)
    assert len(results) > 0
    top = results[0]
    # Check that top recommendation has discrete GPU or powerful Apple Silicon
    assert any(term in top.laptop.gpu.lower() for term in ["rtx", "m3", "m4", "radeon", "4060", "4070", "4080", "4090"])
    assert top.match_score >= 0.70
    assert len(top.reasons) > 0

def test_ml_student_budget_recommendation(laptops):
    prefs = RecommendationPreferences(
        budget_min=400,
        budget_max=900,
        primary_use="student",
        portability=8,
        battery_priority=8,
        performance=5,
        brand_preferences=[],
        ram_min=8,
        storage_min=256,
    )
    results = recommendation_engine.recommend(laptops, prefs)
    assert len(results) > 0
    top = results[0]
    # Must be within budget slack
    assert top.laptop.price <= 900 * 1.15
    assert top.laptop.battery_hours >= 7

def test_ml_hardcore_gaming_recommendation(laptops):
    prefs = RecommendationPreferences(
        budget_min=1500,
        budget_max=3000,
        primary_use="gaming",
        portability=4,
        battery_priority=4,
        performance=10,
        brand_preferences=["ASUS", "Lenovo", "Razer", "MSI", "Dell"],
        ram_min=16,
        storage_min=1024,
    )
    results = recommendation_engine.recommend(laptops, prefs)
    assert len(results) > 0
    top = results[0]
    assert any(term in top.laptop.gpu.lower() for term in ["4070", "4080", "4090", "4060"])
    assert top.match_score >= 0.80

def test_ml_ultralight_portable_recommendation(laptops):
    prefs = RecommendationPreferences(
        budget_min=800,
        budget_max=1600,
        primary_use="work",
        portability=10,
        battery_priority=9,
        performance=7,
        brand_preferences=[],
        ram_min=16,
        storage_min=512,
    )
    results = recommendation_engine.recommend(laptops, prefs)
    assert len(results) > 0
    top = results[0]
    assert top.laptop.weight_kg <= 1.85
    assert top.laptop.battery_hours >= 10
