# Returned RDX Application

U25 extends [discovery](RETURN-DISCOVERY.md). This is source functionality awaiting a later packaged release; installed ROMDex remains 0.5.15.

## Processing

Auto-Sync On discovers and processes eligible returns. Save Changes performs one bounded discovery/application cycle with Auto-Sync Off and leaves the toggle Off. **Check for Returned Files Once** remains a read-only discovery action. Package delivery shows trusted group/item application progress independently of task status.

Before acceptance, ROMDex freshly checks the exact active authorization, authenticated task/project/account, server attachment inventory and bytes of the fixed package, binding, return context, required assets and result. Local staging alone grants no approval. The approved existing shared account is still used; matching attribution is not proof of a separate agent identity.

Every written current-content value must equal the concrete patches in the authorized JSON package. Stable identities, mapping/build evidence, asset hashes, read baselines, explicit outcomes and complete dependency groups are checked. Independent successful groups can apply while another group is unfinished. A dependent group applies together or stays held. Unrequested content, stale reads, incomplete groups, conflicting results and instructions-only requests remain available for U26 review. No model interprets prose or guesses patch scope.

## Durable Acceptance and Publication

Acceptance is recorded through the existing private ROMDex metadata channel as **RDXResultAcceptance/1**, before any content effect. Metadata v3 adds immutable per-package-group acceptances; v1/v2 bytes and hashes remain supported. Concurrent withdrawal and acceptance conflict instead of merging automatically. Confirmed private proofs are cached locally so restarts/offline operation retain earlier accepted authority. Native task/RDX JSON cannot manufacture a private proof. A shared-account writer with only YouTrack access cannot authorize an implementation publication by inserting approval claims in its attachments.

The additive native **NPCDexRDXApplication/1** artifact retains the exact fixed package, original return evidence and required returned revisions/mappings. It is internal acceptance history, not a separate agent receipt file. The original returned RDX stays on its task and in the discovery blob store. NPCD writes go through the original content journal; immutable artifacts precede the publication manifest. The reader reconstructs and validates the exact deterministic application and checks its independent private acceptance proof before advancing. Adopted maps checkpoint their resulting native generation into managed RDX files with typed application history.

Explicitly bound standalone managed maps use the existing DocumentCloud publication and recovery path. Unbound maps defer; processing never silently chooses a destination. Accepted intents, original evidence and testing obligations survive failures between the private acknowledgment, native journal, managed-file checkpoint and backend publication. Replays reuse the original group operation. Already accepted work is retained after later withdrawal. A new conflicting baseline can still require review during recovery; acceptance does not authorize overwriting it.

## Preservation and Testing

Only the exact packaged plan head is marked Implemented. Newer drafts, excluded plans, notes/flags, views, images and history remain. Affected reviews retain notes/flags and receive an Unreviewed revision; removed points keep their historical reviews and receive a whole-item testing obligation. Unaffected testing stays unchanged. Returned testing claims, task completion and portable approval fields never establish human verification.

No task State, priority, assignment, comments or completion are changed. U27 adds the flashing-amber Needs Testing status/readiness notice and human-only completion gate. U26 supplies explicit review decisions. This phase records and displays the obligations without those later controls.

## Storage, Bounds and Compatibility

Back up the entire Data folder, including the RDX database, content/metadata journals, queued files and protected credentials. Added tables are return_applications, return_application_reviews, return_testing and return_private_acceptances. Working RDX files alone do not contain private approval authority.

A processing cycle accepts/recovers up to four groups and considers up to four retained return files. Each fresh verification is limited to 70 pinned files plus the result, 160 MiB total, 50 MiB per file, and 128 MiB/2,048 entries decoded RDX. Deferred attempts back off one minute; manual Save bypasses that wait. Existing storage bounds apply and evidence is not silently pruned. Suspension/update/shutdown abort and drain processing before closing stores.

This additive native artifact and metadata v3 require the updated client. Older clients fail closed on unsupported data. Refresh packaged clients and the authoring kit at the final release gate before production rollout. The generic GitHub transport is unchanged; U25 tests v3 authorization/acceptance convergence and conflicts using an isolated transport, not production metadata. The live YouTrack proof uses synthetic trusted metadata readiness and does not certify real ROM behavior or human testing.
