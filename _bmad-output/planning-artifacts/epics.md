---
stepsCompleted: [1]
inputDocuments:
  - _bmad-output/specs/spec-Elite_Hub/SPEC.md
  - _bmad-output/specs/spec-Elite_Hub/functional-requirements.md
  - _bmad-output/specs/spec-Elite_Hub/glossary.md
  - _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md
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

N/A — no UX design contract (`bmad-ux` run) exists for this project. Interaction- and field-level detail that would normally live in a UX spec is instead carried in the FR list above and in `functional-requirements.md`.

### FR Coverage Map

{{requirements_coverage_map}}

## Epic List

{{epics_list}}
