# MX07 — Routine Sync, Local Responsiveness and Storage

Completed October 21, 2026 in source and isolated candidate **0.5.26-11d.1**, under the Phase 11D PASSKEY. Installed ROMDex **0.5.26**, production saves, queues, protected connections and the NPCDex cloud-sync pause are unchanged. No installer or release was produced.

## Changes

Cloud reads and delivery no longer occupy the local editor/checkpoint queue. Publication keeps its frozen revision while newer local edits remain pending. Review cancellation aborts its network work; Quit stops that work before closing local storage. Progress separates checking from durable advancement and identifies the recorded verified revision, rather than presenting a pending check as an up-to-date save.

Routine checks reuse verified local publication data instead of reconstructing unchanged binary content. Native metadata is freshly batched before shared-record inventories. Supported correction files are discovered through a paginated filename-filtered YouTrack query and still require exact ownership, marker, baseline and content verification. Complete inventories, conflict checks and final readback remain mandatory.

Large legacy documents preserve their original bytes and revisions while factoring sealed record bodies through the existing history-artifact mechanism. Bounded, hash-verified validation/compression/container caches avoid repeated work; untrusted or changed bytes still take the complete validation route. Parser limits were not raised. Proposal baselines, current heads, assets and historical records remain reachable.

Content Tools → Storage Usage inspects managed files, pending work, retained versions and the default 2 GiB budget. Disposable decoder/renderer caches use a separate 512 MiB budget and 384 MiB target. Idle workers clean only complete verified cache products. Working files, unsent edits, package baselines, backups, credentials and history are protected. Production folders were inspected read-only; no production cleanup occurred.

## Measured results

The same original 1,001,582-byte, 134-record Violet City RDX used for RI03P was replayed against the in-memory adapter. Unchanged checks fell from **396 to 187 adapter calls**, and binary reads from **2,926,272 to zero bytes**; observed replay time fell from 7.296 to 1.260 seconds. These are adapter measurements, not HTTP or WAN measurements. RI03P's recorded full-map WAN results remain valid historical evidence: 9.3 seconds/109 requests unchanged, 34.8 seconds/209 requests outgoing and 58.4 seconds/276 requests incoming. They were not redundantly rerun.

The live proof used a separate **nine-record synthetic map**. Counts include each listed cycle, excluding deliberate setup/cleanup. These rows were measured before the final query/cache-order optimization; they are not a same-size comparison with RI03P.

| Operation | Time | HTTP requests | Writes | Upload bytes | Download bytes |
| --- | ---: | ---: | ---: | ---: | ---: |
| Initial publication | 37.101 s | 103 | 34 | 76,225 | 208,154 |
| Unchanged | 2.631 s | 16 | 0 | 0 | 27,110 |
| One-field outgoing | 8.044 s | 30 | 3 | 17,991 | 93,821 |
| Incoming second profile | 10.051 s | 41 | 0 | 0 | 102,508 |

A final one-record live query check reduced the same metadata/inventory boundary from three requests to two while retaining fresh metadata and the full attachment inventory. It found the exact owner correction file. All 11 exact issues used by MX07's two proofs were confirmed absent afterward.

The native candidate saved a synthetic note in **517 ms**, quit normally in **499 ms**, and a fresh file read retained the exact note. Its Storage Usage view and mapping inspector worked at 620px height. Slow/offline queue and review-cancellation cases passed.

**Large-map limitation:** the full legacy map's first supported upgrade/checkpoint took **25.132 seconds**. Subsequent complete local checkpoints improved from about 17.4 seconds to **10.037 and 10.694 seconds**, but remain slow. The final capability fast path was not rebenchmarked. U28/U29 must evaluate this latency and native concurrency; this task does not claim instant large-map saves or a full-map WAN SLA.

## Verification and limits

Across Phase 11D, **131 distinct targeted cases passed**, with no unresolved case failures. An additional final four-case character-organization recheck passed; those cases are already included in the distinct count. Resource-heavy attempts were rerun sequentially after memory exhaustion. Two preservation assertions were corrected to allow the newly retained original-document history asset; two proposal-baseline failures were fixed by retaining the original before current-head compaction. A native harness assertion was corrected to inspect native review records rather than the empty legacy annotation projection. Relevant focused cases then passed. No full regression suite was repeated.

The final audit compared **1,214 application source files**, **146 mirrored test files** and **1,286 candidate files**: source/mirror/candidate match, candidate package metadata excepted; **38 changed JavaScript syntax checks** passed. Runtime binaries matched Phase 11C, and the candidate contained no forbidden ROM, protected-credential, database or key files. Git whitespace validation passed with established CRLF endings preserved. See [verification](MX07-Verification.json).

Older adopted catalogs retain their original sync owner. Automatic cleanup/retirement of pre-existing child copies on another instance remains an integrated review case. Actual two-build acceptance still awaits another supported ROM. No source commit or GitHub publication is claimed.

Phase 11D is complete in source and the isolated candidate. Stop before MX08; production packaging remains U30.
