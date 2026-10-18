# U20H — Complete

ROMDex **0.5.11** is installed and open. [Private release](https://github.com/GenericCola/ROMDex/releases/tag/v0.5.11). Source commit: `8ea7564d41fcfe75f59017087e0ad0cb04e10a58`.

## Restored Interface

- Reused the original web NPCDex renderer and styling for compact colored FINAL / UPDATE / REMOVE controls, flags and severity, inline notes, scope, testing checkboxes, tile feedback settings and the grouped Flags, Notes & Changes menu. UPDATE is the original web label for a change. The original web renderer and HTML remain byte-identical to their reference files.
- Mapped these original controls onto versioned database edits. Saved feedback reappears after reload; current ROM content stays separate from proposals. Exact note text, immutable targets, existing drafts, toggle-off history and conflict review are preserved.
- Replaced tile cogs with the same standard settings artwork and button geometry used in Tray 2. Add Character is immediately left of the gender toggle.
- Kept explicit recorded-content corrections and planned additions in the advanced database flows. The original whole-browser-save mutation path is not re-enabled.

## Verification and Preservation

**564 regression tests, 62 final focused rechecks, 169 syntax checks and 12 packaged-runtime checks passed.** Native isolated review covered the restored controls, actual Apply Note, reload and flag editing. The note retained its trailing space and correct prompt scope; an unrelated draft was unchanged. Test copies contained no credentials and made no remote content writes.

A complete protected backup and isolated restoration verified **120 Data files / 152641777 bytes**. A first incomplete copy was retained separately after the shutdown graphics cache changed; a fresh stable copy passed all hashes. Windows installation preserved the verified Data files byte-for-byte before reopening. Read-only acceptance confirmed **299 tasks, 104 manual-order entries, 78 saved parent statuses and NPCDex revision 73 / 211 content records**. All three saved credential files were unchanged and unlocked without re-entry. Live YouTrack access and the latest signed private update were verified. Installed native viewing left the accepted snapshot, edit journal and original draft unchanged.

Source, documentation and sanitized evidence are stored in the private repository. Data, credentials and private signing keys are excluded. The complete backup remains local at `outputs/U20H-Protected-Data-Backup`.

## Limits and Next Task

Accepted content storage and schemas are unchanged. Ambiguous/missing target mappings, conflicting edits and changed current-content baselines require review. Planning does not dispatch an agent or certify ROM implementation/testing. Existing image/cache bounds and fresh-computer connection/setup requirements remain. The private Windows installer is unsigned during testing; update metadata is cryptographically signed.

**U20H is checked off. U21 — Map Document Preview and Task Attachment remains unstarted. Recommended: Sol / High; a new PASSKEY is required.**
