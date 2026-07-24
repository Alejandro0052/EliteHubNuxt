---
id: SPEC-Elite_Hub
companions: ['glossary.md', 'functional-requirements.md', '../../planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md']
sources: ['../../planning-artifacts/prds/prd-Elite_Hub-2026-07-19/prd.md', '../../planning-artifacts/prds/prd-Elite_Hub-2026-07-19/addendum.md']
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability only — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# SPEC — Elite Hub MVP

## Why

Elite Hub's technical core already works — auth, a news/events system, profile editing, a lightweight CMS — but the product has no core loop: four kinds of people (deportistas building a career or habit, marcas wanting visibility and a sales channel, nutricionistas offering expertise, patrocinadores with resources to back people who have less) all land in one undifferentiated pool, unable to find each other by type, with brands unable to sell and nutritionists carrying no reputation signal. This is both a vision to realize (a four-sided community loop that does not exist yet) and a pain to solve (nobody currently has a reason to open the app twice). It matters now because delivery targets a functional checkpoint on 2026-08-08 for university evaluators, with room to extend to a stable, genuinely deploy-ready MVP by 2026-08-22 — built with an eye toward real future deployment, not discarded after grading.

## Capabilities

- **CAP-1 — Registration & Type-Segmented Onboarding**
  - **intent:** A prospective user selects exactly one TipoUsuario at registration, provides that type's fields plus mandatory T&C acceptance, and has the type locked permanently.
  - **success:** Registration cannot be submitted without a TipoUsuario, required type-specific fields, and accepted T&C; no UI or API path exists, at any point post-registration, to change a Usuario's TipoUsuario.

- **CAP-2 — Content Editor Fix & Static Page Editing**
  - **intent:** Admin can edit terms/privacity/aboutUs content through a working ContentEditor, and the component is removed from pages it does not belong on.
  - **success:** The ContentEditor modal opens usable (not obscured by its overlay) on terms/privacity/aboutUs; it is absent from contactUs/deportistas/marcas/nutricionistas/patrocinadores.

- **CAP-3 — Contact Form Persistence**
  - **intent:** Anonymous visitors' contact-form submissions persist durably and are reviewable by admin in-app.
  - **success:** A valid unauthenticated submission creates a durable Mensaje de Contacto record (including Asunto) and shows "Registro Guardado con Éxito"; admin has a most-recent-first inbox listing every submission.

- **CAP-4 — Homepage Real-Time Stats**
  - **intent:** Homepage stat counters reflect live, database-computed counts instead of hardcoded numbers.
  - **success:** Creating a new Usuario of a type increases that type's displayed count on next load; the same aggregate query backs this and Reportes/Indicadores so the two never visibly diverge.

- **CAP-5 — Open Eventos/Noticias Creation**
  - **intent:** Any authenticated Usuario can create Eventos/Noticias; the author or an admin can edit/delete them.
  - **success:** A non-admin author acting on another Usuario's Evento/Noticia is rejected; admin edit/delete succeeds on any.

- **CAP-6 — Per-Type Directory & Profile System**
  - **intent:** Each TipoUsuario has its own infinite-scroll directory and detail view; Usuarios edit only their own profile with admin override for recovery; deactivated accounts' content is hidden, not deleted, from public views.
  - **success:** Four segmented directories exist, each showing only that type's Usuarios; a non-admin editing another's profile is rejected; deactivating an account hides its card/profile/publicaciones/catalog items from public views and reactivating restores them without recreating content.

- **CAP-7 — Deportista Sport Filters**
  - **intent:** The Deportistas directory can be filtered by the fixed sport list captured at registration.
  - **success:** Selecting a sport filter shows only Deportistas with that Deporte; no filter shows all Deportistas.

- **CAP-8 — Marca Product/Service Catalog**
  - **intent:** Only Marca accounts can list contact-only catalog items, shown on their own profile and in an aggregate, category-browsable Catálogo view.
  - **success:** A non-Marca Usuario has no path to create an item; no checkout/payment exists anywhere for any item; the creating Usuario or admin can edit/delete an item, others are rejected.

