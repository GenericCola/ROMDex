# RI01 read-only investigation tools

These are bounded scoping probes, not a production extractor or a completed RDX proof. Run from the repository root with Python 3 and a supplied local .nds path. They never open the ROM for writing, invoke downloaded executables, publish content or access application Data.

1. Run python tools/ri01/inspect-rom.py ROM.nds work/ri01/rom-inventory.json.
2. For the New Bark probe only, obtain the public tools/msgenc/charmap.txt and asm/macros/script.inc from pret/pokeheartgold commit 6988158691eb6178cff697cda0428045ddcba5fb. Put them in work/ri01/reference/charmap.txt and script.inc. They are reference dependencies, not editable files for the user's project; no agent-prepared content is used.
3. Run python tools/ri01/probe-new-bark.py ROM.nds work/ri01/new-bark-probe.json.

The full local probe output contains decoded message samples; do not upload it or the ROM. The repository contains only the reviewed counts/locator-hash evidence. Unknown instruction semantics, shared/native calls, movement decoding and sprite rendering are not proved by these tools. They assume the inspected English HeartGold candidate layout and must not serve as automatic build detection for a future product.
