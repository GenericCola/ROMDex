# U20 — Content Architecture and Change Workflow Review

**Prepared and approved:** October 16, 2026. **Status:** U20 design baseline approved by the user: “Approve the U20 Design Baseline.” The architecture, product behavior and revised roadmap below are accepted for subsequent task planning. Physical schemas, transport/access proofs and migration acceptance remain later gates; provisioning and implementation are not authorized by this approval. Installed ROMDex remains **0.5.7**. U20 changes documentation only.

## 1. Agreed Product Behavior

| Area | Confirmed decision |
| --- | --- |
| Content location | A separate NPCDex Content project on the existing YouTrack instance, presented separately from ordinary development tasks. The exact name/key and permissions remain implementation prerequisites. |
| Hierarchy | Epic: macro-region (Johto/Kanto). Saga: map/zone. Story: sub-zone/building. Verse: local entity, appearance, interactive element or scene. Preserve existing NPCDex viewing behavior. |
| Character identity | A recurring character shares a profile/name/base image; local appearances retain dialogue, events, conditions and optional overrides. Identical sprites alone do not merge characters. |
| Display | Current content remains primary; proposed changes are appended. |
| Planning boundary | NPCDex plans and stages only. Editing, synchronizing, packaging, creating a planned content record, or attaching a document never dispatches agent work. |
| Map package | One document for the current map, including its sub-zones. Pending plans, flags and notes start preselected; preview permits exclusions. Distinguish actions, supporting observations and open questions. |
| Task attachment | Choose an existing actionable ROMDex/PMON task or explicitly create a new one, then confirm attachment. Creation/attachment and the user's agent handoff are separate actions. |
| Versions | Attached packages are fixed snapshots. New planning edits remain drafts and create a visible newer-draft warning. Replacement is explicit; prior versions remain recoverable. |
| Older implementation | If B is packaged and C is subsequently drafted, implementing B changes current content to B while C remains pending. Match results to the packaged version, not the latest unsubmitted draft. |
| Incremental progress | Apply completed independent items after validation. Apply dependent changes as one complete group. Track partial package progress. |
| Additions/removals | New records are Planned Additions until implementation. Proposed removals remain visible until implemented, then archive the appearance/history with testing access retained. Other appearances remain intact. |
| Documentation corrections | An explicit user correction can fix the description of the existing ROM without requesting ROM work. Retain the old value/history; ordinary edits continue to create proposals. |
| Testing | Implemented changes reset affected testing to Unreviewed. The agent announces readiness for testing; the task stays open until the user verifies the result. |

## 2. Proposed Authority After a Verified Migration

| System | Responsibility |
| --- | --- |
| YouTrack content project | Authoritative versioned NPCDex definitions, profiles/appearances/scenes, mapping, content assets, planning data, corrections, implementation updates and testing/history references. |
| YouTrack PMON | Actionable development tasks, priorities, assignees, dates, comments and explicitly attached map packages. Existing tasks and their hierarchy remain intact. |
| ROM/source repository | The actual implementation artifact. A data update documents a reported ROM revision; accepting the data does not independently certify the ROM or in-game behavior. |
| ROMDex local Data | Durable last-verified cache, offline edits/queues, recovery copies, protected credentials and device-local view state. Native/cloud transfers obey shared Auto-Sync and manual one-cycle controls. |
| Private ROMDex-Data GitHub repository | Continue existing ROMDex organization metadata sync. Preserve previous NPCDex saves/history as recovery material. Proposed ongoing NPCDex role: backup/checkpoint copies of accepted YouTrack content, with one content authority rather than independently editable masters. Exact backup transport/cadence requires proof and review. |
| Private ROMDex development repository | Application source, organized development archives and installers; its role is unchanged. |

**Before cutover, current GitHub-backed NPCDex saves remain authoritative.** Do not enable two active editable NPCDex stores, seed from an older application baseline, delete history, change credentials or migrate content merely because this proposal exists.

## 3. Concrete Walkthroughs

The following are illustrative workflows, not claims about existing tickets or live ROM dialogue.

### Existing Task

1. In a map such as New Bark Town, propose an NPC dialogue edit, a new character and removal of one local appearance. Other notes may remain observations or questions.
2. Package Map Changes previews the whole map/sub-zone selection. The user excludes an unfinished idea and confirms the selected scope.
3. Generate one versioned document. Choose an existing PMON task, preview its destination and explicitly attach the document. Preserve the task's existing description, hierarchy, assignee and status.
4. No work is dispatched. The user later hands off that task through their normal agent workflow.
5. The agent follows the document to locate the ROM targets and make the approved changes. The agent publishes versioned updates to the corresponding content records with the package/item/version and implementation evidence.
6. A validated independent dialogue result appears immediately. A scene plus its participant changes appears only when that dependent group is complete. A failed/missing result stays pending or enters review without clearing other drafts.
7. If the user drafted a newer dialogue proposal meanwhile, retain it beside the newly implemented current content.
8. When the packaged work is implemented, the agent announces readiness for testing. NPCDex's testing remains Unreviewed and the task remains open. The user tests, records verification and controls completion.

