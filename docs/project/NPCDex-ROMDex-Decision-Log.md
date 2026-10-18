# NPCDex + ROMDex — Scope Decisions

Started October 14, 2026. This records the discussion before the phased Action Plan. It does not authorize implementation.

## Current Design Checkpoint — October 17, 2026

**U20D is complete.** Isolated planning/correction editing, durable issue/upload/link intents, concurrent publication/draft review and current/proposed separation passed 501 tests and Windows/YouTrack recovery checks. [Report](U20D-Completion-Report.md). All 15 fixtures were removed; installed 0.5.7 and GitHub-backed saves remain authoritative. **Next: U20E — Scale Checks and Previewed Content Migration, Sol / High; new PASSKEY required.** No migration has begun.

The U20D PASSKEY authorized this isolated implementation. Live proof showed that full defensive reconstruction currently takes several minutes; U20E must prove scale/retention and acceptable latency before migration preview/acceptance. Native-edit adoption and installed acceptance remain later gates. Earlier checkpoint entries below are historical.

The user approved the [U20 content-registry and revised workflow baseline](U20-Consolidated-Architecture-and-Revised-Plan.md). Permanent content is planned for a separate YouTrack project; actionable work remains PMON. NPCDex stages only; fixed map documents attach by explicit choice, direct versioned backend updates preserve newer drafts, and testing remains human-controlled. Explicit documentation corrections retain history without requesting ROM work.

The user authorized **U20A** with PASSKEY and subsequently selected **“Approve U20A Contracts.”** Its [record/mapping contracts, examples and extraction guide](U20A-Review-Report.md) are accepted with 45 passing isolated model/legacy checks. No content project, access change, live upload, migration, application update or actual ROM edit occurred in U20A. The user's subsequent **PASSKEY** authorizes **U20B — Sol / High**. Earlier entries below remain historical decisions and completed milestones.

U20B initially established **HTTP 403** for project creation on October 16. The instance owner subsequently created **NPCD / 0-2**, retaining their leader role and granting GenericCola direct Project Admin access. On October 17 the private fixture transfer/link/concurrent-append/restart proof passed; all four QA issues were deleted and all three credentials preserved. **U20B is complete.** [Carrier, evidence and limits](U20B-Completion-Report.md): signed download URLs must not be exported, configured quota remains unknown, and actual authenticated agent grants remain U23. No provider switch, live save import, ROM edit or app update occurred. **Next: U20C, Sol / High, new PASSKEY required.**

**U20C is complete** after isolated dynamic reader/cache/projection implementation, 467 tests and live YouTrack attachment/restart/cleanup proof. [Report and limits](U20C-Completion-Report.md). Installed 0.5.7 and the existing GitHub-backed NPCDex remain authoritative. **Next: U20D — Backend Planning and Documentation Corrections, Sol / High; new PASSKEY required.**

U20C was separately authorized by PASSKEY. Its preview uses owner-authored synthetic content only; no live source switch, production import, settings change or agent execution was performed. Native description/comment discrepancies are reviewed alongside title/hierarchy changes. Backend editing remains U20D, previewed real-data migration U20E and installed acceptance U20F.

## Additional Feature Requests — October 15, 2026; Planning Only

The user requested map-level NPCDex Change Requests as easy-to-map JSON attachments on YouTrack tickets, with instructions requiring an agent Integration Receipt, automatic receipt retrieval/reconciliation and visible updates in NPCDex. This extends the existing **U20–U27** workflow rather than creating a competing pipeline. U20 reviews package content, mapping and ticket selection; U21 implements the approved attachments and embedded instructions/receipt format; U23 confirms agent access and return transport; U24 automatically retrieves receipts; U25–U27 preserve validated automatic application, exception review and recovery. Existing receipt contracts, stable identities, publication/base evidence and the approved later-offline-conflict policy remain authoritative. Ticket grouping/creation is still a required discussion; adding map packages does not authorize automatic ticket creation.

The user also requested ROMDex push notifications when an agent creates a ticket, comments or sends a message, and allowed development after principal work. Added **Phase 7 after U30**: **U31 — Notification Sources and Delivery Review (Sol / Medium)**, **U32 — Durable Agent Activity Retrieval (Sol / High)** and **U33 — Windows Notifications and Activity Access (Sol / High)**. U31 must resolve agent identification, message channels, relevance, preferences, Auto-Sync interaction and background/offline/fully-quit expectations before implementation. No external messaging service or always-on push mechanism is selected by this planning entry.

The action plan and checklist contain these additions. Application source, installed build, live saves and credentials are unchanged. **Next remains U14 — Private YouTrack Storage and Access Rules, Sol / High**, requiring a separate PASSKEY.

## Confirmed Foundation

