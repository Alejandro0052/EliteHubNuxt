---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/specs/spec-Elite_Hub/SPEC.md
  - _bmad-output/specs/spec-Elite_Hub/functional-requirements.md
  - _bmad-output/specs/spec-Elite_Hub/glossary.md
  - _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/EXPERIENCE.md
---

# Elite Hub - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Elite Hub, decomposing the requirements from `SPEC.md` (spec kernel, itself derived from the PRD) and the `ARCHITECTURE-SPINE.md` into implementable stories. No UX design contract exists for this project (no `bmad-ux` run) — UX-level requirements are carried inline via the PRD's/spec's own field-level and interaction detail instead.

## Requirements Inventory

### Functional Requirements

FR-1: A prospective Usuario selects exactly one TipoUsuario at registration; selecting a type immediately reveals that type's fields, before submission.
FR-2: Registration captures type-specific fields per TipoUsuario (Deportista/Marca/Nutricionista/Patrocinador), each with its own required/optional field set, plus correo + contraseña for all types (exact field lists in `functional-requirements.md` CAP-1).
FR-3: TipoUsuario is immutable after registration — no self-service or admin write path may change it once set.
FR-4: All types must accept Terms & Conditions (checkbox + hyperlink to live `terms` content) before account creation.
FR-5: All types set a password at registration, used for subsequent login.
FR-6: Profile photo is not collected at registration; uploaded/updated only post-login, from the profile-edit surface.
FR-7: Fix the ContentEditor modal stacking bug (overlay/panel CSS positioning) so the edit panel is usable, not obscured by its own overlay.
FR-8: Wire ContentEditor onto `privacity.vue` and `aboutUs.vue` (admin-editable), matching the existing `terms` pattern.
FR-9: Remove ContentEditor from `contactUs.vue`, `deportistas.vue`, `marcas.vue`, `nutricionistas.vue`, `patrocinadores.vue`.
FR-10: Persist anonymous contact-form submissions — including the selected `Asunto` and all other form fields — as Mensaje de Contacto records.
FR-11: (Stretch, non-goal unless time allows) Email notification to admin on a new Mensaje de Contacto.
FR-12: Homepage stat counters show live, DB-computed counts of Usuarios by TipoUsuario plus Eventos count, excluding deactivated Usuarios, sharing the same aggregate source as FR-29 so the two never visibly diverge.
FR-13: Any authenticated Usuario (not only admins) can create a Noticia or Evento.
FR-14: The authoring Usuario can edit/delete their own Noticia/Evento; admin can edit/delete any, regardless of authorship.
FR-15: Four segmented directories exist — one per TipoUsuario (Deportistas, Marcas, Nutricionistas, Patrocinadores).
FR-16: Directories load via infinite scroll (not pagination); cards show each type's most relevant summary fields plus profile photo.
FR-17: Clicking a directory card opens a detail view with the full field set; back-navigation returns to the listing. `[ASSUMPTION: scroll position preserved on back-navigation]`
FR-18: A Usuario views/edits only their own profile; admin can edit any profile as an account-recovery stopgap. Profile photo upload/update lives here.
FR-19: Deportistas directory filters on a fixed sport list (fútbol, baloncesto, ciclismo, running, crossfit, voleibol, gimnasia, boxeo, natación, otros); no filter shows all.
FR-20: Only Usuarios with TipoUsuario = Marca can create Ítems de Catálogo, only for their own Marca profile — gate ties to a future per-listing monetization plan.
FR-21: An Ítem de Catálogo has: nombre, tipo de item (servicio | físico), one or more images.
FR-22: Each Marca's profile shows its own catalog section; a separate aggregate Catálogo view lists items across all marcas, browsable by category.
FR-23: No checkout, cart, or payment flow exists for any catalog item in MVP — contact-only listings.
FR-24: Any authenticated Usuario can leave a rating + comment (Reseña) on a Nutricionista's profile — no technical gating verifies actual service use; fake reviews are handled after the fact via admin moderation (FR-36).
FR-25: Nutricionista profiles include an `especialidad` field.
FR-26: Any authenticated Usuario can create a Publicación (text + optional single image).
FR-27: Publicaciones from all Usuarios appear on the home feed, most-recent-first. `[ASSUMPTION: ordering not explicitly specified]`
FR-28: The authoring Usuario can edit/delete their own Publicación; admin can delete (not edit) any, regardless of authorship.
FR-29: Reportes/Indicadores displays a chart (donut or bar) breaking down registered Usuarios by TipoUsuario; totals match FR-12's homepage counts (same aggregate).
FR-30: The underlying numeric counts per TipoUsuario are also displayed, not chart-only.
FR-31: A Usuario can switch the app's theme between light and dark from Settings; the choice persists across sessions (via `localStorage`).
FR-32: Settings continues to host the terms/privacity/aboutUs edit entry points (FR-8) alongside the new theme toggle.
FR-33: Visual refresh across: Deportistas/Marcas/Nutricionistas/Patrocinadores directory and detail views; Eventos/Noticias listing; admin panel; login/register (incl. removing the placeholder `Jugador.jpeg`); sitewide hover micro-interaction on cards. A design refresh of existing patterns, not a rebrand.
FR-34: All visual changes preserve the app's current responsive behavior across breakpoints — a hard constraint / release gate on every touched surface.
FR-35: Migrate uploaded file storage (profile photos, catalog item images, publicación images, content images) off local disk onto persistent, non-local storage — sequenced last, immediately before deploy-readiness.
FR-36: Admin can retract any Reseña and deactivate (block) the Usuario who posted it; a blocked Usuario cannot log in or perform authenticated actions.
FR-37: A Usuario can create at most one Reseña per Nutricionista; a second attempt is rejected.
FR-38: Género and país (across all four registration forms) are selected from a fixed list, same pattern as `deporte` — not free text.
FR-39: Catálogo item categories are selected from a fixed enum for MVP (not admin-manageable/dynamic).
FR-40: While a Usuario's account is deactivated (`activo = false`), their Publicaciones, Ítems de Catálogo, Eventos/Noticias, directory listing, and profile are hidden (not deleted) from public-facing views; reactivating restores visibility. Reseñas are explicitly excluded from this cascade (confirmed, deliberate).
FR-41: Admin has a dedicated inbox view listing all Mensaje de Contacto records, most-recent-first.
FR-42: On successful contact-form submission, the form displays "Registro Guardado con Éxito."
FR-43: The creating Usuario can edit/delete their own Ítem de Catálogo; admin can edit/delete any, regardless of authorship.

### NonFunctional Requirements

