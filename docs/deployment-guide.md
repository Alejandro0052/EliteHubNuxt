# Deployment Guide — Elite Hub

_Generated: 2026-07-16_

## Current State: No deployment configuration exists

This scan searched for the following and found **none** present in the repository:

- No `Dockerfile` or `docker-compose*.yml`
- No `.github/workflows/**`, `.gitlab-ci.yml`, or any other CI/CD pipeline definition
- No Infrastructure-as-Code (`terraform/`, `k8s/`, `pulumi.yaml`, etc.)
- No platform-specific deploy config (e.g. `vercel.json`, `netlify.toml`)

The project has a GitHub remote (`github.com/Alejandro0052/EliteHubNuxt`) but no automated pipeline is wired to it yet.

## What deployment would require (based on the stack)

Since this is a standard Nuxt 4 app with a Postgres database via Prisma, deployment needs:

1. **Runtime:** Node.js 18+ host (Nitro output is a standard Node server via `nuxt build` → `.output/`)
2. **Environment variables:** `AUTH_SECRET`, `AUTH_ORIGIN` (set to the real production origin), `DATABASE_URL` (production Postgres connection string)
3. **Migrations:** `npx prisma migrate deploy` (not `migrate dev`) should run against production before/during deploy — the current `pnpm dev` script's `migrate dev` behavior is dev-only and should **not** run in production
4. **Persistent file storage:** `server/public/` (Nitro `useStorage('public')`, fs driver) is written to at runtime for avatar/evento/noticia image uploads. On most PaaS platforms (Vercel, most container platforms with ephemeral filesystems) **this storage will not persist across deploys or scale-out** — this is the single biggest deployment risk in the current design and should be resolved (e.g. move to S3/R2/Cloudinary-backed storage) before shipping to a real host with ephemeral disks.

## Recommended Next Steps

1. Decide on a target host (Node server host, container platform, or serverless) — Nitro supports multiple deployment presets (see Nuxt's deployment docs) but the choice affects the file-storage decision above.
2. Replace the local fs storage driver with a cloud object storage driver before going to production.
3. Add a CI pipeline (lint/typecheck at minimum, given there are no automated tests yet — see `development-guide.md`).
4. Add `prisma migrate deploy` as an explicit release step, separate from the dev-only `pnpm dev` migration behavior.

_(To be generated)_ — a concrete deployment guide can only be written once a target platform is chosen; this document will need a rewrite at that point.
