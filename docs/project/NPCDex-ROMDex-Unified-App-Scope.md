# ROMDex — Desktop Application and NPCDex Add-on Scope

**Prepared:** October 14, 2026  
**Status:** Working scope. U01, R01–R08 and U02–U03 are complete; implementation and provisioning require later task-specific approvals. See the [Action Plan](NPCDex-ROMDex-Unified-App-Action-Plan.md), [U02 desktop design](U02-Desktop-Host-and-Distribution-Design.md) and [U03 YouTrack-first storage decision](U03-Free-Cloud-and-YouTrack-Storage-Comparison.md).

## Intended Outcome

A single Windows application named **ROMDex** hosts the ROMDex workflow and built-in add-ons such as **NPCDex** in its own window. The user can switch workspaces without losing their place or interrupting saves. Both use a consistent visual shell and shared settings. NPCDex gains cloud-backed saves and synchronization, while ROMDex continues using YouTrack. Approved NPCDex Change Requests can become new YouTrack tickets or be linked to existing tickets. Agents can return Integration Receipts through the connected system; matching receipts are reconciled automatically under an agreed policy, and others enter a human review queue.

Initial scope is the existing Pokémon workspace and PMON project. Windows, an installer and Start Menu shortcut are confirmed. Electron and the background service remain approved. The user's U13A clarification supersedes U02's Squirrel/separate-data choice: use a per-user Forge/WiX MSI and keep saves in the application's Data folder, retained on uninstall. Application updates notify and ask before downloading/installing; private test builds are unsigned, with signing reconsidered before wider distribution. U03 approved existing YouTrack-first workspace storage and private release delivery, with private GitHub Releases only as a conditional installer fallback. No payment method or usage billing may be enabled.

## Existing Assets and Baseline

The authoritative NPCDex working package is `C:/Users/mrgen/Downloads/npcdex-v2.42`, with saved revision **72** at the R08 checkpoint. The older development export at revision 64 is reference only. Its capabilities include stable record identities, change plans, request/baseline hashes, feedback, reversible history, implementation receipts and ROM reversal receipts. Its complete export carries the agent handoff contract. Preserve these foundations and refresh the current save before migration.

ROMDex **0.4.0** is the current verified baseline after R01–R08: 207 passing extracted-package tests, integrated UI and controlled native YouTrack two-way field/attachment/conflict checks, remembered-connection restart and verified packaging. The R08 checkpoint retains all 299 original issue IDs and saved data. See [R08 report](R08-Completion-Report.md). Current live data will be migrated separately from packaged source.

Implementation must start from the latest saved working data at that time. Reviewed source snapshots and old bundled exports are reference material; they must not overwrite newer user data.

## 1. Shared Application Shell and Tool Switching

Provide persistent NPCDex and ROMDex selectors within one application window. Each tool retains its own selected item, navigation trail, scroll position, filters, pane sizes, and unfinished edits when the user switches away and returns. Switching flushes edits to durable local storage and keeps synchronization running for both tools while the app is open.

Reconcile the headers around a shared layout: title area, decorative lamps, tool selector, Save Changes, synchronization controls, and settings. The user confirmed that the title displays the active tool's name and authorized planning a minor header redesign to accommodate switching and visual refinements. Review that layout before implementation. Preserve the shared visual standards for typography, colors, tray frames, indicator behavior, and Standard Settings Icon. Extract shared visual rules and assets so future changes do not make the two tools drift apart.

The user confirmed NPCDex's control locations: Data moves into the cog menu; Male/Female moves to the top of Tray 2 (Inventory Pane), immediately left of its cog button; Flags & Notes moves to the top of Tray 1 (vertical Selector Tray). Review precise spacing and alignment during the layout review. ROMDex retains its hierarchy, Work Tray, and Details Tray; NPCDex retains its location inventory, dialogue, and timeline views.

ROMDex's latest confirmed hierarchy is **Epic → Saga → Story → Verse → Task**. Existing Stories become Sagas, former Verses become Stories, direct children below former Verses become Verses, and deeper items remain Tasks, without inserting new parent issues. Tray 1 shows the first four tiers; only one Epic, Saga, and Story can be expanded at a time, and Verse cannot expand. Work Pane expansion remains unrestricted. R02 implements this baseline for the later unified application.

