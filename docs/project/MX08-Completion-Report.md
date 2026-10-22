# MX08 — Typed Plans and Reviewed Prose Results

Complete October 21, 2026 in source under the Phase 11E PASSKEY. Installed ROMDex 0.5.26, production Data, protected connections and paused NPCDex sync remain unchanged. MX09 is authorized next; no installer/release occurred.

Package previews now distinguish typed changes from written instructions and context. Existing CHANGE/REMOVE/FINAL and contextual planning remain; no Draft/Ready gate was added. Typed results retain exact patch validation. Prose results are discovered but remain held until the owner reviews and accepts the exact complete-group differences through the existing three-way review.

The new fail-closed RDXReviewedScope/1 decision pins the original return bytes, package/task, preview, current read revisions and exact differences. It is private metadata authority, not a portable approval flag. Typed fields cannot drift in a mixed group; prose cannot write other records or escape a selected point/passage. Wrong identity, shared/cross-map writes, corrupt assets, incomplete groups, invalid structure, superseded authorization and other hard failures remain blocked. Existing reviewed overwrites retain their previous field semantics. Accepted work remains Needs Human Testing and leaves its task open; newer unrelated content, drafts and history survive.

Testing exposed a queue deadlock introduced at the MX07 boundary: return processing held the local queue while cloud publication requested that queue. Network processing now runs outside that queue, reserves the cloud channel against competing remote review/cycles, and enters the local queue only for a pinned checkpoint. Slow authorization no longer prevents local saves.

Verification: 49 focused application/review/private-metadata cases passed, plus one targeted slow-network/local-checkpoint case (50 distinct cases). Five source UI checks passed in isolated Chromium with an in-memory task transport: held prose, three-way wording review, cancel, no footer overlap at 620px, and complete-group acceptance preserving Auto-Sync Off/open task/unreviewed testing. The screenshot was inspected. There were no live YouTrack writes in MX08; MX09 owns the real-ROM/task-file/native integration proof. Initial schema-keyword/native-schema-copy mismatches were corrected before these runs. Early test hangs exposed the queue defect above; the completed run passed without repetition of a broad suite.

Limits: bounded review is 20 records/40 visible changes per group/page; an oversized or hidden scope cannot be approved. Exact approval evidence is capped at 256 KiB. Old clients reject the new review format instead of accepting it without understanding it. Shared/cross-map identity changes and new native content identities still need supported separate workflows. This does not claim in-game verification or production deployment.

Next: MX09 — Deterministic Agent Return Tools and Real ROM Proof, already authorized by the same Phase 11E PASSKEY.
