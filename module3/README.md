# ConformGuard – Student 3

**Provenance + Historical Analytics + Failure Analysis + LLM Risk Analysis**

Port: **8003**  
Base URL: `http://localhost:8003`

## Ownership (strict)

Student 3 **owns**:
- Provenance recording of complete inference results from Student 2
- JSONL audit logging
- Historical inference storage
- Failure / topic / trend analysis
- Historical drift analysis (records only)
- Calibration metadata storage (values from S1/S4)
- Request tracking
- Bonferroni alerts
- Optional LLM risk analysis
- REST APIs for Student 4 dashboard

Student 3 **does NOT own**:
- PASS / REVIEW / FLAG decisions
- Runtime OOD detection
- Runtime KS drift detection
- Adaptive flagging policy
- `pipeline_state.json`
- Dashboard UI or dashboard user authentication

## Quick start

```bash
cd conformguard-student3
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # edit keys if needed
python run.py
```

OpenAPI docs: http://localhost:8003/docs

## Authentication

All protected endpoints require header:

```http
X-API-Key: <key>
```

| Caller     | Key env var          | Default (dev)        |
|------------|----------------------|----------------------|
| Student 2  | `STUDENT2_API_KEY`   | `student2-dev-key`   |
| Student 4  | `STUDENT4_API_KEY`   | `student4-dev-key`   |
| Admin      | `ADMIN_API_KEY`      | `admin-dev-key`      |

## Main endpoints

### Inference (Student 2)
- `POST /api/v1/inferences` – store complete result (idempotent on `question_id`)
- `GET  /api/v1/inferences/{question_id}`

### Calibration (Admin / authorized updater)
- `POST /api/v1/calibration`
- `GET  /api/v1/calibration/current`
- `GET  /api/v1/calibration/history`

### System
- `GET /api/v1/system/status`
- `GET /api/v1/system/requests`
- `GET /api/v1/system/modules`

### Analytics
- `GET  /api/v1/analytics/summary`
- `GET  /api/v1/analytics/topics`
- `GET  /api/v1/analytics/topics/{topic}`
- `GET  /api/v1/analytics/trends`
- `GET  /api/v1/analytics/drift`
- `GET  /api/v1/analytics/drift/history`
- `GET  /api/v1/analytics/alerts`          ← Bonferroni
- `GET  /api/v1/analytics/risks`
- `POST /api/v1/analytics/risks/analyze`

### Dashboard (Student 4)
- `GET /api/v1/dashboard/status`
- `GET /api/v1/dashboard/live`
- `GET /api/v1/dashboard/topics`
- `GET /api/v1/dashboard/trends`
- `GET /api/v1/dashboard/drift`
- `GET /api/v1/dashboard/risks`
- `GET /api/v1/dashboard/calibration`

### Health
- `GET /api/v1/health`

## Idempotency

`question_id` is unique. Re-submitting the same `question_id` returns the existing record (HTTP 201 path still used; no duplicate row)

## Cross-computer

Replace `localhost` with the machine IP when modules run on different hosts. Communication is pure HTTP REST; no shared filesystem or shared SQLite.
