# ROMDex — Desktop and Add-on Action Checklist

**Started:** October 14, 2026.  
**Plans:** [Unified Action Plan](NPCDex-ROMDex-Unified-App-Action-Plan.md), [ROMDex Enhancements](ROMDex-Pre-Launcher-Enhancement-Plan.md).
**Rule:** One approved task at a time. Check off only verified completion, report the result, name the next recommended model/effort, and await a new PASSKEY. Approval of U01 does not approve R01 or any later task.

**Current:** **RI03P — Map Cloud-Delivery Performance is complete in source, October 20, 2026.** [Completion report](RI03P-Completion-Report.md). Compressed delivery, bounded metadata checks and MAPDex publication progress passed targeted/live checks; exact owned QA records are absent. The separately user-authorized clean NPCDex reset is complete: its legacy data/queue are archived, 224 prior NPCD records cleared, and the saved connection/sync re-established. See the operational update below. **Next: RI03C — Coverage and Integrated Feature Acceptance, Sol / High, awaiting a separate PASSKEY**, then U28–U30.

## Completed Foundation

- [x] **U01 — Baseline Inventory and Protected Backups** — Sol / Medium. Completed October 14; [inventory and verification](U01-Baseline-Inventory.md).

## ROMDex Enhancements Before Launcher Development

- [x] **R01 — Details Opening and Context-Sensitive TAB** — Sol / Medium. Completed October 14; [completion report](R01-Completion-Report.md).
- [x] **R02 — Compact Four-Tier Selector Tiles and Exclusive Expansion** — Sol / Medium. Completed October 14; [completion report](R02-Completion-Report.md).
- [x] **R03 — Toolbar, ESC Behavior, and In Development Status** — Sol / Medium. Completed October 14; [completion report](R03-Completion-Report.md).
- [x] **R04 — Dense Rows and Checkbox Selection** — Sol / High. Completed October 14; [completion report](R04-Completion-Report.md).
- [x] **R05 — Same-Parent Grouping and Bulk Drag** — Sol / Extra High. Completed October 14; [completion report](R05-Completion-Report.md).
- [x] **R06 — Full Edit Menu and All Editable PMON Fields, Including Tags** — Sol / High. Completed October 14; [completion report](R06-Completion-Report.md).
- [x] **R07 — YouTrack Attachments and Previews** — Sol / High. Completed October 14; [completion report](R07-Completion-Report.md).
- [x] **R08 — Enhancement QA and Release** — Sol / High. Completed October 14; [completion report](R08-Completion-Report.md).

## Phase 0 — Remaining Architecture and Design

- [x] **U02 — Desktop Host and Distribution Design** — Sol / High. Completed and user-approved October 14; [design](U02-Desktop-Host-and-Distribution-Design.md), [report](U02-Completion-Report.md).
- [x] **U03 — Free Cloud Provider Comparison** — Sol / High. Completed and user-approved October 14; [YouTrack-first comparison](U03-Free-Cloud-and-YouTrack-Storage-Comparison.md), [report](U03-Completion-Report.md).
- [x] **U04 — Data Ownership and Synchronization Contracts** — Astra / High. Completed and user-approved October 15; [contract](U04-Data-Ownership-and-Synchronization-Contracts.md), [report](U04-Review-Report.md).
- [x] **U05 — Shared Header and Control Layout Review** — Sol / High. Completed and user-approved October 15; [footer placeholder and circle-order correction](U05-Review-Report.md).

## Side Commit Before Phase 1

- [x] **S01 — Attachment Controls and Startup Scope** — Sol / High. Completed October 15 in ROMDex 0.4.1; [report](S01-Completion-Report.md), [live verification](S01-Live-Verification.json).

## Phase 1 — Combined Interfaces

- [x] **U06 — Shared Theme and Approved Header** — Sol / Medium. Completed October 15; header workspace button at 80% control height, no footer, shared assets and red → yellow → green lamps. [Completion report](U06-Completion-Report.md).
- [x] **U07 — Relocate NPCDex Controls** — Sol / Medium. Completed October 15; [report](U07-Completion-Report.md).
- [x] **U08 — Tool Switching and Preserved Workspace Context** — Sol / High. Completed October 15 in ROMDex 0.4.2; [report](U08-Completion-Report.md).
- [x] **H01 — Header Cog Removal and Connection Alignment** — Completed October 15; [report](Header-Correction-Report.md).
- [x] **U09 — Shared Save and Auto-Sync Coordination** — Sol / High. Completed October 15 in ROMDex 0.4.3; [report](U09-Completion-Report.md).

## Phase 2 — Windows Desktop

- [x] **U10 — Native Desktop Window and Local Service** — Sol / High. Completed October 15; [desktop preview report](U10-Completion-Report.md).
- [x] **U10F — Desktop File Drop Attachments** — Sol / High. Completed October 15; [report](U10F-Completion-Report.md). After U10, before U11; reuse the native adapters and existing upload queue. [Scope](Desktop-File-Drop-Attachments-Plan.md).
- [x] **UX01 — Application Command Placement Review** — Sol / Medium. User-approved October 15; existing header retained, application commands assigned to the Windows tray menu. [Approved placement](UX01-Application-Command-Placement-Proposal.md), [report](UX01-Completion-Report.md).
- [x] **U11 — Tray Lifecycle and Orderly Quit** — Sol / High. Completed October 15 in 0.5.0-preview.11; approved tray commands, renderer/utility recovery, profile ownership and original Pokédex app icon. [Report](U11-Completion-Report.md).
- [x] **U12 — Persistent Profile and Current-Data Migration** — Sol / High. Completed October 15 in 0.5.0-preview.12; current saves and protected connection migrated, live and build-folder restart checks passed. [Report](U12-Completion-Report.md).
- [x] **U13A — Windows Installer and Upgrade/Uninstall Preservation** — Sol / Medium. Completed October 15 in installed ROMDex 0.5.2; current saves and protected connection verified, Data retained on uninstall. [Completion report](U13A-Completion-Report.md).
- [x] **U13B — Approved Update Notifications and Installation** — Sol / High. Completed in installed 0.5.3; private signed delivery, consent, handoff and current-data/credential preservation verified. [Report](U13B-Completion-Report.md).

## Phase 3 — Cloud Persistence

- [x] **U14 — Private Cloud Storage and Access Rules** — Sol / High. Private GitHub setup, access separation, transport proof and protected credentials verified; YouTrack retains all agent handoff material. [Report](U14-Completion-Report.md).
- [x] **U15 — Previewed NPCDex Cloud Import** — Sol / High. User-approved revision 73 and exact original bytes verified remotely and in a fresh Windows process. [Report](U15-Completion-Report.md).
- [x] **U16 — Durable Incoming/Outgoing Sync** — Sol / Extra High.
- [x] **U17 — Concurrent Edits and Conflict Review** — Sol / Extra High.
- [x] **U18 — ROMDex Workspace Metadata Sync** — Sol / High.
- [x] **U19 — Combined Sync Controls and Indicators** — Sol / High. Correct stale Connection Details help that still describes NPCDex as local-only, and verify service-specific statuses. Include header polish: reduce the circular workspace toggle diameter by 30% from its current size and remove its drop shadow; verify centering and workspace-menu behavior in both workspaces.

## Phase 4 — Content Architecture Revision (Design Approved)

- [x] **U20 — Content Architecture and Workflow Review** — Sol / Medium. User-approved October 16; [accepted design](U20-Consolidated-Architecture-and-Revised-Plan.md), [completion report](U20-Completion-Report.md). Later tasks remain separately gated.
- [x] **U20A — Content Contracts and ROM Mapping Design** — Sol / High. User-approved October 16; contracts/schema/examples and extraction guide accepted, 45 checks pass. [Review report](U20A-Review-Report.md).
- [x] **U20B — Content Project Access and Isolated Storage Proof** — Sol / High. Completed October 17. NPCD access, exact transfers, concurrent appends, separate-process recovery, complete groups and cleanup verified. [Report and limits](U20B-Completion-Report.md).
- [x] **U20C — Dynamic Registry Reader and Durable Cache** — Sol / High.
- [x] **U20D — Planning, Corrections and Content Lifecycle** — Sol / High.
- [x] **U20E — Previewed Content Migration and Provider Cutover** — Sol / High. Completed October 18. [Report](U20E-Completion-Report.md).
- [x] **U20F — Content Backend Acceptance and Private Release** — Sol / High. Completed October 18 in ROMDex 0.5.9; [completion report](U20F-Completion-Report.md), [verification](U20F-Verification.json).

