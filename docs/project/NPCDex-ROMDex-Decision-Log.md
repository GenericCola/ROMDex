# NPCDex + ROMDex — Scope Decisions

Started October 14, 2026. This records the discussion before the phased Action Plan. It does not authorize implementation.

## Current Design Checkpoint — October 17, 2026

**U20D is complete.** Isolated planning/correction editing, durable issue/upload/link intents, concurrent publication/draft review and current/proposed separation passed 501 tests and Windows/YouTrack recovery checks. [Report](../History/U20D/U20D-Completion-Report.md). All 15 fixtures were removed; installed 0.5.7 and GitHub-backed saves remain authoritative. **Next: U20E — Scale Checks and Previewed Content Migration, Sol / High; new PASSKEY required.** No migration has begun.

The U20D PASSKEY authorized this isolated implementation. Live proof showed that full defensive reconstruction currently takes several minutes; U20E must prove scale/retention and acceptable latency before migration preview/acceptance. Native-edit adoption and installed acceptance remain later gates. Earlier checkpoint entries below are historical.

The user approved the [U20 content-registry and revised workflow baseline](../History/U20/U20-Consolidated-Architecture-and-Revised-Plan.md). Permanent content is planned for a separate YouTrack project; actionable work remains PMON. NPCDex stages only; fixed map documents attach by explicit choice, direct versioned backend updates preserve newer drafts, and testing remains human-controlled. Explicit documentation corrections retain history without requesting ROM work.

The user authorized **U20A** with PASSKEY and subsequently selected **“Approve U20A Contracts.”** Its [record/mapping contracts, examples and extraction guide](../History/U20A/U20A-Review-Report.md) are accepted with 45 passing isolated model/legacy checks. No content project, access change, live upload, migration, application update or actual ROM edit occurred in U20A. The user's subsequent **PASSKEY** authorizes **U20B — Sol / High**. Earlier entries below remain historical decisions and completed milestones.

U20B initially established **HTTP 403** for project creation on October 16. The instance owner subsequently created **NPCD / 0-2**, retaining their leader role and granting GenericCola direct Project Admin access. On October 17 the private fixture transfer/link/concurrent-append/restart proof passed; all four QA issues were deleted and all three credentials preserved. **U20B is complete.** [Carrier, evidence and limits](../History/U20B/U20B-Completion-Report.md): signed download URLs must not be exported, configured quota remains unknown, and actual authenticated agent grants remain U23. No provider switch, live save import, ROM edit or app update occurred. **Next: U20C, Sol / High, new PASSKEY required.**

**U20C is complete** after isolated dynamic reader/cache/projection implementation, 467 tests and live YouTrack attachment/restart/cleanup proof. [Report and limits](../History/U20C/U20C-Completion-Report.md). Installed 0.5.7 and the existing GitHub-backed NPCDex remain authoritative. **Next: U20D — Backend Planning and Documentation Corrections, Sol / High; new PASSKEY required.**

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

ROMDex 0.4.0 is the verified enhancement baseline. Passed 207 extracted-package tests, 51 module syntax checks, launcher parsing, combined isolated browser checks and controlled real YouTrack two-way field/file/conflict/subtree verification. Four marked QA tickets were cleaned; all 309 original issue IDs remain. The user launched the new folder: expected running installation/build and all 28 public asset hashes match, saved credential ciphertext is unchanged, connection/Auto-Sync are healthy, and no pending or blocked work remains. The 69-file ZIP/manifest and protected 47-file saved-data checkpoint are verified, including NPCDex revision 72. See [R08 Completion Report](../History/R08/R08-Completion-Report.md) and [Baseline Update](../History/R08/R08-Baseline-Update.md). No U02 work has begun. Next: **U02 — Desktop Host and Distribution Design, Sol / High**, requiring a new PASSKEY.


## U02 — Approved and Completed, October 14, 2026

The user authorized U02 with PASSKEY and explicitly approved the concrete Electron/Forge/Squirrel proposal. The application is named **ROMDex**, with NPCDex as a built-in add-on; the active-tool header behavior remains unchanged. The user selected **Notify Me and Ask Before Updating** and **unsigned private test builds**, with signing reconsidered before wider distribution. The approved design uses an application-owned background save/sync service, scoped tool views, a validated native bridge and persistent data outside the installation directory. U03 now also compares trusted release-index/installer hosting, privacy and bandwidth separately from workspace storage. U13 is split into U13A (installer/preservation, Sol / Medium) and U13B (approved update delivery, Sol / High), each requiring its own PASSKEY. See [Approved U02 Design](../History/U02/U02-Desktop-Host-and-Distribution-Design.md) and [Completion Report](../History/U02/U02-Completion-Report.md). U02 changed planning documents only. Next: **U03 — Free Cloud Provider Comparison, Sol / High**, awaiting a new PASSKEY; no U03 work has begun.


## U03 — YouTrack-First Direction Approved, October 14, 2026

During U03, the user proposed reusing YouTrack itself for cloud data and clarified the expected scale: one person, perhaps two, ten at the extreme. They confirmed no payment method/usage-based billing, private installers and avoiding weekly inactivity pauses. The user explicitly approved the completed comparison: **existing YouTrack first** for restricted, versioned NPCDex saves/assets/history and ROMDex metadata; **private YouTrack installer delivery first**, with **private GitHub Releases as a conditional fallback** after actual size/permission checks. No new SaaS is selected for provisioning. The owner is unsure about project administration; U14 must check actual license/storage use, permissions, visibility and limits, and assess a restricted-container fallback. U04 must prove publication, two-writer branch handling, idempotency and recovery before live migration; overwriting a single latest file is not accepted. Project-level access for additional people and receipt/ticket grouping remain later approvals. See [Approved U03 Comparison](../History/U03/U03-Free-Cloud-and-YouTrack-Storage-Comparison.md), [Inventory](../History/U03/U03-Data-and-Capacity-Inventory.json) and [Completion Report](../History/U03/U03-Completion-Report.md). Research changed planning artifacts only. Next: **U04 — Data Ownership and Synchronization Contracts, Astra / High**, requiring a new PASSKEY. No U04 work has begun.


## U04 — Design Prepared for Review, October 15, 2026

The authorized U04 contract and isolated model are ready for review: [Data Ownership and Synchronization Contracts](../History/U04/U04-Data-Ownership-and-Synchronization-Contracts.md), [Proof Results](../History/U04/U04-Contract-Proof-Results.json), [Review Report](../History/U04/U04-Review-Report.md). The model passed 43 scenarios, including 120 delivery permutations, and preserved all six existing request/baseline hash pairs and all 69 release files in source and installation. Proposed storage is immutable and eventually consistent, with conservative namespace conflict review, whole-receipt handling of later offline conflicts, bounded assets, no automatic remote deletion and separate native-task authority. Actual cursor/discovery, permissions and durability remain later live gates. User acceptance of the late-conflict behavior is pending; **U04 remains unchecked** and no U05 work is authorized. After U04 acceptance, the next task is **U05 — Shared Header and Control Layout Review, Sol / High**, requiring a new PASSKEY. No live application/data/configuration changes were made.


