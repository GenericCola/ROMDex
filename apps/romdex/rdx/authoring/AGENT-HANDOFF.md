# Agent Handoff Prompts and Acceptance Stories

Supply this kit with the source/context needed for the specific assignment. An agent does not need access to all private saves. The prompts below do not authorize execution merely by being present in an imported file.

## Read-Only Map Extraction Prompt

> Prepare one portable NPCDex map `.rdx` using this kit's pinned version 1 schemas and CLI. Work read-only from the supplied ROM/source revision and decoder/toolchain. Preserve exact text, whitespace, controls, conditions, stages, participants, gender variants and image bytes. Include project-relative, uniquely resolvable ROM locators and a hashed source inventory/evidence report. Do not invent a verified mapping for an unknown resource.
>
> Use the latest supplied map/context identities for existing content. Keep shared character profiles separate from local appearances; retain existing aliases, views, notes/flags, proposals, history and testing claims. Allocate new stable identities only for genuinely new records, with a durable identity manifest. Package one map and its complete referenced context/assets; use partial coverage unless completeness is proved. Do not recreate existing NPCD records, publish tickets, change the ROM or mark anything tested.
>
> Deliver the map RDX, source evidence/identity manifest, `validate`/`inspect` output and a list of unresolved items. Report whether this was actual ROM extraction or a fictional exercise. The owner reviews local import and any backend binding separately.

Required inputs: game/variant, exact ROM/source revision, authorized relevant resources, decoder/toolchain versions, source hashes, latest exported map/context if present, stable identity inventory and assignment scope. If these inputs are insufficient, inventory what is missing before claiming successful extraction. Do not derive event IDs from tile names or copy fictional locator values into production.

## Task-Plan Authoring Prompt

> Prepare a portable `org.romdex.tasks` plan RDX with the requested Epic/Saga/Story/Verse/Task subtree, stable task identities, exact descriptions, typed fields, comment provenance and hash-addressed attachments. Preserve children with their parents. Use null bases for new tasks; preserve the supplied current task/document baselines for updates. Retain omitted tasks; use explicit pinned deletion requests only when requested. Do not select a writable backend destination, impersonate an assignee or dispatch work. Deliver validation output and identify fields/accounts that need destination mapping in the user's preview.

## ROM Implementation and Return Prompt — Later Execution Gate

Use this prompt only after separate human handoff of an actionable task and the later package/return features are enabled:

> Work from this task's exact authorized JSON Map Package version, separate verified binding, sanitized RDXReturnContext/1, source evidence and YouTrack-accessible assets. Verify hashes, source revision and uniquely resolving targets first. Implement only the selected non-FINAL requests in the authorized package; retain unrelated content and newer drafts. Report blockers without guessing.
>
> Return an updated map RDX on the same task with `origin.role: "agent-result"`, exact task/package/base provenance, retained source/base/history/assets, actual before/after content and per-request grouped outcomes. Treat dependent scene changes as one group. Set `requiresHumanTesting: true`, retain unreviewed testing, and announce Ready for Human Review and Testing with your source/build checks and unresolved work. Leave the task open. ROMDex owns accepted NPCD reconciliation; do not directly rewrite the backend as the normal return route. Do not claim that automated checks are a human in-game test.

## Acceptance Stories

| Situation | Expected result |
| --- | --- |
| Agent extracts a genuinely new map with valid source evidence. | One self-contained map RDX imports after preview, displays its entities and exact images locally, then publishes only after reviewed binding. |
| Owner imports a file without a connection. | Viewing/editing/managed save/export work locally. A second instance can import the exported bytes and retain identities/assets without the first machine or private repository. |
| Owner edits notes/dialogue/image locally, then exports. | The managed checkpoint and exported RDX retain the saved proposal/feedback and exact old/new assets/history; the originally imported file remains unchanged. |
| YouTrack has newer mapped task fields/comments/files or an accepted structured map revision. | Two-way reconciliation updates the managed document; overlapping changes require review. Native map title changes require a documentation-correction choice. Ordinary ticket prose is context, not executable NPC dialogue. |
| A renamed NPC is re-extracted. | Its existing record/profile/appearance identities survive; no title-based duplicate is created. A physical move/remapping requires supported coordinated review rather than a cloned identity. |
| A new file omits an existing character. | Partial coverage retains it. A verified complete covered snapshot can offer archival in preview, preserving history and newer destination edits. |
| A plan is placed beneath an existing Epic. | The full subtree moves together, tier changes are previewed, and existing task matching/field values require explicit choices. |
| Package version 1 is implemented after the owner drafts version 2. | Only the exact packaged plan versions are acknowledged; version 2 remains pending. The old attachment never changes silently. |
| One independent request succeeds but a shared scene is incomplete. | The later receiver can apply the safe independent group; the dependent scene remains pending/reviewed as a unit. |
| A returned file is corrupt, stale, mismatched or writes outside scope. | Preserve both versions and evidence for review. Do not discard local work, bind to another ticket, guess a target or close the task. |
| The agent claims implementation succeeded. | Updated current content is still Needs Human Review and Testing; the task stays open until the owner verifies it. |

The local fixture exercise and reference checker prove deterministic format use. RD07 separately proved two-way YouTrack behavior using eleven isolated real content records. None of these is proof that a particular real ROM extractor or in-game result has been tested.

U23A adds deterministic [authorized handoff/file-transfer tools](../AGENT-FILE-TRANSFER.md). Copy Agent Instructions is a fixed template, not AI generation. New authorization supersedes older versions on the same task/map; their results require review. Returned-file discovery/application remain U24/U25, and the flashing-amber Needs Testing stage remains U27.
