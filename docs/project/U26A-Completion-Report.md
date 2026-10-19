# U26A — NPCDex Annotation and Settings Corrections

**Complete in source:** October 19, 2026. Installed ROMDex remains **0.5.15**. These corrections ship with the planned integrated installer; no live saves, credentials or YouTrack records were changed.

## Changes

- Unchecked **Selected Line Only** now saves one flag/note for the entire current dialogue prompt, across its passages and speaker turns, as clarified by the user. Checked annotations remain separate passage records. Testing and existing change decisions retain their speaker-turn scope.
- Existing item, inherited and older speaker-turn flags/notes are visible under **Other Flags & Notes Applying Here**, with their source and an edit route. The original contextual flag/note controls and history are retained. Original identities remain attached to their saved targets, including migrated feedback whose old target differs from the current cursor.
- Tile feedback resolution honors the explicit item target instead of an incidental dialogue cursor. A cleared flag cannot become critical merely because a legacy critical boolean remains. No annotation is bulk-cleared or silently moved to a wider scope.
- Tray 2 retains one contextual Add/Edit Note button beside Flag Prompt; legacy supplementary notes panels are removed from the inventory presentation, without deleting note data.
- Tray 2 settings provides **Data / Flags**, opening the familiar Flags, Notes & Changes summary for the current map/location/room selector, including applicable inherited feedback. Tray 1's global Flags & Notes view remains available.
- Settings navigation is available immediately. Close and a single Escape dismiss the dialog even while storage status is slow. Late responses cannot repopulate a closed/replaced menu. Background refresh waits while a dialog is open, preventing the summary from rebuilding under the user's pointer.

## Diagnosis and Preservation

A read-only audit of the current three managed RDX files found seven saved flags in New Bark Town, six critical, all bound to existing review identities. Three critical flags were character-level annotations. They were not merely leftover image elements. The correction makes their true source editable; it does not assume they should be deleted. Clearing a new prompt flag cannot erase a different saved character flag. The original archives, existing annotations, plans, revisions, images and credentials remain unchanged.

The reported exact title “Content Controls” and the extra Tray 2 note box were not reproduced in current source. The current source's Content Tools route has been hardened, legacy supplementary note presentation is removed explicitly, and the original Data/Flags access is restored. Acceptance in the installed application remains part of the packaged release gate.

## Verification

- **55 affected regression cases verified** across classic feedback, content editing, presentation, native trees and RDX workspace/adoption/catalog paths. The initial combined run passed 54; the new sync test's count assertion initially included a pre-existing fixture review. Its assertion was corrected to count its own two reviews, then all **20 feedback tests passed**, including the sync round-trip. Counts overlap and must not be added.
- **Eight focused source UI checks passed** using real original controls, native RDX compilation/import, managed SQLite and local edit/draft endpoints in isolated Chromium. They cover inherited flag clear/note preservation, whole-prompt scope across turns, independent passage scope, reload and final-marker removal, no duplicate inventory note editor, selector-filtered Data/Flags, delayed-status Close/Escape and reopening managed storage.
- The native ContentEditor/Reader transport fixture published both annotation scopes, rehydrated them, published the flag clear and rehydrated again. Notes, whitespace, identities and independent feedback survived.
- No new remote endpoint or credential mechanism was added. No redundant live write, installer or Windows helper run was performed. Existing live files were read only; test mutations used disposable copies.

See [verification evidence](U26A-Verification.json). The private Git source-backup identity is recorded separately after publication.

## Next Task

**U27 — History, Reversal and Verification-Gated Completion. Recommended: Sol / High.** A new PASSKEY is required. Installed 0.5.15 has not received U21–U26A source changes yet.
