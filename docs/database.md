# Database Architecture & Schema Design

FitMate uses PostgreSQL mapped by Prisma ORM. The schema file is located at `backend/schema.prisma`.

---

## 1. Entity Relationship Overview
The system centers around the `User` model, with cascading relationships to track user metrics:

```mermaid
erDiagram
    User ||--o1 UserProfile : has
    User ||--o{ GoalHistory : tracks
    User ||--o{ Meal : logs
    User ||--o{ WaterLog : logs
    User ||--o{ SupplementLog : logs
    User ||--o{ ExerciseLog : logs
    User ||--o{ TravelSession : initiates
    User ||--o{ MealPlan : activates
    Meal ||--o{ MealItem : contains
    MealPlan ||--o{ MealPlanDay : contains
    MealPlanDay ||--o{ MealPlanMeal : schedules
```

---

## 2. Key Tables & Models

### User & Profile
* **User**: Base credentials table (`email`, `passwordHash`, status flags).
* **UserProfile**: Health attributes (`age`, `height`, `weight`, `activityLevel`, `goal`, `dietPreference`, `allergies`).

### Tracking Ledgers
* **Meal & MealItem**: Tracks consumed food items, sizes, and specific macro weights.
* **WaterLog & SupplementLog**: Tracks daily hydration (`amount`, `unit`) and supplement intakes.
* **ExerciseLog**: Logs activity names, durations, and estimated calories burned.

### Travel & Compensation
* **TravelSession**: Tracks flight destinations and travel duration.
* **CompensationPlan**: Linked to travel sessions; stores calculated recovery targets.

---

## 3. Cascade Delete Configurations
All models tied to user accounts are configured with `onDelete: Cascade` at the Prisma relation level.
* *Benefit*: Deleting a user account (e.g. during GDPR purge requests or demo environment rollbacks) automatically purges all profiles, meals, travel logs, and notification histories from the system ledger, preventing orphaned records.
