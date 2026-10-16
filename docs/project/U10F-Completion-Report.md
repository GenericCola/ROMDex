# U10F — Desktop File Drop Attachments

**Completed:** October 15, 2026, under the task-specific PASSKEY. **Build:** ROMDex 0.5.0-preview.10f, Electron 44.7.2, Windows x64.

## Result

Dragging disk files onto a Work Pane task row now attaches them to that ticket. The row highlights in blue, and feedback identifies the target. Drop handling preserves checkbox selection, Details layout, task order and parent relationships. Multiple checked items do not change the attachment destination. Internal single/bulk hierarchy dragging keeps its existing behavior.

The isolated preload resolves disk-backed File objects and passes only validated native selections to main/service. Generated browser Files and arbitrary path strings do not grant file access. The service checks regular files, destination existence, names, sizes and modification metadata, then calls the same attachment engine used by native file selection. No new uploader or queue was created. Paths do not appear in outgoing ticket/file metadata.

Existing limits remain **10 files per batch, 50 MB per file**. Folders, mixed text/file payloads, changed/missing files and invalid destinations are rejected. A failed preflight adds no partial batch. Accepted uploads retain their local bytes while paused/offline, support existing cancellation and previews, and use the normal manual/automatic synchronization paths. A concurrent local checkpoint waits for an in-progress attachment batch to finish acceptance.

## Verification

- **245 automated tests** passed with Electron's bundled Node 24.21.0. New checks cover drop validation, native-file preflight, original bytes, changed/oversized files and preload capability boundaries.
- **Nine isolated UI scenarios** passed: target highlighting, multiple files, selection/Details/order preservation, invalid destinations, cancellation, confirmed fixture delivery, previews, bulk dragging and parent/descendant relationships.
- **Eight service/restart scenarios** passed: paused/offline retention, no partial invalid batch, checkpoint coordination, source removal, process restart, exact-byte delivery and duplicate-safe replay through the existing controlled native adapter fixture.
- **Eight actual Electron scenarios** passed: disk-backed Files cross the task-frame/preload/main/utility boundary, bytes persist, generated Files are rejected, selections/layout remain stable, forced renderer reload recovers the queue after originals are removed, and normal cancellation cleans up the QA uploads.
- **73 script/module syntax checks** and **178 delivery-file hashes** passed. Delivery size: **396,133,417 bytes**, uncompressed folder.
- The previous **174-file U10 desktop**, **100-file protected source baseline**, **91-file 0.4.3 web release**, its ZIP and the remembered credential ciphertext remain unchanged. The live web service still reports 0.4.3 and its remembered connection. No production YouTrack writes or uploads were used for verification.

[UI checks](U10F-UI-Verification.json), [service/restart checks](U10F-Service-Verification.json), [Windows checks](U10F-Windows-Verification.json), [preservation](U10F-Preservation-Verification.json), [delivery manifest](U10F-Desktop-Manifest.json), [desktop target image](U10F-Desktop-File-Drop.png).

The desktop verification uses real disk-backed input Files transferred through DataTransfer and the actual preload, main and utility processes. The harness's normal small-file helper creates browser-only Files; the application correctly rejected those. Recovery verification temporarily removed unload guards in the QA renderer only to force a reload with a durable pending queue. Normal product guards remain unchanged. No additional application change or restart was needed for those harness adjustments.

## Data Authority and Delivery

**The user confirms the live web save is correct and the desktop baseline differs.** This is recorded in the action plan and decision log. U12 must preview and adopt the latest web save, recovery records, queued work/files and remembered connection, preserving both copies. Neither the desktop baseline nor a QA fixture may replace the live save automatically. U10F does not perform migration.

The new preview is **outputs/ROMDex-Desktop-U10F/ROMDex.exe**; [guide](ROMDex-Desktop-U10F/READ-ME-FIRST.md). The normal desktop profile remains outside program files at **%LOCALAPPDATA%/ROMDexDesktopData/preview-u10**. The verification launcher uses its own fixture-only profile. Continue using the web version for live work until U12. Previous builds remain available; there is no Git repository here, so the protected baseline, source, folder and manifest record the change set.

Tray lifecycle, profile/instance locking and supervised recovery remain U11; installation remains U13A; NPCDex cloud persistence remains U14–U19.

## Next Approval Boundary

**Next: UX01 — Application Command Placement Review, Sol / Medium.** Review homes for the commands removed from the header cog before implementing U11. A new PASSKEY is required. No UX01 or U11 work is included in U10F.