## U04 — Approved and Completed, October 15, 2026

The user explicitly approved **Versioned Saves and Conflict Review**, including immutable YouTrack-backed records, merging independent edits, preserving competing branches and whole-receipt review if a later offline edit conflicts with an automatic application at the known revision. This accepts eventual consistency rather than a global editing lock. The [approved contract](../History/U04/U04-Data-Ownership-and-Synchronization-Contracts.md), [model results](../History/U04/U04-Contract-Proof-Results.json) and [completion/review report](../History/U04/U04-Review-Report.md) record ownership, discovery, durability, retention, limits and later live gates. U04 is complete and checked off. No live storage, migration, application implementation or provisioning was authorized by this design approval. Next: **U05 — Shared Header and Control Layout Review, Sol / High**, awaiting a separate PASSKEY. No U05 work has begun.


## U05 — Layout Review Pending; S01 Added, October 15, 2026

U05 was authorized with PASSKEY. The [layout proposal](../History/U05/U05-Shared-Header-and-Control-Layout-Proposal.md), interactive comparison and [verification](../History/U05/U05-Layout-Verification.json) are ready. Direct Switch is recommended over Compact Menu; brand geometry/Save size, original assets and approved NPCDex relocations are preserved. User selection/approval remains pending, so U05 is unchecked. No application or live data changed. During U05 the user requested a separate side commit before U06: **S01 — Attachment Controls and Startup Scope, Sol / High** (lighter paperclip, Delete for native ticket files, All Tasks on fresh launch). S01 is planned after U05 approval and before U06, with its own PASSKEY. Switching tools or reopening the running tray instance retains in-session scope. U06 remains Sol / Medium and separately gated.


## U05 Revision — Footer Workspace Menu, October 15, 2026

The user rejected Direct Switch and Compact Menu and specified a small unlabeled red circular button at the bottom-left of the window, in the red shell footer. It opens a pop-up listing **ROMDex** and **NPCDex**; selection or ESC closes it. Preserve each workspace's selections/settings/view/navigation/drafts while switching. The user explicitly clarified **between workspaces in this app**, not across computers. No header switcher should be implemented. The [revised proposal](../History/U05/U05-Shared-Header-and-Control-Layout-Proposal.md) and [footer verification](../History/U05/U05-Footer-Layout-Verification.json) record this direction; [open-menu image](../../U05-Footer-Switch-Open.png). U05 remains in final visual review; no application change or S01/U06 work has begun. Next gated implementation remains **S01, Sol / High**, then **U06, Sol / Medium**, each with its own PASSKEY.


## U05 — Approved Development Placeholder and Circle Order, October 15, 2026

The user approved the small unlabeled red footer button as a **development placeholder** until a more permanent workspace switcher is reviewed. Its menu lists ROMDex/NPCDex, closes on selection/ESC, and retains each workspace's in-app context. The user also corrected the three static decorative circles beside the active title to **red → yellow → green**, left to right. U06 must implement and visually verify this order without changing task/save/connection indicator meaning or geometry. Earlier preview images show the superseded circle order. U05 is complete and checked off; see [approved proposal](../History/U05/U05-Shared-Header-and-Control-Layout-Proposal.md) and [report](../History/U05/U05-Review-Report.md). No application code or current data changed. Next: **S01 — Attachment Controls and Startup Scope, Sol / High**, awaiting its own PASSKEY; U06 follows under a separate PASSKEY, Sol / Medium.


## S01 — Completed in ROMDex 0.4.1, October 15, 2026

S01 was authorized with PASSKEY and completed before U06. The [0.4.1 patch report](../History/S01/S01-Completion-Report.md) records the lighter paperclip, safe native attachment Delete and All Tasks on fresh launch. Passed 227 tests, 52 syntax checks, 11 isolated browser checks, 70 ZIP-entry integrity checks and 28 served assets. The user switched to **outputs/ROMDex-v0.4.1/ROMDex**; running identity/build, remembered connection, unchanged credential ciphertext/Auto-Sync, real disposable-file deletion/replay/neighbor bytes and cleanup are verified. All original issue IDs remain; existing project attachments were not used for destructive QA. Canonical source is outputs/ROMDex, version 0.4.1; the previous 0.4 release/ZIP and protected U01/R08 backups remain intact. The footer switcher and decorative-circle correction remain U06. Next: **U06 — Shared Theme and Approved Header, Sol / Medium**, requiring a new PASSKEY; no U06 work has begun.


## U06 — Completed October 15, 2026; Header Placement Supersedes Footer

The user authorized U06 and moved the placeholder workspace switcher into the header, immediately left of the top-right controls, at 80% of their height. This supersedes all earlier footer-only instructions and illustrations; no footer space is reserved. U06 is complete in **0.4.1 + U06**: shared theme/header/assets, red → yellow → green decorative lamps, connection-light access and capability-gated settings. Verified 227 tests, 319 syntax checks, 20 focused/regression browser checks, original brand/Save geometry and 7 live-served assets. Credentials, Auto-Sync, NPCDex files, protected baseline and original ZIP remain preserved; no production YouTrack writes. [Completion report](../History/U06/U06-Completion-Report.md), [patch manifest](../History/U06/U06-Patch-Manifest.json). NPCDex is listed but disabled until U08 supplies its workspace. Next: **U07 — Relocate NPCDex Controls, Sol / Medium**, under a new PASSKEY.


## U07 — Completed October 15, 2026; File Drop Scheduled

U07's PASSKEY authorized NPCDex control relocation. Flags & Notes is above Tray 1 selectors; Male/Female is immediately left of the Inventory cog in Tray 2; Data opens from Inventory Settings. The working source is **outputs/NPCDex**, staged for U08 integration. All 12 focused browser/preservation checks and 8 syntax checks passed; original Downloads files, current saved export and ROMDex credentials/installation remain unchanged. Current saved revision 72 was used only in isolated before/after QA; the packaged dataset remains untouched. [Report](../History/U07/U07-Completion-Report.md).

The user requested Explorer/desktop file drops onto tickets, permitting deferral to avoid duplication. Schedule **U10F — Desktop File Drop Attachments, Sol / High**, immediately after U10's native host/file adapters and before U11. Reuse existing attachment queue and validation; preserve hierarchy dragging. [Feature scope](../History/Earlier-Plans-and-Releases/Desktop-File-Drop-Attachments-Plan.md). Separate PASSKEY required.

Next: **U08 — Tool Switching and Preserved Workspace Context, Sol / High**, awaiting its own PASSKEY.


## U08 — Completed October 15, 2026; Combined Browser Build 0.4.2

The authorized task connected ROMDex and NPCDex through the red header menu. Separate retained documents preserve scopes, filters, scroll, checkbox selection, pane layout, cursor positions, unfinished text and open modal forms. Workspace switches do not commit drafts. NPCDex's embedded first-launch baseline exactly matches the current saved revision 72; the old standalone database, Downloads package and exported save remain preserved. A distinct integrated NPCDex browser database avoids silently adopting an unrelated old-origin save.

