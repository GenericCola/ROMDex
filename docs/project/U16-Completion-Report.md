# NPCDex Durable Cloud Synchronization

**U16 is complete. ROMDex 0.5.4 is installed and running normally. NPCDex cloud synchronization is active** using the existing protected cloud credential. Source, pre-change snapshots and the verified installer are archived in the private development repository.

## Result

NPCDex now checkpoints edits into a transactional SQLite journal in the application's Data folder. Each accepted edit includes its original revision and a persistent operation identity. Its data, dependencies and outgoing operation commit together before network delivery starts. Interrupted uploads retain the same identity for retry; a lost response after an accepted upload does not create another change.

The service checks the private ROMDex-Data repository for incoming revisions about every 30 seconds while Auto-Sync is On. A clean editor receives incoming changes; text being typed retains its observed base. Independent network work can continue while the desktop is closed to the Windows tray. Auto-Sync Off retains local checkpoints; manual Save runs one synchronization cycle without enabling automatic syncing.

The accepted U15 import remains the initial revision. Newer local edits become outgoing changes instead of being replaced by that seed. Existing JSON saves remain compatibility copies after activation; the transactional journal owns current data and its queue. Missing configuration or corrupted data requires attention instead of silently falling back to an older save. View preferences stay local to each device.

U16 conservatively preserves competing revisions and holds them for review. Automatic merging and the resolution interface are U17. ROMDex metadata cloud storage remains U18, final shared controls/indicator refinements and the smaller workspace toggle remain U19. Native YouTrack tickets retain their existing two-way adapter. Agent-required reports and receipts will remain on YouTrack.

## Verification

- **345 automated tests passed**, including transactional rollback, restart/offline delivery, unknown upload outcomes, incoming updates, missing/corrupt dependencies, concurrent branches and typing races.
- Actual Windows/Electron clients verified two-client GitHub catch-up, a deliberately discarded successful upload response, manual sync while Off and unchanged legacy data/images. These checks used a separate verification branch; the production cloud branch was not changed by fixtures.
- Forced process termination verified both rollback of an uncommitted SQLite transaction and survival of the committed document, dependencies and outgoing queue.
- The packaged app passed six scenarios: both workspaces open, actual note input checkpoints while Off, full restart retains it, manual Save delivers it, legacy writes cannot bypass revision checks, and closed-to-tray delivery continues.
- The native test inspector initially failed because of quoting in its own script. Correcting the harness allowed these checks to run; this was not an application startup failure.

The final package passed 107 syntax checks and 226 file hashes. The actual installer preserved all 106 application Data files exactly. The whole NPCDex revision 73 document, ordering, selector images, saved parent statuses and all three encrypted credentials are preserved. Both workspaces opened; all 299 task fields match genuine YouTrack reads, NPCDex cloud is current with no pending operations or review, and private update access restored without token entry. A normal restart resumed both providers, retained all saved credentials and closed the temporary diagnostic ports. The existing update token authenticated the current signed release without re-entry or downloading another installer. The privately published installer was downloaded independently and matched its verified hash. No synthetic verification edits were made to production YouTrack tickets or the production cloud branch.

[Desktop verification](U16-Desktop-Verification.json), [application manifest](U16-Application-Manifest.json), [private release](https://github.com/GenericCola/ROMDex/releases/tag/v0.5.4). The complete protected pre-upgrade Data backup remains local and is excluded from Git.

## Next Task

**U17 — Concurrent Edits and Conflict Review, Sol / Extra High**. A new PASSKEY is required. No U17 implementation is included here.
