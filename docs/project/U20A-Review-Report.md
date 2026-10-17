# U20A — Content Contracts and ROM Mapping Review

**Prepared and approved:** October 16, 2026. **Status:** complete. The user selected “Approve U20A Contracts.” The 45 model/compatibility checks and contract design are accepted; live transport/access and migration remain later proof gates. ROMDex 0.5.7 remains unchanged.

## Reviewable Deliverables

- [Contract overview](U20A-Contracts/README.md): permanent records, current/proposed/test separation, stable identities, version/actor rules, native edit behavior and recovery.
- [Structural JSON schema](U20A-Contracts/npcdex-contracts.schema.json): nine artifact types, including content, mapping, plan, review, package, result, correction, task binding and publication.
- [ROM extraction/import guide](U20A-Contracts/ROM-Mapping-and-Import-Guide.md): required source inputs, identity/mapping output, projection compatibility, preview gates and handed-off agent workflow.
- [Fictional map package](U20A-Contracts/examples/map-package.json), [independent result](U20A-Contracts/examples/dialogue-result.json), [dependent removal](U20A-Contracts/examples/dependent-removal-result.json), [newer draft](U20A-Contracts/examples/newer-draft.json), [documentation correction](U20A-Contracts/examples/documentation-correction.json), [task binding](U20A-Contracts/examples/task-binding.json), [group publication](U20A-Contracts/examples/group-publication.json) and [hash vectors](U20A-Contracts/examples/hash-vectors.json).
- [Executable design model](U20A-Contracts/verify-contracts.mjs) and [verification report](U20A-Contracts/verification-report.json).

## Main Design Choices for Acceptance

1. Keep existing prompt, block, character and review identities; distinguish shared profiles from local appearances, including gender alternatives. Scenes reference local participants.
2. Keep content, proposals, feedback/testing and implementation evidence separately versioned. An older packaged implementation acknowledges that version and preserves newer drafts/notes.
3. One fixed map document, explicit existing/new PMON task attachment, no automatic agent handoff. Required assets/mappings remain available through YouTrack.
4. Publish complete backend result groups: independent work can appear separately; linked scene/participant changes appear together. Preserve conflicting versions for review, without assuming server-wide transactions.
5. An explicit documentation correction records reason/evidence/history without requesting ROM work. Implementation resets testing and leaves task completion to the user.

## Verification

The standalone model passes **45 named checks**, covering structure/hashes, graph references, fixed versions, grouping, scoped writes, drafts/notes, test reset, actor-policy rejection, replay/changed-ID conflicts, stale corrections, required assets/mappings, unsafe locators and legacy compatibility. No browser was used.

Read-only inspection of the **protected U19 checkpoint**, not the current live save, found **870 scoped identities** across four town collections, 44 plans and 145 history entries. All **six existing request/baseline hash pairs** verify with the original JSON.stringify semantics. Source bytes remain unchanged. These counts are compatibility evidence, not an issue-count estimate or migration source.

No application/installer tests were rerun: application code was not changed. No YouTrack requests, uploads, permissions, project setup, actual ROM extraction, save migration or credential access occurred. The documents and fictional fixtures contain no live save export or token.

## Material Limits and Later Proof

This is an executable design model, not a production provider or live server proof. Its schema evaluator handles only this bundle's keywords; independent standard-validator and hardened-parser checks remain required. ADD activation/remapping and full legacy projection still need complete mapping/graph proof before enablement. Actual source adapters cannot be finalized against a ROM not supplied for this design task.

U20B must verify project creation/access, capacity, attribution, cross-project asset access, complete discovery, concurrency and uncertain uploads before choosing the physical carrier. U20E must preview and migrate the latest working dataset with exact original recovery copies. U23 must verify the actual execution identity/action permissions; JSON actor labels do not establish them. Current GitHub-backed NPCDex remains authoritative until an accepted migration.

## Approval Boundary

The user approved these contracts as the U20A design baseline on October 16, 2026. U20A is checked off. The user subsequently supplied a new **PASSKEY** authorizing **U20B — Content Project Access and Isolated Storage Proof, Sol / High**. That separate task owns fresh access/storage proof; application implementation and migration remain separately gated.
