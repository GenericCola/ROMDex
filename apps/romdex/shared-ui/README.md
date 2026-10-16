# ROMDex Shared UI

Load the tool stylesheet before shared-ui/theme.css; mount header.mjs in .device-header. The shared assets supply the palette, brand, lamps, header controls, indicators, tray frames and standard button/icon geometry.

The red workspace button is 27.2 px, centered before the 34 px Auto-Sync and Save controls. No footer is allocated. Decorative title lamps are red → yellow → green. U08's shell hosts the retained ROMDex and NPCDex views.

mountHeader accepts onWorkspace, onError, active and npcdexAvailable. The workspace callback must finish successfully before the title changes. The host owns Save, Auto-Sync and connection-light actions through stable IDs. Destroy the header before replacing it. Menus support ESC, outside dismissal, Tab and arrow navigation.

The application settings cog/menu was removed after U08. Its former Connections, Application Updates, About ROMDex and Quit ROMDex commands are documented in outputs/Deferred-Application-Commands.md; replacement placement requires a future scope review. Connection Details remains accessible from the light.

The connection-status container uses grid centering, zero line height and a block light, avoiding inherited text-baseline displacement. The outer bordered circle is 11 px; its centered interior is 7 px. No positional nudges are used.

The exact Standard Settings Icon remains 12 px inside its 18 px circular frame for other established settings controls. Favicon bytes remain the original NPCDex artwork. Public/package/canonical shared asset copies must match byte for byte.
