import unittest
import numpy as np
import os
import shutil
import tempfile

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

from scorer import Scorer
from scorer.candidates.semantic_entropy import SemanticEntropyScorer
from scorer.candidates.mahalanobis import MahalanobisScorer
from scorer.faults import check_for_faults


class TestSemanticEntropyScorer(unittest.TestCase):
    def setUp(self):
        self.scorer = SemanticEntropyScorer(use_exact_match=True)

    def test_single_sample(self):
        score = self.scorer.compute_score(samples=["Paris"])
        self.assertEqual(score, 0.0)

    def test_identical_samples(self):
        samples = ["Paris"] * 10
        score = self.scorer.compute_score(samples=samples)
        self.assertEqual(score, 0.0)

    def test_all_distinct_samples(self):
        samples = [f"City {i}" for i in range(10)]
        score = self.scorer.compute_score(samples=samples)
        self.assertAlmostEqual(score, 1.0, places=5)

    def test_entropy_partitions(self):
        # 9 Paris, 1 London -> partition [9, 1]
        samples = ["Paris"] * 9 + ["London"]
        score = self.scorer.compute_score(samples=samples)
        # -(0.9*ln(0.9) + 0.1*ln(0.1)) / ln(10) ≈ 0.14118
        self.assertAlmostEqual(score, 0.1411817415, places=5)


class TestMahalanobisScorer(unittest.TestCase):
    def test_fit_and_distance(self):
        scorer = MahalanobisScorer()
        # Train on 20 5-dim embeddings centered at 1.0
        np.random.seed(42)
        train_embs = np.random.normal(loc=1.0, scale=0.1, size=(20, 5))
        scorer.fit(train_embs)
        
        # Test close point vs far point
        close_point = np.array([1.0, 1.0, 1.0, 1.0, 1.0])
        far_point = np.array([5.0, 5.0, 5.0, 5.0, 5.0])
        
        dist_close = scorer.compute_score(close_point)
        dist_far = scorer.compute_score(far_point)
        
        self.assertLess(dist_close, dist_far)


class TestFaultHandling(unittest.TestCase):
    def test_none_output(self):
        has_fault, penalty, valid = check_for_faults(None)
        self.assertTrue(has_fault)
        self.assertEqual(penalty, 1.0)
        self.assertFalse(valid)

    def test_empty_string(self):
        has_fault, penalty, valid = check_for_faults("   ")
        self.assertTrue(has_fault)
        self.assertEqual(penalty, 1.0)
        self.assertFalse(valid)

    def test_exception_output(self):
        has_fault, penalty, valid = check_for_faults(RuntimeError("API timeout"))
        self.assertTrue(has_fault)
        self.assertEqual(penalty, 1.0)
        self.assertFalse(valid)


class TestScorerCalibrationAndRouting(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_threshold_monotonicity_and_classify(self):
        scorer = Scorer(method='semantic_entropy', method_kwargs={'use_exact_match': True})
        
        # Calibration data with heavily skewed zero-score wrong answers
        calib_data = []
        for _ in range(50):
            calib_data.append({
                'output': 'Paris',
                'samples': ['Paris'] * 10,
                'is_correct': True
            })
        for _ in range(30):
            # Confidently wrong -> score = 0.0, is_correct = False
            calib_data.append({
                'output': 'London',
                'samples': ['London'] * 10,
                'is_correct': False
            })
        for _ in range(20):
            # Uncertain wrong -> high score, is_correct = False
            calib_data.append({
                'output': 'Rome',
                'samples': [f'Answer {i}' for i in range(10)],
                'is_correct': False
            })

        config = {'generation': {'llm_model': 'llama3.2:1b'}, 'embedding': {'embedding_model': 'nomic-embed-text'}}
        scorer.calibrate(calib_data, alpha=0.10, config=config, artifacts_dir=self.temp_dir)

        # Monotonicity check
        self.assertIsNotNone(scorer.q_hat)
        self.assertIsNotNone(scorer.theta_low)
        self.assertIsNotNone(scorer.theta_high)
        self.assertLessEqual(scorer.theta_low, scorer.theta_high)

        # Test classify routing
        self.assertEqual(scorer.classify(0.0), "PASS")
        self.assertEqual(scorer.classify(1.0), "FLAG")


if __name__ == '__main__':
    unittest.main()
