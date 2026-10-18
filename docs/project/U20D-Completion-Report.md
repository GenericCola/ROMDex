# U20D — Planning, Corrections and Safe Publication

**Date:** October 17, 2026 (America/New_York; evidence timestamps use UTC). **Status:** complete. **Installed application:** ROMDex 0.5.7, unchanged. **Next:** U20E — Scale Checks and Previewed Content Migration, **Sol / High**, new PASSKEY required.

The isolated content backend now supports editable proposals, proposed dialogue/pictures, notes/testing, shared profiles, local and player-gender overrides, Planned Additions and explicit documentation corrections. A durable journal publishes them to YouTrack and recovers interrupted issue, parent-link and attachment responses. The familiar NPCDex preview has editing and recovery controls; unfinished drafts and their original baselines survive closing/reopening the form.

**Your installed app and existing GitHub-backed NPCDex remain authoritative.** No real saves were migrated, no production provider was switched and no installer update is needed. No PMON task was created/modified, no agent was dispatched and no actual ROM file was changed. This phase's YouTrack records are synthetic test data only.

## Resulting Behavior

- Plans, notes and testing remain separate from current content. A Ready proposal needs instructions and a concrete scoped change; it is not execution authorization. Required pictures and older draft baselines survive subsequent edits.
- Add Character creates a Planned Addition and complete parent membership, optionally reusing a shared character profile. It never activates the character as implemented. A removal proposal leaves existing content visible. Planned records may be archived; archived Planned Additions cannot be activated through a documentation correction.
- Documentation Correction requires explicit intent, reason and evidence. It preserves identities, mapping and compatibility data. Shared-profile corrections acknowledge their shared scope and invalidate affected appearance/scene testing without losing the original observations or newer plans. Local overrides remain local.
- Offline edits are journaled before network requests. A changed remote baseline holds the original intent for review. Uncertain accepted issue/upload/link responses are rediscovered against exact identities/bytes; missing responses are not blindly retried. The review pane permits an explicit reviewed retry when necessary.
- Competing publication branches retain their histories and require explicit choices for current content. Concurrent versions of one plan/note remain visible review conditions after that join; saving a reviewed draft covers all observed heads. A later unknown branch is not silently included in an earlier decision.
- Auto-Sync Off performs no automatic remote reads/writes. Manual Save runs one bounded incoming/outgoing cycle and leaves Off in place. The preview distinguishes clean disconnection from undeliverable local edits and shows pending work truthfully.

## Verification

**501 automated tests passed**, including **34 new U20D checks**. They cover offline/restart delivery, current/proposed separation, lifecycle guards, shared/local identity, picture bounds and retention, stale UI/draft versions, journal commit failure, lost creation/upload/manifest/link responses, concurrent publications/drafts, explicit review, replay and connection-state semantics. Independent PowerShell schema validation accepted 24 artifacts and rejected four invalid artifacts; the accepted U20A schema remains byte-identical.

The focused browser checks verified draft restoration, one-time sync while Off, required correction evidence, a local documentation correction and visibly Planned Additions. A long status caption found during visual inspection was moved clear of the controls. The final [isolated preview](U20D-Editor-Preview.png) was inspected; temporary browser tabs were closed.

Real Windows checks reused the protected credential and actual runtime modules against marked private NPCD fixtures. Four operations were queued; the harness deliberately discarded one successful server upload response. A **different Windows process** recovered the exact accepted attachment, committed all four operations and verified replay without duplicate uploads. Original dialogue stayed unchanged, all proposals/notes survived, a shared-profile correction applied and additions stayed Planned. A subsequent shared-profile appearance verified the durable parent-link intent.

The final fixture check initially expected three profiles instead of the correct four after the earlier new-character operation. Its corrected rerun reused the exact existing operation and records, rather than creating another appearance. The diagnostic attempt and successful final readback are retained separately. This was a harness assertion error after successful publication, not an application-data rollback or extra user launch.

Cleanup removed only this run's **15** pinned, marked issues after checking ownership, visibility, comments, links and attachments; each was verified absent. NPCD returned to **0** visible issues and PMON remained at **299**, with **zero PMON writes**. Fixture numbers remain consumed by YouTrack. Successful live stages verified all three protected credential files unchanged. All **248 installed application files** still match the prior verified 0.5.7 release. Live saves were not frozen for comparison; normal use could continue throughout.

## Practical Limits and Next Gate

The full live proof performs many defensive API reads and took several minutes. It establishes recovery and integrity, not production-scale throughput. **U20E must begin with latency, reconstruction, cache/journal retention and full-data scale checks before any migration preview or source switch.** Current bounds include 512 KiB image/chunk uploads, 1 MiB edit requests, bounded image dimensions, a 200-operation retained journal, 1,000 publications, 64 MiB reconstruction budgets and a 256 MiB cache payload limit. No automatic remote-history pruning is enabled. The configured YouTrack upload ceiling and remaining capacity are still unknown.

Native edits outside the structured workflow are held as visible discrepancies; arbitrary prose does not replace current content. Complete native-edit adoption, legacy identity/history projection and installed acceptance remain U20E/U20F work. Actual agent identity/permissions and implementation-result acceptance remain U23–U25; human testing still controls completion.

Source, synthetic fixtures, sanitized evidence and development helpers are archived in the private development repository. Current Data, protected Windows sessions, credentials and private signing keys are excluded. See [technical editing guide](ROMDex/content/EDITING.md), [verification summary](U20D-Verification.json) and [task checklist](U20D-Action-Plan.md).
