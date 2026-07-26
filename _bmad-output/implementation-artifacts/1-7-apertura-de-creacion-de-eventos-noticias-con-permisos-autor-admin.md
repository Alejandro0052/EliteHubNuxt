---
baseline_commit: 1d528cb26f89c80c0048b3aabc9a38dc2455ad85
---

# Story 1.7: Apertura de creación de Eventos/Noticias con permisos autor/admin

Status: done

## Story

As any authenticated user,
I want to create Eventos/Noticias, and to edit/delete only my own unless I'm admin,
so that content creation isn't bottlenecked on admin, while abuse is still moderated.

## Acceptance Criteria

1. **Given** I am any authenticated Usuario, not just admin **When** I submit a new Evento or Noticia **Then** it is created successfully (FR-13)
2. **Given** I authored a specific Evento/Noticia **When** I attempt to edit or delete it **Then** the action succeeds
3. **Given** I did not author a specific Evento/Noticia and I am not admin **When** I attempt to edit or delete it **Then** the request is rejected server-side via the shared `authorOrAdmin(resourceType, action, resource, session)` guard (first real usage of this primitive; both edit and delete are admin-and-author-allowed for this resource type per AD-1's matrix)
4. **Given** I am admin **When** I edit or delete any Evento/Noticia regardless of authorship **Then** the action succeeds (FR-14)
5. **Given** any authenticated request reaches this guard **When** `requireSession()` runs **Then** `Usuario.activo`/`isAdmin` are freshly rechecked against the database, not trusted from a stale JWT claim (AD-4, first real usage of this shared primitive)
6. **Given** the edit/delete buttons on an Evento/Noticia **When** rendered client-side **Then** their visibility is driven by the shared `useResourcePermissions('evento_noticia', resource)` composable — first real usage of this primitive — never a bespoke `authStore.user?.isAdmin` check (UX-DR11)

## Tasks / Subtasks

- [x] Task 1: Create `shared/utils/resourcePermissions.ts` — the single source both the server guard and the client composable consume (AC: #3, #6)
  - [x] **This is the auto-imported `shared/` layer** (Nuxt 4: only `shared/utils/` and `shared/types/` auto-import — `shared/constants/` does not, per Story 1.1's confirmed finding). Server code (`server/utils/**`) cannot import from `app/`, and `app/` composables cannot import from `server/utils/**` — they're separate runtime bundles. Putting the actual matrix + decision logic here, once, is what lets Task 3's server guard and Task 4's client composable share it without duplicating the rule table.
  - [x] Transcribe AD-1's full Action → role matrix verbatim (it's already a ratified, final decision — not this story inventing new rules for resources it doesn't touch): `evento_noticia` (this story's actual consumer) plus `catalogo_item` and `publicacion` (future Epic 3/5 consumers, included now only because the matrix is fully decided already and adding the two extra rows costs nothing — but this story does **not** build any Catálogo/Publicación UI or endpoints, only the type/data). Reseñas is **not** included — its rule shape (`no self-edit; admin can only retract, a third action distinct from edit/delete`) doesn't fit this edit/delete-shaped function at all; it needs its own dedicated logic when Epic 4 builds it.
    ```ts
    export type ResourceType = "evento_noticia" | "catalogo_item" | "publicacion";
    export type ResourceAction = "edit" | "delete";

    interface PermissionRule {
      authorAllowed: boolean;
      adminAllowed: boolean;
    }

    const MATRIX: Record<ResourceType, Record<ResourceAction, PermissionRule>> = {
      evento_noticia: {
        edit: { authorAllowed: true, adminAllowed: true },
        delete: { authorAllowed: true, adminAllowed: true },
      },
      catalogo_item: {
        edit: { authorAllowed: true, adminAllowed: true },
        delete: { authorAllowed: true, adminAllowed: true },
      },
      publicacion: {
        edit: { authorAllowed: true, adminAllowed: false },
        delete: { authorAllowed: true, adminAllowed: true },
      },
    };

    export function canPerformAction(
      resourceType: ResourceType,
      action: ResourceAction,
      resource: { autorId: number | null | undefined },
      actor: { id: number; isAdmin: boolean },
    ): boolean {
      const rule = MATRIX[resourceType][action];
      if (actor.isAdmin && rule.adminAllowed) return true;
      if (rule.authorAllowed && resource.autorId === actor.id) return true;
      return false;
    }
    ```
  - [x] Note on AD-1's literal signature text (`authorOrAdmin(resource, action, session)`, 3 args): the architecture prose is a shorthand illustration, not literal code — a per-resource matrix lookup is impossible without knowing *which* resource type is being checked, so `resourceType` must be an explicit parameter for the function to work at all. Task 3/4 both add it as the first argument, matching the AC's own `useResourcePermissions('evento_noticia', resource)` call shape.

- [x] Task 2: Create `server/utils/requireSession.ts` (AC: #5)
  - [x] **This file does not exist yet** (marked `NEW` in ARCHITECTURE-SPINE's structural seed; flagged as a known gap in Stories 1.5 and 1.6, now genuinely needed). This is the first story to actually build it.
    ```ts
    import { getServerSession } from "#auth";

    export async function requireSession(event: any, options: { requireAdmin?: boolean } = {}) {
      const session = await getServerSession(event);
      if (!session?.user?.id) {
        throw createError({ statusCode: 401, message: "No autenticado" });
      }

      const usuario = await prisma.usuario.findUnique({ where: { id: parseInt(session.user.id as string) } });
      if (!usuario || !usuario.activo) {
        throw createError({ statusCode: 401, message: "Tu sesión ya no es válida. Inicia sesión de nuevo." });
      }

      if (options.requireAdmin && !usuario.isAdmin) {
        throw createError({ statusCode: 403, message: "No autorizado" });
      }

      return usuario;
    }
    ```
  - [x] The 401 message ("Tu sesión ya no es válida. Inicia sesión de nuevo.") is the exact ratified copy from `EXPERIENCE.md`'s State Patterns table ("Forced logout on deactivation") — reused verbatim here even though **this story does not build the client-side redirect-on-401 behavior that copy describes**. That global "any 401 anywhere → redirect to /login with this message" interceptor is explicitly Story 2.4's job ("per Story 1.7's `requireSession()` DB-recheck") — Story 2.4 is still `backlog`. Do not build a global `$fetch` interceptor/plugin in this story; it's out of scope here and would be premature (no other endpoint calls `requireSession()` yet to make a global interceptor meaningful).
  - [x] `requireSession()` returns the **fresh** `usuario` row (real `id`/`isAdmin`/`activo` from the DB just queried) — callers use this returned object, never the original JWT `session.user` fields, for any subsequent authorization decision.

- [x] Task 3: Create `server/utils/guards/authorOrAdmin.ts` (AC: #3, #4)
  - [x] New `server/utils/guards/` directory (also marked `NEW` in the structural seed). Thin wrapper over Task 1's shared logic — no duplicated matrix here:
    ```ts
    import { canPerformAction, type ResourceType, type ResourceAction } from "#shared/utils/resourcePermissions";

    export function authorOrAdmin(
      resourceType: ResourceType,
      action: ResourceAction,
      resource: { autorId: number | null | undefined },
      session: { id: number; isAdmin: boolean },
    ): boolean {
      return canPerformAction(resourceType, action, resource, session);
    }
    ```

- [x] Task 4: Create `app/composables/useResourcePermissions.ts` (AC: #6)
  - [x] Also marked `NEW` in the structural seed (AD-6). Client-side mirror using the **same** shared `canPerformAction` — not a re-implementation:
    ```ts
    import { canPerformAction, type ResourceType } from "#shared/utils/resourcePermissions";

    export function useResourcePermissions(
      resourceType: ResourceType,
      resource: Ref<{ autorId: number | null | undefined } | null | undefined>,
    ) {
      const authStore = useAuthStore();

      const canEdit = computed(() => {
        const r = resource.value;
        const u = authStore.user;
        if (!r || !u) return false;
        return canPerformAction(resourceType, "edit", r, { id: u.id, isAdmin: !!u.isAdmin });
      });

      const canDelete = computed(() => {
        const r = resource.value;
        const u = authStore.user;
        if (!r || !u) return false;
        return canPerformAction(resourceType, "delete", r, { id: u.id, isAdmin: !!u.isAdmin });
      });

      // Reseñas' retract action doesn't fit this matrix shape (see Task 1) — always false until Epic 4 gives it real logic.
      const canRetract = computed(() => false);

      return { canEdit, canDelete, canRetract };
    }
    ```
  - [x] `useAuthStore()`'s `user.isAdmin` is only populated post-mount (see Story 1.5's Dev Notes on this same limitation) — acceptable here since this composable only drives *button visibility* on an already-rendered page, not a route guard; a brief flash of hidden buttons while the store initializes is fine (matches how every other page in this codebase already reads `authStore.user`).

- [x] Task 5: Open Evento/Noticia creation to any authenticated Usuario (AC: #1)
  - [x] `server/api/eventos/index.post.ts` and `server/api/noticias/index.post.ts`: replace `const session = await getServerSession(event); if (!session?.user?.id || !session.user.isAdmin) throw createError({ statusCode: 403, message: 'No autorizado' })` with `const usuario = await requireSession(event)` (no `requireAdmin` option — any active authenticated Usuario). Replace `autorId: parseInt(session.user.id as string)` with `autorId: usuario.id`.
  - [x] `app/pages/admin/eventos/create.vue` and `app/pages/admin/noticias/create.vue`: the gate `v-if="!authStore.user?.isAdmin"` (with copy "Solo administradores pueden crear eventos/noticias") must become `v-if="!authStore.isAuthenticated"` (copy: "Debes iniciar sesión para crear un evento/una noticia.") — any authenticated user, not just admin. Same change in `handleSubmit()`'s guard (`if (!authStore.user?.isAdmin)` → `if (!authStore.isAuthenticated)`).
  - [x] **Do not relocate these pages out of `/admin/eventos/create` and `/admin/noticias/create`.** The URL segment is now a misnomer (any authenticated user, not just admin, can reach it) but renaming/moving routes isn't in this story's AC — flag it as a minor pre-existing information-architecture inconsistency, not a blocker.

- [x] Task 6: Gate edit/delete server-side with `authorOrAdmin` (AC: #2, #3, #4, #5)
  - [x] `server/api/eventos/[id].put.ts` and `server/api/noticias/[id].put.ts`: replace the admin-only check with: `const usuario = await requireSession(event);` then fetch the existing record first (`const existing = await prisma.evento.findUnique({ where: { id: parseInt(id) } }); if (!existing) throw createError({ statusCode: 404, message: 'Evento no encontrado' });`), then `if (!authorOrAdmin("evento_noticia", "edit", existing, usuario)) throw createError({ statusCode: 403, message: "No autorizado" });` — **fetch-then-check must happen before** parsing the multipart form body (no point processing an upload for a request that will be rejected).
  - [x] `server/api/eventos/[id].delete.ts` and `server/api/noticias/[id].delete.ts`: same pattern with `"delete"` as the action — fetch the record, `requireSession()`, `authorOrAdmin(..., "delete", ...)`, then `prisma.evento.delete(...)`/`prisma.noticia.delete(...)`.
  - [x] `evento.autorId`/`noticia.autorId` are already nullable (`autorId Int?`) — a record with `autorId: null` (shouldn't happen post-Task-5, but pre-existing rows might have it) means `authorOrAdmin` correctly returns `false` for a non-admin actor (no author to match), which is the safe default — do not special-case null `autorId` as "anyone can edit."

- [x] Task 7: Build edit pages (AC: #2, #4, #6)
  - [x] New `app/pages/admin/eventos/edit/[id].vue` and `app/pages/admin/noticias/edit/[id].vue`, adapted directly from the sibling `create.vue` (same field set, same multipart-form submission shape) — **read `create.vue` in full first**, don't rewrite from scratch. Differences from `create.vue`: (a) `onMounted` fetches the existing record (`$fetch(`/api/eventos/${route.params.id}`)`) and prefills the form refs; (b) submits via `$fetch(`/api/eventos/${id}`, { method: "PUT", body: fd })` instead of POST; (c) the permission gate uses `useResourcePermissions("evento_noticia", eventoRef).canEdit` instead of `authStore.user?.isAdmin` (AC #6) — show "No tienes permiso para editar este evento/esta noticia." when `canEdit` is false, instead of the old "Solo administradores..." copy.
  - [x] In `app/pages/eventos/[id].vue` and `app/pages/noticias/[id].vue` (currently **no edit/delete UI exists at all** — confirmed by reading both files in full): add an "Editar" button (`NuxtLink` to `/admin/eventos/edit/${evento.id}` or `/admin/noticias/edit/${noticia.id}`) gated by `v-if="canEdit"`, and an "Eliminar" button gated by `v-if="canDelete"` that calls `$fetch(`/api/eventos/${id}`, { method: "DELETE" })` behind a native `confirm("¿Eliminar este evento/esta noticia? Esta acción no se puede deshacer.")`, then `router.push("/eventos")`/`router.push("/noticias")` on success. Both driven by `const { canEdit, canDelete } = useResourcePermissions("evento_noticia", evento)` (AC #6) — never a bespoke `authStore.user?.isAdmin` check.

## Dev Notes

### Scope size — read this before starting

This story is larger than Stories 1.4–1.6: it builds **three** shared primitives from scratch (`shared/utils/resourcePermissions.ts`, `server/utils/requireSession.ts`, `server/utils/guards/authorOrAdmin.ts`, plus the composable) that architecturally matter beyond just this story (Epics 3/4/5 will consume them), touches 6 existing `server/api/eventos|noticias/**` files, and — because **no edit/delete UI exists anywhere today** for Eventos/Noticias (confirmed by reading `eventos/[id].vue`, `noticias/[id].vue` in full: read-only detail pages, no buttons at all) — builds 2 new edit pages and adds buttons to 2 existing detail pages. Do not shortcut Task 7 by skipping the UI and calling the story done at the API layer; AC #6 explicitly requires visible, permission-gated buttons.

### Known pre-existing gaps this story does not touch

- **The global "401 → redirect to /login with 'Tu sesión ya no es válida...'" client-side behavior is explicitly Story 2.4's job**, not this one — see Task 2. Don't build a `$fetch` interceptor/plugin here.
- **`activeUserFilter()` (AD-5) still does not exist** — irrelevant to this story (Eventos/Noticias listing filtering by author's `activo` status is Story 2.4/FR-40 territory, not FR-13/FR-14).
- **FR-13/FR-14 in this story only cover Eventos/Noticias.** Ítems de Catálogo (Epic 3) and Publicaciones (Epic 5) get the *same* `authorOrAdmin`/`useResourcePermissions` primitives reused later — this story does not build their endpoints or UI, only leaves the matrix rows ready in `shared/utils/resourcePermissions.ts`.
- **`/admin/eventos/create` and `/admin/noticias/create` URL naming is now a minor misnomer** (non-admin authenticated users can reach it) — not fixed here, see Task 5.

### Architecture / conventions this story must follow

- **AD-1:** `authorOrAdmin` is matrix-driven and action-aware (`edit`/`delete` behave differently per resource type) — this story's implementation adds an explicit `resourceType` first parameter beyond AD-1's shorthand 3-arg description, which is necessary for the function to work at all (see Task 1's note).
- **AD-4:** `requireSession()` performs the DB recheck exactly once per request; every authenticated handler this story touches calls it first, before any other logic (including before parsing multipart form bodies on PUT).
- **AD-6:** `useResourcePermissions(resourceType, resource)` is the only sanctioned way to drive edit/delete button visibility — never a new inline `authStore.user?.isAdmin` check, even though that pattern is still used elsewhere in this codebase (e.g. `admin/users/index.vue`) — this story does not retrofit those, only ensures its own new/touched surfaces do it right.
- **Prisma singleton / `createError` conventions** — unchanged, same as every prior story.
- **No test framework** — same MVP non-goal as every prior story; verify manually (trace both the author-success and non-author-403 paths for edit and delete, on both resource types, as both a regular user and an admin).

### Project Structure Notes

- New: `shared/utils/resourcePermissions.ts`, `server/utils/requireSession.ts`, `server/utils/guards/authorOrAdmin.ts`, `app/composables/useResourcePermissions.ts`, `app/pages/admin/eventos/edit/[id].vue`, `app/pages/admin/noticias/edit/[id].vue`.
- Modified: `server/api/eventos/index.post.ts`, `server/api/eventos/[id].put.ts`, `server/api/eventos/[id].delete.ts`, `server/api/noticias/index.post.ts`, `server/api/noticias/[id].put.ts`, `server/api/noticias/[id].delete.ts`, `app/pages/admin/eventos/create.vue`, `app/pages/admin/noticias/create.vue`, `app/pages/eventos/[id].vue`, `app/pages/noticias/[id].vue`.
- No schema changes (`Evento.autorId`/`Noticia.autorId` already exist and are already nullable, already set correctly on create). No new npm dependencies.

### Previous Story Intelligence (Stories 1.5/1.6)

- Story 1.5 found that `header.vue` passed a slot to `<UserDropdown>` that the component never rendered — a reminder to read the full component/page being modified before assuming a prop/behavior works. This story reads `create.vue`, `[id].vue` (both resources) in full before touching them for exactly this reason.
- Story 1.6 hit a real Vue `<script setup>` bug: a local `ref` named identically to an auto-imported component made the component silently fail to resolve, with zero console output. Watch for the same class of issue here — `useResourcePermissions`'s returned `canEdit`/`canDelete` names don't collide with any existing component name in this codebase, confirmed by search.
- Both stories confirmed the `activo: true` / DB-recheck pattern matters (SM-4/NFR-4/AD-4) — this story is the first to actually build the shared primitive those stories could only flag as missing.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.7] — story statement and AC source
- [Source: _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md#AD-1, #AD-4, #AD-6, Structural Seed] — action→role matrix, `requireSession()`/`authorOrAdmin`/`useResourcePermissions` all marked NEW
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/EXPERIENCE.md#State Patterns] — "Tu sesión ya no es válida. Inicia sesión de nuevo." exact copy (reused by `requireSession()`'s 401 message; full redirect behavior deferred to Story 2.4)
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.4, #UX-DR11] — confirms the global 401-redirect behavior and `activeUserFilter()` are Story 2.4's scope, not this story's
- [Source: server/api/eventos/index.post.ts, [id].put.ts, [id].delete.ts, index.get.ts, [id].get.ts] — current admin-only implementation this story opens up
- [Source: server/api/noticias/index.post.ts, [id].put.ts, [id].delete.ts] — confirmed byte-for-byte symmetric with the eventos equivalents
- [Source: app/pages/admin/eventos/create.vue, app/pages/admin/noticias/create.vue] — existing create-form pattern Task 7's edit pages are adapted from
- [Source: app/pages/eventos/[id].vue, app/pages/noticias/[id].vue] — confirmed no edit/delete UI exists today
- [Source: app/stores/auth.ts] — `User` interface shape (`id: number`, `isAdmin?: boolean`) the composable reads

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

None — no schema changes, no Prisma regeneration needed.

### Completion Notes List

- Built the three shared primitives from scratch: `shared/utils/resourcePermissions.ts` (matrix + `canPerformAction`, all three known resource rows transcribed from AD-1, Reseñas intentionally excluded), `server/utils/requireSession.ts` (AD-4, DB-recheck of `activo`, reuses the exact ratified "Tu sesión ya no es válida..." copy for its 401 — the global redirect behavior that copy implies stays Story 2.4's job), `server/utils/guards/authorOrAdmin.ts` (thin wrapper over the shared matrix logic), and `app/composables/useResourcePermissions.ts` (client mirror, same shared logic, `canRetract` stubbed `false` until Epic 4).
- Opened `POST /api/eventos` and `POST /api/noticias` to any authenticated Usuario via `requireSession()` (no `requireAdmin`), and updated `create.vue` for both to gate on `authStore.isAuthenticated` instead of `isAdmin`.
- Added `authorOrAdmin('evento_noticia', action, existing, usuario)` checks to both resources' `[id].put.ts`/`[id].delete.ts`, fetching the existing record and checking permission **before** parsing the multipart body on PUT (no wasted upload work on a request that will be rejected).
- Built `app/pages/admin/eventos/edit/[id].vue` and `.../noticias/edit/[id].vue` (adapted from the sibling `create.vue`, prefilled via GET, submitted via PUT, gated by `canEdit`), and added Editar/Eliminar buttons to both `[id].vue` detail pages — neither existed in any form before this story.
- **Post-review fix (user caught: normal users saw no "Crear" button anywhere, and no "Eliminar" on existing content):** this story updated `admin/eventos/create.vue`/`admin/noticias/create.vue`'s own internal gate, but missed **four other pre-existing entry points** still hardcoded to `authStore.user?.isAdmin`: the homepage's (`app/pages/index.vue`) "Crear" quick-links next to the Noticias/Eventos section headers, and the identical "Crear" buttons on the `/eventos` and `/noticias` listing pages themselves (`app/pages/eventos/index.vue`, `app/pages/noticias/index.vue`). A normal user had no way to reach the create form at all, so naturally never created anything, so naturally never saw "Eliminar" on any content (all pre-existing eventos/noticias were admin-authored — `canDelete` was correctly `false` for a non-author, non-admin viewer, not a bug). Fixed all four `v-if="authStore.user?.isAdmin"` → `v-if="authStore.isAuthenticated"`, matching FR-13.
- No automated tests written — same project-wide convention as every prior story. Verified manually instead: traced `canPerformAction`'s logic against all four AC-required cases (author edit/delete, admin edit/delete on someone else's content, non-author-non-admin rejected) for `evento_noticia`; confirmed the PUT/DELETE handlers fetch-then-check in the right order; confirmed no ref/component name collisions (the Story 1.6 class of bug) — `evento`/`noticia`/`canEdit`/`canDelete` don't shadow any auto-imported component in this codebase.

### File List

- `shared/utils/resourcePermissions.ts` (new)
- `server/utils/requireSession.ts` (new)
- `server/utils/guards/authorOrAdmin.ts` (new)
- `app/composables/useResourcePermissions.ts` (new)
- `app/pages/admin/eventos/edit/[id].vue` (new)
- `app/pages/admin/noticias/edit/[id].vue` (new)
- `server/api/eventos/index.post.ts` (modified)
- `server/api/eventos/[id].put.ts` (modified)
- `server/api/eventos/[id].delete.ts` (modified)
- `server/api/noticias/index.post.ts` (modified)
- `server/api/noticias/[id].put.ts` (modified)
- `server/api/noticias/[id].delete.ts` (modified)
- `app/pages/admin/eventos/create.vue` (modified)
- `app/pages/admin/noticias/create.vue` (modified)
- `app/pages/eventos/[id].vue` (modified)
- `app/pages/noticias/[id].vue` (modified)
- `app/pages/index.vue` (modified — homepage "Crear" quick-links now open to any authenticated user)
- `app/pages/eventos/index.vue` (modified — same fix on the listing page's "Crear" button)
- `app/pages/noticias/index.vue` (modified — same fix on the listing page's "Crear" button)

## Change Log

- 2026-07-26: Story implemented — Eventos/Noticias creation opened to any authenticated user; author-or-admin edit/delete enforced server-side via new shared guards; edit/delete UI built from scratch (none existed before).
