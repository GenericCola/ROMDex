# U03 — Free Cloud Provider Comparison

**Completed and user-approved:** October 14, 2026.  
**Authorization:** U03 PASSKEY and explicit approval of the concrete YouTrack-first recommendation.

## Result

Use **existing YouTrack-first cloud storage** for NPCDex saves/assets/history and ROMDex metadata, with restricted access and versioned change batches/checkpoints. Prefer private YouTrack installer delivery if actual artifact size and instance limits permit; private GitHub Releases is the conditional fallback. No new cloud platform is selected for provisioning.

[Approved Comparison](U03-Free-Cloud-and-YouTrack-Storage-Comparison.md) · [Measured Inventory](U03-Data-and-Capacity-Inventory.json)

## Confirmed Requirements

- Exclude payment methods and usage-based billing, even when expected use would fit an included allowance.
- Keep installers/update files private.
- Avoid a routine weekly inactivity pause.
- One owner initially; possibly a second person, ten at the extreme. Access to additional people remains a later explicit decision.
- Project-administration permission on the PMON instance is uncertain; setup must check it, with a restricted-container fallback assessed if necessary.

## Findings and Deliverables

- Measured NPCDex revision 72: 13,221,699-byte complete export; **3,843,217-byte gzip** of its exact original bytes. Unique embedded images total **541,023 bytes** across 39 contents, including historical images.
- Measured the saved ROMDex cache at 299 items and its candidate cloud metadata at **41,639 bytes**. No current pending operations were recorded.
- Compared YouTrack, Supabase, Appwrite, Convex and Cloudflare; excluded Firebase Storage/R2 billing-enabled paths. Reviewed current inactivity policies separately from headline capacity.
- Established a feasible supported-attachment route within YouTrack's published default size allowance, while explicitly leaving actual license/space/permissions/large-transfer validation for setup.
- Recorded immutable publication/branch recovery as the direction for U04 to prove. A read-then-overwrite latest file is not accepted as a concurrency solution; no merge algorithm was implemented here.
- Separated workspace storage from private installer requirements, notification/consent, signed release manifests and credential scopes.
- Updated the Action Plan, scope, decision log and checklist. U14 now targets restricted YouTrack storage/access setup; U13A/B verify actual private release delivery requirements.

## Verification and Limits

Used current official JetBrains, Supabase, Appwrite, Convex, Cloudflare, Firebase and GitHub documentation, cited beside claims in the comparison. Independently checked source-file stability, compression round-trip and capacity calculations; verified local document links and the unchanged 0.4 source/installed release hashes.

This task changed planning artifacts and local measurement helpers only. No application code, current save, token, profile or immutable backup was changed. No account, project, issue, YouTrack app, payment method, repository, publication or live upload was created. Browser UI testing and application test reruns were unnecessary for this research-only task.

Actual plan/remaining space, private visibility, upload limits, project permissions and API large-save behavior are **not verified** by this report. The approved choice is gated by those checks and by U04's conflict-safety proof. R08's earlier small real file-transfer checks remain evidence of the existing adapter, not a test of the new save system.

## Next Approval Boundary

**U04 — Data Ownership and Synchronization Contracts**, recommended **Astra / High**. Define and review the safe YouTrack-backed protocol, field/data ownership, assets, offline/concurrent edits, operation identity, retention, receipt limits and migration/recovery. Await a new PASSKEY. No U04 work has begun.
