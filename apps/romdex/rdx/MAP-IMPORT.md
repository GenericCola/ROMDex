# NPCDex RDX Map Import and Update

RD05 source implementation. These controls are not in installed ROMDex 0.5.14 yet. Existing production maps remain in their accepted native storage; this task does not convert them.

## Using a Local Map

1. Open NPCDex and choose the Tray 2 settings button → **Import RDX Map**.
2. Choose one map `.rdx`. Review its owned records and region/shared dependencies. The original file is not modified.
3. For an existing document, review updates and any conflicts. Expand **Local Version** and **Imported Version**, then choose explicitly. Confirmation remains unavailable while a conflict is unresolved.
4. Optionally select eligible archival proposals from a complete snapshot. Omitted content stays present; selecting archival stages a REMOVE proposal and preserves history. Partial snapshots imply no archival.
5. Choose **Import Local Map**. NPCDex opens the map using its existing tiles, flags, notes, change tags and contextual editors.
6. Edit normally. Local changes checkpoint into the managed `.rdx` through the version journal. **Save Changes** finishes the local checkpoint; it does not publish this unbound map to YouTrack.
7. Tray 2 settings → **Export Current Map RDX** prepares a verified download containing current content, proposals, notes, images and retained history. Export does not overwrite the original input. The browser/desktop download location is separate from the managed working file.

The settings menu lists imported maps and offers **Return to Synced Content** when the existing NPCD provider is available. Each document keeps its own unfinished editor drafts and view position. Switching reloads only the NPCDex frame, after flushing its current edits; the ROMDex task workspace remains mounted.

## Storage and Update Rules

Working copies use `Data/RDX/working/<document-key>.rdx` inside ROMDex's application Data folder. The key is derived from dataset/document identities; filenames do not establish identity. Versions and assets are journaled before the working file changes. The existing 2 GiB managed-store quota and recovery rules apply; history is not silently pruned.

Imports use bounded 512 KiB chunks over the existing narrow desktop bridge. Renderer-provided filesystem paths are not accepted. Preview tokens pin the source revision, destination head and review choices. A changed head requires another preview. An old frame cannot save into a newly selected document.

Unchanged initial input creates no duplicate map or journal entry. Stable record IDs select updates. Exact record ancestry permits fast-forward updates and field merges against an unambiguous shared revision. Arrays are treated as whole values; overlapping edits remain alternatives. Conflicting plan/review/view revisions are preserved and require explicit selection. Reviewed selections join the observed revision branches. Imported optional extension values survive; collisions require review.

Shared profiles/regions/global context require explicit review when changed. A differing shared record already held by another local map is blocked for coordinated review; it is not silently overwritten. Imported assets cannot reuse an existing asset ID for different bytes. Record kind/parent rebinding is refused by this importer. Invalid presentation metadata is rejected before commit rather than leaving an unusable active map.

Portable testing claims are historical claims, not authenticated human verification. Imported reviews and legacy display annotations show **Unreviewed**. Explicit local review actions are remembered separately by this installation; exporting/reimporting does not grant another installation verification authority. Original claim bytes remain in the RDX history.

## Remaining Gates

Local documents are deliberately **unbound**. There is no implicit NPCD publication, task creation or agent dispatch. The existing connected content provider continues independently and is unchanged when a local map is open. Task-plan files are routed away from the map importer; RD06 supplies their workflow. Agent-result files are held for the later task-bound reconciliation/testing workflow.

RD07 must prove real, isolated two-way YouTrack binding. RD08 adds Windows file association. RD09 supplies the agent extraction/production guide. RD10 requires a fresh production preview and acceptance before replacing current maps with RDX working documents. No existing map adoption or successful live RDX synchronization is claimed by RD05.
