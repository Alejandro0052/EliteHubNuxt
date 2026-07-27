---
baseline_commit: bc0b0901797c18b41134c1280cf9d9220667c819
---

# Story 4.1: Dejar y ver reseñas de nutricionista

Status: done

## Story

As an authenticated user,
I want to leave a rating+comment review on a nutricionista's profile and see their especialidad,
so that I can share and read real reputation signals, not just a bio.

## Acceptance Criteria

1. **Given** I am authenticated and viewing a Nutricionista's detail page **When** I submit a rating + comment **Then** a Reseña is created and visible on that profile to anyone who can view it (FR-24)
2. **Given** no booking/consumption record exists to verify I actually used the nutricionista's services **When** I submit a review **Then** no technical gate blocks it — this is a **confirmed decision, not a gap** (PRD §5.9 Out of Scope). Do not add any "have you used this nutricionista" check.
3. **Given** I have already reviewed a specific Nutricionista **When** I attempt to submit a second review for them **Then** the button/form is replaced with "Ya dejaste una reseña para {nombre}" and the server rejects a duplicate submission with a 409 (FR-37)
4. **Given** a Nutricionista's detail view **When** I view it **Then** I see their `especialidad` field alongside name/photo/reviews (FR-25) — **note:** `especialidad` is already displayed today (`UsuarioDetailView.vue:112`, built in Story 2.2); this AC is a re-confirmation in the reviews context, not new work. Verify it still renders correctly once the Reseñas section is added below it, don't skip re-checking it.

## Tasks / Subtasks

- [x] Task 1: Read what's already built before writing anything (AC: all)
  - [x] No `Resena` model exists yet in `prisma/schema.prisma` — this story creates it from scratch (see Task 2). Confirmed via full schema read: only `Usuario`, `Informacion`, `TipoUsuario`, `ItemCatalogo`, `Noticia`, `Evento`, etc. exist.
  - [x] `shared/utils/resourcePermissions.ts`'s `MATRIX`/`ResourceType`/`ResourceAction` **must NOT be touched by this story**. Per Architecture AD-1's action→role matrix, Reseñas have **no self-edit, no delete for the author, and admin's only allowed action is a distinct `"retract"`** (not `"edit"`/`"delete"`) — that's Story 4.2's concern (it will extend `ResourceAction` and add a `resena` entry to `MATRIX`, or build a parallel primitive). This story is **create + read only**: no edit/delete UI for a review's own author, no `useResourcePermissions()` call anywhere in this story's scope.
  - [x] `especialidad` (FR-25) already exists on `Informacion` and is already rendered in `UsuarioDetailView.vue` (line 112, `add("Especialidad", info.especialidad)`) for the `Nutricionista` branch — no schema or display work needed for AC #4 beyond re-verifying it after adding the Reseñas section.
  - [x] `requireSession(event)` (`server/utils/requireSession.ts`) already eager-loads `informacion.tipoUsuario`, so `usuario.informacion?.tipoUsuario?.tipo` is available on its return value without an extra query. `requireType(event, tipo)` (`server/utils/guards/requireType.ts`) gates the **acting session user's own type** — it is the wrong tool for checking whether the **reviewed party** (`nutricionistaId` in the request body, a different Usuario) is a Nutricionista. Do not call `requireType` for that check; do a plain `prisma.usuario.findUnique` with `include: { informacion: { include: { tipoUsuario: true } } }` on the target id instead, and compare `tipoUsuario?.tipo === "Nutricionista"` manually.
  - [x] Per Architecture AD-5, **Reseñas are explicitly excluded from the FR-40 deactivation cascade for MVP** — a deactivated/blocked Usuario's authored Reseñas remain visible (matches PRD §11's already-recorded deferral). Do **not** wrap the Reseñas GET query in `activeUserFilter()` the way Publicaciones/Eventos/Catálogo are. This is a confirmed non-goal, not an oversight to fix.
  - [x] No self-review exclusion — PRD explicitly leaves this unblocked in MVP (§11 deferred edge cases: "self-review not excluded on Nutricionista profiles"). Do not add a check preventing a Nutricionista from reviewing themselves.

