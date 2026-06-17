# Rollback & Version Reversal Procedures

This guide details rollback operations when a bad release is deployed.

---

## 1. Application Code Rollback
If a container release causes crashes or severe regressions:
1. **Revert Tag**: Change target deploy image tag to the last stable release (e.g., `1.0.0-build.54` to `1.0.0-build.53`).
2. **Fast Deploy**: Re-run the deployment pipeline to override the staging/production servers.
3. **Container restart**: Force container replacement on ECS or Kubernetes.

---

## 2. Database Migration Rollback
If schema migrations must be reverted:

> [!CAUTION]
> **Data Loss Risk**: Rollbacks of destructive migrations (like table drops or column type changes) will result in data loss if run on active databases. Ensure you take a manual snapshot before executing any rollbacks.

1. **Find Migration**: Locate the migration name inside `backend/prisma/migrations/`.
2. **Run Rollback Command**:
   ```bash
   npx prisma migrate resolve --rolled-back "20260616120000_migration_name" --schema=schema.prisma
   ```
3. **Restore Data**: If needed, restore specific tables from the pre-deployment snapshot.
