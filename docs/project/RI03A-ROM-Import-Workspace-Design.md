# RI03A — ROM Import Workspace Design

Status: **Complete — the user approved the consolidated RI03A design on October 20, 2026.** This document proposes the user experience; it does not authorize RI03B implementation, production replacement, installation or sync resumption.

## Purpose

Open a ROM, choose a logical map, prepare its own locally saved staging RDX, and edit/review it before exporting a portable copy or explicitly sending it to NPCDex. The app performs extraction and compilation locally without AI, an editable source project or another agent's prepared JSON.

The first concrete proof is the supplied ROM and Violet City. Its eight physical areas belong to one map RDX; Sprout Tower is separate. A ROM catalog entry is not a claim that the extractor supports that map. Broader-map and changed-build acceptance remain RI03C.

## Established requirements

- Add ROM Import to the existing workspace chooser. Preserve the shared header and the other workspaces' current selection/view when switching. No new header cog or footer is proposed.
- Read the original ROM without modifying it or copying it unnecessarily. Keep ROM payloads and extracted private game content outside source backups and release assets.
- Keep one logical map per RDX. Interior areas may be sub-zones; map grouping must be visible and based on ROM evidence.
- Preserve stable identities, source mappings, original text/images, local planning, flags, notes and human-testing history. Offsets and matching names alone never authorize rebinding existing content.
- Each map has its own timeline, stable stage identities and Roman-numeral labels. Retain unknown/initial states and independent conditions without inventing a universal chronology.
- Distinguish extraction from local import, portable export, cloud publication, agent authorization and in-game testing. A successful extraction does not imply any of the latter actions.
- Retain the familiar NPCDex editing interface. ROM Import is a separate workspace rather than a replacement for flags, notes or changes controls.
- Use the application's managed RDX/identity storage. A first-time user supplies only the ROM; technical identity manifests should not be a routine user responsibility.
- Broken structure or unusable source mapping must block the affected output. Uncertain names, palettes and runtime meaning must remain visible, never silently guessed.
- Keep production data, its existing queue, remembered credentials and the explicit NPCDex cloud pause unchanged throughout this design task.

## Approved decisions

1. **Layout. Accepted October 20.** Load a ROM and list its maps/zones in Tray 1. Selecting a map opens its import setup across Trays 2 and 3, matching ROMDex. This is an import-preparation workspace; it does not require browsing every NPC before beginning setup. Approved division: configuration in Tray 2, resulting content/conditions/images and warnings in Tray 3. The user approved this division in the consolidated design review.
2. **Map grouping. Accepted October 20.** Suggest logical map/zone groups from ROM evidence and allow the user to adjust included areas before importing or exporting. Show the resulting hierarchy in the preview. Violet City and its interiors are the demonstrated default; Sprout Tower has a separate map identity. Every output remains one logical map/zone RDX. Adjusting membership must preserve source identities, describe partial coverage accurately and never silently archive excluded existing content. Cross-map reassignment must show any existing ownership/parent conflicts before commitment. The selected-map setup is the initial flow; batch scope remains unapproved.
3. **Review and enrichment. Accepted October 20.** Allow importing unresolved names or timeline meanings with neutral labels and visible review warnings; users need not resolve every semantic uncertainty before import. Broken data and unusable source mappings still block the affected output. Offer optional cleanup before import: clearer NPC/building display names, map-stage labels/order and a clearer sprite thumbnail. Retain the same correction route later in NPCDex. These are documented display/organizational corrections, not changes to the original ROM dialogue, scripts, images or source evidence. Keep original conditions and stable stage identities when editing labels/order. Proposed ROM changes remain NPCDex planning actions. Review warnings remain distinct from human-testing status and do not establish in-game verification.
4. **Existing maps and newer ROMs. Accepted in the consolidated October 20 review.** Reuse the app-managed identities and default to updating existing records after preview, as already approved for RDX imports. Keep newer NPCDex plans, notes, flags, display corrections and testing history. A new ROM filename/hash does not itself create a separate map identity. Ambiguous matches and conflicting changes require review. Do not automatically refresh published NPCDex content when a new ROM is opened or extracted; prepare the result in staging first. Changed-build compatibility still requires RI03C proof.
5. **Staging and handoff. Accepted October 20.** Stay in ROM Import after a map has been extracted/prepared. The user can edit and resolve issues there before an explicit transition to NPCDex. This refines the initial import-action proposal: creating a prepared map is a local staging operation, not immediate insertion into the NPCDex catalog. Persist the staged map/its preparation work locally in managed application storage so it can be resumed. Approved actions are Prepare Map, Export RDX and Send to NPCDex, as shown in the concrete preview. Preserve the approved ability to proceed with acknowledged semantic warnings; structural/mapping failures remain blockers. Sending an existing map uses a change preview and preserves its editing lineage. The workspace stays open after handoff, with an optional Open in NPCDex action. Explicit handoff follows shared Auto-Sync: On permits queued background publication, Off retains local work until a later/manual sync. An explicit NPCDex service pause remains in force and must be shown clearly. The handoff preview must identify the destination and resulting sync state; it supplies explicit approval to bind/publish the selected map rather than silently enabling publication when a ROM is opened or extracted. No implementation or production sync resumption is authorized here.
6. **Performance placement. Accepted October 20.** Add a separately gated **RI03P — Map Cloud-Delivery Performance** task after RI03B and before RI03C. Reduce upload/request overhead and measure initial publication plus later syncs while preserving exact bytes, stable bindings, missing/changed-file detection and conflict review. Use fewer immutable delivery files/requests where feasible without combining logical maps into one working RDX or changing the permanent content hierarchy. It needs its own implementation PASSKEY. The consolidated approval includes the jobs/recovery boundaries below.

