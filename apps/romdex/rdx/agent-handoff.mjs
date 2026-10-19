import {canonical,sha,seal,verifyDigest,same,parseJSON} from '../content/contracts.mjs';
import {mapDomain} from './map-import.mjs';
import {documentRevision,validateDocument} from './document.mjs';
import {validateShape} from './schema.mjs';
import {validateMapPackage} from './map-package.mjs';
import {ensure,LIMITS} from './limits.mjs';

const hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
export const authorizationKey=entry=>sha(canonical({task:{instanceOrigin:entry.binding.task.instanceOrigin,projectId:entry.binding.task.projectId,issueId:entry.binding.task.issueId},dataset:entry.datasetId,map:entry.mapRecordId,packageId:entry.packageId}));
export function validateAuthorizationHistory(value){
 ensure(value?.format==='RDXAgentAuthorizationHistory/1'&&Array.isArray(value.events)&&value.events.length>0&&value.events.length<=1000,'INVALID','Invalid Agent Authorization History.');
 ensure(Object.keys(value).sort().join(',')==='events,format','INVALID','Unknown Authorization History Fields.');let parent=null;
 for(const e of value.events){
  verifyDigest(e);ensure(e.format==='RDXAgentAuthorization/1'&&['authorize','withdraw'].includes(e.action)&&e.parent===parent&&hash(e.lineage)&&hash(e.entryHash)&&hash(e.contextHash)&&typeof e.id==='string'&&e.id.length<=100&&typeof e.actor?.id==='string'&&/^\d+-\d+$/.test(e.actor.id)&&typeof e.actor.login==='string'&&e.actor.login.length<=100,'INVALID','Invalid Agent Authorization Event.');
  validateShape(e.binding,'binding');ensure(e.binding.dispatch==='none'&&typeof e.createdAt==='string'&&Number.isFinite(Date.parse(e.createdAt))&&Number.isSafeInteger(e.contextBytes)&&e.contextBytes>0&&e.contextBytes<=LIMITS.json&&typeof e.contextAttachmentId==='string'&&e.contextAttachmentId.length<=100,'INVALID','Invalid Authorization Binding.');
  ensure(Object.keys(e).sort().join(',')==='action,actor,binding,contextAttachmentId,contextBytes,contextHash,createdAt,digest,entryHash,format,id,lineage,observedAttachments,parent','INVALID','Unknown Authorization Event Fields.');ensure(Array.isArray(e.observedAttachments)&&e.observedAttachments.length<=10000&&new Set(e.observedAttachments).size===e.observedAttachments.length&&e.observedAttachments.every(id=>typeof id==='string'&&/^[-\w]{1,100}$/.test(id)),'INVALID','Invalid Authorization Attachment Baseline.');parent=e.digest;
 }return value;
}
export function authorizationState(entry,histories={}){
 if(!entry.binding||!entry.datasetId||!entry.mapRecordId)return {state:'not-authorized',event:null};
 const history=histories[authorizationKey(entry)];if(!history)return {state:'not-authorized',event:null};validateAuthorizationHistory(history);
 const last=history.events.at(-1),own=history.events.filter(e=>e.binding.package.packageId===entry.packageId&&e.binding.package.version===entry.version&&e.binding.package.sha256===entry.packageHash),event=own.at(-1)||null;
 if(!event)return {state:'not-authorized',event:null};
 const state=last.digest!==event.digest?'superseded':event.action==='withdraw'?'withdrawn':event.entryHash!==entry.fingerprint||!same(event.binding,entry.binding)||event.contextHash!==entry.contextHash?'needs-review':'authorized';
 return {state,event};
}
export const authorizationToken=(entry,histories={})=>sha(canonical({fingerprint:entry.fingerprint,binding:entry.binding,contextHash:entry.contextHash,history:histories[authorizationKey(entry)]||null}));

