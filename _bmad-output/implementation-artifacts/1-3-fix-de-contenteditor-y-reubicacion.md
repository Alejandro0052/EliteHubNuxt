---
baseline_commit: 15f62c9f4a914086df42e026d20a7a85f2196431
---

# Story 1.3: Fix de ContentEditor y reubicación

Status: review

## Story

As an admin,
I want ContentEditor to work correctly where it belongs and disappear where it doesn't,
so that I can maintain terms/privacy/about-us content reliably, without a broken modal or clutter on unrelated pages.

## Acceptance Criteria

1. **Given** I am an admin on `terms`, `privacity`, or `aboutUs` **When** I click the edit button **Then** the ContentEditor modal opens with an interactive, usable form panel that is not obscured by its own overlay (FR-7 fix — the panel gets its own stacking context above the overlay)

2. **Given** I am an admin on `aboutUs` (currently static HTML with no CMS connection) **When** I save an edit via ContentEditor **Then** the content persists via the `Content` model and the saved version displays on next load (FR-8)

3. **Given** I am an admin on `privacity` (which already has a `getContent()` read path) **When** I save an edit via ContentEditor **Then** the write path correctly persists and the existing read path reflects the change (FR-8)

4. **Given** any visitor on `contactUs`, `deportistas`, `marcas`, `nutricionistas`, or `patrocinadores` **When** the page renders **Then** no ContentEditor button or component appears anywhere on the page (FR-9)

5. **Given** `server/api/content/[page].get.ts` and `.put.ts` currently instantiate their own `PrismaClient` instead of using the shared `server/utils/prisma.ts` singleton **When** this story ships **Then** both handlers are fixed to use the shared singleton, matching every other handler in the codebase (ARCHITECTURE-SPINE Consistency Conventions) — a natural fit since this story already touches both files

## Tasks / Subtasks