**U14 completed — hybrid storage approved:** after read-only access checks and the GitHub comparison, the user explicitly accepted bulk saves on private GitHub provided all agent-required material lives on YouTrack and the NPCDex → Ticket → Agent → Ticket → NPCDex workflow remains intact. Use a separate owner-controlled **ROMDex-Data** repository for NPCDex saves/assets/history and substantive ROMDex metadata; keep development/releases in ROMDex. YouTrack retains native tasks and self-contained agent handoffs, required images/context and receipts. Do not grant agents full save-repository access or rely on private GitHub links as required handoff dependencies. This supersedes U03/U04's YouTrack save-container transport choice, preserving their domain validation, durability, offline-base, whole-receipt conflict, history and recovery requirements. Provisioning/synthetic access and concurrency proof belong to U14; separately scoped runtime write credentials must not replace the existing read-only update token. U14 setup and verification are complete; U15's actual-data import still needs a new PASSKEY and preview acceptance.

- Combine NPCDex and ROMDex into one application with at-will switching.
- Use an application window rather than Chrome for routine use.
- Reconcile shared headers and find approved homes for NPCDex's existing controls.
- Add cloud persistence and synchronization for NPCDex.
- Link approved Change Requests to new or existing YouTrack tickets.
- Receive Integration Receipts and either reconcile validated matching receipts or queue human review.
- ROMDex R08 is complete. Its 0.4.0 ZIP, QA report and protected current-data checkpoint form the current baseline; the 0.3 record below is historical.

Windows first is confirmed. The existing Pokémon/PMON workspace remains the initial working scope. U02 approved Electron/Forge/Squirrel, ROMDex branding, unsigned private tests and Notify and Ask application updates. U03 approved existing YouTrack-first storage and private installer delivery, with private GitHub Releases as a conditional fallback; no payment method/usage billing or weekly-pause service. See the latest entries below.

## Discussion Order

1. Window closing and background synchronization.
2. Tool switching, application title, and shared/header-specific controls.
3. Desktop distribution and platform scope.
4. NPCDex cloud storage, account access, and synchronization settings.
5. Request-to-ticket links, fields, and native YouTrack edits.
6. Agent handoff/receipt transport and access.
7. Automatic reconciliation, review, and ticket completion policy.
8. Confirm the consolidated decisions and produce phases, sub-phases, tasks, dependencies and PASSKEY checkpoints.

## Decision 1 — Window Closing

**Confirmed by the user:** closing the window leaves the application in the Windows system tray so both tools can continue syncing. An explicit Quit command stops the application. Auto-Sync Off still pauses synchronization.

This choice affects application lifecycle and the background synchronization design. Either option must persist edits before closing and recover queued work after restart. Background operation still requires the computer to be running, network access, and Auto-Sync enabled.


## Decision 2 — Shared Header Title and Switching

**Confirmed by the user:** display NPCDex or ROMDex according to the active tool. Include a minor header redesign during development to accommodate switching and make minor visual improvements. The exact switcher design and control geometry remain part of a layout review before implementation; a two-button switcher is a proposal, not a confirmed design. The launcher/application name can be chosen separately.

## Decision 3 — NPCDex Header Control Locations

**Confirmed by the user:** move Data into the cog menu. Place the Male/Female toggle at the top of Tray 2 (Inventory Pane), immediately to the left of the cog button. Place Flags & Notes at the top of Tray 1 (vertical Selector Tray). Review exact spacing and alignment alongside the shared-header layout. Save and synchronization scope remain a separate decision.

## Decision 4 — Save and Auto-Sync Scope

**Confirmed by the user:** shared Save Changes processes pending work in both tools, and one Auto-Sync toggle controls both. Manual Save performs a one-time synchronization when Auto-Sync is Off without enabling automatic synchronization. A service failure does not stop the other healthy service; connection details identify the affected service.

## Decision 5 — Initial Desktop Distribution

**Confirmed by the user:** Windows first with an installer and Start Menu shortcut, keeping application files separate from user data and protected credentials. Code signing, automatic application updates, and desktop host technology remain separate architecture/distribution decisions.

## Decision 6 — Cloud Workspace Access

**Confirmed by the user:** the first release serves only the owner's account across computers. Other human users and team permissions are outside the initial scope. Agent request retrieval and receipt delivery use separately limited integration access. Cloud provider, hosting cost, and authentication design will follow these access requirements.

## Decision 7 — Cloud Hosting Budget

**Confirmed by the user:** free hosting only; no recurring hosting charge is authorized. Compare free options and their fit before proposing a provider. Retain local backups and complete exports independently of the selected provider.

## Decision 8 — ROMDex Workspace Metadata Across Computers

**Confirmed by the user:** include ROMDex tile images, manual ordering, and parents' directly assigned statuses in the new cloud workspace so they follow the owner across computers. This explicitly supersedes the earlier computer-only storage choice for assigned statuses; they remain separate from YouTrack task fields. YouTrack continues to hold the effective inherited State and other existing synchronized task fields. Retain a durable local cache for offline use. Machine-specific credentials remain protected locally.

