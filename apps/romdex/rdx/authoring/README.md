# ROMDex Agent Authoring Kit — Version 1

This guide is for the coding agent preparing files for ROMDex and NPCDex. The application reads these files deterministically; it does not need AI to interpret, import, map, save or export them.

Use **Node 24** for the commands in this kit. All included command-line tools use Node built-ins and the pinned local schemas. Run commands from the extracted kit root, or from the application source root. No server, account, token, npm install or private save-repository access is needed for these local exercises.

## Choose the Artifact

| Artifact | Internal identity | Use |
| --- | --- | --- |
| Editable map `.rdx` | `RDXDocument/1`, namespace `org.romdex.npcdex`, kind `map`, schemaVersion `1` | One map/zone, sub-zones, entities, dependencies, exact assets, proposed changes, feedback and retained history. |
| Editable plan `.rdx` | `RDXDocument/1`, namespace `org.romdex.tasks`, kind `plan`, schemaVersion `1` | Epic → Saga → Story → Verse → Task hierarchy, typed fields, comments and attachments. |
| Fixed Map Package `.json` | `NPCDexMapPackage/2` | Human-selected instructions and ROM targets for an actionable task. It is a snapshot, not an editable map. |
| Task/package binding `.json` | `RDXTaskBinding/1` | Exact package byte hash and verified ticket/attachment provenance, stored separately to avoid circular hashes. |
| Agent return `.rdx` | Map document with `origin.role: "agent-result"` and `result.format: "RDXAgentResult/1"` | Implemented outcomes tied to the original task, package and base; always needs human review/testing. |

Keep **one `.rdx` extension**. Names such as `LanternHarborMap.rdx` and `LanternHarborPlan.rdx` help people; validated internal fields select the workspace. Future add-ons need declared namespaces/capabilities, not invented core fields. Unknown required features are rejected; optional namespaced extensions must survive unchanged and never execute. The file icon is the suite's exact Pokéball art.

Create files with the shipped packer: modern RDX uses the `ROMDXR01` framing, not ZIP or renamed JSON. Legacy migration `ROMDEXM1` and `NPCDexMapImport/1` JSON retain their dedicated readers; changing an extension does not convert them.

## Working Today and Later Gates

RD03–RD08 have source implementations and isolated verification: container tools, managed files, map/plan import previews, explicit publication/bindings, accepted two-way changes and Windows file integration. The installed production release remains **0.5.14** at this checkpoint. These new tools can be used locally from the kit/source; that installed release is not claimed to support the new RDX menus.

Existing production maps are adopted under **RD10**, after a fresh backup and accepted preview preserving existing NPCD identities. **U21** implements the JSON package selection/task-attachment interface. **U23–U27** finalize execution identity, returned-file discovery, validated reconciliation and human testing. The reference package/return examples describe those approved contracts; they do not enable future automation. Ordinary file import currently rejects agent-result files.

## Ten-Minute Local Exercise

Use a new scratch folder. These commands never publish or dispatch anything:

```powershell
node rdx/authoring/build-example.mjs scratch-lantern
node rdx/cli.mjs validate scratch-lantern/LanternHarborMap.rdx
node rdx/cli.mjs inspect scratch-lantern/LanternHarborPlan.rdx
node rdx/cli.mjs unpack scratch-lantern/LanternHarborMap.rdx scratch-unpacked
node rdx/cli.mjs pack scratch-unpacked/document.json scratch-unpacked/blobs scratch-copy.rdx
node rdx/authoring/check-reference.mjs
```

`build-example` creates a fresh, **fictional** six-record map and a five-tier plan from authored source objects. It includes exact source JSON, an illustrative pixel image, a comment, Assignee/Due Date values and an attachment. Its fixed `fixture:rd09-*` identities are for exercises only. It refuses an existing output directory; pack/unpack/export also refuse existing destinations. Use new scratch names on another run.

`validate` verifies structure, revisions, references, image bounds and every included blob. `inspect` reports namespace/kind and distinguishes legacy routes. `check-reference` checks the supplied fixed package/binding/return examples for offline integrity. Its `authorization: "not-established"` result is intentional: a valid file does not authenticate a person, approve ROM work or prove testing.

To exercise two separate local stores:

```powershell
node rdx/local-cli.mjs import scratch-instance-a scratch-lantern/LanternHarborMap.rdx
node rdx/local-cli.mjs list scratch-instance-a
# Copy the returned key; it is derived from dataset/document identity.
node rdx/local-cli.mjs export scratch-instance-a YOUR_DOCUMENT_KEY scratch-transfer.rdx
node rdx/local-cli.mjs import scratch-instance-b scratch-transfer.rdx
node rdx/local-cli.mjs show scratch-instance-b YOUR_DOCUMENT_KEY
```

Use this CLI only with your own scratch Data directories. Do not point it at the running application's Data or edit managed working files directly. In the desktop build, use its existing map/plan import and export controls. Local import stays unbound; cloud publication requires its separate reviewed action. Auto-Sync Off preserves local edits; Save Changes performs one explicit sync cycle and leaves Auto-Sync Off.

## Read in Order

1. [Extract and author map data](MAP-AUTHORING.md): required ROM inputs, stable identities, physical/shared hierarchy, dialogue, images, feedback and revision construction.
2. [Author task plans](PLAN-AUTHORING.md): portable fields, destination/tier preview, comments/files and update/deletion rules.
3. [Packages, agent handoff and returned maps](PACKAGES-AND-RETURNS.md): fixed JSON, task/asset provenance, partial/dependent outcomes and human testing.
4. [Agent prompts and acceptance stories](AGENT-HANDOFF.md): copyable instructions and concrete success/error paths.
5. [Existing data and portability](EXISTING-DATA-AND-PORTABILITY.md): current production versus RD10 adoption, actual export controls, working-file location and second-instance boundaries.
6. [Versioned examples and schema index](examples/v1/README.md). The schemas in `rdx/contracts.schema.json` and `content/contracts.schema.json` are authoritative; their dependency IDs resolve locally.

Supported image MIME types are **PNG, JPEG, GIF and WebP** (`image/png`, `image/jpeg`, `image/gif`, `image/webp`), with signature/dimension checks. SVG is not an accepted planning-image asset. Other exact files can travel as opaque attachments; declared JSON attachments/history must also pass the bounded strict JSON parser. Blobs are data and never supply executable import handlers.

The compression profile is raw DEFLATE level 9, with stored entries when compression expands them. Images/files are never re-encoded to fit. Stored files are bounded to 512 MiB, decoded aggregate to 1 GiB, document JSON to 16 MiB and each blob to 50 MiB; planning images are at most 4096 pixels per side and 8 Mi pixels. Managed/cloud quotas and YouTrack transfer limits are separate. Preserve and report an oversized file; do not truncate history, resize assets silently or relax a validator.

This kit proves portable fictional fixtures and deterministic tools. Real game extraction still requires the actual ROM/source, revision, decoder and resource evidence described in the map guide.
