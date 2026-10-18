# NPCDex Content Backend — U20C–U20E

This directory implements a YouTrack content reader, verified SQLite cache and NPCDex projection. U20D adds versioned owner editing; U20E adds the explicitly accepted real-data import and native provider handoff. See [Editing and Recovery](EDITING.md). Fixture workspaces remain isolated. The accepted content workspace is available only with its recorded human acceptance, source pins and dedicated cache binding. The desktop service selects it only when the active provider file and verified cache agree; otherwise an invalid handoff fails closed. Until a verified handoff, the established GitHub-backed source remains authoritative.

## Carrier and Identity

The domain schema is the accepted U20A contract, copied unchanged into `contracts.schema.json`. `contracts.mjs` implements the keywords used by this pinned schema; it is not a general JSON Schema engine. Strict parsing rejects duplicate/reserved keys, invalid Unicode, unsafe or fractional numbers, excess depth and oversized input. SHA-256 checks cover exact downloaded bytes and canonical domain identities separately.

Each registry attachment named `npcdex-publication.json` contains a sealed `NPCDexCarrier/1`: workspace/operation identity; a chunked publication; artifact digest/object descriptors; asset descriptors; stable record-to-issue bindings; and native issue metadata pins. Each descriptor contains `sha256`, `bytes` and `chunks` with stable issue/attachment IDs, lengths and hashes. Native pins contain `issueId`, `summary`, `parentIssueId`, `descriptionSha256` and `commentsSha256`. The comments hash covers a sorted array of server comment IDs, text, updated values and author IDs. Native prose/comments are discrepancy evidence, not executable content events.

Registry filenames are only a discovery namespace. Timestamps, filenames, issue titles and claimed actor names never choose a winning version. The binding pins the instance, NPCD project, registry, owner, workspace and initial publication. The reader checks server-observed attachment authors, project membership, complete artifact sets, semantic baselines, dependency graphs and hashes. Competing branches retain both versions and display their verified common ancestor for review. Missing previously published history remains a warning across refresh/restart. Unpublished owner files remain pending; files without an approved author require review.

