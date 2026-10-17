# U20B — Content Project Access and Isolated Storage Proof

**Completed:** October 17, 2026, under U20B's existing PASSKEY. **Installed application:** ROMDex 0.5.7, unchanged. **Next:** U20C — Dynamic Registry Reader and Durable Cache, **Sol / High**, new PASSKEY required.

## Outcome

YouTrack can carry the approved content contracts using readable issue metadata plus versioned JSON/binary attachments and explicit publication manifests. A separate process recovered an interrupted dependent publication, verified every required member, and then replaced the isolated local projection together. This proves the carrier with synthetic data; it does not install a production provider, import saves, validate actual ROM extraction, or establish an agent account's permissions.

NPCD exists on `thegobindsingh.youtrack.cloud`, internal project ID **0-2**, display name **NPCD**, project leader **thegobindsingh**. These owner-created settings were preserved. GenericCola (**2-2**) has direct Project Admin access, including issue creation/update/deletion, attachments and links; changing the leader or cosmetic display name is unnecessary for this proof. PMON remains the separate development-task project (**0-1**).

The complete visible role/team inventory showed only GenericCola and the trusted instance owner with issue access. Registered Users has a global Observer role without Read Issue; no All Users issue grant was observed. NPCD's team has those same two members. Anonymous project and fixture-issue requests returned **401**. Fixture issues explicitly permitted only GenericCola; trusted administrators may still access them. No permissions, accounts, project settings or global configuration were changed.

## Verification Performed

| Check | Evidence and practical limit |
| --- | --- |
| Attachment transfer | Exact JSON, one small PNG payload and a **524,288-byte** binary uploaded and downloaded with SHA-256 verification. This is a measured successful size, not the configured maximum. |
| Stable bindings | Internal project, issue and attachment IDs survived readback; a private PMON fixture task linked to the NPCD registry, and an NPCD child linked to its parent. Existing real tickets were not edited. |
| Pagination | Two-entry pages enumerated attachments across multiple pages. Client guard tests reject oversized pages and duplicate IDs rather than claiming complete discovery. |
| Competing appends | Two overlapping uploads retained different bytes under the same filename. A later Windows process appended a third version against the same semantic base; all three remained available. These used the same owner identity, not separately authenticated agents. No timestamp/filename winner was chosen. |
| Uncertain response | The client deliberately discarded a successful upload response, restarted discovery from its durable intent, and identified the exact accepted bytes without a second upload. This is an injected lost acknowledgment, not a physical network outage. |
| Interrupted dependent group | First process published one member and the group manifest; the second member was absent. After process exit/restart, the last accepted fixture projection remained unchanged until the other member arrived and all pinned bytes and references verified. No atomic server transaction is assumed. |
| Integrity | Actual downloaded contract documents passed independent PowerShell `Test-Json` evaluation. An injected altered download failed its pinned digest; server bytes were not modified. |
| Attribution | Attachment author **2-2** was observed from server metadata. The JSON `actorClaim: fixture:agent` was treated as an untrusted claim and did not establish agent authority. |
| Cleanup | Only four pinned, marked issues were deleted after checking for unexpected comments, links and attachments: **NPCD-1, NPCD-2, NPCD-3 and PMON-324**. Each subsequently returned 404; no active issue with this run's marker remained. Their numbers remain consumed by YouTrack. |
| Credentials | All three protected credential files were byte-for-byte unchanged across each live stage: YouTrack, cloud storage and private update access. No token was logged or re-entered. |

Supporting checks: **16** existing local transport-model checks; **11** fixture-transport guard tests; **24** accepted contract artifacts and **4** invalid artifacts checked independently; **5** actual downloaded artifacts independently schema-checked. Stage/resume/cleanup reports distinguish live observations, injected failures and local projection logic. No browser automation or installer rebuild was needed.

## Carrier Rules for U20C

1. Bind the workspace to the pinned instance/project/registry IDs. Never infer record identity from filenames, summaries or hierarchy position alone. The temporary QA registry was deleted; a production registry must be deliberately created later, not silently substituted with a fixture ID.
2. Append versioned artifacts and explicit publication references. Native issue titles, descriptions and links are useful discovery/organization data; arbitrary edits to them must not silently replace a verified content revision.
3. Pin issue/attachment IDs, exact lengths, digests, workspace/operation IDs, semantic base revisions and server-observed author policy. Parse and validate downloaded content before projection. Enumerate completely, repeat unstable sweeps, and preserve competing versions for review.
4. Keep the durable last accepted projection, pending operations and original semantic bases through offline/restart/retry. An ambiguous accepted write requires rediscovery; do not blindly retry creation or choose the newest-looking file.
5. Publish dependent records locally only when every manifest member is present and valid. Missing/deleted history is a recovery/review condition, not an instruction to remove NPCDex content. YouTrack attachments are mutable/removable storage; append-only behavior is a client discipline, not server immutability.
6. Use bounded transfers and manifests/chunks where necessary. Start no higher than the **512 KiB demonstrated fixture bound**, with smaller normal artifacts. The protected 9.9 MB legacy export and large history entries are not suitable as repeatedly rewritten single issue fields. Full reconstruction, retention, queue/backpressure and capacity handling require implementation and later migration proof.

## Limits and Remaining Gates

**Signed attachment URLs are bearer capabilities.** Fetching one freshly issued fixture download URL without authentication returned 200 with the same bytes, even though anonymous issue/project APIs returned 401. Do not publish or persist these URLs in packages, logs or long-lived bindings. Store stable IDs; resolve/fetch through the authenticated service and expose only the required controlled asset delivery. An already copied signed link cannot be treated as private merely because its issue is restricted. [Official attachment API](https://www.jetbrains.com/help/youtrack/devportal/resource-api-issues-issueID-attachments.html).

**Configured upload ceiling and remaining instance storage are unknown.** The credential's global-settings read omitted these values; a previous direct settings subresource was unavailable. No limit was raised, quota inferred or paid storage enabled. A production upload/capacity failure must leave pending work and the last accepted local data intact.

**Authenticated nonmember/agent denial is not proven.** Only the existing owner credential was used, plus actual anonymous negative checks. No new account or broad token was provisioned. U23 must prove the real agent identity and required ticket/content/asset visibility. These owner-only QA carriers must not be represented as ready for agent execution; private GitHub save access is not a shortcut.

The application's current GitHub-backed NPCDex remains authoritative. U20C is an isolated reader/cache/projection implementation; live source migration and acceptance remain U20E/U20F. Actual ROM files and their mapping/extraction still need their own evidence. Schema success and a reported ROM revision do not prove in-game behavior or permit automatic task completion.

## Evidence

- [Machine-readable live proof summary](U20B-Live-Proof-Evidence.json)
- [Bound project candidate and implementation gates](U20B-Project-Binding.json)
- [Original preflight evidence, retained as October 16 history](U20B-Preflight-Evidence.json)
- [Storage proof plan and final status](U20B-Storage-Proof-Plan.md)

Sanitized stage reports and fixture tooling are archived under the development repository's `docs/project/U20B-Evidence` and `tools/development`. The Windows credential session, protected keys, current Data and full live saves are excluded.
