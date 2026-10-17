# U20B — Content Project Access and Isolated Storage Proof

**Authorized:** October 16, 2026, by a new user PASSKEY following approval of U20A. **Completed:** October 17 after the instance owner created NPCD. The [completion report](U20B-Completion-Report.md) and [live evidence](U20B-Live-Proof-Evidence.json) supersede the earlier prerequisite status below. Project 0-2, owner-account Project Admin access, private fixture transfers, competing appends, restart recovery and cleanup are verified. Installed ROMDex remains 0.5.7. Existing GitHub-backed NPCDex remains authoritative; U20C needs a new PASSKEY.

## Execution Order

1. Recheck the actual owner/instance, visible project/group/role grants and accessible upload/storage settings. Preserve all three saved credentials. Record inaccessible settings as unknown, not as unlimited capacity or permission denial.
2. Establish a concrete content-project target and reviewed access boundary. Proposed project name **NPCDex Content**, key **NPCD**, on the existing thegobindsingh.youtrack.cloud instance, owner GenericCola. These are configuration candidates, not an already created project. If unavailable, stop for instance-owner assistance; do not grant global rights or silently switch to PMON/GitHub as the content backend.
3. Before fixture publication, verify private access and exact IDs. Keep the new Content records outside the PMON task tree. Do not import current NPCDex saves. No new users, paid services, global limits, Actions or billing changes.
4. Use marked synthetic issues/assets only, with a separate fixture workspace and exact operation IDs. Prove stable record/asset binding, cross-project access, pagination, byte verification, author attribution, independent competing writers, uncertain-response rediscovery and interrupted dependent-group publication. Test actual permission limits honestly; an owner identity is not a restricted agent identity.
5. Compare the physical carrier with U20A's contracts and current measured inventory. Choose readable issue metadata plus versioned attachments/manifests only if discovery, attribution, retention and recoverability satisfy the proof. Do not assume generic conditional writes or atomic multi-issue updates.
6. Record live versus simulated results, retained fixture IDs/cleanup state, measured limits and remaining access gates. Update the checklist and stop before U20C. A failed prerequisite remains an unresolved gate; fixture success alone cannot complete U20B.

## Initial Read-Only Findings — October 16 History

The connected YouTrack tools authenticate as GenericCola and can read PMON (Pokemon), led by thegobindsingh, with two team members. A project-name/key search for NPC returned no visible projects. These tools do not expose effective permission inspection, project creation, raw attachment transfer or server-capacity inspection; they are insufficient for the required live transport proof.

A normal Windows helper will use the existing Windows-protected YouTrack credential in memory for GET-only preflight. ROMDex can stay open. The initial probe creates no project/issues, uploads nothing, changes no account/permission and logs no token. Follow-up mutations are not built into that initial probe and require reviewed scripts restricted to this task.

## Initial Preflight Result — October 16 History

The user launched the helper. Current server reads confirmed GenericCola (`2-2`), PMON (`0-1`), inherited group roles, and anonymous denial (401). The first user-groups subresource was unsupported; the follow-up used documented group/member resources and completed the visible membership inventory. Owner and inherited visible roles contain no Create Project permission. A single reviewed POST for the empty NPCDex Content / NPCD project returned **403 Forbidden**, definitively establishing that this credential cannot perform the required creation. Saved credential bytes were unchanged.

System upload/storage settings remain inaccessible: the global-settings response omitted system settings, its subresource returned 404, and no remaining-storage value was exposed. These are unknown limits, not a failed transfer-size test. No instance-wide configuration was changed.

The local attachment/publication model passed **16 checks**; the protected checkpoint has **39 unique embedded-image byte objects totaling 541,023 bytes**, with the largest **75,755 bytes**. Its full saved document is **9,915,298 bytes**, including substantial history and repeated embedded-image occurrences. This supports testing small per-entity artifacts rather than repeatedly uploading the full export; it does not establish the server quota or projected issue count.

## Owner Step — Satisfied October 17

Create **NPCDex Content**, key **NPCD**, on the existing instance; set **GenericCola** as project owner. Limit issue access to the owner and trusted instance administrators. Do not add broad Registered Users/All Users issue grants, new accounts or global privileges. Leave it empty. Once visible, U20B will pin the actual project ID, inspect its roles/visibility and proceed only with marked synthetic fixtures. If the owner cannot provide this, review the backend direction with the user; no silent fallback is authorized.

The owner created NPCD with its own display name and leader; direct GenericCola Project Admin access satisfies the functional prerequisite without changing these owner choices. Live attachment round-trip, cross-project links, overlapping writes, separate-process stale-base retention, lost-acknowledgment rediscovery and interrupted dependent publication subsequently passed. All four QA issues were deleted. Restricted authenticated agent access remains U23's explicit gate; configured quota remains unknown. See the completion report for the full measured boundary. No U20C implementation or content migration has begun.

**Scheduling note, October 16:** the [U20C1 contingency](U20C1-Independent-Reader-Plan.md) was proposed while the owner was unavailable, then left unadopted when the user reported that setup is underway. Continue U20B and the original U20C scope. The user separately requested a review ZIP containing the verified installer and documentation; packaging does not perform a content-project retry, migration or provider change.

## Evidence Boundaries

- Public API documentation establishes supported operations, not the account's actual grants or the instance's capacity. [Project creation requires Create Project](https://www.jetbrains.com/help/youtrack/devportal/resource-api-admin-projects.html).
- Visible assigned roles may omit roles the reader is not allowed to inspect. Absence of a listed grant is not a definitive permission check. [Assigned Roles permissions](https://www.jetbrains.com/help/youtrack/devportal/resource-api-assignedRoles.html).
- Mark incomplete pagination, null authors, missing dependencies, uncertain writes, altered history and inaccessible settings explicitly. Never acknowledge unsafely delivered work.
- Local models exercise client assumptions; they do not prove a live server supplies those assumptions. Production migration is U20E and still needs a preview and acceptance.
