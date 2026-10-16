# NPCDex — U07 Integration Working Copy

This package is staged for U08 workspace integration. It was copied from the user's authoritative Downloads/npcdex-v2.42 package on October 15, 2026. The Downloads package and all saved data remain untouched.

U07 changes only control locations and related styling:

- Flags & Notes: Tray 1 beneath Maps, above selectors.
- Male/Female: Inventory header in Tray 2, immediately left of Inventory Settings.
- Data: inside Inventory Settings, opening the existing Content & Saving dialog. Closing Inventory Settings before opening Data prevents stacked modal navigation.
- Inventory Settings: exact Standard Settings Icon, 12 px artwork centered inside an 18 px circle.
- Decorative title lamps: red → yellow → green, matching U06.

The HTML remains a standalone intermediate build; the shared host/header and workspace switching are connected in U08. Save and all existing data/reconciliation handlers are retained. This is not a cloud-enabled build.

**Data boundary:** npcdex-agent-export.json is the current saved revision 72. The unchanged npcdex-data.json and embedded HTML dataset are the original packaged revision 64; they are not a replacement for the current save. U07 has not migrated or overwritten any saved content. Do not use this staged HTML to replace newer work. U08 must re-read the latest save and preview preservation before adopting it, rather than assuming this captured revision is still latest. U07 QA injected the saved export into an isolated before/after harness and confirmed identical hydrated data.

Use build-npcdex.cjs after source changes; it assembles and syntax-checks npcdex.html. Preserve every module and data field when integrating. Stable control IDs and their existing handlers remain available. Keep the original local-save contract until shared coordination is implemented under U09.

See ../U07-Completion-Report.md and ../U07-Verification.json for verification and protected-file hashes. The pending file-drop attachment request belongs to U10F, not this NPCDex UI change.
