"""
Bridge FINDtech FastAPI backend to the standalone ml-engine package.
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

# Add ml-engine to Python path (sibling of backend/)
_ML_ENGINE_ROOT = Path(__file__).resolve().parents[3] / "ml-engine"
if str(_ML_ENGINE_ROOT) not in sys.path:
    sys.path.insert(0, str(_ML_ENGINE_ROOT))

try:
    from recommend import RecommendEngine, recommend_laptops  # type: ignore  # noqa: E402
except Exception as e:
    logger.warning("Could not load external ml-engine package (%s); will fallback gracefully.", e)
    RecommendEngine = None  # type: ignore
    recommend_laptops = None  # type: ignore

_engine: Any | None = None


def get_ml_engine():
    """Lazy singleton for FastAPI lifespan."""
    global _engine
    if _engine is None and RecommendEngine is not None:
        try:
            _engine = RecommendEngine()
            _engine.initialize()
        except Exception as e:
            logger.warning("Failed to initialize RecommendEngine: %s", e)
            _engine = None
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
    if recommend_laptops is not None:
        try:
            return recommend_laptops(user_input, top_k=top_k)
        except Exception as e:
            logger.error("ml-engine recommendation error: %s", e)
    return []
