---
baseline_commit: c785728633c22229001331d21717580af2599cf5
---

# Story 3.2: Vistas de catálogo — perfil propio y agregado

Status: done

## Story

As any authenticated user,
I want to view a Marca's catalog on their profile and browse all catalog items in one place,
so that I can discover products/services across brands, not just one at a time.

## Acceptance Criteria

1. **Given** a catalog item **When** created **Then** it has: nombre, tipo de item (servicio | físico), and one or more images (FR-21 — already satisfied by Story 3.1, verify only, don't rebuild)
2. **Given** a Marca's profile **When** I view it **Then** I see the brand info on top and their own catalog items section below (FR-22)
3. **Given** the aggregate Catálogo view **When** I navigate to it **Then** I see items across all marcas, browsable by category, with a "ver catálogo completo sin filtros" option (FR-22)
4. **Given** any catalog item anywhere in the app **When** I look for a checkout, cart, or payment affordance **Then** none exists — every listing is contact-only (FR-23)
5. **Given** the aggregate Catálogo view **When** I look for its entry point **Then** it's reached via a CTA from the Marcas directory, not a separate top-level nav item

## Tasks / Subtasks

- [x] Task 1: Build `server/api/catalogo/index.get.ts` — the shared listing endpoint for both views (AC: #2, #3)
  - [x] One generic, cursor-paginated (20/batch, NFR-10 convention — same shape as `/api/usuarios`) endpoint serves **both** consumers via optional query params, not two separate endpoints:
    ```ts
    export default defineEventHandler(async (event) => {
      await requireSession(event);

      const query = getQuery(event);
      const cursor = query.cursor ? parseInt(query.cursor as string) : undefined;
      const categoriaId = query.categoriaId ? parseInt(query.categoriaId as string) : undefined;
      const usuarioId = query.usuarioId ? parseInt(query.usuarioId as string) : undefined;
      const take = 20;

      const items = await prisma.itemCatalogo.findMany({
        where: {
          ...activeUserFilter('usuario'),
          ...(categoriaId ? { categoriaId } : {}),
          ...(usuarioId ? { usuarioId } : {}),
        },
        take,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: 'asc' },
        include: { categoria: true, usuario: { select: { id: true, nombre: true, apellido: true } } },
      });

      return { items, nextCursor: items.length === take ? items[items.length - 1].id : null };
    });
    ```
  - [x] `activeUserFilter('usuario')` (Story 2.4) is applied unconditionally — a deactivated Marca's catalog items are hidden from both the aggregate view and (if someone reaches it another way) their own profile section, same FR-40 cascade already applied to directories/Eventos/Noticias. `'usuario'` is the exact relation field name on `ItemCatalogo` (confirmed in Story 3.1's schema addition — not `'autor'`, this resource names it differently).
  - [x] `requireSession(event)` with no type restriction — any authenticated user browses the catalog, not just Marca-typed ones (this endpoint is read-only browsing, unrelated to Story 3.1's creation gate).

- [x] Task 2: Build `app/components/CatalogoItemCard.vue` (AC: #1, #4)
  - [x] One card, used identically by both the profile section and the aggregate view (no need for two variants): first image (`item.imagenes[0]`, fallback placeholder if empty — shouldn't happen per Story 3.1's validation, but the array could theoretically be empty from a future data-migration edge case), `nombre`, a tipo badge ("Servicio"/"Físico" display labels for `SERVICIO`/`FISICO`), `categoria.nombre`, and `usuario.nombre` (the owning Marca) — always shown, even on the owner's own profile section (harmless duplication, avoids maintaining two card variants for one cosmetic difference).
  - [x] **No price, no "add to cart," no "buy" button anywhere on this card** — AC #4 is a hard constraint; `ItemCatalogo` has no price field at all (confirmed, Story 3.1 didn't add one), so there is nothing to display even if tempted — don't invent one.

- [x] Task 3: Add the Marca's own catalog section to `app/pages/marcas/[id].vue` (AC: #2)
  - [x] **Read the current file in full first** — it's Story 2.2's detail page: back button, loading/not-found states, `<UsuarioDetailView :usuario="usuario" />`. Add a new section **below** that component (brand info stays "on top" per AC #2's literal ordering), only rendered when `usuario.informacion?.tipoUsuario?.tipo === 'Marca'` (defensive — this route is only ever linked to from Marca cards today, but the underlying `/api/usuarios/:id` endpoint doesn't itself enforce type, so guard here rather than assume).
  - [x] Fetch via `$fetch('/api/catalogo', { query: { usuarioId: route.params.id } })` — **no infinite-scroll UI here**, a single Marca's own catalog is a small, bounded list in MVP terms; rendering the first batch (up to 20 items) plainly is sufficient and matches the story's actual ask ("their own catalog items section below"), not a paginated browsing experience (that's the aggregate view's job, Task 4). Render each item via `<CatalogoItemCard>` in a simple grid; an empty state ("Todavía no tiene ítems en su catálogo.") when there are none.

- [x] Task 4: Build the aggregate Catálogo view (AC: #3, #4)
  - [x] New `app/pages/catalogo/index.vue`. Fetch `GET /api/categorias-catalogo` (Story 3.1) for the category chips — reuse `<FilterChips>` (Story 2.5, UX-DR14's second consumer, exactly as anticipated when that component was built) with the same "Todos" first-option convention already established. Selecting "Todos" (the default) is what satisfies "ver catálogo completo sin filtros" — no separate button/link needed beyond the chip row itself; landing on this page fresh (via Task 5's CTA) already starts on "Todos."
  - [x] `<InfiniteScrollList :key="selectedCategoriaId ?? 'all'" :fetch-page="fetchPage">` rendering `<CatalogoItemCard>` per item — same `:key`-remount-on-filter-change technique Story 2.5 established for Deportistas, reused unchanged (no modification to `InfiniteScrollList.vue`/`useInfiniteScroll.ts`).
  - [x] `fetchPage = (cursor) => $fetch('/api/catalogo', { query: { cursor, categoriaId: selectedCategoriaId.value || undefined } })` — no `usuarioId` param here (that's Task 3's profile-scoped case), so this naturally returns items across all Marcas.

- [x] Task 5: Add the Catálogo entry-point CTA to the Marcas directory (AC: #5)
  - [x] `app/pages/marcas/index.vue` — add a CTA (e.g. a button/link "Ver catálogo completo") near the top of the directory (alongside or just below the Hero, above the chip-less directory grid — Marcas doesn't have its own filter chips, only Deportistas does per Story 2.5), linking to `/catalogo`. **Do not** add a Catálogo entry in `app/components/layout/header.vue`'s top-level nav — AC #5 explicitly says not a separate nav item.

- [x] Task 6: Verify AC #1 and AC #4 — no code change
  - [x] AC #1 (item has nombre/tipo/images) was already built and verified in Story 3.1 — re-confirm only, don't re-implement.
  - [x] AC #4 (no checkout/cart/payment) — verify by reading `CatalogoItemCard.vue` and both consuming pages once written; there should be no button/affordance suggesting a transaction anywhere in this story's own new UI (contact happens through the Marca's own profile contact fields already visible via `UsuarioDetailView`, not through anything this story adds).

## Dev Notes

### Scope size

Medium, similar to Story 2.5 — one new shared listing endpoint (reusing established conventions wholesale: cursor pagination, `activeUserFilter`, `FilterChips`, `InfiniteScrollList`), one new card component, and three page-level changes (one addition to an existing detail page, one new aggregate page, one CTA addition). No new Prisma models or migrations — Story 3.1 already built the schema.

### Known pre-existing gaps this story does not touch

- **`/api/usuarios/:id` still doesn't validate that the requested profile actually matches the route's implied type** (e.g. nothing stops `/marcas/:id` from rendering a Deportista's data if directly navigated with a mismatched id) — this story adds a defensive `tipo === 'Marca'` check before rendering the catalog section specifically, but does not fix the underlying endpoint; that's a separate, pre-existing Story 2.2-era gap, out of scope here.
- **Story 3.3 (edit/delete)** is not pulled forward — no edit/delete controls appear on `CatalogoItemCard` in this story.

### Architecture / conventions this story must follow

- **UX-DR13/UX-DR14 both get their second real consumer in this single story:** `InfiniteScrollList` (first used for the 4 directories, Story 2.1) and `FilterChips` (first used for Deportistas' sport filter, Story 2.5) are both reused here unchanged — this is the payoff of building them generically the first time; if either needs a code change to fit the aggregate Catálogo view, that's a signal something was over-fit to its first use case and should be reconsidered, not patched around.
- **AD-5 (`activeUserFilter`):** third real usage (after directories, Eventos/Noticias) — same cascade, different relation name (`'usuario'`, not `'autor'`) since `ItemCatalogo` names its owner relation differently.
- **FR-23 (contact-only, no commerce):** a hard constraint carried through every piece of new UI in this story — no price field exists in the schema to even tempt a checkout affordance.
- **No test framework** — same MVP non-goal as every prior story; verify manually (view a Marca with catalog items on their profile detail page and confirm the section renders below the brand info; open `/catalogo`, confirm items from multiple Marcas appear; filter by category and confirm the list refetches fresh, not client-filtered; confirm the CTA on `/marcas` reaches `/catalogo` and that no such link exists in the header nav; deactivate a Marca with catalog items and confirm those items disappear from both the aggregate view and would-be profile section).

### Project Structure Notes

- New: `server/api/catalogo/index.get.ts`, `app/components/CatalogoItemCard.vue`, `app/pages/catalogo/index.vue`.
- Modified: `app/pages/marcas/[id].vue` (+ own-catalog section), `app/pages/marcas/index.vue` (+ CTA to `/catalogo`).
- No schema changes (Story 3.1 already built `ItemCatalogo`/`CategoriaCatalogo`), no new npm dependencies.

### Previous Story Intelligence (Stories 2.1/2.4/2.5/3.1)

- Story 2.1 built `InfiniteScrollList`/`useInfiniteScroll` generically for exactly this kind of reuse; Story 2.5 proved the `:key`-remount filter-change technique works without touching those primitives — this story is the second proof point for both.
- Story 2.4 built `activeUserFilter()` generic enough to take any relation name — this story is proof the design choice (a `relation: string | null` parameter, not a hardcoded `'autor'`) was correct; `ItemCatalogo.usuario` needed a different relation name and required zero changes to the helper itself.
- Story 3.1 established `ItemCatalogo`'s exact field shape (no price/description) and the `CategoriaCatalogo` fixed-list convention this story's chips consume via the already-built `GET /api/categorias-catalogo`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2] — AC source
- [Source: _bmad-output/specs/spec-Elite_Hub/functional-requirements.md] — FR-21 (verify only), FR-22, FR-23 detail
- [Source: prisma/schema.prisma] — `ItemCatalogo.usuario` exact relation name (Story 3.1), used by `activeUserFilter('usuario')`
- [Source: server/api/usuarios/index.get.ts] — cursor-pagination shape this story's `/api/catalogo` endpoint mirrors
- [Source: app/pages/deportistas/index.vue] — `FilterChips` + `InfiniteScrollList` + `:key`-remount reference implementation (Story 2.5) this story's aggregate view follows
- [Source: app/pages/marcas/[id].vue, marcas/index.vue] — current state (Story 2.2/2.1) this story extends
- [Source: server/api/categorias-catalogo/index.get.ts] — existing endpoint (Story 3.1) this story's chips consume unchanged

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

None — no schema changes, no Prisma regeneration needed.

### Completion Notes List

- Built `server/api/catalogo/index.get.ts` — one endpoint serving both consumers via optional `categoriaId`/`usuarioId` params, `activeUserFilter('usuario')` applied unconditionally.
- Built `app/components/CatalogoItemCard.vue` — single card reused by both views, no price/checkout affordance (none exists in the schema to begin with).
- Added the own-catalog section to `app/pages/marcas/[id].vue` (below `UsuarioDetailView`, Marca-type-gated) and built the aggregate `app/pages/catalogo/index.vue` (reusing `FilterChips`/`InfiniteScrollList`/the `:key`-remount technique from Stories 2.5/2.1 with zero changes to either primitive).
- Added the "Ver catálogo completo" CTA to `app/pages/marcas/index.vue`; confirmed no "Catálogo" entry exists in `header.vue`'s nav.
- **Post-review addition (user request, confirmed not covered by any upcoming story — Story 3.3 is edit/delete permissions only, not a detail view):** built a full item-detail experience matching the Usuario click-through pattern (Story 2.2). New `server/api/catalogo/[id].get.ts` (single-item fetch, `activeUserFilter('usuario')`-consistent, 404s for a deactivated owner) and `app/pages/catalogo/[id].vue` (all images in a gallery, each click-to-zoom via the same `Teleport`-based lightbox pattern from `UsuarioDetailView`/`UsuarioDirectoryCard`, "Volver" via `router.back()`, link to the owning Marca's profile). `CatalogoItemCard.vue` is now itself a `NuxtLink` to the detail route, with its own thumbnail keeping an independent click-to-zoom lightbox (`.stop.prevent` so zooming the thumbnail doesn't also navigate — same technique already used for user avatars). Added `keepalive: true` to `catalogo/index.vue` so returning from an item's detail page preserves the aggregate view's loaded items and scroll position, mirroring the directory pages' established mechanism.
- **Post-review addition (user request):** added a "Volver" button (`router.back()`) to `catalogo/index.vue` itself, matching the pattern already used on `eventos/index.vue`/`noticias/index.vue`.
- **User-flagged backlog item (not this story's scope, not fixed now):** `ItemCatalogo`'s field set (nombre, tipoItem, imagenes, categoria) is intentionally minimal per FR-21's exact wording (Story 3.1) — the user has explicitly signaled they want more fields added later (e.g. a description, and whatever else a real catalog listing needs beyond the MVP minimum). No AC in Epic 3 currently asks for this, so it's not built here; flagging it for whoever scopes the next round of catalog work (likely a schema migration + `ProfileEditForm`-style per-field additions to the create form) — a real backlog item, not a stale/superseded one like the ACs Story 2.1's deletion made moot.
- No automated tests written — same project-wide convention as every prior story. Verified manually instead: confirmed `ItemCatalogo` has no price field anywhere in the schema (AC #4 structurally impossible to violate by accident), traced the `:key`-remount and `activeUserFilter('usuario')` reuse against their Story 2.5/2.4 originals to confirm no modification was needed to either.

### File List

- `server/api/catalogo/index.get.ts` (new)
- `app/components/CatalogoItemCard.vue` (new)
- `app/pages/catalogo/index.vue` (new)
- `app/pages/marcas/[id].vue` (modified — own-catalog section)
- `app/pages/marcas/index.vue` (modified — CTA to `/catalogo`)
- `server/api/catalogo/[id].get.ts` (new — single-item fetch for the detail page)
- `app/pages/catalogo/[id].vue` (new — item detail page with image gallery + lightbox)

## Change Log

- 2026-07-26: Story implemented — Marca catalogs are now viewable both on the owning Marca's profile and in a new aggregate, category-filterable Catálogo view reached via a CTA from the Marcas directory.

### File List
