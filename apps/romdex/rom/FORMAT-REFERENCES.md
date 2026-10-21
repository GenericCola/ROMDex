# Format references and provenance

The implementation is new ROMDex JavaScript. No DSPRE executable, pret game source, ndspy implementation, SDK or game asset is bundled. The compact format table records opcode labels, operand widths and Western character encodings as interoperability facts. It does not contain dialogue, scripts, sprites or maps from the user's ROM.

References are pinned and used to interpret the binary; they are not a matching editable project and supply no input map content.

- pret/pokeheartgold revision `6988158691eb6178cff697cda0428045ddcba5fb`: [command format macros](https://github.com/pret/pokeheartgold/blob/6988158691eb6178cff697cda0428045ddcba5fb/asm/macros/script.inc), [message character encodings](https://github.com/pret/pokeheartgold/blob/6988158691eb6178cff697cda0428045ddcba5fb/tools/msgenc/charmap.txt), [script namespace and scene loading](https://github.com/pret/pokeheartgold/blob/6988158691eb6178cff697cda0428045ddcba5fb/src/script_manager.c), [message commands](https://github.com/pret/pokeheartgold/blob/6988158691eb6178cff697cda0428045ddcba5fb/src/field/scrcmd_message.c), [trainer message lookup](https://github.com/pret/pokeheartgold/blob/6988158691eb6178cff697cda0428045ddcba5fb/src/trainer_data.c), and [standard menu bank load](https://github.com/pret/pokeheartgold/blob/6988158691eb6178cff697cda0428045ddcba5fb/asm/overlay_01_021EDAFC.s).
- DSPRE revision `e751187b45d6ddf237a24dab8407a5a6cf0d36dd`: event/header/resource associations reviewed in RI02A. Its AGPL implementation has not been copied into the package.
- [ndspy texture format reference](https://github.com/RoadrunnerWMC/ndspy/blob/00165f177d03c6ca9e15e37decf54d9c6754bf54/ndspy/texture.py) and dictionary layout explain Nitro BTX/TEX0 fields. The GPL implementation is not vendored; the bounded parser and renderer are ROMDex code.

`format-tables.json` contains 848 fixed-width commands and 197 Western character mappings. Variable-width commands 465 and 489 are decoded explicitly by subcommand; unknown subcommands stop that range. Other native semantics remain separately flagged. Unsupported characters retain their numeric code rather than an invented replacement.

Reference file hashes used for the generated facts:

- script.inc: `584667df115d0db4a3912cdfd65c6cc0bd8b31d448397c74b48a321fdd689bfd`
- charmap.txt: `b7a0915068cdd58d226a918d1917f3487229d3856d35f69f5895cc4f166a88e8`
- generated JSON: `4cb7a7d27e97f392e772be14983cf025e6514e0c1a6026987d67755c863b2c91`

The exact supplied ROM also supplies independently reopened evidence: the 30-row script namespace table, standard-message-bank table, menu bank-load instructions, map headers, scripts, encrypted message ranges, palettes and texture frames. Public constants are never used to fill in missing ROM content. Support for another modified ROM requires a reviewed profile, not merely the same game code.

## Readable area labels

`public/hgss-area-names.mjs` records 540 `(header ID, internal code, symbolic label)` interoperability facts from the same pinned [maps.h](https://github.com/pret/pokeheartgold/blob/6988158691eb6178cff697cda0428045ddcba5fb/include/constants/maps.h). A label is used only when both the ROM's internal code and numeric header match. It supplies display hints, not missing map/dialogue/script content or proof of a modified building's purpose. Unknown or changed entries receive a review label. Current user names override these hints. Raw codes remain available under Source Details, and file contents/identities are unchanged by formatting the view.


## Source-derived entity presentation

`rom/presentation.mjs` uses fixed rules, never an AI service. Explicit leading dialogue-speaker labels and self-introductions can supply labels; source texture classes supply role hints; unnamed actors and interactions include a short attached dialogue cue. These are reviewable presentation hints, not new character identities or runtime-reachability claims. Shared graphics never merge records. Unsupported classes retain a neutral label. Original names, event IDs and naming basis remain in Source Evidence.

The actual supplied ROM frame sheets were inspected: ordinary 16-frame resources have a front-standing texture numbered `.5`; the reviewed `tsure_poke` eight-frame layout has front textures `.11`/`.12`. Texture names are lexicographically stored, so array order is not direction order. Select defaults only for recognized complete layouts with an unambiguous source palette. Multi-palette resources keep their ambiguity and expose labeled frame/palette choices. Custom overrides win. Presentation corrections are versioned descendants in the local prepared RDX with the exact previous document retained, so exports and NPCDex receive the same labels/images without changing immutable source evidence.

Role-reference facts were checked against the pinned [sprites.h](https://github.com/pret/pokeheartgold/blob/6988158691eb6178cff697cda0428045ddcba5fb/include/constants/sprites.h) and [global.fieldmap.h](https://github.com/pret/pokeheartgold/blob/6988158691eb6178cff697cda0428045ddcba5fb/include/constants/global.fieldmap.h). A reused sprite does not identify a named individual; for example, the same man graphic is used by both a photographer and another resident.


## Nested logical map groups (0.5.21)

A user-selected parent group produces one primary map. Child logical groups become subzone containers; source headers remain their child subzones; entities retain their original area parents. The map’s subzoneIds indexes every owned zone, while each nested subzone is explicitly indexed by its immediate parent’s optional subzoneIds. mapId always identifies the owning primary map. Existing flat maps remain valid. Nested files require org.romdex.npcdex.nested-zones-v1 so older readers cannot silently flatten them. Source manifests extend only under the same ROM/inventory with every previous binding retained. Independent prepared maps and already-imported NPCDex datasets require a separate migration review.
