# Diseño de Base de Datos y ORM (Prisma)

Este documento describe el diseño de la base de datos utilizado por el proyecto (según `prisma/schema.prisma`) y cómo se mapean los modelos con Prisma ORM. Incluye relaciones, claves y recomendaciones prácticas.

## Resumen
- ORM: Prisma (cliente generado a partir de `schema.prisma`).
- Base de datos objetivo: PostgreSQL (variable de entorno `DATABASE_URL`).
- Lugar del esquema: `prisma/schema.prisma`.

## Modelos principales

1) Usuario
- Tabla: `Usuario`
- Campos relevantes:
  - `id` (Int, PK, autoincrement)
  - `correo` (String, UNIQUE)
  - `nombre`, `apellido` (String)
  - `avatar` (String?, ruta/URL de avatar)
  - `password` (String)
  - `isAdmin` (Boolean, por defecto false)
  - `activo` (Boolean, por defecto true) — controla si el usuario puede iniciar sesión
  - `rolId` (Int?) — FK a `Rol`
  - `informacionId` (Int?) — FK a `Informacion`
  - Relaciones:
    - `rol` → `Rol` (many-to-one)
    - `informacion` → `Informacion` (many-to-one)
    - `pqrs` → `PQRS[]` (one-to-many)
    - `UsuarioDeporte[]` (many-to-many auxiliar)
    - `noticias[]`, `eventos[]` (un usuario puede ser autor)

2) Rol
- Campos: `id`, `nombre`.
- Relaciones: `usuarios` (Usuario[]), `permisos` (PermisoRol[]).

3) Permiso y PermisoRol
- `Permiso`: lista de permisos (id, nombre).
- `PermisoRol`: tabla pivote entre `Rol` y `Permiso` con UNIQUE(rolId, permisoId).

4) Informacion
- Datos personales extendidos, relaciona direcciones, redes sociales y tipo de usuario.
- Campos relevantes: `bio`, `telefono`, `genero`, `fechaNacimiento`, `profesion`, `especialidad`, `experiencia`, `nombreComercial`, `razonSocial`, `nit`, `sitioWeb`, `presupuestoMaximo`, `anosFuncionamiento`, `consultorios` (String[]), etc.
- Relaciones:
  - `tipoUsuario` → `TipoUsuario`
  - `direcciones` → `Direccion[]`
  - `redesSociales` → `RedSocial[]`
  - `usuarios` → `Usuario[]` (inversa)

5) TipoUsuario
- Tipos (id, tipo string único, descripcion) y relación con `Informacion`.

6) Direccion, Pais, Ciudad, Barrio
- `Direccion` guarda `direccion`, `ciudadId`, `paisId`, `barrioId`, `referencia` y referencia a `informacionId`.
- `Pais` → tiene `ciudades` y `direcciones`.
- `Ciudad` → pertenece a `Pais` y tiene `barrios`.
- `Barrio` → único por (barrio, ciudadId) (clave única).

7) RedSocial
- `nombre`, `url`, `informacionId`.

8) PQRS y TipoPQRS
- PQRS: mensajes/soporte con posibles `imagenEvidencia` (String[]) y relación `usuario`.

9) Deporte y UsuarioDeporte
- `Deporte` contiene `nombre` y `descripcion`.
- `UsuarioDeporte` es tabla intermedia con `usuarioId`, `deporteId`, `experiencia`, `nivel` (enum `Nivel`), `frecuenciaSemanal`.
- UNIQUE(usuarioId, deporteId) para evitar duplicados.

10) Content
- CMS ligero: `page` (String unique), `title`, `subtitle`, `content` (HTML o Markdown), `metadata` (Json).

11) Noticia y Evento
- Ambos comparten campos similares: `titulo`, `slug` (único), `resumen`, `contenido`, `imagen`, `autorId` (FK a Usuario), `publicado` (Boolean), timestamps (`createdAt`, `updatedAt`).

12) Enum `Nivel`
- Valores: `PRINCIPIANTE`, `INTERMEDIO`, `AVANZADO`, `PROFESIONAL`.

## Relaciones entre modelos (ER simplificado)
- Usuario (1) — (N) Noticia  [autorId]
- Usuario (1) — (N) Evento   [autorId]
- Usuario (1) — (N) PQRS     [usuarioId]
- Usuario (1) — (N) UsuarioDeporte (N) — (1) Deporte
- Usuario (N) — (1) Informacion
- Informacion (1) — (N) Direccion
- Direccion — Ciudad — Pais (jerarquía geográfica)
- Rol (1) — (N) Usuario
- Rol (1) — (N) PermisoRol (N) — (1) Permiso

## Índices y restricciones importantes
- Campos `correo` en `Usuario` y `slug` en `Noticia` / `Evento` son `@unique`.
- `PermisoRol` tiene `@@unique([rolId, permisoId])` para evitar duplicados.
- `Barrio` tiene `@@unique([barrio, ciudadId])`.

## Timestamps
- Muchos modelos usan `createdAt DateTime @default(now())` y `updatedAt DateTime @updatedAt` para auditoría automática.

## Flujo de migraciones con Prisma
1. Modificar `prisma/schema.prisma`.
2. Ejecutar:
```
npx prisma migrate dev --name describe_change
```
3. Revisar `prisma/migrations/` y confirmar la base.

## Buenas prácticas y recomendaciones para la BD
- Antes de desplegar cambios en producción, probar migraciones en una copia de la BD o en stage.
- Evitar traer objetos completos en respuestas públicas: usar `select` en Prisma para devolver solo campos necesarios.
- Usar transacciones de Prisma (`prisma.$transaction`) para operaciones compuestas que deben ser atómicas (p. ej. crear noticia + subir imagen).
- Considerar índices para campos usados en búsquedas (p. ej. `slug`, `createdAt`, `publicado`).

## Preguntas frecuentes / notas operativas
- ¿Cómo añadir un campo nullable y rellenarlo?  Añadir el campo en `schema.prisma` como nullable, correr `migrate dev`, luego ejecutar un script de migración para poblar los datos si es necesario, y finalmente, si quieres hacerlo obligatorio, actualizar a non-null y crear otra migración.
- ¿Cómo ver los datos localmente?  `npx prisma studio`.

*** Fin del documento (DB) ***
