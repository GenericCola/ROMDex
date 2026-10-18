# RDX Contract Examples and Review Walkthroughs

These are unpacked fictional contract examples. They are not `.rdx` files accepted by the installed 0.5.14 application, production imports, verified ROM extraction or completed YouTrack tests. The 1-pixel PNG and four-byte attachment test exact asset preservation only; neither is the application/file icon.

| File | Purpose |
| --- | --- |
| [map.document.json](map.document.json) | One map, region/context dependencies, 11 existing-style records, four staged requests, notes, display metadata and binary asset references. |
| [plan.document.json](plan.document.json) | Five task tiers, imported comment provenance, sprite attachment, Assignee and Due Date values requiring destination mapping. |
| [container.manifest.json](container.manifest.json) | Proposed entry table for the canonical map JSON and two stored blobs. No framed/compressed file is generated yet. |
| [map-package.json](map-package.json) | Readable fixed execution package with four requests in three groups, asset locators and new returned-file instructions. |
| [task-binding.json](task-binding.json) | Exact byte hash of that JSON package bound to a fictional task/attachment; dispatch is `none`. |
| [returned-map.document.json](returned-map.document.json) | One independent dialogue outcome, retained original base plus an after-revision, exact package/task provenance and mandatory human testing. Other groups remain pending. |
| [optional-extension.document.json](optional-extension.document.json) | Unknown optional namespaced data retained without interpretation. |

## New Map From the ROM

The extractor receives the real source/project revision, map resources and existing identities. It produces the structure illustrated by `map.document.json` and exact referenced blobs. A future pack tool validates and creates the framed `.rdx`. Import previews the map/context/asset inventory and saves locally without dispatch. The first connected publication separately reviews target projects and creates/binds required records. Fictional source locators in this bundle cannot be used as production mapping evidence.

## Offline Import and Second Instance

An unconnected instance imports the file, stages a note/image/dialogue proposal and saves its managed copy. Export includes its complete dependency closure and assets. Another instance imports it without needing the original machine, private GitHub repository or YouTrack token. Later it explicitly establishes its own destination bindings. The source input stays unchanged. Offline save success is distinct from cloud delivery.

## Update an Existing Map

Import a revision retaining the original document/dataset/record identities and exact base. Preview current versus incoming changes. Independent changes can merge; changed dialogue on both sides is reviewed with both alternatives retained. If the complete snapshot omits a baseline NPC, propose archival only within the declared covered parents and only against the pinned baseline. Partial input has no omission effect. A newer destination edit or another map's appearance is protected.

## Place a Task Plan Under an Existing Epic

The plan declares Epic → Saga → Story → Verse → Task. Selecting an existing Epic as destination previews Saga → Story → Verse → Task → Task. Preserve descendants, comment IDs and attachment bytes. Explicitly map the fictional assignee and due-date field; do not guess an account or discard an unmapped custom field. Existing tasks absent from the file survive. Reimport reuses its ledger and does not duplicate comments or attachments.

## Package and Return an Older Proposal

Attach the exact `map-package.json` bytes to a chosen task and record its separate task binding. The owner later writes a newer proposal. Following separate human handoff, the agent implements the older packaged dialogue and attaches the returned map to the same task. Reconciliation acknowledges only the old plan digest, keeps the newer draft, updates accepted current content and marks affected testing Unreviewed. Extra, conflicting or unapproved returned changes go to review. The task stays open until human verification.

## Dependent Changes and Human Testing

The removal group contains both local Visitor removal and the shared-scene participant update. A return with only one of them cannot apply. A full validated group changes them together while retaining the shared profile/history. Independent dialogue can apply while this group waits. Every applied result is marked Needs Human Review and Testing, irrespective of automatic reconciliation or any test claim inside the file. The agent announces readiness; a human verifies the accepted revision before completion.

## Required Live Acceptance Before Existing-Map Conversion

RD07 must pack an actual test `.rdx`, import it, publish it to isolated real YouTrack records, make a local edit and verify remote readback, make a native YouTrack edit and verify local display plus reopened/exported file content. Include restart/idempotency and a simultaneous-edit conflict. These contract examples do not satisfy that gate. After that proof, RD10 inventories current maps/shared records, backs up the authoritative Data, obtains conversion-preview acceptance and adopts managed `.rdx` without rebuilding NPCD or losing existing edits, images, history or credentials.
