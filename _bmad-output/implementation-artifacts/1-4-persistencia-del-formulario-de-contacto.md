---
baseline_commit: 6e3433f41a23cd84696d12f1a44a0b459262c0d5
---

# Story 1.4: Persistencia del formulario de contacto

Status: done

## Story

As an anonymous visitor,
I want my contact-form message (event invitation, partnership interest, promotion, etc.) to actually be saved,
so that Elite Hub receives it and I know it went through.

## Acceptance Criteria

1. **Given** I fill the contact form on `contactUs.vue`, including selecting an Asunto from the existing dropdown, with valid input **When** I submit without being logged in **Then** a `MensajeContacto` record is created capturing the Asunto and every other form field (FR-10)
2. **Given** a successful submission **When** the request completes **Then** the form area displays "Registro guardado con éxito" (exact copy, FR-42) and the form itself is replaced by this message — no `setTimeout`+`alert` no-op behavior, and no toast/banner overlay for this specific success case (see Dev Notes — UX contract conflict)
3. **Given** the `MensajeContacto` model **When** it's inspected **Then** it has no foreign key to `Usuario` (anonymous submissions) and is a model distinct from the existing `PQRS` model (different purpose: general contact/interest messages, not complaints)
4. **Given** time allows before the checkpoint (stretch, not required for MVP acceptance) **When** a new `MensajeContacto` is created **Then** an email notification may be sent to admin (FR-11) — its absence does not block story acceptance; **do not implement this in this story** unless explicitly asked

## Tasks / Subtasks

