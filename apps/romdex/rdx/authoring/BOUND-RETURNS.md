# Bound agent returns — Phase 11E tools

Use the current tool kit with Node.js 24 or newer. It needs no npm packages or AI at import/reconciliation time. Keep the tool version aligned with the client: condition-aware content and `RDXReviewedScope/1` require updated readers. Old U23A transfer-only kits are historical.

The human authorizes one exact JSON Map Package on an actionable ROMDex task. Attaching a package alone never starts work. Save the fixed `RDXAgentHandoff/1` manifest supplied by Copy Agent Instructions. Configure `ROMDEX_YOUTRACK_TOKEN` securely in the agent's process environment, with access to that task and its files. Never put a credential in chat, arguments, source files or the RDX. A text-only MCP connector cannot replace binary access.

1. `node rdx/agent-cli.mjs fetch handoff.json new-download-folder`
2. `node rdx/agent-cli.mjs template handoff.json new-download-folder implementation.json`
3. Read the pinned package, baseline, assets and mappings. Locate and implement only the authorized work in a **separate ROM output file** using the ROM's appropriate editor or patching tools. This kit does not edit ROMs or interpret prose.
4. Fill `implementation.json` with the actual input/output ROM paths, complete group outcomes, reasons and checks. Change an outcome from `not-attempted` only when supported by the implementation evidence. Preserve the generated result ID when retrying the same result.
5. `node rdx/agent-cli.mjs build handoff.json new-download-folder implementation.json ReturnedMap.rdx`
6. `node rdx/agent-cli.mjs validate handoff.json new-download-folder ReturnedMap.rdx`
7. `node rdx/agent-cli.mjs return handoff.json ReturnedMap.rdx --confirm-upload`

Only fetch/return require network credentials. All outputs must be new paths. A failed build preserves input files and writes no result. Build hashes both actual ROM files and checks that the input matches the fixed package source. It resolves every written record's pinned source selections and creates fresh output-ROM mapping evidence. This verifies bytes and source selections, not runtime behavior or semantic correctness. Unsupported formats/locators or ambiguous source evidence block construction; no bounds are relaxed and no ROM is rewritten by the builder.

The generated input uses this structure:

```json
{
  "format": "RDXImplementationInput/1",
  "resultId": "rdx:keep-the-generated-id",
  "beforeROM": "actual-input.nds",
  "afterROM": "separate-output.nds",
  "groups": [{
    "groupId": "copy-from-the-template",
    "outcomes": [{
      "planDigest": "copy-the-exact-plan-hash",
      "outcome": "implemented",
      "reason": "Describe what was implemented.",
      "checks": ["Describe actual checks and remaining uncertainty."],
      "changes": []
    }]
  }],
  "readinessNotice": "Ready for Human Review and Testing. Leave the task open."
}
```

For a typed plan, leave `changes` empty: build applies the exact package patches. Alternatively supply precisely those same patches; substitutions are rejected. For prose-only work, list its concrete current-content changes using `{recordId,path,before,after}`. JSON-pointer segments escape `~` as `~0` and `/` as `~1`. States are `{exists:true,value:...}` or `{exists:false}`. Use the exact fixed baseline values. Example path: `/payload/points/<point-id>/blocks/<block-id>/text`. A selected point/passage cannot authorize changes outside that target. Shared/cross-map identities and unsupported structural changes stay blocked. A complete dependent group applies together; missing/unfinished outcomes remain held.

Prose wording is never converted into automatic permission by this tool. Its valid return is attached to the same task, discovered automatically and held for the owner's exact-difference review. Typed valid results can reconcile automatically after independent current authorization, baseline, identity, mapping, file and private-acceptance checks. File-supplied approval claims grant no authority. Unrelated newer edits, unselected plans, images and history remain local and survive reconciliation.

Return uploads use a durable sibling `.upload.json` journal. An exact verified replay reuses the attachment. An uncertain response requires rediscovery; do not delete the journal or generate a new result ID to bypass it. Returned assets/task/map/base hashes and attribution are checked before upload and again by the client. Superseded or withdrawn work is held for review.

Every accepted result requires **human testing**. The client records the affected items, sets Needs Testing, sends a readiness comment and keeps the task open. Neither a successful build, an agent's checks nor a YouTrack State edit completes human verification.

For supported older files, the return context materializes required record ancestry and condition bindings, including grouped-map identity history. Private proposals, reviews, view preferences and old whole-save blobs are excluded. Location presentation stays with the original working map; its private preview capability is not falsely claimed in the stripped return context. Unknown required features block unsafe handling.
