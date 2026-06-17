# Changelog

All notable changes to the **FitMate** project will be documented in this file. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-06-17

### Added
* **Automated Quality Assurance Gates**: Integrates E2E and unit test runners with CI/CD GitHub Actions for Backend, Mobile, and Admin projects.
* **Observability & Telemetry Probes**: Added health check probes (`/api/live`, `/api/ready`, `/api/health`) and `/api/metrics` Prometheus exporter in NestJS.
* **Sentry Error Tracking**: Integrated global Sentry service with support for user ID tagging, request mapping, and release tracking.
* **Database Seeding & Recovery checks**: Added dynamic seeding (`npm run seed`) and automated backup-restore verification script.
* **Developer Diagnostics**: Custom environment validators and API contract validators.

### Changed
* **NestJS DI Resolution**: Fixed a dependency injection bug in the AdminModule by importing the AuthModule directly to resolve the SessionService provider.
* **Seed Typings**: Corrected database model definitions in `seed.ts` (e.g. mapping `travelLog` to `travelSession`) to achieve TypeScript compile-clean status.

### Fixed
* Fixed a TypeScript type check issue in calculation mocks by including default values (`currency: 'USD'`).
