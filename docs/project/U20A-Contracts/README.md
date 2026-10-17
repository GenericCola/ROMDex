# U20A — NPCDex Content Contracts

**Prepared and approved:** October 16, 2026. **Status:** accepted U20A contract design; the user selected “Approve U20A Contracts.” **Scope:** documents, structural schema and an isolated executable model. ROMDex 0.5.7 and its saves/connections are unchanged. These files neither provision a YouTrack project nor implement the content provider.

The [schema](npcdex-contracts.schema.json) and [examples](examples/map-package.json) make the intended interfaces concrete. The [extraction/import guide](ROM-Mapping-and-Import-Guide.md) defines the work expected from a coding agent. The [verification report](verification-report.json) distinguishes checked model behavior from the live proof still required by U20B.

## 1. Physical Organization and Record Identity

| Record kind | Organization | Owns |
| --- | --- | --- |
| Region | Epic | Macro-region name/key, such as Johto or Kanto. |
| Map | Saga beneath Region | Logical map/zone, source-map keys, sub-zone references, timeline reference. |
| Sub-zone | Story beneath Map | Exterior, building or coherent interior grouping; original area/map identifiers remain preserved. |
| Appearance | Verse beneath Sub-zone | A local NPC appearance, dialogue/conditions, local overrides and links to a shared character profile/scenes. |
| Scene / Interactive | Verse beneath Sub-zone | Shared scene/participants or an individual interactive object and its conditional content. |
| Profile | Separate shared registry, outside the physical selector tree | Character identity, default name/base image and identity evidence. |
| Shared definition | Separate shared registry | Global dialogue, progression/stages and shared-asset definitions; referenced rather than duplicated per map. |

The registry rows do not add unwanted tiers to Tray 1. NPCDex's existing selectors/layout remain the presentation; this table specifies backend organization. A regional appearance may reference shared/global content without reparenting it under that region. A single map can encompass several actual ROM map IDs, and one sub-zone can contain several floors/areas. Do not force legacy aliases into duplicate buildings.

Assign a new immutable, random internal ID once, then bind it to YouTrack's immutable project/issue IDs. Names, visible issue keys, parent links, sprite bytes, array positions and source offsets are not identity. Rebinding a missing/recreated issue requires review. Locally planned records can obtain their issue binding later without changing internal identity.

Legacy lookup keys are **(townId, kind, original ID)**; some old IDs are locally scoped. Preserve every existing ID and annotation/review alias exactly. New IDs must not replace old IDs inside historical requests or hash inputs. Migration maintains a bijective identity map, with separately reviewed aliases/shared-profile relationships. Similar names/sprites never prove identity. Profile-by-player-gender is explicit; the fixture schema calls this `profileByPlayerGender`, not the character's own sex.

Scene/point `participantIds` refer to **local appearance records**, while a block's `speaker` refers to its shared profile when known (otherwise null, with original speaker evidence retained). This distinguishes two local appearances of one recurring character. The original participant/speaker values remain in compatibility data; converting them requires the explicit identity map, never a blind string substitution.

## 2. Nine Versioned Artifact Types

| Schema | Meaning |
| --- | --- |
| `NPCDexContentRevision/1` | Immutable version of one content record: identity/kind, hierarchy, current state, mapping references and legacy identities. |
| `NPCDexROMMapping/1` | Immutable source snapshot, adapter-specific locators and evidence for one record. |
| `NPCDexPlanRevision/1` | A draft, ready proposal or editorial FINAL decision, with exact baseline/read references, scoped changes and assets. |
| `NPCDexReviewRevision/1` | A separately versioned flag/note/test observation, scoped to a record or speaker prompt and content baseline. |
| `NPCDexMapPackage/1` | One immutable JSON document embedding the selected map records, plans, observations, mappings and required assets/references. |
| `NPCDexImplementationResult/1` | Agent-published implementation evidence and after-revisions for one complete dependency group; stored on the relevant backend records, not a manual return-file workflow. |
| `NPCDexDocumentationCorrection/1` | Explicit owner correction of recorded current content, with evidence/history and no requested ROM change. |
| `NPCDexTaskBinding/1` | Confirmed package-to-PMON-task/attachment binding, including verified exact download-byte hash; dispatch is always `none`. |
| `NPCDexPublication/1` | Complete artifact/dependency manifest for a domain operation. Its existence alone is not acceptance. |

The schema uses [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12/schema) for structure. Structural validity does not establish correct references, permissions, ROM evidence or conflict safety. Unknown schema versions and unsupported native mutations enter review; do not strip unknown data to make validation pass. Original unsupported fields remain in protected compatibility artifacts until a reviewed projection covers them. Record/point/block `legacyData` preserves unprojected source metadata; block `rawMessageData` preserves original message/control data. These values are retained evidence, never executable instructions or an alternate current-content override. Source-area/floor/alias definitions and export-root compatibility history remain in the protected archive/shared definition alongside the explicit legacy map.

