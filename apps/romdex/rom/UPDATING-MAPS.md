# Update an existing NPCDex map from another ROM build

Introduced in ROMDex 0.5.23. Design approved October 20, 2026. Actual two-build acceptance remains pending because only 0.6.3_noduplicates.nds is available.

## Using the workflow

1. Open a supported ROM in MAPDex. Under ROM Project, create/name the project on first use. For another build, select the existing project and choose Link ROM Build. This records an association; it changes no NPCDex content. One logical map has one current version in that project.
2. Select the map in Tray 1. Hover over its tile and open the standard settings cog → Update Existing Map. Choose the existing NPCDex target and Prepare Update. Its areas and entities are extracted into a separate local candidate. Original adoption journals and shared definitions used by other maps require their existing coordinated review paths.
3. Compare uncertain old/new areas and entities by location, sprite, dialogue and optional source evidence. Choose Same Item, New Item or leave unresolved. Matching names, slot numbers, filenames and game codes do not establish identity across builds.
4. Review changed prompts and passages. Unambiguous unchanged passages keep annotations automatically. Rewritten passages need confirmation. Unmatched notes and flags retain their original text and history. Unobserved records default to retention; explicit archival keeps their history.
5. Review the whole map. Resolve conflicting local/ROM text, and inspect additions, relocations and missing records. Names, images, nested groups, notes, newer plans and original evidence remain protected. Exact structured requests may appear as Appears Implemented; confirming one records implementation and still requires human testing. Prose-only requests require manual review. Fixed task packages and their authorization remain unchanged.
6. Acknowledge the review and Apply Reviewed Map Update. NPCDex stays unchanged until this action. A newer local baseline invalidates the preview and requires a refresh. The same managed map file and NPCD issue identities are retained. Auto-Sync and an explicit NPCDex sync pause are honored; local success and remote delivery are reported separately.
7. Test the affected content in-game. MAPDex → ROM Update Testing lets you review an accepted local update and record the tested build, notes and pass/fail. Existing indicator lights show pending testing on affected content and related tasks. A changed affected revision invalidates the prior pass. Testing never automatically completes a task. Task completion also waits for verified delivery of the updated map; a local pass cannot waive pending cloud publication or unrelated accepted-result obligations.

Save Review and Close retains progress locally. Resume Map Update Review restores it, including after restarting the app. Discard Review preserves the current NPCDex map. Opening an older ROM is inspection; restoring its content requires this same explicit review. Parallel current branches are outside the first version.

## Storage, compatibility and recovery

The ROM is opened read-only. Preparation/review lives under Data/<project>/ROMImport with a separate managed RDX store. Accepted content is checkpointed into the existing NPCDex map's working RDX under Data/<project>/RDX. Export RDX produces a portable copy; each RDX still contains one parent map with nested areas and entities.

The portable file carries versioned ROM-project/build association, reviewed source identity bindings, exact prior document/source evidence and a source baseline. The cross-build capability makes older validators reject unsupported update semantics explicitly. The temporary candidate's unrelated document identity is not embedded as a second map. Local human-testing authority is private application evidence; importing an RDX never establishes a trusted test pass on another installation.

The known 0.6.3 reader establishes a layout signature. A changed fingerprint can reuse it only with matching ARM9 code outside the map-header table, matching required overlays and the same table dimensions, followed by full bounded inventory/extraction validation. This supports reviewed changes within that validated layout, such as archive content and existing header data. Changed code, relocated tables, a different map count or unsupported compression require a reader-profile review. Linking builds does not waive compatibility checks. Broader Pokémon ROM support is separate work.

Local application uses the established durable RDX journal. A crash after application but before the review-state checkpoint is recognized from private acceptance evidence. Reviewed native parent moves preserve issue IDs and use durable before/remove/add/readback checkpoints. Unexpected native parent, summary, comment, ownership or visibility changes stop delivery for review. YouTrack does not provide an atomic transaction over the whole map; the cloud commit is published only after verified content and parent pins. The link operations follow the [YouTrack link API](https://www.jetbrains.com/help/youtrack/devportal/operations-api-issues-issueID-links-linkID-issues.html).

## Verification limit

Current verification uses the real 0.6.3 ROM and explicitly synthetic cross-build cases. It does not prove extraction compatibility with an unseen future build. The roadmap retains an unchecked test using two actual supported ROM revisions when another build becomes available. Existing production NPCDex sync remains paused unless the user explicitly resumes it.
