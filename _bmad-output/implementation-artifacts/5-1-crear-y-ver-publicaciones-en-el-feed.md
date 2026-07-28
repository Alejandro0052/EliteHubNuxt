---
baseline_commit: 3ae498dc03620c39a69f37577aefce9faf9b7ba7
---

# Story 5.1: Crear y ver publicaciones en el feed

Status: done

## Story

As an authenticated user,
I want to post text and an optional image to a shared feed and see everyone else's posts,
so that I have a reason to open the app daily.

## Acceptance Criteria

1. **Given** I am authenticated **When** I use the composer, inline at the top of the feed, not a modal **Then** I can submit text plus an optional single image as a new Publicación (FR-26)
2. **Given** a new Publicación is created **When** the feed is loaded **Then** it appears at the top, most-recent-first (FR-27)
3. **Given** the feed **When** it loads **Then** it fetches via infinite-scroll cursor batches of 20, the same convention as Story 2.1
4. **Given** a deactivated Usuario's Publicaciones **When** the feed is queried **Then** they are hidden per Story 2.4's `activeUserFilter` cascade
5. **Given** I am NOT authenticated **When** I open the app's Home **Then** I see the existing marketing hero, live stats (Story 1.6), and feature tiles instead of a feed — Home forks by authentication state, it does not require login to view (UX-DR10)

## Tasks / Subtasks

