# U07 — Relocate NPCDex Controls

Completed October 15, 2026 under its task-specific PASSKEY.

## Delivered

- Flags & Notes is beneath the Maps heading in Tray 1, above its selectors.
- Male/Female is in the Inventory header in Tray 2, immediately left of its settings cog. The group keeps its accessible player-character name.
- Data is inside Inventory Settings and opens the existing Content & Saving interface. Inventory Settings closes first so the dialogs do not stack.
- Inventory Settings retains Sort by Sub-Area and uses the exact approved Standard Settings Icon: 12 px artwork centered in an 18 px circular frame. Decorative title circles agree with U06: red → yellow → green.

Existing control IDs, gender handling, annotation flushing, imports, exports, receipt workflow, history, save destination and local persistence are retained. This task changes their access points and related layout; it does not migrate data or enable cloud saves.

## Verification

All **12 focused browser/preservation checks** passed, with **8 script syntax checks** including the assembled application. Checked keyboard activation, flags/history, gender preference, grouping, Data capabilities, first-save flow, exact SVG bytes/centering and five widths. No browser script errors. The 84 px header and desktop tray allocation remain intact. Isolated before/after builds hydrated current saved revision 72 identically.

[Verification](U07-Verification.json), [visual review](U07-Controls-QA.png), [change manifest](U07-Change-Manifest.json).

## Delivery and Data Boundary

The canonical NPCDex integration working copy is **outputs/NPCDex**. It is staged for U08, which connects it to the ROMDex workspace host. No refresh/restart or separate NPCDex launch is needed for U07; the running ROMDex frontend remains U06.

The Downloads package is unchanged. All 39 original package files were copied into **U07-Before** and hash-verified. The saved export, data JSON and every non-UI module in the working copy remain byte-identical. ROMDex's installed U06 patch and remembered credential ciphertext are unchanged; no production YouTrack writes or browser save writes occurred.

The original packaged dataset is revision 64; the authoritative saved export is revision 72. U07 deliberately preserves both. The current saved export was used in isolated QA, not silently promoted into a new live save. U08 must refresh the latest saved content before adoption and preserve newer work. See [integration notes](NPCDex/ROMDex-Integration.md). No Git repository is present, so this is a recorded change set rather than a Git commit.

## New Feature Scheduled

**U10F — Desktop File Drop Attachments**, Sol / High, is added after U10 and before U11. External Explorer/desktop files dropped on a Work Pane ticket will use the existing attachment validation, durable upload queue and native YouTrack delivery. The task will distinguish external files from hierarchy drags and verify offline/Auto-Sync Off, multiple files, recovery and validation. [Scope](Desktop-File-Drop-Attachments-Plan.md). It requires its own PASSKEY; no interim drop implementation was added here.

**Next: U08 — Tool Switching and Preserved Workspace Context, Sol / High.** It remains pending and requires a new PASSKEY.
