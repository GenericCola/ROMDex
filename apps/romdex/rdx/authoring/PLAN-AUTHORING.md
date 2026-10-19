# Authoring a ROMDex Task Plan

Use namespace `org.romdex.tasks`, kind `plan`, schemaVersion `1`, `result: null` and an ordinary extractor/user origin. The starter's `plan.document.json` is a complete example, including an original-author comment, a sprite attachment, Assignee and Due Date. The file is a portable plan, not a writable backend binding or instruction to begin work.

Every task has stable `taskId`, `parentTaskId`, `declaredTier`, non-empty title, description, status, priority, optional complexity, typed fields, comments, attachments and `baseRevision`. New tasks use `baseRevision: null`. `content.roots` exactly lists parentless tasks; parents must exist, with no cycle. Children descend Epic → Saga → Story → Verse → Task; deeper children remain Task. Arrays preserve source order and subtree relationships.

Portable values are:

- Status: `untouched`, `in-progress`, `standby`, `in-development`, `complete`, `critical`. Standby means ready for development; In Development is the purple stage. Setting a value does not certify ROM testing.
- Priority: `low`, `normal`, `high`, `urgent`. The approved YouTrack mapping is Minor, Normal, Major, Critical. Incoming Show-stopper displays as Urgent; an unchanged original native value remains preserved.
- Complexity: null, `low`, `mid`, `high`, `insane`, using the project custom field rather than tags.

## Additional Fields

Each field has a stable portable `key`, `type`, `value` and `readOnly` boolean. Do not use a guessed YouTrack field ID as portable authority.

| Type | Value when set |
| --- | --- |
| `string` | Exact string. |
| `integer` | Safe integer; no floating point or numeric string. |
| `boolean` | true/false. |
| `date` | Real calendar date `YYYY-MM-DD`; no inferred timezone offset. |
| `user` | `{ "login": "...", "displayName": "..." }`. |
| `enum` | `{ "optionKey": "...", "label": "..." }`. |
| `multi-enum` | Array of those option objects; used for portable tags too. |
| `period` | `{ "minutes": 90 }`, a non-negative safe integer. |
| `json` | Bounded JSON data retained as data. A writable compatible destination is still required. |

The schema permits null for the applicable unset types. Read-only/calculated values are context, not outgoing writes. The publication preview refreshes actual editable definitions and requires compatible field/value mappings. Unsupported writable fields block publication; they are not silently dropped. Assignee claims do not authorize impersonation or identify an eligible account automatically.

Comments have stable `commentId`, exact body, author claim and creation time. YouTrack posts through the connected account while retaining imported author/time as provenance. Attachments have stable `attachmentId`, asset ID and display name; inventory entries point to exact hashed blobs. A display filename is not a filesystem path. Preserve comments and files on reimport. A changed already-posted comment/file requires a new portable identity rather than rebinding the old one to different content.

## Placement, Updates and Removal

The user imports locally, reviews the plan and chooses **Save Local Plan**. To publish, they separately choose a PMON root or parent, inspect resulting tiers, map fields/values and explicitly queue reviewed changes. A declared Epic below an existing Epic becomes Saga, and its descendants shift with it. Multiple/deep children retain their relationships. Native Type defaults to the adapter's Task unless explicitly mapped; displayed tiers come from hierarchy. Manual ordering is retained in ROMDex metadata without expensive native reorder writes.

For existing tasks, preserve all identities. `baseRevision` pins the exact previous task body hash, computed by `taskRevision` in `rdx/plan-import.mjs` (excluding only that task's `baseRevision`). Keep the existing document history/base so the application can distinguish an update from a conflicting branch. Reimporting identical data is a no-op. The destination's newer edits require choices. Omitted tasks, fields, comments and files survive; omission is not deletion.

An explicit `content.deletionRequests` entry identifies `taskId`, its expected task revision and reason. The user must select it in the publication preview; deletion affects YouTrack and is not inferred from omission. Scope/children and stale targets are reviewed first. Preserve deleted-task history. A task's comments, attachments and publication operations must not be recreated merely because a response was interrupted.

Bindings stay in the application's local ledger, outside portable documents. On another computer, the user explicitly matches existing PMON records where needed; a ticket key in a file or similar title cannot establish identity. Reviewed comment/attachment matching prevents duplicates. Auto-Sync and manual Save Changes use the existing recovery queue; unresolved uploads require discovery and a reviewed retry.

Local plan export includes the saved task content and exact assets without a token. Accepted native task changes fold back into its managed document; overlapping changes enter review. See [the implementation guide](../PLAN-IMPORT.md) for current controls and bounds. Publishing a task plan does not dispatch an agent, implement a change or close a human-testing gate.
