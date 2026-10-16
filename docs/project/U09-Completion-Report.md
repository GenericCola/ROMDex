# U09 — Shared Save and Auto-Sync Coordination

**Completed:** October 15, 2026, under the task-specific PASSKEY. **Running build:** ROMDex 0.4.3, confirmed after the user's launcher restart.

## Result

Save Changes now coordinates both workspaces through explicit providers, waits for their results, and reports failures independently. A YouTrack failure does not prevent NPCDex's local save workflow; an NPCDex destination problem does not block confirmed YouTrack changes. Repeated Save clicks share the same attempt. Manual Save while Auto-Sync is Off performs one cycle and leaves it Off.

The application shell owns one native task engine, queue and runtime clock. The retained task view uses that engine instead of creating another owner. The domain engine is separated from browser storage and timer adapters, with injectable dependencies and a tested Node disk adapter for the desktop phase. Incoming YouTrack changes continue to reach the engine while NPCDex is displayed, when Auto-Sync is enabled.

NPCDex now checkpoints accepted edits and notes locally, including while Auto-Sync is Off. Matching recovery copies restore as unsaved work after reload. Invalid or mismatched recovery records remain available for review; explicit acknowledgement preserves a held copy. Manual export waits for the file and browser save, and edits made during an export remain unsaved and recoverable. Unapplied modal forms remain preserved during workspace switching; checkpointing does not silently apply them.

Connection Details distinguishes YouTrack task synchronization from NPCDex's **local-only** capabilities. The removed header cog stays removed, and the corrected connection-light centering is preserved. Original Downloads files were not modified by this task; existing browser/profile data takes precedence over the packaged baseline.

## Verification

- **237 automated tests** passed, including headless disk/restart recovery, sync coalescing, independent provider failures, metadata persistence and unknown-format preservation.
- **14 focused browser checks** passed, covering one engine owner, attachments delivered once, hidden-workspace incoming updates, local recovery, export races, unavailable storage and retained editing context. No browser script errors.
- **63 script/module syntax checks**, **91 packaged-file/ZIP integrity checks**, and preservation checks for the **84-file baseline**, previous installation and earlier release ZIPs passed.
- The packaged service passed isolated startup and capability checks; **42 served assets** matched the release.
- After the user launched 0.4.3, live GET-only checks confirmed its installation/build, all 42 served assets, remembered connection, unchanged credential ciphertext and unchanged Auto-Sync setting. Verification made no production YouTrack writes.

[Browser evidence](U09-UI-Verification.json), [packaged-service checks](U09-Service-Verification.json), [preservation checks](U09-Preservation-Verification.json), [live verification](U09-Live-Verification.json), [release manifest](ROMDex-v0.4.3-Manifest.json).

## Delivery and Limits

The active installation is **outputs/ROMDex-v0.4.3/ROMDex**; canonical source remains **outputs/ROMDex**. [Save and Recovery Guide](ROMDex-v0.4.3/ROMDex/U09-Save-and-Recovery-Guide.md), [engine/provider contract](U09-Engine-and-Provider-Contract.md). No further restart is required. There is no Git repository in this workspace; the verified release and manifest record the change set.

This remains the browser-stage application. Closing the browser stops its runtime; Electron hosting and tray lifecycle remain U10/U11. One owner is enforced within the running application; cross-process locking remains U11. The Node disk adapter is verified but is not yet the live desktop profile. U12 must migrate the latest data, recovery records and credentials rather than an old packaged snapshot.

**NPCDex cloud synchronization is not implemented by U09.** U14 establishes private YouTrack storage; U15 previews/imports current data; U16–U17 implement durable two-way sync and conflict review; U18–U19 add ROMDex metadata and combined cloud controls. Local recovery is not a cloud backup.

## Next Approval Boundary

Phase 1 is complete. **Next: U10 — Native Desktop Window and Local Service, Sol / High.** Implement the approved Electron host and bundled runtime under a new PASSKEY. U10F file-drop attachments follows U10; UX01 command-placement review remains before U11. No U10 work is included in this task.
