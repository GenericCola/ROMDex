# RI03U — Update Existing Maps Across ROM Builds

Status: implementation complete, installed and verified in ROMDex **0.5.23**, October 20, 2026. The separate acceptance test with two actual ROM builds remains deferred because only 0.6.3 is available.

## What changed

MAPDex now explicitly links builds to a ROM project. A map tile's hover settings menu offers **Update Existing Map**. This creates a separate candidate for comparison; NPCDex stays unchanged until the whole map is reviewed and applied. Confirm uncertain areas/entities and rewritten dialogue side by side. Unique unchanged passages keep their annotations. Missing items default to retention; explicit archival preserves history. Nested relationships, user names/images, notes, flags, planning, fixed task packages and source evidence are retained.

The accepted update stays in the same managed map RDX and uses the same NPCD record identities. Reviewed relocations update parent links with a resumable journal. New local edits invalidate an old preview. Opening an older build does not roll back content automatically. An exact structured request can be confirmed as Appears Implemented, but human testing remains required and tasks stay open. Imported portable testing claims never establish a trusted test pass.

Use **ROM Project → Link ROM Build**, then the selected map's cog → **Update Existing Map → Prepare Update**, resolve the review, and **Apply Reviewed Map Update**. Save Review retains unfinished choices. Use this update route for later ROM revisions; ordinary Prepare Map maintains separate staging and does not silently overwrite an older preparation. Export the current accepted working map from NPCDex.

## Connection Details correction

Background connection/setup retries previously emitted the same modal-opening event on each retry. They now report a setup-needed status without reopening Connection Details. Explicit connection actions and manual Save still provide setup access. Closing with × or Escape survives later automatic retries. The installed check found the already-approved Needs Testing state missing from PMON. With no pending task edits, the existing setup command added that standard state and verified the connection again; existing task values and credentials were preserved.

## Evidence

- 162 focused cases across 15 relevant suites; unchanged unrelated suites were not rerun.
- Actual 0.6.3 ROM: complete 540-area catalog; two independent extractions of the same New Bark Town source preserve 95 records, eight areas and 404 prompt/passage comparisons with no unresolved matches. This is not a two-build proof.
- Controlled cross-build cases cover identity/passage ambiguity, additions, omissions, moves, nested groups, overrides/plans, stale review, rollback and testing/recovery rules.
- Live private YouTrack proof: a fictional 15-record nested map updates through the same registry/issues, relocates an entity, preserves its exact note and confirmed plan, then recovers in another profile. All 16 exact test IDs were removed and verified absent. Production maps/tasks were untouched by this proof.
- Six packaged desktop checks plus three focused desktop connection-dialog checks passed, alongside normal/620-pixel review and Windows Installer validation.
- Complete Data backup and isolated restoration verified 122 files; all three saved credentials decrypted successfully in the protected Windows helper. Data matched exactly after installation and before reopening. All 391 application files match the final package.
- Reopened production retains 299 tasks, 0 NPCDex maps, MAPDex context and remembered connections. NPCDex cloud sync remains enabled for the clean RDX test, exactly as recorded in the pre-upgrade backup; local saves remain enabled. Connection Details is closed.

## Remaining limits

No second real ROM exists yet. Actual cross-build acceptance remains unchecked. Changed fingerprints are supported only when ROM-derived code/layout compatibility validates; arbitrary Pokémon ROMs, changed reader layouts/table sizes and parallel current branches are outside this delivery. Independently prepared/published map merging and coordinated shared-definition migration retain their existing review gates. The user's broader production import/edit/YouTrack round trip and location rendering remain separate acceptance work.

[Operator guide](../../apps/romdex/rom/UPDATING-MAPS.md) · [Design](RI03U-Cross-ROM-Update-Design.md) · [Verification](RI03U-Verification.json); verified installer retained locally in outputs/ROMDex-Installer-0.5.23

Protected recovery: `outputs/Protected/Before-MAPDex-0.5.23/Data.zip` and `Previous-Application-Source.zip`. Keep these. Installed evaluation is 0.5.23; the private updater release remains 0.5.15. This task does not publish a new release.