NFR-1: Web-only, responsive Nuxt 4 — no native mobile app; every new/modified surface must preserve current responsive behavior across breakpoints (release gate, ties to FR-34).
NFR-2: No anonymous/public visibility — directories, profiles, catálogo, and the home feed all require an authenticated account; only home/terms/contact stay public.
NFR-3: Author-vs-admin authorization must be enforced server-side (not just UI-hidden), following a per-resource action→role model — e.g. admin can delete but not edit another Usuario's Publicación; admin can retract but not edit/delete a Reseña.
NFR-4: Session freshness — `Usuario.activo` and `Usuario.isAdmin` are rechecked from the database once per request (via a shared `requireSession()` primitive); JWT claims alone are never trusted for these two fields.
NFR-5: Deactivated-user content is hidden via one shared active-user filter applied consistently across directories, home feed, catálogo, and eventos/noticias listings; Reseñas are explicitly excluded from this cascade.
NFR-6: Homepage stats and Reportes/Indicadores aggregate counts must never visibly diverge (single shared aggregate source) and must exclude deactivated Usuarios.
NFR-7: Full profile field set, including health-adjacent fields (lesiones, peso, altura) and PII (fecha de nacimiento), is visible to any authenticated viewer on detail views; no field-level privacy control exists in MVP — a deliberate scope cut.
NFR-8: Cost guardrail — no paid infrastructure assumed; free/open-source-tier choices only (realized as Cloudflare R2 for storage, vue-chartjs + chart.js for charting).
NFR-9: The existing session-based auth stack (`next-auth` + `@sidebase/nuxt-auth` + `@next-auth/prisma-adapter`) is retained as-is, not audited/consolidated; `next-auth` must stay below `4.23.0` for `@sidebase/nuxt-auth` compatibility.
NFR-10: Directory infinite-scroll must stay responsive as Usuario count grows — cursor-based pagination, 20 records per batch, one fixed default across all listings.
NFR-11: File uploads must not silently fail or corrupt existing records — insert the DB row first with a null/placeholder image field, then upload, then patch with the resulting URL(s) (cheapest failure mode to detect; the deeper transactional-write gap is explicitly deferred to post-MVP maintenance).
NFR-12: Fixed-value lists (deporte, género, país, catálogo categories) are defined once in a single shared source, never hardcoded per-component.

### Additional Requirements

- **No starter template** — Elite Hub is a brownfield project (existing, working Nuxt 4 app). Epic 1 / Story 1 must NOT include starter-template scaffolding; it should instead address the foundational bug fixes and shared-utility groundwork below, since later epics depend on them.
- **Paradigm (ARCHITECTURE-SPINE AD-1):** Transaction Script — thin `server/api/**` route handlers calling Prisma directly, no service/repository/controller layer. Every new cross-cutting rule (author-or-admin, active-user filter, review-limit, type-gating) must be implemented exactly once as a shared guard function in `server/utils/`, never reimplemented inline per handler.
- **New shared server utilities required (name these files exactly, per the spine):**
  - `server/utils/requireSession.ts` — `activo`/`isAdmin` DB recheck, once per request, every authenticated route (AD-4).
  - `server/utils/guards/` — `authorOrAdmin(resource, action, session)` (action-scoped: `'edit' | 'delete'`, per-resource role matrix in ARCHITECTURE-SPINE AD-1), `activeUserFilter(relation, { bypassForAdmin })`, `requireType`, `reviewLimit` (AD-1, AD-5).
  - `server/utils/storage.ts` — Cloudflare R2 client wrapper, replaces `useStorage('public')`; upload function always returns `Promise<string[]>` (AD-2).
  - `server/utils/aggregates.ts` — shared count queries backing both FR-12 and FR-29/30 (excludes deactivated Usuarios).
