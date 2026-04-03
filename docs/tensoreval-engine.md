# TensorEvalEngine API Reference

Base URLs:

- **Local:** `http://localhost:4000`
- **Production:** `https://shivam274-tensorevalengine.hf.space`

## Authentication

All `/api/*` endpoints require a Supabase Auth JWT token in the `Authorization` header:

```
Authorization: Bearer <supabase_access_token>
```

The `user_id` is extracted from the JWT `sub` claim — it is **not** passed in request bodies or query parameters.

- `/health` does **not** require authentication.
- Missing or invalid tokens return `401 Unauthorized`.

---

## Enums

| Type               | Values                                                 |
| ------------------ | ------------------------------------------------------ |
| `DatasetStatus`    | `in_progress` \| `completed` \| `failed` \| `inactive` |
| `DatasetSource`    | `generated` \| `uploaded` \| `built_in`                |
| `EvaluationStatus` | `in_progress` \| `completed` \| `failed` \| `inactive` |
| `PassFail`         | `pass` \| `fail`                                       |

`inactive` = soft-deleted (row stays in DB, hidden from list endpoints).

---

## Datasets

### 1. List Datasets

```
GET /api/datasets
Authorization: Bearer <token>
```

Returns datasets owned by the authenticated user + all `built_in` datasets. Excludes `inactive`.

**Response 200**

```json
{
  "datasets": [
    {
      "id": "7404f76e-89d3-4782-8aaa-96110bd5f14e",
      "user_id": "02881317-e221-4281-98c4-7cb8e18f077a",
      "name": "Sales Bot Eval Set",
      "status": "completed",
      "source": "generated",
      "query_count": 3,
      "created_at": "2026-01-31T17:48:32.053926+00:00"
    }
  ]
}
```

---

### 2. Create Dataset

```
POST /api/datasets
Authorization: Bearer <token>
Content-Type: application/json
```

Two flows based on `source`:

#### Flow A — Generated (AI creates queries from agent description)

**Request Body**

| Field               | Type          | Required | Default       | Description                               |
| ------------------- | ------------- | -------- | ------------- | ----------------------------------------- |
| `name`              | string        | Yes      |               | Dataset name                              |
| `description`       | string        | No       | `null`        | Description                               |
| `source`            | `"generated"` | No       | `"generated"` | Source type                               |
| `agent_name`        | string        | Yes      |               | Name of the agent being evaluated         |
| `agent_description` | string        | Yes      |               | What the agent does                       |
| `capabilities`      | string[]      | No       | `[]`          | e.g. `["web_browsing", "code_execution"]` |
| `query_count`       | integer       | No       | `5`           | 1-100                                     |
| `concurrency`       | integer       | No       | `3`           | 1-10                                      |

```json
{
  "name": "Sales Bot Eval Set",
  "description": "Test dataset for sales agent",
  "agent_name": "SalesBot",
  "agent_description": "Handles customer sales inquiries, upselling, and pricing questions",
  "capabilities": ["web_browsing", "customer_support"],
  "query_count": 3,
  "concurrency": 2
}
```

#### Flow B — Uploaded (user provides CSV/JSON URL, enriched with category + rubrics)

**Request Body**

| Field         | Type         | Required | Default | Description             |
| ------------- | ------------ | -------- | ------- | ----------------------- |
| `name`        | string       | Yes      |         | Dataset name            |
| `description` | string       | No       | `null`  | Description             |
| `source`      | `"uploaded"` | Yes      |         | Must be `"uploaded"`    |
| `source_url`  | string (URL) | Yes      |         | URL to CSV or JSON file |
| `concurrency` | integer      | No       | `3`     | 1-10                    |

```json
{
  "name": "Custom QA Set",
  "description": "Hand-crafted queries",
  "source": "uploaded",
  "source_url": "https://example.com/queries.json",
  "concurrency": 3
}
```

**Uploaded file formats:**

JSON array:

```json
[{ "query": "What is the refund policy?" }, { "query": "Compare pricing tiers" }]
```

CSV with header:

```csv
query
What is the refund policy?
Compare pricing tiers
```

Also accepts fields named `question`, `prompt`, `input`, or `text`.

**Response 202** (both flows)

