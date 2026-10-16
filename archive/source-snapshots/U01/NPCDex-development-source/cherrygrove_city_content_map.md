# Cherrygrove City — content map (dialogue, event scripts, triggers, access conditions)

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
- `CGC-EVT-<hhh>-<nn>` — an event entry point on map header `<hhh>` (three digits). `<nn>` is the script index within that map's script file (`CGC-EVT-067-04` = script 4 of header 67's script file 850).
- `CGC-EVT-<hhh>-LS` / `-LS<n>` — the level-script record of a map (`-LS<n>` = entry n when a level script has more than one entry). Level scripts with no entries get no record.
- `CGC-EVT-<hhh>-O<idx>` / `-S<idx>` / `-T<idx>` / `-W<idx>` — event-file entries (overworld, spawnable, trigger, warp) that run no script of the map's own script file (warps, hidden and ground items, objects whose `scriptNumber` is 0 or a global id).
- `CGC-DLG-<hhh>-<nn><letter>` — one dialogue variant used by event `CGC-EVT-<hhh>-<nn>`, lettered in order of first use (a, b, c…). Each member of a gender pair is its own record.
- `CGC-DLG-<hhh>-U<idx>` — a text-archive message that no script command references (apparently unused); `<idx>` is the message index.
- `GLB-…` — global records, defined in `global_dialogue_event_map.md` (existing ids only).

### Evidence status
- `Verified` — read directly from the ROM data through dspre-mcp or from the disassembly of the working ROM.
- `Inferred` — concluded from verified data, not directly stated by it.
- `Unresolved` — could not be established.

### Reachability classes
Referenced and apparently reachable / Referenced with unresolved reachability / Apparently unused.

## Source and how it connects

