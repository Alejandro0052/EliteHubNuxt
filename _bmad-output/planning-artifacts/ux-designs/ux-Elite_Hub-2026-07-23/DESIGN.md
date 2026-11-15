---
name: Elite Hub
description: Brand-chrome visual system (black / white / green-700) for a four-sided sports community app — ratified from the existing header/footer/homepage/auth surfaces and extended sitewide, replacing the pastel per-category gradient language.
status: final
sources:
  - ../../../specs/spec-Elite_Hub/SPEC.md
  - ../../../specs/spec-Elite_Hub/glossary.md
  - ../../../specs/spec-Elite_Hub/functional-requirements.md
  - ../../architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md
  - ../../prds/prd-Elite_Hub-2026-07-19/prd.md
updated: '2026-11-12'
colors:
  surface: '#ffffff'
  surface-container: '#f4f6f2'
  surface-container-high: '#f3f4f6'
  surface-inverse: '#000000'
  on-surface: '#111827'
  on-surface-variant: '#4b5563'
  on-surface-inverse: '#ffffff'
  border-hairline: '#e5e7eb'
  primary: '#15803d'
  primary-hover: 'rgb(21 128 61 / 0.8)'
  on-primary: '#ffffff'
  link: '#16a34a'
  secondary: '#1e293b'
  on-secondary: '#ffffff'
  destructive: '#dc2626'
  destructive-hover: '#b91c1c'
  on-destructive: '#ffffff'
  focus-ring: '#15803d'
  dorsal: '#facc15'
  on-dorsal: '#111827'
  surface-dark: '#0a0a0a'
  surface-container-dark: '#171717'
  surface-container-high-dark: '#262626'
  surface-inverse-dark: '#ffffff'
  on-surface-dark: '#f5f5f5'
  on-surface-variant-dark: '#a3a3a3'
  on-surface-inverse-dark: '#0a0a0a'
  border-hairline-dark: '#2e2e2e'
  primary-dark: '#22c55e'
  primary-hover-dark: 'rgb(34 197 94 / 0.85)'
  on-primary-dark: '#0a0a0a'
  link-dark: '#4ade80'
  secondary-dark: '#e2e8f0'
  on-secondary-dark: '#0a0a0a'
  destructive-dark: '#f87171'
  on-destructive-dark: '#0a0a0a'
typography:
  display-xl:
    fontFamily: Sofia Sans Extra Condensed
    fontSize: 8rem
    fontWeight: '800'
    lineHeight: '0.9'
  display:
    fontFamily: Sofia Sans
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: '1.2'
  headline:
    fontFamily: Sofia Sans
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: '1.3'
  title:
    fontFamily: Sofia Sans
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: '1.4'
  body:
    fontFamily: Sofia Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Sofia Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.5'
  caption:
    fontFamily: Sofia Sans
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.5rem
  lg: 0.75rem
  xl: 0.75rem
  full: 9999px
spacing:
  '1': 0.25rem
  '2': 0.5rem
  '3': 0.75rem
  '4': 1rem
  '6': 1.5rem
  '8': 2rem
  '12': 3rem
  page-shell: 120rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
components:
  card:
    rounded: '{rounded.xl}'
    shadow: shadow-lg
    overflow: hidden
    hover: hover:scale-105
    background: '{colors.surface}'
  card-ficha:
    rounded: '{rounded.DEFAULT}'
    border: '1px solid {colors.border-hairline}'
    overflow: hidden
    media: 'aspect 4/5, {colors.surface-inverse}'
    hover: '4px {colors.primary} rule above the text block'
    background: '{colors.surface}'
  button-primary:
    background: '{colors.primary}'
    backgroundHover: '{colors.primary-hover}'
    text: '{colors.on-primary}'
    rounded: '{rounded.DEFAULT}'
  button-secondary:
    background: transparent
    border: '1px solid {colors.on-surface}'
    text: '{colors.on-surface}'
    rounded: '{rounded.full}'
  button-destructive:
    background: '{colors.destructive}'
    backgroundHover: '{colors.destructive-hover}'
    text: '{colors.on-destructive}'
    rounded: '{rounded.DEFAULT}'
  header:
    background: '{colors.surface-inverse}'
    text: '{colors.on-surface-inverse}'
    pageShell: '{spacing.page-shell}'
  footer:
    background: '{colors.surface-inverse}'
    text: '{colors.on-surface-inverse}'
  icon-badge:
    background: '{colors.surface-inverse}'
    text: '{colors.on-surface-inverse}'
    hoverBackground: '{colors.surface}'
    hoverText: '{colors.surface-inverse}'
    rounded: '{rounded.full}'
