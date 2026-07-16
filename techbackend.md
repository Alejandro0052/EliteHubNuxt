# Documentación técnica - Backend

Este documento describe la arquitectura y las tecnologías utilizadas en la parte backend del proyecto EliteHub (carpeta `server/` y `prisma/`), la forma en que están organizados los endpoints, cómo se maneja la autenticación, subida de archivos y la base de datos con Prisma.

## Resumen rápido
- Runtime/Framework: Nuxt Nitro (endpoints en `server/api/`)
- ORM: Prisma (PostgreSQL en `prisma/schema.prisma`)
- Autenticación: sesiones (next-auth style) mediante `getServerSession` y cookies
- Almacenamiento de archivos: Unstorage / almacenamiento público (utilizado por endpoints de avatar y assets)

## Estructura principal (qué encontrarás en `server/` y `prisma/`)
- `server/api/` — Endpoints REST del servidor. Organizados por recursos: `admin/`, `auth/`, `profile/`, `noticias/`, `eventos/`, `content/`, etc. Cada archivo exporta un handler (por ejemplo `index.get.ts`, `index.post.ts`, `[id].put.ts`).
- `server/utils/` — utilidades compartidas (por ejemplo `prisma.ts` con el cliente Prisma, helpers de storage, etc.).
- `prisma/schema.prisma` — definición de modelos (Usuario, Rol, Informacion, Noticia, Evento, etc.).
- `prisma/migrations/` — migraciones generadas por Prisma.

## Principales responsabilidades del backend
- Endpoints CRUD para `noticias` y `eventos` (GET/POST/PUT/DELETE).
- Gestión de usuarios administrativa bajo `server/api/admin/users` (listado, creación, toggle `activo`).
- Endpoints de `profile` para obtener y actualizar perfil, incluyendo un endpoint de subida de avatar (`profile/avatar.post.ts`).
- Endpoints de `content` para un CMS ligero (`server/api/content/[page].get.ts` y `.put.ts`).
- Autorización: muchos endpoints verifican la sesión con `getServerSession(event)` y comprueban `session.user.isAdmin` para operaciones admin.

## Autenticación y sesiones
- El backend utiliza un handler de sesiones similar a `next-auth` provisto por la integración `#auth` (función `getServerSession(event)`).
- Patrón común:
  1. `const session = await getServerSession(event)`
  2. Comprobar `session?.user?.id` para validar autenticación.
  3. Para acciones admin comprobar `session.user.isAdmin`.
- Nota práctica: para evitar advertencias de TypeScript con la forma del objeto `session.user`, en algunos endpoints se hace `const sessionUser = (session?.user) as any` antes de leer `isAdmin`.

## Prisma (ORM) y diseño de BD
- Fichero: `prisma/schema.prisma` — contiene todos los modelos y relaciones principales (Usuario, Rol, Informacion, Noticia, Evento, etc.).
- Flujo típico de uso:
  - `npx prisma generate` — generar el cliente.
  - `npx prisma migrate dev --name <nombre>` — crear/aplicar migración de desarrollo.
  - `npx prisma studio` — inspeccionar la BD localmente.
- Conexión a la BD: variable de entorno `DATABASE_URL` (revisar `prisma/schema.prisma` o `prisma.config.ts` si se ha migrado a esa configuración).

## Subida y manejo de archivos
- Endpoints aceptan `multipart/form-data` cuando se sube una imagen (por ejemplo en `admin/noticias/create`, `profile/avatar.post.ts`).
- El backend guarda archivos en el almacenamiento configurado (unstorage/public). En endpoints se ve `storage.setItemRaw(...)` o se devuelve `url` al cliente.
- Recomendación: limpiar archivos viejos si se reemplaza un avatar para evitar acumulación (no implementado automáticamente en todos los endpoints).

## Convenciones de endpoints
- `index.get.ts` — listado o index.
- `index.post.ts` — creación.
- `[id].get.ts`, `[id].put.ts`, `[id].delete.ts` — operaciones sobre recursos específicos.
- `admin/*` — endpoints restringidos a administradores; siempre comprobar `session.user.isAdmin`.

## Manejo de errores y validaciones
- Se usan `createError({ statusCode, message })` para lanzar errores manejables por Nuxt/Nitro.
- Validaciones simples: comprobación de tipos y campos requeridos (`if (typeof activo !== 'boolean') throw createError(...)`).

## Variables de entorno importantes
- `DATABASE_URL` — cadena de conexión a la base de datos PostgreSQL.
- `UNSTORAGE_BASE` u otras variables relacionadas con el almacenamiento (según configuración).
- Variables para el proveedor de correo, keys de terceros, etc., según uso.

## Comandos útiles (en la raíz del proyecto)
- Generar Prisma Client:
```
npx prisma generate
```
- Ejecutar migraciones en desarrollo:
```
npx prisma migrate dev --name add-some-change
```
- Abrir Prisma Studio:
```
npx prisma studio
```
- Ejecutar servidor de desarrollo (Nitro + Nuxt):
```
pm run dev
# o
pnpm dev
```

## Buenas prácticas y recomendaciones
- Validar y sanitizar contenido HTML que viene del CMS antes de guardarlo o renderizarlo con `v-html` (evitar XSS si el contenido no es de confianza).
- No exponer información sensible en respuestas de endpoints; seleccionar solo campos necesarios con Prisma (`select` o `include`).
- Mantener `schema.prisma` y migraciones en sincronía; ejecutar `prisma migrate` cada vez que se cambia el modelo.
- Considerar limpieza de archivos antiguos en storage cuando se reemplaza un avatar o imagen.

## Posibles mejoras futuras (ideas)
- Centralizar la verificación de sesión/rol en un middleware para evitar repetición de `getServerSession` y casting a `any`.
- Añadir saneamiento HTML en el backend antes de persistir páginas de `content`.
- Extraer una capa de servicios para la lógica de negocio separada de los handlers (mejora testabilidad).

---

Cuando revises este archivo, dime si quieres que lo amplíe con ejemplos de endpoints concretos (copias cortas del `server/api/noticias/index.post.ts` o `server/api/profile/index.put.ts`) o que añada snippets de comandos para despliegue en producción (Docker, provider, variables de entorno). Tras tu aprobación procederé a generar el archivo de BD (`db.md`) con el diseño y relaciones del `schema.prisma`.

*** Fin del documento (backend) ***
