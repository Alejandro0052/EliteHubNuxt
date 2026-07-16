# Development Guide — Elite Hub

_Generated: 2026-07-16 | Source: `package.json`, `.env.example`, `.prettierrc`, `nuxt.config.ts`_

## Prerequisites

- Node.js 18+ (Nuxt 4 / Nitro requirement, per `techfront.md`)
- pnpm 10.13.1 (pinned via `packageManager` field in `package.json`) — repo uses `pnpm-lock.yaml`; a `package-lock.json` also exists but pnpm is the intended package manager
- PostgreSQL database reachable at the `DATABASE_URL` you configure

## Environment Setup

Copy `.env.example` → `.env` and fill in:

```
AUTH_SECRET=<random-secret>       # used by AuthJS/NuxtAuthHandler
AUTH_ORIGIN=http://localhost:3000
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

## Install

```bash
pnpm install
```

## Local Development

```bash
pnpm dev
```

This runs `prisma migrate dev && prisma generate && nuxt dev` — **every `dev` start applies pending Prisma migrations and regenerates the client** before booting Nuxt. Server runs at `http://localhost:3000`.

> Note (also flagged in `advice_copilot.md`): running migrations on every `dev` start can be surprising in a team setting — consider splitting `prisma migrate dev` out to a manual step if this becomes friction.

## Other Scripts (from `package.json`)

| Script | Command | Purpose |
|---|---|---|
| `pnpm build` | `nuxt build` | Production build |
| `pnpm generate` | `nuxt generate` | Static site generation |
| `pnpm preview` | `nuxt preview` | Preview production build locally |
| `pnpm seed` | `ts-node prisma/seed.ts` | Seed the database |
| (auto) `postinstall` | `nuxt prepare` | Regenerates `.nuxt` types after install |

## Database Workflow

```bash
npx prisma studio                        # inspect data locally
npx prisma migrate dev --name <change>   # after editing schema.prisma
```

See `data-models.md` for the full schema.

## Code Style

- Formatting enforced via Prettier (`.prettierrc`): tabs (width 2 equivalent), double quotes off (`singleQuote: false`... actually `singleQuote: false` means double quotes), semicolons on, print width 100, `prettier-plugin-tailwindcss` for class sorting.
- No ESLint config found in the repo — Prettier is the only enforced style tool.
- No unit/component test runner or test files were found (`*.test.ts`, `*.spec.ts` patterns: zero matches inside `app/`/`server/`). Unit-level testing of the app code itself is not set up.

## Testing

There is no unit/component test suite for `app/`/`server/`, but there **is** an E2E browser test suite at `e2e/test/` (Python + pytest + Playwright) covering login and UI navigation flows for the athletes/brands/nutritionists/sponsors pages. It is **untracked by git** (not committed) — see [`e2e-testing.md`](./e2e-testing.md) for the full picture.

```bash
cd e2e/test
pip install -r requirements.txt
# with pnpm dev running from the project root on localhost:3000:
../venv/Scripts/python.exe -m pytest ui/ -v
```

## Common Development Tasks

- **Add a page:** create a `.vue` file under `app/pages/` (routing is automatic).
- **Add an API endpoint:** create a file under `server/api/` following the `resource/action.method.ts` convention (see `api-contracts.md`).
- **Add a DB model:** edit `prisma/schema.prisma`, then `npx prisma migrate dev --name ...`.
- **Add reusable UI:** place in `app/components/` (root for global-ish pieces, `layout/` for header/footer-type shell components).