The user launched **outputs/ROMDex-v0.4.2/ROMDex** and live GET-only verification confirmed version/build/installation identity, remembered YouTrack connection, unchanged credential ciphertext and 38 served assets. Passed 227 automated tests, 15 browser checks, 57 syntax checks, real-service content-policy/failure/retry/image-import checks and 84 package hashes. [Completion report](../History/U08/U08-Completion-Report.md), [live record](../History/U08/U08-Live-Verification.json).

The header temporarily forwards existing manual save actions; NPCDex remains manual/local and its cloud connection is not claimed. U09 supplies the formal shared durable/headless coordinator. **Next: U09 — Shared Save and Auto-Sync Coordination, Sol / High**, under a new PASSKEY. U10F file-drop attachments remains after U10, before U11.


## H01 — Header Correction, October 15, 2026

The user directly requested removing the application header cog, documenting its commands for later placement, and correcting the connection light. Implemented in **0.4.2 + H01**: no cog/menu or reserved space, Save/connection shifted right 36 px, actual light/ring centered by eliminating a 3.25 px text-baseline displacement. Six focused browser checks passed; changed assets were verified from the running service. Refresh only; no restart or token entry. [Report](../History/Header-Correction/Header-Correction-Report.md), [command inventory](Deferred-Application-Commands.md), [patch overlay](../History/Header-Correction/Header-Correction-Patch-Manifest.json).

This supersedes prior header-cog placement instructions. Connection Details remains on the light; no substitute home has been chosen for the other commands. **UX01 — Application Command Placement Review, Sol / Medium**, is pending before U11. U09 remains pending under a separate PASSKEY, Sol / High.


## U09 — Completed October 15, 2026; Combined Build 0.4.3

U09 was individually authorized and is complete. Shared Save coordinates both providers, coalesces repeated attempts and retains independent failure results; manual Save while Off leaves Auto-Sync Off. The shell owns one native engine/queue/clock. The engine and coordinator have injectable storage/runtime boundaries, with Node disk/restart tests preparing U10. NPCDex accepted edits/notes gain local recovery checkpoints, including while Auto-Sync is Off; export races preserve newer edits and mismatched copies remain available for review. Unapplied modal forms are not silently committed.

Passed **237 automated tests, 14 focused browser checks, 63 syntax checks and 91 package integrity checks**. The user launched **outputs/ROMDex-v0.4.3/ROMDex**; live GET-only verification confirmed build/installation identity, 42 served assets, remembered connection, unchanged credential ciphertext and Auto-Sync. Protected baselines, prior installation/ZIPs and H01's header correction remain preserved. No production YouTrack writes were made by verification. [Completion report](../History/U09/U09-Completion-Report.md), [live evidence](../History/U09/U09-Live-Verification.json), [provider contract](../History/U09/U09-Engine-and-Provider-Contract.md).

**NPCDex remains local-only; cloud persistence is U14–U19.** U14 storage, U15 current-data import and U16–U17 durable two-way sync/conflicts precede U18–U19 metadata/shared cloud controls. Browser closure still stops the runtime; Electron and tray behavior remain U10/U11. U12 must migrate latest working data and recovery records, never replace them with an older embedded baseline.

Phase 1 is complete. **Next: U10 — Native Desktop Window and Local Service, Sol / High**, requiring a new PASSKEY. U10F file-drop attachments follows U10; UX01 command placement remains before U11. No U10 implementation has begun.


## U10 — Completed October 15, 2026; Native Desktop Preview

The task-specific PASSKEY authorized U10. **ROMDex 0.5.0-preview.10** now includes the Windows x64 Electron 44.7.2 runtime, a sandboxed custom-protocol window, finite validated bridge, utility-owned native queue/clock and durable stores, native attachment selection and NPCDex export adapters. Retained first-party documents preserve the existing editing/context interfaces inside the native window; the [host contract](../History/U10/U10-Host-and-Bridge-Contract.md) records this container choice. The desktop does not open the browser HTTP listener.

The user launched the packaged preview normally. A custom-protocol registration on the wrong Electron session was corrected before successful graphical acceptance. Passed **240 tests under bundled Node 24.21.0, seven service/restart checks, nine desktop-facade checks, 14 browser regressions, eleven actual Electron checks, 70 syntax checks and 174 delivery hashes**. Automatic native fixture updates arrived through the utility clock while NPCDex was active. Native NPCDex export/reload, shared manual Save while Off, sandbox/bridge restrictions and the existing header correction passed. [Completion report](../History/U10/U10-Completion-Report.md), [Windows evidence](../History/U10/U10-Windows-Verification.json), [preservation](../History/U10/U10-Preservation-Verification.json).

Delivery: **outputs/ROMDex-Desktop-U10/ROMDex.exe**. This is an independent development preview; continue using **0.4.3** for the live project until U12. No browser saves, remembered credentials or original NPCDex files were migrated/overwritten. The 91-file old installation/checkpoint, ZIP and credential ciphertext are verified unchanged. The fixture-only verification session made no production YouTrack writes. Normal preview data lives outside program files, under ROMDexDesktopData/preview-u10.

U10 is complete; tray lifecycle, profile locking and supervised recovery remain U11, current-data handoff U12, installer U13A and NPCDex cloud U14–U19. **Next: U10F — Desktop File Drop Attachments, Sol / High**, requiring a new PASSKEY. UX01 command placement still precedes U11. No U10F work is included here.


## U10F Start — Web Save Is Authoritative, October 15, 2026

The user confirms desktop save data differs from the correct live web save and grants PASSKEY for the next task, U10F. Preserve both copies. U12 must capture and preview the latest live web state, queues and bytes before migration; no packaged baseline or desktop QA fixture may replace it. U10F adds file drops only and does not perform early data adoption.


## U10F — Completed October 15, 2026; File Drops and Web-Data Authority

The task-specific PASSKEY authorized desktop file drops. **0.5.0-preview.10f** highlights the pointed Work Pane row and attaches disk files through the isolated preload and existing native queue. The drop does not open Details, alter checkbox selection, or move tasks. Existing limits, paused/offline storage, cancellation, previews and duplicate-safe delivery remain in use. Unsupported/changed file batches add no partial attachments, and original source paths are not stored in outgoing ticket metadata.

Passed **245 tests, nine UI scenarios, eight service/restart scenarios, eight actual Electron checks, 73 syntax checks and 178 delivery hashes**. File bytes survive source removal and reload/process restart. Internal bulk moves and parent/descendant relationships passed. The old U10 desktop, protected source, 0.4.3 web release/ZIP and credential ciphertext remain unchanged; verification made no production YouTrack writes. [Report](../History/U10F/U10F-Completion-Report.md), [Windows evidence](../History/U10F/U10F-Windows-Verification.json), [preservation](../History/U10F/U10F-Preservation-Verification.json).

