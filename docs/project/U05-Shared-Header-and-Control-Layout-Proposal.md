# U05 — Shared Header and Control Layout Proposal

**Prepared:** October 15, 2026. **Status:** completed and user-approved October 15, 2026, with the decorative-circle correction below.  
**Authorized:** U05 design/review only. No application implementation, migration, connection change or live data modification.  
**Basis:** [Approved Desktop Design](U02-Desktop-Host-and-Distribution-Design.md), [Approved Sync Contract](U04-Data-Ownership-and-Synchronization-Contracts.md), actual NPCDex 2.42 template and released ROMDex 0.4 assets/CSS.  
**Checks:** [Revised Footer Verification](U05-Footer-Layout-Verification.json), [Initial Reference Geometry Verification](U05-Layout-Verification.json). The revised preview uses illustrative content, not the running app or live account. The initial Direct Switch and Compact Menu options were rejected by the user and are superseded below.

## Current Development Placeholder: Header Workspace Menu

Keep the existing lens, active title and three decorative lamps in their current reference positions. Under the U06 PASSKEY revision, place a small static red circular button in the header immediately left of the existing top-right controls. Allocate no footer space. It has no visible label or glyph. The user approved it as a development placeholder, to be replaced by a separately reviewed permanent solution later; it is not the final navigation design. Give it the accessible name and hover/focus tooltip **Switch Workspace**.

Clicking the header button opens a downward-anchored pop-up listing **ROMDex** and **NPCDex**, with the active workspace identified. Selecting a workspace closes the menu and activates its preserved view. Selecting the already-active workspace only closes the menu. ESC closes it and returns focus to the header button, without also triggering Work Pane selection/Details shortcuts. Clicking outside also dismisses it; keyboard arrows, Enter/Space and ordinary focus navigation remain available.

The active title is **ROMDex** for the task workspace and **NPCDex** for the add-on. The application/installer/Start Menu identity remains **ROMDex**. Do not add a subtitle. Reserve the title slot using the existing NPCDex text metrics so switching titles does not shift the decorative lamps.

Header order from left to right:

1. Existing lens → active title → three static decorative lamps.
2. Flexible space.
3. Static red circular workspace button, 27.2 px (80% of the 34 px controls).
4. Auto-Sync Data [On/Off].
5. Save Changes, including its existing save indicator.
6. Separate connection indicator, immediately right of Save Changes.
7. Standard Settings Icon for application settings.

This proposal replaces the text **Connection** header button with a keyboard-accessible connection-light button; clicking that light opens Connection Details. Connections is also available in Application Settings. This removes duplicated header navigation while keeping account access visible and reachable.

The switch activates an existing view instead of reloading the application, initiating synchronization, discarding drafts, or resetting selection. U08 preserves each workspace's selections, selector scope, expanded hierarchy, navigation, filters/settings, scroll, pane sizes, unsent edits and appropriate editing/focus context. Shared Save/Auto-Sync continue to apply to both tools, regardless of which title is visible.

The user explicitly clarified that this preservation means **between workspaces in this app**, not transferring the same view between different computers. U04's per-device view-state boundary remains unchanged. S01's All Tasks default applies on a fresh ROMDex launch, not each workspace switch or restoration of the running tray instance.

## Header Switcher Geometry — U06 Revision

The static red circular face is **27.2 × 27.2 px**, 20% shorter than the 34 px header buttons. Center it in the same alignment band immediately before Auto-Sync. It opens its menu downward with an 8 px gap; keep the menu within the viewport. There is no footer row. This supersedes the earlier 16 px footer-face/34 px footer-band proposal and its illustrations. The button remains an unlabeled development placeholder, with accessible name **Switch Workspace**. It does not convey connection or unsaved status.

## Reference Geometry and Appearance

| Element | Proposed specification |
| --- | --- |
| Desktop header | Existing 84 px height, 12 px vertical/10 px inner horizontal padding, 3 px dark-red divider and 10 px gap before trays. Retain existing outer 14 px inset at desktop width. |
| Lens | Existing 48 × 48 px, 5 px rim, gradient and shadow unchanged. |
| Active title | Existing system-ui font stack, 31 px, weight 800, −1 px letter spacing, cream color and shadow; fixed reference slot from NPCDex metrics. |
| Decorative lamps | Existing 9 px circles and 7 px gaps, ordered **red → yellow → green** from left to right. Retain existing red/yellow/green colors and positions; independent of dynamic status-light CSS. This user correction supersedes the earlier yellow/green/red reference order and is implemented in U06. |
| Workspace switch | Header immediately before top-right controls: static 27.2 px red circle, no visible label, downward menu listing ROMDex and NPCDex; no footer space. |
| Header action alignment | Auto-Sync and Save are 34 px high on one shared vertical center. Settings and connection targets occupy that same 34 px alignment band. No optical translate offsets. |
| Save Changes | Exact released appearance: 34 px high, 8 px/12 px padding, 6 px radius, yellow `#f6cd61`, border `#583921`, text `#293023`, 650-weight 14 px system-ui and 3 px lower shadow `#59121f`. Content determines width; no arbitrary resized copy. |
| Save indicator | Existing 7 px lens, 9 px left margin, centered inset ring and approved animations. Green when current work is up to date; red for blocked/uncommitted work needing intervention. No red flicker during normal successful autosaving. |
| Connection indicator | Preserve the corrected concentric geometry: 11 × 11 px outer circle with a 2 px 50%-black border and centered 7 × 7 px interior. Place in a transparent 24 × 34 px accessible button, with no extra visible frame. |
| Settings | Exact approved `standard-settings-icon.svg`, 12 × 12 px inside the canonical 18 × 18 px circular frame. Center the frame in a transparent 26 × 34 px header target. The visible circle is not enlarged. |
| Header edge clearance | Keep the complete right action group inset, with approximately 38 px between its final target and the desktop viewport edge. Save moves left to accommodate the connection/settings targets; its shape/size remain unchanged. |
| Fonts and controls | Use the established system-ui stack and Title Case. Do not introduce a new font, emoji cog, replacement Poké Ball or altered brand art. |