## Decision 9 — Change Request to Ticket Structure

**Deferred at the user's request:** revisit ticket structure near implementation through concrete user stories, use cases, and applications. The user wants to avoid a glut of automatically generated tickets. Neither one-request-per-ticket nor grouped-ticket defaults are selected, and no automatic ticket-generation behavior is assumed. Add a required discovery and approval checkpoint before implementing ticket publishing, covering selection, grouping/linking, creation triggers, preview, and duplicate prevention. Preserve individual request identities and published versions regardless of the later decision.

## Decision 10 — Receipt Reconciliation Policy

**Confirmed by the user:** automatically reconcile receipts only when they pass all authorization, workspace, published-version, schema, scope, current-value, feedback, and duplicate checks; otherwise queue the complete receipt for human review. Reconciliation updates NPCDex records and history; it does not edit the actual ROM or certify tester approval.

## Action Plan Draft

The phased draft is recorded in `NPCDex-ROMDex-Unified-App-Action-Plan.md`. It contains research/design gates for unresolved technical choices and a required user-story checkpoint before ticket publishing. Drafting the plan does not authorize implementation. Each task still requires its own PASSKEY, completion report, and reminder of the next task's recommended model/effort before requesting approval.

## New ROMDex Enhancement Requests — October 14

The user supplied eight UI/feature changes: full item Edit menu with Assignee/Due Date, issue attachments and paperclip, automatic Details reopening, TAB pane cycling with nesting precedence, ClickUp-like rows and multi-selection/grouping/drag, removal of tile picture frames, exclusive three-tier selector expansion, and Add Item/completed-filter toolbar changes.

`ROMDex-Pre-Launcher-Enhancement-Plan.md` packages them as R01–R08 with model recommendations and acceptance checks. The user confirmed the context-sensitive TAB routing, same-immediate-parent restriction for initial grouping/bulk dragging, and removal of the entire tile picture area while preserving saved images in Tile Settings. Recommended: inventory/back up through U01, then implement individually approved enhancements before unified interface/launcher work. No implementation is authorized. The existing three-tier selector limit is already present and must be preserved; Assignee/Due Date writes and binary attachment support need adapter changes.

## U01 Completion — October 14

The user authorized checklist creation and the first task with PASSKEY. U01 is complete; see `U01-Baseline-Inventory.md` and `NPCDex-ROMDex-Action-Checklist.md`. The user identified Downloads/npcdex-v2.42 as the saved working package. Its export is revision 72; development revision 64 must not overwrite it. Restricted backups and hash/JSON/release verification are complete. Next is R01 (Sol / Medium), awaiting a new PASSKEY; no enhancement implementation has begun.

## R01 Completion — October 14

The user authorized the next task with PASSKEY. R01 implemented automatic Details reopening, context-sensitive TAB cycling, and inline-name nesting/outdenting, with 127 passing tests and isolated browser verification. Default cycling restores the original default split; item reopening preserves the saved divider position. The running 0.3 installation has the verified frontend patch; original ZIP/backups and protected connection are preserved. See `R01-Completion-Report.md`. R02 is next (Sol / Medium), awaiting a new PASSKEY.

## R02 Completion and Saga Addition — October 14

R02 was authorized with PASSKEY. During implementation, the user added Saga between Epic and Story and confirmed the depth mapping: existing Stories become Sagas, Verses become Stories, children one level below former Verses become Verses, and deeper items remain Tasks. Parent links remain intact. Compact tiles remove picture areas but preserve images in settings; Tray 1 shows four tiers and permits only one expanded Epic/Saga/Story path, with Verse non-expandable. 140 tests and focused fixture/live-delivery checks passed. See `R02-Completion-Report.md`. R03 is next (Sol / Medium), awaiting its own PASSKEY.

## R03 — Completed October 14, 2026

R03 was authorized with PASSKEY and extended by the user to include ESC behavior and In Development. ESC clears Work selection/editing focus while retaining selector scope; with no selection or field focus it toggles Details Collapsed ↔ Default. Notes and in-session unsent comment drafts survive selection clearing. The final status order is Untouched → In Progress → Standby → In Development → Complete → Critical. In Progress means preparation underway; Standby means ready for development. In Development flashes purple and overrides inherited statuses except Critical/red. The native unresolved In Development State was added to PMON through the existing idempotent preparation flow after the user restarted the service. Saved credentials remain intact; connection is healthy. Passed 149 tests, 31 syntax checks, isolated desktop/narrow browser checks, and eight served-file comparisons. See R03-Completion-Report.md. R04 is next, Sol / High, awaiting a new PASSKEY.

## R04 — Completed October 14, 2026

