# Deployment Guide

This guide details the deployment of **FitMate** to production environments.

---

## 1. Prerequisites
* Node.js v20+ (running on server)
* PostgreSQL v14+ (hosted service like AWS RDS, Supabase, or GCP Cloud SQL)
* Docker & Docker Compose (optional for container deployments)

---

## 2. Environment Variables Configuration
Duplicate the `production.env.example` file to `.env` in your deploy directory:
```bash
cp production.env.example .env
```
Ensure you update the following parameters:
* `DATABASE_URL`: Must include connection security flags.
* `JWT_SECRET`: Generate a secure random signing secret.
* `SENTRY_DSN` & `GEMINI_API_KEY`: Supply credentials.

---

## 3. Database Migration Deployment
Before launching the server, execute all schema migrations:
```bash
npx prisma migrate deploy --schema=schema.prisma
```
*(Optional)* Seed the database with default profiles and admin roles:
```bash
npm run seed
```

---

## 4. Building & Starting the App

### Standard Node Server
1. Build compiled javascript assets:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start:prod
   ```

### Docker Container Deployment
Use the included Dockerfile to package the application context:
```bash
docker build -t fitmate-backend:1.0.0 .
docker run -d -p 3000:3000 --env-file .env fitmate-backend:1.0.0
```

---

## 5. Telemetry & Probes Setup
Configure your load balancer / orchestration engine (Kubernetes, ECS) to query:
* **Liveness Probe**: `GET /api/live` (Timeout: 2s, Period: 10s)
* **Readiness Probe**: `GET /api/ready` (Timeout: 5s, Period: 15s)
* **Detailed Health**: `GET /api/health`
* **Metrics Scraper**: `GET /api/metrics`