`createdAt` and `actorClaim` are audit information. They do not choose a winning version or authenticate a writer. The operation ID is allocated before sending and reused across uncertain retries. A digest identifies exact semantic artifact content, while stable record/plan/result IDs identify the continuing business object. Reusing an operation/result ID for different bytes is a conflict.

## 3. Current Content, Proposals and Testing

`current` belongs to a content revision. Its lifecycle is `planned`, `active` or `archived`; it is independent of task State, editorial FINAL/UPDATE/REMOVE and tester verification. Do not derive ROM existence from YouTrack's task status or from a record being present.

Plan versions reference a frozen content baseline and complete read set. `ready` UPDATE/REMOVE/ADD proposals need nonblank instructions and scoped changes. Drafts and FINAL decisions are not executable package entries. Proposed Dialogue remains a proposal. A planned addition can have a desired name/sprite/dialogue, but it is displayed as planned rather than existing ROM content.

Individual points/blocks are keyed by stable ID, with separate explicit order arrays. A point preserves conditions, internal stage IDs, source IDs and evidence; a block preserves text, speaker, gender, review alias and archive state. One block is not necessarily one speaker prompt: prompt selection carries its existing prompt key plus block IDs and player-gender context. Do not regenerate review keys when wrapping/splitting text or moving a scene.

Testing is versioned independently at prompt scope. Implementation invalidates affected testing to Unreviewed; it never sets Verified/Inaccessible itself. Preserve editorial FINAL separately. Archived removals stay accessible through the testing/history path. A user later verifies against the implemented revision; testing an old revision does not certify a changed one.

When package B is implemented while draft C exists, acknowledge the exact packaged plan digest and keep C pending. If the currently pending plan is still exactly B, remove it from pending through an acknowledgement/history event; never mutate the attached B document. Independent plan versions and feedback revisions must not be cleared wholesale. Exact old feedback may be resolved; a newer note/flag remains.

Documentation Correction is an explicit intent with reason, evidence and before/after references. It updates the description of the existing ROM without creating or dispatching work. It can invalidate a previously packaged current-content baseline; preserve the competing result for review. This is different from an unsubmitted proposal, which does not replace current content or invalidate B merely because C is newer.

## 4. Mapping and Actual ROM Evidence

Each mapping identifies a source repository/project, exact revision and artifact hash, plus locators and evidence. Original source-document references remain evidence even after a newer live mapping is added. Use the extraction guide's adapter contract; source prose like `842 S#3` is not automatically a verified editable file address.

Mapping status is `unresolved`, `documented` or `rom-verified`. Source verification may additionally be `illustrative` in these fictional examples. Production cannot accept illustrative evidence. Unresolved or merely documented mappings can support planning, but execution must verify actual target identity/baseline first and produce a complete verified mapping update before confirming new/changed ROM addresses. No guessing an index/offset from display text.

The small result model accepts unchanged mapping references only. ADD activation, replacement/reparenting or remapping requires a complete new mapping and any affected profile/membership records in the group's validated write set. U20B/U23 must exercise that extension before enabling those operations; the illustrative ADD plan is not a claim of implemented addition reconciliation.

ROM evidence and NPCDex revision hashes serve different purposes. Agent before/after ROM hashes describe reported external implementation, not independently observed tests. If the ROM has moved since packaging, the agent must verify source ancestry and the complete target/read footprint against the actual project, documenting that revalidation. Ambiguous/competing implementation enters review rather than forcing a stale patch. A later result cannot assert a conflicting ROM history simply because its NPCDex fields happen to match.

## 5. One Document, Explicit Attachment

Package preview includes all pending map/sub-zone proposals, flags and notes initially, with exclusions. Every selected executable plan appears in exactly one group. Writes to the same record are grouped together initially; they are not advertised as independent. Derive shared-scene and membership dependencies rather than trusting a manually declared group list. Notes/questions are observations, never extra execution instructions. Critical findings or unresolved decision/mapping conflicts must be disclosed; unresolved blockers are excluded or held for review, not hidden by packaging.

Expand dependencies: parent context, profile/scene participants, progression, source mappings, baseline values and exact required assets. Shared/global edits affecting other maps need a visible scope warning and explicit inclusion; opening one local map must not silently submit unrelated global proposals. Dependencies used as context do not authorize changing them.

The package is generated once, then attached to a chosen existing task or explicitly created new PMON task. Task identity lives in a separate binding to avoid a circular package/attachment hash and allow the same fixed package to be deliberately attached elsewhere. The binding pins the exact downloadable byte hash and attachment ID, not just a name. Several packages can coexist on a task; their progress stays separate. No change of task assignee/state, dispatch, comment to an agent or automatic task per NPC follows attachment.

