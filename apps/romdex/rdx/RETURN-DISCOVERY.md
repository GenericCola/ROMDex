# Returned RDX Discovery

## User Flow

After exact-package authorization and manual agent handoff, the agent attaches its one-map result RDX to the same actionable task. ROMDex checks linked tasks in the background with Auto-Sync On. Map Package Delivery → **Check for Returned Files Once** explicitly checks while Auto-Sync is Off; Save Changes also includes one check. A check is bounded, so additional pending tasks/files may need another cycle.

The delivery view distinguishes **Pending**, **Staged**, **Deferred** and **Needs Review**. Exact duplicate files appear once, with their copy count. Staged means retained and validated for the discovery boundary; it does not mean applied, implemented correctly or human-tested. This source phase has no result-application control.

## Durable Storage and Recovery

The existing application Data/RDX/documents.sqlite holds four additional tables: `return_tasks`, `return_files`, `return_versions` and `return_assessments`. Exact returned-container bytes are content-hash keyed in the existing `blobs` table. No map/document head, active selection, queued task operation or testing state is changed by discovery. Include the whole application Data folder in backups; copying only managed working `.rdx` files omits this journal and authorization history.

A complete bounded inventory records candidate observations. Missing/changed IDs preserve older observations. Before downloading, an intent is committed. Raw bytes, validation facts/assessment history and the verified observation are committed together. A crash before that transaction retries later; a crash afterward finds the retained version. Repeated bytes do not create another blob. A later valid assessment can supersede an earlier unavailable-baseline assessment while keeping both in history.

Fetch failures back off from one minute to one hour; explicit checks bypass the wait. Unchanged retained files are rechecked after one day; explicit checks always reread. No signed URL or token is persisted in the journal or shown in the renderer. Errors use fixed messages so remote response bodies/URLs cannot leak through them.

## Bounds

- Four tasks, eight downloads and 64 MiB downloaded per cycle, with oldest checked tasks/files first.
- At most 10,000 inventory entries, requiring an empty final page; duplicate pages or an unproved end fail the sweep without declaring files missing.
- At most 512 RDX candidates per task, 4,096 durable observations, 8,192 retained byte versions and 16,384 distinct validation assessments.
- File size at most 50 MiB; decoding at most 128 MiB and 2,048 container entries. Existing JSON/depth/time bounds also apply.
- Existing managed storage capacity remains in force. Hitting a limit reports the issue and preserves previous evidence; it does not remove history or maps.

Suspension, shutdown and update quiescence stop the timer, abort/drain the current read and checkpoint before closing storage. Auto-Sync Off stops background discovery; a manual read remains available. No additional write operation is sent to YouTrack by the discovery reader.

## Trust Boundary

Server task/project identity and attachment author are checked independently of file claims. The current exact authorization, its consent-time attachment inventory and metadata safety are re-evaluated for display. Preauthorization attachments, package withdrawal/replacement, changed/missing native files or pins, absent/different attribution and conflicting result identities require review. Uncertain authorization metadata defers staging eligibility. GenericCola is the approved shared-account route; matching author IDs do not prove a distinct human versus agent identity.

The local pinned package and baseline must exist. Portable manifests are not approval credentials. Discovery checks format, stable map/base/binding and declared plan/group membership; U25 must still validate every actual write, dependency completeness, newer drafts and fresh remote evidence before application. No U24 field authenticates a human test. Every agent return retains its mandatory human-testing requirement.
