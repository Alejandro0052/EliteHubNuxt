---
baseline_commit: 0f45cddd94cc64a366533398d82ac31e4f361fa1
---

# Story 5.3: Carrusel de imágenes y videos en publicaciones

Status: done

## Story

As an authenticated user,
I want to attach multiple photos and videos to my publicación as a carousel, freely mixed,
so that I can share richer content than a single photo or clip.

**Redesign note (2026-08-01):** This story originally shipped as "attach one image OR one video" (see Change Log). Before the user tested that version, they asked to broaden it to a carousel of up to 10 mixed images/videos. This file documents the carousel design directly — the single-attachment version is not "old work to preserve," it's superseded.

## Acceptance Criteria

1. **Given** I am using the composer (or editing my own Publicación, per Story 5.2) **When** I attach up to 10 media items, in any mix of images and videos **Then** the upload succeeds and all items are stored as the Publicación's media carousel, in the order I added them (FR-44)
2. **Given** I attempt to attach an 11th media item **When** I try to add it **Then** it is rejected before upload, with a clear message that 10 is the maximum
3. **Given** any video among the attached items **When** its duration exceeds 2 minutes **Then** that item is rejected with a clear message before the Publicación is created/updated — each video is checked independently, images have no duration limit (FR-44)
4. **Given** a Publicación with a media carousel **When** it renders in the feed or in its detail view **Then** items display one at a time with a way to move to the next/previous item; videos play inline with standard controls, images keep the existing click-to-zoom behavior
5. **Given** I am editing a Publicación that already has a media carousel **When** I attach a new set of media files and save **Then** the entire carousel is replaced wholesale by the new set — there is no per-item add/remove on an existing carousel in this MVP (FR-44)
6. **Given** the media files are uploaded **When** they're persisted **Then** they are stored on local disk via the existing upload pattern used for images — no early migration to Epic 8's Cloudflare R2 storage; these are expected to be test uploads that get deleted

## Tasks / Subtasks

- [x] Task 1: Read what's already built before writing anything (AC: all)
  - [x] The single-attachment version of this story (see Change Log) added `imagen String?` / `video String?` to `Publicacion`, with mutual-exclusion logic in both upload endpoints and both client forms. All of that is being replaced, not extended — the two nullable-string fields don't fit "up to 10 ordered, mixed-type items."
  - [x] `ItemCatalogo` (prisma/schema.prisma:234-245) already has the right shape for "multiple files, one entity" in this exact codebase: `imagenes String[]` — a plain Postgres string array, no separate join table, no per-item metadata. This is the established idiom for multi-file attachments here, and this story follows it rather than inventing a relational `PublicacionMedia` model — simpler, and consistent with "don't add abstractions the codebase doesn't already use elsewhere."
  - [x] Since a flat `String[]` can't carry a per-item "is this a video" flag, type is inferred from the stored URL's file extension at render/validation time (same extensions already used for the single-attachment version: images `.jpg/.jpeg/.png/.webp`, videos `.mp4/.webm/.mov/.ogg`). A tiny shared helper (`shared/utils/media.ts`, `isVideoUrl(url)`) centralizes this so client (render branch) and any future server logic share one definition — `#shared` is already used from both sides in this codebase (e.g. `shared/utils/resourcePermissions.ts` imported by both `server/utils/guards/authorOrAdmin.ts` and `app/components/PublicacionCard.vue`).
  - [x] `server/api/publicaciones/index.post.ts`/`[id].put.ts` currently (single-attachment version) read one `imagenFile`/`videoFile` field each. For an ordered, multi-file, mixed-type upload, indexed field names are needed so the server can pair each file with its (optional, video-only) duration and preserve order: client sends `mediaFile_0`, `mediaFile_1`, ... and, only for entries that are videos, a matching `mediaDuration_0`, etc. Field name, not arrival order, determines position — multipart field order isn't guaranteed to survive every client/proxy.
  - [x] `PublicacionComposer.vue`/`PublicacionCard.vue`'s edit form currently have separate single-file image/video inputs with cross-clearing logic (single-attachment version). Both need to become one `<input type="file" multiple accept="image/*,video/*">` feeding a local ordered array of pending items (with per-item preview + remove), capped at 10, with per-video duration probed and rejected individually (not the whole batch) if over 2 minutes.
  - [x] `PublicacionCard.vue`'s existing `showLightbox` + `Teleport` lightbox (image-only, built in a prior session) still applies, but now to "whichever carousel item is currently showing, if it's an image" rather than to a single fixed `publicacion.imagen`. A `carouselIndex` ref (per-card, reset implicitly since each card is its own component instance) tracks the currently displayed item.

