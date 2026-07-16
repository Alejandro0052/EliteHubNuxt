# Documentación técnica - Frontend

Este documento describe la arquitectura y las tecnologías utilizadas en la parte frontend del proyecto EliteHub (carpeta `app/`), cómo está organizado y qué librerías/frameworks son necesarias para trabajar con él.

## Resumen rápido
- Framework principal: Nuxt 4 (Vue 3 + Nitro)
- Lenguaje: TypeScript (con soporte de Vue 3 `<script setup>`)
- Estilos: Tailwind CSS (utilizado ampliamente en clases utilitarias)
- Estado global: Pinia (store `app/stores`)
- Peticiones HTTP: `$fetch` (cliente integrado de Nuxt / OhMyFetch)

## Estructura principal (qué encontrarás en `app/`)
- `app/pages/` — Páginas del sitio. Cada archivo `.vue` corresponde a una ruta. Hay subcarpetas para páginas anidadas (por ejemplo `admin/`, `noticias/`, `eventos/`).
- `app/layouts/` — Layouts globales (por ejemplo `default.vue`) que envuelven las páginas.
- `app/components/` — Componentes reutilizables (cards, header, footer, `ContentEditor.vue`, `NewsCard.vue`, `EventCard.vue`, etc.).
- `app/composables/` — Composables (hooks reutilizables) para lógica compartida. Ej: `useContent.ts` para obtener/actualizar contenido estático.
- `app/stores/` — Stores de Pinia. El store de autenticación y perfil (`auth.ts`) vive aquí.
- `app/assets/` — CSS globales y otros assets procesados por el bundler.
- `public/` — Archivos estáticos servidos tal cual (imágenes públicas como `Jugador.jpeg`, `robots.txt`).

Nota: la lógica del servidor (endpoints REST, subida de archivos, manejo de sesiones) está en `server/api/` y se documentará en el siguiente archivo (backend).

## Principales tecnologías y por qué se usan

- Nuxt 4 (Vue 3)
  - Qué es: framework meta para Vue que facilita routing basado en archivos, renderizado server-side (SSR), generación de sitios estáticos, y bundling con Nitro.
  - Por qué: agiliza el desarrollo de aplicaciones universales y organiza el proyecto por páginas y rutas automáticamente.
  - Paquetes típicos: `nuxt` (revisar `package.json` para la versión exacta).

- Vue 3
  - Qué es: la librería de UI; utiliza composición y `<script setup>` para componentes modernos.
  - Por qué: rendimiento, reactividad y ecosistema amplio.

- TypeScript
  - Qué es: superset de JavaScript con tipado estático opcional.
  - Por qué: mejor mantenimiento, autocompletado y menos errores en tiempo de desarrollo.

- Pinia
  - Qué es: librería de manejo de estado recomendada para Vue 3 (reemplaza Vuex en muchos proyectos).
  - Uso en este proyecto: store `auth` para manejar sesión/usuario y otras stores si existen.
  - Paquetes típicos: `pinia`, y su integración con Nuxt (p.ej. `@pinia/nuxt`).

- Tailwind CSS
  - Qué es: framework de utilidades CSS (atomic classes) para componer estilos rápidamente.
  - Uso en este proyecto: estilos en todas las vistas (clases como `bg-gradient-to-br`, `text-gray-900`, etc.).
  - Paquetes típicos: `tailwindcss`, `postcss`, `autoprefixer`.

- Icon library
  - Qué es: librería para mostrar íconos (en el proyecto se usan componentes `<Icon name="...">`).
  - Nota: podría ser `unplugin-icons`/Iconify o similar; revisa `package.json` para el paquete exacto.

- `$fetch` / OhMyFetch
  - Qué es: cliente fetch mejorado incluido en Nitro/Nuxt para llamadas HTTP desde frontend.
  - Uso: llamadas a endpoints en `server/api/` (por ejemplo `/api/noticias`, `/api/eventos`, `/api/content/*`).

- Unstorage / almacenamiento público
  - Qué es: herramienta para manejar archivos públicos desde endpoints (se observan llamadas a storage en los endpoints de servidor).
  - Uso: subida/servicio de avatars y archivos multimedia (endpoints server manejan `storage.setItemRaw` u similares).

## Librerías/paquetes que necesitarás instalar (resumen)
Los nombres exactos y versiones están en `package.json`. Aquí una lista orientativa de paquetes que el frontend suele requerir:

- `nuxt` — Framework (Nuxt 4.x)
- `vue` — Biblioteca principal (Vue 3.x)
- `pinia` — Stores
- `@pinia/nuxt` — integración opcional con Nuxt
- `tailwindcss`, `postcss`, `autoprefixer` — estilos
- `@nuxt/image` o `unstorage` — según uso de imágenes (revisar `server/utils`)
- `typescript` — soporte TS
- `@iconify/vue` o `unplugin-icons` — iconos

Siempre revisa `package.json` para confirmar versiones y paquetes exactos.

## Comportamiento del frontend (puntos importantes)
- Rutas y páginas se basan en la carpeta `app/pages/` (routing automático). P.ej. `app/pages/noticias/index.vue` → `/noticias`.
- Componentes reutilizables (cards, dropdowns, `ContentEditor`) encapsulan UI y lógica de presentación.
- `useContent` es la capa para cargar contenido editable (CMS-like) de `server/api/content/[page]`.
- Autenticación: el frontend consume endpoints de sesión (`/api/profile`, `/api/auth/*`) y usa `auth` store para controlar acceso a vistas admin.

## Comandos útiles (ejecutar en la raíz del proyecto)
- Instalar dependencias:
```
pnpm install
```
o
```
npm install
```
- Ejecutar servidor de desarrollo:
```
pnpm dev
```
o
```
npm run dev
```
- Compilar para producción:
```
pnpm build
pnpm start
```

## Recomendaciones y notas prácticas
- Node.js: usar una versión LTS moderna (Node 18+ recomendado para Nuxt 4 / Nitro).
- Revisa `package.json` para confirmar versiones exactas de `nuxt`, `tailwindcss`, `pinia`, y la librería de íconos.
- Para crear nuevas páginas: agregar `.vue` en `app/pages/` con formato `<script setup>` y las clases Tailwind; Nuxt se encarga del routing.
- Para compartir el wrapper de diseño/estilos entre páginas admin puedes extraer un componente `AdminWrapper.vue` dentro de `components/`.

*** Fin del documento (frontend) ***
