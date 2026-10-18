# Local Cleanup — Verified Backup, Collected for Manual Deletion

## Current Handoff

**Update:** The user deleted the collected folder. The October 18 restart check found 16,791,093,248 bytes free, and replacement packaging resumed successfully. Live saves and required retained paths remain in place.

At the user's request, all 69 reviewed build folders were moved (not copied) into:

`C:\Users\mrgen\Documents\Codex\2026-10-13\can\DELETE-ME-ROMDEX-OLD-BUILDS-2026-10-18`

The original relative paths are preserved inside that one folder. All source paths are absent and all destination paths are present. The collection contains 15,864,931,080 bytes (14.78 GiB), plus its explanatory readme. The current source, repository, required build/runtime tools, retained 0.5.12 build, released installer and protected recovery backup remain in place. The move receipt is `work/u20i-timeout/local-move-result.json`.

No deletion was performed. The user can Shift+Delete this entire clearly identified folder to free space immediately, avoiding retention in the Recycle Bin. Packaging cannot resume until that deletion frees disk space.

## Backup and Earlier Deletion Restriction

The user explicitly authorized backing up needed development data to GitHub and deleting redundant local output on October 18, 2026.

The private repository backup is verified at commit `c60cbf9e6438206c109189e839cc1393e7db9a57`: https://github.com/GenericCola/ROMDex/commit/c60cbf9e6438206c109189e839cc1393e7db9a57

- 5,391 generated-build source entries are checksum-indexed in `archive/generated-build-sources/index.json`; only 6,721,256 bytes of unique source needed adding.
- Every referenced source matches its exact committed Git blob. The private repository identity, pushed main head and authenticated remote commit readback were verified.
- 69 obsolete generated build folders were reviewed, totalling 15,864,931,080 bytes (14.78 GiB). The precise list is `work/u20i-timeout/local-cleanup-plan.json`.
- Current source, repository, required runtime/build tools, the 0.5.12 package needed for rebuilding, released installer folders, live Data, all protected recovery copies, credentials and signing keys are excluded from deletion.

**No deletion occurred.** Both the validated batch command and a single literal failed-build folder removal were rejected before process creation with: `approval required by policy, but AskForApproval::Granular.sandbox_approval is false`. This persisted after the user's explicit deletion authorization and the earlier folder-write permission grant. The agent did not reroute deletion through another executor to evade that restriction.

Deletion must wait until the execution policy permits approved removal commands. U20I's source correction passes 87 focused checks; replacement packaging and installation remain blocked by disk space. The currently installed app and its pending sync queue were not altered by cleanup attempts.
