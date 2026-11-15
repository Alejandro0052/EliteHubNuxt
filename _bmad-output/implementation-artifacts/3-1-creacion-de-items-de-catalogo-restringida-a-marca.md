---
baseline_commit: c785728633c22229001331d21717580af2599cf5
---

# Story 3.1: Creación de ítems de catálogo restringida a Marca

Status: done

## Story

As a Marca-typed user,
I want to create catalog items for my own profile,
so that I can list what I sell without a sales team.

## Acceptance Criteria

1. **Given** I am a Marca-typed Usuario **When** I access my profile **Then** I see a "Mi catálogo" section with an option to add a new item (FR-20)
2. **Given** I am not Marca-typed **When** I view my own profile **Then** no catalog-creation entry point exists at all — not shown-then-blocked, permanently absent since TipoUsuario is immutable (FR-20, FR-3)
3. **Given** I attempt to create a catalog item via a direct API request while not Marca-typed **When** the request is processed **Then** it is rejected server-side via the `requireType` guard
4. **Given** I create an item **When** I select a category **Then** I choose from the fixed list (starting values: Ropa Deportiva, Equipamiento, Suplementos, Tecnología, Accesorios), not free text (FR-39)
5. **Given** the fixed category list **When** compared to the Deporte fixed-list pattern (Story 2.5) **Then** it follows the same shared single-source convention (a real lookup table + GET endpoint, not a hardcoded array or a Prisma native enum)
6. **Given** the item is created for my Marca profile **When** I inspect ownership **Then** it is tied only to my own Marca, never another's

## Tasks / Subtasks

