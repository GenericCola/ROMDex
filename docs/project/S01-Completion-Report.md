# S01 — Attachment Controls and Startup Scope

**Authorization:** user's S01 PASSKEY, October 15, 2026.  
**Release:** ROMDex 0.4.1. **Status:** complete and checked off. The user launched 0.4.1; running-build, connection and controlled native checks passed.

## Delivered

- Lightened the paperclip to a one-unit stroke, the Notes icon's 12 × 14 px footprint and its muted color. Its position after Notes is unchanged.
- Added Delete for existing ticket attachments in the shared attachment lists, including Details and the attachment manager reached from Edit Item. Confirmation identifies the filename and ticket. The ticket and other files are retained.
- Attachment deletion is a durable operation: Auto-Sync Off leaves it queued; Save Changes processes it once while remaining Off. Pending files stay visible until removal is confirmed. Queued uploads retain Cancel Upload, while native files offer Cancel Deletion while queued.
- Native metadata changes require cancellation/review and renewed confirmation. Scoped stable-ID deletion, journal target binding and absence checks recover interrupted responses without deleting a similarly named neighbor. Durable cancellation prevents stale-window replay. Cancelling a retry does not undo an already-completed native deletion.
- Confirmed removal refreshes lists/counts/paperclips even when a following snapshot fails, and closes a stale raster preview. Incoming native removals also refresh the preview/list.
- All Tasks is selected on fresh launch, overriding the saved selector scope while retaining issue data, expansion, ordering/images, completed filter and pane layout. Ordinary navigation/rerenders retain the selected scope. The later desktop host must apply this on cold launch, preserving context when switching tools or restoring the running tray instance.

The footer workspace button and decorative circle order red → yellow → green remain **U06**. They were not implemented in S01.

## Verification

- **227 automated tests passed**, zero failures/skips; includes 20 new service/client/HTTP regression cases. Final log: `work/s01/tests.log`. The first full run used Windows' restricted temporary directory; the verified run used isolated scratch storage in the workspace.
- **52 module syntax checks** passed in the packaged release.
- **11 isolated browser checks** passed, including default/reload scope, retained in-session scope, paperclip dimensions, native preview removal, cancelled confirmation, queued/cancelled deletion, manual Save while Off, neighboring-file retention, final-paperclip removal and Details refresh. No page errors or production connection was used for these checks. [UI evidence](S01-Attachment-Delete-QA.png).
- Verified all **70 allowlisted ZIP entries** by hash/size and all **28 public assets** through an isolated no-token service started from the new package. No private profile/token/upload directory was included. [Manifest](ROMDex-v0.4.1-Manifest.json).
- Preserved the old 0.4 ZIP and installed release hashes. `S01-Before` retains 69 verified baseline files; protected U01/R08 backups remain unchanged. Remembered credentials are checked by ciphertext hash, never decrypted by QA helpers.

[Live verification](S01-Live-Verification.json) confirms the correct 0.4.1 installation/service build, all 28 served assets, remembered connection and unchanged credential ciphertext/Auto-Sync setting. A marked disposable QA ticket held two new test files: targeted deletion succeeded, repeating the same operation preserved the other attachment, and its original bytes matched. The last test file and QA ticket were then removed after identity/relationship checks. All 299 original issue IDs remain; the final item count is 299. No existing production attachment was deleted.

## Package and Recovery

[0.4.1 ZIP](ROMDex-v0.4.1.zip) · [Launcher](ROMDex-v0.4.1/ROMDex/Start-ROMDex.cmd) · [Upgrade/Recovery](ROMDex-v0.4.1/ROMDex/UPGRADE-AND-RECOVERY.md)

Use the new 0.4.1 folder with the existing Windows-account profile/browser origin; the token is not embedded in the build. Keep old releases, but reconcile/cancel pending new attachment operations before rolling back. Never restore an older journal/workspace over current work automatically. There is no Git repository; this is a separately packaged and backed-up change set, not a claimed Git commit.

Native REST metadata preflight is optimistic, not an atomic edit lock. A native change can still race between its check and DELETE. Large-file preview limits remain separate from deletion. Offline deletion/cancellation is a queued intent; completed remote removal cannot be undone by cancelling its retry.

Official API contract: [Delete an Issue Attachment](https://www.jetbrains.com/help/youtrack/devportal/api-usecase-delete-issue-attachment.html), [Attachment Operations and Permissions](https://www.jetbrains.com/help/youtrack/devportal/operations-api-issues-issueID-attachments.html).

## Next Approval Boundary

S01 is complete and checked off. Stop at this approval boundary. Next: **U06 — Shared Theme and Approved Header**, recommended **Sol / Medium**, requiring a separate PASSKEY.