## Approved concrete workspace

The existing workspace chooser opens ROM Import and preserves the views in the other workspaces. The shared header remains consistent with ROMDex; this feature adds no unrelated header settings menu.

**Tray 1 — Maps / Zones:** choose or reopen a read-only ROM, search its actual catalog and select a suggested map group. Show source support and preparation state separately: a catalog entry is not proof that extraction is supported. The first implementation prepares the selected map at a time; batch extraction is deferred. Every prepared/exported document contains one logical map or zone.

**Tray 2 — Import setup / preparation:** map name and region; included physical areas; detected existing-map destination or an explicit separate-copy choice; optional display-name, map-stage and thumbnail cleanup. Before extraction these controls configure the job; afterward they edit the locally saved staged map. Source dialogue/scripts remain evidence rather than direct ROM-editing controls. NPCDex remains the place for proposed ROM changes.

**Tray 3 — Preview / review:** inspect the resulting hierarchy, extracted content/images, each map's Roman-numeral timeline, unknown/independent conditions and unresolved warnings. Provide the existing Default/Expanded/Collapsed Details-tray behavior without hijacking text-field focus. Corrections and warning details remain contextual; avoid another large modal editor. During an explicit handoff, this tray shows the target and actual changes to existing content plus the resulting cloud state before commitment.

**Actions:** Prepare Map creates a local managed staging RDX; Export RDX produces a current portable copy; Send to NPCDex previews and commits a deliberate handoff. After handoff remain here and offer Open in NPCDex. Local success, queued cloud delivery, remote confirmation, a paused service, required review and failed publication are distinct states. Do not report a successful local handoff as confirmed cloud synchronization.

Changing area membership invalidates the prepared output until the selected map is prepared again. Presentation-only edits may update the staging document without rereading original ROM bytes. Show the affected content totals after extraction, rather than retaining totals from a different area selection. Export and handoff must use the current verified preparation and a fresh destination baseline.

### Concrete preview and review evidence

The interactive three-tray preview shows a read-only ROM already loaded, Violet City's eight areas, optional display cleanup, local Roman-numeral stage labels, content/source warnings and an inline handoff review. Sprout Tower and Route 29 are marked not yet verified rather than represented as proven extraction targets. Placeholder artwork/dialogue keeps this design preview free of extracted game content. It does not read a ROM, create RDX files, change NPCDex or contact YouTrack.

Preview source: `C:/Users/mrgen/.codex/visualizations/2026/10/13/01a135f2-44b2-76d2-8bd4-062ec143dbd9/rom-import-workspace-design.html`. Local review evidence is under `work/ri03a/`. At 1,024 and 320 pixels the layout fits its width without horizontal page overflow. Focused interaction checks covered area-change handoff blocking, warning acknowledgement, local-versus-paused-cloud reporting, ESC closing the workspace menu and retaining a trailing space while editing. No runtime errors were observed. These are design-preview checks, not proof of RI03B functionality or installed-app acceptance.

