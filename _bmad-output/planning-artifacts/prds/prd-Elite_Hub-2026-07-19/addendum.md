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

## FR-50 — Ciclismo Sport-Specific Fields (full verbatim capture, 2026-10-03/04 brainstorming)

Preserved here as the literal field lists behind PRD §5.1 FR-50's ciclismo branch — this is by far the most complex of the 4 focus sports, since ciclismo itself fans out into 5 modalidades, each with its own field set, and (uniquely among the 4 focus sports) a cyclist can hold more than one modalidad at once.

**Structural rule specific to ciclismo:** after selecting Ciclismo as `deporte`, the Usuario selects one **or more** modalidades (multi-select) — not a single exclusive choice like the other 3 focus sports. Their profile displays the resulting fields sectioned by modalidad, one section per modalidad they hold. This multi-select/sectioned-profile behavior is **explicitly scoped to ciclismo only** for now — the user confirmed triatletas and other multi-discipline cases are a future priority, not part of this pass.

**Ruta:**
- Categoría/Nivel de competencia (Máster A/B/C, Élite, Sub-23)
- Kilometraje promedio semanal/mensual
- Mayor distancia recorrida en un solo fondo (km)
- Desnivel positivo máximo superado en una salida (m)
- Vatios promedio/FTP, W o W/kg (opcional/avanzado — solo si entrena con potenciómetro)
- Frecuencia cardíaca media y máxima
- Perfil de ruta preferido: Escalador/Escarabajo, Rodador/Pasista, Sprinter, Todo terreno

**Montaña / MTB:**
- Categoría/Nivel de competencia: Principiante, Amateur, Élite, Sub-23, Máster (A/B/C)
- Disciplina dentro de MTB: Cross Country (XC), Marathon (XCM), Enduro, Trail. `[Confirmed 2026-10-04: excludes Four Cross (4X) per the user's instruction, and excludes Downhill (DH) — Downhill stays its own standalone modalidad, kept separate from MTB.]`
- Configuración de bicicleta: tipo de suspensión (Rígida / Doble suspensión), medida de rueda (29", Mullet 29/27.5, 27.5")
- Métricas de volumen: desnivel acumulado promedio por salida (m), mayor distancia recorrida en una sola salida (km)
- Perfil de rendimiento: vatios promedio/FTP (W o W/kg, para XC/XCM), posición habitual en competencias de la disciplina
- Perfil preferido del ciclista: Subidor técnico, Descendedor, Todoterreno/Completo
- Entorno de entrenamiento habitual: pistas locales, senderos/trochas abiertas, bikeparks privados

**BMX:** the only modalidad with a mandatory second-level fork — Race vs. Freestyle select *different* field sets, not just a descriptive tag.
- Sub-modalidad/Disciplina (required): **Race** (carreras en pista/gate) o **Freestyle** (Park, Street, Dirt Jump, Flatland)
- Categoría/Nivel de competencia (both branches): por edad y nivel — Novatos, Expertos, Junior, Elite, Cruiser, Pro, Abierto/Open
- Pista, club o spot habitual (both branches): nombre del club de adscripción, pista oficial, o skatepark/spot callejero de entrenamiento principal
- **If Race:** puesto en Ranking Nacional/Departamental UCC; mejores posiciones en válidas oficiales; frecuencia de competencias al año; especialidad en pista (potencia en el partidor/gate, sección de ritmo, peraltes)
- **If Freestyle:** enlace a Video Edit/Reel con portafolio de trucos — **opcional**, not mandatory (explicit correction from the user, who initially said mandatory then walked it back); descripción del truco/combo insignia; estilo dominante; nivel de dificultad de combos; adaptación al terreno (Park/Street/Dirt)

