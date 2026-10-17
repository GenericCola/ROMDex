# Project Status and Owner Review

Snapshot: October 16, 2026. Installed release: **ROMDex 0.5.7**.

| Area | Status |
| --- | --- |
| Combined ROMDex/NPCDex desktop, installer, tray, native fields/files | Implemented and verified. |
| Private NPCDex saves, conflict review, ROMDex metadata and shared controls | Implemented through U19. |
| Latest release QA | 426 regression tests, six packaged scenarios, 125 syntax checks and 248 installed application hashes, as recorded by U19. Packaging this ZIP does not rerun those historical app checks. |
| Content architecture/workflow | U20 approved. |
| Versioned content/mapping contracts | U20A approved; 45 model/compatibility checks passed. |
| Separate content-project access/storage proof | U20B incomplete. Owner setup is now being arranged after Create Project returned 403 to GenericCola. Local transport assumptions passed 16 model checks; live transport remains unverified. |
| Dynamic content reader/planning/migration | Future U20C–U20F tasks. An alternative U20C1 schedule was proposed but not started. |
| Map packages and direct backend result workflow | Future U21–U27 tasks; NPCDex stages only, user handoff stays separate. |
| Full integrated acceptance/release | U28–U30. |
| Agent contact notifications | U31–U33 after the principal release. |

## Requested YouTrack Project

- **Instance:** the existing thegobindsingh.youtrack.cloud.
- **Project Name:** NPCDex Content.
- **Project ID:** NPCD.
- **Project Owner:** GenericCola.
- **Access:** owner and trusted instance administrators; no broad Registered Users/All Users issue grants. Leave it empty for the isolated proof.

No new accounts, global permissions, paid features, billing changes or data import are required for that prerequisite. Once it exists, U20B first verifies actual IDs/grants and runs marked synthetic records/assets. No real save migration or active provider switch follows project creation alone.

## Proposed Content Model

Epic: macro-region → Saga: map/zone → Story: sub-zone/building → Verse: local NPC/entity/scene. Shared character profiles are separate from their local appearances; shared/global dialogue is referenced rather than duplicated. NPCDex keeps its familiar interface and shows current content with proposals appended.

Package Map Changes stages one fixed JSON document for explicit attachment to an existing or newly created PMON task. It never dispatches agent execution. The separately handed-off agent changes the ROM and appends versioned backend updates. Valid independent results can appear separately; dependent scene changes update together. Newer drafts remain pending and human verification controls task completion.

## Suggested Review Questions

1. Does the separate project and proposed region/map/sub-zone/entity hierarchy fit the instance's intended use?
2. What upload/storage limits and available space can the instance owner confirm without changing them?
3. What permissions can safely support owner editing and a later attributable execution identity? No new agent account/grants are requested by this review package.
4. Do the extraction/mapping guide and fixed-package/backend-update examples give an agent enough information to find the exact ROM targets?

The complete approved design, contracts, development reports and current task checklist are in the documentation index. This archive is for review; receiving it does not dispatch any development work.
