# Synthetic RDX Examples

These are actual compressed version 1 RDX files, produced and verified by RD03 from the approved fictional RD01 examples. They contain no real ROM extraction, user save, token or production backend binding. Installed ROMDex 0.5.14 does not yet provide their import UI; use the source [CLI tools](../ROMDex/rdx/README.md). RD07 will separately prove real YouTrack import and two-way changes.

| File | Purpose |
| --- | --- |
| [FixtureMap.rdx](FixtureMap.rdx) | One map and its dependencies, proposals, notes, presentation metadata and exact assets. |
| [FixturePlan.rdx](FixturePlan.rdx) | Epic → Saga → Story → Verse → Task, typed fields, comment provenance and attachments. |
| [FixtureReturnedMap.rdx](FixtureReturnedMap.rdx) | Updated map, historical base and fictional task/package evidence. The validator reports mandatory human testing; it cannot authorize applying the result. |
| [FixtureOptionalExtension.rdx](FixtureOptionalExtension.rdx) | Unknown optional namespaced values retained without interpretation. |

The one-pixel image is only a byte-preservation fixture. It is not the RDX file icon; Windows association will use the existing exact Pokéball art in RD08. [Example hashes, sizes and round-trip measurements](../RD03-Evidence/examples.json).