// Only immutable content ancestry/mappings cross this boundary. Proposal, review,
// presentation and old whole-document blobs never become an implicit baseline.
export function buildReturnContext(value,pkg,binding){
 validateMapPackage(pkg);validateShape(binding,'binding');
 ensure(same(binding.package,{packageId:pkg.packageId,version:pkg.version,sha256:binding.package.sha256}),'INVALID','Return Context Package Binding Differs.');
 const d=value.document,domain=mapDomain(value),all=new Map(domain.revisions.map(r=>[r.recordId+':'+r.revisionId,r])),kept=new Map(),pending=[...domain.records];
 while(pending.length){const r=pending.pop(),key=r.recordId+':'+r.revisionId;if(kept.has(key))continue;ensure(kept.size<10000,'LIMIT','Required Record Ancestry Exceeds the Return Context Bound.');kept.set(key,r);for(const parent of r.parents){const old=all.get(r.recordId+':'+parent);ensure(old,'INTEGRITY','Required Return Record Ancestry Is Missing.');pending.push(old);}}
 const records=[...kept.values()].sort((a,b)=>a.recordId.localeCompare(b.recordId)||a.revisionId.localeCompare(b.revisionId)),refs=new Set(records.flatMap(r=>r.mappingRefs)),mappings=domain.mappings.filter(m=>refs.has(m.digest));
 const assets=pkg.assets.map(a=>{const original=d.assetInventory.find(x=>x.assetId===a.assetId);ensure(original&&original.purpose!=='history'&&original.sha256===a.sha256&&original.bytes===a.bytes&&original.mime===a.mime,'INTEGRITY','Return Context Asset Differs.');return original;});
 const document={format:d.format,documentId:d.documentId,datasetId:d.datasetId,namespace:d.namespace,kind:d.kind,schemaVersion:d.schemaVersion,createdAt:d.createdAt,capabilities:structuredClone(d.capabilities),parents:[d.revision],origin:{role:'extractor',generator:'ROMDex Return Context/1',synthetic:d.origin.synthetic},extensions:{},assetInventory:assets,scope:{...d.scope,mode:'partial',completeForParentIds:[],archivalRequests:undefined},content:{records,recordHeads:structuredClone(d.content.recordHeads),mappings,plans:[],reviews:[],views:[],history:[],archivalRequests:[]},result:null};
 delete document.scope.archivalRequests;document.revision=documentRevision(document);
 const blobs=new Map(assets.map(a=>[a.sha256,value.blobs.get(a.sha256)]));validateDocument(Buffer.from(canonical(document)),{blobs});
 const context=seal({format:'RDXReturnContext/1',binding:structuredClone(binding),baseDocument:structuredClone(pkg.baseDocument),document,assets:structuredClone(pkg.assets)}),bytes=Buffer.from(JSON.stringify(context,null,2)+'\n');
 ensure(bytes.length<=LIMITS.json,'LIMIT','Required Return Context Exceeds 16 MiB. No Ancestry Was Dropped.');return {context,bytes,sha256:sha(bytes),blobs};
}
export function validateReturnContext(bytes,pkg,binding){
 ensure(Buffer.isBuffer(bytes)&&bytes.length<=LIMITS.json,'LIMIT','Return Context Exceeds Its Bound.');const c=parseJSON(bytes);verifyDigest(c);
 ensure(c.format==='RDXReturnContext/1'&&Object.keys(c).sort().join(',')==='assets,baseDocument,binding,digest,document,format'&&same(c.binding,binding)&&same(c.baseDocument,pkg.baseDocument)&&same(c.assets,pkg.assets),'INTEGRITY','Return Context Binding Differs.');
 ensure(pkg.assets.every(a=>same(a.location,{...binding.task,attachmentId:a.location.attachmentId})),'AUTH','A Return Context Asset Is Bound to Another Task.');
 const d=c.document;ensure(d.datasetId===pkg.datasetId&&d.documentId===pkg.baseDocument.documentId&&d.scope.mapRecordId===pkg.mapRecordId&&d.parents.includes(pkg.baseDocument.revision)&&d.content.plans.length===0&&d.content.reviews.length===0&&d.content.views.length===0&&d.content.history.length===0&&same(d.content.recordHeads,[...pkg.contextRecords].map(r=>({recordId:r.recordId,revisionId:r.revisionId})))&&pkg.contextRecords.every(r=>d.content.records.some(a=>same(a,r))),'INTEGRITY','Return Context Contains Different Current Content or Private Planning Data.');
 return c;
}
export function handoffText(entry,event){
 ensure(event?.action==='authorize'&&event.contextHash===entry.contextHash&&same(event.binding,entry.binding),'AUTH','This Package Is Not Authorized for Handoff.');
 const task=entry.binding.task,q=value=>JSON.stringify(value),files=entry.uploads.map(f=>({attachmentId:f.receipt?.id,name:f.name,sha256:f.hash,bytes:f.bytes}));
 return ['Work on '+task.instanceOrigin+'/issue/'+entry.issueId+'.',
  'Authorized package: '+q(entry.packageId)+' version '+entry.version+'; exact JSON SHA-256 '+entry.packageHash+'.',
  'Authorization: '+event.digest+'. Read the attached JSON Map Package, RDXTaskBinding/1 and RDXReturnContext/1; verify all hashes and required assets.',
  'Task attachment inventory: '+JSON.stringify(files),
  'Save this fixed handoff manifest as handoff.json for the file-transfer helper: '+JSON.stringify(handoffManifest(entry,event)),
  'Implement only the selected non-FINAL requests and dependency groups. FINAL decisions, flags and notes are context only. Context-only groups authorize no ROM changes.',
  'Use the deterministic rdx/agent-cli.mjs to fetch verified files, materialize the return baseline and upload the result using your securely configured YouTrack connection. Never paste a token into chat.',
  'Preserve stable identities. Return one map .rdx to this same task with origin.role agent-result, the exact original task binding/base, before/after source evidence and complete per-group outcomes. Set requiresHumanTesting true.',
  'Announce Ready for Human Review and Testing with implemented/unresolved groups and source/build checks. Leave the task open. Do not write NPCD directly.',
  'If a required file, source build or mapping cannot be verified, report the blocker before changing the ROM. Superseded or withdrawn packages are held for review.'].join('\n');
}
export function handoffManifest(entry,event){
 ensure(event?.action==='authorize'&&same(event.binding,entry.binding)&&event.contextHash===entry.contextHash,'AUTH','This Package Has No Matching Authorization.');
 const packet=entry.uploads.find(f=>f.role==='package');ensure(packet?.verified,'NOT_READY','Verified Package Bytes Are Missing.');
 return seal({format:'RDXAgentHandoff/1',authorization:event.digest,account:structuredClone(event.actor),binding:structuredClone(entry.binding),packageBytes:packet.bytes,context:{attachmentId:event.contextAttachmentId,sha256:event.contextHash,bytes:event.contextBytes}});
}
export function validateHandoffManifest(manifest){
 verifyDigest(manifest);validateShape(manifest.binding,'binding');
 ensure(manifest.format==='RDXAgentHandoff/1'&&Object.keys(manifest).sort().join(',')==='account,authorization,binding,context,digest,format,packageBytes'&&hash(manifest.authorization)&&/^\d+-\d+$/.test(manifest.account?.id||'')&&typeof manifest.account.login==='string'&&manifest.account.login.length<=100&&Number.isSafeInteger(manifest.packageBytes)&&manifest.packageBytes>0&&manifest.packageBytes<=LIMITS.json&&hash(manifest.context?.sha256)&&Number.isSafeInteger(manifest.context.bytes)&&manifest.context.bytes>0&&manifest.context.bytes<=LIMITS.json&&typeof manifest.context.attachmentId==='string'&&/^[-\w]{1,100}$/.test(manifest.context.attachmentId),'INVALID','Invalid Agent Handoff Manifest.');return manifest;
}
