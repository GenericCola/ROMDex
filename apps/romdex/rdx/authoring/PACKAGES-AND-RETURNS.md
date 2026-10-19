# Fixed JSON Map Packages and Returned Map RDX

This is the approved authoring contract and handoff guide. Package UI/attachment is U21; final execution identity and returned-file discovery/reconciliation are U23–U27. RD09's offline examples/checker do not activate these features. Ordinary map/plan import refuses `agent-result` files.

## Stage, Package and Attach

NPCDex is a planning/staging workspace. It shows implemented content with proposed changes appended. Preparing or attaching a package never initiates agent work. The user separately hands off the actionable ROMDex task.

The planned **Package Map Changes** preview starts with the whole current map and its sub-zones preselected, allowing exclusions. It distinguishes actionable requests from notes, flags, observations and open questions. The user chooses an existing PMON task or explicitly creates one, then attaches the fixed JSON package. Record package/task/attachment links separately. Later user edits remain newer drafts; replacing an attachment requires an explicit new package version and preserves old versions.

Use `.json`, with format `NPCDexMapPackage/2`. Its human-readable fields are also deterministic structured data:

| Field | Meaning |
| --- | --- |
| `packageId`, `version`, `digest` | Stable package lineage, immutable version and semantic digest. |
| `datasetId`, `baseDocument`, `mapRecordId` | Exact portable lineage and map/document revision the work was planned against. |
| `source` | Source repository/revision and extraction/inventory evidence hash, with its evidence level. State what artifact each hash covers. |
| `contextRecords`, `mappings` | Exact baseline/read context and unambiguous versioned ROM locators. |
| `requests` | Selected, pinned `NPCDexPlanRevision/1` versions and their baseline/read sets, patches, instructions and required assets. Selected non-FINAL work defines the requested scope after a separate human handoff; internal Draft/Ready metadata is not an extra user gate. A context-only package may have no requests. |
| `observations` | Contextual flags/notes/testing observations. They are not commands to change the ROM. |
| `groups` | Dependency groups, plan digests, read sets, allowed write records, prerequisite groups and acceptance checks. |
| `assets` | Exact hashes, sizes, MIME types and durable YouTrack instance/project/issue/attachment identities. |
| `instructions` | Scope, verification, return-file and readiness/testing requirements for the agent. |

Use the pinned `package` definition in `rdx/contracts.schema.json`. `/2` supersedes the historical `/1` direct-agent-update workflow. Keep historical bytes; do not relabel them or use their old instructions for new assignments.

## Three Different Hashes

1. A native artifact's `digest`/`revisionId` covers canonical semantic JSON excluding its own seal.
2. A map's `revision` covers its canonical document excluding only top-level `revision`.
3. The attachment's `sha256` covers **the exact JSON file bytes**, including whitespace/newline. Pretty-printing a package after binding changes this hash, even when its semantic digest is unchanged.

Seal the package first, write its final bytes once, then compute the raw attachment hash. `RDXTaskBinding/1` pins package ID/version/raw hash plus verified instance origin, project ID, issue ID and attachment ID. Its `dispatch: "none"` records that attachment itself did not hand off work. The binding is separate from the package to avoid circular self-hashing. A human's later task assignment/handoff and authenticated permissions establish execution authority; names/actor claims/fixture IDs are not credentials.

Every asset needed by the agent must be accessible on YouTrack through verified ticket/attachment IDs and byte hashes. Include the actual image/script/context files required for the assignment; a private GitHub save URL, local path or expiring download URL alone is insufficient. Bulk unrelated saves need not be exposed. Preserve required license/private access boundaries and record unavailable assets as blockers rather than substituting a similar sprite.

## The Agent's Execution Checklist

After the separate human handoff, obtain the exact attached package, its binding and all required YouTrack assets. Verify file hashes, source revision/toolchain, identity/mapping evidence, selected request versions and dependency groups. Resolve each locator uniquely against the actual source before touching the ROM. Missing/ambiguous resources, stale bases or inaccessible assets need clarification. FINAL decisions, flags and notes never authorize changes. A context-only package explicitly authorizes no ROM changes.

