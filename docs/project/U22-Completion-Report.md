# U22 — Complete in Source

Completed October 19, 2026 under the U22 PASSKEY. **Installed ROMDex remains 0.5.15.** No installer, production-data migration or live YouTrack write was needed for this navigation task. U23 remains separately gated; recommended **Sol / High**.

Task Details now lists its **Linked Map Packages**, with **Open Map** and **View Package** buttons. NPCDex's Map Package Delivery view links back to the exact task in ROMDex or YouTrack, opens the exact managed map, and can select an individual NPC/entity/dialogue target. Versions use the original package and task identities, including native task-ID remapping; similar names are never used to guess a destination. Cross-document navigation checkpoints the current view and reloads the selected document without importing or publishing it. Active editors and missing/changed targets receive a clear message.

Each package shows uploaded/verified file counts. **View Version and Item Progress** shows the fixed source identity/hash and the selected items grouped by dependency. Later drafts cannot change these rows. Context-only entries remain clearly identified. Delivery distinguishes **Staged**, **Attached** and **Needs Review**, including the existing native upload-recovery holds.

Implementation and human testing are separate, read-only progress dimensions. They currently display **Not Reported** and **Not Verified**; U23–U27 still own authenticated agent results, reconciliation and testing. A task being Complete, a plan claiming implementation or imported testing metadata cannot manufacture accepted result evidence. Navigation never dispatches work, changes task status or completes a task.

## Evidence

- **77 focused regression tests passed**, covering package models/durable queue, exact identities and targets, editor and navigation guards, workspace switching, shared indicators and desktop policy/lifecycle.
- **Eight interface checks passed** against the real source shell, ROMDex task UI and NPCDex assets with an isolated native facade in headless Chromium. These covered the Tray 2 menu, task/package return links, exact NPC/dialogue targeting across a managed-document reload, map opening, missing-target behavior, the footer at a 620-pixel window height, and preservation of task content/status and queue. No renderer errors or external requests occurred.
- Syntax checks and source hashes are in [verification](U22-Verification.json); interface details are in [UI evidence](U22-UI-Proof.json). This is source/interface evidence, not a new Windows installer or live-service acceptance claim. The existing U21 native delivery and real YouTrack proof were reused rather than repeated.

The original flags/notes/change editors, installed Data and remembered credentials remain unchanged. The overall checklist is updated; stop before U23's contract/access review.
