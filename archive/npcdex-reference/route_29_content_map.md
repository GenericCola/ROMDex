# Route 29 — content map (dialogue, event scripts, triggers, access conditions)

Scope: Pokémon HeartGold ROM hack, working ROM `~/pokehg/working/heartgold.nds` (HeartGold US, game code IPKE, rev 0, English), as extracted by DSPRE/dspre-mcp. Static, read-only inspection. Global routines and prompts called from here are referenced by `GLB-` id only (ids defined in `global_dialogue_event_map.md`); their dialogue and behaviour are not documented here. No global document is written by this run.

## Conventions

### Text rendering (used for the whole document)
OLD dialogue fields show the message with the break codes rendered readably: `\n` = line break inside one box, shown as ` / `; `\r` = scroll (text scrolls within the box), shown as ` [scroll] `; `\f` = new box, shown as ` [new box] `. Control tokens such as `{STRVAR_1, 3, 0, 0}` are kept verbatim. The **OLD raw message data** field is the exact string returned by `get_text` and is authoritative; the rendered field is a reading aid. (The meaning of the three break codes was taken from the briefing for this run; `docs/scripting-reference.md` glosses `\r` as "new page" and `\f` as paragraph break, so the gloss is not independently verified. See Unresolved references and conditions.)

### NEW change status values (defined once)
- `UNDECIDED` — no decision has been supplied for this record.
- `KEEP` — keep the OLD content as is.
- `MODIFY` — keep the record but change part of it (text, condition, sequence).
- `REPLACE` — replace the record's content wholesale.
- `REMOVE` — remove the content.

`UNSET` in any other NEW field means no decision has been supplied. It never means deletion. In every record of this document the NEW change status is `UNDECIDED` and the other eight NEW fields are `UNSET`.

### Record id scheme (stable; never renumber)
- `R29-EVT-<hhh>-<nn>` — an event entry point on map header `<hhh>` (three digits). `<nn>` follows the script index within that map's script file where the entry is a script (`R29-EVT-033-04` = script 4 of header 33's script file); level-script records use `R29-EVT-<hhh>-LS`; event-file entries that run no map script use `-O<idx>` (overworld), `-S<idx>` (spawnable), `-T<idx>` (trigger) or `-W<idx>` (warp, recorded as entry points).
- `R29-DLG-<hhh>-<nn><letter>` — one dialogue variant used by event `R29-EVT-<hhh>-<nn>`, lettered in order of first use (a, b, c…).
- `R29-DLG-<hhh>-U<idx>` — a text-archive message that no script command references (apparently unused); `<idx>` is the message index. None exist in Route 29 (every message of archives 373 and 374 is referenced; for msgs 15 and 16 of 373 only through the Inferred `SetIconBoard` argument → message mapping, see R29-EVT-033-05 and -06).
- `-LS` — as above, the level-script record of a map.
- `GLB-…` — global records, defined in `global_dialogue_event_map.md`.

### Evidence status
- `Verified` — read directly from the ROM data through dspre-mcp or from the disassembly of the working ROM.
- `Inferred` — concluded from verified data, not directly stated by it.
- `Unresolved` — could not be established.

### Reachability classes
Referenced and apparently reachable / Referenced with unresolved reachability / Apparently unused.

## Source and how it connects

