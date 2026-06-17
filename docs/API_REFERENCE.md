# API Reference & Route Matrix

FitMate endpoints are structured under the `/api` prefix. Swagger documentation is available at `/docs`.

---

## 1. Authentication (`/api/auth`)
* `POST /api/auth/register` - Create user account.
* `POST /api/auth/login` - Authenticate user, returns access token.
* `POST /api/auth/refresh` - Rotate session refresh token.
* `POST /api/auth/logout` - Invalidate current session.
* `GET /api/auth/sessions` - List active user session IDs.
* `DELETE /api/auth/sessions/:id` - Revoke session.

---

## 2. Profile & Goals (`/api/profile`)
* `GET /api/profile` - Retrieve active user profile metrics.
* `PATCH /api/profile` - Modify profile attributes (triggers goal recalculations).
* `POST /api/profile/body-measurement` - Log body weight and stats.
* `GET /api/profile/progress/weight` - Retrieve historical weight log array.

---

## 3. Nutrition & Tracking (`/api/nutrition`)
* `POST /api/nutrition/meal` - Log user meal item.
* `GET /api/nutrition/meals` - Retrieve user logged meals history.
* `DELETE /api/nutrition/meal/:id` - Delete meal log entry.
* `POST /api/nutrition/water` - Log water intake volume.
* `POST /api/nutrition/supplement` - Log supplement dosage.
* `GET /api/nutrition/today` - Retrieve today's calories/macros summary.

---

## 4. AI Coach & Scanner (`/api/ai`)
* `POST /api/ai/scan` - Process food photo image to match nutrition items.
* `POST /api/ai/chat` - Dispatch chat prompt to AI Coach.
* `GET /api/ai/token-usage` - Retrieve total token counts for auditing.
* `GET /api/ai/cost` - Fetch cumulative dollar cost of AI integrations.

---

## 5. Travel & Compensation (`/api/travel`)
* `POST /api/travel/start` - Initiate travel mode.
* `POST /api/travel/end` - Terminate session (generates caloric compensation plan).
* `GET /api/travel/recovery` - View recommended macro and exercise reductions.

---

## 6. System Telemetry (`/api`)
* `GET /api/live` - Check if server is running (`200 OK`).
* `GET /api/ready` - Check if database server is connected (`200 OK` or `503 Service Unavailable`).
* `GET /api/health` - Retrieve detailed sub-health logs.
* `GET /api/metrics` - Fetch prometheus monitoring metrics.
