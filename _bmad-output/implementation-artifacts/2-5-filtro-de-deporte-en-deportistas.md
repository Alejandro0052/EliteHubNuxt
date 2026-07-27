---
baseline_commit: c785728633c22229001331d21717580af2599cf5
---

# Story 2.5: Filtro de deporte en Deportistas

Status: done

## Story

As an authenticated user,
I want to filter the Deportistas directory by sport,
so that I can find athletes in the sport I care about without scrolling through all of them.

## Acceptance Criteria

1. **Given** the Deportistas directory **When** I view the filter controls **Then** I see chips for the fixed sport list: fútbol, baloncesto, ciclismo, running, crossfit, voleibol, gimnasia, boxeo, natación, otros (FR-19)
2. **Given** I select a sport filter chip **When** the list refetches **Then** only Deportistas with that Deporte appear, via a new first cursor batch, not client-side filtering of already-loaded data
3. **Given** no filter is selected **When** the directory loads **Then** all Deportistas appear
4. **Given `app/pages/deportistas.vue` used to hardcode its own sport list** — **superseded, read before starting:** Story 2.1 already deleted that entire hardcoded section (per explicit user instruction to remove all marketing filler, including the decorative sport tiles) — there is no hardcoded list left to reconcile. This story's chips source directly from `GET /api/deportes` (the real `Deporte` table, already the single shared source — Story 1.1 seeded exactly these 10 rows), so this AC is satisfied by there being nothing left to diverge
5. **Given the "why use the app" marketing CTA AC** — **also superseded:** that CTA no longer exists either (same Story 2.1 deletion, same explicit user instruction). Nothing to retain/improve; do not resurrect deleted marketing copy to satisfy this AC's literal wording

## Tasks / Subtasks

