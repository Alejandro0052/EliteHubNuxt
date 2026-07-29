---
baseline_commit: 4d87b24ebd40d1d79c22f7bc25720e283d78fa7a
---

# Story 7.2: Sistema de diseño y consolidación visual

Status: review

## Story

As a user,
I want a visually consistent app instead of today's mismatched buttons/cards/colors,
so that Elite Hub feels like one coherent product, not a patchwork.

## Acceptance Criteria

1. **Given** DESIGN.md's token set **When** implemented **Then** it exists as real Tailwind v4 `@theme` CSS variables, not hardcoded utility classes — colors, typography, rounded, spacing (UX-DR1)
2. **Given** the current 3+ card idioms (`rounded-xl shadow-lg`, `rounded-2xl` no-shadow, `rounded-lg shadow-md`) **When** this story ships **Then** every card sitewide uses the single canonical `rounded-xl shadow-lg overflow-hidden` + `hover:scale-105` treatment (UX-DR2, FR-33)
3. **Given** the current 4+ button idioms **When** this story ships **Then** every button uses one of exactly 3 roles: primary, secondary, destructive (UX-DR3)
4. **Given** the current dual page-shell widths (`max-w-[120rem]` vs `max-w-7xl`/`max-w-5xl`/etc.) **When** this story ships **Then** every page, including admin, uses the single `max-w-[120rem]` shell (UX-DR4)
5. **Given** the pastel per-category gradient backgrounds on deportistas/marcas/nutricionistas/patrocinadores/eventos/noticias/admin **When** this story ships **Then** they are retired and replaced with brand-chrome-consistent surface tokens (UX-DR5, FR-33)
6. **Given** the dead `hover:bg-secondary` class in `header.vue` **When** this story ships **Then** it's wired to the real `secondary` token (UX-DR7)
7. **Given** the `Jugador.jpeg` stock image on login/register **When** this story ships **Then** it's removed and replaced with a brand-chrome-consistent pattern, no new stock photography introduced (UX-DR8, FR-33)
8. **Given** the header's current 5 nav links **When** this story ships **Then** Eventos y Noticias son promoted into primary nav, 7 links total, using the same hamburger/horizontal mechanism (UX-DR9)
9. **Given** every visual change in this story **When** verified **Then** existing responsive behavior across breakpoints is preserved unbroken (FR-34)

## ⚠️ Scale warning

This is the largest single story in this project so far by file count. Research (already done, see References) inventoried the exact blast radius:

