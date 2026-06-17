# FitMate Workspace Architecture

This document maps out the system architecture of the FitMate codebase.

---

## 1. Codebase Workspace Map
FitMate is structured as a monorepo containing three primary folders:

```text
fitmate/
├── backend/                  # NestJS API Backend (Prisma, calculation engines)
├── apps/
│   ├── admin/                # Vite Admin Portal Dashboard (Tailwind CSS, React)
│   └── mobile/               # React Native Expo Mobile Application
├── shared/
│   └── contracts/            # Common typescript interfaces & request/response types
```

---

## 2. Architecture & Design Patterns
* **NestJS Backend**: Follows modular architecture where each domain (nutrition, auth, admin, profiles, travel) is isolated.
  * **Controllers**: Expose REST endpoints, consume DTOs, and implement Guards.
  * **Services**: Handle business computations.
  * **Repositories**: Inject `PrismaService` to map DB reads/writes.
* **Shared Contracts**: Single source of truth for types. This prevents contract mismatch between the backend and frontends.
* **Repository Pattern**: Prevents Prisma calls from scattering across controller files, isolating query definitions.
* **Feature-First Structure**: Both mobile and admin components group styling, hooks, and services by feature domain rather than technology layer.
