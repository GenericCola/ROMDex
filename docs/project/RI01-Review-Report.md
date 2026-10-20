# RI01 — ROM-only inspection and scope review

Inspection and user scope acceptance completed October 19, 2026. RI01 is checked off; implementation still requires task-specific PASSKEYs.

The supplied ROM alone yielded a valid filesystem, New Bark Town header/event/message/script relationships and a relocated sprite table. Eight physical areas contain 24 placed NPC/objects, 230 decodable message entries and 52 local script entry points. The bounded local walk encountered no unknown instruction widths; unknown native semantics, shared calls and dynamic sprites remain explicit work. This is feasibility evidence rather than a completed RDX/YouTrack proof.

The user requires direct ROM extraction without editable source or another agent's prepared JSON. Public open-source tools may be incorporated. The approved [scope](../../Project/RI01-ROM-Only-Extraction-Scope.md) defines a ROM-only New Bark proof, a deterministic integrated workspace and RI02A–RI03C implementation/acceptance steps. The user accepted RI01's roadmap scope gate; the next implementation, RI02A, still needs its own PASSKEY.

Only read-only investigation and documentation were performed. The source ROM SHA-256 is unchanged. No application source, installed files, production saves/queue/pause, NPCD or YouTrack records were modified. No installer or cloud operation was run. Public format references were inspected without launching downloaded executables. Exact ROM bytes and decoded dialogue stay outside Git/releases; the backed-up evidence contains only identifiers, counts and hashes.

Structural checks covered all filesystem/NARC entry bounds and the candidate's message allocation bounds, event section sizes, script entry offsets and referenced archive indices. App tests were not rerun for this investigation. Future RI02C must prove actual images/content, RDX import/local changes/native changes/export/reimport in isolation before extraction is considered successful.

User scope revision: each map/zone RDX defines its own relevant timeline and displays Roman-numeral stages. Current Roman labels sit over legacy A–J references; source projection/validation still assumes ten global stages. The revised proposal adds RI02T before RI02C to remove those assumptions and prove map-specific counts/order, portable references and preserved annotations/testing. The user accepted the revised scope; this acceptance does not authorize implementation or silently migrate current timelines.
