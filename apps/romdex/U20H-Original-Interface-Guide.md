# Original NPCDex Feedback Interface

ROMDex 0.5.11 restores NPCDex's original web renderer and CSS for feedback. The original FINAL / UPDATE / REMOVE tags retain their compact dimensions, colors, selected-state dimming and critical-flag behavior. UPDATE is the original web UI label for a change request.

Use Flag Prompt/Flag Entry to choose Standard or Critical; click a flagged control to clear it. Add/Edit Note opens the original inline note editor. Selected Line Only preserves passage scope; leaving it off applies feedback to the current speaker prompt. The original tester checkboxes remain separate from editorial decisions. UPDATE/REMOVE reveal the original inline Change Description and optional Proposed Dialogue fields; Apply Changes or Save Changes commits pending text. Clicking the selected decision again clears it while preserving version history.

Flags & Notes opens the original FLAGS/NOTES, CHANGES and FINALIZED groups, grouped by map. Entries navigate to their original context. Tile settings retain the original feedback controls; Edit Recorded Content opens the database documentation-correction tools. Unsupported content mappings and conflicting edits require review rather than guessing a target. Current content and proposed ROM changes remain separate.

The interface is backed by the versioned database. No browser folder selection, IndexedDB save, embedded content baseline or whole-save replacement is re-enabled. Inline drafts and queued operations are saved locally; Auto-Sync and manual Save retain their shared behavior. Independent edits are merged; competing changes to the same field are retained for review. Existing drafts/history and remembered connections are preserved.

All tile settings buttons use the same SVG and 18-pixel circular face as Tray 2. Add Character is immediately left of the gender toggle and continues to create a Planned Addition only. This corrective release does not implement U21 or dispatch work to an agent.
