# R08 — Saved-Data Checkpoint

Captured October 14, 2026. This checkpoint supplements U01; the original U01 backup remains immutable.

## Protected Contents

`R08-Checkpoint-2026-10-14-01` contains 47 independently re-read and SHA-256-verified files:

- 39 files from the authoritative `C:/Users/mrgen/Downloads/npcdex-v2.42` working package, including saved export revision **72**. Sources were checked again after copying to detect changes during capture.
- Six shared ROMDex profile files: marker, encrypted connection, retained parent assignments, operation journal, synchronization settings and workspace. Profile source hashes were stable across capture; there were no staged upload files.
- The verified **ROMDex 0.4.0 ZIP** and its per-file/checksum manifest.

Directory inheritance is disabled. Access is restricted to the current Windows account, SYSTEM and Administrators; all captured files were checked for restricted child access. The token was copied and hashed only as DPAPI ciphertext, never decrypted or printed.

The checkpoint's `manifest.json`, `npcdex-manifest.json` and `backup-security.json` record the file evidence. These are private recovery materials and are deliberately excluded from the distributable ZIP.

## Verification Boundary

The profile capture was refreshed after the user's new-folder **0.4.0** launch. The expected running installation/build identity and all 28 public resource hashes match. The remembered connection and Auto-Sync are healthy, encrypted credential bytes are unchanged, all 299 original issue IDs remain, and the saved queue has zero pending operations or blocked action. Profile hashes were stable across the refreshed capture. The release passed its extracted 207-test suite and isolated startup/assets checks.

This is a saved-files checkpoint. It does not capture browser IndexedDB, active/unsaved NPCDex edits, a complete YouTrack account or actual ROM contents. The native QA tickets were cleaned before capture, and all 299 original issue IDs remained.

## Recovery and Later Migration

Preserve current data before any restoration. Use a separate test profile first, compare native YouTrack changes, and retain matching journals/workspace/upload storage together. Never replay a historical journal or replace newer saves automatically. The encrypted token remains tied to its original Windows protection context.

Refresh the checkpoint again before U12/U15 rather than using this revision as the future migration authority. R08 is complete; proceed only with a new PASSKEY for **U02 — Desktop Host and Distribution Design, Sol / High**.
