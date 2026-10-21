# MAPDex 0.5.24 — Preparation Corrections

Historical source/browser report for the 0.5.24 candidate. Final delivery is installed ROMDex 0.5.25, including the saved-map startup correction. [Completion and preservation record](MAPDex-0.5.25-Completion-Report.md).

Source sprite selection now previews immediately. Apply Thumbnail commits a choice; the shared Save Changes/export/handoff/quit path also preserves pending selections. A measured large-map checkpoint took about 34–40 seconds in the isolated test, so browsing frames no longer rewrites the RDX on every selection. Save state is explicit, and the selected source frame remains selected after saving.

The owner confirmed one character tile for linked placements. Display Cleanup → Character Identity in MAPDex and character Settings → Link Character Placements in NPCDex expose reviewed identity linking. Placement source records, locations, dialogue, notes, local pictures, mappings and history are retained; owned dialogue speaker references follow the shared identity. Original unused profiles remain preserved for history rather than silently deleted. Gender-specific identities need separate review.

Generated HGSS region names display Johto/Kanto; IDs and custom labels remain unchanged. Generated stage titles use map-local scene/dialogue context, Roman numerals, deterministic topic cues and expandable event/trigger evidence. Owner stage names/order remain intact. This is not a completed narrative-timeline extractor: chronology and complete conditional availability remain explicit RI03C acceptance work. No runtime AI or fabricated global timeline is introduced.

120 focused cases across seven relevant suites passed. The real cached 0.6.3 New Bark Town RDX passed immediate frame preview/save and two-Marill linking through the browser UI, retaining all 95 records. The linked RDX also passes portable recovery checks. No live YouTrack records were changed for this correction, and existing cloud transport evidence is reused alongside its focused regression suite. Native handoff, character settings, saved sprite, restart/quit and installer validation passed. The isolated process displayed one Marill tile with both source placements; no production import or live YouTrack records were needed. Final installation and preservation verification passed in 0.5.25; see the linked completion record.

[Workflow and limits](MAPDex-Preparation-and-Character-Identity.md) · [Source evidence](MAPDex-0.5.24-Source-Verification.json) · the Windows helper is retained locally under outputs/Documentation/History/MAPDex-0.5.24
