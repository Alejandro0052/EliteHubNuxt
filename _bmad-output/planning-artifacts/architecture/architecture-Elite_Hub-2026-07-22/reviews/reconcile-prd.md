---
title: PRD Reconciliation — Elite Hub Architecture Spine
target: ARCHITECTURE-SPINE.md (architecture-Elite_Hub-2026-07-22)
sources:
  - _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/prds/prd-Elite_Hub-2026-07-19/prd.md
  - _bmad-output/planning-artifacts/prds/prd-Elite_Hub-2026-07-19/addendum.md
method: >
  Not a re-run of the rubric/web-verify/adversarial gate (already applied, 8 ADs
  ratified). Narrower pass: does the spine carry forward quiet-but-load-bearing
  PRD content — tone, rationale, explicit constraints, "why" — that its terse
  AD/convention structure dropped, even though a future epics/stories author
  reading only the spine would need it? Checked PRD §6/§7 guardrails, §9.3
  Testing Track framing, §5.13 Visual/UI Overhaul, §1 Vision framing on hosting,
  and a full FR-1..FR-43 presence sweep against the spine.
status: draft
date: 2026-07-22
---

# PRD Reconciliation — Elite Hub Architecture Spine

## Verdict

The spine is structurally sound and the mechanical bindings (AD Binds fields,
Capability→Architecture Map) are accurate. But five things the PRD treats as
real, load-bearing constraints are either invisible in the spine or visibly
downgraded when they cross into it — none are structural inconsistencies (that
gate already ran), all are **information loss**: a future reader working from
the spine alone would not know these constraints exist.

---

## Finding 1 — FR-33 (Visual/UI Overhaul scope) never appears; its one named
mechanism is demoted from Should-tier FR to "opportunistic, not blocking"

The Capability→Architecture Map row for §5.13 reads:

> `§5.13 Visual/UI Overhaul | cross-cutting app/** components/pages | Consistency: FR-34 responsiveness preserved; no new AD`

This cites **FR-34** (responsiveness) but never **FR-33** — the FR that actually
defines the overhaul's scope: named surfaces (directories/detail views,
Eventos/Noticias listing, admin panel, login/register incl. removing the
`Jugador.jpeg` placeholder), and "a sitewide hover micro-interaction (lift/raise)
on cards." FR-33 sits in the PRD's Should-tier scope (§9.2) alongside FR-34, not
as a nice-to-have.

The hover micro-interaction — the one concrete, reusable piece of FR-33 with
real architectural shape (a shared utility, applied sitewide) — surfaces only
in the spine's **Deferred** section, bundled with unrelated adversarial-review
holes as: "worth closing opportunistically during epic/story work, not
blocking." That's a real downgrade: the PRD specifies it as an in-scope,
testable FR; the spine's only mention of it frames it as optional cleanup.

Also dropped: PRD §4's explicit tonal bar — "Reportes/Indicadores specifically
is called out as needing to be visually polished ('muy agradable de ver'), a
materially higher bar than the rest of the admin surface." The spine's §5.11
row ("AD-3; aggregates.ts shared with §5.4 (SM-4)") governs Reportes purely as
a charting-library and shared-aggregate concern — nothing carries forward that
this specific view needs to look meaningfully nicer than the rest of the admin
panel it lives in. A story-writer building §5.11 from the spine alone would not
know Reportes has a higher visual bar than its siblings.

**Why it matters:** whoever writes the FR-33/FR-34 epic/stories from this spine
has no architectural anchor for the hover-interaction utility (so it may get
built ad hoc, once per component — exactly the pattern AD-6 exists to prevent
for permissions) and no signal that Reportes needs extra design effort.

---

## Finding 2 — Privacy stance (PRD §6/§7: full field visibility, no per-field
control) is not stated anywhere in the spine

PRD §7 Constraints: "Visibility is confirmed: the full field set is visible on
the detail view to any authenticated viewer... there is no field-level privacy
control (e.g., 'hide my phone number') in MVP; this is a deliberate scope cut,
not an oversight." PRD §6 NFR repeats this as a "confirmed decision, not an
open item," specifically flagging health-adjacent fields (fecha de nacimiento,
altura, peso, lesiones).

The spine has no AD, convention, or Capability Map note that states this. AD-5
(`activeUserFilter`) governs *whether a Usuario's content is visible at all*
(active/deactivated), and AD-6/AD-1 govern *edit/delete* permission — neither
addresses *field-level read* visibility. The §5.6 Capability Map row (Per-Type
Directory & Profile) cites AD-1/AD-4/AD-5/AD-8 but nothing about "detail view
returns the full field set, unredacted, to any authenticated viewer — do not
add field-level redaction."