### Completed Content Prerequisites

- [x] **U20G — Contextual Editing and Review Usability** — Sol / High. Completed October 18 in 0.5.10; [report](U20G-Completion-Report.md), [verification](U20G-Verification.json).

- [x] **U20H — Restore the Original NPCDex Feedback Interface** — Sol / High. Completed October 18 in 0.5.11; [report](U20H-Completion-Report.md), [verification](U20H-Verification.json).

- [x] **U20I — Complete the Native Content Tree** — Sol / High. Native projection, reviewed imports and agent instructions are delivered. Human acceptance, installed backup/restoration, queue delivery, exact content preservation and final remote readback passed in 0.5.14. [Completion report](U20I-Completion-Report.md).

## Phase 5 — RDX Contracts, Reliable Sync and Container Tools

- [x] **RD01 — RDX and JSON Workflow Contracts** — Sol / High. User-approved October 18; [completion report](RD01-Completion-Report.md). [Contracts/schema/examples](RDX-Reference/RD01-Contracts/README.md), [review report](RD01-Review-Report.md). Portable identities/bindings, complete/partial scope, compatibility, compression evaluation, atomic recovery, JSON packages and returned-RDX testing rules; legacy migration recognition retained.
  - [x] Inspect current native import, storage and legacy-format boundaries.
  - [x] Prepare schemas, exact-asset examples and six workflow walkthroughs.
  - [x] Pass 70 isolated design checks; clearly distinguish them from live/importer proof.
  - [x] User accepted the RD01 contracts, including automatic safe reconciliation and mandatory human testing.
- [x] **RD02 — Bounded Sync and Upload Recovery** — Sol / High. **Source-complete and verified.** [Report](RD02-Completion-Report.md), [evidence](RD02-Verification.json). Reviewed retry for uncertain-only uploads; independent read/write budgets, durable progress, verified-upload reuse and bounded no-progress handling. Preserve integrity/ownership/conflict checks; no blind resends or repeated full-history loops.
- [x] **RD03 — RDX Container, Validator and Tooling** — Sol / High. **Source-complete and verified.** [Report](RD03-Completion-Report.md), [evidence](RD03-Verification.json), [actual synthetic RDX examples](RDX-Reference/RD03-Examples/README.md). Lossless compressed JSON/assets, deduplication, routing/version checks, bounds/cancellation and deterministic tools. 93 focused tests; 48 RDX tests also pass in bundled runtime. Level 9 chosen from measured compression. No installed-app change.

## Phase 6 — Managed Documents, Imports and Cloud Publication

- [x] **RD04 — Local Managed Documents and Portable Export** — Sol / High. **Source-complete and verified.** [Report](RD04-Completion-Report.md), [evidence](RD04-Verification.json), [guide](../../apps/romdex/rdx/MANAGED-DOCUMENTS.md). Data/RDX service/CLI, durable journal, atomic working checkpoints/recovery and offline portable export. 107 focused checks; 31 managed checks under bundled runtime, plus seven final provenance rechecks in both. Existing maps/UI/installed app unchanged; integration/adoption remain later tasks.
- [x] **RD05 — NPCDex Map Import and Update Preview** — Sol / High. One map per input; stable-ID update previews, shared dependencies and newer-draft protection. Complete snapshots may propose archival of covered omissions; partial files imply no removal. Preserve original UI and archive history.
- [x] **RD06 — ROMDex Plan Import and Destination Mapping** — Sol / High. User-selected PMON destination; preview tier changes, retain complete subtrees and map editable fields/comments/attachments. Omitted tasks survive; explicit deletion is reviewed. Idempotent restart/reimport, no implicit publish or dispatch. Source-complete October 18; [report](RD06-Completion-Report.md). Live proof remains RD07.
- [x] **RD07 — Document Bindings and Bidirectional Cloud Sync** — Sol / High. Source-complete October 19; [report](RD07-Completion-Report.md). Explicit bindings, incremental delivery, native map/plan pullback and review/recovery. **Live acceptance passed:** a compressed test file imported, mapped to eleven real isolated NPCD records, accepted local and native changes, and retained both after reopen/export and second-instance readback. Shared controls and credentials preserved; installed production data unchanged.
- [x] **RD08 — Windows RDX File Integration** — Sol / Medium. Use the exact existing **Pokéball favicon artwork** as the `.rdx` file icon. Register/open into validated previews through the single-instance app; no silent execution/publication/replacement. Preserve Data and association ownership on upgrade/uninstall. **Completed October 19:** 38 focused checks, five targeted UI checks, seven packaged-app checks, registered-launcher observation and six installer acceptance checks passed. The authorized pixel-art app icon preserves the former PNG/ICO/SVG exactly. [Report](RD08-Completion-Report.md).
- [x] **RD09 — Agent Authoring and Portable Workflow Guide** — Sol / Medium. Versioned schemas/examples and extraction/ROM-mapping/pack/unpack/validate instructions for map/plan `.rdx`, JSON Map Packages and returned `.rdx`. Distinguish fixtures from real ROM extraction; required agent assets accessible on YouTrack. **Completed October 19:** versioned guide/prompts/examples, pinned schemas and a 44-file portable kit; eight focused tests and 13 independent CLI commands passed. [Report](RD09-Completion-Report.md).
- [x] **RD10 — Adopt RDX for All Existing Maps** — Sol / High. Only after the RD07 proof: fresh authoritative backup and reviewed preview, then move all current maps to managed `.rdx` files. Retain NPCD records/identities as the synced backend; preserve exact content, assets, notes/flags/proposals/history/testing, queued edits and all credentials. Verify each map and restoration before completion.

RD10 execution checklist:

- [x] Capture consistent current native data and verify the live NPCD head read-only; queue and review are empty.
- [x] Produce strictly map-scoped candidate `.rdx` files and verify map-only payloads, required assets, exact map views and catalog reconstruction with separate native shared context. The earlier whole-catalog recovery candidates passed preservation checks but are superseded.
- [x] Record original source-data acceptance together with the subsequent explicit one-map scope instruction; preserve both as authorization evidence. No source data is substituted.
- [x] Complete the existing-catalog adapter and focused save/pull/shared-context/recovery verification without recreating NPCD records.
- [x] Prepare and verify the packaged build; preserve the completed RDX Windows integration and all original icons.
- [x] After a verified quit, create a fresh complete Data backup, prove isolated restoration and preserve all three credentials; revalidate the accepted baseline.
- [x] Activate adoption, verify each managed file against the backend and reopened installation, complete the report and mark RD10 done.
- [x] **After Phase 6 and successful packaged-installer execution:** deliver the user's concise plain-English report listing the exact ROM/source inputs, tools and files required to generate RDX, and compare the portable packer with an RDX compiler built into ROMDex. Do not deliver this final recommendation before installer acceptance.

**Adoption gate:** do not replace current working map storage until the test `.rdx` demonstrably imports, maps to YouTrack and accepts local/native changes. Converting maps is separately authorized under RD10; it is not permission to delete/recreate the backend tree.

## Phase 7 — JSON Map Packages and Actionable Tasks

- [x] **U21 — Map Document Preview and Task Attachment** — Sol / High. After RD01–RD10: readable immutable `.json` Map Package, whole-map pending work preselected, stable ROM targets/base hashes/instructions and accessible YouTrack asset references. Existing/new task chooser, explicit attach, duplicate-safe retry; newer drafts preserved and no agent dispatch. Completed October 19 in source; [report](U21-Completion-Report.md). No hidden Draft/Ready gate; FINAL/flags/notes stay context, and context-only packages are allowed.
- [x] **U22 — Linked Navigation and Package Progress** — Sol / High. Exact task/map/package links and per-item/group progress; distinguish delivery from implementation/human testing. Completed October 19 in source; [report](U22-Completion-Report.md). Unverified agent claims and task completion cannot establish result/testing progress. No implicit task completion.

