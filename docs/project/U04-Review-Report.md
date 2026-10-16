# U04 — Synchronization Contract Review

**Prepared:** October 15, 2026. **Status:** completed and explicitly user-approved October 15, 2026; U04 is checked off.  
**Authorized work:** U04 research, contract design and local proof model only.

## Deliverables

- [Ownership and Synchronization Contract](U04-Data-Ownership-and-Synchronization-Contracts.md): data authority, stable identity, immutable publication, asset limits, discovery, queues, offline/concurrent edits, receipts, retention, access and migration gates.
- [Proof Results](U04-Contract-Proof-Results.json): 43 named scenarios, including 120 delivery permutations, six existing NPCDex request/baseline hash pairs and 69 released files verified in both locations.
- [Executable Model](../work/u04-contract-proof.mjs): isolated Node fixtures and read-only compatibility checks; no application implementation or network access.

## Recommendation

Keep the approved YouTrack-first direction. Use immutable change records and checkpoints with a durable local queue. Independent edits can merge; competing edits retain complete branches for review. Do not assume an attachment “latest save” overwrite or client read/check/write is atomic.

Accept eventual synchronization: receipts auto-apply against the validated known revision, but a later conflicting offline edit sends the entire receipt/branch to review. No partial receipt is accepted, no version is discarded, and receipt application does not certify ROM edits/testing or close a ticket. The first release conservatively blocks a unique merged projection for the affected namespace until resolution; unrelated capabilities continue.

No automatic remote pruning is included. A checkpoint accelerates loading without deleting ancestry, historical images, receipts or undo evidence. More efficient destructive retention would require a separately approved coordination/recovery design.

## Evidence and Limitations

The model covers two writers, causal/disjoint/competing changes, late conflicts, complete receipt operations, explicit resolutions, uncertain uploads, duplicate logical identity, cursor-persistence ordering and bounded decompression. The original saved revision-72 export still matches U03's inventory; all six request and baseline hashes retain their existing property-order semantics.

The model assumes a reliable append/discovery channel and does not prove actual YouTrack API behavior, database isolation, filesystem durability, live permissions or production performance. These remain hard implementation/acceptance gates in U09–U17 and U23–U28. A server coordinator is not required for the proposed eventual-consistency behavior; global finality would need a stronger proven route and a revised decision.

No current save, token, profile, protected backup, application code, live issue, attachment, project, app, account or billing setting was changed. No browser UI was used. Work is confined to planning documents, a local proof helper and its results. No Git commit is claimed.

## Approval Boundary

The user explicitly selected **“Approve Versioned Saves and Conflict Review (Recommended)”** on October 15, 2026. This accepts immutable/versioned saves, eventual consistency and whole-receipt review for later conflicting offline edits. U04 is complete and the decision is recorded. A separate new PASSKEY is still required for **U05 — Shared Header and Control Layout Review, Sol / High**. No U05 work has begun.
