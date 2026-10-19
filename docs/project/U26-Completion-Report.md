# U26 — Human Review and Controlled Resolution

**Completed in source:** October 19, 2026. Installed ROMDex remains **0.5.15**. No installer, production migration or live-save change was performed.

## What Changed

Map Package Delivery now provides a Returned File review with packaged-original, current and returned values; changed read context; long-value viewing; group completeness; archival candidates; and durable review history. Users can defer, reject or retry a return/group without deleting either version.

The user chose to include **explicit reviewed overwrite**. After confirmation, a complete valid group can replace its requested fields against the newly reviewed current baseline. Unrelated newer fields and drafts remain. A newer baseline invalidates approval. An existing preauthorization return needs current package authorization plus explicit group approval; wrong identity, altered assets, missing attribution, out-of-scope writes and incomplete groups cannot be overridden.

Decisions use private metadata v4, preserving compatibility with v1/v2/v3. Conflicting decisions or rejection racing acceptance enter review; independent groups can merge. A private acceptance must reference the exact reviewed decision. Confirmations detect newly synchronized acceptance even without a local application intent. Accepted or uncertain work cannot be dismissed or reversed through Reject. Interrupted local retry effects resume from the committed decision, and replaced unaccepted attempts retain their evidence.

Every accepted result still needs human testing and leaves the task open. U27 status, readiness notifications, reversal and verification-gated completion remain pending. The original editing controls and tile/settings design are unchanged.

## Verification

- **348 affected regression tests passed**, covering the review/application/native-storage/metadata/package/discovery/lifecycle paths.
- **37 focused recovery rechecks passed** after the final retry-recovery changes, plus **two final private-acceptance pin checks**. These overlap the regression run; the counts must not be added as unique tests.
- **13 focused source UI checks passed** in headless Chromium, including three-way values, explicit long-value reads, rejection/manual-processing holds, cancellation, complete-group overwrite, task-open/Unreviewed/Auto-Sync-Off preservation and layout at 620 pixels.
- **Five source-service checks passed**, including review/full-value routing, stale-context rejection, no-network paused startup and lifecycle drain/checkpoint/shutdown.
- Native publication/readback and crash recovery used the original ContentEditor/Reader, NativeCatalog, DocumentCloud, managed SQLite and private-metadata synchronization classes with isolated synthetic transports. No new remote endpoint or credential route was introduced, so U25's actual Windows/YouTrack transport proof was not redundantly repeated. U26 made no live YouTrack writes and no production metadata-v4 publication.

See [verification evidence](U26-Verification.json), [implementation checklist](U26-Implementation-Checklist.md), and the [review/storage guide](../../apps/romdex/rdx/RETURN-REVIEW.md). Private source-backup identity is recorded separately after publication.

## Remaining Work

Oversized/unsupported previews and hard validation failures remain held. Accepted delivery that later conflicts must use the original provider's recovery/review or a subsequent package; rejecting a return is not reversal. All new functionality awaits the planned packaged release.

The user's newly reported annotation issues are next as **U26A — NPCDex Annotation and Settings Corrections, Sol / High**: persistent red critical-flag icons in New Bark Town; unchecked Selected Line Only still behaving as line-scoped; the redundant Add Note box at the bottom of Tray 2; and an empty Content Controls menu with broken Close/Escape handling that must include the selector-scoped Data/Flags summary. Preserve actual notes/flags and restore original scope behavior. See [issue intake](U26A-Annotation-Issue-Intake.md). U27 follows afterward. A new PASSKEY is required before U26A.
