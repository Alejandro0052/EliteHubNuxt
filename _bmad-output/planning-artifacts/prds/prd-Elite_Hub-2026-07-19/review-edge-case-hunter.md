# Edge Case Hunter — Elite Hub PRD

**Target:** `prd.md` (with `addendum.md` read for context only)
**Method:** Exhaustive path enumeration over branching/conditional logic and boundary conditions. Only unhandled paths are listed; handled paths and paths already flagged in-document via `[ASSUMPTION]`/`[NOTE FOR PM]` were discarded.

```json
[
  {
    "location": "prd.md:160-165 (FR-3) vs prd.md:296-301 (FR-18)",
    "trigger_condition": "Admin uses profile-edit override (FR-18) on a Usuario whose TipoUsuario was mis-selected at registration",
    "guard_snippet": "FR-3: 'TipoUsuario cannot be changed by the Usuario, nor by admin override (FR-18); no path exists to correct a mis-selected type post-registration.'",
    "potential_consequence": "Unclear whether admin can fix a wrongly-chosen type or is permanently blocked, same as the user"
  },
  {
    "location": "prd.md:303-311 (FR-40) vs prd.md:363-386 (FR-24, FR-37)",
    "trigger_condition": "A Usuario who authored one or more Reseñas is deactivated (activo = false)",
    "guard_snippet": "FR-40: 'content ... Publicaciones, Ítems de Catálogo, Eventos/Noticias, Reseñas, and their directory listing/profile ... is hidden while deactivated.'",
    "potential_consequence": "Deactivated/blocked user's reviews stay visible on Nutricionista profiles, undermining the FR-36 moderation intent"
  },
  {
    "location": "prd.md:375-386 (FR-36, FR-37)",
    "trigger_condition": "Admin retracts a Reseña (FR-36) without also blocking its author",
    "guard_snippet": "FR-37: 'the one-review-per-nutricionista limit is keyed to a submission having ever occurred, not to a currently-existing record, so a retracted review still counts against the limit unless the user is also blocked.'",
    "potential_consequence": "User whose bad-faith review was retracted can immediately submit a fresh review for the same nutricionista"
  },
  {
    "location": "prd.md:363-386 (FR-24, FR-36, FR-37)",
    "trigger_condition": "A Usuario wants to edit or delete their own already-submitted Reseña",
    "guard_snippet": "Add FR: 'The authoring Usuario can edit or delete their own Reseña, mirroring FR-14/FR-28 author rights on Eventos/Noticias and Publicaciones.'",
    "potential_consequence": "Only admin retraction exists; a user has no way to correct or retract their own review, unlike every other content type"
  },
  {
    "location": "prd.md:363-370 (FR-24)",
    "trigger_condition": "A Usuario with TipoUsuario = Nutricionista leaves a Reseña on their own Nutricionista profile",
    "guard_snippet": "FR-24: 'a Nutricionista may not submit a Reseña on their own profile.'",
    "potential_consequence": "Self-reviews can inflate a nutricionista's reputation signal with no technical or process gate"
  },
  {
    "location": "prd.md:333-352 (FR-20-FR-23, FR-39)",
    "trigger_condition": "A Marca wants to edit or delete an already-created Ítem de Catálogo, or an admin needs to remove a fraudulent/inappropriate listing",
    "guard_snippet": "Add FR: 'A Marca can edit/delete its own Ítems de Catálogo; an admin can delete any Ítem de Catálogo regardless of authorship, mirroring FR-14/FR-28.'",
    "potential_consequence": "No CRUD completeness or moderation override exists for catalog items — stale, wrong, or abusive listings cannot be removed by anyone"
  },
  {
    "location": "prd.md:73-78 (UJ-5) vs prd.md:375-382 (FR-36 consequence: blocked user cannot log in)",
    "trigger_condition": "The sole/only admin account is deactivated (self-service or by another admin) or otherwise blocked",
    "guard_snippet": "Add NFR/constraint: 'At least one active isAdmin=true account must always exist; the system prevents deactivating the last remaining admin.'",
    "potential_consequence": "No admin can log in to moderate content or perform the UJ-5 manual password-recovery stopgap, locking out all recovery paths"
  },
  {
    "location": "prd.md:105 (Admin glossary) vs prd.md:132-158 (FR-1, FR-2)",
    "trigger_condition": "A new admin account needs to be created/promoted",
    "guard_snippet": "Add FR or note: 'isAdmin is set via <mechanism — e.g. direct DB flag, existing seed script>; registration (FR-1/FR-2) never sets isAdmin.'",
    "potential_consequence": "No specified path to create or promote an admin account; relies on undocumented out-of-band access"
  },
  {
    "location": "prd.md:142 (FR-2 Deportista 'nacionalidad') vs prd.md:152-158 (FR-38)",
    "trigger_condition": "Deportista registration form renders the 'nacionalidad' field",
    "guard_snippet": "FR-38: 'the fixed-list rule for país also applies to Deportista's nacionalidad field' (or explicitly excludes it as free text).",
    "potential_consequence": "Ambiguous whether nacionalidad is fixed-list or free text, risking an inconsistent field on the one form that doesn't literally say 'país'"
  },
  {
    "location": "prd.md:252-258 (FR-12) and prd.md:418-426 (FR-29) vs prd.md:303-311 (FR-40)",
    "trigger_condition": "One or more Usuarios are deactivated (activo = false) while homepage stats / Reportes counts are computed",
    "guard_snippet": "FR-12/FR-29: 'aggregate counts include/exclude Usuarios where activo = false' (state which).",
    "potential_consequence": "Displayed totals may count users whose profiles are simultaneously hidden from directories, a visible inconsistency"
  },
  {
    "location": "prd.md:471-477 (FR-35)",
    "trigger_condition": "Migration runs while profile photos / catalog images / publicación images already exist on local disk from pre-migration usage",
    "guard_snippet": "FR-35: 'existing local-disk files are migrated to the new storage location as part of this FR, not only new uploads going forward.'",
    "potential_consequence": "Pre-migration images 404 after cutover since only the write path changes, not already-stored files"
  },
  {
    "location": "prd.md:16 (§1 Vision: 'TipoUsuario is set later, if at all') vs prd.md:160-165 (FR-3), prd.md:287-289 (FR-15)",
    "trigger_condition": "An existing pre-MVP Usuario record has no TipoUsuario set",
    "guard_snippet": "Add migration requirement: 'existing Usuarios without a TipoUsuario are backfilled/handled before FR-15 directory segmentation and FR-3 immutability go live.'",
    "potential_consequence": "Legacy accounts with no type are unassignable to any of the four directories and have undefined immutability status"
  },
  {
    "location": "prd.md:287-292 (FR-15, FR-16) and prd.md:343-345 (FR-22)",
    "trigger_condition": "A given TipoUsuario directory, sport filter, or catálogo category currently has zero matching records",
    "guard_snippet": "Add consequence: 'an empty directory/filter/category renders an explicit empty state, not a blank or broken infinite-scroll container.'",
    "potential_consequence": "Undefined UI state when a directory, filter, or catalog category has no results (e.g., a newly-launched Patrocinadores directory)"
  }
]
```
