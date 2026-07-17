---
title: Elite Hub — MVP Stabilization
status: draft
created: 2026-07-16
updated: 2026-07-16
---

# Product Brief: Elite Hub — MVP Stabilization

## Executive Summary

Elite Hub is a working Nuxt 4 full-stack web application — a sports-community platform connecting athletes, brands, nutritionists, and sponsors — built as a solo university project. The technical core is solid: auth, news/events CRUD, user profiles, and a lightweight admin CMS all function today. What started as a short "close a few gaps" list turned, through discovery, into something bigger: the platform doesn't yet have its core loop. Users register but aren't segmented by type at signup; there's no way to browse athletes, brands, nutritionists, or sponsors as distinct directories; brands can't list products; nutritionists have no reviews; there's no visibility into how many users of each type exist. This brief scopes that build-out alongside the smaller stabilization items originally identified (a broken shared editor component, a decorative contact form, hardcoded homepage stats).

Delivery is planned in two checkpoints rather than one deadline: a **functional-cycle checkpoint around August 8, 2026** showing real, demonstrable progress to university professors, and a **stable-MVP target of August 22, 2026** if the extra two weeks are needed. The list below is intentionally the *full* picture, tiered by priority — nothing is silently dropped, but not everything is equally urgent.

## Current State

Verified directly against the code (not assumed):

- Auth, profile editing, news/events CRUD (admin-only today), and a lightweight admin CMS (`Content` model) all work.
- Registration (`server/api/auth/register.post.ts`) collects no user type — type is only ever set after the fact via profile editing. No immutability once set.
- The shared `ContentEditor.vue` component's edit modal is broken **everywhere it's used** (`terms`, `contactUs`, `deportistas`, `marcas`, `nutricionistas`, `patrocinadores`): the overlay div is `position: fixed` while the modal panel has no positioning, so per CSS stacking rules the overlay always paints above the form — clicking the edit button just grays the screen. Root cause identified, fix is small (one shared component).
- `contactUs.vue`'s submit handler is decorative — it never persists or sends the message anywhere.
- `privacity.vue` and `aboutUs.vue` have no editing path at all (`aboutUs.vue` is fully static HTML with no CMS connection).
- Homepage stat counters (`app/pages/index.vue`) are hardcoded, not real data.
- No directory/listing views exist for any user type; no product/service catalog; no reviews; no reports/metrics view.

## Scope — Must (target: Aug 8 checkpoint)

Foundational fixes and highest value-per-effort items. Other work depends on these being right, and they give something real to show at the first checkpoint.

1. **Registration overhaul** — capture user type (deportista + sport / marca / nutricionista / patrocinador) at signup, with type-specific fields shown inline; type is immutable once set. User-flagged as the single highest-priority fix — everything downstream (directories, brand-only product creation) depends on type being captured correctly going forward.
2. **Fix `ContentEditor.vue`'s modal bug** (small CSS fix) — unblocks editing on `terms`, `privacity`, `aboutUs`.
3. **Wire `ContentEditor` onto `privacity.vue` and `aboutUs.vue`**; **remove it from `contactUs.vue`, `deportistas.vue`, `marcas.vue`, `nutricionistas.vue`, `patrocinadores.vue`** (not tied to a real feature there, currently just a source of confusion/bugs).
4. **Contact form fix** — persist submissions to the database (new model needed — the existing `PQRS` model requires a logged-in user, which doesn't fit anonymous public submissions). Email notification is a stretch goal only if time allows.
5. **Wire homepage stats to real data** — replace the hardcoded counters with actual counts by user type and event count.
6. **Open eventos/noticias creation to all authenticated users**, not just admins (currently `isAdmin`-gated in `server/api/eventos/**` and `server/api/noticias/**`).

## Scope — Should (target: through Aug 8–22 window, the core of the MVP)

The main feature build-out. See `addendum.md` for full implementation detail on every item below.

7. **Per-type directory & profile system** — segmented listing views for deportista/marca/nutricionista/patrocinador with card summaries, infinite scroll, click-through detail views, and self-only profile editing (admin retains override access as a temporary password-reset stopgap).
8. **Deportista sport filters** — fixed category list (fútbol, baloncesto, ciclismo, running, crossfit, voleibol, gimnasia, boxeo, natación, otros).
9. **Marca product/service catalog** — categorized listings, brand-only creation, no payments in MVP.
10. **Nutricionista ratings & reviews** on their profile.
11. **"Publicaciones" (posts)** — all 4 user types can post to the app's home feed.
12. **Reportes/Indicadores view** — visual breakdown of registered users by type.
13. **Visual/UI overhaul** — directory views, eventos/noticias listing, admin panel, login/register (including removing the placeholder `Jugador.jpeg` image), hover micro-interactions sitewide, dark/light theme toggle. Must preserve the app's current responsiveness throughout.
14. **File storage migration off local disk** — sequenced deliberately last, immediately before considering the MVP genuinely deploy-ready.

## Testing Approach (parallel track, not gating)

E2E tests are being progressively rewritten in TypeScript (Playwright), replacing the existing Python/pytest suite (currently 4 public-page navigation flows, import bug already fixed — see `e2e-testing.md`). This runs alongside the Must/Should work above as an ongoing track, not a blocking requirement for any individual item's delivery — but it is a real, tracked part of this effort, not deferred to the maintenance phase.

## Scope — Out (Post-MVP / Maintenance Phase)

Confirmed explicitly out of scope, either because they're not functionally urgent or because they're deferred by design:

- Email-based password recovery (admin manual override is the MVP stopgap)
- Payments for brand product/service listings
- Monthly subscription / monetization tied to user type
- Dynamic scheduling/agendas for nutritionists
- Possible app rebrand (trademark conflict concern, unrelated to MVP functionality)
- No unit/component test suite
- No CI/CD pipeline
- Overlapping auth packages (`next-auth` + `@sidebase/nuxt-auth` + `@next-auth/prisma-adapter`) never audited for redundancy
- `Rol`/`Permiso` RBAC schema exists in the database but nothing uses it — all authorization is a flat `isAdmin` boolean
- No transactional writes for compound operations (file upload + DB write can partially fail)
- Inconsistent Prisma client usage (`content/[page].*` instantiates its own client instead of the shared singleton)

This is the seed list for the multi-month maintenance phase that follows MVP delivery.

## Success Criteria

**Aug 8 checkpoint:** all "Must" items complete and demonstrable — registration correctly captures type, content editing works where it should, the contact form actually saves messages, homepage stats are real, and posting is open to all users. Enough visible, working progress for meaningful professor feedback.

**Aug 22 stable MVP (if the extra two weeks are needed):** all "Should" items complete — the full directory/profile/catalog/reviews/reports feature set is live, the visual overhaul is applied consistently, and file storage no longer depends on local disk, making the app genuinely deployable.

## Open Questions

- The exact fields shown per user type on profile/detail views are deferred to the PRD.
- Whether edit/delete on eventos/noticias extends to the post's own author or stays admin-only needs a decision during PRD.
- Moderation, editing, and media support for the new "publicaciones" feature are undefined — needs PRD-level design.
- Chart/visualization approach for Reportes/Indicadores is unchosen (no charting library currently in the stack).
