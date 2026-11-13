---
baseline_commit: 10ff8cc9e70246a34ea616c41a4a913ad2b1e10f
---

# Story 1.8: Lista de deportes enfocada y campos dinámicos para Fútbol, Boxeo y Otro

Status: review

## Story

As a prospective or existing Deportista,
I want to select from a focused list of 4 sports (or "otro"), with fields tailored to Fútbol or Boxeo when I pick one of those,
so that the registration form asks me only what's relevant to my sport.

## Acceptance Criteria

1. **Given** I'm on the registration form or editing my profile as Deportista **When** I open the `deporte` selector **Then** I see exactly 5 options in this order: Fútbol, Ciclismo, Patinaje, Boxeo, Otros (FR-50) — the dropdown is narrowed to these 5, but the underlying `Deporte` table keeps all 10 existing rows untouched (see Dev Notes — Story 2.5/2.7 handle the directory-side migration later)
2. **Given** I select Fútbol **When** the form reveals fields **Then** I see: posición principal, posición secundaria (opcional), pie dominante, club actual, categoría/nivel de competencia, salto vertical, atributos destacados (multi-select chips reusing `FilterChips.vue` in its new `multiple` mode + one optional free-text "otras cualidades"), trayectoria de clubes, logros y títulos, reconocimientos individuales, estadísticas de la última temporada, convocatorias/selecciones — per `addendum.md`'s Fútbol spec
3. **Given** I select Boxeo **When** the form reveals fields **Then** I see: categoría de peso, guardia, gimnasio/club y entrenador, estilo de pelea, modalidad (amateur/profesional/ambos — descriptive only), récord, federación/liga u organismo sancionador, convocatorias/logros/rankings — the same uniform set regardless of the modalidad value chosen (no fork)
4. **Given** I select Otros **When** the form reveals fields **Then** I see the existing generic field set completely unchanged (nivel deportivo, años de experiencia, objetivos actuales, marcas personales opcional, lesiones opcional) — no new fields added or removed
5. **Given** I select Ciclismo or Patinaje **When** the form responds **Then** it behaves exactly like today (generic field set, same as Otros) as an explicit interim stopgap — Story 1.9 owns building their real multi-modalidad mechanism; this story does not implement that path and must not leave those two options non-functional
6. **Given** altura, peso, nombre/apellido, fecha de nacimiento, and redes sociales (Story 1.10) **When** any sport is selected **Then** these remain the already-existing universal FR-2/FR-51 fields, never duplicated per sport, and `nivel`/`experiencia` (on `UsuarioDeporte`) also stay universal, untouched by this story
7. **Given** this narrows the shared `deporte` fixed-list source **When** this story ships **Then** Story 2.5's filter chips and the Deportistas directory still reference the OLD 10-sport list until Story 2.7 updates them — a known, temporary inconsistency, not a blocker to this story's acceptance

## Tasks / Subtasks

