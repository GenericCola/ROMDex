# MAPDex Preparation Corrections — Delivered in ROMDex 0.5.25

ROMDex 0.5.25 is installed and open with the saved workspace and all three remembered connections. The complete Data folder was backed up, restored in isolation and compared exactly before reopening: 131 files, 80,363,813 bytes; 395 installed application files matched the verified package. The NPCDex sync policy is preserved.

Sprite choices preview immediately in Tray 3. Use Apply Thumbnail to commit; Save Changes, export/handoff and quit also preserve a pending choice. A large RDX checkpoint can still take time, so browsing source frames no longer rewrites the file on every selection.

To join Marill's placements, use MAPDex Display Cleanup → Character Identity, choose the other placement, review the shared name and confirm Link as One Character. NPCDex also offers character tile Settings → Link Character Placements. Both produce one tile while keeping every placement's location, dialogue, images, notes, source IDs, mappings and history. Unused old profiles remain preserved for history. Gender-specific identity overrides require separate review.

Generated HGSS region labels now read Johto/Kanto. Generated stage descriptions include map-local source dialogue/actions and Roman numeral indices; custom labels/order and technical conditions are retained. This improves the evidence shown, but a complete narrative-phase/condition-availability extractor remains open in RI03C. No AI or invented global chronology is used.

The first 0.5.24 installed launch exposed a startup timeout: a large saved-map presentation update ran before service readiness. The final 0.5.25 defers it to MAPDex loading, without increasing the service deadline. A verification-helper assertion was also corrected to reject error-only startup reports. A copy of the actual pre-update preparation passed cold startup, label conversion, quit and restart; the earlier six packaged feature checks remain applicable.

Verification: 121 unique focused cases across the relevant suites, including 21 workspace rechecks after the startup correction; actual cached 0.6.3 New Bark Town sprite/linking UI; six original packaged feature checks plus four cold saved-data checks; MSI validation; fresh complete backup/restoration; and final installed connection/context review. This correction creates no live YouTrack proof records or production imports. Existing maps and queued work are retained.

Protected recovery: outputs/Protected/Before-MAPDex-0.5.25/Data.zip; the earlier pre-attempt backup is also retained under Before-MAPDex-0.5.24. Both contain private data and are excluded from Git. Source and sanitized documentation are backed up privately in GenericCola/ROMDex; ROMs, extracted content, credentials and protected archives are excluded. This is the installed evaluation build; the published private updater release remains 0.5.15.

[Verification](MAPDex-0.5.25-Verification.json) · [Workflow and limits](MAPDex-Preparation-and-Character-Identity.md) · [Action checklist](NPCDex-ROMDex-Action-Checklist.md)