## Phase 8 — Returned RDX Reconciliation, Review and Testing

- [x] **U23 — Agent Access and Returned RDX Contract Review** — Sol / High. JSON package → ROM changes → updated map `.rdx` on the same task. Verify actual identity/grants, package/base/source evidence, grouped outcomes and readiness notice before discovery/application.
- [x] **U23A — Authorized Handoff and Agent File Transfer** — Sol / High. **Completed in source October 19;** [report](U23A-Completion-Report.md). Durable exact-package authorization/supersession/withdrawal, hard-coded Copy Agent Instructions, bounded sanitized return context and an actual agent-route download/upload proof. No AI generation or automatic dispatch. Prove a valid return using only agent-visible material before live work is enabled.
- [x] **U24 — Durable Returned RDX Discovery** — Sol / High. Discover attachments on linked tasks; validate/stage, deduplicate and recover across restart/offline/manual cycles. Agent labels in files are not authentication. Completed October 19 in source; [report](U24-Completion-Report.md).
- [x] **U25 — Validated Independent/Grouped Result Application** — Astra / High. ROMDex reconciles returned `.rdx` into NPCD and managed files, preserving newer drafts and conflict alternatives. Validate authorization/package scope/base/hashes; dependent groups apply together. Every accepted result requires human review/testing; no separate receipt file required.
- [x] **U26 — Human Review and Controlled Resolution** — Sol / High. Preview/defer/reject/retry stale, conflicting, incomplete or unapproved results without losing either version; never partially apply dependent groups.
- [x] **U26A — NPCDex Annotation and Settings Corrections** — Sol / High. Investigate New Bark Town tiles whose red flag remains after critical flags are cleared, including setting and clearing a new flag. Also restore broader flag/note visibility when Selected Line Only is unchecked; changing dialogue currently hides those annotations. Match original web scope semantics. Remove the redundant Add Note box at the bottom of Tray 2, preserving the button beside Flag Prompt. Populate the empty Tray 2 Content Controls menu, fix Close/Escape handling, and add Data/Flags for all flags/notes/changes within the current selector. Preserve real flags/notes and fix the saved-data/projection/icon path; verify after reload and sync. Source checks pass; installed startup/save recovery is in progress under the same PASSKEY; [report](U26A-Completion-Report.md). User clarified whole-current-prompt scope across passages and speaker turns. Installed 0.5.15 remains unchanged.
- [x] **U26B — Task Manager Responsiveness** — Sol / High. Completed October 19 after warning-free native Quit/relaunch acceptance. Targeted rendering optimizations, duplicate-feedback suppression, durable local draft checkpoints and lifecycle-aware RDX polling are installed in 0.5.15. Focused checks passed; native exit released ownership, then relaunch preserved 299 tasks, the editor draft, all 133 queued content entries and the explicit NPCDex-only cloud pause. Full Data backup verified; no reset or claim of completed legacy cloud delivery. [Report](U26B-Completion-Report.md).
- [x] **U26C — Isolated Clean RDX Round-Trip Acceptance** — Sol / High. Completed October 19. One fictional map imported into an empty isolated workspace, displayed tiles, saved contextual UI edits, reopened/exported, published to private NPCD after explicit test binding, accepted a reviewed native title change, and recovered into two additional empty profiles without duplicate records. Exact asset bytes/history and human-testing obligations retained. All 12 QA records removed; production integrity, pause, local saving and 133 pending entries unchanged. Native runtime loaded the map but its hidden window was not visually inspected; exact installed UI was checked in isolated Chromium. No application-code change, installer, production reset or broad regression rerun. [Report](U26C-Completion-Report.md).
- [x] **U27 — History, Reversal and Verification-Gated Completion** — Sol / High. Completed October 19 in source: flashing-amber Needs Testing, private immutable build/content verification history, completion guards, recoverable readiness notices and reversal reference without automatic ROM undo. Focused model, metadata, transport, service and interface checks passed. Installed production remains unchanged; integrated/fresh-instance review and live release remain U28–U30. [Report](U27-Completion-Report.md).

## Phase 11 — Core ROM Import and RDX Extraction

Approved as core work before Phase 9. Phase 11 is placed here in execution order; RI02 and RI03 remain umbrella/milestone references, now divided into separately authorized tasks. **RI02A, RI02B, RI02T and RI02C are complete in source; RI03A design is user-approved; RI03B/MAPDex and RI03P are complete in source. Remaining: RI03C → U28 → U29 → U30.** Notifications remain after U30. The [approved RI01 scope](RI01-ROM-Only-Extraction-Scope.md) requires the ROM alone, one logical map per RDX, map-specific timelines and Roman-numeral stage labels. Initial coverage is the supplied ROM/game and the user-selected Violet City proof (superseding New Bark Town on October 20), with explicit unsupported-data diagnostics. Keep the ROM read-only and outside Git/releases; production replacement still requires its own accepted preview and verified backup. Each task needs its own PASSKEY.

- [x] **RI01 — Inspect ROM and Agree Extraction Coverage** — Sol / High. Completed October 19: read-only ROM inspection, New Bark candidate evidence and user-approved ROM-only scope, including per-map timelines and Roman-numeral stages. No complete RDX/cloud POC claimed. [Report](RI01-Completion-Report.md).
- [x] **RI02A — ROM Reader and Source Mapping** — Sol / High. Completed in source: bounded read-only supplied-build reader, actual 540-header/event/warp catalog, relocated sprite metadata, portable/scoped identities and native source locators. Seventeen focused tests and eight real-ROM proof checks passed; 617 locators resolved, separate-process identities preserved, input unchanged. Known duplicate IDs/unresolved warps remain explicit. No RDX/cloud/installer claim. [Report](RI02A-Completion-Report.md).
- [x] **RI02B — Dialogue, events and appearance extraction** — Sol / High. Resolve the eight-area Violet City proof's local/shared dialogue dependencies, control/gender branches, visibility conditions and dynamic sprites. Derive this map's relevant timeline milestones and retain concrete predicates/ambiguities. Render the ROM's assets. Compare decoded structures to their exact source locations; account for each relevant object, message reference and unresolved dependency. Native behavior that cannot be interpreted remains explicit and cannot be counted as understood. Completed in source using Violet City: 32 focused tests, 5,140 source locators, 329 text entries and actual frames for all 50 placed objects; dynamic/native limits remain explicit. [Report](RI02B-Completion-Report.md).
- [x] **RI02T — Map-specific timelines and Roman-numeral stages** — Sol / High. Remove global/fixed-ten-stage assumptions across native/legacy projection, validation, filtering/editing and portable mapping. Use each map's stable timeline references, descriptive conditions and Roman-numeral labels. Verify maps with differing stage counts/orders, switching, legacy preservation, renamed/reordered stages and RDX export/import; preserve notes/plans/testing. Complete before the real-map round-trip proof. Completed in source; map-scoped validation/projection/editing, stable IDs, Roman labels, legacy preservation and isolated managed RDX round trips verified. [Report](RI02T-Completion-Report.md).
- [x] **RI02C — Compile and prove the real one-map RDX** — Sol / High. **Complete in source; [report](RI02C-Completion-Report.md).** Build VioletCityMap.rdx directly from the ROM-only extraction, validate/unpack/repack, import into an empty isolated profile, display both gender views and images, save a local note/flag/change, publish only clearly marked isolated YouTrack records, accept a reviewed native edit, then export/reimport into another empty profile. Preserve exact content/assets, stable identities, proposals and human-testing obligations; clean owned test records. No production reset or queue resumption. This is the decisive POC.
- [x] **RI03A — Review ROM Import workspace design** — Sol / High. **User-approved October 20; [design](RI03A-ROM-Import-Workspace-Design.md), [report](RI03A-Completion-Report.md).** Three trays: map catalog, local staging/setup, contextual preview/review; adjustable areas, optional presentation cleanup, per-map Roman stages, managed identity/recovery, explicit Send to NPCDex and accurate local/paused/remote states. RI03P follows RI03B before acceptance. No implementation/install or production sync change.
- [x] **RI03B — Implement the offline MAPDex workspace** — Sol / High. **Complete in source; [report](RI03B-Completion-Report.md).** Native ROM/export pickers, independent local staging RDX, worker/progress/cancel, portable identity recovery, optional cleanup, contextual stages/conditions, fresh reviewed handoff and pause-aware local publication intent. 106 distinct focused checks plus real-ROM, source UI and bundled-runtime proof. No production install or cloud resumption.
- [x] **RI03P — Map Cloud-Delivery Performance** — Sol / High. **Complete in source October 20; [report](RI03P-Completion-Report.md).** About 65% fewer object files/payload bytes, bounded metadata prefetch, visible handoff/publication bar, exact-data round trip and final-code routine-sync measurements. The RI03P proof preserved the then-active pause; the later user-authorized reset is recorded below. Reduce cold-publication and later-sync request overhead for real map RDX documents. Preserve exact source/image bytes, stable identities and backend hierarchy, immutable history, changed/missing-file detection, cancellation/recovery and conflict review. Measure a real map with explicit progress and honest local/queued/remote states. Keep one logical map per working/exported RDX. Complete before RI03C; separate PASSKEY required.
- [ ] **RI03C — Coverage and integrated feature acceptance** — Sol / High. Check a contrasting second area such as Route 29, plus a structurally different scene/interior selected from actual inventory. Verify repeat extraction, newer-build comparison, ambiguous identities, malformed/unknown formats and preservation of user edits. Document supported coverage and honest per-map limitations before U28.

