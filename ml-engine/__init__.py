"""
FINDtech ML Engine — Scikit-learn laptop recommendation package.

FastAPI integration:
    import sys
    sys.path.insert(0, "/path/to/ml-engine")
    from recommend import recommend_laptops, get_engine
"""

from recommend import RecommendEngine, recommend_laptops, get_engine
from preprocess import load_json_dataset, DatasetPreprocessor
from explanations import generate_explanation

__all__ = [
    "RecommendEngine",
    "recommend_laptops",
    "get_engine",
    "load_json_dataset",
    "DatasetPreprocessor",
    "generate_explanation",
]
