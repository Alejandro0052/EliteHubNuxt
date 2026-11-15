---
baseline_commit: b1bdd4d068102caa1ff9938e794b0cb187f434e8
---

# Story 1.5: Bandeja admin de Mensajes de Contacto

Status: done

## Story

As an admin,
I want a dedicated inbox listing every contact-form submission,
so that I can read and act on them without querying the database directly.

## Acceptance Criteria

1. **Given** I am an admin **When** I navigate to the Mensajes de Contacto inbox **Then** I see every persisted `MensajeContacto` record, most-recent-first (FR-41)
2. **Given** a record in the inbox **When** I view it **Then** I see the selected Asunto and all sender-provided contact details/message content (nombre, apellido, correo, teléfono, asunto, mensaje, fecha)
3. **Given** the inbox is a row-based list, not a card-grid **When** it renders **Then** it uses the shared admin-table visual pattern (row dividers, no per-row shadow) — first real usage of this pattern (UX-DR15); responsive per UX-DR17 (stacked labeled cards below `md`, true tabular rows at `md`+)
4. **Given** this is an admin-only page **When** it loads **Then** access is gated by `app/middleware/admin.ts` route middleware with auto-redirect — first real usage of this guard, not conditional rendering after the page has already loaded (UX-DR12)
5. **Given** I am not an admin **When** I attempt to access this view or its underlying route **Then** the middleware redirects me before the page renders, and the underlying API also rejects the request server-side (NFR-3 — UI gating alone is not authorization)

## Tasks / Subtasks

