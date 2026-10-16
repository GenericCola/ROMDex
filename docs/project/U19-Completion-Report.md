# Shared Sync Controls and Indicators

**U19 is complete. ROMDex 0.5.7 is installed and running normally.** Shared controls now report all configured providers. U20 has not begun.

Save Changes and the connection indicator now combine YouTrack Tasks, NPCDex Cloud and ROMDex Metadata. Healthy automatic delivery keeps Save green. A clean disconnected service flashes the connection lamp red without inventing an unsaved-data warning. Pending work that cannot be delivered, conflicts and local recovery problems require Save/review. Auto-Sync Off keeps the connection lamp static dark blue; a manual Save performs one cycle without enabling automatic sync.

Connection Details reports each provider separately, with pending counts, latest successful remote contact, error/review messages and the applicable review button. The old claim that NPCDex cloud sync is unavailable is removed. The connection pane remains accessible after a desktop service interruption when the task workspace is already loaded.

The temporary red workspace button is 30% smaller in diameter (19.04 px rather than 27.2 px at the standard header size) and has no drop shadow. Existing Save geometry, connection-ring geometry, vertical alignment and workspace-menu behavior are preserved.

## Verification

All 426 regression tests passed. New scenarios verify each provider's independent contribution to shared health, clean disconnects, queued failures, recovery, conflicts, unknown/local capabilities, desktop-service loss and independent manual-save results. Actual NPCDex/metadata journal engines were exercised through offline/recovery cycles. Packaged presentation tests distinguish controlled status injection from real verification-branch cloud delivery. Production verification performs no synthetic ticket or save edits.

The final package passed 6 desktop scenarios, 125 syntax checks and 248 installed application hashes. Installation preserved all 114 Data files exactly before first launch. All 299 native tickets matched YouTrack, NPCDex revision 73 and the whole save remained intact, and ordering/images/saved parent statuses were preserved. Native and both cloud providers resumed after a normal restart with no pending work. All three encrypted credentials remained unchanged; the remembered download token verified the current signed release without re-entry. Temporary diagnostic ports are closed. Source, pre-change source and verified installer are archived privately; Application Data and encrypted credentials remain excluded from Git, with the complete protected Data backup retained locally.

[Desktop evidence](U19-Desktop-Verification.json), [application manifest](U19-Application-Manifest.json), [private release](https://github.com/GenericCola/ROMDex/releases/tag/v0.5.7).

## Next Task

**U20 — Change Request Workflow and User-Story Review, Sol / Medium.** A new PASSKEY is required. Review concrete map-level packages, existing-ticket linking, explicitly approved new tickets and the information an agent needs before implementing publishing. No automatic ticket-creation or grouping policy is assumed.
