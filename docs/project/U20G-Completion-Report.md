# U20G — Complete

ROMDex **0.5.10** is installed and open. [Private release](https://github.com/GenericCola/ROMDex/releases/tag/v0.5.10). Source commit: `577396b7baf04ddb1980544244dbbf0a6f2874c5`. This is the approved corrective task before U21.

## Changes

- Restored contextual Flags & Notes and CHANGE / FINAL / REMOVE actions for the selected character, scene, dialogue or passage. Forms identify the target and current dialogue; technical selectors are hidden and history/workflow controls are collapsed. Unrelated drafts are retained instead of forcing a different item's draft into the selected form.
- Replaced the overlapping sticky footer with a separately laid-out action row and independently scrolling body. Native normal-height and 620-pixel checks reached the last field fully above the buttons.
- Rebuilt the overview and contextual summaries with Changes, Notes and Finalized categories, map/sub-zone, target, condition, current dialogue and actual proposal/note text. Finalized starts collapsed. Clicking a target reveals the correct record and story stage.
- Moved Add Character beside Male/Female in Tray 2. Its destination stays within the selected map/sub-zone and its result remains a Planned Addition.
- Preserved the scope of saved multi-passage requests. Stale notes start Unreviewed when their content changed, avoiding accidental carry-over of old Verified status.

## Verification and Data Preservation

**550 regression tests, 46 final focused rechecks, 166 syntax checks and nine checks of final packaged modules passed.** Native Save Changes in an isolated content copy created the right note with exact trailing whitespace and kept the unrelated original draft unchanged. The test copy had no credentials and its network writes were disabled. Read-only YouTrack/credential checks and actual Windows installation are recorded separately in the verification file.

A complete protected backup and isolated restoration verified **120 Data files / 152625258 bytes**. The installer retained those files byte-for-byte before reopening. The installed profile retains **299 tasks, 104 manual-order entries, 78 saved parent statuses and NPCDex revision 73 / 211 content records**. All three saved credentials remained unchanged and unlocked without re-entry; private update access was verified. The current Data folder was never replaced by an old or synthetic save.

Source, documentation and sanitized evidence are archived in the private repository; Data, credentials and private signing keys are excluded. The backup remains local in `outputs/U20G-Protected-Data-Backup`.

## Limits and Next Task

The accepted content storage, schema and installer Data-preservation contract are unchanged. Unsupported/missing target mappings still require review. Multi-passage requests retain their original proposed text while their descriptions/notes can be edited; deliberate rescoping remains a separate operation. Existing image/edit/cache bounds and fresh-computer setup requirements remain. Planning does not dispatch an agent or certify ROM implementation/testing. The private MSI remains unsigned for testing; its update metadata is cryptographically signed.

**U20G is checked off. U21 — Map Document Preview and Task Attachment remains unstarted. Recommended: Sol / High; a new PASSKEY is required.**
