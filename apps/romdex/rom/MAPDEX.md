# MAPDex — ROM Import and Preparation

MAPDex is included in current desktop builds. Use the small red workspace chooser in the header to switch workspaces; selections and local preparation persist. TAB cycles the preview pane size from workspace content and retains normal form navigation.

Open ROM selects an .nds through Windows. The ROM remains read-only at its external path; MAPDex stores its path/fingerprint rather than another full ROM copy. The catalog lists the ROM’s map/zone groups, with no map selected by default. Each output RDX contains one selected parent map and all included sub-areas/entities.

Select a map, review its included areas, then hover over the map tile and open its standard settings cog → Prepare Map. Preparation runs in a bounded worker and saves locally. Cancel preserves the last completed preparation. Source details retain original IDs; display labels are suggestions requiring review where uncertain.

The map tile’s Assign to Parent action lets you choose which map becomes a child. The complete descendant tree moves with it. A child such as Sprout Tower remains navigable beneath its parent, and all floors/entities are nested in one parent-map RDX. Combining independently prepared documents or regrouping already-published maps requires coordinated migration review.

Display cleanup can adjust names, source thumbnails and the map’s stage labels/order. Stages use Roman numerals and are map-specific. Full associated dialogue is visible in Preview / Review; technical evidence is optional. Source/runtime uncertainties remain warnings and are never filled in by AI. Proposed ROM changes remain NPCDex planning actions.

Prepared working files live under Data/<project>/ROMImport/RDX/working. Export RDX creates a named portable copy. Send to NPCDex is an equal output action: it opens an explicit handoff review, saves the map locally after confirmation and journals publication for Auto-Sync/manual delivery. The explicit NPCDex sync pause is always honored. Local success is separate from verified cloud delivery.

For another ROM build, link it to the existing ROM project and use the map tile’s Update Existing Map action. Finish the whole-map review before changing NPCDex. See [Updating Maps](UPDATING-MAPS.md) for identity matching, passage notes, preservation, rollback, compatibility and human testing. The two-actual-build acceptance remains pending until another ROM exists.

The known reader profile covers the supplied 0.6.3_noduplicates build. Changed fingerprints require matching validated reader code/layout evidence followed by bounded extraction checks. Different code/layouts and broader Pokémon ROM compatibility require further reader work. Filenames, game codes, names and source slot numbers alone never authorize identity reuse.

Save Changes checkpoints local preparation; preparation and export do not publish or dispatch agent work. Unknown save formats remain untouched. Clear Extraction Scratch removes only recorded disposable files. Jobs preserve previous checkpoints, and shutdown cancels/checkpoints local work without waiting for a cloud backlog.

Package with desktop/package-source.mjs, including the full rom/ directory, workers, schemas and pinned tables. The source-only copier excludes live Data, credentials, ROMs and developer test folders. Windows/native acceptance and browser evidence are recorded separately in each delivery report.