R04 delivered the fixed 48 px grab/checkbox gutter, indented triangle/status/name controls and session-only checkbox selection. Checkbox clicks toggle membership; Ctrl adds/removes individual items; Shift replaces selection with a visible anchored range; Ctrl+Shift adds that range. Scope changes clear selection, while filtering, collapse and missing/native-deleted rows prune it. Multiple selection displays “Multiple Items are Selected.” and ESC clears it without resetting scope. Row/Notes clicks return to individual Details. Editors are saved before transitions, valid inline names are committed, and unfinished nonblank drafts are protected. Passed 156 tests, 33 syntax checks and focused isolated UI checks; running frontend files verified with the saved connection intact. See R04-Completion-Report.md. R05 remains unapproved; recommended Sol / Extra High.

## R05 — Completed October 14, 2026

The user corrected the Details opening rule: checkboxes preserve pane size and only names reopen a collapsed pane; background clicks do not open it, and Notes can update content without reopening. R05 added named TAB grouping and same-parent bulk dragging with subtree preservation, which the user explicitly reinforced. New parents occupy the first selected sibling position; descendants keep their actual parent links. Local staging is atomic, native preflight checks shared parents, and durable groups expose partial progress/review. Uncertain creation uses acknowledgement rather than blind duplicate creation; cancellation preserves confirmed moves and unrelated later notes. Large queues are batched, with local parent-chain validation optimized after a 1,000-item check. Passed 170 tests, 36 syntax checks, isolated browser grouping/drag and final running-build/connection/HTTP verification. See R05-Completion-Report.md. R06 remains unapproved; recommended Sol / High.

## R06 — Scope Expansion, October 14, 2026

During the authorized R06 task, the user requested all other YouTrack-editable fields that lack Work Pane list controls. They explicitly confirmed ticket tags as well. R06 now covers all editable PMON custom fields plus assigning/removing existing accessible tags. Values and field types are read from the actual project; calculated Spent Time remains informational because YouTrack edits it through work logs. Changes are independently reconciled per field. R07 attachments remain a separate approval boundary.

## R06 — Completed October 14, 2026

Implemented the full Edit Item dialog with all editable PMON custom fields, eligible assignees, date-only due dates, existing tags, and notes/instructions. Added typed/native validation, independent field conflicts and nullable baselines, refreshed/cached choices, and partial-tag recovery. Preserved parent assigned/effective status separation, inline double-click rename, normal form Tab, and name-only Details reopening; F2 offers another quick rename route. Live metadata revealed a Spent Time identity variation, corrected and regression-tested before completion. Passed 184 tests, 42 syntax checks and focused isolated desktop/narrow browser checks. Final installed/running identities and served files match; actual PMON metadata, saved connection, Auto-Sync and final read-only Spent Time were verified without production test writes. See R06-Completion-Report.md. R07 is next, Sol / High, awaiting its own PASSKEY.

## R07 — Completed October 14, 2026

Implemented ticket attachments with Details/Edit access and a paperclip after Notes, pixel-art raster previews and original downloads. Added separate IndexedDB file storage and private shared-profile staging, new-ticket ordering, paused/manual upload behavior, exact-content uncertain recovery, native-rename review, cancelled-upload cleanup and stale replay protection. Preserved name-only Details reopening. Passed 207 tests, 48 syntax checks and isolated browser upload/reload/manual-save/review/download and narrow-layout checks. Final installed/running identity, eight served resources, native attachment-list access and remembered connection/Auto-Sync are verified; the workspace contains 299 items with no pending actions. PMON currently has no attached tickets, so production upload/download and Add Attachment permission remain unverified; write/byte tests used a controlled provider. See R07-Completion-Report.md. Next is R08, Sol / High, awaiting its own PASSKEY.


## R08 — Release Completed, October 14, 2026

ROMDex 0.4.0 is the verified enhancement baseline. Passed 207 extracted-package tests, 51 module syntax checks, launcher parsing, combined isolated browser checks and controlled real YouTrack two-way field/file/conflict/subtree verification. Four marked QA tickets were cleaned; all 299 original issue IDs remain. The user launched the new folder: expected running installation/build and all 28 public asset hashes match, saved credential ciphertext is unchanged, connection/Auto-Sync are healthy, and no pending or blocked work remains. The 69-file ZIP/manifest and protected 47-file saved-data checkpoint are verified, including NPCDex revision 72. See [R08 Completion Report](R08-Completion-Report.md) and [Baseline Update](R08-Baseline-Update.md). No U02 work has begun. Next: **U02 — Desktop Host and Distribution Design, Sol / High**, requiring a new PASSKEY.


## U02 — Approved and Completed, October 14, 2026

