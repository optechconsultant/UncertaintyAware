import json
import math
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
import os

from .candidates.semantic_entropy import SemanticEntropyScorer
from .candidates.mahalanobis import MahalanobisScorer
from .normalization import normalize_distance
from .faults import check_for_faults
class Scorer:
    def __init__(self, method: str = 'semantic_entropy', method_kwargs: Optional[Dict] = None):
        self.method = method
        self.method_kwargs = method_kwargs or {}
        self.q_hat = None
        self.theta_low = None
        self.theta_high = None
        self.alpha = None

        if self.method == 'semantic_entropy':
            self.candidate = SemanticEntropyScorer(**self.method_kwargs)
        elif self.method == 'mahalanobis':
            candidate_kwargs = self.method_kwargs.copy()
            candidate_kwargs.pop('normalization_scale', None)
            self.candidate = MahalanobisScorer(**candidate_kwargs)
        else:
            raise ValueError(f"Unknown scoring method: {method}")
    def compute_nonconformity(self, model_output: Any, **kwargs) -> Tuple[float, bool]:
        has_fault, penalty_score, is_correct = check_for_faults(model_output)
        if has_fault:
            return penalty_score, False

        if self.method == 'semantic_entropy':
            samples = kwargs.get('samples', [model_output])
            sim_matrix = kwargs.get('similarity_matrix', None)
            score = self.candidate.compute_score(samples=samples, similarity_matrix=sim_matrix)

        elif self.method == 'mahalanobis':
            embedding = kwargs.get('embedding')
            if embedding is None:
                raise ValueError("Mahalanobis scoring requires 'embedding' in kwargs.")
            distance = self.candidate.compute_score(embedding=embedding)
            scale_factor = self.method_kwargs.get('normalization_scale', 10.0)
            score = normalize_distance(distance, scale_factor=scale_factor)

        else:
            score = 1.0

        return score, True
    def calibrate(self, 
                  calibration_data: List[Dict[str, Any]], 
                  alpha: float, 
                  config: dict,
                  artifacts_dir: str = '../artifacts/calibration'):
        self.alpha = alpha

        scores = []
        labels = []

        for item in calibration_data:
            score, valid = self.compute_nonconformity(
                item.get('output'), 
                samples=item.get('samples'),
                embedding=item.get('embedding'),
                similarity_matrix=item.get('similarity_matrix')
            )
            is_correct = item.get('is_correct', False) if valid else False

            scores.append(score)
            labels.append(is_correct)

        scores = np.array(scores)
        labels = np.array(labels)

        correct_scores = scores[labels == True]
        wrong_scores = scores[labels == False]

        n = len(correct_scores)
        if n == 0:
            raise ValueError("No correct examples found in calibration data.")

        sorted_correct = np.sort(correct_scores)
        target_idx = math.ceil((n + 1) * (1 - alpha)) - 1

        if target_idx >= n:
            self.q_hat = float(sorted_correct[-1])
        elif target_idx < 0:
            self.q_hat = float(sorted_correct[0])
        else:
            self.q_hat = float(sorted_correct[target_idx])

        self.theta_low = float(np.percentile(correct_scores, 95))
        self.theta_high = float(np.percentile(wrong_scores, 5)) if len(wrong_scores) > 0 else 1.0

        method_artifacts_dir = os.path.join(artifacts_dir, self.method)
        os.makedirs(method_artifacts_dir, exist_ok=True)

        calibration_results = {
            "method": self.method,
            "alpha": self.alpha,
            "q_hat": self.q_hat,
            "theta_low": self.theta_low,
            "theta_high": self.theta_high,
            "total_samples": len(scores),
            "correct_samples": int(n),
            "wrong_samples": int(len(wrong_scores)),
            "separation_stats": {
                "correct_mean": float(np.mean(correct_scores)),
                "wrong_mean": float(np.mean(wrong_scores)) if len(wrong_scores) > 0 else None
            },
            "raw_pairs": [{"score": float(s), "is_correct": bool(l)} for s, l in zip(scores, labels)]
        }

        with open(os.path.join(method_artifacts_dir, 'calibration_results.json'), 'w') as f:
            json.dump(calibration_results, f, indent=4)

        pipeline_state = {
            "scorer_version": "1.1.0",
            "model_name": config.get('generation', {}).get('llm_model', 'unknown'),
            "embedding_model": config.get('embedding', {}).get('embedding_model', 'unknown'),
            "temperature": config.get('generation', {}).get('temperature', 0.0),
            "num_samples": config.get('generation', {}).get('num_samples', 0),
            "scorer_method": self.method,
            "calibration_metadata": {
                "alpha": self.alpha,
                "q_hat": self.q_hat,
                "theta_low": self.theta_low,
                "theta_high": self.theta_high,
                "total_samples": len(scores),
                "correct_samples": int(n)
            }
        }

        with open(os.path.join(method_artifacts_dir, 'pipeline_state.json'), 'w') as f:
            json.dump(pipeline_state, f, indent=4)

