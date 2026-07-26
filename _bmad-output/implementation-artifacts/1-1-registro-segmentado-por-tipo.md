---
baseline_commit: 15f62c9f4a914086df42e026d20a7a85f2196431
---

# Story 1.1: Registro segmentado por tipo

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a prospective user (deportista, marca, nutricionista, or patrocinador),
I want to select my user type at registration and provide type-specific information,
so that my account is correctly segmented from day one.

## Acceptance Criteria

1. **Given** I'm on the registration page **When** I select a TipoUsuario (Deportista/Marca/Nutricionista/Patrocinador) **Then** the form immediately reveals that type's specific fields, with no page reload/transition (FR-1)

2. **Given** I've selected Deportista **When** I view the revealed fields **Then** I see: primer nombre, segundo nombre, primer apellido, segundo apellido, deporte (fixed list), fecha de nacimiento, género (fixed list), nacionalidad, ciudad de residencia, biografía corta, altura, peso, teléfono (opcional), nivel deportivo, años de experiencia, objetivos actuales, marcas personales (opcional), lesiones (opcional), link redes sociales (FR-2)

3. **Given** I've selected Marca **When** I view the revealed fields **Then** I see: nombre de la empresa, NIT, teléfono de contacto, dirección, nombre y cargo del contacto, descripción de la empresa, URL red social, URL del aplicativo web (FR-2)

4. **Given** I've selected Nutricionista **When** I view the revealed fields **Then** I see: nombres, apellidos, fecha de nacimiento, género, teléfono, país, ciudad de residencia, descripción corta, título profesional, universidad, año de graduación, especialidad, años de experiencia, certificados adicionales (opcional), modalidad de atención (FR-2)

5. **Given** I've selected Patrocinador **When** I view the revealed fields **Then** I see: nombres, apellidos, fecha de nacimiento, teléfono, país, ciudad, descripción breve, sitio web (opcional) (FR-2)

6. **Given** any type is selected **When** I attempt to submit género or país as free text outside the fixed lists **Then** submission is rejected (FR-38)

7. **Given** any type **When** I leave an "(opcional)" field blank **Then** submission succeeds **And** leaving any other required field blank causes submission to be rejected

8. **Given** I have not checked the Terms & Conditions checkbox **When** I attempt to submit **Then** submission is blocked **And** the checkbox is linked via hyperlink to the live `terms` content page (FR-4)

9. **Given** valid input across all required fields and T&C accepted **When** I submit **Then** an account is created with the correct TipoUsuario, correo, and hashed contraseña (FR-5)

10. **Given** I'm viewing the registration form **When** I look for a profile-photo upload field **Then** none exists — photo upload happens post-login only, on the profile-edit surface (Epic 2, FR-6)

11. **Given** I close the browser tab mid-form **When** I return to `/register` **Then** the form is blank — no partial account was created

## Tasks / Subtasks