---

## Brand & Style

Elite Hub is a functional, four-sided sports community tool, not a lifestyle brand — the visual posture is **confident utility**: high-contrast black-and-white "brand chrome" (header, footer, hero, auth) doing the framing work, a single saturated green as the one color that means "act here," and card-based content surfaces that stay quiet so athlete photos, brand logos, and feed content carry the visual interest. This is a **refresh, not a rebrand** (FR-33): every token below is ratified from what already ships in header.vue, footer.vue, index.vue, login.vue, and register.vue, then extended to the surfaces that currently diverge (the pastel `from-blue-50 to-green-50`-style per-category gradients on deportistas/marcas/nutricionistas/patrocinadores/eventos/noticias/admin). Those pastel surfaces retire; brand chrome becomes the only visual language.

## Colors

- **`surface-inverse`** (black) is the brand-chrome color — header, footer, and (per `[ASSUMPTION]`) the login/register hero panel. It signals "this is app structure," never body content. Never used as a card or content background.
- **`surface` / `surface-container` / `surface-container-high`** are the content canvas — page background, card background, and the subtly-elevated container tone used for filter bars and empty-state panels. This is the one color family that replaces every pastel gradient background sitewide.
- **`primary`** (green-700) is the one CTA/action color: primary buttons, active nav-link weight, focus affordances tied to a submit action. `primary-hover` is `green-700/80` opacity, matching the existing `hover:bg-green-700/80` idiom — do not introduce a separate hover hue.
- **`link`** (green-600) is reserved for inline text links inside body copy (distinct from `primary` so buttons and links stay visually distinguishable at a glance).
- **`secondary`** (slate-800) `[ASSUMPTION]` — a real, defined secondary neutral, replacing the dead `hover:bg-secondary` class found in `header.vue` (no such Tailwind token exists today; it currently no-ops). Used sparingly: secondary chip backgrounds, admin-surface accents. Not a second CTA color — `primary` remains the only "act here" signal.
- **`destructive`** (red-600) — admin/moderation actions only (retract review, delete another user's post, deactivate account). Never used for a user's own delete-my-content action, which uses `button-secondary` with a confirm step instead.
- **`dorsal`** (yellow-400, with `on-dorsal` ink text) — added 2026-11-12 with the "La planilla" direction. It is a status marker, not an action color: the athlete-level badge on directory fichas, and notices. Identical in both themes. It never appears on buttons or links, so `primary` remains the only "act here" signal.
- **`on-surface` / `on-surface-variant`** — body text and secondary/meta text on light surfaces. `on-surface-inverse` (white) is body text on the black brand-chrome surfaces.

**Dark mode** `[ASSUMPTION — designed from scratch, no prior dark usage existed]`: the system inverts around the same three-color logic rather than introducing a new palette. `surface-dark` (near-black, not pure black — reduces OLED smear and softens card-edge contrast) replaces white as the content canvas; `surface-inverse-dark` (white) replaces black as the brand-chrome color, so header/footer flip to a white bar with black text in dark mode — brand chrome stays the highest-contrast element in both themes — it just swaps polarity. `primary-dark` (green-500) is lightened one step from `primary`'s green-700 to hold WCAG AA contrast against the dark canvas. All dark tokens are separate kebab-case keys (`-dark` suffix) per the DESIGN.md spec's light/dark convention, applied via Tailwind's `dark:` variant driven by a `data-theme`/class toggle, not the OS media query alone (FR-31 requires an explicit user-facing toggle).

Avoid: introducing a further chromatic accent beyond `primary` and the narrowly scoped `dorsal` (only green ever means "primary action"); tinting card backgrounds by TipoUsuario or content category (this is exactly the pastel-gradient pattern being retired); pure `#000`/`#fff` in dark mode for anything except the intentional brand-chrome inversion.

## Typography

Two families from one superfamily, adopted 2026-11-12 with the "La planilla" direction (this overrides the July decision to stay on the system stack):

- **Sofia Sans Extra Condensed 800, uppercase** (`font-display`) — the lettering of a race bib or the name on the back of a jersey. Reserved for directory page titles (`display-xl`, scaling from 3.75rem on mobile to 8rem at `lg`) and names on fichas (1.75rem). Never used for body copy, labels, or buttons.
- **Sofia Sans 400 / 600 / 700** (`font-sans`) — everything else, sitewide.

Both load through `@nuxt/fonts` (`fonts.families` in `nuxt.config.ts`) and are exposed as `--font-display` / `--font-sans` in `main.css`.

The six existing roles are unchanged in size and weight and now render in Sofia Sans: `display` (page-level H1 outside the directories, empty-state headlines), `headline` (section headers), `title` (card titles, modal titles), `body` (default copy), `body-sm` (card meta, form helper text), `caption` (timestamps, counts, fine print). Labels are sentence case; uppercase belongs to the display face only.

## Layout & Spacing

`{spacing.page-shell}` (`max-w-[120rem]`) is ratified as the **single** sitewide content-shell width `[ASSUMPTION]`, replacing admin's narrower `max-w-7xl`/`max-w-5xl` — the brand-chrome convention already used on header/footer/index/login/register/profile extends to admin and every directory/catalog/feed surface, so the shell never visibly narrows when a user moves between a "brand" page and an "admin" or "directory" page.

Spacing follows stock Tailwind scale (`spacing.1`–`spacing.12`, 4px base unit) — no custom scale invented. `gutter-mobile` (16px) and `gutter-desktop` (24px) govern card-grid and section padding. Directory grids (fichas) run 2 columns on mobile, scaling to 3/4/5/6 at `md`/`lg`/`xl`/`2xl`. Other card grids are CSS grid, 1 column on mobile, scaling to 2/3/4 columns at `md`/`lg`/`xl` — the same responsive rhythm as the existing homepage feature-tile grid, extended to directory and catalog listings.

## Elevation & Depth

Depth is expressed almost entirely through `shadow-lg` on cards (see Shapes/Components) — flat, un-elevated surfaces are the default (page background, form panels, admin table rows), and `shadow-lg` is reserved for discrete, individually-interactive content units: directory cards, event/news cards, catalog item cards, publicación cards. Modals/dialogs sit above an overlay using a plain `shadow-xl` + solid background — no colored shadow tint. Elite Hub's shadow language is neutral gray throughout, matching what already ships.

## Shapes

`{rounded.xl}` is the canonical corner radius for cards, ratified from the `EventCard`/`NewsCard` idiom as the majority pattern `[ASSUMPTION — consolidation choice]`: `stats.vue`'s `rounded-2xl` no-shadow variant and the admin panel's `rounded-lg shadow-md` variant are retired in favor of this one shape+shadow pairing. `{rounded.full}` is reserved for pill buttons (`button-secondary`) and circular avatar/icon-badge treatments — never for cards. `{rounded.DEFAULT}` covers inputs, primary/destructive buttons, and small inline chips (sport-filter tags, catalog category tags).

## Components

- **Cards** — `{components.card}`: `rounded-xl shadow-lg overflow-hidden`, white (`{colors.surface}`) background, `hover:scale-105` transform (150–300ms) as the **one** canonical sitewide hover treatment for every card — directory cards, event/news cards, catalog cards, publicación cards, review cards `[ASSUMPTION — chosen over the invert-on-hover icon-badge motif to avoid two competing hover languages on one page; invert-on-hover is demoted to icon-badge-only use, see below]`. Image region top, `p-4` content region, meta row at the bottom.
- **Ficha (directory card)** — `{components.card-ficha}`, added 2026-11-12; replaces `{components.card}` for the four directories and the catalog. Catalog items use the same ficha with the product image, a white Producto/Servicio badge (`dorsal` stays reserved for athlete level), the brand name on the `primary` line, and the category below. A 4:5 media block on black holding the full-bleed photo or, when there is none, the initials in the display face; the athlete's level as a `dorsal` badge top-left; below, the name in the display face, one `primary`-colored line (sport or specialty), and icon detail lines in `on-surface-variant`. Hairline border, no shadow, `{rounded.DEFAULT}`. Hover and keyboard focus draw a 4px `primary` rule above the text block; the ficha does not scale. No per-TipoUsuario accent colors.
- **Directory header** — `DirectoryHeader.vue`: left-aligned `display-xl` title over a one-sentence subtitle (max 46ch), closed by a 2px `on-surface` rule. Shared by Deportistas, Marcas, Nutricionistas, Patrocinadores, and Catálogo.
- **Filter tabs** — `FilterChips` with `variant="tabs"`: text tabs with a 4px `primary` underline on the selected one, for filtering a listing by a single value (sport on Deportistas, category on Catálogo). The chip form below stays for multi-select inputs in forms.
- **Content cards (events, news)** — same shell as the ficha with a 16:10 media block; title in the display face, clamped to two lines. Event cards carry the date as a white block over the image (day in the display face, month and year below) and the location on the `primary` line. News cards put the date above the title.
- **Profile detail ("ficha técnica")** — `UsuarioDetailView.vue`: 4:5 photo or initials beside the name in the display face, sport or specialty on the `primary` line, bio as prose, then the remaining fields as hairline-separated label/value rows. Level shows as the `dorsal` badge on the photo.
- **Auth brand panel** — `AuthBrandPanel.vue`: the wordmark in the display face on `primary`, shared by login and register.
- **Hover motion** (2026-11-14, user requirement) — cards use `.card-lift`; `.button-primary`/`.button-secondary`/`.button-destructive` lift 2px with a small shadow and settle on press; header logo scales and nav links (display face, uppercase, since 2026-11-14) lift slightly. All of it is disabled under `prefers-reduced-motion`.
- **Section header** — display-face title closed by a 2px `on-surface` rule; used for page titles and for home sections. As of 2026-11-12 `{components.card}` (`rounded-xl shadow-lg hover:scale-105`) is no longer used on public surfaces; as of 2026-11-14 admin pages dropped it too.
- **Form sheet** (2026-11-14) — create/edit forms are one `.form-sheet` panel split into `.form-section` rows (display-face section title + hint on the left, `.form-grid` of `.form-field`s on the right at `lg`), closed by `.form-actions` (alerts left, Cancel + primary right, spinner while saving). Required fields get an automatic asterisk, the active field's label turns `primary`, images use `ImageDrop.vue` (dashed drop zone, previews, current images when editing), blocked states use the `dorsal` `.form-notice`. Long grids (profile) are split with `.form-group-title`.
- **Data table** (2026-11-14) — `.data-table` inside a hairline panel: header row closed by the 2px `on-surface` rule, hairline row separators, row tint on hover; below `md` long tables fall back to stacked panels. Used by the admin lists.
- **Long-form text** (2026-11-14) — `.rich-text`: 75ch measure, display-face `h2`, used by aboutUs/terms/privacity including admin-authored HTML.
- **Buttons** — three roles, consolidated from today's 4+ inconsistent variants (green-700, green-400/500 "Crear," blue-400/500/600 admin misc, black-outline pill) `[ASSUMPTION — reduction is a judgment call, not spec-dictated]`:
  - `button-primary`: solid `{colors.primary}`, white text, `{rounded.DEFAULT}`. Every "create/submit/save" action (Crear publicación, Guardar, Enviar, Registrarse).
  - `button-secondary`: transparent fill, `{colors.on-surface}` text and border, `{rounded.full}` pill — ratified from the existing "Ver/Leer" idiom. Every navigational/secondary action (Ver perfil, Ver catálogo completo, Cancelar).
  - `button-destructive`: solid `{colors.destructive}`, white text, `{rounded.DEFAULT}`. Admin-only moderation actions (retract reseña, delete another user's publicación/evento/noticia, deactivate account) — never a user's own-content delete, which reuses `button-secondary` behind a confirm step.
- **Icon badge** — the homepage feature-tile motif (`bg-black text-white` circle → `group-hover:bg-white group-hover:text-black` on hover) is retained exactly as-is, scoped to decorative icon badges only (homepage feature tiles, empty-state icons) — not extended to cards, so it doesn't compete with the card-lift hover.
- **Header/Footer** — `{components.header}`/`{components.footer}`: solid black in both themes (the July plan to flip them white in dark mode was never built and is dropped). Header: logo, nav links in semibold with a 4px `primary-dark` underline on the active section (active also on inner pages), outlined pill for "Iniciar sesión"; nothing scales on hover. Footer: the wordmark in the display face with the one-line description, legal/contact links to the right, copyright below a hairline.
- **Inputs** — one definition in `main.css` (2026-11-13): `.form-label` (semibold `on-surface`), `.form-control` (`{rounded.DEFAULT}`, gray-400 border, `surface` background; focus swaps the border to `primary` with a soft `primary` ring; dark uses `surface-container-high-dark`), `.form-file` (pill-outlined file button), and `.form-title` (display-face page title with the 2px rule). Used by every create/edit form, profile edit, settings, contact, reviews, and the publicación composer. Register keeps its own inputs because it sits on the fixed black panel.
- **Chips/Tags** — sport filters (FR-19), catalog categories (FR-39): `{colors.surface-container-high}` background, `{colors.on-surface}` text, `{rounded.DEFAULT}`; selected state inverts to `{colors.primary}` background with white text.
- **Nav link (header)** — white text on black, active route shown via `font-bold` (existing pattern, retained), no underline, no pill background.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Use `primary` (green-700) for exactly one CTA per view/card | Use green for anything decorative, or introduce a second accent hue |
| Use hairline-bordered `rounded-lg` panels with no shadow for every content card (fichas, events, news, publicaciones, stats); at rest. On hover/focus every card lifts (`.card-lift`: `-translate-y-1.5` + `shadow-xl`, 300ms, off under reduced motion) and linked cards also draw a `primary` rule; buttons lift 2px (`.button-*`). The user asked on 2026-11-14 that this hover motion never be removed | Mix in `rounded-2xl` or `rounded-lg shadow-md` card variants left over from admin/stats |
| Keep brand chrome (header/footer/hero) solid black with white text/logo | Tint brand chrome per page or per TipoUsuario |
| Use `button-secondary`'s black-outline pill for navigational/secondary actions | Invent a fourth button color for a one-off admin action |
| Apply the pastel-gradient retirement everywhere FR-33 names (directories, eventos/noticias, admin, login/register) | Leave any `from-*-50 to-*-50` gradient background on a touched surface |
| Ship both light and dark token sets together, driven by one explicit toggle | Rely on OS `prefers-color-scheme` alone as the only theme switch (FR-31 requires an explicit Settings toggle) |
