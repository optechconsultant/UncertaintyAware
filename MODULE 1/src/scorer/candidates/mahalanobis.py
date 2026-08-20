import numpy as np
from sklearn.covariance import LedoitWolf
from typing import Optional
from . import BaseScorer

class MahalanobisScorer(BaseScorer):
    def __init__(self):
        self.centroid: Optional[np.ndarray] = None
        self.precision_matrix: Optional[np.ndarray] = None
        self.is_calibrated = False
    def fit(self, correct_calibration_embeddings: np.ndarray):
        if len(correct_calibration_embeddings) == 0:
            raise ValueError("Cannot fit with 0 calibration samples.")
        self.centroid = np.mean(correct_calibration_embeddings, axis=0)

        cov_estimator = LedoitWolf()
        cov_estimator.fit(correct_calibration_embeddings)
        self.precision_matrix = cov_estimator.precision_
        self.is_calibrated = True
    def compute_score(self, embedding: np.ndarray, **kwargs) -> float:
        if not self.is_calibrated:
            raise RuntimeError("MahalanobisScorer must be fitted with calibration data first.")

        if embedding.ndim == 1:
            embedding = embedding.reshape(1, -1)

        diff = embedding - self.centroid

        left_term = np.dot(diff, self.precision_matrix)
        distances_sq = np.sum(left_term * diff, axis=1)

        distances = np.sqrt(np.maximum(distances_sq, 0.0))

        if len(distances) == 1:
            return float(distances[0])
        return distances.tolist()
