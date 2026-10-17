# Pre-U20 Future Phase Plan

Historical plan preserved before the content-registry revision. This is not the current implementation authorization.

## Phase 4 — Change Requests and YouTrack

### 4A. Required User-Story Checkpoint

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U20 | First review the proposed YouTrack-backed content registry and its effect on ownership, hierarchy, current/requested data and agent confirmation ([discussion draft](U20-Architecture-Discussion.md)). No architecture adoption or migration is approved yet. Then walk through realistic request publishing, map-level JSON packaging, grouping, existing-ticket linking, bulk selection, instruction updates, and retry use cases with the user. Define the map/target mapping, included context, attachment preview, ticket creation controls, shared-field ownership and completion policy. | User approves the workflow and exact package scope. Demonstrate a map package linked to an existing ticket and an explicitly approved new ticket. No default grouping or automatic creation is carried forward without that decision. | Sol / Medium |

**U20 confirmed workflow boundary (October 16):** Permanent content records are planned for a separate NPCDex Content project on the existing YouTrack instance; actionable development tasks remain in PMON. Project creation/access and cross-project references require later permission checks and separately authorized implementation. Recurring characters share a profile (identity/name/base image) with separate local appearance records for dialogue, events, conditions and overrides; identical sprites alone never merge character identities. Add Character creates a Planned Addition content record; it becomes current only after validated implementation. Proposed removals remain visible until implemented, then archive the local appearance/history while retaining testing access and other appearances. Content planning never permanently deletes content records or implicitly creates an execution task. NPCDex is planning/staging only. Package Map Changes produces one document for attachment to an actionable ROMDex task; NPCDex never directly initiates agent work. The user chooses an existing ROMDex task or explicitly creates a new task if needed, then confirms attachment of the generated document. Packaging and attachment do not implicitly create/assign work, automatically advance task status or initiate execution. The user initiates agent work separately through the ROMDex task workflow. The preview starts with all pending plans, flags and notes for the current map and its sub-zones preselected, with exclusions allowed before document generation; requested actions remain distinct from observations/open questions. The package instructs the agent to update both the ROM and the relevant NPCDex backend records to reflect the implemented result. Current content remains primary in NPCDex, with proposed changes appended. Attached packages are fixed snapshots; later edits remain newer drafts until an explicit replacement is attached. Completion of an older package updates its implemented current content while preserving newer pending proposals. Future result validation must match the packaged request revision rather than reject it solely because an unsubmitted draft changed. Validated independent items update as they complete; dependent edits update together as a validated group. Package progress distinguishes partial from full implementation. Existing reset-to-Unreviewed testing semantics remain in force. After all packaged changes are implemented, the agent notifies the user that the task is ready for testing and leaves it open until user verification. The notice channel remains to be chosen; desktop push notifications retain their later U31–U33 scope. Direct ticket-based result updates versus the existing receipt transport remain under architecture review; do not implement the older receipt route by default before resolving that review.

### 4B. Implement the Approved Workflow

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U21 | Implement approved document-generation/task-linking controls and attach one versioned map-level change document to the chosen actionable ROMDex task, following U20’s planning-only boundary. No NPCDex agent-dispatch or implicit execution trigger. Reuse approved NPCDex contracts: include stable workspace/map/target identifiers, published request IDs/revisions, baseline evidence/hashes, exact changes and needed context, plus self-contained agent instructions and the required Integration Receipt format/example. Preserve durable ticket/package mappings and duplicate prevention. | An agent can locate the intended map and targets from the attachment without manually rebuilding the mapping. Previewed requests produce only intended tickets/links; interrupted attachment/ticket retries create no duplicates; existing content remains intact. No credentials or unrelated dataset are packaged. | Sol / High |
| U22 | Add navigation between requests and ROMDex tasks, and synchronize approved shared fields/native YouTrack edits with explicit conflict handling. | Native edits return correctly; instruction changes invalidate older request versions; tester verification remains separate from task progress. | Sol / High |

**Agent-data boundary:** every required handoff dependency—including selected images, sprites, source/context and mapping evidence—must be attached to or otherwise accessible within the approved YouTrack ticket workflow. An agent must be able to complete a request and return its receipt without access to ROMDex-Data. Preview the exported scope and validate package completeness; private GitHub URLs are not sufficient dependencies. The bulk private save, unrelated images/history and credentials remain outside the handoff.

## Phase 5 — Agent Delivery and Integration Receipts

