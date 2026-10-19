# U23 — Agent Access and Returned RDX Contract Review

**Status:** User approved and complete, October 19, 2026.
**Authorized:** October 19, 2026, task-specific PASSKEY.
**Boundary:** Review access and return contracts. No U24 receiver implementation, account/permission changes, agent dispatch or live result application is authorized by this review.

## Confirmed Workflow

- NPCDex stages work. Attaching a fixed JSON Map Package does not dispatch it.
- The human separately hands off a specific actionable task and package version.
- The agent attaches an updated map `.rdx` to that same task; ROMDex owns NPCD reconciliation.
- Valid independent results may apply automatically; dependent changes apply together. Preserve conflicting alternatives, excluded content and newer user drafts.
- Every accepted result needs human review/testing. The agent announces readiness and leaves the task open.
- The agent needs required task/package assets on YouTrack, without access to private GitHub saves.
- No separate receipt file or additional Draft/Ready editing gate is introduced.

## Access Clarification

The user initially described a separate agent account, then clarified that no separate user is visible: the agent connects using a token/API/MCP. That does not establish a separate account. The read-only `get_current_user` check for this chat's connection returned **GenericCola**. The other coding agent's connection identity and effective access remain unverified; this result must not be presented as proof of its permissions.

[YouTrack's token documentation](https://www.jetbrains.com/help/youtrack/cloud/manage-permanent-token.html) states that tokens are associated with user accounts and operate within the owning account's permissions. If the human and agent share an account, server-reported authorship cannot distinguish which one uploaded a result. File-embedded actor names are also not credentials.

**User-approved choice:** Keep the existing connection with explicit authorization for each task/package. Do not require a separate agent account for the initial release. Record the shared-account identity limitation. The authorization and transfer details below are proposed for final acceptance.

## Superseded Packages — User Approved

When the human explicitly authorizes a replacement package, subsequently received results for the superseded package are retained for human review, rather than automatically applied. Editing a local proposal or attaching an unauthorized replacement alone does not supersede an authorized package. Preserve the old return, its exact package/base binding and the newer drafts. Do not discard already accepted work merely because a later package is authorized. Application-time authorization must be rechecked so a staged result cannot bypass a later supersession.

## Testing Presentation — Revised to Existing Lights

The user approved marking the task and affected NPCDex items, then requested using an indicator-light status to avoid extra UI clutter. This supersedes the separate-badge proposal. Cyan was rejected as too similar to Standby. Of the user's suggested alternatives, this proposal adopts **flashing amber** for **Needs Testing**, distinct from In Progress's fading amber. In Development retains flashing purple. Preserve the existing light geometry, inset ring and placement; do not add a second light or badge.

Menu order: **Untouched → In Progress → Standby → In Development → Needs Testing → Complete → Critical**. Accepted agent changes set affected testing to Unreviewed and expose Needs Testing on the task and affected NPCDex items. Do not add Needs Testing to unrelated NPCDex decision/flag selectors. The underlying testing obligation remains recorded if a different status is later chosen. Critical still displays red without clearing outstanding testing. Preserve the existing Critical and In Development inheritance precedence; a pending testing stage takes precedence over the remaining noncritical stages so it cannot roll up as Complete. Unaffected testing stays intact.

Implementation in U27 must map the new status to the actual YouTrack State configuration, rather than silently mapping it to Done, and review the display for parent tasks whose normal light inherits child status. The outstanding testing gate applies even if a higher-precedence light is shown. Keep the original NPCDex flags/notes/changes controls. No State configuration changes are made by U23.

## Human Handoff — User Approved

Authorization records approval for the exact attached package and exposes **Copy Agent Instructions**. The human pastes that handoff into the coding agent's chat. Authorization and copying do not send a message, dispatch work, assign the ticket or change its State. The instructions identify the task/package and required assets, request an updated map RDX on that task, require a readiness summary and leave completion to the human.

The user explicitly approved this convenience only if it uses a hard-coded template. Interpolate verified task links, package identifiers/version and attachment references deterministically; no model call, agentic generation or separate credential is involved. The attached JSON already carries the full execution instructions; the copied text is a short pointer to that authoritative package. Disable copying an executable handoff while attachment delivery is incomplete or the referenced authorization is inactive/superseded. Do not silently authorize a package merely because its instructions were copied.

## Exact Authorization and Return Contract — Proposed

### Authorization

An explicit **Authorize Agent Work** action is available only after the fixed package, binding and required assets are delivered and verified. Pin the instance origin, native project/task IDs, package ID/version/semantic digest/exact file hash, binding attachment ID, dataset/map/document identities and immutable base revision. Show that exact version to the user. Authorization is not an assignment, message, task-State edit or proof that the agent has started work.

Keep authorization as durable application-owned history, outside the returned file. Use the existing private ROMDex metadata synchronization boundary for cross-computer continuity; do not add a new cloud service or expose credentials to an agent. Concurrent authorization changes, missing trusted history or an offline authorization whose current status cannot be established must hold the result for review. A task comment, file-embedded actor label or an uploaded authorization-looking file alone never creates human approval.

Allow withdrawal of authorization. Withdrawal or explicit supersession affects future application, including already downloaded/staged results, without deleting returned work or reversing previously accepted changes. Review and explicit reauthorization are separate recorded actions. If trusted authorization metadata is unavailable after recovery, request review/reapproval instead of guessing from filenames or timestamps.

Shared-account limitation: server authorship establishes the authenticated account, not whether a human or agent used that account. Retain observed uploader IDs and require the expected account policy; unknown/missing attribution cannot establish an automatic match. Do not describe the agent as technically restricted from NPCD if its existing account has broad grants. Direct NPCD writes and premature task closure remain forbidden by the agent instructions; stronger account separation is a future optional change. A native Done value or imported testing claim never supplies human-verification evidence.

### What the Agent Returns

Use the existing returned-map contract: one map `.rdx`, `origin.role: agent-result`, containing `RDXAgentResult/1` and the exact original `RDXTaskBinding/1`. Preserve the original package/base identifiers even if newer drafts now exist. Do not invent a new receipt file.

Require before/after source revisions and artifact SHA-256 values, identification of what was hashed, tools/checks used and their actual outcomes. `reported` source evidence is an agent report, not independent proof of a successful build or in-game test; `fixture` evidence is never production implementation evidence. Missing source/locator evidence blocks automatic application. ROMDex validates structure/provenance/content scope; it does not claim to validate the ROM itself without access to the actual source/build.

Each reported group names the exact selected plans and digests. Implemented outcomes contain matching before/after record revisions and authorized writes. Unresolved/not-attempted outcomes explain the blocker and contain no implemented writes. Omitted groups remain pending. Every outcome in a dependent group must be present and consistent before any member applies; prerequisite groups must also be satisfied. Independent groups may complete separately. New identities, removals and shared-context writes require explicit package authority and validated mappings; an omitted item is not permission to delete it.

Every return sets `requiresHumanTesting: true` and includes the readiness notice. The agent attaches it to the same task as a new result, then comments with package/result identity, implemented and unfinished groups, source/build evidence and **Ready for Human Review and Testing**. This comment does not change State or close the task. Repeated delivery of the same result/bytes is deduplicated; the same result identity with different bytes is a review condition. Discovery pins server attachment IDs, byte hashes, lengths and author metadata; filenames are descriptive only.

### Decision Table

| Situation | Receiver behavior |
| --- | --- |
| Authorized current package, exact base/read context, independent valid result | Apply that group once; set affected testing to Unreviewed/Needs Testing. |
| User merely edited a newer local proposal | Preserve that proposal; acknowledge only the implemented exact packaged version if otherwise safe. |
| User authorized a replacement or withdrew approval | Preserve the older return for review; do not auto-apply it. |
| Dependency group incomplete or a prerequisite unsatisfied | Hold the group; do not apply only part of it. |
| Source/base/task/package/hash/identity mismatch or out-of-scope writes | Preserve evidence and alternatives for review; no inferred rebinding or timestamp winner. |
| Replayed known result | Reuse its durable decision/application record; no duplicate writes or notices. |
| Agent says tested, or task is changed to Done externally | Do not clear human-testing requirements; show the discrepancy for review. Shared credentials cannot prove which person made a native State edit. |
| Human explicitly verifies the accepted result against the relevant build | U27 records verification and permits completion after all applicable work/testing obligations are satisfied. |

## Required Return Context and File Transfer

Source review found two prerequisites that must be resolved before live agent returns are enabled:

1. **Technical map ancestry:** U21 intentionally sends current record heads and selected artifacts, while `rdx/document.mjs` requires referenced record ancestry and mappings for a standalone valid RDX. Add a bounded, sanitized return-context supplement containing the required record ancestry/mapping closure and exact required assets. Exclude unchecked proposals, unrelated observations and complete private save/history exports. Pin supplement bytes, inventory and attachment IDs to the exact package authorization without modifying an already attached package or creating circular hashes. The returned map is assembled from that context; ROMDex merges only authorized result writes into the full local document, preserving local views/history/excluded material. If the required closure cannot fit the approved bounds, stop with an explicit blocker; do not truncate ancestry or weaken validation. Define the additive supplement schema and demonstrate a valid round trip before authorizing live work.
2. **Actual binary transfer capability:** the YouTrack MCP tools currently exposed in this chat have ticket/comment operations but no attachment-upload operation. That is a tool-interface observation, not proof that the account lacks Add Attachment permission, nor proof about another agent's toolset. The execution environment needs a deterministic authenticated download/upload route for package assets and returned `.rdx` bytes. Prefer an existing capable route; otherwise supply a narrowly scoped helper using that environment's securely configured connection. Never scrape connector credentials, put tokens in prompts or expose an unauthenticated service. If no route is available, the package cannot be declared agent-ready. The external coding agent's actual identity, ability to fetch all pinned files and upload/read back a marked return must be proven through its execution route before live authorization.

**Proposed additional prerequisite: U23A — Authorized Handoff and Agent File Transfer, Sol / High.** Implement the authorization ledger/actions, supersession/withdrawal, deterministic copy template and sanitized context delivery. Prove a valid returned RDX can be built from only the agent-visible material and transferred through the intended agent route using clearly marked isolated records. Preserve the existing credentials and app Data. U23A requires its own PASSKEY; do not fold these changes silently into U24's discovery task. If the agent route needs new credentials or deployment outside the approved architecture, return for a scoped decision rather than inventing access.

Suggested fixed handoff text (placeholders filled from verified application data; not an AI prompt-generation feature):

> Work on {taskUrl}, authorized NPCDex package {packageId} version {version}. Read the exact attached JSON package, binding and return-context instructions; verify their pinned hashes and required assets. Attachment references: {attachmentReferences}. Implement only its selected requests and dependency groups. Attach the updated map .rdx to this same task, report unfinished work and source/build checks, and announce Ready for Human Review and Testing. Leave the task open. Do not update NPCD directly. If any required file or mapping cannot be verified, report the blocker before changing the ROM.

The template must quote/escape inserted data and preserve the exact approved version. Copying old instructions after supersession cannot authorize old work.

## Review Checklist

- [x] Clarify account versus token/MCP identity and inspect this connection read-only.
- [x] Obtain the user's existing-connection authorization choice.
- [x] Obtain the superseded-results review rule.
- [x] Define task/item testing presentation using existing lights, reflecting the user's amber/purple alternatives.
- [x] Obtain approval for deterministic, non-agentic copy instructions.
- [x] Inspect package/binding/result/ancestry contracts and identify prerequisites without weakening validators.
- [x] Approve the consolidated contract, including the proposed U23A prerequisite and flashing-amber Needs Testing presentation.
- [x] Mark U23 complete, archive the accepted review and stop for the next task's PASSKEY.

## Evidence and Limits

Read-only account lookup, exposed-tool inventory and contract/source review only. No permissions were changed, no agent was messaged, and no live files were uploaded. Earlier owner-authenticated U20B/U21 proofs do not establish a distinct agent's effective grants or its tool capabilities. Live agent-route proof is an explicit U23A prerequisite, not a claim that U23 performed it. Installed ROMDex remains 0.5.15; U21/U22 are source-complete and later return automation is not enabled. No regression suite, browser session or installer rebuild was needed for this design-only review.

References: [U20B proof and limits](U20B-Completion-Report.md), [U21 source report](U21-Completion-Report.md), [current package/return guide](../../apps/romdex/rdx/authoring/PACKAGES-AND-RETURNS.md), [RDX validator](../../apps/romdex/rdx/document.mjs), [contract schema](../../apps/romdex/rdx/contracts.schema.json), [YouTrack attachment API](https://www.jetbrains.com/help/youtrack/devportal/resource-api-issues-issueID-attachments.html). The API exposes attachment author metadata and file operations; the local MCP operation set is a separate capability boundary.
