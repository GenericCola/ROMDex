# U20C — Dynamic Content Reader and Durable Cache

**Completed:** October 17, 2026, under U20C's PASSKEY. **Installed application:** ROMDex 0.5.7, unchanged. **Next:** U20D — Backend Planning and Documentation Corrections, **Sol / High**, requiring a new PASSKEY.

The new reader assembles NPCDex from versioned YouTrack content in an isolated workspace. It validates pinned identities, authors, complete publications, source revisions, structured content and attachment bytes before publishing the local view. Its durable cache survives interrupted delivery and process restart. The existing NPCDex interface displays current content with proposals and notes appended, using the reader projection rather than the coded baseline.

This is an isolated implementation and verification milestone. Your installed app still uses its existing GitHub-backed NPCDex saves. No real saves were migrated, no provider was switched, and no installer update is needed. Editing, production migration and installed acceptance remain U20D, U20E and U20F respectively.

## Behavior and Verification

- **467 automated tests passed**, including 41 new reader, transport and preview checks. These cover malformed JSON, schema/digest/graph errors, missing history, competing versions, incomplete dependent updates, native title/description/comment changes, unknown authors, quota/commit failures, offline cache, intentional cancellation and Off/manual sync.
- The accepted U20A schema is byte-identical in the runtime. Independent PowerShell validation accepted **24 artifacts** and rejected **four invalid artifacts**. The runtime validator implements this schema's pinned keyword set; it is not a general schema engine.
- A fresh read-only permission inventory confirmed the existing NPCD project and trusted owner/team boundary. No grants, settings or accounts were changed.
- Live verification created **12 explicitly private, marked NPCD fixtures**: one registry and 11 content records, with their native hierarchy and 17 baseline artifacts. The actual runtime reader accepted their real YouTrack attachment bytes using paginated reads.
- A two-record synthetic documentation correction was published. One required attachment read was deliberately answered with HTTP 503 by the test client. The old projection remained intact. A **different Windows process** reopened the durable cache, retried the genuine downloads and applied both corrected records together. This is an injected interrupted read, not a claim of a physical network outage or a server transaction.
- All three live reader runs used **GET only**, preserved all four proposals and left automatic synchronization Off after manual refresh. The successful baseline, interrupted and recovered runs made 84, 97 and 98 GET requests respectively; two-entry pages intentionally exercised pagination.
- The browser check used the familiar NPCDex presentation with synthetic content. A manual refresh updated the selected Guide while preserving the selection, proposals and Auto-Sync Off. A layout issue found during inspection was corrected; the final [preview image](U20C-Preview.png) was inspected.
- Cleanup verified all **12** marked issues absent; visible NPCD content returned to **zero**, PMON remained at **299**, and no PMON issue was modified. Consumed fixture issue numbers remain consumed by YouTrack. Cleanup checked markers, ownership, visibility, comments, links and attachments before deleting only the pinned fixtures.
- Every live stage verified all **three protected credential files byte-for-byte unchanged**. No token was entered, logged or archived. Installed-file preservation and repository verification are recorded in the evidence.

The regression run used workspace-local TEMP/TMP. An earlier run using the sandbox's default temporary directory encountered Windows file-rename permission errors in pre-existing tests; the final run completed without those failures. No old application modules were changed to accommodate the sandbox.

## Limits and Next Gates

The reader preserves competing and missing-history conditions for review; this phase does not implement review-resolution writes. Owner-authored bootstrap, planning and explicit documentation corrections can be read. Agent implementation/verification acceptance remains disabled until the later identity, authorization and result-validation gates. JSON actor claims do not establish authority.

The physical carrier pins stable issue/attachment IDs and hashes. Native issue titles, hierarchy, descriptions and comments are checked for discrepancies; arbitrary native prose cannot silently replace structured current content. Unpublished owner files remain pending. Signed attachment URLs remain transport-local bearer capabilities and are absent from the projection/cache/evidence.

Bounds are explicit: 512 KiB chunks, 256 KiB carriers, 16 MiB assembled objects, 64 MiB cycle response/transfer and materialized-state budgets, 256 MiB cached payload and 1,000 publications. The configured YouTrack upload ceiling and remaining storage are still unknown. The full real-save compatibility map, history/assets, retention/compaction and larger-data performance need U20E proof; synthetic examples do not establish that migration. Cache payload limits exclude SQLite overhead.

The content module and preview are separate from the installed service and production profile. The preview is read-only, has no save/credential/proxy API and refuses production Data paths. **U20D will add isolated planning/correction writes and recovery; it will not silently switch your live provider.** Actual ROM extraction, agent access and in-game testing remain later work.

## Records

- [Action checklist](NPCDex-ROMDex-Action-Checklist.md)
- [U20C evidence summary](U20C-Verification.json)
- [Reader/carrier technical guide](ROMDex/content/README.md)
- [Task checklist](U20C-Action-Plan.md)

Source, synthetic examples, sanitized proof reports and development helpers are archived in the organized private development repository. Live Data, protected credential sessions, full saves and private signing keys are excluded.
