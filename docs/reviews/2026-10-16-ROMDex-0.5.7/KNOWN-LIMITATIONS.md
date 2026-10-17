# Known Limitations and Review Boundaries

## Current Release

- Private Windows x64 test distribution. No macOS/Linux installer has been accepted. The MSI is unsigned for Windows publisher identification; signed application release metadata does not remove that Windows warning.
- The current deployment is configured around the existing PMON workflow and private owner-controlled cloud setup. Multi-user access, broader sharing and arbitrary-workspace onboarding have not been accepted as finished features.
- This ZIP carries no current working saves or credentials. A fresh installation does not automatically reproduce the owner's latest NPCDex/cloud state. Access to YouTrack, private save storage and private updates requires separately authorized account setup; do not share the owner's existing tokens.
- Offline edits are durable, but remote synchronization needs connectivity. Closing to tray allows background work; full Quit stops it. Text never accepted by an editor can still need re-entry after a renderer crash.
- Conflicts are eventually discovered against observed revisions. This is not a global editing lock or atomic transaction across clients, tickets and the ROM. NPCDex overlapping edits currently use complete-version review; automatic character-by-character text merging is absent.
- Manual order is ROMDex organization metadata; it does not rewrite YouTrack's personal/contextual custom-order controls. Same-parent restriction applies to the initial bulk grouping/move selection behavior.
- Native YouTrack Show-stopper displays at ROMDex's highest priority (Urgent); editing that tag maps to Critical. Calculated/native read-only fields remain read-only.
- A native parent State equal to its calculated inherited State cannot reliably identify a separate retained assignment; ROMDex preserves the known saved value. See the metadata guide for details.
- Inline attachment preview is for raster formats. The existing native attachment staging/viewing limit is 50 MB per file; actual YouTrack permissions/configured upload limits may be lower. Unknown server capacity has not been certified by that client-side limit.
- Current cloud discovery/automatic merges are deliberately bounded: 5,000 immutable records; NPCDex automatic review up to 64 heads/256 concurrent operations; metadata document 16 MiB and raster data URL 2 MiB, with 512 KiB transport chunks. Unsupported/ambiguous histories retain data for review. No destructive automatic remote-history cleanup is enabled.
- Credentials are Windows-account protected. Upgrade preservation does not mean they can be moved to another Windows account/computer or remain usable after revocation/expiry. The entire retained Data folder, including Runtime encryption state, matters for same-account recovery.

## Content Architecture Work in Progress

- NPCDex is already cloud-backed in private GitHub. The proposed YouTrack content registry is a change of content model/provider, not the first introduction of persistence.
- U20 architecture and U20A contracts are approved. U20B fresh checks found that GenericCola cannot create the content project (HTTP 403); the owner is arranging it. The private grants, actual storage/transfer limits, cross-project access and live concurrent attachment protocol still need proof.
- No current NPCDex save has been migrated into the proposed content project. The installed application remains 0.5.7 and retains its existing provider.
- Map-package attachment/new-task workflow, normal automatic agent backend-result reconciliation and agent notifications are not implemented by 0.5.7. Legacy manual receipt tools are distinct.
- The contract examples use fictional IDs, assets and ROM hashes. Their model checks establish design behavior, not an actual ROM extraction, real server guarantee, hardened parser or full legacy projection.
- An agent's implementation report does not prove in-game testing. NPCDex data undo is not automatic ROM reversal. The user must verify results before completing the actionable task.
- U20C1 was proposed as independent work while owner setup was unavailable; it was not started. The user has since indicated that owner setup is underway.

## Historical Documentation

The archive deliberately retains older browser/local-only instructions, obsolete next-task labels and local artifact paths as development history. Read [current features](FEATURES.md), [status](PROJECT-STATUS.md) and this file first. Historical local backups, live saves, raw credentials, dependency caches and private signing material are intentionally outside this review package. Missing historical artifact links are listed in DOCUMENT-LINK-AUDIT.json.
