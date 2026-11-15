---
baseline_commit: 38971781e51e48f7cc381663a88d08e9c07ba5a3
---

# Story 4.2: Moderación de reseñas — retractar y bloquear

Status: done

## Story

As an admin,
I want to retract a fake or bad-faith review and deactivate the account that posted it,
so that reputation abuse has a real consequence, not just a removed comment.

## Acceptance Criteria

1. **Given** a Reseña flagged as fake or bad-faith **When** admin retracts it **Then** it no longer appears on the Nutricionista's profile (FR-36)
2. **Given** admin retracts a review **When** they also choose to deactivate the reviewing Usuario **Then** that Usuario's `activo` flag is set to false, and per Story 2.4's cascade, their content is hidden and their session is rejected on their next request
3. **Given** the retraction action **When** performed **Then** it requires the standard destructive-confirm step ("Esta acción no se puede deshacer.")
4. **Given** a retracted review where the author's account is NOT also blocked **When** they submit again for the same nutricionista **Then** it succeeds — a known, accepted limitation carried forward from SPEC.md, **this must actually work, not just be documented as a gap** (see Task 2's DB constraint fix — the pre-existing `@@unique` constraint would silently break this AC if left as-is)

## ⚠️ Read before starting: this story overlaps with what Story 4.1 already shipped

Story 4.1 was built and approved with its originally-planned scope: authenticated users create/read reviews only, no edit/delete for anyone (matching Architecture AD-1's "no self-edit ever" / admin-only-`retract`, never `delete`). **After approval, the user explicitly requested and got** (as a post-review addition to 4.1, overriding AD-1): author edit, author delete, **and admin delete** — a real hard `DELETE /api/resenas/[id]`, already shipped and in production use. This was a deliberate, explicit scope reversal, logged in 4.1's Dev Notes under "Post-review scope change," with this exact note left for whoever builds 4.2:

> "revisit at 4.2 time whether 'retract' is still needed once admin can hard-delete"

**This story's direction from the user:** build 4.2 per its own original spec now (retract = soft-hide via the `retractada` flag, distinct from the hard delete that already exists), and reconcile/simplify the two admin actions (retract vs. delete) together with the user once this is built and tested — not a decision to make unilaterally mid-implementation. Do not remove or fold in the existing delete endpoint as part of this story; that's an explicit end-of-story conversation with the user, not an implementation task.

## Tasks / Subtasks

- [x] Task 1: Read what's already built before writing anything (AC: all)
  - [x] `Resena.retractada Boolean @default(false)` already exists in the schema (added speculatively in Story 4.1 for exactly this story) — no new column needed. `GET /api/resenas` already filters `where: { retractada: false }`, so flipping this flag to `true` is sufficient by itself to satisfy AC #1 (review disappears from the profile) — no GET-endpoint change needed either.
  - [x] `server/api/admin/users/[id]/activo.put.ts` already exists and does exactly what AC #2 needs (`prisma.usuario.update({ where: { id }, data: { activo } })`, admin-gated via raw session check) — **do not call this endpoint from the client as a second request**; this story's retract endpoint should perform both updates (retract + optional block) as a single atomic `prisma.$transaction`, not two separate round-trips that could partially fail. Read this file for the exact admin-check pattern, but re-implement the `activo:false` update inline inside the transaction, not via an HTTP call to this route.
  - [x] Story 2.4's deactivation cascade (`activeUserFilter()`, `requireSession()`'s `!usuario.activo` → 401) is already fully built and requires **zero changes** — setting `activo:false` on the reviewing Usuario is enough to trigger it on their next request. Confirmed: Reseñas themselves are explicitly excluded from this cascade (Architecture AD-5, re-confirmed in 4.1) — a blocked user's *other* Reseñas (for other nutricionistas) stay visible; only the specific retracted one disappears, via `retractada`, not via the cascade.
  - [x] `shared/utils/resourcePermissions.ts` currently has `ResourceAction = "edit" | "delete"` — no `"retract"` yet. `MATRIX.resena` currently has `edit`/`delete` only. This story adds `"retract"` to the action union and a `resena.retract` rule (admin-only, `authorAllowed: false, adminAllowed: true`) — see Task 4.
  - [x] **Critical correctness issue found while re-reading AC #4 against what 4.1 shipped**: `Resena` has `@@unique([autorId, nutricionistaId])` as a hard DB constraint (Story 4.1, meant as FR-37's DB-level backstop). If a review is retracted (flag flipped, row NOT deleted) and its author is not blocked, AC #4 requires them to be able to submit a **new** review for the same nutricionista. But the old retracted row still physically occupies that exact `(autorId, nutricionistaId)` pair — a fresh `prisma.resena.create()` would fail with a Prisma P2002 unique-constraint violation regardless of what the application-level duplicate check says, because Postgres enforces the constraint at insert time. **This is not a hypothetical — it will actually break AC #4 if not fixed.** See Task 2.

