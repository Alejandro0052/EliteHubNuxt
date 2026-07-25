---
name: Elite Hub
status: final
sources:
  - ../../../specs/spec-Elite_Hub/SPEC.md
  - ../../../specs/spec-Elite_Hub/glossary.md
  - ../../../specs/spec-Elite_Hub/functional-requirements.md
  - ../../architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md
  - ../../prds/prd-Elite_Hub-2026-07-19/prd.md
updated: '2026-07-24'
---

# Elite Hub — Experience Spine

> Brownfield MVP. Single-surface responsive web, Nuxt 4, no native app. Ratifies the existing IA shell (one layout, header/footer, four directory pages) and designs the net-new capabilities this MVP adds (feed, catálogo, reseñas, reportes, theme toggle) on top of it. Paired with `DESIGN.md` (Elite Hub visual identity). Directorio/Catálogo/Reportes design here is genuinely new IA work; Registration/Login/Settings ratify existing screens with behavioral upgrades only.

## Foundation

Single-surface responsive web, Nuxt 4 + Vue 3 + Tailwind CSS 4, no native mobile app (Constraints, SPEC.md). One layout (`app/layouts/default.vue`) wraps every authenticated and public page with the same header + footer. `DESIGN.md` is the visual identity reference; this spine covers behavior, structure, and states. Authorization is enforced server-side via shared guards (ARCHITECTURE-SPINE AD-1/AD-4); this spine's permission-dependent UI (edit/delete/retract buttons) is driven client-side by the shared `useResourcePermissions(resource, resourceType)` composable (AD-6), never by ad hoc `authStore.user?.isAdmin` checks — every Component Pattern below that shows conditional action buttons assumes this composable as its source of truth.

No anonymous visibility beyond home/terms/contact (Constraints): directories, profiles, catálogo, and feed all require an authenticated session — an unauthenticated visitor hitting any of these routes is redirected to `/login`, not shown a locked/teaser view.

## Information Architecture

| Surface | Reached from | Purpose |
|---|---|---|
| Home | App open / logo click | Forks by auth state: authenticated → Publicaciones feed (primary content); unauthenticated → existing marketing hero + live stats + feature tiles `[ASSUMPTION]` |
| Directorios (Deportistas / Marcas / Nutricionistas / Patrocinadores) | Header nav (existing 4 slots, unchanged) | Segmented infinite-scroll directory → click-through detail, one per TipoUsuario (CAP-6) |
| Eventos / Noticias | Header nav — **promoted from CTA-only to primary nav** `[ASSUMPTION]` | Listing + detail; creation now open to any authenticated user (CAP-5), not admin-only |
| Catálogo | CTA ("ver catálogo completo sin filtros") from the Marcas directory — **not** a top-nav item `[ASSUMPTION]` | Aggregate cross-brand product/service catalog, browsable by category (CAP-8) |
| Perfil propio | UserDropdown → Perfil | View/edit own profile fields + photo; admin can reach any profile via the same route as a recovery override (FR-18) |
| Settings | UserDropdown → Ajustes | Theme toggle (CAP-12, new) alongside existing terms/privacity/aboutUs edit entry points |
| Reportes/Indicadores | UserDropdown, admin-only, alongside "Gestión de usuarios" — **not** in public nav `[ASSUMPTION]` | Admin chart + numeric counts of Usuarios by TipoUsuario (CAP-11) |
| Gestión de usuarios / Mensajes de Contacto inbox | UserDropdown, admin-only | Existing admin surfaces; Mensajes de Contacto inbox is new (FR-41) |
| Login / Register | Header "Iniciar sesión" (unauthenticated only) | Type-segmented registration (CAP-1), login |

Header carries 7 nav links post-promotion (Inicio, Eventos, Noticias, Patrocinadores, Deportistas, Marcas, Nutricionistas) — same hamburger-below-`md` / horizontal-list-at-`md`+ mechanism as today, unchanged mechanically, just more items. Footer is unchanged (legal/informational links). Modal stacks one level deep everywhere (ContentEditor, catalog-item create, publicación composer) — never a modal opened on top of another modal.

