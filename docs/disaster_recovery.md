# Disaster Recovery (DR) Plan

This guide outlines action protocols for database corruptions, server outages, and data breaches.

---

## 1. Outage Classification Levels

| Level | Severity | Scenario | Recovery Objective (RTO) |
| :--- | :--- | :--- | :---: |
| **Tier 1** | Critical | Primary database corruption or AWS RDS zone failure | < 2 hours |
| **Tier 2** | High | API Service server crash or memory leak | < 15 minutes |
| **Tier 3** | Medium | Third-party provider outage (OpenAI, Gemini keys) | < 1 hour |

---

## 2. Recovery Procedures

### Scenario A: Database Corruption (Tier 1)
1. **Freeze Traffic**: Direct load balancers to route requests to a maintenance landing page.
2. **Retrieve Snapshot**: Locate the latest uncorrupted nightly database snapshot from AWS RDS or GCP backups.
3. **Spin up instance**: Restore the snapshot to a new DB instance.
4. **Update config**: Update `DATABASE_URL` in backend configurations.
5. **Re-route traffic**: Restore routing to the production app.

### Scenario B: API Service Outage (Tier 2)
1. **Inspect Logs**: Access Winston/Sentry crash details.
2. **Execute Reboot**: Restart Docker container processes.
3. **Container Rollback**: If the failure is due to a bad release, execute the Rollback procedure immediately.

### Scenario C: AI Provider Outage (Tier 3)
1. **Fallback checks**: Ensure the backend falls back gracefully to localized recommendation engines.
2. **Admin Config**: Toggle the feature flag to redirect traffic or throttle LLM requests until API status is restored.
