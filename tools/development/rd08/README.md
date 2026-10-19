# RD08 Development Evidence Tools

These preserve the original Windows task-workspace helpers for audit/reproduction. Restore the task layout under `work/rd08` and review the original dependency paths before reuse; they are not application runtime dependencies. Source validation tests live in `apps/romdex/tests/rdx-open.test.mjs`. The bootstrap-specific recovery helper operates only on its pinned isolated verification process and is historical, not a general launcher.

The verification identities and files are synthetic; no live credentials or saves are copied. MSI binaries, runtime/dependency caches, test profiles and installation/Data directories remain outside Git. See `docs/project/RD08-Verification.json` for verified results.
