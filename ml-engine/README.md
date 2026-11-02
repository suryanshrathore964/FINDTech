# FINDtech ML Engine

Modular Scikit-learn recommendation engine for laptop matching.

## Stack

- Python 3.9+
- scikit-learn (cosine similarity, MinMaxScaler, LabelEncoder)
- pandas
- numpy

## Structure

```
ml-engine/
├── datasets/laptops_2026.json   # Catalog
├── models/                      # Saved pipelines (optional)
├── preprocess.py                # Load JSON, encode, normalize
├── similarity.py                # Cosine similarity
├── scoring.py                   # Weighted formula + budget filter
├── explanations.py              # Human-readable reasons
├── recommend.py                 # RecommendEngine + sample run
└── requirements.txt
```

## Weighted Formula

```
final_score =
  performance_score × 0.30 +
  ai_ml_score       × 0.25 +
  coding_score      × 0.15 +
  battery_score     × 0.10 +
  future_score      × 0.10 +
  budget_match      × 0.10
```

Hybrid rank = `40% cosine similarity + 60% weighted score` (configurable).

## User Input

```json
{
  "budget": 90000,
  "usage": ["AI/ML", "Coding"],
  "battery_preference": "High",
  "portability": "Medium",
  "gaming": false,
  "editing": false
}
```

## Output

```json
[
  {
    "brand": "Lenovo",
    "model": "LOQ Gen 9",
    "price": 82999,
    "compatibility_score": 87.3,
    "reason": "Recommended for AI/ML workflows due to RTX 4050 GPU..."
  }
]
```

## Quick Start

```bash
cd ml-engine
pip install -r requirements.txt
python recommend.py
```

## FastAPI Integration

```python
import sys
from pathlib import Path

ML_ENGINE = Path(__file__).resolve().parents[2] / "ml-engine"
sys.path.insert(0, str(ML_ENGINE))

from recommend import recommend_laptops

@router.post("/recommend/ml")
def recommend_ml(payload: dict):
    return recommend_laptops(payload, top_k=5)
```

Or use singleton at startup:

```python
from recommend import get_engine

@app.on_event("startup")
def load_ml():
    get_engine()  # fits preprocessors once

@app.post("/recommend")
def recommend(body: UserInput):
    return get_engine().recommend(body.model_dump())
```

## API

| Function | Description |
|----------|-------------|
| `RecommendEngine.initialize()` | Load & fit on dataset |
| `RecommendEngine.recommend(user_input)` | Top-k recommendations |
| `recommend_laptops(user_input)` | One-shot helper |
| `load_json_dataset(path)` | Load catalog JSON |
