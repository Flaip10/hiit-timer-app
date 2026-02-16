# AGENTS.md — Arc Timer (Expo / React Native) Project Rules

You are working in a React Native / Expo Router project (Arc Timer). Follow these rules strictly.

---

## 1) Communication & Workflow

- Prefer **clarity and correctness** over speed.
- Do **not** propose large refactors unless explicitly requested.
- When code changes are needed, provide them **file-by-file**.
- If **no changes** are needed for a file, reply exactly:
    - `no changes to the <file_name>`

---

## 2) TypeScript Rules (Strict)

- **Never use `any`.**
- Prefer **interfaces over type aliases** unless there is a concrete reason.
- Keep types explicit when they prevent ambiguity.
- Avoid unnecessary type assertions (`as X`)—only use them when they truly change inference.
- Boolean naming must be semantic:
    - `isX` (state/classification), `hasX` (presence), `canX` / `shouldX` (policy), `wasX` / `didX` (historical).

---

## 3) React / React Native Rules

- Prefer **arrow functions** wherever possible.
- Avoid inline style objects in JSX:
    - ❌ `style={[st.x, { marginTop: 12 }]}`
    - ✅ put styles in the styles file or a hook.
- Keep logic stable and predictable:
    - Don’t change existing logic the user didn’t ask to modify unless you **explicitly call it out** and justify why.

---

## 4) Styling Rules

- React Native styling lives in a **`styles.ts`** file next to the screen/component.
- Styles are imported as:
    - `import { st } from './styles';`
- Do not use `.styles.ts` suffix (unless the project already does in some older areas and you’re not asked to migrate).
- No raw hex colors in components:
    - All colors must be defined in `colors.ts` with meaningful names and referenced via the palette/theme.

---

## 5) State Management (Zustand)

- Zustand stores should:
    - Keep state minimal and derived values in selectors when possible.
    - Avoid sorting and heavy computation inside store mutations unless required.
- Persisted stores:
    - Use `partialize` intentionally to avoid persisting transient state (e.g., drafts).
    - Keep migration/merge logic as simple as possible unless there is a proven need.

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
