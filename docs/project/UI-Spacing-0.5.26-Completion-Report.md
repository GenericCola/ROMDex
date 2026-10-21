# Form Spacing Correction — ROMDex 0.5.26

Installed and reopened 0.5.26 with current Data and all three remembered connections preserved. A fresh complete backup and isolated restoration verified 128 files. All 396 installed application files matched the package; Data matched exactly before reopening. The source/documentation backup is private in GenericCola/ROMDex. Live Data, credentials and protected archives are excluded from Git.

MAPDex character-link checkbox text now has a 10px gap, with a 12px gap before its action. Apply Thumbnail sits 10px below its dropdown. The higher-specificity label rule that removed flex spacing is corrected, and the action uses the standard button group. Shared form styles keep checkbox widths natural and normalize form-action padding/gaps in MAPDex, ROMDex dialogs, NPCDex native dialogs and Updates. Normal reviewed form buttons use 8px vertical and 12px horizontal padding; Updates retains 14px horizontally and grows for wrapping labels. Header geometry remains unchanged.

Verification: eight existing catalog/asset/policy cases, two changed-module syntax checks, rendered layouts at 1500px and 1000px widths, a narrow 480px Updates window, and two focused packaged desktop checks. The rendered label-click check confirms clicking the text toggles the checkbox. No backend sync behavior, data contract, content identities or planning controls changed; no live YouTrack proof records were needed. Existing backend/lifecycle evidence was reused.

Recovery: outputs/Protected/Before-MAPDex-0.5.26/Data.zip and the previous application-source ZIP. Current evaluation installer: outputs/ROMDex-Installer-0.5.26/ROMDex-0.5.26-x64.msi. The published private updater release remains 0.5.15.

The owner requested these corrections before evaluating a significant MAPDex overhaul. This pass changes form spacing only. Broader layout design remains open for owner evaluation, as do the previously recorded narrative-phase and two-actual-ROM-build acceptance gaps.

[Evidence](UI-Spacing-0.5.26-Verification.json) · [Action checklist](NPCDex-ROMDex-Action-Checklist.md)
