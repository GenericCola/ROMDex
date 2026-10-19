# Package Map Changes

U21 adds fixed JSON packages to the desktop source. Installed 0.5.15 does not acquire this feature until a later packaged release. Returned-RDX discovery, reconciliation and human-testing workflow remain U23–U27.

In NPCDex, open a physical map, then choose **Tray 2 Settings → Package Map Changes**. The preview starts with the map and its sub-zones selected. Each entry shows its full target path, familiar CHANGE/REMOVE/FINAL label and actual instructions, dialogue, note or flag. Uncheck anything that should stay out of this package.

Selected CHANGE, REMOVE and ADD plans define requested work. There is no additional Draft/Ready control or requirement. Those internal labels are retained only as provenance. FINAL decisions, notes and flags are context, never instructions to change the ROM. A context-only package is allowed and prominently says **No ROM Changes Requested**.

Choose an existing published PMON task, or explicitly create a task under a chosen PMON parent or the project root. Click **Review Selection and Destination**, check the review confirmation, then **Attach Fixed JSON Package**. Changing a selection, destination or map after preview requires another review. Missing assets, incompatible changes or stale content baselines require review rather than silent substitution.

The fixed version is saved locally first. Auto-Sync On delivers it; **Save Changes** or **Map Package Delivery → Deliver Queued Packages Once** attempts delivery while Auto-Sync is Off, without turning it on. Existing task description, assignment, priority and status are preserved. Creating or attaching a task never dispatches an agent.

Delivery uploads required files first, downloads and verifies their exact bytes, then attaches the readable `NPCDexMapPackage/2` JSON and a separate `RDXTaskBinding/1` file identifying the actual task and attachment. The binding hashes the exact JSON bytes, including formatting. It is not an integration receipt. All files needed by the agent are on YouTrack; no private GitHub save access is required.

The complete working RDX, excluded plans/notes and unrelated history stay local. The JSON includes current map/entity records, mapping evidence and exact selected plan/observation versions. Current content images and referenced required assets are included. Original working-file revisions remain pinned locally so a later return can be compared with its real baseline without losing newer or excluded work. Future storage retention must preserve those pins.

**Map Package Delivery** shows fixed versions and whether they are queued, need review or are attached and verified. Later edits never rewrite an attached package. Review a new version explicitly to include them. Reconfirming the same fixed version reuses the existing operation. Uncertain uploads use ROMDex’s existing recovery view; canceling a required upload stops delivery for review rather than silently recreating it. **Download Exact JSON** becomes available once the required assets have verified YouTrack locations.

After attachment, hand the task to the coding agent separately. Recorded mappings may be documented extraction evidence rather than proof of the latest ROM. The agent must resolve every target against the actual ROM/source before implementation. All results must remain open for human review and in-game testing; U21 does not enable automatic agent returns or mark tasks complete.

Limits: one physical map, 2,000 selectable entries, 64 distinct required files, 50 MiB per file, 128 MiB of required files and 16 MiB of JSON. Nothing is silently dropped to meet a limit. The local ledger holds up to 1,000 fixed package versions before an explicit retention review is required.