- [x] Task 2: Fix the `@@unique` constraint so retract doesn't permanently block resubmission (AC: #4)
  - [x] Prisma's schema DSL has no way to express a *partial* unique index (`UNIQUE ... WHERE retractada = false`) without hand-writing raw migration SQL outside what `prisma migrate dev` auto-generates from `schema.prisma` — doing so would cause schema drift warnings on every future `migrate dev` run. Given this codebase's established convention of enforcing every other business rule at the **application level only** (no other DB constraint backs a business rule in this schema besides this one), the simplest correct fix consistent with that convention: **remove `@@unique([autorId, nutricionistaId])` from the `Resena` model entirely.** FR-37 (one active review per nutricionista) becomes enforced purely by the `reviewLimit` guard (Task 3), same as literally every other validation in this app.
  - [x] Run `npx prisma migrate dev --name resena_drop_unique_constraint` (ask the user to stop `pnpm run dev` first — same Windows `EPERM` gotcha as every prior schema-touching story).
  - [x] **Accepted trade-off, worth stating explicitly in case it's questioned later:** without the DB constraint, a genuine race (e.g. the same user double-submitting from two tabs at the exact same millisecond) could theoretically let two non-retracted reviews through for the same pair, where before it would have rejected the second one via a P2002 constraint violation. This is the same class of risk every other app-level-only check in this codebase already accepts (e.g. nothing stops a race on `MensajeContacto` duplicates either) — not a regression in rigor, just consistency. Do not attempt to reintroduce DB-level enforcement via a partial index in this story; out of scope.

