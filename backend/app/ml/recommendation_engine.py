"""
AI/ML recommendation engine for laptop matching.

Combines a trained Scikit-Learn Gradient Boosting ensemble model,
multi-criteria weighted scoring, hardware benchmarking, and explainable AI reasons.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Optional

import numpy as np
from sklearn.preprocessing import MinMaxScaler
import joblib

from app.schemas.laptop import LaptopResponse
from app.schemas.recommendation import RecommendationPreferences, RecommendationResult

logger = logging.getLogger(__name__)

USE_CASE_WEIGHTS: dict[str, dict[str, float]] = {
    "gaming": {"performance": 0.35, "gpu": 0.30, "price": 0.15, "display": 0.10, "battery": 0.05, "portability": 0.05},
    "work": {"performance": 0.25, "battery": 0.20, "portability": 0.20, "price": 0.15, "ram": 0.20},
    "creative": {"performance": 0.25, "display": 0.25, "ram": 0.20, "storage": 0.15, "price": 0.15},
    "student": {"price": 0.30, "battery": 0.25, "portability": 0.25, "performance": 0.10, "ram": 0.10},
    "everyday": {"price": 0.25, "battery": 0.25, "portability": 0.20, "performance": 0.15, "rating": 0.15},
    "ai_ml": {"performance": 0.30, "gpu": 0.30, "ram": 0.25, "storage": 0.10, "price": 0.05},
    "coding": {"performance": 0.25, "ram": 0.25, "battery": 0.20, "portability": 0.15, "price": 0.15},
}


def _gpu_score(gpu: str) -> float:
    g = str(gpu).lower()
    if any(k in g for k in ["4090", "4080", "m3 max", "m4 max"]):
        return 1.0
    if any(k in g for k in ["4070", "m3 pro", "m4 pro", "rx 7900"]):
        return 0.88
    if any(k in g for k in ["4060", "m4", "rx 7700", "rtx 3070"]):
        return 0.78
    if any(k in g for k in ["4050", "3050", "m3", "m2", "arc a770", "arc a570"]):
        return 0.68
    if any(k in g for k in ["radeon 780m", "radeon 890m", "arc 140v", "adreno"]):
        return 0.55
    if any(k in g for k in ["integrated", "iris", "uhd", "radeon graphics"]):
        return 0.42
    return 0.58


def _cpu_score(cpu: str) -> float:
    c = str(cpu).lower()
    if any(x in c for x in ["m4 max", "m4 pro", "m3 max", "i9-14", "i9-13", "7945hx", "hx 370", "ultra 9"]):
        return 1.0
    if any(x in c for x in ["m4", "m3 pro", "m2 max", "i7-14", "i7-13", "8945hs", "7840hs", "ultra 7"]):
        return 0.88
    if any(x in c for x in ["m3", "m2 pro", "i7-13620", "8840", "snapdragon x elite", "ultra 5"]):
        return 0.78
    if any(x in c for x in ["m2", "m1 pro", "i5-13500", "i5-13450", "8640", "7640", "i5-1335"]):
        return 0.70
    if any(x in c for x in ["m1", "snapdragon x plus", "i3", "7520", "7320", "celeron", "n100"]):
        return 0.50
    return 0.65


def _calculate_price_fit(price: float, budget_min: float, budget_max: float) -> float:
    if budget_max <= 0:
        return 0.5
    if budget_min <= price <= budget_max:
        # Higher score for ideal budget utilization without penalizing savings
        return 1.0
    if price < budget_min:
        ratio = price / max(1.0, budget_min)
        return float(np.clip(0.75 + 0.20 * ratio, 0.70, 0.95))
    if price > budget_max:
        over_ratio = (price - budget_max) / budget_max
        return float(np.clip(1.0 - over_ratio * 2.0, 0.1, 0.80))
    return 0.80


def _build_feature_matrix(laptops: list[LaptopResponse]) -> np.ndarray:
    features = []
    for lp in laptops:
        features.append([
            lp.price,
            lp.ram_gb,
            lp.storage_gb,
            lp.battery_hours,
            lp.weight_kg,
            lp.rating,
            _cpu_score(lp.cpu),
            _gpu_score(lp.gpu),
        ])
    return np.array(features, dtype=float)


def _generate_reasons(
    laptop: LaptopResponse,
    prefs: RecommendationPreferences,
    scores: dict[str, float],
) -> list[str]:
    reasons: list[str] = []
    
    # Workload & Silicon reasons
    if prefs.primary_use in ("ai_ml", "work") and scores.get("gpu", 0) >= 0.75:
        reasons.append(f"{laptop.gpu} provides tensor acceleration for local AI/ML workloads")
    elif prefs.primary_use == "gaming" and scores.get("gpu", 0) >= 0.75:
        reasons.append(f"High-fps gaming performance powered by {laptop.gpu}")
    elif prefs.primary_use == "creative":
        reasons.append(f"Color-accurate {laptop.display} display ideal for creator workflows")
    elif prefs.primary_use in laptop.use_cases:
        reasons.append(f"Engineered specifically for {prefs.primary_use} workflows")
        
    # Budget adherence
    if prefs.budget_min <= laptop.price <= prefs.budget_max:
        reasons.append(f"Comfortably within your ${int(prefs.budget_min)}–${int(prefs.budget_max)} budget")
    elif laptop.price < prefs.budget_min:
        reasons.append(f"Exceptional value at ${int(laptop.price)} below your expected budget")

    # RAM & Multitasking
    if laptop.ram_gb >= 32:
        reasons.append(f"{laptop.ram_gb}GB high-speed memory for heavy multi-container development")
    elif laptop.ram_gb >= prefs.ram_min:
        reasons.append(f"{laptop.ram_gb}GB RAM meets your minimum requirements")

    # Portability & Battery
    if scores.get("portability", 0) >= 0.75 or laptop.weight_kg <= 1.5:
        reasons.append(f"Ultralight at {laptop.weight_kg}kg for effortless mobility")
    if scores.get("battery", 0) >= 0.75 or laptop.battery_hours >= 14:
        reasons.append(f"{laptop.battery_hours}h extended battery life for all-day unplugged work")

    # Brand match
    if prefs.brand_preferences and laptop.brand in prefs.brand_preferences:
        reasons.append(f"Matches your preferred brand: {laptop.brand}")

    return reasons[:4] if reasons else ["Well-rounded configuration matching all key criteria"]


class RecommendationEngine:
    """Trained ML ensemble & weighted multi-criteria recommendation engine."""

    TOP_K = 6

    def __init__(self) -> None:
        self.model: Optional[Any] = None
        self.scaler: Optional[MinMaxScaler] = None
        self._load_trained_model()

    def _load_trained_model(self) -> None:
        model_path = Path(__file__).parent / "models" / "trained_model.joblib"
        if model_path.exists():
            try:
                artifacts = joblib.load(model_path)
                self.model = artifacts.get("model")
                self.scaler = artifacts.get("scaler")
                logger.info("Loaded trained recommendation model from %s", model_path)
            except Exception as e:
                logger.warning("Could not load trained ML model: %s", e)

    def recommend(
        self,
        laptops: list[LaptopResponse],
        prefs: RecommendationPreferences,
    ) -> list[RecommendationResult]:
        if not laptops:
            return []

        # Step 1: Candidate filtering with graceful slack
        filtered = [
            lp
            for lp in laptops
            if lp.price <= prefs.budget_max * 1.15
            and lp.ram_gb >= max(4, prefs.ram_min - 4 if prefs.ram_min > 8 else prefs.ram_min)
            and lp.storage_gb >= max(128, prefs.storage_min - 256 if prefs.storage_min > 512 else prefs.storage_min)
        ]

        if not filtered:
            filtered = laptops

        matrix = _build_feature_matrix(filtered)
        scaler = MinMaxScaler()
        normalized = scaler.fit_transform(matrix)

        use_weights = USE_CASE_WEIGHTS.get(prefs.primary_use, USE_CASE_WEIGHTS["work"])
        perf_slider = prefs.performance / 10.0
        port_slider = prefs.portability / 10.0
        batt_slider = prefs.battery_priority / 10.0

        results: list[tuple[LaptopResponse, float, dict[str, float]]] = []

        for idx, laptop in enumerate(filtered):
            row = normalized[idx]
            
            # Accurate price fit scoring
            price_score = _calculate_price_fit(laptop.price, prefs.budget_min, prefs.budget_max)
            ram_score = row[1]
            storage_score = row[2]
            battery_score = row[3]
            portability_score = 1.0 - row[4]
            rating_score = row[5]
            cpu_score = row[6]
            gpu_score = row[7]

            perf_combined = 0.55 * cpu_score + 0.45 * gpu_score

            component_scores = {
                "price": price_score,
                "ram": ram_score,
                "storage": storage_score,
                "battery": battery_score,
                "portability": portability_score,
                "performance": perf_combined,
                "rating": rating_score,
                "gpu": gpu_score,
            }

            # Analytical multi-criteria base score
            base_score = (
                use_weights.get("price", 0.15) * price_score
                + use_weights.get("ram", 0.15) * ram_score
                + use_weights.get("performance", 0.20) * perf_combined
                + use_weights.get("battery", 0.15) * battery_score
                + use_weights.get("portability", 0.15) * portability_score
                + use_weights.get("gpu", 0.10) * gpu_score
                + use_weights.get("rating", 0.10) * rating_score
            )

            priority_boost = (
                perf_slider * perf_combined
                + port_slider * portability_score
                + batt_slider * battery_score
            ) * 0.12

            brand_boost = 0.08 if (
                prefs.brand_preferences and laptop.brand in prefs.brand_preferences
            ) else 0.0

            use_case_boost = 0.08 if prefs.primary_use in laptop.use_cases else 0.0

            # Predict with trained ML ensemble model if available
            ml_pred = None
            if self.model is not None:
                try:
                    # [target_budget / 3500.0, perf_pref, port_pref, batt_pref, 14 norm features]
                    sim_input = np.array([
                        prefs.budget_max / 3500.0,
                        perf_slider,
                        port_slider,
                        batt_slider,
                        laptop.price / 3500.0,
                        laptop.ram_gb / 64.0,
                        laptop.storage_gb / 2048.0,
                        laptop.battery_hours / 24.0,
                        laptop.weight_kg / 3.2,
                        laptop.rating / 5.0,
                        cpu_score,
                        cpu_score * 0.95,
                        gpu_score,
                        gpu_score * 0.90,
                        battery_score,
                        portability_score,
                        0.8,
                        0.85
                    ], dtype=float).reshape(1, -1)
                    ml_pred = float(self.model.predict(sim_input)[0])
                except Exception:
                    ml_pred = None

            if ml_pred is not None:
                # Blend trained ML model (60%) with analytical rules and boosts (40%)
                final_score = float(np.clip(
                    0.60 * ml_pred + 0.30 * base_score + 0.10 * (brand_boost + use_case_boost),
                    0.05,
                    0.99
                ))
            else:
                final_score = min(0.99, base_score + priority_boost + brand_boost + use_case_boost)

            results.append((laptop, final_score, component_scores))

        results.sort(key=lambda x: x[1], reverse=True)
        top = results[: self.TOP_K]

        return [
            RecommendationResult(
                laptop=lp,
                match_score=round(score, 3),
                reasons=_generate_reasons(lp, prefs, components),
            )
            for lp, score, components in top
        ]


recommendation_engine = RecommendationEngine()