→ Composition reference: 4 key-screen mocks in `mockups/` — [Home/Feed (authenticated, light)](mockups/key-home-feed.html), [Directorio + Detalle: Deportistas (light)](mockups/key-directorio-deportistas.html), [Registro segmentado por tipo (brand chrome)](mockups/key-registro-tipo.html), [Reportes/Indicadores (dark)](mockups/key-reportes-indicadores.html). Every other IA surface (Catálogo, Reseñas, Settings/theme, Login, admin tables) is spine-only by user confirmation — build directly from the Component/State Patterns tables below — no visual reference exists or is needed. Spine wins on conflict with any mockup.

## Voice and Tone

Microcopy. Brand aesthetic posture lives in `DESIGN.md`.

| Do | Don't |
|---|---|
| "Registro guardado con éxito" (FR-42, exact confirmed copy) | "¡Éxito! 🎉 Tu mensaje fue enviado" |
| "No hay publicaciones todavía. Sé el primero en compartir algo." | "¡Ups! No hay nada aquí todavía 😅" |
| "Esta acción no se puede deshacer." (destructive confirm) | Silent delete with no confirmation |
| Direct, complete sentences in Spanish, matching existing form/label tone | Mixed English/Spanish UI strings, emoji-heavy state messages |
| Errors name what's wrong and what to do: "El correo ya está registrado. Inicia sesión o usa otro correo." | Generic "Error al procesar la solicitud" |

## Component Patterns

Behavioral. Visual specs live in `DESIGN.md.components`.

