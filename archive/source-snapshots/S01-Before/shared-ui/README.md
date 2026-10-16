# Standard Settings Icon

The small stepped gear approved for ROMDex is the tool suite's **Standard Settings Icon**. The canonical artwork is [standard-settings-icon.svg](standard-settings-icon.svg). Copy that file unchanged into each tool's public assets rather than recreating it with a font glyph.

Display the 16 × 16 SVG at 12 × 12 CSS pixels, centered in an 18 × 18 circular button. ROMDex's current button uses a 1 px `#718773` border, a `#101d1de6` background, no padding, and a screen-reader label of “Settings for [item name].” Keep the artwork centered with grid placement; do not add optical offsets or translate the SVG. The icon image is decorative (`alt=""`); the button supplies the accessible name.

ROMDex stores an identical app copy at `public/standard-settings-icon.svg`. Its selector settings button establishes the initial usage. Adoption elsewhere in the suite is a separate future change.
