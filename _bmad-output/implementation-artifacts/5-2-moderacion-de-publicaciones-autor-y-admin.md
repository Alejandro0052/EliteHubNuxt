---
baseline_commit: 3ae498dc03620c39a69f37577aefce9faf9b7ba7
---

# Story 5.2: Moderación de publicaciones — autor y admin

Status: done

## Story

As the author of a Publicación,
I want to edit or delete my own posts, with admin able to remove but not edit any,
so that I control my content while abuse can still be moderated appropriately.

## Acceptance Criteria

1. **Given** I authored a Publicación **When** I attempt to edit or delete it **Then** the action succeeds (FR-28)
2. **Given** a Publicación authored by someone else **When** I am not admin and attempt to edit or delete it **Then** the request is rejected via `authorOrAdmin(resource, action, session)`
3. **Given** I am admin **When** I attempt to delete another Usuario's Publicación **Then** the action succeeds
4. **Given** I am admin **When** I attempt to EDIT another Usuario's Publicación **Then** the action is rejected — admin may delete but never edit another's post, per AD-1's asymmetric matrix for this resource, distinct from Eventos/Noticias and Catálogo's uniform matrix

## Tasks / Subtasks

- [x] Task 1: Read what's already built before writing anything (AC: all)
  - [x] **`shared/utils/resourcePermissions.ts`'s `MATRIX.publicacion` already matches this story's ACs exactly** — `edit: { authorAllowed: true, adminAllowed: false }`, `delete: { authorAllowed: true, adminAllowed: true }` (built speculatively ahead of schedule, same as `resena` was before Story 4.x). **Zero changes needed to the permission matrix, `authorOrAdmin`, or `useResourcePermissions` for this story** — it was already correctly asymmetric (admin delete yes, admin edit no) from the moment it was added, unlike `catalogo_item`/`evento_noticia` which are symmetric.
  - [x] `Publicacion.autorId`/`autor` already follows the canonical naming convention literally (unlike `ItemCatalogo.usuarioId`) — so `authorOrAdmin("publicacion", action, { autorId: existing.autorId }, usuario)` needs **no field-name remapping** at any call site, server or client.
  - [x] `PublicacionCard.vue` (Story 5.1) currently renders read-only — no edit/delete affordance at all. It's rendered inside `InfiniteScrollList`'s internal `v-for`, which owns its own `items` state internally (via `useInfiniteScroll`) with no parent-exposed method to splice/update a single item. Story 5.1 already worked around this once for "add a new post" (bumping a `feedKey` to force a full remount+refetch) — **do not repeat that approach for delete**; instead handle delete as **local component state** inside `PublicacionCard.vue` itself: on successful DELETE, flip a local `eliminada` ref and wrap the card's root in `v-if="!eliminada"` so it disappears immediately without touching `InfiniteScrollList`/`index.vue` at all. For edit, mutate the `publicacion` prop's object **in place** (`Object.assign(props.publicacion, actualizada)`) rather than reassigning it — since `InfiniteScrollList`'s `items` is a reactive array of objects, an in-place mutation of one element is picked up by Vue's reactivity with zero parent involvement, matching the general "don't touch shared primitives unless truly necessary" discipline established in 5.1's Dev Notes.
  - [x] Reuse `useConfirm()`/`askConfirm()` (the app-wide styled confirm dialog, not `window.confirm`) for the delete confirm step — same pattern already used in `ResenasSection.vue`, `catalogo/[id].vue`, `eventos/[id].vue`, `noticias/[id].vue`.