- **New frontend guards (ARCHITECTURE-SPINE AD-6):** `app/middleware/admin.ts` (route middleware, admin-only pages, auto-redirect); `app/composables/useResourcePermissions.ts` returning `{ canEdit, canDelete, canRetract }` per resource type — replaces ad hoc `authStore.user?.isAdmin` checks currently copy-pasted across ~10 pages.
- **Existing bugs to close as part of this work (not separately reported, confirmed via code read):**
  - `server/api/content/[page].get.ts` and `.put.ts` instantiate their own `PrismaClient` instead of the shared `server/utils/prisma.ts` singleton — fix to use the singleton.
  - `server/api/profile/index.put.ts` currently allows changing `tipoUsuarioId` via profile edit — must be fixed to enforce FR-3/AD-8 immutability (strip `tipoUsuarioId`/`informacion.tipoUsuarioId` from the write payload).
  - `createError` usage is inconsistent (`statusMessage` vs. `message`) — standardize on `message`.
  - A stray `package-lock.json` exists alongside the canonical `pnpm-lock.yaml` — remove it; pnpm is the sole package manager.
  - Upload filenames must follow `{resource}-{id}-{timestamp}{ext}` with a shared extension allowlist (no silent-overwrite keys, e.g. `profile/index.put.ts`'s current non-timestamped avatar key).
- **New Prisma models needed:** `Publicacion`, `Resena`, `ItemCatalogo`, `MensajeContacto` — Spanish PascalCase naming; canonical relation name `autor` for the authoring Usuario on every new model that has one (`Resena` is the exception, with two named relations: `autor` and `nutricionista`). Full attribute-level schema is implementation detail, not fixed upstream.
- **E2E testing (ARCHITECTURE-SPINE AD-7, PRD §9.3):** integrate the existing but currently-unwired Playwright project into the root pnpm workspace (`webServer` + `baseURL` in `playwright.config.ts`), retire the Python/pytest suite (files + venv) entirely. This is an ongoing parallel track through the whole MVP window, not a one-time migration task — new specs should accompany new features as they land.
- **Deferred items relevant to planning risk (not to be built, but worth epic-level awareness):** hosting/deployment platform is not yet decided; there is no guard against deactivating the last remaining admin account; there is no defined admin account creation/promotion path. Whoever implements FR-36 (admin block) should be aware of the last-admin-lockout risk even though closing it is out of scope for this MVP.

### UX Design Requirements

Extracted from `DESIGN.md` + `EXPERIENCE.md` (`ux-Elite_Hub-2026-07-23`), a brownfield UX contract pair that ratifies the existing "brand chrome" visual language and designs the net-new IA/interaction surfaces this MVP adds.

UX-DR1: Implement DESIGN.md's full token set (colors incl. light+dark variants, typography roles, rounded/spacing scale) as real Tailwind v4 `@theme` CSS variables — today no `@theme` block exists; every value is a hardcoded utility class with no shared source.
UX-DR2: Consolidate card styling sitewide to `rounded-xl shadow-lg overflow-hidden` + `hover:scale-105` — retire `stats.vue`'s `rounded-2xl` no-shadow variant and the admin panel's `rounded-lg shadow-md` variant.
UX-DR3: Consolidate buttons to 3 canonical roles (primary/secondary/destructive per DESIGN.md Components) — retire the green-400/500 "Crear" variant and the blue-400/500/600 admin-misc variants.
UX-DR4: Unify page-shell width to `max-w-[120rem]` sitewide, replacing admin's narrower `max-w-7xl`/`max-w-5xl`.
UX-DR5: Retire the pastel per-category gradient backgrounds (`from-blue-50 to-green-50` etc.) on deportistas/marcas/nutricionistas/patrocinadores/eventos/noticias/admin pages, replacing with brand-chrome-consistent surface tokens.
UX-DR6: Implement dark mode: explicit toggle in Settings (FR-31), `data-theme`/class-based switch (not OS-media-query-only), full dark token set applied, persisted via `localStorage` only, applied before first paint to avoid a flash of the wrong theme.
UX-DR7: Fix the dead `hover:bg-secondary` class in `header.vue` (no such Tailwind token exists today) — wire it to the new real `secondary` token (slate-800).
UX-DR8: Remove the `Jugador.jpeg` stock image from `login.vue`/`register.vue` hero panels; replace with a brand-chrome-consistent pattern/treatment (no new stock photography).
UX-DR9: Promote Eventos and Noticias into the primary header nav (7 links total: Inicio, Eventos, Noticias, Patrocinadores, Deportistas, Marcas, Nutricionistas) — same hamburger-below-`md`/horizontal-at-`md`+ mechanism, unchanged mechanically.
UX-DR10: Home forks by authentication state — authenticated Usuarios see the Publicaciones feed as primary content; unauthenticated visitors keep the existing marketing hero + live stats + feature tiles.
UX-DR11: Build a shared `useResourcePermissions(resource, resourceType)` composable driving every edit/delete/retract control (Eventos/Noticias, Publicaciones, Reseñas, Ítems de Catálogo) per the action→role matrix in ARCHITECTURE-SPINE AD-1 — no bespoke per-page permission checks for these capabilities.
UX-DR12: Build `app/middleware/admin.ts` route guard for admin-only pages (Gestión de usuarios, Mensajes de Contacto inbox, Reportes/Indicadores) with auto-redirect — not conditional rendering after the page has already loaded.
UX-DR13: Build one reusable infinite-scroll list component (cursor-based, 20 records/batch) shared across all 4 directories, the home feed, and the aggregate Catálogo view — including skeleton cold-load state, per-surface empty-state copy, and a quiet end-of-list marker (no dangling spinner).
UX-DR14: Build one reusable sport/category filter-chip component (single-select from a fixed list) shared by the Deportistas sport filter (FR-19) and the Catálogo category filter (FR-39).
UX-DR15: Build an admin table component (row-based, not card-grid) for Gestión de usuarios and the Mensajes de Contacto inbox, including a deactivate/reactivate account control that is visually and semantically distinct from generic content-destructive actions.
UX-DR16: Implement the Accessibility Floor: WCAG 2.2 AA in both themes; `aria-label` on every icon-only control; `aria-live="polite"` announcements for infinite-scroll loading/end states; a shared focus-ring token at AA contrast in both themes; reading-order-matched tab order (incl. row-major card grids and the UserDropdown); explicit required/optional field labeling (never color-only); `prefers-reduced-motion` handling for the card-lift and icon-badge-invert transitions; ≥44px tap targets.
UX-DR17: Implement the Responsive & Platform breakpoint table exactly: card grids 1/2/3/4 columns at `<md`/`md`/`lg`/`xl`; admin tables stack as labeled cards below `md` and become true tabular rows at `md`+; Reportes/Indicadores stacks chart-above-counts below `lg` and goes side-by-side at `lg`+.
UX-DR18: Implement forced-logout handling: a Usuario deactivated mid-session is rejected on their next request (per ARCHITECTURE-SPINE AD-4) and redirected to `/login` with a session-expired message ("Tu sesión ya no es válida. Inicia sesión de nuevo.") — never a "you were blocked" message.
UX-DR19: Use the confirmed microcopy verbatim, not paraphrased — e.g. "Registro guardado con éxito" (FR-42), "No hay publicaciones todavía. Sé el primero en compartir algo.", "Esta acción no se puede deshacer." for every destructive-confirm step, and named error strings that state what's wrong and what to do (per EXPERIENCE.md Voice and Tone).

### FR Coverage Map

FR-1: Epic 1 - Type selection at registration
FR-2: Epic 1 - Type-specific field capture
FR-3: Epic 1 - Type immutability
FR-4: Epic 1 - Mandatory Terms acceptance
FR-5: Epic 1 - Password at registration
FR-6: Epic 2 - Deferred profile photo (upload lives on FR-18's profile-edit surface; Epic 1's registration story only confirms no photo field exists on the registration form itself, no separate story needed for that half)
FR-38: Epic 1 - Fixed género/país lists
FR-7: Epic 1 - Fix ContentEditor modal bug
FR-8: Epic 1 - Wire ContentEditor onto privacity/aboutUs
FR-9: Epic 1 - Remove ContentEditor from non-applicable pages
FR-10: Epic 1 - Persist contact submissions
FR-11: Epic 1 - Email notification (stretch)
FR-41: Epic 1 - Admin inbox for Mensajes de Contacto
FR-42: Epic 1 - Submission confirmation message
FR-12: Epic 1 - Real aggregate homepage counters
FR-13: Epic 1 - Open Eventos/Noticias creation
FR-14: Epic 1 - Author + admin edit/delete on Eventos/Noticias
FR-15: Epic 2 - Segmented directory per type
FR-16: Epic 2 - Infinite-scroll card listing
FR-17: Epic 2 - Click-through detail view
FR-18: Epic 2 - Self-only profile editing, admin override
FR-40: Epic 2 - Deactivated-account content hidden
FR-19: Epic 2 - Deportista sport filter
FR-20: Epic 3 - Marca-only item creation
FR-21: Epic 3 - Catalog item fields
FR-22: Epic 3 - Catalog views
FR-23: Epic 3 - No payment processing
FR-39: Epic 3 - Fixed catalog category list
FR-43: Epic 3 - Catalog item edit/delete
FR-24: Epic 4 - Leave a review
FR-25: Epic 4 - Especialidad field
FR-36: Epic 4 - Review moderation (retract + block)
FR-37: Epic 4 - One review per user per nutricionista
FR-26: Epic 5 - Create a publicación
FR-27: Epic 5 - Home feed ordering
FR-28: Epic 5 - Author + admin moderation
FR-29: Epic 6 - User distribution visualization
FR-30: Epic 6 - Numeric counts alongside chart
FR-31: Epic 7 - Dark/light theme toggle
FR-32: Epic 7 - Content-policy editing surfaced in Settings
FR-33: Epic 7 - Visual refresh across named surfaces
FR-34: Epic 7 - Preserve responsiveness
FR-35: Epic 8 - Migrate uploaded file storage off local disk

## Epic List

### Epic 1: Fundamentos y Apertura de Contribución (Checkpoint 1)
Registration correctly captures and locks user type; content editing works everywhere it should; the contact form persists messages with an admin inbox; homepage stats are real; posting eventos/noticias is open to all authenticated users with correct author/admin permissions. Delivers the complete, demoable 2026-08-08 checkpoint.
**FRs covered:** FR-1, FR-2, FR-3, FR-4, FR-5, FR-38, FR-7, FR-8, FR-9, FR-10, FR-11, FR-41, FR-42, FR-12, FR-13, FR-14

### Epic 2: Directorios por Tipo y Perfiles
Each of the four TipoUsuario gets a segmented, infinite-scroll directory with detail views; users manage their own profile with admin recovery override; Deportistas are filterable by sport; deactivated accounts' content is hidden across the app.
**FRs covered:** FR-15, FR-16, FR-17, FR-18, FR-6, FR-40, FR-19

### Epic 3: Catálogo de Marcas
Marca-typed users list contact-only products/services, browsable in an aggregate catálogo view by fixed category, with author/admin edit-delete.
**FRs covered:** FR-20, FR-21, FR-22, FR-23, FR-39, FR-43

### Epic 4: Reseñas de Nutricionistas y Moderación
Authenticated users leave one rating+comment review per nutricionista; admin can retract bad-faith reviews and deactivate the offending account.
**FRs covered:** FR-24, FR-25, FR-36, FR-37

### Epic 5: Publicaciones y Feed de Inicio
Any authenticated user posts text+optional image to a shared, most-recent-first home feed, with author/admin moderation.
**FRs covered:** FR-26, FR-27, FR-28

### Epic 6: Reportes/Indicadores
Admin sees a polished chart plus numeric counts of registered users by type, sharing its aggregate source with the homepage stats.
**FRs covered:** FR-29, FR-30

### Epic 7: Settings, Tema y Refresco Visual
Users toggle light/dark theme (persisted via localStorage); the visual refresh (brand-chrome consolidation, retiring pastel gradients, sitewide hover micro-interaction) lands across every named surface without breaking responsiveness.
**FRs covered:** FR-31, FR-32, FR-33, FR-34

### Epic 8: Migración de Almacenamiento de Archivos
Uploaded files move off local disk onto Cloudflare R2, sequenced last so every upload-touching feature built in prior epics migrates once, not twice.
**FRs covered:** FR-35

## Epic 1: Fundamentos y Apertura de Contribución

Registration correctly captures and locks user type; content editing works everywhere it should; the contact form persists messages with an admin inbox; homepage stats are real; posting eventos/noticias is open to all authenticated users with correct author/admin permissions. Delivers the complete, demoable 2026-08-08 checkpoint.

### Story 1.1: Registro segmentado por tipo

As a prospective user (deportista, marca, nutricionista, or patrocinador),
I want to select my user type at registration and provide type-specific information,
So that my account is correctly segmented from day one.

**Acceptance Criteria:**

**Given** I'm on the registration page
**When** I select a TipoUsuario (Deportista/Marca/Nutricionista/Patrocinador)
**Then** the form immediately reveals that type's specific fields, with no page reload/transition (FR-1)

**Given** I've selected Deportista
**When** I view the revealed fields
**Then** I see: primer nombre, segundo nombre, primer apellido, segundo apellido, deporte (fixed list), fecha de nacimiento, género (fixed list), nacionalidad, ciudad de residencia, biografía corta, altura, peso, teléfono (opcional), nivel deportivo, años de experiencia, objetivos actuales, marcas personales (opcional), lesiones (opcional), link redes sociales (FR-2)

**Given** I've selected Marca
**When** I view the revealed fields
**Then** I see: nombre de la empresa, NIT, teléfono de contacto, dirección, nombre y cargo del contacto, descripción de la empresa, URL red social, URL del aplicativo web (FR-2)

**Given** I've selected Nutricionista
**When** I view the revealed fields
**Then** I see: nombres, apellidos, fecha de nacimiento, género, teléfono, país, ciudad de residencia, descripción corta, título profesional, universidad, año de graduación, especialidad, años de experiencia, certificados adicionales (opcional), modalidad de atención (FR-2)

**Given** I've selected Patrocinador
**When** I view the revealed fields
**Then** I see: nombres, apellidos, fecha de nacimiento, teléfono, país, ciudad, descripción breve, sitio web (opcional) (FR-2)

**Given** any type is selected
**When** I attempt to submit género or país as free text outside the fixed lists
**Then** submission is rejected (FR-38)

**Given** any type
**When** I leave an "(opcional)" field blank
**Then** submission succeeds
**And** leaving any other required field blank causes submission to be rejected

**Given** I have not checked the Terms & Conditions checkbox
**When** I attempt to submit
**Then** submission is blocked
**And** the checkbox is linked via hyperlink to the live `terms` content page (FR-4)

**Given** valid input across all required fields and T&C accepted
**When** I submit
**Then** an account is created with the correct TipoUsuario, correo, and hashed contraseña (FR-5)

**Given** I'm viewing the registration form
**When** I look for a profile-photo upload field
**Then** none exists — photo upload happens post-login only, on the profile-edit surface (Epic 2, FR-6)

**Given** I close the browser tab mid-form
**When** I return to `/register`
**Then** the form is blank — no partial account was created

### Story 1.2: Inmutabilidad de tipo de usuario

As a platform operator,
I want TipoUsuario to be permanently locked after registration,
So that downstream type-gated features (catalog creation, directories) can trust it never changes.

**Acceptance Criteria:**

**Given** a Usuario has completed registration with a TipoUsuario set
**When** they view their own profile-edit form
**Then** no UI control exists to change TipoUsuario

**Given** a Usuario submits a profile-edit request with a modified `tipoUsuarioId`/`informacion.tipoUsuarioId` value (e.g. via direct API call)
**When** the request is processed
**Then** the server strips/ignores the field and the Usuario's type remains unchanged
**And** this closes the existing bug in `server/api/profile/index.put.ts` (lines 93-100, 116-129) that today allows this change to go through

**Given** an admin uses the profile-edit override (FR-18's admin path) on any Usuario
**When** they submit changes
**Then** TipoUsuario cannot be altered through this path either — no write path, including admin override, may change it (AD-8)

**Given** legacy pre-MVP Usuarios (no type, or type set once via the old flow)
**When** this fix ships
**Then** they are left as-is, not backfilled or force-assigned a type (confirmed non-goal)

### Story 1.3: Fix de ContentEditor y reubicación

As an admin,
I want ContentEditor to work correctly where it belongs and disappear where it doesn't,
So that I can maintain terms/privacy/about-us content reliably, without a broken modal or clutter on unrelated pages.

**Acceptance Criteria:**

**Given** I am an admin on `terms`, `privacity`, or `aboutUs`
**When** I click the edit button
**Then** the ContentEditor modal opens with an interactive, usable form panel that is not obscured by its own overlay (FR-7 fix — the panel gets its own stacking context above the overlay)

**Given** I am an admin on `aboutUs` (currently static HTML with no CMS connection)
**When** I save an edit via ContentEditor
**Then** the content persists via the `Content` model and the saved version displays on next load (FR-8)

**Given** I am an admin on `privacity` (which already has a `getContent()` read path)
**When** I save an edit via ContentEditor
**Then** the write path correctly persists and the existing read path reflects the change (FR-8)

**Given** any visitor on `contactUs`, `deportistas`, `marcas`, `nutricionistas`, or `patrocinadores`
**When** the page renders
**Then** no ContentEditor button or component appears anywhere on the page (FR-9)

**Given** `server/api/content/[page].get.ts` and `.put.ts` currently instantiate their own `PrismaClient` instead of using the shared `server/utils/prisma.ts` singleton
**When** this story ships
**Then** both handlers are fixed to use the shared singleton, matching every other handler in the codebase (ARCHITECTURE-SPINE Consistency Conventions) — a natural fit since this story already touches both files

### Story 1.4: Persistencia del formulario de contacto

As an anonymous visitor,
I want my contact-form message (event invitation, partnership interest, promotion, etc.) to actually be saved,
So that Elite Hub receives it and I know it went through.

**Acceptance Criteria:**

**Given** I fill the contact form, including selecting an Asunto from the existing dropdown, with valid input
**When** I submit without being logged in
**Then** a Mensaje de Contacto record is created capturing the Asunto and every other form field (FR-10)

**Given** a successful submission
**When** the request completes
**Then** the form displays "Registro Guardado con Éxito" and no longer behaves as a no-op, replacing the prior setTimeout+alert behavior (FR-42)

**Given** the Mensaje de Contacto model
**When** it's inspected
**Then** it has no foreign key to Usuario (anonymous submissions) and is distinct from the existing `PQRS` model

**Given** time allows before the checkpoint (stretch, not required for MVP acceptance)
**When** a new Mensaje de Contacto is created
**Then** an email notification may be sent to admin (FR-11) — its absence does not block story acceptance

### Story 1.5: Bandeja admin de Mensajes de Contacto

As an admin,
I want a dedicated inbox listing every contact-form submission,
So that I can read and act on them without querying the database directly.

**Acceptance Criteria:**

**Given** I am an admin
**When** I navigate to the Mensajes de Contacto inbox
**Then** I see every persisted Mensaje de Contacto record, most-recent-first (FR-41)

**Given** a record in the inbox
**When** I view it
**Then** I see the selected Asunto and all sender-provided contact details/message content

**Given** the inbox is a row-based list, not a card-grid
**When** it renders
**Then** it uses the shared admin-table component pattern (row dividers, no per-row shadow) — first real usage of this pattern, later reused by Gestión de usuarios and any other admin list (UX-DR15)

**Given** this is an admin-only page
**When** it loads
**Then** access is gated by `app/middleware/admin.ts` route middleware with auto-redirect — first real usage of this guard, not conditional rendering after the page has already loaded (UX-DR12)

**Given** I am not an admin
**When** I attempt to access this view or its underlying route
**Then** the middleware redirects me before the page renders

### Story 1.6: Stats reales del homepage

As any visitor,
I want the homepage stat counters to reflect real registered-user and event counts,
So that the numbers I see are trustworthy, not hardcoded.

**Acceptance Criteria:**

**Given** the current hardcoded values (327+ deportistas, 125+ patrocinadores, 62+ marcas, 86+ nutricionistas, 51+ eventos)
**When** the homepage loads
**Then** these are replaced by live counts computed from the database (FR-12)

**Given** a new Usuario of a given type registers
**When** the homepage is loaded next
**Then** that type's displayed count increases accordingly

**Given** the shared aggregate query (`server/utils/aggregates.ts`, built fresh in this story)
**When** homepage stats are computed
**Then** deactivated Usuarios are excluded from the counts

**Given** this shared aggregate source
**When** Epic 6's Reportes/Indicadores is later built against the same function
**Then** totals never visibly diverge between the two surfaces (SM-4) — this story establishes `aggregates.ts` as the reusable source of truth

### Story 1.7: Apertura de creación de Eventos/Noticias con permisos autor/admin

As any authenticated user,
I want to create Eventos/Noticias, and to edit/delete only my own unless I'm admin,
So that content creation isn't bottlenecked on admin, while abuse is still moderated.

**Acceptance Criteria:**

**Given** I am any authenticated Usuario, not just admin
**When** I submit a new Evento or Noticia
**Then** it is created successfully (FR-13)

**Given** I authored a specific Evento/Noticia
**When** I attempt to edit or delete it
**Then** the action succeeds

**Given** I did not author a specific Evento/Noticia and I am not admin
**When** I attempt to edit or delete it
**Then** the request is rejected server-side via the shared `authorOrAdmin(resource, action, session)` guard (first real usage of this primitive; both edit and delete are admin-and-author-allowed for this resource type per AD-1's matrix)

**Given** I am admin
**When** I edit or delete any Evento/Noticia regardless of authorship
**Then** the action succeeds (FR-14)

**Given** any authenticated request reaches this guard
**When** `requireSession()` runs
**Then** `Usuario.activo`/`isAdmin` are freshly rechecked against the database, not trusted from a stale JWT claim (AD-4, first real usage of this shared primitive)

**Given** the edit/delete buttons on an Evento/Noticia
**When** rendered client-side
**Then** their visibility is driven by the shared `useResourcePermissions('evento_noticia', ...)` composable — first real usage of this primitive — never a bespoke `authStore.user?.isAdmin` check (UX-DR11)

## Epic 2: Directorios por Tipo y Perfiles

Each of the four TipoUsuario gets a segmented, infinite-scroll directory with detail views; users manage their own profile with admin recovery override; Deportistas are filterable by sport; deactivated accounts' content is hidden across the app.

### Story 2.1: Directorios segmentados con scroll infinito

As an authenticated user,
I want to browse each user type in its own directory with infinite scroll,
So that I can find deportistas, marcas, nutricionistas, or patrocinadores without wading through everyone.

**Acceptance Criteria:**

**Given** I am authenticated
**When** I navigate to the Deportistas, Marcas, Nutricionistas, or Patrocinadores directory
**Then** I see only Usuarios of that TipoUsuario (FR-15)

**Given** a directory listing
**When** it loads
**Then** results load via infinite scroll, not numbered pagination, in cursor-based batches of 20 records (FR-16, NFR-10)

**Given** a directory card
**When** it renders
**Then** it shows the type's most relevant summary fields (e.g. nombre/apellido or razón social for marcas) plus profile photo (FR-16)

**Given** I am not authenticated
**When** I attempt to access any directory route
**Then** I am redirected to `/login` (NFR-2)

**Given** a directory with zero matching records
**When** it loads
**Then** an explicit empty state renders, not a blank or broken container

### Story 2.2: Vista de detalle con navegación de vuelta

As an authenticated user,
I want to click into a directory card and see full profile detail, then return to where I was,
So that I can learn more about someone without losing my place in the list.

**Acceptance Criteria:**

**Given** a directory listing
**When** I click anywhere on a card
**Then** the detail view opens showing the full field set for that Usuario (FR-17)

**Given** the detail view includes health-adjacent/PII fields (fecha de nacimiento, lesiones, peso, altura, etc.)
**When** I view it as any authenticated viewer
**Then** all fields are visible — no field-level privacy control exists in MVP (NFR-7, a deliberate scope cut)

**Given** I am viewing a detail view
**When** I navigate back
**Then** I return to the originating directory listing with my scroll position preserved (FR-17)

### Story 2.3: Edición de perfil propio, foto, y recuperación admin

As an authenticated user,
I want to view and edit only my own profile, including my photo,
So that I control my own information, while admin retains an emergency override for account recovery.

**Acceptance Criteria:**

**Given** I am authenticated
**When** I navigate to my Perfil
**Then** I see and can edit my own Informacion fields

**Given** I attempt to edit another Usuario's profile via direct request
**When** I am not admin
**Then** the request is rejected (FR-18)

**Given** I am on my profile-edit surface
**When** I upload a photo
**Then** it replaces my previous photo wholesale, never appending — the storage layer returns `Promise<string[]>` per AD-2, but this component only ever displays/sends the array's first element (FR-6)

**Given** I am admin
**When** I access another Usuario's profile-edit route as a recovery override
**Then** I can edit their profile, including a deactivated Usuario's (via `activeUserFilter(..., { bypassForAdmin: true })`), and the edit view is visibly framed ("Editando el perfil de {nombre} como administrador") so I never mistake it for my own profile (UJ-5)

**Given** TipoUsuario is immutable (Story 1.2, AD-8)
**When** I or admin edit a profile through this surface
**Then** no control here can change TipoUsuario either

### Story 2.4: Ocultamiento de contenido por cuenta desactivada

As a platform operator,
I want a deactivated Usuario's content and profile hidden from public-facing views,
So that moderation actions actually take effect across the app, not just on paper.

**Acceptance Criteria:**

**Given** a Usuario's account is deactivated (`activo = false`)
**When** any directory listing is queried
**Then** that Usuario's card and profile do not appear, via the shared `activeUserFilter('autor')` helper — first real usage of this primitive (FR-40)

**Given** a deactivated Usuario
**When** their account is reactivated (`activo = true`)
**Then** their card/profile reappear in directories without needing to be recreated

**Given** a deactivated Usuario mid-session
**When** they make their next authenticated request
**Then** they are rejected (per Story 1.7's `requireSession()` DB-recheck) and redirected to `/login` with "Tu sesión ya no es válida. Inicia sesión de nuevo." — never a "you were blocked" message

**Given** the admin user-management surface
**When** an admin views it
**Then** deactivated Usuarios ARE visible there (bypass parameter), distinct from every public-facing list where they're absent

### Story 2.5: Filtro de deporte en Deportistas

As an authenticated user,
I want to filter the Deportistas directory by sport,
So that I can find athletes in the sport I care about without scrolling through all of them.

**Acceptance Criteria:**

**Given** the Deportistas directory
**When** I view the filter controls
**Then** I see chips for: fútbol, baloncesto, ciclismo, running, crossfit, voleibol, gimnasia, boxeo, natación, otros (FR-19)

**Given** I select a sport filter chip
**When** the list refetches
**Then** only Deportistas with that Deporte appear, via a new first cursor batch, not client-side filtering of already-loaded data

**Given** no filter is selected
**When** the directory loads
**Then** all Deportistas appear

**Given** `app/pages/deportistas.vue` currently hardcodes its own sport list, diverging from this canonical FR-19 list
**When** this story ships
**Then** the hardcoded list is reconciled to source from the single shared fixed-list convention (ARCHITECTURE-SPINE Consistency Conventions)

**Given** the existing "why use the app" marketing CTA section at the top of the deportistas page
**When** this story ships
**Then** it is retained/improved, not removed

## Epic 3: Catálogo de Marcas

Marca-typed users list contact-only products/services, browsable in an aggregate catálogo view by fixed category, with author/admin edit-delete.

### Story 3.1: Creación de ítems de catálogo restringida a Marca

As a Marca-typed user,
I want to create catalog items for my own profile,
So that I can list what I sell without a sales team.

**Acceptance Criteria:**

**Given** I am a Marca-typed Usuario
**When** I access my profile
**Then** I see a "Mi catálogo" section with an option to add a new item (FR-20)

**Given** I am not Marca-typed
**When** I view my own profile
**Then** no catalog-creation entry point exists at all — not shown-then-blocked, permanently absent since TipoUsuario is immutable (FR-20, FR-3)

**Given** I attempt to create a catalog item via a direct API request while not Marca-typed
**When** the request is processed
**Then** it is rejected server-side via the `requireType` guard

**Given** I create an item
**When** I select a category
**Then** I choose from the fixed enum (starting values: ropa deportiva, equipamiento, suplementos, tecnología, accesorios), not free text (FR-39)

**Given** the fixed category list
**When** compared to the Deporte fixed-list pattern (Story 2.5)
**Then** it follows the same shared single-source convention (ARCHITECTURE-SPINE Consistency Conventions)

**Given** the item is created for my Marca profile
**When** I inspect ownership
**Then** it is tied only to my own Marca, never another's

### Story 3.2: Vistas de catálogo — perfil propio y agregado

As any authenticated user,
I want to view a Marca's catalog on their profile and browse all catalog items in one place,
So that I can discover products/services across brands, not just one at a time.

**Acceptance Criteria:**

**Given** a catalog item
**When** created
**Then** it has: nombre, tipo de item (servicio | físico), and one or more images (FR-21)

**Given** a Marca's profile
**When** I view it
**Then** I see the brand info on top and their own catalog items section below (FR-22)

**Given** the aggregate Catálogo view
**When** I navigate to it
**Then** I see items across all marcas, browsable by category, with a "ver catálogo completo sin filtros" option (FR-22)

**Given** any catalog item anywhere in the app
**When** I look for a checkout, cart, or payment affordance
**Then** none exists — every listing is contact-only (FR-23)

**Given** the aggregate Catálogo view
**When** I look for its entry point
**Then** it's reached via a CTA from the Marcas directory, not a separate top-level nav item

### Story 3.3: Edición y borrado de ítems de catálogo

As a Marca that created a catalog item,
I want to edit or delete my own items, with admin able to moderate any,
So that I can keep my listings accurate and abuse can still be removed.

**Acceptance Criteria:**

**Given** I created a catalog item
**When** I attempt to edit or delete it
**Then** the action succeeds (FR-43)

**Given** a catalog item created by another Marca
**When** I, a different Marca, attempt to edit or delete it
**Then** the request is rejected server-side via `authorOrAdmin(resource, action, session)` — mirroring the same edit+delete-for-both-roles matrix as Eventos/Noticias (Story 1.7), the second real usage of this guard for a symmetric-permission resource

**Given** I am admin
**When** I edit or delete any catalog item regardless of authorship
**Then** the action succeeds

## Epic 4: Reseñas de Nutricionistas y Moderación

Authenticated users leave one rating+comment review per nutricionista; admin can retract bad-faith reviews and deactivate the offending account.

### Story 4.1: Dejar y ver reseñas de nutricionista

As an authenticated user,
I want to leave a rating+comment review on a nutricionista's profile and see their especialidad,
So that I can share and read real reputation signals, not just a bio.

**Acceptance Criteria:**

**Given** I am authenticated and viewing a Nutricionista's detail page
**When** I submit a rating + comment
**Then** a Reseña is created and visible on that profile to anyone who can view it (FR-24)

**Given** no booking/consumption record exists to verify I actually used the nutricionista's services
**When** I submit a review
**Then** no technical gate blocks it — this is a confirmed decision, not a gap

**Given** I have already reviewed a specific Nutricionista
**When** I attempt to submit a second review for them
**Then** the button/form is replaced with "Ya dejaste una reseña para {nombre}" and the server rejects a duplicate submission (FR-37)

**Given** a Nutricionista's detail view
**When** I view it
**Then** I see their especialidad field alongside name/photo/reviews (FR-25)

### Story 4.2: Moderación de reseñas — retractar y bloquear

As an admin,
I want to retract a fake or bad-faith review and deactivate the account that posted it,
So that reputation abuse has a real consequence, not just a removed comment.

**Acceptance Criteria:**

**Given** a Reseña flagged as fake or bad-faith
**When** admin retracts it
**Then** it no longer appears on the Nutricionista's profile (FR-36)

**Given** admin retracts a review
**When** they also choose to deactivate the reviewing Usuario
**Then** that Usuario's `activo` flag is set to false, and per Story 2.4's cascade, their content is hidden and their session is rejected on their next request

**Given** the retraction action
**When** performed
**Then** it requires the standard destructive-confirm step ("Esta acción no se puede deshacer.")

**Given** a retracted review where the author's account is NOT also blocked
**When** they submit again for the same nutricionista
**Then** it succeeds — a known, accepted limitation carried forward from SPEC.md, not fixed in this story

## Epic 5: Publicaciones y Feed de Inicio

Any authenticated user posts text+optional image to a shared, most-recent-first home feed, with author/admin moderation.

### Story 5.1: Crear y ver publicaciones en el feed

As an authenticated user,
I want to post text and an optional image to a shared feed and see everyone else's posts,
So that I have a reason to open the app daily.

**Acceptance Criteria:**

**Given** I am authenticated
**When** I use the composer, inline at the top of the feed, not a modal
**Then** I can submit text plus an optional single image as a new Publicación (FR-26)

**Given** a new Publicación is created
**When** the feed is loaded
**Then** it appears at the top, most-recent-first (FR-27)

**Given** the feed
**When** it loads
**Then** it fetches via infinite-scroll cursor batches of 20, the same convention as Story 2.1

**Given** a deactivated Usuario's Publicaciones
**When** the feed is queried
**Then** they are hidden per Story 2.4's `activeUserFilter` cascade

**Given** I am NOT authenticated
**When** I open the app's Home
**Then** I see the existing marketing hero, live stats (Story 1.6), and feature tiles instead of a feed — Home forks by authentication state, it does not require login to view (UX-DR10)

### Story 5.2: Moderación de publicaciones — autor y admin

As the author of a Publicación,
I want to edit or delete my own posts, with admin able to remove but not edit any,
So that I control my content while abuse can still be moderated appropriately.

**Acceptance Criteria:**

**Given** I authored a Publicación
**When** I attempt to edit or delete it
**Then** the action succeeds (FR-28)

**Given** a Publicación authored by someone else
**When** I am not admin and attempt to edit or delete it
**Then** the request is rejected via `authorOrAdmin(resource, action, session)`

**Given** I am admin
**When** I attempt to delete another Usuario's Publicación
**Then** the action succeeds

**Given** I am admin
**When** I attempt to EDIT another Usuario's Publicación
**Then** the action is rejected — admin may delete but never edit another's post, per AD-1's asymmetric matrix for this resource, distinct from Eventos/Noticias and Catálogo's uniform matrix

## Epic 6: Reportes/Indicadores

Admin sees a polished chart plus numeric counts of registered users by type, sharing its aggregate source with the homepage stats.

### Story 6.1: Visualización de distribución de usuarios

As an admin,
I want a polished chart plus numeric counts of registered users by type,
So that I can see community composition at a glance without querying the database.

**Acceptance Criteria:**

**Given** I am admin
**When** I navigate to Reportes/Indicadores
**Then** I see a chart (donut or bar, via vue-chartjs) breaking down registered Usuarios by TipoUsuario (FR-29)

**Given** the same view
**When** I look alongside the chart
**Then** numeric counts per TipoUsuario are also displayed, not chart-only (FR-30)

**Given** the chart's totals
**When** compared to the homepage stats (Story 1.6)
**Then** they match exactly — both are computed via the same shared `server/utils/aggregates.ts` function (SM-4)

**Given** this view is held to a higher visual-polish bar ("muy agradable de ver") than the rest of admin
**When** it renders
**Then** it uses DESIGN.md's full card/shadow/color system, not a bare default chart render

**Given** I am not admin
**When** I attempt to access this view or its route
**Then** access is denied

## Epic 7: Settings, Tema y Refresco Visual

Users toggle light/dark theme (persisted via localStorage); the visual refresh (brand-chrome consolidation, retiring pastel gradients, sitewide hover micro-interaction) lands across every named surface without breaking responsiveness.

### Story 7.1: Toggle de tema claro/oscuro

As a user,
I want to switch between light and dark theme from Settings,
So that I can use the app comfortably regardless of lighting or preference.

**Acceptance Criteria:**

**Given** I am on Settings
**When** I tap the theme toggle
**Then** the app's appearance switches between light and dark instantly, with no page reload and no confirm step (FR-31)

**Given** I switch themes
**When** I return on a later visit on the same device
**Then** my choice persists via `localStorage` — no server round-trip, no cross-device sync (FR-31)

**Given** the theme toggle state changes
**When** using a screen reader
**Then** the change is announced ("Tema oscuro activado")

**Given** Settings
**When** I view it
**Then** the existing content-policy edit entry points (terms/privacity/aboutUs, Story 1.3) are still present alongside the new toggle (FR-32)

**Given** the dark palette
**When** applied
**Then** header/footer flip polarity (white bg/black text) while brand chrome remains the highest-contrast element in both themes

### Story 7.2: Sistema de diseño y consolidación visual

As a user,
I want a visually consistent app instead of today's mismatched buttons/cards/colors,
So that Elite Hub feels like one coherent product, not a patchwork.

**Acceptance Criteria:**

**Given** DESIGN.md's token set
**When** implemented
**Then** it exists as real Tailwind v4 `@theme` CSS variables, not hardcoded utility classes — colors, typography, rounded, spacing (UX-DR1)

**Given** the current 3+ card idioms (`rounded-xl shadow-lg`, `rounded-2xl` no-shadow, `rounded-lg shadow-md`)
**When** this story ships
**Then** every card sitewide uses the single canonical `rounded-xl shadow-lg overflow-hidden` + `hover:scale-105` treatment (UX-DR2, FR-33)

**Given** the current 4+ button idioms
**When** this story ships
**Then** every button uses one of exactly 3 roles: primary, secondary, destructive (UX-DR3)

**Given** the current dual page-shell widths (`max-w-[120rem]` vs `max-w-7xl`/`max-w-5xl`)
**When** this story ships
**Then** every page, including admin, uses the single `max-w-[120rem]` shell (UX-DR4)

**Given** the pastel per-category gradient backgrounds on deportistas/marcas/nutricionistas/patrocinadores/eventos/noticias/admin
**When** this story ships
**Then** they are retired and replaced with brand-chrome-consistent surface tokens (UX-DR5, FR-33)

**Given** the dead `hover:bg-secondary` class in `header.vue`
**When** this story ships
**Then** it's wired to the real `secondary` token (UX-DR7)

**Given** the `Jugador.jpeg` stock image on login/register
**When** this story ships
**Then** it's removed and replaced with a brand-chrome-consistent pattern, no new stock photography introduced (UX-DR8, FR-33)

**Given** the header's current 5 nav links
**When** this story ships
**Then** Eventos and Noticias are promoted into primary nav, 7 links total, using the same hamburger/horizontal mechanism (UX-DR9)

**Given** every visual change in this story
**When** verified
**Then** existing responsive behavior across breakpoints is preserved unbroken (FR-34)

### Story 7.3: Accesibilidad y responsividad como piso verificable

As a user relying on assistive technology or a specific device size,
I want every touched surface to meet a real accessibility and responsiveness floor,
So that the visual refresh doesn't leave anyone behind.

**Acceptance Criteria:**

**Given** any interactive icon-only control
**When** rendered
**Then** it carries an `aria-label` in Spanish matching its visible-text equivalent elsewhere (UX-DR16)

**Given** infinite-scroll loading and end-of-list states (Story 2.1 pattern)
**When** they change
**Then** they are announced via `aria-live="polite"` (UX-DR16)

**Given** the focus-ring token
**When** any interactive element receives focus
**Then** the ring holds AA contrast against both light and dark canvases (UX-DR16)

**Given** required vs. optional fields on any form
**When** rendered
**Then** they are marked in text, never by color alone (UX-DR16)

**Given** `prefers-reduced-motion` is set
**When** a user interacts with a card (hover-lift) or icon badge (invert)
**Then** the transition reduces to an opacity/no-transform change (UX-DR16)

**Given** every card grid, admin table, and the Reportes/Indicadores view
**When** tested at `<md`, `md`, `lg`, and `xl`
**Then** each matches the exact breakpoint behavior specified in EXPERIENCE.md's Responsive & Platform table (UX-DR17, FR-34) — the verification gate for every visual-refresh surface from Story 7.2 and every new surface built in Epics 2-6

## Epic 8: Migración de Almacenamiento de Archivos

Uploaded files move off local disk onto Cloudflare R2, sequenced last so every upload-touching feature built in prior epics migrates once, not twice.

### Story 8.1: Migración de almacenamiento a Cloudflare R2

As a platform operator,
I want uploaded files moved off local disk to persistent, non-local storage,
So that the app is actually deployable and doesn't lose user content on redeploy.

**Acceptance Criteria:**

**Given** the current Nitro `useStorage('public')` local-disk approach
**When** this story ships
**Then** all file uploads (profile photos, catalog item images, publicación images, content images) go through the new `server/utils/storage.ts` client targeting Cloudflare R2 via an S3-compatible SDK (FR-35, AD-2)

**Given** `storage.ts`
**When** any upload completes
**Then** it always returns `Promise<string[]>`, consistent with every consuming component's expectation established in Stories 2.3, 3.2, and 5.1

**Given** existing images already on local disk (`server/public/*`, currently git-tracked) from pre-migration usage
**When** this story ships
**Then** they are migrated to R2 as part of this work, not left to 404 after cutover

**Given** the app after this migration
**When** a server restart or redeploy occurs
**Then** all uploads and reads remain fully functional with no local-disk state retained

**Given** this story is the last one sequenced in the MVP
**When** it begins
**Then** every other upload-touching feature (profile photo, catalog images, publicación images) is already built against the final storage contract, so nothing migrates twice

**Given** upload filenames today follow inconsistent conventions (e.g. `profile/index.put.ts`'s non-timestamped avatar key, which silently overwrites on re-upload)
**When** every upload path is rewired through `storage.ts` in this story
**Then** all filenames follow the single shared `{resource}-{id}-{timestamp}{ext}` convention with a shared extension allowlist — no path risks a silent overwrite (ARCHITECTURE-SPINE Consistency Conventions)
