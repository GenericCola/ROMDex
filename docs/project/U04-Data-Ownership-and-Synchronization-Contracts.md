# U04 — Data Ownership and Synchronization Contracts

**Prepared:** October 15, 2026. **Status:** design/model verified and explicitly user-approved October 15, 2026.  
**Authorization:** U04 PASSKEY. No live provisioning, upload, migration or application implementation.  
**Inputs:** [Approved U02 Desktop Design](U02-Desktop-Host-and-Distribution-Design.md), [Approved U03 YouTrack-First Direction](U03-Free-Cloud-and-YouTrack-Storage-Comparison.md), [Measured Inventory](U03-Data-and-Capacity-Inventory.json).  
**Evidence:** [43 Model Scenarios and 120 Delivery Permutations](U04-Contract-Proof-Results.json); runnable [design model](../work/u04-contract-proof.mjs).

## Recommendation for Review

### U14 Approved Provider Revision — Setup and Transport Proof Complete

The user approved **private GitHub for bulk saves and substantive ROMDex metadata**, while **all agent-required reports, mappings, context, images/files and receipts remain on YouTrack**. This replaces the save-container/attachment transport in Sections 2 and 4 below; those sections remain the historical YouTrack design. Native YouTrack task ownership and the NPCDex → Ticket → Agent → Ticket → NPCDex workflow remain unchanged. Later receipt intake still uses YouTrack's server-observed submitter, not a JSON claim or GitHub author field.

Use separate private **GenericCola/ROMDex-Data**, repository ID **1421625633**, owner account ID **32021766**. Source/releases remain in GenericCola/ROMDex. U14 provisions metadata and tests synthetic records only; no real save import or cloud-ready UI claim. U15 still requires preview, fresh exact-byte preservation and migration acceptance.

The proposed Git transport stores immutable SHA-256-addressed payloads/domain records under partitioned workspace paths. The domain record retains the heads actually observed when the edit was made, even if the later Git carrier commit has a newer parent. Git ancestry is delivery history, not permission to change an offline edit's semantic base. A published Git tree must contain the record's complete verified dependencies; unattached uploaded Git blobs alone are not publication.

Publication creates a tree from the observed branch, appending immutable paths, then a Git commit naming that observed branch head as parent. Move the branch using **force: false**. On a competing update, rediscover the new head, preserve the other writer's tree entries and retry with the same domain record/operation ID and original semantic parents. Never force-push, delete prior records or rewrite history. Verify the published bytes/tree before acknowledging delivery. After an uncertain response, discover the same immutable record and bytes before attempting another publication. [GitHub reference update contract](https://docs.github.com/en/rest/git/refs#update-a-reference).

Readers pin repository/workspace/bootstrap identities, validate every record/schema/hash/dependency, and enumerate complete trees with pagination/subtree handling rather than accepting truncated listings. Preserve the last verified frontier; a missing dependency, non-descendant branch rewrite, inaccessible record or identity change requires review rather than resetting local history. A mutable branch reference is a discovery entry point backed by immutable preserved history, not a last-writer-wins save file. U14 tests transport races; semantic merge/queue/crash integration remains U16–U17.

**Authorization boundary for the initial owner-only release:** validate actual authenticated GitHub account and exact private repository identity. Only the owner may write; inspect repository collaborators and stop if the grant set expands before multi-user authorization is designed and approved. Git commit author/email and JSON actor strings are not authenticated uploader evidence. Records must identify the sole approved owner; reader trust comes from the pinned owner-only repository access boundary. This deliberately replaces attachment-uploader attribution for bulk saves only. Agents receive no data-repository write/read grant. Additional human writers require a later authorization/provenance review; do not silently infer their identity from Git commit authors.

