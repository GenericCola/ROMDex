# MX01 — Final Design Review

**October 21, 2026. Status: accepted; MX01 complete.** See [completion report](MX01-Completion-Report.md). Installed 0.5.26, current Data, remembered connections and YouTrack records were unchanged during design review.

## Approved choices

1. Condition Inspector is the default. Each map exposes its relevant access conditions and affected dialogue/scenes/presence, with full compound requirements. No universal story timeline or simulated saved-game progression.
2. Character naming, sprites, link/inspect/detach tools open inline in Tray 3 beside source dialogue.
3. Generate map overviews, building exteriors and exact floor/interior images automatically for supported ROMs. Preserve owner crops, views and manual images across re-preparation.
4. Automatically apply supported safe name updates from YouTrack; review content/structure changes and conflicts. Comments remain discussion.
5. Precisely bounded valid agent returns can reconcile automatically. Open-ended requests require approval of exact returned differences. Every accepted return needs human testing; the task remains open.
6. Automatically clean only verified disposable caches. Backups/history require itemized review; collect approved obsolete files for manual deletion.
7. NPCD uses explicit content kinds and nested parent relationships; shared profiles reference their placements. ROMDex tasks keep Epic/Saga/Story/Verse.
8. Upgrade supported older managed RDX files on save with recoverable originals and all existing work preserved. Missing analysis remains unresolved; unsupported newer features block unsafe editing.

## Concrete review package

- [Recorded decisions and full tool-placement table](MX01-Design-Review.md).
- [Condition/image/compatibility contract](MX01-Contracts/README.md), including exact required capabilities, native carriers, branch/presence predicates, source references, review-light semantics, image provenance, native hierarchy/edits, private result authority and upgrade/retention rules.
- [Feature schema](MX01-Contracts/features.schema.json), [fictional condition fragment](MX01-Contracts/condition-index.example.json), [pending image fragment](MX01-Contracts/location-previews.example.json), and [design verification](MX01-Contracts/design-verification.json).

The reviewed interactive screen retains maps on the left, entities above contextual dialogue, and relevant conditions below. Map tile hover/focus cogs hold Prepare/Assign/Update; Export RDX and Send to NPCDex remain equal-sized map actions. NPCDex retains its original FINAL/CHANGE/REMOVE and flag/note behavior, Add Character left of gender, grouped Tray 2 tools, standard cogs, shared header and TAB behavior. Mockup text/conditions and image placeholders are illustrative; implementation reuses actual suite components.

## Verification and limits

Twenty-one focused design cases passed using a bounded checker for the schema constructs used here, not a general-purpose schema certification. The examples exercise references, unknown guards, missing coverage and preview selections; they are not complete importable RDX files. Interface checks covered interactions, inline tools, visible dialogue and narrow-width overflow. Historical completed checklist entries and corrective task order are preserved.

No application-code change, ROM re-extraction, image rendering, migration, full-suite test, installer run or live backend proof was performed for MX01. Current capabilities do not yet understand the new feature payloads. Later tasks must implement and prove them, and the actual-two-build proof remains deferred until another supported ROM build exists. Local documentation repository copies are prepared; remote publication is not claimed.

## Final decision

The owner approved the consolidated concrete contract and reviewed layouts as the MX01 implementation baseline, marked MX01 complete and supplied the PASSKEY for **MX02 — Branch, Presence and Condition Extraction**, followed by **MX03 — Condition RDX and Timeline Integration**, Sol / High. Later tasks remain individually gated.
