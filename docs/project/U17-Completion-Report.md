# NPCDex Concurrent Edits and Conflict Review

**U17 is complete. ROMDex 0.5.5 is installed and running normally.** Independent NPCDex edits merge automatically; competing versions remain preserved for explicit review. Source, pre-change snapshots and the verified installer are archived privately.

## Behavior

NPCDex can automatically merge explicitly independent edits. Derived read/write footprints check exact before-values, stable identities, collection layouts and the existing NPCDex domain validator. Immutable history appends preserve their identities and causal ordering. Merge identity and ordering are deterministic across clients; timestamps never choose a winning version. Readers validate every semantic parent, including unselected branches of a resolution.

Overlapping text, competing assignments, structural changes, protected identities and validation reads hold the whole NPCDex projection for review. Save Changes opens the review pane. It compares complete versions against their shared base, retains a choice across restart, offers embedded image previews and requires fresh confirmation before applying. An edit that changes the reviewed versions invalidates the approval. Review Later and Escape leave data unchanged.

The first review interface selects a complete workspace version. It preserves all original branches as immutable ancestors of a new resolution; it does not silently apply the non-conflicting half. Newer offline work can require review again. Unapplied forms and text being typed retain their observed base. Typing during an accepted merge follows its own acknowledged edit rather than accidentally deleting newly merged content. Shutdown or suspension during review preserves the draft and cancels an uncommitted choice.

Receipt effects and their validation reads remain indivisible. Competing receipts retain pending review markers even after a complete data version is chosen, and those IDs cannot be replayed through the manual importer. Receipt-specific reconciliation and its UI remain U25–U26. A data choice does not change the ROM or certify testing. Native YouTrack synchronization remains independent.

## Verification

- **371 regression tests passed**, including 24 merge/review scenarios, editor races, invalid side-parents, forged merges, identical assignments, resolution rollback, unknown upload outcomes, stale approvals, drafts and lifecycle interruption.
- Actual Windows/Electron clients verified independent convergence, explicit conflict review, lost-response resolution recovery and a later offline branch through a separate private GitHub verification branch. Production cloud data, original content/history/images and the saved credential remained unchanged.
- Forced process termination verified rollback of an uncommitted SQLite transaction and survival of the committed document, dependencies and outgoing queue.
- The final package passed all eight desktop flows, including stale assignments, retained drafts, stale approvals, native suspension, manual resolution with Auto-Sync Off and bounded image previews. All 113 syntax checks, 234 packaged hashes and visual review passed.

The installer preserved all 109 Data files exactly before first launch; all 234 installed application hashes matched the verified package. Genuine YouTrack fields matched the dashboard, and NPCDex revision 73, manual order, tile images and directly assigned parent statuses were preserved. Both providers resumed after a normal restart. All three encrypted credentials remained unchanged; the remembered download token verified the current signed release without re-entry. Temporary diagnostic ports are closed. Verification made no synthetic production task or save edits.

[Desktop evidence](U17-Desktop-Verification.json), [application manifest](U17-Application-Manifest.json), [private release](https://github.com/GenericCola/ROMDex/releases/tag/v0.5.5). The complete protected pre-upgrade Data backup remains local and excluded from Git.

## Next Task

**U18 — ROMDex Metadata Cloud Sync, Sol / High**. A new PASSKEY is required. No U18 implementation is included here. The workspace-toggle polish remains scheduled for U19.
