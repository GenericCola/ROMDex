# R06 — Full Item Edit Menu

Completed October 14, 2026, under the user's R06 PASSKEY and expanded-field/tag approval. R07 has not begun.

The Work Pane hover pencil now opens Edit Item. It includes Name, Notes & Instructions, Assigned Status, Priority, Complexity, Assignee, Due Date, Stage, Kanban State, Type, Estimation, Ideal Days, Story Points, and existing visible ticket tags. Spent Time is informational because YouTrack calculates it from work logs. The editor uses the established tray/dialog theme and scrolls at smaller window sizes.

## Behavior

- Current PMON definitions supply field types, eligible users, allowed choices, and empty-value constraints. Stage currently exposes no configured values; ROMDex does not invent new Stage values.
- Refreshing options also reads the latest ticket. Untouched controls adopt fresh values, while input already being edited is retained. Current values outside ROMDex's normal choices remain intact when untouched, including native Show-stopper.
- Save Item Changes stages one durable patch containing only changed fields. Cancel/Escape submits no form edits. Tab retains normal form navigation and does not cycle Details or regroup items.
- Assignees use stable user IDs, permit unassignment only when configured, and show friendly names in Details. Due Date preserves the selected day using YouTrack's midday-UTC date representation. Estimation accepts hours/minutes without assuming a workday duration.
- Additional custom fields reconcile independently. Originally empty values remain valid conflict baselines, including when coalescing with earlier queued changes. Native changes to unrelated fields are retained.
- Tags assign/remove existing accessible tags on the ticket. Their definitions and sharing are unchanged. If a multi-field save is partly confirmed before a tag request fails, the durable journal retains confirmed fields/tag actions and resumes remaining work through review/retry.
- Parents retain their local Assigned Status while children determine the displayed/native effective State. Existing bulk/subtree movement behavior remains covered by regression tests.
- Quick inline rename remains available by double-clicking a name or pressing F2 while the name has focus. Only names reopen collapsed Details; checkboxes and Edit Item preserve the pane size. Selected-row styling updates without replacing the title during a double-click.

## Verification

- **184 automated tests passed**, including controlled YouTrack-service round trips, reassignment/unassignment, date setting/clearing, native incoming changes, nullable-value conflicts, permissions, custom-field validation, tag partial failure/retry, and existing hierarchy/grouping regressions. No test request reached production YouTrack. Log: `R06-tests.log`.
- **42 module syntax checks passed** across public modules, tests, service, adapter, and runtime-profile code.
- Isolated browser checks verified unchanged Save produces no operation; trailing spaces remain during typing; Cancel/Escape; all-field offline staging with original baselines; parent saved/effective status separation; cached choices; normal form Tab; double-click/F2 rename; name-only reopening; checkbox preservation; and desktop/narrow-screen layout. No browser console warnings/errors were observed.
- The production service was restarted and its installation/build IDs match the installed files. The remembered connection, Auto-Sync, and confirmed YouTrack availability remained enabled. Actual PMON metadata verified two eligible assignees, date support, accessible tags, and matching issue/project field IDs. Live verification was read-only.
- The live metadata did not initially identify Spent Time as calculated, so it appeared editable. The final protection recognizes the reserved field and configured field identity/name, with an added regression check. The final running service confirms it is read-only.
- Fifteen source/test/documentation files were installed and hash-checked; all eight changed public resources were compared with their served bytes. The final shared backup contained 299 items and zero pending operations.
- The saved encrypted profile, original ZIPs, and U01 baseline backups were preserved. This updates the running 0.3 installation; R08 will package the enhancement release.

## Review Images

These images use isolated fixture tickets, not production edits.

![Edit Item — primary fields](R06-Edit-Menu-QA.png)

![Edit Item — custom fields, tags and notes](R06-Edit-Menu-Fields-QA.png)

## Limits

Saved metadata supports offline editing after one successful refresh. New project choices require a connection to refresh them. Project permissions/workflows can reject edits; unsent work remains queued for review. Field updates and tag associations are separate YouTrack requests, with optimistic conflict checking rather than an atomic remote transaction. Work-log entry and attachment management are outside R06.

## API References

- [Custom field types and payloads](https://www.jetbrains.com/help/youtrack/devportal/api-concept-custom-fields.html)
- [Date-only field representation](https://www.jetbrains.com/help/youtrack/devportal/api-entity-DateIssueCustomField.html)
- [Eligible user-bundle members](https://www.jetbrains.com/help/youtrack/devportal/resource-api-admin-customFieldSettings-bundles-user-bundleID-aggregatedUsers.html)
- [Calculated Spent Time](https://www.jetbrains.com/help/youtrack/cloud/add-work-items-to-issue.html)
- [Issue tag assignment and removal](https://www.jetbrains.com/help/youtrack/devportal/resource-api-issues-issueID-tags.html)

**Next:** R07 — YouTrack Attachments and Previews, **Sol / High**. Await a new PASSKEY before implementation.