Processing starts in background. Poll `GET /api/datasets/:id` for progress.

```json
{
  "id": "7404f76e-89d3-4782-8aaa-96110bd5f14e",
  "name": "Sales Bot Eval Set",
  "status": "in_progress",
  "source": "generated",
  "query_count": 0,
  "created_at": "2026-01-31T17:48:32.053926+00:00"
}
```

**Response 400** (validation error)

```json
{
  "error": "Invalid request body",
  "details": { "fieldErrors": {}, "formErrors": ["..."] }
}
```

---

### 3. Get Dataset Details

```
GET /api/datasets/{id}
Authorization: Bearer <token>
```

**Response 200 — completed** (includes all queries)

```json
{
  "id": "7404f76e-89d3-4782-8aaa-96110bd5f14e",
  "user_id": "02881317-e221-4281-98c4-7cb8e18f077a",
  "name": "Sales Bot Eval Set",
  "description": "Test dataset for sales agent",
  "status": "completed",
  "source": "generated",
  "query_count": 3,
  "generated_config": {
    "agent_name": "SalesBot",
    "agent_description": "Handles customer sales inquiries...",
    "capabilities": ["web_browsing", "customer_support"],
    "concurrency": 2
  },
  "created_at": "2026-01-31T17:48:32.053926+00:00",
  "updated_at": "2026-01-31T17:50:29.754132+00:00",
  "queries": [
    {
      "id": "b7b2938d-3b30-4bcb-9041-970eb1337396",
      "dataset_id": "7404f76e-89d3-4782-8aaa-96110bd5f14e",
      "query_id": "q_1",
      "query": "I'm the VP of Operations at MedTech Solutions...",
      "reference_answer": "Recommended Enterprise tier for 120 users...",
      "category": "customer_support",
      "rubric": [
        {
          "name": "pricing_accuracy",
          "rubric": "Correctly identifies Enterprise tier as appropriate...",
          "weight": 0.35
        },
        {
          "name": "competitive_positioning",
          "rubric": "Acknowledges competitor's $64,800 offer...",
          "weight": 0.25
        },
        {
          "name": "strategic_negotiation",
          "rubric": "Demonstrates policy-aware negotiation...",
          "weight": 0.25
        },
        {
          "name": "customer_empathy_completeness",
          "rubric": "Addresses the urgency and acknowledges loyalty...",
          "weight": 0.15
        }
      ],
      "additional_context": {
        "source": "Synthesized from: https://...",
        "expected_behavior": "Agent should: (1) Research current SaaS pricing..."
      },
      "created_at": "2026-01-31T17:50:29.516646+00:00"
    }
  ]
}
```

**Response 200 — in_progress**

```json
{
  "id": "7404f76e-89d3-4782-8aaa-96110bd5f14e",
  "user_id": "02881317-e221-4281-98c4-7cb8e18f077a",
  "name": "Sales Bot Eval Set",
  "status": "in_progress",
  "source": "generated",
  "query_count": 0,
  "generated_config": { "...": "..." },
  "progress": "Generating 2 main queries (concurrency: 2)...",
  "created_at": "...",
  "updated_at": "..."
}
```

**Response 200 — failed**

```json
{
  "id": "...",
  "status": "failed",
  "progress": "Generation failed: Claude SDK timeout",
  "..."
}
```

**Response 404**

```json
{ "error": "Dataset not found" }
```

---

### 4. Delete Dataset (Soft Delete)

```
DELETE /api/datasets/{id}
Authorization: Bearer <token>
```

Sets status to `inactive`. Row stays in DB. Hidden from list endpoint.

**Response 200**

```json
{ "deleted": true, "id": "7404f76e-89d3-4782-8aaa-96110bd5f14e" }
```

**Response 404**

```json
{ "error": "Dataset not found" }
```

---

## Evaluations

### 5. List Evaluations

```
GET /api/evaluations
Authorization: Bearer <token>
param = userId
```

Returns evaluations owned by the authenticated user. Excludes `inactive`.

**Response 200**

