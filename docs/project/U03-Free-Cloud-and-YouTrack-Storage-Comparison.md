# U03 — Cloud Storage and Private Release Distribution

**Reviewed:** October 14, 2026.  
**Authorization:** U03 PASSKEY; research/design only.  
**Status:** U03's original YouTrack-first direction is superseded by the user-approved hybrid storage revision during U14: private GitHub for bulk saves and metadata; YouTrack for tasks and all agent-required handoff material. U14 setup is complete; see [the report](U14-Completion-Report.md). No real cloud save migration is authorized until the later preview/acceptance gate.

## Recommendation

**U14 revised decision, approved by the user:** private GitHub will hold bulk NPCDex saves/assets/history and substantive ROMDex metadata. YouTrack remains the task authority and must contain every file, image, report, mapping and instruction the agent needs for NPCDex → Ticket → Agent → Ticket → NPCDex. No agent access to the full save repository is required or granted. Live inspection confirms GenericCola is a PMON Project Admin, with issue/file permissions but no listed Create Project permission; Guest is banned and anonymous issue reads return 401. YouTrack upload configuration and remaining capacity remain unverified; these are later handoff-size gates, not a reason to claim all projects are public. No real cloud saves have been uploaded or migrated.

### U14 Alternative — Private GitHub Save Repository

For the current mostly single-user workload, use a separate private **GenericCola/ROMDex-Data** repository for NPCDex saves and substantive ROMDex metadata. Keep YouTrack authoritative for tickets, comments, issue attachments, published request packages and returned receipts. Keep the existing ROMDex development/releases repository separate, so development/agent access does not automatically expose saves. GitHub Free supports private repositories; no Actions, LFS, paid storage or billing is proposed. [Private repositories](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration).

This trades YouTrack's existing issue/file adapter for a new Git-backed data adapter, in exchange for direct owner control, native version history and repository-level access separation. It is an ownership/versioning recommendation, not a claim that implementation is already done or cheaper. Existing protected download access is read-only and remains unchanged; save publication needs separately scoped Contents write access to the data repository. Never grant that credential or the full data repository to agents merely for ticket work. [Git reference permissions and updates](https://docs.github.com/en/rest/git/refs#update-a-reference).

GitHub does not automatically merge NPCDex's semantic data or replace the local durable queue. If selected, revise U04/U14's transport/discovery proof: immutable objects and published versions, preserved offline bases, guarded non-forced reference updates, uncertain-outcome discovery, idempotency, whole-receipt conflict review and exact legacy hashes all remain requirements. Batch changes; do not commit an entire compressed export per keystroke. Retain an exact original import/recovery object, then avoid repeatedly duplicating unchanged assets/history. No automatic destructive history cleanup is approved.

The last measured original export was 13.2 MB (3.84 MB gzip); distinct embedded images were only 0.54 MB, with most growth in history. That fits GitHub's per-file constraints today but is not a future capacity guarantee. GitHub documents file/repository and push-rate recommendations plus REST content-generation limits. U14 must validate the actual object layout, concurrency, request budget and growth before adopting this provider; reassess if the dataset becomes a large binary asset store. [Repository limits](https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits), [REST limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

**Decision gate:** the user has approved this provider separation as part of U14. Provision and validate the private save repository with synthetic records only; obtain separately scoped runtime write access without widening or replacing the saved read-only application-update token. Complete the revised U04 transport proof before adoption. U14 setup and verification are complete; U15's real-data migration remains separately gated.

### Previously Approved Direction

Use the **existing YouTrack instance as the first-choice cloud store** for NPCDex saves/assets/history and ROMDex workspace metadata. Reuse its authentication and attachment transport, with a dedicated restricted storage area and explicit version/conflict handling. This is a better fit for the stated scale than adding another cloud platform.

The user expects one person initially, possibly a second, and ten at the extreme. Start with the owner's account. Accommodate future approved participants through workspace permissions and conflict handling; this does not add team-management UI or grant anyone access now. The ten-account free allowance is instance-wide, including existing users and any separately provisioned integration accounts, not ten extra ROMDex users.