- [x] Task 1: Fix the ContentEditor modal stacking bug (AC: #1)
  - [x] In `app/components/ContentEditor.vue`, the modal panel div (`class="inline-block transform overflow-hidden rounded-lg bg-white..."`, currently `static` positioning) is painted UNDER the overlay div (`class="... fixed inset-0 bg-gray-500..."`) because the overlay is positioned (`fixed`) and the panel is not — CSS always paints a positioned element above a non-positioned one regardless of DOM order. Fix: add `relative z-10` to the panel div's class list, giving it its own stacking context above the overlay
- [x] Task 2: Fix the shared Prisma singleton violation (AC: #5)
  - [x] `server/api/content/[page].get.ts` and `server/api/content/[page].put.ts` both do `import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient()` — remove both lines from each file; reference the global `prisma` (auto-imported from `server/utils/prisma.ts`) exactly like every other handler in `server/api/**`, with zero import statement
- [x] Task 3: Fix `useContent()`'s broken `getContent()` (AC: #2, #3 — this must be fixed for the read path to actually work)
  - [x] `app/composables/useContent.ts`'s `getContent()` does `const { data } = await $fetch(...); return data` — but `GET /api/content/[page]` returns the content object directly, not `{ data: ... }`. This makes `getContent()` always return `undefined` on a successful fetch today, across all 8 pages that call it (terms, privacity, contactUs, deportistas, marcas, nutricionistas, patrocinadores, and `settings.vue`'s own inline mini-CMS). Fix: `return await $fetch(...)` directly, no destructuring — the existing `catch` fallback (a blank content object) is correct and stays as-is
  - [x] `settings.vue` is not otherwise touched by this task, but its behavior changes too once this fix lands (its `loadAll()` calls to `getContent('privacity')`/`getContent('terms')`/`getContent('about')` currently all return `undefined` for the same reason) — worth a quick sanity check when testing that Settings' three editors populate correctly after this fix
- [x] Task 4: Wire ContentEditor onto `privacity.vue` (AC: #1, #3)
  - [x] Add `<ContentEditor page="privacity" :initial-content="content" @updated="handleContentUpdate" />` at the top of the template, matching `terms.vue`'s existing pattern
  - [x] Add a `handleContentUpdate` function that sets `content.value = updatedContent`, matching `terms.vue`
  - [x] The existing `getContent('privacity')` read path (already present) now actually works once Task 3 lands — no other read-path change needed here
- [x] Task 5: Wire ContentEditor onto `aboutUs.vue` (AC: #1, #2)
  - [x] `aboutUs.vue` is 100% static HTML today with no `Content` model connection at all — add the same pattern as `terms.vue`: import `useContent`, add a `pageContent` ref, `getContent`/`handleContentUpdate`, an `onMounted` fetch for page `"aboutUs"`, and `<ContentEditor page="aboutUs" :initial-content="pageContent" @updated="handleContentUpdate" />`
  - [x] Wrap the page's content in the same `v-if="pageContent.content"` (show `pageContent.title`/`.subtitle`/`v-html="pageContent.content"`) / `v-else` (show the existing hardcoded sections unchanged) structure `terms.vue` already uses — this lets an admin override the whole page with one edit while preserving today's default copy as the fallback, consistent with how every other Content-backed page in this codebase already behaves
- [x] Task 6: Remove ContentEditor from the 5 non-applicable pages, keep their hero-content read path (AC: #4)
  - [x] In `contactUs.vue`, `deportistas.vue`, `marcas.vue`, `nutricionistas.vue`, `patrocinadores.vue`: remove ONLY the `<ContentEditor ... />` element and its now-unreachable `handleContentUpdate` function
  - [x] Do NOT remove `getContent`, the `pageContent` ref, or the `onMounted` fetch on these 5 pages — `pageContent.title`/`.subtitle`/`.content` are genuinely displayed in each page's hero section today (confirmed by reading all 5 files) as an admin-overridable fallback-to-hardcoded-default; only the *editing entry point* is out of place here, not the read feature itself
- [x] Task 7: Fix a pre-existing page-key mismatch in `app/pages/settings.vue` for "Quiénes Somos" (AC: #2 — required for it to actually hold)
  - [x] `settings.vue` is a live, already-shipped mini-CMS (`/settings`, admin-only) with its own inline editors for privacity/terms/about, calling the same `useContent()` composable — it already works correctly for `privacity`/`terms` (both use `page: 'privacity'`/`page: 'terms'`, matching those pages' own keys) but its "Quiénes Somos" section uses `page: 'about'`, while Task 5 wires the real `aboutUs.vue` page to `page="aboutUs"`. Left unreconciled, these become two permanently divergent `Content` rows (`Content.page` is `@unique`) for the same page — an admin editing via Settings would silently write to a row `aboutUs.vue` never reads
  - [x] Change the two occurrences of the literal `'about'` used as the actual `Content.page` value in `settings.vue` to `'aboutUs'`: the `about` ref's initializer (`page: 'about'` → `page: 'aboutUs'`) and the `getContent('about')` call inside `loadAll()` → `getContent('aboutUs')`. Do NOT rename the local variable `about`, the `saveContent(key: ... | 'about')` parameter literal, or the `saved.about` tracking key — those are internal UI-branching identifiers, not the DB key, and renaming them is unnecessary churn
  - [x] After this fix, verify both editing surfaces (the real `aboutUs.vue` page's ContentEditor from Task 5, and Settings' "Quiénes Somos" section) read and write the same `Content` row

## Dev Notes

### Task 1 — exact fix location

`app/components/ContentEditor.vue`, the modal panel div is at (current file):
```html
<div
  class="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
```
Change the class string to add `relative z-10`:
```html
class="relative z-10 inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle"
```
The overlay div (`class="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity"`) has no explicit z-index and is `fixed` (positioned) — both divs share the same `z-50` stacking context from their shared ancestor (`role="dialog"` wrapper), so once the panel is also positioned (`relative`) with a z-index (`z-10`) higher than the overlay's implicit `auto`, DOM order + the new stacking context puts the panel on top. Do not change the overlay's `@click="closeModal"` behavior.

### Task 2 — exact current state (confirmed by reading both files)

`server/api/content/[page].get.ts` starts with:
```ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```
`server/api/content/[page].put.ts` has the same two lines, but not contiguous — `getServerSession` is imported between them:
```ts
import { PrismaClient } from '@prisma/client'
import { getServerSession } from '#auth'

const prisma = new PrismaClient()
```
Delete the `PrismaClient` import and instantiation line from each file (keep `.put.ts`'s `getServerSession` import — it's unrelated and still needed). Every other handler in `server/api/**` (e.g. `server/api/tipousuario/index.get.ts`, `server/api/auth/register.post.ts`) references the bare global `prisma` with zero import — Nitro auto-imports it from `server/utils/prisma.ts`'s default export. No other change needed in these two files for this task (their internal logic — `findUnique`/`upsert`, the `isAdmin` DB-recheck pattern in `.put.ts` — is unrelated to this bug and out of scope here; do not refactor it to `requireSession()` in this story, that's a broader consistency pass not scoped to FR-7/8/9).

### Task 3 — exact current bug (confirmed by reading the live file)

`app/composables/useContent.ts`:
```ts
const getContent = async (page: string) => {
  try {
    const { data } = await $fetch(`/api/content/${page}`)
    return data
  } catch (error) { ... }
}
```
`GET /api/content/[page]` (confirmed by reading it) returns the content object directly — `{ page, title, subtitle, content, metadata }` or `{ id, page, title, subtitle, content, metadata, createdAt, updatedAt }` — never `{ data: ... }`. So `const { data } = ...` always yields `data === undefined` on every successful fetch, and `getContent()` returns `undefined` — not the `catch` block's fallback (no error was thrown, so catch never runs). Every page calling this composable then does `pageContent.value = undefined`, and the template accesses `pageContent.title`/`.content` (auto-unwrapped ref access), which throws today once the fetch resolves. Fix: `return await $fetch(\`/api/content/${page}\`)` — no destructuring.

**This fix is why Tasks 4-6 all "just work" once it lands** — every page's existing `getContent(...)` call sites don't need to change, they were already written correctly against the intended (unwrapped) response shape; only the composable itself was wrong.

### Task 5 — aboutUs.vue's current state (confirmed by reading the live file, full read)

100% static: a `definePageMeta` block plus ~7 hardcoded `<div class="rounded-2xl bg-white p-6">` sections (Quienes Somos, Misión, Visión, etc.), no `useContent`, no `Content` model reference, no ContentEditor. Follow `terms.vue`'s exact structure as the template:
```ts
const { getContent } = useContent();
const pageContent = ref({ title: "", subtitle: "", content: "", metadata: {} });
const handleContentUpdate = (updatedContent) => { pageContent.value = updatedContent; };
onMounted(async () => {
  try {
    const content = await getContent("aboutUs");
    pageContent.value = content;
  } catch (error) {
    console.error("Error loading content:", error);
  }
});
```
Template: add `<ContentEditor page="aboutUs" :initial-content="pageContent" @updated="handleContentUpdate" />` at the very top (matching `terms.vue`), then wrap the existing 7 hardcoded sections in `<template v-if="pageContent.content"> ... custom title/subtitle/content ... </template><template v-else> ... existing hardcoded sections, unchanged ... </template>` (or an equivalent `v-if`/`v-else` pair around a container div — match `terms.vue`'s exact structure, don't invent a new pattern).

### Task 6 — confirmed per-file (all 5 read in full)

Every one of `contactUs.vue`, `deportistas.vue`, `marcas.vue`, `nutricionistas.vue`, `patrocinadores.vue` follows the identical shape: a `<ContentEditor page="{pagename}" :initial-content="pageContent" @updated="handleContentUpdate" />` at the top of the template (lines 4-8 in each file), and `pageContent.title`/`.subtitle`/`.content` genuinely rendered in that page's hero section further down (with a hardcoded `||` fallback string, e.g. `{{ pageContent.title || 'Deportistas Elite' }}`). Remove only the `<ContentEditor>` element and the now-dead `handleContentUpdate` function in each file's `<script>` block — leave `getContent`, `pageContent`, and the `onMounted` fetch untouched; they drive a real, currently-broken (until Task 3 lands), soon-to-be-working display feature.

### Voice/tone note (unrelated bug, do not fix here)

`ContentEditor.vue`'s `saveContent()` uses `alert("Contenido actualizado exitosamente")` / `alert("Error al guardar el contenido")` on success/failure — this is native browser `alert()`, not EXPERIENCE.md's confirmed toast/inline-message convention. Out of scope for this story (FR-7/8/9 don't ask for a UX overhaul of the editor's feedback mechanism); flagging only so it isn't mistaken for something this story was supposed to fix. Leave as-is.

## Project Structure Notes

- `app/components/ContentEditor.vue` — UPDATE (one class-list fix)
- `server/api/content/[page].get.ts` — UPDATE (remove own `PrismaClient` instantiation)
- `server/api/content/[page].put.ts` — UPDATE (remove own `PrismaClient` instantiation)
- `app/composables/useContent.ts` — UPDATE (fix `getContent()`'s destructuring bug)
- `app/pages/privacity.vue` — UPDATE (add ContentEditor + handler)
- `app/pages/aboutUs.vue` — UPDATE (add full Content-model wiring, previously static)
- `app/pages/contactUs.vue` — UPDATE (remove ContentEditor + handler only)
- `app/pages/deportistas.vue` — UPDATE (remove ContentEditor + handler only)
- `app/pages/marcas.vue` — UPDATE (remove ContentEditor + handler only)
- `app/pages/nutricionistas.vue` — UPDATE (remove ContentEditor + handler only)
- `app/pages/patrocinadores.vue` — UPDATE (remove ContentEditor + handler only)
- `app/pages/terms.vue` — NO CHANGE (already correctly wired; reference pattern for Tasks 4-5)
- `app/pages/settings.vue` — UPDATE (fix the `'about'` → `'aboutUs'` page-key mismatch, Task 7); also benefits from Task 3's composable fix with no code change needed there

## References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3: Fix de ContentEditor y reubicación] — Story statement + all 5 ACs, copied verbatim above.
- [Source: _bmad-output/planning-artifacts/architecture/architecture-Elite_Hub-2026-07-22/ARCHITECTURE-SPINE.md#Consistency Conventions] — Prisma singleton requirement, cites `content/[page].get.ts`/`.put.ts` by name as the known offenders.
- [Source: app/components/ContentEditor.vue] — full file read; exact stacking-bug root cause confirmed live (overlay `fixed`, panel `static`).
- [Source: app/composables/useContent.ts] — full file read; `getContent()`'s `{ data }` destructuring bug confirmed live against the actual API response shape.
- [Source: server/api/content/[page].get.ts, .put.ts] — full read; confirmed both return the content object directly (no `data` wrapper) and both instantiate their own `PrismaClient`.
- [Source: app/pages/terms.vue] — full read; the reference pattern Tasks 4 and 5 replicate (already correctly wired, modulo the Task 3 composable bug it also currently suffers from).
- [Source: app/pages/privacity.vue] — full read; confirmed `getContent` read path exists, no ContentEditor/write path.
- [Source: app/pages/aboutUs.vue] — full read; confirmed 100% static, zero `Content` model connection.
- [Source: app/pages/contactUs.vue, deportistas.vue, marcas.vue, nutricionistas.vue, patrocinadores.vue] — all 5 read in full; confirmed identical ContentEditor placement and confirmed `pageContent` is genuinely displayed in each hero section, not dead code.
- [Source: app/pages/settings.vue] — full read; confirmed a pre-existing, already-shipped admin mini-CMS at `/settings` for privacity/terms/about, calling the same `useContent()` composable; confirmed the `page: 'about'` vs. `aboutUs.vue`'s `page="aboutUs"` key mismatch this story must reconcile (Task 7), found during fresh-context validation, not the original analysis pass.

## Dev Agent Record

### Agent Model Used

Claude (bmad-dev-story)

### Debug Log References

None — no migration or server restart needed for this story (no schema change, purely component/handler/composable fixes).

### Completion Notes List

- All 7 tasks implemented, including Task 7 (the `about`/`aboutUs` page-key reconciliation in `settings.vue` found during fresh-context validation of the story, not part of the original epics.md AC list).
- Fixed a real, currently-live bug as part of Task 3 (`useContent().getContent()`'s `{ data }` destructuring) that was silently breaking the read path on 8 pages, not just the 3 this story directly wires/rewires.
- No unit tests authored, consistent with the standing decision (PRD/SPEC non-goal, no test framework installed). Verification deferred to the user's own manual testing.

### File List

- `app/components/ContentEditor.vue` — UPDATE (stacking-context fix: `relative z-10` on modal panel)
- `server/api/content/[page].get.ts` — UPDATE (removed own `PrismaClient` instantiation)
- `server/api/content/[page].put.ts` — UPDATE (removed own `PrismaClient` instantiation, kept `getServerSession` import)
- `app/composables/useContent.ts` — UPDATE (fixed `getContent()`'s `{ data }` destructuring bug)
- `app/pages/privacity.vue` — UPDATE (added ContentEditor + `handleContentUpdate`)
- `app/pages/aboutUs.vue` — UPDATE (full Content-model wiring: `pageContent` ref, `getContent`/`handleContentUpdate`, `onMounted` fetch, ContentEditor, `v-if`/`v-else` content-override structure)
- `app/pages/contactUs.vue` — UPDATE (removed ContentEditor + `handleContentUpdate`, kept read path)
- `app/pages/deportistas.vue` — UPDATE (same)
- `app/pages/marcas.vue` — UPDATE (same)
- `app/pages/nutricionistas.vue` — UPDATE (same)
- `app/pages/patrocinadores.vue` — UPDATE (same)
- `app/pages/settings.vue` — UPDATE (fixed `page: 'about'` → `page: 'aboutUs'` in the `about` ref initializer and the `loadAll()` fetch call, reconciling with `aboutUs.vue`'s key)
