# Architecture — Elite Hub

_Generated: 2026-07-16 | Scan level: Deep | Repository type: Monolith (single part)_

## Executive Summary

Elite Hub is a Nuxt 4 full-stack monolith: a Vue 3 SPA/SSR frontend (`app/`) and a Nitro-powered REST API (`server/api/`) living in the same codebase and deployment unit, backed by PostgreSQL via Prisma. It serves a sports/community marketplace domain — news (Noticias), events (Eventos), user profiles with extended info (deportista/marca/nutricionista/patrocinador types via `TipoUsuario`), and a lightweight admin-editable CMS for static pages.

This is a **brownfield project with an existing, working core** — a prior technical assessment (`advice_copilot.md`) already concluded the stack is sound and recommended continuing brownfield rather than rewriting.

## Technology Stack

| Category | Technology | Version | Justification |
|---|---|---|---|
| Meta-framework | Nuxt | ^4.0.0 | File-based routing, SSR, unified frontend+backend (Nitro) |
| UI framework | Vue | ^3.5.17 | Composition API, `<script setup>` throughout |
| Language | TypeScript | ^5.8.3 | Used across `server/` and most of `app/`; a few `.vue` files still use plain `<script setup>` without `lang="ts"` |
| State management | Pinia (+ @pinia/nuxt) | ^3.0.3 / ^0.11.1 | Single store today: `auth.ts` |
| Styling | Tailwind CSS (+ @tailwindcss/vite) | ^4.1.11 | Utility-first, Tailwind 4's Vite plugin (no PostCSS config file needed) |
| ORM | Prisma (+ @prisma/client) | ^6.12.0 | PostgreSQL, 13 models |
| Auth | next-auth + @sidebase/nuxt-auth + @next-auth/prisma-adapter | ^4.21.1 / ^1.0.0 / ^1.0.7 | Credentials provider (email+password), JWT session strategy |
| Password hashing | bcrypt | ^6.0.0 | Cost factor 12 |
| Icons | @nuxt/icon | 1.15.0 | Iconify-backed (`fa6-solid:*`, `solar:*` sets used) |
| Images | @nuxt/image | 1.10.0 | Present in deps; not observed in use during this scan |
| Animation | @hypernym/nuxt-anime, vue-countup-v3 | ^2.1.1 / ^1.4.2 | Homepage stat counters |
| Package manager | pnpm | 10.13.1 (pinned) | `pnpm-workspace.yaml` present but only for `onlyBuiltDependencies` — not a real workspace/monorepo |

## Architecture Pattern

**Monolith, layered by Nuxt convention:**
- Presentation layer: `app/pages/` (routes) + `app/components/` (UI) + `app/layouts/`
- State layer: `app/stores/` (Pinia) + `app/composables/` (data-fetch wrappers)
- API layer: `server/api/` (Nitro handlers, one file per route+method)
- Data layer: `prisma/schema.prisma` + `server/utils/prisma.ts` (shared client)

There is no service/repository layer between API handlers and Prisma — handlers call `prisma.*` directly. `techbackend.md` itself flags this as a future improvement ("Extraer una capa de servicios para la lógica de negocio").

## Data Architecture

See [`data-models.md`](./data-models.md) for the full schema (13 models + `Nivel` enum) and [`db.md`](../db.md) for the original narrative write-up. Core entity: `Usuario`, extended via `Informacion` (profile detail) and `TipoUsuario` (role/category), with `Noticia`/`Evento` as author-attributed content and `PQRS` as a support-ticket side model.

## API Design

See [`api-contracts.md`](./api-contracts.md) for all 22 endpoints. Pattern: session-cookie auth (`getServerSession`), admin-gated mutations, multipart form uploads writing directly to Nitro's fs-backed public storage.

## Component Overview

See [`component-inventory.md`](./component-inventory.md). Small, flat component set (7 files) — no design system or shared primitives yet; `EventCard`/`NewsCard` are near-duplicates.

## Source Tree

See [`source-tree-analysis.md`](./source-tree-analysis.md) for the full annotated tree.

## Development Workflow

See [`development-guide.md`](./development-guide.md). Notably: **no automated tests exist**, and `pnpm dev` runs Prisma migrations automatically on every start.

## Deployment Architecture

See [`deployment-guide.md`](./deployment-guide.md). **No CI/CD or deployment configuration currently exists.** The most significant open risk: uploaded files are written to local disk (`server/public/` via Nitro's fs storage driver), which will not survive most production hosting environments without a storage-driver change.

## Testing Strategy

No unit/component tests for `app/`/`server/` (zero `*.test.ts`/`*.spec.ts` matches). There is a separate E2E browser suite at `e2e/` (pytest + Playwright, Python) covering login + UI navigation flows for the public marketing pages — see [`e2e-testing.md`](./e2e-testing.md). Its import wiring was broken (missing `LoginPage`, wrong `sys.path` target) and has since been fixed and verified to collect cleanly; it remains untracked by git.

## Known Risks / Technical Debt (surfaced by this scan)

1. **File storage is local-disk-only** — blocks safe production deployment on ephemeral/scaled hosts (see `deployment-guide.md`).
2. **No unit/component tests for `app/`/`server/`; the E2E suite is untracked by git** — `e2e/` (Python/pytest/Playwright) exists only locally (`git ls-files e2e` returns nothing). Its import bug is now fixed (see `e2e-testing.md`), but it still only covers 4 public-page navigation flows, not the CRUD API endpoints or admin flows, and hasn't been verified to pass end-to-end against a running app.
3. **No CI/CD pipeline.**
4. **Auth package overlap:** `next-auth`, `@sidebase/nuxt-auth`, and `@next-auth/prisma-adapter` are all present — `advice_copilot.md` already flagged this as worth auditing for redundancy.
5. **RBAC schema exists but is unused:** `Rol`/`Permiso`/`PermisoRol` models are defined, but all authorization checks in `server/api/**` use the flat `Usuario.isAdmin` boolean instead.
6. **No transactional writes** for compound operations (file upload + DB write) — a failed DB write after a successful file upload leaves an orphaned file with no rollback.
7. **Inconsistent Prisma client usage:** most of `server/api/**` uses the shared singleton (`server/utils/prisma.ts`, auto-imported as `prisma`), but `server/api/content/[page].get.ts` and `.put.ts` each instantiate their own `new PrismaClient()`.
