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
