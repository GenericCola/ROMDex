from pathlib import Path
import json,shutil
base=Path('outputs/Documentation/Project')
p=base/'RI03C-Acceptance-Review.md'
s='''# RI03C / Phase 11F — Corrective Acceptance Review

**RI03C remains open.** The owner rejected 11f.13 and supplied four further corrections. Candidate **0.5.26-11f.15** is undergoing isolated packaged verification. No production installation, publication or agent dispatch is authorized by this review. Installed 0.5.26, production Data, saved connections and the NPCDex cloud-sync pause remain unchanged.

## Latest corrections — supplied order

1. **Filled images.** Map/location thumbnails and location previews use a filled viewport. Border-connected transparent/black mattes are excluded; a long route is cropped instead of letterboxed. New Bark and Route 29 were checked using their real extracted PNGs. Source image bytes and saved crop percentages remain intact. NPC sprites retain the separately requested whole-sprite containment and shared half-pane scale.
2. **Buildings contain floors.** New Bark has Outdoors, Elm’s Lab, Player’s House, Southwest House and Neighbor’s House as root locations. The lab and multi-floor houses expand into their rooms/floors. Logical building parents preserve every existing physical room/entity identity, dialogue, mapping, image, plan and annotation. Only catalog-confirmed source area codes establish these parents. Unknown codes do not acquire guessed buildings. Portable imports normalize supported old and new hierarchies before matching; original documents remain in history.
3. **MAPDex has two trays.** Tray 1 contains maps and nested locations; Tray 2 uses the remaining height for character/element tiles. There is no Dialogue / Location tray. Tile cogs open popup actions; identity, thumbnail and linking tools use a dialog. Map setup, warnings, reviewed updates and Send to NPCDex retain explicit dialogs. Export RDX and Send to NPCDex remain equal header actions. NPCDex retains its dialogue tray.
4. **Original web timeline.** The shared stylesheet is extracted from the archived web build, including compact nodes, Roman numerals, label treatment, four-pixel indicator lights and Other Conditions. The scrolling experimental condition-button layout and extra All Content footer button are removed. Map-specific source events remain the data adapter; selecting an event shows related content. New Bark has eight supported named events; Route 29 has its own catching-tutorial event. A location/floor scope change refreshes its indicators immediately.

The October 14 screenshot and archived web source remain the appearance reference. No tile movement buttons have been reintroduced. The shared centered standard settings icon, disclosure triangles, nested reveal animation and contained sprite sizing remain in place.

## Review the isolated window

Use **RI03C Four Corrections Review — … — Isolated Data** when verification finishes. The pre-correction review data is preserved separately; production data is not used for edits. Do not enter tokens or publish from this test window.

1. In MAPDex, expand New Bark Town → Elm’s Lab → 1F / 2F. The floors should be beneath one building, rather than alongside it. Check the other houses as well.
2. Verify that Tray 2 occupies the former dialogue-tray space. Use a character’s hover cog to open its settings popup and identity/link tools. Send to NPCDex should open a review dialog; cancel it to return to the map.
3. Compare the timeline’s geometry and lights with the web build. Select events and different locations; the lights and affected content should follow the selection.
4. Switch to NPCDex. Check the same building hierarchy, dialogue filtering and timeline treatment. Open Route 29 from the left tray: its route image should fill the tile with a cropped section, and its timeline should differ from New Bark’s.
5. Report any remaining differences. This is usability acceptance, not certification that an in-game test passed.

## Evidence and boundaries

The targeted source checks cover image framing, source presentation, building hierarchy and repreparation, map imports and event timelines. The final focused recheck passes 29 cases, including the new hierarchy preservation cases and repeated-import no-op behavior. Original imported document history, all physical identities and source mappings are retained. The real New Bark RDX also passed a portable round trip and old-flat → nested import preview without conflicts. The browser layout proof covers the two-tray geometry and popup placement; its handoff payload is a UI fixture, recorded separately from the actual native/backend check.

The packaged run checks both workspaces, real local handoff preview, nested selectors, event selection and lights, Route 29 framing and a 620-pixel window. Its results are recorded separately; technical checks do not establish owner acceptance.

All original raw predicates and unresolved source findings remain available in the portable condition index and inspector. Named event views do not simulate an arbitrary game save or establish every combination’s runtime reachability. Unfamiliar ROMs do not inherit guessed event names. Static images do not simulate actors, animation, weather or game flags. Supported source events remain associated with characters where their speaker evidence permits it.

Earlier valid 11D/11E evidence for NPCD publication, file transfer and typed/reviewed-prose return reconciliation is reused. No emulator, external coding agent or repeat full-map publication was started. Actual two-ROM-build acceptance awaits a second build. U28/U29 retain startup, scale/concurrency and broader performance work; U30 owns production packaging and installation.

**Keep RI03C open pending renewed owner usability acceptance. Stop before U28.**
'''
p.write_text(s,encoding='utf-8',newline='\n')
section='''

### RI03C third owner review — four corrections

The owner rejected 11f.13. Complete these in the supplied order; their latest MAPDex two-tray direction supersedes the earlier MAPDex dialogue-tray/Back design. NPCDex retains its dialogue tray. RI03C remains unaccepted.

- [x] **R3-01:** Fill map/location image frames, crop empty/black margins and letterboxing, preserve originals; verify real New Bark and Route 29 images.
- [x] **R3-02:** Restore building → room/floor selectors; preserve physical identities, mappings, images, plans/notes and portable import/repreparation compatibility.
- [x] **R3-03:** Remove MAPDex Tray 3, expand Tray 2, and retain identity/link/map setup/handoff/update tools in explicit popups or dialogs.
- [x] **R3-04 source:** Restore the web timeline rules and controls with map-specific named events and affected-content lights; refresh lights when map/location scope changes.
- [ ] Finish packaged verification of all four corrections in 0.5.26-11f.15.
- [ ] Record renewed owner usability acceptance before marking RI03C complete.

Evidence: [review guide](Documentation/Project/RI03C-Acceptance-Review.md). Production 0.5.26, Data, credentials and paused sync remain unchanged. Stop before U28.
'''
for name in ['NPCDex-ROMDex-Action-Checklist.md','NPCDex-ROMDex-Unified-App-Action-Plan.md']:
 p=Path('outputs')/name;s=p.read_text(encoding='utf-8-sig');s=s.replace('- [ ] Record renewed owner usability review of 0.5.26-11f.13 before completing RI03C.','- [ ] Record owner acceptance of the latest corrective candidate below; the 11f.13 review was rejected.')
 if '### RI03C third owner review — four corrections' not in s:s+=section
 p.write_text(s,encoding='utf-8',newline='\n');shutil.copyfile(p,Path('work/u13b/repository/docs/project')/name)
p=base/'RI03C-Verification.json';d=json.loads(p.read_text(encoding='utf-8-sig'));d['status']='third-corrective-packaged-verification-in-progress';d['candidateVersion']='0.5.26-11f.15';d['acceptance']['ownerUsabilityReview']=False;d['thirdOwnerCorrections']={'status':'native-verification-pending','order':['Filled image viewports','Building and floor hierarchy','Two-tray MAPDex with popup tools','Original web timeline with map-specific events'],'imageProof':'work/ri03c-corrections/third-01-proof.json','hierarchyProof':'work/ri03c-corrections/third-02-proof.json','importProof':'work/ri03c-corrections/third-02-import-proof.json','browserLayoutProof':'work/ri03c-corrections/third-03-proof.json','nativeProof':'work/ri03c-corrections/third-native-proof.json','sourceTests':'51 unique targeted cases, including focused rechecks after fixes','productionChanged':False};p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n',encoding='utf-8',newline='\n')
for p in [base/'RI03C-Acceptance-Review.md',base/'RI03C-Verification.json']:shutil.copyfile(p,Path('work/u13b/repository/docs/project')/p.name)