| Component | Use | Behavioral rules |
|---|---|---|
| Directory card | Deportistas/Marcas/Nutricionistas/Patrocinadores listing | Photo + type-relevant summary fields (FR-16). Click anywhere on card → detail view (hover treatment per Interaction Primitives). See [mockup](mockups/key-directorio-deportistas.html). |
| Detail view | Any directory card click-through | Full field set (FR-17, incl. health-adjacent/PII fields — no field-level privacy in MVP, per Constraints). Back-navigation behavior per Interaction Primitives. See [mockup](mockups/key-directorio-deportistas.html). |
| Profile photo upload | Perfil (FR-6) | Single-image picker in the UI — the storage layer always returns `Promise<string[]>` (ARCHITECTURE-SPINE AD-2), but this component only ever displays/sends the array's first element; a new upload replaces it wholesale, never appends. The array contract is a storage-layer uniformity detail, not a multi-photo feature — do not expose a gallery/carousel here. |
| Publicación card (feed) | Home feed (authenticated) | Author name/photo, text, optional single image, timestamp. Edit/delete controls driven by `useResourcePermissions('publicacion', ...)` — author sees edit+delete, admin sees delete-only (never edit, per AD-1's matrix), other viewers see neither. See [mockup](mockups/key-home-feed.html). |
| Event/News card | Eventos/Noticias listing | Existing `EventCard`/`NewsCard` idiom (`{design.components.card}`), unchanged visually. Author + admin get edit/delete (uniform matrix per AD-1). |
| Catalog item card | Marca's own profile section + aggregate Catálogo view | `nombre`, `tipo` (servicio/físico) badge, image(s), contact-only — no price/cart affordance anywhere (FR-23). The creating Marca + admin get edit/delete. |
| Reseña row | Nutricionista detail view | Rating + comment + reviewer name. No self-edit ever (AD-1 matrix: author edit = no). Admin sees a "Retractar" action, distinct from delete — retracting removes it from the profile but is logged as moderation, not a generic delete. |
| Infinite-scroll list | Every directory, feed, catálogo aggregate view | Cursor-based, 20 records/batch (NFR-10/ARCHITECTURE-SPINE convention) — never numbered pagination. Loading sentinel at list end triggers next batch on intersection. |
| UserDropdown | Header, authenticated | Perfil / Ajustes / Cerrar sesión; admin additionally sees "Gestión de usuarios," "Mensajes de contacto," and "Reportes/Indicadores." |
| Theme toggle | Settings | Two-state switch (claro/oscuro); apply behavior per Interaction Primitives. |
| ContentEditor modal | Settings (terms/privacity/aboutUs edit entry points), admin | Opens with its own stacking context above the overlay (FR-7 fix) — this was a real bug, now a hard behavioral requirement, not just a visual note. |
| Admin table (Gestión de usuarios, Mensajes de Contacto inbox) | Admin surfaces (UserDropdown) | Row-based list, not card-grid — `{design.spacing.page-shell}` shell, `border-hairline` row dividers, no per-row shadow. Same `rounded-DEFAULT` inputs/buttons as elsewhere; retires the admin-specific `rounded-lg shadow-md` card variant DESIGN.md already deprecates. In scope for FR-33's visual refresh and FR-34's responsiveness gate like any other touched surface. |
| Deactivate/reactivate control | Admin table row (Gestión de usuarios), Reseña "Retractar" flow (FR-36) | A labeled toggle-style action ("Desactivar cuenta" / "Reactivar cuenta") on the target Usuario's admin row — distinct from the generic `button-destructive` used for content deletion, since this acts on an account, not a piece of content. Always paired with the standard destructive-confirm step. Reflects `activeUserFilter(..., { bypassForAdmin: true })` — admin sees deactivated Usuarios in this table (unlike every public-facing list, where they're simply absent). |
| Publicación composer | Home feed (authenticated) | Text + optional single image, inline at top of feed (not a separate modal) — lowest-friction posting per UJ-4's "daily habit" framing `[ASSUMPTION]`. |
| Sport/category filter chips | Deportistas directory (FR-19), Catálogo (FR-39) | Looks multi-select but is single-select in MVP (fixed lists, one active filter at a time); "no filter" state shows the unfiltered full list. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Cold load | Directory / feed / catálogo | Skeleton cards (4-8, grid-matched) while first cursor batch loads. |
| Empty directory/filter result | Any directory with an active filter | "No hay {tipo} con este filtro todavía." + a visible "Quitar filtro" action. |
| Empty feed | Home (authenticated, first-ever load) | "No hay publicaciones todavía. Sé el primero en compartir algo." above the composer, not blocking it. |
| Infinite-scroll end | Any infinite list | Quiet end-of-list marker ("Eso es todo por ahora.") — no spinner left hanging. |
| Permission denied (author-only action) | Publicación/Evento/Catálogo item not owned by viewer | Edit/delete controls simply absent (per `useResourcePermissions`) — never a visible-but-disabled button, never a "not authorized" error the user has to trigger first. |
| Deactivated-account content | Directories/feed/catálogo/eventos-noticias listings | Hidden entirely (FR-40) — no "this user was deactivated" placeholder card; the content and card simply do not render. Reactivation restores it without user action. |
| Duplicate review attempt | Nutricionista detail, submitting a second reseña | Review form/button replaced with "Ya dejaste una reseña para {nombre}." — client-side pre-check reflecting FR-37, server remains the enforcement point. |
| Contact form submit success | contactUs.vue (unauthenticated) | "Registro guardado con éxito" (FR-42, exact copy) replaces the form, no timeout/alert. |
| Registration mid-abandon | Registration, any type | No partial account created (SPEC.md Assumptions) — leaving the flow silently discards all entered fields; returning starts fresh. |
| Type-gated action unavailable | Catálogo create entry point, non-Marca viewer | Entry point absent from that Usuario's own profile — not shown-then-blocked (FR-20; type immutability means this is permanent, not "not yet"). |
| Upload in progress | Photo/catalog-image/publicación-image upload | Inline "Subiendo…" state on the affected field only; rest of the form stays interactive. Reflects the insert-then-upload-then-patch server ordering (ARCHITECTURE-SPINE convention) — UI shows the record as saved-with-placeholder briefly, then the image resolves in place. |
| Theme persistence | Any page, on return visit | Applied from `localStorage` before first paint where feasible (avoids a flash of the wrong theme); no server round-trip, no cross-device sync (FR-31 convention). |
| Admin moderation action | Reseña retract, Publicación/Evento/Noticia/Catálogo-item admin delete | Confirm step ("Esta acción no se puede deshacer.") before firing; item disappears from the list immediately on success, no separate refresh needed. |
| Forced logout on deactivation | Any authenticated route, mid-session | Per AD-4's per-request DB recheck, a Usuario deactivated while logged in is rejected on their very next request (not just next login) — the UI treats this exactly like an expired session: redirect to `/login` with "Tu sesión ya no es válida. Inicia sesión de nuevo." No separate "you were blocked" messaging — the app does not editorialize the admin moderation action for the affected user. |

