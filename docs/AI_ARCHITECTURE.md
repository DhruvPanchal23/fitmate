# AI Coach & Food Scanner Architecture

This document describes the design of FitMate's intelligence layer.

---

## 1. AI Coach System
The AI Coach is powered by LLM providers (Gemini, OpenAI) wrapped in a unified interface inside `src/ai/core/ai-pipeline.service.ts`.

* **Memory Engine**: Employs an auto-evolving user memory system. Prior interactions are summarized and embedded to build persistent behavioral context.
* **Fallback Logic**: If connection parameters are absent or third-party APIs fail, the AI service falls back to local heuristic engines, preserving system usability.

---

## 2. Food Image Scanner
The scanner translates food image inputs into structured macro lists:
1. **Upload**: User uploads an image via the mobile app (`POST /api/ai/scan`).
2. **Visual Processing**: Image is parsed by visual LLMs to identify specific foods and portion size estimations.
3. **Food Matcher**: The output is queried against the system's Postgres `Food` catalog (`src/ai/matcher/food-matching-engine.service.ts`) to match verified database item IDs.
4. **Validation**: User reviews and confirms the matched nutrition elements before logging them into the SQL ledger.

---

## 3. Cost Optimization & Semantic Caching
To maintain commercial profitability:
* **Semantic Prompt Caching**: Queries are evaluated against a redis/local CacheEntry database. Identical or highly similar questions fetch cached outputs, avoiding external LLM API costs.
* **Token Observability**: Endpoints monitor input/output token usage and log cumulative dollar costs (`GET /api/ai/token-usage` and `GET /api/ai/cost`).
