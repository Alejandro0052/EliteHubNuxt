---
baseline_commit: 1d528cb26f89c80c0048b3aabc9a38dc2455ad85
---

# Story 1.6: Stats reales del homepage

Status: done

## Story

As any visitor,
I want the homepage stat counters to reflect real registered-user and event counts,
so that the numbers I see are trustworthy, not hardcoded.

## Acceptance Criteria

1. **Given** the current hardcoded values (327+ deportistas, 125+ patrocinadores, 62+ marcas, 86+ nutricionistas, 51+ eventos) **When** the homepage loads **Then** these are replaced by live counts computed from the database (FR-12)
2. **Given** a deactivated (`activo: false`) Usuario **When** the counts are computed **Then** they are excluded from their `TipoUsuario` count (SM-4/NFR-6 — deactivated Usuarios never inflate any count)
3. **Given** an Evento that is not published (`publicado: false`) **When** the count is computed **Then** it is excluded, matching the same visibility rule the public `/api/eventos` listing already applies
4. **Given** `server/utils/aggregates.ts` **When** it's built **Then** it exposes generic, reusable count functions — not homepage-specific — since Epic 6's Reportes/Indicadores (FR-29/30) will consume the exact same source later, and SM-4 requires the two surfaces to never visibly diverge

## Tasks / Subtasks