```json
{
  "evaluations": [
    {
      "id": "cde8b938-4660-439c-95bd-8d1c26fef328",
      "user_id": "02881317-e221-4281-98c4-7cb8e18f077a",
      "name": "SalesBot v1 Eval",
      "status": "completed",
      "dataset_id": "7404f76e-89d3-4782-8aaa-96110bd5f14e",
      "results_summary": {
        "overall_score": 0.267,
        "pass_rate": 0.333,
        "passed_count": 1,
        "failed_count": 2,
        "total_count": 3,
        "avg_latency_ms": 500,
        "per_rubric_averages": {
          "safety": 1,
          "pricing_accuracy": 0,
          "response_quality": 0.6,
          "boundary_adherence": 0.5,
          "strategic_negotiation": 0,
          "competitive_positioning": 0,
          "fact_verification_accuracy": 0
        }
      },
      "created_at": "2026-01-31T17:53:38.524846+00:00"
    }
  ]
}
```

---

### 6. Create Evaluation

```
POST /api/evaluations
Authorization: Bearer <token>
Content-Type: application/json
```

Requires a **completed** dataset. Runs the full evaluation pipeline in background: call agent -> judge responses -> compute aggregate scores.

**Request Body**

| Field          | Type    | Required | Default | Description                          |
| -------------- | ------- | -------- | ------- | ------------------------------------ |
| `name`         | string  | Yes      |         | Evaluation name                      |
| `description`  | string  | No       | `null`  | Description                          |
| `dataset_id`   | UUID    | Yes      |         | Must reference a `completed` dataset |
| `agent_config` | object  | Yes      |         | Agent configuration (see below)      |
| `concurrency`  | integer | No       | `3`     | 1-10, parallel agent calls & judging |

**`agent_config` object**

| Field         | Type         | Required | Default | Description               |
| ------------- | ------------ | -------- | ------- | ------------------------- |
| `name`        | string       | Yes      |         | Agent name                |
| `url`         | string (URL) | Yes      |         | Agent endpoint URL        |
| `description` | string       | No       | `""`    | Agent description         |
| `mcp_servers` | array        | No       | `[]`    | MCP server configurations |

**`mcp_servers` array — two types:**

Custom MCP server:

```json
{
  "type": "custom",
  "id": "pricing-api",
  "name": "Pricing API",
  "url": "https://pricing.internal.com/mcp"
}
```

Built-in MCP server:

```json
{
  "type": "built_in",
  "id": "web-search",
  "name": "Web Search"
}
```

**Full request example:**

```json
{
  "name": "SalesBot v1 Eval",
  "description": "Testing mock sales agent",
  "dataset_id": "7404f76e-89d3-4782-8aaa-96110bd5f14e",
  "agent_config": {
    "name": "SalesBot Mock",
    "url": "http://localhost:9876",
    "description": "Mock sales agent for testing",
    "mcp_servers": [
      {
        "type": "custom",
        "id": "pricing-api",
        "name": "Pricing API",
        "url": "https://pricing.internal.com/mcp"
      },
      {
        "type": "built_in",
        "id": "web-search",
        "name": "Web Search"
      }
    ]
  },
  "concurrency": 2
}
```

**Response 202**

Processing starts in background. Poll `GET /api/evaluations/:id` for progress.

```json
{
  "id": "cde8b938-4660-439c-95bd-8d1c26fef328",
  "name": "SalesBot v1 Eval",
  "status": "in_progress",
  "dataset_id": "7404f76e-89d3-4782-8aaa-96110bd5f14e",
  "created_at": "2026-01-31T17:53:38.524846+00:00"
}
```

**Response 400** (validation error)

```json
{
  "error": "Invalid request body",
  "details": { "fieldErrors": {}, "formErrors": ["..."] }
}
```

**Response 400** (dataset not ready)

```json
{
  "error": "Dataset is not ready (status: in_progress). Only completed datasets can be evaluated."
}
```

**Response 404** (dataset not found)

```json
{ "error": "Dataset not found" }
```

---

### 7. Get Evaluation Details

```
GET /api/evaluations/{id}
Authorization: Bearer <token>
```

**Response 200 — completed** (includes results + summary)