At the isolated 1280 px reference width, the proposal and released ROMDex have identical brand bounds: lens `(24, 16.5, 48, 48)`, title slot `(89, 18.03125, 119.171875, 44.9375)`, decorative lamps `(225.171875, 21.5, 41, 9)`. Save remains **131.84375 × 34 px** on this machine. These are verification measurements, not cross-platform hardcoded text widths. The three brand bounds remain identical when changing between ROMDex and NPCDex.

Use the actual NPCDex favicon bytes and canonical Standard Settings Icon, copied unchanged. The preview verifies their identities against the existing files. Its simplified tray contents establish control placement only; it does not redesign NPCDex tiles, dialogue, timeline, or ROMDex task rows.

## NPCDex Control Relocation

| Existing control | Proposed home and retained behavior |
| --- | --- |
| Flags & Notes | Tray 1, beneath the Maps heading and above selectors. Full-width compact button using the established pane palette. Opens the existing Flags, Notes & Changes interface and retains history/conflict navigation. |
| Male / Female | Right side of Tray 2's Inventory header, immediately left of its settings cog. Keep the two-button selection and player-character accessible label. No redundant label remains in the global header. |
| Data | A **Data** entry in the existing Inventory settings cog menu. Opens the existing Data interface rather than duplicating its import/export actions in several menus. |
| Inventory Settings | Keep its existing position and grouping behavior. Its menu includes Sort by Sub-Area and Data. Use the Standard Settings Icon artwork so suite settings controls agree. |

Data's existing snapshot export, agent-export import, receipt import, history, recovery and source options remain available. U07 moves access points without changing import/reconciliation semantics. Cloud-specific behavior appears only when the corresponding capability is implemented and verified; no “connected cloud saves” claim in the intermediate local-only build.

ROMDex's All Tasks, selector hierarchy, Work toolbar, Details header and splitter remain in their existing homes. The new side task below changes only the explicitly requested paperclip/delete/startup behaviors before U06.

## Application Settings and Connection Details

Application Settings contains **Connections**, **Application Updates**, **About ROMDex**, and **Quit ROMDex**. These are application-wide; they do not replace NPC/tile settings. Use existing dialogs where appropriate and defer runtime/updater actions to their approved implementation tasks.

Connection Details identifies native YouTrack Tasks separately from NPCDex/Workspace Saves, even though both use the same instance. Show availability, last successful synchronization, pending/blocked work and clear recovery actions for each implemented capability. Store/token administration stays inside this interface; never place credentials in the header, preview or export. Missing/not-yet-configured capabilities must say so instead of showing green.

| Situation | Save indication | Connection indication |
| --- | --- | --- |
| All applicable work up to date, Auto-Sync On | Green | Pulsing blue |
| Ordinary pending work flowing successfully | Retain healthy indication; no red flicker | Pulsing blue |
| Auto-Sync Off, no pending changes | Green | Static dark blue |
| Auto-Sync Off, pending changes | Red | Static dark blue |
| Connection interrupted, no pending changes | No invented unsaved-data warning | Flashing red |
| Connection interrupted with unsent work | Red | Flashing red |
| Transport healthy, known reconciliation conflict | Red; manual Save opens review | Pulsing blue; details identify the conflict |

Keep essential status accessible through text in Connection Details and accessible labels/tooltips, rather than a permanent header text banner. When one capability fails, healthy capabilities continue. U19 implements the combined status logic using U04's contract; U05 approves placement and visual meaning only.

## Windows and Narrow-Width Behavior

Retain a normal Windows title bar with native minimize/maximize/close controls. Do not introduce a custom draggable title bar or merge Save/settings into the OS caption buttons. Closing the window keeps the approved tray behavior; Quit ROMDex explicitly exits.

At desktop widths where the row fits, preserve the 84 px header and its reference geometry. At narrower widths, wrap control groups and allow the header height/divider to move together; do not clip controls, shrink the Save button disproportionately, or make controls overlap the title. Keep existing compact-brand/decorative-lamp breakpoints. The phone-width preview is a fallback layout, not a new mobile-platform commitment.

