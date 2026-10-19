# U26A — NPCDex Annotation and Settings Corrections (Completed in Source)

Reported October 19, 2026 during U26. Implement after U26 under a separate PASSKEY. Recommended model/effort: Sol / High. Completed in source; see [completion report](U26A-Completion-Report.md). Installed 0.5.15 is unchanged.

1. New Bark Town tiles retain red critical-flag icons after their former critical flags appear cleared. Setting and clearing a new critical flag also leaves the icon. Trace saved data, inherited/legacy annotations, native projection and rendering; preserve real flags, notes and history.
2. With Selected Line Only unchecked, adding a flag/note still appears limited to the current dialogue and disappears when switching dialogue. Compare original web semantics and restore broader-scope application/display without changing the intended checked behavior.
3. Remove the redundant Add Note box at the bottom of Tray 2. Preserve the Add Note button beside Flag Prompt and its existing note data/behavior.

4. Tray 2 Settings opens an empty Content Controls menu. Its Close button does not work; the user must press Escape twice to exit. Populate the menu and restore standard Close/Escape behavior.
5. Include the former Data/Flags button in Tray 2 Settings. It must summarize current flags, notes and changes within the current selector’s scope.

Verify existing and newly created annotations, set/clear cycles, dialogue changes, reload, workspace switching and relevant sync round-trips. Do not bulk-clear annotations to hide the symptoms. No U26A implementation occurred during U26. U26A is now source-complete under its own PASSKEY. The user clarified unchecked scope as the entire current dialogue prompt, across passages and speaker turns.