**Why it matters:** this is a "confirmed decision" specifically because it was
debated (health data is involved) — silence in the spine means a future builder
of the profile-detail endpoint has to either rediscover this in the PRD or
guess. It's exactly the kind of quiet constraint (a deliberate non-restriction)
that's easy to accidentally over-build (someone adds a "hide my birthdate"
toggle unprompted) or under-build (someone gates fields behind ownership,
breaking UJ-1/UJ-3's premise that a patrocinador/reviewer can see everything).

---

## Finding 3 — AD-7 captures the mechanical "retire Python, wire Playwright"
move but drops the "real, tracked, non-gating, runs the whole MVP window"
framing

PRD §9.3: the Testing Track is explicitly *not* tiered Must/Should "because it
isn't gated on any individual FR's delivery — it runs alongside the feature
work for the whole MVP window, from now through Aug 22... explicitly a real,
tracked part of the MVP effort, not deferred to post-MVP maintenance." §8
Non-Goals reinforces the distinction: unit tests/CI/CD are out of scope, but
"this does *not* include E2E testing — see §9.3, a real, tracked, non-gating
effort, not something dropped."

AD-7 in the spine: "Binds: PRD §9.3 Testing Track... Rule: `e2e/test/`'s
Playwright project is the sole E2E suite... The Python/pytest suite is retired
entirely as part of MVP work." This is accurate but reads as a one-time
migration task. Nothing in AD-7 (or the Deferred section, which is the spine's
only other place ongoing/parallel work gets flagged) states that E2E work is
continuous across the whole window and non-gating on feature FRs — the one
distinction the PRD went out of its way to make twice (§8 and §9.3).

**Why it matters:** a sprint-planning pass working off the spine alone could
reasonably schedule E2E as a single early ticket ("migrate the suite") rather
than a parallel track that should show up in every epic's scope, contradicting
the PRD's explicit intent.

---

## Finding 4 — Infinite-scroll performance NFR (§6, tied to FR-16) has no home
anywhere in the spine, despite the PRD explicitly handing it to architecture

PRD §6 NFR — Performance: "Directory infinite-scroll must remain responsive as
the Usuario count grows; **batch size is a technical/architecture decision**,
not fixed here." This is the PRD explicitly deferring a decision to this exact
document. The spine never mentions infinite scroll, pagination, or batch size
— not as an AD, not as a Consistency Convention, not even in the Deferred
section (which is where the spine parks other undecided PRD-flagged items like
hosting and secrets management).

**Why it matters:** of everything the PRD explicitly says "architecture must
decide this," this is the one that got dropped rather than either decided or
explicitly parked. FR-15/16/17 (directory/infinite-scroll/detail-view) do
appear only as a generic Capability Map row ("§5.6 ... AD-1, AD-4, AD-5,
AD-8"), with no guard or convention touching the actual scroll/query-shape
mechanism the NFR is worried about.

---

## Finding 5 (minor) — Cost guardrail (§7) drives AD-2/AD-3's picks but the
spine never states the link

PRD §7 Cost: "no budget assumed for paid infrastructure... free/open-source-tier
solutions are the default expectation for architecture-level choices (charting
library, storage provider)." Addendum reinforces: "prefer free/open-source,
avoid paid charting SaaS" for the charting decision specifically.

AD-2 picks Cloudflare R2 (a paid-capable service with a generous free tier —
not literally open-source/free) and AD-3 picks vue-chartjs + chart.js (genuinely
free/open-source, no tension). Both are plausibly correct calls, but AD-2's
text gives zero cost-guardrail rationale — it discusses S3-compatible-SDK
mechanics and a Workers-runtime caveat, never why R2 over a paid alternative,
never that it fits within a free tier for a no-budget solo project. This is
lower-severity than Findings 1-4 (the outcome is very likely still guardrail-
compliant) but the reasoning trail from PRD constraint to concrete pick is
invisible in the artifact whose job is to carry exactly that kind of
downstream-binding rationale.

---

## Checked and found consistent (no gap)

- **PRD §1 Vision framing on hosting** (soft checkpoint, deploy-ready ≠
  deployed, "capable of being deployed" not "will be deployed," built with an
  eye toward real deployment but not a throwaway demo) — the spine's Deferred
  section ("Hosting/deployment platform — explicitly deferred by the user...
  revisit before or during FR-35 storage-migration work") and the "Deployment/
  environment gap" note under Structural Seed both stay neutral/descriptive.
  Neither reads as more urgent or more decided than the PRD implies.
- **Full FR-1..FR-43 sweep**: every FR number was checked for presence anywhere
  in the spine (Binds, Structural Seed comments, Capability Map prose,
  Consistency Conventions). Missing-by-number: FR-1, FR-2, FR-4, FR-5, FR-6,
  FR-7, FR-8, FR-9, FR-11, FR-13, FR-15, FR-16, FR-17, FR-25, FR-32, FR-33,
  FR-42. Of these, FR-33 (Finding 1) and the FR-16/§6-Performance pairing
  (Finding 4) are real gaps; the rest (registration field mechanics, stretch
  goals, UI copy, ContentEditor page-wiring specifics, especialidad field,
  Settings routing) are data/UI-copy-level details with no architectural shape
  of their own, reasonably left to Structural Seed's schema/page-level
  ownership rather than an AD.
