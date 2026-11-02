"""
Bridge FINDtech FastAPI backend to the standalone ml-engine package.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

# Add ml-engine to Python path (sibling of backend/)
_ML_ENGINE_ROOT = Path(__file__).resolve().parents[3] / "ml-engine"
if str(_ML_ENGINE_ROOT) not in sys.path:
    sys.path.insert(0, str(_ML_ENGINE_ROOT))

from recommend import RecommendEngine, recommend_laptops  # type: ignore  # noqa: E402

_engine: RecommendEngine | None = None


def get_ml_engine() -> RecommendEngine:
    """Lazy singleton for FastAPI lifespan."""
    global _engine
    if _engine is None:
        _engine = RecommendEngine()
        _engine.initialize()
    return _engine


def recommend_from_ml_engine(user_input: dict[str, Any], top_k: int = 5) -> list[dict[str, Any]]:
    """
    Run modular sklearn engine and return standard JSON recommendations.

    Args:
        user_input: budget, usage, battery_preference, portability, gaming, editing
        top_k: Number of results

    Returns:
        List of {brand, model, price, compatibility_score, reason}
    """
    return recommend_laptops(user_input, top_k=top_k)
