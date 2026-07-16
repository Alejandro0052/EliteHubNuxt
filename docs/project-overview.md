# Project Overview — Elite Hub

_Generated: 2026-07-16_

## What is this project?

**Elite Hub** (`nuxt-app` in `package.json`, `docs.json` name: "Elite Hub Nuxt") is a Nuxt 4 full-stack web application for a sports/community platform — connecting deportistas (athletes), marcas (brands), nutricionistas (nutritionists), and patrocinadores (sponsors). It includes public content (news, events, static informational pages) and an admin-managed CMS layer, user profiles with role-specific extended information, and basic account/role management.

## Repository Structure

**Type:** Monolith (single deployable unit). Frontend (`app/`) and backend (`server/`) are two halves of the same Nuxt application, not separate services.

## Tech Stack Summary

Nuxt 4 / Vue 3 / TypeScript · Pinia · Tailwind CSS 4 · Nitro server routes · Prisma + PostgreSQL · AuthJS (credentials + JWT) · pnpm

Full detail: [`architecture.md`](./architecture.md)

## Architecture Type

Layered monolith by Nuxt convention (pages → components/stores → API handlers → Prisma → Postgres). No service layer between API and ORM. No multi-part/microservice split.

## Existing Documentation (pre-dating this scan)

This repo already had substantial hand-written docs before this automated scan ran:

- [`techfront.md`](../techfront.md) — frontend architecture (Spanish)
- [`techbackend.md`](../techbackend.md) — backend architecture (Spanish)
- [`db.md`](../db.md) — database schema narrative (Spanish)
- [`advice_copilot.md`](../advice_copilot.md) — brownfield-vs-greenfield viability assessment

This scan's outputs (`architecture.md`, `data-models.md`, `api-contracts.md`, etc.) verify and supersede the *structural* claims in those documents against the actual current code, and add gap analysis (risks, inconsistencies) not present in the originals. The originals remain useful for their narrative "why" explanations and are cross-linked rather than duplicated.

## Links to Detailed Docs

See [`index.md`](./index.md) for the full navigable index.

## Getting Started

```bash
cp .env.example .env   # fill in AUTH_SECRET, AUTH_ORIGIN, DATABASE_URL
pnpm install
pnpm dev                # runs prisma migrate dev + generate, then starts Nuxt on :3000
```

Full detail: [`development-guide.md`](./development-guide.md)
