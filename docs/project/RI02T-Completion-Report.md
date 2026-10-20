# RI02T — Map-Specific Timelines and Roman-Numeral Stages

Completed in source under the RI02T PASSKEY, using **Violet City** as the isolated ROM testbed. No installer or live-data change was made.

Maps now use their referenced timeline rather than the first global progression record. Different maps can have different stage counts, names, conditions and orders. The UI renders Roman numerals from display order while retaining stable internal stage IDs. Switching maps restores its selection; long timelines scroll. The hard-coded global G–I timing warning is removed.

Native and legacy projection, snapshot/cloud validation, source import, RDX presentation checks and contextual editing use the same bounded stage rules. A new map can bring its own mapped timeline. Cross-map stage references and removal of an in-use stage are rejected. Explicit documentation corrections can rename/reorder a timeline or correct a point's condition/stage assignments through the normal versioned edit route. These corrections do not authorize ROM work.

Legacy A–J identities and the exact existing legacy frontend shape are preserved. Original export bytes/history remain untouched. Renaming/reordering a timeline preserves entity revisions, flags, notes, proposal drafts and legitimate local testing results. Importing a portable testing claim into another profile still requires human review, as before.

## Verification

- **13 new focused tests passed**, covering different map sizes, Roman labels beyond X, invalid/cross-map IDs, preserved legacy formats, native timeline import/editing, rename/reorder preservation, legacy map-specific migration, actual runtime handlers and managed-file portability.
- The managed integration case imported a two-stage RDX, recorded feedback, renamed/reordered the timeline, reopened its isolated SQLite profile, exported the file and imported it into another empty profile. Stage IDs/order and exact feedback were retained; the new profile did not trust imported testing claims.
- A broader **265-test regression run** initially passed 263 checks and exposed two legacy projection-shape comparisons. The compatibility path was corrected. Both failures passed targeted rechecks; the 211-record migration/publish-last/reopen/readback check passed in isolation. A subsequent **45-check focused run passed**, followed by the final **13-test suite including the added managed-file and desktop-bootstrap tests**. These sets overlap and must not be added as distinct tests.
- Actual workspace runtime handlers were exercised in an isolated VM, including map switching, stage restoration, Roman output and unstaged/all-stage filtering. The isolated preview HTTP tests passed. No browser/native-window visual pass or Windows installation is claimed.
- Syntax and diff checks passed for the reviewed source changes.

## Violet City source proof

The proof revalidated RI02B's exact extraction digest and reopened **six ROM source locators**. Violet City's scripts write scene variable **0x4074** to values **1, 2, 3 and 4**; its outdoor scene hooks explicitly check values **1 and 3**. A four-state map-local display was tested alongside an independent one-stage control. Renaming/reordering retained the same selected ID, annotations and plan, and changed the ordinal label to IV. The full ROM hash was unchanged.

These are **observed source states, not an approved complete gameplay timeline**. The initial/zero state and full chronology were not inferred. Independent flags, party choices, unknown native behavior and other predicates remain separate. RI02C must preserve that evidence and uncertainty when compiling the real map file; it remains the decisive actual RDX/YouTrack round-trip proof.

Only source code, documentation, synthetic tests and aggregate proof counts/hashes are backed up. The ROM, real extracted content and private working snapshots stay local. Installed production remains **0.5.15 plus U26B repairs**; local saves remain enabled, NPCDex cloud sync remains paused and the **133 preserved queue entries** were not accessed or changed.

Next: **RI02C — Compile and Prove the Real One-Map RDX, Sol / High**, requiring a new PASSKEY. The testbed remains Violet City.

