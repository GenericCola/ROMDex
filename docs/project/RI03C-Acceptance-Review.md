# RI03C / Phase 11F — Corrective Acceptance Review

**RI03C remains open.** The owner rejected 11f.13 and supplied four further corrections. All four corrections are implemented and verified in isolated candidate **0.5.26-11f.20**; renewed owner usability review is pending. No production installation, publication or agent dispatch is authorized by this review. Installed 0.5.26, production Data, saved connections and the NPCDex cloud-sync pause remain unchanged.

## Latest corrections — supplied order

1. **Filled images.** Map/location thumbnails and location previews use a filled viewport. Border-connected transparent/black mattes are excluded; a long route is cropped instead of letterboxed. New Bark and Route 29 were checked using their real extracted PNGs. Source image bytes and saved crop percentages remain intact. NPC sprites retain the separately requested whole-sprite containment and shared half-pane scale.
2. **Buildings contain floors.** New Bark has Outdoors, Elm’s Lab, Player’s House, Southwest House and Neighbor’s House as root locations. The lab and multi-floor houses expand into their rooms/floors. Logical building parents preserve every existing physical room/entity identity, dialogue, mapping, image, plan and annotation. Only catalog-confirmed source area codes establish these parents. Unknown codes do not acquire guessed buildings. Portable imports normalize supported old and new hierarchies before matching; original documents remain in history.
3. **MAPDex has two trays.** Tray 1 contains maps and nested locations; Tray 2 uses the remaining height for character/element tiles. There is no Dialogue / Location tray. Tile cogs open popup actions; identity, thumbnail and linking tools use a dialog. Map setup, warnings, reviewed updates and Send to NPCDex retain explicit dialogs. Export RDX and Send to NPCDex remain equal header actions. NPCDex retains its dialogue tray.
4. **Original web timeline.** Both workspaces match all 198 compared computed timeline style values from the archived web build. The shared stylesheet is extracted from that build, including compact nodes, Roman numerals, label treatment, four-pixel indicator lights and Other Conditions. The scrolling experimental condition-button layout and extra All Content footer button are removed. Map-specific source events remain the data adapter; selecting an event shows related content. New Bark has eight supported named events; Route 29 has its own catching-tutorial event. A location/floor scope change refreshes its indicators immediately. Selected-event filtering rejects source branches that contradict its known before/after fact; the real Player’s House Mother test excludes the pre-starter line under After Receiving Your Starter. Unrelated state remains unknown and source text stays unchanged.

The October 14 screenshot and archived web source remain the appearance reference. No tile movement buttons have been reintroduced. The shared centered standard settings icon, disclosure triangles, nested reveal animation and contained sprite sizing remain in place.

## Review the isolated window

Use **RI03C Four Corrections Review — … — Isolated Data** for the renewed review. The pre-correction review data is preserved separately; production data is not used for edits. Do not enter tokens or publish from this test window.

1. In MAPDex, expand New Bark Town → Elm’s Lab → 1F / 2F. The floors should be beneath one building, rather than alongside it. Check the other houses as well.
2. Verify that Tray 2 occupies the former dialogue-tray space. Use a character’s hover cog to open its settings popup and identity/link tools. Send to NPCDex should open a review dialog; cancel it to return to the map.
3. Compare the timeline’s geometry and lights with the web build. Select events and different locations; the lights and affected content should follow the selection.
4. Switch to NPCDex. Check the same building hierarchy, dialogue filtering and timeline treatment. Open Route 29 from the left tray: its route image should fill the tile with a cropped section, and its timeline should differ from New Bark’s.
5. Report any remaining differences. This is usability acceptance, not certification that an in-game test passed.

## Evidence and boundaries

The targeted source checks cover 103 unique cases across image framing, source presentation, hierarchy/repreparation, map imports, event timelines, condition extraction and ROM update compatibility. The final focused recheck passes 29 cases, including the new hierarchy preservation cases and repeated-import no-op behavior. Original imported document history, all physical identities and source mappings are retained. The real New Bark RDX also passed a portable round trip and old-flat → nested import preview without conflicts. The browser layout proof covers the two-tray geometry and popup placement; its handoff payload is a UI fixture, recorded separately from the actual native/backend check.

The packaged checks cover both workspaces, real local handoff preview, nested selectors, event selection and lights, Route 29 framing and a 620-pixel window. Native 11f.20 passes the real source-mapped after-starter dialogue check, confirms that the dialogue-entry label follows the visible branch, and retains the separate Route 29 timeline. Valid structural checks from 11f.17 are reused after confirming the changed files. Technical checks do not establish owner acceptance.

All original raw predicates and unresolved source findings remain available in the portable condition index and inspector. Named event views do not simulate an arbitrary game save or establish every combination’s runtime reachability. Unfamiliar ROMs do not inherit guessed event names. Static images do not simulate actors, animation, weather or game flags. Supported source events remain associated with characters where their speaker evidence permits it.

Earlier valid 11D/11E evidence for NPCD publication, file transfer and typed/reviewed-prose return reconciliation is reused. No emulator, external coding agent or repeat full-map publication was started. Actual two-ROM-build acceptance awaits a second build. U28/U29 retain startup, scale/concurrency and broader performance work; U30 owns production packaging and installation.

**Keep RI03C open pending renewed owner usability acceptance. Stop before U28.**