## Approved technical and recovery boundaries

- Keep ROMs by a remembered external path and verified fingerprint rather than placing another full ROM in Data. Reopening a missing/moved input asks for its replacement and rechecks it. Never modify or include the ROM payload in an application backup/release by default.
- Keep staged working RDX files, source identities and preparation state under the installed application's Data folder. Recover lineage from an existing map's embedded source/mapping data or managed registry; importing an RDX on another instance must not depend on a separately supplied identity JSON. Show lineage conflicts rather than reconstructing identity from names or offsets alone. RI03B must prove this wrapper behavior; the CLI currently exposes the sidecar explicitly.
- Opening a newer ROM preserves the previous staged/published versions. Show supported-build diagnostics and an update preview. Changed-build and wider-map claims require RI03C acceptance; do not bypass an unsupported reader merely because the game code or filename matches.
- Run extraction outside the UI thread. Show the active step and measured progress where available, otherwise an honest working state rather than a fabricated percentage. Cancellation preserves completed drafts/checkpoints and prevents an incomplete artifact from being sent as a finished map.
- Autosave staging edits locally and preserve them across workspace switches and restarts. Shared Save Changes checkpoints the local staging provider without publishing staged content. Auto-Sync does not upload a staging map before its explicit handoff. Manual Save still honors the existing one-cycle sync behavior for eligible providers.
- Keep extraction jobs separate from synchronization and shutdown locks. Quit saves local work, requests bounded cancellation/checkpointing and exits without waiting for a cloud backlog. A crash reopens the last verified draft and offers recovery of any incomplete extraction.
- Check free scratch capacity before the job, retain recoverable work on failure, and offer cleanup of discardable extraction scratch. Do not silently delete RDX documents, user edits, queued operations, exports or the source ROM.
- Preserve original source evidence when names, thumbnails or stage order are corrected. Record these as display/documentation corrections; they do not establish runtime palette certainty or in-game testing. Broken references remain blockers; acknowledged semantic warnings can accompany a usable draft/handoff.
- The handoff review rechecks the target NPCDex baseline. If it changed while preparation was open, refresh the preview and preserve both versions instead of overwriting newer work. No file omission silently deletes an existing task/entity.

## Revised task sequence

RI03A (approved design review) → RI03B (offline staging workspace) → RI03P (cloud-delivery performance) → RI03C (broader/build/identity feature acceptance) → U28–U30 (integrated acceptance and packaged release). Each subsequent task requires its own PASSKEY. No production reset or cloud-pause change is part of RI03A.

## Evidence informing the design

RI02C produced a 1,001,582-byte Violet City RDX directly from the ROM. Local editing, reviewed native YouTrack changes, portable recovery and exact asset/identity preservation passed. All 135 owned test issues were confirmed absent. That proof is complete in source, not an installed ROM Import feature.

The extraction contains 50 placed objects and 329 exact texts. Neutral source labels are sometimes necessary; identical artwork does not establish a shared character. Two palette-ambiguous objects retain alternatives without a guessed default. Four observed scene-variable values do not establish a complete gameplay chronology. These are concrete preview/review needs.

Initial cloud publication involved 599 immutable objects / 604 data chunks plus a commit despite the compact RDX. RI02C corrected repeated verification reads and stale recovery status, but broader performance acceptance is still pending. The workspace must report actual progress and unresolved work accurately; cloud optimization must not be hidden inside a cosmetic UI change.

References: [approved ROM-only scope](RI01-ROM-Only-Extraction-Scope.md), [RI02C handoff](../History/RI02C/RI02C-Workspace-Handoff.md), [RI02C completion](../History/RI02C/RI02C-Completion-Report.md), [overall checklist](../../NPCDex-ROMDex-Action-Checklist.md).

## Completion gate

The user reviewed the recorded decisions and concrete workspace preview, then selected “Approve RI03A Design” on October 20, 2026. RI03A is complete and checked off. RI03B requires its own subsequent PASSKEY; RI03C and U28–U30 retain their separate acceptance/release gates.

The approval covers the tray division/action labels, local staging and explicit handoff, recoverable jobs and managed identities, plus the RI03B → RI03P → RI03C sequence. It completes the design gate only; implementation and installed-app acceptance remain separately gated. See the [completion report](../History/RI03A/RI03A-Completion-Report.md).
