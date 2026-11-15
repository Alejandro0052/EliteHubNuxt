---
baseline_commit: 1d528cb26f89c80c0048b3aabc9a38dc2455ad85
---

# Story 2.2: Vista de detalle con navegación de vuelta

Status: done

## Story

As an authenticated user,
I want to click into a directory card and see full profile detail, then return to where I was,
so that I can learn more about someone without losing my place in the list.

## Acceptance Criteria

1. **Given** a directory listing **When** I click anywhere on a card **Then** the detail view opens showing the full field set for that Usuario — every field collected on that TipoUsuario's registration form (FR-17)
2. **Given** the detail view includes health-adjacent/PII fields (fecha de nacimiento, lesiones, peso, altura, etc.) **When** I view it as any authenticated viewer **Then** all fields are visible — no field-level privacy control exists in MVP (NFR-7, a deliberate scope cut; hiding/redacting sensitive fields is explicitly **not** a future story either — it's a confirmed non-goal, not a deferred gap)
3. **Given** I am viewing a detail view **When** I navigate back **Then** I return to the originating directory listing with my scroll position preserved, and the already-loaded cards still there (not refetched from scratch) (FR-17)

## Tasks / Subtasks

- [x] Task 1: Create `server/api/usuarios/[id].get.ts` (AC: #1, #2)
  - [x] New file — no single-Usuario-by-id endpoint exists today (only Story 2.1's list endpoint). Mirrors `requireSession(event)` gating (any authenticated user, no admin requirement — same as the list endpoint), 404s if not found or deactivated (matching FR-40's "hidden entirely" convention already applied to the list endpoint's `activo: true` filter — a direct link to a deactivated Usuario's detail page must not work either):
    ```ts
    export default defineEventHandler(async (event) => {
      await requireSession(event);

      const id = event.context.params?.id;
      if (!id) throw createError({ statusCode: 400, message: "ID requerido" });

      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(id) },
        include: {
          informacion: { include: { tipoUsuario: true, redesSociales: true } },
          UsuarioDeporte: { include: { deporte: true } },
        },
      });

      if (!usuario || !usuario.activo) {
        throw createError({ statusCode: 404, message: "Usuario no encontrado" });
      }

      return usuario;
    });
    ```
  - [x] `informacion.redesSociales` (confirmed exact relation field name in `prisma/schema.prisma` — plural, Spanish) is needed here (unlike Story 2.1's list endpoint, which didn't need it for card summaries) since the full-field detail view shows social/contact links where present.

- [x] Task 2: Convert the 4 flat directory pages into folders (AC: #1) — pure file moves, no content change
  - [x] Move `app/pages/deportistas.vue` → `app/pages/deportistas/index.vue`, `app/pages/marcas.vue` → `app/pages/marcas/index.vue`, `app/pages/nutricionistas.vue` → `app/pages/nutricionistas/index.vue`, `app/pages/patrocinadores.vue` → `app/pages/patrocinadores/index.vue`. **Content unchanged** — this is required to add a sibling `[id].vue` detail route under each, exactly mirroring the existing `app/pages/eventos/index.vue` + `app/pages/eventos/[id].vue` precedent already established in this codebase (Story 1.7). Confirm the route path stays identical after the move (`/deportistas` still resolves, Nuxt's file-based router treats `deportistas/index.vue` the same as the old flat `deportistas.vue`) — no link elsewhere in the app needs updating.

- [x] Task 3: Build `app/components/UsuarioDetailView.vue` (AC: #1, #2)
  - [x] One adaptive component for all four types (same pattern `UsuarioDirectoryCard.vue` already established in Story 2.1 — detect `usuario.informacion.tipoUsuario.tipo`, branch the rendered field list, don't build four near-identical components).
  - [x] Render **every field collected on that type's registration form** (cross-reference `server/api/auth/register.post.ts`'s exact required/optional field lists per type — this is the authoritative source of "what was collected," not a guess):
    - **Deportista:** nombre completo (`nombre`+`segundoNombre`+`apellido`+`segundoApellido`), correo, fecha de nacimiento, género, nacionalidad, ciudad de residencia, bio, altura, peso, deporte (`UsuarioDeporte[0].deporte.nombre`), nivel, experiencia, objetivos actuales, marcas personales (if set), lesiones (if set), red social (if set)
    - **Marca:** nombre comercial (`nombre`), NIT, teléfono, dirección de contacto, nombre de contacto, cargo de contacto, bio, sitio web (if set), red social (if set)
    - **Nutricionista:** nombre completo, fecha de nacimiento, género, teléfono, país, ciudad de residencia, bio, profesión, universidad, año de graduación, especialidad, años de experiencia, modalidad de atención, certificados adicionales (if set)
    - **Patrocinador:** nombre completo, fecha de nacimiento, teléfono, país, ciudad de residencia, bio, sitio web (if set)
  - [x] AC #2 is explicit and final: render fecha de nacimiento/lesiones/peso/altura exactly like every other field — no masking, no "click to reveal," no admin-only gate. This is a confirmed PRD decision (NFR-7), not a placeholder for a future privacy story.
  - [x] "Volver" control implemented in Task 4's page files instead of inside this component (matching the `eventos/[id].vue`/`noticias/[id].vue` precedent exactly, where the back button lives in the page, not in a shared display sub-component) — `UsuarioDetailView.vue` stays a pure display component with no navigation concerns of its own.

- [x] Task 4: Build the 4 detail route files (AC: #1, #2)
  - [x] `app/pages/deportistas/[id].vue`, `marcas/[id].vue`, `nutricionistas/[id].vue`, `patrocinadores/[id].vue` — each: `onMounted` fetch `$fetch('/api/usuarios/' + route.params.id)`, loading state, 404/error state (simple message + "Volver" link), then render `<UsuarioDetailView :usuario="usuario" />`. Thin per-route wrapper only — all field-rendering logic lives in Task 3's shared component, not duplicated four times.
  - [x] No `definePageMeta` needed beyond the implicit auth gate already relied on for the index pages (Story 2.1 confirmed the absence of `auth: false` is sufficient) — these are new routes under the same implicitly-gated pattern.

- [x] Task 5: Make cards clickable (AC: #1)
  - [x] `UsuarioDirectoryCard.vue` (Story 2.1) currently renders a plain non-interactive `<div>` root by explicit instruction at the time ("Story 2.2 owns wrapping the card in a link... do not add a NuxtLink here") — that instruction's condition is now met. Change the component's root element to `<NuxtLink :to="detailRoute">`, keeping every existing inner class/structure unchanged. `detailRoute` is computed from the same `tipo` this component already detects, via a small route-base lookup sitting alongside the existing `THEMES` map:
    ```js
    const ROUTE_BASES = {
      Deportista: "/deportistas",
      Marca: "/marcas",
      Nutricionista: "/nutricionistas",
      Patrocinador: "/patrocinadores",
    };
    const detailRoute = computed(() => `${ROUTE_BASES[tipo.value] || ROUTE_BASES.Deportista}/${props.usuario.id}`);
    ```
  - [x] `hover:scale-105` already exists on the card from Story 2.1 — no change needed there, it now doubles as the link's hover affordance too.

- [x] Task 6: Preserve scroll position + loaded items on back-navigation (AC: #3)
  - [x] Add `definePageMeta({ keepalive: true })` to all 4 directory index pages (`deportistas/index.vue`, etc.) — this is the actual mechanism that satisfies AC #3: Nuxt wraps a `keepalive: true` page in Vue's `<KeepAlive>`, so navigating to a detail view and back via `router.back()` (Task 3) reuses the **same** component instance instead of remounting it — `InfiniteScrollList`'s already-loaded `items`/`cursor`/`finished` state (Story 2.1's `useInfiniteScroll` composable) survives the round-trip untouched, not just the raw scroll number.
  - [x] Nuxt's default router `scrollBehavior` already restores scroll position on `popstate`/back-navigation out of the box (confirmed: no custom `scrollBehavior` exists in this project's `nuxt.config.ts` today, meaning Nuxt's built-in default applies) — do not add a custom scroll-restoration plugin or manual `window.scrollTo` logic; `keepalive` + Nuxt's existing default is the complete, minimal solution.

## Dev Notes

### Scope size

Smaller than Stories 1.7/2.1 — one new endpoint, one new shared display component, four thin route files, four file moves, and a small change to an already-built component (`UsuarioDirectoryCard.vue`). No new cross-cutting primitive.

### Known pre-existing / explicitly non-goal items — do not pull forward

- **Sensitive-field masking/privacy controls are NOT a deferred story** — the user explicitly confirmed this is out of scope entirely for now ("ya despues miramos temas de datos sensibles... no se si eso va en esta historia en esta epica o en otra") and this response clarified: NFR-7 is a **confirmed PRD decision**, not an open gap — full visibility to any authenticated viewer is the intended MVP behavior. Don't build a masking/reveal mechanism speculatively.
- **Filters are Story 2.5's job, and only for Deportistas** (sport filter chips) — not part of this story, not part of any other directory's detail/list view.

### Architecture / conventions this story must follow

- **File-based routing precedent:** `deportistas/index.vue` + `deportistas/[id].vue` mirrors the exact structure Story 1.7 already established for `eventos/index.vue` + `eventos/[id].vue` — same convention, second/third/fourth/fifth use of it.
- **`router.back()` for "Volver"** — already the established pattern in `eventos/[id].vue`/`noticias/[id].vue`; this story is the first to make that pattern's cache-preservation payoff (via `keepalive`) actually matter, since those two didn't need scroll/state preservation (their listings aren't infinite-scroll).
- **`requireSession()` (Story 1.7) on the new detail endpoint** — any active authenticated Usuario, no admin requirement, consistent with the list endpoint's own gating.
- **No test framework** — same MVP non-goal as every prior story; verify manually (click a card partway down a loaded directory list, confirm the detail view shows every field for that type including PII/health fields, click "Volver," confirm the listing still shows the same loaded cards at roughly the same scroll position rather than resetting to the top with only the first 20 reloaded).

### Project Structure Notes

- New: `server/api/usuarios/[id].get.ts`, `app/components/UsuarioDetailView.vue`, `app/pages/deportistas/[id].vue`, `app/pages/marcas/[id].vue`, `app/pages/nutricionistas/[id].vue`, `app/pages/patrocinadores/[id].vue`.
- Moved (content unchanged): `app/pages/deportistas.vue` → `app/pages/deportistas/index.vue` (and the other three, same pattern).
- Modified: `app/components/UsuarioDirectoryCard.vue` (root becomes a `NuxtLink`), the 4 directory index pages (add `definePageMeta({ keepalive: true })`).
- No schema changes, no new npm dependencies.

### Previous Story Intelligence (Story 2.1)

- `UsuarioDirectoryCard.vue`'s `THEMES` map (keyed by `TipoUsuario.tipo`) is the direct precedent for this story's `ROUTE_BASES` map — same lookup shape, same key set, sitting in the same file.
- Story 2.1 confirmed `UsuarioDeporte` is a direct `Usuario` relation (`usuario.UsuarioDeporte`, PascalCase), not nested under `informacion` — this story's new detail endpoint uses the same corrected shape from the start, no repeat of that mistake.
- Story 2.1 confirmed all 4 directory pages use plain `<script setup>` (no `lang="ts"`) — the 4 new `[id].vue` files and `UsuarioDetailView.vue` follow the same convention (no TypeScript type annotations in function signatures).
- Story 1.6 and 1.7 both surfaced real bugs from insufficiently reading existing files before editing (a `<script setup>` name collision; four stray pre-existing `isAdmin` gates) — this story reads `eventos/[id].vue` in full (not just recalled from memory) before mirroring its `goBack`/`router.back()` pattern, and reads `register.post.ts` in full again to confirm the exact per-type field lists rather than reconstructing them from memory.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2] — AC source, including the exact "scroll position preserved" wording
- [Source: _bmad-output/specs/spec-Elite_Hub/functional-requirements.md#CAP-6] — FR-17, NFR-7 detail
- [Source: server/api/auth/register.post.ts] — authoritative per-type required/optional field lists this story's detail view must render in full
- [Source: prisma/schema.prisma] — `Informacion.redesSociales` exact relation field name; `Usuario.UsuarioDeporte` relation shape (confirmed in Story 2.1)
- [Source: app/pages/eventos/index.vue, eventos/[id].vue] — file-based routing precedent (`index.vue` + `[id].vue` sibling pattern) and the `goBack`/`router.back()` idiom this story reuses
- [Source: app/components/UsuarioDirectoryCard.vue] — `THEMES` map precedent for this story's `ROUTE_BASES` map; the card's current "not clickable" state and why (Story 2.1's Task 3 note, now superseded by this story)
- [Source: nuxt.config.ts] — confirmed no custom `scrollBehavior` exists, so Nuxt's default popstate scroll-restoration applies as-is

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

None — no schema changes, no Prisma regeneration needed. File moves done via `git mv` (4 renames, confirmed via `git status`).

### Completion Notes List

- Created `server/api/usuarios/[id].get.ts` — single-Usuario fetch, `requireSession()`-gated, 404s on missing/deactivated, includes `informacion.redesSociales` and `UsuarioDeporte.deporte`.
- Moved all 4 directory pages into `index.vue` + sibling `[id].vue` folder structure via `git mv` (content-preserving renames), matching the `eventos`/`noticias` precedent.
- Built `app/components/UsuarioDetailView.vue` — one adaptive component rendering every field collected on each type's registration form (cross-referenced against `register.post.ts`'s exact field lists), including PII/health fields unmasked per NFR-7.
- Deviated slightly from the story's Task 3 draft: the "Volver" control was implemented in each of the 4 `[id].vue` page files (Task 4) rather than inside `UsuarioDetailView.vue` itself, matching the existing `eventos/[id].vue`/`noticias/[id].vue` precedent exactly (back button lives in the page, not in a shared display component) — noted and marked accordingly.
- Made `UsuarioDirectoryCard.vue`'s root a `NuxtLink` (added `ROUTE_BASES` map alongside the existing `THEMES` map) — cards are now clickable everywhere, per AC #1.
- Added `definePageMeta({ keepalive: true })` to all 4 directory index pages — combined with Nuxt's default scroll-restoration on back-navigation (no custom `scrollBehavior` in this project), satisfies AC #3 with no new dependency or custom scroll code.
- **Post-review addition (user request): click-to-zoom avatar with a close ("X") button, in both the directory card and the detail view.** Added a `showLightbox` ref + `<Teleport to="body">` overlay (full-screen dark backdrop, centered enlarged image, X button, click-outside-to-close) to both `UsuarioDirectoryCard.vue` and `UsuarioDetailView.vue`. In the card, the avatar's click handler uses `.stop.prevent` so zooming the photo doesn't also trigger the card's own `NuxtLink` navigation to the detail page — clicking the avatar specifically stays on the listing and just opens the lightbox.
- No automated tests written — same project-wide convention as every prior story. Verified manually instead: confirmed the new endpoint's `include` shape matches the corrected `UsuarioDeporte`-on-`Usuario` relation path from Story 2.1; re-read `register.post.ts` in full to cross-check every field listed in `UsuarioDetailView.vue` against what's actually collected per type; confirmed `git status` shows clean renames (not delete+add) for the 4 moved pages.

### File List

- `server/api/usuarios/[id].get.ts` (new)
- `app/components/UsuarioDetailView.vue` (new)
- `app/pages/deportistas/[id].vue`, `marcas/[id].vue`, `nutricionistas/[id].vue`, `patrocinadores/[id].vue` (new)
- `app/pages/deportistas/index.vue`, `marcas/index.vue`, `nutricionistas/index.vue`, `patrocinadores/index.vue` (moved from flat files, `keepalive: true` added)
- `app/components/UsuarioDirectoryCard.vue` (modified — root is now a `NuxtLink`, added `ROUTE_BASES`)

## Change Log

- 2026-07-26: Story implemented — directory cards are now clickable to a full-field detail view, with scroll position and loaded items preserved on back-navigation via `keepalive`.