### 5A. Define and Build Delivery

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U23 | Review the ticket-attached map JSON handoff and select the agent receipt return/discovery route. Define limited access, stable map/target mapping, published request versions, existing receipt contract compatibility, instructions for producing and returning a receipt, offline delivery and correction/retry examples. | User approves a concrete ticket → agent → receipt → NPCDex walkthrough before implementation. The agent needs no manual reconstruction of target mapping; transport fits free hosting and preserves manual JSON fallback. | Sol / High |
| U24 | Implement approved request retrieval and automatic receipt discovery/pull from linked tickets or the return route approved at U23 into a durable inbox. Record source ticket/package, receipt IDs, authorization and discovery progress; support restart, offline catch-up and uncertain retries. Follow shared Auto-Sync Off/manual one-cycle semantics. | Authorized agents retrieve only eligible packages; returned receipts arrive without a manual download/import step, including while ROMDex runs in the tray. Repeated discovery/submissions are recognized; receipt intake does not grant unrestricted dataset edits. | Sol / High |

The current trusted development GitHub connector is owner-authorized and can access ROMDex-Data; it is not an example of an isolated ticket agent credential. U23 must verify the specific execution identity used by ticket agents and avoid reusing broad owner/developer GitHub access. U14's denied-access test covers the separately scoped update token, not every owner-authorized application. No save-repository collaborator or dedicated agent grant was added.

### 5B. Reconcile, Review, and Recover

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U25 | Automatically validate and reconcile pulled receipts against one current revision, preserving NPCDex's existing receipt semantics and history. Reflect applied changes in NPCDex and queue their cloud synchronization without requiring manual JSON import. | Authorized matching receipts apply once and atomically to the correct map/targets; stale hashes/values/feedback, wrong-map packages, duplicate IDs and concurrent edits cannot cause invalid application. A later conflicting offline branch sends the whole receipt to review under U04. Application does not certify testing or itself modify the ROM. | Astra / High |
| U26 | Add human receipt review with preview, conflicts, linked ticket, defer, reject/correction, and a controlled resolution path. | Failed receipts make no partial changes; resolved receipts still satisfy validation; applied work resets affected testing to Unreviewed. | Sol / High |
| U27 | Integrate undo/archive/reversal history and the ticket-completion policy approved at U20. | Dataset undo is distinct from actual ROM reversal; reversal requests/receipts retain evidence and IDs; tickets close only under the approved policy. | Sol / High |

**Milestone C:** Approved work can move from NPCDex to YouTrack and back through validated agent receipts with human review for exceptions.

## Phase 6 — Final Quality Review and Release

### 6A. Integrated Review

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U28 | Review the full implementation and run integrated failure/concurrency scenarios across switching, desktop lifecycle, cloud, YouTrack, requests, and receipts. | No unresolved data-loss or reconciliation failures; installer/upgrade retains saves and credentials; targeted fixes receive their own scoped follow-up if needed. | Astra / High |
| U29 | Conduct a guided real-workspace acceptance pass with previewed migration and deliberately isolated QA records. | User confirms UI/workflow; native YouTrack edits and cross-device updates are visible; QA artifacts are cleaned without restoring stale real data. | Sol / High |

### 6B. Release and Handoff

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U30 | Produce the verified installer, release manifest, backup/restore guide, account setup instructions, agent integration contract, and QA report. | Installed release matches reviewed source; secrets and private working data are excluded; recovery and upgrade instructions are usable. | Sol / Medium |

## Phase 7 — Agent Contact Notifications After the Principal Release

Scheduled after U30 so notifications do not delay cloud persistence or the request/receipt workflow. This is a planning addition only; each task needs its own PASSKEY. Notifications are separate from application update notices. The app must not promise delivery while fully quit without an approved, verified delivery mechanism.

| Task | Action and Deliverable | Completion Check | Model / Effort |
| --- | --- | --- | --- |
| U31 | Review notification user stories: agent creates a ticket, adds a comment or sends a message. Define which sources count as messages, how agents are identified, eligible projects/tickets, unread state, native Windows alerts versus in-app activity, quiet/mute preferences, Auto-Sync interaction and delivery while hidden, offline or fully quit. Compare routes within the existing free-only/no-billing constraints. | User approves concrete event examples, relevance rules and delivery expectations before implementation. No extra messaging service, broad polling scope or automatic agent outreach is assumed. | Sol / Medium |
| U32 | Implement the approved activity retrieval and durable event/unread store, reusing existing YouTrack/service adapters where appropriate. Preserve source identity, ticket/comment/message references and discovery progress; distinguish incoming agent activity from the user's own actions and ROMDex's automation. | Catch-up after offline periods/restart loses no eligible events; repeated retrieval does not duplicate events. Access boundaries and the approved Auto-Sync policy hold. | Sol / High |
| U33 | Add approved Windows notifications and in-app activity access with click-through to the relevant ticket, comment or message. Support the preferences approved at U31 and verify installed-app/tray behavior. | Test all three event types, hidden-window delivery, click-through, unread/read transitions, permissions, muted/burst activity, restart/catch-up and duplicate suppression. Report fully-quit behavior accurately; issue a tested release with retained saves/credentials. | Sol / High |

