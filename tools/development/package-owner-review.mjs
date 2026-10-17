// Explicit review distribution: verified installer + allowlisted documentation.
// Never traverses application Data, credential stores, signing-key directories or .git.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createReadStream} from 'node:fs';
import {createHash,createPublicKey,verify,constants} from 'node:crypto';
const cwd=process.cwd(),name='ROMDex-Review-0.5.7-2026-10-16',stage=path.join(cwd,'outputs',name);
const repoDocs=path.join(cwd,'work/u13b/repository/docs/project');
const manifest=JSON.parse(await fs.readFile('work/u19/build-release-0.5.7.json','utf8'));
const envelope=JSON.parse(await fs.readFile('work/u13b/repository/docs/releases/0.5.7/romdex-release-stable.json','utf8'));
const payload=JSON.parse(envelope.payload),config=JSON.parse(await fs.readFile('outputs/ROMDex/desktop/update-config.json','utf8'));
const expected='8bab8e1253503f765b030f3079a6c7c480b8f628e69645c422af6dd8df1e7d83';
const digest=async file=>{const h=createHash('sha256');for await(const b of createReadStream(file))h.update(b);return h.digest('hex');};
if(payload.version!=='0.5.7'||payload.artifact.sha256!==expected||envelope.keyId!==config.keyId||!verify('sha256',Buffer.from(envelope.payload),{key:createPublicKey(config.publicKey),padding:constants.RSA_PKCS1_PADDING},Buffer.from(envelope.signature,'base64')))throw Error('Trusted 0.5.7 release metadata verification failed');
const installer=manifest.artifacts[0];if(installer.sha256!==expected||installer.bytes!==payload.artifact.size||await digest(installer.path)!==expected)throw Error('Original installer differs from verified release');
try{await fs.lstat(stage);throw Error('Review staging folder already exists; do not overwrite an earlier package');}catch(e){if(e.code!=='ENOENT')throw e;}
await fs.mkdir(stage,{recursive:true});
const origins=new Map(),records=[];
const posix=x=>x.replaceAll('\\','/');
const denied=/(^|\/)(Data|Runtime|private-profile|\.git|node_modules|session|\.romdex|uploads|protected-data-backup)(\/|$)|\.encrypted$|(^|\/)(?:npcdex-current|npcdex-recovery-draft|npcdex-held-recovery|npcdex-agent-export)\.json$/i;
async function put(rel,bytes,source=null){if(denied.test(rel))throw Error('Private-data path refused: '+rel);const dest=path.join(stage,rel);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,bytes);if(source)origins.set(path.resolve(source),posix(rel));records.push({path:posix(rel),source:source?posix(path.relative(cwd,source)):null});}
async function copy(source,rel){const stat=await fs.lstat(source);if(!stat.isFile()||stat.isSymbolicLink())throw Error('Expected regular review file');await put(rel,await fs.readFile(source),source);}
async function walk(dir){const result=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){if(entry.isSymbolicLink())throw Error('Unexpected symbolic documentation entry');const p=path.join(dir,entry.name);if(entry.isDirectory())result.push(...await walk(p));else result.push(p);}return result;}
const allProject=await walk(repoDocs);
for(const source of allProject){const relative=posix(path.relative(repoDocs,source));if(!['.md','.json'].includes(path.extname(source))&&relative!=='U20A-Contracts/verify-contracts.mjs')throw Error('Unreviewed documentation extension: '+relative);let chosen=source;const current=path.join(cwd,'outputs',relative);try{if((await fs.stat(current)).isFile())chosen=current;}catch{}await copy(chosen,'documentation/project/'+relative);origins.set(source,'documentation/project/'+relative);origins.set(current,'documentation/project/'+relative);}
for(const source of (await fs.readdir('outputs/ROMDex')).filter(f=>f.endsWith('.md')))await copy(path.join(cwd,'outputs/ROMDex',source),'documentation/application-guides/'+source);
for(const source of (await fs.readdir('outputs/NPCDex')).filter(f=>f.endsWith('.md')))await copy(path.join(cwd,'outputs/NPCDex',source),'documentation/npcdex-reference/'+source);
for(const file of ['Installer-Manifest.json','READ-ME-FIRST.md','romdex-release-stable.json'])await copy(path.join(cwd,'work/u13b/repository/docs/releases/0.5.7',file),'documentation/releases/0.5.7/'+file);
await copy(installer.path,'installer/ROMDex-0.5.7-x64.msi');
await copy('work/u13b/repository/docs/releases/0.5.7/romdex-release-stable.json','installer/romdex-release-stable.json');
await put('installer/release-public-key.pem',config.publicKey+'\n');
await put('installer/INSTALLER-IDENTITY.json',JSON.stringify({application:'ROMDex',version:'0.5.7',platform:'Windows x64',filename:'ROMDex-0.5.7-x64.msi',bytes:installer.bytes,sha256:expected,sourceCommit:'579041e552a451ca54bc1f8ee7c479daff1e0b22',releaseSignatureVerified:true,windowsAuthenticodeSigned:false,workingSavesIncluded:false,credentialsIncluded:false},null,2)+'\n');
await copy(path.join(cwd,'work/u19/connection-details.png'),'screenshots/0.5.7-connection-details.png');
await copy(path.join(cwd,'outputs/U08-Combined-Workspace-QA.png'),'screenshots/historical-npcdex-workspace-u08.png');

