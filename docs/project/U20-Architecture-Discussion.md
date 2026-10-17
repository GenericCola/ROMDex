# U20 — YouTrack Content Registry Proposal

**Status:** U20 design baseline approved October 16, 2026. This log preserves the discussion that produced the accepted architecture. Design acceptance is not implementation approval. Installed ROMDex remains 0.5.7. No live issues, saves, configuration or application code have changed for U20.

**Accepted design:** [Consolidated architecture and revised plan](U20-Consolidated-Architecture-and-Revised-Plan.md). The user selected “Approve the U20 Design Baseline.” Technical proof gates remain in U20A–U20F; the next task requires a new PASSKEY.

## User Proposal

Make YouTrack entity records authoritative for NPCDex content. Epic represents a macro-region (Johto/Kanto); Saga represents a map/zone; Story represents a sub-zone/building; Verse represents an NPC, scene, interactive element or other content item. Each record carries structured metadata, ROM/source mapping and applicable images. NPCDex assembles its existing interface from these records and saves planning/staging data back to them. Add Character creates a planned content record. Package Map Changes collects selected flags, notes and requested changes into one agent-readable map package. The agent changes the ROM and updates the relevant backend records, which then update NPCDex automatically.

Current live NPCDex saves already persist in private GitHub. This proposal changes the authoritative content model and storage location; it is not the first introduction of cloud persistence. Bulk JSON hardcoded in the application is an initial/fallback baseline, not the authority for newer saves.

## Preliminary Assessment

The direction is technically plausible and worth evaluating before U21. Permanent entity records could reduce duplicate ticket creation and give each entity one stable history. An initial population of content records is still required; entity counts, limits, storage and synchronization cost must be measured before a migration estimate.

YouTrack supports issue hierarchies, typed fields, links, comments and file attachments. These primitives do not themselves provide the NPCDex schema, ROM mapping, domain validation, batch consistency or conflict rules. Source documentation below verifies primitives only; proposed application behavior remains an engineering design.

## Design Notes — Confirmed Choices Identified Below

1. Distinguish permanent content records from actionable jobs. The user selected a separate Content view and separate content project on the existing instance. Existing PMON development epics and work must not be silently reorganized. A content record's existence, pending work, implementation evidence and testing state are separate facts.
2. Keep current ROM-mapped content, proposed changes and implementation evidence separately versioned on the same entity. The user selected current content as the primary display, with proposed changes appended, preserving the present viewing model. New entities begin as planned additions; removals archive records after implementation rather than deleting mapping/history. An app-local stable ID can precede allocation of an actual ROM event/character ID.
3. Use the proposed hierarchy for physical organization, with a Town Exterior sub-zone where appropriate. Model character identity separately from its appearances; shared scenes refer to participants without duplicating the scene definition. Keep stable IDs independent of issue titles, current parents, file offsets and display names. Global progression/timeline definitions and shared assets need explicit ownership.
4. Store readable summaries/searchable attributes in issue fields and structured definitions in a versioned machine-readable document. Images remain attachments with stable asset references. Prove attachment/version selection and guarded updates before choosing an encoding. Do not casually edit one unversioned JSON blob from both clients and agents.
5. Generate one explicit, immutable map-change document containing selected plans, exact entity/plan revisions, baseline values/hashes, ROM/source revision, mapping information, required context/assets and agent instructions. The document is attached to an actionable ROMDex task, distinct from permanent content records. NPCDex is planning/staging only: edits, synchronization, packaging and attachment do not initiate an agent handoff, implicitly create/assign an execution job, or automatically advance task status. Execution is initiated separately through the user’s ROMDex task workflow. The user selected an integrated task chooser with explicit attachment and an option to create a new actionable task. New-task creation is user-initiated and does not hand work to an agent.
6. Let the agent return its structured acknowledgement through the same tickets. A separate manually imported receipt file can be unnecessary, but request matching, ROM revision evidence, before/after values, authenticated actor, validation and completion markers remain necessary. Direct issue updates alone do not prove ROM modification or testing. Preserve compatibility with existing receipt/history semantics until a replacement is approved.
7. The user selected applying each completed independent item as it arrives and passes validation. Interdependent edits, such as a shared scene and participant records, update as one validated group. Keep package-level progress so partial implementation is visible and never implies the entire task is finished. YouTrack issue writes and a ROM change are separate operations; do not assume an atomic cross-ticket transaction or select a winner by newest attachment timestamp. Retain incomplete groups for recovery/review and preserve concurrent edits.
8. Retain local offline queues/cache and recovery history. If YouTrack becomes content authority, private GitHub may retain backups and other ROMDex metadata, with no second independently editable NPCDex master. Credentials and update delivery remain unchanged unless separately approved.

