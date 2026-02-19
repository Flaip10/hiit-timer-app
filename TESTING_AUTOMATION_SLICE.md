# Testing Automation Slice (Workouts)

This slice automates a small part of your test plan so you can evaluate the approach before scaling.

## Covered test plan IDs

- `WORK-001` (active/E2E): open Workouts list
- `WORK-017` (active/E2E partial): start "Create new" draft flow
- `WORK-017` + `WORK-025` (unit): create and commit draft in store logic
- `WORK-005` + `WORK-006` (unit): toggle favorite on/off
- `WORK-028` (unit): draft is not persisted in storage

## Files

- Unit: `src/state/__tests__/useWorkouts.workouts-plan.test.ts`
- E2E: `.maestro/workouts-work-001-017.yaml`

## Setup

Install test tools (if not installed yet):

```bash
npm install -D jest jest-expo @types/jest
```

Install Maestro CLI (if not installed yet):

```bash
brew install maestro
```

## Run

```bash
npm run test:unit:workouts
npm run test:e2e:workouts
```

## Notes

- The Maestro flow expects app text in English.
- If your app id differs, update `appId` in `.maestro/workouts-work-001-017.yaml`.
