# R03 — Toolbar, ESC Behavior, and In Development

**Completed:** October 14, 2026, under user PASSKEY and subsequent scope additions.  
**Checklist:** [Action Checklist](NPCDex-ROMDex-Action-Checklist.md).  
**Build:** ROMDex 0.3.0 working installation plus R01–R03 patches. Original release ZIP and protected baseline backups remain unchanged; R08 packages the enhancement release.

## Delivered Behavior

- Moved the single **+ Add Item** action into the Work toolbar. Moved the yellow completed-filter button to the right, with matching 29 px control height and heavier text.
- Filter action reads **Hide Completed** when items are visible and **Show Completed** when hidden. Its indicator is steady grey when filtering is Off and flashes red when completed items are hidden. Preference survives reload.
- ESC first clears Work selection/editing focus while preserving the chosen Epic/Saga/Story/Verse scope. With no selection or field focus, ESC toggles Details Collapsed ↔ Default. Menus, modal dialogs, drag/resize cancellation, and draft cancellation retain precedence.
- Notes and per-item unsent comment drafts survive clearing selection. Comment drafts are retained in-session, not across a reload, and are never automatically posted. Cancelling a blank title restores its saved value; cancelling an uncommitted new item does not create an empty ticket.
- Added **In Development** with a flashing purple indicator. Final menu order: **Untouched → In Progress → Standby → In Development → Complete → Critical**. In Progress means preparation underway; Standby means ready for development.
- Red overrides purple; otherwise any purple child makes its ancestors purple. All existing rules remain unchanged when purple is absent, including all-grey children producing a grey parent.
- Added the unresolved native **In Development** State to YouTrack PMON through the existing idempotent setup flow. Existing native **Critical / Debugging** remains unchanged and displays as Critical.

## Connection Prompt Resolution

After the user restarted the changed service, the saved connection was restored. The new required State had not yet been created, triggering the connection/setup prompt. One manual preparation call created the missing value. An independent YouTrack schema read verified its presence; the service reports a healthy remembered connection and no missing States. Close the already-open connection dialog once. No replacement token is required.

## Verification

- **149/149 tests passed**, including ESC routing, status order, purple inheritance, idempotent State preparation, mock native changes, queued purple updates, and Critical precedence.
- Syntax checks passed for **31 frontend/test modules**.
- Isolated browser checks verified toolbar layout, filter labels/lights/visibility, ESC selection and pane behavior, retained notes and per-item comment drafts, draft cancellation, final status menu order, purple animation/ancestor rollup, and modal ESC precedence.
- Checked desktop and 900 px layouts: controls remain visible without overlap or horizontal page overflow. Browser error log was empty.
- Verified all eight delivered frontend files against the real service's served HTTP content. Updated README and tests are included in the working installation.
- Live setup changed only the State bundle; QA did not create or edit real tickets. Native status round trips were exercised against the mock provider, rather than modifying production work for testing.

![Isolated toolbar and purple status verification](R03-Toolbar-Status-QA.png)

## Delivery and Next Approval

Canonical source: `outputs/ROMDex`. Running installation: `outputs/ROMDex-v0.3/ROMDex`, port 4322. Shared AppData workspace and encrypted connection remain intact. The isolated browser fixture was stopped after verification.

Checkbox selection is still reserved for R04; the ESC clear-selection event is ready for that integration. No R04 implementation has begun.

**Next:** R04 — Dense Rows and Checkbox Selection. Recommended **Sol / High**. Await a new PASSKEY before starting.