**Confirmed constraints:** no payment method or usage-based billing; avoid weekly inactivity pauses; project data and installers remain private. ROMDex remains the app, NPCDex its add-on, and application updates notify and wait for approval.

The provider choice is a **YouTrack-first design**, subject to U14 confirming actual permissions, plan/storage use and transfer limits. The synchronization contract and concurrency proof belong to U04 before adopting live cloud saves. If those gates fail, return for a revised decision instead of enabling another service or billing automatically.

## Measured Current Data

Measured the authoritative saved NPCDex export, revision **72**, and saved ROMDex metadata without uploading them. The NPCDex source hash was stable across inspection.

| Item | Measured Size / Count |
| --- | --- |
| Complete saved NPCDex export | **13,221,699 bytes**; 4 towns, 44 plans, 6 requests, 145 history records |
| Gzip of the original export bytes | **3,843,217 bytes**; decompression can preserve the exact original file |
| Compact JSON / compact gzip | 9,915,298 / 3,751,023 bytes; these are alternate encodings, not migrated data |
| Embedded image references, including history copies | 159 references |
| Unique embedded image contents | **39 files, 541,023 bytes total**; largest 75,755 bytes |
| Current character-image entries | 15; historical images must also be retained |
| Largest individual history entry | 2,450,359 bytes of JSON |
| Saved ROMDex issue cache | 299 items; 1,333,153-byte workspace file; no pending operations at inspection |
| ROMDex workspace metadata estimate | **41,639 bytes**, including order, images, assigned statuses and selected preferences |

The metadata estimate is a candidate subset, not the final cloud schema. Device-specific view state and protected credentials need separate ownership rules. Raw data/history must survive any future normalization; image deduplication must not alter hydrated export/request hashes or remove historical references.

Most export growth is history, not distinct image bytes. Complete measurement evidence: [Data and Capacity Inventory](U03-Data-and-Capacity-Inventory.json). Re-measure the latest saves at migration; this snapshot is not a permanent migration authority.

## Provider Comparison

| Candidate | Relevant Free Resources / Behavior | Fit for This Project |
| --- | --- | --- |
| **Existing YouTrack** | Free ten-account license includes **30 GB total**. Existing account/token, project permissions and supported attachment APIs. Actual remaining space/plan are not verified here. | **First choice:** one platform for tasks and app data; needs a versioned storage adapter, not a second database subscription. |
| **Supabase Free** | 500 MB database, 1 GB file storage, 5 GB egress plus 5 GB cached egress. Free projects may pause after a low-activity week. | Capacity fits; built-in auth/Postgres would be convenient. The weekly pause conflicts with the user's selected preference. |
| **Appwrite Free** | Published free comparison: 2 GB storage and 5 GB monthly bandwidth. Its current policies pause inactive free projects and delete projects left paused for 90 days. | Capacity fits, but the inactivity/deletion policy is less suitable. |
| **Convex Free** | Hard-capped free resources, including 0.5 GB database and 1 GB files. A production deployment has no default expiry in the reviewed deployment table. | Viable reserve candidate with atomic mutations. Adds a new backend/auth integration; large history entries need file-backed or split storage. Absence of a documented weekly pause is not an uptime guarantee. Starter pay-as-you-go is excluded. |
| **Cloudflare Workers Free + D1** | 100,000 Worker requests/day and 10 ms CPU/request; D1 includes 5 GB, 5M rows read/day and 100k rows written/day. | Possible custom backend, but more work for auth/files. D1's 2,000,000-byte row/BLOB limit already requires splitting some current history. R2 is not an acceptable shortcut under the billing rule. |
| **Firebase with Cloud Storage / Cloudflare R2** | Firebase Storage requires Blaze billing; R2 requires a subscription checkout with usage billing despite its included allowance. | **Excluded** by the explicit no-billing constraint. This does not mean every separate Firebase/Cloudflare product requires billing. |

