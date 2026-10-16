# ROMDex Private Cloud Storage Setup

**Task U14 is complete.** [GenericCola/ROMDex-Data](https://github.com/GenericCola/ROMDex-Data) is a separate private save repository. Its workspace identity is initialized, Actions is disabled, and separately scoped save access is protected in the application's Data folder. **NPCDex saves remain local; U15–U19 will implement import and synchronization.** ROMDex remains the installed 0.5.3 build.

## Storage and Agent Workflow

The user approved GitHub for bulk NPCDex data, images, history and substantive ROMDex metadata. YouTrack remains authoritative for tickets and all agent-required Change Request reports, mappings, instructions, source/context, selected images/files and returned Integration Receipts. A handoff must be usable entirely through YouTrack; it cannot depend on access to the private save repository. U20–U27 still define and implement that workflow and its reconciliation/review gates.

The development/releases repository remains separate at GenericCola/ROMDex. No save-repository collaborator or dedicated agent grant was added. The existing development connector is owner-authorized and can access the data repository; it is not the restricted agent identity. U23 must verify the credentials actually used by ticket agents and avoid reusing broad developer access.

The [U04 addendum](U04-Data-Ownership-and-Synchronization-Contracts.md) retains exact NPCDex hashes, immutable records, original offline bases, conservative namespace/whole-receipt conflict review and recovery. Git delivery commits do not redefine the semantic base of an offline edit. Only the approved owner is permitted initially; additional writers require an authorization review. No force-push or automatic destructive history cleanup is approved.

## Verification

Nine focused transport tests passed. Live GitHub tests exercised two competing publications: one succeeded and the other received HTTP 422; retry preserved both immutable records and their original semantic parents. A 512 KiB synthetic binary round-tripped exactly. Existing files survived. Retrying an accepted operation after intentionally discarding its response produced no duplicate commit. The six live checks used 71 REST requests, including 21 content requests, on a clearly named verification branch. The response-loss condition was injected after real server acceptance, rather than caused by a physical network interruption.

Anonymous access was denied. The existing protected update credential successfully read the development repository but received HTTP 404 for both read and write attempts against the data repository. The new save credential positively read the data repository, was denied the development repository and proved write access through an empty temporary branch that was removed. A separate Windows process restored that saved credential and reverified the remote workspace identity.

Both existing credentials are byte-for-byte preserved. All **214 installed application files** still match the 0.5.3 delivery manifest. The observed local state remains **299 tasks, 0 pending operations and NPCDex revision 72**. No real save, image or credential was uploaded. The data repository contains only initialization metadata and synthetic verification records. No Actions, LFS, paid service, billing change or global YouTrack change was enabled.

The actual YouTrack subscription, remaining capacity and upload ceiling remain unverified. The current instance rejects anonymous issue reads, and its Guest account is banned. These facts do not establish every future ticket-agent permission or a transfer ceiling; YouTrack handoff size and access must be checked before publication at U20–U23.

[Verification evidence](U14-Storage-Verification.json), [revised provider comparison](U03-Free-Cloud-and-YouTrack-Storage-Comparison.md), [action checklist](NPCDex-ROMDex-Action-Checklist.md).

## Next Task

**U15 — Previewed NPCDex Cloud Import, Sol / High.** Refresh the current working data, preserve exact original bytes and history, implement a previewed import and obtain migration acceptance before changing the save destination. A new PASSKEY is required. U14 did not start U15 or claim that either workspace now has the new cloud synchronization.
