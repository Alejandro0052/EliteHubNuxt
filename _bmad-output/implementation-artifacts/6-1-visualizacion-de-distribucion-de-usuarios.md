---
baseline_commit: 3ae498dc03620c39a69f37577aefce9faf9b7ba7
---

# Story 6.1: Visualización de distribución de usuarios

Status: done

## Story

As an admin,
I want a polished chart plus numeric counts of registered users by type,
so that I can see community composition at a glance without querying the database.

## Acceptance Criteria

1. **Given** I am admin **When** I navigate to Reportes/Indicadores **Then** I see a chart (donut or bar, via vue-chartjs) breaking down registered Usuarios by TipoUsuario (FR-29)
2. **Given** the same view **When** I look alongside the chart **Then** numeric counts per TipoUsuario are also displayed, not chart-only (FR-30)
3. **Given** the chart's totals **When** compared to the homepage stats (Story 1.6) **Then** they match exactly — both are computed via the same shared `server/utils/aggregates.ts` function (SM-4)
4. **Given** this view is held to a higher visual-polish bar ("muy agradable de ver") than the rest of admin **When** it renders **Then** it uses DESIGN.md's full card/shadow/color system, not a bare default chart render
5. **Given** I am not admin **When** I attempt to access this view or its route **Then** access is denied

## Tasks / Subtasks