The user authorized U02 with PASSKEY and explicitly approved the concrete Electron/Forge/Squirrel proposal. The application is named **ROMDex**, with NPCDex as a built-in add-on; the active-tool header behavior remains unchanged. The user selected **Notify Me and Ask Before Updating** and **unsigned private test builds**, with signing reconsidered before wider distribution. The approved design uses an application-owned background save/sync service, scoped tool views, a validated native bridge and persistent data outside the installation directory. U03 now also compares trusted release-index/installer hosting, privacy and bandwidth separately from workspace storage. U13 is split into U13A (installer/preservation, Sol / Medium) and U13B (approved update delivery, Sol / High), each requiring its own PASSKEY. See [Approved U02 Design](U02-Desktop-Host-and-Distribution-Design.md) and [Completion Report](U02-Completion-Report.md). U02 changed planning documents only. Next: **U03 — Free Cloud Provider Comparison, Sol / High**, awaiting a new PASSKEY; no U03 work has begun.


## U03 — YouTrack-First Direction Approved, October 14, 2026

During U03, the user proposed reusing YouTrack itself for cloud data and clarified the expected scale: one person, perhaps two, ten at the extreme. They confirmed no payment method/usage-based billing, private installers and avoiding weekly inactivity pauses. The user explicitly approved the completed comparison: **existing YouTrack first** for restricted, versioned NPCDex saves/assets/history and ROMDex metadata; **private YouTrack installer delivery first**, with **private GitHub Releases as a conditional fallback** after actual size/permission checks. No new SaaS is selected for provisioning. The owner is unsure about project administration; U14 must check actual license/storage use, permissions, visibility and limits, and assess a restricted-container fallback. U04 must prove publication, two-writer branch handling, idempotency and recovery before live migration; overwriting a single latest file is not accepted. Project-level access for additional people and receipt/ticket grouping remain later approvals. See [Approved U03 Comparison](U03-Free-Cloud-and-YouTrack-Storage-Comparison.md), [Inventory](U03-Data-and-Capacity-Inventory.json) and [Completion Report](U03-Completion-Report.md). Research changed planning artifacts only. Next: **U04 — Data Ownership and Synchronization Contracts, Astra / High**, requiring a new PASSKEY. No U04 work has begun.


## U04 — Design Prepared for Review, October 15, 2026

The authorized U04 contract and isolated model are ready for review: [Data Ownership and Synchronization Contracts](U04-Data-Ownership-and-Synchronization-Contracts.md), [Proof Results](U04-Contract-Proof-Results.json), [Review Report](U04-Review-Report.md). The model passed 43 scenarios, including 120 delivery permutations, and preserved all six existing request/baseline hash pairs and all 69 release files in source and installation. Proposed storage is immutable and eventually consistent, with conservative namespace conflict review, whole-receipt handling of later offline conflicts, bounded assets, no automatic remote deletion and separate native-task authority. Actual cursor/discovery, permissions and durability remain later live gates. User acceptance of the late-conflict behavior is pending; **U04 remains unchecked** and no U05 work is authorized. After U04 acceptance, the next task is **U05 — Shared Header and Control Layout Review, Sol / High**, requiring a new PASSKEY. No live application/data/configuration changes were made.


## U04 — Approved and Completed, October 15, 2026

The user explicitly approved **Versioned Saves and Conflict Review**, including immutable YouTrack-backed records, merging independent edits, preserving competing branches and whole-receipt review if a later offline edit conflicts with an automatic application at the known revision. This accepts eventual consistency rather than a global editing lock. The [approved contract](U04-Data-Ownership-and-Synchronization-Contracts.md), [model results](U04-Contract-Proof-Results.json) and [completion/review report](U04-Review-Report.md) record ownership, discovery, durability, retention, limits and later live gates. U04 is complete and checked off. No live storage, migration, application implementation or provisioning was authorized by this design approval. Next: **U05 — Shared Header and Control Layout Review, Sol / High**, awaiting a separate PASSKEY. No U05 work has begun.


## U05 — Layout Review Pending; S01 Added, October 15, 2026

U05 was authorized with PASSKEY. The [layout proposal](U05-Shared-Header-and-Control-Layout-Proposal.md), interactive comparison and [verification](U05-Layout-Verification.json) are ready. Direct Switch is recommended over Compact Menu; brand geometry/Save size, original assets and approved NPCDex relocations are preserved. User selection/approval remains pending, so U05 is unchecked. No application or live data changed. During U05 the user requested a separate side commit before U06: **S01 — Attachment Controls and Startup Scope, Sol / High** (lighter paperclip, Delete for native ticket files, All Tasks on fresh launch). S01 is planned after U05 approval and before U06, with its own PASSKEY. Switching tools or reopening the running tray instance retains in-session scope. U06 remains Sol / Medium and separately gated.


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


## U10F Start — Web Save Is Authoritative, October 15, 2026