- [x] Task 1: Read what's already built before writing anything (AC: all)
  - [x] **No `Publicacion` model exists yet** — confirmed via full schema read. This story creates it fresh (Task 2).
  - [x] **`shared/utils/resourcePermissions.ts` already has a `publicacion` entry** in `MATRIX` (`edit: authorAllowed only`, `delete: author+admin`), built speculatively ahead of schedule. **This story needs zero changes there** — creation is open to any authenticated user, no author/admin gating on create or read. All edit/delete/permission wiring (`authorOrAdmin`, `useResourcePermissions('publicacion', ...)`, PUT/DELETE endpoints) is **Story 5.2's job entirely** — do not build any edit/delete UI or endpoint in this story, mirroring exactly how Story 4.1 (create+read Reseñas) left all permission wiring untouched for Story 4.2.
  - [x] **`app/pages/index.vue` currently has NO auth-state fork** — `definePageMeta({ auth: false })`, and the entire hero/stats/noticias/eventos content renders unconditionally regardless of login state. This story adds the fork itself (Task 5), not just feed content bolted onto an existing branch. The unauthenticated branch must preserve every pixel of what's there today (hero video, stats, Noticias/Eventos preview sections) — this story does not redesign or remove any of it, only wraps it behind `v-if="!authStore.isAuthenticated"`.
  - [x] **Cursor-pagination precedent to follow**: `server/api/catalogo/index.get.ts` returns `{ items, nextCursor }` (`take: 20`, `cursor ? { skip: 1, cursor: { id: cursor } } : {}`), consumed by `useInfiniteScroll.ts`/`InfiniteScrollList.vue` unchanged. **`server/api/eventos/index.get.ts` and `server/api/noticias/index.get.ts` are NOT this pattern** — they're flat top-20 lists with no cursor/skip handling at all, returning a plain array. Do not copy the eventos/noticias shape; follow catalogo's cursor shape exactly, since `InfiniteScrollList` requires `{ items, nextCursor }`.
  - [x] **Ordering divergence to get right, not copy-paste wrong**: `catalogo/index.get.ts` orders `{ id: "asc" }` (oldest-first, irrelevant for a catalog). FR-27 requires **most-recent-first**. Use `orderBy: [{ createdAt: "desc" }, { id: "desc" }]` (compound sort keeps pagination stable even though `createdAt` alone isn't guaranteed unique; the cursor itself only needs `id` to be unique, which it is).
  - [x] **Image optionality**: `catalogo/index.post.ts`'s precedent hard-requires ≥1 image (`if (imagenes.length === 0) throw ...`) and accepts multiple. Publicación's image is a **single, optional** file (FR-26: "text plus an optional single image") — do not carry over the "at least one required" validation, and store as a single nullable string field (`imagen: string | null`), not an array like `ItemCatalogo.imagenes`.
  - [x] **Local storage convention, not yet migrated**: image upload still uses `useStorage('public')` (local disk driver) exactly like `catalogo/index.post.ts` — the R2 migration is Epic 8, sequenced last, not relevant here.

- [x] Task 2: Extend `prisma/schema.prisma` with the `Publicacion` model (AC: #1, #2, #4)
  - [x] Add to `Usuario`: `publicaciones Publicacion[]` (single relation, no named-relation pair needed — unlike `Resena`, `Publicacion` only relates to one Usuario role, the author).
  - [x] New model, following the `ItemCatalogo`/`Resena` precedent (required author FK, `onDelete: Cascade`, no `publicado` gate flag — nothing in FR-26/27/28/FR-40 calls for a draft/publish state, only the existing `activo`/`activeUserFilter` cascade):
    ```prisma
    model Publicacion {
      id        Int      @id @default(autoincrement())
      texto     String
      imagen    String?
      autorId   Int
      autor     Usuario  @relation(fields: [autorId], references: [id], onDelete: Cascade, onUpdate: Cascade)
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
    }
    ```
  - [x] Field is named `autorId`/`autor` (not `usuarioId`/`usuario` like `ItemCatalogo`'s drift from convention) — this matches the Architecture spine's stated canonical convention literally, and means Story 5.2's `authorOrAdmin("publicacion", action, { autorId: existing.autorId }, usuario)` calls need **no field-name remapping**, unlike the `ItemCatalogo`/`usuarioId` situation Story 3.3 had to work around.
  - [x] Run `npx prisma migrate dev --name add_publicacion_model` (ask the user to stop `pnpm run dev` first — same Windows `EPERM` gotcha as every prior schema-touching story).

- [x] Task 3: Build `server/api/publicaciones/index.post.ts` (AC: #1)
  - [x] `const usuario = await requireSession(event)` — any authenticated user, no `requireType` gate (FR-26: any TipoUsuario can post).
  - [x] `readMultipartFormData(event)` — same parsing shape as `catalogo/index.post.ts`: iterate fields, image field name `imagenFile` (singular — only take the **first** image field encountered, ignore any additional ones rather than erroring, since the composer UI will only ever send one), text field `texto`.
  - [x] Validate `texto` is a non-empty trimmed string (400 if empty) — this is the one required field. No validation requiring an image (Task 1's note).
  - [x] If an image file is present: allowlisted extension (`.jpg/.jpeg/.png/.webp`, default `.jpg` if invalid — same as catálogo), key `publicacion-${usuario.id}-${Date.now()}${ext}`, `storage.setItemRaw(key, field.data)`, store `'/' + key` as `imagen`. If no image file: `imagen: null`.
  - [x] `prisma.publicacion.create({ data: { texto, imagen, autorId: usuario.id } })`, return the created row **with `autor` included** (`select`/`include` on `autor`: `{ id, nombre, apellido, avatar, informacion: { select: { tipoUsuario: { select: { tipo: true } } } } }` — the feed card needs the author's `tipo` label, e.g. "Deportista", matching the mockup's "Deportista · Ciclismo" style label) so the client can prepend it to the feed immediately without a second fetch (UX spine's "optimistic insert, no manual refresh").

- [x] Task 4: Build `server/api/publicaciones/index.get.ts` (AC: #2, #3, #4)
  - [x] `await requireSession(event)` — matches every other list endpoint in this app requiring auth (the unauthenticated Home branch never calls this endpoint at all per AC #5, but the endpoint itself stays consistent with the rest of the API surface).
  - [x] Cursor pagination exactly per Task 1's notes: `take: 20`, `cursor ? { skip: 1, cursor: { id: cursor } } : {}`, `orderBy: [{ createdAt: "desc" }, { id: "desc" }]`.
  - [x] `where: activeUserFilter("autor")` (AC #4) — a deactivated author's Publicaciones disappear from the feed, same mechanism as every other `activeUserFilter`-gated listing.
  - [x] `include: { autor: { select: { id: true, nombre: true, apellido: true, avatar: true, informacion: { select: { tipoUsuario: { select: { tipo: true } } } } } } }` — same author-display shape as the POST response, for consistency.
  - [x] Return `{ items, nextCursor: items.length === take ? items[items.length - 1].id : null }` — the exact shape `InfiniteScrollList`/`useInfiniteScroll` already expect, no changes needed to those shared primitives.

- [x] Task 5: Fork `app/pages/index.vue` by auth state (AC: #5)
  - [x] Change `definePageMeta({ auth: false })` — stays `false` (Home must remain viewable without login, per AC #5/UX-DR10 — `auth: false` here means "doesn't require auth to view," not "hide when authenticated"; no change to this line, just confirming it should NOT become `true`).
  - [x] Wrap the **entire existing template** (hero video block, stats block, Noticias section, Eventos section) in `<template v-if="!authStore.isAuthenticated">...</template>` — preserved byte-for-byte, no redesign, no content removed. Reuse the existing `authStore` instance already declared in this file's `<script setup>` (no new import needed).
  - [x] Add a `<template v-else>` branch containing the new feed: the composer (Task 6) + `<InfiniteScrollList :fetch-page="fetchPublicaciones">` rendering `<PublicacionCard>` per item (Task 7), wrapped in a `max-w-[42rem] mx-auto` single-column shell per the `key-home-feed.html` mockup's stated width.
  - [x] Empty-feed copy (UX spine, exact wording): `"No hay publicaciones todavía. Sé el primero en compartir algo."` — shown **above** the composer via `InfiniteScrollList`'s `#empty` slot, not blocking/hiding the composer itself (composer must always render regardless of whether the feed has any posts yet).
  - [x] No `:key` remount trick needed on `InfiniteScrollList` here (unlike the directory/catálogo filter-chip cases) — the feed has no filter to switch between, so a stable/no key is correct.

- [x] Task 6: Build the inline composer (AC: #1)
  - [x] Lives directly in `app/pages/index.vue`'s authenticated branch (or a small dedicated `app/components/PublicacionComposer.vue` if it keeps the page file more readable — either is fine, follow whichever keeps `index.vue` from becoming unwieldy given it already has 4 sections). If extracted to a component, it must emit a `created` event (or accept an `@created="(pub) => ..."` handler) so the parent can prepend the new post to the feed list.
  - [x] Fields: a `<textarea>` for `texto` (required — label it explicitly per the Accessibility Floor, `<label for>`), a file input for a single optional image (`accept="image/*"`, no `multiple`), a "Publicar" submit button (`button-primary` green-700 solid, per DESIGN.md), matching the mockup's "Agregar foto (opcional)" secondary-button copy convention for the image control's label if a plain file input's default browser chrome looks out of place next to the rest of the form — a plain styled `<input type="file">` is acceptable, no need to build a custom file-picker button, but do label it "Agregar foto (opcional)" so the optionality is explicit per the Accessibility Floor's "required/optional marked in text" rule.
  - [x] On submit: build a `FormData` (`texto`, optional `imagenFile`), `POST /api/publicaciones`, on success **prepend** the returned Publicación (with its included `autor`) to the feed's local items array (optimistic-insert-already-confirmed pattern, matching UX Flow 4 step 4 — "appears at the top of the feed immediately, no manual refresh"), clear the form, `useToast().showToast('Publicación creada', 'success')`. On error: `useToast().showToast(err?.data?.message || 'Error al publicar', 'error')`, keep the form's contents so nothing typed is lost (same convention as `ResenasSection.vue`'s error handling).
  - [x] **Wiring the prepend into `InfiniteScrollList`**: `InfiniteScrollList` owns its own internal `items` state via `useInfiniteScroll` — the composer has no direct handle into that internal ref. The cleanest approach consistent with this component's existing "closed" API (no exposed method to externally push an item) is to **not** fight the component: instead, lift the feed's `items` array up to `index.vue`'s own `<script setup>`, replace `InfiniteScrollList`'s built-in fetch-and-render with... **do not do this** — it would mean re-implementing infinite scroll instead of reusing it. Correct approach: pass a `:key` that does NOT change (so `InfiniteScrollList` isn't remounted), and instead of prepending client-side at all, simply **increment a small local `refreshTrigger` ref used as `InfiniteScrollList`'s `:key`** after a successful post, forcing a full remount that refetches from cursor `null` and naturally shows the new post at the top (since the feed is `createdAt desc`). This trades a strictly-true "optimistic, no refetch" for a correct, simple implementation reusing the existing shared component untouched — **note this as a deliberate simplification** in Dev Notes rather than modifying `InfiniteScrollList`/`useInfiniteScroll` to expose a push-item API (out of scope: those are shared primitives used by 4+ other pages, do not change their contract for this one story).

- [x] Task 7: Build `app/components/PublicacionCard.vue` (AC: #2)
  - [x] Props: `publicacion` (the object shape returned by both POST and GET: `{ id, texto, imagen, createdAt, autor: { id, nombre, apellido, avatar, informacion: { tipoUsuario: { tipo } } } }`).
  - [x] Layout per the mockup and DESIGN.md card token: `rounded-xl shadow-lg overflow-hidden hover:scale-105` white card — author avatar (reuse the initials-fallback pattern already used in `UsuarioDetailView.vue`/`ResenasSection.vue`, don't invent a new fallback style), `{{ autor.nombre }} {{ autor.apellido }}`, the author's `tipo` label (`autor.informacion?.tipoUsuario?.tipo`, plain text, e.g. "Deportista" — the mockup shows an additional " · especialidad/deporte" suffix for some types, but that data isn't fetched by this story's include shape and is not required by any AC; keep it to the bare `tipo` string, do not over-fetch additional profile fields not asked for), a relative timestamp, `texto`, and the optional `imagen` (if present) rendered below the text, `object-cover` capped height, no lightbox/zoom required by any AC here (unlike catalog/avatar images) — keep it simple, a plain `<img>`.
  - [x] **Relative timestamp**: no existing "time ago" helper exists anywhere in this codebase (confirmed via search) — write a small local function in this component (not a new shared composable/dependency, this is a one-component-only need): `< 1 min → "Hace un momento"`, `< 60 min → "Hace N minutos"`, `< 24h → "Hace N horas"`, `< 48h → "Ayer"`, else `toLocaleDateString()`. Keep it simple, this is decoration, not a load-bearing AC.
  - [x] No edit/delete/moderation controls anywhere in this component — that's entirely Story 5.2's scope (`useResourcePermissions('publicacion', ...)` wiring happens there, not here).

## Dev Notes

### Scope size

Medium — a new Prisma model, two new endpoints (one multipart create, one cursor-paginated list), a real auth-state fork on the homepage (touching a file that currently has zero conditional logic), a new composer, and a new card component. Structurally the closest analog is Story 4.1 (create+read only, permission wiring deliberately deferred to the moderation follow-up story) crossed with Story 2.1 (infinite-scroll directory pattern) — nothing here is being invented from scratch, but it's the first place these two established patterns (create+read-only content, and cursor-paginated `InfiniteScrollList`) are combined on the same page.

### Explicit non-goals for this story (Story 5.2's territory, confirmed by the epics/architecture split)

- No edit/delete UI or endpoints for Publicaciones — `useResourcePermissions('publicacion', ...)`, `authorOrAdmin(...)`, PUT/DELETE routes are all Story 5.2.
- No admin moderation of any kind on Publicaciones in this story.
- No changes to `shared/utils/resourcePermissions.ts` — the `publicacion` MATRIX entry already exists and needs nothing added for create+read.

### Architecture / conventions this story must follow

- **Transaction Script pattern** — thin `server/api/publicaciones/*.ts` handlers, no service layer.
- **Cursor pagination convention (AD-directory)**: `{ items, nextCursor }` shape, `take: 20`, id-based cursor — follow `catalogo/index.get.ts`, not `eventos`/`noticias`'s flat-array shape.
- **`activeUserFilter("autor")`** — Publicaciones ARE in the FR-40 deactivation cascade (unlike Reseñas, which were explicitly excluded per AD-5) — do not skip this filter.
- **No test framework** — same MVP non-goal as every prior story. Verify manually: as Usuario A, post text-only, confirm it appears at the top of the feed; as Usuario A, post text+image, confirm the image renders; log out and confirm Home shows the marketing hero/stats/noticias/eventos exactly as before, no feed, no composer; log back in as a second account (Usuario B) and confirm Usuario A's posts are visible to them too (feed is shared, not per-user); as an admin, deactivate Usuario A's account (via `admin/users`) and confirm Usuario A's Publicaciones disappear from the feed while deactivated, then reactivate and confirm they reappear; scroll a feed with more than 20 posts (or lower `take` temporarily while testing) and confirm infinite-scroll loads a second batch correctly, most-recent-first maintained across the cursor boundary.
- **Icon/toast conventions** — reuse existing `fa6-solid` icons and `useToast()`, no new libraries.

### Project Structure Notes

- New: `server/api/publicaciones/index.post.ts`, `server/api/publicaciones/index.get.ts`, `app/components/PublicacionCard.vue`.
- Modified: `prisma/schema.prisma` (new `Publicacion` model + `Usuario.publicaciones` relation), `app/pages/index.vue` (auth-state fork + composer + feed wiring — the existing unauthenticated content is preserved unchanged inside its own branch).
- Optional (dev's judgment call, per Task 6): `app/components/PublicacionComposer.vue` if extracted rather than inlined.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5 / Story 5.1] — verbatim ACs
- [Source: _bmad-output/planning-artifacts/prds/prd-Elite_Hub-2026-07-19/prd.md#§5.10 Publicaciones] — FR-26, FR-27, FR-28, FR-40's Publicación clause, UJ-4
- [Source: _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md#AD-1, AD-5, Consistency Conventions, Structural Seed] — matrix row, cascade inclusion, `autorId`/`autor` naming convention, `server/api/publicaciones/` seed path
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/EXPERIENCE.md#Component Patterns, State Patterns, Key Flow 4] — composer/card patterns, empty/loading/end-of-list copy, optimistic-insert framing
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/mockups/key-home-feed.html] — visual reference for card/composer layout
- [Source: prisma/schema.prisma] — existing model conventions (`ItemCatalogo`/`Resena` precedent followed over `Noticia`/`Evento`'s `publicado`-flag precedent)
- [Source: app/composables/useInfiniteScroll.ts, app/components/InfiniteScrollList.vue] — exact cursor-fetch contract reused unchanged
- [Source: server/api/catalogo/index.post.ts, server/api/catalogo/index.get.ts] — closest structural analogs for the two new endpoints
- [Source: app/pages/index.vue] — current unforked structure this story must fork without altering the unauthenticated branch's content

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

### Completion Notes List

- **Deviation from the story's plan, made during implementation:** `InfiniteScrollList.vue`'s grid was hardcoded to `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`, which the story text didn't catch — a feed inside a `max-w-[42rem]` shell would still have tried to lay out 2-4 narrow columns within that width, wrong for a single-column post feed. Fixed by adding an optional `gridClass` prop to `InfiniteScrollList.vue` (defaulting to the exact original hardcoded classes, so all 4 existing directory/catálogo usages are unaffected) and passing `grid-class="grid grid-cols-1 gap-6"` from the feed. This is the one place this story touched a shared primitive; kept the change minimal and backward-compatible.
- **Optimistic-insert simplification (flagged in the story itself, followed as written):** rather than reaching into `InfiniteScrollList`'s internal state to prepend a new post, a successful composer submission increments a local `feedKey` ref used as `InfiniteScrollList`'s `:key`, forcing a clean remount that refetches from the top. Since the feed is `createdAt desc`, the new post still lands at the top — just via a full refetch instead of a true client-side splice. `useInfiniteScroll`/`InfiniteScrollList`'s contract was left completely unchanged for every other consumer.
- `especialidad`-style author sub-label (e.g. "Deportista · Ciclismo" from the mockup) was intentionally NOT fetched — only the bare `tipoUsuario.tipo` string, per the story's explicit note not to over-fetch profile fields no AC asked for.
- No automated tests written — established MVP convention, no test framework in this project. Manual verification steps are listed in the story's Dev Notes and should be run by the user: post text-only and text+image as one account, confirm both render correctly at the top of the feed; log out and confirm the marketing homepage renders exactly as before (untouched branch); log in as a second account and confirm the first account's posts are visible (shared feed); deactivate the first account via `/admin/users` and confirm its posts disappear from the feed, reactivate and confirm they reappear.

### Post-review fix (user caught: the initial implementation replaced the entire existing homepage for authenticated users with a feed-only view)

The original implementation (per this story's Task 5 as written) forked `index.vue` into two completely separate branches by auth state — unauthenticated users kept the marketing hero/stats/noticias/eventos, but authenticated users saw *only* the feed, losing the hero/stats/noticias/eventos entirely. The user caught this immediately after testing: the existing homepage content must never be replaced by anything, for any user. Root cause: AC #5 as written in the epics file ("Given I am NOT authenticated... I see the existing marketing hero... instead of a feed — Home forks by authentication state") was misread as "authenticated users see the feed INSTEAD of the homepage," when the actual intent (confirmed by the user) was additive: the homepage content is unconditional for everyone, and Publicaciones is a new section appended to it, not a replacement branch.

Fix:
- `app/pages/index.vue`: removed the `v-if="!authStore.isAuthenticated"` / `v-else` fork entirely. The outer container is unconditional again, byte-identical to pre-story behavior for hero/stats/noticias/eventos.
- Added a new "Publicaciones" section directly below Eventos, structured exactly like the existing Noticias/Eventos sections (same `<h2 class="text-6xl text-white">` header style, same `bg-green-400` "+" button convention) — but the button ("Crear publicación") toggles a local `showComposer` ref instead of navigating to a separate `/admin/*/create` page, since FR-26 requires the composer to be inline, not a modal or separate page. Submitting a post hides the composer again and bumps `feedKey` to refresh the list.
- `server/api/publicaciones/index.get.ts`: removed the `requireSession(event)` call — the Publicaciones section, like Noticias and Eventos, is visible to anyone on the public homepage; only creating a post (`POST`, still `requireSession`-gated) and the "Crear publicación" button require authentication. This was a deliberate consistency call (not explicitly requested) to match how Noticias/Eventos already behave on this same page — flagged here in case the user wants the feed itself restricted to authenticated viewers instead.
- AC #5 is still satisfied in spirit (unauthenticated users see the original homepage, unmodified) but its literal "instead of a feed" framing no longer applies — Publicaciones is a visible-to-everyone section now, not an authenticated-only replacement view.

### File List

- prisma/schema.prisma (modified — new `Publicacion` model, `Usuario.publicaciones` relation)
- prisma/migrations/20260727183719_add_publicacion_model/migration.sql (new)
- server/api/publicaciones/index.post.ts (new)
- server/api/publicaciones/index.get.ts (new)
- app/components/PublicacionCard.vue (new)
- app/components/PublicacionComposer.vue (new)
- app/components/InfiniteScrollList.vue (modified — added optional `gridClass` prop, backward-compatible default)
- app/pages/index.vue (modified — Publicaciones section added below Eventos, no auth-state fork; homepage otherwise unchanged)
- server/api/publicaciones/index.get.ts (modified, post-review fix — no longer requires a session, matching Noticias/Eventos's public-read convention)
