# ROM-only HGSS extraction

Source implementation for RI02A and RI02B. The [reader/mapping reference](READER-AND-MAPPING.md) preserves its CLI, locator and identity contracts. It is not wired into the installed application yet. RI02T provides map-specific timeline integration; RI02C compiles and proves the actual one-map RDX.

`node rom/cli.mjs extract INPUT.nds NEW_OUTPUT_DIRECTORY`

The current reviewed build is identified by its full SHA-256, not just its IPKE game code. The active testbed is Violet City: location section 128 and physical headers 73, 135, 157, 158, 159, 160, 162 and 167. Sprout Tower is a separate map identity. Nothing reads the old NPCDex seed, browser saves, production Data, a source project or prepared agent JSON.

The new directory contains `VioletCity.extraction.json` and content-addressed `assets/*.png`. Existing output directories and input files are never overwritten. Retrying an incomplete export requires a new directory; incomplete directories remain available for inspection.

Use `--previous-identities=MANIFEST.json` to reuse an earlier extraction's `identities` object for the same pinned ROM and map scope. A changed ROM needs the separate identity-review path. Labels, source indices and hashes do not independently authorize rebinding existing NPCDex records.

The output preserves physical areas/events, scene/load hooks, shared-script namespaces, control-flow graphs, message controls and gender alternatives, concrete flag/variable predicates, mutations, movement lists, trainer-message associations and exact source locators. Local bank text is retained separately from referenced prompts; the huge generic bank is not indiscriminately attached to this map.

`timeline.milestoneCandidates` includes map-local persistent checks, scene predicates and placed-object visibility flags. These are evidence for RI02T, not an invented chronological sequence. Independent/reversible conditions cannot be sorted into stages using their numeric IDs. Roman numerals will be display labels, separate from stable stage identities.

Coverage is static and explicit. Reaching an instruction through a possible branch does not prove in-game reachability. Dynamic phone, gift and trainer-message selection sites retain their operands/call context. Trainer tables supply associated text candidates. Native service/battle/password/gym behavior is not emulated or counted as understood. Multiple palette variants are exported without guessing the runtime choice. The current testbed contains no variable sprite IDs; the reader identifies those IDs and preserves their graphics-variable dependency instead of substituting a stock sprite.

Source texture frames use the ROM palette and transparency, with RGB555 channels expanded to 8-bit by bit replication. PNG encoding uses bundled Node zlib; it needs no image service or Python runtime. All script/message/asset reads are bounded and source-pinned.

Run the three focused suites: `node --test tests/rom-reader.test.mjs tests/rom-identities.test.mjs tests/rom-extraction.test.mjs`.

ROM bytes, extracted text/images and private identity manifests remain local and are excluded from source backups. Only aggregate proof counts/hashes and synthetic fixtures belong in the repository.
