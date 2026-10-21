# RDX Reference

Current implementation and nested-zone contract: [ROMDex/rdx](../../apps/romdex/rdx/) and [Map Import](../../apps/romdex/rdx/MAP-IMPORT.md). MAPDex 0.5.21 includes the reviewed ROM reader and nested parent/child map preparation.

The [RD09 portable authoring kit](../../apps/romdex/rdx/authoring/README.md) is a frozen historical kit for flat maps/plans. For maps requiring `org.romdex.npcdex.nested-zones-v1`, use the current 0.5.21 source compiler/validator; do not strip the capability to force acceptance by an older kit. The current guide explains the child membership/index rules. The [agent file-transfer archive](../../apps/romdex/rdx/AGENT-FILE-TRANSFER.md) is likewise version-pinned; use current source tooling for new required capabilities.

RD01 contracts and RD03/RD04/RD07 examples preserve format/acceptance history. The current reader’s supported layouts remain explicit; a fresh extraction from a different ROM fingerprint does not yet guarantee updating an existing logical map. RI03U tracks that required update workflow. See the [overall checklist](NPCDex-ROMDex-Action-Checklist.md).