- [x] Task 3: Fix `server/utils/guards/reviewLimit.ts` to ignore retracted reviews (AC: #4)
  - [x] Current implementation (Story 4.1) uses `prisma.resena.findUnique({ where: { autorId_nutricionistaId: { autorId, nutricionistaId } } })` — this only works as a lookup on the compound **unique** key, which Task 2 just removed. It also doesn't check `retractada` at all, so even before Task 2's fix it would have wrongly treated a retracted review as still "occupying" the slot.
  - [x] Replace with:
    ```ts
    export async function assertNoDuplicateReview(autorId: number, nutricionistaId: number) {
      const existing = await prisma.resena.findFirst({
        where: { autorId, nutricionistaId, retractada: false },
      });
      if (existing) {
        throw createError({ statusCode: 409, message: "Ya dejaste una reseña para este nutricionista." });
      }
    }
    ```
  - [x] This now correctly allows a fresh review after a retract (AC #4) while still blocking a duplicate against any live, non-retracted review (FR-37, unchanged behavior for the common case).

- [x] Task 4: Extend `shared/utils/resourcePermissions.ts` with a `"retract"` action (AC: #1, #2, #3)
  - [x] `ResourceType` stays as-is (`resena` already added in 4.1). Change `ResourceAction` to `"edit" | "delete" | "retract"`.
  - [x] `MATRIX.resena` gains a third entry: `retract: { authorAllowed: false, adminAllowed: true }` — admin-only, matching Architecture AD-1's original matrix (`retract` was always meant to be admin-only; nothing here contradicts AD-1, only the already-shipped `delete` addition did).
  - [x] **Other resource types (`evento_noticia`, `catalogo_item`, `publicacion`) have no `retract` entry in `MATRIX`, and never will in this story's scope** — `canPerformAction()`'s `const rule = MATRIX[resourceType][action]` would be `undefined` for those combinations, and `rule.adminAllowed` would throw. Guard this explicitly: `const rule = MATRIX[resourceType]?.[action]; if (!rule) return false;` — a resource type with no rule for a given action simply means "nobody can do that," not a crash.
  - [x] `app/composables/useResourcePermissions.ts`'s `canRetract` is currently a hardcoded `computed(() => false)` stub (left as a stub deliberately in Story 4.1, per Architecture AD-6's documented shape). Wire it to the real check: `computed(() => { const r = resource.value; const u = authStore.user; if (!r || !u) return false; return canPerformAction(resourceType, "retract", r, { id: u.id, isAdmin: !!u.isAdmin }); })`. This composable isn't actually used by `ResenasSection.vue` (which calls `canPerformAction` directly per-row, same reasoning as 4.1's `canEdit`/`canDelete` — a `v-for` can't call a composable per iteration), but fixing the stub keeps the composable honest for any future single-resource usage.

- [x] Task 5: Build `server/api/resenas/[id]/retract.patch.ts` (AC: #1, #2)
  - [x] Nested-folder route (`resenas/[id]/retract.patch.ts` → `PATCH /api/resenas/:id/retract`), not a dot-suffixed filename — matches Nitro's file-based routing for a sub-action on a specific resource (no existing precedent in this codebase for a nested action route, but this is the standard Nitro pattern for "verb on a resource" that isn't one of the standard CRUD ones).
  - [x] `const usuario = await requireSession(event, { requireAdmin: true })` — admin-only, throws 403 for non-admins in one call (no separate `authorOrAdmin` needed here since there's no author path at all for retract — unlike edit/delete, `authorAllowed` is `false`).
  - [x] Fetch the existing `Resena` by id (404 if missing). If `existing.retractada` is already `true`, throw 400 ("Esta reseña ya fue retractada.") — idempotency guard, since the row no longer appears in `GET /api/resenas` once retracted, a client retrying a stale request shouldn't silently no-op.
  - [x] Read body: `{ bloquearAutor: boolean }` (default `false` if omitted/not boolean).
  - [x] `prisma.$transaction([...])`: always update `resena.retractada = true`; additionally, if `bloquearAutor` is `true`, update the reviewing Usuario (`existing.autorId`) with `activo = false` in the **same transaction** — both succeed or both roll back, no partial state where a review is hidden but the account stays active due to a mid-request failure (or vice versa).
  - [x] Return `{ retractada: true, autorBloqueado: bloquearAutor }` — the client needs to know whether the block also happened, to show the right toast copy.

- [x] Task 6: Add "Retractar" to `app/components/ResenasSection.vue`, admin-only (AC: #1, #2, #3)
  - [x] Extend the existing `permisos(r)` helper (built in 4.1 for `canEdit`/`canDelete`) to also compute `canRetract: canPerformAction('resena', 'retract', { autorId: r.autorId }, actor)` — same per-row-direct-call pattern, not the composable (still a `v-for`).
  - [x] Admin sees a third action next to the existing "Eliminar": a "Retractar" button/link. Clicking it does **not** use the app-wide `useConfirm()`/`ConfirmDialog` (built for this app in the previous post-review round) as-is, because this action needs an extra piece of input (the "also block the account" choice) that the generic yes/no dialog doesn't support and shouldn't be extended for a single one-off case. Instead, follow this component's own already-established inline-expansion pattern (used for both the create form and the edit form): clicking "Retractar" expands a small inline panel in place, containing:
    - The required destructive-confirm copy (AC #3): "¿Retractar esta reseña? Esta acción no se puede deshacer."
    - A checkbox: `"También bloquear la cuenta de {{ r.autor.nombre }} {{ r.autor.apellido }}"`.
    - "Confirmar" (destructive styling, matching `ConfirmDialog`'s red-600/red-700 token) and "Cancelar" buttons.
  - [x] On confirm: `PATCH /api/resenas/${r.id}/retract` with `{ bloquearAutor: <checkbox value> }`. On success, remove the row from the local `resenas` array (it's retracted, no longer visible — same immediate-local-update pattern already used for delete) and `showToast(...)` with copy that reflects whether the account was also blocked (`"Reseña retractada y cuenta bloqueada"` vs. `"Reseña retractada"`).
  - [x] Do **not** touch the existing "Eliminar" button/flow at all — both actions coexist for this story per the note at the top of this file; simplifying/removing one is an explicit end-of-story conversation with the user, not something to resolve unilaterally here.

## Dev Notes

### Scope size

Small-to-medium — one schema fix (drop a constraint that turned out to be wrong once AC #4 is taken seriously), one guard fix, one new endpoint, one new resource-permission action, and one UI addition to an already-existing component. The bulk of the *hard* work (guard patterns, permission matrix, the component's inline-expansion UX, the toast/confirm-dialog primitives) was already built in 4.1 and its post-review rounds — this story is mostly composition, plus the one real correctness bug (Task 2/3) that surfaced from actually thinking through AC #4 against what already shipped.

### The elephant in the room: retract vs. delete

Spelled out once at the top of this file already — repeating briefly here because it's the single most important thing to get right in the final review conversation with the user: **after this story ships, admins will have two different destructive actions on the same review** ("Eliminar" — hard delete, from 4.1's post-review round — and "Retractar" — soft-hide + optional account block, this story). They are not redundant in effect (delete frees the FR-37 slot immediately and unconditionally; retract only frees it if the guard fix in Task 3 works correctly, and additionally offers the one-click "block the account" combo that delete doesn't). But they *are* redundant in the narrow "make this review stop showing up" sense, and a real product decision (keep both? rename one? merge the "block account" checkbox into the delete flow instead and drop retract entirely?) should happen with the user once they've used both. Do not pre-empt that decision in this story.

### Architecture / conventions this story must follow

- **`requireSession(event, { requireAdmin: true })`** — single-call admin gate, already built (Story 1.x), reused as-is; no need for a separate `authorOrAdmin` check on the retract endpoint since there's no author path (`authorAllowed: false`).
- **Transaction Script + explicit `$transaction`** for the two-part retract+block update — this is the first place in the codebase doing two related writes atomically; every prior multi-field update in this app has been a single `prisma.X.update()` call, so this is a new (small) pattern, not a deviation from one.
- **No test framework** — same MVP non-goal as every prior story. Verify manually: as admin, retract a review with the block checkbox OFF — confirm it disappears from the profile, and the author (test with a second account) can still act on the platform normally; as admin, retract a review WITH the block checkbox ON — confirm the review disappears AND the author's next authenticated request gets logged out / 401'd (per Story 2.4's cascade — log in as that author in a second browser/incognito session first, then retract+block from the admin session, then try any authenticated action as that author and confirm the forced-logout copy appears); as the author of a retracted-but-not-blocked review, submit a **new** review for the same nutricionista and confirm it succeeds (AC #4 — this is the one most likely to silently fail if Task 2/3 aren't done correctly, test it explicitly, don't assume); confirm a non-admin (regular author, even the review's own author) never sees a "Retractar" control anywhere.
- **Icon/toast/confirm conventions** — reuse existing `fa6-solid`/`fa6-regular` icons, `useToast()`, and this component's own established inline-expansion pattern; do not introduce a new modal library or pattern for the block-checkbox UI.

### Project Structure Notes

- New: `server/api/resenas/[id]/retract.patch.ts`.
- Modified: `prisma/schema.prisma` (drop `@@unique([autorId, nutricionistaId])` on `Resena`), `server/utils/guards/reviewLimit.ts` (findFirst + retractada filter), `shared/utils/resourcePermissions.ts` (add `"retract"` action + `resena.retract` rule + undefined-rule guard), `app/composables/useResourcePermissions.ts` (wire real `canRetract`), `app/components/ResenasSection.vue` (add Retractar UI).
- Not touched: `server/api/resenas/index.get.ts` (already filters `retractada: false`, no change needed), `server/api/admin/users/[id]/activo.put.ts` (read for reference only, not called from the new endpoint — the block update is inlined into the retract transaction instead).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 4 / Story 4.2] — verbatim ACs
- [Source: _bmad-output/implementation-artifacts/4-1-dejar-y-ver-resenas-de-nutricionista.md#Post-review scope change] — the delete/edit addition this story must coexist with and reconcile at the end
- [Source: _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md#AD-1, AD-5] — original retract-is-admin-only-and-distinct-from-delete matrix, deactivation cascade exclusion for Reseñas
- [Source: prisma/schema.prisma] — `Resena` model as shipped by 4.1 (`retractada` field already present, `@@unique` constraint this story removes)
- [Source: server/api/admin/users/[id]/activo.put.ts] — existing admin deactivation pattern, reused inline
- [Source: app/components/ResenasSection.vue] — existing inline-expansion UX pattern (create/edit forms) this story's Retractar UI follows

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

### Completion Notes List

- Real correctness bug found and fixed before it could break AC #4: the `@@unique([autorId, nutricionistaId])` constraint on `Resena` (added in Story 4.1) would have silently blocked a legitimate resubmission after a non-blocked retract, since the old retracted row still occupied that DB key. Dropped the constraint (migration `20260727175933_resena_drop_unique_constraint`) and moved FR-37 enforcement fully into the `reviewLimit` guard (`findFirst` filtered by `retractada: false`), consistent with every other business-rule check in this codebase being app-level only.
- `retract` action is admin-only end to end: `requireSession(event, { requireAdmin: true })` server-side, `MATRIX.resena.retract = { authorAllowed: false, adminAllowed: true }` client-side — an author never sees a "Retractar" control on their own review, only "Editar"/"Eliminar".
- Retract + optional account block is one atomic `prisma.$transaction`, not two requests — avoids a partial state where the review disappears but the account stays active (or vice versa) if a second request failed.
- **Resolved (user decision, post-review):** the "elephant in the room" above was resolved by the user after testing both actions — admin loses "Eliminar" entirely (`MATRIX.resena.delete.adminAllowed` flipped `true` → `false`); "Retractar" (with its optional block-account checkbox) is now the *only* admin moderation action on a review. The author keeps their own "Editar"/"Eliminar" unchanged (`authorAllowed: true` on both, untouched). This was a **one-line matrix change** (`shared/utils/resourcePermissions.ts`) — both the server guard (`authorOrAdmin` in `server/api/resenas/[id].delete.ts`) and the client button (`permisos(r).canDelete` in `ResenasSection.vue`) read from the same `canPerformAction()`, so the "Eliminar" button disappears for admin and a raw admin `DELETE` request now 403s, with no other code touched. User explicitly said the block-account checkbox pattern built for retract will be reused later for Publicaciones moderation — keep that in mind as a forward precedent, not something to build now.
- No automated tests written — same established MVP convention. Manual verification steps listed in Dev Notes; the most important one to actually run (not just assume) is AC #4: retract a review without blocking the account, then log in as that same author and confirm they can submit a fresh review for the same nutricionista.

### File List

- prisma/schema.prisma (modified — dropped `@@unique([autorId, nutricionistaId])` on `Resena`)
- prisma/migrations/20260727175933_resena_drop_unique_constraint/migration.sql (new)
- server/utils/guards/reviewLimit.ts (modified — `findFirst` + `retractada: false` filter, no longer relies on the dropped unique key)
- shared/utils/resourcePermissions.ts (modified — added `"retract"` action, `resena.retract` rule, undefined-rule-safe `canPerformAction`)
- app/composables/useResourcePermissions.ts (modified — `canRetract` wired to a real check instead of the `false` stub)
- server/api/resenas/[id]/retract.patch.ts (new)
- app/components/ResenasSection.vue (modified — Retractar button + inline confirm-with-checkbox panel, admin-only)
- app/pages/admin/users/index.vue (modified, incidental — replaced a native `alert()` on the activo-toggle error path with `showToast()`, consistent with the "no native browser dialogs" rule established earlier this session)