## Interaction Primitives

- **Click/tap to act.** Directory and content cards: click anywhere on the card opens the detail view (existing `NuxtLink`-wrapping-card pattern, retained).
- **Scroll position preserved on back-navigation** from a detail view to its originating directory list (FR-17 assumption, confirmed in SPEC.md Assumptions) — re-entering a list via back-nav does not reset to top.
- **Hover card lift** (`hover:scale-105`, `DESIGN.md.components.card`) is the one hover affordance on every content card; no secondary hover-reveal actions (no hover-only edit/delete icons) — action buttons are always visible when permitted, per the accessibility floor below.
- **Sport/category filter chips** are tap/click single-select; selecting a new chip replaces the active filter and immediately refetches the first cursor batch (not client-side re-filtering of already-loaded data).
- **Theme toggle** is a single tap, applies instantly, no confirm, no reload.
- **Destructive actions require a confirm step** (delete own or another's content, retract reseña, deactivate account) — a lightweight inline confirm ("Esta acción no se puede deshacer." + Cancelar/Confirmar), not a full modal, to keep the flow fast on an MVP timeline.
- **Mobile nav**: closes on route change (existing pattern, unchanged) — breakpoint mechanics in Responsive & Platform.
- **Banned:** numbered pagination on any list that has infinite scroll available; hover-only affordances for actions available on touch (`md`-below breakpoints get always-visible action buttons, not hover-reveal); auto-playing carousels.

## Accessibility Floor

Behavioral. Visual contrast lives in `DESIGN.md` (both light and dark token sets are authored to hold WCAG AA against their respective canvas — see DESIGN.md Colors).

- WCAG 2.2 AA across the responsive web surface, in both light and dark theme.
- Every interactive card/button has an accessible name (not just an icon) — icon-only controls (Iconify `fa6-solid`/`solar`) carry `aria-label` in Spanish matching the visible-text equivalent used elsewhere.
- Infinite-scroll loading and end-of-list states are announced via `aria-live="polite"` on the sentinel region — screen-reader users get "Cargando más resultados" / "Eso es todo por ahora," not silence.
- Focus rings use `{design.colors.focus-ring}` at AA contrast against both `{design.colors.surface}` and `{design.colors.surface-dark}`.
- `Tab` order matches visual/reading order on every surface, including the card grid (row-major) and the UserDropdown (Perfil → Ajustes → admin items → Cerrar sesión).
- Forms (registration, profile edit, publicación composer, contact form) label every field explicitly (`<label for>`, not placeholder-as-label); required vs. optional fields are marked in text, not color alone (Deportista/Nutricionista/Patrocinador/Marca forms mix required and "(opcional)" fields per FR-2).
- Theme toggle state is announced on change ("Tema oscuro activado").
- Tap targets ≥ 44px on all interactive elements at `sm`/`md` breakpoints, matching existing header/footer link sizing.
- Reduce-motion: `hover:scale-105` and the icon-badge invert transition both respect `prefers-reduced-motion` — reduced to an opacity/no-transform state change when set.

## Responsive & Platform

Ratifying the existing baseline (`sm`/`md`/`lg`/`xl` stock Tailwind breakpoints, `md` as the nav-collapse point) as the required strategy for every new surface — no new breakpoint convention is introduced for the feed, catálogo, reportes, or any directory upgrade.

| Breakpoint | Behavior |
|---|---|
| `< md` (mobile, default) | Hamburger nav → full-width dropdown panel. Card grids: 1 column. Directory filter chips wrap/scroll horizontally. Feed composer stacks above the feed, full-width. Reportes/Indicadores: chart above numeric counts, stacked. Admin tables: card-per-row (labeled key/value stack), not a horizontal table — no horizontal scroll. |
| `md` (768px+) | Horizontal nav bar replaces hamburger (existing collapse point, unchanged). Card grids: 2 columns. Filter chips sit in a single row. Admin tables switch to true tabular rows. |
| `lg` (1024px+) | Card grids: 3 columns. Reportes/Indicadores: chart and numeric counts sit side-by-side. |
| `xl` (1280px+) | Card grids: 4 columns (directories, catálogo, feed on wide viewports). Page content respects `{design.spacing.page-shell}` (`max-w-[120rem]`) and centers with auto margins beyond it. |

FR-34 treats responsiveness preservation as a hard release gate on every touched surface — any visual-refresh change (CAP-13) or new-capability surface (feed, catálogo, reportes, reseñas) must be verified at all four breakpoints before it's considered done, not just at design time. Elite Hub is responsive web only; no platform-specific (iOS/Android) conventions apply.

## Key Flows

Protagonist names and scenarios mirror PRD `prd-Elite_Hub-2026-07-19` §2.3 UJ-1..UJ-6 verbatim; screens/states/transitions below are this spine's addition.

### Flow 1 — Camila registers as a deportista and is found by a sponsor the same week (UJ-1)

→ Mockups: [Registro segmentado por tipo](mockups/key-registro-tipo.html) (step 1), [Directorio + Detalle: Deportistas](mockups/key-directorio-deportistas.html) (steps 5-6)

1. Camila, unauthenticated, lands on `/register`. Selects "Deportista" — the form immediately reveals sport-specific fields (deporte, nivel, años de experiencia, objetivos actuales, etc.) below the type selector, no page transition (FR-1).
2. She fills required fields, leaves "lesiones" and "marcas personales" blank (optional), checks the T&C box (hyperlinked to the live `terms` Content page), submits.
3. **State check:** if she closes the tab mid-form, nothing persists — reopening `/register` starts blank (no partial account, SPEC.md Assumptions).
4. She logs in, is dropped on Home (feed, since she's now authenticated). She navigates to Perfil (UserDropdown) and uploads a profile photo — the only field deferred from the registration form (FR-6).
5. Days later, a patrocinador opens the Deportistas directory, taps the "ciclismo" filter chip — list refetches to that sport only, infinite-scrolls, finds Camila's card, taps it.
6. **Climax:** Detail view opens with her full profile (contact info visible, no field-level privacy gate in MVP). The patrocinador reaches out via her listed contact info, outside the app.
7. **Resolution:** Nowhere in Perfil or any admin surface is there a control that could change Camila's TipoUsuario — it is not present, not just disabled (FR-3/AD-8).

### Flow 2 — A local supplement brand lists its first product without a sales team (UJ-2)

1. Owner registers, selects "Marca" — marca-specific fields appear (nombre de la empresa, NIT, descripción, etc.).
2. After logging in, they go to Perfil, find a "Mi catálogo" section (visible only because `useResourcePermissions`/type-gating sees TipoUsuario = Marca) and tap "Agregar ítem."
3. Composer: nombre, tipo (servicio | físico radio), image upload — insert-then-upload-then-patch under the hood, UI shows "Subiendo…" inline on the image field only.
4. **Climax:** Item appears immediately in their own profile's catalog section, and in the aggregate Catálogo view (reached via a "ver catálogo completo sin filtros" CTA from the Marcas directory), browsable by category chip. No price, no "add to cart" — a contact-only card.
5. **Resolution:** Interested deportistas see the item and contact the brand directly through profile contact info.
6. **Edge case:** a deportista viewing their own Perfil never sees an "Agregar ítem" entry point at all — type immutability (FR-3) makes this permanently absent, not a future unlock.

### Flow 3 — A nutritionist's reputation builds through reviews (UJ-3)

1. An authenticated deportista, already on a nutricionista's detail view, scrolls to the Reseñas section below her especialidad/bio.
2. Taps "Dejar una reseña" — inline rating (stars) + comment field expands in place, no modal.
3. Submits. **State check:** if this deportista already reviewed this nutricionista, the button is replaced with "Ya dejaste una reseña para {nombre}" before they even try (FR-37 client reflection of the server-enforced one-per-pair limit).
4. **Climax:** Review appears at the top of her Reseñas list immediately (own review surfaces first, then existing reviews), visible to anyone browsing her profile — including from the Nutricionistas directory.
5. **Resolution:** Future visitors see a growing review list next to her especialidad. No edit path exists yet for her own posted review — the reviewer cannot fix a typo (Open Question, carried forward as a known gap, not solved here).
6. **Edge case — moderation:** if a review is fake/bad-faith, only admin can act: a "Retractar" control (distinct from delete, admin-only) removes it from the profile and can also deactivate the reviewing account — both actions logged as moderation, confirmed via the standard destructive-confirm pattern.

### Flow 4 — Daily use is anchored by the home feed (UJ-4)

→ Mockup: [Home/Feed (authenticated)](mockups/key-home-feed.html)

1. A patrocinador opens the app on a weekday morning. Home resolves to the Publicaciones feed (authenticated landing, `[ASSUMPTION]`) — most-recent-first (FR-27), skeleton cards while the first cursor batch loads.
2. They scroll — publicaciones from deportistas, marcas, nutricionistas, other patrocinadores, mixed text/photo, infinite-scrolling in 20-record batches.
3. They use the inline composer at the top of the feed: text + optional single image, tap "Publicar."
4. **Climax:** Their post appears at the top of the feed immediately (optimistic insert, no manual refresh) — visible to the whole community on their next load.
5. **Resolution:** They can later edit or delete their own post (`useResourcePermissions` shows both for the author); if it's later flagged inappropriate, admin sees delete-only (never edit, per AD-1's matrix) and can remove it regardless of authorship, with the standard destructive-confirm step.
6. **Edge case:** if the author's account is later deactivated, the post disappears from the feed while `activo = false` (FR-40) — no "content from a suspended user" placeholder, it's simply absent, and reactivation restores it without the author recreating it.

### Flow 5 — Locked out, Camila gets back in via the admin stopgap (UJ-5)

1. Camila forgets her password; `/login` has no self-service recovery link in MVP (a deliberate non-goal, not an oversight — the UI does not imply one exists).
2. She contacts the admin outside the app.
3. Admin logs in, navigates to Camila's profile via the Deportistas directory (or a future admin user-search — not specified further in this pass), and uses the admin profile-edit override (available because `activeUserFilter(..., { bypassForAdmin: true })` lets admin reach even a deactivated account) to reset her credentials.
4. **Climax:** Admin's edit view for another Usuario's profile looks identical in structure to a self-edit view but is visibly framed (e.g. a header note: "Editando el perfil de {nombre} como administrador") so admin never mistakes it for their own profile.
5. **Resolution:** Camila logs in with the reset credentials — no formal recovery flow exists beyond this manual stopgap, by design, until post-MVP email recovery ships.

### Flow 6 — The admin checks community composition before a stakeholder update (UJ-6)

→ Mockup: [Reportes/Indicadores (dark theme)](mockups/key-reportes-indicadores.html)

1. Admin, authenticated, opens UserDropdown → "Reportes/Indicadores."
2. View loads: donut/bar chart (vue-chartjs, per ARCHITECTURE-SPINE AD-3) breaking down registered Usuarios by TipoUsuario, with numeric counts displayed alongside — not chart-only (FR-30). At `< lg`, chart stacks above the counts; at `lg`+, side-by-side.
3. This view is held to a materially higher visual-polish bar than the rest of admin ("muy agradable de ver," FR-29 note) — it's the one admin surface where `DESIGN.md`'s card/shadow/color system gets fuller expression (e.g. a genuinely styled chart legend, not a bare default Chart.js render).
4. **Climax:** A single screen tells the whole composition story — no manual DB querying needed, chart and counts visible together.
5. **Resolution:** The same aggregate source powers the homepage's public stat counters (FR-12/FR-29 share one query per SM-4) — the admin can cross-check by opening Home in another tab and seeing matching numbers, reinforcing trust in both surfaces.
