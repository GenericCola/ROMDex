# U10F — Desktop File Drop Attachments

Requested and scheduled during U07 on October 15, 2026. Implementation is deferred to the Windows desktop phase, immediately after U10's native host/file adapters and before U11. It requires its own PASSKEY. Recommended model/effort: **Sol / High**.

Dragging one or more files from Windows File Explorer or the desktop onto a Work Pane item attaches them to that ticket. Highlight the destination row while hovering and identify the ticket in upload feedback. Dropping files must not reorder an item, open Details, or navigate the app to the dropped file.

Reuse the R07/S01 attachment validation, durable upload queue, progress/error reporting, previews, paperclip refresh and native YouTrack delivery. Auto-Sync Off retains staged uploads until manual Save or resumed automatic sync; normal transient failures retain recoverable work. Do not introduce a second uploader or store machine-specific filesystem paths in YouTrack.

The native host owns permission/bridge boundaries. Handle external file drags separately from internal hierarchy/bulk drags. Reject unsupported payloads, invalid/oversized files and drops outside a valid ticket without losing existing work. Verify multiple files, ambiguous/error cases, offline/restart recovery, queued cancellation and confirmed native attachments. Children and bulk hierarchy dragging must retain their current behavior.

Doing this after U10 permits one implementation against the real desktop runtime and native file contract. No interim browser-only drop interface is being added in U07. Existing attachment buttons remain available.
