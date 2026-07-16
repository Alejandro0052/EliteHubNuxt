# API Contracts — Elite Hub

_Generated: 2026-07-16 | Source: `server/api/**` (22 endpoint files, read in full)_

All endpoints are Nitro (Nuxt server engine) file-based routes under `server/api/`. Auth uses AuthJS session cookies via `getServerSession(event)` from `#auth`; there is no separate token/header-based API auth.

## Conventions

- `index.get.ts` / `index.post.ts` → collection endpoints
- `[id].get.ts` / `[id].put.ts` / `[id].delete.ts` → resource endpoints
- Admin-only endpoints check `session.user.isAdmin`; unauthenticated → 401, authenticated-but-not-admin → 403
- Errors thrown via `createError({ statusCode, message | statusMessage })`
- Image-accepting endpoints use `readMultipartFormData` and write to `useStorage('public')` (Nitro fs driver → `server/public/`)

## Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| ALL | `/api/auth/*` | — | AuthJS handler (`NuxtAuthHandler`). Credentials provider: email+password against `Usuario.correo`/`password` (bcrypt compare). JWT session strategy; `isAdmin` embedded in token/session. |
| POST | `/api/auth/register` | Public | Body: `{nombre, apellido, correo, password}`. Hashes password (bcrypt, cost 12). Rejects duplicate `correo`. |

## Admin — User Management

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/users` | Admin | List all users (id, nombre, apellido, correo, activo, isAdmin, timestamps) |
| POST | `/api/admin/users` | Admin | Create user. Body: `{nombre, apellido, correo, password, isAdmin?, activo?}` |
| PUT | `/api/admin/users/:id/activo` | Admin | Toggle active status. Body: `{activo: boolean}` |

## Content (lightweight CMS)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/content/:page` | Public | Fetch `Content` row by `page` key; returns empty-shell default if not found |
| PUT | `/api/content/:page` | Admin | Upsert `Content` row. Body: `{title, subtitle, content, metadata}` |

Used by `app/composables/useContent.ts` + `ContentEditor.vue` to power inline-editable static pages (aboutUs, terms, privacity, etc.)

## Eventos

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/eventos` | Public | List published (`publicado: true`) events, ordered by `fechaEvento` desc, max 20 |
| POST | `/api/eventos` | Admin | Create event. `multipart/form-data`: `titulo, resumen, contenido, fechaEvento, ubicacion, imageFile?`. Auto-slugifies `titulo` |
| GET | `/api/eventos/:id` | Public | Fetch single event by id |
| PUT | `/api/eventos/:id` | Admin | Update event. Same multipart fields as create + `publicado` |
| DELETE | `/api/eventos/:id` | Admin | Delete event |

## Noticias

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/noticias` | Public | List published news, ordered by `createdAt` desc, max 20 |
| POST | `/api/noticias` | Admin | Create news. `multipart/form-data`: `titulo, resumen, contenido, imageFile?`. Sets `publishedAt: now()`, auto-slugifies |
| GET | `/api/noticias/:id` | Public | Fetch single news item by id |
| PUT | `/api/noticias/:id` | Admin | Update news item |
| DELETE | `/api/noticias/:id` | Admin | Delete news item |

## Profile

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/profile` | Authenticated | Own profile incl. `informacion.tipoUsuario` and `rol` |
| PUT | `/api/profile` | Authenticated | Update own `nombre/apellido/correo/avatar` + upsert `Informacion` (accepts JSON **or** multipart) |
| POST | `/api/profile/avatar` | Authenticated | Upload avatar image (multipart); returns `{url}` |

## Reference data

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/tipousuario` | Public | List `TipoUsuario` catalog, ordered by `tipo` |

## Miscellaneous

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/test` | Public | Storage read/write smoke test — **dev artifact, candidate for removal before production** |

## Known inconsistencies (found during scan, not from existing docs)

- `content/[page].get.ts` and `content/[page].put.ts` instantiate their own `new PrismaClient()` instead of importing the shared `server/utils/prisma.ts` singleton used everywhere else — minor connection-pool inefficiency, not a functional bug.
- Two different upload-form field name conventions coexist for avatars: `profile/index.put.ts` expects `avatarFile`, `profile/avatar.post.ts` accepts either `avatar` or `avatarFile`.
- `/api/test` has no auth guard and writes to shared storage — safe to remove or gate behind a dev-only check.
