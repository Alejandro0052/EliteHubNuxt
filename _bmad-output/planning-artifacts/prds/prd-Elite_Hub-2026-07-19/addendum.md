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

## FR-50 — Sport-Specific Fields per Focus Sport (full verbatim capture, 2026-10-03 through 10-05 brainstorming)

Preserved here as the literal field lists behind PRD §5.1 FR-50's per-sport branches. **Important clarification confirmed during this session:** the universal identity/contact fields already in FR-2 (nombre/apellido, correo, fecha de nacimiento, género, nacionalidad, ciudad de residencia, biografía corta, teléfono, **altura**, **peso**) are NOT re-specified per sport below — they already apply to every Deportista regardless of sport. Likewise, redes sociales is covered once, universally, by FR-51 (§5.1), not repeated per sport. What follows per sport is only the *additional*, sport-conditional field set that FR-50 layers on top.

**Ciclismo and Patinaje are the two complex cases:** both fan out into multiple modalidades, each with its own field set, and — unlike fútbol/boxeo/otro, which take a single uniform field set — a Usuario practicing either of these two sports can hold **more than one modalidad at once** (multi-select, not exclusive). Their profile displays the resulting fields sectioned by modalidad, one section per modalidad held. Fútbol and (pending) Boxeo stay single-modalidad: one `deporte` → one field set, no fan-out.

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

**Form UX mechanism, confirmed 2026-10-04 (two phases, not one — applies to both Ciclismo and Patinaje):**
1. **Branching decisions → wizard.** deporte → modalidad selection → sub-modalidad where one exists (e.g. BMX's Race/Freestyle fork, or each Patinaje modalidad's own sub-type) are presented as a multi-step wizard with a visible back control or breadcrumb at every stage — these are genuine decision chains, each choice determines what's asked next.
2. **Filling chosen modalidades' fields → tabs/accordion, not wizard.** Once modalidades are chosen, a strict linear step order adds friction without benefit, since the field sets are independent of each other. Each selected modalidad gets its own tab/accordion section instead, navigable in any order, each with a completion indicator (e.g. a checkmark once filled). This must support **any combination and count of modalidades, from exactly 1 up to all available simultaneously** — e.g. only BMX; or Pista + MTB; or Pista + MTB + Ruta; or all of them at once. The same tab/accordion pattern is reused (read-only) on the profile view to display a multi-modalidad Usuario's fields sectioned by modalidad — one component serving both the fill and the display case.

Fútbol and (pending) Boxeo don't need this two-phase mechanism — single modalidad, no fan-out — so they only need the simpler deporte → campos wizard step.

---

### Fútbol (confirmed 2026-10-04/05)

Single modalidad, no fan-out — one `deporte` selection reveals this one field set directly.

- **Posición:** posición principal (Portero, Defensa central, Lateral, Mediocampista, Extremo, Delantero), posición secundaria (opcional)
- **Pie dominante:** derecho, izquierdo, ambidiestro
- **Club/nivel:** club o equipo actual; categoría/nivel de competencia (aficionado, semiprofesional, profesional, selección, ligas menores por edad)
- **Datos físicos adicionales:** salto vertical (cm) — altura/peso are the already-generic FR-2 fields, not re-specified here (corrected 2026-10-05; an earlier pass had mistakenly duplicated them)
- **Atributos destacados** (multi-select chips, reusing the existing `FilterChips.vue` component/pattern already built for the sport filter — 6-8 options max, plus one optional short free-text field "otras cualidades" for anything not covered): Visión de juego, Regate/1v1, Potencia física, Cobrador de tiros libres, Buen pie débil, Liderazgo/Capitán
- **Historial y palmarés:** trayectoria de clubes/academias previas; logros y títulos (campeonatos, ascensos, torneos destacados); reconocimientos individuales (Goleador del torneo, MVP, Valla menos vencida, Selección regional/nacional); estadísticas de la última temporada (partidos jugados, minutos disputados, goles, asistencias, tarjetas); convocatorias/selecciones (locales, departamentales/estatales, nacionales juveniles)

