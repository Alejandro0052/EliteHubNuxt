# Component Inventory — Elite Hub

_Generated: 2026-07-16 | Source: `app/components/**` (7 files, all read in full)_

## Layout Components (`app/components/layout/`)

| Component | Purpose | Notes |
|---|---|---|
| `header.vue` | Site navigation bar | Auth-aware: shows login link or `UserDropdown` + avatar/initials based on `useAuthStore()`. Mobile hamburger menu with its own open/close state. Nav links are hardcoded (`menuLinks` array) — not data-driven. |
| `footer.vue` | Site footer | Static links (aboutUs, privacity, terms, contactUs), no dynamic data. |

Both are auto-registered as `<LayoutHeader>` / `<LayoutFooter>` via Nuxt's folder-based component naming, consumed in `app/layouts/default.vue`.

## Display Components

| Component | Props | Purpose |
|---|---|---|
| `EventCard.vue` | `evento: any` | Summary card for an Evento (image, titulo, resumen, formatted date). Links to `/eventos/:id`. |
| `NewsCard.vue` | `news: any` | Summary card for a Noticia. Links to `/noticias/:id`. Nearly identical structure to `EventCard.vue` — a shared `ContentCard` base component would remove duplication if a third card type is added. |
| `stats.vue` | `startValue, endValue, text, icon` | Animated counter tile using `vue-countup-v3`. Used for homepage stats (member counts, etc.). |

## Form / Admin Components

| Component | Purpose | Notes |
|---|---|---|
| `ContentEditor.vue` | Modal editor for CMS `Content` rows | Only rendered when `useContent().isAdmin` is true. Emits `updated` on save. Calls `/api/content/:page` PUT directly. |

## Navigation / Interactive Components

| Component | Purpose | Notes |
|---|---|---|
| `userDropdown.vue` | Authenticated-user menu (profile/settings/logout) | Uses slots (`#trigger`, implicit default content), click-outside-to-close via manual `document.addEventListener`. |

## Design System Observations

- **No formal design system** — styling is inline Tailwind utility classes per component, no shared design tokens beyond Tailwind's defaults.
- **No shared base/primitive components** (no `Button.vue`, `Card.vue`, `Modal.vue`) — each component reimplements its own markup patterns. `EventCard`/`NewsCard` and the modal patterns in `ContentEditor.vue` are the clearest extraction candidates.
- **Icons:** `@nuxt/icon` (`<Icon name="fa6-solid:..." />`, Iconify-backed).
- **Prop typing is loose:** `EventCard`/`NewsCard` type their main prop as `any` rather than a shared `Noticia`/`Evento` interface — the API response shape and card prop shape aren't statically linked.

## Pages (not components, but the consuming layer — see `source-tree-analysis.md` for full list)

21 page files under `app/pages/`, including admin-only pages (`admin/**`, expected to check `authStore.user.isAdmin` client-side, mirroring the server-side check).