- **CAP-9 — Nutricionista Ratings & Reviews**
  - **intent:** Authenticated Usuarios can leave one rating+comment review per Nutricionista, visible on that profile alongside an especialidad field, moderated by admin.
  - **success:** A second review attempt by the same Usuario on the same Nutricionista is rejected; admin can retract any review and deactivate its author.

- **CAP-10 — Publicaciones / Home Feed**
  - **intent:** Any authenticated Usuario can post text plus an optional image to a shared, most-recent-first home feed.
  - **success:** A new publicación appears in the feed; a non-author non-admin editing/deleting another's post is rejected; admin delete succeeds on any post.

- **CAP-11 — Reportes/Indicadores**
  - **intent:** Admin sees a visually polished chart plus numeric counts breaking down registered Usuarios by TipoUsuario.
  - **success:** Chart totals match the homepage counts (same aggregate source); numeric counts are readable independent of the chart.

- **CAP-12 — Settings & Theme Toggle**
  - **intent:** Usuarios can toggle light/dark theme from Settings, persisted across sessions, alongside the existing content-policy edit entry points.
  - **success:** Toggling theme changes the app's appearance without breaking layout or responsiveness in either theme, and the choice persists on return visits.

- **CAP-13 — Visual/UI Overhaul**
  - **intent:** Apply a visual refresh (not a rebrand) to the surfaces called out as visually weak, plus a sitewide card hover micro-interaction.
  - **success:** Named surfaces (directories/detail views, eventos/noticias listing, admin panel, login/register) show the refreshed look, including removal of the placeholder Jugador.jpeg; every change preserves existing responsive behavior across breakpoints.

- **CAP-14 — File Storage Migration**
  - **intent:** Move uploaded files off local disk onto persistent, non-local storage suitable for a deployed environment.
  - **success:** The app remains fully functional (uploads and reads) after a server restart or redeploy with no local-disk state retained.

## Constraints

- Platform is web-only, responsive Nuxt 4, no native mobile app; every new/modified surface must preserve current responsive behavior across breakpoints (FR-34) as a release gate.
- No anonymous/public visibility: directories, profiles, catálogo, and feed all require an authenticated account; only home/terms/contact stay public.
- TipoUsuario is immutable after registration, enforced server-side per ARCHITECTURE-SPINE AD-8 via the indirect `Usuario → Informacion → TipoUsuario` path (no direct relation exists); no self-service or admin write path may change it.
- Author-vs-admin authorization must be enforced server-side, not just UI-hidden, per ARCHITECTURE-SPINE AD-1's per-resource action→role matrix — admin rights differ by resource and action (e.g. admin deletes but cannot edit another Usuario's Publicación; admin retracts but cannot edit/delete Reseñas).
- Auth freshness: `activo`/`isAdmin` are rechecked from the DB once per request via `requireSession()` (ARCHITECTURE-SPINE AD-4); JWT claims alone are never trusted for these two fields.
- Deactivated-user content cascade uses a shared `activeUserFilter()` (ARCHITECTURE-SPINE AD-5) across directories/feed/catálogo/eventos-noticias listings; Reseñas are explicitly excluded from this cascade for MVP — a deactivated Usuario's reviews stay visible, a deliberate carry-forward of the PRD's own deferral.
- Homepage and Reportes/Indicadores aggregate counts exclude deactivated Usuarios (ARCHITECTURE-SPINE `aggregates.ts`).
- Full profile field set, including health-adjacent fields (lesiones, peso, altura) and PII (fecha de nacimiento), is visible to any authenticated viewer on detail views; no field-level privacy control exists in MVP — a deliberate scope cut, not an oversight.
- Cost guardrail: no paid infrastructure assumed; free/open-source-tier choices only — realized as Cloudflare R2 (ARCHITECTURE-SPINE AD-2) for storage and vue-chartjs + chart.js (AD-3) for charting.
- The existing session-based auth stack (`next-auth` + `@sidebase/nuxt-auth` + `@next-auth/prisma-adapter`, layered) is retained as-is, not audited or consolidated in this MVP; `next-auth` must stay below 4.23.0 per ARCHITECTURE-SPINE compatibility note.
- Directory infinite-scroll must stay responsive as Usuario count grows; realized via cursor-based pagination, 20 records per batch, one fixed default (ARCHITECTURE-SPINE Consistency Conventions).
- File uploads must not silently fail or corrupt existing records; the known gap of no transactional writes for compound file-upload+DB-write operations is explicitly carried to post-MVP maintenance, not fixed here. Upload/insert ordering convention: insert the DB row first with a null/placeholder image field, then upload, then patch the row with the resulting URL(s) — cheapest failure mode to detect.
- Fixed-value lists (deporte, género, país, catálogo categories) are defined once in a single shared source, never hardcoded per-component (ARCHITECTURE-SPINE Consistency Conventions).

