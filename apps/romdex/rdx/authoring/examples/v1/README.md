# Version 1 Examples and Schema Index

All examples are fictional. Keep their `fixture:*` identities and `origin.synthetic: true` during exercises; do not publish them as actual game content. New real content needs its own durable identity manifest and real source evidence. Existing content keeps its original identities and seals.

| Path | Purpose |
| --- | --- |
| `starter/fixture-source.json` | Tiny authored toy source, exact dialogue whitespace/control-data example; not a ROM dump. |
| `starter/map.document.json`, `LanternHarborMap.rdx` | Six records: region, timeline, map, dock, shared profile and local appearance. Partial scope, exact source/image blobs and explicit mapping evidence. |
| `starter/plan.document.json`, `LanternHarborPlan.rdx` | Five-tier plan with a comment, Assignee/Due Date and image attachment. |
| `starter/blobs/` | Exact hash-addressed image and toy source bytes. |
| `contract-reference/map.document.json` | Richer approved example with four requests, flags/notes and view metadata. |
| `contract-reference/plan.document.json` | Approved five-tier plan example. |
| `contract-reference/optional-extension.document.json` | Unknown optional namespaced data retained without execution. |
| `contract-reference/map-package.json` | Fixed `NPCDexMapPackage/2` JSON: four requests, three groups, observations, locators, assets and execution/return instructions. |
| `contract-reference/task-binding.json` | Exact raw package byte hash and fictional task/attachment binding. |
| `contract-reference/returned-map.document.json` | Exact original base plus an independent implemented dialogue outcome. Other groups remain pending; human testing is required. |
| `contract-reference/blobs/` | Original exact image, attachment and typed base-history bytes. |

The contract-reference files preserve the approved RD01 bytes. They are historical contract fixtures, not live YouTrack bindings. `build-example.mjs` constructs the smaller starter independently using the current validators. Rebuilding to a new directory reproduces the same fixture identities/revisions; it is not a general production extractor or an existing-document resealing tool.

## Pinned Local Schemas

| File, relative to kit/source root | Defines |
| --- | --- |
| `rdx/contracts.schema.json` | RDX container/documents, map/plan fields, package, binding and returned results. |
| `content/contracts.schema.json` | Native records, ROM mappings, plans, reviews and presentation metadata. |

These exact schema resources are registered by `rdx/schema.mjs`; nested native definitions must match the local native schema. `SHA256SUMS.json` in the distributed kit pins every delivered file, including schemas and examples. Imported schema IDs never cause network downloads. `rdx/document.mjs` additionally validates graph/ancestry, asset/image integrity and task semantics; JSON Schema shape alone is insufficient.

From the root, pack any reference map/plan with `node rdx/cli.mjs pack rdx/authoring/examples/v1/contract-reference/map.document.json rdx/authoring/examples/v1/contract-reference/blobs ReferenceMap.rdx`. The packer reads only assets declared by that document. The returned-map example can be packed/validated locally but is refused by ordinary app import until its task-bound workflow is implemented. Run `node rdx/authoring/check-reference.mjs` for the fixed set's offline integrity exercise.