## Phase 9 — Final Review and Release

- [ ] **U28 — Integrated Failure and Concurrency Review** — Astra / High. After the approved core extraction scope is implemented, review real ROM → JSON/assets → one-map `.rdx` → NPCDex/YouTrack → JSON/task/return/testing, plus offline, sync, portability and failure boundaries; reuse valid prior evidence and avoid redundant full-suite runs.
- [ ] **U29 — Guided Live-Workspace Acceptance** — Sol / High. Fresh preview/backups and isolated QA; user confirms original UI, supported ROM extraction/import, cross-instance transfer, native YouTrack changes and human-only completion gates. Do not repeat completed migrations.
- [ ] **U30 — Verified Installer and Handoff Documentation** — Sol / Medium. Include the supported ROM extractor/workspace, `.rdx` icon/association, schemas/tools/examples, agent guide, extraction limitations, backup/restore, optional cloud setup and QA report. Preserve all saves/credentials.

## Phase 10 — Agent Contact Notifications After the Principal Release

- [ ] **U31 — Notification Sources and Delivery Review** — Sol / Medium. Define agent-created tickets/comments/messages, agent identity, relevant scope, preferences, Auto-Sync interaction and hidden/offline/fully-quit behavior; obtain design approval.
- [ ] **U32 — Durable Agent Activity Retrieval** — Sol / High. Implement approved event discovery/unread storage, offline/restart catch-up and duplicate suppression.
- [ ] **U33 — Windows Notifications and Activity Access** — Sol / High. Implement approved alerts and click-through; verify installed/tray behavior and deliver a tested release.


**Historical planning updates:** October 15 introduced map-level JSON handoff/receipt return; U20 later selected direct content-record updates. The October 18 amendment now supersedes that normal agent return route with updated map `.rdx` attachments reconciled by ROMDex. JSON Map Packages remain the readable execution document; notifications still follow U30. Earlier completion records below describe historical boundaries, not current authorization.

## Completion Records

Record task deliverables, verification, limitations, and the next approval boundary here as tasks finish. Current application data must be refreshed at each later migration gate; this initial backup must never overwrite newer work automatically.

### U01 — Completed October 14, 2026

- [x] Created the 38-task checklist in approved execution order, including R01–R08 before launcher work.
- [x] Identified NPCDex's authoritative Downloads package: saved revision 72; development revision 64 remains reference only.
- [x] Identified the live ROMDex 0.3 release and shared persistent profile; recorded browser/local/server storage boundaries and existing receipt contracts.
- [x] Captured protected source, working-data, profile, shared-asset, historical-selector, and release backups.
- [x] Verified 165 file hashes, 15 JSON files, all 6 request hashes, stable profile capture, and all 49 ROMDex release ZIP contents.
- [x] Documented recovery paths, DPAPI credential handling, and fresh-snapshot requirements for later migrations.

U01's completion boundary was R01, subsequently authorized and completed below.

### R01 — Completed October 14, 2026

- [x] Automatic Details reopening from Work items and Notes.
- [x] Context-sensitive TAB mode cycle, reachable in Expanded mode.
- [x] New/existing inline-name nesting and outdenting with editor preservation.
- [x] Normal TAB retained in forms, notes, and menus; multi-selection routing reserved for later tasks.
- [x] Passed 127 tests, 27 module syntax checks, and focused isolated browser checks.
- [x] Installed and hash-verified the frontend patch in the running build; connection preserved.

R01's completion boundary was R02, subsequently authorized and completed below.

### R02 — Completed October 14, 2026

- [x] Removed picture areas; retained saved images and Tile Settings access.
- [x] Reduced tiles to 48 px with single-line ellipsis and full-name tooltips.
- [x] Added Saga and the confirmed existing-depth mapping; Tray 1 stops at Tier 4 Verse.
- [x] Enforced one open Epic/Saga/Story path with stale-state normalization and persistent collapse.
- [x] Preserved unrestricted Work Pane hierarchy and expansion.
- [x] Passed 140 tests, 29 syntax checks, focused fixture checks, and live served-file verification.

R02's completion boundary was R03, subsequently authorized and completed below. R04 remains unapproved.

### R03 — Completed October 14, 2026

- [x] Moved Add Item into the toolbar and completed filter to the right.
- [x] Added yellow filter styling and grey/red filtering indicator; both controls are 29 px high.
- [x] Added ESC clear-selection/focus and Collapsed ↔ Default behavior, preserving selector scope.
- [x] Preserved notes and in-session per-item unsent comments when clearing selection.
- [x] Added purple In Development, final menu order, and red-over-purple inheritance.
- [x] Passed 149 tests, 31 syntax checks, and focused desktop/narrow-layout fixture checks.
- [x] Restarted service; verified native In Development State, healthy connection, and remembered credentials.
- [x] Finished the completion report and checked off R03. Next: R04 — Dense Rows and Checkbox Selection, Sol / High; await a new PASSKEY.


### R04 — Completed October 14, 2026

- [x] Fixed grab/checkbox gutter and ordered indented triangle, status, title, Notes and ID.
- [x] Added toggle, Ctrl additive, Shift visible-range and Ctrl+Shift selection; checked boxes remain visible.
- [x] Added single/multiple Details transitions and safe editor/draft handling.
- [x] Integrated ESC and scope/filter/collapse/native visibility pruning with session-only selection.
- [x] Adjusted nesting insertion-guide offset for the fixed gutter.
- [x] Passed 156 tests, 33 syntax checks and focused desktop/narrow isolated browser checks.
- [x] Delivered and HTTP/hash verified the frontend patch; live saved connection remains healthy.

R04 is complete. Next: R05 — Same-Parent Grouping and Bulk Drag, Sol / Extra High. Await a new PASSKEY.

### R05 — Completed October 14, 2026

- [x] Corrected checkbox/background/Notes behavior: only names reopen collapsed Details.
- [x] Added named TAB grouping with blank/cancel/repeated-submission protection.
- [x] Added same-parent bulk dragging, stable ordering and destination-level feedback.
- [x] Verified complete selected-parent subtrees retain descendant relationships and data.
- [x] Added durable groups, native preflight, progress, mapping and partial-failure recovery.
- [x] Preserved confirmed changes/unrelated notes when cancelling; guarded uncertain creation and queued/in-flight deletion.
- [x] Added 1,000-operation batching and efficient local queue validation.
- [x] Passed 170 tests, 36 syntax checks, actual isolated browser grouping/drag and final live build/file verification.
- [x] Verified the final restart reused the saved connection and retained Auto-Sync.

