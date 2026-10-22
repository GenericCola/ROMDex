# MX04 — Shared MAPDex and NPCDex Workflow Layout

**Complete in source, October 21, 2026.** The Phase 11C PASSKEY also authorizes LP02 and LP03 next, in order. Installed 0.5.26 and production saves, credentials, queue and sync pause are unchanged.

MAPDex now uses the suite's stacked layout: maps on the left, locations/characters/elements in Tray 2, contextual source dialogue and identity/image tools in Tray 3, and map-specific conditions below. Map setup is reached from the map tile's hover/focus cog. Prepare, Assign and Update remain early map actions; Export RDX and Send to NPCDex have equal-sized controls. Source locators and exact dialogue stay visible. Search and location filtering act on the selected prepared map.

NPCDex character tools open inline alongside the conversation. Documentation correction and existing character linking reuse the established database commands and review rules. Closing returns focus; Escape closes once. New detach/reassign commands remain MX05 scope. The original planning controls, note/flag scope, testing rules and Add Character placement are preserved.

33 focused adjacent checks pass for classic flags/notes, character links, presentation, form Tab and lifecycle editor guards. Real-ROM-derived isolated Chrome checks pass for both workspaces: selected item and saved name, source dialogue, map-specific conditions, inline tools, map setup, Escape and a 620-pixel window. A short-window visual review found conversation overflow; tools now share the detail row beside the conversation, with independent scrolling. No browser script errors were recorded. The test-only preview injected its editing scripts with CSP bypass; production CSP is unchanged. Final native packaged review belongs to LP03.

These are source and isolated-browser results, not a production installation or a new live YouTrack proof. LP02 adds actual portable location images next. The full Phase 11C stop remains before MX05.
