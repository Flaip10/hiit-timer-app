# ARC Timer

![ARC Timer banner](./assets/readme/readme_image.png)

ARC Timer is a React Native HIIT workout app built with Expo and Expo Router. It lets you create interval workouts, run them with a guided timer, save workout history, and import or export workouts with a custom `.arcw` file format.

## Features

- Create and edit workouts composed of blocks, sets, exercises, and rest periods
- Start a quick workout flow without saving a workout first
- Run workouts with a dedicated timer screen and audio cues
- Persist workouts, settings, and session history with Zustand + AsyncStorage
- Mark workouts as favorites
- Import and export workouts via `.arcw` files
- Support English and Portuguese (`pt-PT`)
- Switch theme, accent color, and sound preferences

## Stack

- Expo 54
- React Native 0.81
- React 19
- Expo Router
- TypeScript
- Zustand
- i18next / react-i18next
- react-native-reanimated

## Project Structure

```text
app/                  Expo Router routes
src/components/       Shared UI, layout, modal, and navigation components
src/screens/          Screen implementations
src/core/             Timer engine, entities, import/export, workout logic
src/state/            Zustand stores
src/theme/            Theme, palette, typography, style helpers
src/i18n/             Localization setup and translation resources
assets/               Icons, splash assets, sounds, generated branding
scripts/              Local maintenance and asset generation scripts
```

## Requirements

Before running the project, make sure you have:

- Node.js with `npm`
- Xcode and CocoaPods for iOS development
- Android Studio / Android SDK for Android development
- Expo CLI tooling available through `npx expo`

This repo already contains `ios/` and `android/` directories, so it is currently set up as a prebuilt Expo app rather than a pure managed-only project.

## Getting Started

```bash
npm install
npm run start
```

Useful platform commands:

```bash
npm run ios
npm run android
npm run web
```

## Scripts

- `npm run start` starts the Expo dev server
- `npm run ios` runs the iOS app on a device/simulator
- `npm run android` runs the Android app on a device/emulator
- `npm run web` starts the web target
- `npm run lint` runs ESLint for `.ts` and `.tsx`
- `npm run typecheck` runs TypeScript without emitting files
- `npm run assets:classic` regenerates branded icon/splash assets under `assets/generated/classic`
- `npm run cleaner` reinstalls dependencies and regenerates native folders
- `npm run cleaner:hard` performs a deeper cleanup, including removing `node_modules`
- `npm run prebuild:clean` removes native folders and runs a clean Expo prebuild

## App Flow

The main user flows in the current app are:

1. Home screen with quick access and recent sessions
2. Workouts screen to create, import, search, favorite, edit, and delete workouts
3. Block editor flow for building workout structure
4. Workout run screen with timer phases, controls, and completion tracking
5. History screens for reviewing past sessions
6. Settings screen for theme, accent, sound, and language preferences

## Workout Model

At the core of the app, a workout is structured like this:

- `Workout`
  - `id`
  - `name`
  - `blocks`
  - `updatedAtMs`
  - optional `isFavorite`
- `WorkoutBlock`
  - `id`
  - optional `title`
  - `sets`
  - `restBetweenSetsSec`
  - `restBetweenExercisesSec`
  - `exercises`
- `Exercise`
  - `id`
  - optional `name`
  - `mode`: `time` or `reps`
  - `value`
  - optional `tempo`

Completed runs are stored as workout session snapshots, so history keeps the workout state as it existed when the session finished.

## State and Persistence

The app uses Zustand stores for local state:

- `src/state/useWorkouts.ts` stores saved workouts and the current draft workout flow
- `src/state/stores/useWorkoutHistory.ts` stores completed workout sessions
- `src/state/useSettingsStore.ts` stores sound, theme, and accent preferences

Persisted state is backed by AsyncStorage.

## Localization

Localization is initialized in `src/i18n/index.ts` with:

- English: `src/i18n/resources/en.ts`
- Portuguese (Portugal): `src/i18n/resources/ptPT.ts`

The app resolves an initial language on bootstrap and exposes language switching from the settings screen.

## Routing

Routes are defined with Expo Router under `app/`, including:

- `app/(drawer)/` for the main drawer-based area
- `app/workouts/` for workout details and editing
- `app/history/` for session details
- `app/run/` for the active workout run flow

## Import / Export

Workout export uses a custom file format:

- Extension: `.arcw`
- Kind: `arc-timer/workout`
- MIME type: `application/vnd.arctimer.workout+json`

Exports are created from the current workout data and shared through the native share sheet. Imports are read via the document picker and validated before being loaded into the draft workflow.

## Timer Engine

The timer logic lives in `src/core/timer/`. The engine is step-based and uses scheduled boundaries for timing accuracy, while UI countdown updates are aligned separately from the core transition logic.

## Styling and Theming

The app uses a custom theme system under `src/theme/` with:

- semantic colors and palette accents
- typography bootstrapped with Expo fonts
- a theme provider that supports light, dark, and system preference

## Notes for Contributors

- The codebase is TypeScript-first
- UI strings should remain translatable
- Styling is generally colocated with screens/components
- The project uses path aliases such as `@src`, `@components`, `@state`, and `@core`

## Build Configuration

- App config: `app.json`
- EAS config: `eas.json`
- Babel aliases: `babel.config.js`

Current app identifiers:

- iOS bundle ID: `com.mendesfilipedev.arctimerapp`
- Android package: `com.mendesfilipedev.arctimerapp`

## License

No license file is currently included in this repository.
