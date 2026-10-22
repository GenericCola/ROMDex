# Phase 11C — Suite Layout and Automatic Location Images

**Complete in source and an isolated packaged desktop candidate, October 21, 2026.** LP01 → MX04 → LP02 → LP03 are checked off. Installed ROMDex **0.5.26 remains unchanged**. The final production installer and upgrade belong to U30. Stop before MX05 until separately authorized.

## Delivered behavior

MAPDex has a map selector, an entity browser, contextual dialogue/location details and a map-specific Condition Inspector. Map setup stays in the map cog; Prepare, Assign and Update remain contextual. Export RDX and Send to NPCDex have equal placement. Identity/image tools stay beside the selected source text. Existing NPCDex status controls, notes/flags, Add Character placement and shared header geometry are preserved.

Preparing a supported map now generates recognizable location images from the ROM's own terrain, building and texture resources. Violet City outdoors, the mart and three distinct Sprout Tower floors were exercised. Parent/group tiles and exact-floor views carry their own images. Verified source markers open the associated entity/dialogue; ambiguous coordinates remain warnings. Camera/crop choices and owner PNG overrides are portable and survive re-preparation/source-update checks.

Image bytes, source hashes, dependencies, renderer settings and record associations travel in the one-map RDX and its backend artifacts. Another profile can display them without the source ROM. Verified caches avoid rebuilding unchanged images.

## LP03 evidence

- **12 native candidate checks passed**, including portable floor images without a ROM, hover cogs inside tiles, inline tools, form Tab, one Escape, short windows, explicit NPCDex handoff with sync paused, nested-floor navigation, marker-to-dialogue links, RDX export and normal quit.
- The packaged reader and bundled pinned decoder prepared a fresh mart directly from the supplied ROM, with a visible progress bar and verified render dependencies.
- A warm prepared-map status request took **114 ms**. This is a local status measurement, not a WAN-sync or universal startup benchmark.
- A fresh process using the exact packaged modules opened the native export without a ROM: **seven location targets**, including the nested group, retained their images. Splitting and reconstructing its **533 backend objects** preserved the exact document and every blob. This used an isolated in-memory object store; it is not a new live YouTrack proof.
- **1,274 packaged files** passed the manifest audit; **1,202 application files** match the source and repository mirror. Only candidate version/description metadata differs. The candidate is `0.5.26-11c.1` and contains no ROM, live Data or credentials.

Two harness corrections were necessary: removing an unsupported Playwright frame API and hovering before clicking a hover-only cog. Completed native handoff/export/quit checks were retained when resuming the remaining renderer check. LP03 changed no behavioral product code. Final line-ending and documentation whitespace normalization aligned source, candidate and repository text; the complete file audit passed afterward. The helper and both isolated candidate profiles exited normally.

Machine-readable evidence: [LP03 verification](LP03-Verification.json). Earlier focused/data proofs remain in [LP01](LP01-Completion-Report.md), [MX04](MX04-Completion-Report.md) and [LP02](LP02-Completion-Report.md). Private native screenshots, test RDX and render intermediates remain in local `work/lp03`; ROM-derived assets are excluded from the development repository and releases.

## Limits and next boundary

This is a static preview, not game emulation: actors, animation, time of day and live game flags are not simulated. Unsupported geometry/resource bindings and uncertain heights are reported rather than guessed. Current proof covers the supplied supported HGSS layout; arbitrary Pokémon ROM compatibility is not claimed. Fixed cameras and saved crops are delivered; interactive 3D/pan/zoom is not part of the approved 11C acceptance checklist.

Production saves, remembered connections, queues, NPCDex cloud pause and YouTrack records were not modified. No production installer was run. Actual two-build acceptance remains pending another supported ROM build. Broader backend editing/identity organization, sync performance and the real coding-agent return loop remain MX05–MX09 and RI03C.

**Next: MX05 — Character and Published Map Organization**, requiring a separate PASSKEY.
