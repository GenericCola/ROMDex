# RI03U — Update Existing Maps Across ROM Builds

Status: design approved and implementation delivered in verified installed ROMDex 0.5.23, October 20, 2026. Actual two-build acceptance remains deferred; see [completion report](RI03U-Completion-Report.md).

## Outcome

Prepare a map from an earlier build, publish it to NPCDex/NPCD, plan agent work, then extract that same logical map from a newer ROM and update its existing identities/tree. Preserve user planning and history, retain build provenance, and require human testing for agent-produced changes. Different ROM projects may contain maps with identical names without sharing identities.

## Confirmed decisions

1. **Link builds to an existing ROM project.** When opening a newer ROM, let the user explicitly associate it with the existing ROM project once. Use that project context to suggest existing target maps for individual update review. Matching names, filenames or game codes alone cannot establish this relationship or authorize a write. A new fingerprint records a source version, not a new logical map.
2. **Side-by-side identity matching.** For uncertain area/entity correspondence, show old/new location, sprite and full associated dialogue. Offer Same Item, New Item or Leave Unresolved. Retain the established identity and associated planning/history only for an approved correspondence. Keep source locators/indices secondary and inspectable. No AI is needed to decide or apply the mapping.

3. **Review the whole map before updating.** Keep the existing NPCDex map unchanged until the entire cross-build update review is complete. Save unfinished review locally so it can be resumed. This concerns cross-build map replacement; the already-approved independent agent-result application rule remains unchanged.
4. **Confirm apparent implementation.** When extracted ROM content exactly matches a pending structured change, flag it as Appears Implemented for the user to confirm. Confirmation records implementation with mandatory human testing; it does not complete the actionable task. Prose-only requests require manual review. Extraction alone is not a validated agent return and does not bypass package authorization or conflict checks.
5. **Review changed passage matches.** Retain notes and flags automatically for unchanged passages only when correspondence is unambiguous within an approved entity/prompt match. Let the user compare and match rewritten or reordered passages. Changed-passage correspondence requires confirmation. Keep unmatched annotations with their original retained text for review; never transfer them solely because a line number or script offset was reused.
6. **One current map per ROM project; reviewed rollback.** Keep one current NPCDex version of each logical map within its ROM project. Older builds remain available in MAPDex for inspection/preparation. Replacing current content with an older build requires the same explicit whole-map update review. Opening a ROM never rolls back NPCDex. Parallel current map branches are outside this first version.

## Established requirements carried forward

- Keep the existing map/dataset, entity and NPCD issue identities for validated matches. Do not match by name or reuse a source slot as proof of identity.
- Preserve notes, flags, proposals, images, custom presentation, history and newer local edits. Keep source-derived content distinct from user-authored display cleanup and proposed ROM changes.
- Missing entities are not silently deleted. Preserve history and review removal/archival according to the explicit update scope.
- Imported implementation results retain Needs Human Testing on the task and affected content; actionable tasks stay open until human verification.
- Exact package authorization, superseded-return review, conflict review and deterministic validation remain in force.
- Existing attached task packages remain fixed snapshots. Accepting a newer ROM baseline neither rewrites a package nor authorizes new work. Results based on outdated content remain subject to the existing baseline/conflict and superseded-package review rules.
- Preserve current hierarchy and user-defined map groups, including child groups/floors/entities. Review source movement rather than flattening or allocating duplicate logical identities.
- NPCDex continues to stage plans. Extraction/update never dispatches work or creates actionable change requests automatically.
- Every accepted update checkpoints the managed one-map RDX and publishes through the established local/cloud journal. Older source evidence remains history.

## Proposed workflow for final review

1. Open a supported ROM and explicitly link its build to an existing ROM project, or create a separate project. A different fingerprint is a new source version, not permission to reuse identities or reader offsets.
2. Use the selected map tile's standard settings menu → Update Existing Map. Choose/confirm the existing NPCDex target; suggest candidates within the linked project without matching solely by name. Prepare Map remains available for ordinary preparation.
3. Compare old/new areas, entities, sprites and full dialogue. Confirm uncertain Same Item/New Item matches, relocations and passage correspondence. Preserve nested areas, source evidence and all user-authored planning/presentation/history. Save unfinished review locally.
4. Review the entire map: target/project, old/new builds, retained identities, additions, movements, missing-record archival proposals, unresolved annotations, content conflicts and apparent implementation. Missing records outside complete extraction coverage are retained. Hard validation failures block application; unresolved identity/content decisions keep the current map unchanged.
5. Confirm the complete update. Recheck the current baseline; if it changed during review, refresh affected decisions rather than overwrite newer edits. Retain both source revisions and apply via the existing managed one-map RDX and recoverable cloud journal, honoring Auto-Sync and an explicit NPCDex sync pause. Show local-save and cloud-delivery status separately.
6. User-confirmed implementation remains Needs Human Testing on the affected content and task; the task stays open. Existing fixed package authorization and return review rules remain in force.

