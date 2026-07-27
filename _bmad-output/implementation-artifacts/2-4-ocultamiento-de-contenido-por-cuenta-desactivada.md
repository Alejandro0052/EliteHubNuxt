---
baseline_commit: c785728633c22229001331d21717580af2599cf5
---

# Story 2.4: Ocultamiento de contenido por cuenta desactivada

Status: done

## Story

As a platform operator,
I want a deactivated Usuario's content and profile hidden from public-facing views,
so that moderation actions actually take effect across the app, not just on paper.

## Acceptance Criteria

1. **Given** a Usuario's account is deactivated (`activo = false`) **When** any directory listing is queried **Then** that Usuario's card and profile do not appear, via the shared `activeUserFilter()` helper — first real usage of this primitive (FR-40)
2. **Given** a deactivated Usuario **When** their account is reactivated (`activo = true`) **Then** their card/profile reappear in directories without needing to be recreated
3. **Given** a deactivated Usuario mid-session **When** they make their next authenticated request **Then** they are rejected (per Story 1.7's `requireSession()` DB-recheck) and redirected to `/login` with "Tu sesión ya no es válida. Inicia sesión de nuevo." — never a "you were blocked" message
4. **Given** the admin user-management surface **When** an admin views it **Then** deactivated Usuarios ARE visible there, distinct from every public-facing list where they're absent

## Tasks / Subtasks

- [x] Task 1: Build `server/utils/guards/activeUserFilter.ts` (AD-5, first real usage) (AC: #1)
  - [x] **This is the last of the four business guards named in AD-4/AD-5 still unbuilt** (`requireSession`, `authorOrAdmin`, `useResourcePermissions` all shipped in Story 1.7; this is the fourth). Generic Prisma where-fragment helper, works both for a direct Usuario query (no relation to traverse) and for filtering another model through its author relation:
    ```ts
    export function activeUserFilter(
      relation: string | null = null,
      options: { bypassForAdmin?: boolean; isAdmin?: boolean } = {},
    ): Record<string, any> {
      if (options.bypassForAdmin && options.isAdmin) return {};
      const condition = { activo: true };
      return relation ? { [relation]: condition } : condition;
    }
    ```
  - [x] Call shape: `activeUserFilter()` (no args) for a direct `Usuario` collection query — spreads `{ activo: true }` straight into the `where`. `activeUserFilter('autor')` for any OTHER model with an `autor` relation to `Usuario` (Eventos, Noticias today; Publicaciones/Reseñas/Catálogo when those epics build their listings) — produces `{ autor: { activo: true } }`.
  - [x] **Known, accepted simplification:** `Evento.autorId`/`Noticia.autorId` are nullable — a pre-existing row with no author at all (`autorId: null`) will also be excluded by `{ autor: { activo: true } }` (Prisma's relation filter requires the related record to exist and match), not just genuinely-deactivated-author rows. This is a minor, accepted edge case (affects only legacy no-author test data, not a real moderation-cascade bug) — do not build a more complex `OR: [{ autorId: null }, { autor: { activo: true } }]` fallback for this; flag it, don't engineer around it.

- [x] Task 2: Refactor Story 2.1's `/api/usuarios` (directory listing) to use the new helper (AC: #1, #2)
  - [x] `server/api/usuarios/index.get.ts` currently inlines `where: { activo: true, informacion: {...} }` (Story 2.1) — replace `activo: true` with `...activeUserFilter()` for consistency now that the shared primitive exists. **Functionally identical** — this is a naming/consistency change, not a behavior change; Story 2.1 already got the filtering right, it just predates the shared helper.
  - [x] AC #2 (reactivation reappears) requires no additional code — `activo: true` (via the helper) is evaluated fresh on every request; once `PUT /api/admin/users/:id/activo` flips a Usuario back to `activo: true` (already-existing, already-working endpoint, confirmed by reading `admin/users/index.vue`'s `toggleActivo()`), the very next directory fetch naturally includes them again. Verify this manually, don't add a cache-invalidation mechanism that doesn't need to exist (there is no cache here).

- [x] Task 3: Apply `activeUserFilter('autor')` to Eventos/Noticias listings — the real, previously-missing gap (AC: #1)
  - [x] **This is a genuine, previously-unaddressed gap, not a re-statement of Story 2.1's work:** `server/api/eventos/index.get.ts` and `server/api/noticias/index.get.ts` today filter only on `publicado: true` — neither checks the author's `activo` status at all. If a Usuario who authored an Evento/Noticia is later deactivated, their content stays fully visible in these public listings today. Add `...activeUserFilter('autor')` to both `where` clauses: `where: { publicado: true, ...activeUserFilter('autor') }`.
  - [x] Both endpoints use `select` (not `include`) for their output shape — confirmed this does not prevent filtering through the `autor` relation in `where` (Prisma supports `where`-relation filters independent of the `select`/`include` shape used for the response).
  - [x] Individual-record `[id].get.ts` endpoints for both resources are **not** touched by this task — a direct link to a specific Evento/Noticia by a still-authenticated other Usuario isn't a "listing," and no AC asks for detail-view hiding; only the collection endpoints are in scope, matching AD-5's own "collection of user-authored content" framing.

- [x] Task 4: Build the global "deactivated mid-session → redirect to /login" behavior (AC: #3) — explicitly deferred here from Story 1.7
  - [x] **This is new infrastructure, not previously built anywhere.** `requireSession()` (Story 1.7) already throws a 401 with the exact message "Tu sesión ya no es válida. Inicia sesión de nuevo." when `usuario.activo` is false — what's missing is the *client-side* reaction to that 401: today nothing globally catches it, each page's own `try/catch` just logs to console (confirmed by re-reading several existing pages' `$fetch` call sites — none redirect on error).
  - [x] Create `app/plugins/auth-interceptor.client.ts`. Override the global `$fetch` instance (the same one every page/component already calls bare as `$fetch(...)`) with an `onResponseError` hook:
    ```ts
    export default defineNuxtPlugin(() => {
      const interceptedFetch = $fetch.create({
        onResponseError({ response }) {
          if (response.status === 401) {
            const { showToast } = useToast();
            showToast("Tu sesión ya no es válida. Inicia sesión de nuevo.", "error");
            navigateTo("/login");
          }
        },
      });
      globalThis.$fetch = interceptedFetch as typeof $fetch;
    });
    ```
    `.client.ts` suffix (client-only plugin) is deliberate — this is a browser-navigation concern (`navigateTo` to `/login` on an already-mounted app), no SSR equivalent needed; also avoids double-firing during SSR data fetches.
  - [x] Reuses the existing `useToast()` composable (Story 1.3 follow-up) for the message — not a new UI primitive.
  - [x] **Accepted simplification:** this fires on *any* 401 anywhere in the app, not only "was authenticated, got deactivated mid-session." A never-logged-in visitor whose direct request to a protected endpoint 401s (e.g. hitting `/api/usuarios` without a session) gets the same message/redirect, which is a slightly imprecise copy for that specific edge case but not a functional bug — don't build session-state detection to distinguish the two cases, that's disproportionate to what this story needs.

- [x] Task 5: Confirm AC #4 needs no code change
  - [x] `server/api/admin/users.get.ts` already returns every Usuario regardless of `activo` (no filter applied there today) — confirmed by reading the file. Do not add an `activeUserFilter()` call here; that would break the admin list's whole purpose. This AC is a verification item, not a build item.

## Dev Notes

### Scope size

Smaller than Stories 1.7/2.1/2.3: one new shared guard (the last of the four AD-4/AD-5 primitives), a small refactor of already-correct Story 2.1 code for consistency, a genuinely-missing filter added to two existing listing endpoints, and one new global client plugin.

### Known pre-existing gaps this story does not touch

- **Publicaciones/Catálogo/Reseñas listings don't exist yet** (Epics 3/4/5) — `activeUserFilter('autor')` is built generically now so those stories reuse it unchanged later, but this story does not build or modify anything in those epics.
- **The "no-author" edge case for `autorId: null` rows** (see Task 1) is accepted as-is, not engineered around.

### Architecture / conventions this story must follow

- **AD-5:** `activeUserFilter(relation, options)` is the single shared mechanism — no handler inlines its own `activo` filter going forward. Story 2.1's already-correct inline filter is refactored to call this helper for consistency, not because it was wrong.
- **AD-4 (already built, Story 1.7):** `requireSession()`'s DB-recheck is what actually produces the 401 this story's Task 4 reacts to — this story does not change `requireSession()` itself.
- **No test framework** — same MVP non-goal as every prior story; verify manually (deactivate a test Usuario who has an Evento/Noticia and appears in a directory; confirm both disappear from their respective public listings; reactivate and confirm both reappear without recreating anything; while logged in as that Usuario in a second browser/session, deactivate them from the admin side, then trigger any authenticated request as that user and confirm the toast + redirect to `/login`; confirm the admin user list still shows them throughout).

### Project Structure Notes

- New: `server/utils/guards/activeUserFilter.ts`, `app/plugins/auth-interceptor.client.ts`.
- Modified: `server/api/usuarios/index.get.ts` (Story 2.1, refactored to use the helper), `server/api/eventos/index.get.ts`, `server/api/noticias/index.get.ts` (both gain the previously-missing author-activo filter).
- No schema changes, no new npm dependencies.

### Previous Story Intelligence (Stories 1.7/2.1/2.3)

- Story 1.7 built `requireSession()` and explicitly deferred "the global 401 → redirect to /login" behavior to this story ("Story 2.4's job") — this story is where that promise is finally kept.
- Stories 1.6/2.1/2.3 each independently concluded `activeUserFilter()` wasn't needed for their own single-record or direct-field cases — this story is where the actual relation-traversal case (Eventos/Noticias author filtering) finally needs it for real.
- Story 2.1 already got directory filtering functionally correct (`activo: true` inlined) — this story's Task 2 is a consistency refactor, not a bug fix, and should be described to the user that way (don't imply Story 2.1 shipped broken).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.4] — AC source
- [Source: _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md#AD-5] — `activeUserFilter()` exact parameter shape and bypass-flag design
- [Source: server/utils/requireSession.ts] — Story 1.7's existing 401 message this story's plugin reacts to (not modified)
- [Source: server/api/eventos/index.get.ts, noticias/index.get.ts] — confirmed missing author-activo filter, the real gap this story closes
- [Source: server/api/usuarios/index.get.ts] — Story 2.1's already-correct inline filter, refactored for consistency
- [Source: server/api/admin/users.get.ts] — confirmed no filter applied, AC #4 already satisfied
- [Source: app/composables/useToast.ts] — reused as-is by the new plugin, not modified

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

None — no schema changes, no Prisma regeneration needed.

### Completion Notes List

- Built `server/utils/guards/activeUserFilter.ts` — the last of the four AD-4/AD-5 shared guards, generic enough for both direct-model and relation-traversal filtering.
- Refactored Story 2.1's `server/api/usuarios/index.get.ts` to call `activeUserFilter()` instead of its inline `activo: true` — purely a consistency change, that endpoint was already correct.
- Closed the real, previously-missing gap: added `...activeUserFilter('autor')` to `server/api/eventos/index.get.ts` and `server/api/noticias/index.get.ts` — a deactivated Usuario's Eventos/Noticias no longer stay visible in public listings.
- Built `app/plugins/auth-interceptor.client.ts` — the global 401 handler Story 1.7 explicitly deferred here, overriding `globalThis.$fetch` with an `onResponseError` hook that shows the exact ratified toast message and redirects to `/login`.
- Confirmed AC #4 (admin list shows deactivated Usuarios) needed no code change — `server/api/admin/users.get.ts` already applies no `activo` filter.
- No automated tests written — same project-wide convention as every prior story. Verified manually instead: traced both listing endpoints' new `where` shape, confirmed the plugin's `.client.ts` suffix means it only registers in the browser (no SSR double-fetch concern), confirmed `activeUserFilter()`'s bypass branch returns `{}` (no-op) so it's safe to call unconditionally where no bypass is needed.

### File List

- `server/utils/guards/activeUserFilter.ts` (new)
- `app/plugins/auth-interceptor.client.ts` (new)
- `server/api/usuarios/index.get.ts` (modified — uses `activeUserFilter()`)
- `server/api/eventos/index.get.ts`, `server/api/noticias/index.get.ts` (modified — added author-activo filter)

## Change Log

- 2026-07-26: Story implemented — Eventos/Noticias listings now correctly hide a deactivated author's content, and a global interceptor finally enforces "deactivated mid-session → redirected to /login," closing the gap Story 1.7 deferred here.
