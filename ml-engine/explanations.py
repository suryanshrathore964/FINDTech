"""
Natural-language explanation generator for FINDtech recommendations.
"""

from __future__ import annotations

from typing import Any, Optional

import pandas as pd

from scoring import USAGE_COLUMN_MAP


def _gpu_highlight(gpu: str) -> Optional[str]:
    g = str(gpu).upper()
    if "RTX" in g or "GTX" in g:
        return f"{gpu} GPU"
    if "M3" in g or "M2" in g:
        return f"{gpu} Apple Silicon"
    return None


def _cpu_highlight(cpu: str) -> str:
    return f"{cpu} CPU"


def generate_explanation(
    row: pd.Series,
    user_input: dict[str, Any],
    compatibility_score: float,
) -> str:
    """
    Build a human-readable recommendation reason.

    Args:
        row: Laptop dataframe row.
        user_input: Original user preferences JSON.
        compatibility_score: Final score as percentage (0-100).

    Returns:
        Explanation string for API response.
    """
    usage = user_input.get("usage", []) or []
    if isinstance(usage, str):
        usage = [usage]

    usage_labels = [str(u) for u in usage]
    primary_use = usage_labels[0] if usage_labels else "your workflow"

    parts: list[str] = []

    # Opening tailored to primary usage
    if any("AI" in u or "ML" in u for u in usage_labels):
        parts.append("Recommended for AI/ML workflows")
        gpu_note = _gpu_highlight(row.get("gpu", ""))
        if gpu_note:
            parts.append(f"due to {gpu_note}")
        parts.append(f"and {_cpu_highlight(row.get('cpu', ''))}")
    elif any("Coding" in u or "coding" in u.lower() for u in usage_labels):
        parts.append("Recommended for software development")
        parts.append(f"with {_cpu_highlight(row.get('cpu', ''))} and {int(row.get('ram', 16))}GB RAM")
    elif any("Gaming" in u for u in usage_labels) or user_input.get("gaming"):
        parts.append("Recommended for gaming")
        gpu_note = _gpu_highlight(row.get("gpu", ""))
        if gpu_note:
            parts.append(f"thanks to {gpu_note}")
    elif any("Editing" in u or "Video" in u for u in usage_labels) or user_input.get("editing"):
        parts.append("Recommended for creative and editing workloads")
        parts.append(f"with strong {row.get('gpu', 'graphics')} graphics")
    else:
        parts.append(f"Recommended for {primary_use}")

    # Multitasking / RAM
    ram = int(row.get("ram", 16))
    if ram >= 32:
        parts.append("excellent multitasking with 32GB RAM")
    elif ram >= 16:
        parts.append("solid multitasking capability")

    # Battery / portability preferences
    batt_pref = str(user_input.get("battery_preference", "")).lower()
    if batt_pref == "high" and float(row.get("battery_score", 5)) >= 8:
        parts.append("long battery endurance")
    port_pref = str(user_input.get("portability", "")).lower()
    if port_pref == "high" and float(row.get("portability_score", 5)) >= 8:
        parts.append("excellent portability")
    elif port_pref == "medium" and float(row.get("weight", 2)) < 2.0:
        parts.append("balanced portability")

    # Budget fit
    budget = float(user_input.get("budget", 0))
    price = float(row.get("price", 0))
    if budget > 0 and price <= budget:
        parts.append("within your budget")

    # Future-proof
    if float(row.get("future_score", 5)) >= 9:
        parts.append("high future-proof rating")

    sentence = ", ".join(parts) + "."
    # Capitalize first letter
    return sentence[0].upper() + sentence[1:] if sentence else (
        f"Strong {compatibility_score:.0f}% compatibility match for your requirements."
    )


def format_recommendation_output(
    row: pd.Series,
    user_input: dict[str, Any],
    compatibility_score: float,
) -> dict[str, Any]:
    """
    Map a ranked row to the standard API output format.

    Returns:
        {"brand", "model", "price", "compatibility_score", "reason"}
    """
    return {
        "brand": str(row["brand"]),
        "model": str(row["model"]),
        "price": int(row["price"]),
        "compatibility_score": round(compatibility_score, 1),
        "reason": generate_explanation(row, user_input, compatibility_score),
    }
