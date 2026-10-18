# ROMDex — Desktop and Add-on Action Plan

**Date:** October 14, 2026  
**Status:** U01–U20H and approved intervening tasks are complete. **U20I is in progress**: ROMDex **0.5.13** is installed with verified Data/credential preservation. Human transition acceptance and normal Quit/reopen passed; final queue delivery and native/remote checks remain open. U21 remains separately gated.
**References:** [Scope](NPCDex-ROMDex-Unified-App-Scope.md), [Decision Log](NPCDex-ROMDex-Decision-Log.md).

**Execution tracking:** [Action Checklist](NPCDex-ROMDex-Action-Checklist.md). Current: **U20I — Complete the Native Content Tree, Sol / High**, under its [scope and acceptance checklist](U20I-Native-Content-Tree-Plan.md). Implementation, isolated/backend verification, package checks, installation, human transition acceptance and normal Quit/reopen are complete; cloud delivery and final remote verification are not.

## Working Agreement

Execute the tasks below in order, one at a time. Each task requires a new PASSKEY. After each task, report the changes, verification, remaining issues, and any clarification required, then stop. Name the recommended model and effort for the next task before asking for its PASSKEY. A design task produces a reviewable proposal; its approval does not authorize later implementation automatically. Subdivide a task if discovery shows it cannot reasonably be completed as one reviewable change set.

Use browser checks sparingly: focused visual verification for changed interfaces, automated checks for data and synchronization behavior, and a final integrated review. Preserve current working data and remembered credentials across every build. Never migrate an old packaged export over newer working data.

Keep the installed tools usable throughout content-backend work. Completed desktop/cloud migrations and protected backups remain intact. NPCD provisioning and the accepted content migration are complete; removal of the frontend compatibility scaffold and map-package publishing remain separately gated work.

## Confirmed Requirements

- One Windows application, distributed with an installer and Start Menu shortcut.
- The application is named **ROMDex**; NPCDex is a built-in add-on to the ROMDex workflow. The active-tool header still shows the active tool.
- Approved host: **Electron**, with an application-owned background save/sync service. U13A supersedes U02's installer/storage choice: **per-user Forge/WiX MSI**, with retained saves under the application's **Data** folder. See [storage revision](U13A-Storage-and-Installer-Revision.md).
- Application updates: **Notify Me and Ask Before Updating**, separate from data Auto-Sync. Private installers are **unsigned**; revisit signing before wider distribution.
- Closing the window leaves the app running in the Windows tray; explicit Quit stops it.
- Active-tool title, with a minor shared-header redesign reviewed before implementation.
- NPCDex Data in the cog menu; Male/Female at the top of Tray 2 left of its cog; Flags & Notes at the top of Tray 1.
- Shared Save Changes and Auto-Sync for both tools. Manual Save performs one cycle while Off and leaves automatic sync Off.
- A failed connection does not stop healthy services from syncing.
- Owner-only human access across computers; separately limited agent integration access.
- Free hosting only. Provider selection must demonstrate a fit within free limits; no paid fallback is assumed.
- U03 confirmed **no payment method or usage-based billing**, **private installers**, and **avoid weekly inactivity pauses**. During U14 the user revised save storage to a separate private **GitHub** repository; **YouTrack** remains authoritative for tasks and every agent-required report/file/image/instruction/receipt. Actual access and transfer limits are checked at setup; concurrency is proven before migration. The revised U04 transport must preserve its domain/conflict safeguards.
- Scale: one owner initially, possibly a second person, ten at the extreme. Future access needs explicit approval; no team UI is added by this context. U14 did not establish the actual YouTrack subscription/user/storage ceiling; do not assume capacity or add accounts from headline free-plan limits.
- Private installer delivery now uses the approved private GitHub repository/releases established in U13B. Preserve private visibility, protected credentials and existing update consent.
- NPCDex data, images, history, and receipt records synchronize through the cloud with a durable local cache.
- ROMDex tile images, manual order, and saved parent statuses also synchronize through that store, separately from YouTrack task fields.
- Native YouTrack task edits continue to flow back to ROMDex. Shared fields linked into NPCDex require an explicit mapping.
- ROMDex selectors now use Epic → Saga → Story → Verse; existing levels are relabeled without new parent issues. Only one branch per expandable tier can be open, and Verse does not expand. Lower levels remain Tasks in Work.
- Preserve existing receipt/history compatibility. The U20 proposal uses validated direct content-record updates as the normal result route; stale, conflicting, invalid or unauthorized results enter review. Independent results can apply separately; dependent groups apply together. Acceptance never certifies in-game testing.
- The user confirmed choosing an existing task or explicitly creating one for a map package. No automatic per-entity execution tickets, assignment or agent dispatch. NPCDex remains a planning/staging tool.
- Package selected map-level proposals as one fixed, versioned JSON document attached to a chosen YouTrack task, with stable target mapping, necessary assets/context and agent instructions. Preserve newer drafts when an older package is implemented. The U20 design and revised Phases 4–6 are accepted; implementation remains separately authorized per task.
- After the principal release, scope and implement ROMDex notifications for agent-created tickets, comments and messages. Source/channel definitions, agent identification, background delivery and notification preferences require U31 review before implementation; see Phase 8.