### What was supplied and inspected
- **Working ROM (the hack as it stands):** `~/pokehg/working/heartgold.nds`. `open_rom` / `get_rom_info`: game HeartGold (US), family HGSS, language English, game code IPKE, title `POKEMON HG`, ROM version 0, dspre-mcp `validated: true`. The extraction reused is `~/pokehg/working/heartgold_DSPRE_contents/` (40 data types present, none missing).
- **Pristine original:** `rom/original/` (not opened; not modified).
- **Modifications (verifiable):** the dspre-mcp journal (`list_changes`) holds 34 edits. Route 29 is touched by two: journal id 20 (2026-09-26T07:09:43Z, `set_script` file 225, `edits` mode, inserted into Function#25 before index 15 the lines `GenderMessage 5 6`, `SetVar 0x8004 2685`, `SetVar 0x8005 1`, `CommonScript 2033`, `GenderMessage 7 8` — the Mr. Paint gift; the journal summary is truncated, and only the first two of these lines are visible in it; a matching block also exists in Function#43, 0225.script lines 485-489, and whether journal id 20 added it is Unresolved, see Unresolved references and conditions) and journal id 21 (2026-09-26T07:10:12Z, `set_text` archive 373, messages 5 and 6, the Mr. Paint text). No journal entry touches script file 226, level scripts 470/471, text archive 374, event files 30/130, encounters or map headers. Other journalled edits (script files 843, 146, 163, 228, 227, 222, 903, 891, 145, 141, 92; text archive 115) are outside the Route 29 file set, except that 227 and 228 (Route 30) read a Route 29 flag (see Dependency references) and 141/145 are the global ground-item/hidden-item handlers.
- **hg-engine layer:** the client builds additionally run hg-engine (`~/Programming/hg-engine`), which at build time regenerates script archive entry 3 (common script; source `armips/scr_seq/scr_seq_00003_commonscript.s`) and entry 953 (trainer script). Those overrides exist only in the built `.nds`; this document records the working ROM as the OLD baseline. Route 29 calls common scripts 2000, 2009, 2029 and 2033 (all in entry 3) and uses wild encounter file 1 (owned by hg-engine in builds; not documented here). There is no trainer on Route 29. hg-engine also owns trainer/encounter/species/item data, which is not documented here.
- **Disassembly:** `project/scripts/NNNN.script` (497 files, file number = script archive index, pulled from the working ROM 2026-10-08). Spot-checked against live `get_script` (see the Verification section): `0225.script` is 845 lines = 838 live lines + a 7-line comment header, with 9 scripts / 43 functions / 56 actions on both sides; `0226.script` is 33 lines = 26 live + 7, with 3 scripts, 0 functions, 0 actions. Journal id 20 predates the 2026-10-08 pull. Level scripts have no text disassembly; they were read with `get_script` (structured trigger lists).

### How the data connects (Route 29)
Map header → matrix (geometry) + event file (signs, NPCs, warps, triggers) + script file (event logic) + level script (map-entry/var-watch triggers) + text archive (the messages script commands print by index).

Route 29 is the set of map headers whose location name is id 177 "Route 29" (`get_world_data {kind: mapHeader}` listing of all 540 headers; text archive 279 message 177 = "Route 29"): headers **33** and **134** only. The set is not closed under warps: header 134's warp 1 leads to Route 46 (header 48).

| Header | Internal name | Matrix (map file) | Event file | Script file | Level script | Text archive | Spawnables/Overworlds/Warps/Triggers |
|---|---|---|---|---|---|---|---|
| 33 | R29 (exterior) | 0 "map" (47x17), cells (18,12), (19,12), (20,12), map files 1, 2, 3 | 30 | 225 | 470 | 373 | 3/11/2/1 |
| 134 | R29R0101 (gate to Route 46) | 69 "m_gate01_" (1x1, map file 242, no headers layer) | 130 | 226 | 471 | 374 | 0/2/2/0 |

Header 33: wild encounter file 1 (`wildPokemonId 1`), weather 0, header flags 123, music 1028 day/night, `areaDataId 2`, `locationType 2`, `followMode 2`, `kantoFlag false`. Header 134: wild 255 (none), weather 0, flags 115, music 1028 day/night, `areaDataId 63`, `locationType 4`, `followMode 1`.

**Warps (from header, warp index, tile → destination header, anchor; all height 0):** 33/W0 (626,389) → 134 anchor 0; 33/W1 (627,389) → 134 anchor 0; 134/W0 (5,12) → 33 anchor 0; 134/W1 (5,2) → 48 anchor 0 (Route 46, internal name R46, location 194, script file 259, level script 504, text 406, event file 45: dependency only).

**Exits (by walking across matrix cell edges, from `get_world_data matrix 0` headers and maps layers):** west of cell (18,12): cell (17,12) map 5 and (16,12) map 4, both header 67 (T21 Cherrygrove City). East of cell (20,12): cell (21,12) map 0, header 60 (T20 New Bark Town); cells (22,12) and (23,12) header 31 (Route 27, seen to x=23; the briefing lists (22-25,12)). North: (18,11) map 208 header 0, (19,11) map 114 header 48 (Route 46), (20,11) map 208 header 0; (17,11) and (17,10) header 34 (Route 30); (19,10) map 113 header 48; (20,10) map 112 header 47. South: (18-20,13) map 208 header 0 (filler), no south exit as far as inspected. Which cell edges are actually walkable was not inspected (map geometry is not readable through dspre-mcp). Inferred boundary quirk: the hidden item `R29-EVT-033-S2` at global (572,390) lies in matrix column 17, which the headers layer assigns to header 67 (Cherrygrove), not 33; unverified in game.

**Global content:** calls to common scripts (`CommonScript <id>`), the ground-item handler and the hidden-item handler are referenced as `GLB-RTN-…`; the eight common-message archive prompts of script 4 are Route 29-specific text and are documented as `R29-DLG-033-04a` to `-04h` (see `R29-EVT-033-04`).

### Dependency references (outside Route 29)

Resolution method (Verified): each script file id was matched to the map headers whose `scriptFileId` field equals it, read from the header table in `arm9.bin` (24-byte records starting at 0xf6be0, scriptFileId at record byte 6) and confirmed with `get_world_data {kind: mapHeader}` (headers 33, 134, 36 and 127 re-read for this run). Writes are "as cited in this document"; the table does not read other maps' dialogue.

| Script file | Map header(s) | Location / kind | Route 29 flags/vars it touches (as cited here) |
|---|---|---|---|
| 0843 | 61 (T20R0101) | New Bark Town (Elm's Lab) | clears flags 420 and 421 (lines 153/154 and 599/600); sets var 0x408B = 1 (lines 152 and 598) |
| 0149 | none | Not a map script file (no header uses it); one `Script 1` of consecutive `SetFlag` lines; how it is invoked is Unresolved | sets flags 420 and 421 (lines 11, 12) |
| 0227 | 34 (R30) | Route 30 | reads flag 154 (line 191, Function 5), guarding a re-gift of item 2685 after `CheckItem 2685` (journal-edited file) |
| 0228 | 127 (R30R0101) | Route 30 (interior) | reads flag 154 (line 37, Function 2), same pattern (journal-edited file) |
| 0232 | 36 (R32) | Route 32 | flag 2748 (read line 92, set line 443); var 0x4094 (read line 94, incremented line 290) |
| 0243 | 40 (R36) | Route 36 | flag 2748 (35, 298); var 0x4094 (37, 205) |
| 0246 | 41 (R37) | Route 37 | flag 2748 (24, 125); var 0x4094 (26, 103) |
| 0941 | 89 (T30) | Blackthorn City | flag 2748 (78, 354); var 0x4094 (80, 272) |
| 0962 | 94 (W40) | Route 40 | flag 2748 (24, 218); var 0x4094 (26, 164) |
| 0938 | 88 (T29) | Lake of Rage | flag 2748 (115, 473); var 0x4094 (117, 379); sets flag 17 (lines 14, 555), which is the hide flag of `R29-EVT-033-O5` (a map-temp flag, per-map behaviour Inferred) |
| 0141 | (global) | Ground-item handler script file | `scriptNumber` 7000 of `R29-EVT-033-O8` runs its Script 1 (`SetVar 0x8008 17`, `SetVar 0x8009 1`) — GLB-RTN-ITEMBALL |
| 0145 | (global) | Hidden-item handler script file | `scriptNumber` 8001 of `R29-EVT-033-S2` — GLB-RTN-HIDDENITEM |
| 0003, 0953 | (global) | Common script and trainer script entries | hg-engine regenerates both at build time; global, see GLB ids |
| event file 45 / header 48 | 48 (R46) | Route 46 | destination of `R29-EVT-134-W1` |

## Index

One row per record (`#### R29-…` heading), in document order: 53 records. "Map" is the map header number. In the Related IDs column the `R29-` prefix is dropped and a trailing "…" means the record's own field lists more.

| Record ID | Record type | Map/system | Speaker/object | Trigger | OLD availability | Source | Related IDs |
|---|---|---|---|---|---|---|---|
| R29-EVT-033-01 | Event | 33 exterior | map-entry check (hides/shows OW10) | level script 470 mapChange → Script 1 | every map entry | LS470 e1; 225 S#1, F#1, 12, 13; ev30 ow10 | EVT-033-LS, 04 |
| R29-EVT-033-LS | Event | 33 exterior | level script 470 entry 1 (mapChange) | map load | every map entry | LS470 e1 | EVT-033-01 |
| R29-EVT-033-02 | Event | 33 exterior | friend scene: ow6 + ow7 (Marill-type object), player | step trigger T0 x666 y396-402; var 0x408B == 1 | var 0x408B = 1 (once) | 225 S#2, F#2-43, A#1-56; ev30 trig0, ow6, ow7; 373 m0-8, 17, 18 | DLG-033-02a-k; EVT-033-O6, O7; GLB-RTN-2029, 2033 |
| R29-EVT-033-03 | Event | 33 exterior | time-of-day NPC ow2 (sprite 322) | talk | always; text by time period | 225 S#3, F#4, 5, 18, 26; ev30 ow2; 373 m12-14 | DLG-033-03a-c |
| R29-EVT-033-04 | Event | 33 exterior | weekday-sibling NPC ow10 (sprite 326) | talk | object visible only when badge 0 held and day-of-week 2 at map entry | 225 S#4, F#6-11, 19, 20; ev30 ow10; common message archive (752, Inferred) | EVT-033-01; DLG-033-04a-h; GLB-RTN-2009, 2033 |
| R29-DLG-033-04a | Dialogue variant | 33 exterior | ow10, "Tuesday was over before I even noticed..." | EVT-033-04 | wrong day, no earlier branch | 225 S#4 L65, F#8 L182; common archive msg 7 (752, Inferred) | EVT-033-04, DLG-033-04b-h |
| R29-DLG-033-04b | Dialogue variant | 33 exterior | ow10, "That Shock Ribbon looks great..." | EVT-033-04 | ribbon check result 1 | 225 F#6 L163; common archive msg 33 (752, Inferred) | EVT-033-04, DLG-033-04a, c-h |
| R29-DLG-033-04c | Dialogue variant | 33 exterior | ow10, "one ribbon per week" | EVT-033-04 | flag 2748 set, no ribbon held | 225 F#7 L171; common archive msg 35 (752, Inferred) | EVT-033-04, DLG-033-04a, b, d-h |
| R29-DLG-033-04d | Dialogue variant | 33 exterior | ow10, siblings Monica and Wesley | EVT-033-04 | flag 216 set | 225 F#9 L187; common archive msg 6 (752, Inferred) | EVT-033-04, DLG-033-04a-c, e-h |
| R29-DLG-033-04e | Dialogue variant | 33 exterior | ow10, introduction and TwistedSpoon gift | EVT-033-04 | day 2, flag 216 clear | 225 F#10 L195; common archive msg 4 (752, Inferred) | EVT-033-04, DLG-033-04a-d, f-h; GLB-RTN-2009, 2033 |
| R29-DLG-033-04f | Dialogue variant | 33 exterior | ow10, TwistedSpoon remark | EVT-033-04 | after the gift succeeded | 225 F#10 L205; common archive msg 5 (752, Inferred) | EVT-033-04, DLG-033-04a-e, g, h; GLB-RTN-2033 |
| R29-DLG-033-04g | Dialogue variant | 33 exterior | ow10, Shock Ribbon offer | EVT-033-04 | var 0x4094 == 7, day 2, flag 2748 clear | 225 F#19 L256; common archive msg 32 (752, Inferred) | EVT-033-04, DLG-033-04a-f, h |
| R29-DLG-033-04h | Dialogue variant | 33 exterior | narration, "put on the Shock Ribbon!" | EVT-033-04 | with 04g | 225 F#19 L258; common archive msg 34 (752, Inferred) | EVT-033-04, DLG-033-04a-g |
| R29-EVT-033-05 | Event | 33 exterior | board S0 (x581, west end) | read board (any direction) | always | 225 S#5; ev30 spawnable 0; 373 m16 (Inferred) | DLG-033-05a; GLB-RTN-2000; EVT-033-06 |
| R29-EVT-033-06 | Event | 33 exterior | board S1 (x662, east end) | read board (any direction) | always | 225 S#6; ev30 spawnable 1; 373 m15 (Inferred) | DLG-033-06a; GLB-RTN-2000; EVT-033-05 |
| R29-EVT-033-07 | Event | 33 exterior | NPC ow0 (sprite 317, walks up/down) | talk | always | 225 S#7; ev30 ow0; 373 m9 | DLG-033-07a |
| R29-EVT-033-08 | Event | 33 exterior | NPC ow1 (sprite 332, faces down) | talk | always | 225 S#8; ev30 ow1; 373 m11 | DLG-033-08a |
| R29-EVT-033-09 | Event | 33 exterior | NPC ow3 (sprite 326, walks left/right) | talk | always | 225 S#9; ev30 ow3; 373 m10 | DLG-033-09a |
| R29-EVT-033-O4 | Event | 33 exterior | object ow4 (sprite 86), scriptNumber 10000 | none identified | hide flag 16 clear | ev30 ow4 | EVT-033-O5 |
| R29-EVT-033-O5 | Event | 33 exterior | object ow5 (sprite 86), scriptNumber 10000 | none identified | hide flag 17 clear | ev30 ow5 | EVT-033-O4 |
| R29-EVT-033-O6 | Event | 33 exterior | friend object ow6 (sprite 102) | none (moved by script 2) | hide flag 420 clear | ev30 ow6 | EVT-033-02, O7 |
| R29-EVT-033-O7 | Event | 33 exterior | Marill-type object ow7 (sprite 1032) | none (moved by script 2) | hide flag 421 clear | ev30 ow7 | EVT-033-02, O6 |
| R29-EVT-033-O8 | Event | 33 exterior | ground item ow8 (sprite 87), scriptNumber 7000 | interact | hide flag 1081 clear | ev30 ow8; 141 S#1 | GLB-RTN-ITEMBALL |
| R29-EVT-033-O9 | Event | 33 exterior | object ow9 (sprite 262), scriptNumber 2800, sight range 5 | unresolved | flag 0 (always spawned) | ev30 ow9 | none |
| R29-EVT-033-S2 | Event | 33 exterior | hidden item spawnable 2 (572,390) | interact | found-flag in arm9 table (scriptId 1, Inferred) | ev30 spawnable 2; arm9 hidden-item table idx 1 | GLB-RTN-HIDDENITEM |
| R29-EVT-033-W0 | Event | 33 exterior | warp 0 (626,389) | step | always | ev30 warp 0 | EVT-134-W0, W1; EVT-033-W1 |
| R29-EVT-033-W1 | Event | 33 exterior | warp 1 (627,389) | step | always | ev30 warp 1 | EVT-134-W0; EVT-033-W0 |
| R29-DLG-033-02a | Dialogue variant | 33 exterior | friend (male-player text), "There you are!" | EVT-033-02 | with 02 | 225 S#2 L27; 373 m17 | EVT-033-02, DLG-033-02b |
| R29-DLG-033-02b | Dialogue variant | 33 exterior | friend (female-player text), "There you are!" | EVT-033-02 | with 02 | 225 S#2 L27; 373 m18 | EVT-033-02, DLG-033-02a |
| R29-DLG-033-02c | Dialogue variant | 33 exterior | friend (male-player text), catch lesson opening | EVT-033-02 | with 02 | 225 F#3 L133, F#36 L418; 373 m0 | EVT-033-02, DLG-033-02d |
| R29-DLG-033-02d | Dialogue variant | 33 exterior | friend (female-player text), catch lesson opening | EVT-033-02 | with 02 | 225 F#3 L133, F#36 L418; 373 m1 | EVT-033-02, DLG-033-02c |
| R29-DLG-033-02e | Dialogue variant | 33 exterior | friend, "Was I too fast?" retry | EVT-033-02 | male-player path only | 225 F#31 L372; 373 m2 | EVT-033-02 |
| R29-DLG-033-02f | Dialogue variant | 33 exterior | friend (male-player text), after the demonstration | EVT-033-02 | with 02 | 225 F#25 L310, F#43 L481; 373 m3 | EVT-033-02, DLG-033-02g; GLB-RTN-2033 |
| R29-DLG-033-02g | Dialogue variant | 33 exterior | friend (female-player text), after the demonstration | EVT-033-02 | with 02 | 225 F#25 L310, F#43 L481; 373 m4 | EVT-033-02, DLG-033-02f; GLB-RTN-2033 |
| R29-DLG-033-02h | Dialogue variant | 33 exterior | friend (male-player text), Mr. Paint | EVT-033-02 | with 02 | 225 F#25 L314, F#43 L485; 373 m5 | EVT-033-02, DLG-033-02i; GLB-RTN-2033 |
| R29-DLG-033-02i | Dialogue variant | 33 exterior | friend (female-player text), Mr. Paint | EVT-033-02 | with 02 | 225 F#25 L314, F#43 L485; 373 m6 | EVT-033-02, DLG-033-02h; GLB-RTN-2033 |
| R29-DLG-033-02j | Dialogue variant | 33 exterior | friend (male-player text), farewell | EVT-033-02 | with 02 | 225 F#25 L318, F#43 L489; 373 m7 | EVT-033-02, DLG-033-02k |
| R29-DLG-033-02k | Dialogue variant | 33 exterior | friend (female-player text), farewell | EVT-033-02 | with 02 | 225 F#25 L318, F#43 L489; 373 m8 | EVT-033-02, DLG-033-02j |
| R29-DLG-033-03a | Dialogue variant | 33 exterior | ow2, daytime Pokémon | EVT-033-03 | period value 0 | 225 S#3 L44; 373 m12 | EVT-033-03 |
| R29-DLG-033-03b | Dialogue variant | 33 exterior | ow2, night Pokémon | EVT-033-03 | period value 1 or 2 | 225 F#4 L152, F#18 L251; 373 m13 | EVT-033-03 |
| R29-DLG-033-03c | Dialogue variant | 33 exterior | ow2, morning Pokémon | EVT-033-03 | any other period value | 225 F#26 L333; 373 m14 | EVT-033-03 |
| R29-DLG-033-05a | Dialogue variant | 33 exterior | board S0 text | EVT-033-05 | mapping Inferred | 373 m16 | EVT-033-05, DLG-033-06a |
| R29-DLG-033-06a | Dialogue variant | 33 exterior | board S1 text | EVT-033-06 | mapping Inferred | 373 m15 | EVT-033-06, DLG-033-05a |
| R29-DLG-033-07a | Dialogue variant | 33 exterior | ow0, Pokémon health advice | EVT-033-07 | always | 225 S#7 L88; 373 m9 | EVT-033-07 |
| R29-DLG-033-08a | Dialogue variant | 33 exterior | ow1, "saved to record my progress" | EVT-033-08 | always | 225 S#8 L98; 373 m11 | EVT-033-08 |
| R29-DLG-033-09a | Dialogue variant | 33 exterior | ow3, ledges advice | EVT-033-09 | always | 225 S#9 L108; 373 m10 | EVT-033-09 |
| R29-EVT-134-01 | Event | 134 gate | none (Script 1, `End` only) | no entry names it | Apparently unused | 226 S#1 | none |
| R29-EVT-134-02 | Event | 134 gate | NPC ow0 (sprite 394, faces right) | talk | always | 226 S#2; ev130 ow0; 374 m0 | DLG-134-02a |
| R29-EVT-134-03 | Event | 134 gate | NPC ow1 (sprite 146, wanders) | talk | always | 226 S#3; ev130 ow1; 374 m1 | DLG-134-03a |
| R29-EVT-134-W0 | Event | 134 gate | warp 0 (5,12) → Route 29 | step | always | ev130 warp 0 | EVT-033-W0, W1 |
| R29-EVT-134-W1 | Event | 134 gate | warp 1 (5,2) → Route 46 | step | always | ev130 warp 1 | none in Route 29 |
| R29-DLG-134-02a | Dialogue variant | 134 gate | ow0, ledges advice | EVT-134-02 | always | 226 S#2 L16; 374 m0 | EVT-134-02 |
| R29-DLG-134-03a | Dialogue variant | 134 gate | ow1, "catch them all" | EVT-134-03 | always | 226 S#3 L26; 374 m1 | EVT-134-03 |

## Map 033 — Route 29 exterior (R29)

### Map 033 reading notes
- **Sources:** `get_events {mapHeader: 33}` (event file 30), `get_script {file: 470}` (level script), `get_script {file: 225}` and `project/scripts/0225.script` (9 scripts, 43 functions, 56 actions), `get_text {archive: 373}` (19 messages, indices 0-18), `get_world_data mapHeader 33` and `matrix 0`. Flag/var names from `~/Programming/hg-engine/armips/include/flags.s` and `vars.s`. Line numbers ("L<n>") are lines of `project/scripts/0225.script`.
- **Dialogue rendering:** see Conventions, Text rendering. `{STRVAR_1, 3, 0, 0}` in msgs 0/1 follows `TextPlayerName 0` (0225.script line 132) and is therefore the player name in text buffer 0 (Inferred from the command order).
- **`GenderMessage a b`:** first id is the male-player text, second the female-player text (`docs/scripting-reference.md` line 111; `docs/partner-sprite.md` line 45 records `CheckPlayerGender` writing 0 = male, 1 = female). Not run-tested. For a male player the friend is therefore named "Lyra" (msgs 0, 5, 7, 17, 1:1 with the first ids) and for a female player "Ethan" (Inferred from that order).
- **`CheckFlag n` + `JumpIf EQUAL` = flag n is set; `JumpIf DIFFERENT` = flag clear** (Verified by contrast in the New Bark Town document with script file 843; locally consistent: in script 4 `CheckFlag 2748`/`EQUAL` is the "already done" branch).
- **`Overworld.N` in scripts = the event-file overworld with owID N** (Inferred: owIDs 0-10 equal the list indices 0-10 here). `Following` = the follower Pokémon; `Player` = the player. `CompareVarValue v n` + `JumpIf DIFFERENT` branches when v != n.
- **Player position:** `GetPlayerPosition 0x4000 0x4001` writes X to 0x4000 and Y to 0x4001; Y compares below use the global tile Y (396-402).
- **Undecoded commands (Unresolved):** `MecScript` (script 2, line 18), `CatchTutorial` (line 306; the name suggests the catch demonstration, Inferred), `GetCounterpartSprite 0x4021` (script 1, line 10), `SetFollowingPokeMovement 55` / `48`, `LockFollowingPoke`, `WaitTime 10 0x800C`, `TextPartyPokemon`. Their effect is described from the surrounding script only.
- **Common scripts called (by id; behaviour not documented here):** 2000 = GLB-RTN-2000; 2009 = GLB-RTN-2009; 2029 = GLB-RTN-2029; 2033 = GLB-RTN-2033. Id = 2000 + 0-based position in script file 3. The working ROM holds the vanilla file 3; hg-engine regenerates it at build time.
- **Common message archive:** script 4 reads its text with `GetCommonMessageArchive 0 0x800C` followed by `MessageFromArchive 0x800C <idx>`. Argument 0 maps to text archive 752 according to `docs/mr-paint-appraisal.md` (lines 1456 and 1472, quoting the pret source table: n=0 → archive 752, "day of the week siblings"; line 1472 cites `0225.script:64` idx 7); that mapping is project documentation, Inferred here, not re-read from the engine.
- **Day-of-week value 2:** `GetDayOfWeek` is read as 0 = Sunday elsewhere in the project (`docs/mr-paint-appraisal.md` line 861), so 2 is Tuesday (Inferred); line 1472 of the same doc describes script 4's idx 7 text as the not-the-right-day line.

### Map 033 event inventory
Coordinates are global tiles (x, y). Matrix cells: cell = floor(x / 32): x 576-607 is cell 18, 608-639 cell 19, 640-671 cell 20 (row 12); x 572 (spawnable 2) is cell 17. Every entry maps to a record in this section.

| Section | Idx | Type | owID / sprite (overlayTableEntry) | Coordinates | Flag (hides when set) | scriptNumber | Covered by |
|---|---|---|---|---|---|---|---|
| spawnable | 0 | Board, any direction | - | 581,397 | - | 5 | R29-EVT-033-05 |
| spawnable | 1 | Board, any direction | - | 662,397 | - | 6 | R29-EVT-033-06 |
| spawnable | 2 | HiddenItem, any direction | - | 572,390 | - | 8001 | R29-EVT-033-S2 |
| overworld | 0 | Normal, movement 4 walk up/down (yRange 1), orient 1 | owID 0 / 317 | 626,410 | 0 | 7 | R29-EVT-033-07 |
| overworld | 1 | Normal, movement 15 face down, orient 1 | owID 1 / 332 | 622,392 | 0 | 8 | R29-EVT-033-08 |
| overworld | 2 | Normal, movement 15 face down, orient 1 | owID 2 / 322 | 600,395 | 0 | 3 | R29-EVT-033-03 |
| overworld | 3 | Normal, movement 5 walk left/right (xRange 1), orient 3 | owID 3 / 326 | 608,404 | 0 | 9 | R29-EVT-033-09 |
| overworld | 4 | Normal, movement 0, orient 0 | owID 4 / 86 | 629,401 | 16 | 10000 | R29-EVT-033-O4 |
| overworld | 5 | Normal, movement 0, orient 0 | owID 5 / 86 | 619,405 | 17 | 10000 | R29-EVT-033-O5 |
| overworld | 6 | Normal, movement 0, orient 2 | owID 6 / 102 | 661,400 | 420 | 0 (none) | R29-EVT-033-O6 (moved by R29-EVT-033-02) |
| overworld | 7 | Normal, movement 0, orient 3 | owID 7 / 1032 | 660,400 | 421 | 0 (none) | R29-EVT-033-O7 (moved by R29-EVT-033-02) |
| overworld | 8 | Normal, movement 0, orient 0 (ground item, itemScriptEntry 0) | owID 8 / 87 | 654,386 | 1081 | 7000 | R29-EVT-033-O8 |
| overworld | 9 | Normal, movement 0, orient 0, sightRange 5 | owID 9 / 262 | 596,392 | 0 | 2800 | R29-EVT-033-O9 |
| overworld | 10 | Normal, movement 2 look around, orient 1 | owID 10 / 326 | 629,405 | 519 | 4 | R29-EVT-033-04 |
| warp | 0 | to header 134, anchor 0, height 0 | - | 626,389 | - | - | R29-EVT-033-W0 |
| warp | 1 | to header 134, anchor 0, height 0 | - | 627,389 | - | - | R29-EVT-033-W1 |
| trigger | 0 | rect 1x7, var 16523 (0x408B) == 1 | - | 666,396 | - | 2 | R29-EVT-033-02 |
| level script 470 | 1 | mapChange | - | - | - | 1 | R29-EVT-033-LS (script: R29-EVT-033-01) |

Facts read off the inventory: warps 0 and 1 are adjacent tiles that both lead to header 134 anchor 0. Overworld 6 and 7 sit one tile apart at (661,400)/(660,400). Overworlds 3 and 10 share sprite 326. Overworlds 4 and 5 share sprite 86 and scriptNumber 10000. No overworld is a trainer: the only sight range is overworld 9's (5), type Normal.

### Map 033 flags and variables (readers and writers)
Search basis: every `project/scripts/*.script` (497 files, pulled from the working ROM) by number, plus level script 470 and this event file's `flag` fields. Level scripts and event-file `flag` fields of other maps were not searched (Unresolved for other maps' event files and level scripts, e.g. who else watches var 0x408B).

| Name (flags.s / vars.s) | Number | Read by | Written by |
|---|---|---|---|
| FLAG_HIDE_ROUTE_29_FRIEND | 420 (0x1A4) | event file 30 overworld 6 (hide flag) | set: 225 L325 and L496 (this map), 0149 L11; cleared: 0843 L153, L599 (header 61) |
| FLAG_HIDE_ROUTE_29_MARILL | 421 (0x1A5) | event file 30 overworld 7 (hide flag) | set: 225 L326 and L497, 0149 L12; cleared: 0843 L154, L600 |
| VAR_UNK_408B | 16523 (0x408B) | event file 30 trigger 0 (== 1) | set 1: 0843 L152, L598; set 0: 225 L327, L498 |
| FLAG_UNK_207 | 519 | event file 30 overworld 10 (hide flag) | 225 only: set L14, L218; cleared L119 |
| FLAG_UNK_09A | 154 | 0227 L191 (header 34), 0228 L37 (header 127) | set: 225 L328, L499; no clear found |
| FLAG_GOT_TWISTEDSPOON_FROM_TUSCANY | 216 | 225 L59 | set: 225 L202; no other file |
| FLAG_DAILY_GOT_SHOCK_RIBBON | 2748 | 225 L55; 0232 L92, 0243 L35, 0246 L24, 0941 L78, 0938 L115, 0962 L24 | set: 225 L262; 0232 L443, 0243 L298, 0246 L125, 0941 L354, 0938 L473, 0962 L218; no clear found |
| VAR_NUM_MET_WEEKDAY_SIBLINGS | 0x4094 (16532) | 225 L57 (== 7); 0232 L94, 0243 L37, 0246 L26, 0941 L80, 0938 L117, 0962 L26 | incremented: 225 L203; 0232 L290, 0243 L205, 0246 L103, 0941 L272, 0938 L379, 0962 L164 |
| FLAG_HIDE_ITEMBALL_R29_POTION | 1081 | event file 30 overworld 8 (hide flag) | no script sets or clears it; set by the ground-item machinery on pickup (Inferred, see GLB-RTN-ITEMBALL) |
| FLAG_MAPTEMP_010 | 16 (0x10) | event file 30 overworld 4 (hide flag) | no script touches it |
| FLAG_MAPTEMP_011 | 17 (0x11) | event file 30 overworld 5 (hide flag) | set: 0938 L14, L555 (header 88); map-temp flags are per-map (Inferred), so no effect on Route 29 |
| VAR_OBJ_1 | 0x4021 | no reader in 225 | written by `GetCounterpartSprite 0x4021` (225 L10). Sprite code 1032 on overworld 7 denotes `1000 + (var & 0xFF)` = variable 0x4020 (VAR_OBJ_0) per `docs/partner-sprite.md` line 44 (Inferred), not 0x4021; no overworld on header 33 uses sprite code 1033, so the effect of the 0x4021 write on this map is Unresolved. Outside Route 29, 0x4021 is also written by script file 0085 (`SetVar` at L519, L523, L527, L696, L700) and read there (L203); 0085's header was not resolved |
| temporaries | 0x4000, 0x4001, 0x4002, 0x800C, 0x8002, 0x8004, 0x8005 | script-local | positions (0x4000/0x4001), player gender (0x4002), results (0x800C, 0x8002), item/quantity arguments (0x8004/0x8005) |

Reachability note for this map: nothing in the data fixes the order of the Route 29 scenes against the rest of the story beyond the var 0x408B writer in the Elm's Lab script; each record states only the logical conditions. Where an initial value matters it is stated as Inferred (script/save variables start at 0, flags start clear).

### Map 033 event records

#### R29-EVT-033-01 — Map-entry check that shows or hides the weekday sibling (script 1)
##### Record identity
- **Record ID:** R29-EVT-033-01
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-EVT-033-LS (the level-script entry that runs it); R29-EVT-033-04 (the object whose visibility it sets)
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Level script 470 entry 1 (`mapChange`, scriptId 1), run on every entry to the map; no dialogue
- **Source references:** script file 225 Script#1 (0225.script lines 9-15), Function#1 (115-120), Function#12 (217-219), Function#13 (221-222); level script 470
- **Evidence status:** Verified (commands and branches); Inferred (what `CheckBadge 0` tests and that day value 2 is Tuesday); Unresolved (`GetCounterpartSprite 0x4021` effect)
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Level script 470 entry 1 (`mapChange`) calls script 1 whenever the map is entered or changed to (timing relative to object spawning is not verified).
- **OLD conditions and branch priority:** In order: (a) `CheckBadge 0` result in 0x4000; if 0x4000 == 1 (badge id 0 held; which badge id 0 is, is not stated by the data) go to Function#1, else `SetFlag 519` and `End`. (b) Function#1: `GetDayOfWeek 0x4000`; if the value is not 2 go to Function#12 (`SetFlag 519`, `End`); if it is 2 `ClearFlag 519`, `Jump Function#13` (`End`). Net: flag 519 is clear (object ow10 visible) only if badge id 0 is held and the day-of-week value is 2 (Tuesday, Inferred).
- **OLD event sequence:** (1) Map entry; no prerequisites. (2) `GetCounterpartSprite 0x4021` (L10, undecoded; writes VAR_OBJ_1), `CheckBadge 0 0x4000`, `CompareVarValue 0x4000 1`. (3) `JumpIf EQUAL Function#1` (see above). (4) No movement, locks, sounds or messages. (5) Sets or clears flag 519 as above. (6) Re-evaluated on every map entry. (7) No global calls.
- **OLD state changes:** Flag 519 set or cleared; var 0x4000 (temporary) and var 0x4021 (VAR_OBJ_1) written.
- **OLD repeat/completion behavior:** Runs on every map entry; the day check is re-evaluated each time. Within one visit the visibility does not change.
- **OLD dependencies and shared-resource effects:** Flag 519 is read only as ow10's hide flag in event file 30 and written only in script file 225 (L14, L119, L218). The weekday and badge conditions are engine/save state.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 225 Script#1, Functions #1, #12, #13; level script 470 entry 1
- **Other affected callers or records:** R29-EVT-033-04 (visibility of ow10); level script 470 is the only caller found.
- **Unresolved questions:** What `GetCounterpartSprite 0x4021` does on this map (no object here uses the sprite-by-variable code for VAR_OBJ_1; see the flags table). Which badge `CheckBadge 0` tests. Whether the flag is evaluated before objects are spawned.
- **Validation needed:** In-game: enter the route on Tuesday with and without badge id 0 and on another day.

#### R29-EVT-033-LS — Level script 470 (map-change hook)
##### Record identity
- **Record ID:** R29-EVT-033-LS
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-EVT-033-01
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Level script file 470 (one entry)
- **Source references:** `get_script {file: 470}` (8 bytes, 1 entry); header 33 `levelScriptId` 470
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Entry 1: `mapChange`, scriptId 1.
- **OLD conditions and branch priority:** No condition; the only entry. (There is no `variableValue` entry, so var 0x408B is watched only by the event-file trigger T0, not by the level script.)
- **OLD event sequence:** (1) Map change. (2) Script 1 of file 225 (R29-EVT-033-01). (3)-(6) None of its own. (7) None.
- **OLD state changes:** None of its own.
- **OLD repeat/completion behavior:** Every map change.
- **OLD dependencies and shared-resource effects:** Runs R29-EVT-033-01.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** level script file 470 (replaced whole by `set_script levelScript`)
- **Other affected callers or records:** R29-EVT-033-01.
- **Unresolved questions:** None beyond R29-EVT-033-01 (evaluation timing is engine behaviour, not verified).
- **Validation needed:** Re-read the whole trigger list before any write (a level script is replaced wholesale).

#### R29-EVT-033-02 — Friend's catch-tutorial scene (script 2, trigger T0)
##### Record identity
- **Record ID:** R29-EVT-033-02
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-DLG-033-02a, 02b, 02c, 02d, 02e, 02f, 02g, 02h, 02i, 02j, 02k; R29-EVT-033-O6, R29-EVT-033-O7 (the two actors); GLB-RTN-2029, GLB-RTN-2033
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Step trigger T0 (event file 30 trigger 0: rectangle x 666, y 396, width 1, height 7, watching var 0x408B == 1); actors overworld idx 6 (owID 6, sprite 102) and idx 7 (owID 7, sprite 1032)
- **Source references:** script file 225 Script#2 (L17-35), Functions #2, #3, #14-#17, #21-#24, #27-#30, #31, #32-#43, #25, #36, #40, #43, Actions #1-#56; event file 30 trigger 0, overworlds 6 and 7; text archive 373 msgs 0-8, 17, 18
- **Evidence status:** Verified (commands and branches); Inferred (`CatchTutorial` runs the catch demonstration; Marill-type actor); Unresolved (`MecScript`, follower-Pokémon movement ids 55 and 48)
##### OLD — Current content
- **OLD dialogue:** In order: R29-DLG-033-02a/b (msg 17/18) at the trigger; R29-DLG-033-02c/d (msg 0/1) after the actors walk to the player; on the male-player path only R29-DLG-033-02e (msg 2); then R29-DLG-033-02f/g (msg 3/4), R29-DLG-033-02h/i (msg 5/6) and R29-DLG-033-02j/k (msg 7/8), each pair chosen by player gender (first id male player).
- **OLD raw message data:** See the dialogue records (373 msgs 0-8, 17, 18).
- **OLD trigger:** The player steps onto any tile of the rectangle x 666, y 396-402 while var 0x408B == 1. Event-file `scriptNumber` 2.
- **OLD conditions and branch priority:** Preconditions: var 0x408B == 1 (written 1 only by script file 0843 L152 and L598, header 61, together with clearing flags 420/421 so that ow6 and ow7 are shown); ow6/ow7 hide flags 420/421 clear. Branches: (a) the player's Y (0x4001) selects the actors' walking pattern. First chain, tested in this order: 396 (Script 2 → Actions #3/#4), 397 (Function#2 → #5/#6), 398 (Function#14 → #10/#11), 399 (Function#21 → #16/#17), 400 (Function#27 → #26/#27), 401 (Function#32 → #40/#41), 402 (Function#36 → #46/#47, then a verbatim copy of Function#3's body, L415-431, instead of a jump to Function#3). Any other Y reaches Function#3. Because the trigger rectangle covers only Y 396-402, the "other Y" fall-through is not reachable from the trigger (Inferred). (b) After msg 0/1, `CheckPlayerGender 0x4002` and a second Y chain (Function#3, #15, #22, #28, #33, #37, #40): 396 → actors #7/#8, player #9 (male, via stub Function#17) or #15 (female, Function#16); 397 → #12/#13, player #14 (male, stub Function#24) or #21 (female, Function#23); 398 → #18/#19, player #20 (male, stub #30) or #31 (female, #29); 399 → #28/#29, player #30 (male, stub #35) or #45 (female, #34); 400 → #42/#43, player #44 (male, stub #39) or #51 (female, #38); 401 → #48/#49, player #50 (male, stub #42) or #55 (female, #41); 402 → #52/#53, player #54 (male, straight to Function#25) or female → Function#43 (player #56). Any other Y goes to Function#25. (c) In Function#25 and Function#43, `CompareVarValue 0x4002 0` / `CallIf EQUAL Function#31` runs the "too fast" retry (msg 2) only for the male player (0 = male, `docs/partner-sprite.md` line 45). Function#43 is entered only when 0x4002 != 0, so its own copy of that call (L474-475) can never fire (Inferred from the branch). Reachability: msgs 17/18, 0/1, 3/4, 5/6, 7/8 Referenced and apparently reachable; msg 2 reachable on the male-player path only; the second member of each pair is reachable for the other gender.
- **OLD event sequence:** (1) Trigger fires (conditions above). (2) `MecScript` (L18, undecoded); `LockAll`; `PlayCry SPECIES_MARILL 0`; `WaitCry`; `Movement Overworld.7 Action#1` (WalkSouth4 x1, WalkEast4 x2, WalkNorth4 x1, JumpOnSpotWest8 x2); `WaitMovement`; `Movement Overworld.6 Action#2` (WalkOnSpotEast8, EmoteExclamation); `WaitMovement`; `CommonScript 2029` (GLB-RTN-2029); `GenderMessage 17 18` (L27); `CloseMessage`; `GetPlayerPosition 0x4000 0x4001`; `Release Overworld.7`. (3) The Y chain (a) above makes both actors walk (Actions #3-#4, #5-#6, #10-#11, #16-#17, #26-#27, #40-#41, #46-#47) and ends in Function#3: `WaitMovement`; `Lock Overworld.7`; `TextPlayerName 0`; `GenderMessage 0 1` (L133); `CloseMessage`; `GetPlayerPosition`; `CheckPlayerGender 0x4002`; `LockFollowingPoke 0`; `WaitFollowingPoke`; `SetFollowingPokeMovement 55`; then chain (b). (4) Function#25 (L298): `WaitMovement`; `WaitFollowingPoke`; `LockFollowingPoke 1`; `SetFollowingPokeMovement 48`; male player: `CallIf` Function#31 (ow6 `EmoteExclamation`, ow6 jumps on the spot west, ow6 and ow7 jump (Actions #33, #34), ow6 and ow7 walk (Actions #35, #36), `Message 2` at L372, `CloseMessage`, `LockFollowingPoke 0`, `WaitFollowingPoke`, `SetFollowingPokeMovement 55`, actors and player walk west, `WaitMovement`, `WaitFollowingPoke`, `LockFollowingPoke 1`, `SetFollowingPokeMovement 48`, `Return`); `WaitTime 10 0x800C`; `CatchTutorial` (L306, undecoded); `Movement Overworld.6 Action#22` / `Overworld.7 Action#23`; `WaitMovement`; `GenderMessage 3 4` (L310); `SetVar 0x8004 4`, `SetVar 0x8005 5`; `CommonScript 2033` (GLB-RTN-2033; item 4 is Poké Ball per `lookup_names`, quantity 5, Inferred from the argument order); `GenderMessage 5 6` (L314); `SetVar 0x8004 2685`, `SetVar 0x8005 1`; `CommonScript 2033`; `GenderMessage 7 8` (L318); `CloseMessage`; `Movement Overworld.6 Action#24` / `Overworld.7 Action#25` (both walk away); `WaitMovement`; `RemoveOW Overworld.6`; `RemoveOW Overworld.7`. (5) `SetFlag 420` (L325); `SetFlag 421` (L326); `SetVar 0x408B 0` (L327); `SetFlag 154` (L328); `ReleaseAll`; `End`. (6) Does not repeat: var 0x408B is reset to 0 and the actors are removed and hidden. (7) Global calls: GLB-RTN-2029, GLB-RTN-2033 (twice).
- **OLD state changes:** Flags 420, 421, 154 set; var 0x408B = 0; the player receives item 4 (Poké Ball) x5 and item 2685 x1 (through GLB-RTN-2033, if the receipt succeeds); ow6/ow7 removed; the follower Pokémon is locked and released. Items: item 2685 has no name in this ROM's item names (`lookup_names` returns null); `docs/mr-paint-follower.md` line 101 records `ITEM_MR_PAINT` = 2685 (project-doc citation, not a ROM fact); hg-engine supplies the item in builds.
- **OLD repeat/completion behavior:** One-time. Once var 0x408B is 0 the trigger no longer fires; the flag 154 set at the end is the "Mr. Paint already issued" marker read by Route 30 (see Dependency references).
- **OLD dependencies and shared-resource effects:** Var 0x408B (writers in file 0843, header 61); flags 420/421 (cleared in 0843, set also in 0149); flag 154 (read in 0227, 0228); item 2685; GLB-RTN-2029, GLB-RTN-2033; text archive 373 msgs 5/6 edited by journal id 21, script edited by journal id 20. Function#43 duplicates Function#25 (L481-499 repeat L310-328); Function#36 duplicates Function#3's body (L415-432 vs L129-147). Messages 0/1 are read at two lines (L133, L418) and 3/4, 5/6, 7/8 at two lines each (L310/L481, L314/L485, L318/L489).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 373 msgs 0-8, 17, 18; script file 225 Script#2 and Functions #2, #3, #14-#17, #21-#24, #27-#43, #25, Actions #1-#56; event file 30 trigger 0, overworlds 6 and 7
- **Other affected callers or records:** Script file 0843 (header 61) sets var 0x408B and clears 420/421; Route 30 files 0227/0228 read flag 154 for the Mr. Paint re-gift; Function#25 and Function#43 must be edited together; text edits to 373 msgs 3-8 change both L310-318 and L481-489 callers.
- **Unresolved questions:** What `MecScript` and `CatchTutorial` do exactly; the meaning of follower movement ids 55 and 48; why `Release Overworld.7` (L30) precedes `Lock Overworld.7` (L131); what CommonScript 2033 prints in the working ROM versus the hg-engine build (global, see GLB-RTN-2033); whether 0x4002 == 0 is male for this ROM beyond the project-doc statement; how the follower Pokémon is displayed during the scene.
- **Validation needed:** In-game, with a male and a female player, crossing the trigger on each of the seven rows (Y 396-402), with and without a follower Pokémon; confirm the two gifts and that the scene does not repeat; confirm the female path through Function#43 on row 402.

#### R29-EVT-033-03 — Time-of-day NPC waiting for Pokémon (script 3)
##### Record identity
- **Record ID:** R29-EVT-033-03
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-DLG-033-03a, R29-DLG-033-03b, R29-DLG-033-03c
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Talk-to NPC, event file 30 overworld idx 2 (owID 2, sprite 322, at 600,395, movement 15 face down, no hide flag)
- **Source references:** script file 225 Script#3 (L37-45), Functions #4 (L149-153), #5 (L155-160), #18 (L248-252), #26 (L332-337); event file 30 overworld idx 2; text archive 373 msgs 12, 13, 14
- **Evidence status:** Verified (branches and message ids); Unresolved (time-period value names)
##### OLD — Current content
- **OLD dialogue:** One of three messages by time period: msg 12 (03a, daytime), msg 13 (03b, night) or msg 14 (03c, morning).
- **OLD raw message data:** See the dialogue records.
- **OLD trigger:** Player talks to overworld idx 2 (`scriptNumber` 3): `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** `GetTimePeriod 0x800C`, then in order: value 0 → msg 12; else value 1 → msg 13; else value 2 → msg 13 (second copy of the same message); else (any other value, 3 in practice) → msg 14. The mapping of period values to time-of-day names is not stated by the data (Unresolved); the message texts name daytime for value 0, night for values 1 and 2 and morning for the rest. Reachability: Referenced and apparently reachable for every value.
- **OLD event sequence:** (1) Talk. (2) `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`, `GetTimePeriod 0x800C`. (3) Compare chain above (Script#3 → Function#4 → Function#18 → Function#26). (4) `Message n`; every path ends in the Function#5 tail (Function#26 repeats the tail inline): `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. (5) None. (6) Repeatable. (7) No global calls.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable; text depends on the current period.
- **OLD dependencies and shared-resource effects:** Engine time-of-day. Msg 13 is read at two lines (L152, L251).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 373 msgs 12, 13, 14; script file 225 Script#3 and Functions #4, #5, #18, #26; event file 30 overworld idx 2
- **Other affected callers or records:** None found (msg 12 only at L44; msg 13 at L152 and L251; msg 14 only at L333).
- **Unresolved questions:** What numeric value each time period has; why value 1 and value 2 both show the night text (and what value 3 is).
- **Validation needed:** In-game at morning, day and night (host clock), at least one of each; text-box fit after any edit.

#### R29-EVT-033-04 — Weekday-sibling NPC with the TwistedSpoon and the ribbon (script 4)
##### Record identity
- **Record ID:** R29-EVT-033-04
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-EVT-033-01 (visibility); R29-DLG-033-04a to R29-DLG-033-04h (the eight common-archive messages); GLB-RTN-2009, GLB-RTN-2033
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Talk-to NPC, event file 30 overworld idx 10 (owID 10, sprite 326, at 629,405, movement 2 look around, orient 1, hide flag 519)
- **Source references:** script file 225 Script#4 (L47-66), Functions #6 (L161-167), #7 (L169-175), #8 (L177-183), #9 (L185-191), #10 (L193-209), #11 (L211-215), #19 (L254-266), #20 (L268-272); event file 30 overworld idx 10
- **Evidence status:** Verified (commands, branches, ids); Inferred (that `CheckRibbon`'s result 1 means the first alive party Pokémon (`GetFirstAlivePokemonSlot`, L51) already holds ribbon 60, and what the common messages contain); Unresolved (the exact archive; day-of-week naming)
##### OLD — Current content
- **OLD dialogue:** No local text archive; the eight messages are read from the common message archive `GetCommonMessageArchive 0` (text archive 752, Inferred) and are Route 29-specific text: R29-DLG-033-04a (msg 7, wrong day), 04b (msg 33, ribbon already held), 04c (msg 35, one ribbon per week), 04d (msg 6, siblings), 04e (msg 4, TwistedSpoon introduction), 04f (msg 5, TwistedSpoon remark), 04g (msg 32, Shock Ribbon offer), 04h (msg 34, ribbon put on). No `GLB-PRM` record exists for them; their classification is resolved in "Scope classifications marked uncertain".
- **OLD raw message data:** See the eight R29-DLG-033-04 records. Message indices used from the common archive, in script order: 7, 33, 35, 6, 4, 5, 32, 34.
- **OLD trigger:** Player talks to overworld idx 10 (`scriptNumber` 4): `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`. The object exists only when flag 519 is clear (see R29-EVT-033-01).
- **OLD conditions and branch priority:** After `GetFirstAlivePokemonSlot 0x8002` and `CheckRibbon 0x800C 0x8002 60`: (a) 0x800C == 1 → Function#6 (common message 33; tail). (b) else flag 2748 set → Function#7 (common message 35; tail). (c) else var 0x4094 == 7 → Function#8: `GetDayOfWeek 0x800C`; day value 2 → Function#19 (common message 32, `TextPartyPokemon 0 0x8002`, common message 34, `GiveRibbon 0x8002 60`, `PlaySound SEQ_ME_ITEM`, `WaitSound`, `SetFlag 2748`, tail); any other day → common message 7 then Function#11. (d) else flag 216 set → Function#9 (common message 6; tail). (e) else `GetDayOfWeek`: value 2 → Function#10; (f) otherwise common message 7 then Function#11. Function#10: common message 4; `SetVar 0x8004 248` (TwistedSpoon, `lookup_names`), `SetVar 0x8005 1`; `CheckItemSpace 0x8004 0x8005 0x800C`; result 0 → Function#20 (`CommonScript 2009` = GLB-RTN-2009, `CloseMessage`, `ReleaseAll`, `End`); else `CommonScript 2033` (GLB-RTN-2033), `SetFlag 216`, `IncrementVar 0x4094 1`, common message 5, tail. "Tail" = `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. Reachability: (a)-(f) Referenced and apparently reachable as conditions; branch (c)'s day-2 path needs var 0x4094 == 7, which counts the weekday siblings met (increments in script files 225, 0232, 0243, 0246, 0941, 0938, 0962); that all seven are reachable is not verified here.
- **OLD event sequence:** (1) Talk; object visible only when badge id 0 is held and the day is value 2 at map entry. (2)-(3) As the condition list above. Messages come from `GetCommonMessageArchive 0 0x800C` followed by `MessageFromArchive 0x800C <idx>` (L64-65 and in each function); argument 0 maps to text archive 752 per `docs/mr-paint-appraisal.md` (Inferred; the eight message texts read from archive 752 fit the points of use, and archive 0 itself has only 12 messages, so index 32+ cannot be archive 0). (4) `PlaySound SEQ_ME_ITEM` (L260) on the ribbon path only. (5) Flag 216 and var 0x4094 on the item path; flag 2748 on the ribbon path. (6) Repeatable; item once (flag 216), ribbon once per flag 2748. (7) GLB-RTN-2009, GLB-RTN-2033.
- **OLD state changes:** Item 248 (TwistedSpoon) x1 given through GLB-RTN-2033 (if there is room); flag 216 set; var 0x4094 +1; ribbon 60 given to the first alive Pokémon (slot in 0x8002); flag 2748 set.
- **OLD repeat/completion behavior:** The item is given once (flag 216, not cleared by any script). The ribbon is given once while flag 2748 stays set; 2748 is named "DAILY" in flags.s but no script clears it, so how it resets is Unresolved.
- **OLD dependencies and shared-resource effects:** Flags 216 and 2748 and var 0x4094 are shared with the sibling NPC scripts of script files 0232 (Route 32), 0243 (Route 36), 0246 (Route 37), 0941 (Blackthorn City), 0938 (Lake of Rage) and 0962 (Route 40); the same common-message archive is shared with those files. Flag 216 is read and set only in this file. GLB-RTN-2009 and GLB-RTN-2033 are called here; both live in the common script file that hg-engine regenerates on every build (see Source and how it connects), so the hg-engine build can change their behaviour.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 225 Script#4 and Functions #6-#11, #19, #20; event file 30 overworld idx 10; the eight common-archive messages are documented as R29-DLG-033-04a to -04h (text archive 752 msgs 4-7 and 32-35, Inferred mapping; no other script file reads those indices)
- **Other affected callers or records:** R29-EVT-033-01 (visibility); the six sibling script files listed above share flag 2748 and var 0x4094; global ids GLB-RTN-2009, GLB-RTN-2033.
- **Unresolved questions:** The exact text archive behind `GetCommonMessageArchive 0` (Inferred 752 from a project doc; the eight texts are recorded as R29-DLG-033-04a to -04h). What ribbon 60 is. Whether day value 2 is Tuesday (Inferred). How flag 2748 resets. What `CheckRibbon` result 1 means (Inferred: ribbon held).
- **Validation needed:** In-game on the relevant weekday, in a state where 0x4094 is below 7, equal to 7, with and without the ribbon and with a full bag.

#### R29-DLG-033-04a — "Tuscany: Tuesday was over before I even noticed..."
##### Record identity
- **Record ID:** R29-DLG-033-04a
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-04
- **Related record IDs:** R29-EVT-033-04; R29-DLG-033-04b, R29-DLG-033-04c, R29-DLG-033-04d, R29-DLG-033-04e, R29-DLG-033-04f, R29-DLG-033-04g, R29-DLG-033-04h
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Weekday-sibling NPC (event file 30 overworld idx 10, owID 10) — Tuscany (named in the text)
- **Source references:** script file 225 Script#4 (`GetCommonMessageArchive 0` L64, `MessageFromArchive 0x800C 7` L65) and Function#8 (L181-182); common message archive argument 0 = text archive 752 (Inferred), msg 7
- **Evidence status:** Verified (message text, call sites, branch conditions); Inferred (that argument 0 is text archive 752)
##### OLD — Current content
- **OLD dialogue:** `Tuscany: Tuesday was over before I / even noticed...` [scroll] `I’ll see you again next Tuesday...`
- **OLD raw message data:** `Tuscany: Tuesday was over before I\neven noticed...\rI’ll see you again next Tuesday...`
- **OLD trigger:** Shown by R29-EVT-033-04 when the player talks to overworld idx 10 and no earlier branch applies; followed by Function#11 (`WaitButton`, `CloseMessage`, `ReleaseAll`, `End`).
- **OLD conditions and branch priority:** The "wrong day" line. Two paths: (1) end of Script#4 (L65): the first alive Pokémon does not hold ribbon 60 (`CheckRibbon` result not 1), flag 2748 is clear, var 0x4094 is not 7, flag 216 is clear, and `GetDayOfWeek` is not 2; (2) Function#8 (L182): as (1) up to flag 2748, var 0x4094 is 7 and the day is not 2. Reachability: Referenced and apparently reachable as a condition; the object itself is visible only when the day is 2 at map entry (R29-EVT-033-01), so this line appears when the day changes while the player is on the map or the map is not re-entered (Inferred).
- **OLD event sequence:** Step (3)/(e) of the parent sequence: message, then Function#11 tail.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** The message sits in a shared common archive (archive 752, 56 messages, read by seven script files through `GetCommonMessageArchive 0`; each sibling file reads its own block of indices). Read at two lines (L65, L182).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** common message archive (text archive 752, Inferred) msg 7
- **Other affected callers or records:** Both call sites are in script file 225. A grep of `project/scripts/` finds no other script file reading index 7 of archive 0: 0232, 0243, 0246, 0938, 0941 and 0962 read other indices of it (see Verification performed), and the files using `GetCommonMessageArchive 1`, `2` or `3` read other archives. Editing it does not touch the rest of the game as far as scripts go; engine or overlay code reading archive 752 was not checked.
- **Unresolved questions:** The archive mapping (argument 0 → 752) is Inferred; day value 2 as Tuesday is Inferred.
- **Validation needed:** Text-box fit after any edit; in game on a non-Tuesday with the object present.

#### R29-DLG-033-04b — "Tuscany: That Shock Ribbon looks great on your Pokémon..."
##### Record identity
- **Record ID:** R29-DLG-033-04b
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-04
- **Related record IDs:** R29-EVT-033-04; R29-DLG-033-04a, R29-DLG-033-04c, R29-DLG-033-04d, R29-DLG-033-04e, R29-DLG-033-04f, R29-DLG-033-04g, R29-DLG-033-04h
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Weekday-sibling NPC (event file 30 overworld idx 10, owID 10) — Tuscany (named in the text)
- **Source references:** script file 225 Function#6 (`GetCommonMessageArchive 0` L162, `MessageFromArchive 0x800C 33` L163); common message archive argument 0 = text archive 752 (Inferred), msg 33
- **Evidence status:** Verified (message text, call site, branch condition); Inferred (that argument 0 is text archive 752; that `CheckRibbon` result 1 means ribbon 60 is held)
##### OLD — Current content
- **OLD dialogue:** `Tuscany: That Shock Ribbon looks great / on your Pokémon...`
- **OLD raw message data:** `Tuscany: That Shock Ribbon looks great\non your Pokémon...`
- **OLD trigger:** Shown by R29-EVT-033-04 when the player talks to overworld idx 10; first branch tested after `GetFirstAlivePokemonSlot` and `CheckRibbon`. Followed by `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`.
- **OLD conditions and branch priority:** Branch (a), highest priority: `CheckRibbon 0x800C 0x8002 60` leaves 0x800C == 1 (Inferred: the first alive Pokémon already holds ribbon 60), regardless of flag 2748, var 0x4094, flag 216 or the day. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent sequence: message, tail.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** Shared common archive (archive 752); depends on ribbon 60 being on the first alive party Pokémon.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** common message archive (text archive 752, Inferred) msg 33
- **Other affected callers or records:** Single call site (L163). A grep of `project/scripts/` finds no other script file reading index 33 of archive 0: 0232, 0243, 0246, 0938, 0941 and 0962 read other indices of it (see Verification performed), and the files using `GetCommonMessageArchive 1`, `2` or `3` read other archives. Editing it does not touch the rest of the game as far as scripts go; engine or overlay code reading archive 752 was not checked.
- **Unresolved questions:** The archive mapping is Inferred; what ribbon 60 is and the meaning of `CheckRibbon` result 1 are Inferred.
- **Validation needed:** Text-box fit after any edit; in game with the ribbon on the first alive Pokémon.

#### R29-DLG-033-04c — "You can only get one ribbon per week..."
##### Record identity
- **Record ID:** R29-DLG-033-04c
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-04
- **Related record IDs:** R29-EVT-033-04; R29-DLG-033-04a, R29-DLG-033-04b, R29-DLG-033-04d, R29-DLG-033-04e, R29-DLG-033-04f, R29-DLG-033-04g, R29-DLG-033-04h
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Weekday-sibling NPC (event file 30 overworld idx 10, owID 10); the text carries no speaker name
- **Source references:** script file 225 Function#7 (`GetCommonMessageArchive 0` L170, `MessageFromArchive 0x800C 35` L171); common message archive argument 0 = text archive 752 (Inferred), msg 35
- **Evidence status:** Verified (message text, call site, branch condition); Inferred (that argument 0 is text archive 752)
##### OLD — Current content
- **OLD dialogue:** `You can only get one ribbon per week...` [scroll] `If you want another ribbon, come find / me again next week!`
- **OLD raw message data:** `You can only get one ribbon per week...\rIf you want another ribbon, come find\nme again next week!`
- **OLD trigger:** Shown by R29-EVT-033-04 when the player talks to overworld idx 10; followed by `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`.
- **OLD conditions and branch priority:** Branch (b): the ribbon check did not give 1 and flag 2748 is set. Reachability: Referenced and apparently reachable once the ribbon has been given (flag 2748 is set at that point, R29-DLG-033-04g/h).
- **OLD event sequence:** Step (2) of the parent sequence: message, tail.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable while flag 2748 stays set; how the flag resets is Unresolved (see the parent).
- **OLD dependencies and shared-resource effects:** Shared common archive (archive 752); flag 2748 is shared with the sibling NPC scripts of 0232, 0243, 0246, 0938, 0941 and 0962.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** common message archive (text archive 752, Inferred) msg 35
- **Other affected callers or records:** Single call site (L171). A grep of `project/scripts/` finds no other script file reading index 35 of archive 0: 0232, 0243, 0246, 0938, 0941 and 0962 read other indices of it (see Verification performed), and the files using `GetCommonMessageArchive 1`, `2` or `3` read other archives. Editing it does not touch the rest of the game as far as scripts go; engine or overlay code reading archive 752 was not checked.
- **Unresolved questions:** The archive mapping is Inferred; how flag 2748 resets.
- **Validation needed:** Text-box fit after any edit; in game after receiving the ribbon.

#### R29-DLG-033-04d — "Tuscany: Have you met Monica, my older sister?"
##### Record identity
- **Record ID:** R29-DLG-033-04d
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-04
- **Related record IDs:** R29-EVT-033-04; R29-DLG-033-04a, R29-DLG-033-04b, R29-DLG-033-04c, R29-DLG-033-04e, R29-DLG-033-04f, R29-DLG-033-04g, R29-DLG-033-04h
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Weekday-sibling NPC (event file 30 overworld idx 10, owID 10) — Tuscany (named in the text)
- **Source references:** script file 225 Function#9 (`GetCommonMessageArchive 0` L186, `MessageFromArchive 0x800C 6` L187); common message archive argument 0 = text archive 752 (Inferred), msg 6
- **Evidence status:** Verified (message text, call site, branch condition); Inferred (that argument 0 is text archive 752)
##### OLD — Current content
- **OLD dialogue:** `Tuscany: Have you met Monica, my older / sister?` [scroll] `Or my younger brother, Wesley?` [scroll] `I am the second of seven children.`
- **OLD raw message data:** `Tuscany: Have you met Monica, my older\nsister?\rOr my younger brother, Wesley?\rI am the second of seven children.`
- **OLD trigger:** Shown by R29-EVT-033-04 when the player talks to overworld idx 10; followed by `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`.
- **OLD conditions and branch priority:** Branch (d): ribbon check not 1, flag 2748 clear, var 0x4094 not 7, and flag 216 set (the TwistedSpoon was already given). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent sequence: message, tail.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable (flag 216 is never cleared by any script, per the parent).
- **OLD dependencies and shared-resource effects:** Shared common archive (archive 752); flag 216 is read and set only in script file 225.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** common message archive (text archive 752, Inferred) msg 6
- **Other affected callers or records:** Single call site (L187). A grep of `project/scripts/` finds no other script file reading index 6 of archive 0: 0232, 0243, 0246, 0938, 0941 and 0962 read other indices of it (see Verification performed), and the files using `GetCommonMessageArchive 1`, `2` or `3` read other archives. Editing it does not touch the rest of the game as far as scripts go; engine or overlay code reading archive 752 was not checked.
- **Unresolved questions:** The archive mapping is Inferred.
- **Validation needed:** Text-box fit after any edit; in game after taking the TwistedSpoon, with var 0x4094 below 7.

#### R29-DLG-033-04e — "Tuscany: Please allow me to introduce myself." (TwistedSpoon gift)
##### Record identity
- **Record ID:** R29-DLG-033-04e
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-04
- **Related record IDs:** R29-EVT-033-04; R29-DLG-033-04a, R29-DLG-033-04b, R29-DLG-033-04c, R29-DLG-033-04d, R29-DLG-033-04f, R29-DLG-033-04g, R29-DLG-033-04h; GLB-RTN-2009, GLB-RTN-2033
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Weekday-sibling NPC (event file 30 overworld idx 10, owID 10) — Tuscany (named in the text)
- **Source references:** script file 225 Function#10 (`GetCommonMessageArchive 0` L194, `MessageFromArchive 0x800C 4` L195); common message archive argument 0 = text archive 752 (Inferred), msg 4
- **Evidence status:** Verified (message text, call site, branch condition); Inferred (that argument 0 is text archive 752; that the "TwistedSpoon" wording matches item 248 given right after)
##### OLD — Current content
- **OLD dialogue:** `Tuscany: Please allow me to introduce / myself. I am Tuscany of Tuesday.` [scroll] `By way of introduction, please accept / this gift, a TwistedSpoon.` [scroll]
- **OLD raw message data:** `Tuscany: Please allow me to introduce\nmyself. I am Tuscany of Tuesday.\rBy way of introduction, please accept\nthis gift, a TwistedSpoon.\r`
- **OLD trigger:** Shown by R29-EVT-033-04 when the player talks to overworld idx 10, before the item check: next come `SetVar 0x8004 248`, `SetVar 0x8005 1`, `CheckItemSpace`.
- **OLD conditions and branch priority:** Branch (e): ribbon check not 1, flag 2748 clear, var 0x4094 not 7, flag 216 clear, and `GetDayOfWeek` is 2. Shown before the bag-space test, so it also appears when the bag is full (then GLB-RTN-2009 follows and no flag is set). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (3) of the parent sequence: this message, item 248 x1 through GLB-RTN-2033 if there is room, then R29-DLG-033-04f.
- **OLD state changes:** None of its own (the gift follows).
- **OLD repeat/completion behavior:** Repeats until the gift succeeds (flag 216 is set only then).
- **OLD dependencies and shared-resource effects:** Shared common archive (archive 752); followed by GLB-RTN-2033 / GLB-RTN-2009, regenerated by hg-engine in builds.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** common message archive (text archive 752, Inferred) msg 4
- **Other affected callers or records:** Single call site (L195). A grep of `project/scripts/` finds no other script file reading index 4 of archive 0: 0232, 0243, 0246, 0938, 0941 and 0962 read other indices of it (see Verification performed), and the files using `GetCommonMessageArchive 1`, `2` or `3` read other archives. Editing it does not touch the rest of the game as far as scripts go; engine or overlay code reading archive 752 was not checked.
- **Unresolved questions:** The archive mapping is Inferred.
- **Validation needed:** Text-box fit after any edit; in game on the relevant weekday with and without bag space.

#### R29-DLG-033-04f — "Tuscany: Wouldn’t you agree that it is most adorable?"
##### Record identity
- **Record ID:** R29-DLG-033-04f
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-04
- **Related record IDs:** R29-EVT-033-04; R29-DLG-033-04a, R29-DLG-033-04b, R29-DLG-033-04c, R29-DLG-033-04d, R29-DLG-033-04e, R29-DLG-033-04g, R29-DLG-033-04h; GLB-RTN-2033
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Weekday-sibling NPC (event file 30 overworld idx 10, owID 10) — Tuscany (named in the text)
- **Source references:** script file 225 Function#10 (`GetCommonMessageArchive 0` L204, `MessageFromArchive 0x800C 5` L205); common message archive argument 0 = text archive 752 (Inferred), msg 5
- **Evidence status:** Verified (message text, call site, branch condition); Inferred (that argument 0 is text archive 752)
##### OLD — Current content
- **OLD dialogue:** `Tuscany: Wouldn’t you agree that it is / most adorable?` [scroll] `It strengthens Psychic-type moves.` [scroll] `I am certain it will be of use.`
- **OLD raw message data:** `Tuscany: Wouldn’t you agree that it is\nmost adorable?\rIt strengthens Psychic-type moves.\rI am certain it will be of use.`
- **OLD trigger:** Shown by R29-EVT-033-04 right after the item gift (`CommonScript 2033`), `SetFlag 216` and `IncrementVar 0x4094 1`; followed by `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`.
- **OLD conditions and branch priority:** Branch (e), success path only: `CheckItemSpace` result not 0 (there is room for item 248). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (3)/(5) of the parent sequence: after the gift.
- **OLD state changes:** None of its own (flag 216 and var 0x4094 are changed just before it).
- **OLD repeat/completion behavior:** Once per successful gift.
- **OLD dependencies and shared-resource effects:** Shared common archive (archive 752); follows GLB-RTN-2033; var 0x4094 is shared with the sibling scripts.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** common message archive (text archive 752, Inferred) msg 5
- **Other affected callers or records:** Single call site (L205). A grep of `project/scripts/` finds no other script file reading index 5 of archive 0: 0232, 0243, 0246, 0938, 0941 and 0962 read other indices of it (see Verification performed), and the files using `GetCommonMessageArchive 1`, `2` or `3` read other archives. Editing it does not touch the rest of the game as far as scripts go; engine or overlay code reading archive 752 was not checked.
- **Unresolved questions:** The archive mapping is Inferred.
- **Validation needed:** Text-box fit after any edit; in game after receiving the TwistedSpoon.

#### R29-DLG-033-04g — "Tuscany: Hey, you! The one who found all of my siblings!"
##### Record identity
- **Record ID:** R29-DLG-033-04g
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-04
- **Related record IDs:** R29-EVT-033-04; R29-DLG-033-04a, R29-DLG-033-04b, R29-DLG-033-04c, R29-DLG-033-04d, R29-DLG-033-04e, R29-DLG-033-04f, R29-DLG-033-04h
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Weekday-sibling NPC (event file 30 overworld idx 10, owID 10) — Tuscany (named in the text)
- **Source references:** script file 225 Function#19 (`GetCommonMessageArchive 0` L255, `MessageFromArchive 0x800C 32` L256); common message archive argument 0 = text archive 752 (Inferred), msg 32
- **Evidence status:** Verified (message text, call site, branch condition); Inferred (that argument 0 is text archive 752; that the "Shock Ribbon" wording matches ribbon 60 given right after)
##### OLD — Current content
- **OLD dialogue:** `Tuscany: Hey, you! / The one who found all of my siblings!` [new box] `Yeah, you!` [scroll] `We’re pretty good friends now, don’t / you agree?` [scroll] `Since we’re such good friends, I’ll give / you this Shock Ribbon!` [scroll]
- **OLD raw message data:** `Tuscany: Hey, you!\nThe one who found all of my siblings!\fYeah, you!\rWe’re pretty good friends now, don’t\nyou agree?\rSince we’re such good friends, I’ll give\nyou this Shock Ribbon!\r`
- **OLD trigger:** Shown by R29-EVT-033-04 when the player talks to overworld idx 10; next in the same function come `TextPartyPokemon 0 0x8002` and R29-DLG-033-04h, then `GiveRibbon 0x8002 60`.
- **OLD conditions and branch priority:** Branch (c) day-2 path: ribbon check not 1, flag 2748 clear, var 0x4094 == 7 (Function#8) and `GetDayOfWeek` is 2 (Function#19). Reachability: Referenced and apparently reachable if all seven siblings of var 0x4094 can be met (not verified, see the parent).
- **OLD event sequence:** Step (2)-(4) of the parent sequence: this message, party Pokémon name, R29-DLG-033-04h, ribbon 60 to the first alive Pokémon, `PlaySound SEQ_ME_ITEM`, `WaitSound`, `SetFlag 2748`, tail.
- **OLD state changes:** None of its own (ribbon 60 and flag 2748 follow).
- **OLD repeat/completion behavior:** Until flag 2748 is set; repeats while it stays clear.
- **OLD dependencies and shared-resource effects:** Shared common archive (archive 752); var 0x4094 and flag 2748 are shared with the sibling NPC scripts.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** common message archive (text archive 752, Inferred) msg 32
- **Other affected callers or records:** Single call site (L256). A grep of `project/scripts/` finds no other script file reading index 32 of archive 0: 0232, 0243, 0246, 0938, 0941 and 0962 read other indices of it (see Verification performed), and the files using `GetCommonMessageArchive 1`, `2` or `3` read other archives. Editing it does not touch the rest of the game as far as scripts go; engine or overlay code reading archive 752 was not checked.
- **Unresolved questions:** The archive mapping is Inferred; what ribbon 60 is.
- **Validation needed:** Text-box fit after any edit (the message has a new-box break); in game on the relevant weekday with var 0x4094 == 7.

#### R29-DLG-033-04h — "{STRVAR_1, 0, 0, 0} put on the Shock Ribbon!"
##### Record identity
- **Record ID:** R29-DLG-033-04h
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-04
- **Related record IDs:** R29-EVT-033-04; R29-DLG-033-04a, R29-DLG-033-04b, R29-DLG-033-04c, R29-DLG-033-04d, R29-DLG-033-04e, R29-DLG-033-04f, R29-DLG-033-04g
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Narration naming the first alive party Pokémon (no speaker name in the text); printed while the weekday-sibling NPC (owID 10) scene runs
- **Source references:** script file 225 Function#19 (`TextPartyPokemon 0 0x8002` L257, `MessageFromArchive 0x800C 34` L258, reusing the archive loaded at L255); common message archive argument 0 = text archive 752 (Inferred), msg 34
- **Evidence status:** Verified (message text, call site, branch condition); Inferred (that argument 0 is text archive 752; that `{STRVAR_1, 0, 0, 0}` is filled by `TextPartyPokemon 0`)
##### OLD — Current content
- **OLD dialogue:** `{STRVAR_1, 0, 0, 0} put on the Shock Ribbon!`
- **OLD raw message data:** `{STRVAR_1, 0, 0, 0} put on the Shock Ribbon!`
- **OLD trigger:** Shown by R29-EVT-033-04 straight after R29-DLG-033-04g, before `GiveRibbon 0x8002 60`, `PlaySound SEQ_ME_ITEM`, `WaitSound`, `SetFlag 2748`.
- **OLD conditions and branch priority:** Same as R29-DLG-033-04g (Function#19). Reachability: Referenced and apparently reachable under the same condition.
- **OLD event sequence:** Step (4) of the parent sequence.
- **OLD state changes:** None of its own (ribbon 60 and flag 2748 follow).
- **OLD repeat/completion behavior:** Same as R29-DLG-033-04g.
- **OLD dependencies and shared-resource effects:** Shared common archive (archive 752). `TextPartyPokemon` is an undecoded opcode; that it fills the `{STRVAR_1, 0, 0, 0}` slot is Inferred from the wording and its argument 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** common message archive (text archive 752, Inferred) msg 34
- **Other affected callers or records:** Single call site (L258). A grep of `project/scripts/` finds no other script file reading index 34 of archive 0: 0232, 0243, 0246, 0938, 0941 and 0962 read other indices of it (see Verification performed), and the files using `GetCommonMessageArchive 1`, `2` or `3` read other archives. Editing it does not touch the rest of the game as far as scripts go; engine or overlay code reading archive 752 was not checked.
- **Unresolved questions:** The archive mapping is Inferred; the buffer fill by `TextPartyPokemon`.
- **Validation needed:** Text-box fit and the name token after any edit; in game when the ribbon is given.

#### R29-EVT-033-05 — West board "Rt. 29" (script 5, spawnable S0)
##### Record identity
- **Record ID:** R29-EVT-033-05
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-DLG-033-05a; R29-EVT-033-06; GLB-RTN-2000
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Board at global (581,397), event file 30 spawnable idx 0 (type Board, scriptNumber 5, dir 4 any direction)
- **Source references:** script file 225 Script#5 (L68-74); event file 30 spawnable 0; text archive 373 msg 16 (Inferred)
- **Evidence status:** Verified (commands); Inferred (that argument 16 selects text msg 16)
##### OLD — Current content
- **OLD dialogue:** The board text is msg 16 (R29-DLG-033-05a) if the first `SetIconBoard` argument is the message index (Inferred).
- **OLD raw message data:** See R29-DLG-033-05a.
- **OLD trigger:** Player reads the board from any direction.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Interaction. (2) `SetIconBoard 16 1 1 0x800C`; `ShowBoard 3`; `WaitBoard`; `CloseBoard 0x800C`; `CommonScript 2000` (GLB-RTN-2000); `End`. (3) None. (4) Board display and close are the commands themselves; no `LockAll`/`ReleaseAll` here (handled by the board commands and GLB-RTN-2000 as far as the data shows). (5) None. (6) Every interaction. (7) GLB-RTN-2000.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction.
- **OLD dependencies and shared-resource effects:** GLB-RTN-2000 (call evidence: L73); it lives in the common script file that hg-engine regenerates on every build.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 373 msg 16; script file 225 Script#5; event file 30 spawnable idx 0
- **Other affected callers or records:** R29-EVT-033-06 (the other board, argument 15). Msg 16 is read by no `Message` command in file 225 (checked by grep), which is what supports the mapping.
- **Unresolved questions:** `docs/scripting-reference.md` has no entry for `SetIconBoard`, so the argument roles (16, 1, 1) are not documented. The mapping argument → message index is supported by two facts: msgs 15 and 16 are otherwise unreferenced in this map's script, and the New Bark Town document's board `SetIconBoard 34 0 11` (header 60, script 15) matches a text-archive message with a town-name sign text at that index (542 msg 34, which that document found unreferenced); both are Inferred, not stated. Placement: this board stands at the west end of the route (x 581) and argument 16 selects the text "East to New Bark Town", while the east-end board (x 662) selects "West to Cherrygrove City"; under the Inferred mapping each board names the town at the far end of the route, which is consistent with the exits (Cherrygrove west, New Bark Town east). The third argument differs between the two boards (1 here, 2 on S1); its role is Unresolved.
- **Validation needed:** Read both boards in game and note which text each shows.

#### R29-EVT-033-06 — East board "Rt. 29" (script 6, spawnable S1)
##### Record identity
- **Record ID:** R29-EVT-033-06
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-DLG-033-06a; R29-EVT-033-05; GLB-RTN-2000
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Board at global (662,397), event file 30 spawnable idx 1 (type Board, scriptNumber 6, dir 4 any direction)
- **Source references:** script file 225 Script#6 (L76-82); event file 30 spawnable 1; text archive 373 msg 15 (Inferred)
- **Evidence status:** Verified (commands); Inferred (that argument 15 selects text msg 15)
##### OLD — Current content
- **OLD dialogue:** The board text is msg 15 (R29-DLG-033-06a) if the first `SetIconBoard` argument is the message index (Inferred).
- **OLD raw message data:** See R29-DLG-033-06a.
- **OLD trigger:** Player reads the board from any direction.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Interaction. (2) `SetIconBoard 15 1 2 0x800C`; `ShowBoard 3`; `WaitBoard`; `CloseBoard 0x800C`; `CommonScript 2000` (GLB-RTN-2000); `End`. (3)-(5) None. (6) Every interaction. (7) GLB-RTN-2000.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction.
- **OLD dependencies and shared-resource effects:** GLB-RTN-2000 (call evidence: L81); it lives in the common script file that hg-engine regenerates on every build.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 373 msg 15; script file 225 Script#6; event file 30 spawnable idx 1
- **Other affected callers or records:** R29-EVT-033-05.
- **Unresolved questions:** As R29-EVT-033-05 (argument roles, message mapping, the position-vs-text oddity).
- **Validation needed:** As R29-EVT-033-05.

#### R29-EVT-033-07 — NPC advising on weak Pokémon (script 7)
##### Record identity
- **Record ID:** R29-EVT-033-07
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-DLG-033-07a
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Talk-to NPC, event file 30 overworld idx 0 (owID 0, sprite 317, at 626,410, movement 4 walk up/down, yRange 1, orient 1, no hide flag)
- **Source references:** script file 225 Script#7 (L84-92); event file 30 overworld idx 0; text archive 373 msg 9
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** One message, msg 9 (R29-DLG-033-07a).
- **OLD raw message data:** See the dialogue record.
- **OLD trigger:** Player talks to overworld idx 0 (`scriptNumber` 7): `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Talk. (2) `Message 9` (L88), `WaitButton`, `CloseMessage`. (3)-(5) None. (6) `ReleaseAll`, `End`; repeatable. (7) None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable; same text each time.
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
- **Replacement target:** text archive 373 msg 9; script file 225 Script#7; event file 30 overworld idx 0
- **Other affected callers or records:** None found (msg 9 only at L88).
- **Unresolved questions:** Who the NPC is (sprite 317) is not stated by the data.
- **Validation needed:** Text-box fit after any edit.

#### R29-EVT-033-08 — NPC who saved to record progress (script 8)
##### Record identity
- **Record ID:** R29-EVT-033-08
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-DLG-033-08a
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Talk-to NPC, event file 30 overworld idx 1 (owID 1, sprite 332, at 622,392, movement 15 face down, orient 1, no hide flag)
- **Source references:** script file 225 Script#8 (L94-102); event file 30 overworld idx 1; text archive 373 msg 11
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** One message, msg 11 (R29-DLG-033-08a).
- **OLD raw message data:** See the dialogue record.
- **OLD trigger:** Player talks to overworld idx 1 (`scriptNumber` 8): `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Talk. (2) `Message 11` (L98), `WaitButton`, `CloseMessage`. (3)-(5) None. (6) `ReleaseAll`, `End`; repeatable. (7) None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable; same text each time.
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
- **Replacement target:** text archive 373 msg 11; script file 225 Script#8; event file 30 overworld idx 1
- **Other affected callers or records:** None found (msg 11 only at L98).
- **Unresolved questions:** Who the NPC is (sprite 332) is not stated by the data.
- **Validation needed:** Text-box fit after any edit.

#### R29-EVT-033-09 — NPC advising on ledges (script 9)
##### Record identity
- **Record ID:** R29-EVT-033-09
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-DLG-033-09a
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Talk-to NPC, event file 30 overworld idx 3 (owID 3, sprite 326, at 608,404, movement 5 walk left/right, xRange 1, orient 3, no hide flag)
- **Source references:** script file 225 Script#9 (L104-112); event file 30 overworld idx 3; text archive 373 msg 10
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** One message, msg 10 (R29-DLG-033-09a).
- **OLD raw message data:** See the dialogue record.
- **OLD trigger:** Player talks to overworld idx 3 (`scriptNumber` 9): `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Talk. (2) `Message 10` (L108), `WaitButton`, `CloseMessage`. (3)-(5) None. (6) `ReleaseAll`, `End`; repeatable. (7) None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable; same text each time.
- **OLD dependencies and shared-resource effects:** None. The object shares sprite 326 with ow2 and ow10 but is a separate event.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 373 msg 10; script file 225 Script#9; event file 30 overworld idx 3
- **Other affected callers or records:** None found (msg 10 only at L108).
- **Unresolved questions:** Who the NPC is (sprite 326) is not stated by the data.
- **Validation needed:** Text-box fit after any edit.

#### R29-EVT-033-O4 — Object 4 (sprite 86, scriptNumber 10000)
##### Record identity
- **Record ID:** R29-EVT-033-O4
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-EVT-033-O5
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Event file 30 overworld idx 4 (owID 4, sprite 86, at 629,401, movement 0, orient 0, hide flag 16, scriptNumber 10000)
- **Source references:** event file 30 overworld idx 4; flag FLAG_MAPTEMP_010 (16) in hg-engine `flags.s`
- **Evidence status:** Verified (event record fields); Unresolved (what the object is and what scriptNumber 10000 means)
##### OLD — Current content
- **OLD dialogue:** None found.
- **OLD raw message data:** None.
- **OLD trigger:** None identified. `scriptNumber` 10000 exceeds the 9 scripts of file 225 and is outside every range in `get_docs reference/events` (plain script index; 2999+trainer id and 4999+trainer id on Trainer objects; 7000-8000 ground item); the object's type is Normal.
- **OLD conditions and branch priority:** Visible while flag 16 is clear; flag 16 (map-temp flag) is touched by no script file. Reachability: Referenced with unresolved reachability.
- **OLD event sequence:** (1) Not identified. (2)-(6) None found in file 225. (7) None.
- **OLD state changes:** None found.
- **OLD repeat/completion behavior:** Unresolved.
- **OLD dependencies and shared-resource effects:** Shares sprite 86 and scriptNumber 10000 with R29-EVT-033-O5; hide flag 16 is a map-temp flag (per-map, Inferred).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 30 overworld idx 4
- **Other affected callers or records:** R29-EVT-033-O5 (same sprite and scriptNumber).
- **Unresolved questions:** The identity of sprite 86 (not decodable through dspre-mcp) and the engine meaning of scriptNumber 10000 (an engine-handled type such as an obstacle is a guess and is not asserted). Whether anything ever sets flag 16.
- **Validation needed:** Look at (629,401) in game; interact with it.

#### R29-EVT-033-O5 — Object 5 (sprite 86, scriptNumber 10000)
##### Record identity
- **Record ID:** R29-EVT-033-O5
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-EVT-033-O4
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Event file 30 overworld idx 5 (owID 5, sprite 86, at 619,405, movement 0, orient 0, hide flag 17, scriptNumber 10000)
- **Source references:** event file 30 overworld idx 5; flag FLAG_MAPTEMP_011 (17); script file 0938 lines 14 and 555 (header 88)
- **Evidence status:** Verified (event record fields and the 0938 flag writes); Unresolved (what the object is, what scriptNumber 10000 means); Inferred (flag 17 as per-map)
##### OLD — Current content
- **OLD dialogue:** None found.
- **OLD raw message data:** None.
- **OLD trigger:** None identified (as R29-EVT-033-O4).
- **OLD conditions and branch priority:** Visible while flag 17 is clear. Script file 0938 (header 88, Lake of Rage) sets flag 17 (L14, L555); map-temp flags are per-map (Inferred), so that write is not expected to affect Route 29. Reachability: Referenced with unresolved reachability.
- **OLD event sequence:** (1)-(7) Not identified.
- **OLD state changes:** None found.
- **OLD repeat/completion behavior:** Unresolved.
- **OLD dependencies and shared-resource effects:** Same sprite and scriptNumber as R29-EVT-033-O4; flag 17 is also set in script file 0938.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 30 overworld idx 5
- **Other affected callers or records:** R29-EVT-033-O4; script file 0938 (flag 17 writes).
- **Unresolved questions:** As R29-EVT-033-O4; also whether the 0938 write to flag 17 is the same flag instance as this object's hide flag.
- **Validation needed:** Look at (619,405) in game.

#### R29-EVT-033-O6 — Friend actor of the catch scene (sprite 102)
##### Record identity
- **Record ID:** R29-EVT-033-O6
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-EVT-033-02, R29-EVT-033-O7
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Event file 30 overworld idx 6 (owID 6, sprite 102, at 661,400, movement 0, orient 2, hide flag 420, scriptNumber 0 = no talk script)
- **Source references:** event file 30 overworld idx 6; script file 225 (`Overworld.6` in Script#2 and its functions); flag 420
- **Evidence status:** Verified (fields and uses); Inferred (the object is the friend named in msgs 0/1 etc.)
##### OLD — Current content
- **OLD dialogue:** None of its own; it is the speaker of R29-DLG-033-02a-k (the text names Lyra for a male player and Ethan for a female player; the object's sprite is the fixed value 102 whichever the player's gender, and its identity is not decodable).
- **OLD raw message data:** None.
- **OLD trigger:** None (cannot be talked to). It is moved by R29-EVT-033-02.
- **OLD conditions and branch priority:** Visible while flag 420 is clear. Flag 420 is cleared by script file 0843 (L153, L599) and set by 0149 (L11) and by script 2 at the end (L325, L496). Whether the flag is clear at game start is Unresolved (flags start clear on a new game, Inferred, but file 0149 sets it in bulk).
- **OLD event sequence:** (1) Spawned by the hide flag being clear. (2)-(5) Walks, emotes and speaks per R29-EVT-033-02; `RemoveOW Overworld.6` (L323, L494). (6) Gone after the scene. (7) None.
- **OLD state changes:** Removed from the map and flag 420 set by R29-EVT-033-02.
- **OLD repeat/completion behavior:** One scene.
- **OLD dependencies and shared-resource effects:** Flag 420 (writers in 0843, 0149, 225); partner object ow7.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 30 overworld idx 6
- **Other affected callers or records:** R29-EVT-033-02; script file 0843 and 0149 (flag 420).
- **Unresolved questions:** Sprite 102's identity; whether a fixed sprite is correct for both player genders.
- **Validation needed:** Observe the friend sprite with both player genders.

#### R29-EVT-033-O7 — Marill-type actor of the catch scene (sprite 1032)
##### Record identity
- **Record ID:** R29-EVT-033-O7
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-EVT-033-02, R29-EVT-033-O6
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Event file 30 overworld idx 7 (owID 7, sprite 1032, at 660,400, movement 0, orient 3, hide flag 421, scriptNumber 0)
- **Source references:** event file 30 overworld idx 7; script file 225 (`Overworld.7`, `PlayCry SPECIES_MARILL 0` at L20); flag 421; `docs/partner-sprite.md` line 44
- **Evidence status:** Verified (fields and uses); Inferred (sprite 1032 is the sprite-by-variable code reading var 0x4020; the object is the Marill the scene cries out)
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** None (moved by R29-EVT-033-02).
- **OLD conditions and branch priority:** Visible while flag 421 is clear (cleared by 0843 L154, L600; set by 0149 L12 and by script 2 L326, L497). The sprite value 1032 matches `1000 + (var & 0xFF)` with var 0x4020 (VAR_OBJ_0) per `docs/partner-sprite.md` line 44 (Inferred); script 1 here writes VAR_OBJ_1 (0x4021), not 0x4020, so which script sets the sprite shown is Unresolved (0x4020 is written by `GetCounterpartSprite` in other map scripts, e.g. 0842 L111 and 0843 L224 (header 61, the file that also sets var 0x408B), and by `SetVar` in 0111 and 0841; headers of 0111, 0841, 0842 not resolved).
- **OLD event sequence:** (1) Spawned by flag 421 clear. (2)-(5) Walks and jumps per R29-EVT-033-02; `Lock Overworld.7` / `Release Overworld.7`; `RemoveOW Overworld.7` (L324, L495). (6) Gone after the scene. (7) None.
- **OLD state changes:** Removed; flag 421 set by R29-EVT-033-02.
- **OLD repeat/completion behavior:** One scene.
- **OLD dependencies and shared-resource effects:** Flag 421; var 0x4020 (sprite source, Inferred); partner object ow6.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 30 overworld idx 7
- **Other affected callers or records:** R29-EVT-033-02; script files 0843 and 0149 (flag 421).
- **Unresolved questions:** What sprite var 0x4020 holds when the player reaches Route 29; whether VAR_OBJ_1 (0x4021, written by script 1) is used by anything on this map.
- **Validation needed:** Observe the actor in the scene.

#### R29-EVT-033-O8 — Ground item (Potion) (scriptNumber 7000)
##### Record identity
- **Record ID:** R29-EVT-033-O8
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** GLB-RTN-ITEMBALL
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Event file 30 overworld idx 8 (owID 8, sprite 87, at 654,386, type Normal as reported, movement 0, hide flag 1081, scriptNumber 7000, `itemScriptEntry` 0)
- **Source references:** event file 30 overworld idx 8; script file 141 Script#1 (`SetVar 0x8008 17`, `SetVar 0x8009 1`, `Jump Function#1`); `lookup_names` item 17 = Potion; flag FLAG_HIDE_ITEMBALL_R29_POTION (1081) in `flags.s`
- **Evidence status:** Verified (event fields, script 141 Script#1, item name); Inferred (the 7000+n → Script#(n+1) routing, per GLB-RTN-ITEMBALL)
##### OLD — Current content
- **OLD dialogue:** None local (the pickup messages belong to the global handler).
- **OLD raw message data:** None.
- **OLD trigger:** Player interacts with the ball; the global ground-item handler runs (GLB-RTN-ITEMBALL).
- **OLD conditions and branch priority:** Visible while flag 1081 is clear. Item: Potion (id 17) x1 per script 141 Script#1; the flag's name (`..._R29_POTION`) agrees. No script sets or clears flag 1081; the handler and engine manage it (Inferred). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Interaction. (2)-(7) Handled by GLB-RTN-ITEMBALL.
- **OLD state changes:** Potion x1 to the Bag; the object is removed (via the global handler); flag 1081 set by the engine (Inferred).
- **OLD repeat/completion behavior:** Once per ball.
- **OLD dependencies and shared-resource effects:** Script file 141 Script#1 is the per-item data stub for entry 0 (any other map using `scriptNumber` 7000 shares it); GLB-RTN-ITEMBALL.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 30 overworld idx 8 (item/quantity via script file 141 Script#1, shared by every ball with `scriptNumber` 7000)
- **Other affected callers or records:** Every other ground-item ball with `scriptNumber` 7000 on any map; GLB-RTN-ITEMBALL.
- **Unresolved questions:** The routing 7000+n → Script#(n+1) is taken from the global record (Inferred); the tool deliberately does not resolve `itemScriptEntry`.
- **Validation needed:** Pick the ball up in game and check the item and that it does not reappear.

#### R29-EVT-033-O9 — Object 9 (sprite 262, scriptNumber 2800, sight range 5)
##### Record identity
- **Record ID:** R29-EVT-033-O9
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** None
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Event file 30 overworld idx 9 (owID 9, sprite 262, at 596,392, type Normal, movement 0, orient 0, sightRange 5, hide flag 0 = always spawned, scriptNumber 2800)
- **Source references:** event file 30 overworld idx 9; `get_docs reference/events` (scriptNumber table); `docs/violet-route32-flicker.md` line 538
- **Evidence status:** Verified (event record fields); Unresolved (what the object is and what scriptNumber 2800 runs)
##### OLD — Current content
- **OLD dialogue:** None found.
- **OLD raw message data:** None.
- **OLD trigger:** Unresolved. `scriptNumber` 2800 is below the trainer range (2999 + id) and exceeds the 9 scripts of file 225; the reference documents no meaning for 2800 (plain script index, 2999+/4999+ trainer ranges and 7000-8000 ground items only). The object has a sight range of 5 although its type is Normal.
- **OLD conditions and branch priority:** Always spawned (flag 0). Reachability: Referenced with unresolved reachability.
- **OLD event sequence:** (1)-(7) Not identified in this map's data. The project's Violet City investigation records another object with the same sprite 262 and `scriptNumber 2800` (Violet City, overworld 8, `sightRange 29`, flag 0) as "noted, not yet explained" (`docs/violet-route32-flicker.md` line 538).
- **OLD state changes:** None found.
- **OLD repeat/completion behavior:** Unresolved.
- **OLD dependencies and shared-resource effects:** Possibly shared with the same-sprite/script object on the Violet City map (Inferred from the matching fields only).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 30 overworld idx 9
- **Other affected callers or records:** The Violet City object with the same sprite and scriptNumber (outside Route 29, not documented here).
- **Unresolved questions:** Entire behaviour. Sprite 262's identity is not decodable. What the engine runs for scriptNumber 2800 on a Normal object with sight range 5, and whether the object triggers on sight.
- **Validation needed:** Walk to (596,392) and approach within 5 tiles in game; note whether anything happens and what the object looks like.

#### R29-EVT-033-S2 — Hidden item (Nugget) (scriptNumber 8001)
##### Record identity
- **Record ID:** R29-EVT-033-S2
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** GLB-RTN-HIDDENITEM
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Event file 30 spawnable idx 2 (type HiddenItem, scriptNumber 8001, dir 4 any direction, at 572,390; matrix cell (17,12), tile (28,6))
- **Source references:** event file 30 spawnable idx 2; `get_rom_table {kind: hiddenItems, index: 1}` = Nugget (item 92), amount 1, scriptId 1; matrix 0 headers layer cell (17,12) = header 67
- **Evidence status:** Verified (event fields and table entry 1); Inferred (that scriptNumber 8001 selects table index 1: the entry's scriptId is 1, consistent with 8000 + k)
##### OLD — Current content
- **OLD dialogue:** None local (the global hidden-item handler prints the messages).
- **OLD raw message data:** None.
- **OLD trigger:** Player interacts with the spot; GLB-RTN-HIDDENITEM runs.
- **OLD conditions and branch priority:** None local; found once (that the table's scriptId acts as the found-flag is Inferred; the mechanism belongs to GLB-RTN-HIDDENITEM and is not documented here). Reachability: Referenced and apparently reachable. The tile lies in a matrix cell the headers layer assigns to header 67 (Cherrygrove City), not 33 (Inferred boundary quirk; the event file of header 33 still holds the record).
- **OLD event sequence:** (1) Interaction. (2)-(7) GLB-RTN-HIDDENITEM.
- **OLD state changes:** Nugget x1 added; found-flag set (table scriptId 1; Inferred, see conditions).
- **OLD repeat/completion behavior:** One-time.
- **OLD dependencies and shared-resource effects:** The arm9 hidden-item table (231 entries) is shared with the rest of the game; GLB-RTN-HIDDENITEM.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** `set_rom_table {kind: hiddenItems, index: 1}` (item, amount, scriptId); event file 30 spawnable idx 2
- **Other affected callers or records:** GLB-RTN-HIDDENITEM; nothing else on Route 29.
- **Unresolved questions:** The 8000+k → table index k mapping (Inferred); whether the spot works at that tile given the header-layer quirk.
- **Validation needed:** Use Itemfinder / walk to (572,390) in game.

#### R29-EVT-033-W0 — Warp to the gate (626,389)
##### Record identity
- **Record ID:** R29-EVT-033-W0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-EVT-033-W1, R29-EVT-134-W0
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Warp idx 0 at global (626,389), matrix cell (19,12) tile (18,5)
- **Source references:** `get_events {mapHeader: 33}` warps idx 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Player steps on the warp tile (626,389).
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Step. (2)-(7) Warp to header 134 (R29R0101), anchor 0, height 0.
- **OLD state changes:** Map change.
- **OLD repeat/completion behavior:** Always available.
- **OLD dependencies and shared-resource effects:** Destination header 134 warp 0 (5,12) leads back here. Both warps 0 and 1 land at anchor 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 30 warp idx 0
- **Other affected callers or records:** R29-EVT-134-W0 (return); R29-EVT-033-W1 (adjacent warp, same destination).
- **Unresolved questions:** `anchor` semantics (whether anchor 0 means the destination's warp 0 or an index into the destination list) is not stated by the data.
- **Validation needed:** Walk through the gate both ways.

#### R29-EVT-033-W1 — Warp to the gate (627,389)
##### Record identity
- **Record ID:** R29-EVT-033-W1
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-EVT-033-W0, R29-EVT-134-W0
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Warp idx 1 at global (627,389), matrix cell (19,12) tile (19,5)
- **Source references:** `get_events {mapHeader: 33}` warps idx 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Player steps on the warp tile (627,389).
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Step. (2)-(7) Warp to header 134 (R29R0101), anchor 0, height 0.
- **OLD state changes:** Map change.
- **OLD repeat/completion behavior:** Always available.
- **OLD dependencies and shared-resource effects:** As R29-EVT-033-W0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 30 warp idx 1
- **Other affected callers or records:** R29-EVT-134-W0; R29-EVT-033-W0.
- **Unresolved questions:** As R29-EVT-033-W0 (anchor semantics).
- **Validation needed:** Walk through the gate both ways.

#### R29-DLG-033-02a — "There you are!" (male-player text)
##### Record identity
- **Record ID:** R29-DLG-033-02a
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-02
- **Related record IDs:** R29-DLG-033-02b
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Friend actor (owID 6) — the text names Lyra
- **Source references:** script file 225 Script#2 (`GenderMessage 17 18`, L27); text archive 373 msg 17
- **Evidence status:** Verified (message and call); Inferred (first id = male player)
##### OLD — Current content
- **OLD dialogue:** `Lyra: There you are!` [scroll]
- **OLD raw message data:** `Lyra: There you are!\r`
- **OLD trigger:** Shown by R29-EVT-033-02 right after the actors' arrival movements, before they walk to the player.
- **OLD conditions and branch priority:** The male-player alternative of a gender pair (first id). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent sequence, after `CommonScript 2029`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once (the scene happens once).
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
- **Replacement target:** text archive 373 msg 17
- **Other affected callers or records:** None found (msg 17 only at L27).
- **Unresolved questions:** Gender order of the pair is from project docs, not run-tested.
- **Validation needed:** Text-box fit after any edit.

#### R29-DLG-033-02b — "There you are!" (female-player text)
##### Record identity
- **Record ID:** R29-DLG-033-02b
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-02
- **Related record IDs:** R29-DLG-033-02a
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Friend actor (owID 6) — the text names Ethan
- **Source references:** script file 225 Script#2 (`GenderMessage 17 18`, L27); text archive 373 msg 18
- **Evidence status:** Verified (message and call); Inferred (second id = female player)
##### OLD — Current content
- **OLD dialogue:** `Ethan: There you are!` [scroll]
- **OLD raw message data:** `Ethan: There you are!\r`
- **OLD trigger:** As R29-DLG-033-02a, for the other gender.
- **OLD conditions and branch priority:** The female-player alternative. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent sequence.
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
- **Replacement target:** text archive 373 msg 18
- **Other affected callers or records:** None found (msg 18 only at L27).
- **Unresolved questions:** As R29-DLG-033-02a.
- **Validation needed:** Text-box fit after any edit.

#### R29-DLG-033-02c — Catch lesson opening (male-player text)
##### Record identity
- **Record ID:** R29-DLG-033-02c
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-02
- **Related record IDs:** R29-DLG-033-02d
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Friend actor (owID 6) — Lyra
- **Source references:** script file 225 Function#3 (`TextPlayerName 0`, `GenderMessage 0 1`, L133) and Function#36 (L418); text archive 373 msg 0
- **Evidence status:** Verified (message and calls); Inferred (first id = male; token = player name)
##### OLD — Current content
- **OLD dialogue:** `Lyra: {STRVAR_1, 3, 0, 0}! / You can catch wild Pokémon` [new box] `with Poké Balls.` [scroll] `Follow me!` [scroll]
- **OLD raw message data:** `Lyra: {STRVAR_1, 3, 0, 0}!\nYou can catch wild Pokémon\fwith Poké Balls.\rFollow me!\r`
- **OLD trigger:** Shown by R29-EVT-033-02 after the actors' approach walk, at Function#3 (or its copy in Function#36 for the Y 402 row).
- **OLD conditions and branch priority:** Male-player alternative. Reachable on every row (Function#3 for rows 396-401, Function#36 for row 402). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (3) of the parent sequence, preceded by `TextPlayerName 0`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Used at two lines (L133, L418).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 373 msg 0
- **Other affected callers or records:** Both call sites (L133 and L418) read msg 0, so one edit changes both.
- **Unresolved questions:** None beyond the gender-order and token inference.
- **Validation needed:** Text-box fit after any edit.

#### R29-DLG-033-02d — Catch lesson opening (female-player text)
##### Record identity
- **Record ID:** R29-DLG-033-02d
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-02
- **Related record IDs:** R29-DLG-033-02c
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Friend actor (owID 6) — Ethan
- **Source references:** script file 225 Function#3 (L133) and Function#36 (L418); text archive 373 msg 1
- **Evidence status:** Verified (message and calls); Inferred (second id = female; token = player name)
##### OLD — Current content
- **OLD dialogue:** `Ethan: {STRVAR_1, 3, 0, 0}! / You can catch wild Pokémon` [new box] `with Poké Balls.` [scroll] `Follow me!` [scroll]
- **OLD raw message data:** `Ethan: {STRVAR_1, 3, 0, 0}!\nYou can catch wild Pokémon\fwith Poké Balls.\rFollow me!\r`
- **OLD trigger:** As R29-DLG-033-02c, for the other gender.
- **OLD conditions and branch priority:** Female-player alternative. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (3) of the parent sequence.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Used at two lines (L133, L418).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 373 msg 1
- **Other affected callers or records:** Both call sites read msg 1.
- **Unresolved questions:** As R29-DLG-033-02c.
- **Validation needed:** Text-box fit after any edit.

#### R29-DLG-033-02e — "Was I too fast?" retry line
##### Record identity
- **Record ID:** R29-DLG-033-02e
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-02
- **Related record IDs:** None
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Friend actor (owID 6); a plain `Message 2` with no speaker name in the text
- **Source references:** script file 225 Function#31 (`Message 2`, L372), called from Function#25 (L304); text archive 373 msg 2
- **Evidence status:** Verified (message, call and the branch that guards it); Inferred (0x4002 == 0 is male)
##### OLD — Current content
- **OLD dialogue:** `...Just like that!` [scroll] `... / Huh? Was I too fast?` [scroll] `I’ll try again. Come this way!` [scroll]
- **OLD raw message data:** `...Just like that!\r...\nHuh? Was I too fast?\rI’ll try again. Come this way!\r`
- **OLD trigger:** Shown by R29-EVT-033-02 just before the catch demonstration, only when `CompareVarValue 0x4002 0` / `CallIf EQUAL Function#31` holds (L303-304).
- **OLD conditions and branch priority:** Shown only on the male-player path through Function#25. On the female path the test at Function#25 is false (0x4002 != 0); female rows Y 396-401 reach Function#25 through Functions #16, #23, #29, #34, #38, #41, and only row Y 402 enters Function#43, whose own copy of the call (L474-475) can never be true because Function#43 is reached only when 0x4002 != 0 (Verified from the branch conditions in 0225.script). Reachability: Referenced with reachability limited to the male-player path.
- **OLD event sequence:** Step (4) of the parent sequence, inside Function#31.
- **OLD state changes:** None of its own.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Read at one line (L372). Function#31 is called from two places (L304 live, L475 dead).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 373 msg 2; script file 225 Function#31
- **Other affected callers or records:** Function#25 and Function#43 both call Function#31.
- **Unresolved questions:** Whether the male-only retry is deliberate (the text is unnamed, not Lyra-prefixed) is not stated by the data.
- **Validation needed:** In-game with a male and a female player; confirm the retry occurs only for the male player.

#### R29-DLG-033-02f — "See? Just like that!" (male-player text)
##### Record identity
- **Record ID:** R29-DLG-033-02f
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-02
- **Related record IDs:** R29-DLG-033-02g; GLB-RTN-2033
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Friend actor (owID 6)
- **Source references:** script file 225 Function#25 (`GenderMessage 3 4`, L310) and Function#43 (L481); text archive 373 msg 3
- **Evidence status:** Verified (message and calls); Inferred (first id = male)
##### OLD — Current content
- **OLD dialogue:** `See? Just like that!` [scroll] `It’s better to lower your / target’s HP more than I did,` [new box] `or make it sleep or something.` [scroll] `You can try all kinds of things / to see what works.` [scroll] `I’ll give you these. Good luck!` [scroll]
- **OLD raw message data:** `See? Just like that!\rIt’s better to lower your\ntarget’s HP more than I did,\for make it sleep or something.\rYou can try all kinds of things\nto see what works.\rI’ll give you these. Good luck!\r`
- **OLD trigger:** Shown by R29-EVT-033-02 after `CatchTutorial`, immediately before the Poké Ball gift (`CommonScript 2033`, GLB-RTN-2033).
- **OLD conditions and branch priority:** Male-player alternative; the male path reaches it through Function#25 (L310). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (4) of the parent sequence.
- **OLD state changes:** None of its own (the gift follows).
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Read at two lines (L310, L481). Msg 3 and msg 4 have identical text in this ROM (compared with `get_text`). Followed by the GLB-RTN-2033 gift (Poké Ball x5), a common routine that hg-engine regenerates on every build.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 373 msg 3
- **Other affected callers or records:** Both call sites read msg 3; R29-DLG-033-02g has the same text.
- **Unresolved questions:** None beyond the gender-order inference.
- **Validation needed:** Text-box fit after any edit.

#### R29-DLG-033-02g — "See? Just like that!" (female-player text)
##### Record identity
- **Record ID:** R29-DLG-033-02g
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-02
- **Related record IDs:** R29-DLG-033-02f; GLB-RTN-2033
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Friend actor (owID 6)
- **Source references:** script file 225 Function#25 (L310) and Function#43 (L481); text archive 373 msg 4
- **Evidence status:** Verified (message and calls); Inferred (second id = female)
##### OLD — Current content
- **OLD dialogue:** `See? Just like that!` [scroll] `It’s better to lower your / target’s HP more than I did,` [new box] `or make it sleep or something.` [scroll] `You can try all kinds of things / to see what works.` [scroll] `I’ll give you these. Good luck!` [scroll]
- **OLD raw message data:** `See? Just like that!\rIt’s better to lower your\ntarget’s HP more than I did,\for make it sleep or something.\rYou can try all kinds of things\nto see what works.\rI’ll give you these. Good luck!\r`
- **OLD trigger:** As R29-DLG-033-02f, for the other gender.
- **OLD conditions and branch priority:** Female-player alternative. The female path reaches it through Function#43 (L481) for row 402 and through Function#25 (L310) for the other rows. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (4) of the parent sequence.
- **OLD state changes:** None of its own.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Read at two lines (L310, L481); identical text to msg 3. Followed by the GLB-RTN-2033 gift (Poké Ball x5), a common routine that hg-engine regenerates on every build.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 373 msg 4
- **Other affected callers or records:** Both call sites read msg 4; R29-DLG-033-02f has the same text.
- **Unresolved questions:** As R29-DLG-033-02f.
- **Validation needed:** Text-box fit after any edit.

#### R29-DLG-033-02h — "Oh, and one more thing! This is Mr. Paint." (male-player text)
##### Record identity
- **Record ID:** R29-DLG-033-02h
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-02
- **Related record IDs:** R29-DLG-033-02i; GLB-RTN-2033
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Friend actor (owID 6) — Lyra
- **Source references:** script file 225 Function#25 (`GenderMessage 5 6`, L314) and Function#43 (L485); text archive 373 msg 5
- **Evidence status:** Verified (message and calls); Inferred (first id = male)
##### OLD — Current content
- **OLD dialogue:** `Lyra: Oh, and one more thing! / This is Mr. Paint.` [scroll] `He was entrusted to me to help / you on your journey. Take care / of him!` [scroll]
- **OLD raw message data:** `Lyra: Oh, and one more thing!\nThis is Mr. Paint.\rHe was entrusted to me to help\nyou on your journey. Take care\nof him!\r`
- **OLD trigger:** Shown by R29-EVT-033-02 after the Poké Ball gift, before the Mr. Paint gift (item 2685 through `CommonScript 2033`, GLB-RTN-2033).
- **OLD conditions and branch priority:** Male-player alternative. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (4) of the parent sequence.
- **OLD state changes:** None of its own (the item gift follows).
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Text added by the hack: journal id 21 (`set_text` archive 373, msgs 5 and 6, 2026-09-26T07:10:12Z); the script lines were added by journal id 20. Read at two lines (L314, L485). Followed by the GLB-RTN-2033 gift of item 2685 (no name in this ROM); both the routine and the item depend on the hg-engine build.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 373 msg 5
- **Other affected callers or records:** Both call sites read msg 5; Route 30 files 0227/0228 hand item 2685 again without this text (their own flow).
- **Unresolved questions:** None beyond the gender-order inference. Hack-added content: the wording belongs to the client's feature (Mr. Paint).
- **Validation needed:** Text-box fit after any edit; the gift sequence in game.

#### R29-DLG-033-02i — "Oh, and one more thing! This is Mr. Paint." (female-player text)
##### Record identity
- **Record ID:** R29-DLG-033-02i
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-02
- **Related record IDs:** R29-DLG-033-02h; GLB-RTN-2033
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Friend actor (owID 6) — Ethan
- **Source references:** script file 225 Function#25 (L314) and Function#43 (L485); text archive 373 msg 6
- **Evidence status:** Verified (message and calls); Inferred (second id = female)
##### OLD — Current content
- **OLD dialogue:** `Ethan: Oh, and one more thing! / This is Mr. Paint.` [scroll] `He was entrusted to me to help / you on your journey. Take care / of him!` [scroll]
- **OLD raw message data:** `Ethan: Oh, and one more thing!\nThis is Mr. Paint.\rHe was entrusted to me to help\nyou on your journey. Take care\nof him!\r`
- **OLD trigger:** As R29-DLG-033-02h, for the other gender.
- **OLD conditions and branch priority:** Female-player alternative. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (4) of the parent sequence.
- **OLD state changes:** None of its own.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Text added by journal id 21; read at two lines (L314, L485). Followed by the GLB-RTN-2033 gift of item 2685 (no name in this ROM); both the routine and the item depend on the hg-engine build.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 373 msg 6
- **Other affected callers or records:** Both call sites read msg 6.
- **Unresolved questions:** As R29-DLG-033-02h.
- **Validation needed:** Text-box fit after any edit.

#### R29-DLG-033-02j — "See you!" (male-player text)
##### Record identity
- **Record ID:** R29-DLG-033-02j
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-02
- **Related record IDs:** R29-DLG-033-02k
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Friend actor (owID 6) — Lyra
- **Source references:** script file 225 Function#25 (`GenderMessage 7 8`, L318) and Function#43 (L489); text archive 373 msg 7
- **Evidence status:** Verified (message and calls); Inferred (first id = male)
##### OLD — Current content
- **OLD dialogue:** `Lyra: See you!` [scroll]
- **OLD raw message data:** `Lyra: See you!\r`
- **OLD trigger:** Shown by R29-EVT-033-02 after the Mr. Paint gift, before the actors walk away and are removed.
- **OLD conditions and branch priority:** Male-player alternative. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (4) of the parent sequence.
- **OLD state changes:** None of its own.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Read at two lines (L318, L489).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 373 msg 7
- **Other affected callers or records:** Both call sites read msg 7.
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit.

#### R29-DLG-033-02k — "See ya!" (female-player text)
##### Record identity
- **Record ID:** R29-DLG-033-02k
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-02
- **Related record IDs:** R29-DLG-033-02j
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Friend actor (owID 6) — Ethan
- **Source references:** script file 225 Function#25 (L318) and Function#43 (L489); text archive 373 msg 8
- **Evidence status:** Verified (message and calls); Inferred (second id = female)
##### OLD — Current content
- **OLD dialogue:** `Ethan: See ya!` [scroll]
- **OLD raw message data:** `Ethan: See ya!\r`
- **OLD trigger:** As R29-DLG-033-02j, for the other gender.
- **OLD conditions and branch priority:** Female-player alternative. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (4) of the parent sequence.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Read at two lines (L318, L489).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 373 msg 8
- **Other affected callers or records:** Both call sites read msg 8.
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit.

#### R29-DLG-033-03a — Waiting for daytime Pokémon
##### Record identity
- **Record ID:** R29-DLG-033-03a
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-03
- **Related record IDs:** R29-DLG-033-03b, R29-DLG-033-03c
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** NPC at overworld idx 2 (owID 2)
- **Source references:** script file 225 Script#3 (`Message 12`, L44); text archive 373 msg 12
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `I’m waiting for Pokémon that / appear only in the daytime.`
- **OLD raw message data:** `I’m waiting for Pokémon that\nappear only in the daytime.`
- **OLD trigger:** Shown by R29-EVT-033-03 when `GetTimePeriod` returns 0.
- **OLD conditions and branch priority:** First test of the chain (value 0). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2)-(4) of the parent sequence.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction in that period.
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
- **Replacement target:** text archive 373 msg 12
- **Other affected callers or records:** None found (msg 12 only at L44).
- **Unresolved questions:** Which clock hours period value 0 covers.
- **Validation needed:** Text-box fit after any edit.

#### R29-DLG-033-03b — Waiting for night Pokémon
##### Record identity
- **Record ID:** R29-DLG-033-03b
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-03
- **Related record IDs:** R29-DLG-033-03a, R29-DLG-033-03c
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** NPC at overworld idx 2 (owID 2)
- **Source references:** script file 225 Function#4 (`Message 13`, L152) and Function#18 (`Message 13`, L251); text archive 373 msg 13
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `I’m waiting for Pokémon that / appear only at night.`
- **OLD raw message data:** `I’m waiting for Pokémon that\nappear only at night.`
- **OLD trigger:** Shown by R29-EVT-033-03 when `GetTimePeriod` returns 1 (Function#4) or 2 (Function#18).
- **OLD conditions and branch priority:** Second and third tests of the chain. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2)-(4) of the parent sequence.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction in those periods.
- **OLD dependencies and shared-resource effects:** Read at two lines (L152, L251).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 373 msg 13
- **Other affected callers or records:** Both call sites read msg 13.
- **Unresolved questions:** Why two period values share this text.
- **Validation needed:** Text-box fit after any edit.

#### R29-DLG-033-03c — Waiting for morning Pokémon
##### Record identity
- **Record ID:** R29-DLG-033-03c
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-03
- **Related record IDs:** R29-DLG-033-03a, R29-DLG-033-03b
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** NPC at overworld idx 2 (owID 2)
- **Source references:** script file 225 Function#26 (`Message 14`, L333); text archive 373 msg 14
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `I’m waiting for Pokémon that / appear only in the morning.`
- **OLD raw message data:** `I’m waiting for Pokémon that\nappear only in the morning.`
- **OLD trigger:** Shown by R29-EVT-033-03 when `GetTimePeriod` returns anything other than 0, 1 or 2.
- **OLD conditions and branch priority:** Last branch of the chain. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2)-(4) of the parent sequence.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction in that period.
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
- **Replacement target:** text archive 373 msg 14
- **Other affected callers or records:** None found (msg 14 only at L333).
- **Unresolved questions:** The numeric value(s) reaching this branch.
- **Validation needed:** Text-box fit after any edit.

#### R29-DLG-033-05a — West board text "Rt. 29 / East to New Bark Town" (mapping Inferred)
##### Record identity
- **Record ID:** R29-DLG-033-05a
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-05
- **Related record IDs:** R29-DLG-033-06a
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Board at (581,397)
- **Source references:** text archive 373 msg 16; script file 225 Script#5 (`SetIconBoard 16 1 1 0x800C`, L69) — the argument 16 equals the message index (Inferred)
- **Evidence status:** Inferred (that this board shows msg 16; no source states the argument's role)
##### OLD — Current content
- **OLD dialogue:** `Rt. 29 / East to New Bark Town`
- **OLD raw message data:** `Rt. 29\nEast to New Bark Town`
- **OLD trigger:** Shown by R29-EVT-033-05 when the board is read.
- **OLD conditions and branch priority:** None. Reachability: Referenced with unresolved reachability (no `Message`-type command names msg 16; the link is the `SetIconBoard` argument).
- **OLD event sequence:** Step (2) of the parent sequence.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction.
- **OLD dependencies and shared-resource effects:** Board display by GLB-RTN-2000.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 373 msg 16
- **Other affected callers or records:** None found by script grep (msg 16 is cited by no `Message` command).
- **Unresolved questions:** Whether the board at the west end really shows "East to New Bark Town"; the possibility that the two boards' messages are the other way round is not excluded (see R29-EVT-033-05).
- **Validation needed:** Read the board at (581,397) in game.

#### R29-DLG-033-06a — East board text "Rt. 29 / West to Cherrygrove City" (mapping Inferred)
##### Record identity
- **Record ID:** R29-DLG-033-06a
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-06
- **Related record IDs:** R29-DLG-033-05a
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** Board at (662,397)
- **Source references:** text archive 373 msg 15; script file 225 Script#6 (`SetIconBoard 15 1 2 0x800C`, L77) — the argument 15 equals the message index (Inferred)
- **Evidence status:** Inferred (that this board shows msg 15)
##### OLD — Current content
- **OLD dialogue:** `Rt. 29 / West to Cherrygrove City`
- **OLD raw message data:** `Rt. 29\nWest to Cherrygrove City`
- **OLD trigger:** Shown by R29-EVT-033-06 when the board is read.
- **OLD conditions and branch priority:** None. Reachability: Referenced with unresolved reachability.
- **OLD event sequence:** Step (2) of the parent sequence.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction.
- **OLD dependencies and shared-resource effects:** Board display by GLB-RTN-2000.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 373 msg 15
- **Other affected callers or records:** None found by script grep.
- **Unresolved questions:** As R29-DLG-033-05a.
- **Validation needed:** Read the board at (662,397) in game.

#### R29-DLG-033-07a — Advice about weak Pokémon
##### Record identity
- **Record ID:** R29-DLG-033-07a
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-07
- **Related record IDs:** None
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** NPC at overworld idx 0 (owID 0)
- **Source references:** script file 225 Script#7 (`Message 9`, L88); text archive 373 msg 9
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Hey, how are your Pokémon?` [scroll] `If they’re weak and not ready for / battle, keep out of the tall grass.`
- **OLD raw message data:** `Hey, how are your Pokémon?\rIf they’re weak and not ready for\nbattle, keep out of the tall grass.`
- **OLD trigger:** Shown by R29-EVT-033-07 on every interaction.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent sequence.
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
- **Replacement target:** text archive 373 msg 9
- **Other affected callers or records:** None found (L88 only).
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit.

#### R29-DLG-033-08a — "Saved to record my progress"
##### Record identity
- **Record ID:** R29-DLG-033-08a
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-08
- **Related record IDs:** None
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** NPC at overworld idx 1 (owID 1)
- **Source references:** script file 225 Script#8 (`Message 11`, L98); text archive 373 msg 11
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `I wanted to take a break, so I / saved to record my progress.`
- **OLD raw message data:** `I wanted to take a break, so I\nsaved to record my progress.`
- **OLD trigger:** Shown by R29-EVT-033-08 on every interaction.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent sequence.
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
- **Replacement target:** text archive 373 msg 11
- **Other affected callers or records:** None found (L98 only).
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit.

#### R29-DLG-033-09a — Advice about the ledges
##### Record identity
- **Record ID:** R29-DLG-033-09a
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-033-09
- **Related record IDs:** None
- **Map or system:** Route 29 exterior (header 33, R29)
- **Speaker, object, or trigger:** NPC at overworld idx 3 (owID 3)
- **Source references:** script file 225 Script#9 (`Message 10`, L108); text archive 373 msg 10
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Do you see those ledges? / It’s scary to jump off them.` [scroll] `But you can go to New Bark Town / without walking through tall grass.`
- **OLD raw message data:** `Do you see those ledges?\nIt’s scary to jump off them.\rBut you can go to New Bark Town\nwithout walking through tall grass.`
- **OLD trigger:** Shown by R29-EVT-033-09 on every interaction.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent sequence.
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
- **Replacement target:** text archive 373 msg 10
- **Other affected callers or records:** None found (L108 only).
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit.

## Map 134 — Route 29 / Route 46 gate (R29R0101)

### Map 134 reading notes
- **Sources:** `get_events {mapHeader: 134}` (event file 130), `get_script {file: 471}` (level script, empty), `project/scripts/0226.script` (3 scripts, 0 functions, 0 actions; 33 lines = 26 live + 7 header), `get_text {archive: 374}` (2 messages), `get_world_data mapHeader 134` and `matrix 69` (1x1, map file 242, no headers layer). Header facts: internal name R29R0101, location Route 29 (id 177), music 1028 day/night, weather 0, flags 115, `areaDataId 63`, `locationType 4`, `followMode 1`, wild 255 (no encounters).
- **Dialogue rendering:** see Conventions, Text rendering.
- **Scope:** the header is the gatehouse between Route 29 (via header 33's warps 0 and 1) and Route 46 (header 48, outside this document). No flags, variables or global calls are used by script file 226.
- **Level script 471 is empty** (0 entries, 4 bytes): no record; listed under Apparently unused.

### Map 134 event inventory
Coordinates are global tiles; matrix cell (0,0) for every entry. Every entry maps to a record in this section.

| Section | Idx | Type | owID / sprite (overlayTableEntry) | Coordinates | Flag (hides when set) | scriptNumber | Covered by |
|---|---|---|---|---|---|---|---|
| overworld | 0 | Normal, movement 17 face right, orient 3 | owID 0 / 394 | 1,8 | 0 | 2 | R29-EVT-134-02 |
| overworld | 1 | Normal, movement 3 wander (x 1, y 1), orient 0 | owID 1 / 146 | 7,6 | 0 | 3 | R29-EVT-134-03 |
| warp | 0 | to header 33, anchor 0, height 0 | - | 5,12 | - | - | R29-EVT-134-W0 |
| warp | 1 | to header 48, anchor 0, height 0 | - | 5,2 | - | - | R29-EVT-134-W1 |
| script 1 | - | `End` only; no event entry names it | - | - | - | 1 | R29-EVT-134-01 |
| level script 471 | - | empty (0 entries) | - | - | - | - | none (Apparently unused) |

### Map 134 flags and variables (readers and writers)
None: script file 226 contains no flag, variable, item or global-call command (checked by reading all 33 lines). Overworld hide flags are 0 for both objects.

### Map 134 event records

#### R29-EVT-134-01 — Script 1 (`End` only, unreferenced)
##### Record identity
- **Record ID:** R29-EVT-134-01
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** None
- **Map or system:** Route 29 / Route 46 gate (header 134, R29R0101)
- **Speaker, object, or trigger:** None; no overworld, spawnable or trigger of event file 130 names script 1, and level script 471 is empty
- **Source references:** script file 226 Script#1 (0226.script lines 9-10)
- **Evidence status:** Verified (content); Inferred (that nothing calls it: map-local callers were checked, other maps' level scripts and event files were not)
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** None found.
- **OLD conditions and branch priority:** None. Reachability: Apparently unused.
- **OLD event sequence:** (1) Not triggered. (2) `End`. (3)-(7) None.
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
- **Replacement target:** script file 226 Script#1
- **Other affected callers or records:** None found. Script indexes shift if scripts are added or removed (the event entries refer to scripts 2 and 3 by index).
- **Unresolved questions:** None.
- **Validation needed:** None.

#### R29-EVT-134-02 — Gate NPC advising on ledges (script 2)
##### Record identity
- **Record ID:** R29-EVT-134-02
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-DLG-134-02a
- **Map or system:** Route 29 / Route 46 gate (header 134, R29R0101)
- **Speaker, object, or trigger:** Talk-to NPC, event file 130 overworld idx 0 (owID 0, sprite 394, at 1,8, movement 17 face right, orient 3, no hide flag)
- **Source references:** script file 226 Script#2 (L12-20); event file 130 overworld idx 0; text archive 374 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** One message, msg 0 (R29-DLG-134-02a).
- **OLD raw message data:** See the dialogue record.
- **OLD trigger:** Player talks to overworld idx 0 (`scriptNumber` 2): `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Talk. (2) `Message 0` (L16), `WaitButton`, `CloseMessage`. (3)-(5) None. (6) `ReleaseAll`, `End`; repeatable. (7) None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable; same text each time.
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
- **Replacement target:** text archive 374 msg 0; script file 226 Script#2; event file 130 overworld idx 0
- **Other affected callers or records:** None found (msg 0 only at L16).
- **Unresolved questions:** Who the NPC is (sprite 394) is not stated by the data.
- **Validation needed:** Text-box fit after any edit.

#### R29-EVT-134-03 — Gate NPC advising on catching them all (script 3)
##### Record identity
- **Record ID:** R29-EVT-134-03
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-DLG-134-03a
- **Map or system:** Route 29 / Route 46 gate (header 134, R29R0101)
- **Speaker, object, or trigger:** Talk-to NPC, event file 130 overworld idx 1 (owID 1, sprite 146, at 7,6, movement 3 wander, xRange 1, yRange 1, orient 0, no hide flag)
- **Source references:** script file 226 Script#3 (L22-30); event file 130 overworld idx 1; text archive 374 msg 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** One message, msg 1 (R29-DLG-134-03a).
- **OLD raw message data:** See the dialogue record.
- **OLD trigger:** Player talks to overworld idx 1 (`scriptNumber` 3): `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Talk. (2) `Message 1` (L26), `WaitButton`, `CloseMessage`. (3)-(5) None. (6) `ReleaseAll`, `End`; repeatable. (7) None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable; same text each time.
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
- **Replacement target:** text archive 374 msg 1; script file 226 Script#3; event file 130 overworld idx 1
- **Other affected callers or records:** None found (msg 1 only at L26).
- **Unresolved questions:** Who the NPC is (sprite 146) is not stated by the data.
- **Validation needed:** Text-box fit after any edit.

#### R29-EVT-134-W0 — Warp back to Route 29 (5,12)
##### Record identity
- **Record ID:** R29-EVT-134-W0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** R29-EVT-033-W0, R29-EVT-033-W1
- **Map or system:** Route 29 / Route 46 gate (header 134, R29R0101)
- **Speaker, object, or trigger:** Warp idx 0 at global (5,12), matrix cell (0,0) tile (5,12)
- **Source references:** `get_events {mapHeader: 134}` warps idx 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Player steps on (5,12).
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Step. (2)-(7) Warp to header 33 (R29), anchor 0, height 0.
- **OLD state changes:** Map change.
- **OLD repeat/completion behavior:** Always available.
- **OLD dependencies and shared-resource effects:** Header 33 warps 0 and 1 lead here.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 130 warp idx 0
- **Other affected callers or records:** R29-EVT-033-W0, R29-EVT-033-W1. Anchor 0 lands on header 33's warp 0 (626,389) if anchor indexes the destination's warp list (not verified).
- **Unresolved questions:** `anchor` semantics.
- **Validation needed:** Leave the gate to the south in game.

#### R29-EVT-134-W1 — Warp to Route 46 (5,2)
##### Record identity
- **Record ID:** R29-EVT-134-W1
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** None
- **Map or system:** Route 29 / Route 46 gate (header 134, R29R0101)
- **Speaker, object, or trigger:** Warp idx 1 at global (5,2), matrix cell (0,0) tile (5,2)
- **Source references:** `get_events {mapHeader: 134}` warps idx 1; header 48 (R46, location 194, script file 259, event file 45) as dependency only
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Player steps on (5,2).
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Step. (2)-(7) Warp to header 48 (Route 46), anchor 0, height 0.
- **OLD state changes:** Map change.
- **OLD repeat/completion behavior:** Always available.
- **OLD dependencies and shared-resource effects:** Leads outside Route 29 (Route 46 is not documented here).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 130 warp idx 1
- **Other affected callers or records:** Route 46's event file 45 (return warp, not inspected).
- **Unresolved questions:** The Route 46 side of the return trip was not inspected.
- **Validation needed:** Walk through to Route 46 and back.

#### R29-DLG-134-02a — Ledges advice at the gate
##### Record identity
- **Record ID:** R29-DLG-134-02a
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-134-02
- **Related record IDs:** None
- **Map or system:** Route 29 / Route 46 gate (header 134, R29R0101)
- **Speaker, object, or trigger:** NPC at overworld idx 0 (owID 0)
- **Source references:** script file 226 Script#2 (`Message 0`, L16); text archive 374 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `You can’t climb ledges.` [scroll] `But you can jump down from them to / take a shortcut.`
- **OLD raw message data:** `You can’t climb ledges.\rBut you can jump down from them to\ntake a shortcut.`
- **OLD trigger:** Shown by R29-EVT-134-02 on every interaction.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent sequence.
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
- **Replacement target:** text archive 374 msg 0
- **Other affected callers or records:** None found (L16 only).
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit.

#### R29-DLG-134-03a — "Look everywhere to catch them all"
##### Record identity
- **Record ID:** R29-DLG-134-03a
- **Record type:** Dialogue variant
- **Parent record ID:** R29-EVT-134-03
- **Related record IDs:** None
- **Map or system:** Route 29 / Route 46 gate (header 134, R29R0101)
- **Speaker, object, or trigger:** NPC at overworld idx 1 (owID 1)
- **Source references:** script file 226 Script#3 (`Message 1`, L26); text archive 374 msg 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Different kinds of Pokémon appear / past here.` [scroll] `If you want to catch them all, / you have to look everywhere.`
- **OLD raw message data:** `Different kinds of Pokémon appear\npast here.\rIf you want to catch them all,\nyou have to look everywhere.`
- **OLD trigger:** Shown by R29-EVT-134-03 on every interaction.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent sequence.
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
- **Replacement target:** text archive 374 msg 1
- **Other affected callers or records:** None found (L26 only).
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit.

## Coverage summary

### Totals per map (reconciled against the live ROM with `get_events`, `get_script` on the level scripts and `get_text`)

Event-file entries: every spawnable, overworld, warp and trigger index returned by `get_events {mapHeader}` appears in that map's event inventory table and maps to an existing record (covered / total). Level-script entries are counted as stored.

| Header | Spawnables | Overworlds | Warps | Triggers | Level-script entries | Event records | Dialogue records | Total records |
|---|---|---|---|---|---|---|---|---|
| 33 (script 225, LS 470, text 373 and common archive 752 msgs 4-7, 32-35) | 3/3 | 11/11 | 2/2 | 1/1 | 1/1 (LS470) | 19 | 27 | 46 |
| 134 (script 226, LS 471, text 374) | 0/0 | 2/2 | 2/2 | 0/0 | 0/0 (LS471 empty) | 5 | 2 | 7 |
| **Total** | 3/3 | 13/13 | 4/4 | 1/1 | 1/1 | 24 | 29 | 53 |

Event records include the level-script record (`-LS`), the scripts that no event-file entry names directly but a level script runs (R29-EVT-033-01; R29-EVT-134-01 is a script that nothing runs), non-talk objects (`-O<idx>`), the hidden item (`-S2`) and warps (`-W<idx>`). Dialogue records are one per message index and member of a gender pair (no pair is merged).

Text archives ("referenced" = cited by a script command or, for the boards, by a `SetIconBoard` argument (Inferred); "unused" = would have a `-U<idx>` record):

| Archive | Header | Total | Referenced (cited by a record) | Unused (U records) | Blank | Not covered by any record |
|---|---|---|---|---|---|---|
| 373 | 33 | 19 (0-18) | 19 (0-14 by commands; 15 and 16 by the board mapping, Inferred; 17, 18 by commands) | 0 | 0 | 0 |
| 374 | 134 | 2 (0-1) | 2 | 0 | 0 | 0 |
| 752 (common archive behind `GetCommonMessageArchive 0`; mapping Inferred) | 33 | 56 (0-55) | 8: only msgs 4, 5, 6, 7, 32, 33, 34, 35 (R29-DLG-033-04a to -04h) | not assessed | not assessed | 48 (out of scope: the other 48 messages belong to the six sibling script files, which read their own blocks) |

### Shared resources (one resource, more than one caller)
- Text archive 373 msgs 0/1 are read at two lines each (L133 in Function#3, L418 in Function#36); msgs 3/4, 5/6, 7/8 at two lines each (Function#25 L310/L314/L318, Function#43 L481/L485/L489); msg 13 at two lines (L152, L251). Msgs 3 and 4 have identical text.
- Function#43 (L468-501) is `Movement Player Action#56` followed by a copy of Function#25 L299-328 (as L470-499; the message and gift part is L481-499 vs L310-328); Function#36 (L410-432) contains a copy of Function#3's body (L415-432 vs L130-147); Function#31 (msg 2) is called from both Function#25 (live) and Function#43 (dead, as the call is guarded by the male-player test and Function#43 is reached only by the other gender, Inferred).
- Objects shared: owID 6 and 7 are used only by script 2 (R29-EVT-033-02); ow3 and ow10 share sprite 326 only by sprite id, not by script.
- Flags and variables with several writers or readers: flag 154 (set here, read in Route 30 files 0227 and 0228); flags 420/421 and var 0x408B (written in 0843 header 61, and in 0149 for the flags); flag 2748 and var 0x4094 (shared with six other maps' sibling scripts); flag 216 (this file only); flag 17 (set in 0938, header 88, a map-temp flag).
- Common scripts called from here: GLB-RTN-2000 (twice), GLB-RTN-2009, GLB-RTN-2029, GLB-RTN-2033 (five call sites: L201 in Function#10, L313 and L317 in Function#25, L484 and L488 in Function#43); the common-message archive behind `GetCommonMessageArchive 0` (archive 752, Inferred; shared with the six sibling files, which read the other 48 of its 56 messages; the eight messages of this map are R29-DLG-033-04a to -04h, and msgs 7 is read at two lines, L65 and L182). The ground-item and hidden-item handlers and the arm9 hidden-item table are shared with the rest of the game (GLB-RTN-ITEMBALL, GLB-RTN-HIDDENITEM).
- Item 2685 is given at Route 29 (Function#25/#43) and, when flag 154 is set and the item is missing, at Route 30 (0227 Function 5, 0228 Function 2).

### Apparently unused
- Script 1 of file 226 (`End` only; R29-EVT-134-01, no event-file entry names it).
- The `CallIf EQUAL Function#31` at 0225.script L474-475 in Function#43 (can never be true on that path, Inferred).
- Level script 471 (empty, 0 entries); no record.
- Messages: none (every message of 373 and 374 is referenced; msgs 15 and 16 only through the Inferred board mapping).
- Overworlds with no talk script (`scriptNumber 0`): R29-EVT-033-O6 and -O7 (used only by script 2). Overworlds with a scriptNumber that runs no code in this map's script files: R29-EVT-033-O4, -O5 (10000) and -O9 (2800), unresolved.

### Hack modifications in Route 29 (what is verifiable)
- Script file 225 was edited once through the journal: id 20 (2026-09-26T07:09:43Z), the Mr. Paint gift (`GenderMessage 5 6`, `SetVar 0x8004 2685`, `SetVar 0x8005 1`, `CommonScript 2033`, `GenderMessage 7 8`) inserted into Function#25 before index 15. A matching block exists in Function#43 (L485-489); whether that block was part of the vanilla duplicate or added by the same edit is not shown by the journal summary (Unresolved).
- Text archive 373 msgs 5 and 6 (Mr. Paint wording) were set by journal id 21 (2026-09-26T07:10:12Z).
- No event file, level script, header, encounter or script file 226 / text archive 374 edit exists in the journal. The built ROM additionally runs hg-engine's regenerated common script (entry 3) used by `CommonScript 2000/2009/2029/2033` and the engine-supplied item 2685 (global; see GLB ids and `docs/mr-paint-follower.md`).
- Related hack edits outside Route 29 that touch Route 29 state: script files 0227 and 0228 (Route 30, journal ids 1, 2, 3, 22, 23) read flag 154 and re-give item 2685.

### Scope classifications marked uncertain
- R29-EVT-033-04 (weekday sibling): a local NPC on this map whose eight messages are stored in a shared common message archive (`GetCommonMessageArchive 0`, text archive 752, Inferred). Resolved: they are Route 29-specific content (a grep of `project/scripts/` finds indices 4-7 and 32-35 of that argument read only by `0225.script`; each of the six sibling files reads its own block of eight indices), so they are documented here as R29-DLG-033-04a to -04h. Only those eight of the archive's 56 messages are in scope. No `GLB-PRM` record exists for them in `global_dialogue_event_map.md`, which is consistent with that. The archive mapping itself stays Inferred. Engine or overlay code reading archive 752 was not checked.
- R29-EVT-033-05 / -06 and R29-DLG-033-05a / -06a: the board commands (`SetIconBoard`, `ShowBoard`, `CloseBoard`) and `CommonScript 2000` call a global board routine (GLB-RTN-2000); the board text is local, the board behaviour is global.
- R29-EVT-033-O8 (ground item) and R29-EVT-033-S2 (hidden item): the events are local; the item routines are global (GLB-RTN-ITEMBALL, GLB-RTN-HIDDENITEM) and the hidden-item row is in the arm9 table.
- R29-EVT-033-02: the scene is local, but `CommonScript 2029`, `CommonScript 2033` (gifts), item 2685 and the flag 154 read in Route 30 are global or cross-map.
- R29-EVT-033-01 / -04: the weekday and badge conditions are engine/save state.

## Resources inspected

### Resources inspected
- **ROM and extraction:** working ROM `~/pokehg/working/heartgold.nds` (HeartGold US, IPKE, rev 0), extraction `~/pokehg/working/heartgold_DSPRE_contents/`; the pristine `rom/original/` was not opened.
- **Map headers:** 33, 134 (`get_world_data {kind: mapHeader}`), 127 and 36 (dependency checks), and the `arm9.bin` header table (24-byte records, scriptFileId at record byte 6) as recorded in the New Bark Town document and the briefing; location name id 177 "Route 29" (text archive 279 msg 177).
- **Matrices:** 0 ("map", headers and maps layers, window x 15-23, y 10-13) and 69 ("m_gate01_").
- **Event files:** 30 and 130 (`get_events`).
- **Script files:** 225 and 226 (`get_script`, and the pulled disassembly `project/scripts/0225.script`, `0226.script`), plus `0141.script` Script 1 (`get_script` file 141), and greps of 0149, 0227, 0228, 0232, 0243, 0246, 0843, 0938, 0941, 0962 and the other script files for the flags and variables of this map.
- **Level scripts:** 470 and 471 (`get_script`, structured form).
- **Text archives:** 373 and 374 (`get_text`), 279 (`search_text` for the location name), 752 (`get_text` indices 4, 5, 6, 7, 32, 33, 34, 35 only; the common archive, Inferred).
- **ROM tables and lookups:** `get_rom_table {kind: hiddenItems, index: 1}`; `lookup_names` items 4, 17, 92, 248, 2685; `list_changes` (the journal).
- **Project docs:** `docs/scripting-reference.md` (GenderMsgBox, break codes, CheckBadge), `docs/partner-sprite.md` (gender values, sprite-by-variable), `docs/mr-paint-appraisal.md` (common message archive table, day-of-week), `docs/mr-paint-follower.md` (item 2685), `docs/violet-route32-flicker.md` (sprite 262 / script 2800), `get_docs reference/events` (scriptNumber ranges).
- **Sibling documents:** `new_bark_town_content_map.md` (format, dependency method, `SetIconBoard 34 0 11`) and `global_dialogue_event_map.md` (GLB ids: GLB-RTN-2000, 2009, 2029, 2033, ITEMBALL, HIDDENITEM; archives present: 30, 40, 199, 210, 435).
- **hg-engine sources:** `~/Programming/hg-engine/armips/include/flags.s` and `vars.s` (flag and variable names).

### Methods
- dspre-mcp `get_*` tools only (read-only): `get_events`, `get_script`, `get_text`, `search_text`, `get_world_data`, `get_rom_table`, `lookup_names`, `list_changes`, `get_docs`, plus `open_rom` on the working ROM path.
- `grep` / `sed -n` / `cat` of `project/scripts/*.script` and the sibling documents for flag, var and message references (basis for every "writers" and "also used by" statement). Line numbers (L<n>) are lines of the pulled `0225.script` / `0226.script`, which carry a 7-line comment header that the live `get_script` listing does not.
- Structural counts by `grep` (record headings, field labels, UNDECIDED, UNSET, index rows).
- No code was written, no emulator or build was run, and nothing in the ROM, the extraction or the project was modified; the only file written is this document.

## Unresolved references and conditions

Collected from the **Unresolved questions** field of each record and from the Evidence status lines; duplicates merged.

**Undecoded commands and arguments**
- `MecScript` (R29-EVT-033-02), `CatchTutorial` (R29-EVT-033-02), `GetCounterpartSprite 0x4021` (R29-EVT-033-01), `SetFollowingPokeMovement 55` / `48` and `LockFollowingPoke` (R29-EVT-033-02), `WaitTime 10 0x800C`, `TextPartyPokemon`, `CheckBadge 0` (which badge), `CheckRibbon` result meaning and ribbon id 60 (R29-EVT-033-04), the arguments of `SetIconBoard 16 1 1` / `15 1 2` and `ShowBoard 3` (R29-EVT-033-05, -06).
- The position-vs-text oddity of the two boards (the west-end board maps to "East to New Bark Town", the east-end board to "West to Cherrygrove City") and whether the `SetIconBoard` first argument is the message index at all (R29-EVT-033-05, -06, R29-DLG-033-05a, -06a). Supporting evidence for the mapping is indirect (otherwise unreferenced messages; the New Bark Town board `SetIconBoard 34 0 11` and its unreferenced msg 34 in that document).

**Flags, variables and engine behaviour**
- `GetTimePeriod` value names (R29-EVT-033-03); day-of-week value 2 as Tuesday (R29-EVT-033-01, -04); how flag 2748 ("DAILY") resets; whether all seven siblings of var 0x4094 are reachable (R29-EVT-033-04).
- Who sets flag 16 / what it hides (R29-EVT-033-O4); whether flag 17 set in 0938 is this map's flag instance (R29-EVT-033-O5); the initial state of flags 420/421 on a new game (0149 sets both; its caller is unresolved) (R29-EVT-033-O6, -O7); `scriptNumber` 10000 meaning (R29-EVT-033-O4, -O5) and `scriptNumber` 2800 meaning plus the sprite 262 object's behaviour (R29-EVT-033-O9; same-sprite object in Violet City noted in `docs/violet-route32-flicker.md` line 538).
- Which script sets the sprite shown by owID 7 (sprite code 1032 reads var 0x4020, while script 1 here writes 0x4021) (R29-EVT-033-01, -O7).
- Level-script evaluation order and timing relative to object spawning (R29-EVT-033-LS, -01).
- Who else watches var 0x408B or sets flags 420/421/154/519 in other maps' level scripts and event files: not searched.
- Warp `anchor` semantics (R29-EVT-033-W0, -W1, R29-EVT-134-W0, -W1); the hidden-item mapping 8000+k → table index k (R29-EVT-033-S2) and the header-67 matrix column at tile (572,390).
- What `CommonScript 2033` prints in the working ROM versus the hg-engine build and whether the Mr. Paint item 2685 is delivered in the working ROM at all (item 2685 has no name in this ROM; GLB-RTN-2033).
- Whether Function#43's duplicate gift block was in the vanilla script or added by journal id 20 (R29-EVT-033-02). Hint only, unverified: `list_changes` reports 2580 bytes for journal id 20 while the live file 225 is 2892 bytes; if 2580 is the pre-edit size, the 312-byte growth would fit both gift blocks (Function#25 and Function#43) having been added by that entry. Second hint, also unverified: the journal's saved pre-edit copy of file 225 for id 20 contains no little-endian 2685 (0x0A7D) value, and id 20 is the only journal entry on file 225; the visible part of its summary shows only Function#25 edits.
- Resolved: the eight common-archive texts of R29-EVT-033-04 (indices 4, 5, 6, 7, 32, 33, 34, 35 of `GetCommonMessageArchive 0`) are now documented as R29-DLG-033-04a to -04h. A grep of `project/scripts/` finds them read only by 0225 (the six sibling files 0232, 0243, 0246, 0938, 0941, 0962 each read their own block of eight indices). Remaining open: the archive mapping (argument 0 → text archive 752) is Inferred, and engine/overlay code reading archive 752 was not checked.

**Identities and scene context**
- Sprite identities (`overlayTableEntry` 317, 332, 322, 326, 86, 102, 1032, 87, 262, 394, 146) are not decodable through dspre-mcp; speakers are named only by the message text (Lyra / Ethan for the friend). Whether sprite 102 for the friend is correct for both player genders (R29-EVT-033-O6).
- Gender order of every `GenderMessage a b` pair (first id male) is taken from `docs/scripting-reference.md` line 111 and `docs/partner-sprite.md` line 45 and was not run-tested: R29-DLG-033-02a/b, 02c/d, 02f/g, 02h/i, 02j/k.
- Whether the male-only "too fast" retry (R29-DLG-033-02e) is deliberate.
- The common-message archive behind `GetCommonMessageArchive 0` (Inferred 752 from `docs/mr-paint-appraisal.md`, which derives the 4-entry table from pret source; the eight texts read from archive 752 fit their call sites, and text archive 0 has only 12 messages so it cannot be the target): the eight Route 29 prompts are documented as R29-DLG-033-04a to -04h (R29-EVT-033-04).

**Text break-code glosses**
- This document renders `\r` as scroll and `\f` as new box (per the briefing); `docs/scripting-reference.md` lines 398-399 gloss `\r` (0x25BC) as "new page, waits for a button press" and `\f` (0x25BD) as "paragraph/form-feed break". The OLD raw message data is authoritative in every record; which gloss is correct was not verified.

**Cross-document finding**
- The New Bark Town document records the text archive 542 msg 34 as "apparently unused (by scripts)"; its `NBT-EVT-060-15` board runs `SetIconBoard 34 0 11`, so msg 34 is probably that board's text (same argument-equals-index pattern as the Route 29 boards). Not changed here (the other document was not edited).

## Inspection limitations

- **Level scripts have no text disassembly.** They were read through `get_script` (structured trigger lists) only; engine evaluation order and timing were not verified.
- **Sprite ids are not decodable through dspre-mcp.** Speakers and objects are inferred from message text and flag names, never from the sprite.
- **Some opcodes are undocumented** in `docs/scripting-reference.md` or the scrcmd database: `MecScript`, `CatchTutorial`, `GetCounterpartSprite`, and the arguments of `SetIconBoard`, `ShowBoard`, `SetFollowingPokeMovement`, `LockFollowingPoke`, `WaitTime`, `TextPartyPokemon`. Their effect is described from the surrounding script only.
- **`GenderMessage a b` order** (first id male) is taken from project docs, not run.
- **Other maps' level scripts and event files were not searched** for flag and var writers; "writers" in this document are limited to `project/scripts/*.script` and the Route 29 event/level data. A flag marked "no script writer" may still be set from a level script, another map's event-file hide flag or engine code. Script file 0149's caller is unresolved.
- **hg-engine overrides exist only in the built ROM.** The working ROM is the OLD baseline; the common script entry used by the four `CommonScript` ids is rebuilt at build time, and item 2685 exists only in builds.
- **Global content is not documented** by design; global behaviour is referenced by GLB id only.
- **No runtime testing.** Nothing was run in an emulator; every reachability statement is a static reading of conditions.
- **No code was written**, so there is no exhaustive automated cross-reference: references were found with `grep` of the disassembly and may miss a reference written in a form the pattern did not match.

## Verification performed

- **Disassembly versus live ROM.** Live `get_script` file 225: 9 scripts, 43 functions, 56 actions, 838 live lines; `project/scripts/0225.script` has 845 lines (838 + 7-line header); the live listing of lines 0-199 was compared with the file (Scripts 1-9 and Functions 1-10 read side by side with the pulled file; no difference noticed, not a mechanical diff). File 226: 3 scripts, 0 functions, 0 actions; 33 lines = 26 live + 7. Not every line of 0225.script was compared against the live listing; the rest was read from the pulled file only.
- **Inventory reconciliation.** `get_events` was run for headers 33 and 134: 3/11/2/1 and 0/2/2/0 (spawnables/overworlds/warps/triggers); every index appears in its inventory table and maps to a record; owIDs, sprites, coordinates, flags, scriptNumbers, trigger rectangle, variable and warp destinations equal the records. Level scripts 470 (1 entry: mapChange, scriptId 1) and 471 (0 entries) were read with `get_script`.
- **Text reconciliation.** `get_text` archives 373 (19 messages) and 374 (2 messages) were read for this run and pasted into the raw fields; the `Message` / `GenderMessage` / `MessageFromArchive` commands of both script files were listed by grep and every cited index appears in a record (msgs 15 and 16 through the Inferred board mapping; the common-archive indices 33, 35, 32, 34, 7, 6, 4, 5 in script 4 have no local record).
- **Other checks.** Header table read with `get_world_data` for headers 33, 134, 127 and 36 (script file, level script, text, event file ids); matrix 0 window and matrix 69 summary read; hidden-item table index 1 = Nugget x1 scriptId 1; item names 4 Poké Ball, 17 Potion, 92 Nugget, 248 TwistedSpoon, 2685 null; flag and variable writers/readers re-grepped across `project/scripts/` (the per-flag list above); the journal re-read (34 entries; ids 20 and 21 touch Route 29).
- **Structure check.** 45 `#### R29-` headings; 45 each of the labels `Record identity`, `OLD — Current content`, `NEW — Replacement content`, `Mapping and verification` and every one of the 30 field labels; NEW change status is `UNDECIDED` and the other eight NEW fields `UNSET` in all 45; Record type is `Event` (24) or `Dialogue variant` (21) and agrees with the id; the index has 45 rows in heading order; Record IDs are unique and equal their headings.
- **What this is not.** Static inspection only. No runtime or emulator test was run, nothing was built, and nothing in the ROM, the extraction or the project was modified: every dspre-mcp call was a read-only `get_*` / `search_text` / `lookup_names` / `list_changes` / `get_docs` call (and `open_rom` on the working ROM), and the only file written is this document. Timestamp of the final pass: 2026-10-12T23:28:52+05:30 (from `date -Iseconds` at the start of the writing; the checks were repeated after the last edit).
- **Independent static audit, 2026-10-12T23:41:24+05:30.** A second read-only pass (dspre-mcp `get_events`, `get_script`, `get_text`, `list_changes`; grep of `0225.script`/`0226.script`) re-checked every event-file index, both level scripts, every raw message string character for character (all 21 match), every message/common-script line citation, the branch logic of R29-EVT-033-01, -02 and -04, every `GLB-` id (six, all present in the global document) and every `R29-` cross-reference. Four minor errors were found and corrected in place: the matrix-cell x ranges in the Map 033 inventory note, the Function #6-#10 line ranges in R29-EVT-033-04, the female-path wording in R29-DLG-033-02e, and the Function#36/#43 duplicate line ranges in Shared resources. No runtime test was run.
- **Independent static re-check, 2026-10-12T23:49:28+05:30.** Read-only (dspre-mcp `get_events`, `get_script`, `get_text`, `get_world_data`, `get_rom_table`, `lookup_names`, `list_changes`; grep of `project/scripts/`). Checked: all 45 records' structure, labels and NEW fields; the 45-row index; every `R29-` and `GLB-` reference; 3 spawnables, 13 overworlds, 4 warps, 1 trigger and both level scripts against the inventory tables; all 540 map headers for location Route 29 (only 33 and 134) and the matrix-0 neighbours; all 21 messages of archives 373 and 374 against the 21 Dialogue variant records (all match); the logic of all 24 Event records against 0225/0226; every `CommonScript` call and its `GLB-RTN-` id; flag/var writers and readers; the callers of every replacement target. No wrong branch, comparison value, flag, var, message index or Script/Function number was found. Corrected in place: Function#31 movement wording and the Function#3/#36 line ranges (R29-EVT-033-02); "lead" to "first alive" Pokémon and the `PlaySound` wording (R29-EVT-033-04); the board-placement "oddity" claim (R29-EVT-033-05); the hidden-item found-flag marked Inferred (R29-EVT-033-S2, index row); outside writers of vars 0x4021 and 0x4020 added (flags/vars table, R29-EVT-033-O7); hg-engine dependency added to R29-EVT-033-04, -05, -06 and R29-DLG-033-02f to 02i; the hedge on msgs 15/16 in Conventions and on journal id 20 in Source; two items added to Unresolved references (journal id 20 origin hint, common archive 0 texts). No runtime test was run.
- **Common-archive messages of R29-EVT-033-04 added, 2026-10-12T23:52:48+05:30.** Eight Dialogue variant records (R29-DLG-033-04a to -04h) added after R29-EVT-033-04; index, totals (53 records: 24 Event, 29 Dialogue variant), text-archive table and the two "global, not documented" entries updated. Read-only: `open_rom` on the working ROM, `get_text` archive 752 indices 4, 5, 6, 7, 32, 33, 34, 35 only (all 8 pasted into the raw fields), `get_docs reference/scripts`, grep of `project/scripts/`. Archive mapping: `get_text {archive: 0}` refused indices 32-35 (archive 0 holds 12 messages, 0-11), so argument 0 does not mean text archive 0; 752 (4-entry table derived from pret source in `docs/mr-paint-appraisal.md`, lines 1447-1473) fits all eight call sites and stays Inferred (the dspre-mcp docs do not state the mapping). `0225.script` has exactly 9 `MessageFromArchive` lines for indices 7, 33, 35, 7, 6, 4, 5, 32, 34 (L65, 163, 171, 182, 187, 195, 205, 256, 258). Only seven files use `GetCommonMessageArchive 0` (0225, 0232, 0243, 0246, 0938, 0941, 0962); their other indices: 0232 {16-19, 44-47}, 0243 {12-15, 40-43}, 0246 {24-27, 52-55}, 0938 {8-11, 36-39}, 0941 {20-23, 48-51}, 0962 {0-3, 28-31}; none reads 4-7 or 32-35. Files using `GetCommonMessageArchive 1`, `2` or `3` select other archives; `MessageFromArchive` in 0144 and 0953 takes variable arguments with no `GetCommonMessageArchive` there (not resolved statically). Structure check after the addition: 53 `#### R29-` headings and 53 index rows in heading order; 53 each of the 4 subheadings and of the 29 field labels (the earlier "30 field labels" count was a miscount; each record has 29); 53 NEW change status `UNDECIDED` and 424 `UNSET` (8 per record); every `R29-` id in Parent and Related fields resolves to a heading.
