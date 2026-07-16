# Data Models — Elite Hub

_Generated: 2026-07-16 | Source: `prisma/schema.prisma` (read in full) | DB: PostgreSQL via Prisma ORM_

> A prior, more narrative version of this content exists in [`../db.md`](../db.md) (Spanish, written before this scan). This document is the structural/current-state companion — cross-check both if extending the schema.

## Models (13 total + 1 enum)

### Usuario
Core account/identity table.
- `id` PK · `correo` **unique** · `nombre`, `apellido` · `avatar` (nullable) · `password` (bcrypt hash) · `isAdmin` (bool, default false) · `activo` (bool, default true — gates login)
- FKs: `rolId → Rol` (SetNull/Cascade), `informacionId → Informacion` (Restrict/Cascade)
- Reverse relations: `pqrs[]`, `UsuarioDeporte[]`, `noticias[]`, `eventos[]` (as autor)

### Rol / Permiso / PermisoRol
RBAC scaffold. `Rol` has many `Usuario` and many `Permiso` via join table `PermisoRol` (`@@unique([rolId, permisoId])`).
**Note:** `Usuario.isAdmin` is a separate boolean flag checked directly by API endpoints — the `Rol`/`Permiso` system exists in the schema but the scanned `server/api/**` code does not reference it for authorization decisions today.

### Informacion
Extended profile data, one-to-many from `Usuario` (a `Usuario` points at one `Informacion` row via `informacionId`).
- Fields: `bio, telefono, genero, fechaNacimiento, profesion, especialidad, experiencia, nombreComercial, razonSocial, nit, sitioWeb, presupuestoMaximo, anosFuncionamiento, consultorios (String[])`
- FK: `tipoUsuarioId → TipoUsuario`
- Reverse: `direcciones[]`, `redesSociales[]`

### TipoUsuario
Lookup table (`tipo` unique) — categorizes users (e.g. deportista, marca, nutricionista, patrocinador — inferred from page names in `app/pages/`).

### Direccion / Pais / Ciudad / Barrio
Geographic hierarchy: `Pais` → `Ciudad` → `Barrio`, with `Direccion` referencing all three plus `Informacion`. `Barrio` unique on `(barrio, ciudadId)`.

### RedSocial
Social media links belonging to `Informacion` (`nombre`, `url`).

### PQRS / TipoPQRS
Support/complaints ticketing. `PQRS` has `imagenEvidencia (String[])`, belongs to `Usuario` and `TipoPQRS`.

### Deporte / UsuarioDeporte
Sports catalog + join table. `UsuarioDeporte` carries `experiencia (Int)`, `nivel (Nivel enum)`, `frecuenciaSemanal (Int)`; unique on `(usuarioId, deporteId)`.

**Enum `Nivel`:** `PRINCIPIANTE | INTERMEDIO | AVANZADO | PROFESIONAL`

### Content
Lightweight CMS row: `page` (unique key), `title`, `subtitle`, `content` (HTML/Markdown), `metadata (Json)`. Powers the editable static pages via `/api/content/:page`.

### Noticia / Evento
Near-identical news/events models: `titulo`, `slug` (unique), `resumen`, `contenido`, `imagen`, `autorId → Usuario` (nullable, SetNull), `publicado` (bool, default true), timestamps. `Evento` additionally has `fechaEvento` and `ubicacion`; `Noticia` additionally has `publishedAt`.

## Entity Relationship Summary

```
Usuario ──< Noticia (autorId)
Usuario ──< Evento (autorId)
Usuario ──< PQRS (usuarioId)
Usuario >──< Deporte   (via UsuarioDeporte)
Usuario >── Rol
Usuario >── Informacion
Informacion ──< Direccion
Direccion >── Ciudad >── Pais
Direccion >── Barrio >── Ciudad
Rol ──< PermisoRol >── Permiso
Informacion >── TipoUsuario
Informacion ──< RedSocial
```

## Constraints & Indexes

- `@unique`: `Usuario.correo`, `Noticia.slug`, `Evento.slug`, `TipoUsuario.tipo`, `Deporte.nombre`
- `@@unique`: `PermisoRol(rolId, permisoId)`, `Barrio(barrio, ciudadId)`, `UsuarioDeporte(usuarioId, deporteId)`
- All models carry `createdAt`/`updatedAt` audit timestamps (`@default(now())` / `@updatedAt`)

## Migration workflow

```bash
# after editing prisma/schema.prisma
npx prisma migrate dev --name <change-description>
npx prisma generate
npx prisma studio   # local inspection
```

Note: `pnpm dev` already runs `prisma migrate dev && prisma generate` automatically before starting Nuxt (see `package.json` scripts) — schema changes are picked up on every dev server start.

## Practical notes carried over from `db.md`

- Prefer Prisma `select`/`include` to avoid over-fetching in public-facing endpoints (already the pattern in `admin/users.get.ts`, `eventos/index.get.ts`, `noticias/index.get.ts`).
- Use `prisma.$transaction` for compound writes (e.g. create + file upload) — not currently used anywhere in `server/api/**`; each multipart endpoint writes the file to storage *before* the DB write with no rollback path if the DB write fails.
