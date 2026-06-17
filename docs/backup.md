# Backup Policy & Procedures Guide

This guide documents the procedures for backing up and restoring the FitMate databases.

---

## 1. Automated Backup Strategies
We recommend configuring backups at the cloud database layer (AWS RDS backups, Supabase snapshot schedules):
* **Retain Range**: 30 days of daily backups.
* **Point-In-Time Recovery (PITR)**: Enable logs to restore state down to specific seconds during disasters.

---

## 2. Integrated Backup Service (NestJS)
The backend includes a local snapshot tool `BackupService` accessible to admins:
* **Functionality**: Backs up core system tables (users, logs, configurations) into JSON snapshots inside the `backend/backups` directory.
* **Admin Endpoint**: `POST /api/admin/backups` triggers backup creation.

---

## 3. Manual Database Backups (pg_dump)
To perform manual command-line backups on your PostgreSQL server:
```bash
pg_dump -U postgres -h localhost -d fitmate -F c -b -v -f fitmate-backup.dump
```

---

## 4. Manual Database Restorations (pg_restore)
To restore a manual pg_dump snapshot to a clean database instance:
```bash
pg_restore -U postgres -h localhost -d fitmate -v fitmate-backup.dump
```
Ensure you run schema generations afterwards to re-sync TS client views:
```bash
npx prisma generate
```
