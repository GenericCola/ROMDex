# U20I Native Content Compatibility Review

**Status:** Implementation and verification in progress. No live transition, release or installation has been accepted/completed. U21 remains blocked.

## Translation and Data Authority

The current NPCD records already contain the normalized content tree. U20I adds individually versioned presentation artifacts attached to the existing record issues, with a root artifact on the existing registry. This preserves aliases/floors, roster, display order, historical feedback bindings, images, configuration and unknown fields without inventing source facts or changing content revision IDs. No extra content tickets are needed for the initial display transition.

The translator reads the exact preserved original export once while preparing a preview. After the reviewed transition, the native projector reads records, assets and presentation artifacts; it does not read the original-export asset or migration index. Original bytes, identity mappings, prior revision pins and history remain retained for audit/recovery. Pre-transition ancestors remain readable through the historical projector.

New maps, sub-zones and entities can be imported without extending the original export. Canonical membership determines the tree; optional display metadata supplies presentation details. New maps follow canonical record order after the preserved original ordering, avoiding a full copy of the large historical root artifact on each import.

## Captured Real-Data Comparison

Offline comparison against the October 18 working capture includes **211 current records, 198 new presentation artifacts and 44 queued edits**. Both male and female projections match the prior familiar view by values, keys, order, dialogue whitespace, assets, history and decorated feedback. Current content revisions, proposals, reviews and source revisions are unchanged. Captured editor draft/journal bytes remain unchanged. The native projector succeeds while access to the preserved export asset is explicitly denied.

Evidence: `work/u20i/full-data-proof.json` and `outputs/U20I-Dependency-Inventory.json`. These are local captured-data checks, not proof of delivery of the user's pending work. Fresh capture and explicit acceptance are still required before real writes.

## Elm's Wife: Profile Versus Appearance

NPCD-45 is Elm's Wife's shared character profile. NPCD-128 is her local appearance in Elm's Lab (under NPCD-86), referencing that profile. The two titles resemble duplicates, but the records serve different roles. U20I preserves both identities and their relationship; no records were deleted or silently renamed. Instructions distinguish shared profiles, local appearances and unrelated characters using the same sprite.

## Import Review and Safety

Tray 2's existing cog opens Content Tools and Import Map Data. A fresh downloadable context supplies IDs and the exact working baseline. The typed JSON route previews new records and existing membership additions before explicit confirmation. Existing content, workspace metadata and legacy identities cannot be replaced through imports. Source evidence remains documented/unresolved; actual ROM verification is not inferred.

Checks cover stale/cross-workspace input, duplicate identities, parent and shared references, existing timeline, embedded legacy trees, mapping traversal, image signatures/dimensions/hashes, explicit approval, Auto-Sync Off, retry/reopen, lost publication responses and duplicate prevention. Independent imports retain their records through reviewed branch resolution. Conflicting metadata remains retained for review.

## Pending-Queue Performance

An isolated copy with 34 queued edits revealed that the old path rehydrated every full preview for each view request. Queue inspection now keeps previews as verified content-addressed references and loads the selected working snapshot only. Parsed JSON is bounded and memoized, while bytes are still hash-checked and callers receive independent values. On this copy, view time fell from roughly 11 seconds to roughly 0.94 seconds. These are local measurements, not a WAN throughput claim or proof that the live queue has synced.

## Remaining Acceptance

- Final regression/syntax and native-window review, including original editing controls and constrained dialog height.
- Isolated YouTrack import/publication/readback with marked synthetic content and no production migration.
- Fresh live-data transition preview, current-state recheck and explicit human acceptance.
- Full Data backup/restoration proof, credential preservation, verified package/install and installed native rendering/sync checks.

No actual ROM project/toolchain was supplied. The example is synthetic; agent instructions identify required extraction inputs and unsupported evidence. U21 task packaging/handoff is outside this authorization.

## Later Verification Evidence

The full 596-test run passed. Final focused checks passed 63 tests. `work/u20i/ui-acceptance.json` records native file selection/preview/confirmation/reopen with no tokens or network writes and unchanged original draft/accepted snapshot. `work/u20i/live-import.json` records real isolated NPCD publication/readback; `live-cleanup.json` confirms only marked synthetic issues were removed. The latest transition preview is in [Native Transition Preview](U20I-Native-Transition-Preview.md). It is not permission to write production metadata. The compatible 0.5.12 package and installed handoff are still being verified.

The original renderer functions now reside in a separate runtime file, extracted without changing their implementation. Normal native boot reads that runtime and the projected backend snapshot; it does not load the old monolithic `workspace.js`. The preserved original remains byte-identical. Reviewed concurrent imports under an existing map/sub-zone can combine append-only child memberships; conflicting non-membership values still require a choice from an observed branch. Neither branch's children are discarded. These checks establish the supported import/review path, not an unrestricted distributed transaction guarantee for every possible simultaneous identity creation.
