---
title: Adversarial Review — Elite Hub Architecture Spine
target: ARCHITECTURE-SPINE.md (architecture-Elite_Hub-2026-07-22)
sources:
  - _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/prds/prd-Elite_Hub-2026-07-19/prd.md
method: >
  For each AD and Consistency Convention, construct two units one level down
  (handlers / models / pages) that each obey the letter of the rule but build
  incompatibly — clashing shapes, ambiguous ownership, dual enforcement paths,
  or no enforcement path at all. Every surviving pair is a hole the spine
  needs a new or tightened AD to close.
status: draft
date: 2026-07-22
---

# Adversarial Review — Elite Hub Architecture Spine

## Verdict

The spine's paradigm choice (Transaction Script + shared guards) is sound, but
four of the five named shared guards (`authorOrAdmin`, `activeUserFilter`,
`reviewLimit`, the DB-recheck in AD-4) are named without a fixed **contract**
(signature, parameters, which relation/field they operate on, what "action"
means). Because the PRD's actual permission model is *not* uniform across
resources — Publicaciones give admin delete-only, Catálogo/Eventos give admin
edit+delete, Reseñas give admin retract-only-no-self-edit — a guard built
against one resource's shape will silently misapply to another while still
being "the same shared guard, imported wherever needed." That is the spine's
sharpest failure mode: **it mandates sharing without specifying what is being
shared.** A secondary, DB-level failure mode: no relationship in the new
Prisma models (`Publicacion`, `Resena`, `ItemCatalogo`) is constrained at the
schema level — every type/ownership rule (Marca-only catalog, Nutricionista-only
review target, active-user visibility) lives *only* at the guard call site, so
any code path that doesn't route through the named guard (an admin bulk tool,
a differently-shaped sibling endpoint, a nested `include`) produces silently
invalid or inconsistently-filtered data with nothing at any lower layer to
catch it.

---

## AD-1 — Transaction Script + Authorization Guards

### Pair 1: `authorOrAdmin` — action scope is not part of the contract

AD-1's rule text: "author-or-admin ... implemented exactly once as a shared
guard function in `server/utils/`, imported wherever needed, never
reimplemented inline." It treats "author-or-admin" as *one* cross-cutting
rule. It is not — the PRD specifies **two different action-scoped variants**:

- FR-14 (Eventos/Noticias) and FR-43 (Ítems de Catálogo): admin may **edit or
  delete** any resource, regardless of authorship.
- FR-28 (Publicaciones): admin may **delete** any resource, but only the
  author may **edit** — admin editing another user's Publicación is not
  granted anywhere in the PRD.

**Unit A** — `server/api/catalogo/[id].put.ts`, built first, imports
`authorOrAdmin(resource.autorId, session)` from `server/utils/guards/` and
gates the PUT with it. Correct per FR-43.

**Unit B** — `server/api/publicaciones/[id].put.ts`, built by a second
contributor (or the same one, reusing the pattern from Unit A because AD-1
says "imported wherever needed") calls the *same* `authorOrAdmin()` guard on
the edit route. Both units "import the same shared guard, never reimplement
inline" — the letter of AD-1 is satisfied by both. But Unit B now lets admin
edit any user's Publicación, which FR-28 forbids. The guard's boolean
contract (`isAuthor || isAdmin`) cannot express "admin: delete only" without
an `action` parameter that AD-1 never specifies.

**Close with:** `authorOrAdmin(resource, action: 'edit' | 'delete', session)`
— action-scoped by contract, with the action→role matrix pinned per resource
type in the spine itself (a small table: Publicaciones=author-edit/either-delete,
Eventos/Noticias=either-edit/either-delete, Catálogo=either-edit/either-delete,
Reseñas=no-edit/admin-retract-only).

### Pair 2: `requireType`/type-gating — DB-enforced or guard-only?