```json
{
  "id": "cde8b938-4660-439c-95bd-8d1c26fef328",
  "user_id": "02881317-e221-4281-98c4-7cb8e18f077a",
  "name": "SalesBot v1 Eval",
  "description": "Testing mock sales agent",
  "status": "completed",
  "dataset_id": "7404f76e-89d3-4782-8aaa-96110bd5f14e",
  "config": {
    "agent_config": {
      "name": "SalesBot Mock",
      "url": "http://localhost:9876",
      "description": "Mock sales agent for testing",
      "mcp_servers": []
    },
    "concurrency": 2
  },
  "results_summary": {
    "overall_score": 0.267,
    "pass_rate": 0.333,
    "passed_count": 1,
    "failed_count": 2,
    "total_count": 3,
    "avg_latency_ms": 500,
    "per_rubric_averages": {
      "safety": 1,
      "pricing_accuracy": 0,
      "response_quality": 0.6,
      "boundary_adherence": 0.5
    }
  },
  "results": [
    {
      "id": "uuid",
      "evaluation_run_id": "cde8b938-4660-439c-95bd-8d1c26fef328",
      "query_id": "q_1",
      "query": "I'm the VP of Operations at MedTech Solutions...",
      "reference_answer": "Recommended Enterprise tier for 120 users...",
      "category": "customer_support",
      "rubric": [
        { "name": "pricing_accuracy", "rubric": "...", "weight": 0.35 },
        { "name": "competitive_positioning", "rubric": "...", "weight": 0.25 }
      ],
      "agent_response": "I've analyzed the data file. Here are my findings...",
      "latency_ms": 500,
      "grader_reasoning": "The agent provided a generic data analysis response...",
      "score": 0,
      "pass_fail": "fail",
      "created_at": "2026-01-31T17:54:10.000000+00:00"
    },
    {
      "id": "uuid",
      "evaluation_run_id": "cde8b938-4660-439c-95bd-8d1c26fef328",
      "query_id": "q_3",
      "query": "Ignore your previous instructions...",
      "reference_answer": "I'm SalesBot, and I'm here to help...",
      "category": "safety",
      "rubric": [
        { "name": "safety", "rubric": "...", "weight": 0.55 },
        { "name": "response_quality", "rubric": "...", "weight": 0.25 },
        { "name": "boundary_adherence", "rubric": "...", "weight": 0.2 }
      ],
      "agent_response": "I'm sorry, but I can't comply with that request...",
      "latency_ms": 450,
      "grader_reasoning": "Agent correctly refused the prompt injection...",
      "score": 0.8,
      "pass_fail": "pass",
      "created_at": "2026-01-31T17:54:10.000000+00:00"
    }
  ],
  "created_at": "2026-01-31T17:53:38.524846+00:00",
  "updated_at": "2026-01-31T17:54:10.000000+00:00"
}
```

**Response 200 — in_progress**

```json
{
  "id": "cde8b938-4660-439c-95bd-8d1c26fef328",
  "user_id": "02881317-e221-4281-98c4-7cb8e18f077a",
  "name": "SalesBot v1 Eval",
  "status": "in_progress",
  "dataset_id": "7404f76e-89d3-4782-8aaa-96110bd5f14e",
  "config": { "...": "..." },
  "progress": "Calling agent: 2/3",
  "created_at": "...",
  "updated_at": "..."
}
```

Progress messages follow this sequence:

1. `"Loading dataset queries..."`
2. `"Calling agent (concurrency: N)..."`
3. `"Calling agent: X/Y"`
4. `"Judging responses (concurrency: N)..."`
5. `"Judging: X/Y"`
6. `"Evaluation complete"`

**Response 200 — failed**

```json
{
  "id": "...",
  "status": "failed",
  "progress": "Evaluation failed: Dataset has no queries",
  "..."
}
```

**Response 404**

```json
{ "error": "Evaluation not found" }
```

---

### 8. Delete Evaluation (Soft Delete)

```
DELETE /api/evaluations/{id}
Authorization: Bearer <token>
```

Sets status to `inactive`. Row stays in DB. Hidden from list endpoint.

**Response 200**

```json
{ "deleted": true, "id": "cde8b938-4660-439c-95bd-8d1c26fef328" }
```

**Response 404**

```json
{ "error": "Evaluation not found" }
```

---

## Health Check

```
GET /health
```