Visible workspace and action buttons retain keyboard access, focus indication and active state. Enter/Space activate them; ESC closes their menu/dialog before reaching Work Pane ESC behavior. Tab within menus/settings/forms retains ordinary navigation and must not trigger Details cycling or task grouping. These routing checks are part of U06–U09 integration acceptance.

The Windows tray menu follows U02: **Show ROMDex**, **Open NPCDex**, **Save Changes**, shared **Auto-Sync Data**, **Connections**, **Application Updates**, and **Quit ROMDex**. Tray-menu radio/check state follows the same shared service state; it never starts a second sync queue. The application header workspace menu is separate from this Windows system tray menu.

## Verification Completed

The initial options verified reference brand/Save geometry, asset bytes, fonts, control relocation and manual Save leaving Auto-Sync Off. The revised footer preview was separately checked at **1280, 1024, 768, 600 and 320 px** without horizontal overflow. It verifies an unlabeled accessible red button, ROMDex/NPCDex menu entries, selection dismissal, ESC dismissal/focus return, arrow navigation, outside-click dismissal and preservation of a workspace setting after switching away and back. Complete navigation/selection/draft preservation remains an explicit U08 implementation check; the prototype does not claim that full integration is implemented. No page errors, live browser/account access or external network requests occurred.

All **69 released files** still match their source and installed release hashes. No current data, token, profile, application code, private container or immutable backup changed. The interactive proposal does not perform real saves, edits, downloads, deletes or authentication.

## Added Side Task Before U06

The user requested this bounded side commit during U05. It is planned after U05 layout approval and **before U06**, under its own PASSKEY:

**S01 — Attachment Controls and Startup Scope — Sol / High**

1. Redraw the paperclip using the same light/crisp weight and scale as the Notes paper icon; preserve its position immediately to the right of Notes.
2. Add **Delete** for existing ticket attachments wherever attachment actions are presented. Identify the file/ticket in confirmation; delete that attachment in YouTrack, reconcile the list/paperclip and invalidate cached previews only after confirmed outcome. Preserve the issue and other files. Handle denied permission, offline/Auto-Sync Off, native removal and uncertain responses through the established durable queue/recovery pattern. Queued local uploads use cancellation rather than an invalid native delete. This is explicit native-attachment deletion, not automatic pruning of immutable workspace saves.
3. Select **All Tasks** on each fresh ROMDex launch, overriding a previously persisted selector scope without changing issue data, hierarchy/order, or unrelated preferences. Switching tools and reopening a still-running tray instance preserve their in-session context. Verify both browser launch and later desktop cold-start behavior at their applicable stages.

Acceptance: focused icon comparison; controlled attachment deletion/permission/uncertainty checks without deleting production files; correct paperclip/list refresh; default-scope reload checks; preserved credentials and current data. The task may require a service restart, but consolidate service edits and automated verification before asking for one.

## Approved Decision — October 15, 2026

The user approved the **Footer Workspace Menu as a development placeholder**, confirmed view preservation between workspaces in this app, and corrected the decorative circles to **red → yellow → green**. Direct Switch and Compact Menu are rejected and must not be implemented. The existing preview images/model show the earlier circle order; this explicit correction controls U06 and must be checked in its visual QA. Approval completes U05 design review only; application implementation still requires the later task PASSKEYs.

U05 is complete and checked off. Next: **S01, Sol / High**, awaiting its new PASSKEY. After S01 completion: request **U06 — Shared Theme and Approved Header, Sol / Medium** under another PASSKEY.


## U06 — Completed October 15, 2026; Header Placement Supersedes Footer

The user authorized U06 and moved the placeholder workspace switcher into the header, immediately left of the top-right controls, at 80% of their height. This supersedes all earlier footer-only instructions and illustrations; no footer space is reserved. U06 is complete in **0.4.1 + U06**: shared theme/header/assets, red → yellow → green decorative lamps, connection-light access and capability-gated settings. Verified 227 tests, 319 syntax checks, 20 focused/regression browser checks, original brand/Save geometry and 7 live-served assets. Credentials, Auto-Sync, NPCDex files, protected baseline and original ZIP remain preserved; no production YouTrack writes. [Completion report](U06-Completion-Report.md), [patch manifest](U06-Patch-Manifest.json). NPCDex is listed but disabled until U08 supplies its workspace. Next: **U07 — Relocate NPCDex Controls, Sol / Medium**, under a new PASSKEY.


## H01 — Header Correction, October 15, 2026

The user directly requested removing the application header cog, documenting its commands for later placement, and correcting the connection light. Implemented in **0.4.2 + H01**: no cog/menu or reserved space, Save/connection shifted right 36 px, actual light/ring centered by eliminating a 3.25 px text-baseline displacement. Six focused browser checks passed; changed assets were verified from the running service. Refresh only; no restart or token entry. [Report](Header-Correction-Report.md), [command inventory](Deferred-Application-Commands.md), [patch overlay](Header-Correction-Patch-Manifest.json).

This supersedes prior header-cog placement instructions. Connection Details remains on the light; no substitute home has been chosen for the other commands. **UX01 — Application Command Placement Review, Sol / Medium**, is pending before U11. U09 remains pending under a separate PASSKEY, Sol / High.
