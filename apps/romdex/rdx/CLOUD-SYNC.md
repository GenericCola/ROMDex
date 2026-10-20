# RDX Document Bindings and Two-Way Sync

RD07 introduced this adapter; RD10 subsequently adopted existing maps. [RI03P cloud delivery](CLOUD-DELIVERY.md) is complete in source, with real map round-trip and routine-update measurements. Installed production remains 0.5.15 plus its repairs, with NPCDex cloud sync explicitly paused. Historical RD07 acceptance notes below are not a fresh migration requirement.

## NPCDex Maps

Import a map locally through Tray 2 settings → **Import RDX Map**. Importing creates no backend records. To publish, choose **Publish Map to YouTrack**, review the instance/project, registry, exact document revision and included records/dependencies, then explicitly confirm **Bind This Map to YouTrack**. The host rechecks that preview against the actual file and backend before binding.

The current adapter is pinned to the approved NPCD project and GenericCola account on the existing YouTrack instance. It creates a private, marked RDX registry and content records with their native parent links. The existing production catalog is not imported, rewritten or recreated by this action. Bindings remain separate from portable files and contain no token. A second local instance can import the same portable file, review the discovered registry and explicitly establish its own verified binding.

With Auto-Sync On, bound maps synchronize in the background. Save Changes performs a manual incoming/outgoing cycle with Auto-Sync Off and leaves it Off. Local edits checkpoint before network work. **Review RDX Sync** shows conflicts, native metadata evidence and frozen-delivery recovery; **Synchronize Map Now** performs an explicit cycle. Pending/review states contribute to the shared save/connection indicators. Lifecycle suspension cancels automatic work and preserves its durable intent.

Accepted backend document revisions merge through the same stable-ID/ancestry checks as file imports. Independent updates survive; overlaps require observed choices. Concurrent cloud branches are retained and explicitly joined, never resolved by timestamp. An accepted incoming revision checkpoints into the managed RDX before export. Native title changes require a documentation-correction choice; unrelated ticket prose is evidence, not executable NPC content. Native parent changes require a complete membership update rather than an automatic move. Agent-result documents cannot enter through this route; task-bound result reconciliation remains separately gated.

## ROMDex Task Plans

The existing reviewed plan queue still publishes PMON tasks, fields, comments and attachments. Accepted native/Work Pane changes now fold back into the managed plan: task values, mapped fields, comments, exact file bytes and representable hierarchy changes. Independent local edits remain; overlaps appear under **Import Plan RDX → Review Native Plan Changes**. Shared Save Changes opens the relevant review, and unresolved changes keep the save indicator in its attention state.

On another instance, choose **Existing Task Match** in the placement preview to match each portable task explicitly to verified PMON records. Differences require choices. The host reads current task details, comments and attachment hashes before binding; it does not trust issue IDs supplied in a file or guess from titles. Verified existing comments/files are marked delivered, preventing reposts. Existing bindings cannot be silently reassigned or claimed by a different local plan. New task creation remains the default for unmatched tasks.

Native deletions/missing targets, moves outside the plan's scope, unsupported values and ambiguous identities enter review instead of resurrecting or dropping data. Export waits for known incoming updates/reviews to finish, so an old file is not presented as fully current. Original author/date evidence is retained without impersonation. Incoming native comments/files are marked as delivered and do not become duplicate outgoing operations on reimport.

## Incremental Storage and Recovery

Cloud storage factors the canonical document into immutable artifacts and small reference tables. Exact canonical historical documents are factored too, retaining their original reconstructable bytes. Assets retain exact bytes and hashes. Only new objects are uploaded; manifests reference verified prior objects and commit last. This avoids uploading the complete save/history on each edit. Record artifacts live on their bound records; remaining objects live on the registry.

The local binding journal freezes the document revision, parents, issue/link/upload identities and confirmed slots before sending. A lost response is discovered and verified before retry; an unresolved outcome stays visible. Fresh metadata checks guard cached immutable bytes. Verified cloud manifests and native file bytes are cached durably; transfer checkpoints resume from that cache. Three checks without delivery progress pause automatic delivery while retaining the intent. Incoming checks and healthy services continue independently.

Working files still use `Data/RDX/working/<document-key>.rdx`. Export contains current content, exact images/files, feedback and retained history; it does not contain credentials or authoritative writable backend bindings. Original imported files remain unchanged.

## Deliberate Limits

- The adapter currently targets the approved owner-only NPCD/PMON instance, not arbitrary projects/accounts. Local RDX use remains independent of a connection.
- Cloud commits are bounded to 512 KiB, 10,000 referenced objects, 1,000 historical manifests, 16 concurrent branches and 16 MiB cumulative manifest metadata. Individual chunks are at most 512 KiB; response/cycle/request budgets and the managed 2 GiB quota remain enforced. Bound failures preserve local data and require review; history is not silently pruned.
- Native plan reconciliation processes ten changed tasks at a time, at most 100 files on one task, with 50 MiB/file and 64 MiB of newly read file data per cycle. Verified cached files permit resumed reads. Larger or unsupported scopes stop visibly. An unchanged unresolved plan conflict does not trigger another automatic download loop.
- Shared-context attachment changes made through another document stop publication for coordinated review. Different native pins across concurrent branches and record rebinding also stop; they are not silently selected or duplicated. This is not a general cross-map conflict-resolution UI.
- Existing task bindings recover through the normal save-review mechanisms. An uncertain/missing task or a discarded operation is never guessed or blindly recreated.
- Current production maps were adopted through RD10 with their NPCD identities preserved. The new-map creation route is not a migration shortcut.
- This task proves fictional map data on the real backend. It does not prove ROM extraction or authorize agent execution, human-test completion, an installer update or production adoption.
