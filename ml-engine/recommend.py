"""
FINDtech ML Recommendation Engine — main entry point.

Combines trained ensemble machine learning, preprocessing, cosine similarity,
weighted scoring, and natural-language explanations.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional, Union

import numpy as np
import pandas as pd
import joblib

from explanations import format_recommendation_output, generate_explanation
from preprocess import DEFAULT_DATASET, DatasetPreprocessor, load_json_dataset
from scoring import (
    build_user_profile,
    filter_by_budget,
    rank_laptops,
    weighted_final_score,
)
from similarity import cosine_similarity_scores, hybrid_similarity

# Default hybrid blend: 50% trained ML ensemble, 30% cosine similarity, 20% multi-criteria weighted
DEFAULT_COSINE_WEIGHT = 0.35


class RecommendEngine:
    """
    Production recommendation engine.

    Lifecycle (FastAPI):
        engine = RecommendEngine()
        engine.initialize()  # once at startup
        results = engine.recommend(user_input)  # per request
    """

    def __init__(self, dataset_path: Union[str, Path] = DEFAULT_DATASET) -> None:
        self.dataset_path = Path(dataset_path)
        self.preprocessor = DatasetPreprocessor()
        self.trained_artifacts: Optional[dict[str, Any]] = None
        self._ready = False

    def initialize(self) -> None:
        """Load dataset, fit preprocessors, cache feature matrix, and load ML model."""
        df = load_json_dataset(self.dataset_path)
        self.preprocessor.fit_transform(df)
        self._load_trained_model()
        self._ready = True

    def _load_trained_model(self) -> None:
        model_path = Path(__file__).parent / "models" / "trained_model.joblib"
        if model_path.exists():
            try:
                self.trained_artifacts = joblib.load(model_path)
            except Exception:
                self.trained_artifacts = None

    @property
    def is_ready(self) -> bool:
        return self._ready

    def recommend(
        self,
        user_input: dict[str, Any],
        top_k: int = 5,
        cosine_weight: float = DEFAULT_COSINE_WEIGHT,
        budget_slack: float = 0.15,
    ) -> list[dict[str, Any]]:
        """
        Generate top laptop recommendations for a user profile with high ML accuracy.

        Args:
            user_input: User preference dict (budget, usage, etc.).
            top_k: Max results to return.
            cosine_weight: Blend weight for cosine vs weighted score.
            budget_slack: Allow laptops up to budget * (1 + slack).

        Returns:
            List of dicts: brand, model, price, compatibility_score, reason.
        """
        if not self._ready:
            self.initialize()

        assert self.preprocessor.df_processed is not None
        assert self.preprocessor.feature_matrix is not None

        raw_budget = float(user_input.get("budget", 0))
        if raw_budget <= 0:
            raise ValueError("user_input.budget must be a positive number")

        # Currency auto-detection: INR values (e.g. >= 10,000) mapped to USD equivalent
        is_inr = raw_budget >= 10000
        budget = raw_budget / 83.0 if is_inr else raw_budget

        usage = user_input.get("usage", []) or []
        if isinstance(usage, str):
            usage = [usage]

        # Step 1: Filter by budget
        df = self.preprocessor.df_processed
        filtered = filter_by_budget(df, budget, slack=budget_slack)

        if filtered.empty:
            filtered = filter_by_budget(df, budget, slack=0.30)
        if filtered.empty:
            filtered = df.copy()

        indices = filtered.index.tolist()
        matrix = self.preprocessor.feature_matrix[indices]

        # Step 2: User profile vector for cosine similarity
        profile = build_user_profile(user_input)
        user_vector = self.preprocessor.transform_user_preferences(profile)

        # Step 3: Cosine similarity on filtered subset
        cosine = cosine_similarity_scores(user_vector, matrix)

        # Step 4: Multi-criteria weighted scores
        weighted = np.array(
            [weighted_final_score(filtered.loc[i], budget, usage) for i in indices],
            dtype=float,
        )

        # Step 5: Trained ML Model inference
        ml_scores = None
        if self.trained_artifacts and "model" in self.trained_artifacts:
            try:
                model = self.trained_artifacts["model"]
                perf_pref = 0.85 if any("AI" in u or "Gaming" in u for u in usage) else 0.65
                port_pref = 0.85 if str(user_input.get("portability", "")).lower() == "high" else 0.55
                batt_pref = 0.85 if str(user_input.get("battery_preference", "")).lower() == "high" else 0.55

                preds = []
                for i in indices:
                    r = filtered.loc[i]
                    x_vec = [
                        budget / 3500.0,
                        perf_pref,
                        port_pref,
                        batt_pref,
                        float(r["price"]) / 3500.0,
                        float(r.get("ram", 16)) / 64.0,
                        float(r.get("storage", 512)) / 2048.0,
                        float(r.get("battery", 10)) / 24.0,
                        float(r.get("weight", 1.8)) / 3.2,
                        float(r.get("rating", 4.5)) / 5.0,
                        float(r.get("ai_ml_score", 7)) / 10.0,
                        float(r.get("coding_score", 8)) / 10.0,
                        float(r.get("gaming_score", 7)) / 10.0,
                        float(r.get("editing_score", 7)) / 10.0,
                        float(r.get("battery_score", 7)) / 10.0,
                        float(r.get("portability_score", 7)) / 10.0,
                        float(r.get("thermal_score", 8)) / 10.0,
                        float(r.get("future_score", 8)) / 10.0,
                    ]
                    preds.append(float(model.predict([x_vec])[0]))
                ml_scores = np.array(preds)
            except Exception:
                ml_scores = None

        # Step 6: Ensemble Blend
        if ml_scores is not None and len(ml_scores) == len(cosine):
            hybrid = 0.50 * ml_scores + 0.30 * cosine + 0.20 * weighted
        else:
            hybrid = hybrid_similarity(cosine, weighted, cosine_weight=cosine_weight)

        # Step 7: Rank and take top_k
        ranked = rank_laptops(filtered, hybrid, top_k=top_k)

        # Step 8: Format output with rich natural language explanations
        output: list[dict[str, Any]] = []
        for _, row in ranked.iterrows():
            compat_pct = min(99.0, max(60.0, float(row["hybrid_score"]) * 100))
            item = format_recommendation_output(row, user_input, compat_pct)
            if is_inr:
                item["price_inr"] = int(row["price"] * 83)
            output.append(item)

        return output

    def recommend_detailed(
        self,
        user_input: dict[str, Any],
        top_k: int = 5,
    ) -> list[dict[str, Any]]:
        """Extended output including cpu, gpu, ram, and specs."""
        basic = self.recommend(user_input, top_k=top_k)
        if not self._ready or self.preprocessor.df_processed is None:
            return basic

        enriched = []
        for item in basic:
            match = self.preprocessor.df_processed[
                (self.preprocessor.df_processed["brand"] == item["brand"])
                & (self.preprocessor.df_processed["model"] == item["model"])
            ]
            if not match.empty:
                row = match.iloc[0]
                item = {
                    **item,
                    "cpu": str(row["cpu"]),
                    "gpu": str(row["gpu"]),
                    "ram": int(row.get("ram", 16)),
                    "storage": int(row.get("storage", 512)),
                    "battery": float(row.get("battery", 10)),
                    "weight": float(row.get("weight", 1.8)),
                }
            enriched.append(item)
        return enriched


_default_engine: Optional[RecommendEngine] = None


def get_engine(dataset_path: Union[str, Path] = DEFAULT_DATASET) -> RecommendEngine:
    """Singleton engine for FastAPI dependency injection."""
    global _default_engine
    if _default_engine is None:
        _default_engine = RecommendEngine(dataset_path)
        _default_engine.initialize()
    return _default_engine


def recommend_laptops(
    user_input: dict[str, Any],
    top_k: int = 5,
    dataset_path: Union[str, Path] = DEFAULT_DATASET,
) -> list[dict[str, Any]]:
    """One-shot recommendation helper."""
    engine = get_engine(dataset_path)
    return engine.recommend(user_input, top_k=top_k)


SAMPLE_USER_INPUT = {
    "budget": 1500,
    "usage": ["AI/ML", "Coding"],
    "battery_preference": "High",
    "portability": "Medium",
    "gaming": False,
    "editing": False,
}


def run_sample_inference() -> list[dict[str, Any]]:
    """Run example inference and print JSON results."""
    print("=" * 60)
    print("FINDtech ML Engine — Inference Test")
    print("=" * 60)
    engine = RecommendEngine()
    engine.initialize()
    results = engine.recommend(SAMPLE_USER_INPUT, top_k=5)
    print(json.dumps(results, indent=2))
    return results


def run_tests() -> None:
    """Lightweight assertions for CI / local validation."""
    engine = RecommendEngine()
    engine.initialize()

    # USD budget test
    usd_results = engine.recommend({"budget": 1600, "usage": ["AI/ML", "Coding"]}, top_k=3)
    assert len(usd_results) >= 1, "Expected recommendations for USD budget"
    for r in usd_results:
        assert r["price"] <= 1600 * 1.25
        assert "reason" in r and len(r["reason"]) > 10
        assert 50 <= r["compatibility_score"] <= 100

    # INR budget auto-conversion test
    inr_results = engine.recommend({"budget": 120000, "usage": ["Gaming"]}, top_k=3)
    assert len(inr_results) >= 1, "Expected recommendations for INR budget"
    assert "price_inr" in inr_results[0]

    print("All ML engine tests passed.")


if __name__ == "__main__":
    run_sample_inference()
    print("\n" + "-" * 60)
    run_tests()
