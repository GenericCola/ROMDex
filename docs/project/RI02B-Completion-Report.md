# RI02B — Violet City Dialogue, Events and Appearance Extraction

Completed in source under the RI02B PASSKEY. The user changed the active testbed to **Violet City** to avoid conflating the proof with existing NPCDex data. The installed application has not changed.

The extractor reads the supplied `.nds` alone and produces a source-pinned JSON intermediate plus actual PNG sprite frames. It uses neither an editable game project, existing NPCDex content, prepared agent JSON nor an AI runtime. Violet City's ROM location section 128 identifies physical headers **73, 135, 157, 158, 159, 160, 162 and 167**. Sprout Tower has a separate location identity and remains outside this logical map.

## What is implemented

- Bounded message decoding with exact encrypted ranges, controls, substitutions, newline/page boundaries, gender alternatives and explicit unknown-character tokens; packed 9-bit trainer names are supported.
- Local entry points, scene/load hooks and recursively referenced shared scripts. The shared namespace and menu/message-bank metadata are read from this ROM's ARM9/overlay, not filled with stock map content.
- Control-flow graphs, local calls/continuations, concrete flag/variable predicates, mutations and movement data. Conservative state propagation resolves constant external/menu references and discards unsafe knowledge across calls or conflicting branches.
- Trainer-message table associations for trainer IDs 20, 29 and 50, linked to their object/battle contexts. Their associated message candidates are separate from proof of which branch plays in-game.
- Actual Nitro BTX texture/palette rendering, transparency and RGB555 bit expansion; content-addressed PNG output. All frame/palette variants are retained when the runtime palette is ambiguous.
- Map-local timeline evidence: persistent checks, scene predicates and visibility flags. These **31 candidates are not 31 stages**. Ordering, stage identities and Roman-numeral UI integration remain RI02T; no global ten-stage timeline was imposed.

## Verification

All **32 focused tests passed**: the prior 17 reader/identity checks plus 15 extraction checks. They cover malformed messages/controls, compression across the final sentinel, relative pointers, overlapping branches, variable-length commands, scene hooks, shared namespaces, variable sprites, conservative state joins/call boundaries, palette pixels and independently inflated PNG bytes. Syntax checks passed for the declared JavaScript modules/tests. No unrelated broad regression, browser pass, Windows helper or cloud test was required.

The final real-ROM proof ran through the source CLI and reopened in a separate process. It recorded:

| Evidence | Result |
| --- | --- |
| Violet City areas | 8 |
| Placed objects / backgrounds / warps / triggers | 50 / 13 / 19 / 2 |
| Local entry points / local-and-shared flows | 48 / 89 |
| Decoded text entries | 329, including local unassigned text and referenced shared/menu/trainer candidates; not 329 asserted spoken prompts |
| Unknown instruction-width ranges | 0 |
| Objects with rendered source frames | 50 of 50 |
| Unique PNGs / frame-palette bindings checked | 354 / 790 |
| Distinct exact source locators independently reopened | 5,140 |
| Compressed trainer-name entries additionally decoded | 738 |
| Same-source structural identities | Reused exactly |
| Existing output overwrite | Refused |
| Full ROM hash before/after | Identical |
| Cloud / production Data access | None |

The actual rendered sprites were visually reviewed in a local contact sheet. First source frames can face away from the viewer; all available frames remain attached, with the original orientation retained. No invented stock sprite is used.

## Explicit limits

Static branch coverage is not gameplay verification. **19 message sites require runtime/caller selection**: eight trainer-message sites have separately linked trainer-table candidates; the others involve phone, gift or variable text state. Their operands, source locations and call contexts remain inspectable. **58 native command kinds** retain explicit unimplemented behavior, including gym, service, password and battle operations; zero unknown byte widths does not mean those native effects were emulated. Two placed objects have multiple palette candidates; no default runtime choice was guessed. Script restarts preserve their invoking context rather than being flattened incorrectly.

Violet City contains no variable sprite IDs. The format reader identifies IDs 101–117 as graphics-variable references and tests that behavior synthetically; this task does not claim a real Violet City dynamic-sprite case. Unsupported texture formats remain explicit; this testbed's actual textures rendered successfully.

These limits are retained in the machine-readable extraction. RI02C must preserve them in the RDX preview instead of presenting unresolved content as verified. RI02C's actual RDX/local/YouTrack round trip is still the decisive proof that this can replace the other agent's extraction pipeline.

## Preservation and next step

The output is one map's **intermediate extraction**, not a multi-map RDX and not a production import. Source mappings are pinned to ROM SHA-256 `cb743eb01fe18f8599e54911faa28701474b84a6b9d9764a9478bf8a7be1babd`. No installed file, managed map, application Data, 133 queued entries, remembered credential or NPCDex-only sync pause was changed. No installer was built and no records were published.

Source backups include code, synthetic tests, documentation and aggregate counts/hashes only. The ROM, decoded dialogue/images and private identity bindings remain local under task scratch.

Next: **RI02T — Map-Specific Timelines and Roman-Numeral Stages, Sol / High**, requiring a new PASSKEY. Continue using Violet City for RI02T and RI02C.