- [x] Task 1: Schema — add `camposEspecificos` to `UsuarioDeporte`, seed Patinaje (AC: #1, #2, #3)
  - [x] In `prisma/schema.prisma`, add one nullable column to the existing `UsuarioDeporte` model: `camposEspecificos Json?`. Do **not** create per-sport models (`CamposFutbol`, `CamposBoxeo`, etc.) — a single flexible JSON column is the deliberate architectural choice here, because Story 1.9 will need several more field sets (one per Ciclismo/Patinaje modalidad) and a relational model per set would mean ~9 new Prisma models for that story alone. This column is the pattern Story 1.9 extends, not a one-off.
  - [x] Run `npx prisma migrate dev --name add_campos_especificos_usuario_deporte` then `npx prisma generate`.
  - [x] In `prisma/seed.ts`, add `"Patinaje"` to the existing `deportes` array (line ~137-148) — it is currently missing entirely from the 10-sport seed list. Keep every other existing sport name as-is (`"Fútbol"`, `"Baloncesto"`, `"Ciclismo"`, `"Running"`, `"Crossfit"`, `"Voleibol"`, `"Gimnasia"`, `"Boxeo"`, `"Natación"`, `"Otros"`) — do not remove or rename any of them (AC #7 — Story 2.7's job, not this one). The existing `upsert` loop is idempotent; just add the one string and re-run `npx prisma db seed`.

- [x] Task 2: New `shared/utils/camposDeporte.ts` — fixed lists + required-field keys (AC: #2, #3)
  - [x] **Nuxt 4 reminder (confirmed in Stories 1.1/1.7):** only `shared/utils/` and `shared/types/` auto-import across both `app/` and `server/` — do not create a `shared/constants/` file, it silently won't auto-import.
  - [x] Content (pure constants, no `createError` here — that lives server-side in Task 3):
    ```ts
    export const FUTBOL_POSICIONES = ["Portero", "Defensa central", "Lateral", "Mediocampista", "Extremo", "Delantero"] as const;
    export const FUTBOL_PIE_DOMINANTE = ["Derecho", "Izquierdo", "Ambidiestro"] as const;
    export const FUTBOL_NIVEL_COMPETENCIA = ["Aficionado", "Semiprofesional", "Profesional", "Selección", "Ligas menores por edad"] as const;
    export const FUTBOL_ATRIBUTOS = ["Visión de juego", "Regate/1v1", "Potencia física", "Cobrador de tiros libres", "Buen pie débil", "Liderazgo/Capitán"] as const;
    export const CAMPOS_FUTBOL_REQUERIDOS = [
      "posicionPrincipal", "pieDominante", "clubActual", "nivelCompetencia", "saltoVertical",
      "atributosDestacados", "trayectoriaClubes", "logrosTitulos", "reconocimientosIndividuales",
      "estadisticasUltimaTemporada", "convocatoriasSelecciones",
    ] as const;

    export const BOXEO_CATEGORIAS_PESO = ["Mosca", "Gallo", "Pluma", "Ligero", "Welter", "Mediano", "Pesado"] as const;
    export const BOXEO_GUARDIA = ["Ortodoxa", "Zurda/Southpaw"] as const;
    export const BOXEO_ESTILO = ["Técnico", "Pegador", "Contragolpeador"] as const;
    export const BOXEO_MODALIDAD = ["Amateur", "Profesional", "Ambos"] as const;
    export const CAMPOS_BOXEO_REQUERIDOS = [
      "categoriaPeso", "guardia", "gimnasioClubEntrenador", "estiloPelea", "modalidad",
      "record", "federacionLiga", "convocatoriasLogrosRankings",
    ] as const;
    ```
  - [x] `posicionSecundaria` (Fútbol) and `otrasCualidades` (Fútbol) are intentionally **not** in `CAMPOS_FUTBOL_REQUERIDOS` — both are explicitly opcional per `addendum.md`.
  - [x] In the existing `shared/utils/fixedLists.ts`, add `export const DEPORTES_ENFOCADOS = ["Fútbol", "Ciclismo", "Patinaje", "Boxeo", "Otros"] as const;` right next to `GENEROS`/`PAISES` — same file, same convention, since this is a fixed display/order list like the others, not sport-specific field data (that's Task 2's new file).
  - [x] `[ASSUMPTION]` The DB row is named `"Otros"` (plural, pre-existing) while the PRD/epics text says "otro" (singular) — cosmetic only, not worth a rename/migration. The UI simply displays whatever `nombre` the row has.

- [x] Task 3: New `server/utils/camposDeporte.ts` — validation (AC: #2, #3, #4, #5)
  - [x] Server-only (uses `createError`, needs the required-keys arrays from Task 2's shared file):
    ```ts
    import { CAMPOS_FUTBOL_REQUERIDOS, CAMPOS_BOXEO_REQUERIDOS } from "#shared/utils/camposDeporte";

    function isEmpty(v: any): boolean {
      return v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
    }

    export function validarCamposDeporte(deporteNombre: string, campos: Record<string, any> | null | undefined) {
      if (deporteNombre === "Fútbol") {
        const faltantes = CAMPOS_FUTBOL_REQUERIDOS.filter((k) => isEmpty(campos?.[k]));
        if (faltantes.length > 0) {
          throw createError({ statusCode: 400, message: `Faltan campos de fútbol: ${faltantes.join(", ")}` });
        }
      } else if (deporteNombre === "Boxeo") {
        const faltantes = CAMPOS_BOXEO_REQUERIDOS.filter((k) => isEmpty(campos?.[k]));
        if (faltantes.length > 0) {
          throw createError({ statusCode: 400, message: `Faltan campos de boxeo: ${faltantes.join(", ")}` });
        }
      }
      // Ciclismo, Patinaje, Otros, y cualquier deporte legado (Baloncesto, Running, etc.):
      // no se valida ni se espera camposEspecificos — permanece null (AC #4, #5).
    }
    ```

- [x] Task 4: Extend `FilterChips.vue` with a `multiple` mode (AC: #2)
  - [x] **Read the current file first** (`app/components/FilterChips.vue`) — it is single-select today: `modelValue: [String, Number, null]`, `toggle()` sets-or-clears one value. It's already used as-is in `app/pages/deportistas/index.vue` for the sport filter — that usage must keep working unchanged (no `multiple` prop passed there, defaults to `false`).
  - [x] Add a `multiple: { type: Boolean, default: false }` prop. When `true`, `modelValue` is an array; `toggle(value)` pushes/splices instead of set-or-clear:
    ```ts
    const props = defineProps({
      options: { type: Array, required: true },
      modelValue: { type: [String, Number, Array, null], default: null },
      multiple: { type: Boolean, default: false },
    });
    const emit = defineEmits(["update:modelValue"]);

    function isSelected(value) {
      return props.multiple
        ? Array.isArray(props.modelValue) && props.modelValue.includes(value)
        : props.modelValue === value;
    }

    function toggle(value) {
      if (!props.multiple) {
        emit("update:modelValue", props.modelValue === value ? null : value);
        return;
      }
      const current = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
      const idx = current.indexOf(value);
      if (idx === -1) current.push(value);
      else current.splice(idx, 1);
      emit("update:modelValue", current);
    }
    ```
  - [x] Update the template's `:class` binding to use `isSelected(option.value)` instead of the old inline `modelValue === option.value` check (so both modes render correctly).

- [x] Task 5: Server — persist and validate `camposEspecificos` (AC: #2, #3, #4, #5)
  - [x] `server/api/auth/register.post.ts`: after the existing deporte lookup (~line 117-122, `deporte = await prisma.deporte.findUnique(...)`), call `validarCamposDeporte(deporte.nombre, body.camposEspecificos)` when `deporte` is truthy (i.e. only for Deportista — Marca/Nutricionista/Patrocinador never reach this branch). In the `$transaction`'s `usuarioDeporte.create` call (~line 204-211), add `camposEspecificos: deporte.nombre === "Fútbol" || deporte.nombre === "Boxeo" ? (body.camposEspecificos ?? null) : null` — Ciclismo/Patinaje/Otros/legacy sports always store `null`, even if a client somehow sent a body.
  - [x] `server/utils/updateUsuarioProfile.ts`: the `deporte` param destructure (line 7) gains `camposEspecificos?: Record<string, any> | null`. Before writing (both the `existingDeporte` update and create branches, lines 85-96), resolve the target deporte's `nombre` via `prisma.deporte.findUnique({ where: { id: deporteData.deporteId } })` and call `validarCamposDeporte(targetDeporte.nombre, deporte.camposEspecificos)`, then set `deporteData.camposEspecificos = (targetDeporte.nombre === "Fútbol" || targetDeporte.nombre === "Boxeo") ? (deporte.camposEspecificos ?? null) : null`. This single shared util is called by **both** `PUT /api/profile` (self-edit) and `PUT /api/profile/[id]` (admin override) — one change covers both paths, no need to touch either route file.
  - [x] **Legacy-deporte guard (new, this story):** still in `updateUsuarioProfile.ts`, before accepting a deporte change, if the new `deporteData.deporteId` differs from the user's `existingDeporte?.deporteId` AND the new deporte's `nombre` is not in `DEPORTES_ENFOCADOS`, reject with `400` ("Solo puedes seleccionar Fútbol, Ciclismo, Patinaje, Boxeo u Otros."). This lets a Deportista who already has a legacy sport (e.g. Baloncesto) keep editing their profile without being forced to change sport — the dropdown (Task 6) still shows their current legacy value as an extra option precisely so they're never silently switched or blanked — but blocks any **new** assignment into a non-focus sport. Switching *into* a focus sport from a legacy one is allowed.
  - [x] No changes needed to `server/api/profile/index.get.ts`, `[id].get.ts`, `server/api/usuarios/[id].get.ts`, `index.get.ts` — all four use Prisma `include` (not `select`) on `UsuarioDeporte`, so the new `camposEspecificos` scalar column comes back automatically. Confirmed by reading all four.

- [x] Task 6: `register.vue` — narrow dropdown, add Fútbol/Boxeo sections (AC: #1, #2, #3, #4, #5, #6)
  - [x] Import `DEPORTES_ENFOCADOS` from `#shared/utils/fixedLists` and the new fixed lists from `#shared/utils/camposDeporte`.
  - [x] Replace the `deportes` dropdown source (currently `v-for="d in deportes"`, line ~118) with a computed `deportesFocales = computed(() => DEPORTES_ENFOCADOS.map(nombre => deportes.value.find(d => d.nombre === nombre)).filter(Boolean))` — this both filters AND fixes the display order to Fútbol/Ciclismo/Patinaje/Boxeo/Otros regardless of the API's alphabetical order. Render the `<option>`s from `deportesFocales`, not `deportes`.
  - [x] Add `const deporteSeleccionadoNombre = computed(() => deportes.value.find((d) => d.id === form.deporteId)?.nombre ?? null);` (uses the full `deportes` list for lookup, not the filtered one — the id is still valid even though the option list is narrowed).
  - [x] Add `form.camposEspecificos = {}` to the initial `reactive(form)` object (or set it lazily in `selectTipo`/on sport change — either is fine, just ensure it exists before submit).
  - [x] **Do not touch the existing "Perfil deportivo" block** (deporte/nivel/altura/peso/experiencia/redesSociales/objetivosActuales/marcasPersonales/lesiones, lines ~111-161) — per AC #6 these stay universal for every sport, unchanged.
  - [x] Immediately after that block, inside the same `<template v-if="tipoSeleccionado === 'Deportista'">`, add two new sibling `<div>` sections:
    - `v-if="deporteSeleccionadoNombre === 'Fútbol'"`: inputs/selects for `posicionPrincipal` (select, `FUTBOL_POSICIONES`), `posicionSecundaria` (select, `FUTBOL_POSICIONES`, labeled opcional), `pieDominante` (select, `FUTBOL_PIE_DOMINANTE`), `clubActual` (text), `nivelCompetencia` (select, `FUTBOL_NIVEL_COMPETENCIA`), `saltoVertical` (number), `<FilterChips :options="FUTBOL_ATRIBUTOS.map(a => ({value: a, label: a}))" v-model="form.camposEspecificos.atributosDestacados" multiple />`, `otrasCualidades` (text, labeled opcional), `trayectoriaClubes`/`logrosTitulos`/`reconocimientosIndividuales`/`estadisticasUltimaTemporada`/`convocatoriasSelecciones` (textarea, rows=2 each) — all bound to `form.camposEspecificos.<key>`.
    - `v-else-if="deporteSeleccionadoNombre === 'Boxeo'"`: selects for `categoriaPeso` (`BOXEO_CATEGORIAS_PESO`), `guardia` (`BOXEO_GUARDIA`), `estiloPelea` (`BOXEO_ESTILO`), `modalidad` (`BOXEO_MODALIDAD`); text for `gimnasioClubEntrenador`, `record`, `federacionLiga`; textarea for `convocatoriasLogrosRankings` — bound to `form.camposEspecificos.<key>`.
    - Use the existing `.reg-input` class and the same label/field markup pattern already used throughout this file (lines 60-160) — **no `dark:` variants here**, this whole panel is a fixed-black form (`bg-black text-white`, line 6), not theme-aware, unlike `ProfileEditForm.vue`.
  - [x] `handleSubmit()` already spreads `...form` into `authStore.register(...)` (line 445), which `$fetch`-POSTs the object as-is (confirmed in `app/stores/auth.ts` line 133-136) — `form.camposEspecificos` reaches the server automatically, no submit-logic change needed.

- [x] Task 7: `ProfileEditForm.vue` — same narrowing + sections, plus legacy-deporte display (AC: #1, #2, #3, #4, #5, #6)
  - [x] Same imports as Task 6. Build `deportesFocales` the same way, but **append the user's current deporte as an extra trailing option if its `nombre` is not in `DEPORTES_ENFOCADOS`** (reads `props.usuario?.UsuarioDeporte?.[0]?.deporte`) — so an existing Deportista with a legacy sport (e.g. Baloncesto) still sees and keeps their real value instead of it silently disappearing from the dropdown. This is what Task 5's server-side legacy-deporte guard is protecting.
  - [x] In `buildForm()` (line ~323-368), add `camposEspecificos: deporte?.camposEspecificos ?? {}` inside the returned `deporte: {...}` object (alongside the existing `deporteId`/`nivel`/`experiencia`).
  - [x] Add `const deporteSeleccionadoNombre = computed(() => deportes.value.find((d) => d.id === form.deporte.deporteId)?.nombre ?? null);` — note the different data path (`form.deporte.deporteId` here, vs `form.deporteId` in `register.vue` — these two files are not shape-compatible, don't copy-paste blindly).
  - [x] Add the same two conditional sections as Task 6, inside `<template v-if="tipo === 'Deportista'">` (line 30), bound to `form.deporte.camposEspecificos.<key>` instead of `form.camposEspecificos.<key>`. **This form already uses `dark:` variants everywhere** (e.g. line 34 `dark:border-gray-600 dark:bg-neutral-700 dark:text-white`) — match that pattern for the new fields, do not copy `register.vue`'s undark'd markup here.
  - [x] `handleSubmit()` already sends `deporte: tipo.value === "Deportista" ? form.deporte : undefined` (line 423) — `camposEspecificos` nested inside reaches the server automatically once the above wiring is in place.

## Dev Notes

### Why a JSON column, not per-sport Prisma models

This is the one real architecture decision in this story, made here because no architecture doc covers FR-50's data model yet. A `camposEspecificos Json?` column on `UsuarioDeporte` — rather than `CamposFutbol`/`CamposBoxeo` tables — was chosen because Story 1.9 will need several more field sets (Ciclismo: Ruta/MTB/BMX×2/Downhill/Pista; Patinaje: 4 modalidades), and a fully relational approach would mean ~9 additional models for that story alone. One flexible JSON column, validated at the application layer (`server/utils/camposDeporte.ts`'s `validarCamposDeporte()`), keeps this consistent and avoids schema bloat disproportionate to a solo-dev project. **Story 1.9 should reuse this same column** — likely shaping its JSON as `{ modalidades: { ruta: {...}, pista: {...} } }` to hold more than one modalidad per Usuario, since Ciclismo/Patinaje are multi-select unlike Fútbol/Boxeo — but that shape decision belongs to 1.9, not this story.

### Interim behavior for Ciclismo/Patinaje (AC #5) — don't skip this

The `deporte` dropdown now offers Ciclismo and Patinaje (they're 2 of the 5 focus sports), but Story 1.9 (still `backlog`) is what builds their real multi-modalidad fields. If this story did nothing for them, selecting either would be a dead end with no sport-specific UI and no error — technically "not broken" but a bad interim experience. The resolution: Ciclismo and Patinaje behave **exactly like Otros** for now (generic universal fields only, `camposEspecificos` stays `null`) until Story 1.9 ships. No special-casing needed in the template — simply don't add a third `v-else-if` branch for them; they fall through to "no extra section," identical to Otros today.

### Legacy sports are not being migrated or hidden (AC #7)

`Baloncesto`, `Running`, `Crossfit`, `Voleibol`, `Gimnasia`, `Natación` stay in the `Deporte` table, fully functional for any existing Deportista who already has one. This story only narrows the **registration/profile-edit dropdown's offered options** — it does not touch `/api/deportes`, Story 2.5's filter chips, or the Deportistas directory, which all still return/use the full 10-sport list until Story 2.7. Don't "clean up" the seed list beyond adding Patinaje; removing the other 6 names would orphan existing Usuarios' sport data.

### Previous story intelligence (Story 1.7)

- Confirmed Nuxt 4 quirk (originally found in 1.1): only `shared/utils/` and `shared/types/` auto-import across `app/`+`server/` — `shared/constants/` silently does not. Both new files in this story go in `shared/utils/` and `server/utils/` accordingly.
- `requireSession()`, `authorOrAdmin`, `useResourcePermissions` exist now (built in 1.7) but are **not relevant here** — this story's registration/profile-edit endpoints already have their own auth handling (`getServerSession`/`requireSession` as applicable) and don't touch author/admin edit-permission logic at all.

### No test framework

Same project-wide convention as every prior story — no automated tests. Verify manually: register as Deportista with Fútbol (submit with a required campo missing → expect 400 with the right field names; submit complete → expect success and `UsuarioDeporte.camposEspecificos` populated), same for Boxeo, then Otros/Ciclismo/Patinaje (expect `camposEspecificos` stays `null`, no new fields shown). Edit an existing Deportista's profile the same way, including the legacy-sport-preserved-in-dropdown case (manually set a test user's deporte to "Running" via Prisma Studio first, then open their profile edit and confirm it's still selected and editable without being wiped).

### Project Structure Notes

- New: `shared/utils/camposDeporte.ts`, `server/utils/camposDeporte.ts`.
- Modified: `prisma/schema.prisma` (new column, new migration), `prisma/seed.ts` (add Patinaje), `shared/utils/fixedLists.ts` (add `DEPORTES_ENFOCADOS`), `app/components/FilterChips.vue` (add `multiple` mode, backward-compatible), `server/api/auth/register.post.ts`, `server/utils/updateUsuarioProfile.ts`, `app/pages/register.vue`, `app/components/ProfileEditForm.vue`.
- No changes to any GET endpoint (all use `include`, not `select` — new column returns automatically).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.8] — story statement and AC source
- [Source: _bmad-output/planning-artifacts/prds/prd-Elite_Hub-2026-07-19/addendum.md#FR-50 — Sport-Specific Fields, Fútbol, Boxeo sections] — verbatim field lists this story implements
- [Source: _bmad-output/planning-artifacts/prds/prd-Elite_Hub-2026-07-19/prd.md#FR-50] — FR-level requirement text
- [Source: prisma/schema.prisma#UsuarioDeporte, #Deporte, #Informacion] — existing data model this story extends
- [Source: prisma/seed.ts lines 136-155] — current 10-sport seed list, missing Patinaje
- [Source: server/api/auth/register.post.ts] — registration flow this story extends
- [Source: server/utils/updateUsuarioProfile.ts] — shared profile-update util used by both self-edit and admin-override paths
- [Source: app/pages/register.vue, app/components/ProfileEditForm.vue] — the two forms this story modifies, confirmed not shape-compatible with each other
- [Source: app/components/FilterChips.vue] — confirmed single-select today, used as-is by app/pages/deportistas/index.vue's sport filter
- [Source: app/stores/auth.ts lines 128-148] — confirms `register()` posts the form object verbatim

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npx prisma db seed` is a no-op in this project — there is no `prisma.seed` config entry in `package.json`, so `prisma db seed` silently exits with no output and does not run `prisma/seed.ts`. The actual working command is the `seed` npm script (`npx ts-node prisma/seed.ts` / `pnpm run seed`). Verified by running both: `prisma db seed` left "Patinaje" missing from the `Deporte` table; `ts-node prisma/seed.ts` added it (confirmed via a direct Prisma query before/after). Future stories touching `prisma/seed.ts` should use `pnpm run seed`, not `npx prisma db seed`.
- `npx nuxt build` completed successfully after all 7 tasks, confirming no TypeScript/Vue compile errors across the new and modified files (no `typescript.typeCheck` configured in `nuxt.config.ts`, so this is a transpile/bundle check, not a full type-check — consistent with this project's existing validation level).

### Completion Notes List

- Task 1: Added `camposEspecificos Json?` to `UsuarioDeporte` in `prisma/schema.prisma`; ran `npx prisma migrate dev --name add_campos_especificos_usuario_deporte` (applied cleanly) and `npx prisma generate`. Added `"Patinaje"` to `prisma/seed.ts`'s `deportes` array and ran it via `npx ts-node prisma/seed.ts` (see Debug Log — `prisma db seed` does not work in this project). Verified via direct query: `Deporte` table now has all 11 names including Patinaje, with the original 10 untouched.
- Task 2: Created `shared/utils/camposDeporte.ts` with the Fútbol/Boxeo fixed lists and required-field-key arrays, exactly as specified. Added `DEPORTES_ENFOCADOS` to the existing `shared/utils/fixedLists.ts`.
- Task 3: Created `server/utils/camposDeporte.ts` with `validarCamposDeporte()`, throwing a 400 with the specific missing field names for Fútbol/Boxeo; no-ops for Ciclismo/Patinaje/Otros/legacy sports.
- Task 4: Extended `app/components/FilterChips.vue` with a `multiple` prop (default `false`), `isSelected()` helper, and array-based `toggle()`. The existing single-select usage in `app/pages/deportistas/index.vue` passes no `multiple` prop, so its behavior is unchanged (confirmed by reading that file's usage before editing — it doesn't pass `multiple`).
- Task 5: Wired `validarCamposDeporte()` into `server/api/auth/register.post.ts` (called after the deporte lookup, before the transaction) and into `server/utils/updateUsuarioProfile.ts` (resolves the target deporte's `nombre` via a fresh `prisma.deporte.findUnique`, then validates and conditionally persists `camposEspecificos` — `null` unless Fútbol/Boxeo). Implemented the legacy-deporte guard in `updateUsuarioProfile.ts`: rejects with 400 when the deporte is actually changing (`existingDeporte?.deporteId !== nuevoDeporteId`) into a non-`DEPORTES_ENFOCADOS` sport, but allows no-ops on an existing legacy value and allows switching from a legacy sport into a focus sport. No changes were needed to any GET endpoint (all confirmed to use Prisma `include`, which already returns the new scalar column).
- Task 6: `register.vue` — added the `deportesFocales` (filtered + ordered to the 5 focus sports) and `deporteSeleccionadoNombre` computeds, `form.camposEspecificos = {}` in the initial reactive form, and two new conditional sections (Fútbol, Boxeo) inserted right after the existing "Perfil deportivo" block, using the plain `.reg-input` class with no `dark:` variants (matches this panel's fixed black background). The Fútbol section's "atributos destacados" uses `FilterChips` in its new `multiple` mode. Ciclismo/Patinaje/Otros fall through with no extra section, per AC #5's interim-stopgap behavior — no code branch needed for that, by design.
- Task 7: `ProfileEditForm.vue` — same two sections, bound to `form.deporte.camposEspecificos.*` instead (different data shape than `register.vue`, confirmed not reusable 1:1), using the existing `dark:` variant classes throughout. `deportesFocales` here also appends the user's current deporte as a trailing option when it's a legacy (non-focus) sport, so an existing Deportista's legacy value is never silently dropped from the dropdown — this is the client-side half of Task 5's server-side legacy-deporte guard. `buildForm()` now seeds `camposEspecificos` from the loaded `UsuarioDeporte` row.
- Manual verification performed: confirmed `Deporte` table contents via direct Prisma query (11 rows, Patinaje present, nothing removed); confirmed `npx nuxt build` succeeds with all changes in place. Full end-to-end manual QA (submitting the register/profile-edit forms in the browser for each of the 5 focus sports + a legacy sport) was not run in this session — recommended as a follow-up smoke test before merging, per this story's "No test framework" Dev Note.

### File List

**New:**
- `shared/utils/camposDeporte.ts`
- `server/utils/camposDeporte.ts`
- `prisma/migrations/20261107202933_add_campos_especificos_usuario_deporte/migration.sql`

**Modified:**
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `shared/utils/fixedLists.ts`
- `app/components/FilterChips.vue`
- `server/api/auth/register.post.ts`
- `server/utils/updateUsuarioProfile.ts`
- `app/pages/register.vue`
- `app/components/ProfileEditForm.vue`
