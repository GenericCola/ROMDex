# RDX Container, Validator and Tooling Completed

**October 18, 2026. Status: source implementation complete and verified.** The user authorized RD03 with PASSKEY. The installed application remains **0.5.14**; no installer, production save, queue, connection, Windows association or YouTrack record changed. Include RD02/RD03 in the later approved RDX release.

## Delivered

- Actual `ROMDXR01` files for map and task-plan documents, with strict manifest framing, version/workspace/kind routing, canonical document revisions and exact binary hashes.
- Lossless raw DEFLATE or stored entries, hash deduplication, complete blob inventories and exact asset/history preservation. Unknown optional extensions survive; unsupported required features stop clearly without modifying the source.
- Bounded streaming inflation, cancellation/deadline checks, actual decoded-length and consumed-input verification, aggregate/entry/JSON limits, native graph/presentation checks, image checks and safe extraction names. No schema downloads, payload execution or app-side AI.
- Reusable pack/read/unpack/validate functions and a CLI. New output paths are required; input files remain untouched. Legacy browser migration and existing map JSON dispatch only to explicit dedicated host handlers, retaining their existing validation/context requirements.
- Four [synthetic RDX examples](RD03-Examples/README.md), the [tool guide](ROMDex/rdx/README.md), [verification record](RD03-Verification.json) and measured compression/capacity evidence.

## Verification

The final focused run passed **93 tests**, including **48 new RDX tests** and 45 existing native-content/catalog/migration checks. The 48 also pass under the existing bundled Electron runtime in Node mode. Six changed JavaScript modules pass syntax checks. No browser or new native-window/installer launch was needed.

Tests cover exact map/plan/returned-map round-trips, deterministic same-runtime repacking, optional extensions, Unicode/control/trailing text, duplicate/empty/incompressible assets, original bytes, GIF handling, malformed manifests, bad framing/hash/offsets, truncated or concatenated compressed streams, cancellation/deadlines, defensive limits, hierarchy/identity errors, CLI exit status and overwrite protection. An agent-result fixture always reports human testing required and backend authority unestablished.

The first broader run found a short-unknown-header error classification, which was corrected. Existing migration tests initially encountered sandbox temporary-folder rename restrictions; using an isolated workspace temporary directory allowed their unchanged code to pass. An earlier capacity-survey attempt correctly encountered an incomplete transport chunk; the survey now distinguishes fragments from complete structured JSON rather than treating fragments as a valid document. Production parser checks were not relaxed.

## Compression and Capacity

An existing protected 0.5.14 content baseline was opened read-only. All 998 immutable cached objects, totaling **32,218,266 bytes**, were encoded/decoded with exact equality and hash checks. This includes retained JSON/history, original PNG/JPEG/WebP bytes and pending artifacts; no payload or credential was exported to the repository.

| Level | Stored Body Bytes | Saving | Encode / Decode |
| --- | --- | --- | --- |
| 1 | 11,327,268 | 64.84% | 644 / 342 ms |
| 6 | 10,608,042 | 67.07% | 880 / 337 ms |
| **9 — Default** | **10,540,985** | **67.28%** | **1,064 / 331 ms** |

These body-codec timings exclude full RDX validation/framing. Sampled peak RSS was approximately 180 MiB in independent benchmark processes, not a guaranteed operating-system peak. Original bytes are stored if compression expands an entry. The corpus contained no standalone GIF; a separate synthetic GIF verifies lossless support. The actual framed map example is **4,462 bytes** for **20,065 decoded bytes**, including its assets; the returned-map example is 9,087 bytes and retains its exact historical base.

The largest complete measured JSON object was 9,915,298 bytes, 113,224 values and depth 19, within the approved 16 MiB / 300,000 / 64 ceilings. The bounded API materializes decoded entries in memory; the 1 GiB decoded ceiling is a rejection bound, not a constant-memory promise. Full current-map dependency closure, fresh-data adoption and live YouTrack acceptance remain later gates. The survey is not a conversion or proof that a stale baseline should replace newer work.

## Delivery Boundary and Next Task

RD03 provides the format and developer tools. The installed app cannot yet import these modern documents through its interface. Managed working files and atomic save/recovery are **RD04**; map/plan import previews are RD05/RD06; real bidirectional YouTrack proof is RD07; Windows association/Pokéball icon is RD08; existing-map adoption follows only after the later acceptance gates. Result authorization/reconciliation and human-only testing approval remain their separate workflow tasks. A valid container never grants write authority or marks a task Complete.

The checklist is marked complete for RD03. **Next: RD04 — Local Managed Documents and Portable Export, Sol / High**, requiring a new PASSKEY.