**Downhill (DH):**
- Categoría/Nivel de competencia: Principiante, Amateur, Élite, Junior, Máster por edad
- Pistas habituales de entrenamiento: pista local base + pistas oficiales de competencia donde entrena/compite
- Equipamiento técnico: recorrido de suspensión (mm), marcas de marco/horquilla/amortiguador
- Protecciones utilizadas: casco integral, neck brace, pechera, rodilleras/coderas — flagged by the user as "clave para marcas de seguridad" (brand/sponsor relevance)
- Métricas de rendimiento: mejores tiempos en pistas oficiales reconocidas, o enlaces a segmentos de Strava en pistas de DH
- Desgaste y logística: frecuencia de mantenimiento técnico, presupuesto/necesidad estimada de repuestos anuales

**Pista (Velódromo):**
- Categoría/Nivel de competencia: Principiante, Amateur, Élite, Sub-23, Máster (A/B/C), Juvenil/Prejuvenil
- Especialidad/Modalidad de pista (descriptive, does not fork the rest of the field set — `[ASSUMPTION]`): **Pruebas de Velocidad** (Velocidad Individual, Keirin, 200m Lanzados, Velocidad por Equipos, 1Km/500m Contrarreloj) or **Pruebas de Fondo/Resistencia** (Persecución Individual/Equipos, Ómnium, Criterium/Puntos, Elimination, Scratch, Madison)
- Pista/Velódromo habitual: nombre, tipo de superficie (madera/hormigón), techado/al aire libre, longitud de cuerda en metros
- Métricas clave: tiempos personales (200m lanzados, 500m/1km, persecución individual); potencia máxima pico (W o W/kg); cadencia máxima (RPM)
- Configuración técnica: relación de desarrollo (plato/piñón, dientes), marca de bicicleta de pista (fijo), uso de ruedas lenticulares/bastones
- Historial de competencias: posiciones en Campeonatos Nacionales, Departamentales/Provinciales, o Válidas de Pista oficiales

**Form UX mechanism, confirmed 2026-10-04 (two phases, not one):**
1. **Branching decisions → wizard.** deporte → modalidad selection → sub-modalidad where one exists (BMX's Race/Freestyle fork) are presented as a multi-step wizard with a visible back control or breadcrumb at every stage — these are genuine decision chains, each choice determines what's asked next.
2. **Filling chosen modalidades' fields → tabs/accordion, not wizard.** Once modalidades are chosen, a strict linear step order adds friction without benefit, since the field sets are independent of each other. Each selected modalidad gets its own tab/accordion section instead, navigable in any order, each with a completion indicator (e.g. a checkmark once filled). This must support **any combination and count of modalidades, from exactly 1 up to all 5 simultaneously** — e.g. only BMX; or Pista + MTB; or Pista + MTB + Ruta; or all 5 at once. The same tab/accordion pattern is reused (read-only) on the profile view to display a multi-modalidad ciclista's fields sectioned by modalidad — one component serving both the fill and the display case.

This two-phase mechanism (wizard for branching decisions, tabs/accordion for filling) is specific to ciclismo's multi-modalidad case; fútbol/patinaje/boxeo (single modalidad, no fan-out) only need the simpler deporte → campos wizard step.

**Still open, not yet brainstormed as of 2026-10-04:** fútbol, patinaje, and boxeo's per-sport field lists, the generic "otro" fallback field list, and FR-49's additional Ítem de Catálogo fields — continuing in the next session (see `_bmad-output/brainstorming/brainstorm-deportes-catalogo-campos-2026-10-03/.memlog.md`).

## Reportes/Indicadores — Charting Approach Options

No charting library currently exists in the stack. Options to evaluate at architecture time (not decided here):
- Lightweight/free options compatible with Vue 3 / Nuxt 4 (e.g., Chart.js via a Vue wrapper, or a native SVG-based approach for a single donut/bar chart given the MVP only needs one visualization).
- Given the Cost guardrail (PRD §7): prefer free/open-source, avoid paid charting SaaS.
- Should be chosen with an eye toward the PRD's note that Reportes/Indicadores is a first slice — more metrics are expected post-MVP, so a library that scales past a single chart type is preferable to a one-off SVG hack, if effort allows.