Sources: [YouTrack storage](https://www.jetbrains.com/help/youtrack/cloud/manage-your-database-size.html), [Supabase pricing](https://supabase.com/pricing), [Appwrite free-plan comparison](https://appwrite.io/changelog/entry/2026-04-07), [Convex pricing](https://www.convex.dev/pricing), [Convex deployment types](https://docs.convex.dev/production/multiple-deployments), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [Firebase billing requirement](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024), [R2 setup/billing](https://developers.cloudflare.com/r2/get-started/).

Supabase's current pausing guide states a one-year resume window; older search results still describe 90 days. Use the current guide rather than the old announcement. Appwrite's June deletion policy supersedes its earlier claim that paused projects can always be resumed. These policies were checked separately from headline capacity. [Supabase current policy](https://supabase.com/docs/guides/platform/free-project-pausing), [Appwrite February pause policy](https://appwrite.io/changelog/entry/2026-02-20-1), [Appwrite June deletion policy](https://appwrite.io/changelog/entry/2026-06-29).

Convex's Free/Starter distinction and document limits are explicit: Free hard caps differ from paid Starter overages; documents are limited to 1 MiB. Its optional Convex Auth library is beta with React-oriented documented integrations, so it should not be assumed to drop into this plain-JavaScript desktop unchanged. These are additional integration costs avoided by reusing YouTrack. [Convex limits](https://docs.convex.dev/production/state/limits), [authentication overview](https://docs.convex.dev/auth/overview).

## Why YouTrack Is Feasible

The current complete export compresses below YouTrack's **10 MiB default** upload limit. The configured instance limit can differ; Cloud permits a maximum configured limit of 500 MB. Most individual current assets are much smaller. No limit was changed or production-size file uploaded during U03. [Attachment size configuration](https://www.jetbrains.com/help/youtrack/cloud/server-configuration-settings.html).

YouTrack exposes supported attachment list/upload APIs, so the existing adapter's verified multipart handling, private token storage and file-integrity work can be reused. R08 already proved small real native image/text uploads and exact downloads. This does **not** prove the new save protocol, current gzip-size transfer, privacy boundary or account capacity; those need later controlled acceptance. [Attachment API](https://www.jetbrains.com/help/youtrack/devportal/resource-api-issues-issueID-attachments.html), [multipart use case](https://www.jetbrains.com/help/youtrack/devportal/api-usecase-attach-files.html), [R08 verification](R08-Completion-Report.md).

No ordinary task field should contain the entire dataset. Add a storage module beside the existing task adapter so native issue fields remain the task authority, while saves, images, ordering and retained assigned statuses occupy their own namespace.

## Proposed Storage Area

Prefer a small **private storage project** on the PMON instance, with a fixed number of clearly marked container issues outside the work hierarchy. If project creation is unavailable, assess a restricted container issue reported by the owner in the existing project. Record its stable ID and exclude system containers from task selectors, All Tasks, parent rollups and ordinary task deletion/move controls.

The user is unsure about project-administration access. This is an explicit setup check, not assumed permission to change global settings. Basic issue/file operations have already worked under the existing connection; private-project creation and actual visibility must still be verified. Do not create one issue per edit, NPC, history entry or save.

Issue access and attachment visibility can be restricted to approved users/groups. These restrictions narrow project permissions; they do not replace them. Reporters retain issue visibility, and users with the relevant Override Visibility Restrictions permission can bypass visibility restrictions. A private project is not secrecy from its trusted instance administrators. Confirm that the owner is comfortable with the PMON hosting/administration boundary before migration. [Visibility](https://www.jetbrains.com/help/youtrack/cloud/set-visibility-of-issue-or-comment.html), [private projects](https://www.jetbrains.com/help/youtrack/cloud/private-and-public-projects.html).

Use per-user YouTrack credentials protected locally. Do not share the owner's token with another participant or embed it in the installer. Protect remote file retrieval through the local service; do not persist or expose signed download URLs in UI state, logs or exported metadata. Future agent access remains separately limited to approved work/ticket evidence, not the complete private workspace.

## Versioning and Two-Computer Safety

**Do not implement this as overwriting one latest JSON attachment.** A second computer or person could overwrite changes made after its last read even when the files are small.

The first design to validate in U04 is an **append-only save history**:

1. Save edits and pending file bytes durably on the computer first.
2. Publish small immutable change batches, with operation ID, workspace/schema, base revision, device/author, content hashes and required asset references.
3. Upload needed assets first; publish the completed commit record last. Readers verify the complete referenced content before adopting a save.
4. Keep periodic compressed full checkpoints for recovery and quick startup. These are app save versions, not new task tickets.
5. Read newly published revisions and detect sibling branches from the same base. Preserve both; combine independent edits and route overlapping edits to the existing human review flow under U04's rules.
6. Recover uncertain uploads by identity and exact content before retrying. Duplicate delivery of the same operation must apply once.

For example, two computers start at revision 72. One edits an NPC's dialogue, the other changes a different NPC's note. Their two commits both survive and can merge. If both change the same dialogue from the same base, retain both versions and request a choice. Picking the newest timestamp is not reconciliation.

This is a feasibility direction, **not an implemented or proven merge algorithm**. The reviewed generic attachment resource does not establish an atomic compare-and-swap contract for a mutable head pointer. Do not assume a read-then-write revision check solves that race. U04 must specify discovery/pagination, publication, deduplication, branch resolution and compaction, and demonstrate the two-writer failure cases before live migration.

## Optional YouTrack App

A small YouTrack app could later supply a server-side revision coordinator or receipt endpoint. YouTrack supports extension properties, app global storage and custom HTTP handlers callable by external clients. App installation/attachment requires suitable project/global permissions. This is an option if U04 establishes a real need, not a prerequisite already authorized by this task. [App storage](https://www.jetbrains.com/help/youtrack/devportal/apps-extension-properties.html), [custom endpoints](https://www.jetbrains.com/help/youtrack/devportal/apps-reference-http-handlers.html), [permissions](https://www.jetbrains.com/help/youtrack/devportal/apps-authentication.html).

Do not put the sole authoritative save into app extension properties: removing an app, or removing/renaming its properties on reimport, deletes those values. Recoverable payloads should remain independently exportable. Browser `host.storage` is local browser storage, not cross-computer cloud storage. Any server-side coordinator's transaction/concurrency behavior must be validated rather than inferred from the existence of an endpoint.

## Data Traffic and Retention

These are planning examples, not measured usage or a performance guarantee:

| Pattern | Approximate Consequence |
| --- | --- |
| One current compressed checkpoint | 3.84 MB |
| Thirty complete checkpoints | 115.3 MB stored, before other data/overhead |
| 100 small 2 KB changes/day for 30 days | 6 MB of change payloads, before protocol/asset overhead |
| 100 full compressed snapshots/day for 30 days | **11.5 GB**; small current data does not justify full upload on each edit |
| Two clients downloading a full compressed snapshot every 15 seconds | About **1.84 GB/hour**; poll lightweight revision metadata and fetch only needed changes/assets instead |

Native issue attachments, other projects and snapshots share the instance's storage allowance. U14 records actual license, used space and available headroom. U04 defines conservative batching, metadata polling/backoff, checkpoints and retention; no existing history, file or save is deleted during this design task. Automatic pruning needs a tested recovery policy and must not discard divergent branches or historical image references.

YouTrack does not have the reviewed Supabase-style weekly pause. It does have a documented free-instance inactivity policy: three months without registered-user logins can lead to an inactivity notice and deletion after another two weeks. **Do not assume API polling counts as a registered login.** The owner must retain control of instance notices and access. [YouTrack inactivity policy](https://www.jetbrains.com/help/youtrack/cloud/instance-cancellation.html).

## Receipt Intake and Backups

Agent receipts can remain durable in YouTrack while the desktop is offline, then be checked when the background service resumes. The exact receipt transport and ticket grouping remain U20/U23 decisions. This proposal does not create automatic tickets or grant agents full workspace access. Applying an accepted receipt still does not certify human testing or edit the ROM itself.

Keep current portable NPCDex exports, images/history and ROMDex metadata/queue recovery outside the cloud provider as well. JetBrains documents daily/weekly/monthly instance backups and admin-level database export including attachments; cloud restoration is support-managed and applies to the instance. Those are additional recovery layers, not a reason to roll back all PMON work to repair one NPCDex save. [Cloud backup policy](https://www.jetbrains.com/help/youtrack/cloud/youtrack-cloud-database-backups.html), [database export](https://www.jetbrains.com/help/youtrack/cloud/database.html).

ROMDex should export/restore its own workspace through a previewed app-level checkpoint. Use fresh comparisons with native YouTrack before replaying operations. No token, private export or production save was transmitted for this research.

## Private Application Updates

Workspace saves and Electron installers have different size requirements. The desktop installer has not been built, so its actual size is unknown. Keep update artifacts private and independent from user saves.

| Route | Assessment |
| --- | --- |
| **YouTrack release-container attachments** | Reuses the existing connection. Viable only if the actual artifact fits the configured limit and storage budget, with private access and efficient streaming verified. Raising a global limit needs authorized administration; do not silently change it. |
| **Private GitHub Releases** | Recommended fallback if YouTrack limits/permissions make large binaries awkward. GitHub Free supports private repositories; release files must be below 2 GiB, with no documented total release-size/bandwidth cap on the cited Releases page. |
| GitHub Packages / Actions artifacts | Do not confuse these with Releases: their quotas/billing/retention differ. Not the proposed installer host. |
| Public GitHub Pages or public downloads | Do not meet the user's private-installer requirement. |

Sources: [GitHub Free](https://docs.github.com/en/get-started/learning-about-github/githubs-plans), [Releases storage/bandwidth](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases), [Packages billing distinction](https://docs.github.com/en/billing/concepts/product-billing/github-packages).

For a private GitHub route, the app can use a locally protected fine-grained credential restricted to the selected repository's **Contents: Read**. Publishing uses a separate write-capable credential on the build machine; none is bundled. Handle authenticated API downloads and approved redirects without forwarding authorization to arbitrary hosts. [Release-asset authentication](https://docs.github.com/en/rest/releases/assets), [API rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

Both routes retain U02's pinned-key release-manifest verification, version/hash/size checks, Update Now/Later consent and local checkpoint before installer handoff. A failed release check is separate from data-sync state. No repository, feed or signing key is created now. Choose the final binary route at U13A/B after measuring the installer and checking actual YouTrack limits; fallback publication requires the user's task approval.

## Consequences for the Action Plan

| Task | Updated Responsibility |
| --- | --- |
| U04 | YouTrack-backed workspace contracts; immutable versions, two-writer safety, asset publication, field authority, owner/future-member isolation, retention, limited agent evidence and recovery. Stop if a safe protocol cannot be established. |
| U09–U11 | Keep provider/capability status separate: a storage permission failure must not block healthy native-task syncing, even when both use YouTrack. Durable background state remains independent of the visible tool. |
| U12 | Fresh desktop migration; retain current browser-only files, original exports, exact IDs/hashes/history and protected credentials. |
| U13A/B | Measure the actual installer, validate private YouTrack delivery first, use private GitHub only through an approved fallback if necessary. |
| U14 | Check the existing instance/license/space/permissions/limits, provision the approved restricted area and run positive/negative access checks with disposable data. No new SaaS/billing assumed. |
| U15–U19 | Previewed current-data import and YouTrack-backed save/metadata sync; preserve local-first offline work and manual Save while Auto-Sync is Off. |
| U20/U23 | Deferred publishing/grouping and receipt-delivery decisions remain deferred. |

## Approval Boundary

The user approved **YouTrack-first workspace storage**, with the actual configuration/concurrency gates above, and **private YouTrack release delivery first, private GitHub Releases as the conditional fallback** after installer measurement. Approval selects the design direction only. No live provisioning, app installation, global-setting changes, data upload or public publication is authorized by U03.

U03 is complete. Next: **U04 — Data Ownership and Synchronization Contracts**, recommended **Astra / High**, under a new PASSKEY.
