# Isolated NPCDex Content Reader — U20C

This directory implements a YouTrack content reader, verified SQLite cache and NPCDex projection. U20D adds an optional isolated owner editor; see [Editing and Recovery](EDITING.md). It is not imported by the installed application. ROMDex 0.5.7 and the existing GitHub-backed NPCDex remain authoritative. Construction requires an explicit isolated `fixture:` workspace and a pinned bootstrap publication; production Data paths are refused.

## Carrier and Identity

The domain schema is the accepted U20A contract, copied unchanged into `contracts.schema.json`. `contracts.mjs` implements the keywords used by this pinned schema; it is not a general JSON Schema engine. Strict parsing rejects duplicate/reserved keys, invalid Unicode, unsafe or fractional numbers, excess depth and oversized input. SHA-256 checks cover exact downloaded bytes and canonical domain identities separately.

Each registry attachment named `npcdex-publication.json` contains a sealed `NPCDexCarrier/1`: workspace/operation identity; a chunked publication; artifact digest/object descriptors; asset descriptors; stable record-to-issue bindings; and native issue metadata pins. Each descriptor contains `sha256`, `bytes` and `chunks` with stable issue/attachment IDs, lengths and hashes. Native pins contain `issueId`, `summary`, `parentIssueId`, `descriptionSha256` and `commentsSha256`. The comments hash covers a sorted array of server comment IDs, text, updated values and author IDs. Native prose/comments are discrepancy evidence, not executable content events.

Registry filenames are only a discovery namespace. Timestamps, filenames, issue titles and claimed actor names never choose a winning version. The binding pins the instance, NPCD project, registry, owner, workspace and initial publication. The reader checks server-observed attachment authors, project membership, complete artifact sets, semantic baselines, dependency graphs and hashes. Competing branches retain both versions and display their verified common ancestor for review. Missing previously published history remains a warning across refresh/restart. Unpublished owner files remain pending; files without an approved author require review.

The transport uses GET only. Signed attachment URLs are resolved from stable attachment IDs, checked for the pinned origin and `/api/files/` path, and used only inside the transport stack. They are never placed in the cache, UI or packages. Redirects are refused. See the [official attachment operations](https://www.jetbrains.com/help/youtrack/devportal/operations-api-issues-issueID-attachments.html) and [download procedure](https://www.jetbrains.com/help/youtrack/devportal/api-usecase-download-issue-attachment.html).

## Cache and Projection

SQLite WAL with FULL synchronization retains verified objects, publication/domain alternatives, observed history, review conditions and the last accepted projection. Projection publication is transactional; missing or corrupt data, interrupted reads, quota failures and failed commits retain the accepted view. Corrupt cache files are not silently deleted. Original source artifacts remain available separately from the derived view.

`projection.mjs` builds the NPCDex v2 shape from domain records: maps/subzones, shared character profiles, local appearances and overrides, explicit player-gender profiles, ordered dialogue, images, staged proposals, planned additions and archived records. Current content and proposals remain separate. Testing against an older content revision displays Unreviewed without discarding the original review artifact. The projection version allows a derived-view upgrade without pretending the source revision changed.

The base reader accepts owner-authored bootstrap, planning, documentation-correction and explicitly reviewed resolution publications. U20D supplies optional isolated planning/correction writes and guarded lifecycle actions as described in EDITING.md. Agent implementation-result acceptance, parent moves and remapping remain later gates. Complete real-save alias/history reconstruction and provider cutover require U20E migration evidence.

## Isolated Preview

`preview-server.mjs` serves the existing NPCDex interface with the coded baseline removed and the reader projection injected. `preview.js` disables legacy mutation/storage handlers while retaining navigation, player-gender selection and proposed-change visibility. The optional U20D editor supplies explicit validated editing controls. Incoming refresh preserves the current selection. The loopback API exposes only the current verified view, a one-time incoming read and the local Auto-Sync preference. It checks host/origin/fetch-site, uses a restrictive CSP and provides no arbitrary file access, remote proxy or credential entry. Read-only previews have no edit API; the optional editor exposes only the bounded commands documented in EDITING.md.

Auto-Sync Off makes no automatic remote calls. Save Changes performs one incoming cycle while leaving Off in place. An intentional stop cancels the current read and retains the cache without fabricating an outage. A service connection failure is reported as unavailable; content discrepancies remain separate review conditions.

## Current Bounds and Gates

Bounds: 512 KiB attachment chunks; 512 KiB carrier manifest; 16 MiB assembled object; 32 chunks per object; 64 MiB response/transfer and unique-object-plus-reference materialization budgets per cycle; 256 MiB cached payload; 1,000 registry publications; 10,000 requests and 120 seconds per cycle. Listings are paginated with bounded complete sweeps; unstable/truncated enumeration cannot report success. Domain collections and histories also have explicit limits. Cache payload limits do not bound SQLite filesystem overhead. These are conservative implementation limits, not measured YouTrack quotas or a production retention policy.

U20C proves synthetic data only. U20D editing and recovery remain isolated; U20E must prove scale/retention before previewing and migrating the latest real data; U20F handles installed acceptance/release. Actual agent identity/access and result authorization remain U23–U25. Upload ceiling and remaining instance capacity are unknown. No ROM or in-game correctness is established by reader validation.


## U20E Preparation (Not Activated)

`migration.mjs` extracts an isolated preview with exact original bytes as a verified object, scoped identity indexes, source documentation, image inventory and distinct current/proposed/testing data. `legacy-projection.mjs` reconstructs the original frontend values and overlays validated current revisions while retaining unknown fields, history and old hash/pointer semantics. Global dialogue uses shared records and scoped point/block validation. No installed provider imports these modules yet. Migration acceptance and an actual verified handoff remain required.

Domain/history and journal previews use content-addressed cache references. All pending/uncertain work is retained; older terminal journal entries are archived rather than imposing a 200-edit lifetime ceiling. There is no automatic remote deletion. Routine reads may reuse verified bytes only against fresh inventory/author/length/update metadata. Registry manifests remain fresh byte reads. Manual Save, a cache without a valid audit and 15-minute periodic audits recheck bytes; cold/repeated full-data benchmarks use an in-memory transport and do not establish WAN throughput. Readers bound parallel network requests to four and wait for failed parallel groups to settle before ending a cycle.

The complete revision-73 preview preserves 870 identities, 44 plans and 85 annotations; its 266 KiB carrier fits within the already demonstrated 512 KiB chunk bound. The original U20A schema is unchanged. See the project migration preview for source privacy, exact preservation evidence and limits.
