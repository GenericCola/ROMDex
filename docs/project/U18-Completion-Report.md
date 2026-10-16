# ROMDex Metadata Cloud Sync

**U18 is complete. ROMDex 0.5.6 is installed and running normally.** Tile images, manual sibling order and saved parent statuses now synchronize through private ROMDex-Data. No U19 work has begun.

## Behavior

ROMDex tile images, manual sibling order and directly assigned parent statuses now use the existing private ROMDex-Data cloud connection. YouTrack continues to own tickets, parent relationships, descriptions, comments, assignees and project fields. Selected workspace, filters, expanded rows and other view preferences stay local.

Independent metadata edits merge deterministically. Competing edits to the same image, saved status or sibling list hold incoming metadata for explicit review. Save Changes opens the review pane; original versions remain preserved, drafts survive restarts and newer changes invalidate an old approval. This first interface chooses a complete metadata version. It does not partially apply an unconfirmed conflict.

Metadata is journaled before compatibility saves are acknowledged. Interrupted uploads retry the same operation, and restarts retain outgoing edits. Incoming changes wait while an affected editor is open. Resolving a saved-status conflict supersedes only the older status patch; unrelated pending native edits remain queued. Existing sparse order ranks are preserved exactly when their relative order already matches. Removed or moved YouTrack items are filtered against their current sibling relationships.

Auto-Sync Off pauses automatic delivery; Save Changes performs one synchronization cycle. Existing Windows-protected credentials are reused. No new token or YouTrack field is required. Shared indicator polish and service-specific connection-help corrections remain U19.

## Verification

- **417 regression tests passed**, including metadata races, rollback, native queues, invalid history, custom State labels and 1,000-item order handling.
- Actual Windows/Electron clients tested convergence, conflicting sibling order, uncertain upload recovery, a new client and later offline edits through separate private GitHub verification branches.
- Forced process termination verified SQLite rollback and survival of committed outgoing work.
- The final packaged desktop passed **10 UI scenarios**, including editor holds, persistent review drafts, image previews, stale approval rejection, manual synchronization while Off and preserving unrelated native edits.
- **123 syntax checks and 245 packaged application hashes** passed. The final private-test installer is ROMDex 0.5.6.

The previewed current-data rehearsal preserved 299 tickets, 104 sparse order entries across 22 sibling lists, 78 saved parent statuses and all tile images. The installer preserved all 111 Data files exactly before first launch. All 245 installed application hashes matched. Genuine YouTrack fields matched the dashboard. NPCDex revision 73 and the whole NPCDex save remained intact. Native ticket sync and both cloud journals resumed after a normal restart; all three encrypted credentials remained unchanged. The saved update token verified the signed current release without re-entry, and temporary diagnostic ports are closed. Production verification made no synthetic ticket or save edits. Full protected Data backups remain local and excluded from Git.

[Desktop evidence](U18-Desktop-Verification.json), [application manifest](U18-Application-Manifest.json), [private release](https://github.com/GenericCola/ROMDex/releases/tag/v0.5.6).

## Practical Limits

If a native parent's State exactly equals its child-derived rollup, it cannot distinguish a manual own-status assignment from the inherited write. ROMDex preserves the saved own value in that ambiguous case; distinct native State edits are observed. Conflict review currently selects a complete version while retaining every original branch. Additional cloud users and receipt-specific reconciliation retain their separate later tasks.

## Next Task

**U19 — Combined Sync Controls and Indicators, Sol / High.** A new PASSKEY is required. Include the previously requested workspace-toggle diameter reduction of 30% and removal of its drop shadow.
