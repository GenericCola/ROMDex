# RD10 — One Map per Working File

This supersedes the packaging in the earlier adoption preview. The source data is unchanged: the user approved the original data preview, then expressly required one map per RDX. Both instructions are recorded in `RD10-Scoped-Acceptance.json`. Installation and activation remain conditional on a fresh baseline check and complete, verified Data backup.

| Map | Existing NPCD issue | Compressed bytes | Map-owned records | Required context records |
| --- | --- | ---: | ---: | ---: |
| New Bark Town | 3-429 | 540,642 | 62 | 17 |
| Route 29 | 3-491 | 185,623 | 22 | 12 |
| Cherrygrove City | 3-513 | 338,835 | 69 | 32 |

Each file contains exactly one physical map, its descendants, relevant proposals/reviews/history, required shared references and exact required images. It contains no other map's content and no embedded whole-catalog recovery export. Shared/global collections and the original export remain separately preserved in native storage and the complete backup.

The three documents plus separate native shared context reconstruct the original catalog exactly, including both gender views. All 211 NPCD identities remain bound to the existing issues. Adoption creates no replacement tickets and does not rewrite the backend tree.

The original native synchronization journal remains the publication owner. Local edits are durable there first, and affected map files are checkpointed after editing settles. Native YouTrack changes follow the same accepted reader and update the affected files. A complete-generation ledger prevents a partly written set of files from replacing the current catalog. Old file versions and recovery evidence remain retained.

## Current Limits

- Global Dialogue is a shared collection, not a physical map RDX.
- Returned agent RDX reconciliation on actionable tasks remains Phase 8. Divergent reimports into adopted existing NPCD maps are held for that workflow; they cannot silently replace these records. Local standalone RDX imports retain their existing reviewed update behavior.
- Historical file versions are retained; no retention/pruning policy is introduced here.
- No actual ROM extraction has been performed. The authoring kit packages validated JSON and assets; a ROM-specific extractor must supply those inputs.

## Verification

The scoped preview checks file payloads and assets, standalone map views, exact catalog reconstruction and original issue bindings. The actual-data isolated adapter proof additionally checks a local edit, only the affected file changing, and a reopened journal retaining that edit. Packaged native export, backup/restoration, fresh remote baseline and installed acceptance are recorded separately; this preview alone is not completion evidence.