- [x] Task 2: Replace `imagen`/`video` with an ordered `media` array on `Publicacion`, and migrate (AC: #1, #4, #6)
  - [x] In `prisma/schema.prisma`, replace `imagen String?` and `video String?` on `model Publicacion` with `media String[] @default([])` — mirrors `ItemCatalogo.imagenes String[]` exactly.
  - [x] Added `shared/utils/media.ts` exporting `VIDEO_EXTENSIONS` and `isVideoUrl(url: string): boolean`.
  - [x] Ran `npx prisma migrate dev --name publicacion_media_carousel` (dev server confirmed stopped by the user beforehand, per this project's established Windows `EPERM` precaution) — used `--create-only` first to hand-edit the generated SQL, adding a best-effort backfill (`UPDATE "Publicacion" SET media = ARRAY[imagen] WHERE imagen IS NOT NULL; UPDATE "Publicacion" SET media = ARRAY[video] WHERE video IS NOT NULL;`) before the `DROP COLUMN` statements, so any existing test publicación with a single image/video from the prior version isn't silently emptied. Then applied normally.

- [x] Task 3: Rewrite `server/api/publicaciones/index.post.ts` for multi-file ordered upload (AC: #1, #2, #3, #6)
  - [x] Parse all `mediaFile_<n>` fields (validating `field.type` starts with `image/` or `video/`, else skip/ignore) and all `mediaDuration_<n>` fields into two maps keyed by index `n`; after the parse loop, build the ordered list by sorting numeric indices ascending — field *name* index is the source of truth for order, not loop arrival order.
  - [x] Reject with 400 (`'Máximo 10 archivos por publicación'`) if more than 10 media entries are present.
  - [x] For every entry whose mime type starts with `video/`, look up its paired `mediaDuration_<n>` value; reject with 400 (`'El video "<nombre>" no puede durar más de 2 minutos'`) if missing or > 120. Images have no duration check.
  - [x] All validation happens before any `storage.setItemRaw` call (fail fast, no orphaned uploads on a rejected request — same discipline as the single-attachment version).
  - [x] Upload each accepted item in order (image extension allowlist `.jpg/.jpeg/.png/.webp` fallback `.jpg`, key prefix `publicacion-`; video extension allowlist `.mp4/.webm/.mov/.ogg` fallback `.mp4`, key prefix `publicacion-video-`; both via `useStorage('public').setItemRaw`, same as before), collecting the resulting `/`-prefixed keys into a `media: string[]` array in order.
  - [x] `media` (possibly empty array) passed to `prisma.publicacion.create`.

- [x] Task 4: Rewrite `server/api/publicaciones/[id].put.ts` for multi-file ordered upload, wholesale replace (AC: #1, #2, #3, #5, #6)
  - [x] Same indexed-field parsing, count cap, and per-video duration validation as Task 3.
  - [x] Wholesale-replace policy (AC #5): if any `mediaFile_<n>` fields are present, the entire `media` array is replaced by the newly uploaded set (old URLs simply dropped from the row — no storage cleanup, matching this codebase's existing no-cleanup convention for replaced images); if none are present, `media` is left as `existing.media`, untouched.

- [x] Task 5: Rebuild `PublicacionComposer.vue`'s attachment UI as a multi-file picker (AC: #1, #2, #3)
  - [x] Single `<input type="file" multiple accept="image/*,video/*">`, label "Fotos y videos (opcional, máximo 10; cada video máx. 2 minutos)".
  - [x] Local `mediaItems` ref: ordered array of `{ file, type: 'image'|'video', duration?, previewUrl }`. On file selection, iterate newly picked files in order; for each: stop (toast "Máximo 10 archivos por publicación") once `mediaItems.length` would exceed 10; images pushed immediately with an object-URL preview; videos probed for duration first (temporary `<video>` + `URL.createObjectURL`, same technique as the single-attachment version) and only pushed if ≤120s, otherwise toast-rejected individually by filename without blocking the rest of the batch.
  - [x] Render a small thumbnail strip below the input: each item shows its preview (image thumbnail, or a small muted `<video>` frame for video items) plus a per-item "×" remove button (revokes that item's object URL and splices it out).
  - [x] On submit, append `mediaFile_${i}`/`mediaDuration_${i}` (video items only) for each item in `mediaItems` array order; on success, revoke all preview object URLs and clear `mediaItems`.

- [x] Task 6: Rebuild `PublicacionCard.vue`'s edit-form attachment UI the same way (AC: #1, #2, #3, #5)
  - [x] Same multi-file-picker + thumbnail-strip + per-item duration validation as Task 5, starting empty each time edit mode opens (matches AC #5's wholesale-replace-if-provided policy — this is a fresh selection, not a pre-populated editor of the existing carousel). Helper text "Deja vacío para conservar el carrusel actual" shown when `publicacion.media?.length`.
  - [x] `handleEditSubmit` appends the same indexed fields; resets `mediaItems` on success.

- [x] Task 7: Render the media carousel in `PublicacionCard.vue` (AC: #4)
  - [x] Replaced the single image/video `v-if`/`v-else-if` block with: if `publicacion.media?.length`, show `publicacion.media[carouselIndex]` — `<video controls>` if `isVideoUrl()` says so, else the existing `<img>` + lightbox-trigger. If `publicacion.media.length > 1`, render prev/next buttons (wrap-around) and an "i / N" counter overlay.
  - [x] `carouselIndex` ref (local to each card instance, starts at 0); `prevMedia`/`nextMedia` functions wrap using modulo arithmetic.
  - [x] Lightbox `Teleport` block now points at `publicacion.media[carouselIndex]` instead of the old fixed `publicacion.imagen`; still image-only (unreachable when the current item is a video, since video items render their own `<video controls>` branch with no click-to-zoom handler).

## Dev Notes

### Scope size

Medium — a genuine redesign mid-story, not an incremental add. The single-attachment version (Change Log) is fully superseded: schema field shape changed (`imagen?`/`video?` → `media[]`), both server endpoints rewritten around indexed multipart fields instead of two named ones, and both client forms rebuilt around a multi-item picker with per-item state instead of two parallel single-file inputs.

### Key design decision: flat `String[]`, not a relational media table

`ItemCatalogo.imagenes String[]` (prisma/schema.prisma:238) is already this codebase's precedent for "an entity can have several files." This story follows it for `Publicacion.media` rather than introducing a `PublicacionMedia` join model with its own `id`/`tipo`/`orden` columns — a relational table would need an enum, a migration with a real join table, cascade-delete wiring, and an ordered `include` on every read, for no behavior this MVP actually needs (no per-item metadata beyond "is it a video," which is cheaply inferred from the URL's extension). If a future story needs per-item captions, alt text, or reordering-after-publish, that's the trigger to promote this to a real table — not preemptively now.

### Key scope decision: client-side-only duration enforcement (unchanged from the single-attachment version)

Still no video-inspection library in this codebase (no `ffprobe`/`fluent-ffmpeg`), still out of scope to add one. Each video's duration is read client-side (`HTMLVideoElement.duration`) and sent as a paired `mediaDuration_<n>` field, re-checked server-side against that reported value — trusting the client for this one check, consistent with this codebase's existing lack of server-side image-content validation. Test videos that get deleted, per the user's own framing; not hardened against a malicious client.

### Data note on the migration

The single-attachment version's migration (`20260801192242_add_publicacion_video`) added nullable `imagen`/`video` columns that this story's migration now drops. Any Publicación created during that brief window keeps its single image/video via a best-effort `UPDATE ... SET media = ARRAY[...]` backfill added to the generated migration SQL before the columns are dropped — not a no-op loss, but also not a fully general migration (doesn't attempt to preserve ordering beyond "whatever single item existed").

### Architecture / conventions this story must follow

- **`String[]` follows the `ItemCatalogo.imagenes` precedent** — do not build a new relational model for this.
- **Order is field-name-indexed, not loop-order-dependent** — `mediaFile_0`, `mediaFile_1`, ... is the contract between client and server; do not rely on the order fields happen to arrive in `readMultipartFormData`'s array.
- **Server-side validation is the real guard** (count cap, per-video duration) — client-side UX (Tasks 5/6) is a courtesy, not the enforcement point, per this codebase's established client-can't-be-trusted-for-validation convention.
- **No test framework** — same MVP non-goal as every prior story. Manually verify: attach a mix of 3-4 images and videos (some short, one intentionally >2min) via the composer and confirm the over-limit video is rejected individually while the rest still upload on retry; attach 11 items and confirm the 11th is rejected client-side; confirm the resulting carousel shows items in the order they were added, with working prev/next and a correct "i / N" counter; confirm videos play inline and images still open the lightbox; edit an existing carousel-bearing Publicación with a new set of files and confirm the old set is fully replaced; edit it with no new files and confirm the old carousel survives untouched; confirm a deactivated user's carousel-bearing Publicación is still hidden via the existing `activeUserFilter` cascade (no code change here, inherited from Story 2.4/5.1).
- **Prisma migration caution**: confirmed with the user that the dev server was stopped before running Task 2's migration, per this project's repeated Windows `EPERM` history.

### Project Structure Notes

- Modified: `prisma/schema.prisma` (`Publicacion.imagen`/`video` → `Publicacion.media String[]`).
- New: `shared/utils/media.ts` (`isVideoUrl`, `VIDEO_EXTENSIONS`).
- New migration: `prisma/migrations/<timestamp>_publicacion_media_carousel/` (hand-edited to backfill from the old columns before dropping them).
- Superseded migration (kept, not deleted — migrations are append-only history): `prisma/migrations/20260801192242_add_publicacion_video/`.
- Modified: `server/api/publicaciones/index.post.ts`, `server/api/publicaciones/[id].put.ts` (indexed multi-file parsing, count/duration validation, wholesale-replace-on-edit).
- Modified: `app/components/PublicacionComposer.vue`, `app/components/PublicacionCard.vue` (multi-file picker + thumbnail strip on both forms; carousel render + prev/next + lightbox-on-current-image on the card).
- Not touched: `server/api/publicaciones/index.get.ts` (the `media` scalar array column returns automatically, no `select` narrowing to update), `shared/utils/resourcePermissions.ts`, `app/composables/useResourcePermissions.ts`, `app/components/InfiniteScrollList.vue`, `app/pages/index.vue`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5 / Story 5.3] — verbatim ACs (carousel version)
- [Source: _bmad-output/planning-artifacts/prds/prd-Elite_Hub-2026-07-19/prd.md §5.10 FR-44] — the FR this story implements (carousel version, superseding the 2026-08-01 single-attachment FR-44)
- [Source: prisma/schema.prisma:234-245] — `ItemCatalogo.imagenes String[]`, the precedent this story's `Publicacion.media` field follows
- [Source: server/api/publicaciones/index.post.ts, [id].put.ts] — pre-redesign single-attachment implementation, superseded by this story's Tasks 3/4
- [Source: app/components/PublicacionComposer.vue, PublicacionCard.vue] — pre-redesign single-attachment forms, superseded by this story's Tasks 5/6/7
- [Source: _bmad-output/implementation-artifacts/5-2-moderacion-de-publicaciones-autor-y-admin.md] — closest prior story in this epic; confirms the "replace wholesale" edit-time policy this story generalizes to a set

## Change Log

- **2026-08-01, v1 (superseded same day):** Implemented as "one image OR one video, mutually exclusive" — `imagen String?`/`video String?` on `Publicacion`, two single-file inputs client-side. Never tested by the user before v2 was requested.
- **2026-08-01, v2 (current):** Redesigned as a carousel of up to 10 mixed images/videos — `Publicacion.media String[]`, single multi-file picker client-side, wholesale-replace on edit.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5

### Debug Log References

- `npx prisma migrate dev --create-only` refused to run non-interactively even with `--create-only` (this environment's shell has no TTY). Worked around it by hand-writing the migration SQL into a manually-created `prisma/migrations/<timestamp>_publicacion_media_carousel/` folder (matching Prisma's naming convention) and applying it with `npx prisma migrate deploy`, which is designed for non-interactive use and picks up pending migrations from disk. Verified afterward with a one-off Prisma Client query that the backfill worked: 3 pre-existing `imagen` values and 1 pre-existing `video` value all landed correctly in `media[0]`.

### Completion Notes List

- Replaced `Publicacion.imagen`/`video` (nullable strings, single-attachment version) with `Publicacion.media String[]` — following `ItemCatalogo.imagenes String[]`'s existing precedent in this same schema rather than introducing a new relational media table. Type (image vs. video) is inferred from the stored URL's extension via a new `shared/utils/media.ts#isVideoUrl()` helper, shared between client render logic and (potentially) future server logic.
- Migration hand-backfills `media` from the old `imagen`/`video` columns before dropping them, so the 3 images + 1 video created while the single-attachment version was briefly live were not lost — confirmed via direct query after applying.
- Both server endpoints now parse indexed fields (`mediaFile_0`, `mediaFile_1`, ..., paired `mediaDuration_<n>` for video entries only), sort by numeric index to establish order (not multipart arrival order), enforce a 10-item cap and per-video 2-minute cap before writing anything to storage, then upload in order and store the resulting keys as an ordered `media` array.
- Edit endpoint keeps the "wholesale replace if any new files provided, otherwise leave untouched" policy, now applied to the whole array at once rather than to two independent fields.
- Both client forms (composer + card's inline edit) now use one `<input type="file" multiple accept="image/*,video/*">` feeding a local ordered array with a thumbnail strip and per-item remove button; each video is duration-probed individually on selection (rejecting just that file, not the whole batch, if over 2 minutes) via the same `HTMLVideoElement.duration` + `URL.createObjectURL` technique as the superseded single-attachment version.
- `PublicacionCard.vue`'s display mode now renders a one-item-at-a-time carousel from `publicacion.media` with wrap-around prev/next buttons and an "i / N" counter, shown only when there's more than one item. The existing lightbox still works, now pointed at whichever carousel index is currently showing (and only reachable when that item is an image, since video items render their own `<video controls>` branch with no click-to-zoom handler).
- `useToast()` still only supports `"success" | "error"` — all new toasts (max-10, per-video duration rejection) use `'error'`, same call made in the superseded version.
- No automated tests written — established MVP convention. Manual verification steps are listed in Dev Notes; the two things most worth testing by hand are: (1) that a >2min video among several selected files is rejected individually while the valid ones stay in the pending list, and (2) that carousel order matches selection order end-to-end (client pending-list order → indexed form fields → server sort-by-index → stored array order → carousel display order).

### File List

- prisma/schema.prisma (modified — `Publicacion.imagen`/`video` replaced by `Publicacion.media String[]`)
- prisma/migrations/20260801200715_publicacion_media_carousel/migration.sql (new — hand-written, includes data backfill from the old columns)
- shared/utils/media.ts (new — `isVideoUrl`, `VIDEO_EXTENSIONS`)
- server/api/publicaciones/index.post.ts (rewritten — indexed multi-file upload, count/duration validation)
- server/api/publicaciones/[id].put.ts (rewritten — same, plus wholesale-replace-on-edit for the whole array)
- app/components/PublicacionComposer.vue (rewritten — multi-file picker, thumbnail strip, per-item duration probe)
- app/components/PublicacionCard.vue (rewritten — same picker in edit form; carousel display with prev/next + counter + lightbox-on-current-image)