- [x] Task 2: Extend `prisma/schema.prisma` with the `Resena` model (AC: #1, #3)
  - [x] Add to `Usuario`: two named relations, `resenasEscritas Resena[] @relation("ResenaAutor")` and `resenasRecibidas Resena[] @relation("ResenaNutricionista")` — Architecture's Consistency Conventions table explicitly calls out `Resena` as the one model needing two distinctly-named relations (`autor` and `nutricionista`), not a single generic `autor` like `Noticia`/`Evento`/`ItemCatalogo`.
  - [x] New model:
    ```prisma
    model Resena {
      id              Int      @id @default(autoincrement())
      rating          Int
      comentario      String
      autorId         Int
      autor           Usuario  @relation("ResenaAutor", fields: [autorId], references: [id], onDelete: Cascade, onUpdate: Cascade)
      nutricionistaId Int
      nutricionista   Usuario  @relation("ResenaNutricionista", fields: [nutricionistaId], references: [id], onDelete: Cascade, onUpdate: Cascade)
      retractada      Boolean  @default(false)
      createdAt       DateTime @default(now())
      updatedAt       DateTime @updatedAt

      @@unique([autorId, nutricionistaId])
    }
    ```
  - [x] `@@unique([autorId, nutricionistaId])` is the DB-level backstop for FR-37 (one review per user per nutricionista) — it produces a Prisma-generated compound key named `autorId_nutricionistaId`, which Task 3's duplicate check queries by. This is the "second, unbuilt" guard the Architecture spine names `reviewLimit` in its structural seed (`server/utils/guards/`) — build it as a small helper function, not inline duplicated logic (see Task 3).
  - [x] **`retractada Boolean @default(false)` is deliberately included now even though this story never sets it true** — it's forward-looking schema for Story 4.2's retract action (a distinct moderation flag, not a hard delete — Architecture AD-1 explicitly separates "retract" from "delete"). Task 4's GET endpoint filters `where: { retractada: false }` from day one so Story 4.2 only has to add a PATCH endpoint that flips this flag — no query changes needed downstream. Do not build any retract UI or endpoint in this story; that field just sits at its default.
  - [x] Ran `npx prisma migrate dev --name add_resena_model` — applied cleanly as `20260727170545_add_resena_model` (dev server was already stopped by the user, no EPERM).
  - [x] After migration, no seed data needed — reviews are entirely user-generated, nothing to seed.

- [x] Task 3: Build `server/utils/guards/reviewLimit.ts` (AC: #3)
  - [x] Small helper, matching the file-per-guard convention already established (`authorOrAdmin.ts`, `activeUserFilter.ts`, `requireType.ts` each live in `server/utils/guards/` as one function per file):
    ```ts
    export async function assertNoDuplicateReview(autorId: number, nutricionistaId: number) {
      const existing = await prisma.resena.findUnique({
        where: { autorId_nutricionistaId: { autorId, nutricionistaId } },
      });
      if (existing) {
        throw createError({ statusCode: 409, message: "Ya dejaste una reseña para este nutricionista." });
      }
    }
    ```
  - [x] This is checked **before** creating the Resena in Task 4's POST handler — fetch-then-check-then-mutate ordering, same discipline as every prior guard usage this session (check first, don't do wasted work for a request that will be rejected).

- [x] Task 4: Build `server/api/resenas/index.post.ts` and `server/api/resenas/index.get.ts` (AC: #1, #2, #3, #4)
  - [x] **POST** (`index.post.ts`):
    - `const usuario = await requireSession(event)` — any authenticated user, no `requireType` gate (FR-24: any authenticated Usuario can review, not just Deportistas).
    - Parse JSON body: `{ nutricionistaId: number, rating: number, comentario: string }` (plain JSON, not multipart — no images involved in a review, unlike catalog items).
    - Validate `rating` is an integer 1–5 (`Number.isInteger(rating) && rating >= 1 && rating <= 5`) — reject with 400 otherwise. No rating-scale convention exists elsewhere in this codebase; 1–5 is this story's own decision, matching the UX spine's "inline rating (stars)" description.
    - Validate `comentario` is a non-empty trimmed string — reject with 400 otherwise.
    - Fetch the target: `prisma.usuario.findUnique({ where: { id: nutricionistaId }, include: { informacion: { include: { tipoUsuario: true } } } })`. 404 if not found. 400 if `informacion?.tipoUsuario?.tipo !== "Nutricionista"` (can't review a non-nutricionista) — message: `"Solo se puede reseñar a un nutricionista."`
    - Call `await assertNoDuplicateReview(usuario.id, nutricionistaId)` (Task 3) — before creating, after validating the target exists and is a Nutricionista.
    - `prisma.resena.create({ data: { rating, comentario, autorId: usuario.id, nutricionistaId } })`, return the created row **with `autor` included** (`include: { autor: { select: { id: true, nombre: true, apellido: true, avatar: true } } }`) so the client can render it immediately without a second fetch.
  - [x] **GET** (`index.get.ts`):
    - `await requireSession(event)` — reviews are only visible to authenticated users, consistent with every other directory/detail endpoint in this app (`/api/usuarios/[id]`, `/api/catalogo/**` all require a session).
    - Read `nutricionistaId` from `getQuery(event)`, required, 400 if missing/non-numeric.
    - `prisma.resena.findMany({ where: { nutricionistaId: parseInt(nutricionistaId), retractada: false }, include: { autor: { select: { id: true, nombre: true, apellido: true, avatar: true } } }, orderBy: { createdAt: "desc" } })`.
    - Return the array directly (matches `catalogo/index.get.ts`'s convention of returning a plain array, not a wrapped `{ data: [...] }` shape).
    - Do **not** apply `activeUserFilter()` here — see Task 1's note on AD-5's explicit exclusion.

- [x] Task 5: Build `app/components/ResenasSection.vue` and wire it into `UsuarioDetailView.vue` (AC: #1, #2, #3, #4)
  - [x] New component, props: `nutricionistaId: number`, `nutricionistaNombre: string`.
  - [x] On mount, `GET /api/resenas?nutricionistaId=${nutricionistaId}` into a local `resenas` ref.
  - [x] `const misResena = computed(() => resenas.value.find(r => r.autorId === authStore.user?.id))` — reactive against `useAuthStore()`'s readonly `user` ref (already the established pattern app-wide, e.g. header/profile components).
  - [x] **Ordering:** per UX spine Flow 3 step 4 ("own review surfaces first, then existing reviews") — this is a **client-side display decision**, not a server contract; the GET endpoint returns newest-first, the component re-sorts so `misResena` (if present) renders first, followed by the rest in the server's `createdAt desc` order. Do not push this sort to the server.
  - [x] **Leave-a-review UI**, matching UX spine's exact copy and inline-expansion behavior (Flow 3 steps 2–3, State Patterns table "Duplicate review attempt"):
    - Not authenticated (`!authStore.isAuthenticated`): show only the reviews list, no leave-review affordance at all (an anonymous visitor cannot act on FR-24).
    - Authenticated, no `misResena`: a "Dejar una reseña" button that expands an inline form in place (no modal, per EXPERIENCE.md) — a 1–5 star picker + a `<textarea>` for `comentario` + submit button.
    - Authenticated, `misResena` exists: replace the button/form entirely with static text `"Ya dejaste una reseña para {{ nutricionistaNombre }}"` (AC #3's exact required copy) — this is the client-side pre-check; the server's 409 (Task 4) is the real enforcement point in case of a race (e.g. two tabs).
  - [x] **Star rating widget:** no `star`/`rating` token exists in `DESIGN.md` — use `Icon name="fa6-solid:star"` (filled) / `Icon name="fa6-regular:star"` (empty) matching the app's existing Iconify `fa6-solid`/`fa6-regular` icon convention (already used for `arrow-left`, `xmark`, `image` elsewhere). Implement as 5 `<button type="button">` elements (not a native `<input type="radio">` set, to keep the inline star-click UX), each with an explicit `aria-label="Calificar con N de 5 estrellas"` and `aria-pressed="rating === N"` — required per EXPERIENCE.md's Accessibility Floor ("icon-only controls need `aria-label`"). For **display** (read-only, in each review row), render 5 static star icons filled up to the row's `rating` value, wrapped in a container with `aria-label="N de 5 estrellas"` (a single label for the group, not per-icon, since these aren't interactive).
  - [x] On submit: `POST /api/resenas` with `{ nutricionistaId, rating, comentario }`. On success: push the returned Resena (with its included `autor`) to the front of the local `resenas` array, collapse the form, use `useToast().showToast('Reseña publicada', 'success')` (matches this app's established toast pattern — see Story 2.x components). On error (esp. the 409 duplicate case, relevant if a duplicate slips through the client pre-check via a race): `useToast().showToast(e?.data?.message || 'Error al publicar la reseña', 'error')`, do not collapse the form so the user doesn't lose their typed comment.
  - [x] Each review row displays: display-mode stars, `comentario`, `autor.nombre` + `autor.apellido`, and a small avatar (reuse the initials-fallback pattern from `UsuarioDetailView.vue`'s own avatar block if `autor.avatar` is null — don't invent a different fallback style). No edit/delete/retract affordance anywhere in this component — reviews are permanent for their author in this story's scope (Task 1's AD-1 note).
  - [x] Wire into `UsuarioDetailView.vue`: add `<ResenasSection v-if="tipo === 'Nutricionista'" :nutricionista-id="usuario.id" :nutricionista-nombre="usuario.nombre" />` after the existing `<dl>` fields block (which already renders `especialidad` for this branch — AC #4 needs both visible together, so keep the Reseñas section immediately below the fields block, not on a separate page/tab).

- [x] Task 6 (Post-review, user-requested scope change): Author edit/delete + admin delete for Reseñas (AC: none originally — new capability, see Dev Notes "Post-review scope change")
  - [x] Extended `shared/utils/resourcePermissions.ts`: `ResourceType` now includes `"resena"`; `MATRIX.resena` = `{ edit: { authorAllowed: true, adminAllowed: false }, delete: { authorAllowed: true, adminAllowed: true } }`.
  - [x] Built `server/api/resenas/[id].put.ts` (author-only edit, same rating/comentario validation as create) and `server/api/resenas/[id].delete.ts` (author or admin, hard delete).
  - [x] Updated `app/components/ResenasSection.vue`: per-row Editar/Eliminar controls via `canPerformAction()` called directly (not the single-resource `useResourcePermissions()` composable, since this is a list), inline edit form reusing the star-picker pattern, delete behind the standard destructive-confirm.

## Dev Notes

### Scope size

Medium — unlike Story 3.3 (pure wiring onto pre-built primitives), this story creates a brand-new Prisma model, a brand-new guard (`reviewLimit`), two brand-new endpoints, and a brand-new component from scratch. There is no existing "reviews" precedent anywhere in this codebase to mirror structurally the way `catalogo/edit/[id].vue` mirrored `admin/eventos/edit/[id].vue` — the closest structural analog is `catalogo/index.post.ts`/`index.get.ts` (JSON-body-not-multipart create + query-filtered list), not any of the edit/delete-heavy prior Epic 3 stories.

### Post-review scope change (user request, overrides AD-1's original "no self-edit" call)

After the initial implementation (author create + read only, per AD-1's documented matrix), the user explicitly asked for author edit, author delete, **and** admin delete — reversing AD-1's "no self-edit ever" / "no delete for author" decision and PRD §11's "no self-service edit" deferred gap. User's explicit direction: implement now; when Story 4.2 is built, reconcile its planned "retract" admin action against the fact that admin can now hard-delete directly (open question, not resolved here — revisit at 4.2 time).

Implemented as a straightforward extension of the same `authorOrAdmin`/`resourcePermissions` pattern used by every other resource in this codebase:
- `shared/utils/resourcePermissions.ts`: added `"resena"` to `ResourceType` and a `MATRIX` entry — `edit: { authorAllowed: true, adminAllowed: false }` (author-only, matching `publicacion`'s shape exactly), `delete: { authorAllowed: true, adminAllowed: true }` (author or admin).
- `server/api/resenas/[id].put.ts` (new): `requireSession` → fetch existing → `authorOrAdmin('resena', 'edit', { autorId: existing.autorId }, usuario)` → validate rating/comentario same as POST → update.
- `server/api/resenas/[id].delete.ts` (new): same guard pattern with `'delete'` → `prisma.resena.delete()`. A hard delete, not the `retractada` soft-flag — that flag now sits unused by this story (still there for 4.2 to pick up or discard depending on how the reconciliation above resolves).
- `app/components/ResenasSection.vue`: each review row now computes per-row permissions via `canPerformAction('resena', action, { autorId: r.autorId }, actor)` (called directly, not through the `useResourcePermissions()` composable, since that composable is built around a single reactive resource ref and this is a list — calling a composable inside `v-for` would violate rules-of-hooks). Author sees "Editar" (inline form, same star-picker pattern as create) and "Eliminar"; admin sees only "Eliminar" (not "Editar" — matches the adminAllowed:false rule). Delete requires the standard `confirm("¿Eliminar esta reseña? Esta acción no se puede deshacer.")` step, matching every other destructive action in this codebase.
- Deleting a review also frees its `(autorId, nutricionistaId)` unique slot — the author can post a new review for the same nutricionista afterward. This incidentally resolves the PRD §11 "retracted review doesn't free the slot" concern for the delete path (not applicable to a hard delete, only would matter if 4.2's soft `retractada` flag is kept as a separate action).

### Post-review UX change (user request): replaced native `confirm()` with a styled dialog, app-wide

The browser's native `confirm()` popup (used by every destructive action in this codebase — catalog/evento/noticia delete, and this story's new review delete) was replaced sitewide with a custom modal matching the app's DESIGN.md tokens (white surface, black `button-secondary` pill for Cancelar, `{colors.destructive}` red-600/red-700 solid button for the confirm action). Not scoped to just Reseñas — the user asked for "esa modal horrible" (the native one) gone everywhere it appears today.

- New: `app/composables/useConfirm.ts` — a `useState`-backed singleton (same pattern as `useToast.ts`), exposing `askConfirm(options): Promise<boolean>` that any component can `await`.
- New: `app/components/ConfirmDialog.vue` — the actual modal, `Teleport`'d to body, mounted once in `app/layouts/default.vue` alongside the existing `<ToastContainer />` (not per-page — same singleton-mount pattern).
- Modified call sites (native `confirm(...)` → `await askConfirm({ message: ... })`, same confirmation copy preserved verbatim in each): `app/components/ResenasSection.vue`, `app/pages/catalogo/[id].vue`, `app/pages/eventos/[id].vue`, `app/pages/noticias/[id].vue`. No other `confirm()` calls existed in the codebase (verified via full-app grep).

### Post-review scope change (user request): average rating display + comentario made optional

- **`comentario` is no longer required** — only `rating` is. Removed the `if (!comentario) throw ...` check from both `server/api/resenas/index.post.ts` and `server/api/resenas/[id].put.ts`; `comentario` still gets `.trim()`'d and stored as-is (possibly `""`), no schema change needed since Prisma's `String` column already accepts an empty string (not `null`). `ResenasSection.vue`'s comment paragraph is now `v-else-if="r.comentario"` so an empty comment renders no stray empty `<p>`. Both the create and edit forms dropped the textarea's `required` attribute and relabeled it "Comentario (opcional)".
- **New `app/components/StarRating.vue`** — a read-only, fractionally-filled star display (five stars, each independently filled 0–100% via an absolutely-positioned clipped overlay), replacing the previous all-or-nothing `n <= rating` icon loop used for individual review rows. Built specifically to support a **non-integer** average (e.g. 4.7 renders 4 full stars + a ~70%-filled 5th star, Google-Maps-style) — integer per-review ratings still render correctly through the same component (a whole star is just a 100%-or-0% case of the same fill logic).
- **Average rating block**, added directly above the reviews list (`v-if="resenas.length > 0"`, sits between the leave-a-review section and the list): `<StarRating :value="promedio">` at `text-2xl` + the numeric average (`promedio.toFixed(1)`) side by side, with a `"Calificación"` caption label below. `promedio` is a simple `computed()` over the already-fetched `resenas` array (`sum(rating) / count`) — no new endpoint, since the section already loads every non-retracted review for this nutricionista and the average must always match exactly what's visible below it.

### Explicit non-goals for this story (all confirmed deferred, not gaps to fix)

- No verification that the reviewer actually used the nutricionista's services (PRD §5.9 Out of Scope, confirmed decision).
- No self-review exclusion (PRD §11 deferred edge case).
- No `activeUserFilter()` on the Reseñas query — a deactivated author's reviews stay visible (Architecture AD-5, confirmed non-goal for MVP).
- A retracted review not freeing up the one-review-per-nutricionista slot unless the author is also blocked — not this story's concern at all (Story 4.2 territory), mentioned here only so the dev doesn't try to "fix" it while building the unique constraint.

### Architecture / conventions this story must follow

- **Transaction Script pattern** — thin `server/api/resenas/*.ts` handlers, no service layer, matching every other endpoint in this codebase.
- **Guard file-per-function convention** — `server/utils/guards/reviewLimit.ts` exporting one function, same shape as the existing `authorOrAdmin.ts`, `activeUserFilter.ts`, `requireType.ts` in that directory.
- **`requireSession()` reuse** — do not re-fetch the acting user separately; `requireSession()`'s return value already includes `informacion.tipoUsuario`.
- **No test framework** — same MVP non-goal as every prior story. Verify manually with at least two accounts: as Usuario A (any type), submit a review for a real Nutricionista account, confirm it appears; as Usuario A again, confirm the "Ya dejaste una reseña" message shows client-side AND a raw duplicate POST is rejected 409 server-side (test via a second browser tab or by editing the request, not just trusting the client pre-check); as Usuario B, confirm an independent review on the same Nutricionista succeeds; as an unauthenticated visitor, confirm the reviews list still renders but no leave-review UI appears; confirm `especialidad` still renders correctly on the Nutricionista detail page alongside the new Reseñas section (AC #4); attempt reviewing a non-Nutricionista account's id directly via the API and confirm it's rejected 400.
- **Icon convention** — `fa6-solid`/`fa6-regular` Iconify names only, matching every icon usage elsewhere in this codebase (no new icon library).
- **Toast convention** — `useToast().showToast(message, 'success' | 'error')` for submit feedback, matching Story 2.x's established pattern.

### Project Structure Notes

- New: `server/utils/guards/reviewLimit.ts`, `server/api/resenas/index.post.ts`, `server/api/resenas/index.get.ts`, `app/components/ResenasSection.vue`.
- Modified: `prisma/schema.prisma` (new `Resena` model + two new `Usuario` relations), `app/components/UsuarioDetailView.vue` (one new conditional line wiring in `ResenasSection`).
- Not touched (confirmed by Task 1's research): `shared/utils/resourcePermissions.ts`, `app/composables/useResourcePermissions.ts`, `server/utils/guards/authorOrAdmin.ts`, `server/utils/guards/activeUserFilter.ts` — all out of scope for this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 4 / Story 4.1] — user story statement, verbatim ACs
- [Source: _bmad-output/planning-artifacts/prds/prd-Elite_Hub-2026-07-19/prd.md#§5.9 Nutricionista Ratings & Reviews] — FR-24, FR-25, FR-37 full text and Out of Scope note
- [Source: _bmad-output/planning-artifacts/prds/prd-Elite_Hub-2026-07-19/prd.md#§2.3 UJ-3] — user journey narrative, deferred edge case list
- [Source: _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md#AD-1, AD-5, AD-6] — action→role matrix for Reseñas, activeUserFilter exclusion, useResourcePermissions shape
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/EXPERIENCE.md#Component Patterns "Reseña row", State Patterns "Duplicate review attempt", Flow 3] — inline expansion, star rating, duplicate-review copy, review ordering
- [Source: prisma/schema.prisma] — existing model conventions, `Informacion.especialidad` already present
- [Source: app/components/UsuarioDetailView.vue] — existing Nutricionista field rendering, avatar/initials fallback pattern to reuse
- [Source: server/utils/requireSession.ts, server/utils/guards/requireType.ts] — exact signatures consumed by this story's endpoints

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

### Completion Notes List

- Prisma migration `20260727170545_add_resena_model` applied cleanly (dev server already stopped, no EPERM).
- No changes needed to `shared/utils/resourcePermissions.ts`, `useResourcePermissions.ts`, `authorOrAdmin.ts`, or `activeUserFilter.ts` — confirmed out of scope per Task 1's research (Story 4.2 owns the future `retract` action).
- `especialidad` (AC #4) re-verified as already rendering correctly on the Nutricionista branch of `UsuarioDetailView.vue`, now directly above the new Reseñas section.
- No automated tests written — matches this project's established MVP convention (no test framework configured). Manual verification steps are listed in Dev Notes and should be run by the user: two-account duplicate-review check (client pre-check + server 409), independent review from a second account, anonymous-visitor view (no leave-review UI), and a direct API attempt to review a non-Nutricionista account (expect 400).
- **Post-review (user-requested scope change):** author edit/delete and admin delete added for Reseñas — see Dev Notes "Post-review scope change" for full rationale and the open question this creates for Story 4.2 (whether "retract" is still needed once admin can hard-delete). Verify: as the review's author, edit it and confirm the change persists; as the author, delete it and confirm the "Dejar una reseña" button reappears (slot freed); as admin, confirm "Eliminar" shows but "Editar" does NOT (adminAllowed:false for edit); as a different non-owning, non-admin user, confirm neither button appears on someone else's review.

### File List

- prisma/schema.prisma (modified — new `Resena` model, two new `Usuario` relations)
- prisma/migrations/20260727170545_add_resena_model/migration.sql (new)
- server/utils/guards/reviewLimit.ts (new)
- server/api/resenas/index.post.ts (new)
- server/api/resenas/index.get.ts (new)
- server/api/resenas/[id].put.ts (new, post-review)
- server/api/resenas/[id].delete.ts (new, post-review)
- shared/utils/resourcePermissions.ts (modified, post-review — added `resena` resource type)
- app/components/ResenasSection.vue (new; modified again post-review for edit/delete UI and again for `askConfirm`)
- app/components/UsuarioDetailView.vue (modified — wires in `ResenasSection` for the Nutricionista branch)
- app/composables/useConfirm.ts (new, post-review — app-wide confirm dialog state)
- app/components/ConfirmDialog.vue (new, post-review — app-wide confirm dialog UI)
- app/layouts/default.vue (modified, post-review — mounts `ConfirmDialog`)
- app/pages/catalogo/[id].vue (modified, post-review — native `confirm()` → `askConfirm()`)
- app/pages/eventos/[id].vue (modified, post-review — native `confirm()` → `askConfirm()`)
- app/pages/noticias/[id].vue (modified, post-review — native `confirm()` → `askConfirm()`)
- server/api/resenas/index.post.ts (modified, post-review — comentario no longer required)
- server/api/resenas/[id].put.ts (modified, post-review — comentario no longer required)
- app/components/StarRating.vue (new, post-review — fractional star display, average rating block)
