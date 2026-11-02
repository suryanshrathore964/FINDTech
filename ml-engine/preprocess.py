"""
Dataset preprocessing for FINDtech ML engine.

Responsibilities:
- Load JSON laptop catalog
- Encode categorical features (brand, gpu tier)
- Normalize numerical columns with MinMaxScaler
- Build feature matrices for cosine similarity
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional, Union

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler, LabelEncoder

# Default dataset path relative to this package root
DEFAULT_DATASET = Path(__file__).parent / "datasets" / "laptops_2026.json"

# Numerical columns normalized for ML features
NUMERIC_COLS = [
    "ram",
    "storage",
    "battery",
    "weight",
    "price",
    "ai_ml_score",
    "coding_score",
    "gaming_score",
    "editing_score",
    "battery_score",
    "portability_score",
    "thermal_score",
    "future_score",
]

# Categorical columns label-encoded
CATEGORICAL_COLS = ["brand", "gpu"]

# Columns used for cosine similarity (engineered + normalized scores)
SIMILARITY_FEATURE_COLS = [
    "ai_ml_score_norm",
    "coding_score_norm",
    "gaming_score_norm",
    "editing_score_norm",
    "battery_score_norm",
    "portability_score_norm",
    "thermal_score_norm",
    "future_score_norm",
    "ram_norm",
    "storage_norm",
    "price_norm",
    "brand_enc",
    "gpu_enc",
]


def load_json_dataset(path: Union[str, Path] = DEFAULT_DATASET) -> pd.DataFrame:
    """
    Load laptop records from a JSON file into a pandas DataFrame.

    Args:
        path: Path to JSON array of laptop objects.

    Returns:
        DataFrame with one row per laptop.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")

    with open(path, encoding="utf-8") as f:
        records = json.load(f)

    if not isinstance(records, list) or len(records) == 0:
        raise ValueError("Dataset must be a non-empty JSON array")

    df = pd.DataFrame(records)
    # Ensure column aliasing for both schema formats
    if "name" in df.columns and "model" not in df.columns:
        df["model"] = df["name"]
    elif "model" in df.columns and "name" not in df.columns:
        df["name"] = df["model"]

    if "ram_gb" in df.columns and "ram" not in df.columns:
        df["ram"] = df["ram_gb"]
    elif "ram" in df.columns and "ram_gb" not in df.columns:
        df["ram_gb"] = df["ram"]

    if "storage_gb" in df.columns and "storage" not in df.columns:
        df["storage"] = df["storage_gb"]
    elif "storage" in df.columns and "storage_gb" not in df.columns:
        df["storage_gb"] = df["storage"]

    if "battery_hours" in df.columns and "battery" not in df.columns:
        df["battery"] = df["battery_hours"]
    elif "battery" in df.columns and "battery_hours" not in df.columns:
        df["battery_hours"] = df["battery"]

    if "weight_kg" in df.columns and "weight" not in df.columns:
        df["weight"] = df["weight_kg"]
    elif "weight" in df.columns and "weight_kg" not in df.columns:
        df["weight_kg"] = df["weight"]

    _validate_schema(df)
    return df


def _validate_schema(df: pd.DataFrame) -> None:
    """Ensure required columns exist in the dataset."""
    required = {
        "brand",
        "model",
        "cpu",
        "gpu",
        "ram",
        "storage",
        "battery",
        "weight",
        "price",
        "ai_ml_score",
        "coding_score",
        "gaming_score",
        "editing_score",
        "battery_score",
        "portability_score",
        "thermal_score",
        "future_score",
    }
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Dataset missing columns: {missing}")


def _gpu_tier(gpu: str) -> str:
    """Map GPU string to coarse tier for encoding."""
    g = str(gpu).lower()
    if "4090" in g or "4080" in g:
        return "enthusiast"
    if "4070" in g or "4060" in g or "4050" in g or "3050" in g:
        return "discrete_mid"
    if "m3" in g or "m2" in g:
        return "apple_silicon"
    if "integrated" in g or "iris" in g or "uhd" in g:
        return "integrated"
    return "other"


class DatasetPreprocessor:
    """
    Stateful preprocessor: fits encoders/scalers on catalog, transforms rows.

    Reuse a single instance across requests in FastAPI (fit once at startup).
    """

    def __init__(self) -> None:
        self.scaler = MinMaxScaler()
        self.brand_encoder = LabelEncoder()
        self.gpu_encoder = LabelEncoder()
        self._fitted = False
        self.df_raw: Optional[pd.DataFrame] = None
        self.df_processed: Optional[pd.DataFrame] = None
        self.feature_matrix: Optional[np.ndarray] = None

    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Fit encoders/scalers and return processed DataFrame with norm columns.

        Args:
            df: Raw laptop DataFrame.

        Returns:
            Processed DataFrame with *_norm and *_enc columns.
        """
        self.df_raw = df.copy()
        processed = df.copy()

        # Coarse GPU tier for stable encoding
        processed["gpu_tier"] = processed["gpu"].apply(_gpu_tier)

        # Label encode categoricals
        processed["brand_enc"] = self.brand_encoder.fit_transform(processed["brand"].astype(str))
        processed["gpu_enc"] = self.gpu_encoder.fit_transform(processed["gpu_tier"].astype(str))

        # Normalize numeric columns to [0, 1]
        numeric_data = processed[NUMERIC_COLS].astype(float)
        normalized = self.scaler.fit_transform(numeric_data)
        for i, col in enumerate(NUMERIC_COLS):
            processed[f"{col}_norm"] = normalized[:, i]

        # Alias score norms for similarity feature list
        for col in [
            "ai_ml_score",
            "coding_score",
            "gaming_score",
            "editing_score",
            "battery_score",
            "portability_score",
            "thermal_score",
            "future_score",
        ]:
            processed[f"{col}_norm"] = processed[f"{col}_norm"]

        self.df_processed = processed
        self.feature_matrix = self.build_similarity_matrix(processed)
        self._fitted = True
        return processed

    def build_similarity_matrix(self, df: pd.DataFrame) -> np.ndarray:
        """Stack similarity feature columns into (n_laptops, n_features) matrix."""
        cols = [c for c in SIMILARITY_FEATURE_COLS if c in df.columns]
        return df[cols].astype(float).values

    def transform_user_preferences(self, user_profile: dict[str, Any]) -> np.ndarray:
        """
        Build a user preference vector aligned with SIMILARITY_FEATURE_COLS.

        Args:
            user_profile: Dict from build_user_profile() in scoring module.

        Returns:
            1D numpy array matching feature matrix columns.
        """
        if not self._fitted:
            raise RuntimeError("Preprocessor must be fit before transforming user profile")

        vector = []
        for col in SIMILARITY_FEATURE_COLS:
            vector.append(float(user_profile.get(col, 0.5)))
        return np.array(vector, dtype=float).reshape(1, -1)

    def load_and_fit(self, path: Union[str, Path] = DEFAULT_DATASET) -> pd.DataFrame:
        """Convenience: load JSON and fit in one call."""
        df = load_json_dataset(path)
        return self.fit_transform(df)


def preprocess_dataset(path: Union[str, Path] = DEFAULT_DATASET) -> tuple[pd.DataFrame, DatasetPreprocessor]:
    """
    One-shot preprocessing for scripts and tests.

    Returns:
        (processed_df, fitted preprocessor)
    """
    preprocessor = DatasetPreprocessor()
    df = load_json_dataset(path)
    processed = preprocessor.fit_transform(df)
    return processed, preprocessor