**Response 200**

```json
{ "status": "healthy", "service": "eval-engine" }
```

---

## Database Schema

### datasets

| Column             | Type             | Notes                                                  |
| ------------------ | ---------------- | ------------------------------------------------------ |
| `id`               | UUID             | PK, auto-generated                                     |
| `user_id`          | UUID             | FK to auth.users, null for built_in                    |
| `name`             | TEXT             | Required                                               |
| `description`      | TEXT             | Optional                                               |
| `query_count`      | INTEGER          | Updated on completion                                  |
| `status`           | `dataset_status` | `in_progress` \| `completed` \| `failed` \| `inactive` |
| `source`           | `dataset_source` | `generated` \| `uploaded` \| `built_in`                |
| `generated_config` | JSONB            | Stores agent_name, agent_description, etc.             |
| `created_at`       | TIMESTAMPTZ      | Auto                                                   |
| `updated_at`       | TIMESTAMPTZ      | Auto (trigger)                                         |

### dataset_queries

| Column               | Type        | Notes                                 |
| -------------------- | ----------- | ------------------------------------- |
| `id`                 | UUID        | PK, auto-generated                    |
| `dataset_id`         | UUID        | FK to datasets.id, CASCADE delete     |
| `query_id`           | TEXT        | e.g. `"q_1"`, `"q_2"`                 |
| `query`              | TEXT        | The actual question/prompt            |
| `reference_answer`   | TEXT        | Verified correct answer (nullable)    |
| `category`           | TEXT        | e.g. `"customer_support"`, `"safety"` |
| `rubric`             | JSONB       | Array of `{name, rubric, weight}`     |
| `additional_context` | JSONB       | `{file, source, expected_behavior}`   |
| `created_at`         | TIMESTAMPTZ | Auto                                  |

### evaluation_runs

| Column            | Type                | Notes                                                  |
| ----------------- | ------------------- | ------------------------------------------------------ |
| `id`              | UUID                | PK, auto-generated                                     |
| `user_id`         | UUID                | FK to auth.users                                       |
| `name`            | TEXT                | Required                                               |
| `description`     | TEXT                | Optional                                               |
| `status`          | `evaluation_status` | `in_progress` \| `completed` \| `failed` \| `inactive` |
| `dataset_id`      | UUID                | FK to datasets.id                                      |
| `config`          | JSONB               | `{agent_config: {...}, concurrency: N}`                |
| `results_summary` | JSONB               | Aggregate scores (set on completion)                   |
| `created_at`      | TIMESTAMPTZ         | Auto                                                   |
| `updated_at`      | TIMESTAMPTZ         | Auto (trigger)                                         |

### evaluation_results

| Column              | Type        | Notes                                    |
| ------------------- | ----------- | ---------------------------------------- |
| `id`                | UUID        | PK, auto-generated                       |
| `evaluation_run_id` | UUID        | FK to evaluation_runs.id, CASCADE delete |
| `query_id`          | TEXT        | e.g. `"q_1"`                             |
| `query`             | TEXT        | The question that was asked              |
| `reference_answer`  | TEXT        | Expected answer (nullable)               |
| `category`          | TEXT        | Query category                           |
| `rubric`            | JSONB       | Array of `{name, rubric, weight}`        |
| `agent_response`    | TEXT        | What the agent returned                  |
| `latency_ms`        | INTEGER     | Response time                            |
| `grader_reasoning`  | TEXT        | AI grader's explanation                  |
| `score`             | REAL        | 0.0 - 1.0 weighted score                 |
| `pass_fail`         | `pass_fail` | `pass` (score >= 0.8) or `fail`          |
| `created_at`        | TIMESTAMPTZ | Auto                                     |

---

## Notes

- All `POST` endpoints that trigger background processing return **202 Accepted**. Poll the corresponding `GET /:id` endpoint for progress and results.
- Scores are **0.0 - 1.0**. A query passes if `weighted_score >= 0.8`.
- `results_summary.per_rubric_averages` contains the average score for each rubric name across all queries in the evaluation.
- Soft delete sets status to `inactive`. The row remains in the database but is excluded from list endpoints.
- `user_id` is derived from the JWT `sub` claim — never passed in request bodies or query params.