- [x] Task 2: Build `server/api/publicaciones/[id].put.ts` (AC: #1, #2, #4)
  - [x] `const usuario = await requireSession(event)`, fetch the existing `Publicacion` by id (404 if missing), then `if (!authorOrAdmin('publicacion', 'edit', { autorId: existing.autorId }, usuario)) throw createError({ statusCode: 403, message: 'No autorizado' })` — fetch-then-check before parsing the multipart body, same ordering discipline as every prior edit endpoint this session.
  - [x] Multipart form, same shape as `publicaciones/index.post.ts`: `texto` (required, non-empty after trim — 400 otherwise) and an optional new `imagenFile`. **Image replace policy, matching the catálogo-edit precedent (FR-6-style "replace wholesale, never append"):** if a new `imagenFile` is present, replace `imagen` with the newly-uploaded file; if not, leave the existing `imagen` untouched (including if it was already `null` — editing text doesn't force an image requirement).
  - [x] `prisma.publicacion.update({ where: { id: existing.id }, data: { texto, imagen } })`, return the updated row **with `autor` included** (same shape as create/list) so the client can update its local display without a second fetch.

- [x] Task 3: Build `server/api/publicaciones/[id].delete.ts` (AC: #1, #2, #3)
  - [x] Same guard pattern as Task 2 but `authorOrAdmin('publicacion', 'delete', { autorId: existing.autorId }, usuario)` — author or admin, per the matrix.
  - [x] `prisma.publicacion.delete({ where: { id: existing.id } })` — hard delete, no soft-delete/audit trail, matching every other delete endpoint in this codebase (Eventos/Noticias/Catálogo; Reseñas' `retractada` flag is a Reseña-specific exception per Epic 4, not the general pattern).

- [x] Task 4: Add Editar/Eliminar controls to `app/components/PublicacionCard.vue` (AC: #1, #2, #3, #4)
  - [x] Compute permissions the same way `ResenasSection.vue` does for its per-row list items (`canPerformAction` called directly, not the `useResourcePermissions` composable — this card is one instance among many rendered by a `v-for` inside `InfiniteScrollList`, and a composable can't be called per-iteration): `canEdit: canPerformAction('publicacion', 'edit', { autorId: publicacion.autorId }, actor)`, `canDelete: canPerformAction('publicacion', 'delete', { autorId: publicacion.autorId }, actor)`, using `useAuthStore().user` for the actor (mirroring `ResenasSection.vue`'s `permisos(r)` helper exactly).
  - [x] "Editar" (author-only — never shown to admin viewing someone else's post, per AC #4) toggles an inline edit form in place: textarea pre-filled with `publicacion.texto`, optional new-image file input (label "Deja vacío para conservar la imagen actual" if `publicacion.imagen` is set, matching the catálogo-edit UI copy convention), Guardar/Cancelar buttons. On save: `PUT /api/publicaciones/${id}` with `FormData`, then `Object.assign(props.publicacion, actualizada)` (Task 1's in-place-mutation note) and close the edit form; `useToast()` success/error feedback matching every other edit flow this session.
  - [x] "Eliminar" (author OR admin, per AC #1/#3) behind `askConfirm({ message: '¿Eliminar esta publicación? Esta acción no se puede deshacer.' })`, then `DELETE /api/publicaciones/${id}`, then set the local `eliminada` ref (Task 1's note) so the card disappears immediately; `useToast()` feedback.
  - [x] Neither control renders for a viewer who is neither the author nor (for delete) admin — controls simply absent, never a visible-but-disabled button (matching this app's established permission-UI convention throughout Epics 3/4).

## Dev Notes

### Scope size

Small — matches Story 3.3's shape almost exactly (permission matrix already built and already correct, zero primitive changes, two new endpoints, UI wiring on an existing card component). The one small wrinkle unique to this story is `PublicacionCard.vue` living inside `InfiniteScrollList`'s opaque internal list state, requiring the local-component-state workaround in Task 1/4 instead of the more typical parent-array-splice pattern used elsewhere (e.g. `ResenasSection.vue`, which owns its own `resenas` array directly).

### Architecture / conventions this story must follow

- **`authorOrAdmin`/`canPerformAction` reuse, zero primitive changes** — third resource type (after `catalogo_item`/`evento_noticia`'s symmetric matrices and `resena`'s admin-retract-only-no-delete-anymore matrix) to prove the shared permission system handles a third distinct shape (admin delete yes, admin edit no) with no code changes to the matrix itself, since it was already built correctly.
- **`askConfirm()` for the destructive step**, not `window.confirm` — this app-wide primitive was built during Epic 4's post-review rounds specifically to replace every native browser confirm dialog; a new delete flow must use it from the start, not introduce a new native `confirm()` that would then need its own future cleanup pass.
- **No test framework** — same MVP non-goal as every prior story. Verify manually with at least three accounts/roles: as the post's actual author, edit it (confirm the text/image change persists) and separately delete a different post you authored (confirm it disappears immediately); as a different non-owning, non-admin Usuario, confirm you see neither Editar nor Eliminar on someone else's post, and confirm a raw PUT/DELETE against someone else's post 403s; as admin, confirm you see Eliminar (and it works) but never Editar on another Usuario's post — this AC (#4) is the one most likely to be silently wrong if the matrix is ever touched, so verify it explicitly rather than assuming the existing `adminAllowed: false` on edit still holds.

### Project Structure Notes

- New: `server/api/publicaciones/[id].put.ts`, `server/api/publicaciones/[id].delete.ts`.
- Modified: `app/components/PublicacionCard.vue` (Editar/Eliminar UI, local `eliminada` state, in-place prop mutation on edit).
- Not touched: `shared/utils/resourcePermissions.ts`, `app/composables/useResourcePermissions.ts`, `app/components/InfiniteScrollList.vue`, `app/composables/useInfiniteScroll.ts`, `app/pages/index.vue` — all confirmed unnecessary by Task 1's research.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5 / Story 5.2] — verbatim ACs
- [Source: shared/utils/resourcePermissions.ts] — confirmed `publicacion` MATRIX entry already matches this story's required shape exactly
- [Source: _bmad-output/implementation-artifacts/3-3-edicion-y-borrado-de-items-de-catalogo.md] — closest structural precedent (author+admin edit/delete wiring on an existing content type)
- [Source: app/components/ResenasSection.vue] — per-row `canPerformAction` call pattern (composable can't be used inside a `v-for`), `askConfirm()` usage pattern
- [Source: app/components/PublicacionCard.vue, app/components/InfiniteScrollList.vue] — current read-only card, and the opaque-internal-list-state constraint driving this story's local-mutation approach

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

### Completion Notes List

- Confirmed `MATRIX.publicacion` needed zero changes — the asymmetric admin-delete-yes/admin-edit-no shape was already correct from Story 5.1's speculative build.
- Delete handled as local component state (`eliminada` ref + `v-if`) rather than lifting state into `InfiniteScrollList`/`index.vue`; edit handled via in-place `Object.assign` on the `publicacion` prop object. Neither shared primitive (`InfiniteScrollList`, `useInfiniteScroll`, `index.vue`) was touched.
- No automated tests written — established MVP convention. Manual verification steps listed in Dev Notes; AC #4 (admin never sees/can use Editar on another user's post) is the one most worth testing explicitly rather than assuming.

### File List

- server/api/publicaciones/[id].put.ts (new)
- server/api/publicaciones/[id].delete.ts (new)
- app/components/PublicacionCard.vue (modified — Editar/Eliminar UI, permission checks, local delete/edit state handling)