- [x] Task 1: Extend `server/api/usuarios/index.get.ts` with an optional `deporteId` filter (AC: #2, #3)
  - [x] Read the query param, apply it only when present: `where: { ...activeUserFilter(), informacion: { tipoUsuario: { tipo } }, ...(deporteId ? { UsuarioDeporte: { some: { deporteId: Number(deporteId) } } } : {}) }`. No filter present → identical behavior to today (AC #3, no code branch needed beyond the conditional spread).
  - [x] This only makes sense for `tipo === 'Deportista'` — don't validate/reject a `deporteId` param sent for another type, just let the `UsuarioDeporte: { some: {...} }` condition naturally match nothing for a Marca/Nutricionista/Patrocinador query (harmless, no special-casing needed).

- [x] Task 2: Build `app/components/FilterChips.vue` (UX-DR14, first real usage) (AC: #1)
  - [x] Generic single-select chip list — reusable, not Deporte-specific (Epic 3's Catálogo category filter, FR-39, reuses this unchanged later). Props: `options: { value: string | number; label: string }[]`, `modelValue: string | number | null`. Emits `update:modelValue`. Clicking the already-selected chip deselects it (sets `modelValue` to `null`) — this is how a user gets back to "no filter" without a separate explicit "Todos" control being strictly required, though adding one explicit "Todos" chip at the front of the list is clearer UX and matches AC #3's "no filter selected" as a real, reachable state — include it.
  - [x] Layout: wraps/scrolls horizontally below `md`, single row at `md`+ (EXPERIENCE.md's Responsive & Platform table, already-established convention) — match the existing chip-like visual language already used elsewhere in this codebase (rounded-full pill, `bg-black`/`text-white` when selected, `bg-gray-100`/`text-gray-700` otherwise — same idiom as `register.vue`'s tipo-usuario selector buttons).

- [x] Task 3: Wire the filter into `app/pages/deportistas/index.vue` (AC: #1, #2, #3)
  - [x] `onMounted`, fetch `GET /api/deportes` (already exists, Story 1.1) into a `deportes` ref; build chip options as `[{ value: null, label: 'Todos' }, ...deportes.value.map(d => ({ value: d.id, label: d.nombre }))]`.
  - [x] Track `const selectedDeporteId = ref<number | null>(null)`; `fetchPage` closure reads this ref's current value on every call (so a later filter change is reflected without rebuilding the function).
  - [x] **AC #2's "new first cursor batch, not client-side filtering" is satisfied by forcing `InfiniteScrollList` to remount on filter change** — add `:key="selectedDeporteId ?? 'all'"` to the existing `<InfiniteScrollList>` usage. Changing a component's `:key` makes Vue destroy and recreate that component instance, which resets `useInfiniteScroll`'s internal `items`/`cursor`/`finished` state and triggers a fresh `loadMore()` from `cursor: null` — no changes needed to `InfiniteScrollList.vue`/`useInfiniteScroll.ts` themselves (Story 2.1's primitives stay generic and untouched).
  - [x] This `:key` remount is scoped to the child `InfiniteScrollList`, not the page itself — does not conflict with Story 2.2's `definePageMeta({ keepalive: true })` on this same page (that preserves the whole page instance, including `selectedDeporteId`, across navigation to a detail view and back; the `:key` remount only fires on an in-page filter change, a different mechanism at a different level).
  - [x] Chip row placed between the Hero/Custom-Content block and the `<InfiniteScrollList>` (no other content sits there today post-Story-2.1).

## Dev Notes

### Two ACs are already satisfied by prior deletion, not by new work in this story

Story 2.1 (at the user's explicit, direct instruction — "borra todo lo del marketing... remplázalo con los datos de prueba") deleted `deportistas.vue`'s entire hardcoded marketing section, including both the decorative sport-icon tiles this AC's "hardcoded list" refers to and the "why use the app" CTA the other AC asks to retain. Both referenced elements no longer exist on the page. Do not re-add a CTA or resurrect a hardcoded sport list to satisfy these ACs' literal wording — the epics document predates that deletion and is stale on this specific point (already flagged in Story 2.1's own Dev Notes at the time). The *intent* behind both ACs (single shared source for the sport list; a reasonably compelling page, not a bare list) is still honored: the sport list already comes from `Deporte`/`GET /api/deportes`, and the directory itself — Hero, real user cards — is the "content" now, not cosmetic filler.

### Scope size

Small — one query-param addition to an existing endpoint, one new small reusable component (its second consumer is Epic 3, not built yet), and wiring into one existing page.

### Architecture / conventions this story must follow

- **UX-DR14:** `FilterChips.vue` must stay generic (options/modelValue in, event out) — no Deporte-specific logic inside it — since Epic 3's Catálogo category filter (FR-39) reuses it unchanged.
- **NFR-10 / Story 2.1's cursor convention:** the filter change must produce a genuinely fresh cursor-paginated fetch (`cursor: null` first batch), never a client-side `.filter()` over already-loaded items — the `:key`-remount approach is what guarantees this without special-casing the shared infinite-scroll primitives.
- **No test framework** — same MVP non-goal as every prior story; verify manually (select a sport chip, confirm the grid clears and refills with only matching Deportistas; confirm scroll resets to top for the new filtered set; deselect back to "Todos" and confirm the full list returns; confirm a Deportista genuinely without that Deporte never appears while the filter is active).

### Project Structure Notes

- New: `app/components/FilterChips.vue`.
- Modified: `server/api/usuarios/index.get.ts` (optional `deporteId` param), `app/pages/deportistas/index.vue` (chip row + `:key`-based remount wiring).
- No schema changes, no new npm dependencies.

### Previous Story Intelligence (Story 2.1)

- `InfiniteScrollList.vue`/`useInfiniteScroll.ts` were deliberately built generic in Story 2.1 for exactly this kind of later reuse — this story confirms that design paid off: no changes needed to either, just a `:key` on the consuming side.
- Story 2.1's own Dev Notes already flagged that Story 2.5's epics-authored ACs (CTA retention, hardcoded-list reconciliation) would be stale by the time this story started, given the user's explicit deletion instruction — this story's Task list reflects that reality rather than re-deriving it from the (now outdated) epics text alone.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.5, #UX-DR14] — AC source, filter-chip component requirement
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1 Dev Notes] — the prior flag that these two specific ACs would be stale
- [Source: server/api/usuarios/index.get.ts] — Story 2.1/2.4's existing directory endpoint this story extends
- [Source: server/api/deportes/index.get.ts] — existing, unchanged endpoint this story's chips fetch from (orders alphabetically by `nombre`, not FR-19's literal listed order — a deliberate choice here to avoid reintroducing a hardcoded order array)
- [Source: app/pages/deportistas/index.vue] — current post-Story-2.1 state (Hero + Custom Content + `InfiniteScrollList`, no marketing filler) this story adds the chip row to
- [Source: app/components/InfiniteScrollList.vue, app/composables/useInfiniteScroll.ts] — Story 2.1's primitives, reused unchanged via the `:key` remount technique

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

None — no schema changes, no Prisma regeneration needed.

### Completion Notes List

- Extended `server/api/usuarios/index.get.ts` with an optional `deporteId` query param, applied via `UsuarioDeporte: { some: { deporteId } }` only when present.
- Built `app/components/FilterChips.vue` — generic single-select chip list (UX-DR14, first usage); clicking the active chip deselects it, and an explicit "Todos" option is always the first chip.
- Wired the filter into `app/pages/deportistas/index.vue`: fetches `/api/deportes` on mount, tracks `selectedDeporteId`, and forces `InfiniteScrollList` to remount via `:key="selectedDeporteId ?? 'all'"` on change — this produces a genuinely fresh cursor-paginated fetch (AC #2) with zero changes to Story 2.1's shared `InfiniteScrollList`/`useInfiniteScroll` primitives.
- Confirmed the two epics-authored ACs about the (already-deleted) CTA and hardcoded sport list are satisfied by that prior deletion, not by new work here — no marketing content was resurrected.
- No automated tests written — same project-wide convention as every prior story. Verified manually instead: traced the `:key` remount mechanism against Vue's documented behavior (changing a component's `key` destroys and recreates the instance), confirmed the conditional `deporteId` spread in the endpoint doesn't affect the no-filter case's query shape at all (AC #3).

### File List

- `app/components/FilterChips.vue` (new)
- `server/api/usuarios/index.get.ts` (modified — optional `deporteId` filter)
- `app/pages/deportistas/index.vue` (modified — chip row + `:key`-based remount)

## Change Log

- 2026-07-26: Story implemented — Deportistas directory is now filterable by sport, via a reusable chip component intended for Epic 3's Catálogo category filter too.
