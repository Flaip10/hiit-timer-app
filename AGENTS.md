# AGENTS.md — Arc Timer (Expo / React Native) Project Rules

You are working in a React Native / Expo Router project (Arc Timer). Follow these rules strictly.

---

## 1) Communication & Workflow

- Prefer **clarity and correctness** over speed.
- Do **not** propose large refactors unless explicitly requested.
- When code changes are needed, provide them **file-by-file**.
- Do **not** create or update tests unless explicitly requested.
- If **no changes** are needed for a file, reply exactly:
    - `no changes to the <file_name>`

---

## 2) TypeScript Rules (Strict)

- **Never use `any`.**
- Prefer **interfaces over type aliases** unless there is a concrete reason.
- Keep types explicit when they prevent ambiguity.
- Avoid unnecessary generics. Use generics only when the implementation preserves, transforms, or links caller-specific types; prefer a concrete minimal interface when the code only needs a fixed subset of fields.
- Avoid unnecessary type assertions (`as X`)—only use them when they truly change inference.
- Boolean naming must be semantic:
    - `isX` (state/classification), `hasX` (presence), `canX` / `shouldX` (policy), `wasX` / `didX` (historical).
- Avoid unnecessary export/import duplication:
    - Do not export a constant only to immediately re-import or re-export it from another file.
    - Do not create wrapper files that only alias a singleton from another module unless they are preserving a deliberate public API.
    - Prefer one clear module boundary. Export factories for dependency injection/testing when useful, and export app singletons only from the boundary where consumers should import them.
    - Barrel files (`index.ts`) should expose intentional public APIs only; do not use them to mirror every internal symbol.

---

## 2.1) Comments

- Keep comments **short and single-line**. The code should be clear enough on its own.
- Use comments only to provide context that the code cannot express: *why* a non-obvious choice was made, or an important caveat (e.g. a platform gotcha, a workaround, a performance reason).
- Do **not** restate what the code does — if a comment would just paraphrase the next line, delete it.

---

## 3) React / React Native Rules

- Prefer **arrow functions** wherever possible.
- Avoid inline style objects in JSX:
    - ❌ `style={[st.x, { marginTop: 12 }]}`
    - ✅ put styles in the styles file or a hook.
- Keep logic stable and predictable:
    - Don’t change existing logic the user didn’t ask to modify unless you **explicitly call it out** and justify why.
- **Never use multi-line ternaries** — they trigger a TypeScript LSP panic (`semantic tokens: token spans multiple lines`). This applies to JSX, TypeScript expressions, and JSX props:
    - ❌ `{condition ? (\n  <Component />\n) : null}`
    - ✅ `{condition && <Component />}`
    - ✅ extract to a variable or helper component above the return if you need the else branch.
    - ❌ `const x = a\n  ? b\n  : c ? d : undefined`
    - ✅ use `if/else` blocks for multi-branch TypeScript expressions
    - ❌ `style={\n  condition ? st.a : st.b\n}`
    - ✅ `style={condition ? st.a : st.b}` (keep JSX prop ternaries on a single line)

---

## 4) Styling Rules

- React Native styling lives in a **`styles.ts`** file next to the screen/component.
- Styles are imported as:
    - `import { st } from './styles';`
- Do not use `.styles.ts` suffix (unless the project already does in some older areas and you’re not asked to migrate).
- No raw hex colors in components:
    - All colors must be defined in `colors.ts` with meaningful names and referenced via the palette/theme.

---

## 5) State And Persistence

- Durable workout/session persistence belongs in SQLite/Drizzle repositories under `src/db/`.
- Repository factory public methods should be defined inline on the returned repository object, not as separate local functions that are later returned by shorthand. Keep separate local functions only for private helpers shared by multiple methods. Order repository methods by behavior: reads, existence checks, inserts/creates, updates/relinks/detaches, then deletes.
- UI reads and writes for workouts/history should go through TanStack Query hooks under `src/data/`.
- Zustand stores should:
    - Keep state minimal and derived values in selectors when possible.
    - Avoid sorting and heavy computation inside store mutations unless required.
- Persisted stores:
    - Use `partialize` intentionally to avoid persisting transient state (e.g., drafts).
    - Keep migration/merge logic as simple as possible unless there is a proven need.
- Workout draft and active run state should stay transient unless the product behavior explicitly changes.
- Settings may remain persisted in AsyncStorage.

---

## 5.1) Database Migrations