- [x] Task 1: Read what's already built before writing anything (AC: all)
  - [x] **`server/utils/aggregates.ts` already exists (Story 1.6)** and exports `getUsuariosPorTipo(): Promise<Record<"Deportista"|"Marca"|"Nutricionista"|"Patrocinador", number>>`, already excluding `activo: false` Usuarios. **This story must import and reuse this exact function, not reimplement the count query** — that's the entire mechanism AC #3/SM-4 relies on to guarantee the two surfaces never diverge. `server/api/stats/index.get.ts` (the homepage's public endpoint) already calls this same function — read it as the reuse precedent, but do NOT reuse that endpoint itself (it's public/unauthenticated, wrong for an admin-gated view — build a new admin endpoint that calls the same underlying `aggregates.ts` function instead).
  - [x] **No charting library is installed yet** — confirmed via full `package.json`/lockfile check. Per Architecture AD-3, this story installs `vue-chartjs` + `chart.js` (exactly these two packages, nothing else — AD-3 explicitly prevents a second charting library or an unplanned extra dependency like `chartjs-plugin-datalabels` entering the stack). Run `pnpm add vue-chartjs chart.js` as part of this story's setup.
  - [x] **Admin-gating pattern to use — the new/correct one, not the old one**: all three existing `server/api/admin/**` handlers (`admin/users.get.ts`, `admin/users.post.ts`, `admin/users/[id]/activo.put.ts`) still use a legacy hand-rolled session check (`getServerSession` + manual `isAdmin` check on the raw JWT claim, no DB recheck). This is exactly the stale pattern Architecture AD-4 says to stop writing for new handlers. **This story's new endpoint must use `requireSession(event, { requireAdmin: true })`** (the DB-rechecking utility, already built and used throughout Epics 2-5) — do not copy the older admin files' pattern even though they're the nearest neighbors in the same directory.
  - [x] **Frontend admin-route gating**: `app/middleware/admin.ts` already exists (`defineNuxtRouteMiddleware` checking `useAuth()`'s `status`/`isAdmin`, redirecting to `/` if not admin) — attach it via `definePageMeta({ middleware: 'admin' })` on the new page. This satisfies AC #5's frontend half; the endpoint's `requireAdmin: true` satisfies the backend half.
  - [x] **No dark mode exists yet in this codebase** (Story 7.1, dark/light toggle, is still backlog) — the UX mockup for this view (`mockups/key-reportes-indicadores.html`) was deliberately built in dark theme as a design exploration, but every other page in this app today renders light-mode only, with no `dark:` Tailwind variants anywhere. **Build this view in light mode**, translating the mockup's dark-theme green ramp into light-mode equivalents using DESIGN.md's actual `colors.primary` (`#15803d`, green-700) as the anchor shade — do not attempt to force a dark-themed page when nothing else in the app supports theme switching yet.
  - [x] **Chart color rule (hard constraint, not a suggestion)**: DESIGN.md explicitly prohibits a second accent hue ("Use green for anything decorative, or introduce a second accent hue" is listed as a Don't). All 4 donut/bar segments must be a single green hue at descending lightness/saturation — e.g. `#166534` (green-800) → `#15803d` (green-700, the app's actual primary) → `#22c55e` (green-500) → `#86efac` (green-300) — assigned by descending count (largest segment gets the darkest/most saturated shade), never 4 arbitrary colors. Segment identity must never rely on color alone — every segment needs a direct label and a legend entry with its exact count (accessibility requirement, also explicit in the mockup).
  - [x] **No admin subnav exists in code** — the mockup shows a "Gestión de usuarios | Mensajes de contacto | Reportes/Indicadores" subnav row, but this is a UX exploration, not something any current admin page implements (each admin page today is a standalone route, reached via `UserDropdown`). Do not build a new shared subnav component in this story — out of scope, not asked for by any AC. Reach this page the same way every other admin page is reached today: a link from `UserDropdown` (admin-only, alongside "Gestión de usuarios" and "Mensajes de contacto" per EXPERIENCE.md's IA table).
  - [x] **Route/file naming**: no path is mandated by the architecture spine (it only says "`app/pages` admin reportes view"), but the mockup's own address bar shows `/admin/reportes`, matching the existing `app/pages/admin/{resource}/index.vue` convention exactly (`admin/users/index.vue`, `admin/mensajes-contacto/index.vue`). Use `app/pages/admin/reportes/index.vue` and `server/api/admin/reportes.get.ts`.

- [x] Task 2: Install charting dependencies (AC: #1)
  - [x] `pnpm add vue-chartjs chart.js` — exactly these two packages, per AD-3.

- [x] Task 3: Build `server/api/admin/reportes.get.ts` (AC: #1, #2, #3, #5)
  - [x] `const usuario = await requireSession(event, { requireAdmin: true })` — single call, DB-rechecked admin gate (Task 1's note on using the correct, not legacy, pattern).
  - [x] `const porTipo = await getUsuariosPorTipo()` (imported from `server/utils/aggregates.ts`, zero new query logic).
  - [x] Return a shape the frontend can render directly without further math beyond formatting: `{ porTipo: { Deportista, Marca, Nutricionista, Patrocinador }, total: <sum of the four> }`. Percentage-per-type and descending-by-count ordering are display concerns — compute them client-side (Task 4), not baked into the API response, keeping this endpoint a thin passthrough over the shared aggregate (consistent with this codebase's Transaction Script convention — no derived-formatting logic in the API layer beyond the sum).

- [x] Task 4: Build `app/pages/admin/reportes/index.vue` (AC: #1, #2, #3, #4, #5)
  - [x] `definePageMeta({ middleware: 'admin' })` (Task 1's note).
  - [x] On mount, `$fetch('/api/admin/reportes')` into a local ref.
  - [x] Compute a display list client-side: `[{ tipo, count, pct }]` for the 4 TipoUsuario, **sorted descending by count** (matching the mockup's ordering — NOT the fixed `Deportista/Marca/Nutricionista/Patrocinador` order `aggregates.ts` returns them in), `pct = Math.round((count / total) * 1000) / 10` (one decimal place, e.g. `53.9`).
  - [x] Assign the 4-shade green ramp (Task 1's note) to the sorted list **by position** (index 0 = darkest, index 3 = lightest) — so the visual ramp always reads "biggest segment = most saturated," regardless of which TipoUsuario happens to be biggest on a given day.
  - [x] Layout: one `rounded-xl shadow-lg` white card (DESIGN.md's card token, matching AC #4 — no `hover:scale-105` here, this card isn't a clickable/navigable unit unlike directory/feed cards), full `max-w-[120rem]` page-shell (ahead of Story 7.2's sitewide shell migration, since this view is explicitly held to the new design system now, not the old admin `max-w-5xl`/`max-w-7xl` shell the rest of admin still uses). Page heading uses the `display` typography role ("Reportes/Indicadores") + a subtitle line, matching the mockup's copy: "Distribución de Usuarios registrados por tipo de usuario, calculada en tiempo real sobre la base de datos."
  - [x] Inside the card: a responsive 2-column grid, `grid-cols-1 lg:grid-cols-2` (chart stacks above counts below `lg`, side-by-side at `lg`+, per EXPERIENCE.md's Responsive & Platform table) — left column the chart (Task 5), right column the numeric counts (Task 6).
  - [x] Below the card (or as a caption within it): the cross-check note from the mockup, adapted for light mode — something to the effect of "Estos totales coinciden con los contadores públicos de la página de Inicio — misma consulta agregada."

- [x] Task 5: Build the chart (AC: #1, #4)
  - [x] Use `vue-chartjs`'s `<Doughnut>` component (from `vue-chartjs`, registering `ArcElement`, `Tooltip`, `Legend` from `chart.js` per vue-chartjs's standard Chart.js-registration requirement) — a donut, matching the mockup exactly (bar is the PRD's stated alternative but the mockup and this story's design commit to donut).
  - [x] `data.datasets[0].backgroundColor` = the 4-shade green ramp array in the same sorted order as the labels (Task 4's per-position assignment). `data.labels` = the 4 TipoUsuario names in the same sorted order.
  - [x] Disable Chart.js's own built-in legend (`options.plugins.legend.display: false`) — the numeric-counts column (Task 6) already serves as the legend with richer info (exact counts + percentages) than Chart.js's default legend would show, avoiding a redundant/conflicting second legend (also matches the mockup, which has no separate Chart.js-rendered legend, only the counts column).
  - [x] **Center total overlay** ("631" + "usuarios registrados" in the mockup): do NOT add `chartjs-plugin-datalabels` or any other Chart.js plugin for this (Task 1/AD-3's "no other new dependency" rule) — implement it as a plain absolutely-positioned HTML element layered on top of the canvas via a `relative` wrapper `div`, showing the `total` count and a static "usuarios registrados" caption. This is pure CSS/DOM, zero new dependencies.
  - [x] Tooltip (Chart.js's built-in, left enabled) shows the TipoUsuario name + count on hover — free from Chart.js defaults, no custom formatting required by any AC.

- [x] Task 6: Build the numeric counts column (AC: #2)
  - [x] A legend-style list, one row per TipoUsuario (sorted descending by count, same order/colors as the chart): a small color swatch (matching that segment's exact green shade — inline `style="background-color: ..."` since these are dynamic per-row values, not a fixed Tailwind class), the TipoUsuario label, the percentage, and the raw count — matching the mockup's row shape (`swatch · label · pct · count`).
  - [x] Below the list: a total row ("Total de Usuarios registrados" → the `total` value), visually distinguished (bold/larger, `primary` green text) from the per-type rows above it — matches the mockup's divider + total-row treatment.

## Dev Notes

### Scope size

Small-to-medium — the hard analytical work (the aggregate query itself) was already done in Story 1.6; this story is a new admin page + new admin endpoint (thin passthrough) + a first-time charting-library integration. The charting-library integration is the one genuinely new kind of work in this codebase (no prior story touched a visualization library), everything else (admin gating, card styling, client-side fetch-on-mount) follows established patterns exactly.

### Explicit non-goals for this story

- No admin subnav component (Task 1's note) — out of scope, not asked for by any AC.
- No additional metrics beyond the one TipoUsuario breakdown chart — PRD explicitly frames this as "a first slice," more metrics are post-MVP, do not build toward a "metrics dashboard" abstraction prematurely.
- No dark-mode-specific styling — build light-mode only, consistent with the rest of the app today (Story 7.1 will add theme switching later; do not hand-roll a one-off dark mode for just this page).
- No animated count-up (`vue-countup-v3`, already used by `stats.vue`) — the mockup shows static numbers for this view; do not add motion not asked for by any AC.

### Architecture / conventions this story must follow

- **AD-3 (vue-chartjs)** — exactly `vue-chartjs` + `chart.js`, no other charting/plugin dependency.
- **AD-4 (`requireSession` with DB recheck)** — use the correct/current admin-gating utility, not the three older `server/api/admin/**` files' legacy raw-session pattern.
- **Shared aggregate source (SM-4)** — `getUsuariosPorTipo()` from `server/utils/aggregates.ts`, zero new count-query logic; this is what makes AC #3 true by construction rather than by careful duplication.
- **DESIGN.md card/color tokens** — `rounded-xl shadow-lg` card, single green hue ramp for the chart (never a second accent hue), `display` typography role for the page heading, `max-w-[120rem]` page-shell.
- **No test framework** — same MVP non-goal as every prior story. Verify manually: as admin, navigate to `/admin/reportes` (via a new link added to `UserDropdown`) and confirm the chart + counts render with real numbers; open the homepage in another tab and confirm the total registered-user count matches exactly what Reportes/Indicadores shows (AC #3); log in as (or view as) a non-admin authenticated user and confirm navigating directly to `/admin/reportes` redirects away, and confirm a direct `$fetch('/api/admin/reportes')` as a non-admin 403s; resize the browser below/above the `lg` breakpoint and confirm the chart/counts stack vs. sit side-by-side per the Responsive table.

### Project Structure Notes

- New: `app/pages/admin/reportes/index.vue`, `server/api/admin/reportes.get.ts`.
- Modified: `package.json`/`pnpm-lock.yaml` (new `vue-chartjs`/`chart.js` dependencies), `app/components/userDropdown.vue` (new admin-only link to Reportes/Indicadores, matching the existing "Gestión de usuarios"/"Mensajes de contacto" links).
- Not touched: `server/utils/aggregates.ts` (reused as-is), `server/api/stats/index.get.ts` (the public homepage endpoint — left completely alone, this story does not modify or extend it), `app/components/stats.vue` (not reused — different card style, this story builds its own count-display markup matching the new DESIGN.md card convention instead of the deprecated `rounded-2xl` no-shadow `stats.vue` idiom).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 6 / Story 6.1] — verbatim ACs
- [Source: _bmad-output/planning-artifacts/prds/prd-Elite_Hub-2026-07-19/prd.md#§5.11, §5.4, addendum.md's charting options] — FR-29, FR-30, FR-12's shared-aggregate requirement, SM-4
- [Source: _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md#AD-3, AD-4, Structural Seed, Capability Map] — charting library decision, admin-gating pattern, `aggregates.ts` precedent
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/EXPERIENCE.md#Flow 6, IA table, Responsive & Platform] — layout, breakpoint behavior, IA placement in `UserDropdown`
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/mockups/key-reportes-indicadores.html] — visual reference (dark-theme exploration; this story implements the light-mode equivalent)
- [Source: server/utils/aggregates.ts, server/api/stats/index.get.ts] — shared aggregate function and its existing public-endpoint consumer, reused not duplicated
- [Source: server/utils/requireSession.ts, app/middleware/admin.ts] — exact admin-gating primitives to use, both already built
- [Source: app/components/stats.vue, app/pages/index.vue] — the older counter pattern this story deliberately does NOT reuse (deprecated card idiom)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

### Completion Notes List

- `vue-chartjs@5.3.4` + `chart.js@4.5.1` installed — exactly the two packages AD-3 specifies, no plugin dependencies added.
- Center-total overlay implemented as a plain absolutely-positioned `div` over the canvas, not a Chart.js plugin — per Task 1's "no other new dependency" note.
- Endpoint reuses `getUsuariosPorTipo()` from `server/utils/aggregates.ts` unchanged — same function the public `/api/stats` endpoint already calls, so totals are guaranteed to match by construction (AC #3/SM-4), not by careful duplication.
- Added a "Reportes/Indicadores" link to `userDropdown.vue`, admin-only, next to the existing "Mensajes de Contacto" link (mirroring EXPERIENCE.md's stated IA placement).
- No automated tests written — established MVP convention. Manual verification steps listed in Dev Notes; the most important one to actually run is AC #3 — open Home and `/admin/reportes` side by side and confirm the totals match exactly.

### Post-review fix (user feedback: header too dark; root cause found on second pass)

User first asked to shorten the heading to "Reportes" and lighten the title/subtitle colors — done, but the user reported it looked even darker ("más blanco, se ve muy oscuro"), the opposite of what lightening the text should have done. Root cause: this page's outer container had no explicit background, unlike every other `admin/*` page (`mensajes-contacto/index.vue` sets `bg-white` on its own root div). `app/layouts/default.vue`'s `<main>` is `bg-neutral-100 dark:bg-neutral-900`, and this project's Tailwind v4 setup has no `darkMode` override, so `dark:` variants follow the OS-level `prefers-color-scheme` media query by default (no in-app toggle exists yet, Story 7.1). On a system with OS dark mode on, `<main>` silently rendered near-black, and this page's text sat directly on it with no background of its own — lightening the text made it *worse* against a dark background, which is what tipped this off.

Fix: added `bg-white` to the page's own root container (matching the `mensajes-contacto` precedent exactly), and reverted the title/subtitle back to the original, correct-for-a-white-background colors (`text-gray-900`/`text-gray-600`). The real bug was a missing background, not text color choice.

### File List

- server/api/admin/reportes.get.ts (new)
- app/pages/admin/reportes/index.vue (new)
- app/components/userDropdown.vue (modified — added admin-only Reportes/Indicadores link)
- package.json, pnpm-lock.yaml (modified — new `vue-chartjs`/`chart.js` dependencies)
