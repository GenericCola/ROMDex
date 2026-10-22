# Character organization, backend mapping and routine synchronization

This guide describes the Phase 11D source candidate. Installed 0.5.26 is unchanged until the later reviewed release.

## Character and map organization

Open an entity's standard hover cog. Character identity tools stay inline beside its source dialogue. Inspect placements, reassign one placement to an existing shared character, detach it, or review a shared-profile name across affected local maps. Same sprites do not establish identity. Placement dialogue, conditions, images, notes, proposals and ROM mappings remain attached to that placement.

Use the map cog → Assign to Parent to review independently prepared or published maps. The preview identifies MAPDex/NPCDex files and affected records. Committing preserves original IDs and all descendants. The child becomes a nested zone, its old file remains recovery history, and publication changes the existing YouTrack links. Resolve pending delivery/review before organizing. An interrupted cross-store migration holds further edits until its checkpoint resumes.

Older adopted catalogs continue through their original sync owner. These new actions do not bypass that journal. Gender-specific identity overrides and unsafe cross-map native moves remain explicit review boundaries.

## YouTrack Mapping

NPCDex Tray 2 cog → YouTrack Mapping displays the physical Region → Map → nested Location → Placement/Interactive Element/Scene tree. Shared Character Profiles and definitions are references; system registries are separate. Expand an item to inspect its stable ID, revision, parent, profile and backend link. The verification label applies to the recorded revision/check time, never to an uncommitted edit. No global issue-type changes are required.

Supported nonconflicting title changes from YouTrack update automatically. Shared-profile changes, overlapping local names, documentation content and membership changes require review. Comments are discussion and never executable map content.

For supported documentation corrections, download the selected record's template from Mapping. Keep its dataset, record and baseline IDs; enter a reason and edit only the name and mapped passage text. Omit unchanged passages if necessary to keep the JSON within 128 KiB. Attach it to the exact private NPCD record as `npcdex-correction.json`. For a parent correction, also set the native parent link to the intended compatible location inside the same map. Save/Sync discovers the file and presents the exact correction. It changes documentation, not the ROM, task completion or human-testing status.

Stale baselines, mismatched record markers, unknown fields, conflicting names, foreign ownership, invalid nesting and unsupported cross-map parent moves remain blocked. Restore the native link/marker or supply a fresh supported correction. Valid agent-return RDX files still use the task-bound authorization/reconciliation workflow.

## Saves, progress and storage

Local checkpoints and navigation use their own queue. Network publication retains a frozen revision and resumes the same verified operations. A newer local edit stays pending; it is not discarded when an older upload completes. Closing a remote review cancels its reads. Quit aborts remote work before closing the local journal. Auto-Sync and the explicit NPCDex pause remain separate controls.

Progress distinguishes queued, paused, checking, delivering, review and verified states. Last advancement records durable delivery progress; it is separate from the last successful remote check. Unchanged checks write nothing. Network speed is not a local-save latency guarantee.

Content Tools → Storage Usage inspects working files, journal/database, previous/recovery files and retained versions under the managed RDX budget (2 GiB by default). History, package pins, queued work, backups and credentials are protected. There is no automatic history pruning. Generated location/decoder caches have a separate 512 MiB budget and a 384 MiB target; idle workers remove only complete, hash-verified renderer products. Unknown or interrupted entries stay available for review. Cached image bytes used by maps are embedded in their RDXs.

Large supported legacy files retain original bytes while upgrading. Exact sealed record bodies may be referenced through the existing RDX history-artifact mechanism, including current heads. This avoids repeatedly expanding copies into the outer JSON. Parser limits, record identities and per-record backend ownership are unchanged.
