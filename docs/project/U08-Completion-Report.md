# U08 — Tool Switching and Preserved Workspace Context

**Completed:** October 15, 2026, under the task-specific PASSKEY. **Running build:** ROMDex 0.4.2, confirmed after the user's launcher restart.

## Result

The small red header button now switches between working ROMDex and NPCDex workspaces. The shared title identifies the active tool. Selecting a workspace closes the menu; ESC and clicks in either workspace dismiss it. No footer is allocated.

Both trusted first-party workspace documents remain mounted. Switching hides a view rather than navigating, reinitializing or serializing its editors. Selection, scope, expanded hierarchy, filters, scroll, pane layout, Details context, checkbox selection and unfinished text remain in their running view. Focus and input selection are restored. Native edit dialogs stay open within their workspace and keep unapplied form values. Switching does not apply, cancel, publish or save those drafts. A failed load retains the current view and supports retry.

ROMDex's existing YouTrack queue keeps running in its retained view. NPCDex uses the U07 control locations, the exact Standard Settings Icon and its existing manual local-save workflow. The header forwards manual Save to native tasks and an opened NPCDex workspace; Auto-Sync continues controlling the existing native queue and remains Off after a manual save. NPCDex's unsaved local content also lights the shared Save button red. The formal durable shared coordinator remains U09; NPCDex cloud synchronization remains later work. Tooltip/About/Connection text distinguishes these current capabilities.

## Current Data and Persistence

The NPCDex first-launch baseline is the exact latest saved export, revision **72**, captured from the authoritative Downloads package. [Adoption preview](U08-Data-Adoption-Preview.json) records its hash and counts. Every field is included, including stable IDs, images, annotations, preferences, requests, receipts and history. The generated embedded data was compared against the original parsed export with full deep equality.

NPCDex's integrated browser save uses a separate stable database, **ROMDex-NPCDex**, preserving the old standalone NPCDex database. Existing integrated saves take precedence on later launches. ROMDex retains its existing database/profile and remembered YouTrack connection. Workspace context preservation is within the running app; fresh ROMDex launch still selects All Tasks. U08 does not claim crash recovery for every uncommitted form, cross-computer view transfer or NPCDex cloud migration.

The original Downloads files, saved export, original 0.4.1 ZIP and installed 0.4.1 frontend remain unchanged. All 77 pre-U08 packaged files are preserved in **U08-Before**. The saved token's encrypted bytes remain unchanged; no token is embedded in the package. The release does contain private project/NPC content and is a local private deliverable.

## Verification

- **227 automated tests** passed.
- **15 focused workspace/browser checks** passed: scopes, comments/cursor, filters, multi-selection, scroll, pane expansion, both tools' modal drafts, menu dismissal, shared control routing and five viewport widths.
- The real packaged service passed isolated no-token startup, workspace-load failure/retry, repeated switching, fresh-launch behavior and content-policy checks. NPCDex's existing URL-image import works under the new policy, verified using an intercepted image fixture without an external download.
- **57 JavaScript/module syntax checks** and **84 ZIP-entry hashes** passed. Credentials/private runtime files are excluded.
- Live GET-only verification confirmed the running installation identity/build, remembered connection, unchanged credential ciphertext and **38 served assets** matching the release.

[UI verification](U08-UI-Verification.json), [service checks](U08-Service-Verification.json), [preservation checks](U08-Preservation-Verification.json), [live verification](U08-Live-Verification.json), [visual review](U08-Combined-Workspace-QA.png), [release manifest](ROMDex-v0.4.2-Manifest.json).

NPCDex's large inline application script was externalized into a local asset so script-src remains self-only. Only the two workspace pages allow same-origin framing; the shell disallows framing. The NPCDex page retains credential-free HTTP/HTTPS URL-image retrieval under its scoped policy. No arbitrary workspace URLs, cross-window command bridge or new filesystem privilege was added.

## Handoff

The active installation is **outputs/ROMDex-v0.4.2/ROMDex**. Use its Start-ROMDex.cmd for future launches; canonical source remains **outputs/ROMDex**, with the U07 NPCDex source copy at **outputs/NPCDex**. [Workspace guide](ROMDex-v0.4.2/ROMDex/U08-Workspace-Guide.md). No further restart is needed. This workspace has no Git repository; the verified release and manifest record the change set.

**Next: U09 — Shared Save and Auto-Sync Coordination, Sol / High.** Move ownership toward the approved shared durable/headless coordination model, retaining manual Save while Off and independent provider failures. U09 has not begun and requires a new PASSKEY. **U10F — Desktop File Drop Attachments** remains scheduled after U10.
