# MX01 — Concrete condition, image and compatibility contract

**October 21, 2026 — owner-approved implementation contract; MX01 complete.** This package defines future implementation. It does not alter the application, live RDX files, YouTrack, saves or credentials. See the [decision record](../../Documentation/Project/MX01-Design-Review.md) for the eight owner-approved policy decisions and the reviewed suite layouts.

## 1. Compatibility and storage locations

Retain `RDXContainer/1`, `RDXDocument/1`, `schemaVersion: 1`, namespace `org.romdex.npcdex`, kind `map`, and one map per file. Introduce these **required** capabilities whenever the corresponding feature is present:

| Required capability | Payload |
| --- | --- |
| `org.romdex.npcdex.condition-effects-v1` | `NPCDexConditionIndex/1` |
| `org.romdex.npcdex.location-previews-v1` | `NPCDexLocationPreviews/1` |

Keep the existing nested-zone capability for nested zones. New writers put the semantic capabilities in both the document's `capabilities.required` and the container's `requiredCapabilities`, alongside the existing capabilities. Current installed readers do not implement these capabilities and must reject mutation; no current-runtime compatibility is claimed.

The existing `extensions` namespace permits the declaration below. It contains references only, never another copy of the content tree:

```json
{
  "org.romdex.npcdex.features": {
    "schema": "NPCDexFeatureBindings/1",
    "conditionIndexRecordId": "shared:map-example:conditions",
    "locationPreviewViewIds": ["view:map:example"]
  }
}
```

Bindings must match the map and capability set. A condition index is stored once at `current.payload.definitions.conditionIndex` in the map's existing referenced `shared` progression record (`map.current.payload.timelineRef`). Preserve that record's identity if it exists. `index.mapRecordId` must equal the document scope. Conditions in two maps have independently evidenced effects; no global story-stage array is substituted.

Location metadata lives at the relevant `NPCDexViewRevision/1.payload.locationPreviews` field, with one view per existing view identity. Its `targetRecordId` equals that view's record, and `mapRecordId` identifies its map. Existing views and owners' image fields remain intact. The runtime view-field whitelist must be extended under the required capability before use; accepting these fields is **not** current behavior. The view's normal ancestry and content hash cover this metadata. Image bytes are ordinary deduplicated verified image assets, not data URLs or external links.

Versioned backend publication carries these same record/view revisions, document feature bindings and capabilities. Publication must advertise its required feature set before a reader merges artifacts, including readers reconstructing a map without its original RDX file. Capability-aware readers verify one coherent head before applying any part. Old clients must not mutate a feature-bearing publication through an older cached head: compare-and-set publication heads and fail on unsupported features. MX03/MX06 must prove this on the actual backend path.

The schema file validates feature fragments only, not a complete RDX. Existing container, graph, hash, asset, authorization, binding and ancestry validation remains mandatory. No global YouTrack field/type change is required.

## 2. Conditions, effects and source evidence

`features.schema.json` defines exact field shapes. A condition has a stable `id`, readable `label`, its label's origin, an expression and source references. The display order contains every condition exactly once. Roman numerals are derived from order and are never identifiers, timestamps or proof of a sequence.

An effect has its own stable ID, kind (`dialogue`, `presence`, `scene`, `script`), exact content target, variant ID, complete access expression, contributing condition IDs and source references. Two mutually exclusive branches remain two effects/variants; do not concatenate their text as a proven spoken sequence. `target` reuses the established record/point/block/prompt/gender shape. Dialogue targets identify existing prompt/block content; source evidence alone is not displayed as an extra dialogue line.

Supported expression nodes:

| `op` | Meaning |
| --- | --- |
| `constant` | Explicit proven true/false, including genuinely unconditional behavior |
| `flag` | Raw flag identifier must be set or unset |
| `variable` | Raw variable identifier with integer comparison `eq/ne/lt/lte/gt/gte` |
| `runtime` | A supported time, gender, badge, party or choice check with explicit arguments/comparison |
| `all` / `any` / `not` | Preserve AND / OR / NOT, including negative branch guards |
| `unknown` | Unsupported or unresolved behavior, with reason and retained source references |

Never execute a script, expression string or embedded code. A runtime check is understood only when the ROM adapter defines its opcode, arguments, value domain and evidence. Otherwise emit `unknown`, not a plausible story guess. Unknown is a third truth value: NOT unknown stays unknown; false AND unknown is false; true OR unknown is true; other unresolved combinations stay unknown. The default Inspector does not supply a simulated game state.

