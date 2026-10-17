# Proposed Scheduling Adjustment — U20C1

**Prepared:** October 16, 2026. **Status:** scheduling contingency, not adopted. The user subsequently reported that the instance owner is arranging project setup and withdrew the request to divert work. Retain this proposal as reference; continue U20B and the original U20C sequence. No U20C1 implementation was authorized or started.

## Recommendation

Split U20C into two separately reviewable tasks. Bring forward only the reader/cache work that depends on the accepted U20A domain contracts, rather than on an unproved YouTrack attachment layout. Keep actual storage transport, permissions and migration behind their existing gates.

| Task | Scope | Prerequisite | Model / Effort |
| --- | --- | --- | --- |
| U20C1 — Independent Content Reader, Cache and Preview | Provider interface, validated record loading, isolated durable cache and a read-only NPCDex preview from synthetic contract data. | Approved U20A; new task-specific PASSKEY. Can run while U20B awaits the owner. | Sol / High, as assigned to U20C. |
| U20C2 — Live YouTrack Reader and Integration Proof | Implement the carrier adapter proved in U20B, connect the reader and verify native changes, permissions, real discovery/restart and shared sync controls using isolated data. | U20B passed and U20C1 accepted; separate PASSKEY. | Sol / High. |

U20C remains incomplete until both parts pass. U20D onward retain their current prerequisites. If U20B requires a revised storage design, review any effect on the interface before changing accepted contracts.

## U20C1 Action Plan

1. Define a narrow injected provider boundary for discovering publication/reference metadata and reading pinned record/asset bytes. Keep YouTrack issue fields, pagination mechanics, tokens and endpoints outside the reader.
2. Implement structural/hash/identity/reference validation and read-only assembly from accepted records. Use supplied synthetic fixtures, extending them within the approved schema for shared profiles, local appearances, gender/global references and planned/archived content as needed.
3. Persist verified records/assets and the accepted projection in an explicitly isolated test profile. Preserve the last verified view through restart, missing dependencies, damaged bytes and incomplete publication groups. Report pending/review conditions without claiming a live connection.
4. Produce a read-only preview using familiar NPCDex presentation where practical. Verify record changes can refresh displayed sample content without embedding a new baseline in the page. No live source switch, production save edits or new planning-write UI.
5. Test cache recovery, stable identities, complete dependency groups, asset integrity and repeated reads. Record what the model/provider fixture establishes and what still requires actual U20B/U20C2 server tests.
6. Report the isolated deliverable, update U20C1's checklist and stop. Do not automatically resume U20B, begin U20C2 or proceed to another task.

## Exclusions and Acceptance Boundary

No new YouTrack project or permission, real ticket/attachment mutation, live provider activation, credential access, installed application upgrade or data migration. The current GitHub-backed NPCDex remains authoritative. This is reusable reader/cache/projection work, not a substitute storage service or a claim that U20B passed.

Acceptance requires a working isolated reader/cache/preview and appropriate checks against synthetic data. Full legacy-data projection/migration remains a separately verified U20E gate; this preview cannot certify the latest real save or ROM mapping. Any live storage assumptions remain explicitly provisional until U20B.

**Suggested next authorization:** `PASSKEY — Proceed with U20C1`, using **Sol / High**. No U20C1 implementation has begun.