- [x] Task 1: Add the `MensajeContacto` model and the fixed `Asunto` list (AC: #1, #3)
  - [x] In `prisma/schema.prisma`, add a new standalone model (place it near `PQRS`/`TipoPQRS`, e.g. after line 203):
    ```prisma
    model MensajeContacto {
      id        Int      @id @default(autoincrement())
      nombre    String
      apellido  String
      correo    String
      telefono  String?
      asunto    String
      mensaje   String
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
    }
    ```
    No relation field to `Usuario` anywhere on this model — this is what makes it anonymous and distinct from `PQRS` (which requires `usuarioId`).
  - [x] Run `npx prisma migrate dev --name mensaje_contacto` to generate and apply the migration, then `npx prisma generate`. **Known Windows gotcha (hit 2x already in this project):** if a `pnpm dev`/`nuxi dev` process is running (yours or the user's), `prisma generate` fails with `EPERM` renaming `query_engine-windows.dll.node` because the running dev server holds a file lock on the engine DLL. Fix: find and kill the exact `node.exe` process(es) tied to the dev server first (e.g. via `Get-CimInstance Win32_Process -Filter "Name='node.exe'"` + `Stop-Process -Force`), then re-run. Do not touch other running node processes.
  - [x] In `shared/utils/fixedLists.ts` (already exports `GENEROS`, `PAISES` from Story 1.1 — this is the one Nuxt 4 auto-imports, `shared/constants/` is NOT auto-imported), add:
    ```ts
    export const ASUNTOS_CONTACTO = [
      "general",
      "support",
      "partnership",
      "nutrition",
      "training",
      "other",
    ] as const;
    ```
    These values must match `contactUs.vue`'s existing `<select id="subject">` option values exactly (they already do — confirmed by reading the file); this list exists purely for server-side validation, the display labels stay hardcoded in the template as today.

- [x] Task 2: Create `server/api/mensajes-contacto/index.post.ts` (AC: #1)
  - [x] New file, new folder. Follow `server/api/auth/register.post.ts`'s exact conventions: no import of `PrismaClient` (use the auto-imported global `prisma` singleton per ARCHITECTURE-SPINE Consistency Conventions), a local `isBlank`/`requireFields` helper pair (copy the pattern, don't import — `register.post.ts` doesn't export them), `createError({ statusCode, message })` shape (never `statusMessage`).
  - [x] No `requireSession()` call — this endpoint is intentionally anonymous/public (AC #1 says "without being logged in"); `server/api/**` routes are not auto-gated by `@sidebase/nuxt-auth`'s `globalAppMiddleware` (that only guards page navigation), so simply not calling `requireSession()` is sufficient and correct here.
  - [x] Read body, `requireFields(body, ["firstName", "lastName", "email", "subject", "message"])` — `phone` stays optional, matching the form (no `required` attribute on that input).
  - [x] Validate `body.subject` is one of `ASUNTOS_CONTACTO` (import from `#shared/utils/fixedLists`); if not, `createError({ statusCode: 400, message: "El asunto seleccionado no es válido." })`.
  - [x] `await prisma.mensajeContacto.create({ data: { nombre: body.firstName, apellido: body.lastName, correo: body.email, telefono: body.phone || null, asunto: body.subject, mensaje: body.message } })` — note the field-name mapping: the frontend form and this endpoint's request body use the existing English field names (`firstName`/`lastName`/`email`/`phone`/`subject`/`message`, unchanged from today's `contactUs.vue`), while the Prisma model uses Spanish column names matching every other model in this schema (`Usuario`, `PQRS`, etc.) — the mapping happens inside this handler, nowhere else.
  - [x] Return `{ message: "Mensaje registrado exitosamente", id: mensaje.id }` on success. Wrap the create in try/catch matching `register.post.ts`'s error-handling tail (`if (error.statusCode) throw error; ... throw createError({ statusCode: 500, message: "Error interno del servidor" })`) — no `P2002` unique-constraint case applies here (no unique fields on this model).

- [x] Task 3: Wire `contactUs.vue`'s real submit + success/error UI (AC: #2)
  - [x] **Read `app/pages/contactUs.vue` in full before editing** — its `submitForm()` (script section) currently does `await new Promise((resolve) => setTimeout(resolve, 2000))` (fake delay) then `showToast("¡Mensaje enviado exitosamente!...", "success")` (this toast call was added in a prior ad-hoc UI pass, see Dev Notes below — it must be removed/changed here, not preserved as-is).
  - [x] Replace the fake delay with a real call: `await $fetch("/api/mensajes-contacto", { method: "POST", body: form.value })` — matches the exact `$fetch(url, { method: "POST", body })` pattern already used in `app/stores/auth.ts`'s `register()`.
  - [x] Add a `submitted = ref(false)` in the script. On success, set `submitted.value = true` (do NOT reset `form.value` afterward — the form is about to be replaced by the confirmation message, resetting it is pointless and `submitted.value = true` already prevents it from being shown again).
  - [x] In the template, wrap the "Contact Form" card's inner content (currently: the `<h2>Envíanos un mensaje</h2>` + the whole `<form>`, inside the `<div class="flex flex-col justify-center rounded-xl bg-white p-8 shadow-lg">` around line 27) in `v-if="!submitted"`. Add a sibling `v-else` block **inside the same white card div** (keep the card container, don't remove it) showing the exact copy `Registro guardado con éxito` — per `EXPERIENCE.md`'s State Patterns table: *"Contact form submit success | contactUs.vue (unauthenticated) | 'Registro guardado con éxito' (FR-42, exact copy) replaces the form, no timeout/alert."* This is the ratified, must-match copy — do not paraphrase it.
  - [x] On error (catch block): keep a `showToast(errorMessage, "error")` call — EXPERIENCE.md's table only specifies the success-state behavior for this flow; it says nothing about the error path, so the toast component (added for the admin ContentEditor and this page in a prior pass) remains an acceptable, non-conflicting choice for errors here.
  - [x] `useToast()` is already imported/used in this file (`const { showToast } = useToast();`) from the prior pass — keep that import, only change what the success branch does with it (remove the success `showToast(...)` call entirely; the `v-else` replace-form block is the only success feedback now).

## Dev Notes

### UX contract conflict — read this before Task 3

Between the previous conversation turn and this story, the user asked for an Angular-style green toast on contact-form success, and that was implemented as an ad-hoc fix (added `useToast()`/`showToast(...)` calls to `ContentEditor.vue` and `contactUs.vue`). Doing the exhaustive artifact analysis for **this** story surfaced that the ratified `EXPERIENCE.md` (`_bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/EXPERIENCE.md`, State Patterns table) already specifies a **different, more specific** behavior for this exact flow: the success message **replaces the form** with the exact copy "Registro guardado con éxito" — not a toast/banner. Per bmad-ux's own rule ("spines win on conflict with any mock, wireframe, or import") and since this is the officially finalized UX contract (not an ad-hoc request), Task 3 implements the spec's replace-form pattern for the **success** case specifically, superseding the toast for that one case. The toast component itself (`ToastContainer.vue`/`useToast.ts`) is not being removed — it stays in use for `ContentEditor.vue`'s admin save flow (not covered by this spec's table) and for this page's error case (also not covered by the spec's table, so no conflict there).

### Architecture / conventions this story must follow

- **AD-1 (Transaction Script):** `server/api/**` — one handler per HTTP method file, calls `prisma.*` directly, no service/repository layer. A single `prisma.mensajeContacto.create(...)` call needs no `$transaction` wrapper (single insert, no related writes).
- **Prisma singleton convention (ARCHITECTURE-SPINE Consistency Conventions):** never `new PrismaClient()`; use the auto-imported global `prisma`. This exact violation was fixed elsewhere in Story 1.3 (`server/api/content/[page].get.ts`/`.put.ts`) — don't reintroduce it here.
- **Error shape convention:** `createError({ statusCode, message })` — `message` is canonical, never `statusMessage`.
- **New-model naming convention (ARCHITECTURE-SPINE):** `MensajeContacto` — Spanish PascalCase, matches `Usuario`, `PQRS`, `Content`, etc. Route folder is `server/api/mensajes-contacto/` (kebab-case, matches `server/api/tipousuario/`, `server/api/deportes/` sibling patterns).
- **Fixed-value list convention (NFR-12):** `Asunto` values live once in `shared/utils/fixedLists.ts` (the auto-imported one), same pattern as `GENEROS`/`PAISES` from Story 1.1 — not hardcoded separately in the API handler.
- **This is a public/anonymous endpoint** — the only one of its kind being added in this epic. Do not add `requireSession()` or any auth guard; NFR-2 ("no anonymous/public visibility") explicitly carves out contact as one of the pages that stays public.

