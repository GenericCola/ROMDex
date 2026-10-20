# RI03A — ROM Import Workspace Design

Status: **Complete — design approved by the user on October 20, 2026.**

The approved workspace loads a read-only ROM, lists maps/zones in Tray 1, prepares and edits the selected map locally in Tray 2, and shows contextual content, source evidence, timeline conditions and warnings in Tray 3. Each managed/exported RDX contains one logical map. Violet City is the demonstrated extraction target; a catalog listing does not imply verified extraction support for other maps.

Prepare Map creates a recoverable local staging document. Optional cleanup covers names, thumbnails and the map's own Roman-numeral stage labels/order while preserving original source evidence and identities. Export RDX creates a portable copy. Send to NPCDex is an explicit reviewed handoff; preparation alone never publishes content. The workspace stays open afterward and offers Open in NPCDex. Shared Auto-Sync applies only after handoff, and the explicit NPCDex pause remains in force. Local success, queued delivery, remote confirmation and review/error states remain distinct.

The user approved managed identity recovery, preservation of newer plans/flags/notes/testing, fresh existing-map difference previews, responsive extraction jobs, bounded cancellation/checkpoints and shutdown without waiting for cloud backlogs. Broken structure or unusable source mappings block output; unresolved semantic warnings may accompany a reviewed map. Changing area membership requires preparing the result again. Batch extraction is deferred.

The concrete interactive design preview was reviewed at desktop and narrow widths. Focused checks covered area-change blocking, warning acknowledgement, paused-cloud handoff reporting, ESC menu dismissal and trailing-space editing. No runtime errors were observed. This is design-preview validation, not implementation, installed-app or in-game acceptance. No application tests or live YouTrack proof were repeated for this documentation-only task.

The overall action plan, checklist and decision log now record the approval. The sequence is **RI03B — offline staging workspace → RI03P — cloud-delivery performance → RI03C — broader/build/identity acceptance → U28–U30 — integrated acceptance and packaged release**. RI03P was added at the user's request to address the high file/request count demonstrated by RI02C while retaining exact bytes, stable hierarchy, conflict handling and one map per RDX.

No application implementation or installer changed. The installed build, production maps and queue, remembered credentials and NPCDex sync pause remain untouched. Source/documentation backup excludes the ROM, extracted game content, generated game RDX files, live Data and credentials.

Next: **RI03B — Implement the offline workspace, Sol / High**, under a new task-specific PASSKEY. [Approved design](../../Project/RI03A-ROM-Import-Workspace-Design.md). [Overall checklist](../../../NPCDex-ROMDex-Action-Checklist.md).