The user explicitly confirms **the live web save is authoritative; the desktop baseline differs**. Preserve both. U12 must preview and migrate the latest web state, recovery records, queues/files and remembered connection; no packaged desktop baseline or QA fixture may replace it. No migration was performed in U10F. Continue using the live web release until that gate. Delivery: **outputs/ROMDex-Desktop-U10F/ROMDex.exe**; preview profile identity remains unchanged.

**Next: UX01 — Application Command Placement Review, Sol / Medium**, requiring a new PASSKEY before U11. U11/U12/installer/cloud gates remain unchanged. No UX01 work is included here.

## UX01 — Approved and Complete, October 15, 2026

The user approved the Windows tray menu after clarification: Show ROMDex restores the last active workspace; Open Workspace offers ROMDex/NPCDex; grouped shared Save, Auto-Sync and Connection Details shortcuts; About; explicit Quit. Check for Updates is introduced with U13B only. The existing header is unchanged, Connection Details remains on its light, and the red button remains dedicated to workspace switching. Closing the window keeps the application running; Quit persists local work and exits. See [approved proposal](../History/UX01/UX01-Application-Command-Placement-Proposal.md) and [completion report](../History/UX01/UX01-Completion-Report.md).

This supersedes earlier undecided command-placement entries. UX01 changed documentation only. U11 is next, recommended Sol / High, and requires a new PASSKEY. Latest live web data remains authoritative; U12 migration and U14–U19 NPCDex cloud gates remain unchanged.


## U11 — Completed October 15, 2026; Tray and Recovery

**0.5.0-preview.11** implements the approved tray menu, close-to-tray/restoration, shared Save/Auto-Sync shortcuts, explicit local-checkpoint Quit, single-instance/profile ownership and bounded renderer/utility recovery. The original Pokédex SVG is now the window/tray/executable icon. The header is unchanged; updater controls remain U13B.

Passed **258 automated tests, six service/restart scenarios, twelve desktop scenarios, 76 syntax checks and 184 delivery hashes**. Actual hidden incoming changes, a second launch, forced renderer/utility interruptions, pending-edit recovery, unfinished-comment protection and process exit were checked in isolated fixtures. The [report](../History/U11/U11-Completion-Report.md) and [desktop evidence](../History/U11/U11-Desktop-Verification.json) record harness limitations and the final resumed checks.

The old U10F desktop, protected baseline, live web release/ZIP and credential ciphertext are unchanged. No migration or production writes occurred. **Continue live work in browser 0.4.3; its latest save remains authoritative.** The new preview does not replace it.

**Next: U12 — Persistent Profile and Current-Data Migration, Sol / High**, requiring a new PASSKEY. Capture and preview the latest web state, recovery records, queues/files and remembered connection; never replace them with the older desktop baseline. NPCDex cloud persistence remains U14–U19.


## U12 — Completed October 15, 2026; Current Saves Adopted by Desktop

The user authorized U12 and reviewed/accepted the native migration preview. Desktop **0.5.0-preview.12** now owns the latest captured browser workspace: **299 tasks, 104 manual-order entries, no pending operations or queued files**, plus the complete preserved NPCDex **revision 72** document (4 towns, 44 plans, 145 history records). No browser NPCDex current/recovery/held record existed; the preview identified the preserved Downloads package as its source. The older packaged desktop baseline was not used as migration authority.

The stable Windows-account profile is outside build folders at **%LOCALAPPDATA%/ROMDexDesktopData/thegobindsingh-PMON**. Original browser/package files and protected backups remain intact. The importer stages, hashes, reviews and atomically publishes the profile; missing established saves refuse baseline fallback. The remembered connection was converted through Windows protection to Electron safeStorage and verified after restart without token entry. Saved parent statuses and operation journal match their originals exactly.

Passed **272 automated tests, 83 syntax checks, 194 delivered-file hashes**, genuine YouTrack reads matching all 309 task fields, exact whole-document NPCDex comparison, hidden automatic sync and a checkpointed relaunch from a separate build folder. ROMDex then returned to its normal delivery executable with verification endpoints closed. No synthetic production edits were made. [Report](../History/U12/U12-Completion-Report.md), [live/restart evidence](../History/U12/U12-Desktop-Verification.json), [preservation](../History/U12/U12-Preservation-Verification.json).

**Use the desktop for current work; the old browser service is stopped. NPCDex remains local-only until U14–U19.** Installer upgrade/uninstall behavior remains U13A; update delivery U13B. **Next: U13A — Windows Installer and Upgrade/Uninstall Preservation, Sol / Medium**, requiring a new PASSKEY. No U13A implementation has begun.


## U13A — Authorized October 15, 2026; In Progress

The user requires saves inside the application folder and explicitly chose to retain Data on uninstall. This supersedes the original Squirrel/external-profile direction. Implementation uses a per-user Forge/WiX MSI, versioned program directories and retained application-folder Data, with verified copying of the established U12 profile and unchanged originals. See [storage revision](../History/U13A/U13A-Storage-and-Installer-Revision.md).

Both private MSI versions passed full Windows validation and the isolated upgrade preserved all profile bytes, paused pending operations, queued-file bytes and a Windows-protected synthetic credential. Actual uninstall exposed a registered-path restoration defect for the custom disposable destination. That is corrected and 283 tests pass; a fresh full lifecycle run is requested. U13A is not complete, no installer is offered for current-data adoption yet, and the user continues using U12. U13B has not begun.


## U13A — Completed October 15, 2026

ROMDex **0.5.2** is installed and running normally with current data, the remembered connection and diagnostic ports closed. Saves are inside the application Data folder and retained on uninstall, superseding the earlier external-profile/Squirrel design. Current data: **299 tasks, 104 order entries, no pending work, NPCDex revision 72**; exact original NPCDex/order/images/credential preservation and genuine YouTrack field equality verified. Passed **287 tests, 89 syntax checks, 200 final application hashes**, real Windows encryption migration, isolated MSI install/upgrade/uninstall/reinstall and current-data/normal relaunch checks. Original U12 delivery and source data remain preserved. [Completion report](../History/U13A/U13A-Completion-Report.md), [desktop evidence](../History/U13A/U13A-Desktop-Verification.json).

Private delivery remains unprovisioned: YouTrack upload settings returned HTTP 404 and server capacity is unverified; no upload or global-limit change occurred. **Next: U13B — Approved Update Notifications and Installation, Sol / High**, under a new PASSKEY. NPCDex cloud remains U14–U19.


## U13B — Completed October 15, 2026

Installed ROMDex **0.5.3** adds approved private signed updates, separate download/install consent and a checkpointed Windows handoff. Private GenericCola/ROMDex now hosts organized source/history/deferred work and the verified installer. Passed **305 tests, 98 syntax checks, 214 installed hashes**, genuine isolated upgrade/reopen/uninstall, exact 96-file live Data preservation, genuine YouTrack equality, read-only private update access and normal automatic-sync relaunch with diagnostics closed. Current saves remain **299 tasks, 104 order entries, no pending work, NPCDex revision 72**. Credentials/private signing keys/live Data are excluded from Git. [Completion report](../History/U13B/U13B-Completion-Report.md), [evidence](../History/U13B/U13B-Desktop-Verification.json). NPCDex cloud remains U14–U19. **Next: U14 — Private YouTrack Storage and Access Rules, Sol / High**, requiring a new PASSKEY. No U14 work was performed.


