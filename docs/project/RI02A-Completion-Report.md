# RI02A — ROM Reader and Source Mapping

Completed in source under the RI02A PASSKEY. The installed application remains unchanged.

The new bounded reader opens the supplied ROM read-only, fingerprints it, reads its actual filesystem/NARC tables, derives the physical-map catalog and inventories headers, events, warps and relocated sprite metadata. It accepts only the validated supplied-build profile; a matching game code or filename never silently enables another modified build. No editable source project, prepared agent JSON, AI runtime, downloaded executable or credential is used.

Source mappings carry the full ROM hash, resource hashes and exact selected byte ranges, and validate against the existing native NPCDexROMMapping/1 contract. The resolver rejects stale bytes and mislabeled map/event selectors. A map-scoped identity manifest preserves UUID-based identities on reopening; changed builds and missing rows require review. Duplicate local-object IDs block initial identity establishment rather than being merged or silently corrected.

## Verification

- All **17 focused tests passed**. A final six-test identity recheck also passed after tightening duplicate detection; these are overlapping checks, not 23 distinct tests. Tests include malformed bounds/archives/paths, cancellation/source mutation, unknown builds, overlay ambiguity, exact locator/native-contract compatibility, scoped identity preservation and output-overwrite refusal.
- The actual ROM yielded **540 physical map headers**, **2,667 overworld placements**, **1,034 background events**, **1,317 warps** and **195 triggers**. New Bark's eight approved areas contain 24 overworld placements and 77 structural source units including their area headers/other event types.
- The real-ROM proof **independently resolved 617 locators**, reproduced the source inventory digest and preserved exact identities through a separate Node process. ROM hashes before/after match; network requests were zero.
- Six duplicate local-object IDs and nine unresolved warp references elsewhere in the catalog are retained as warnings. New Bark's scope has neither warning. These do not establish named characters, complete runtime behavior or gameplay correctness.
- A measured repeated-validation bottleneck was removed by a pinned mapping session. The same proof's observed elapsed time changed from 33,566 ms to 5,265 ms. These are local end-to-end observations, not a hardware-independent performance guarantee.
- Syntax was checked for the declared new JavaScript files. No unrelated application regression suite, browser test, Windows helper or live cloud check was needed for this source-only reader.

## Preservation and release limits

No ROM bytes, decoded dialogue, private source inventories, identity bindings, application Data or credentials are included in the Git backup. The backed-up real proof contains counts/hashes and check outcomes only; synthetic tests contain no user/retail ROM payload. Full inspection products remain in task scratch, outside application storage.

No installed files, three working maps, 133 preserved NPCDex queue entries or the explicit sync pause were changed. No RDX was compiled/imported, no record was published, no production reset occurred and no installer was built. The CLI's source JSON is diagnostic intermediate data, not a multi-map RDX or a new end-user import requirement.

Initial support is deliberately the exact inspected build/layout. Compressed/alternate layouts and unreviewed newer builds fail closed. Cross-build identity review is a preview only. Dialogue/shared-script interpretation and sprites remain RI02B; per-map Roman-numeral timelines remain RI02T; the decisive actual RDX/local/native round trip remains RI02C. This task alone does not replace the other agent's complete extraction work.

Next: **RI02B — Dialogue, Events and Appearance Extraction, Sol / High**, after a new PASSKEY.
