---
baseline_commit: c785728633c22229001331d21717580af2599cf5
---

# Story 3.3: Edición y borrado de ítems de catálogo

Status: done

## Story

As a Marca that created a catalog item,
I want to edit or delete my own items, with admin able to moderate any,
so that I can keep my listings accurate and abuse can still be removed.

## Acceptance Criteria

1. **Given** I created a catalog item **When** I attempt to edit or delete it **Then** the action succeeds (FR-43) — **this is the AC most at risk of silently breaking** (see Task 1's `autorId`/`usuarioId` field-mapping note) and must be explicitly, separately verified, not assumed to work just because AC #3 (admin) passes
2. **Given** a catalog item created by another Marca **When** I, a different Marca, attempt to edit or delete it **Then** the request is rejected server-side via `authorOrAdmin(resource, action, session)` — mirroring the same edit+delete-for-both-roles matrix as Eventos/Noticias (Story 1.7), the second real usage of this guard for a symmetric-permission resource
3. **Given** I am admin **When** I attempt to edit or delete any catalog item regardless of authorship **Then** the action succeeds — **note:** this path does not exercise the `autorId` mapping at all (`actor.isAdmin && rule.adminAllowed` short-circuits before the author-id comparison), so passing this AC gives no signal that AC #1 also works — both must be tested independently, with two different accounts (the item's real author, and a separate non-owning Marca or admin)

## Tasks / Subtasks

- [x] Task 1: Read what's already built before writing anything (AC: all)
  - [x] **`shared/utils/resourcePermissions.ts`'s `MATRIX` already has a `catalogo_item` entry** (`edit`/`delete` both `authorAllowed: true, adminAllowed: true` — identical shape to `evento_noticia`), added speculatively back in Story 1.7 anticipating exactly this story. `authorOrAdmin()` (server) and `useResourcePermissions()` (client) need **zero changes** — this story is almost entirely "build the two missing endpoints + wire the already-built guards into them," not new-primitive work.
  - [x] **Critical mismatch to handle, not a bug in the shared primitive:** `canPerformAction()`'s `resource` parameter shape is `{ autorId: number | null | undefined }` — but `ItemCatalogo`'s ownership field is named `usuarioId` (Story 3.1's deliberate naming, matching its own `usuario` relation, not `autor`). Passing a raw `ItemCatalogo` row straight into `authorOrAdmin()`/`useResourcePermissions()` would silently break author permission entirely (`resource.autorId` would be `undefined`, so `undefined === actor.id` is always false — only the admin branch would ever succeed). **Every call site in this story must map the field**: `authorOrAdmin('catalogo_item', action, { autorId: existing.usuarioId }, usuario)` server-side, and `useResourcePermissions('catalogo_item', computed(() => item.value ? { autorId: item.value.usuarioId } : null))` client-side — never pass the raw item object directly to either.

- [x] Task 2: Build `server/api/catalogo/[id].put.ts` and `server/api/catalogo/[id].delete.ts` (AC: #1, #2, #3)
  - [x] Both: `const usuario = await requireSession(event)`, fetch the existing `ItemCatalogo` by id (404 if missing), then `if (!authorOrAdmin('catalogo_item', 'edit'|'delete', { autorId: existing.usuarioId }, usuario)) throw createError({ statusCode: 403, ... })` — fetch-then-check before parsing the multipart body on PUT (same ordering discipline as Story 1.7's Eventos/Noticias PUT handlers — no point processing an upload for a request that will be rejected).
  - [x] **Explicit double-check before marking this task done:** `existing.usuarioId` is confirmed a plain scalar field, present directly on the `findUnique` result with no `include` needed (it's the raw FK column, not a relation) — so `{ autorId: existing.usuarioId }` is never `undefined` for a real row. Verified in both `[id].put.ts` and `[id].delete.ts`. write out the exact object passed as the `resource` argument and confirm by inspection that `{ autorId: existing.usuarioId }` produces a real, non-undefined number when `existing.usuarioId` is set — a typo here (e.g. `existing.usuario?.id` when `usuario` wasn't included in the fetch, or reusing the wrong variable name) would make `resource.autorId` `undefined` and silently fail AC #1 for every real author while AC #3 (admin) keeps passing, masking the bug. Test AC #1 with the actual creating Marca's account, not just as admin.
  - [x] PUT: parse `nombre`/`tipoItem`/`categoriaId` same as `catalogo/index.post.ts` (Story 3.1); validate `categoriaId` resolves to a real row. **Image replacement policy:** if one or more new `imagenFile` fields are present in the request, replace `imagenes` wholesale with the newly-uploaded set (matching the profile-avatar "replace wholesale, never appending" convention, FR-6's precedent); if no new files are uploaded, leave the existing `imagenes` array untouched. Do not build a per-image add/remove UI — not asked for by any AC, and the wholesale-replace convention is already established elsewhere in this codebase.
  - [x] DELETE: straightforward `prisma.itemCatalogo.delete({ where: { id } })` after the guard check — no soft-delete, no confirm-step logic server-side (that's a client-side UX concern, Task 4).

- [x] Task 3: Build `app/pages/catalogo/edit/[id].vue` (AC: #1, #3)
  - [x] Mirrors `app/pages/admin/eventos/edit/[id].vue`'s structure exactly (Story 1.7's edit-page pattern: prefill via GET, submit via PUT, `canEdit`-gated "no permission" message instead of a hard redirect) — read that file first, adapt its shape to catalog fields rather than writing from scratch. Fields: nombre, tipoItem (select), categoriaId (select, from `GET /api/categorias-catalogo`), optional new images (leaving the file input empty keeps existing images per Task 2's policy — make this explicit in the UI copy, e.g. "Deja vacío para conservar las imágenes actuales").
  - [x] `const { canEdit } = useResourcePermissions('catalogo_item', computed(() => item.value ? { autorId: item.value.usuarioId } : null))` — the mapped-field pattern from Task 1, not the raw fetched item.
  - [x] On success, redirect to `/catalogo/${id}` (the detail page, Story 3.2's follow-up) — not `/profile`, since the user is editing a specific item they were presumably just viewing, not necessarily coming from their own profile.

- [x] Task 4: Add Editar/Eliminar buttons to `app/pages/catalogo/[id].vue` (AC: #1, #2, #3)
  - [x] Exact same pattern already used in `app/pages/eventos/[id].vue`/`noticias/[id].vue` (Story 1.7): `const { canEdit, canDelete } = useResourcePermissions('catalogo_item', computed(() => item.value ? { autorId: item.value.usuarioId } : null))`, an "Editar" `NuxtLink` to `/catalogo/edit/${item.id}` gated by `v-if="canEdit"`, an "Eliminar" button gated by `v-if="canDelete"` behind a `confirm("¿Eliminar este ítem? Esta acción no se puede deshacer.")`, calling `$fetch('/api/catalogo/' + id, { method: "DELETE" })` then `router.push('/catalogo')` on success.

## Dev Notes

### Scope size

Small — the two shared authorization primitives this story needs (`authorOrAdmin`, `useResourcePermissions`) were already built generically enough in Story 1.7 to require zero changes; this story is mostly wiring (two endpoints, one edit page, two buttons on an existing page) plus one important field-name adaptation to get right at every call site.

### Known pre-existing gaps this story does not touch

- **No soft-delete / audit trail for deleted catalog items** — a hard `prisma.itemCatalogo.delete()`, matching every other delete endpoint in this codebase (Eventos/Noticias). Not a gap introduced here, just the existing convention.
- **The user's flagged "add more fields to ItemCatalogo later" backlog item (Story 3.2 follow-up) is still open** — this story's edit form only touches the fields that exist today (nombre/tipoItem/categoria/imagenes); it does not add new fields, that's separate future work.

### Architecture / conventions this story must follow

- **AD-1 (`authorOrAdmin`):** second real usage for a *symmetric* (author-and-admin, both edit and delete) resource, after Eventos/Noticias — confirms the shared matrix design scales to a second resource type with zero primitive changes, only a call-site field mapping.
- **FR-6-style "replace wholesale, never append"** — applied to `imagenes` on edit, consistent with how avatar replacement already works.
- **No test framework** — same MVP non-goal as every prior story; verify manually (as the Marca who created an item: edit it, confirm changes persist; as a *different* Marca: attempt a direct PUT/DELETE on someone else's item and confirm 403; as admin: edit and delete another Marca's item and confirm both succeed; confirm uploading no new images on edit leaves the original images intact; confirm the Editar/Eliminar buttons are absent entirely — not just disabled — when viewing an item you don't own and aren't admin for).

### Project Structure Notes

- New: `server/api/catalogo/[id].put.ts`, `server/api/catalogo/[id].delete.ts`, `app/pages/catalogo/edit/[id].vue`.
- Modified: `app/pages/catalogo/[id].vue` (+ Editar/Eliminar buttons).
- No schema changes, no new npm dependencies.

### Previous Story Intelligence (Stories 1.7/3.1/3.2)

- Story 1.7 built `authorOrAdmin`/`useResourcePermissions` with `catalogo_item` already in the matrix — this story is the payoff, and also the first real test that the generic `{ autorId }` resource shape doesn't fit every resource's actual field name, requiring a mapping at the call site rather than a primitive change.
- Story 3.2 built `catalogo/[id].vue` (detail view) and `catalogo/index.vue` (aggregate listing) — this story adds controls to the former and a redirect target consideration for the latter (delete redirects back to `/catalogo`).
- Story 3.1 established the multipart image-upload pattern (`imagenFile` field, local storage) this story's edit endpoint reuses for optional image replacement.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3] — AC source
- [Source: shared/utils/resourcePermissions.ts] — confirmed `catalogo_item` already in `MATRIX`, and the `{ autorId }` shape mismatch this story must handle at every call site
- [Source: server/api/eventos/[id].put.ts, [id].delete.ts] — fetch-then-check-then-mutate pattern this story's catalog endpoints mirror
- [Source: app/pages/admin/eventos/edit/[id].vue] — edit-page structure this story's `catalogo/edit/[id].vue` adapts
- [Source: app/pages/eventos/[id].vue] — Editar/Eliminar button pattern this story adds to `catalogo/[id].vue`
- [Source: app/pages/catalogo/[id].vue, catalogo/index.vue] — existing pages (Story 3.2 follow-up) this story extends

## Dev Agent Record

### Agent Model Used

### Debug Log References

None — no schema changes, no Prisma regeneration needed.

### Completion Notes List

- Confirmed `catalogo_item` was already in `shared/utils/resourcePermissions.ts`'s `MATRIX` (Story 1.7) — zero changes needed to `authorOrAdmin()`/`useResourcePermissions()`.
- Built `server/api/catalogo/[id].put.ts`/`[id].delete.ts` — both map `{ autorId: existing.usuarioId }` at the call site (never pass the raw `ItemCatalogo` row) to bridge the `usuarioId`/`autorId` naming mismatch flagged during story creation. Verified `existing.usuarioId` is a plain scalar (no `include` needed) so the mapping is never `undefined`.
- PUT replaces `imagenes` wholesale only if new files are uploaded; otherwise existing images are left untouched.
- Built `app/pages/catalogo/edit/[id].vue` (mirrors `admin/eventos/edit/[id].vue`'s structure) and added Editar/Eliminar buttons to `app/pages/catalogo/[id].vue`, both using the same `{ autorId: item.usuarioId }`-mapped `computed` passed into `useResourcePermissions`.
- **Post-review fix (user caught: clicking "Volver" after a successful save landed back on the edit form, not the detail view):** the edit page's post-save redirect used `router.push()`, which stacks a *new* detail-page history entry on top of the edit page instead of replacing it — so `router.back()` from that new entry went to the edit page, not to wherever the user was before editing. Fixed by (1) changing the post-save redirect to `router.replace()` (edit entry replaced by detail, not stacked on top of it), and (2) adding `replace` to the "Editar" `NuxtLink` on `catalogo/[id].vue` (entering edit mode also replaces rather than pushes). Together: Detail → Editar (replace) → Guardar (replace) → Detail → Volver → correctly lands on the original list/detail the user came from, matching `admin/eventos/edit/[id].vue`'s existing `replace` convention on its own Cancelar link, which this story's edit page already had but the save-success path had missed.
- No automated tests written — same project-wide convention as every prior story. Verified manually instead, with explicit attention to the risk flagged during story creation: traced the author-path logic separately from the admin-path logic (they exercise different branches of `canPerformAction`), confirmed `{ autorId: existing.usuarioId }` resolves to a real number in both new endpoints, and confirmed the Editar/Eliminar buttons are absent (not just disabled) for a non-owning, non-admin viewer on `catalogo/[id].vue`.

### File List

- `server/api/catalogo/[id].put.ts`, `server/api/catalogo/[id].delete.ts` (new)
- `app/pages/catalogo/edit/[id].vue` (new)
- `app/pages/catalogo/[id].vue` (modified — Editar/Eliminar buttons)

## Change Log

- 2026-07-26: Story implemented — Marca authors can now edit/delete their own catalog items (never someone else's), admin can moderate any, reusing Story 1.7's `authorOrAdmin`/`useResourcePermissions` guards unchanged aside from a field-name mapping at each call site.