const features=`# ROMDex 0.5.7 — Current Features

Review baseline: October 16, 2026. This is the installed, verified release, including NPCDex as an add-on. Architecture documents describe additional future work; those features are identified below.

## Windows App and Workspaces

- Standalone Windows x64 application and per-user installer, Start Menu shortcut and Pokédex icon; separate Chrome/Node installation is unnecessary.
- Switch ROMDex/NPCDex with the small red header button. Each running workspace retains its navigation, selection, scroll, filters, pane sizes and unfinished edits when switching.
- Closing the window keeps the app in the Windows tray; explicit Quit checkpoints accepted work and exits. Bounded renderer/service recovery and single-profile ownership protect durable work.
- Application-folder Data is preserved across upgrades and uninstall/reinstall. Remembered credentials use Windows account protection.
- Private signed release metadata; notify/review/download/install consent, a manual-update route and retained Data on upgrade. Windows installer publisher signing is separate and currently absent.

## ROMDex Task Organization

- Two-way YouTrack task synchronization: native edits flow into ROMDex and supported dashboard edits flow back to YouTrack.
- Epic → Saga → Story → Verse selectors, with deeper tasks in the Work Pane. One branch per expandable selector tier, fixed-height compact tiles and All Tasks on fresh launch.
- Dense hierarchical Work list, search, Expand All/Collapse All, completion filtering, IDs beside titles, notes/attachment indicators and priority/Complexity tags.
- Drag to reorder/reparent, including sideways nesting; selected parents carry their descendants. Same-parent multi-selection supports range/nonconsecutive selection, grouping and bulk drag.
- Direct status-light editing; retained parent assignments are separate from inherited effective status. Lights show Untouched, In Progress, Standby, In Development, Complete and Critical, with agreed descendant rollups.
- Full Edit Item menu for assignee, due date, priority, Complexity, supported editable custom fields, description and tags. Calculated Spent Time remains read-only.
- Inline task creation/rename, keyboard nesting and selection-aware TAB/ESC behavior. Checking boxes preserves the Work view; selecting an item name opens its details.
- Docked Details Tray with notes/instructions, comments, child navigation/back, resize handle, expand and collapse.
- Native ticket attachments: add/download, raster previews, deletion with review/recovery, and Explorer/desktop file drops onto task rows.

## NPCDex Planning and Review

- Map/location/character/interactive-element browsing, conditional dialogue, player-gender views, narrative stages and shared/global dialogue references.
- Current content plus staged changes; FINAL/UPDATE/REMOVE editorial decisions, Change Instructions, proposed dialogue, scoped flags/notes and separate tester verification.
- Source/script evidence, stable target/review identities, character imagery and shared identity references.
- Change history, guarded data undo and retained implementation/reversal history. Manual legacy receipt/export facilities remain; they are not the new automatic YouTrack registry workflow.
- Persistent private GitHub-backed saves and image/history data, local durable checkpoints, offline queues, incoming revisions and independent-edit merging. Conflicts retain original versions and require review.

## Shared Synchronization

- Save Changes and Auto-Sync apply across native YouTrack tasks, NPCDex cloud saves and ROMDex organization metadata. A failed provider does not stop healthy providers.
- Save performs one cycle while Auto-Sync is Off and leaves it Off. Accepted local work remains durable while disconnected.
- Save stays green during ordinary healthy automatic delivery; unsendable/paused pending work, conflicts and recovery problems require red/review. Connection pulses blue when configured connections are healthy, flashes red on failure and stays dark blue when Off.
- Click the connection light for each provider's status, pending work, latest contact and recovery guidance.
- Tile images, manual sibling order and saved parent assignments sync through the metadata store. Window/view preferences remain local.

## Approved Design, Not Yet Shipped

- A separate NPCDex Content YouTrack project and dynamic per-map/entity content records, with shared profiles and local appearances.
- Package Map Changes: one fixed document, explicit existing/new PMON task attachment and a separate user-controlled agent handoff.
- Validated direct backend implementation updates, incremental independent results, complete dependent groups, preserved newer drafts and user testing before task completion.
- Explicit documentation corrections, planned additions and archived implemented removals through the new registry.
- Agent contact notifications are later work. See [status and roadmap](PROJECT-STATUS.md).
`;
const limitations=`# Known Limitations and Review Boundaries

## Current Release

- Private Windows x64 test distribution. No macOS/Linux installer has been accepted. The MSI is unsigned for Windows publisher identification; signed application release metadata does not remove that Windows warning.
- The current deployment is configured around the existing PMON workflow and private owner-controlled cloud setup. Multi-user access, broader sharing and arbitrary-workspace onboarding have not been accepted as finished features.
- This ZIP carries no current working saves or credentials. A fresh installation does not automatically reproduce the owner's latest NPCDex/cloud state. Access to YouTrack, private save storage and private updates requires separately authorized account setup; do not share the owner's existing tokens.
- Offline edits are durable, but remote synchronization needs connectivity. Closing to tray allows background work; full Quit stops it. Text never accepted by an editor can still need re-entry after a renderer crash.
- Conflicts are eventually discovered against observed revisions. This is not a global editing lock or atomic transaction across clients, tickets and the ROM. NPCDex overlapping edits currently use complete-version review; automatic character-by-character text merging is absent.
- Manual order is ROMDex organization metadata; it does not rewrite YouTrack's personal/contextual custom-order controls. Same-parent restriction applies to the initial bulk grouping/move selection behavior.
- Native YouTrack Show-stopper displays at ROMDex's highest priority (Urgent); editing that tag maps to Critical. Calculated/native read-only fields remain read-only.
- A native parent State equal to its calculated inherited State cannot reliably identify a separate retained assignment; ROMDex preserves the known saved value. See the metadata guide for details.
- Inline attachment preview is for raster formats. The existing native attachment staging/viewing limit is 50 MB per file; actual YouTrack permissions/configured upload limits may be lower. Unknown server capacity has not been certified by that client-side limit.
- Current cloud discovery/automatic merges are deliberately bounded: 5,000 immutable records; NPCDex automatic review up to 64 heads/256 concurrent operations; metadata document 16 MiB and raster data URL 2 MiB, with 512 KiB transport chunks. Unsupported/ambiguous histories retain data for review. No destructive automatic remote-history cleanup is enabled.
- Credentials are Windows-account protected. Upgrade preservation does not mean they can be moved to another Windows account/computer or remain usable after revocation/expiry. The entire retained Data folder, including Runtime encryption state, matters for same-account recovery.

## Content Architecture Work in Progress

- NPCDex is already cloud-backed in private GitHub. The proposed YouTrack content registry is a change of content model/provider, not the first introduction of persistence.
- U20 architecture and U20A contracts are approved. U20B fresh checks found that GenericCola cannot create the content project (HTTP 403); the owner is arranging it. The private grants, actual storage/transfer limits, cross-project access and live concurrent attachment protocol still need proof.
- No current NPCDex save has been migrated into the proposed content project. The installed application remains 0.5.7 and retains its existing provider.
- Map-package attachment/new-task workflow, normal automatic agent backend-result reconciliation and agent notifications are not implemented by 0.5.7. Legacy manual receipt tools are distinct.
- The contract examples use fictional IDs, assets and ROM hashes. Their model checks establish design behavior, not an actual ROM extraction, real server guarantee, hardened parser or full legacy projection.
- An agent's implementation report does not prove in-game testing. NPCDex data undo is not automatic ROM reversal. The user must verify results before completing the actionable task.
- U20C1 was proposed as independent work while owner setup was unavailable; it was not started. The user has since indicated that owner setup is underway.

## Historical Documentation

The archive deliberately retains older browser/local-only instructions, obsolete next-task labels and local artifact paths as development history. Read [current features](FEATURES.md), [status](PROJECT-STATUS.md) and this file first. Historical local backups, live saves, raw credentials, dependency caches and private signing material are intentionally outside this review package. Missing historical artifact links are listed in DOCUMENT-LINK-AUDIT.json.
`;
const status=`# Project Status and Owner Review

Snapshot: October 16, 2026. Installed release: **ROMDex 0.5.7**.

| Area | Status |
| --- | --- |
| Combined ROMDex/NPCDex desktop, installer, tray, native fields/files | Implemented and verified. |
| Private NPCDex saves, conflict review, ROMDex metadata and shared controls | Implemented through U19. |
| Latest release QA | 426 regression tests, six packaged scenarios, 125 syntax checks and 248 installed application hashes, as recorded by U19. Packaging this ZIP does not rerun those historical app checks. |
| Content architecture/workflow | U20 approved. |
| Versioned content/mapping contracts | U20A approved; 45 model/compatibility checks passed. |
| Separate content-project access/storage proof | U20B incomplete. Owner setup is now being arranged after Create Project returned 403 to GenericCola. Local transport assumptions passed 16 model checks; live transport remains unverified. |
| Dynamic content reader/planning/migration | Future U20C–U20F tasks. An alternative U20C1 schedule was proposed but not started. |
| Map packages and direct backend result workflow | Future U21–U27 tasks; NPCDex stages only, user handoff stays separate. |
| Full integrated acceptance/release | U28–U30. |
| Agent contact notifications | U31–U33 after the principal release. |

## Requested YouTrack Project

- **Instance:** the existing thegobindsingh.youtrack.cloud.
- **Project Name:** NPCDex Content.
- **Project ID:** NPCD.
- **Project Owner:** GenericCola.
- **Access:** owner and trusted instance administrators; no broad Registered Users/All Users issue grants. Leave it empty for the isolated proof.

No new accounts, global permissions, paid features, billing changes or data import are required for that prerequisite. Once it exists, U20B first verifies actual IDs/grants and runs marked synthetic records/assets. No real save migration or active provider switch follows project creation alone.

## Proposed Content Model

Epic: macro-region → Saga: map/zone → Story: sub-zone/building → Verse: local NPC/entity/scene. Shared character profiles are separate from their local appearances; shared/global dialogue is referenced rather than duplicated. NPCDex keeps its familiar interface and shows current content with proposals appended.

Package Map Changes stages one fixed JSON document for explicit attachment to an existing or newly created PMON task. It never dispatches agent execution. The separately handed-off agent changes the ROM and appends versioned backend updates. Valid independent results can appear separately; dependent scene changes update together. Newer drafts remain pending and human verification controls task completion.

## Suggested Review Questions

1. Does the separate project and proposed region/map/sub-zone/entity hierarchy fit the instance's intended use?
2. What upload/storage limits and available space can the instance owner confirm without changing them?
3. What permissions can safely support owner editing and a later attributable execution identity? No new agent account/grants are requested by this review package.
4. Do the extraction/mapping guide and fixed-package/backend-update examples give an agent enough information to find the exact ROM targets?

The complete approved design, contracts, development reports and current task checklist are in the documentation index. This archive is for review; receiving it does not dispatch any development work.
`;
const devlog=`# Development Log — Review Summary

This summary separates shipped changes from designs. The full task reports, decision log, action plan, original changelog and NPCDex iteration records are included in the documentation folders.

| Milestone | Main result |
| --- | --- |
| Initial ROMDex / 0.2–0.3 | ClickUp-inspired hierarchy and dense list over YouTrack, NPCDex styling, inherited status lights, docked Details, editing, synchronization and incremental visual/keyboard corrections. |
| R01–R08 / 0.4 | Four-tier selectors, dense rows, selection-aware Details/TAB/ESC, In Development, same-parent grouping/bulk subtree moves, full native-field editor, attachments and integrated QA. |
| S01 / 0.4.1 | Crisp attachment indicator, native file deletion and All Tasks startup. |
| U06–U09 / 0.4.1–0.4.3 | Shared appearance, relocated NPCDex controls, retained workspace switching and application-owned save/sync coordination. |
| U10 / U10F / U11 previews | Electron host, secure desktop bridge/service, Explorer file-drop attachments, tray lifecycle, profile ownership and crash recovery. |
| U12 | Previewed adoption of the latest authoritative web data; older desktop baseline was not used to replace it. |
| U13A / 0.5.2 | Per-user MSI, application-folder Data, credential migration and uninstall/reinstall preservation. |
| U13B / 0.5.3 | Private source/release home, signed update metadata, user-approved downloads/installation and protected read-only update access. |
| U14–U15 | Approved private GitHub bulk-save route, isolated transport/access proof and accepted initial NPCDex cloud copy. YouTrack retained native tasks/agent-required material. |
| U16 / 0.5.4 | Durable NPCDex outgoing/incoming cloud synchronization and recovery. |
| U17 / 0.5.5 | Independent-edit merges, full-version conflict review and retained concurrent history. |
| U18 / 0.5.6 | Cloud-backed manual ordering, tile images and retained parent assignments. |
| U19 / 0.5.7 | Truthful combined Save/connection indicators and per-service details; smaller shadow-free workspace button. |
| U20 — approved design | Separate YouTrack content registry, shared profiles/local appearances, planning-only fixed map packages, validated backend updates and human testing gate. |
| U20A — approved design | Nine structural artifact contracts, extraction/import guide, fictional examples and 45 model/compatibility checks. |
| U20B — in progress | Fresh role/access reads, Create Project 403, protected checkpoint sizing and 16 local storage-model checks. Owner is arranging the empty content project; live proof is not complete. |

Recorded release evidence reports exact Data/credential preservation during verified upgrades. This review package includes those reports, not the protected saves or credentials themselves. U20/U20A produced documents and models only; they did not change installed 0.5.7.
`;
const start=`# ROMDex — Review Package

**Release:** 0.5.7 · **Prepared:** October 16, 2026 · **Platform:** Windows x64.

Open **START-HERE.html** for a clickable overview, or begin with these files:

1. [Features](FEATURES.md) — what is available in 0.5.7.
2. [Project Status and Owner Review](PROJECT-STATUS.md) — approved architecture, roadmap and the NPCDex Content / NPCD project prerequisite.
3. [Known Limitations](KNOWN-LIMITATIONS.md) — platform, storage, conflict and unfinished-work boundaries.
4. [Development Log](DEVELOPMENT-LOG.md) — milestone summary; original reports are in [the full document index](DOCUMENT-INDEX.md).
5. [Installer](installer/ROMDex-0.5.7-x64.msi) — the existing verified private test release, not a new development build.

## Installer

Extract the ZIP before installing. Run installer/ROMDex-0.5.7-x64.msi and open ROMDex from the Windows Start Menu. No separate Chrome/Node installation is needed. The private test MSI is unsigned for Windows publisher identification; its release metadata is separately signed and was verified when preparing this ZIP.

Installer SHA-256:

${expected}

The MSI is ${installer.bytes.toLocaleString('en-US')} bytes. Signed release metadata and its public verification key are included beside it. Existing ROMDex users can use the application's approved signed manual-update flow; finish edits and Quit from the tray before an installer upgrade. Do not run old migration/verification helpers from historical reports.

Closing the window keeps ROMDex running in the tray. Choose Quit ROMDex to stop it. Application Data stays under %LOCALAPPDATA%/ROMDexDesktop/Data and is retained on uninstall. Use only the reviewer’s separately authorized connections. Connecting to a real project enables the normal application workflow; this installer is not a forced read-only demo.

## Contents and Exclusions

Included: verified MSI, signed release metadata/public key, current review guides, canonical project documentation and technical evidence, application milestone guides, NPCDex reference/workflow/iteration/source-map documents, approved contracts/examples and selected labelled screenshots.

Excluded: current working saves, application Data/session, queued files, encrypted/plaintext credentials, protected backups, private signing keys, dependency/runtime caches and the private Git repository itself. The installer retains its original bundled baseline; this is not the owner's latest saved workspace. No access grant, live save migration or automatic agent handoff is performed by creating this archive.

Historical documents retain original version claims, local paths and milestone next-task labels. Current review guides take precedence; missing historical local artifacts are identified in DOCUMENT-LINK-AUDIT.json. PACKAGE-CONTENTS.json and SHA256SUMS.txt identify the included bytes. External links may require repository access; the documentation copies are readable offline.
`;
for(const [file,text]of Object.entries({'README.md':start,'FEATURES.md':features,'KNOWN-LIMITATIONS.md':limitations,'PROJECT-STATUS.md':status,'DEVELOPMENT-LOG.md':devlog}))await put(file,text);

