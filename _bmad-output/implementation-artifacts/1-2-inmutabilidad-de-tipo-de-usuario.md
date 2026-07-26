---
baseline_commit: 15f62c9f4a914086df42e026d20a7a85f2196431
---

# Story 1.2: Inmutabilidad de tipo de usuario

Status: done

## Story

As a platform operator,
I want TipoUsuario to be permanently locked after registration,
so that downstream type-gated features (catalog creation, directories) can trust it never changes.

## Acceptance Criteria

1. **Given** a Usuario has completed registration with a TipoUsuario set **When** they view their own profile-edit form **Then** no UI control exists to change TipoUsuario (FR-3)

2. **Given** a Usuario submits a profile-edit request with a modified `tipoUsuarioId`/`informacion.tipoUsuarioId` value (e.g. via direct API call) **When** the request is processed **Then** the server strips/ignores the field and the Usuario's type remains unchanged **And** this closes the existing bug in `server/api/profile/index.put.ts` (lines 93-100, 116-129)

3. **Given** an admin uses the profile-edit override (FR-18's admin path, built in Epic 2 Story 2.3) on any Usuario **When** they submit changes **Then** TipoUsuario cannot be altered through this path either — no write path, including admin override, may change it (AD-8)

4. **Given** legacy pre-MVP Usuarios (no type, or type set once via the old flow) **When** this fix ships **Then** they are left as-is, not backfilled or force-assigned a type (confirmed non-goal)

## Tasks / Subtasks

- [x] Task 1: Close the backend bug in `server/api/profile/index.put.ts` (AC: #2, #3)
  - [x] Unconditionally strip `tipoUsuarioId` from the incoming `informacion` object — before any parsing, for BOTH the JSON branch and the multipart branch (they converge into the same `informacion: Record<string, any>` object, so one strip covers both)
  - [x] Remove the now-dead type-coercion block that parses `informacion.tipoUsuarioId` into an int (lines 93-100 today) — replaced by the unconditional strip
  - [x] Do not add an `isAdmin`/role branch here — the strip must be unconditional so it also covers Epic 2 Story 2.3's future admin-override path for free (see Dev Notes)
- [x] Task 2: Remove the editable type control from `app/pages/profile.vue` (AC: #1)
  - [x] Add a new `ref` (`tipoUsuarioActual = ref<string | null>(null)`) set inside `loadUserData()` from `user.informacion?.tipoUsuario?.tipo ?? null`
  - [x] Replace the editable `<select id="tipoUsuario">` with a read-only `<p>` bound to `tipoUsuarioActual`, fallback "Sin tipo asignado" when `null`
  - [x] Remove `tipoUsuarioId` from `ProfileForm.informacion`'s shape (n/a — `UserInformacion` never declared it; only the ad hoc population/payload assignments existed), from `loadUserData()`'s form population, and from `updateProfile()`'s submit payload
  - [x] Remove the now-unused `tiposUsuario` ref and its `GET /api/tipousuario` fetch in `loadUserData()`
  - [x] Removed the stray leftover text `*** End Patch` after the closing `</script>` tag
- [x] Task 3: Verify (AC: #4)
  - [x] No migration, backfill script, or data change for legacy Usuarios — none added

## Dev Notes

### The bug, exactly (confirmed by reading the live file)

`server/api/profile/index.put.ts` today:
- Populates a local `informacion: Record<string, any>` object from either a JSON body (`json.informacion`, spread via `Object.assign`) or multipart fields prefixed `informacion.` (e.g. `informacion.tipoUsuarioId`) — both paths converge into the same object before any further processing.
- Lines 93-100 then do:
  ```ts
  if (informacion.tipoUsuarioId) {
    const parsed = parseInt(informacion.tipoUsuarioId as string);
    if (!Number.isNaN(parsed)) {
      informacion.tipoUsuarioId = parsed;
    } else {
      delete informacion.tipoUsuarioId;
    }
  }
  ```
  i.e., it actively *keeps* `tipoUsuarioId` if it parses as a number.
- That same `informacion` object is later spread wholesale into `prisma.informacion.update({ data: { ...informacion } })` (or `.create()` if no `Informacion` row exists yet) — so a caller who includes `informacion.tipoUsuarioId` in their request silently changes their own type today. Nothing in this handler ever checks `isAdmin`; `userId` is always derived from the caller's own session (`parseInt(session.user.id)`), so today this endpoint can only ever edit the caller's own profile — there is no admin-edits-someone-else path yet (that's Epic 2 Story 2.3's job, not this story's).

**The fix:** replace the keep-if-parses block with an unconditional strip, applied to the same `informacion` object right after it's populated (before the `fechaNacimiento` handling that follows it), e.g.:
```ts
delete informacion.tipoUsuarioId;
```
No parsing, no int-coercion, no conditional — just delete the key outright so it can never reach either `prisma.informacion.update()` or `.create()` below, regardless of what the caller sent.

### Why this also satisfies AC #3 for free (read before implementing Epic 2 Story 2.3)

This story's fix is deliberately unconditional — not `if (!session.user.isAdmin) delete informacion.tipoUsuarioId`. Today there is no role branch in this handler at all (it only ever edits the caller's own profile), so there's nothing to branch on yet. When Epic 2 Story 2.3 later adds an admin-override path (likely by allowing `userId` to come from a route param/request field instead of always the caller's session, gated by `isAdmin`), it will still hit this same strip — because the strip runs unconditionally on the `informacion` object regardless of whose `userId` the update ultimately targets. **Story 2.3 does not need to re-implement or even think about type-immutability enforcement** — it inherits this guard automatically as long as it reuses this handler's `informacion` processing rather than writing a parallel code path. Flag this explicitly if Story 2.3's implementation ends up NOT reusing this handler.

### Frontend: current state of the bug (confirmed by reading the live file)

`app/pages/profile.vue`:
- Line 52-60: a fully editable `<select id="tipoUsuario" v-model.number="form.informacion.tipoUsuarioId">`, populated from a `tiposUsuario` ref fetched via `GET /api/tipousuario` in `loadUserData()` (line 272).
- `loadUserData()` (line 292) seeds `form.informacion.tipoUsuarioId` from `user.informacion?.tipoUsuario?.id || user.informacion?.tipoUsuarioId`.
- `updateProfile()` (line 343) includes `tipoUsuarioId: fv.informacion?.tipoUsuarioId ?? null` in the PUT body sent to `server/api/profile/index.put.ts`.
- This is a real, live, user-facing control today — any logged-in user can open Settings/Perfil and change their own type via this dropdown, exactly the bug AD-8 exists to close.

**The fix:** `GET /api/profile` (confirmed by reading `server/api/profile/index.get.ts`) already includes the nested relation — `informacion: { include: { tipoUsuario: true } }` — so `user.informacion?.tipoUsuario?.tipo` (the type NAME, e.g. `"Deportista"`) is available directly from the existing profile fetch. No new endpoint is needed to show the current type read-only. Replace the `<select>` with a plain, non-interactive display of that name (e.g. a `<p>` or a disabled-looking badge — match the surrounding form's visual style loosely, this is a small, low-stakes display change, not part of Epic 7's visual system). Remove the `tiposUsuario` ref, its `GET /api/tipousuario` fetch, and every reference to `tipoUsuarioId` in this file's form state and submit payload.

### Explicit non-goal (AC #4)

No migration, script, or admin tooling is added to backfill or force-assign a type to Usuarios created under the pre-MVP flow (no type, or type set once via the old profile-edit path before this fix ships). They are left exactly as they are; per SPEC.md/PRD, they simply go unused once the new type-segmented registration flow (Story 1.1) is the only way to create accounts going forward. Do not add a migration for this.

### What NOT to touch in this story

- `server/api/auth/register.post.ts` — Story 1.1's territory, already sets `tipoUsuarioId` correctly at creation; this story only prevents changing it *after* creation.
- Any admin-override editing capability (viewing/editing another Usuario's profile) — that's Epic 2 Story 2.3 (FR-18). This story only fixes the self-edit path that exists today.

## Project Structure Notes

- `server/api/profile/index.put.ts` — UPDATE. Same path, minimal diff (replace one conditional block with one unconditional `delete`).
- `app/pages/profile.vue` — UPDATE. Remove the type select + its backing fetch/state; add a read-only type-name display.

## References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2: Inmutabilidad de tipo de usuario] — Story statement + all 4 ACs, copied verbatim above.
- [Source: _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md#AD-8 — Type immutability] — `Usuario.tipoUsuarioId` immutable via `Usuario → Informacion → TipoUsuario`; no write path, including admin override, may change it; cites this exact bug and file/line numbers as the existing violation to close.
- [Source: server/api/profile/index.put.ts] — current handler, read in full; exact bug location (lines 93-100) confirmed live, not from memory.
- [Source: server/api/profile/index.get.ts] — confirmed `informacion.tipoUsuario` relation is already included in the GET response, so no new endpoint is needed for the read-only display.
- [Source: app/pages/profile.vue] — current page, read in full; exact line numbers of the editable select (52-60), its backing fetch (272), and its submit payload (343) confirmed live.
- [Source: _bmad-output/implementation-artifacts/1-1-registro-segmentado-por-tipo.md] — previous story; established that `tipoUsuarioId` is set once at registration via a transaction, and that `server/api/profile/index.put.ts` was explicitly flagged there as out of scope for Story 1.1, deferred to this story.
- [Source: _bmad-output/specs/spec-Elite_Hub/functional-requirements.md#CAP-1, FR-3] — "No UI path exists (profile edit or otherwise) for a Usuario to change their own TipoUsuario post-registration," legacy-account non-goal.

## Dev Agent Record

### Agent Model Used

Claude (bmad-dev-story)

### Debug Log References

None — no migration or server restart needed for this story (no schema change).

### Completion Notes List

- All 3 tasks implemented: backend strip is unconditional (covers both self-edit today and the future admin-override path per AD-8's Dev Notes reasoning), frontend select replaced with a read-only display with an explicit legacy-account fallback, no data migration added.
- No unit tests authored, consistent with the standing decision on Story 1.1 (PRD/SPEC non-goal, no test framework installed). Verification deferred to the user (manual, in their own dev server session) to save tokens, consistent with Story 1.1's pattern.

### File List

- `server/api/profile/index.put.ts` — UPDATE (unconditional `delete informacion.tipoUsuarioId`, removed dead parse block)
- `app/pages/profile.vue` — UPDATE (removed editable type select + backing fetch/state, added read-only `tipoUsuarioActual` display, removed `tipoUsuarioId` from form population/submit payload, removed stray `*** End Patch` text)