R05 is complete. Next: R06 — Full Edit Menu, Assignee and Due Date, Sol / High. Await a new PASSKEY.

### R06 — Completed October 14, 2026

- [x] Replaced hover Rename with full Edit Item; retained double-click/F2 inline rename.
- [x] Added eligible Assignee, date-only Due Date, all editable PMON custom fields, and existing ticket tags.
- [x] Preserved untouched native values, local parent assignment, typed input, form Tab, and collapsed Details.
- [x] Added independent field reconciliation, nullable baselines, and recoverable partial tag updates.
- [x] Protected calculated Spent Time, including the metadata variation found in live verification.
- [x] Passed 184 automated tests, 42 syntax checks, and focused desktop/narrow isolated browser checks.
- [x] Verified final running build identity, eight served files, actual PMON metadata, and remembered connection/Auto-Sync.
- [x] Recorded the completion report and preserved original releases, profile, and protected baselines.

R06 is complete. Next: R07 — YouTrack Attachments and Previews, Sol / High. Await a new PASSKEY.

### R07 — Completed October 14, 2026

- [x] Added the name-adjacent paperclip, Details/Edit attachment controls, file lists and raster previews.
- [x] Verified original-byte downloads and pixelated image rendering.
- [x] Added durable browser/disk staging, paused uploads, manual-save processing and new-ticket mapping.
- [x] Added exact-content recovery, ambiguous/native-rename review and duplicate-safe journaling.
- [x] Added queued-upload cancellation and durable cleanup without removing native files.
- [x] Preserved name-only Details reopening; verified notes, checkbox and paperclip behavior.
- [x] Passed 207 tests, 48 syntax checks and focused isolated desktop/narrow browser checks.
- [x] Verified final running identity, eight served files, live attachment-list access, and preserved connection/Auto-Sync.
- [x] Recorded the production upload/download verification limit: PMON has no existing attached tickets, and QA used controlled files.

R07 is complete. Next: R08 — Enhancement QA and Release, Sol / High. Await a new PASSKEY.

### R08 — Completed October 14, 2026

- [x] Reviewed all eight enhancements and confirmed hierarchy, keyboard, selection and status clarifications together.
- [x] Fixed late staging after upload cancellation and unified Work toolbar action heights.
- [x] Passed 207 extracted-package tests, 51 module syntax checks, launcher parse and isolated startup/assets verification.
- [x] Completed focused combined browser QA and controlled real YouTrack two-way field/file/conflict/subtree checks.
- [x] Cleaned the four marked QA tickets; retained all 309 original issue IDs.
- [x] Produced the 69-file 0.4 ZIP, independently verified hashes, manifest, QA report and recovery guide.
- [x] Verified the new running installation/build and 28 served resources; saved credential ciphertext, connection and Auto-Sync retained, with no pending or blocked work.
- [x] Refreshed and verified the protected 47-file checkpoint, including NPCDex saved revision 72; preserved immutable U01 backups.

R01–R08 are complete. Next: **U02 — Desktop Host and Distribution Design, Sol / High**. Await a new PASSKEY; no U02 work has begun.


### U02 — Completed October 14, 2026

- [x] Compared desktop hosts against the actual HTML/CSS/JS and Node sources using official documentation.
- [x] Obtained explicit approval for Electron/Forge/Squirrel, the background service and separate durable profile.
- [x] Confirmed ROMDex branding, NPCDex as an add-on, Notify and Ask application updates and unsigned private testing.
- [x] Defined tray lifecycle, scoped tool views, native access, credential/file migration and recovery boundaries.
- [x] Added release-hosting analysis to U03 and separated U13A/U13B with individual PASSKEYs.
- [x] Updated planning records and verified release-file hashes/local links without altering application data or code.

Next: **U03 — Free Cloud Provider Comparison, Sol / High**. Await a new PASSKEY.


### U03 — Completed October 14, 2026

- [x] Measured current NPCDex/ROMDex data, historical images, compression and cloud metadata without upload.
- [x] Compared free providers, actual inactivity/deletion policies, backup options and no-billing eligibility using official sources.
- [x] Incorporated the user's YouTrack-storage proposal and one/two-user scale, ten at the extreme.
- [x] Obtained explicit approval for YouTrack-first workspace storage and private release delivery, with private GitHub only as a conditional fallback.
- [x] Recorded the U04 concurrency/publication proof and U14 plan/space/access/limit gates; no live provisioning assumed.
- [x] Updated plans/scope and verified measurement round-trips, document links and unchanged release hashes.

Next: **U04 — Data Ownership and Synchronization Contracts, Astra / High**. Await a new PASSKEY.


### U04 — Completed and User-Approved, October 15, 2026

- [x] Define ownership, identity, publication, discovery, durable queues, merge/receipt rules, limits, retention, access and migration gates.
- [x] Exercise 43 local model scenarios, including 120 delivery permutations; verify six existing request/baseline hash pairs and unchanged released files.
- [x] Produce the [contract](U04-Data-Ownership-and-Synchronization-Contracts.md) and [review report](U04-Review-Report.md); no live implementation or migration.
- [x] Obtained explicit user acceptance of versioned saves, eventual consistency and whole-receipt review when later offline conflicts arrive.
- [x] Marked U04 complete after user approval; recommended U05, Sol / High. Await its separate PASSKEY.


### U05 — Completed and User-Approved, October 15, 2026

- [x] Inspect existing NPCDex/ROMDex header assets and approved control placements.
- [x] Produce initial comparison, then revise to the user-directed [Footer Workspace Menu](U05-Shared-Header-and-Control-Layout-Proposal.md); both header switchers are rejected.
- [x] Verify geometry, original assets, fonts, controls and five responsive widths; confirm 69 release files unchanged.
- [x] Add S01 before U06 for the three user-requested attachment/startup changes; record Sol / High and its separate approval gate.
- [x] Confirm preserved view state means between workspaces in this app; verify footer menu dismissal, keyboard navigation and retained setting.
- [x] Obtain approval of the footer menu as a development placeholder; record red → yellow → green decorative circles for U06 and mark U05 complete.
- [x] Recommend S01, Sol / High. Await its PASSKEY; U06 follows S01 under another PASSKEY, Sol / Medium.


### S01 — Completed October 15, 2026

- [x] Lighten the paperclip and match the Notes icon footprint/color.
- [x] Add named attachment Delete, durable queued/manual processing, cancellation and changed-file/interrupted-response recovery.
- [x] Refresh attachment lists/paperclips and invalidate removed-file previews.
- [x] Default fresh launches to All Tasks, preserving other preferences and in-session scope.
- [x] Pass 227 tests, 52 syntax checks, 11 focused browser checks, 70 ZIP-entry checks and isolated startup/28 served-asset checks.
- [x] User launched 0.4.1; verify running identity, saved connection, real disposable-file deletion/replay/neighbor bytes, QA cleanup and all original issue IDs.
- [x] Preserve 0.4, protected baselines and credential ciphertext; record the [completion report](S01-Completion-Report.md).

Next: **U06 — Shared Theme and Approved Header, Sol / Medium**. Await a new PASSKEY. No U06 implementation has begun.


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


## U11 — Completed October 15, 2026; Tray and Recovery

**0.5.0-preview.11** implements the approved tray menu, close-to-tray/restoration, shared Save/Auto-Sync shortcuts, explicit local-checkpoint Quit, single-instance/profile ownership and bounded renderer/utility recovery. The original Pokédex SVG is now the window/tray/executable icon. The header is unchanged; updater controls remain U13B.

Passed **258 automated tests, six service/restart scenarios, twelve desktop scenarios, 76 syntax checks and 184 delivery hashes**. Actual hidden incoming changes, a second launch, forced renderer/utility interruptions, pending-edit recovery, unfinished-comment protection and process exit were checked in isolated fixtures. The [report](U11-Completion-Report.md) and [desktop evidence](U11-Desktop-Verification.json) record harness limitations and the final resumed checks.

