# MAPDex 0.5.20 — Entity Labels and Sprite Preview Correction

Status: complete, installed and reopened with the current prepared map and saved connections.

The prepared-item selector now groups content by sub-area. Fixed extraction rules use leading source-dialogue speaker labels, explicit self-introductions, source sprite roles and short dialogue cues. For example, the supplied ROM yields Rival, Professor Elm, Cameron — Photographer, and Woman — “I like your Bag!”. Shared graphics never merge identities, and unnamed characters retain reviewable descriptive labels. No AI service runs during import. This does not provide universal ROM-format support or identify every character automatically.

Default thumbnails use the front-standing texture for recognized HGSS frame layouts, using numeric texture names rather than their lexicographic array position. Ambiguous source palettes retain no guessed default; the frame chooser labels direction, texture and palette. Explicit user thumbnail choices take precedence.

Corrections are saved as versioned descendants in the local prepared map RDX, retaining the exact previous document, source mappings, dialogue/scripts, images, plans, notes and testing data. Existing custom names and overrides remain authoritative. Readable sub-area names now persist in the prepared/exported RDX instead of being view-only hints. No production map is published by this correction.

Validation completed:

- 27 focused checks: presentation evidence and frame selection, source identity/content preservation, stale edit protection, staged import/export, explicit handoff, restart/draft handling and repreparation.
- Actual supplied-ROM UI/export: eight named area groups, readable entity options, exact front-standing Rival PNG, labeled thumbnail choices, one map RDX containing eight child sub-areas and corrected names/images.
- Windows packaged application: 4 native checks passed, including existing-preparation upgrade, exact front-standing sprite and native one-map/eight-subarea export; normal Quit completed. Installer validation passed.
- Fresh complete Data backup: 119 files, every member restored and verified. All three saved connections verified. All 381 installed files matched the package; Data matched the backup exactly before reopening. The prepared staging RDX then received the versioned presentation correction. The installed app retains 299 tasks and 0 NPCDex documents; no production map was imported by this task.

The first sandbox test run hit Windows Temp rename permissions; the same scoped checks passed using the writable task test directory. UI harness selection was corrected to select an appearance rather than its similarly named profile. Neither event changed production data.

Next separate MAPDex task: editable parent/child map groups. Let the user choose Violet City as parent and Sprout Tower as child, retaining Sprout Tower’s floors/areas and entities beneath it. Preserve identities, review existing prepared/imported content, and export one primary map document with nested sub-zones rather than flattening or duplicating them. Extend the nesting contract before activation as necessary.

Still open: broader RI03C coverage and the user’s live NPCDex/YouTrack edit round trip. The live NPCD Type field currently offers Milestone/Task/Subtask; parent-child linking exists, but assigning the intended Epic/Saga/Story/Verse Type labels is a separate mapping gap and is not claimed complete.

The user also requested recognizable zone/sub-zone location previews. Track a ROM-derived rendering proof alongside grouping before selecting dependencies and UI; the current build previews sprites, not location geometry.

Current unsigned private evaluation installer: `ROMDex-Installer-0.5.20/ROMDex-0.5.20-x64.msi`. Preserve `Protected/Before-MAPDex-0.5.20/Data.zip` and previous application-source ZIP. The private updater channel remains at 0.5.15; this correction does not publish a new update release. [Verification evidence](MAPDex-0.5.20-Verification.json).
