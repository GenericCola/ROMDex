# ROMDex RDX Task Plans

RD06 is source-complete, not installed or released. Installed 0.5.14 and existing saves are unchanged. RD07 now adds [native plan pullback, review and explicit matching](CLOUD-SYNC.md), and has passed the mandatory isolated map/YouTrack proof.

## Import and Edit Locally

In the updated desktop source, choose **Import Plan RDX** in the Work Pane toolbar. Choose the file, review its tasks and any alternatives, then choose **Save Local Plan**. This saves an app-managed working copy under **Data/RDX** using the shared managed-document journal. The original input stays unchanged. No connection is needed for this step, and it creates no YouTrack operations.

Only a validated `org.romdex.tasks` / `plan` document is accepted here. NPCDex maps use NPCDex's separate importer. Agent-result documents require task-bound reconciliation and cannot bypass it through this importer. File contents never supply executable instructions or trusted backend identities.

Open a local plan to edit task names, notes/instructions, status, priority or complexity. Fields, comments and attachments remain inspectable and preserved. **Export Plan RDX** downloads a verified portable copy containing the saved edits and exact assets. Backend credentials and the native binding ledger are not put in that file. Closing an unsaved local editor requires saving or discarding its edits.

## Review Placement and Publish

Choose **Choose PMON Destination**, then the project root or an existing PMON task. The preview shows every task's parent and declared versus resulting tier. For example, importing an Epic beneath an existing Epic places that root at Saga, its child at Story, and its descendants below it. Relationships stay intact. Levels below Verse are Task. New siblings append in source order using ROMDex's local ordering metadata; this creates no expensive YouTrack ordering writes.

Review status, priority, complexity and all additional fields. **Refresh Project Fields** reads the current editable definitions through the existing adapter. Assignees and enum/tag values require explicit destination-value mapping; imported user names do not authorize impersonation. Dates and periods retain their defined types. Read-only fields remain local context. Missing, incompatible or calculated destinations block publication instead of dropping writable values. Original comment author/date are included as provenance text; YouTrack posts as the connected user. Exact file bytes are staged through the normal attachment queue.

**Queue Reviewed Changes for YouTrack** is a separate, explicit action. With Auto-Sync On, the existing save service may process it. With Auto-Sync Off, it waits for Save Changes, which performs one cycle and leaves Auto-Sync Off. This neither dispatches an agent nor certifies implementation or testing. The plan menu shows each batch's completed/total actions and provides **Review Save Queue**.

The host rechecks the actual local document, destination, editable definitions, queue and conflict choices before queueing. A changed baseline requires a fresh preview. Backend Type defaults to Task through the existing adapter; ROMDex derives the displayed hierarchy tier from placement. An explicitly mapped editable Type field may supply a different project value.

## Updates, Omissions and Recovery

Reimport matches dataset/document/task identities. Identical tasks are unchanged; an exact task base permits an update. Otherwise choose the local or imported version after reviewing both. Task base hashes exclude only the task's own `baseRevision`. Original document bytes and alternate versions remain in retained history. Omitted tasks, comments, files and fields survive; omission is not deletion.

Publication keeps stable local task bindings and operation IDs in the same durable transaction as the save queue. Retry and reopen reuse them. Overlapping changes in bound YouTrack tasks require choices; independent native changes survive reimport. Unchanged Show-stopper priorities remain intact. Reusing an already-posted comment/file identity with different content blocks publication: provide a new portable identity for a new comment/file.

Explicit deletion requests remain pending unless selected in the publication preview. They must match the previously imported task baseline. Changes to the native target require review, and unselected children prevent deletion. **Cancel Deletion Request** removes an unpublished proposal locally while retaining history; it does not undo an already queued or applied deletion.

Partial publication uses the existing service's recovery/review behavior. A lost response does not authorize blind duplication. A discarded or uncertain operation holds its batch for review; it is not recreated automatically. Files staged before a failed queue transaction are cleaned up when unreferenced, while the original RDX stays available. The application must retain its current Data folder for this local ledger to work.

## Current Limits

- At most 1,000 tasks, 128 hierarchy levels and 12 MiB of queued operation JSON per reviewed publication. Container and attachment bounds apply separately. A larger valid local document may still be refused for publication with an explanation.
- Destination selection uses existing PMON records; the importer does not infer bindings from imported YouTrack IDs or match unrelated existing tickets by title.
- Binding tables remain local and separately verified. RD07 adds explicit existing-task matching for another instance and folds accepted Work Pane/YouTrack changes into the managed RDX. Imported IDs never establish authority.
- RD06 itself proved deterministic source behavior with synthetic data. RD07 has now passed the real isolated map two-way proof. Installed native-window acceptance and production-map conversion are still separate gates; RD10 remains the fresh-data adoption task.
