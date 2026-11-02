"""
Weighted scoring and ranking for FINDtech ML engine.

Implements the production weighted formula and budget filtering.
"""

from __future__ import annotations

from typing import Any, Optional

import numpy as np
import pandas as pd

# Weighted formula coefficients (must sum to 1.0)
WEIGHT_PERFORMANCE = 0.30
WEIGHT_AI_ML = 0.25
WEIGHT_CODING = 0.15
WEIGHT_BATTERY = 0.10
WEIGHT_FUTURE = 0.10
WEIGHT_BUDGET = 0.10

# Usage tags from user input -> score column boosts
USAGE_COLUMN_MAP = {
    "AI/ML": "ai_ml_score",
    "AIML": "ai_ml_score",
    "AI": "ai_ml_score",
    "ML": "ai_ml_score",
    "Coding": "coding_score",
    "CODING": "coding_score",
    "Gaming": "gaming_score",
    "GAMING": "gaming_score",
    "Editing": "editing_score",
    "EDITING": "editing_score",
    "Video": "editing_score",
    "Creative": "editing_score",
}

PREFERENCE_LEVEL = {"low": 0.25, "medium": 0.5, "high": 0.9}


def _parse_level(value: Any) -> float:
    """Map High/Medium/Low strings to numeric preference weight."""
    if isinstance(value, (int, float)):
        return float(np.clip(value / 10.0, 0, 1))
    key = str(value).strip().lower()
    return PREFERENCE_LEVEL.get(key, 0.5)


def build_user_profile(user_input: dict[str, Any]) -> dict[str, float]:
    """
    Convert API/user JSON into a normalized preference profile for similarity.

    Example input:
        {
            "budget": 90000,
            "usage": ["AI/ML", "Coding"],
            "battery_preference": "High",
            "portability": "Medium",
            "gaming": false,
            "editing": false
        }
    """
    usage = user_input.get("usage", []) or []
    if isinstance(usage, str):
        usage = [usage]

    profile = {
        "ai_ml_score_norm": 0.3,
        "coding_score_norm": 0.3,
        "gaming_score_norm": 0.3,
        "editing_score_norm": 0.3,
        "battery_score_norm": _parse_level(user_input.get("battery_preference", "medium")),
        "portability_score_norm": _parse_level(user_input.get("portability", "medium")),
        "thermal_score_norm": 0.5,
        "future_score_norm": 0.6,
        "ram_norm": 0.5,
        "storage_norm": 0.5,
        "price_norm": 0.5,
        "brand_enc": 0.5,
        "gpu_enc": 0.5,
    }

    # Boost dimensions from usage tags
    for tag in usage:
        key = str(tag).strip()
        col = USAGE_COLUMN_MAP.get(key) or USAGE_COLUMN_MAP.get(key.upper())
        if col:
            norm_key = f"{col}_norm"
            profile[norm_key] = max(profile.get(norm_key, 0.3), 0.85)

    if user_input.get("gaming"):
        profile["gaming_score_norm"] = 0.9
    if user_input.get("editing"):
        profile["editing_score_norm"] = 0.9

    return profile


def compute_performance_score(row: pd.Series) -> float:
    """
    Aggregate thermal + gaming + coding into a 0-1 performance score.
    Uses pre-normalized columns when available, else raw 1-10 scores.
    """
    def _get(col: str, raw: str) -> float:
        if f"{col}_norm" in row.index:
            return float(row[f"{col}_norm"])
        return float(row.get(raw, 5)) / 10.0

    thermal = _get("thermal", "thermal_score")
    gaming = _get("gaming", "gaming_score")
    coding = _get("coding", "coding_score")
    return float(np.clip(0.35 * thermal + 0.35 * gaming + 0.30 * coding, 0, 1))


def compute_budget_match(price: float, budget: float, slack: float = 0.05) -> float:
    """
    Score how well laptop price fits user budget (1.0 = ideal, lower if over budget).

    Args:
        price: Laptop price in same currency as budget.
        budget: User maximum budget.
        slack: Allow slight over-budget tolerance (5%).
    """
    if budget <= 0:
        return 0.5
    max_allowed = budget * (1 + slack)
    if price > max_allowed:
        over_ratio = (price - max_allowed) / budget
        return float(np.clip(1.0 - over_ratio, 0.0, 0.4))
    # Reward using budget efficiently (not too cheap unless tight budget)
    utilization = price / budget
    if utilization >= 0.65:
        return 1.0
    return float(0.7 + 0.3 * utilization)


def score_to_normalized(row: pd.Series, col: str) -> float:
    """Read normalized or raw 1-10 score column as 0-1 float."""
    if f"{col}_norm" in row.index:
        return float(row[f"{col}_norm"])
    return float(row.get(col, 5)) / 10.0


def weighted_final_score(
    row: pd.Series,
    budget: float,
    usage: Optional[list[str]] = None,
) -> float:
    """
    Apply FINDtech weighted formula:

    final = performance*0.30 + ai_ml*0.25 + coding*0.15 + battery*0.10
            + future*0.10 + budget_match*0.10

    Usage tags slightly re-weight ai_ml / coding columns.
    """
    usage = usage or []
    ai_w, coding_w = WEIGHT_AI_ML, WEIGHT_CODING
    for tag in usage:
        t = str(tag).upper().replace("/", "")
        if "AIML" in t or t == "AI" or t == "ML":
            ai_w += 0.05
        if "CODING" in t or "CODE" in t:
            coding_w += 0.05
    total_w = (
        WEIGHT_PERFORMANCE
        + ai_w
        + coding_w
        + WEIGHT_BATTERY
        + WEIGHT_FUTURE
        + WEIGHT_BUDGET
    )
    # Renormalize if usage boosted weights
    scale = 1.0 / total_w

    performance = compute_performance_score(row)
    ai_ml = score_to_normalized(row, "ai_ml_score")
    coding = score_to_normalized(row, "coding_score")
    battery = score_to_normalized(row, "battery_score")
    future = score_to_normalized(row, "future_score")
    budget_match = compute_budget_match(float(row["price"]), budget)

    final = scale * (
        performance * WEIGHT_PERFORMANCE
        + ai_ml * ai_w
        + coding * coding_w
        + battery * WEIGHT_BATTERY
        + future * WEIGHT_FUTURE
        + budget_match * WEIGHT_BUDGET
    )
    return float(np.clip(final, 0.0, 1.0))


def filter_by_budget(df: pd.DataFrame, budget: float, slack: float = 0.10) -> pd.DataFrame:
    """Keep laptops at or below budget * (1 + slack)."""
    max_price = budget * (1 + slack)
    return df[df["price"].astype(float) <= max_price].copy()


def rank_laptops(
    df: pd.DataFrame,
    hybrid_scores: np.ndarray,
    top_k: int = 5,
) -> pd.DataFrame:
    """
    Attach hybrid scores and return top_k rows sorted descending.

    Args:
        df: Processed dataframe (filtered).
        hybrid_scores: Combined ranking scores.
        top_k: Number of recommendations.

    Returns:
        DataFrame with added columns: hybrid_score, rank.
    """
    result = df.copy()
    result["hybrid_score"] = hybrid_scores
    result = result.sort_values("hybrid_score", ascending=False).head(top_k)
    result["rank"] = range(1, len(result) + 1)
    return result.reset_index(drop=True)
