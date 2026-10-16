# Development and Delivery Tooling

`development/` preserves the task-level build, migration, verification, repair and publishing scripts. `launchers/` preserves their Windows entry points. These are historical task scripts: their relative paths refer to the original task layout (`work/` and `outputs/`), and some reference test profiles that are intentionally excluded. Review and adapt paths before running; do not run old migration or installer scripts against current Data.

`installer-dependencies/` pins the Forge/WiX maker dependency tree. The Electron runtime URL, byte count and SHA-256 are pinned in `apps/romdex/desktop/runtime-lock.json`. The WiX and installer versions and measured checksums are recorded in the U13A/U13B project reports. Dependency caches, downloaded executables, private profiles and private signing keys are excluded. The publisher obtains credentials through Windows Git Credential Manager and decrypts its signing key only in memory; this repository never stores either secret.

Application source and tests live in `apps/romdex/`; plans, deferred work and completion evidence live in `docs/project/`. These archived helpers do not enable GitHub Actions, billing or automatic publishing.
