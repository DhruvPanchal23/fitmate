# Developer Contribution Guidelines

Welcome to the **FitMate** development team! Follow these practices when proposing code changes:

---

## 1. Branch Naming Protocols
Create branches using semantic prefixes:
* `feature/` for new capabilities (e.g. `feature/user-streaks`)
* `bugfix/` for resolving issues (e.g. `bugfix/admin-session-di`)
* `chore/` for environment/package upgrades (e.g. `chore/upgrade-jest`)

---

## 2. Commit Message Standards
We follow Conventional Commits:
```text
feat(nutrition): add water logging quick-button
fix(admin): resolve session service di resolution crash
test(goal-engine): add mock calculation coverage
```

---

## 3. Testing Requirements
* **Unit Tests**: Any modification to calculation engines (`src/profile/goal-engine/`, `src/nutrition/`, `src/travel/`, `src/analytics/`, `src/meal-planner/`, `src/ai/`) must include matching `.spec.ts` unit tests.
* **Coverage**: Ensure that new engines maintain >80% code coverage. Run coverage checks with:
  ```bash
  npm run test:cov
  ```

---

## 4. Pull Request Verification Gates
Before submitting a PR:
1. Ensure all code compiles cleanly:
   ```bash
   npx tsc --noEmit
   ```
2. Run standard formatters.
3. Validate that the respective CI pipeline completes successfully on GitHub.
