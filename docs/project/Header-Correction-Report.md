# Header Correction — H01

Completed October 15, 2026 at the user's direct request, before U09.

Removed the application-wide header cog and menu completely, including its occupied width and gap. Save and the connection indicator move **36 px right**; the brand, header height and Save dimensions are unchanged. No replacement menu was introduced.

The previous menu contained Connections, Application Updates, About ROMDex and Quit ROMDex. Their exact former behavior, implementation status and deferred placement review are recorded in [Deferred Application Commands](Deferred-Application-Commands.md). Connection Details remains accessible through the light. About's source is retained without an exposed menu entry; Updates and Quit were already disabled placeholders.

The vertical error came from inline text-baseline layout **inside** the correctly centered connection container. Before correction, Save's center was 40.5 px and the light's was 43.75 px at the reference size. The light was **3.25 px low**. Its container now uses grid centering and zero line height; the light is block-level. The 11 px ring and 7 px interior share Save's center. No optical offsets or animation/color changes were added.

All **6 focused browser checks** passed: removal and exact freed width, actual ring/lens geometry, retained connection access, both workspace titles, five viewport widths and 100/125/150/200% CSS zoom. No browser script errors. [Verification](Header-Correction-Verification.json), [visual review](Header-Correction-QA.png).

Installed the 6-file frontend/documentation patch into **outputs/ROMDex-v0.4.2/ROMDex**. The running service served both changed public assets with matching hashes. **Refresh ROMDex; no service restart or token entry is needed.** Service identity, remembered credential ciphertext and Auto-Sync setting are unchanged. No production YouTrack writes were performed.

Current build: **0.4.2 + H01**. The original 0.4.2 ZIP/manifest remain unchanged; pre-correction files are protected in **Header-Correction-Before**. [Patch manifest](Header-Correction-Patch-Manifest.json) records the overlay to apply when preparing the next baseline. Source/public/canonical header and theme copies match.

**UX01 — Application Command Placement Review** is pending before U11, with no new home predetermined. **U09 — Shared Save and Auto-Sync Coordination, Sol / High**, remains the next planned task and still requires a new PASSKEY.
