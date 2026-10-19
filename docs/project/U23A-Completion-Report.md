# U23A — Authorized Handoff and Agent File Transfer

**Completed in source:** October 19, 2026. Installed ROMDex remains **0.5.15**; no installer, production save migration or automatic result receiver was activated.

## Delivered

- Verified package delivery now includes a bounded, sanitized return-context JSON containing required content ancestry/mappings and exact asset references. Unchecked proposals, notes, views and whole-save/history blobs stay private. The original fixed JSON and original map remain unchanged.
- **Authorize Agent Work** confirms the exact map/task/package/version/hash. Durable private metadata retains authorization, replacement and withdrawal history. A replacement on the same task/map supersedes older authorization; separate tasks remain independent. Offline withdrawal works even if remote files are unavailable. Existing attachment IDs are recorded at consent so later discovery can hold preauthorization results for review.
- **Copy Agent Instructions** uses a fixed template, with clipboard or selectable-text fallback. **Download Agent Handoff** exports its manifest. No AI calls, automatic messages, assignment or State edits occur.
- A portable deterministic CLI downloads pinned task files, materializes a valid baseline and uploads a returned one-map RDX to that same task. It verifies bytes/author, detects altered result identities and reuses confirmed uploads. Uncertain absent uploads require review instead of blind retry.
- Authorization uses the existing private metadata channel. Version 1 bytes/hashes and historical records remain intact; version 2 adds authorization history. Competing decisions require review and readable summaries. Upgrade all clients before publishing new authorization data; no live metadata-format switch occurred during this task.

## Verification

| Evidence | Result and limit |
| --- | --- |
| One broad regression run | 868 checks: 866 passed; two new metadata-transition failures found and corrected. The affected checks were rerun after correction rather than repeating the whole suite. |
| Final affected checks | 94 passed, including authorization, restart, supersession, offline withdrawal, metadata projection and conflicts. |
| Final metadata refinement | 40 overlapping rechecks passed, including human conflict resolution/convergence and retained historical branches. |
| Final file-transfer/ancestry checks | 12 passed, including a genuinely revised map's required ancestor closure, hash/account/task mismatch, uncertain transfer and duplicate-free replay. |
| Source interface | Six focused headless Chromium checks passed: exact-version confirmation/cancel, authorization, fixed copy/fallback, withdrawal and footer layout at 620-pixel height. This was not a new native-window/installer test. |
| Actual Windows/YouTrack route | Separate Node CLI fetched authorized files using the existing protected connection, compiled a synthetic returned RDX from only downloaded material, uploaded/read it back and reused the same attachment on replay. Task fields and Auto-Sync Off were retained. Private synthetic **PMON-329** was removed afterward. |
| Portable tool bundle | Dependency closure, ZIP integrity and standalone validation of the returned RDX passed. No credentials, live save data or ROM are included. |

See [verification evidence](U23A-Verification.json), [implementation checklist](U23A-Implementation-Checklist.md) and [agent tool guide](../../apps/romdex/rdx/AGENT-FILE-TRANSFER.md). The [portable tools ZIP](U23A-Agent-File-Tools.zip) contains the executable tools and current contracts. Source/archive identity is recorded separately after the private-repository backup is verified.

## Practical Limits and Next Task

The real proof used **GenericCola**, matching the approved existing-connection route. It does not prove a separate restricted agent identity or that an unrelated remote agent already has a usable binary-transfer credential. The supplied helper does not extract an MCP credential; another environment must securely configure its existing account connection. No token was re-entered or rotated, and the protected YouTrack connection was byte-for-byte unchanged.

The proof used synthetic content, not an actual ROM extraction or human in-game test. A valid upload does not prove implementation correctness. U24 must discover and stage returns, recheck current authorization and distinguish preauthorization/superseded work; U25 owns scoped application and U27 owns the flashing-amber Needs Testing stage and human-verification gate. The task remains open; native Done or imported testing claims do not authenticate a human test.

**Next: U24 — Durable Returned RDX Discovery, Sol / High.** A new PASSKEY is required.
