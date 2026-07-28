---
baseline_commit: 3ae498dc03620c39a69f37577aefce9faf9b7ba7
---

# Story 7.1: Toggle de tema claro/oscuro

Status: review

## Story

As a user,
I want to switch between light and dark theme from Settings,
so that I can use the app comfortably regardless of lighting or preference.

## Acceptance Criteria

1. **Given** I am on Settings **When** I tap the theme toggle **Then** the app's appearance switches between light and dark instantly, with no page reload and no confirm step (FR-31)
2. **Given** I switch themes **When** I return on a later visit on the same device **Then** my choice persists via `localStorage` — no server round-trip, no cross-device sync (FR-31)
3. **Given** the theme toggle state changes **When** using a screen reader **Then** the change is announced ("Tema oscuro activado" / "Tema claro activado" — the epics text only gives the dark-activation string verbatim; the light-activation string is this story's own symmetric completion, not a separate PRD requirement)
4. **Given** Settings **When** I view it **Then** the existing content-policy edit entry points (terms/privacity/aboutUs) are still present alongside the new toggle (FR-32) — for **every** user, not only admin (see Task 6's note on why this requires restructuring, not just adding a switch)
5. **Given** the dark palette **When** applied **Then** header/footer flip polarity (white bg/black text) while brand chrome remains the highest-contrast element in both themes
6. **Given** the theme is applied **When** the page first loads (including a hard refresh) **Then** it is applied before first paint — no flash of the wrong theme (UX-DR6; a real requirement even though it isn't phrased as its own AC line in the epics file)

## ⚠️ Scope boundary — read before starting

Epic 7 splits deliberately into three sequential stories: **7.1 (this story)** builds the toggle mechanism itself; **7.2** ("Sistema de diseño y consolidación visual") wires DESIGN.md's full token set into a real Tailwind `@theme` block and refreshes every card/button/page-shell sitewide; **7.3** is the sitewide accessibility/responsiveness verification pass. **This story does not do 7.2's or 7.3's work.** Concretely:

- Do **not** build out a full `@theme` CSS-variable block mirroring every DESIGN.md token (light and dark) — that's UX-DR1, explicitly Story 7.2's job.
- Do **not** touch card/button styling, gradients, or page shells anywhere except what's strictly needed for AC #5 (header/footer polarity flip).
- **Only the header and footer flip polarity in this story.** The rest of every page (`<main>`'s content area, cards, forms, admin tables, etc.) is not yet dark-mode-adapted anywhere in this codebase — none of it has `dark:` text-color handling. AC #5 only requires brand chrome (header/footer) to flip; it does not require the content canvas to go dark too. **Do not make `<main>` dark in this story** — doing so before 7.2 lands would make every page's existing (light-mode-only) text illegible against a dark background, recreating exactly the bug just fixed in Story 6.1, but sitewide. Leave `<main>`'s content canvas light in both themes for now; only header/footer change.

## Tasks / Subtasks

- [x] Task 1: Read what's already built before writing anything (AC: all)
  - [x] **A latent, undocumented dark-mode bug already exists and must be fixed as part of this story, even though no AC names it explicitly**: `app/layouts/default.vue` has exactly one `dark:` class in the entire codebase — `<main class="flex w-full flex-grow bg-neutral-100 dark:bg-neutral-900">`. Nothing else in this codebase declares a `darkMode` config, a `data-theme` attribute, or any dark-mode plumbing. Tailwind v4's `dark:` variant defaults to `@media (prefers-color-scheme: dark)` when no custom variant is declared — meaning this one class is **already live today**, silently, for any visitor whose OS is in dark mode, completely disconnected from any user choice. This is exactly the bug encountered and fixed ad hoc in Story 6.1's post-review round (a page with no explicit background went dark and illegible for an OS-dark-mode visitor). This story must convert `dark:` from OS-media-query-driven to `data-theme`-attribute-driven (Task 2), which automatically neutralizes the stray behavior — but the `<main>` class itself must also be dealt with per the Scope Boundary note above (remove it / don't let it apply site-wide dark background yet).
  - [x] **No composable, store, or file exists yet for theme state** — confirmed nothing named `useTheme`/`theme.ts`/`colorMode` anywhere. This story creates it from scratch. Follow `app/composables/useToast.ts`'s and `app/composables/useConfirm.ts`'s exact shape (`useState<T>("key", () => default)` — a lightweight Nuxt shared-state composable), **not** a new Pinia store — theme is simple, ephemeral UI preference state, not auth/session state, and the two most recently-built composables in this exact codebase already establish the right-sized pattern for this.
  - [x] **No `localStorage`/`useCookie`/`useState` precedent exists anywhere else in `app/`** (confirmed via full-codebase grep) — this story establishes the first `localStorage` usage in the project. Wrap it in try/catch (SSR-safe: `localStorage` doesn't exist during server render).
  - [x] **Mechanism, per DESIGN.md's own stated requirement (verbatim)**: *"applied via Tailwind's `dark:` variant driven by a `data-theme`/class toggle, not the OS media query alone (FR-31 requires an explicit user-facing toggle)."* Tailwind v4's documented way to do this is a `@custom-variant` override in `main.css`: `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));` — this makes every existing and future `dark:` utility class respond to the `data-theme="dark"` attribute on `<html>` instead of the OS preference, with zero changes needed to how `dark:` classes are written elsewhere.
  - [x] **FOUC prevention (AC #6) cannot be done from a Vue composable or plugin alone** — by the time Vue mounts and a composable's `onMounted` runs, the browser has already painted the page once with the wrong (default/light) theme, causing a visible flash. The standard, correct fix is a raw inline `<script>` injected into the document `<head>` (via `nuxt.config.ts`'s `app.head.script`), which the browser executes synchronously while parsing `<head>`, **before** `<body>`/first paint. This script reads `localStorage` directly (no Vue, no Nuxt composables available at that point) and sets `data-theme` on `document.documentElement` immediately.
  - [x] **Settings page currently has NO functional content for non-admin users** (`app/pages/settings.vue`, 115 lines) — a non-admin visitor sees only the line "Las opciones actuales de perfil se movieron a Perfil." and nothing else; only the `v-else` (admin) branch renders the three content-policy edit forms. AC #4 requires the toggle to be visible to **every** user, not just admin — this means restructuring `settings.vue`'s top-level `v-if="!isAdmin"` / `v-else` split so the toggle sits **outside** that admin/non-admin fork entirely (rendered unconditionally), while the three `ContentEditor`-style forms stay inside the existing `isAdmin`-gated branch, unchanged. This is real template restructuring, not just inserting a new element into the existing admin branch.
  - [x] **No icon is mandated** by DESIGN.md/EXPERIENCE.md for the toggle (neither doc defines a `toggle`/`switch` component token) — EXPERIENCE.md only specifies it as "a two-state switch (claro/oscuro)." Build a simple switch-style control (track + thumb, similar to a native `<input type="checkbox">` styled as a switch, or a two-state button) — this is an implementation-level visual decision, not a spec violation either way. `fa6-solid:sun`/`fa6-solid:moon` are reasonable icon choices if icons are used at all, matching this codebase's dominant `fa6-solid` icon convention.

- [x] Task 2: Wire the `data-theme`-driven `dark:` variant (AC: #5, #6)
  - [x] In `app/assets/css/main.css`, add: `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));` (after the existing `@import "tailwindcss";` line). This is the **only** CSS-file change this story makes — no `@theme` token block (that's Story 7.2, per the Scope Boundary note).
  - [x] In `app/layouts/default.vue`, remove `dark:bg-neutral-900` from the `<main>` class (Task 1's note — leave `<main>` light in both themes for this story; keep `bg-neutral-100` as-is, just drop the stray dark variant).

- [x] Task 3: Build `app/composables/useTheme.ts` (AC: #1, #2, #3)
  - [x] `const theme = useState<'light' | 'dark'>('theme', () => 'light')` — SSR-safe shared state, same pattern as `useToast`'s `toasts` state.
  - [x] `function applyTheme(value: 'light' | 'dark')`: sets `document.documentElement.setAttribute('data-theme', value)` (guarded — only runs client-side, `useState`/composables can execute during SSR where `document` doesn't exist), `localStorage.setItem('elite-hub-theme', value)` (try/catch), updates `theme.value`, and triggers the a11y announcement (Task 5).
  - [x] `function toggleTheme()`: calls `applyTheme(theme.value === 'dark' ? 'light' : 'dark')`.
  - [x] `function initTheme()`: client-only, reads `localStorage.getItem('elite-hub-theme')`, sets `theme.value` to match **without** re-writing the DOM attribute or localStorage (the pre-paint inline script, Task 4, already applied the correct `data-theme` attribute before Vue even mounted — this function only needs to sync the reactive `theme` ref so the Settings toggle UI reflects the already-correct state, not re-apply anything). Call this once, client-side only, early in the app lifecycle (a `.client.ts` plugin, e.g. `app/plugins/theme.client.ts`, calling `useTheme().initTheme()`, is the cleanest place — consistent with this being app-wide init logic, not tied to any one page).

- [x] Task 4: Add the pre-paint inline script (AC: #6)
  - [x] In `nuxt.config.ts`, add to `app.head.script` (create the `app.head` block if it doesn't exist yet — check current `nuxt.config.ts` structure first, it may only have a `modules` array and similar top-level keys today): an inline script, no `src`, containing exactly the minimal logic needed:
    ```js
    (function () {
      try {
        var t = localStorage.getItem('elite-hub-theme');
        if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      } catch (e) {}
    })();
    ```
  - [x] This must NOT be `defer`/`async` and must not be a `.client.ts` Nuxt plugin — it needs to run synchronously in `<head>`, before Nuxt's own hydration JS even downloads, which only `app.head.script` (rendered directly into the SSR'd HTML's `<head>`) guarantees.

- [x] Task 5: Build the toggle control + a11y announcement (AC: #1, #3, #4)
  - [x] In `app/pages/settings.vue`, restructure per Task 1's note: the theme toggle renders unconditionally (outside the `isAdmin` fork), the three content-policy forms stay inside the existing `v-if="isAdmin"` branch.
  - [x] Toggle UI: a switch control, `@click="toggleTheme()"` (from `useTheme()`), reflecting `theme === 'dark'` as its checked/on state. Label it explicitly ("Tema oscuro" or "Modo oscuro") per this app's established accessibility convention (every form field labeled).
  - [x] A11y announcement (AC #3): a visually-hidden (`sr-only`) `<div aria-live="polite">` whose text updates to `"Tema oscuro activado"` / `"Tema claro activado"` whenever the toggle fires — screen readers announce `aria-live="polite"` region changes automatically without needing focus to move, matching the existing `aria-live="polite"` pattern already used by `InfiniteScrollList.vue`'s sentinel.

- [x] Task 6: Flip header/footer polarity in dark mode (AC: #5)
  - [x] `app/components/layout/header.vue`: every element currently `bg-black`/`text-white`/`border-white` needs a `dark:` counterpart flipping to white background / black text (e.g. `bg-black dark:bg-white`, `text-white dark:text-black`, `border-white dark:border-black`) — this touches multiple elements within the file (the `<nav>` root, mobile menu button, nav links, logo area, auth controls), not just one class. Hover states (e.g. `hover:bg-gray-800`) need a sensible dark-mode counterpart too (e.g. `dark:hover:bg-gray-200`) so hover feedback remains visible against the flipped background.
  - [x] `app/components/layout/footer.vue`: same treatment — `bg-black dark:bg-white`, the `text-gray-200` link color needs a dark-mode-appropriate dark counterpart (e.g. `dark:text-gray-700`), `border-t-white dark:border-t-black`.
  - [x] `app/components/userDropdown.vue` (the dropdown menu itself) is **not** in scope for this story — it already renders as a white card regardless of header polarity (its own `bg-white` is independent of the header's black/white flip), and AC #5 only names header/footer, not the dropdown submenu content.

## Dev Notes

### Scope size

Medium — the toggle mechanism itself (composable, pre-paint script, `data-theme` wiring) is a small, self-contained, genuinely new piece of infrastructure (first `localStorage` usage, first `@custom-variant` in this codebase). The header/footer polarity flip (Task 6) is the more mechanically tedious part — not conceptually hard, but touches many individual utility classes across two files.

### Explicit non-goals for this story (Story 7.2/7.3's territory)

- No `@theme` CSS-variable token block (UX-DR1) — Story 7.2.
- No card/button/page-shell consolidation anywhere (UX-DR2/3/4) — Story 7.2.
- No dark-mode adaptation of `<main>`'s content canvas, any card, any form, any admin page — Story 7.2. Only header/footer change in this story (Scope Boundary note above).
- No sitewide accessibility/responsiveness verification pass (UX-DR16/17) — Story 7.3. This story only handles the toggle's own specific a11y requirement (AC #3's announcement) and nothing broader.

### Architecture / conventions this story must follow

- **`localStorage`-only persistence, client-device-scoped** — Architecture's explicit Consistency Convention: never a Usuario/Informacion DB field, no server round-trip, matching AC #2 exactly.
- **No SSR data-fetching for theme state** — matches this codebase's established "client-side-fetch-after-mount" pattern; theme application is even more strictly client-only than data fetching, since it must run before Vue exists at all (Task 4).
- **`useState`-based composable, not a Pinia store** — matching `useToast.ts`/`useConfirm.ts`'s precedent (the two most recently-built, most structurally similar composables in this codebase), not `stores/auth.ts`'s Pinia pattern (which exists for session/auth-specific reasons that don't apply to a simple theme flag).
- **No test framework** — same MVP non-goal as every prior story. Verify manually: toggle the switch in Settings and confirm the header/footer flip instantly with no reload; refresh the page and confirm the theme persists with no visible flash of the wrong theme (hard-refresh a few times to catch any race); open dev tools' localStorage panel and confirm the key/value; use a screen reader (or at minimum inspect the `aria-live` region's DOM updates) to confirm the announcement text changes on toggle; confirm a non-admin user sees the toggle in Settings (previously they saw nothing functional there at all); confirm the admin's three content-policy forms still work unchanged; set the OS to dark mode with the in-app toggle left at its default (light) and confirm the app stays light — proving the OS-media-query-driven bug from Story 6.1 is actually fixed, not just individually patched on one page.

### Project Structure Notes

- New: `app/composables/useTheme.ts`, `app/plugins/theme.client.ts`.
- Modified: `nuxt.config.ts` (pre-paint inline script), `app/assets/css/main.css` (`@custom-variant dark`), `app/layouts/default.vue` (remove stray `dark:bg-neutral-900`), `app/pages/settings.vue` (toggle UI + template restructuring), `app/components/layout/header.vue`, `app/components/layout/footer.vue` (polarity flip).
- Not touched: `app/components/userDropdown.vue`, any card/page/admin-table styling, `DESIGN.md`'s token system (not yet wired into real CSS — that's 7.2).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 7 / Story 7.1, 7.2, 7.3] — verbatim ACs, epic sequencing/scope split
- [Source: _bmad-output/planning-artifacts/prds/prd-Elite_Hub-2026-07-19/prd.md#§5.12 FR-31, FR-32] — persistence requirement, Settings co-location requirement
- [Source: _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md#Consistency Conventions, Capability Map] — localStorage-only convention, no dedicated AD number exists for theming mechanism (a genuine architecture gap this story resolves at the story level)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/DESIGN.md#Colors, Do's and Don'ts] — full dark token list (for 7.2's future reference, not built here), the `data-theme`/class-not-OS-query requirement verbatim, dark mode's "brand chrome swaps polarity" narrative
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/EXPERIENCE.md#UX-DR6, Component Patterns, Accessibility Floor, State Patterns] — toggle location (Settings only), FOUC-avoidance requirement, exact announcement microcopy
- [Source: app/layouts/default.vue, nuxt.config.ts, app/assets/css/main.css] — confirmed current state of the latent OS-driven dark-mode bug this story must fix
- [Source: app/pages/settings.vue] — current admin/non-admin fork this story must restructure
- [Source: app/composables/useToast.ts, app/composables/useConfirm.ts] — the composable shape/pattern this story's `useTheme.ts` follows
- [Source: app/components/layout/header.vue, app/components/layout/footer.vue] — current bg-black/text-white classes needing per-element dark: counterparts

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

### Completion Notes List

- Fixed the latent OS-driven dark-mode bug identified during research: `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));` added to `main.css` makes every `dark:` class attribute-driven; the stray `dark:bg-neutral-900` on `default.vue`'s `<main>` was removed entirely (content canvas stays light in both themes for now, per this story's scope boundary — Story 7.2 owns adapting page content to dark mode).
- FOUC prevention implemented as a raw inline script via `nuxt.config.ts`'s `app.head.script` (synchronous, runs before Vue/hydration) — reads `localStorage` directly and sets `data-theme` on `<html>` before first paint. `useTheme.ts`'s `initTheme()` (called from a `.client.ts` plugin) only syncs the reactive `theme` ref afterward, it does not re-apply the DOM attribute.
- `settings.vue` restructured: the theme toggle now renders unconditionally (outside the admin/non-admin fork), so non-admin users — who previously saw zero functional content on this page — now see the toggle. The three content-policy forms remain admin-gated, unchanged.
- Header/footer polarity flip touched every `bg-black`/`text-white`/`border-white` occurrence in both files individually (not a single class), including hover states and the mobile menu panel. `userDropdown.vue` itself was left untouched per the story's explicit scope note (it's already a white card, independent of header polarity).
- No automated tests written — established MVP convention. Manual verification steps listed in Dev Notes; the most important one to actually run is a hard-refresh check for FOUC (toggle dark, refresh, confirm no flash of light theme before dark applies) and confirming an OS-dark-mode system with the in-app toggle left at light stays light (proving the Story 6.1 bug class is actually fixed).

### Post-review fix (user caught: homepage section headers turned invisible after the OS-driven dark-mode bug fix)

Removing the stray `dark:bg-neutral-900` from `default.vue`'s `<main>` (Task 2, the actual fix for the Story 6.1-class bug) had a side effect the story didn't anticipate: `app/pages/index.vue`'s "Noticias," "Eventos," and "Publicaciones" section `<h2>` headers were `text-6xl text-white`, sitting directly on `<main>`'s background with no dark container of their own. This was **already broken for any visitor whose OS was in light mode** — it only ever looked correct for OS-dark-mode visitors, because the (buggy, unintentional) `dark:bg-neutral-900` happened to make `<main>` dark, which coincidentally matched the white text. Fixing the OS-driven leak (correctly, per this story's actual goal) removed that accidental dark backdrop, exposing white-on-light-gray invisible headers for everyone — including, apparently, whoever had been testing this app in OS dark mode all along, which is exactly why nobody had noticed until now.

Fix: changed all three headers' `text-white` → `text-gray-900` in `app/pages/index.vue` (lines formerly 105/189/226 for Noticias/Eventos/Publicaciones). Verified no other live (non-commented) instance of this pattern exists elsewhere in `app/pages/**` — the one other sitewide `text-white` usage found (`login.vue`) is correctly self-contained inside its own `bg-black` panel and was not touched. The commented-out "Testimonios" block in `index.vue` still has the same latent issue but is dead code (never renders) — left as-is.

This was not a new bug introduced by this story's own additions (composable, toggle, header/footer flip) — it was a pre-existing homepage defect that the correct dark-mode fix unmasked. Worth flagging for Story 7.2: there may be other surfaces with the same "only worked by accident under OS dark mode" pattern that haven't been noticed yet; 7.2's sitewide visual pass should specifically check for stray unwrapped `text-white`/`text-black` usage while consolidating.

### Post-review scope addition (user request): Home page content canvas now responds to the toggle

After the fix above, the user pointed out that toggling dark mode only flipped the header/footer — the rest of the page (where the hero, stats, and Publicaciones live) stayed permanently white, which read as broken/half-implemented rather than intentionally scoped. Asked directly whether to extend to the whole app now or just Home; user chose **Home only** — every other page stays light-only for now, completed in Story 7.2.

Implementation, deliberately scoped to avoid touching shared components used by *other* pages (since `data-theme` is set on `<html>` and cascades globally — any `dark:` class added to a shared component would silently affect every page that reuses it, not just Home):

- `app/pages/index.vue`'s own root container gained an explicit `bg-neutral-100 dark:bg-neutral-900 dark:text-white` (previously it had no background of its own and relied on `default.vue`'s `<main>`, which this story deliberately left theme-inert — see the original Scope Boundary note). This makes Home's canvas dark **only on Home** — `default.vue`/`<main>` itself was not touched again, so every other page's background stays exactly as it was before this story, unaffected by the toggle.
- Because the page root now sets `dark:text-white`, every white "card" floating on that canvas (hero right panel, `PublicacionComposer`) needed an explicit `dark:text-gray-900` override on its own root to counteract inherited white text — otherwise text typed into the composer's textarea, or the "Bienvenido a Elite Hub" heading, would render white-on-white and vanish. `NewsCard.vue`, `EventCard.vue`, and `PublicacionCard.vue` were deliberately left untouched: every text element inside them already has its own explicit (non-inherited) color class, so they render correctly as light cards floating on the new dark canvas with zero changes — a valid, common dark-mode pattern, and it keeps these shared components' appearance identical on the Noticias/Eventos listing pages, where the canvas is still light.
- Section headers (Noticias/Eventos/Publicaciones, already fixed to `text-gray-900` earlier in this same round) gained `dark:text-white`. The feed's empty-state text gained `dark:text-gray-400`.

### Post-review reversal (user tested, disliked the result): header/footer flip removed; cards darkened instead

After seeing the above live, the user reported the header/footer flip (Task 6's original AC #5 implementation — white bg/black text in dark mode) looked "brusco y cuadriculado" (jarring, blocky) against the now-dark page canvas, and that overall there was too much white and too little tonal variation — "la menor cantidad de blanco... pero que haya tonos de negro" (as little white as possible, with some variation in dark tones, not one flat black). This is a direct reversal of the epics/DESIGN.md-specified "brand chrome inverts polarity" behavior — the user's live visual judgment overrides it.

- **`header.vue`/`footer.vue` reverted to their pre-story state** — every `dark:bg-white`/`dark:text-black`/`dark:border-black`/`dark:hover:bg-gray-200` addition from Task 6 was removed. Header and footer are solid black with white text in **both** themes now, unchanged from before this story — they blend with the dark canvas instead of clashing against it. **AC #5 as originally written is no longer satisfied by design** — this is a deliberate, user-directed product decision, not an oversight; if AC #5's literal text matters later, it needs to be renegotiated, not silently re-implemented.
- **Every white card touched by this story's earlier "keep cards white" choice was flipped to a dark surface instead**, for tonal depth against the darkest page canvas (`neutral-900`): hero right panel, `stats.vue`, `NewsCard.vue`, `EventCard.vue`, `PublicacionCard.vue`, `PublicacionComposer.vue` all gained `dark:bg-neutral-800` (one step lighter than the page canvas, for hierarchy) plus matching `dark:text-*` on every explicitly-colored text/border/input element inside them (titles → `dark:text-white`, secondary text → `dark:text-gray-300`/`dark:text-gray-400`, borders → `dark:border-gray-600`, form inputs → `dark:bg-neutral-700 dark:text-white`).
- **Known accepted side effect**: `NewsCard.vue`/`EventCard.vue` are also used on `noticias/index.vue`/`eventos/index.vue`, which this story does not touch — those two listing pages' own canvas stays light always, so if a user has dark mode on and visits those pages, they will see dark cards sitting on a light page (temporary visual inconsistency, not present on Home). Flagged for Story 7.2 to resolve when those pages get their own dark treatment; not fixed here per the user's explicit "Home only for now" scope decision.

### Post-review fix (user found via devtools: `default.vue`'s `<main>` stayed light, framing the now-dark Home content in a visible white band)

`app/layouts/default.vue`'s `<main>` never regained a dark variant after Task 2 removed the original (buggy, OS-driven) one — deliberately, since every other page still relies on it staying light. But `index.vue`'s own root div only covers its own `max-w-[120rem]` centered content; `<main>` itself (`flex w-full`) is what actually spans the full viewport width behind it, so on any viewport wider than 120rem (very common — 1920px+ monitors), and along `<main>`'s own box wherever the child doesn't fully cover it, the light `bg-neutral-100` showed through around/behind the dark Home content, creating a visible light frame ("cuadriculado," in the user's words) against the otherwise-dark page.

Fix: `default.vue` now reads the current route (`useRoute()`) and conditionally adds `dark:bg-neutral-900` to `<main>` only when `route.path === '/'` — matching `index.vue`'s own dark background exactly, so there's no seam, while every other route's `<main>` stays permanently light regardless of theme (preserving the "Home only" scope — this was the deciding reason not to just make `<main>` unconditionally dark for every page, which would have reintroduced the Story 6.1 class of bug on every unadapted page).

### File List

- app/composables/useTheme.ts (new)
- app/plugins/theme.client.ts (new)
- nuxt.config.ts (modified — pre-paint inline script)
- app/assets/css/main.css (modified — `@custom-variant dark`)
- app/layouts/default.vue (modified — removed stray `dark:bg-neutral-900`)
- app/pages/settings.vue (modified — theme toggle UI, restructured admin/non-admin fork)
- app/components/layout/header.vue (modified — dark: polarity flip on every bg-black/text-white/border-white occurrence)
- app/components/layout/footer.vue (modified — dark: polarity flip)
- app/pages/index.vue (modified, post-review fix — Noticias/Eventos/Publicaciones headers `text-white` → `text-gray-900`, unmasked by the dark-mode bug fix; modified again, post-review scope addition — page-level dark canvas + text colors)
- app/components/PublicacionComposer.vue (modified, post-review scope addition, then again reversed to a real dark surface — `dark:bg-neutral-800` + `dark:text-*` throughout)
- app/components/PublicacionCard.vue (modified, post-review — `dark:bg-neutral-800` + `dark:text-*` throughout)
- app/components/stats.vue (modified, post-review — `dark:bg-neutral-800` + `dark:text-*`)
- app/components/NewsCard.vue, app/components/EventCard.vue (modified, post-review — `dark:bg-neutral-800` + `dark:text-*`; known side effect on the Noticias/Eventos listing pages, see Dev Notes)
- app/components/layout/header.vue, app/components/layout/footer.vue (modified again, post-review reversal — polarity-flip `dark:` classes fully removed, reverted to always-black)
- app/layouts/default.vue (modified again, post-review fix — `<main>` conditionally gains `dark:bg-neutral-900` only on the `/` route, matching Home's own dark background so no light frame shows around it)