The user confirms desktop save data differs from the correct live web save and grants PASSKEY for the next task, U10F. Preserve both copies. U12 must capture and preview the latest live web state, queues and bytes before migration; no packaged baseline or desktop QA fixture may replace it. U10F adds file drops only and does not perform early data adoption.


## U10F — Completed October 15, 2026; File Drops and Web-Data Authority

The task-specific PASSKEY authorized desktop file drops. **0.5.0-preview.10f** highlights the pointed Work Pane row and attaches disk files through the isolated preload and existing native queue. The drop does not open Details, alter checkbox selection, or move tasks. Existing limits, paused/offline storage, cancellation, previews and duplicate-safe delivery remain in use. Unsupported/changed file batches add no partial attachments, and original source paths are not stored in outgoing ticket metadata.

Passed **245 tests, nine UI scenarios, eight service/restart scenarios, eight actual Electron checks, 73 syntax checks and 178 delivery hashes**. File bytes survive source removal and reload/process restart. Internal bulk moves and parent/descendant relationships passed. The old U10 desktop, protected source, 0.4.3 web release/ZIP and credential ciphertext remain unchanged; verification made no production YouTrack writes. [Report](U10F-Completion-Report.md), [Windows evidence](U10F-Windows-Verification.json), [preservation](U10F-Preservation-Verification.json).

The user explicitly confirms **the live web save is authoritative; the desktop baseline differs**. Preserve both. U12 must preview and migrate the latest web state, recovery records, queues/files and remembered connection; no packaged desktop baseline or QA fixture may replace it. No migration was performed in U10F. Continue using the live web release until that gate. Delivery: **outputs/ROMDex-Desktop-U10F/ROMDex.exe**; preview profile identity remains unchanged.

**Next: UX01 — Application Command Placement Review, Sol / Medium**, requiring a new PASSKEY before U11. U11/U12/installer/cloud gates remain unchanged. No UX01 work is included here.

## UX01 — Approved and Complete, October 15, 2026

The user approved the Windows tray menu after clarification: Show ROMDex restores the last active workspace; Open Workspace offers ROMDex/NPCDex; grouped shared Save, Auto-Sync and Connection Details shortcuts; About; explicit Quit. Check for Updates is introduced with U13B only. The existing header is unchanged, Connection Details remains on its light, and the red button remains dedicated to workspace switching. Closing the window keeps the application running; Quit persists local work and exits. See [approved proposal](UX01-Application-Command-Placement-Proposal.md) and [completion report](UX01-Completion-Report.md).

This supersedes earlier undecided command-placement entries. UX01 changed documentation only. U11 is next, recommended Sol / High, and requires a new PASSKEY. Latest live web data remains authoritative; U12 migration and U14–U19 NPCDex cloud gates remain unchanged.


## U11 — Completed October 15, 2026; Tray and Recovery

**0.5.0-preview.11** implements the approved tray menu, close-to-tray/restoration, shared Save/Auto-Sync shortcuts, explicit local-checkpoint Quit, single-instance/profile ownership and bounded renderer/utility recovery. The original Pokédex SVG is now the window/tray/executable icon. The header is unchanged; updater controls remain U13B.

Passed **258 automated tests, six service/restart scenarios, twelve desktop scenarios, 76 syntax checks and 184 delivery hashes**. Actual hidden incoming changes, a second launch, forced renderer/utility interruptions, pending-edit recovery, unfinished-comment protection and process exit were checked in isolated fixtures. The [report](U11-Completion-Report.md) and [desktop evidence](U11-Desktop-Verification.json) record harness limitations and the final resumed checks.

The old U10F desktop, protected baseline, live web release/ZIP and credential ciphertext are unchanged. No migration or production writes occurred. **Continue live work in browser 0.4.3; its latest save remains authoritative.** The new preview does not replace it.

**Next: U12 — Persistent Profile and Current-Data Migration, Sol / High**, requiring a new PASSKEY. Capture and preview the latest web state, recovery records, queues/files and remembered connection; never replace them with the older desktop baseline. NPCDex cloud persistence remains U14–U19.


## U12 — Completed October 15, 2026; Current Saves Adopted by Desktop

The user authorized U12 and reviewed/accepted the native migration preview. Desktop **0.5.0-preview.12** now owns the latest captured browser workspace: **299 tasks, 104 manual-order entries, no pending operations or queued files**, plus the complete preserved NPCDex **revision 72** document (4 towns, 44 plans, 145 history records). No browser NPCDex current/recovery/held record existed; the preview identified the preserved Downloads package as its source. The older packaged desktop baseline was not used as migration authority.

The stable Windows-account profile is outside build folders at **%LOCALAPPDATA%/ROMDexDesktopData/thegobindsingh-PMON**. Original browser/package files and protected backups remain intact. The importer stages, hashes, reviews and atomically publishes the profile; missing established saves refuse baseline fallback. The remembered connection was converted through Windows protection to Electron safeStorage and verified after restart without token entry. Saved parent statuses and operation journal match their originals exactly.

