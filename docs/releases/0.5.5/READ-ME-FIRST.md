# NPCDex Concurrent Edits and Cloud Review

ROMDex 0.5.5 merges independent NPCDex edits after checking their exact before-values, stable identities, collection layouts and existing NPCDex domain rules. Different notes can merge. Overlapping notes, competing assignments, structural changes or protected validation reads require review. Text is not combined automatically.

Click Save Changes when a conflict needs attention. The review pane compares the shared base with each complete saved version. Choose a version, review its changes, tick the confirmation and select Use Selected Version. Image changes offer View Image controls. Review Later and Escape preserve your local choice without applying it. A refreshed review is required if another edit changes the versions being reviewed.

The first interface selects a complete version for the affected NPCDex workspace. It does not quietly apply only the non-conflicting half. Original versions and their histories remain immutable cloud ancestors. A resolution is a new transaction naming every reviewed head; it does not erase earlier work. A later offline version can require review again. Other workspaces and YouTrack synchronization continue independently.

Incoming changes cannot replace an open form or text being typed. A checkpoint accepted during ongoing typing retains the writer's own acknowledged revision so further typing cannot accidentally undo incoming independent changes.

Receipt effects and their validation reads remain indivisible. A competing receipt is preserved for whole-receipt review, including when a complete data version is chosen. Held receipt IDs cannot be replayed through the manual importer. Receipt-specific reconciliation and its review interface remain U25–U26. Choosing a data version does not modify the ROM or mark testing complete.

Auto-Sync Off retains local edits and review drafts. Manual Save runs one remote cycle while remaining Off; applying a review choice checks the known cloud versions and queues a durable resolution before attempting delivery. An interrupted delivery retries the same operation. No token re-entry is required by this upgrade. Older 0.5.4 clients retain unsupported revisions for review; update all active clients before editing concurrently.

This release retains all branches and adds no destructive retention. Discovery remains bounded to the established 5,000-record limit; automatic merge review is bounded to 64 heads and 256 concurrent operations. Larger or ambiguous histories require explicit review rather than a guessed winner. Preview text is bounded and images load only when requested. ROMDex metadata cloud persistence remains U18; final shared indicators and the smaller workspace toggle remain U19.
