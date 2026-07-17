# Addendum: Elite Hub MVP — Implementation Depth for PRD

This preserves detail volunteered during brief discovery that's too granular for the brief itself but should not be lost before the PRD phase.

## Per-Type Directory & Profile System

- Segmented listing view per type: deportista, marca, nutricionista, patrocinador.
- Card view shows the most relevant fields (nombre/apellido, or razón social for marcas) plus profile photo.
- Click a card → detail view with more fields. Click back → return to the listing.
- Listing uses infinite scroll (not pagination).
- Each user edits only their own profile. Admin can edit any record — a temporary stopgap specifically for forgotten-password recovery, until a real email-based recovery flow exists (post-MVP).

## Deportistas: Sport Filters

Fixed sport list for MVP: fútbol, baloncesto, ciclismo, running, crossfit, voleibol, gimnasia, boxeo, natación, otros.

- Filters behave as categories on the deportistas listing page.
- No filter selected = show all.
- Top of the view keeps a marketing-style "why use the app" section (reuse/improve the existing CTA pattern already on the page).

## Marcas: Product/Service Catalog

- Layout: top half = brand listing, bottom half = product/service catalog.
- No payments in MVP — contact-only, advertising-style listing.
- Categories (extensible): ropa deportiva, equipamiento, suplementos, tecnología, accesorios, etc.
- Product/service creation is restricted to users who registered as `marca` type from account creation — not retroactively grantable. This ties to a future monetization plan (charging per listing later); free for MVP.
- Bottom section keeps benefit/feature callouts (reuse+improve existing) plus a "ver catálogo completo sin filtros" option.

## Nutricionistas

- Same profile/photo/publicaciones pattern as the other types.
- Differentiator: ratings & comments (reviews) from users who used their services, shown alongside photo/name.
- `especialidad` field addable to their profile.
- MVP shows contact info only — no dynamic scheduling/agendas (explicitly deferred, not to be designed around yet).

## Publicaciones (Posts) Feature

- All 4 user types (deportista, marca, nutricionista, patrocinador) can create posts.
- Posts appear on the app's home feed.
- Not yet specified — needs definition in PRD: moderation, editing/deleting own posts, media/format support, relationship (if any) to the existing Noticia/Evento models.

## Eventos/Noticias Authorization Change

- Currently admin-only: `session.user.isAdmin` gates POST/PUT/DELETE in `server/api/eventos/**` and `server/api/noticias/**` (verified in code).
- MVP: open creation to all authenticated users.
- Not yet specified — needs definition in PRD: does edit/delete stay admin-only, or extend to the post's own author?

## Patrocinadores

- Defined as individual managers/sponsors with resources who contact and financially support lower-resource users.
- Same contact-info display pattern as the other types.

## Reportes / Indicadores

- New standalone view: visual/graphical breakdown of registered users by type (e.g., "of 100 users, 15 are patrocinadores").
- Must be visually polished ("muy agradable de ver").
- More metrics expected post-MVP — this is a first slice, not the final shape.
- Related and smaller: the homepage `<stats>` component (`app/pages/index.vue`) currently has **hardcoded** values (327+ deportistas, 125+ patrocinadores, 62+ marcas, 86+ nutricionistas, 51+ eventos, verified in code) and must be wired to the same real aggregate data.

## Registration Flow Overhaul (highest priority, user-flagged)

- Verified in code: `server/api/auth/register.post.ts` collects only `nombre/apellido/correo/password` today — no type. Type is currently only ever set later, via `/api/profile` PUT → `informacion.tipoUsuarioId`.
- Required fix: the registration form must capture user type (deportista/marca/nutricionista/patrocinador) inline, with type-specific fields shown conditionally (e.g., deportista → sport selection at signup).
- Type becomes **immutable** once set — no changing type after account creation.

## Profile View

- Shows the user's avatar.
- Fields shown are conditional on user type — exact field list deferred to PRD.

## Settings

- Existing content-policy editing (privacy/terms/about us) lives here.
- New: dark/light theme toggle.
- Must preserve the app's current responsiveness throughout all changes.

## Visual/UI Overhaul — Full List

- deportistas, marcas, nutricionistas, patrocinadores views ("muy sencilla" today)
- eventos, noticias listing ("muy básico" today)
- admin panel ("muy feo, un solo color pálido")
- login/register — including removing the `Jugador.jpeg` stock image asset
- Hover micro-interaction (lift/raise) on cards sitewide

## Confirmed Out of Scope (Post-MVP / Future)

- Email-based password recovery (admin manual override is the MVP stopgap)
- Payments for brand product/service listings
- Monthly subscription / monetization tied to user type — planned once the platform has traction
- Dynamic scheduling/agendas for nutritionists
- Possible app rebrand — user noted potential trademark/name conflicts found online, unrelated to MVP functionality, revisit later