Each effect's access expression combines entry/caller guards, placement presence and the specific branch path. Alternative reachable call paths may form an OR. Conditions are included only with an actual local effect; mere presence in a shared bank or an unrelated flag write is insufficient. A prerequisite set elsewhere can still be relevant here. Every condition must be referenced by an effect; every referenced condition must exist. Full effect expressions must retain additional unresolved guards rather than implying that a named condition is sufficient by itself.

`sourceRefs` pin an existing mapping artifact digest and locator key. The mapping records exact ROM-relative paths/offsets, hashes and record bindings. The index pins the source ROM hash; the document retains its existing project/build lineage metadata. No absolute local path, ROM bytes, token or key is embedded. Identity follows the established project registry and reviewed cross-build matching, not text, Roman numeral, sprite or the current ROM hash.

Every extracted map-owned placement/interactive/scene has a coverage entry: `complete`, `partial` or `unsupported`, with explanation and evidence. Complete with no spoken effect means no documented speech, not extraction failure. Missing coverage is unresolved, never silently complete. Empty condition lists are valid for maps with proven unconditional content. Mixed known/unknown effects are allowed for local inspection with visible warnings; broken target references are blocked.

Bounds inherit the existing RDX depth/node/byte/work limits, including depth 64. The implementation must remain cancellable and avoid expansion into every possible flag combination. Per-feature arrays count toward those limits; no limit increase is authorized by this design.

## 3. Inspector and lights

On opening a map, show all content with no game progression assumed. The Timeline contains relevant map conditions only. Selecting an entry highlights affected entities and shows complete prerequisites and alternative dialogue/effects. Keep always-available content and unresolved conditions directly accessible; clearing inspection restores the same selected entity where possible. Switching maps clears stale condition selection. A parent map includes its selected nested zones, with explicit paths.

Readable labels come from source evidence or owner corrections. When meaning is unknown, use the raw flag/variable identifier with an unresolved label; do not borrow nearby dialogue as an event name. Renaming/reordering does not move notes between targets.

Derive review lights from the exact affected prompt units using the existing suite's status/color/precedence functions. Deduplicate units reached by multiple paths; preserve per-target decisions, critical flags, notes, Verified/Inaccessible state and Needs Human Testing. Do not introduce a new color mapping in this task. Supply accessible counts/details for mixed states instead of claiming every prompt matches the dominant light. No effects, no dialogue, unreviewed, unresolved extraction, blocked delivery and verified testing are distinct states. Connection success never verifies dialogue; an imported map is not automatically reviewed. New accepted agent content invalidates prior testing for the affected revisions.

## 4. Automatic location images and owner choices

Defaults: map/route overview; building/entrance exterior crop from its actual parent location; exact interior/floor for child tiles. Preserve arbitrary nesting. An uncertain exterior association is explicitly unresolved and can use a labeled available interior. LP01 must prove recognizable real ROM terrain/model/texture rendering; no AI/stock image or point-grid substitute qualifies.

Each candidate has a stable ID, source record, image asset reference, origin, view kind and normalized crop. Generated candidates additionally require a ROM hash, nonempty dependency hashes, renderer ID/version and reproducible settings; the renderer settings are a data-only adapter contract, not executable code. Manual images require verified portable bytes but no invented ROM provenance. Crop width/height are positive; x+width and y+height cannot exceed 1.

`selectedCandidateId` references a retained candidate or is null while no image is selected. `ownerOverride` pins the chosen view/crop/manual image. Ready requires a selected verified asset; pending/unsupported/unresolved requires an explanation. An existing pinned image can remain displayed when a source update makes its freshness unresolved; do not delete or silently regenerate it in place. Keep old and new candidates separate for review.

The exact selected image bytes travel in the map RDX and backend publication. Cached render products can be trimmed only when reproducible and unreferenced; an image inside a current map or retained history is content. Cache keys cover relevant dependency hashes, renderer/version and settings; opening another ROM build does not by itself discard an owner's choice. Unchanged assets are reused and deduplicated, and routine synchronization does not rerender every location.

## 5. Native edits and content hierarchy

Use existing domain record kinds: `region`, `map`, `subzone`, `profile`, `appearance`, `interactive`, `scene`, `shared`. Display subzones contextually as Zone/Building/Floor using versioned presentation metadata; do not invent incompatible native Type values. Region → Map → arbitrarily nested Subzone → physical entity forms the parent tree. Shared profiles are referenced identities. Current payload membership lists, native parent links and map scopes must agree. Parent changes preserve all descendant record IDs and issue bindings; multi-map regrouping is a reviewed coordinated operation.