### New Task

Use the same map preview and single document, then choose Create New Task. Present the normal editable task form, including title and destination in the development hierarchy. Proposed initial defaults: Untouched, Normal priority and no automatic assignee. After explicit creation, attach the document. This creates one user-requested actionable task, not one execution task per NPC. Neither creation nor attachment starts agent work. Defaults remain reviewable before implementation.

### Replacement, Retry and Concurrent Edits

- Generating a new package does not replace an attached one. Explicit attachment identifies which prior package version it supersedes. Retain the prior version and warn about changed scope; no automatic agent message, cancellation or re-handoff.
- Reusing an existing task may place several map packages on it. Proposed handling: track each package/version independently and never infer that unrelated task work is finished. Human-controlled task completion remains intact.
- An uncertain task-creation or attachment response retains its operation identity and is checked before retry, avoiding duplicate tasks/documents. Do not silently overwrite an existing attachment selected by filename alone.
- Documentation corrections or actual current-content changes can invalidate an old baseline. Preserve both versions and review the affected result/group. Unsubmitted proposal changes alone do not invalidate an otherwise matching packaged request.
- A shared profile edit may affect several maps. The package preview must disclose those affected references and dependencies; do not silently change every appearance through a local-only instruction.

## 4. Package Contents — Proposed Semantic Contract

Produce **one machine-readable JSON document with readable instructions**. Exact field names/encoding are a U20A contract deliverable. Include:

- Package identity/version, workspace identity, source content revisions and selected map/sub-zone identities.
- Selected plans and exact published plan versions, requested actions and acceptance checks, separate from observations and open questions.
- Stable profile/appearance/scene/point/block identifiers and enough ROM/source mapping to locate the intended targets without reconstructing the mapping manually.
- Relevant current values, baseline fingerprints, proposed values/instructions, ROM/source revision and required evidence/context. Retain legacy IDs and hash semantics where compatibility requires them.
- Required asset bytes or stable references to accessible YouTrack attachments, including integrity information. Do not rely on expiring download URLs, unrelated full-save exports or agent access to private GitHub saves.
- Dependency/group boundaries, supported partial completion and the instructions for updating the related content records after ROM implementation.
- Rules for retaining newer drafts, preserving identities/history, reporting unresolved work, resetting testing and announcing readiness without closing the task.

The agent's normal return is **an update to the relevant backend content records**, not a separate receipt file for the user to handle. Those updates still require version, scope, before/after and provenance checks. Existing receipt/history compatibility remains recoverable; it must not be silently discarded or treated as the new default transport.

## 5. Engineering Defaults and Proof Gates

These are proposed rules to validate, not claims of implemented capability:

1. **Identity/mapping:** immutable internal identities and versioned ROM locators; shared profiles separate from appearances; scenes reference participants. Use an exterior sub-zone where needed. Preserve global progression, gender/conditional variants, source evidence and current stable identifiers. Replacement of a character in one appearance must not rename every appearance of the old shared character.
2. **Storage:** readable/searchable issue metadata plus versioned structured content and image references. Prove append/update selection and complete dependency discovery. Never choose a valid current version solely by filename or timestamp. The exact balance of issue fields, JSON attachments and revision manifests remains open to the proof.
3. **Concurrency:** no assumed atomic transaction across a ROM change or several YouTrack issues. Apply an independent item or dependent group only after its complete result is validated against the relevant accepted version. Preserve offline/concurrent branches and incomplete groups. No last-writer-wins shortcut.
4. **Actors/access:** verify actual owner/project permissions, agent access to required records/assets and attributable updates. Do not trust a JSON actor label as authentication or assume a broad owner credential distinguishes a human correction from an agent action. If the available identity cannot establish a restricted action, require review or a revised route. No automatic new account, broad owner grant, paid service or billing change.
5. **Native editing:** valid authorized backend edits must appear in NPCDex. Malformed, incomplete, conflicting or unrecognized record changes produce visible review/recovery and preserve the last verified data. A deleted content ticket is a missing-record event, not evidence that its ROM entity was removed. Ordinary PMON task deletion keeps its existing separate semantics.
6. **Performance:** measure the actual entity/asset inventory and API workload. Cache assets and unchanged definitions; use bounded/incremental discovery and respect server backoff. Establish capacity and publication limits rather than inheriting an unverified upload assumption.
7. **Migration/recovery:** exact protected backups, preview counts/identity mappings, preserved notes/plans/history/images/legacy results and all three credentials. Validate a round trip before activating the new provider. Keep the prior installation and original saves. Dataset rollback does not automatically reverse a ROM modification.
8. **Readiness notification:** proposed minimal route is an agent comment on the PMON task identifying the completed package/version, ROM revision, unresolved limitations and tests to perform. This recommendation still needs review. Native desktop push notifications remain U31–U33; they are not a prerequisite for the task-comment workflow.