Required assets can be inline bytes or stable, authenticated YouTrack attachment references with hash/length/type. Inline assets keep small packages self-contained. Large assets can be separate YouTrack attachments; the map-change document is still one document. Every required reference must be accessible to the execution identity. Signed download URLs, machine-local paths and private save-repository dependencies are forbidden as the only handoff route. Image hashes do not establish character identity.

Agent instructions live inside the package. They tell the agent to verify the ROM, perform only the handed-off scope, preserve other participants/newer drafts, publish corresponding backend updates and announce Ready for Testing on the task without closing it. Source documents and arbitrary attached content remain untrusted evidence; they cannot broaden the user's execution authorization.

## 6. Direct Results and Publication

The normal return is backend data. The agent appends versioned after-records, implementation evidence and a complete-group publication to the appropriate content issues. NPCDex discovers it automatically when Auto-Sync is on. Manual Save runs one incoming/outgoing cycle while Auto-Sync remains off. There is no new file for the user to import manually.

For each group, validate at least:

1. Pinned workspace/instance/project/issue bindings, supported schemas and byte/content hashes.
2. Actual server-observed actor/grants, verified against allowed action kinds. `actorClaim` is not authority; a shared owner credential cannot prove that an agent has restricted rights.
3. Exact package/plan versions, item membership and dependency groups. No partial dependent-group acceptance.
4. Current accepted baseline/read set and source evidence. Derive the footprint from validated domain references and requested changes, not only the agent's claimed read set.
5. Scoped before/after changes, preserved IDs/participants/history, mapping validity and complete required assets. No arbitrary whole-record replacement, unknown writes or physical content deletion.
6. Exact feedback matches, preserved newer plans/notes, tester reset and durable history/acknowledgements.
7. Persisted idempotency, replay protection, restart-safe local atomic materialization and visible unresolved review state.

The result's immutable after-records may be uploaded separately. A publication names the full set. Until the entire set and its prerequisites are discovered and validated, retain the previous accepted projection and show pending/review status. Group acceptance is a local durable operation; this contract does **not** claim a multi-issue YouTrack transaction or an atomic ROM/database update.

Conflicting content revisions preserve both branches. Never pick the newest timestamp/attachment as authority. Independent results can be accepted separately and in either order; later-arriving concurrent conflicts can place a previously displayed group and dependent work into review, preserving all versions. This retains U04's accepted eventual-consistency limitation. Final resolution covers only actually reviewed heads; unknown offline work is not silently discarded.

Task readiness requires every selected package/group to be implemented or explicitly deferred/rescoped by the user. The proposed initial notice is a PMON task comment giving package version, ROM revision, unresolved limitations and testing instructions. Task completion remains user-controlled after verification; unrelated work on a reused task is not inferred complete. Desktop push notifications remain U31–U33.

## 7. YouTrack Representation and Native Edits

Proposed carrier for U20B proof: one issue per logical region/map/sub-zone/entity/profile/shared definition, readable summary/description and searchable kind/lifecycle hints, plus versioned JSON artifacts and assets as attachments. Keep a pinned registry/bootstrap and publication discovery index separate from editable titles. Plans/reviews for an entity are versioned on or linked to its permanent record; they are not extra actionable PMON tasks.

The exact use of custom fields, links, per-record attachment manifests and registry/index issues is a U20B proof decision. This proposal creates none. Do not assume newly created custom fields, webhook/app installation, conditional update support or server-global administration.

