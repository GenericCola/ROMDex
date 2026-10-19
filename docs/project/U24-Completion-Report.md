# U24 — Durable Returned RDX Discovery

**Completed in source:** October 19, 2026. Installed ROMDex remains **0.5.15**. No installer or production migration was performed.

## What Changed

ROMDex now checks tasks linked to locally recorded fixed Map Packages for returned `.rdx` files. It verifies native task/project identity, downloads from fresh same-instance attachment addresses, validates the container/map/package/base and declared outcome membership, and retains exact bytes plus server-reported provenance in the existing SQLite store. It does not apply the returned work.

Background discovery follows Auto-Sync. **Check for Returned Files Once** in Map Package Delivery performs one bounded read cycle while Auto-Sync is Off; manual Save also checks returns. Neither changes the toggle. Existing result files are audited periodically, and explicit checks reread them. Identical bytes share one blob and one display entry while retaining every attachment identity.

Interrupted downloads retain an intent and retry with backoff. Staging bytes, validation evidence and status is atomic. Rechecking after a missing local dependency can recover without losing earlier validation evidence. Shutdown, suspension and update preparation cancel/drain discovery before closing storage. No filenames or file-supplied agent labels grant authority.

Preauthorization files, superseded/withdrawn packages, altered or removed attachments, changed pinned package files, missing/different server authors and conflicting result identities are held for review. Pending/conflicting authorization metadata defers eligibility. Safe staging is distinct from implementation, application and human testing.

## Verification

- **152 affected automated checks passed**, covering discovery, handoff, package delivery/navigation, managed storage, desktop lifecycle/policy, runtime identity and paused startup. The final additional pin-preservation guard is covered by the **41-check discovery recheck**, which also passed. These runs overlap; they are not 193 distinct checks.
- **Nine focused source UI checks passed** in headless Chromium, including manual discovery with Auto-Sync Off, duplicate display/provenance, untrusted names rendered as text, deferred authorization and footer layout at 620-pixel window height.
- **Four source-service checks passed:** initialization without network access, native manual/status routing, stale-map rejection, and lifecycle drain/checkpoint/shutdown.
- **Actual Windows/YouTrack proof passed:** a private synthetic task, **PMON-330**, received a synthetic returned RDX. The actual reader verified task/project/server attribution, downloaded and staged it, survived closing/reopening SQLite and reused it on recheck. Task fields, map head, Auto-Sync Off and remembered connection bytes were preserved. The test task was deleted. No production saves or NPCD records changed.

The live proof used the approved existing GenericCola connection and isolated authorization history with synthetic synced readiness. It does not establish a separate agent identity, a production authorization-metadata rollout, correct ROM behavior or a human in-game test. Subsequent local checks cover the final pinned-file guard; no redundant live upload or installer run was needed.

See [verification](U24-Verification.json), [implementation checklist](U24-Implementation-Checklist.md) and [discovery/storage guide](../../apps/romdex/rdx/RETURN-DISCOVERY.md). Private source-backup identity is recorded separately after verification.

## Limits and Next Task

Discovery needs a local fixed-package ledger and its retained baseline. A file on an unrelated task is not imported. It stages at most four linked tasks/eight downloads/64 MiB per cycle, with a 50 MiB file limit and 128 MiB decoded RDX limit. Oversized or unrecognized returns remain visible for review. Evidence is never silently pruned to satisfy a capacity limit.

**U25 — Validated Independent/Grouped Result Application, Astra / High** is next. It must freshly establish authorization/provenance, enforce actual patch/write scope and dependent-group atomicity, and reconcile NPCD plus managed files with durable recovery. U24 staging is not that approval or application. Human review controls remain U26; the flashing-amber Needs Testing status and human-only completion gate remain U27.

A new PASSKEY is required before U25.
