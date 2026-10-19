# RD08 — Windows RDX File Integration Complete

**Completed October 19, 2026. Source and isolated Windows acceptance are complete. Installed production remains 0.5.14.**

Windows file opens now reach the existing single-instance ROMDex host. Validated internal document type selects the NPCDex map or ROMDex task-plan preview. Busy editors retain their contents and scope; incoming requests wait, and Later/ESC pauses them. The original input remains unchanged. Import approval, destination mapping and cloud publication keep their existing review steps. Agent-return files remain gated by task reconciliation and human testing.

The per-user installer registers ROMDex's own handler, Open With entry and capabilities. Existing defaults, Windows UserChoice and other handlers survive installation, upgrade and uninstall. Windows may require a one-time selection of ROMDex as the default app for `.rdx`. Owned paths refresh on upgrade, while the Data folder survives uninstall. [File behavior and implementation guide](../../apps/romdex/rdx/WINDOWS-FILES.md).

The `.rdx` icon uses the exact original Pokéball SVG, rendered from its 16-pixel grid into 16/24/32/48/64/128/256-pixel ICO entries. The application, tray and installer use the new pixel-art Pokédex, matching the suite's stepped edges and palette. Original application PNG, ICO and SVG bytes are preserved and checked against the preceding Git revision. [New icon](../../apps/romdex/desktop/app.png), [originals and reversion](../../apps/romdex/desktop/icons-original/README.md).

## Validation

- **38 focused checks:** map/plan transfer and preview, original-file preservation, invalid/legacy/returned-file rejection, expiry/recovery, registration boundaries, profile preservation, lifecycle and desktop policy.
- **Five targeted UI checks:** actual map/plan previews; preserved editor draft/modal; a scrollable 16-file list above the footer at 620-pixel window height; Later without a reopen loop; no renderer errors or external requests.
- **Seven packaged Windows app checks:** cold and running-instance file opens, original window/service reuse, deferred editor handling, agent-return rejection and normal quit.
- **Actual registered MSI launcher:** observed the versioned app after bootstrap handoff; verified the spaced/Unicode file reached its NPCDex preview, created no document/binding and quit normally.
- **Six installer acceptance checks:** normal WiX/Windows Installer validation, owned registration only, exact Pokéball ICO bytes, installed/runtime parity, upgrade preservation and uninstall retention of Data plus a subsequently added unrelated handler.
- Ten changed JavaScript syntax checks and final source/mirror/diff review.

The first automation-context error and the MSI-bootstrap attachment timeout were harness issues. The existing helper continued the checks; direct observation proved the real launcher handoff, and installation was not repeated. [Detailed evidence](RD08-Verification.json).

The disposable installer identities and 0.5.15/0.5.16 version labels were used solely for verification. Production maps, queues, three remembered connections, installed icon and live ROMDex remain unchanged. Production publication/installation and adoption of existing maps remain outside this source checkpoint; RD10 retains its fresh backup and acceptance gate. Pending requests are session-local, limited to 16 local files; reopen the original file after an app exit. Future add-on types and returned-result reconciliation retain their later roadmap gates.

**Next:** RD09 — Agent Authoring and Portable Workflow Guide, **Sol / Medium**, after a new PASSKEY.
