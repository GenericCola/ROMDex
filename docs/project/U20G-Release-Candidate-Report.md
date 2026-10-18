# U20G — Corrective Release Candidate

Version 0.5.10 restores contextual planning, flags/notes and testing for the selected character, scene, dialogue or passage. CHANGE / FINAL / REMOVE and Flags & Notes use a short form identifying its exact target; technical target selectors are hidden and history/workflow choices are under advanced options. Existing drafts for other contexts are preserved instead of replacing the selected item's form. Versioned history, immutable targets and conflict checks remain enforced.

Forms use a scrolling body and a separate action footer. Native review at normal height and 620 pixels confirmed the last field can be scrolled fully above the buttons. Add Character is beside Male/Female in Tray 2; it uses a unique selected sub-zone or asks for a destination within the current map. It still creates only a Planned Addition.

The overview and contextual summary identify map/sub-zone, target, condition, current dialogue and actual request/note text. Changes, Notes and Finalized have direct category links; Finalized starts collapsed. Selecting an entry reveals its target and an eligible story stage. Shared scene records are shown once per actual note/request. A finalized request for implementation remains in Changes unless its decision is FINAL.

Acceptance evidence: 550 regression tests and 46 final focused checks passed. Nine checks exercised the final packaged modules in Electron 44.7.2 / Node 24.21.0 / SQLite 3.53.4. Native Save Changes in an isolated accepted-data copy created the correct note with exact trailing whitespace and preserved the original unrelated draft. The UI copy had no credentials and its network writer was disabled; the protected production profile was not edited by these tests. The live YouTrack preflight was read-only.

The artifact/source audit, current Data backup/restoration, private publication and installed handoff are recorded separately. This candidate report alone does not mark the task complete. U21 remains unstarted.

Limits remain explicit: multiple-passage requests keep their original scope and proposed content; instructions/notes can be edited without replacing the complete request with one passage. Unsupported/missing target mappings require review. Current/proposed content, actual ROM implementation and human testing remain separate. Existing image/edit/cache bounds and fresh-computer setup requirements are unchanged.

Final review also corrected stale testing defaults: editing a note after its content changed starts Unreviewed until the user explicitly verifies it again. The original note/review remains in history. The final r2 candidate supersedes the unpublished r1 build.