## Non-goals

- Payments of any kind — no checkout, no subscriptions, no monetization tied to user type.
- Legacy-account backfill/migration — pre-MVP Usuarios are left as-is, not migrated or force-assigned a TipoUsuario.
- PQRS (complaints/petitions) support — known product debt, unrelated to the Contact Form.
- Email-based password recovery — the admin manual-override stopgap is the MVP's only recovery path.
- Dynamic scheduling/agendas for nutricionistas.
- App rebrand — raised during discovery but unrelated to MVP functionality, explicitly deferred.
- Formal unit/component test suite and CI/CD pipeline (this excludes E2E testing, which is a real, tracked, non-gating parallel effort — see ARCHITECTURE-SPINE AD-7).
- RBAC activation — the existing `Rol`/`Permiso` schema stays unused; authorization continues on the flat `isAdmin` boolean plus author-or-admin checks.
- Auth package consolidation — the overlapping `next-auth`/`@sidebase/nuxt-auth`/`@next-auth/prisma-adapter` stack is not audited or reduced.
- Transactional writes for compound file-upload + DB-write operations — known gap, deferred to post-MVP maintenance.

*Note: the PRD additionally listed "Prisma client consistency for `content/[page].*`" as a non-goal deferred to post-MVP; ARCHITECTURE-SPINE's Consistency Conventions and Structural Seed fold this exact fix into CAP-2's work (switching those two handlers to the shared Prisma singleton), superseding that deferral for this file specifically — treated as in-scope, not carried forward as a live non-goal.*

## Success signal

100% of Must-tier FRs demonstrably working by 2026-08-08, and 100% of Should-tier FRs demonstrably working by 2026-08-22. Standing alongside both checkpoints: homepage and Reportes/Indicadores counts must never visibly diverge, since they share one aggregate source — any drift signals a regression. Completion is not to be gamed: registration completion is not improved by cutting required type-specific fields, and feed activity is not encouraged at the cost of skipping author/admin moderation checks.

## Assumptions

- Abandoning registration mid-form creates no partial account (UJ-1).
- Directory scroll position is preserved on back-navigation from a detail view (FR-17).
- Home feed orders publicaciones most-recent-first (FR-27).
- Theme choice persists across sessions (FR-31).

## Open Questions

- Hosting/deployment platform is not yet decided (ARCHITECTURE-SPINE Deferred); revisit before or during CAP-14's storage migration since it may shape env/config.
- Full attribute-level Prisma schema for the new models (Publicacion, Resena, ItemCatalogo, MensajeContacto) is not yet fixed beyond the Spanish-PascalCase naming convention.
- Env-var/secrets management approach beyond `AUTH_SECRET` failing fast if unset is undecided.
- No guard exists against deactivating the last remaining admin account.
- No defined admin account creation/promotion path exists.
- A retracted Reseña does not free its author's one-review-per-nutricionista slot unless the author is also blocked.
- No self-service edit path exists for a Usuario's own Reseña.
- Self-review is not excluded — a Nutricionista could review their own profile.
- Lower-severity consistency gaps from architecture's adversarial review remain open: multi-field validation error payload shape, a shared hover-interaction utility for FR-33, E2E fixture/seed conventions, and type-gate enforcement on non-creation write paths.