## U14 Completed — Private GitHub Saves and YouTrack Agent Handoffs

The user approved the hybrid provider revision: separate private GenericCola/ROMDex-Data for saves/assets/history and ROMDex metadata; YouTrack retains native tasks and every agent-required handoff dependency/receipt. Provisioned stable workspace identity with Actions disabled and no new collaborators. Passed nine focused tests, six live transport checks, anonymous/authenticated-unapproved access checks, separately scoped save-token write validation and protected restore in another Windows process. Both prior credentials and all 214 installed files remain unchanged. No real saves were uploaded and application cloud sync is not implemented. [Report](../History/U14/U14-Completion-Report.md), [evidence](../History/U14/U14-Storage-Verification.json). **Next: U15 — Previewed NPCDex Cloud Import, Sol / High**, requiring a new PASSKEY and preview acceptance before migration.


## Workspace Toggle Polish — October 16, 2026

Reduce the header workspace toggle diameter by 30% from its current size and remove its drop shadow. Scheduled with U19 shared header and sync-control work so it receives the same two-workspace layout review. Planning only; implementation awaits the U19 PASSKEY. U15 remains next.


## U15 Completed — Approved Initial Cloud Copy

The user approved the native preview of the current saved NPCDex revision 73. Exact original bytes, including 159 current/historical embedded image occurrences, are preserved in private ROMDex-Data and a checked application-folder backup. Passed 19 focused tests, accepted live publication/download verification and recovery in a fresh Windows process. All three credentials and 214 installed application files remain unchanged. Local saves remain primary; no continuous synchronization is active. [Report](../History/U15/U15-Completion-Report.md), [evidence](../History/U15/U15-Cloud-Import-Verification.json). **Next: U16 — Durable Incoming/Outgoing Sync, Sol / Extra High**, under a new PASSKEY.


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


## U20E — Migration Accepted; Closed-App Handoff in Progress

The human approved “Approve Preview and Continue U20E” for revision 73 and then confirmed Quit ROMDex. The final closed-app capture matches the approved SHA256 `2c50ee40f590eb1505a99922efa948db282fe46425bf640b5a0f69fc780c630c`, with no pending uploads, conflicts or dirty recovery draft. A complete protected application Data backup and ciphertext inventory are verified.

The resumable import is limited to the accepted 211 private NPCD content records plus registry, parent links and verified attachments. A pagination hold exposed changing default search order; migration-only discovery now uses immutable issue-ID ordering, bounded per-batch inventories and fresh final identity checks. Every mutation retains the base transport’s fresh ownership/privacy guard. A restart rediscovers uncertain delivery; no blind resend is allowed. Original Data, GitHub history and all three tokens remain preserved.

The local 0.5.8 handoff candidate passed 530 regression tests, targeted rechecks, isolated native presentation checks and source/hash audit. Installation, authority activation and final readback are not yet complete. U20F installed acceptance/private release remains separately gated by PASSKEY.


## U20E Completed — October 18, 2026

Installed ROMDex 0.5.8 now uses NPCD as NPCDex’s content authority after the accepted revision-73 migration. All 211 records plus registry and 610 chunks passed exact original/frontend readback. Full audit: 98.045 seconds / 833 requests; routine verification: 30.985 seconds / 224 requests. All three saved connections, original Data backup and GitHub recovery history remain preserved; metadata sync remains independent. Passed 534 regression tests, 47 reader rechecks, 4 migration-transport checks, 3 private-reader checks, 160 syntax checks and all 300 installed hashes. Brief native verification confirms both workspaces, 299 current tasks, healthy services, images and current dialogue. See [completion report](../History/U20E/U20E-Completion-Report.md). Full U20F acceptance/private release remains the next separate task, Sol / High. No PMON task, agent dispatch, access grant or ROM mutation occurred.

## October 18, 2026 — U20F Acceptance and Private Release

ROMDex 0.5.9 completes the content-backend acceptance gate. Preserve current/proposed separation and guarded native title/context review; unsupported native changes remain visible for human review. Complete Data backup/restoration and installed verification retained all saves and three protected connections. The private signed-metadata release requires migrated 0.5.8. U21 remains a separate PASSKEY gate; fresh-computer connection/root bootstrap remains an explicit U29 acceptance requirement.

## October 18 — U20G Corrective UI

Restore contextual editing over the versioned backend; separate form scrolling/footer; identify every summary entry and navigate to its stage; place Add Character beside Male/Female. Preserve unrelated drafts and immutable multi-passage scopes. Stale notes default to Unreviewed until explicit retesting. Release 0.5.10 completes this corrective task; U21 remains separately gated.

## October 18 — U20H Original Feedback Interface

Reuse the original web renderer and CSS for status tags, flags, notes, inline changes and grouped review; map the mutation boundary onto versioned database edits. Preserve targets, exact text, drafts, toggle-off history and conflict review. Use the standard Tray 2 settings button on tiles, and place Add Character left of gender. Release 0.5.11 completes this corrective task; U21 remains separately gated.

## October 18 — U20I Native Content Tree Prerequisite

The backend migration is complete, but the migrated frontend still depends on the preserved original-save compatibility scaffold. The user requested adding the remaining transition to the checklist/roadmap. Schedule **U20I — Complete the Native Content Tree**, Sol / High, before U21: assemble the entire interface from structured records, support previewed new-map/sub-zone/entity imports, preserve existing UI/data/history and update agent extraction/import instructions. Original exports remain recovery/history only. Prove a new map absent from the original save through the validated import/display path, distinguishing synthetic tests from actual ROM extraction. Implementation and any live metadata transition remain subject to a new PASSKEY and applicable preview acceptance. This request updates planning only; U20I has not begun.

## October 18, 2026 — U20I Complete

The accepted native-content transition is committed and verified in installed 0.5.14. All preceding edits and saved connections are retained. A bounded ten-minute content read and retryable transport failures resolve the observed history-read timing issue while preserving integrity and conflict checks. U21 remains a separate Sol / High task requiring a new PASSKEY.

## October 18, 2026 — RDX Documents and JSON Map Packages

The user requested a planning revision before implementation. [Revised phases and contracts](../../NPCDex-ROMDex-Unified-App-Action-Plan.md) and [execution checklist](../../NPCDex-ROMDex-Action-Checklist.md) add RD01–RD10 before U21, preserving every completed task and the installed 0.5.14 baseline.