The transport uses GET only. Signed attachment URLs are resolved from stable attachment IDs, checked for the pinned origin and `/api/files/` path, and used only inside the transport stack. They are never placed in the cache, UI or packages. Redirects are refused. See the [official attachment operations](https://www.jetbrains.com/help/youtrack/devportal/operations-api-issues-issueID-attachments.html) and [download procedure](https://www.jetbrains.com/help/youtrack/devportal/api-usecase-download-issue-attachment.html).

## Cache and Projection

SQLite WAL with FULL synchronization retains verified objects, publication/domain alternatives, observed history, review conditions and the last accepted projection. Projection publication is transactional; missing or corrupt data, interrupted reads, quota failures and failed commits retain the accepted view. Corrupt cache files are not silently deleted. Original source artifacts remain available separately from the derived view.

`projection.mjs` builds the NPCDex v2 shape from domain records: maps/subzones, shared character profiles, local appearances and overrides, explicit player-gender profiles, ordered dialogue, images, staged proposals, planned additions and archived records. Current content and proposals remain separate. Testing against an older content revision displays Unreviewed without discarding the original review artifact. The projection version allows a derived-view upgrade without pretending the source revision changed.

The reader accepts owner-authored bootstrap, planning, documentation-correction and explicitly reviewed resolution publications. Editing uses the bounded commands in EDITING.md. U20E preserves the exact original export, images, histories, legacy identities and alias mappings, and reconstructs the familiar view from verified records. Original migration evidence is read-only through ordinary content commands. Agent implementation-result acceptance, parent moves and remapping remain later gates. U20F performs full installed-app acceptance and private release.

## Isolated Preview

`preview-server.mjs` serves the existing NPCDex interface with the coded baseline removed and the reader projection injected. `preview.js` disables legacy mutation/storage handlers while retaining navigation, player-gender selection and proposed-change visibility. The optional U20D editor supplies explicit validated editing controls. Incoming refresh preserves the current selection. The loopback API exposes only the current verified view, a one-time incoming read and the local Auto-Sync preference. It checks host/origin/fetch-site, uses a restrictive CSP and provides no arbitrary file access, remote proxy or credential entry. Read-only previews have no edit API; the optional editor exposes only the bounded commands documented in EDITING.md.

Auto-Sync Off makes no automatic remote calls. Save Changes performs one incoming cycle while leaving Off in place. An intentional stop cancels the current read and retains the cache without fabricating an outage. A service connection failure is reported as unavailable; content discrepancies remain separate review conditions.

## Current Bounds and Gates

Bounds: 512 KiB attachment chunks; 512 KiB carrier manifest; 16 MiB assembled object; 32 chunks per object; 64 MiB response/transfer and unique-object-plus-reference materialization budgets per cycle; 256 MiB cached payload; 1,000 registry publications; 10,000 requests and a default 120 seconds per cycle. The explicitly bounded initial migration audit may use up to ten minutes; that does not change the installed routine default. Listings are paginated with bounded complete sweeps; unstable/truncated enumeration cannot report success. Domain collections and histories also have explicit limits. Cache payload limits do not bound SQLite filesystem overhead. These are conservative implementation limits, not measured YouTrack quotas or a production retention policy.

U20C proves synthetic data only. U20D editing and recovery remain isolated; U20E must prove scale/retention before previewing and migrating the latest real data; U20F handles installed acceptance/release. Actual agent identity/access and result authorization remain U23–U25. Upload ceiling and remaining instance capacity are unknown. No ROM or in-game correctness is established by reader validation.


## U20E Preparation (Not Activated)

`migration.mjs` extracts an isolated preview with exact original bytes as a verified object, scoped identity indexes, source documentation, image inventory and distinct current/proposed/testing data. `legacy-projection.mjs` reconstructs the original frontend values and overlays validated current revisions while retaining unknown fields, history and old hash/pointer semantics. Global dialogue uses shared records and scoped point/block validation. No installed provider imports these modules yet. Migration acceptance and an actual verified handoff remain required.

Domain/history and journal previews use content-addressed cache references. All pending/uncertain work is retained; older terminal journal entries are archived rather than imposing a 200-edit lifetime ceiling. There is no automatic remote deletion. Routine reads may reuse verified bytes only against fresh inventory/author/length/update metadata. Registry manifests remain fresh byte reads. Manual Save, a cache without a valid audit and 15-minute periodic audits recheck bytes; cold/repeated full-data benchmarks use an in-memory transport and do not establish WAN throughput. Readers bound parallel network requests to four and wait for failed parallel groups to settle before ending a cycle.

The complete revision-73 preview preserves 870 identities, 44 plans and 85 annotations; its 266 KiB carrier fits within the already demonstrated 512 KiB chunk bound. The original U20A schema is unchanged. See the project migration preview for source privacy, exact preservation evidence and limits.


## Native Handoff

The desktop provider uses the same verified cache, reader and typed editor; it never routes whole legacy save files into content edits. The native page strips the embedded baseline and exposes versioned editing controls, preserving current content separately from proposals. The internal original-export/index record is excluded from content pickers and protected from editing. Shared Auto-Sync and Save Changes control the native provider. Full native-control adoption, discrepancy/offline acceptance, backup restoration acceptance and release remain U20F.

The migration publisher records every issue, link and upload intent, resumes from confirmed identities/bytes, and publishes the carrier last. The old GitHub NPCDex namespace receives an append-only retirement record only after successful live readback; its history remains a recovery copy, while ROMDex metadata retains its separate live namespace. Source changes or uncertain delivery hold authority activation. Full local/Runtime backup and encrypted credentials are retained outside the installer and development repository.

Full-size reader request sharing (U20E): each cycle reads a fresh, issue-ID-ordered native inventory for bound records. Embedded comments are used only when their length matches the server-reported count; otherwise complete comment pagination is required. Every referenced issue retains project, reporter and private-visibility validation. Complete attachment inventories supply ephemeral download metadata, which is cleared at the next cycle and never persisted or exposed. Manual/cold/periodic audits still download and hash file bytes; routine reuse still requires fresh matching file metadata.

## U20I Native Tree and Reviewed Map Imports

The native projection adds a separate versioned presentation collection. A reviewed catalog transition translates metadata once without revising current content, plans or reviews. Normal rendering then reads records/assets/view artifacts rather than the original export or migration index. New maps and entities use the previewed NPCDexMapImport/1 route in Tray 2 Content Tools. See [Map Import Guide](../U20I-Map-Import-Guide.md). Original artifacts remain recovery/history, and pre-transition ancestors remain readable. Runtime view/catalog contracts extend the schema additively; original U20A design files remain preserved. Install the compatible verified build before publishing a production catalog transition.

Catalog artifacts and working snapshots use immutable cache references. Large history metadata is stored once instead of copied into every upload intent or later map import. Bounded publications checkpoint before exhausting the write budget and resume verified progress on a later cycle. Auto-Sync Off retains local queued imports; Save Changes performs one bounded manual cycle. Existing inline drafts may hold the current view until resolved or reopened, preserving their text.
