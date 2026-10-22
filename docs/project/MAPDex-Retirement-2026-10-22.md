# MAPDex retired — 2026-10-22

The owner rejected RI03C and retired the entire MAPDex/ROM-extraction branch. Do not continue RI03C or start U28 on that design. A replacement solution needs fresh scoping.

The complete source, tests, design documents and supporting extraction/build/verification scripts are preserved on the private Git archive branch `archive/mapdex-2026-10-22`. The branch is retained; retirement does not claim usability acceptance.

The delivered application is restored from the exact 0.5.15 application-source archive captured before MAPDex 0.5.16. NPCDex is restored from the verified archive captured before the MAPDex clean-data test: New Bark Town, Route 29, Cherrygrove City and Global Dialogue, with 44 plans, 145 history entries and 85 annotations. Current task-manager data and saved credentials are preserved. Local saving remains enabled. NPCDex cloud delivery stays paused because its former backend records were deleted during the earlier reset; republishing that dataset needs a deliberate replacement/reconnection plan.

The active development source is returned to its pre-MAPDex U27 baseline. The restored installed payload retains the original accepted 0.5.15 shutdown repairs. Protected save/application backups remain outside Git. Local MAPDex runtime copies, preparation state, ROM-derived test artifacts and caches are removed only after the remote archive and restored client are verified. The original supplied ROM is preserved.
