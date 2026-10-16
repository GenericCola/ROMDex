# U11 — Tray Lifecycle and Orderly Quit

Completed October 15, 2026 as **ROMDex 0.5.0-preview.11** under the task-specific PASSKEY. The user also authorized the original Pokédex favicon artwork as the app icon. Recommended model/effort: Sol / High. No later phase was implemented.

## Result

The approved Windows tray menu provides Show ROMDex, workspace selection, shared Save Changes and Auto-Sync Data, Connection Details, About ROMDex and explicit Quit. Closing the window or Alt+F4 hides the retained documents to the tray; opening the app again restores the existing window. The first close records a one-time explanation. No header or footer controls were added, and update checks remain U13B.

Enabled YouTrack synchronization continues through the utility clock while hidden. Auto-Sync Off remains Off, including after a one-time manual Save and suspend/resume. Native fixture changes were observed while the window was hidden. NPCDex still has local saves and recovery; cloud persistence remains U14–U19.

Explicit Quit flushes accepted local edits, files and recovery records before stopping the utility and releasing profile ownership. A remote save does not disable Quit or need to succeed first. Unfinished forms, rename/group editors, unposted comments or active local file staging return the window for review instead of being silently submitted/discarded. Closing to the tray preserves these editors.

Electron's single-instance handling restores the existing window. A separate profile lease refuses overlapping owners, including a live orphan utility, and reclaims dead ownership. Interrupted RPCs are rejected for review, never automatically replayed. Utility recovery is bounded and reloads accepted durable work. Older desktop builds must be quit before launching a normal U11 preview because they do not participate in the new lock.

Renderer crashes also reload from durable state while the same utility continues running. Automatic retries are bounded; the tray icon can retry opening the workspace. Quit can checkpoint accepted work even if the renderer remains unavailable. Form input that was never accepted is not guaranteed to survive a renderer crash.

The original **public/icon.svg** was rasterized into eight Windows ICO sizes and used for the window and tray. The same icon frames are embedded in ROMDex.exe and verified directly from its Windows resources. This preserves the original artwork rather than introducing a replacement drawing.

## Validation and Limits

- **258 automated tests** pass with the bundled Electron/Node runtime, including ownership, local-save failure/retry, renderer/utility recovery, interrupted calls, menu state and shutdown ordering.
- **Six service/restart scenarios** preserve paused status, pending notes, staged bytes and NPCDex recovery, without opening an HTTP listener or using production YouTrack.
- **Twelve desktop scenarios** exercised the final packaged Windows app: tray commands, shared Save while Off, Connection/About, close/restore, retained search/workspace context, a real second launch, hidden incoming changes, forced utility interruption, forced renderer crash, suspend/resume, unfinished-comment protection and orderly Quit. The crash retained the same main and utility PIDs, pending operations and paused setting. Final Quit checks confirmed both processes stopped, the lease was released, and the pending edit remained durable. [Desktop evidence](U11-Desktop-Verification.json).
- Harness limitations are recorded in that evidence: earlier exit checks hit a dialog/close-notification issue, and Playwright failed on the intentional Chromium crash. The final resumed pass detached browser testing during the crash, verified recovery through the main inspector, reconnected, and completed the remaining assertions and bounded PID/disk shutdown checks. These were fixture-only checks; no production writes occurred.
- Final review includes a guard against refreshing a destroyed tray after successful exit. All 258 tests and the final native scenarios cover the final source, which is hash-matched to delivery.
- **76 syntax checks**, **184 delivery-file hashes**, and **eight embedded icon frames** verified. The private build contains packaged project baselines and remains unsigned; no installer or update publication was created.

[Manifest](U11-Desktop-Manifest.json), [service evidence](U11-Service-Verification.json), [icon evidence](U11-Icon-Verification.json), [preservation evidence](U11-Preservation-Verification.json).

## Data and Delivery

Delivery: **outputs/ROMDex-Desktop-U11/ROMDex.exe**. [Usage guide](ROMDex-Desktop-U11/READ-ME-FIRST.md). Normal preview data remains outside application files under ROMDexDesktopData/preview-u10. The verification launcher uses a separate fixture-only profile with loopback debugging; normal launches do not enable those endpoints. The verification window exited during the Quit test.

The prior 178-file U10F desktop, 104-file protected baseline, 91-file live web release and ZIP, and remembered credential ciphertext are unchanged. No production writes or data migration occurred. **Continue live work in browser ROMDex 0.4.3; its latest save is authoritative.** U12 must capture and preview that current state before adoption, never replace it with this desktop's older baseline.

**Next: U12 — Current Saves and Remembered Connection Migration. Recommended Sol / High. A new PASSKEY is required.**