Passed **272 automated tests, 83 syntax checks, 194 delivered-file hashes**, genuine YouTrack reads matching all 299 task fields, exact whole-document NPCDex comparison, hidden automatic sync and a checkpointed relaunch from a separate build folder. ROMDex then returned to its normal delivery executable with verification endpoints closed. No synthetic production edits were made. [Report](U12-Completion-Report.md), [live/restart evidence](U12-Desktop-Verification.json), [preservation](U12-Preservation-Verification.json).

**Use the desktop for current work; the old browser service is stopped. NPCDex remains local-only until U14–U19.** Installer upgrade/uninstall behavior remains U13A; update delivery U13B. **Next: U13A — Windows Installer and Upgrade/Uninstall Preservation, Sol / Medium**, requiring a new PASSKEY. No U13A implementation has begun.


## U13A — Authorized October 15, 2026; In Progress

The user requires saves inside the application folder and explicitly chose to retain Data on uninstall. This supersedes the original Squirrel/external-profile direction. Implementation uses a per-user Forge/WiX MSI, versioned program directories and retained application-folder Data, with verified copying of the established U12 profile and unchanged originals. See [storage revision](U13A-Storage-and-Installer-Revision.md).

Both private MSI versions passed full Windows validation and the isolated upgrade preserved all profile bytes, paused pending operations, queued-file bytes and a Windows-protected synthetic credential. Actual uninstall exposed a registered-path restoration defect for the custom disposable destination. That is corrected and 283 tests pass; a fresh full lifecycle run is requested. U13A is not complete, no installer is offered for current-data adoption yet, and the user continues using U12. U13B has not begun.


## U13A — Completed October 15, 2026

ROMDex **0.5.2** is installed and running normally with current data, the remembered connection and diagnostic ports closed. Saves are inside the application Data folder and retained on uninstall, superseding the earlier external-profile/Squirrel design. Current data: **299 tasks, 104 order entries, no pending work, NPCDex revision 72**; exact original NPCDex/order/images/credential preservation and genuine YouTrack field equality verified. Passed **287 tests, 89 syntax checks, 200 final application hashes**, real Windows encryption migration, isolated MSI install/upgrade/uninstall/reinstall and current-data/normal relaunch checks. Original U12 delivery and source data remain preserved. [Completion report](U13A-Completion-Report.md), [desktop evidence](U13A-Desktop-Verification.json).

Private delivery remains unprovisioned: YouTrack upload settings returned HTTP 404 and server capacity is unverified; no upload or global-limit change occurred. **Next: U13B — Approved Update Notifications and Installation, Sol / High**, under a new PASSKEY. NPCDex cloud remains U14–U19.


## U13B — Completed October 15, 2026

Installed ROMDex **0.5.3** adds approved private signed updates, separate download/install consent and a checkpointed Windows handoff. Private GenericCola/ROMDex now hosts organized source/history/deferred work and the verified installer. Passed **305 tests, 98 syntax checks, 214 installed hashes**, genuine isolated upgrade/reopen/uninstall, exact 96-file live Data preservation, genuine YouTrack equality, read-only private update access and normal automatic-sync relaunch with diagnostics closed. Current saves remain **299 tasks, 104 order entries, no pending work, NPCDex revision 72**. Credentials/private signing keys/live Data are excluded from Git. [Completion report](U13B-Completion-Report.md), [evidence](U13B-Desktop-Verification.json). NPCDex cloud remains U14–U19. **Next: U14 — Private YouTrack Storage and Access Rules, Sol / High**, requiring a new PASSKEY. No U14 work was performed.


## U14 Completed — Private GitHub Saves and YouTrack Agent Handoffs

The user approved the hybrid provider revision: separate private GenericCola/ROMDex-Data for saves/assets/history and ROMDex metadata; YouTrack retains native tasks and every agent-required handoff dependency/receipt. Provisioned stable workspace identity with Actions disabled and no new collaborators. Passed nine focused tests, six live transport checks, anonymous/authenticated-unapproved access checks, separately scoped save-token write validation and protected restore in another Windows process. Both prior credentials and all 214 installed files remain unchanged. No real saves were uploaded and application cloud sync is not implemented. [Report](U14-Completion-Report.md), [evidence](U14-Storage-Verification.json). **Next: U15 — Previewed NPCDex Cloud Import, Sol / High**, requiring a new PASSKEY and preview acceptance before migration.


## Workspace Toggle Polish — October 16, 2026

Reduce the header workspace toggle diameter by 30% from its current size and remove its drop shadow. Scheduled with U19 shared header and sync-control work so it receives the same two-workspace layout review. Planning only; implementation awaits the U19 PASSKEY. U15 remains next.