## Models and Effort

Recommendations below are project judgments, informed by [official OpenAI model-selection guidance](https://developers.openai.com/api/docs/guides/model-selection): use Sol for most implementation, reserve Astra for difficult contract/reconciliation design and integrated review. Here **Sol** means GPT-6.1 Sol and **Astra** means GPT-6 Astra; use the corresponding available model in the app. Effort names are Medium, High, and Extra High. They are starting recommendations, not a guarantee about token use or correctness. Escalate only when evidence justifies it, and discuss that before the next task starts.

## Phase 0 — Baseline, Architecture, and Design

**Completed pre-launcher enhancements:** [ROMDex Enhancement Plan](ROMDex-Pre-Launcher-Enhancement-Plan.md), R01–R08. U02–U05 are research/design tasks using the verified 0.4 enhancement baseline; U02–U04 are approved and complete. Later implementation still requires task-specific PASSKEYs.

### 0A. Preserve the Foundation

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U01 | Inventory latest NPCDex sources and actual working saves, ROMDex 0.3.0, assets, storage locations, and receipt contracts. Produce a baseline and migration inventory with protected backups. | Identify authoritative current datasets and recovery paths without exposing credentials or altering live data. | Sol / Medium |

### 0B. Choose the Technical Foundation

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U02 | **Complete:** compared hosts and obtained approval for Electron/Forge/Squirrel, background service, stable data/profile boundaries, ROMDex branding, Notify and Ask updates, and unsigned private testing. | [Approved design](U02-Desktop-Host-and-Distribution-Design.md), [completion report](U02-Completion-Report.md). | Sol / High |
| U03 | **Complete:** measured current data, compared free providers and obtained approval for existing YouTrack-first workspace storage and private release delivery, with private GitHub Releases as a conditional fallback. | [Approved comparison](U03-Free-Cloud-and-YouTrack-Storage-Comparison.md), [completion report](U03-Completion-Report.md). Setup must still verify actual plan, space, permissions and limits. | Sol / High |
| U04 | **Complete and user-approved October 15:** defined ownership, IDs, revisions, local cache, queues, merge rules, receipt inbox and migration for YouTrack-backed workspace storage. Specify immutable publication, asset/hash and decompression limits, complete discovery, idempotency, branch handling, compaction/retention, member isolation and limited agent access. Compare a server app only if required; do not assume a generic REST compare-and-swap. | Review/prove two-writer/offline/uncertain-upload failures before live migration; preserve assigned/effective State separation and exact NPCDex contracts. If no safe protocol fits, revise the provider decision with the user. | Astra / High |

### 0C. Review the Shared Interface

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U05 | **Complete and user-approved:** [Footer Workspace Menu development placeholder](U05-Shared-Header-and-Control-Layout-Proposal.md), shared Save/Auto-Sync, connection-light details and settings; decorative circles corrected to red → yellow → green for U06. | [Review report](U05-Review-Report.md), [footer verification](U05-Footer-Layout-Verification.json). Later implementation remains separately gated. | Sol / High |

**Gate:** U01–U05 produce an approved design and architecture. No provider provisioning or desktop implementation is included in these research/design tasks.

### Side Commit Before Phase 1

Added by the user during U05; requires completed U05 design review and a separate PASSKEY. This is a bounded enhancement to the existing ROMDex build, before U06.

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| S01 | **Complete in 0.4.1:** made the paperclip light/crisp like Notes; add Delete for native ticket attachments with queued/uncertain-outcome handling; select All Tasks on fresh launch while preserving in-session context on tool switches/tray restore. | Focused icon comparison, safe controlled delete/permission/recovery checks and list/cache/paperclip refresh; startup-scope checks; current data/credentials preserved. No production-file deletion for QA. | Sol / High |

## Phase 1 — Combine the Interfaces

### 1A. Shared Appearance and Control Locations

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U06 | Extract shared theme rules, favicon, Standard Settings Icon, indicator geometry, buttons, and tray styling; implement the approved header layout, including the temporary red workspace switcher immediately before the top-right controls at 80% of their height, with no footer allocation, and decorative title circles ordered red → yellow → green. | Focused comparison confirms consistency without changing tool behavior. | Sol / Medium |
| U07 | **Complete:** relocate NPCDex Data, Male/Female, and Flags & Notes to the confirmed homes; [report](U07-Completion-Report.md). | Existing actions and keyboard access work; controls align with the approved layout. | Sol / Medium |

### 1B. Switching and Shared Save Coordination

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U08 | **Complete in 0.4.2:** switching between retained workspaces preserves selection, navigation, scroll, filters, pane sizes, and unfinished edits; [report](U08-Completion-Report.md). | Switching during editing loses no text or state; each tool returns to its previous context. | Sol / High |
| U09 | **Complete in 0.4.3:** introduced shared Save/Auto-Sync coordination, injectable durable storage and a headless engine separated from renderer timers, around existing YouTrack operations. Report capabilities until cloud support is added. | One queue owner; manual Save while Off leaves it Off; provider failures remain independent. UI does not claim cloud delivery before that capability exists. | Sol / High |

## Phase 2 — Windows Desktop Milestone

### 2A. Native Window and Background Lifecycle

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U10 | **Complete as 0.5.0-preview.10:** hosted the combined interface and service in approved Electron: bundled runtime, scoped tool views, secure protocol/bridge, native file adapters and utility-process engine. Verify script-policy/ESM compatibility. | Both tools work without separately installed Chrome/Node or a command window; domain regressions pass against the bundled runtime. | Sol / High |
| U10F | **Complete in 0.5.0-preview.10f:** added external file drops onto Work Pane tickets through the native file adapters and existing durable attachment queue; highlight the destination and preserve internal hierarchy dragging. [Scope](Desktop-File-Drop-Attachments-Plan.md). | Explorer/desktop single and multiple files, offline/Auto-Sync Off, restart recovery, validation and unchanged hierarchy drag behavior. Separate PASSKEY after U10. | Sol / High |
| UX01 | Review future homes/grouping for Connections, Application Updates, About ROMDex and Quit after removal of the header cog. [Inventory](Deferred-Application-Commands.md). | Complete: user approved Windows tray placement, existing header retained. [Approved proposal](UX01-Application-Command-Placement-Proposal.md). Implementation remains U11. | Sol / Medium |
| U11 | **Complete in 0.5.0-preview.11:** approved tray menu, close/restore, orderly Quit, instance/profile ownership, renderer/utility recovery and original Pokédex icon. [Report](U11-Completion-Report.md). | 258 tests, six service/restart and twelve desktop scenarios; pending work and prior data preserved. | Sol / High |

### 2B. Migration and Installation

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U12 | Migrate current saves, ROMDex metadata, and the remembered connection into a persistent desktop profile, keeping original backups. **User-confirmed authority: the latest live web save is correct; the desktop baseline differs and must not overwrite it.** | Latest data and images survive migration, replacement builds, and rollback; credentials remain protected and outside the installer. | Sol / High |
| U13A | Build the per-user Forge/WiX MSI, shortcuts, stable identity and version display. User clarification: keep active saves inside the application folder and retain Data on uninstall. Verify copying the established U12 profile into Data. Measure the artifact and assess private YouTrack delivery against accessible configuration/space; record permission gaps and propose private GitHub only if needed. | Install, reopen, upgrade and uninstall/reinstall retain Data/credentials; originals survive relocation. Record size/resource use. No global limit is raised silently. | Sol / Medium |
| U13B | Add approved private release-index checks, update notices, Update Now/Later consent, verified streaming download, signed release metadata and orderly install handoff. Provision only the approved route for this task. | No unapproved download/install or public artifacts; invalid/older files are rejected; failed/cancelled updates retain work. A large updater transfer must not silently reuse R07's 50 MB viewing path. Requires U13A. | Sol / High |

**Milestone A:** Usable combined Windows app with local persistence and ROMDex's existing YouTrack sync. NPCDex cloud sync is the next phase.

## Phase 3 — Free Cloud Persistence and Bidirectional Sync

### 3A. Account and Dataset Foundation

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U14 | Configure the user-approved private GitHub save repository, stable workspace/namespace identity and owner-only access; retain YouTrack task/agent transport separately. Revise and prove U04's storage transport using immutable records and guarded Git publication, including concurrency, offline bases, uncertain outcomes, bounds and unauthorized access. Protect a separately scoped runtime save credential without changing existing update/YouTrack tokens. | Synthetic file/revision round-trip, competing writers, restart/discovery and anonymous/authenticated-unapproved access checks pass. No real save migration, paid feature, Actions, LFS or global YouTrack change. Required agent data must remain deliverable entirely through YouTrack. Return for review if prerequisites fail. | Sol / High |
| U15 | Add a previewed NPCDex import into the approved private GitHub store from the latest working save, preserving IDs, source evidence, flags, plans, current/historical images and receipt contracts. | Compare counts/content hashes and hydrated export semantics; retain originals and prove recovery before changing the primary save destination. | Sol / High |

### 3B. Durable Synchronization

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U16 | Implement local-first edits, a persisted outgoing queue, incoming revisions, retry, and catch-up across restart/offline periods. | Edits survive interrupted sends and crashes; changes from another authenticated client appear locally; retries do not duplicate operations. | Sol / Extra High |
| U17 | Merge independent edits and present overlapping edits for review against known base revisions. | Two-device edits preserve both independent changes; conflicting updates cannot silently overwrite data or partially apply transactions. | Sol / Extra High |
| U18 | Extend cloud synchronization to ROMDex tile images, manual order, and saved parent statuses. | Metadata follows the account across devices without overwriting YouTrack-owned fields; hierarchy/order validity survives native task changes. | Sol / High |
| U19 | Complete the shared Save/Auto-Sync and indicator behavior for cloud plus YouTrack, including service-specific connection details; correct stale help that still describes NPCDex as local-only. Include shared-header polish: reduce the circular workspace toggle diameter by 30% from its current size (to 70%) and remove its drop shadow. | Healthy syncing does not flash Save red; unsendable pending work requires attention; Off and manual one-cycle behavior match ROMDex. Verify the smaller shadow-free toggle remains centered, opens its menu and switches between both workspaces without losing view state. | Sol / High |

**Milestone B:** Both workspaces have durable cloud-backed data and recovery. Confirm with controlled data and then a previewed real-workspace migration.

## Phase 4 — Approved Content Architecture Revision

**U20 design approved October 16, 2026.** [Consolidated architecture and revised plan](U20-Consolidated-Architecture-and-Revised-Plan.md) replaces the earlier future ticket/receipt sequence, preserved in [the prior future-phase plan](U20-Previous-Future-Phase-Plan.md). The confirmed individual decisions are recorded in [the discussion log](U20-Architecture-Discussion.md). Later task-specific approvals completed U20A–U20H and the accepted NPCD cutover; the checklist records those gates. U20I and U21–U33 implementation still require their own PASSKEYs.

### 4A–4H. Review, Prove, Migrate and Finish Native Content Assembly

| Phase | Task | Deliverable and acceptance gate | Model / Effort |
| --- | --- | --- | --- |
| 4A — Finish design | U20 | Complete: user approved the consolidated behavior/ownership/roadmap October 16, 2026. No application or live-system changes. | Sol / Medium |
| 4B — Define records | U20A | Complete and user-approved October 16: [contract/schema/examples and extraction guide](U20A-Review-Report.md), 45 isolated model/legacy checks passed. | Sol / High |
| 4C — Prove YouTrack storage | U20B | Complete October 17. Owner-created NPCD, private fixture transfers/links, competing versions, separate-process interrupted-group recovery and cleanup proved. [Measured limits](U20B-Completion-Report.md); actual agent grants remain U23. No migration. | Sol / High |
| 4D — Read and assemble | U20C | Background registry reader, durable cache/recovery and dynamic NPCDex projection in an isolated profile. Preserve the familiar interface, shared Save/Auto-Sync semantics and separate content/work views. No live source switch. | Sol / High |
| 4E — Plan and correct | U20D | Backend planning/correction writes, shared profiles/local overrides, planned additions and archival lifecycle. Prove draft/current separation, offline writes and conflict recovery using isolated data. No implicit execution task or handoff. | Sol / High |
| 4F — Migrate safely | U20E | First prove latency, reconstruction and retention at the full dataset size; then preview the latest real dataset, preserve complete originals, validate mappings/assets/history and activate one authoritative provider only after the user's migration acceptance. Define GitHub backup behavior and recovery without enabling a second editable master. | Sol / High |
| 4G — Accept content backend | U20F | Installed-app acceptance, dynamic add/update from YouTrack, native edit/conflict/offline cases, exact save/credential preservation, backup restoration and verified private release. Stop for review before packaging implementation. | Sol / High |
| 4H — Complete native content assembly | U20I | Replace the migrated-save scaffold with projection from structured NPCD records for all maps, sub-zones and entities. Preserve the original interface, identities, aliases, shared scenes/profiles, gender/timeline behavior, images, drafts, feedback and history. Add a validated, previewed new-map/sub-zone import path and agent extraction/import instructions; prove a new map end-to-end in isolated backend and installed-app checks. Original exports remain recovery/history only. [Detailed acceptance gate](U20I-Native-Content-Tree-Plan.md). | Sol / High |

**Milestone C:** The content-backed NPCDex has passed isolated proof, a previewed real migration and installed-app acceptance; task execution still requires explicit user handoff.

**October 18 transition gate:** U20E/U20F completed backend migration and acceptance for the migrated workspace, not full removal of the original-save presentation scaffold. U20I closes that explicit remaining gap before U21. Complete frontend assembly and new-map imports must not depend on parsing the original export; preserve it only for recovery, historical hashes and audit. Do not repeat the migration or re-extract existing ROM data merely to remove this presentation dependency.

**Scheduling contingency — October 16, not adopted:** [U20C1 — Independent Content Reader, Cache and Preview](U20C1-Independent-Reader-Plan.md) was proposed while the instance owner was unavailable. The user then reported that owner setup is underway and withdrew the diversion. Retain the split as reference only; current execution returns to U20B, then the original U20C scope under its separate PASSKEY. No U20C1 work began.

## Phase 5 — Map Documents and Actionable Tasks

| Phase | Task | Deliverable and acceptance gate | Model / Effort |
| --- | --- | --- | --- |
| 5A — Package and attach | U21 | After U20I acceptance: one map document, whole-map selection preview, existing/new PMON task chooser, explicit attach, immutable versions and duplicate-safe retry. Preserve unrelated task content and expose newer-draft/superseded-package state. | Sol / High |
| 5B — Navigate and track | U22 | Task/content/package links and per-package/item/group progress. Match attached package versions; no implicit dispatch or task completion. | Sol / High |

**Planning boundary:** NPCDex produces a single fixed map-change document, with whole-map/sub-zone pending plans, flags and notes preselected and preview exclusions. The user selects an existing PMON task or explicitly creates one, then confirms attachment. No automatic agent dispatch, assignment or task-state advance. Current content remains primary with proposals appended; older implemented packages preserve newer drafts. All agent-required mappings/context/assets must be accessible on YouTrack without private GitHub save access.

## Phase 6 — Direct Backend Results, Review and Testing

| Phase | Task | Deliverable and acceptance gate | Model / Effort |
| --- | --- | --- | --- |
| 6A — Approve agent contract | U23 | Concrete ROM mapping/execution/update walkthrough, verified execution identity/grants, versioned direct content-update format, partial/group handling and readiness notice. Review before enabling agent updates. | Sol / High |
| 6B — Discover results | U24 | Durable discovery of agent-authored backend content revisions and package/group completion evidence, with restart, replay, offline/manual-cycle and uncertainty recovery. | Sol / High |
| 6C — Validate and apply | U25 | Validate and automatically project completed independent results or full dependent groups. Preserve newer drafts, validate authorization/baselines, reset testing and retain conflict alternatives. A separate receipt file is not the normal return route. | Astra / High |
| 6D — Review exceptions | U26 | Human review for incomplete/stale/conflicting results, corrections and mismatched groups, with previews, defer/reject/retry and no partial dependent-group application. | Sol / High |
| 6E — History and verification | U27 | Undo/archive/reversal evidence, task testing checklist and readiness/completion gates. User verification remains necessary; no automatic ROM reversal or premature closure. | Sol / High |

**Result boundary:** The normal return is a versioned update to the relevant content records, not a separate receipt file for the user to import. Preserve the validation/evidence function and legacy recovery compatibility. Apply completed independent items; dependent edits update as a complete validated group. Reset affected testing to Unreviewed. The agent announces readiness for testing; tasks stay open until user verification. A PMON task comment is the proposed initial notice route; desktop push delivery remains Phase 8.

**Actor/access gate:** Existing broad owner/developer connectors do not establish a restricted ticket-agent identity. Verify the actual execution identity and available project/issue/attachment permissions at U20B/U23; claimed JSON actor labels are not authentication. Do not grant owner credentials or private save-repository access for convenience.

**Milestone D:** Approved map work can move from a PMON task to ROM implementation and validated content-record updates, with incremental progress, retained drafts and human verification.

## Phase 7 — Final Quality Review and Release

### 7A. Integrated Review

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U28 | Review the full implementation and run integrated failure/concurrency scenarios across switching, desktop lifecycle, cloud, YouTrack, requests, and backend results. | No unresolved data-loss or reconciliation failures; installer/upgrade retains saves and credentials; targeted fixes receive their own scoped follow-up if needed. | Astra / High |
| U29 | Conduct a guided real-workspace acceptance pass with previewed migration and deliberately isolated QA records. | User confirms UI/workflow; native YouTrack edits and cross-device updates are visible, including fresh-computer account connection and reviewed content-root bootstrap; QA artifacts are cleaned without restoring stale real data. | Sol / High |

### 7B. Release and Handoff

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U30 | Produce the verified installer, release manifest, backup/restore guide, account setup instructions, agent integration contract, and QA report. | Installed release matches reviewed source; secrets and private working data are excluded; recovery and upgrade instructions are usable. | Sol / Medium |

## Phase 8 — Agent Contact Notifications After the Principal Release

Scheduled after U30 so notifications do not delay cloud persistence or the package/backend-result workflow. This is a planning addition only; each task needs its own PASSKEY. Notifications are separate from application update notices. The app must not promise delivery while fully quit without an approved, verified delivery mechanism.

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U31 | Review notification user stories: agent creates a ticket, adds a comment or sends a message. Define which sources count as messages, how agents are identified, eligible projects/tickets, unread state, native Windows alerts versus in-app activity, quiet/mute preferences, Auto-Sync interaction and delivery while hidden, offline or fully quit. Compare routes within the existing free-only/no-billing constraints. | User approves concrete event examples, relevance rules and delivery expectations before implementation. No extra messaging service, broad polling scope or automatic agent outreach is assumed. | Sol / Medium |
| U32 | Implement the approved activity retrieval and durable event/unread store, reusing existing YouTrack/service adapters where appropriate. Preserve source identity, ticket/comment/message references and discovery progress; distinguish incoming agent activity from the user's own actions and ROMDex's automation. | Catch-up after offline periods/restart loses no eligible events; repeated retrieval does not duplicate events. Access boundaries and the approved Auto-Sync policy hold. | Sol / High |
| U33 | Add approved Windows notifications and in-app activity access with click-through to the relevant ticket, comment or message. Support the preferences approved at U31 and verify installed-app/tray behavior. | Test all three event types, hidden-window delivery, click-through, unread/read transitions, permissions, muted/burst activity, restart/catch-up and duplicate suppression. Report fully-quit behavior accurately; issue a tested release with retained saves/credentials. | Sol / High |

## Deferred Decisions and Explicit Gates

| Decision | Resolve By |
| --- | --- |
| Existing desktop, cloud and header foundations | U02–U19 complete; retain their accepted behavior and preservation requirements. |
| Content ownership, staging/package behavior and revised roadmap | U20 consolidated design review, before U20A. |
| Versioned content/plan/result contracts, ROM mapping and representative documents | U20A schema review, before storage implementation. |
| Content project identity, actual permissions/capacity, actor attribution and transport safety | U20B isolated proof, before content migration; owner assistance if required. |
| Latest real-data preview, one authoritative provider, backup and rollback | U20E migration acceptance and U20F installed-app acceptance. |
| Frontend independence from the original-save scaffold, new-map import and agent extraction instructions | U20I installed acceptance before U21; actual ROM/source verification requires supplied project evidence. |
| Package preview, existing/new task defaults, attachment/replacement and retry behavior | U21, under the confirmed planning-only boundary. |
| Agent execution identity, direct-update protocol, grouped results and readiness notice | U23 review before enabling U24/U25 agent-result discovery/application. |
| Agent identity, message sources, notification preferences and background/quit delivery | U31 after the principal release; before U32/U33 implementation. |

Tasks later in the plan are provisional until their design checkpoints are completed. Current desktop/cloud behavior remains available while the content architecture is reviewed and proved. Earlier completion narratives below are historical checkpoints; the status and checklist at the top control current execution.

**Current boundary:** U20I is authorized and in progress. Complete the native content tree and verified import path before U21. Any real-data transition requires fresh preview acceptance; U21 needs its own PASSKEY.


## R08 — Release Completed, October 14, 2026

ROMDex 0.4.0 is the verified enhancement baseline. Passed 207 extracted-package tests, 51 module syntax checks, launcher parsing, combined isolated browser checks and controlled real YouTrack two-way field/file/conflict/subtree verification. Four marked QA tickets were cleaned; all 299 original issue IDs remain. The user launched the new folder: expected running installation/build and all 28 public asset hashes match, saved credential ciphertext is unchanged, connection/Auto-Sync are healthy, and no pending or blocked work remains. The 69-file ZIP/manifest and protected 47-file saved-data checkpoint are verified, including NPCDex revision 72. See [R08 Completion Report](R08-Completion-Report.md) and [Baseline Update](R08-Baseline-Update.md). At R08 completion, the next approval boundary was U02; it was subsequently authorized and completed below.


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


## U13A — Completed October 15, 2026

ROMDex **0.5.2** is installed and running normally with current data, the remembered connection and diagnostic ports closed. Saves are inside the application Data folder and retained on uninstall, superseding the earlier external-profile/Squirrel design. Current data: **299 tasks, 104 order entries, no pending work, NPCDex revision 72**; exact original NPCDex/order/images/credential preservation and genuine YouTrack field equality verified. Passed **287 tests, 89 syntax checks, 200 final application hashes**, real Windows encryption migration, isolated MSI install/upgrade/uninstall/reinstall and current-data/normal relaunch checks. Original U12 delivery and source data remain preserved. [Completion report](U13A-Completion-Report.md), [desktop evidence](U13A-Desktop-Verification.json).

Private delivery remains unprovisioned: YouTrack upload settings returned HTTP 404 and server capacity is unverified; no upload or global-limit change occurred. **Next: U13B — Approved Update Notifications and Installation, Sol / High**, under a new PASSKEY. NPCDex cloud remains U14–U19.


## U13B — Completed October 15, 2026

Installed ROMDex **0.5.3** adds approved private signed updates, separate download/install consent and a checkpointed Windows handoff. Private GenericCola/ROMDex now hosts organized source/history/deferred work and the verified installer. Passed **305 tests, 98 syntax checks, 214 installed hashes**, genuine isolated upgrade/reopen/uninstall, exact 96-file live Data preservation, genuine YouTrack equality, read-only private update access and normal automatic-sync relaunch with diagnostics closed. Current saves remain **299 tasks, 104 order entries, no pending work, NPCDex revision 72**. Credentials/private signing keys/live Data are excluded from Git. [Completion report](U13B-Completion-Report.md), [evidence](U13B-Desktop-Verification.json). NPCDex cloud remains U14–U19. **Next: U14 — Private YouTrack Storage and Access Rules, Sol / High**, requiring a new PASSKEY. No U14 work was performed.


## U14 Completed — Private GitHub Saves and YouTrack Agent Handoffs

The user approved the hybrid provider revision: separate private GenericCola/ROMDex-Data for saves/assets/history and ROMDex metadata; YouTrack retains native tasks and every agent-required handoff dependency/receipt. Provisioned stable workspace identity with Actions disabled and no new collaborators. Passed nine focused tests, six live transport checks, anonymous/authenticated-unapproved access checks, separately scoped save-token write validation and protected restore in another Windows process. Both prior credentials and all 214 installed files remain unchanged. No real saves were uploaded and application cloud sync is not implemented. [Report](U14-Completion-Report.md), [evidence](U14-Storage-Verification.json). **Next: U15 — Previewed NPCDex Cloud Import, Sol / High**, requiring a new PASSKEY and preview acceptance before migration.


## U15 Completed — Approved Initial Cloud Copy

The user approved the native preview of the current saved NPCDex revision 73. Exact original bytes, including 159 current/historical embedded image occurrences, are preserved in private ROMDex-Data and a checked application-folder backup. Passed 19 focused tests, accepted live publication/download verification and recovery in a fresh Windows process. All three credentials and 214 installed application files remain unchanged. Local saves remain primary; no continuous synchronization is active. [Report](U15-Completion-Report.md), [evidence](U15-Cloud-Import-Verification.json). **Next: U16 — Durable Incoming/Outgoing Sync, Sol / Extra High**, under a new PASSKEY.