Confirmed shared save behavior: Save Changes covers pending work in both tools. Auto-Sync Data controls automatic synchronization across the application; manual Save performs one synchronization cycle even while automatic sync is Off, leaving Auto-Sync Off afterward. Status presentation must distinguish local persistence, cloud delivery, and reconciliation conflicts. A connection detail view identifies which service is unavailable when only one service has failed; the healthy service can continue syncing.

## 2. Standalone Desktop Launch and Distribution

Launch through an application executable or shortcut into an embedded Electron window. Routine use requires neither separately installed Chrome/Node nor a command window. Retain the HTML/CSS/JavaScript interfaces and the approved U02 host design.

The desktop app owns the local service lifecycle, file access, working profile, and orderly shutdown. Preserve the remembered YouTrack connection across builds and migration into the desktop package. Keep account credentials in protected local storage, separate from distributed application files.

Include version identification, upgrade behavior, diagnostic logs, and recovery from an interrupted launch or save. Separate installed application code from user data so replacing a build does not replace the working dataset.

The user selected a Windows installer and Start Menu shortcut, Notify and Ask application updates, and unsigned private tests. Reconsider publisher signing before wider distribution. Prefer private YouTrack installer delivery if actual size/limits permit; otherwise review the approved private GitHub Releases fallback at U13. Application updates and data synchronization remain separate responsibilities. Additional platforms are outside the initial scope.

## 3. NPCDex Cloud Data and Synchronization

Move NPCDex's primary working save from a browser/package-folder snapshot to a versioned **YouTrack-backed** workspace with a durable local cache. Start with the owner's account across computers; the user expects one person, possibly a second, ten at the extreme. Future member access requires explicit approval and does not imply a team-management UI or live cursors. Agent integrations receive separately limited access. Cover content, annotations, flags, decisions, instructions, proposals, current/historical images, source references, stable IDs, mappings, migrations, history and receipt records. Machine-specific credentials/window preferences stay local unless deliberately portable.

U03's first design to validate uses restricted container storage with immutable changes and compressed checkpoints, not one issue per edit or a single overwritten latest file. U04 must prove publication, discovery, two-writer reconciliation, retry and retention safety before migration. U14 checks actual instance plan/remaining space, permissions, visibility and upload limits; project-administration access is currently uncertain. A small server app remains optional if its need and permissions are established, not assumed. Storage stays separate from ordinary native task fields and out of task selectors/rollups/deletion controls.

Preserve complete JSON export/import as a backup and agent handoff option. Cloud saves should retain the ability to produce a self-contained export, including images and the current agent contract. Existing folder-based saves need a migration path and a retained original backup.

Edits save locally first, then synchronize automatically. Changes made from another device or an authorized integration appear in the app while synchronization is enabled. Offline edits remain queued and survive app closure, crashes, and updates. Reconnection reconciles incoming and outgoing changes before clearing the queue. Manual Save provides the existing one-time retry behavior.

Use revisions and the original values behind each edit to merge independent changes. Overlapping edits to the same content require review rather than silently overwriting either version. Apply incoming receipts and migrations as atomic revisions, and retain recoverable history. Multiple devices must not create duplicate records or apply one receipt twice.

YouTrack remains the authority for task fields. A cloud workspace holds NPCDex's structured dataset, with explicit links between the two. **The storage provider is undecided, and the user requires free hosting only:** using YouTrack for the complete dataset versus a dedicated cloud store needs assessment of revision handling, assets, conflicts, access, and free-plan limits. The proposal does not assume that ticket descriptions can safely serve as the entire NPCDex database.

