# U06 — Shared Theme and Approved Header

Completed October 15, 2026 under the task-specific PASSKEY. The user's latest header placement supersedes U05's footer placeholder.

## Delivered

- Unlabeled static red circular workspace button immediately left of Auto-Sync in the top-right header. It is 27.2 px across, 20% smaller than the 34 px controls, and vertically centered. No footer row or lost tray height.
- Shared theme, reusable header controller, original NPCDex favicon, approved Standard Settings Icon, indicator geometry, tray frames and button styles. Canonical assets live in [Tool-Suite-UI](Tool-Suite-UI/README.md), with identical package/public copies.
- Decorative title circles ordered red → yellow → green. Brand geometry and Save dimensions match the previous release. The corrected concentric connection light is preserved.
- Connection Details opens from the connection light or Application Settings. About displays the running version. Menus support keyboard navigation, outside dismissal and ESC with focus return, without triggering Work Pane ESC behavior.

## Verification

227 automated tests, 319 module syntax checks, nine focused header/UI checks, eleven attachment/startup browser regression checks, and a separate original-reference comparison passed. The menu fits at 1280, 1024, 768, 600 and 320 px without page overflow. No browser script errors. The original NPCDex stylesheet was also checked with the shared header using synthetic markup and no private NPC data.

Evidence: [UI checks](U06-UI-Verification.json), [reference comparison](U06-Reference-Verification.json), [header image](U06-Header-QA.png), [patch manifest](U06-Patch-Manifest.json).

## Delivery and Preservation

Installed the 12-file frontend/shared-assets patch into the existing **ROMDex-v0.4.1/ROMDex** folder and verified all 7 changed public assets over the running service. Refresh the open ROMDex page to load it. No service restart or token entry is required. This is **0.4.1 + U06**; the original 0.4.1 ZIP and manifest remain unchanged. Canonical source is **outputs/ROMDex**.

All 70 original packaged files are preserved and hash-verified in [U06-Before](U06-Before). Remembered credential ciphertext, service identity and Auto-Sync setting are unchanged. NPCDex's Downloads template and saved export remain unchanged. QA used isolated fixtures; this task performed no production YouTrack writes. The workspace is not a Git repository, so delivery is a recorded patch change set rather than a Git commit.

## Remaining Boundaries

The menu currently lists ROMDex and a disabled NPCDex entry. U08 supplies real workspace switching and preserved context; U06 does not simulate loading NPCDex. Application Updates and Quit stay unavailable until the desktop capabilities exist. Current Save/Auto-Sync behavior remains native YouTrack synchronization; NPCDex cloud storage and shared coordination belong to later tasks.

**Next: U07 — Relocate NPCDex Controls, Sol / Medium.** Move Data into the Inventory cog, Male/Female immediately left of that cog in Tray 2, and Flags & Notes to Tray 1, adopting shared styling while retaining their behavior. U07 has not begun and requires a new PASSKEY.
