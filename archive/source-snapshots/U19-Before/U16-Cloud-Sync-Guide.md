# NPCDex Cloud Sync

ROMDex 0.5.4 adds automatic NPCDex checkpoints and cloud delivery for the account and initial cloud copy approved in U14–U15. It uses the saved, Windows-protected cloud credential; YouTrack and update access remain separate.

NPCDex changes are committed locally before they enter the background queue. The service checks for incoming revisions about every 30 seconds while Auto-Sync Data is On, including while the window is closed to the tray. An interrupted connection retains local work and retries with backoff. Closing the application does not require successful contact with GitHub.

Auto-Sync Data Off pauses both remote providers while retaining local checkpoints. Save Changes runs one manual synchronization cycle. The existing connection details show separate provider messages; full shared indicator refinements remain U19. Optional package exports remain available from NPCDex Data tools through Export Package Copy and the existing download controls.

Changes from another configured client appear when the local editor is clean. Incoming data cannot replace text being typed: the editor retains its observed revision, and conflicting branches remain available for review. U16 holds competing versions conservatively; U17 adds automatic independent merging and the resolution interface. Save completion does not imply that a conflict was resolved.

The application's Data folder contains the SQLite journal, original import backup, encrypted connection and compatibility JSON copy. The journal transaction is authoritative after cloud activation; the JSON copy is a compatibility/export aid. Never replace the journal with an archived seed or copy its live database files individually while the application is running. Use the task's verified whole-profile backup/restore procedures. Installer upgrades and uninstall preserve Data.

Gender and other NPCDex view preferences remain local to the device. Native YouTrack tickets retain their existing two-way adapter. ROMDex selector images/order/assigned parent statuses enter the new bulk cloud store at U18. Agent-required Change Requests and receipts remain assigned to YouTrack integration in later phases.
