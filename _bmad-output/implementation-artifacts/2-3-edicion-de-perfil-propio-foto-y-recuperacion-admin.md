---
baseline_commit: 1d528cb26f89c80c0048b3aabc9a38dc2455ad85
---

# Story 2.3: Edición de perfil propio, foto, y recuperación admin

Status: ready-for-dev

## Story

As an authenticated user,
I want to view and edit only my own profile, including my photo,
so that I control my own information, while admin retains an emergency override for account recovery.

## Acceptance Criteria

1. **Given** I am authenticated **When** I navigate to my Perfil **Then** I see and can edit my own Informacion fields
2. **Given** I am on my Perfil **When** the edit form renders **Then** it shows exactly the same field set defined for my TipoUsuario at registration (Story 1.1's per-type field lists — Deportista/Marca/Nutricionista/Patrocinador), pre-filled with my current values, so I can update any of that information at any time after registration
3. **Given** the TipoUsuario field on my Perfil **When** the edit form renders **Then** it is displayed as read-only/informative (not an editable control), consistent with TipoUsuario's immutability (Story 1.2, AD-8)
4. **Given** I attempt to edit another Usuario's profile via direct request **When** I am not admin **Then** the request is rejected (FR-18)
5. **Given** I am on my profile-edit surface **When** I upload a photo **Then** it replaces my previous photo wholesale, never appending (FR-6)
6. **Given** I am admin **When** I access another Usuario's profile-edit route as a recovery override **Then** I can edit their profile, including a deactivated Usuario's, and the edit view is visibly framed ("Editando el perfil de {nombre} como administrador") so admin never mistakes it for their own profile (UJ-5)
7. **Given** TipoUsuario is immutable (Story 1.2, AD-8) **When** I or admin edit a profile through this surface **Then** no control here can change TipoUsuario either

## Tasks / Subtasks

- [ ] Task 1: Read the current profile surface in full before touching anything (AC: all)
  - [ ] **Critical finding from analysis, confirm by reading yourself:** `app/pages/profile.vue`'s edit form today is a **generic, pre-Story-1.1 leftover** — a fixed field set (profesión, especialidad, teléfono, género, fecha de nacimiento, experiencia) shown identically **regardless of TipoUsuario**. It does not expose Deportista's altura/peso/deporte/nivel/objetivosActuales/lesiones, Marca's nombreComercial/nit/direccionContacto/nombreContacto/cargoContacto, Nutricionista's universidad/anoGraduacion/anosExperiencia/modalidadAtencion, or Patrocinador's país/ciudadResidencia at all. AC #2 requires the *actual* per-type field set (Story 1.1's, confirmed in `server/api/auth/register.post.ts`) — this story replaces the generic form, it does not patch it.
  - [ ] TipoUsuario is **already** read-only on this page (a `<p>`, not a `<select>` — Story 1.2 already fixed this) — confirm AC #3 is already satisfied, no change needed there.
  - [ ] `server/api/profile/index.get.ts` / `.put.ts` are today **hardcoded to `session.user.id`** — there is no way to target another Usuario at all (no admin override exists yet). `server/api/profile/avatar.post.ts` already returns a single `{ url }` and the PUT endpoint always **overwrites** `Usuario.avatar` (never appends — it's a single scalar field) — AC #5 is already structurally satisfied by the current single-string design; don't build a `Promise<string[]>`-returning storage layer here, that's explicitly `server/utils/storage.ts`'s job in Story 8.1 (not yet built) — this story's avatar handling is unchanged from today's working behavior.

- [ ] Task 2: Extend `server/api/profile/index.get.ts`'s include (AC: #2)
  - [ ] Add `UsuarioDeporte: { include: { deporte: true } }` and `informacion: { include: { tipoUsuario: true, redesSociales: true } }` to the existing `include` — needed so the edit form can pre-fill a Deportista's current deporte/nivel/experiencia and a Deportista/Marca's current red social URL, neither of which the endpoint returns today.

- [ ] Task 3: Create `server/api/profile/[id].get.ts` and `server/api/profile/[id].put.ts` — the admin recovery override (AC: #4, #6, #7)
  - [ ] Both admin-only: `await requireSession(event, { requireAdmin: true })` (Story 1.7's primitive; throws 403 for a non-admin caller attempting this route directly — this is what makes AC #4 real server-side, not just UI-hidden, per NFR-3).
  - [ ] `[id].get.ts` fetches the target Usuario by the route param `id` (not the session's own id) with the same `include` shape as Task 2 — **deliberately no `activo: true` filter** here: admin must be able to see and act on a deactivated Usuario's profile (AC #6's "including a deactivated Usuario's"). This is a single-record admin lookup, not a collection query, so it does **not** need (and should not attempt to use) the still-unbuilt `activeUserFilter()` helper — same reasoning already applied in Stories 2.1/2.2 to `activo`-filtering on a single record vs. a list.
  - [ ] `[id].put.ts` mirrors `index.put.ts`'s update logic exactly (same field-mapping, same `delete informacion.tipoUsuarioId` guard for AC #7) but resolves the target id from `event.context.params.id` instead of `session.user.id`. **Do not duplicate the entire update logic by copy-paste-and-diverge** — extract the shared update logic (both endpoints' bodies are otherwise identical) into a small helper in `server/utils/` (e.g. `updateUsuarioProfile(targetId, body)`) that both `index.put.ts` and `[id].put.ts` call, so the AD-8 TipoUsuario-immutability guard and the field-mapping logic live in exactly one place.

- [ ] Task 4: Build `app/components/ProfileEditForm.vue` — one adaptive per-type edit form (AC: #1, #2, #3, #5)
  - [ ] **Read `app/pages/register.vue` in full first** — this story's edit form must expose exactly the fields that page collects per TipoUsuario, this time pre-filled and editable rather than empty. Do not guess the field list from memory; the required/optional split per type is also confirmed in `server/api/auth/register.post.ts`'s `requireFields()` calls.
  - [ ] Props: `usuario` (the fetched profile object, already includes `informacion`/`tipoUsuario`/`UsuarioDeporte`/`redesSociales`), `submitting` (loading state passed from the parent page). Emits `submit` with the built payload — the parent page owns the actual `$fetch` call (self vs. `/api/profile/[id]`), this component only builds the form and its data.
  - [ ] TipoUsuario rendered as a read-only line (`{{ usuario.informacion?.tipoUsuario?.tipo }}`) — never a `<select>`/editable control (AC #3, #7) — matching the already-fixed pattern in the current `profile.vue`.
  - [ ] Per-type editable fields (all of Story 1.1's fields for that type, pre-filled from `usuario`/`usuario.informacion`/`usuario.UsuarioDeporte[0]`, same field set as `register.vue`'s corresponding branch):
    - **Deportista:** segundoNombre, segundoApellido, fechaNacimiento, género, nacionalidad, ciudadResidencia, bio, altura, peso, deporte (select, from `GET /api/deportes`, matching `register.vue`'s existing pattern), nivel, experiencia (on `UsuarioDeporte`), objetivosActuales, marcasPersonales, lesiones, red social URL
    - **Marca:** nombreComercial (maps to base `nombre`, same as registration), NIT, teléfono, direccionContacto, nombreContacto, cargoContacto, bio, sitioWeb, red social URL
    - **Nutricionista:** fechaNacimiento, género, teléfono, país, ciudadResidencia, bio, profesión, universidad, anoGraduacion, especialidad, anosExperiencia, modalidadAtencion (select: Presencial/Virtual/Híbrido, Story 1.1's addition), certificadosAdicionales
    - **Patrocinador:** fechaNacimiento, teléfono, país, ciudadResidencia, bio, sitioWeb
  - [ ] Avatar upload block (file input + preview + 2MB/image-type validation) — copy the existing, already-working logic from the current `profile.vue` verbatim into this component (don't rewrite what already works).
  - [ ] Género/país use the shared `GENEROS`/`PAISES` fixed lists from `#shared/utils/fixedLists` (Story 1.1's convention) — do not hardcode a separate option list here (the current `profile.vue` hardcodes its own género options, e.g. `"masculino"`/`"femenino"` lowercase — **wrong values**, don't match `GENEROS`'s actual casing (`"Masculino"`, `"Femenino"`, etc.) — this story fixes that divergence as part of rebuilding the form, not a separate bug-report item).

- [ ] Task 5: Rebuild `app/pages/profile.vue` around the shared form (AC: #1, #2, #3, #5)
  - [ ] Fetch own profile via `GET /api/profile` (Task 2's extended include), render `<ProfileEditForm :usuario="usuario" :submitting="isLoading" @submit="handleSubmit" />`, where `handleSubmit` does the avatar upload (if a new file was picked) then `PUT /api/profile` — same two-step flow the current page already uses, just delegating the field markup to the new shared component.
  - [ ] Keep the existing "Gestión de usuarios" admin quick-link at the top of this page unchanged.

- [ ] Task 6: Build `app/pages/profile/[id].vue` — the admin recovery override page (AC: #4, #6)
  - [ ] Route `/profile/:id`. Client-side, gate on `authStore.user?.isAdmin` (redirect to `/` if false, matching every other admin-only page's client pattern in this codebase) — the server-side `requireSession({ requireAdmin: true })` in Task 3 is the real enforcement (AC #4), this client check only avoids flashing the form to a non-admin before the API call fails.
  - [ ] Fetch via `GET /api/profile/:id`, render a visible banner above the form: **"Editando el perfil de {{ usuario.nombre }} {{ usuario.apellido }} como administrador"** (exact framing per AC #6/UJ-5 — this is the detail that prevents admin from mistaking this for their own profile), then the same `<ProfileEditForm>`, submitting to `PUT /api/profile/:id` (Task 3's admin endpoint) instead of `/api/profile`.
  - [ ] This page must work for a **deactivated** target Usuario too (AC #6) — don't add a client-side `v-if="usuario.activo"` guard that would hide the form; Task 3's endpoint deliberately omits any `activo` filter for exactly this reason.

- [ ] Task 7: Add the entry point admin actually uses to reach this route (AC: #6)
  - [ ] `app/pages/admin/users/index.vue`'s user table has no per-row link to a user's profile-edit today — without one, the admin-override route from Task 6 is unreachable except by guessing a URL. Add a small "Editar perfil" icon-link (`NuxtLink :to="'/profile/' + u.id"`) per row, alongside the existing activo/inactivo toggle button — minimal addition, no broader redesign of that page (its own visual-refresh is FR-33/Epic 7 territory, out of scope here, same restraint already applied in Story 1.5's Dev Notes about this same page).

## Dev Notes

### Scope size

Comparable to Stories 1.7/2.1: rewriting the profile edit surface to be genuinely per-type (it wasn't, despite Story 1.1 having defined those fields for registration months of in-story-time ago), plus a real admin-override path that didn't exist in any form before this story (no target-user parameter anywhere in the current profile endpoints).

### Known pre-existing gaps this story does not touch

- **`activeUserFilter()` (AD-5) still does not exist.** Both this story's admin `[id].get.ts` and Stories 1.6/2.1's aggregate/list queries independently confirm the same conclusion: single-record admin lookups and direct scalar-field filters don't need it. The gap remains open for whichever story first needs to filter an actual *collection* by an author's `activo` status.
- **`profile.vue`'s género options today use lowercase, non-matching values** (`"masculino"` vs. `GENEROS`'s `"Masculino"`) — this is fixed as a natural consequence of Task 4 switching to the shared `GENEROS` list, not filed as a separate defect.

### Architecture / conventions this story must follow

- **AD-8 (TipoUsuario immutability):** both the self and admin-override PUT paths must discard `informacionData.tipoUsuarioId` unconditionally — Task 3 explicitly calls out sharing one update helper so this guard isn't duplicated (and can't silently diverge) across two endpoints.
- **NFR-3 (server-side enforcement, not just UI-hidden):** the admin-only endpoints in Task 3 are the actual gate for AC #4/#6; Task 6's client-side `isAdmin` check is a UX nicety, never the security boundary.
- **Story 1.1's shared fixed lists (`GENEROS`/`PAISES` from `#shared/utils/fixedLists`, `ASUNTOS_CONTACTO`-style convention)** — reused here, not reinvented, and this story corrects `profile.vue`'s currently-diverged género values as part of that reuse.
- **No test framework** — same MVP non-goal as every prior story; verify manually (edit your own profile as each of the 4 types if you have test accounts, confirm every Story 1.1 field round-trips correctly; as admin, open another Usuario's `/profile/:id`, confirm the banner shows their name, edit a field, confirm it saves; deactivate a test account and confirm admin can still open and edit its `/profile/:id`; confirm a non-admin hitting `/api/profile/:id` directly gets a 403).

### Project Structure Notes

- New: `server/api/profile/[id].get.ts`, `server/api/profile/[id].put.ts`, `server/utils/updateUsuarioProfile.ts` (shared update helper), `app/components/ProfileEditForm.vue`, `app/pages/profile/[id].vue`.
- Moved: `app/pages/profile.vue` → `app/pages/profile/index.vue` (route unchanged, needed for the `[id].vue` sibling — same pattern as Story 2.2's directory pages).
- Modified: `server/api/profile/index.get.ts` (extended include), `server/api/profile/index.put.ts` (delegates to the new shared helper), `app/pages/admin/users/index.vue` (one new per-row link).
- No schema changes, no new npm dependencies.

### Previous Story Intelligence (Stories 2.1/2.2)

- Both prior stories confirmed the `UsuarioDeporte`-on-`Usuario` (not nested under `informacion`) relation shape and `informacion.redesSociales` (not `redSocial`) exact field name — reused correctly here from the start.
- Story 2.2 established the `index.vue` + `[id].vue` folder-move pattern for adding a sibling dynamic route to a previously-flat page — applied identically to `profile.vue` here.
- Story 1.7 built `requireSession(event, { requireAdmin: true })` — this story is a direct consumer for the admin-override endpoints, no new auth primitive needed.
- Story 1.5 deliberately did not add a "Gestión de usuarios" nav-discoverability fix as out-of-scope; this story similarly keeps its `admin/users/index.vue` touch minimal (one link), not a broader cleanup of that page.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3] — AC source
- [Source: _bmad-output/specs/spec-Elite_Hub/functional-requirements.md#CAP-6] — FR-6, FR-18 detail
- [Source: app/pages/profile.vue] — current generic (non-per-type) edit form; already-fixed read-only TipoUsuario; existing avatar-upload logic to reuse verbatim
- [Source: server/api/profile/index.get.ts, index.put.ts, avatar.post.ts] — current self-only hardcoding; existing update logic to extract into a shared helper; confirmed avatar overwrite-not-append behavior
- [Source: server/api/auth/register.post.ts, app/pages/register.vue] — authoritative per-type field lists this story's edit form must expose, this time editable and pre-filled
- [Source: app/pages/admin/users/index.vue] — where the admin-override entry point link is added; existing activo-toggle pattern to sit alongside
- [Source: shared/utils/fixedLists.ts] — `GENEROS`/`PAISES` this story's form must use instead of `profile.vue`'s current diverged hardcoded género options

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