The old U10F desktop, protected baseline, live web release/ZIP and credential ciphertext are unchanged. No migration or production writes occurred. **Continue live work in browser 0.4.3; its latest save remains authoritative.** The new preview does not replace it.

**Next: U12 — Persistent Profile and Current-Data Migration, Sol / High**, requiring a new PASSKEY. Capture and preview the latest web state, recovery records, queues/files and remembered connection; never replace them with the older desktop baseline. NPCDex cloud persistence remains U14–U19.


## U12 — Completed October 15, 2026; Current Saves Adopted by Desktop

The user authorized U12 and reviewed/accepted the native migration preview. Desktop **0.5.0-preview.12** now owns the latest captured browser workspace: **299 tasks, 104 manual-order entries, no pending operations or queued files**, plus the complete preserved NPCDex **revision 72** document (4 towns, 44 plans, 145 history records). No browser NPCDex current/recovery/held record existed; the preview identified the preserved Downloads package as its source. The older packaged desktop baseline was not used as migration authority.

The stable Windows-account profile is outside build folders at **%LOCALAPPDATA%/ROMDexDesktopData/thegobindsingh-PMON**. Original browser/package files and protected backups remain intact. The importer stages, hashes, reviews and atomically publishes the profile; missing established saves refuse baseline fallback. The remembered connection was converted through Windows protection to Electron safeStorage and verified after restart without token entry. Saved parent statuses and operation journal match their originals exactly.

Passed **272 automated tests, 83 syntax checks, 194 delivered-file hashes**, genuine YouTrack reads matching all 309 task fields, exact whole-document NPCDex comparison, hidden automatic sync and a checkpointed relaunch from a separate build folder. ROMDex then returned to its normal delivery executable with verification endpoints closed. No synthetic production edits were made. [Report](U12-Completion-Report.md), [live/restart evidence](U12-Desktop-Verification.json), [preservation](U12-Preservation-Verification.json).

**Use the desktop for current work; the old browser service is stopped. NPCDex remains local-only until U14–U19.** Installer upgrade/uninstall behavior remains U13A; update delivery U13B. **Next: U13A — Windows Installer and Upgrade/Uninstall Preservation, Sol / Medium**, requiring a new PASSKEY. No U13A implementation has begun.


## U13A — Completed October 15, 2026

ROMDex **0.5.2** is installed and running normally with current data, the remembered connection and diagnostic ports closed. Saves are inside the application Data folder and retained on uninstall, superseding the earlier external-profile/Squirrel design. Current data: **299 tasks, 104 order entries, no pending work, NPCDex revision 72**; exact original NPCDex/order/images/credential preservation and genuine YouTrack field equality verified. Passed **287 tests, 89 syntax checks, 200 final application hashes**, real Windows encryption migration, isolated MSI install/upgrade/uninstall/reinstall and current-data/normal relaunch checks. Original U12 delivery and source data remain preserved. [Completion report](U13A-Completion-Report.md), [desktop evidence](U13A-Desktop-Verification.json).

Private delivery remains unprovisioned: YouTrack upload settings returned HTTP 404 and server capacity is unverified; no upload or global-limit change occurred. **Next: U13B — Approved Update Notifications and Installation, Sol / High**, under a new PASSKEY. NPCDex cloud remains U14–U19.


## U13B — Completed October 15, 2026

Installed ROMDex **0.5.3** adds approved private signed updates, separate download/install consent and a checkpointed Windows handoff. Private GenericCola/ROMDex now hosts organized source/history/deferred work and the verified installer. Passed **305 tests, 98 syntax checks, 214 installed hashes**, genuine isolated upgrade/reopen/uninstall, exact 96-file live Data preservation, genuine YouTrack equality, read-only private update access and normal automatic-sync relaunch with diagnostics closed. Current saves remain **299 tasks, 104 order entries, no pending work, NPCDex revision 72**. Credentials/private signing keys/live Data are excluded from Git. [Completion report](U13B-Completion-Report.md), [evidence](U13B-Desktop-Verification.json). NPCDex cloud remains U14–U19. **Next: U14 — Private YouTrack Storage and Access Rules, Sol / High**, requiring a new PASSKEY. No U14 work was performed.


## U14 Completed — Private GitHub Saves and YouTrack Agent Handoffs

The user approved the hybrid provider revision: separate private GenericCola/ROMDex-Data for saves/assets/history and ROMDex metadata; YouTrack retains native tasks and every agent-required handoff dependency/receipt. Provisioned stable workspace identity with Actions disabled and no new collaborators. Passed nine focused tests, six live transport checks, anonymous/authenticated-unapproved access checks, separately scoped save-token write validation and protected restore in another Windows process. Both prior credentials and all 214 installed files remain unchanged. No real saves were uploaded and application cloud sync is not implemented. [Report](U14-Completion-Report.md), [evidence](U14-Storage-Verification.json). **Next: U15 — Previewed NPCDex Cloud Import, Sol / High**, requiring a new PASSKEY and preview acceptance before migration.


## U15 — Import Acceptance Checklist

- [x] Implement bounded, immutable GitHub import transport with pinned repository/workspace identity.
- [x] Preserve exact original NPCDex bytes, IDs, legacy hashes, historical images and unknown fields; reject unresolved recovery copies.
- [x] Verify 19 focused failure/recovery tests and a local round-trip of the current saved document.
- [x] Obtain approval of the fresh native migration preview.
- [x] Publish the accepted initial copy and verify exact downloaded bytes against originals.
- [x] Verify recovery in a separate Windows process and preserve all existing credentials.
- [x] Record acceptance, archive source/evidence privately, and stop before U16.

U15 import and recovery verification are complete. U15 does not activate continuous synchronization; local saves remain authoritative until the later sync tasks. Source and evidence are archived with the private development records.


## U16 — Implementation Checklist

- [x] Build a transactional local NPCDex journal and persistent outgoing operations.
- [x] Implement bounded delta records, incoming discovery, retries and interrupted-delivery deduplication.
- [x] Verify two-client catch-up and conservative conflict preservation.
- [x] Connect versioned editor checkpoints and protect typing against incoming updates.
- [x] Complete full regression and native Windows/Electron checks.
- [x] Validate the packaged desktop, upgrade preservation and live connection.
- [x] Archive source, publish the verified private build, update the checklist and stop before U17.

U16 is complete in installed **0.5.4**. Passed 345 tests, forced process-kill recovery, actual two-client GitHub checks, packaged editing/restart/tray checks, 226 installed hashes, exact 106-file installer Data preservation and genuine YouTrack equality. All three credentials survived the final normal restart. Conflicting branches are retained for U17 review. **Next: U17 — Sol / Extra High; new PASSKEY required.**


## U17 — Implementation Checklist

- [x] Preserve the U16 source and define domain validation, revision-graph and derived merge-footprint rules.
- [x] Implement durable automatic independent merges and explicit, version-guarded conflict resolutions.
- [x] Add a cloud conflict review pane, retained review drafts and manual-Save entry points.
- [x] Test concurrency, structural/receipt boundaries, interrupted resolution and editor races.
- [x] Verify the packaged Windows app and backed-up upgrade with real connections.
- [x] Archive the verified release and evidence, mark U17 complete and stop before U18.

U17 is complete in installed **0.5.5**. Passed 371 tests, eight final packaged desktop scenarios, actual multi-client GitHub checks, forced process-kill recovery, 234 installed hashes, exact 109-file installer Data preservation and genuine YouTrack equality. All three credentials survived the final normal restart. **Next: U18 — Sol / High; new PASSKEY required.**


## U18 — Implementation Checklist

- [x] Preserve the installed baseline and define metadata ownership, ordered-list boundaries and recovery rules.
- [x] Implement durable metadata revisions, incoming reconciliation, outgoing retry and conflict review.
- [x] Integrate saved parent statuses and native hierarchy/order reconciliation without syncing device-local views.
- [x] Verify two clients, crashes, uncertain delivery, deleted/moved native items and metadata conflicts.
- [x] Verify the packaged desktop and previewed, backed-up current-data upgrade.
- [x] Archive the private release/evidence, mark U18 complete and stop before U19.


