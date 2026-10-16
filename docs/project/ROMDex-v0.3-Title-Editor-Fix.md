# ROMDex — Title Editor Whitespace and Height Fix

Completed October 14, 2026, following the user's title-entry report and request for a one-line Name box.

## Change

Details title autosave normalized each keystroke with `trim()`, then a workspace render replaced the editor's value with the saved string. A space typed at the end therefore vanished before the user could type the next word.

Focused title and notes fields now keep their current text and cursor through saves and incoming refreshes. When switching tasks, the new task's values still replace the old editor contents. Unfocused fields can still refresh from saved/native data. Matching values are not reassigned, preserving selections. Stored titles remain normalized and blank titles are not saved.

The Details title is now a single-line text input, 40 px high. Longer titles scroll horizontally while editing. Changed `public/app.mjs`, `public/index.html`, `public/styles.css`, added `public/editor-view.mjs` and its regression tests. Reload ROMDex to load the fix; no service restart is needed.

## Verification

- Changed JavaScript passed syntax checks; the full suite passed **117/117 tests**. New tests cover spaces between successive words across normalized saves, trailing whitespace/caret preservation through refresh, task switching, dirty editors, and unchanged notes selections.
- A temporary isolated browser fixture used the real application files with synthetic items, its own browser origin, no token, and no YouTrack connection. Typing a space after First retained `First `; after continuing, `First Second ` remained intact. `First Second Word` saved to the local Work row and survived reload. The input measured 40 px high.
- Inline rename, tile Name settings, and new-item drafts each accepted multiword names with spaces. Those checks were cancelled without committing. [Isolated preview](ROMDex-v0.3-Title-Editor-Fix-Preview.png) shows the compact title field.
- No real project item was edited during verification. The fixture browser was closed after testing.

Task 8 remains pending its PASSKEY, recommended **GPT-6.1 Sol / High**. The v0.2 ZIP remains unchanged.