**Notes:** `[ASSUMPTION]` Position-dependent stat relevance (e.g. a goalkeeper's meaningful stat is clean sheets/goles recibidos, not goles anotados) is handled at **display** time, not by forking the field set further — the same uniform field list is collected for every posición, with position-irrelevant stats simply left blank/zero. This keeps fútbol at the simpler single-field-set tier rather than introducing a BMX-style fork; revisit if the user wants true per-position field sets later.

### Patinaje (confirmed 2026-10-05)

Uses the same two-phase, multi-modalidad mechanism as Ciclismo (see above) — a patinador can hold several modalidades at once, same as a ciclista.

**Modalidades + sub-modalidad (required where listed) — confirmed final 2026-10-05, 4 modalidades:**
- **Patinaje de Velocidad** → Pista, Ruta, Maratón, Relevos
- **Patinaje Artístico** → Libre, Parejas, In-Line Artístico
- **Freestyle/Slalom** → Classic, Speed Slalom, Battle, Jump/Salto
- **Patinaje Agresivo/Street/Park** → Vert, Bowl, Street, Grinds

`[Resolved 2026-10-05: the original 5th bucket "Roller Derby/Roller Dance" was dropped entirely — Roller Dance is a dance/choreography discipline (overlapped with Artístico's now-removed "Danza" sub-type) and Roller Derby is an unrelated team contact sport, neither fit the user's "solo velocidad, relevos, etc." criterion. "Relevos" (relay) was added as a Velocidad sub-modalidad instead, since team relay races are a real competitive speed-skating format.]`

**Fields (shared across every modalidad — unlike Ciclismo, Patinaje's field set does NOT vary much by modalidad beyond the selection itself):**
- Categoría/Nivel de competencia: Novatos, Transición, Prejuvenil, Juvenil, Mayores/Élite, Máster
- Club, liga o escuela actual (nombre del club/liga departamental/estatal/equipo independiente)
- Ranking y resultados en válidas (posición en Ranking Nacional/Departamental de la federación o liga)
- Principales logros (podios, medallas, clasificaciones en Campeonatos Nacionales, Válidas de Categoría, Copas del Mundo, Maratones locales/internacionales)
- Convocatorias (selección departamental, provincial, o Selección Nacional)
- Calendario competitivo (torneos, válidas, eventos objetivo para la temporada actual)

### Boxeo (confirmed 2026-10-05)

Single modalidad, no fan-out — the user initially asked for an Amateur-vs-Profesional fork (mirroring BMX's Race/Freestyle) but reversed that decision: one shared field set covers both, with Amateur/Profesional kept as a plain descriptive field rather than a structural fork.

- Categoría de peso (mosca, gallo, pluma, ligero, welter, mediano, pesado, etc. — fixed list, standard boxing weight classes)
- Guardia: ortodoxa o zurda/southpaw
- Gimnasio/club de entrenamiento y entrenador
- Estilo de pelea: técnico, pegador, contragolpeador
- Modalidad (descriptive only, does not fork the field set): Amateur, Profesional, o Ambos
- Récord: peleas ganadas/perdidas/empatadas, nocauts/KOs
- Federación/liga u organismo sancionador al que pertenece
- Convocatorias/logros/rankings (selección departamental/nacional, títulos, posición en ranking)

**Still open, not yet brainstormed as of 2026-10-05:** the generic "otro" fallback field list, and FR-49's additional Ítem de Catálogo fields — continuing in the next session (see `_bmad-output/brainstorming/brainstorm-deportes-catalogo-campos-2026-10-03/.memlog.md`).

## FR-51 — Multiple Social Media Profiles, UX Mechanism (confirmed 2026-11-06)

Mechanism, not just "multiple links": each entry is added via a **platform picker (icon + name) → URL field** pair, not a bare free-text list.

- **Fixed platform list (with icon each):** Instagram, Facebook, TikTok, X/Twitter, YouTube, WhatsApp, LinkedIn.
- **"Otro" option:** free-text platform name + URL, for anything not in the fixed list.
- **Cap:** at most one entry per platform from the fixed list — once added, that platform is removed/disabled from the picker so it can't be added twice. "Otro" has no cap (its name is free text, so duplicates are distinguishable by the user's own label).
- Applies uniformly to all four TipoUsuario (Deportista, Marca, Nutricionista, Patrocinador), replacing each type's existing single `link redes sociales` / `URL de red social` field from FR-2.

## FR-53 — Profesional de la Salud, Fixed Profession List + Rationale (confirmed 2026-11-13)

Replaces the Nutricionista TipoUsuario's free-text `profesión` field with a fixed-list selector, same pattern as `deporte` (FR-19/FR-50) and `género`/`país` (FR-38).

- **Fixed profession list:** Nutrición, Fisioterapia, Kinesiología, Psicología deportiva, Psicología, Otro.
- **"Otro" option:** free-text profession name required when picked — same fallback pattern as `deporte`'s "otro" and FR-51's "Otro" platform.
- **`especialidad` reinterpreted, not replaced:** the existing free-text `especialidad` field (FR-25) is NOT the profession selector — it stays free text, now scoped as the sub-specialty *within* whichever profession is chosen (e.g. a Nutrición professional might enter "deportiva" or "clínica" as their especialidad; a Fisioterapia professional might enter "deportiva" or "neurológica"). This avoids conflating "what profession are you" (now fixed-list) with "what's your angle within that profession" (still free text).
- **Directory filter:** the renamed "Profesionales de la Salud" directory gains a profession filter using this same fixed list, mirroring Story 2.5's sport-filter chips on Deportistas (reuses `FilterChips.vue`'s existing single-select mode — no `multiple` needed here since a Usuario has exactly one profession, unlike Fútbol's multi-select atributos from FR-50).
- **Reused mechanism, not rebuilt:** the Reseña (rating + comment), moderation (FR-36), and one-review-per-target (FR-37) mechanics are completely unchanged — they already operate on "the Usuario being reviewed," not on anything Nutricionista-specific in their own logic, so broadening the TipoUsuario's label and profession set doesn't require touching that code path. The only coupling to verify at implementation time is the `Resena` Prisma model's relation name (`nutricionista`), which is a naming cleanup, not a behavior change.
- **Naming scope — what renames, what doesn't:** "Nutricionista" as a *profession value* still exists (it's the first entry in the new fixed list) — only the *TipoUsuario* and *directory* labels broaden to "Profesional de la Salud." A Usuario who is a nutritionist still ends up with profession = "Nutrición"; what changes is that a fisioterapeuta or psicólogo deportivo can now register truthfully too, under the same TipoUsuario.

## FR-54 — "Entrenador" Gap, Scoping Notes for Later (confirmed as a gap 2026-11-13, not designed)

This is intentionally thin — the point of this entry is to preserve the question, not answer it:

- Raised directly against FR-53's profession list: an entrenador/coach is explicitly **not** one of the six profession values above, because coaching is a performance/training role, not a health profession — conflating them would misrepresent both.
- Known open questions for whenever this gets scoped: Is it a 5th/6th `TipoUsuario`, or a role/flag on an existing type (e.g. a Deportista who is also a coach)? Does it get its own directory, or live inside an existing one? Does the Reseña mechanism apply to coaches the way it does to Profesionales de la Salud (FR-24/36/37) or Ítems de Catálogo (FR-52)? What fields would matter — certifications, sport(s) coached, gimnasio/club affiliation (today just a free-text sub-field of Boxeo's `camposEspecificos.gimnasioClubEntrenador`, FR-50)?
- None of these are answered here. This section exists so the next person scoping it starts from "here's what was asked" instead of rediscovering the gap.

## Reportes/Indicadores — Charting Approach Options

No charting library currently exists in the stack. Options to evaluate at architecture time (not decided here):
- Lightweight/free options compatible with Vue 3 / Nuxt 4 (e.g., Chart.js via a Vue wrapper, or a native SVG-based approach for a single donut/bar chart given the MVP only needs one visualization).
- Given the Cost guardrail (PRD §7): prefer free/open-source, avoid paid charting SaaS.
- Should be chosen with an eye toward the PRD's note that Reportes/Indicadores is a first slice — more metrics are expected post-MVP, so a library that scales past a single chart type is preferable to a one-off SVG hack, if effort allows.
