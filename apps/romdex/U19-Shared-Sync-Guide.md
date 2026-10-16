# Shared Sync Controls

Save Changes and Auto-Sync Data apply to YouTrack tickets, NPCDex cloud saves and ROMDex organization metadata. Providers keep separate queues; a failure in one does not stop another. Save Changes performs one cycle while automatic sync is Off and leaves it Off.

The Save light is green during healthy automatic delivery, including ordinary queued edits. It turns red for unsent work that cannot be delivered, paused pending work, conflicts or a local recovery problem. A disconnected service with no pending work changes the connection light without inventing an unsaved-data warning.

The connection light pulses blue when all configured connections are healthy. A failed connection flashes red. With Auto-Sync Off it stays dark blue, including during a manual one-cycle save. An initial check remains dark blue until connection health is known. A reconciliation conflict can require Save/review while its transport remains blue.

Click the connection light for per-service state, pending count, latest successful remote check and recovery messages. Conflict review buttons appear for the applicable cloud namespace. Save Changes retries configured services; the existing YouTrack form manages its connection. Unconfigured capabilities explicitly report local storage. No tokens appear in status text or exports.

The temporary workspace button is 70% of its previous diameter (19.04 px at the standard header size), has no shadow, and retains its menu, keyboard controls and accessible name. Header control and connection-light geometry remain unchanged. Workspace switching retains each workspace's current view.

Application Data and the three remembered credentials retain their existing locations and protections. This task does not change storage protocols or enable sharing with additional users. Request/receipt integration remains the later phase.
