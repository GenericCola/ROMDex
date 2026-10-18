# RDX Workflow Contract Review

**October 18, 2026. Status: user-approved and complete. See [completion report](RD01-Completion-Report.md).** The RD01 PASSKEY authorized contract design and isolated examples, not application implementation. ROMDex remains at installed 0.5.14; no live save, queue, credential, YouTrack issue, installer or application source was changed.

## Deliverables

- [Contract proposal](RD01-Contracts/README.md): internal workspace/object routing, portable IDs and backend bindings, base lineage, lossless framing/compression proposal, compatibility, local checkpoint recovery, imports/removals and return/testing rules.
- [Machine-readable schema](RD01-Contracts/rdx-contracts.schema.json) and [pinned native content schema](RD01-Contracts/native-content.schema.json): preserve current record, mapping, proposal/review and presentation contracts.
- [Six review walkthroughs and example index](RD01-Contracts/examples/README.md): new map, offline/second-instance use, existing-map update, nested task-plan placement, older package versus newer draft, and dependent results/human testing.
- [Verification report](RD01-Contracts/verification-report.json): 70 passing isolated structural and semantic checks. The restricted schema evaluator is not an independent complete JSON Schema/metaschema certification or a production parser.
- [Source inventory](RD01-Contracts/source-inventory.json): pinned schema hash, fixture sources, modern/legacy magic and exact existing Pokéball asset identity.

## Decisions Proposed for Acceptance

1. Keep one `.rdx` extension, internally routed as a map or plan. Use a versioned framed container with readable structured JSON and exact binary assets; benchmark the compression default and final safe bounds in RD03.
2. Keep app-managed working files and durable local transaction/recovery records. Native YouTrack changes update the file too; importing/exporting works without a connection. Keep instance-specific bindings separate from portable identities.
3. Preserve stable identities and preview updates. Complete-map omissions can propose scoped archival against a pinned baseline; partial maps and omitted task-plan items imply no deletion.
4. Use immutable readable **JSON Map Packages**, with stable targets, base hashes, instructions and accessible YouTrack assets. Retain existing/new task choice and explicit attachment; agent dispatch remains separate.
5. Receive updated map `.rdx` on the same task. Match exact package/task/base evidence, apply safe independent results or complete groups, preserve newer drafts and review deviations. Mark every accepted agent result **Needs Human Review and Testing**, reset affected testing and keep its task open.
6. Preserve the original NPCDex interface and use the exact existing Pokéball favicon as the `.rdx` file icon under RD08.

## Verification and Remaining Gates

The examples and checks address schema/resource references, artifact seals, graph membership, scope boundaries, asset preservation, local task fields/tier placement, complete/partial omission behavior, package grouping, exact attachment-byte hashes, source identity claims, out-of-scope returns, incomplete groups and newer drafts. Fictional IDs and source evidence are intentionally unsuitable for production. No app-side AI is part of the proposed import/mapping path.

The container fixture is an unpacked manifest, not an actual `.rdx`. Compression performance, parser streaming/cancellation, real file association, durable file/database recovery and actual backend concurrency remain implementation checks in their assigned tasks. An actual ROM-specific extractor still needs the real project/toolchain.

**User acceptance criterion retained:** RD07 must import a test `.rdx`, map it to isolated real YouTrack records, verify a local edit remotely, verify a native edit locally and retain both through reopen/export. Only then may RD10 adopt `.rdx` for every existing map, after a fresh backup and accepted preview. Preserve NPCD records, all data/history and three credentials.

## Authorization Boundary

The user accepted the concrete contracts and separately supplied PASSKEY for RD02. RD01 is complete. **RD02 — Bounded Sync and Upload Recovery, Sol / High** is now authorized; later tasks remain separately gated.
