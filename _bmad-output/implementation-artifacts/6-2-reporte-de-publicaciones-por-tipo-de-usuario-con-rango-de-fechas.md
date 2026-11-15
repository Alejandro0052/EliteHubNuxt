---
baseline_commit: 0f45cdd
---

# Story 6.2: Reporte de publicaciones por tipo de usuario con rango de fechas

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an admin,
I want to see how many publicaciones each type of user has created, filterable by date range,
so that I can understand activity patterns across the community, not just its static composition.

## Acceptance Criteria

1. **Given** I am admin **When** I navigate to Reportes/Indicadores **Then** I see a second report showing the count of Publicaciones grouped by the author's TipoUsuario (FR-45)
2. **Given** this report **When** no date range is selected **Then** it shows counts across all Publicaciones to date, grouped by the four TipoUsuario categories
3. **Given** this report **When** I select a start and end date **Then** the counts update to reflect only Publicaciones created within that range (inclusive)
4. **Given** I am not admin **When** I attempt to access this view or its route **Then** access is denied, same as Story 6.1

## Tasks / Subtasks

- [x] Task 1: Read what's already built before writing anything (AC: all)
  - [x] **`app/pages/admin/reportes/index.vue` and `server/api/admin/reportes.get.ts` already exist (Story 6.1)** — this story ADDS a second report to the same page, it does not touch the existing donut chart / user-distribution report or its endpoint. Do not refactor or restyle the existing first report beyond what's needed to fit the new card below/alongside it.
  - [x] **`server/utils/aggregates.ts` already exports `getUsuariosPorTipo()`** using a `Promise.all` over the 4 fixed `TIPOS_USUARIO` (`Deportista`, `Marca`, `Nutricionista`, `Patrocinador`), each a separate `prisma.usuario.count()`. This story adds a sibling function, `getPublicacionesPorTipo()`, following the exact same per-type `Promise.all` shape — not a Prisma `groupBy` (Prisma's `groupBy` only groups by scalar fields on the queried model itself; `Publicacion.autor.informacion.tipoUsuario.tipo` is a nested relation field three hops away, which `groupBy` cannot traverse — the existing per-type-count pattern is the only viable approach here, and it's already the codebase's established convention).
  - [x] **`Publicacion` model** (`prisma/schema.prisma`, `model Publicacion` around line 260): `id`, `texto`, `media String[]`, `autorId`/`autor Usuario`, `createdAt`, `updatedAt`. No direct TipoUsuario field — the join path is `Publicacion.autor → Usuario.informacion → Informacion.tipoUsuario → TipoUsuario.tipo`, the same indirect path `getUsuariosPorTipo()` already uses from the `Usuario` side.
  - [x] **`activeUserFilter('autor')` merge gotcha (read before writing the query):** `server/utils/guards/activeUserFilter.ts` returns `{ autor: { activo: true } }` when called as `activeUserFilter('autor')`. `server/api/publicaciones/index.get.ts` already uses this exact call for the public feed. This story ALSO needs to filter by `autor.informacion.tipoUsuario.tipo` for each count. **Do not spread `activeUserFilter('autor')` into a where object alongside a second `autor: {...}` key** — object spread will silently let the second key win and overwrite the `activo: true` condition, silently reincluding deactivated users' publicaciones in the report. Build the `autor` condition as one merged object per query: `autor: { activo: true, informacion: { tipoUsuario: { tipo } } }`. Applying the active-user filter here is a deliberate consistency choice, not explicitly stated in the ACs: it matches `getUsuariosPorTipo()`'s existing exclusion of deactivated Usuarios (AD-5, SM-4) and keeps this new report internally consistent with the first one on the same page.
  - [x] **Date-range inclusivity gotcha:** the ACs require the end date to be inclusive. `Publicacion.createdAt` is a full `DateTime`, not a date-only field. If `hasta` is naively parsed as `new Date('2026-08-20')`, that resolves to `2026-08-20T00:00:00.000Z` — any publicación created later that same day (e.g. 14:00) would be silently excluded, contradicting "inclusive." Set the upper bound to the END of the `hasta` day (`23:59:59.999` in the same parsed date, or equivalently `lt` the start of the next day) before passing it to Prisma's `createdAt: { gte, lte }`.
  - [x] **No admin subnav / no new admin page** — this is a second card/section on the SAME `/admin/reportes` page and reuses the SAME `middleware: ['admin']` gating already on that page (Story 6.1). No new route.
  - [x] **No test framework** — same MVP non-goal as every prior story. Verify manually (see Dev Notes).

- [x] Task 2: Add `getPublicacionesPorTipo()` to `server/utils/aggregates.ts` (AC: #1, #2, #3)
  - [x] Signature: `getPublicacionesPorTipo(desde?: Date, hasta?: Date): Promise<Record<"Deportista"|"Marca"|"Nutricionista"|"Patrocinador", number>>` — same return shape as `getUsuariosPorTipo()` for frontend consistency.
  - [x] For each of the 4 `TIPOS_USUARIO` (reuse the existing local `TIPOS_USUARIO` const in the same file — do not redefine it), run `prisma.publicacion.count({ where: { autor: { activo: true, informacion: { tipoUsuario: { tipo } } }, ...(dateFilter) } })` inside the same `Promise.all` pattern `getUsuariosPorTipo()` already uses.
  - [x] `dateFilter` is `{}` when neither `desde` nor `hasta` is provided (AC #2 — all Publicaciones to date), or `{ createdAt: { ...(desde && { gte: desde }), ...(hasta && { lte: endOfDay(hasta) }) } }` when either is provided (AC #3). Support `desde`-only and `hasta`-only as valid partial ranges (open-ended), not just the both-or-neither case — no AC forbids it and it's a natural consequence of two independent optional inputs.

- [x] Task 3: Build `server/api/admin/reportes/publicaciones.get.ts` (AC: #1, #2, #3, #4)
  - [x] New file (does NOT modify `server/api/admin/reportes.get.ts` — separate endpoint, separate concern, mirrors how `server/api/publicaciones/**` and `server/api/eventos/**` are already split by resource).
  - [x] `const usuario = await requireSession(event, { requireAdmin: true })` — identical gating call to `reportes.get.ts` (AC #4).
  - [x] Read `desde`/`hasta` from `getQuery(event)` as optional `YYYY-MM-DD` strings (matching a native `<input type="date">` on the frontend). Parse with `new Date(...)`; treat an unparseable or missing value as absent (do not 400 on absence — AC #2 requires the no-range case to work).
  - [x] **Validate `desde <= hasta` when both are present** — if `hasta` is before `desde`, throw `createError({ statusCode: 400, message: '...' })` (per Consistency Conventions, `message` not `statusMessage`). Not stated in the ACs, but required so the system doesn't silently return a nonsensical/empty result or crash on an inverted range — the story must leave the system working end-to-end, not just satisfy the literal AC text.
  - [x] Call `getPublicacionesPorTipo(desde, hasta)`, return `{ porTipo, total: <sum of the four> }` — thin passthrough, same shape/convention as `reportes.get.ts` (percentage math stays client-side, per Story 6.1's established split).

- [x] Task 4: Extend `app/pages/admin/reportes/index.vue` with the second report (AC: #1, #2, #3)
  - [x] Add a second `rounded-xl shadow-lg` card below the existing donut-chart card, inside the same page (do not create a new page/route). Heading: something like "Publicaciones por tipo de usuario".
  - [x] Two native `<input type="date">` fields (`desde`, `hasta`) plus a way to clear both back to "todas las publicaciones" — native date inputs already return `YYYY-MM-DD` strings, matching Task 3's expected query-param format with zero extra parsing.
  - [x] Re-fetch `/api/admin/reportes/publicaciones` (via `$fetch` with the current `desde`/`hasta` as query params, mirroring the `onMounted` `$fetch` pattern already used for the first report) whenever either date input changes, and once on initial mount with no params (AC #2's default state).
  - [x] Render the result as a numeric counts list — reuse the exact same list-row markup already built for the first report (swatch + label + count, `border-t` total row) rather than introducing a new chart type or a new list component; no AC in this story requires a chart, and Story 6.1 already exhausted this page's one approved charting use (AD-3 permits `vue-chartjs`/`chart.js`, but nothing here mandates spending that budget twice). Reusing the counts-list pattern keeps this addition proportionate to what the ACs actually ask for.
  - [x] Handle empty-range results (e.g., a date range with zero matching publicaciones) by rendering the same list with all counts at 0 — not a separate empty-state block; this is just the normal render path with `total = 0`.
  - [x] AC #4 (non-admin denied) is already fully covered by the existing page-level `definePageMeta({ middleware: ['admin'] })` and the new endpoint's `requireSession(event, { requireAdmin: true })` — no additional frontend gating needed for this specific report.

## Dev Notes

### Scope size

Small — this story adds one sibling aggregate function (copy-pasted pattern from `getUsuariosPorTipo()`), one new thin endpoint, and one additional card on an already-built page. No new Prisma model, no new dependency, no new route/page.

### Explicit non-goals for this story

- No new chart for this report — a numeric counts list is sufficient per the ACs (see Task 4). Do not add a second `<Doughnut>`/`<Bar>` unless the user asks for one later.
- No date-range persistence (URL query params, localStorage, etc.) — resets to "all time" on page reload, consistent with every other admin view in this app having no client-side filter persistence today.
- No changes to the existing user-distribution report or its endpoint (Story 6.1) beyond adding a sibling card below it.
- No new admin subnav — same non-goal Story 6.1 already established.

### Architecture / conventions this story must follow

- **AD-1 (Transaction Script)** — the new endpoint stays a thin passthrough over `aggregates.ts`; no business logic in the route handler beyond the date-range validation (400 on inverted range) and the total-sum reduce.
- **AD-4 (`requireSession` with DB recheck)** — `requireSession(event, { requireAdmin: true })`, identical call to `reportes.get.ts`.
- **AD-5 (shared active-user filter)** — apply `activo: true` on the `autor` relation for every count, matching `getUsuariosPorTipo()`'s exclusion of deactivated Usuarios; watch the merge gotcha in Task 1.
- **Error shape convention** — `createError({ statusCode, message })`, `message` field, not `statusMessage`.
- **No test framework** — verify manually: as admin, open `/admin/reportes`, confirm the new card renders counts for all 4 tipos with no date filter set (should roughly match the total publicación count visible via the feed); pick a `desde`/`hasta` range and confirm counts update and are consistent with what's actually in that range; pick `hasta` before `desde` and confirm a clean 400, not a crash; set `hasta` to today and confirm a publicación created today is still counted (validates the inclusive end-of-day fix, not just the naive midnight cutoff); log in as (or view as) a non-admin and confirm both `/admin/reportes` and a direct `$fetch('/api/admin/reportes/publicaciones')` are denied.

### Project Structure Notes

- New: `server/api/admin/reportes/publicaciones.get.ts`.
- Modified: `server/utils/aggregates.ts` (new `getPublicacionesPorTipo()` export, existing `getUsuariosPorTipo()`/`getEventosCount()` untouched), `app/pages/admin/reportes/index.vue` (new second card + date inputs + second `$fetch` call, existing donut-chart section untouched).
- Not touched: `server/api/admin/reportes.get.ts`, `app/components/userDropdown.vue` (the "Reportes/Indicadores" link already exists from Story 6.1 and needs no change — it's the same page/route).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 6 / Story 6.2] — verbatim ACs
- [Source: _bmad-output/planning-artifacts/prds/prd-Elite_Hub-2026-07-19/prd.md#§5.11 FR-45, §11 2026-08-01 addendum] — requirement text, added as new scope alongside FR-44 once the pre-checkpoint timeline showed slack
- [Source: _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md#AD-1, AD-4, AD-5, Consistency Conventions] — Transaction Script, requireSession, activeUserFilter, error-shape conventions
- [Source: server/utils/aggregates.ts] — `getUsuariosPorTipo()` pattern this story's `getPublicacionesPorTipo()` mirrors exactly
- [Source: server/api/admin/reportes.get.ts, app/pages/admin/reportes/index.vue] — Story 6.1's existing page/endpoint this story extends
- [Source: server/api/publicaciones/index.get.ts, server/utils/guards/activeUserFilter.ts] — precedent for `activeUserFilter('autor')` on `Publicacion` and its exact return shape (the merge gotcha's source)
- [Source: prisma/schema.prisma#model Publicacion, model Informacion, model TipoUsuario] — the indirect join path from `Publicacion` to `TipoUsuario`
- [Source: _bmad-output/implementation-artifacts/6-1-visualizacion-de-distribucion-de-usuarios.md] — previous story's Dev Notes/Dev Agent Record; this story continues the same page without repeating its dark-mode/background lessons (already fixed there and inherited by any card added to the same page)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

### Completion Notes List

- `getPublicacionesPorTipo(desde?, hasta?)` added to `server/utils/aggregates.ts`, mirroring `getUsuariosPorTipo()`'s per-type `Promise.all` pattern exactly — no Prisma `groupBy` (can't traverse the 3-hop relation to `TipoUsuario`).
- Caught and fixed a timezone bug during implementation, before marking Task 2 complete: the first draft computed the inclusive end-of-day boundary for `hasta` using local-timezone getters (`getFullYear`/`getMonth`/`getDate`) on a date that `new Date("YYYY-MM-DD")` parses as UTC midnight — on any server not running in UTC, that would silently shift the effective end-date by a day. Fixed by adding `24h - 1ms` directly to the already-UTC-anchored timestamp instead of re-deriving it through local getters.
- `autor: { activo: true, informacion: { tipoUsuario: { tipo } } }` built as one merged object per count query, not via `activeUserFilter('autor')` spread — spreading would have let a second `autor` key silently overwrite the `activo: true` condition (documented gotcha in Task 1).
- New endpoint `server/api/admin/reportes/publicaciones.get.ts`: `requireSession(admin)` gate, validates `desde`/`hasta` are parseable dates and that `desde <= hasta` when both given (400 with `message`, not `statusMessage`), then thin-passthrough to `getPublicacionesPorTipo()`.
- Frontend: second card added to the existing `/admin/reportes` page (no new route), reusing the first report's counts-list markup (swatch + label + count + total row) rather than a second chart — no AC requires one. Two native `<input type="date">` fields drive a `watch()` that refetches on change; `onMounted` does the initial no-range fetch (AC #2's default state). A "Limpiar rango" button resets both to `''`.
- No automated tests written — established MVP convention (no test framework in this codebase). Manual verification steps are listed in Dev Notes; the most important ones to actually run are the inclusive-end-date check (a publicación created "today" must still count when `hasta` = today) and the non-admin denial check on both the page and the raw endpoint.

### Post-review fix (2026-10-28)

Code review surfaced 4 findings, all fixed in this same story per project convention (no new story spun up):

1. **Stale counts shown under an error message** — `cargarPublicaciones()`'s catch block only set `errorPublicaciones`, leaving the previous successful result rendered underneath. Root cause: no reset of `itemsPublicaciones`/`totalPublicaciones` on failure. Fixed by clearing both to `[]`/`0` in the catch branch, so a failed fetch always shows a clean zero-state alongside the error, never leftover data from a prior range.
2. **Race condition on rapid date-input changes** — `watch([desde, hasta], cargarPublicaciones)` fired a new `$fetch` per keystroke/change with no sequencing; a slower, older response could resolve after a newer one and silently overwrite it with stale counts. Root cause: no guard against out-of-order resolution. Fixed with a monotonic `requestIdPublicaciones` counter — each call captures its own id at invocation time, and the success/error/finally branches all bail out early if a newer call has since started, so only the response matching the latest filter state is ever applied to the UI.
3. **400 on unparseable date contradicted the story's own spec** — Task 3 explicitly says an unparseable or missing `desde`/`hasta` should be treated as absent, but the implementation threw a 400 instead. Root cause: the `isNaN` check threw instead of falling back to `undefined`. Fixed in `publicaciones.get.ts` by reassigning `desde`/`hasta` to `undefined` when unparseable, before the `desde > hasta` inverted-range check (which still correctly 400s only when BOTH are valid and inverted).
4. **Inconsistent swatch colors between the two report cards** — report 1 sorts by count before assigning `COLORES[i]`, report 2 didn't sort, so the same TipoUsuario could land on a different color index in each card. Root cause: color was assigned by array position, not by category identity. Fixed by introducing `COLOR_POR_TIPO` (a fixed tipo→color map) and a `colorDeTipo(tipo)` helper used by both reports, so a given TipoUsuario always gets the same color regardless of sort order.

Verified by re-running `nuxt build` (production build, no test framework in this project) — compiled clean with no errors after all 4 fixes. No regression to Story 6.1's existing donut chart (untouched logic, only its color-assignment call site switched from `COLORES[i]` to the new shared `colorDeTipo()` helper, same colors in the same order).

### File List

- server/utils/aggregates.ts (modified — added `getPublicacionesPorTipo`)
- server/api/admin/reportes/publicaciones.get.ts (new; post-review fix — unparseable date now treated as absent instead of 400)
- app/pages/admin/reportes/index.vue (modified — added second report card, date-range inputs, fetch logic; post-review fix — stale-state reset on error, request sequencing guard, stable per-tipo color mapping shared by both reports)
