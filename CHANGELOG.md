# Changelog

All notable changes to this project will be documented in this file.

---

## Unreleased

### Added

- Add SQLite persistence for workouts, workout sessions and exercise definitions using Drizzle and Expo SQLite
- Add exercise definitions as a first-class workout concept with system seeding, user-created definitions, availability settings and reusable workout references
- Add exercise definition list and detail screens with search, create, edit and workout block suggestion flows
- Add one-time migration from the previous AsyncStorage workout and history stores
- Add workout version tracking so historical sessions keep stable workout snapshots after edits or deletion
- Add React Query data hooks for workout, session and exercise definition reads, mutations and cache invalidation
- Add Jest setup, service-focused integration tests, seed helpers and mapper unit tests for the SQLite data layer

### Changed

- Improve workout and workout session repositories, services and tests to support exercise definitions and stronger version-based data integrity
- Add a main scroll controller for keyboard-aware scrolling, input dropdown coordination and validation target scrolling
- Improve validation feedback by scrolling to the first invalid workout block field
- Replace persisted workout and history Zustand stores with repository-backed data access and a draft-only workout store
- Replace app JSON configuration with variant-aware Expo config and guarded native build scripts
- Replace custom ID generation with `nanoid`

### Fixed

- Fix accent theme structure usage for icon button styling

## [v1.0.1] - 2026-05-08

### Fixed

- Prevent `Stepper` text from clipping under larger font settings by replacing fixed height with flexible minimum height
- Improve Workout Run screen usability when large font/display settings previously pushed exercise details behind the footer

## [v1.0.0] - 2026-05-03

### Added

#### Workout Builder

- Create, edit, search, favorite and delete saved workouts
- Build workouts from blocks, sets, timed exercises and rest periods
- Edit individual workout blocks with validation for sets, exercises, duration and reps
- Start a quick workout without saving it first

#### Guided Timer

- Run structured workouts with work, rest, set-rest and preparation phases
- Pause, resume, skip and end active workouts with deliberate confirmation flows
- Hold to start each block to prevent accidental workout progression
- Show animated phase progress, set progress, current exercise details and upcoming exercises during a session
- Play timing beeps with separate sound cues for step progress and final countdown moments

#### Workout History

- Save completed workout sessions locally
- Browse and search previous workout sessions
- View detailed session summaries with duration, sets, exercises, work time, rest time and paused time
- Reopen saved workouts from session history when the source workout still exists
- Track when a workout has changed since a historical session was completed

#### Sharing & Import

- Export workouts as `.arcw` files for sharing between devices
- Import `.arcw` workout files with validation and user-facing error handling
- Share workout completion cards from finished sessions
- Share saved workouts from the workout summary screen

#### Settings & Personalization

- Switch between light, dark and system theme modes
- Choose between multiple accent colors
- Enable or disable workout sound effects
- Switch the app language between English and Portuguese (Portugal)
- Persist workouts, settings and session history on device

#### App Experience

- Branded Arc Timer icon, splash screen, logo and visual identity
- Drawer navigation for Home, Workouts, History and Settings
- Home screen with quick workout access and recent workout sessions
- Dedicated workout summary screens with overview metrics and block details
- Responsive mobile layouts designed for compact screens and long workout names

[v1.0.0]: https://github.com/filipe-mendes-dev/arc-timer/releases/tag/v1.0.0
[v1.0.1]: https://github.com/filipe-mendes-dev/arc-timer/releases/tag/v1.0.1
