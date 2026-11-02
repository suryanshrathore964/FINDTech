"""
Cosine similarity module for FINDtech ML engine.

Computes profile-to-catalog similarity using scikit-learn metrics.
"""

from __future__ import annotations

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


def cosine_similarity_scores(
    user_vector: np.ndarray,
    laptop_matrix: np.ndarray,
) -> np.ndarray:
    """
    Compute cosine similarity between one user vector and all laptop rows.

    Args:
        user_vector: Shape (1, n_features) or (n_features,).
        laptop_matrix: Shape (n_laptops, n_features).

    Returns:
        1D array of similarity scores in [0, 1], length n_laptops.
    """
    if laptop_matrix.size == 0:
        return np.array([])

    user = np.asarray(user_vector, dtype=float)
    if user.ndim == 1:
        user = user.reshape(1, -1)

    # sklearn returns values in [0, 1] for non-negative feature vectors
    scores = cosine_similarity(user, laptop_matrix).flatten()
    return np.clip(scores, 0.0, 1.0)


def hybrid_similarity(
    cosine_scores: np.ndarray,
    weighted_scores: np.ndarray,
    cosine_weight: float = 0.4,
) -> np.ndarray:
    """
    Blend cosine similarity with weighted business scores.

    Args:
        cosine_scores: Cosine similarity per laptop.
        weighted_scores: Weighted formula scores in [0, 1].
        cosine_weight: Weight assigned to cosine (remainder to weighted).

    Returns:
        Combined ranking scores.
    """
    w = float(np.clip(cosine_weight, 0.0, 1.0))
    cosine_norm = cosine_scores / (cosine_scores.max() + 1e-9) if len(cosine_scores) else cosine_scores
    weighted_norm = weighted_scores / (weighted_scores.max() + 1e-9) if len(weighted_scores) else weighted_scores
    return w * cosine_norm + (1 - w) * weighted_norm