- Use one `.rdx` extension with internal workspace/add-on, object kind and version routing: ROMDex objects are plans; NPCDex objects are maps. Filenames do not determine format. Preserve recognition of the older browser-migration `.rdx` separately.
- Use a lossless compressed container containing structured JSON and exact binary assets, deduplicated by content hash; codec/limits require contract review and measurement. Supply deterministic pack/unpack/validate tools, schemas, examples and agent extraction/ROM-mapping instructions. Application import/mapping uses no AI.
- Keep an app-managed working copy in Data, leaving the original imported file unchanged. Local saves and accepted YouTrack changes update it; export is self-contained and portable. Permit local import/edit/save before any cloud connection. Portable record IDs remain separate from backend issue IDs.
- Initially accept one map per file with required region/shared/timeline dependencies. Match existing records by stable identity and preview updates. Complete map snapshots can propose archival of covered omissions; partial maps imply no archival. Protect shared profiles, newer drafts and history.
- Task-plan imports choose a destination and preview tier changes, preserving whole subtrees, fields, attachments and comments. Omitted tasks remain; explicit deletion requests require review and follow existing YouTrack deletion behavior.
- Export selected map work as a readable, fixed **JSON Map Package**, attached only after the user chooses an existing task or explicitly creates one. This supersedes the proposed `.rdx` change-package variant. Include stable ROM targets, exact package/base identities, instructions and agent-accessible YouTrack asset references. No automatic agent dispatch.
- Normal agent return is an updated map `.rdx` attached to the same task, with actual implementation/source evidence and package/base provenance. ROMDex discovers and validates it, applies safe independent results or complete dependent groups, preserves newer drafts and sends exceptions to review. ROMDex updates NPCD and the managed file; direct agent writes to NPCD are no longer the normal route. Retain legacy history and native two-way sync.
- Every agent-result import is marked **Needs Human Review and Testing**, even after safe automatic reconciliation. Affected content is Unreviewed; the task remains open until explicit human verification. No separate receipt file is necessary; provenance is inside the returned document.
- `.rdx` file icons must use the **exact existing Pokéball favicon artwork**, distinct from the Pokédex application icon. Schedule association/open behavior and faithful Windows icon conversion in RD08.
- User acceptance criterion: produce a test `.rdx` that imports, maps successfully to YouTrack and accepts both local and native YouTrack changes, retained through file reopen/export. Only after that live isolated proof may all current maps adopt managed `.rdx` files under a fresh backup and accepted conversion preview (RD10). Preserve existing NPCD records as the synced backend, IDs, queued edits, images, proposals/history/testing and all saved credentials.
- Promote the U20I upload-recovery follow-up to RD02: visible uncertain-only retry, separate read/write budgets, incremental checkpoints/verified-upload reuse and bounded no-progress handling. Preserve integrity/privacy/conflict checks; avoid repeated testing and no-progress loops.

**Current authorization:** documentation only. Next is **RD01 — RDX and JSON Workflow Contracts, Sol / High**, after review of the revised phases and a new PASSKEY. No new application implementation, conversion, live publication, installation or project creation is authorized by this planning update. Each later task requires a separate PASSKEY; RD10 also requires its fresh live-data preview acceptance.

## October 18, 2026 — RD01 Contract Design Prepared

The user authorized RD01 with PASSKEY. [Proposed contracts](../../RDX-Reference/RD01-Contracts/README.md) and [review report](../History/RD01/RD01-Review-Report.md) define the map/plan envelope, internal namespace/version routing, portable identity versus backend bindings, lossless container proposal, exact asset references, local checkpoint recovery, previewed updates/removals, fixed JSON package v2, returned map provenance and mandatory human testing. Six workflow walkthroughs and 70 isolated design checks pass. The new schema embeds the pinned native schema without rewriting its identities; legacy migration and current JSON import retain dedicated routes. Compression defaults and final resource limits remain measured RD03 decisions, not untested performance claims.

RD01 is at its planned user-acceptance gate. Application source, installed 0.5.14, live saves/queues and all credentials are unchanged. No compressed RDX, real backend import or ROM extractor was implemented. After acceptance, RD02 is next, Sol / High, under a new PASSKEY; later tasks remain separately gated.

## October 18, 2026 — RD01 Approved and RD02 Authorized

The user explicitly approved the contracts and automatic safe reconciliation of returned task `.rdx` attachments, with human testing still mandatory. RD01 is complete; [completion report](../History/RD01/RD01-Completion-Report.md). The same message separately supplied PASSKEY for RD02, Sol / High. Begin only bounded sync/upload recovery; RD03 and later work remain separately gated.

## October 18, 2026 — RD02 Source Complete

[RD02](../History/RD02/RD02-Completion-Report.md) adds recovery access for uncertain-only uploads, visible progress/manual checks, independent cumulative write budgets, pinned verified-upload reuse and a durable three-attempt no-progress hold. Incoming reads remain active during an outgoing hold; ownership/privacy, hashes, request/write caps and final readback remain enforced. Passed 107 focused tests, 14 new tests under the bundled runtime and isolated recovery UI review. No live data or credential was used for QA. Installed 0.5.14 remains unchanged; include the source fix in later RDX packaging rather than reinstall for every foundation task. RD03 is next, Sol / High, with a new PASSKEY.


## October 18, 2026 — RD03 Source Complete

The user supplied PASSKEY for RD03. Actual RDX files, strict local contract/container validation, raw-DEFLATE/store codecs, hash-deduplicated assets, bounded streaming inflation/cancellation and local pack/unpack/validate tools are implemented. Unknown required features are unsupported; optional extensions survive; legacy inputs require their dedicated context-bound handlers. Passed 93 focused tests, 48 RDX checks under bundled Electron and six syntax checks. Surveyed preserved content bytes read-only: level 9 saves 67.28% of body bytes with approximately one second encoding, so it is the default. Expanding entries remain stored verbatim. The bounded decoder materializes validated buffers; hard limits are not a constant-memory promise.

Installed 0.5.14, live data/queue and remembered credentials are unchanged. Four fictional RDX files are developer-tool examples, not completed app import or YouTrack proof. RD04 (managed documents/portable export) is next, Sol / High, under a separate PASSKEY. RD07 proof, RD08 file association, RD10 accepted adoption and returned-result authorization/testing gates remain in place.


## October 18, 2026 — RD04 Source Complete

RD04 was separately authorized by PASSKEY. The managed-document service/CLI uses explicit Data/RDX storage, FULL SQLite journaling, exact deduplicated assets, retained prior documents/checkpoints and verified atomic working-file replacement. A separate SQLite ownership lock is released by the OS on process exit. Exports require a current verified checkpoint, refuse existing/raced destinations and retain a verified stage until exclusive output/fsync/readback succeed. Hard-link support is not required. Ordinary local edits record user provenance; pending agent-result evidence/testing cannot be cleared through local save/export.

Passed 107 focused checks, 31 managed checks under bundled Electron, seven final provenance rechecks in both, five syntax checks and exact portable acceptance into clean unconnected stores. Eight real process-exit points recover the newer head. Disk-full/corrupt/unknown-file states remain pending/reviewable; no stale export or automatic history discard. The default 2 GiB quota retains prior/recovery data; reviewed compaction is future work. Physical power-cut behavior is not independently certified.

The user asked whether current maps are RDX files: they are not. Installed 0.5.14, existing maps, UI, live queue, saved connections and YouTrack are unchanged. RD05/RD06 integrate previews, RD07 proves live two-way binding, and RD10 converts current maps only after the accepted fresh-data gate. Next: RD05, Sol / High, new PASSKEY required.

