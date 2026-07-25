---
title: Reconciliation Report — Elite Hub UX Contract vs. Source Inputs
scope: Read-only check. No edits made to DESIGN.md / EXPERIENCE.md.
checked-against:
  - SPEC.md, glossary.md, functional-requirements.md (specs/spec-Elite_Hub/)
  - ARCHITECTURE-SPINE.md (architecture-Elite_Hub-2026-07-22/)
  - prd.md §2.3 (UJ-1..UJ-6), §5.13 (FR-33/34) (prd-Elite_Hub-2026-07-19/)
date: 2026-07-24
---

# Reconciliation Report — Elite Hub UX Pair vs. Source Inputs

Scope note: the 14 `[ASSUMPTION]` tags in DESIGN.md/EXPERIENCE.md are already reviewed/accepted and are **not** re-litigated here. This report only looks for load-bearing source content that failed to land in the UX pair.

## 1. CAP-1..CAP-14 → EXPERIENCE.md home check

All 14 capabilities have at least a nominal home in EXPERIENCE.md's Information Architecture and/or Component Patterns tables:

| CAP | Home in EXPERIENCE.md |
|---|---|
| CAP-1 Registration | IA "Login / Register" row; Flow 1 |
| CAP-2 ContentEditor fix | Component Patterns "ContentEditor modal" row |
| CAP-3 Contact form persistence | IA "Mensajes de Contacto inbox" row; State Patterns "Contact form submit success" |
| CAP-4 Homepage stats | IA "Home" row ("live stats"); Flow 6 resolution (cross-check with Reportes) |
| CAP-5 Open Eventos/Noticias creation | IA "Eventos/Noticias" row |
| CAP-6 Directory/profile system | IA "Directorios" + "Perfil propio" rows; Component Patterns "Directory card"/"Detail view" |
| CAP-7 Deportista sport filters | Component Patterns "Sport/category filter chips" |
| CAP-8 Marca catalog | IA "Catálogo" row; Component Patterns "Catalog item card" |
| CAP-9 Nutricionista reviews | Component Patterns "Reseña row"; Flow 3 |
| CAP-10 Publicaciones/feed | Component Patterns "Publicación card"/"Publicación composer"; Flow 4 |
| CAP-11 Reportes/Indicadores | IA row; Flow 6 |
| CAP-12 Settings/theme | IA "Settings" row; Component Patterns "Theme toggle" |
| CAP-13 Visual overhaul | Responsive & Platform section (FR-34 gate) — **see Finding 1, thin for admin** |
| CAP-14 Storage migration | State Patterns "Upload in progress" row |

**No capability is completely unhoused.** However, two of them (CAP-6's admin deactivate/reactivate action, and CAP-13's admin-panel slice) are homed only in the loosest sense — see Findings 1 and 2 below.

## 2. FR-33/34 named surfaces — is "admin panel" actually covered?

**Finding 1 (significant): Admin panel is present in DESIGN.md's brief but essentially absent from EXPERIENCE.md's Responsive & Platform and Component Patterns tables.**

- FR-33 explicitly names "admin panel" as one of the visual-refresh surfaces, and FR-34 makes breakpoint-preservation a hard release gate "across every touched surface" (functional-requirements.md CAP-13).
- EXPERIENCE.md's Responsive & Platform breakpoint table gives explicit, per-breakpoint behavior for directories, feed, catálogo, and Reportes/Indicadores (e.g. "Reportes/Indicadores: chart above numeric counts, stacked" at `<md`, "side-by-side" at `lg`) — but has **zero rows or mentions of "admin panel," "Gestión de usuarios," or "Mensajes de Contacto inbox"** anywhere in that table.
- Component Patterns table is the same story: every other admin surface Reportes/Indicadores gets its own row with real behavioral detail; general admin (user management, contact-message inbox) gets none, aside from the ContentEditor modal (which lives on Settings, not really "the admin panel").
- This matters more than it looks: DESIGN.md itself changes admin's layout (`max-w-7xl`/`max-w-5xl` → sitewide `page-shell` `120rem`, `rounded-lg shadow-md` card variant retired) — a structural width/shape change that is exactly the kind of thing FR-34's breakpoint gate exists to catch, yet EXPERIENCE.md's verification table never mentions it.

## 3. ARCHITECTURE-SPINE ADs — UI-visible consequences check

**Finding 2 (significant): AD-5's `bypassForAdmin` machinery exists specifically so admin can deactivate/reactivate accounts, but the actual deactivate/reactivate control has no Component/State Pattern home.**

- CAP-6's success criterion is literally built around deactivating and reactivating accounts. FR-36 has admin deactivate a bad-faith reviewer. AD-5 defines `activeUserFilter(..., { bypassForAdmin: true })` for exactly this reason.
- EXPERIENCE.md covers the *downstream consequence* well ("Deactivated-account content" state pattern — content hidden, restored on reactivation) and covers admin's ability to *reach* a deactivated Usuario (Flow 5, via `bypassForAdmin`).
- It never describes the control itself: where does admin actually flip `activo`? Is it a toggle on "Gestión de usuarios," a button on the admin profile-edit view, does it have its own confirm copy/success state (distinct from the generic "Admin moderation action" row, which only mentions Reseña retract + content delete, not account deactivation/reactivation)? This is a real gap, not a stylistic one — every other admin moderation action (retract, delete) gets an explicit State Pattern row; deactivate/reactivate does not.

**Finding 3 (moderate): AD-4 (DB-recheck on every request) has a UI-visible consequence missing from State Patterns.**

