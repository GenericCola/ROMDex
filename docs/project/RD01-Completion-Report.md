# RDX Workflow Contracts Approved

**Completed October 18, 2026.** The user reviewed the plain-English explanation, confirmed automatic reconciliation of returned task attachments and explicitly approved RD01: “Approved. Mark RD01 complete. PASSKEY — proceed with RD02.”

The [accepted contracts](RD01-Contracts/README.md), [review report](RD01-Review-Report.md), schemas, six walkthroughs and 70 isolated design checks define portable map/plan `.rdx`, fixed JSON Map Packages, scoped updates/removals, durable recovery and mandatory human review/testing of agent results. With Auto-Sync enabled, matching returned `.rdx` attachments are discovered and reconciled automatically; manual Save runs one cycle while automatic sync stays Off. Unsafe/incomplete results require review. Tasks stay open until human verification.

RD01 changed design artifacts only. No application source, installed 0.5.14, live content/queue or saved credential changed. Actual compression/parser implementation and live two-way file proof remain RD03/RD07; existing-map adoption remains RD10 after its fresh backup/preview gate.

**Next: RD02 — Bounded Sync and Upload Recovery, Sol / High.** The same user message separately authorized RD02. RD03 and later tasks still require new PASSKEYs.
