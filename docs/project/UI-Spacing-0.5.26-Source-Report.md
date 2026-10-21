# Form Spacing Corrections — Source Review

The owner requested checkbox/text gaps and proper button padding, then evaluation before any broader MAPDex overhaul. This task changes form spacing and minimal checkbox/action markup only.

A higher-specificity MAPDex label rule had overridden the checkbox row's flex layout. The character-link label now keeps a text span with a 10px gap and its action sits in the standard action group, 12px below the row. Apply Thumbnail has 10px clearance after its dropdown. Shared form styles normalize checkbox widths, action gaps and text-button padding across MAPDex, ROMDex dialogs, NPCDex native dialogs and the Updates window. Update buttons grow for wrapping text. Header geometry is unchanged.

Rendered checks passed at 1500px and 1000px widths, plus narrow update-window checks. Label clicks toggle the checkbox correctly, text buttons have 8px vertical/12px horizontal padding (Updates retains 14px horizontal), and no reviewed button clips its label. Eight existing catalog/asset/policy cases and both changed-module syntax checks passed. Actual NPCDex styles were served through its native asset generator; synthetic form data was used without production writes.

Windows installer validation, two focused packaged desktop checks, fresh complete backup/restoration and the installed connection/context review passed. Installed ROMDex is 0.5.26. [Completion report](UI-Spacing-0.5.26-Completion-Report.md). Broader MAPDex layout changes remain for owner evaluation.
