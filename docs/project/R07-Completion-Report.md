# R07 — YouTrack Attachments and Previews

Completed October 14, 2026, under the user's R07 PASSKEY. R08 has not begun.

ROMDex now queues files for attachment to actual YouTrack tickets. A paperclip appears directly after the Notes paper icon, or after the name when there are no notes. Details offers Attach Files and a file list; Edit Item offers an Attachments button. Raster images have a pixel-art preview, and all supported-size files have original-byte download controls.

## Delivered Behavior

- PNG, JPEG, GIF, WebP and BMP previews preserve original data and use pixelated rendering. Other file types are downloaded without inline execution. The viewer keeps the original bytes available for Download Original while it remains open.
- File lists show names, sizes and queued/confirmed/review status. The attachment manager works without reopening collapsed Details. Notes and checkbox behavior also respects the existing name-only reopening rule.
- Users can choose up to 10 files at once, with a 50 MB ROMDex limit per file. Lower YouTrack site limits and permission failures retain the queued data for review/retry.
- Files first persist in a separate browser IndexedDB database, then stage with SHA-256 checksums in the existing private account profile's uploads directory. A service interruption retains browser data; a build replacement retains disk staging. New-item files wait until ticket creation supplies a real issue ID.
- Auto-Sync Off pauses native uploads. Local staging/cleanup can still run. Save Changes performs one upload/pull cycle without turning automatic sync back on.
- Confirmed uploads release staged bytes; their operation journal prevents duplicate replay. Lost responses are checked against newly appearing native attachments using exact file contents. Missing/ambiguous confirmation enters the existing review pane. Refresh Matching Files verifies candidates; native renames can be accepted through human review. Name-only matches never establish success.
- Cancelling queued uploads removes the pending operation and schedules durable local cleanup, including retry after service loss. Native attachments remain in place. Cancelling also records completion so stale windows cannot re-upload the cancelled operation. Deleting an item cancels its unsent attachments; an active upload must finish before deletion.
- Attachments added, removed or changed natively appear through normal incoming synchronization. Large attachment lists use paginated metadata rather than retaining only the nested issue projection's first page.
- File retrieval verifies both the issue and attachment. The permanent token and signed download URLs stay out of browser links and workspace metadata. Downloads do not follow unverified external hosts or execute active file formats.

## Verification

- **207 automated tests passed**, covering the existing hierarchy/editor/status/synchronization regressions and attachment staging, restart persistence, corruption detection, multipart bytes, issue creation/mapping, multiple paused files, manual sync, permission failures, native removal, exact-content recovery, ambiguous matches, native rename review, cancelled-upload cleanup and stale replay, and large metadata lists. Log: `R07-tests.log`.
- **48 module syntax checks passed** across public modules, tests, service, adapter, storage and recovery code.
- Focused isolated browser checks verified the Notes → paperclip → ID order; paperclip presence without notes; Details/Edit access; pending-file local preview; restored files after reopening the page; two-file manual upload while Off; queued-file cancellation; lost-response matching/commit without a second upload; name-only Details reopening; and a narrow layout without horizontal dialog overflow.
- Browser downloads of the image and text fixture files matched their original SHA-256 hashes. Images decoded at their original 32 × 32 dimensions and used pixelated rendering. No unexpected browser console warnings/errors were observed.
- The live service's installation/build IDs match the final installed files. Seventeen source/test/documentation files were installed and hash-checked; all eight changed public resources were compared against served bytes.
- Live read-only checks verified the actual PMON attachment-list route, local staging metadata route, remembered connection, Auto-Sync, and confirmed connection health. The final shared workspace contained **299 items**, **zero pending operations**, and no blocked action.
- PMON's attachment search currently returns no attached tickets. Therefore actual cloud upload/download and Add Attachment permission were **not verified using production files**. Those write/byte tests used the controlled provider; no production QA ticket/file was created or deleted.
- Source baseline: `R07-Before` (59 files). Original ZIPs, encrypted connection/profile, saved data, and protected U01 backups remain intact. This updates the running 0.3 installation; R08 will package the enhancement release.

## Review Images

These images show isolated fixture tickets.

![Attachment manager](R07-Attachments-QA.png)

![Original sprite preview](R07-Sprite-Preview-QA.png)

## Limits and Handoff

The local service must be available to stage disk copies, reach YouTrack or fetch uncached native file contents. Browser-only pending files must remain in the originating browser profile until staged. Preview/download is limited to 50 MB per file; larger existing files can be opened in YouTrack. Native attachment deletion and previews beyond raster images are outside R07. Attaching a file does not grant an agent new access; its YouTrack account must already have the required permissions.

Test downloads were created in Downloads as `Original Sprite.png`, `Original Sprite (1).png`, and `R07-Test-Instructions.txt`; these are fixture files, not application assets or user project data.

## API References

- [Multipart issue attachments and issue-creation ordering](https://www.jetbrains.com/help/youtrack/devportal/api-usecase-attach-files.html)
- [Attachment lists and signed download URLs](https://www.jetbrains.com/help/youtrack/devportal/api-usecase-download-issue-attachment.html)
- [Attachment metadata and removed/draft flags](https://www.jetbrains.com/help/youtrack/devportal/api-entity-IssueAttachment.html)
- [Attachment permissions and site limits](https://www.jetbrains.com/help/youtrack/cloud/add-an-attachment.html)

**Next:** R08 — Enhancement QA and Release, **Sol / High**. Await a new PASSKEY before starting it.