The user confirmed that ROMDex workspace metadata (tile images, manual ordering, and parents' directly assigned statuses) will also synchronize across computers through the cloud workspace, with a durable local cache for offline use. This supersedes the earlier computer-only storage choice for assigned statuses. These values remain separate from YouTrack task fields, including the effective inherited State. Machine-specific credentials remain protected locally.

## 4. Change Requests ↔ YouTrack Tickets

From an eligible NPCDex Change Request, offer **Create Ticket** and **Link to Existing Ticket**. Here, linking means attaching the request to an existing issue; assigning an issue to a person or agent is a separate action.

At the user's request, defer the ticket-grouping and creation workflow decision until near implementation. Before that phase begins, walk through concrete user stories, use cases, and applications and obtain approval for the publishing design. Avoid a glut of automatically generated tickets; no automatic creation trigger or default grouping is selected by this proposal.

Carry the request's stable ID, approved instructions, intent, proposed content, source references, baseline, hashes, relevant feedback, and workspace identity. Maintain a durable request-to-issue mapping, with support for multiple related requests linked to one issue. Ticket creation and retries must not create duplicates. Linking to an existing issue must preserve its existing description, notes, and comments.

Only eligible approved requests can be handed off. Empty drafts, diagnostic notes alone, and unresolved decision conflicts remain excluded under NPCDex's existing request rules. Publishing a request version records precisely what the agent was asked to implement.

YouTrack comments, assignment, priority, and task progress should appear in the linked NPCDex view and remain visible through ROMDex. Define which fields are shared and how edits made natively in YouTrack return to NPCDex. If published instructions change, keep their version history and recompute the request version so an old receipt cannot reconcile a newer request accidentally.

Provide navigation from an NPCDex request to its linked ROMDex task and from the task back to its NPCDex context. Keep editorial decisions, task progress, and tester verification distinct: a completed ticket alone does not certify implemented dialogue or mark it tested.

## 5. Agent Handoff and Integration Receipt Return

Expose a documented, authenticated way for an agent to retrieve approved request packages and submit Integration Receipts. The transport can be a small service API or a defined YouTrack attachment workflow; this is an architecture decision. Preserve manual JSON export/import as a fallback.

Use “Integration Receipt” as the user-facing term while retaining compatibility with the existing `NPCDexImplementationReceipt/1` contract. Extend or version that contract only where necessary, for example to include workspace identity, YouTrack issue links, and published request versions.

A receipt must refer to actual completed ROM/source work, identify its request, and include the existing hashes and exact before/after patches. Receiving or applying a receipt updates NPCDex records; it does not itself edit the ROM. ROM hashes are reported implementation evidence, separate from NPCDex dataset hashes and tester verification.

Make receipt delivery durable, retryable, and traceable. A crash or repeated agent submission must not duplicate history or clear feedback twice. Agents need narrowly scoped access to approved requests and receipt submission; receipt delivery must not grant unrestricted editing of the dataset.

## 6. Automatic Reconciliation and Human Review

Confirmed policy: automatically apply a receipt only when it comes through the authorized delivery route, matches the workspace and an approved published request version, passes the existing schema/scope/hash checks, and still matches every affected current value. It must preserve stable identities and source evidence, explicitly identify resolved feedback, and not have been applied before. Validation and application must occur against the same revision so a concurrent edit cannot invalidate a previously checked receipt unnoticed.

If any entry is stale, ambiguous, conflicting, or otherwise fails validation, queue the complete receipt for human review without partially applying it. Show the requested change, agent-reported result, current NPCDex content, conflicting fields, and linked issue. Provide preview, defer, reject/request-correction, and an explicitly confirmed resolution path. Invalid data must not bypass validation through a general Apply button.

Successful reconciliation preserves existing NPCDex semantics: implemented UPDATE decisions become FINAL; affected testing becomes Unreviewed; only explicitly resolved matching feedback is cleared; removals are archived with IDs and evidence retained; and before/after history is recorded. Notify the user of applied or queued receipts in a review area with a visible pending count.

Retain undo and reversal tracking. Undoing NPCDex data does not reverse the real ROM. Where needed, stage the corresponding ROM reversal request, link it to YouTrack, and accept a reversal receipt through the same controlled return path.

Whether a linked ticket closes when implementation is reconciled or only after human retesting is an explicit workflow decision for the Action Plan. Automatic receipt reconciliation must not imply automatic tester approval.

## Deliverables and Acceptance

The agreed project should produce:

- One desktop application with persistent tool switching and consistent shared controls.
- A migration preserving current NPCDex/ROMDex data, images, IDs, histories, preferences, and the remembered YouTrack connection.
- NPCDex cloud saves, incoming/outgoing synchronization, offline persistence, conflicts, and portable exports.
- Durable Change Request/ticket links and documented shared-field behavior.
- Agent request retrieval and receipt return, automatic reconciliation for matching receipts, and human review for exceptions.
- A tested distribution package, upgrade/recovery instructions, and an updated agent integration contract.

Acceptance must demonstrate switching during edits, restart/update recovery, concurrent device edits, native YouTrack changes in both directions, repeated ticket/receipt retries, stale receipts, altered feedback, interrupted receipt application, undo/reversal handling, and preservation of the latest real working data. Test fixtures should establish failure behavior before controlled verification against the real workspace.

## Scope Boundaries

The first release targets one user's existing Pokémon workspace. Team permissions, simultaneous collaborative editing with live cursors, other issue trackers, mobile clients, additional operating systems, and a general-purpose multi-project platform are later extensions unless selected explicitly.

Direct ROM editing, launching coding agents automatically, and approving their work independently are separate features. This project supplies the handoff and return workflow; it preserves the distinction between requesting work, receiving implementation evidence, and testing the result.

## Decisions Needed Before the Action Plan Is Finalized

| Decision | What It Determines |
| --- | --- |
| Unified app name and tool selector placement | Application name **ROMDex** confirmed; NPCDex is an add-on. Active-tool header title retained. Exact switcher layout remains U05. |
| NPCDex control locations | Confirmed: Male/Female in Tray 2 left of cog; Flags & Notes at top of Tray 1; Data in cog menu. |
| Windows distribution method | Electron with per-user Forge/WiX MSI and Start Menu shortcut; retained application-folder Data, per the U13A clarification. Unsigned private tests; Notify and Ask application updates. Revisit signing before wider distribution. |
| NPCDex cloud provider and access model | Approved existing YouTrack-first restricted storage; owner first, possible future second user, ten at the extreme. No billing/payment method, no weekly-pause service. Actual configuration and concurrency proof remain U04/U14 gates; limited agent access remains separate. |
| ROMDex workspace metadata | Confirmed: tile images, manual order, and parents' directly assigned statuses sync through the cloud store, separately from YouTrack task fields. |
| Window Closing | Confirmed: close to Windows tray and continue enabled sync; explicit Quit stops the app. |
| Shared versus per-tool sync settings | Confirmed: shared Save and Auto-Sync for both tools; manual Save runs one cycle while Off; healthy services continue during partial failures. |
| Ticket/request structure and editable fields | Grouping and creation workflow deferred to a required user-story/design checkpoint near implementation; avoid automatic ticket glut. Shared editable-field behavior also needs definition. |
| Agent receipt delivery | Authenticated API versus a defined YouTrack-mediated return path. |
| Auto-reconciliation and ticket completion policy | Valid matching receipts auto-apply; exceptions enter human review. Ticket-completion policy remains open for the workflow design checkpoint. |
| ROMDex Baseline | Resolved: R08 is complete and release 0.4.0 is verified/running. Refresh live data at migration gates. |

The Action Plan records phases, sub-phases, tasks, dependencies, deliverables, model/effort recommendations and PASSKEY checkpoints. U13A/U13B remain separately approved. U03 selected YouTrack first for workspace storage and private release delivery, with a conditional private GitHub installer fallback. Next is U04, Astra / High. Implementation remains sequential under the user's approval process.


## U04 Contract Review

The [U04 contract](U04-Data-Ownership-and-Synchronization-Contracts.md) and its eventual-consistency/late-receipt-conflict behavior were explicitly user-approved October 15, 2026, following executable local model and compatibility checks. Immutable versions preserve competing branches; later conflicting offline edits trigger whole-receipt review. U04 is complete. Actual instance discovery/access and durability remain later implementation gates; no global lock, live migration, destructive retention or server app is implied. U05 requires a separate PASSKEY.


## U05 Review and Added Pre-U06 Side Task

The [header/control proposal](U05-Shared-Header-and-Control-Layout-Proposal.md) is awaiting user layout approval. Direct Switch and Compact Menu are proposed alternatives, not approved application changes. The user added S01 before U06: lighter/crisper paperclip, Delete for native ticket attachments, and All Tasks selected on fresh launch. S01 requires its own PASSKEY after U05; in-session switching/tray restore retains context. Existing data, credentials and the currently usable release remain preserved.


## U05 Revision — Footer Workspace Menu, October 15, 2026

The user rejected Direct Switch and Compact Menu and specified a small unlabeled red circular button at the bottom-left of the window, in the red shell footer. It opens a pop-up listing **ROMDex** and **NPCDex**; selection or ESC closes it. Preserve each workspace's selections/settings/view/navigation/drafts while switching. The user explicitly clarified **between workspaces in this app**, not across computers. No header switcher should be implemented. The [revised proposal](U05-Shared-Header-and-Control-Layout-Proposal.md) and [footer verification](U05-Footer-Layout-Verification.json) record this direction; [open-menu image](U05-Footer-Switch-Open.png). U05 remains in final visual review; no application change or S01/U06 work has begun. Next gated implementation remains **S01, Sol / High**, then **U06, Sol / Medium**, each with its own PASSKEY.


## U05 — Approved Development Placeholder and Circle Order, October 15, 2026

The user approved the small unlabeled red footer button as a **development placeholder** until a more permanent workspace switcher is reviewed. Its menu lists ROMDex/NPCDex, closes on selection/ESC, and retains each workspace's in-app context. The user also corrected the three static decorative circles beside the active title to **red → yellow → green**, left to right. U06 must implement and visually verify this order without changing task/save/connection indicator meaning or geometry. Earlier preview images show the superseded circle order. U05 is complete and checked off; see [approved proposal](U05-Shared-Header-and-Control-Layout-Proposal.md) and [report](U05-Review-Report.md). No application code or current data changed. Next: **S01 — Attachment Controls and Startup Scope, Sol / High**, awaiting its own PASSKEY; U06 follows under a separate PASSKEY, Sol / Medium.


## S01 — Completed in ROMDex 0.4.1, October 15, 2026

S01 was authorized with PASSKEY and completed before U06. The [0.4.1 patch report](S01-Completion-Report.md) records the lighter paperclip, safe native attachment Delete and All Tasks on fresh launch. Passed 227 tests, 52 syntax checks, 11 isolated browser checks, 70 ZIP-entry integrity checks and 28 served assets. The user switched to **outputs/ROMDex-v0.4.1/ROMDex**; running identity/build, remembered connection, unchanged credential ciphertext/Auto-Sync, real disposable-file deletion/replay/neighbor bytes and cleanup are verified. All original issue IDs remain; existing project attachments were not used for destructive QA. Canonical source is outputs/ROMDex, version 0.4.1; the previous 0.4 release/ZIP and protected U01/R08 backups remain intact. The footer switcher and decorative-circle correction remain U06. Next: **U06 — Shared Theme and Approved Header, Sol / Medium**, requiring a new PASSKEY; no U06 work has begun.


## U06 — Completed October 15, 2026; Header Placement Supersedes Footer

The user authorized U06 and moved the placeholder workspace switcher into the header, immediately left of the top-right controls, at 80% of their height. This supersedes all earlier footer-only instructions and illustrations; no footer space is reserved. U06 is complete in **0.4.1 + U06**: shared theme/header/assets, red → yellow → green decorative lamps, connection-light access and capability-gated settings. Verified 227 tests, 319 syntax checks, 20 focused/regression browser checks, original brand/Save geometry and 7 live-served assets. Credentials, Auto-Sync, NPCDex files, protected baseline and original ZIP remain preserved; no production YouTrack writes. [Completion report](U06-Completion-Report.md), [patch manifest](U06-Patch-Manifest.json). NPCDex is listed but disabled until U08 supplies its workspace. Next: **U07 — Relocate NPCDex Controls, Sol / Medium**, under a new PASSKEY.


## U07 — Completed October 15, 2026; File Drop Scheduled

U07's PASSKEY authorized NPCDex control relocation. Flags & Notes is above Tray 1 selectors; Male/Female is immediately left of the Inventory cog in Tray 2; Data opens from Inventory Settings. The working source is **outputs/NPCDex**, staged for U08 integration. All 12 focused browser/preservation checks and 8 syntax checks passed; original Downloads files, current saved export and ROMDex credentials/installation remain unchanged. Current saved revision 72 was used only in isolated before/after QA; the packaged dataset remains untouched. [Report](U07-Completion-Report.md).

The user requested Explorer/desktop file drops onto tickets, permitting deferral to avoid duplication. Schedule **U10F — Desktop File Drop Attachments, Sol / High**, immediately after U10's native host/file adapters and before U11. Reuse existing attachment queue and validation; preserve hierarchy dragging. [Feature scope](Desktop-File-Drop-Attachments-Plan.md). Separate PASSKEY required.

Next: **U08 — Tool Switching and Preserved Workspace Context, Sol / High**, awaiting its own PASSKEY.


## U08 — Completed October 15, 2026; Combined Browser Build 0.4.2

The authorized task connected ROMDex and NPCDex through the red header menu. Separate retained documents preserve scopes, filters, scroll, checkbox selection, pane layout, cursor positions, unfinished text and open modal forms. Workspace switches do not commit drafts. NPCDex's embedded first-launch baseline exactly matches the current saved revision 72; the old standalone database, Downloads package and exported save remain preserved. A distinct integrated NPCDex browser database avoids silently adopting an unrelated old-origin save.

The user launched **outputs/ROMDex-v0.4.2/ROMDex** and live GET-only verification confirmed version/build/installation identity, remembered YouTrack connection, unchanged credential ciphertext and 38 served assets. Passed 227 automated tests, 15 browser checks, 57 syntax checks, real-service content-policy/failure/retry/image-import checks and 84 package hashes. [Completion report](U08-Completion-Report.md), [live record](U08-Live-Verification.json).

The header temporarily forwards existing manual save actions; NPCDex remains manual/local and its cloud connection is not claimed. U09 supplies the formal shared durable/headless coordinator. **Next: U09 — Shared Save and Auto-Sync Coordination, Sol / High**, under a new PASSKEY. U10F file-drop attachments remains after U10, before U11.


## H01 — Header Correction, October 15, 2026

The user directly requested removing the application header cog, documenting its commands for later placement, and correcting the connection light. Implemented in **0.4.2 + H01**: no cog/menu or reserved space, Save/connection shifted right 36 px, actual light/ring centered by eliminating a 3.25 px text-baseline displacement. Six focused browser checks passed; changed assets were verified from the running service. Refresh only; no restart or token entry. [Report](Header-Correction-Report.md), [command inventory](Deferred-Application-Commands.md), [patch overlay](Header-Correction-Patch-Manifest.json).

This supersedes prior header-cog placement instructions. Connection Details remains on the light; no substitute home has been chosen for the other commands. **UX01 — Application Command Placement Review, Sol / Medium**, is pending before U11. U09 remains pending under a separate PASSKEY, Sol / High.


## U09 — Completed October 15, 2026; Combined Build 0.4.3

U09 was individually authorized and is complete. Shared Save coordinates both providers, coalesces repeated attempts and retains independent failure results; manual Save while Off leaves Auto-Sync Off. The shell owns one native engine/queue/clock. The engine and coordinator have injectable storage/runtime boundaries, with Node disk/restart tests preparing U10. NPCDex accepted edits/notes gain local recovery checkpoints, including while Auto-Sync is Off; export races preserve newer edits and mismatched copies remain available for review. Unapplied modal forms are not silently committed.

Passed **237 automated tests, 14 focused browser checks, 63 syntax checks and 91 package integrity checks**. The user launched **outputs/ROMDex-v0.4.3/ROMDex**; live GET-only verification confirmed build/installation identity, 42 served assets, remembered connection, unchanged credential ciphertext and Auto-Sync. Protected baselines, prior installation/ZIPs and H01's header correction remain preserved. No production YouTrack writes were made by verification. [Completion report](U09-Completion-Report.md), [live evidence](U09-Live-Verification.json), [provider contract](U09-Engine-and-Provider-Contract.md).

**NPCDex remains local-only; cloud persistence is U14–U19.** U14 storage, U15 current-data import and U16–U17 durable two-way sync/conflicts precede U18–U19 metadata/shared cloud controls. Browser closure still stops the runtime; Electron and tray behavior remain U10/U11. U12 must migrate latest working data and recovery records, never replace them with an older embedded baseline.

Phase 1 is complete. **Next: U10 — Native Desktop Window and Local Service, Sol / High**, requiring a new PASSKEY. U10F file-drop attachments follows U10; UX01 command placement remains before U11. No U10 implementation has begun.


## U10 — Completed October 15, 2026; Native Desktop Preview

The task-specific PASSKEY authorized U10. **ROMDex 0.5.0-preview.10** now includes the Windows x64 Electron 44.7.2 runtime, a sandboxed custom-protocol window, finite validated bridge, utility-owned native queue/clock and durable stores, native attachment selection and NPCDex export adapters. Retained first-party documents preserve the existing editing/context interfaces inside the native window; the [host contract](U10-Host-and-Bridge-Contract.md) records this container choice. The desktop does not open the browser HTTP listener.

The user launched the packaged preview normally. A custom-protocol registration on the wrong Electron session was corrected before successful graphical acceptance. Passed **240 tests under bundled Node 24.21.0, seven service/restart checks, nine desktop-facade checks, 14 browser regressions, eleven actual Electron checks, 70 syntax checks and 174 delivery hashes**. Automatic native fixture updates arrived through the utility clock while NPCDex was active. Native NPCDex export/reload, shared manual Save while Off, sandbox/bridge restrictions and the existing header correction passed. [Completion report](U10-Completion-Report.md), [Windows evidence](U10-Windows-Verification.json), [preservation](U10-Preservation-Verification.json).

Delivery: **outputs/ROMDex-Desktop-U10/ROMDex.exe**. This is an independent development preview; continue using **0.4.3** for the live project until U12. No browser saves, remembered credentials or original NPCDex files were migrated/overwritten. The 91-file old installation/checkpoint, ZIP and credential ciphertext are verified unchanged. The fixture-only verification session made no production YouTrack writes. Normal preview data lives outside program files, under ROMDexDesktopData/preview-u10.

U10 is complete; tray lifecycle, profile locking and supervised recovery remain U11, current-data handoff U12, installer U13A and NPCDex cloud U14–U19. **Next: U10F — Desktop File Drop Attachments, Sol / High**, requiring a new PASSKEY. UX01 command placement still precedes U11. No U10F work is included here.


## U10F — Completed October 15, 2026; File Drops and Web-Data Authority

The task-specific PASSKEY authorized desktop file drops. **0.5.0-preview.10f** highlights the pointed Work Pane row and attaches disk files through the isolated preload and existing native queue. The drop does not open Details, alter checkbox selection, or move tasks. Existing limits, paused/offline storage, cancellation, previews and duplicate-safe delivery remain in use. Unsupported/changed file batches add no partial attachments, and original source paths are not stored in outgoing ticket metadata.

Passed **245 tests, nine UI scenarios, eight service/restart scenarios, eight actual Electron checks, 73 syntax checks and 178 delivery hashes**. File bytes survive source removal and reload/process restart. Internal bulk moves and parent/descendant relationships passed. The old U10 desktop, protected source, 0.4.3 web release/ZIP and credential ciphertext remain unchanged; verification made no production YouTrack writes. [Report](U10F-Completion-Report.md), [Windows evidence](U10F-Windows-Verification.json), [preservation](U10F-Preservation-Verification.json).

The user explicitly confirms **the live web save is authoritative; the desktop baseline differs**. Preserve both. U12 must preview and migrate the latest web state, recovery records, queues/files and remembered connection; no packaged desktop baseline or QA fixture may replace it. No migration was performed in U10F. Continue using the live web release until that gate. Delivery: **outputs/ROMDex-Desktop-U10F/ROMDex.exe**; preview profile identity remains unchanged.

**Next: UX01 — Application Command Placement Review, Sol / Medium**, requiring a new PASSKEY before U11. U11/U12/installer/cloud gates remain unchanged. No UX01 work is included here.
