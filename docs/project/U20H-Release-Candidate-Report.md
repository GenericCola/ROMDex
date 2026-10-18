# U20H — Original Interface Corrective Candidate

ROMDex 0.5.11 restores the original web UI for NPCDex feedback. Its existing renderer and CSS are reused unchanged: compact colored FINAL/UPDATE/REMOVE controls, inline Standard/Critical flags, Add/Edit Note, Selected Line Only, tester checkboxes, inline change descriptions and the map-grouped FLAGS/NOTES / CHANGES / FINALIZED menu. Ordinary feedback no longer opens the replacement generic editor.

The adapter maps those actions to versioned database edits. Clearing a decision appends a superseded revision instead of erasing history. Notes retain exact whitespace and prompt/passage scope. Inline drafts survive locally; unrelated existing drafts are preserved. Independent changes merge; competing changes to the same field or changed current content require explicit review. Recorded-content corrections retain their separate, explicit flow. Browser folder selection, browser database persistence and whole-save replacement remain disabled.

All tile settings controls use the same standard SVG and 18-pixel circular face as Tray 2. Add Character is immediately left of the gender toggle and retains its Planned Addition behavior.

The full regression run passed **564 tests**. Final focused rechecks passed **62 tests**, including additional mapping/conflict-review cases. Native isolated review confirmed the original controls/menu and settings UI; a native Apply Note was verified in SQLite with exact trailing whitespace, the original unrelated draft unchanged and no remote writes. Reloading reconstructed its Prompt Note/Edit Note controls. The final package/source audit and bundled-runtime proof are recorded separately.

The first packaging attempt stopped on a documentation filename mismatch; its files remain local. An unpublished intermediate package precedes the last mapping and explicit-review checks. Only the fully audited r3 candidate may be published or installed. This report does not mark the task complete: complete Data backup/restoration and installed handoff are still required. U21 remains unstarted.
