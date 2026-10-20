# RI02C — Violet City ROM-to-RDX proof

Status: **Complete in source — October 20, 2026. Real ROM, local UI, YouTrack round trip, second-profile recovery and owned-record cleanup passed.**

The compiler reads the supplied `.nds` directly and produces one compressed `VioletCityMap.rdx`. It requires no source project, prepared agent JSON, old NPCDex dataset or AI. The test file contains Violet City's eight physical areas as subzones, 50 placed objects, 329 exact decoded texts and 354 deduplicated sprite PNGs. Sprout Tower remains outside this map.

The RDX is 1,001,582 bytes, representing 8,333,571 decoded bytes across 388 bounded entries. Its source index and sections reconstruct the accepted extraction digest exactly, including scripts, control-flow edges, predicates, movements, event data, message controls/raw tokens, trainer associations and all sprite/palette bindings. Native source mappings pin the ROM hash and exact source selections. Existing source identities are reused.

Local proof passed: exact-byte unpack/repack; import through the normal preview into an empty profile; both player-gender projections; local note, critical flag and proposed dialogue; unchanged recorded ROM dialogue; closure/reopening; and export/import into another empty profile preserving all original assets and source bytes. Human-testing obligations remain in place. A separate isolated Chromium session used the current desktop assets and confirmed the familiar import/contextual-edit controls, gender switch, Roman numeral stages and loaded sprites without browser errors. This is source UI proof, not an installed-build or in-game acceptance claim.

The real YouTrack proof passed using a unique dataset and marked private NPCD records. All 134 content records and the exact source/image artifacts published and read back. A deliberate native YouTrack title correction entered the normal review API and was accepted into the managed RDX. Local notes, the critical flag, proposed dialogue, every original source/image byte and all record identities survived. A second profile discovered the same backend tree and recovered the accepted correction without creating duplicates. The final portable RDX remains subject to human testing. All 135 temporary issues (134 records plus their registry) were ownership/private-visibility checked before removal and individually confirmed absent afterward.

The real map exposed repeated growing attachment listings and sequential metadata scans. The tested source correction reuses only byte-verified inventory entries, forces fresh cloud-commit discovery and checks metadata in bounded groups of eight, preserves durable byte-verification pins against fresh metadata and reserves enough cycle time for upload/readback before beginning each write; request/write limits and review gates are unchanged. Thirty-one delivery/recovery checks cover competing/missing commits, lost responses, stale review, bounded concurrency, ordered results and settling all started reads on failure. The controlled restart retained the durable isolated upload; production processes were untouched. A recovered read also exposed an uncleared old connection error; a successful clean cycle now clears that error while held review failures remain held. The completed proof and a final read-only preservation/status recheck used the corrected modules. Cold backend publication still involves 599 immutable objects / 604 data chunks plus a commit; broader performance acceptance remains pending.

The final standalone cleanup read every known test ID afresh: 127 were already absent, and eight surviving private records were ownership-verified, removed and confirmed absent. This completed cleanup without repeating map publication or changing production saves.

## Explicit limits

- Neutral labels such as `T22 · Object 0` identify source placements; character names and shared identities are not guessed from a sprite.
- Static possible branches/shared calls are not a guaranteed spoken sequence or an emulator result. Nineteen runtime-dependent text sites and native behavior remain explicit. Unassigned source text is retained as notes, rather than assigned to a character.
- Two objects have ambiguous palettes. Their alternatives are preserved; 48 objects have unambiguous default thumbnails. No palette is silently presented as the confirmed runtime choice.
- Four observed local scene-variable values have stable IDs and Roman numeral labels. Display order is not a verified complete gameplay chronology. Initial state and independent conditions remain review work, preserved under Other Conditions/source evidence.
- The CLI supports this reviewed ROM build and Violet City proof. The ROM Import workspace and broader/new-build coverage remain RI03A–RI03C.

All 56 distinct focused tests passed: 25 compiler/extraction/identity checks and a final combined run of 31 delivery/recovery checks. Seventeen JavaScript syntax checks also passed. The broad application suite was not repeated. Source and fictional fixtures may be backed up to the private development repository; the ROM, extracted text/images, generated RDX files, saved connections and private application Data remain excluded.

Installed production remains 0.5.15 plus its existing repairs. This task does not install a build, reset data, resume NPCDex cloud sync, alter the preserved production queue, authorize agent work or mark ROM changes tested. It uses the remembered credential only for the isolated proof.

Next: **RI03A — Review ROM Import workspace design, Sol / High**, with a separate PASSKEY. [Compiler guide](../../apps/romdex/rom/COMPILING-RDX.md). [Overall checklist](NPCDex-ROMDex-Action-Checklist.md).
