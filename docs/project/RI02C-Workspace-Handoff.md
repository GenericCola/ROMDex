# RI02C findings for the RI03A design review

These are inputs to the already planned workspace review, not approval to implement RI03A.

The source compiler accepts a ROM plus persistent source identities and emits one map RDX. It does not need a prepared JSON or extraction agent. The interface should make the selected ROM/build, logical map grouping, identity matching and explicit output/import steps visible. Keep the original ROM read-only; avoid unnecessary 192 MB copies.

Violet City's eight source areas group by the reviewed location identity. Sprout Tower is a separate map, despite references to it in local dialogue. Source-area labels and placed-object labels are safe identifiers, but are not necessarily friendly building/character names. Provide an honest preview and a documentation-correction route rather than inventing names or merging people who share artwork.

The existing NPCDex interface successfully displays the compiled records. It retains the existing editing controls and Roman-numeral stage renderer. Distinguish exact extracted facts from unresolved runtime meaning: possible branches, unbound entries, dynamic text and uncertain scene chronology. Four observed scene values do not establish the full map timeline. Explicit source conditions, unknown/initial states and independent flags must remain reviewable.

All sprite frames and palette alternatives are portable. The current proof uses the first unambiguous source frame as a thumbnail, which can face away from the viewer. Two palette-ambiguous objects intentionally have no confirmed default thumbnail. The design should address frame/alternative preview and choosing a documented thumbnail without claiming an unproven runtime palette.

Source extraction, portable RDX, native content publication and local/remote changes are distinct operations. Do not imply that importing a ROM publishes it, authorizes an agent, verifies gameplay or clears the existing production dataset/queue. Cold backend publication is checkpointed across many immutable source/image objects; show meaningful progress rather than a frozen Save button. The initial portable map expands to 599 immutable cloud objects / 604 data chunks plus a commit, so cold publication has substantial per-request overhead despite the 1 MB RDX size. Review asset bundling and changed-record polling before broader-map acceptance; this one-map proof is not a performance acceptance of the full catalog.

Recovery status must distinguish current data from old errors. The real second-profile recovery reached its published head but retained a prior interrupted-read message; the source correction clears that message after a successful clean cycle while preserving held review failures. The delivery/recovery checks cover this explicitly. Read timeouts retain verified object caches; the UI should expose checkpoint progress and the actual pending/review state rather than presenting an old timeout as a continuing data failure.

Reuse the identity manifest when reopening the same project. An entirely new manifest creates a separate dataset; matching labels or source indices cannot silently rebind old content. Changed-build support and prompt-level matching must be reviewed under RI03C, not inferred from the game's code alone. Current compilation accepts only the reviewed ROM layout/testbed.

RI03A remains Sol / High and requires its own PASSKEY and concrete design review. RI03B implements the approved workspace; RI03C proves broader/new-build coverage and preservation. Production migration/reset and U28–U30 acceptance/release remain separate gates.
