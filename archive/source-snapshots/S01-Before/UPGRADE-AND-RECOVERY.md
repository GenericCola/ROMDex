# ROMDex 0.4.0 — Upgrade and Recovery

## Upgrade on This Computer

1. Finish active field/note edits. Save Changes and resolve any conflicts. Queued files can survive a restart, but keep their originating browser profile until they have been staged or uploaded.
2. Extract ROMDex-v0.4.zip into a new folder. Keep the previous application folder and ZIP as recovery material.
3. Double-click the new folder's ROMDex/Start-ROMDex.cmd. The launcher checks the build, stops an earlier service when necessary, and reuses the shared Windows-account profile. If a stale service remains, use its Stop-ROMDex.cmd, then start 0.4 again.
4. Use the same local address and browser profile: http://127.0.0.1:4322. Close older ROMDex tabs after saving their work, so their old interface does not keep running beside the new build.
5. Confirm Connection, Auto-Sync, task counts, selectors, images/order, and pending work. A remembered connection should not ask for its token again. The original seed is used only when no established workspace exists.

Node.js 22 or newer is required. This release still launches the local service and browser; it is the baseline for the separately approved unified desktop app work.

## Data That Must Be Preserved

The shared profile is `%LOCALAPPDATA%/ROMDex/thegobindsingh-PMON`. It includes the encrypted connection, profile marker, workspace backup, retained parent assignments, sync settings, operation journal, and queued upload bytes/metadata in `uploads`.

The browser's `romdex-v1` IndexedDB database holds its workspace/pending operations. `romdex-files-v1` holds queued file bytes. Local-storage preferences include automatic sync. The service's workspace backup follows browser commits and can lag an active in-memory edit. Do not clear browser data while files or operations remain pending.

The package excludes the private profile, current workspace backup, encrypted credentials, upload queue, logs and temporary QA files. Its seed is the original prototype import, not an export of the latest private workspace. Treat any current-data backup as private.

The remembered token is encrypted for the original Windows account. Copying its ciphertext to a different account/computer does not establish a usable connection. On a different computer, connect with that account's own token; future cloud synchronization is separate work.

## Interrupted Sync or Upload

- Keep the browser profile and shared profile. Reopen ROMDex, check the connection, then use Save Changes.
- Auto-Sync Off intentionally leaves remote edits/uploads queued. Manual Save runs once and leaves the setting Off.
- Same-field conflicts keep both versions for review. Native edits to other fields are retained.
- An uncertain upload compares exact file contents before retrying. Use Refresh Matching Files, choose an existing match, or confirm a retry after review. Cancelling unsent work does not remove a native file already present.
- Do not delete the operation journal or replay an old one. It records confirmed actions and prevents duplicate tickets, comments, moves and attachments.

## Restore or Roll Back

1. Save/record the current state and take a fresh protected checkpoint first. A historical backup must not replace newer data automatically.
2. Stop ROMDex and close its tabs before restoring profile files. Test a copied profile with `ROMDEX_DATA_DIR` and a separate `ROMDEX_PORT` first; that override is isolated and does not import the normal profile.
3. Compare the restored data with current YouTrack. Restoring local files does not undo cloud edits or changes to the ROM itself. Resolve queued actions before adopting a restored profile.
4. Keep the profile and pending-upload directory together with their matching journal/workspace. Restore the encrypted token only as ciphertext under the same Windows account.
5. Prefer testing the verified 0.4 package over starting an older interface against a newer queue. Versions before attachment support cannot stage browser-only files. Do not downgrade with pending work.

Historical U01 backups remain immutable. The R08 checkpoint records this release/current saved data; refresh the checkpoint again before the later desktop/cloud migrations. Unsaved browser-only NPCDex edits are not captured by filesystem backups.