FR-20: only Marca-typed Usuarios may create ItemCatalogo, "and only for their
own Marca profile." The spine's ER diagram labels the relation `Usuario
||--o{ ItemCatalogo : "owns (Marca)"` but this is a *diagram label*, not a
schema constraint — Deferred explicitly punts full schema to "seed owned by
code."

**Unit A** — `server/api/catalogo/index.post.ts` calls
`requireType(session, 'MARCA')` before insert. Correct, and the only code
path most reviewers will think about.

**Unit B** — a plausible admin moderation/reassignment surface (the PRD's own
UJ-5 establishes "admin has generic override edit access" as a pattern, and
FR-18 already grants admin edit rights on Usuario/profile records) — e.g. an
admin catalog-moderation edit endpoint that lets admin reassign an item's
owner (`marcaId`) as part of cleanup, or a seed/fixture script producing demo
data (plausible given "seed owned by code" is explicitly the model's status).
Neither of these obviously routes through `requireType`, because that guard
is framed around *creation by the actor*, not *reassignment of an existing
row's owner field*. Nothing in the schema stops `ItemCatalogo.marcaId`
pointing at a Deportista. Two independently-built admin tools can each decide
differently whether reassignment revalidates the type constraint — one
re-checks, one doesn't — and both are "using the guard wherever needed" by
their own author's reading, since AD-1 never says the constraint must also be
re-asserted on update/reassignment paths, only on the named creation FRs.

The identical shape recurs for `Resena.nutricionistaId` — the PRD requires
the review *target* be a Nutricionista (§3 Glossary: "the only type that
receives Reseñas"), but nothing pins whether that's a DB check, a guard
invoked only on the "leave review" POST, or nothing at all on any secondary
path (e.g., a future admin "create test review" tool, or a bug in a
differently-implemented review-edit stub).

**Close with:** state explicitly whether type constraints are guard-only
(current de facto answer) or add a Prisma-level partial constraint /
application-level invariant check runs on **every** write path, not just the
FR-named creation endpoint. At minimum, name the constraint's enforcement
point in the spine rather than leaving it inferable only from the diagram
label.

---

## AD-2 — Storage: Cloudflare R2

### Pair 3: `storage.ts`'s return contract is unspecified — single file vs. array

FR-6 (profile photo) needs exactly one image per Usuario. FR-21 (Ítems de
Catálogo) needs "one or more images" — plural, explicitly.

**Unit A** — profile-photo upload (built first, simplest case) implements
`storage.ts`'s canonical function as `uploadFile(buffer, filename):
Promise<string>` — one file in, one URL out — and the Usuario model gets
`fotoUrl: String`.

**Unit B** — catalog-item image upload, built against the same `storage.ts`
export (AD-2 says "all uploads go through a single storage client" — it does
not say the client's function signature is multi-file-aware). The second
contributor either (a) loops `uploadFile()` client-side per image and invents
an ad hoc joining/serialization scheme for `ItemCatalogo.imagen(es)` that no
other code knows about, or (b) extends `storage.ts` with a second, differently-
named function (`uploadFiles`) that the first contributor's profile-photo
code never adopts. Either way, "single storage client" (AD-2, satisfied) does
not imply "single upload contract" — the two features now carry two different
answers to "what does an image field look like in Prisma" (`String` vs.
`String[]`), discovered only when someone tries to reuse upload UI/components
across both.

### Pair 4: filename convention doesn't fix upload/insert ordering

Convention: `{resource}-{id}-{timestamp}{ext}`. For any *create* flow where
the file is attached before the record exists (catalog item creation,
publicación image), `{id}` doesn't exist yet at upload time.

**Unit A** generates a client-side UUID pre-insert, names the file with it,
uploads first, then creates the DB row passing that UUID as the primary key.

**Unit B** creates the DB row first (Prisma default cuid/autoincrement),
gets a real id back, uploads second using that id in the filename.

Both satisfy the naming convention to the letter. But they have opposite
partial-failure behavior: Unit A can leave an orphaned R2 object with no DB
row if insert fails after upload; Unit B can leave a DB row with a dangling/
missing image URL if upload fails after insert. NFR §6 already flags "no
transactional writes for compound file-upload + DB-write" as a known,
deferred gap — but the convention doesn't even pick one ordering, so two
create-flows built independently will diverge on *which* half of the
operation is allowed to fail silently, producing inconsistent debugging/
support stories across features.

**Close with:** pin the upload/insert ordering (recommend: insert-first with
a placeholder/null image column, then upload, then patch — cheapest failure
mode to detect) as a Consistency Convention, and pin `storage.ts`'s function
signature (specifically: does it accept `File[]` and return `string[]`
always, even for the single-image case, so every resource's image field is
uniformly an array at the Prisma layer?).

---

## AD-3 — Charting: Nuxt Charts (and the un-named shared aggregate)

### Pair 5: no guard/util is named for "the shared aggregate," despite SM-4 requiring it

The Capability → Architecture Map rows for §5.4 and §5.11 both say "shares
aggregate source with" each other — but this is a *description*, not a rule
bound to any AD or Consistency Convention, and no function appears in the
Structural Seed for it (unlike `activeUserFilter`/`authorOrAdmin`/etc., which
are named files under `server/utils/guards/`).

**Unit A** — `app/pages/index.vue`'s stats section (FR-12, public homepage)
queries Usuario counts grouped by TipoUsuario, and — because it's a
public-facing view bound by AD-5 — correctly applies `activeUserFilter()` so
deactivated users don't inflate the public count.

**Unit B** — the admin Reportes/Indicadores view (FR-29/30) is admin-only, so
its author reasonably reads AD-5 ("public-facing views") as not applying, and
omits the filter, showing admin the *true* total including deactivated
accounts (arguably more useful for an admin dashboard).

Both are defensible, independent readings of what "the" aggregate should
count. Both use Nuxt Charts / a `groupBy` query correctly per AD-3. But SM-4
explicitly demands these two counts "never visibly diverge" — and the PRD's
own §11 Deferred list confirms this exact question ("whether deactivated
Usuarios count toward homepage/Reportes aggregates") was *never resolved*.
The spine inherits an unresolved PRD ambiguity and, instead of closing it,
gives it two independent construction sites with no shared function to force
agreement.

**Close with:** a named `server/utils/aggregates.ts` (or equivalent) shared
query function, elevated to the same tier as the four named guards, with an
explicit decision on whether deactivated Usuarios count.

---

## AD-4 — Auth freshness: DB-recheck on every request

### Pair 6: "the shared authorization guard" has no file of its own

AD-4's rule: "The shared authorization guard (AD-1) re-checks `Usuario.activo`
and `Usuario.isAdmin` against the DB on every authenticated request." It
parenthetically points back at AD-1, implying the DB-recheck lives *inside*
the same guard(s) AD-1 names. But the Structural Seed's `guards/` listing is:
`authorOrAdmin, activeUserFilter, requireType, reviewLimit` — four
resource/business-rule guards, none of which is a session/auth-freshness
primitive, and no `server/middleware/` (Nitro global middleware) entry
appears anywhere in the Structural Seed either (only the frontend
`app/middleware/admin.ts` is listed).

**Unit A** — a contributor building `authorOrAdmin` folds a
`prisma.usuario.findUnique({ where: { id }, select: { activo, isAdmin } })`
call into the top of that guard, satisfying AD-4 for every route that happens
to call `authorOrAdmin`.

**Unit B** — a contributor building a route that touches none of the four
named guards (e.g. `GET /api/usuarios/me` — "view my own profile," FR-18,
which needs no author-or-admin check since it's always self, no type-gate,
no review-limit, no active-user-filter because you can always see your own
record) never triggers a DB recheck at all — the route trusts
`session.user.isAdmin`/whatever the JWT carries, because AD-4's only named
enforcement points (the four guards) never fire on this route. This directly
contradicts AD-4's own scope ("all authenticated endpoints"), and — worse — a
just-blocked admin (FR-36: "a blocked Usuario cannot log in or perform
authenticated actions") could still hit this route successfully on a stale
session until the JWT itself expires, since nothing here rechecked `activo`.

Additionally, if two guards *both* independently fold in their own DB
recheck (plausible: `authorOrAdmin` and `reviewLimit` both fire on the same
"leave a review, but you're also the author of the thing you're reviewing"
request), that's a duplicated DB round-trip per request with two independent
implementations of "fetch activo+isAdmin fresh" — a second flavor of the
exact per-handler reimplementation AD-1 exists to prevent, except for a
concern AD-1 never named as a guard.

**Close with:** name the DB-recheck as its own primitive (e.g.
`requireSession()` / a Nitro global `server/middleware/`), have every other
named guard consume its output rather than re-querying, and require it fire
on literally every authenticated route — not only ones that also happen to
need `authorOrAdmin`/`requireType`/etc.

---

## AD-5 — Deactivation cascade: shared active-user filter

### Pair 7: admin needs to see deactivated users somewhere — `activeUserFilter` doesn't say if it's bypassable

AD-5: "Every endpoint returning a collection of user-authored content ...
applies a shared `activeUserFilter()` ... No handler inlines its own `activo`
filter." Read literally and unconditionally, this filter is *always* applied
by every collection endpoint. But UJ-5 (admin manually recovers a locked-out
Camila) and FR-36 (admin blocks/deactivates a Usuario) both presuppose an
admin-facing surface where admin can find and act on deactivated accounts —
and per FR-40, once deactivated, that user's "directory listing/profile
itself" is hidden from "public-facing views."

**Unit A** — the public Directorios listing (`server/api/usuarios/**`, one
per TipoUsuario, FR-15) applies `activeUserFilter()` unconditionally — no
parameter, no bypass, matching AD-5's literal "no handler inlines its own
filter" (read as: don't even inline a *skip* of the shared filter).

**Unit B** — an admin user-management list (needed for FR-36's "admin can
...block the Usuario," and for UJ-5's recovery flow, and to *reactivate* a
deactivated account per FR-40's "reactivating the account restores
visibility") is built against the same Usuario-collection shape, and its
author — reasonably, since admin obviously needs to see deactivated rows to
reactivate them — parameterizes the shared filter:
`activeUserFilter({ bypass: isAdmin })`.

Both units claim to "apply the shared `activeUserFilter()`." Only one of them
can be right about whether the function accepts a bypass parameter, and
nothing in AD-5 says which. If Unit A's unconditional reading wins (because
it was built/reviewed first and become the canonical signature), there is
**no route left anywhere in the spine's Structural Seed for admin to ever see
a deactivated Usuario** to reactivate them — the deferred edge-case list even
flags "no defined admin account creation/promotion path" as unresolved,
strongly suggesting this exact gap.

### Pair 8: `Resena` has *two* Usuario relationships — which one does the filter key off?

Every other new model (`Publicacion`, `ItemCatalogo`) has exactly one
authorship relation to `Usuario`. `Resena` has two: `autor` (who wrote it)
and `nutricionista` (who it's about) — per the spine's own ER diagram
(`Usuario ||--o{ Resena : authors` and `Usuario ||--o{ Resena : "is reviewed
(Nutricionista)"`). AD-5's PRD source (FR-40) only enumerates Publicaciones,
Ítems de Catálogo, and Eventos/Noticias as content types that get hidden —
Reseñas are conspicuously absent from that enumeration, and the PRD's own
§11 Deferred list flags "a deactivated Usuario's Reseñas staying visible" as
an open, unresolved edge case.

**Unit A** — the Nutricionista detail page's review list applies
`activeUserFilter()` against the `nutricionista` relation (hide reviews if
the *reviewed* Nutricionista is deactivated) — which happens for free anyway
since the whole profile is hidden per FR-40.

**Unit B** — a hypothetical (but plausible, given "one review per
nutricionista" plus moderation needs) "reviews I've written" surface on a
Usuario's own account, or an admin moderation queue that lists reviews
platform-wide, applies `activeUserFilter()` against the `autor` relation
instead (hide reviews *written by* a deactivated/blocked user, consistent
with FR-36's "a blocked Usuario ... their existing content is handled per
FR-40" — arguably reviews count as "their content" too).

Both are legitimate applications of "the shared `activeUserFilter()`," but
they filter on different foreign keys of the same model, and the guard's
name/signature as specified (`activeUserFilter()`, no arguments implied)
gives no way to distinguish "filter by author" from "filter by target" —
worse, this is the *one* model in the whole schema where that distinction is
load-bearing, and it's exactly the model the PRD itself flags as unresolved.

**Close with:** (1) make `activeUserFilter()` explicitly parameterized by
relation/role (`activeUserFilter('autor' | 'nutricionista')` or by field
name), not a bare no-arg helper; (2) add an explicit admin-bypass parameter
with a single canonical signature pinned in the spine, not left to be
inferred per implementer; (3) resolve (or explicitly re-defer with a named
default) whether Reseñas are in scope for FR-40's cascade at all.

---

## AD-6 — Frontend guards: `useCanEdit(resource)`

### Pair 9: three resource types, three different permission shapes, one boolean composable

AD-6 names `useCanEdit(resource)` as *the* shared composable for
"author-or-admin UI checks across Eventos/Noticias, Publicaciones, Reseñas,
Ítems de Catálogo" — grouping all four under one contract. But per-FR, the
actual rights differ:

| Resource | Author can edit? | Author can delete? | Admin can edit? | Admin can delete/act? |
|---|---|---|---|---|
| Eventos/Noticias (FR-14) | yes | yes | yes | yes |
| Ítems de Catálogo (FR-43) | yes | yes | yes | yes |
| Publicaciones (FR-28) | yes | yes | **no** | yes (delete only) |
| Reseñas (FR-36/FR-37 notes) | **undecided** ("edit path... left to UX/architecture") | n/a (no delete by author specified) | no (admin **retracts**, a distinct verb) | yes (retract + can block the author) |

**Unit A** — built against Eventos/Noticias or Catálogo first (the two
resources where the shape is genuinely uniform), `useCanEdit(resource)`
returns a single boolean: `resource.autorId === currentUser.id ||
currentUser.isAdmin`. Used to gate one combined edit/delete affordance.

**Unit B** — the Publicaciones page reuses the exact same composable/call
site pattern (AD-6 explicitly binds it to Publicaciones too), and now shows
admin an "edit" pencil icon on other users' posts that, when clicked, either
silently 403s server-side (if the backend correctly enforces FR-28's
narrower rule per Pair 1 above) or — worse — succeeds, if the backend guard
was built the same way. Either the frontend lies about a capability the
backend refuses, or both layers agree on the *wrong*, over-permissive rule.

A second, independent contributor building the Reseñas page tries to reuse
`useCanEdit(resource)` for the admin "retract" button, discovers the
composable's single boolean can't express "retract, not edit, admin-only, no
author self-action" — and, faced with a poor semantic fit, falls back to an
inline `authStore.user?.isAdmin` check for that one button. This is exactly
the ad hoc pattern AD-6 exists to eliminate, reintroduced at the one resource
(Reseñas) whose permission shape doesn't match the composable's assumed
contract.

**Close with:** either (a) split into two composables/return fields —
`useResourcePermissions(resource, resourceType)` returning `{ canEdit,
canDelete, canRetract }` per resource type, with the action matrix above
pinned in the spine — or (b) explicitly scope `useCanEdit` to only the two
resources (Eventos/Noticias, Catálogo) where the uniform shape actually
holds, and name a separate, explicitly different-shaped mechanism for
Publicaciones (asymmetric) and Reseñas (retract-only, no self-edit).

---

## Consistency Conventions — row by row

### Error shape (`createError({statusCode, message})`)

Fixes the envelope, not the payload. FR-2 (heavy per-type required-field
registration validation) and FR-38 (fixed-list rejection for género/país/
deporte) are exactly the multi-field-error-prone paths. **Unit A**
(registration handler) concatenates all field errors into one human-readable
string in `message`. **Unit B** (catalog-item creation, also multi-field:
nombre/tipo/imagen) JSON-stringifies a `{field: reason}` map into `message`
instead, because a structured shape is more useful for a form to highlight
individual fields. Both satisfy "message is the canonical field" — but any
shared frontend error-rendering code (there is no shared composable named for
this, unlike AD-6's UI-permission composable) must special-case two payload
shapes inside the same field. **Close with:** pin the shape of `message` for
multi-field validation errors (e.g., always a JSON array of `{field, reason}`
objects serialized into the string, with a documented parse convention), not
just the top-level key.

### New Prisma model naming (Spanish PascalCase)

Fixes model names only, not **relation field names** — and this gap is what
actually breaks AD-5's genericity claim. If `Publicacion`'s FK/relation to
its author is named `autor`, `ItemCatalogo`'s is named `marca`, and
`Resena`'s author-side relation is named `usuario`, then a single truly
generic `activeUserFilter()` Prisma where-helper (as AD-5 implies: "a shared
... where-helper," singular, implicitly reusable across models) cannot be
written without a per-model parameter or per-model reimplementation, either
of which weakens AD-5's own anti-duplication rationale ("no handler inlines
its own filter") down to "no handler inlines its own filter, but each model
needs its own filter variant anyway." **Close with:** extend the naming
convention to relation field names — mandate a single canonical relation name
(e.g. `autor`) for "the Usuario that owns/authored this row" across every new
model that has one, so `activeUserFilter()` can be genuinely generic.

---

## Capability → Architecture Map: "no new AD" rows

### §5.12 Settings & Theme Toggle — "existing Pinia/local-state pattern, no new AD"

FR-31 requires the theme choice **persist across sessions**
(`[ASSUMPTION]`-tagged in the PRD, but present). "Existing Pinia/local-state
pattern" is asserted without confirming *where* that pattern already
persists data — client-only (`localStorage`, device-scoped) or server-backed
(a Usuario/Informacion field, account-scoped). This is a genuinely new
cross-cutting question FR-31 introduces; the spine waves it off rather than
resolving it.

**Unit A** — built as a pure client-side Pinia store synced to
`localStorage`, satisfying "existing local-state pattern" literally and
"persists across sessions" for a single browser.

**Unit B** — a second contributor, noting Settings (FR-32) is the same page
that already round-trips to the server for content-policy editing, and
reading "persist across sessions" as implying account-level persistence
(login on a new device should carry the preference), adds a `temaPreferido`
field to the FR-18 profile-edit PUT handler and hydrates the Pinia store from
it on load.

Both are defensible readings of "no new AD." Run together, they produce a
real bug class: server value overwritten by stale `localStorage` on load, or
vice versa, with no single source of truth — precisely the kind of two-owners-
of-one-concern clash this review is hunting for, arising *because* the spine
declared "no new AD" for a requirement (cross-session persistence) that is
new scope, not an existing, already-settled pattern.

**Close with:** either confirm the existing pattern already includes DB
persistence (if so, name the field/table) or add a one-line AD/convention
pinning theme persistence to one layer only.

### §5.13 Visual/UI Overhaul — "no new AD" (lower severity)

FR-33's sitewide "hover lift/raise" micro-interaction spans every card type
across at least six independently-built surfaces (four directories,
Eventos/Noticias, plus the new Catálogo/Publicaciones cards). Nothing names a
shared `<Card>` component or a shared Tailwind utility/class for this
interaction, unlike AD-6's explicit anti-copy-paste rule for auth checks. Two
contributors building, e.g., the Deportistas directory card and the new
Catálogo item card independently, will each satisfy FR-33 visually while
producing different hover timing/easing/shadow-depth values — not a
build-breaking clash, but the same copy-paste drift AD-6 exists to prevent
for logic, left unaddressed for the one visual behavior the PRD calls out as
sitewide. Worth a one-line convention (shared `Card`/`hover-lift` utility) if
visual consistency matters as much as the "no new AD" designation implies.

---

## Summary — holes ranked by severity

| # | Hole | Resources in conflict | Recommended fix |
|---|---|---|---|
| 1 | `authorOrAdmin` has no `action` parameter; Publicaciones' admin=delete-only vs. Catálogo/Eventos' admin=edit+delete | Publicaciones vs. Catálogo/Eventos | Action-scoped guard signature + per-resource matrix in spine |
| 2 | `activeUserFilter()` unconditional vs. admin-bypass-needed, and no admin surface exists to find deactivated users at all | Public Directorios vs. any admin recovery/moderation surface | Explicit bypass parameter; name the admin surface |
| 3 | `Resena`'s dual Usuario relation (`autor` vs `nutricionista`) — filter target undefined | Nutricionista detail page vs. any author-side review surface | Parameterize `activeUserFilter()` by relation |
| 4 | `useCanEdit(resource)` assumes one uniform permission shape across resources with three genuinely different shapes (incl. Reseñas' undecided/no-self-edit, retract-not-edit) | Eventos/Catálogo vs. Publicaciones vs. Reseñas | Split composable or per-type action matrix |
| 5 | AD-4's DB-recheck has no named file/enforcement point; routes touching none of the four business guards never recheck `activo`/`isAdmin` | Any route without author/type/review checks (e.g. "view my own profile") | Name a `requireSession()` primitive / global middleware, mandate it on every authenticated route |
| 6 | No shared aggregate function named despite SM-4's "never visibly diverge" requirement; deactivated-user inclusion left to each implementer, and the PRD itself never resolved this question | Homepage stats vs. Reportes/Indicadores | Name `server/utils/aggregates.ts`, resolve deactivated-user inclusion |
| 7 | `storage.ts` return contract unspecified: single-file vs. multi-file | Profile photo vs. Ítems de Catálogo images | Pin function signature (recommend: always `string[]`) |
| 8 | Upload/insert ordering unspecified — orphaned file vs. dangling DB row on partial failure | Any create-flow with an attached image | Pin ordering (recommend insert-first with placeholder) |
| 9 | New-model naming convention covers model names, not relation field names, undermining `activeUserFilter()`'s claimed genericity | Publicacion/ItemCatalogo/Resena relation naming | Extend convention to canonical relation names |
| 10 | `error.data.message` payload shape unspecified for multi-field validation | Registration handler vs. catalog-item creation handler | Pin structured shape for multi-error `message` |
| 11 | §5.12 "no new AD" glosses over FR-31's cross-session persistence — client-only vs. server-backed theme storage | Pinia/localStorage store vs. profile-edit PUT handler | One-line AD pinning persistence layer |
| 12 | §5.13 "no new AD" — sitewide hover micro-interaction has no shared component/utility | Any two independently-built card components | Name a shared `Card`/hover utility (lower severity) |
| 13 | Type-gating (`requireType`) enforced only at the named creation guard call site, not at any secondary write path (reassignment, admin tools, seed scripts) — no DB constraint backs it | Catalog creation endpoint vs. any admin reassignment/seed path | State enforcement point explicitly; consider DB-level check |
| 14 | Playwright suite (AD-7) has no named shared fixture/seed convention; parallel specs needing admin/target users can collide | Any two FR-specific E2E specs (e.g. FR-40 deactivation test vs. FR-36 moderation test) | Name a shared `e2e/fixtures/` seed convention (lower severity) |
