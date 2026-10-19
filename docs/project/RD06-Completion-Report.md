# RD06 — ROMDex Plan Import and Destination Mapping

**Status: source-complete.** Authorized by the user's RD06 PASSKEY. Installed ROMDex remains 0.5.14; production saves, maps, queues, credentials and YouTrack records were not changed.

The Work Pane now has a source implementation of **Import Plan RDX**. Users can preview/import a plan locally, edit its basic task values, export a verified portable copy, and separately choose an existing PMON destination. Placement previews rebase Epic → Saga → Story → Verse → Task while preserving entire subtrees. New siblings append in local order. [Usage and boundaries](ROMDex/rdx/PLAN-IMPORT.md).

Publication explicitly maps editable fields and their user/enum values, preserves original comment attribution as evidence and stages exact attachments. Read-only context stays local; missing or incompatible writable mappings block publication. Omitted records survive. Explicit deletion requests require a matching imported baseline and review of current targets/children. Existing native edits merge when independent; overlaps require choices.

Bindings and queued operations are committed atomically. Stable identities prevent duplicate task/comment/file publication on retries and reimports. Partial or uncertain batches retain visible progress and use the existing save-review system. Auto-Sync Off stays Off. Import alone neither publishes nor dispatches an agent.

## Verification

Passed **142 distinct relevant checks**: 30 new plan/import/queue checks, 26 existing map checks and 86 existing core, bulk-hierarchy, attachment, sync-control and desktop-policy checks. The affected regression run passed 138 checks before four final focused additions; all 30 plan checks then passed under Node and the bundled Electron runtime in Node mode. Unrelated suites were not repeated.

The retry test uses the actual WorkspaceEngine with a synthetic backend that accepts a create and comment before losing its response. Recovery produces exactly five tickets, one comment and one attachment, reusing identities. Other cases cover stale approvals, failed durable storage, deletion consequences, native decimal metadata, tags/period types, omitted content, native conflicts and shared map/plan store ownership.

Seven isolated headless Chromium checks exercised the actual plan dialog module and suite styles: local import without queueing, exact local notes, verified export, tier/value mapping, 620-pixel layout, explicit queue/progress with Auto-Sync Off, and absence of runtime errors/external requests. Screenshot review confirmed padding and separate scrolling/footer regions. A separate actual desktop-service RPC smoke check covered offline import, unchanged NPCDex selection, lifecycle gating, checkpoint/shutdown and released ownership. These are synthetic source checks, not installed native-window or live YouTrack acceptance.

Review corrected native decimal fingerprinting without weakening RDX canonicalization, nullable tag/period conversion, completion-baseline drift, omitted sibling ordering and local cancellation of unsubmitted deletion requests. UI checks corrected select labels and aligned verified export download lifetime with the existing attachment downloader. [Verification evidence](RD06-Verification.json).

## Limits and Next Task

This implementation is not installed or published. The current binding ledger belongs to local Data. Automatic native-change pullback into managed RDX, cross-computer binding and the required real isolated two-way proof remain RD07. First publication creates new records; imported backend IDs never establish authority. Read-only/unsupported fields remain context or block publication as appropriate. Already-posted comments/files cannot be mutated by reusing their portable IDs. Discarded/uncertain operations require existing save review instead of blind reposting. Publication is bounded to 1,000 tasks, 128 levels and 12 MiB operation JSON.

**RD06 is checked off. Next: RD07 — Document Bindings and Bidirectional Cloud Sync. Use Sol / High and supply a new PASSKEY before that task begins.** Production-map adoption remains RD10 after the live proof and fresh accepted preview.
