# Deferred Application Commands — Header Cog Removed

Recorded October 15, 2026 at the user's request. The application-wide header cog and its entire menu have been removed. Its occupied width and adjacent gap are removed as well. A replacement home will be scoped in a future task; none is selected by this correction.

| Former entry | Behavior before removal | Current disposition |
| --- | --- | --- |
| Connections | Opened the existing YouTrack connection dialog in the ROMDex workspace, retaining NPCDex context. | The connection indicator still opens that dialog. Any broader connections/settings surface needs later scoping. |
| Application Updates | Disabled placeholder. No updater, download or installer action was implemented. | Retain the approved notify-and-ask requirement; placement will be reviewed alongside the later desktop/update work. |
| About ROMDex | Opened a dialog identifying ROMDex 0.4.2 and explaining that NPCDex still uses manual local saves. | Existing dialog/callback source is retained for reuse, with no current menu entry. Its future access point is undecided. |
| Quit ROMDex | Disabled placeholder for the future desktop application. It did not stop the browser prototype or local service. | Desktop quit behavior remains a later task. Placement is undecided; the existing Stop-ROMDex launcher remains available. |

The Standard Settings Icon artwork remains available to established tile/Inventory settings controls. This change removes the application-level menu rather than inventing another collection of commands elsewhere.

## Pending Scope Review

The original deferral is resolved by the user-approved [UX01 placement](UX01-Application-Command-Placement-Proposal.md), October 15, 2026. The header stays unchanged; Connection Details remains accessible on its light. Application commands are grouped in the Windows tray menu, implemented under U11's separate PASSKEY. Update checks are added only under U13B. About must reflect the installed build and actual save capabilities. No global header cog is reintroduced. U11 is now the next task; U09 is already complete.


## U11 Delivery — October 15, 2026

The UX01 tray placement is implemented in 0.5.0-preview.11: Connection Details, About ROMDex and Quit now have their approved tray entries. Connection Details also remains on the header light. Check for Updates remains omitted until U13B. No global header cog was restored. [U11 report](U11-Completion-Report.md).