U21 keeps the complete working RDX local so unchecked proposals, observations and history do not leak through a baseline attachment. The fixed JSON supplies current content records, mapping evidence and selected artifacts, plus verified asset locations. The original immutable RDX revision is pinned locally for reconciliation. Do not assume private GitHub access or treat omitted plans/notes as deletions. U23–U27 must preserve the original local presentation/history and newer or excluded drafts when accepting an agent result; this source implementation does not enable that receiver.

Implement only the assigned package scope. Preserve unrelated ROM content, newer NPCDex drafts and histories. Independent groups can be reported incrementally. A shared scene and its participants must return as a complete dependent group; partial success cannot silently publish half the scene. Do not update NPCD directly as the normal result route. Prepare an updated map RDX and attach it to the **same actionable task**; ROMDex's later receiver owns accepted NPCD/working-file reconciliation.

## Build the Returned Map

Preserve dataset/document/record/point/block/prompt IDs, the exact base document and referenced history/assets. Append implemented record revisions and mapping/source evidence; include the matching current heads and retain unimplemented proposals plus newer drafts. The origin role is `agent-result`; `result` contains `RDXAgentResult/1`:

- Stable `resultId`, exact `taskBinding` and `baseDocument`.
- `source` with actual before/after revisions, before/after artifact hashes and the true evidence level. Explain which source/ROM/build artifacts were hashed in the accompanying evidence; fictional example hashes prove no ROM work.
- Per-group outcomes naming exact plan IDs/digests, `implemented`, `unresolved` or `not-attempted`, a reason, before/after record revision writes and checks performed.
- **`requiresHumanTesting: true`** and a readiness notice. Automated comparisons/build checks are not human in-game testing.

Include valid before/after content for every claimed write and retain unaffected entities. Unresolved/not-attempted outcomes cannot change their current content. Extra writes, stale/unknown ancestry, mismatched task/package, changed shared context, ambiguous mapping and incomplete dependent groups require review; no timestamp decides a winner. A successful older package acknowledges only its exact plan versions, keeping newer drafts pending.

Validate and pack the returned map locally. Attach it as a new result attachment with stable result identity; retries must discover the same existing bytes instead of posting duplicates. Announce **Ready for Human Review and Testing**, including unresolved groups and build/source evidence. **Leave the actionable task open.** Only the human verifies results in-game and authorizes completion. Imported testing claims stay historical claims and cannot authenticate a human test.

When the later receiver is enabled, it will discover the returned RDX on the task, validate provenance and scope, auto-apply safe independent matches, queue conflicts and apply dependent changes atomically. Accepted content updates NPCD and the managed RDX. The file remains marked for human review/testing. RD09 does not assert that this automation is already installed.

## Reference Exercise

The versioned `contract-reference` folder contains an exact map, four requests in three groups, one observation, assets, fixed JSON package, separate binding and returned-map example. The return implements only the independent guide-dialogue request; other groups remain pending. `check-reference.mjs` checks local structure/seals/byte-binding relationships with no network writes. Both the fictional `.invalid` origin and `fixture:*` IDs must be replaced by verified real provenance during an actual authorized assignment. The example is a contract walkthrough, not a completed ROM change.

## U23A Authorization and Return Context

See [Agent File Transfer](../AGENT-FILE-TRANSFER.md) for the source implementation. Verified delivery now includes a separate RDXReturnContext/1 JSON supplement supplying required immutable content ancestry/mappings. It excludes private plans/reviews/views and whole-document history; the original JSON package is not rewritten. Exact-version authorization is application-owned private metadata, independent of any actor claim in a file. The fixed Copy Agent Instructions template and downloadable RDXAgentHandoff/1 manifest identify verified task files for the deterministic CLI. Context baselines are execution material, not replacement imports. U24 discovery and U25 application remain disabled.