Automatically accept only supported, non-conflicting name changes after identity/baseline validation. Map the issue summary to the domain name and any existing corresponding display-name field through one coordinated revision; a presentation override collision requires review. Profile updates affect linked identities, while local appearance overrides remain local. Formatting suffixes such as “Character Profile” are record-kind decoration and must not be added to a character's actual name. Unknown native fields and arbitrary comments remain untouched.

Dialogue, predicates, source associations, image choices, profile links and parent/content membership need a validated correction/review route. Preserve the original extracted evidence; a documentation correction does not claim a ROM edit. No native State or Complete change can clear mandatory human testing. The ordinary agent return remains bound to the authorized task/package.

## 6. Agent returns and private authority

Keep current fixed JSON Map Packages, task selection/creation, exact authorization, task-attached returned RDX discovery, independent/dependent group rules, reviewed conflict overwrite and human testing. A precisely bounded typed result may apply automatically only when every existing validation gate succeeds. An open-ended/prose-only result is staged with exact before/after fields and source/output-ROM evidence; explicit approval authorizes only that concrete diff against a fresh baseline. The app never uses AI to interpret prose scope.

Persist the exact reviewed result hash, task/package/base, selected groups and choices in the existing private authority journal. Recheck before commit; a changed return/base invalidates the approval. No new portable field may grant authority, mark testing passed, or complete a task. Superseded/withdrawn authorization and missing/invalid source evidence remain blocking review states. Dependent groups cannot be partially accepted. Newer/excluded proposals survive acceptance of older work. Returned content always Needs Human Testing; the task remains open.

## 7. Older documents, retention and recovery

Supported older documents are converted on saving their managed copy, with an intact recoverable original/checkpoint. Imported external files remain unchanged. Conversion validates every preserved ID, asset byte, annotation, proposal, history reference, package baseline and outstanding test obligation. Missing condition analysis stays unresolved; retain old labels and annotations in a clearly marked legacy/reference view. Never promote a scene-excerpt timeline to proven flag logic. Unmappable annotations retain their original target/text for review.

A format-only conversion checkpoints local storage without dispatching work or blindly republishing every record. A subsequent verified feature-aware publication updates the changed artifacts/capability header coherently. Protect recovery across interruption and never let an older cloud head overwrite the converted working map. Newer unsupported required features permit only a bounded safe metadata preview, or a clear refusal; editing/export-as-current/publication is blocked.

Automatic cleanup is limited to verified disposable, unused, reproducible caches/completed temporary files. Protect interrupted imports, in-use files, working maps, images/overrides, queued edits, credentials, package pins, pending reviews/testing and required recovery. MX07 inspects actual usage before setting budgets. Backups/history/old installers receive a concrete size/dependency review; approved obsolete items are collected for manual deletion. No cleanup is performed by MX01.

## 8. Implementation handoff and acceptance

- **MX02:** source branch/caller/presence extraction and honest coverage; prove New Bark Town and Route 29 independently from ROM evidence.
- **MX03:** feature schemas, guards, publication header, condition transport/projection and Inspector behavior; reopen/export/reimport and isolated backend recovery. Existing clients must refuse unsafe edits.
- **LP01 → MX04 → LP02 → LP03:** actual renderer proof, approved suite layout, portable generated images and focused packaged acceptance. Preserve the original planning controls and header components.
- **MX05 → MX06 → MX07:** identity/regrouping, exact inspectable backend/native reconciliation, measured responsiveness and bounded storage policy.
- **MX08 → MX09:** exact reviewed prose-result authorization and deterministic real-ROM agent return proof. All returns require human testing.
- **RI03C → U28–U30:** integrated/guided acceptance and final installer/documentation. Two-actual-build acceptance remains deferred until another build exists.

The included examples are fictional **feature fragments**, not complete importable RDX files or evidence of extraction/rendering. Design checks validate schema shapes, references and representative semantic cases only. Actual runtime/live checks remain in their assigned tasks. MX01's contract/screens were accepted together; the owner's next PASSKEY authorizes MX02 followed by MX03. Later tasks still need their own PASSKEYs.

## LP02 implementation encoding

October 21: normalized crops use integer millionths (0–1,000,000), preserving the approved normalized geometry while satisfying canonical RDX safe-integer JSON. The UI shows percentages. Location preview capability and native carriers are now implemented; see LP02 completion evidence. Historical MX01 design verification remains preserved.