- Never create Drizzle migration files or Drizzle snapshot files by hand.
- Update `src/db/schema.ts`, then use the project’s Drizzle migration generation command.
- If generated SQL needs custom data migration logic, call it out explicitly and keep Drizzle metadata generator-owned.
- Do not read generated migration SQL or snapshot files unless required for a specific migration/debugging task; they are large and waste context.
- The legacy AsyncStorage workout/history migration is one-time and marker-based.
- If the legacy migration marker is absent, migration may reset SQLite workout/session tables before replaying old data.
- Reuse workout versions only when content matches and the version is unowned or belongs to the same workout.

## 5.2) Database Integration Tests

- DB integration tests should primarily test service behavior under `src/db/services/`.
- Keep service integration tests in one file per service unless a split is explicitly requested.
- Structure service integration tests with the service method as the major `describe`, then nested `describe` blocks for the business rule or scenario being protected.
- Avoid nested `describe` blocks that only wrap a single obvious test. Prefer putting the condition in the `it` name unless the nested scenario groups multiple tests or clarifies a meaningful business branch.
- Test names should describe the business invariant, not only the code path. Example: prefer “preserves referenced workout content when content changes” over “calls upsertWorkout with changed content”.
- Keep service methods aligned with business intent. For example, same-identity updates, creating a new identity, and merging two identities should be separate service operations, even if a UI mutation chooses between them.
- TanStack mutations may route the user’s chosen intent to the correct service method, but DB business rules and invariants belong in services, not hooks.
- Avoid using a service method as test setup for another service method; that creates circular confidence.
- Arrange existing DB state with seed helpers under `tests/helpers/` that write directly to Drizzle tables.
- Use the service method being tested as the action under test, then assert service-visible results and the DB side effects that are part of that behavior.
- Do not assert DB writes by comparing a row to the object returned from the same service call. Build expected values from fixtures, explicit inputs, and known clock values, then compare the DB row to those expected values.
- When testing reference-moving behavior, assert the exact seeded row by ID points to the expected target after the action; do not rely only on aggregate “contains/does not contain” checks.
- Deduplicate mechanics, not meaning: helper functions may hide repetitive DB query/assertion noise, but should not hide the business scenario being tested.
- Keep seed helpers focused and reusable by domain, e.g. workout, workout session, and exercise definition seed helpers.
- Repository-specific tests, when added, should be narrower and focus on CRUD/query behavior only.

---

## 6) Animations

- Prefer **react-native-reanimated** for animations.
- Avoid `Animated` (RN core) unless explicitly requested or required.
- Keep animations subtle, predictable, and lightweight.
- For repeating animations, avoid visible re-sync artifacts (no “phase resets” that look like jumps).

---

## 7) Navigation (Expo Router)

- Back handling should be deliberate:
    - If blocking system back/gesture back, do it via a reusable hook.
    - Do not block in-app navigation buttons unless explicitly requested.
- Prefer focused listeners (`useFocusEffect`) when behavior should only apply on the active screen.

---

## 8) Git / Commits

- Commit messages must use conventional commits:
    - `feat: ...`
    - `fix: ...`
    - `refactor: ...`
    - `chore: ...`
    - `docs: ...`
    - `test: ...`
- Keep commit subjects short and specific.

---

## 9) Localization (i18n)

- The app must support **Portuguese**.
- Prefer a standard i18n approach (e.g., i18next / expo-localization) and keep translation keys structured.
- All user-facing strings should be translatable (no hard-coded UI strings in components).

---

## React async bootstraps: avoid "isMounted" / setState-after-unmount guards

- Do NOT use `let isMounted = true` / `if (isMounted)` patterns to guard async effects.
- Do NOT store global bootstrap readiness in component local state when a global store exists.

Preferred patterns:

1. Global bootstrap state (Zustand):
    - Store flags like `isI18nReady`, `isHydrated`, etc. in a store.
    - Update the store from bootstrap code/hook.
    - Gate UI render based on store flags (not local `useState`).

2. Deterministic initialization:
    - If a library provides an init promise (e.g., `initializeI18n()`), await it once and set a store flag.
    - Avoid duplicated initialization by memoizing the init promise at module scope.

3. Only use cancellation when it is real:
    - Use `AbortController` only for cancellable work (fetch, etc.).
    - If work is not cancellable, do not add fake “mounted” guards—move state updates out of React local state.

Allowed exception:

- Local `useState` + mounted guard is acceptable ONLY for screen-level async work that truly unmounts often and cannot be moved to a store.

---

## 10) Don’ts

- Don’t add new dependencies without a clear reason.
- Don’t introduce complex abstractions if a simple approach is correct.
- Don’t “clean up” unrelated code while doing a requested change.

---

## 11) Verification

Before finalizing changes, run:

- `check`

Do not ignore failing checks.
