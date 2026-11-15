---
title: Elite Hub — MVP PRD
status: final
created: 2026-07-19
updated: 2026-10-05
---

# PRD: Elite Hub — MVP

## 0. Document Purpose

This PRD defines the MVP build-out for Elite Hub, a Nuxt 4 full-stack sports-community platform. It is written for the solo builder (product owner + developer, same person) and for whoever picks up downstream work — UX specs, architecture, epics/stories. It builds directly on `briefs/brief-Elite_Hub-2026-07-16/brief.md` and its `addendum.md`, which are not duplicated here but referenced where relevant; deeper implementation-leaning detail carried forward from that addendum (and new detail volunteered during this PRD's discovery) lives in this run's own `addendum.md`. Features are grouped, each with globally-numbered Functional Requirements (FR-1 through FR-45; IDs are stable and not renumbered when requirements are added, so a few clusters — e.g. FR-36–FR-45 — sit logically within earlier feature sections despite the gap); `[ASSUMPTION]` tags mark inferences made without explicit confirmation and are indexed in §12. FR-44 and FR-45 (video attachments for Publicaciones; a Publicaciones-by-type report) were added 2026-08-01, after the rest of this PRD was finalized — new scope approved once the MVP timeline showed slack ahead of the 2026-08-08 checkpoint. FR-46 through FR-52 (comments and likes on Publicaciones; a name search on directories; additional Ítem de Catálogo fields plus ratings/reviews on them; a focused 4-sport list with fully dynamic sport-specific registration fields for Deportistas; multiple social media profiles for all Usuario types) were added 2026-10-03 through 2026-10-05, by which point Epics 1–7 were already built and Epic 8 remained the only not-yet-started epic (see `sprint-status.yaml`) — these seven are documented-only, explicitly not scheduled into any epic/story yet (§9.4), though as of 2026-10-05 all field-level TBDs within them are resolved.

## 1. Vision

Elite Hub connects four kinds of people in one sports community: athletes (**deportistas**) building a career or a habit, brands (**marcas**) that want visibility and a sales channel, nutritionists (**nutricionistas**) offering expertise, and sponsors (**patrocinadores**) with resources to back people who have less. Today the technical core works — auth, a news/events system, profile editing, a lightweight CMS — but the product has no core loop: everyone lands in the same undifferentiated pool, nobody can find anyone else by type, brands can't sell, nutritionists have no reputation signal, and there's no feed tying the community together day-to-day.

This MVP builds that core loop. Registration segments people by type from the first screen. Each type gets a directory, a profile, and a reason to come back — deportistas get discovered and filtered by sport, marcas get a free product/service catalog with a monetization hook already wired for later, nutricionistas build a review-backed reputation, patrocinadores get a browsable pool of people to support, and everyone can post to a shared feed. A polished reports view makes the community's composition visible at a glance, and the visual layer is brought up to a standard that looks intentional, not "muy sencilla."

Delivery targets a functional checkpoint on 2026-08-08 — a soft checkpoint for demonstrable progress to university evaluators, not a hard deadline — with room to extend to a stable, genuinely deploy-ready MVP by 2026-08-22 if the extra two weeks are needed (§9.2). This remains a solo university project evaluated by professors, but it's held to a higher bar than a one-off classroom exercise: built with an eye toward real future deployment, not discarded after grading. "Deploy-ready" by Aug 22 means the app is capable of being deployed, not that it will necessarily be deployed by that date.

## 2. Target User

### 2.1 Jobs To Be Done

- **Deportista:** "Let me be found — by sponsors, by brands, by the community — and let me show who I am as an athlete, not just a name."
- **Marca:** "Give me a free, low-friction way to list what I sell to a sports-focused audience, without building my own storefront."
- **Nutricionista:** "Let my track record speak for me — reviews from real clients, not just a bio."
- **Patrocinador:** "Let me browse people who could use support and reach out directly."
- **All types:** "Give me a reason to open the app more than once — a feed, a profile that's mine to shape, a community I can see the shape of."
- **Admin (the solo builder, wearing an ops hat):** "Let me moderate content, recover a locked-out user's access, and see the platform's health at a glance — without needing every feature to be built at once."

### 2.2 Non-Users (v1)

- Anonymous/unauthenticated visitors beyond the public marketing pages (home, terms, contact) — directories, profiles, catalog, and feed require an account. **Confirmed decision** (not an assumption): no public/anonymous visibility for these surfaces in MVP.
- Users seeking payment processing, subscriptions, or in-app transactions — explicitly out of scope (§8).
- Users seeking dynamic scheduling/booking with nutricionistas — explicitly out of scope (§8).

### 2.3 Key User Journeys

- **UJ-1. Camila registers as a deportista and is found by a sponsor the same week.**
  - **Persona + context:** Camila, an amateur cyclist, hears about Elite Hub from a teammate and wants visibility for sponsorship.
  - **Entry state:** Unauthenticated, on the public registration page.
  - **Path:** She selects "Deportista" as her type; the form reveals sport-specific fields (deporte: ciclismo, nivel, años de experiencia, objetivos actuales, etc.); she accepts the Terms via the checkbox and hyperlink and submits. She logs in, later uploads a profile photo from her account.
  - **Climax:** A patrocinador browsing the Deportistas directory, filtered to "ciclismo," finds her card and opens her detail view.
  - **Resolution:** The patrocinador reaches out via her listed contact info; type is locked — Camila cannot accidentally become a "marca" later.
  - **Edge case:** If she abandons registration mid-form, no partial account is created — she must restart. `[ASSUMPTION]`

- **UJ-2. A local supplement brand lists its first product without a sales team.**
  - **Persona + context:** The owner of a small supplement brand registers as "Marca" specifically to get shelf space in front of athletes.
  - **Entry state:** Unauthenticated, on registration; selects "Marca."
  - **Path:** Fields specific to marca appear (nombre de la empresa, NIT, descripción, etc.); after logging in, they go to their profile and create a catalog item (nombre, tipo: físico, imagen).
  - **Climax:** The item appears in the public Marcas catalog view, browsable by category, with contact-only details (no checkout).
  - **Resolution:** Interested deportistas contact the brand directly; no payment flow exists yet, so the brand treats this as an ad listing.
  - **Edge case:** A user who registered as "deportista" cannot later gain catalog-creation rights by changing their type — type is immutable, and catalog creation is gated to accounts that registered as marca from the start.

- **UJ-3. A nutritionist's reputation builds through reviews.**
  - **Persona + context:** A registered nutricionista has been quietly using the platform; a deportista who contacted her off-platform for advice wants to vouch for her.
  - **Entry state:** Authenticated deportista, viewing the nutricionista's detail page.
  - **Path:** They leave a rating and comment on her profile.
  - **Climax:** The review appears on her public profile alongside her name/photo/especialidad, visible to anyone browsing the Nutricionistas directory.
  - **Resolution:** Future visitors to her profile see a growing, real reputation signal instead of just a bio.
  - **Edge case:** MVP has no mechanism to verify the reviewer actually used her services (no booking/consumption record exists) — any authenticated user can leave one review per nutricionista (FR-37). **Confirmed decision:** no verification gate is added; fake reviews are handled after the fact via admin moderation (FR-36).

- **UJ-4. Daily use is anchored by the home feed.**
  - **Persona + context:** A patrocinador opens the app on a weekday morning, as a habit-forming touchpoint.
  - **Entry state:** Authenticated, landing on Home.
  - **Path:** They scroll a feed of publicaciones from deportistas, marcas, nutricionistas, and other patrocinadores — text with occasional photos. They post their own update (text + image).
  - **Climax:** Their post appears in the shared feed immediately, visible to the whole community.
  - **Resolution:** They can edit or delete their own post later; if a post is inappropriate, an admin can remove it regardless of author.
  - **Edge case:** A post's author account is later suspended — `[NOTE FOR PM: post-suspension content handling is undefined, not addressed in MVP.]`

- **UJ-5. Locked out, Camila gets back in via the admin stopgap.**
  - **Persona + context:** Camila forgets her password; there is no self-service recovery yet.
  - **Entry state:** Unauthenticated, cannot log in.
  - **Path:** She contacts the admin outside the app (email/social); the admin uses admin-level profile-edit access to reset her credentials.
  - **Climax:** She regains access without a formal recovery flow.
  - **Resolution:** This remains a manual, admin-mediated stopgap until real email-based recovery ships post-MVP.

- **UJ-6. The admin checks community composition before a stakeholder update.**
  - **Persona + context:** Before a professor check-in, the admin wants a clean visual to show the platform is growing and structured.
  - **Entry state:** Authenticated as admin, navigating to Reportes/Indicadores.
  - **Path:** They open the view and see a donut/bar chart breaking down registered users by tipo de usuario, plus key counts.
  - **Climax:** A single polished screen tells the whole composition story — no manual DB querying needed.
  - **Resolution:** The same aggregate data also powers the homepage's public stat counters, so the numbers are consistent everywhere they appear.

## 3. Glossary

- **Usuario** — A registered account. Has `correo`, `password`, `isAdmin` flag, and exactly one `TipoUsuario` once registration completes.
- **TipoUsuario (Tipo de Usuario)** — The account category, chosen at registration and immutable thereafter: **Deportista**, **Marca**, **Nutricionista**, or **Patrocinador**. Drives which fields, directory, and capabilities apply to a Usuario.
- **Deportista** — TipoUsuario for athletes. Associated with a **Deporte** (sport) from a fixed list, a **Nivel** (PRINCIPIANTE/INTERMEDIO/ELITE/PROFESIONAL), and athlete-specific fields (see FR-2).
- **Marca** — TipoUsuario for brands. Only Marca accounts may create **Ítems de Catálogo**.
- **Nutricionista** — TipoUsuario for nutrition professionals. The only type that receives **Reseñas**. `[Pending FR-53, added 2026-11-13: slated to broaden into "Profesional de la Salud," with "profesión" becoming a fixed-list selector (Nutrición, Fisioterapia, Kinesiología, Psicología deportiva, Psicología, Otro) — not yet implemented.]`
- **Patrocinador** — TipoUsuario for individual sponsors/managers with resources to support other users.
- **Informacion** — The extended profile record attached to a Usuario, holding type-conditional fields (bio, contact details, professional/athletic details, etc.).
- **Deporte** — A fixed-list sport category (fútbol, baloncesto, ciclismo, running, crossfit, voleibol, gimnasia, boxeo, natación, otros) used both as a Deportista's chosen sport and as a directory filter. `[Pending FR-50, added 2026-10-03: this list is slated to narrow to fútbol/ciclismo/patinaje/boxeo/otro, with otro's four siblings each gaining their own sport-specific field set — not yet implemented.]`
- **Directorio** — The segmented, infinite-scroll listing view for a given TipoUsuario (one per type: Deportistas, Marcas, Nutricionistas, Patrocinadores).
- **Ítem de Catálogo** — A product or service listed by a Marca, with `nombre`, `tipo` (servicio | físico), and optional image(s). Shown in the Marca's own catalog section and in the aggregate Catálogo view.
- **Reseña** — A rating + comment left by an authenticated Usuario on a Nutricionista's profile.
- **Publicación** — A text (+ optional single image) post created by any Usuario, shown on the shared home feed. Distinct from Noticia and Evento (institutional/admin-originated content types).
- **Evento / Noticia** — Existing content types (event listings / news articles); creation is being opened from admin-only to all authenticated Usuarios in this MVP.
- **Content** — The existing lightweight CMS model backing editable static pages (terms, privacity, aboutUs, etc.), edited via the **ContentEditor** component.
- **Mensaje de Contacto** — A new record type persisting anonymous public contact-form submissions from `contactUs.vue` — event invitations, interest in a closer relationship with Elite Hub, promotion requests, etc., selected via the form's existing `Asunto` dropdown. Not a complaints/PQRS channel; unrelated in purpose to the existing `PQRS` model (which requires an authenticated Usuario and is out of scope for this MVP — see §8).
- **Reportes/Indicadores** — The admin-facing dashboard view showing a visual breakdown of registered Usuarios by TipoUsuario.
- **Admin** — A Usuario with `isAdmin = true`. Retains override edit/delete rights across profiles, content, eventos/noticias, and publicaciones for moderation purposes.

## 4. Platform, Information Architecture & Aesthetic

**Platform:** Web only, responsive (Nuxt 4). No native mobile app in this MVP. All new views must preserve the app's current responsive behavior across breakpoints — an explicit, non-negotiable constraint carried from discovery, not an assumption.

**Information Architecture (top-level surfaces):**
- Home (Publicaciones feed)
- Eventos / Noticias (listing + detail)
- Directorios: Deportistas / Marcas / Nutricionistas / Patrocinadores (each: listing → detail)
- Catálogo (Marcas' aggregate product/service catalog)
- Reportes/Indicadores
- Perfil propio (view/edit)
- Settings (theme toggle, content-policy pages)
- Admin panel (existing, visually overhauled)

**Aesthetic and Tone:** No new brand direction is being introduced — the visual overhaul (§5.13 / FR-33–34) improves and extends the existing look (colors, CTA patterns, card layouts) rather than replacing it. Reportes/Indicadores specifically is called out as needing to be visually polished ("muy agradable de ver"), a materially higher bar than the rest of the admin surface.

## 5. Features

### 5.1 Registration & Type-Segmented Onboarding
**Priority:** Must (Aug 8 checkpoint)

**Description:** Registration currently collects only `nombre/apellido/correo/password`; TipoUsuario is set later, if at all, via profile editing. This is the user-flagged highest-priority fix: every downstream capability (directories, catalog creation, reviews) depends on type being captured correctly at account creation and remaining permanent thereafter.

**Functional Requirements:**

#### FR-1: Type selection at registration
A prospective Usuario selects exactly one TipoUsuario (Deportista, Marca, Nutricionista, or Patrocinador) as part of the registration form. Realizes UJ-1, UJ-2.

**Consequences (testable):**
- Registration cannot be submitted without a TipoUsuario selected.
- The form reveals type-specific fields (FR-2) immediately on selection, before submission.

#### FR-2: Type-specific field capture
The registration form captures the following fields, conditional on the selected TipoUsuario, in addition to correo and contraseña (all types):

- **Deportista:** primer nombre, segundo nombre, primer apellido, segundo apellido, deporte (fixed list), fecha de nacimiento, género, nacionalidad, ciudad de residencia, biografía corta, altura, peso, teléfono (opcional), nivel deportivo, años de experiencia en el deporte, objetivos actuales, marcas personales (si aplica), lesiones (si aplica), link de redes sociales.
- **Marca:** nombre de la empresa, NIT, teléfono de contacto, dirección, nombre y cargo del contacto, descripción de la empresa, URL de red social, URL del aplicativo web.
- **Nutricionista:** nombres, apellidos, fecha de nacimiento, género, teléfono, país, ciudad de residencia, descripción corta, título profesional, universidad donde estudió, año de graduación, especialidad, años de experiencia, certificados adicionales (opcional), modalidad de atención (virtual | presencial).
- **Patrocinador:** nombres, apellidos, fecha de nacimiento, teléfono, país, ciudad, descripción breve, sitio web (opcional).

**Consequences (testable):**
- Fields marked "opcional" above can be submitted empty; all other listed fields are required for that type.
- A Deportista's `deporte` selection is constrained to the fixed sport list (§3 Glossary).
- Profile photo is not part of this form (see FR-6).

#### FR-38: Fixed género and país lists
Género and país fields (wherever they appear across the four registration forms) are selected from a fixed list — the same pattern used for `deporte` — rather than entered as free text.

**Consequences (testable):**
- Submitting a género or país value outside the fixed list is rejected by the form.

**Notes:** The exact enumerated values for género and país are a UX/architecture-phase detail, not fixed by this PRD.

#### FR-50: Focused sport list and sport-specific dynamic fields for Deportista `[Added 2026-10-03, fully specified for futbol/ciclismo/patinaje/boxeo 2026-10-05]`
The Deportista `deporte` field (FR-2) is narrowed from the current 10-sport fixed list (§5.7 FR-19) down to exactly 4 focus sports — **fútbol**, **ciclismo**, **patinaje**, **boxeo** — plus a 5th generic catch-all, **otro**. Selecting one of the 4 focus sports dynamically reveals fields specific to that sport (replacing the sport-conditional portion of today's uniform Deportista field set — universal fields like nombre, correo, fecha de nacimiento, altura, peso, etc. still apply regardless of sport, per FR-2); selecting **otro** shows the existing generic/sport-agnostic field set instead.

**Ciclismo and Patinaje are both multi-modalidad cases:** each fans out into multiple modalidades (Ciclismo: Ruta, Montaña/MTB, BMX, Downhill, Pista/Velódromo; Patinaje: Velocidad, Artístico, Freestyle/Slalom, Agresivo/Street/Park, Roller Derby/Dance), each modalidad with its own field set (full verbatim lists in `addendum.md`). Unlike Fútbol and (pending) Boxeo, a Usuario practicing Ciclismo or Patinaje can hold **more than one modalidad at once** (multi-select, not exclusive); their profile displays the resulting fields sectioned per modalidad held. Ciclismo's BMX modalidad further forks into a mandatory Race-vs-Freestyle choice, each with its own distinct field subset — Patinaje's modalidades each have a required sub-modalidad choice too, but (unlike BMX) the actual field set collected afterward stays the same across a given sport's sub-modalidades. This multi-modalidad/sectioned-profile mechanism is confirmed for Ciclismo and Patinaje only — other multi-discipline cases (e.g. triatlón) are a confirmed future priority, not addressed now.

**Fútbol and Boxeo stay single-modalidad:** one `deporte` selection reveals one field set directly, no fan-out (full lists in `addendum.md`). For Boxeo, Amateur-vs-Profesional was considered as a BMX-style fork but the user decided against it — Amateur/Profesional/Ambos stays a plain descriptive field, not a structural branch.

**Consequences (testable):**
- The registration (and profile-edit) `deporte` dropdown offers exactly 5 options: fútbol, ciclismo, patinaje, boxeo, otro.
- Selecting fútbol or boxeo reveals that sport's own single field set.
- Boxeo's field set applies uniformly regardless of the Amateur/Profesional/Ambos value selected — that field does not change which other fields appear.
- Selecting ciclismo or patinaje reveals a modalidad multi-select specific to that sport; each modalidad selected contributes its own field section to the form and, afterward, to the profile view. Selecting Ciclismo's BMX modalidad additionally requires choosing Race or Freestyle, each revealing a distinct field subset.
- Selecting otro reveals the generic field set (today's uniform Deportista fields, minus whatever becomes sport-specific).
- A Deportista cannot submit fields belonging to a sport/modalidad they did not select.
- The branching decisions (deporte → modalidad selection → sub-modalidad, where one exists) are presented as a multi-step wizard with a visible back control or breadcrumb at every stage, letting the Usuario return to any earlier stage without losing already-entered data.
- For Ciclismo/Patinaje, once modalidades are chosen, filling their field sets is **not** part of that wizard: each selected modalidad gets its own tab/accordion section, navigable in any order (no forced sequence), each showing a completion indicator. A Usuario may hold any number of modalidades from 1 up to all available for that sport at once. The same tab/accordion pattern is reused, read-only, on the profile view to display a multi-modalidad Usuario's fields sectioned by modalidad.

**Notes:** `[Confirmed 2026-10-05: "otro" intentionally keeps today's existing generic field set unchanged — nivel deportivo, años de experiencia, objetivos actuales, marcas personales (opcional), lesiones (opcional) — gaining nothing new; it only loses the sport-specific fields that fútbol/ciclismo/patinaje/boxeo now gain. No open TBDs remain on this FR.]` Full field lists per sport/modalidad are captured verbatim in `addendum.md`. This narrows and supersedes FR-19's sport filter chip list (§5.7) and the uniform `deporte`-conditional portion of FR-2's Deportista field list once implemented — both will need to be updated in lockstep with whatever per-sport fields are eventually defined, including the shared fixed-list source (`deporte` enum) and Story 2.5's filter chips. The Deportistas directory card view (FR-16) will also need rework to surface whatever sport-specific summary fields apply once defined, and — for Ciclismo/Patinaje specifically — to represent a Usuario with multiple modalidades. Both are flagged as known downstream dependencies, not specced in this pass.

#### FR-51: Multiple social media profiles for all Usuario types `[Added 2026-10-05]`
The existing single `link redes sociales` field (FR-2, today collected once for every Usuario type — Deportista, Marca, Nutricionista, Patrocinador) is expanded into **multiple** social media profile links per Usuario (e.g. Instagram, Facebook, TikTok, X/Twitter, YouTube).

**Consequences (testable):**
- A Usuario of any type can add more than one social media profile link, not just one.
- This applies uniformly across all four TipoUsuario — it is not sport-specific and does not belong to FR-50's per-sport field sets.
- Each entry is added via a platform picker (icon + name) followed by a URL field — not a bare list of free-text links. Fixed platform list: Instagram, Facebook, TikTok, X/Twitter, YouTube, WhatsApp, LinkedIn, plus "Otro" (free-text platform name + URL). `[Confirmed 2026-11-06]`
- A Usuario can add at most one entry per platform from the fixed list (the already-added platform is removed/disabled from the picker); "Otro" has no such cap since its name is free text.

**Notes:** Surfaced during FR-50's brainstorming (originally raised in the context of fútbol) but scoped as its own cross-cutting FR since it affects every Usuario type, not just Deportista. Full field/UX detail in `addendum.md`.

#### FR-53: Generalize Nutricionista into "Profesional de la Salud" `[Added 2026-11-13]`
The `Nutricionista` TipoUsuario (FR-1/FR-2) is renamed and broadened to **Profesional de la Salud**, since health-adjacent roles beyond nutrition (fisioterapeutas, kinesiólogos, psicólogos deportivos, etc.) fit the same pattern — a professional with contact info and a Reseña-based reputation — but today have no way to register as what they actually are. The free-text `profesión` field (FR-2) is replaced by a fixed-list selector — the same fixed-list pattern already used for `deporte` (FR-19/FR-50) — with values: **Nutrición, Fisioterapia, Kinesiología, Psicología deportiva, Psicología, Otro** (free-text name required when Otro is picked). `especialidad` (FR-25) stays free text, now read as the sub-specialty within whichever profession is selected (e.g. "deportiva" within Nutrición), not a synonym for the profession itself.

**Consequences (testable):**
- The TipoUsuario label and the 4th segmented directory (FR-15) are renamed from "Nutricionista(s)" to "Profesional(es) de la Salud" everywhere user-facing: registration, directory listing, detail view, admin panel.
- At registration (and profile edit), `profesión` becomes a fixed-list dropdown with the six values above, instead of free text.
- The "Profesionales de la Salud" directory gains a profession filter, mirroring FR-19's sport-filter mechanism on Deportistas — filtering the listing by one of the fixed profession values.
- The existing Reseña system (FR-24, FR-36, FR-37) and `especialidad` field (FR-25) carry over unchanged — a review is left on a Profesional de la Salud's profile the same way regardless of which profession they practice; nothing about the rating/moderation mechanism becomes profession-specific.
- No profession-specific field sets are introduced in this pass (unlike FR-50's per-sport fields for Deportista) — this FR covers only the type rename, the profession selector, and the directory filter.

**Notes:** This is a renaming/generalization pass, not a field-expansion pass. Downstream impact flagged but deliberately left unresolved here, for whoever schedules this: the `Resena` Prisma model's `nutricionista`-named relation, the `TipoUsuario` seed value `"Nutricionista"`, every FR/UJ/glossary reference to "Nutricionista" (FR-2, FR-15, FR-24, FR-25, FR-36, FR-37, FR-48, UJ-3), and a migration path for already-registered Nutricionista accounts' existing free-text `profesión` value onto the new fixed list (most likely auto-mapping to "Nutrición," but not decided here). Full profession list and rationale captured in `addendum.md`.

#### FR-54: No "Entrenador" (coach/trainer) account type exists `[Added 2026-11-13, identified gap — not designed]`
No TipoUsuario, directory, profile, or capability exists today for sports coaches/trainers as account holders. "Entrenador" currently only appears as a free-text sub-field inside Boxeo's sport-specific fields (`gimnasioClubEntrenador`, FR-50) — the athlete's own coach's name as a data point on the athlete's profile, not a person with their own account.

**Consequences (testable):** None yet — this FR documents a gap, not a requirement. No UI/API behavior changes result from it alone.

**Notes:** Surfaced while discussing FR-53 — a coach/trainer is a distinct role from a health professional (nutrición/fisioterapia/kinesiología/psicología/psicología deportiva), so this is deliberately kept as its own backlog item rather than folded into FR-53's profession list. Fully `[TBD]`: whether this becomes its own 5th/6th TipoUsuario, what fields/directory/Reseña behavior it would have, and how (or whether) it relates to FR-53 are all undecided — raised here only so the gap isn't lost before any design work has happened.

#### FR-55: Real password recovery flow `[Added 2026-11-14, identified gap — not designed]`
The "Recuperar contraseña" link on `/login` has never been wired to a real flow — it was a placeholder pointing at `/` (home), which looked to the user like clicking it just silently bounces them back to the start. As of this FR, the link is removed from the login page entirely (rather than left pointing nowhere) until the real feature exists — no dead UI should ship.

**Consequences (testable):** None yet — this FR documents a gap, not a requirement. No "recuperar contraseña" entry point exists anywhere in the app until this is scheduled and built.

**Notes:** Confirmed: there is no reset-token model/column on `Usuario`, no `server/api` endpoint, no dedicated page, and no email-sending service configured anywhere in the stack today (checked `prisma/schema.prisma`, `server/api/auth/`, and dependencies — nothing beyond `next-auth`'s credentials-based login exists). Building this for real requires, at minimum: (1) a password-reset-token field/model with an expiry, (2) a "request reset" page + endpoint that issues a token, (3) an email-delivery mechanism to actually send the reset link (no provider chosen yet — this blocks implementation until decided), and (4) a "set new password" page + endpoint that consumes the token. None of this is designed here — raised only so the gap isn't lost, mirroring FR-54's treatment.

#### FR-3: Type immutability
Once a Usuario's TipoUsuario is set at registration, it cannot be changed by the Usuario or, per this FR, by any in-app self-service action.

**Consequences (testable):**
- No UI path exists (profile edit or otherwise) for a Usuario to change their own TipoUsuario post-registration.

**Notes:** **Confirmed decision on legacy accounts:** Usuarios created under the current pre-MVP registration flow (no TipoUsuario, or type set later via profile edit) are left as-is — not backfilled, migrated, or force-assigned a type. They simply go unused once the new type-segmented registration flow (FR-1–FR-2) is built, tested, and in place; from that point on, only Usuarios created through the new flow are used going forward. `[NON-GOAL for MVP: legacy-account backfill/migration]`

#### FR-4: Mandatory Terms acceptance
All four types must check a Terms & Conditions checkbox, linked via hyperlink to the actual terms content (the existing `terms` Content page), before the account can be created.

**Consequences (testable):**
- Registration is blocked if the checkbox is unchecked, regardless of type.
- The hyperlink opens/links to the live `terms` page content (the same one editable via ContentEditor, FR-8).

#### FR-5: Password at registration
All four types set a password as part of registration, used for subsequent login.

#### FR-6: Deferred profile photo
Profile photo is not collected during registration for any type. A Usuario can upload/update their profile photo only after logging in, from within the app.

**Consequences (testable):**
- The registration form contains no photo upload field for any type.
- The profile-edit view (§5.6, FR-18) offers a photo upload/update control.

---

### 5.2 Content Editor Fix & Static Page Editing
**Priority:** Must (Aug 8 checkpoint)

**Description:** The shared `ContentEditor` component's edit modal is broken sitewide — the overlay is `position: fixed` while the panel has no positioning, so the overlay always paints above the form per CSS stacking rules. This is a small, well-understood fix, plus a scope correction: wire the editor onto pages that need it and remove it from pages where it's vestigial.

**Functional Requirements:**

#### FR-7: Fix ContentEditor modal stacking bug
The ContentEditor modal opens and is usable (not obscured by its own overlay) everywhere it's mounted.

**Consequences (testable):**
- Clicking the edit button on any page with ContentEditor opens a functional, interactive form panel above the overlay.

#### FR-8: Wire ContentEditor onto privacity and aboutUs
Admin users can edit the `privacity` and `aboutUs` pages' content through ContentEditor, matching the existing pattern used on `terms`.

**Consequences (testable):**
- `aboutUs.vue`, currently fully static HTML with no CMS connection, is backed by the `Content` model and editable by admin.
- `privacity.vue`'s existing `getContent()` read path is paired with a working ContentEditor write path.

#### FR-9: Remove ContentEditor from non-applicable pages
ContentEditor is removed from `contactUs.vue`, `deportistas.vue`, `marcas.vue`, `nutricionistas.vue`, and `patrocinadores.vue`, where it is not tied to a real feature and is a source of confusion.

---

### 5.3 Contact Form Persistence
**Priority:** Must (Aug 8 checkpoint)

**Description:** `contactUs.vue`'s submit handler is currently decorative (setTimeout + alert; nothing is saved or sent). This form is **not** a PQRS/complaints channel — it's how outside parties reach Elite Hub for things like event invitations, interest in a closer relationship with the platform, or promotion requests, selected via the form's existing `Asunto` dropdown (kept as-is for MVP). PQRS support is explicitly out of scope for this MVP — a known debt, not addressed here (§8). Alongside the form, the page shows Elite Hub's own info (contact details, etc.); making that info editable from admin is a stretch goal, not required for MVP.

**Functional Requirements:**

#### FR-10: Persist contact submissions
An anonymous visitor's contact-form submission — including the selected `Asunto` and all other form fields — is persisted as a Mensaje de Contacto record.

**Consequences (testable):**
- Submitting the contact form with valid input creates a durable record, capturing the chosen `Asunto` option and the rest of the form's fields as filled in.
- No authenticated session is required to submit.

#### FR-42: Submission confirmation message
On successful submission, the form displays a confirmation message: "Registro Guardado con Éxito."

**Consequences (testable):**
- After a valid submission, the user sees this exact confirmation message and the form no longer behaves as a no-op (setTimeout + alert).

#### FR-11: Email notification (stretch)
On a new Mensaje de Contacto, an email notification is sent to the admin. This is a stretch goal only if time allows before Aug 8 — not required for MVP acceptance. `[NON-GOAL for MVP unless time allows]`

#### FR-41: Admin inbox for Mensajes de Contacto
Admin has a dedicated view listing all Mensaje de Contacto records (most-recent-first), so submissions are readable in-app rather than requiring direct database access.

**Consequences (testable):**
- An admin can open this view and see every persisted contact submission, including the `Asunto` selected and sender-provided contact details/message.

**Notes:** Making the Elite Hub info panel next to the form editable from admin (via ContentEditor or similar) is a stretch goal — pursued only if time allows, not required for MVP acceptance. `[NON-GOAL for MVP unless time allows]`

---

### 5.4 Homepage Real-Time Stats
**Priority:** Must (Aug 8 checkpoint)

**Description:** The homepage `<stats>` component (`app/pages/index.vue`) currently shows hardcoded values (327+ deportistas, 125+ patrocinadores, 62+ marcas, 86+ nutricionistas, 51+ eventos). These must reflect real data, and must stay consistent with the Reportes/Indicadores aggregate (§5.11).

**Functional Requirements:**

#### FR-12: Real aggregate homepage counters
The homepage stats section displays live counts of registered Usuarios per TipoUsuario and a live count of Eventos, computed from the database rather than hardcoded.

**Consequences (testable):**
- Creating a new Usuario of a given type increases that type's displayed count on next page load/refresh.
- The same underlying aggregate query (or an equivalent one) backs both this component and Reportes/Indicadores (FR-29), so the two never visibly disagree.

---

### 5.5 Open Eventos/Noticias Creation
**Priority:** Must (Aug 8 checkpoint)

**Description:** `server/api/eventos/**` and `server/api/noticias/**` currently gate POST/PUT/DELETE behind `session.user.isAdmin`. MVP opens creation to all authenticated Usuarios; edit/delete extends to the original author, with admin retaining override rights for moderation.

**Functional Requirements:**

#### FR-13: Open creation to all authenticated users
Any authenticated Usuario, not only admins, can create a Noticia or Evento.

#### FR-14: Author + admin edit/delete
The Usuario who authored a Noticia or Evento can edit or delete it; an admin can edit or delete any Noticia or Evento regardless of authorship.

**Consequences (testable):**
- A non-admin author attempting to edit/delete another Usuario's Noticia/Evento is rejected.
- An admin attempting to edit/delete any Noticia/Evento (own or not) succeeds.

---

### 5.6 Per-Type Directory & Profile System
**Priority:** Should (Aug 22 stable MVP)

**Description:** The centerpiece of the MVP's new core loop. Each TipoUsuario gets its own segmented directory with infinite-scroll listing, card summaries, and a click-through detail view. Users edit only their own profile; admin retains override access as a temporary stopgap for password-reset-style recovery (UJ-5) until real email-based recovery ships post-MVP.

**Functional Requirements:**

#### FR-15: Segmented directory per type
Four separate directory views exist — one each for Deportistas, Marcas, Nutricionistas, Patrocinadores — each listing only Usuarios of that TipoUsuario.

#### FR-16: Infinite-scroll card listing
Each directory loads results via infinite scroll (not pagination), with each card showing the type's most relevant summary fields (e.g., nombre/apellido or razón social for marcas) plus profile photo.

#### FR-17: Click-through detail view
Clicking a directory card opens a detail view with the full field set for that Usuario; navigating back returns to the listing (scroll position preserved). `[ASSUMPTION: scroll position preservation on back-navigation — not explicitly confirmed, standard UX expectation.]`

#### FR-18: Self-only profile editing, admin override
A Usuario can view and edit only their own profile (Informacion fields + profile photo). An admin can edit any Usuario's profile record, as a stopgap for account-recovery scenarios (UJ-5).

**Consequences (testable):**
- A logged-in Usuario attempting to edit another Usuario's profile via direct request is rejected, unless the acting Usuario is admin.
- Profile photo upload/update (FR-6) is available from this edit surface.

#### FR-40: Deactivated-account content hidden
While a Usuario's account is deactivated (`activo = false`), their content — Publicaciones (FR-26), Ítems de Catálogo (FR-20), Eventos/Noticias (FR-13), and their directory listing/profile itself — is hidden from public-facing views (directories, feed, catálogo, eventos/noticias listing), not deleted. Reactivating the account restores visibility.

**Consequences (testable):**
- A deactivated Usuario's directory card and profile no longer appear in their type's Directorio while deactivated.
- Their Publicaciones no longer appear in the home feed while deactivated.
- Their Ítems de Catálogo no longer appear in the Catálogo view while deactivated.
- Reactivating the account (`activo = true`) restores all of the above without requiring the content to be re-created.

#### FR-48: Name search on directories `[Added 2026-10-03]`
Each of the four segmented directories (Deportistas, Marcas, Nutricionistas, Patrocinadores) offers a name search box (magnifying-glass icon) alongside its existing listing, letting a Usuario type a name/razón social to find a specific person or brand.

**Consequences (testable):**
- Typing a search term re-fetches the directory's first cursor batch filtered to Usuarios whose nombre/apellido (or nombre de empresa, for Marcas) matches — not client-side filtering of already-loaded data.
- On Deportistas, the search term and the existing sport filter (FR-19) compose together (both apply at once), rather than being mutually exclusive.
- Clearing the search term returns to the unfiltered directory.

**Notes:** `[ASSUMPTION: match is case-insensitive substring matching on name fields — not explicitly confirmed, standard UX expectation.]`

---

### 5.7 Deportista Sport Filters
**Priority:** Should (Aug 22 stable MVP)

**Description:** The Deportistas directory supports filtering by sport, using the same fixed sport list captured at registration (FR-2). The existing marketing-style "why use the app" CTA section at the top of the deportistas page is retained/improved, not removed.

**Functional Requirements:**

#### FR-19: Sport category filter
The Deportistas directory offers filters for: fútbol, baloncesto, ciclismo, running, crossfit, voleibol, gimnasia, boxeo, natación, otros. No filter selected shows all Deportistas.

**Notes:** `[Pending FR-50, added 2026-10-03]` This chip list is slated to be narrowed to fútbol/ciclismo/patinaje/boxeo/otro once FR-50 (§5.1) ships — not yet implemented, documented here so the two FRs are updated together rather than drifting apart.

---

### 5.8 Marca Product/Service Catalog
**Priority:** Should (Aug 22 stable MVP)

**Description:** Marca profiles gain a catalog capability: brand listing on top, product/service catalog below, plus an aggregate Catálogo view across all marcas. No payment processing in MVP — listings are contact-only, advertising-style. Catalog creation is restricted to Usuarios who registered as Marca from account creation (not retroactively grantable), deliberately tying into a future per-listing monetization plan.

**Functional Requirements:**

#### FR-20: Marca-only item creation
Only Usuarios with TipoUsuario = Marca can create Ítems de Catálogo, and only for their own Marca profile.

**Consequences (testable):**
- A non-Marca Usuario has no UI path or API access to create a catalog item.
- Since TipoUsuario is immutable (FR-3), a Usuario cannot gain this capability after the fact by any means.

#### FR-21: Catalog item fields
An Ítem de Catálogo has: nombre, tipo de item (servicio | físico), and one or more images.

#### FR-22: Catalog views
Each Marca's profile shows its own catalog section (below its brand info). A separate aggregate Catálogo view lists items across all marcas, browsable by category (fixed list for MVP — e.g., ropa deportiva, equipamiento, suplementos, tecnología, accesorios; see FR-39), with a "ver catálogo completo sin filtros" option.

#### FR-23: No payment processing
No checkout, cart, or payment flow exists for any catalog item in MVP; listings are contact-only.

#### FR-39: Fixed catalog category list
Catálogo item categories are selected from a fixed enum for MVP (not admin-manageable/dynamic), mirroring the `deporte` fixed-list pattern.

**Notes:** The exact enumerated category values are a UX/architecture-phase detail (starting point: ropa deportiva, equipamiento, suplementos, tecnología, accesorios); expanding to admin-managed categories is a candidate for post-MVP.

#### FR-43: Catalog item edit/delete
The Usuario who created an Ítem de Catálogo can edit or delete it; an admin can edit or delete any Ítem de Catálogo regardless of authorship — mirroring the author-plus-admin permission model used for Eventos/Noticias (FR-14) and Publicaciones (FR-28).

**Consequences (testable):**
- A Marca attempting to edit/delete another Marca's Ítem de Catálogo is rejected.
- Admin edit/delete succeeds on any Ítem de Catálogo, own or not.

#### FR-49: Additional Ítem de Catálogo fields and detail-view image carousel `[Added 2026-10-03, fields confirmed 2026-10-05]`
The Ítem de Catálogo field set (FR-21: nombre, tipo, imágenes) is expanded with **descripción**, **precio de referencia**, and **disponibilidad**; its detail view gains a proper image carousel (replacing today's static image grid with click-to-zoom).

**Consequences (testable):**
- Creating/editing an Ítem de Catálogo additionally captures a free-text descripción, a reference price, and an availability status.
- `precio de referencia` is purely informational — it does not enable checkout, cart, or any payment flow; FR-23 (contact-only, no payment processing) still applies unchanged.
- `disponibilidad` is selected from a fixed list. `[ASSUMPTION: Disponible, Agotado, Por pedido — exact values not explicitly confirmed by the user, following the project's fixed-list convention (NFR-12).]`
- The detail view's image carousel behaves like the Publicación media carousel (FR-44): one item at a time, next/previous navigation, replacing the current static grid + click-to-zoom lightbox.

**Notes:** No checkout/payment implication — FR-23 still applies regardless of field count. See also FR-52 (§5.8) for the new ratings/reviews capability added to Ítems de Catálogo in the same pass.

#### FR-52: Ratings and reviews on Ítems de Catálogo `[Added 2026-10-05]`
Ítems de Catálogo gain the same rating-and-review package already built for Nutricionistas (§5.9 FR-24/FR-36/FR-37) — a star rating (1-5) plus a comment, one review per Usuario per Ítem de Catálogo, with admin able to retract a review and block the offending Usuario.

**Consequences (testable):**
- Any authenticated Usuario can leave a rating + comment on an Ítem de Catálogo they don't own; it's visible on the item's detail view, mirroring FR-24.
- A Usuario who already reviewed a given Ítem de Catálogo cannot submit a second review for it, mirroring FR-37's one-review-per-nutricionista limit.
- Admin can retract a fake/bad-faith review and deactivate (block) the reviewing Usuario, mirroring FR-36 exactly — same destructive-confirm step, same consequence (the blocked Usuario's session is rejected on their next request per the existing cascade, Story 2.4).

**Notes:** This is a new model (e.g. `ResenaCatalogo`), not a reuse of the existing `Resena` model — `Resena` is scoped to Nutricionista by its two named relations (`autor`, `nutricionista`); a second, structurally identical model targeting `ItemCatalogo` keeps the schema consistent with the one-model-per-target-type pattern already established, rather than introducing a polymorphic relation.

---

### 5.9 Nutricionista Ratings & Reviews
**Priority:** Should (Aug 22 stable MVP)

**Description:** Nutricionistas get a differentiator the other types don't: a Reseña (rating + comment) system on their profile, plus an `especialidad` field. MVP shows contact info only — no scheduling/agenda (explicitly deferred).

**Functional Requirements:**

#### FR-24: Leave a review
An authenticated Usuario can leave a rating + comment (Reseña) on a Nutricionista's profile. Realizes UJ-3.

**Consequences (testable):**
- Reseñas are visible on the Nutricionista's profile/detail view to anyone who can view that profile.
- A Usuario can leave at most one Reseña per Nutricionista (see FR-37).

**Out of Scope:** Verifying that the reviewer actually used the nutricionista's services — no booking/consumption record exists in MVP to gate this. **Confirmed decision:** no technical gating is added for this; fake/bad-faith reviews are handled after the fact via admin moderation (FR-36), not prevented up front.

#### FR-37: One review per user per nutricionista
A Usuario can create at most one Reseña for a given Nutricionista. Attempting to submit a second review for the same Nutricionista is rejected (an edit path to their existing Reseña may be offered instead — left to UX/architecture).

#### FR-25: Especialidad field
Nutricionista profiles include an `especialidad` field, shown alongside name/photo/reviews.

#### FR-36: Review moderation
Admin can remove (retract) any Reseña, and can deactivate (block) the Usuario who posted it, for fake or bad-faith reviews.

**Consequences (testable):**
- A removed Reseña no longer appears on the Nutricionista's profile.
- A blocked Usuario (`activo = false`) cannot log in or perform authenticated actions; their existing content is handled per FR-40.

**Notes:** `[NOTE FOR PM]` This capability (and its cross-cutting counterpart, FR-40) is new scope surfaced during this PRD's discovery, not present in the original brief (2026-07-16) — worth weighing against the brief's own scope-growth concern (its `.memlog.md` already flagged this build as "substantially larger than the original framing" with real timeline risk). Confirmed by the user, but flagged here so it isn't mistaken for brief-sourced scope.

---

### 5.10 Publicaciones (Posts / Home Feed)
**Priority:** Should (Aug 22 stable MVP)

**Description:** All four TipoUsuario categories can post to a shared home feed — the platform's day-to-day return hook. Distinct from Noticia/Evento, which remain admin/institutional-feeling content types.

**Functional Requirements:**

#### FR-26: Create a publicación
Any authenticated Usuario can create a Publicación consisting of text and an optional media carousel of up to 10 items — images and videos freely mixed (FR-44). Realizes UJ-4.

#### FR-27: Home feed
Publicaciones from all Usuarios appear on the app's home feed, most-recent-first. `[ASSUMPTION: ordering — most-recent-first — not explicitly specified.]`

#### FR-28: Author + admin moderation
The authoring Usuario can edit or delete their own Publicación; an admin can delete any Publicación regardless of authorship.

**Consequences (testable):**
- A non-admin Usuario attempting to edit/delete another Usuario's Publicación is rejected.
- Admin delete succeeds on any Publicación.

#### FR-44: Media carousel for publicaciones (images and video)
A Publicación may include a carousel of up to 10 media items, freely mixing images and videos in any combination and order. Each video in the carousel is individually capped at 2 minutes in duration; images carry no such limit.

**Consequences (testable):**
- Uploading between 0 and 10 media items (any mix of images/videos) succeeds; attempting to attach an 11th item is rejected.
- Each video in the set is independently checked against the 2-minute cap; a submission containing any video over 2:00 is rejected with a clear message before the Publicación is created/updated.
- The carousel renders in the feed and in the publicación's detail view, showing one item at a time (image or video) with a way to move to the next/previous item; videos are playable inline via standard controls.
- Editing a Publicación's media replaces the entire carousel wholesale when new files are provided (matching this app's existing single-attachment replace policy, generalized to a set) — there is no per-item add/remove on an existing published carousel in this MVP. `[ASSUMPTION: edit-time media replacement is all-or-nothing, not per-item — not explicitly confirmed, follows the existing replace-wholesale convention used elsewhere in this PRD (e.g. profile photo, catalog item images).]`

**Notes:** Supersedes this FR's original 2026-08-01 single-image-OR-single-video design — redesigned the same day, before the first version was user-tested, once the user reconsidered scope. Per user decision, media files stay on local disk for now, same as before — these are test uploads expected to be deleted, not production content. This does not change §5.14's sequencing: the Cloudflare R2 migration (FR-35) still lands last and will cover these files when it does.

#### FR-46: Comentarios en Publicaciones `[Added 2026-10-03]`
Any authenticated Usuario can leave a comment on a Publicación visible to them; comments are shown as a list on the Publicación (feed card and/or detail view).

**Consequences (testable):**
- Submitting a comment on a Publicación creates a durable record, shown to anyone who can view that Publicación.
- A Publicación's comments are hidden/shown following the same deactivated-account cascade as the Publicación itself (FR-40).

**Notes:** `[TBD — whether a commenting Usuario can edit/delete their own comment, and whether admin can moderate comments independently of the parent Publicación, are not yet decided; deferred to a follow-up elicitation pass before this is built.]`

#### FR-47: Likes/reacciones en Publicaciones `[Added 2026-10-03]`
Any authenticated Usuario can like a Publicación visible to them; liking is a toggle (like/unlike), capped at one like per Usuario per Publicación, with a visible count on the Publicación.

**Consequences (testable):**
- Liking a Publicación a Usuario has not yet liked increments the visible count; unliking decrements it.
- A Usuario cannot register a second simultaneous like on the same Publicación (enforced server-side, mirroring the one-Reseña-per-Nutricionista uniqueness pattern, FR-37).

---

### 5.11 Reportes/Indicadores
**Priority:** Should (Aug 22 stable MVP)

**Description:** A new admin-facing dashboard view giving a visual, "muy agradable de ver" breakdown of the platform's registered-user composition — the first slice of a metrics surface expected to grow post-MVP.

**Functional Requirements:**

#### FR-29: User distribution visualization
The Reportes/Indicadores view displays a chart (donut or bar) breaking down registered Usuarios by TipoUsuario.

**Consequences (testable):**
- The chart's totals match the counts shown on the homepage (FR-12) — same underlying aggregate.

#### FR-30: Numeric counts alongside chart
The Reportes/Indicadores view also displays the underlying numeric counts per TipoUsuario (not chart-only), so the exact figures are readable without interpreting the visualization.

**Notes:** The specific charting library/approach is a technical decision deferred to architecture (see `addendum.md`). This is a first slice — additional metrics are expected post-MVP and this view should not be built in a way that assumes it's the final shape. `[NOTE FOR PM]`

#### FR-45: Publicaciones-by-type report with date range filter
The Reportes/Indicadores view gains a second report: the count of Publicaciones grouped by the authoring Usuario's TipoUsuario, filterable by a date range on the publicación's creation date.

**Consequences (testable):**
- With no date range selected, the report shows counts across all Publicaciones to date, grouped by the four TipoUsuario categories.
- Selecting a date range updates the counts to reflect only Publicaciones created within that range.

**Notes:** This is the second slice of the Reportes/Indicadores surface (after FR-29/FR-30); confirms the view is meant to grow, per the existing `[NOTE FOR PM]` above.

---

### 5.12 Settings & Theme Toggle
**Priority:** Should (Aug 22 stable MVP)

**Description:** Settings already hosts content-policy editing (terms/privacity/aboutUs, via §5.2). This MVP adds a dark/light theme toggle.

**Functional Requirements:**

#### FR-31: Dark/light theme toggle
A Usuario can switch the app's theme between light and dark from Settings; the choice persists across sessions. `[ASSUMPTION: persistence across sessions — not explicitly confirmed as a requirement, but standard expectation for a theme toggle.]`

#### FR-32: Content-policy editing surfaced in Settings
Settings continues to host the entry points for editing terms, privacity, and aboutUs content (via ContentEditor, FR-8) alongside the new theme toggle — both live in the same Settings surface.

**Feature-specific NFRs:**
- The toggle must not break responsiveness or existing layouts in either theme (ties to FR-34).

---

### 5.13 Visual/UI Overhaul
**Priority:** Should (Aug 22 stable MVP)

**Description:** A visual pass across the surfaces the user called out as visually weak today ("muy sencilla," "muy básico," "muy feo, un solo color pálido"), plus sitewide micro-interactions. This is a design refresh of existing patterns, not a rebrand (§4 Aesthetic and Tone).

**Functional Requirements:**

#### FR-33: Visual refresh across named surfaces
The following surfaces receive a visual overhaul: Deportistas/Marcas/Nutricionistas/Patrocinadores directory and detail views; Eventos/Noticias listing; the admin panel; login/register (including removing the placeholder `Jugador.jpeg` stock image); and a sitewide hover micro-interaction (lift/raise) on cards.

#### FR-34: Preserve responsiveness
All visual changes preserve the app's current responsive behavior across breakpoints — this is a hard constraint, not a nice-to-have, across every surface touched in this MVP.

---

### 5.14 File Storage Migration
**Priority:** Should (Aug 22 stable MVP) — sequenced last

**Description:** File storage currently lives on local disk. This is deliberately the final task before considering the MVP genuinely deploy-ready, since every other feature that uploads images (profile photos, catalog items, publicaciones) should be built against its final storage path rather than migrated twice.

**Functional Requirements:**

#### FR-35: Migrate uploaded file storage off local disk
Uploaded files (profile photos, catalog item images, publicación images, existing content images) are stored on non-local, persistent storage suitable for a deployed environment.

**Consequences (testable):**
- The app remains fully functional (uploads and reads) after a server restart / redeploy with no local-disk state retained.

**Notes:** Specific storage provider/approach is a technical decision deferred to architecture.

## 6. Cross-Cutting NFRs

*Stakes: this is a solo university project evaluated by professors, but the user confirmed it should be built with an eye toward real future deployment rather than as a one-off classroom exercise — so NFR rigor here sits a notch above a pure academic demo, though still solo-dev-appropriate: no formal compliance program, no dedicated ops team.*

- **Security — Authentication:** The existing auth stack (session-based login) is retained as-is; the overlapping auth packages (`next-auth` + `@sidebase/nuxt-auth` + `@next-auth/prisma-adapter`) noted as unaudited redundancy in the brief remain out of scope for this MVP (see §8 Non-Goals).
- **Security — Authorization:** New author-vs-admin permission checks (FR-14, FR-28) must be enforced server-side, not just hidden in the UI — mirroring the existing `isAdmin` check pattern already used in `server/api/eventos` and `server/api/noticias`.
- **Data Privacy:** Deportista registration captures personal and health-adjacent fields (fecha de nacimiento, altura, peso, lesiones). Field-level visibility is a confirmed decision, not an open item: the full field set is visible on the detail view to any authenticated viewer, with no field-level privacy control in MVP — see §7 Constraints and Guardrails.
- **Performance:** Directory infinite-scroll must remain responsive as the Usuario count grows; batch size is a technical/architecture decision, not fixed here.
- **Responsiveness:** Every new and modified surface preserves the app's current responsive behavior (FR-34) — treated as a release gate, not a preference.
- **Reliability:** File uploads (photos, catalog images, post images) should not silently fail or corrupt existing records; the brief's known gap (no transactional writes for compound file-upload + DB-write operations) is explicitly carried to post-MVP maintenance, not fixed here (§8).

## 7. Constraints and Guardrails

**Privacy:** Personal data collected at Deportista registration includes health-adjacent fields (lesiones, peso, altura) and PII (fecha de nacimiento). No specific data-protection regime (GDPR/HIPAA-equivalent) applies to this university-context MVP. Visibility is confirmed: the full field set is visible on the detail view to any authenticated viewer (§2.2, §5.6 FR-17) — there is no field-level privacy control (e.g., "hide my phone number") in MVP; this is a deliberate scope cut, not an oversight, and a reasonable post-MVP candidate if users request it.

**Monetization:** None in this MVP. Two structural hooks are already in place for later monetization, by design: (1) Marca catalog-creation is gated to accounts that registered as Marca from the start, anticipating a future per-listing fee; (2) no payment rails exist yet anywhere in the product.

**Cost:** Solo-dev, no budget assumed for paid infrastructure (charting libraries, file storage providers) — free/open-source-tier solutions are the default expectation for architecture-level choices (charting library, storage provider), though the specific choice is deferred to that phase.

## 8. Non-Goals (Explicit)

- **Payments** of any kind — no checkout, no subscriptions, no monetization tied to user type in this MVP.
- **Legacy-account backfill/migration** — Usuarios created under the current pre-MVP registration flow are left as-is, not migrated or force-assigned a TipoUsuario (§5.1 FR-3 Notes); they go unused once the new registration flow is live.
- **PQRS (complaints/petitions) support** — the existing `PQRS` model and any user-facing complaints/petitions channel are not part of this MVP; this is known product debt, unrelated to the Contact Form (§5.3), which serves a different purpose (event invitations, partnership interest, promotion) and does not replace or extend PQRS.
- **Email-based password recovery** — the admin manual-override stopgap (UJ-5) is the MVP's only recovery path.
- **Dynamic scheduling/agendas** for nutricionistas.
- **App rebrand** — a possible future name/trademark change was raised during discovery but is unrelated to MVP functionality and explicitly deferred.
- **Formal unit/component test suite** and **CI/CD pipeline** — not part of this MVP. (This does *not* include E2E testing — see §9.3, a real, tracked, non-gating effort, not something dropped.)
- **RBAC activation** — the existing `Rol`/`Permiso` schema stays unused; all authorization in this MVP continues to use the flat `isAdmin` boolean plus the new author-vs-admin checks (FR-14, FR-28).
- **Auth package consolidation** — the overlapping `next-auth`/`@sidebase/nuxt-auth`/`@next-auth/prisma-adapter` stack is not audited or reduced in this MVP.
- **Transactional writes** for compound file-upload + DB-write operations — known gap, deferred to post-MVP maintenance.
- **Prisma client consistency** (`content/[page].*` instantiating its own client instead of the shared singleton) — deferred to post-MVP maintenance.

## 9. MVP Scope

### 9.1 Must — target: 2026-08-08 functional checkpoint

Foundational fixes plus the highest value-per-effort items; other Should-tier work depends on these being right first, and together they give something real to demo.

- §5.1 Registration & Type-Segmented Onboarding (FR-1–FR-6, FR-38)
- §5.2 Content Editor Fix & Static Page Editing (FR-7–FR-9)
- §5.3 Contact Form Persistence (FR-10–FR-11, FR-41–FR-42)
- §5.4 Homepage Real-Time Stats (FR-12)
- §5.5 Open Eventos/Noticias Creation (FR-13–FR-14)

**Checkpoint success looks like:** registration correctly captures and locks type; content editing works everywhere it should and nowhere it shouldn't; the contact form actually persists messages; homepage stats are real; posting eventos/noticias is open to all authenticated users with correct author/admin permissions.

### 9.2 Should — target: 2026-08-22 stable MVP (if the extra two weeks are needed)

The main feature build-out — the actual core loop.

- §5.6 Per-Type Directory & Profile System (FR-15–FR-18, FR-40)
- §5.7 Deportista Sport Filters (FR-19)
- §5.8 Marca Product/Service Catalog (FR-20–FR-23, FR-39, FR-43)
- §5.9 Nutricionista Ratings & Reviews (FR-24–FR-25, FR-36–FR-37)
- §5.10 Publicaciones / Home Feed (FR-26–FR-28, FR-44)
- §5.11 Reportes/Indicadores (FR-29–FR-30, FR-45)
- §5.12 Settings & Theme Toggle (FR-31–FR-32)
- §5.13 Visual/UI Overhaul (FR-33–FR-34)
- §5.14 File Storage Migration (FR-35) — sequenced last, immediately before deploy-readiness

**Stable-MVP success looks like:** the full directory/profile/catalog/review/reports feature set is live, the visual overhaul is applied consistently, and file storage no longer depends on local disk — the app is genuinely deployable, not just demo-able.

### 9.3 Testing Track (parallel, non-gating)

Not tiered Must/Should because it isn't gated on any individual FR's delivery — it runs alongside the feature work for the whole MVP window, from now through Aug 22. E2E tests are being progressively rewritten in TypeScript (Playwright), replacing the existing Python/pytest suite (currently 4 public-page navigation flows). This is explicitly a real, tracked part of the MVP effort, not deferred to post-MVP maintenance — distinct from the formal unit/component test suite and CI/CD pipeline, both of which *are* out of scope for this MVP (§8).

### 9.4 Post-MVP Documented Backlog (added 2026-10-03, not yet scheduled)

By this date, Epics 1–7 were already built and Epic 8 (file storage migration, FR-35) was the only remaining planned epic (see `sprint-status.yaml`). The five FRs below were explicitly requested as documentation-only — written up so the requirement is captured precisely, but **not** assigned to any epic/story and **not** to be implemented yet. They sit outside the original Aug 8/Aug 22 Must/Should tiers (§9.1/§9.2), which this addendum does not reopen.

- §5.10 Publicaciones — FR-46 (comentarios), FR-47 (likes/reacciones)
- §5.6 Per-Type Directory & Profile System — FR-48 (buscador por nombre)
- §5.8 Marca Product/Service Catalog — FR-49 (campos adicionales de Ítem de Catálogo + carrusel de imágenes, confirmed 2026-10-05), FR-52 (reseñas en Ítems de Catálogo, same package as Nutricionista reviews, added 2026-10-05)
- §5.1 / §5.7 Registration & Deportista Sport Filters — FR-50 (deportes enfocados + campos dinámicos por deporte; fútbol/ciclismo/patinaje/boxeo resolved 2026-10-05, only "otro" fallback still `[TBD]`)
- §5.1 Registration — FR-51 (múltiples perfiles de redes sociales, aplica a los 4 tipos de Usuario)
- §5.9 Nutricionista Ratings & Reviews — FR-53 (generalización de Nutricionista a "Profesional de la Salud", lista fija de profesiones + filtro de directorio, added 2026-11-13)
- §2.1 Registration — FR-54 (vacío identificado: no existe tipo de cuenta "Entrenador"/coach — gap documentado, sin diseñar, added 2026-11-13)
- §2.1 Registration/Login — FR-55 (recuperación de contraseña real — el enlace "Recuperar contraseña" no llevaba a ningún flujo funcional y fue retirado del login mientras tanto; gap documentado, sin diseñar, added 2026-11-14)

**When the user is ready to schedule any of these:** run `bmad-create-epics-and-stories` (or amend an existing epic — FR-46/FR-47 extend Epic 5, FR-48 extends Epic 2, FR-49/FR-52 extend Epic 3 (FR-52 mirrors Epic 4's Resena pattern on a new target), FR-50/FR-51 extend Epic 1 and 2, FR-53 extends Epic 4 (and touches Epic 1's registration + Epic 2's directory), FR-54/FR-55 have no epic yet since neither is designed) followed by the usual `bmad-create-story` / `bmad-dev-story` loop. As of 2026-10-05, FR-46 through FR-52 were fully specified — no field-level TBDs remained. FR-53 (added 2026-11-13) is also fully specified (fixed profession list + directory-rename/filter mechanics confirmed) modulo the downstream-impact items called out in its own Notes. FR-54 and FR-55 (added 2026-11-13/14) are explicitly **not** specified — both are documented gaps only, and each needs its own discovery/scoping pass before it can be scheduled (FR-55 in particular is blocked on choosing an email-delivery provider).

## 10. Success Metrics

Given the pre-launch, evaluation-driven context, success here is primarily functional-completion and quality-of-execution, not traffic/engagement (no real user base exists yet). Forward-looking metrics are included given the user's confirmed intent to build toward real future deployment (§1, §6) rather than treat this as a one-off classroom exercise.

**Primary**
- **SM-1:** 100% of Must-tier FRs (FR-1–FR-14, FR-38, FR-41–FR-42) demonstrably working by 2026-08-08. Validates §9.1.
- **SM-2:** 100% of Should-tier FRs (FR-15–FR-37, FR-39–FR-40, FR-43–FR-45) demonstrably working by 2026-08-22. Validates §9.2.
- **SM-3:** Registration completion rate — % of started registrations that reach a created account, tracked once real users exist. Validates FR-1, FR-2.

**Secondary**
- **SM-4:** Homepage stats and Reportes/Indicadores counts never visibly diverge (same aggregate source). Validates FR-12, FR-29.
- **SM-5:** Zero reports of the ContentEditor modal bug recurring on any of the six pages it touches. Validates FR-7.

**Counter-metrics (do not optimize)**
- **SM-C1:** Registration completion rate (SM-3) should not be improved by shortening or making optional any of the type-specific fields in FR-2 — the field set was deliberately specified in full; friction reduction is not a license to cut fields. Counterbalances SM-3.
- **SM-C2:** Publicaciones/feed activity should not be encouraged at the cost of skipping author/admin moderation checks (FR-28) — posting volume is not itself a success signal if moderation is compromised. Counterbalances the informal expectation that a "lively feed" is inherently good.

## 11. Open Questions

The seven open questions raised in the prior revision of this PRD were resolved by the user during discovery (see `.memlog.md` for the full decision trail) and are now reflected as confirmed decisions in FR-38, FR-39, FR-40, FR-41, FR-36, FR-37, and §2.2/§7. No open questions remain as of the 2026-07-19 revision.

**2026-08-01 addendum to this section:** FR-44 (video attachments for Publicaciones) and FR-45 (Publicaciones-by-type report) were added as new scope once the timeline showed slack ahead of the Aug 8 checkpoint (see `.memlog.md`). No new open questions were raised — the one new inference (media-attachment mutual exclusivity) is tracked in §12.

**2026-10-03 addendum to this section:** FR-46 through FR-50 (§9.4) were added as documented-only backlog, not scheduled for implementation. Two of the five carried genuinely open, unresolved questions rather than mere inferences: FR-49's exact additional Ítem de Catálogo fields, and FR-50's exact per-sport field lists (fútbol/ciclismo/patinaje/boxeo) plus the generic field list for "otro" — both explicitly deferred by the user to a future elicitation pass, not something this revision guessed at. A smaller open question also surfaced on FR-46: whether comment edit/delete and independent comment moderation exist, or whether comments inherit the parent Publicación's moderation only — left undecided for the same future pass.

**2026-10-03 through 2026-10-05 resolution:** that future elicitation pass happened (a dedicated brainstorming session, `_bmad-output/brainstorming/brainstorm-deportes-catalogo-campos-2026-10-03/.memlog.md`). FR-50 is now fully specified for all 4 focus sports plus "otro" (confirmed unchanged). FR-49 is fully specified (descripción, precio de referencia, disponibilidad). A new FR-51 (multiple social media profiles, all Usuario types) and FR-52 (ratings/reviews on Ítems de Catálogo, mirroring Nutricionista reviews) were discovered along the way and added. FR-46's comment-moderation question remains open — the only unresolved item left across FR-46–FR-52.

**Deferred, reviewed edge cases:** An edge-case review (`review-edge-case-hunter.md`) surfaced additional gaps — e.g., no guard against deactivating the last admin account, no defined admin account creation/promotion path, a deactivated Usuario's Reseñas staying visible, a retracted Reseña not freeing the one-review-per-nutricionista limit unless the author is also blocked, no self-service edit on one's own Reseña, self-review not excluded on Nutricionista profiles, and whether deactivated Usuarios count toward homepage/Reportes aggregates. These were reviewed with the user and consciously deferred — not fixed in this MVP revision — beyond the two adopted directly into FRs (FR-43 catalog item CRUD; FR-3 Notes on legacy accounts). Worth a pass before or during architecture if any prove cheap to close.

## 12. Assumptions Index

Remaining unconfirmed inferences — everything else from the prior revision has been resolved into confirmed decisions (§11):

- §2.3 UJ-1 — Abandoning registration mid-form creates no partial account.
- §5.6 FR-17 — Directory scroll position is preserved on back-navigation from a detail view.
- §5.10 FR-27 — Home feed orders publicaciones most-recent-first.
- §5.10 FR-44 — Editing a publicación's media carousel replaces the whole set wholesale (no per-item add/remove on an existing carousel).
- §5.12 FR-31 — Theme choice persists across sessions.
- §5.6 FR-48 — Name search matches case-insensitively on name/razón social fields (added 2026-10-03).
- §5.8 FR-49 — `disponibilidad` fixed-list values are Disponible/Agotado/Por pedido (added 2026-10-05, not explicitly confirmed by the user).
