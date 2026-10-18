# NPCDex Content Backend — Acceptance Build

NPCDex reads its validated content from private NPCD records in YouTrack. The original imported export, images, identities, plans, notes and history remain recoverable. GitHub's former NPCDex namespace is recovery history; it must not become a second active save authority. ROMDex's separate metadata still uses its existing cloud service.

## Editing

Use **Plan Changes** for proposed ROM work, **Flags & Notes** for observations/testing, **Correct Documentation** for an explicit correction to recorded current content, and **Add Character** for a Planned Addition. A tile's settings cog opens its recorded-content editor. Corrections require a reason and source evidence. Shared profile corrections require acknowledgment of their effect on other appearances. Ordinary plans do not change current dialogue or certify implementation.

Text fields, dropdowns and text areas share inner padding. Obsolete disabled mutation forms are hidden; they cannot write browser-only saves. Existing images and view/navigation are preserved. Unfinished editor drafts are restored when reopening their menu. A draft in another editing mode must be resumed or discarded before starting a different form. Merely opening and closing an untouched form does not create an empty draft.

## Native YouTrack Changes

Validated structured publications update the display dynamically. An arbitrary title, comment, description or parent-link change is a visible review condition, not an instruction to rewrite content.

**Review Sync** shows the observed native title and metadata fingerprints. For supported content records, review every detected change together, choose whether to adopt a changed ticket title as the recorded content name, and supply a reason/evidence. Keeping the content name acknowledges only the observed ticket context. The correction retains before/after fingerprints and history; comments and description text do not become dialogue. A second native edit invalidates the earlier review. Parent-link moves need a complete validated membership update or restoration of the native link. Technical registry/original-evidence changes are not adopted through ordinary editing.

## Save, Recovery and Limits

Auto-Sync Off pauses automatic reads and writes. Save Changes runs one synchronization cycle and leaves Off unchanged. Offline edits are durable before delivery. Interrupted responses are rediscovered by exact identities and bytes; uncertain writes are not blindly repeated. Review retains competing versions and original offline intent. Pending forms and queued edits remain distinct.

Application saves and remembered connections live in the application's Data folder. Upgrades preserve that folder and uninstall leaves it in place. A protected complete Data backup must precede the upgrade; restoration checks use an isolated copy, never a stale save over current work.

The established bounds remain: 512 KiB image/chunk uploads, bounded image dimensions, 1 MiB edit requests, 256 MiB cache payload, 200 pending operations, 32 recent completed operations plus retained older history, and 1,000 publications per registry scan. No automatic remote-history pruning is enabled. Server quota/upload settings remain unknown. ROM mappings remain Unresolved without source evidence. Map packages, agent handoff, implementation acceptance and human-tested task completion remain later phases.

Verification and release status are recorded separately in the U20F completion report; this guide does not claim checks have passed before their evidence exists.
