# Reconciliation: Brief (2026-07-16) vs PRD (2026-07-19)

Scope: compare `briefs/brief-Elite_Hub-2026-07-16/{brief.md,addendum.md,.memlog.md}` (source)
against `prds/prd-Elite_Hub-2026-07-19/{prd.md,addendum.md}` (final artifact).
PRD's own `.memlog.md` excluded per instructions.

## Overall assessment

The PRD is a faithful, unusually thorough expansion of the brief. Must/Should/Out-of-scope
tiering is preserved 1:1 (all 6 Must items map to §5.1–5.5; all 8 Should items map to
§5.6–5.14; every brief Out-of-scope bullet reappears in PRD §8). All 4 of brief.md's Open
Questions are resolved somewhere in the PRD (FR-2/FR-17/§7 for profile fields, FR-14 for
author/admin edit-delete, FR-26/FR-28 for publicaciones moderation/media, FR-29/addendum for
charting approach). Key rationale from addendum.md (e.g., marca catalog restriction tying to
future monetization, "muy agradable de ver" bar for Reportes/Indicadores, first-slice framing)
survives into the PRD largely intact. That said, four gaps are worth flagging.

## Gap 1 — Brief's "Testing Approach" track demoted into a Non-Goal with a dangling cross-reference

**Source:** brief.md has a dedicated top-level section, "Testing Approach (parallel track, not
gating)," structurally equal to Must/Should/Out-of-scope. It states explicitly: E2E tests
(Playwright/TS, replacing the pytest suite) run "alongside the Must/Should work... as an ongoing
track, not a blocking requirement... but it is a real, tracked part of this effort, not deferred
to the maintenance phase." .memlog.md reinforces this as a distinct, deliberate decision late in
the brief's discovery (separate from the Must/Should/Out tiering confirmation).

**PRD:** This entire section is compressed into one clause inside §8 Non-Goals: "Formal
unit/component test suite and CI/CD pipeline — not part of this MVP; E2E tests (Playwright,
TypeScript) progress as a parallel, non-gating track (§9)." The parenthetical "(§9)" points to
§9 MVP Scope (Must/Should lists) for elaboration, but §9.1 and §9.2 never mention E2E, Playwright,
or testing at all — the cross-reference resolves to nothing.

**Why it matters:** Lumping the E2E track under "Non-Goals" alongside CI/CD (which the brief does
defer wholesale) inverts the brief's framing. The brief was explicit that this is *not* an
excluded item — it's ongoing, tracked work the solo dev is committed to during the MVP window.
A reader of the PRD alone would reasonably conclude E2E testing is out of scope for this delivery,
which contradicts the source's stated intent.

## Gap 2 — New "account deactivation" capability with no basis in any source document

**PRD:** FR-40 ("Deactivated-account content hidden") and FR-36 ("admin can deactivate (block) the
Usuario") introduce an `activo` flag on Usuario, with cross-cutting hide/show behavior across
directories, home feed, catálogo, and eventos/noticias, plus an admin "block user" moderation
action. This is placed in the Should tier (§9.2) as if it were part of the agreed core loop.

**Source:** No mention of account deactivation, blocking, `activo`, or any moderation-beyond-
content-removal concept anywhere in brief.md, addendum.md, or .memlog.md. The brief's moderation
surface is limited to admin override on profile edits (password-reset stopgap) and implicit
content editing rights.

**Why it matters:** This is non-trivial net-new scope (a cross-cutting visibility rule touching
four feature areas) folded into the MVP scope list without being flagged as an addition beyond
the brief. Given the brief's own memlog explicitly worried about scope size ("this scope is
substantially larger than the original framing... timeline risk raised explicitly"), quietly
growing scope further during the PRD phase is exactly the kind of drift that discovery worried
about — even if it was confirmed in the PRD's own (excluded) discovery log, it's invisible against
the brief alone.

## Gap 3 — "Production intent" framing not present in, and arguably heavier than, the brief's own stakes

**PRD:** Vision (§1) states delivery is "built with production intent — not a throwaway academic
demo," and §6 Cross-Cutting NFRs opens with "this MVP is being built with real-deployment intent
(not a throwaway academic demo), so NFR rigor here is higher than a pure classroom exercise."

**Source:** brief.md frames this consistently as a "solo university project," with Aug 8 success
defined as "enough visible, working progress for meaningful professor feedback" and Aug 22 success
as making the app "genuinely deployable" (capability, not an actual deployment commitment).
.memlog.md's own decision log defines 'stable MVP' explicitly as "complete locally, ready to
deploy to a server, ready for professor feedback — **not necessarily actually deployed by the
deadline**." Nowhere does the source use "production intent" or contrast itself against a
"throwaway academic demo."

**Why it matters:** This isn't a dropped requirement but an inserted framing that raises the bar
implied for NFR rigor beyond what the brief asked for. It also silently drops the memlog's explicit
reassurance that actual deployment isn't required by the deadline — a nuance a solo student on a
deadline would likely want preserved rather than re-litigated.

## Gap 4 — Aug 8 "soft checkpoint, not a hard wall" nuance softened

**Source:** .memlog.md: "Aug 8 is a soft checkpoint (functional-cycle demo), not a hard wall — can
extend ~2 weeks to Aug 22 for true stable MVP if needed." brief.md's Executive Summary frames the
two dates as "two checkpoints rather than one deadline."

**PRD:** §1 Vision states both dates side by side ("Delivery targets a functional checkpoint on
2026-08-08 ... and a stable, genuinely deploy-ready MVP by 2026-08-22") without reiterating that
Aug 8 is explicitly non-binding. §9.2's "(if the extra two weeks are needed)" partially preserves
this, but only in the Should-tier scope section, not in the Vision/framing section where a reader
would first form an impression of deadline rigidity.

**Why it matters:** Minor, but for a solo student under real time pressure, the distinction between
"soft checkpoint" and "deadline" is exactly the kind of psychological/planning nuance easy to lose
in a flattened FR-oriented document — worth a one-line restatement in Vision or §10 Success Metrics.

## Non-gaps checked (for completeness)

- Must/Should/Out-of-scope tiering: no unexplained shifts found; all items map cleanly.
- Brief's 4 Open Questions: all addressed in the PRD (FR-2/FR-17/§7; FR-14; FR-26/FR-28; FR-29 +
  addendum charting options).
- Brief's Out-of-scope list vs PRD §8 Non-Goals: full 1:1 coverage, including the less-obvious
  items (RBAC unused, auth package overlap, no transactional writes, Prisma client inconsistency).
- Marca catalog monetization rationale, Reportes "muy agradable de ver" bar, nutricionista
  review-gating stance: all rationale preserved or reasonably extended, not flattened.