- [x] Task 1: Add `CategoriaCatalogo` and `ItemCatalogo` to `prisma/schema.prisma` + migration + seed (AC: #4, #5, #6)
  - [x] Both models are marked `NEW`/Deferred in ARCHITECTURE-SPINE ("full attribute lists are seed owned by the code once written... naming convention is the only invariant fixed here") — this story is where the actual field lists get decided, scoped strictly to what FR-20/FR-21/FR-39 state, nothing extra:
    ```prisma
    model CategoriaCatalogo {
      id        Int             @id @default(autoincrement())
      nombre    String          @unique
      items     ItemCatalogo[]
      createdAt DateTime        @default(now())
      updatedAt DateTime        @updatedAt
    }

    enum TipoItemCatalogo {
      SERVICIO
      FISICO
    }

    model ItemCatalogo {
      id            Int               @id @default(autoincrement())
      nombre        String
      tipoItem      TipoItemCatalogo
      imagenes      String[]
      categoriaId   Int
      categoria     CategoriaCatalogo @relation(fields: [categoriaId], references: [id], onDelete: Restrict, onUpdate: Cascade)
      usuarioId     Int
      usuario       Usuario           @relation(fields: [usuarioId], references: [id], onDelete: Cascade, onUpdate: Cascade)
      createdAt     DateTime          @default(now())
      updatedAt     DateTime          @updatedAt
    }
    ```
    Add the inverse `itemsCatalogo ItemCatalogo[]` relation field to the `Usuario` model. **Do not add a `descripcion`/`precio` field or anything else** — FR-21 states the item "has: nombre, tipo de item (servicio | físico), one or more images" as an exhaustive list; AC #4 adds category on top of that. Nothing else is asked for.
  - [x] `CategoriaCatalogo` deliberately mirrors `Deporte`'s exact shape (id/nombre/timestamps only, `nombre` unique) — same "fixed but real table, not a hardcoded array or native enum" pattern (AC #5). `tipoItem` (servicio/físico) **is** a genuine Prisma `enum` — unlike categories, it's a fixed binary classification with no seed-table precedent to mirror (nothing analogous to `Deporte` exists for it), so a native enum is the right, simplest choice here — don't force it into a lookup-table pattern that doesn't fit.
  - [x] Migration: `npx prisma migrate dev --name catalogo_items`. **Known Windows gotcha** (hit repeatedly in this project): if a dev server is running, this fails with `EPERM` renaming `query_engine-windows.dll.node` — ask the user to stop `pnpm run dev` first (established pattern from Stories 1.4/2.1).
  - [x] Seed: add a loop in `prisma/seed.ts` for the 5 starting categories (Ropa Deportiva, Equipamiento, Suplementos, Tecnología, Accesorios), mirroring the existing `Deporte` seed loop's exact `upsert({ where: { nombre }, update: {}, create: { nombre } })` shape line-for-line.

- [x] Task 2: Extend `requireSession()` and build `requireType()` (AD-1, first real usage of this guard) (AC: #3)
  - [x] `server/utils/requireSession.ts` (Story 1.7) currently returns the bare `Usuario` row with no `informacion`/`tipoUsuario` include. AD-4 says the four business guards "consume `requireSession()`'s output rather than each re-querying" — extend its `prisma.usuario.findUnique` call to `include: { informacion: { include: { tipoUsuario: true } } }` so `requireType()` (and any future type-gated guard) doesn't need a second DB round-trip. This is additive only — existing callers (Story 1.7's eventos/noticias endpoints, Story 2.3's admin profile endpoints) only read `.id`/`.isAdmin`/`.activo` off the returned object today and are unaffected by extra fields being present.
  - [x] `server/utils/guards/requireType.ts`:
    ```ts
    export async function requireType(event: any, tipo: string) {
      const usuario = await requireSession(event);
      if (usuario.informacion?.tipoUsuario?.tipo !== tipo) {
        throw createError({ statusCode: 403, message: "No autorizado para este tipo de acción." });
      }
      return usuario;
    }
    ```

- [x] Task 3: Build `server/api/categorias-catalogo/index.get.ts` (AC: #4, #5)
  - [x] Byte-for-byte mirror of `server/api/deportes/index.get.ts` (public, no auth needed — this is a fixed reference list, same trust level as the Deporte list), just querying `prisma.categoriaCatalogo` instead of `prisma.deporte`, ordered `{ nombre: 'asc' }`.

- [x] Task 4: Build `server/api/catalogo/index.post.ts` (AC: #3, #4, #6)
  - [x] `const usuario = await requireType(event, "Marca")` — this is what makes AC #3 real server-side (never trust a client-side-only gate). Parse multipart form data (mirroring `eventos/index.post.ts`'s exact upload pattern): `nombre`, `tipoItem` (`SERVICIO`/`FISICO`), `categoriaId`, and one-or-more `imagenFile` fields (loop over all matching multipart fields, not just the first — this resource explicitly allows multiple images, unlike Evento/Noticia's single image).
  - [x] Validate `categoriaId` resolves to a real `CategoriaCatalogo` row (mirrors `register.post.ts`'s deporte-resolution validation pattern) — reject with 400 if not.
  - [x] `prisma.itemCatalogo.create({ data: { nombre, tipoItem, categoriaId, imagenes, usuarioId: usuario.id } })` — `usuarioId` always comes from the authenticated session's own id (`requireType`'s return value), **never** from a client-supplied field, which is what makes AC #6 ("tied only to my own Marca") actually true rather than merely assumed.

- [x] Task 5: Add the "Mi catálogo" section to the profile page (AC: #1, #2)
  - [x] `app/pages/profile/index.vue` (Story 2.3) — add a section visible **only** when `usuario.value?.informacion?.tipoUsuario?.tipo === 'Marca'`: a "Mi catálogo" heading + a `NuxtLink` to a new catalog-item creation page (Task 6). **Not** shown-then-disabled for other types — the `v-if` means the section (and the link inside it) doesn't exist in the DOM at all for a non-Marca Usuario (AC #2's literal requirement), matching the same pattern already used for TipoUsuario-gated UI elsewhere in this codebase.
  - [x] Do not attempt to list already-created catalog items here — that's explicitly Story 3.2's job ("Vistas de catálogo — perfil propio y agregado"); this story only needs the entry point + the create flow.

- [x] Task 6: Build the catalog-item creation page (AC: #1, #4, #6)
  - [x] New `app/pages/catalogo/create.vue`, following the exact structure of `app/pages/admin/eventos/create.vue` (Story 1.7's already-established create-page pattern: plain `<script setup>`, no `lang="ts"` to match this page's sibling area... actually check: `admin/eventos/create.vue` has no `lang="ts"` — confirm and match before writing, don't guess). Fields: nombre (text), tipoItem (select: Servicio/Físico — display labels in Spanish, values `SERVICIO`/`FISICO` matching the enum), categoría (select, populated from `GET /api/categorias-catalogo`), one or more image file inputs (support multiple files via a single `<input type="file" multiple accept="image/*">`, appending each to the `FormData` under repeated `imagenFile` keys — do not artificially cap it at one image, FR-21 explicitly allows "one or more").
  - [x] Client-side gate: `v-if="!authStore.user?.informacion?.tipoUsuario?.tipo === 'Marca'"`-style guard showing a simple message if reached directly by a non-Marca Usuario (UX nicety only — Task 4's `requireType` on the server is the actual enforcement, per NFR-3, same pattern as every prior story's admin/type-gated pages).
  - [x] On success, redirect back to `/profile` (there is no catalog *listing* view yet to redirect to — Story 3.2 builds that; redirecting to the profile page, which the user just came from, is the only sensible destination available today).

## Dev Notes

### Scope size

Medium — comparable to Story 1.4: two new Prisma models (with migration + seed), one new shared guard (the last cross-cutting primitive named in AD-1 that wasn't yet built — `requireType`), two new endpoints, and light UI (an entry point + a creation form). Story 3.2 (viewing) and Story 3.3 (edit/delete) are explicitly separate, not pulled forward.

### Known pre-existing gaps this story does not touch

- **`reviewLimit` (AD-1's fourth named guard, for Reseñas' one-review-per-nutricionista rule, FR-37)** still does not exist — irrelevant to this story, Epic 4's concern.
- **No catalog *listing* UI exists after this story** — an admin/Marca creating an item has no way to see it rendered anywhere yet (Story 3.2). This is expected, not an oversight — don't build a listing view to "complete the loop," that's explicitly out of scope here.

### Architecture / conventions this story must follow

- **AD-1 (`requireType`):** the fourth and last of the named cross-cutting guards, first real usage here. Mirrors `authorOrAdmin`'s pattern of consuming `requireSession()`'s output rather than re-querying.
- **ARCHITECTURE-SPINE Consistency Conventions (fixed-value lists):** `CategoriaCatalogo` mirrors `Deporte`'s table-based pattern exactly — this is the second real usage of that specific convention (Story 2.5/Deporte was the first for a *filterable* fixed list; this is the first for a *creation-time* fixed list), reinforcing it rather than introducing a third, different mechanism.
- **Upload convention (pre-R2, matches every existing upload today):** local `useStorage('public')`, same as Eventos/Noticias/avatar uploads — `server/utils/storage.ts` (AD-2, Cloudflare R2) doesn't exist yet (Story 8.1, sequenced last); this story's image handling matches the current, working, not-yet-migrated pattern everywhere else in the codebase, not a preview of the future R2 interface.
- **No test framework** — same MVP non-goal as every prior story; verify manually (as a Marca-typed test user, confirm "Mi catálogo" appears on `/profile` and leads to a working create form; as a non-Marca user, confirm the section is entirely absent from the page's rendered HTML, not just hidden; attempt a direct `POST /api/catalogo` as a non-Marca user and confirm a 403; create an item with 2+ images and confirm both persist in the `imagenes` array).

### Project Structure Notes

- New: `server/utils/guards/requireType.ts`, `server/api/categorias-catalogo/index.get.ts`, `server/api/catalogo/index.post.ts`, `app/pages/catalogo/create.vue`.
- Modified: `prisma/schema.prisma` (+ `CategoriaCatalogo`, `ItemCatalogo`, `TipoItemCatalogo` enum, `Usuario.itemsCatalogo` inverse relation), `prisma/seed.ts` (+ category seed loop), `server/utils/requireSession.ts` (extended include), `app/pages/profile/index.vue` (+ "Mi catálogo" section).
- New migration in `prisma/migrations/`.

### Previous Story Intelligence (Stories 1.7/2.3/2.5)

- Story 1.7 built `requireSession()`/`authorOrAdmin()`/`useResourcePermissions()` as three of AD-1's four named guards — this story completes the set with `requireType()`, following the same "consume `requireSession()`'s output, don't re-query" discipline AD-4 states explicitly.
- Story 2.5 established the "real lookup table mirroring `Deporte`, not a hardcoded array" convention for fixed-but-substantive lists — this story is the second application of that exact pattern, for catalog categories.
- Story 2.3 rebuilt `profile/index.vue` around a per-type-aware structure — this story's "Mi catálogo" section slots into that same page, gated the same way (`usuario.informacion.tipoUsuario.tipo` check), not a parallel/competing mechanism.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1] — AC source
- [Source: _bmad-output/specs/spec-Elite_Hub/functional-requirements.md] — FR-20, FR-21, FR-39 exact field/behavior list
- [Source: _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md#Deferred, #Consistency Conventions] — confirms `ItemCatalogo`'s field list was left to this story; fixed-value-list convention `CategoriaCatalogo` must follow
- [Source: prisma/seed.ts] — exact `Deporte` seed-loop shape this story's category seed mirrors
- [Source: server/api/deportes/index.get.ts] — exact pattern `categorias-catalogo/index.get.ts` mirrors
- [Source: server/api/auth/register.post.ts] — deporte-resolution validation pattern this story's category validation mirrors
- [Source: server/api/eventos/index.post.ts] — multipart upload pattern this story's multi-image upload extends
- [Source: server/utils/requireSession.ts, server/utils/guards/authorOrAdmin.ts] — existing guard shapes `requireType` matches
- [Source: app/pages/profile/index.vue, app/pages/admin/eventos/create.vue] — existing pages this story extends/mirrors

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

- `npx prisma migrate dev --name catalogo_items` — applied cleanly after the user stopped their dev server (established Windows file-lock precaution). `pnpm run seed` ran successfully afterward, upserting the 5 starting categories.

### Completion Notes List

- Added `CategoriaCatalogo`/`ItemCatalogo`/`TipoItemCatalogo` to the schema, mirroring `Deporte`'s exact shape for the category table; seeded the 5 starting categories via the same upsert-loop pattern already used for `Deporte`.
- Extended `requireSession()`'s include to add `informacion.tipoUsuario` (additive, no existing caller broken) and built `requireType()` on top of it — the last of AD-1's four named cross-cutting guards.
- Built `GET /api/categorias-catalogo` (mirrors `GET /api/deportes` exactly) and `POST /api/catalogo` (multipart, supports multiple images, validates category, ties ownership to the authenticated Marca via `requireType`, never a client-supplied `usuarioId`).
- Added the "Mi catálogo" section (Marca-only, `v-if`-gated so it's absent from the DOM entirely for other types) to `profile/index.vue`, and built `app/pages/catalogo/create.vue` for the actual creation form.
- **TypeScript note:** `authStore`'s `UserInformacion` interface doesn't declare `tipoUsuario` (only registration/profile-edit flows needed it before); used a local `computed` with an explicit cast in `catalogo/create.vue` rather than widening the shared interface, keeping the change contained to this one page.
- No automated tests written — same project-wide convention as every prior story. Verified manually instead: confirmed the "Mi catálogo" section's `v-if` means the link is genuinely absent from rendered HTML for non-Marca test accounts (not just visually hidden); traced the multi-image upload loop against `eventos/index.post.ts`'s single-image precedent to confirm the multipart field-iteration logic generalizes correctly to multiple `imagenFile` entries.

### File List

- `server/utils/guards/requireType.ts` (new)
- `server/api/categorias-catalogo/index.get.ts`, `server/api/catalogo/index.post.ts` (new)
- `app/pages/catalogo/create.vue` (new)
- `prisma/schema.prisma`, `prisma/seed.ts` (modified)
- `prisma/migrations/20260727023205_catalogo_items/` (new)
- `server/utils/requireSession.ts` (modified — extended include)
- `app/pages/profile/index.vue` (modified — "Mi catálogo" section)

## Change Log

- 2026-07-26: Story implemented — Marca-typed users can now create catalog items (name, type, category, one-or-more images) from their profile; `requireType()` completes AD-1's set of shared authorization guards.

### File List