Start with stored chunks no larger than **512 KiB**, descriptors no larger than **256 KiB**, and the existing **64 MiB expanded-object** limit. Preserve exact original import bytes and legacy NPCDex request/baseline hash semantics. Batch outgoing edits and measure REST read/write use; do not upload a full compressed export per keystroke. Respect rate-limit/backoff responses and retain local work on failure. No Actions, LFS, paid storage or automatic destructive history cleanup is selected. [GitHub repository limits](https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits), [REST rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

U14 verified positive owner access, anonymous and authenticated-unapproved denial, exact blob round-trips, competing publication/retry without lost records, injected uncertain-outcome deduplication and preserved semantic bases. [Completion evidence](U14-Storage-Verification.json). Runtime save access is separately scoped to ROMDex-Data and protected locally; preserve both existing YouTrack and read-only update credentials. No production migration proceeds until this addendum's acceptance evidence is complete.

### Historical U04 YouTrack Transport

Keep YouTrack as the cloud store. Save immutable, content-verified change records and periodic checkpoints in restricted container issues. Never overwrite a single authoritative “latest save” or pick a winner by timestamp. Each computer retains a durable local copy and outgoing queue. Different edits may merge; competing edits preserve both branches and require human review.

This is **eventual synchronization**, not a global editing lock. A computer cannot discover edits that another computer has not uploaded. A receipt can apply automatically against its currently validated revision; a later conflicting branch places the **whole receipt** and affected workspace branch into review. Neither version is discarded and no external ticket completion follows from that provisional application. The user explicitly accepted this limitation in the design review on October 15, 2026.

The conservative first release stops cloud materialization for the affected namespace when branches conflict. The UI retains the current working branch with a clear review state rather than silently replacing it with a partial merge. Independent native task synchronization and the other namespace continue. Editing can continue as a preserved branch; automatic receipt application and publication of new approved handoffs for that conflicted namespace pause until resolution.

## 1. Ownership and Stable Identity

| Data | Authority and write rules |
| --- | --- |
| Native issues: title, description/instructions, comments, tags, assignee, due date, priority, Complexity, other supported project fields, parent links and issue attachments | YouTrack issue entities. ROMDex edits use existing typed adapters and durable operations; incoming native changes refresh ROMDex. No copy in the workspace store silently replaces these fields. |
| Effective task State | YouTrack State is the shared task field. ROMDex computes inherited parent status using the existing tested rules. A native leaf-State edit changes its assigned value; a parent-State edit can update retained assignment, after which child inheritance determines effective State. Recognized app writes must not be mistaken for a new manual assignment. |
| Retained parent assigned status | ROMDex metadata namespace, separate from inherited State. It becomes visible when that parent has no children. Do not drop retained records simply because the current visible issue set is smaller. |
| Manual order and saved selector images | ROMDex metadata namespace. Native ordering is mirrored only if supported cheaply and safely; otherwise ROMDex order remains authoritative for its own view. |
| NPCDex content, images, annotations, plans, requests, source evidence, history, receipts, undo/reversal records | NPCDex namespace, preserving existing identities and contracts. Linked tickets contain explicitly published versions, not competing copies with unspecified authority. |
| Published request-to-ticket links and receipts | Durable integration records with immutable request/receipt versions. Ticket grouping, publish triggers and completion policy remain U20 decisions; transport and agent grants remain U23 decisions. |
| Credentials and device state | Per-computer protected credentials, device ID, file handles/paths, locks, cache, transfer cursors and queues. Never uploaded as workspace content or included in installers. |
| View state | Preserve all existing preferences through migration. Keep focus, cursor, current selection, scroll, local Details navigation and window position per device. Existing legacy copies remain recoverable; cloud metadata synchronizes substantive order/images/assigned status. Do not make one computer's pane resize or filter change disrupt the other. |

Use a random stable `workspaceId`, namespace (`npcdex` or `romdex-metadata`), stable instance identity/approved base URL, immutable YouTrack project/issue IDs, YouTrack user ID, device UUID and durable per-device sequence. Display names and PMON labels are not primary keys. Keep all NPCDex town/character/element/point/block/review IDs and original source references unchanged. Never merge identities because display names match.

An export's numeric `revision` remains a compatibility field, not a cross-device ordering clock. Cloud revision identity is the sorted set of validated commit heads plus schema version. Local sequence helps diagnose gaps; it does not give another device priority. Deletion and replacement of the remote instance/project must require explicit recovery/rebinding, never automatic attachment to similarly named data.

## 2. Remote Layout and Record Contract

Provision a small fixed set of restricted system containers for workspace configuration, NPCDex records, ROMDex metadata and, if selected later, a separately restricted receipt inbox. Record immutable container IDs in the owner-approved local bootstrap and immutable initial manifest. An optional release container is a separate U13B concern. No issue per save/NPC/history event. Exclude every system container from All Tasks, selectors, rollups and ordinary move/delete operations.

The attachment API supports metadata listing and multipart uploads. It does not document an atomic conditional replacement operation. Accordingly, attachment names and any mutable “latest” hint are discovery aids, never authority. [Official attachment API](https://www.jetbrains.com/help/youtrack/devportal/resource-api-issues-issueID-attachments.html).

| Record | Required content |
| --- | --- |
| Immutable bootstrap | Workspace/instance identity, supported schemas, exact container IDs, owner ID, namespace roots and limits. Membership changes are owner-reviewed records, constrained by real YouTrack access. |
| Blob/chunk | SHA-256 of exact stored bytes, byte length, codec, expanded-byte limit and expanded hash where applicable. Chunk descriptors include ordered indexes and whole-object hash. A duplicate physical upload with matching verified bytes is harmless. |
| Commit | Schema/version, workspace/namespace, actor ID, device/sequence/operation ID, parent commit IDs, payload hashes, asset references, read and write footprints, immutable history entries and declared operation kind. Timestamp is audit data only. Commit ID is SHA-256 of a precisely specified transport encoding, excluding its own ID. |
| Checkpoint | Exact covered ancestor closure/heads, schema, reconstructed-state hash, content references and history membership. It accelerates reconstruction and is not a new winner over unknown branches. |
| Resolution | Explicit reviewed head set and branch digests, user's chosen complete state/patches, preserved alternatives, review identity and reason. Covers only the branches actually reviewed. |
| Receipt inbox envelope | Workspace, published request/version references, original receipt bytes/hash, server-observed submitter identity, receipt business ID and processing state. Agent-provided identity strings alone are not authentication. |

Content hashes provide integrity and identity, not a substitute for access control. Validate the actual server attachment uploader against the declared actor and approved membership. Every reader revalidates schema, workspace, ancestry and hashes. Reject altered/misnamed/cross-workspace records. Do not parse arbitrary native task files as system commits merely because their names resemble one.

Specify transport encoding in implementation with explicit property ordering/types, UTF-8 and test vectors. **Never apply that encoding to existing NPCDex request/baseline hashes.** Preserve those exact original JSON semantics separately.

## 3. Local Durability and Publication

The application-owned background service is the only local queue/state writer. Renderers request validated domain operations. Use a transaction-capable local store plus staged blobs, atomic replacement/commit and crash-recovery verification; do not claim a generic JSON write is durable. Installer and app directories contain no authoritative user data. U09/U10/U11 implement this contract and U12 migrates into the stable desktop profile.

1. Persist the local mutation, history, complete blob references and pending operation in one recoverable local transaction. Acknowledge editing only after this succeeds. Disk-full/write-denied errors must remain visible; never show a saved indication after failed local persistence.
2. Assign operation identity once. Do not generate a new identity on restart, timeout or retry. Persist locally staged bytes before referencing them in a pending commit.
3. Discover incoming records and validate the known remote frontier. Local edits made offline retain their original parent heads; do not relabel them as based on newly discovered work.
4. Upload referenced assets and payload chunks first. Verify returned identity/metadata and exact bytes when acknowledging a new object. Persist confirmed physical attachment IDs as locators, never as logical commit identity.
5. Upload the small immutable commit manifest **last**. Remote publication means a verified manifest with a complete, verified dependency closure, not merely a successful upload of some bytes.
6. If the response is lost, discover by logical identity and verify bytes before retrying. Duplicate physical manifests collapse to one logical commit. If outcome cannot be established, retain an `uncertain` operation and continue safe discovery; do not mark it delivered or invent a replacement operation.
7. Persist incoming validated records and inventory before advancing the durable cursor. Retry after a crash from the last durable cursor; already-seen IDs are no-ops.

Queue states are `local`, `ready`, `uploading`, `uncertain`, `published`, `review` and `blocked`, with attempts/backoff and actionable causes. Publication and successful merge are distinct: a conflicting edit may be safely backed up remotely while still requiring review. Save must not announce “all reconciled” just because bytes reached YouTrack.

Local crash checkpoints include pending native operations, staged ticket files, metadata commits, inbox receipts, resolution drafts and payload references. Clean shutdown is convenient, not required for recovery. Quit cannot depend on successful remote contact.

## 4. Discovery Without a False “Latest” Pointer

Use each known container's **attachment activity cursor** for incremental discovery. YouTrack specifically documents cursors for changing activity collections instead of ordinary offset pagination. Request the attachment category, page forward, deduplicate event/attachment IDs and retain a cursor only after processing succeeds. [Activity cursor operations](https://www.jetbrains.com/help/youtrack/devportal/operations-api-issues-issueID-activitiesPage.html).

Maintain a monotonic inventory of verified immutable IDs. Bootstrap/recovery also enumerates attachment metadata with explicit page sizes and follows referenced ancestry/assets. Repeat reconciliation scans to catch metadata differences and repair cursor failures. Offset pages alone, equal timestamps, two identical scans, or an empty last page are **not proof of a simultaneous global snapshot**. No listing absence is interpreted as deletion.

U14 must prove with disposable containers that accepted manifest uploads produce discoverable attachment activities, cursors resume correctly after lost responses and concurrent appends, and historical references are retrievable. U16/U17 test this with actual pagination and interruption. If a cursor expires or becomes invalid, rebuild discovery from the container history plus metadata and retained known IDs. If a dependency is missing, inaccessible, removed or corrupt, hold its descendants; retain the last verified branch/cache and explain the failure.

“Up to date” means the local outgoing work has verified remote coverage, the current incoming pass is complete for its **observed** cursors, and no known conflict or missing dependency remains. It is not proof that another offline computer has no work. Detection of server-side deletion/visibility changes creates an error/recovery case, never a silent data deletion.

## 5. Concurrent Edits and Merge Boundaries

Each commit names the heads its author actually observed. Ancestry establishes causality. For concurrent commits:

- Auto-merge only explicitly independent changes whose read/write footprints do not overlap and whose exact before-values and full domain validation still hold.
- A write conflicts with another write **or validation read** of the same field, an ancestor path, structural collection, or protected identity. Different devices making the same assignment initially still require review; optimization is unnecessary at this scale.
- Text is not spliced automatically. Reordering siblings is one ordered-list operation, conflicting with concurrent changes to that list. Moves include parent links, affected sibling lists, subtree constraints and cycle checks as one logical operation.
- Structural array edits lock the affected collection. Stable IDs resolve entities; legacy numeric receipt pointers remain bound to their exact baseline/layout. Do not rebase numeric paths onto different array positions.
- Immutable history entries merge by history ID. The transport does not model every history append as an overwrite of the whole history array. Deterministic export ordering preserves original entries and causal ordering; concurrent ties use stable IDs, not wall-clock authority. It must not reorder nested values used by an existing hash contract.

The first release holds the **whole affected namespace's merged projection** on any conflict or failed invariant. It retains branch contents and lets the user compare them. A current working branch can remain displayed and editable with a review warning; the service must not present it as the unique shared truth or silently apply the non-conflicting half of a conflicted receipt. This conservative policy trades some merge convenience for understandable recovery at one/two-user scale.

An explicit human resolution references every reviewed head, preserves original branches/history, validates the selected result, then appends a resolution commit. It does not erase the conflict records. An older offline edit arriving afterward can conflict again; timestamps and device retirement do not make it safe to discard that edit. Namespace-wide resolution footprints deliberately favor review over clever rebasing.

No total order or global atomic compare-and-swap is claimed. The proof model demonstrates convergence under its stated immutable-record/discovery assumptions. It does not prove server transaction isolation or actual disk durability.

## 6. NPCDex Compatibility and Receipts

Retain `NPCDexAgentExport/2`, `NPCDexImplementationReceipt/1` and `NPCDexROMReversalReceipt/1`. The authoritative current package is Downloads `npcdex-v2.42`, saved revision 72; refresh it again at migration. The [existing workflow](C:/Users/mrgen/Downloads/npcdex-v2.42/NPCDex-Agent-Workflow.md) and implementation are the compatibility baseline.

- `baselineHash`: SHA-256 of UTF-8 `JSON.stringify(baseline)`.
- `requestHash`: SHA-256 of UTF-8 `JSON.stringify({target,intent,instructions,proposedDialogue,sharedSceneHandling,updatedAt})`, in that property order, with JavaScript's omission of undefined properties.
- Preserve original identity/source evidence, mapping references, annotations, archived records, images and undo/reversal relationships. Do not treat display names or source-document instructions as authorization.
- Cloud envelopes may reference exact original JSON blobs; hydrate original image strings/property order for portable export and hash evaluation. Initial import retains the **complete exact original export bytes** as an immutable recovery object before any optimized representation is used. No aggressive asset/history extraction during initial migration.

Receipt processing requires authenticated allowed submitter, matching workspace and actually published/approved request version, schema and size limits, unique business ID, exact request/baseline hashes, valid authorized pointers, current exact before-values, unchanged relevant feedback, retained stable records and shared-participant rules. Validate a full trial copy before committing **all** content, feedback, plan transitions, history, duplicate marker and tester reset in one local transaction. Recheck guards inside that transaction. A replay of identical bytes is a no-op; different bytes using the same receipt ID require review.

Include every relevant validation read in the receipt commit's footprint: instructions, current target/baseline and array layout, affected feedback, plan workflow, stable identities, relevant participants, testing fields and the receipt ID record. Under-declaring reads would make a disjoint-looking concurrent edit unsafe; implementation must derive footprints from domain validators, not trust agent-supplied declarations.

Automatic application is valid at its recorded observed frontier. If conflicting concurrent work arrives later, preserve the receipt as an indivisible branch operation and mark the entire receipt for review; do not silently clear only part of its feedback or keep only half its patches. Retain the current working branch visibly as disputed, pause new automatic reconciliation/handoffs for that namespace, and require a complete resolution. Dependent edits are retained too. Receipt application neither writes the ROM nor independently verifies reported ROM hashes, marks tests passed, or closes tickets.

Invalid, stale, unauthorized and conflicting receipts retain original bytes, provenance and reasons in a quarantined review queue. They are data to inspect, not executable instructions. No HTML/script execution or arbitrary filesystem paths. Approved reconciliation resets affected tests to Unreviewed; undo appends a compensating event and applicable ROM reversal request. External reversal confirmation does not apply inverse NPCDex changes twice.

## 7. Native Task Synchronization

Continue two-way native task pulls/pushes independently of workspace-file synchronization. Use exact-field baselines, typed values, durable operation IDs and post-write checks. Pull native changes before normal outgoing reconciliation; retain pending drafts and expose competing known native edits. Do not write an entire stale issue when changing one field. Deleting an existing user item still deletes it in YouTrack under the established UI; deleting a system container is never an ordinary Work Pane operation.

The generic native API also has no conditional-write guarantee established by U04. A read/check/write is not a lock against someone editing in the native UI between calls. Preserve operation baselines and observed activity, detect post-write differences, and route known competition to review; do not claim this prevents every intervening native overwrite. U17/U22 must test the race with actual issue activity and verify recoverability. If a stricter guarantee is required, it needs a proven server-side conditional route and separate approval, not a fabricated client lock.

Native issue creation, comments and file uploads have operation-specific uncertainty recovery. Do not blindly repeat a timed-out creation or append. No atomic transaction is assumed across a task update, cloud commit, ticket publication and receipt application; each has explicit durable completion/recovery state. A native task change can remain healthy while cloud metadata is blocked, and vice versa.

## 8. Assets, Parsing and Capacity Limits

Proposed application limits below are **design limits**, not claims about the configured YouTrack instance. U14 verifies its actual limits and chooses the lower compatible chunk size. The current 13,221,699-byte export compresses to 3,843,217 bytes; the full export and 2,450,359-byte largest history entry must fit without truncation. [Measured inventory](U03-Data-and-Capacity-Inventory.json).

| Object | Initial design limit and behavior |
| --- | --- |
| Stored chunk | At most 4 MiB, additionally below actual server upload limit with margin. Stream and verify every chunk. |
| Commit/checkpoint descriptor | At most 256 KiB UTF-8 JSON. Large mutation/history bodies are separately referenced verified blobs, never truncated to fit. |
| Expanded payload/checkpoint | At most 64 MiB total per object, enforced while streaming before large allocation. Larger legitimate work requires an explicit versioned limit increase. |
| Receipt | At most 8 MiB decoded JSON and 10,000 patches total; maximum JSON nesting 64. Reject over-limit input to review without applying a prefix. |
| Assets | Exact-byte content hashes, ordered chunks and whole-object verification; validate type/signature and aggregate limits before preview. No active HTML/SVG execution. Native issue attachment limits remain separate. |
| Parsing/expansion | Bounded streaming, no path traversal/prototype keys, no arbitrary archive extraction, supported codec/schema only, exact counts/lengths, cancellation and memory limits. Do not reject a legitimate highly compressible file solely by ratio when it stays within the bounded expanded limit. |

Save existing embedded data URLs exactly, including historical references. Deduplicate their underlying bytes only with a reversible manifest retaining original representation and every reference; do not conflate image identity with equal bytes. Private file locators are fetched through the service; don't persist signed download URLs or expose tokens to renderers/agents. Installer verification/size limits are separate U13B rules, not these workspace limits.

Batch small edits for bounded outgoing payloads, while local durability remains immediate. Pull metadata/cursors rather than downloading full saves every 15 seconds. Proposed checkpoints: after a quiet validated session or a bounded number of commits/bytes, not after every keystroke. Measure actual growth and free space in U14/U16 before final thresholds; the U03 capacity examples are not a quota promise.

## 9. Retention, Compaction and Recovery

Initial release: **no automatic deletion of remote commits, checkpoints, history, referenced assets or orphan uploads**. Checkpoints compact local reconstruction cost, not authoritative history. A stale/offline device can refer to old ancestry indefinitely; inactivity is not permission to delete it. Storage pressure blocks further safe publication and requests review rather than silently pruning or enabling billing.

Future destructive retention requires a separate owner-approved plan, complete reference reachability across all branches/receipts/undo records, verified backups, device retirement/rejoin rules, closed publication epochs and a proven coordination mechanism. It is not part of U04 or an implementation shortcut. Local disposable-cache eviction is allowed only for remotely verified objects with no local/outgoing/draft dependency and a tested refetch path; retaining a full owner backup remains preferable at this scale.

Maintain dated complete portable exports and local recovery copies independent of YouTrack. A provider backup is helpful but not a substitute for app-level restoration. Recovery is previewed: identify workspace/schema/heads, compare current local/remote branches, preserve both, then append a deliberate import/resolution. Never overwrite a newer live dataset from a packaged baseline.

## 10. Membership and Agent Isolation

Owner-only human cloud access remains initial scope. Use the owner's own protected YouTrack credential per computer, never a shared embedded token. Verify project/issue/attachment restrictions positively and negatively with a separate unapproved identity in U14. Visibility restrictions do not hide data from trusted administrators with override permission; the owner must accept that hosting boundary before migration. [Official visibility rules](https://www.jetbrains.com/help/youtrack/cloud/set-visibility-of-issue-or-comment.html).

Additional humans need explicit membership/access approval and conflict acceptance; a claimed member list in a client blob never grants permission. Revoking access stops future transfers, not knowledge of files already downloaded. Retain historical author provenance; do not discard old legitimate commits just because their author's access later changes. New post-revocation publication requires fresh server authorization; ambiguous restored/imported history is reviewed rather than rewritten.

Agents get approved ticket/request versions and a restricted delivery/inbox route. Do not grant the full NPCDex store or owner token merely for convenience. A separate inbox must be unable to mutate the authoritative save containers. Validate actual server submitter metadata; agent-authored JSON cannot declare itself approved. U23 selects transport and tests least privilege; if permissions cannot provide the proposed isolation, ask for a revised design before enabling delivery.

## 11. Shared Controls and Failure States

Save Changes requests one bounded pass for both tools and their applicable capabilities; Auto-Sync Off remains Off. Pull/discover, reconcile and push eligible work, then persist outcomes. A manual Save does not force an overwrite: conflicts open review. Disabled automatic sync pauses automatic transfers, including incoming polling; manual Save performs both directions once. Local editing/durability continues while Off.

Preserve the approved indicator rules: ordinary successfully flowing work must not flicker red. The Save indicator is green when current work is verified up to date; red means known uncommitted/review work that cannot be passed safely, including disabled sync with pending edits. The separate connection light pulses blue during active healthy automatic synchronization, flashes red on interruption, and stays dark blue while Off. Known conflicts remain actionable even when both branches are uploaded. U05 reviews layout; U19 implements the detailed combined state mapping without collapsing separate capability errors into one misleading success.

## 12. Is a Server App Required?

**Not for the proposed append-only, eventually consistent first release.** Safe behavior comes from retaining all immutable branches, conservative conflict review and idempotent publication. This fits the approved YouTrack-first direction without assuming administrator permission or modifying global settings.

Strict global atomic acceptance of a receipt or single shared winner would need stronger coordination. A YouTrack app can expose authenticated HTTP endpoints, but its documented handler transaction reference is not proof of serializable compare-and-swap under concurrent calls. Its listed permission array accepts any listed permission, so explicit workspace/actor checks would still be required. [HTTP handler reference](https://www.jetbrains.com/help/youtrack/devportal/apps-reference-http-handlers.html).

App extension properties must not be the only authoritative store: deleting the app or removing/renaming properties on reimport can delete values. A proposed coordinator would need proven isolation, durable immutable backing and uninstall/recovery tests. [Extension property lifecycle](https://www.jetbrains.com/help/youtrack/devportal/apps-extension-properties.html).

If the user requires global finality instead of the stated late-conflict review behavior, or U14 cannot establish reliable discovery/access, pause that storage path. Reassess a proven coordinator or the U03 free reserve provider with the user. Do not secretly add an app, new service, owner privilege, payment method or billing.

## 13. Proof Evidence and Remaining Gates

The standalone Node design model passed **43 named checks**, including **120 permutations** of independent/causal commits, two offline writers, competing and identical writes, clock skew, late receipt conflicts, full-receipt conflict preservation, explicit resolution and later unknown branches, missing ancestry, tampering, uploader/workspace isolation, uncertain upload/deduplication, cursor persistence ordering, non-destructive checkpointing and bounded decompression. It also reverified all **six current request/baseline hash pairs**, exact export compression round-trip, and all **69 released files in both source and installed locations**.

This is an executable small model and compatibility check, **not a production engine or proof that live YouTrack supplies its assumed append/discovery behavior**. It does not simulate every parser limit, crash/fsync point, adapter race or permission configuration. No application tests were rerun unnecessarily, no browser session was used, and no production writes/token access occurred.

| Later task | Required acceptance before its feature is enabled |
| --- | --- |
| U09–U12 | Single durable engine, crash-safe local transaction/blob queue, preserved drafts/file bytes, latest-data migration and protected credential reuse. |
| U14 | Actual permission/privacy/capacity/chunk limits; controlled concurrent upload, cursor discovery and loss-of-response tests; owner acceptance of administrator visibility. If this fails, no migration. |
| U15 | Fresh current-data diff preview, complete exact-byte backup, schema/ID/history/image/hash round-trip and explicit migration acceptance. Revision 72 is an inventory, not a future migration source of truth. |
| U16–U17 | Implement protocol; real pagination/restart/uncertain upload/branch convergence; validators derive complete footprints; no partial receipts or destructive retention. |
| U18–U19 | Assigned/effective separation, substantive metadata, independent capability handling and faithful Save/connection signals. |
| U20–U23 | Approve publishing/grouping/mapping/completion behavior; verify native concurrency recovery and least-privilege agent/inbox route. |
| U24–U27 | Authenticated durable inbox, all existing receipt validation, atomic local apply, late-branch review, duplicate/undo/reversal behavior and no implied ROM/test approval. |
| U28–U30 | Integrated failure matrix and guided actual-workspace acceptance; verified recovery/export and release handoff. |

## Approved Decision — October 15, 2026

The user selected **“Approve Versioned Saves and Conflict Review (Recommended)”**, approving the immutable-record design with conservative branch review, including **automatic receipt application at the known revision and whole-receipt review if a conflicting offline edit arrives later**. This accepts eventual consistency; it does not authorize provisioning, migration, agent access or later implementation. If strict global finality is required, revise the coordination design before proceeding.

U04 is complete. Await a separate new PASSKEY for **U05 — Shared Header and Control Layout Review**, recommended **Sol / High**.