- AD-4's whole point is that `activo`/`isAdmin` are rechecked from the DB on *every* request so a block "takes effect immediately" (binds FR-36). That means a Usuario who is deactivated while they still have an open session will have their very next authenticated action rejected mid-session.
- EXPERIENCE.md's State Patterns table has no entry for this — no "you've been logged out because your account was deactivated" message/redirect state. It documents the effect on *other* people's view of that Usuario's content (hidden) but not what that Usuario's own live UI does when their next request 401s.

**Finding 4 (minor, explicitly requested check): AD-2's `Promise<string[]>` convention vs. FR-6 profile photo.**

- AD-2 is explicit: the storage client "always returns `Promise<string[]>` — an array, even for single-image cases (e.g. profile photo) — so every resource's image field is uniformly an array at the Prisma layer."
- EXPERIENCE.md's Catalog item card row correctly reflects this ("image(s)").
- But every mention of the profile photo (Directory card: "Photo"; Flow 1: "uploads a profile photo") treats it as unambiguously singular, with no note anywhere that the underlying field is actually `string[]` — no stated convention for which array element the UI displays, or what happens if the array is empty (pre-upload placeholder) or, in principle, contains more than one URL. This isn't necessarily wrong (displaying element 0 is the obvious choice), but it's the one place in the document where the "conceptually single, actually array" nuance the source material calls out is silently smoothed over rather than acknowledged.

**AD-1, AD-3, AD-6 spot-checked clean:** action→role matrix is consistently referenced via `useResourcePermissions` across Publicación/Event/Reseña rows; AD-3's vue-chartjs is named directly in Flow 6; AD-6's composable is named as the explicit source of truth in the Foundation section. AD-7 (E2E) and AD-8 (beyond Findings above) have no further UI-visible consequences worth flagging — AD-8's "entry point absent, not disabled" pattern is correctly generalized (Flow 1 resolution, Flow 2 edge case, "Type-gated action unavailable" state row).

## 4. PRD UJ-1..UJ-6 vs. Key Flows 1-6

Side-by-side read of all six pairs. All six flows are faithful expansions of their PRD journeys — no concrete PRD detail (specific field, specific edge case, specific phrase) was found dropped or changed in meaning. Two small observations, neither load-bearing:

- **UJ-2 → Flow 2:** PRD's closing framing — "no payment flow exists yet, so the brand treats this as an ad listing" — doesn't survive into Flow 2's Resolution (which just says deportistas contact the brand directly). Pure narrative color, not a testable requirement; nothing is lost functionally.
- **UJ-4's originally-undefined edge case** ("post-suspension content handling is undefined") is *not* dropped — it's correctly carried forward as *resolved* via FR-40, per functional-requirements.md's own note that this edge case was resolved by the deactivation cascade. Flagging this only so it isn't mistaken for a silent resolution; it's a documented, intentional one.

All other beats (Flow 1's registration/T&C/filter/detail/type-lock; Flow 3's inline review + duplicate-check + retract; Flow 5's admin stopgap + visible framing; Flow 6's chart/counts/cross-check) match their PRD source with only additive UX detail.

## 5. SPEC Open Questions / Assumptions vs. Key Flows / State Patterns

Checked all 9 Open Questions and 4 Assumptions against EXPERIENCE.md's Key Flows and State Patterns for silent resolution.

**No silent contradictions found.** Specifically:

- The 4 SPEC Assumptions (no-partial-account on abandon, scroll-position preservation, most-recent-first feed, theme persistence) are carried forward by explicit citation ("...SPEC.md Assumptions," "...FR-31 convention") rather than re-decided — consistent, not a new resolution.
- Of the 9 Open Questions, the ones with any UX surface at all are handled correctly as still-open: Flow 3 explicitly states "No edit path exists yet for her own posted review... (Open Question, carried forward as a known gap, not solved here)" — this is the one Open Question EXPERIENCE.md touches, and it touches it by naming it open, not resolving it.
- Self-review exclusion, last-admin-deactivation guard, admin promotion path, and retracted-review slot-freeing are simply never mentioned in EXPERIENCE.md — correctly left silent rather than silently decided either way.
- One appropriate (not silent) resolution: ARCHITECTURE-SPINE's Deferred list flagged "FR-33's sitewide hover micro-interaction has no shared component/utility named yet" — DESIGN.md's `{components.card}` + EXPERIENCE.md's Interaction Primitives ("Hover card lift... is the one hover affordance on every content card") closes this gap directly and appropriately; this is the UX pair doing its job, not overreaching.

## Summary of Findings (ranked)

1. **[Significant]** Admin panel (Gestión de usuarios / Mensajes de Contacto inbox) has no row in EXPERIENCE.md's Responsive & Platform breakpoint table or Component Patterns table, despite FR-33 naming it and FR-34 gating every touched surface on breakpoint verification.
2. **[Significant]** The admin deactivate/reactivate-account control (central to CAP-6, FR-36, AD-5's `bypassForAdmin`) has no Component/State Pattern describing where it lives or what it looks like — only its downstream content-hiding consequence and admin's ability to reach a deactivated profile are documented.
3. **[Moderate]** AD-4's DB-recheck-every-request behavior implies a live-session user gets kicked out immediately upon deactivation; no State Pattern covers what that user sees.
4. **[Minor]** AD-2's array-return convention is correctly reflected for catalog item images but silently smoothed to "singular" for the FR-6 profile photo, with no stated mapping/fallback convention.

Everything else checked (CAP-1..14 general homing, UJ-1..6 fidelity, SPEC Open Questions/Assumptions non-contradiction) came back clean.
