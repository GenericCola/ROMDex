# MX02 — Branch, Presence and Condition Extraction

**Complete in source, October 21, 2026.** MX03 integration follows under the owner's already supplied PASSKEY. Installed 0.5.26, production Data, YouTrack and credentials remain unchanged.

The extractor now traces bound events and map scene/load hooks through local and shared calls. It retains taken/negative guards, placement visibility, persistent-variable comparisons, gender/weekday checks and show/hide targets. Called code must return before its continuation; shared contexts retain caller guards and shared variables without inheriting an unrelated comparison result. Uninitialized scratch values, dynamic text, opaque native commands, concurrent scheduling, loops and bounded paths remain explicitly unresolved.

Pure writes and unrelated shared-bank/unbound entries do not become map condition entries. Conditions/effects retain stable semantic IDs and exact deduplicated source evidence, with independently checked extraction digests. Source evidence is interned to avoid repeating full locators at every branch. Processing has cancellation, per-root/global path limits and progress reporting. Limits do not silently convert incomplete paths into understood content.

## ROM-only proof

The supplied `0.6.3_noduplicates.nds` was opened read-only; SHA-256 remained `cb743eb01fe18f8599e54911faa28701474b84a6b9d9764a9478bf8a7be1babd`. No editable source or external agent JSON supplied map content.

| Map | Included source headers | Known conditions | Unresolved condition findings | Bound roots: complete / partial | Dialogue effects | Excluded unbound roots |
| --- | --- | --- | --- | --- | --- | --- |
| New Bark Town | 60–66, 384 | 46 | 166 | 36 / 30 | 196 | 52 |
| Route 29 | 33, 134 | 8 | 74 | 7 / 11 | 47 | 12 |

These are source checks/effects, not story milestone counts or proof of in-game runtime reachability. Known lists differ independently; unresolved checks are not intended as hundreds of Timeline buttons. MX03 must keep them directly reachable in an unresolved inspection view. Labels retain raw IDs where ROM meaning has not been established; no narrative event names are invented.

The final tracer was replayed against the exact source-pinned graphs after refinements, with the original ROM fingerprint rechecked. Unchanged sprite/message decoding was not repeated. Source graphs and decoded text stay in local work evidence; they are excluded from development backups/release fixtures.

## Verification and limits

35 focused checks pass: 20 new condition cases plus 15 adjacent extraction cases. Tests cover the six VM comparison codes, negative/compound guards, local/shared/conditional calls, writes, source exclusions, visibility, gender/weekday, dynamic text, source producer evidence, scratch variables, loop/call budgets, three-valued unknown behavior, evidence integrity and cancellation. [Verification summary](MX02-Verification.json).

The VM comparison/call facts were checked against the existing pinned pret reference and the primary [script-command implementation](https://github.com/pret/pokeheartgold/blob/master/src/scrcmd_c.c); map content still comes only from the supplied ROM. ROMDex JavaScript is newly authored; no game implementation or ROM asset is added to the repository.

This does not finish native opcode emulation, human labeling of every flag, condition UI/RDX transport, location rendering, a production migration or an installer. Partial coverage is explicit and stays inspectable. MX03 owns format/UI/sync integration; LP01 and later tasks retain their approved scopes.