## Confirmed Decision — Content View

The user selected **Separate Content View**: permanent map/NPC records are presented separately by default from development tasks. NPCDex retains its visual interface. The separate-project decision is recorded below. This view decision does not authorize ticket creation/migration or approve the remaining architecture.

## Confirmed Decisions — Planning Boundary and Display

NPCDex never initiates execution or sends a change request directly to an agent. It is a planning and staging tool. **Package Map Changes produces one document for attachment to an actionable TASK in ROMDex.** That document instructs the agent to implement the ROM changes and update the corresponding NPCDex backend data structures to reflect the actual result. Packaging/attachment and the eventual agent handoff are separate actions. No automatic task creation, assignment or execution trigger is approved.

NPCDex shows **current content, with proposed changes appended**, similar to the existing view. Editing a proposal does not replace the recorded current content or claim implementation.

## Confirmed Decision — Task Selection and Attachment

After generating the single map-change document, the user chooses an existing actionable ROMDex task or explicitly creates a new one if needed, then confirms the attachment. No manual download/upload is required for the normal path. Creating the task and attaching the package stage the work; neither initiates agent execution. Fixed-version/replacement behavior is confirmed below. Proposed new-task defaults and destination controls are described in the consolidated review.

## Confirmed Decision — Package Selection

The preview starts with all pending plans, flags and notes in the current map and its sub-zones preselected. The user can exclude items before generating the one document. The document distinguishes requested actions, supporting observations and open questions. This selection is staging only and does not authorize execution.

## Confirmed Decision — Fixed Packages and Newer Drafts

An attached package is a fixed version until the user explicitly generates/attaches a replacement. Later planning edits remain newer drafts, with a visible warning that the task package differs. If package B is implemented after proposal C was drafted, current content becomes B and C remains pending. Agent results match the actually approved packaged request revision, not the latest unsubmitted planning revision; they must never clear or overwrite a newer draft. No automatic reassignment or agent handoff follows a package revision. This requires separating packaged-request identity from mutable draft identity in the proposed architecture; existing manual receipt behavior remains unchanged until an approved implementation replaces it.

## Confirmed Decision — Incremental Implementation Updates

Apply each completed independent item automatically after its result passes validation. Apply interdependent results together as a complete group. Track completed, remaining, conflicted and failed items against the fixed package. Completing one item does not complete the containing package/task. Preserve newer drafts as agreed. Affected testing resets to Unreviewed under the existing accepted contract; implementation alone never marks testing passed. Defining the dependency/group boundaries and completion evidence remains part of the schema review.

## Confirmed Decision — Testing Handoff and Task Completion

When all packaged changes are implemented, the agent notifies the user that the actionable ROMDex task is ready for testing. The task remains open until the user verifies the result. An implemented result is not an in-game verification. The notice channel and exact task-label/state representation remain to be agreed; a task comment is the proposed minimal route, with native desktop push delivery still in the later notification phase. No task auto-closes merely because the agent reports implementation complete.

## Confirmed Decision — Separate Content Project