The user approved this consolidated workflow and deferred real-build acceptance. Implementation is authorized under the existing RI03U PASSKEY.

## Implementation boundaries

- Maintain a persistent ROM-project registry that associates explicitly linked build fingerprints with existing per-map extraction lineages. Preserve previously issued dataset/document/record IDs; assigning a project must not regenerate them. Carry the association and reviewed correspondence in portable, versioned RDX metadata so recovery and another installation can interpret it.
- Retain each ROM build's source locators and extraction evidence. Do not overwrite an old locator with a new one without preserving its revision context. A candidate match must be one-to-one within the reviewed scope; duplicate, contradictory and structurally invalid matches remain blocked.
- Distinguish source content from user overrides. Changed source names/sprites must not silently erase custom display names/images. Keep new source evidence inspectable alongside the retained presentation.
- Save review progress against exact source and target baselines. Commit only after whole-map approval and revalidation. Local application must be recoverable; cloud delivery may take time and must report progress and failures truthfully. Whole-map review does not imply that YouTrack supports a single atomic multi-issue transaction.
- Validate compatibility from the ROM itself before extraction. Explicit project linking cannot bypass an incompatible reader layout. Show an actionable compatibility failure while preserving all existing maps and preparation.
- Keep existing keyboard behavior and standard tile-cog placement. Do not add a persistent extra toolbar or redesign NPCDex's editing controls for this workflow.

## Findings from the installed source

`rom/identities.mjs` allocates source IDs independently of display names and indices, but its manifest currently pins one ROM hash and inventory digest. A changed fingerprint produces review candidates keyed by area/type/index; it deliberately rejects automatic identity reuse. Matching slot numbers are candidates only, even if their evidence is unchanged.

The existing manifest's `projectId` is currently generated per extraction lineage. A persistent ROM-project association needs its own explicit model/registry or a carefully reviewed compatible relationship; the UI concept must not blindly conflate all same-ROM map manifests into a single existing ID.

`rom/staging-document.mjs` currently requires identical recovered identity-manifest digests for repreparation. Supporting approved cross-build correspondence requires versioned identity/mapping evidence and a reviewed update path, not disabling that check.

`rom/profiles.mjs` currently pins the supplied 0.6.3_noduplicates build by exact SHA-256. Newer-build layout validation must be added deliberately. Linking a build to a project does not waive reader compatibility or authorize trusting old offsets against changed bytes.

The agent-return path already has exact task/package/base provenance and reviewed application rules. Fresh MAPDex extraction must preserve comparable continuity without treating extraction as proof of authorized implementation or human testing.

`rom/compile-map.mjs` currently derives dialogue point/block identities partly from script flows, predicates and instruction offsets. Stable entity matching alone therefore cannot preserve passage-level annotations after script restructuring. The update review needs explicit prompt/block correspondence and retained old text/evidence for unresolved annotations.

`rdx/map-import.mjs` already pins preview decisions to source and local revisions, retains exact imported documents as portable history and preserves concurrent planning revisions. It rejects changing an existing record's parent through ordinary map import. Cross-build relocation therefore requires an explicitly validated migration path with a complete graph review; it cannot be implemented by relaxing the ordinary importer indiscriminately. Any changed local/cloud baseline after preview must trigger revalidation before application.

## Acceptance inputs and proof

The user confirmed October 20 that no updated build exists; the newer-ROM scenario is hypothetical for now. The available actual ROM is 0.6.3_noduplicates.nds. Do not request an unavailable build repeatedly or make it a prerequisite for implementing the workflow.

Approved verification scope: implement the approved workflow, verify extraction against the available actual ROM, exercise cross-build identity/content changes with clearly labeled controlled fixtures, and verify isolated RDX/backend recovery plus the changed UI and installer. Controlled cases must include moved/reordered/added/removed entities, rewritten/reordered passages, nested groups, preserved user overrides/plans, stale review baselines, ambiguity, rollback, apparent implementation and interrupted/resumed delivery. These checks demonstrate the implementation's rules; they do not establish compatibility with an unseen ROM build.

Keep a separate unchecked acceptance item for two actual supported ROM revisions, to run when another build is available. Implementation and installer delivery may be reported complete on their own evidence; real cross-build acceptance remains pending. No editable source or prepared agent JSON is required for that later proof.

Prove: earlier map → existing NPCDex/NPCD tree → retained planning → newer ROM extraction → reviewed correspondence/update → same logical identities and backend issues → updated portable RDX → exact recovery. Include moved/reordered/added/removed entities, changed dialogue/scripts, nested groups, local/cloud conflicts, interrupted/resumed delivery and mandatory human testing where appropriate. Use isolated records/profiles; do not replace the live dataset to prove the workflow.

Use focused model tests and one integrated isolated workflow check now; reuse prior unchanged evidence rather than repeating unrelated regressions or migrations. When the actual pair becomes available, run the deferred integrated two-build proof. Record real-ROM, controlled-fixture, Windows and YouTrack evidence separately.
