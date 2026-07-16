# Source Tree Analysis — Elite Hub

_Generated: 2026-07-16 | Scan level: Deep | Repository type: Monolith_

## Annotated Directory Tree

```
Elite_Hub_NuxtJs/
├── app/                          # Nuxt 4 frontend (Vue 3, client + SSR)
│   ├── app.vue                   # Root component — NuxtLayout + NuxtPage mount point
│   ├── assets/                   # Global CSS (Tailwind entry: assets/css/main.css)
│   ├── components/               # Reusable UI components (flat, + layout/ subfolder)
│   │   ├── layout/
│   │   │   ├── header.vue        # Site nav bar, auth-aware (login/user dropdown)
│   │   │   └── footer.vue        # Site footer, static links
│   │   ├── ContentEditor.vue     # Admin-only inline CMS editor modal
│   │   ├── EventCard.vue         # Evento summary card (used in eventos listing)
│   │   ├── NewsCard.vue          # Noticia summary card (used in noticias listing)
│   │   ├── stats.vue             # Animated counter stat tile (CountUp)
│   │   └── userDropdown.vue      # Authenticated user menu (profile/settings/logout)
│   ├── composables/
│   │   └── useContent.ts         # CMS content fetch/update wrapper → /api/content/[page]
│   ├── layouts/
│   │   └── default.vue           # Header + slot + footer wrapper
│   ├── pages/                    # File-based routing — ENTRY POINTS for all routes
│   │   ├── index.vue             # Home page
│   │   ├── login.vue / register.vue
│   │   ├── profile.vue / settings.vue
│   │   ├── aboutUs.vue / contactUs.vue / privacity.vue / terms.vue  # Static CMS pages
│   │   ├── deportistas.vue / marcas.vue / nutricionistas.vue / patrocinadores.vue  # Static CMS pages
│   │   ├── eventos/
│   │   │   ├── index.vue         # Eventos listing → GET /api/eventos
│   │   │   └── [id].vue          # Evento detail → GET /api/eventos/:id
│   │   ├── noticias/
│   │   │   ├── index.vue         # Noticias listing → GET /api/noticias
│   │   │   └── [id].vue          # Noticia detail → GET /api/noticias/:id
│   │   └── admin/                # Admin-only pages (session.user.isAdmin gated)
│   │       ├── eventos/create.vue
│   │       ├── noticias/create.vue
│   │       └── users/
│   │           ├── index.vue     # User management list
│   │           └── create.vue
│   └── stores/
│       └── auth.ts               # Pinia auth store — session, login/register/logout, profile hydration
├── server/                       # Nitro backend (Nuxt server engine) — INTEGRATION POINT: app/ calls these via $fetch
│   ├── api/                      # REST endpoints, file-based routing (method suffix convention)
│   │   ├── auth/
│   │   │   ├── [...].ts          # NuxtAuthHandler catch-all — AuthJS credentials provider (ENTRY POINT for auth)
│   │   │   └── register.post.ts  # User self-registration
│   │   ├── admin/
│   │   │   ├── users.get.ts / users.post.ts    # Admin user list/create
│   │   │   └── users/[id]/activo.put.ts        # Toggle user active status
│   │   ├── content/
│   │   │   └── [page].get.ts / [page].put.ts   # Lightweight CMS (Content model)
│   │   ├── eventos/               # Evento CRUD (get/post/put/delete)
│   │   ├── noticias/              # Noticia CRUD (get/post/put/delete)
│   │   ├── profile/
│   │   │   ├── index.get.ts / index.put.ts     # Own profile read/update
│   │   │   └── avatar.post.ts                  # Avatar upload
│   │   ├── tipousuario/index.get.ts             # User type catalog lookup
│   │   └── test/index.get.ts                    # Storage smoke-test endpoint (dev artifact)
│   ├── utils/
│   │   └── prisma.ts             # Shared PrismaClient singleton (auto-imported as `prisma`)
│   ├── public/                   # Nitro fs-driver storage root — uploaded avatars/images (runtime-written, not static assets)
│   └── tsconfig.json
├── prisma/
│   ├── schema.prisma             # Full data model (13 models, 1 enum) — see data-models.md
│   ├── migrations/                # Prisma migration history
│   └── seed.ts                   # DB seed script (`pnpm seed`)
├── public/                       # Nuxt static assets (served as-is, e.g. favicon, robots.txt)
├── types/
│   └── next-auth.d.ts            # AuthJS session/JWT type augmentation
├── nuxt.config.ts                # Nuxt config — modules, Nitro storage, @sidebase/nuxt-auth config
├── tsconfig.json
├── package.json                  # Scripts + dependencies
├── pnpm-workspace.yaml           # onlyBuiltDependencies only — NOT a real monorepo
├── .env.example                  # AUTH_SECRET, AUTH_ORIGIN, DATABASE_URL
├── techfront.md / techbackend.md / db.md   # Existing hand-written architecture notes (pre-dates this scan)
└── advice_copilot.md             # Prior brownfield-viability assessment (not architecture doc)
```

## Critical Folders Explained

| Folder | Purpose | Notes |
|---|---|---|
| `app/pages/` | File-based routing entry points | Route path mirrors folder structure; `[id].vue` = dynamic segment |
| `app/stores/` | Client state (Pinia) | Only one store today: `auth.ts` |
| `server/api/` | All backend logic | Convention: `index.get.ts`/`.post.ts`, `[id].get.ts`/`.put.ts`/`.delete.ts` |
| `server/utils/` | Auto-imported server helpers | `prisma` client is globally available in `server/api/**` without explicit import |
| `prisma/` | Database schema + migrations | Single source of truth for the relational model |
| `server/public/` | Runtime file storage (Nitro `useStorage('public')`) | Distinct from top-level `public/` — this one is where uploaded avatars/images/evento/noticia images land |

## Entry Points

- **Frontend app shell:** `app/app.vue` → `app/layouts/default.vue` → page components
- **Auth:** `server/api/auth/[...].ts` (NuxtAuthHandler, AuthJS credentials provider)
- **Frontend session bootstrap:** `app/stores/auth.ts` (`checkAuth()` runs `onMounted`)
- **Dev/build:** `nuxt.config.ts`

## Integration Points (single-part app, internal only)

- `app/` → `server/api/**` via `$fetch` (see `app/composables/useContent.ts`, `app/stores/auth.ts` for patterns)
- `server/api/**` → `prisma/schema.prisma` models via the shared `prisma` client (`server/utils/prisma.ts`)
- `server/api/**` → `server/public/` file storage via Nitro's `useStorage('public')` (avatars, evento/noticia images)

No multi-part integration architecture is needed — this is a single Nuxt monolith where frontend and backend are two conventions of the same framework, not separately deployable services.
