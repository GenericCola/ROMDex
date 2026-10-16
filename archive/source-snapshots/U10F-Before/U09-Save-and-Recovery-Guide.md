# ROMDex 0.4.3 — Shared Save and Local Recovery

Save Changes now uses one application coordinator for both tools. It waits for each provider's result, combines repeated clicks into the same attempt, and lets one provider finish even when the other fails. A manual save while Auto-Sync is Off leaves it Off.

YouTrack tasks use one application-owned queue. The task view displays and edits that queue; switching views does not create or restart it. Incoming native YouTrack changes continue reaching the queue while NPCDex is active. Attachments use their existing durable storage and operation IDs.

NPCDex still uses manual local exports. Its accepted workspace edits also receive local browser recovery checkpoints, including while Auto-Sync is Off. A matching checkpoint can restore unsaved content after reload. It does not mark the content as exported or delivered to the cloud, so Save stays red until the required export succeeds.

Use Inventory Settings → Data to choose the NPCDex save folder. Unchanged NPCDex content does not ask for a new export destination on every shared Save. Edits made during an ongoing export remain pending and receive another checkpoint; that export cannot mark newer edits as saved.

If a recovery copy does not match the known local save, NPCDex keeps both and pauses its manual export for review. Data shows Local Recovery Copy. Download it to inspect it; use the existing Import NPCDex JSON action if it should become the working copy, then choose Use Current Workspace to acknowledge the choice. The original recovery record is retained in browser storage. This is local recovery, separate from the later cloud conflict workflow.

Checkpoints preserve accepted NPCDex model changes and notes flushed into that model. Unapplied settings/edit forms remain in their retained view during workspace switching; this release does not claim to recover every unapplied form after the whole application closes. Finish or cancel those forms before restarting.

Click the connection light to see separate YouTrack Tasks and NPCDex statuses. NPCDex is explicitly Local Only; no NPCDex cloud upload occurs in this release. The formal cloud phase is U14–U19. Auto-Sync currently controls native YouTrack transfers; local recovery writes continue while it is Off.

This browser build owns the engine in the application shell. The queue engine and coordinator can run without a browser using injected storage/transport/runtime adapters. The later Electron host will move that lifecycle into its utility process. Desktop tray operation and global single-instance/profile ownership are U10–U11 work.

For later migration, preserve the native workspace/files databases, ROMDex-NPCDex snapshots (including recovery-draft and held-recovery), coordinator metadata, private server workspace/journal/uploads and the encrypted connection. U12 must capture the latest data rather than rely on an old release's embedded baseline.