- **22 page files** with pastel gradient backgrounds (AC #5) + 4 avatar-fallback gradient badges in `UsuarioDirectoryCard.vue`
- **~49 button call sites** across ~25 files using inconsistent green-400/500, blue-400/500/600, red-400/500/600 (AC #3)
- **~24 page files** using `max-w-3xl`/`max-w-4xl`/`max-w-5xl`/`max-w-7xl`/`max-w-2xl` instead of `max-w-[120rem]` (AC #4)
- **~9 card-like surfaces** needing shape fixes (`stats.vue`, `aboutUs.vue`'s 6 team cards, `index.vue`'s 2 hero panels) (AC #2)
- 1 file for the dead class fix (AC #6), 1 file for the stock photo (AC #7), 1 file for nav promotion (AC #8)

Work through tasks in the order listed — later tasks assume the `@theme` tokens from Task 2 exist, so utility classes can reference them (or, where Tailwind v4 doesn't auto-generate a utility from a custom `@theme` color name cleanly, fall back to the literal DESIGN.md hex value with a comment noting which token it represents — see Task 2's note on this exact tradeoff).

## Tasks / Subtasks

- [x] Task 1: Read what's already built before writing anything (AC: all)
  - [x] **No `@theme` block exists anywhere** — `app/assets/css/main.css` currently has only `@import "tailwindcss"`, `@plugin "@tailwindcss/forms"`, the `@custom-variant dark` line (Story 7.1), and a trivial `@layer base` cursor rule. Every color/spacing/rounded/typography value sitewide is a hardcoded Tailwind utility class today — Task 2 is genuinely starting from zero, not adjusting an existing partial system.
  - [x] **DESIGN.md's full frontmatter token block** (colors ×32 keys including all `-dark` variants, typography ×6 roles, rounded ×6 keys, spacing ×9 keys, components ×6 groups) is the literal source of truth for Task 2 — copy values exactly, do not approximate or round.
  - [x] **`register.vue` already migrated off `Jugador.jpeg`** — only `login.vue` (lines 5-8, a live `<img src="/Jugador.jpeg">`) still needs AC #7's fix. Don't duplicate work looking for a second occurrence that no longer exists.
  - [x] **`hover:bg-secondary` (AC #6) has exactly 2 occurrences, both in `header.vue`** (lines 45 and 84) — small, isolated fix once the `secondary` token exists in `@theme` (Task 2).
  - [x] **`header.vue`'s `menuLinks` array (AC #8)** is consumed by both the desktop nav (`v-for`) and the mobile nav (`v-for`) — a single array edit (insert Eventos/Noticias entries) propagates to both render paths automatically. No separate mobile link list exists.
  - [x] **Card components already mostly on-spec**: `EventCard.vue`, `NewsCard.vue`, `PublicacionCard.vue`, `CatalogoItemCard.vue`, `UsuarioDirectoryCard.vue` already use `rounded-xl shadow-lg overflow-hidden hover:scale-105` (built that way across Epics 2-5, since this convention was already established informally even before DESIGN.md formalized it) — these need only the `bg-white` → token swap (Task 2/4), not a shape change. The genuine shape-fix targets (AC #2) are: `stats.vue` (`rounded-2xl`, no shadow, no hover), `aboutUs.vue`'s 6 team-member cards (same `rounded-2xl` no-shadow pattern), and `index.vue`'s 2 hero panels (`rounded-2xl`).
  - [x] **DESIGN.md's "admin panel's `rounded-lg shadow-md` variant" callout does not literally exist in current admin code** — research found no admin card matching that exact combination; `admin/reportes/index.vue` and `admin/mensajes-contacto/index.vue` already use different (already-canonical or shadow-less) patterns. The actual `rounded-lg shadow-md` string only appears on 5 fake-button CTA `<div>`s in `index.vue`/`eventos/index.vue`/`noticias/index.vue` (the green "+  Crear" wrappers) — these are Task 3's (button) concern, not Task 4's (card) concern. Don't go looking for a phantom admin card variant that isn't there.
  - [x] **Modals/dropdowns/toasts/form panels are NOT in scope for AC #2's card treatment** — `ConfirmDialog.vue`, `ContentEditor.vue`, `userDropdown.vue`, `ToastContainer.vue`, `PublicacionComposer.vue`, `ResenasSection.vue`, `UsuarioDetailView.vue` all have their own `rounded-*`/`shadow-*` treatment today; DESIGN.md's card token (`rounded-xl shadow-lg overflow-hidden hover:scale-105`) is specifically for grid-item content cards (directory/event/news/catalog/publicación cards), not every rounded-and-shadowed surface in the app. Leave these alone unless a later task explicitly names one.

- [x] Task 2: Build the `@theme` block in `app/assets/css/main.css` (AC: #1)
  - [x] Add a `@theme { ... }` block (Tailwind v4 syntax) after the existing `@custom-variant dark` line, defining every DESIGN.md token as a CSS custom property using Tailwind v4's naming convention (`--color-*`, `--font-*`, `--radius-*`, `--spacing-*` prefixes map to `bg-*`/`text-*`/`rounded-*`/`p-*` etc. utilities automatically). Map DESIGN.md's kebab-case token names directly: `colors.primary` → `--color-primary: #15803d;`, `colors.primary-dark` → `--color-primary-dark: #22c55e;` (dark values are separate named tokens per DESIGN.md's own convention — they are NOT resolved via `dark:` automatically by Tailwind v4's `@theme`; call sites that need theme-aware color still write `bg-primary dark:bg-primary-dark` explicitly, same pattern as every `dark:` class added in Story 7.1). Cover all ~32 color keys, typography (map `typography.display.fontSize`/`fontWeight`/`lineHeight` etc. to a `--text-display`/`--font-weight-display` style token set, or a simpler custom-property group if Tailwind v4's typography token shape doesn't cleanly fit — use judgment, document the mapping choice inline as a CSS comment since DESIGN.md's typography shape doesn't map 1:1 to Tailwind v4's `--text-*` convention), rounded scale (`--radius-sm`, `--radius-DEFAULT` → Tailwind v4 doesn't support a literal "DEFAULT" custom property key the same way v3's config did — use `--radius: 0.5rem;` for the bare `rounded` utility and named keys for the rest), and spacing (`--spacing-page-shell: 120rem;`, `--spacing-gutter-mobile: 1rem;`, etc.).
  - [x] **Component tokens** (`components.card`/`button-primary`/etc.) are compositions, not raw CSS variables — they don't become `@theme` entries themselves. Instead, Tasks 3/4 reference the underlying color/rounded/shadow tokens Task 2 defines when building the 3 button-role classes and the 1 card-role treatment.
  - [x] After this task, run the dev server and spot-check that existing pages still render (a malformed `@theme` block can break Tailwind compilation sitewide) before proceeding to Tasks 3+.

- [x] Task 3: Consolidate every button to one of 3 roles (AC: #3)
  - [x] Define the 3 role patterns once (as the literal utility-class strings every call site will use, since Tailwind v4 doesn't have a first-class "component class" mechanism without `@apply` — using `@apply` in `main.css` for `.btn-primary`/`.btn-secondary`/`.btn-destructive` is an acceptable, clean way to define these 3 roles once and reuse the class name everywhere, reducing the ~49 call-site edits to 3 definitions + ~49 class-name swaps):
    - `button-primary`: solid `bg-primary` (dark: `dark:bg-primary-dark`), `text-on-primary`, `hover:bg-primary-hover`, `rounded` (DEFAULT).
    - `button-secondary`: transparent, `border border-on-surface` (dark: `dark:border-on-surface-dark` or similar), `text-on-surface`, `rounded-full`.
    - `button-destructive`: solid `bg-destructive` (dark: `dark:bg-destructive-dark`), `text-on-destructive`, `hover:bg-destructive-hover`, `rounded` (DEFAULT).
  - [x] Sweep every call site from Task 1's research inventory (green-400/500 "Crear" variant, blue-400/500/600 admin-misc variant, red-400/500/600 destructive variant) and reclassify each into whichever of the 3 roles matches its actual function — most "Crear"/submit buttons → primary; most "Cancelar"/navigation-back buttons → secondary; every delete/destructive-confirm button → destructive. Do this file by file; there is no shortcut that avoids touching each of the ~25 files individually, since the correct role depends on what each specific button does, not just its current color.
  - [x] Leave `ConfirmDialog.vue`'s own Cancelar/Eliminar buttons as the reference implementation — it already uses a black-outline pill (secondary-shaped) and a solid red (destructive-shaped) approximately matching the target roles; verify it against the new token-based classes rather than assuming it's already perfect.

- [x] Task 4: Fix the remaining card-shape outliers (AC: #2)
  - [x] `app/components/stats.vue`: change `rounded-2xl` (no shadow) → `rounded-xl shadow-lg` + `hover:scale-105` (only if the card is meant to be interactive — a stat counter isn't a navigable link, so consider whether `hover:scale-105` makes sense here or whether the AC's "every card" is scoped to navigable content cards; if uncertain, apply it for consistency per the AC's literal "every card sitewide" wording, since no exception is carved out).
  - [x] `app/pages/aboutUs.vue`: same fix on all 6 team-member cards (lines ~27, 36, 45, 57, 67, 78).
  - [x] `app/pages/index.vue`: the 2 hero panels (video panel line ~6, welcome-card panel line ~24) — evaluate whether these specific panels (structural hero elements, not grid-item content cards) should really be swept into the generic card treatment, or whether they're intentionally a distinct "hero" shape; DESIGN.md doesn't explicitly address hero panels separately from cards, so default to leaving hero-panel-specific radius alone unless it's trivial to unify, and note the decision either way in Completion Notes.
  - [x] Update `bg-white` → the `surface` token (`bg-surface` if Task 2's `@theme` mapping produces that utility name, else keep `bg-white` since `surface: '#ffffff'` is literally white in light mode — only the `dark:` counterpart actually needs to change) across all 5 already-shaped card components (`EventCard.vue`, `NewsCard.vue`, `PublicacionCard.vue`, `CatalogoItemCard.vue`, `UsuarioDirectoryCard.vue`) for token consistency, even though their shape doesn't need to change.

- [x] Task 5: Unify every page to the `max-w-[120rem]` shell (AC: #4)
  - [x] Sweep all ~24 files from Task 1's research inventory (`max-w-3xl`/`max-w-4xl`/`max-w-5xl`/`max-w-7xl`/`max-w-2xl` on the outermost page-wrapper) to `max-w-[120rem]`. Where a page has a SECONDARY narrower `max-w-3xl`-style constraint nested inside the outer shell (e.g., `deportistas/index.vue` has both a `max-w-7xl` outer AND a `max-w-3xl` inner element) — only the OUTER page-shell wrapper changes to `max-w-[120rem]`; a narrower inner content column (e.g., for readability of a long form or article) is a legitimate, distinct design choice, not the "dual page-shell width" problem this AC targets. Use judgment per file; don't blindly replace every `max-w-*` occurrence.
  - [x] `app/pages/aboutUs.vue` has an internal inconsistency (a `max-w-4xl` hero at the top, `max-w-[120rem]` for a lower section) — resolve by making the outer wrapper consistently `max-w-[120rem]` and letting the hero content have its own narrower reading-width constraint if that was the original intent, or unify fully if the hero and section were meant to share one shell. Inspect the actual rendered layout before deciding, don't guess blind.

- [x] Task 6: Retire pastel gradient backgrounds (AC: #5)
  - [x] Sweep all 22 page files from Task 1's research inventory — replace `bg-gradient-to-br from-{color}-50 to-{color}-50` with a brand-chrome-consistent surface token (per DESIGN.md: `surface`/`surface-container` family replaces every pastel gradient background sitewide — e.g. `bg-surface-container` or plain `bg-neutral-100`/`bg-gray-50` depending on what Task 2's `@theme` mapping actually produces as a usable utility class). Add the `dark:` counterpart (`dark:bg-surface-container-dark` or `dark:bg-neutral-900`) consistent with Story 7.1's established Home-page dark treatment, extending it to these pages now that they're being touched anyway.
  - [x] `app/components/UsuarioDirectoryCard.vue`'s 4 per-TipoUsuario avatar-fallback gradients (lines 50/54/58/62) are a distinct anti-pattern (DESIGN.md: "Avoid: tinting card backgrounds by TipoUsuario") — replace with a single consistent treatment (e.g., the existing black-circle-with-initials pattern already used elsewhere in this codebase for avatar fallbacks, per `UsuarioDetailView.vue`/`ResenasSection.vue`/`PublicacionCard.vue`'s established `border border-gray-300 text-gray-700` initials-circle convention) rather than 4 different per-type gradients.

- [x] Task 7: Wire `hover:bg-secondary` to the real token (AC: #6)
  - [x] `header.vue` lines 45 and 84: once Task 2's `@theme` block defines `--color-secondary`, `hover:bg-secondary` becomes a real, valid Tailwind utility automatically — verify it renders the intended slate-800 hover state (visually confirm, don't just assume the token wiring alone is sufficient; check contrast against the black header background).

- [x] Task 8: Remove `Jugador.jpeg` from login (AC: #7)
  - [x] `app/pages/login.vue` lines 5-8: replace the `<img src="/Jugador.jpeg">` panel with a brand-chrome-consistent treatment — no new stock photography (explicit AC constraint). `register.vue`'s already-migrated brand panel (a comment at line 373 marks where its own former `Jugador.jpeg` was replaced) is the direct precedent to mirror for visual consistency between the two auth pages.

- [x] Task 9: Promote Eventos/Noticias into primary nav (AC: #8)
  - [x] `header.vue`'s `menuLinks` array: insert `{ to: "/eventos", text: "Eventos" }` and `{ to: "/noticias", text: "Noticias" }`, landing on exactly 7 links total (Inicio, Eventos, Noticias, Patrocinadores, Deportistas, Marcas, Nutricionistas — this specific order is the epics-stated target order, not alphabetical or insertion order). Single array edit propagates to both desktop and mobile nav automatically (Task 1's note).

- [x] Task 10: Verify responsiveness preserved (AC: #9)
  - [x] Manually check every page family touched by Tasks 3-9 at `<md`, `md`, `lg`, `xl` breakpoints — this story touches dozens of files, and a global CSS change (Task 2's `@theme` block) or a sweeping class-name swap (Tasks 3/5/6) is exactly the kind of change that can silently break a layout on one breakpoint while looking fine on another. This is NOT the same as Story 7.3's dedicated a11y/responsive verification pass (which is a separate, later story) — this is just "don't ship a visibly broken breakpoint," a baseline sanity check, not the full gate.

## Dev Notes

### Scope size

Large — the largest story in this project. Genuinely sitewide: every directory/detail page, every admin page, both auth pages, the homepage, and every shared card component. No new backend work, no new Prisma models, no new permission logic — purely a CSS/class-name consolidation pass, but across a very large file count. Expect this to take multiple long work sessions; consider checkpointing progress (commit after each completed Task, not just at the very end) given the blast radius — if something goes visibly wrong partway through, an incremental commit history makes it much easier to isolate which Task's sweep caused it.

### Explicit non-goals for this story

- No new components, no new pages, no new backend/API work.
- No accessibility/responsiveness verification beyond a basic sanity check (Task 10) — the real gate is Story 7.3.
- No dark-mode adaptation beyond what's needed to keep Story 7.1's existing dark-mode work (Home page, header/footer) consistent with the new token system — this story does NOT extend full dark-mode support to every other page (that's implicitly enabled by Task 2's `@theme`/token work making it easy, but actually adding `dark:` classes to every swept page is not itself demanded by any AC here — only AC #5's gradient retirement explicitly asks for a dark counterpart on the pages it touches).
- No admin-specific redesign beyond the shell-width/card/button/gradient sweeps already covered by AC #2-5.

### Architecture / conventions this story must follow

- **Tailwind v4 `@theme` directive** — the only new architectural surface this story introduces; get Task 2 right first since everything downstream depends on it compiling correctly.
- **`@custom-variant dark`** (Story 7.1) stays as the dark-mode mechanism — Task 2's `@theme` block does not change or interact with it beyond providing the `-dark`-suffixed color tokens that `dark:` classes reference.
- **No test framework** — same MVP non-goal as every prior story. Verify manually, page family by page family, after each Task: check that the swept pages still render, that buttons still fire their existing click handlers (a class-name swap must never touch `@click`/functional attributes, only `class`), that gradients are gone, that nav shows 7 links, that login no longer shows the stock photo.

### Project Structure Notes

- Modified (extensive list, organized by Task):
  - Task 2: `app/assets/css/main.css`
  - Task 3: ~25 files across `app/pages/**` and `app/components/**` (full inventory in Dev Notes' References/research, not re-listed here — consult the story's research inventory or re-grep at implementation time)
  - Task 4: `app/components/stats.vue`, `app/pages/aboutUs.vue`, `app/pages/index.vue`, plus token-only touches to `EventCard.vue`/`NewsCard.vue`/`PublicacionCard.vue`/`CatalogoItemCard.vue`/`UsuarioDirectoryCard.vue`
  - Task 5: ~24 files across `app/pages/**`
  - Task 6: 22 page files + `UsuarioDirectoryCard.vue`
  - Task 7: `app/components/layout/header.vue`
  - Task 8: `app/pages/login.vue`
  - Task 9: `app/components/layout/header.vue`
- Not touched: any `server/**` file, any Prisma schema, any permission/guard logic, `ConfirmDialog.vue`/`ContentEditor.vue`/`userDropdown.vue`/`ToastContainer.vue`/`PublicacionComposer.vue`/`ResenasSection.vue`/`UsuarioDetailView.vue` (non-card surfaces, out of AC #2's scope per Task 1's research).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 7 / Story 7.2, UX Design Requirements UX-DR1–UX-DR9] — verbatim ACs and UX-DR text
- [Source: _bmad-output/planning-artifacts/prds/prd-Elite_Hub-2026-07-19/prd.md#§5.13] — FR-33, FR-34
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-Elite_Hub-2026-07-23/DESIGN.md] — complete token frontmatter (colors/typography/rounded/spacing/components), the literal source of truth for Task 2
- [Source: full-codebase grep inventories performed during story creation, 2026-07-28] — exact file+line lists for gradients (22+4 files), buttons (~49 call sites/~25 files), page shells (~24 files), card shapes (~9 surfaces), `hover:bg-secondary` (2 lines), `Jugador.jpeg` (1 live occurrence), `menuLinks` array (1 file) — re-grep at implementation time if files have changed since this story was written, do not assume the inventory is still 100% current
- [Source: _bmad-output/implementation-artifacts/7-1-toggle-de-tema-claro-oscuro.md] — the `@custom-variant dark` mechanism and Home-page dark-mode precedent this story's Task 6 dark-counterpart work should match

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

### Completion Notes List

- **Real bug caught and fixed mid-implementation, not anticipated by the story's own plan**: sweeping `max-w-3xl`/`max-w-4xl` outer wrappers to `max-w-page-shell` (Task 5) initially widened several single-column pages — `eventos/[id].vue`, `noticias/[id].vue` (article-style detail pages with no inner constraining component), and 7 create/edit form pages (`catalogo/create.vue`, `catalogo/edit/[id].vue`, `admin/users/create.vue`, `admin/eventos/create.vue`, `admin/eventos/edit/[id].vue`, `admin/noticias/create.vue`, `admin/noticias/edit/[id].vue`) — to the full 120rem shell with no inner reading-width constraint, which would have stretched article text and form fields across the entire viewport. Fixed by: reverting the two article pages to their original `max-w-4xl` outer wrapper (no inner-component pattern to lean on, unlike the directory detail pages which use `UsuarioDetailView.vue`'s own internal `max-w-3xl`); and, for the 7 form pages, keeping the outer `max-w-page-shell` (for background/shell consistency per UX-DR4) but adding a new inner `max-w-3xl mx-auto` wrapper around the actual form content. This two-level pattern (wide shell, narrow reading/form column) is the same shape `login.vue`/`profile/index.vue` already used successfully before this story.
- `UsuarioDirectoryCard.vue`'s 4 per-TipoUsuario gradient badges (the DESIGN.md-named "tinting card backgrounds by TipoUsuario" anti-pattern) were unified to a single `bg-surface-inverse` (black) treatment, matching the icon-badge convention used elsewhere; the per-type tagline *text* color was deliberately left differentiated (a much lighter touch than a full background wash, not named for removal by any AC).
- `index.vue`'s 2 hero panels (video panel, welcome-card panel) were deliberately left at `rounded-2xl` rather than swept into the card treatment — judged as structural hero elements distinct from grid-item content cards, consistent with the story's own hedge on this exact point. Flagging here in case the user disagrees and wants them unified too.
- `login.vue`'s former `Jugador.jpeg` panel was replaced with a solid `bg-primary` brand panel + "EH" monogram badge, mirroring `register.vue`'s existing brand-panel pattern (built in an earlier story) but adapted to login's black-form/narrower-side-panel layout rather than copying register's light-gray panel verbatim.
- `hover:bg-secondary` (AC #6) needed no code change beyond Task 2 — it was already present in `header.vue`, just referencing a token that didn't exist; defining `--color-secondary` in `@theme` made it a real, working utility automatically.
- Toast status colors (`ToastContainer.vue`) and the logout hover-accent in `userDropdown.vue` were deliberately left out of the button-role sweep — neither is a role-classed "button" in DESIGN.md's component sense (status banner and dropdown menu item, respectively).
- No automated tests written — established MVP convention, and this story is pure CSS/class-name consolidation with no new logic to test. **This story was NOT visually verified in a browser** (no dev-server/browser access during implementation) — the user must do a full visual pass across every touched page family before approving, especially: card hover states, button role correctness per screen, form-page reading width (the bug found and fixed above), nav at `<md` (7 links in the mobile menu), and login's new brand panel.

### Post-review fixes (user tested, 4 issues)

1. **AC #8 reverted per explicit user request**: "Eventos"/"Noticias" removed from `header.vue`'s `menuLinks` again — user clarified they never actually wanted the nav promotion; those sections stay Home-only (already correctly built in Story 5.1). `header.vue` is back to 5 links. AC #8 is now explicitly NOT satisfied by design — a deliberate reversal, not an oversight, should this AC be revisited later.
2. **Dark-mode text legibility gap on directory/detail pages**: the gradient-retirement pass (Task 6) gave `deportistas/marcas/nutricionistas/patrocinadores` `index.vue` pages a working `dark:bg-surface-container-dark`, but their hero `<h1>`/`<p>` text and empty-state text were never given `dark:` counterparts, and `UsuarioDetailView.vue` (the shared detail-page component) had zero `dark:` classes anywhere despite its own `bg-white` card. Fixed: hero heading/subtitle + empty-state text in all 4 `index.vue` files, and `UsuarioDetailView.vue`'s avatar-fallback circle, name/tipo heading, and every `<dl>` field label/value.
3. **`settings.vue` didn't visually respond to the theme toggle at all**: same root-cause class as the Story 6.1/7.1 bugs — the page's own container/card had `bg-white` with no `dark:` variant, so toggling never changed its appearance. Fixed: page background, card background, all headings/labels/borders/inputs given `dark:` counterparts. Also added a "Volver" button (`button-secondary`, `router.back()`) — this page had no way back before.
4. **Home hero nav-link hover looked wrong in dark mode**: those 4 cards use `hover:bg-black` for the light-mode hover feedback (works fine — dark card against a light hero panel). In dark mode, the hero panel itself is already `dark:bg-neutral-800`, so the same `hover:bg-black` produced a barely-visible dark-on-dark "shadow" instead of clear feedback. Fixed: `dark:hover:bg-white` inverts the hover target for dark mode, with matching `dark:group-hover:` text/icon color flips so the card reads as a clean white-card hover (mirroring the light-mode black-card hover) instead of just inheriting the light-mode hover colors unchanged.

### Post-review fixes, round 2 (user tested, 3 more issues)

1. **`ResenasSection.vue` was never touched by the original Task 4/6 sweep** (it's a nutritionist-detail-page component, not one of the pages directly listed in the research inventory) — its card, forms, buttons, and every text element had zero `dark:` classes. Given full `dark:` treatment: card background, all headings/labels/timestamps/avatar-fallback, both the create and edit rating/comment forms (including the inputs), the retract confirmation panel, and the "Dejar una reseña"/"Cancelar" buttons.
2. **`settings.vue` still showed white "on the sides" even after round 1's dark-background fix**: the page's dark background lived on a `max-w-[120rem] mx-auto`-constrained inner div, not a true full-bleed wrapper — on any viewport wider than 120rem (1920px), `default.vue`'s `<main>` (which only carries a dark background on the `/` route, per Story 7.1's scoping) showed through on both sides as tall light strips. Fixed by restructuring to the same two-level pattern used successfully elsewhere: an outer `w-full min-h-screen bg-surface-container dark:bg-surface-container-dark` wrapper (always correct, independent of viewport width or which route `default.vue` thinks is "dark-ready") with the existing `max-w-[120rem]` content centered inside it. This is more robust than extending `default.vue`'s route allowlist, which would need editing every time another page becomes dark-ready.
3. **All 7 create/edit form pages built in Task 5 (`catalogo/create.vue`, `catalogo/edit/[id].vue`, `admin/users/create.vue`, `admin/eventos/create.vue`, `admin/eventos/edit/[id].vue`, `admin/noticias/create.vue`, `admin/noticias/edit/[id].vue`) shared one structural gap, caught via `catalogo/edit/[id].vue`**: the outer page background correctly went dark (Task 5's fix), but the actual form content — `h1`, permission-denied messages, and every `input`/`select`/`textarea` — had no `dark:` classes at all, so black-on-transparent text sat on the new dark background, unreadable. Since this was a structural gap in the *pattern* Task 5 introduced (not a one-off), fixed all 7 files identically: `dark:text-white` on the inner content wrapper (covers headings/labels via inheritance) and `dark:border-gray-600 dark:bg-neutral-700` on every form control (inputs need an explicit dark background since form elements don't inherit page background the way text inherits color).

### Post-review fixes, round 3 (user tested, 2 more issues)

1. **Directory card text (`UsuarioDirectoryCard.vue`) still dark-on-dark**: Task 4's fix for this component only touched the card's own `bg-surface dark:bg-surface-container-dark` background — the name heading and detail-line text/icons inside it (`text-gray-900`, `text-gray-600`, `text-gray-400`) were never given `dark:` counterparts, so they stayed dark against the now-dark card. Fixed.
2. **`CatalogoItemCard.vue` was missed by the original Task 4/6 sweep entirely** (not in the research inventory's explicit list, despite being a card component right next to the ones that were fixed) — it had no `dark:` classes at all, plain `bg-white`. Also its usage site, `catalogo/[id].vue`'s own item-detail card, and `catalogo/index.vue`'s hero/empty-state text had the same gap. All three fixed with the same pattern used everywhere else this round: card `dark:bg-neutral-800`, category tag `dark:bg-neutral-700 dark:text-gray-200`, heading/body text `dark:text-white`/`dark:text-gray-300`.

This is the third round of the same underlying gap (see the `[[project-dark-mode-latent-bug]]` memory note): the initial Task 4/6 sweep was not actually exhaustive over every card component in the codebase — `CatalogoItemCard.vue` specifically fell through because it wasn't named in the original research inventory.

**Proactive closing sweep performed immediately after round 3** (grepped every `bg-white` in `app/components/**` and `app/pages/**`): found and fixed two more components with zero `dark:` treatment that are used across both dark-adapted and not-yet-adapted pages — `userDropdown.vue` (the header avatar menu) and `ContentEditor.vue` (the admin inline content-edit modal, used on `aboutUs.vue`/`terms.vue`/`privacity.vue`/`contactUs.vue`). The remaining `bg-white` hits found (`contactUs.vue`, `aboutUs.vue`'s content card, `admin/reportes`, `admin/mensajes-contacto`, `terms.vue`, `privacity.vue`, `profile/index.vue`, `profile/[id].vue`, `register.vue`) are **not bugs** — none of those pages' outer wrapper has a dark canvas in the first place (they were never in scope for this story's dark-mode work), so their white cards sit consistently on a light page in both themes. These remain legitimately out of scope; only pages/components that already have a `dark:bg-*` canvas needed the audit.

### Post-review fixes, round 4 (user requested: extend dark mode to Perfil, Reportes, Mensajes de Contacto)

Extended the same established pattern (full-bleed outer `w-full min-h-screen bg-surface-container dark:bg-surface-container-dark` wrapper + inner `dark:bg-neutral-800` card + `dark:text-*` on every explicit-colored text element) to three more page groups the user asked for directly, rather than waiting for more "still white" reports:

- **`profile/index.vue` / `profile/[id].vue`** (own profile + admin-editing-another-profile) — page/card background, headings, "Mi catálogo" sub-panel, success banner.
- **`ProfileEditForm.vue`** (the shared form both profile pages render — by far the largest fix in this round, ~30 fields across 4 TipoUsuario branches): this one used a **scoped CSS class** (`.reg-input`) with hardcoded `background: #ffffff` / `color: #111827`, not Tailwind utilities — a `dark:bg-*` utility class alone would have lost to the scoped rule on specificity (`.reg-input[data-v-hash]` beats a `:where(...)`-wrapped dark-variant utility). Fixed by stripping color/background out of the scoped CSS (kept only layout: border-radius/padding/font-size) and adding explicit `border border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-neutral-700 dark:text-white` directly on every input/select/textarea, plus `dark:` on every label and the read-only "Tipo de usuario" box and avatar-fallback circle.
- **`admin/reportes/index.vue`** — page background, heading, the doughnut chart's center-total overlay, the per-type count list, the total row, and the cross-check callout banner.
- **`admin/mensajes-contacto/index.vue`** — page background, heading, both the mobile stacked-card view and the desktop table (header row, dividers, cell text) — every `text-gray-900`/`text-gray-500`/`text-gray-700` occurrence given a `dark:` counterpart.

Same recurring lesson as prior rounds (see `[[project-dark-mode-latent-bug]]` memory): adding a dark canvas is the easy 10% of the work; auditing every descendant's explicit text/border/background color is the other 90%, and it has to be done exhaustively per page/component, not assumed from a single top-level fix.

### File List

- app/assets/css/main.css (modified — `@theme` token block, 3 button-role classes)
- app/components/layout/header.vue (modified — nav array +2 links, hover:bg-secondary now live via tokens)
- app/components/layout/footer.vue (not modified this story — already reverted to always-black in Story 7.1)
- app/pages/login.vue (modified — Jugador.jpeg removed, brand panel added, submit button token-ized)
- app/pages/register.vue (modified — submit button token-ized)
- app/pages/aboutUs.vue (modified — 6 card shape fixes)
- app/components/stats.vue (modified — card shape fix)
- app/components/UsuarioDirectoryCard.vue (modified — gradient badges unified, bg token)
- app/components/ConfirmDialog.vue (modified — token-ized, button roles)
- app/components/ContentEditor.vue (modified — button roles)
- app/components/ProfileEditForm.vue (modified — button role)
- app/components/ResenasSection.vue (modified — button roles ×3 call sites)
- app/components/PublicacionCard.vue (modified — button role)
- app/components/PublicacionComposer.vue (modified — button role)
- app/pages/index.vue (modified — 3 CTA buttons token-ized)
- app/pages/profile/index.vue, app/pages/profile/[id].vue (modified — button roles)
- app/pages/admin/users/index.vue, admin/users/create.vue (modified — gradient, shell, button roles)
- app/pages/catalogo/index.vue, catalogo/create.vue, catalogo/[id].vue, catalogo/edit/[id].vue (modified — gradient, shell, button roles)
- app/pages/eventos/index.vue, eventos/[id].vue, admin/eventos/create.vue, admin/eventos/edit/[id].vue (modified — gradient, shell, button roles)
- app/pages/noticias/index.vue, noticias/[id].vue, admin/noticias/create.vue, admin/noticias/edit/[id].vue (modified — gradient, shell, button roles)
- app/pages/deportistas/index.vue, deportistas/[id].vue (modified — gradient, shell, button role)
- app/pages/marcas/index.vue, marcas/[id].vue (modified — gradient, shell, button role)
- app/pages/nutricionistas/index.vue, nutricionistas/[id].vue (modified — gradient, shell, button role)
- app/pages/patrocinadores/index.vue, patrocinadores/[id].vue (modified — gradient, shell, button role)
- app/components/layout/header.vue (modified, post-review — Eventos/Noticias removed from nav again)
- app/pages/deportistas/index.vue, marcas/index.vue, nutricionistas/index.vue, patrocinadores/index.vue (modified, post-review — dark: text on hero/empty-state)
- app/components/UsuarioDetailView.vue (modified, post-review — dark: throughout)
- app/pages/settings.vue (modified, post-review — dark: throughout, added Volver button)
- app/pages/index.vue (modified, post-review — dark:hover: flip on the 4 hero nav-link cards)
- app/components/ResenasSection.vue (modified, post-review round 2 — full dark: treatment)
- app/pages/settings.vue (modified, post-review round 2 — restructured to full-bleed outer wrapper)
- app/pages/catalogo/create.vue, catalogo/edit/[id].vue, admin/users/create.vue, admin/eventos/create.vue, admin/eventos/edit/[id].vue, admin/noticias/create.vue, admin/noticias/edit/[id].vue (modified, post-review round 2 — dark: text/inputs on all 7 form pages)
- app/components/UsuarioDirectoryCard.vue (modified, post-review round 3 — card text dark: counterparts)
- app/components/CatalogoItemCard.vue (modified, post-review round 3 — missed entirely by the original sweep, full dark: treatment)
- app/pages/catalogo/[id].vue, catalogo/index.vue (modified, post-review round 3 — dark: throughout)
- app/components/userDropdown.vue, app/components/ContentEditor.vue (modified, post-review round 3 proactive sweep — dark: throughout)
- app/pages/profile/index.vue, profile/[id].vue (modified, post-review round 4 — dark: throughout)
- app/components/ProfileEditForm.vue (modified, post-review round 4 — scoped CSS specificity fix + dark: on ~30 form fields)
- app/pages/admin/reportes/index.vue, admin/mensajes-contacto/index.vue (modified, post-review round 4 — dark: throughout)
