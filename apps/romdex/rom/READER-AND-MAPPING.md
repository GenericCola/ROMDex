# ROM reader and source mapping — RI02A foundation

Historical reader/mapping reference. Its proof counts describe RI02A; the current source adds RI02B extraction, documented in README.md. The active extraction testbed is now Violet City. Earlier New Bark proof data below remains historical evidence only.

Source-only developer foundation for the approved ROM Import workspace. Node 24 built-ins only; no editor installation, AI, source project, prepared map export, network or credential is needed. This does not install a desktop feature or compile/import/publish map content.

## Supported source

The validated profile is the supplied English HeartGold `0.6.3_noduplicates.nds`, SHA-256 `cb743eb01fe18f8599e54911faa28701474b84a6b9d9764a9478bf8a7be1babd`. `IPKE` alone does not establish compatibility: another hash is reported as an unreviewed build and cannot enter this profile's extraction route. Other games are unsupported. Future layouts/builds require explicit review and a validated profile rather than a name/offset guess.

The reader derives the 540 physical map-header count from this ROM's 16-byte internal-name catalog, validates its ARM9 table range/pointer evidence and all referenced archive indices, and reads actual event lists. The relocated sprite-table pointer is resolved through overlay 1 to verified owner overlay 131. Overlapping overlay RAM ranges are treated as ambiguous without an owner. Compressed ARM9/overlay decoding and alternate NARC byte orders are not supported by this version.

Input files are opened read-only. Work has file/read/count/depth/time bounds and cancellation checks. NARC ranges/section order, filename paths, event sizes, resource hashes and source changes are checked. No method writes, patches, repacks or executes a ROM.

## Local CLI

Run from the application source root, using a fresh scratch directory and output names. These commands refuse to replace existing output files, including a path to the input ROM.

```powershell
node rom/cli.mjs inspect "PATH_TO_ROM.nds" scratch-rom-inspection.json
node rom/cli.mjs inventory "PATH_TO_ROM.nds" scratch-rom-inventory.json
node rom/cli.mjs identities scratch-rom-inventory.json scratch-new-bark-identities.json --headers=60,61,62,63,64,65,66,384
node rom/cli.mjs identities scratch-rom-inventory.json scratch-reopened-identities.json --previous=scratch-new-bark-identities.json
node rom/cli.mjs identity-preview newer-inventory.json scratch-identity-review.json scratch-new-bark-identities.json
```

`inspect` reports the fingerprint/support state; it can describe an unreviewed input without authorizing extraction. `inventory` requires a known profile. New Bark's eight physical headers are sub-zones of the single logical map approved in RI01. These JSON files are internal source inventories/identity evidence, **not multi-map RDX saves** or NPCDex's user import format. RI02C will assemble one logical map per RDX.

The inventory currently covers 2,667 overworld placements, 1,034 background events, 1,317 warp entries and 195 trigger entries across the catalog. These are placement counts, not unique named-character counts. It reports six duplicate local-object IDs and nine unresolved warp destinations (4095/256); it does not guess their semantics. New Bark's selected areas have none of those warnings. Establishing identities for selected areas with duplicate local-object IDs is blocked even if someone strips the warning list from the JSON.

## Portable identities and locators

`ROMDexSourceInventory/1` contains deterministic, hash-pinned source structure and explicit coverage flags. `ROMDexROMIdentityManifest/1` allocates project/source-unit identities once, scoped to selected headers. These UUID-based identities are separate from filenames, indices, coordinates, names and ROM hashes. Reopening the same source preserves the exact project, IDs and manifest digest. A newer ROM produces review candidates; the API does not automatically reassign identities, delete missing entries, archive records or discard plans/history. Reviewed cross-build reconciliation remains later work.

Each locator uses the existing native `{kind, adapter, path, fileSha256, selectors}` shape, adapter `org.romdex.hgss-nds/1`. Paths refer to internal ROM resources or virtual `__rom__/arm9.bin` / `__rom__/overlay/N.bin` resources, never host paths or executable plugins. Selectors identify exact resource/member/span hashes. Resolving one requires the full source ROM hash, verifies file/span bytes, and for known map/event locators verifies the declared header/event bank and row as well.

Use `createNativeMappingSession(inventory, identities)` once per selected batch, then `.mapping(sourceKey, {workspaceId, ...})`. The session verifies the baseline and snapshots only selected identities/locators; it does not repeatedly hash the entire catalog for every object or trust later caller mutation. One-off `nativeMapping(...)` is also available. Output is an existing, sealed `NPCDexROMMapping/1` artifact with `documented` provenance. It is not an execution authorization or human gameplay verification.

The full ROM catalog is diagnostic source metadata. Future portable map documents include only their selected content, required dependencies and scoped identity context; the ROM itself is not an RDX asset.

## Verification and remaining work

Seventeen focused synthetic tests cover read-only access, malformed bounds/paths/archives, cancellation, source mutation, unknown builds, locators, native-contract compatibility, durable/scoped identities and refused overwrites. Real-ROM checks independently resolved 617 locators (540 headers plus 77 New Bark source units), reproduced the inventory digest, reopened identities in another process and verified unchanged before/after ROM hashes with zero network requests.

No dialogue/script semantics, image rendering, timeline derivation, RDX compilation, UI import or YouTrack publication is claimed here. Those remain RI02B, RI02T and RI02C. UI and wider coverage/build comparison are RI03A–RI03C. Current production saves, queue and explicit NPCDex sync pause are untouched.

Format references reviewed in RI01: [DSPRE RomInfo/event structures](https://github.com/DS-Pokemon-Rom-Editor/DSPRE/tree/e751187b45d6ddf237a24dab8407a5a6cf0d36dd), [pret/pokeheartgold map headers](https://github.com/pret/pokeheartgold/blob/6988158691eb6178cff697cda0428045ddcba5fb/include/map_header.h), and [ndspy container documentation](https://ndspy.readthedocs.io/en/stable/api/narc.html). This RI02A implementation vendors no editor executable or third-party decoder code.
