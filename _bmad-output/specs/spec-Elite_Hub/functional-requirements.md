# Functional Requirements Detail — Elite Hub

FR-level detail behind SPEC.md's CAP-1..CAP-14, organized by capability. Preserves the PRD §5 functional requirements' testable consequences, exact field lists, and confirmed decisions that are too granular for the kernel, plus load-bearing implementation-depth notes carried forward from `addendum.md`. Content superseded by ARCHITECTURE-SPINE.md is marked and not treated as live contract here.

**Information architecture (PRD §4), for reference:** Home (Publicaciones feed) · Eventos/Noticias (listing + detail) · Directorios: Deportistas/Marcas/Nutricionistas/Patrocinadores (listing → detail each) · Catálogo · Reportes/Indicadores · Perfil propio · Settings · Admin panel. Web-only, responsive, no rebrand — the visual overhaul extends the existing look.

---

## CAP-1 — Registration & Type-Segmented Onboarding (FR-1–FR-6, FR-38)

- **FR-1 Type selection at registration:** Registration cannot submit without exactly one TipoUsuario selected. Selecting a type immediately reveals that type's fields, before submission.
- **FR-2 Type-specific field capture** (all types also give correo + contraseña):
  - **Deportista:** primer nombre, segundo nombre, primer apellido, segundo apellido, deporte (fixed list), fecha de nacimiento, género, nacionalidad, ciudad de residencia, biografía corta, altura, peso, teléfono (opcional), nivel deportivo, años de experiencia en el deporte, objetivos actuales, marcas personales (si aplica), lesiones (si aplica), link de redes sociales.
  - **Marca:** nombre de la empresa, NIT, teléfono de contacto, dirección, nombre y cargo del contacto, descripción de la empresa, URL de red social, URL del aplicativo web.
  - **Nutricionista:** nombres, apellidos, fecha de nacimiento, género, teléfono, país, ciudad de residencia, descripción corta, título profesional, universidad donde estudió, año de graduación, especialidad, años de experiencia, certificados adicionales (opcional), modalidad de atención (virtual | presencial).
  - **Patrocinador:** nombres, apellidos, fecha de nacimiento, teléfono, país, ciudad, descripción breve, sitio web (opcional).
  - Fields marked "opcional" may be submitted empty; all others required for that type. Deportista's `deporte` is constrained to the fixed sport list. Profile photo is not part of this form (FR-6).
  - **Addendum verbatim capture** (source-of-truth wording if field ordering/labels matter for the UX spec): each type's list above also explicitly includes `correo` inline as a per-type field in the addendum's phrasing (vs. PRD's "in addition to correo and contraseña" framing) — same field set, two phrasings; no conflict.
  - **Existing data-model alignment** (addendum, architecture-phase input — not yet reflected in `prisma/schema.prisma`): none of segundoNombre, segundoApellido, altura, peso, objetivos, lesiones, marcasPersonales, nacionalidad, ciudadResidencia (distinct from `Direccion`), universidad, añoGraduacion, certificadosAdicionales, or modalidadAtencion exist on the current `Informacion` model — schema changes required. `Informacion.experiencia` is currently free-text `String?`; "años de experiencia en el deporte" is numeric and may map better to `UsuarioDeporte.experiencia` (already `Int`). `Informacion.genero` already exists as `String?`. `UsuarioDeporte.nivel` (Nivel enum: PRINCIPIANTE/INTERMEDIO/AVANZADO/PROFESIONAL) already matches "nivel deportivo."
- **FR-38 Fixed género and país lists:** Género and país (across all four forms) are selected from a fixed list, same pattern as `deporte`. Submitting a value outside the fixed list is rejected. Exact enumerated values deferred to UX/architecture.
- **FR-3 Type immutability:** No UI path (profile edit or otherwise) lets a Usuario change their own TipoUsuario post-registration. **Confirmed decision on legacy accounts:** Usuarios created under the pre-MVP flow (no type, or type set later via profile edit) are left as-is — not backfilled, migrated, or force-assigned — and simply go unused once the new flow is live. Non-goal: legacy-account backfill/migration.
- **FR-4 Mandatory Terms acceptance:** Registration blocked if the T&C checkbox is unchecked, for all types; hyperlink links to the live `terms` Content page (editable via ContentEditor, FR-8).
- **FR-5 Password at registration:** All four types set a password used for subsequent login.
- **FR-6 Deferred profile photo:** No photo upload field on the registration form for any type; photo upload/update lives on the profile-edit surface (FR-18) post-login only.

## CAP-2 — Content Editor Fix & Static Page Editing (FR-7–FR-9)

- **FR-7 Fix ContentEditor modal stacking bug:** Clicking edit on any page with ContentEditor opens a functional, interactive form panel above the overlay (not obscured).
  - **Root cause (addendum, reconfirmed from brief phase):** overlay div is `position: fixed` (positioned) while the modal panel div has no positioning (static/inline-block) — CSS paints positioned elements above static ones regardless of DOM order, so the overlay always covers the panel. Fix: give the panel its own stacking context (`position: relative` + `z-index` above the overlay).
- **FR-8 Wire ContentEditor onto privacity and aboutUs:** `aboutUs.vue` (currently static HTML, no CMS) becomes Content-backed and admin-editable; `privacity.vue`'s existing `getContent()` read path is paired with a working ContentEditor write path. Matches the existing `terms` pattern.
- **FR-9 Remove ContentEditor from non-applicable pages:** Removed from `contactUs.vue`, `deportistas.vue`, `marcas.vue`, `nutricionistas.vue`, `patrocinadores.vue` — not tied to a real feature there, a source of confusion.

## CAP-3 — Contact Form Persistence (FR-10–FR-11, FR-41–FR-42)

- **FR-10 Persist contact submissions:** A valid, unauthenticated submission — including the selected `Asunto` and all other form fields — creates a durable Mensaje de Contacto record.
  - **Why a new model, not PQRS (addendum):** `contactUs.vue`'s form serves event invitations / partnership interest / promotion requests, unrelated to PQRS (complaints/petitions, out of scope for MVP) — reusing PQRS would conflate two domains. Reinforcing: the existing `PQRS` Prisma model requires a non-null `usuarioId`, incompatible with anonymous submissions regardless. Mensaje de Contacto persists `Asunto` plus whatever other fields the live `contactUs.vue` form collects (name/contact/message) — read the exact field list off the live form at implementation time, not re-derived from the PRD.
- **FR-42 Submission confirmation message:** On success, the form shows "Registro Guardado con Éxito" and is no longer a no-op (previously setTimeout + alert).
- **FR-11 Email notification (stretch, non-goal unless time allows):** Admin email notification on a new Mensaje de Contacto — only if time allows before Aug 8, not required for MVP acceptance.
- **FR-41 Admin inbox for Mensajes de Contacto:** Dedicated admin view listing every persisted submission, most-recent-first, including `Asunto` and sender-provided details.
  - Stretch/non-goal unless time allows: making the Elite Hub info panel next to the form admin-editable (via ContentEditor or similar).

## CAP-4 — Homepage Real-Time Stats (FR-12)

- **FR-12 Real aggregate homepage counters:** Homepage stats show live counts of Usuarios per TipoUsuario plus a live Eventos count, computed from the database (replacing hardcoded values: 327+ deportistas, 125+ patrocinadores, 62+ marcas, 86+ nutricionistas, 51+ eventos). Creating a new Usuario of a type increases that type's displayed count on next load. The same aggregate query (or equivalent) backs this and Reportes/Indicadores (FR-29) so the two never visibly disagree (SM-4). Deactivated Usuarios are excluded from these counts (ARCHITECTURE-SPINE `aggregates.ts`) — resolves the PRD §11 open question on this point.

## CAP-5 — Open Eventos/Noticias Creation (FR-13–FR-14)

- **FR-13 Open creation to all authenticated users:** Any authenticated Usuario (not only admins) can create a Noticia or Evento.
- **FR-14 Author + admin edit/delete:** The authoring Usuario can edit/delete their own Noticia/Evento; admin can edit/delete any, regardless of authorship. A non-admin author acting on another's item is rejected; admin action always succeeds.

## CAP-6 — Per-Type Directory & Profile System (FR-15–FR-18, FR-40)

- **FR-15 Segmented directory per type:** Four separate directories (Deportistas, Marcas, Nutricionistas, Patrocinadores), each listing only that type's Usuarios.
- **FR-16 Infinite-scroll card listing:** Loads via infinite scroll (not pagination); each card shows the type's most relevant summary fields (e.g. nombre/apellido or razón social) plus profile photo.
- **FR-17 Click-through detail view:** Opens full field set for that Usuario; back-navigation returns to the listing. `[ASSUMPTION: scroll position preserved on back-navigation]`.
- **FR-18 Self-only profile editing, admin override:** A Usuario views/edits only their own profile (Informacion fields + photo); admin can edit any profile as an account-recovery stopgap (UJ-5) until email-based recovery ships post-MVP. A non-admin editing another's profile via direct request is rejected. Photo upload/update (FR-6) lives here.
- **FR-40 Deactivated-account content hidden:** While `activo = false`, a Usuario's Publicaciones, Ítems de Catálogo, Eventos/Noticias, directory listing, and profile are hidden (not deleted) from public-facing views (directories, feed, catálogo, eventos/noticias listing). Reactivating (`activo = true`) restores visibility without recreating content. **Note:** Reseñas are explicitly excluded from this cascade (see ARCHITECTURE-SPINE AD-5) — a deactivated Usuario's authored Reseñas remain visible; this is a confirmed, deliberate exclusion, not a gap.

## CAP-7 — Deportista Sport Filters (FR-19)

- **FR-19 Sport category filter:** Deportistas directory filters on: fútbol, baloncesto, ciclismo, running, crossfit, voleibol, gimnasia, boxeo, natación, otros. No filter selected shows all Deportistas. The existing "why use the app" CTA section at the top of the deportistas page is retained/improved, not removed. **Known pre-existing drift (ARCHITECTURE-SPINE):** `app/pages/deportistas.vue` currently hardcodes its own sport list, diverging from this canonical list — reconcile against the shared fixed-list convention when the page is next touched.

## CAP-8 — Marca Product/Service Catalog (FR-20–FR-23, FR-39, FR-43)

- **FR-20 Marca-only item creation:** Only Usuarios with TipoUsuario = Marca can create Ítems de Catálogo, only for their own Marca profile. No UI/API path exists for non-Marca Usuarios; since type is immutable (FR-3), this can never be gained after the fact.
  - **Monetization rationale (PRD §7):** this gate is deliberate, not incidental — tying catalog-creation rights to registering as Marca from the start anticipates a future per-listing fee. No payment rails exist yet anywhere in the product (FR-23); this is one of two structural hooks left in place for later monetization (the other being the absence of payment rails itself, so nothing has to be retrofitted).
- **FR-21 Catalog item fields:** nombre, tipo de item (servicio | físico), one or more images.
- **FR-22 Catalog views:** Each Marca's profile shows its own catalog section below brand info. A separate aggregate Catálogo view lists items across all marcas, browsable by category, with a "ver catálogo completo sin filtros" option.
- **FR-23 No payment processing:** No checkout, cart, or payment flow for any catalog item in MVP — contact-only listings.
- **FR-39 Fixed catalog category list:** Categories selected from a fixed enum for MVP (not admin-manageable/dynamic), mirroring the `deporte` pattern. **Starting values (addendum, source discovery list, called "extensible"):** ropa deportiva, equipamiento, suplementos, tecnología, accesorios. Admin-managed categories are a post-MVP candidate.
- **FR-43 Catalog item edit/delete:** The creating Usuario can edit/delete their own item; admin can edit/delete any, regardless of authorship — mirrors the author-plus-admin model used for FR-14 and FR-28. A Marca acting on another Marca's item is rejected; admin action always succeeds.

## CAP-9 — Nutricionista Ratings & Reviews (FR-24–FR-25, FR-36–FR-37)

- **FR-24 Leave a review:** Any authenticated Usuario can leave a rating + comment (Reseña) on a Nutricionista's profile, visible to anyone who can view that profile. **Out of scope, confirmed decision:** no technical gating verifies the reviewer actually used the nutricionista's services (no booking/consumption record exists) — fake/bad-faith reviews are handled after the fact via admin moderation (FR-36), not prevented up front.
- **FR-37 One review per user per nutricionista:** At most one Reseña per (Usuario, Nutricionista) pair; a second attempt is rejected. An edit path to the existing Reseña may be offered instead — left to UX/architecture (still open, no self-service edit exists yet — see Open Questions).
- **FR-25 Especialidad field:** Nutricionista profiles include `especialidad`, shown alongside name/photo/reviews.
- **FR-36 Review moderation:** Admin can retract any Reseña (no longer appears on the profile) and can deactivate (`activo = false`) the Usuario who posted it — a blocked Usuario cannot log in or act; their existing content is handled per FR-40.

## CAP-10 — Publicaciones / Home Feed (FR-26–FR-28)

- **FR-26 Create a publicación:** Any authenticated Usuario can create text + optional single image.
- **FR-27 Home feed:** Publicaciones from all Usuarios appear most-recent-first. `[ASSUMPTION: ordering not explicitly specified]`.
- **FR-28 Author + admin moderation:** Authoring Usuario can edit/delete their own; admin can delete (not edit) any, regardless of authorship. A non-admin acting on another's publicación is rejected.
- **UJ-4 edge case note:** an earlier-drafted PRD edge case flagged "post-suspension content handling" as undefined; FR-40's deactivation cascade (CAP-6) resolves this — a suspended/deactivated author's Publicaciones are hidden, not deleted, while `activo = false`.

## CAP-11 — Reportes/Indicadores (FR-29–FR-30)

- **FR-29 User distribution visualization:** Chart (donut or bar) breaking down registered Usuarios by TipoUsuario; totals match the homepage (FR-12) — same underlying aggregate.
- **FR-30 Numeric counts alongside chart:** Underlying numeric counts per TipoUsuario are also displayed, not chart-only.
- **Notes:** This is a first slice of a metrics surface expected to grow post-MVP — not built assuming it is the final shape. Reportes/Indicadores is held to a materially higher visual polish bar ("muy agradable de ver") than the rest of the admin surface. Charting library choice: **decided** — ARCHITECTURE-SPINE AD-3 (vue-chartjs + chart.js); addendum's "options to evaluate" discussion (Chart.js-via-wrapper vs. native SVG) is superseded and not carried forward as live content.

## CAP-12 — Settings & Theme Toggle (FR-31–FR-32)

- **FR-31 Dark/light theme toggle:** Switch from Settings; persists across sessions. `[ASSUMPTION: persistence not explicitly confirmed, standard expectation]`. Persistence mechanism per ARCHITECTURE-SPINE: `localStorage` only (client-device-scoped, not a DB field).
- **FR-32 Content-policy editing surfaced in Settings:** Settings continues to host terms/privacity/aboutUs edit entry points (FR-8) alongside the new toggle, same surface.
- **Feature-specific NFR:** the toggle must not break responsiveness or existing layouts in either theme (ties to FR-34).

## CAP-13 — Visual/UI Overhaul (FR-33–FR-34)

- **FR-33 Visual refresh across named surfaces:** Deportistas/Marcas/Nutricionistas/Patrocinadores directory and detail views; Eventos/Noticias listing; admin panel; login/register (including removing the placeholder `Jugador.jpeg` stock image); sitewide hover micro-interaction (lift/raise) on cards. A design refresh of existing patterns, not a rebrand.
- **FR-34 Preserve responsiveness:** All visual changes preserve current responsive behavior across breakpoints — hard constraint across every touched surface, treated as a release gate.
- **Gap noted by architecture:** FR-33's sitewide hover micro-interaction has no shared component/utility named yet — worth closing opportunistically, not a blocker.

## CAP-14 — File Storage Migration (FR-35)

- **FR-35 Migrate uploaded file storage off local disk:** Profile photos, catalog item images, publicación images, existing content images move to non-local, persistent storage suitable for a deployed environment. App remains fully functional (uploads and reads) after a server restart/redeploy with no local-disk state retained. Sequenced last — every other upload-touching feature should build against its final storage path rather than migrate twice. Storage provider: **decided** — ARCHITECTURE-SPINE AD-2 (Cloudflare R2 via S3-compatible SDK, e.g. `@aws-sdk/client-s3`); upload function returns `Promise<string[]>` uniformly (array, even for single-image cases).
