# U12 — Current Data and Protected Connection Migration

Authorized by PASSKEY. Recommended Sol / High. The user confirms the live web origin is http://127.0.0.1:4322/ and has not edited NPCDex recently. The latest web state remains authoritative; old desktop previews are retained separately.

- [x] Preserve U11 source/delivery and fresh protected service/NPCDex backups.
- [x] Capture same-origin browser state, recovery records, coordinator preferences and queued bytes; preview counts and hashes.
- [x] Implement validated, staged, atomic migration into a stable data profile outside build folders.
- [x] Re-protect the remembered connection through Electron safeStorage without displaying or writing plaintext.
- [x] Verify interrupted migration, missing/corrupt bytes, changed sources, existing destinations and rollback.
- [x] Package and preview the migrated current data before adopting it; preserve original files.
- [x] Verify real connection and genuine incoming snapshots, restart/build-folder replacement and local recovery without synthetic production edits. Network/failure scenarios use fixtures; no synthetic ticket changes were made.
- [x] Record completion and stop before U13A.

Completed October 15, 2026 in 0.5.0-preview.12. 272 automated tests, 83 syntax checks, 194 delivered-file hashes and live Windows migration/restart checks passed. See [completion report](U12-Completion-Report.md) and [desktop verification](U12-Desktop-Verification.json).
