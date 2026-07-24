---
title: ARCHITECTURE-SPINE.md good-spine checklist review
reviewed: ARCHITECTURE-SPINE.md (architecture-Elite_Hub-2026-07-22)
against: prd-Elite_Hub-2026-07-19/prd.md, .memlog.md
date: 2026-07-22
---

# Review: ARCHITECTURE-SPINE.md vs. good-spine checklist

Scope note honored: this is a build-substrate/feature-altitude spine for a solo dev + BMAD
agents, not a stakeholder document. Findings below are about **divergence risk for the level
below** and **factual accuracy against the brownfield**, not prose/completeness style.

## Verdict

Solid on tech verification, brownfield ratification of the *drift/consistency* items (Prisma
singleton, error-shape, package-manager, E2E suite), and PRD capability coverage at the
section level. It has one high-severity gap: the spine is silent on how FR-3 (type
immutability — the PRD's own "highest-priority fix") is actually enforced, and its own ER
diagram misstates the real `Usuario`→`Informacion`→`TipoUsuario` relationship the fix must be
built on. A second, related gap: no shared-source-of-truth convention for the PRD's four new
fixed-value lists (deporte, género, país, catálogo categories), even though the existing
codebase already demonstrates exactly the divergence this would cause.

## Findings

### 1. [HIGH] FR-3 type-immutability has no AD, guard, or Deferred entry — and the brownfield already violates it

- **What the PRD requires:** FR-3 — "Once a Usuario's TipoUsuario is set at registration, it
  cannot be changed by the Usuario or... by any in-app self-service action." The PRD frames
  this (§5.1) as *the* highest-priority fix — "every downstream capability... depends on type
  being captured correctly at account creation and remaining permanent thereafter."
- **What's actually in the code today:** `server/api/profile/index.put.ts` (lines 91-100)
  accepts `informacion.tipoUsuarioId` from the request body and passes it straight through to
  `prisma.informacion.update()` with no guard — i.e., the exact self-service type-change path
  FR-3 prohibits is live in production code right now.
- **What the spine says:** AD-1's "type-gating" guard is scoped to FR-20 (Marca-only catalog
  creation), not to blocking `tipoUsuarioId` mutation on profile edit. No other AD, Convention,
  or Deferred entry mentions immutability enforcement. The Capability Map row for §5.1 covers
  only the registration *create* path ("AD-1; new-model naming convention"); the profile-edit
  row (§5.6, FR-18) lists AD-1/AD-4/AD-5, none of which touch this.
- **Why this is a real divergence risk, not nitpicking:** registration (new handler) and
  profile-edit (existing handler being extended) are built by different stories. Without a
  named rule ("the profile-update allowlist never includes tipoUsuarioId" or equivalent),
  nothing stops the existing pass-through bug from surviving MVP delivery while the rest of the
  app assumes type is locked.
- **Compounding structural gap:** the spine's own ER diagram (line ~147) draws
  `Usuario }o--|| TipoUsuario : "has (immutable)"` as if it's a direct relationship. The actual
  schema (`prisma/schema.prisma`) has no such edge: `Usuario.informacionId → Informacion`
  (nullable) `→ Informacion.tipoUsuarioId → TipoUsuario` — two hops through an optional,
  non-unique-constrained join. The spine neither fixes this indirection nor flags it as an open
  question; it just draws the relationship it wishes existed. Enforcing "exactly one immutable
  TipoUsuario per Usuario" through this indirection (Informacion can currently be created without
  a Usuario, and `informacionId` isn't declared unique, so nothing today prevents two Usuarios
  sharing one Informacion row) is a materially harder problem than the diagram implies, and it's
  the literal foundation every other feature in the PRD depends on.