## October 18, 2026 — RD05 Source Complete

The user supplied PASSKEY for RD05. NPCDex now has source-integrated local map RDX import/update previews and verified export in Tray 2 Content Tools, using the original contextual editing UI. The new document adapter has no transport or credential capability; connected native content remains independent. Stable revision ancestry supports independent merges; shared-context changes and overlapping drafts require explicit alternatives, retained with history. Covered complete omissions may stage archival/REMOVE proposals; partial omissions retain content. Preview heads/choices are pinned and stale frames cannot write across document switches. Portable review/display claims do not establish human verification.

Passed 178 distinct relevant source/regression checks, 26 map checks in bundled Electron Node mode, four final edit/provenance rechecks, seven isolated browser checks and an actual desktop-service smoke check. This is source evidence, not installed native-window or live YouTrack RDX acceptance. Installed 0.5.14, current production maps, queues and remembered connections remain unchanged. RD06 is next, Sol / High, under a new PASSKEY; RD07 live two-way proof and RD10 fresh production adoption are still mandatory. [Report](../History/RD05/RD05-Completion-Report.md).

## October 18, 2026 — RD06 Source Complete

The user supplied PASSKEY for RD06. The Work Pane source now imports ROMDex plan RDX locally, previews stable-ID updates, edits basic task values and exports verified copies. Explicit PMON destination selection shows rebased tiers and intact subtrees. Typed field/value mapping, original comment provenance, exact attachments, retained omissions and reviewed explicit deletions feed the existing save service only after explicit queue approval. The same transaction stores native operations and local binding/recovery identities. Auto-Sync Off stays Off; no agent dispatch is implied.

Passed 142 distinct relevant checks, 30 plan checks under bundled Electron in Node mode, seven isolated UI checks and a separate actual desktop-service smoke check. All used synthetic data; no credential or live backend write occurred. Installed 0.5.14 and production Data are unchanged. Local binding persistence does not claim cross-computer authority or managed-RDX pullback: those and real isolated YouTrack acceptance are RD07, Sol / High, under a new PASSKEY. [Report](../History/RD06/RD06-Completion-Report.md).

## October 19, 2026 — RD07 Source Complete and Live Two-Way Proof Passed

The user supplied PASSKEY for RD07 and launched one normal Windows verification helper to reuse the protected YouTrack credential. A unique fictional map imported from compressed RDX, created eleven private NPCD content records plus a registry, sent a local NPCDex note and received a native title edit through explicit documentation review. Reopen/export retained both changes and exact image bytes; a second local instance matched the observed registry without duplicate content records. A final-source live delta/readback passed with unchanged credential ciphertext and Auto-Sync Off.

Source adds map publication/binding previews, incremental factored artifacts/history, durable frozen intents, native/branch review and manifest/file caches. PMON native edits fold into managed plans; explicit target matching verifies fields/comments/files before binding. Unknown/unsupported/shared-scope changes stop for review. Agent-result files cannot bypass task-bound reconciliation. Twenty-five new checks passed in the bundled runtime, alongside affected regressions/focused repairs, source-asset UI and desktop-service checks. Existing production records, maps, Data and installed 0.5.14 remain unchanged. [Report](../History/RD07/RD07-Completion-Report.md).

The live milestone is met; production adoption is not authorized by it. RD10 must adopt existing NPCD identities after the separate fresh-data acceptance, not recreate them through the new-map path. Next is RD08, Sol / Medium, under a new PASSKEY.


## RD08 — Windows File Integration and Application Icon, October 19, 2026

The PASSKEY authorized the existing RD08 scope and a pixel-art rendition of the Pokédex application icon matching the suite Pokéball. Preserve original PNG/ICO/SVG bytes. The .rdx file icon remains the exact original Pokéball, independently of application branding.

Validated OS file opens use ordinary local map/plan previews and the single-instance app. Busy editors are preserved, imports/publication remain explicit, and returned agent results cannot bypass task reconciliation/testing. Register per-user owned ProgID/Open With/capability values; preserve Windows UserChoice, other defaults/handlers and Data. Native and disposable installer acceptance passed. Source-complete; installed production remains 0.5.14. RD09 requires a separate PASSKEY, with Sol / Medium as planned.


## RD09 — Agent Authoring Kit, October 19, 2026

Completed under its own PASSKEY. Deliver the same .rdx extension with internal map/plan discriminators, fixed /2 JSON Map Packages and separate exact-byte task bindings. The portable Node 24 kit includes pinned local schemas, deterministic tools, a from-scratch fictional starter, unchanged approved reference bytes and extraction/identity/mapping/return prompts. It needs no app-side AI, account or private save-repository access for local authoring/validation.

Current import/export/binding behavior is distinguished from U21 package attachment and U23–U27 authenticated return automation. Agent returns always require human review/testing; tasks stay open until verified. RD10 separately adopts existing maps from fresh authoritative native data, preserving original NPCD identities and all content/history/credentials rather than repeating migration. Installed production remains 0.5.14. Next model/effort: Sol / High; wait for RD10 PASSKEY and accepted data preview.


## RD10 — One-Map Adoption Completed, October 19, 2026

The original accepted current-data preview and explicit subsequent one-map-per-RDX correction were combined without changing the source dataset. The revised files contain one map and required dependencies; shared collections and full recovery remain separate. Preserved all 211 existing NPCD identities, the original synchronization journal, history and all three protected connections. Fresh complete backup/restoration and local/remote baseline checks preceded activation; installed 0.5.15 acceptance passed. Phase 6 is complete. The requested authoring report recommends reusing the existing compiler/portable kit and inspecting the latest ROM/project before choosing a game-specific extractor; this recommendation does not authorize another implementation task. U21 requires a new PASSKEY.


## October 19, 2026 — ROM Extraction Deferred; Local Cleanup Authorized

The user supplied the latest ROM at `C:/Users/mrgen/OneDrive/Apps/melonDS/melonDS-1.1-windows-x86_64/TEST/0.6.3_noduplicates.nds` and deferred self-contained ROM extraction/JSON authoring/RDX compilation and a possible ROM Import workspace until after the main build. Phase 11 records investigation, a real one-map proof, and a separately reviewed workspace; no extraction has begun. Preserve the ROM outside Git and installers.

The user requested the latest installation, removal of any remaining older installed versions, and consolidation of obsolete ROMDex/NPCDex outputs into one clearly identified folder for manual deletion. Current 0.5.15, application Data/connections, current source, build dependencies, authoring kit, original suite assets and the newest verified complete recovery backup remain retained. Windows registry review found only the current product plus its matching current-version auxiliary .msq entry; there were no older registered products to uninstall. Portable previews and historical verification copies are cleanup candidates, not separate installed products.


## U21 — Familiar Request Selection and Context-Only Packages, October 19, 2026

The user confirmed context-only packages and clarified that the current interface has no Draft/Ready distinction. Do not invent an additional user workflow. Explicitly selected CHANGE/REMOVE/ADD scope is confirmed in the fixed package preview; internal workflow labels remain provenance only. FINAL decisions, notes and flags remain context and never authorize ROM changes. Attachment is separate from agent handoff.

