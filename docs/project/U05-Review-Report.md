# U05 — Header and Control Layout Review

**Prepared:** October 15, 2026. **Status:** completed and user-approved October 15, 2026. U05 is checked off.

The user rejected Direct Switch and Compact Menu. The revised [proposal](U05-Shared-Header-and-Control-Layout-Proposal.md) instead uses a small unlabeled static red circular button at the bottom-left of the red shell footer. Its pop-up lists ROMDex and NPCDex, closes on selection/ESC, and preserves each workspace's place when switching. The user clarified this means between workspaces in this app, not transferring view state between computers. No switcher remains in the header.

The title/lens/static lamps, Save appearance and corrected dynamic indicator geometry remain preserved. Shared Auto-Sync/Save remain at right; Connection Details opens from the connection light, and the Standard Settings Icon opens application-wide settings. The user accepted the revised layout with the footer switcher explicitly designated a development placeholder. A separately reviewed permanent solution can replace it later.

NPCDex's Flags & Notes moves to Tray 1; Male/Female moves immediately left of the Inventory cog in Tray 2; Data opens from that cog menu. The interactive comparison uses local illustrative content and performs no application operations.

[Initial Verification](U05-Layout-Verification.json) established reference geometry/fonts/asset/control checks and unchanged release hashes. [Revised Footer Verification](U05-Footer-Layout-Verification.json) checks five widths, the invisible label/accessibility name, menu contents, selection/ESC/outside dismissal, arrow navigation and a retained setting. [Closed preview](U05-Footer-Switch-Closed.png) and [open preview](U05-Footer-Switch-Open.png) show the revision. Full context preservation remains U08 work; no live app or current data was modified.

The user added **S01 — Attachment Controls and Startup Scope**, Sol / High, between U05 and U06: lighter paperclip; native attachment Delete; All Tasks on fresh launch. It is recorded as pending and requires its own PASSKEY. U06 remains Sol / Medium and requires another PASSKEY after S01.

The user approved the footer placeholder and corrected the three static decorative circles to **red → yellow → green**, left to right. Record that correction for U06; it supersedes the prior reference order shown in the existing images/prototype. The correction does not change dynamic task/save/connection indicators. U05 is complete; S01, Sol / High, awaits its separate PASSKEY. This remains a design approval, not an application implementation commit.


## U06 — Completed October 15, 2026; Header Placement Supersedes Footer

The user authorized U06 and moved the placeholder workspace switcher into the header, immediately left of the top-right controls, at 80% of their height. This supersedes all earlier footer-only instructions and illustrations; no footer space is reserved. U06 is complete in **0.4.1 + U06**: shared theme/header/assets, red → yellow → green decorative lamps, connection-light access and capability-gated settings. Verified 227 tests, 319 syntax checks, 20 focused/regression browser checks, original brand/Save geometry and 7 live-served assets. Credentials, Auto-Sync, NPCDex files, protected baseline and original ZIP remain preserved; no production YouTrack writes. [Completion report](U06-Completion-Report.md), [patch manifest](U06-Patch-Manifest.json). NPCDex is listed but disabled until U08 supplies its workspace. Next: **U07 — Relocate NPCDex Controls, Sol / Medium**, under a new PASSKEY.
