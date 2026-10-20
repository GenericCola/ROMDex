# Map-specific timelines

RI02T source support. Each physical map's content record already has `current.payload.timelineRef`; it now selects that map's actual progression record throughout validation, projection, filtering and editing. There is no required A–J sequence or ten-stage count.

A progression record is `kind: shared`, `sharedType: progression`, with `definitions.stages` in display order. Each stage has a stable `id`, descriptive `name` and `event` condition. Up to 256 stages are supported. An empty list explicitly means no staged timeline has been documented; unstaged/all-stage content remains accessible through Other Conditions. A filename, stage label, array index or Roman numeral is not a stage identity.

Example fields inside a shared content record:

```json
{
  "name": "Example Map Progression",
  "sharedType": "progression",
  "definitions": {
    "stages": [
      {"id":"stage:arrival","name":"Arrival","event":"The map-specific arrival condition is true."},
      {"id":"stage:gate-open","name":"Gate Open","event":"The map-specific gate event has completed."}
    ]
  }
}
```

Point `stageIds` reference this map's declared stage IDs; `all` covers every stage, and an empty array denotes Other Conditions. The validator rejects a stage belonging only to another map, even if both maps are loaded. New Map Import bundles may include a new mapped progression record used by their new map, or reference an existing appropriate progression. They cannot add unrelated shared content or substitute a missing timeline.

Projection carries a `timelines` registry and a `timelineRef` on each map collection. The interface reads the selected map's registry entry; it renders I, II, III, IV, … from the stage's current position. Switching maps restores its selected stage ID. Renaming/reordering does not rewrite dialogue, flags, notes, plans or testing identity. Longer lists scroll horizontally, and full names/conditions are available in hover/accessible labels.

The original legacy catalog retains its exact frontend shape when it still uses its one preserved progression. Its A–J IDs, descriptions, source export and history are unchanged. Legacy portable records declaring only `definitions.stageIds` also remain readable with explicit “condition not supplied” labels, using their declared count. No missing condition is invented. Ambiguous unscoped shared dialogue must declare `definitions.timelineRef`; it cannot arbitrarily inherit the first of multiple unrelated timelines.

An explicit owner documentation correction can pass `timelineStages` with `type: definition` for a progression record, together with `documentationCorrection: true`, the expected baseline, reason and evidence. Use the existing IDs when changing names/order. A point correction can pass `stageIds` and/or `condition`. In-use stage removal fails reference validation. These actions append normal sealed revisions and preserve originals; they do not request ROM changes or dispatch an agent. Ordinary timeline display/selection does not write a correction.

RDX container/native schema versions are unchanged: the contract already permits per-map `timelineRef` and stage lists. RDX import/export carries the actual referenced timeline and stage IDs. Projection version 4 invalidates an older cached projection at the normal accepted refresh boundary. Portable testing claims remain unreviewed after importing into a different profile; relabeling a timeline inside the same profile preserves legitimately recorded entity testing results.

ROM extraction must supply concrete evidence and keep independent/reversible predicates distinct. Display order is not proof of chronology. Violet City's ROM-only proof uses four observed values written to local scene variable 0x4074, plus its two explicit scene-hook predicates. Its initial state/full chronology has not been inferred or approved. RI02C must retain these uncertainties when building the real map RDX; this source-state demonstration does not authorize replacing existing maps.

Tests use isolated profiles and synthetic portable content. No production Data, queued edits, credentials, YouTrack records or installed app files are changed by RI02T.