- [x] Task 1: Create `server/utils/aggregates.ts` (AC: #2, #3, #4)
  - [x] **This file does not exist yet** — it's marked `NEW` in ARCHITECTURE-SPINE's structural seed, explicitly shared between this story (FR-12) and Epic 6's not-yet-started Reportes/Indicadores (FR-29/30); "aggregates.ts shared with §5.11 (SM-4)". Build it generically now so Epic 6 can import the same functions later without a rewrite — but do **not** build the Reportes/Indicadores page itself (out of scope, Epic 6/Story 6.1, still `backlog`).
  - [x] `Usuario → Informacion → TipoUsuario` is the real type path (two hops, both nullable; confirmed in `prisma/schema.prisma` — `Informacion.tipoUsuarioId Int?` / `Usuario.informacionId Int?`). Prisma's `groupBy` only operates on scalar fields of the queried model, not nested relations two hops away, so do **not** attempt a single `groupBy` call — use one `prisma.usuario.count()` per fixed `TipoUsuario.tipo` value instead (four types, `Promise.all`'d), matching this codebase's existing simple-Transaction-Script style (no query over-engineering for a 4-way fixed split):
    ```ts
    const TIPOS_USUARIO = ["Deportista", "Marca", "Nutricionista", "Patrocinador"] as const;

    export async function getUsuariosPorTipo(): Promise<Record<(typeof TIPOS_USUARIO)[number], number>> {
      const counts = await Promise.all(
        TIPOS_USUARIO.map((tipo) =>
          prisma.usuario.count({
            where: { activo: true, informacion: { tipoUsuario: { tipo } } },
          }),
        ),
      );
      return Object.fromEntries(TIPOS_USUARIO.map((tipo, i) => [tipo, counts[i]])) as Record<
        (typeof TIPOS_USUARIO)[number],
        number
      >;
    }

    export async function getEventosCount(): Promise<number> {
      return prisma.evento.count({ where: { publicado: true } });
    }
    ```
  - [x] `where: { activo: true, ... }` is the deactivated-Usuario exclusion (AC #2/SM-4/NFR-6) — inlined directly here, not via the shared `activeUserFilter()` Prisma where-helper (AD-5), which **also does not exist yet**. Do not build `activeUserFilter()` in this story: it's designed for filtering *collections of user-authored content* (directories, feed, catálogo — takes a relation-name parameter and an admin-bypass flag), a different shape of problem than a scalar count rollup. Building it belongs to whichever Epic 2/3/5 story first needs to filter an actual content list; note this as a known, still-open gap, don't smuggle it in here.
  - [x] `where: { publicado: true }` on the Evento count matches `server/api/eventos/index.get.ts`'s existing listing filter exactly (AC #3) — same visibility rule, no new convention invented.

- [x] Task 2: Create `server/api/stats/index.get.ts` (AC: #1)
  - [x] Public endpoint (no `requireSession`/auth check) — the homepage stats are visible to anonymous visitors today (`definePageMeta({ auth: false })` on `index.vue`), so the data backing them must be too.
  - [x] Call `getUsuariosPorTipo()` and `getEventosCount()` from Task 1's `aggregates.ts`, then map the singular `TipoUsuario` keys to the homepage's plural display labels (this mapping lives here, not in `aggregates.ts`, since it's homepage-specific presentation, not a generic aggregate). Implemented with **no explicit import** — `server/utils/**` exports are Nitro auto-imports project-wide, exactly like `prisma` from `server/utils/prisma.ts` (used everywhere with zero import statements); an explicit `import ... from "~/server/utils/aggregates"` would be inconsistent with that established convention:
    ```ts
    import { getUsuariosPorTipo, getEventosCount } from "~/server/utils/aggregates";

    export default defineEventHandler(async () => {
      const [porTipo, eventos] = await Promise.all([getUsuariosPorTipo(), getEventosCount()]);
      return {
        deportistas: porTipo.Deportista,
        patrocinadores: porTipo.Patrocinador,
        marcas: porTipo.Marca,
        nutricionistas: porTipo.Nutricionista,
        eventos,
      };
    });
    ```
  - [x] Wrap in try/catch, `throw createError({ statusCode: 500, message: "Error al obtener estadísticas" })` on failure — matches every other `server/api/**` handler's tail convention.

- [x] Task 3: Wire `app/pages/index.vue`'s stats section to live data (AC: #1)
  - [x] **Read the current stats section first** (`app/pages/index.vue` lines 94-100) — five hardcoded `<stats :endValue="327" text="Deportistas" ...>` components. `app/components/stats.vue` itself needs **no changes**: `endValue` is already just a plain required `Number` prop.
  - [x] In the script, add a `stats = ref<{ deportistas: number; patrocinadores: number; marcas: number; nutricionistas: number; eventos: number } | null>(null)` and fetch it in the existing `onMounted` block (already fetches `noticias`/`eventos` previews there — add the stats fetch alongside, same `Promise`-per-call style already used): `stats.value = await $fetch("/api/stats")`.
  - [x] Wrap the stats grid (`<div class="grid grid-cols-1 gap-6 ...">`) in `v-if="stats"`, replacing each hardcoded `:endValue="327"` etc. with `:endValue="stats.deportistas"` (and so on for the other four) — do not render the grid with a placeholder `0` while loading; showing nothing until `stats` resolves avoids the `CountUp` component animating once from a fake `0` and then jumping/re-animating when real data arrives a moment later.
  - [x] Text labels (`text="Deportistas"`, etc.) and `icon` props are unchanged — only `:endValue` becomes dynamic.

## Dev Notes

### Known pre-existing / still-open gaps this story does not touch

- **`activeUserFilter()` (AD-5) still does not exist.** This story's `aggregates.ts` inlines its own `activo: true` condition (a scalar count, not a content-list filter) rather than building the shared helper — flagged so it isn't mistaken for "AD-5 is now done." Whichever Epic 2/3/5 story first needs to filter a real content collection by active-Usuario should build it then.
- **`requireSession.ts` (AD-4) still does not exist**, same as noted in Story 1.5 — not relevant here since `/api/stats` is intentionally public and needs no session check at all.
- **FR-13's "any authenticated Usuario can create Eventos/Noticias" is still admin-gated in code** (`server/api/eventos/index.post.ts` line 16: `if (!session?.user?.id || !session.user.isAdmin)`) — pre-existing, belongs to Story 1.7 (`backlog`), unrelated to this story's read-only count.

### Architecture / conventions this story must follow

- **AD-1 (Transaction Script):** both new files are simple, direct `prisma.*` calls — no service/repository layer, no premature `groupBy`/raw-SQL cleverness for a fixed 4-way split.
- **`server/utils/aggregates.ts` is the single shared source** for Usuario-by-type and Evento counts (SM-4) — Epic 6's Reportes/Indicadores story must import these same two functions when it's built, not reimplement its own counting logic. This story's job is only to make that future reuse painless, not to build Epic 6 early.
- **Prisma singleton / `createError` conventions** — identical to every other `server/api/**` handler in this codebase (see Stories 1.4/1.5's Dev Notes for the exact shape).
- **No test framework** — same project-wide MVP non-goal as every prior story; verify manually (see Completion Notes expectations from Stories 1.4/1.5).

### Project Structure Notes

- New: `server/utils/aggregates.ts`, `server/api/stats/index.get.ts`.
- Modified: `app/pages/index.vue` (stats section only — hero, noticias, and eventos sections untouched).
- No schema changes, no new npm dependencies.

### Previous Story Intelligence (Stories 1.4/1.5)

- Both prior stories mirrored existing sibling endpoints' exact conventions (`register.post.ts`, `users.get.ts`) rather than inventing new patterns — same approach applies here (`eventos/index.get.ts`'s `publicado: true` filter is the direct precedent for Task 1's Evento count).
- Story 1.5 surfaced a real bug where `header.vue` passed a `#content` slot to `<UserDropdown>` that the component never rendered (dead code) — a reminder to actually read the full component being modified/consumed, not just assume a prop/slot contract works because it looks plausible. `stats.vue` was read in full during this story's creation for exactly this reason — confirmed its `endValue` prop contract is exactly as simple as it looks, no hidden requirement.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.6] — story statement and AC source
- [Source: _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md#§5.4, §5.11, Structural Seed] — `aggregates.ts` marked NEW, shared FR-12/FR-29/FR-30 source, SM-4 divergence-prevention rule
- [Source: prisma/schema.prisma] — `Usuario.informacionId`/`Informacion.tipoUsuarioId` nullable two-hop relation path; `Evento.publicado` field
- [Source: server/api/eventos/index.get.ts] — `where: { publicado: true }` precedent this story's Evento count mirrors
- [Source: server/api/auth/register.post.ts] — `TIPO_DEPORTISTA`/`TIPO_MARCA`/`TIPO_NUTRICIONISTA`/`TIPO_PATROCINADOR` exact string constants confirming `TipoUsuario.tipo` values
- [Source: app/pages/index.vue] — current hardcoded stats section (lines 94-100), existing `onMounted` fetch pattern for noticias/eventos previews
- [Source: app/components/stats.vue] — `endValue` prop contract (plain required `Number`, no hidden requirement)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

None — no schema changes, no Prisma regeneration needed.

### Completion Notes List

- Created `server/utils/aggregates.ts` — generic, reusable `getUsuariosPorTipo()` (4 separate `count()` calls per fixed `TipoUsuario.tipo`, `activo: true` filter) and `getEventosCount()` (`publicado: true` filter, matching `eventos/index.get.ts`'s existing convention). Intentionally not yet consumed by anything beyond this story — Epic 6's Reportes/Indicadores will import it later.
- Created `server/api/stats/index.get.ts` — public endpoint (no auth check), maps the singular `TipoUsuario` keys to the homepage's plural display keys. Implemented with no explicit import of `aggregates.ts`'s exports, relying on the same Nitro `server/utils/**` auto-import convention already used for the `prisma` singleton everywhere else in this codebase.
- Wired `app/pages/index.vue`'s 5 hardcoded stat values to a new `stats` ref, fetched in the existing `onMounted` block alongside the noticias/eventos previews. The stats grid is now `v-if="stats"` — nothing renders until the real numbers arrive, avoiding a fake-then-real `CountUp` double-animation.
- **Post-review fix (user caught: stat boxes disappeared entirely, no console error):** confirmed via direct `curl http://localhost:3000/api/stats` that the endpoint itself worked correctly (real counts returned, HTTP 200) — the bug was purely client-side. Root cause: the new ref was named `stats`, identical to the `<stats>` component already used five times in this same template (`app/components/stats.vue`, Nuxt auto-imported). In Vue 3 `<script setup>`, a local binding takes precedence over an auto-imported component of the same name during template resolution, so every `<stats>` tag silently failed to resolve as a component (attempting to render the `Ref` itself instead) — no thrown/logged error, just nothing rendered, matching the user's exact symptom ("no veo ningún mensaje... la consola no dice nada"). Fix: renamed the ref from `stats` to `siteStats` everywhere (declaration, fetch assignment, template bindings) — no other changes needed.
- No automated tests written — same project-wide convention as all prior stories. Verified manually instead: traced `getUsuariosPorTipo()`'s four `count()` calls against the confirmed `Usuario → Informacion → TipoUsuario` relation path and the exact `TipoUsuario.tipo` string constants from `register.post.ts`; confirmed the `/api/stats` response shape matches exactly what `index.vue`'s template now expects (`stats.deportistas`/`.patrocinadores`/`.marcas`/`.nutricionistas`/`.eventos`); re-read `stats.vue` to confirm no change was needed there.

### File List

- `server/utils/aggregates.ts` (new)
- `server/api/stats/index.get.ts` (new)
- `app/pages/index.vue` (modified — stats section wired to live data)

## Change Log

- 2026-07-25: Story implemented — homepage stat counters now reflect live, DB-computed counts; `aggregates.ts` established as the shared source for future Reportes/Indicadores reuse.