Permanent macro-region/map/sub-zone/entity records belong in a separate **NPCDex Content project on the existing YouTrack instance**. Actionable development tasks remain in PMON. NPCDex presents the separate Content view, and map packages attach to selected existing or explicitly user-created PMON tasks. The exact project name/key is not yet fixed. Before provisioning, recheck actual project-creation permission and arrange instance-owner assistance if needed, verify the user/agent grants, and prove required cross-project record/task references. No project creation, membership changes, token changes or migration is authorized by this design discussion.

## Confirmed Decision — Shared Character Identity and Local Appearances

Recurring characters have one shared character profile for shared identity/name/base image, referenced by separate local appearance records. Each map appearance retains its own dialogue, event/script mapping, conditions and optional local overrides. Unrelated characters are never merged merely because names or sprite bytes match. Intentional shared-profile edits propagate only to linked appearances without an override; local dialogue edits remain local. Shared-scene records reference participants rather than duplicating the scene across characters. The physical storage of shared profiles/assets within the new project remains an engineering schema decision, subject to the approved hierarchy and migration proof.

## Confirmed Decision — Additions and Removals

Add Character creates a planned content record, shown as Planned Addition until validated agent implementation supplies the actual ROM mapping/result. The current-content view must not imply that a planned entity already exists in the ROM. A proposed removal remains visible beside current content until implementation is confirmed, then archives the local appearance with its history retained. Archived removals stay accessible through the task testing checklist so the user can verify absence in-game. Removing one appearance does not remove the shared character profile or other appearances. Planning never permanently deletes content records and never creates/dispatches an execution task implicitly. Direct native deletion of a content ticket must be treated as a missing-record/recovery event rather than proof of ROM removal; work-task deletion retains its separately agreed semantics.

## Confirmed Decision — Explicit Documentation Corrections

The user can explicitly correct inaccurate recorded current content when the ROM itself needs no change. This is distinct from ordinary planning edits, preserves prior values/history, and creates no execution task or agent handoff. A correction must remain attributable and identify the affected content/version; a stale packaged baseline or competing result is reviewed rather than overwritten. The exact correction UI and backend write schema belong to the later contract design.

## Remaining Technical Decisions and Proof Gates

- Content project name/key, provisioning permissions, user/agent grants and cross-project references. A separate project on the existing instance and separate default Content view are agreed.
- Replacement/mapping schema details. Planned additions, archived implemented removals, retained testing access and current-first/appended-proposal display are agreed.
- Shared-scene/global timeline/asset schema and ROM mapping details. Shared character profiles with local appearances and optional overrides are agreed.
- New-task destination/defaults and the separately initiated ROMDex handoff. Existing/new task selection, whole-map/sub-zone preselection, explicit replacement versions and preservation of newer drafts are agreed.
- Result/group schema, concurrent changes, validation and readiness-notice channel. Incremental independent-item application, grouped dependent changes and keeping the actionable task open until user verification are agreed.
- Backend editing/actor validation and correction write schema. Explicit user documentation corrections, archival content removal and distinct ordinary work-task deletion semantics are agreed.
- Final authority, role of GitHub, permissions, migration/rollback and acceptable synchronization cost.

## Proposed Review Sequence

Resolve the conceptual choices first. Then demonstrate one representative map containing exterior/interior NPCs, a shared scene, an addition and a removal. Specify a schema and package/result example. A later separately approved proof task should test the transport and failure cases in isolation. Previewed migration follows only after that proof and explicit approval. Re-scope U21–U27 before implementation if this direction is accepted; existing implementations and saved data remain preserved.

## Primary References

- [YouTrack issue fields and updates](https://www.jetbrains.com/help/youtrack/devportal/operations-api-issues.html).
- [Issue hierarchy and other links](https://www.jetbrains.com/help/youtrack/cloud/link-issues.html).
- [Issue attachments](https://www.jetbrains.com/help/youtrack/devportal/resource-api-issues-issueID-attachments.html).
- Existing local U04 ownership, versioning, receipt and conflict contracts remain the accepted baseline until superseded by an explicit decision.
