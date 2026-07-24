# Addendum: Elite Hub MVP PRD — Implementation Depth

This addendum captures technical-how detail volunteered or reconfirmed during this PRD's discovery that doesn't belong in the PRD's capability-level narrative but should not be lost before architecture. It complements — but does not replace — `briefs/brief-Elite_Hub-2026-07-16/addendum.md`, which still holds the original implementation-depth notes from the brief phase.

## Registration Field Set — Full Verbatim Capture

Preserved here as the literal source-of-truth wording behind PRD §5.1 FR-2, in case field ordering/exact labels matter for the registration form's UX spec:

- **Deportista:** primer nombre, segundo nombre, primer apellido, segundo apellido, correo, deporte, fecha de nacimiento, género, nacionalidad, ciudad de residencia, biografía corta, altura, peso, teléfono (opcional), nivel deportivo, años de experiencia en el deporte, objetivos actuales, marcas personales (si aplica), lesiones (si aplica), link redes sociales.
- **Marca:** nombre de la empresa, NIT, correo, teléfono de contacto, dirección, nombre y cargo del contacto, descripción de la empresa, URL red social, URL del aplicativo web.
- **Nutricionista:** nombres, apellidos, correo, fecha de nacimiento, género, teléfono, país, ciudad de residencia, descripción corta, título profesional, universidad donde estudió, año de graduación, especialidad, años de experiencia, certificados adicionales (opcional), modalidad de atención (virtual | presencial).
- **Patrocinador:** nombres, apellidos, fecha de nacimiento, correo, teléfono, país, ciudad, descripción breve, sitio web (opcional).

All four types additionally require: contraseña, T&C checkbox with hyperlink. Profile photo is explicitly deferred to post-login (not part of registration for any type).

## Existing Data Model Alignment (verified against `prisma/schema.prisma`)

None of the new fields above (segundoNombre, segundoApellido, altura, peso, objetivos, lesiones, marcasPersonales, nacionalidad, ciudadResidencia as distinct from `Direccion`, universidad, añoGraduacion, certificadosAdicionales, modalidadAtencion, etc.) exist on the current `Informacion` model — schema changes are required. `Informacion.experiencia` is currently a free-text `String?`; Deportista's "años de experiencia en el deporte" is numeric per discovery and may map more naturally to `UsuarioDeporte.experiencia` (already `Int`) rather than `Informacion.experiencia`. `Informacion.genero` already exists as `String?`. `UsuarioDeporte.nivel` (the `Nivel` enum: PRINCIPIANTE/INTERMEDIO/AVANZADO/PROFESIONAL) already matches "nivel deportivo." These mappings are architecture-phase decisions, noted here only so schema design doesn't have to rediscover them from scratch.

## ContentEditor Modal Bug — Root Cause (carried from brief phase, reconfirmed)

Overlay div is `position: fixed` (positioned) while the modal panel div has no positioning (static/inline-block). CSS paints positioned elements above static ones regardless of DOM order — the overlay always covers the panel, so clicking "edit" just grays the screen with no interactive form visible. Fix: give the panel a stacking context (e.g. `position: relative` + appropriate `z-index` above the overlay). One shared component, used on `terms`, `privacity`, and `aboutUs` after the MVP fix (removed from `contactUs`, `deportistas`, `marcas`, `nutricionistas`, `patrocinadores`).

## Mensaje de Contacto — Why a New Model

Primary reason: `contactUs.vue`'s form serves a purpose unrelated to PQRS (complaints/petitions) — it's for event invitations, partnership interest, and promotion requests, selected via its existing `Asunto` dropdown. PQRS is explicitly out of scope for this MVP (known debt), so reusing it here would conflate two unrelated domains. Secondary, reinforcing reason: the existing `PQRS` Prisma model requires a non-null `usuarioId` (`usuario Usuario @relation(fields: [usuarioId], ...)`), incompatible with anonymous public submissions anyway — even if PQRS were in scope, it couldn't back this form without a constraint change. Mensaje de Contacto should persist the `Asunto` selection plus whatever other fields the current form collects (name/contact info/message) — the exact field list should be read off the live `contactUs.vue` form at architecture/implementation time, not re-derived from this PRD.

## Marca Catalog — Category List

Discovery example categories: ropa deportiva, equipamiento, suplementos, tecnología, accesorios — explicitly called "extensible." This was Open Question #4 in a prior PRD revision (admin-managed/dynamic vs. fixed enum for MVP); it has since been resolved by FR-39 in favor of a fixed enum for MVP, mirroring the Deporte fixed-list pattern already used, with admin-managed categories deferred as a post-MVP candidate (PRD §5.8 FR-39 Notes). Preserved here only as the source discovery list behind that enum's starting values.

## Reportes/Indicadores — Charting Approach Options

No charting library currently exists in the stack. Options to evaluate at architecture time (not decided here):
- Lightweight/free options compatible with Vue 3 / Nuxt 4 (e.g., Chart.js via a Vue wrapper, or a native SVG-based approach for a single donut/bar chart given the MVP only needs one visualization).
- Given the Cost guardrail (PRD §7): prefer free/open-source, avoid paid charting SaaS.
- Should be chosen with an eye toward the PRD's note that Reportes/Indicadores is a first slice — more metrics are expected post-MVP, so a library that scales past a single chart type is preferable to a one-off SVG hack, if effort allows.
