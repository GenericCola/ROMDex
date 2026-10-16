# U02 — Desktop Host and Distribution Design

**Completed and user-approved:** October 14, 2026.  
**Authorization:** U02 PASSKEY, followed by the user's explicit approval of the concrete architecture proposal.

## Result

The application is **ROMDex**; NPCDex is a built-in add-on to its workflow. The user approved **Electron + Electron Forge/Squirrel.Windows**, with an application-owned background save/sync service, scoped tool views and separate persistent storage. The active-tool header naming remains as previously agreed.

[Approved Design](U02-Desktop-Host-and-Distribution-Design.md)

The user selected **Notify Me and Ask Before Updating**: release checks inform the user, and Update Now authorizes download/installation after preserving local work. Data Auto-Sync remains independent. Private test installers are **unsigned**; publisher signing will be reconsidered before wider distribution. No paid service, publishing or account setup is authorized.

## Deliverables and Plan Changes

- Compared Electron, Tauri with a Node sidecar and a native WebView2 host against the actual JavaScript/Node applications.
- Defined tray/single-instance/quit/resume behavior, background coordination, tool switching, native file access, protocol/bridge boundaries and credential migration requirements.
- Identified two concrete migration concerns: renderer timers currently drive ROMDex sync, and Chrome-only queued attachment bytes/directory permissions do not automatically transfer into Electron.
- Defined a durable profile outside the installation directory, byte-preserving attachment migration, and explicit compatibility handling for the existing .NET DPAPI ciphertext.
- Added trusted release-index/installer hosting, privacy and bandwidth to **U03**, assessed separately from dataset storage.
- Split **U13** into **U13A — Installer and Upgrade/Uninstall Preservation (Sol / Medium)** and **U13B — Approved Update Notifications and Installation (Sol / High)**, each requiring its own PASSKEY.
- Updated the scope, Action Plan, decision log and checklist to reflect approved branding, current 0.4/revision-72 baselines and the new distribution decisions.

## Verification and Boundaries

Read the current official Electron, Forge, Tauri and Microsoft documentation linked at the relevant claims in the design. Inspected the actual renderer scheduling/storage, Node service/profile/credential code, launcher and NPCDex saving paths. Compared the unchanged release files against the 0.4 manifest and checked local planning links/status consistency.

This task changed planning documents only. No application code, runtime dependency, token, profile, working save, native YouTrack item or immutable backup was changed. No browser session or application test rerun was needed. The previous 207-test release result remains the R08 baseline; no installer, desktop resource benchmark or future lifecycle behavior is claimed tested yet.

The exact tested Electron dependency version, storage transaction schema, cloud provider, release host/key operational details and shared-header geometry remain their assigned later-task deliverables. No third-party plugin loader is included.

## Next Approval Boundary

**U03 — Free Cloud Provider Comparison**, recommended **Sol / High**. Compare current free-service limits against the actual NPCDex/ROMDex datasets, images, receipt flow and app-release distribution needs. Await a new PASSKEY. U03 research/provisioning has not started.
