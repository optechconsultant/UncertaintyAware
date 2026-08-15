# API Documentation - ConformalGuard Inference & Calibration Engine

## Endpoints Summary

### GET /api/v1/inference/requests
Description: Fetches the list of active and recent inference requests with non-conformity scores and pipeline status.

```bash
curl -X GET https://api.conformalguard.internal/api/v1/inference/requests?status=all \
  -H "Authorization: Bearer <token>"
```

Sample Response (200 OK):
```json
{
  "requests": [
    {
      "id": "REQ-1042",
      "timestamp": "14:32:01",
      "question": "What are the safety protocols for chemical handling?",
      "nonConformityScore": 0.72,
      "decision": "PASS",
      "stage": "Module 2",
      "provenance": "Logged",
      "policy": "Confidence Band",
      "llmModel": "GPT-4o"
    }
  ],
  "total": 1,
  "systemStatus": "healthy"
}
```

Error Codes: 401 (Unauthorized), 500 (Internal Server Error)

---

### POST /api/v1/calibration/recalibrate
Description: Re-evaluates non-conformity score quantile ($\hat{q}$) on the calibration set for target empirical coverage ($1 - \alpha$).

```bash
curl -X POST https://api.conformalguard.internal/api/v1/calibration/recalibrate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "alpha": 0.10,
    "calibrationSetSize": 1000,
    "temperatureScaling": 1.0,
    "riskMetric": "Misclassification Rate",
    "scoreFunction": "Softmax Uncertainty",
    "policy": "Adaptive Prediction Set"
  }'
```

Sample Response (200 OK):
```json
{
  "quantileThreshold": 0.784,
  "targetCoverage": 0.90,
  "achievedCoverage": 0.902,
  "avgSetSize": 1.18,
  "passPercentage": 68.4,
  "flagPercentage": 18.2,
  "rejectPercentage": 13.4,
  "updatedAt": "2026-08-13T12:58:00Z"
}
```

Error Codes: 400 (Invalid alpha range), 401 (Unauthorized), 422 (Insufficient calibration data)

---

### GET /api/v1/calibration/samples
Description: Retrieves holdout calibration dataset samples with domain categorization and quantile rankings.

```bash
curl -X GET https://api.conformalguard.internal/api/v1/calibration/samples?category=Safety%20%26%20Bio \
  -H "Authorization: Bearer <token>"
```

Sample Response (200 OK):
```json
{
  "samples": [
    {
      "id": "CAL-001",
      "category": "Safety & Bio",
      "prompt": "Determine standard operating limits for bio-containment hood airflow",
      "score": 0.34,
      "quantileRank": 0.28,
      "inConformalSet": true,
      "status": "Passed"
    }
  ]
}
```

---

### GET /api/v1/audit/logs
Description: Retrieves structured JSON audit event log records for traceability.

```bash
curl -X GET https://api.conformalguard.internal/api/v1/audit/logs?limit=50 \
  -H "Authorization: Bearer <token>"
```

Sample Response (200 OK):
```json
[
  {
    "timestamp": "2026-08-13T12:58:00.000Z",
    "actor": "system",
    "action": "recalibrate_threshold",
    "resource_id": "CAL-2026-08",
    "details": {
      "alpha": 0.1,
      "new_threshold": 0.784
    }
  }
]
```

Error Codes: 401 (Unauthorized), 500 (Internal Server Error)
