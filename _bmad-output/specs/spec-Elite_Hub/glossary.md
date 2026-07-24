# Glossary — Elite Hub

Verbatim from PRD §3, preserved as the canonical domain-term reference for all downstream work.

- **Usuario** — A registered account. Has `correo`, `password`, `isAdmin` flag, and exactly one `TipoUsuario` once registration completes.
- **TipoUsuario (Tipo de Usuario)** — The account category, chosen at registration and immutable thereafter: **Deportista**, **Marca**, **Nutricionista**, or **Patrocinador**. Drives which fields, directory, and capabilities apply to a Usuario.
- **Deportista** — TipoUsuario for athletes. Associated with a **Deporte** (sport) from a fixed list, a **Nivel** (PRINCIPIANTE/INTERMEDIO/AVANZADO/PROFESIONAL), and athlete-specific fields (see functional-requirements.md CAP-1).
- **Marca** — TipoUsuario for brands. Only Marca accounts may create **Ítems de Catálogo**.
- **Nutricionista** — TipoUsuario for nutrition professionals. The only type that receives **Reseñas**.
- **Patrocinador** — TipoUsuario for individual sponsors/managers with resources to support other users.
- **Informacion** — The extended profile record attached to a Usuario, holding type-conditional fields (bio, contact details, professional/athletic details, etc.).
- **Deporte** — A fixed-list sport category (fútbol, baloncesto, ciclismo, running, crossfit, voleibol, gimnasia, boxeo, natación, otros) used both as a Deportista's chosen sport and as a directory filter.
- **Directorio** — The segmented, infinite-scroll listing view for a given TipoUsuario (one per type: Deportistas, Marcas, Nutricionistas, Patrocinadores).
- **Ítem de Catálogo** — A product or service listed by a Marca, with `nombre`, `tipo` (servicio | físico), and optional image(s). Shown in the Marca's own catalog section and in the aggregate Catálogo view.
- **Reseña** — A rating + comment left by an authenticated Usuario on a Nutricionista's profile.
- **Publicación** — A text (+ optional single image) post created by any Usuario, shown on the shared home feed. Distinct from Noticia and Evento (institutional/admin-originated content types).
- **Evento / Noticia** — Existing content types (event listings / news articles); creation is being opened from admin-only to all authenticated Usuarios in this MVP.
- **Content** — The existing lightweight CMS model backing editable static pages (terms, privacity, aboutUs, etc.), edited via the **ContentEditor** component.
- **Mensaje de Contacto** — A new record type persisting anonymous public contact-form submissions from `contactUs.vue` — event invitations, interest in a closer relationship with Elite Hub, promotion requests, etc., selected via the form's existing `Asunto` dropdown. Not a complaints/PQRS channel; unrelated in purpose to the existing `PQRS` model (which requires an authenticated Usuario and is out of scope for this MVP).
- **Reportes/Indicadores** — The admin-facing dashboard view showing a visual breakdown of registered Usuarios by TipoUsuario.
- **Admin** — A Usuario with `isAdmin = true`. Retains override edit/delete rights across profiles, content, eventos/noticias, and publicaciones for moderation purposes.