## U19 — Implementation Checklist

- [x] Preserve the accepted source baseline and confirm the approved indicator rules.
- [x] Implement shared health/attention reporting and truthful per-service Connection Details.
- [x] Reduce the workspace toggle to 70% diameter, remove its shadow and preserve alignment/navigation.
- [x] Verify mixed service failures, clean disconnects, conflicts, Off/manual cycles and recovery.
- [x] Verify the final packaged desktop, backed-up upgrade and all remembered credentials.
- [x] Archive the private release/evidence, check off U19 and stop before U20.


## U20 — Workflow Review Checklist

- [x] Review existing ownership, Change Request and Integration Receipt contracts.
- [x] Review the user’s proposed architecture changes and record tradeoffs/decisions.
- [x] Walk through map-level publishing to an existing ticket and explicitly creating a new ticket; decide grouping and bulk selection.
- [x] Define package mapping/context/assets, preview, instruction ownership and changed-request behavior at product level; exact schema/transport remains U20A–U20B.
- [x] Define direct backend-result reconciliation, testing versus task completion, fixed-package revision and retry behavior; technical proofs remain explicit later gates.
- [x] Review the consolidated workflow/revised phase scope with the user, record the design decision and stop before U20A (new PASSKEY required).

U20 is complete. The user approved the design baseline on October 16, 2026. Application code, live data and credentials are unchanged. **Next: U20A — Content Contracts and ROM Mapping Design, Sol / High; await a new PASSKEY.**

## U20A — Contract Review Checklist

- [x] Inspect the accepted architecture and existing NPCDex identity, prompt, history and hash contracts.
- [x] Define versioned content, mapping, proposal, review, package, direct result, correction, binding and publication artifacts.
- [x] Document ROM extraction/target mapping, source evidence, compatibility preservation and previewed import requirements.
- [x] Produce fictional map/package/result/correction examples and hash vectors.
- [x] Verify independent/dependent results, scope, stale baselines, newer drafts/notes, replay, testing reset and legacy hashes in an isolated model (45 checks).
- [x] Obtain user acceptance of these contracts, check off U20A and stop before U20B (new PASSKEY required).

U20A is complete. The user approved the contracts and then separately authorized U20B with PASSKEY. No application code, live save or credential changes occurred in U20A.

## U20B — Access and Storage Proof Checklist

- [x] Recheck authenticated account, visible projects, group membership and role scope using current server reads.
- [x] Reuse the protected credential in memory and verify its saved bytes remain unchanged.
- [x] Review the exact empty content-project target and record the server's creation denial (403); no project was created.
- [x] Measure the protected checkpoint and run the isolated attachment/publication assumption model (16 checks).
- [x] Obtain the separately scoped content project from the instance owner, then verify its actual IDs/private grants (NPCD / 0-2; GenericCola Project Admin).
- [x] Prove actual attachment bytes/author/access, cross-project references, pagination/concurrent publication, uncertain-response recovery and complete dependent groups; clean up all four marked issues.
- [x] Record the demonstrated carrier/limits/access boundary, check off U20B and stop before U20C (new PASSKEY required). No backend substitution or additional design change was needed; actual agent grants remain U23, configured quota remains unknown.

The [U20C1/U20C2 scheduling contingency](U20C1-Independent-Reader-Plan.md) was not adopted: the user reported that owner setup is underway. Continue the original U20B → U20C sequence; no independent-reader implementation began. A separate request authorizes packaging the existing installer and documentation for owner review while setup proceeds.


## U20C — Reader and Cache Checklist

- [x] Implement bounded parsing, pinned schema/hash/graph checks and read-only physical carriers.
- [x] Implement durable verified cache, complete publication selection, review retention and restart recovery.
- [x] Project dynamic NPCDex content with current/proposed separation and preserve navigation across refresh.
- [x] Verify automatic/manual/Off semantics and isolated browser presentation.
- [x] Pass full regression, independent schema and real YouTrack fixture interruption/recovery checks.
- [x] Delete only marked fixtures, preserve credentials/installed app and archive source/evidence.
- [x] Stop before U20D; request its separate PASSKEY.

**U20C is complete** after isolated dynamic reader/cache/projection implementation, 467 tests and live YouTrack attachment/restart/cleanup proof. [Report and limits](U20C-Completion-Report.md). Installed 0.5.7 and the existing GitHub-backed NPCDex remain authoritative. **Next: U20D — Backend Planning and Documentation Corrections, Sol / High; new PASSKEY required.**


## U20D — Planning and Correction Checklist

- [x] Preserve current/proposed/testing boundaries and the U20C source baseline.
- [x] Implement planned additions, shared/local profiles, guarded corrections and archival rules.
- [x] Persist frozen operations and all issue/upload/parent-link intents before network requests.
- [x] Add explicit isolated editing, retained drafts and guarded conflict/retry review.
- [x] Verify concurrency, offline/restart/replay, source/asset preservation and sync controls.
- [x] Complete real Windows/YouTrack verification and remove only marked fixtures.
- [x] Preserve credentials/installed app, archive source/evidence and stop before U20E.

**U20E is complete.** ROMDex 0.5.8 is installed with the verified NPCD content provider. All 211 records, the original export and reconstructed frontend passed live readback; saved connections and recovery copies are preserved. [Completion report](U20E-Completion-Report.md). **Next: U20F — Content Backend Acceptance and Private Release, Sol / High.**


## U20E — Migration Preparation and Acceptance

- [x] Read-only latest local/cloud capture; preserve credentials and originals.
- [x] Full-size local reconstruction/retention and bounded-read improvements; 517 tests passed.
- [x] Map all 870 identities, 44 plans and 85 annotations; verify exact original/frontend preservation.
- [x] Prepare the [migration preview, backup policy and rollback procedure](U20E-Migration-Preview.md).
- [x] Obtain the required migration-preview acceptance; recheck source freshness.
- [x] Publish/read back the accepted dataset, prove actual YouTrack latency and perform a verified single-provider handoff.
- [x] Complete U20E documentation/checkpoint and stop before U20F.

## U20F — Complete

All acceptance gates passed: 540 regression tests, 10 final rechecks, actual Windows/YouTrack recovery and native review, complete Data restoration, packaged source/installer checks, private release and installed handoff. All three credentials were retained without token entry. [Completion report](U20F-Completion-Report.md). U21 remains unchecked and separately gated.

## U20G — Complete

The corrective release passed its regression, focused, native visual, runtime, backup/restoration and installed handoff checks. [Completion report](U20G-Completion-Report.md). U21 remains unchecked and requires a new PASSKEY.

## RD01 and RD02 Completed — October 18, 2026

- [x] RD01 contracts explicitly accepted by the user, including automatic safe return reconciliation with human testing mandatory.
- [x] RD02 source implements accessible uncertain-only recovery, separate time budgets, verified-upload reuse and a durable bounded no-progress hold while incoming reads continue.
- [x] Passed 107 focused tests, 14 new delivery tests in the bundled Electron runtime, final hold-message recheck, nine changed-module syntax checks and five isolated recovery UI checks.
- [x] Preserved installed 0.5.14, live saves/queue and all saved connections; avoid a separate installer cycle for this foundation change.

Next is **RD03 — Sol / High**, under a new PASSKEY. Existing-map conversion remains gated on RD07 live two-way proof and RD10 acceptance.


## RD03 Completed — October 18, 2026

- [x] Implement actual RDX container, pinned contract validation, lossless codecs, exact asset deduplication and dedicated legacy dispatch.
- [x] Enforce byte/JSON/work bounds, cancellation, hierarchy/reference checks and safe extraction paths.
- [x] Pass 93 focused tests, 48 RDX tests under bundled Electron, six syntax checks and measured codec/capacity survey.
- [x] Provide four fictional RDX files and reusable local CLI tools.
- [x] Preserve installed 0.5.14, production saves/queue and credentials; no backend writes or installer.

Next: **RD04 — Local Managed Documents and Portable Export, Sol / High**, with a new PASSKEY. RD07 live acceptance and RD10 fresh-data conversion remain mandatory.