## U15 Completed — Approved Initial Cloud Copy

The user approved the native preview of the current saved NPCDex revision 73. Exact original bytes, including 159 current/historical embedded image occurrences, are preserved in private ROMDex-Data and a checked application-folder backup. Passed 19 focused tests, accepted live publication/download verification and recovery in a fresh Windows process. All three credentials and 214 installed application files remain unchanged. Local saves remain primary; no continuous synchronization is active. [Report](U15-Completion-Report.md), [evidence](U15-Cloud-Import-Verification.json). **Next: U16 — Durable Incoming/Outgoing Sync, Sol / Extra High**, under a new PASSKEY.


## U16 Completed — October 16, 2026

Installed **0.5.4** activates the approved NPCDex durable queue, incoming catch-up, offline/restart retry and tray delivery. A local SQLite transaction owns edits and outgoing dependencies; newer local work cannot be replaced by the accepted seed or an unversioned compatibility write. Incoming revisions retain typing bases and device-local view preferences. Auto-Sync Off retains local checkpoints, and manual Save performs one cycle. Competing versions are preserved for U17 review. Passed 345 tests, actual two-client GitHub/uncertain-send proof, forced process-kill recovery, packaged editing/restart/tray tests, 226 installed hashes, exact 106-file installer Data preservation, genuine YouTrack equality and normal relaunch with all three credentials unchanged and diagnostic ports closed. Source and installer are published privately; no synthetic production writes or new access grants were used for verification. **Next: U17 — Sol / Extra High; new PASSKEY required.**


## U17 Completed — October 16, 2026

Installed **0.5.5** activates deterministic independent NPCDex merges and explicit whole-version conflict review. Exact before-values, derived read/write footprints, collection identities and full domain validation guard reconciliation. Every semantic parent is verified, including unselected resolution branches. Review drafts survive restart, image previews are bounded, stale approvals fail closed and uncommitted choices are cancelled on suspension/shutdown. Original versions remain immutable ancestors; receipt effects remain indivisible and competing receipt IDs retain review markers. Passed **371 tests, eight final packaged desktop scenarios, actual multi-client GitHub checks, forced process-kill recovery, 234 installed hashes, exact 109-file installer Data preservation**, genuine YouTrack equality and normal relaunch with all three encrypted credentials unchanged. Source and installer are published privately, with diagnostic ports closed and no synthetic production edits. **Next: U18 — ROMDex Metadata Cloud Sync, Sol / High; new PASSKEY required.**


## U18 Completed — October 16, 2026

Installed **0.5.6** synchronizes ROMDex tile images, manual sibling order and saved parent statuses through the existing private ROMDex-Data connection. Native ticket fields/hierarchy remain YouTrack-owned; device views remain local. Separate durable metadata revisions validate all causal branches, merge independent entries, preserve whole-list conflicts for explicit review and retain original versions. Editor holds, uncertain delivery retries and compatibility-copy recovery preserve their observed base. Existing sparse order ranks and all saved assignments survived the current-data rehearsal and backed-up upgrade. Passed **417 tests, 10 packaged UI scenarios, actual multi-client GitHub checks, forced process-kill recovery, 123 syntax checks and 245 installed hashes**. All 111 Data files survived installation exactly; genuine YouTrack fields, NPCDex revision 73 and all three encrypted credentials survived normal restart. Source, prior source and verified installer are archived privately. Diagnostic ports are closed. **Next: U19 — Combined Sync Controls and Indicators, Sol / High; new PASSKEY required.**


## U19 Completed — October 16, 2026

Installed **0.5.7** completes shared Save/Auto-Sync indicators for native tickets, NPCDex saves and ROMDex metadata. Clean disconnects affect the connection light without claiming unsaved work; pending delivery failures, paused pending work, conflicts and local recovery require attention. All configured services contribute independently. Connection Details shows service-specific status/count/contact/recovery and removes stale local-only help. The workspace button is **19.04 px, 30% smaller, shadow-free and vertically centered**. Passed **426 tests, 6 packaged desktop scenarios, 125 syntax checks and 248 installed hashes**. All 114 Data files, current saves, native fields and three encrypted credentials survived the backed-up upgrade and normal restart. Source and installer are private; diagnostic ports are closed. **Next: U20 — Change Request Workflow and User-Story Review, Sol / Medium; new PASSKEY required.**


## U20E Preparation — October 17, 2026

The user confirmed New Bark Town, Route 29 and Cherrygrove City belong under Johto; Global Dialogue remains shared outside either region. Read-only source checks found revision 73 with matching local/cloud heads, no queue/conflict and unchanged protected credentials. Migration preview acceptance remains pending; it is not approval to publish real content or activate a provider. See U20E-Migration-Preview.md for exact source identity, storage scope, retention/backup policy and remaining proof gates.