## 6. Approved Revised Sequence — Not Implementation Authorization

Retain existing U01–U19 completion history and U21–U33 identities. Insert the content-backend prerequisites before U21. Model/effort labels follow the existing action-plan convention; each task still receives its own PASSKEY and review.

| Phase | Task | Deliverable and acceptance gate | Model / Effort |
| --- | --- | --- | --- |
| 4A — Finish design | U20 | Approve this consolidated behavior/ownership/roadmap proposal. No application or live-system changes. | Sol / Medium |
| 4B — Define records | U20A | Versioned profile/map/appearance/scene/plan/correction/result contracts; ROM extraction/import documentation; representative package/result examples. Preserve existing IDs and testing/history semantics. Review the schema and mapping before live proof. | Sol / High |
| 4C — Prove YouTrack storage | U20B | Fresh permission/capacity checks, reviewed content-project setup, cross-project references and isolated record/asset/retry/concurrency proof. Provision only under that task's specific authorization; obtain instance-owner assistance if required. Report what permissions can actually enforce. Stop/review if the proposed storage route cannot preserve data safely. | Sol / High |
| 4D — Read and assemble | U20C | Background registry reader, durable cache/recovery and dynamic NPCDex projection in an isolated profile. Preserve the familiar interface, shared Save/Auto-Sync semantics and separate content/work views. No live source switch. | Sol / High |
| 4E — Plan and correct | U20D | Backend planning/correction writes, shared profiles/local overrides, planned additions and archival lifecycle. Prove draft/current separation, offline writes and conflict recovery using isolated data. No implicit execution task or handoff. | Sol / High |
| 4F — Migrate safely | U20E | Preview the latest real dataset, preserve complete originals, validate mappings/assets/history and activate one authoritative provider only after the user's migration acceptance. Define GitHub backup behavior and recovery without enabling a second editable master. | Sol / High |
| 4G — Accept content backend | U20F | Installed-app acceptance, dynamic add/update from YouTrack, native edit/conflict/offline cases, exact save/credential preservation, backup restoration and verified private release. Stop for review before packaging implementation. | Sol / High |
| 5A — Package and attach | U21 | One map document, whole-map selection preview, existing/new PMON task chooser, explicit attach, immutable versions and duplicate-safe retry. Preserve unrelated task content and expose newer-draft/superseded-package state. | Sol / High |
| 5B — Navigate and track | U22 | Task/content/package links and per-package/item/group progress. Match attached package versions; no implicit dispatch or task completion. | Sol / High |
| 6A — Approve agent contract | U23 | Concrete ROM mapping/execution/update walkthrough, verified execution identity/grants, versioned direct content-update format, partial/group handling and readiness notice. Review before enabling agent updates. | Sol / High |
| 6B — Discover results | U24 | Durable discovery of agent-authored backend content revisions and package/group completion evidence, with restart, replay, offline/manual-cycle and uncertainty recovery. | Sol / High |
| 6C — Validate and apply | U25 | Validate and automatically project completed independent results or full dependent groups. Preserve newer drafts, validate authorization/baselines, reset testing and retain conflict alternatives. A separate receipt file is not the normal return route. | Astra / High |
| 6D — Review exceptions | U26 | Human review for incomplete/stale/conflicting results, corrections and mismatched groups, with previews, defer/reject/retry and no partial dependent-group application. | Sol / High |
| 6E — History and verification | U27 | Undo/archive/reversal evidence, task testing checklist and readiness/completion gates. User verification remains necessary; no automatic ROM reversal or premature closure. | Sol / High |
| 7 — Integrated acceptance/release | U28–U30 | Full system failure/concurrency review, real-workspace acceptance, recovery/agent guides and verified installer. Keep existing task-specific acceptance gates. | Existing assignments |
| 8 — Push notifications | U31–U33 | Retain the separately scoped notification review, event store and desktop delivery work after the principal release. | Existing assignments |

## 7. Approval Boundary

The user approved this U20 design baseline on October 16, 2026. U20's design-review gate is complete. This does not create the content project, change access, move current data, implement application features or authorize U20A/U21. **Next: U20A — Content Contracts and ROM Mapping Design, Sol / High, under a new PASSKEY.**

The physical record encoding, actual permission/capacity proof, migration preview and final runtime behavior remain explicit later acceptance gates. New technical findings may require a reviewed design adjustment; they do not authorize silently substituting a different backend.