### What was supplied and inspected
- **Working ROM (the hack as it stands):** `~/pokehg/working/heartgold.nds`. `open_rom` (reusing the existing extraction): game HeartGold (US), family HGSS, language English, game code IPKE, title `POKEMON HG`, ROM version 0, dspre-mcp `validated: true`. The extraction reused is `~/pokehg/working/heartgold_DSPRE_contents/` (40 data types present, none missing).
- **Pristine original:** `rom/original/` (not opened; not modified).
- **Modifications (verifiable):** the dspre-mcp journal (`list_changes`, 34 edits, ids 1-34, 2026-09-15 to 2026-10-07) edits script files 843, 163, 92, 227, 228, 222, 903, 891, 146, 145, 141 and 225 and text archives 373 and 115. **No journal entry touches a Cherrygrove City file**: script files 850-856, level scripts 623-629, text archives 550-555 and 3, event files 64-69 and 140, map headers 67-72 and 144, and no encounter file. Indirect contacts: journal id 19 edited script file 145, the global hidden-item handler used by the two Cherrygrove hidden items (`CGC-EVT-067-S2`, `-S3`; GLB-RTN-HIDDENITEM); script file 843 (header 61, Elm's Lab, journal ids 17, 30, 31, 32, 34) reads flag 153, which a Cherrygrove scene sets, clears flag 404 (hide flag of the mart's second clerk) and writes var 0x4108, which two Cherrygrove NPCs read (see Dependency references; whether the journalled edits changed those particular lines was not checked line by line).
- **hg-engine layer:** the client builds additionally run hg-engine (`~/Programming/hg-engine`), which at build time regenerates script archive entry 3 (common script; source `armips/scr_seq/scr_seq_00003_commonscript.s`) and entry 953 (trainer script). Those overrides exist only in the built `.nds`; this document records the working ROM as the OLD baseline. Cherrygrove calls common scripts 2000, 2002 (nurse), 2011, 2031, 2033, 2037, 2038, 2048 and 2052 (mart), 2070 and 2071, and names 2025 as an event-file `scriptNumber`; all are in entry 3 and therefore depend on the hg-engine override in builds (`docs/mr-paint-appraisal.md` records hack work on the mart routine; global, not documented here). The rival battle of `CGC-EVT-067-04` runs an inline `TrainerBattle` whose trainer data hg-engine owns in builds. Header 67 uses wild encounter file 2 (hg-engine owns encounter data in builds; not documented here).
- **Disassembly:** `project/scripts/NNNN.script` (497 files, file number = script archive index, pulled from the working ROM 2026-10-08). Spot-checked against live `get_script` for every Cherrygrove script file (each pulled file = live lines + a 7-line comment header; container counts equal): 850 1038 = 1031 + 7 (11 scripts / 39 functions / 47 actions; live items 0-650 compared command for command, Actions and the tail of Function#39 not compared); 851 64 = 57 + 7 (4/2/0), 852 77 = 70 + 7 (6/2/0), 853 13 = 6 + 7 (1/0/0) compared in full; 854 33 = 26 + 7 (3/0/0), 855 23 = 16 + 7 (2/0/0), 856 33 = 26 + 7 (3/0/0) compared line by line. Level scripts have no text disassembly; they were read with `get_script` (structured trigger lists).

### How the data connects (Cherrygrove City)
Map header → matrix (geometry) + event file (signs, NPCs, warps, triggers) + script file (event logic) + level script (map-entry/var-watch triggers) + text archive (the messages script commands print by index).

Cherrygrove City is the set of map headers whose location name is id 127 "Cherrygrove City" (`lookup_names {category: location, query: cherrygrove}` → one location, id 127; `get_world_data {kind: mapHeader}` listing of all 540 headers): headers **67, 68, 69, 70, 71, 72 and 144**. The set is closed under warps: every warp of these seven headers leads to another of them. No header with a different location name is reachable only from Cherrygrove.

| Header | Internal name | Matrix (map file) | Event file | Script file | Level script | Text archive | Spawnables/Overworlds/Warps/Triggers |
|---|---|---|---|---|---|---|---|
| 67 | T21 (exterior) | 0 "map" (47x17), cells (16,12), (17,12), map files 4, 5 | 64 | 850 | 623 (1 entry) | 550 (25 msgs) | 4/6/5/3 |
| 68 | T21FS0101 (Poké Mart) | 104 | 65 | 851 | 624 (1 entry) | 551 (3 msgs) | 0/6/1/0 |
| 69 | T21PC0101 (Pokémon Center, ground floor, Inferred) | 73 | 66 | 852 | 625 (2 entries) | 552 (6 msgs) | 1/10/2/0 |
| 144 | T21PC0102 (Pokémon Center upper floor, Inferred) | 77 | 140 | 853 | 626 (2 entries) | 3 (1,404 msgs; shared with other headers, 143 of 540 by one header-table count, not re-verified; global) | 0/3/1/0 |
| 70 | T21R0301 (house) | 97 | 67 | 854 | 627 (0 entries) | 553 (2 msgs) | 0/2/1/0 |
| 71 | T21R0401 (house) | 96 | 68 | 855 | 628 (0 entries) | 554 (1 msg) | 0/1/1/0 |
| 72 | T21R0501 (house) | 97 | 69 | 856 | 629 (0 entries) | 555 (2 msgs) | 0/2/1/0 |

Header 67: wild encounter file 2, weather 0, header flags 123, music 1019 day/night, `areaDataId 2`, `locationType 1`, `followMode 2`. Headers 68, 69, 70, 71, 72, 144: wild 255 (none), weather 0, flags 114; music 1064 (68), 1063 (69, 144), 1019 (70-72); `locationType 4`, `followMode 1`. Interior event coordinates are local tiles (matrix cell 0,0).

**Warps (from header, warp index, tile → destination header, anchor; from `get_events`):** 67/W0 (564,391) → 69 anchor 0; 67/W1 (555,391) → 68 anchor 0; 67/W2 (547,399) → 70 anchor 0; 67/W3 (558,401) → 71 anchor 0; 67/W4 (567,405) → 72 anchor 0; 68/W0 (4,11) → 67 anchor 1; 69/W0 (8,19) → 67 anchor 0; 69/W1 (14,17) → 144 anchor 0; 144/W0 (14,10) → 69 anchor 1; 70/W0 (4,8) → 67 anchor 2; 71/W0 (4,8) → 67 anchor 3; 72/W0 (4,8) → 67 anchor 4. Observed (not verified as engine semantics): each anchor equals the index of the destination map's warp that leads back.

**Exits (by walking across matrix cell edges, from `get_world_data matrix 0` headers and maps layers, window x 13-20, y 10-14):** east of cell (17,12): cell (18,12) map 1, header 33 (R29, Route 29; continues at (19,12), (20,12)). North of cell (17,12): cell (17,11) map 8 and (17,10) map 7, header 34 (R30, Route 30). North of cell (16,12): (16,11) map 208, header 0. West of cell (16,12): (15,12) map 209, header 0. South: (16,13) map 209 and (17,13) map 208, header 0; row 14 from x 16 is empty (65535). Maps 208/209 on header 0 are taken to be filler/sea border maps (Inferred). Which cell edges are actually walkable was not inspected (map geometry is not readable through dspre-mcp). Boundary quirk (Inferred): the hidden item at global (572,390) lies in matrix column 17 and is present in both event file 64 (`CGC-EVT-067-S2`) and Route 29's event file 30 (`R29-EVT-033-S2`).

**Global content:** calls to common scripts (`CommonScript <id>` and event-file `scriptNumber` 2025), the hidden-item handler and the photographer prompts of common message archive 2 (archive 30, read by 49 other script files) are referenced as `GLB-RTN-…` / `GLB-PRM-30-…`. Event-file `scriptNumber` and level-script ids 9000, 9001, 9003, 9012, 9013, 9017, 9200-9205 and 10200-10202 (Pokémon Center and Mart objects and level scripts) lie in an id space whose target file is not determined; `global_dialogue_event_map.md` records ids >= 9000 as Unresolved, so they are "global, not documented". Text archive 3 (header 144) is read by no local script command.

### Dependency references (outside Cherrygrove City)

Resolution method (Verified): each script file id was matched to the map headers whose `scriptFileId` equals it, from the header table (`get_world_data {kind: mapHeader}`; the arm9 header table, 24-byte records, scriptFileId at record byte 6, as in the Route 29 document). Writes are "as cited in this document"; this table does not read other maps' dialogue. Line numbers are lines of the pulled `.script` files.

| Script file | Map header(s) | Location / kind | Cherrygrove flags/vars it touches (as cited here) |
|---|---|---|---|
| 0229 | 143 (R30R0201) | Route 30 (interior) | sets var 0x4073 = 3 (L211; trigger var of `CGC-EVT-067-02`/`-03`/`-04`); clears flag 412 (L212; hide flag of the rival object `CGC-EVT-067-O4`); sets flag 790 (L208) and clears flag 789 (L209) (Pokémon Center counter objects); writes var 0x4108 |
| 0149 | none | Not a map script file (no header uses it); invocation Unresolved | sets flags 412 (L16), 404 (L52), 789 (L149) |
| 0843 | 61 (T20R0101) | New Bark Town (Elm's Lab) | reads flag 153 (L704), set by `CGC-EVT-067-04`; clears flag 404 (L157, L603); reads and writes var 0x4108 (journal-edited file) |
| 0845, 0848 | 63, 66 | New Bark Town interiors | read var 0x4108 |
| 0859 | 135 (T22GYM0101) | Violet City Gym | sets flag 403 (L44; hide flag of `CGC-EVT-069-O7`); writes var 0x4108 |
| 0858 | 157 (T22FS0101) | Violet City Poké Mart | writes var 0x4108 |
| 0112 | 288 (D44R0103) | Dragon's Den | writes var 0x4108; also writes flag 638 |
| 0144 | none | Not a map script file | sets and clears flags 679 and 680 (hide flags of `CGC-EVT-068-O5`, `-O4`) |
| 0004, 0166 | none | Not map script files | write var 0x4133 (level script 625 watches it); 0004 also reads it |
| 0119 | 173 (D47R0101) | Safari Zone Gate | writes var 0x4133 |
| 0907 | 207 (T25R1201) | Global Terminal | reads and writes var 0x4133 |
| 0164 | none | Not a map script file | writes var 0x4117 (L229) and var 0x4137 (L89) (watched by level script 626) |
| 0147 | 516 (HIROBA) | Mystery Zone | writes var 0x4137 (L76) |
| 44 files (20 resolved, e.g. 0842 = 60 New Bark Town, 0232 = 36 Route 32) | see `Map 067 flags and variables` | many maps | write flag 638 (hide flag of the photographer `CGC-EVT-067-10`); 55 files touch flag 393, not resolved |
| 0145 | (global) | Hidden-item handler script file (journal id 19) | `scriptNumber` 8001 and 8225 of `CGC-EVT-067-S2`, `-S3` — GLB-RTN-HIDDENITEM |
| 0003, 0953 | (global) | Common script and trainer script entries | hg-engine regenerates both at build time; global, see GLB ids |
| event file 30 / header 33 | 33 (R29) | Route 29 | duplicate hidden-item entry at (572,390) (`R29-EVT-033-S2`); map-edge neighbour east |
| header 34 | 34 (R30) | Route 30 | map-edge neighbour north |

## Index

One row per record (`#### CGC-…` heading), in document order: 100 records. "Map" is the map header number. Sections are in warp order (067, 068, 069, 144, 070, 071, 072). In the Related IDs column the `CGC-` prefix is dropped and a trailing "…" means the record's own field lists more.

| Record ID | Record type | Map/system | Speaker/object | Trigger | OLD availability | Source | Related IDs |
|---|---|---|---|---|---|---|---|
| CGC-EVT-067-01 | Event | 67 exterior | Guide Gent talk object (ow0, sprite 330); script is `End` only | talk to ow idx 0 | while flag 408 clear | 850 S#1 L9-10; ev64 ow0 | EVT-067-02, 03 |
| CGC-EVT-067-LS | Event | 67 exterior | level script 623 entry 1 (mapChange) | map load | every map entry | LS623 e1 | EVT-067-11 |
| CGC-EVT-067-02 | Event | 67 exterior | Guide Gent walks up, tours the town, gives the Running Shoes | step trigger T0 x566 y397-400; var 0x4073 == 0 | var 0x4073 = 0 | 850 S#2, F#1, 2, 14-16, 27-30, 35, 36, 39; A#1, 2, 8-11, 15-18, 24-36, 42-44, 46, 47; ev64 trig0, ow0 | DLG-067-02a-i; EVT-067-01, 03; GLB-RTN-2037, 2038 |
| CGC-DLG-067-02a | Dialogue variant | 67 exterior | Guide Gent, "You're a rookie Trainer, aren't you?" | EVT-067-02 | with 067-02 | 850 F#2 L157, F#27 L411; 550 m0 | EVT-067-02; DLG-067-02b-i |
| CGC-DLG-067-02b | Dialogue variant | 67 exterior | Guide Gent, "I forgot that you weren't wearing the Running Shoes!" | EVT-067-02 | with 067-02 | 850 F#16 L291, F#35 L591; 550 m1 | EVT-067-02; DLG-067-02a, c-i |
| CGC-DLG-067-02c | Dialogue variant | 67 exterior | Guide Gent, "This is a Pokémon Center." | EVT-067-02 | first tour stop | 850 F#30 L438, F#39 L640; 550 m2 | EVT-067-02; DLG-067-02a, b, d-i |
| CGC-DLG-067-02d | Dialogue variant | 67 exterior | Guide Gent, "This is a Pokémon Mart." | EVT-067-02 | second tour stop | 850 F#30 L449, F#39 L651; 550 m3 | EVT-067-02; DLG-067-02a-c, e-i |
| CGC-DLG-067-02e | Dialogue variant | 67 exterior | Guide Gent, "Route 30 is out this way." | EVT-067-02 | third tour stop | 850 F#30 L460, F#39 L662; 550 m4 | EVT-067-02; DLG-067-02a-d, f-i |
| CGC-DLG-067-02f | Dialogue variant | 67 exterior | Guide Gent, "This is the sea, as you can see." | EVT-067-02 | fourth tour stop | 850 F#30 L472, F#39 L674; 550 m5 | EVT-067-02; DLG-067-02a-e, g-i |
| CGC-DLG-067-02g | Dialogue variant | 67 exterior | Guide Gent, "Here... It's my house! ... Running Shoes!" | EVT-067-02 | last tour stop, before `GiveShoes` | 850 F#30 L484-485, F#39 L686-687; 550 m6 | EVT-067-02; DLG-067-02a-f, h, i |
| CGC-DLG-067-02h | Dialogue variant | 67 exterior | narration, "received the Running Shoes from the Guide Gent!" | EVT-067-02 | straight after `GiveShoes` | 850 F#30 L486-488, F#39 L688-689; 550 m7 | EVT-067-02; DLG-067-02a-g, i |
| CGC-DLG-067-02i | Dialogue variant | 67 exterior | narration, "The instructions read, 'Touch the Sprint Button...'" | EVT-067-02 | after the receipt line | 850 F#30 L490, F#39 L692; 550 m8 | EVT-067-02; DLG-067-02a-h |
| CGC-EVT-067-03 | Event | 67 exterior | Guide Gent returns with the Map Card (Pokégear town map) | step trigger T2 x547-550 y385; var 0x4073 == 1 | var 0x4073 = 1 | 850 S#3, F#3, 4, 17-19, 31; A#3, 4, 11, 19, 20, 37; ev64 trig2, ow0 | DLG-067-03a-d; EVT-067-02, 01; GLB-RTN-2037, 2038 |
| CGC-DLG-067-03a | Dialogue variant | 67 exterior | Guide Gent, "...Hffp... Hffp... I made it..." | EVT-067-03 | with 067-03 | 850 F#19 L318, F#31 L515; 550 m9 | EVT-067-03; DLG-067-03b-d |
| CGC-DLG-067-03b | Dialogue variant | 67 exterior | narration, "loaded the Map Card on ...'s Pokégear!" | EVT-067-03 | after msg 9 | 850 F#19 L319-321, F#31 L516-517; 550 m10 | EVT-067-03; DLG-067-03a, c, d |
| CGC-DLG-067-03c | Dialogue variant | 67 exterior | narration, "...'s Pokégear can now show the Town Map!" | EVT-067-03 | after msg 10 | 850 F#19 L323, F#31 L520; 550 m11 | EVT-067-03; DLG-067-03a, b, d |
| CGC-DLG-067-03d | Dialogue variant | 67 exterior | Guide Gent, "Select the Pokégear on the Touch Screen..." | EVT-067-03 | farewell line | 850 F#19 L324, F#31 L521; 550 m12 | EVT-067-03; DLG-067-03a-c |
| CGC-EVT-067-04 | Event | 67 exterior | rival (ow4, sprite 148) confronts the player, battle 495/496/497 by starter | step trigger T1 x575 y398-401; var 0x4073 == 3 | var 0x4073 = 3; object visible while flag 412 clear | 850 S#4, F#5, 6, 20-22, 32, 33, 37, 38; A#1, 5, 12, 21, 22, 38-40, 45; ev64 trig1, ow4 | DLG-067-04a-c; EVT-067-O4; GLB-RTN-2031, 2070, 2071; GLB-RTN-TRAINER |
| CGC-DLG-067-04a | Dialogue variant | 67 exterior | rival, "...You got a Pokémon at the Lab. What a waste." | EVT-067-04 | before the starter check | 850 S#4 L50; 550 m13 | EVT-067-04; DLG-067-04b, c |
| CGC-DLG-067-04b | Dialogue variant | 67 exterior | rival, "...Do you want to know who I am?" | EVT-067-04 | after the battle, every path | 850 F#6 L188, F#20 L341; 550 m14 | EVT-067-04; DLG-067-04a, c |
| CGC-DLG-067-04c | Dialogue variant | 67 exterior | rival, "Give it back! That's my Trainer Card!" | EVT-067-04 | after the rival's second walk | 850 F#32 L537, F#33 L548; 550 m15 | EVT-067-04; DLG-067-04a, b |
| CGC-EVT-067-05 | Event | 67 exterior | NPC offering Mystic Water (ow3, sprite 332) | talk to ow idx 3 | gift once (flag 243 clear and bag space) | 850 S#5, F#7, 8; ev64 ow3 | DLG-067-05a-c; GLB-RTN-2033 |
| CGC-DLG-067-05a | Dialogue variant | 67 exterior | NPC, "A Pokémon I caught had an item. I think it's Mystic Water." | EVT-067-05 | flag 243 clear | 850 S#5 L64; 550 m20 | EVT-067-05; DLG-067-05b, c |
| CGC-DLG-067-05b | Dialogue variant | 67 exterior | NPC, "Back to fishing for me, then." | EVT-067-05 | after the gift and every later talk (flag 243 set) | 850 S#5 L72, F#7 L201; 550 m21 | EVT-067-05; DLG-067-05a, c |
| CGC-DLG-067-05c | Dialogue variant | 67 exterior | NPC, "You don't have room for this." | EVT-067-05 | flag 243 clear and no bag space | 850 F#8 L208; 550 m22 | EVT-067-05; DLG-067-05a, b |
| CGC-EVT-067-06 | Event | 67 exterior | board "Guide Gent's House" (spawnable S0 at 556,401) | read board, any direction | always | 850 S#6 L78-85; ev64 spawn0; 550 m24 | DLG-067-06a; EVT-067-07; GLB-RTN-2000 |
| CGC-DLG-067-06a | Dialogue variant | 67 exterior | board text "Guide Gent's House" (mapping Inferred) | EVT-067-06 | with 067-06 | 850 S#6 L82; 550 m24 | EVT-067-06; DLG-067-07a |
| CGC-EVT-067-07 | Event | 67 exterior | town sign "Cherrygrove City" (spawnable S1 at 554,396) | read board, any direction | always | 850 S#7 L86-93; ev64 spawn1; 550 m23 (Inferred) | DLG-067-07a; EVT-067-06; GLB-RTN-2000 |
| CGC-DLG-067-07a | Dialogue variant | 67 exterior | sign text "Cherrygrove City / The City of Fragrant Flowers" (mapping Inferred) | EVT-067-07 | with 067-07 | 550 m23; 850 S#7 L87 | EVT-067-07; DLG-067-06a |
| CGC-EVT-067-08 | Event | 67 exterior | NPC, Pokémon lost to wild Trainers (ow1, sprite 146) | talk to ow idx 1 | always | 850 S#8 L94-103; ev64 ow1 | DLG-067-08a |
| CGC-DLG-067-08a | Dialogue variant | 67 exterior | NPC, "I battled the Trainers on the road. My Pokémon lost." | EVT-067-08 | every talk | 850 S#8 L98; 550 m19 | EVT-067-08 |
| CGC-EVT-067-09 | Event | 67 exterior | NPC, travelling with Pokémon (ow2, sprite 325) | talk to ow idx 2 | always | 850 S#9 L104-113; ev64 ow2 | DLG-067-09a |
| CGC-DLG-067-09a | Dialogue variant | 67 exterior | NPC, "When you're with Pokémon, going anywhere is fun." | EVT-067-09 | every talk | 850 S#9 L108; 550 m17 | EVT-067-09 |
| CGC-EVT-067-10 | Event | 67 exterior | photographer (ow5, sprite 328; flag name FLAG_HIDE_CAMERON) | talk to ow idx 5 | object exists while flag 638 clear (set by 067-11); text global | 850 S#10, F#9-12, 23, 24, 34; A#6, 7, 13, 14, 23, 41; ev64 ow5; archive 2 msgs 0-3, 5 | EVT-067-11; GLB-PRM-30-0, 1, 2, 3, 5 |
| CGC-EVT-067-11 | Event | 67 exterior | map-entry check that shows or hides the photographer | level script 623 entry 1 → Script 11 | every map entry | 850 S#11, F#13, 25, 26; LS623 | EVT-067-LS; EVT-067-10 |
| CGC-EVT-067-O4 | Event | 67 exterior | rival actor (ow4, sprite 148, scriptNumber 0) | none (actor of script 4) | visible while flag 412 clear | ev64 ow4; 850 S#4 L47, L613, L623 | EVT-067-04 |
| CGC-EVT-067-S2 | Event | 67 exterior | hidden item, Nugget (572,390; 8001) | interact with the spot | found once (Inferred) | ev64 spawn2; ev30 spawn2; arm9 hiddenItems idx 1 | GLB-RTN-HIDDENITEM; R29-EVT-033-S2 |
| CGC-EVT-067-S3 | Event | 67 exterior | hidden item, Max Revive (522,388; 8225) | interact with the spot | found once (Inferred) | ev64 spawn3; arm9 hiddenItems idx 225 | GLB-RTN-HIDDENITEM |
| CGC-EVT-067-W0 | Event | 67 exterior | warp to the Pokémon Center (564,391) | step on warp idx 0 | always | ev64 warp0 | EVT-067-W1-W4; EVT-069-W0 |
| CGC-EVT-067-W1 | Event | 67 exterior | warp to the mart (555,391) | step on warp idx 1 | always | ev64 warp1 | EVT-067-W0, W2-W4; EVT-068-W0 |
| CGC-EVT-067-W2 | Event | 67 exterior | warp to house 70 (547,399) | step on warp idx 2 | always | ev64 warp2 | EVT-067-W0, W1, W3, W4; EVT-070-W0 |
| CGC-EVT-067-W3 | Event | 67 exterior | warp to the Guide Gent's house, header 71 (558,401) | step on warp idx 3 | always | ev64 warp3; 850 `DoorAnimation` L494, L696 | EVT-067-W0-W2, W4; EVT-067-02; EVT-071-W0 |
| CGC-EVT-067-W4 | Event | 67 exterior | warp to house 72 (567,405) | step on warp idx 4 | always | ev64 warp4 | EVT-067-W0-W3; EVT-072-W0 |
| CGC-DLG-067-U16 | Dialogue variant | 67 exterior | none found, "Did you talk to the old man by the Pokémon Center?" | none found | apparently unused | 550 m16 | DLG-067-U18; EVT-067-03 |
| CGC-DLG-067-U18 | Dialogue variant | 67 exterior | none found, "Mr. Pokémon's house is still farther up ahead." | none found | apparently unused | 550 m18 | DLG-067-U16 |
| CGC-EVT-068-01 | Event | 68 Mart | clerk, standard stock (ow0, sprite 334) | talk to ow idx 0 | always | 851 S#1 L9-18; ev65 ow0 | EVT-068-04 |
| CGC-EVT-068-02 | Event | 68 Mart | NPC, Bug-type poison and Antidotes (ow1, sprite 146) | talk to ow idx 1 | always | 851 S#2 L20-28; ev65 ow1; 551 m2 | DLG-068-02a |
| CGC-EVT-068-03 | Event | 68 Mart | NPC, Poké Ball stock (ow2, sprite 324) | talk to ow idx 2; var 0x4108 compared with 4 | var 0x4108 < 4 → msg 0, else msg 1 | 851 S#3, F#1, 2; ev65 ow2; 551 m0, 1 | DLG-068-03a, 03b |
| CGC-EVT-068-04 | Event | 68 Mart | clerk, special-menu routine (ow3, sprite 334) | talk to ow idx 3 | object hidden while flag 404 set | 851 S#4 L39-48; ev65 ow3 | EVT-068-01 |
| CGC-EVT-068-LS | Event | 68 Mart | level script 624 entry 1 (mapChange, scriptId 10200) | map load | every map entry | LS624 e1 | None |
| CGC-EVT-068-O4 | Event | 68 Mart | object 4 (sprite 299, scriptNumber 10202) | talk to ow idx 4 | hidden while flag 680 set | ev65 ow4; flags.s | EVT-068-O5, LS |
| CGC-EVT-068-O5 | Event | 68 Mart | object 5 (sprite 193, scriptNumber 10201) | talk to ow idx 5 | hidden while flag 679 set | ev65 ow5; flags.s | EVT-068-O4, LS |
| CGC-EVT-068-W0 | Event | 68 Mart | warp to Cherrygrove City exterior (4,11) | step on warp idx 0 | always | ev65 warp0; ev64 warp1 | EVT-067-W1 |
| CGC-DLG-068-02a | Dialogue variant | 68 Mart | NPC (ow1), Bug-type poison and Antidote advice | EVT-068-02 | every talk | 851 S#2 L24; 551 m2 | None |
| CGC-DLG-068-03a | Dialogue variant | 68 Mart | NPC (ow2), "They're fresh out of Poké Balls" | EVT-068-03 | var 0x4108 < 4 | 851 F#1 L52, S#3 L35; 551 m0 | DLG-068-03b |
| CGC-DLG-068-03b | Dialogue variant | 68 Mart | NPC (ow2), "Poké Balls are in stock" | EVT-068-03 | var 0x4108 >= 4 | 851 S#3 L36; 551 m1 | DLG-068-03a |
| CGC-EVT-069-01 | Event | 69 PC 1F | nurse call (ow0, sprite 335) | talk to ow idx 0 | always | 852 S#1 L9-12; ev66 ow0 | None |
| CGC-EVT-069-02 | Event | 69 PC 1F | NPC, the free PC (ow4, sprite 332) | talk to ow idx 4 | always | 852 S#2 L14-22; ev66 ow4; 552 m0 | DLG-069-02a |
| CGC-EVT-069-03 | Event | 69 PC 1F | NPC, the PC is free (ow5, sprite 341) | talk to ow idx 5 | always | 852 S#3 L24-32; ev66 ow5; 552 m1 | DLG-069-03a |
| CGC-EVT-069-04 | Event | 69 PC 1F | NPC, Communication Center upstairs (ow6, sprite 325) | talk to ow idx 6; var 0x4108 compared with 3 | var 0x4108 < 3 → msg 2, else msg 3 | 852 S#4, F#1, 2; ev66 ow6; 552 m2, 3 | DLG-069-04a, 04b |
| CGC-EVT-069-05 | Event | 69 PC 1F | counter lady, Union Room not open (ow8, sprite 336) | talk to ow idx 8 | hidden while flag 790 set | 852 S#5 L43-51; ev66 ow8; 552 m4 | DLG-069-05a; EVT-069-O2, 06 |
| CGC-EVT-069-06 | Event | 69 PC 1F | counter lady, Colosseum not open (ow9, sprite 336) | talk to ow idx 9 | hidden while flag 790 set | 852 S#6 L53-61; ev66 ow9; 552 m5 | DLG-069-06a; EVT-069-O3, 05 |
| CGC-EVT-069-LS1 | Event | 69 PC 1F | level script 625 entry 1 (screenReset, scriptId 9000) | screen reset | every screen reset | LS625 e1 | EVT-069-LS2 |
| CGC-EVT-069-LS2 | Event | 69 PC 1F | level script 625 entry 2 (variableValue on 0x4133) | map load; var 0x4133 == 2 → 9013, == 1 → 9012 | var 0x4133 = 2 or 1 | LS625 e2 | EVT-069-LS1 |
| CGC-EVT-069-O1 | Event | 69 PC 1F | object 1 (sprite 336, scriptNumber 9017) | talk to ow idx 1 | always | ev66 ow1 | EVT-069-O2, O3 |
| CGC-EVT-069-O2 | Event | 69 PC 1F | object 2 (sprite 336, scriptNumber 9003) | talk to ow idx 2 | hidden while flag 789 set | ev66 ow2; flags.s | EVT-069-05, O3 |
| CGC-EVT-069-O3 | Event | 69 PC 1F | object 3 (sprite 336, scriptNumber 9001) | talk to ow idx 3 | hidden while flag 789 set | ev66 ow3; flags.s | EVT-069-06, O2 |
| CGC-EVT-069-O7 | Event | 69 PC 1F | object 7 (sprite 335, scriptNumber 2025) | talk to ow idx 7 | hidden while flag 403 set | ev66 ow7; flags.s; GLB-RTN-2025 | EVT-069-W1 |
| CGC-EVT-069-S0 | Event | 69 PC 1F | spawnable 0 (Misc, scriptNumber 0, at 4,8) | interact from behind | scriptNumber 0 | ev66 spawn0 | None |
| CGC-EVT-069-W0 | Event | 69 PC 1F | warp to Cherrygrove City exterior (8,19) | step on warp idx 0 | always | ev66 warp0; ev64 warp0 | EVT-069-W1; EVT-067-W0 |
| CGC-EVT-069-W1 | Event | 69 PC 1F | warp to the 2F (14,17) | step on warp idx 1 | always | ev66 warp1; ev140 warp0 | EVT-069-W0, O7; EVT-144-W0 |
| CGC-DLG-069-02a | Dialogue variant | 69 PC 1F | NPC (ow4), "I can store any number of Pokémon, and it's all free" | EVT-069-02 | every talk | 852 S#2 L18; 552 m0 | None |
| CGC-DLG-069-03a | Dialogue variant | 69 PC 1F | NPC (ow5), "That PC is free for any Trainer to use" | EVT-069-03 | every talk | 852 S#3 L28; 552 m1 | None |
| CGC-DLG-069-04a | Dialogue variant | 69 PC 1F | NPC (ow6), Communication Center "still finishing it up" | EVT-069-04 | var 0x4108 < 3 | 852 F#1 L65, S#4 L39; 552 m2 | DLG-069-04b |
| CGC-DLG-069-04b | Dialogue variant | 69 PC 1F | NPC (ow6), "I traded Pokémon there already" | EVT-069-04 | var 0x4108 >= 3 | 852 S#4 L40; 552 m3 | DLG-069-04a |
| CGC-DLG-069-05a | Dialogue variant | 69 PC 1F | counter lady (ow8), Union Room "not open yet" | EVT-069-05 | every talk (object hidden while flag 790 set) | 852 S#5 L47; 552 m4 | DLG-069-06a |
| CGC-DLG-069-06a | Dialogue variant | 69 PC 1F | counter lady (ow9), Colosseum "not open yet" | EVT-069-06 | every talk (object hidden while flag 790 set) | 852 S#6 L57; 552 m5 | DLG-069-05a |
| CGC-EVT-144-01 | Event | 144 PC 2F | script 1 (`End` only, unreferenced) | none found | apparently unused | 853 S#1 L9-10 | None |
| CGC-EVT-144-LS1 | Event | 144 PC 2F | level script 626 entry 1 (variableValue on 0x4117, 0x4137) | map load; var 0x4117 == 0 → 9200, var 0x4137 == 1 → 9204 | those variable values | LS626 e1 | EVT-144-LS2 |
| CGC-EVT-144-LS2 | Event | 144 PC 2F | level script 626 entry 2 (loadGame, scriptId 9205) | save loaded on this map | on loading a save here | LS626 e2 | EVT-144-LS1 |
| CGC-EVT-144-O0 | Event | 144 PC 2F | object 0 (sprite 286, scriptNumber 9203) | talk to ow idx 0 | always | ev140 ow0 | EVT-144-O1, O2 |
| CGC-EVT-144-O1 | Event | 144 PC 2F | object 1 (sprite 336, scriptNumber 9202) | talk to ow idx 1 | always | ev140 ow1 | EVT-144-O0, O2 |
| CGC-EVT-144-O2 | Event | 144 PC 2F | object 2 (sprite 336, scriptNumber 9201) | talk to ow idx 2 | always | ev140 ow2 | EVT-144-O0, O1 |
| CGC-EVT-144-W0 | Event | 144 PC 2F | warp back to the 1F (14,10) | step on warp idx 0 | always | ev140 warp0; ev66 warp1 | EVT-069-W1 |
| CGC-EVT-070-01 | Event | 70 house | script 1 (`End` only, unreferenced) | none found | apparently unused | 854 S#1 L9-10 | None |
| CGC-EVT-070-02 | Event | 70 house | resident, Gyms and Badges (ow0, sprite 328) | talk to ow idx 0 | always | 854 S#2 L12-20; ev67 ow0; 553 m0 | DLG-070-02a |
| CGC-EVT-070-03 | Event | 70 house | walking resident, becoming a Gym Leader (ow1, sprite 315) | talk to ow idx 1 | always | 854 S#3 L22-30; ev67 ow1; 553 m1 | DLG-070-03a |
| CGC-EVT-070-W0 | Event | 70 house | warp out to Cherrygrove City (4,8) | step on warp idx 0 | always | ev67 warp0; ev64 warp2 | EVT-067-W2 |
| CGC-DLG-070-02a | Dialogue variant | 70 house | resident (ow0), advice: visit the Gyms, collect Badges | EVT-070-02 | every talk | 854 S#2 L16; 553 m0 | None |
| CGC-DLG-070-03a | Dialogue variant | 70 house | resident (ow1), "When I get older, I'm going to be a Gym Leader" | EVT-070-03 | every talk | 854 S#3 L26; 553 m1 | None |
| CGC-EVT-071-01 | Event | 71 house | script 1 (`End` only, unreferenced) | none found | apparently unused | 855 S#1 L9-10 | None |
| CGC-EVT-071-02 | Event | 71 house | resident, catching Pokémon (ow0, sprite 330) | talk to ow idx 0 | always | 855 S#2 L12-20; ev68 ow0; 554 m0 | DLG-071-02a |
| CGC-EVT-071-W0 | Event | 71 house | warp out to Cherrygrove City (4,8) | step on warp idx 0 | always | ev68 warp0; ev64 warp3 | EVT-067-W3 |
| CGC-DLG-071-02a | Dialogue variant | 71 house | resident (ow0), advice: catch many Pokémon, PC storage, kindness | EVT-071-02 | every talk | 855 S#2 L16; 554 m0 | None |
| CGC-EVT-072-01 | Event | 72 house | script 1 (`End` only, unreferenced) | none found | apparently unused | 856 S#1 L9-10 | None |
| CGC-EVT-072-02 | Event | 72 house | resident, Pokémon gaining experience (ow0, sprite 146) | talk to ow idx 0 | always | 856 S#2 L12-20; ev69 ow0; 555 m0 | DLG-072-02a |
| CGC-EVT-072-03 | Event | 72 house | resident, Pokémon natures (ow1, sprite 319) | talk to ow idx 1 | always | 856 S#3 L22-30; ev69 ow1; 555 m1 | DLG-072-03a |
| CGC-EVT-072-W0 | Event | 72 house | warp out to Cherrygrove City (4,8) | step on warp idx 0 | always | ev69 warp0; ev64 warp4 | EVT-067-W4 |
| CGC-DLG-072-02a | Dialogue variant | 72 house | resident (ow0), Pokémon gain experience and change form | EVT-072-02 | every talk | 856 S#2 L16; 555 m0 | None |
| CGC-DLG-072-03a | Dialogue variant | 72 house | resident (ow1), each Pokémon has a nature | EVT-072-03 | every talk | 856 S#3 L26; 555 m1 | None |

## Map 067 — Cherrygrove City exterior (T21)

### Map 067 reading notes
- **Sources:** `get_events {mapHeader: 67}` (event file 64: 4 spawnables, 6 overworlds, 5 warps, 3 triggers), `get_script {file: 623}` (level script, 1 entry), `get_script {file: 850}` and `project/scripts/0850.script` (11 scripts, 39 functions, 47 actions), `get_text {archive: 550}` (25 messages, indices 0-24), `get_world_data` mapHeader 67 (locationName 127 Cherrygrove City, matrixId 0, scriptFileId 850, levelScriptId 623, textArchiveId 550, eventFileId 64, wildPokemonId 2) and matrix 0 (headers layer). Flag/var names from `~/Programming/hg-engine/armips/include/flags.s` and `vars.s`. Line numbers ("L<n>") are lines of `project/scripts/0850.script` (1038 lines; its first 8 lines are a comment header and blank line that `get_script` does not return). Wild encounter file 2 belongs to hg-engine in builds and is not documented here.
- **Journal:** `list_changes` (34 edits) touches no script file 850, level script 623, text archive 550 or event file 64. The edits that touch related files are noted where they matter: script file 843 (journal ids 17, 30, 31, 32, 34; reader of flag 153, see the flags table), 141 and 145 (ids 18, 19; the global ground-item and hidden-item handlers).
- **Matrix cells:** matrix 0 headers layer at row 12: cells (16,12) and (17,12) both hold header 67; (14,12) holds 36, (15,12) holds 0, (18,12) and (19,12) hold 33 (Route 29). Coordinates below are global tiles (x, y); cell = floor(x / 32), so x 512-543 is cell 16 and x 544-575 is cell 17.
- **`GenderMessage`:** not used in script file 850 (no gendered variants on this map).
- **`CheckFlag n` + `JumpIf EQUAL` = flag n is set; `JumpIf DIFFERENT` = flag clear** (verified reading note from earlier runs). Script 11 (L142-143) is the only `CheckFlag` followed by `JumpIf LESS` in this file; the reading "LESS = flag clear (value 0 is less than 1)" is Inferred from the command order and from the same `CheckFlag 393` / `JumpIf LESS` / `ClearFlag 393` prologue appearing at the top of other photographer map-entry hooks (read in 0092 L11-13; 55 other script files check flag 393); it is not stated by the data.
- **`Overworld.N` = the event-file overworld with owID N** (Inferred; owIDs 0-5 equal the list indices 0-5 here). `Following` = the follower Pokémon; `Player` = the player. `CompareVarValue v n` + `JumpIf DIFFERENT` branches when v != n. `GetPlayerPosition 0x4000 0x4001` writes global X to 0x4000 and Y to 0x4001 (Functions 6 and 20 use 0x8004/0x8005 for the same purpose; Script 4 uses 0x4000/0x4001).
- **`CheckBadge n`:** result 1 = badge n held, 0 = not held (verified reading note). **`CheckItemSpace item qty var`:** result 0 = no room (the script's own branch to the "no room" message supports this). **`CheckStarter 0x800C`:** its result is compared with 152 and 155; those are the species ids of CHIKORITA (152) and CYNDAQUIL (155) as `get_trainer` reports species ids, so the command is read as "the player's starter species" (Inferred from the command name and those compares).
- **Undecoded or only name-decoded commands (effect read from the surrounding script only; Unresolved):** `MecScript` (scripts 3 and 4), `SetTextBoard 2 0` (script 6), `BoardMessage 24 0x800C` (script 6), `SetIconBoard 23 0 12 0x800C` (script 7), `SetFollowingPokeMovement 48 / 55 / 56`, `LockFollowingPoke 0 / 1`, `WaitFollowingPoke`, `DoorAnimation 17 12 14 17 77` (its four position arguments equal warp 3's matrix cell (17,12) and tile (14,17), Inferred), `OpenTouchScreen`, `YesNoTouchScreen`, `CloseTouchScreen`, `CheckAlbumPhoto`, `TakePhoto 1`, `GiveShoes`, `CheckStarter`, `SetOWPosition Overworld.N x z y dir` (argument roles Inferred from use), `AddOW` / `RemoveOW`. `UpgradePokegear 1` is documented in `docs/scripting-reference.md` line 244 as the legacy name of `RegisterPokegearCard module=1` ("adds the worldmap").
- **Common scripts called (by id; behaviour not documented here):** 2000 = GLB-RTN-2000; 2031 = GLB-RTN-2031; 2033 = GLB-RTN-2033; 2037 = GLB-RTN-2037; 2038 = GLB-RTN-2038; 2070 = GLB-RTN-2070; 2071 = GLB-RTN-2071 (id = 2000 + 0-based position in script file 3; the working ROM holds the vanilla file 3, which hg-engine regenerates at build). Ground items (7000+) are not used on this map; the two hidden items (8001, 8225) go through GLB-RTN-HIDDENITEM.
- **Text archives:** all 23 messages the local commands read come from the map's own archive 550 (`Message n`). Script 10 (the photographer) reads its text with `GetCommonMessageArchive 2 0x800C` + `MessageFromArchive 0x800C <idx>` (indices 0, 1, 2, 3, 5). Argument 2 maps to text archive 30 according to `docs/mr-paint-appraisal.md` (Inferred), and the same indices are read by many other script files (49 other script files call `GetCommonMessageArchive 2`; 44 of them read archive index 0; script files 0048 and 0092 read exactly the indices 0, 1, 2, 3 and 5, checked by grep), so that text is global: GLB-PRM-30-0, -1, -2, -3 and -5 (confirmed by text fit through the GLB titles). It is not documented here.
- **Other headers' text archives:** header 68 uses archive 551, 69 uses 552, 70 uses 553, 71 uses 554, 72 uses 555, 144 uses archive 3 (from `get_world_data`); archive 550 is therefore read only by this header among the Cherrygrove headers (headers elsewhere in the game were not enumerated; Inferred).
- **Day-of-week value:** `GetDayOfWeek` is read as 0 = Sunday elsewhere in the project (`docs/mr-paint-appraisal.md`), so values 1, 3, 5 are Monday, Wednesday, Friday (Inferred).
- **Comparison of the working disassembly with the live reader:** see Verification performed in the tail of this document and the report of this section: `get_script {file: 850}` was compared command for command with `project/scripts/0850.script` for Scripts 1-11 and Functions 1-38 (plus the first part of Function 39); the file has exactly 7 more lines than `get_script` reports, which is the comment header. Actions 1-47 and the tail of Function 39 were not compared line by line.

### Map 067 event inventory
Every entry maps to a record in this section. Coordinates are global tiles (x, y).

| Section | Idx | Type | owID / sprite (overlayTableEntry) | Coordinates | Flag (hides when set) | scriptNumber | Covered by |
|---|---|---|---|---|---|---|---|
| spawnable | 0 | Board, any direction | - | 556,401 | - | 6 | CGC-EVT-067-06 |
| spawnable | 1 | Board, any direction | - | 554,396 | - | 7 | CGC-EVT-067-07 |
| spawnable | 2 | HiddenItem, any direction | - | 572,390 | - | 8001 | CGC-EVT-067-S2 |
| spawnable | 3 | HiddenItem, any direction | - | 522,388 | - | 8225 | CGC-EVT-067-S3 |
| overworld | 0 | Normal, movement 15 face down, orient 1 | owID 0 / 330 | 566,396 | 408 | 1 | CGC-EVT-067-01 (actor of CGC-EVT-067-02 and CGC-EVT-067-03) |
| overworld | 1 | Normal, movement 3 wander all directions (yRange 1), orient 2 | owID 1 / 146 | 554,399 | 0 | 8 | CGC-EVT-067-08 |
| overworld | 2 | Normal, movement 5 walk left/right (xRange 1), orient 3 | owID 2 / 325 | 561,407 | 0 | 9 | CGC-EVT-067-09 |
| overworld | 3 | Normal, movement 17 face right, orient 3 | owID 3 / 332 | 530,406 | 0 | 5 | CGC-EVT-067-05 |
| overworld | 4 | Normal, movement 0, orient 1 | owID 4 / 148 | 575,384 | 412 | 0 (none) | CGC-EVT-067-O4 (actor of CGC-EVT-067-04) |
| overworld | 5 | Normal, movement 14 face up, orient 0 | owID 5 / 328 | 562,402 | 638 | 10 | CGC-EVT-067-10 |
| warp | 0 | to header 69, anchor 0, height 0 | - | 564,391 | - | - | CGC-EVT-067-W0 |
| warp | 1 | to header 68, anchor 0, height 0 | - | 555,391 | - | - | CGC-EVT-067-W1 |
| warp | 2 | to header 70, anchor 0, height 0 | - | 547,399 | - | - | CGC-EVT-067-W2 |
| warp | 3 | to header 71, anchor 0, height 0 | - | 558,401 | - | - | CGC-EVT-067-W3 |
| warp | 4 | to header 72, anchor 0, height 0 | - | 567,405 | - | - | CGC-EVT-067-W4 |
| trigger | 0 | rect 1x4, var 16499 (0x4073) == 0 | - | 566,397 | - | 2 | CGC-EVT-067-02 |
| trigger | 1 | rect 1x4, var 16499 (0x4073) == 3 | - | 575,398 | - | 4 | CGC-EVT-067-04 |
| trigger | 2 | rect 4x1, var 16499 (0x4073) == 1 | - | 547,385 | - | 3 | CGC-EVT-067-03 |
| level script 623 | 1 | mapChange | - | - | - | 11 | CGC-EVT-067-LS (script: CGC-EVT-067-11) |

Text archive 550 coverage (25 messages, indices 0-24, none blank): 0 -> CGC-DLG-067-02a; 1 -> 02b; 2 -> 02c; 3 -> 02d; 4 -> 02e; 5 -> 02f; 6 -> 02g; 7 -> 02h; 8 -> 02i; 9 -> 03a; 10 -> 03b; 11 -> 03c; 12 -> 03d; 13 -> 04a; 14 -> 04b; 15 -> 04c; 16 -> CGC-DLG-067-U16 (unreferenced); 17 -> 09a; 18 -> CGC-DLG-067-U18 (unreferenced); 19 -> 08a; 20 -> 05a; 21 -> 05b; 22 -> 05c; 23 -> 07a (Inferred link); 24 -> 06a. Script 1 has no text; script 10 (photographer) reads only global text.

Facts read off the inventory: the five warps go to headers 69 (Pokémon Center), 68 (mart), 70, 71 and 72 (houses) in that order; warp 3 (558,401) is also the door position named by `DoorAnimation 17 12 14 17 77` in the Guide Gent tour (Inferred, see reading notes), so header 71 is the Guide Gent's house. Overworlds 1-3 and 5 are the only talk targets with scripts; overworld 4 has `scriptNumber` 0 and is only an actor. Hidden item 2 at (572,390) is also present, with the same coordinates and `scriptNumber` 8001, in event file 30 (Route 29, header 33) spawnable 2 (compared with `get_events {mapHeader: 33}`); the tile lies in matrix cell (17,12), which the headers layer assigns to header 67. No overworld is a trainer-type object (all type Normal, sightRange 0); the one battle is started from script 4.

### Map 067 flags and variables (readers and writers)
Search basis: every `project/scripts/*.script` (497 files pulled from the working ROM) by decimal flag number or hex/decimal var, plus level script 623 and this event file's `flag` fields. Level scripts and event-file `flag` fields of other maps were not searched. Header resolution of other script files uses `get_world_data` and the New Bark Town document's table of script files.

| Name (flags.s / vars.s) | Number | Read by | Written by |
|---|---|---|---|
| FLAG_HIDE_CHERRYGROVE_GUIDE_GENT | 408 | event file 64 overworld 0 (hide flag) | set: 0850 L331 (F19), L504 (F30), L528 (F31), L706 (F39); cleared: 0850 L29 (script 3). No other script file. Touched only locally. Not set by the new-game init file 0149 (its list of SetFlag lines does not contain 408), so it starts clear (Inferred: flags start clear) |
| FLAG_HIDE_CHERRYGROVE_RIVAL | 412 | event file 64 overworld 4 (hide flag) | set: 0850 L614 (F37), L624 (F38); 0149 L16 (no header uses file 0149, per the New Bark Town document); cleared: 0229 L212 (header 143, R30R0201, Route 30 interior) |
| VAR_SCENE_CHERRYGROVE_CITY_OW | 16499 (0x4073) | event file 64 triggers 0 (== 0), 2 (== 1), 1 (== 3); no script reads it (grep of `0x4073` and `16499`); level script 623 has no `variableValue` entry | set: 0850 L334 (2, F19), L509 (1, F30), L531 (2, F31), L617 (4, F37), L627 (4, F38), L711 (1, F39); 0229 L211 (3, header 143) |
| FLAG_MET_PASSERBY_BOY | 153 | 0843 L704 (Function 22 of the Elm's Lab file, header 61 T20R0101; as the current disassembly reads) | set: 0850 L618 (F37), L628 (F38); no clear found |
| FLAG_GOT_MYSTIC_WATER_FROM_CHERRYGROVE_CITY_MAN | 243 | 0850 L62 | set: 0850 L71. Touched only locally |
| FLAG_HIDE_CAMERON | 638 | event file 64 overworld 5 (hide flag) | set/cleared in this file: set L272 (F13), L398 (F25); cleared L402 (F26). The same flag is set or cleared in 44 other script files (the photographer's map-entry hooks): 0013, 0025, 0037, 0048, 0054, 0059, 0065, 0076, 0081, 0092, 0099, 0105, 0112, 0116, 0122, 0168, 0199, 0202, 0212, 0218, 0232, 0237, 0240, 0242, 0249, 0258, 0261, 0735, 0741, 0750, 0755, 0758, 0776, 0785, 0790, 0807, 0827, 0842, 0911, 0919, 0920, 0941, 0949, 0961. Resolved headers (from the New Bark Town document and the Route 29 document): 0054 = 491 (D24R0217), 0059 = 114, 0065 = 224, 0076 = 272, 0081 = 411, 0092 = 117, 0105 = 122, 0112 = 288, 0116 = 174, 0122 = 280, 0168 = 9 (R01), 0199 = 20 (R12), 0237 = 38 (R34), 0249 = 43 (R39), 0261 = 152 (R48), 0735 = 49 (T01), 0842 = 60 (T20), 0232 = Route 32, 0920 = 78 (T27), 0941 = 89 (T30), 0099 = 120 (D39R0101, Ice Path; `get_world_data mapHeader 120` gives scriptFileId 99, re-check 2026-10-13). The remaining files' headers were not resolved (Unresolved; an earlier draft gave 0099 = header 121, which is wrong: header 121 uses script file 139). Each map has its own overworld hiding on this flag number, so the flag is shared across all photographer maps (Inferred) |
| FLAG_UNK_189 | 393 | 0850 L142 (script 11) | set/cleared in this file: set L246 (F12), L382 (F24), L569 (F34); cleared L144 (script 11), L253, L389, L576. The same flag number is checked, set and cleared in 55 other script files (the photographer scenes); not resolved to headers (Unresolved) |
| temporaries | 0x4000, 0x4001, 0x8004, 0x8005, 0x800C | script-local | player position (0x4000/0x4001 and 0x8004/0x8005), badge/day results (0x4000), `CheckStarter`, `CheckBattleIsLost`, `CheckItemSpace`, `GetPlayerDirection`, `CheckAlbumPhoto`, `CheckPokemonAlive`, yes/no results (0x800C); item id and quantity for the Mystic Water check (0x8004 = 243, 0x8005 = 1) |

Notes on the table: the trigger variable 0x4073 is written by exactly two script files, this one (values 1, 2, 4) and 0229 (value 3, the Mr. Pokémon scene); the sequence of values (0 start, 1 after the Guide Gent tour, 2 after the Pokégear scene, 3 from Mr. Pokémon's house, 4 after the rival scene) is read off those writes and the three trigger conditions and is not a statement about story order. Flags 408 and 243 are touched only by script file 850 and the event file; the other flags and the variable are shared with the files listed.

### Map 067 event records

#### CGC-EVT-067-01 — Guide Gent talk script (script 1, empty)
##### Record identity
- **Record ID:** CGC-EVT-067-01
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-067-02, CGC-EVT-067-03 (the scenes that use the same actor)
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Talk-to object, event file 64 overworld idx 0 (owID 0, sprite 330, at 566,396, movement 15 face down, orient 1, hide flag 408, scriptNumber 1)
- **Source references:** script file 850 Script#1 (L9-10: `End` only); event file 64 overworld idx 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Player talks to overworld idx 0 while it is visible (flag 408 clear).
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable as a trigger, with no visible effect.
- **OLD event sequence:** (1) Interaction. (2) `End`. (3) None. (4) No `LockAll`, `FacePlayer`, message, movement or sound. (5)-(7) None; no global calls.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction does nothing.
- **OLD dependencies and shared-resource effects:** Overworld idx 0 is the actor of CGC-EVT-067-02 (it is placed at 566,396 until the tour removes it and sets flag 408) and of CGC-EVT-067-03 (re-added then removed again). Its hide flag 408 is written only in script file 850.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 850 Script#1; event file 64 overworld idx 0 `scriptNumber`
- **Other affected callers or records:** CGC-EVT-067-02 and CGC-EVT-067-03 (same actor and hide flag).
- **Unresolved questions:** Whether the player can in practice reach the Guide Gent while he is visible and talk to him before trigger T0 fires (not established from the data).
- **Validation needed:** In-game: start a new game to this point and try to talk to the Guide Gent. Static inspection only, no runtime test.

#### CGC-EVT-067-LS — Level script 623 (map-change hook)
##### Record identity
- **Record ID:** CGC-EVT-067-LS
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-067-11
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Level script file 623 (one entry)
- **Source references:** `get_script {file: 623}` (8 bytes, 1 entry: mapChange, scriptId 11); header 67 `levelScriptId` 623
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Entry 1: `mapChange`, scriptId 11.
- **OLD conditions and branch priority:** No condition; the only entry (no `variableValue` entry, so var 0x4073 is watched only by the event-file triggers).
- **OLD event sequence:** (1) Map change. (2) Script 11 of file 850 (CGC-EVT-067-11). (3)-(7) None of its own.
- **OLD state changes:** None of its own.
- **OLD repeat/completion behavior:** Every map change.
- **OLD dependencies and shared-resource effects:** Runs CGC-EVT-067-11.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** level script file 623 (replaced whole by `set_script levelScript`)
- **Other affected callers or records:** CGC-EVT-067-11.
- **Unresolved questions:** Evaluation timing of the map-change hook relative to object spawning is engine behaviour and not verified.
- **Validation needed:** Re-read the whole trigger list before any write (a level script is replaced wholesale). Static inspection only, no runtime test.

#### CGC-EVT-067-02 — Guide Gent meets the player and tours the town (script 2, trigger T0)
##### Record identity
- **Record ID:** CGC-EVT-067-02
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-067-02a, CGC-DLG-067-02b, CGC-DLG-067-02c, CGC-DLG-067-02d, CGC-DLG-067-02e, CGC-DLG-067-02f, CGC-DLG-067-02g, CGC-DLG-067-02h, CGC-DLG-067-02i; CGC-EVT-067-01, CGC-EVT-067-03; GLB-RTN-2037, GLB-RTN-2038
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Step trigger, event file 64 trigger idx 0 (rect x 566, y 397-400, 1x4, var 16499 == 0); actor: overworld idx 0 (owID 0, Guide Gent per flag name and message text)
- **Source references:** script file 850 Script#2 (L12-22), Functions #1 (L148-153), #14 (L275-280), #27 (L405-419), #2 (L154-165), #15 (L281-286), #28 (L420-425), #35 (L584-601), #16 (L287-301), #29 (L426-432), #36 (L602-608), #39 (L631-713), #30 (L433-511); Actions #1, #2, #8-#11, #15-#18, #24-#36, #42-#44, #46-#47; event file 64 trigger idx 0
- **Evidence status:** Verified (commands, branches, ids, text); Inferred (the grouping of Function#39 as the y 400 variant of the same tour, and the player-name buffer); Unresolved (effects of the undecoded commands)
##### OLD — Current content
- **OLD dialogue:** Nine local messages in order of first use: CGC-DLG-067-02a (msg 0, rookie opener), 02b (msg 1, Running Shoes remark), 02c (msg 2, Pokémon Center), 02d (msg 3, Mart), 02e (msg 4, Route 30), 02f (msg 5, the sea), 02g (msg 6, the house and the Running Shoes), 02h (msg 7, shoes received), 02i (msg 8, how to sprint).
- **OLD raw message data:** See the nine dialogue records. Message indices of archive 550, in script order: 0, 1, 2, 3, 4, 5, 6, 7, 8.
- **OLD trigger:** The player walks onto trigger T0 (global x 566, y 397-400, 1 wide, 4 high) while var 16499 (0x4073) equals 0. Direct check: only that var (the trigger's own condition). No flag is read by the script before it starts.
- **OLD conditions and branch priority:** None of the dialogue is conditional. Movement branches on the player's row `0x4001` (from `GetPlayerPosition`, L16): Script#2 compares it with 397, then Function#1 with 398, Function#14 with 399, Function#27 with 400; each match moves overworld 0 south by 0 (Action#2, a delay), 1 (Action#8), 2 (Action#15) or 3 (Action#24) tiles; any other row falls through to Function#2 with no walk (not reachable from a 4-row trigger, Inferred). Function#2 then reads the row again and picks the exclamation walk (Actions #10, #16, #25, #42 for rows 397-400; Functions #15, #28, #35, #16); Function#16, #29, #36 and #39 pick the position-specific approach (Actions #17/#18 for 397, #26/#27 for 398, #43/#44 for 399, #46/#47 for 400, which includes the tour inline: L631-635 are its own row-400 compare and Actions #46/#47, and L636-713 copy Function#30 L434-510). Reachability: Referenced and apparently reachable once.
- **OLD event sequence:** (1) Step onto T0 with var 0x4073 == 0. (2) `Lock Overworld.0`; overworld 0 Action#1 (exclamation); `WaitMovement`; `CommonScript 2037` (GLB-RTN-2037); `GetPlayerPosition`; row-dependent walk (see branches); `Movement Player Action#9` (face north), `WaitMovement`; Message 0 (02a), `CloseMessage`; `TextPlayerName 0`; row-dependent second walk; `WaitMovement`; Player Action#11 (face west); Message 1 (02b), `CloseMessage`; follower commands (`LockFollowingPoke 0`, `WaitFollowingPoke`, `SetFollowingPokeMovement 55`); approach Actions as above; Function#30: `WaitMovement`, follower unlock (`LockFollowingPoke 1`, `SetFollowingPokeMovement 48`), Message 2 (02c), `CloseMessage`, walk (Actions #28 and #29), `WaitMovement`, Message 3 (02d), `CloseMessage`, walk (Actions #30 and #31), Message 4 (02e), `CloseMessage`, walk (Actions #32 and #33), `PlayFanfare SEQ_SE_GS_N_UMIBE`, Message 5 (02f), `CloseMessage`, `StopFanfare SEQ_SE_GS_N_UMIBE`, walk (Actions #34 and #35), `WaitMovement`, Message 6 (02g), `GiveShoes`, `TextPlayerName 0`, Message 7 (02h), `PlaySound SEQ_ME_ITEM`, `WaitSound`, Message 8 (02i), `CloseMessage`. (3) No choices. (4) The Guide Gent walks north 2 (Action#36), `DoorAnimation 17 12 14 17 77`, `OpenDoor 77`, `WaitDoor 77`, walks north 2 again, `Release Overworld.0`, `Release Following`, `PlayFanfare SEQ_SE_DP_KAIDAN2`, `RemoveOW Overworld.0`, `WaitFanfare SEQ_SE_DP_KAIDAN2`, `SetFlag 408`, `CloseDoor 77`, `WaitDoor 77`, `FreeDoor 77`, `CommonScript 2038` (GLB-RTN-2038). (5) Running Shoes given (`GiveShoes`); flag 408 set; var 0x4073 set to 1. (6) `End`; the trigger cannot fire again because it needs var 0x4073 == 0; no `ReleaseAll` appears in this script. (7) GLB-RTN-2037, GLB-RTN-2038.
- **OLD state changes:** `GiveShoes` (Running Shoes); flag 408 set (L504, or L706 on the row-400 path); `SetVar 0x4073 1` (L509, L711).
- **OLD repeat/completion behavior:** Plays once; its exit condition (var 0x4073 != 0) is also the entry condition of CGC-EVT-067-03 (var == 1).
- **OLD dependencies and shared-resource effects:** Var 0x4073 is shared with scripts 3 and 4 of this file and with script file 0229 (value 3). Flag 408 is local. Calls GLB-RTN-2037 and GLB-RTN-2038 (common script file, regenerated by hg-engine at build).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 850 Script#2 and Functions #1, #2, #14-#16, #27-#30, #35, #36, #39; Actions #1, #2, #8-#11, #15-#18, #24-#36, #42-#44, #46, #47; event file 64 trigger idx 0; text archive 550 msgs 0-8
- **Other affected callers or records:** CGC-EVT-067-03 (starts when var 0x4073 == 1 after this one); script file 0229 writes the same var (value 3); GLB-RTN-2037, GLB-RTN-2038. Shared movement data in 0850: Action#1 is also used by Script#4 (L43, CGC-EVT-067-04; this record uses it at L14) and Action#11 is also used by CGC-EVT-067-03 (L176, L307, L313; this record at L289, L589), so editing either Action changes both events.
- **Unresolved questions:** Effects of the undecoded commands (`GiveShoes`, `DoorAnimation`, follower commands, `SetFollowingPokeMovement 48/55`). Why Function#39 duplicates Function#30. Where Mom's or the story's order places this scene (not stated by the data).
- **Validation needed:** In-game: step on each of the four rows of the trigger and watch that all tours end with the same dialogue; check the Running Shoes appear in the Bag or the sprint works. Static inspection only, no runtime test.

#### CGC-DLG-067-02a — "You're a rookie Trainer, aren't you?"
##### Record identity
- **Record ID:** CGC-DLG-067-02a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-02
- **Related record IDs:** CGC-EVT-067-02; CGC-DLG-067-02b, 02c, 02d, 02e, 02f, 02g, 02h, 02i
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Guide Gent (event file 64 overworld idx 0, owID 0); speaker not named in the text
- **Source references:** script file 850 Script#2 → Function#2 `Message 0` (L157); also Function#27 (L411); text archive 550 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `You’re a rookie Trainer, aren’t you? / I can tell! [scroll] That’s OK! Everyone is a rookie / at some point! [scroll] If you’d like, I can teach you a / few things. [new box] OK, then! Follow me! [scroll]`
- **OLD raw message data:** `You’re a rookie Trainer, aren’t you?\nI can tell!\rThat’s OK! Everyone is a rookie\nat some point!\rIf you’d like, I can teach you a\nfew things.\fOK, then! Follow me!\r`
- **OLD trigger:** Shown by CGC-EVT-067-02 after the Guide Gent walks up to the player.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable (two call sites in the row-dependent paths, L157 and L411).
- **OLD event sequence:** Step (2) of the parent sequence: first message, then `CloseMessage`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once (the parent runs once).
- **OLD dependencies and shared-resource effects:** Archive 550 is the map's own archive (see reading notes); no other script file reads it among the Cherrygrove headers.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 0
- **Other affected callers or records:** Both call sites are in script file 850 (L157, L411). No other script reads text archive 550 (the other Cherrygrove headers use archives 551-555 and 3).
- **Unresolved questions:** None specific.
- **Validation needed:** Text-box fit after any edit; in game at the start of the town.

#### CGC-DLG-067-02b — "Ohh... I'm sorry. I forgot that you weren't wearing the Running Shoes!"
##### Record identity
- **Record ID:** CGC-DLG-067-02b
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-02
- **Related record IDs:** CGC-EVT-067-02; CGC-DLG-067-02a, 02c, 02d, 02e, 02f, 02g, 02h, 02i
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Guide Gent (overworld idx 0)
- **Source references:** script file 850 Function#16 `Message 1` (L291); also Function#35 (L591); text archive 550 msg 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Ohh... I’m sorry. / I forgot that you weren’t wearing the [new box] Running Shoes! [scroll] I’ll try to go as slow as possible, so / try keeping up! [scroll]`
- **OLD raw message data:** `Ohh... I’m sorry.\nI forgot that you weren’t wearing the\fRunning Shoes!\rI’ll try to go as slow as possible, so\ntry keeping up!\r`
- **OLD trigger:** Shown by CGC-EVT-067-02 after msg 0 and the second position-dependent walk.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable (two call sites).
- **OLD event sequence:** Step (2): Player Action#11 (face west), message, `CloseMessage`, follower commands, then the approach walk.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Archive 550 (local).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 1
- **Other affected callers or records:** Two call sites in script file 850 (L291, L591). Nothing else reads archive 550.
- **Unresolved questions:** None specific.
- **Validation needed:** Text-box fit after any edit.

#### CGC-DLG-067-02c — "This is a Pokémon Center."
##### Record identity
- **Record ID:** CGC-DLG-067-02c
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-02
- **Related record IDs:** CGC-EVT-067-02; CGC-DLG-067-02a, 02b, 02d, 02e, 02f, 02g, 02h, 02i
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Guide Gent (overworld idx 0)
- **Source references:** script file 850 Function#30 `Message 2` (L438); also Function#39 (L640); text archive 550 msg 2
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `This is a Pokémon Center. They heal / your Pokémon in no time at all. [scroll] You’ll be relying on them a lot, so / you better learn about them. [scroll]`
- **OLD raw message data:** `This is a Pokémon Center. They heal\nyour Pokémon in no time at all.\rYou’ll be relying on them a lot, so\nyou better learn about them.\r`
- **OLD trigger:** Shown by CGC-EVT-067-02 at the first tour stop.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2): follower unlock, message, `CloseMessage`, then the next walk.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Archive 550 (local).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 2
- **Other affected callers or records:** Two call sites (L438, L640), both in script file 850.
- **Unresolved questions:** Which building this refers to is not stated by the data beyond the text (the Pokémon Center warp is warp 0 to header 69).
- **Validation needed:** Text-box fit after any edit.

#### CGC-DLG-067-02d — "This is a Pokémon Mart."
##### Record identity
- **Record ID:** CGC-DLG-067-02d
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-02
- **Related record IDs:** CGC-EVT-067-02; CGC-DLG-067-02a, 02b, 02c, 02e, 02f, 02g, 02h, 02i
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Guide Gent (overworld idx 0)
- **Source references:** script file 850 Function#30 `Message 3` (L449); also Function#39 (L651); text archive 550 msg 3
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `This is a Pokémon Mart. / They sell Poké Balls for catching wild [new box] Pokémon and other useful items. [scroll]`
- **OLD raw message data:** `This is a Pokémon Mart.\nThey sell Poké Balls for catching wild\fPokémon and other useful items.\r`
- **OLD trigger:** Shown by CGC-EVT-067-02 at the second tour stop.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2): follower unlock, message, `CloseMessage`, next walk.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Archive 550 (local).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 3
- **Other affected callers or records:** Two call sites (L449, L651), both in script file 850.
- **Unresolved questions:** None specific.
- **Validation needed:** Text-box fit after any edit.

#### CGC-DLG-067-02e — "Route 30 is out this way."
##### Record identity
- **Record ID:** CGC-DLG-067-02e
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-02
- **Related record IDs:** CGC-EVT-067-02; CGC-DLG-067-02a, 02b, 02c, 02d, 02f, 02g, 02h, 02i
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Guide Gent (overworld idx 0)
- **Source references:** script file 850 Function#30 `Message 4` (L460); also Function#39 (L662); text archive 550 msg 4
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Route 30 is out this way. [scroll] Trainers will be battling their / Pokémon there. [scroll] If you go a little farther, / you’ll see Mr. Pokémon’s House. [scroll]`
- **OLD raw message data:** `Route 30 is out this way.\rTrainers will be battling their\nPokémon there.\rIf you go a little farther,\nyou’ll see Mr. Pokémon’s House.\r`
- **OLD trigger:** Shown by CGC-EVT-067-02 at the third tour stop.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2): follower unlock, message, `CloseMessage`, next walk.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Archive 550 (local). The text names Route 30 and Mr. Pokémon's House.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 4
- **Other affected callers or records:** Two call sites (L460, L662), both in script file 850.
- **Unresolved questions:** None specific.
- **Validation needed:** Text-box fit after any edit.

#### CGC-DLG-067-02f — "This is the sea, as you can see."
##### Record identity
- **Record ID:** CGC-DLG-067-02f
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-02
- **Related record IDs:** CGC-EVT-067-02; CGC-DLG-067-02a, 02b, 02c, 02d, 02e, 02g, 02h, 02i
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Guide Gent (overworld idx 0)
- **Source references:** script file 850 Function#30 `Message 5` (L472); also Function#39 (L674); text archive 550 msg 5
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `This is the sea, as you can see. [scroll] Some Pokémon are found only in water. [scroll]`
- **OLD raw message data:** `This is the sea, as you can see.\rSome Pokémon are found only in water.\r`
- **OLD trigger:** Shown by CGC-EVT-067-02 at the fourth tour stop.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2): `PlayFanfare SEQ_SE_GS_N_UMIBE` runs before the message and `StopFanfare SEQ_SE_GS_N_UMIBE` after `CloseMessage`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Archive 550 (local). The sound effect name suggests a seaside sound (Inferred from the name).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 5
- **Other affected callers or records:** Two call sites (L472, L674), both in script file 850.
- **Unresolved questions:** None specific.
- **Validation needed:** Text-box fit after any edit.

#### CGC-DLG-067-02g — "Here... It's my house! ... Running Shoes!"
##### Record identity
- **Record ID:** CGC-DLG-067-02g
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-02
- **Related record IDs:** CGC-EVT-067-02; CGC-DLG-067-02a, 02b, 02c, 02d, 02e, 02f, 02h, 02i
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Guide Gent (overworld idx 0)
- **Source references:** script file 850 Function#30 `Message 6` (L484), followed by `GiveShoes` (L485); also Function#39 (L686, L687); text archive 550 msg 6
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Here... / It’s my house! [scroll] For your effort keeping up with me, / I’ll give you my Running Shoes! [new box] They’re still warm! [scroll] ... / ... [scroll] Got you, didn’t I? / Don’t worry, these are brand new! [scroll]`
- **OLD raw message data:** `Here...\nIt’s my house!\rFor your effort keeping up with me,\nI’ll give you my Running Shoes!\fThey’re still warm!\r...\n...\rGot you, didn’t I?\nDon’t worry, these are brand new!\r`
- **OLD trigger:** Shown by CGC-EVT-067-02 at the last tour stop (the Guide Gent's house).
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2): message, then `GiveShoes`, `TextPlayerName 0`, msg 7 (02h).
- **OLD state changes:** None by the message; `GiveShoes` follows immediately.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Archive 550 (local).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 6
- **Other affected callers or records:** Two call sites (L484, L686), both in script file 850.
- **Unresolved questions:** None specific.
- **Validation needed:** Text-box fit after any edit.

#### CGC-DLG-067-02h — "{STRVAR_1, 3, 0, 0} received the Running Shoes from the Guide Gent!"
##### Record identity
- **Record ID:** CGC-DLG-067-02h
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-02
- **Related record IDs:** CGC-EVT-067-02; CGC-DLG-067-02a, 02b, 02c, 02d, 02e, 02f, 02g, 02i
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Narration (key-item receipt line)
- **Source references:** script file 850 Function#30 `TextPlayerName 0` (L486), `Message 7` (L487), `PlaySound SEQ_ME_ITEM` (L488); also Function#39 (L688, L689); text archive 550 msg 7
- **Evidence status:** Verified (text, order); Inferred (that `{STRVAR_1, 3, 0, 0}` is the player name from `TextPlayerName 0`)
##### OLD — Current content
- **OLD dialogue:** `{STRVAR_1, 3, 0, 0} received / the Running Shoes from the Guide Gent!`
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0} received\nthe Running Shoes from the Guide Gent!`
- **OLD trigger:** Shown by CGC-EVT-067-02 straight after `GiveShoes`.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2): `TextPlayerName 0`, message, `PlaySound SEQ_ME_ITEM`, `WaitSound`.
- **OLD state changes:** None by the message.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Archive 550 (local). Uses a text buffer token filled by `TextPlayerName 0`.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 7
- **Other affected callers or records:** Two call sites (L487, L689), both in script file 850.
- **Unresolved questions:** The meaning of the token arguments `{STRVAR_1, 3, 0, 0}` is taken from the command order, not from documentation.
- **Validation needed:** Text-box fit after any edit; in game the name must appear.

#### CGC-DLG-067-02i — "The instructions read, 'Touch the Sprint Button...'"
##### Record identity
- **Record ID:** CGC-DLG-067-02i
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-02
- **Related record IDs:** CGC-EVT-067-02; CGC-DLG-067-02a, 02b, 02c, 02d, 02e, 02f, 02g, 02h
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Narration (instruction card)
- **Source references:** script file 850 Function#30 `Message 8` (L490); also Function#39 (L692); text archive 550 msg 8
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `The instructions read, / “Touch the Sprint Button on the [new box] Touch Screen to sprint.” [scroll] It also says, / “Hold the B Button down to sprint.” [scroll]`
- **OLD raw message data:** `The instructions read,\n“Touch the Sprint Button on the\fTouch Screen to sprint.”\rIt also says,\n“Hold the B Button down to sprint.”\r`
- **OLD trigger:** Shown by CGC-EVT-067-02 after the receipt line and fanfare.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2): message, `CloseMessage`, then the Guide Gent walks to his door.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Archive 550 (local).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 8
- **Other affected callers or records:** Two call sites (L490, L692), both in script file 850.
- **Unresolved questions:** None specific.
- **Validation needed:** Text-box fit after any edit.

#### CGC-EVT-067-03 — Guide Gent returns with the Map Card (script 3, trigger T2)
##### Record identity
- **Record ID:** CGC-EVT-067-03
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-067-03a, CGC-DLG-067-03b, CGC-DLG-067-03c, CGC-DLG-067-03d; CGC-EVT-067-02, CGC-EVT-067-01; GLB-RTN-2037, GLB-RTN-2038
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Step trigger, event file 64 trigger idx 2 (rect x 547-550, y 385, 4x1, var 16499 == 1); actor: overworld idx 0 (owID 0, Guide Gent)
- **Source references:** script file 850 Script#3 (L23-38), Functions #3 (L166-171), #4 (L172-178), #17 (L302-309), #18 (L310-315), #19 (L316-336), #31 (L512-532); Actions #3, #4, #11, #19, #20, #37; event file 64 trigger idx 2
- **Evidence status:** Verified (commands, branches, ids, text); Inferred (argument roles of `SetOWPosition`); Unresolved (`MecScript`, `UpgradePokegear` beyond the project documentation)
##### OLD — Current content
- **OLD dialogue:** Four local messages: CGC-DLG-067-03a (msg 9, "I made it..."), 03b (msg 10, Map Card loaded), 03c (msg 11, Town Map available), 03d (msg 12, how to use the Town Map).
- **OLD raw message data:** See the four dialogue records. Message indices of archive 550: 9, 10, 11, 12.
- **OLD trigger:** The player walks onto trigger T2 (x 547-550, y 385) while var 16499 (0x4073) equals 1. Direct check: only that var. The Guide Gent's hide flag 408 is cleared by the script itself.
- **OLD conditions and branch priority:** `MecScript`, `LockAll`. After the first steps, `GetPlayerPosition` gives the player column `0x4000`; `SetOWPosition Overworld.0 0x4000 1 394 Up` places overworld 0 in the player's column at row 394 facing up (argument roles Inferred). Then by column: 549 (Script#3 does not branch) and 550 (Function#3 equal): overworld 0 Action#4 (west 1, north 9, face east), Function#4, player Action#11 (face west), then Function#19; any other column (547 and 548 in the rectangle; Function#3 different, Function#17 then Function#18 different): overworld 0 Action#19 (east 1, north 9, face west), player Action#37 (face east), Function#31. Function#19 and Function#31 hold identical dialogue and ending. Reachability: Referenced and apparently reachable once var 0x4073 == 1.
- **OLD event sequence:** (1) Step onto T2 with var 0x4073 == 1. (2) `MecScript`, `LockAll`; player Action#3 (exclamation, face south); `WaitMovement`; `CommonScript 2037` (GLB-RTN-2037); `ClearFlag 408`; `AddOW Overworld.0`; `Lock Overworld.0`; position and approach walk (above); Message 9 (03a); `TextPlayerName 0`; Message 10 (03b); `PlaySound SEQ_ME_KEYITEM`; `WaitSound`; Message 11 (03c); Message 12 (03d); `CloseMessage`. (3) No choices. (4) Overworld 0 Action#20 (walk south 9); `WaitMovement`; `CommonScript 2038` (GLB-RTN-2038); `Release Overworld.0`; `RemoveOW Overworld.0`. (5) `SetFlag 408`; `UpgradePokegear 1` (documented in `docs/scripting-reference.md` line 244 as adding the worldmap, Town Map card); `ReleaseAll`; `SetVar 0x4073 2`. (6) `End`; the trigger cannot fire again (needs var == 1). (7) GLB-RTN-2037, GLB-RTN-2038.
- **OLD state changes:** Flag 408 cleared (L29) then set again (L331 in Function#19, L528 in Function#31); Pokégear upgrade; var 0x4073 = 2 (L334, L531).
- **OLD repeat/completion behavior:** Plays once.
- **OLD dependencies and shared-resource effects:** Starts only after CGC-EVT-067-02 has set var 0x4073 to 1; var 0x4073 is also written by script file 0229 (3). Flag 408 local. Calls GLB-RTN-2037 (L28) and GLB-RTN-2038 (F19 L328, F31 L525) (common script file, regenerated by hg-engine at build).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 850 Script#3 and Functions #3, #4, #17-#19, #31; event file 64 trigger idx 2; text archive 550 msgs 9-12
- **Other affected callers or records:** CGC-EVT-067-02 (prerequisite var value), CGC-EVT-067-04 (var value 3 is written elsewhere); GLB-RTN-2037, GLB-RTN-2038. Shared movement data in 0850: Action#11 (used here at L176, L307, L313) is also used by CGC-EVT-067-02 (L289, L589).
- **Unresolved questions:** What `MecScript` does. The roles of the `SetOWPosition` arguments. Why Function#19 and Function#31 are separate copies (they differ only in the first lines).
- **Validation needed:** In-game: step on each column of the trigger and check the Pokégear gains the Town Map. Static inspection only, no runtime test.

#### CGC-DLG-067-03a — "...Hffp... Hffp... I made it..."
##### Record identity
- **Record ID:** CGC-DLG-067-03a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-03
- **Related record IDs:** CGC-EVT-067-03; CGC-DLG-067-03b, 03c, 03d
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Guide Gent (overworld idx 0)
- **Source references:** script file 850 Function#19 `Message 9` (L318); also Function#31 (L515); text archive 550 msg 9
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `...Hffp... Hffp... / I made it... [scroll] I forgot about one thing. / This is another token from me! [scroll] Take it. [scroll]`
- **OLD raw message data:** `...Hffp... Hffp...\nI made it...\rI forgot about one thing.\nThis is another token from me!\rTake it.\r`
- **OLD trigger:** Shown by CGC-EVT-067-03 after the Guide Gent catches up with the player.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2): message, then `TextPlayerName 0`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Archive 550 (local).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 9
- **Other affected callers or records:** Two call sites (L318, L515), both in script file 850.
- **Unresolved questions:** None specific.
- **Validation needed:** Text-box fit after any edit.

#### CGC-DLG-067-03b — "The Guide Gent loaded the Map Card on {STRVAR_1, 3, 0, 0}'s Pokégear!"
##### Record identity
- **Record ID:** CGC-DLG-067-03b
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-03
- **Related record IDs:** CGC-EVT-067-03; CGC-DLG-067-03a, 03c, 03d
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Narration (key-item receipt line)
- **Source references:** script file 850 Function#19 `TextPlayerName 0` (L319), `Message 10` (L320), `PlaySound SEQ_ME_KEYITEM` (L321); also Function#31 (L516, L517); text archive 550 msg 10
- **Evidence status:** Verified (text, order); Inferred (that the token is the player name)
##### OLD — Current content
- **OLD dialogue:** `The Guide Gent loaded the Map Card / on {STRVAR_1, 3, 0, 0}’s Pokégear!`
- **OLD raw message data:** `The Guide Gent loaded the Map Card\non {STRVAR_1, 3, 0, 0}’s Pokégear!`
- **OLD trigger:** Shown by CGC-EVT-067-03 after msg 9.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2): message, `PlaySound SEQ_ME_KEYITEM`, `WaitSound`.
- **OLD state changes:** None by the message; `UpgradePokegear 1` runs later in the same script.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Archive 550 (local).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 10
- **Other affected callers or records:** Two call sites (L320, L517), both in script file 850.
- **Unresolved questions:** None specific.
- **Validation needed:** Text-box fit after any edit; the name must appear.

#### CGC-DLG-067-03c — "{STRVAR_1, 3, 0, 0}'s Pokégear can now show the Town Map!"
##### Record identity
- **Record ID:** CGC-DLG-067-03c
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-03
- **Related record IDs:** CGC-EVT-067-03; CGC-DLG-067-03a, 03b, 03d
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Narration
- **Source references:** script file 850 Function#19 `Message 11` (L323); also Function#31 (L520); text archive 550 msg 11
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `{STRVAR_1, 3, 0, 0}’s Pokégear / can now show the Town Map! [scroll]`
- **OLD raw message data:** `{STRVAR_1, 3, 0, 0}’s Pokégear\ncan now show the Town Map!\r`
- **OLD trigger:** Shown by CGC-EVT-067-03 right after msg 10 and its jingle.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2): message directly followed by msg 12.
- **OLD state changes:** None by the message.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Archive 550 (local). Reuses the buffer filled by `TextPlayerName 0` for msg 10.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 11
- **Other affected callers or records:** Two call sites (L323, L520), both in script file 850.
- **Unresolved questions:** None specific.
- **Validation needed:** Text-box fit after any edit.

#### CGC-DLG-067-03d — "Select the Pokégear on the Touch Screen and then select the Town Map icon."
##### Record identity
- **Record ID:** CGC-DLG-067-03d
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-03
- **Related record IDs:** CGC-EVT-067-03; CGC-DLG-067-03a, 03b, 03c
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Guide Gent (overworld idx 0)
- **Source references:** script file 850 Function#19 `Message 12` (L324); also Function#31 (L521); text archive 550 msg 12
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Select the Pokégear on the / Touch Screen and then select [new box] the Town Map icon. [scroll] You’ll see the map of the region / you’re currently in! [scroll] The Pokégear becomes more useful as / you add Cards. [scroll] I wish you luck on your journey! [scroll]`
- **OLD raw message data:** `Select the Pokégear on the\nTouch Screen and then select\fthe Town Map icon.\rYou’ll see the map of the region\nyou’re currently in!\rThe Pokégear becomes more useful as\nyou add Cards.\rI wish you luck on your journey!\r`
- **OLD trigger:** Shown by CGC-EVT-067-03 as the farewell.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2): message, `CloseMessage`, then the Guide Gent walks south and is removed.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Archive 550 (local).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 12
- **Other affected callers or records:** Two call sites (L324, L521), both in script file 850.
- **Unresolved questions:** None specific.
- **Validation needed:** Text-box fit after any edit.

#### CGC-EVT-067-04 — Rival confronts the player and battles (script 4, trigger T1)
##### Record identity
- **Record ID:** CGC-EVT-067-04
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-067-04a, CGC-DLG-067-04b, CGC-DLG-067-04c; CGC-EVT-067-O4 (the actor); GLB-RTN-2031, GLB-RTN-2070, GLB-RTN-2071; GLB-RTN-TRAINER (general trainer routine; not invoked by this event)
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Step trigger, event file 64 trigger idx 1 (rect x 575, y 398-401, 1x4, var 16499 == 3); actor: overworld idx 4 (owID 4, sprite 148, hide flag 412), the rival (Inferred from the flag name FLAG_HIDE_CHERRYGROVE_RIVAL and the text)
- **Source references:** script file 850 Script#4 (L39-57), Functions #5 (L179-184), #6 (L185-199), #20 (L337-352), #21 (L353-363), #22 (L364-373), #32 (L534-545), #33 (L546-556), #37 (L609-620), #38 (L621-630); Actions #1, #5, #12, #21, #22, #38, #39, #40, #45; event file 64 trigger idx 1 and overworld idx 4; `get_trainer` 495, 496, 497
- **Evidence status:** Verified (commands, branches, ids, text, trainer ids); Inferred (that `CheckStarter` returns the player's starter species and the matching of battle ids to starters); Unresolved (what happens on a lost battle)
##### OLD — Current content
- **OLD dialogue:** Three local messages: CGC-DLG-067-04a (msg 13, before the battle), 04b (msg 14, after the battle), 04c (msg 15, the Trainer Card remark).
- **OLD raw message data:** See the three dialogue records. Message indices of archive 550: 13, 14, 15.
- **OLD trigger:** The player walks onto trigger T1 (x 575, y 398-401) while var 16499 (0x4073) equals 3. Direct check: only that var. The actor (overworld 4) must be visible, i.e. flag 412 clear: indirect prerequisite (the script positions it, so the hide flag is not tested here).
- **OLD conditions and branch priority:** After msg 13, `CheckStarter 0x800C`: if the result equals 152 (CHIKORITA's species id) the battle is trainer 496 (`TRAINER_BOY_496`, L55); else if it equals 155 (CYNDAQUIL's species id; Function#5, L180-182) trainer 497 (`TRAINER_BOY_497`, L182); otherwise (Function#20, L338) trainer 495 (`TRAINER_BOY_495`). All three are trainer class Passerby (id 119), name "Boy", single battle, `TRAINER_NONE` as partner. Verified with `get_trainer` (audit): each has one party member at level 5 (495 CHIKORITA, 496 CYNDAQUIL, 497 TOTODILE), so the compare values above map starter CHIKORITA to trainer 496 (CYNDAQUIL), CYNDAQUIL to 497 (TOTODILE) and any other starter to 495 (CHIKORITA). Trainer data is owned by hg-engine in builds; the rest of the parties' data is not documented here. After the battle the player's row (`GetPlayerPosition 0x8004 0x8005`, `0x8005` compared with 398) picks the player's step (Action#12 or Action#21) and the follower handling (Functions #21 and #22), and the rival's exit walk (Function#32 or #33: Action#38 or #22); after msg 15 the rival's row (`GetOWPosition Overworld.4`, `0x8005` compared with 401) picks the exit (Function#37: Action#45 west 11; or Action#39 then Function#38). Reachability: Referenced and apparently reachable once var 0x4073 == 3 (written only by script file 0229 L211).
- **OLD event sequence:** (1) Step onto T1 with var 0x4073 == 3. (2) `MecScript`, `LockAll`, `FadeOutMusic 0 3`; player Action#1 (exclamation); `WaitMovement`; `CommonScript 2031` (GLB-RTN-2031); `GetPlayerPosition`; `SetOWPosition Overworld.4 583 0 0x4001 Left` (rival placed at x 583 in the player's row facing left; argument roles Inferred); rival Action#5 (west 7); `WaitMovement`; Message 13 (04a); `CloseMessage`; `CheckStarter` and trainer branches above; `TrainerBattle` (the battle is the script's own command, not a trainer-script call); after the battle `CheckBattleIsLost 0x800C` (result not tested afterwards), `CommonScript 2070` (GLB-RTN-2070), Message 14 (04b), `CloseMessage`, `PlayFanfare SEQ_SE_DP_WALL_HIT2`, follower lock/movement (`LockFollowingPoke 0`, `WaitFollowingPoke`, `SetFollowingPokeMovement 56`), row-dependent player step; `WaitMovement`, follower unlock (`LockFollowingPoke 1`, `SetFollowingPokeMovement 48`); rival walk; Message 15 (04c); `CloseMessage`. (3) Starter branch and position branches only; no player choice. (4) Rival walks off (west) and the player turns (Action#40); `WaitMovement`; `RemoveOW Overworld.4`; `SetFlag 412` (rival hidden); `CommonScript 2071` (GLB-RTN-2071); `ReleaseAll`. (5) `SetVar 0x4073 4`; `SetFlag 153` (and flag 412 as set in step 4). (6) `End`; the trigger needs var == 3, so it does not repeat. (7) GLB-RTN-2031, GLB-RTN-2070, GLB-RTN-2071.
- **OLD state changes:** Battle fought (trainer 495, 496 or 497); flag 412 set (L614 or L624); var 0x4073 = 4 (L617 or L627); flag 153 (FLAG_MET_PASSERBY_BOY) set (L618 or L628).
- **OLD repeat/completion behavior:** Plays once. Flag 153 is read by script file 0843 (header 61) L704.
- **OLD dependencies and shared-resource effects:** Var 0x4073 is written by script file 0229 (value 3) before this scene. Trainer ids 495-497 are hg-engine data in builds. GLB-RTN-2031, GLB-RTN-2070 and GLB-RTN-2071 are in the common script file that hg-engine regenerates at build. Flag 412 is also set by file 0149 and cleared by 0229 (L212).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 850 Script#4 and Functions #5, #6, #20-#22, #32, #33, #37, #38; event file 64 trigger idx 1 and overworld idx 4; text archive 550 msgs 13-15; trainers 495-497 (hg-engine data in builds)
- **Other affected callers or records:** Script file 0229 (writes the trigger var value 3 and clears flag 412), file 0149 (sets flag 412), file 0843 (reads flag 153); 0850 Action#1 (used here at L43) is also used by CGC-EVT-067-02 (L14); GLB-RTN-2031, GLB-RTN-2070, GLB-RTN-2071; GLB-RTN-TRAINER is the general trainer routine and is not called by this script.
- **Unresolved questions:** What `MecScript` does. Whether a lost battle returns to this script (no test of `CheckBattleIsLost`'s result follows). The roles of the `SetOWPosition` arguments. Whether the starter-to-trainer pairing is meant as a type counter (the species pairing is Verified above; the intent is not stated by the data).
- **Validation needed:** In-game with each of the three starters; also lose the battle once. Static inspection only, no runtime test.

#### CGC-DLG-067-04a — "...You got a Pokémon at the Lab. What a waste."
##### Record identity
- **Record ID:** CGC-DLG-067-04a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-04
- **Related record IDs:** CGC-EVT-067-04; CGC-DLG-067-04b, 04c
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Rival (overworld idx 4, owID 4); speaker not named in the text
- **Source references:** script file 850 Script#4 `Message 13` (L50); text archive 550 msg 13
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `... [scroll] You got a Pokémon at the Lab. / What a waste. [scroll] That’s a Pokémon that’s too good for / a wimp like you. [scroll] ... / Don’t you get what I’m saying? [scroll] Well, I too have a good Pokémon. / I’ll show you what I mean! [scroll]`
- **OLD raw message data:** `...\rYou got a Pokémon at the Lab.\nWhat a waste.\rThat’s a Pokémon that’s too good for\na wimp like you.\r...\nDon’t you get what I’m saying?\rWell, I too have a good Pokémon.\nI’ll show you what I mean!\r`
- **OLD trigger:** Shown by CGC-EVT-067-04 after the rival has walked up.
- **OLD conditions and branch priority:** None; shown before the starter check. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2): message, `CloseMessage`, then `CheckStarter`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Archive 550 (local).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 13
- **Other affected callers or records:** One call site (L50) in script file 850.
- **Unresolved questions:** None specific.
- **Validation needed:** Text-box fit after any edit.

#### CGC-DLG-067-04b — "...Do you want to know who I am?"
##### Record identity
- **Record ID:** CGC-DLG-067-04b
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-04
- **Related record IDs:** CGC-EVT-067-04; CGC-DLG-067-04a, 04c
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Rival (overworld idx 4)
- **Source references:** script file 850 Function#6 `Message 14` (L188) and Function#20 (L341); text archive 550 msg 14
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `... [scroll] Do you want to know who I am? / ... [scroll] I’m going to be the world’s greatest / Pokémon Trainer. [scroll]`
- **OLD raw message data:** `...\rDo you want to know who I am?\n...\rI’m going to be the world’s greatest\nPokémon Trainer.\r`
- **OLD trigger:** Shown by CGC-EVT-067-04 after the battle and `CommonScript 2070`.
- **OLD conditions and branch priority:** Reached on every battle path (L188 for trainers 496 and 497, L341 for trainer 495). Reachability: Referenced and apparently reachable (the script does not test the battle result).
- **OLD event sequence:** Step (2): message, `CloseMessage`, `PlayFanfare SEQ_SE_DP_WALL_HIT2`, follower handling.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Archive 550 (local). GLB-RTN-2070 runs just before it.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 14
- **Other affected callers or records:** Two call sites (L188, L341) in script file 850.
- **Unresolved questions:** Whether a lost battle reaches this message (see CGC-EVT-067-04).
- **Validation needed:** Text-box fit after any edit.

#### CGC-DLG-067-04c — "Give it back! That's my Trainer Card!"
##### Record identity
- **Record ID:** CGC-DLG-067-04c
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-04
- **Related record IDs:** CGC-EVT-067-04; CGC-DLG-067-04a, 04b
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Rival (overworld idx 4)
- **Source references:** script file 850 Function#32 `Message 15` (L537) and Function#33 (L548); text archive 550 msg 15
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Give it back! / That’s my Trainer Card! [scroll] Oh no! / You saw my name... [scroll]`
- **OLD raw message data:** `Give it back!\nThat’s my Trainer Card!\rOh no!\nYou saw my name...\r`
- **OLD trigger:** Shown by CGC-EVT-067-04 after the rival's second walk.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2): `WaitMovement` (Function#33) or the Action#38 walk (Function#32), message, `CloseMessage`, rival row check and exit walk.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Once.
- **OLD dependencies and shared-resource effects:** Archive 550 (local).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 15
- **Other affected callers or records:** Two call sites (L537, L548) in script file 850.
- **Unresolved questions:** None specific.
- **Validation needed:** Text-box fit after any edit.

#### CGC-EVT-067-05 — NPC offering Mystic Water (script 5)
##### Record identity
- **Record ID:** CGC-EVT-067-05
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-067-05a, CGC-DLG-067-05b, CGC-DLG-067-05c; GLB-RTN-2033
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Talk-to NPC, event file 64 overworld idx 3 (owID 3, sprite 332, at 530,406, movement 17 face right, orient 3, scriptNumber 5)
- **Source references:** script file 850 Script#5 (L58-77), Functions #7 (L200-206), #8 (L207-213); event file 64 overworld idx 3; `lookup_names` item 243 = Mystic Water
- **Evidence status:** Verified (commands, ids, item name); Inferred (that `SetVar 0x8004 243` is the item id given to GLB-RTN-2033 and that result 0 of `CheckItemSpace` means no room)
##### OLD — Current content
- **OLD dialogue:** Three local messages: CGC-DLG-067-05a (msg 20, offer), 05b (msg 21, after-gift or decline line), 05c (msg 22, no room).
- **OLD raw message data:** See the three dialogue records. Message indices of archive 550: 20, 21, 22.
- **OLD trigger:** Player talks to overworld idx 3 (`scriptNumber` 5): `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`. Always visible (hide flag 0).
- **OLD conditions and branch priority:** (a) `CheckFlag 243`: set → Function#7 (msg 21, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`). (b) Else msg 20, `SetVar 0x8004 243`, `SetVar 0x8005 1`, `CheckItemSpace 0x8004 0x8005 0x800C`: result 0 → Function#8 (msg 22, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`; flag 243 is not set, so the offer repeats). (c) Else `CommonScript 2033` (GLB-RTN-2033), `SetFlag 243`, msg 21, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. Direct checks: flag 243 and the bag-space result. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Talk. (2) As above. (3) The offer message carries no yes/no prompt in this script. (4) Fanfare `SEQ_SE_CONFIRM`; player lock; face the player. (5) Mystic Water (item 243) x1 via GLB-RTN-2033; flag 243 set. (6) Once-only gift; later talks give msg 21. (7) GLB-RTN-2033.
- **OLD state changes:** Mystic Water x1 (item 243, quantity 1) given; flag 243 (FLAG_GOT_MYSTIC_WATER_FROM_CHERRYGROVE_CITY_MAN) set.
- **OLD repeat/completion behavior:** Gift once; repeatable no-room branch until the bag has space.
- **OLD dependencies and shared-resource effects:** Flag 243 is touched only by script file 850. GLB-RTN-2033 is in the common script file that hg-engine regenerates at build.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 850 Script#5 and Functions #7, #8; event file 64 overworld idx 3; text archive 550 msgs 20-22
- **Other affected callers or records:** GLB-RTN-2033; nothing else reads flag 243.
- **Unresolved questions:** None beyond the Inferred item-id hand-over to GLB-RTN-2033 (the text says Mystic Water and `lookup_names` agrees that item 243 is Mystic Water).
- **Validation needed:** In-game: talk with and without bag space, then talk again. Static inspection only, no runtime test.

#### CGC-DLG-067-05a — "A Pokémon I caught had an item. I think it's Mystic Water."
##### Record identity
- **Record ID:** CGC-DLG-067-05a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-05
- **Related record IDs:** CGC-EVT-067-05; CGC-DLG-067-05b, 05c
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** NPC at 530,406 (overworld idx 3)
- **Source references:** script file 850 Script#5 `Message 20` (L64); text archive 550 msg 20
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `A Pokémon I caught had an item. / I think it’s Mystic Water. [scroll] I don’t need it, so do you want it? [scroll]`
- **OLD raw message data:** `A Pokémon I caught had an item.\nI think it’s Mystic Water.\rI don’t need it, so do you want it?\r`
- **OLD trigger:** Shown by CGC-EVT-067-05 when flag 243 is clear.
- **OLD conditions and branch priority:** Flag 243 clear. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent: the message, then the bag-space check.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats while the gift is not given.
- **OLD dependencies and shared-resource effects:** Archive 550 (local).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 20
- **Other affected callers or records:** One call site (L64) in script file 850.
- **Unresolved questions:** None specific.
- **Validation needed:** Text-box fit after any edit.

#### CGC-DLG-067-05b — "Back to fishing for me, then."
##### Record identity
- **Record ID:** CGC-DLG-067-05b
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-05
- **Related record IDs:** CGC-EVT-067-05; CGC-DLG-067-05a, 05c
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** NPC at 530,406 (overworld idx 3)
- **Source references:** script file 850 Script#5 `Message 21` (L72) and Function#7 (L201); text archive 550 msg 21
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Back to fishing for me, then.`
- **OLD raw message data:** `Back to fishing for me, then.`
- **OLD trigger:** Shown by CGC-EVT-067-05 after the gift (L72) and on every later talk once flag 243 is set (Function#7, L201).
- **OLD conditions and branch priority:** Two paths: right after the gift (flag 243 just set), and on later talks (flag 243 set). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2): message, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** Archive 550 (local).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 21
- **Other affected callers or records:** Two call sites (L72, L201) in script file 850.
- **Unresolved questions:** None specific.
- **Validation needed:** Text-box fit after any edit.

#### CGC-DLG-067-05c — "You don't have room for this."
##### Record identity
- **Record ID:** CGC-DLG-067-05c
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-05
- **Related record IDs:** CGC-EVT-067-05; CGC-DLG-067-05a, 05b
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** NPC at 530,406 (overworld idx 3)
- **Source references:** script file 850 Function#8 `Message 22` (L208); text archive 550 msg 22
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `You don’t have room for this.`
- **OLD raw message data:** `You don’t have room for this.`
- **OLD trigger:** Shown by CGC-EVT-067-05 when `CheckItemSpace` returns 0.
- **OLD conditions and branch priority:** Flag 243 clear and no bag space. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2): message, `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeats until the player has room.
- **OLD dependencies and shared-resource effects:** Archive 550 (local).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 22
- **Other affected callers or records:** One call site (L208) in script file 850.
- **Unresolved questions:** None specific.
- **Validation needed:** Text-box fit after any edit.

#### CGC-EVT-067-06 — Board "Guide Gent's House" (script 6, spawnable S0)
##### Record identity
- **Record ID:** CGC-EVT-067-06
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-067-06a; CGC-EVT-067-07; GLB-RTN-2000
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Board at global (556,401), event file 64 spawnable idx 0 (type Board, scriptNumber 6, dir 4 any direction)
- **Source references:** script file 850 Script#6 (L78-85); event file 64 spawnable 0; text archive 550 msg 24
- **Evidence status:** Verified (commands); Inferred (that `BoardMessage 24` reads message 24; supported by the text fit)
##### OLD — Current content
- **OLD dialogue:** The board text is msg 24 (CGC-DLG-067-06a).
- **OLD raw message data:** See CGC-DLG-067-06a.
- **OLD trigger:** Player reads the board from any direction.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Interaction. (2) `SetTextBoard 2 0`; `ShowBoard 3`; `WaitBoard`; `BoardMessage 24 0x800C`; `CommonScript 2000` (GLB-RTN-2000); `End`. (3) None. (4) Board display commands only; no `LockAll`/`ReleaseAll`. (5) None. (6) Every interaction. (7) GLB-RTN-2000.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction.
- **OLD dependencies and shared-resource effects:** GLB-RTN-2000 (common script file, regenerated by hg-engine at build). The board stands two tiles west of warp 3 (558,401), the Guide Gent's house door (Inferred, see reading notes).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 24; script file 850 Script#6; event file 64 spawnable idx 0
- **Other affected callers or records:** CGC-EVT-067-07 (the other board); GLB-RTN-2000.
- **Unresolved questions:** `docs/scripting-reference.md` does not document `SetTextBoard` or `BoardMessage`; the roles of `2 0` and of `24` are Inferred from the text fit. Which command variant (text board vs icon board, compare CGC-EVT-067-07) controls the layout is not established.
- **Validation needed:** Read the board in game and note its text. Static inspection only, no runtime test.

#### CGC-DLG-067-06a — Board text "Guide Gent's House" (mapping Inferred)
##### Record identity
- **Record ID:** CGC-DLG-067-06a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-06
- **Related record IDs:** CGC-EVT-067-06; CGC-DLG-067-07a
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Board at (556,401)
- **Source references:** script file 850 Script#6 `BoardMessage 24 0x800C` (L82); text archive 550 msg 24
- **Evidence status:** Inferred (that `BoardMessage`'s first argument is the message index; the text fits a house sign)
##### OLD — Current content
- **OLD dialogue:** `Guide Gent’s House / Full-of-Energy, High-Speed Old Man`
- **OLD raw message data:** `Guide Gent’s House\nFull-of-Energy, High-Speed Old Man`
- **OLD trigger:** Shown by CGC-EVT-067-06 when the board is read.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable (a `BoardMessage` command names index 24).
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
- **Replacement target:** text archive 550 msg 24
- **Other affected callers or records:** None found by grep (no other script reads msg 24 of archive 550).
- **Unresolved questions:** Whether `BoardMessage 24` really displays message 24.
- **Validation needed:** Read the board in game.

#### CGC-EVT-067-07 — Town sign "Cherrygrove City" (script 7, spawnable S1)
##### Record identity
- **Record ID:** CGC-EVT-067-07
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-067-07a; CGC-EVT-067-06; GLB-RTN-2000
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Board at global (554,396), event file 64 spawnable idx 1 (type Board, scriptNumber 7, dir 4 any direction)
- **Source references:** script file 850 Script#7 (L86-93); event file 64 spawnable 1; text archive 550 msg 23 (Inferred)
- **Evidence status:** Verified (commands); Inferred (that argument 23 selects text msg 23)
##### OLD — Current content
- **OLD dialogue:** The board text is msg 23 (CGC-DLG-067-07a) if the first `SetIconBoard` argument is the message index (Inferred).
- **OLD raw message data:** See CGC-DLG-067-07a.
- **OLD trigger:** Player reads the board from any direction.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Interaction. (2) `SetIconBoard 23 0 12 0x800C`; `ShowBoard 3`; `WaitBoard`; `CloseBoard 0x800C`; `CommonScript 2000` (GLB-RTN-2000); `End`. (3) None. (4) Board display and close. (5) None. (6) Every interaction. (7) GLB-RTN-2000.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction.
- **OLD dependencies and shared-resource effects:** GLB-RTN-2000 (L91; common script file, regenerated by hg-engine at build).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 23; script file 850 Script#7; event file 64 spawnable idx 1
- **Other affected callers or records:** CGC-EVT-067-06 (the other board). Msg 23 is read by no `Message` or `BoardMessage` command in file 850 (checked by grep), which supports the mapping.
- **Unresolved questions:** `docs/scripting-reference.md` has no entry for `SetIconBoard`; the argument roles (23, 0, 12) are undocumented. The mapping argument → message index follows the earlier runs' pattern (Route 29 and New Bark Town boards) and the text fit (a town name sign); it is Inferred, not stated.
- **Validation needed:** Read the sign in game. Static inspection only, no runtime test.

#### CGC-DLG-067-07a — Sign text "Cherrygrove City / The City of Fragrant Flowers" (mapping Inferred)
##### Record identity
- **Record ID:** CGC-DLG-067-07a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-07
- **Related record IDs:** CGC-EVT-067-07; CGC-DLG-067-06a
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Town sign at (554,396)
- **Source references:** text archive 550 msg 23; script file 850 Script#7 (`SetIconBoard 23 0 12 0x800C`, L87) — the argument 23 equals the message index (Inferred)
- **Evidence status:** Inferred (no source states the argument's role)
##### OLD — Current content
- **OLD dialogue:** `Cherrygrove City / The City of Fragrant Flowers`
- **OLD raw message data:** `Cherrygrove City\nThe City of Fragrant Flowers`
- **OLD trigger:** Shown by CGC-EVT-067-07 when the sign is read.
- **OLD conditions and branch priority:** None. Reachability: Referenced with unresolved reachability (no `Message`-type command names msg 23; the link is the `SetIconBoard` argument).
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
- **Replacement target:** text archive 550 msg 23
- **Other affected callers or records:** None found by grep (msg 23 is cited by no `Message` command).
- **Unresolved questions:** Whether `SetIconBoard 23` really shows msg 23 and what its other arguments (0, 12) do.
- **Validation needed:** Read the sign at (554,396) in game.

#### CGC-EVT-067-08 — NPC whose Pokémon lost to wild Trainers (script 8)
##### Record identity
- **Record ID:** CGC-EVT-067-08
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-067-08a
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Talk-to NPC, event file 64 overworld idx 1 (owID 1, sprite 146, at 554,399, movement 3 wander all directions, yRange 1, orient 2, scriptNumber 8)
- **Source references:** script file 850 Script#8 (L94-103); event file 64 overworld idx 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** CGC-DLG-067-08a (msg 19).
- **OLD raw message data:** See CGC-DLG-067-08a.
- **OLD trigger:** Player talks to overworld idx 1: `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`. Always visible (hide flag 0).
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Talk. (2) Message 19, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. (3)-(7) None; no global calls.
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
- **Replacement target:** script file 850 Script#8; event file 64 overworld idx 1; text archive 550 msg 19
- **Other affected callers or records:** CGC-DLG-067-08a.
- **Unresolved questions:** None.
- **Validation needed:** Talk to the NPC in game. Static inspection only, no runtime test.

#### CGC-DLG-067-08a — "I battled the Trainers on the road. My Pokémon lost."
##### Record identity
- **Record ID:** CGC-DLG-067-08a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-08
- **Related record IDs:** CGC-EVT-067-08
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** NPC at 554,399 (overworld idx 1)
- **Source references:** script file 850 Script#8 `Message 19` (L98); text archive 550 msg 19
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `I battled the Trainers on the road. / My Pokémon lost. [scroll] They’re a mess! I must take them to / a Pokémon Center.`
- **OLD raw message data:** `I battled the Trainers on the road.\nMy Pokémon lost.\rThey’re a mess! I must take them to\na Pokémon Center.`
- **OLD trigger:** Shown by CGC-EVT-067-08 on every talk.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk.
- **OLD dependencies and shared-resource effects:** Archive 550 (local).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 19
- **Other affected callers or records:** One call site (L98) in script file 850.
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit.

#### CGC-EVT-067-09 — NPC with a line about travelling with Pokémon (script 9)
##### Record identity
- **Record ID:** CGC-EVT-067-09
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-067-09a
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Talk-to NPC, event file 64 overworld idx 2 (owID 2, sprite 325, at 561,407, movement 5 walk left/right, xRange 1, orient 3, scriptNumber 9)
- **Source references:** script file 850 Script#9 (L104-113); event file 64 overworld idx 2
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** CGC-DLG-067-09a (msg 17).
- **OLD raw message data:** See CGC-DLG-067-09a.
- **OLD trigger:** Player talks to overworld idx 2: `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`. Always visible (hide flag 0).
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Talk. (2) Message 17, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. (3)-(7) None; no global calls.
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
- **Replacement target:** script file 850 Script#9; event file 64 overworld idx 2; text archive 550 msg 17
- **Other affected callers or records:** CGC-DLG-067-09a.
- **Unresolved questions:** None.
- **Validation needed:** Talk to the NPC in game. Static inspection only, no runtime test.

#### CGC-DLG-067-09a — "When you're with Pokémon, going anywhere is fun."
##### Record identity
- **Record ID:** CGC-DLG-067-09a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-067-09
- **Related record IDs:** CGC-EVT-067-09
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** NPC at 561,407 (overworld idx 2)
- **Source references:** script file 850 Script#9 `Message 17` (L108); text archive 550 msg 17
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `When you’re with Pokémon, / going anywhere is fun.`
- **OLD raw message data:** `When you’re with Pokémon,\ngoing anywhere is fun.`
- **OLD trigger:** Shown by CGC-EVT-067-09 on every talk.
- **OLD conditions and branch priority:** None. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every talk.
- **OLD dependencies and shared-resource effects:** Archive 550 (local).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 17
- **Other affected callers or records:** One call site (L108) in script file 850.
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit.

#### CGC-EVT-067-10 — Photographer NPC (script 10, global text)
##### Record identity
- **Record ID:** CGC-EVT-067-10
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-067-11 (decides whether the NPC is visible); GLB-PRM-30-0, GLB-PRM-30-1, GLB-PRM-30-2, GLB-PRM-30-3, GLB-PRM-30-5
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Talk-to NPC, event file 64 overworld idx 5 (owID 5, sprite 328, at 562,402, movement 14 face up, orient 0, hide flag 638, scriptNumber 10); the flag name FLAG_HIDE_CAMERON and the global records identify the NPC as the photographer Cameron
- **Source references:** script file 850 Script#10 (L114-140), Functions #9 (L214-221), #10 (L222-229), #11 (L230-235), #12 (L236-260), #23 (L374-380), #24 (L381-396), #34 (L557-583); Actions #6, #7, #13, #14, #23, #41; event file 64 overworld idx 5
- **Evidence status:** Verified (commands, branches); Inferred (that argument 2 of `GetCommonMessageArchive` is text archive 30); Unresolved (the meaning of the yes/no result values)
##### OLD — Current content
- **OLD dialogue:** None local: every message is read with `GetCommonMessageArchive 2 0x800C` + `MessageFromArchive 0x800C <idx>` for indices 0, 1, 2, 3, 5, and those indices are global text (GLB-PRM-30-0, -1, -2, -3, -5), not documented here.
- **OLD raw message data:** None local (global, not documented).
- **OLD trigger:** Player talks to overworld idx 5 (`scriptNumber` 10): `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`. The object exists only when flag 638 is clear (set or cleared by CGC-EVT-067-11).
- **OLD conditions and branch priority:** After archive-2 msg 0 (GLB-PRM-30-0), `OpenTouchScreen`, `YesNoTouchScreen 0x800C`, `CloseTouchScreen`: (a) result == 1 → Function#9 (archive-2 msg 5, GLB-PRM-30-5, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`). (b) Else `CheckAlbumPhoto 0x800C`: result == 1 → Function#10 (archive-2 msg 3, GLB-PRM-30-3, then the same tail). (c) Else archive-2 msg 1 (GLB-PRM-30-1), `CloseMessage`, follower commands, then `GetPlayerDirection 0x800C`: value 0 → player Action#6 and overworld 5 Action#7, Function#12; value 1 → Function#11 → player Action#13, Function#12; value 3 → Function#23 → player Action#23 and overworld 5 Action#7, Function#12; any other value (2) → Function#34 (player Action#41, overworld 5 Action#7, then an inline copy of Function#12's tail). In Function#12 (and #34): `CheckPokemonAlive 0x800C`: result != 1 → Function#24 (photo without the follower walking); result 1 → `Movement Following Action#14` first. Reachability: Referenced and apparently reachable when the NPC is visible.
- **OLD event sequence:** (1) Talk while flag 638 is clear. (2) Archive-2 msg 0 (GLB-PRM-30-0); yes/no; album check; archive-2 msg 1 (GLB-PRM-30-1); player/NPC facing walk. (3) The yes/no and album-check branches above. (4) Follower lock and move (`LockFollowingPoke 1`, `SetFollowingPokeMovement 48`); `SetFlag 393`; `FadeScreen 6 1 0 0`; `WaitFadeScreen`; `TakePhoto 1`; `LockAll`; `FadeScreen 6 1 1 0`; `WaitFadeScreen`; `ClearFlag 393`; archive-2 msg 2 (GLB-PRM-30-2); `WaitButton`; `CloseMessage`; `ReleaseAll`; `End`. (5) Flag 393 set then cleared; the photo is taken by `TakePhoto 1` (effect on the album is engine behaviour, Unresolved here). (6) Repeatable on every talk while visible; the photo branch runs only when `CheckAlbumPhoto` does not return 1 (reading result 1 as "album full" is Inferred from message 3, not stated by the script). (7) No `CommonScript` calls; the only global dependencies are the archive-2 texts.
- **OLD state changes:** Flag 393 set (L246, L382, L569) and cleared (L253, L389, L576); a photo is added through `TakePhoto 1` (engine behaviour, not verified here).
- **OLD repeat/completion behavior:** Repeatable.
- **OLD dependencies and shared-resource effects:** Archive-2 texts are read by 49 other script files (they call `GetCommonMessageArchive 2`; 0048 and 0092 read the same indices 0, 1, 2, 3, 5); flags 393 and 638 are shared with the photographer's scenes on other maps (see the flags table).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 850 Script#10 and Functions #9-#12, #23, #24, #34; event file 64 overworld idx 5; the global archive-2 texts are outside this document
- **Other affected callers or records:** CGC-EVT-067-11 (visibility); GLB-PRM-30-0, -1, -2, -3, -5 (global, not documented); the same photographer scripts on other maps.
- **Unresolved questions:** The yes/no result convention (what result 1 of `YesNoTouchScreen` stands for is not established here; see GLB-PRM-30-5). The effects of `TakePhoto`, `CheckAlbumPhoto`, `OpenTouchScreen`, `YesNoTouchScreen`. Whether the archive-2 texts are the same on every map (global, not documented).
- **Validation needed:** In-game on a day when the photographer appears: accept, decline, and with a full album. Static inspection only, no runtime test.

#### CGC-EVT-067-11 — Map-entry check that shows or hides the photographer (script 11)
##### Record identity
- **Record ID:** CGC-EVT-067-11
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-067-LS (the level-script entry that runs it); CGC-EVT-067-10 (the NPC whose visibility it sets)
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Level script 623 entry 1 (`mapChange`, scriptId 11), run on every entry to the map; no dialogue
- **Source references:** script file 850 Script#11 (L141-146), Function#13 (L261-274), Function#25 (L397-400), Function#26 (L401-404); level script 623
- **Evidence status:** Verified (commands and branches); Inferred (that `JumpIf LESS` after `CheckFlag` means "flag clear", that badge result 0 means "not held" and that day values 1, 3, 5 are Monday, Wednesday, Friday)
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Level script 623 entry 1 (`mapChange`) calls script 11 whenever the map is entered or changed to (timing relative to object spawning is not verified).
- **OLD conditions and branch priority:** In order: (a) `CheckFlag 393`; `JumpIf LESS Function#13`; if not LESS (flag 393 set, Inferred), `ClearFlag 393` and `End` (no visibility change). (b) Function#13: `CheckBadge 2 0x4000`; if 0x4000 == 0 (badge id 2 not held) → Function#25: `SetFlag 638`, `End` (photographer hidden). (c) Else `GetDayOfWeek 0x4000`: value 1, then 3, then 5 → Function#26: `ClearFlag 638`, `End` (photographer visible). (d) Any other day: `SetFlag 638`, `End`. Net: flag 638 is clear (overworld idx 5 visible) only when flag 393 is clear, badge id 2 is held and the day value is 1, 3 or 5; if flag 393 is set the previous visibility stands and flag 393 is cleared. Which badge id 2 is, is not stated by the data.
- **OLD event sequence:** (1) Map entry; no prerequisites. (2) `CheckFlag 393`, `CheckBadge 2 0x4000`, `GetDayOfWeek 0x4000`. (3) The branches above. (4) No movement, locks, sounds or messages. (5) Flag 638 set or cleared; flag 393 cleared in branch (a). (6) Re-evaluated on every map entry. (7) No global calls.
- **OLD state changes:** Flag 638 and flag 393 as above; var 0x4000 (temporary) written.
- **OLD repeat/completion behavior:** Runs on every map entry; within one visit the visibility does not change.
- **OLD dependencies and shared-resource effects:** Flag 638 is read as overworld 5's hide flag in event file 64 and is written in 45 script files in total (this one and 44 others); flag 393 is touched by 56 script files in total. The weekday and badge conditions are engine/save state.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 850 Script#11 and Functions #13, #25, #26; level script 623 entry 1
- **Other affected callers or records:** CGC-EVT-067-10 (visibility of overworld idx 5); level script 623 is the only caller found.
- **Unresolved questions:** Which badge `CheckBadge 2` tests. The meaning of `JumpIf LESS` after `CheckFlag` (Inferred). Why flag 393 skips the evaluation (it is set only during the photo scene, Inferred). Whether the flag is evaluated before objects are spawned.
- **Validation needed:** In-game: enter the town on a Monday/Wednesday/Friday and on another day, with and without the badge. Static inspection only, no runtime test.

#### CGC-EVT-067-O4 — Rival actor (sprite 148, scriptNumber 0)
##### Record identity
- **Record ID:** CGC-EVT-067-O4
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-067-04
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Event file 64 overworld idx 4 (owID 4, sprite 148, at 575,384, type Normal, movement 0, orient 1, hide flag 412, scriptNumber 0)
- **Source references:** event file 64 overworld idx 4; script file 850 Script#4 (`SetOWPosition Overworld.4`, L47; `RemoveOW Overworld.4` L613, L623)
- **Evidence status:** Verified (event fields); Inferred (that it is the rival: flag name FLAG_HIDE_CHERRYGROVE_RIVAL)
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** No talk script (`scriptNumber` 0, none); the object is only an actor of script 4.
- **OLD conditions and branch priority:** Visible while flag 412 is clear. Flag 412 is set by file 0149 and by script 4 (Functions #37 and #38), cleared by script file 0229 L212. Reachability: Referenced and apparently reachable as an actor.
- **OLD event sequence:** (1) Not interactable. (2)-(7) Script 4 moves it with `SetOWPosition`, `Movement` and `RemoveOW`.
- **OLD state changes:** None of its own.
- **OLD repeat/completion behavior:** Hidden again by script 4 after the scene.
- **OLD dependencies and shared-resource effects:** Hide flag 412 is shared with files 0149 and 0229 (header 143).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 64 overworld idx 4
- **Other affected callers or records:** CGC-EVT-067-04; script files 0149 and 0229 (flag 412).
- **Unresolved questions:** None beyond CGC-EVT-067-04.
- **Validation needed:** None beyond CGC-EVT-067-04. Static inspection only, no runtime test.

#### CGC-EVT-067-S2 — Hidden item (Nugget) (scriptNumber 8001)
##### Record identity
- **Record ID:** CGC-EVT-067-S2
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** GLB-RTN-HIDDENITEM; R29-EVT-033-S2 (the same spot, listed in the Route 29 document)
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Event file 64 spawnable idx 2 (type HiddenItem, scriptNumber 8001, dir 4 any direction, at 572,390; matrix cell (17,12), tile (28,6))
- **Source references:** event file 64 spawnable idx 2; event file 30 spawnable idx 2 (identical fields); `get_rom_table {kind: hiddenItems, index: 1}` = Nugget (item 92), amount 1, scriptId 1; matrix 0 headers layer cell (17,12) = header 67
- **Evidence status:** Verified (event fields and table entry 1); Inferred (that scriptNumber 8001 selects table index 1)
##### OLD — Current content
- **OLD dialogue:** None local (handled by GLB-RTN-HIDDENITEM).
- **OLD raw message data:** None.
- **OLD trigger:** Player interacts with the spot; GLB-RTN-HIDDENITEM runs.
- **OLD conditions and branch priority:** None local; found once (that the table's scriptId acts as the found-flag is Inferred; the mechanism belongs to GLB-RTN-HIDDENITEM and is not documented here). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Interaction. (2)-(7) GLB-RTN-HIDDENITEM.
- **OLD state changes:** Nugget x1 added; found-flag set (table scriptId 1; Inferred).
- **OLD repeat/completion behavior:** One-time.
- **OLD dependencies and shared-resource effects:** The arm9 hidden-item table (231 entries) is shared with the rest of the game; GLB-RTN-HIDDENITEM. The same record (same coordinates 572,390, same scriptNumber 8001) exists in event file 30 (Route 29, header 33), where the Route 29 document lists it as R29-EVT-033-S2: two event-file records point at the one table entry and the one tile. Which of the two copies is read when the player stands on the tile is not established (Inferred: the cell's header is 67, so this file). The handler (file 145) calls `CommonScript 2001` (L788), so it also depends on the common script file that hg-engine regenerates at build.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** `set_rom_table {kind: hiddenItems, index: 1}` (item, amount, scriptId); event file 64 spawnable idx 2 and event file 30 spawnable idx 2 (keep both in step)
- **Other affected callers or records:** R29-EVT-033-S2 (same table entry, same tile); GLB-RTN-HIDDENITEM.
- **Unresolved questions:** The 8000+k → table index k mapping (Inferred; for other entries the table's scriptId differs from the index, e.g. index 225 has scriptId 121, so index versus scriptId is not distinguishable for this entry where both are 1). Which of the two event files serves the spot.
- **Validation needed:** Use the Itemfinder / walk to (572,390) in game. Static inspection only, no runtime test.

#### CGC-EVT-067-S3 — Hidden item (Max Revive) (scriptNumber 8225)
##### Record identity
- **Record ID:** CGC-EVT-067-S3
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** GLB-RTN-HIDDENITEM
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Event file 64 spawnable idx 3 (type HiddenItem, scriptNumber 8225, dir 4 any direction, at 522,388; matrix cell (16,12), tile (10,4))
- **Source references:** event file 64 spawnable idx 3; `get_rom_table {kind: hiddenItems, index: 225}` = Max Revive (item 29), amount 1, scriptId 121; matrix 0 headers layer cell (16,12) = header 67
- **Evidence status:** Verified (event fields and table entry 225); Inferred (that scriptNumber 8225 selects table index 225)
##### OLD — Current content
- **OLD dialogue:** None local (handled by GLB-RTN-HIDDENITEM).
- **OLD raw message data:** None.
- **OLD trigger:** Player interacts with the spot; GLB-RTN-HIDDENITEM runs.
- **OLD conditions and branch priority:** None local; found once (the table's scriptId 121 acting as the found-flag id is Inferred). Reachability: Referenced and apparently reachable.
- **OLD event sequence:** (1) Interaction. (2)-(7) GLB-RTN-HIDDENITEM.
- **OLD state changes:** Max Revive x1 added; found-flag set (table scriptId 121; Inferred).
- **OLD repeat/completion behavior:** One-time.
- **OLD dependencies and shared-resource effects:** The arm9 hidden-item table (231 entries) is shared with the rest of the game; GLB-RTN-HIDDENITEM. The hack's journal edited hidden-item handler file 145 (journal id 19); the handler is global and not documented here. The handler calls `CommonScript 2001` (0145 Function 1, L788), so it also depends on the common script file that hg-engine regenerates at build.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** `set_rom_table {kind: hiddenItems, index: 225}` (item, amount, scriptId); event file 64 spawnable idx 3
- **Other affected callers or records:** GLB-RTN-HIDDENITEM. Whether another event file also uses scriptNumber 8225 was not searched.
- **Unresolved questions:** The 8000+k → table index k mapping (Inferred; here the table's scriptId 121 differs from the index 225, so the alternative reading "8000 + scriptId" would point to a different entry; not resolved).
- **Validation needed:** Use the Itemfinder / walk to (522,388) in game. Static inspection only, no runtime test.

#### CGC-EVT-067-W0 — Warp to the Pokémon Center (564,391)
##### Record identity
- **Record ID:** CGC-EVT-067-W0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-067-W1, CGC-EVT-067-W2, CGC-EVT-067-W3, CGC-EVT-067-W4; CGC-EVT-069-W0 (the return warp)
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Warp idx 0 at global (564,391), matrix cell (17,12) tile (20,7)
- **Source references:** `get_events {mapHeader: 67}` warps idx 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Player steps on the warp tile (564,391).
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Step. (2)-(7) Warp to header 69 (T21PC0101, Pokémon Center), anchor 0, height 0.
- **OLD state changes:** Map change.
- **OLD repeat/completion behavior:** Always available.
- **OLD dependencies and shared-resource effects:** Destination header 69 (script file 852, event file 66, text archive 552).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 64 warp idx 0
- **Other affected callers or records:** The return warp in header 69's event file (not documented in this record).
- **Unresolved questions:** `anchor` semantics (whether anchor 0 means the destination's warp 0 or an index into the destination list) is not stated by the data.
- **Validation needed:** Walk through the door both ways. Static inspection only, no runtime test.

#### CGC-EVT-067-W1 — Warp to the mart (555,391)
##### Record identity
- **Record ID:** CGC-EVT-067-W1
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-067-W0, CGC-EVT-067-W2, CGC-EVT-067-W3, CGC-EVT-067-W4; CGC-EVT-068-W0 (the return warp)
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Warp idx 1 at global (555,391), matrix cell (17,12) tile (11,7)
- **Source references:** `get_events {mapHeader: 67}` warps idx 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Player steps on the warp tile (555,391).
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Step. (2)-(7) Warp to header 68 (T21FS0101, the mart per the briefing), anchor 0, height 0.
- **OLD state changes:** Map change.
- **OLD repeat/completion behavior:** Always available.
- **OLD dependencies and shared-resource effects:** Destination header 68 (script file 851, event file 65, text archive 551).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 64 warp idx 1
- **Other affected callers or records:** The return warp in header 68's event file (not documented in this record).
- **Unresolved questions:** `anchor` semantics (as in CGC-EVT-067-W0).
- **Validation needed:** Walk through the door both ways. Static inspection only, no runtime test.

#### CGC-EVT-067-W2 — Warp to house 70 (547,399)
##### Record identity
- **Record ID:** CGC-EVT-067-W2
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-067-W0, CGC-EVT-067-W1, CGC-EVT-067-W3, CGC-EVT-067-W4; CGC-EVT-070-W0 (the return warp)
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Warp idx 2 at global (547,399), matrix cell (17,12) tile (3,15)
- **Source references:** `get_events {mapHeader: 67}` warps idx 2
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Player steps on the warp tile (547,399).
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Step. (2)-(7) Warp to header 70 (T21R0301, a house), anchor 0, height 0.
- **OLD state changes:** Map change.
- **OLD repeat/completion behavior:** Always available.
- **OLD dependencies and shared-resource effects:** Destination header 70 (script file 854, event file 67, text archive 553).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 64 warp idx 2
- **Other affected callers or records:** The return warp in header 70's event file (not documented in this record).
- **Unresolved questions:** `anchor` semantics (as in CGC-EVT-067-W0).
- **Validation needed:** Walk through the door both ways. Static inspection only, no runtime test.

#### CGC-EVT-067-W3 — Warp to the Guide Gent's house (558,401)
##### Record identity
- **Record ID:** CGC-EVT-067-W3
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-067-W0, CGC-EVT-067-W1, CGC-EVT-067-W2, CGC-EVT-067-W4; CGC-EVT-067-02 (its door animation uses these coordinates); CGC-EVT-071-W0 (the return warp)
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Warp idx 3 at global (558,401), matrix cell (17,12) tile (14,17)
- **Source references:** `get_events {mapHeader: 67}` warps idx 3; script file 850 `DoorAnimation 17 12 14 17 77` (L494 in Function#30, L696 in Function#39)
- **Evidence status:** Verified (warp fields); Inferred (that the four position arguments of `DoorAnimation` are matrix cell and tile and so name this door; header 71 is the Guide Gent's house)
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Player steps on the warp tile (558,401).
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Step. (2)-(7) Warp to header 71 (T21R0401, a house), anchor 0, height 0.
- **OLD state changes:** Map change.
- **OLD repeat/completion behavior:** Always available.
- **OLD dependencies and shared-resource effects:** Destination header 71 (script file 855, event file 68, text archive 554). The Guide Gent's tour (CGC-EVT-067-02) animates a door at this tile.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 64 warp idx 3
- **Other affected callers or records:** CGC-EVT-067-02 (`DoorAnimation`); the return warp in header 71's event file (not documented in this record).
- **Unresolved questions:** `anchor` semantics (as in CGC-EVT-067-W0); the `DoorAnimation` argument roles.
- **Validation needed:** Walk through the door both ways, and re-check the tour's door animation if the warp moves. Static inspection only, no runtime test.

#### CGC-EVT-067-W4 — Warp to house 72 (567,405)
##### Record identity
- **Record ID:** CGC-EVT-067-W4
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-067-W0, CGC-EVT-067-W1, CGC-EVT-067-W2, CGC-EVT-067-W3; CGC-EVT-072-W0 (the return warp)
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** Warp idx 4 at global (567,405), matrix cell (17,12) tile (23,21)
- **Source references:** `get_events {mapHeader: 67}` warps idx 4
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Player steps on the warp tile (567,405).
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Step. (2)-(7) Warp to header 72 (T21R0501, a house), anchor 0, height 0.
- **OLD state changes:** Map change.
- **OLD repeat/completion behavior:** Always available.
- **OLD dependencies and shared-resource effects:** Destination header 72 (script file 856, event file 69, text archive 555).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 64 warp idx 4
- **Other affected callers or records:** The return warp in header 72's event file (not documented in this record).
- **Unresolved questions:** `anchor` semantics (as in CGC-EVT-067-W0).
- **Validation needed:** Walk through the door both ways. Static inspection only, no runtime test.

#### CGC-DLG-067-U16 — "Did you talk to the old man by the Pokémon Center?" (unreferenced)
##### Record identity
- **Record ID:** CGC-DLG-067-U16
- **Record type:** Dialogue variant
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-067-U18; CGC-EVT-067-03 (the Map Card scene the text refers to)
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** None found; the wording is that of an NPC pointing the player to the Guide Gent
- **Source references:** text archive 550 msg 16; no command in script file 850 references index 16 (checked: no `Message 16`, no `BoardMessage 16`, no `SetIconBoard 16` in the file; no other Cherrygrove header uses archive 550)
- **Evidence status:** Verified (text and the absence of a reference in file 850); Inferred (that nothing else reads it)
##### OLD — Current content
- **OLD dialogue:** `Did you talk to the old man by the / Pokémon Center? [scroll] He’ll put a Map of Johto on your / Pokégear.`
- **OLD raw message data:** `Did you talk to the old man by the\nPokémon Center?\rHe’ll put a Map of Johto on your\nPokégear.`
- **OLD trigger:** None found.
- **OLD conditions and branch priority:** None. Reachability: Apparently unused.
- **OLD event sequence:** None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Not shown.
- **OLD dependencies and shared-resource effects:** Text archive 550. No object of event file 64 has a script that reads it; overworld idx 1 and 2 read messages 19 and 17 instead.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 16
- **Other affected callers or records:** None found.
- **Unresolved questions:** Whether engine or overlay code outside the scripts reads it (not checked).
- **Validation needed:** None needed unless a new script is pointed at it.

#### CGC-DLG-067-U18 — "Mr. Pokémon's house is still farther up ahead." (unreferenced)
##### Record identity
- **Record ID:** CGC-DLG-067-U18
- **Record type:** Dialogue variant
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-067-U16
- **Map or system:** Cherrygrove City exterior (header 67, T21)
- **Speaker, object, or trigger:** None found; the wording is that of an NPC advising on the route to Mr. Pokémon's house
- **Source references:** text archive 550 msg 18; no command in script file 850 references index 18 (checked as for U16)
- **Evidence status:** Verified (text and the absence of a reference in file 850); Inferred (that nothing else reads it)
##### OLD — Current content
- **OLD dialogue:** `Mr. Pokémon’s house is still farther / up ahead. [scroll] You could use the Running Shoes if / you had a pair. [scroll] But beware of wild Pokémon and / Trainers! [scroll] When you run, the noise will / attract them.`
- **OLD raw message data:** `Mr. Pokémon’s house is still farther\nup ahead.\rYou could use the Running Shoes if\nyou had a pair.\rBut beware of wild Pokémon and\nTrainers!\rWhen you run, the noise will\nattract them.`
- **OLD trigger:** None found.
- **OLD conditions and branch priority:** None. Reachability: Apparently unused.
- **OLD event sequence:** None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Not shown.
- **OLD dependencies and shared-resource effects:** Text archive 550.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 550 msg 18
- **Other affected callers or records:** None found.
- **Unresolved questions:** Whether engine or overlay code outside the scripts reads it (not checked).
- **Validation needed:** None needed unless a new script is pointed at it.


## Map 068 — Cherrygrove City Poké Mart (T21FS0101)

### Map 068 reading notes
- **Sources:** `get_events {mapHeader: 68}` (event file 65), `get_script {file: 624}` (level script, 1 entry), `get_script {file: 851}` and `project/scripts/0851.script` (4 scripts, 2 functions, 0 actions; 64 lines = 57 live + 7 header; all 57 live lines of `get_script` were compared with the pulled file and match), `get_text {archive: 551}` (3 messages), `get_world_data mapHeader 68` and header 67 warps. Header facts: internal name T21FS0101, location Cherrygrove City (id 127), matrix 104, script file 851, level script 624, text archive 551, event file 65, music 1064 day/night, weather 0, wild 255 (no encounters), flags 114, `areaDataId 27`, `locationType 4`, `followMode 1`. Text archive 551 is used by header 68 only (checked in the arm9 header table, all 540 records).
- **Room identity:** the internal name `FS` and the two clerk scripts (`CommonScript 2011` greeting then the mart-menu routines 2048 and 2052) mark it as the Poké Mart (Verified from the scripts: the calls are to GLB-RTN-2011, GLB-RTN-2048 and GLB-RTN-2052; "Poké Mart" as the shop kind is Inferred from the internal name and those calls, not from any local text).
- **Dialogue rendering:** see Conventions, Text rendering. Archive 551 has no `{...}` tokens.
- **Scope:** the mart is entered from the Cherrygrove City exterior (header 67 warp 1 at global 555,391 → header 68, anchor 0) and left by this map's warp 0 (4,11 → header 67 anchor 1). Both clerk scripts call global routines (`CommonScript 2011`, `2048`, `2052`) that are referenced by GLB id only. Script ids 10200, 10201 and 10202 (level script and two overworlds) are in the id space above 9000 whose target file the tools do not name (see Unresolved references and conditions); they are not documented.
- **hg-engine dependency:** the client builds regenerate common script file 3 (ids 2000-2081), so both clerks' behaviour in a built ROM comes from hg-engine's `scr_seq_0003_011`, `_048`, `_052` (per GLB-RTN-2011/2048/2052), not from the working ROM's file 3. `docs/mr-paint-appraisal.md` (line 178 area) records hack work on the mart common script; global, reference only.

### Map 068 event inventory
Coordinates are global tiles; matrix cell (0,0) for every entry. Every entry maps to a record in this section.

| Section | Idx | Type | owID / sprite (overlayTableEntry) | Coordinates | Flag (hides when set) | scriptNumber | Covered by |
|---|---|---|---|---|---|---|---|
| overworld | 0 | Normal, movement 17 face right, orient 3 | owID 0 / 334 | 2,6 | 0 | 1 | CGC-EVT-068-01 |
| overworld | 1 | Normal, movement 8 looking down/left, orient 1 | owID 1 / 146 | 7,9 | 0 | 2 | CGC-EVT-068-02 |
| overworld | 2 | Normal, movement 5 walking left/right (xRange 1, yRange 0), orient 2 | owID 2 / 324 | 7,4 | 0 | 3 | CGC-EVT-068-03 |
| overworld | 3 | Normal, movement 17 face right, orient 3 | owID 3 / 334 | 2,4 | 404 | 4 | CGC-EVT-068-04 |
| overworld | 4 | Normal, movement 0 none, orient 1 | owID 4 / 299 | 3,8 | 680 | 10202 | CGC-EVT-068-O4 |
| overworld | 5 | Normal, movement 0 none, orient 1 | owID 5 / 193 | 2,8 | 679 | 10201 | CGC-EVT-068-O5 |
| warp | 0 | to header 67, anchor 1, height 0 | - | 4,11 | - | - | CGC-EVT-068-W0 |
| level script 624 | entry 1 | mapChange, scriptId 10200 | - | - | - | 10200 | CGC-EVT-068-LS |
| spawnables / triggers | - | none (counts 0 and 0) | - | - | - | - | - |

### Map 068 flags and variables (readers and writers)
Search basis: every `project/scripts/*.script` (497 files, decimal and hex forms), this event file's `flag` fields and level script 624. Script file → header resolved from the arm9 header table (24-byte records, scriptFileId at record byte 6; cross-checked with `get_world_data {kind: mapHeader}` for headers 68, 69, 144, 207 and 516). Event files and level scripts of other maps were not searched for these numbers.

| Name (flags.s / vars.s) | Number | Read by | Written by |
|---|---|---|---|
| FLAG_HIDE_CHERRYGROVE_MART_SPECIAL_CLERK | 404 | event file 65 overworld 3 (hide flag) | set: 0149 L52 (script file 0149: no header uses it; how it is invoked is Unresolved). cleared: 0843 L157 and L603 (header 61 T20R0101, Elm lab), both next to `SetVar 0x4108 4`. No CheckFlag reader in any script |
| FLAG_HIDE_MYSTERY_GIFT_DELIVERYMAN | 679 | event file 65 overworld 5 (hide flag) | 0144 L64, L71, L121, L128 (SetFlag), L132, L174 (ClearFlag) (script file 0144: no header uses it) |
| FLAG_HIDE_MOM_GIFT_DELIVERYMAN | 680 | event file 65 overworld 4 (hide flag) | 0144 L15, L55 (SetFlag), L60, L117 (ClearFlag) (script file 0144: no header uses it) |
| VAR_SCENE_ELMS_LAB | 0x4108 (16648) | 0851 Script 3 L34 (`CompareVarValue 0x4108 4`); 0852 Script 4 L38 (header 69); 0843 (header 61), 0845 (header 63), 0848 (header 66) | 0843 (header 61): L151=4, L293=1, L597=4, L638=2, L765=9, L798=9, L932=5, L1117=2; 0229 L213=3 (header 143); 0112 L275/L292=8 (header 288); 0859 L42=6 (header 135); 0858 L121/L134=7 (header 157). No writer in 0851 |

Script file 851 itself reads or writes no flag and sets only `0x8004` (stock index input of the clerk routines) as scratch. Level script 624 watches no variable.

### Map 068 event records

#### CGC-EVT-068-01 — Poké Mart clerk, standard stock (script 1)
##### Record identity
- **Record ID:** CGC-EVT-068-01
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-068-04
- **Map or system:** Cherrygrove City Poké Mart (header 68, T21FS0101)
- **Speaker, object, or trigger:** Talk-to NPC, event file 65 overworld idx 0 (owID 0, sprite 334, at 2,6, movement 17 face right, orient 3, no hide flag)
- **Source references:** script file 851 Script#1 (0851.script L9-18); event file 65 overworld idx 0
- **Evidence status:** Verified (script and event); Inferred (that the NPC is the clerk: no text names it; it calls the mart-clerk routines)
##### OLD — Current content
- **OLD dialogue:** None local. The greeting and menu text are global (GLB-RTN-2011, GLB-RTN-2048); not documented here.
- **OLD raw message data:** None local.
- **OLD trigger:** Player talks to overworld idx 0 (`scriptNumber` 1).
- **OLD conditions and branch priority:** None in this file.
- **OLD event sequence:** (1) Talk; no prerequisite. (2) `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer` (L10-12); `CommonScript 2011` (L13, GLB-RTN-2011), `FreezeMessage` (L14); `SetVar 0x8004 0` (L15); `CommonScript 2048` (L16, GLB-RTN-2048). (3) Everything after the routine calls runs inside the global routines (global, not documented). (4) None locally. (5) `0x8004` set to 0 (scratch variable set before the call; what the routine does with it is global, not documented). (6) `ReleaseAll`, `End` (L17-18); repeatable. (7) Calls GLB-RTN-2011 and GLB-RTN-2048.
- **OLD state changes:** `0x8004` = 0 (scratch). Anything the global routines change is global, not documented.
- **OLD repeat/completion behavior:** Repeatable on every talk.
- **OLD dependencies and shared-resource effects:** Common script file 3 ids 2011 and 2048; hg-engine regenerates file 3 in builds (`scr_seq_0003_011`, `_048`). Stock for index 0 is not documented here (global, not documented).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 851 Script#1; event file 65 overworld idx 0
- **Other affected callers or records:** GLB-RTN-2011, GLB-RTN-2048 (shared by 14 and 42 callers per the global map); CGC-EVT-068-04 (second clerk).
- **Unresolved questions:** What stock index 0 sells (global, not documented).
- **Validation needed:** Talk to the clerk and buy/sell once; static inspection only, no runtime test.

#### CGC-EVT-068-02 — NPC advising on Bug-type poison and Antidotes (script 2)
##### Record identity
- **Record ID:** CGC-EVT-068-02
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-068-02a
- **Map or system:** Cherrygrove City Poké Mart (header 68, T21FS0101)
- **Speaker, object, or trigger:** Talk-to NPC, event file 65 overworld idx 1 (owID 1, sprite 146, at 7,9, movement 8 looking down/left, orient 1, no hide flag)
- **Source references:** script file 851 Script#2 (L20-28); event file 65 overworld idx 1; text archive 551 msg 2
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** One message, msg 2 (CGC-DLG-068-02a).
- **OLD raw message data:** See the dialogue record.
- **OLD trigger:** Player talks to overworld idx 1 (`scriptNumber` 2): `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Talk. (2) `Message 2` (L24), `WaitButton`, `CloseMessage`. (3)-(5) None. (6) `ReleaseAll`, `End` (L27-28); repeatable. (7) None.
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
- **Replacement target:** text archive 551 msg 2; script file 851 Script#2; event file 65 overworld idx 1
- **Other affected callers or records:** None found (msg 2 only at L24).
- **Unresolved questions:** Who the NPC is (sprite 146) is not stated by the data.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

#### CGC-EVT-068-03 — NPC reacting to Poké Ball stock, text by variable 0x4108 (script 3)
##### Record identity
- **Record ID:** CGC-EVT-068-03
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-068-03a, CGC-DLG-068-03b
- **Map or system:** Cherrygrove City Poké Mart (header 68, T21FS0101)
- **Speaker, object, or trigger:** Talk-to NPC, event file 65 overworld idx 2 (owID 2, sprite 324, at 7,4, movement 5 walking left/right, xRange 1, yRange 0, orient 2, no hide flag)
- **Source references:** script file 851 Script#3 (L30-37) and Function#1 (L51-56), Function#2 (L58-62); event file 65 overworld idx 2; text archive 551 msgs 0 and 1
- **Evidence status:** Verified (commands); Inferred (that `JumpIf LESS` branches when the variable is below the compared value)
##### OLD — Current content
- **OLD dialogue:** Two messages by branch: msg 0 (CGC-DLG-068-03a) and msg 1 (CGC-DLG-068-03b).
- **OLD raw message data:** See the dialogue records.
- **OLD trigger:** Player talks to overworld idx 2 (`scriptNumber` 3): `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** Direct: (1) `CompareVarValue 0x4108 4` (L34) then `JumpIf LESS Function#1` (L35): variable below 4 → Function#1 (msg 0). (2) Otherwise falls through to `Message 1` (L36) then `Jump Function#2`. Var 0x4108 is VAR_SCENE_ELMS_LAB; its writers are listed in the flags table.
- **OLD event sequence:** (1) Talk. (2) Branch above. (3) Two branches by the comparison. (4) None. (5) None. (6) Function#1: `Message 0`, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. Function#2 (reached after msg 1): `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. Repeatable. (7) None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable; the text depends on the current value of 0x4108.
- **OLD dependencies and shared-resource effects:** Var 0x4108, written by script files 0843 (header 61), 0229 (header 143), 0112 (header 288), 0859 (header 135), 0858 (header 157); also read in header 69 (CGC-EVT-069-04).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 551 msgs 0 and 1; script file 851 Script#3 and Functions 1-2; event file 65 overworld idx 2
- **Other affected callers or records:** Msgs 0 and 1 only at L52 and L36. Shares var 0x4108 with CGC-EVT-069-04. Outside Cherrygrove the var is written by 0229 L213, 0112 L275/L292, 0858 L121/L134, 0859 L42 and 0843, and read by 0845 L49, 0848 L15 and 0843 (see Dependency references).
- **Unresolved questions:** Who the NPC is (sprite 324) is not stated by the data. Exact comparison semantics of `JumpIf LESS` follow the engine's reading (not independently verified).
- **Validation needed:** Talk with 0x4108 below 4 and at 4 or more (static inspection only, no runtime test).

#### CGC-EVT-068-04 — Poké Mart clerk, special-menu routine, hidden by flag 404 (script 4)
##### Record identity
- **Record ID:** CGC-EVT-068-04
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-068-01
- **Map or system:** Cherrygrove City Poké Mart (header 68, T21FS0101)
- **Speaker, object, or trigger:** Talk-to NPC, event file 65 overworld idx 3 (owID 3, sprite 334, at 2,4, movement 17 face right, orient 3, hide flag 404 = FLAG_HIDE_CHERRYGROVE_MART_SPECIAL_CLERK)
- **Source references:** script file 851 Script#4 (L39-48); event file 65 overworld idx 3
- **Evidence status:** Verified (script and event); Inferred (that the NPC is a clerk)
##### OLD — Current content
- **OLD dialogue:** None local. Greeting and menu text are global (GLB-RTN-2011, GLB-RTN-2052); not documented here.
- **OLD raw message data:** None local.
- **OLD trigger:** Player talks to overworld idx 3 (`scriptNumber` 4), only while the object exists (flag 404 clear).
- **OLD conditions and branch priority:** Direct: the object is hidden while flag 404 is set. Indirect: flag 404 is set by 0149 L52 and cleared by 0843 L157 and L603 (header 61), see the flags table; no CheckFlag on 404 exists in any script.
- **OLD event sequence:** (1) Talk to the visible object. (2) `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer` (L40-42); `CommonScript 2011` (L43, GLB-RTN-2011), `FreezeMessage` (L44); `SetVar 0x8004 0` (L45); `CommonScript 2052` (L46, GLB-RTN-2052). (3)-(4) Inside the global routine. (5) `0x8004` = 0 (scratch). (6) `ReleaseAll`, `End` (L47-48); repeatable. (7) Calls GLB-RTN-2011 and GLB-RTN-2052.
- **OLD state changes:** `0x8004` = 0 (scratch). This script sets no flag; anything GLB-RTN-2052 reads or changes is global, not documented.
- **OLD repeat/completion behavior:** Repeatable while visible.
- **OLD dependencies and shared-resource effects:** Common script file 3 ids 2011 and 2052 (hg-engine regenerates file 3 in builds: `scr_seq_0003_011`, `_052`). Flag 404 (0149, 0843).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 851 Script#4; event file 65 overworld idx 3 (including its hide flag 404)
- **Other affected callers or records:** GLB-RTN-2011, GLB-RTN-2052; script files 0149 and 0843 that write flag 404; CGC-EVT-068-01.
- **Unresolved questions:** What stock index 0 sells in the special routine (global, not documented). When the object is visible in play depends on whether 0149 runs (how it is invoked is Unresolved).
- **Validation needed:** Check the clerk's visibility before and after the 0843 step that clears flag 404; static inspection only, no runtime test.

#### CGC-EVT-068-LS — Level script 624 (map-change hook, scriptId 10200)
##### Record identity
- **Record ID:** CGC-EVT-068-LS
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** None
- **Map or system:** Cherrygrove City Poké Mart (header 68, T21FS0101)
- **Speaker, object, or trigger:** Level script file 624 (one entry)
- **Source references:** `get_script {file: 624}` (8 bytes, 1 entry); header 68 `levelScriptId` 624
- **Evidence status:** Verified (entry); Unresolved (what script 10200 does)
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Entry 1: `mapChange`, scriptId 10200.
- **OLD conditions and branch priority:** None; the only entry.
- **OLD event sequence:** (1) Map change. (2) Script id 10200 runs. Script file 851 has only 4 scripts, so 10200 is not a script of this map's file; its target is global, not documented (the tools do not name the file for ids above 9000). (3)-(7) Not determinable.
- **OLD state changes:** Not determinable.
- **OLD repeat/completion behavior:** Every map change (engine behaviour, not verified).
- **OLD dependencies and shared-resource effects:** The same id space as scriptNumbers 10201 and 10202 (CGC-EVT-068-O5, -O4); target file not determined.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** level script file 624 (replaced whole by `set_script levelScript`)
- **Other affected callers or records:** CGC-EVT-068-O4, CGC-EVT-068-O5.
- **Unresolved questions:** Which script file id 10200 resolves to and what it does.
- **Validation needed:** Re-read the whole trigger list before any write (a level script is replaced wholesale); static inspection only, no runtime test.

#### CGC-EVT-068-O4 — Object 4 (sprite 299, scriptNumber 10202, hide flag 680)
##### Record identity
- **Record ID:** CGC-EVT-068-O4
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-068-O5, CGC-EVT-068-LS
- **Map or system:** Cherrygrove City Poké Mart (header 68, T21FS0101)
- **Speaker, object, or trigger:** Event file 65 overworld idx 4 (owID 4, sprite 299, at 3,8, movement 0 none, orient 1, hide flag 680 = FLAG_HIDE_MOM_GIFT_DELIVERYMAN)
- **Source references:** `get_events {mapHeader: 68}` overworld idx 4; flags.s
- **Evidence status:** Verified (entry); Unresolved (script 10202)
##### OLD — Current content
- **OLD dialogue:** None found locally.
- **OLD raw message data:** None.
- **OLD trigger:** Talk to the object while flag 680 is clear (its `scriptNumber` 10202 is outside script file 851's 4 scripts; target global, not documented).
- **OLD conditions and branch priority:** Direct: hidden while flag 680 is set. Indirect: flag 680 is written only by script file 0144 (SetFlag L15, L55; ClearFlag L60, L117), which no map header uses.
- **OLD event sequence:** (1) Talk. (2)-(7) Not determinable: the script is global, not documented.
- **OLD state changes:** Not determinable.
- **OLD repeat/completion behavior:** Not determinable.
- **OLD dependencies and shared-resource effects:** Flag 680, file 0144; id 10202 (id space above 9000, target not determined).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 65 overworld idx 4
- **Other affected callers or records:** CGC-EVT-068-O5, CGC-EVT-068-LS; script file 0144.
- **Unresolved questions:** What script 10202 does; the role of the flag name "Mom gift deliveryman" is read from flags.s only (Inferred).
- **Validation needed:** None possible statically.

#### CGC-EVT-068-O5 — Object 5 (sprite 193, scriptNumber 10201, hide flag 679)
##### Record identity
- **Record ID:** CGC-EVT-068-O5
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-068-O4, CGC-EVT-068-LS
- **Map or system:** Cherrygrove City Poké Mart (header 68, T21FS0101)
- **Speaker, object, or trigger:** Event file 65 overworld idx 5 (owID 5, sprite 193, at 2,8, movement 0 none, orient 1, hide flag 679 = FLAG_HIDE_MYSTERY_GIFT_DELIVERYMAN)
- **Source references:** `get_events {mapHeader: 68}` overworld idx 5; flags.s
- **Evidence status:** Verified (entry); Unresolved (script 10201)
##### OLD — Current content
- **OLD dialogue:** None found locally.
- **OLD raw message data:** None.
- **OLD trigger:** Talk to the object while flag 679 is clear (`scriptNumber` 10201 is outside script file 851's 4 scripts; target global, not documented).
- **OLD conditions and branch priority:** Direct: hidden while flag 679 is set. Indirect: flag 679 is written only by script file 0144 (SetFlag L64, L71, L121, L128; ClearFlag L132, L174), which no map header uses.
- **OLD event sequence:** (1) Talk. (2)-(7) Not determinable: global, not documented.
- **OLD state changes:** Not determinable.
- **OLD repeat/completion behavior:** Not determinable.
- **OLD dependencies and shared-resource effects:** Flag 679, file 0144; id 10201 (id space above 9000, target not determined).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 65 overworld idx 5
- **Other affected callers or records:** CGC-EVT-068-O4, CGC-EVT-068-LS; script file 0144.
- **Unresolved questions:** What script 10201 does; the flag name is read from flags.s only (Inferred).
- **Validation needed:** None possible statically.

#### CGC-EVT-068-W0 — Warp to Cherrygrove City exterior (4,11)
##### Record identity
- **Record ID:** CGC-EVT-068-W0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-067-W1
- **Map or system:** Cherrygrove City Poké Mart (header 68, T21FS0101)
- **Speaker, object, or trigger:** Warp idx 0 at global (4,11), matrix cell (0,0) tile (4,11)
- **Source references:** `get_events {mapHeader: 68}` warps idx 0; `get_events {mapHeader: 67}` warps idx 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Player steps on (4,11).
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Step. (2)-(7) Warp to header 67 (Cherrygrove City exterior), anchor 1, height 0.
- **OLD state changes:** Map change.
- **OLD repeat/completion behavior:** Always available.
- **OLD dependencies and shared-resource effects:** Header 67 warp 1 (global 555,391) leads here with anchor 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 65 warp idx 0
- **Other affected callers or records:** CGC-EVT-067-W1 (header 67 event file 64 warp idx 1, the outward warp).
- **Unresolved questions:** `anchor` semantics (anchor 1 matches header 67's warp 1, consistent with an index into the destination's warp list; not stated by the data).
- **Validation needed:** Enter and leave the mart (static inspection only, no runtime test).

#### CGC-DLG-068-02a — Bug-type poison and Antidote advice
##### Record identity
- **Record ID:** CGC-DLG-068-02a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-068-02
- **Related record IDs:** None
- **Map or system:** Cherrygrove City Poké Mart (header 68, T21FS0101)
- **Speaker, object, or trigger:** NPC at overworld idx 1 (owID 1)
- **Source references:** script file 851 Script#2 (`Message 2`, L24); text archive 551 msg 2
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `When I was walking in the tall grass, / a Bug-type Pokémon poisoned [new box] my Pokémon! [scroll] I just kept going, but my Pokémon / nearly fainted. [scroll] You should keep an Antidote with you.`
- **OLD raw message data:** `When I was walking in the tall grass,\na Bug-type Pokémon poisoned\fmy Pokémon!\rI just kept going, but my Pokémon\nnearly fainted.\rYou should keep an Antidote with you.`
- **OLD trigger:** Shown by CGC-EVT-068-02 on every interaction.
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
- **Replacement target:** text archive 551 msg 2
- **Other affected callers or records:** None found (L24 only; archive 551 belongs to header 68 only).
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

#### CGC-DLG-068-03a — "They're fresh out of Poké Balls" (variable below 4)
##### Record identity
- **Record ID:** CGC-DLG-068-03a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-068-03
- **Related record IDs:** CGC-DLG-068-03b
- **Map or system:** Cherrygrove City Poké Mart (header 68, T21FS0101)
- **Speaker, object, or trigger:** NPC at overworld idx 2 (owID 2)
- **Source references:** script file 851 Function#1 (`Message 0`, L52), reached by Script#3 L35; text archive 551 msg 0
- **Evidence status:** Verified (message and call); Inferred (branch direction)
##### OLD — Current content
- **OLD dialogue:** `They’re fresh out of Poké Balls! / When will they get more of them?`
- **OLD raw message data:** `They’re fresh out of Poké Balls!\nWhen will they get more of them?`
- **OLD trigger:** CGC-EVT-068-03 when `JumpIf LESS` on `CompareVarValue 0x4108 4` is taken.
- **OLD conditions and branch priority:** First branch, tested before msg 1: var 0x4108 below 4. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent sequence, then `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction while 0x4108 is below 4.
- **OLD dependencies and shared-resource effects:** Var 0x4108 (writers in the flags table).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 551 msg 0
- **Other affected callers or records:** None found (L52 only).
- **Unresolved questions:** None beyond the Inferred branch direction.
- **Validation needed:** Text-box fit after any edit; talk with 0x4108 below 4 (static inspection only, no runtime test).

#### CGC-DLG-068-03b — "Poké Balls are in stock" (variable 4 or more)
##### Record identity
- **Record ID:** CGC-DLG-068-03b
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-068-03
- **Related record IDs:** CGC-DLG-068-03a
- **Map or system:** Cherrygrove City Poké Mart (header 68, T21FS0101)
- **Speaker, object, or trigger:** NPC at overworld idx 2 (owID 2)
- **Source references:** script file 851 Script#3 (`Message 1`, L36, then `Jump Function#2`); text archive 551 msg 1
- **Evidence status:** Verified (message and call); Inferred (branch direction)
##### OLD — Current content
- **OLD dialogue:** `Poké Balls are in stock! / Now I can catch Pokémon!`
- **OLD raw message data:** `Poké Balls are in stock!\nNow I can catch Pokémon!`
- **OLD trigger:** CGC-EVT-068-03 when the 0x4108 comparison does not take the branch.
- **OLD conditions and branch priority:** Second (fall-through) branch: var 0x4108 equal to or above 4. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent sequence, then Function#2 (`WaitButton`, `CloseMessage`, `ReleaseAll`).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction while 0x4108 is 4 or more.
- **OLD dependencies and shared-resource effects:** Var 0x4108 (writers in the flags table).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 551 msg 1
- **Other affected callers or records:** None found (L36 only).
- **Unresolved questions:** None beyond the Inferred branch direction.
- **Validation needed:** Text-box fit after any edit; talk with 0x4108 at 4 or more (static inspection only, no runtime test).

### Map 068 message coverage
Text archive 551 holds 3 messages. Every message is cited: msg 0 → CGC-DLG-068-03a, msg 1 → CGC-DLG-068-03b, msg 2 → CGC-DLG-068-02a. Unreferenced messages: none. Blank padding messages: none.

## Map 069 — Cherrygrove City Pokémon Center 1F (T21PC0101)

### Map 069 reading notes
- **Sources:** `get_events {mapHeader: 69}` (event file 66), `get_script {file: 625}` (level script, 2 entries), `get_script {file: 852}` and `project/scripts/0852.script` (6 scripts, 2 functions, 0 actions; 77 lines = 70 live + 7 header; all 70 live lines of `get_script` were compared with the pulled file and match), `get_text {archive: 552}` (6 messages), `get_world_data mapHeader 69` and header 67 warps. Header facts: internal name T21PC0101, location Cherrygrove City (id 127), matrix 73, script file 852, level script 625, text archive 552, event file 66, music 1063 day/night, weather 0, wild 255, flags 114, `areaDataId 26`, `locationType 4`, `followMode 1`. Text archive 552 is used by header 69 only (arm9 header table).
- **Room identity:** Pokémon Center 1F (Verified: internal name PC, an object that calls `CommonScript 2002`; "1F" Inferred from msgs 2 and 3 of archive 552, which say the Communication Center is "upstairs", and warp 1, which leads to header 144).
- **Dialogue rendering:** see Conventions, Text rendering. Archive 552 has no `{...}` tokens.
- **Scope:** the Center is entered from the exterior (header 67 warp 0 at global 564,391 → header 69, anchor 0) and left by warp 0 (8,19 → header 67 anchor 0). Warp 1 (14,17) leads to the 2F (header 144, anchor 0). Local content: the nurse call, three talk NPCs (overworld idx 4, 5, 6), two "not open yet" counter ladies, and one spawnable. Objects with scriptNumber 9001, 9003, 9017 (global id space above 9000), 2025 (Common script id), spawnable scriptNumber 0, and the level script ids 9000, 9012, 9013 are not documented here (see Unresolved references and conditions).
- **Position pairs:** overworld idx 2 and idx 8 share tile (6,4); idx 3 and idx 9 share tile (11,4). Each pair uses opposite hide flags (789 for idx 2 and 3; 790 for idx 8 and 9), so at most one of each pair is shown for a given flag state (direct reading of the hide-flag rule).
- **hg-engine dependency:** the nurse call goes to common script file 3 (id 2002), which hg-engine regenerates in builds (`scr_seq_0003_002`; see GLB-RTN-2002); the working ROM's file 3 is not the built behaviour.

### Map 069 event inventory
Coordinates are global tiles; matrix cell (0,0) for every entry. Every entry maps to a record in this section.

| Section | Idx | Type | owID / sprite (overlayTableEntry) | Coordinates | Flag (hides when set) | scriptNumber | Covered by |
|---|---|---|---|---|---|---|---|
| overworld | 0 | Normal, movement 15 face down, orient 1 | owID 0 / 335 | 8,11 | 0 | 1 | CGC-EVT-069-01 |
| overworld | 1 | Normal, movement 15 face down, orient 1 | owID 1 / 336 | 2,4 | 0 | 9017 | CGC-EVT-069-O1 |
| overworld | 2 | Normal, movement 15 face down, orient 1 | owID 2 / 336 | 6,4 | 789 | 9003 | CGC-EVT-069-O2 |
| overworld | 3 | Normal, movement 15 face down, orient 1 | owID 3 / 336 | 11,4 | 789 | 9001 | CGC-EVT-069-O3 |
| overworld | 4 | Normal, movement 14 face up, orient 0 | owID 4 / 332 | 6,13 | 0 | 2 | CGC-EVT-069-02 |
| overworld | 5 | Normal, movement 5 walking left/right (xRange 1, yRange 0), orient 2 | owID 5 / 341 | 11,16 | 0 | 3 | CGC-EVT-069-03 |
| overworld | 6 | Normal, movement 14 face up, orient 0 | owID 6 / 325 | 2,16 | 0 | 4 | CGC-EVT-069-04 |
| overworld | 7 | Normal, movement 0 none, orient 2 | owID 7 / 335 | 13,17 | 403 | 2025 | CGC-EVT-069-O7 |
| overworld | 8 | Normal, movement 15 face down, orient 1 | owID 8 / 336 | 6,4 | 790 | 5 | CGC-EVT-069-05 |
| overworld | 9 | Normal, movement 15 face down, orient 1 | owID 9 / 336 | 11,4 | 790 | 6 | CGC-EVT-069-06 |
| spawnable | 0 | Misc (type 0), dir 3 "Activated from behind" | - | 4,8 | - | 0 | CGC-EVT-069-S0 |
| warp | 0 | to header 67, anchor 0, height 0 | - | 8,19 | - | - | CGC-EVT-069-W0 |
| warp | 1 | to header 144, anchor 0, height 0 | - | 14,17 | - | - | CGC-EVT-069-W1 |
| level script 625 | entry 1 | screenReset, scriptId 9000 | - | - | - | 9000 | CGC-EVT-069-LS1 |
| level script 625 | entry 2 | variableValue: var 16691 == 2 → 9013; var 16691 == 1 → 9012 | - | - | - | 9013, 9012 | CGC-EVT-069-LS2 |
| script 1 | - | called by overworld idx 0 | - | - | - | 1 | CGC-EVT-069-01 |
| triggers | - | none (count 0) | - | - | - | - | - |

### Map 069 flags and variables (readers and writers)
Search basis and file → header method as for Map 068. Event files and level scripts of other maps were not searched for these numbers.

| Name (flags.s / vars.s) | Number | Read by | Written by |
|---|---|---|---|
| FLAG_HIDE_COMM_CLUB_RECEPTIONISTS | 789 | event file 66 overworld 2 and 3 (hide flag) | set: 0149 L149 (no header; invocation Unresolved). cleared: 0229 L209 (header 143 R30R0201, Route 30 interior). No CheckFlag reader |
| FLAG_HIDE_COMM_CLUB_CLOSED_LADIES | 790 | event file 66 overworld 8 and 9 (hide flag) | set: 0229 L208 (header 143). No ClearFlag in any script. No CheckFlag reader |
| FLAG_HIDE_WIFI_CLUB_CLOSED_LADY | 403 | event file 66 overworld 7 (hide flag) | set: 0859 L44 (header 135 T22GYM0101, Violet City Gym). No ClearFlag in any script. No CheckFlag reader |
| VAR_SCENE_ELMS_LAB | 0x4108 (16648) | 0852 Script 4 L38 (`CompareVarValue 0x4108 3`); 0851 L34 (header 68); 0843, 0845, 0848 | as in the Map 068 table |
| VAR_UNK_4133 | 0x4133 (16691) | level script 625 entry 2 (watches it: value 2 → script 9013, value 1 → script 9012); 0004 L10 (compare 2), L12 (compare 1); 0907 L36 (compare 6, header 207 T25R1201) | 0004 L209, L524 (=2), L530, L560, L561, L649 (=2), L890 (=1) (script file 0004: no header uses it); 0119 L1302 (=1), L1320 (=0) (header 173 D47R0101, Safari Zone Gate); 0166 L14, L191, L615 (=5), L712 (script file 0166: no header uses it); 0907 L236, L254, L367, L436 (=6), L494, L516 (header 207). Values not listed are 0 |
| `0x8007` | 0x8007 | passed into the global routine GLB-RTN-2002 (what it does with it: global, not documented) | 0852 Script 1 L10 (`SetVar 0x8007 0`) |

Script file 852 reads and writes no flag. The local variables it touches are 0x4108 (read) and 0x8007 (write).

### Map 069 event records

#### CGC-EVT-069-01 — Nurse call (script 1)
##### Record identity
- **Record ID:** CGC-EVT-069-01
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** None
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** Talk-to NPC, event file 66 overworld idx 0 (owID 0, sprite 335, at 8,11, movement 15 face down, orient 1, no hide flag)
- **Source references:** script file 852 Script#1 (0852.script L9-12); event file 66 overworld idx 0
- **Evidence status:** Verified (script and event); Inferred (that the NPC is the nurse: no text names it; it calls the nurse routine)
##### OLD — Current content
- **OLD dialogue:** None local. The nurse's lines are global (GLB-RTN-2002); not documented here.
- **OLD raw message data:** None local.
- **OLD trigger:** Player talks to overworld idx 0 (`scriptNumber` 1).
- **OLD conditions and branch priority:** None in this file.
- **OLD event sequence:** (1) Talk; no prerequisite. (2)-(3) `SetVar 0x8007 0` (L10), then `CommonScript 2002` (L11); everything after the call runs in the global routine (global, not documented). (4) This script has no `LockAll`/`FacePlayer` of its own. (5) `0x8007` = 0 (scratch variable set before the call; what the routine does with it is global, not documented). (6) `End` (L12); the routine ends the script; repeatable. (7) Calls GLB-RTN-2002.
- **OLD state changes:** `0x8007` = 0 (scratch). Anything else is the global routine's (GLB-RTN-2002; global, not documented).
- **OLD repeat/completion behavior:** Repeatable on every talk.
- **OLD dependencies and shared-resource effects:** Common script file 3 id 2002 (25 callers across Pokémon Center scripts per the global map). hg-engine regenerates file 3 in builds (`scr_seq_0003_002`).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** script file 852 Script#1; event file 66 overworld idx 0
- **Other affected callers or records:** GLB-RTN-2002 (shared with every Pokémon Center).
- **Unresolved questions:** What the routine does with the value 0 in `0x8007` (global, not documented).
- **Validation needed:** Talk to this nurse once; static inspection only, no runtime test.

#### CGC-EVT-069-02 — NPC praising the free PC (script 2)
##### Record identity
- **Record ID:** CGC-EVT-069-02
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-069-02a
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** Talk-to NPC, event file 66 overworld idx 4 (owID 4, sprite 332, at 6,13, movement 14 face up, orient 0, no hide flag)
- **Source references:** script file 852 Script#2 (L14-22); event file 66 overworld idx 4; text archive 552 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** One message, msg 0 (CGC-DLG-069-02a).
- **OLD raw message data:** See the dialogue record.
- **OLD trigger:** Player talks to overworld idx 4 (`scriptNumber` 2): `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Talk. (2) `Message 0` (L18), `WaitButton`, `CloseMessage`. (3)-(5) None. (6) `ReleaseAll`, `End` (L21-22); repeatable. (7) None.
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
- **Replacement target:** text archive 552 msg 0; script file 852 Script#2; event file 66 overworld idx 4
- **Other affected callers or records:** None found (msg 0 only at L18).
- **Unresolved questions:** Who the NPC is (sprite 332) is not stated by the data.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

#### CGC-EVT-069-03 — NPC saying the PC is free (script 3)
##### Record identity
- **Record ID:** CGC-EVT-069-03
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-069-03a
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** Talk-to NPC, event file 66 overworld idx 5 (owID 5, sprite 341, at 11,16, movement 5 walking left/right, xRange 1, yRange 0, orient 2, no hide flag)
- **Source references:** script file 852 Script#3 (L24-32); event file 66 overworld idx 5; text archive 552 msg 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** One message, msg 1 (CGC-DLG-069-03a).
- **OLD raw message data:** See the dialogue record.
- **OLD trigger:** Player talks to overworld idx 5 (`scriptNumber` 3): `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Talk. (2) `Message 1` (L28), `WaitButton`, `CloseMessage`. (3)-(5) None. (6) `ReleaseAll`, `End` (L31-32); repeatable. (7) None.
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
- **Replacement target:** text archive 552 msg 1; script file 852 Script#3; event file 66 overworld idx 5
- **Other affected callers or records:** None found (msg 1 only at L28).
- **Unresolved questions:** Who the NPC is (sprite 341) is not stated by the data.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

#### CGC-EVT-069-04 — NPC talking about the Communication Center upstairs, text by variable 0x4108 (script 4)
##### Record identity
- **Record ID:** CGC-EVT-069-04
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-069-04a, CGC-DLG-069-04b
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** Talk-to NPC, event file 66 overworld idx 6 (owID 6, sprite 325, at 2,16, movement 14 face up, orient 0, no hide flag)
- **Source references:** script file 852 Script#4 (L34-41) and Function#1 (L64-69), Function#2 (L71-75); event file 66 overworld idx 6; text archive 552 msgs 2 and 3
- **Evidence status:** Verified (commands); Inferred (that `JumpIf LESS` branches when the variable is below the compared value)
##### OLD — Current content
- **OLD dialogue:** Two messages by branch: msg 2 (CGC-DLG-069-04a) and msg 3 (CGC-DLG-069-04b).
- **OLD raw message data:** See the dialogue records.
- **OLD trigger:** Player talks to overworld idx 6 (`scriptNumber` 4): `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** Direct: (1) `CompareVarValue 0x4108 3` (L38) then `JumpIf LESS Function#1` (L39): variable below 3 → Function#1 (msg 2). (2) Otherwise falls through to `Message 3` (L40) then `Jump Function#2`. Var 0x4108 is VAR_SCENE_ELMS_LAB; writers in the flags table.
- **OLD event sequence:** (1) Talk. (2) Branch above. (3) Two branches. (4) None. (5) None. (6) Function#1: `Message 2`, `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. Function#2 (after msg 3): `WaitButton`, `CloseMessage`, `ReleaseAll`, `End`. Repeatable. (7) None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable; the text depends on the current value of 0x4108.
- **OLD dependencies and shared-resource effects:** Var 0x4108, shared with CGC-EVT-068-03 (threshold 4 there, 3 here).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 552 msgs 2 and 3; script file 852 Script#4 and Functions 1-2; event file 66 overworld idx 6
- **Other affected callers or records:** Msgs 2 and 3 only at L65 and L40. Shares var 0x4108 with CGC-EVT-068-03. Outside Cherrygrove the var is written by 0229 L213, 0112 L275/L292, 0858 L121/L134, 0859 L42 and 0843, and read by 0845 L49, 0848 L15 and 0843 (see Dependency references).
- **Unresolved questions:** Who the NPC is (sprite 325) is not stated by the data. `JumpIf LESS` semantics follow the engine's reading (not independently verified).
- **Validation needed:** Talk with 0x4108 below 3 and at 3 or more (static inspection only, no runtime test).

#### CGC-EVT-069-05 — Counter lady: "Wireless Club Union Room" not open yet (script 5, hide flag 790)
##### Record identity
- **Record ID:** CGC-EVT-069-05
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-069-05a, CGC-EVT-069-O2, CGC-EVT-069-06
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** Talk-to NPC, event file 66 overworld idx 8 (owID 8, sprite 336, at 6,4, movement 15 face down, orient 1, hide flag 790 = FLAG_HIDE_COMM_CLUB_CLOSED_LADIES)
- **Source references:** script file 852 Script#5 (L43-51); event file 66 overworld idx 8; text archive 552 msg 4
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** One message, msg 4 (CGC-DLG-069-05a).
- **OLD raw message data:** See the dialogue record.
- **OLD trigger:** Player talks to overworld idx 8 (`scriptNumber` 5) while it exists: `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** Direct: hidden while flag 790 is set. Indirect: 790 is set by 0229 L208 (header 143) and never cleared by any script; the object shares tile (6,4) with overworld idx 2 (hide flag 789).
- **OLD event sequence:** (1) Talk to the visible object. (2) `Message 4` (L47), `WaitButton`, `CloseMessage`. (3)-(5) None. (6) `ReleaseAll`, `End` (L50-51); repeatable. (7) None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable while visible.
- **OLD dependencies and shared-resource effects:** Flag 790 (0229); flag 789 on the paired object (0149, 0229).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 552 msg 4; script file 852 Script#5; event file 66 overworld idx 8
- **Other affected callers or records:** None found for the message (msg 4 only at L47). Paired object CGC-EVT-069-O2; sibling CGC-EVT-069-06. The visibility flags 789/790 are written by 0149 L149 (sets 789) and 0229 L208-209 (sets 790, clears 789).
- **Unresolved questions:** Whether the object is visible at the start of the game depends on flag 790's initial value (flags start clear is Inferred) and on whether 0149 runs.
- **Validation needed:** Check which of the pair (idx 2 or idx 8) is shown at (6,4) in the start state and after the 0229 step; static inspection only, no runtime test.

#### CGC-EVT-069-06 — Counter lady: "Communication Club Colosseum" not open yet (script 6, hide flag 790)
##### Record identity
- **Record ID:** CGC-EVT-069-06
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-069-06a, CGC-EVT-069-O3, CGC-EVT-069-05
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** Talk-to NPC, event file 66 overworld idx 9 (owID 9, sprite 336, at 11,4, movement 15 face down, orient 1, hide flag 790 = FLAG_HIDE_COMM_CLUB_CLOSED_LADIES)
- **Source references:** script file 852 Script#6 (L53-61); event file 66 overworld idx 9; text archive 552 msg 5
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** One message, msg 5 (CGC-DLG-069-06a).
- **OLD raw message data:** See the dialogue record.
- **OLD trigger:** Player talks to overworld idx 9 (`scriptNumber` 6) while it exists: `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** Direct: hidden while flag 790 is set. Indirect: as CGC-EVT-069-05; shares tile (11,4) with overworld idx 3 (hide flag 789).
- **OLD event sequence:** (1) Talk to the visible object. (2) `Message 5` (L57), `WaitButton`, `CloseMessage`. (3)-(5) None. (6) `ReleaseAll`, `End` (L60-61); repeatable. (7) None.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Repeatable while visible.
- **OLD dependencies and shared-resource effects:** Flag 790 (0229); flag 789 on the paired object.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 552 msg 5; script file 852 Script#6; event file 66 overworld idx 9
- **Other affected callers or records:** None found for the message (msg 5 only at L57). Paired object CGC-EVT-069-O3; sibling CGC-EVT-069-05. The visibility flags 789/790 are written by 0149 L149 (sets 789) and 0229 L208-209 (sets 790, clears 789).
- **Unresolved questions:** As CGC-EVT-069-05.
- **Validation needed:** As CGC-EVT-069-05, for the tile (11,4); static inspection only, no runtime test.

#### CGC-EVT-069-LS1 — Level script 625 entry 1: screenReset, scriptId 9000
##### Record identity
- **Record ID:** CGC-EVT-069-LS1
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-069-LS2
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** Level script file 625, entry 1 of 2
- **Source references:** `get_script {file: 625}` (28 bytes, 2 entries); header 69 `levelScriptId` 625
- **Evidence status:** Verified (entry); Unresolved (what script 9000 does)
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Entry 1: `screenReset`, scriptId 9000.
- **OLD conditions and branch priority:** None; stored first of two entries.
- **OLD event sequence:** (1) Screen reset (the engine event type; timing is engine behaviour, not verified). (2) Script id 9000 runs; script file 852 has only 6 scripts, so 9000 is not in this map's file; its target is global, not documented. (3)-(7) Not determinable.
- **OLD state changes:** Not determinable.
- **OLD repeat/completion behavior:** Every screen reset (engine behaviour, not verified).
- **OLD dependencies and shared-resource effects:** Id 9000 is in the id space above 9000 whose target file is not named by the tools.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** level script file 625 (replaced whole by `set_script levelScript`)
- **Other affected callers or records:** CGC-EVT-069-LS2 (same file).
- **Unresolved questions:** Which script file id 9000 resolves to and what it does.
- **Validation needed:** Re-read the whole trigger list (both entries) before any write; static inspection only, no runtime test.

#### CGC-EVT-069-LS2 — Level script 625 entry 2: variableValue on 0x4133 (scripts 9013, 9012)
##### Record identity
- **Record ID:** CGC-EVT-069-LS2
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-069-LS1
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** Level script file 625, entry 2 of 2
- **Source references:** `get_script {file: 625}`; vars.s (VAR_UNK_4133 = 0x4133 = 16691)
- **Evidence status:** Verified (entries); Unresolved (what scripts 9013 and 9012 do)
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Entry 2: `variableValue` list, in stored order: (a) variable 16691 equal to 2 → script 9013; (b) variable 16691 equal to 1 → script 9012.
- **OLD conditions and branch priority:** Direct: the variable value tested against 2 first, then 1; the two tests cannot both hold. Whether the engine runs one or all matching conditions is not verified. With the variable at 0 or any other value, neither runs.
- **OLD event sequence:** (1) Map load/entry evaluation of the list (engine behaviour, not verified). (2) Script 9013 or 9012 by value; neither is in script file 852 (6 scripts); both are global, not documented. (3)-(7) Not determinable.
- **OLD state changes:** Not determinable.
- **OLD repeat/completion behavior:** Evaluated each time the level script runs (engine behaviour, not verified).
- **OLD dependencies and shared-resource effects:** Var 0x4133 (VAR_UNK_4133): written by script files 0004, 0166 (no header), 0119 (header 173), 0907 (header 207), see the flags table.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** level script file 625 (replaced whole by `set_script levelScript`)
- **Other affected callers or records:** CGC-EVT-069-LS1; var 0x4133 writers.
- **Unresolved questions:** What scripts 9012 and 9013 do; what 0x4133 represents (the engine name is VAR_UNK_4133).
- **Validation needed:** Re-read the whole trigger list (both entries) before any write; static inspection only, no runtime test.

#### CGC-EVT-069-O1 — Object 1 (sprite 336, scriptNumber 9017)
##### Record identity
- **Record ID:** CGC-EVT-069-O1
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-069-O2, CGC-EVT-069-O3
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** Event file 66 overworld idx 1 (owID 1, sprite 336, at 2,4, movement 15 face down, orient 1, no hide flag)
- **Source references:** `get_events {mapHeader: 69}` overworld idx 1
- **Evidence status:** Verified (entry); Unresolved (script 9017)
##### OLD — Current content
- **OLD dialogue:** None found locally.
- **OLD raw message data:** None.
- **OLD trigger:** Talk to the object (`scriptNumber` 9017 is outside script file 852's 6 scripts; target global, not documented).
- **OLD conditions and branch priority:** None from the event file (hide flag 0, always present).
- **OLD event sequence:** (1) Talk. (2)-(7) Not determinable: global, not documented.
- **OLD state changes:** Not determinable.
- **OLD repeat/completion behavior:** Not determinable.
- **OLD dependencies and shared-resource effects:** Id 9017 (id space above 9000, target not determined). The same sprite (336) is used by the other counter objects here and in header 144.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 66 overworld idx 1
- **Other affected callers or records:** CGC-EVT-069-O2, CGC-EVT-069-O3.
- **Unresolved questions:** What script 9017 does and who the object is.
- **Validation needed:** None possible statically.

#### CGC-EVT-069-O2 — Object 2 (sprite 336, scriptNumber 9003, hide flag 789)
##### Record identity
- **Record ID:** CGC-EVT-069-O2
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-069-05, CGC-EVT-069-O3
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** Event file 66 overworld idx 2 (owID 2, sprite 336, at 6,4, movement 15 face down, orient 1, hide flag 789 = FLAG_HIDE_COMM_CLUB_RECEPTIONISTS)
- **Source references:** `get_events {mapHeader: 69}` overworld idx 2; flags.s
- **Evidence status:** Verified (entry); Unresolved (script 9003)
##### OLD — Current content
- **OLD dialogue:** None found locally.
- **OLD raw message data:** None.
- **OLD trigger:** Talk to the object while flag 789 is clear (`scriptNumber` 9003; target global, not documented).
- **OLD conditions and branch priority:** Direct: hidden while 789 is set. Indirect: 789 is set by 0149 L149 and cleared by 0229 L209 (header 143). Shares tile (6,4) with overworld idx 8 (CGC-EVT-069-05, hide flag 790).
- **OLD event sequence:** (1) Talk. (2)-(7) Not determinable: global, not documented.
- **OLD state changes:** Not determinable.
- **OLD repeat/completion behavior:** Not determinable.
- **OLD dependencies and shared-resource effects:** Flag 789; id 9003 (id space above 9000, target not determined).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 66 overworld idx 2
- **Other affected callers or records:** CGC-EVT-069-05 (same tile), CGC-EVT-069-O3. Hide flags of this pair are written outside Cherrygrove: 0149 L149 sets flag 789; 0229 L208 sets flag 790 and L209 clears flag 789.
- **Unresolved questions:** What script 9003 does; the role "receptionist" is read from flags.s only (Inferred).
- **Validation needed:** None possible statically.

#### CGC-EVT-069-O3 — Object 3 (sprite 336, scriptNumber 9001, hide flag 789)
##### Record identity
- **Record ID:** CGC-EVT-069-O3
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-069-06, CGC-EVT-069-O2
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** Event file 66 overworld idx 3 (owID 3, sprite 336, at 11,4, movement 15 face down, orient 1, hide flag 789 = FLAG_HIDE_COMM_CLUB_RECEPTIONISTS)
- **Source references:** `get_events {mapHeader: 69}` overworld idx 3; flags.s
- **Evidence status:** Verified (entry); Unresolved (script 9001)
##### OLD — Current content
- **OLD dialogue:** None found locally.
- **OLD raw message data:** None.
- **OLD trigger:** Talk to the object while flag 789 is clear (`scriptNumber` 9001; target global, not documented).
- **OLD conditions and branch priority:** Direct: hidden while 789 is set. Indirect: as CGC-EVT-069-O2. Shares tile (11,4) with overworld idx 9 (CGC-EVT-069-06, hide flag 790).
- **OLD event sequence:** (1) Talk. (2)-(7) Not determinable: global, not documented.
- **OLD state changes:** Not determinable.
- **OLD repeat/completion behavior:** Not determinable.
- **OLD dependencies and shared-resource effects:** Flag 789; id 9001 (id space above 9000, target not determined).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 66 overworld idx 3
- **Other affected callers or records:** CGC-EVT-069-06 (same tile), CGC-EVT-069-O2. Hide flags of this pair are written outside Cherrygrove: 0149 L149 sets flag 789; 0229 L208 sets flag 790 and L209 clears flag 789.
- **Unresolved questions:** What script 9001 does; the role is read from flags.s only (Inferred).
- **Validation needed:** None possible statically.

#### CGC-EVT-069-O7 — Object 7 (sprite 335, scriptNumber 2025, hide flag 403)
##### Record identity
- **Record ID:** CGC-EVT-069-O7
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-069-W1
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** Event file 66 overworld idx 7 (owID 7, sprite 335, at 13,17, movement 0 none, orient 2, hide flag 403 = FLAG_HIDE_WIFI_CLUB_CLOSED_LADY)
- **Source references:** `get_events {mapHeader: 69}` overworld idx 7; flags.s; GLB-RTN-2025
- **Evidence status:** Verified (entry); Inferred (that `scriptNumber` 2025 runs common script 2025, since ids from 2000 up are common scripts in file 3)
##### OLD — Current content
- **OLD dialogue:** None local. GLB-RTN-2025 uses a global prompt (GLB-PRM-40-68); not documented here.
- **OLD raw message data:** None local.
- **OLD trigger:** Talk to the object while flag 403 is clear. `scriptNumber` 2025 is outside script file 852's 6 scripts.
- **OLD conditions and branch priority:** Direct: hidden while flag 403 is set. Indirect: 403 is set by 0859 L44 (header 135, Violet City Gym) and never cleared by any script. The object stands at (13,17), next to warp 1 (14,17) to the 2F.
- **OLD event sequence:** (1) Talk. (2)-(7) Runs GLB-RTN-2025 (if `scriptNumber` 2025 dispatches to common script 2025, Inferred); content global, not documented.
- **OLD state changes:** None locally.
- **OLD repeat/completion behavior:** Not determinable beyond object visibility (the routine is global, not documented).
- **OLD dependencies and shared-resource effects:** Common script file 3 id 2025 (hg-engine regenerates file 3: `scr_seq_0003_025`); flag 403 (0859).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 66 overworld idx 7 (its hide flag 403 and scriptNumber)
- **Other affected callers or records:** GLB-RTN-2025 (called here from the event file, not from a script); script file 0859.
- **Unresolved questions:** Whether `scriptNumber` 2025 in an event file is dispatched to common script 2025 (Inferred, not verified); whether the sprite 335 object is the same kind as the nurse (same sprite number, no data names either).
- **Validation needed:** Check the object and the stairs access before and after the Violet City Gym step; static inspection only, no runtime test.

#### CGC-EVT-069-S0 — Spawnable 0 (Misc, scriptNumber 0, at 4,8)
##### Record identity
- **Record ID:** CGC-EVT-069-S0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** None
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** Event file 66 spawnable idx 0 (type Misc, at global 4,8, dir 3 "Activated from behind")
- **Source references:** `get_events {mapHeader: 69}` spawnables idx 0
- **Evidence status:** Verified (entry); Unresolved (what scriptNumber 0 does)
##### OLD — Current content
- **OLD dialogue:** None found.
- **OLD raw message data:** None.
- **OLD trigger:** Interaction from behind at (4,8), if the engine runs a script for scriptNumber 0.
- **OLD conditions and branch priority:** None from the data.
- **OLD event sequence:** (1) Interaction. (2)-(7) Not determinable: script numbering in file 852 starts at 1 (6 scripts), so 0 names no script of this file; the engine's handling of 0 is not stated by the data.
- **OLD state changes:** Not determinable.
- **OLD repeat/completion behavior:** Not determinable.
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
- **Replacement target:** event file 66 spawnable idx 0
- **Other affected callers or records:** None found.
- **Unresolved questions:** What an interaction does when scriptNumber is 0.
- **Validation needed:** Interact with the tile in game (not statically decidable; static inspection only, no runtime test).

#### CGC-EVT-069-W0 — Warp to Cherrygrove City exterior (8,19)
##### Record identity
- **Record ID:** CGC-EVT-069-W0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-069-W1, CGC-EVT-067-W0
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** Warp idx 0 at global (8,19), matrix cell (0,0) tile (8,19)
- **Source references:** `get_events {mapHeader: 69}` warps idx 0; `get_events {mapHeader: 67}` warps idx 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Player steps on (8,19).
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Step. (2)-(7) Warp to header 67 (Cherrygrove City exterior), anchor 0, height 0.
- **OLD state changes:** Map change.
- **OLD repeat/completion behavior:** Always available.
- **OLD dependencies and shared-resource effects:** Header 67 warp 0 (global 564,391) leads here with anchor 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 66 warp idx 0
- **Other affected callers or records:** CGC-EVT-067-W0 (header 67 event file 64 warp idx 0, the outward warp).
- **Unresolved questions:** `anchor` semantics (anchor 0 matches header 67's warp 0; consistent with an index into the destination's warp list; not stated by the data).
- **Validation needed:** Enter and leave the Center (static inspection only, no runtime test).

#### CGC-EVT-069-W1 — Warp to the 2F (14,17)
##### Record identity
- **Record ID:** CGC-EVT-069-W1
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-069-W0, CGC-EVT-069-O7, CGC-EVT-144-W0
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** Warp idx 1 at global (14,17), matrix cell (0,0) tile (14,17)
- **Source references:** `get_events {mapHeader: 69}` warps idx 1; `get_events {mapHeader: 144}` warps idx 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Player steps on (14,17).
- **OLD conditions and branch priority:** None on the warp itself. The object CGC-EVT-069-O7 stands at (13,17) beside it.
- **OLD event sequence:** (1) Step. (2)-(7) Warp to header 144 (Pokémon Center 2F), anchor 0, height 0.
- **OLD state changes:** Map change.
- **OLD repeat/completion behavior:** Always available.
- **OLD dependencies and shared-resource effects:** Header 144 warp 0 (14,10) returns here with anchor 1.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 66 warp idx 1
- **Other affected callers or records:** CGC-EVT-144-W0 (return), CGC-EVT-069-O7.
- **Unresolved questions:** `anchor` semantics as above.
- **Validation needed:** Walk upstairs and back (static inspection only, no runtime test).

#### CGC-DLG-069-02a — "I can store any number of Pokémon, and it's all free"
##### Record identity
- **Record ID:** CGC-DLG-069-02a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-069-02
- **Related record IDs:** None
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** NPC at overworld idx 4 (owID 4)
- **Source references:** script file 852 Script#2 (`Message 0`, L18); text archive 552 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `It’s great. I can store any number / of Pokémon, and it’s all free.`
- **OLD raw message data:** `It’s great. I can store any number\nof Pokémon, and it’s all free.`
- **OLD trigger:** Shown by CGC-EVT-069-02 on every interaction.
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
- **Replacement target:** text archive 552 msg 0
- **Other affected callers or records:** None found (L18 only).
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

#### CGC-DLG-069-03a — "That PC is free for any Trainer to use"
##### Record identity
- **Record ID:** CGC-DLG-069-03a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-069-03
- **Related record IDs:** None
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** NPC at overworld idx 5 (owID 5)
- **Source references:** script file 852 Script#3 (`Message 1`, L28); text archive 552 msg 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `That PC is free for any Trainer to use.`
- **OLD raw message data:** `That PC is free for any Trainer to use.`
- **OLD trigger:** Shown by CGC-EVT-069-03 on every interaction.
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
- **Replacement target:** text archive 552 msg 1
- **Other affected callers or records:** None found (L28 only).
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

#### CGC-DLG-069-04a — Communication Center "still finishing it up" (variable below 3)
##### Record identity
- **Record ID:** CGC-DLG-069-04a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-069-04
- **Related record IDs:** CGC-DLG-069-04b
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** NPC at overworld idx 6 (owID 6)
- **Source references:** script file 852 Function#1 (`Message 2`, L65), reached by Script#4 L39; text archive 552 msg 2
- **Evidence status:** Verified (message and call); Inferred (branch direction)
##### OLD — Current content
- **OLD dialogue:** `The Communication Center upstairs / was just built. [scroll] But they’re still finishing it up.`
- **OLD raw message data:** `The Communication Center upstairs\nwas just built.\rBut they’re still finishing it up.`
- **OLD trigger:** CGC-EVT-069-04 when `JumpIf LESS` on `CompareVarValue 0x4108 3` is taken.
- **OLD conditions and branch priority:** First branch, tested before msg 3: var 0x4108 below 3. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent sequence, then `WaitButton`, `CloseMessage`, `ReleaseAll`.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction while 0x4108 is below 3.
- **OLD dependencies and shared-resource effects:** Var 0x4108.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 552 msg 2
- **Other affected callers or records:** None found (L65 only).
- **Unresolved questions:** None beyond the Inferred branch direction.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

#### CGC-DLG-069-04b — Communication Center "I traded Pokémon there already" (variable 3 or more)
##### Record identity
- **Record ID:** CGC-DLG-069-04b
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-069-04
- **Related record IDs:** CGC-DLG-069-04a
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** NPC at overworld idx 6 (owID 6)
- **Source references:** script file 852 Script#4 (`Message 3`, L40, then `Jump Function#2`); text archive 552 msg 3
- **Evidence status:** Verified (message and call); Inferred (branch direction)
##### OLD — Current content
- **OLD dialogue:** `The Communication Center upstairs / was just built. [scroll] I traded Pokémon there already!`
- **OLD raw message data:** `The Communication Center upstairs\nwas just built.\rI traded Pokémon there already!`
- **OLD trigger:** CGC-EVT-069-04 when the 0x4108 comparison does not take the branch.
- **OLD conditions and branch priority:** Second (fall-through) branch: var 0x4108 equal to or above 3. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent sequence, then Function#2 (`WaitButton`, `CloseMessage`, `ReleaseAll`).
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction while 0x4108 is 3 or more.
- **OLD dependencies and shared-resource effects:** Var 0x4108.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 552 msg 3
- **Other affected callers or records:** None found (L40 only).
- **Unresolved questions:** None beyond the Inferred branch direction.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

#### CGC-DLG-069-05a — Union Room "not open yet"
##### Record identity
- **Record ID:** CGC-DLG-069-05a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-069-05
- **Related record IDs:** CGC-DLG-069-06a
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** Counter lady at overworld idx 8 (owID 8)
- **Source references:** script file 852 Script#5 (`Message 4`, L47); text archive 552 msg 4
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Welcome to the Pokémon Wireless / Club Union Room. [scroll] ...Oh, I was just trying to learn that / line by heart. [scroll] It’ll take a little longer before / we open the Union Room.`
- **OLD raw message data:** `Welcome to the Pokémon Wireless\nClub Union Room.\r...Oh, I was just trying to learn that\nline by heart.\rIt’ll take a little longer before\nwe open the Union Room.`
- **OLD trigger:** Shown by CGC-EVT-069-05 on every interaction.
- **OLD conditions and branch priority:** None in the script; the object itself is hidden while flag 790 is set. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent sequence.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction.
- **OLD dependencies and shared-resource effects:** Flag 790 (object visibility).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 552 msg 4
- **Other affected callers or records:** None found (L47 only).
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

#### CGC-DLG-069-06a — Colosseum "not open yet"
##### Record identity
- **Record ID:** CGC-DLG-069-06a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-069-06
- **Related record IDs:** CGC-DLG-069-05a
- **Map or system:** Cherrygrove City Pokémon Center 1F (header 69, T21PC0101)
- **Speaker, object, or trigger:** Counter lady at overworld idx 9 (owID 9)
- **Source references:** script file 852 Script#6 (`Message 5`, L57); text archive 552 msg 5
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Welcome to the Pokémon / Communication Club Colosseum. [scroll] ...Oh, I was just trying to learn that / line by heart. [scroll] It’ll take a little longer before / we open the Colosseum.`
- **OLD raw message data:** `Welcome to the Pokémon\nCommunication Club Colosseum.\r...Oh, I was just trying to learn that\nline by heart.\rIt’ll take a little longer before\nwe open the Colosseum.`
- **OLD trigger:** Shown by CGC-EVT-069-06 on every interaction.
- **OLD conditions and branch priority:** None in the script; the object itself is hidden while flag 790 is set. Reachability: Referenced and apparently reachable.
- **OLD event sequence:** Step (2) of the parent sequence.
- **OLD state changes:** None.
- **OLD repeat/completion behavior:** Every interaction.
- **OLD dependencies and shared-resource effects:** Flag 790 (object visibility).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** text archive 552 msg 5
- **Other affected callers or records:** None found (L57 only).
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

### Map 069 message coverage
Text archive 552 holds 6 messages. Every message is cited: msg 0 → CGC-DLG-069-02a, msg 1 → CGC-DLG-069-03a, msg 2 → CGC-DLG-069-04a, msg 3 → CGC-DLG-069-04b, msg 4 → CGC-DLG-069-05a, msg 5 → CGC-DLG-069-06a. Unreferenced messages: none. Blank padding messages: none.

## Map 144 — Cherrygrove City Pokémon Center 2F (T21PC0102)

### Map 144 reading notes
- **Sources:** `get_events {mapHeader: 144}` (event file 140), `get_script {file: 626}` (level script, 2 entries), `get_script {file: 853}` and `project/scripts/0853.script` (1 script, 0 functions, 0 actions; 13 lines = 6 live + 7 header; all 6 live lines of `get_script` match the pulled file), `get_world_data mapHeader 144`, arm9 header table (text-archive users), `get_events {mapHeader: 69}` warps. Header facts: internal name T21PC0102, location Cherrygrove City (id 127), matrix 77, script file 853, level script 626, text archive 3, event file 140, music 1063 day/night, weather 0, wild 255, flags 114, `areaDataId 26`, `locationType 4`, `followMode 1`.
- **Room identity:** the upper floor of the Pokémon Center (Inferred: the internal name T21PC0102 follows T21PC0101; header 69's text calls the Communication Center "upstairs"; header 69 warp 1 and this map's warp 0 lead to each other).
- **Scope:** all three overworlds and both level-script entries use script ids in the 9000s (9201-9203, 9200, 9204, 9205), which are not scripts of file 853 (it has only one script, `End`); they are global, not documented. The only local behaviour is the warp back to 1F.
- **Text archive 3 (Verified):** script file 853 contains no `Message` command, so this map's scripts cite no message from archive 3. Archive 3 (1,404 messages, `get_text`) is named by this header (`get_world_data` header 144, `textArchiveId` 3, Verified). It is treated as a shared, global archive; the earlier pass counted 143 of the 540 map headers naming it, a figure the audit did not re-verify (Inferred). Its messages are out of scope; no message is inventoried here.
- **Level script 626** has two entries, so its records are CGC-EVT-144-LS1 and CGC-EVT-144-LS2.

### Map 144 event inventory
Coordinates are global tiles; matrix cell (0,0) for every entry. Every entry maps to a record in this section.

| Section | Idx | Type | owID / sprite (overlayTableEntry) | Coordinates | Flag (hides when set) | scriptNumber | Covered by |
|---|---|---|---|---|---|---|---|
| overworld | 0 | Normal, movement 15 face down, orient 1 | owID 0 / 286 | 4,4 | 0 | 9203 | CGC-EVT-144-O0 |
| overworld | 1 | Normal, movement 15 face down, orient 1 | owID 1 / 336 | 8,4 | 0 | 9202 | CGC-EVT-144-O1 |
| overworld | 2 | Normal, movement 15 face down, orient 1 | owID 2 / 336 | 12,4 | 0 | 9201 | CGC-EVT-144-O2 |
| warp | 0 | to header 69, anchor 1, height 0 | - | 14,10 | - | - | CGC-EVT-144-W0 |
| level script 626 | entry 1 | variableValue: var 16663 == 0 → 9200; var 16695 == 1 → 9204 | - | - | - | 9200, 9204 | CGC-EVT-144-LS1 |
| level script 626 | entry 2 | loadGame, scriptId 9205 | - | - | - | 9205 | CGC-EVT-144-LS2 |
| script 1 | - | `End` only; no event entry names it | - | - | - | 1 | CGC-EVT-144-01 |
| spawnables / triggers | - | none (counts 0 and 0) | - | - | - | - | - |

### Map 144 flags and variables (readers and writers)
Search basis and file → header method as for Map 068. Event files and level scripts of other maps were not searched for these numbers. Script file 853 contains no flag, variable, item or global-call command; all hide flags of event file 140 are 0.

| Name (flags.s / vars.s) | Number | Read by | Written by |
|---|---|---|---|
| VAR_SCENE_POKECENTER_WIFI_BASEMENT | 0x4117 (16663) | level script 626 entry 1 (value 0 → script 9200) | 0164 L229 (=1) (script file 0164: no header uses it) |
| VAR_UNK_4137 | 0x4137 (16695) | level script 626 entry 1 (value 1 → script 9204) | 0147 L76 (=1) (header 516 HIROBA, Mystery Zone); 0164 L89 (=0) (no header) |

No CheckVar-style reader of either variable exists in any `project/scripts/*.script` (only the SetVar writers above were found).

### Map 144 event records

#### CGC-EVT-144-01 — Script 1 (`End` only, unreferenced)
##### Record identity
- **Record ID:** CGC-EVT-144-01
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** None
- **Map or system:** Cherrygrove City Pokémon Center 2F (header 144, T21PC0102)
- **Speaker, object, or trigger:** None; no overworld, spawnable or trigger of event file 140 names script 1 (their scriptNumbers are 9201-9203), and level script 626 names ids 9200, 9204, 9205
- **Source references:** script file 853 Script#1 (0853.script L9-10)
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
- **Replacement target:** script file 853 Script#1
- **Other affected callers or records:** None found.
- **Unresolved questions:** None.
- **Validation needed:** None (static inspection only, no runtime test).

#### CGC-EVT-144-LS1 — Level script 626 entry 1: variableValue on 0x4117 and 0x4137 (scripts 9200, 9204)
##### Record identity
- **Record ID:** CGC-EVT-144-LS1
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-144-LS2
- **Map or system:** Cherrygrove City Pokémon Center 2F (header 144, T21PC0102)
- **Speaker, object, or trigger:** Level script file 626, entry 1 of 2
- **Source references:** `get_script {file: 626}` (28 bytes, 2 entries); vars.s (VAR_SCENE_POKECENTER_WIFI_BASEMENT = 0x4117 = 16663; VAR_UNK_4137 = 0x4137 = 16695)
- **Evidence status:** Verified (entries); Unresolved (what scripts 9200 and 9204 do)
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Entry 1: `variableValue` list, in stored order: (a) variable 16663 equal to 0 → script 9200; (b) variable 16695 equal to 1 → script 9204.
- **OLD conditions and branch priority:** Direct: two independent variables tested in stored order (16663 == 0 first, then 16695 == 1); they can hold together. Whether the engine runs one or all matching conditions is not verified. A variable that has never been written is 0 (Inferred), so test (a) is true until 0x4117 is set to 1 (written by 0164 L229).
- **OLD event sequence:** (1) Map load/entry evaluation of the list (engine behaviour, not verified). (2) Script 9200 and/or 9204; neither is in script file 853 (1 script); both global, not documented. (3)-(7) Not determinable.
- **OLD state changes:** Not determinable.
- **OLD repeat/completion behavior:** Evaluated each time the level script runs (engine behaviour, not verified).
- **OLD dependencies and shared-resource effects:** Vars 0x4117 (writer 0164) and 0x4137 (writers 0147 header 516, 0164).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** level script file 626 (replaced whole by `set_script levelScript`)
- **Other affected callers or records:** CGC-EVT-144-LS2 (same file).
- **Unresolved questions:** What scripts 9200 and 9204 do.
- **Validation needed:** Re-read the whole trigger list (both entries) before any write; static inspection only, no runtime test.

#### CGC-EVT-144-LS2 — Level script 626 entry 2: loadGame, scriptId 9205
##### Record identity
- **Record ID:** CGC-EVT-144-LS2
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-144-LS1
- **Map or system:** Cherrygrove City Pokémon Center 2F (header 144, T21PC0102)
- **Speaker, object, or trigger:** Level script file 626, entry 2 of 2
- **Source references:** `get_script {file: 626}`; header 144 `levelScriptId` 626
- **Evidence status:** Verified (entry); Unresolved (what script 9205 does)
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Entry 2: `loadGame`, scriptId 9205 (the engine event type; when a save is loaded on this map, engine behaviour not verified).
- **OLD conditions and branch priority:** None; stored second.
- **OLD event sequence:** (1) Game load on this map. (2) Script 9205 runs; not in script file 853; global, not documented. (3)-(7) Not determinable.
- **OLD state changes:** Not determinable.
- **OLD repeat/completion behavior:** Each load (engine behaviour, not verified).
- **OLD dependencies and shared-resource effects:** Id 9205 (id space above 9000, target not determined).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** level script file 626 (replaced whole by `set_script levelScript`)
- **Other affected callers or records:** CGC-EVT-144-LS1.
- **Unresolved questions:** What script 9205 does.
- **Validation needed:** Re-read the whole trigger list (both entries) before any write; static inspection only, no runtime test.

#### CGC-EVT-144-O0 — Object 0 (sprite 286, scriptNumber 9203)
##### Record identity
- **Record ID:** CGC-EVT-144-O0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-144-O1, CGC-EVT-144-O2
- **Map or system:** Cherrygrove City Pokémon Center 2F (header 144, T21PC0102)
- **Speaker, object, or trigger:** Event file 140 overworld idx 0 (owID 0, sprite 286, at 4,4, movement 15 face down, orient 1, no hide flag)
- **Source references:** `get_events {mapHeader: 144}` overworld idx 0
- **Evidence status:** Verified (entry); Unresolved (script 9203)
##### OLD — Current content
- **OLD dialogue:** None found locally.
- **OLD raw message data:** None.
- **OLD trigger:** Talk to the object (`scriptNumber` 9203 is outside script file 853's one script; target global, not documented).
- **OLD conditions and branch priority:** None from the event file (hide flag 0).
- **OLD event sequence:** (1) Talk. (2)-(7) Not determinable: global, not documented.
- **OLD state changes:** Not determinable.
- **OLD repeat/completion behavior:** Not determinable.
- **OLD dependencies and shared-resource effects:** Id 9203 (id space above 9000, target not determined). Messages for this object, if any, would come from the map's text archive 3 (shared, global).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 140 overworld idx 0
- **Other affected callers or records:** CGC-EVT-144-O1, CGC-EVT-144-O2.
- **Unresolved questions:** What script 9203 does and who the object is.
- **Validation needed:** None possible statically.

#### CGC-EVT-144-O1 — Object 1 (sprite 336, scriptNumber 9202)
##### Record identity
- **Record ID:** CGC-EVT-144-O1
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-144-O0, CGC-EVT-144-O2
- **Map or system:** Cherrygrove City Pokémon Center 2F (header 144, T21PC0102)
- **Speaker, object, or trigger:** Event file 140 overworld idx 1 (owID 1, sprite 336, at 8,4, movement 15 face down, orient 1, no hide flag)
- **Source references:** `get_events {mapHeader: 144}` overworld idx 1
- **Evidence status:** Verified (entry); Unresolved (script 9202)
##### OLD — Current content
- **OLD dialogue:** None found locally.
- **OLD raw message data:** None.
- **OLD trigger:** Talk to the object (`scriptNumber` 9202; target global, not documented).
- **OLD conditions and branch priority:** None from the event file (hide flag 0).
- **OLD event sequence:** (1) Talk. (2)-(7) Not determinable: global, not documented.
- **OLD state changes:** Not determinable.
- **OLD repeat/completion behavior:** Not determinable.
- **OLD dependencies and shared-resource effects:** Id 9202 (id space above 9000, target not determined).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 140 overworld idx 1
- **Other affected callers or records:** CGC-EVT-144-O0, CGC-EVT-144-O2.
- **Unresolved questions:** What script 9202 does and who the object is.
- **Validation needed:** None possible statically.

#### CGC-EVT-144-O2 — Object 2 (sprite 336, scriptNumber 9201)
##### Record identity
- **Record ID:** CGC-EVT-144-O2
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-144-O0, CGC-EVT-144-O1
- **Map or system:** Cherrygrove City Pokémon Center 2F (header 144, T21PC0102)
- **Speaker, object, or trigger:** Event file 140 overworld idx 2 (owID 2, sprite 336, at 12,4, movement 15 face down, orient 1, no hide flag)
- **Source references:** `get_events {mapHeader: 144}` overworld idx 2
- **Evidence status:** Verified (entry); Unresolved (script 9201)
##### OLD — Current content
- **OLD dialogue:** None found locally.
- **OLD raw message data:** None.
- **OLD trigger:** Talk to the object (`scriptNumber` 9201; target global, not documented).
- **OLD conditions and branch priority:** None from the event file (hide flag 0).
- **OLD event sequence:** (1) Talk. (2)-(7) Not determinable: global, not documented.
- **OLD state changes:** Not determinable.
- **OLD repeat/completion behavior:** Not determinable.
- **OLD dependencies and shared-resource effects:** Id 9201 (id space above 9000, target not determined).
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 140 overworld idx 2
- **Other affected callers or records:** CGC-EVT-144-O0, CGC-EVT-144-O1.
- **Unresolved questions:** What script 9201 does and who the object is.
- **Validation needed:** None possible statically.

#### CGC-EVT-144-W0 — Warp back to the 1F (14,10)
##### Record identity
- **Record ID:** CGC-EVT-144-W0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-069-W1
- **Map or system:** Cherrygrove City Pokémon Center 2F (header 144, T21PC0102)
- **Speaker, object, or trigger:** Warp idx 0 at global (14,10), matrix cell (0,0) tile (14,10)
- **Source references:** `get_events {mapHeader: 144}` warps idx 0; `get_events {mapHeader: 69}` warps idx 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Player steps on (14,10).
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Step. (2)-(7) Warp to header 69 (Pokémon Center 1F), anchor 1, height 0.
- **OLD state changes:** Map change.
- **OLD repeat/completion behavior:** Always available.
- **OLD dependencies and shared-resource effects:** Header 69 warp 1 (14,17) leads here with anchor 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 140 warp idx 0
- **Other affected callers or records:** CGC-EVT-069-W1 (outward warp).
- **Unresolved questions:** `anchor` semantics (anchor 1 matches header 69's warp 1; consistent with an index into the destination's warp list; not stated by the data).
- **Validation needed:** Walk upstairs and back (static inspection only, no runtime test).

### Map 144 message coverage
Script file 853 reads no message, so no message of text archive 3 is cited from this map and no `CGC-DLG-144-` record exists. Archive 3 is treated as a shared archive (the 143-header count is Inferred, not re-verified) and is global, not documented. Unreferenced-message records: not applicable (no archive local to this map).

## Map 070 — Cherrygrove City house (T21R0301)

### Map 070 reading notes
- **Sources:** `get_events {mapHeader: 70}` (event file 67), `get_script {file: 627}` (level script, empty), `get_script {file: 854}` and `project/scripts/0854.script` (3 scripts, 0 functions, 0 actions; 33 lines = 26 live + 7 header; the 26 live lines of `get_script` were compared line by line with L8-33 of the pulled file and are identical), `get_text {archive: 553}` (2 messages), `get_world_data {kind: mapHeader, index: 70}`. Header facts: internal name T21R0301, location Cherrygrove City (id 127), matrix 97, music 1019 day/night, weather 0, flags 114, `areaDataId 25`, `locationType 4`, `followMode 1`, wild 255 (no encounters). `list_changes` (34 entries) holds no edit to script file 854, level script 627, text archive 553 or event file 67.
- **Dialogue rendering:** see Conventions, Text rendering.
- **Scope:** a house interior entered from the Cherrygrove City exterior (header 67): header 67 warp 2 (global 547,399) leads here with anchor 0, and this map's warp 0 returns to header 67 anchor 2. Who lives here is not stated by the data; sprites 328 and 315 are not named by the data. No flags, variables, items or global calls are used by script file 854.
- **Level script 627 is empty** (0 entries, 4 bytes): no record; listed under Apparently unused.

### Map 070 event inventory
Coordinates are global tiles; matrix cell (0,0) for every entry. Every entry maps to a record in this section.

| Section | Idx | Type | owID / sprite (overlayTableEntry) | Coordinates | Flag (hides when set) | scriptNumber | Covered by |
|---|---|---|---|---|---|---|---|
| overworld | 0 | Normal, movement 17 face right, orient 3 | owID 0 / 328 | 5,5 | 0 | 2 | CGC-EVT-070-02 |
| overworld | 1 | Normal, movement 5 walking left/right (x 1, y 0), orient 2 | owID 1 / 315 | 2,4 | 0 | 3 | CGC-EVT-070-03 |
| warp | 0 | to header 67, anchor 2, height 0 | - | 4,8 | - | - | CGC-EVT-070-W0 |
| script 1 | - | `End` only; no event entry names it | - | - | - | 1 | CGC-EVT-070-01 |
| level script 627 | - | empty (0 entries) | - | - | - | - | none (Apparently unused) |

### Map 070 flags and variables (readers and writers)
None: script file 854 contains no flag, variable, item or global-call command (checked by reading all 33 lines). Overworld hide flags are 0 for both objects.

### Map 070 event records

#### CGC-EVT-070-01 — Script 1 (`End` only, unreferenced)
##### Record identity
- **Record ID:** CGC-EVT-070-01
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** None
- **Map or system:** Cherrygrove City house (header 70, T21R0301)
- **Speaker, object, or trigger:** None; no overworld, spawnable or trigger of event file 67 names script 1, and level script 627 is empty
- **Source references:** script file 854 Script#1 (0854.script lines 9-10)
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
- **Replacement target:** script file 854 Script#1
- **Other affected callers or records:** None found. Script indexes shift if scripts are added or removed (the event entries refer to scripts 2 and 3 by index).
- **Unresolved questions:** None.
- **Validation needed:** None (static inspection only, no runtime test).

#### CGC-EVT-070-02 — Resident advising on Gyms and Badges (script 2)
##### Record identity
- **Record ID:** CGC-EVT-070-02
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-070-02a
- **Map or system:** Cherrygrove City house (header 70, T21R0301)
- **Speaker, object, or trigger:** Talk-to NPC, event file 67 overworld idx 0 (owID 0, sprite 328, at 5,5, movement 17 face right, orient 3, no hide flag)
- **Source references:** script file 854 Script#2 (L12-20); event file 67 overworld idx 0; text archive 553 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** One message, msg 0 (CGC-DLG-070-02a).
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
- **Replacement target:** text archive 553 msg 0; script file 854 Script#2; event file 67 overworld idx 0
- **Other affected callers or records:** None found (msg 0 only at L16 of 0854.script).
- **Unresolved questions:** Who the NPC is (sprite 328) is not stated by the data.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

#### CGC-EVT-070-03 — Walking resident on becoming a Gym Leader (script 3)
##### Record identity
- **Record ID:** CGC-EVT-070-03
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-070-03a
- **Map or system:** Cherrygrove City house (header 70, T21R0301)
- **Speaker, object, or trigger:** Talk-to NPC, event file 67 overworld idx 1 (owID 1, sprite 315, at 2,4, movement 5 walking left/right, xRange 1, yRange 0, orient 2, no hide flag)
- **Source references:** script file 854 Script#3 (L22-30); event file 67 overworld idx 1; text archive 553 msg 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** One message, msg 1 (CGC-DLG-070-03a).
- **OLD raw message data:** See the dialogue record.
- **OLD trigger:** Player talks to overworld idx 1 (`scriptNumber` 3): `PlayFanfare SEQ_SE_CONFIRM`, `LockAll`, `FacePlayer`.
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Talk. (2) `Message 1` (L26), `WaitButton`, `CloseMessage`. (3)-(5) None; the NPC's walking pattern is event-file movement, not script. (6) `ReleaseAll`, `End`; repeatable. (7) None.
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
- **Replacement target:** text archive 553 msg 1; script file 854 Script#3; event file 67 overworld idx 1
- **Other affected callers or records:** None found (msg 1 only at L26 of 0854.script).
- **Unresolved questions:** Who the NPC is (sprite 315) is not stated by the data.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

#### CGC-EVT-070-W0 — Warp out to Cherrygrove City (4,8)
##### Record identity
- **Record ID:** CGC-EVT-070-W0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-067-W2
- **Map or system:** Cherrygrove City house (header 70, T21R0301)
- **Speaker, object, or trigger:** Warp idx 0 at global (4,8), matrix cell (0,0) tile (4,8)
- **Source references:** `get_events {mapHeader: 70}` warps idx 0; `get_events {mapHeader: 67, section: warps}` warp idx 2 (the matching door)
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Player steps on (4,8).
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Step. (2)-(7) Warp to header 67 (Cherrygrove City exterior), anchor 2, height 0.
- **OLD state changes:** Map change.
- **OLD repeat/completion behavior:** Always available.
- **OLD dependencies and shared-resource effects:** Header 67 warp idx 2 (at global 547,399) leads here with anchor 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 67 warp idx 0 of header 70 (the exterior's counterpart is the event file of header 67)
- **Other affected callers or records:** CGC-EVT-067-W2 (the exterior's warp idx 2, header 67). Anchor 2 equals that warp's index in header 67, which suggests anchor indexes the destination's warp list (Inferred).
- **Unresolved questions:** `anchor` semantics not confirmed.
- **Validation needed:** Enter and leave the house in game (static inspection only, no runtime test).

#### CGC-DLG-070-02a — Advice: visit the Gyms, collect Badges
##### Record identity
- **Record ID:** CGC-DLG-070-02a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-070-02
- **Related record IDs:** None
- **Map or system:** Cherrygrove City house (header 70, T21R0301)
- **Speaker, object, or trigger:** NPC at overworld idx 0 (owID 0)
- **Source references:** script file 854 Script#2 (`Message 0`, L16); text archive 553 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `You’re trying to see how good you / are as a Pokémon Trainer? [scroll] You better visit the Pokémon Gyms / all over Johto and collect Badges.`
- **OLD raw message data:** `You’re trying to see how good you\nare as a Pokémon Trainer?\rYou better visit the Pokémon Gyms\nall over Johto and collect Badges.`
- **OLD trigger:** Shown by CGC-EVT-070-02 on every interaction.
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
- **Replacement target:** text archive 553 msg 0
- **Other affected callers or records:** None found (L16 only; other script files reading archive 553 were not enumerated, Inferred none).
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

#### CGC-DLG-070-03a — "When I get older, I'm going to be a Gym Leader"
##### Record identity
- **Record ID:** CGC-DLG-070-03a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-070-03
- **Related record IDs:** None
- **Map or system:** Cherrygrove City house (header 70, T21R0301)
- **Speaker, object, or trigger:** NPC at overworld idx 1 (owID 1)
- **Source references:** script file 854 Script#3 (`Message 1`, L26); text archive 553 msg 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `When I get older, I’m going to be a / Gym Leader! [scroll] I make my Pokémon battle with my / friends’ to make them tougher!`
- **OLD raw message data:** `When I get older, I’m going to be a\nGym Leader!\rI make my Pokémon battle with my\nfriends’ to make them tougher!`
- **OLD trigger:** Shown by CGC-EVT-070-03 on every interaction.
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
- **Replacement target:** text archive 553 msg 1
- **Other affected callers or records:** None found (L26 only; other script files reading archive 553 were not enumerated, Inferred none).
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

### Map 070 message coverage
Text archive 553 holds 2 messages. Every message is cited: msg 0 CGC-DLG-070-02a, msg 1 CGC-DLG-070-03a. Unused: none. Blank padding: none.

## Map 071 — Cherrygrove City house (T21R0401)

### Map 071 reading notes
- **Sources:** `get_events {mapHeader: 71}` (event file 68), `get_script {file: 628}` (level script, empty), `get_script {file: 855}` and `project/scripts/0855.script` (2 scripts, 0 functions, 0 actions; 23 lines = 16 live + 7 header; the 16 live lines of `get_script` were compared line by line with L8-23 of the pulled file and are identical), `get_text {archive: 554}` (1 message), `get_world_data {kind: mapHeader, index: 71}`. Header facts: internal name T21R0401, location Cherrygrove City (id 127), matrix 96, music 1019 day/night, weather 0, flags 114, `areaDataId 25`, `locationType 4`, `followMode 1`, wild 255 (no encounters). `list_changes` (34 entries) holds no edit to script file 855, level script 628, text archive 554 or event file 68.
- **Dialogue rendering:** see Conventions, Text rendering.
- **Scope:** a house interior entered from the Cherrygrove City exterior (header 67): header 67 warp 3 (global 558,401) leads here with anchor 0, and this map's warp 0 returns to header 67 anchor 3. The single resident speaks in the first person as a former Trainer; sprite 330 is not named by the data. No flags, variables, items or global calls are used by script file 855.
- **Level script 628 is empty** (0 entries, 4 bytes): no record; listed under Apparently unused.

### Map 071 event inventory
Coordinates are global tiles; matrix cell (0,0) for every entry. Every entry maps to a record in this section.

| Section | Idx | Type | owID / sprite (overlayTableEntry) | Coordinates | Flag (hides when set) | scriptNumber | Covered by |
|---|---|---|---|---|---|---|---|
| overworld | 0 | Normal, movement 15 face down, orient 0 | owID 0 / 330 | 4,4 | 0 | 2 | CGC-EVT-071-02 |
| warp | 0 | to header 67, anchor 3, height 0 | - | 4,8 | - | - | CGC-EVT-071-W0 |
| script 1 | - | `End` only; no event entry names it | - | - | - | 1 | CGC-EVT-071-01 |
| level script 628 | - | empty (0 entries) | - | - | - | - | none (Apparently unused) |

### Map 071 flags and variables (readers and writers)
None: script file 855 contains no flag, variable, item or global-call command (checked by reading all 23 lines). The overworld hide flag is 0.

### Map 071 event records

#### CGC-EVT-071-01 — Script 1 (`End` only, unreferenced)
##### Record identity
- **Record ID:** CGC-EVT-071-01
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** None
- **Map or system:** Cherrygrove City house (header 71, T21R0401)
- **Speaker, object, or trigger:** None; no overworld, spawnable or trigger of event file 68 names script 1, and level script 628 is empty
- **Source references:** script file 855 Script#1 (0855.script lines 9-10)
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
- **Replacement target:** script file 855 Script#1
- **Other affected callers or records:** None found. Script indexes shift if scripts are added or removed (the event entry refers to script 2 by index).
- **Unresolved questions:** None.
- **Validation needed:** None (static inspection only, no runtime test).

#### CGC-EVT-071-02 — Resident advising on catching Pokémon (script 2)
##### Record identity
- **Record ID:** CGC-EVT-071-02
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-071-02a
- **Map or system:** Cherrygrove City house (header 71, T21R0401)
- **Speaker, object, or trigger:** Talk-to NPC, event file 68 overworld idx 0 (owID 0, sprite 330, at 4,4, movement 15 face down, orient 0, no hide flag)
- **Source references:** script file 855 Script#2 (L12-20); event file 68 overworld idx 0; text archive 554 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** One message, msg 0 (CGC-DLG-071-02a).
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
- **Replacement target:** text archive 554 msg 0; script file 855 Script#2; event file 68 overworld idx 0
- **Other affected callers or records:** None found (msg 0 only at L16 of 0855.script).
- **Unresolved questions:** Who the NPC is (sprite 330) is not stated by the data.
- **Validation needed:** Text-box fit after any edit; the message is long (static inspection only, no runtime test).

#### CGC-EVT-071-W0 — Warp out to Cherrygrove City (4,8)
##### Record identity
- **Record ID:** CGC-EVT-071-W0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-067-W3
- **Map or system:** Cherrygrove City house (header 71, T21R0401)
- **Speaker, object, or trigger:** Warp idx 0 at global (4,8), matrix cell (0,0) tile (4,8)
- **Source references:** `get_events {mapHeader: 71}` warps idx 0; `get_events {mapHeader: 67, section: warps}` warp idx 3 (the matching door)
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Player steps on (4,8).
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Step. (2)-(7) Warp to header 67 (Cherrygrove City exterior), anchor 3, height 0.
- **OLD state changes:** Map change.
- **OLD repeat/completion behavior:** Always available.
- **OLD dependencies and shared-resource effects:** Header 67 warp idx 3 (at global 558,401) leads here with anchor 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 68 warp idx 0 of header 71 (the exterior's counterpart is the event file of header 67)
- **Other affected callers or records:** CGC-EVT-067-W3 (the exterior's warp idx 3, header 67). Anchor 3 equals that warp's index in header 67, which suggests anchor indexes the destination's warp list (Inferred).
- **Unresolved questions:** `anchor` semantics not confirmed.
- **Validation needed:** Enter and leave the house in game (static inspection only, no runtime test).

#### CGC-DLG-071-02a — Advice: catch many Pokémon, PC storage, kindness
##### Record identity
- **Record ID:** CGC-DLG-071-02a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-071-02
- **Related record IDs:** None
- **Map or system:** Cherrygrove City house (header 71, T21R0401)
- **Speaker, object, or trigger:** NPC at overworld idx 0 (owID 0)
- **Source references:** script file 855 Script#2 (`Message 0`, L16); text archive 554 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `When I was a wee lad, I was a / hotshot Trainer! [scroll] Here’s some words of advice: catch / a lot of Pokémon! [scroll] But you can only take six with you. [scroll] If you catch more, they’ll be sent to / your PC. [scroll] They won’t run away from the PC, so / there is no need to be alarmed. [scroll] Remember what I’m about to tell you... / Treat them all with utmost kindness!`
- **OLD raw message data:** `When I was a wee lad, I was a\nhotshot Trainer!\rHere’s some words of advice: catch\na lot of Pokémon!\rBut you can only take six with you.\rIf you catch more, they’ll be sent to\nyour PC.\rThey won’t run away from the PC, so\nthere is no need to be alarmed.\rRemember what I’m about to tell you...\nTreat them all with utmost kindness!`
- **OLD trigger:** Shown by CGC-EVT-071-02 on every interaction.
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
- **Replacement target:** text archive 554 msg 0
- **Other affected callers or records:** None found (L16 only; other script files reading archive 554 were not enumerated, Inferred none).
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

### Map 071 message coverage
Text archive 554 holds 1 message. Every message is cited: msg 0 CGC-DLG-071-02a. Unused: none. Blank padding: none.

## Map 072 — Cherrygrove City house (T21R0501)

### Map 072 reading notes
- **Sources:** `get_events {mapHeader: 72}` (event file 69), `get_script {file: 629}` (level script, empty), `get_script {file: 856}` and `project/scripts/0856.script` (3 scripts, 0 functions, 0 actions; 33 lines = 26 live + 7 header; the 26 live lines of `get_script` were compared line by line with L8-33 of the pulled file and are identical), `get_text {archive: 555}` (2 messages), `get_world_data {kind: mapHeader, index: 72}`. Header facts: internal name T21R0501, location Cherrygrove City (id 127), matrix 97, music 1019 day/night, weather 0, flags 114, `areaDataId 25`, `locationType 4`, `followMode 1`, wild 255 (no encounters). `list_changes` (34 entries) holds no edit to script file 856, level script 629, text archive 555 or event file 69.
- **Dialogue rendering:** see Conventions, Text rendering.
- **Scope:** a house interior entered from the Cherrygrove City exterior (header 67): header 67 warp 4 (global 567,405) leads here with anchor 0, and this map's warp 0 returns to header 67 anchor 4. Who lives here is not stated by the data; sprites 146 and 319 are not named by the data. No flags, variables, items or global calls are used by script file 856.
- **Level script 629 is empty** (0 entries, 4 bytes): no record; listed under Apparently unused.
- **Message 1 quirk:** msg 1 of archive 555 contains a `\f` (new box) in mid-sentence after "with" and ends with a trailing `\n`; both are in the raw data and are reproduced as found.

### Map 072 event inventory
Coordinates are global tiles; matrix cell (0,0) for every entry. Every entry maps to a record in this section.

| Section | Idx | Type | owID / sprite (overlayTableEntry) | Coordinates | Flag (hides when set) | scriptNumber | Covered by |
|---|---|---|---|---|---|---|---|
| overworld | 0 | Normal, movement 17 face right, orient 3 | owID 0 / 146 | 5,5 | 0 | 2 | CGC-EVT-072-02 |
| overworld | 1 | Normal, movement 16 face left, orient 3 | owID 1 / 319 | 8,5 | 0 | 3 | CGC-EVT-072-03 |
| warp | 0 | to header 67, anchor 4, height 0 | - | 4,8 | - | - | CGC-EVT-072-W0 |
| script 1 | - | `End` only; no event entry names it | - | - | - | 1 | CGC-EVT-072-01 |
| level script 629 | - | empty (0 entries) | - | - | - | - | none (Apparently unused) |

### Map 072 flags and variables (readers and writers)
None: script file 856 contains no flag, variable, item or global-call command (checked by reading all 33 lines). Overworld hide flags are 0 for both objects.

### Map 072 event records

#### CGC-EVT-072-01 — Script 1 (`End` only, unreferenced)
##### Record identity
- **Record ID:** CGC-EVT-072-01
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** None
- **Map or system:** Cherrygrove City house (header 72, T21R0501)
- **Speaker, object, or trigger:** None; no overworld, spawnable or trigger of event file 69 names script 1, and level script 629 is empty
- **Source references:** script file 856 Script#1 (0856.script lines 9-10)
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
- **Replacement target:** script file 856 Script#1
- **Other affected callers or records:** None found. Script indexes shift if scripts are added or removed (the event entries refer to scripts 2 and 3 by index).
- **Unresolved questions:** None.
- **Validation needed:** None (static inspection only, no runtime test).

#### CGC-EVT-072-02 — Resident on Pokémon gaining experience (script 2)
##### Record identity
- **Record ID:** CGC-EVT-072-02
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-072-02a
- **Map or system:** Cherrygrove City house (header 72, T21R0501)
- **Speaker, object, or trigger:** Talk-to NPC, event file 69 overworld idx 0 (owID 0, sprite 146, at 5,5, movement 17 face right, orient 3, no hide flag)
- **Source references:** script file 856 Script#2 (L12-20); event file 69 overworld idx 0; text archive 555 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** One message, msg 0 (CGC-DLG-072-02a).
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
- **Replacement target:** text archive 555 msg 0; script file 856 Script#2; event file 69 overworld idx 0
- **Other affected callers or records:** None found (msg 0 only at L16 of 0856.script). Sprite 146 is also used by an NPC at Route 29 gate (header 134), which is only a shared sprite id, not a shared record.
- **Unresolved questions:** Who the NPC is (sprite 146) is not stated by the data.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

#### CGC-EVT-072-03 — Resident on Pokémon natures (script 3)
##### Record identity
- **Record ID:** CGC-EVT-072-03
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-DLG-072-03a
- **Map or system:** Cherrygrove City house (header 72, T21R0501)
- **Speaker, object, or trigger:** Talk-to NPC, event file 69 overworld idx 1 (owID 1, sprite 319, at 8,5, movement 16 face left, orient 3, no hide flag)
- **Source references:** script file 856 Script#3 (L22-30); event file 69 overworld idx 1; text archive 555 msg 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** One message, msg 1 (CGC-DLG-072-03a).
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
- **Replacement target:** text archive 555 msg 1; script file 856 Script#3; event file 69 overworld idx 1
- **Other affected callers or records:** None found (msg 1 only at L26 of 0856.script).
- **Unresolved questions:** Who the NPC is (sprite 319) is not stated by the data.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

#### CGC-EVT-072-W0 — Warp out to Cherrygrove City (4,8)
##### Record identity
- **Record ID:** CGC-EVT-072-W0
- **Record type:** Event
- **Parent record ID:** None
- **Related record IDs:** CGC-EVT-067-W4
- **Map or system:** Cherrygrove City house (header 72, T21R0501)
- **Speaker, object, or trigger:** Warp idx 0 at global (4,8), matrix cell (0,0) tile (4,8)
- **Source references:** `get_events {mapHeader: 72}` warps idx 0; `get_events {mapHeader: 67, section: warps}` warp idx 4 (the matching door)
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** None.
- **OLD raw message data:** None.
- **OLD trigger:** Player steps on (4,8).
- **OLD conditions and branch priority:** None.
- **OLD event sequence:** (1) Step. (2)-(7) Warp to header 67 (Cherrygrove City exterior), anchor 4, height 0.
- **OLD state changes:** Map change.
- **OLD repeat/completion behavior:** Always available.
- **OLD dependencies and shared-resource effects:** Header 67 warp idx 4 (at global 567,405) leads here with anchor 0.
##### NEW — Replacement content
- **NEW change status:** UNDECIDED
- **NEW dialogue:** UNSET
- **NEW trigger:** UNSET
- **NEW conditions and branch priority:** UNSET
- **NEW event sequence:** UNSET
- **NEW state changes:** UNSET
- **NEW repeat/completion behavior:** UNSET
- **NEW dependency changes:** UNSET
- **NEW implementation notes:** UNSET
##### Mapping and verification
- **Replacement target:** event file 69 warp idx 0 of header 72 (the exterior's counterpart is the event file of header 67)
- **Other affected callers or records:** CGC-EVT-067-W4 (the exterior's warp idx 4, header 67). Anchor 4 equals that warp's index in header 67, which suggests anchor indexes the destination's warp list (Inferred).
- **Unresolved questions:** `anchor` semantics not confirmed.
- **Validation needed:** Enter and leave the house in game (static inspection only, no runtime test).

#### CGC-DLG-072-02a — Pokémon gain experience and change form
##### Record identity
- **Record ID:** CGC-DLG-072-02a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-072-02
- **Related record IDs:** None
- **Map or system:** Cherrygrove City house (header 72, T21R0501)
- **Speaker, object, or trigger:** NPC at overworld idx 0 (owID 0)
- **Source references:** script file 856 Script#2 (`Message 0`, L16); text archive 555 msg 0
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `Pokémon gain experience in battle / and change their form.`
- **OLD raw message data:** `Pokémon gain experience in battle\nand change their form.`
- **OLD trigger:** Shown by CGC-EVT-072-02 on every interaction.
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
- **Replacement target:** text archive 555 msg 0
- **Other affected callers or records:** None found (L16 only; other script files reading archive 555 were not enumerated, Inferred none).
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

#### CGC-DLG-072-03a — Each Pokémon has a nature
##### Record identity
- **Record ID:** CGC-DLG-072-03a
- **Record type:** Dialogue variant
- **Parent record ID:** CGC-EVT-072-03
- **Related record IDs:** None
- **Map or system:** Cherrygrove City house (header 72, T21R0501)
- **Speaker, object, or trigger:** NPC at overworld idx 1 (owID 1)
- **Source references:** script file 856 Script#3 (`Message 1`, L26); text archive 555 msg 1
- **Evidence status:** Verified
##### OLD — Current content
- **OLD dialogue:** `I heard that each Pokémon has its own / nature, and it has something to do with [new box] Pokémon stats! / `
- **OLD raw message data:** `I heard that each Pokémon has its own\nnature, and it has something to do with\fPokémon stats!\n`
- **OLD trigger:** Shown by CGC-EVT-072-03 on every interaction.
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
- **Replacement target:** text archive 555 msg 1
- **Other affected callers or records:** None found (L26 only; other script files reading archive 555 were not enumerated, Inferred none).
- **Unresolved questions:** None.
- **Validation needed:** Text-box fit after any edit (static inspection only, no runtime test).

### Map 072 message coverage
Text archive 555 holds 2 messages. Every message is cited: msg 0 CGC-DLG-072-02a, msg 1 CGC-DLG-072-03a. Unused: none. Blank padding: none.

## Coverage summary

### Totals per map (reconciled against the live ROM with `get_events`, `get_script` on the level scripts and `get_text`)

Event-file entries: every spawnable, overworld, warp and trigger index returned by `get_events {mapHeader}` appears in that map's event inventory table and maps to an existing record (covered / total). Level-script entries are counted as stored. Record counts were taken by `grep` of the `#### CGC-` headings and of their `Record type` field, and agree with the map sections' inventory tables.

| Header | Spawnables | Overworlds | Warps | Triggers | Level-script entries | Event records | Dialogue records | Total records |
|---|---|---|---|---|---|---|---|---|
| 67 (script 850, LS 623, text 550, event file 64) | 4/4 | 6/6 | 5/5 | 3/3 | 1/1 (LS623) | 20 | 25 | 45 |
| 68 (script 851, LS 624, text 551, event file 65) | 0/0 | 6/6 | 1/1 | 0/0 | 1/1 (LS624) | 8 | 3 | 11 |
| 69 (script 852, LS 625, text 552, event file 66) | 1/1 | 10/10 | 2/2 | 0/0 | 2/2 (LS625) | 15 | 6 | 21 |
| 144 (script 853, LS 626, text 3, event file 140) | 0/0 | 3/3 | 1/1 | 0/0 | 2/2 (LS626) | 7 | 0 | 7 |
| 70 (script 854, LS 627, text 553, event file 67) | 0/0 | 2/2 | 1/1 | 0/0 | 0/0 (LS627 empty) | 4 | 2 | 6 |
| 71 (script 855, LS 628, text 554, event file 68) | 0/0 | 1/1 | 1/1 | 0/0 | 0/0 (LS628 empty) | 3 | 1 | 4 |
| 72 (script 856, LS 629, text 555, event file 69) | 0/0 | 2/2 | 1/1 | 0/0 | 0/0 (LS629 empty) | 4 | 2 | 6 |
| **Total** | 5/5 | 30/30 | 12/12 | 3/3 | 6/6 | 61 | 39 | 100 |

Event records include the level-script records (`-LS`, `-LS1`, `-LS2`), the scripts that no event-file entry names directly but a level script runs (CGC-EVT-067-11), the `End`-only scripts that nothing runs (CGC-EVT-144-01, 070-01, 071-01, 072-01), non-talk objects (`-O<idx>`), spawnables (`-S<idx>`) and warps (`-W<idx>`). Dialogue records are one per message index and member of a branch (no pair is merged); the two `-U` records of map 067 are unreferenced messages. Header 144 has no dialogue record because script file 853 reads no message.

Text archives ("referenced" = cited by a script command or, for the boards, by a `BoardMessage` / `SetIconBoard` argument (Inferred); "unused" = has a `-U<idx>` record):

| Archive | Header | Total | Referenced (cited by a record) | Unused (U records) | Blank | Not covered by any record |
|---|---|---|---|---|---|---|
| 550 | 67 | 25 (0-24) | 23 (0-15, 17, 19-24 by commands; 23 and 24 only through the board mapping, Inferred) | 2 (msgs 16 and 18: CGC-DLG-067-U16, -U18) | 0 | 0 |
| 551 | 68 | 3 (0-2) | 3 | 0 | 0 | 0 |
| 552 | 69 | 6 (0-5) | 6 | 0 | 0 | 0 |
| 553 | 70 | 2 (0-1) | 2 | 0 | 0 | 0 |
| 554 | 71 | 1 (0) | 1 | 0 | 0 | 0 |
| 555 | 72 | 2 (0-1) | 2 | 0 | 0 | 0 |
| 3 | 144 | 1,404 | 0 (script file 853 reads no message) | not assessed | not assessed | all 1,404 (global archive, out of scope; header count shared with other headers is Inferred) |
| common archive 2 (behind `GetCommonMessageArchive 2`; mapping to text archive 30 Inferred) | 67 | not assessed | 5 read by CGC-EVT-067-10 (msgs 0, 1, 2, 3, 5), all global: GLB-PRM-30-0, -1, -2, -3, -5 | not assessed | not assessed | not assessed (global, not documented here) |

### Shared resources (one resource, more than one caller)
- **GLB ids cited in this document** (each checked to exist as a `#### GLB-` heading in `global_dialogue_event_map.md`; 20 ids, all present): GLB-RTN-2000 (boards, CGC-EVT-067-06, -07); GLB-RTN-2002 (nurse call, CGC-EVT-069-01); GLB-RTN-2011, 2048, 2052 (mart clerks, CGC-EVT-068-01, -04); GLB-RTN-2025 (scriptNumber of CGC-EVT-069-O7) and its prompt GLB-PRM-40-68; GLB-RTN-2031, 2070, 2071 and the general routine GLB-RTN-TRAINER (named, not invoked: CGC-EVT-067-04); GLB-RTN-2033 (item gift, CGC-EVT-067-05); GLB-RTN-2037, 2038 (the Guide Gent scenes, CGC-EVT-067-02, -03); GLB-RTN-HIDDENITEM (CGC-EVT-067-S2, -S3); GLB-PRM-30-0, -1, -2, -3, -5 (photographer prompts, CGC-EVT-067-10). The strings `GLB-RTN-…` and `GLB-PRM-30-*` used as patterns in prose are not ids.
- Text archive 550 is read by header 67 only among the Cherrygrove headers; messages 0-8 are each read at two call sites (Function#30 and its copy Function#39, and Function#2 / #27 for msg 0, Function#16 / #35 for msg 1), messages 9-12 at two (Function#19 and its copy Function#31), messages 14 and 15 at two.
- Function#39 (L631-713; L636-713 copy Function#30 L434-510) duplicates Function#30 (read as the y 400 tour variant, Inferred); Function#19 and Function#31 differ only in their first lines (both Unresolved as to why).
- Objects shared: overworld idx 0 of map 67 is the actor of CGC-EVT-067-01, -02 and -03; overworld idx 4 of map 67 is the actor of CGC-EVT-067-04 and the record CGC-EVT-067-O4. In map 69, overworlds idx 2 / 8 share tile (6,4) and idx 3 / 9 share tile (11,4), with opposite hide flags (789 / 790).
- The hidden item at (572,390) is present in both event file 64 (CGC-EVT-067-S2) and Route 29's event file 30 (R29-EVT-033-S2).
- Flags and variables with several writers or readers (full lists in each map's flags table): var 0x4073 (written by 0850 and 0229, read by three triggers); flag 412 (0850, 0149, 0229); flag 404 (0149, 0843); flag 153 (set here, read in 0843); flag 638 (set or cleared in this map's script file and 44 other script files); flag 393 (this file and 55 other script files); var 0x4108 (written by 0843, 0229, 0112, 0859, 0858; read by 0851, 0852, 0843, 0845, 0848); flags 789 (0149, 0229), 790 (0229), 403 (0859), 679 and 680 (0144); vars 0x4133 (0004, 0166, 0119, 0907), 0x4117 (0164), 0x4137 (0147, 0164). Flags 408 and 243 are touched only in script file 850 and the event file.
- Warp pairs: each interior warp returns to the matching exterior warp (CGC-EVT-067-W0 to W4 with CGC-EVT-069-W0, 068-W0, 070-W0, 071-W0, 072-W0; CGC-EVT-069-W1 with CGC-EVT-144-W0).

### Apparently unused
- Script 1 of script files 853, 854, 855 and 856 (`End` only; CGC-EVT-144-01, -070-01, -071-01, -072-01; no event-file entry or level script names them).
- Messages 16 and 18 of text archive 550 (CGC-DLG-067-U16, -U18).
- Level scripts 627, 628 and 629 (empty, 0 entries); no records.
- Text archive 3 (header 144): no local script command reads it.
- Overworlds and level-script entries whose id lies outside the map's own script file (9000-9017, 9200-9205, 10200-10202, 2025) and the spawnable with scriptNumber 0 (CGC-EVT-069-S0): target not determined (Unresolved), not unused as such.
- The talk script of the Guide Gent (CGC-EVT-067-01, `End` only) is reachable only if the player can talk to him before trigger T0 fires (Unresolved).

### Hack modifications in Cherrygrove City (what is verifiable)
- The dspre-mcp journal (`list_changes`, 34 edits, ids 1-34) holds no edit to a Cherrygrove file: script files 850-856, level scripts 623-629, text archives 550-555 and 3, event files 64-69 and 140, headers 67-72 and 144 and encounter file 2 are untouched.
- Indirect contacts (journalled edits to files that Cherrygrove records depend on): journal id 19 on script file 145 (the hidden-item handler, GLB-RTN-HIDDENITEM, used by CGC-EVT-067-S2 and -S3); script file 843 (Elm's Lab, header 61; journal ids 17, 30, 31, 32, 34), which reads flag 153 (set by CGC-EVT-067-04), clears flag 404 (hide flag of CGC-EVT-068-04) and reads and writes var 0x4108 (read by CGC-EVT-068-03 and CGC-EVT-069-04). Whether those journalled edits changed the particular lines that touch these flags was not checked line by line.
- hg-engine overrides present only in built ROMs: it regenerates script archive entry 3 (common script, ids 2000-2081, used by the GLB-RTN ids above) and entry 953 (trainer script), and owns trainer data (the rival trainers 495, 496, 497 of CGC-EVT-067-04) and encounter data (wild encounter file 2 of header 67). The working ROM inspected here is the OLD baseline; none of this is documented as Cherrygrove content.

### Scope classifications marked uncertain
- CGC-EVT-067-04 (rival battle): the scene and text are local; the common scripts it calls (GLB-RTN-2031, 2070, 2071) and the trainer data (hg-engine in builds) are global.
- CGC-EVT-067-10 / -11 (photographer): the NPC and the map-entry hook are local; its prompts (GLB-PRM-30-*, archive 2) and the shared flags 638 and 393 are global.
- CGC-EVT-067-06, -07 and DLG 06a, 07a (boards): the board texts are local (archive 550, mapping Inferred); the board behaviour is global (GLB-RTN-2000).
- CGC-EVT-067-S2 and -S3 (hidden items): the events are local; the handler and arm9 table are global (GLB-RTN-HIDDENITEM); S2 is duplicated in Route 29's event file.
- CGC-EVT-067-02, -03, -05: the scenes are local; the common scripts GLB-RTN-2037, 2038, 2033 are global.
- CGC-EVT-068-01, -04 and CGC-EVT-069-01 (clerks, nurse): the NPC and its placement are local; the shop and healing behaviour are global routines (GLB-RTN-2011, 2048, 2052, 2002).
- CGC-EVT-068-LS, -O4, -O5, CGC-EVT-069-LS1, -LS2, -O1 to -O3, -O7, CGC-EVT-144-LS1, -LS2, -O0 to -O2: the event-file entries are local; the scripts they run (ids 9000-9017, 9200-9205, 10200-10202, 2025) are in a global id space and not documented.
- Text archive 3 (header 144): named by the header but read by no local command; treated as global.
- CGC-DLG-067-U16, -U18: unreferenced messages of the map's own archive; classed as local because only this header names archive 550 among the Cherrygrove headers (headers elsewhere were not enumerated, Inferred).

## Resources inspected

### Resources inspected
- **ROM and extraction:** working ROM `~/pokehg/working/heartgold.nds` (HeartGold US, IPKE, rev 0), extraction `~/pokehg/working/heartgold_DSPRE_contents/`; the pristine `rom/original/` was not opened.
- **Map headers:** 67, 68, 69, 70, 71, 72 and 144 (`get_world_data {kind: mapHeader}`), the listing of all 540 headers for location name id 127 "Cherrygrove City", and the arm9 header table (script-file and text-archive users) as used for dependency resolution; headers of the dependency script files (33, 34, 36, 60, 61, 63, 66, 135, 143, 157, 173, 207, 288, 516 and others) as listed in Source and in each flags table.
- **Matrices:** 0 ("map", headers and maps layers around cells (16,12) and (17,12)) and the interior matrix ids named by the headers (73, 77, 96, 97, 104; not read cell by cell).
- **Event files:** 64, 65, 66, 67, 68, 69, 140 (`get_events`), and file 30 (Route 29) for the duplicate hidden item.
- **Script files:** 850-856 (`get_script`, and the pulled disassembly `project/scripts/0850.script` to `0856.script`) and greps of the other `project/scripts/*.script` files (0229, 0149, 0843, 0845, 0848, 0859, 0858, 0112, 0144, 0004, 0166, 0119, 0907, 0164, 0147 and the photographer map-entry hooks) for the flags and variables of these maps.
- **Level scripts:** 623-629 (`get_script`, structured form).
- **Text archives:** 550, 551, 552, 553, 554, 555 (`get_text`, every message), 3 (`get_text`, message count and header use only; no message inventoried).
- **ROM tables and lookups:** `get_rom_table {kind: hiddenItems}` indices 1 and 225; `lookup_names` (location "cherrygrove", item 243 Mystic Water); `get_trainer` 495, 496, 497 (species pairing in CGC-EVT-067-04); `list_changes` (the journal, 34 entries).
- **Project docs:** `docs/scripting-reference.md`, `docs/mr-paint-appraisal.md` (common message archive table), `get_docs reference/events`.
- **Sibling documents:** `global_dialogue_event_map.md` (GLB ids), `route_29_content_map.md` and `new_bark_town_content_map.md` (format, header-resolution tables).
- **hg-engine sources:** `~/Programming/hg-engine/armips/include/flags.s` and `vars.s` (flag and variable names).

### Methods
- dspre-mcp `get_*` tools only (read-only): `get_events`, `get_script`, `get_text`, `search_text`, `get_world_data`, `get_rom_table`, `get_trainer`, `lookup_names`, `list_changes`, `get_docs`, plus `open_rom` on the working ROM path.
- `grep` / `sed -n` / `cat` of `project/scripts/*.script` and the sibling documents for flag, var and message references (basis for every "writers" and "also used by" statement). Line numbers (L<n>) are lines of the pulled `.script` files, which carry a 7-line comment header that the live `get_script` listing does not.
- Structural counts by `grep` (record headings, field labels, record type, index rows); GLB ids checked by `grep` against the global document.
- No code was written, no emulator or build was run, and nothing in the ROM, the extraction or the project was modified; the only file written is this document.

## Unresolved references and conditions

Collected from the **Unresolved questions** field of each record and from the Evidence status lines; duplicates merged.

**Undecoded commands and arguments**
- `MecScript` (CGC-EVT-067-03, -04); `GiveShoes`, `DoorAnimation 17 12 14 17 77` argument roles, `SetFollowingPokeMovement 48 / 55 / 56`, `LockFollowingPoke`, `WaitFollowingPoke` (CGC-EVT-067-02, -W3); `SetOWPosition` argument roles (CGC-EVT-067-03, -04); `UpgradePokegear 1` beyond the project documentation (CGC-EVT-067-03).
- `SetTextBoard 2 0` and `BoardMessage 24` (CGC-EVT-067-06, CGC-DLG-067-06a); `SetIconBoard 23 0 12` argument roles and whether argument 23 is the message index (CGC-EVT-067-07, CGC-DLG-067-07a).
- `OpenTouchScreen`, `YesNoTouchScreen` (result convention), `CloseTouchScreen`, `CheckAlbumPhoto`, `TakePhoto` (CGC-EVT-067-10); which badge `CheckBadge 2` tests (CGC-EVT-067-11); `CheckStarter` as the starter species (CGC-EVT-067-04, Inferred); whether a lost battle returns to the script (`CheckBattleIsLost` result not tested; CGC-EVT-067-04, CGC-DLG-067-04b).
- Why Function#39 duplicates Function#30 and why Function#19 and Function#31 are separate copies (CGC-EVT-067-02, -03).

**Flags, variables and engine behaviour**
- `JumpIf LESS` after `CheckFlag` (CGC-EVT-067-11) and after `CompareVarValue` (CGC-EVT-068-03, CGC-EVT-069-04, CGC-DLG-068-03a/b, CGC-DLG-069-04a/b) follows the engine's reading, not independently verified; the role of flag 393 (set only during the photo scene, Inferred).
- Evaluation timing of the map-change hook relative to object spawning (CGC-EVT-067-LS, -11); whether a level script runs one or all matching `variableValue` conditions (CGC-EVT-069-LS2, CGC-EVT-144-LS1); when `loadGame` and `screenReset` entries fire (CGC-EVT-144-LS2, CGC-EVT-069-LS1).
- Whether the player can talk to the Guide Gent before trigger T0 fires (CGC-EVT-067-01); where the scene sits in the story order (CGC-EVT-067-02).
- Invocation of script file 0149 (no header uses it), and therefore the initial state of flags 412, 404, 789 (CGC-EVT-068-04, CGC-EVT-069-05, -06, -O2, -O3, CGC-EVT-067-O4); flags start clear is Inferred.
- The hidden-item mapping 8000+k → table index k and whether the table's scriptId is the found-flag; which of event files 64 and 30 serves the spot at (572,390) (CGC-EVT-067-S2, -S3).
- `anchor` semantics of every warp (CGC-EVT-067-W0 to W4, CGC-EVT-068-W0, CGC-EVT-069-W0, -W1, CGC-EVT-144-W0, CGC-EVT-070-W0, CGC-EVT-071-W0, CGC-EVT-072-W0); observed only that each anchor equals the index of the destination warp that leads back.
- What an interaction does when a spawnable's scriptNumber is 0 (CGC-EVT-069-S0); whether event-file `scriptNumber` 2025 is dispatched to common script 2025 (CGC-EVT-069-O7).
- What var 0x4133 (VAR_UNK_4133) and 0x4137 (VAR_UNK_4137) represent; what the routine does with `0x8007` = 0 (CGC-EVT-069-01); what stock index 0 sells in the mart routines (CGC-EVT-068-01, -04); whether engine or overlay code outside the scripts reads messages 16 and 18 of archive 550 (CGC-DLG-067-U16, -U18).
- Who else sets var 0x4073 or flags 408, 412, 243, 638 in other maps' level scripts and event files: not searched. Whether the journalled edits of script file 843 changed the lines that touch flags 153 and 404 and var 0x4108: not checked.
- The shared header count for text archive 3 (143 of 540 by one count) is Inferred, not re-verified.

**Global ids without GLB records** (defined in no `#### GLB-` heading; `global_dialogue_event_map.md` records ids >= 9000 as Unresolved; target script file and behaviour not determined): 9000 (CGC-EVT-069-LS1), 9001 (-O3), 9003 (-O2), 9012 and 9013 (-LS2), 9017 (-O1), 9200 and 9204 (CGC-EVT-144-LS1), 9201, 9202, 9203 (CGC-EVT-144-O2, -O1, -O0), 9205 (-LS2), 10200 (CGC-EVT-068-LS), 10201 (-O5), 10202 (-O4). The id space itself (what file or table ids 9000-10202 select) is Unresolved.

**Identities and scene context**
- Sprite identities (`overlayTableEntry` 330, 146, 325, 332, 148, 328, 334, 324, 299, 193, 335, 336, 341, 286, 315, 319) are not decodable through dspre-mcp; speakers are named only by message text and flag names. The NPCs of CGC-EVT-068-02, -03, CGC-EVT-069-02, -03, -04, CGC-EVT-070-02, -03, CGC-EVT-071-02 and CGC-EVT-072-02, -03 are not identified by the data; the objects of CGC-EVT-069-O1, CGC-EVT-144-O0 to -O2 are not identified at all.
- Roles read from flag names only (Inferred): the rival (FLAG_HIDE_CHERRYGROVE_RIVAL), the photographer Cameron (FLAG_HIDE_CAMERON), "Mom gift deliveryman" and "Mystery gift deliveryman" (CGC-EVT-068-O4, -O5), "receptionists" (CGC-EVT-069-O2, -O3); whether the sprite 335 object at CGC-EVT-069-O7 is the same kind as the nurse.
- Which building the text of CGC-DLG-067-02c refers to is given only by the text; the meaning of the token arguments `{STRVAR_1, 3, 0, 0}` is taken from the command order (CGC-DLG-067-02h).
- Whether the starter-to-trainer pairing of CGC-EVT-067-04 is meant as a type counter (the species pairing is Verified; the intent is not stated).

**Text break-code glosses**
- This document renders `\r` as scroll and `\f` as new box (per the briefing); `docs/scripting-reference.md` glosses `\r` as "new page, waits for a button press" and `\f` as "paragraph/form-feed break". The OLD raw message data is authoritative in every record; which gloss is correct was not verified. The mid-sentence `\f` and trailing `\n` of archive 555 msg 1 (CGC-DLG-072-03a) are in the raw data as found.

## Inspection limitations

- **Level scripts have no text disassembly.** They were read through `get_script` (structured trigger lists) only; engine evaluation order and timing were not verified.
- **Sprite ids are not decodable through dspre-mcp.** Speakers and objects are inferred from message text and flag names, never from the sprite.
- **Some opcodes are undocumented** in `docs/scripting-reference.md` or the scrcmd database (`MecScript`, `GiveShoes`, `DoorAnimation`, `SetTextBoard`, `BoardMessage`, `SetIconBoard`, the touch-screen and photo commands, the follower commands, `SetOWPosition`); their effect is described from the surrounding script only.
- **Ids of 9000 and above, and 2025 as an event-file `scriptNumber`, are not resolved** to a script by the tools; the objects and level-script entries that use them are recorded with their data only.
- **Other maps' level scripts and event files were not searched** for flag and var writers; "writers" in this document are limited to `project/scripts/*.script` and the Cherrygrove event and level data. A flag marked "no script writer" may still be set from a level script, another map's event-file hide flag or engine code. Script file 0149's caller is unresolved.
- **hg-engine overrides exist only in the built ROM.** The working ROM is the OLD baseline; common script entry 3 and trainer script 953 are rebuilt at build time, and the trainer and encounter data are hg-engine's in builds.
- **Global content is not documented** by design; global behaviour is referenced by GLB id only.
- **Map geometry is not readable** through dspre-mcp; which matrix cell edges are walkable was not inspected.
- **No runtime testing.** Nothing was run in an emulator; every reachability statement is a static reading of conditions.
- **No code was written**, so there is no exhaustive automated cross-reference: references were found with `grep` of the disassembly and may miss a reference written in a form the pattern did not match.

## Verification performed

- **Basis.** Static inspection only. No runtime or emulator test was run, nothing was built, no `set_*` or `save_rom` call was made, and nothing in the ROM, the extraction or the project was modified. Every dspre-mcp call was a read-only `get_*` / `search_text` / `lookup_names` / `list_changes` / `get_docs` call (and `open_rom` on the working ROM). The only file written is this document. Timestamp of this closing pass: 2026-10-13T01:58:56+05:30 (from `date -Iseconds`).
- **Source worker.** Compared the container counts and line totals of script files 850-856 with live `get_script`: 850 has 11 scripts, 39 functions, 47 actions and 1038 lines (1031 live + 7 header); 851 4/2/0 and 64 lines; 852 6/2/0 and 77; 853 1/0/0 and 13; 854 3/0/0 and 33; 855 2/0/0 and 23; 856 3/0/0 and 33.
- **Per-map workers.** Compared script files 851-856 line by line with the live listing (all live lines match the pulled files), and the live items 0-650 of script file 850 command for command; the Actions and the tail of Function#39 of 850 were not compared line by line.
- **Two independent audits** re-checked: the event inventories against `get_events` for all 7 headers (5 spawnables, 30 overworlds, 12 warps, 3 triggers); all level scripts 623-629 (6 entries in 4 files, 3 empty); every raw message of text archives 550-555 against `get_text` (by eye, not mechanically); the branch logic of the event records; every `GLB-` id; the flag and variable readers and writers by `grep` of `project/scripts/`; and the header resolutions of dependency script files with `get_world_data`.
- **Audit fixes for map 067:** the header resolution of 0099 was removed (header 121 uses script 139, so it is not a photographer-hook resolution for this map; superseded by the 2026-10-13 re-check below, which resolves 0099 to header 120); temp-variable line attribution corrected in the reading notes; Action#42 added to the sources of CGC-EVT-067-02; the order of `SetFlag 412` corrected in CGC-EVT-067-04; the trainer species pairing (starter to trainer 495/496/497) added to CGC-EVT-067-04; the photographer prompt descriptions trimmed to GLB ids (scope rule); "static inspection only" added to the validation lines.
- **Audit fixes for the interiors:** scope leaks trimmed in CGC-EVT-068-01, CGC-EVT-068-04, CGC-EVT-069-01, CGC-EVT-069-O7 and the reading notes; "four talk NPCs" corrected to three in the map 069 notes; the archive 3 header count marked Inferred; interior warp records cross-referenced to CGC-EVT-067-W0 to W4; rendering and heading consistency.
- **Structure and index checks (this pass).** 100 `#### CGC-` headings; the index has 100 rows whose Record IDs equal the headings in heading order, and whose Record type equals each record's `Record type` field (61 Event, 39 Dialogue variant; per map 20/25, 8/3, 15/6, 7/0, 4/2, 3/1, 4/2, matching the inventory tables); every `GLB-` id cited (20 distinct) exists as a `#### GLB-` heading in `global_dialogue_event_map.md`.
- **Independent static re-check, 2026-10-13T02:09:52+05:30.** Static only, no runtime test. Scope:
  - All 100 records' structure and index.
  - Live `get_events` for the 7 headers: 50 objects (5 spawnables, 30 overworlds, 12 warps, 3 triggers) and the 6 level-script entries.
  - The header set (all 540 headers paged; location 127 = exactly these 7) and the matrix-0 exit cells.
  - All 39 messages of archives 550-555 against the 39 Dialogue records, which matched byte for byte.
  - All 61 Event records' logic, plus the common-script and global classification, the outside readers and writers of the flags and vars, and the journal (34 edits, none on a Cherrygrove file).
  - The multi-caller notes of 69 records.

  It found no wrong identifier, value, branch or text. It fixed these:
  - Missing shared-caller notes: Action#1 and Action#11 shared between 067-02, -03 and -04; outside writers and readers of var 0x4108 on 068-03 and 069-04; the writers of flags 789 and 790 on 069-05, -06, -O2 and -O3.
  - Per-record hg-engine notes on 067-02, -03, -07, -S2 and -S3.
  - 0099 resolved to header 120 in the flag 638 row.
  - Function#39 copy range reworded, Function#31 end line corrected, and the 067-10 "album full" reading marked Inferred.

  The duplicate hidden item at (572,390) is field-for-field identical in event files 64 and 30.
- **What this is not.** No emulator or in-game confirmation of any scene, branch or hide-flag state; reachability statements are readings of conditions.
