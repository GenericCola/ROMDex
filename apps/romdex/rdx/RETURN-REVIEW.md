# Human Review of Returned RDX

U26 is source-complete and awaits the later packaged release. Installed ROMDex remains 0.5.15. See [application](RESULT-APPLICATION.md) and [discovery](RETURN-DISCOVERY.md) for the underlying processing boundaries.

## Controls

Open NPCDex → Tray 2 Settings → Map Package Delivery → Returned RDX Files → **Review Returned File**. Review the fixed package/task identity, discovery/authorization state, complete dependency groups and packaged-original/current/returned values. Changed read context is shown separately. Long values have an explicit **View Full Value** control; all text is inert and never executes imported content.

- **Defer** retains a return/group on hold until explicit retry.
- **Reject Return** excludes that scope from processing, including manual Save. It does not delete the file, either content version, a ticket or its history. Explicit retry can reopen the decision.
- **Retry Checks** rechecks current authorization, task files, baselines, scope and complete outcomes. It does not authorize a package or waive a content conflict. A whole-file retry rechecks its groups but retains separately deferred/rejected group decisions.
- **Apply Reviewed Changes** is an explicit complete-group decision approved by the user during U26. It replaces only the package-requested fields with returned values, against the newly reviewed read baseline. It preserves unrelated current fields, newer drafts, notes, images, views and history. No individual member of a dependent group can be applied separately.

An existing return uploaded before authorization needs both current exact-package authorization and an explicit approval of that existing group. The approval is specific to its retained byte hash. Server attribution, task binding, actual required file bytes and all other checks remain mandatory. Superseded/withdrawn packages must first be explicitly reauthorized through the existing package controls; this review never creates authorization.

Wrong map/task/base, altered assets, out-of-scope changes, conflicting result identities, missing attribution, unsupported structure, incomplete dependent groups and instructions-only requests remain blocked. Imported archival candidates can be inspected/deferred/rejected, but cannot silently delete or archive records. An authorized explicit lifecycle change can be reviewed as part of its complete group.

Accepted, applied or uncertain work cannot be dismissed or silently reversed. This includes private acceptance synchronized from another computer even when this computer has no application intent yet. Retry can finish accepted recovery. A content/provider conflict that arises after acceptance still needs the original provider's review/recovery or a subsequent approved package; U26 does not undo the private acceptance or applied ROM/content changes. U27 owns explicit reversal/history/testing completion.

## Trust, Synchronization and Recovery

Every confirmation is bound to the exact file, current managed/native heads, relevant delivery state, authorization, private acceptance pins, previous decisions and application state. Changed previews are rejected. The recorded overwrite pins every group read revision; a later change holds the operation instead of silently widening approval. The original return is unchanged.

Review history is application-owned **RDXReturnReviewHistory/1** in private ROMDex metadata v4. Existing metadata v1/v2/v3 remains supported with unchanged canonical bytes/hashes. The review event contains exact package/source/group identity and the preview digest; reviewed overwrite also pins its current read set. The private acceptance record references that exact decision, and the native application retains the original evidence plus reviewed read pins. Uploaded approval-looking JSON or file-supplied actor labels grant no authority.

Concurrent decisions for the same scope, or concurrent deferral/rejection and acceptance, require metadata review. Independent group decisions can merge. Offline decisions are saved locally; synchronization follows Auto-Sync or Save Changes. Auto-Sync Off stays Off. A confirmation followed by a crash before local retry effects is recovered from the durable decision. Unaccepted attempts replaced during reviewed retry are archived locally before reuse. Already accepted work is retained after later withdrawal or review.

Back up the complete Data folder. Added local tables are return_review_snapshots, return_review_effects and return_application_attempts. Original return blobs, assessments, prior application evidence and all private authorization/acceptance journals remain preserved. UI history shows the latest 20 decisions, while the complete per-scope history remains stored (up to 1,000 events). Metadata retains its 16 MiB/10,000-key bounds; local snapshot/attempt retention is bounded and existing storage quotas remain in force. Hitting a bound requests retention/review and does not prune evidence.

## Preview Bounds and Release Boundary

A preview shows ten groups per page, at most 20 records per group, and at most 40 field differences across the page (30 per record). Oversized group comparisons explicitly block overwrite instead of approving hidden differences. Value snippets are 4,000 characters; explicit full-value reads stream at most 65,536 characters per chunk, preserve Unicode boundaries, verify a stable preview and cap a value at 16 MiB. The existing 50 MiB stored/128 MiB decoded RDX limits apply.

No task status, assignment, priority, comments, agent message or human-testing verification is changed. Accepted work remains Unreviewed and its task stays open. U27 separately adds flashing-amber Needs Testing, readiness notices and verification-gated completion. Refresh packaged clients and the authoring kit at the final release gate before production native/metadata rollout. U26 uses isolated transport/recovery fixtures and focused source UI/service checks; it does not claim a new live YouTrack migration, installer run or in-game test.
