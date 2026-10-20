# Human testing and result history

U27 is implemented in source. It is not installed in production yet.

After an authorized returned RDX group is accepted and applied, open **Map Package Delivery → Result History and Testing**. The page shows its task, map, source, exact returned file and accepted result, affected content, before/after values and testing decisions. Long values are explicitly shortened in the preview; **Download History and Reversal Reference** retains the full values.

The existing task and NPCDex item lights show **Needs Testing**, using flashing amber. Critical red and development purple retain precedence. Parent task lights inherit outstanding testing. The menu order is Untouched, In Progress, Standby, In Development, Needs Testing, Complete, Critical. Reduced-motion preferences keep flashing lights static.

To record successful testing, enter the build or ROM revision actually tested, confirm that you personally tested the current affected content, then choose **Record Human Verification**. Record a failed test or reopen testing with a reason when needed. Verification is pinned to the accepted result and current affected content revisions. Changed content, unconfirmed private history or conflicting decisions cannot silently retain a verified result.

Verification clears the workflow's testing obligation. It does not complete the task, mark every dialogue as tested, erase ordinary flags/notes/plans, or change unrelated reviews. A task still showing Needs Testing remains open until you explicitly change its status. Existing per-dialogue review and planning indicators retain their original behavior.

The completion guard checks local edits, queued edits, conflict resolutions and native task writes. A native Done/Fixed/Complete claim cannot substitute for human testing. An affected completion is refreshed against private history and current content before delivery; unavailable or conflicting history keeps the edit queued for review rather than declaring the connection broken. Already authorized but unimplemented work also keeps its task open. The shared YouTrack account cannot distinguish a human from an agent, so native State fields and portable/imported claims are never the private verification authority.

Testing decisions are immutable causal histories in private metadata version 5, associated with the private accepted-result evidence. Both computers' conflicting decisions are retained; reviewing a conflict reopens testing and requires a fresh verification. A verified history becomes trusted only after owner-controlled private readback, and a relevant conflict revokes the local proof. Older private metadata versions remain readable, but older clients cannot safely process version 5; upgrade all clients before publishing it live.

Applied groups queue a deterministic readiness notice and unresolved Needs Testing status through the existing task queue. Auto-Sync Off leaves them queued until manual Save. Retries read back an exact existing readiness comment before posting; uncertain or duplicate matches remain held. Notice failure never reverses accepted content or blocks independent groups. No task is automatically completed.

**Request Reversal** records a reason and reopens testing. It does not reverse the ROM, NPCD or the working map. The downloadable reference includes original and inverse values, history and provenance, and explicitly authorizes no execution. Review current content and prepare a new plan/package to request actual reversal. An outstanding reversal must be explicitly cancelled before successful verification can be recorded.

U28–U30 still need integrated failure/concurrency review, guided live acceptance and packaged release. In particular, full fresh-computer restoration of task/package context must be reviewed; the first-profile guard conservatively retains known private testing obligations before local map context restores. U27's isolated checks do not claim live PMON configuration, native Windows visual acceptance or an installed upgrade.
