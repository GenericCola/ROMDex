# RD05 — NPCDex Map Import and Update Preview

**Status: source-complete.** Authorized by the user's RD05 PASSKEY. The installed 0.5.14 app, current maps, live queues, connections and YouTrack records were not changed.

NPCDex now has a source implementation of Tray 2 settings → **Import RDX Map**, local document selection, update/conflict previews and **Export Current Map RDX**. It renders one-map inputs through the existing NPCDex interface and maps original inline notes, flags, change decisions, planned additions and documentation corrections into the managed document journal. The original imported file is preserved. [Usage and boundaries](../../apps/romdex/rdx/MAP-IMPORT.md).

Updates use stable identities and exact revision ancestry. Independent object-field changes merge; overlapping changes, concurrent drafts and shared-context changes require an observed choice. Both alternatives and original document bytes remain retained. Complete-snapshot omissions may become explicitly selected archival/REMOVE proposals when their coverage matches; partial omissions retain content. No current record is deleted as a side effect of omission.

The local adapter has no backend transport or credential capability. The existing connected NPCD view continues independently. Maps can be imported before any YouTrack setup and remain visibly local/unpublished. Switching documents preserves their draft/view state, and stale frames cannot write into another document. Export verifies the complete working checkpoint and downloaded bytes. Portable testing claims remain Unreviewed until an explicit local human review; their original historical data is retained.

## Verification

Passed **178 distinct focused/regression checks** across the relevant suites: 26 new map-import/workspace checks, 48 existing container checks, 31 managed-document checks and 73 existing editor/classic-feedback/native/catalog/desktop-policy checks. All 26 map checks also passed under bundled Electron in Node mode. Four edit/provenance cases were rechecked after the final evidence-retention adjustment, rather than repeating unrelated suites.

Seven isolated headless Chromium checks exercised the actual desktop-served NPCDex assets: empty/offline import, dependency preview, existing rendering, original inline note/flag editing, verified export with those edits, a 620-pixel-high update dialog with separate scrollable content/actions, and a shared-context conflict that blocks confirmation until explicitly chosen while retaining newer notes. No runtime errors occurred. This was browser rendering of desktop assets, not an installed native-window verification.

A separate disposable service smoke check exercised the actual desktop service routes, offline startup view, application Data root, checkpoint/shutdown and release of managed-store ownership. Syntax checks and source/mirror verification are recorded in [verification evidence](RD05-Verification.json). All QA used fictional data. No production save, remembered credential, cloud branch or live ticket was used or changed.

Review found and corrected an empty-workspace flush failure, image-ID duplication, loss of documentation-correction evidence, and imported legacy display metadata carrying verification claims. These paths now have focused coverage. Working-document ancestry records local edits; the adapter does not invent a YouTrack publication lineage for them.

## Limits and Next Task

This implementation is not installed or published. Existing production maps have not been replaced. Real RDX-to-YouTrack binding and bidirectional proof remain RD07, and fresh accepted production adoption remains RD10. Task-plan import is RD06; Windows association is RD08; returned agent-result application remains task-bound and separately gated. The user-facing editing interface is preserved.

Shared context that differs across two managed maps, record-kind/parent rebinding and unsupported display metadata are blocked with review/errors. They are not silently coerced. History retention remains bounded by the managed-store quota, without automatic compaction. Native installer/GUI acceptance and maximum-size memory behavior are not certified by these source checks.

**RD05 is checked off. Next: RD06 — ROMDex Plan Import and Destination Mapping. Use Sol / High and supply a new PASSKEY before that task begins.**