## RD04 Completed — October 18, 2026

- [x] Add explicit Data/RDX working files, version/blob journal and exclusive crash-released ownership.
- [x] Preserve original inputs, exact assets, prior documents/proposals and human-testing provenance.
- [x] Recover interrupted working saves; refuse stale, corrupt or externally changed checkpoints as current exports.
- [x] Prove offline import/edit/save/reopen/export into a clean unbound instance with exact readback.
- [x] Pass 107 focused checks, 31 bundled-runtime checks, seven final provenance rechecks in both and five syntax checks.
- [x] Keep installed 0.5.14, current maps, queue, connections and YouTrack unchanged.

Next: **RD05 — NPCDex Map Import and Update Preview, Sol / High**, with a new PASSKEY. Current maps are not RDX working files yet; RD07 live proof and RD10 accepted conversion remain mandatory.

## RD05 Completed — October 18, 2026

- [x] Add Tray 2 map RDX import, explicit dependency/update previews and verified export through the existing NPCDex interface.
- [x] Preserve newer drafts and exact alternatives; require choices for overlaps/shared context and pin accepted previews.
- [x] Retain omissions, with optional pinned archival/REMOVE proposals for covered complete snapshots.
- [x] Support offline local editing, document/view/draft selection and restart; protect against stale-frame writes.
- [x] Keep portable verification claims unreviewed and retain original claim/correction evidence.
- [x] Pass 178 distinct relevant checks, 26 bundled-runtime checks, four final rechecks, seven isolated UI checks and desktop-service smoke checks.
- [x] Preserve installed 0.5.14, production maps, live queue, credentials and backend data.

Next: **RD06 — ROMDex Plan Import and Destination Mapping, Sol / High**, with a new PASSKEY. No current production map has become an RDX working file; RD07 proof and RD10 accepted adoption remain required.

## RD06 Completed — October 18, 2026

- [x] Added local plan import/update review, basic local edits and verified RDX export without touching the imported source or the active NPCDex map.
- [x] Added explicit PMON placement, tier rebasing, typed field/value mapping, provenance-preserving comments and exact attachment staging.
- [x] Retained omissions; reviewed explicit deletion targets/children and overlapping native edits. New siblings use local order metadata.
- [x] Committed local bindings and queue actions atomically, retained partial progress and reused recovery identities after lost responses.
- [x] Passed 142 distinct relevant checks, 30 plan checks in bundled Electron Node mode, seven isolated UI checks and an actual desktop-service smoke check. [Evidence](RD06-Verification.json).
- [x] Kept installed 0.5.14, current production maps, live queues, credentials and YouTrack unchanged. [Completion report](RD06-Completion-Report.md).

Next: **RD07 — Document Bindings and Bidirectional Cloud Sync, Sol / High**, with a new PASSKEY. Automatic native-change pullback/shared bindings and the real isolated two-way proof remain RD07; fresh production adoption remains RD10.

## RD07 Completed — October 19, 2026

- [x] Add explicit private map binding/publication previews, durable delivery intents and incremental artifacts/assets without whole-save uploads per edit.
- [x] Fold accepted native changes into managed map/plan files, preserving local drafts, exact files, history and review/testing boundaries.
- [x] Support explicit PMON task matching on another instance; verify existing comment/file evidence and avoid duplicate posts.
- [x] Preserve shared Save/Auto-Sync Off behavior and expose native/branch conflicts plus bounded recovery. Cache verified manifests/files; stop unchanged-conflict and no-progress loops.
- [x] Pass 25 new checks in bundled Electron, affected source regressions/focused repairs, shared-status checks, nine map UI checks, eight plan UI checks and the desktop-service smoke check. [Evidence](RD07-Verification.json).
- [x] Pass the real backend criterion with a unique fictional map: eleven private NPCD records, local note publication, reviewed native title change, exact image bytes, reopen/export and second-instance readback. Final-source live delta/readback also passed.
- [x] Preserve installed 0.5.14, current production maps/tasks, Data/queues and all remembered connections. Keep the portable fictional test file and clearly identify retained private QA records. [Report](RD07-Completion-Report.md).

Next: **RD08 — Windows RDX File Integration, Sol / Medium**, under a new PASSKEY. Current-map adoption remains RD10 after a fresh accepted preview that preserves the original NPCD issue identities.

## RI02C — Completed in Source, October 20, 2026

The supplied ROM directly produced one Violet City RDX with eight areas, 50 placed objects, 329 exact source texts and 354 sprite images. Local changes and a reviewed native YouTrack correction survived portable export/recovery with stable identities and human-testing obligations. The cold-import proof exposed and corrected redundant delivery reads and stale recovered-connection status; 56 distinct focused tests passed, including targeted rechecks after correcting a legacy-slot regression and the recovery status, and 17 syntax checks passed. All 135 ownership-verified temporary issues were removed. No production install, reset or queue resumption occurred. [Report](RI02C-Completion-Report.md). **Next: RI03A, Sol / High, under a separate PASSKEY.**

## RI03A — Design Approved, October 20, 2026

- [x] Recorded the accepted three-tray layout, one-map staging RDX, optional cleanup and explicit reviewed handoff.
- [x] Reviewed the interactive preview and local/paused-cloud reporting; approved recoverable jobs and managed identities.
- [x] Added separately gated RI03P cloud-delivery performance between RI03B and RI03C.
- [x] Marked RI03A complete after the user selected “Approve RI03A Design.”

**Next: RI03B — Implement the offline MAPDex workspace, Sol / High; new PASSKEY required.** [Completion report](RI03A-Completion-Report.md).

## RI03B — MAPDex Complete in Source, October 20, 2026

- [x] Added MAPDex in the header, workspace chooser and Windows tray menu.
- [x] Implemented independent staging, portable identities, display cleanup, Roman stages and source preview.
- [x] Proved the real-ROM workflow and corrected selected-area membership while preserving source bytes and cleanup.
- [x] Added explicit fresh-baseline handoff and recoverable publication intent without bypassing the NPCDex pause.
- [x] Verified 106 distinct focused tests, eleven source-UI behaviors, local-save recovery and bundled runtime/source packaging.
- [x] Kept production Data, the installed release and remembered connections unchanged.

**Next: RI03P — Map Cloud-Delivery Performance, Sol / High; new PASSKEY required.**


## RI03P — Cloud-Delivery Performance Complete in Source, October 20, 2026

- [x] Added MAPDex handoff and publication loading bars, including queued, paused, review and verified completion states.
- [x] Reduced full-map delivery attachments and payload bytes by about 65%, preserving exact content and existing bindings.
- [x] Measured full-map unchanged sync at 9.3 seconds, one note's cloud delivery at 34.8 seconds, and second-profile recovery at 58.4 seconds. The separate local editor/checkpoint step took 19.2 seconds.
- [x] Passed 61 distinct focused checks, ten syntax checks, five source-UI behaviors and the isolated real YouTrack proof.
- [x] Verified all 135 temporary test records absent; preserved the installed app, production Data, queued work, remembered connections and NPCDex sync pause.
- [x] Backed up reviewed source, evidence and documentation to the private ROMDex repository.

**Next: RI03C — Broader MAPDex Acceptance, Sol / High; new PASSKEY required.** See the [completion report](RI03P-Completion-Report.md).

## Operational Update — Clean NPCDex RDX Test Preparation, October 20, 2026

- [x] Verify complete local and backend archives before clearing the old NPCDex dataset.
- [x] Remove 224 exact NPCD records; retire the old local maps, provider/cache and legacy queue without changing PMON tasks or remembered credentials.
- [x] Re-enable NPCDex sync and reopen the empty installed workspace with a verified connection.
- [x] Preserve compressed recovery copies and collect obsolete files into one manual-delete folder.
- [ ] User acceptance: import a map RDX, edit locally, verify the NPCD tree, accept a YouTrack edit back into the managed/exported RDX; then test MAPDex extraction and another map after packaged acceptance.

[Reset and cleanup report](NPCDex-Clean-RDX-Test-Preparation.md). **Next gated development task remains RI03C — Sol / High.**
