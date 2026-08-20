import numpy as np
from typing import List, Optional
from . import BaseScorer

class SemanticEntropyScorer(BaseScorer):
    def __init__(self, use_exact_match: bool = True, similarity_threshold: float = 0.8):
        self.use_exact_match = use_exact_match
        self.similarity_threshold = similarity_threshold

    def compute_score(self, 
                      samples: List[str], 
                      similarity_matrix: Optional[np.ndarray] = None, 
                      **kwargs) -> float:
        if not samples:
            return 1.0 

        n_samples = len(samples)

        if n_samples == 1:
            return 0.0 

        if similarity_matrix is not None:
            clusters = self._cluster_by_similarity(similarity_matrix)
        elif self.use_exact_match:
            clusters = self._cluster_exact_match(samples)
        else:
            raise ValueError("Must provide similarity_matrix or use_exact_match=True")

        cluster_counts = np.bincount(clusters)
        probs = cluster_counts[cluster_counts > 0] / n_samples

        if len(probs) == 1:
            return 0.0

        entropy = -np.sum(probs * np.log(probs)) + 0.0

        max_entropy = np.log(n_samples)
        normalized_score = entropy / max_entropy

        return float(np.clip(normalized_score, 0.0, 1.0))
    def _cluster_exact_match(self, samples: List[str]) -> np.ndarray:
        unique_samples = list(set(samples))
        sample_to_idx = {sample: i for i, sample in enumerate(unique_samples)}
        return np.array([sample_to_idx[sample] for sample in samples])
    def _cluster_by_similarity(self, sim_matrix: np.ndarray) -> np.ndarray:
        from scipy.sparse.csgraph import connected_components

        adj_matrix = (sim_matrix >= self.similarity_threshold).astype(int)

        n_components, labels = connected_components(
            csgraph=adj_matrix, directed=False, return_labels=True
        )
        return labels
