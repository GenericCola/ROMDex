# ROMDex Shared UI — U06

Load the tool stylesheet first, then `shared-ui/theme.css`. Mount `header.mjs` in one `.device-header` element. Keep the containing shell's existing desktop inset and 84 px header allocation. The module owns that element; tool controllers retain their existing Save, Auto-Sync, and connection-state handlers through the stable element IDs.

The shared stylesheet contains palette tokens, brand, lamps, header controls, dynamic indicators, tray frames, and standard button/icon geometry. Tool row layouts and behavior remain in the tool stylesheet. Apply `.suite-tray` to Work/Details frames and `.suite-selector-tray` to the selector frame without moving their structural layout rules.

The static red workspace button is 27.2 px, 80% of the 34 px header controls, centered immediately before Auto-Sync. There is no footer allocation. Decorative title lamps are red → yellow → green. The workspace button does not convey sync status.

`mountHeader(root, options)` accepts `onConnection`, `onAbout`, `onWorkspace`, `onError`, `active`, `npcdexAvailable`, `onUpdates`, and `onQuit`. An asynchronous workspace callback must finish successfully before the title changes. The host must preserve workspace state and supply the actual views; the header does not reload a page or manufacture workspace data. Call `destroy()` before replacing a mounted header. `setWorkspace()` updates its visual selection only.

U06's live ROMDex adapter exposes ROMDex and a disabled NPCDex entry. U08 supplies the real NPCDex workspace and retained context. U07 relocates NPCDex controls. Updates and Quit remain disabled until their desktop capabilities exist. Connection Details and About work now. Save/Auto-Sync retain the current native YouTrack behavior; this patch does not claim NPCDex cloud synchronization.

Menus close on selection, outside click, Tab, or ESC. ESC restores trigger focus and stops the event before Work Pane shortcuts. Arrow keys, Home, and End navigate enabled menu items. Visible control names use Title Case; icon-only controls have accessible labels.

Use the SVG assets unchanged: the favicon is decoded from the actual NPCDex 2.42 template; the gear is the approved Standard Settings Icon. Render the gear at 12 × 12 px inside an 18 × 18 px circular frame without optical offsets. Dynamic connection geometry stays 11 px outside / 7 px inside.

The canonical suite copy is `outputs/Tool-Suite-UI`; this package's `shared-ui` files and `public/shared-ui` assets match it byte for byte. U06 verified the header against original NPCDex styles without loading private data or editing the Downloads package.
