# U26C — Isolated Clean RDX Round-Trip Acceptance

**Complete: October 19, 2026.** The clean one-map round-trip proof passed against the installed ROMDex 0.5.15 RDX modules and NPCDex UI. Final cleanup and production preservation checks also passed. No application-code change, installer or production migration is needed for this exercise.

## What passed

1. An empty isolated workspace imported a compressed, fictional, one-map RDX through the existing preview and confirmation UI. NPCDex generated its selector/entity tiles from the document.
2. The original contextual note and flag controls saved into the managed document. The UI exported it; closing/reopening storage retained the exact exported revision.
3. An explicit fresh preview bound only this map to NPCD. Eleven content records, hierarchy links, immutable artifacts and image/attachment bytes published and passed readback.
4. A further local note published successfully. An independent native YouTrack title edit entered review; accepting the title updated the managed RDX without replacing either note.
5. A second empty local instance found the existing registry and downloaded both edits without creating duplicate content records. Auto-Sync remained Off for these isolated profiles; only explicit test cycles were run.
6. The final portable RDX imported through chunk/preview/confirmation APIs into a third empty offline profile. It retained all original record identities, immutable artifacts, plans, reviews, mappings, presentation metadata and exact asset bytes. The testing view is Unreviewed and the imported file has no inherited cloud authority.

## Preservation and limits

The before/after read-only checks confirmed production NPCDex cloud sync paused, local saves enabled, database integrity OK and 133 pending entries preserved (132 queued, one blocked). The full verified U26B backup remains local: 158 files, 308,593,829 bytes. The three production working map files and checked encrypted connection copies still match that backup. No current map, shared/global NPCD record, task or production queue entry was replaced.

The title proof demonstrates the implemented native-field review path; arbitrary edits to backend attachments or hierarchy are not automatically trusted. This is a synthetic map proof, not ROM extraction, in-game testing or full task-bound agent-result acceptance. Prior RD07/RD10 and U23A–U26 evidence is reused rather than repeating broad suites. U21–U26A source features still await a later packaged release; this task does not deploy them.

The first headless download was cancelled because its download directory was implicit. Repeating that focused check with a workspace download directory passed without changing the app.

[Original and round-trip RDX examples](U26C-Examples/README.md).

## Final cleanup and acceptance

The final file is 19,522 bytes and contains one map with 11 current content records. Its SHA-256 is `7703a1869ea3fa4537a1e4aa5c4b760a6df2a2605dfd42ff67d84926107cbfe0`. Both original and resulting files are retained as fictional examples.

The native Electron harness loaded the final document with the installed NPCDex assets, but its window was hidden by the launcher and unavailable to both the user and inspection tool. This is runtime-load evidence, **not native visual acceptance**. A normal Windows cleanup launcher verified the exact QA parent process, executable and script before stopping only that disposable child. No production process was stopped. The functional UI proof was performed in isolated Chromium; no extra visual regression run was added.

All 12 temporary NPCD records (one registry and 11 content records) were validated against this unique document's markers and ownership, removed in child-first order, and individually confirmed absent. The earlier live-proof record's retained-record note describes the pre-cleanup checkpoint; the final cleanup receipt supersedes it. The Windows helper then verified the same production pause, local-save setting, journal state counts and integrity result and stopped normally.

U26C is checked off. The production legacy backlog is preserved and paused; it was not delivered, reset or replaced by this exercise. A later production clean-data replacement still needs its own current preview and acceptance.

**Next: U27 — History, Reversal and Verification-Gated Completion. Recommended: Sol / High. A new PASSKEY is required.**
