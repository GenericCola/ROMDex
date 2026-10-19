# Authorized Agent Handoff and File Transfer

U23A delivers source support for explicit package authorization and deterministic task-file tools. It does not enable U24 discovery, U25 application or U27's Needs Testing light. Installed 0.5.15 predates this source feature; use the later packaged release when available.

## Human Workflow

1. Attach the fixed JSON package to the chosen task. Delivery verifies its assets, package, binding and separate return-context JSON. The context contains required content ancestry/mappings, without the full working save, unchecked proposals/notes, presentation history or original-export blobs.
2. In Map Package Delivery, choose **Authorize Agent Work**, review the exact map/task/version/hash and confirm. Authorization records approval; it does not assign, message or start an agent.
3. **Copy Agent Instructions** fills a hard-coded template. It includes the exact files/hashes and a compact handoff manifest. **Download Agent Handoff** saves that manifest as JSON. Neither action calls an AI model or sends a message. Clipboard denial provides a selectable text fallback.
4. Give the coding agent the handoff and current tool bundle through the usual workflow. Its actual ROM/source/toolchain must also be supplied separately.
5. **Withdraw Authorization** records withdrawal locally even while offline. Authorizing a replacement on the same task/map supersedes the older version. A package on a different task has independent authorization; explicitly withdraw old authorization when moving an assignment to another task. Results from inactive versions are retained for later review, not silently discarded.

The approved current account is recorded from authenticated YouTrack metadata. With shared credentials, upload authorship cannot distinguish a human from an agent. Authorization also records the attachment IDs already present at consent, allowing later discovery to hold preauthorization returns for review. The manifest is an execution aid, not a credential or independent proof of human consent; the later receiver must consult the private application-owned authorization history again at application time.

## Coding Agent Workflow

Use Node.js 22 or later and this tool bundle's current schemas/CLI. No extra npm packages or AI generation are needed for file parsing, download, packing, validation or upload.

Configure the agent environment's existing YouTrack credential securely as `ROMDEX_YOUTRACK_TOKEN`. Never put the token in arguments, source files, tickets, copied instructions or chat. The helper does not extract credentials from MCP or discover ROMDex's protected token. If only ticket/comment MCP tools are available and the execution environment has no securely configured file-transfer credential, stop and report the missing capability; do not claim MCP can upload binaries.

```text
node rdx/agent-cli.mjs fetch handoff.json NEW_WORK_DIRECTORY
node rdx/cli.mjs validate RETURNED_MAP.rdx
node rdx/agent-cli.mjs return handoff.json RETURNED_MAP.rdx --confirm-upload
```

`fetch` verifies the current account, exact task/project, complete attachment inventory and pinned bytes. It creates a new directory containing `package.json`, `return-context.json`, sanitized `document.json` and `blobs/<sha256>.bin`. Imported names/IDs are not output paths. The source package and original app save are unchanged. The generated baseline document is deliberately stripped of private planning/presentation data; never import it over the owner's full map as a replacement.

Use the exact selected package instructions to make the authorized ROM changes. Append implemented content revisions to that baseline, retain required ancestry/assets and stable identities, and produce a one-map RDX with `origin.role: agent-result` and `RDXAgentResult/1`. The result's `baseDocument` is the original package base, not the sanitized context's derived revision. Include exact binding, grouped outcomes and actual source/build checks; set `requiresHumanTesting: true`. Complete dependent groups together and report unresolved work. Do not recreate omitted private plans/history: the later receiver preserves the owner's originals while merging only authorized result writes.

Pack with the existing deterministic CLI:

```text
node rdx/cli.mjs revision NEW_WORK_DIRECTORY/document.json
node rdx/cli.mjs pack NEW_WORK_DIRECTORY/document.json NEW_WORK_DIRECTORY/blobs RETURNED_MAP.rdx
```

The revision command prints the new document revision without editing the file; write that value into its top-level `revision` before packing. Packing refuses existing output files and validates the full document and exact blobs.

`return` uploads only to the bound task, verifies actual downloaded bytes and server-reported author, and keeps a durable journal beside the RDX as `<filename>.upload.json`. Repeating the same result reuses its existing attachment. The same result identity with different bytes is rejected. A lost upload acknowledgment triggers rediscovery; an uncertain upload still absent is held for review rather than automatically resent. Preserve the journal through retries. The helper never edits task State, closes a task, sends a comment or writes NPCD.

Use the existing agent comment tool to announce **Ready for Human Review and Testing**, identifying the package/result, implemented and unfinished groups and source/build checks. Leave the task open. A context-only package authorizes no ROM changes. A valid upload proves file transport/format, not correct ROM behavior or human testing.

## Bounds and Compatibility

- JSON package/context: at most 16 MiB each. Required context ancestry: at most 10,000 revisions. Nothing is silently dropped when a bound is exceeded.
- Individual task files/returned RDX: at most 50 MiB; required file bundle at most 160 MiB including JSON. Native package delivery retains its existing 64 distinct asset / 128 MiB asset budget.
- Bounded attachment pagination and result scans fail explicitly if completeness cannot be established. Download URLs are obtained fresh and never stored as durable bindings. Only the approved YouTrack origin and bound task are used.
- The new authorization collection uses metadata document version 2. Existing version 1 bytes/hashes and immutable history remain valid. Old clients fail closed on version 2 instead of deleting unknown authorization data. Upgrade all clients before using these new authorization controls; no production metadata version was changed by U23A verification.
- Authorization changes use the existing private metadata channel and its offline/concurrency review. Conflicting metadata disables executable handoff copying/new authorization; withdrawal is still possible. Pending cloud delivery is shown. The future receiver must defer automatic application while the current authorization cannot be established.
- No new account, cloud service, token rotation or installer is introduced here. A different external agent environment must still prove it has the same required file-transfer capability; a username or a working comment tool alone is insufficient.