- [x] Task 1: Prisma schema migration (AC: #2, #3, #4, #5, #6, #9)
  - [x] Add net-new fields to `Informacion` in `prisma/schema.prisma` (see Dev Notes for exact field list/types)
  - [x] Add new `ModalidadAtencion` enum (`VIRTUAL`, `PRESENCIAL`)
  - [x] Change `UsuarioDeporte.frecuenciaSemanal` from a bare required `Int` to `Int @default(0)` — registration doesn't collect this field, and it's currently NOT NULL with no default, which would break Deportista account creation
  - [x] Run `npx prisma migrate dev --name registro_segmentado_por_tipo`
  - [x] Update `prisma/seed.ts` to seed the `Deporte` table with FR-19's canonical 10-value list (currently unseeded — the `Deporte` model exists but has zero rows today)
- [x] Task 2: Fixed-list shared source (AC: #6)
  - [x] Create `shared/utils/fixedLists.ts` exporting `GENEROS` and `PAISES` (see Dev Notes for exact values and the género/país architectural call)
  - [x] Create `server/api/deportes/index.get.ts` — GET all `Deporte` rows ordered by `nombre`, mirroring `server/api/tipousuario/index.get.ts`'s existing pattern exactly
- [x] Task 3: Backend registration handler rewrite (AC: #1, #2, #3, #4, #5, #6, #7, #8, #9, #11)
  - [x] Rewrite `server/api/auth/register.post.ts` to accept `tipoUsuarioId` + per-type fields + `aceptaTerminos`, validate server-side (required/optional per type, género/país against `shared/utils/fixedLists.ts`, `aceptaTerminos === true`, correo uniqueness), and create the account inside a single `prisma.$transaction` (Informacion → Usuario → UsuarioDeporte/RedSocial as applicable) so a failed step never leaves a partial account (AC #11)
  - [x] Use `createError({ statusCode, message })` — not `statusMessage` — matching ARCHITECTURE-SPINE's Consistency Convention (this file already violates it today; fix while rewriting)
  - [x] Continue using the shared `prisma` singleton (already correct in this file — do not regress)
- [x] Task 4: Frontend registration form rewrite (AC: #1, #2, #3, #4, #5, #7, #8, #10)
  - [x] Rewrite `app/pages/register.vue` per the mockup's structure (type-selector row, field-section grouping, 2-col grid, T&C row) — fetch `TipoUsuario` list from existing `GET /api/tipousuario`, `Deporte` list from new `GET /api/deportes`, género/país options from `shared/utils/fixedLists.ts`, nivel/modalidad options hardcoded (enum-backed, only a few stable values, same convention as the existing `Nivel` usage elsewhere)
  - [x] Selecting a type toggles which field-section(s) render — no route change, no reload (AC #1)
  - [x] Mark required vs. "(opcional)" fields in visible text next to the label, never color-only
  - [x] T&C checkbox blocks submit when unchecked; hyperlink points to `/terms` (existing page), opens in a new tab so in-progress form state isn't lost by navigating away
  - [x] No photo/avatar field anywhere on this form (AC #10)
- [x] Task 5: Update the Pinia store's register action (AC: #9)
  - [x] Update `app/stores/auth.ts`'s `register()` to accept the full type-specific payload (loosely typed pass-through, not a rigid per-field interface — see Dev Notes) and forward it as-is to `POST /api/auth/register`
- [x] Task 6: Validation error copy (AC: #6, #7, #8)
  - [x] Use EXPERIENCE.md's confirmed error-copy convention: name what's wrong and what to do, e.g. duplicate email → "El correo ya está registrado. Inicia sesión o usa otro correo." (exact string from EXPERIENCE.md Voice and Tone); no generic "Error al procesar la solicitud"
- [x] Task 7: Verify no partial-account-on-abandon (AC: #11)
  - [x] Confirm `register.vue` has no autosave/draft persistence (no `localStorage`/`sessionStorage` writes of in-progress form state) — nothing to add, just don't introduce one; the transactional backend (Task 3) is what actually guarantees no partial DB row

## Dev Notes

### Current state of `server/api/auth/register.post.ts` (full file today, to be replaced)

```ts
import { hash } from "bcrypt";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const { nombre, apellido, correo, password } = body;

	if (!nombre || !apellido || !correo || !password) {
		throw createError({ statusCode: 400, statusMessage: "Todos los campos son requeridos" });
	}
	try {
		const existingUser = await prisma.usuario.findUnique({ where: { correo: correo } });
		if (existingUser) {
			throw createError({ statusCode: 400, statusMessage: "El usuario ya existe" });
		}
		const hashedPassword = await hash(password, 12);
		const user = await prisma.usuario.create({
			data: { nombre, apellido, correo, password: hashedPassword },
		});
		return { message: "Usuario registrado exitosamente", user: { id: user.id, firstName: user.nombre, lastName: user.apellido, email: user.correo } };
	} catch (error: any) {
		if (error.statusCode) throw error;
		throw createError({ statusCode: 500, statusMessage: "Error interno del servidor" });
	}
});
```

It collects only `nombre/apellido/correo/password`, never sets `TipoUsuario`, never touches `Informacion`, uses the shared `prisma` global correctly already (good — do not regress this), and uses `statusMessage` (inconsistent with the spine's `message` convention — fix while rewriting). `prisma` here is auto-imported globally by Nitro from `server/utils/prisma.ts`'s default export — confirmed by this file and `server/api/tipousuario/index.get.ts` both calling `prisma.X` with zero import statement. **Do not** `import prisma from` anywhere in `server/api/**` — just reference the global, matching every existing handler.

### Current state of `app/pages/register.vue` (today)

A single-column form inside a photo(1/3)+black-panel(2/3) split (`Jugador.jpeg` stock photo on the left, form on black background on the right). Fields: `nombre`, `apellido`, `correo`, `password` only — bound via `reactive(form)` and `v-model`, submitted via `authStore.register(...)` in `app/stores/auth.ts`, which on success calls `signIn('credentials', ...)` then `navigateTo('/')`. No TipoUsuario selector, no type-specific fields, no T&C checkbox, no género/país. This story replaces the whole template and script.

### Mockup reference (visual/structural source of truth for this story)

`_bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/mockups/key-registro-tipo.html` shows: a `topbar` (black, "ELITE HUB" + login link), a `split` grid (`1.35fr 1fr`) — left is a **black `form-panel`** containing a `type-row` of 4 toggle buttons (Deportista/Marca/Nutricionista/Patrocinador, selected state = solid green `#15803d` fill), then `field-section-title` group headers ("Datos de acceso", "Datos personales", "Perfil deportivo" — swap the last per selected type) each followed by a `form-grid` (2-col grid of labeled inputs, `span-2` for textareas), a `tc-row` (checkbox + T&C hyperlink), and a green `btn-primary` ("Crear cuenta"); right is a light `brand-panel` with an abstract pattern + "EH" badge + marketing copy (replaces `Jugador.jpeg`). **Build this story's `register.vue` structurally like this mockup** (type-selector row, section-grouped 2-col grid, T&C row, no photo field) **using today's already-in-codebase Tailwind utility classes** (`bg-black`, `text-white`, `bg-green-700`/`hover:bg-green-700/80`, `rounded-lg`, `border-gray-300`, etc. — the same idiom `register.vue`/`login.vue` already use) — do **not** wait for Epic 7 Story 7.2's `@theme` design-token system (UX-DR1) or its dark-mode work; those are out of scope here. Removing `Jugador.jpeg` from this page as part of this rewrite is consistent with the mockup and does not conflict with Story 7.2, which will later apply full token consolidation on top.

### Prisma schema — exact current vs. new state

`Informacion` today (`prisma/schema.prisma` lines 68-91) has: `bio`, `telefono`, `genero`, `fechaNacimiento`, `profesion`, `especialidad`, `experiencia` (String?, free text — already bound generically in `app/pages/profile.vue`'s "Experiencia" textarea; do **not** repurpose this field for a numeric years-of-experience value), `nombreComercial`, `razonSocial`, `nit`, `sitioWeb`, `presupuestoMaximo`, `anosFuncionamiento`, `consultorios` (String[]), `tipoUsuarioId`/`tipoUsuario` relation, `direcciones` (Direccion[]), `redesSociales` (RedSocial[]), `usuarios` (Usuario[]).

None of the following exist yet — this story adds them as new nullable columns on `Informacion` (nullable because one `Informacion` shape now serves 4 different type-specific field sets; required-ness for a given type is enforced in the API handler, not by a DB NOT NULL constraint — same pattern the existing fields already use):

```prisma
model Informacion {
  // ...existing fields unchanged...

  // --- NEW for Story 1.1 ---
  segundoNombre           String?             // Deportista only
  segundoApellido         String?             // Deportista only
  nacionalidad            String?             // Deportista; fixed list — shares the PAISES source with `pais` below
  ciudadResidencia        String?             // Deportista/Nutricionista/Patrocinador; free text, deliberately NOT the relational Direccion model (see below)
  altura                  Float?              // Deportista, meters (e.g. 1.68)
  peso                    Float?              // Deportista, kg
  objetivosActuales       String?             // Deportista, required
  marcasPersonales        String?             // Deportista, opcional
  lesiones                String?             // Deportista, opcional
  pais                    String?             // Nutricionista/Patrocinador; fixed list — shares source with `nacionalidad`
  universidad             String?             // Nutricionista
  anoGraduacion           Int?                // Nutricionista
  anosExperiencia         Int?                // Nutricionista, numeric years — distinct from the existing free-text `experiencia` field
  certificadosAdicionales String?             // Nutricionista, opcional
  modalidadAtencion       ModalidadAtencion?  // Nutricionista: VIRTUAL | PRESENCIAL
  nombreContacto          String?             // Marca: nombre del contacto
  cargoContacto           String?             // Marca: cargo del contacto
  direccionContacto       String?             // Marca; free text, deliberately NOT the relational Direccion model
}

enum ModalidadAtencion {
  VIRTUAL
  PRESENCIAL
}
```

And on `UsuarioDeporte` (line 188-201): change
```prisma
frecuenciaSemanal Int
```
to
```prisma
frecuenciaSemanal Int @default(0)
```
because this field is currently required with no default, but FR-2's Deportista field list has no "frecuencia semanal" field — registration would fail to create the `UsuarioDeporte` row without this default.

**Fields reused as-is from the existing schema (no migration needed for these):**
- `Usuario.nombre`/`Usuario.apellido` (existing, required) ← Deportista's "primer nombre"/"primer apellido"; Nutricionista's/Patrocinador's "nombres"/"apellidos" (those two types only ask for one given-name/family-name each, not a 4-part breakdown — only Deportista needs `segundoNombre`/`segundoApellido`).
- `Informacion.bio` ← reused across **all four types** as the "short description" slot: Deportista's "biografía corta", Marca's "descripción de la empresa", Nutricionista's "descripción corta", Patrocinador's "descripción breve". One field, four labels depending on type — do not add a separate `descripcionEmpresa` field.
- `Informacion.telefono` ← Deportista (opcional), Marca ("teléfono de contacto"), Nutricionista, Patrocinador.
- `Informacion.genero` ← Deportista, Nutricionista (fixed list, FR-38).
- `Informacion.fechaNacimiento` ← Deportista, Nutricionista, Patrocinador.
- `Informacion.profesion` ← Nutricionista's "título profesional".
- `Informacion.especialidad` ← Nutricionista (also the standing FR-25 field, unrelated future story).
- `Informacion.nombreComercial` ← Marca's "nombre de la empresa".
- `Informacion.nit` ← Marca.
- `Informacion.sitioWeb` ← Marca's "URL del aplicativo web" AND Patrocinador's "sitio web (opcional)" — same column, two contexts, no conflict since each `Informacion` row belongs to one registration.
- `Informacion.redesSociales` (`RedSocial` relation, existing model: `nombre`, `url`, `informacionId`) ← Deportista's "link de redes sociales" and Marca's "URL de red social" — create one `RedSocial` row per registration when the field is provided, e.g. `{ nombre: "Red social principal", url, informacionId }`.
- `UsuarioDeporte.experiencia` (Int, existing) ← Deportista's "años de experiencia en el deporte" (numeric — confirmed mapping, do not add a duplicate field).
- `UsuarioDeporte.nivel` (`Nivel` enum, existing) ← Deportista's "nivel deportivo".
- `Deporte` model (existing, currently **unseeded** — zero rows in the DB today) ← Deportista's "deporte (fixed list)". This story must seed it (Task 1).

**Open architectural call flagged for the user/PM, decided here but worth a second look before Epic 2's Marca directory card (FR-16) is built:** `Usuario.nombre`/`Usuario.apellido` are required NOT NULL columns, but Marca registration has no personal given/family name — only "nombre de la empresa" and "nombre y cargo del contacto". Decision made in this story: `Usuario.nombre` = the entered company name (also stored canonically in `Informacion.nombreComercial`), `Usuario.apellido` = `""` (empty string, not null) for Marca signups only. This avoids a broader migration making `Usuario.apellido` nullable (which would ripple into every existing consumer of that field — directory cards, admin tables, header greeting). If FR-16's Marca directory card later wants a cleaner "razón social" label instead, source it from `Informacion.nombreComercial`, not `Usuario.apellido`.

### Género/país fixed-list design call (FR-38, NFR-12)

Deporte already exists as a **DB-backed** model (`Deporte` + `UsuarioDeporte` join) because Deportistas get *filtered* by sport in Epic 2 Story 2.5 (FR-19) — that relational shape earns its keep for querying/joins. Género and país have no such relational/filtering requirement anywhere in the current FR set — they're purely descriptive metadata on `Informacion`. Per ARCHITECTURE-SPINE's Consistency Convention ("single shared source... e.g. `shared/constants/`"), this story creates the **first** `shared/utils/` usage:

`shared/utils/fixedLists.ts` (NEW):
```ts
export const GENEROS = ["Femenino", "Masculino", "Otro", "Prefiero no decir"] as const;
export const PAISES = ["Colombia", "Venezuela", "Ecuador", "Otro"] as const;
```
`PAISES` is the single shared source for **both** Deportista's `nacionalidad` field and Nutricionista/Patrocinador's `pais` field — same fixed list, two field names/labels, per the mockup's own nacionalidad `<select>` (Colombiana/Venezolana/Ecuatoriana/Otra) which this story normalizes to noun form (Colombia/Venezuela/Ecuador/Otro) so one constant serves both fields without an adjective/noun mismatch. `shared/utils/` specifically (not `shared/constants/` or any other `shared/` subfolder) is the one Nuxt 4 auto-imports on both client and server with no import statement needed — confirmed no `shared/` directory exists yet in this repo (first usage). Placing the file anywhere else under `shared/` (e.g. `shared/constants/`) would require an explicit `#shared` alias import instead; use `shared/utils/fixedLists.ts` to get true zero-import auto-import in both `register.vue` and `register.post.ts`. Both files reference `GENEROS`/`PAISES` directly (auto-imported) — never hardcode the list in either place.

`Nivel` (Deportista's "nivel deportivo") and the new `ModalidadAtencion` (Nutricionista's "modalidad de atención") are Prisma **enums**, not free lists — their options are hardcoded directly in `register.vue`'s `<select>` (2-4 stable values each), matching how `UsuarioDeporte.nivel`/`Nivel` is already used elsewhere in the codebase; no shared-constants entry or DB table needed for these two.

### Required vs. optional fields per type (consolidated, AC #7)

| Type | Required fields | Optional fields |
| --- | --- | --- |
| Deportista | primer nombre, segundo nombre, primer apellido, segundo apellido, deporte, fecha de nacimiento, género, nacionalidad, ciudad de residencia, biografía corta, altura, peso, nivel deportivo, años de experiencia, objetivos actuales, link redes sociales | teléfono, marcas personales, lesiones |
| Marca | nombre de la empresa, NIT, teléfono de contacto, dirección, nombre y cargo del contacto, descripción de la empresa, URL red social, URL del aplicativo web | *(none — every Marca field is required, unlike the other three types)* |
| Nutricionista | nombres, apellidos, fecha de nacimiento, género, teléfono, país, ciudad de residencia, descripción corta, título profesional, universidad, año de graduación, especialidad, años de experiencia, modalidad de atención | certificados adicionales |
| Patrocinador | nombres, apellidos, fecha de nacimiento, teléfono, país, ciudad, descripción breve | sitio web |

Marca having zero optional fields is intentional per AC #3 (no "(opcional)" tag appears anywhere in that AC) — do not add optionality to any Marca field.

### Backend validation contract (server-side, authoritative — AC #6, #7, #9)

Expected request body shape (loosely typed, all type-specific fields optional at the wire level, required-ness enforced by the handler based on the selected `tipoUsuarioId`):
```ts
{
  tipoUsuarioId: number;       // FK into existing TipoUsuario table (already seeded: Deportista/Marca/Nutricionista/Patrocinador)
  correo: string;
  password: string;
  aceptaTerminos: boolean;     // must be === true or reject (AC #8)
  // ...type-specific fields per the field lists in AC #2-#5, named to match the new/reused schema fields above
}
```
Validation order: (1) `tipoUsuarioId` resolves to a real `TipoUsuario` row, (2) `correo`/`password` present, `correo` not already registered ("El correo ya está registrado. Inicia sesión o usa otro correo." — exact EXPERIENCE.md copy), (3) `aceptaTerminos === true`, (4) every required field for that specific type is present and non-empty (fields marked "(opcional)"/"(si aplica)" in AC #2-#5 may be blank), (5) `genero`/`nacionalidad`/`pais` values, if provided, must be members of `GENEROS`/`PAISES` respectively — reject with 400 otherwise (AC #6), (6) for Deportista, `deporteId` must resolve to an existing `Deporte` row. All failures throw `createError({ statusCode: 400, message: "<specific, actionable message>" })` — never `statusMessage` (Consistency Convention fix, Task 3).

On success, wrap the writes in a single transaction: `await prisma.$transaction(async (tx) => { ... })`. **Critical:** every write inside the callback MUST use `tx` (e.g. `tx.informacion.create(...)`, `tx.usuario.create(...)`, `tx.usuarioDeporte.create(...)`, `tx.redSocial.create(...)`), never the outer `prisma` singleton — calling `prisma.X.create()` instead of `tx.X.create()` inside the callback commits each write independently outside the transaction, silently defeating AC #11 (a mid-sequence failure would leave an orphaned partial account with no error surfaced). Sequence: create `Informacion` (type-specific fields + `tipoUsuarioId`) → create `Usuario` (correo, hashed password, nombre/apellido per the mapping above, `informacionId`) → for Deportista, create `UsuarioDeporte` (`deporteId`, `nivel`, `experiencia`, `frecuenciaSemanal` left at its new default) → for Deportista/Marca, create a `RedSocial` row if a social URL was provided. A transaction failure at any step leaves zero rows — this is what actually satisfies AC #11, not any client-side behavior. Also catch Prisma's `P2002` unique-constraint error (a race between the pre-check `findUnique` and the transactional create) and map it to the same "El correo ya está registrado..." message, rather than leaking a raw 500.

Password policy: enforce a minimum of 8 characters server-side (the mockup's password field shows a "Mínimo 8 caracteres" hint — the UI promise must be backed by real validation, not just `!password` truthiness as the current handler does).

### Frontend notes

- Type selector: fetch `GET /api/tipousuario` (existing, already returns `[{id, tipo, descripcion}]` ordered alphabetically — Deportista/Marca/Nutricionista/Patrocinador, which happens to already match the desired display order) to render the 4 toggle buttons; selecting one sets a local `selectedTipoId` ref and conditionally renders that type's field-section(s) — pure client-side `v-if`/`v-show`, no navigation (AC #1).
- Deporte select: fetch `GET /api/deportes` (new, Task 2).
- `app/stores/auth.ts`'s `register()` action: change its parameter type from the current rigid `{ nombre; apellido; correo; password }` to a loose pass-through, e.g. `register(payload: { tipoUsuarioId: number; correo: string; password: string; aceptaTerminos: boolean } & Record<string, unknown>)`, and forward `payload` as-is to `$fetch('/api/auth/register', { method: 'POST', body: payload })`. Do not enumerate all ~20 type-specific fields in the store's type signature — that would need editing on every future type-field change; the server is the validation authority (see above).
- Required vs. optional labeling: text tag next to the label (e.g. `<span class="opt-tag">(opcional)</span>`, per the mockup's own `.opt-tag` class), never color-only — this is also EXPERIENCE.md's Accessibility Floor requirement, not just a mockup detail.
- T&C hyperlink → `/terms` (existing page, confirmed present at `app/pages/terms.vue`), `target="_blank"` so navigating to read it doesn't discard in-progress form entry.
- Type-selector buttons: use `role="group" aria-label="Tipo de usuario"` on the wrapping row (matches the mockup) plus `aria-pressed="true"/"false"` on each toggle button reflecting selection state — the mockup shows the visual selected state (solid green fill) but not the ARIA state, and the Accessibility Floor requires the announced state to match, not just the visual one.
- `app/stores/auth.ts`'s existing post-register flow (`signIn('credentials', ...)` then `navigateTo('/')`) needs no changes beyond the `register()` parameter shape — it keeps working because the new loose payload still carries `correo`/`password`, which is all `signIn` needs.

### Explicit non-goal: T&C acceptance evidence

This story does not persist a timestamp or record of when/how a Usuario accepted the T&C — only that `aceptaTerminos === true` gated the create. No AC or NFR requires an audit trail for this; do not add one speculatively.

### Voice/tone (EXPERIENCE.md, verbatim)

Use exactly: "El correo ya está registrado. Inicia sesión o usa otro correo." for duplicate email. General rule: name what's wrong and what to do; never a generic "Error al procesar la solicitud"; no emoji, no mixed English/Spanish. This governs every rejection path in Task 3/6 (duplicate email, missing required field, out-of-list género/país, unchecked T&C).

### Explicit non-goals for this story (do not implement)

- Type immutability enforcement (FR-3) — Story 1.2. This story only sets the type correctly at creation.
- Profile photo upload (FR-6/Epic 2 Story 2.3) — the form must have zero photo fields; nothing else to do here.
- Any change to `server/api/profile/index.put.ts` — Story 1.2's job (it currently allows changing `tipoUsuarioId` via profile edit; that bug is out of scope here).

## Project Structure Notes

- `server/api/auth/register.post.ts` — **UPDATE**. Stays at its current path; Nitro method-suffixed handler convention already correctly followed.
- `server/api/deportes/index.get.ts` — **NEW**. Mirrors the existing `server/api/tipousuario/index.get.ts` file exactly (same shape: `defineEventHandler`, `prisma.deporte.findMany({ orderBy: { nombre: 'asc' } })`, same `createError` shape).
- `shared/utils/fixedLists.ts` — **NEW**. First use of Nuxt 4's `shared/` directory in this repo. Deliberately placed under `shared/utils/`, not `shared/constants/`, because only `shared/utils/` and `shared/types/` are auto-imported by Nuxt 4 — any other `shared/` subfolder requires an explicit `#shared` alias import. Establishes the pattern for all future fixed-value lists (catálogo categories in Epic 3 will follow the same file/pattern).
- `prisma/schema.prisma` — **UPDATE**. New `Informacion` fields, new `ModalidadAtencion` enum, `UsuarioDeporte.frecuenciaSemanal` default — additive, no destructive column changes.
- `prisma/seed.ts` — **UPDATE**. Add `Deporte` upserts (currently the file seeds `Pais`/`Ciudad`/`Barrio`, an admin `Usuario`, and `TipoUsuario` rows, but never `Deporte` — confirmed by reading the full file).
- `app/pages/register.vue` — **UPDATE**. Same path, full rewrite of template + script.
- `app/stores/auth.ts` — **UPDATE**. Only the `register()` action's parameter shape changes; `login`/`logout`/`checkAuth` untouched.

## References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1: Registro segmentado por tipo] — Story statement + all 11 ACs, copied verbatim above.
- [Source: _bmad-output/planning-artifacts/epics.md#Requirements Inventory > FR-1, FR-2, FR-4, FR-5, FR-6, FR-38] — exact field lists per type, T&C, photo deferral.
- [Source: _bmad-output/planning-artifacts/epics.md#Additional Requirements] — new-model naming/relation convention (not directly triggered by this story, no new Prisma model added), fixed-value-list convention.
- [Source: _bmad-output/specs/spec-Elite_Hub/functional-requirements.md#CAP-1 — Registration & Type-Segmented Onboarding (FR-1–FR-6, FR-38)] — field lists, the addendum's explicit schema-gap note (segundoNombre/segundoApellido/altura/peso/etc. don't exist on `Informacion` yet; `experiencia` is free-text vs. numeric years mapping to `UsuarioDeporte.experiencia`).
- [Source: _bmad-output/planning-artifacts/prds/prd-Elite_Hub-2026-07-19/prd.md#5.1 Registration & Type-Segmented Onboarding] — FR-1 through FR-6, FR-38 full text.
- [Source: _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md#AD-8 — Type immutability] — context only; confirms the real type path is `Usuario → Informacion → TipoUsuario`, no direct edge; immutability enforcement itself is Story 1.2.
- [Source: ARCHITECTURE-SPINE.md#Consistency Conventions] — Prisma singleton requirement, `createError({ message })` over `statusMessage`, fixed-value-list single-source convention (`shared/constants/`).
- [Source: ARCHITECTURE-SPINE.md#Capability → Architecture Map > §5.1 Registration & Onboarding] — confirms this lives in `app/pages` + `server/api` create handler, governed by AD-1/AD-8.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/EXPERIENCE.md#Key Flows > Flow 1 — Camila registers as a deportista] — step-by-step registration flow narrative.
- [Source: EXPERIENCE.md#Voice and Tone] — exact error-copy convention and confirmed strings.
- [Source: EXPERIENCE.md#Accessibility Floor] — required/optional labeled in text, not color alone.
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/DESIGN.md#Colors, Components] — brand-chrome black form panel, green-700 primary CTA, input styling (used loosely — full token system is Epic 7).
- [Source: ux-designs/ux-Elite_Hub-2026-07-23/mockups/key-registro-tipo.html] — structural/visual reference for the rewritten form.
- [Source: prisma/schema.prisma#Informacion, TipoUsuario, UsuarioDeporte, Deporte] — current field inventory this story extends.
- [Source: server/api/auth/register.post.ts] — current handler, replaced by this story.
- [Source: app/pages/register.vue] — current page, replaced by this story.
- [Source: app/stores/auth.ts#register] — current store action, signature updated by this story.
- [Source: server/utils/prisma.ts] — shared singleton, confirmed global auto-import pattern.
- [Source: server/api/tipousuario/index.get.ts] — pattern mirrored by the new `server/api/deportes/index.get.ts`.
- [Source: prisma/seed.ts] — confirmed `Deporte` is currently unseeded; `Pais`/`Ciudad`/`Barrio` seed data confirmed limited to Colombia (3 cities) — reason `ciudadResidencia`/`pais`/`direccionContacto` are plain string fields, not the relational `Direccion` model.

## Dev Agent Record

### Agent Model Used

Claude (bmad-dev-story)

### Debug Log References

- `npx prisma migrate dev --name registro_segmentado_por_tipo` — applied cleanly.
- `npx prisma generate` initially failed twice with `EPERM` renaming `query_engine-windows.dll.node` — caused by a stale `pnpm run dev` process left running from a prior session holding a lock on the file. Resolved both times by stopping the dev server process tree, then re-running `prisma generate`.
- `pnpm run seed` — seeded 10 `Deporte` rows, verified via a throwaway script (`p.deporte.findMany`), all 10 present.
- `npx prisma migrate dev --name modalidad_atencion_hibrido` — added `HIBRIDO` to `ModalidadAtencion` per user request during manual verification (see Change Log).

### Completion Notes List

- All 7 tasks implemented: schema migration + seed, fixed-list shared source, backend handler rewrite (transactional, `tx`-scoped, P2002-safe), frontend form rewrite (all 4 type variants), Pinia store signature update, error copy, no-partial-account verification.
- No unit tests authored per explicit user decision (2026-07-25): PRD/SPEC declare "no formal unit/component test suite" as an MVP non-goal and no test framework is installed. Verified manually instead: dev server started, `/register` exercised in a real Chrome tab (Deportista type selection, all fields, T&C), full end-to-end submit test intentionally deferred to the user to save tokens (in progress as of this note).
- Two post-review adjustments applied at user request before closing the story (see Change Log).

### Change Log

- 2026-07-25: Added `HIBRIDO` to the `ModalidadAtencion` enum (new migration `modalidad_atencion_hibrido`) — Nutricionista's "modalidad de atención" now offers Presencial/Virtual/Híbrido instead of just the two originally specced in FR-2. Requested by user after seeing the form live: some nutricionistas attend both virtually and in person.
- 2026-07-25: Registration form now preselects "Deportista" as the default `tipoUsuarioId` on mount, so type-specific fields render immediately on landing at `/register` instead of requiring an extra click on the type selector. The other three types remain one click away via the same toggle row.

### File List

- `prisma/schema.prisma` — UPDATE (new `Informacion` fields, `ModalidadAtencion` enum incl. `HIBRIDO`, `UsuarioDeporte.frecuenciaSemanal` default)
- `prisma/migrations/20260725031752_registro_segmentado_por_tipo/migration.sql` — NEW
- `prisma/migrations/20260725034900_modalidad_atencion_hibrido/migration.sql` — NEW
- `prisma/seed.ts` — UPDATE (Deporte seeding)
- `shared/utils/fixedLists.ts` — NEW
- `server/api/deportes/index.get.ts` — NEW
- `server/api/auth/register.post.ts` — UPDATE (full rewrite)
- `app/pages/register.vue` — UPDATE (full rewrite)
- `app/stores/auth.ts` — UPDATE (`register()` signature)