### Project Structure Notes

- New: `server/api/mensajes-contacto/index.post.ts`, one new `MensajeContacto` model + migration in `prisma/schema.prisma`.
- Modified: `shared/utils/fixedLists.ts` (add `ASUNTOS_CONTACTO`), `app/pages/contactUs.vue` (real submit call, replace-form success state, remove stub delay).
- No new npm dependencies. No changes to `app/composables/useToast.ts` or `app/components/ToastContainer.vue` (both already exist from the prior ad-hoc pass and are reused as-is for errors/ContentEditor).

### Previous Story Intelligence (Story 1.3)

- `useContent()`'s `getContent()` had a real bug (`const { data } = await $fetch(...)` when the API never wrapped responses in `{ data }`) — a reminder to double check any new composable/endpoint pairing actually matches response shape on both ends; this story's endpoint returns `{ message, id }` directly (no wrapper), and nothing on the frontend destructures a `.data` field from it.
- Fresh-context validation of Story 1.3 caught a `shared/constants/` vs `shared/utils/` auto-import mistake — confirmed again for this story: only `shared/utils/` (and `shared/types/`) auto-import in Nuxt 4; `ASUNTOS_CONTACTO` must go in `shared/utils/fixedLists.ts`, not a new `shared/constants/` file.
- The EPERM/`query_engine-windows.dll.node` Windows file-lock issue during `prisma generate` has recurred twice already (Story 1.1) — Task 1 above documents the fix inline since this story also touches the schema.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4] — story statement and AC source
- [Source: _bmad-output/specs/spec-Elite_Hub/functional-requirements.md#CAP-3] — FR-10, FR-11, FR-41, FR-42 detail
- [Source: _bmad-output/specs/spec-Elite_Hub/glossary.md] — `MensajeContacto` definition, distinction from `PQRS`
- [Source: _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md#Capability → Architecture Map §5.3] — route location, naming convention
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/EXPERIENCE.md#State Patterns] — exact success-copy/replace-form requirement (the conflict noted above)
- [Source: server/api/auth/register.post.ts] — `isBlank`/`requireFields`/`createError` convention this endpoint must mirror
- [Source: app/stores/auth.ts#register] — `$fetch(url, { method: "POST", body })` pattern to mirror in `contactUs.vue`

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

- `npx prisma migrate dev --name mensaje_contacto` — applied cleanly, no EPERM (user stopped their dev server first, per established Windows file-lock precaution).

### Completion Notes List

- Added `MensajeContacto` model (no FK to `Usuario`, distinct from `PQRS`) and applied migration `20260725194026_mensaje_contacto`.
- Added `ASUNTOS_CONTACTO` fixed list to `shared/utils/fixedLists.ts`, matching `contactUs.vue`'s existing `<select>` values exactly.
- **Post-review fix (user caught via DBeaver inspection):** the `<option>` values were the English internal keys (`general`, `support`, etc.) while only the visible labels were Spanish, so `asunto` was persisting in English. Changed the `<option value="...">` attributes to the Spanish label text itself (`"Consulta General"`, `"Soporte Técnico"`, `"Alianzas y Patrocinios"`, `"Servicios de Nutrición"`, `"Entrenamiento Deportivo"`, `"Otro"`) and updated `ASUNTOS_CONTACTO` to match — no API changes needed since it already validates/stores whatever `body.subject` sends.
- Created `server/api/mensajes-contacto/index.post.ts` — anonymous POST endpoint, mirrors `register.post.ts`'s validation/error conventions, maps English form field names to the Spanish Prisma columns.
- Rewired `contactUs.vue`'s `submitForm()` to call the real endpoint; removed the `setTimeout` stub.
- **UX contract conflict resolved per user decision:** on success, the form is now replaced by "Registro guardado con éxito" (exact copy, per `EXPERIENCE.md` State Patterns table), instead of the toast added in a prior ad-hoc pass. The toast (`useToast`/`showToast`) is kept for this page's error path only, and remains unchanged for `ContentEditor.vue`'s save flow.
- FR-11 (stretch email notification) intentionally not implemented, per AC #4 and explicit scope-out.
- No automated tests written — confirmed project-wide convention for this MVP (no test framework installed, PRD/SPEC non-goal); verified manually instead: traced the endpoint's validation logic against all required/optional fields, confirmed the schema migration applied without touching unrelated tables, and read the full `contactUs.vue` diff twice for template/script consistency (matching `v-if`/`v-else`/`template` nesting, no leftover references to the removed success toast).

### File List

- `prisma/schema.prisma` (modified — added `MensajeContacto` model)
- `prisma/migrations/20260725194026_mensaje_contacto/migration.sql` (new)
- `shared/utils/fixedLists.ts` (modified — added `ASUNTOS_CONTACTO`)
- `server/api/mensajes-contacto/index.post.ts` (new)
- `app/pages/contactUs.vue` (modified — real submit call, replace-form success state)

## Change Log

- 2026-07-25: Story implemented — contact form now persists to `MensajeContacto` via a new anonymous API endpoint; success state replaces the form with the ratified UX copy instead of the previously-added toast.
