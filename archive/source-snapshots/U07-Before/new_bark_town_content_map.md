# New Bark Town — content map (dialogue, event scripts, triggers, access conditions)

Scope: Pokémon HeartGold ROM hack, working ROM `~/pokehg/working/heartgold.nds` (HeartGold US, game code IPKE, rev 0, English), as extracted by DSPRE/dspre-mcp. Static, read-only inspection. Global routines and prompts called from here are documented in `global_dialogue_event_map.md` and referenced by `GLB-` id; they are not repeated here.

## Conventions

### NEW change status values
- `UNDECIDED` — no decision has been supplied for this record.
- `KEEP` — keep the OLD content as is.
- `MODIFY` — keep the record but change part of it (text, condition, sequence).
- `REPLACE` — replace the record's content wholesale.
- `REMOVE` — remove the content.

`UNSET` in a NEW field means no decision has been supplied. It never means deletion.

### Record id scheme (stable; never renumber)
- `NBT-EVT-<hhh>-<nn>` — an event entry point on map header `<hhh>` (three digits). `<nn>` follows the script index within that map's script file where the entry is a script (`NBT-EVT-060-07` = script 7 of header 60's script file); level-script records use `NBT-EVT-<hhh>-LS`; event-file entries that run no map script (ground items, global-routine signs) use `NBT-EVT-<hhh>-O<idx>` (overworld), `-S<idx>` (spawnable), `-T<idx>` (trigger) or `-W<idx>` (warp; recorded where a section documents warps as entry points).
- `NBT-DLG-<hhh>-<nn><letter>` — one dialogue variant used by event `NBT-EVT-<hhh>-<nn>`, lettered in order of first use (a, b, c…).
- `GLB-…` — global records, defined in `global_dialogue_event_map.md`.

### Evidence status
- `Verified` — read directly from the ROM data through dspre-mcp or from the disassembly of the working ROM.
- `Inferred` — concluded from verified data, not directly stated by it.
- `Unresolved` — could not be established.

### Reachability classes
Referenced and apparently reachable / Referenced with unresolved reachability / Apparently unused.

## Source and how it connects

### What was supplied and inspected
- **Working ROM (the hack as it stands):** `~/pokehg/working/heartgold.nds`. `get_rom_info` / `open_rom`: game HeartGold (US), family HGSS, language English, game code IPKE, title `POKEMON HG`, ROM version 0, dspre-mcp `validated: true`. The extraction reused is `~/pokehg/working/heartgold_DSPRE_contents/` (40 data types present, none missing).
- **Pristine original:** `rom/original/` (not opened; not modified).
- **Modifications (verifiable):** the dspre-mcp journal (`list_changes`) holds 34 edits (31 `set_script`, 3 `set_text`: entries 4, 16, 21). Within New Bark Town only script file 843 (header 61) was edited: journal entries 17 (`GiveItem ITEM_RARE_CANDY 1 0x800C` added at Script#13), 30, 32 and 34 (whole-file rewrites; 34 is the build 0.5.11 PORYGIFT change, calling `CommonScript 2081`) and 31 (edits in Function#45). No New Bark Town event file, header, text archive, level script or ROM table was edited through the journal. The other journalled script/text edits (script files 92, 141, 145, 146, 163, 222, 225, 227, 228, 891, 903; text archives 115, 373) are outside the New Bark Town file set (Inferred non-NBT: their ids are not among the NBT ids listed below; 141 and 145 are the global ground-item and hidden-item handlers, see the global document).
- **hg-engine layer:** the client builds additionally run hg-engine (`~/Programming/hg-engine`), which at build time regenerates script archive entry 3 (common script; source `armips/scr_seq/scr_seq_00003_commonscript.s`, 82 scripts, adding ids 2072-2081) and entry 953 (trainer script; source `armips/scr_seq/scr_seq_00953_trainerscript.s`). Those overrides exist only in the built `.nds`; this document records the working ROM as the OLD baseline and notes the override wherever a New Bark Town event depends on it. hg-engine also owns trainer/encounter/species data, which is not documented here.
- **New-game tables:** `get_rom_table spawn` = map header 64, global (6,6), facing Down, money 3000. `get_rom_table starters` = Chikorita (152), Cyndaquil (155), Totodile (158), held item none.
- **Disassembly:** `project/scripts/NNNN.script` (497 files, file number = script archive index, pulled from the working ROM 2026-10-08). Spot-checked against live `get_script` (see each map section and Verification performed). Level scripts have no text disassembly; they were read with `get_script` (structured trigger lists).

### How the data connects (New Bark Town)
Map header → matrix (geometry) + event file (signs, NPCs, warps, triggers) + script file (event logic) + level script (map-entry/var-watch triggers) + text archive (the messages script commands print by index).

New Bark Town is the set of map headers whose location name is id 126 "New Bark Town" (verified by listing every map header with `get_world_data mapHeader`); it is closed under warps (no warp in the set leads outside it).

| Header | Internal name | Matrix (map file) | Event file | Script file | Level script | Text archive | Spawnables/Overworlds/Warps/Triggers |
|---|---|---|---|---|---|---|---|
| 60 | T20 (exterior) | 0 "map", cell (21,12), map file 0 | 57 | 842 | 615 | 542 | 5/10/5/4 |
| 61 | T20R0101 | 100 "m_labo01_" (244) | 58 | 843 | 616 | 543 | 11/4/1/2 |
| 62 | T20R0102 | 101 "m_labo02_" (257) | 59 | 844 | 617 | 544 | 0/2/1/0 |
| 63 | T20R0201 | 71 "m_hh0101_" (216) | 60 | 845 | 618 | 545 | 5/1/2/0 |
| 64 | T20R0202 | 72 "m_hh0102_" (217) | 61 | 846 | 619 | 546 | 2/3/1/0 |
| 65 | T20R0301 | 66 "m_h01_" (212) | 62 | 847 | 620 | 547 | 0/1/1/0 |
| 66 | T20R0401 | 71 "m_hh0101_" (216) | 63 | 848 | 621 | 548 | 0/1/2/0 |
| 384 | T20R0402 | 72 "m_hh0102_" (217) | 341 | 849 | 622 | 549 | 2/2/1/0 |

Header 60: wild encounter file 0, weather 0, header flags 123, music 1018 day/night. Interiors: wild 255 (none), weather 0, flags 114, music 1018 (header 61: 1066). Matrices 71 and 72 are each shared by two headers (63/66 and 64/384), which reuse the same map geometry.

**Warps (from header, warp index, tile → destination header, anchor):** 60/0 (684,393) → 61/0; 60/1 (695,396) → 63/0; 60/2 (679,405) → 65/0; 60/3 (690,407) → 66/0; 60/4 (688,392) → 62/0; 61/0 → 60/0; 62/0 → 60/4; 63/0 → 60/1; 63/1 → 64/0; 64/0 → 63/1; 65/0 → 60/2; 66/0 → 60/3; 66/1 → 384/0; 384/0 → 66/1.

**Exits:** none by warp. The exterior connects by walking across matrix cell edges: west to Route 29 (header 33, cells (20,12),(19,12)), east to Route 27 (header 31, cells (22,12)-(24,12)). North/south cells hold map file 208 with header 0; not walkable connections as far as inspected. Route 29, Route 27 and other maps are referenced here only as dependencies.

**Global content:** calls to the common script (`CommonScript <id>`), ground-item, hidden-item and trainer handlers are documented in `global_dialogue_event_map.md` and referenced as `GLB-RTN-…` / `GLB-PRM-…`.

### Dependency references (outside New Bark Town)

Resolution method (Verified): each script file id was matched to the map headers whose `scriptFileId` field equals it, read from the header table in `arm9.bin` (24-byte records, scriptFileId at record byte 6; cross-checked against `get_world_data {kind: mapHeader}` for headers 9, 21, 453 and the New Bark Town headers 60/61 → files 842/843). Location names are the header's `locationName`. Writes are "as cited in this document"; the table does not read other maps' dialogue. NBT script files: 842 = header 60, 843 = 61, 844 = 62, 845 = 63, 846 = 64, 847 = 65, 848 = 66, 849 = 384.

| Script file | Map header(s) | Location / kind | NBT flags/vars it writes (as cited here) |
|---|---|---|---|
| 0005 | 106 (D01R0101) | DIGLETT's Cave | flag 393 set/clear; var 0x4003 (temp) |
| 0007 | 107 (D02R0101) | Mt. Moon | var 0x40FC = 1 |
| 0013 | 453 (D11R0102) | Seafoam Islands | flag 638 set/clear |
| 0015 | 457 (D11R0106) | Seafoam Islands | var 0x416F (other values) |
| 0019 | 111 (D17R0101) | Bell Tower | reads flag 264 only |
| 0021 | 340 (D17R0109) | Bell Tower | flags 417, 418, 744, 264 set; var 0x4081 = 3; var 0x4003 (temp); clears flag 741 |
| 0022 | 6 (D17R1101) | Bellchime Trail | flag 393 |
| 0024 | 217 (D18R0102) | Burned Tower | var 0x4079 |
| 0025 | 96 (D22R0101) | National Park | flag 638 set/clear |
| 0037 | 113 (D24R0101) | Ruins of Alph | flag 638 set/clear |
| 0048 | 323 (D24R0211) | Ruins of Alph | flags 393, 638 |
| 0054 | 491 (D24R0217) | Ruins of Alph | flags 393, 638 |
| 0059 | 114 (D26R0101) | SLOWPOKE Well | flag 638 set/clear |
| 0065 | 224 (D27R0106) | Lighthouse | flag 638 set/clear |
| 0069 | 265 (D31R0201) | Battle Tower | var 0x4003 (temp); `SetVar 0x8004 86` (line 692) |
| 0076 | 272 (D32) | Battle Frontier | flag 638 set/clear |
| 0081 | 411 (D32R0102) | Frontier Access | flag 638 set/clear |
| 0085 | 276 (D32R0401) | Battle Hall | var 0x4003 (temp) |
| 0087 | 278 (D32R0601) | Battle Arcade | var 0x4003 (temp) |
| 0092 | 117 (D36R0101) | Ilex Forest | flag 638 set/clear |
| 0099 | 121 (D40R0101) | Whirl Islands | flag 638 set/clear |
| 0103 | 243 (D40R0104) | Whirl Islands | var 0x4003 (temp); reads flag 265 |
| 0104 | 244 (D40R0107) | Whirl Islands | flags 417, 418, 744, 265 set; var 0x4081 = 3; clears flag 741 |
| 0105 | 122 (D41R0101) | Mt. Silver Cave | flag 638 set/clear |
| 0107 | 465 (D41R0108) | Mt. Silver Cave | var 0x416F (other values) |
| 0111 | 253 (D44R0102) | Dragon's Den | var 0x40FC = 2 |
| 0112 | 288 (D44R0103) | Dragon's Den | flag 638; var 0x4081 = 1 (lines 277/294); flag 422 cleared; flag 741 set; var 0x4108 = 8; vars 0x407B, 0x416F |
| 0116 | 174 (D47) | Safari Zone Gate | flag 638 set/clear |
| 0119 | 173 (D47R0101) | Safari Zone Gate | var 0x4003 (temp) |
| 0122 | 280 (D49) | Pokéathlon Dome | flag 638 set/clear |
| 0149 | none | Not a map script file (no header uses it): one `Script 1` of consecutive `SetFlag` lines (hide flags) ending `End`; how it is invoked is Unresolved | flags 404, 409, 413, 418, 420, 421, 422, 417, 744, 678 set |
| 0168 | 9 (R01) | Route 1 | flag 638 set/clear |
| 0199 | 20 (R12) | Route 12 | flag 638 |
| 0225 | 33 (R29) | Route 29 | flags 420/421 set; var 0x408B = 0 |
| 0227 | 34 (R30) | Route 30 | var 0x4095 = 0 |
| 0229 | 143 (R30R0201) | Route 30 (interior) | flag 400 set (line 210); flag 413 cleared; var 0x4108 = 3; var 0x4107 = 1 |
| 0237 | 38 (R34) | Route 34 | flag 638 |
| 0249 | 43 (R39) | Route 39 | flag 638 |
| 0261 | 152 (R48) | Route 48 | flag 638 |
| 0735 | 49 (T01) | Pallet Town | flag 638 |
| 0743, 0752, 0760, 0778, 0786, 0809, 0829 | 496, 473, 427, 365, 395, 480, 410 | Viridian / Pewter / Cerulean / Vermilion / Celadon / Fuchsia / Saffron Gym interiors (T02GYM0101, T03GYM0101, T04GYM0101, T06GYM0101, T07GYM0101, T08GYM0101, T11GYM0101) | var 0x416F (other values) |
| 0824 | 305 (T10R0601) | Pokémon League | var 0x416F (other values) |
| 0825 | 306 (T10R0701) | Pokémon League | var 0x4106 = 3 (line 41) |
| 0869, 0877, 0886, 0913, 0922, 0932 | 180, 139, 137, 138, 80, 140 | Azalea Gym 2 (T23GYM0102), Cianwood Gym (T24GYM0101), Goldenrod Gym (T25GYM0101), Olivine Gym (T26GYM0101), Ecruteak Gym (T27GYM0101), Mahogany Gym (T28GYM0101) | var 0x416F (other values); 0922 also var 0x4079 |
| 0850 | 67 (T21) | Cherrygrove City | flag 153 set |
| 0851 | 68 (T21FS0101) | Cherrygrove City (interior) | reads var 0x4108 |
| 0852 | 69 (T21PC0101) | Cherrygrove City (Pokémon Center) | reads var 0x4108 |
| 0857 | 73 (T22) | Violet City | flag 582 set |
| 0858 | 157 (T22FS0101) | Violet City (interior) | flag 582 cleared; var 0x4108 = 7 |
| 0859 | 135 (T22GYM0101) | Violet City Gym | flag 115 set/read; flag 741 cleared; var 0x4108 = 6 |
| 0920 | 78 (T27) | Ecruteak City | var 0x4079 |
| 0926, 0928 | 83 (T27R0201), 86 (T27R0501) | Ecruteak City (interiors) | read flags 264 (0926, 0928) and 265 (0928) only |
| 0941 | 89 (T30) | Blackthorn City | var 0x407B |

Flags with no script writer outside script file 843 (cross-checked against `/home/ubuntu/Programming/hg-engine/armips/include/flags.s`; no writer is claimed): 2404 = `FLAG_GAME_CLEAR` (the hg-engine tree reads it at `scr_seq_00003_commonscript.s` line 1420/1421; the name says "game clear"; setter not found); 2435 = `FLAG_UNK_983` (placeholder name, nothing more known); 401 = `FLAG_HIDE_ELMS_LAB_ELM`; 114 = `FLAG_UNK_072`; 242 = `FLAG_UNK_0F2`; 282 = `FLAG_GOT_EVERSTONE_FROM_ELM`; 352 = `FLAG_ELMS_LAB_PREVENT_PLAYER_ESCAPE`; 406 = `FLAG_HIDE_ROUTE_30_BATTLERS`; 571 = `FLAG_UNK_23B`. Correction (independent re-check 2026-10-12): 114, 242, 282, 352, 406 and 571 ARE written by script file 843 itself (`SetFlag`/`ClearFlag` found by grep of `project/scripts/0843.script`; no other script file writes them, as the 843 flag table says); only 401, 2404 and 2435 have no `SetFlag`/`ClearFlag` in any of the 497 script files. For these, the only possible writers outside the searched script files are level scripts, other maps' event-file flags, or engine code not found by grep (Unresolved); hg-engine's own sources (`src`, `include`, `armips`, `data`) contain no use of the names except 2404 above.

## Index

One row per record (`#### NBT-…` heading), in document order: 293 records. "Map" is the map header number. In the Related IDs column the `NBT-` prefix is dropped and a trailing "…" means the record's own field lists more.

| Record ID | Record type | Map/system | Speaker/object | Trigger | OLD availability | Source | Related IDs |
|---|---|---|---|---|---|---|---|
| NBT-EVT-060-01 | Event | 60 exterior | rival-type NPC, ow0 (owID 0) | talk | flag 400 clear | 842 S#1; ev57 ow0; 542 m13,14 | DLG-060-01a/b; EVT-060-S4 |
| NBT-EVT-060-02 | Event | 60 exterior | NPC ow1 (owID 1) | talk | always; text by var 0x4072 / 0x407E | 842 S#2; ev57 ow1; 542 m9,5,0,6,7 | DLG-060-02a-e; EVT-060-03 |
| NBT-EVT-060-03 | Event | 60 exterior | step trigger col x676 + owID 1 + owID 5 | step trigger 0; var 0x407E=0 | var 0x407E clear; branch by flag 156 / var 0x4072 | 842 S#3 + many F; ev57 trig0; 542 m1-4,10,11,17-20 | DLG-060-03a-j; EVT-060-02, O5, W0 |
| NBT-EVT-060-04 | Event | 60 exterior | scene: owID 3, owID 4 | level script 615 entry 1; var 0x4106=1 | var 0x4106=1 (once) | LS615 e1; 842 S#4; ev57 ow3,4 | EVT-060-LS1, 09, 05, 06; GLB-RTN-2029/2030 |
| NBT-EVT-060-05 | Event | 60 exterior | friend NPC ow4 / ow8 | talk | flag 418 / 744 clear (object visible) | 842 S#5; ev57 ow4,8; 542 m25,26 | DLG-060-05a/b; EVT-060-04, 09, 06 |
| NBT-EVT-060-06 | Event | 60 exterior | Marill-type object ow3 / ow9 | talk | flag 417 / 744 clear | 842 S#6; ev57 ow3,9; 542 m33,31,32 | DLG-060-06a-c; EVT-060-05 |
| NBT-EVT-060-07 | Event | 60 exterior | map-change housekeeping (Cameron flag 638) | level script 615 entry 2 (mapChange) | every map entry | LS615 e2; 842 S#7; ev57 ow6 | EVT-060-LS2, 18 |
| NBT-EVT-060-08 | Event | 60 exterior | board (player's house sign) | read board (any direction) | always | 842 S#8; ev57 spawnable 1; 542 m35 | DLG-060-08a; GLB-RTN-2000; EVT-060-17 |
| NBT-EVT-060-09 | Event | 60 exterior | scene: owID 3, owID 4 | level script 615 entry 1; var 0x4072=1 | var 0x4072=1 | LS615 e1; 842 S#9; ev57 ow3,4; 542 m15,16 | DLG-060-09a/b; EVT-060-LS1, 04, 10 |
| NBT-EVT-060-LS1 | Event | 60 exterior | level script 615 entry 1 (variableValue) | map load; var 0x4106=1 then 0x4072=1 | per var | LS615 e1 | EVT-060-04, 09, LS2 |
| NBT-EVT-060-LS2 | Event | 60 exterior | level script 615 entry 2 (mapChange) | every map change in | always | LS615 e2 | EVT-060-07, LS1 |
| NBT-EVT-060-O5 | Event | 60 exterior | idle NPC ow5 (owID 5), Elm door actor | none (scriptNumber 0) | always listed; no talk script | ev57 ow5; 842 S#3 (AddOW/RemoveOW) | EVT-060-03 |
| NBT-EVT-060-O7 | Event | 60 exterior | Mom object ow7 (owID 7) | none (scriptNumber 0) | hidden while flag 678 set | ev57 ow7; 842 S#12/13 + F | EVT-060-W1, 12, 13 |
| NBT-EVT-060-S4 | Event | 60 exterior | hidden item (spawnable 4) | interact tile (682,391) | always (hidden-item table) | ev57 spawnable 4; arm9 hidden-item table | GLB-RTN-HIDDENITEM; EVT-060-01 |
| NBT-EVT-060-W0 | Event | 60 exterior | warp to header 61 | step on tile (684,393) | always | ev57 warp 0; 842 F#5,#50 | EVT-060-03 |
| NBT-EVT-060-W1 | Event | 60 exterior | warp to header 63 | step on tile (695,396) | always | ev57 warp 1; 842 S#12, F#58,#71 | EVT-060-O7, 12, 13 |
| NBT-EVT-060-W2 | Event | 60 exterior | warp to header 65 | step on tile (679,405) | always | ev57 warp 2 | None |
| NBT-EVT-060-W3 | Event | 60 exterior | warp to header 66 | step on tile (690,407) | always | ev57 warp 3 | None |
| NBT-EVT-060-W4 | Event | 60 exterior | warp to header 62 (tile shared with trigger 1, ow4) | step on tile (688,392) | always; trigger 1 may run first | ev57 warp 4, trig 1; 842 S#11 | EVT-060-11, 05 |
| NBT-DLG-060-01a | Dialogue variant | 60 exterior | NPC ow0 | shown by EVT-060-01, 1st box | every talk | 842 S#1; 542 m13 | DLG-060-01b |
| NBT-DLG-060-01b | Dialogue variant | 60 exterior | NPC ow0 | shown by EVT-060-01, 2nd box | every talk | 842 F#2,#22; 542 m14 | DLG-060-01a |
| NBT-DLG-060-02a | Dialogue variant | 60 exterior | NPC ow1 | talk; var 0x4072=0 | var 0x4072=0 | 842 S#2; 542 m9 | DLG-060-02b-e |
| NBT-DLG-060-02b | Dialogue variant | 60 exterior | NPC ow1 | talk; var 0x4072=1 or 2 | var 0x4072=1/2 | 842 F#3,#26; 542 m5 | DLG-060-02a, c-e |
| NBT-DLG-060-02c | Dialogue variant | 60 exterior | NPC ow1 | talk; var 0x407E=1 | 0x4072 outside 0-2 and 0x407E=1 | 842 F#47; 542 m0 | DLG-060-02a, b, d, e |
| NBT-DLG-060-02d | Dialogue variant | 60 exterior | NPC ow1 | talk; male player | final fallback; reachability unresolved | 842 F#63; 542 m6 | DLG-060-02e, a-c |
| NBT-DLG-060-02e | Dialogue variant | 60 exterior | NPC ow1 | talk; female player | as 02d | 842 F#63; 542 m7 | DLG-060-02d |
| NBT-DLG-060-03a | Dialogue variant | 60 exterior | NPC owID 1 | step trigger 0; male; flag 156 clear | flag 156 clear, var 0x407E=0 | 842 S#3; 542 m1 | DLG-060-03b |
| NBT-DLG-060-03b | Dialogue variant | 60 exterior | NPC owID 1 | as 03a; female | as 03a | 842 S#3; 542 m2 | DLG-060-03a |
| NBT-DLG-060-03c | Dialogue variant | 60 exterior | NPC owID 1 | step trigger 0; branch A | flag 156 clear, var 0x4072 not 2 | 842 F#8,#85; 542 m3 | DLG-060-03d |
| NBT-DLG-060-03d | Dialogue variant | 60 exterior | NPC owID 1 | step trigger 0; branch A | as 03c | 842 F#33,#91; 542 m4 | DLG-060-03c |
| NBT-DLG-060-03e | Dialogue variant | 60 exterior | NPC owID 1 | step trigger 0; branch B | flag 156 clear, var 0x4072=2 | 842 F#30,#89; 542 m10 | DLG-060-03f |
| NBT-DLG-060-03f | Dialogue variant | 60 exterior | NPC owID 1 | step trigger 0; branch B | as 03e | 842 F#53,#93; 542 m11 | DLG-060-03e |
| NBT-DLG-060-03g | Dialogue variant | 60 exterior | owID 5 (Elm per text) | step trigger 0; branch C | flag 156 set, var 0x407E=0 | 842 F#5; 542 m17 | DLG-060-03h-j |
| NBT-DLG-060-03h | Dialogue variant | 60 exterior | owID 5 (Elm) | step trigger 0; branch C | as 03g | 842 F#28,#87; 542 m18 | DLG-060-03g, i, j |
| NBT-DLG-060-03i | Dialogue variant | 60 exterior | system message | step trigger 0; branch C | as 03g | 842 F#28,#87; 542 m19 | DLG-060-03h, j |
| NBT-DLG-060-03j | Dialogue variant | 60 exterior | owID 5 (Elm) | step trigger 0; branch C | as 03g | 842 F#28,#87; 542 m20 | DLG-060-03h, i |
| NBT-DLG-060-05a | Dialogue variant | 60 exterior | friend NPC ow4 / ow8 | talk; male | flag 418 / 744 clear | 842 S#5; 542 m25 | DLG-060-05b |
| NBT-DLG-060-05b | Dialogue variant | 60 exterior | friend NPC ow4 / ow8 | talk; female | as 05a | 842 S#5; 542 m26 | DLG-060-05a |
| NBT-DLG-060-06a | Dialogue variant | 60 exterior | Marill object ow3 / ow9 | talk (cry + text) | flag 417 / 744 clear | 842 S#6; 542 m33 | DLG-060-06b, c |
| NBT-DLG-060-06b | Dialogue variant | 60 exterior | friend NPC ow8 | talk; male | after 06a | 842 S#6; 542 m31 | DLG-060-06a, c |
| NBT-DLG-060-06c | Dialogue variant | 60 exterior | friend NPC ow8 | talk; female | after 06a | 842 S#6; 542 m32 | DLG-060-06a, b |
| NBT-DLG-060-08a | Dialogue variant | 60 exterior | board spawnable 1 | read board | always | 842 S#8; 542 m35 | None |
| NBT-DLG-060-09a | Dialogue variant | 60 exterior | friend ow4 ("Lyra") | scene; male | var 0x4072=1 at map load | 842 S#9; 542 m15 | DLG-060-09b |
| NBT-DLG-060-09b | Dialogue variant | 60 exterior | friend ow4 ("Ethan") | scene; female | as 09a | 842 S#9; 542 m16 | DLG-060-09a |
| NBT-EVT-060-10 | Event | 60 exterior | screen-reset restore of ow3, ow4 | level script 615 entry 3 (screenReset) | var 0x4072=1 | LS615 e3; 842 S#10, F#10 | EVT-060-04, 09 |
| NBT-EVT-060-11 | Event | 60 exterior | Elm-lab door tile (688,392) | step trigger 1; var 0x4003=0 | var 0x4003=0 | 842 S#11, F#11; ev57 trig1 | None |
| NBT-EVT-060-12 | Event | 60 exterior | east-exit column + Mom (ow7) | step trigger 2; var 0x4081=1 | var 0x4081=1 | 842 S#12 + F; ev57 trig2; 542 m21-24 | DLG-060-12a-d; EVT-060-13 |
| NBT-DLG-060-12a | Dialogue variant | 60 exterior | Mom (ow7, Inferred) | step trigger 2 | var 0x4007=2 | 842 F#12; 542 m24 | None |
| NBT-DLG-060-12b | Dialogue variant | 60 exterior | Mom (ow7, Inferred) | step trigger 2 | var 0x4007=0 first attempt | 842 S#12; 542 m21 | None |
| NBT-DLG-060-12c | Dialogue variant | 60 exterior | Mom (ow7, Inferred) | step trigger 2 | var 0x4007=0 after move | 842 F#15,#70; 542 m22 | DLG-060-12d |
| NBT-DLG-060-12d | Dialogue variant | 60 exterior | Mom (ow7, Inferred) | step trigger 2 | var 0x4007=1 | 842 F#37; 542 m23 | DLG-060-12c |
| NBT-EVT-060-13 | Event | 60 exterior | east-exit column + friend (ow8) | step trigger 3; var 0x4081=2 | var 0x4081=2 | 842 S#13 + F; ev57 trig3; 542 m27-30 | DLG-060-13a-d; EVT-060-12 |
| NBT-DLG-060-13a | Dialogue variant | 60 exterior | friend ow8 | step trigger 3; male | var 0x4081=2 | 842 S#13; 542 m27 | DLG-060-13b |
| NBT-DLG-060-13b | Dialogue variant | 60 exterior | friend ow8 | step trigger 3; female | as 13a | 842 S#13; 542 m28 | DLG-060-13a |
| NBT-DLG-060-13c | Dialogue variant | 60 exterior | friend ow8 | step trigger 3; male | as 13a | 842 F#17,#72; 542 m29 | DLG-060-13d |
| NBT-DLG-060-13d | Dialogue variant | 60 exterior | friend ow8 | step trigger 3; female | as 13a | 842 F#17,#72; 542 m30 | DLG-060-13c |
| NBT-EVT-060-14 | Event | 60 exterior | board "Elm Lab" sign (spawnable 0) | read board | always | 842 S#14; ev57 spawnable 0; 542 m36 | DLG-060-14a; EVT-060-08 |
| NBT-DLG-060-14a | Dialogue variant | 60 exterior | board | read board | always | 842 S#14; 542 m36 | None |
| NBT-EVT-060-15 | Event | 60 exterior | icon board (spawnable 2) | read board | always | 842 S#15; ev57 spawnable 2 | None |
| NBT-EVT-060-16 | Event | 60 exterior | wandering NPC ow2 | talk | always (flag 0) | 842 S#16; ev57 ow2; 542 m12 | DLG-060-16a |
| NBT-DLG-060-16a | Dialogue variant | 60 exterior | NPC ow2 | talk | always | 842 S#16; 542 m12 | None |
| NBT-EVT-060-17 | Event | 60 exterior | board, counterpart's house (spawnable 3) | read board | always | 842 S#17; ev57 spawnable 3; 542 m35 | DLG-060-17a; EVT-060-08 |
| NBT-DLG-060-17a | Dialogue variant | 60 exterior | board | read board | always | 842 S#17; 542 m35 | EVT-060-08 |
| NBT-EVT-060-18 | Event | 60 exterior | Cameron the photographer, ow6 | talk | flag 638 clear | 842 S#18 + F; ev57 ow6; common archive msgs | GLB-PRM-30-0, GLB-PRM-30-1, GLB-PRM-30-2, GLB-PRM-30-3, GLB-PRM-30-5 |
| NBT-DLG-060-U8 | Dialogue variant | 60 exterior | none | none found | apparently unused | 542 m8 | None |
| NBT-DLG-060-U37 | Dialogue variant | 60 exterior | none | none found | apparently unused (duplicate of m35) | 542 m37 | None |
| NBT-DLG-060-U34 | Dialogue variant | 60 exterior | none | none found | apparently unused (by scripts) | 542 m34 | None |
| NBT-EVT-061-01 | Event | 61 Elm lab | Professor Elm, ow0 | talk | ladder by flags 242/114/2435/2404/264/265, var 0x4108, badges | 843 S#1 + F; ev58 ow0; 543 many | DLG-061-01a-au |
| NBT-DLG-061-01a | Dialogue variant | 61 Elm lab | Elm | talk; flag 242 clear + 2404 set | flag 242 clear, flag 2404 set; male | 843 F#2; 543 m71 | EVT-061-01; DLG-061-01ag |
| NBT-DLG-061-01ag | Dialogue variant | 61 Elm lab | Elm | as 01a; female | as 01a | 843 F#2; 543 m72 | DLG-061-01a |
| NBT-DLG-061-01b | Dialogue variant | 61 Elm lab | Elm | talk (F#2 and F#35) | as 01a, or F#5 path without badge 15 | 843 F#2,#35; 543 m73 | DLG-061-01a, 01ah |
| NBT-DLG-061-01ah | Dialogue variant | 61 Elm lab | Elm | as 01b; female | as 01b | 843 F#2,#35; 543 m74 | DLG-061-01b |
| NBT-DLG-061-01c | Dialogue variant | 61 Elm lab | Elm | talk; end of ladder | var 0x4108=0, flags 114/2435 clear, healthy lead | 843 S#1,F#1,#3; 543 m5 | None |
| NBT-DLG-061-01d | Dialogue variant | 61 Elm lab | Elm | talk (F#39) | flag 114 clear, 2435 set, lead is Togepi line | 843 F#39; 543 m46 | DLG-061-01e, 01f |
| NBT-DLG-061-01e | Dialogue variant | 61 Elm lab | Elm | talk (F#60/#68); male | after 01d; flag 264 / 265 clear | 843 F#60,#68; 543 m47 | DLG-061-01ai, 01f, 01h, 01i |
| NBT-DLG-061-01ai | Dialogue variant | 61 Elm lab | Elm | as 01e; female | as 01e | 843 F#60,#68; 543 m48 | DLG-061-01e |
| NBT-DLG-061-01f | Dialogue variant | 61 Elm lab | Elm | talk (F#39/#59); male | after 01d; flag 264 / 265 set | 843 F#39,#59; 543 m104 | DLG-061-01aj, 01e |
| NBT-DLG-061-01aj | Dialogue variant | 61 Elm lab | Elm | as 01f; female | as 01f | 843 F#39,#59; 543 m105 | DLG-061-01f |
| NBT-DLG-061-01g | Dialogue variant | 61 Elm lab | Elm | talk (F#40); male | flag 114 clear, 2435 set, lead not Togepi line | 843 F#40; 543 m53 | DLG-061-01ak, 01q |
| NBT-DLG-061-01ak | Dialogue variant | 61 Elm lab | Elm | as 01g; female | as 01g | 843 F#40; 543 m54 | DLG-061-01g |
| NBT-DLG-061-01h | Dialogue variant | 61 Elm lab | Elm | after Everstone given (F#68/#69) | item space for Everstone | 843 F#68,#69; 543 m49 | DLG-061-01i |
| NBT-DLG-061-01i | Dialogue variant | 61 Elm lab | Elm | after 01h; male | as 01h | 843 F#68,#69; 543 m50 | DLG-061-01al, 01h |
| NBT-DLG-061-01al | Dialogue variant | 61 Elm lab | Elm | as 01i; female | as 01h | 843 F#68,#69; 543 m51 | DLG-061-01i |
| NBT-DLG-061-01j | Dialogue variant | 61 Elm lab | Elm | talk (F#7) and after starter handoff; male | flag 114/2435 clear, var 0x4108 1-2 | 843 F#7,S#13; 543 m12 | EVT-061-13; DLG-061-01am |
| NBT-DLG-061-01am | Dialogue variant | 61 Elm lab | Elm | as 01j; female | as 01j | 843 F#7,S#13; 543 m13 | DLG-061-01j |
| NBT-DLG-061-01k | Dialogue variant | 61 Elm lab | Elm | talk (F#41) | var 0x4108 = 3,4,5 | 843 F#41; 543 m40 | None |
| NBT-DLG-061-01l | Dialogue variant | 61 Elm lab | Elm | talk (F#62); male | var 0x4108 = 6 | 843 F#62; 543 m42 | DLG-061-01an |
| NBT-DLG-061-01an | Dialogue variant | 61 Elm lab | Elm | as 01l; female | var 0x4108 = 6 | 843 F#62; 543 m43 | DLG-061-01l |
| NBT-DLG-061-01m | Dialogue variant | 61 Elm lab | Elm | talk (F#70); male | var 0x4108 = 7 or 8 | 843 F#70; 543 m44 | DLG-061-01ao |
| NBT-DLG-061-01ao | Dialogue variant | 61 Elm lab | Elm | as 01m; female | as 01m | 843 F#70; 543 m45 | DLG-061-01m |
| NBT-DLG-061-01n | Dialogue variant | 61 Elm lab | Elm | talk (F#34); male | badge 15 held (F#5 path) | 843 F#34; 543 m102 | DLG-061-01ap, 01o-r |
| NBT-DLG-061-01ap | Dialogue variant | 61 Elm lab | Elm | as 01n; female | as 01n | 843 F#34; 543 m103 | DLG-061-01n |
| NBT-DLG-061-01o | Dialogue variant | 61 Elm lab | Elm | talk (F#36) | badge 15 not held, flag 242 clear, 264 or 265 set | 843 F#36; 543 m70 | DLG-061-01n |
| NBT-DLG-061-01p | Dialogue variant | 61 Elm lab | Elm | talk (F#37) and end of EVT-061-15 | badge 15 not held, 264/265 clear, badge 7 held | 843 F#37,#26,#27; 543 m69 | EVT-061-15 |
| NBT-DLG-061-01q | Dialogue variant | 61 Elm lab | Elm | talk (F#38); male | badge 7 not held, var 0x400F = 1 | 843 F#38; 543 m100 | DLG-061-01aq, 01g |
| NBT-DLG-061-01aq | Dialogue variant | 61 Elm lab | Elm | as 01q; female | as 01q | 843 F#38; 543 m101 | DLG-061-01q |
| NBT-DLG-061-01r | Dialogue variant | 61 Elm lab | Elm | talk (F#5 tail); male | default of F#5 | 843 F#5; 543 m98 | DLG-061-01ar |
| NBT-DLG-061-01ar | Dialogue variant | 61 Elm lab | Elm | as 01r; female | as 01r | 843 F#5; 543 m99 | DLG-061-01r |
| NBT-DLG-061-01s | Dialogue variant | 61 Elm lab | Elm | talk (F#31, Pichu check); male | form-1 Pichu lead, var 0x412F=0 | 843 F#31; 543 m84 | DLG-061-01as, 01t-z, 01ab |
| NBT-DLG-061-01as | Dialogue variant | 61 Elm lab | Elm | as 01s; female | as 01s | 843 F#31; 543 m85 | DLG-061-01s |
| NBT-DLG-061-01t | Dialogue variant | 61 Elm lab | Elm | after 01s (F#4) | as 01s | 843 F#4; 543 m75 | DLG-061-01s |
| NBT-DLG-061-01u | Dialogue variant | 61 Elm lab | Elm | after 01t (F#4) | as 01s | 843 F#4; 543 m76 | DLG-061-01t |
| NBT-DLG-061-01v | Dialogue variant | 61 Elm lab | Elm | after 01u (F#4) | as 01s | 843 F#4; 543 m77 | DLG-061-01u |
| NBT-DLG-061-01w | Dialogue variant | 61 Elm lab | Elm | after 01v (F#4) | as 01s | 843 F#4; 543 m78 | DLG-061-01v |
| NBT-DLG-061-01x | Dialogue variant | 61 Elm lab | Elm | after 01w (F#4) | as 01s | 843 F#4; 543 m79 | DLG-061-01w |
| NBT-DLG-061-01y | Dialogue variant | 61 Elm lab | Elm | after 01x (F#32/#33) | as 01s | 843 F#32,#33; 543 m80 | DLG-061-01x |
| NBT-DLG-061-01z | Dialogue variant | 61 Elm lab | Elm | after 01y (F#57/#58); male | as 01s | 843 F#57,#58; 543 m81 | DLG-061-01at, 01y |
| NBT-DLG-061-01at | Dialogue variant | 61 Elm lab | Elm | as 01z; female | as 01s | 843 F#57,#58; 543 m82 | DLG-061-01z |
| NBT-DLG-061-01aa | Dialogue variant | 61 Elm lab | Elm | talk again, var 0x4006 = 1 (F#28) | var 0x4006 = 1 | 843 F#28; 543 m83 | DLG-061-01z |
| NBT-DLG-061-01ab | Dialogue variant | 61 Elm lab | Elm | talk (F#54); male | form-1 Pichu, var 0x412F=1, happiness >= 220 | 843 F#54; 543 m86 | DLG-061-01au, 01s, 01ac |
| NBT-DLG-061-01au | Dialogue variant | 61 Elm lab | Elm | as 01ab; female | as 01ab | 843 F#54; 543 m87 | DLG-061-01ab |
| NBT-DLG-061-01ac | Dialogue variant | 61 Elm lab | Elm | after 01ab (F#54) | as 01ab | 843 F#54; 543 m88 | DLG-061-01ab, 01ad |
| NBT-DLG-061-01ad | Dialogue variant | 61 Elm lab | Elm | after 01ac (F#54) | as 01ab | 843 F#54; 543 m89 | DLG-061-01ac, 01ae |
| NBT-DLG-061-01ae | Dialogue variant | 61 Elm lab | Elm | after 01ad (F#54) | as 01ab | 843 F#54; 543 m90 | DLG-061-01ad, 01af |
| NBT-DLG-061-01af | Dialogue variant | 61 Elm lab | Elm | talk (F#29) | form-1 Pichu, 0x4006 != 1, var 0x412F >= 2 | 843 F#29; 543 m91 | DLG-061-01ae |
| NBT-EVT-061-02 | Event | 61 Elm lab | Elm's aide, ow2 | talk | by var 0x40FC=3 / var 0x4108 | 843 S#2 + F; ev58 ow2; 543 m18,22,41,55,57 | DLG-061-02a-e; EVT-061-04, 16 |
| NBT-DLG-061-02a | Dialogue variant | 61 Elm lab | aide | talk | var 0x40FC != 3, var 0x4108 = 0 | 843 S#2; 543 m18 | EVT-061-02 |
| NBT-DLG-061-02b | Dialogue variant | 61 Elm lab | aide | talk (F#10) | var 0x40FC != 3, var 0x4108 = 2 | 843 F#10; 543 m22 | DLG-061-04b |
| NBT-DLG-061-02c | Dialogue variant | 61 Elm lab | aide | talk (F#42) | var 0x4108 = 4 | 843 F#42; 543 m41 | DLG-061-02d |
| NBT-DLG-061-02d | Dialogue variant | 61 Elm lab | aide | talk (F#63/#71) | var 0x4108 not 0, 2, 4 | 843 F#63,#71; 543 m55 | DLG-061-02c |
| NBT-DLG-061-02e | Dialogue variant | 61 Elm lab | aide | talk (F#9) | var 0x40FC = 3 | 843 F#9; 543 m57 | DLG-061-16a |
| NBT-EVT-061-03 | Event | 61 Elm lab | officer ow1, friend ow3, Elm ow0 | level script 616 entry 2; var 0x4108=3 | var 0x4108=3 at map entry | LS616 e2; 843 S#3, F#12,#13; 543 m23-39 | EVT-061-LS2, O1, O3; DLG-061-03a-q |
| NBT-DLG-061-03a | Dialogue variant | 61 Elm lab | officer ow1 | scene | var 0x4108=3 | 843 S#3; 543 m23 | EVT-061-O1 |
| NBT-DLG-061-03b | Dialogue variant | 61 Elm lab | friend "Lyra" | scene; male | var 0x4108=3 | 843 S#3; 543 m24 | DLG-061-03m |
| NBT-DLG-061-03m | Dialogue variant | 61 Elm lab | friend "Ethan" | scene; female | var 0x4108=3 | 843 S#3; 543 m25 | DLG-061-03b |
| NBT-DLG-061-03c | Dialogue variant | 61 Elm lab | officer | scene, before naming screen | var 0x4108=3 | 843 S#3; 543 m26 | DLG-061-03d |
| NBT-DLG-061-03d | Dialogue variant | 61 Elm lab | officer | name confirm Yes/No | var 0x4108=3 | 843 S#3,F#12; 543 m27 | DLG-061-03e, 03f |
| NBT-DLG-061-03e | Dialogue variant | 61 Elm lab | officer | after Yes in 03d | answer Yes | 843 S#3,F#12; 543 m28 | DLG-061-03d |
| NBT-DLG-061-03f | Dialogue variant | 61 Elm lab | officer | after No in 03d (F#13) | answer No | 843 F#13; 543 m29 | DLG-061-03d |
| NBT-DLG-061-03g | Dialogue variant | 61 Elm lab | friend "Lyra" | scene; male | var 0x4108=3 | 843 S#3,F#12; 543 m30 | DLG-061-03n |
| NBT-DLG-061-03n | Dialogue variant | 61 Elm lab | friend "Ethan" | scene; female | var 0x4108=3 | 843 S#3,F#12; 543 m31 | DLG-061-03g |
| NBT-DLG-061-03h | Dialogue variant | 61 Elm lab | Elm | scene; male | var 0x4108=3 | 843 S#3,F#12; 543 m32 | DLG-061-03o |
| NBT-DLG-061-03o | Dialogue variant | 61 Elm lab | Elm | scene; female | var 0x4108=3 | 843 S#3,F#12; 543 m33 | DLG-061-03h |
| NBT-DLG-061-03i | Dialogue variant | 61 Elm lab | narration (Egg handed over) | scene | var 0x4108=3 | 843 S#3,F#12; 543 m34 | None |
| NBT-DLG-061-03j | Dialogue variant | 61 Elm lab | Elm | scene | var 0x4108=3 | 843 S#3,F#12; 543 m35 | None |
| NBT-DLG-061-03k | Dialogue variant | 61 Elm lab | Elm | scene; male | var 0x4108=3 | 843 S#3,F#12; 543 m36 | DLG-061-03p |
| NBT-DLG-061-03p | Dialogue variant | 61 Elm lab | Elm | scene; female | var 0x4108=3 | 843 S#3,F#12; 543 m37 | DLG-061-03k |
| NBT-DLG-061-03l | Dialogue variant | 61 Elm lab | Elm | scene; male | var 0x4108=3 | 843 S#3,F#12; 543 m38 | DLG-061-03q |
| NBT-DLG-061-03q | Dialogue variant | 61 Elm lab | Elm | scene; female | var 0x4108=3 | 843 S#3,F#12; 543 m39 | DLG-061-03l |
| NBT-EVT-061-04 | Event | 61 Elm lab | aide ow2 at door row | step trigger 0; var 0x4108=1 | var 0x4108=1 | 843 S#4 + F; ev58 trig0; 543 m19-21 | DLG-061-04a-c; EVT-061-02 |
| NBT-DLG-061-04a | Dialogue variant | 61 Elm lab | aide | trigger 0; male | var 0x4108=1 | 843 F#15,#64; 543 m19 | DLG-061-04c |
| NBT-DLG-061-04c | Dialogue variant | 61 Elm lab | aide | trigger 0; female | var 0x4108=1 | 843 F#15,#64; 543 m20 | DLG-061-04a |
| NBT-DLG-061-04b | Dialogue variant | 61 Elm lab | aide | after items given | handout succeeded | 843 F#15,#64; 543 m21 | DLG-061-02b |
| NBT-EVT-061-05 | Event | 61 Elm lab | none (Script 5 empty) | none found | apparently unused | 843 S#5 | None |
| NBT-EVT-061-06 | Event | 61 Elm lab | bookshelf (spawnables 0,1) | A-press tiles (1,10),(2,10) | always | 843 S#6; ev58 spawnables 0,1; 543 m93 | DLG-061-06a |
| NBT-DLG-061-06a | Dialogue variant | 61 Elm lab | book (narration) | bookshelf | always | 843 S#6; 543 m93 | EVT-061-06 |
| NBT-EVT-061-07 | Event | 61 Elm lab | bookshelf (spawnables 2,3) | A-press tiles (7,10),(8,10) | always | 843 S#7; ev58 spawnables 2,3; 543 m94 | DLG-061-07a |
| NBT-DLG-061-07a | Dialogue variant | 61 Elm lab | book (narration) | bookshelf | always | 843 S#7; 543 m94 | EVT-061-07 |
| NBT-EVT-061-08 | Event | 61 Elm lab | bookshelf (spawnables 4,5) | A-press tiles (9,10),(10,10) | always | 843 S#8; ev58 spawnables 4,5; 543 m95 | DLG-061-08a |
| NBT-DLG-061-08a | Dialogue variant | 61 Elm lab | book (narration) | bookshelf | always | 843 S#8; 543 m95 | EVT-061-08 |
| NBT-EVT-061-09 | Event | 61 Elm lab | bookshelf (spawnables 6,7) | A-press tiles (11,10),(12,10) | always | 843 S#9; ev58 spawnables 6,7; 543 m96 | DLG-061-09a |
| NBT-DLG-061-09a | Dialogue variant | 61 Elm lab | book (narration) | bookshelf | always | 843 S#9; 543 m96 | EVT-061-09 |
| NBT-EVT-061-10 | Event | 61 Elm lab | memo (spawnable 8) | A-press tile (6,3) | always | 843 S#10; ev58 spawnable 8; 543 m97 | DLG-061-10a |
| NBT-DLG-061-10a | Dialogue variant | 61 Elm lab | memo (narration) | memo | always | 843 S#10; 543 m97 | EVT-061-10 |
| NBT-EVT-061-11 | Event | 61 Elm lab | Elm placement / starter machine refresh | level script 616 entry 1 (screenReset) | every screen rebuild; flag 352 / var 0x4108 | LS616 e1; 843 S#11, F#16-18,#50 | EVT-061-LS1 |
| NBT-EVT-061-12 | Event | 61 Elm lab | Elm + player at door row | step trigger 1; var 0x4108=0 | var 0x4108=0; flag 352 branch | 843 S#12 + F; ev58 trig1; 543 m0-4,6 | DLG-061-12a-f |
| NBT-DLG-061-12a | Dialogue variant | 61 Elm lab | Elm | trigger 1 (F#19) | flag 352 set, var 0x4108=0 | 843 F#19; 543 m6 | EVT-061-12 |
| NBT-DLG-061-12b | Dialogue variant | 61 Elm lab | Elm | trigger 1; male | flag 352 clear, var 0x4108=0 | 843 F#21,#66; 543 m0 | DLG-061-12f |
| NBT-DLG-061-12f | Dialogue variant | 61 Elm lab | Elm | trigger 1; female | as 12b | 843 F#21,#66; 543 m1 | DLG-061-12b |
| NBT-DLG-061-12c | Dialogue variant | 61 Elm lab | Elm | trigger 1, phone ring | as 12b | 843 F#21,#66; 543 m2 | DLG-061-12d |
| NBT-DLG-061-12d | Dialogue variant | 61 Elm lab | Elm | trigger 1, after 12c | as 12b | 843 F#21,#66; 543 m3 | DLG-061-12c |
| NBT-DLG-061-12e | Dialogue variant | 61 Elm lab | Elm | trigger 1, after Elm steps | as 12b | 843 F#21,#66; 543 m4 | DLG-061-12d |
| NBT-EVT-061-13 | Event | 61 Elm lab | starter machine (spawnable 9) | A-press tile (8,4) | flag 106 / 115 / 153 branch | 843 S#13, F#22,#23,#52,#53; ev58 spawnable 9; 543 m7-13,15-17 | DLG-061-13a-h |
| NBT-DLG-061-13a | Dialogue variant | 61 Elm lab | narration | machine, flag 106 clear | flag 106 clear | 843 S#13; 543 m7 | EVT-061-13 |
| NBT-DLG-061-13b | Dialogue variant | 61 Elm lab | narration | nickname prompt | flag 106 clear path | 843 S#13; 543 m8 | DLG-061-13c |
| NBT-DLG-061-13c | Dialogue variant | 61 Elm lab | narration | nickname confirm | after name screen | 843 F#23; 543 m9 | DLG-061-13b |
| NBT-DLG-061-13d | Dialogue variant | 61 Elm lab | Elm | after nickname step | same run | 843 S#13; 543 m10 | DLG-061-13e |
| NBT-DLG-061-13e | Dialogue variant | 61 Elm lab | Elm | after 13d | same run | 843 S#13; 543 m11 | DLG-061-13d |
| NBT-DLG-061-13f | Dialogue variant | 61 Elm lab | machine narration | machine (F#22) | flag 106 set, 115 and 153 clear | 843 F#22; 543 m15 | DLG-061-13g, 13h |
| NBT-DLG-061-13g | Dialogue variant | 61 Elm lab | machine narration | machine (F#53) | flag 106 set, 115 clear, 153 set | 843 F#53; 543 m16 | DLG-061-13f |
| NBT-DLG-061-13h | Dialogue variant | 61 Elm lab | machine narration | machine (F#52) | flag 106 set, 115 set | 843 F#52; 543 m17 | DLG-061-13f |
| NBT-EVT-061-14 | Event | 61 Elm lab | healing PC (spawnable 10) | A-press tile (4,3) | flag 106 clear / set | 843 S#14, F#24,#25; ev58 spawnable 10; 543 m14,92 | DLG-061-14a, 14b |
| NBT-DLG-061-14a | Dialogue variant | 61 Elm lab | PC narration | PC | flag 106 clear | 843 F#24; 543 m14 | EVT-061-14 |
| NBT-DLG-061-14b | Dialogue variant | 61 Elm lab | PC narration | PC Yes/No | flag 106 set | 843 S#14; 543 m92 | EVT-061-14 |
| NBT-EVT-061-15 | Event | 61 Elm lab | friend ow3 + Elm ow0 | level script 616 entry 2; var 0x4108=8 | var 0x4108=8 at map entry | LS616 e2; 843 S#15, F#26,#27; 543 m58-65,67-69 | DLG-061-15a-j; EVT-061-LS2 |
| NBT-DLG-061-15a | Dialogue variant | 61 Elm lab | friend "Lyra" | scene; male | var 0x4108=8 | 843 S#15; 543 m58 | DLG-061-15f |
| NBT-DLG-061-15f | Dialogue variant | 61 Elm lab | friend "Ethan" | scene; female | var 0x4108=8 | 843 S#15; 543 m59 | DLG-061-15a |
| NBT-DLG-061-15b | Dialogue variant | 61 Elm lab | Elm | scene; male | var 0x4108=8 | 843 S#15; 543 m60 | DLG-061-15g |
| NBT-DLG-061-15g | Dialogue variant | 61 Elm lab | Elm | scene; female | var 0x4108=8 | 843 S#15; 543 m61 | DLG-061-15b |
| NBT-DLG-061-15c | Dialogue variant | 61 Elm lab | Elm (Inferred) | scene; male | both bag-space arms | 843 F#26,#27; 543 m62 | DLG-061-15h |
| NBT-DLG-061-15h | Dialogue variant | 61 Elm lab | Elm (Inferred) | scene; female | both bag-space arms | 843 F#26,#27; 543 m63 | DLG-061-15c |
| NBT-DLG-061-15d | Dialogue variant | 61 Elm lab | Elm (Inferred) | scene; male | as 15c | 843 F#26,#27; 543 m64 | DLG-061-15i |
| NBT-DLG-061-15i | Dialogue variant | 61 Elm lab | Elm (Inferred) | scene; female | as 15c | 843 F#26,#27; 543 m65 | DLG-061-15d |
| NBT-DLG-061-15e | Dialogue variant | 61 Elm lab | friend "Lyra" | scene; male | as 15c | 843 F#26,#27; 543 m67 | DLG-061-15j |
| NBT-DLG-061-15j | Dialogue variant | 61 Elm lab | friend "Ethan" | scene; female | as 15c | 843 F#26,#27; 543 m68 | DLG-061-15e |
| NBT-EVT-061-16 | Event | 61 Elm lab | aide ow2 | level script 616 entry 2; var 0x40FC=2 | var 0x40FC=2; flag 582 clear | LS616 e2; 843 S#16; 543 m56 | DLG-061-16a; EVT-061-02 |
| NBT-DLG-061-16a | Dialogue variant | 61 Elm lab | aide | scene | var 0x40FC=2 | 843 S#16; 543 m56 | DLG-061-02e |
| NBT-EVT-061-LS1 | Event | 61 Elm lab | level script 616 entry 1 (screenReset -> S#11) | screen reset | unconditional entry | LS616 e1; 843 S#11 | EVT-061-11 |
| NBT-EVT-061-LS2 | Event | 61 Elm lab | level script 616 entry 2 (variableValue) | map load; var 0x40FC=2 / 0x4108=3 / 0x4108=8 | per var | LS616 e2; 843 S#16,#3,#15 | EVT-061-16, 03, 15 |
| NBT-EVT-061-O1 | Event | 61 Elm lab | officer object ow1 | none (scriptNumber 0) | visible while flag 413 clear | ev58 ow1; 843 S#3 | EVT-061-03 |
| NBT-EVT-061-O3 | Event | 61 Elm lab | friend object ow3 | none (scriptNumber 0) | added/removed by scripts 3, 11, 15 | ev58 ow3; 843 S#3,#11,#15 | EVT-061-03 |
| NBT-EVT-061-W0 | Event | 61 Elm lab | door warp to header 60 | step on tile (4,14) | always | ev58 warp 0 | None |
| NBT-DLG-061-U52 | Dialogue variant | 61 Elm lab | none | none found | apparently unused | 543 m52 | None |
| NBT-DLG-061-U66 | Dialogue variant | 61 Elm lab | none (Elm-like wording, Inferred) | none found | apparently unused | 543 m66 | None |
| NBT-EVT-062-01 | Event | 62 neighbour house 1F | wife of resident, ow0 | talk | always; text by player gender | 844 S#1; ev59 ow0; 544 m0,1 | DLG-062-01a/b |
| NBT-DLG-062-01a | Dialogue variant | 62 neighbour house 1F | ow0 | talk; male | always | 844 S#1; 544 m0 | EVT-062-01; DLG-062-01b |
| NBT-DLG-062-01b | Dialogue variant | 62 neighbour house 1F | ow0 | talk; female | always | 844 S#1; 544 m1 | EVT-062-01; DLG-062-01a |
| NBT-EVT-062-02 | Event | 62 neighbour house 1F | child, wandering ow1 | talk | always (flag 0) | 844 S#2; ev59 ow1; 544 m2 | DLG-062-02a |
| NBT-DLG-062-02a | Dialogue variant | 62 neighbour house 1F | child ow1 | talk | always | 844 S#2; 544 m2 | EVT-062-02 |
| NBT-EVT-062-W0 | Event | 62 neighbour house 1F | door warp to header 60 | step on tile (12,6) | always | ev59 warp 0 | None |
| NBT-DLG-062-U3 | Dialogue variant | 62 neighbour house 1F | none | none found | apparently unused | 544 m3 | None |
| NBT-EVT-063-LS | Event | 63 player's house 1F | level script 618 (variableValue) | map entry; var 0x4106 = 3 or 0 | var 0x4106 = 3 (script 7) / 0 (script 1) | LS618 e0 | EVT-063-01, 07 |
| NBT-EVT-063-01 | Event | 63 player's house 1F | Mom (new-game scene) | level script 618; var 0x4106 = 0 | var 0x4106 = 0 | LS618; 845 S#1; 545 m0-5 | DLG-063-01a-f; EVT-063-LS |
| NBT-DLG-063-01a | Dialogue variant | 63 player's house 1F | Mom | scene; male | var 0x4106 = 0 | 845 S#1; 545 m0 | DLG-063-01b |
| NBT-DLG-063-01b | Dialogue variant | 63 player's house 1F | Mom | scene; female | var 0x4106 = 0 | 845 S#1; 545 m1 | DLG-063-01a |
| NBT-DLG-063-01c | Dialogue variant | 63 player's house 1F | Mom | scene, Trainer Card line | var 0x4106 = 0 | 845 S#1; 545 m2 | EVT-063-01 |
| NBT-DLG-063-01d | Dialogue variant | 63 player's house 1F | Mom | scene, Save line | var 0x4106 = 0 | 845 S#1; 545 m3 | EVT-063-01 |
| NBT-DLG-063-01e | Dialogue variant | 63 player's house 1F | Mom | scene, Options line | var 0x4106 = 0 | 845 S#1; 545 m4 | EVT-063-01 |
| NBT-DLG-063-01f | Dialogue variant | 63 player's house 1F | Mom | scene, last line | var 0x4106 = 0 | 845 S#1; 545 m5 | EVT-063-01 |
| NBT-EVT-063-02 | Event | 63 player's house 1F | Mom ow0 | talk | ladder: flags 2404/167/156/106, var 0x4108, badge 0 | 845 S#2 + F#1-25; ev60 ow0; 545 m6-18,20-32,34 | DLG-063-02a-x |
| NBT-DLG-063-02a | Dialogue variant | 63 player's house 1F | Mom | talk | flag 2404 clear, var 0x4108 < 4, flag 106 clear | 845 S#2; 545 m6 | EVT-063-02 |
| NBT-DLG-063-02b | Dialogue variant | 63 player's house 1F | Mom | talk (F#4) | flag 2404 set, no S.S. Ticket | 845 F#1,#4; 545 m34 | EVT-063-02 |
| NBT-DLG-063-02c | Dialogue variant | 63 player's house 1F | Mom | talk (F#2) | savings route, no Zephyr Badge | 845 F#2; 545 m15 | EVT-063-02 |
| NBT-DLG-063-02d | Dialogue variant | 63 player's house 1F | Mom | talk (F#6) | savings route, badge 0 held | 845 F#6; 545 m16 | EVT-063-02 |
| NBT-DLG-063-02e | Dialogue variant | 63 player's house 1F | Mom | savings offer answered Yes | YesNo result 0 | 845 F#6,#7,#13; 545 m17 | DLG-063-02d |
| NBT-DLG-063-02f | Dialogue variant | 63 player's house 1F | Mom | savings offer answered No | YesNo result not 0 | 845 F#15,#24; 545 m18 | DLG-063-02d |
| NBT-DLG-063-02g | Dialogue variant | 63 player's house 1F | Mom | talk (F#3) | flag 2404 clear, var 0x4108 < 4, flag 106 set, flag 156 clear | 845 F#3; 545 m7 | DLG-063-02h-m |
| NBT-DLG-063-02h | Dialogue variant | 63 player's house 1F | system message | after 02g (F#3) | as 02g | 845 F#3; 545 m8 | DLG-063-02g |
| NBT-DLG-063-02i | Dialogue variant | 63 player's house 1F | Mom | after 02h (F#3) | as 02g | 845 F#3; 545 m9 | DLG-063-02h |
| NBT-DLG-063-02j | Dialogue variant | 63 player's house 1F | Mom | after 02i; Yes/No | as 02g | 845 F#3; 545 m10 | DLG-063-02k, 02l |
| NBT-DLG-063-02k | Dialogue variant | 63 player's house 1F | Mom | 02j answered Yes | result 0 | 845 F#3; 545 m11 | DLG-063-02j |
| NBT-DLG-063-02l | Dialogue variant | 63 player's house 1F | Mom | 02j answered No (F#9) | result not 0 | 845 F#9; 545 m12 | DLG-063-02j |
| NBT-DLG-063-02m | Dialogue variant | 63 player's house 1F | Mom | after 02k or 02l | always after choice | 845 F#9,#10; 545 m13 | DLG-063-02k, 02l |
| NBT-DLG-063-02n | Dialogue variant | 63 player's house 1F | Mom | talk (F#8) | flag 2404 clear, var 0x4108 < 4, flags 106 and 156 set | 845 F#3,#8; 545 m14 | EVT-063-02 |
| NBT-DLG-063-02o | Dialogue variant | 63 player's house 1F | Mom | savings menu opens (F#5) | flag 167 set, F#2 route | 845 F#5; 545 m20 | DLG-063-02p |
| NBT-DLG-063-02p | Dialogue variant | 63 player's house 1F | touch menu labels | after 02o | menu open | 845 F#5; 545 m29-32 | DLG-063-02o |
| NBT-DLG-063-02q | Dialogue variant | 63 player's house 1F | Mom | EXIT chosen / after transfer | menu value 1 / EXIT | 845 F#14,#20; 545 m21 | DLG-063-02o |
| NBT-DLG-063-02r | Dialogue variant | 63 player's house 1F | Mom | withdraw, balance empty (F#18) | Mom's balance 0 | 845 F#11,#18; 545 m22 | DLG-063-02x |
| NBT-DLG-063-02s | Dialogue variant | 63 player's house 1F | Mom | after deposit (F#23) | transfer result 0 | 845 F#12,#23; 545 m23 | DLG-063-02v, 02w |
| NBT-DLG-063-02t | Dialogue variant | 63 player's house 1F | Mom | after withdraw (F#19) | transfer result 0 | 845 F#11,#19; 545 m24 | DLG-063-02r, 02x |
| NBT-DLG-063-02u | Dialogue variant | 63 player's house 1F | Mom | CHANGE button (F#13) | menu value 2 | 845 F#13; 545 m25 | DLG-063-02e, 02f |
| NBT-DLG-063-02v | Dialogue variant | 63 player's house 1F | Mom | deposit, nothing to save (F#22) | player money 0 (Inferred) | 845 F#12,#22; 545 m26 | DLG-063-02w |
| NBT-DLG-063-02w | Dialogue variant | 63 player's house 1F | Mom | deposit, balance at cap (F#21) | Mom's balance full (Inferred) | 845 F#12,#21; 545 m27 | DLG-063-02v |
| NBT-DLG-063-02x | Dialogue variant | 63 player's house 1F | Mom | withdraw, player money at cap (F#17) | player money full (Inferred) | 845 F#11,#17; 545 m28 | DLG-063-02r |
| NBT-EVT-063-03 | Event | 63 player's house 1F | TV (spawnables 0,1) | A-press tiles (5,3),(6,3) | always | 845 S#3; ev60 spawnables 0,1; 545 m35 | DLG-063-03a |
| NBT-DLG-063-03a | Dialogue variant | 63 player's house 1F | TV | interaction | always | 845 S#3; 545 m35 | EVT-063-03 |
| NBT-EVT-063-04 | Event | 63 player's house 1F | stove (spawnable 3) | A-press tile (9,3) | always | 845 S#4; ev60 spawnable 3; 545 m36 | DLG-063-04a |
| NBT-DLG-063-04a | Dialogue variant | 63 player's house 1F | stove | interaction | always | 845 S#4; 545 m36 | EVT-063-04 |
| NBT-EVT-063-05 | Event | 63 player's house 1F | sink (spawnable 2) | A-press tile (8,3) | always | 845 S#5; ev60 spawnable 2; 545 m37 | DLG-063-05a |
| NBT-DLG-063-05a | Dialogue variant | 63 player's house 1F | sink | interaction | always | 845 S#5; 545 m37 | EVT-063-05 |
| NBT-EVT-063-06 | Event | 63 player's house 1F | fridge (spawnable 4) | A-press tile (11,3) | always | 845 S#6; ev60 spawnable 4; 545 m38 | DLG-063-06a |
| NBT-DLG-063-06a | Dialogue variant | 63 player's house 1F | fridge | interaction | always | 845 S#6; 545 m38 | EVT-063-06 |
| NBT-EVT-063-07 | Event | 63 player's house 1F | Mom (post-Hall-of-Fame) | level script 618; var 0x4106 = 3 | var 0x4106 = 3 | LS618; 845 S#7; 545 m33 | DLG-063-07a; EVT-063-LS |
| NBT-DLG-063-07a | Dialogue variant | 63 player's house 1F | Mom | scene | var 0x4106 = 3 | 845 S#7; 545 m33 | EVT-063-07 |
| NBT-EVT-063-W0 | Event | 63 player's house 1F | front door warp to header 60 | step on tile (3,10) | always | ev60 warp 0 | None |
| NBT-EVT-063-W1 | Event | 63 player's house 1F | stairs warp to header 64 | step on tile (3,3) | always | ev60 warp 1 | None |
| NBT-DLG-063-U19 | Dialogue variant | 63 player's house 1F | none | none found | apparently unused | 545 m19 | None |
| NBT-EVT-064-01 | Event | 64 player's room | PC (spawnable 0) | A-press tile (6,4) from front | mail count 0 / not 0 | 846 S#1,F#1; ev61 spawnable 0; 546 m0,1 | DLG-064-01a/b |
| NBT-DLG-064-01a | Dialogue variant | 64 player's room | PC | interaction | always | 846 S#1; 546 m0 | EVT-064-01 |
| NBT-DLG-064-01b | Dialogue variant | 64 player's room | PC | after 01a | mail count 0 | 846 F#1; 546 m1 | EVT-064-01 |
| NBT-EVT-064-02 | Event | 64 player's room | Wii (spawnable 1) | interact tile (8,4), any direction | always | 846 S#2; ev61 spawnable 1; 546 m2 | DLG-064-02a |
| NBT-DLG-064-02a | Dialogue variant | 64 player's room | Wii | interaction | always | 846 S#2; 546 m2 | EVT-064-02 |
| NBT-EVT-064-O0 | Event | 64 player's room | Silver Trophy display ow0 | none (scriptNumber 0) | hidden while flag 682 set | ev61 ow0 | None |
| NBT-EVT-064-O1 | Event | 64 player's room | Gold Trophy display ow1 | none (scriptNumber 0) | hidden while flag 683 set | ev61 ow1 | None |
| NBT-EVT-064-O2 | Event | 64 player's room | Bronze Trophy display ow2 | none (scriptNumber 0) | hidden while flag 681 set | ev61 ow2 | None |
| NBT-EVT-064-W0 | Event | 64 player's room | stairs warp to header 63 | step on tile (3,4) | always | ev61 warp 0 | None |
| NBT-EVT-065-01 | Event | 65 house (T20R0301) | resident NPC ow0 | talk | always (flag 0) | 847 S#1; ev62 ow0; 547 m0 | DLG-065-01a |
| NBT-DLG-065-01a | Dialogue variant | 65 house (T20R0301) | resident NPC | talk | always | 847 S#1; 547 m0 | EVT-065-01 |
| NBT-EVT-065-W0 | Event | 65 house (T20R0301) | door warp to header 60 | step on tile (4,8) | always | ev62 warp 0 | None |
| NBT-EVT-066-01 | Event | 66 house (T20R0401) | resident NPC ow0 | talk | flag 741 set first; else var 0x4108 | 848 S#1,F#1,#2; ev63 ow0; 548 m0-5 | DLG-066-01a-f |
| NBT-DLG-066-01a | Dialogue variant | 66 house (T20R0401) | resident NPC | talk; male | flag 741 clear, var 0x4108 = 0 | 848 S#1; 548 m0 | DLG-066-01b |
| NBT-DLG-066-01b | Dialogue variant | 66 house (T20R0401) | resident NPC | talk; female | flag 741 clear, var 0x4108 = 0 | 848 S#1; 548 m1 | DLG-066-01a |
| NBT-DLG-066-01c | Dialogue variant | 66 house (T20R0401) | resident NPC | talk (F#1); male | flag 741 set (first priority) | 848 F#1; 548 m2 | DLG-066-01d |
| NBT-DLG-066-01d | Dialogue variant | 66 house (T20R0401) | resident NPC | talk (F#1); female | flag 741 set | 848 F#1; 548 m3 | DLG-066-01c |
| NBT-DLG-066-01e | Dialogue variant | 66 house (T20R0401) | resident NPC | talk (F#2); male | flag 741 clear, var 0x4108 >= 1 | 848 F#2; 548 m4 | DLG-066-01f |
| NBT-DLG-066-01f | Dialogue variant | 66 house (T20R0401) | resident NPC | talk (F#2); female | flag 741 clear, var 0x4108 >= 1 | 848 F#2; 548 m5 | DLG-066-01e |
| NBT-EVT-066-W0 | Event | 66 house (T20R0401) | door warp to header 60 | step on tile (3,10) | always | ev63 warp 0 | None |
| NBT-EVT-066-W1 | Event | 66 house (T20R0401) | stairs warp to header 384 | step on tile (3,3) | always | ev63 warp 1 | None |
| NBT-EVT-384-01 | Event | 384 upstairs room | friend NPC ow0 | talk | ladder: badge 0, flag 106, flag 353, leaf count | 849 S#1 + F#1-14; ev341 ow0; 549 m0-16 | DLG-384-01a-p |
| NBT-DLG-384-01a | Dialogue variant | 384 upstairs room | friend | talk; male | badge 0 not held, flag 106 clear | 849 S#1; 549 m0 | DLG-384-01b |
| NBT-DLG-384-01b | Dialogue variant | 384 upstairs room | friend | talk; female | as 01a | 849 S#1; 549 m1 | DLG-384-01a |
| NBT-DLG-384-01c | Dialogue variant | 384 upstairs room | friend | talk (F#2); male | badge 0 not held, flag 106 set | 849 F#2; 549 m2 | DLG-384-01d |
| NBT-DLG-384-01d | Dialogue variant | 384 upstairs room | friend | talk (F#2); female | as 01c | 849 F#2; 549 m3 | DLG-384-01c |
| NBT-DLG-384-01e | Dialogue variant | 384 upstairs room | friend | talk (F#1/#9); male | badge 0 held, 0 Shiny Leaves | 849 F#1,#9; 549 m5 | DLG-384-01f |
| NBT-DLG-384-01f | Dialogue variant | 384 upstairs room | friend | as 01e; female | as 01e | 849 F#1,#9; 549 m6 | DLG-384-01e |
| NBT-DLG-384-01g | Dialogue variant | 384 upstairs room | friend | talk (F#5); male | badge 0 held, flag 353 clear, >= 1 leaf | 849 F#5; 549 m7 | DLG-384-01h |
| NBT-DLG-384-01h | Dialogue variant | 384 upstairs room | friend | as 01g; female | as 01g | 849 F#5; 549 m8 | DLG-384-01g |
| NBT-DLG-384-01i | Dialogue variant | 384 upstairs room | friend | talk (F#12/#14); male | badge 0 held, 1-4 leaves | 849 F#12,#14; 549 m9 | DLG-384-01j |
| NBT-DLG-384-01j | Dialogue variant | 384 upstairs room | friend | as 01i; female | as 01i | 849 F#12,#14; 549 m10 | DLG-384-01i |
| NBT-DLG-384-01k | Dialogue variant | 384 upstairs room | friend | talk (F#7); male | badge 0 held, flag 353 set, 5 leaves | 849 F#7; 549 m11 | DLG-384-01l |
| NBT-DLG-384-01l | Dialogue variant | 384 upstairs room | friend | as 01k; female | as 01k | 849 F#7; 549 m12 | DLG-384-01k |
| NBT-DLG-384-01m | Dialogue variant | 384 upstairs room | friend | after Pokédex screen; male | flag 353 set, 5 or 6 leaves | 849 F#7,#10; 549 m13 | DLG-384-01n |
| NBT-DLG-384-01n | Dialogue variant | 384 upstairs room | friend | as 01m; female | as 01m | 849 F#7,#10; 549 m14 | DLG-384-01m |
| NBT-DLG-384-01o | Dialogue variant | 384 upstairs room | friend | talk (F#6); male | badge 0 held, flag 353 set, 6 leaves | 849 F#6; 549 m15 | DLG-384-01p |
| NBT-DLG-384-01p | Dialogue variant | 384 upstairs room | friend | as 01o; female | as 01o | 849 F#6; 549 m16 | DLG-384-01o |
| NBT-EVT-384-02 | Event | 384 upstairs room | Marill-type object ow1 | talk | hidden while flag 741 set | 849 S#2; ev341 ow1; 549 m4 | DLG-384-02a |
| NBT-DLG-384-02a | Dialogue variant | 384 upstairs room | Marill object | talk | always when visible | 849 S#2; 549 m4 | EVT-384-02 |
| NBT-EVT-384-LS | Event | 384 upstairs room | level script 622 (mapChange -> S#3) | every map entry | flag 741 clear (else empty F#3) | LS622 e0; 849 S#3,F#3 | None |
| NBT-EVT-384-04 | Event | 384 upstairs room | Wii (spawnable 0) | interact tile (8,4), any direction | always | 849 S#4; ev341 spawnable 0; 549 m17 | DLG-384-04a |
| NBT-DLG-384-04a | Dialogue variant | 384 upstairs room | Wii | interaction | always | 849 S#4; 549 m17 | EVT-384-04 |
| NBT-EVT-384-05 | Event | 384 upstairs room | PC (spawnable 1) | A-press tile (6,4) from front | always | 849 S#5; ev341 spawnable 1; 549 m18 | DLG-384-05a |
| NBT-DLG-384-05a | Dialogue variant | 384 upstairs room | PC | interaction | always | 849 S#5; 549 m18 | EVT-384-05 |
| NBT-EVT-384-W0 | Event | 384 upstairs room | stairs warp to header 66 | step on tile (3,4) | always | ev341 warp 0 | None |

## Map 60 — New Bark Town exterior (T20)

### Map 60 reading notes
- **Sources:** `get_events {mapHeader: 60}` (event file 57), `get_script {file: 615}` (level script), `get_script {file: 842}` and `project/scripts/0842.script` (18 scripts, 93 functions, 127 actions), `get_text {archive: 542}` (38 messages, indices 0-37), `get_world_data mapHeader 60` (scriptFileId 842, levelScriptId 615, textArchiveId 542, eventFileId 57, matrix 0, music 1018 day/night, followMode 2). Flag/var names from `~/Programming/hg-engine/armips/include/flags.s` and `vars.s`.
- **Dialogue rendering convention (used in every OLD dialogue field of this section):** `\n` is shown as ` / ` (line break inside one text box), `\r` as ` [scroll] ` (text scrolls within the box), `\f` as ` [new box] `. The OLD raw field gives the exact `get_text` string. Control codes are left as `{STRVAR_1, 3, 0, 0}`; by the preceding `TextPlayerName 0` this one is the player name in text buffer 0 (Inferred from the command order; the token meaning is not documented in `reference/text`). `{STRVAR_1, 0, 1, 0}` in msg 15/16 is text buffer 1, filled by `TextPartyPokemonDefault 1 0` (Inferred).
- **`GenderMessage a b`:** first id is the male-player text, second the female-player text (`docs/scripting-reference.md` line 111: `GenderMsgBox male_text, female_text`).
- **`CheckFlag n` + `JumpIf EQUAL` = flag n is set; `JumpIf LESS` = flag n is clear** (Verified by contrast with script file 843: `CheckFlag 106` / `JumpIf EQUAL Function#22` skips `StarterSelectionScreen`, so EQUAL = set).
- **`Overworld.N` in scripts = the event-file overworld with owID N** (Inferred: owIDs 0-9 equal list indices 0-9 here, and `SetOWPosition Overworld.5 684 0 393 Down` places owID 5 on warp tile (684,393)). `Following` = the follower Pokémon; `Player` = the player.
- **Direction codes after `GetPlayerDirection 0x800C`** (Script 1): 0, 1, 2, 3 (Inferred as Up, Down, Left, Right from which way the NPC is turned to face the player in F1/F22/Script 1).
- **Player position vars:** `GetPlayerPosition 0x4000 0x4001` writes X to temp var 0x4000 and Y to 0x4001; every Y compare below uses the global tile Y (396-402).
- **Undecoded commands (Unresolved):** `MecScript` (Scripts 3, 4, 9), `LocalScript`/`CMD_582` not in scope except Script 11 (NBT-EVT-060-11). Their purpose is not in `docs/scripting-reference.md`.
- **Common scripts called (not defined here):** `CommonScript 2000` (Scripts 8; file 0003 Script 1: closes the board, Verified by text), `CommonScript 2029` (file 0003 Script 30: `StopMusic 0`, `CheckPlayerGender`, then `CallIf` Function#27/#28 by gender, `LocalScript`; Inferred = start of the friend's theme) and `CommonScript 2030` (file 0003 Script 31: `FadeOutMusic 0 30`, `StopMusic 0`, `PlayDefaultMusic`; Verified text, Inferred purpose = restore map music). Id = 2000 + 0-based position in file 3 (`docs/lessons.md` line 53). The working ROM holds the vanilla file 3; hg-engine regenerates it at build time.

### Map 60 event inventory
Coordinates are global tiles (x, y); matrix cell is (21, 12) for all of them. Every entry maps to a record in this section.

| Section | Idx | Type | owID / sprite (overlayTableEntry) | Coordinates | Flag (hides when set) | scriptNumber | Covered by |
|---|---|---|---|---|---|---|---|
| spawnable | 0 | Board, any direction | - | 682,393 | - | 14 | NBT-EVT-060-14 |
| spawnable | 1 | Board, any direction | - | 693,396 | - | 8 | NBT-EVT-060-08 |
| spawnable | 2 | Board, any direction | - | 685,400 | - | 15 | NBT-EVT-060-15 |
| spawnable | 3 | Board, any direction | - | 688,407 | - | 17 | NBT-EVT-060-17 |
| spawnable | 4 | HiddenItem, any direction | - | 682,391 | - | 8000 | NBT-EVT-060-S4 |
| overworld | 0 | Normal, movement 0 None, orient 3 | owID 0 / 148 | 682,391 | 400 | 1 | NBT-EVT-060-01 |
| overworld | 1 | Normal, movement 2 look around, orient 2 | owID 1 / 325 | 683,399 | 0 | 2 | NBT-EVT-060-02 (also moved by NBT-EVT-060-03) |
| overworld | 2 | Normal, movement 3 wander (x 1, y 1), orient 1 | owID 2 / 332 | 685,408 | 0 | 16 | NBT-EVT-060-16 |
| overworld | 3 | Normal, movement 0, orient 1 | owID 3 / 1032 | 695,406 | 417 | 6 | NBT-EVT-060-06 (moved by 04, 09) |
| overworld | 4 | Normal, movement 0, orient 1 | owID 4 / 101 | 688,392 | 418 | 5 | NBT-EVT-060-05 (moved by 04, 09) |
| overworld | 5 | Normal, movement 0, orient 0 | owID 5 / 99 | 703,384 | 0 | 0 (none) | NBT-EVT-060-O5 (moved by 03) |
| overworld | 6 | Normal, movement 14 face up, orient 0 | owID 6 / 328 | 695,403 | 638 | 18 | NBT-EVT-060-18 |
| overworld | 7 | Normal, movement 0, orient 1 | owID 7 / 365 | 695,396 | 678 | 0 (none) | NBT-EVT-060-O7 (moved by 12, 13 = NBT-EVT-060-12, NBT-EVT-060-13) |
| overworld | 8 | Normal, movement 0, orient 2 | owID 8 / 101 | 694,400 | 744 | 5 | NBT-EVT-060-05 (moved by 06) |
| overworld | 9 | Normal, movement 0, orient 3 | owID 9 / 1032 | 693,400 | 744 | 6 | NBT-EVT-060-06 |
| warp | 0 | to header 61, anchor 0, height 0 | - | 684,393 | - | - | NBT-EVT-060-W0 |
| warp | 1 | to header 63, anchor 0, height 0 | - | 695,396 | - | - | NBT-EVT-060-W1 |
| warp | 2 | to header 65, anchor 0, height 0 | - | 679,405 | - | - | NBT-EVT-060-W2 |
| warp | 3 | to header 66, anchor 0, height 0 | - | 690,407 | - | - | NBT-EVT-060-W3 |
| warp | 4 | to header 62, anchor 0, height 0 | - | 688,392 | - | - | NBT-EVT-060-W4 |
| trigger | 0 | rect 1x7, var 16510 (0x407E) == 0 | - | 676,396 | - | 3 | NBT-EVT-060-03 |
| trigger | 1 | rect 1x1, var 16387 (0x4003 temp) == 0 | - | 688,392 | - | 11 | NBT-EVT-060-11 |
| trigger | 2 | rect 1x5, var 16513 (0x4081) == 1 | - | 700,398 | - | 12 | NBT-EVT-060-12 |
| trigger | 3 | rect 1x5, var 16513 (0x4081) == 2 | - | 700,398 | - | 13 | NBT-EVT-060-13 |
| level script 615 | 1 | variableValue: 0x4106 (16646) == 1 then script 4; 0x4072 (16498) == 1 then script 9 | - | - | - | 4, 9 | NBT-EVT-060-LS1 (scripts: NBT-EVT-060-04, -09) |
| level script 615 | 2 | mapChange | - | - | - | 7 | NBT-EVT-060-LS2 (script: NBT-EVT-060-07) |
| level script 615 | 3 | screenReset | - | - | - | 10 | NBT-EVT-060-10 |

Facts read off the inventory: overworld 4 (688,392), warp 4 (688,392) and trigger 1 (688,392) share one tile; overworld 0 (682,391) and spawnable 4 (682,391) share one tile; overworld 7 (695,396) and warp 1 (695,396) share one tile; trigger 2 and 3 are the same rectangle watching the same var for different values. Header 64 (T20R0202) is the only New Bark Town sibling with no warp from this map. Overworld 8 and 9 (flag 744) sit one tile apart at (694,400)/(693,400).

### Map 60 flags and variables used by scripts 1-9 (readers and writers)
Search basis: every `project/scripts/*.script` (497 files, pulled from the working ROM) by number, plus the level script 615 and this event file's `flag` fields. Level scripts and event-file `flag` fields of other maps were not searched (Unresolved for other maps' event files and level scripts). "Header not resolved" means the script file was found but its header was not established (script file ids do not equal header ids; for example header 21 uses script file 201). All such cases are now resolved in "Dependency references (outside New Bark Town)" above.

| Name (flags.s / vars.s) | Number | Read by | Written by |
|---|---|---|---|
| FLAG_HIDE_NEW_BARK_RIVAL | 400 | event file 57 overworld 0 (hide flag) | script file 229 line 210 `SetFlag 400` (elsewhere; header not resolved in the original pass; now resolved: header 143 T30R0201, Route 30 interior). No ClearFlag in any script file |
| FLAG_HIDE_NEW_BARK_MARILL | 417 | event file 57 overworld 3 (hide flag) | set: 842 Script 4, Script 9 (local); 0021 lines 335/358, 0104 lines 435/458 (elsewhere). cleared: 842 Function#10 (local, reached by Script 10 = NBT-EVT-060-10) |
| FLAG_HIDE_NEW_BARK_FRIEND | 418 | event file 57 overworld 4 (hide flag) | set: 842 Script 4, Script 9; 0021 lines 334/357; 0104 lines 434/457; 0149 line 14. cleared: 842 Script 4, Function#10 |
| FLAG_HIDE_NEW_BARK_FRIEND_2 | 744 | event file 57 overworld 8 and 9 (hide flag) | set: 0021 lines 336/359, 0104 lines 436/459, 0149 line 132. cleared: 0843 lines 768 and 801 (NBT, Elm lab file) |
| FLAG_HIDE_NEW_BARK_MOM | 678 | event file 57 overworld 7 (hide flag) | set: 0149 line 106; 842 Functions 58 and 71 (see NBT-EVT-060-12, NBT-EVT-060-13). cleared: 842 Script 12 (NBT-EVT-060-12) |
| FLAG_HIDE_CAMERON | 638 | event file 57 overworld 6 (hide flag) | set/cleared by 842 Script 7 (Functions 9, 34, 35); also set/cleared in many other script files (0013, 0025, 0037, 0059, 0065, 0081, 0099, 0105, 0199, 0237, 0249, 0261, 0735) |
| FLAG_GOT_POKEGEAR | 156 | 842 Script 3 (local), 0845 line 141 (NBT) | 0845 line 147 `SetFlag 156` (NBT) |
| FLAG_GOT_STARTER | 106 | 842 Function#2 and #22 (this file), 0845 line 51, 0843 lines 247 and 303, 0849 line 17 (all NBT) | 0843 line 250 `SetFlag 106` (NBT) |
| FLAG_UNK_189 | 393 | 842 Script 7 `CheckFlag`; 0005, 0022, 0048, 0054 (elsewhere) | 842 Functions 21, 43, 61 (SetFlag/ClearFlag around `TakePhoto`, Script 18 = NBT-EVT-060-18) and Script 7 (ClearFlag); 0005, 0022, 0048, 0054 |
| VAR_SCENE_NEW_BARK_TOWN_OW | 0x4072 (16498) | 842 Script 2, Functions 3 and 26; Script 10; level script 615 entry 1 | 842 Script 9 (`SetVar 0x4072 2`); 0843 lines 156 (3), 294 (1), 602 (3) |
| VAR_SCENE_NEW_BARK_WEST_EXIT | 0x407E (16510) | event file 57 trigger 0; 842 Script 2 (Function#47) | 842 Functions 50 and 92 (`SetVar 0x407E 1`, local). No other writer found |
| VAR_SCENE_PLAYERS_HOUSE_1F | 0x4106 (16646) | level script 615 entry 1 | 842 Script 4 (`SetVar 0x4106 2`); 0845 lines 42 (1) and 114 (4) (NBT); 0825 line 41 (3) (elsewhere; header not resolved in the original pass; now resolved: header 306 T10R0701, Pokémon League) |
| VAR_SCENE_NEW_BARK_EAST_EXIT | 0x4081 (16513) | event file 57 triggers 2 and 3 (scripts of NBT-EVT-060-12, NBT-EVT-060-13) | 0843 lines 769 and 802 (2) (NBT); 0112 lines 277/294 (1), 0104 lines 433/456 (3), 0021 lines 333/356 (3) (elsewhere) |
| VAR_UNK_407C | 0x407C | no reader found | 842 Script 11 and Function#11 (NBT-EVT-060-11) |
| VAR_TEMP_x4003 / x4000 / x4001 / x4002 / x4007 | 0x4003 etc. | trigger 1 watches 0x4003; Scripts 3/7 read 0x4000-0x4002, 0x4007 read by Scripts 12/13 | Script 3 (0x4000/0x4001 via `GetPlayerPosition`), Script 7 (`SetVar 0x4007 0`, `CheckBadge ... 0x4002`, `GetDayOfWeek 0x4000`) |

Reachability note for this map: nothing in the data fixes the order in which the NBT scenes happen; each record below states only the logical conditions. Where a flag or var initial value matters, it is stated as Inferred (script/save variables start at 0, flags start clear).

### Map 60 event records

#### NBT-EVT-060-01 — Rival NPC at the lab path: "famous Elm Pokémon Lab" (script 1)
##### Record identity
- **Record ID:** NBT-EVT-060-01
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-060-01a, NBT-DLG-060-01b; NBT-EVT-060-S4 (hidden item on the same tile)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Talk-to NPC, event file 57 overworld idx 0 (owID 0, sprite 148, at 682,391, hide flag 400)
- **Source references:** script file 842 Script#1, Function#1, #2, #22, #23, #24, #25, #44, #45, #46, #62, Action#1, #31, #49, #50, #51, #52, #53, #69, #70, #71; event file 57 overworld idx 0; text archive 542 msg 13, 14
- **Evidence status:** Verified (script text read from live `get_script` and 0842.script); sprite identity of the NPC is not stated by the data (Unresolved), only the text content is
##### OLD — Current content
- **OLD dialogue:** Two boxes in a row: msg 13 (NBT-DLG-060-01a), then msg 14 (NBT-DLG-060-01b). Both shown on every interaction.
- **OLD raw message data:** msg 13 `...\rSo this is the famous Elm Pokémon Lab...\r`; msg 14 `...What are you staring at?\r`
- **OLD trigger:** Player talks to overworld idx 0 (event-file scriptNumber 1). Starts with `PlayFanfare SEQ_SE_CONFIRM` and `LockAll`; there is no `FacePlayer`: the NPC turns by its own movement actions.
- **OLD conditions and branch priority:** Object visibility: shown while flag 400 (FLAG_HIDE_NEW_BARK_RIVAL) is clear; written only by script file 229 line 210 (`SetFlag 400`, elsewhere), never cleared by any script. No other precondition to start. Branches after the first box, in order: (a) which way the NPC turns depends on the player's facing code (`GetPlayerDirection 0x800C`): code 0 gets Action#1 (WalkOnSpotSouth8), code 1 gets Action#31 (WalkOnSpotNorth8) via Function#1, code 3 gets Action#49 (WalkOnSpotWest8) via Function#22, code 2 gets no turn. (b) After msg 14, `CheckFlag 106` (FLAG_GOT_STARTER, direct): flag clear: code 1 goes to Function#45, code 3 to Function#62, codes 0 and 2 to Function#46; flag set: code 1 goes to Function#25, every other code to Function#46. Reachability class (applies to both messages): Referenced and apparently reachable. Indirect prerequisites: none beyond flag 400 clear. Flag 106 readers: this file, 0845, 0843, 0849 (all NBT); writer 0843 line 250 (NBT).
- **OLD event sequence:** (1) Talk; `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`. (2) `Message 13` (01a), `CloseMessage`. (3) `GetPlayerDirection 0x800C`; turn per branch (a) above, with `WaitMovement` before the next message (Function#2 and #22 begin with it; Function#22 for code 3 turns first). (4) `Message 14` (01b), `CloseMessage`. (5) Branch (b) selects one of four walk-around scenes, each ending `ReleaseAll`, `End`: Function#25 (flag set, code 1): rival Action#50 (WalkNorth6 1, FaceWest 1, WalkWest6 1, FaceSouth 1, WalkSouth6 3), follower Pokémon `Movement Following Action#51` (LockDir, WalkSouth6 6, ReleaseDir), player Action#52 (FaceEast, LockDir, WalkWest6 1, ReleaseDir, FaceNorth, LockDir, WalkSouth6 3, JumpFarSouth, ReleaseDir), `WaitMovement`, rival Action#53 (FaceNorth, WalkNorth8 2, FaceEast, WalkEast8 1), `WaitMovement`. Function#45 (flag clear, code 1): same but without the follower movement. Function#46: rival Action#69 (WalkWest6 1, FaceSouth, WalkSouth6 2), `Movement Following Action#70`, player Action#71 (FaceNorth, LockDir, WalkSouth6 2, JumpFarSouth, ReleaseDir), then Action#53. Function#62 (flag clear, code 3): as #46 without the follower movement. (6) Repeats on every interaction. (7) No calls to global routines.
- **OLD state changes:** None: no flag, var, item or object is changed. The rival and the player end on different tiles from where they started (movement only).
- **OLD repeat/completion behavior:** Repeatable without limit; the same two boxes every time. The rival stays on the map (no `RemoveOW`, no flag).
- **OLD dependencies and shared-resource effects:** Hide flag 400 (written in script file 229). Uses the follower-Pokémon movement `Following`. Shares its tile (682,391) with the hidden-item spawnable idx 4 (NBT-EVT-060-S4). Functions #22-25, #44-46, #62 are used by no other script of file 842 (checked by tracing all 18 scripts).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 13, 14; script 842 Script#1 and Functions #1, #2, #22-25, #44-46, #62; event file 57 object idx 0
- **Other affected callers or records:** None found (msg 13 is used only at 0842.script line 12; msg 14 only at lines 307 and 522; the Functions are reached only from Script#1)
- **Unresolved questions:** Who the NPC is (sprite 148) is not stated in the data. Whether code 2 not turning the NPC is deliberate (the NPC's initial orientation is 3) is Unresolved.
- **Validation needed:** In-game: talk from each of the four sides, with and without a starter (flag 106).

#### NBT-EVT-060-02 — Bag/Pokémon/Pokégear commentary NPC at the west of the town (script 2)
##### Record identity
- **Record ID:** NBT-EVT-060-02
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-060-02a, 02b, 02c, 02d, 02e; NBT-EVT-060-03 (same NPC is moved by that script)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Talk-to NPC, event file 57 overworld idx 1 (owID 1, sprite 325, at 683,399, movement 2 look around, no hide flag)
- **Source references:** script file 842 Script#2, Function#3, #4, #26, #47, #63; event file 57 overworld idx 1; text archive 542 msg 9, 5, 0, 6, 7
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** One message depending on the scene var 0x4072 and var 0x407E: msg 9 (02a), msg 5 (02b), msg 0 (02c), or the gender pair msg 6 / 7 (02d / 02e).
- **OLD raw message data:** msg 9 `I like your Bag!`; msg 5 `Oh! Your Pokémon is adorable!\nI wish I had one!`; msg 0 `Wow, your Pokégear is impressive!`; msg 6 and msg 7 (identical) `Hi, {STRVAR_1, 3, 0, 0}!\nLeaving again?\rYou should tell your mom if you\nare leaving.`
- **OLD trigger:** Player talks to overworld idx 1 (scriptNumber 2): `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** Checked in this order, all direct var reads: (1) 0x4072 (VAR_SCENE_NEW_BARK_TOWN_OW) == 0 gives msg 9; (2) else 0x4072 == 1 gives msg 5; (3) else 0x4072 == 2 gives msg 5; (4) else (any other value) var 0x407E (VAR_SCENE_NEW_BARK_WEST_EXIT) == 1 gives msg 0; (5) else (0x407E not 1) gives `TextPlayerName 0` + `GenderMessage 6 7`. Writers of 0x4072: script file 843 (lines 156 = 3, 294 = 1, 602 = 3; NBT, Elm lab) and 842 Script 9 (= 2); none elsewhere. Writers of 0x407E: only 842 Functions #50, #92 (= 1, in the Script 3 chain); none outside NBT. Initial values of both vars are 0 (Inferred). Reachability: msg 9, 5 and 0 Referenced and apparently reachable; msg 6/7 Referenced with unresolved reachability (needs 0x4072 outside 0-2 while 0x407E is not 1; the data does not show when 0x4072 becomes 3 relative to 0x407E becoming 1).
- **OLD event sequence:** (1) Talk; `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`. (2) `CompareVarValue 0x4072 0` / `JumpIf DIFFERENT Function#3`; if equal `Message 9` and `Jump Function#4`. (3) Function#3 compares to 1 (DIFFERENT goes to Function#26), else `Message 5`; Function#26 compares to 2 (DIFFERENT goes to Function#47), else `Message 5`; Function#47 compares 0x407E to 1 (DIFFERENT goes to Function#63), else `Message 0`. (4) Function#63: `TextPlayerName 0`, `GenderMessage 6 7`, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. All other branches end in Function#4: `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. (5) No movement; no calls to global routines.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable; text depends on current var values.
- **OLD dependencies and shared-resource effects:** Vars 0x4072 and 0x407E. The same object (owID 1) is walked by Script 3's chain (NBT-EVT-060-03).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 9, 5, 0, 6, 7; script 842 Script#2, Functions #3, #4, #26, #47, #63; event file 57 object idx 1
- **Other affected callers or records:** Function#4 is reached only from Script 2 (this record) in 842. Msg 5 is used at 0842.script lines 318 and 553 only (both this script). Msg 0 line 720, msg 9 line 26, msg 6/7 line 871 (this script only).
- **Unresolved questions:** The NPC's role/identity (sprite 325) is not in the data. Msg 5 mentions the player's Pokémon being adorable but is shown for var values 1 and 2 without any Pokémon check.
- **Validation needed:** In-game check at var values 0, 1, 2 and 3 with 0x407E at 0 and 1.

#### NBT-EVT-060-03 — West-exit column: Pokégear / starter gate, and Professor Elm's phone-number scene (script 3)
##### Record identity
- **Record ID:** NBT-EVT-060-03
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-060-03a, 03b, 03c, 03d, 03e, 03f, 03g, 03h, 03i, 03j; NBT-EVT-060-02 (owID 1 is the same object); NBT-EVT-060-O5 (owID 5); NBT-EVT-060-W0 (the door tile the scene animates)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Step-on trigger, event file 57 triggers idx 0 (rectangle at 676,396, 1 wide by 7 tall = tiles y 396 to 402, watching var 16510 = 0x407E for the value 0). Actors: overworld owID 1 (sprite 325) and owID 5 (sprite 99).
- **Source references:** script file 842 Script#3, Function#5, #6, #7, #8, #27-#33, #48-#55, #64-#69, #74-#79, #81-#93, Action#2-#4, #32-#40, #54-#62, #72-#73, #75-#80, #87-#96, #101-#127 (all Y-row variants, listed below); event file 57 trigger idx 0; text archive 542 msg 1, 2, 3, 4, 10, 11, 17, 18, 19, 20
- **Evidence status:** Verified (control flow and action numbers read from live `get_script`/0842.script); meaning of `MecScript`, `RecordPokegearNumber 1`, `SetFollowingPokeMovement 55/48` Inferred or Unresolved as noted
##### OLD — Current content
- **OLD dialogue:** Branch A (no Pokégear flag, scene var not 2): msg 1 or 2 (name call), msg 3, msg 4. Branch B (no Pokégear flag, scene var 2): msg 1 or 2, msg 10, msg 11. Branch C (Pokégear flag set): msg 17, msg 18, msg 19, msg 20. Ids: 03a/03b (1/2), 03c (3), 03d (4), 03e (10), 03f (11), 03g (17), 03h (18), 03i (19), 03j (20).
- **OLD raw message data:** see each NBT-DLG-060-03x record; msg 1 and 2 are both `Wait, {STRVAR_1, 3, 0, 0}!`.
- **OLD trigger:** Player steps on any tile of the column x 676, y 396-402 while var 0x407E equals 0. Trigger fires on entry; nothing is spoken before `LockAll`.
- **OLD conditions and branch priority:** Trigger precondition (direct): var 0x407E (VAR_SCENE_NEW_BARK_WEST_EXIT) == 0 (initial 0, Inferred; only writers are 842 Functions #50/#92, i.e. branch C of this same script). Branch order inside the script: (1) `CheckFlag 156` (FLAG_GOT_POKEGEAR): set gives branch C (Function#5), checked before anything else, whatever 0x4072 is; (2) flag 156 clear: msg 1/2 box, then `CompareVarValue 0x4072 2` (VAR_SCENE_NEW_BARK_TOWN_OW): equal gives branch B (Function#6), else branch A. Y-row sub-branches: the player's global Y (0x4001, value 396 to 402) selects which movement actions are used at each step (tables in the sequence); a Y outside 396-402 skips those movements. Flag 156: reader 0845 line 141 and this script; writer 0845 line 147 (NBT). Var 0x4072 writers: 0843 lines 156 (3), 294 (1), 602 (3); 842 Script 9 (2). Reachability: all ten messages Referenced and apparently reachable on the logic above (branch A needs flag 156 clear and 0x4072 not 2; branch B needs flag 156 clear and 0x4072 == 2; branch C needs flag 156 set; all need 0x407E == 0).
- **OLD event sequence:** (1) `MecScript` (purpose Unresolved), `LockAll`, `CheckFlag 156`, `JumpIf EQUAL Function#5`. **Branch A/B common opening (flag 156 clear):** (2) `Movement Overworld.1 Action#2` (WalkOnSpotWest8, EmoteExclamation, Delay8), `WaitMovement`, `TextPlayerName 0`, `GenderMessage 1 2` (03a/03b), `WaitTime 20 0x800C`, `CloseMessage`, `Movement Player Action#3` (FaceEast), `WaitMovement`, `CompareVarValue 0x4072 2`, `JumpIf EQUAL Function#6`. **Branch A (Function#8 chain):** (3) `GetPlayerPosition 0x4000 0x4001`. Approach movement of owID 1 by player row: 396 Action#4 (direct), 397 Action#38 (Function#7), 398 #60 (#31), 399 #78 (#54), 400 #94 (#68), 401 #106 (#78), 402 #115 (#85, which then repeats the next steps inline); other rows none. Then `WaitMovement`, `Message 3` (03c), `CloseMessage`; then retreat movements (owID 1 action, player action) by row: 396 (#39, #40) [Function#8], 397 (#61, #62) [#32], 398 (#79, #80) [#55], 399 (#95, #96) [#69], 400 (#107, #108) [#79], 401 (#116, #117) [#86], 402 (#123, #124) [#91, which then does the final step inline], other rows none; Function#33: `WaitMovement`, `Message 4` (03d), `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. **Branch B (Function#6 chain):** (3) `GetPlayerPosition`; pre-step by row (player action, owID 1 action): 396 (#36, #37) [Function#6], 397 (#36, #57) [#29], 398 (#36, #75) [#51], 399 (#90, #91) [#66], 400 (#90, #103) [#76], 401 (#90, #112) [#83], 402 (#90, #120) [#89, then inline Message 10 and following]; other rows none. Function#30: `WaitMovement`, `Message 10` (03e), `CloseMessage`, `LockFollowingPoke 0`, `WaitFollowingPoke`, `SetFollowingPokeMovement 55`; step by row (owID 1 action, player action): 396 (#58, #59) [#30], 397 (#76, #77) [#52], 398 (#92, #93) [#67], 399 (#104, #105) [#77], 400 (#113, #114) [#84], 401 (#121, #122) [#90], 402 (#126, #127) [#93, with Function#53 inline], other rows none; Function#53: `WaitMovement`, `WaitFollowingPoke`, `LockFollowingPoke 1`, `SetFollowingPokeMovement 48`, `Message 11` (03f), `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. **Branch C (Function#5, flag 156 set):** (2) `DoorAnimation 21 12 12 9 77`, `OpenDoor 77`, `WaitDoor 77` (door at the tile of warp idx 0), `AddOW Overworld.5`, `SetOWPosition Overworld.5 684 0 393 Down`, `Movement Overworld.5 Action#32` (WalkSouth8 1), `WaitMovement`, `CloseDoor 77`, `WaitDoor 77`, `FreeDoor 77`, `Message 17` (03g), `CloseMessage`, `Movement Player Action#33` (EmoteExclamation, Delay8), `WaitMovement`, `GetPlayerPosition`. (3) Walk to the player by row (owID 5 action, player action): 396 (#34, #35) [Function#5], 397 (#54, #55) [#27], 398 (#72, #55) [#48], 399 (#87, #55) [#64], 400 (#101, #55) [#74], 401 (#110, #88) [#81], 402 (#118, #88) [#87, with Function#28 inline], other rows none. (4) Function#28: `WaitMovement`, `Message 18` (03h), `RecordPokegearNumber 1`, `TextPlayerName 0`, `Message 19` (03i), `PlaySound SEQ_ME_POKEGEAR_REGIST`, `WaitSound`, `Message 20` (03j), `CloseMessage`, `GetPlayerPosition`. (5) Walk-away by row (player action, owID 5 action): 396 (#3, #56) [Function#28], 397 (#3, #73) [#49], 398 (#88, #89) [#65], 399 (owID 5 #102 only) [#75], 400 (#111) [#82], 401 (#119) [#88], 402 (#125) [#92, with Function#50 inline], other rows none. (6) Function#50: `WaitMovement`, `DoorAnimation 21 12 12 9 77`, `OpenDoor 77`, `WaitDoor 77`, `Movement Overworld.5 Action#74` (WalkNorth8 1), `WaitMovement`, `RemoveOW Overworld.5`, `CloseDoor 77`, `WaitDoor 77`, `FreeDoor 77`, `SetVar 0x407E 1`, `ReleaseAll`, `End`. No `CommonScript` calls.
- **OLD state changes:** Branch C only: `RecordPokegearNumber 1` (registers a phone-book entry; argument meaning Inferred = Professor Elm, from msg 19 text "registered Professor Elm in the Pokégear"), `SetVar 0x407E 1` (disables this trigger), object owID 5 added at (684,393), walked, removed. Branches A and B: no flag or var changes.
- **OLD repeat/completion behavior:** Branches A and B repeat each time the player steps into the column (0x407E stays 0). Branch C runs once: after it 0x407E is 1 and the trigger no longer fires; Script 2 (NBT-EVT-060-02) then shows msg 0 for 0x4072 outside 0-2.
- **OLD dependencies and shared-resource effects:** Trigger variable 0x407E (written only by this script; read by Script 2). Flag 156 (writer 0845, NBT). Var 0x4072 (writers 0843 and Script 9). Objects owID 1 (Script 2's NPC) and owID 5 (idle parked object, see NBT-EVT-060-O5). Follower Pokémon locking/movement commands. The door tile (684,393) (door animation slot 77). Uses no global routines; text only from archive 542.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 1, 2, 3, 4, 10, 11, 17, 18, 19, 20; script 842 Script#3 and the Functions listed in Source references; event file 57 trigger idx 0 (and the objects owID 1, owID 5)
- **Other affected callers or records:** Msg 3, 4, 10, 11, 18, 19, 20 are each also reached through a second copy of the same text call inside the Y-row functions (e.g. msg 3 at 0842.script lines 365 and 1048; msg 4 lines 615 and 1120; msg 10 lines 589 and 1096; msg 11 lines 771 and 1153; msg 18-20 lines 565-571 and 1069-1075); msg 1/2 line 37; msg 17 line 338. All callers are inside Script 3's call tree; no other script of file 842 calls these Functions. Script 2 (NBT-EVT-060-02) reads the vars this script writes.
- **Unresolved questions:** `MecScript` purpose; the exact meaning of `SetFollowingPokeMovement 55` and `48` (event-file movement table labels both as "Follow Hero"); why the intro blocks still repeat when flag 156 is clear (no state change); whether the object owID 1's identity matches Script 2's NPC description (it is the same object by owID).
- **Validation needed:** In-game: walk into the column at each of the seven rows (396-402) in each of the three branches; verify flag 156 and var 0x407E initial values; check the follower Pokémon behaviour.

#### NBT-EVT-060-04 — Map-entry scene with Marill and the friend when var 0x4106 is 1 (script 4)
##### Record identity
- **Record ID:** NBT-EVT-060-04
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-060-LS1 (the level-script entry that starts it); NBT-EVT-060-09 (sibling scene, same two objects); NBT-EVT-060-05, NBT-EVT-060-06 (the objects' talk scripts); GLB-RTN-2029, GLB-RTN-2030
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Level script 615 entry 1 (variableValue), condition var 16646 (0x4106, VAR_SCENE_PLAYERS_HOUSE_1F) == 1. Actors: overworld owID 3 (sprite 1032, Marill-type object, flag 417) and owID 4 (sprite 101, friend, flag 418); the player.
- **Source references:** level script 615 entry 1, trigger 1; script file 842 Script#4, Action#5-#12; event file 57 overworld idx 3 and 4
- **Evidence status:** Verified for the sequence; the on-screen identity of owID 3/4 is Inferred from Scripts 5/6 (owID 4 speaks the friend's lines, owID 3 plays Marill's cry)
##### OLD — Current content
- **OLD dialogue:** Not applicable. The script contains no message command.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** When the map loads with var 0x4106 equal to 1 (level script variableValue list, first condition). The trigger mechanism (map entry versus screen reset) is by the level-script kind `variableValue`; exact timing of evaluation is Unresolved (not documented by `reference/scripts`).
- **OLD conditions and branch priority:** Direct: 0x4106 == 1. Writers of 0x4106: 0845 line 42 (sets 1, NBT), 0845 line 114 (sets 4, NBT), 0825 line 41 (sets 3, elsewhere, header not resolved; resolved: header 306 T10R0701, Pokémon League), and this script (sets 2). It is the first of two conditions in the level script's variableValue list; the second (0x4072 == 1 gives Script 9) is NBT-EVT-060-09. Which of two simultaneously true conditions wins is Unresolved (the list order is 0x4106 first). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) `MecScript`, `LockAll`, `Release Overworld.3`. (2) `Movement Overworld.3 Action#5` (Delay32 1, WalkNorth4 8, LockDir, JumpSouth8, ReleaseDir, FaceEast 5, FaceNorth 5, FaceWest 5, FaceNorth 5, WalkNorth8 1, Delay32 1), `WaitMovement`. (3) `PlayFanfare SEQ_SE_DP_KAIDAN2`, `ClearFlag 418`, `AddOW Overworld.4`, `WaitFanfare SEQ_SE_DP_KAIDAN2`. (4) `CommonScript 2029` (GLB-RTN-2029). (5) `Movement Overworld.4 Action#6` (Delay16, WalkSouth8 6, FaceEast, EmoteExclamation), `WaitMovement`; `Movement Overworld.3 Action#7` (FaceWest, EmoteExclamation, WalkOnSpotNorth4 4, FaceSouth/East/North/West 2 each, WalkOnSpotWest4 4, WalkWest4 6), `WaitMovement`. (6) `Movement Player Action#8` (FaceWest 4) and `Movement Overworld.4 Action#9` (WalkOnSpotEast4 4), `WaitMovement`; `Movement Overworld.3 Action#10` (JumpOnSpotWest8 4), `WaitMovement`. (7) `Movement Overworld.4 Action#11` (FaceSouth, WalkSouth8 4, FaceWest, WalkWest8 2) together with `Movement Overworld.3 Action#12` (FaceWest, WalkWest8 1, FaceSouth, WalkSouth8 4, FaceWest, WalkWest8 2), `WaitMovement`. (8) `CommonScript 2030` (GLB-RTN-2030). (9) `SetVar 0x4106 2`, `RemoveOW Overworld.3`, `RemoveOW Overworld.4`, `SetFlag 417`, `SetFlag 418`, `ReleaseAll`, `End`.
- **OLD state changes:** Var 0x4106 becomes 2. Flag 418 cleared during the scene, then 417 and 418 both set at the end (both objects hidden afterwards). Music: `CommonScript 2029` at the start, `CommonScript 2030` at the end.
- **OLD repeat/completion behavior:** Once: 0x4106 leaves the value 1, so the condition no longer holds; only another write of 1 (0845 line 42) re-arms it.
- **OLD dependencies and shared-resource effects:** Flags 417, 418 and the objects owID 3 and 4 (shared with Scripts 5, 6, 9 and Function#10); music routines 2029/2030 (hg-engine regenerates file 3 at build time; the working ROM holds vanilla). Player is locked throughout.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script 842 Script#4, Action#5-#12; level script 615 entry 1; event file 57 objects idx 3, 4
- **Other affected callers or records:** Level script 615 entry 1 (NBT-EVT-060-LS1); no other script calls Script 4. Actions #5-#12 are used only by Script 4.
- **Unresolved questions:** `MecScript` purpose; what `Release Overworld.3` does to an object that is not yet frozen; evaluation timing/priority of the level-script list; whether owID 3 is already on screen (hide flag 417 default clear, no `AddOW` precedes the `Release`).
- **Validation needed:** In-game: reach the state 0x4106 == 1 (set by script file 845) and walk onto the map.

#### NBT-EVT-060-05 — Friend NPC talk script: "I wonder what a Kimono Girl wants from you..." (script 5)
##### Record identity
- **Record ID:** NBT-EVT-060-05
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-060-05a, NBT-DLG-060-05b; NBT-EVT-060-04, NBT-EVT-060-09, NBT-EVT-060-06
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Talk-to NPCs: event file 57 overworld idx 4 (owID 4, sprite 101, at 688,392, hide flag 418) and overworld idx 8 (owID 8, sprite 101, at 694,400, hide flag 744). Both use scriptNumber 5.
- **Source references:** script file 842 Script#5; event file 57 overworld idx 4 and 8; text archive 542 msg 25, 26
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Gender-selected single box: msg 25 (05a, male player, speaker label "Lyra") or msg 26 (05b, female player, speaker label "Ethan").
- **OLD raw message data:** see NBT-DLG-060-05a and 05b.
- **OLD trigger:** Player talks to idx 4 or idx 8. `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** Only the player's gender (`GenderMessage 25 26`: first id male, second female). Visibility: idx 4 is hidden while flag 418 is set; flag 418 set by 0149 line 14, 0021 lines 334/357, 0104 lines 434/457, 842 Scripts 4 and 9; cleared by 842 Script 4 (and Function#10 via Script 10, NBT-EVT-060-10). Idx 8 is hidden while flag 744 is set; set by 0149 line 132, 0021, 0104; cleared by 0843 lines 768 and 801 (NBT). Reachability: idx 8 route Referenced and apparently reachable once 0843 clears 744 (and until 0021/0104 set it again); idx 4 route Referenced with unresolved reachability (the object is shown only inside scenes that keep the player locked).
- **OLD event sequence:** (1) `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`. (2) `GenderMessage 25 26` (05a/05b). (3) `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. No movement, no calls.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** Flags 418 and 744 for visibility; the same script serves two objects (a change affects both).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 25, 26; script 842 Script#5; event file 57 objects idx 4 and idx 8
- **Other affected callers or records:** Msg 25/26 used only at 0842.script line 86; Script 5 is the scriptNumber of both overworld idx 4 and idx 8.
- **Unresolved questions:** Whether the idx 4 route can ever be reached by the player; when 744 is next set after 0843 clears it (0021 and 0104 set it; their headers are not resolved; resolved: 0021 = header 340 D17R0109 Bell Tower, 0104 = header 244 D40R0107 Whirl Islands).
- **Validation needed:** In-game: talk to the friend at (694,400) after the Elm lab scene.

#### NBT-EVT-060-06 — Marill talk script, friend's weight line (script 6)
##### Record identity
- **Record ID:** NBT-EVT-060-06
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-060-06a, 06b, 06c; NBT-EVT-060-05 (object owID 8 is turned by this script)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Talk-to NPCs: event file 57 overworld idx 3 (owID 3, sprite 1032, at 695,406, hide flag 417) and idx 9 (owID 9, sprite 1032, at 693,400, hide flag 744). Both use scriptNumber 6.
- **Source references:** script file 842 Script#6, Action#13, #14; event file 57 overworld idx 3 and 9; text archive 542 msg 33, 31, 32
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Marill cry then msg 33 (06a), then the friend's line msg 31 (06b, male player) or msg 32 (06c, female player).
- **OLD raw message data:** see NBT-DLG-060-06a, 06b, 06c.
- **OLD trigger:** Player talks to idx 3 or idx 9. `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** Only the player's gender for the second box. Visibility: idx 3 hidden while flag 417 is set (set by 0021 lines 335/358, 0104 lines 435/458, 842 Scripts 4 and 9; cleared by 842 Function#10, see NBT-EVT-060-10); idx 9 hidden while flag 744 is set (writers as in NBT-EVT-060-05). Reachability: idx 9 route Referenced and apparently reachable once 0843 clears 744; idx 3 route Referenced with unresolved reachability.
- **OLD event sequence:** (1) `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`. (2) `PlayCry SPECIES_MARILL 0`, `Message 33` (06a), `WaitCry`, `CloseMessage`. (3) `Movement Overworld.9 Action#13` (JumpOnSpotEast16 twice), `WaitMovement`; `Movement Overworld.8 Action#14` (WalkOnSpotWest8), `WaitMovement`. (4) `GenderMessage 31 32` (06b/06c), `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. Movements always address owID 9 and owID 8, regardless of which object (3 or 9) was talked to.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** Flags 417 and 744; the species constant SPECIES_MARILL; owID 8 and 9 hardcoded. One script serves two objects.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 33, 31, 32; script 842 Script#6, Action#13, #14; event file 57 objects idx 3 and idx 9
- **Other affected callers or records:** Msg 33 line 97, msg 31/32 line 104 (this script only). Actions #13, #14 used only by Script 6.
- **Unresolved questions:** What happens if idx 3 is talked to while idx 8/9 are hidden (the movement targets would be hidden objects); whether idx 3 is visible at game start.
- **Validation needed:** In-game: talk to the Marill object near (693,400) after flag 744 clears.

#### NBT-EVT-060-07 — Map-change housekeeping: Cameron visibility flag (script 7)
##### Record identity
- **Record ID:** NBT-EVT-060-07
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-060-LS2 (the level-script entry that runs it); NBT-EVT-060-18 (the NPC owID 6 whose hide flag 638 this script sets)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Level script 615 entry 2 (mapChange, scriptId 7). No dialogue, no object of its own; it controls the hide flag of overworld idx 6 (owID 6, flag 638).
- **Source references:** level script 615 entry 2; script file 842 Script#7, Function#9, #34, #35; event file 57 overworld idx 6 (hide flag 638)
- **Evidence status:** Verified for the commands; the meaning of badge id 2 and of day-of-week value 2 is Unresolved (the data gives only the numbers)
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Every time the map is entered (level script kind `mapChange`).
- **OLD conditions and branch priority:** In order: (1) `CheckFlag 393` (FLAG_UNK_189): clear (`JumpIf LESS`) goes to Function#9; set clears flag 393 and ends, leaving flag 638 as it was. (2) Function#9: `CheckBadge 2 0x4002`; result 0 (badge id 2 not held, Inferred reading of the result) gives Function#34 (`SetFlag 638`, `End`). (3) Else `GetDayOfWeek 0x4000`; value 2 gives Function#35 (`ClearFlag 638`, `End`); any other value falls through to `SetFlag 638`, `End`. Flag 393 readers/writers: 842 Functions #21, #43, #61 (Script 18 chain, NBT-EVT-060-18) set/clear it around `TakePhoto`; script files 0005, 0022, 0048, 0054 (elsewhere) use the same check-and-clear pattern. Flag 638 writers/readers: many script files (see the flag table). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) `GetCounterpartSprite 0x4020` (stores a sprite id in var 0x4020; no reader found). (2) `CheckFlag 393`; `JumpIf LESS Function#9`. (3) If flag 393 set: `ClearFlag 393`, `End`. (4) Function#9: `SetVar 0x4007 0`; `CheckBadge 2 0x4002`; `CompareVarValue 0x4002 0`; `JumpIf EQUAL Function#34`; `GetDayOfWeek 0x4000`; `CompareVarValue 0x4000 2`; `JumpIf EQUAL Function#35`; `SetFlag 638`; `End`.
- **OLD state changes:** Flag 638 (FLAG_HIDE_CAMERON) set or cleared; var 0x4007 reset to 0 on the Function#9 path (0x4007 is the counter Scripts 12 and 13 use, NBT-EVT-060-12, NBT-EVT-060-13); var 0x4020 written; flag 393 cleared when it was set. Cameron (overworld idx 6, script 18) is therefore visible only when badge id 2 is held and `GetDayOfWeek` returns 2.
- **OLD repeat/completion behavior:** Runs at every map entry.
- **OLD dependencies and shared-resource effects:** Flag 638 (shared with 13 other script files), flag 393 (shared with the photo routines), var 0x4007 (shared with the Mom scenes), badge status, system date/time.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script 842 Script#7, Function#9, #34, #35; level script 615 entry 2; event file 57 object idx 6
- **Other affected callers or records:** Level script 615 entry 2 only. Flag 638 is also written by script files 0013, 0025, 0037, 0059, 0065, 0081, 0099, 0105, 0199, 0237, 0249, 0261, 0735.
- **Unresolved questions:** Meaning of badge id 2 and day-of-week 2 in `CheckBadge` / `GetDayOfWeek`; why 0x4007 is reset here.
- **Validation needed:** In-game: enter the map with and without the badge on different weekdays.

#### NBT-EVT-060-08 — Sign: player's house (script 8)
##### Record identity
- **Record ID:** NBT-EVT-060-08
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-060-08a; GLB-RTN-2000; NBT-EVT-060-17 (another sign using the same message index)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Board (sign), event file 57 spawnable idx 1 at 693,396 (type Board, activated from any direction, scriptNumber 8)
- **Source references:** script file 842 Script#8; event file 57 spawnable idx 1; text archive 542 msg 35
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** One board message, msg 35 (08a).
- **OLD raw message data:** see NBT-DLG-060-08a.
- **OLD trigger:** Player reads the board at (693,396) from any side.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) `TextPlayerName 0`. (2) `SetTextBoard 2 0`, `ShowBoard 3`, `WaitBoard`. (3) `BoardMessage 35 0x800C`. (4) `CommonScript 2000` (GLB-RTN-2000; file 0003 Script 1 closes the board, Verified by text). (5) `End`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** GLB-RTN-2000; the text buffer 0 (player name); board type arguments `2 0` and `3` not decoded (Unresolved).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 35; script 842 Script#8; event file 57 spawnable idx 1
- **Other affected callers or records:** Msg 35 is also used by Script 17 (0842.script line 267, with `TextCounterpart 0`, spawnable idx 3 at 688,407, NBT-EVT-060-17). Message 37 (identical text) is not used by any script of file 842.
- **Unresolved questions:** Meaning of `SetTextBoard 2 0`, `ShowBoard 3` arguments.
- **Validation needed:** In-game: read the sign at (693,396).

#### NBT-EVT-060-09 — Map-entry scene: friend congratulates on the first Pokémon (script 9)
##### Record identity
- **Record ID:** NBT-EVT-060-09
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-060-09a, NBT-DLG-060-09b; NBT-EVT-060-LS1; NBT-EVT-060-04; NBT-EVT-060-10 (Script 10 / Function#10 places owID 3 and 4 when 0x4072 is 1); GLB-RTN-2029, GLB-RTN-2030
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Level script 615 entry 1 (variableValue), condition var 16498 (0x4072, VAR_SCENE_NEW_BARK_TOWN_OW) == 1. Actors: owID 3, owID 4, the player and the follower Pokémon.
- **Source references:** level script 615 entry 1, trigger 2; script file 842 Script#9, Action#15-#23; event file 57 overworld idx 3 and 4; text archive 542 msg 15, 16
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Gender-selected message: msg 15 (09a, male player, speaker label "Lyra") or msg 16 (09b, female player, speaker label "Ethan"), shown in one `GenderMessage` with the player name in buffer 0 and the first party Pokémon in buffer 1.
- **OLD raw message data:** see NBT-DLG-060-09a and 09b.
- **OLD trigger:** Map load with var 0x4072 equal to 1 (second condition of the level-script variableValue list).
- **OLD conditions and branch priority:** Direct: 0x4072 == 1. Writers of 0x4072: 0843 line 294 (=1), lines 156 and 602 (=3), and this script (=2). Prerequisite not checked by the script: objects owID 3 and 4 must be on the map: this script has no `AddOW`; they are added by Function#10, which Script 10 (NBT-EVT-060-10, level-script screenReset entry) runs when 0x4072 == 1. Evaluation order against the first list condition (0x4106 == 1) Unresolved. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) `MecScript`, `LockAll`, `CommonScript 2029` (GLB-RTN-2029). (2) `Movement Overworld.4 Action#15` (Delay4 and WalkOnSpot turns, EmoteExclamation) with `Movement Overworld.3 Action#16` (JumpOnSpotEast8 3, WalkSouth4/WalkEast4/WalkNorth4/WalkWest4 steps, WalkOnSpotWest8), `WaitMovement`. (3) `LockFollowingPoke 0`, `WaitFollowingPoke`, `SetFollowingPokeMovement 55`; `Movement Player Action#17` (WalkSouth8 2, WalkEast8 1) with `Movement Overworld.4 Action#18` (Delay8, WalkOnSpotWest8); `WaitMovement`, `WaitFollowingPoke`, `LockFollowingPoke 1`, `SetFollowingPokeMovement 48`. (4) `TextPlayerName 0`, `TextPartyPokemonDefault 1 0`, `GenderMessage 15 16` (09a/09b), `CloseMessage`. (5) `Movement Overworld.4 Action#19` (WalkSouth8 1, WalkWest8 2, WalkSouth8 5, WalkOnSpotNorth8), `Movement Overworld.3 Action#20` (WalkWest8 1, WalkSouth8 1, WalkWest8 2, WalkOnSpotNorth8, Delay8 3, WalkOnSpotSouth8, WalkSouth4 4, JumpOnSpotSouth8 2), `Movement Player Action#21` (Delay8 2, WalkOnSpotSouth8), `WaitMovement`; `Movement Overworld.4 Action#22` (WalkSouth8 3) with `Movement Overworld.3 Action#23` (WalkSouth8 4), `WaitMovement`. (6) `RemoveOW Overworld.3`, `RemoveOW Overworld.4`, `SetFlag 417`, `SetFlag 418`, `CommonScript 2030` (GLB-RTN-2030), `SetVar 0x4072 2`, `ReleaseAll`, `End`.
- **OLD state changes:** Var 0x4072 becomes 2; flags 417 and 418 set; objects owID 3 and 4 removed; music switched by the two common routines.
- **OLD repeat/completion behavior:** Once per setting of 0x4072 to 1 (after it the value is 2, so Script 2 shows msg 5, and the condition no longer holds).
- **OLD dependencies and shared-resource effects:** Flags 417/418, objects owID 3/4 (shared with Scripts 4, 5, 6 and Function#10), follower Pokémon locking, party Pokémon text buffer, music routines 2029/2030. Text msg 15/16 contains the line "Why don't you show it to your mom?" (see the dialogue records).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 15, 16; script 842 Script#9, Action#15-#23; level script 615 entry 1; event file 57 objects idx 3 and 4
- **Other affected callers or records:** Level script 615 entry 1 (NBT-EVT-060-LS1); Script 2 and Script 10 read 0x4072. Msg 15/16 used only at 0842.script line 144.
- **Unresolved questions:** `MecScript`; the exact meaning of `TextPartyPokemonDefault 1 0` arguments (buffer 1, party slot or default 0); order of evaluation against the 0x4106 condition.
- **Validation needed:** In-game: reach 0x4072 == 1 (set at 0843 line 294) and enter the map.

#### NBT-EVT-060-LS1 — Level script entry 1: two var-watch triggers (0x4106 == 1 gives script 4; 0x4072 == 1 gives script 9)
##### Record identity
- **Record ID:** NBT-EVT-060-LS1
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-060-04, NBT-EVT-060-09, NBT-EVT-060-LS2
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Level script 615, entry 1 of 3, kind `variableValue`
- **Source references:** `get_script {file: 615}` (32 bytes, 3 entries); map header 60 `levelScriptId` 615
- **Evidence status:** Verified for the list contents; evaluation semantics Inferred from `reference/scripts` (the entry kinds decide "which script runs on map change, screen reset or load")
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Map-level var watch, in list order: (1) variable 16646 (0x4106) == 1 runs script 4; (2) variable 16498 (0x4072) == 1 runs script 9.
- **OLD conditions and branch priority:** Two direct var checks, listed in this order; at most one `variableValue` entry exists per level script. Whether both can run when both are true, and the exact moment of evaluation, are Unresolved. Readers/writers of both vars are listed in the flag table (0x4106: writers 0845, 0825, 842 Script 4; 0x4072: writers 0843, 842 Script 9). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Evaluate 0x4106 == 1, then run Script 4 (NBT-EVT-060-04). (2) Evaluate 0x4072 == 1, then run Script 9 (NBT-EVT-060-09).
- **OLD state changes:** None of its own (each script sets its own var to 2).
- **OLD repeat/completion behavior:** Evaluated each time the level script is processed; each condition stops holding after its script runs.
- **OLD dependencies and shared-resource effects:** Vars 0x4106, 0x4072; scripts 4 and 9.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** level script 615 entry 1 (written whole with `set_script levelScript`, which replaces the whole trigger list)
- **Other affected callers or records:** Entries 2 and 3 of the same file (NBT-EVT-060-LS2; screenReset entry = script 10, NBT-EVT-060-10) share the single write.
- **Unresolved questions:** Evaluation order and timing of the list.
- **Validation needed:** Test with both vars set at once.

#### NBT-EVT-060-LS2 — Level script entry 2: map change runs script 7
##### Record identity
- **Record ID:** NBT-EVT-060-LS2
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-060-07, NBT-EVT-060-LS1
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Level script 615, entry 2 of 3, kind `mapChange`, scriptId 7
- **Source references:** `get_script {file: 615}`
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Every map change into this map.
- **OLD conditions and branch priority:** None in the entry itself; the conditions are in Script 7. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Run Script 7 (NBT-EVT-060-07).
- **OLD state changes:** See NBT-EVT-060-07.
- **OLD repeat/completion behavior:** Every map change.
- **OLD dependencies and shared-resource effects:** Script 7. Entry 3 (screenReset, scriptId 10) belongs to NBT-EVT-060-10.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** level script 615 entry 2
- **Other affected callers or records:** None found other than the shared whole-list write (see NBT-EVT-060-LS1).
- **Unresolved questions:** None specific.
- **Validation needed:** None beyond Script 7.

#### NBT-EVT-060-O5 — Idle NPC parked at the map's north-east corner; used as Professor Elm's door actor (overworld idx 5)
##### Record identity
- **Record ID:** NBT-EVT-060-O5
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-060-03
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Event file 57 overworld idx 5 (owID 5, sprite 99, at 703,384 = cell tile 31,0, orientation 0, movement 0, hide flag 0, scriptNumber 0)
- **Source references:** event file 57 overworld idx 5; script file 842 Script#3 (`AddOW Overworld.5`, `SetOWPosition Overworld.5 684 0 393 Down`, `RemoveOW Overworld.5` in Functions #5 and #50)
- **Evidence status:** Verified for the event entry and its uses; the sprite's identity is Unresolved (msg 17 and 20 are labelled "Professor Elm", the scene uses this object)
##### OLD — Current content
- **OLD dialogue:** Not applicable (no script of its own).
- **OLD raw message data:** Not applicable.
- **OLD trigger:** None; scriptNumber 0 means it runs nothing when talked to.
- **OLD conditions and branch priority:** Always listed on the map (hide flag 0). Used only by NBT-EVT-060-03 branch C. Reachability: Apparently unused as a talk target; referenced by script 3 as an actor.
- **OLD event sequence:** Not applicable (see NBT-EVT-060-03 branch C).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** After branch C removes it with `RemoveOW`, whether it returns on the next map load is Unresolved (hide flag 0, so Inferred: yes).
- **OLD dependencies and shared-resource effects:** NBT-EVT-060-03.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 57 overworld idx 5
- **Other affected callers or records:** Script 3 Functions #5, #27, #28, #48-#50, #64, #65, #74, #75, #81, #82, #87, #88, #92 address Overworld.5.
- **Unresolved questions:** Sprite 99 identity; behaviour of `AddOW` on an object that is already present.
- **Validation needed:** In-game: view the corner tile (703,384) before triggering the scene.

#### NBT-EVT-060-O7 — Mom NPC object, no script of its own (overworld idx 7)
##### Record identity
- **Record ID:** NBT-EVT-060-O7
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-060-W1 (same tile); NBT-EVT-060-12, NBT-EVT-060-13 (they add and move owID 7)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Event file 57 overworld idx 7 (owID 7, sprite 365, at 695,396, orientation 1, movement 0, hide flag 678 FLAG_HIDE_NEW_BARK_MOM, scriptNumber 0)
- **Source references:** event file 57 overworld idx 7; script file 842 Script#12/#13 and Functions #13-#15, #36-#38, #58, #70, #71 (scripts of NBT-EVT-060-12, NBT-EVT-060-13) address Overworld.7
- **Evidence status:** Verified for the entry; identity "Mom" Inferred from the flag name only
##### OLD — Current content
- **OLD dialogue:** Not applicable (no script of its own).
- **OLD raw message data:** Not applicable.
- **OLD trigger:** None when talked to (scriptNumber 0).
- **OLD conditions and branch priority:** Hidden while flag 678 is set; set by 0149 line 106 and 842 Functions #58, #71, cleared by 842 Script 12 (the latter three belong to NBT-EVT-060-12, NBT-EVT-060-13). Reachability: Apparently unused as a talk target; used as an actor by scripts 12 and 13.
- **OLD event sequence:** Not applicable.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Not applicable.
- **OLD dependencies and shared-resource effects:** Flag 678; scripts 12 and 13; shares the tile of warp idx 1.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 57 overworld idx 7
- **Other affected callers or records:** Scripts 12 and 13 (NBT-EVT-060-12, NBT-EVT-060-13).
- **Unresolved questions:** Sprite 365 identity.
- **Validation needed:** None beyond scripts 12/13.

#### NBT-EVT-060-S4 — Hidden item near the rival's spot (spawnable idx 4)
##### Record identity
- **Record ID:** NBT-EVT-060-S4
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** GLB-RTN-HIDDENITEM; NBT-EVT-060-01 (same tile)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Event file 57 spawnable idx 4 (type HiddenItem, activated from any direction, at 682,391, scriptNumber 8000)
- **Source references:** event file 57 spawnable idx 4; arm9 hidden-item table via `get_rom_table hiddenItems`
- **Evidence status:** Inferred (the event entry is verified; that scriptNumber 8000 selects table entry 0 is not documented in `reference/events`)
##### OLD — Current content
- **OLD dialogue:** Not applicable (item pickup uses the global handler).
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Player interacts with the tile (682,391) (hidden item, any direction).
- **OLD conditions and branch priority:** Calls the global hidden-item routine (GLB-RTN-HIDDENITEM). The `get_rom_table {kind: hiddenItems, index: 0}` entry reads Potion x1 with scriptId 0 (231 entries); the mapping scriptNumber 8000 to entry 0 is Inferred. Repeat gate (found-flag) not shown in the data. Reachability: Referenced with unresolved reachability.
- **OLD event sequence:** (1) Spawnable type 2 with scriptNumber 8000 hands control to the global hidden-item handler (not in file 842); (2) item/amount from the table (Inferred entry 0: Potion x1).
- **OLD state changes:** Item added to the bag; a found flag is expected (Unresolved).
- **OLD repeat/completion behavior:** Unresolved.
- **OLD dependencies and shared-resource effects:** The arm9 hidden-item table and the global handler (script 141 per the journal note in the source section, Inferred).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 57 spawnable idx 4; `set_rom_table hiddenItems` entry (index mapping to be verified)
- **Other affected callers or records:** Any other map whose spawnable uses scriptNumber 8000 would share the same table entry (not searched).
- **Unresolved questions:** The mapping between scriptNumber 8000 and the table entry; the found-flag.
- **Validation needed:** In-game dowsing/search at (682,391).

#### NBT-EVT-060-W0 — Warp: door at (684,393) to header 61 (T20R0101)
##### Record identity
- **Record ID:** NBT-EVT-060-W0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-060-03 (its door animation uses this tile)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Event file 57 warp idx 0 at 684,393 (cell tile 12,9)
- **Source references:** event file 57 warp idx 0; script 842 Function#5 and #50 (`DoorAnimation 21 12 12 9 77`)
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Stepping onto the warp tile (Inferred: standard warp behaviour).
- **OLD conditions and branch priority:** No condition in the data. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Warp to header 61 (T20R0101), anchor 0, height 0.
- **OLD state changes:** None in the data.
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** Destination map header 61 (script file 843).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 57 warp idx 0
- **Other affected callers or records:** Door tile coordinates are hardcoded in script 842 Function#5/#50 (21 12 12 9). Moving the warp would desync the door animation.
- **Unresolved questions:** Which interior header 61 is, by function, is not stated here (documented in its own map section).
- **Validation needed:** In-game entry from the south.

#### NBT-EVT-060-W1 — Warp: door at (695,396) to header 63 (T20R0201)
##### Record identity
- **Record ID:** NBT-EVT-060-W1
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-060-O7 (same tile); NBT-EVT-060-12, NBT-EVT-060-13 (door animation)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Event file 57 warp idx 1 at 695,396 (cell tile 23,12)
- **Source references:** event file 57 warp idx 1; script 842 Script#12 (`DoorAnimation 21 12 23 12 77`), Functions #58, #71
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Stepping onto the warp tile (Inferred).
- **OLD conditions and branch priority:** No condition in the data. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Warp to header 63 (T20R0201), anchor 0, height 0.
- **OLD state changes:** None in the data.
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** Destination header 63; door coordinates hardcoded in scripts 12/13 (NBT-EVT-060-12, NBT-EVT-060-13).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 57 warp idx 1
- **Other affected callers or records:** Scripts 12 and 13 hardcode this door tile.
- **Unresolved questions:** None specific.
- **Validation needed:** In-game entry.

#### NBT-EVT-060-W2 — Warp: door at (679,405) to header 65 (T20R0301)
##### Record identity
- **Record ID:** NBT-EVT-060-W2
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** None
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Event file 57 warp idx 2 at 679,405 (cell tile 7,21)
- **Source references:** event file 57 warp idx 2
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Stepping onto the warp tile (Inferred).
- **OLD conditions and branch priority:** No condition in the data. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Warp to header 65 (T20R0301), anchor 0, height 0.
- **OLD state changes:** None in the data.
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** Destination header 65.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 57 warp idx 2
- **Other affected callers or records:** None found (no script of 842 names this tile).
- **Unresolved questions:** None specific.
- **Validation needed:** In-game entry.

#### NBT-EVT-060-W3 — Warp: door at (690,407) to header 66 (T20R0401)
##### Record identity
- **Record ID:** NBT-EVT-060-W3
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** None
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Event file 57 warp idx 3 at 690,407 (cell tile 18,23)
- **Source references:** event file 57 warp idx 3
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Stepping onto the warp tile (Inferred).
- **OLD conditions and branch priority:** No condition in the data. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Warp to header 66 (T20R0401), anchor 0, height 0.
- **OLD state changes:** None in the data.
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** Destination header 66.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 57 warp idx 3
- **Other affected callers or records:** None found.
- **Unresolved questions:** None specific.
- **Validation needed:** In-game entry.

#### NBT-EVT-060-W4 — Warp: tile (688,392) to header 62 (T20R0102), shared with trigger 1 and overworld 4
##### Record identity
- **Record ID:** NBT-EVT-060-W4
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-060-11 (trigger idx 1 at the same tile and Script 11, which also calls `Warp 62 0 12 6 Left`); NBT-EVT-060-05 (overworld idx 4 stands on the same tile)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Event file 57 warp idx 4 at 688,392 (cell tile 16,8)
- **Source references:** event file 57 warp idx 4; trigger idx 1 (scriptNumber 11, var 0x4003 == 0); script 842 Script#11 and Function#11 (NBT-EVT-060-11)
- **Evidence status:** Verified for the entries; interaction order of warp versus trigger Unresolved
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Stepping onto the warp tile (Inferred).
- **OLD conditions and branch priority:** No condition in the warp record. A trigger on the same tile (trigger idx 1, see NBT-EVT-060-11) may run Script 11 first. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Warp to header 62 (T20R0102), anchor 0, height 0.
- **OLD state changes:** None in the data.
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** Destination header 62; Script 11 (NBT-EVT-060-11).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 57 warp idx 4
- **Other affected callers or records:** Trigger idx 1 / Script 11 (NBT-EVT-060-11).
- **Unresolved questions:** Which of trigger and warp has priority on the shared tile.
- **Validation needed:** In-game entry.

### Map 60 dialogue records

#### NBT-DLG-060-01a — "...So this is the famous Elm Pokémon Lab..."
##### Record identity
- **Record ID:** NBT-DLG-060-01a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-01
- **Related record IDs:** NBT-DLG-060-01b
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** NPC at overworld idx 0 (owID 0)
- **Source references:** script file 842 Script#1 (`Message 13`, line 12 of 0842.script); text archive 542 msg 13
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `...` [scroll] `So this is the famous Elm Pokémon Lab...` [scroll]
- **OLD raw message data:** `...\rSo this is the famous Elm Pokémon Lab...\r`
- **OLD trigger:** Shown by NBT-EVT-060-01 on every interaction, first box, before the NPC turns.
- **OLD conditions and branch priority:** Shown unconditionally once the talk starts (object visible while flag 400 is clear). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent sequence.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction.
- **OLD dependencies and shared-resource effects:** None beyond the parent.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 13
- **Other affected callers or records:** None found (only 0842.script line 12).
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit.

#### NBT-DLG-060-01b — "...What are you staring at?"
##### Record identity
- **Record ID:** NBT-DLG-060-01b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-01
- **Related record IDs:** NBT-DLG-060-01a
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** NPC at overworld idx 0 (owID 0)
- **Source references:** script file 842 Function#2 (line 307) and Function#22 (line 522) `Message 14`; text archive 542 msg 14
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `...What are you staring at?` [scroll]
- **OLD raw message data:** `...What are you staring at?\r`
- **OLD trigger:** Shown by NBT-EVT-060-01 after the NPC has turned, second box.
- **OLD conditions and branch priority:** Always follows 01a; the same message is at two sites (Function#2 for codes 0, 1, 2; Function#22 for code 3). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (4) of the parent sequence.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction.
- **OLD dependencies and shared-resource effects:** None beyond the parent.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 14
- **Other affected callers or records:** Both call sites are in Script 1's tree.
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit.

#### NBT-DLG-060-02a — "I like your Bag!"
##### Record identity
- **Record ID:** NBT-DLG-060-02a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-02
- **Related record IDs:** NBT-DLG-060-02b, 02c, 02d, 02e
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** NPC at overworld idx 1 (owID 1)
- **Source references:** script file 842 Script#2 `Message 9` (line 26); text archive 542 msg 9
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `I like your Bag!`
- **OLD raw message data:** `I like your Bag!`
- **OLD trigger:** Shown by NBT-EVT-060-02 when var 0x4072 equals 0.
- **OLD conditions and branch priority:** First check of the script: 0x4072 == 0 (initial value 0, Inferred). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Parent step (2).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk while the var is 0.
- **OLD dependencies and shared-resource effects:** Var 0x4072.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 9
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-060-02b — "Oh! Your Pokémon is adorable!"
##### Record identity
- **Record ID:** NBT-DLG-060-02b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-02
- **Related record IDs:** NBT-DLG-060-02a, 02c, 02d, 02e
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** NPC at overworld idx 1 (owID 1)
- **Source references:** script file 842 Function#3 (line 318) and Function#26 (line 553) `Message 5`; text archive 542 msg 5
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Oh! Your Pokémon is adorable!` / `I wish I had one!`
- **OLD raw message data:** `Oh! Your Pokémon is adorable!\nI wish I had one!`
- **OLD trigger:** Shown by NBT-EVT-060-02 when var 0x4072 equals 1 (Function#3) or 2 (Function#26).
- **OLD conditions and branch priority:** After the "== 0" check fails: 0x4072 == 1, else 0x4072 == 2. No check that the player has a Pokémon. Reachability: Referenced and apparently reachable (0x4072 = 1 written by 0843 line 294; = 2 by Script 9).
- **OLD event sequence:** Parent step (3).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk while the var is 1 or 2.
- **OLD dependencies and shared-resource effects:** Var 0x4072.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 5
- **Other affected callers or records:** Both call sites are in Script 2's tree.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-060-02c — "Wow, your Pokégear is impressive!"
##### Record identity
- **Record ID:** NBT-DLG-060-02c
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-02
- **Related record IDs:** NBT-DLG-060-02a, 02b, 02d, 02e
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** NPC at overworld idx 1 (owID 1)
- **Source references:** script file 842 Function#47 `Message 0` (line 720); text archive 542 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Wow, your Pokégear is impressive!`
- **OLD raw message data:** `Wow, your Pokégear is impressive!`
- **OLD trigger:** Shown by NBT-EVT-060-02 when 0x4072 is outside 0-2 and var 0x407E equals 1.
- **OLD conditions and branch priority:** Last tier: after 0x4072 != 0, != 1, != 2, then 0x407E == 1 (set only by Script 3 branch C). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Parent step (3).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk while the condition holds.
- **OLD dependencies and shared-resource effects:** Vars 0x4072, 0x407E.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 0
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-060-02d — "Hi, <name>! Leaving again?" (male-player variant)
##### Record identity
- **Record ID:** NBT-DLG-060-02d
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-02
- **Related record IDs:** NBT-DLG-060-02e (identical text, female-player variant), 02a, 02b, 02c
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** NPC at overworld idx 1 (owID 1)
- **Source references:** script file 842 Function#63 `GenderMessage 6 7` (line 871); text archive 542 msg 6
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Hi, {STRVAR_1, 3, 0, 0}!` / `Leaving again?` [scroll] `You should tell your mom if you` / `are leaving.`
- **OLD raw message data:** `Hi, {STRVAR_1, 3, 0, 0}!\nLeaving again?\rYou should tell your mom if you\nare leaving.`
- **OLD trigger:** Shown by NBT-EVT-060-02 for a male player when 0x4072 is outside 0-2 and 0x407E is not 1.
- **OLD conditions and branch priority:** Final fallback after all other tiers; the first id of `GenderMessage 6 7` is the male text. Reachability: Referenced with unresolved reachability (the data does not show when 0x4072 reaches 3 relative to 0x407E reaching 1).
- **OLD event sequence:** Parent step (4); `TextPlayerName 0` precedes it.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk while the condition holds.
- **OLD dependencies and shared-resource effects:** Player name buffer 0; player gender.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 6
- **Other affected callers or records:** Same call as msg 7 (one `GenderMessage 6 7`).
- **Unresolved questions:** Gender order (first id male) taken from `docs/scripting-reference.md` line 111.
- **Validation needed:** Both genders.

#### NBT-DLG-060-02e — "Hi, <name>! Leaving again?" (female-player variant)
##### Record identity
- **Record ID:** NBT-DLG-060-02e
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-02
- **Related record IDs:** NBT-DLG-060-02d (identical text)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** NPC at overworld idx 1 (owID 1)
- **Source references:** script file 842 Function#63 `GenderMessage 6 7` (line 871); text archive 542 msg 7
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Hi, {STRVAR_1, 3, 0, 0}!` / `Leaving again?` [scroll] `You should tell your mom if you` / `are leaving.`
- **OLD raw message data:** `Hi, {STRVAR_1, 3, 0, 0}!\nLeaving again?\rYou should tell your mom if you\nare leaving.`
- **OLD trigger:** As NBT-DLG-060-02d, for a female player.
- **OLD conditions and branch priority:** As 02d; second id of the gender pair. Reachability: Referenced with unresolved reachability.
- **OLD event sequence:** Parent step (4).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk while the condition holds.
- **OLD dependencies and shared-resource effects:** Player name buffer 0; player gender.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 7
- **Other affected callers or records:** Same call as msg 6.
- **Unresolved questions:** None beyond 02d.
- **Validation needed:** Both genders.

#### NBT-DLG-060-03a — "Wait, <name>!" (male-player variant)
##### Record identity
- **Record ID:** NBT-DLG-060-03a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-03
- **Related record IDs:** NBT-DLG-060-03b (identical text, female-player variant)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** NPC owID 1 (sprite 325)
- **Source references:** script file 842 Script#3 `GenderMessage 1 2` (line 37); text archive 542 msg 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Wait, {STRVAR_1, 3, 0, 0}!`
- **OLD raw message data:** `Wait, {STRVAR_1, 3, 0, 0}!`
- **OLD trigger:** Shown by NBT-EVT-060-03 branches A and B (flag 156 clear) right after the NPC's exclamation emote, male player.
- **OLD conditions and branch priority:** Trigger 0 fires (0x407E == 0) and flag 156 is clear. First id of the gender pair is the male text. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Parent branch A/B step (2): `TextPlayerName 0`, `GenderMessage 1 2`, `WaitTime 20`, `CloseMessage`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Each time the column is entered under those conditions.
- **OLD dependencies and shared-resource effects:** Player name buffer 0; player gender.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 1
- **Other affected callers or records:** Same call as msg 2.
- **Unresolved questions:** None.
- **Validation needed:** Both genders.

#### NBT-DLG-060-03b — "Wait, <name>!" (female-player variant)
##### Record identity
- **Record ID:** NBT-DLG-060-03b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-03
- **Related record IDs:** NBT-DLG-060-03a (identical text)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** NPC owID 1 (sprite 325)
- **Source references:** script file 842 Script#3 `GenderMessage 1 2` (line 37); text archive 542 msg 2
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Wait, {STRVAR_1, 3, 0, 0}!`
- **OLD raw message data:** `Wait, {STRVAR_1, 3, 0, 0}!`
- **OLD trigger:** As 03a, female player.
- **OLD conditions and branch priority:** As 03a. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** As 03a.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** As 03a.
- **OLD dependencies and shared-resource effects:** Player name buffer 0; player gender.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 2
- **Other affected callers or records:** Same call as msg 1.
- **Unresolved questions:** None.
- **Validation needed:** Both genders.

#### NBT-DLG-060-03c — "What do you think you're doing?"
##### Record identity
- **Record ID:** NBT-DLG-060-03c
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-03
- **Related record IDs:** NBT-DLG-060-03d
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** NPC owID 1
- **Source references:** script file 842 Function#8 (line 365) and Function#85 (line 1048) `Message 3`; text archive 542 msg 3
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `What do you think you’re doing?` [scroll]
- **OLD raw message data:** `What do you think you’re doing?\r`
- **OLD trigger:** Shown by NBT-EVT-060-03 branch A, after the NPC's approach movement.
- **OLD conditions and branch priority:** Flag 156 clear and 0x4072 != 2 (and 0x407E == 0). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Parent branch A step (3), then retreat movements, then 03d.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Each entry into the column under those conditions.
- **OLD dependencies and shared-resource effects:** Flag 156, var 0x4072.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 3
- **Other affected callers or records:** Two call sites in the Script 3 tree (Function#8 and Function#85, the latter the Y-402 row copy).
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit.

#### NBT-DLG-060-03d — "It's dangerous to go out without a Pokémon!"
##### Record identity
- **Record ID:** NBT-DLG-060-03d
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-03
- **Related record IDs:** NBT-DLG-060-03c
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** NPC owID 1
- **Source references:** script file 842 Function#33 (line 615) and Function#91 (line 1120) `Message 4`; text archive 542 msg 4
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `It’s dangerous to go out without` / `a Pokémon!` [scroll] `Wild Pokémon jump out of the grass` / `on the way to the next town.`
- **OLD raw message data:** `It’s dangerous to go out without\na Pokémon!\rWild Pokémon jump out of the grass\non the way to the next town.`
- **OLD trigger:** Shown by NBT-EVT-060-03 branch A after 03c and the retreat movements; ends with `WaitButton`.
- **OLD conditions and branch priority:** As 03c. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Parent branch A final step.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** As 03c.
- **OLD dependencies and shared-resource effects:** Flag 156, var 0x4072. The text says "Pokémon" but the script checks the Pokégear flag and 0x4072, not party contents.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 4
- **Other affected callers or records:** Function#33 and Function#91, both in the Script 3 tree.
- **Unresolved questions:** Why a Pokégear/scene-var condition gates a text about Pokémon (Unresolved, as read from the script).
- **Validation needed:** Text-box fit.

#### NBT-DLG-060-03e — "Wait a sec!"
##### Record identity
- **Record ID:** NBT-DLG-060-03e
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-03
- **Related record IDs:** NBT-DLG-060-03f
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** NPC owID 1
- **Source references:** script file 842 Function#30 (line 589) and Function#89 (line 1096) `Message 10`; text archive 542 msg 10
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Wait a sec!` [scroll]
- **OLD raw message data:** `Wait a sec!\r`
- **OLD trigger:** Shown by NBT-EVT-060-03 branch B, after the pre-step movement.
- **OLD conditions and branch priority:** Flag 156 clear and 0x4072 == 2 (and 0x407E == 0). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Parent branch B, `Message 10` then follower lock and the step movement.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Each entry into the column under those conditions.
- **OLD dependencies and shared-resource effects:** Flag 156, var 0x4072, follower Pokémon.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 10
- **Other affected callers or records:** Two call sites in the Script 3 tree.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-060-03f — "Did you leave your Pokégear at home?"
##### Record identity
- **Record ID:** NBT-DLG-060-03f
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-03
- **Related record IDs:** NBT-DLG-060-03e
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** NPC owID 1
- **Source references:** script file 842 Function#53 (line 771) and Function#93 (line 1153) `Message 11`; text archive 542 msg 11
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Did you leave your Pokégear at home?` [scroll] `You should ask your mom.`
- **OLD raw message data:** `Did you leave your Pokégear at home?\rYou should ask your mom.`
- **OLD trigger:** Shown by NBT-EVT-060-03 branch B after 03e and the step movement; ends with `WaitButton`.
- **OLD conditions and branch priority:** As 03e. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Parent branch B final step (Function#53 or its Y-402 copy Function#93).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** As 03e.
- **OLD dependencies and shared-resource effects:** Flag 156 (the text matches the flag clear state), var 0x4072.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 11
- **Other affected callers or records:** Function#53 and Function#93 (Script 3 tree).
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-060-03g — "Professor Elm: Wait one second!"
##### Record identity
- **Record ID:** NBT-DLG-060-03g
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-03
- **Related record IDs:** NBT-DLG-060-03h, 03i, 03j
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Object owID 5, labelled Professor Elm in the text
- **Source references:** script file 842 Function#5 `Message 17` (line 338); text archive 542 msg 17
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Professor Elm: Wait one second!` [scroll]
- **OLD raw message data:** `Professor Elm: Wait one second!\r`
- **OLD trigger:** Shown by NBT-EVT-060-03 branch C after the door opens and owID 5 steps out.
- **OLD conditions and branch priority:** Flag 156 set and 0x407E == 0. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Parent branch C step (2).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once, since branch C sets 0x407E to 1.
- **OLD dependencies and shared-resource effects:** Flag 156, var 0x407E, door tile (684,393).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 17
- **Other affected callers or records:** None found (line 338 only).
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-060-03h — "I almost completely forgot about this..." (Elm gives his number)
##### Record identity
- **Record ID:** NBT-DLG-060-03h
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-03
- **Related record IDs:** NBT-DLG-060-03g, 03i, 03j
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Object owID 5 (Professor Elm per the text of neighbouring messages; this message has no speaker label)
- **Source references:** script file 842 Function#28 (line 565) and Function#87 (line 1069) `Message 18`; text archive 542 msg 18
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `I almost completely forgot` / `about this...` [new box] `Here, I’ll give you my number.` [scroll]
- **OLD raw message data:** `I almost completely forgot\nabout this...\fHere, I’ll give you my number.\r`
- **OLD trigger:** Shown by NBT-EVT-060-03 branch C after Elm has walked up to the player.
- **OLD conditions and branch priority:** As 03g. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Parent branch C step (4), immediately before `RecordPokegearNumber 1`.
- **OLD state changes:** None by the message; the following command registers the number.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** The Pokégear phone book.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 18
- **Other affected callers or records:** Function#28 and Function#87 (Y-402 copy), Script 3 tree.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-060-03i — "<name> registered Professor Elm in the Pokégear!"
##### Record identity
- **Record ID:** NBT-DLG-060-03i
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-03
- **Related record IDs:** NBT-DLG-060-03h, 03j
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** System message (no speaker)
- **Source references:** script file 842 Function#28 (line 568) and Function#87 (line 1072) `Message 19`; text archive 542 msg 19
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `{STRVAR_1, 3, 0, 0} registered Professor Elm` / `in the Pokégear!`
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0} registered Professor Elm\nin the Pokégear!`
- **OLD trigger:** Shown by NBT-EVT-060-03 branch C right after `RecordPokegearNumber 1`, with `TextPlayerName 0` before it, followed by `PlaySound SEQ_ME_POKEGEAR_REGIST`.
- **OLD conditions and branch priority:** As 03g. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Parent branch C step (4).
- **OLD state changes:** None by the text.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Player name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 19
- **Other affected callers or records:** Function#28 and Function#87.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-060-03j — "Professor Elm: I'll call you if anything comes up."
##### Record identity
- **Record ID:** NBT-DLG-060-03j
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-03
- **Related record IDs:** NBT-DLG-060-03h, 03i
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Object owID 5, labelled Professor Elm in the text
- **Source references:** script file 842 Function#28 (line 571) and Function#87 (line 1075) `Message 20`; text archive 542 msg 20
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Professor Elm: I’ll call you if` / `anything comes up.` [scroll]
- **OLD raw message data:** `Professor Elm: I’ll call you if\nanything comes up.\r`
- **OLD trigger:** Shown by NBT-EVT-060-03 branch C after 03i; followed by `CloseMessage` and the walk-away movements.
- **OLD conditions and branch priority:** As 03g. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Parent branch C step (4).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None beyond the parent.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 20
- **Other affected callers or records:** Function#28 and Function#87.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-060-05a — Friend: "I wonder what a Kimono Girl wants from you..." (male-player variant, "Lyra")
##### Record identity
- **Record ID:** NBT-DLG-060-05a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-05
- **Related record IDs:** NBT-DLG-060-05b
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Friend NPC, overworld idx 4 or idx 8
- **Source references:** script file 842 Script#5 `GenderMessage 25 26` (line 86); text archive 542 msg 25
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Lyra: I wonder what a Kimono Girl` / `wants from you...`
- **OLD raw message data:** `Lyra: I wonder what a Kimono Girl\nwants from you...`
- **OLD trigger:** Shown by NBT-EVT-060-05 when the player talks to the friend and is male (first id of the pair).
- **OLD conditions and branch priority:** Only gender, plus the object being visible (flags 418 / 744). Reachability: Referenced and apparently reachable (idx 8 route; idx 4 route unresolved, see the parent).
- **OLD event sequence:** Parent step (2).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk.
- **OLD dependencies and shared-resource effects:** Player gender; flags 418/744.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 25
- **Other affected callers or records:** Same call as msg 26; used by two objects through Script 5.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-060-05b — Friend: "I wonder what a Kimono Girl wants from you..." (female-player variant, "Ethan")
##### Record identity
- **Record ID:** NBT-DLG-060-05b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-05
- **Related record IDs:** NBT-DLG-060-05a
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Friend NPC, overworld idx 4 or idx 8
- **Source references:** script file 842 Script#5 `GenderMessage 25 26` (line 86); text archive 542 msg 26
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Ethan: I wonder what a Kimono Girl` / `wants from you...`
- **OLD raw message data:** `Ethan: I wonder what a Kimono Girl\nwants from you...`
- **OLD trigger:** As 05a, female player.
- **OLD conditions and branch priority:** As 05a. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Parent step (2).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk.
- **OLD dependencies and shared-resource effects:** Player gender; flags 418/744.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 26
- **Other affected callers or records:** Same call as msg 25.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-060-06a — "MARILL: Murfu."
##### Record identity
- **Record ID:** NBT-DLG-060-06a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-06
- **Related record IDs:** NBT-DLG-060-06b, 06c
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Marill object, overworld idx 3 or idx 9
- **Source references:** script file 842 Script#6 `PlayCry SPECIES_MARILL 0` + `Message 33` (line 97); text archive 542 msg 33
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `MARILL: Murfu.` [scroll]
- **OLD raw message data:** `MARILL: Murfu.\r`
- **OLD trigger:** Shown by NBT-EVT-060-06 on every talk, with the Marill cry, before the movements.
- **OLD conditions and branch priority:** None beyond the object being visible (flags 417 / 744). Reachability: Referenced and apparently reachable (idx 9 route; idx 3 route unresolved).
- **OLD event sequence:** Parent step (2).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk.
- **OLD dependencies and shared-resource effects:** Species constant SPECIES_MARILL in the script (not in the text).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 33 (the cry is the `PlayCry` argument in Script#6)
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-060-06b — Friend: "Hmm... My Pokémon may be putting on some weight lately..." (male-player variant, "Lyra")
##### Record identity
- **Record ID:** NBT-DLG-060-06b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-06
- **Related record IDs:** NBT-DLG-060-06a, 06c
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Friend NPC (owID 8 is turned toward the Marill by the script)
- **Source references:** script file 842 Script#6 `GenderMessage 31 32` (line 104); text archive 542 msg 31
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Lyra: Hmm... My Pokémon may be` / `putting on some weight lately...`
- **OLD raw message data:** `Lyra: Hmm... My Pokémon may be\nputting on some weight lately...`
- **OLD trigger:** Shown by NBT-EVT-060-06 after the Marill jump and the friend's turn, male player.
- **OLD conditions and branch priority:** Only gender. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Parent step (4); ends with `WaitButton`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk.
- **OLD dependencies and shared-resource effects:** Player gender.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 31
- **Other affected callers or records:** Same call as msg 32.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-060-06c — Friend: "Hmm... My Pokémon may be putting on some weight lately..." (female-player variant, "Ethan")
##### Record identity
- **Record ID:** NBT-DLG-060-06c
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-06
- **Related record IDs:** NBT-DLG-060-06a, 06b
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Friend NPC (owID 8)
- **Source references:** script file 842 Script#6 `GenderMessage 31 32` (line 104); text archive 542 msg 32
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Ethan: Hmm... My Pokémon may be` / `putting on some weight lately...`
- **OLD raw message data:** `Ethan: Hmm... My Pokémon may be\nputting on some weight lately...`
- **OLD trigger:** As 06b, female player.
- **OLD conditions and branch priority:** As 06b. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Parent step (4).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk.
- **OLD dependencies and shared-resource effects:** Player gender.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 32
- **Other affected callers or records:** Same call as msg 31.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-060-08a — Board: "<name>'s House"
##### Record identity
- **Record ID:** NBT-DLG-060-08a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-08
- **Related record IDs:** None
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Board at spawnable idx 1 (693,396)
- **Source references:** script file 842 Script#8 `BoardMessage 35 0x800C` (line 122); text archive 542 msg 35
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `{STRVAR_1, 3, 0, 0}’s House`
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0}’s House`
- **OLD trigger:** Shown by NBT-EVT-060-08 on reading the board, with the player name in buffer 0.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Parent step (3).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every read.
- **OLD dependencies and shared-resource effects:** Player name buffer 0. The same message is also used by Script 17 (another sign, `TextCounterpart 0`).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 35
- **Other affected callers or records:** Script 17 (0842.script line 267; NBT-EVT-060-17) reads the same index. Msg 37 has the same text but is unused in file 842.
- **Unresolved questions:** None.
- **Validation needed:** Both signs after any edit.

#### NBT-DLG-060-09a — Friend's farewell after the first Pokémon (male-player variant, "Lyra")
##### Record identity
- **Record ID:** NBT-DLG-060-09a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-09
- **Related record IDs:** NBT-DLG-060-09b
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Friend NPC owID 4 (speaker label "Lyra")
- **Source references:** script file 842 Script#9 `GenderMessage 15 16` (line 144); text archive 542 msg 15
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Lyra: {STRVAR_1, 3, 0, 0}!` [scroll] `So you picked...` / `{STRVAR_1, 0, 1, 0}!` [scroll] `That’s a cute Pokémon you have!` [scroll] `When you walk with it, it’ll become` / `more friendly.` [scroll] `You should turn around and talk to it` / `sometimes, too.` [scroll] `Oh, that’s right!` / `Why don’t you show it to your mom?` [new box] `See ya!` [scroll]
- **OLD raw message data:** `Lyra: {STRVAR_1, 3, 0, 0}!\rSo you picked...\n{STRVAR_1, 0, 1, 0}!\rThat’s a cute Pokémon you have!\rWhen you walk with it, it’ll become\nmore friendly.\rYou should turn around and talk to it\nsometimes, too.\rOh, that’s right!\nWhy don’t you show it to your mom?\fSee ya!\r`
- **OLD trigger:** Shown by NBT-EVT-060-09 after the follower lock and the friend's approach, male player; buffer 0 is the player name, buffer 1 the Pokémon from `TextPartyPokemonDefault 1 0`.
- **OLD conditions and branch priority:** Var 0x4072 == 1 at map load, male player (first id). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Parent step (4).
- **OLD state changes:** None by the text; the parent sets 0x4072 to 2 afterwards.
- **OLD repeat/completion behavior:** Once per setting of 0x4072 to 1.
- **OLD dependencies and shared-resource effects:** Player name buffer 0; Pokémon buffer 1 (meaning of the arguments of `TextPartyPokemonDefault` Unresolved, shown as the first party member's species/nickname by Inference); player gender.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 15
- **Other affected callers or records:** Same call as msg 16.
- **Unresolved questions:** Which party Pokémon buffer 1 shows.
- **Validation needed:** Both genders, with a Pokémon whose name is long, for box fit.

#### NBT-DLG-060-09b — Friend's farewell after the first Pokémon (female-player variant, "Ethan")
##### Record identity
- **Record ID:** NBT-DLG-060-09b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-09
- **Related record IDs:** NBT-DLG-060-09a
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Friend NPC owID 4 (speaker label "Ethan")
- **Source references:** script file 842 Script#9 `GenderMessage 15 16` (line 144); text archive 542 msg 16
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Same as 09a with the speaker label `Ethan:`.
- **OLD raw message data:** `Ethan: {STRVAR_1, 3, 0, 0}!\rSo you picked...\n{STRVAR_1, 0, 1, 0}!\rThat’s a cute Pokémon you have!\rWhen you walk with it, it’ll become\nmore friendly.\rYou should turn around and talk to it\nsometimes, too.\rOh, that’s right!\nWhy don’t you show it to your mom?\fSee ya!\r`
- **OLD trigger:** As 09a, female player.
- **OLD conditions and branch priority:** As 09a. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Parent step (4).
- **OLD state changes:** None by the text.
- **OLD repeat/completion behavior:** Once per setting of 0x4072 to 1.
- **OLD dependencies and shared-resource effects:** As 09a.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 16
- **Other affected callers or records:** Same call as msg 15.
- **Unresolved questions:** As 09a.
- **Validation needed:** As 09a.



**Header 60, scripts 10–18 of script file 842 (rendering convention).** Dialogue is shown as `get_text` returns it: `\n` = line break within a box, `\r` = wait for button then new box, `\f` = wait for button then scroll; `{STRVAR_1, n, 0, 0}` is a text-buffer token (buffer filled by the preceding `TextPlayerName` / `TextCounterpart`). Script containers were read live with `get_script {file: 842}` and match `project/scripts/0842.script` for Scripts 10–18 (spot-check detail in the worker report). Movement `Action#N` bodies are named but only partly transcribed; branch ladders that differ only in which player row (`0x8005` / `0x800C` values) selects an Action are summarised. Trigger source for every script comes from `get_events {mapHeader: 60}` (event file 57) and `get_script {file: 615}` (level script: variableValue 16646=1→Script 4, 16498=1→Script 9; mapChange→Script 7; screenReset→Script 10).

#### NBT-EVT-060-10 — Screen-reset restore of the two Elm-lab escorts
##### Record identity
- **Record ID:** NBT-EVT-060-10
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-060-04, NBT-EVT-060-09 (scripts 4 and 9; they set flags 417/418 and var 0x4072 that this script restores or tests)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Level script screenReset entry; Overworld.3 (event overworld idx 3, owID 3, flag 417) and Overworld.4 (idx 4, owID 4, flag 418)
- **Source references:** script file 842 Script#10 / Function#10; level script 615 entry 3 (screenReset, scriptId 10); event file 57 overworlds idx 3 and 4 (positions only)
- **Evidence status:** Verified (commands); Inferred (purpose)
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** None (no message read).
- **OLD trigger:** Level script 615, `screenReset` entry → Script#10. Runs each time the map's screen is reset (not a talk/step/sign event). No event-file entry triggers it.
- **OLD conditions and branch priority:** Single check: `CompareVarValue 0x4072 1`, `JumpIf EQUAL Function#10`; otherwise `End`. 0x4072 = VAR_SCENE_NEW_BARK_TOWN_OW (vars.s). Writers: local script 842 Script#9 sets it to 2; script file 843 (Elm's lab) sets it to 3 (lines 156, 602) and to 1 (line 294, Script 13 end area: `SetVar 0x4072 1` after GenderMessage 12 13); readers: 842 Scripts 2 (0x4072 0, 2→ Function#3 chain), Function#3, #26, and this script. No writers outside NBT found (grep of project/scripts). Reachability: Referenced and apparently reachable (value 1 is set by script file 843).
- **OLD event sequence:** (1) screen reset on header 60; (2) if 0x4072 == 1 → Function#10: `ClearFlag 418`, `AddOW Overworld.4`, `ClearFlag 417`, `AddOW Overworld.3`, `SetOWPosition Overworld.4 686 0 396 Left`, `SetOWPosition Overworld.3 685 0 396 Down`, `End`; (3) no dialogue, no movement/wait, no lock; (4) flags 417 (FLAG_HIDE_NEW_BARK_MARILL) and 418 (FLAG_HIDE_NEW_BARK_FRIEND) cleared so both NPCs are shown and placed at global (686,396) facing Left and (685,396) facing Down; (5) no completion beyond End; (6) no GLB calls.
- **OLD state changes:** Clears flags 417 and 418; (re)adds Overworld.3 and Overworld.4 at the listed tiles. Flags 417/418 writers: local 842 (ClearFlag 418 at Script 4 and Function#10; ClearFlag 417 Function#10; SetFlag 417/418 Scripts 4 and 9); elsewhere: script files 0021, 0104, 0149 (SetFlag 417/418 or 418 only) — header mapping for those files not resolved (resolved: 0021 = header 340 D17R0109 Bell Tower; 0104 = header 244 D40R0107 Whirl Islands; 0149 = no header uses it, not a map script file).
- **OLD repeat/completion behavior:** Re-runs on every screen reset while 0x4072 == 1; no state change prevents repetition.
- **OLD dependencies and shared-resource effects:** Overworld.3/4 sprites and flags 417/418 shared with NBT-EVT-060-04 / -09.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 842 Script#10, Function#10; level script 615 entry 3 (screenReset, scriptId 10); var 0x4072; flags 417, 418
- **Other affected callers or records:** Function#10 has no other caller (grep 0842.script). Script#10 only via the level script.
- **Unresolved questions:** Which map header uses script files 0021/0104/0149 (writers of flags 417/418) (resolved: 0021 = header 340 Bell Tower, 0104 = header 244 Whirl Islands, 0149 = no header).
- **Validation needed:** Confirm in-game that the two NPCs appear at the stated tiles when 0x4072 == 1.

#### NBT-EVT-060-11 — Step onto the Elm Lab door tile: warp to header 62
##### Record identity
- **Record ID:** NBT-EVT-060-11
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** None
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Step trigger rectangle at global (688,392), 1×1 tile
- **Source references:** script file 842 Script#11 / Function#11; event file 57 triggers idx 1 (scriptNumber 11, variableWatched 16387 = 0x4003, expectedVarValue 0); same tile holds warp idx 4 (header 62) and overworld idx 4 (script 5, flag 418)
- **Evidence status:** Verified (commands); Unresolved (what `CMD_582` does, which interior header 62 is)
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** None.
- **OLD trigger:** Event file 57 trigger idx 1, area 1×1 at (688,392), fires when var 0x4003 (VAR_TEMP_x4003) == 0.
- **OLD conditions and branch priority:** In order: (1) `CheckPokemonAlive 0x800C`; if 0x800C == 0 → Function#11 (skips follower handling); (2) `GetFollowingPokeSize 0x800C`; if 0x800C != 1 → Function#11; (3) otherwise (follower size 1) fall through to `SendBackFollowingPoke` then the same body. Var 0x4003 is a shared temp var written in many script files (0005, 0021, 0069, 0085, 0087, 0103, 0119 …); no write to it in 842. Reachability: Referenced and apparently reachable; whether 0x4003 is 0 on map entry is Inferred (temp var).
- **OLD event sequence:** (1) player steps on the tile with 0x4003 == 0; (2) pokemon-alive / follower-size checks as above; (3) no dialogue; (4) fan-out: [if follower size 1: `SendBackFollowingPoke`], `PlayFanfare SEQ_SE_DP_KAIDAN2`, `FadeScreen 6 1 0 0`, `WaitFadeScreen`, `Warp 62 0 12 6 Left` (header 62, x 12, y 6, facing Left), `FadeScreen 6 1 1 0`, `WaitFadeScreen`, `WaitFanfare SEQ_SE_DP_KAIDAN2`, `CMD_582 60 688 393` (undecoded command; args look like header 60 and tile 688,393 — purpose Unresolved), `SetVar 0x407C 1`, `End`. No LockAll / ReleaseAll in this script.
- **OLD state changes:** Var 0x407C (VAR_UNK_407C) set to 1; no readers of 0x407C found in project/scripts; writers are only 842 Script#11 and Function#11.
- **OLD repeat/completion behavior:** Fires each time the player steps on the tile while 0x4003 == 0.
- **OLD dependencies and shared-resource effects:** Warp destination header 62 (see its own section). `CMD_582` args reference this map's tile 688,393.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 842 Script#11, Function#11; event file 57 triggers idx 1; var 0x4003 / 0x407C
- **Other affected callers or records:** Function#11 has no caller other than Script#11 (grep 0842.script). Warp idx 4 at the same tile is a separate event record (NBT-EVT-060-W4).
- **Unresolved questions:** `CMD_582` semantics; whether the trigger plus warp on the same tile both fire.
- **Validation needed:** Walk onto the tile with and without a follower.

#### NBT-EVT-060-12 — Eastern-exit scene, Mom stops the player (var 0x4081 == 1)
##### Record identity
- **Record ID:** NBT-EVT-060-12
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-060-12a, NBT-DLG-060-12b, NBT-DLG-060-12c, NBT-DLG-060-12d, NBT-EVT-060-13 (sister trigger)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Step trigger column at global x 700, y 398–402 (1×5); Overworld.7 (idx 7, owID 7, sprite 365, flag 678 = FLAG_HIDE_NEW_BARK_MOM) — read here as Mom
- **Source references:** script file 842 Script#12 / Function#12, #13, #14, #15, #36, #37, #38, #56, #57, #58, #70, #71; event file 57 triggers idx 2 (scriptNumber 12, variableWatched 16513 = 0x4081, expectedVarValue 1); text archive 542 msgs 21, 22, 23, 24
- **Evidence status:** Verified (commands/text); Inferred (that Overworld.7 is the player's Mom)
##### OLD — Current content
- **OLD dialogue:** Not applicable (see dialogue records; 12a = msg 24, 12b = msg 21, 12c = msg 22, 12d = msg 23).
- **OLD raw message data:** See dialogue records.
- **OLD trigger:** Event file 57 trigger idx 2: x 700, y 398, width 1, height 5, fires when var 0x4081 (VAR_SCENE_NEW_BARK_EAST_EXIT) == 1.
- **OLD conditions and branch priority:** (1) `CompareVarValue 0x4007 2`; if equal → Function#12 (second-attempt branch, msg 24, then release). (2) Otherwise door/Mom sequence. After Mom walks, `CompareVarValue 0x4007 0`; if different → Function#13 (skip msg 21), else msg 21. 0x4007 = VAR_TEMP_x4007 (temp var; set to 0 by script 842 Function#9, incremented by Functions #58/#71). Writers of 0x4081: script files 0021 and 0104 (SetVar 3), 0112 (SetVar 1, lines 277/294), 0843 (SetVar 2, lines 769/802) — header mapping not resolved (resolved: 0021 = header 340 Bell Tower, 0104 = header 244 Whirl Islands, 0112 = header 288 Dragon's Den). Mom visible flag 678 (FLAG_HIDE_NEW_BARK_MOM): ClearFlag in this script, SetFlag in Functions #58/#71 and in script file 0149. Reachability: Referenced and apparently reachable when 0x4081 == 1 (writer 0112 exists).
- **OLD event sequence:** (1) step into trigger with 0x4081 == 1; `MecScript`, `LockAll`; (2) if 0x4007 == 2 → Function#12: msg 24 (NBT-DLG-060-12a), `CloseMessage`, follower lock/`SetFollowingPokeMovement 55`, `Movement Player Action#41` (WalkWest8 1), `WaitMovement`, follower unlock/`SetFollowingPokeMovement 48`, `ReleaseAll`, `End`; (3) else `DoorAnimation 21 12 23 12 77`, `OpenDoor 77`, `WaitDoor 77`, `PlayFanfare SEQ_SE_DP_KAIDAN2`, `ClearFlag 678`, `AddOW Overworld.7`, `WaitFanfare`, `Movement Overworld.7 Action#24` (WalkSouth8 1), `WaitMovement`; (4) if 0x4007 == 0: `TextPlayerName 0`, msg 21 (NBT-DLG-060-12b), `CloseMessage`, `CloseDoor 77`, `WaitDoor 77`, `FreeDoor 77` (Function#13 does the door close without msg); then `GetPlayerPosition 0x8004 0x8005`, `LockFollowingPoke 0`, `WaitFollowingPoke`, `SetFollowingPokeMovement 55`; (5) player-row ladder on 0x8005: 398 → Overworld.7 Action#25 + Player Action#26; 399 → Action#42 + #43 (Function#14); 400 → Action#63 + #64 (Function#36); 401 → Action#63 + Player Action#81 (Function#56); otherwise Function#70 (Action#63 + #97); all jump to Function#15: `WaitMovement`, `WaitFollowingPoke`, `LockFollowingPoke 1`, `SetFollowingPokeMovement 48`; (6) if 0x4007 == 0 msg 22 (NBT-DLG-060-12c), `CloseMessage` (Function#38); else msg 23 (NBT-DLG-060-12d), `CloseMessage` (Function#37; Function#70 also uses msg 22 under the same 0x4007 test); (7) row ladder on 0x8005 again: 398 → Overworld.7 Action#65 (WalkNorth8 1); 399 → Action#82 (WalkNorth8 2) (Function#57); else Function#71 variant (Action#98 WalkNorth8 3 then Function#58-like door exit); then Function#58: `DoorAnimation 21 12 23 12 77`, `OpenDoor`, `WaitDoor`, `Movement Overworld.7 Action#83` (WalkNorth8 1), `WaitMovement`, `SetFlag 678`, `PlayFanfare SEQ_SE_DP_KAIDAN2`, `RemoveOW Overworld.7`, `WaitFanfare`, `CloseDoor`, `WaitDoor`, `FreeDoor`, `IncrementVar 0x4007 1`, `ReleaseAll`, `End`.
- **OLD state changes:** Flag 678 cleared then set; var 0x4007 incremented once per full run; Overworld.7 added then removed. Player forced west by one step via Action#26/#43/#64/#81/#97 (Player walks 2–4 west per row; Action#26 is `WalkOnSpotWest8 1; WalkWest8 4`).
- **OLD repeat/completion behavior:** Fires each time the player walks through the column while 0x4081 == 1 (the script does not change 0x4081). 0x4007 counts attempts within a map visit: 0 → msgs 21 + 22 (first), 1 → msg 23 (second), value 2 → Function#12 msg 24 (third). Any other value goes via msg 23 path.
- **OLD dependencies and shared-resource effects:** Shared Functions with other scripts: none (grep 0842.script) except Function#14/#15/#36/#37/#38/#56/#57/#58/#70/#71 are used only by Script#12. Reads flag 678; no GLB calls. Follower-Pokémon commands (`LockFollowingPoke`, `SetFollowingPokeMovement 55/48`).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 842 Script#12 + Functions listed above; event file 57 triggers idx 2; text 542 msgs 21–24; var 0x4081; flag 678
- **Other affected callers or records:** Function#12–#15, #36–#38, #56–#58, #70, #71: only Script#12. Messages 21–24 used only here.
- **Unresolved questions:** Which script/Overworld sets 0x4081 to 1 in file 0112 (map header not mapped; resolved: header 288 D44R0103, Dragon's Den). Identity of Overworld.7 as Mom is Inferred from flag name FLAG_HIDE_NEW_BARK_MOM.
- **Validation needed:** Play through all three trigger attempts (0x4007 = 0, 1, 2).

#### NBT-DLG-060-12a — Mom, third attempt rebuke
##### Record identity
- **Record ID:** NBT-DLG-060-12a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-12
- **Related record IDs:** None
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Overworld.7 (Inferred: Mom)
- **Source references:** script file 842 Function#12 (`Message 24`); text archive 542 msg 24
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** I’m getting upset!
- **OLD raw message data:** `I’m getting upset!\r`
- **OLD trigger:** Shown by NBT-EVT-060-12 when 0x4007 == 2 at the start of Script#12.
- **OLD conditions and branch priority:** First check of Script#12 after `LockAll`; wins over 12b/12c/12d.
- **OLD event sequence:** Message 24, `CloseMessage`, follower/Player Action#41, `ReleaseAll`. Note Overworld.7 was not added in this branch (the AddOW is below the check), so this message is spoken with no visible Mom unless she is already on the map (Unresolved).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats every trigger while 0x4007 == 2.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 24
- **Other affected callers or records:** None found (grep: only Function#12).
- **Unresolved questions:** Whether 0x4007 can reach 2 (incremented by Functions #58/#71 once per run; reset only by 842 Function#9 on map change).
- **Validation needed:** Trigger the column three times in one visit.

#### NBT-DLG-060-12b — Mom, "Where are you going?"
##### Record identity
- **Record ID:** NBT-DLG-060-12b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-12
- **Related record IDs:** None
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Overworld.7 (Inferred: Mom)
- **Source references:** script file 842 Script#12 (`TextPlayerName 0`, `Message 21`); text archive 542 msg 21
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** {STRVAR_1, 1, 0, 0}! Where are you going?
- **OLD raw message data:** `{STRVAR_1, 1, 0, 0}! Where are you going?\r`
- **OLD trigger:** Shown by NBT-EVT-060-12 when 0x4081 == 1, 0x4007 != 2 and 0x4007 == 0 after Mom has walked out.
- **OLD conditions and branch priority:** Second branch of Script#12; skipped (Function#13) when 0x4007 != 0.
- **OLD event sequence:** `TextPlayerName 0`, Message 21, `CloseMessage`, door close.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once per visit (0x4007 becomes 1 after the run).
- **OLD dependencies and shared-resource effects:** Buffer 0 = player name.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 21
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Name token renders the player's name.

#### NBT-DLG-060-12c — Mom, Elm is waiting (first attempt)
##### Record identity
- **Record ID:** NBT-DLG-060-12c
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-12
- **Related record IDs:** NBT-DLG-060-12d
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Overworld.7 (Inferred: Mom)
- **Source references:** script file 842 Function#15 and Function#70 (`Message 22`); text archive 542 msg 22
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm has been waiting for you. [wait] He said he has something to give you.
- **OLD raw message data:** `Professor Elm has been waiting for you.\fHe said he has something to give you.\r`
- **OLD trigger:** Shown by NBT-EVT-060-12 after the player is moved west, when 0x4007 == 0.
- **OLD conditions and branch priority:** Function#15 / #70: `CompareVarValue 0x4007 0`; equal → this message; different → 12d.
- **OLD event sequence:** Message 22, then Function#38 (`CloseMessage`, row ladder, exit).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** First run per visit.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 22
- **Other affected callers or records:** Only NBT-EVT-060-12 (Functions #15, #70).
- **Unresolved questions:** None.
- **Validation needed:** None beyond play-through.

#### NBT-DLG-060-12d — Mom, repeated reminder
##### Record identity
- **Record ID:** NBT-DLG-060-12d
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-12
- **Related record IDs:** NBT-DLG-060-12c
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Overworld.7 (Inferred: Mom)
- **Source references:** script file 842 Function#37 (`Message 23`); text archive 542 msg 23
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Did you not hear me saying that Professor Elm is waiting for you?
- **OLD raw message data:** `Did you not hear me saying that\nProfessor Elm is waiting for you?\r`
- **OLD trigger:** Shown by NBT-EVT-060-12 when 0x4007 != 0 (and != 2) at the Function#15 / #70 test.
- **OLD conditions and branch priority:** After 12a and 12b/12c tests; reached only when 0x4007 is 1.
- **OLD event sequence:** Message 23, `CloseMessage`, row ladder, exit door.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Second run per visit.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 23
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None beyond play-through.

#### NBT-EVT-060-13 — Eastern-exit scene, rival-friend stops the player (var 0x4081 == 2)
##### Record identity
- **Record ID:** NBT-EVT-060-13
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-060-13a, NBT-DLG-060-13b, NBT-DLG-060-13c, NBT-DLG-060-13d, NBT-EVT-060-12 (sister trigger on the same tiles)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Step trigger column at global x 700, y 398–402 (1×5); Overworld.8 (idx 8, owID 8, sprite 101, flag 744 = FLAG_HIDE_NEW_BARK_FRIEND_2, script 5)
- **Source references:** script file 842 Script#13 / Function#16, #17, #39, #40, #41, #59, #60, #72, #73, #80; event file 57 triggers idx 3 (scriptNumber 13, variableWatched 16513 = 0x4081, expectedVarValue 2); text archive 542 msgs 27, 28, 29, 30
- **Evidence status:** Verified (commands/text); Inferred (which of the two GenderMessage texts shows for which player gender; speaker identity)
##### OLD — Current content
- **OLD dialogue:** Not applicable (13a = msg 27, 13b = msg 28, 13c = msg 29, 13d = msg 30).
- **OLD raw message data:** See dialogue records.
- **OLD trigger:** Event file 57 trigger idx 3: x 700, y 398, width 1, height 5, fires when var 0x4081 (VAR_SCENE_NEW_BARK_EAST_EXIT) == 2. Same rectangle as trigger idx 2; only the var value differs.
- **OLD conditions and branch priority:** Direct: 0x4081 == 2 (trigger). In-script: `GenderMessage 27 28` selects one of two messages by player gender (rule not read from the ROM here; Inferred). Row ladder on `GetPlayerPosition` y-value 0x8005 (398 / 399 / otherwise). Writers of 0x4081 == 2: script file 0843 (Elm's lab) lines 769 and 802, which also `ClearFlag 744` (shows Overworld.8); other 0x4081 writers 0021, 0104 (3) and 0112 (1). Reachability: Referenced and apparently reachable (0843 writes 2).
- **OLD event sequence:** (1) step into trigger with 0x4081 == 2; `MecScript`, `LockAll`; (2) `Movement Overworld.8 Action#27` (FaceEast, EmoteExclamation), `WaitMovement`; `TextPlayerName 0`; `GenderMessage 27 28` (NBT-DLG-060-13a / 13b); `CloseMessage`; (3) `GetPlayerPosition 0x8004 0x8005`, `LockFollowingPoke 0`, `WaitFollowingPoke`, `SetFollowingPokeMovement 55`; (4) row ladder: 0x8005 == 398 → `Movement Overworld.8 Action#28` (WalkOnSpotEast8); 399 → Action#44 (same); otherwise the ladder Functions #39 / #59 each re-test 399 and finally Function#72: `Movement Overworld.8 Action#99`, `Movement Player Action#45`, then merges into the common tail; (5) Function#17 common tail: `Movement Player Action#45` (WalkWest8 2), `WaitMovement`, `WaitFollowingPoke`, `LockFollowingPoke 1`, `SetFollowingPokeMovement 48`, `TextPlayerName 0`, `GenderMessage 29 30` (13c / 13d), `CloseMessage`; (6) second ladder on 0x8005 (398 → Overworld.8 Action#46; 399 → Action#85/#67 variants via Functions #40, #60, #73, #80) ending `Movement Overworld.8 Action#109` or `Action#46` (WalkOnSpotWest8), `WaitMovement`, `ReleaseAll`, `End`. Ladder detail: repeated 399 tests in Functions #39/#59/#72 and #40/#60/#73 look like a generation artifact; exact Action bodies for #85, #99, #100, #109 not transcribed (Unresolved, low impact).
- **OLD state changes:** None to flags/vars. Player is walked 2 tiles west (Action#45). Overworld.8 faces east then west.
- **OLD repeat/completion behavior:** Repeats whenever the player enters the column while 0x4081 == 2; the script never changes 0x4081.
- **OLD dependencies and shared-resource effects:** Follower-Pokémon lock commands. Functions #16, #17, #39, #40, #41, #59, #60, #72, #73, #80 are used only by Script#13 (grep). Flag 744 writers: 0843 (Clear), 0021, 0104, 0149 (Set).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 842 Script#13 + Functions listed; event file 57 triggers idx 3; text 542 msgs 27–30; var 0x4081 value 2; flag 744
- **Other affected callers or records:** None shared with scripts 1–9 (Function numbers above belong only to Script#13; confirm via grep). Overworld idx 8 and 9 (script 5 / 6) are other records.
- **Unresolved questions:** Which player gender gets which GenderMessage text; header mapping for files 0021/0104/0112/0149 (resolved: 340 Bell Tower, 244 Whirl Islands, 288 D44R0103 Dragon's Den, none).
- **Validation needed:** Play with both genders; check both rows 398/399 and other rows.

#### NBT-DLG-060-13a — Lyra greeting
##### Record identity
- **Record ID:** NBT-DLG-060-13a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-13
- **Related record IDs:** NBT-DLG-060-13b
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Overworld.8
- **Source references:** script file 842 Script#13 (`GenderMessage 27 28`, first argument); text archive 542 msg 27
- **Evidence status:** Verified (text); Inferred (selection rule)
##### OLD — Current content
- **OLD dialogue:** Lyra: Hi, {STRVAR_1, 3, 0, 0}!
- **OLD raw message data:** `Lyra: Hi, {STRVAR_1, 3, 0, 0}!\r`
- **OLD trigger:** Shown by NBT-EVT-060-13 when `GenderMessage 27 28` selects its first message (selection by player gender; direction Inferred, not verified).
- **OLD conditions and branch priority:** Mutually exclusive with 13b.
- **OLD event sequence:** After `TextPlayerName 0`, before `CloseMessage`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every run of Script#13.
- **OLD dependencies and shared-resource effects:** Buffer 0 = player name.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 27
- **Other affected callers or records:** None found.
- **Unresolved questions:** Gender-selection direction.
- **Validation needed:** Test both genders.

#### NBT-DLG-060-13b — Ethan greeting
##### Record identity
- **Record ID:** NBT-DLG-060-13b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-13
- **Related record IDs:** NBT-DLG-060-13a
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Overworld.8
- **Source references:** script file 842 Script#13 (`GenderMessage 27 28`, second argument); text archive 542 msg 28
- **Evidence status:** Verified (text); Inferred (selection rule)
##### OLD — Current content
- **OLD dialogue:** Ethan: Hey, {STRVAR_1, 3, 0, 0}!
- **OLD raw message data:** `Ethan: Hey, {STRVAR_1, 3, 0, 0}!\r`
- **OLD trigger:** Shown by NBT-EVT-060-13 when `GenderMessage 27 28` selects its second message.
- **OLD conditions and branch priority:** Mutually exclusive with 13a.
- **OLD event sequence:** As 13a.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every run of Script#13.
- **OLD dependencies and shared-resource effects:** Buffer 0 = player name.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 28
- **Other affected callers or records:** None found.
- **Unresolved questions:** Gender-selection direction.
- **Validation needed:** Test both genders.

#### NBT-DLG-060-13c — "Where do you think you're going?" (variant 1)
##### Record identity
- **Record ID:** NBT-DLG-060-13c
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-13
- **Related record IDs:** NBT-DLG-060-13d
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Overworld.8
- **Source references:** script file 842 Function#17 and Function#72 (`GenderMessage 29 30`, first argument); text archive 542 msg 29
- **Evidence status:** Verified (text); Inferred (selection rule)
##### OLD — Current content
- **OLD dialogue:** Where do you think you’re going, {STRVAR_1, 3, 0, 0}?
- **OLD raw message data:** `Where do you think you’re going,\n{STRVAR_1, 3, 0, 0}?\r`
- **OLD trigger:** Shown by NBT-EVT-060-13 after the player is walked west, first of the pair selected by player gender.
- **OLD conditions and branch priority:** Mutually exclusive with 13d. Text identical to 13d.
- **OLD event sequence:** After `TextPlayerName 0`, before `CloseMessage`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every run of Script#13.
- **OLD dependencies and shared-resource effects:** Buffer 0 = player name.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 29
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Edit both 29 and 30 together if wording changes.

#### NBT-DLG-060-13d — "Where do you think you're going?" (variant 2)
##### Record identity
- **Record ID:** NBT-DLG-060-13d
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-13
- **Related record IDs:** NBT-DLG-060-13c
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Overworld.8
- **Source references:** script file 842 Function#17 and Function#72 (`GenderMessage 29 30`, second argument); text archive 542 msg 30
- **Evidence status:** Verified (text); Inferred (selection rule)
##### OLD — Current content
- **OLD dialogue:** Where do you think you’re going, {STRVAR_1, 3, 0, 0}?
- **OLD raw message data:** `Where do you think you’re going,\n{STRVAR_1, 3, 0, 0}?\r`
- **OLD trigger:** Shown by NBT-EVT-060-13 when the second of the pair is selected by player gender.
- **OLD conditions and branch priority:** Mutually exclusive with 13c. Text identical to 13c.
- **OLD event sequence:** As 13c.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every run of Script#13.
- **OLD dependencies and shared-resource effects:** Buffer 0 = player name.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 30
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** As 13c.

#### NBT-EVT-060-14 — Elm Pokémon Lab sign
##### Record identity
- **Record ID:** NBT-EVT-060-14
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-060-14a, NBT-EVT-060-08 (sister board script)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Board (sign) at global (682,393)
- **Source references:** script file 842 Script#14; event file 57 spawnables idx 0 (type Board, scriptNumber 14, dir 4 any direction); text archive 542 msg 36
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Not applicable (see NBT-DLG-060-14a).
- **OLD raw message data:** See NBT-DLG-060-14a.
- **OLD trigger:** Player interacts with the board at (682,393) from any direction.
- **OLD conditions and branch priority:** None. Unconditional. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) `SetTextBoard 2 0`; (2) `ShowBoard 3`; (3) `WaitBoard`; (4) `BoardMessage 36 0x800C` (NBT-DLG-060-14a); (5) `CommonScript 2000` (GLB-RTN-2000, closes/cleans up the board); (6) `End`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats every interaction.
- **OLD dependencies and shared-resource effects:** GLB-RTN-2000 (call evidence: `CommonScript 2000` at Script#14). The board shape matches Script#8 and Script#17.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 842 Script#14; event file 57 spawnables idx 0; text 542 msg 36
- **Other affected callers or records:** None found (no jump to Script#14 elsewhere in 0842.script).
- **Unresolved questions:** Whether warp idx 0 (to header 61) at (684,393) is the Elm Lab door is Inferred only from proximity.
- **Validation needed:** Read the sign in game.

#### NBT-DLG-060-14a — Sign text
##### Record identity
- **Record ID:** NBT-DLG-060-14a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-14
- **Related record IDs:** None
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Board
- **Source references:** script file 842 Script#14 (`BoardMessage 36 0x800C`); text archive 542 msg 36
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Elm Pokémon Lab
- **OLD raw message data:** `Elm Pokémon Lab`
- **OLD trigger:** Shown by NBT-EVT-060-14 on every interaction.
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** Board message.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 36
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-060-15 — Icon board (no text)
##### Record identity
- **Record ID:** NBT-EVT-060-15
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** None
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Board at global (685,400)
- **Source references:** script file 842 Script#15; event file 57 spawnables idx 2 (type Board, scriptNumber 15, dir 4)
- **Evidence status:** Verified (commands); Inferred (that this is the Trainer-Tips/town-map style icon sign)
##### OLD — Current content
- **OLD dialogue:** Not applicable. No message is read from archive 542; the board shows an icon.
- **OLD raw message data:** None.
- **OLD trigger:** Player interacts with the board at (685,400) from any direction.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) `SetIconBoard 34 0 11 0x800C` (arguments 34, 0, 11 — meaning not verified; looks like board type/icon ids); (2) `ShowBoard 3`; (3) `WaitBoard`; (4) `CloseBoard 0x800C`; (5) `CommonScript 2000` (GLB-RTN-2000); (6) `End`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction.
- **OLD dependencies and shared-resource effects:** GLB-RTN-2000 (call evidence: `CommonScript 2000` at Script#15).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 842 Script#15; event file 57 spawnables idx 2
- **Other affected callers or records:** None found.
- **Unresolved questions:** What the icon board displays (SetIconBoard argument meaning).
- **Validation needed:** Look at the board in game.

#### NBT-EVT-060-16 — Talkative NPC (wandering)
##### Record identity
- **Record ID:** NBT-EVT-060-16
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-060-16a
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Overworld idx 2 (owID 2, sprite 332, movement 3 walking around, x/y range 1, flag 0 so always shown) at global (685,408)
- **Source references:** script file 842 Script#16; event file 57 overworlds idx 2 (scriptNumber 16); text archive 542 msg 12
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Not applicable (NBT-DLG-060-16a).
- **OLD raw message data:** See NBT-DLG-060-16a.
- **OLD trigger:** Player talks to the NPC.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) `TextPlayerName 0`; (2) `PlayFanfare SEQ_SE_CONFIRM`; (3) `LockAll`; (4) `FacePlayer`; (5) `Message 12` (NBT-DLG-060-16a); (6) `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats every talk.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 842 Script#16; event file 57 overworlds idx 2; text 542 msg 12
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Talk in game.

#### NBT-DLG-060-16a — "I hear Professor Elm discovered some new Pokémon"
##### Record identity
- **Record ID:** NBT-DLG-060-16a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-16
- **Related record IDs:** None
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Overworld idx 2
- **Source references:** script file 842 Script#16 (`Message 12`); text archive 542 msg 12
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Yo, {STRVAR_1, 3, 0, 0}! [wait] I hear Professor Elm discovered some new Pokémon.
- **OLD raw message data:** `Yo, {STRVAR_1, 3, 0, 0}!\rI hear Professor Elm discovered some\nnew Pokémon.`
- **OLD trigger:** Shown by NBT-EVT-060-16 on every talk.
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** Single message.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk.
- **OLD dependencies and shared-resource effects:** Buffer 0 = player name.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 12
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-060-17 — House sign (counterpart's house)
##### Record identity
- **Record ID:** NBT-EVT-060-17
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-060-17a, NBT-EVT-060-08 (same message index, player's house sign)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Board at global (688,407), next to warp idx 3 (header 66) at (690,407)
- **Source references:** script file 842 Script#17; event file 57 spawnables idx 3 (type Board, scriptNumber 17, dir 4); text archive 542 msg 35
- **Evidence status:** Verified (commands/text); Inferred (whose house; relation to header 66)
##### OLD — Current content
- **OLD dialogue:** Not applicable (NBT-DLG-060-17a).
- **OLD raw message data:** See NBT-DLG-060-17a.
- **OLD trigger:** Player interacts with the board at (688,407).
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) `TextCounterpart 0` (fills buffer 0 with the counterpart character's name; the opposite-gender rival/friend name is Inferred); (2) `SetTextBoard 2 0`; (3) `ShowBoard 3`; (4) `WaitBoard`; (5) `BoardMessage 35 0x800C` (NBT-DLG-060-17a); (6) `CommonScript 2000` (GLB-RTN-2000); (7) `End`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction.
- **OLD dependencies and shared-resource effects:** GLB-RTN-2000 (call evidence: `CommonScript 2000` at Script#17). Message 35 is also read by Script#8 (player's house sign, spawnables idx 1) with `TextPlayerName 0` instead of `TextCounterpart 0`.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 842 Script#17; event file 57 spawnables idx 3; text 542 msg 35
- **Other affected callers or records:** Msg 35 shared with Script#8 (NBT-EVT-060-08): editing msg 35 changes both signs.
- **Unresolved questions:** Which character name `TextCounterpart` yields; whether header 66 is that house.
- **Validation needed:** Read both signs.

#### NBT-DLG-060-17a — "<name>’s House" sign text
##### Record identity
- **Record ID:** NBT-DLG-060-17a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-060-17
- **Related record IDs:** NBT-EVT-060-08
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Board
- **Source references:** script file 842 Script#17 (`BoardMessage 35 0x800C`); text archive 542 msg 35
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** {STRVAR_1, 3, 0, 0}’s House
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0}’s House`
- **OLD trigger:** Shown by NBT-EVT-060-17 on every interaction; also by Script#8.
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** Board message.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction.
- **OLD dependencies and shared-resource effects:** Buffer 0 filled by `TextCounterpart 0` here, `TextPlayerName 0` in Script#8.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 542 msg 35
- **Other affected callers or records:** Script#8 (NBT-EVT-060-08).
- **Unresolved questions:** None.
- **Validation needed:** Both signs.

#### NBT-EVT-060-18 — Cameron the Photographer
##### Record identity
- **Record ID:** NBT-EVT-060-18
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** GLB-PRM-30-0, GLB-PRM-30-1, GLB-PRM-30-2, GLB-PRM-30-3, GLB-PRM-30-5 (archive-30 mapping Inferred)
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** Overworld idx 6 (owID 6, sprite 328, movement 14 facing up, flag 638 = FLAG_HIDE_CAMERON) at global (695,403)
- **Source references:** script file 842 Script#18 / Function#18, #19, #20, #21, #42, #43, #61; event file 57 overworlds idx 6 (scriptNumber 18); messages from a common message archive (see GLB ids)
- **Evidence status:** Verified (commands); Inferred (message archive number 30; Cameron identity is supported by message content)
##### OLD — Current content
- **OLD dialogue:** Not applicable locally: all text is read via `GetCommonMessageArchive 2 0x800C` + `MessageFromArchive 0x800C <idx>`. The archive number is not stated by the command (argument 2); archive 30 is Inferred because its messages 0–5 match this flow exactly: msg 0 "Hello, just when you least expect it!\nI am Cameron the Photographer.\rYou look so photogenic!\nWhy not have a picture taken? {YESNO, 0, 0}", msg 1 "All right, then!\nGet yourselves ready!\r", msg 2 "Good, good!\nWe’ve got a nice picture!\rYou can see all the pictures\non your PC.", msg 3 "Wait a second!\rMy superhuman ability is telling me\nthat your Photo Album\fis full!\rSorry to trouble you, but\ncan you delete some pictures\fbefore you talk to me again?", msg 5 "Aren’t you a shy one?" (msg 4, no Photo Album, is not called by this script).
- **OLD raw message data:** See OLD dialogue (archive 30 raw forms are `\n`/`\r`/`\f` as quoted).
- **OLD trigger:** Player talks to Overworld idx 6, if it is visible (flag 638 clear).
- **OLD conditions and branch priority:** Visibility: flag 638 (FLAG_HIDE_CAMERON) — set/cleared by script 842 Function#9 (run from Script#7, map-change level script, NBT-EVT-060-07): flag set if `CheckBadge 2` returns 0, else cleared only when `GetDayOfWeek` == 2, otherwise set; so Cameron shows only with badge 2 and day-of-week value 2 (weekday name for 2 not verified). Writers of flag 638 outside 842: script files 0013, 0025, 0037, 0048, 0054, 0059, 0065, 0076, 0081, 0092, 0099, 0105, 0112, 0116, 0122, 0168 (each SetFlag/ClearFlag 638; header mapping not resolved; resolved: 0013 = 453 Seafoam Islands, 0025 = 96 National Park, 0037 = 113 Ruins of Alph, 0048 = 323 Ruins of Alph, 0054 = 491 Ruins of Alph, 0059 = 114 SLOWPOKE Well, 0065 = 224 Lighthouse, 0076 = 272 Battle Frontier, 0081 = 411 Frontier Access, 0092 = 117 Ilex Forest, 0099 = 121 Whirl Islands, 0105 = 122 Mt. Silver Cave, 0112 = 288 Dragon's Den, 0116 = 174 Safari Zone Gate, 0122 = 280 Pokéathlon Dome, 0168 = 9 Route 1). In-script order: (1) YES/NO touch-screen answer `0x800C == 1` → Function#18 (msg 5, release); (2) else `CheckAlbumPhoto 0x800C == 1` → Function#19 (msg 3, release) — meaning of CheckAlbumPhoto's result is not verified, only that value 1 leads to the "album is full" message; (3) else photo sequence. Reachability: Referenced and apparently reachable only on the day/badge condition.
- **OLD event sequence:** (1) talk; `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`; (2) msg 0 (GLB-PRM-30-0, archive inferred), `OpenTouchScreen`, `YesNoTouchScreen 0x800C`, `CloseTouchScreen`; (3) branches as above: answer 1 → Function#18: msg 5 (GLB-PRM-30-5), `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`; album check 1 → Function#19: msg 3 (GLB-PRM-30-3), `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`; (4) otherwise msg 1 (GLB-PRM-30-1), `CloseMessage`, `LockFollowingPoke 0`, `WaitFollowingPoke`, `SetFollowingPokeMovement 55`, `GetPlayerDirection 0x800C`; direction ladder: 0 → `Movement Player Action#29` (WalkEast8 1, WalkNorth8 2, WalkWest8 1, WalkNorth8 3, WalkOnSpotSouth8 1) + `Movement Overworld.6 Action#30` (Delay8, WalkOnSpotNorth8); 1 → Function#20 `Player Action#47` (WalkNorth8 3, WalkOnSpotSouth8); 3 → Function#42 `Player Action#68`; other → Function#61 `Player Action#86`; all merge into Function#21: `WaitMovement`, `WaitFollowingPoke`, `LockFollowingPoke 1`, `SetFollowingPokeMovement 48`, `CheckPokemonAlive 0x800C`; if != 1 → Function#43 (same photo steps without the follower movement); else `Movement Following Action#48` (WalkEast8 1, WalkNorth8 1, FaceSouth), `WaitMovement`; (5) `SetFlag 393`, `FadeScreen 6 1 0 0`, `WaitFadeScreen`, `TakePhoto 0`, `LockAll`, `FadeScreen 6 1 1 0`, `WaitFadeScreen`, `ClearFlag 393`; (6) msg 2 (GLB-PRM-30-2), `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`.
- **OLD state changes:** `TakePhoto 0` adds a photo to the album (effect inferred from name); flag 393 (FLAG_UNK_189) set then cleared (a temporary hide/state flag; also set/cleared in script files 0022, 0048, 0054, 0076, 0092 and tested by Script#7 here).
- **OLD repeat/completion behavior:** Repeats on every talk while Cameron is visible; no completion flag.
- **OLD dependencies and shared-resource effects:** Common message archive read (`GetCommonMessageArchive 2`): GLB-PRM-30-0, -30-1, -30-2, -30-3, -30-5 (archive number inferred). No CommonScript call. Flag 638 set/cleared by Script#7 (NBT-EVT-060-07). Follower commands.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 842 Script#18 and Functions #18–#21, #42, #43, #61; event file 57 overworlds idx 6; flag 638
- **Other affected callers or records:** Functions #18–#21, #42, #43, #61 only reached from Script#18 (grep). Flag 638 handled by Script#7 (NBT-EVT-060-07).
- **Unresolved questions:** Whether `GetCommonMessageArchive 2` selects text archive 30 (inferred by content match only); meaning of `CheckAlbumPhoto` value; day-of-week numbering.
- **Validation needed:** Talk to Cameron on the correct day with and without a full photo album; answer No.


#### NBT-DLG-060-U8 — Unreferenced local message: "Call your mom on your Pokégear..."
##### Record identity
- **Record ID:** NBT-DLG-060-U8
- **Record type:** Dialogue variant
- **Parent record ID:** None (not referenced by any script in this map's script file)
- **Related record IDs:** None
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** None (no speaker label in the text; no script shows it)
- **Source references:** text archive 542 msg 8; script file 842 (`project/scripts/0842.script`) searched, no `Message`, `GenderMessage` or `BoardMessage` names index 8 (the only `BoardMessage` indices are 35 and 36; `MessageFromArchive` reads the common archive from `GetCommonMessageArchive 2`, not this one)
- **Evidence status:** Verified (text read with `get_text`; non-reference confirmed by grep of 0842.script); Inferred that no other mechanism reads it
##### OLD — Current content
- **OLD dialogue:** Call your mom on your Pokégear to / let her know how you’re doing.
- **OLD raw message data:** `Call your mom on your Pokégear to\nlet her know how you’re doing.`
- **OLD trigger:** None found.
- **OLD conditions and branch priority:** Reachability: Apparently unused. No other message in archive 542 has this text (`search_text` on archive 542: 1 match, this one).
- **OLD event sequence:** None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Not applicable.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 542 msg 8 (no script change needed unless a script is made to show it)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Whether another file (a level script, a text-archive setting on another header, or the engine) reads it.
- **Validation needed:** None.

#### NBT-DLG-060-U37 — Unreferenced local message: "<player>’s House" (duplicate of msg 35)
##### Record identity
- **Record ID:** NBT-DLG-060-U37
- **Record type:** Dialogue variant
- **Parent record ID:** None (not referenced by any script in this map's script file)
- **Related record IDs:** None
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** None (a sign-style name board text; no script shows it)
- **Source references:** text archive 542 msg 37; script file 842 (`project/scripts/0842.script`) searched, no `Message`, `GenderMessage` or `BoardMessage` names index 37 (the only `BoardMessage` indices are 35, at lines 122 and 267, and 36, at line 239)
- **Evidence status:** Verified (text read with `get_text`; non-reference confirmed by grep of 0842.script); Inferred that no other mechanism reads it
##### OLD — Current content
- **OLD dialogue:** {STRVAR_1, 3, 0, 0}’s House
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0}’s House`
- **OLD trigger:** None found.
- **OLD conditions and branch priority:** Reachability: Apparently unused. Duplicate: `search_text` on archive 542 for "’s House" returns msg 35 and msg 37 with identical text; msg 35 is the one the script shows (`BoardMessage 35`).
- **OLD event sequence:** None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Not applicable.
- **OLD dependencies and shared-resource effects:** The name token {STRVAR_1, 3, 0, 0} would need a name buffer set before it if it were ever shown.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 542 msg 37 (no script change needed unless a script is made to show it)
- **Other affected callers or records:** Msg 35 (same text, in use).
- **Unresolved questions:** Whether another file reads it; whether it was meant for a second name board.
- **Validation needed:** None.

#### NBT-DLG-060-U34 — Unreferenced local message: "New Bark Town / Winds of a New Beginning"
##### Record identity
- **Record ID:** NBT-DLG-060-U34
- **Record type:** Dialogue variant
- **Parent record ID:** None (not referenced by any script in this map's script file)
- **Related record IDs:** None
- **Map or system:** New Bark Town exterior (header 60, T20)
- **Speaker, object, or trigger:** None (no script shows it)
- **Source references:** text archive 542 msg 34; script file 842 (`project/scripts/0842.script`) searched, no `Message`, `GenderMessage` or `BoardMessage` names index 34 (the only `BoardMessage` indices are 35, at lines 122 and 267, and 36, at line 239); level script 615 has no text form and its three entries (variableValue, mapChange script 7, screenReset script 10) only run scripts of file 842
- **Evidence status:** Verified (text read with `get_text {archive: 542, indices: [34]}`; non-reference confirmed by grep of 0842.script and `get_script` of level script 615); Inferred that no other mechanism reads it
##### OLD — Current content
- **OLD dialogue:** New Bark Town\nWinds of a New Beginning
- **OLD raw message data:** `New Bark Town\nWinds of a New Beginning`
- **OLD trigger:** None found.
- **OLD conditions and branch priority:** Reachability: Apparently unused (by scripts). The content resembles a town-name banner, but no reader was found.
- **OLD event sequence:** None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Not applicable.
- **OLD dependencies and shared-resource effects:** None found.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 542 msg 34 (no script change needed unless a script is made to show it)
- **Other affected callers or records:** None found.
- **Unresolved questions:** It may be read by the game engine directly (e.g. a map-name display); unverified. Whether another file reads it.
- **Validation needed:** None.

## Map 61 — T20R0101

### Map header 61 — T20R0101 (the lab interior; event file 58, script file 843, level script 616, text archive 543)

Evidence basis: `get_events {mapHeader: 61}`, `get_world_data mapHeader 61`, `get_script 616` (structured), `get_script 843` (live, 1613 lines, 16 scripts / 75 functions / 64 actions), `get_text 543` (106 messages, all read), `project/scripts/0843.script` (pulled 2026-10-08), `list_changes`. Matrix 100 `m_labo01_`, location name id 126 "New Bark Town". The speakers named in the text are Professor Elm (messages prefixed "Professor Elm:"), his aide (Script 2 message 18: "I'm not the professor. He's at the back of the room"), an investigating officer (message 23), and the player's friend (Lyra or Ethan, by player gender).

**Rendering convention (this section only).** OLD dialogue is the message with its escape sequences rendered: `\n` = line break shown as ` / `, `\r` = shown as ` // `, `\f` = shown as ` /// `. `{STRVAR_1, ...}` and `{YESNO, 0, 0}` tokens are kept literally; where the script sets a name buffer immediately before the message the text states it (`TextPlayerName 0` = player name in buffer 0, `TextRivalName 1` = rival name in buffer 1, `TextPartyPokemon`/`TextPokeNickname` = Pokémon name). The "OLD raw message data" field is the exact `get_text` string. The engine meaning of `\r`/`\f` (box scroll versus clear) is not verified here. Where a script uses `GenderMessage A B`, each of the two messages has its own dialogue record (the first, A, keeps the original record id; the second, B, has a later letter in the same event, cross-linked in Related record IDs). `GenderMessage` is documented in `docs/scripting-reference.md` as `GenderMsgBox` with params `male_text`, `female_text`, so A is shown to a male player and B to a female player; this is Inferred from the parameter order only, not run-tested (the Lyra/Ethan pronouns in msgs 24/25 corroborate it). The texts differ only by the companion's name (Lyra/Ethan) in all pairs where they differ at all. Opcodes shown as `MecScript`, `CMD_149`, `FinishOverworldScreen`, `ReturnScreen`, `GetCounterpartSprite` are printed as the disassembly gives them; their semantics are not documented in the sources read (Unresolved) unless stated. `JumpIf EQUAL` after `CheckFlag` = flag set; `JumpIf LESS` after `CheckFlag` = flag clear (Verified by usage: Script 13 `CheckFlag 106 / JumpIf EQUAL Function#22` leads to the "valuable Pokémon left" lines that only make sense once the starter is taken, and Script 14 `JumpIf LESS` leads to the "PC is connected" line). `YesNoTouchScreen` result 0 = Yes, 1 = No (Verified by usage: Script 13 `CompareVarValue 0x800C 0 / CallIf EQUAL` runs the nickname routine, i.e. Yes; Script 3 `... 1 / JumpIf EQUAL Function#13` asks the name again, i.e. No). Warp records use the id form `NBT-EVT-061-W<idx>` (an extension of the O/S/T scheme).

**Dependency (hg-engine only).** `CommonScript 2080` and `CommonScript 2081` (used by Functions 46 and 47, and so by the aide handout Function 15 and Function 64) exist only in the hg-engine build (`~/Programming/hg-engine/armips/scr_seq/scr_seq_00003_commonscript.s`, scrdef `scr_seq_0003_080_all_key_items` and `scr_seq_0003_081_porygift`). The working ROM's common script entry 3 has only 72 scripts (2000-2071; brief figure, taken as given, not re-opened here). In the working ROM alone those two calls point past the end of the table; they are only safe because the flags 2307/2310 guarding them are set only by the hg-engine Game Mode Select code. `CommonScript 2008` is the retail give-item routine whose hg-engine version is rewritten (`scr_seq_0003_008`, adds a no-article variant for Mr. Paint); 2009, 2029, 2030, 2033 are retail routines (2033 is named `scr_seq_0003_033_give_item_verbose` in hg-engine; 2029/2030 not opened).

**Hack-modified parts of script 843 (from `list_changes` + docs, all in script file 843; no event-file, level-script, header or text-archive edit exists for header 61):**
- Journal 17 (2026-09-23): inserted `GiveItem ITEM_RARE_CANDY 1 0x800C` at Script#13 index 8 (starter handoff). Removed again by journal 30 (`docs/game-mode-select.md` line 108); absent from the live script (Script 13 slice read live, no GiveItem).
- Journal 30 (2026-10-02, whole-text `set_script`): removed that candy; added `CheckFlag 2304 / CallIf EQUAL` to the aide handout in both copies and the sub-function with the Rare Candy give. Per the same doc the member was re-assembled from text; vanilla was 4440 B.
- Journal 31 (2026-10-02, edits): Function#45 extended (live Function 45 = items 50 Rare Candy, 12 Premier Ball, 77 Max Repel, 78 Escape Rope, each qty 1, each followed by `CommonScript 2008`).
- Journal 32 (2026-10-04, whole text): `CheckFlag 2307 / CallIf EQUAL Function#46` after the 2304 pair in both copies; new Function 46 = `CommonScript 2080 / Return`.
- Journal 34 (2026-10-07, whole text): `CheckFlag 2310 / CallIf EQUAL Function#47` after the 2307 pair in both copies; new Function 47 = `CommonScript 2081 / Return`; old 47-74 renumbered 48-75.
- `SetVar 0x416F 13` in Script 13 (level-cap variable, per `docs/game-mode-select.md` line 108 "kept") is hack content of an earlier, unjournalled assembly (the member was assembled from text before the journal began); not attributable to a journal id. Neighbouring maps set 0x416F to other values (files 0015, 0107, 0112, 0743 ... see flags and variables table).
- The vanilla function numbering of the aide copy is shifted: docs written before journal 34 call the second copy "Function 61/63"; it is Function 64 in the live script.

**Spot-check of `project/scripts/0843.script` against the live ROM.** Live `get_script 843` reports 1613 lines; the pulled file is 1620 lines including its 7-line comment header, so the counts match. Compared by eye: Script 13 slice (live lines 238-302), Function 15 (live offset 610-649), Functions 45/46/47 (936-971), Function 64 (1086-1121) are identical to the pulled file line for line; the first 200 live lines (Scripts 1-9 start) match the pulled Scripts 1-9. Not compared line for line: Functions 1-14, 16-44, 48-63, 65-75 and all Actions (they were read only from the pulled file). The live script size is reported as 5612 bytes while journal 34's `touched` record lists 5584; the 28-byte difference is not explained (Unresolved; probably a different measure, such as header or padding).

**Messages in archive 543.** Total 106 (indices 0-105). Referenced by script 843: all except index 52 ("Uh-oh, your Bag is chock-full.") and index 66 ("The Kimono Girls told me they are waiting for you at the Ecruteak Dance Theater. I know you've gone through ...") — Apparently unused candidates (no `Message`/`GenderMessage` command in 843 names them; script files other than 843 do not read archive 543 for header 61, though another header's text-archive setting could in principle point here, not checked).

### Map 61 event inventory

| Section | Idx | Type / what | owID / sprite entry | Coordinates (global x,y) | Flag (hides) | Script no. / trigger | Covering record |
|---|---|---|---|---|---|---|---|
| Spawnable | 0 | Misc, front interaction | - | (1,10) | - | 6 | NBT-EVT-061-06 |
| Spawnable | 1 | Misc, front interaction | - | (2,10) | - | 6 | NBT-EVT-061-06 |
| Spawnable | 2 | Misc, front interaction | - | (7,10) | - | 7 | NBT-EVT-061-07 |
| Spawnable | 3 | Misc, front interaction | - | (8,10) | - | 7 | NBT-EVT-061-07 |
| Spawnable | 4 | Misc, front interaction | - | (9,10) | - | 8 | NBT-EVT-061-08 |
| Spawnable | 5 | Misc, front interaction | - | (10,10) | - | 8 | NBT-EVT-061-08 |
| Spawnable | 6 | Misc, front interaction | - | (11,10) | - | 9 | NBT-EVT-061-09 |
| Spawnable | 7 | Misc, front interaction | - | (12,10) | - | 9 | NBT-EVT-061-09 |
| Spawnable | 8 | Misc, activated from any direction | - | (6,3) | - | 10 | NBT-EVT-061-10 |
| Spawnable | 9 | Misc, front interaction | - | (8,4) | - | 13 | NBT-EVT-061-13 |
| Spawnable | 10 | Misc, front interaction | - | (4,3) | - | 14 | NBT-EVT-061-14 |
| Overworld | 0 | Normal, Professor Elm | owID 0, sprite entry 99, orientation 1 | (6,5) | 401 | 1 | NBT-EVT-061-01 |
| Overworld | 1 | Normal, officer | owID 1, sprite entry 34, orientation 3 | (3,6) | 413 | 0 (none) | NBT-EVT-061-O1 (acts in NBT-EVT-061-03) |
| Overworld | 2 | Normal, aide | owID 2, sprite entry 29, orientation 2 | (9,12) | 582 | 2 | NBT-EVT-061-02 |
| Overworld | 3 | Normal, the friend (Lyra/Ethan) | owID 3, sprite entry 101, orientation 0 | (4,14) | 422 | 0 (none) | NBT-EVT-061-O3 (acts in NBT-EVT-061-03, -15) |
| Warp | 0 | to header 60, anchor 0, height 0 | - | (4,14) | - | - | NBT-EVT-061-W0 |
| Trigger | 0 | area 4x1 at (3,11), var 16648 (0x4108) = 1 | - | (3..6,11) | - | 4 | NBT-EVT-061-04 |
| Trigger | 1 | area 4x1 at (3,10), var 16648 (0x4108) = 0 | - | (3..6,10) | - | 12 | NBT-EVT-061-12 |
| Level script entry 1 | - | screenReset -> script 11 | - | - | - | 11 | NBT-EVT-061-LS1 -> NBT-EVT-061-11 |
| Level script entry 2 | - | variableValue: 16636=2 -> 16; 16648=3 -> 3; 16648=8 -> 15 | - | - | - | 16 / 3 / 15 | NBT-EVT-061-LS2 -> -16 / -03 / -15 |

Scripts in file 843 not named by any event-file entry or level-script entry: Script 5 (just `End`) — NBT-EVT-061-05, Apparently unused. All other scripts (1-4, 6-16) are reached. The speakers' sprite entries are the `overlayTableEntry` values from the event file; which sprite each is was not looked up (names come from the message text and flag names).

### Flags and variables used by script 843 (names from hg-engine `flags.s` / `vars.s`; "elsewhere" = other script files, found by grepping `project/scripts/*.script`; level scripts and event-file `flag` fields of other maps were not searched, Unresolved)

| Id | hg-engine name | Role here | Writers outside 843 |
|---|---|---|---|
| flag 106 | FLAG_GOT_STARTER | set in Script 13; read by Script 13, 14 | read (not written) by 0842, 0845, 0849 (NBT local) |
| flag 114 | FLAG_UNK_072 | set Function 68/69 (Everstone given); read Script 1, Function 1/3 | none found |
| flag 115 | FLAG_GOT_TM51_FROM_FALKNER | read Function 22 | 0859 (sets and reads; elsewhere, header not mapped; resolved: header 135 T22GYM0101, Violet City Gym) |
| flag 121 | FLAG_UNK_079 | set Script 3 / Function 12 | read by 0259 |
| flag 153 | FLAG_MET_PASSERBY_BOY | read Function 22 | set by 0850 |
| flag 242 | FLAG_UNK_0F2 | set Function 2 (S.S. Ticket); read Script 1, Function 5 | none found |
| flag 264 / 265 | FLAG_UNK_108 / FLAG_UNK_109 | read Function 5, 39, 59 | 264 set by 0021 (read 0019, 0021, 0926, 0928); 265 set by 0104 (read 0103, 0104, 0928) |
| flag 282 | FLAG_GOT_EVERSTONE_FROM_ELM | set Function 68/69 | none found |
| flag 352 | FLAG_ELMS_LAB_PREVENT_PLAYER_ESCAPE | set Script 12/Function 21; cleared Script 13; read Script 11, 12 | none found |
| flag 401 | FLAG_HIDE_ELMS_LAB_ELM | object flag of Overworld 0 | no SetFlag/ClearFlag found in any script |
| flag 404 | FLAG_HIDE_CHERRYGROVE_MART_SPECIAL_CLERK | cleared Script 3 | set by 0149 |
| flag 406 | FLAG_HIDE_ROUTE_30_BATTLERS | set Script 3 | none found |
| flag 409 | FLAG_HIDE_ROUTE_30_YOUNGSTER_JOEY | cleared Script 3 | set by 0149 |
| flag 413 | FLAG_HIDE_ELMS_LAB_OFFICER | object flag of Overworld 1; set Script 3 | set by 0149; cleared by 0229 |
| flag 420 / 421 | FLAG_HIDE_ROUTE_29_FRIEND / _MARILL | cleared Script 3 | set by 0149, 0225 |
| flag 422 | FLAG_HIDE_ELMS_LAB_FRIEND | object flag of Overworld 3; cleared/set Script 3; set Function 26/27 | cleared by 0112; set by 0149 |
| flag 571 | FLAG_UNK_23B | set Function 26/27 | none found |
| flag 582 | FLAG_HIDE_ELMS_LAB_AIDE | object flag of Overworld 2 | set by 0857; cleared by 0858 |
| flag 741 | FLAG_HIDE_NEW_BARK_FRIENDS_ROOM_FRIEND | set Script 3 / Function 12 | set 0112; cleared 0021, 0104, 0859; read 0848, 0849 |
| flag 744 | FLAG_HIDE_NEW_BARK_FRIEND_2 | cleared Function 26/27 | set 0021, 0104, 0149 |
| flag 2304 | FLAG_UNK_900 (hack: SUPER ITEMS rule) | read Function 15 / 64 | set by hg-engine Game Mode Select code (`docs/game-mode-select.md` line 102/878); no script writer |
| flag 2307 | FLAG_UNK_903 (hack: ALL KEY ITEMS rule) | read Function 15 / 64 | hg-engine (`include/game_mode_select.h` line 61) |
| flag 2310 | FLAG_UNK_906 (hack: PORYGIFT rule) | read Function 15 / 64 | hg-engine (`include/game_mode_select.h` line 64) |
| flag 2404 | FLAG_GAME_CLEAR | read Script 1 | no script writer found; read by many other files |
| flag 2435 | FLAG_UNK_983 | read Script 1, Function 1/3 | no writer found in scripts or hg-engine sources grepped (Unresolved) |
| var 0x4108 (16648) | VAR_SCENE_ELMS_LAB | Elm's lab progress; values written in 843: 1 (Script 13), 2 (Function 15/64), 4 (Script 3), 5 (Function 42), 9 (Function 26/27); watched by trigger 0 (=1), trigger 1 (=0), level script (=3, =8) | 3 set by 0229; 6 by 0859; 7 by 0858; 8 by 0112; read also by 0845, 0848, 0851, 0852 |
| var 0x40FC (16636) | VAR_UNK_40FC | set 3 in Script 16; read Script 2; watched by level script (=2) | 1 set by 0007; 2 set by 0111 |
| var 0x412F | VAR_UNK_412F | Pichu talk stage: 1 / 2 set in Function 57/58, 54 | none found |
| var 0x4006, 0x4005, 0x400F, 0x4000-0x4003, 0x8004-0x8007, 0x800C | temporary / special | scratch | 0x400F also set by 0002, 0128; 0x4006 by 0094, 0096, 0755 |
| var 0x4107 / 0x4072 / 0x408B / 0x4095 / 0x4079 / 0x4081 / 0x407B | scene vars (Mr. Pokémon's house, New Bark OW, ...) | set in Script 3 / 13 / 15 | other writers: 0229 (4107=1), 0842 (4072=2), 0225 (408B=0), 0227 and 0845 (4095=0), 0024/0920/0922 (4079), 0021/0104/0112 (4081), 0112/0941 (407B) |
| var 0x416F | VAR_UNK_416F (level-cap variable per docs) | set 13 in Script 13 (hack) | set to other values by 0015, 0107, 0112, 0743, 0752, 0760, 0778, 0786, 0809, 0824, 0829, 0859, 0869, 0877, 0886, 0913, 0922, 0932 |
| var 0x4020 | VAR_OBJ_0 | written by `GetCounterpartSprite` in Script 11 | - |

#### NBT-EVT-061-01 — Professor Elm: talk (all progress states, S.S. Ticket, Everstone, spiky-eared Pichu)
##### Record identity
- **Record ID:** NBT-EVT-061-01
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-061-01a to NBT-DLG-061-01au (01ag to 01au are the second gender variants of 01a, 01b, 01e, 01f, 01g, 01i, 01j, 01l, 01m, 01n, 01q, 01r, 01s, 01z, 01ab, in that order); NBT-EVT-061-13 (sets var 0x4108 to 1 and uses message 12/13 = 01j); NBT-EVT-061-15 (message 69 = 01p); GLB-RTN-2033, GLB-RTN-2009
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm, event file 58 overworld idx 0 (owID 0, sprite entry 99, (6,5)); A-press
- **Source references:** script file 843 Script#1; Functions 1, 2, 3, 4, 5, 6, 7, 8, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 54, 55, 56, 57, 58, 59, 60, 61, 62, 67, 68, 69, 70, 73, 74, 75; Actions 1, 29-34, 46, 47, 48, 49, 50, 54-56, 60, 61, 63, 64; event file 58 overworlds idx 0; text archive 543 msgs 5, 12/13, 40, 42/43, 44/45, 46, 47/48, 49, 50/51, 53/54, 69, 70, 71/72, 73/74, 75-91, 98-105
- **Evidence status:** Verified (control flow read from live and pulled disassembly); Inferred where noted (form meaning, species names for ids come from `lookup_names`: 172 PICHU, 175 TOGEPI, 176 TOGETIC, 468 TOGEKISS)
##### OLD — Current content
- **OLD dialogue:** See the per-message records NBT-DLG-061-01a to -01af (32 variants).
- **OLD raw message data:** See the dialogue records.
- **OLD trigger:** The player presses A facing Elm (overworld idx 0). Script 1 plays `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** Tested in this order (first match wins). (1) `CheckFlag 242` set -> Function 1 (the rest of Script 1 without the 2404 test). (2) `CheckFlag 2404` (FLAG_GAME_CLEAR) set -> Function 2 (S.S. Ticket). (3) `GetPartyCount` = 0 -> Function 3. (4) first healthy party member (`GetFirstAlivePokemonSlot` into 0x4000, species into 0x4001) is not 172 (PICHU) -> Function 3. (5) `CheckPartyPokemonForm` for that slot equals 1 -> Function 4 (spiky-eared Pichu talk; the "spiky-eared" meaning of form 1 is Inferred from messages 75-91). (6) flag 114 set -> Function 5. (7) flag 2435 set -> Function 6. (8) var 0x4108 >= 9 -> Function 5. (9) var 0x4108 != 0 -> Function 7. (10) otherwise (var 0x4108 = 0) message 5. Function 3 = steps (6)-(10) only. Function 1 = steps (3)-(10). Direct checks: flags 242, 2404, 114, 2435, vars 0x4108, 0x4001 (species), form, party count. Indirect prerequisites (not tested here, only produced elsewhere): the 4108 value is advanced by other scripts (writers listed in the table above). Readers/writers of each flag/var: see the table above. Object visibility: hidden when flag 401 is set; no script writes flag 401 (Unresolved whether the retail game ever hides Elm). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) A-press; fanfare, lock, face player. (2) The branch ladder above. Sub-branches, each ending `ReleaseAll / End` unless stated:
  - Function 2 (flag 2404 set, 242 clear): `TextPlayerName 0`, `GenderMessage 71 72` (01a), `SetVar 0x8004 456` (S.S. Ticket by `lookup_names`), `SetVar 0x8005 1`, `SetFlag 242`, `CommonScript 2033` (GLB-RTN-2033; no `CheckItemSpace` first), `TextPlayerName 0`, `GenderMessage 73 74` (01b), `WaitButton`, `CloseMessage`.
  - Function 3 / step (10): `Message 5` (01c), `WaitButton`, `CloseMessage`, Elm `Movement Action#1` (face east), `WaitMovement`, Function 8.
  - Function 7 (var 0x4108 != 0 and not >= 9, flag 114/2435 clear): if 0x4108 > 2 -> Function 41; else `TextPlayerName 0`, `GenderMessage 12 13` (01j), `WaitButton`, `CloseMessage`. Function 41: if 0x4108 > 5 -> Function 62 else `Message 40` (01k). Function 62: if 0x4108 != 6 -> Function 70 (`GenderMessage 44 45`, 01m) else `TextPlayerName 0`, `GenderMessage 42 43` (01l). So 0x4108 = 1 or 2 gives 01j; 3, 4 or 5 gives 01k; 6 gives 01l; 7 or 8 gives 01m.
  - Function 5 (flag 114 set, or 0x4108 >= 9, or reached from Function 3/6/40): in order: `CheckBadge 15` into 0x4003 equal 1 -> Function 34 (`GenderMessage 102 103`, 01n); flag 242 set -> Function 35 (`GenderMessage 73 74`, 01b); flag 264 set or flag 265 set -> Function 36 (`Message 70`, 01o); `CheckBadge 7` into 0x4002 equal 1 -> Function 37 (`Message 69`, 01p); var 0x400F = 1 -> Function 38 (`GenderMessage 100 101`, 01q); otherwise `TextPlayerName 0`, `GenderMessage 98 99` (01r). Each is followed by `WaitButton`, `CloseMessage`. (Which badge ids 15 and 7 are is not stated by the ROM data read; Unresolved.)
  - Function 6 (flag 2435 set, flag 114 clear): `GetFirstAlivePokemonSlot`, `GetPartyPokemonID`, `CMD_149 0` (undecodable name, semantics unknown), species 175, 176 or 468 (TOGEPI, TOGETIC, TOGEKISS) -> Function 39; any other -> Function 40 (`TextPlayerName 0`, `GenderMessage 53 54` (01g), `SetVar 0x400F 1`, Jump Function 5).
  - Function 39: Elm `Movement Action#50` (exclamation emote, delay), `WaitMovement`, `Message 46` (01d), `TextPlayerName 0`, `CheckVersion 0x800C`; if the value != 7 -> Function 59 (flag 265 clear -> Function 68; set -> `GenderMessage 104 105` (01f), Jump Function 69); if = 7 (Inferred: HeartGold) flag 264 clear -> Function 60 (`GenderMessage 47 48` (01e), Jump Function 69), flag 264 set -> `GenderMessage 104 105` (01f), Jump 61 -> Jump 69. Function 68 = `GenderMessage 47 48` then the Function 69 body. Function 69: `SetVar 0x8004 229` (Everstone), `SetVar 0x8005 1`, `CheckItemSpace`; no space -> Function 74 (`CommonScript 2009` (GLB-RTN-2009), `CloseMessage`, `ReleaseAll`, `End`; nothing else changes, so the Togepi branch repeats on the next talk); space -> `CommonScript 2033` (GLB-RTN-2033), `SetFlag 114`, `SetFlag 282`, `SetVar 0x400F 0`, `Message 49` (01h), `TextPlayerName 0`, `GenderMessage 50 51` (01i), `WaitButton`, `CloseMessage`.
  - Function 4 (first healthy mon is a form-1 PICHU), tested in order: temp var 0x4006 = 1 -> Function 28 (`Message 83` (01aa), `WaitButton`, `CloseMessage`, `IncrementVar 0x4006 1`); var 0x412F >= 2 -> Function 29 (`Message 91` (01af)); var 0x412F = 1 -> Function 30 (`GetPokemonHappiness` of slot 0x4000; >= 220 -> Function 54; below -> Function 3, the ordinary talk); otherwise (0x412F = 0) first-time inspection: `Call Function#31` (`TextPlayerName 0`, `GenderMessage 84 85` (01s), `CloseMessage`, `GetPlayerDirection` into 0x4005, follower-Pokémon lock, then one of several player/follower step patterns chosen by 0x4005 and Elm's x (Functions 55, 56, 67, 73, 75, Actions 46, 47, 54, 55, 60, 61, 63, 64), ending with the follower re-attached), Elm `Action#29`, `Message 75` (01t), Elm `Action#30`, follower `Action#31`, `Message 76` (01u), Elm `Action#29`, `Message 77` (01v), Elm `Action#32`, `Message 78` (01w), Elm `Action#33`, `Message 79` (01x), `GetOWPosition` of Elm into 0x8006/0x8007; Function 32 or Elm `Action#34` walks (Actions 34/48/49/56), `Message 80` (01y), Elm steps, `TextPlayerName 0`, `GenderMessage 81 82` (01z), `WaitButton`, `CloseMessage`, `SetVar 0x412F 1`, `IncrementVar 0x4006 1`, `ReleaseAll` (Functions 32, 33, 57, 58).
  - Function 54 (0x412F = 1 and happiness >= 220): `Call Function#31` (01s), `GenderMessage 86 87` (01ab), `CloseMessage`, Elm `Action#32`, `Message 88` (01ac), Elm `Action#30`, `Message 89` (01ad), Elm `Action#33`, `Message 90` (01ae), `WaitButton`, `CloseMessage`, `SetVar 0x412F 2`, `ReleaseAll`.
  - (3)-(4) movement/emote details: Actions as in the disassembly; not repeated.
  (5) State changes: flags 242, 114, 282 set; vars 0x400F, 0x412F, 0x4006 changed as listed; items given: S.S. Ticket x1 (456), Everstone x1 (229). (6) Completion: Function 2 once per flag 242; Everstone once while flag 114 stays set (Function 5 afterwards); the Pichu stages once each (0x412F 1, then 2); everything else repeats every time. (7) Dependencies: GLB-RTN-2033 (give item with message, called from Functions 2, 68, 69), GLB-RTN-2009 (called from Function 74; the bag-full message). `CheckVersion`, `CheckBadge`, `CheckPartyPokemonForm`, `GetPokemonHappiness`, `CMD_149`, follower-Pokémon commands (`LockFollowingPoke`, `SetFollowingPokeMovement 55/48`, `WaitFollowingPoke`) are engine commands.
- **OLD state changes:** Flag 242 (Function 2), flag 114 and 282 (Functions 68/69), var 0x400F (0 or 1), var 0x412F (1, 2), temp var 0x4006 (increments), bag: +S.S. Ticket, +Everstone.
- **OLD repeat/completion behavior:** Repeatable talk. One-shot items guarded by flag 242 (S.S. Ticket; note Function 1 and Function 5 skip the ticket branch once 242 is set) and flag 114 (Everstone, then Function 5). The Togepi/Togetic/Togekiss branch needs flag 2435 set and flag 114 clear.
- **OLD dependencies and shared-resource effects:** Var 0x4108 / flags 114, 242, 264, 265, 282, 2404, 2435 are shared with other maps (table above). Journal 30/32/34 re-assembled this file, but no journalled edit changed Script 1 logic (Script 1 head, whole file rewritten; contents equal to the earlier assembly per `docs/game-mode-select.md`). In the hg-engine build `CommonScript 2033` is `scr_seq_0003_033_give_item_verbose` (not opened here beyond its name).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 843 Script#1 (entry point) and Functions 1-8, 28-41, 54-62, 67-70, 73-75 as listed; event file 58 overworld idx 0 (owID 0)
- **Other affected callers or records:** Function 3 is also entered from Function 30 (Pichu with happiness below 220); Function 5 is entered from Functions 3 (indirectly), 6, 40; Function 7/41/62/70 only from Script 1 chain; Function 8 (`ReleaseAll / End`) is jumped to from Script 1 and Functions 1, 3, 7, 41, 62 only; Function 11 is shared with Script 2; Function 44 (bag-full tail) is shared with Script 4; Functions 36/37/38 only from Function 5. Message 69 (01p) is also used by NBT-EVT-061-15; messages 12/13 (01j) also used by NBT-EVT-061-13.
- **Unresolved questions:** Meaning of flags 114, 2435, 264, 265 (only hg-engine placeholder names); who sets 2435; `CMD_149`; which badges ids 7 and 15 are; what `CheckVersion` = 7 means; whether Elm (flag 401) is ever hidden.
- **Validation needed:** Play-through checks of each var 0x4108 value; confirm Pichu form index 1 is the spiky-eared form.

#### NBT-DLG-061-01a — Elm gives the S.S. Ticket (intro line)
##### Record identity
- **Record ID:** NBT-DLG-061-01a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01b; NBT-DLG-061-01ag (other gender variant, msg 72)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#2 (`GenderMessage 71 72`, first message); text archive 543 msg 71
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: {STRVAR_1, 3, 0, 0}! / There you are! // I called because I have something / for you. // See? It’s an S.S. Ticket. / Now you can catch Pokémon in Kanto. // (message 72, the other gender variant, has identical text; see NBT-DLG-061-01ag)
- **OLD raw message data:** `Professor Elm: {STRVAR_1, 3, 0, 0}!\nThere you are!\rI called because I have something\nfor you.\rSee? It’s an S.S. Ticket.\nNow you can catch Pokémon in Kanto.\r` (msg 71)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 2 (name buffer 0 = player set just before).
- **OLD conditions and branch priority:** Flag 242 clear AND flag 2404 (FLAG_GAME_CLEAR) set; the 242 test comes first, so this never plays with 242 set. Player gender: `GenderMessage 71 72` shows its first message (71) to a male player and its second (72) to a female player (docs/scripting-reference.md: `GenderMsgBox` / `GenderMessage`, params `male_text`, `female_text`, "picks one of two message slots by player gender"; Inferred, the doc gives the parameter order only and it was not run-tested). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Script 1 steps (1)-(2). (2) `TextPlayerName 0`, `GenderMessage 71 72`. (3) No choice. (4) Then `SetVar 0x8004 456 / 0x8005 1`, `SetFlag 242`, `CommonScript 2033`, then NBT-DLG-061-01b. (7) GLB-RTN-2033.
- **OLD state changes:** None in the message itself (the flag is set by the script right after).
- **OLD repeat/completion behavior:** Once, then flag 242 stops it.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 71 (the female-player variant is msg 72, NBT-DLG-061-01ag)
- **Other affected callers or records:** None found other than Function 2.
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** In-game check after game clear.

#### NBT-DLG-061-01ag — Elm gives the S.S. Ticket (intro line), second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-01ag
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01a (other gender variant, msg 71); NBT-DLG-061-01b
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#2 (`GenderMessage 71 72`, second message); text archive 543 msg 72
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: {STRVAR_1, 3, 0, 0}! / There you are! // I called because I have something / for you. // See? It’s an S.S. Ticket. / Now you can catch Pokémon in Kanto. // (message 71, the other gender variant, has identical text; see NBT-DLG-061-01a)
- **OLD raw message data:** `Professor Elm: {STRVAR_1, 3, 0, 0}!\nThere you are!\rI called because I have something\nfor you.\rSee? It’s an S.S. Ticket.\nNow you can catch Pokémon in Kanto.\r` (msg 72)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 2 (name buffer 0 = player set just before).
- **OLD conditions and branch priority:** Flag 242 clear AND flag 2404 (FLAG_GAME_CLEAR) set; the 242 test comes first, so this never plays with 242 set. Player gender: `GenderMessage 71 72` shows its second message (72) to a female player (docs/scripting-reference.md: `GenderMsgBox` / `GenderMessage`, params `male_text`, `female_text`, "picks one of two message slots by player gender"; Inferred, the doc gives the parameter order only and it was not run-tested). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Script 1 steps (1)-(2). (2) `TextPlayerName 0`, `GenderMessage 71 72`. (3) No choice. (4) Then `SetVar 0x8004 456 / 0x8005 1`, `SetFlag 242`, `CommonScript 2033`, then NBT-DLG-061-01b. (7) GLB-RTN-2033.
- **OLD state changes:** None in the message itself (the flag is set by the script right after).
- **OLD repeat/completion behavior:** Once, then flag 242 stops it.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 72 (the male-player variant is msg 71, NBT-DLG-061-01a)
- **Other affected callers or records:** None found other than Function 2.
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** In-game check after game clear, as a female player.

#### NBT-DLG-061-01b — Elm explains the S.S. Ticket
##### Record identity
- **Record ID:** NBT-DLG-061-01b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01a; NBT-DLG-061-01ah (other gender variant, msg 74)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#2 and Function#35 (`GenderMessage 73 74`, first message); text archive 543 msg 73
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: The Ticket will let you / take the Fast Ship that departs /// from Olivine City. // But you knew that already, / {STRVAR_1, 3, 0, 0}. // After all, you’ve adventured all over / with your Pokémon. // Give my regards to Professor Oak / in Kanto! (message 74, the other gender variant, has identical text; see NBT-DLG-061-01ah)
- **OLD raw message data:** `Professor Elm: The Ticket will let you\ntake the Fast Ship that departs\ffrom Olivine City.\rBut you knew that already,\n{STRVAR_1, 3, 0, 0}.\rAfter all, you’ve adventured all over\nwith your Pokémon.\rGive my regards to Professor Oak\nin Kanto!` (msg 73)
- **OLD trigger:** Shown by NBT-EVT-061-01 (a) right after 01a in Function 2; (b) Function 35, from Function 5.
- **OLD conditions and branch priority:** (a) as 01a. (b) Function 5 path: (flag 114 set, or 0x4108 >= 9, or reached via 6/40) AND badge 15 not held AND flag 242 set. Player gender: `GenderMessage 73 74` shows its first message (73) to a male player and its second (74) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) as above. (2) `TextPlayerName 0`, `GenderMessage 73 74`, `WaitButton`, `CloseMessage`, `ReleaseAll`. (4)-(7) none further.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats on every talk once 242 is set and the earlier Function 5 tests fall through.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 73 (the female-player variant is msg 74, NBT-DLG-061-01ah)
- **Other affected callers or records:** Function 2 and Function 35 (both in NBT-EVT-061-01).
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** Both entry points.

#### NBT-DLG-061-01ah — Elm explains the S.S. Ticket, second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-01ah
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01b (other gender variant, msg 73); NBT-DLG-061-01a
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#2 and Function#35 (`GenderMessage 73 74`, second message); text archive 543 msg 74
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: The Ticket will let you / take the Fast Ship that departs /// from Olivine City. // But you knew that already, / {STRVAR_1, 3, 0, 0}. // After all, you’ve adventured all over / with your Pokémon. // Give my regards to Professor Oak / in Kanto! (message 73, the other gender variant, has identical text; see NBT-DLG-061-01b)
- **OLD raw message data:** `Professor Elm: The Ticket will let you\ntake the Fast Ship that departs\ffrom Olivine City.\rBut you knew that already,\n{STRVAR_1, 3, 0, 0}.\rAfter all, you’ve adventured all over\nwith your Pokémon.\rGive my regards to Professor Oak\nin Kanto!` (msg 74)
- **OLD trigger:** Shown by NBT-EVT-061-01 (a) right after 01a in Function 2; (b) Function 35, from Function 5.
- **OLD conditions and branch priority:** (a) as 01a. (b) Function 5 path: (flag 114 set, or 0x4108 >= 9, or reached via 6/40) AND badge 15 not held AND flag 242 set. Player gender: `GenderMessage 73 74` shows its second message (74) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) as above. (2) `TextPlayerName 0`, `GenderMessage 73 74`, `WaitButton`, `CloseMessage`, `ReleaseAll`. (4)-(7) none further.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats on every talk once 242 is set and the earlier Function 5 tests fall through.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 74 (the male-player variant is msg 73, NBT-DLG-061-01b)
- **Other affected callers or records:** Function 2 and Function 35 (both in NBT-EVT-061-01).
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** Both entry points, as a female player.

#### NBT-DLG-061-01c — Elm: battle hint (default line)
##### Record identity
- **Record ID:** NBT-DLG-061-01c
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Script#1, Function#1, Function#3 (`Message 5`); text archive 543 msg 5
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: If a wild Pokémon / appears, let your Pokémon battle it!
- **OLD raw message data:** `Professor Elm: If a wild Pokémon\nappears, let your Pokémon battle it!`
- **OLD trigger:** Shown by NBT-EVT-061-01 at the end of the ladder.
- **OLD conditions and branch priority:** Var 0x4108 = 0 AND flag 114 clear AND flag 2435 clear AND not (flag 242 clear and flag 2404 set) AND the first healthy mon is not a form-1 PICHU (or Function 30 falls to Function 3 for a Pichu with 0x412F = 1 and happiness < 220). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (2) `Message 5`, `WaitButton`, `CloseMessage`. (4) Elm `Action#1` (face east), `WaitMovement`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 5
- **Other affected callers or records:** Script 1, Function 1 and Function 3 (same record).
- **Unresolved questions:** None.
- **Validation needed:** New game, talk to Elm before taking the starter (note var 0x4108 = 0 only before the starter in practice: Inferred).

#### NBT-DLG-061-01d — Elm: "What? That Pokémon!?" (Togepi-line check)
##### Record identity
- **Record ID:** NBT-DLG-061-01d
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01e, 01f
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#39 (`Message 46`); text archive 543 msg 46
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: What? / That Pokémon!? //
- **OLD raw message data:** `Professor Elm: What?\nThat Pokémon!?\r`
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 39 after Elm's exclamation emote.
- **OLD conditions and branch priority:** Flag 114 clear AND flag 2435 set AND the first healthy mon is 175, 176 or 468 (TOGEPI, TOGETIC, TOGEKISS) AND (the earlier ladder steps 1-5 did not divert). Reachability: Referenced with unresolved reachability (nothing in the scripts grepped sets flag 2435).
- **OLD event sequence:** (2) Elm `Action#50`, `Message 46`, `TextPlayerName 0`, `CheckVersion`, then 01e or 01f, then the Everstone.
- **OLD state changes:** None here.
- **OLD repeat/completion behavior:** Until the Everstone is received (flag 114).
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 46
- **Other affected callers or records:** None found.
- **Unresolved questions:** What sets flag 2435.
- **Validation needed:** Hatched Togepi in party with flag 2435 set.

#### NBT-DLG-061-01e — Elm: "not a Pokémon like this in Johto" (first version) and gift announcement
##### Record identity
- **Record ID:** NBT-DLG-061-01e
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01f, 01h, 01i; NBT-DLG-061-01ai (other gender variant, msg 48)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#60 and Function#68 (`GenderMessage 47 48`, first message); text archive 543 msg 47
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Hmm... / As far as I know, there is not a /// Pokémon like this in Johto... // Just like Mr. Pokémon was saying / over the phone... // The legendary Pokémon could be... / Oh, never mind. // Anyway, I’m sure things will be / happening around you, {STRVAR_1, 3, 0, 0}! // You are making me all excited! / I’ll give you a present for that. /// Please take it. // (message 48, the other gender variant, has identical text; see NBT-DLG-061-01ai)
- **OLD raw message data:** `Hmm...\nAs far as I know, there is not a\fPokémon like this in Johto...\rJust like Mr. Pokémon was saying\nover the phone...\rThe legendary Pokémon could be...\nOh, never mind.\rAnyway, I’m sure things will be\nhappening around you, {STRVAR_1, 3, 0, 0}!\rYou are making me all excited!\nI’ll give you a present for that.\fPlease take it.\r` (msg 47)
- **OLD trigger:** Shown by NBT-EVT-061-01 from Function 60 (version = 7 path, flag 264 clear) or Function 68 (version != 7, flag 265 clear).
- **OLD conditions and branch priority:** After 01d, `CheckVersion` value 7 (Inferred HeartGold) with flag 264 clear, or value != 7 with flag 265 clear. Followed by the Everstone give (Function 69 body) with a bag-space test. Player gender: `GenderMessage 47 48` shows its first message (47) to a male player and its second (48) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced with unresolved reachability (flag 2435).
- **OLD event sequence:** (2) `GenderMessage 47 48`; (4) Function 69: item 229 x1, `CheckItemSpace`, `CommonScript 2033`, flags 114 and 282, then 01h and 01i.
- **OLD state changes:** None in the message; flags 114, 282 set by the following lines.
- **OLD repeat/completion behavior:** Until flag 114.
- **OLD dependencies and shared-resource effects:** Name buffer 0 (TextPlayerName set before 01d).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 47 (the female-player variant is msg 48, NBT-DLG-061-01ai)
- **Other affected callers or records:** Functions 60 and 68 (same record).
- **Unresolved questions:** Flag 264/265 meaning; version value meaning. Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** Both version arms cannot be tested in one ROM.

#### NBT-DLG-061-01ai — Elm: "not a Pokémon like this in Johto" (first version) and gift announcement, second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-01ai
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01e (other gender variant, msg 47); NBT-DLG-061-01f, 01h, 01i
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#60 and Function#68 (`GenderMessage 47 48`, second message); text archive 543 msg 48
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Hmm... / As far as I know, there is not a /// Pokémon like this in Johto... // Just like Mr. Pokémon was saying / over the phone... // The legendary Pokémon could be... / Oh, never mind. // Anyway, I’m sure things will be / happening around you, {STRVAR_1, 3, 0, 0}! // You are making me all excited! / I’ll give you a present for that. /// Please take it. // (message 47, the other gender variant, has identical text; see NBT-DLG-061-01e)
- **OLD raw message data:** `Hmm...\nAs far as I know, there is not a\fPokémon like this in Johto...\rJust like Mr. Pokémon was saying\nover the phone...\rThe legendary Pokémon could be...\nOh, never mind.\rAnyway, I’m sure things will be\nhappening around you, {STRVAR_1, 3, 0, 0}!\rYou are making me all excited!\nI’ll give you a present for that.\fPlease take it.\r` (msg 48)
- **OLD trigger:** Shown by NBT-EVT-061-01 from Function 60 (version = 7 path, flag 264 clear) or Function 68 (version != 7, flag 265 clear).
- **OLD conditions and branch priority:** After 01d, `CheckVersion` value 7 (Inferred HeartGold) with flag 264 clear, or value != 7 with flag 265 clear. Followed by the Everstone give (Function 69 body) with a bag-space test. Player gender: `GenderMessage 47 48` shows its second message (48) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced with unresolved reachability (flag 2435).
- **OLD event sequence:** (2) `GenderMessage 47 48`; (4) Function 69: item 229 x1, `CheckItemSpace`, `CommonScript 2033`, flags 114 and 282, then 01h and 01i.
- **OLD state changes:** None in the message; flags 114, 282 set by the following lines.
- **OLD repeat/completion behavior:** Until flag 114.
- **OLD dependencies and shared-resource effects:** Name buffer 0 (TextPlayerName set before 01d).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 48 (the male-player variant is msg 47, NBT-DLG-061-01e)
- **Other affected callers or records:** Functions 60 and 68 (same record).
- **Unresolved questions:** Flag 264/265 meaning; version value meaning. Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** Both version arms cannot be tested in one ROM; female player.

#### NBT-DLG-061-01f — Elm: "no Pokémon like this at Johto" (second version) and gift announcement
##### Record identity
- **Record ID:** NBT-DLG-061-01f
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01e; NBT-DLG-061-01aj (other gender variant, msg 105)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#39, Function#59 (`GenderMessage 104 105`, first message); text archive 543 msg 104
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Hmm... / As far as I know, there are no /// Pokémon like this at Johto... // Just like Mr. Pokémon was saying / over the phone. // You seem to be there when / something exciting happens, /// {STRVAR_1, 3, 0, 0}! // You are making me all excited! / I’ll give you a present for that. /// Please take it. // (message 105, the other gender variant, has identical text; see NBT-DLG-061-01aj)
- **OLD raw message data:** `Hmm...\nAs far as I know, there are no\fPokémon like this at Johto...\rJust like Mr. Pokémon was saying\nover the phone.\rYou seem to be there when\nsomething exciting happens,\f{STRVAR_1, 3, 0, 0}!\rYou are making me all excited!\nI’ll give you a present for that.\fPlease take it.\r` (msg 104)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 39 (version = 7 path, flag 264 set) or Function 59 (version != 7, flag 265 set).
- **OLD conditions and branch priority:** After 01d, the flag (264 on the version-7 arm, 265 on the other arm) is SET. Then the Everstone give (Function 69 body). Player gender: `GenderMessage 104 105` shows its first message (104) to a male player and its second (105) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced with unresolved reachability (flag 2435; flags 264/265 are set by files 0021 / 0104).
- **OLD event sequence:** (2) `GenderMessage 104 105`, Jump Function 69 (Everstone, flags 114 and 282, 01h, 01i).
- **OLD state changes:** None in the message.
- **OLD repeat/completion behavior:** Until flag 114.
- **OLD dependencies and shared-resource effects:** Flags 264/265 are written by other script files (0021, 0104).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 104 (the female-player variant is msg 105, NBT-DLG-061-01aj)
- **Other affected callers or records:** Functions 39 (via Function 61) and 59 (same record).
- **Unresolved questions:** Same as 01e. Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** Same as 01e.

#### NBT-DLG-061-01aj — Elm: "no Pokémon like this at Johto" (second version) and gift announcement, second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-01aj
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01f (other gender variant, msg 104); NBT-DLG-061-01e
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#39, Function#59 (`GenderMessage 104 105`, second message); text archive 543 msg 105
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Hmm... / As far as I know, there are no /// Pokémon like this at Johto... // Just like Mr. Pokémon was saying / over the phone. // You seem to be there when / something exciting happens, /// {STRVAR_1, 3, 0, 0}! // You are making me all excited! / I’ll give you a present for that. /// Please take it. // (message 104, the other gender variant, has identical text; see NBT-DLG-061-01f)
- **OLD raw message data:** `Hmm...\nAs far as I know, there are no\fPokémon like this at Johto...\rJust like Mr. Pokémon was saying\nover the phone.\rYou seem to be there when\nsomething exciting happens,\f{STRVAR_1, 3, 0, 0}!\rYou are making me all excited!\nI’ll give you a present for that.\fPlease take it.\r` (msg 105)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 39 (version = 7 path, flag 264 set) or Function 59 (version != 7, flag 265 set).
- **OLD conditions and branch priority:** After 01d, the flag (264 on the version-7 arm, 265 on the other arm) is SET. Then the Everstone give (Function 69 body). Player gender: `GenderMessage 104 105` shows its second message (105) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced with unresolved reachability (flag 2435; flags 264/265 are set by files 0021 / 0104).
- **OLD event sequence:** (2) `GenderMessage 104 105`, Jump Function 69 (Everstone, flags 114 and 282, 01h, 01i).
- **OLD state changes:** None in the message.
- **OLD repeat/completion behavior:** Until flag 114.
- **OLD dependencies and shared-resource effects:** Flags 264/265 are written by other script files (0021, 0104).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 105 (the male-player variant is msg 104, NBT-DLG-061-01f)
- **Other affected callers or records:** Functions 39 (via Function 61) and 59 (same record).
- **Unresolved questions:** Same as 01e. Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** Same as 01e; female player.

#### NBT-DLG-061-01g — Elm: "I thought the Egg hatched"
##### Record identity
- **Record ID:** NBT-DLG-061-01g
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01q; NBT-DLG-061-01ak (other gender variant, msg 54)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#40 (`GenderMessage 53 54`, first message); text archive 543 msg 53
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: {STRVAR_1, 3, 0, 0}? / I thought the Egg hatched. /// Where is the Pokémon? // (message 54, the other gender variant, has identical text; see NBT-DLG-061-01ak)
- **OLD raw message data:** `Professor Elm: {STRVAR_1, 3, 0, 0}?\nI thought the Egg hatched.\fWhere is the Pokémon?\r` (msg 53)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 40.
- **OLD conditions and branch priority:** Flag 114 clear AND flag 2435 set AND the first healthy mon is not 175/176/468 (Function 6 else-branch). Player gender: `GenderMessage 53 54` shows its first message (53) to a male player and its second (54) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced with unresolved reachability (flag 2435).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 53 54`; (5) `SetVar 0x400F 1`; then Jump Function 5 (the ladder gives a follow-up line, often 01q at the end).
- **OLD state changes:** Temp var 0x400F = 1.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** 0x400F is also written by files 0002, 0128 (temp var).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 53 (the female-player variant is msg 54, NBT-DLG-061-01ak)
- **Other affected callers or records:** None found other than Function 40.
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** Flag 2435 set with a non-Togepi lead.

#### NBT-DLG-061-01ak — Elm: "I thought the Egg hatched", second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-01ak
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01g (other gender variant, msg 53); NBT-DLG-061-01q
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#40 (`GenderMessage 53 54`, second message); text archive 543 msg 54
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: {STRVAR_1, 3, 0, 0}? / I thought the Egg hatched. /// Where is the Pokémon? // (message 53, the other gender variant, has identical text; see NBT-DLG-061-01g)
- **OLD raw message data:** `Professor Elm: {STRVAR_1, 3, 0, 0}?\nI thought the Egg hatched.\fWhere is the Pokémon?\r` (msg 54)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 40.
- **OLD conditions and branch priority:** Flag 114 clear AND flag 2435 set AND the first healthy mon is not 175/176/468 (Function 6 else-branch). Player gender: `GenderMessage 53 54` shows its second message (54) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced with unresolved reachability (flag 2435).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 53 54`; (5) `SetVar 0x400F 1`; then Jump Function 5 (the ladder gives a follow-up line, often 01q at the end).
- **OLD state changes:** Temp var 0x400F = 1.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** 0x400F is also written by files 0002, 0128 (temp var).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 54 (the male-player variant is msg 53, NBT-DLG-061-01g)
- **Other affected callers or records:** None found other than Function 40.
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** Flag 2435 set with a non-Togepi lead; female player.

#### NBT-DLG-061-01h — Elm explains the Everstone
##### Record identity
- **Record ID:** NBT-DLG-061-01h
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01i
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#68, Function#69 (`Message 49`); text archive 543 msg 49
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: That’s an Everstone. // A Pokémon changes its shape as / it evolves. // But if it’s holding an Everstone, / you can prevent it from evolving. // If you like the way a Pokémon is now, / have it hold an Everstone! //
- **OLD raw message data:** `Professor Elm: That’s an Everstone.\rA Pokémon changes its shape as\nit evolves.\rBut if it’s holding an Everstone,\nyou can prevent it from evolving.\rIf you like the way a Pokémon is now,\nhave it hold an Everstone!\r`
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 68/69 after the Everstone is given.
- **OLD conditions and branch priority:** `CheckItemSpace` for item 229 passed (otherwise Function 74 and no message).
- **OLD event sequence:** (2) after `CommonScript 2033`, flags 114 and 282 set, `SetVar 0x400F 0`, `Message 49`, then 01i.
- **OLD state changes:** Flags 114, 282 set, var 0x400F = 0 (before the message).
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** GLB-RTN-2033.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 49
- **Other affected callers or records:** Functions 68 and 69 (same record).
- **Unresolved questions:** None.
- **Validation needed:** Everstone arrives in the Items pocket.

#### NBT-DLG-061-01i — Elm: good luck / research reminder
##### Record identity
- **Record ID:** NBT-DLG-061-01i
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01h; NBT-DLG-061-01al (other gender variant, msg 51)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#68, Function#69 (`GenderMessage 50 51`, first message); text archive 543 msg 50
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: {STRVAR_1, 3, 0, 0}, good luck / with your journey! // Oh, one more thing... / Don’t forget about my research! (message 51, the other gender variant, has identical text; see NBT-DLG-061-01al)
- **OLD raw message data:** `Professor Elm: {STRVAR_1, 3, 0, 0}, good luck\nwith your journey!\rOh, one more thing...\nDon’t forget about my research!` (msg 50)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 68/69 right after 01h (name buffer set by `TextPlayerName 0`).
- **OLD conditions and branch priority:** As 01h. Player gender: `GenderMessage 50 51` shows its first message (50) to a male player and its second (51) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 50 51`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 50 (the female-player variant is msg 51, NBT-DLG-061-01al)
- **Other affected callers or records:** Functions 68 and 69 (same record).
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** None beyond 01h.

#### NBT-DLG-061-01al — Elm: good luck / research reminder, second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-01al
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01i (other gender variant, msg 50); NBT-DLG-061-01h
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#68, Function#69 (`GenderMessage 50 51`, second message); text archive 543 msg 51
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: {STRVAR_1, 3, 0, 0}, good luck / with your journey! // Oh, one more thing... / Don’t forget about my research! (message 50, the other gender variant, has identical text; see NBT-DLG-061-01i)
- **OLD raw message data:** `Professor Elm: {STRVAR_1, 3, 0, 0}, good luck\nwith your journey!\rOh, one more thing...\nDon’t forget about my research!` (msg 51)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 68/69 right after 01h (name buffer set by `TextPlayerName 0`).
- **OLD conditions and branch priority:** As 01h. Player gender: `GenderMessage 50 51` shows its second message (51) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 50 51`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 51 (the male-player variant is msg 50, NBT-DLG-061-01i)
- **Other affected callers or records:** Functions 68 and 69 (same record).
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** None beyond 01h; female player.

#### NBT-DLG-061-01j — Elm: directions to Mr. Pokémon's house
##### Record identity
- **Record ID:** NBT-DLG-061-01j
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-EVT-061-13 (same message after the starter handoff); NBT-DLG-061-01am (other gender variant, msg 13)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#7 (`GenderMessage 12 13`, first message), Script#13 (`GenderMessage 12 13`, first message); text archive 543 msg 12
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Mr. Pokémon goes / everywhere and finds rarities. /// His house is past Cherrygrove City. // Go north a little past Cherrygrove. /// I’m counting on you, {STRVAR_1, 3, 0, 0}! (message 13, the other gender variant, has identical text; see NBT-DLG-061-01am)
- **OLD raw message data:** `Professor Elm: Mr. Pokémon goes\neverywhere and finds rarities.\fHis house is past Cherrygrove City.\rGo north a little past Cherrygrove.\fI’m counting on you, {STRVAR_1, 3, 0, 0}!` (msg 12)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 7, and by NBT-EVT-061-13 as the last line of the starter handoff.
- **OLD conditions and branch priority:** In Script 1: flag 114 clear, flag 2435 clear, 0x4108 between 1 and 2 (0x4108 != 0 and not > 2), and the ladder steps before did not match. In Script 13: just after the starter. Player gender: `GenderMessage 12 13` shows its first message (12) to a male player and its second (13) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 12 13`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats while 0x4108 is 1 or 2.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 12 (the female-player variant is msg 13, NBT-DLG-061-01am)
- **Other affected callers or records:** Script 13 (NBT-EVT-061-13) and Function 7.
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** Both call sites.

#### NBT-DLG-061-01am — Elm: directions to Mr. Pokémon's house, second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-01am
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-EVT-061-13 (same message after the starter handoff); NBT-DLG-061-01j (other gender variant, msg 12)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#7 (`GenderMessage 12 13`, second message), Script#13 (`GenderMessage 12 13`, second message); text archive 543 msg 13
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Mr. Pokémon goes / everywhere and finds rarities. /// His house is past Cherrygrove City. // Go north a little past Cherrygrove. /// I’m counting on you, {STRVAR_1, 3, 0, 0}! (message 12, the other gender variant, has identical text; see NBT-DLG-061-01j)
- **OLD raw message data:** `Professor Elm: Mr. Pokémon goes\neverywhere and finds rarities.\fHis house is past Cherrygrove City.\rGo north a little past Cherrygrove.\fI’m counting on you, {STRVAR_1, 3, 0, 0}!` (msg 13)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 7, and by NBT-EVT-061-13 as the last line of the starter handoff.
- **OLD conditions and branch priority:** In Script 1: flag 114 clear, flag 2435 clear, 0x4108 between 1 and 2 (0x4108 != 0 and not > 2), and the ladder steps before did not match. In Script 13: just after the starter. Player gender: `GenderMessage 12 13` shows its second message (13) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 12 13`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats while 0x4108 is 1 or 2.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 13 (the male-player variant is msg 12, NBT-DLG-061-01j)
- **Other affected callers or records:** Script 13 (NBT-EVT-061-13) and Function 7.
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** Both call sites; female player.

#### NBT-DLG-061-01k — Elm: "Don't give up!" (egg-quest stages)
##### Record identity
- **Record ID:** NBT-DLG-061-01k
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#41 (`Message 40`); text archive 543 msg 40
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Don’t give up! I’ll call / if I learn anything about that Egg!
- **OLD raw message data:** `Professor Elm: Don’t give up! I’ll call\nif I learn anything about that Egg!`
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 41.
- **OLD conditions and branch priority:** Var 0x4108 is 3, 4 or 5 (> 2 and not > 5), with the earlier ladder steps not matched. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (2) `Message 40`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 40
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** 0x4108 = 3, 4, 5.

#### NBT-DLG-061-01l — Elm: "Didn't you meet my assistant?"
##### Record identity
- **Record ID:** NBT-DLG-061-01l
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01an (other gender variant, msg 43)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#62 (`GenderMessage 42 43`, first message); text archive 543 msg 42
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: {STRVAR_1, 3, 0, 0}? / Didn’t you meet my assistant? // He should have met you with the Egg / at Violet City’s Poké Mart. (message 43, the other gender variant, has identical text; see NBT-DLG-061-01an)
- **OLD raw message data:** `Professor Elm: {STRVAR_1, 3, 0, 0}?\nDidn’t you meet my assistant?\rHe should have met you with the Egg\nat Violet City’s Poké Mart.` (msg 42)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 62.
- **OLD conditions and branch priority:** Var 0x4108 = 6; ladder steps before not matched. Reachability: Referenced and apparently reachable (0x4108 = 6 is written by file 0859). Player gender: `GenderMessage 42 43` shows its first message (42) to a male player and its second (43) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 42 43`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0; var 0x4108 writer in file 0859.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 42 (the female-player variant is msg 43, NBT-DLG-061-01an)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** 0x4108 = 6.

#### NBT-DLG-061-01an — Elm: "Didn't you meet my assistant?", second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-01an
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01l (other gender variant, msg 42)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#62 (`GenderMessage 42 43`, second message); text archive 543 msg 43
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: {STRVAR_1, 3, 0, 0}? / Didn’t you meet my assistant? // He should have met you with the Egg / at Violet City’s Poké Mart. (message 42, the other gender variant, has identical text; see NBT-DLG-061-01l)
- **OLD raw message data:** `Professor Elm: {STRVAR_1, 3, 0, 0}?\nDidn’t you meet my assistant?\rHe should have met you with the Egg\nat Violet City’s Poké Mart.` (msg 43)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 62.
- **OLD conditions and branch priority:** Var 0x4108 = 6; ladder steps before not matched. Player gender: `GenderMessage 42 43` shows its second message (43) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced and apparently reachable (0x4108 = 6 is written by file 0859).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 42 43`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0; var 0x4108 writer in file 0859.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 43 (the male-player variant is msg 42, NBT-DLG-061-01l)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** 0x4108 = 6; female player.

#### NBT-DLG-061-01m — Elm: "How is the Egg doing?"
##### Record identity
- **Record ID:** NBT-DLG-061-01m
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01ao (other gender variant, msg 45)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#70 (`GenderMessage 44 45`, first message); text archive 543 msg 44
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Hi, {STRVAR_1, 3, 0, 0}! / How are you? // How is the Egg doing? / Are you taking it everywhere you go? // Time and care will make it hatch / and give you a healthy /// Pokémon eventually! (message 45, the other gender variant, has identical text; see NBT-DLG-061-01ao)
- **OLD raw message data:** `Professor Elm: Hi, {STRVAR_1, 3, 0, 0}!\nHow are you?\rHow is the Egg doing?\nAre you taking it everywhere you go?\rTime and care will make it hatch\nand give you a healthy\fPokémon eventually!` (msg 44)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 70.
- **OLD conditions and branch priority:** Var 0x4108 is 7 or 8 (not <= 5 and not 6), flag 114 and 2435 clear. Player gender: `GenderMessage 44 45` shows its first message (44) to a male player and its second (45) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 44 45`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 44 (the female-player variant is msg 45, NBT-DLG-061-01ao)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** 0x4108 = 7, 8.

#### NBT-DLG-061-01ao — Elm: "How is the Egg doing?", second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-01ao
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01m (other gender variant, msg 44)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#70 (`GenderMessage 44 45`, second message); text archive 543 msg 45
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Hi, {STRVAR_1, 3, 0, 0}! / How are you? // How is the Egg doing? / Are you taking it everywhere you go? // Time and care will make it hatch / and give you a healthy /// Pokémon eventually! (message 44, the other gender variant, has identical text; see NBT-DLG-061-01m)
- **OLD raw message data:** `Professor Elm: Hi, {STRVAR_1, 3, 0, 0}!\nHow are you?\rHow is the Egg doing?\nAre you taking it everywhere you go?\rTime and care will make it hatch\nand give you a healthy\fPokémon eventually!` (msg 45)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 70.
- **OLD conditions and branch priority:** Var 0x4108 is 7 or 8 (not <= 5 and not 6), flag 114 and 2435 clear. Player gender: `GenderMessage 44 45` shows its second message (45) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 44 45`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 45 (the male-player variant is msg 44, NBT-DLG-061-01m)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** 0x4108 = 7, 8; female player.

#### NBT-DLG-061-01n — Elm: "such a great Trainer" (final-badge speech)
##### Record identity
- **Record ID:** NBT-DLG-061-01n
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01o, 01p, 01q, 01r; NBT-DLG-061-01ap (other gender variant, msg 103)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#34 (`GenderMessage 102 103`, first message); text archive 543 msg 102
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: {STRVAR_1, 3, 0, 0}! / I’m truly surprised! // I can’t believe that such a great / Trainer has been so close by /// all this time! // {STRVAR_1, 3, 0, 0}, you have been helping / me understand what it means to /// walk with Pokémon. // It is that... /// there is no end to the relationship /// between people and Pokémon! // Let me thank you once again for / your support! (message 103, the other gender variant, has identical text; see NBT-DLG-061-01ap)
- **OLD raw message data:** `Professor Elm: {STRVAR_1, 3, 0, 0}!\nI’m truly surprised!\rI can’t believe that such a great\nTrainer has been so close by\fall this time!\r{STRVAR_1, 3, 0, 0}, you have been helping\nme understand what it means to\fwalk with Pokémon.\rIt is that...\fthere is no end to the relationship\fbetween people and Pokémon!\rLet me thank you once again for\nyour support!` (msg 102)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 34 (first test of Function 5).
- **OLD conditions and branch priority:** Function 5 reached (flag 114 set, or 0x4108 >= 9, or via Function 6/40) AND `CheckBadge 15` = 1. Highest priority within Function 5. Reachability: Referenced and apparently reachable (needs badge 15; which badge is not named by the data read). Player gender: `GenderMessage 102 103` shows its first message (102) to a male player and its second (103) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 102 103`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 102 (the female-player variant is msg 103, NBT-DLG-061-01ap)
- **Other affected callers or records:** None found.
- **Unresolved questions:** What badge id 15 is. Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** Holding the badge.

#### NBT-DLG-061-01ap — Elm: "such a great Trainer" (final-badge speech), second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-01ap
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01n (other gender variant, msg 102); NBT-DLG-061-01o, 01p, 01q, 01r
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#34 (`GenderMessage 102 103`, second message); text archive 543 msg 103
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: {STRVAR_1, 3, 0, 0}! / I’m truly surprised! // I can’t believe that such a great / Trainer has been so close by /// all this time! // {STRVAR_1, 3, 0, 0}, you have been helping / me understand what it means to /// walk with Pokémon. // It is that... /// there is no end to the relationship /// between people and Pokémon! // Let me thank you once again for / your support! (message 102, the other gender variant, has identical text; see NBT-DLG-061-01n)
- **OLD raw message data:** `Professor Elm: {STRVAR_1, 3, 0, 0}!\nI’m truly surprised!\rI can’t believe that such a great\nTrainer has been so close by\fall this time!\r{STRVAR_1, 3, 0, 0}, you have been helping\nme understand what it means to\fwalk with Pokémon.\rIt is that...\fthere is no end to the relationship\fbetween people and Pokémon!\rLet me thank you once again for\nyour support!` (msg 103)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 34 (first test of Function 5).
- **OLD conditions and branch priority:** Function 5 reached (flag 114 set, or 0x4108 >= 9, or via Function 6/40) AND `CheckBadge 15` = 1. Highest priority within Function 5. Reachability: Referenced and apparently reachable (needs badge 15; which badge is not named by the data read). Player gender: `GenderMessage 102 103` shows its second message (103) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 102 103`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 103 (the male-player variant is msg 102, NBT-DLG-061-01n)
- **Other affected callers or records:** None found.
- **Unresolved questions:** What badge id 15 is. Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** Holding the badge; female player.

#### NBT-DLG-061-01o — Elm: Indigo Plateau directions
##### Record identity
- **Record ID:** NBT-DLG-061-01o
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01n
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#36 (`Message 70`); text archive 543 msg 70
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Hahaha... Good job! // That Egg that appeared to be rare has / brought you so much trouble, I guess. // The Kimono Girls said something / about me? /// I don’t have anything to do with it. // You made up your mind yourself / and went through with your decision. // Having achieved such a thing, / you should be able to take on /// the Pokémon League now! // You should head for the / Indigo Plateau! // Do you know how to get there? / Follow Route 27 to reach Route 26. /// Once you get there, go straight north!
- **OLD raw message data:** `Professor Elm: Hahaha... Good job!\rThat Egg that appeared to be rare has\nbrought you so much trouble, I guess.\rThe Kimono Girls said something\nabout me?\fI don’t have anything to do with it.\rYou made up your mind yourself\nand went through with your decision.\rHaving achieved such a thing,\nyou should be able to take on\fthe Pokémon League now!\rYou should head for the\nIndigo Plateau!\rDo you know how to get there?\nFollow Route 27 to reach Route 26.\fOnce you get there, go straight north!`
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 36.
- **OLD conditions and branch priority:** Function 5 reached, badge 15 NOT held, flag 242 clear, and (flag 264 set OR flag 265 set). Reachability: Referenced with unresolved reachability (needs flag 264 or 265, set by files 0021 / 0104, meaning unknown).
- **OLD event sequence:** (2) `Message 70`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Flags 264/265 from other files.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 70
- **Other affected callers or records:** None found.
- **Unresolved questions:** Meaning of 264/265.
- **Validation needed:** Set one of them on a test save.

#### NBT-DLG-061-01p — Elm: Kimono Girls are waiting
##### Record identity
- **Record ID:** NBT-DLG-061-01p
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-15e area (the same message is the closing line of NBT-EVT-061-15)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#37, Function#26, Function#27 (`Message 69`); text archive 543 msg 69
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: The Kimono Girls are / waiting for you at the /// Ecruteak Dance Theater.
- **OLD raw message data:** `Professor Elm: The Kimono Girls are\nwaiting for you at the\fEcruteak Dance Theater.`
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 37 and at the end of NBT-EVT-061-15 (Function 26/27).
- **OLD conditions and branch priority:** In Function 5: badge 15 not held, flag 242 clear, flags 264 and 265 clear, `CheckBadge 7` = 1. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (2) `Message 69`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 69
- **Other affected callers or records:** Function 26 and Function 27 (NBT-EVT-061-15).
- **Unresolved questions:** What badge id 7 is.
- **Validation needed:** Changing it changes both callers.

#### NBT-DLG-061-01q — Elm: "I'd love to take a look at the Pokémon that hatched"
##### Record identity
- **Record ID:** NBT-DLG-061-01q
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01g; NBT-DLG-061-01aq (other gender variant, msg 101)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#38 (`GenderMessage 100 101`, first message); text archive 543 msg 100
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** I’d love to take a look at the / Pokémon that hatched from /// that Egg, {STRVAR_1, 3, 0, 0}. (message 101, the other gender variant, has identical text; see NBT-DLG-061-01aq)
- **OLD raw message data:** `I’d love to take a look at the\nPokémon that hatched from\fthat Egg, {STRVAR_1, 3, 0, 0}.` (msg 100)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 38 (no `TextPlayerName 0` before it; the name token uses the buffer left from earlier).
- **OLD conditions and branch priority:** Function 5 reached, badge 15 not held, flag 242 clear, flags 264/265 clear, badge 7 not held, temp var 0x400F = 1 (set by Function 40 in the same talk). Player gender: `GenderMessage 100 101` shows its first message (100) to a male player and its second (101) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced with unresolved reachability (needs flag 2435).
- **OLD event sequence:** (2) `GenderMessage 100 101`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0 not refreshed in this function (Inferred: still holds the player name from Function 40).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 100 (the female-player variant is msg 101, NBT-DLG-061-01aq)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Whether 0x400F persists beyond the map visit (a temp var is expected not to). Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** None.

#### NBT-DLG-061-01aq — Elm: "I'd love to take a look at the Pokémon that hatched", second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-01aq
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01q (other gender variant, msg 100); NBT-DLG-061-01g
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#38 (`GenderMessage 100 101`, second message); text archive 543 msg 101
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** I’d love to take a look at the / Pokémon that hatched from /// that Egg, {STRVAR_1, 3, 0, 0}. (message 100, the other gender variant, has identical text; see NBT-DLG-061-01q)
- **OLD raw message data:** `I’d love to take a look at the\nPokémon that hatched from\fthat Egg, {STRVAR_1, 3, 0, 0}.` (msg 101)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 38 (no `TextPlayerName 0` before it; the name token uses the buffer left from earlier).
- **OLD conditions and branch priority:** Function 5 reached, badge 15 not held, flag 242 clear, flags 264/265 clear, badge 7 not held, temp var 0x400F = 1 (set by Function 40 in the same talk). Player gender: `GenderMessage 100 101` shows its second message (101) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced with unresolved reachability (needs flag 2435).
- **OLD event sequence:** (2) `GenderMessage 100 101`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0 not refreshed in this function (Inferred: still holds the player name from Function 40).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 101 (the male-player variant is msg 100, NBT-DLG-061-01q)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Whether 0x400F persists beyond the map visit (a temp var is expected not to). Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** None; female player.

#### NBT-DLG-061-01r — Elm: default greeting ("next Champion")
##### Record identity
- **Record ID:** NBT-DLG-061-01r
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01ar (other gender variant, msg 99)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#5 tail (`GenderMessage 98 99`, first message); text archive 543 msg 98
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Hi, {STRVAR_1, 3, 0, 0}! / How are you? // I’m sure you can be the next / Champion having taken care of /// that Egg! (message 99, the other gender variant, has identical text; see NBT-DLG-061-01ar)
- **OLD raw message data:** `Professor Elm: Hi, {STRVAR_1, 3, 0, 0}!\nHow are you?\rI’m sure you can be the next\nChampion having taken care of\fthat Egg!` (msg 98)
- **OLD trigger:** Shown by NBT-EVT-061-01 at the end of Function 5.
- **OLD conditions and branch priority:** Function 5 reached and none of its earlier tests matched (badge 15 not held, flag 242 clear, 264/265 clear, badge 7 not held, 0x400F != 1). This is what Elm says after the Everstone (flag 114 set) for most of the game, and for 0x4108 >= 9. Player gender: `GenderMessage 98 99` shows its first message (98) to a male player and its second (99) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 98 99`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 98 (the female-player variant is msg 99, NBT-DLG-061-01ar)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** None.

#### NBT-DLG-061-01ar — Elm: default greeting ("next Champion"), second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-01ar
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01r (other gender variant, msg 98)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#5 tail (`GenderMessage 98 99`, second message); text archive 543 msg 99
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Hi, {STRVAR_1, 3, 0, 0}! / How are you? // I’m sure you can be the next / Champion having taken care of /// that Egg! (message 98, the other gender variant, has identical text; see NBT-DLG-061-01r)
- **OLD raw message data:** `Professor Elm: Hi, {STRVAR_1, 3, 0, 0}!\nHow are you?\rI’m sure you can be the next\nChampion having taken care of\fthat Egg!` (msg 99)
- **OLD trigger:** Shown by NBT-EVT-061-01 at the end of Function 5.
- **OLD conditions and branch priority:** Function 5 reached and none of its earlier tests matched (badge 15 not held, flag 242 clear, 264/265 clear, badge 7 not held, 0x400F != 1). This is what Elm says after the Everstone (flag 114 set) for most of the game, and for 0x4108 >= 9. Player gender: `GenderMessage 98 99` shows its second message (99) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 98 99`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 99 (the male-player variant is msg 98, NBT-DLG-061-01r)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** None; female player.

#### NBT-DLG-061-01s — Elm: "Hi, <name>!" before the Pichu inspection
##### Record identity
- **Record ID:** NBT-DLG-061-01s
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01t to 01z, 01ab; NBT-DLG-061-01as (other gender variant, msg 85)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#31 (`GenderMessage 84 85`, first message), called from Function#4 and Function#54; text archive 543 msg 84
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Hi, {STRVAR_1, 3, 0, 0}! // (message 85, the other gender variant, has identical text; see NBT-DLG-061-01as)
- **OLD raw message data:** `Professor Elm: Hi, {STRVAR_1, 3, 0, 0}!\r` (msg 84)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 31 (a subroutine entered by `Call`).
- **OLD conditions and branch priority:** Lead healthy mon is a form-1 PICHU AND flags 242/2404 do not divert AND (0x4006 != 1) AND ((0x412F = 0) OR (0x412F = 1 AND happiness >= 220)). Player gender: `GenderMessage 84 85` shows its first message (84) to a male player and its second (85) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced with unresolved reachability (needs the form-1 Pichu, whose source is outside this file).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 84 85`, `CloseMessage`, then the follower-Pokémon walk-in (Actions by player direction).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Plays at the start of the first inspection and of the 0x412F = 1 happiness scene.
- **OLD dependencies and shared-resource effects:** Follower-Pokémon commands.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 84 (the female-player variant is msg 85, NBT-DLG-061-01as)
- **Other affected callers or records:** Function 4 and Function 54 (same record).
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** Needs a form-1 Pichu in the lead slot.

#### NBT-DLG-061-01as — Elm: "Hi, <name>!" before the Pichu inspection, second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-01as
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01s (other gender variant, msg 84); NBT-DLG-061-01t to 01z, 01ab
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#31 (`GenderMessage 84 85`, second message), called from Function#4 and Function#54; text archive 543 msg 85
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Hi, {STRVAR_1, 3, 0, 0}! // (message 84, the other gender variant, has identical text; see NBT-DLG-061-01s)
- **OLD raw message data:** `Professor Elm: Hi, {STRVAR_1, 3, 0, 0}!\r` (msg 85)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 31 (a subroutine entered by `Call`).
- **OLD conditions and branch priority:** Lead healthy mon is a form-1 PICHU AND flags 242/2404 do not divert AND (0x4006 != 1) AND ((0x412F = 0) OR (0x412F = 1 AND happiness >= 220)). Player gender: `GenderMessage 84 85` shows its second message (85) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced with unresolved reachability (needs the form-1 Pichu, whose source is outside this file).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 84 85`, `CloseMessage`, then the follower-Pokémon walk-in (Actions by player direction).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Plays at the start of the first inspection and of the 0x412F = 1 happiness scene.
- **OLD dependencies and shared-resource effects:** Follower-Pokémon commands.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 85 (the male-player variant is msg 84, NBT-DLG-061-01s)
- **Other affected callers or records:** Function 4 and Function 54 (same record).
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** Needs a form-1 Pichu in the lead slot; female player.

#### NBT-DLG-061-01t — Elm: "That is quite a rare PICHU!"
##### Record identity
- **Record ID:** NBT-DLG-061-01t
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01s
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#4 (`Message 75`); text archive 543 msg 75
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: That is quite a / rare PICHU! /// Can I take a look at it closely? //
- **OLD raw message data:** `Professor Elm: That is quite a\nrare PICHU!\fCan I take a look at it closely?\r`
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 4 after 01s.
- **OLD conditions and branch priority:** As 01s with 0x412F = 0 and 0x4006 != 1.
- **OLD event sequence:** (2) Elm `Action#29`, `Message 75`, `CloseMessage`, Elm `Action#30`, follower `Action#31`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once per game (0x412F becomes 1 at the end of the scene).
- **OLD dependencies and shared-resource effects:** Species name hard-coded in the text (PICHU).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 75
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Needs the form-1 Pichu.

#### NBT-DLG-061-01u — Elm: "One of the ears is spiky..."
##### Record identity
- **Record ID:** NBT-DLG-061-01u
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01t
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#4 (`Message 76`); text archive 543 msg 76
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Hmm... / One of the ears is spiky... /// That’s strange. /// There seems to be something more to it. // It really is a rare sight. //
- **OLD raw message data:** `Hmm...\nOne of the ears is spiky...\fThat’s strange.\fThere seems to be something more to it.\rIt really is a rare sight.\r`
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 4 after 01t.
- **OLD conditions and branch priority:** As 01t.
- **OLD event sequence:** (2) `Message 76`, `CloseMessage`, Elm `Action#29`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** As 01t.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 76
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** As 01t.

#### NBT-DLG-061-01v — Elm: Ilex Forest and Celebi
##### Record identity
- **Record ID:** NBT-DLG-061-01v
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01u
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#4 (`Message 77`); text archive 543 msg 77
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** You met it at the Ilex Forest? // A mysterious Pokémon called CELEBI / has been sighted there, or so I heard. //
- **OLD raw message data:** `You met it at the Ilex Forest?\rA mysterious Pokémon called CELEBI\nhas been sighted there, or so I heard.\r`
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 4 after 01u.
- **OLD conditions and branch priority:** As 01t.
- **OLD event sequence:** (2) `Message 77`, `CloseMessage`, Elm `Action#32` (exclamation).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** As 01t.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 77
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** As 01t.

#### NBT-DLG-061-01w — Elm: "Speaking of that..."
##### Record identity
- **Record ID:** NBT-DLG-061-01w
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01v
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#4 (`Message 78`); text archive 543 msg 78
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Speaking of that... //
- **OLD raw message data:** `Speaking of that...\r`
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 4 after 01v.
- **OLD conditions and branch priority:** As 01t.
- **OLD event sequence:** (2) `Message 78`, `CloseMessage`, Elm `Action#33`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** As 01t.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 78
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** As 01t.

#### NBT-DLG-061-01x — Elm: Professor Oak's paper on Celebi and Time Travel
##### Record identity
- **Record ID:** NBT-DLG-061-01x
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01w
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#4 (`Message 79`); text archive 543 msg 79
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Oak once wrote about / CELEBI and {COLOR, 0, 1}Time Travel{COLOR, 0, 0} in a research /// paper he presented at a conference! //
- **OLD raw message data:** `Professor Oak once wrote about\nCELEBI and {COLOR, 0, 1}Time Travel{COLOR, 0, 0} in a research\fpaper he presented at a conference!\r`
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 4 after 01w.
- **OLD conditions and branch priority:** As 01t.
- **OLD event sequence:** (2) `Message 79`, `CloseMessage`, then `GetOWPosition` of Elm and a walk (Function 32 or Action#34).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** As 01t.
- **OLD dependencies and shared-resource effects:** Colour tokens in text.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 79
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** As 01t.

#### NBT-DLG-061-01y — Elm: Celebi and Time Travel explained
##### Record identity
- **Record ID:** NBT-DLG-061-01y
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01x
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#32, Function#33 (`Message 80`); text archive 543 msg 80
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: CELEBI can use its / mystic power called {COLOR, 0, 1}Time Travel{COLOR, 0, 0}...to /// travel to the past and future. //
- **OLD raw message data:** `Professor Elm: CELEBI can use its\nmystic power called {COLOR, 0, 1}Time Travel{COLOR, 0, 0}...to\ftravel to the past and future.\r`
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 32 / 33 after 01x.
- **OLD conditions and branch priority:** As 01t.
- **OLD event sequence:** (2) `Message 80`, `CloseMessage`, then Elm walks (Action#49 or #56), then 01z.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** As 01t.
- **OLD dependencies and shared-resource effects:** Colour tokens in text.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 80
- **Other affected callers or records:** Functions 32 and 33 (same record).
- **Unresolved questions:** None.
- **Validation needed:** As 01t.

#### NBT-DLG-061-01z — Elm: "take extra care of it" (Pichu advice)
##### Record identity
- **Record ID:** NBT-DLG-061-01z
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01y; NBT-DLG-061-01at (other gender variant, msg 82)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#57, Function#58 (`GenderMessage 81 82`, first message); text archive 543 msg 81
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** If this PICHU has traveled through / time, perhaps you should take /// extra care of it, {STRVAR_1, 3, 0, 0}. // It seems that this PICHU has been / affected by traveling so far through /// time with CELEBI. // I’ll inform the Pokémon Center of it. // The lady at the reception should be / able to tell you if anything may affect /// that PICHU. (message 82, the other gender variant, has identical text; see NBT-DLG-061-01at)
- **OLD raw message data:** `If this PICHU has traveled through\ntime, perhaps you should take\fextra care of it, {STRVAR_1, 3, 0, 0}.\rIt seems that this PICHU has been\naffected by traveling so far through\ftime with CELEBI.\rI’ll inform the Pokémon Center of it.\rThe lady at the reception should be\nable to tell you if anything may affect\fthat PICHU.` (msg 81)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 57 / 58 after 01y.
- **OLD conditions and branch priority:** As 01t. Player gender: `GenderMessage 81 82` shows its first message (81) to a male player and its second (82) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 81 82`, `WaitButton`, `CloseMessage`; (5) `SetVar 0x412F 1`, `IncrementVar 0x4006 1`, `ReleaseAll`.
- **OLD state changes:** Var 0x412F = 1, temp var 0x4006 + 1.
- **OLD repeat/completion behavior:** Once per game for 0x412F = 0.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 81 (the female-player variant is msg 82, NBT-DLG-061-01at)
- **Other affected callers or records:** Functions 57 and 58 (same record).
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** As 01t.

#### NBT-DLG-061-01at — Elm: "take extra care of it" (Pichu advice), second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-01at
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01z (other gender variant, msg 81); NBT-DLG-061-01y
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#57, Function#58 (`GenderMessage 81 82`, second message); text archive 543 msg 82
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** If this PICHU has traveled through / time, perhaps you should take /// extra care of it, {STRVAR_1, 3, 0, 0}. // It seems that this PICHU has been / affected by traveling so far through /// time with CELEBI. // I’ll inform the Pokémon Center of it. // The lady at the reception should be / able to tell you if anything may affect /// that PICHU. (message 81, the other gender variant, has identical text; see NBT-DLG-061-01z)
- **OLD raw message data:** `If this PICHU has traveled through\ntime, perhaps you should take\fextra care of it, {STRVAR_1, 3, 0, 0}.\rIt seems that this PICHU has been\naffected by traveling so far through\ftime with CELEBI.\rI’ll inform the Pokémon Center of it.\rThe lady at the reception should be\nable to tell you if anything may affect\fthat PICHU.` (msg 82)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 57 / 58 after 01y.
- **OLD conditions and branch priority:** As 01t. Player gender: `GenderMessage 81 82` shows its second message (82) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 81 82`, `WaitButton`, `CloseMessage`; (5) `SetVar 0x412F 1`, `IncrementVar 0x4006 1`, `ReleaseAll`.
- **OLD state changes:** Var 0x412F = 1, temp var 0x4006 + 1.
- **OLD repeat/completion behavior:** Once per game for 0x412F = 0.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 82 (the male-player variant is msg 81, NBT-DLG-061-01z)
- **Other affected callers or records:** Functions 57 and 58 (same record).
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** As 01t; female player.

#### NBT-DLG-061-01aa — Elm: "This PICHU doesn't seem like a regular PICHU"
##### Record identity
- **Record ID:** NBT-DLG-061-01aa
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01z
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#28 (`Message 83`); text archive 543 msg 83
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: This PICHU doesn’t / seem like a regular PICHU. /// I’ll find out more about it.
- **OLD raw message data:** `Professor Elm: This PICHU doesn’t\nseem like a regular PICHU.\fI’ll find out more about it.`
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 28.
- **OLD conditions and branch priority:** Temp var 0x4006 = 1 (tested first inside Function 4), i.e. talking to Elm again in the same map visit after the 01z scene.
- **OLD event sequence:** (2) `Message 83`, `WaitButton`, `CloseMessage`, `IncrementVar 0x4006 1`, `ReleaseAll`.
- **OLD state changes:** Temp var 0x4006 + 1.
- **OLD repeat/completion behavior:** Once per visit (then 0x4006 = 2).
- **OLD dependencies and shared-resource effects:** 0x4006 is a temporary variable (expected to reset per map load: Inferred).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 83
- **Other affected callers or records:** None found.
- **Unresolved questions:** Whether 0x4006 resets on map load.
- **Validation needed:** Talk twice in one visit.

#### NBT-DLG-061-01ab — Elm: "your Spiky-eared PICHU seems to like you a lot"
##### Record identity
- **Record ID:** NBT-DLG-061-01ab
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01s, 01ac; NBT-DLG-061-01au (other gender variant, msg 87)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#54 (`GenderMessage 86 87`, first message); text archive 543 msg 86
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Oh, wow, your Spiky-eared PICHU seems / to like you a lot already, {STRVAR_1, 3, 0, 0}. // (message 87, the other gender variant, has identical text; see NBT-DLG-061-01au)
- **OLD raw message data:** `Oh, wow, your Spiky-eared PICHU seems\nto like you a lot already, {STRVAR_1, 3, 0, 0}.\r` (msg 86)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 54.
- **OLD conditions and branch priority:** Form-1 PICHU lead, 0x4006 != 1, 0x412F = 1, `GetPokemonHappiness` of the lead >= 220. Player gender: `GenderMessage 86 87` shows its first message (86) to a male player and its second (87) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced with unresolved reachability (Pichu source).
- **OLD event sequence:** (2) after `Call Function#31` (01s): `GenderMessage 86 87`, `CloseMessage`, Elm `Action#32`.
- **OLD state changes:** None here.
- **OLD repeat/completion behavior:** Once (0x412F becomes 2 at the end).
- **OLD dependencies and shared-resource effects:** Name buffer 0 (set in Function 31).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 86 (the female-player variant is msg 87, NBT-DLG-061-01au)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** Raise happiness to 220.

#### NBT-DLG-061-01au — Elm: "your Spiky-eared PICHU seems to like you a lot", second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-01au
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01ab (other gender variant, msg 86); NBT-DLG-061-01s, 01ac
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#54 (`GenderMessage 86 87`, second message); text archive 543 msg 87
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Oh, wow, your Spiky-eared PICHU seems / to like you a lot already, {STRVAR_1, 3, 0, 0}. // (message 86, the other gender variant, has identical text; see NBT-DLG-061-01ab)
- **OLD raw message data:** `Oh, wow, your Spiky-eared PICHU seems\nto like you a lot already, {STRVAR_1, 3, 0, 0}.\r` (msg 87)
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 54.
- **OLD conditions and branch priority:** Form-1 PICHU lead, 0x4006 != 1, 0x412F = 1, `GetPokemonHappiness` of the lead >= 220. Player gender: `GenderMessage 86 87` shows its second message (87) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). Reachability: Referenced with unresolved reachability (Pichu source).
- **OLD event sequence:** (2) after `Call Function#31` (01s): `GenderMessage 86 87`, `CloseMessage`, Elm `Action#32`.
- **OLD state changes:** None here.
- **OLD repeat/completion behavior:** Once (0x412F becomes 2 at the end).
- **OLD dependencies and shared-resource effects:** Name buffer 0 (set in Function 31).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 87 (the male-player variant is msg 86, NBT-DLG-061-01ab)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** Raise happiness to 220; female player.

#### NBT-DLG-061-01ac — Elm: "I would expect it to evolve into PIKACHU"
##### Record identity
- **Record ID:** NBT-DLG-061-01ac
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01ab, 01ad
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#54 (`Message 88`); text archive 543 msg 88
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Something’s funny... / I would expect it to evolve into /// PIKACHU since it likes its Trainer /// this much... //
- **OLD raw message data:** `Something’s funny...\nI would expect it to evolve into\fPIKACHU since it likes its Trainer\fthis much...\r`
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 54 after 01ab.
- **OLD conditions and branch priority:** As 01ab.
- **OLD event sequence:** (2) `Message 88`, `CloseMessage`, Elm `Action#30`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** As 01ab.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 88
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** As 01ab.

#### NBT-DLG-061-01ad — Elm: "Let me see... Just as I thought!"
##### Record identity
- **Record ID:** NBT-DLG-061-01ad
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01ac, 01ae
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#54 (`Message 89`); text archive 543 msg 89
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Let me see... // Hmm... // Could it be... // Just as I thought! //
- **OLD raw message data:** `Let me see...\rHmm...\rCould it be...\rJust as I thought!\r`
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 54 after 01ac.
- **OLD conditions and branch priority:** As 01ab.
- **OLD event sequence:** (2) `Message 89`, `CloseMessage`, Elm `Action#33`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** As 01ab.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 89
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** As 01ab.

#### NBT-DLG-061-01ae — Elm: "this PICHU will never evolve"
##### Record identity
- **Record ID:** NBT-DLG-061-01ae
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01ad, 01af
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#54 (`Message 90`); text archive 543 msg 90
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** It seems that this PICHU will never / evolve. It’s so strange! // Its structure and the traveling / through time must have affected /// its DNA. // I’ve never heard of a Pokémon that / doesn’t evolve when it’s /// supposed to...!
- **OLD raw message data:** `It seems that this PICHU will never\nevolve. It’s so strange!\rIts structure and the traveling\nthrough time must have affected\fits DNA.\rI’ve never heard of a Pokémon that\ndoesn’t evolve when it’s\fsupposed to...!`
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 54 after 01ad.
- **OLD conditions and branch priority:** As 01ab.
- **OLD event sequence:** (2) `Message 90`, `WaitButton`, `CloseMessage`; (5) `SetVar 0x412F 2`; `ReleaseAll`.
- **OLD state changes:** Var 0x412F = 2.
- **OLD repeat/completion behavior:** Once per game.
- **OLD dependencies and shared-resource effects:** Evolution behaviour of this Pichu form is set in species/engine data, not here (not checked).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 90
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** As 01ab.

#### NBT-DLG-061-01af — Elm: "Your Spiky-eared PICHU looks just fine!"
##### Record identity
- **Record ID:** NBT-DLG-061-01af
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-01
- **Related record IDs:** NBT-DLG-061-01ae
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#29 (`Message 91`); text archive 543 msg 91
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Your Spiky-eared PICHU / looks just fine! // I’ve never heard of a Pokémon that / doesn’t evolve when it’s /// supposed to. /// Please take good care of it.
- **OLD raw message data:** `Professor Elm: Your Spiky-eared PICHU\nlooks just fine!\rI’ve never heard of a Pokémon that\ndoesn’t evolve when it’s\fsupposed to.\fPlease take good care of it.`
- **OLD trigger:** Shown by NBT-EVT-061-01 Function 29.
- **OLD conditions and branch priority:** Form-1 PICHU lead, 0x4006 != 1, 0x412F >= 2.
- **OLD event sequence:** (2) `Message 91`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 91
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** As 01ab.

#### NBT-EVT-061-02 — Elm's aide: talk
##### Record identity
- **Record ID:** NBT-EVT-061-02
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-061-02a to 02e; NBT-EVT-061-04 (same NPC walks and hands items); NBT-EVT-061-16
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Aide, event file 58 overworld idx 2 (owID 2, sprite entry 29, (9,12)); A-press
- **Source references:** script file 843 Script#2; Functions 9, 10, 11, 42, 63, 71; event file 58 overworlds idx 2; text archive 543 msgs 18, 22, 41, 55, 57
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-061-02a to -02e.
- **OLD raw message data:** See the dialogue records.
- **OLD trigger:** A-press on the aide. Script 2: `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** (1) var 0x40FC = 3 -> Function 9 (02e). (2) var 0x4108 != 0 -> Function 10: if 0x4108 != 2 -> Function 42 (0x4108 = 4: 02c and `SetVar 0x4108 5`; otherwise if != 6 -> Function 71, else Function 63: both print 02d); if 0x4108 = 2 -> 02b. (3) Otherwise (0x4108 = 0) 02a. So by 0x4108: 0 -> 02a; 1 -> 02d; 2 -> 02b; 3 -> 02d; 4 -> 02c (and becomes 5); 5, 6, 7, 8, 9+ -> 02d; any value with 0x40FC = 3 -> 02e. Object visibility: hidden while flag 582 is set (set by file 0857, cleared by file 0858). Var 0x40FC writers: this file's Script 16 (=3); files 0007 (=1), 0111 (=2). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) A-press. (2) The branches above; each message is followed by `WaitButton`, `CloseMessage`, `ReleaseAll` (Function 11 / 9 / 71) — Script 2's own tail reaches Function 11 by `Jump`. (3) No choices. (4) Face player only. (5) Only the 0x4108 4 -> 5 change. (6) Repeats. (7) None.
- **OLD state changes:** Var 0x4108 = 5 when it was 4 (Function 42).
- **OLD repeat/completion behavior:** The 4 -> 5 step is once; all else repeats.
- **OLD dependencies and shared-resource effects:** Var 0x4108 and 0x40FC (other files write them).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 843 Script#2, Functions 9, 10, 11, 42, 63, 71; event file 58 overworld idx 2
- **Other affected callers or records:** Function 11 is also jumped to from Functions 10 and 42 (this record) and by Function 63; no other script uses Functions 9-11, 42, 63, 71 (Function 8, the Elm exit, is separate).
- **Unresolved questions:** Which scripts set 0x4108 = 1..9 relative to the story is outside this record's scope (writers: files 0229 = 3, 0859 = 6, 0858 = 7, 0112 = 8, this file = 1, 2, 4, 5, 9).
- **Validation needed:** One check per 0x4108 value.

#### NBT-DLG-061-02a — Aide: "Huh? Me? I'm not the professor."
##### Record identity
- **Record ID:** NBT-DLG-061-02a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-02
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Aide
- **Source references:** script file 843 Script#2 (`Message 18`); text archive 543 msg 18
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Huh? Me? / I’m not the professor. // He’s at the back of the room. / (the raw string ends with a line break)
- **OLD raw message data:** `Huh? Me?\nI’m not the professor.\rHe’s at the back of the room.\n`
- **OLD trigger:** Shown by NBT-EVT-061-02 Script 2 directly.
- **OLD conditions and branch priority:** Var 0x40FC != 3 AND var 0x4108 = 0. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (2) `Message 18`, Jump Function 11 (`WaitButton`, `CloseMessage`, `ReleaseAll`).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats while 0x4108 = 0.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 18
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Before the starter.

#### NBT-DLG-061-02b — Aide: "Pokémon are weak in the beginning" (talk version)
##### Record identity
- **Record ID:** NBT-DLG-061-02b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-02
- **Related record IDs:** NBT-DLG-061-04b (same words, trailing break differs)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Aide
- **Source references:** script file 843 Function#10 (`Message 22`); text archive 543 msg 22
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Pokémon are weak in the beginning. // Don’t hesitate to use a Potion if you / think yours is in danger.
- **OLD raw message data:** `Pokémon are weak in the beginning.\rDon’t hesitate to use a Potion if you\nthink yours is in danger.`
- **OLD trigger:** Shown by NBT-EVT-061-02 Function 10.
- **OLD conditions and branch priority:** Var 0x40FC != 3 AND var 0x4108 = 2.
- **OLD event sequence:** (2) `Message 22`, Jump Function 11.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats while 0x4108 = 2.
- **OLD dependencies and shared-resource effects:** Mentions Potions (given by NBT-EVT-061-04).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 22
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** After the handout.

#### NBT-DLG-061-02c — Aide: stolen Pokémon (first mention, advances 0x4108 to 5)
##### Record identity
- **Record ID:** NBT-DLG-061-02c
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-02
- **Related record IDs:** NBT-DLG-061-02d
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Aide
- **Source references:** script file 843 Function#42 (`Message 41`); text archive 543 msg 41
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** There was a loud noise outside... / When we went to look, someone /// stole a Pokémon. // Sigh... / That stolen Pokémon. // I wonder how it’s doing. / They say a Pokémon raised by a bad /// person turns bad itself.
- **OLD raw message data:** `There was a loud noise outside...\nWhen we went to look, someone\fstole a Pokémon.\rSigh... \nThat stolen Pokémon.\rI wonder how it’s doing.\nThey say a Pokémon raised by a bad\fperson turns bad itself.`
- **OLD trigger:** Shown by NBT-EVT-061-02 Function 42.
- **OLD conditions and branch priority:** Var 0x40FC != 3 AND var 0x4108 = 4.
- **OLD event sequence:** (2) `Message 41`, `SetVar 0x4108 5`, Jump Function 11.
- **OLD state changes:** Var 0x4108 = 5.
- **OLD repeat/completion behavior:** Once; afterwards 02d.
- **OLD dependencies and shared-resource effects:** Var 0x4108 progression.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 41
- **Other affected callers or records:** None found.
- **Unresolved questions:** Whether 0x4108 = 5 is needed by another map (only this file sets it and Elm's Function 41 treats 3-5 alike).
- **Validation needed:** After the cutscene.

#### NBT-DLG-061-02d — Aide: stolen Pokémon (repeat)
##### Record identity
- **Record ID:** NBT-DLG-061-02d
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-02
- **Related record IDs:** NBT-DLG-061-02c
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Aide
- **Source references:** script file 843 Function#63 and Function#71 (`Message 55`); text archive 543 msg 55
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Sigh... / That stolen Pokémon. // I wonder how it’s doing. / They say a Pokémon raised by a bad /// person turns bad itself.
- **OLD raw message data:** `Sigh... \nThat stolen Pokémon.\rI wonder how it’s doing.\nThey say a Pokémon raised by a bad\fperson turns bad itself.`
- **OLD trigger:** Shown by NBT-EVT-061-02 Function 63 / 71.
- **OLD conditions and branch priority:** Var 0x40FC != 3 AND var 0x4108 is none of 0, 2, 4 (so 1, 3, 5, 6, 7, 8, 9 and above).
- **OLD event sequence:** (2) `Message 55`, `WaitButton`, `CloseMessage`, `ReleaseAll` (Function 63 jumps to Function 11; Function 71 repeats the tail).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 55
- **Other affected callers or records:** Function 63 and Function 71 are two copies of the same branch (both print msg 55).
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-061-02e — Aide: the thief returned the Pokémon
##### Record identity
- **Record ID:** NBT-DLG-061-02e
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-02
- **Related record IDs:** NBT-DLG-061-16a
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Aide
- **Source references:** script file 843 Function#9 (`Message 57`); text archive 543 msg 57
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** The one who took it... / I mean the red-haired boy /// came up with the Pokémon. // But I saw his face as he passed / me here. He looked so happy!
- **OLD raw message data:** `The one who took it...\nI mean the red-haired boy\fcame up with the Pokémon.\rBut I saw his face as he passed\nme here. He looked so happy!`
- **OLD trigger:** Shown by NBT-EVT-061-02 Function 9.
- **OLD conditions and branch priority:** Var 0x40FC = 3 (checked first; set by NBT-EVT-061-16). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (2) `Message 57`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Var 0x40FC.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 57
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** After 0x40FC = 3.

#### NBT-EVT-061-03 — Officer and friend scene, rival naming, Mystery Egg handed over (level-script cutscene, var 0x4108 = 3)
##### Record identity
- **Record ID:** NBT-EVT-061-03
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-061-LS2; NBT-EVT-061-O1; NBT-EVT-061-O3; NBT-DLG-061-03a to 03q (03m to 03q are the second gender variants of 03b, 03g, 03h, 03k, 03l, in that order)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Officer (owID 1), friend (owID 3, added at run time), Professor Elm (owID 0), player; triggered by level script 616 entry 2, condition var 16648 (0x4108) = 3
- **Source references:** script file 843 Script#3; Function#12, Function#13; Actions 2-16; level script 616 variableValue (16648 = 3 -> script 3); text archive 543 msgs 23-39
- **Evidence status:** Verified (control flow); Inferred where noted
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-061-03a to -03l.
- **OLD raw message data:** See the dialogue records.
- **OLD trigger:** On entering the map (level script 616, `variableValue` list), when var 0x4108 = 3. Var 0x4108 = 3 is written by script file 0229 (`SetVar 0x4108 3`, with `SetVar 0x4107 1`; header not mapped).
- **OLD conditions and branch priority:** Level-script list is evaluated in order: var 16636 = 2 -> script 16 first; then var 16648 = 3 -> script 3; then var 16648 = 8 -> script 15 (list order as stored; whether the engine runs only the first match is not verified here). Object visibility: the officer (Overworld 1) is hidden by flag 413 and the friend (Overworld 3) by flag 422, which at this time must be clear/cleared by the script itself (`ClearFlag 422` before `AddOW Overworld.3`; flag 413 cleared by file 0229). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Script 3 starts with `MecScript`, `LockAll`. (2) `LockFollowingPoke 0`, `WaitFollowingPoke`, `SetFollowingPokeMovement 55`, player `Action#2` (walk north 8 steps, face west), `WaitMovement`, re-attach follower (`SetFollowingPokeMovement 48`), officer `Action#3` (turn east), `Message 23` (03a), `CloseMessage`. `ClearFlag 422`, `PlayFanfare SEQ_SE_DP_KAIDAN2`, `AddOW Overworld.3` (friend appears), `WaitFanfare`, `CommonScript 2029` (GLB-RTN-2029), friend `Action#4` (walk north 4, west 4, jump on spot) and officer `Action#5`, `WaitMovement`, `GenderMessage 24 25` (03b), `CloseMessage`, officer `Action#6` (exclamation emote and head turns), `Message 26` (03c), `CloseMessage`, `CommonScript 2030` (GLB-RTN-2030). (3) Rival naming: `FadeScreen`, `WaitFadeScreen`, `ChooseRivalName 0x800C` (name-entry screen; the result in 0x800C), fade back; if the result = 1 -> Function 12, which re-runs the same fade / `ChooseRivalName` / test and, on a result other than 1, continues exactly like the inline tail below (Function 12 is a verbatim copy of the tail from the fade onward, with the result = 1 case looping to itself); otherwise officer `Action#3`, `TextRivalName 1`, `Message 27` (03d, YES/NO via `OpenTouchScreen` / `YesNoTouchScreen` / `CloseTouchScreen`); No (1) -> Function 13 (`Message 29` (03f), `CloseMessage`, Jump Function 12 = ask for the name again); Yes (0) -> `CloseMessage`, `Message 28` (03e), `CloseMessage`. (4) Officer `Action#8` and friend `Action#7` movements; `PlayFanfare SEQ_SE_DP_KAIDAN2`, `RemoveOW Overworld.1`, `WaitFanfare`; friend `Action#9`; `TextPlayerName 0`, `GenderMessage 30 31` (03g), `CloseMessage`; friend `Action#10`; `SetFlag 741`; fanfare, `RemoveOW Overworld.3`, `WaitFanfare`; `SetFlag 413`, `SetFlag 422`, `SetFlag 121`; player `Action#11` (face north); Elm `Action#12` (turn south); `TextPlayerName 0`, `GenderMessage 32 33` (03h), `CloseMessage`; `Message 34` (03i), `PlaySound SEQ_ME_ITEM`, `WaitSound`; `SetVar 0x8004 484` (Mystery Egg), `SetVar 0x8005 1`, `TakeItem 0x8004 0x8005 0x800C` (the result in 0x800C is not tested); Elm `Action#13` (jump, step north), `Message 35` (03j), `CloseMessage`, Elm `Action#14`, `GenderMessage 36 37` (03k), `CloseMessage`, Elm `Action#15`, `GenderMessage 38 39` (03l), `CloseMessage`, Elm `Action#16`. (5) Flags and vars: `SetFlag 406`, `ClearFlag 409`, `SetVar 0x4108 4`, `SetVar 0x408B 1`, `ClearFlag 420`, `ClearFlag 421`, `SetVar 0x4107 2`, `SetVar 0x4072 3`, `ClearFlag 404`, `SetVar 0x4095 1`, `ReleaseAll`, `End`. (6) Plays once: after it 0x4108 = 4, so neither the level script's 3 nor any other trigger repeats it (unless another file writes 3 again). (7) Dependencies: GLB-RTN-2029, GLB-RTN-2030, `ChooseRivalName` (rival naming), `TextRivalName`. 
- **OLD state changes:** Flags set: 741, 413, 422, 121, 406. Flags cleared: 422 (briefly), 409, 420, 421, 404. Vars: 0x4108 = 4, 0x408B = 1, 0x4107 = 2, 0x4072 = 3, 0x4095 = 1. Bag: Mystery Egg (item 484) x1 removed. Rival name stored (via `ChooseRivalName`).
- **OLD repeat/completion behavior:** Once per game (0x4108 moves 3 -> 4).
- **OLD dependencies and shared-resource effects:** Writes six flags/vars that other maps read (Route 29/30 friend, Marill, Joey, Cherrygrove clerk, Mr. Pokémon's house scene, New Bark OW scene; table above). The rival-name choice feeds all later `TextRivalName` uses (not enumerated). The sequence assumes the player holds item 484 (the result of `TakeItem` is ignored).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 843 Script#3, Functions 12-13; level script 616 variableValue trigger (16648 = 3 -> 3); Actions 2-16
- **Other affected callers or records:** Function 12 and 13 are reached only from Script 3 (Function 12 is also its own loop target). Nothing else in 843 calls Script 3.
- **Unresolved questions:** What `ChooseRivalName` result = 1 means (the engine data read does not say; the script loops on it); whether the engine runs several matching level-script triggers; whether `MecScript` is a movement/event-control marker.
- **Validation needed:** Trigger once at var 3; rival name flows to later rival text.

#### NBT-DLG-061-03a — Officer: "Who are you? We are investigating..."
##### Record identity
- **Record ID:** NBT-DLG-061-03a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-03
- **Related record IDs:** NBT-EVT-061-O1
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Officer (owID 1; speaker inferred from the text: the investigating person)
- **Source references:** script file 843 Script#3 (`Message 23`); text archive 543 msg 23
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Who are you? / We are investigating the case of the /// missing Pokémon here... // Rule number one! / “Whoever did it will come /// back to the site.” // Oh my... So you must be... / the one who did it? //
- **OLD raw message data:** `Who are you?\nWe are investigating the case of the\fmissing Pokémon here...\rRule number one!\n“Whoever did it will come\fback to the site.”\rOh my... So you must be...\nthe one who did it?\r`
- **OLD trigger:** Shown by NBT-EVT-061-03 after the walk-in.
- **OLD conditions and branch priority:** Var 0x4108 = 3 at map entry.
- **OLD event sequence:** (2) `Message 23`, `CloseMessage`, then `ClearFlag 422` and the friend enters.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 23
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Trigger the scene.

#### NBT-DLG-061-03b — Friend: "Hold on a second! He/She has nothing to do with it!"
##### Record identity
- **Record ID:** NBT-DLG-061-03b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-03
- **Related record IDs:** NBT-EVT-061-O3; NBT-DLG-061-03m (other gender variant, msg 25)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Friend: Lyra (msg 24, per the text prefix)
- **Source references:** script file 843 Script#3 (`GenderMessage 24 25`, first message); text archive 543 msg 24
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Lyra: Hold on a second! / He has nothing to do with it! // I saw it. / There was a red-haired boy /// looking into the building! //
- **OLD raw message data:** `Lyra: Hold on a second!\nHe has nothing to do with it!\rI saw it.\nThere was a red-haired boy\flooking into the building!\r` (msg 24)
- **OLD trigger:** Shown by NBT-EVT-061-03 after the friend arrives and `CommonScript 2029`.
- **OLD conditions and branch priority:** Player gender: `GenderMessage 24 25` shows its first message (24) to a male player and its second (25) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). The text corroborates it: msg 24 has the friend Lyra saying "He has nothing to do with it", i.e. the player is a boy.
- **OLD event sequence:** (2) `GenderMessage 24 25`, `CloseMessage`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Names Lyra / Ethan are written into the text, not taken from a name buffer.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 24 (the female-player variant is msg 25, NBT-DLG-061-03m)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Gender mapping is Inferred (first message = male player; text pronoun corroborates), not run-tested.
- **Validation needed:** Both genders.

#### NBT-DLG-061-03m — Friend: "Hold on a second! He/She has nothing to do with it!", second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-03m
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-03
- **Related record IDs:** NBT-EVT-061-O3; NBT-DLG-061-03b (other gender variant, msg 24)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Friend: Ethan (msg 25, per the text prefix)
- **Source references:** script file 843 Script#3 (`GenderMessage 24 25`, second message); text archive 543 msg 25
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Ethan: Hold on a second! / She has nothing to do with it! // I saw it. / There was a red-haired boy /// looking into the building! //
- **OLD raw message data:** `Ethan: Hold on a second!\nShe has nothing to do with it!\rI saw it.\nThere was a red-haired boy\flooking into the building!\r` (msg 25)
- **OLD trigger:** Shown by NBT-EVT-061-03 after the friend arrives and `CommonScript 2029`.
- **OLD conditions and branch priority:** Player gender: `GenderMessage 24 25` shows its second message (25) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). The text corroborates it: msg 25 has the friend Ethan saying "She has nothing to do with it", i.e. the player is a girl.
- **OLD event sequence:** (2) `GenderMessage 24 25`, `CloseMessage`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Names Lyra / Ethan are written into the text, not taken from a name buffer.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 25 (the male-player variant is msg 24, NBT-DLG-061-03b)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Gender mapping is Inferred (second message = female player; text pronoun corroborates), not run-tested.
- **Validation needed:** Both genders.

#### NBT-DLG-061-03c — Officer: "Did you happen to get his name?"
##### Record identity
- **Record ID:** NBT-DLG-061-03c
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-03
- **Related record IDs:** NBT-DLG-061-03d
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Officer
- **Source references:** script file 843 Script#3 (`Message 26`); text archive 543 msg 26
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** What? / You battled a boy like that? // He must be the one who did it... / Did you happen to get his name? //
- **OLD raw message data:** `What?\nYou battled a boy like that?\rHe must be the one who did it...\nDid you happen to get his name?\r`
- **OLD trigger:** Shown by NBT-EVT-061-03 after 03b and the officer's emote.
- **OLD conditions and branch priority:** Same scene; precedes the naming screen.
- **OLD event sequence:** (2) `Message 26`, `CloseMessage`, `CommonScript 2030`, then the rival name screen.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Leads into the rival name screen (`ChooseRivalName`).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 26
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-061-03d — Officer: rival-name confirmation (Yes/No)
##### Record identity
- **Record ID:** NBT-DLG-061-03d
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-03
- **Related record IDs:** NBT-DLG-061-03e, 03f
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Officer
- **Source references:** script file 843 Script#3 and Function#12 (`TextRivalName 1`, `Message 27`, `YesNoTouchScreen`); text archive 543 msg 27
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** I see! So {STRVAR_1, 3, 1, 0} was / his name. {YESNO, 0, 0} (name buffer 1 = the rival name just entered; options Yes / No)
- **OLD raw message data:** `I see! So {STRVAR_1, 3, 1, 0} was\nhis name. {YESNO, 0, 0}`
- **OLD trigger:** Shown by NBT-EVT-061-03 after the name entry returns a result other than 1 (the same text is shown from Function 12 after a retry).
- **OLD conditions and branch priority:** Choice: Yes (0x800C = 0) -> 03e; No (0x800C = 1) -> Function 13 (03f) then the name screen again.
- **OLD event sequence:** (2) `TextRivalName 1`, `Message 27`, `OpenTouchScreen`, `YesNoTouchScreen 0x800C`, `CloseTouchScreen`; (3) as above.
- **OLD state changes:** The name is already stored by the name screen (not changed here).
- **OLD repeat/completion behavior:** Loops until Yes.
- **OLD dependencies and shared-resource effects:** Rival name buffer.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 27
- **Other affected callers or records:** The inline copy in Script 3 and the copy in Function 12 both print it.
- **Unresolved questions:** None.
- **Validation needed:** Yes and No arms.

#### NBT-DLG-061-03e — Officer: "Thanks for helping my investigation!"
##### Record identity
- **Record ID:** NBT-DLG-061-03e
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-03
- **Related record IDs:** NBT-DLG-061-03d
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Officer
- **Source references:** script file 843 Script#3 and Function#12 (`Message 28`); text archive 543 msg 28
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Thanks for helping my investigation! // My next assignment is to search for / this red-haired individual. //
- **OLD raw message data:** `Thanks for helping my investigation!\rMy next assignment is to search for\nthis red-haired individual.\r`
- **OLD trigger:** Shown after the Yes answer in 03d.
- **OLD conditions and branch priority:** 03d answered Yes.
- **OLD event sequence:** (2) `CloseMessage`, `Message 28`, `CloseMessage`, officer leaves.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 28
- **Other affected callers or records:** Inline Script 3 and Function 12 copies.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-061-03f — Officer: "That's not it? ... what the name was?"
##### Record identity
- **Record ID:** NBT-DLG-061-03f
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-03
- **Related record IDs:** NBT-DLG-061-03d
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Officer
- **Source references:** script file 843 Function#13 (`Message 29`); text archive 543 msg 29
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** That’s not it? // Then can you tell me / what the name was? //
- **OLD raw message data:** `That’s not it?\rThen can you tell me\nwhat the name was?\r`
- **OLD trigger:** Shown by Function 13 after No in 03d.
- **OLD conditions and branch priority:** 03d answered No.
- **OLD event sequence:** (2) `Message 29`, `CloseMessage`, Jump Function 12 (name screen again).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats until Yes.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 29
- **Other affected callers or records:** Function 13 only.
- **Unresolved questions:** None.
- **Validation needed:** No arm.

#### NBT-DLG-061-03g — Friend: "I'm glad they understand you are innocent."
##### Record identity
- **Record ID:** NBT-DLG-061-03g
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-03
- **Related record IDs:** NBT-EVT-061-O3; NBT-DLG-061-03n (other gender variant, msg 31)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Friend: Lyra (msg 30)
- **Source references:** script file 843 Script#3 and Function#12 (`GenderMessage 30 31`, first message); text archive 543 msg 30
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Lyra: {STRVAR_1, 3, 0, 0}! / I’m glad they understand you are /// innocent. // See you later! //
- **OLD raw message data:** `Lyra: {STRVAR_1, 3, 0, 0}!\nI’m glad they understand you are\finnocent.\rSee you later!\r` (msg 30)
- **OLD trigger:** Shown by NBT-EVT-061-03 after the officer leaves (`TextPlayerName 0` set before).
- **OLD conditions and branch priority:** Player gender: `GenderMessage 30 31` shows its first message (30, Lyra) to a male player and its second (31, Ethan) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested; consistent with 03b, where msg 24 (Lyra) refers to the player as "He").
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 30 31`, `CloseMessage`, then the friend walks out.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 30 (the female-player variant is msg 31, NBT-DLG-061-03n)
- **Other affected callers or records:** Inline Script 3 and Function 12 copies.
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** Both genders.

#### NBT-DLG-061-03n — Friend: "I'm glad they understand you are innocent.", second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-03n
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-03
- **Related record IDs:** NBT-EVT-061-O3; NBT-DLG-061-03g (other gender variant, msg 30)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Friend: Ethan (msg 31)
- **Source references:** script file 843 Script#3 and Function#12 (`GenderMessage 30 31`, second message); text archive 543 msg 31
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Ethan: {STRVAR_1, 3, 0, 0}! / I’m glad they understand you are /// innocent. // See you later! //
- **OLD raw message data:** `Ethan: {STRVAR_1, 3, 0, 0}!\nI’m glad they understand you are\finnocent.\rSee you later!\r` (msg 31)
- **OLD trigger:** Shown by NBT-EVT-061-03 after the officer leaves (`TextPlayerName 0` set before).
- **OLD conditions and branch priority:** Player gender: `GenderMessage 30 31` shows its second message (31, Ethan) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested; consistent with 03m, where msg 25 (Ethan) refers to the player as "She").
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 30 31`, `CloseMessage`, then the friend walks out.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 31 (the male-player variant is msg 30, NBT-DLG-061-03g)
- **Other affected callers or records:** Inline Script 3 and Function 12 copies.
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** Both genders.

#### NBT-DLG-061-03h — Elm: "this is terrible... what was Mr. Pokémon's big discovery?"
##### Record identity
- **Record ID:** NBT-DLG-061-03h
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-03
- **Related record IDs:** NBT-DLG-061-03i; NBT-DLG-061-03o (other gender variant, msg 33)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Script#3 and Function#12 (`GenderMessage 32 33`, first message); text archive 543 msg 32
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: {STRVAR_1, 3, 0, 0}, this / is terrible... // Oh, yes, what was Mr. Pokémon’s / big discovery? // (message 33, the other gender variant, has identical text; see NBT-DLG-061-03o)
- **OLD raw message data:** `Professor Elm: {STRVAR_1, 3, 0, 0}, this\nis terrible...\rOh, yes, what was Mr. Pokémon’s\nbig discovery?\r` (msg 32)
- **OLD trigger:** Shown by NBT-EVT-061-03 after the friend leaves and Elm turns to the player.
- **OLD conditions and branch priority:** Same scene. Player gender: `GenderMessage 32 33` shows its first message (32) to a male player and its second (33) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 32 33`, `CloseMessage`, then 03i.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 32 (the female-player variant is msg 33, NBT-DLG-061-03o)
- **Other affected callers or records:** Inline Script 3 and Function 12 copies.
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** None.

#### NBT-DLG-061-03o — Elm: "this is terrible... what was Mr. Pokémon's big discovery?", second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-03o
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-03
- **Related record IDs:** NBT-DLG-061-03h (other gender variant, msg 32); NBT-DLG-061-03i
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Script#3 and Function#12 (`GenderMessage 32 33`, second message); text archive 543 msg 33
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: {STRVAR_1, 3, 0, 0}, this / is terrible... // Oh, yes, what was Mr. Pokémon’s / big discovery? // (message 32, the other gender variant, has identical text; see NBT-DLG-061-03h)
- **OLD raw message data:** `Professor Elm: {STRVAR_1, 3, 0, 0}, this\nis terrible...\rOh, yes, what was Mr. Pokémon’s\nbig discovery?\r` (msg 33)
- **OLD trigger:** Shown by NBT-EVT-061-03 after the friend leaves and Elm turns to the player.
- **OLD conditions and branch priority:** Same scene. Player gender: `GenderMessage 32 33` shows its second message (33) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 32 33`, `CloseMessage`, then 03i.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 33 (the male-player variant is msg 32, NBT-DLG-061-03h)
- **Other affected callers or records:** Inline Script 3 and Function 12 copies.
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** None; female player.

#### NBT-DLG-061-03i — System line: the Mystery Egg is handed to Elm
##### Record identity
- **Record ID:** NBT-DLG-061-03i
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-03
- **Related record IDs:** NBT-DLG-061-03h, 03j
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Narration (no speaker)
- **Source references:** script file 843 Script#3 and Function#12 (`Message 34`, then `PlaySound SEQ_ME_ITEM`); text archive 543 msg 34
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** {STRVAR_1, 3, 0, 0} handed the Mystery Egg / to Professor Elm.
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0} handed the Mystery Egg\nto Professor Elm.`
- **OLD trigger:** Shown by NBT-EVT-061-03 after 03h.
- **OLD conditions and branch priority:** Same scene; then item 484 x1 is taken with `TakeItem`.
- **OLD event sequence:** (2) `Message 34`, `PlaySound SEQ_ME_ITEM`, `WaitSound`, `SetVar 0x8004 484`, `SetVar 0x8005 1`, `TakeItem 0x8004 0x8005 0x800C`.
- **OLD state changes:** Mystery Egg removed from the bag (item 484, by `lookup_names`).
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** The player must hold the Mystery Egg (supplied by an earlier map; not checked).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 34
- **Other affected callers or records:** Inline Script 3 and Function 12 copies.
- **Unresolved questions:** Where the Mystery Egg item is given.
- **Validation needed:** None.

#### NBT-DLG-061-03j — Elm: "This is an... Egg, isn't it?"
##### Record identity
- **Record ID:** NBT-DLG-061-03j
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-03
- **Related record IDs:** NBT-DLG-061-03i, 03k
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Script#3 and Function#12 (`Message 35`); text archive 543 msg 35
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Huh? / This is an...Egg, isn’t it? // This Egg may be something I’ve never / seen...still it’s just an Egg. // Mr. Pokémon is always fascinated / by Eggs. // Well, since he gave it to us, we might / as well find out what secret it holds. // I’ll keep it for a while to find out / about the Egg. //
- **OLD raw message data:** `Professor Elm: Huh?\nThis is an...Egg, isn’t it?\rThis Egg may be something I’ve never\nseen...still it’s just an Egg.\rMr. Pokémon is always fascinated\nby Eggs.\rWell, since he gave it to us, we might\nas well find out what secret it holds.\rI’ll keep it for a while to find out\nabout the Egg.\r`
- **OLD trigger:** Shown by NBT-EVT-061-03 after the Egg handover and Elm's jump.
- **OLD conditions and branch priority:** Same scene.
- **OLD event sequence:** (2) `Message 35`, `CloseMessage`, Elm `Action#14`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 35
- **Other affected callers or records:** Inline Script 3 and Function 12 copies.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-061-03k — Elm: "Professor Oak gave you a Pokédex?"
##### Record identity
- **Record ID:** NBT-DLG-061-03k
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-03
- **Related record IDs:** NBT-DLG-061-03j, 03l; NBT-DLG-061-03p (other gender variant, msg 37)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Script#3 and Function#12 (`GenderMessage 36 37`, first message); text archive 543 msg 36
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: What?! // Professor Oak gave you a Pokédex? // {STRVAR_1, 3, 0, 0}, is that true? Th-that’s / incredible! // He is superb at seeing the potential / of people as Trainers. // Wow, {STRVAR_1, 3, 0, 0}. / I knew you were a little different. /// Things are going to be fun! // Your Pokémon seem to really like you, / so why don’t you...take the /// Pokémon Gym challenge? // If you manage to defeat all the / Gym Leaders, you’ll eventually /// challenge the Pokémon League /// Champion! // ...Or not! Ha ha! // Becoming the Champion is not at all / easy, but you can certainly /// challenge Violet City’s Gym. // (message 37, the other gender variant, has identical text; see NBT-DLG-061-03p)
- **OLD raw message data:** `Professor Elm: What?!\rProfessor Oak gave you a Pokédex?\r{STRVAR_1, 3, 0, 0}, is that true? Th-that’s\nincredible!\rHe is superb at seeing the potential\nof people as Trainers.\rWow, {STRVAR_1, 3, 0, 0}.\nI knew you were a little different.\fThings are going to be fun!\rYour Pokémon seem to really like you,\nso why don’t you...take the\fPokémon Gym challenge?\rIf you manage to defeat all the\nGym Leaders, you’ll eventually\fchallenge the Pokémon League\fChampion!\r...Or not! Ha ha!\rBecoming the Champion is not at all\neasy, but you can certainly\fchallenge Violet City’s Gym.\r` (msg 36)
- **OLD trigger:** Shown by NBT-EVT-061-03 after 03j (no `TextPlayerName 0` immediately before; the buffer set earlier is reused).
- **OLD conditions and branch priority:** Same scene. This message refers to a Pokédex given by Professor Oak; the Pokédex is not given in this script (dependency on an earlier event outside this file). Player gender: `GenderMessage 36 37` shows its first message (36) to a male player and its second (37) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `GenderMessage 36 37`, `CloseMessage`, Elm `Action#15`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Assumes the Pokédex was received earlier (no check).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 36 (the female-player variant is msg 37, NBT-DLG-061-03p)
- **Other affected callers or records:** Inline Script 3 and Function 12 copies.
- **Unresolved questions:** Where the Pokédex is given. Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** None.

#### NBT-DLG-061-03p — Elm: "Professor Oak gave you a Pokédex?", second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-03p
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-03
- **Related record IDs:** NBT-DLG-061-03k (other gender variant, msg 36); NBT-DLG-061-03j, 03l
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Script#3 and Function#12 (`GenderMessage 36 37`, second message); text archive 543 msg 37
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: What?! // Professor Oak gave you a Pokédex? // {STRVAR_1, 3, 0, 0}, is that true? Th-that’s / incredible! // He is superb at seeing the potential / of people as Trainers. // Wow, {STRVAR_1, 3, 0, 0}. / I knew you were a little different. /// Things are going to be fun! // Your Pokémon seem to really like you, / so why don’t you...take the /// Pokémon Gym challenge? // If you manage to defeat all the / Gym Leaders, you’ll eventually /// challenge the Pokémon League /// Champion! // ...Or not! Ha ha! // Becoming the Champion is not at all / easy, but you can certainly /// challenge Violet City’s Gym. // (message 36, the other gender variant, has identical text; see NBT-DLG-061-03k)
- **OLD raw message data:** `Professor Elm: What?!\rProfessor Oak gave you a Pokédex?\r{STRVAR_1, 3, 0, 0}, is that true? Th-that’s\nincredible!\rHe is superb at seeing the potential\nof people as Trainers.\rWow, {STRVAR_1, 3, 0, 0}.\nI knew you were a little different.\fThings are going to be fun!\rYour Pokémon seem to really like you,\nso why don’t you...take the\fPokémon Gym challenge?\rIf you manage to defeat all the\nGym Leaders, you’ll eventually\fchallenge the Pokémon League\fChampion!\r...Or not! Ha ha!\rBecoming the Champion is not at all\neasy, but you can certainly\fchallenge Violet City’s Gym.\r` (msg 37)
- **OLD trigger:** Shown by NBT-EVT-061-03 after 03j (no `TextPlayerName 0` immediately before; the buffer set earlier is reused).
- **OLD conditions and branch priority:** Same scene. This message refers to a Pokédex given by Professor Oak; the Pokédex is not given in this script (dependency on an earlier event outside this file). Player gender: `GenderMessage 36 37` shows its second message (37) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `GenderMessage 36 37`, `CloseMessage`, Elm `Action#15`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Assumes the Pokédex was received earlier (no check).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 37 (the male-player variant is msg 36, NBT-DLG-061-03k)
- **Other affected callers or records:** Inline Script 3 and Function 12 copies.
- **Unresolved questions:** Where the Pokédex is given. Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** None; female player.

#### NBT-DLG-061-03l — Elm: "talk to your mom before you leave"
##### Record identity
- **Record ID:** NBT-DLG-061-03l
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-03
- **Related record IDs:** NBT-DLG-061-03k; NBT-DLG-061-03q (other gender variant, msg 39)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Script#3 and Function#12 (`GenderMessage 38 39`, first message); text archive 543 msg 38
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** ...{STRVAR_1, 3, 0, 0}. Challenging the / Gyms scattered around will be /// a long journey. // Before you leave, make sure / that you talk to your mom. // (message 39, the other gender variant, has identical text; see NBT-DLG-061-03q)
- **OLD raw message data:** `...{STRVAR_1, 3, 0, 0}. Challenging the\nGyms scattered around will be\fa long journey.\rBefore you leave, make sure\nthat you talk to your mom.\r` (msg 38)
- **OLD trigger:** Shown by NBT-EVT-061-03 after 03k.
- **OLD conditions and branch priority:** Same scene. Player gender: `GenderMessage 38 39` shows its first message (38) to a male player and its second (39) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `GenderMessage 38 39`, `CloseMessage`, Elm `Action#16`, then the flag/var block of Script 3.
- **OLD state changes:** None in the message (the 0x4108 = 4 step follows).
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 38 (the female-player variant is msg 39, NBT-DLG-061-03q)
- **Other affected callers or records:** Inline Script 3 and Function 12 copies.
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** None.

#### NBT-DLG-061-03q — Elm: "talk to your mom before you leave", second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-03q
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-03
- **Related record IDs:** NBT-DLG-061-03l (other gender variant, msg 38); NBT-DLG-061-03k
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Script#3 and Function#12 (`GenderMessage 38 39`, second message); text archive 543 msg 39
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** ...{STRVAR_1, 3, 0, 0}. Challenging the / Gyms scattered around will be /// a long journey. // Before you leave, make sure / that you talk to your mom. // (message 38, the other gender variant, has identical text; see NBT-DLG-061-03l)
- **OLD raw message data:** `...{STRVAR_1, 3, 0, 0}. Challenging the\nGyms scattered around will be\fa long journey.\rBefore you leave, make sure\nthat you talk to your mom.\r` (msg 39)
- **OLD trigger:** Shown by NBT-EVT-061-03 after 03k.
- **OLD conditions and branch priority:** Same scene. Player gender: `GenderMessage 38 39` shows its second message (39) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `GenderMessage 38 39`, `CloseMessage`, Elm `Action#16`, then the flag/var block of Script 3.
- **OLD state changes:** None in the message (the 0x4108 = 4 step follows).
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 39 (the male-player variant is msg 38, NBT-DLG-061-03l)
- **Other affected callers or records:** Inline Script 3 and Function 12 copies.
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** None; female player.

#### NBT-EVT-061-04 — Aide intercepts the player at the door row and hands over the items (trigger 0, var 0x4108 = 1)
##### Record identity
- **Record ID:** NBT-EVT-061-04
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-061-04a, 04b, 04c (04c is the second gender variant of 04a); NBT-EVT-061-13 (sets 0x4108 = 1); NBT-EVT-061-02; GLB-RTN-2008, GLB-RTN-2009, GLB-RTN-2080, GLB-RTN-2081
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Aide (owID 2); event file 58 trigger idx 0: 4 x 1 tiles from (3,11), z 0, watches var 16648 (0x4108) = 1
- **Source references:** script file 843 Script#4; Functions 14, 15, 43, 44, 45, 46, 47, 48, 49, 64, 65, 72; Actions 17, 35, 36, 51, 52, 57, 58, 62; event file 58 triggers idx 0; text archive 543 msgs 19/20, 21
- **Evidence status:** Verified. The hack-modified lines are marked below.
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-061-04a and -04b.
- **OLD raw message data:** See the dialogue records.
- **OLD trigger:** The player steps on a tile of trigger 0 (x = 3, 4, 5 or 6, y = 11) while var 0x4108 = 1 (the value written by NBT-EVT-061-13 after the starter). Script 4 starts with `MecScript`, `LockAll`.
- **OLD conditions and branch priority:** Direct: var 0x4108 = 1 (event-file trigger test). Inside: the player's x (`GetPlayerPosition` into 0x4000/0x4001) picks one of four aide walk-in patterns (3: Action#17, 4: Action#35, 5: Action#51, 6: Function 64 with Action#57). Item gating: `CheckItemSpace` for Potion x5 must pass, otherwise Function 44. Extras by flag: 2304, 2307, 2310 (hack). Object visibility of the aide: flag 582 hidden when set. Trigger 1 (y = 10, 0x4108 = 0) is a different trigger (NBT-EVT-061-12). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Trigger, prerequisites above. (2) Aide walks west from (9,12) toward the player (emote + walk, 3 to 6 steps depending on x, then faces north) -> `WaitMovement`; `TextPlayerName 0`, `GenderMessage 19 20` (04a); `SetVar 0x8004 17`, `SetVar 0x8005 5` (Potion x5), `CheckItemSpace 0x8004 0x8005 0x800C`; if 0x800C = 0 (no room) -> Function 44: `CommonScript 2009`, `CloseMessage`, `ReleaseAll`, `End` (var stays 1, so the trigger fires again on the next step); else `SetVar 0x8004 17 / 0x8005 5` again, `CommonScript 2008` (GLB-RTN-2008, gives the items with the receipt message); then: `CheckFlag 2304` set -> Function 45 [HACK, journal 30/31: `SetVar 0x8004 50` (Rare Candy), `SetVar 0x8005 1`, `CommonScript 2008`; then 12 (Premier Ball), 77 (Max Repel), 78 (Escape Rope) each qty 1 with `CommonScript 2008`; no space check]; `CheckFlag 2307` set -> Function 46 [HACK, journal 32: `CommonScript 2080` (GLB-RTN-2080, hg-engine only; the build reads this as giving 25 key items and a receipt line)]; `CheckFlag 2310` set -> Function 47 [HACK, journal 34: `CommonScript 2081` (GLB-RTN-2081, hg-engine only; the build reads this as giving a Lv. 100 Porygon)]; `CloseMessage`; `SetVar 0x4108 2`; `Message 21` (04b); `CloseMessage`; aide walks back east (Actions 36, 52, 58, 62 by x); `WaitMovement`; `ReleaseAll`; `End`. (3) No choices. (4) Facing/movement as listed; no fades or battles. (5) Var 0x4108 1 -> 2; bag +5 Potion (+extras by flags 2304/2307/2310). (6) Fires once (0x4108 leaves 1); if the bag is full the trigger re-arms. (7) Dependencies: GLB-RTN-2008 (called for the Potions and four more times in Function 45), GLB-RTN-2009, GLB-RTN-2080, GLB-RTN-2081. Functions 15 (via Script 4: x = 3, 4, 5) and 64 (x = 6) are two copies of the same handout body.
- **OLD state changes:** Var 0x4108 = 2; items: Potion x5; with flag 2304 also Rare Candy, Premier Ball, Max Repel, Escape Rope x1 each; with flag 2307 the 2080 batch; with flag 2310 the 2081 gift.
- **OLD repeat/completion behavior:** Once, unless the bag-space test fails (no change, repeats on the next step onto the row).
- **OLD dependencies and shared-resource effects:** Hack: journals 30 (flag 2304 call, both copies), 31 (Function 45 extended), 32 (2307 call and Function 46), 34 (2310 call and Function 47; old Functions 47-74 renumbered 48-75). Flags 2304/2307/2310 are set by the hg-engine Game Mode Select (not by scripts). `CommonScript 2080/2081` do not exist in the 2000-2071 table of the working ROM.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 843 Script#4 and Functions 14, 15, 43, 44, 45, 46, 47, 48, 49, 64, 65, 72; event file 58 trigger idx 0
- **Other affected callers or records:** Function 15 is entered by `Jump` from Script 4 (x = 3), Function 14 (x = 4) and Function 43 (x = 5); Function 64 (x = 6) holds its own copy of the handout body and also jumps to Function 15 in the unreachable case x != 6. Function 44 (bag-full tail) is used by both copies only; Function 49 (`WaitMovement / ReleaseAll / End`) is the shared exit of both copies.
- **Unresolved questions:** Exact item list and receipt of `CommonScript 2080/2081` are hg-engine behaviour (read from `docs/gms-debug-rules.md`, not re-checked in the assembly).
- **Validation needed:** Each x position (3, 4, 5, 6) once; full-bag case; the three rule flags set in a test save.

#### NBT-DLG-061-04a — Aide: "I want you to have these to help you with your task."
##### Record identity
- **Record ID:** NBT-DLG-061-04a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-04
- **Related record IDs:** NBT-DLG-061-04b; NBT-DLG-061-04c (other gender variant, msg 20)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Aide (the speaker has no label in the text; Inferred from the event)
- **Source references:** script file 843 Function#15 and Function#64 (`GenderMessage 19 20`, first message); text archive 543 msg 19
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** {STRVAR_1, 3, 0, 0}, I want you to have these / to help you with your task. // (message 20, the other gender variant, has identical text; see NBT-DLG-061-04c)
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0}, I want you to have these\nto help you with your task.\r` (msg 19)
- **OLD trigger:** Shown by NBT-EVT-061-04 after the aide's walk-in.
- **OLD conditions and branch priority:** As NBT-EVT-061-04. Player gender: `GenderMessage 19 20` shows its first message (19) to a male player and its second (20) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 19 20`, then the item steps.
- **OLD state changes:** None in the message.
- **OLD repeat/completion behavior:** Repeats if the bag is full.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 19 (the female-player variant is msg 20, NBT-DLG-061-04c)
- **Other affected callers or records:** Function 15 and Function 64 (the two handout copies).
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** Both copies.

#### NBT-DLG-061-04c — Aide: "I want you to have these to help you with your task.", second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-04c
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-04
- **Related record IDs:** NBT-DLG-061-04a (other gender variant, msg 19); NBT-DLG-061-04b
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Aide (the speaker has no label in the text; Inferred from the event)
- **Source references:** script file 843 Function#15 and Function#64 (`GenderMessage 19 20`, second message); text archive 543 msg 20
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** {STRVAR_1, 3, 0, 0}, I want you to have these / to help you with your task. // (message 19, the other gender variant, has identical text; see NBT-DLG-061-04a)
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0}, I want you to have these\nto help you with your task.\r` (msg 20)
- **OLD trigger:** Shown by NBT-EVT-061-04 after the aide's walk-in.
- **OLD conditions and branch priority:** As NBT-EVT-061-04. Player gender: `GenderMessage 19 20` shows its second message (20) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 19 20`, then the item steps.
- **OLD state changes:** None in the message.
- **OLD repeat/completion behavior:** Repeats if the bag is full.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 20 (the male-player variant is msg 19, NBT-DLG-061-04a)
- **Other affected callers or records:** Function 15 and Function 64 (the two handout copies).
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** Both copies; female player.

#### NBT-DLG-061-04b — Aide: "Pokémon are weak in the beginning."
##### Record identity
- **Record ID:** NBT-DLG-061-04b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-04
- **Related record IDs:** NBT-DLG-061-02b
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Aide
- **Source references:** script file 843 Function#15 and Function#64 (`Message 21`); text archive 543 msg 21
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Pokémon are weak in the beginning. // Don’t hesitate to use a Potion if you / think yours is in danger. //
- **OLD raw message data:** `Pokémon are weak in the beginning.\rDon’t hesitate to use a Potion if you\nthink yours is in danger.\r`
- **OLD trigger:** Shown by NBT-EVT-061-04 after the items and `SetVar 0x4108 2`.
- **OLD conditions and branch priority:** Handout succeeded (bag had room).
- **OLD event sequence:** (2) `Message 21`, `CloseMessage`, aide walks back.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 21
- **Other affected callers or records:** Function 15 and Function 64.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-061-05 — Script 5 (empty)
##### Record identity
- **Record ID:** NBT-EVT-061-05
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** None
- **Source references:** script file 843 Script#5 (just `End`)
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** None found. No event-file entry (spawnables use 6, 7, 8, 9, 10, 13, 14; overworlds 1, 0, 2 with owID 1/3 using 0; triggers 4, 12) and no level-script entry (11, 16, 3, 15) names script 5.
- **OLD conditions and branch priority:** None. Reachability: Apparently unused.
- **OLD event sequence:** (2) `End`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Not applicable.
- **OLD dependencies and shared-resource effects:** None. Overworlds 1 and 3 carry scriptNumber 0, not 5.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 843 Script#5
- **Other affected callers or records:** None found.
- **Unresolved questions:** Whether a placeholder number is needed for a new NPC.
- **Validation needed:** None.

#### NBT-EVT-061-06 — Bookshelf sign: Travel Tip 1 (spawnables 0 and 1)
##### Record identity
- **Record ID:** NBT-EVT-061-06
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-061-06a
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Spawnables idx 0 at (1,10) and idx 1 at (2,10), type Misc, activated from the front; script 6 (the object kind, a bookshelf, is Inferred from the "opened a book" text)
- **Source references:** script file 843 Script#6; event file 58 spawnables idx 0, 1; text archive 543 msg 93
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-061-06a.
- **OLD raw message data:** See NBT-DLG-061-06a.
- **OLD trigger:** The player presses A facing tile (1,10) or (2,10).
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (2) `TextPlayerName 0`, `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `Message 93`, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 843 Script#6; event file 58 spawnables idx 0 and 1
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Both tiles.

#### NBT-DLG-061-06a — Travel Tip 1
##### Record identity
- **Record ID:** NBT-DLG-061-06a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-06
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Book (narration)
- **Source references:** script file 843 Script#6 (`Message 93`); text archive 543 msg 93
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** {STRVAR_1, 3, 0, 0} opened a book. // Travel Tip 1: Touch the A Button / icon on the Touch Screen. // You can check things, talk to people, / and so on.
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0} opened a book.\rTravel Tip 1: Touch the A Button\nicon on the Touch Screen.\rYou can check things, talk to people,\nand so on.`
- **OLD trigger:** Shown by NBT-EVT-061-06.
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (2) `Message 93`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 93
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-061-07 — Bookshelf sign: Travel Tip 2 (spawnables 2 and 3)
##### Record identity
- **Record ID:** NBT-EVT-061-07
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-061-07a
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Spawnables idx 2 at (7,10) and idx 3 at (8,10), type Misc, front interaction; script 7
- **Source references:** script file 843 Script#7; event file 58 spawnables idx 2, 3; text archive 543 msg 94
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-061-07a.
- **OLD raw message data:** See NBT-DLG-061-07a.
- **OLD trigger:** A-press facing (7,10) or (8,10).
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (2) `TextPlayerName 0`, fanfare, `LockAll`, `Message 94`, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 843 Script#7; event file 58 spawnables idx 2 and 3
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Both tiles.

#### NBT-DLG-061-07a — Travel Tip 2
##### Record identity
- **Record ID:** NBT-DLG-061-07a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-07
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Book (narration)
- **Source references:** script file 843 Script#7 (`Message 94`); text archive 543 msg 94
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** {STRVAR_1, 3, 0, 0} opened a book. // Travel Tip 2: The Trainer Card is the / identification card for you as a Trainer /// to travel with your Pokémon. // Record your adventure with SAVE!
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0} opened a book.\rTravel Tip 2: The Trainer Card is the\nidentification card for you as a Trainer\fto travel with your Pokémon.\rRecord your adventure with SAVE!`
- **OLD trigger:** Shown by NBT-EVT-061-07.
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (2) `Message 94`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 94
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-061-08 — Bookshelf sign: Travel Tip 3 (spawnables 4 and 5)
##### Record identity
- **Record ID:** NBT-EVT-061-08
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-061-08a
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Spawnables idx 4 at (9,10) and idx 5 at (10,10), type Misc, front interaction; script 8
- **Source references:** script file 843 Script#8; event file 58 spawnables idx 4, 5; text archive 543 msg 95
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-061-08a.
- **OLD raw message data:** See NBT-DLG-061-08a.
- **OLD trigger:** A-press facing (9,10) or (10,10).
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (2) `TextPlayerName 0`, fanfare, `LockAll`, `Message 95`, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 843 Script#8; event file 58 spawnables idx 4 and 5
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Both tiles.

#### NBT-DLG-061-08a — Travel Tip 3
##### Record identity
- **Record ID:** NBT-DLG-061-08a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-08
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Book (narration)
- **Source references:** script file 843 Script#8 (`Message 95`); text archive 543 msg 95
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** {STRVAR_1, 3, 0, 0} opened a book. // Travel Tip 3: Items in your Bag are / sorted by their categories.
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0} opened a book.\rTravel Tip 3: Items in your Bag are\nsorted by their categories.`
- **OLD trigger:** Shown by NBT-EVT-061-08.
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (2) `Message 95`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 95
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-061-09 — Bookshelf sign: Travel Tip 4 (spawnables 6 and 7)
##### Record identity
- **Record ID:** NBT-EVT-061-09
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-061-09a
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Spawnables idx 6 at (11,10) and idx 7 at (12,10), type Misc, front interaction; script 9
- **Source references:** script file 843 Script#9; event file 58 spawnables idx 6, 7; text archive 543 msg 96
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-061-09a.
- **OLD raw message data:** See NBT-DLG-061-09a.
- **OLD trigger:** A-press facing (11,10) or (12,10).
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (2) `TextPlayerName 0`, fanfare, `LockAll`, `Message 96`, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 843 Script#9; event file 58 spawnables idx 6 and 7
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Both tiles.

#### NBT-DLG-061-09a — Travel Tip 4
##### Record identity
- **Record ID:** NBT-DLG-061-09a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-09
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Book (narration)
- **Source references:** script file 843 Script#9 (`Message 96`); text archive 543 msg 96
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** {STRVAR_1, 3, 0, 0} opened a book. // Travel Tip 4: The Pokégear is a / useful tool. // You can make a phone call, / listen to the radio, check the map, /// and so on.
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0} opened a book.\rTravel Tip 4: The Pokégear is a\nuseful tool.\rYou can make a phone call,\nlisten to the radio, check the map,\fand so on.`
- **OLD trigger:** Shown by NBT-EVT-061-09.
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (2) `Message 96`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 96
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-061-10 — Memo (spawnable 8)
##### Record identity
- **Record ID:** NBT-EVT-061-10
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-061-10a
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Spawnable idx 8 at (6,3), type Misc, "Activated from any dir" (dir 4); script 10
- **Source references:** script file 843 Script#10; event file 58 spawnables idx 8; text archive 543 msg 97
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-061-10a.
- **OLD raw message data:** See NBT-DLG-061-10a.
- **OLD trigger:** A-press on tile (6,3) from any direction.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (2) `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `Message 97`, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End` (no `TextPlayerName`).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 843 Script#10; event file 58 spawnables idx 8
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-061-10a — Evolution memo
##### Record identity
- **Record ID:** NBT-DLG-061-10a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-10
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Memo (narration)
- **Source references:** script file 843 Script#10 (`Message 97`); text archive 543 msg 97
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** You found a memo... / If a Pokémon is trying to evolve, /// you can stop it. // Press the B Button during evolution.
- **OLD raw message data:** `You found a memo...\nIf a Pokémon is trying to evolve,\fyou can stop it.\rPress the B Button during evolution.`
- **OLD trigger:** Shown by NBT-EVT-061-10.
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (2) `Message 97`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 97
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-061-11 — Screen reset: place Elm and refresh the starter machine
##### Record identity
- **Record ID:** NBT-EVT-061-11
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-061-LS1
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** No speaker; level script 616 entry 1 (screenReset -> script 11)
- **Source references:** script file 843 Script#11; Functions 16, 17, 18, 50; level script 616 entry 1
- **Evidence status:** Verified (control flow); the purpose of `GetCounterpartSprite` is Unresolved
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Level script 616 `screenReset` entry, script id 11: runs each time the map's screen is (re)built.
- **OLD conditions and branch priority:** In order: `CheckFlag 352` set -> Function 16 (`SetOWPosition Overworld.0 4 0 5 Right`, then Function 18). Var 0x4108 != 0 -> Function 17: 0x4108 != 3 -> Function 50: 0x4108 != 8 -> Function 18 only; = 8: `SetOWPosition Overworld.0 4 0 5 Down` (Elm) and `SetOWPosition Overworld.3 7 0 12 Right` (the friend), then `UpdateStarterSelectionMachine`; 0x4108 = 3 -> `SetOWPosition Overworld.0 4 0 5 Down`, Function 18. Otherwise (flag 352 clear, 0x4108 = 0): `SetOWPosition Overworld.0 4 0 5 Down`, Function 18. Function 18 = `UpdateStarterSelectionMachine`, `End`. The first command is always `GetCounterpartSprite 0x4020`. The `SetOWPosition` arguments are printed as 4, 0, 5 (x, a middle value 0, y: Inferred) plus a facing. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Map screen set up. (2) No dialogue. (4) Positions Elm at (4,5) facing east while the lab intro lock (flag 352) is on, facing south at 0x4108 = 0, 3 or 8; at 0x4108 = 8 also places the friend at (7,12) facing east; the machine graphic is refreshed in every path. (5) No flag/var change. (7) None.
- **OLD state changes:** Writes var 0x4020 (via `GetCounterpartSprite`, Inferred as the friend's sprite id), moves objects.
- **OLD repeat/completion behavior:** Every map screen build.
- **OLD dependencies and shared-resource effects:** `UpdateStarterSelectionMachine` reflects flag 106 / the starter state (Inferred). Elm's event-file position is (6,5); this script moves him to (4,5).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 843 Script#11, Functions 16, 17, 18, 50; level script 616 entry 1
- **Other affected callers or records:** Function 18 is the common tail of Functions 16, 17, 50 and Script 11 only.
- **Unresolved questions:** `GetCounterpartSprite` semantics; whether the friend at (7,12) is the intended screenshot position when 0x4108 = 8.
- **Validation needed:** Enter the map at 0x4108 = 0, 1, 3, 8.

#### NBT-EVT-061-12 — Lab entry: Elm's intro talk and the phone e-mail (trigger 1, var 0x4108 = 0)
##### Record identity
- **Record ID:** NBT-EVT-061-12
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-061-12a to 12f (12f is the second gender variant of 12b); NBT-EVT-061-13; NBT-EVT-061-11
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm and the player; event file 58 trigger idx 1: 4 x 1 tiles from (3,10), watches var 16648 (0x4108) = 0
- **Source references:** script file 843 Script#12; Functions 19, 20, 21, 51, 66; Actions 1, 18, 37-41, 53, 59 (and 38, 39); event file 58 triggers idx 1; text archive 543 msgs 0/1, 2, 3, 4, 6
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-061-12a to -12e.
- **OLD raw message data:** See the dialogue records.
- **OLD trigger:** The player steps onto row y = 10, x = 3 to 6, while var 0x4108 = 0. Script 12 begins `MecScript`, `LockAll`.
- **OLD conditions and branch priority:** `CheckFlag 352` (FLAG_ELMS_LAB_PREVENT_PLAYER_ESCAPE) set -> Function 19 (Elm stops a player who tries to leave before taking the starter). Clear -> the intro: the player's x (`GetPlayerPosition` into 0x4000) selects the walk-up (3: Action#18, 4: Function 20 Action#39, 5: Function 51 Action#53, 6: Function 66 Action#59). Direct checks: var 0x4108 = 0, flag 352. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (2) Intro (flag 352 clear): the player is walked north (3 to 4 steps) -> `WaitMovement`; `TextPlayerName 0`, `GenderMessage 0 1` (12b), `CloseMessage`; Elm `Action#1` (face east), `WaitTime 15`, `PlayFanfare SEQ_SE_GS_PHONE0`; Elm `Action#40` (exclamation, step north, delay); `Message 2` (12c), `Message 3` (12d) with no `CloseMessage` between them, `CloseMessage`; Elm `Action#41` (step south); `Message 4` (12e); `CloseMessage`; Elm `Action#1`; `SetFlag 352`; `ReleaseAll`. Leave-attempt (flag 352 set): Elm `Action#37` (face south, exclamation, wait), `Message 6` (12a), `CloseMessage`, Elm `Action#1` and player `Action#38` (one step north) together, `ReleaseAll`. (5) Flag 352 set by the intro. (6) Intro plays once (flag 352); the leave-attempt line repeats until the starter is taken (Script 13 clears 352 and sets 0x4108 = 1). (7) No global calls.
- **OLD state changes:** Flag 352 set (by the intro).
- **OLD repeat/completion behavior:** Intro once; blocker repeats.
- **OLD dependencies and shared-resource effects:** Flag 352 is also read by Script 11 (screen reset, places Elm facing east). Function 21 and Function 66's tail are two copies of the intro body.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 843 Script#12, Functions 19, 20, 21, 51, 66; event file 58 trigger idx 1
- **Other affected callers or records:** Function 21 is also reached by jump from Script 12 (x = 3), Function 20 (x = 4), Function 51 (x = 5); Function 66 has its own copy for x = 6.
- **Unresolved questions:** None.
- **Validation needed:** Each x; leaving before taking the starter.

#### NBT-DLG-061-12a — Elm: "Where are you going? The Poké Balls are in that device."
##### Record identity
- **Record ID:** NBT-DLG-061-12a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-12
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#19 (`Message 6`); text archive 543 msg 6
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Where are you going? / The Poké Balls are in that device. //
- **OLD raw message data:** `Professor Elm: Where are you going?\nThe Poké Balls are in that device.\r`
- **OLD trigger:** Shown by NBT-EVT-061-12 Function 19.
- **OLD conditions and branch priority:** Var 0x4108 = 0 AND trigger 1 stepped on AND flag 352 set.
- **OLD event sequence:** (2) `Message 6`, `CloseMessage`, then Elm/player step.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Flag 352.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 6
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-061-12b — Elm's long intro ("I've been waiting for you!")
##### Record identity
- **Record ID:** NBT-DLG-061-12b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-12
- **Related record IDs:** NBT-DLG-061-12c; NBT-DLG-061-12f (other gender variant, msg 1)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#21 and Function#66 (`GenderMessage 0 1`, first message); text archive 543 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Hi, {STRVAR_1, 3, 0, 0}! / I’ve been waiting for you! // Do you know anything about / my research? // As you know, Pokémon are carried / in Poké Balls these days. // But before the Poké Ball was invented, / people used to walk with Pokémon. /// Just like your friend Lyra does! // Poké Balls are great because you can / carry many Pokémon. // But walking with Pokémon must have / some advantages. // It could have something to do with how / Pokémon grow or evolve... // So I’m going to give you a Pokémon! // Can you walk beside this Pokémon, / outside of its Poké Ball, to see if this /// brings any special feelings or bonds /// between Pokémon and people? // The device over there has some Pokémon / you could choose from... //
- **OLD raw message data:** `Professor Elm: Hi, {STRVAR_1, 3, 0, 0}!\nI’ve been waiting for you!\rDo you know anything about\nmy research?\rAs you know, Pokémon are carried\nin Poké Balls these days.\rBut before the Poké Ball was invented,\npeople used to walk with Pokémon.\fJust like your friend Lyra does!\rPoké Balls are great because you can\ncarry many Pokémon.\rBut walking with Pokémon must have\nsome advantages.\rIt could have something to do with how\nPokémon grow or evolve...\rSo I’m going to give you a Pokémon!\rCan you walk beside this Pokémon,\noutside of its Poké Ball, to see if this\fbrings any special feelings or bonds\fbetween Pokémon and people?\rThe device over there has some Pokémon\nyou could choose from...\r` (msg 0)
- **OLD trigger:** Shown by NBT-EVT-061-12 Function 21 / 66 after the walk-up (name buffer 0 set just before).
- **OLD conditions and branch priority:** Flag 352 clear AND var 0x4108 = 0 AND trigger 1. Player gender: `GenderMessage 0 1` shows its first message (0) to a male player and its second (1) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). The text is consistent with it: msg 0 names the friend as Lyra, msg 1 as Ethan, and 03b/03m (msgs 24/25) pair Lyra with a boy player.
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 0 1`, `CloseMessage`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 0 (the female-player variant is msg 1, NBT-DLG-061-12f)
- **Other affected callers or records:** Function 21 and Function 66 (copies).
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** Both genders.

#### NBT-DLG-061-12f — Elm's long intro ("I've been waiting for you!"), second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-12f
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-12
- **Related record IDs:** NBT-DLG-061-12b (other gender variant, msg 0); NBT-DLG-061-12c
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#21 and Function#66 (`GenderMessage 0 1`, second message); text archive 543 msg 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Hi, {STRVAR_1, 3, 0, 0}! / I’ve been waiting for you! // Do you know anything about / my research? // As you know, Pokémon are carried / in Poké Balls these days. // But before the Poké Ball was invented, / people used to walk with Pokémon. /// Just like your friend Ethan does! // Poké Balls are great because you can / carry many Pokémon. // But walking with Pokémon must have / some advantages. // It could have something to do with how / Pokémon grow or evolve... // So I’m going to give you a Pokémon! // Can you walk beside this Pokémon, / outside of its Poké Ball, to see if this /// brings any special feelings or bonds /// between Pokémon and people? // The device over there has some Pokémon / you could choose from... //
- **OLD raw message data:** `Professor Elm: Hi, {STRVAR_1, 3, 0, 0}!\nI’ve been waiting for you!\rDo you know anything about\nmy research?\rAs you know, Pokémon are carried\nin Poké Balls these days.\rBut before the Poké Ball was invented,\npeople used to walk with Pokémon.\fJust like your friend Ethan does!\rPoké Balls are great because you can\ncarry many Pokémon.\rBut walking with Pokémon must have\nsome advantages.\rIt could have something to do with how\nPokémon grow or evolve...\rSo I’m going to give you a Pokémon!\rCan you walk beside this Pokémon,\noutside of its Poké Ball, to see if this\fbrings any special feelings or bonds\fbetween Pokémon and people?\rThe device over there has some Pokémon\nyou could choose from...\r` (msg 1)
- **OLD trigger:** Shown by NBT-EVT-061-12 Function 21 / 66 after the walk-up (name buffer 0 set just before).
- **OLD conditions and branch priority:** Flag 352 clear AND var 0x4108 = 0 AND trigger 1. Player gender: `GenderMessage 0 1` shows its second message (1) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested). The text is consistent with it: msg 1 names the friend as Ethan (a boy friend for a girl player).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 0 1`, `CloseMessage`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 1 (the male-player variant is msg 0, NBT-DLG-061-12b)
- **Other affected callers or records:** Function 21 and Function 66 (copies).
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** Both genders; female player.

#### NBT-DLG-061-12c — Elm: "Oh, hey! I got an email!"
##### Record identity
- **Record ID:** NBT-DLG-061-12c
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-12
- **Related record IDs:** NBT-DLG-061-12d
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#21 and Function#66 (`Message 2`); text archive 543 msg 2
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Oh, hey! I got an email! //
- **OLD raw message data:** `Professor Elm: Oh, hey! I got an email!\r`
- **OLD trigger:** Shown by NBT-EVT-061-12 after the phone ring and Elm's emote.
- **OLD conditions and branch priority:** As 12b.
- **OLD event sequence:** (2) `Message 2` directly followed by `Message 3`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 2
- **Other affected callers or records:** Function 21 and Function 66.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-061-12d — Elm: reading the email
##### Record identity
- **Record ID:** NBT-DLG-061-12d
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-12
- **Related record IDs:** NBT-DLG-061-12c
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#21 and Function#66 (`Message 3`); text archive 543 msg 3
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: ... / Hm... Uh-huh... OK... //
- **OLD raw message data:** `Professor Elm: ...\nHm... Uh-huh... OK...\r`
- **OLD trigger:** Shown right after 12c without a `CloseMessage`.
- **OLD conditions and branch priority:** As 12b.
- **OLD event sequence:** (2) `Message 3`, `CloseMessage`, Elm `Action#41`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 3
- **Other affected callers or records:** Function 21 and Function 66.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-061-12e — Elm asks the player to go to Mr. Pokémon's
##### Record identity
- **Record ID:** NBT-DLG-061-12e
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-12
- **Related record IDs:** NBT-DLG-061-12d
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Function#21 and Function#66 (`Message 4`); text archive 543 msg 4
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Hey, listen. / I have this acquaintance that people /// call Mr. Pokémon. // He keeps finding weird things and / raving about his discoveries. // Anyway, I just got an email from him / saying that this time it’s real. // It’s probably another Pokémon Egg, / but we’re still so busy with our /// Pokémon research... // Wait! / I know! // You can go in our place, right? / Can we count on you? // You can choose one of the Pokémon / over there. //
- **OLD raw message data:** `Professor Elm: Hey, listen.\nI have this acquaintance that people\fcall Mr. Pokémon.\rHe keeps finding weird things and\nraving about his discoveries.\rAnyway, I just got an email from him\nsaying that this time it’s real.\rIt’s probably another Pokémon Egg,\nbut we’re still so busy with our\fPokémon research...\rWait!\nI know!\rYou can go in our place, right?\nCan we count on you?\rYou can choose one of the Pokémon\nover there.\r`
- **OLD trigger:** Shown by NBT-EVT-061-12 after Elm steps south.
- **OLD conditions and branch priority:** As 12b.
- **OLD event sequence:** (2) `Message 4`, `CloseMessage`, Elm `Action#1`, `SetFlag 352`, `ReleaseAll`.
- **OLD state changes:** Flag 352 set right after.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 4
- **Other affected callers or records:** Function 21 and Function 66.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-061-13 — Starter selection machine (spawnable 9)
##### Record identity
- **Record ID:** NBT-EVT-061-13
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-061-13a to 13h; NBT-DLG-061-01j; NBT-EVT-061-11; NBT-EVT-061-12; NBT-EVT-061-04
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Spawnable idx 9 at (8,4), type Misc, front interaction; script 13
- **Source references:** script file 843 Script#13; Functions 22, 23, 52, 53; Actions 19-22; event file 58 spawnables idx 9; text archive 543 msgs 7, 8, 9, 10, 11, 12/13, 15, 16, 17
- **Evidence status:** Verified; the starter list is from `get_rom_table starters` (CHIKORITA 152, CYNDAQUIL 155, TOTODILE 158, held item none)
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-061-13a to -13h and NBT-DLG-061-01j.
- **OLD raw message data:** See the dialogue records.
- **OLD trigger:** The player presses A facing the machine at (8,4). `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** `CheckFlag 106` (FLAG_GOT_STARTER) set -> Function 22: `CheckFlag 115` (GOT_TM51_FROM_FALKNER) set -> Function 52 (13h); else `CheckFlag 153` (MET_PASSERBY_BOY) set -> Function 53 (13g); else `Message 15` (13f). Flag 106 clear -> the selection below. The 0x4108 value is not tested. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) A-press, flag 106 clear. (2) `StarterSelectionScreen` (the Pokémon choice UI; species from the arm9 starter table: Chikorita, Cyndaquil, Totodile), `SetFlag 106`, **`SetVar 0x416F 13`** [HACK: level-cap variable, not journal-attributed; see section header], `SetFollowingPokePosition 3 Left`, `LockFollowingPoke 0`, `SendOutFollowingPoke`, `WaitTime 10 0x800C`, `LockFollowingPoke 1`, `GetPartyPokemonID 0 0x4001`, `SetStarter 0x4001` (records the starter), `TextPlayerName 0`, `TextPartyPokemon 1 0`, `Message 7` (13a), `PlaySound SEQ_ME_POKEGET`, `WaitSound`. (3) Nickname prompt: `OpenTouchScreen`, `TextPartyPokemon 1 0`, `Message 8` (13b) with Yes/No (`YesNoTouchScreen 0x800C`), `CloseMessage`; Yes (0x800C = 0) -> `CallIf EQUAL Function#23` (nickname routine: `SetVar 0x4000 0`, fade out, `ChoosePokemonNickname 0 0x4000`, fade in, `OpenTouchScreen`, `TextPokeNickname 1 0`, `Message 9` (13c) Yes/No; No (1) repeats the routine; Yes returns); `CloseTouchScreen`. (4) Follower and Elm step (`Action#19`, `#20` with the player), `Message 10` (13d), `CloseMessage`, Elm `Action#21`, `Message 11` (13e), `CloseMessage`, Elm `Action#22`, `TextPlayerName 0`, `GenderMessage 12 13` (01j), `WaitButton`, `CloseMessage`. (5) `SetVar 0x4108 1`, `SetVar 0x4072 1`, `ClearFlag 352`, `ReleaseAll`, `End`. (6) Starter once (flag 106); afterwards only the Function 22 lines. (7) Dependencies: `StarterSelectionScreen` and `SetStarter` use the arm9 starter table and engine; the rival and tag partner parties are not edited by the starters table (per the `get_rom_table starters` note).
- **OLD state changes:** Flag 106 set, flag 352 cleared; vars 0x416F = 13 (hack), 0x4108 = 1, 0x4072 = 1; party gains the starter; Pokédex/starter record via `SetStarter`; optional nickname.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Hack: journal 17 had added `GiveItem ITEM_RARE_CANDY 1 0x800C` at index 8 of this script; journal 30 removed it again (absent in the live script, verified on lines 238-302). 0x416F = 13 is the hack's level-cap variable value (`docs/game-mode-select.md`); other maps overwrite it with larger values (table above). Flag 106 is read by files 0842, 0845, 0849; var 0x4108 = 1 arms NBT-EVT-061-04.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 843 Script#13, Functions 22, 23, 52, 53; Actions 19-22; event file 58 spawnables idx 9
- **Other affected callers or records:** Function 22/52/53 only from Script 13; Function 23 only from Script 13. The starter table (arm9) and `SetStarter` are shared with the rest of the game.
- **Unresolved questions:** Where in the game each starter-dependent text (rival fights, Cherrygrove) reads the starter; `SetFollowingPokePosition 3 Left` direction code.
- **Validation needed:** Each of the three choices; nickname Yes/No arms; the post-starter flag-106 lines.

#### NBT-DLG-061-13a — "<name> received <starter> from Professor Elm!"
##### Record identity
- **Record ID:** NBT-DLG-061-13a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-13
- **Related record IDs:** NBT-DLG-061-13b
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Narration
- **Source references:** script file 843 Script#13 (`Message 7`); text archive 543 msg 7
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** {STRVAR_1, 3, 0, 0} received {STRVAR_1, 0, 1, 0} / from Professor Elm! (buffer 0 = player name from `TextPlayerName 0`; buffer 1 = species name of party slot 0 from `TextPartyPokemon 1 0`)
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0} received {STRVAR_1, 0, 1, 0}\nfrom Professor Elm!`
- **OLD trigger:** Shown by NBT-EVT-061-13 after the selection screen.
- **OLD conditions and branch priority:** Flag 106 clear when A is pressed.
- **OLD event sequence:** (2) `Message 7`, `PlaySound SEQ_ME_POKEGET`, `WaitSound`.
- **OLD state changes:** None in the message.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Name buffers.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 7
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-061-13b — Nickname prompt (Yes/No)
##### Record identity
- **Record ID:** NBT-DLG-061-13b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-13
- **Related record IDs:** NBT-DLG-061-13c
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Narration
- **Source references:** script file 843 Script#13 (`Message 8`, `YesNoTouchScreen`); text archive 543 msg 8
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Give a nickname to the {STRVAR_1, 0, 1, 0} / you received? {YESNO, 0, 0} (Yes = name the Pokémon; No = skip)
- **OLD raw message data:** `Give a nickname to the {STRVAR_1, 0, 1, 0}\nyou received? {YESNO, 0, 0}`
- **OLD trigger:** Shown by NBT-EVT-061-13 after 13a.
- **OLD conditions and branch priority:** Choice: Yes (0x800C = 0) -> nickname routine Function 23; No (1) -> continue.
- **OLD event sequence:** (2) `OpenTouchScreen`, `TextPartyPokemon 1 0`, `Message 8`, `YesNoTouchScreen 0x800C`, `CloseMessage`, `CallIf EQUAL Function#23` when the answer is 0, `CloseTouchScreen`.
- **OLD state changes:** Pokémon nickname (Yes arm).
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Touch-screen Yes/No.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 8
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Both answers.

#### NBT-DLG-061-13c — Nickname confirmation (Yes/No)
##### Record identity
- **Record ID:** NBT-DLG-061-13c
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-13
- **Related record IDs:** NBT-DLG-061-13b
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Narration
- **Source references:** script file 843 Function#23 (`TextPokeNickname 1 0`, `Message 9`); text archive 543 msg 9
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Is {STRVAR_1, 1, 1, 0} the nickname / you want to give? {YESNO, 0, 0} (buffer 1 = the nickname just typed; Yes keeps it, No reopens the name screen)
- **OLD raw message data:** `Is {STRVAR_1, 1, 1, 0} the nickname\nyou want to give? {YESNO, 0, 0}`
- **OLD trigger:** Shown by NBT-EVT-061-13 Function 23 after the name-entry screen.
- **OLD conditions and branch priority:** Answer 1 (No) loops back to Function 23; 0 returns.
- **OLD event sequence:** (2) `OpenTouchScreen`, `TextPokeNickname 1 0`, `Message 9`, `YesNoTouchScreen 0x800C`, `CloseMessage`, test.
- **OLD state changes:** Nickname stored by the name screen.
- **OLD repeat/completion behavior:** Loops until Yes.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 9
- **Other affected callers or records:** Function 23 only.
- **Unresolved questions:** None.
- **Validation needed:** No arm.

#### NBT-DLG-061-13d — Elm: "How do you like walking with your Pokémon?"
##### Record identity
- **Record ID:** NBT-DLG-061-13d
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-13
- **Related record IDs:** NBT-DLG-061-13e
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Script#13 (`Message 10`); text archive 543 msg 10
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: How do you like walking / with your Pokémon? It’s not bad, is it? // You can take it all the way to / Mr. Pokémon’s house. // If your Pokémon gets hurt... //
- **OLD raw message data:** `Professor Elm: How do you like walking\nwith your Pokémon? It’s not bad, is it?\rYou can take it all the way to\nMr. Pokémon’s house.\rIf your Pokémon gets hurt...\r`
- **OLD trigger:** Shown by NBT-EVT-061-13 after the nickname step and the follower walk.
- **OLD conditions and branch priority:** Same run.
- **OLD event sequence:** (2) `Message 10`, `CloseMessage`, Elm `Action#21`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 10
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-061-13e — Elm: "You should heal it with this machine."
##### Record identity
- **Record ID:** NBT-DLG-061-13e
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-13
- **Related record IDs:** NBT-DLG-061-13d, NBT-DLG-061-14a
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm (no label in the text)
- **Source references:** script file 843 Script#13 (`Message 11`); text archive 543 msg 11
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** You should heal it with this machine. // It’s so easy to use. / Just check the PC on my desk! //
- **OLD raw message data:** `You should heal it with this machine.\rIt’s so easy to use.\nJust check the PC on my desk!\r`
- **OLD trigger:** Shown by NBT-EVT-061-13 after 13d.
- **OLD conditions and branch priority:** Same run.
- **OLD event sequence:** (2) `Message 11`, `CloseMessage`, Elm `Action#22`, then 01j.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Refers to the PC of NBT-EVT-061-14.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 11
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-061-13f — Machine: "There are two valuable Pokémon left!"
##### Record identity
- **Record ID:** NBT-DLG-061-13f
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-13
- **Related record IDs:** NBT-DLG-061-13g, 13h
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Narration (machine)
- **Source references:** script file 843 Function#22 (`Message 15`); text archive 543 msg 15
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** There are two valuable Pokémon left! / ...But they belong to Professor Elm.
- **OLD raw message data:** `There are two valuable Pokémon left!\n...But they belong to Professor Elm.`
- **OLD trigger:** Shown by NBT-EVT-061-13 Function 22.
- **OLD conditions and branch priority:** Flag 106 set AND flag 115 clear AND flag 153 clear.
- **OLD event sequence:** (2) `Message 15`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Flags 115 (file 0859) and 153 (file 0850) from other maps.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 15
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-061-13g — Machine: "There is one valuable Pokémon left!"
##### Record identity
- **Record ID:** NBT-DLG-061-13g
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-13
- **Related record IDs:** NBT-DLG-061-13f, 13h
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Narration (machine)
- **Source references:** script file 843 Function#53 (`Message 16`); text archive 543 msg 16
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** There is one valuable Pokémon left! / You didn’t notice before, but it is /// behind thick glass walls now so /// nothing bad can happen to it!
- **OLD raw message data:** `There is one valuable Pokémon left!\nYou didn’t notice before, but it is\fbehind thick glass walls now so\fnothing bad can happen to it!`
- **OLD trigger:** Shown by NBT-EVT-061-13 Function 53.
- **OLD conditions and branch priority:** Flag 106 set AND flag 115 clear AND flag 153 set (115 is tested first).
- **OLD event sequence:** (2) `Message 16`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Flag 153 set by file 0850.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 16
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-061-13h — Machine: "There are no valuable Pokémon left..."
##### Record identity
- **Record ID:** NBT-DLG-061-13h
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-13
- **Related record IDs:** NBT-DLG-061-13f, 13g
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Narration (machine)
- **Source references:** script file 843 Function#52 (`Message 17`); text archive 543 msg 17
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** There are no valuable Pokémon left... // You wonder who Professor Elm gave the / last Pokémon to?
- **OLD raw message data:** `There are no valuable Pokémon left...\rYou wonder who Professor Elm gave the\nlast Pokémon to?`
- **OLD trigger:** Shown by NBT-EVT-061-13 Function 52.
- **OLD conditions and branch priority:** Flag 106 set AND flag 115 set (checked first).
- **OLD event sequence:** (2) `Message 17`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Flag 115 set by file 0859.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 17
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-061-14 — Healing PC (spawnable 10)
##### Record identity
- **Record ID:** NBT-EVT-061-14
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-061-14a, 14b
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Spawnable idx 10 at (4,3), type Misc, front interaction; script 14
- **Source references:** script file 843 Script#14; Functions 24, 25; event file 58 spawnables idx 10; text archive 543 msgs 14, 92
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-061-14a and -14b.
- **OLD raw message data:** See the dialogue records.
- **OLD trigger:** A-press facing (4,3). `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** `CheckFlag 106` clear -> Function 24 (14a). Set -> `Message 92` with Yes/No (14b): No (0x800C = 1) -> Function 25 (`ReleaseAll`, `End`); Yes -> heal. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (2) `Message 92`, `OpenTouchScreen`, `YesNoTouchScreen 0x800C`, `CloseTouchScreen`, `CloseMessage`. Yes: `FadeScreen 6 1 0 0`, `WaitFadeScreen`, `PlaySound SEQ_ME_ASA`, `HealPokemon`, `FinishOverworldScreen`, `ReturnScreen`, `WaitSound`, `FadeScreen 6 1 1 0`, `WaitFadeScreen`, `ReleaseAll`, `End` (the pair `FinishOverworldScreen` / `ReturnScreen` is printed as the disassembly gives it; semantics Unresolved). (5) The party is healed.
- **OLD state changes:** Party HP/PP/status restored (Yes arm).
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Flag 106.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 843 Script#14, Functions 24, 25; event file 58 spawnables idx 10
- **Other affected callers or records:** Function 25 and Function 24 only from Script 14.
- **Unresolved questions:** `FinishOverworldScreen` / `ReturnScreen` semantics.
- **Validation needed:** Both flag-106 states; Yes and No.

#### NBT-DLG-061-14a — PC: "This PC is connected to the healing machine!"
##### Record identity
- **Record ID:** NBT-DLG-061-14a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-14
- **Related record IDs:** NBT-DLG-061-14b
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Narration
- **Source references:** script file 843 Function#24 (`Message 14`); text archive 543 msg 14
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** This PC is connected to the / healing machine!
- **OLD raw message data:** `This PC is connected to the\nhealing machine!`
- **OLD trigger:** Shown by NBT-EVT-061-14 Function 24.
- **OLD conditions and branch priority:** Flag 106 (starter received) clear.
- **OLD event sequence:** (2) `Message 14`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats until the starter.
- **OLD dependencies and shared-resource effects:** Flag 106.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 14
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-061-14b — PC: "Would you like to heal your Pokémon?"
##### Record identity
- **Record ID:** NBT-DLG-061-14b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-14
- **Related record IDs:** NBT-DLG-061-14a
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Narration
- **Source references:** script file 843 Script#14 (`Message 92`, `YesNoTouchScreen`); text archive 543 msg 92
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Would you like to heal / your Pokémon? {YESNO, 0, 0} (Yes = heal with fade and jingle; No = nothing)
- **OLD raw message data:** `Would you like to heal\nyour Pokémon? {YESNO, 0, 0}`
- **OLD trigger:** Shown by NBT-EVT-061-14 when flag 106 is set.
- **OLD conditions and branch priority:** Choice: 0x800C = 1 (No) -> Function 25; otherwise heal.
- **OLD event sequence:** (2) as in NBT-EVT-061-14.
- **OLD state changes:** Party healed on Yes.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 92
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-061-15 — Return with eight badges: friend, Elm and the Master Ball (level-script cutscene, var 0x4108 = 8)
##### Record identity
- **Record ID:** NBT-EVT-061-15
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-061-LS2; NBT-EVT-061-O3; NBT-DLG-061-15a to 15j (15f to 15j are the second gender variants of 15a, 15b, 15c, 15d, 15e, in that order); NBT-DLG-061-01p; GLB-RTN-2009, GLB-RTN-2033
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** The friend (owID 3) and Professor Elm (owID 0); level script 616 entry 2, condition var 16648 (0x4108) = 8
- **Source references:** script file 843 Script#15; Functions 26, 27; Actions 12, 23-26, 42-45; level script 616 variableValue (16648 = 8 -> script 15); text archive 543 msgs 58/59, 60/61, 62/63, 64/65, 67/68, 69
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-061-15a to -15e and NBT-DLG-061-01p.
- **OLD raw message data:** See the dialogue records.
- **OLD trigger:** Map entry with var 0x4108 = 8 (written by script file 0112 together with `ClearFlag 422`, so the friend is visible; Script 11 also places her/him at (7,12) at 0x4108 = 8). Script 15 begins `MecScript`, `LockAll`.
- **OLD conditions and branch priority:** Direct: level-script test 0x4108 = 8; bag space for item 1 (`CheckItemSpace`): room -> Function 26 (Master Ball given), no room -> `CommonScript 2009` then Function 27 (same scene without giving the item). Reachability: Referenced and apparently reachable. Whether the badge count matches "eight Badges" is not tested here (it depends on the writer, file 0112).
- **OLD event sequence:** (2) Friend `Action#23` (turn west, exclamation), `Action#24` (walk three west, face south); `TextPlayerName 0`, `GenderMessage 58 59` (15a), `CloseMessage`; follower lock; player `Action#25` (seven steps north) and friend `Action#26` walk together; Elm `Action#12` (turn south); `TextPlayerName 0`, `GenderMessage 60 61` (15b); `SetVar 0x8004 1` (Master Ball), `SetVar 0x8005 1`, `CheckItemSpace`. Function 26 (room): `CommonScript 2033` (GLB-RTN-2033, give item with receipt), `TextPlayerName 0`, `GenderMessage 62 63` (15c), `TextPlayerName 0`, `GenderMessage 64 65` (15d), `CloseMessage`; friend `Action#42` and player `Action#43`; `TextPlayerName 0`, `GenderMessage 67 68` (15e), `CloseMessage`; friend `Action#44` (leaves, south/west/south); `RemoveOW Overworld.3`, `SetFlag 422`, `PlayFanfare SEQ_SE_DP_KAIDAN2`, `WaitFanfare`; Elm `Action#12` and player `Action#45`; `Message 69` (01p), `WaitButton`, `CloseMessage`, `ReleaseAll`. Function 27 (no room) is identical except it does not run `CommonScript 2033`: the Master Ball is not given, yet the same state changes follow, so the item is not offered again (a quirk of the script as it stands; Verified from the text). (3) No choices. (5) After `ReleaseAll`: `SetVar 0x4108 9`, `SetVar 0x4079 3`, `SetFlag 571`, `ClearFlag 744`, `SetVar 0x4081 2`, `SetVar 0x407B 2`, `End`. (6) Once (0x4108 becomes 9; after that Elm uses Function 5, 0x4108 >= 9). (7) GLB-RTN-2033, GLB-RTN-2009.
- **OLD state changes:** Flag 422 set, 571 set, 744 cleared; vars 0x4108 = 9, 0x4079 = 3, 0x4081 = 2, 0x407B = 2; bag +Master Ball x1 (room case only).
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Writes scene vars used by other maps (0x4079, 0x4081, 0x407B) and flag 744 (the second New Bark friend object). Message 69 is shared with Elm's later talk (NBT-DLG-061-01p).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 843 Script#15, Functions 26, 27; level script 616 trigger (16648 = 8 -> 15)
- **Other affected callers or records:** Functions 26/27 only from Script 15.
- **Unresolved questions:** What `CommonScript 2033` prints in the working ROM versus hg-engine; whether the engine runs several matching level-script triggers.
- **Validation needed:** Full-bag and room cases.

#### NBT-DLG-061-15a — Friend: "Did you already collect eight Badges?"
##### Record identity
- **Record ID:** NBT-DLG-061-15a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-15
- **Related record IDs:** NBT-DLG-061-15b; NBT-DLG-061-15f (other gender variant, msg 59)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Friend: Lyra (msg 58)
- **Source references:** script file 843 Script#15 (`GenderMessage 58 59`, first message); text archive 543 msg 58
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Lyra: {STRVAR_1, 3, 0, 0}! / Did you already collect eight Badges? /// That’s so cool! // The professor is waiting / for you. //
- **OLD raw message data:** `Lyra: {STRVAR_1, 3, 0, 0}!\nDid you already collect eight Badges?\fThat’s so cool!\rThe professor is waiting\nfor you.\r` (msg 58)
- **OLD trigger:** Shown by NBT-EVT-061-15 after the friend's walk-in.
- **OLD conditions and branch priority:** Var 0x4108 = 8 at map entry. Player gender: `GenderMessage 58 59` shows its first message (58, Lyra) to a male player and its second (59, Ethan) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested; consistent with 03b, where msg 24 (Lyra) refers to the player as "He").
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 58 59`, `CloseMessage`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 58 (the female-player variant is msg 59, NBT-DLG-061-15f)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** Both genders.

#### NBT-DLG-061-15f — Friend: "Did you already collect eight Badges?", second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-15f
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-15
- **Related record IDs:** NBT-DLG-061-15a (other gender variant, msg 58); NBT-DLG-061-15b
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Friend: Ethan (msg 59)
- **Source references:** script file 843 Script#15 (`GenderMessage 58 59`, second message); text archive 543 msg 59
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Ethan: {STRVAR_1, 3, 0, 0}! / Did you already collect eight Badges? /// That’s so cool! // The professor is waiting / for you. //
- **OLD raw message data:** `Ethan: {STRVAR_1, 3, 0, 0}!\nDid you already collect eight Badges?\fThat’s so cool!\rThe professor is waiting\nfor you.\r` (msg 59)
- **OLD trigger:** Shown by NBT-EVT-061-15 after the friend's walk-in.
- **OLD conditions and branch priority:** Var 0x4108 = 8 at map entry. Player gender: `GenderMessage 58 59` shows its second message (59, Ethan) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested; consistent with 03m, where msg 25 (Ethan) refers to the player as "She").
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 58 59`, `CloseMessage`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 59 (the male-player variant is msg 58, NBT-DLG-061-15a)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** Both genders; female player.

#### NBT-DLG-061-15b — Elm: "You never cease to amaze me!"
##### Record identity
- **Record ID:** NBT-DLG-061-15b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-15
- **Related record IDs:** NBT-DLG-061-15c; NBT-DLG-061-15g (other gender variant, msg 61)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Script#15 (`GenderMessage 60 61`, first message); text archive 543 msg 60
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Hi, {STRVAR_1, 3, 0, 0}! / You never cease to amaze me! // Thanks to you, my research is / going great! // Take this as a token of my / appreciation. // (message 61, the other gender variant, has identical text; see NBT-DLG-061-15g)
- **OLD raw message data:** `Professor Elm: Hi, {STRVAR_1, 3, 0, 0}!\nYou never cease to amaze me!\rThanks to you, my research is\ngoing great!\rTake this as a token of my\nappreciation.\r` (msg 60)
- **OLD trigger:** Shown by NBT-EVT-061-15 before the bag-space check.
- **OLD conditions and branch priority:** As NBT-EVT-061-15. Player gender: `GenderMessage 60 61` shows its first message (60) to a male player and its second (61) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 60 61`, `SetVar 0x8004 1`, `SetVar 0x8005 1`, `CheckItemSpace`.
- **OLD state changes:** None in the message.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 60 (the female-player variant is msg 61, NBT-DLG-061-15g)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** None.

#### NBT-DLG-061-15g — Elm: "You never cease to amaze me!", second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-15g
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-15
- **Related record IDs:** NBT-DLG-061-15b (other gender variant, msg 60); NBT-DLG-061-15c
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm
- **Source references:** script file 843 Script#15 (`GenderMessage 60 61`, second message); text archive 543 msg 61
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm: Hi, {STRVAR_1, 3, 0, 0}! / You never cease to amaze me! // Thanks to you, my research is / going great! // Take this as a token of my / appreciation. // (message 60, the other gender variant, has identical text; see NBT-DLG-061-15b)
- **OLD raw message data:** `Professor Elm: Hi, {STRVAR_1, 3, 0, 0}!\nYou never cease to amaze me!\rThanks to you, my research is\ngoing great!\rTake this as a token of my\nappreciation.\r` (msg 61)
- **OLD trigger:** Shown by NBT-EVT-061-15 before the bag-space check.
- **OLD conditions and branch priority:** As NBT-EVT-061-15. Player gender: `GenderMessage 60 61` shows its second message (61) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 60 61`, `SetVar 0x8004 1`, `SetVar 0x8005 1`, `CheckItemSpace`.
- **OLD state changes:** None in the message.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 61 (the male-player variant is msg 60, NBT-DLG-061-15b)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** None; female player.

#### NBT-DLG-061-15c — "The Master Ball is the best!"
##### Record identity
- **Record ID:** NBT-DLG-061-15c
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-15
- **Related record IDs:** NBT-DLG-061-15d; NBT-DLG-061-15h (other gender variant, msg 63)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm (no label in the text; Inferred from the scene)
- **Source references:** script file 843 Function#26 and Function#27 (`GenderMessage 62 63`, first message); text archive 543 msg 62
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** The Master Ball is the best! // It’s the ultimate Poké Ball! It’ll catch / any Pokémon without fail. // It’s given only to noted / Pokémon researchers. // I think you can make much better / use of it than I can, {STRVAR_1, 3, 0, 0}! // (message 63, the other gender variant, has identical text; see NBT-DLG-061-15h)
- **OLD raw message data:** `The Master Ball is the best!\rIt’s the ultimate Poké Ball! It’ll catch\nany Pokémon without fail.\rIt’s given only to noted\nPokémon researchers.\rI think you can make much better\nuse of it than I can, {STRVAR_1, 3, 0, 0}!\r` (msg 62)
- **OLD trigger:** Shown by NBT-EVT-061-15 Function 26 (after the item is given) and Function 27 (when the item was not given).
- **OLD conditions and branch priority:** Both bag-space arms print it. Player gender: `GenderMessage 62 63` shows its first message (62) to a male player and its second (63) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 62 63`, then straight into 15d.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Describes an item that Function 27 did not give.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 62 (the female-player variant is msg 63, NBT-DLG-061-15h)
- **Other affected callers or records:** Function 26 and Function 27 (same record).
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** None.

#### NBT-DLG-061-15h — "The Master Ball is the best!", second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-15h
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-15
- **Related record IDs:** NBT-DLG-061-15c (other gender variant, msg 62); NBT-DLG-061-15d
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm (no label in the text; Inferred from the scene)
- **Source references:** script file 843 Function#26 and Function#27 (`GenderMessage 62 63`, second message); text archive 543 msg 63
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** The Master Ball is the best! // It’s the ultimate Poké Ball! It’ll catch / any Pokémon without fail. // It’s given only to noted / Pokémon researchers. // I think you can make much better / use of it than I can, {STRVAR_1, 3, 0, 0}! // (message 62, the other gender variant, has identical text; see NBT-DLG-061-15c)
- **OLD raw message data:** `The Master Ball is the best!\rIt’s the ultimate Poké Ball! It’ll catch\nany Pokémon without fail.\rIt’s given only to noted\nPokémon researchers.\rI think you can make much better\nuse of it than I can, {STRVAR_1, 3, 0, 0}!\r` (msg 63)
- **OLD trigger:** Shown by NBT-EVT-061-15 Function 26 (after the item is given) and Function 27 (when the item was not given).
- **OLD conditions and branch priority:** Both bag-space arms print it. Player gender: `GenderMessage 62 63` shows its second message (63) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 62 63`, then straight into 15d.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Describes an item that Function 27 did not give.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 63 (the male-player variant is msg 62, NBT-DLG-061-15c)
- **Other affected callers or records:** Function 26 and Function 27 (same record).
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** None; female player.

#### NBT-DLG-061-15d — "We just had a group of beautiful Kimono Girls looking for you."
##### Record identity
- **Record ID:** NBT-DLG-061-15d
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-15
- **Related record IDs:** NBT-DLG-061-15c; NBT-DLG-061-15i (other gender variant, msg 65)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm (Inferred)
- **Source references:** script file 843 Function#26 and Function#27 (`GenderMessage 64 65`, first message); text archive 543 msg 64
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** By the way... // We just had a group of beautiful / Kimono Girls looking for you. // (message 65, the other gender variant, has identical text; see NBT-DLG-061-15i)
- **OLD raw message data:** `By the way...\rWe just had a group of beautiful\nKimono Girls looking for you.\r` (msg 64)
- **OLD trigger:** Shown by NBT-EVT-061-15 Functions 26/27 directly after 15c.
- **OLD conditions and branch priority:** As 15c. Player gender: `GenderMessage 64 65` shows its first message (64) to a male player and its second (65) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 64 65`, `CloseMessage`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 64 (the female-player variant is msg 65, NBT-DLG-061-15i)
- **Other affected callers or records:** Function 26 and Function 27.
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** None.

#### NBT-DLG-061-15i — "We just had a group of beautiful Kimono Girls looking for you.", second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-15i
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-15
- **Related record IDs:** NBT-DLG-061-15d (other gender variant, msg 64); NBT-DLG-061-15c
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Professor Elm (Inferred)
- **Source references:** script file 843 Function#26 and Function#27 (`GenderMessage 64 65`, second message); text archive 543 msg 65
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** By the way... // We just had a group of beautiful / Kimono Girls looking for you. // (message 64, the other gender variant, has identical text; see NBT-DLG-061-15d)
- **OLD raw message data:** `By the way...\rWe just had a group of beautiful\nKimono Girls looking for you.\r` (msg 65)
- **OLD trigger:** Shown by NBT-EVT-061-15 Functions 26/27 directly after 15c.
- **OLD conditions and branch priority:** As 15c. Player gender: `GenderMessage 64 65` shows its second message (65) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested).
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 64 65`, `CloseMessage`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 65 (the male-player variant is msg 64, NBT-DLG-061-15d)
- **Other affected callers or records:** Function 26 and Function 27.
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** None; female player.

#### NBT-DLG-061-15e — Friend: "people are talking about you!"
##### Record identity
- **Record ID:** NBT-DLG-061-15e
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-15
- **Related record IDs:** NBT-EVT-061-O3; NBT-DLG-061-15j (other gender variant, msg 68)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Friend: Lyra (msg 67)
- **Source references:** script file 843 Function#26 and Function#27 (`GenderMessage 67 68`, first message); text archive 543 msg 67
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Lyra: {STRVAR_1, 3, 0, 0}, people are talking / about you! // I heard you helped Kimono Girls? // You’ve been helping all these people! / You make me proud to be your friend. //
- **OLD raw message data:** `Lyra: {STRVAR_1, 3, 0, 0}, people are talking\nabout you!\rI heard you helped Kimono Girls?\rYou’ve been helping all these people!\nYou make me proud to be your friend.\r` (msg 67)
- **OLD trigger:** Shown by NBT-EVT-061-15 Functions 26/27 after the friend steps up.
- **OLD conditions and branch priority:** As 15c. Player gender: `GenderMessage 67 68` shows its first message (67, Lyra) to a male player and its second (68, Ethan) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested; consistent with 03b, where msg 24 (Lyra) refers to the player as "He").
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 67 68`, `CloseMessage`, then the friend leaves.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 67 (the female-player variant is msg 68, NBT-DLG-061-15j)
- **Other affected callers or records:** Function 26 and Function 27.
- **Unresolved questions:** Gender mapping is Inferred (first message = male player), not run-tested.
- **Validation needed:** Both genders.

#### NBT-DLG-061-15j — Friend: "people are talking about you!", second gender variant
##### Record identity
- **Record ID:** NBT-DLG-061-15j
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-15
- **Related record IDs:** NBT-EVT-061-O3; NBT-DLG-061-15e (other gender variant, msg 67)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Friend: Ethan (msg 68)
- **Source references:** script file 843 Function#26 and Function#27 (`GenderMessage 67 68`, second message); text archive 543 msg 68
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Ethan: {STRVAR_1, 3, 0, 0}, people are talking / about you! // I heard you helped Kimono Girls? // You’ve been helping all these people! / You make me proud to be your friend. //
- **OLD raw message data:** `Ethan: {STRVAR_1, 3, 0, 0}, people are talking\nabout you!\rI heard you helped Kimono Girls?\rYou’ve been helping all these people!\nYou make me proud to be your friend.\r` (msg 68)
- **OLD trigger:** Shown by NBT-EVT-061-15 Functions 26/27 after the friend steps up.
- **OLD conditions and branch priority:** As 15c. Player gender: `GenderMessage 67 68` shows its second message (68, Ethan) to a female player (docs/scripting-reference.md `GenderMsgBox`/`GenderMessage`, params `male_text`, `female_text`; Inferred, parameter order only, not run-tested; consistent with 03m, where msg 25 (Ethan) refers to the player as "She").
- **OLD event sequence:** (2) `TextPlayerName 0`, `GenderMessage 67 68`, `CloseMessage`, then the friend leaves.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 68 (the male-player variant is msg 67, NBT-DLG-061-15e)
- **Other affected callers or records:** Function 26 and Function 27.
- **Unresolved questions:** Gender mapping is Inferred (second message = female player), not run-tested.
- **Validation needed:** Both genders; female player.

#### NBT-EVT-061-16 — Aide reports that the thief returned the Pokémon (level-script cutscene, var 0x40FC = 2)
##### Record identity
- **Record ID:** NBT-EVT-061-16
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-061-LS2; NBT-DLG-061-16a; NBT-DLG-061-02e
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Aide (owID 2); level script 616 entry 2, condition var 16636 (0x40FC) = 2
- **Source references:** script file 843 Script#16; Actions 27, 28; level script 616 variableValue (16636 = 2 -> script 16); text archive 543 msg 56
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-061-16a.
- **OLD raw message data:** See NBT-DLG-061-16a.
- **OLD trigger:** Map entry with var 0x40FC = 2 (written by script file 0111; header not mapped; resolved: header 253 D44R0102, Dragon's Den). Listed first in the level script, so it is tested before the 0x4108 entries.
- **OLD conditions and branch priority:** Var 0x40FC = 2 (direct). The aide must be present (flag 582 clear). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Entry. (2) `MecScript`, `LockAll`; aide `Action#27` (walk west 5, south 1); `TextPlayerName 0`, `Message 56` (16a), `CloseMessage`; aide `Action#28` (north 1, east 5, face south); `WaitMovement`. (5) `SetVar 0x40FC 3`, `ReleaseAll`, `End`.
- **OLD state changes:** Var 0x40FC = 3 (which switches the aide's talk line to NBT-DLG-061-02e).
- **OLD repeat/completion behavior:** Once per 0x40FC = 2.
- **OLD dependencies and shared-resource effects:** Var 0x40FC is also written by files 0007 (=1) and 0111 (=2).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 843 Script#16; level script 616 trigger (16636 = 2 -> 16)
- **Other affected callers or records:** Script 2 Function 9 reads 0x40FC = 3 (NBT-EVT-061-02).
- **Unresolved questions:** Whether the engine runs several matching level-script triggers on one entry.
- **Validation needed:** Set 0x40FC = 2 on a test save.

#### NBT-DLG-061-16a — Aide: the thief returned the Pokémon
##### Record identity
- **Record ID:** NBT-DLG-061-16a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-061-16
- **Related record IDs:** NBT-DLG-061-02e
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Aide
- **Source references:** script file 843 Script#16 (`Message 56`); text archive 543 msg 56
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** {STRVAR_1, 3, 0, 0}! / Guess what! // The person who took the Professor’s / Pokémon has...come back to return it! // That’s the last thing I expected! / Guess what Professor Elm said to him. // ... / “It seems that your Pokémon already /// likes you so much. // For a Pokémon, the best happiness is / to be with someone it loves. /// I think it should stay with you.” // ... / Isn’t it moving? It made me cry! //
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0}!\nGuess what!\rThe person who took the Professor’s\nPokémon has...come back to return it!\rThat’s the last thing I expected!\nGuess what Professor Elm said to him.\r...\n“It seems that your Pokémon already\flikes you so much.\rFor a Pokémon, the best happiness is\nto be with someone it loves.\fI think it should stay with you.”\r...\nIsn’t it moving? It made me cry!\r`
- **OLD trigger:** Shown by NBT-EVT-061-16.
- **OLD conditions and branch priority:** Var 0x40FC = 2.
- **OLD event sequence:** (2) `TextPlayerName 0`, `Message 56`, `CloseMessage`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Name buffer 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 56
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-061-LS1 — Level script 616, entry 1: screenReset -> script 11
##### Record identity
- **Record ID:** NBT-EVT-061-LS1
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-061-11; NBT-EVT-061-LS2
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Level script 616 entry 1, kind screenReset, scriptId 11
- **Source references:** level script 616 (`get_script 616`: 2 entries, 32 bytes) entry 1; script file 843 Script#11
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Screen reset (map screen rebuilt).
- **OLD conditions and branch priority:** Unconditional at the level-script level; script 11 branches on flag 352 and var 0x4108 (NBT-EVT-061-11). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Runs script 11.
- **OLD state changes:** See NBT-EVT-061-11.
- **OLD repeat/completion behavior:** Every screen reset.
- **OLD dependencies and shared-resource effects:** Not journalled; the entry is unchanged by the hack.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** level script 616 entry 1 (`set_script` levelScript replaces the whole list; read both entries first)
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-061-LS2 — Level script 616, entry 2: variableValue list (three conditions)
##### Record identity
- **Record ID:** NBT-EVT-061-LS2
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-061-16; NBT-EVT-061-03; NBT-EVT-061-15; NBT-EVT-061-LS1
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Level script 616 entry 2, kind variableValue
- **Source references:** level script 616 entry 2; script file 843 Scripts 16, 3, 15
- **Evidence status:** Verified (structure); evaluation semantics Unresolved
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Map load (variable-value level script). Conditions in stored order: (1) var 16636 (0x40FC) = 2 -> script 16; (2) var 16648 (0x4108) = 3 -> script 3; (3) var 16648 (0x4108) = 8 -> script 15.
- **OLD conditions and branch priority:** All three are direct variable tests. A given save can match (1) together with (2) or (3); whether the engine runs only the first match or all is not verified here. Readers/writers: see the variable table (0x40FC writers: files 0007, 0111, this map's Script 16; 0x4108 values 3 by 0229, 8 by 0112). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Runs the matched script (NBT-EVT-061-16, -03, -15).
- **OLD state changes:** See those records.
- **OLD repeat/completion behavior:** Each script clears its own condition by changing the variable (16 sets 0x40FC to 3; 3 sets 0x4108 to 4; 15 sets 0x4108 to 9).
- **OLD dependencies and shared-resource effects:** Unchanged by the hack (no journal edit touches level script 616).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** level script 616 entry 2 (`set_script` levelScript: at most one variableValue entry; replaces the whole list)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Engine evaluation order for several matches; the story point at which 0x40FC becomes 2.
- **Validation needed:** Each of the three conditions on a test save.

#### NBT-EVT-061-O1 — Officer (overworld 1): no script of its own
##### Record identity
- **Record ID:** NBT-EVT-061-O1
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-061-03; NBT-DLG-061-03a; NBT-DLG-061-03c to 03e
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Event file 58 overworld idx 1: owID 1, sprite entry 34, movement 0 (none), type Normal, orientation 3, at (3,6), scriptNumber 0, hiding flag 413 (FLAG_HIDE_ELMS_LAB_OFFICER)
- **Source references:** event file 58 overworlds idx 1; script file 843 Script#3 (moves this object as `Overworld.1`)
- **Evidence status:** Verified (the "officer" role is Inferred from the flag name and message 23)
##### OLD — Current content
- **OLD dialogue:** Not applicable (talking to it runs no script; it speaks only inside NBT-EVT-061-03).
- **OLD raw message data:** Not applicable.
- **OLD trigger:** None (scriptNumber 0). It is moved and removed by script 3.
- **OLD conditions and branch priority:** Visible when flag 413 is clear. Writers: flag 413 set by script 3 (this file), by file 0149; cleared by file 0229. Reachability: Referenced with unresolved reachability (the object is hidden outside the cutscene by the flag state; the exact flag state at entry depends on files 0149 / 0229).
- **OLD event sequence:** See NBT-EVT-061-03.
- **OLD state changes:** None of its own.
- **OLD repeat/completion behavior:** Not applicable.
- **OLD dependencies and shared-resource effects:** Flag 413.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 58 overworlds idx 1
- **Other affected callers or records:** Script 3 (`Overworld.1` Actions 3, 5, 6, 8).
- **Unresolved questions:** Where the flag-413 state is set up before the cutscene.
- **Validation needed:** None.

#### NBT-EVT-061-O3 — Friend (overworld 3): no script of its own
##### Record identity
- **Record ID:** NBT-EVT-061-O3
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-061-03; NBT-EVT-061-15; NBT-EVT-061-W0
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Event file 58 overworld idx 3: owID 3, sprite entry 101, movement 0 (none), type Normal, orientation 0, at (4,14), scriptNumber 0, hiding flag 422 (FLAG_HIDE_ELMS_LAB_FRIEND)
- **Source references:** event file 58 overworlds idx 3; script file 843 Script#3, Script#15, Script#11 (as `Overworld.3`)
- **Evidence status:** Verified (the friend role is Inferred from flag name and the Lyra/Ethan texts)
##### OLD — Current content
- **OLD dialogue:** Not applicable (talking to it runs no script).
- **OLD raw message data:** Not applicable.
- **OLD trigger:** None (scriptNumber 0). It is added/removed and moved by scripts 3, 11 and 15.
- **OLD conditions and branch priority:** Sits on the door tile (4,14), the same tile as warp idx 0. Flag 422: cleared in Script 3 (`ClearFlag 422` then `AddOW`), set again in Script 3 and in Functions 26/27; cleared by file 0112, set by file 0149. Script 11 repositions it to (7,12) at var 0x4108 = 8. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** See NBT-EVT-061-03 and -15.
- **OLD state changes:** None of its own.
- **OLD repeat/completion behavior:** Not applicable.
- **OLD dependencies and shared-resource effects:** Flag 422.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 58 overworlds idx 3
- **Other affected callers or records:** Scripts 3, 11, 15 (`Overworld.3` Actions 4, 7, 9, 10, 23, 24, 26, 42, 44).
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-061-W0 — Door warp to header 60
##### Record identity
- **Record ID:** NBT-EVT-061-W0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-061-O3
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** Event file 58 warp idx 0 at global (4,14), matrix cell (0,0), tile (4,14)
- **Source references:** event file 58 warps idx 0 (header 60, anchor 0, height 0)
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** The player steps on the door tile (4,14); destination map header 60 (T20, the town exterior), warp anchor 0.
- **OLD conditions and branch priority:** None (no script, no flag).
- **OLD event sequence:** Warp; no script runs.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every time.
- **OLD dependencies and shared-resource effects:** The tile is shared with the friend object (O3).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 58 warps idx 0
- **Other affected callers or records:** Header 60's event file holds the return warp (not read here).
- **Unresolved questions:** None.
- **Validation needed:** None.


#### NBT-DLG-061-U52 — Unreferenced local message: "Uh-oh, your Bag is chock-full."
##### Record identity
- **Record ID:** NBT-DLG-061-U52
- **Record type:** Dialogue variant
- **Parent record ID:** None (not referenced by any script in this map's script file)
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** None (no speaker label in the text; no script shows it)
- **Source references:** text archive 543 msg 52; script file 843 (`project/scripts/0843.script`) searched, no `Message`, `GenderMessage` or `BoardMessage` names index 52
- **Evidence status:** Verified (text read with `get_text`; non-reference confirmed by grep of 0843.script); Inferred that no other mechanism reads it
##### OLD — Current content
- **OLD dialogue:** Uh-oh, your Bag is chock-full.
- **OLD raw message data:** `Uh-oh, your Bag is chock-full.`
- **OLD trigger:** None found.
- **OLD conditions and branch priority:** Reachability: Apparently unused. No other message in archive 543 has this text (`search_text` on archive 543: 1 match, this one). The aide's bag-full path in script 843 uses the common routine `CommonScript 2009` instead.
- **OLD event sequence:** None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Not applicable.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 52 (no script change needed unless a script is made to show it)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Whether another file reads it.
- **Validation needed:** None.

#### NBT-DLG-061-U66 — Unreferenced local message: Kimono Girls are waiting at the Ecruteak Dance Theater
##### Record identity
- **Record ID:** NBT-DLG-061-U66
- **Record type:** Dialogue variant
- **Parent record ID:** None (not referenced by any script in this map's script file)
- **Related record IDs:** NBT-DLG-061-01p (similar subject: the Kimono Girls are waiting)
- **Map or system:** New Bark Town, T20R0101 (header 61)
- **Speaker, object, or trigger:** None (no speaker label in the text; the wording suggests Professor Elm, Inferred)
- **Source references:** text archive 543 msg 66; script file 843 (`project/scripts/0843.script`) searched, no `Message`, `GenderMessage` or `BoardMessage` names index 66
- **Evidence status:** Verified (text read with `get_text`; non-reference confirmed by grep of 0843.script); Inferred that no other mechanism reads it
##### OLD — Current content
- **OLD dialogue:** The Kimono Girls told me they are / waiting for you at the Ecruteak /// Dance Theater. // I know you’ve gone through many things / since that Egg got you involved in /// all this... // I hope you’ll carry through it. //
- **OLD raw message data:** `The Kimono Girls told me they are\nwaiting for you at the Ecruteak\fDance Theater.\rI know you’ve gone through many things\nsince that Egg got you involved in\fall this...\rI hope you’ll carry through it.\r`
- **OLD trigger:** None found.
- **OLD conditions and branch priority:** Reachability: Apparently unused. No other message in archive 543 has this text (`search_text` on archive 543: 1 match, this one).
- **OLD event sequence:** None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Not applicable.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 543 msg 66 (no script change needed unless a script is made to show it)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Whether another file reads it.
- **Validation needed:** None.

## Map 62 — T20R0102

Rendering convention (all of map 062/063/064): `\n` = line break inside a text box, `\r` = scroll (next paragraph after the player presses a button), `\f` = new page; `{STRVAR_1, 3, 0, 0}` = the player's name (filled by the preceding `TextPlayerName 0`; Inferred from the command name). OLD dialogue is the raw string with these escapes expanded to " / " (line break), " // " (scroll) and " /// " (page).

Sprite identities (`overlayTableEntry`) cannot be decoded through dspre-mcp; speakers below are identified from message text and flag names (Inferred), and the sprite number is quoted for later checking. List-changes check: `list_changes` (34 entries) touches script files 92, 141, 145, 146, 163, 222, 225, 227, 228, 843, 891, 903 and text archives 115, 373 only; none of event files 59–61, script files 844–846, level scripts 617–619 or text archives 544–546 were edited, so everything below is the pristine vanilla content.

### Map 062 event inventory (event file 59, script file 844, level script 617, text archive 544)

| Section | Idx | Type / sprite (overlayTableEntry) | Coordinates (global x,y) | Hide flag | scriptNumber | Covering record |
|---|---|---|---|---|---|---|
| overworld | 0 | Normal, owID 0, sprite 325, movement 0 (none), faces 1 | 7,5 | 0 (none) | 1 | NBT-EVT-062-01 |
| overworld | 1 | Normal, owID 1, sprite 317, movement 3 (wander, xRange 1, yRange 2), faces 2 | 3,9 | 0 (none) | 2 | NBT-EVT-062-02 |
| warp | 0 | to header 60, anchor 4, height 0 | 12,6 | n/a | n/a | NBT-EVT-062-W0 |
| spawnables | none (0) | | | | | |
| triggers | none (0) | | | | | |
| level script 617 | empty (0 entries, 4 bytes) | | | | | no record needed |

Reconciliation: 2 overworlds + 1 warp = 3 event records (all indices covered). Script file 844 has Script 1, Script 2, no Functions, no Actions. Text archive 544 has 4 messages: 0, 1 (used by Script 1), 2 (Script 2); message 3 is not referenced by any script of file 844 and the event file has no spawnables: Apparently unused candidate.

#### NBT-EVT-062-01 — Wife of the house resident: greeting
##### Record identity
- **Record ID:** NBT-EVT-062-01
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-062-01a, NBT-DLG-062-01b
- **Map or system:** New Bark Town, T20R0102 (header 62)
- **Speaker, object, or trigger:** Overworld idx 0 (owID 0, sprite 325, at 7,5), talk trigger. Speaker is a woman who calls the player's visitor "Hi, <name>" and refers to "my husband ... his Pokémon research" (Inferred from message text: Professor Elm's wife; the text never names Elm in the messages this script shows).
- **Source references:** script file 844 Script#1; event file 59 overworlds idx 0; text archive 544 msg 0 and msg 1
- **Evidence status:** Verified (script and text); speaker identity Inferred
##### OLD — Current content
- **OLD dialogue:** Gender-dependent greeting; see NBT-DLG-062-01a and NBT-DLG-062-01b.
- **OLD raw message data:** see the dialogue records (544:0 and 544:1).
- **OLD trigger:** Player presses A facing overworld idx 0 (talk). No level script (617 is empty).
- **OLD conditions and branch priority:** None: no flag or var is checked in the script. Which of message 0 or 1 plays depends on player gender via `GenderMessage 0 1` (male text slot 0, female text slot 1 per docs/scripting-reference.md line 111). Overworld hide flag 0 (always present). Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** (1) Talk to the NPC. (2) `PlayFanfare SEQ_SE_CONFIRM`; `LockAll`; `FacePlayer`; `TextPlayerName 0`; `GenderMessage 0 1` (msg 0 for male player, msg 1 for female player; NBT-DLG-062-01a/01b); `WaitButton`; `CloseMessage`; `ReleaseAll`; `End`. (3) No branches. (4) NPC turns to face the player (`FacePlayer`); player locked until release. (5) No flag/var/item changes. (6) Repeats identically on every talk. (7) No global calls.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable, identical each time.
- **OLD dependencies and shared-resource effects:** Player name text variable 0 (shared).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 844 Script#1; text archive 544 msgs 0 and 1; event file 59 overworld idx 0
- **Other affected callers or records:** None found: no other event in header 62 uses scriptNumber 1 or these messages; other maps sharing text archive 544 or script file 844 were not searched (header-to-archive mapping outside this scope).
- **Unresolved questions:** Which sprite 325 is (not decodable via dspre-mcp). Whether other headers also use script file 844 / text archive 544.
- **Validation needed:** In-game: talk as male and as female player; confirm which gender sees which text slot.

#### NBT-DLG-062-01a — Wife greeting (male player slot)
##### Record identity
- **Record ID:** NBT-DLG-062-01a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-062-01
- **Related record IDs:** NBT-DLG-062-01b
- **Map or system:** New Bark Town, T20R0102 (header 62)
- **Speaker, object, or trigger:** Overworld idx 0 (sprite 325) via NBT-EVT-062-01
- **Source references:** script file 844 Script#1 (`GenderMessage 0 1`, first argument); text archive 544 msg 0
- **Evidence status:** Verified (text slot assignment to male per docs/scripting-reference.md line 111)
##### OLD — Current content
- **OLD dialogue:** Hi, <player>! // My husband’s always / so busy--I hope he’s OK. // When he’s caught up in his Pokémon / research, he even forgets to eat.
- **OLD raw message data:** `Hi, {STRVAR_1, 3, 0, 0}!\rMy husband’s always\nso busy--I hope he’s OK.\rWhen he’s caught up in his Pokémon\nresearch, he even forgets to eat.`
- **OLD trigger:** Shown by NBT-EVT-062-01 when the player is male (first GenderMessage slot).
- **OLD conditions and branch priority:** Only the player-gender selection; no flags/vars. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Shown by NBT-EVT-062-01 step (2).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk.
- **OLD dependencies and shared-resource effects:** Player name variable.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 544 msg 0
- **Other affected callers or records:** None found (only script file 844 Script#1 references msg 0). Messages 0 and 1 are textually identical in the ROM.
- **Unresolved questions:** None beyond NBT-EVT-062-01.
- **Validation needed:** Edit msg 0 and msg 1 together if the line is to be the same for both genders.

#### NBT-DLG-062-01b — Wife greeting (female player slot)
##### Record identity
- **Record ID:** NBT-DLG-062-01b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-062-01
- **Related record IDs:** NBT-DLG-062-01a
- **Map or system:** New Bark Town, T20R0102 (header 62)
- **Speaker, object, or trigger:** Overworld idx 0 (sprite 325) via NBT-EVT-062-01
- **Source references:** script file 844 Script#1 (`GenderMessage 0 1`, second argument); text archive 544 msg 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Identical to NBT-DLG-062-01a: Hi, <player>! // My husband’s always / so busy--I hope he’s OK. // When he’s caught up in his Pokémon / research, he even forgets to eat.
- **OLD raw message data:** `Hi, {STRVAR_1, 3, 0, 0}!\rMy husband’s always\nso busy--I hope he’s OK.\rWhen he’s caught up in his Pokémon\nresearch, he even forgets to eat.`
- **OLD trigger:** Shown by NBT-EVT-062-01 when the player is female (second GenderMessage slot).
- **OLD conditions and branch priority:** Only the player-gender selection. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Shown by NBT-EVT-062-01 step (2).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk.
- **OLD dependencies and shared-resource effects:** Player name variable.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 544 msg 1
- **Other affected callers or records:** None found (only script file 844 Script#1 references msg 1).
- **Unresolved questions:** None beyond NBT-EVT-062-01.
- **Validation needed:** As NBT-DLG-062-01a.

#### NBT-EVT-062-02 — Child: wandering NPC
##### Record identity
- **Record ID:** NBT-EVT-062-02
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-062-02a
- **Map or system:** New Bark Town, T20R0102 (header 62)
- **Speaker, object, or trigger:** Overworld idx 1 (owID 1, sprite 317, start 3,9, movement 3 "Walking around in all directions", xRange 1, yRange 2, facing 2). Speaker is a child who says "I’m going to help my dad ... a great Pokémon Professor" (Inferred from text: Elm's child).
- **Source references:** script file 844 Script#2; event file 59 overworlds idx 1; text archive 544 msg 2
- **Evidence status:** Verified (script and text); speaker identity Inferred
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-062-02a.
- **OLD raw message data:** see 544:2.
- **OLD trigger:** Player presses A facing overworld idx 1 (talk).
- **OLD conditions and branch priority:** None; no flags/vars. Hide flag 0. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** (1) Talk. (2) `PlayFanfare SEQ_SE_CONFIRM`; `LockAll`; `FacePlayer`; `Message 2` (NBT-DLG-062-02a); `WaitButton`; `CloseMessage`; `ReleaseAll`; `End`. (3)-(5) none. (6) Repeats identically. (7) None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 844 Script#2; text archive 544 msg 2; event file 59 overworld idx 1
- **Other affected callers or records:** None found.
- **Unresolved questions:** Sprite 317 identity (not decodable here).
- **Validation needed:** In-game talk check.

#### NBT-DLG-062-02a — Child line
##### Record identity
- **Record ID:** NBT-DLG-062-02a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-062-02
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0102 (header 62)
- **Speaker, object, or trigger:** Overworld idx 1 (sprite 317) via NBT-EVT-062-02
- **Source references:** script file 844 Script#2 `Message 2`; text archive 544 msg 2
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** When I grow up, I’m going to help / my dad! // I’m going to be a great / Pokémon Professor!
- **OLD raw message data:** `When I grow up, I’m going to help\nmy dad!\rI’m going to be a great\nPokémon Professor!`
- **OLD trigger:** Shown by NBT-EVT-062-02 on every talk.
- **OLD conditions and branch priority:** Unconditional. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Shown by NBT-EVT-062-02 step (2).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 544 msg 2
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None beyond in-game check.

#### NBT-EVT-062-W0 — Door to New Bark Town outdoors
##### Record identity
- **Record ID:** NBT-EVT-062-W0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0102 (header 62)
- **Speaker, object, or trigger:** Warp idx 0 at 12,6 (step-on door tile)
- **Source references:** event file 59 warps idx 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Player steps on the warp tile (12,6).
- **OLD conditions and branch priority:** None; no script. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** (1) Step on tile. (2) Warp to header 60 ("T20", New Bark Town outdoors; script file 842, level script 615, event file 57) at anchor 4, height 0. (3)-(7) none.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Always available.
- **OLD dependencies and shared-resource effects:** Landing position is anchor 4 of header 60's warp list (not documented here).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 59 warps idx 0
- **Other affected callers or records:** header 60's event file 57 should contain the matching door warp into header 62 (not checked; outside scope).
- **Unresolved questions:** Which header-60 warp anchor 4 refers to.
- **Validation needed:** Walk out of the house.


#### NBT-DLG-062-U3 — Unreferenced local message: Professor Elm's research paper ("Pokémon. Where do they come from?")
##### Record identity
- **Record ID:** NBT-DLG-062-U3
- **Record type:** Dialogue variant
- **Parent record ID:** None (not referenced by any script in this map's script file)
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0102 (header 62)
- **Speaker, object, or trigger:** None (a read-aloud paper text; no script shows it)
- **Source references:** text archive 544 msg 3; script file 844 (`project/scripts/0844.script`) searched, no `Message`, `GenderMessage` or `BoardMessage` names index 3
- **Evidence status:** Verified (text read with `get_text`; non-reference confirmed by grep of 0844.script); Inferred that no other mechanism reads it
##### OLD — Current content
- **OLD dialogue:** “Pokémon. Where do they come from? / Where are they going? // Why has no one ever witnessed a / Pokémon’s birth? // I want to know! I will dedicate my // life to the study of Pokémon!” // ... // It’s a part of Professor Elm’s / research papers.
- **OLD raw message data:** `“Pokémon. Where do they come from?\nWhere are they going?\rWhy has no one ever witnessed a\nPokémon’s birth?\rI want to know! I will dedicate my\rlife to the study of Pokémon!”\r...\rIt’s a part of Professor Elm’s\nresearch papers.`
- **OLD trigger:** None found.
- **OLD conditions and branch priority:** Reachability: Apparently unused. No other message in archive 544 has this text (`search_text` on archive 544: 1 match, this one).
- **OLD event sequence:** None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Not applicable.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 544 msg 3 (no script change needed unless a script is made to show it)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Whether another file reads it.
- **Validation needed:** None.

## Map 63 — T20R0201

### Map 063 event inventory (event file 60, script file 845, level script 618, text archive 545)

Flag/var names are from `hg-engine/armips/include/flags.s` and `vars.s`: flag 283 FLAG_GOT_BAG, 284 FLAG_GOT_TRAINER_CARD, 285 FLAG_GOT_SAVE_BUTTON, 286 FLAG_GOT_OPTIONS_BUTTON, 106 FLAG_GOT_STARTER, 156 FLAG_GOT_POKEGEAR, 167 FLAG_TALKED_TO_MOM_AFTER_NAMING_RIVAL, 2404 FLAG_GAME_CLEAR, 2438 FLAG_SYS_MOMS_SAVINGS; var 0x4106 (16646) VAR_SCENE_PLAYERS_HOUSE_1F, 0x4108 (16648) VAR_SCENE_ELMS_LAB, 0x4095 (16533) VAR_SCENE_ROUTE_30_PHONE_CALL, 0x4000 VAR_TEMP_x4000 (scratch).

| Section | Idx | Type / sprite | Coordinates (global x,y) | Hide flag | scriptNumber | Covering record |
|---|---|---|---|---|---|---|
| spawnable | 0 | Misc, front interaction | 5,3 | n/a | 3 | NBT-EVT-063-03 |
| spawnable | 1 | Misc, front interaction | 6,3 | n/a | 3 | NBT-EVT-063-03 |
| spawnable | 2 | Misc, front interaction | 8,3 | n/a | 5 | NBT-EVT-063-05 |
| spawnable | 3 | Misc, front interaction | 9,3 | n/a | 4 | NBT-EVT-063-04 |
| spawnable | 4 | Misc, front interaction | 11,3 | n/a | 6 | NBT-EVT-063-06 |
| overworld | 0 | Normal, owID 0, sprite 365, movement 0 (none), faces 3 | 6,7 | 0 (none) | 2 | NBT-EVT-063-02 |
| warp | 0 | to header 60 anchor 1, height 0 | 3,10 | n/a | n/a | NBT-EVT-063-W0 |
| warp | 1 | to header 64 anchor 0, height 0 | 3,3 | n/a | n/a | NBT-EVT-063-W1 |
| trigger | none (0) | | | | | |
| level script 618 | 1 entry: kind variableValue, 2 conditions | | | | 7 and 1 | NBT-EVT-063-LS |

Scripts reached only from level script: Script 1 (NBT-EVT-063-01) and Script 7 (NBT-EVT-063-07). Reconciliation: 5 spawnables + 1 overworld + 2 warps + 1 level-script entry = 9 event entries, covered by NBT-EVT-063-02 to -06, -W0, -W1, -LS and the two level-script-only scripts -01 and -07 (10 event records). Script file 845: 7 Scripts, 25 Functions, 4 Actions, all reached (Functions 1-25 from Script 2 and each other; Actions 1-4 from Scripts 1 and 7; verified by reading the full listing). Text archive 545 has 39 messages; message 19 ("{STRVAR_1...}, stand firm! I’m always there for you!") is not referenced by any command in file 845 (Apparently unused candidate); messages 29-32 are the money-menu button labels used via `CreateMultiTouchBox`.

#### NBT-EVT-063-LS — Level script 618 (player's house 1F scene)
##### Record identity
- **Record ID:** NBT-EVT-063-LS
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-063-01, NBT-EVT-063-07
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Level script 618, single entry of kind variableValue, evaluated each time the map is entered/loaded (Inferred from the kind name; kind semantics not documented in this scope)
- **Source references:** level script 618 entry 0 (variableId 16646 = 0x4106 VAR_SCENE_PLAYERS_HOUSE_1F), conditions in order: (16646 = 3 -> script 7), (16646 = 0 -> script 1)
- **Evidence status:** Verified (get_script 618)
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Entering the map with VAR_SCENE_PLAYERS_HOUSE_1F (0x4106) holding 3 or 0.
- **OLD conditions and branch priority:** Conditions listed in this order: var 16646 == 3 runs Script 7; var 16646 == 0 runs Script 1. The two are mutually exclusive. Other values (1, 2, 4) run nothing. Writers of 0x4106 in the project script text: 845 Script 1 (sets 1), 845 Script 7 (sets 4), 842 (NBT outdoor script file, header 60; sets 2), 825 (Hall of Fame entry script per docs/gms-debug-rules.md line 110; sets 3). No script sets it back to 0, so 0 is the new-game default (initial value; Inferred: nothing in the text scripts sets 0). Readers: this level script and level script 615 entry 1 (header 60: 16646 == 1 runs Script 4, see NBT-EVT-060-LS1); no `CompareVarValue` on 0x4106 in script text (reader list corrected by the 2026-10-12 re-check against `get_script 615`).
- **OLD event sequence:** (1) Map load. (2) var==3 -> Script 7 (NBT-EVT-063-07); var==0 -> Script 1 (NBT-EVT-063-01). (3)-(6) as those scripts. (7) None.
- **OLD state changes:** None by itself.
- **OLD repeat/completion behavior:** Script 1 sets var to 1, Script 7 sets it to 4, so each fires once per value cycle; Hall of Fame (file 825) sets 3 again, so Script 7 can run after each Hall of Fame clear only until it sets 4 (if 825 sets 3 each time it runs; not verified beyond the single SetVar 3 line).
- **OLD dependencies and shared-resource effects:** Shares VAR_SCENE_PLAYERS_HOUSE_1F with file 842 and file 825.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** level script 618 entry 0 (set_script `levelScript` replaces the whole trigger list)
- **Other affected callers or records:** NBT-EVT-063-01, NBT-EVT-063-07; header 63 `levelScriptId` 618.
- **Unresolved questions:** Exact time the variableValue entry is evaluated (map entry vs every frame); the initial value of var 0x4106 on a new game (assumed 0); whether the engine (hg-engine) touches it.
- **Validation needed:** Emulator: new game starts script 1 on entering this map; Hall of Fame then re-entry starts script 7.

#### NBT-EVT-063-01 — New-game scene: Mom gives Bag, Trainer Card, Save and Options buttons
##### Record identity
- **Record ID:** NBT-EVT-063-01
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-063-LS, NBT-DLG-063-01a to NBT-DLG-063-01f, NBT-EVT-063-02
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Level script 618 (var 16646 == 0) fires Script 1 automatically; speaker is the overworld idx 0 NPC (owID 0, sprite 365, Mom; Inferred from "Our acquaintance, Professor Elm ... right next door to us" and Script 2 calling her money saver)
- **Source references:** script file 845 Script#1; level script 618; text archive 545 msgs 0-5; Actions 1-4
- **Evidence status:** Verified (script, text); Mom identity Inferred
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-063-01a to NBT-DLG-063-01f.
- **OLD raw message data:** see dialogue records (545:0 male / 545:1 female, 545:2, 545:3, 545:4, 545:5).
- **OLD trigger:** Automatic on entering header 63 while VAR_SCENE_PLAYERS_HOUSE_1F (0x4106) == 0 (level script 618).
- **OLD conditions and branch priority:** Only var 16646 == 0 via NBT-EVT-063-LS. Direct check: that var. Indirect prerequisite: none. Message 0 vs 1 chosen by player gender. Reachability class: Referenced and apparently reachable (it is the opening scene of the new game; new-game spawn is on map 64 per brief).
- **OLD event sequence:** (1) Level-script trigger. (2) `MecScript`; `LockAll`; `Movement Player Action#1` (Delay4 1, WalkOnSpotSouth8 1: player turns to face south); `Movement Overworld.0 Action#2` (WalkOnSpotNorth8 1: Mom turns north); `WaitMovement`; `CommonScript 2036` (see GLB-RTN-2036); `WaitTime 30 0x800C`; `Movement Overworld.0 Action#3` (WalkNorth8 2, WalkWest8 3, WalkNorth8 1); `WaitMovement`; `TextPlayerName 0`; `GenderMessage 0 1` (NBT-DLG-063-01a male / 01b female); `SetFlag 283` (FLAG_GOT_BAG); `PlaySound SEQ_SE_PL_KIRAKIRA`; `WaitSound`; `Message 2` (NBT-DLG-063-01c Trainer Card); `SetFlag 284` (FLAG_GOT_TRAINER_CARD); `PlaySound SEQ_SE_PL_KIRAKIRA`; `WaitSound`; `Message 3` (01d Save); `SetFlag 285` (FLAG_GOT_SAVE_BUTTON); `PlaySound SEQ_SE_PL_KIRAKIRA`; `WaitSound`; `Message 4` (01e); `SetFlag 286` (FLAG_GOT_OPTIONS_BUTTON); `PlaySound SEQ_SE_PL_KIRAKIRA`; `WaitSound`; `Message 5` (01f); `CloseMessage`; `WaitTime 15 0x800C`; `Movement Overworld.0 Action#4` (WalkOnSpotSouth8 1, WalkSouth8 3, WalkEast8 3, WalkOnSpotNorth8 1); `WaitMovement`; `CommonScript 2038` (see GLB-RTN-2038); `SetVar 0x4106 1`; `ReleaseAll`; `End`. (3) No branches or choices. (4) Player locked; Mom walks up, speaks, walks back to her spot and faces north; four chimes; music via the two common scripts. (5) Sets flags 283, 284, 285, 286 and VAR_SCENE_PLAYERS_HOUSE_1F = 1. (6) Not repeatable once var is 1. (7) CommonScript 2036 and 2038 (GLB-RTN-2036, GLB-RTN-2038).
- **OLD state changes:** Flags 283, 284, 285, 286 set; var 0x4106 = 1. Writers of these flags outside file 845: none found in project script text (checked decimal forms); readers outside: none found in script text (the engine presumably reads them to enable the Bag / Trainer Card / Save / Options touch-screen buttons: Inferred from flag names).
- **OLD repeat/completion behavior:** Once per new game (var 0 -> 1). Does not rerun while var is 1, 2, 4 or 3 (3 runs Script 7).
- **OLD dependencies and shared-resource effects:** GLB-RTN-2036, GLB-RTN-2038; flags 283-286; var 0x4106 (also written by files 842, 825).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 845 Script#1 and Actions 1-4; level script 618; text archive 545 msgs 0-5
- **Other affected callers or records:** NBT-EVT-063-LS. Script 7 (NBT-EVT-063-07) reuses Actions 1-3 and 4 as well as CommonScripts 2036 and 2038; editing Actions 1-4 changes both. Flags 283-286 are read by the engine only (not by other scripts found).
- **Unresolved questions:** What flags 283-286 do in the engine (Inferred button unlocks); how the opening cutscene hands control to this map from the map 64 spawn (not in this script).
- **Validation needed:** New game run to this scene; confirm Bag/Trainer Card/Save/Options buttons only appear after it.

#### NBT-DLG-063-01a — Mom opening line, male player
##### Record identity
- **Record ID:** NBT-DLG-063-01a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-01
- **Related record IDs:** NBT-DLG-063-01b
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom (sprite 365) via NBT-EVT-063-01
- **Source references:** script file 845 Script#1 `GenderMessage 0 1` (male slot = msg 0); text archive 545 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Hi, <player>! / You’re finally awake. /// Your friend Lyra was just here. // She was playing hide-and-seek with / her MARILL. // Oh, I almost forgot! Our acquaintance, / Professor Elm, was looking for you. // He said he had a favor to ask of you. // You know where the lab is, right? / It’s right next door to us. // By the way, do you have everything / you need to go out? /// Here, use this Bag to carry things... //
- **OLD raw message data:** `Hi, {STRVAR_1, 3, 0, 0}!\nYou’re finally awake.\fYour friend Lyra was just here.\rShe was playing hide-and-seek with\nher MARILL.\rOh, I almost forgot! Our acquaintance,\nProfessor Elm, was looking for you.\rHe said he had a favor to ask of you.\rYou know where the lab is, right?\nIt’s right next door to us.\rBy the way, do you have everything\nyou need to go out?\fHere, use this Bag to carry things...\r`
- **OLD trigger:** Shown by NBT-EVT-063-01 when the player is male.
- **OLD conditions and branch priority:** Gender only (plus NBT-EVT-063-01 conditions). Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** NBT-EVT-063-01 step (2), before `SetFlag 283`.
- **OLD state changes:** None by the message (flag 283 set right after in the script).
- **OLD repeat/completion behavior:** Once per new game.
- **OLD dependencies and shared-resource effects:** Player name variable; "Lyra" and "MARILL" are literal text in this variant (male player's friend).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 0
- **Other affected callers or records:** None found (only Script#1 uses msg 0).
- **Unresolved questions:** None.
- **Validation needed:** Text fits the box after editing; edit msg 1 in step.

#### NBT-DLG-063-01b — Mom opening line, female player
##### Record identity
- **Record ID:** NBT-DLG-063-01b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-01
- **Related record IDs:** NBT-DLG-063-01a
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-01
- **Source references:** script file 845 Script#1 `GenderMessage 0 1` (female slot = msg 1); text archive 545 msg 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Same as 01a except: "Your friend Ethan was just here. // He was playing hide-and-seek with / his MARILL." Full text: Hi, <player>! / You’re finally awake. /// Your friend Ethan was just here. // He was playing hide-and-seek with / his MARILL. // Oh, I almost forgot! Our acquaintance, / Professor Elm, was looking for you. // He said he had a favor to ask of you. // You know where the lab is, right? / It’s right next door to us. // By the way, do you have everything / you need to go out? /// Here, use this Bag to carry things... //
- **OLD raw message data:** `Hi, {STRVAR_1, 3, 0, 0}!\nYou’re finally awake.\fYour friend Ethan was just here.\rHe was playing hide-and-seek with\nhis MARILL.\rOh, I almost forgot! Our acquaintance,\nProfessor Elm, was looking for you.\rHe said he had a favor to ask of you.\rYou know where the lab is, right?\nIt’s right next door to us.\rBy the way, do you have everything\nyou need to go out?\fHere, use this Bag to carry things...\r`
- **OLD trigger:** Shown by NBT-EVT-063-01 when the player is female.
- **OLD conditions and branch priority:** Gender only. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** NBT-EVT-063-01 step (2), before `SetFlag 283`.
- **OLD state changes:** None by the message.
- **OLD repeat/completion behavior:** Once per new game.
- **OLD dependencies and shared-resource effects:** Player name variable.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 1
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** As 01a.

#### NBT-DLG-063-01c — Mom: Trainer Card
##### Record identity
- **Record ID:** NBT-DLG-063-01c
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-01
- **Related record IDs:** NBT-DLG-063-01d, NBT-DLG-063-01e, NBT-DLG-063-01f
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-01
- **Source references:** script file 845 Script#1 `Message 2` (after `SetFlag 284`, chime); text archive 545 msg 2
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** This is your Trainer Card... //
- **OLD raw message data:** `This is your Trainer Card...\r`
- **OLD trigger:** Shown by NBT-EVT-063-01 after the Bag line.
- **OLD conditions and branch priority:** Unconditional within the scene. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** NBT-EVT-063-01 step (2).
- **OLD state changes:** None by the message.
- **OLD repeat/completion behavior:** Once per new game.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 2
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-063-01d — Mom: Save button
##### Record identity
- **Record ID:** NBT-DLG-063-01d
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-01
- **Related record IDs:** NBT-DLG-063-01c, NBT-DLG-063-01e, NBT-DLG-063-01f
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-01
- **Source references:** script file 845 Script#1 `Message 3` (after `SetFlag 285`, chime); text archive 545 msg 3
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Here you can save a record of / your progress... //
- **OLD raw message data:** `Here you can save a record of\nyour progress...\r`
- **OLD trigger:** Shown by NBT-EVT-063-01 after the Trainer Card line.
- **OLD conditions and branch priority:** Unconditional within the scene. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** NBT-EVT-063-01 step (2).
- **OLD state changes:** None by the message.
- **OLD repeat/completion behavior:** Once per new game.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 3
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-063-01e — Mom: Options button
##### Record identity
- **Record ID:** NBT-DLG-063-01e
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-01
- **Related record IDs:** NBT-DLG-063-01d, NBT-DLG-063-01f
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-01
- **Source references:** script file 845 Script#1 `Message 4` (after `SetFlag 286`, chime); text archive 545 msg 4
- **Evidence status:** Verified (text content; that "these" are the Options button is Inferred from flag 286 FLAG_GOT_OPTIONS_BUTTON being set at this point)
##### OLD — Current content
- **OLD dialogue:** These are also rather helpful... //
- **OLD raw message data:** `These are also rather helpful...\r`
- **OLD trigger:** Shown by NBT-EVT-063-01 after the Save line.
- **OLD conditions and branch priority:** Unconditional within the scene. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** NBT-EVT-063-01 step (2).
- **OLD state changes:** None by the message.
- **OLD repeat/completion behavior:** Once per new game.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 4
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-063-01f — Mom: touch the buttons
##### Record identity
- **Record ID:** NBT-DLG-063-01f
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-01
- **Related record IDs:** NBT-DLG-063-01e
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-01
- **Source references:** script file 845 Script#1 `Message 5` (after the fourth chime), followed by `CloseMessage`; text archive 545 msg 5
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Just try touching the buttons, and / you’ll know what to do in no time. //
- **OLD raw message data:** `Just try touching the buttons, and\nyou’ll know what to do in no time.\r`
- **OLD trigger:** Shown by NBT-EVT-063-01 as the last line of the scene.
- **OLD conditions and branch priority:** Unconditional within the scene. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** NBT-EVT-063-01 step (2).
- **OLD state changes:** None by the message.
- **OLD repeat/completion behavior:** Once per new game.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 5
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-063-02 — Mom: talk (starter/Pokégear gift, Mom's savings, post-game lines)
##### Record identity
- **Record ID:** NBT-EVT-063-02
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-063-02a to NBT-DLG-063-02x, NBT-EVT-063-01, NBT-EVT-063-07
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Overworld idx 0 (owID 0, sprite 365, at 6,7, faces 3, movement 0), talk trigger. Speaker is Mom (Inferred from lines "I’ll save some of it for you", "Welcome home", "I’ve kept your room tidy" and flag name FLAG_SYS_MOMS_SAVINGS).
- **Source references:** script file 845 Script#2 and Functions 1-25 (all reached from it); event file 60 overworlds idx 0; text archive 545 msgs 6-18, 20-28, 29-32, 34
- **Evidence status:** Verified (script/text); speaker identity Inferred
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-063-02a to NBT-DLG-063-02x.
- **OLD raw message data:** see the dialogue records.
- **OLD trigger:** Player presses A facing overworld idx 0. No lock/fanfare happens before the first three checks (they run before `LockAll`).
- **OLD conditions and branch priority:** Evaluated in this order, first match wins. (1) `CheckFlag 2404` (FLAG_GAME_CLEAR) set -> Function#1. (2) otherwise `CompareVarValue 0x4108 4`, `JumpIf GREATER/EQUAL` i.e. VAR_SCENE_ELMS_LAB >= 4 -> Function#2. (3) otherwise `CheckFlag 106` (FLAG_GOT_STARTER) set -> Function#3. (4) otherwise default lines: `PlayFanfare`, `LockAll`, `FacePlayer`, `Message 6`. Function#1: `CheckItem ITEM_SS_TICKET 1 0x800C`; `CompareVarValue 0x800C 0`; EQUAL (no ticket) -> Function#4 (Message 34); else `Jump Function#2`. So after Hall of Fame (2404 set) Mom reaches the savings logic only if the player holds an S.S. Ticket. Function#2 order: `CheckFlag 167` (FLAG_TALKED_TO_MOM_AFTER_NAMING_RIVAL) set -> Function#5 (savings menu); else `CheckBadge 0 0x4000` then `CompareVarValue 0x4000 0`; DIFFERENT (badge 0 owned) -> Function#6, else `Message 15` then `Jump Function#7`. Function#3: `CheckFlag 156` (FLAG_GOT_POKEGEAR) set -> Function#8 (Message 14), else Pokégear gift scene. Direct checks: flags 2404, 106, 156, 167; var 0x4108; item ITEM_SS_TICKET; badge 0. Indirect prerequisites: none found. Readers/writers: flag 2404 read in many files (e.g. 0003, 0022, 0025, 0115, 0152, 0260, 0824, 0825, 0843 ...), no `SetFlag 2404` anywhere in script text (writer is not in project script text: Unresolved, probably engine/credits code); flag 106 set in file 843 (header: Elm's lab, NBT-range file), read in 842/843/849; flag 156 set only here, read in file 842 Script#3 (NBT outdoor, header 60); flag 167 set here and in file 227 (Route 30, header 34), read only here; flag 2438 set/cleared only here; var 0x4108 written by 843, 858, 859, 112, 229 and read by 843, 845, 848, 851, 852 (a many-file scene counter); var 0x4095 (VAR_SCENE_ROUTE_30_PHONE_CALL) set to 0 here (Function#6/#7), set to 1 in 843, set to 0 in 227. Object visibility flag: 0 (always present). Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** (1) Talk. (2) Branch per conditions above. Pokégear gift (Function#3, flag 106 set, flag 156 clear, flag 2404 clear, 0x4108 < 4): `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`, `TextPlayerName 0`, `Message 7` (02g), `TextPlayerName 0`, `Message 8` (02h), `SetFlag 156`, `PlaySound SEQ_ME_ITEM`, `WaitSound`, `Message 9` (02i), `Message 10` (02j, text contains {YESNO}), then `OpenTouchScreen`, `YesNoTouchScreen 0x800C`, `CloseTouchScreen`; if result != 0 -> Function#9: `Message 12` (02l), `Message 13` (02m), `WaitABPad`, `CloseMessage`, `ReleaseAll`; if result == 0 -> `Message 11` (02k), `Jump Function#10`: `Message 13`, `WaitABPad`, `CloseMessage`, `ReleaseAll`. Already has Pokégear -> Function#8: `Message 14` (02n), `WaitButton`, `CloseMessage`, `ReleaseAll`. First savings offer (flag 167 clear): no badge -> `Message 15` (02c) then Function#7; badge 0 -> Function#6: `TextPlayerName 0`, `Message 16` (02d). Both then `SetFlag 167`, `SetVar 0x4095 0`, `OpenTouchScreen`, `YesNoTouchScreen 0x800C`, `CloseTouchScreen`; result != 0 (No) -> Function#15: `Message 18` (02f), `ClearFlag 2438`, `WaitButton`, `CloseMessage`, `ReleaseAll`; result == 0 (Yes) -> `Message 17` (02e), `SetFlag 2438`, `Jump Function#16`: `WaitButton`, `CloseMessage`, `ReleaseAll`. Savings menu (Function#5, flag 167 set): `Message 20` (02o), `ShowMomMoney 1 1`, `OpenTouchScreen`, `MultiTouchLocalText 1 1 0 1 0x800C`, `CreateMultiTouchBox` for text 29 id 0 (WITHDRAW), 30 id 1 (DEPOSIT MONEY), 31 id 2 (CHANGE), 32 id 3 (EXIT) (NBT-DLG-063-02p), `CloseMultiTouch`, `SetVarFromVariable 0x8008 0x800C`; value 0 -> Function#11 (withdraw-labelled path), 1 -> Function#12 (deposit-labelled path), 2 -> Function#13 (CHANGE), else (3) -> Function#14 (EXIT: `HideMomMoney`, `CloseTouchScreen`, `Message 21` (02q), `WaitButton`, `CloseMessage`, `ReleaseAll`). Function#11: `CheckMoneyFull 1 0x800C`; ==1 -> Function#17 (`CloseTouchScreen`, `HideMomMoney`, `Message 28` (02x)); `CheckMomMoneyBalance 0x800C 1`; ==0 -> Function#18 (`Message 22` (02r)); `TakeMomMoney 1 0x800C`, `HideMomMoney`, `CloseTouchScreen`, `SetVarFromVariable 0x8008 0x800C`; ==0 -> Function#19 (`CloseMessage`, `WaitTime 8`, `PlayFanfare SEQ_SE_GS_OKOZUKAI`, `TextPlayerName 0`, `Message 24` (02t)); ==1 -> Function#20 (`Message 21` (02q)). Function#12: `CheckMoneyFull 0 0x800C`; ==1 -> Function#21 (`Message 27` (02w)); `CompareMoneyFlex 0x800C 1`; ==0 -> Function#22 (`Message 26` (02v)); `TakeMomMoney 0 0x800C`, `HideMomMoney`, `CloseTouchScreen`, `SetVarFromVariable 0x8008 0x800C`; ==0 -> Function#23 (`CloseMessage`, `WaitTime 8`, `PlayFanfare SEQ_SE_GS_OKOZUKAI`, `Message 23` (02s)); ==1 -> Function#20. Function#13: `Message 25` (02u), `OpenTouchScreen`, `YesNoTouchScreen 0x800C`, `CloseTouchScreen`, `HideMomMoney`; result != 0 -> Function#24 (`Message 18` (02f), `ClearFlag 2438`); result == 0 -> `TextPlayerName 0`, `Message 17` (02e), `SetFlag 2438`, `Jump Function#25`. All terminal functions end `WaitButton`/`CloseMessage`/`ReleaseAll`/`End` (Function#4, 8, 9, 10, 14, 15, 16, 17-25). Which of Function#11/#12 is withdraw vs deposit is Inferred from the order of the labels (box id 0 = WITHDRAW) and from which function uses `CheckMomMoneyBalance`; the exact semantics of `CheckMoneyFull`, `TakeMomMoney`, `CheckMomMoneyBalance`, `ShowMomMoney` are not documented in docs/scripting-reference.md (Unresolved). (3) Choices: yes/no after the savings offer and CHANGE; four-option touch menu; yes/no after the Pokégear intro. Yes = result 0 is Inferred from the outcome texts. (4) `LockAll`/`FacePlayer` in each branch; no movement. (5) Sets flag 156, 167, 2438 (set/clear), var 0x4095 = 0; money transfers via `TakeMomMoney`. (6) Repeatable; Pokégear and 167 offers happen once (flags set). (7) No `CommonScript` calls; global touch-screen/money commands only (not GLB records).
- **OLD state changes:** Flag 156 set (Pokégear obtained); flag 167 set; flag 2438 (Mom's savings) set on Yes, cleared on No; var 0x4095 set to 0; player/Mom money changed by `TakeMomMoney`.
- **OLD repeat/completion behavior:** Repeatable on every talk; branch changes as flags/vars progress.
- **OLD dependencies and shared-resource effects:** Flags 106, 156, 167, 2404, 2438; vars 0x4108, 0x4095, 0x4000 (scratch); item ITEM_SS_TICKET; badge 0; Mom's-money engine state.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 845 Script#2 and Functions 1-25; event file 60 overworld idx 0; text archive 545
- **Other affected callers or records:** Functions 1-25 are called only from Script 2 or from each other (confirmed by reading the listing); Script 7 / Script 1 do not call them. No other file calls into file 845.
- **Unresolved questions:** Writer of FLAG_GAME_CLEAR (2404); whether hg-engine modifies Mom's savings logic; meaning of `TakeMomMoney` result values.
- **Validation needed:** Emulator: run each branch (pre-starter, post-starter, with/without badge, post game with/without S.S. Ticket).

#### NBT-DLG-063-02a — Mom: waiting for Elm
##### Record identity
- **Record ID:** NBT-DLG-063-02a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02g
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 (default branch)
- **Source references:** script file 845 Script#2 `Message 6`; text archive 545 msg 6
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm has been waiting for / you, dear. Please, go and help him.
- **OLD raw message data:** `Professor Elm has been waiting for\nyou, dear. Please, go and help him.`
- **OLD trigger:** Shown by NBT-EVT-063-02 when flag 2404 is clear AND var 0x4108 < 4 AND flag 106 is clear.
- **OLD conditions and branch priority:** Last fall-through of the three checks. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Shown by NBT-EVT-063-02 step (2) default branch.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk until the starter flag 106 is set.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 6
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-063-02b — Mom: visit the lab (after game clear, no S.S. Ticket)
##### Record identity
- **Record ID:** NBT-DLG-063-02b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-EVT-063-07
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#4
- **Source references:** script file 845 Function#1 -> Function#4 `Message 34`; text archive 545 msg 34
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Professor Elm told me that / he has something to give you. / Why don’t you visit his lab?  (page break after "give you.")
- **OLD raw message data:** `Professor Elm told me that\nhe has something to give you.\fWhy don’t you visit his lab?`
- **OLD trigger:** Shown by NBT-EVT-063-02 when flag 2404 is set AND the player has no ITEM_SS_TICKET (`CheckItem ITEM_SS_TICKET 1`, result 0).
- **OLD conditions and branch priority:** First check in Script#2 (flag 2404), then item check. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Function#4: `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`, `Message 34`, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk while the condition holds.
- **OLD dependencies and shared-resource effects:** ITEM_SS_TICKET possession (who grants it was not traced in this section).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 34
- **Other affected callers or records:** None found.
- **Unresolved questions:** Who gives the S.S. Ticket (not traced).
- **Validation needed:** Post-game test without ticket.

#### NBT-DLG-063-02c — Mom: leaving on an adventure, savings offer (no Zephyr Badge)
##### Record identity
- **Record ID:** NBT-DLG-063-02c
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02d, NBT-DLG-063-02e, NBT-DLG-063-02f
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#2
- **Source references:** script file 845 Function#2 `Message 15`; text archive 545 msg 15
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** ... / So, you’re leaving on an adventure... // OK! I’ll help, too. / But what can I do for you? // I know! / Every time you receive prize money, /// I’ll save some of it for you. // On a long journey, money’s important. // Do you want me to save / your money for you? [Yes/No]
- **OLD raw message data:** `...\nSo, you’re leaving on an adventure...\rOK! I’ll help, too.\nBut what can I do for you?\rI know!\nEvery time you receive prize money,\fI’ll save some of it for you.\rOn a long journey, money’s important.\rDo you want me to save\nyour money for you? {YESNO, 0, 0}`
- **OLD trigger:** Shown by NBT-EVT-063-02 Function#2 when (flag 2404 clear AND var 0x4108 >= 4) OR (flag 2404 set AND has ITEM_SS_TICKET), AND flag 167 clear, AND badge 0 not owned (`CheckBadge 0 0x4000` result 0). Prerequisite var 0x4108 >= 4 and badge states are indirect (set by Elm's lab/gym scripts, not traced).
- **OLD conditions and branch priority:** After the flag-167 check. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Function#2 -> Message 15 -> Jump Function#7 (SetFlag 167, SetVar 0x4095 0, YesNo). Outcomes: Yes -> NBT-DLG-063-02e; No -> NBT-DLG-063-02f.
- **OLD state changes:** Flags 167 set, var 0x4095 = 0 (in Function#7).
- **OLD repeat/completion behavior:** Once (flag 167 then set).
- **OLD dependencies and shared-resource effects:** Badge 0; flags 167, 2438.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 15
- **Other affected callers or records:** None found.
- **Unresolved questions:** Which of the two {YESNO} text token and the separate `YesNoTouchScreen` actually draws the choice (script calls YesNoTouchScreen, so the token is probably inert; Inferred).
- **Validation needed:** In-game.

#### NBT-DLG-063-02d — Mom: savings offer (Zephyr Badge owned)
##### Record identity
- **Record ID:** NBT-DLG-063-02d
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02c, NBT-DLG-063-02e, NBT-DLG-063-02f
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#6
- **Source references:** script file 845 Function#6 `TextPlayerName 0`, `Message 16`; text archive 545 msg 16
- **Evidence status:** Verified (badge index 0 = first badge is Inferred; `CheckBadge badge_id` per docs line 173)
##### OLD — Current content
- **OLD dialogue:** I want to support you on your / adventure, <player>. /// OK! I’ll help, too. /// But what can I do for you? // I know! // Every time you receive prize money, / I’ll save some of it for you. // On a long journey, money’s important. / Do you want me to save /// your money for you? [Yes/No]
- **OLD raw message data:** `I want to support you on your\nadventure, {STRVAR_1, 3, 0, 0}.\fOK! I’ll help, too.\fBut what can I do for you?\rI know!\rEvery time you receive prize money,\nI’ll save some of it for you.\rOn a long journey, money’s important.\nDo you want me to save\fyour money for you? {YESNO, 0, 0}`
- **OLD trigger:** As 02c but `CheckBadge 0 0x4000` leaves 0x4000 != 0 (badge 0 owned).
- **OLD conditions and branch priority:** After the flag-167 check, before the no-badge line. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Function#6: TextPlayerName 0, Message 16, SetFlag 167, SetVar 0x4095 0, YesNo; Yes -> NBT-DLG-063-02e, No -> NBT-DLG-063-02f.
- **OLD state changes:** Flag 167, var 0x4095 = 0.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Badge 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 16
- **Other affected callers or records:** None found.
- **Unresolved questions:** None beyond 02c.
- **Validation needed:** In-game.

#### NBT-DLG-063-02e — Mom: "I'll take care of your money" (Yes)
##### Record identity
- **Record ID:** NBT-DLG-063-02e
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02f, NBT-DLG-063-02u
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#6/#7 and Function#13
- **Source references:** script file 845 Function#6 / Function#7 (after `JumpIf DIFFERENT Function#15` not taken) and Function#13 (`TextPlayerName 0`, `Message 17`); text archive 545 msg 17
- **Evidence status:** Verified (Yes = result 0 Inferred)
##### OLD — Current content
- **OLD dialogue:** OK, I’ll take care of your money. // Be careful. // Pokémon are your friends. / When you work as a team, /// you can accomplish anything! /// Now, go on!
- **OLD raw message data:** `OK, I’ll take care of your money.\rBe careful.\rPokémon are your friends.\nWhen you work as a team,\fyou can accomplish anything!\fNow, go on!`
- **OLD trigger:** Player answers Yes (`YesNoTouchScreen` result 0) to the first savings offer, or to the CHANGE prompt (NBT-DLG-063-02u).
- **OLD conditions and branch priority:** Result == 0 (the DIFFERENT jump to Function#15/#24 is not taken). Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `Message 17`, `SetFlag 2438` (savings on), then Function#16/#25: `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** Flag 2438 set.
- **OLD repeat/completion behavior:** Whenever savings are switched on.
- **OLD dependencies and shared-resource effects:** Flag 2438 read by the engine (Mom's savings of prize money; Inferred, no script reader found).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 17
- **Other affected callers or records:** Used at three places in file 845 (Function#6, Function#7, Function#13).
- **Unresolved questions:** None.
- **Validation needed:** Both first offer and CHANGE.

#### NBT-DLG-063-02f — Mom: "OK, but be careful" (No)
##### Record identity
- **Record ID:** NBT-DLG-063-02f
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02e
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#15 and Function#24
- **Source references:** script file 845 Function#15 and Function#24 `Message 18` then `ClearFlag 2438`; text archive 545 msg 18
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** OK, but be careful out there. // Pokémon are your friends. / When you work as a team, /// you can accomplish anything! /// Now, go on!
- **OLD raw message data:** `OK, but be careful out there.\rPokémon are your friends.\nWhen you work as a team,\fyou can accomplish anything!\fNow, go on!`
- **OLD trigger:** Player answers No (result != 0) to the first savings offer or the CHANGE prompt.
- **OLD conditions and branch priority:** `CompareVarValue 0x800C 0` DIFFERENT. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `Message 18`, `ClearFlag 2438`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** Flag 2438 cleared.
- **OLD repeat/completion behavior:** Whenever savings are switched off.
- **OLD dependencies and shared-resource effects:** Flag 2438.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 18
- **Other affected callers or records:** Two identical call sites (Function#15 and Function#24).
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-063-02g — Mom: Pokégear intro, part 1
##### Record identity
- **Record ID:** NBT-DLG-063-02g
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02h, NBT-DLG-063-02i
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#3
- **Source references:** script file 845 Function#3 `TextPlayerName 0`, `Message 7`; text archive 545 msg 7
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Oh! <player>! / That’s a cute Pokémon you have. // Professor Elm must have given it / to you? // Oh, Professor Elm has a task for you, / you say? /// What kind of task? // ... // I see. That sounds a little difficult. // But when someone makes that kind of / request of you, it must be important! // Oh, that’s right! / I completely forgot! // Your Pokégear came back from the / repair shop! // Here you go! //
- **OLD raw message data:** `Oh! {STRVAR_1, 3, 0, 0}!\nThat’s a cute Pokémon you have.\rProfessor Elm must have given it\nto you?\rOh, Professor Elm has a task for you,\nyou say?\fWhat kind of task?\r...\rI see. That sounds a little difficult.\rBut when someone makes that kind of\nrequest of you, it must be important!\rOh, that’s right!\nI completely forgot!\rYour Pokégear came back from the\nrepair shop!\rHere you go!\r`
- **OLD trigger:** Shown by NBT-EVT-063-02 when flag 2404 clear AND var 0x4108 < 4 AND flag 106 set AND flag 156 clear.
- **OLD conditions and branch priority:** Third check; inside Function#3 flag 156 checked first. Reachability class: Referenced and apparently reachable. Note: if var 0x4108 reaches 4 before the player talks to Mom, the gift never occurs here (check order); flag 156 is also checked by file 842 Script#3, which suggests another route to the Pokégear (not traced).
- **OLD event sequence:** Function#3 step order as in NBT-EVT-063-02.
- **OLD state changes:** None by the message; flag 156 set one message later.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Player name; flags 106, 156.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 7
- **Other affected callers or records:** None found.
- **Unresolved questions:** Header-60 route to flag 156 (file 842 Script#3).
- **Validation needed:** In-game after receiving a starter.

#### NBT-DLG-063-02h — Pokégear received
##### Record identity
- **Record ID:** NBT-DLG-063-02h
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02g, NBT-DLG-063-02i
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** System message via NBT-EVT-063-02 Function#3
- **Source references:** script file 845 Function#3 `TextPlayerName 0`, `Message 8`, then `SetFlag 156`, `PlaySound SEQ_ME_ITEM`, `WaitSound`; text archive 545 msg 8
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** <player> received / the Pokégear! //
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0} received\nthe Pokégear!\r`
- **OLD trigger:** Same as 02g.
- **OLD conditions and branch priority:** As 02g. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Function#3 step order as in NBT-EVT-063-02: message, then flag 156 set, item jingle.
- **OLD state changes:** Flag 156 set immediately after the message is queued (no item is added to the Bag; Pokégear is represented only by flag 156: Inferred from flag name).
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Flag 156 FLAG_GOT_POKEGEAR.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 8
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-063-02i — Mom: Pokégear explanation
##### Record identity
- **Record ID:** NBT-DLG-063-02i
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02h, NBT-DLG-063-02j
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#3
- **Source references:** script file 845 Function#3 `Message 9`; text archive 545 msg 9
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** The Pokémon Gear... / or Pokégear, as it’s often called, /// is what every Trainer should have. //
- **OLD raw message data:** `The Pokémon Gear...\nor Pokégear, as it’s often called,\fis what every Trainer should have.\r`
- **OLD trigger:** After 02h in the same Function#3 run.
- **OLD conditions and branch priority:** As 02g. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Function#3 step order.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 9
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-063-02j — Mom: "Do you remember how?" (Yes/No)
##### Record identity
- **Record ID:** NBT-DLG-063-02j
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02k, NBT-DLG-063-02l, NBT-DLG-063-02m
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#3
- **Source references:** script file 845 Function#3 `Message 10`, `OpenTouchScreen`, `YesNoTouchScreen 0x800C`, `CloseTouchScreen`, `CompareVarValue 0x800C 0`, `JumpIf DIFFERENT Function#9`; text archive 545 msg 10
- **Evidence status:** Verified (Yes = result 0 Inferred)
##### OLD — Current content
- **OLD dialogue:** Guess what? / You can use the Pokégear to make a /// phone call, too. /// Do you remember how? [Yes/No]. Choice outcomes: result 0 (Yes, Inferred) -> NBT-DLG-063-02k then NBT-DLG-063-02m; result != 0 (No) -> NBT-DLG-063-02l then NBT-DLG-063-02m.
- **OLD raw message data:** `Guess what?\nYou can use the Pokégear to make a\fphone call, too.\fDo you remember how? {YESNO, 0, 0}`
- **OLD trigger:** After 02i in Function#3.
- **OLD conditions and branch priority:** As 02g. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Function#3; choice branches to Function#9 (No) or inline `Message 11` + Function#10 (Yes).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Touch-screen Yes/No.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 10
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Confirm which button maps to which branch.

#### NBT-DLG-063-02k — Mom: phone reminder (answered Yes)
##### Record identity
- **Record ID:** NBT-DLG-063-02k
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02j, NBT-DLG-063-02m
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#3
- **Source references:** script file 845 Function#3 `Message 11`, `Jump Function#10`; text archive 545 msg 11
- **Evidence status:** Verified (branch = Yes Inferred)
##### OLD — Current content
- **OLD dialogue:** Just power on the Pokégear and / touch the telephone button, OK? //
- **OLD raw message data:** `Just power on the Pokégear and\ntouch the telephone button, OK?\r`
- **OLD trigger:** `CompareVarValue 0x800C 0` equal (result 0) after 02j.
- **OLD conditions and branch priority:** After 02j choice. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `Message 11`, Function#10: `Message 13`, `WaitABPad`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 11
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-063-02l — Mom: how to call (answered No)
##### Record identity
- **Record ID:** NBT-DLG-063-02l
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02j, NBT-DLG-063-02m
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#9
- **Source references:** script file 845 Function#9 `Message 12`; text archive 545 msg 12
- **Evidence status:** Verified (branch = No Inferred)
##### OLD — Current content
- **OLD dialogue:** Select the POKéGEAR button on the / Touch Screen. Then select the /// telephone button. //
- **OLD raw message data:** `Select the POKéGEAR button on the\nTouch Screen. Then select the\ftelephone button.\r`
- **OLD trigger:** Result != 0 after 02j.
- **OLD conditions and branch priority:** After 02j choice. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Function#9: `Message 12`, `Message 13`, `WaitABPad`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 12
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-063-02m — Mom: phone closing line
##### Record identity
- **Record ID:** NBT-DLG-063-02m
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02k, NBT-DLG-063-02l
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#9 and Function#10
- **Source references:** script file 845 Function#9 and Function#10 `Message 13`, `WaitABPad`; text archive 545 msg 13
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** The names of the people you can call / are automatically registered. // Just select one to give him or her / a call. // Wow, I can’t believe it’s so easy / to make a phone call!
- **OLD raw message data:** `The names of the people you can call\nare automatically registered.\rJust select one to give him or her\na call.\rWow, I can’t believe it’s so easy\nto make a phone call!`
- **OLD trigger:** After either 02k or 02l, both Yes and No branches.
- **OLD conditions and branch priority:** Always after the choice. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `Message 13`, `WaitABPad`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 13
- **Other affected callers or records:** Two call sites (Function#9, Function#10).
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-063-02n — Mom: directions to Mr. Pokémon's house
##### Record identity
- **Record ID:** NBT-DLG-063-02n
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02g
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#8
- **Source references:** script file 845 Function#3 `CheckFlag 156` -> Function#8 `Message 14`; text archive 545 msg 14
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** What’s wrong? // Did you forget how to get to / Mr. Pokémon’s house? // Go north on Route 30. / Take care, dear.
- **OLD raw message data:** `What’s wrong?\rDid you forget how to get to\nMr. Pokémon’s house?\rGo north on Route 30.\nTake care, dear.`
- **OLD trigger:** Flag 2404 clear AND var 0x4108 < 4 AND flag 106 set AND flag 156 set.
- **OLD conditions and branch priority:** Inside Function#3 first check. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Function#8: `Message 14`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk while condition holds (until var 0x4108 reaches 4).
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 14
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-063-02o — Mom: savings menu greeting
##### Record identity
- **Record ID:** NBT-DLG-063-02o
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02p
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#5
- **Source references:** script file 845 Function#5 `Message 20`; text archive 545 msg 20
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Hi! Welcome home! / You’re doing fine, I see. // I’ve kept your room tidy and clean. / Or... /// Is this about your money? [YESNO token]
- **OLD raw message data:** `Hi! Welcome home!\nYou’re doing fine, I see.\rI’ve kept your room tidy and clean.\nOr...\fIs this about your money? {YESNO, 0, 0}`
- **OLD trigger:** Shown by NBT-EVT-063-02 when flag 167 is set and the Function#2 route is reached (flag 2404 clear with var 0x4108 >= 4, or flag 2404 set with an S.S. Ticket).
- **OLD conditions and branch priority:** First check in Function#2. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `Message 20`, `ShowMomMoney 1 1`, `OpenTouchScreen`, four-option menu (NBT-DLG-063-02p); the text carries a {YESNO} token but the script does not use `YesNoTouchScreen` here (Inferred: the token is not what draws the menu).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk in that state.
- **OLD dependencies and shared-resource effects:** Touch-screen menu and Mom-money display.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 20
- **Other affected callers or records:** None found.
- **Unresolved questions:** Whether the {YESNO} token renders anything.
- **Validation needed:** In-game.

#### NBT-DLG-063-02p — Mom's savings menu button labels
##### Record identity
- **Record ID:** NBT-DLG-063-02p
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02o
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Touch-screen menu via NBT-EVT-063-02 Function#5
- **Source references:** script file 845 Function#5 `CreateMultiTouchBox 29 255 0`, `30 255 1`, `31 255 2`, `32 255 3`; text archive 545 msgs 29, 30, 31, 32
- **Evidence status:** Verified (labels); box semantics of the "255" argument Inferred
##### OLD — Current content
- **OLD dialogue:** Four button labels: 29 = WITHDRAW (id 0); 30 = DEPOSIT MONEY (id 1); 31 = CHANGE (id 2); 32 = EXIT (id 3). Outcomes: id 0 -> Function#11; id 1 -> Function#12; id 2 -> Function#13 (NBT-DLG-063-02u); id 3/other -> Function#14 (NBT-DLG-063-02q).
- **OLD raw message data:** `WITHDRAW` (545:29), `DEPOSIT MONEY` (545:30), `CHANGE` (545:31), `EXIT` (545:32)
- **OLD trigger:** After 02o with the touch menu open.
- **OLD conditions and branch priority:** Chosen button id stored in 0x800C then copied to 0x8008; compared 0, 1, 2, else. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** See NBT-EVT-063-02.
- **OLD state changes:** None until the sub-function runs.
- **OLD repeat/completion behavior:** Each visit.
- **OLD dependencies and shared-resource effects:** Touch-screen UI.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msgs 29-32
- **Other affected callers or records:** None found.
- **Unresolved questions:** Meaning of the 255 argument.
- **Validation needed:** None.

#### NBT-DLG-063-02q — Mom: "Just do what you can"
##### Record identity
- **Record ID:** NBT-DLG-063-02q
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02p
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#14 and Function#20
- **Source references:** script file 845 Function#14 (EXIT) and Function#20 (second result value 1 after a transfer) `Message 21`; text archive 545 msg 21
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Just do what you can.
- **OLD raw message data:** `Just do what you can.`
- **OLD trigger:** EXIT chosen, or `SetVarFromVariable 0x8008 0x800C` equals 1 after `TakeMomMoney` (Inferred: transfer cancelled/zero).
- **OLD conditions and branch priority:** See NBT-EVT-063-02. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `Message 21`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Each time.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 21
- **Other affected callers or records:** Used by Functions 14 and 20.
- **Unresolved questions:** Meaning of TakeMomMoney result 1.
- **Validation needed:** Cancel a transfer in-game.

#### NBT-DLG-063-02r — Mom: no money saved
##### Record identity
- **Record ID:** NBT-DLG-063-02r
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02p
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#18
- **Source references:** script file 845 Function#11 `CheckMomMoneyBalance 0x800C 1` result 0 -> Function#18 `Message 22`; text archive 545 msg 22
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Oh! / You have no money saved.
- **OLD raw message data:** `Oh!\nYou have no money saved.`
- **OLD trigger:** WITHDRAW path with Mom's balance empty.
- **OLD conditions and branch priority:** After the player-money-full check (02x). Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Function#18: `CloseTouchScreen`, `HideMomMoney`, `Message 22`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Each time.
- **OLD dependencies and shared-resource effects:** Mom-money balance.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 22
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-063-02s — Mom: money safe (after deposit)
##### Record identity
- **Record ID:** NBT-DLG-063-02s
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02t
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#23
- **Source references:** script file 845 Function#12 transfer result 0 -> Function#23 `CloseMessage`, `WaitTime 8`, `PlayFanfare SEQ_SE_GS_OKOZUKAI`, `Message 23`; text archive 545 msg 23
- **Evidence status:** Verified (deposit direction Inferred)
##### OLD — Current content
- **OLD dialogue:** Your money’s safe here! / Take care of yourself!
- **OLD raw message data:** `Your money’s safe here!\nTake care of yourself!`
- **OLD trigger:** DEPOSIT-labelled path completes with result 0.
- **OLD conditions and branch priority:** After 02w and 02v checks pass. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Function#23 as above, then `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** Money moved by `TakeMomMoney 0`.
- **OLD repeat/completion behavior:** Each deposit.
- **OLD dependencies and shared-resource effects:** Player money, Mom balance.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 23
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-063-02t — Mom: "think hard how you spend it" (after withdraw)
##### Record identity
- **Record ID:** NBT-DLG-063-02t
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02s
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#19
- **Source references:** script file 845 Function#11 transfer result 0 -> Function#19 `CloseMessage`, `WaitTime 8`, `PlayFanfare SEQ_SE_GS_OKOZUKAI`, `TextPlayerName 0`, `Message 24`; text archive 545 msg 24
- **Evidence status:** Verified (withdraw direction Inferred)
##### OLD — Current content
- **OLD dialogue:** <player> / You should think hard how you spend it!
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0}\nYou should think hard how you spend it!`
- **OLD trigger:** WITHDRAW-labelled path completes with result 0.
- **OLD conditions and branch priority:** After 02x and 02r checks pass. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Function#19 as above then `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** Money moved by `TakeMomMoney 1`.
- **OLD repeat/completion behavior:** Each withdrawal.
- **OLD dependencies and shared-resource effects:** Player money, Mom balance.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 24
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-063-02u — Mom: CHANGE prompt
##### Record identity
- **Record ID:** NBT-DLG-063-02u
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02e, NBT-DLG-063-02f
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#13
- **Source references:** script file 845 Function#13 `Message 25`, `OpenTouchScreen`, `YesNoTouchScreen 0x800C`; text archive 545 msg 25
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Do you want to save some money? [YESNO token]. Yes (result 0) -> NBT-DLG-063-02e and flag 2438 set; No -> NBT-DLG-063-02f and flag 2438 cleared.
- **OLD raw message data:** `Do you want to save some money? {YESNO, 0, 0}`
- **OLD trigger:** CHANGE button (id 2).
- **OLD conditions and branch priority:** Third menu value. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Function#13: `Message 25`, touch Yes/No, `HideMomMoney`, branch.
- **OLD state changes:** Flag 2438 set or cleared.
- **OLD repeat/completion behavior:** Each time.
- **OLD dependencies and shared-resource effects:** Flag 2438.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 25
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-063-02v — Mom: no money left to save
##### Record identity
- **Record ID:** NBT-DLG-063-02v
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02w
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#22
- **Source references:** script file 845 Function#12 `CompareMoneyFlex 0x800C 1` result 0 -> Function#22 `Message 26`; text archive 545 msg 26
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Oh! / You have no money left to save. // Don’t waste your money on / frivolous things, OK? // I know you are sensible like me / and that I can count on you!
- **OLD raw message data:** `Oh!\nYou have no money left to save.\rDon’t waste your money on\nfrivolous things, OK?\rI know you are sensible like me\nand that I can count on you!`
- **OLD trigger:** DEPOSIT-labelled path, player has nothing to deposit (Inferred from text).
- **OLD conditions and branch priority:** After 02w check. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Function#22: `CloseTouchScreen`, `HideMomMoney`, `Message 26`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Each time.
- **OLD dependencies and shared-resource effects:** Player money.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 26
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-063-02w — Mom: cannot save any more
##### Record identity
- **Record ID:** NBT-DLG-063-02w
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02x
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#21
- **Source references:** script file 845 Function#12 `CheckMoneyFull 0 0x800C` result 1 -> Function#21 `Message 27`; text archive 545 msg 27
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** I have saved so much. / I can’t save any more.
- **OLD raw message data:** `I have saved so much.\nI can’t save any more.`
- **OLD trigger:** DEPOSIT-labelled path, Mom's balance at its cap (Inferred).
- **OLD conditions and branch priority:** First check in Function#12. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Function#21: `CloseTouchScreen`, `HideMomMoney`, `Message 27`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Each time.
- **OLD dependencies and shared-resource effects:** Mom balance cap.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 27
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-063-02x — Mom: you have too much money already
##### Record identity
- **Record ID:** NBT-DLG-063-02x
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-02
- **Related record IDs:** NBT-DLG-063-02w
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-02 Function#17
- **Source references:** script file 845 Function#11 `CheckMoneyFull 1 0x800C` result 1 -> Function#17 `Message 28`; text archive 545 msg 28
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** You have so much money already. / I can’t let you have any more.
- **OLD raw message data:** `You have so much money already.\nI can’t let you have any more.`
- **OLD trigger:** WITHDRAW-labelled path, player money at its cap (Inferred).
- **OLD conditions and branch priority:** First check in Function#11. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Function#17: `CloseTouchScreen`, `HideMomMoney`, `Message 28`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Each time.
- **OLD dependencies and shared-resource effects:** Player money cap.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 28
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-063-03 — TV (two tiles)
##### Record identity
- **Record ID:** NBT-EVT-063-03
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-063-03a
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Spawnables idx 0 (5,3) and idx 1 (6,3), type Misc, "Front Interaction" (press A facing the tile from the front). Object identified as the TV from message text (Inferred).
- **Source references:** script file 845 Script#3; event file 60 spawnables idx 0 and 1; text archive 545 msg 35
- **Evidence status:** Verified (script/text); object identity Inferred
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-063-03a.
- **OLD raw message data:** see 545:35.
- **OLD trigger:** Press A facing spawnable idx 0 or idx 1 from the front.
- **OLD conditions and branch priority:** None; no flags/vars. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `Message 35` (03a), `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. No branches, no state change.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable, identical.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 845 Script#3; text archive 545 msg 35; event file 60 spawnables idx 0 and idx 1
- **Other affected callers or records:** Both spawnables share Script 3.
- **Unresolved questions:** None.
- **Validation needed:** Both tiles.

#### NBT-DLG-063-03a — TV text
##### Record identity
- **Record ID:** NBT-DLG-063-03a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-03
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** TV via NBT-EVT-063-03
- **Source references:** script file 845 Script#3 `Message 35`; text archive 545 msg 35
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** The TV is playing a movie! // Two boys are in a cave searching / for treasure! // I better get going...
- **OLD raw message data:** `The TV is playing a movie!\rTwo boys are in a cave searching\nfor treasure!\rI better get going...`
- **OLD trigger:** Shown by NBT-EVT-063-03 on every interaction.
- **OLD conditions and branch priority:** Unconditional. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** NBT-EVT-063-03 step.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every time.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 35
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-063-04 — Stove
##### Record identity
- **Record ID:** NBT-EVT-063-04
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-063-04a
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Spawnable idx 3 (9,3), Misc, front interaction. Object identified from message text (Mom’s specialty burger: stove/kitchen counter; Inferred).
- **Source references:** script file 845 Script#4; event file 60 spawnables idx 3; text archive 545 msg 36
- **Evidence status:** Verified (script/text); object identity Inferred
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-063-04a.
- **OLD raw message data:** see 545:36.
- **OLD trigger:** Press A facing spawnable idx 3.
- **OLD conditions and branch priority:** None. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `Message 36`, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 845 Script#4; text archive 545 msg 36; event file 60 spawnables idx 3
- **Other affected callers or records:** None found.
- **Unresolved questions:** What the object really is (graphics not inspected).
- **Validation needed:** In-game.

#### NBT-DLG-063-04a — Stove text
##### Record identity
- **Record ID:** NBT-DLG-063-04a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-04
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Object at 9,3 via NBT-EVT-063-04
- **Source references:** script file 845 Script#4 `Message 36`; text archive 545 msg 36
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Cinnabar Volcano Burger! / Mom’s specialty!
- **OLD raw message data:** `Cinnabar Volcano Burger!\nMom’s specialty!`
- **OLD trigger:** Every interaction with NBT-EVT-063-04.
- **OLD conditions and branch priority:** Unconditional. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** NBT-EVT-063-04.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every time.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 36
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-063-05 — Sink
##### Record identity
- **Record ID:** NBT-EVT-063-05
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-063-05a
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Spawnable idx 2 (8,3), Misc, front interaction. Object identified from message text (Inferred).
- **Source references:** script file 845 Script#5; event file 60 spawnables idx 2; text archive 545 msg 37
- **Evidence status:** Verified (script/text); object identity Inferred
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-063-05a.
- **OLD raw message data:** see 545:37.
- **OLD trigger:** Press A facing spawnable idx 2.
- **OLD conditions and branch priority:** None. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `Message 37`, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 845 Script#5; text archive 545 msg 37; event file 60 spawnables idx 2
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** In-game.

#### NBT-DLG-063-05a — Sink text
##### Record identity
- **Record ID:** NBT-DLG-063-05a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-05
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Object at 8,3 via NBT-EVT-063-05
- **Source references:** script file 845 Script#5 `Message 37`; text archive 545 msg 37
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** A squeaky-clean sink! / Mom loves having it clean.
- **OLD raw message data:** `A squeaky-clean sink!\nMom loves having it clean.`
- **OLD trigger:** Every interaction with NBT-EVT-063-05.
- **OLD conditions and branch priority:** Unconditional. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** NBT-EVT-063-05.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every time.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 37
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-063-06 — Fridge
##### Record identity
- **Record ID:** NBT-EVT-063-06
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-063-06a
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Spawnable idx 4 (11,3), Misc, front interaction. Object identified from message text (Inferred).
- **Source references:** script file 845 Script#6; event file 60 spawnables idx 4; text archive 545 msg 38
- **Evidence status:** Verified (script/text); object identity Inferred
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-063-06a.
- **OLD raw message data:** see 545:38.
- **OLD trigger:** Press A facing spawnable idx 4.
- **OLD conditions and branch priority:** None. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `Message 38`, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 845 Script#6; text archive 545 msg 38; event file 60 spawnables idx 4
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** In-game.

#### NBT-DLG-063-06a — Fridge text
##### Record identity
- **Record ID:** NBT-DLG-063-06a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-06
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Object at 11,3 via NBT-EVT-063-06
- **Source references:** script file 845 Script#6 `Message 38`; text archive 545 msg 38
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** What’s in the fridge...? // Lots of drinking water and / sweeeet lemonade!
- **OLD raw message data:** `What’s in the fridge...?\rLots of drinking water and\nsweeeet lemonade!`
- **OLD trigger:** Every interaction with NBT-EVT-063-06.
- **OLD conditions and branch priority:** Unconditional. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** NBT-EVT-063-06.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every time.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 38
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-063-07 — Post-Hall-of-Fame scene: Mom says Elm has something for you
##### Record identity
- **Record ID:** NBT-EVT-063-07
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-063-LS, NBT-EVT-063-01, NBT-DLG-063-07a
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Level script 618 (var 16646 == 3) fires Script 7 automatically; speaker Mom (overworld idx 0).
- **Source references:** script file 845 Script#7 and Actions 1-4; level script 618; text archive 545 msg 33
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-063-07a.
- **OLD raw message data:** see 545:33.
- **OLD trigger:** Automatic on entering header 63 while VAR_SCENE_PLAYERS_HOUSE_1F (0x4106) == 3 (set by Hall of Fame script file 825).
- **OLD conditions and branch priority:** Direct: var 16646 == 3. Indirect: reaching file 825's `SetVar 0x4106 3` (Hall of Fame; docs/gms-debug-rules.md line 110 notes this is skipped on GMS-gated flows). Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `MecScript`, `LockAll`, `Movement Player Action#1`, `Movement Overworld.0 Action#2`, `WaitMovement`, `CommonScript 2036` (GLB-RTN-2036), `WaitTime 30 0x800C`, `Movement Overworld.0 Action#3`, `WaitMovement`, `TextPlayerName 0`, `Message 33` (NBT-DLG-063-07a), `CloseMessage`, `Movement Overworld.0 Action#4`, `WaitMovement`, `CommonScript 2038` (GLB-RTN-2038), `SetVar 0x4106 4`, `ReleaseAll`, `End`. Same walk-up/walk-back actions as Script 1, no flags set.
- **OLD state changes:** VAR_SCENE_PLAYERS_HOUSE_1F = 4.
- **OLD repeat/completion behavior:** Once per setting of var to 3.
- **OLD dependencies and shared-resource effects:** GLB-RTN-2036, GLB-RTN-2038; Actions 1-4 shared with Script 1.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 845 Script#7; level script 618; text archive 545 msg 33
- **Other affected callers or records:** Actions 1-4 shared with NBT-EVT-063-01.
- **Unresolved questions:** The Elm-side event this line points to (not traced).
- **Validation needed:** Post-game emulator test.

#### NBT-DLG-063-07a — Mom: Elm has something to give you
##### Record identity
- **Record ID:** NBT-DLG-063-07a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-063-07
- **Related record IDs:** NBT-DLG-063-02b
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Mom via NBT-EVT-063-07
- **Source references:** script file 845 Script#7 `TextPlayerName 0`, `Message 33`; text archive 545 msg 33
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Hi, <player>! / Professor Elm told me that /// he has something to give you! //
- **OLD raw message data:** `Hi, {STRVAR_1, 3, 0, 0}!\nProfessor Elm told me that\fhe has something to give you!\r`
- **OLD trigger:** NBT-EVT-063-07.
- **OLD conditions and branch priority:** As NBT-EVT-063-07. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** NBT-EVT-063-07 step.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once per cycle.
- **OLD dependencies and shared-resource effects:** Player name.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 545 msg 33
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-063-W0 — Front door to New Bark Town outdoors
##### Record identity
- **Record ID:** NBT-EVT-063-W0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-063-W1
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Warp idx 0 at 3,10
- **Source references:** event file 60 warps idx 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Step on 3,10.
- **OLD conditions and branch priority:** None. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Warp to header 60 ("T20", New Bark Town) anchor 1, height 0.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Always.
- **OLD dependencies and shared-resource effects:** Header 60 anchor 1 landing.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 60 warps idx 0
- **Other affected callers or records:** Header 60 event file 57 should hold the matching door warp (not checked).
- **Unresolved questions:** None.
- **Validation needed:** Walk out.

#### NBT-EVT-063-W1 — Stairs up to the player's room (header 64)
##### Record identity
- **Record ID:** NBT-EVT-063-W1
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-063-W0, NBT-EVT-064-W0
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** Warp idx 1 at 3,3
- **Source references:** event file 60 warps idx 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Step on 3,3.
- **OLD conditions and branch priority:** None. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Warp to header 64 (T20R0202) anchor 0, height 0. Header 64's warp idx 0 returns to header 63 anchor 1.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Always.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 60 warps idx 1
- **Other affected callers or records:** NBT-EVT-064-W0.
- **Unresolved questions:** Whether "anchor" indexes the destination's warp list (header 64 has one warp, anchor 0).
- **Validation needed:** Walk upstairs.


#### NBT-DLG-063-U19 — Unreferenced local message: "<player>, stand firm! I'm always there for you!"
##### Record identity
- **Record ID:** NBT-DLG-063-U19
- **Record type:** Dialogue variant
- **Parent record ID:** None (not referenced by any script in this map's script file)
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0201 (header 63)
- **Speaker, object, or trigger:** None (no speaker label in the text; no script shows it)
- **Source references:** text archive 545 msg 19; script file 845 (`project/scripts/0845.script`) searched, no `Message`, `GenderMessage` or `BoardMessage` names index 19 (the only "19" in the file is `Function 19` and its jump)
- **Evidence status:** Verified (text read with `get_text`; non-reference confirmed by grep of 0845.script); Inferred that no other mechanism reads it
##### OLD — Current content
- **OLD dialogue:** {STRVAR_1, 3, 0, 0}, stand firm! / I’m always there for you!
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0}, stand firm!\nI’m always there for you!`
- **OLD trigger:** None found.
- **OLD conditions and branch priority:** Reachability: Apparently unused. No other message in archive 545 has this text (`search_text` on archive 545: 1 match, this one).
- **OLD event sequence:** None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Not applicable.
- **OLD dependencies and shared-resource effects:** The name token {STRVAR_1, 3, 0, 0} would need a name buffer set before it if it were ever shown.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** archive 545 msg 19 (no script change needed unless a script is made to show it)
- **Other affected callers or records:** None found.
- **Unresolved questions:** Whether another file reads it.
- **Validation needed:** None.

## Map 64 — T20R0202

### Map 064 event inventory (event file 61, script file 846, level script 619, text archive 546)

Header 64 is the new-game spawn map per `get_rom_table` kind spawn as stated in the brief (not re-queried in this section). Flags 681/682/683 are FLAG_HIDE_PLAYERS_ROOM_BRONZE_TROPHY / _SILVER_ / _GOLD_TROPHY (flags.s lines 699-701).

| Section | Idx | Type / sprite | Coordinates (global x,y) | Hide flag | scriptNumber | Covering record |
|---|---|---|---|---|---|---|
| spawnable | 0 | Misc, front interaction | 6,4 | n/a | 1 | NBT-EVT-064-01 |
| spawnable | 1 | Misc, "Activated from any dir" (dir 4) | 8,4 | n/a | 2 | NBT-EVT-064-02 |
| overworld | 0 | Normal, owID 0, sprite 376, movement 0 | 8,10 | 682 (silver trophy hide flag) | 0 (none) | NBT-EVT-064-O0 |
| overworld | 1 | Normal, owID 1, sprite 350, movement 0 | 9,10 | 683 (gold trophy hide flag) | 0 (none) | NBT-EVT-064-O1 |
| overworld | 2 | Normal, owID 2, sprite 379, movement 0 | 7,10 | 681 (bronze trophy hide flag) | 0 (none) | NBT-EVT-064-O2 |
| warp | 0 | to header 63 anchor 1, height 0 | 3,4 | n/a | n/a | NBT-EVT-064-W0 |
| trigger | none (0) | | | | | |
| level script 619 | empty (0 entries, 4 bytes) | | | | | no record needed |

Reconciliation: 2 spawnables + 3 overworlds + 1 warp = 6 event records (all indices covered). Script file 846: Script 1, Script 2, Function 1, no Actions; all reached. Text archive 546 has 3 messages (0, 1, 2); all referenced; none unused.

#### NBT-EVT-064-01 — PC (mailbox)
##### Record identity
- **Record ID:** NBT-EVT-064-01
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-064-01a, NBT-DLG-064-01b
- **Map or system:** New Bark Town, T20R0202 (header 64)
- **Speaker, object, or trigger:** Spawnable idx 0 at 6,4, Misc, front interaction. Object is the PC (identified from `SEQ_SE_DP_PC_ON` and message "booted up the PC and checked the Mailbox"; Inferred).
- **Source references:** script file 846 Script#1 and Function#1; event file 61 spawnables idx 0; text archive 546 msgs 0, 1
- **Evidence status:** Verified (script/text); object identity Inferred
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-064-01a and NBT-DLG-064-01b.
- **OLD raw message data:** see 546:0 and 546:1.
- **OLD trigger:** Press A facing spawnable idx 0 from the front.
- **OLD conditions and branch priority:** Only branch is `CountMail 0x800C` then `CompareVarValue 0x800C 0`: EQUAL (no mail) -> Function#1; otherwise mailbox screen. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** (1) Talk. (2) `MecScript`, `LockAll`, `PlayFanfare SEQ_SE_DP_PC_ON`, `TextPlayerName 0`, `Message 0` (01a), `CloseMessage`, `CountMail 0x800C`, `CompareVarValue 0x800C 0`, `JumpIf EQUAL Function#1`. (3) If no mail -> Function#1: `Message 1` (01b), `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. If mail exists: `FadeScreen 6 1 0 0`, `WaitFadeScreen`, `MailScreen`, `ReturnScreen`, `FadeScreen 6 1 1 0`, `WaitFadeScreen`, `ReleaseAll`, `End`. (4) Fade out/in around the mail screen. (5) No flag/var/item changes. (6) Repeatable. (7) Uses the engine mailbox screen (`MailScreen`), not a CommonScript; no GLB record.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** Player mail storage; player name.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 846 Script#1 / Function#1; text archive 546 msgs 0-1; event file 61 spawnables idx 0
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** With and without mail.

#### NBT-DLG-064-01a — PC boot message
##### Record identity
- **Record ID:** NBT-DLG-064-01a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-064-01
- **Related record IDs:** NBT-DLG-064-01b
- **Map or system:** New Bark Town, T20R0202 (header 64)
- **Speaker, object, or trigger:** PC via NBT-EVT-064-01
- **Source references:** script file 846 Script#1 `TextPlayerName 0`, `Message 0`; text archive 546 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** <player> booted up the PC and / checked the Mailbox! //
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0} booted up the PC and\nchecked the Mailbox!\r`
- **OLD trigger:** Every interaction with the PC.
- **OLD conditions and branch priority:** Unconditional (played before the mail count). Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** NBT-EVT-064-01 step (2), followed by `CloseMessage`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every time.
- **OLD dependencies and shared-resource effects:** Player name.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 546 msg 0
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-DLG-064-01b — PC: no mail
##### Record identity
- **Record ID:** NBT-DLG-064-01b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-064-01
- **Related record IDs:** NBT-DLG-064-01a
- **Map or system:** New Bark Town, T20R0202 (header 64)
- **Speaker, object, or trigger:** PC via NBT-EVT-064-01 Function#1
- **Source references:** script file 846 Function#1 `Message 1`; text archive 546 msg 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** There is no Mail...
- **OLD raw message data:** `There is no Mail...`
- **OLD trigger:** `CountMail` result 0 after 01a.
- **OLD conditions and branch priority:** Mail count == 0. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Function#1: `Message 1`, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Whenever mailbox is empty.
- **OLD dependencies and shared-resource effects:** Mail inventory.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 546 msg 1
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-064-02 — Wii (console/TV)
##### Record identity
- **Record ID:** NBT-EVT-064-02
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-064-02a
- **Map or system:** New Bark Town, T20R0202 (header 64)
- **Speaker, object, or trigger:** Spawnable idx 1 at 8,4, Misc, "Activated from any dir" (dir 4). Object identified from message text (Inferred).
- **Source references:** script file 846 Script#2; event file 61 spawnables idx 1; text archive 546 msg 2
- **Evidence status:** Verified (script/text); object identity Inferred
##### OLD — Current content
- **OLD dialogue:** See NBT-DLG-064-02a.
- **OLD raw message data:** see 546:2.
- **OLD trigger:** Interact with spawnable idx 1 from any direction.
- **OLD conditions and branch priority:** None. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `Message 2`, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 846 Script#2; text archive 546 msg 2; event file 61 spawnables idx 1
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** In-game.

#### NBT-DLG-064-02a — Wii text
##### Record identity
- **Record ID:** NBT-DLG-064-02a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-064-02
- **Related record IDs:** None
- **Map or system:** New Bark Town, T20R0202 (header 64)
- **Speaker, object, or trigger:** Object at 8,4 via NBT-EVT-064-02
- **Source references:** script file 846 Script#2 `Message 2`; text archive 546 msg 2
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** It’s a Wii! // Wii is huge in Johto, too!
- **OLD raw message data:** `It’s a Wii!\rWii is huge in Johto, too!`
- **OLD trigger:** Every interaction.
- **OLD conditions and branch priority:** Unconditional. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** NBT-EVT-064-02.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every time.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 546 msg 2
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None.

#### NBT-EVT-064-O0 — Silver Trophy display (hide flag 682)
##### Record identity
- **Record ID:** NBT-EVT-064-O0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-064-O1, NBT-EVT-064-O2
- **Map or system:** New Bark Town, T20R0202 (header 64)
- **Speaker, object, or trigger:** Overworld idx 0 (owID 0, sprite 376, at 8,10), Normal, no script (scriptNumber 0), orientation 0, movement 0. Identified from its hide flag name FLAG_HIDE_PLAYERS_ROOM_SILVER_TROPHY (sprite itself not decoded; Inferred).
- **Source references:** event file 61 overworlds idx 0 (flag 682)
- **Evidence status:** Verified (flag name); object identity Inferred
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** None (decorative, no talk script).
- **OLD conditions and branch priority:** Visible only while flag 682 is clear (hide flag semantics). Writers: `SetFlag 682` in script file 149 Script#1 (a long list of SetFlag lines, purpose Unresolved); `ClearFlag 682` in script file 69 Function#103 (reached when Function#87's chain compares `0x8004` to 86; `SetVar 0x8004 86` at 0069 line 692; Inferred: trophy awarded elsewhere), which header uses file 69 or 149 was not resolved (resolved: file 69 = header 265 D31R0201, Battle Tower; file 149 = no header uses it). Readers other than the engine's object-visibility check: none found. Reachability class: Referenced with unresolved reachability (depends on file 69 award path).
- **OLD event sequence:** None; shown or hidden by the flag.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Persistent display.
- **OLD dependencies and shared-resource effects:** Flag 682 shared with files 149 and 69.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 61 overworlds idx 0
- **Other affected callers or records:** Script files 149 (Script#1) and 69 (Function#103).
- **Unresolved questions:** Which map uses script files 69 and 149; what awards the trophies.
- **Validation needed:** None unless modified.

#### NBT-EVT-064-O1 — Gold Trophy display (hide flag 683)
##### Record identity
- **Record ID:** NBT-EVT-064-O1
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-064-O0, NBT-EVT-064-O2
- **Map or system:** New Bark Town, T20R0202 (header 64)
- **Speaker, object, or trigger:** Overworld idx 1 (owID 1, sprite 350, at 9,10), Normal, no script. Identified from FLAG_HIDE_PLAYERS_ROOM_GOLD_TROPHY (Inferred).
- **Source references:** event file 61 overworlds idx 1 (flag 683)
- **Evidence status:** Verified (flag name); object identity Inferred
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** None.
- **OLD conditions and branch priority:** Visible only while flag 683 is clear. Writers: `SetFlag 683` in script file 149 Script#1; `ClearFlag 683` in script file 69 Function#115 (the fall-through after the 85/86 comparisons; Inferred as the 87 case). Reachability class: Referenced with unresolved reachability.
- **OLD event sequence:** None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Persistent display.
- **OLD dependencies and shared-resource effects:** Flag 683 shared with files 149 and 69.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 61 overworlds idx 1
- **Other affected callers or records:** Script files 149 and 69.
- **Unresolved questions:** As O0.
- **Validation needed:** None unless modified.

#### NBT-EVT-064-O2 — Bronze Trophy display (hide flag 681)
##### Record identity
- **Record ID:** NBT-EVT-064-O2
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-064-O0, NBT-EVT-064-O1
- **Map or system:** New Bark Town, T20R0202 (header 64)
- **Speaker, object, or trigger:** Overworld idx 2 (owID 2, sprite 379, at 7,10), Normal, no script. Identified from FLAG_HIDE_PLAYERS_ROOM_BRONZE_TROPHY (Inferred).
- **Source references:** event file 61 overworlds idx 2 (flag 681)
- **Evidence status:** Verified (flag name); object identity Inferred
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** None.
- **OLD conditions and branch priority:** Visible only while flag 681 is clear. Writers: `SetFlag 681` in script file 149 Script#1; `ClearFlag 681` in script file 69 Function#87 (after `CompareVarValue 0x8004 85`; `SetVar 0x8004 85` at 0069 line 687). Reachability class: Referenced with unresolved reachability.
- **OLD event sequence:** None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Persistent display.
- **OLD dependencies and shared-resource effects:** Flag 681 shared with files 149 and 69.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 61 overworlds idx 2
- **Other affected callers or records:** Script files 149 and 69.
- **Unresolved questions:** As O0.
- **Validation needed:** None unless modified.

#### NBT-EVT-064-W0 — Stairs down to the ground floor (header 63)
##### Record identity
- **Record ID:** NBT-EVT-064-W0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-063-W1
- **Map or system:** New Bark Town, T20R0202 (header 64)
- **Speaker, object, or trigger:** Warp idx 0 at 3,4
- **Source references:** event file 61 warps idx 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Step on 3,4.
- **OLD conditions and branch priority:** None. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Warp to header 63 (T20R0201) anchor 1, height 0.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Always.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 61 warps idx 0
- **Other affected callers or records:** NBT-EVT-063-W1.
- **Unresolved questions:** None.
- **Validation needed:** Walk downstairs.


## Map 65 — T20R0301

**Map 065 sources:** header 65 `T20R0301` (matrix 66, `m_h01_`); event file 62; script file 847 (1 script, 0 functions, 0 actions); level script 620 (0 entries); text archive 547 (1 message). `list_changes` (34 journal entries) touches script files 843, 146, 163, 228, 227, 92, 222, 903, 891, 145, 141 and 225 and text archives 373 and 115 only: none of event file 62, script 847, level script 620 or text 547. `project/scripts/0847.script` matches `get_script 847` line for line.

**Text rendering convention (this map and the two below):** `OLD dialogue` shows the message with `\n` rendered as " / " (line break inside a box) and `\r` / `\f` rendered as " // " (the ROM's two other break codes, both starting a new page; the raw string keeps the exact codes). `{STRVAR_1, 3, 0, 0}`-style tokens are left as written. Raw strings are exactly as `get_text` returned them.

### Map 065 event inventory

| Section | Idx | Type | owID / sprite (overlayTableEntry) | Coordinates (global) | Flag (hides NPC when set) | scriptNumber | Covering record |
|---|---|---|---|---|---|---|---|
| overworlds | 0 | Normal, movement 17 (Facing Right), orientation 3, no wander | owID 0 / sprite 327 | (5,5) | 0 (none) | 1 | NBT-EVT-065-01 |
| warps | 0 | warp to header 60, anchor 2 | n/a | (4,8) | n/a | n/a | NBT-EVT-065-W0 |
| spawnables | none | n/a | n/a | n/a | n/a | n/a | n/a (0 entries) |
| triggers | none | n/a | n/a | n/a | n/a | n/a | n/a (0 entries) |
| level script 620 | none | empty (0 entries) | n/a | n/a | n/a | n/a | no record needed |

**Reconciliation:** event file 62 holds 1 overworld + 1 warp = 2 entries; both covered. Script file 847: Script 1 only, covered by NBT-EVT-065-01. Text archive 547: 1 message (index 0), referenced by Script 1; no unreferenced messages.

#### NBT-EVT-065-01 — Resident NPC talks about Pikachu, Professor Elm and wanting to be a researcher
##### Record identity
- **Record ID:** NBT-EVT-065-01
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-065-01a; NBT-EVT-065-W0
- **Map or system:** New Bark Town, T20R0301 (header 65)
- **Speaker, object, or trigger:** Overworld NPC owID 0, sprite 327, at (5,5), facing right, does not move; talk to it (Script 1). Who the NPC is (name, relation to anyone) is not stated in the text or data.
- **Source references:** script file 847 Script#1; event file 62 overworlds idx 0 (scriptNumber 1); text archive 547 msg 0
- **Evidence status:** Verified (trigger, script and text); Inferred for the NPC's role as a plain resident (no name in data)
##### OLD — Current content
- **OLD dialogue:** Not applicable (the text is held by NBT-DLG-065-01a).
- **OLD raw message data:** Not applicable (see NBT-DLG-065-01a).
- **OLD trigger:** Player interacts (talk) with overworld idx 0.
- **OLD conditions and branch priority:** No condition. The NPC's event-file `flag` is 0, so it is always present. No flag or variable is read or written by the script. Reachability class: Referenced and apparently reachable (the room's only warp, NBT-EVT-065-W0, leads to header 60; that header 60 has a warp into this room is not checked here).
- **OLD event sequence:** (1) Player talks to overworld idx 0. (2) `PlayFanfare SEQ_SE_CONFIRM`; `LockAll`; `FacePlayer`; `Message 0` (NBT-DLG-065-01a); `WaitButton`; `CloseMessage`; `ReleaseAll`; `End`. (3) No branches. (4) Fanfare, player locked, NPC turns to face player. (5) None. (6) Repeats identically on every talk. (7) No GLB calls.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Same message every time; never completes.
- **OLD dependencies and shared-resource effects:** None. No flags, variables, common scripts or other maps' content.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 847 Script#1; text archive 547 msg 0; event file 62 overworlds idx 0
- **Other affected callers or records:** None found. Script 847 Script#1 is referenced only by event file 62 overworlds idx 0; message 547:0 only by Script#1.
- **Unresolved questions:** Who this NPC is (sprite 327 is not decoded here).
- **Validation needed:** Replace text; confirm in game that the NPC still faces and locks the player as before.

#### NBT-DLG-065-01a — Pikachu / Professor Elm / wish to be a researcher
##### Record identity
- **Record ID:** NBT-DLG-065-01a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-065-01
- **Related record IDs:** none
- **Map or system:** New Bark Town, T20R0301 (header 65)
- **Speaker, object, or trigger:** Shown by NBT-EVT-065-01 on every talk to overworld idx 0, with no condition. Speaker unnamed.
- **Source references:** script file 847 Script#1 `Message 0`; text archive 547 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** PIKACHU is an evolved Pokémon. // ...This fact was first discovered by / Professor Elm. // I was amazed by Professor Elm’s / findings. // He’s so famous for his research on / Pokémon evolution. // Sigh... // I wish I could be a researcher / like him...
- **OLD raw message data:** `PIKACHU is an evolved Pokémon.\r...This fact was first discovered by\nProfessor Elm.\rI was amazed by Professor Elm’s\nfindings.\rHe’s so famous for his research on\nPokémon evolution.\rSigh...\rI wish I could be a researcher\nlike him...`
- **OLD trigger:** Shown by NBT-EVT-065-01 at its `Message 0`.
- **OLD conditions and branch priority:** Unconditional (no check precedes `Message 0`). Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Shown in step (2) of NBT-EVT-065-01; followed by `WaitButton`, `CloseMessage`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats each talk.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 547 msg 0
- **Other affected callers or records:** None found (only 847 Script#1 uses archive 547).
- **Unresolved questions:** None for the text itself.
- **Validation needed:** Check line length/page breaks in game after any edit.

#### NBT-EVT-065-W0 — Door out to the exterior
##### Record identity
- **Record ID:** NBT-EVT-065-W0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-065-01
- **Map or system:** New Bark Town, T20R0301 (header 65)
- **Speaker, object, or trigger:** Warp tile at (4,8) (matrix cell (0,0), map tile (4,8)); no script.
- **Source references:** event file 62 warps idx 0 (header 60, anchor 2, height 0); no script involved
- **Evidence status:** Verified (warp data); Inferred that this is the room's only exit (it is the only warp in the file)
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Player steps on the warp tile (4,8).
- **OLD conditions and branch priority:** None in the event file (warps carry no flag). Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** (1) Step on warp. (2)-(6) none. (7) Destination: header 60 (New Bark Town exterior), anchor 2 of that map's warp list (not documented here).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats each time.
- **OLD dependencies and shared-resource effects:** Depends on header 60's warp anchor 2 existing and pointing at this house door (not checked here; belongs to header 60's section).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 62 warps idx 0
- **Other affected callers or records:** The matching entry warp is in header 60's event file (its section).
- **Unresolved questions:** Whether header 60's warp for this house uses anchor index 2 as destination of the return (not checked here).
- **Validation needed:** Warp both ways in game after any change.

## Map 66 — T20R0401

**Map 066 sources:** header 66 `T20R0401` (matrix 71); event file 63; script file 848 (1 script, 2 functions, 0 actions); level script 621 (0 entries); text archive 548 (20 messages). `list_changes` shows no edit to event file 63, script 848, level script 621 or text 548. `project/scripts/0848.script` matches `get_script 848` line for line. Rendering convention: see the Map 065 note above. Dialogue letters in this map follow the message index (a = msg 0, b = msg 1, …). `GenderMessage a b` shows msg a to a male player and msg b to a female player (`docs/scripting-reference.md` line 111; `docs/partner-sprite.md` states 0 = male, and message 548:0 names Lyra, 548:1 names Ethan).

### Map 066 event inventory

| Section | Idx | Type | owID / sprite (overlayTableEntry) | Coordinates (global) | Flag (hides NPC when set) | scriptNumber | Covering record |
|---|---|---|---|---|---|---|---|
| overworlds | 0 | Normal, movement 0 (None), orientation 1, no wander | owID 0 / sprite 328 | (6,7) | 0 (none) | 1 | NBT-EVT-066-01 |
| warps | 0 | warp to header 60, anchor 3 | n/a | (3,10) | n/a | n/a | NBT-EVT-066-W0 |
| warps | 1 | warp to header 384, anchor 0 | n/a | (3,3) | n/a | n/a | NBT-EVT-066-W1 |
| spawnables | none | n/a | n/a | n/a | n/a | n/a | n/a (0 entries) |
| triggers | none | n/a | n/a | n/a | n/a | n/a | n/a (0 entries) |
| level script 621 | none | empty (0 entries) | n/a | n/a | n/a | n/a | no record needed |

**Reconciliation:** event file 63 holds 1 overworld + 2 warps = 3 entries; all covered. Script file 848: Script 1, Function 1, Function 2, all covered by NBT-EVT-066-01 and its dialogue records. Text archive 548 holds 20 messages: indices 0-5 are referenced by Script 1/Function 1/Function 2; **indices 6-19 (14 messages) contain only spaces and are referenced by no script of file 848 (Apparently unused candidates; blank padding).**

#### NBT-EVT-066-01 — Resident NPC at the house talks about Lyra/Ethan upstairs
##### Record identity
- **Record ID:** NBT-EVT-066-01
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-066-01a, 01b, 01c, 01d, 01e, 01f; NBT-EVT-066-W1; NBT-EVT-384-01 (the friend upstairs); NBT-EVT-384-LS
- **Map or system:** New Bark Town, T20R0401 (header 66)
- **Speaker, object, or trigger:** Overworld NPC owID 0, sprite 328, at (6,7), orientation 1, does not move; talk to it (Script 1). The text speaks of "Lyra"/"Ethan" as a third person who is upstairs; the NPC's own name and relation are not stated.
- **Source references:** script file 848 Script#1, Function#1, Function#2; event file 63 overworlds idx 0 (scriptNumber 1); text archive 548 msgs 0-5
- **Evidence status:** Verified (script, text, event data); Inferred for the NPC's role (a resident of the house; sprite 328 not decoded)
##### OLD — Current content
- **OLD dialogue:** Not applicable (held by NBT-DLG-066-01a to 01f).
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Player interacts (talk) with overworld idx 0.
- **OLD conditions and branch priority:** Evaluated in this order after `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`: (1) `CheckFlag 741` (`FLAG_HIDE_NEW_BARK_FRIENDS_ROOM_FRIEND`) set -> Function#1 (msgs 2/3). (2) else `CompareVarValue 0x4108 1` (`VAR_SCENE_ELMS_LAB`), GREATER/EQUAL (var >= 1) -> Function#2 (msgs 4/5). (3) else (flag 741 clear AND var 0x4108 < 1, i.e. 0) -> msgs 0/1. Direct checks: flag 741 and var 0x4108. No indirect prerequisites are checked by this script. NPC visibility flag: 0 (always present). Flag 741 readers: script 848 Script 1, script 849 Script 3 (level script 622), event file 341 overworlds idx 0 and 1 (`flag` field). Flag 741 writers: set by script 843 Script 3 and Function 12 (NBT-local), by script 112 Function 7 and Function 8 (elsewhere); cleared by script 859 Function 8, script 21 Function 1 and 2, script 104 Function 1 and 2 (elsewhere); script file -> header of those files not resolved (resolved: 112 = header 288 Dragon's Den, 859 = header 135 Violet City Gym, 21 = header 340 Bell Tower, 104 = header 244 Whirl Islands). Var 0x4108 readers: 843, 845, 848, 851, 852; writers: 843 (many, NBT-local), 229 (sets 3), 859 (sets 6), 858 (sets 7), 112 (sets 8) (grep of `project/scripts/`; level scripts were not searched). Reachability class: Referenced and apparently reachable; the actual order in which these writers fire in play is not established here.
- **OLD event sequence:** (1) Talk. (2) `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`, `CheckFlag 741`, `JumpIf EQUAL Function#1`, `CompareVarValue 0x4108 1`, `JumpIf GREATER/EQUAL Function#2`; default path: `TextPlayerName 0`, `GenderMessage 0 1` (NBT-DLG-066-01a male / 01b female), `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. (3) Function#1: `TextPlayerName 0`, `GenderMessage 2 3` (01c / 01d), `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. Function#2: `TextPlayerName 0`, `GenderMessage 4 5` (01e / 01f), `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. (4) Fanfare, lock, NPC faces player. (5) No flag, variable or inventory change. (6) Repeats identically for the same state. (7) No GLB calls.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Re-shown on every talk; the text changes only when flag 741 or var 0x4108 changes.
- **OLD dependencies and shared-resource effects:** Reads flag 741 and var 0x4108, both shared with other maps (writers above). Message variant depends on the player's gender.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 848 Script#1, Function#1, Function#2; text archive 548 msgs 0-5; event file 63 overworlds idx 0
- **Other affected callers or records:** None found for script 848 or archive 548 (only event file 63 overworlds idx 0 uses Script#1; Functions 1 and 2 are reached only from Script#1). Flag 741 and var 0x4108 are shared with the records listed above.
- **Unresolved questions:** Sprite 328 identity; header of script files 21, 104, 112, 859 (flag 741 clearers/setters); whether the third state (flag clear, var 0) is reached before the player has a Pokémon in play order (not inferred from play order).
- **Validation needed:** Test each of the three states for both player genders; confirm flag 741 and var 0x4108 values after edits to other maps.

#### NBT-DLG-066-01a — "Lyra is upstairs ... you don't have your own Pokémon yet" (male player)
##### Record identity
- **Record ID:** NBT-DLG-066-01a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-066-01
- **Related record IDs:** NBT-DLG-066-01b (female-player twin)
- **Map or system:** New Bark Town, T20R0401 (header 66)
- **Speaker, object, or trigger:** Shown by NBT-EVT-066-01 when flag 741 is clear AND var 0x4108 is 0 (not >= 1), and the player is male (`GenderMessage 0 1`, first slot).
- **Source references:** script file 848 Script#1 `GenderMessage 0 1`; text archive 548 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Hi, {STRVAR_1, 3, 0, 0}! / Lyra is upstairs. // She’s playing games with her Pokémon / as usual. // You didn’t bring your...Pokémon? / ...Oh, I should’ve known. // You don’t have your own Pokémon yet. // Well, I hope I didn’t hurt your / feelings, {STRVAR_1, 3, 0, 0}.
- **OLD raw message data:** `Hi, {STRVAR_1, 3, 0, 0}!\nLyra is upstairs.\rShe’s playing games with her Pokémon\nas usual.\rYou didn’t bring your...Pokémon?\n...Oh, I should’ve known.\rYou don’t have your own Pokémon yet.\rWell, I hope I didn’t hurt your\nfeelings, {STRVAR_1, 3, 0, 0}.`
- **OLD trigger:** `GenderMessage 0 1` in NBT-EVT-066-01 default path.
- **OLD conditions and branch priority:** Last branch: only when flag 741 is clear and var 0x4108 < 1. The text itself says the player has no Pokémon, but the script does NOT check party contents or flag 106 (`FLAG_GOT_STARTER`); only 741 and 0x4108 are checked. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** See NBT-EVT-066-01 step (2), default path; `TextPlayerName 0` precedes the message.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats until flag 741 is set or var 0x4108 >= 1.
- **OLD dependencies and shared-resource effects:** Token {STRVAR_1, 3, 0, 0} filled from `TextPlayerName 0` (Inferred from the command order).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 548 msg 0
- **Other affected callers or records:** None found (only 848 Script#1 uses it).
- **Unresolved questions:** None.
- **Validation needed:** Male-player run with flag 741 clear and var 0x4108 = 0.

#### NBT-DLG-066-01b — "Ethan is upstairs ... you don't have your own Pokémon yet" (female player)
##### Record identity
- **Record ID:** NBT-DLG-066-01b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-066-01
- **Related record IDs:** NBT-DLG-066-01a
- **Map or system:** New Bark Town, T20R0401 (header 66)
- **Speaker, object, or trigger:** Shown by NBT-EVT-066-01 when flag 741 is clear AND var 0x4108 is 0, and the player is female (`GenderMessage 0 1`, second slot).
- **Source references:** script file 848 Script#1 `GenderMessage 0 1`; text archive 548 msg 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Hi, {STRVAR_1, 3, 0, 0}! / Ethan is upstairs. // He’s having fun with his Pokémon / as usual. // You didn’t bring your...Pokémon? / ...Oh, I should’ve known. // You don’t have your own Pokémon yet. // Well, I hope I didn’t hurt your / feelings, {STRVAR_1, 3, 0, 0}.
- **OLD raw message data:** `Hi, {STRVAR_1, 3, 0, 0}!\nEthan is upstairs.\rHe’s having fun with his Pokémon\nas usual.\rYou didn’t bring your...Pokémon?\n...Oh, I should’ve known.\rYou don’t have your own Pokémon yet.\rWell, I hope I didn’t hurt your\nfeelings, {STRVAR_1, 3, 0, 0}.`
- **OLD trigger:** `GenderMessage 0 1` in NBT-EVT-066-01 default path.
- **OLD conditions and branch priority:** Same as NBT-DLG-066-01a, female player. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** See NBT-EVT-066-01 step (2), default path.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Same as 01a.
- **OLD dependencies and shared-resource effects:** Same as 01a.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 548 msg 1
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Female-player run, same state.

#### NBT-DLG-066-01c — "Lyra is not here ... busier than I am" (male player)
##### Record identity
- **Record ID:** NBT-DLG-066-01c
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-066-01
- **Related record IDs:** NBT-DLG-066-01d
- **Map or system:** New Bark Town, T20R0401 (header 66)
- **Speaker, object, or trigger:** Shown by NBT-EVT-066-01 (Function#1) when flag 741 is set (checked first, overrides var 0x4108), male player (`GenderMessage 2 3`, first slot).
- **Source references:** script file 848 Function#1 `GenderMessage 2 3`; text archive 548 msg 2
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Hi, {STRVAR_1, 3, 0, 0}! / Lyra is not here. // She’s been keeping herself busy / helping the professor. // She’s busier than I am!
- **OLD raw message data:** `Hi, {STRVAR_1, 3, 0, 0}!\nLyra is not here.\rShe’s been keeping herself busy\nhelping the professor.\fShe’s busier than I am!`
- **OLD trigger:** `JumpIf EQUAL Function#1` after `CheckFlag 741`.
- **OLD conditions and branch priority:** First-priority branch: flag 741 set, any value of var 0x4108. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** NBT-EVT-066-01 Function#1: `TextPlayerName 0`, `GenderMessage 2 3`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats while 741 stays set; 741 can be cleared by script 859 Function 8, 21 Function 1/2, 104 Function 1/2 (elsewhere).
- **OLD dependencies and shared-resource effects:** Flag 741 shared as listed in NBT-EVT-066-01.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 548 msg 2
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Male player, flag 741 set.

#### NBT-DLG-066-01d — "Ethan is not here ... busier than I am" (female player)
##### Record identity
- **Record ID:** NBT-DLG-066-01d
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-066-01
- **Related record IDs:** NBT-DLG-066-01c
- **Map or system:** New Bark Town, T20R0401 (header 66)
- **Speaker, object, or trigger:** Shown by NBT-EVT-066-01 (Function#1) when flag 741 is set, female player (`GenderMessage 2 3`, second slot).
- **Source references:** script file 848 Function#1 `GenderMessage 2 3`; text archive 548 msg 3
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Hi, {STRVAR_1, 3, 0, 0}! / Ethan is not here. // He’s been keeping himself busy / helping the professor. // He’s busier than I am!
- **OLD raw message data:** `Hi, {STRVAR_1, 3, 0, 0}!\nEthan is not here.\rHe’s been keeping himself busy\nhelping the professor.\fHe’s busier than I am!`
- **OLD trigger:** `JumpIf EQUAL Function#1` after `CheckFlag 741`.
- **OLD conditions and branch priority:** Same as 01c, female player. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Same as 01c.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Same as 01c.
- **OLD dependencies and shared-resource effects:** Same as 01c.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 548 msg 3
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Female player, flag 741 set.

#### NBT-DLG-066-01e — "Lyra is upstairs ... as usual" (male player)
##### Record identity
- **Record ID:** NBT-DLG-066-01e
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-066-01
- **Related record IDs:** NBT-DLG-066-01f
- **Map or system:** New Bark Town, T20R0401 (header 66)
- **Speaker, object, or trigger:** Shown by NBT-EVT-066-01 (Function#2) when flag 741 is clear AND var 0x4108 >= 1, male player (`GenderMessage 4 5`, first slot).
- **Source references:** script file 848 Function#2 `GenderMessage 4 5`; text archive 548 msg 4
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Hi, {STRVAR_1, 3, 0, 0}! / Lyra is upstairs. // She’s playing games with her Pokémon / as usual.
- **OLD raw message data:** `Hi, {STRVAR_1, 3, 0, 0}!\nLyra is upstairs.\rShe’s playing games with her Pokémon\nas usual.`
- **OLD trigger:** `JumpIf GREATER/EQUAL Function#2` after `CompareVarValue 0x4108 1`.
- **OLD conditions and branch priority:** Second priority: reached only if flag 741 is clear; var 0x4108 >= 1 (any value 1 or above, no upper bound checked). Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** NBT-EVT-066-01 Function#2: `TextPlayerName 0`, `GenderMessage 4 5`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats until 741 is set.
- **OLD dependencies and shared-resource effects:** Var 0x4108 / flag 741 shared as listed.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 548 msg 4
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Male player, flag 741 clear, var 0x4108 >= 1.

#### NBT-DLG-066-01f — "Ethan is upstairs ... as usual" (female player)
##### Record identity
- **Record ID:** NBT-DLG-066-01f
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-066-01
- **Related record IDs:** NBT-DLG-066-01e
- **Map or system:** New Bark Town, T20R0401 (header 66)
- **Speaker, object, or trigger:** Shown by NBT-EVT-066-01 (Function#2) when flag 741 is clear AND var 0x4108 >= 1, female player (`GenderMessage 4 5`, second slot).
- **Source references:** script file 848 Function#2 `GenderMessage 4 5`; text archive 548 msg 5
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Hi, {STRVAR_1, 3, 0, 0}! / Ethan is upstairs. // He’s having fun with his Pokémon / as usual.
- **OLD raw message data:** `Hi, {STRVAR_1, 3, 0, 0}!\nEthan is upstairs.\rHe’s having fun with his Pokémon\nas usual.`
- **OLD trigger:** As 01e.
- **OLD conditions and branch priority:** As 01e, female player. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** As 01e.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** As 01e.
- **OLD dependencies and shared-resource effects:** As 01e.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 548 msg 5
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Female player, same state.

#### NBT-EVT-066-W0 — Door out to the exterior
##### Record identity
- **Record ID:** NBT-EVT-066-W0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-066-W1
- **Map or system:** New Bark Town, T20R0401 (header 66)
- **Speaker, object, or trigger:** Warp tile at (3,10); no script.
- **Source references:** event file 63 warps idx 0 (header 60, anchor 3, height 0)
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Step on the warp tile (3,10).
- **OLD conditions and branch priority:** None (warps carry no flag). Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Step on warp; arrive at header 60 (New Bark Town exterior), anchor 3 of its warp list.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats each time.
- **OLD dependencies and shared-resource effects:** Header 60's warp anchor 3 (not checked here).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 63 warps idx 0
- **Other affected callers or records:** Matching door warp in header 60's event file (its section).
- **Unresolved questions:** Whether header 60's door for this house points at header 66 with a matching anchor (not checked here).
- **Validation needed:** Warp both ways in game.

#### NBT-EVT-066-W1 — Stairs up to header 384
##### Record identity
- **Record ID:** NBT-EVT-066-W1
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-384-W0 (return warp); NBT-EVT-066-01
- **Map or system:** New Bark Town, T20R0401 (header 66)
- **Speaker, object, or trigger:** Warp tile at (3,3); no script.
- **Source references:** event file 63 warps idx 1 (header 384, anchor 0, height 0)
- **Evidence status:** Verified (the "stairs" description is Inferred from the destination being the room the text calls "upstairs")
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Step on the warp tile (3,3).
- **OLD conditions and branch priority:** None (no flag or variable gate on the warp). Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Step on warp; arrive at header 384 (T20R0402), anchor 0 of that map's warp list; level script 622 `mapChange` then runs (NBT-EVT-384-LS).
- **OLD state changes:** None by the warp itself.
- **OLD repeat/completion behavior:** Repeats each time.
- **OLD dependencies and shared-resource effects:** Entering header 384 triggers its level script (script 849 Script#3).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 63 warps idx 1
- **Other affected callers or records:** Return warp is header 384's warps idx 0 (NBT-EVT-384-W0).
- **Unresolved questions:** None.
- **Validation needed:** Up and down in game.

## Map 384 — T20R0402

**Map 384 sources:** header 384 `T20R0402` (matrix 72, area data 25, music 1018; upstairs of header 66, reached by header 66 warps idx 1); event file 341; script file 849 (5 scripts, 14 functions, 0 actions); level script 622 (1 entry: `mapChange` -> script 3); text archive 549 (19 messages). `list_changes` shows no edit to event file 341, script 849, level script 622 or text 549. `project/scripts/0849.script` matches `get_script 849` line for line (checked the whole file). Rendering convention: see the Map 065 note. Dialogue letters follow the message index among the messages used by Script 1 (a = msg 0, b = 1, c = 2, d = 3, e = 5, f = 6, g = 7, h = 8, i = 9, j = 10, k = 11, l = 12, m = 13, n = 14, o = 15, p = 16); message 4 is NBT-DLG-384-02a, message 17 NBT-DLG-384-04a, message 18 NBT-DLG-384-05a. `GenderMessage a b` = a to a male player, b to a female player (even messages name Lyra, odd messages name Ethan, consistent with that). Names such as `FLAG_GOT_STARTER` (106), `FLAG_HIDE_NEW_BARK_FRIENDS_ROOM_FRIEND` (741), `FLAG_UNK_161` (353), `FLAG_UNK_184` (388), `VAR_SCENE_ELMS_LAB` (0x4108), `VAR_OBJ_0` (0x4020) come from hg-engine `armips/include/flags.s` / `vars.s`.

### Map 384 event inventory

| Section | Idx | Type | owID / sprite (overlayTableEntry) | Coordinates (global) | Flag (hides NPC when set) | scriptNumber | Covering record |
|---|---|---|---|---|---|---|---|
| overworlds | 0 | Normal, movement 16 (Facing Left), orientation 2, no wander | owID 0 / sprite 101 | (7,7) | 741 (`FLAG_HIDE_NEW_BARK_FRIENDS_ROOM_FRIEND`) | 1 | NBT-EVT-384-01 |
| overworlds | 1 | Normal, movement 44 (Running Right, Down, Left, Up), orientation 1, xRange 2, yRange 2 | owID 1 / sprite 1032 | (4,6) | 741 | 2 | NBT-EVT-384-02 |
| spawnables | 0 | Misc, activated from any direction (dir 4) | n/a | (8,4) | n/a | 4 | NBT-EVT-384-04 |
| spawnables | 1 | Misc, front interaction (dir 0) | n/a | (6,4) | n/a | 5 | NBT-EVT-384-05 |
| warps | 0 | warp to header 66, anchor 1 | n/a | (3,4) | n/a | n/a | NBT-EVT-384-W0 |
| triggers | none | n/a | n/a | n/a | n/a | n/a | n/a (0 entries) |
| level script 622 | 0 | `mapChange` -> script 3 | n/a | n/a | n/a | 3 | NBT-EVT-384-LS |

**Reconciliation:** event file 341 holds 2 spawnables + 2 overworlds + 1 warp = 5 entries, all covered, plus the 1 level-script entry. Script file 849: Scripts 1-5 and Functions 1-14 all covered (Script 1 with Functions 1, 2, 4-14 in NBT-EVT-384-01; Script 2 in -02; Script 3 with Function 3 in -LS; Script 4 in -04; Script 5 in -05). Text archive 549 holds 19 messages (0-18); all 19 are referenced by script 849; no unreferenced messages.

#### NBT-EVT-384-01 — Friend (Lyra/Ethan) talk: elm's lab hint, Shiny Leaf check, friendship talk
##### Record identity
- **Record ID:** NBT-EVT-384-01
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-384-01a to 384-01p (dialogue); NBT-EVT-384-02; NBT-EVT-384-LS; NBT-EVT-066-01; NBT-EVT-384-W0
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** Overworld idx 0 (owID 0, sprite 101, facing left, stationary) at (7,7); talk to it (Script 1). The text speaks as "Lyra" (male player) or "Ethan" (female player).
- **Source references:** script file 849 Script#1, Function#1, #2, #4, #5, #6, #7, #8, #9, #10, #11, #12, #13, #14; event file 341 overworlds idx 0 (scriptNumber 1, flag 741); text archive 549 msgs 0-3 and 5-16
- **Evidence status:** Verified (script, branches, text); Inferred for the meaning of `GetShinyLeafCount`/`TryGiveShinyLeafCrown`/`GetFollowingPokePartySlot` (taken from command names only); Inferred that sprite 101 is the friend (see Unresolved questions)
##### OLD — Current content
- **OLD dialogue:** Not applicable (held by NBT-DLG-384-01a to 01p).
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Player interacts (talk) with overworld idx 0. The NPC is hidden whenever flag 741 is set (see Dependencies).
- **OLD conditions and branch priority:** After `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`: (1) `CheckBadge 0 0x800C`; if 0x800C == 1 (badge 0 owned) -> Function#1 (the "has badge" branch). (2) Otherwise `TextPlayerName 0`, then `CheckFlag 106` (`FLAG_GOT_STARTER`): set -> Function#2 (msgs 2/3). (3) Otherwise (badge 0 not owned AND flag 106 clear) `GenderMessage 0 1` (msgs 0/1). Function#1 (badge owned): `GetFirstAlivePokemonSlot 0x8006`; `GetShinyLeafCount 0x8006 0x800C`; then (1a) `CheckFlag 353` set -> Function#4 (count branch below); (1b) else if 0x800C >= 1 -> Function#5 (first-leaf message, sets 353); (1c) else `GenderMessage 5 6` (msgs 5/6). Function#4: copies 0x800C to 0x8004, then 0x8004 == 6 -> Function#6; ==5 -> Function#7; >= 1 -> Function#8; else (0) -> Function#9 (msgs 5/6). Function#8: 0x8004 == 1 -> 0x8005 = 4 -> Function#12; else Function#11: ==2 -> 0x8005 = 3 -> Function#12; else Function#13: ==3 -> 0x8005 = 2 -> Function#12; else Function#14 (count 4, or any remaining value: 0x8005 = 1; same messages as #12). Directly checked: badge 0, flag 106, flag 353, leaf count of the first non-fainted party Pokémon (slot from 0x8006). Prerequisites that are not checked: party contents are not checked in the not-badge branch, despite what msgs 0/1 might suggest. Readers/writers: flag 106 (`FLAG_GOT_STARTER`) readers: 842, 843, 845, 849 (all NBT-local); writer: script 843 Script 13 (`SetFlag 106` after `StarterSelectionScreen`, NBT-local). Flag 353 (`FLAG_UNK_161`): set only in script 849 Function#5; no other reader or writer found in `project/scripts/` (decimal and name search; level scripts not searched). Flag 388 (`FLAG_UNK_184`): set only in script 849 Function#7; no other reader or writer found. Vars 0x8004, 0x8005, 0x8006, 0x800C are scratch variables. NPC visibility: hidden while flag 741 is set. Reachability class: Referenced and apparently reachable, but the 741 gate (writers listed in NBT-EVT-066-01 and in the Dependencies below) decides whether the NPC exists; the order in play was not inferred.
- **OLD event sequence:** (1) Talk. (2) Fanfare, lock, face player, then the branch order above. (3) Branch leaves, with their message ids: not-badge/no-starter: msgs 0/1 (NBT-DLG-384-01a/b), then `WaitButton`, `CloseMessage`, `ReleaseAll`. not-badge/starter: `TextPartyPokemon 1 0x800C` then msgs 2/3 (01c/d), `WaitButton`, `CloseMessage`, `ReleaseAll` (0x800C is 0 here, Inferred from the failed `== 1` test, so the Pokémon named is the first party slot). badge/flag 353 clear/0 leaves: msgs 5/6 (01e/f). badge/first leaf (>= 1 leaf, 353 clear): `SetFlag 353`, msgs 7/8 (01g/h), `WaitButton`, `CloseMessage`, `ReleaseAll`. badge/353 set/1-4 leaves: `TextNumber 1 0x8004`, `TextNumber 2 0x8005`, msgs 9/10 (01i/j; "collected N", "collect M more"; N/M pairs 1/4, 2/3, 3/2, 4/1), `WaitButton`, `CloseMessage`, `ReleaseAll`. badge/353 set/5 leaves: Function#7: `TryGiveShinyLeafCrown 0x8006`, `SetFlag 388`, msgs 11/12 (01k/l), `CloseMessage`, `FadeScreen 6 1 0 0`, `WaitFadeScreen`, `OpenPokedexScreen 2`, `ReturnScreen`, `FadeScreen 6 1 1 0`, `WaitFadeScreen`, msgs 13/14 (01m/n), `WaitButton`, `CloseMessage`, `ReleaseAll`. badge/353 set/6 leaves: Function#6: `GetFollowingPokePartySlot 0x800C`, `TextPokeNickname 1 0x800C`, msgs 15/16 (01o/p), `CloseMessage`, then Function#10: fade, `OpenPokedexScreen 2`, `ReturnScreen`, fade back, msgs 13/14 (01m/n), `WaitButton`, `CloseMessage`, `ReleaseAll`. badge/353 set/0 leaves: Function#9 msgs 5/6 (01e/f). (4) Fanfare, lock, NPC faces player; screen fade and Pokédex screen (arg 2) as listed. (5) Flags 353, 388 set; possible Shiny-Leaf-crown item/state change by `TryGiveShinyLeafCrown`; no other. (6) Described in repeat behaviour. (7) No `CommonScript`, no GLB call. The `OpenPokedexScreen 2` / `TryGiveShinyLeafCrown` are engine commands in script 849, not GLB records.
- **OLD state changes:** `SetFlag 353` (first time the badge holder has >= 1 leaf); `SetFlag 388` plus `TryGiveShinyLeafCrown 0x8006` at 5 leaves (the crown handover is the effect implied by the command name and by msg 11/12 text "I will give you this, too!"; the gift itself is Inferred, not decoded). Scratch vars 0x8004/5/6/0x800C written.
- **OLD repeat/completion behavior:** Repeatable. Flag 353 makes every later talk use the count branch. At 5 leaves the crown branch repeats on each talk (flag 388 is set but never checked in this script, so the `TryGiveShinyLeafCrown` call is repeated; whether the command refuses a second crown is not verified). 6 leaves: Pokédex award branch, repeats.
- **OLD dependencies and shared-resource effects:** Flags 106, 353, 388, 741 (visibility); badge 0; party Pokémon data (Shiny Leaf count, following Pokémon). Flag 741 writers: see NBT-EVT-066-01 (set by 843 Script 3/Function 12 NBT-local, 112 Function 7/8; cleared by 859 Function 8, 21 Function 1/2, 104 Function 1/2; files 21/104/112/859 headers not resolved). Gender-dependent text.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 849 Script#1 and Functions 1, 2, 4-14; text archive 549 msgs 0-3, 5-16; event file 341 overworlds idx 0
- **Other affected callers or records:** None found outside this event for those Functions (Function#3 is reached only from Script#3). Script#1 is referenced only by event file 341 overworlds idx 0. Messages 549:5/6 are used by two branches (Function#1 default and Function#9); 549:13/14 by two (Function#7 and Function#10).
- **Unresolved questions:** (a) Pairing of sprites to scripts: overworld idx 0 (sprite 101) runs the friend script and idx 1 (sprite 1032, the sprite-by-variable code, `1000 + (var & 0xFF)` per docs/partner-sprite.md, i.e. var 0x4020 filled by `GetCounterpartSprite 0x4020` in Script#3) runs the Marill script; the data is read as it is stored, but which sprite is drawn for which was not checked. (b) Whether `TryGiveShinyLeafCrown` can give a second crown. (c) Headers of script files 21, 104, 112, 859. (d) Level scripts of other maps that may read/write 741 or 0x4108 were not searched.
- **Validation needed:** Play each branch for both genders; test 0, 1-4, 5 and 6 leaves, with and without flag 353; after any change verify flags 353/388 handling.

#### NBT-DLG-384-01a — "Professor Elm was looking for you" (male player)
##### Record identity
- **Record ID:** NBT-DLG-384-01a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-01
- **Related record IDs:** NBT-DLG-384-01b
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** Shown by NBT-EVT-384-01 when badge 0 is NOT owned (`CheckBadge 0` result != 1) AND flag 106 (`FLAG_GOT_STARTER`) is clear, male player (`GenderMessage 0 1`, first slot).
- **Source references:** script file 849 Script#1 `GenderMessage 0 1`; text archive 549 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Lyra: {STRVAR_1, 3, 0, 0}! // Professor Elm was looking for you. / Did you go to his lab?
- **OLD raw message data:** `Lyra: {STRVAR_1, 3, 0, 0}!\rProfessor Elm was looking for you.\nDid you go to his lab?`
- **OLD trigger:** Last branch of Script#1.
- **OLD conditions and branch priority:** Third priority: only if the badge test fails and flag 106 is clear. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** NBT-EVT-384-01 step (3), first leaf.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats until flag 106 is set or badge 0 owned.
- **OLD dependencies and shared-resource effects:** Flag 106 (writer 843 Script 13).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 0
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Male player, no starter, no badge.

#### NBT-DLG-384-01b — "Professor Elm was looking for you" (female player)
##### Record identity
- **Record ID:** NBT-DLG-384-01b
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-01
- **Related record IDs:** NBT-DLG-384-01a
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** As 01a, female player (`GenderMessage 0 1`, second slot).
- **Source references:** script file 849 Script#1 `GenderMessage 0 1`; text archive 549 msg 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Ethan: {STRVAR_1, 3, 0, 0}! // Professor Elm was looking for you. / Did you go to his lab?
- **OLD raw message data:** `Ethan: {STRVAR_1, 3, 0, 0}!\rProfessor Elm was looking for you.\nDid you go to his lab?`
- **OLD trigger:** As 01a.
- **OLD conditions and branch priority:** As 01a. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** As 01a.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** As 01a.
- **OLD dependencies and shared-resource effects:** As 01a.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 1
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Female player, same state.

#### NBT-DLG-384-01c — "My MARILL is super cute ... your [Pokémon] looks pretty good" (male player)
##### Record identity
- **Record ID:** NBT-DLG-384-01c
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-01
- **Related record IDs:** NBT-DLG-384-01d
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** Shown by NBT-EVT-384-01 Function#2 when badge 0 is NOT owned AND flag 106 is set, male player (`GenderMessage 2 3`, first slot).
- **Source references:** script file 849 Function#2 `GenderMessage 2 3`; text archive 549 msg 2
- **Evidence status:** Verified (token fill Inferred: `TextPartyPokemon 1 0x800C` fills {STRVAR_1, 0, 1, 0}, and 0x800C is 0 so the first party slot)
##### OLD — Current content
- **OLD dialogue:** Lyra: My MARILL is super cute... / But your {STRVAR_1, 0, 1, 0} looks pretty // good, too, {STRVAR_1, 3, 0, 0}!
- **OLD raw message data:** `Lyra: My MARILL is super cute...\nBut your {STRVAR_1, 0, 1, 0} looks pretty\fgood, too, {STRVAR_1, 3, 0, 0}!`
- **OLD trigger:** `JumpIf EQUAL Function#2` after `CheckFlag 106`.
- **OLD conditions and branch priority:** Second priority; reachable only without badge 0 and with flag 106 set. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** NBT-EVT-384-01 Function#2: `TextPartyPokemon 1 0x800C`, `GenderMessage 2 3`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats until badge 0 is owned.
- **OLD dependencies and shared-resource effects:** Party slot 0 Pokémon (name shown); flag 106; badge 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 2
- **Other affected callers or records:** None found.
- **Unresolved questions:** Which party slot the token shows is Inferred.
- **Validation needed:** Male player with starter, no badge.

#### NBT-DLG-384-01d — "My MARILL is super cool ... your [Pokémon] looks pretty good" (female player)
##### Record identity
- **Record ID:** NBT-DLG-384-01d
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-01
- **Related record IDs:** NBT-DLG-384-01c
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** As 01c, female player (`GenderMessage 2 3`, second slot).
- **Source references:** script file 849 Function#2 `GenderMessage 2 3`; text archive 549 msg 3
- **Evidence status:** Verified (token fill Inferred as in 01c)
##### OLD — Current content
- **OLD dialogue:** Ethan: My MARILL is super cool... / But your {STRVAR_1, 0, 1, 0} looks pretty // good, too, {STRVAR_1, 3, 0, 0}!
- **OLD raw message data:** `Ethan: My MARILL is super cool...\nBut your {STRVAR_1, 0, 1, 0} looks pretty\fgood, too, {STRVAR_1, 3, 0, 0}!`
- **OLD trigger:** As 01c.
- **OLD conditions and branch priority:** As 01c. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** As 01c.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** As 01c.
- **OLD dependencies and shared-resource effects:** As 01c.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 3
- **Other affected callers or records:** None found.
- **Unresolved questions:** As 01c.
- **Validation needed:** Female player, same state.

#### NBT-DLG-384-01e — "Isn't it strange that when we are with Pokémon, going out is so much more fun" (male player)
##### Record identity
- **Record ID:** NBT-DLG-384-01e
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-01
- **Related record IDs:** NBT-DLG-384-01f
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** Shown by NBT-EVT-384-01 when badge 0 IS owned AND the first non-fainted party Pokémon has 0 Shiny Leaves (`GetShinyLeafCount` result < 1), via either Function#1 default (flag 353 clear) or Function#9 (flag 353 set), male player (`GenderMessage 5 6`, first slot).
- **Source references:** script file 849 Function#1 and Function#9 `GenderMessage 5 6`; text archive 549 msg 5
- **Evidence status:** Verified (leaf-count meaning Inferred from the command name)
##### OLD — Current content
- **OLD dialogue:** Lyra: Isn’t it strange that when we are / with Pokémon, going out is just so much / more fun! // {STRVAR_1, 3, 0, 0}! / Try going to different places and talk / to your Pokémon! // I bet you’ll find out so many things / about them!
- **OLD raw message data:** `Lyra: Isn’t it strange that when we are\nwith Pokémon, going out is just so much\fmore fun!\r{STRVAR_1, 3, 0, 0}!\nTry going to different places and talk\fto your Pokémon!\rI bet you’ll find out so many things\nabout them!`
- **OLD trigger:** Function#1 default path, or Function#4 -> Function#9.
- **OLD conditions and branch priority:** Badge 0 owned; leaf count 0. Whether flag 353 is clear (Function#1) or set (Function#9) does not change the text. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `TextPlayerName 0`, `GenderMessage 5 6`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats while the count stays 0.
- **OLD dependencies and shared-resource effects:** Badge 0, party Pokémon, flag 353.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 5
- **Other affected callers or records:** Used by two branches of the same event (Function#1, Function#9).
- **Unresolved questions:** None.
- **Validation needed:** Male player with badge 0 and a Pokémon holding no leaf.

#### NBT-DLG-384-01f — same, female player
##### Record identity
- **Record ID:** NBT-DLG-384-01f
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-01
- **Related record IDs:** NBT-DLG-384-01e
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** As 01e, female player (`GenderMessage 5 6`, second slot).
- **Source references:** script file 849 Function#1 and Function#9 `GenderMessage 5 6`; text archive 549 msg 6
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Ethan: Isn’t it strange that when we / are with Pokémon, going out is just so / much more fun! // {STRVAR_1, 3, 0, 0}! / Try going to different places and talk / to your Pokémon! // I bet you’ll find so many things / about them!
- **OLD raw message data:** `Ethan: Isn’t it strange that when we\nare with Pokémon, going out is just so\fmuch more fun!\r{STRVAR_1, 3, 0, 0}!\nTry going to different places and talk\fto your Pokémon!\rI bet you’ll find so many things\nabout them!`
- **OLD trigger:** As 01e.
- **OLD conditions and branch priority:** As 01e. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** As 01e.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** As 01e.
- **OLD dependencies and shared-resource effects:** As 01e.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 6
- **Other affected callers or records:** Used by two branches of the same event.
- **Unresolved questions:** None.
- **Validation needed:** Female player, same state.

#### NBT-DLG-384-01g — First Shiny Leaf spotted (male player)
##### Record identity
- **Record ID:** NBT-DLG-384-01g
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-01
- **Related record IDs:** NBT-DLG-384-01h
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** Shown by NBT-EVT-384-01 Function#5 when badge 0 is owned AND flag 353 is clear AND leaf count >= 1, male player (`GenderMessage 7 8`, first slot).
- **Source references:** script file 849 Function#5 `GenderMessage 7 8`; text archive 549 msg 7
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Lyra: Hi, {STRVAR_1, 3, 0, 0}! / How are your Pokémon? // Don’t forget to talk to... // What’s that? / Your Pokémon is holding a leaf... // Could that be a Shiny Leaf? / Legend has it that only Pokémon // that have formed a close bond with // people can find such leaves... // People used to turn the leaves into a / beautiful crown when they managed // to collect five of them. // Wow! / I knew you could obtain one, // {STRVAR_1, 3, 0, 0}! // Let me see it when you find another!
- **OLD raw message data:** `Lyra: Hi, {STRVAR_1, 3, 0, 0}!\nHow are your Pokémon?\fDon’t forget to talk to...\rWhat’s that?\nYour Pokémon is holding a leaf...\rCould that be a Shiny Leaf?\nLegend has it that only Pokémon\fthat have formed a close bond with\fpeople can find such leaves...\rPeople used to turn the leaves into a\nbeautiful crown when they managed\fto collect five of them.\rWow!\nI knew you could obtain one,\f{STRVAR_1, 3, 0, 0}!\fLet me see it when you find another!`
- **OLD trigger:** Function#5.
- **OLD conditions and branch priority:** Badge 0 owned; flag 353 clear; count >= 1 (checked before the zero-leaf default). After this, flag 353 is set, so this text plays once. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `SetFlag 353`, `TextPlayerName 0`, `GenderMessage 7 8`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** `SetFlag 353`.
- **OLD repeat/completion behavior:** Once (until flag 353 is cleared elsewhere; no clearer found in `project/scripts/`).
- **OLD dependencies and shared-resource effects:** Flag 353.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 7
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Male player, badge 0, a leaf held, flag 353 clear.

#### NBT-DLG-384-01h — First Shiny Leaf spotted (female player)
##### Record identity
- **Record ID:** NBT-DLG-384-01h
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-01
- **Related record IDs:** NBT-DLG-384-01g
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** As 01g, female player (`GenderMessage 7 8`, second slot).
- **Source references:** script file 849 Function#5 `GenderMessage 7 8`; text archive 549 msg 8
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Ethan: Hi, {STRVAR_1, 3, 0, 0}! / How are your Pokémon? // Don’t forget to talk to... // What’s that? / Your Pokémon is holding a leaf... // Could that be a Shiny Leaf? / Legend has it that only Pokémon // that have formed a close bond with // people can find such leaves... // People used to turn the leaves into a / beautiful crown when they managed // to collect five of them. // Wow! / I knew you could obtain one, // {STRVAR_1, 3, 0, 0}! // Let me see it when you find another!
- **OLD raw message data:** `Ethan: Hi, {STRVAR_1, 3, 0, 0}!\nHow are your Pokémon?\fDon’t forget to talk to...\rWhat’s that?\nYour Pokémon is holding a leaf...\rCould that be a Shiny Leaf?\nLegend has it that only Pokémon\fthat have formed a close bond with\fpeople can find such leaves...\rPeople used to turn the leaves into a\nbeautiful crown when they managed\fto collect five of them.\rWow!\nI knew you could obtain one,\f{STRVAR_1, 3, 0, 0}!\fLet me see it when you find another!`
- **OLD trigger:** As 01g.
- **OLD conditions and branch priority:** As 01g. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** As 01g.
- **OLD state changes:** `SetFlag 353`.
- **OLD repeat/completion behavior:** As 01g.
- **OLD dependencies and shared-resource effects:** Flag 353.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 8
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Female player, same state.

#### NBT-DLG-384-01i — Shiny Leaf progress report (male player)
##### Record identity
- **Record ID:** NBT-DLG-384-01i
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-01
- **Related record IDs:** NBT-DLG-384-01j
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** Shown by NBT-EVT-384-01 (Function#12, and Function#14 which has the same lines) when badge 0 owned AND flag 353 set AND leaf count is 1, 2, 3 or 4 (counts other than 0, 5, 6 end in Function#14), male player (`GenderMessage 9 10`, first slot).
- **Source references:** script file 849 Function#12 and Function#14 `GenderMessage 9 10`; text archive 549 msg 9
- **Evidence status:** Verified (the two numeric tokens are Inferred from `TextNumber 1 0x8004` = count and `TextNumber 2 0x8005` = leaves remaining; pairs 1/4, 2/3, 3/2, 4/1)
##### OLD — Current content
- **OLD dialogue:** Lyra: Hi, {STRVAR_1, 3, 0, 0}! / How is your Pokémon you’re // walking with? // You can talk to it as you walk from time / to time to nurture your friendship! // ... / Oh! // You found a Shiny Leaf! / Let me see! // Ha! You’ve collected... // {STRVAR_1, 50, 1, 0}! // Way to go! / Keep it up and collect {STRVAR_1, 50, 2, 0} more!
- **OLD raw message data:** `Lyra: Hi, {STRVAR_1, 3, 0, 0}!\nHow is your Pokémon you’re\fwalking with?\rYou can talk to it as you walk from time\nto time to nurture your friendship!\r...\nOh!\rYou found a Shiny Leaf!\nLet me see!\rHa! You’ve collected...\r{STRVAR_1, 50, 1, 0}!\rWay to go!\nKeep it up and collect {STRVAR_1, 50, 2, 0} more!`
- **OLD trigger:** Function#4 -> Function#8 -> (#11 / #13) -> Function#12, or -> Function#14.
- **OLD conditions and branch priority:** Reached after the 6 and 5 checks fail and count >= 1. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `TextPlayerName 0`, `TextNumber 1 0x8004`, `TextNumber 2 0x8005`, `GenderMessage 9 10`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** Scratch vars 0x8004 (count), 0x8005 (remaining) only.
- **OLD repeat/completion behavior:** Repeats with the current count.
- **OLD dependencies and shared-resource effects:** Flag 353; leaf count.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 9
- **Other affected callers or records:** Used by two Functions (#12 and #14) of the same event.
- **Unresolved questions:** None.
- **Validation needed:** Male player with 1, 2, 3 and 4 leaves.

#### NBT-DLG-384-01j — Shiny Leaf progress report (female player)
##### Record identity
- **Record ID:** NBT-DLG-384-01j
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-01
- **Related record IDs:** NBT-DLG-384-01i
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** As 01i, female player (`GenderMessage 9 10`, second slot).
- **Source references:** script file 849 Function#12 and Function#14 `GenderMessage 9 10`; text archive 549 msg 10
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Ethan: Hi, {STRVAR_1, 3, 0, 0}! / How is your Pokémon you’re // walking with? // You can talk to it as you walk from time / to time to nurture your friendship! // ... / Oh! // You found a Shiny Leaf! / Let me see! // Ha! You’ve collected... // {STRVAR_1, 50, 1, 0}! // Way to go! / Keep it up and collect {STRVAR_1, 50, 2, 0} more!
- **OLD raw message data:** `Ethan: Hi, {STRVAR_1, 3, 0, 0}!\nHow is your Pokémon you’re\fwalking with?\rYou can talk to it as you walk from time\nto time to nurture your friendship!\r...\nOh!\rYou found a Shiny Leaf!\nLet me see!\rHa! You’ve collected...\r{STRVAR_1, 50, 1, 0}!\rWay to go!\nKeep it up and collect {STRVAR_1, 50, 2, 0} more!`
- **OLD trigger:** As 01i.
- **OLD conditions and branch priority:** As 01i. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** As 01i.
- **OLD state changes:** As 01i.
- **OLD repeat/completion behavior:** As 01i.
- **OLD dependencies and shared-resource effects:** As 01i.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 10
- **Other affected callers or records:** Used by two Functions of the same event.
- **Unresolved questions:** None.
- **Validation needed:** Female player, 1-4 leaves.

#### NBT-DLG-384-01k — Five Shiny Leaves: crown given (male player)
##### Record identity
- **Record ID:** NBT-DLG-384-01k
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-01
- **Related record IDs:** NBT-DLG-384-01l; NBT-DLG-384-01m
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** Shown by NBT-EVT-384-01 Function#7 when badge 0 owned AND flag 353 set AND leaf count == 5, male player (`GenderMessage 11 12`, first slot).
- **Source references:** script file 849 Function#7 `GenderMessage 11 12`; text archive 549 msg 11
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Lyra: Hi, {STRVAR_1, 3, 0, 0}! / How is your Pokémon you’re // walking with? // You can talk to it as you walk from time / to time to nurture your friendship! // ... // Ha! You have already collected five // Shiny Leaves! // Let me turn them into a crown! / And what’s more... // I will give you this, too! //
- **OLD raw message data:** `Lyra: Hi, {STRVAR_1, 3, 0, 0}!\nHow is your Pokémon you’re\fwalking with?\rYou can talk to it as you walk from time\nto time to nurture your friendship!\r...\rHa! You have already collected five\fShiny Leaves!\rLet me turn them into a crown!\nAnd what’s more...\fI will give you this, too!\r`
- **OLD trigger:** Function#7, after `TryGiveShinyLeafCrown 0x8006` and `SetFlag 388`.
- **OLD conditions and branch priority:** Count == 5 checked after count == 6. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `TryGiveShinyLeafCrown 0x8006`, `SetFlag 388`, `TextPlayerName 0`, `GenderMessage 11 12`, `CloseMessage`, then the fade/Pokédex screen sequence and msgs 13/14 (NBT-DLG-384-01m/n).
- **OLD state changes:** `SetFlag 388`; crown effect of `TryGiveShinyLeafCrown` (Inferred from name/text).
- **OLD repeat/completion behavior:** Repeats on each talk while count stays 5 (flag 388 is never checked here).
- **OLD dependencies and shared-resource effects:** Flag 388; party Pokémon data.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 11
- **Other affected callers or records:** None found.
- **Unresolved questions:** What exactly the crown/item is (not decoded).
- **Validation needed:** Male player, 5 leaves.

#### NBT-DLG-384-01l — Five Shiny Leaves: crown given (female player)
##### Record identity
- **Record ID:** NBT-DLG-384-01l
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-01
- **Related record IDs:** NBT-DLG-384-01k
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** As 01k, female player (`GenderMessage 11 12`, second slot).
- **Source references:** script file 849 Function#7 `GenderMessage 11 12`; text archive 549 msg 12
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Ethan: Hi, {STRVAR_1, 3, 0, 0}! / How is your Pokémon you’re // walking with? // You can talk to it as you walk from time / to time to nurture your friendship! // ... // Ha! You have already collected five // Shiny Leaves! // Let me turn them into a crown! / And what’s more... // I will give you this, too! //
- **OLD raw message data:** `Ethan: Hi, {STRVAR_1, 3, 0, 0}!\nHow is your Pokémon you’re\fwalking with?\rYou can talk to it as you walk from time\nto time to nurture your friendship!\r...\rHa! You have already collected five\fShiny Leaves!\rLet me turn them into a crown!\nAnd what’s more...\fI will give you this, too!\r`
- **OLD trigger:** As 01k.
- **OLD conditions and branch priority:** As 01k. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** As 01k.
- **OLD state changes:** As 01k.
- **OLD repeat/completion behavior:** As 01k.
- **OLD dependencies and shared-resource effects:** As 01k.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 12
- **Other affected callers or records:** None found.
- **Unresolved questions:** As 01k.
- **Validation needed:** Female player, 5 leaves.

#### NBT-DLG-384-01m — "Cherish your friendship with Pokémon for years to come!" (male player)
##### Record identity
- **Record ID:** NBT-DLG-384-01m
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-01
- **Related record IDs:** NBT-DLG-384-01n; NBT-DLG-384-01k; NBT-DLG-384-01o
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** Shown by NBT-EVT-384-01 after the Pokédex screen (`OpenPokedexScreen 2`, `ReturnScreen`), in Function#7 (5 leaves) and in Function#10 (reached from Function#6, 6 leaves), male player (`GenderMessage 13 14`, first slot).
- **Source references:** script file 849 Function#7 and Function#10 `GenderMessage 13 14`; text archive 549 msg 13
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Lyra: Cherish your friendship with / Pokémon for years to come!
- **OLD raw message data:** `Lyra: Cherish your friendship with\nPokémon for years to come!`
- **OLD trigger:** After the fade-out/Pokédex screen/fade-in.
- **OLD conditions and branch priority:** Badge 0 owned; flag 353 set; count 5 (via #7) or 6 (via #6 -> #10). Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `GenderMessage 13 14`, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Pokédex screen (arg 2) engine command.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 13
- **Other affected callers or records:** Used by two Functions (#7, #10).
- **Unresolved questions:** None.
- **Validation needed:** Male player, 5 and 6 leaves.

#### NBT-DLG-384-01n — "Cherish your friendship with Pokémon for years to come!" (female player)
##### Record identity
- **Record ID:** NBT-DLG-384-01n
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-01
- **Related record IDs:** NBT-DLG-384-01m
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** As 01m, female player (`GenderMessage 13 14`, second slot).
- **Source references:** script file 849 Function#7 and Function#10 `GenderMessage 13 14`; text archive 549 msg 14
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Ethan: Cherish your friendship with / Pokémon for years to come!
- **OLD raw message data:** `Ethan: Cherish your friendship with\nPokémon for years to come!`
- **OLD trigger:** As 01m.
- **OLD conditions and branch priority:** As 01m. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** As 01m.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** As 01m.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 14
- **Other affected callers or records:** Used by two Functions (#7, #10).
- **Unresolved questions:** None.
- **Validation needed:** Female player, 5 and 6 leaves.

#### NBT-DLG-384-01o — Six Shiny Leaves: "check on the award with [nickname]" (male player)
##### Record identity
- **Record ID:** NBT-DLG-384-01o
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-01
- **Related record IDs:** NBT-DLG-384-01p; NBT-DLG-384-01m
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** Shown by NBT-EVT-384-01 Function#6 when badge 0 owned AND flag 353 set AND leaf count == 6 (checked first among the counts), male player (`GenderMessage 15 16`, first slot).
- **Source references:** script file 849 Function#6 `GenderMessage 15 16`; text archive 549 msg 15
- **Evidence status:** Verified (token {STRVAR_1, 1, 1, 0} Inferred as the nickname from `TextPokeNickname 1 0x800C` after `GetFollowingPokePartySlot 0x800C`, i.e. the following Pokémon)
##### OLD — Current content
- **OLD dialogue:** Lyra: Hi, {STRVAR_1, 3, 0, 0}! / How is your Pokémon? // You can talk to it as you walk from time / to time to nurture your friendship! // ... // Oh, I get it. / Are you here to check on the award // with {STRVAR_1, 1, 1, 0}? //
- **OLD raw message data:** `Lyra: Hi, {STRVAR_1, 3, 0, 0}!\nHow is your Pokémon?\rYou can talk to it as you walk from time\nto time to nurture your friendship!\r...\rOh, I get it.\nAre you here to check on the award\fwith {STRVAR_1, 1, 1, 0}?\r`
- **OLD trigger:** Function#6.
- **OLD conditions and branch priority:** Highest-priority count branch (== 6). Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `TextPlayerName 0`, `GetFollowingPokePartySlot 0x800C`, `TextPokeNickname 1 0x800C`, `GenderMessage 15 16`, `CloseMessage`, `Jump Function#10` (fade, `OpenPokedexScreen 2`, `ReturnScreen`, fade, msgs 13/14, `WaitButton`, `CloseMessage`, `ReleaseAll`).
- **OLD state changes:** None (no flag set in this branch).
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** Following Pokémon; Pokédex screen.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 15
- **Other affected callers or records:** None found.
- **Unresolved questions:** Exact meaning of the Pokédex screen argument 2 (not decoded).
- **Validation needed:** Male player, 6 leaves.

#### NBT-DLG-384-01p — Six Shiny Leaves: "check on the award with [nickname]" (female player)
##### Record identity
- **Record ID:** NBT-DLG-384-01p
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-01
- **Related record IDs:** NBT-DLG-384-01o
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** As 01o, female player (`GenderMessage 15 16`, second slot).
- **Source references:** script file 849 Function#6 `GenderMessage 15 16`; text archive 549 msg 16
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Ethan: Hi, {STRVAR_1, 3, 0, 0}! / How is your Pokémon? // You can talk to it as you walk from time / to time to nurture your friendship! // ... // Oh, I get it. / Are you here to check on the award // with {STRVAR_1, 1, 1, 0}? //
- **OLD raw message data:** `Ethan: Hi, {STRVAR_1, 3, 0, 0}!\nHow is your Pokémon?\rYou can talk to it as you walk from time\nto time to nurture your friendship!\r...\rOh, I get it.\nAre you here to check on the award\fwith {STRVAR_1, 1, 1, 0}?\r`
- **OLD trigger:** As 01o.
- **OLD conditions and branch priority:** As 01o. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** As 01o.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** As 01o.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 16
- **Other affected callers or records:** None found.
- **Unresolved questions:** As 01o.
- **Validation needed:** Female player, 6 leaves.

#### NBT-EVT-384-02 — Marill (overworld idx 1) cries when talked to
##### Record identity
- **Record ID:** NBT-EVT-384-02
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-384-02a; NBT-EVT-384-LS; NBT-EVT-384-01
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** Overworld idx 1 (owID 1, sprite code 1032, wanders within a 2x2 range with movement 44 "Running Right, Down, Left, Up", start (4,6)); talk to it (Script 2). The script plays the MARILL cry and the text is "MARILL: Qurururoon."
- **Source references:** script file 849 Script#2; event file 341 overworlds idx 1 (scriptNumber 2, flag 741); text archive 549 msg 4
- **Evidence status:** Verified (script/text/event data); Unresolved for which sprite is drawn (see NBT-EVT-384-01 unresolved questions)
##### OLD — Current content
- **OLD dialogue:** Not applicable (NBT-DLG-384-02a).
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Player interacts with overworld idx 1. Hidden while flag 741 is set.
- **OLD conditions and branch priority:** No condition in the script. Visibility: hidden when flag 741 (`FLAG_HIDE_NEW_BARK_FRIENDS_ROOM_FRIEND`) is set (same flag as overworld idx 0). Flag 741 writers: see NBT-EVT-066-01. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** (1) Talk. (2) `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`, `Message 4` (NBT-DLG-384-02a), `PlayCry SPECIES_MARILL 0`, `WaitCry`, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. (3) No branches. (4) Cry sound after the message appears, wait for cry end, wait for button. (5) None. (6) Repeats. (7) No GLB calls.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats every talk.
- **OLD dependencies and shared-resource effects:** Flag 741 (visibility).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 849 Script#2; text archive 549 msg 4; event file 341 overworlds idx 1
- **Other affected callers or records:** None found (Script#2 only from overworld idx 1).
- **Unresolved questions:** Sprite/script pairing as in NBT-EVT-384-01.
- **Validation needed:** Talk to it in game; confirm cry plays.

#### NBT-DLG-384-02a — "MARILL: Qurururoon."
##### Record identity
- **Record ID:** NBT-DLG-384-02a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-02
- **Related record IDs:** none
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** Shown by NBT-EVT-384-02 on every talk to overworld idx 1, unconditionally (no gender split).
- **Source references:** script file 849 Script#2 `Message 4`; text archive 549 msg 4
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** MARILL: Qurururoon.
- **OLD raw message data:** `MARILL: Qurururoon.`
- **OLD trigger:** `Message 4` in Script#2.
- **OLD conditions and branch priority:** Unconditional. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** See NBT-EVT-384-02.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 4
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None beyond in-game talk.

#### NBT-EVT-384-LS — Level script: on map entry, set the friend sprite variable unless flag 741 is set
##### Record identity
- **Record ID:** NBT-EVT-384-LS
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-384-01; NBT-EVT-384-02; NBT-EVT-066-W1
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** Level script 622, entry 0, kind `mapChange`, scriptId 3 (runs script file 849 Script#3 on entering the map; the `mapChange` timing is the engine's, Inferred from its name).
- **Source references:** level script 622 entry 0; script file 849 Script#3, Function#3
- **Evidence status:** Verified (entry and script); Inferred (effect on the sprite)
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Entering header 384 (level script `mapChange`).
- **OLD conditions and branch priority:** `CheckFlag 741`; if set -> Function#3 (empty, just `End`); else `GetCounterpartSprite 0x4020`, `End`. Flag 741 writers: see NBT-EVT-066-01. Var 0x4020 (`VAR_OBJ_0`) other writers (grep of `project/scripts/`): files 92 (`GetCounterpartSprite 0x4020`), 111 (`SetVar 0x4020 1047/1048/1049`), 841 (`SetVar 0x4020 0` and `97`), 843 (`GetCounterpartSprite 0x4020`, line 224); `docs/partner-sprite.md` states the sprite code 1032 on an overworld draws the sprite held in var 0x4020. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** (1) Map entry. (2) `CheckFlag 741`, `JumpIf EQUAL Function#3` (`End`); otherwise `GetCounterpartSprite 0x4020`, `End`. (3) One branch. (4) None visible. (5) Var 0x4020 is set to the counterpart's (friend's) sprite by the command (Inferred from its name and the docs reference above). (6) Runs on every entry. (7) No GLB calls.
- **OLD state changes:** Var 0x4020 (VAR_OBJ_0), only when flag 741 is clear.
- **OLD repeat/completion behavior:** Runs on every entry to the map.
- **OLD dependencies and shared-resource effects:** Var 0x4020 is shared with other scripts: `GetCounterpartSprite 0x4020` also in files 92, 93, 231, 237, 798, 842 (Script 7, NBT-EVT-060-07) and 843 (line 224); `SetVar`/`CompareVarValue 0x4020` in files 111 and 841 (list corrected by the 2026-10-12 re-check, grep of `project/scripts/`); flag 741.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** level script 622 entry 0; script file 849 Script#3 and Function#3
- **Other affected callers or records:** Script#3 is referenced only by level script 622. Function#3 only by Script#3.
- **Unresolved questions:** Whether any overworld on this map actually uses sprite code 1032 for the friend; the data shows overworld idx 1 (the Marill script) has it (see NBT-EVT-384-01).
- **Validation needed:** Enter the room with flag 741 clear and set.

#### NBT-EVT-384-04 — Spawnable idx 0 (8,4): "It's a Wii!"
##### Record identity
- **Record ID:** NBT-EVT-384-04
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-384-04a; NBT-EVT-384-05
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** Spawnable idx 0 at (8,4), type Misc, activated from any direction (dir 4), Script 4. What the object is (a TV or console) is not stated; the text mentions a Wii.
- **Source references:** script file 849 Script#4; event file 341 spawnables idx 0 (scriptNumber 4); text archive 549 msg 17
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** Not applicable (NBT-DLG-384-04a).
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Player interacts with the spawnable from any side.
- **OLD conditions and branch priority:** None; no flag or variable read. Always available. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `Message 17` (NBT-DLG-384-04a), `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. No `FacePlayer`. No GLB calls.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 849 Script#4; text archive 549 msg 17; event file 341 spawnables idx 0
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Interact from several sides.

#### NBT-DLG-384-04a — "It's a Wii! Wii is huge in Johto, too!"
##### Record identity
- **Record ID:** NBT-DLG-384-04a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-04
- **Related record IDs:** none
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** Shown by NBT-EVT-384-04 on every interaction, unconditionally.
- **Source references:** script file 849 Script#4 `Message 17`; text archive 549 msg 17
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** It’s a Wii! // Wii is huge in Johto, too!
- **OLD raw message data:** `It’s a Wii!\rWii is huge in Johto, too!`
- **OLD trigger:** `Message 17` in Script#4.
- **OLD conditions and branch priority:** Unconditional. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** See NBT-EVT-384-04.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 17
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None beyond in-game check.

#### NBT-EVT-384-05 — Spawnable idx 1 (6,4): "You shouldn't mess with someone else's PC!"
##### Record identity
- **Record ID:** NBT-EVT-384-05
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-DLG-384-05a; NBT-EVT-384-04
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** Spawnable idx 1 at (6,4), type Misc, front interaction (dir 0), Script 5. The object is a PC by the text (Inferred).
- **Source references:** script file 849 Script#5; event file 341 spawnables idx 1 (scriptNumber 5); text archive 549 msg 18
- **Evidence status:** Verified (event, script, text); Inferred (object is a PC)
##### OLD — Current content
- **OLD dialogue:** Not applicable (NBT-DLG-384-05a).
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Player interacts with the spawnable from the front.
- **OLD conditions and branch priority:** None; always available. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `Message 18` (NBT-DLG-384-05a), `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. No GLB calls (this is not the Pokémon Storage PC routine; it is a plain message).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 849 Script#5; text archive 549 msg 18; event file 341 spawnables idx 1
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** Interact from the front.

#### NBT-DLG-384-05a — "You shouldn't mess with someone else's PC!"
##### Record identity
- **Record ID:** NBT-DLG-384-05a
- **Record type:** Dialogue variant
- **Parent record ID:** NBT-EVT-384-05
- **Related record IDs:** none
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** Shown by NBT-EVT-384-05 on every interaction, unconditionally.
- **Source references:** script file 849 Script#5 `Message 18`; text archive 549 msg 18
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** You shouldn’t mess with someone else’s PC!
- **OLD raw message data:** `You shouldn’t mess with someone\nelse’s PC!`
- **OLD trigger:** `Message 18` in Script#5.
- **OLD conditions and branch priority:** Unconditional. Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** See NBT-EVT-384-05.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 549 msg 18
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None beyond in-game check.

#### NBT-EVT-384-W0 — Stairs down to header 66
##### Record identity
- **Record ID:** NBT-EVT-384-W0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** NBT-EVT-066-W1
- **Map or system:** New Bark Town, T20R0402 (header 384)
- **Speaker, object, or trigger:** Warp tile at (3,4); no script.
- **Source references:** event file 341 warps idx 0 (header 66, anchor 1, height 0)
- **Evidence status:** Verified (the "stairs down" description is Inferred from the destination)
##### OLD — Current content
- **OLD dialogue:** Not applicable.
- **OLD raw message data:** Not applicable.
- **OLD trigger:** Step on the warp tile (3,4).
- **OLD conditions and branch priority:** None (warps carry no flag). Reachability class: Referenced and apparently reachable.
- **OLD event sequence:** Step on warp; arrive at header 66 (T20R0401), anchor 1 of its warp list.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats.
- **OLD dependencies and shared-resource effects:** None.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 341 warps idx 0
- **Other affected callers or records:** Header 66's warps idx 1 (NBT-EVT-066-W1) leads here.
- **Unresolved questions:** None.
- **Validation needed:** Up and down in game.

## Coverage summary

### Totals per map (reconciled against the live ROM with `get_events`, `get_script` on the level scripts and `get_text`)

Event-file entries: every spawnable, overworld, warp and trigger index returned by `get_events {mapHeader}` appears in that map's event inventory table and maps to an existing record (covered / total). Level-script entries are counted as stored (one `variableValue` entry may hold several conditions; each condition's script is covered).

| Header | Spawnables | Overworlds | Warps | Triggers | Level-script entries | Event records | Dialogue records | Total records |
|---|---|---|---|---|---|---|---|---|
| 60 (script 842, LS 615, text 542) | 5/5 | 10/10 | 5/5 | 4/4 | 3/3 (LS615) | 28 | 39 | 67 |
| 61 (script 843, LS 616, text 543) | 11/11 | 4/4 | 1/1 | 2/2 | 2/2 (LS616) | 21 | 106 | 127 |
| 62 (script 844, LS 617, text 544) | 0/0 | 2/2 | 1/1 | 0/0 | 0/0 (LS617 empty) | 3 | 4 | 7 |
| 63 (script 845, LS 618, text 545) | 5/5 | 1/1 | 2/2 | 0/0 | 1/1 (LS618) | 10 | 36 | 46 |
| 64 (script 846, LS 619, text 546) | 2/2 | 3/3 | 1/1 | 0/0 | 0/0 (LS619 empty) | 6 | 3 | 9 |
| 65 (script 847, LS 620, text 547) | 0/0 | 1/1 | 1/1 | 0/0 | 0/0 (LS620 empty) | 2 | 1 | 3 |
| 66 (script 848, LS 621, text 548) | 0/0 | 1/1 | 2/2 | 0/0 | 0/0 (LS621 empty) | 3 | 6 | 9 |
| 384 (script 849, LS 622, text 549) | 2/2 | 2/2 | 1/1 | 0/0 | 1/1 (LS622) | 6 | 19 | 25 |
| **Total** | 25/25 | 24/24 | 14/14 | 6/6 | 7/7 | 79 | 214 | 293 |

Event records include the level-script records (`-LS`, `-LS1`, `-LS2`), non-talk objects (`-O<idx>`), warps (`-W<idx>`), hidden items (`-S<idx>`) and the scripts that no event-file entry names directly but a level script runs. Dialogue records are one per message (one record covers a four-message touch-menu label set, 063-02p, msgs 29-32).

Text archives (message counts from `get_text {archive}` `total`; "referenced" = cited by a script command, "unused" = has a `-U<idx>` record, "blank" = blank padding):

| Archive | Header | Total | Referenced (cited by a record) | Unused (U records) | Blank | Not covered by any record |
|---|---|---|---|---|---|---|
| 542 | 60 | 38 (0-37) | 35 (0-7, 9-33, 35, 36) | 3 (msg 8 = 060-U8, msg 34 = 060-U34, msg 37 = 060-U37) | 0 | 0 |
| 543 | 61 | 106 (0-105) | 104 | 2 (msg 52 = 061-U52, msg 66 = 061-U66) | 0 | 0 |
| 544 | 62 | 4 (0-3) | 3 (0-2) | 1 (msg 3 = 062-U3) | 0 | 0 |
| 545 | 63 | 39 (0-38) | 38 | 1 (msg 19 = 063-U19) | 0 | 0 |
| 546 | 64 | 3 (0-2) | 3 | 0 | 0 | 0 |
| 547 | 65 | 1 (0) | 1 | 0 | 0 | 0 |
| 548 | 66 | 20 (0-19) | 6 (0-5) | 0 | 14 (6-19, whitespace only) | 0 |
| 549 | 384 | 19 (0-18) | 19 | 0 | 0 | 0 |

Reconciliation gap (the only one found, now closed): text archive 542 message 34 (`New Bark Town\nWinds of a New Beginning`, read with `get_text {archive: 542, indices: [34]}`) was not cited by any record, and no `Message`, `GenderMessage` or `BoardMessage` in `project/scripts/0842.script` names index 34 (the `BoardMessage` indices are 35 and 36). It looks like a town-name banner string (Inferred from its content). It now has record NBT-DLG-060-U34, classed "Apparently unused (by scripts)"; whether the engine reads it directly is unverified. Everything else reconciles: all 8 event files, all 8 level scripts and all 8 text archives are accounted for.

### Shared resources (one resource, more than one caller)
- Text archive 542 msg 35 (`<name>'s House`): read by Script 8 (NBT-EVT-060-08, spawnable 1) and Script 17 (NBT-EVT-060-17, spawnable 3); editing it changes both signs. Msg 37 has identical text and is read by nothing (NBT-DLG-060-U37).
- 542 msgs 3, 4, 10, 11, 18, 19, 20 each appear twice inside Script 3's function tree (the per-row Y variants, e.g. msg 3 at 0842.script lines 365 and 1048); msg 14 at Function#2 and Function#22.
- Event objects shared by several scripts on header 60: owID 1 (Scripts 2 and 3), owID 3 and 4 (Scripts 4, 5, 6, 9, 10), owID 5 (Script 3 only, no talk script), owID 7 (Scripts 12 and 13), owID 8 (Scripts 5, 6, 13). Tiles shared: (688,392) = overworld 4 + warp 4 + trigger 1; (682,391) = overworld 0 + hidden-item spawnable 4; (695,396) = overworld 7 + warp 1.
- Flags and vars with several writers/readers: flag 638 (Cameron; written by Script 7 and by many other maps' scripts, see "Dependency references"); flags 417/418/744 (set in 842 Scripts 4/9 and in script files 0021, 0104, 0149); var 0x4072 (842, 843); var 0x4108 (843, 845, 848, 0229, 0112, 0858, 0859); flag 741 (read by 848 and 849; writers in other maps' script files 0021, 0104, 0112, 0859 as cited in the records); var 0x4106 (842, 845, 825).
- Script file 843 (header 61): the aide handout exists as two copies (Function 15 and Function 64), the lab-entry scene as two (Function 21 and Function 66), Elm's text as copies in Functions 2/35, 26/27, 57/58, 68/69, 60/68, 39/59; message 12/13 (NBT-DLG-061-01j/01am) is also the last line of the starter handoff in Script 13 (NBT-EVT-061-13); message 69 (NBT-DLG-061-01p) is also the closing line of NBT-EVT-061-15.
- Script file 845: Actions 1-4 are used by both the new-game scene (NBT-EVT-063-01) and the post-Hall-of-Fame scene (NBT-EVT-063-07), as are common scripts 2036 and 2038.
- Script file 849: messages 5/6, 9/10 and 13/14 are each reached by two Functions of the same event.
- Common scripts called from here are documented in `global_dialogue_event_map.md` under their `GLB-` ids (e.g. 2000, 2029, 2030, 2033, 2036, 2038, 2008); the arm9 hidden-item table and starter table are shared with the rest of the game.

### Apparently unused
- Script 5 of file 843 (`End` only; NBT-EVT-061-05, no event-file entry names it). Script 5 of file 842 is not unused: it is the talk script of overworlds 4 and 8.
- Unreferenced messages: 542 msg 8 (060-U8), 542 msg 34 (060-U34), 542 msg 37 (060-U37, duplicate of msg 35), 543 msg 52 (061-U52), 543 msg 66 (061-U66), 544 msg 3 (062-U3), 545 msg 19 (063-U19); 548 msgs 6-19 (blank padding, no record).
- Overworld objects with no talk script (`scriptNumber 0`): 060-O5 (used only as Elm's door actor), 060-O7 (Mom, moved by Scripts 12/13), 061-O1 and 061-O3 (officer and friend, used by Scripts 3, 11, 15), 064-O0/O1/O2 (trophy displays, visibility by flags 682/683/681).
- 542 msg 34 (060-U34) is not referenced by any script of this map.
- Level scripts 617, 619, 620, 621 are empty (0 entries).

### Hack modifications in New Bark Town (what is verifiable)
- Only script file 843 (header 61) was edited through the dspre-mcp journal: journal entry 17 (Rare Candy added at Script#13, later removed), 30 (whole-file rewrite: aide handout `CheckFlag 2304` pair and Rare Candy sub-function), 31 (Function#45 extended: Rare Candy, Premier Ball, Max Repel, Escape Rope, each followed by `CommonScript 2008`), 32 (`CheckFlag 2307` -> Function#46 = `CommonScript 2080`) and 34 (`CheckFlag 2310` -> Function#47 = `CommonScript 2081`; later functions renumbered). Records affected: NBT-EVT-061-04 (aide handout, both copies) and NBT-EVT-061-13 (starter handoff).
- `SetVar 0x416F 13` in Script 13 of file 843 is present in the live script but is not covered by any journal entry (per the document's earlier analysis, from an unjournalled assembly of the file); its meaning (level-cap variable, per `docs/game-mode-select.md`) is documented, not verified at runtime.
- `CommonScript 2080` and `CommonScript 2081` exist only in the hg-engine build (script archive entry 3, rebuilt at build time); they are called from script 843 Functions 46 and 47. In the working ROM they are not defined; the OLD behaviour of these two calls is therefore known only from `docs/gms-debug-rules.md` and the hg-engine source.
- No event file, header, level script or text archive of New Bark Town was edited through the journal (the journalled `set_text` edits touch text archives 115 and 373 only; neither is among 542-549).

### Scope classifications marked uncertain
- NBT-EVT-060-18 (Cameron the photographer): a local event on header 60, but every message is read from a common message archive through `GetCommonMessageArchive 2`; the archive number is Inferred to be 30 by matching message content. Whether its prompts count as local or global is uncertain, so the prompts are referenced as `GLB-PRM-30-*` and not copied here.
- NBT-EVT-060-08 / -17 and NBT-DLG-060-08a / -17a: the board commands (`BoardMessage`, `SetTextBoard`, `ShowBoard`, `SetIconBoard`) call a global board routine (GLB-RTN-2000); the board text is local, the board behaviour is global.
- NBT-EVT-060-S4 (hidden item, scriptNumber 8000): the event is local; the item, quantity and found-flag come from the arm9 hidden-item table (global).
- NBT-EVT-063-02 (Mom's savings menu): the text is local; `TakeMomMoney` / `CheckMomMoneyBalance` are engine functions and the savings balance is a global resource.
- NBT-EVT-061-13 (starter machine) and NBT-EVT-061-12 (lab-entry e-mail scene): local script, global starter table and phone/e-mail routines.
- Scenes whose triggering variables are written on other maps (060-12/13: var 0x4081 from file 0112, 0104, 0021; 061-15: var 0x4108 = 8 from file 0112; 061-16: var 0x40FC = 2 from file 0111): the scene is local, the condition is global.

## Resources inspected

### Resources inspected
- **ROM and extraction:** working ROM `~/pokehg/working/heartgold.nds` (HeartGold US, IPKE, rev 0), extraction `~/pokehg/working/heartgold_DSPRE_contents/`; the pristine `rom/original/` was not opened.
- **Map headers:** 60, 61, 62, 63, 64, 65, 66, 384 (`get_world_data {kind: mapHeader}`), and the `arm9.bin` header table (24-byte records, scriptFileId at record byte 6) read with `xxd` to map script files to headers for the dependency table.
- **Matrices:** 0 ("map", header 60), 66 ("m_h01_", header 65), 71 ("m_hh0101_", headers 63 and 66), 72 ("m_hh0102_", headers 64 and 384), 100 ("m_labo01_", header 61), 101 ("m_labo02_", header 62).
- **Event files:** 57, 58, 59, 60, 61, 62, 63, 341 (`get_events`).
- **Script files:** 842-849 (`get_script`, and the pulled disassembly `project/scripts/0842.script` to `0849.script`); the other script files named in "Dependency references" were grepped, not read in full.
- **Level scripts:** 615-622 (`get_script`, structured form).
- **Text archives:** 542-549 (`get_text`, `search_text`); the common message archive reached by `GetCommonMessageArchive 2` (archive 30, Inferred; Cameron's prompts) and the messages behind the common scripts are documented in `global_dialogue_event_map.md`.
- **ROM tables:** `get_rom_table` kinds `spawn`, `starters` and `hiddenItems`; `list_changes` (the journal) for the hack's modifications.
- **hg-engine sources:** `~/Programming/hg-engine/armips/include/flags.s`, `vars.s`, `scriptmacros.s`; `armips/scr_seq/scr_seq_00003_commonscript.s` and `scr_seq_00953_trainerscript.s` (the two script sequences hg-engine regenerates).
- **Project docs:** `docs/scripting-reference.md` (script commands, `GenderMsgBox` order), `docs/game-mode-select.md` and `docs/gms-debug-rules.md` (the hack's changes to script 843), `docs/partner-sprite.md` (sprite-by-variable code 1000 + (var & 0xFF)).

### Methods
- dspre-mcp `get_*` tools only (read-only): `get_events`, `get_script`, `get_text`, `search_text`, `get_world_data`, `get_rom_table`, `list_changes`, `get_rom_info`.
- `grep` / `sed -n` / `cat` of `project/scripts/*.script` for flag, var and message references (basis for every "writers" and "also used by" statement); `xxd` of `arm9.bin` for the header table.
- Structural and reconciliation checks by `grep` counts of headings and field labels (293 records, each label present 293 times, in order), comparison of the index IDs with the record headings, and comparison of event-file and level-script counts with the live ROM.
- No code was written, no emulator or build was run.

## Unresolved references and conditions

Collected from the **Unresolved questions** field of each record and from the Evidence status lines; duplicates merged, one bullet per item with the record ids concerned. Records not listed have "None" in that field.

**Undecoded commands and arguments**
- `MecScript` purpose (NBT-EVT-060-03, -04, -09, NBT-EVT-061-03, -04, -12, -15, NBT-EVT-063-01, -07, NBT-EVT-064-01 and others; `grep -c` finds it in script files 842 (5), 843 (5), 845 (2) and 846 (1)); `CMD_582` and `LocalScript` (NBT-EVT-060-11); `CMD_149` (NBT-EVT-061-01); meaning of `RecordPokegearNumber 1`, `SetFollowingPokeMovement 55` / `48`, `Release Overworld.3` on an unfrozen object (NBT-EVT-060-03, -04).
- `SetTextBoard 2 0` and `ShowBoard 3` arguments (NBT-EVT-060-08); `SetIconBoard` argument (NBT-EVT-060-15); `TextCounterpart` result (NBT-EVT-060-17); `TextPartyPokemonDefault 1 0` arguments (NBT-EVT-060-09, NBT-DLG-060-09a/b); `GetCounterpartSprite` (NBT-EVT-061-11); `FinishOverworldScreen` / `ReturnScreen` (NBT-EVT-061-14); `SetFollowingPokePosition 3 Left` direction code (NBT-EVT-061-13); `ChooseRivalName` result 1 (NBT-EVT-061-03); `CheckVersion` value 7 (NBT-EVT-061-01, NBT-DLG-061-01e/f); `TakeMomMoney` result values and the `255` argument of `CreateMultiTouchBox` (NBT-EVT-063-02, NBT-DLG-063-02p/02q); `TryGiveShinyLeafCrown` and `OpenPokedexScreen 2` (NBT-DLG-384-01k/01l, 01o/01p); `CheckAlbumPhoto` value, day-of-week numbering and `CheckBadge 2` (NBT-EVT-060-07, NBT-EVT-060-18).
- Whether `{YESNO}` text tokens render alongside `YesNoTouchScreen` (NBT-DLG-063-02c, 02o).

**Flags, variables and engine behaviour**
- Meaning of hg-engine placeholder flags 114, 2435, 264, 265 and of badge ids 7 and 15; who sets 2435 and 2404 (FLAG_GAME_CLEAR) (NBT-EVT-061-01, NBT-DLG-061-01d/01n/01o/01p, NBT-EVT-063-02).
- Story step at which flag 156 is set (`SetFlag 156` is in script file 845) and at which 0x4081 = 1 is set (`SetVar 0x4081 1` in script file 0112, lines 277 and 294), and the writers of 0x4108 values 1-9 relative to the story (NBT-EVT-060-12, NBT-EVT-060-13, NBT-EVT-061-02, NBT-DLG-063-02g); where 0x400F, 0x4006 and 0x4007 reset (NBT-DLG-061-01q, 01aa, NBT-DLG-060-12a); whether 0x4007 can reach 2 (NBT-DLG-060-12a); initial value of 0x4106 on a new game (NBT-EVT-063-LS); whether flag 417's idx 3 object is visible at game start (NBT-EVT-060-06).
- Level-script evaluation order and timing when several conditions match (NBT-EVT-060-LS1, NBT-EVT-060-04, NBT-EVT-061-03, -15, -16, NBT-EVT-061-LS2, NBT-EVT-063-LS); whether hg-engine alters any of these (NBT-EVT-063-LS, NBT-EVT-063-02).
- Which of trigger and warp has priority on a shared tile and whether both fire (NBT-EVT-060-W4, NBT-EVT-060-11).
- What `CommonScript 2033` prints in the working ROM versus hg-engine (NBT-EVT-061-15); exact item list and receipt of `CommonScript 2080/2081` (NBT-EVT-061-04).
- `anchor` semantics for warps and whether the destination warp list indexes match (NBT-EVT-062-W0, NBT-EVT-063-W1, NBT-EVT-065-W0, NBT-EVT-066-W0, NBT-EVT-060-14).
- Flags with no script writer found (401, 2404, 2435); flags 114, 242, 282, 352, 406, 571 are written only by script file 843 itself, so what remains open for them is only whether any non-script writer exists (see the dependency section); `SetVar 0x416F 13` not covered by a journal entry (NBT-EVT-061-13 and the coverage section).
- Hidden item scriptNumber 8000 to table entry mapping and the found-flag (NBT-EVT-060-S4); who awards the trophies behind flags 681-683 (NBT-EVT-064-O0, O1, O2).

**Identities and scene context**
- Sprite identities not decodable through dspre-mcp (speakers inferred from text and flag names): sprites 148, 325, 99, 365, 317, 327, 328, 1032, 101 (NBT-EVT-060-01, -02, -O5, -O7, NBT-EVT-062-01, -02, NBT-EVT-065-01, NBT-EVT-066-01, NBT-EVT-384-01, -02, NBT-EVT-384-LS); object at NBT-EVT-063-04; whether header 66 is the counterpart's house (NBT-EVT-060-17); whether warp 0 of header 60 is the lab door (NBT-EVT-060-14); sprite 1032 / script pairing on header 384 (NBT-EVT-384-01, -02, NBT-EVT-384-LS).
- Gender order of every `GenderMessage a b` pair is taken from `docs/scripting-reference.md` (first id male) and not run-tested: all `GenderMessage` dialogue records in 060 (02d/e, 05, 06, 09, 13), 061 (01x gender pairs, 03, 04, 12, 15), 063 (01a/b), 066 (01a-f) and 384 (01a-p).
- Which party Pokémon buffer 1 shows (NBT-DLG-060-09a/b, NBT-DLG-384-01c/d); why scene var/Pokégear conditions gate a Pokémon text (NBT-DLG-060-03d); whether text such as msg 5 is shown without a Pokémon check (NBT-EVT-060-02); who gives the S.S. Ticket, where the Mystery Egg item and the Pokédex are given (NBT-DLG-063-02b, NBT-DLG-061-03i/03k/03p); Elm-side event pointed to by NBT-EVT-063-07; whether Elm (flag 401) is ever hidden (NBT-EVT-061-01); where the flag-413 state is prepared (NBT-EVT-061-O1); the story point where 0x40FC becomes 2 (NBT-EVT-061-LS2); whether the friend at (7,12) is the intended position when 0x4108 = 8 (NBT-EVT-061-11).
- Reading of the common message archive: whether `GetCommonMessageArchive 2` selects archive 30 (NBT-EVT-060-18).
- Dialogue outside this scope: starter-dependent texts elsewhere (NBT-EVT-061-13), other files that might read the unreferenced messages (NBT-DLG-060-U8, 060-U34, 060-U37, 061-U52, 061-U66, 062-U3, 063-U19), a possible placeholder number for a new NPC (NBT-EVT-061-05).

**Text break-code glosses (found by the 2026-10-12 re-check)**
- The per-section rendering conventions gloss the break codes inconsistently: the header-60 section convention (scripts 1-9) reads `\r` as scroll and `\f` as new box; the header-60 note for scripts 10-18 reads `\r` as new box and `\f` as scroll; the 062/063/064 note reads `\r` as scroll and `\f` as new page; the 065/066/384 note renders both `\r` and `\f` as ` // `. `docs/scripting-reference.md` (from hg-engine `charmap.txt`) only says `\r` (0x25BC) = new page, waits for a button, and `\f` (0x25BD) = paragraph/form-feed break. Which gloss is right was not verified; the OLD raw message data field is the authoritative form in every record.

**Reconciliation gap (closed)**
- Text archive 542 message 34 (`New Bark Town\nWinds of a New Beginning`) now has record NBT-DLG-060-U34; no script reads it. It may be read by the game engine directly (e.g. a map-name display); this is unverified.

## Inspection limitations

- **Level scripts have no text disassembly.** They were read through `get_script` (structured trigger lists) only; the engine's evaluation order and timing of several matching `variableValue` conditions was not verified.
- **Sprite ids are not decodable through dspre-mcp.** Speakers and objects (`overlayTableEntry` 99, 101, 148, 317, 325, 327, 328, 365, 376, 350, 379, 1032, 34, 29) are inferred from message text and flag names, never from the sprite.
- **Some opcodes are undocumented** in `docs/scripting-reference.md` or the scrcmd database: `MecScript`, `CMD_582`, `CMD_149`, `LocalScript`, and the arguments of `SetTextBoard`, `ShowBoard`, `SetIconBoard`, `SetFollowingPokeMovement`, `TextPartyPokemonDefault`, `GetCounterpartSprite`, `FinishOverworldScreen`, `CheckVersion`, `ChooseRivalName`, `TakeMomMoney`, `TryGiveShinyLeafCrown`, `CheckAlbumPhoto`. Their effect is described from the surrounding script only.
- **`GenderMessage a b` order** (first id male, second female) is taken from `docs/scripting-reference.md` line 111, not run; every gender-pair record carries this as an Inferred item.
- **Other maps' level scripts and event files were not searched** for flag and var writers; "writers" in this document are limited to `project/scripts/*.script` (script files) and the New Bark Town event/level data. A flag marked "no writer found" may still be set from a level script, another map's event-file hide flag or engine code.
- **hg-engine overrides exist only in the built ROM.** The working ROM is the OLD baseline; `CommonScript 2072-2081` and the trainer script (archive entries 3 and 953) are rebuilt by hg-engine at build time, so what those common scripts print or do in a built ROM was read from the hg-engine source, not from the working ROM.
- **No runtime testing.** Nothing was run in an emulator; every reachability statement is a static reading of conditions. "Referenced and apparently reachable" does not mean observed in play.
- **No code was written**, so there is no exhaustive automated cross-reference: flag/var/message references were found with `grep` of the disassembly and may miss a reference written in a form the pattern did not match. Only the 293 headings, the field labels and the index were checked mechanically (by `grep` counts).
- **Text archive 542 message 34** has record NBT-DLG-060-U34; no script reads it, and whether the engine reads it directly is unverified.

## Verification performed

- **Disassembly versus live ROM (per section).** Each map section records its own spot-check of `project/scripts/NNNN.script` against live `get_script` for files 842-849 (line and script/function/action counts; for 843 the live script is 1613 lines against 1620 in the pulled file, the difference being its 7-line comment header).
- **Inventory reconciliation (final pass).** `get_events` was run for headers 60, 61, 62, 63, 64, 65, 66 and 384 and the counts compared with each map's inventory table: spawnables/overworlds/warps/triggers 5/10/5/4, 11/4/1/2, 0/2/1/0, 5/1/2/0, 2/3/1/0, 0/1/1/0, 0/1/2/0, 2/2/1/0; every index appears in its table and maps to an existing record. Warp destinations (header, anchor) and overworld flags/script numbers agree with the tables. `get_script` on level scripts 615-622 returned 3, 2, 0, 1, 0, 0, 0, 1 entries (condition lists: 615 entry 1 with 2, 616 entry 2 with 3, 618 with 2); all are covered by `-LS` / `-LS1` / `-LS2` records and the scripts they run.
- **Text reconciliation.** `get_text` totals (542: 38, 543: 106, 544: 4, 545: 39, 546: 3, 547: 1, 548: 20, 549: 19) were compared with the message indices cited in the records' Source references: every index is cited (542 msg 34 by NBT-DLG-060-U34) except 548 msgs 6-19 (whitespace-only padding, confirmed with `get_text`).
- **Structure check.** 293 `#### NBT-` headings; the labels `Record identity`, `OLD — Current content`, `NEW — Replacement content`, `Mapping and verification` and each of the 30 field labels occur 293 times, in the fixed order; NEW change status is `UNDECIDED` and the other eight NEW fields `UNSET` in all 293; Record type is `Dialogue variant` (214) or `Event` (79) and agrees with the id prefix; Record IDs are unique and each equals its heading; every `NBT-` id mentioned in a Related, Parent or body field exists as a record (the only strings that do not are the pattern placeholders `NBT-DLG-060-03x` and `NBT-EVT-061-W<idx>` used in prose); all Parent ids are `None` or an existing event record. The index has 293 rows in heading order (the 060-U34 row was inserted after 060-U37 in the index; the record itself follows 060-U37 in the document).
- **What this is not.** Static inspection only. No runtime or emulator test was run, nothing was built, and nothing in the ROM, the extraction or the project was modified: all dspre-mcp calls were read-only `get_*` / `search_text` calls, and the only file written is this document.
- **Independent static re-check, 2026-10-12T04:41:08+05:30.** Re-read through dspre-mcp `get_*` and grep only, no runtime test: all 8 headers, 69 event objects (25/24/14/6) and 8 level scripts reconciled with no gap; header set confirmed complete (location 126 only on 60-66 and 384; every warp target inside the set); 70 Dialogue-variant records (all 8 archives, 13 GenderMessage pairs) matched `get_text` byte for byte in the raw field, archive/index all correct; 17 Event records' branch order, values, flags/vars, state changes and message use matched `project/scripts/` and live `get_script` (843 Functions 45-47 as journalled); structure counts (293 records, 29 labels each, 293 UNDECIDED, 2344 UNSET, 293 index rows, all ids resolving) confirmed; 45 records' `Other affected callers` checked by grep (the 16 "None found" whose only call site is the record's own Source reference read as "no other caller", consistent). Fixed: the flag-writer statements (114, 242, 282, 352, 406, 571 are written by 843; only 401, 2404, 2435 have no script writer), the flag 156 / 0x4081 writer bullet, the 0x4106 reader list (NBT-EVT-063-LS), the 0x4020 caller list (NBT-EVT-384-LS), NBT-EVT-060-18 Related ids; added the break-code gloss inconsistency to Unresolved.
