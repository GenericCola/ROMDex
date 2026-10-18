# Bounded Content Sync and Upload Recovery

RD02 source change. This is prepared for the next desktop release; it does not change an already installed 0.5.14 application by editing these files.

## Review an Interrupted Upload

Open **NPCDex → Tray 2 Cog → Review Sync**, or use NPCDex's review action in Connection Details. The review action is available when an upload is uncertain or blocked, even if there is no content conflict.

The pane shows pending edits, verified upload steps and the current reading/publishing/verifying phase. **Refresh Review** reloads local recovery information. **Check Sync Once** performs one normal sync cycle without turning Auto-Sync on. It first rediscovers any upload that the server accepted before its response was lost.

If an upload remains uncertain, review its retained original edit and error before using **Allow Reviewed Retry** for the specific step. This permission retains the operation identity and frozen bytes; it does not discard a queue or force a conflicting publication. Retry controls cannot change an operation while a sync check is running. Use Save Changes afterward, or let enabled Auto-Sync perform its next cycle.

Missing or changed previously verified uploads require review. They are never automatically replaced. Existing cancellation, ownership, visibility, hash, missing-history, branch and final-readback guards remain in force.

## Time Budgets and Resumption

The initial verified history read has its own bounded window. The writer's separate cumulative budget starts only for publication work, and readback between operations does not spend that write budget. Resuming a write phase updates its abort signal without resetting its existing request/write ceilings. Shutdown still aborts active work safely.

Each accepted upload step is checkpointed durably. A later cycle resumes its saved attachment identity, checks fresh issue ownership/visibility and attachment metadata, and reuses hash-verified local bytes when the immutable fingerprint matches. Metadata changes require downloaded-byte verification. Routine history-manifest reads can use the same verified cache; periodic/full audits and final publication validation remain intact.

After three connected publication attempts with no newly verified step or commit, automatic outgoing delivery pauses. Incoming synchronization continues. The pause survives restart and directs the user to Review Sync. A manual check allows one explicit attempt; verified progress clears the pause, while another unchanged attempt retains it. Ordinary offline reads do not trigger this pause. Cancelling the last safely cancellable queued operation clears its obsolete pause without removing retained history.

## Scope

These improvements use the existing native content format and queue. They do not implement `.rdx`, JSON task packages, automatic agent returns or the existing-map conversion. Those remain the later approved roadmap tasks. Data, remembered credentials, native task semantics and the original NPCDex feedback controls are unchanged.
