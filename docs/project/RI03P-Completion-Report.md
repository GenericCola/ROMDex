# RI03P — Map Cloud-Delivery Performance

Completed in source on October 20, 2026 under the user's PASSKEY. MAPDex retains its approved name. No installer or production Data/queue/credential change is part of this task; the explicit NPCDex cloud sync pause remains in force.

## Result

The same verified 1,001,582-byte ROM-only Violet City RDX requires **600 old-layout object attachments / 8,347,287 payload bytes**, versus **209 new-layout attachments / 2,926,272 payload bytes**: about **65% fewer files and payload bytes** before the commit. Two compressed registry deliveries replace hundreds of small uploads. Record/mapping artifacts stay on their native tickets, with the same stable identities and hierarchy. Prior immutable objects remain at their original references; maps are not combined.

This is a deterministic same-input comparison. RI02C's earlier 604-chunk figure included extra local edits/history. No old-layout live reupload or repeated ROM extraction was performed. A local full-map model reconstructed every source/image/history byte exactly; its complete commit is 305,820 bytes, within the existing 512 KiB bound.

Record discovery is reused within each cycle. Native metadata snapshots are freshly batched, with complete comment evidence and shared-record fallbacks. Attachment metadata is fetched at most eight requests concurrently, for both document reconstruction and shared-context pin checks; at most 256 inventories are prefetched, with remaining required inventories using the existing lazy route. Current identity/author/size/update checks, private ownership, native review and conflict/ancestry guards remain mandatory. No budget is raised.

## Full-map proof and recovery

The initial helper delivered all 595 logical objects for all 134 records but hit its cycle time limit in serial attachment verification. That older reader was stopped only after its durable checkpoint was inspected. The existing Windows host resumed the same uploaded files with bounded parallel verification. It did not repeat map publication or create a second set of 134 records.

The resumed full-map run verified exact data, local note/flag preservation, a reviewed native title edit and human-testing obligations. An initial helper assertion incorrectly required identical top-level revision hashes after a valid import merge. The final checker compared current records, feedback, mappings, views and every retained asset/history byte instead; all were preserved in the independent profile. All 135 exact owned proof IDs were then confirmed absent. The initial attempt plus diagnostics/restart reached recovery after 1332.2 seconds measured from the first helper launch; this includes interruption and human launch wait and is **not** a clean cold-publication benchmark. Initial HTTP totals were not persisted before restart and are not invented.

| Operation | Wall time | Requests | Writes | Uploaded bytes | Downloaded bytes |
| --- | ---: | ---: | ---: | ---: | ---: |
| Resume verified queued delivery | 33.6 s | 276 | 0 | 0 | 507,108 |
| Existing local note / idempotent check | 40.0 s | 109 | 0 | 0 | 289,484 |
| Unchanged synchronization | 40.1 s | 109 | 0 | 0 | 289,484 |
| Reviewed native title delivery | 67.4 s | 210 | 3 | 367,685 | 1,479,641 |
| Second-profile recovery | 138.6 s | 486 | 0 | 0 | 3,473,890 |

These measurements used parallel reconstruction checks; the separate shared-context path was subsequently given the same bounded prefetch. A row with zero writes is an idempotency/no-change check, not a claimed fresh update.

## Final-code routine-sync check

The final shared-context correction was measured on the same complete 134-record map and existing backend tree. The host checked unchanged synchronization, persisted a fresh note/critical flag, delivered it, and accepted the resulting update on the second instance. No new map or repeated full-map publication was used. All 135 exact owned test IDs were confirmed absent after these final checks.

| Operation | Wall time | Requests | Writes | Uploaded bytes | Downloaded bytes |
| --- | ---: | ---: | ---: | ---: | ---: |
| Unchanged synchronization | 9.3 s | 109 | 0 | 0 | 290,188 |
| New local note/flag delivery | 34.8 s | 209 | 3 | 363,480 | 1,473,677 |
| Incoming update on second instance | 58.4 s | 276 | 0 | 0 | 834,304 |

These are full-map final-code measurements, not guaranteed response times. The editor-read plus local-checkpoint preparation measured 19.2 seconds separately; this is not a native typing/render-latency measurement. Wall times include validation, local checkpointing and backend latency. Counts cover each listed cycle, excluding initial binding preview, the helper's deliberate native title write and cleanup. Unchanged synchronization sends no writes. Further full-map/native concurrency acceptance remains U28–U29; real network latency is not guaranteed.

## Loading bar and honest state

The user clarified that initial setup may take longer if a loading bar is visible, while routine synchronization should be agile. MAPDex now shows an indeterminate bar immediately during local handoff, then counted record/object publication progress with a separate final verified-commit step. Queued, manual, paused, review and remote-confirmed states remain distinct. Pausing cloud sync does not prevent the local handoff bar from working. Polling only publication status preserves editor focus and existing selector nodes.

Five source-UI behaviors passed at normal and short window sizes; screenshots were inspected locally and excluded from Git. Progress/state tests also cover local handoff, paused/manual waiting, errors, unbound staging and final confirmation. A failed attempt does not become a last-successful-sync timestamp. Native installed-window/installer acceptance is not claimed here.

## Preservation, compatibility and checks

- New intents use cloud commit version 2, while version-1 commits remain readable and frozen version-1 intents finish unchanged. Old clients must be upgraded before sharing a version-2 cloud head. Portable `.rdx` formats do not change.
- Packs are bounded to 512 KiB encoded and 4 MiB decoded, with encoded/decoded/object hashes, exact lengths/offsets and trailing-byte checks. Warm-cache missing/changed attachments and conflicting references still block acceptance.
- Durable slots, uncertain-response review, commit-last readback, cancellation, three-no-progress holds, concurrent branches and stale-review guards remain in force. No history is pruned; no unsent file is silently declared delivered.
- **61 distinct targeted tests**, ten source/test syntax checks, the full-map exact-byte model, five source-UI behaviors and the curated bundled-runtime check passed. Electron 44.7.2 / Node 24.21.0 loaded the source payload and pack decoder. A corrected test-only timestamp expectation was rechecked in isolation. No broad regression suite was repeated.
- Source extraction coverage remains the supplied ROM/Violet City proof. Installed 0.5.15 and its repairs, saved connections, local saving and paused NPCDex production queue are unchanged. RI03C owns broader/build/identity feature acceptance; U28–U30 retain integrated/native acceptance and release.

Next: **RI03C — Coverage and Integrated Feature Acceptance, Sol / High**, requiring a separate PASSKEY.
