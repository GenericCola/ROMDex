# NPCDex Initial Cloud Import

**U15 is complete.** The user reviewed and approved the current saved NPCDex revision **73**, and its initial copy is verified in private [GenericCola/ROMDex-Data](https://github.com/GenericCola/ROMDex-Data). The installed application remains **0.5.3**. **Local saves remain primary; continuous synchronization is not active.**

## Preserved Data

The accepted copy contains 4 towns, 23 areas, 128 elements, 193 dialogue points, 448 blocks, 54 characters, 44 plans, 145 history records, 6 Change Requests and 85 annotations. All 159 embedded image occurrences, including historical copies, retain their exact bytes. The current JSON is **9,915,298 bytes**; its cleared recovery record adds 4 bytes. No unresolved recovery copy was selected or overwritten.

The transport preserves the original JSON bytes, IDs, legacy hashes, unknown fields, field order and whitespace. A checked original copy and restartable import session remain in the application's Data/cloud/imports folder. No credential, native task save or unrelated local file was included. All agent-required reports, dependencies and Integration Receipts remain assigned to the future YouTrack workflow.

## Validation and Recovery

All **19 focused tests passed**, covering exact hydration, chunk boundaries, invalid inputs, unresolved recovery, source/staging changes, missing/corrupt remote data, approval identity, concurrent delivery, branch rollback, uncertain outcomes and retry after failed local adoption. Tests used synthetic data; the real save was also round-tripped locally before the approved publication.

The accepted cloud publication used **89 REST requests**, including **25 write requests**, then reconstructed every original byte from downloaded data. A fresh Windows process restored the saved cloud credential and repeated read-only recovery in **32 requests**. Cloud data, the preserved backup and the current local save match exactly. All three protected connections and all **214 installed application files** are unchanged.

The import's completion dialog left an invisible helper process waiting after verification. A guarded cleanup checked the verified result, process path and parent identity before ending only that import helper; the separate-process check then passed. The helper now shows a non-modal success message and closes automatically. No second upload or token entry was needed.

The immutable initial record is `90af156ca7819445a31dcdd394682722458281d5283e0b3cf0da3263d70f80d0`, carried by Git commit `f973ef4c845b610a96e9925e009d4e995ebb55fd`. Publication appends a complete tree using a non-force update and refuses a different existing genesis. The local cloud-seed marker is written only after downloaded data matches the approved original. This import is the semantic base for later edits; it must never overwrite newer local work.

[Verification evidence](U15-Cloud-Import-Verification.json), [source manifest](U15-Source-Manifest.json), [action checklist](NPCDex-ROMDex-Action-Checklist.md).

## Next Task

**U16 — Durable Incoming/Outgoing Sync, Sol / Extra High.** Add the persisted edit queue, incoming revision discovery, retry and restart/offline catch-up using this verified initial record. U17 adds concurrent semantic merge/review; U18–U19 add ROMDex metadata and combined controls. A new PASSKEY is required before U16.