Whole-map/sub-zone entries start selected. The user chooses an existing PMON destination or explicitly creates one under a chosen parent; exact asset/JSON/task binding delivery uses the durable native queue and leaves existing task text/assignment/status unchanged. Full working RDX files and excluded drafts/notes/history stay local, with the immutable source revision pinned for later reconciliation. Required current image assets and their record associations accompany the JSON. Native and live synthetic-task checks passed, and owned QA tasks were removed. U21 is source-complete; installed production stays 0.5.15. U22 requires a new PASSKEY, Sol / High.


## U22 — Exact Navigation and Truthful Progress, October 19, 2026

Completed under its own PASSKEY. Add reciprocal task/map/fixed-version links, individual content targets, immutable item/group rows and durable delivery counts/recovery states. Checkpoint before switching managed documents, preserve editors and reject unavailable exact targets rather than matching names. A task's native Complete state and portable implementation/testing claims cannot authenticate accepted results. Until U23–U27 establish those events, implementation remains Not Reported and human testing Not Verified. This task needs no new installer or live writes; 77 focused regression tests and eight real-source interface checks pass. Installed 0.5.15 remains unchanged. U23 requires a new PASSKEY, Sol / High.


## October 19, 2026 — ROM Import and Extraction Promoted to Core

The user approved moving former Phase 11 ahead of Phase 9 final acceptance/release. This supersedes the earlier post-release deferral. Preserve existing phase/task identifiers for traceability; execution is RI01 (evidence-based scoping) → RI02 (real one-map ROM/JSON/RDX proof) → RI03 (reviewed deterministic ROM Import workspace) → U28/U29/U30 (integrated review, guided acceptance, installer). Notifications remain after U30. Initial coverage is bounded to the supported ROM/game and agreed content, with uncertainties and additional task breakdown resolved during RI01. Reuse valid prior verification; check changed boundaries and the real extraction workflow before final acceptance.

This is approval of the roadmap change only. RI01 needs its own PASSKEY with Sol / High; no ROM has been inspected, no extraction or production replacement authorized, and no saves/sync policy changed. Keep ROM bytes out of Git/releases and read-only.


## RI01 — ROM-only Input Requirement, October 19, 2026

The user clarified that the proof must succeed using the supplied ROM alone; editable project files and another coding agent's prepared JSON are not acceptable dependencies. Open-source tools such as DSPRE may be incorporated, subject to pinned compatibility and redistribution review. Public format references are permitted; the ROM remains the content authority. Investigation has established a structurally readable New Bark candidate and a relocated sprite table. The proposed scope and RI02A–RI03C task breakdown await RI01 acceptance; a completed portable-file/cloud proof has not been claimed. Existing production data and NPCDex pause remain untouched.


## RI01 — Per-Map Timelines and Roman-Numeral Stages, October 19, 2026

The user requires every map/zone RDX to define its own clearly specified timeline from changes/stages relevant to that map, instead of imposing a universal timeline. Stage labels use Roman numerals, preserving the current visible convention. Existing internal A–J IDs are legacy references, not a mandatory stage vocabulary or count. Separate stable stage identity from ordinal/label; preserve contextual notes, plans, flags, source mappings and testing when stage names/order change. Shared world predicates can be referenced without importing unrelated stages; conditional branches remain explicit rather than being forced into an invented linear chronology.

Source inspection found the current native projection and legacy validation still require ten stages. The revised RI01 proposal adds RI02T, before RI02C, to implement per-map storage/projection/filtering/validation and portable mapping, with differing-count/order and legacy-preservation checks. No runtime code or live timeline was changed. RI01's overall scope acceptance remains pending; this clarification is recorded as a required design correction.


## RI01 — Revised Scope Accepted, October 19, 2026

The user explicitly approved the revised ROM-only New Bark proof scope and RI02A/RI02B/RI02T/RI02C/RI03A/RI03B/RI03C sequence, including per-map timelines displayed with Roman numerals. RI01 is complete and checked off. Earlier pending-approval entries above are historical checkpoints. The next separately authorized task is RI02A — ROM Reader and Source Mapping, Sol / High. This acceptance does not start implementation, replace maps or resume production NPCDex sync.


## RI02A — Source Reader and Mappings Complete

Completed under its own PASSKEY. The reader inventories the supplied .nds directly without editable project/agent-prepared content. All 540 physical map headers and their event resources are validated; New Bark's scoped identities and native source mappings preserve exact bytes and reopen unchanged in another process. Known ambiguous object IDs/unresolved warp references remain explicit rather than being repaired or silently trusted. Seventeen focused tests and eight real-ROM proof checks pass. No production or runtime deployment changed. Next separately gated task: RI02B — Dialogue, Events and Appearance Extraction, Sol / High. Per-map Roman-numeral timelines remain RI02T, and the decisive actual RDX/native round trip remains RI02C.


## October 20 — Violet City ROM-only testbed

The user authorized RI02B and replaced the active New Bark proof with Violet City to avoid conflating it with existing data. ROM location section 128 determines its eight physical areas; Sprout Tower stays separate. Earlier New Bark evidence remains historical. RI02B is source-complete; RI02T and RI02C continue with Violet City. Static/runtime ambiguity stays visible, and production saves, queues and the sync pause remain untouched.


## October 20 — Map-specific timeline source support

RI02T is complete in source. Maps select their own referenced progression; stable stage IDs remain separate from names, order and Roman labels. Legacy A–J identities, original recovery bytes and current review/proposal data are preserved. Violet City source-state evidence is local to the proof and does not establish a complete gameplay chronology. RI02C remains the real one-map RDX/native round-trip gate. No production sync, queue or installed application was changed.


## October 20 — RI03A ROM Import Design Approved

The user approved the concrete three-tray design: read-only ROM catalog/maps in Tray 1; locally saved selected-map setup/preparation in Tray 2; contextual content, source evidence, per-map Roman stages, warnings and inline handoff review in Tray 3. Suggested area groups remain adjustable; every prepared/exported RDX contains one logical map. Optional cleanup changes display metadata while retaining source content, stable identities and uncertainty. Semantic warnings may proceed with review; broken structure/unusable mappings block output.

Preparation remains local and recoverable. Export RDX produces a portable copy; Send to NPCDex is an explicit reviewed handoff that keeps the workspace open. Shared Auto-Sync applies after handoff and cannot override the explicit NPCDex pause. Existing-map updates preserve newer edits and recheck their baseline. Bounded worker cancellation/checkpoints and shutdown independent of cloud backlogs are accepted.

At the user's request, add RI03P — Map Cloud-Delivery Performance after RI03B and before RI03C to reduce cold-publication/later-sync request overhead without losing exact data, stable hierarchy or conflict safety. Final sequence: RI03B → RI03P → RI03C → U28–U30. RI03A is complete; each following task still needs its own PASSKEY. No production saves, queue, credentials, sync pause or installed build changed.