// Make copied Markdown references useful offline without exporting local backups.
const missing=[],rewrites=[];
const byName=new Map();for(const [source,rel]of origins){const base=path.basename(source);if(!byName.has(base))byName.set(base,new Set());byName.get(base).add(rel);}
for(const record of records.filter(r=>r.path.endsWith('.md')&&r.source)){
 const source=path.resolve(cwd,record.source),dest=path.join(stage,record.path);let text=await fs.readFile(dest,'utf8');
 text=text.replace(/(!?\[[^\]\n]*\])\(([^)\n]+)\)/g,(whole,label,target)=>{
  if(/^(?:https?:|mailto:|#)/i.test(target))return whole;
  const clean=target.startsWith('<')&&target.endsWith('>')?target.slice(1,-1):target;const [file,anchor]=clean.split('#');
  let decoded;try{decoded=decodeURIComponent(file);}catch{decoded=file;}
  const resolved=path.resolve(path.dirname(source),decoded);let mapped=origins.get(resolved);
  if(!mapped){const alternate=path.resolve(cwd,'outputs',decoded);mapped=origins.get(alternate);}
  if(!mapped){const candidates=byName.get(path.basename(decoded));if(candidates?.size===1)mapped=[...candidates][0];}
  if(mapped){let rel=posix(path.relative(path.dirname(dest),path.join(stage,mapped)));if(anchor)rel+='#'+anchor;rewrites.push({document:record.path,from:target,to:rel});return label+'('+(rel.includes(' ')?'<'+rel+'>':rel)+')';}
  missing.push({document:record.path,target,reason:'Historical local/source artifact not included; no current save or backup is exported.'});return whole;
 });
 const toOverview=posix(path.relative(path.dirname(dest),path.join(stage,'FEATURES.md')));
 const banner=`> **Versioned reference:** preserved project documentation may describe an earlier build or future design. See [current 0.5.7 features](${toOverview}) and the package overview first. Historical local artifacts are not included.\n\n`;
 await fs.writeFile(dest,banner+text);
}
await put('DOCUMENT-LINK-AUDIT.json',JSON.stringify({rewrittenInternalReferences:rewrites.length,unbundledHistoricalReferences:missing.length,unbundled:missing},null,2)+'\n');
let index='# Full Documentation Index\n\nCurrent entry points: [Features](FEATURES.md), [Status](PROJECT-STATUS.md), [Limitations](KNOWN-LIMITATIONS.md), [Development Log](DEVELOPMENT-LOG.md).\n\n';
for(const [folder,title]of [['documentation/project','Project Plans, Decisions, Contracts and Verification'],['documentation/application-guides','Versioned Application Guides'],['documentation/npcdex-reference','NPCDex Workflow, Iteration and Source References'],['documentation/releases','Verified Release Documentation']]){index+='## '+title+'\n\n';for(const r of records.filter(r=>r.path.startsWith(folder+'/')).sort((a,b)=>a.path.localeCompare(b.path)))index+='- ['+r.path.slice(folder.length+1)+']('+r.path+')\n';index+='\n';}
index+='## Screenshots\n\n- [0.5.7 Connection Details](screenshots/0.5.7-connection-details.png) — current release verification capture; no token is shown.\n- [NPCDex Workspace, U08](screenshots/historical-npcdex-workspace-u08.png) — historical combined-interface capture; some header controls have since changed.\n';
await put('DOCUMENT-INDEX.md',index);
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ROMDex — Review Package 0.5.7</title><style>body{margin:0;font:17px/1.55 system-ui,sans-serif;color:#24332b;background:#f6f4eb}header{padding:35px max(24px,calc((100vw - 1050px)/2));background:#a81f31;color:#fff4c7}h1{margin:0;font-size:40px}main{max-width:1050px;margin:32px auto;padding:0 24px}nav{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}nav a{display:block;background:#173c32;color:#fff4c7;padding:20px;border-radius:12px;text-decoration:none}nav strong{display:block;font-size:21px}a{color:#1b6859}section{background:#fff;padding:22px;border:1px solid #deddd1;border-radius:12px;margin-top:24px}img{max-width:100%;border-radius:7px}code{overflow-wrap:anywhere}small{color:#52645a}</style><header><h1>ROMDex</h1><div>Review Package · Windows x64 · 0.5.7 · October 16, 2026</div></header><main><p>The verified desktop app, current feature/limitation guides and complete project documentation. NPCDex is an add-on workspace within ROMDex.</p><nav><a href="FEATURES.md"><strong>Features</strong>Current release capabilities</a><a href="PROJECT-STATUS.md"><strong>Status and Owner Review</strong>Content project and approved workflow</a><a href="KNOWN-LIMITATIONS.md"><strong>Known Limitations</strong>What is unfinished or constrained</a><a href="DEVELOPMENT-LOG.md"><strong>Development Log</strong>Milestone summary</a><a href="DOCUMENT-INDEX.md"><strong>Full Documentation</strong>Plans, guides, history, contracts and evidence</a><a href="installer/ROMDex-0.5.7-x64.msi"><strong>Windows Installer</strong>Extract the ZIP before running</a></nav><section><h2>What This Package Contains</h2><p>The original verified 0.5.7 installer and documentation snapshot. U20/U20A architecture and contracts are approved; the separate YouTrack content project, migration and automatic map-package/backend-result workflow are later development work.</p><p>Current working saves, account tokens, application Data and private signing keys are excluded. A fresh install does not automatically reproduce the owner's latest saved workspace. The private test MSI is unsigned for Windows publisher identification; signed release metadata is included separately.</p><p><a href="README.md">Installation and package notes</a> · <a href="SHA256SUMS.txt">Checksums</a></p></section><section><h2>Current Shared Connection Details</h2><img src="screenshots/0.5.7-connection-details.png" alt="ROMDex 0.5.7 shared connection details"><p><small>Release verification capture. No token is shown.</small></p></section><section><h2>NPCDex Workspace Reference</h2><img src="screenshots/historical-npcdex-workspace-u08.png" alt="Historical NPCDex map and character interface"><p><small>Historical U08 capture; the interface has since received header and synchronization refinements.</small></p></section></main></html>`;
await put('START-HERE.html',html);

const all=await walk(stage),secretFindings=[];
for(const file of all){const rel=posix(path.relative(stage,file));if(denied.test(rel))throw Error('Private path entered review bundle');if(['.md','.json','.mjs','.html','.txt','.pem'].includes(path.extname(file))){const text=await fs.readFile(file,'utf8');for(const [label,re]of [['GitHub credential',/\b(?:github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,})/g],['YouTrack credential',/\bperm:[A-Za-z0-9._=-]{24,}/g],['Private key',/-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/g]])if(re.test(text))secretFindings.push({file:rel,type:label});}}
if(secretFindings.length)throw Error('Potential credential/private-key material in review docs: '+JSON.stringify(secretFindings));
const entries=[];for(const file of all.sort())entries.push({path:posix(path.relative(stage,file)),bytes:(await fs.stat(file)).size,sha256:await digest(file)});
const contents={package:name,version:'0.5.7',preparedOn:'2026-10-16',installerSha256:expected,releaseSignatureVerified:true,workingSavesIncluded:false,credentialsIncluded:false,privateSigningKeyIncluded:false,canonicalProjectDocuments:allProject.length,markdownDocuments:entries.filter(e=>e.path.endsWith('.md')).length,manifestExcludes:['PACKAGE-CONTENTS.json','SHA256SUMS.txt'],files:entries};
await put('PACKAGE-CONTENTS.json',JSON.stringify(contents,null,2)+'\n');
const manifestFile=path.join(stage,'PACKAGE-CONTENTS.json');
const checksumEntries=[...entries,{path:'PACKAGE-CONTENTS.json',sha256:await digest(manifestFile)}];
await put('SHA256SUMS.txt',checksumEntries.map(e=>e.sha256+'  '+e.path).join('\n')+'\n');
await fs.writeFile(path.join(cwd,'work/owner-review-build.json'),JSON.stringify({stage,zip:path.join(cwd,'outputs',name+'.zip'),installerSha256:expected,releaseSignatureVerified:true,totalFiles:(await walk(stage)).length,canonicalProjectDocuments:allProject.length,markdownDocuments:contents.markdownDocuments,secretPatternFindings:secretFindings.length,unbundledHistoricalReferences:missing.length},null,2)+'\n');
console.log(JSON.stringify({stage,totalFiles:(await walk(stage)).length,projectDocuments:allProject.length,markdownDocuments:contents.markdownDocuments,unbundledHistoricalReferences:missing.length,installerSha256:expected,signatureVerified:true}));
