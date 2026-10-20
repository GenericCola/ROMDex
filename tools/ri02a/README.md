# RI02A source-reader verification

Use Node 24 from the repository root. Create work/ri02a/tmp and set ROMDEX_TEST_SCRATCH to its absolute path for node --test apps/romdex/tests/rom-reader.test.mjs apps/romdex/tests/rom-identities.test.mjs. The fixtures are synthetic and need no ROM.

For the optional actual-source proof, supply the reviewed 0.6.3 ROM locally, then run node apps/romdex/rom/cli.mjs inventory INPUT.nds work/ri02a/source-inventory.json. Set ROMDEX_PROOF_OUTPUT to a new directory and run node tools/ri02a/verify-real-rom.mjs INPUT.nds. It uses no network/credentials or live Data. Output identity/structure files stay local; do not commit ROMs, full inventories, identity bindings or decoded content. Existing output names are intentionally refused. Archived evidence contains only hashes/counts and outcomes.

The full real proof was rerun only to repair a native-schema evidence field and remove demonstrated repeated validation. Final evidence: 17 distinct tests, six overlapping identity rechecks, eight real source proof checks and ten syntax checks. No unrelated application suite, browser/Electron process or live cloud proof was run. RI02B/RI02T/RI02C remain separate.
