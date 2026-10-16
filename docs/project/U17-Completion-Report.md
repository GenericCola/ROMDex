# NPCDex Concurrent Edits and Conflict Review

U17 implementation and final 0.5.5 package verification are complete. The installed application remains 0.5.4. Current-data upgrade acceptance, private publication and the final normal restart are still pending; U17 is not yet checked off.

## Behavior

NPCDex can automatically merge explicitly independent edits. Derived read/write footprints check exact before-values, stable identities, collection layouts and the existing NPCDex domain validator. Immutable history appends preserve their identities and causal ordering. Merge identity and ordering are deterministic across clients; timestamps never choose a winning version. Readers validate every semantic parent, including unselected branches of a resolution.

Overlapping text, competing assignments, structural changes, protected identities and validation reads hold the whole NPCDex projection for review. Save Changes opens the review pane. It compares complete versions against their shared base, retains a choice across restart, offers embedded image previews and requires fresh confirmation before applying. An edit that changes the reviewed versions invalidates the approval. Review Later and Escape leave data unchanged.

The first review interface selects a complete workspace version. It preserves all original branches as immutable ancestors of a new resolution; it does not silently apply the non-conflicting half. Newer offline work can require review again. Unapplied forms and text being typed retain their observed base. Typing during an accepted merge follows its own acknowledged edit rather than accidentally deleting newly merged content. Shutdown or suspension during review preserves the draft and cancels an uncommitted choice.

Receipt effects and their validation reads remain indivisible. Competing receipts retain pending review markers even after a complete data version is chosen, and those IDs cannot be replayed through the manual importer. Receipt-specific reconciliation and its UI remain U25–U26. A data choice does not change the ROM or certify testing. Native YouTrack synchronization remains independent.

## Verification

- **371 regression tests passed**, including 24 merge/review scenarios, editor races, invalid side-parents, forged merges, identical assignments, resolution rollback, unknown upload outcomes, stale approvals, drafts and lifecycle interruption.
- Actual Windows/Electron clients verified independent convergence, explicit conflict review, lost-response resolution recovery and a later offline branch through a separate private GitHub verification branch. Production cloud data, original content/history/images and the saved credential remained unchanged.
- Forced process termination verified rollback of an uncommitted SQLite transaction and survival of the committed document, dependencies and outgoing queue.
- The initial packaged pane passed six desktop flows. Visual review identified encoded image text and a stretched preview button; both were corrected. The final package passed all eight desktop flows, including the added stale-assignment and native-pause guards, plus 113 syntax checks and 234 packaged hashes. The final visual review passed.

Final packaged, live-connection, credential-preservation and private-delivery evidence will be recorded before completion. Verification uses isolated copies; it makes no synthetic production task or save edits.

## Next Task

After U17 acceptance: **U18 — ROMDex Metadata Cloud Sync, Sol / High**. A new PASSKEY is required. No U18 implementation is included here. The workspace-toggle polish remains scheduled for U19.
