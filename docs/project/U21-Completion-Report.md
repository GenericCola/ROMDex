# U21 — Complete in Source

Completed October 19, 2026 under the U21 PASSKEY. **Installed ROMDex remains 0.5.15.** This task adds the implementation and verifies it in an isolated native desktop; it does not replace the production installation. U22 requires a new PASSKEY, with **Sol / High** as planned.

NPCDex now has **Tray 2 Settings → Package Map Changes** and **Map Package Delivery** in source. The preview starts with the current physical map and its sub-zones selected, shows readable target paths and actual request/notes text, permits exclusions and lets the user choose an existing PMON task or explicitly create one under a chosen parent. It preserves the original flags, notes and change editors.

The user clarified that the interface has no Draft/Ready distinction. Selected CHANGE, REMOVE and ADD entries define the requested package scope after explicit preview confirmation; internal workflow metadata creates no extra user step. FINAL decisions, flags and notes remain context. Context-only packages are supported and prominently labeled. Attachment never dispatches an agent, assigns an existing task, advances its status or completes it.

Fixed package versions pin the exact map revision and selected artifacts. Required files—including current character images held in display metadata—are uploaded and downloaded for byte verification before publishing the readable JSON and its exact-byte task binding. Image associations are identified as context, not sprite-replacement instructions. Repeated confirmation/restart uses the same durable native operations. Newer edits remain pending. Cancelled/missing operations or changed files stop for review.

The full working RDX and excluded proposals/notes/history stay local. The JSON carries required current records, mapping evidence and selected artifacts; required assets live on the chosen YouTrack task. Private GitHub save access is unnecessary. The local immutable baseline stays pinned for later reconciliation. Save Changes can attempt delivery once with Auto-Sync Off, preserving that setting. Shared Save status includes packages between upload phases and surfaces errors without red flicker during healthy automatic delivery.

## Verification

- **197 targeted regression tests passed** across package models/queue, task fields and hierarchy, attachment/recovery/delete behavior, sync control/startup, desktop policy/lifecycle, RDX authoring/import, shared indicators and Save coordination. The explicit FINAL fixture assertion was strengthened afterward and its focused recheck passed.
- **Five native desktop checks passed**, using the real Electron host and service, isolated map data, no tokens and no production writes: whole-map preview, notes-only exclusions, fixed footer at a 620-pixel window height, explicit local staging/ESC, and orderly quit with the durable queue retained.
- **Six real YouTrack checks passed** using remembered credentials and uniquely marked owner-private synthetic tasks: restart/delivery, exact JSON/image/binding hashes and internal task identity, preservation of existing destination fields, duplicate suppression, context-only version and explicit new child task. Final test tasks **PMON-327 and PMON-328 were removed**; the earlier proof's PMON-325/326 were also removed. No existing user task or NPCD map was edited. The remembered connection file is unchanged.
- Final-source syntax and curated private source backup are recorded in [verification evidence](U21-Verification.json). [Native evidence](U21-Native-Proof.json), [YouTrack evidence](U21-Live-Proof.json), [task checklist](U21-Action-Plan.md).

## Remaining Boundaries

U22 adds linked navigation and progress. U23–U27 still own final execution identity, task-bound returned-RDX discovery/reconciliation and human review/testing. U21 does not activate those future features. Returned work must remain open for human testing. Recorded mappings may be documentation rather than proof of the latest ROM; the agent must resolve them against the actual ROM/source before making changes. ROM extraction remains a separately gated post-release stretch goal.

Delivery verification records the attachments at delivery time; continuous package progress/attachment monitoring is later work. Files above the documented limits block delivery rather than being omitted. A bounded manual attempt may leave more work queued; the delivery view explains its state. Missing/cancelled operations require review rather than automatic recreation.

See the [user guide](../../apps/romdex/rdx/MAP-PACKAGES.md) and the [overall checklist](NPCDex-ROMDex-Action-Checklist.md).