- **Recommendation:** add either a Rule under AD-1 ("profile-update handlers never accept
  `tipoUsuarioId`/`informacion.tipoUsuarioId` in the write payload") or a dedicated AD, and
  correct the ER diagram to reflect the real (or intentionally-changed) relationship shape.

### 2. [MEDIUM] No shared source-of-truth convention for the PRD's new fixed-value lists (deporte, género, país, catálogo categories)

- FR-2/FR-19 (deporte), FR-38 (género, país), FR-39 (catálogo categories) each introduce a
  "select from a fixed list" requirement that must stay identical everywhere it's used
  (registration form, directory filter, seed data, any admin surface).
- The spine's Capability Map row for §5.7 attributes this to "AD-1; existing fixed-list
  pattern" as if there's a reusable convention to extend. There isn't one in a form worth
  reusing: `app/pages/deportistas.vue` (lines 109-122) hardcodes its own inline sport array
  ("Fútbol, Baloncesto, Tenis, Natación, Atletismo, Ciclismo, Voleibol, Gimnasia, Boxeo, Yoga,
  CrossFit, Más deportes") that **does not match** the PRD's own canonical list (§3 Glossary /
  FR-19: "fútbol, baloncesto, ciclismo, running, crossfit, voleibol, gimnasia, boxeo, natación,
  otros" — different membership, e.g. Tenis/Atletismo/Yoga vs. running/otros). The DB has a
  `Deporte` model but it's unseeded and unused by this page. So the "existing pattern" the
  spine points to is itself the divergence the checklist warns about, and the spine describes
  it as settled instead of fixing it.
- No AD/Convention says where the canonical list for each of these four fixed-value fields
  should live (DB-seeded table + shared query vs. a single shared TS constants module vs.
  per-field enum) — leaving four independent stories free to each hardcode their own array, as
  already happened once.
- **Recommendation:** add a Consistency Convention naming the single source of truth for
  fixed-value lists (e.g., "all fixed-value select lists — deporte, género, país, catálogo
  categoría — are defined once in `server/utils/constants.ts` [or DB-seeded + fetched], never
  inlined per-page") and reconcile `deportistas.vue`'s existing list against FR-19's canonical
  values.

### 3. [LOW-MEDIUM] AD-4 / AD-5's enforcement mechanism is asserted, not designed

- AD-4 ("the shared authorization guard re-checks `activo`/`isAdmin` against the DB on every
  authenticated request") and AD-5 (activeUserFilter mandatory on every collection endpoint) are
  both stated as facts about what will happen, but nothing forces a handler to actually call the
  shared guard — each handler today calls `getServerSession(event)` independently
  (confirmed in `profile/index.get.ts`, `profile/index.put.ts`, etc.), and there's no Nitro
  `server/middleware/*.ts` centralizing this. AD-4 binds "all authenticated endpoints" and is
  explicitly tied to a security property (FR-36: admin block "must take effect immediately") —
  a single new handler that calls `getServerSession` directly instead of the shared guard
  silently reintroduces the stale-JWT bug the AD exists to close, and nothing in the spine would
  catch that at review time.
- This is the same class of risk AD-1 explicitly designed shared guards to prevent for other
  rules; AD-4/AD-5 name the guard but not the mechanism that guarantees universal adoption.
- **Recommendation:** either specify a Nitro global middleware enforcing the DB-recheck (removing
  reliance on per-handler discipline), or explicitly note in Consistency Conventions that every
  new/touched authenticated handler must import the shared guard, as a checkable rule.

### 4. [INFO — not a gap] Operational/environmental envelope is handled correctly

Deployment/hosting is explicitly called out as an open question with a rationale trail in the
memlog (user-deferred, Render evaluated and not adopted) and echoed in the spine's "Deployment/
environment gap" callout plus the Deferred section — this satisfies the checklist's concern
about a silently-missing operational dimension. The narrower "operations" sub-dimension
(logging/monitoring/error-tracking/backups) isn't mentioned even as a Deferred bullet, but given
the PRD's explicit non-goals (no CI/CD, no formal ops program, solo-dev context), this reads as
legitimately out of scope rather than an oversight — flagged here only for completeness, not as
an actionable finding.

## Checklist items verified clean (no findings)

- **Named tech verified-current:** independently re-verified via web search (not relying on the
  memlog's self-report). Cloudflare R2 free tier (10GB storage, 1M Class A / 10M Class B ops,
  zero egress, no expiry) and Nuxt Charts (nuxtcharts.com, active Nuxt module, Tailwind-native)
  both check out as described — AD-2 and AD-3 are accurate as of July 2026.
- **Brownfield ratification (mechanical items):** spot-checked against actual source —
  `content/[page].get.ts` / `.put.ts` do instantiate their own `PrismaClient` as claimed;
  `message` (not `statusMessage`) is genuinely the majority error-shape pattern (41 occurrences
  across more handlers vs. 9, confirming the spine's canonical choice is the correct one to
  ratify, not an arbitrary pick); stray `package-lock.json` alongside `pnpm-lock.yaml` confirmed
  present at repo root; `e2e/test/` confirmed as an unwired nested npm project (own
  `package.json`/`package-lock.json`) exactly as AD-7 describes.
- **PRD capability coverage:** every §5.1-§5.14 feature section has a Capability → Architecture
  Map row; Must-tier and Should-tier FRs are all traceable to an AD or Convention (modulo Finding
  1 above, which is a depth/enforceability gap within an otherwise-covered row, not a missing
  row).
- **Deferred section load-bearing check:** hosting, full new-model attribute lists, secrets
  strategy, CI/CD, and RBAC deferrals were all cross-checked against the PRD (§8 Non-Goals, §11
  Open Questions) and the memlog's decision trail — each is a genuine user-confirmed non-goal or
  explicitly-deferred item, not a load-bearing decision quietly waved off.