- [x] Task 1: Create `app/middleware/admin.ts` (AC: #4, #5)
  - [x] **This file does not exist yet anywhere in the project** — this is genuinely the first admin route guard (confirmed: no `app/middleware/` directory exists today). Do not confuse this with `authStore`'s `checkAuth()`/`user.isAdmin` (Pinia store, populated only inside `onMounted`, too late for a route guard that must redirect *before* render).
  - [x] Mirror the exact idiom `@sidebase/nuxt-auth`'s own global middleware uses (read `node_modules/@sidebase/nuxt-auth/dist/runtime/middleware/sidebase-auth.js` if you want to see it) — a **synchronous** `defineNuxtRouteMiddleware`, not async, using the `useAuth()` composable directly (not the Pinia store):
    ```ts
    export default defineNuxtRouteMiddleware(() => {
      const { status, data } = useAuth();
      if (status.value !== "authenticated" || !data.value?.user?.isAdmin) {
        return navigateTo("/");
      }
    });
    ```
  - [x] `useAuth()` (from `#auth`, auto-imported) is already used this way in `app/stores/auth.ts` (`const { signIn, signOut, getSession } = useAuth();`) — same composable, just destructuring `status`/`data` instead here. `session.user.isAdmin` is populated by the existing `jwt`/`session` callbacks in `server/api/auth/[...].ts` (lines 45/54) — no change needed there.
  - [x] This is a **named** middleware (file in `app/middleware/`, not `.global.ts`), applied per-page via `definePageMeta({ middleware: ["admin"] })` — not automatic on every route. It runs after `@sidebase/nuxt-auth`'s own global middleware (which already guarantees a session exists for any route without `auth: false`), so by the time this runs, `useAuth()`'s state is already populated — no race condition.

- [x] Task 2: Create `server/api/mensajes-contacto/index.get.ts` (AC: #1, #2, #5)
  - [x] Mirror `server/api/admin/users.get.ts`'s exact structure and admin-check pattern (read that file first): `const session = await getServerSession(event); if (!session?.user?.id || !session.user.isAdmin) throw createError({ statusCode: 403, message: "No autorizado" });`
  - [x] `await prisma.mensajeContacto.findMany({ orderBy: { createdAt: "desc" } })` — return the raw records directly (no field renaming needed; the model already stores Spanish column names per Story 1.4, and `asunto` already stores the Spanish display text directly, e.g. `"Consulta General"`, after Story 1.4's post-review fix — nothing to translate on the way out).
  - [x] Wrap in try/catch, `throw createError({ statusCode: 500, message: "Error al obtener mensajes de contacto" })` on failure — matches `users.get.ts`'s tail exactly.

- [x] Task 3: Build `app/pages/admin/mensajes-contacto/index.vue` (AC: #1, #2, #3, #4)
  - [x] New route `/admin/mensajes-contacto`, following the existing `app/pages/admin/users/index.vue` folder convention (sibling `admin/` route group).
  - [x] `definePageMeta({ middleware: ["admin"] })` at the top — this is what actually gates the page (AC #4); do not additionally gate rendering with a `v-if="isAdmin"` wrapper the way `admin/users/index.vue` currently does (that page has *no* redirect at all today — a real pre-existing gap, out of scope to fix here, but do not copy that anti-pattern into this new page).
  - [x] Page shell: `mx-auto max-w-[120rem] px-4 py-10 sm:px-6 lg:px-8` — matches the sitewide `{spacing.page-shell}` token (`120rem`) already used verbatim in `app/components/layout/header.vue` line 3. Do not use `admin/users/index.vue`'s `max-w-5xl`/gradient background (`from-green-50 to-teal-50`) — DESIGN.md's Do's/Don'ts explicitly retires that gradient and narrower admin shell (FR-33 scope), and this is a brand-new surface, not a modification of an existing one, so there's no legacy to preserve.
  - [x] On mount, `$fetch("/api/mensajes-contacto")` (GET, no body) into a `mensajes` ref; show a simple loading state and an empty-state message ("No hay mensajes de contacto todavía.") when the array is empty — no infinite-scroll needed here (UX-DR13's infinite-scroll component is for the 4 directories/feed/catálogo, not this admin inbox; this list is expected to be small enough for a single fetch, consistent with `admin/users/index.vue`'s existing single-fetch pattern).
  - [x] **Admin-table visual pattern (UX-DR15, first real usage — no existing component to import, build it inline in this page; do not build a separate shared `AdminTable.vue` component now)**: row-based, not card-grid; `divide-y divide-gray-200` for hairline row dividers (`#e5e7eb` per DESIGN.md `border-hairline` token is exactly Tailwind's `gray-200`); no `shadow` class anywhere on the rows/table wrapper (per DESIGN.md Do's/Don'ts, admin surfaces retire `shadow-md`); container `rounded-lg` (DESIGN.md `rounded.DEFAULT` = `0.5rem` = Tailwind's `rounded-lg`) with a single `border border-gray-200` around the whole table, not per-row.
  - [x] **Responsive per UX-DR17** — below `md`: each `MensajeContacto` renders as a stacked "labeled card" (each field on its own line with a small label, e.g. `<span class="text-xs text-gray-500">Correo</span>` above the value), separated by the same hairline divider, no per-card shadow. At `md`+: a real `<table>` with columns Nombre, Correo, Teléfono, Asunto, Mensaje, Fecha — use `hidden md:table`/`md:hidden` (or two sibling blocks) to switch, matching the same show/hide breakpoint mechanism the header already uses for its own mobile/desktop nav split (`hidden md:flex` / `md:hidden`).
  - [x] Columns/fields to display (AC #2): `{{ nombre }} {{ apellido }}` (full name), `correo`, `telefono` (show "—" if null, matches the optional-field convention), `asunto`, `mensaje` (wrap, don't truncate — full message must be visible per AC #2 "all sender-provided contact details/message content"), `createdAt` formatted with `new Date(m.createdAt).toLocaleString()` (same pattern `admin/users/index.vue`'s `formatDate` already uses — copy that one-line helper, it's small enough not to warrant extracting a shared util for a single new consumer).
  - [x] No deactivate/reactivate control here (that's `admin/users/index.vue`'s concern per UX-DR15, not this inbox) — this page is read-only, no action column beyond viewing.

- [x] Task 4: Add the inbox link to the admin nav entry point (EXPERIENCE.md Information Architecture: "Gestión de usuarios / Mensajes de Contacto inbox | UserDropdown, admin-only")
  - [x] **This nav placement doesn't exist for either admin page today** — `app/components/layout/header.vue`'s `UserDropdown` `#content` slot (lines 61-76) currently only has "Perfil" and "Cerrar sesión"; `/admin/users` is reachable only by typing the URL directly. Adding a "Gestión de usuarios" link is a **pre-existing gap, out of scope for this story** — only add the new "Mensajes de Contacto" link; don't fix the sibling gap opportunistically.
  - [x] In `header.vue`, inside the `#content` template (before or after the existing "Perfil" link), add: `<NuxtLink v-if="user?.isAdmin" to="/admin/mensajes-contacto" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" @click="closeMobileMenu"><Icon name="fa6-solid:inbox" class="mr-2" />Mensajes de Contacto</NuxtLink>` — `user` is already destructured from `storeToRefs(authStore)` in this file's script (line 115), no new import needed.

## Dev Notes

### Known pre-existing gaps surfaced by this story (not fixed here — noted for the record)

- **AD-4 (`server/utils/requireSession.ts`, DB-recheck of `activo`/`isAdmin`) does not exist anywhere in the codebase yet.** `server/api/admin/users.get.ts` (the only existing admin endpoint) trusts `session.user.isAdmin` straight from the JWT, which is exactly the "JWT-trust-only" pattern AD-4 says to eliminate. Task 2's new endpoint **intentionally mirrors this same existing (technically non-compliant) pattern** for consistency with the one other admin endpoint that exists today, rather than inventing a one-off DB-recheck for a single new route. Building the real shared `requireSession()` primitive is a bigger, cross-cutting change (AD-4 binds it to "all authenticated endpoints") that belongs to whichever story first needs it broadly (likely Epic 2's directory/profile work) — flagging it here so it isn't lost, not fixing it piecemeal now.
- **`admin/users/index.vue` has no route-level admin guard at all today** (no redirect, not even conditional-render gating on page load — anyone logged in can view the full user list, though the deactivate toggle itself is hidden for non-admins). Out of scope for this story; Task 3 explicitly avoids copying this pattern into the new page.
- **`admin/users/index.vue`'s nav entry point doesn't exist either** (reachable only via direct URL) — same EXPERIENCE.md IA row as this story's new page. Task 4 intentionally does not add it; flagged here only so a future pass (or FR-33's visual refresh in Epic 7) doesn't miss it.

### Architecture / conventions this story must follow

- **UX-DR12 / AD-6:** `app/middleware/admin.ts` is a named route middleware with auto-redirect — explicitly not "render the page then conditionally show/hide." This is the exact anti-pattern already present in `admin/users/index.vue` and in `settings.vue`'s `isAdmin` check; this story does not retrofit those, only ensures the *new* page does it right from the start.
- **UX-DR15:** Admin table pattern — row-based, hairline dividers, no per-row shadow, first used here. Do not build a shared `AdminTable.vue` component yet (only one consumer exists after this story); the visual convention is documented in Dev Notes so whichever story later retrofits `admin/users/index.vue` can extract a shared component at that point, once there are two consumers to actually share code between.
- **UX-DR17:** Responsive rule — admin tables stack as labeled cards below `md`, true tabular rows at `md`+. This is the first surface to implement that specific rule.
- **NFR-3:** Server-side authorization is non-negotiable even though the client middleware already blocks navigation — Task 2's endpoint enforces its own check independent of Task 1's middleware (AC #5 explicitly tests both layers).
- **No `dark:` classes** — per DESIGN.md's Do's/Don'ts ("Rely on OS `prefers-color-scheme` alone" is a Don't; FR-31's theme toggle doesn't exist yet). This was a real bug just fixed in `privacity.vue` (Story 1.3 follow-up) — don't reintroduce theme-media-query-dependent colors on this new page.
- **Prisma singleton / `createError` conventions** — same as every other `server/api/**` handler in this codebase (see Story 1.4's Dev Notes for the exact shape; unchanged here).

### Project Structure Notes

- New: `app/middleware/admin.ts`, `server/api/mensajes-contacto/index.get.ts`, `app/pages/admin/mensajes-contacto/index.vue`.
- Modified: `app/components/layout/header.vue` (one new conditional `NuxtLink` in the `UserDropdown` `#content` slot).
- No schema changes (the `MensajeContacto` model already exists from Story 1.4). No new npm dependencies.

### Previous Story Intelligence (Story 1.4)

- `MensajeContacto` fields are `id, nombre, apellido, correo, telefono, asunto, mensaje, createdAt, updatedAt` — no FK to `Usuario`. `asunto` already stores Spanish display text directly (post-review fix) — no translation/mapping layer needed when displaying it in this inbox.
- The Windows `EPERM`/`query_engine-windows.dll.node` file-lock issue only triggers on `prisma generate`/`migrate` — this story makes no schema changes, so it should not recur, but if any dev-server restart is needed mid-story, check for running `node.exe` processes first (established pattern from Stories 1.1 and 1.4).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5] — story statement and AC source
- [Source: _bmad-output/specs/spec-Elite_Hub/functional-requirements.md#CAP-3] — FR-41 detail
- [Source: _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md#AD-4, #AD-6, Structural Seed] — `requireSession.ts`/`admin.ts` both marked NEW; AD-4's "JWT-trust-only vs DB-recheck" inconsistency this story's Task 2 knowingly does not resolve
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/EXPERIENCE.md#Information Architecture, #Component Patterns] — UserDropdown nav placement; admin-table visual spec ("border-hairline row dividers, no per-row shadow," retires `rounded-lg shadow-md`)
- [Source: _bmad-output/planning-artifacts/epics.md#UX-DR12, #UX-DR15, #UX-DR17] — middleware requirement, admin-table pattern, responsive breakpoint rule
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/DESIGN.md#colors, #rounded, #spacing, #Do's and Don'ts] — `border-hairline` = `#e5e7eb` (Tailwind `gray-200`), `rounded.DEFAULT` = `0.5rem` (Tailwind `rounded-lg`), `spacing.page-shell` = `120rem`
- [Source: server/api/admin/users.get.ts] — existing admin-check convention this story's new GET endpoint mirrors (including its known AD-4 gap)
- [Source: app/pages/admin/users/index.vue] — existing admin page folder convention and `formatDate` helper pattern; also the anti-patterns (no guard, gradient bg, `max-w-5xl`) this story's new page must not repeat
- [Source: node_modules/@sidebase/nuxt-auth/dist/runtime/middleware/sidebase-auth.js] — canonical synchronous `useAuth()`-based middleware idiom this story's `admin.ts` mirrors
- [Source: app/components/layout/header.vue] — `UserDropdown` `#content` slot location for Task 4; `{spacing.page-shell}` class precedent (`max-w-[120rem]`)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

None — no schema changes in this story, no Prisma regeneration needed.

### Completion Notes List

- Created `app/middleware/admin.ts` — the first admin route guard in the project, synchronous, mirrors `@sidebase/nuxt-auth`'s own global-middleware idiom using `useAuth()`'s `status`/`data` (not the Pinia store, which only populates `isAdmin` post-mount).
- Created `server/api/mensajes-contacto/index.get.ts` — admin-only, mirrors `users.get.ts`'s exact session-check convention (intentionally not adding a DB-recheck here; flagged as a known cross-cutting AD-4 gap in Dev Notes, not fixed piecemeal).
- Built `app/pages/admin/mensajes-contacto/index.vue` — first real usage of the admin-table visual pattern (hairline row dividers, no per-row shadow, `rounded-lg` bordered container, `max-w-[120rem]` page shell) with the UX-DR17 responsive split (stacked labeled cards below `md`, real `<table>` at `md`+). Gated by `definePageMeta({ middleware: ["admin"] })`.
- Added the "Mensajes de Contacto" admin-only nav link to `header.vue`'s `UserDropdown`, per EXPERIENCE.md's IA — did not add the sibling "Gestión de usuarios" link (pre-existing gap, out of scope).
- **Post-review fix (user caught: link never appeared even as admin):** `header.vue` passes a `#content` template slot to `<UserDropdown>`, but the actual component (`app/components/userDropdown.vue`) never declares a `<slot name="content" />` — it renders its own fully hardcoded menu (`Perfil`/`Ajustes`/`Cerrar sesión`) instead, silently ignoring whatever `header.vue` passes into that slot. This was a pre-existing dead-code path (the original "Perfil"/"Cerrar sesión" in `header.vue`'s slot were already just as dead before this story). Fix: reverted the nav-link addition in `header.vue` (restored to its pre-story state) and instead added the admin-gated `<li>`/`NuxtLink` directly into `userDropdown.vue`'s real `<ul>`, using the same `(authStore.user as any)?.isAdmin` check already used one line above it (line 12) for the "Administrador" badge.
- **Post-review fix (user caught: text invisible, dark-on-dark):** the page had no explicit background color, so it inherited the layout's `dark:bg-neutral-900` (via OS `prefers-color-scheme`, no in-app toggle exists yet) underneath `text-gray-900`/`text-gray-700` text meant for a white background — same root cause already fixed once in `privacity.vue` (Story 1.3 follow-up). Fix: added `bg-white` to the page's outer container and to the table/card wrapper, giving this page a deterministic light background regardless of system theme, consistent with the "no `dark:` classes until FR-31's real toggle exists" convention already established.
- No automated tests written — same project-wide convention as prior stories (no test framework installed, PRD/SPEC non-goal). Verified manually instead: traced the middleware logic against both authenticated-non-admin and unauthenticated cases, confirmed the GET endpoint's 403 path matches `users.get.ts` exactly, and read the full page template twice to confirm the `md:hidden`/`hidden md:table` split has no gap or double-render at the breakpoint boundary.

### File List

- `app/middleware/admin.ts` (new)
- `server/api/mensajes-contacto/index.get.ts` (new)
- `app/pages/admin/mensajes-contacto/index.vue` (new)
- `app/components/userDropdown.vue` (modified — added the real admin-only "Mensajes de Contacto" nav link, the component `header.vue` actually renders)
- `app/components/layout/header.vue` (touched then reverted — its `#content` slot is dead code, unrelated to this fix; left as-is)

## Change Log

- 2026-07-25: Story implemented — first admin route guard, first admin-table pattern usage, new read-only Mensajes de Contacto inbox.
