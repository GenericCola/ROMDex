# U10 — Native Desktop Window and Local Service

Authorized by the user's U10 PASSKEY, October 15, 2026. Recommended model/effort: Sol / High.

- [x] Protect the 0.4.3 source/release and pin/check the Windows x64 Electron runtime.
- [x] Host packaged code through a secure protocol and scoped sandboxed bridge; retain workspace context.
- [x] Move the native queue, clock and durable state into the utility process; keep the browser adapter usable.
- [x] Add native controlled file/export adapters, bounded transfers and independent preview storage.
- [x] Verify domain tests against the bundled runtime, bridge restrictions, two-way fixture sync, file recovery, reload and failure behavior.
- [x] Package a runnable private desktop preview with runtime/licenses, verify delivery hashes, update records and report.

U10 does not migrate the live browser profile (U12), implement tray lifecycle (U11), create the installer (U13A), or enable NPCDex cloud sync (U14–U19). File Explorer drops are the separate U10F task.

Completed after actual Windows acceptance; see [report](U10-Completion-Report.md). U10F remains unapproved.
