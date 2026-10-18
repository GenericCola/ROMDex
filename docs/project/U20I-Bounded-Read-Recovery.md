# U20I — Bounded Read Recovery

**Status:** 0.5.14 candidate passed verification; awaiting fresh backup and installation. Two operations remain intact: the final planning edit and the accepted native-content transition. U20I is not complete.

## Live Finding

After 0.5.13 cleared the old timeout warnings and delivered the earlier backlog, the final planning edit stopped with `Content Response Exceeds Its Bound.` Its original publication is `31c1ea2418280fe6f8c918e20eadd680a430639f64c95f04ebe6c8ab6c040c42`, matching the human-approved transition's parent. No upload slots had been verified for that edit.

The old transport used the same error for an oversized individual response and cumulative batch exhaustion. An isolated, GET-only replay reached the first upload boundary successfully: 430 requests and 657,150 response bytes, with no production cache writes or network writes. This confirms that the operation's initial reads can succeed with a fresh budget; it does not justify increasing any response or transfer limit.

## Correction

- `CONTENT_RESPONSE_LIMIT` retains a hard block for oversized individual responses.
- `CONTENT_READ_CHECKPOINT` retains verified progress and queues a retry with a fresh bounded batch. The 64 MiB aggregate bound, per-response bounds and request limits remain enforced.
- An old ambiguous read-bound block may retry against its freshly verified, unchanged sole parent only when no content review or in-flight upload ambiguity exists. The original publication and artifact identities remain unchanged, and the recovery is recorded in journal metadata. A subsequent structured hard-limit failure stays blocked; genuine baseline/content conflicts are not retried by this rule.

## Evidence and Remaining Gate

All 92 focused reader/editor/transport/catalog-storage checks pass. They cover cumulative-budget reset, hard per-response limits, durable checkpoint/reopen, legacy intent recovery and continued blocking after a genuine size failure. The final installer matches 243 source files plus one retained reference asset, passes 182 syntax checks and 17 packaged-runtime checks, and completed a fresh live-history read in 178,297 ms (987 requests, 17,015,786 bytes, no review findings). Fresh backup/restoration, installation and final native/remote verification remain required. No queue cancellation, content rewrite or forced commit is authorized by this correction.
