---
baseline_commit: 1d528cb26f89c80c0048b3aabc9a38dc2455ad85
---

# Story 2.1: Directorios segmentados con scroll infinito

Status: done

## Story

As an authenticated user,
I want to browse each user type in its own directory with infinite scroll,
so that I can find deportistas, marcas, nutricionistas, or patrocinadores without wading through everyone.

## Acceptance Criteria

1. **Given** I am authenticated **When** I navigate to the Deportistas, Marcas, Nutricionistas, or Patrocinadores directory **Then** I see only Usuarios of that TipoUsuario (FR-15)
2. **Given** a directory listing **When** it loads **Then** results load via infinite scroll, not numbered pagination, in cursor-based batches of 20 records (FR-16, NFR-10)
3. **Given** a directory card **When** it renders **Then** it shows the type's most relevant summary fields (e.g. nombre/apellido or razón social for marcas) plus profile photo (FR-16)
4. **Given** I am not authenticated **When** I attempt to access any directory route **Then** I am redirected to `/login` (NFR-2)
5. **Given** a directory with zero matching records **When** it loads **Then** an explicit empty state renders, not a blank or broken container

## Tasks / Subtasks

- [x] Task 1: Create `server/api/usuarios/index.get.ts` — the shared cursor-paginated listing endpoint (AC: #1, #2, #4)
  - [x] **No `server/api/usuarios/**` endpoint exists at all today** — this is a brand-new resource, not a modification. One generic handler serves all four directories via a `tipo` query param (Transaction Script per AD-1 — no need for four near-identical files):
    ```ts
    const TIPOS_VALIDOS = ["Deportista", "Marca", "Nutricionista", "Patrocinador"] as const;

    export default defineEventHandler(async (event) => {
      await requireSession(event); // any active authenticated Usuario — NFR-2, no requireAdmin

      const query = getQuery(event);
      const tipo = query.tipo as string;
      if (!(TIPOS_VALIDOS as readonly string[]).includes(tipo)) {
        throw createError({ statusCode: 400, message: "Tipo de usuario no válido." });
      }

      const cursor = query.cursor ? parseInt(query.cursor as string) : undefined;
      const take = 20;

      const items = await prisma.usuario.findMany({
        where: { activo: true, informacion: { tipoUsuario: { tipo } } },
        take,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: "asc" },
        include: {
          informacion: { include: { tipoUsuario: true } },
          UsuarioDeporte: { include: { deporte: true } },
        },
      });

      return {
        items,
        nextCursor: items.length === take ? items[items.length - 1].id : null,
      };
    });
    ```
  - [x] `requireSession(event)` (Story 1.7's primitive) is what makes AC #4 real at the API layer — the page-level redirect (already structurally in place, see Task 4) is not sufficient alone per NFR-3 ("server-side, not just UI-hidden").
  - [x] `where: { activo: true, ... }` excludes deactivated Usuarios (FR-40) — inlined directly here, same reasoning as Story 1.6's `aggregates.ts`: this is a direct filter on the `Usuario` model's own `activo` field, not a nested-relation case, so it does **not** need (and should not attempt to use) the still-unbuilt `activeUserFilter()` helper (AD-5), which exists specifically for filtering *other* models through a Usuario relation (e.g. `Resena.autor`, `Evento.autor`) — a different shape of problem. Do not build `activeUserFilter()` in this story; it remains a genuinely open gap for whichever story first needs it (e.g. Story 2.4, or Eventos/Noticias listings if those are ever revisited for author-activo filtering).
  - [x] `include.UsuarioDeporte.deporte` is fetched for every type even though only Deportista cards use it — acceptable for a first cut (all four types share one endpoint and one response shape by design); revisit only if this becomes a real payload-size problem, which it won't at MVP scale.

- [x] Task 2: Build the reusable infinite-scroll primitives (AC: #2, #5) — UX-DR13, first real usage
  - [x] **Neither `app/composables/useInfiniteScroll.ts` nor `app/components/InfiniteScrollList.vue` exist yet.** UX-DR13 requires ONE reusable component "shared across all 4 directories, the home feed, and the aggregate Catálogo view" — build it generically (a scoped-slot list wrapper, not Usuario-specific), even though this story only wires it into the 4 directories; Epic 3/5 reuse it later without a rewrite.
  - [x] `app/composables/useInfiniteScroll.ts` — generic cursor/loading state machine, takes a page-fetcher function:
    ```ts
    export function useInfiniteScroll<T>(fetchPage: (cursor: number | null) => Promise<{ items: T[]; nextCursor: number | null }>) {
      const items = ref<T[]>([]) as Ref<T[]>;
      const cursor = ref<number | null>(null);
      const loading = ref(false);
      const initialLoading = ref(true);
      const finished = ref(false);
      const error = ref<string | null>(null);

      async function loadMore() {
        if (loading.value || finished.value) return;
        loading.value = true;
        error.value = null;
        try {
          const page = await fetchPage(cursor.value);
          items.value.push(...page.items);
          cursor.value = page.nextCursor;
          if (page.nextCursor === null) finished.value = true;
        } catch (e) {
          error.value = "Error al cargar resultados.";
        } finally {
          loading.value = false;
          initialLoading.value = false;
        }
      }

      return { items, loading, initialLoading, finished, error, loadMore };
    }
    ```
  - [x] `app/components/InfiniteScrollList.vue` — wraps the composable, exposes a default scoped slot per item (`<slot :item="item" />`), an `empty` slot (AC #5), a skeleton state while `initialLoading`, an `IntersectionObserver`-driven sentinel `<div>` at the list's end that calls `loadMore()` when it scrolls into view, and the end-of-list marker with the exact ratified copy: **"Eso es todo por ahora."** (EXPERIENCE.md's Empty/Error States table). The loading/end-of-list region carries `aria-live="polite"` (UX-DR16 — "Cargando más resultados" while loading, "Eso es todo por ahora." at the end) — cheap to bake in now since this is the exact component that requirement is about; Story 7.3 verifies it later, it doesn't build it.
    ```vue
    <template>
      <div>
        <div v-if="initialLoading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div v-for="n in 8" :key="n" class="h-48 animate-pulse rounded-xl bg-gray-200"></div>
        </div>

        <div v-else-if="items.length === 0">
          <slot name="empty" />
        </div>

        <template v-else>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <slot v-for="item in items" :key="itemKey(item)" :item="item" />
          </div>
          <div ref="sentinel" aria-live="polite" class="py-8 text-center text-sm text-gray-500">
            {{ finished ? "Eso es todo por ahora." : loading ? "Cargando más resultados" : "" }}
          </div>
        </template>
      </div>
    </template>
    ```
    Props: `fetchPage` (function), `itemKey` (function, default `(item) => item.id`). Calls `loadMore()` once on mount and again whenever the sentinel intersects, via a plain `IntersectionObserver` set up in `onMounted`/torn down in `onBeforeUnmount`.
  - [x] Card grid breakpoints — implemented as `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`, matching EXPERIENCE.md's Responsive & Platform table (1/2/3/4 columns at `<md`/`md`/`lg`/`xl`) using this codebase's existing Tailwind breakpoint convention (e.g. `eventos/index.vue`'s `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`), not the `sm:`-prefixed draft shown above.

- [x] Task 3: Build `app/components/UsuarioDirectoryCard.vue` (AC: #3)
  - [x] One card component for all four types (not four near-identical components) — the differences are one secondary line and nothing else. `usuario.nombre`/`usuario.apellido` already hold the correct display name for every type as stored today (confirmed in `register.post.ts`: Marca stores its `nombreComercial` directly into `Usuario.nombre` with `apellido: ""` at registration — so "razón social for marcas" (FR-16) is already satisfied by the same `nombre` field every card reads, no special-casing needed there).
  - [x] Secondary line varies by `informacion.tipoUsuario.tipo`:
    - Deportista → first `informacion.usuarioDeportes[0].deporte.nombre` (if any)
    - Marca → `informacion.sitioWeb` (if set)
    - Nutricionista → `informacion.especialidad`
    - Patrocinador → `informacion.ciudadResidencia`
  - [x] Photo: `usuario.avatar` with a fallback initials circle, matching the existing fallback pattern already used in `header.vue`'s `UserDropdown` trigger (`v-else` initials circle) — reuse that visual idiom, don't invent a new one.
  - [x] **Not clickable in this story.** Story 2.2 ("Vista de detalle con navegación de vuelta") owns wrapping the card in a link to a detail route that doesn't exist yet — do not add a `NuxtLink`/`@click` or invent a placeholder detail route here; render the card as a plain, non-interactive `<div>`.

- [x] Task 4: Replace each page's marketing filler with the real listing (AC: #1, #2, #3, #5) — **explicit user direction, overriding this story's original draft**
  - [x] **Read each of the four pages in full before editing** (`app/pages/deportistas.vue`, `marcas.vue`, `nutricionistas.vue`, `patrocinadores.vue`) — all four are, today, pure marketing/landing pages with **zero real Usuario data** (hardcoded fake "Featured Brands" like Nike/Adidas on `marcas.vue`, decorative sport-icon tiles on `deportistas.vue`, generic services/benefits/features grids and CTA blocks on all four — none of it wired to any API).
  - [x] Per explicit user instruction, **delete all of the hardcoded marketing filler** on all four pages — the features/services/benefits grids, the fake "Featured Brands" list, the decorative sport-icon tiles, and the CTA blocks ("¿Listo para ser un deportista elite?" etc.) — and replace that space with the real infinite-scroll directory. This intentionally departs from `epics.md`'s Story 2.5 note about retaining `deportistas.vue`'s CTA "as-is" — that note reflected the plan *before* this direct instruction; if Story 2.5 later expects a CTA section to still exist there, reconcile it against the current (post-2.1) state of the page at that time, don't restore the deleted content preemptively.
  - [x] **Keep, unchanged:** the Hero section (title/subtitle via `pageContent`, ContentEditor-driven — this is real CMS content, not marketing filler) and the page's existing background gradient (`bg-gradient-to-br from-*-50 to-*-50`) and overall shell — "continuidad al estilo que tiene de momento" means the new directory section reuses the same visual idiom the deleted marketing cards already used (`bg-white rounded-xl shadow-lg` cards, already consistent across all four pages), sitting inside the same gradient-backed page shell, not a visual overhaul.
  - [x] Replace the deleted marketing sections with: `<InfiniteScrollList :fetch-page="fetchPage">` where `fetchPage = (cursor) => $fetch('/api/usuarios', { query: { tipo: 'Deportista', cursor } })` (swap the literal type string per page — `'Marca'`/`'Nutricionista'`/`'Patrocinador'`), rendering `<UsuarioDirectoryCard :usuario="item" />` per the default scoped slot (styled `bg-white rounded-xl shadow-lg`, matching the deleted cards' own look), with an `empty` slot showing e.g. "Todavía no hay deportistas registrados." (per-page copy, matching AC #5 — vary the noun per page).
  - [x] `deportistas.vue`'s decorative "Categorías Deportivas" tiles are deleted along with the rest of the marketing filler per the instruction above — Story 2.5 still owns building the *real* functional sport-filter chips from scratch on top of this story's directory; there's nothing to "reconcile" anymore since the cosmetic version is gone, not reused.

- [x] Task 5: Confirm the existing implicit auth gate already satisfies AC #4 — no code change
  - [x] All four pages call `definePageMeta({...})` **without** `auth: false` (confirmed by reading all four in full) — per `@sidebase/nuxt-auth`'s `normalizeUserOptions`, the *absence* of an `auth` key defaults to gated (same default every other non-public page in this codebase already relies on, e.g. `profile.vue`, `settings.vue`, which also set no explicit `auth` key). This already satisfies AC #4 structurally; do not add a redundant `auth: true` or a bespoke middleware — that would just duplicate what the global middleware already does for free.

## Dev Notes

### Scope size

Comparable to Story 1.7: two new shared primitives (`useInfiniteScroll`/`InfiniteScrollList`, explicitly reused by Epics 3/5 later) plus a new shared listing endpoint plus a new shared card component, wired into four existing pages that currently contain **no real user data at all** — they're marketing placeholders. Detail-view click-through (Story 2.2) and the real Deportista sport filter (Story 2.5) are explicitly **not** this story's job — don't pull either forward.

### Known pre-existing gaps this story does not touch

- **`activeUserFilter()` (AD-5) still does not exist** — this story's own `activo: true` filter is a direct field filter on `Usuario`, not the nested-relation case that helper is for; still an open gap for Eventos/Noticias/Reseñas/Publicaciones author-activo filtering whenever that's tackled.
- **Story 2.5's own AC text** ("the existing 'why use the app' marketing CTA section... retained/improved, not removed") **is now stale** — it described `deportistas.vue`'s pre-2.1 state. Per the user's explicit instruction, this story deletes that CTA along with the rest of the marketing filler. Whoever picks up Story 2.5 should treat the page as it exists after this story, not re-add the deleted CTA to satisfy a note written against the old version of the page.

### Architecture / conventions this story must follow

- **AD-1:** one generic `server/api/usuarios/index.get.ts` handler (query-param-driven), not four near-identical per-type files.
- **NFR-10:** cursor-based, 20/batch, one fixed convention — this story establishes it; every later infinite-scroll consumer (feed, catálogo) matches this exact batch size and cursor shape.
- **UX-DR13:** the infinite-scroll primitive must be genuinely reusable (scoped-slot, not Usuario-shaped) since Epic 3 (Catálogo) and Epic 5 (home feed) import it unchanged later.
- **UX-DR16:** `aria-live="polite"` on the loading/end-of-list region, exact ratified copy ("Eso es todo por ahora.", "Cargando más resultados") — built now since it's cheap and it's this exact component's own state, verified later by Story 7.3, not built by it.
- **No test framework** — same MVP non-goal as every prior story; verify manually (confirm each of the 4 directories shows only its own type, confirm a deactivated test Usuario doesn't appear, confirm the empty-state renders if you temporarily filter to a type with zero seed rows, confirm unauthenticated access redirects to `/login`).

### Project Structure Notes

- New: `server/api/usuarios/index.get.ts`, `app/composables/useInfiniteScroll.ts`, `app/components/InfiniteScrollList.vue`, `app/components/UsuarioDirectoryCard.vue`.
- Modified: `app/pages/deportistas.vue`, `app/pages/marcas.vue`, `app/pages/nutricionistas.vue`, `app/pages/patrocinadores.vue` (each gains one new section; nothing removed).
- No schema changes, no new npm dependencies (`IntersectionObserver` is a native browser API).

### Previous Story Intelligence (Story 1.7)

- Story 1.7 built `requireSession()` — this story is its second consumer. Reuse it exactly as-is (no `requireAdmin` option needed here).
- Story 1.7's post-review fix found stray pre-existing `authStore.user?.isAdmin` gates scattered across pages beyond the ones directly touched (homepage + both listing pages' "Crear" buttons) — a reminder to grep broadly for related checks before declaring a story done. Applied here: confirmed via search that no other page references `/api/usuarios` or duplicates directory-fetching logic that this story's new endpoint would orphan.
- Story 1.6 hit a real `<script setup>` bug: a local `ref`/const sharing a name with an auto-imported component silently breaks resolution. Double-checked: `UsuarioDirectoryCard`, `InfiniteScrollList` don't collide with any existing component name; `items`/`loading`/`cursor` (composable-internal) aren't used as top-level bindings in any of the four page components being edited.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1, #UX-DR13, #UX-DR16] — AC source, infinite-scroll component requirement, aria-live requirement
- [Source: _bmad-output/specs/spec-Elite_Hub/functional-requirements.md#CAP-6] — FR-15/FR-16 detail
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/EXPERIENCE.md#State Patterns, #Accessibility Floor, #Responsive & Platform] — exact copy ("Eso es todo por ahora.", "Cargando más resultados"), card grid breakpoints (1/2/3/4 at `<md`/`md`/`lg`/`xl`), FR-40 hidden-not-placeholder convention
- [Source: prisma/schema.prisma] — `Usuario.informacion → Informacion.tipoUsuario`/`usuarioDeportes → Deporte` relation paths
- [Source: server/api/auth/register.post.ts] — confirms `Usuario.nombre` already holds `nombreComercial` for Marca at creation time (no special-casing needed for the card's primary name)
- [Source: app/pages/deportistas.vue, marcas.vue, nutricionistas.vue, patrocinadores.vue] — confirmed all four are marketing-only today, no real listing, no explicit `auth: false`
- [Source: app/components/layout/header.vue] — `UserDropdown` trigger's avatar/initials fallback pattern reused by `UsuarioDirectoryCard`
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2, #Story 2.5] — confirms detail click-through and the real sport filter are explicitly out of this story's scope

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

None — no schema changes, no Prisma regeneration needed.

### Completion Notes List

- Corrected two mistakes found while implementing: (1) `UsuarioDeporte` is a direct `Usuario` relation (`Usuario.UsuarioDeporte`, PascalCase field name), not nested under `Informacion` as the story draft assumed — fixed in both the endpoint and this record; (2) all four directory pages use plain `<script setup>` (no `lang="ts"`), so the `fetchPage(cursor: number | null)` TypeScript annotation from the draft would have been a syntax error — implemented as plain `fetchPage(cursor)` in all four pages.
- Built `server/api/usuarios/index.get.ts`, `useInfiniteScroll.ts`/`InfiniteScrollList.vue` (first real usage of UX-DR13's shared primitive), and `UsuarioDirectoryCard.vue`.
- Per the user's explicit instruction (overriding the story's original "preserve marketing content" draft), deleted all hardcoded marketing filler — features/services/benefits grids, the fake "Featured Brands" (Nike/Adidas/etc.) list, `deportistas.vue`'s decorative sport tiles, and every CTA block — from all four directory pages, replacing that space with the real infinite-scroll directory. Hero sections and ContentEditor-driven Custom Content blocks were left untouched.
- **Post-review fix (user caught: cards looked flat compared to the deleted fake cards' visual richness):** redesigned `UsuarioDirectoryCard.vue` to match the deleted cards' "dynamism" while showing only real data — added a per-type gradient header band (color themed per directory: blue-green for Deportistas, orange-red for Marcas, green-teal for Nutricionistas — matching the original fake nutritionist cards exactly — purple-blue for Patrocinadores) with the avatar/initials overlapping it, a colored tagline (deporte for Deportista, especialidad for Nutricionista), and up to 3 icon+text detail lines per type pulled from real `informacion` fields already present in the endpoint's response (nivel/ciudad/edad for Deportista; sitio web/dirección/contacto for Marca; ciudad/años de experiencia/modalidad for Nutricionista; ciudad/país/sitio web for Patrocinador) — no endpoint change needed, `include: { informacion: {...} }` already returns every scalar field. `hover:scale-105 hover:shadow-xl` added to match the deleted cards' hover behavior.
- No automated tests written — same project-wide convention as every prior story. Verified manually instead: traced the endpoint's cursor-pagination math (`skip:1, cursor:{id}` correctly excludes the previous page's last row), confirmed `activo: true` sits directly on the `Usuario` where-clause (not routed through the still-unbuilt `activeUserFilter()`), and re-read all four edited pages in full to confirm no leftover references to deleted marketing refs (`sports`, `featuredBrands`, `nutritionists`, `specializations`) remained anywhere in their scripts.

### File List

- `server/api/usuarios/index.get.ts` (new)
- `app/composables/useInfiniteScroll.ts` (new)
- `app/components/InfiniteScrollList.vue` (new)
- `app/components/UsuarioDirectoryCard.vue` (new)
- `app/pages/deportistas.vue` (modified — marketing filler replaced with real directory)
- `app/pages/marcas.vue` (modified — same)
- `app/pages/nutricionistas.vue` (modified — same)
- `app/pages/patrocinadores.vue` (modified — same)

## Change Log

- 2026-07-26: Story implemented — all four directories now show real, cursor-paginated Usuario data instead of marketing placeholders, per explicit user instruction to delete the marketing content rather than preserve it alongside the new directory.