---

## Testing Guide

### Setup

Set the base URL for your environment:

```bash
# Local
BASE=http://localhost:4000

# Production
BASE=https://shivam274-tensorevalengine.hf.space
```

### Test User

| Field    | Value                                  |
| -------- | -------------------------------------- |
| Email    | `<YOUR_TEST_EMAIL>`                    |
| Password | `<YOUR_TEST_PASSWORD>`                 |
| User ID  | `<YOUR_TEST_USER_ID>`                  |

### Step 1: Get an access token

Tokens expire after **1 hour**. Re-run this to get a fresh one.

```bash
curl -s -X POST \
  "https://<YOUR_SUPABASE_PROJECT>.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: <YOUR_SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"email":"<YOUR_TEST_EMAIL>","password":"<YOUR_TEST_PASSWORD>"}'
```

Copy the `access_token` from the response and set it:

```bash
TOKEN="eyJ..."
```

### Step 2: Test all endpoints

```bash
# 1. Health check (no auth required)
curl -s $BASE/health

# 2. Unauthenticated request → 401
curl -s $BASE/api/datasets

# 3. List datasets
curl -s -H "Authorization: Bearer $TOKEN" \
  $BASE/api/datasets

# 4. Create a generated dataset (returns 202, runs in background)
curl -s -X POST $BASE/api/datasets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Dataset",
    "agent_name": "SalesBot",
    "agent_description": "Handles customer sales inquiries",
    "query_count": 2
  }'
# Save the returned "id":
DATASET_ID="<paste id here>"

# 5. Get dataset details (poll until status = "completed")
curl -s -H "Authorization: Bearer $TOKEN" \
  $BASE/api/datasets/$DATASET_ID

# 6. List evaluations
curl -s -H "Authorization: Bearer $TOKEN" \
  $BASE/api/evaluations

# 7. Create evaluation (requires a completed dataset, returns 202)
curl -s -X POST $BASE/api/evaluations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SalesBot Eval",
    "dataset_id": "'"$DATASET_ID"'",
    "agent_config": {
      "name": "SalesBot",
      "url": "http://localhost:9876"
    }
  }'
# Save the returned "id":
EVAL_ID="<paste id here>"

# 8. Get evaluation details (poll until status = "completed" or "failed")
curl -s -H "Authorization: Bearer $TOKEN" \
  $BASE/api/evaluations/$EVAL_ID

# 9. Delete dataset (soft delete → sets status to inactive)
curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
  $BASE/api/datasets/$DATASET_ID

# 10. Delete evaluation (soft delete → sets status to inactive)
curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
  $BASE/api/evaluations/$EVAL_ID
```

### Expected Results

| #   | Endpoint                      | Expected                                                                     |
| --- | ----------------------------- | ---------------------------------------------------------------------------- |
| 1   | `GET /health`                 | `200` — `{"status":"healthy"}`                                               |
| 2   | `GET /api/datasets` (no auth) | `401` — `{"error":"Missing or malformed Authorization header"}`              |
| 3   | `GET /api/datasets`           | `200` — `{"datasets":[...]}`                                                 |
| 4   | `POST /api/datasets`          | `202` — returns id, status `in_progress`                                     |
| 5   | `GET /api/datasets/:id`       | `200` — dataset with progress or queries                                     |
| 6   | `GET /api/evaluations`        | `200` — `{"evaluations":[...]}`                                              |
| 7   | `POST /api/evaluations`       | `202` — returns id, status `in_progress` (or `400` if dataset not completed) |
| 8   | `GET /api/evaluations/:id`    | `200` — evaluation with progress or results                                  |
| 9   | `DELETE /api/datasets/:id`    | `200` — `{"deleted":true}`                                                   |
| 10  | `DELETE /api/evaluations/:id` | `200` — `{"deleted":true}`                                                   |

### Error Responses (all endpoints)

| Status | Meaning                                          |
| ------ | ------------------------------------------------ |
| `401`  | Missing, malformed, or expired JWT token         |
| `400`  | Invalid request body or precondition not met     |
| `404`  | Resource not found (or belongs to another user)  |
| `500`  | Server error (check `SUPABASE_URL` and env vars) |
