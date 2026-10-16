# Standard Settings Icon

The small stepped gear approved for ROMDex is the tool suite's **Standard Settings Icon**. The canonical artwork is [standard-settings-icon.svg](standard-settings-icon.svg). Copy that file unchanged into each tool's public assets rather than recreating it with a font glyph.

Display the 16 × 16 SVG at 12 × 12 CSS pixels, centered in an 18 × 18 circular button. ROMDex's current button uses a 1 px `#718773` border, a `#101d1de6` background, no padding, and a screen-reader label of “Settings for [item name].” Keep the artwork centered with grid placement; do not add optical offsets or translate the SVG. The icon image is decorative (`alt=""`); the button supplies the accessible name.

ROMDex stores an identical app copy at `public/standard-settings-icon.svg`. Its selector settings button establishes the initial usage. Adoption elsewhere in the suite is a separate future change.

## Shared Header and Theme

# ROMDex Shared UI

Load the tool stylesheet before shared-ui/theme.css; mount header.mjs in .device-header. The shared assets supply the palette, brand, lamps, header controls, indicators, tray frames and standard button/icon geometry.

The red workspace button is 27.2 px, centered before the 34 px Auto-Sync and Save controls. No footer is allocated. Decorative title lamps are red → yellow → green. U08's shell hosts the retained ROMDex and NPCDex views.

mountHeader accepts onWorkspace, onError, active and npcdexAvailable. The workspace callback must finish successfully before the title changes. The host owns Save, Auto-Sync and connection-light actions through stable IDs. Destroy the header before replacing it. Menus support ESC, outside dismissal, Tab and arrow navigation.

The application settings cog/menu was removed after U08. Its former Connections, Application Updates, About ROMDex and Quit ROMDex commands are documented in outputs/Deferred-Application-Commands.md; replacement placement requires a future scope review. Connection Details remains accessible from the light.

The connection-status container uses grid centering, zero line height and a block light, avoiding inherited text-baseline displacement. The outer bordered circle is 11 px; its centered interior is 7 px. No positional nudges are used.

The exact Standard Settings Icon remains 12 px inside its 18 px circular frame for other established settings controls. Favicon bytes remain the original NPCDex artwork. Public/package/canonical shared asset copies must match byte for byte.
