# Producing RDX Files from the ROM

Phase 6 is complete: the 0.5.15 installer has run successfully, and the installed app has reopened and passed acceptance.

For the coding agent, I need:

1. **The latest ROM and its game/build version**, preferably with the matching editable modding/source project. Tell me which map to extract. The actual ROM/source files have not been supplied or inspected yet.
2. **Node 24 and the [Agent Authoring Kit](RD09-Agent-Authoring-Kit.zip).** The kit contains the format rules, examples, schemas, compiler and validator. Its RD09 release-availability notes are historical; the installed application is now 0.5.15. No npm installation, ROMDex installation or account token is needed to compile locally.
3. **One document.json per map and its referenced asset files.** The agent creates these from extracted map/sub-zone/entity/dialogue/event data, with stable identities and verified ROM source locations. Images, flags, notes and proposals belong inside that map's RDX. Follow the [map authoring instructions](ROMDex/rdx/authoring/MAP-AUTHORING.md).

The existing rdx/cli.mjs tools pack these inputs into a compressed .rdx and validate it. ROMDex already uses the same format tools for native import, saves and export.

**Recommendation:** reuse this compiler and keep its portable command-line version for agents. A later “Build RDX” screen can wrap the same code. The useful additional work is a verified **ROM-specific extractor/exporter**; that produces the structured inputs. I can identify the exact extraction programs after inspecting your ROM/project. The current packer does not extract data from a ROM by itself.

Normal agent-return files still require human testing/review. Automatic task-bound return reconciliation remains a later phase.
