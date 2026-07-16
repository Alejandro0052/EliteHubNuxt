# Project Documentation Index — Elite Hub

_Generated: 2026-07-16 | Scan level: Deep | Mode: Initial scan_

👆 **This is the primary entry point for AI-assisted development on this project.**

## Project Overview

- **Type:** Monolith (single part)
- **Primary Language:** TypeScript (Vue 3 SFCs + Nitro handlers)
- **Architecture:** Layered Nuxt monolith — see [architecture.md](./architecture.md)

## Quick Reference

- **Tech Stack:** Nuxt 4, Vue 3, Pinia, Tailwind CSS 4, Nitro, Prisma + PostgreSQL, AuthJS (credentials/JWT)
- **Entry Points:** `app/app.vue` (frontend shell), `server/api/auth/[...].ts` (auth), `nuxt.config.ts` (config)
- **Architecture Pattern:** Pages/components/stores → API handlers → Prisma → Postgres (no service layer)

## Generated Documentation

- [Project Overview](./project-overview.md)
- [Architecture](./architecture.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Component Inventory](./component-inventory.md)
- [Development Guide](./development-guide.md)
- [Deployment Guide](./deployment-guide.md) — no CI/CD or platform config exists yet; see doc for what's needed
- [API Contracts](./api-contracts.md)
- [Data Models](./data-models.md)
- [E2E Testing](./e2e-testing.md) — Playwright/pytest suite; import bug fixed, still untracked by git

## Existing Documentation (pre-dating this scan)

- [techfront.md](../techfront.md) — Frontend architecture notes (Spanish, hand-written)
- [techbackend.md](../techbackend.md) — Backend architecture notes (Spanish, hand-written)
- [db.md](../db.md) — Database schema narrative (Spanish, hand-written)
- [advice_copilot.md](../advice_copilot.md) — Brownfield viability assessment (not an architecture doc)
- [README.md](../README.md) — Generic Nuxt starter boilerplate, not project-specific

## Known Risks (see architecture.md for full list)

1. Uploaded files are stored on local disk — will not survive most production deploys without a storage-driver change
2. No unit/component tests for `app/`/`server/`; the E2E suite (`e2e/`) is untracked by git (fixed and now collects cleanly — see `e2e-testing.md`)
3. No CI/CD pipeline configured
4. Auth package overlap (`next-auth` + `@sidebase/nuxt-auth` + `@next-auth/prisma-adapter`) not yet audited for redundancy
5. `Rol`/`Permiso` RBAC schema exists but is unused — all authorization is via `Usuario.isAdmin`

## Getting Started

```bash
cp .env.example .env   # AUTH_SECRET, AUTH_ORIGIN, DATABASE_URL
pnpm install
pnpm dev
```

See [development-guide.md](./development-guide.md) for full setup, scripts, and conventions.

## Brownfield PRD Command

When ready to plan new features, run the PRD workflow and point it at this index (`docs/index.md`) as input context.