YouTrack documents attachment IDs, nullable read-only authors, and paginated listing/upload resources. That supports the carrier proposal, not a proof of authorization isolation, immutable retention or complete concurrent discovery. Missing/null author, inaccessible history or rewritten bytes require review. [Official Issue Attachments reference](https://www.jetbrains.com/help/youtrack/devportal/resource-api-issues-issueID-attachments.html).

Native supported metadata edits must become validated domain events rather than being ignored. A human changing a mapped current-content label must be treated as an attributable documentation correction/history event, not proof that the ROM changed. Native structured implementation updates follow the same package/result checks as agent uploads. Arbitrary prose, task State changes, malformed files, issue deletion and unrecognized JSON are not accepted content revisions. Preserve the last verified view, show the discrepancy and offer review. Meaningful native edits must be visible even when they require review.

Creation/upload timeout recovery searches by the pinned operation ID and verified bytes within the correct registry/issues before retrying. A partially created issue/attachment stays recoverable; it is neither dispatched nor silently deleted. Native moves affecting physical organization need validated parent and membership changes together. An issue removed from a query is not enough to conclude a record was deleted.

## 8. Hash and Encoding Contract

New artifact digests use **`ROMDexCanonicalJSON/1` + SHA-256**, lowercase hex. This is our restricted, versioned encoding, not a claim to implement every option of another canonicalization standard:

- JSON only; UTF-8 without BOM, valid Unicode strings, no duplicate object keys or reserved prototype keys.
- Strings keep exact whitespace, line breaks and Unicode code points; no normalization or trimming.
- Object member names sort lexicographically by UTF-16 code units recursively; arrays retain order.
- Only safe integer numeric values, excluding negative zero; use strings for arbitrary precision or fractional domain values in later schemas.
- No whitespace between tokens. Encode strings/booleans/null with standard JSON string escaping and literals.
- Hash the complete artifact except its own top-level `digest` or `revisionId` field. Nested referenced/embedded digests remain included.
- `publication` and package digests cover declared artifact/reference membership; individual asset hashes cover exact binary bytes. The task binding also records exact formatted attachment-byte SHA-256, which can differ from the package's semantic digest.

The [hash vectors](examples/hash-vectors.json) and verifier provide examples. Production parsing must reject duplicate keys before object construction and enforce bounds; the model reads generated fixtures and does not provide a hardened untrusted-input parser.

**Legacy hashes are a different protocol.** Existing `baselineHash` is SHA-256 over UTF-8 `JSON.stringify(baseline)`. Existing `requestHash` uses `JSON.stringify({target,intent,instructions,proposedDialogue,sharedSceneHandling,updatedAt})` in exactly that property order, with JavaScript omission of undefined properties. Never canonicalize, re-key, trim or reorder those supplied structures before verifying them. Preserve historical raw bytes/values and existing request hashes even after new IDs are added alongside them.

## 9. Limits, History and Recovery

Carry forward existing stricter local/native constraints; the new content provider's final limits are U20B measurements. Initial design ceilings: 256 KiB publication descriptors, 8 MiB decoded map package/result metadata, 10,000 scoped changes per result, nesting depth 64, and 64 MiB total expanded payload per reconstruction operation. Asset bytes count toward the applicable transfer/decoded limit; do not hide base64 expansion or unlimited dependencies outside the budget. Larger legitimate maps require reviewed chunked asset delivery or a versioned limit change, never silent truncation.

Refuse unsupported content safely, keep original bytes and a visible reason. Bound traversal/counts/cycles/expansion before allocation. Fetch only pinned authenticated instances and approved issue/attachment IDs; do not follow arbitrary package URLs. No active image/document execution, shell instructions, filesystem traversal or automatic archive extraction.

Every accepted mutation retains before/after references and complete dependency/asset reachability. Undo appends a guarded compensating event; it does not rewrite history or claim to reverse the ROM. Externally implemented changes may require a separately approved ROM reversal and confirmation. Preserve current reversal requests/receipts, original history pointers and unresolved reversals through migration. Never auto-prune remote versions/assets because a device was inactive or a record archived.

## 10. Compatibility Evidence and Remaining Gates

The read-only U19 checkpoint has revision 73, four legacy town collections (including Global Dialogue), 870 scoped identities, 44 plans, 145 history entries and six request/baseline hash pairs. **870 identities is not a projected ticket count**: points/blocks remain inside entity records, aliases/shared profiles require mapping, and actual inventory/capacity is a U20B/U20E gate. This checkpoint is representative evidence only; migration must capture the latest real working/cloud state, not seed from it.

The standalone model checks the shipped structure/hash rules, hierarchy/dependencies, independent/dependent results, stale corrections, draft/feedback preservation, replay, scoped writes and legacy hash compatibility. It does not implement the provider, prove server grants/discovery, extract a real ROM, or reconstruct the entire legacy save from new records. The schema evaluator is deliberately limited to the keywords in this bundle; independent metaschema/validator conformance and hardened parsing remain implementation checks.

Before migration, prove exact legacy export/projection compatibility, assets/history/unknown fields, full prompt/test identities and latest-save preservation. Before agent updates, prove actual execution identity/grants and action restrictions. A single broad owner identity may require human review or a revised route; do not infer permissions from a claimed JSON role or silently give agents save credentials.

**Review boundary:** these record/mapping interfaces and examples were user-approved October 16, 2026, completing U20A's contract-review gate. **Next: U20B — Content Project Access and Isolated Storage Proof, Sol / High**, separately authorized by the user's subsequent PASSKEY. No migration or application change is authorized by U20A's acceptance.

Reproduce fixture/model checks with Node 22+:

```powershell
node outputs/U20A-Contracts/verify-contracts.mjs
```

For the additional read-only legacy compatibility checks, supply `--legacy=<protected checkpoint file>`. `--report` writes only this bundle's verification report. The checkpoint and credentials are never copied into these examples.
